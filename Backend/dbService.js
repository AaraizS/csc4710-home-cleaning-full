// =======================
// dbService.js (MONGODB VERSION)
// =======================

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
dotenv.config();

let instance = null;

console.log("[CHECKPOINT] DbService initializing with MongoDB");

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

// Define MongoDB Schemas
const ClientSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  address: String,
  phone: String,
  email: { type: String, unique: true },
  cc_last4: String,
  cc_token: String,
  claude_haiku_enabled: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const UserAccountSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['CLIENT', 'ADMIN'], default: 'CLIENT' },
  client_id: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now }
});

const ServiceRequestSchema = new mongoose.Schema({
  client_id: mongoose.Schema.Types.ObjectId,
  service_address: String,
  cleaning_type: String,
  num_rooms: Number,
  preferred_datetime: Date,
  proposed_budget: Number,
  notes: String,
  photos: [String],
  created_at: { type: Date, default: Date.now }
});

const QuoteSchema = new mongoose.Schema({
  request_id: mongoose.Schema.Types.ObjectId,
  price: Number,
  time_window_start: Date,
  time_window_end: Date,
  note: String,
  status: { type: String, enum: ['PENDING', 'ACCEPTED'], default: 'PENDING' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const ServiceOrderSchema = new mongoose.Schema({
  request_id: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ['ACCEPTED', 'COMPLETED'], default: 'ACCEPTED' },
  completed_at: Date,
  created_at: { type: Date, default: Date.now }
});

const BillSchema = new mongoose.Schema({
  order_id: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: { type: String, enum: ['UNPAID', 'PAID', 'DISPUTED'], default: 'UNPAID' },
  dispute_note: String,
  created_at: { type: Date, default: Date.now },
  paid_at: Date
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  // ============================
  // LOGIN
  // ============================
  async loginUser(username, password) {
    try {
      console.log('[CHECKPOINT] loginUser called');
      const UserAccount = mongoose.model('UserAccount', UserAccountSchema, 'user_accounts');
      const user = await UserAccount.findOne({ username });

      if (!user) return { success: false, error: 'User not found' };

      // Compare provided password with stored password (plain for now, upgrade to bcrypt later)
      const passwordMatch = user.password === password || await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return { success: false, error: 'Invalid password' };
      }

      // Generate JWT token valid for 24 hours
      const token = jwt.sign(
        { 
          userId: user._id, 
          username: user.username, 
          role: user.role, 
          client_id: user.client_id 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token,
        role: user.role,
        client_id: user.client_id,
        username: user.username
      };
    } catch (err) {
      console.log('[CHECKPOINT] loginUser error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // ============================
  // CLIENT REGISTRATION
  // ============================
  async registerClient(first, last, address, phone, email, cc_last4, cc_token, password) {
    try {
      console.log('[CHECKPOINT] registerClient called');
      const Client = mongoose.model('Client', ClientSchema, 'clients');
      const UserAccount = mongoose.model('UserAccount', UserAccountSchema, 'user_accounts');

      // Create client
      const client = await Client.create({
        first_name: first,
        last_name: last,
        address,
        phone,
        email,
        cc_last4,
        cc_token
      });

      // Create user account with hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      await UserAccount.create({
        username: email,
        password: hashedPassword,
        role: 'CLIENT',
        client_id: client._id
      });

      return { success: true, client_id: client._id };
    } catch (err) {
      console.log('[CHECKPOINT] registerClient error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // ============================
  // CREATE REQUEST
  // ============================
  async createServiceRequest(client_id, address, type, rooms, datetime, budget, notes) {
    try {
      console.log('[CHECKPOINT] createServiceRequest called');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');

      const request = await ServiceRequest.create({
        client_id: new mongoose.Types.ObjectId(client_id),
        service_address: address,
        cleaning_type: type,
        num_rooms: rooms,
        preferred_datetime: datetime,
        proposed_budget: budget,
        notes
      });

      return { success: true, request_id: request._id };
    } catch (err) {
      console.log('[CHECKPOINT] createServiceRequest error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // ADD PHOTO
  // ============================
  async addPhoto(request_id, url) {
    try {
      console.log('[CHECKPOINT] addPhoto called');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');

      const request = await ServiceRequest.findByIdAndUpdate(
        request_id,
        { $push: { photos: url } },
        { new: true }
      );

      return { success: true, photo_id: request._id };
    } catch (err) {
      console.log('[CHECKPOINT] addPhoto error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // CREATE QUOTE
  // ============================
  async createQuote(request_id, price, tstart, tend, note) {
    try {
      console.log('[CHECKPOINT] createQuote called');
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');

      const quote = await Quote.create({
        request_id: new mongoose.Types.ObjectId(request_id),
        price,
        time_window_start: tstart,
        time_window_end: tend,
        note,
        status: 'PENDING'
      });

      return { success: true, quote_id: quote._id };
    } catch (err) {
      console.log('[CHECKPOINT] createQuote error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // ACCEPT QUOTE → CREATE ORDER
  // ============================
  async acceptQuote(quote_id) {
    try {
      console.log('[CHECKPOINT] acceptQuote called');
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');

      const quote = await Quote.findById(quote_id);
      if (!quote) return { success: false };

      const order = await ServiceOrder.create({
        request_id: quote.request_id,
        status: 'ACCEPTED'
      });

      await Quote.findByIdAndUpdate(quote_id, { status: 'ACCEPTED', updated_at: new Date() });

      return { success: true, order_id: order._id };
    } catch (err) {
      console.log('[CHECKPOINT] acceptQuote error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // COMPLETE ORDER
  // ============================
  async completeOrder(order_id) {
    try {
      console.log('[CHECKPOINT] completeOrder called');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');

      await ServiceOrder.findByIdAndUpdate(order_id, {
        status: 'COMPLETED',
        completed_at: new Date()
      });

      return { success: true };
    } catch (err) {
      console.log('[CHECKPOINT] completeOrder error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // CREATE BILL
  // ============================
  async createBill(order_id, amount) {
    try {
      console.log('[CHECKPOINT] createBill called');
      const Bill = mongoose.model('Bill', BillSchema, 'bills');

      const bill = await Bill.create({
        order_id: new mongoose.Types.ObjectId(order_id),
        amount,
        status: 'UNPAID'
      });

      return { success: true, bill_id: bill._id };
    } catch (err) {
      console.log('[CHECKPOINT] createBill error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // PAY BILL
  // ============================
  async payBill(bill_id, client_id, amount) {
    try {
      console.log('[CHECKPOINT] payBill called');
      const Bill = mongoose.model('Bill', BillSchema, 'bills');

      await Bill.findByIdAndUpdate(bill_id, {
        status: 'PAID',
        paid_at: new Date()
      });

      return { success: true };
    } catch (err) {
      console.log('[CHECKPOINT] payBill error:', err.message);
      return { success: false };
    }
  }

  // ============================
  // DISPUTE BILL
  // ============================
  async disputeBill(bill_id, note) {
    try {
      console.log('[CHECKPOINT] disputeBill called');
      const Bill = mongoose.model('Bill', BillSchema, 'bills');

      await Bill.findByIdAndUpdate(bill_id, {
        status: 'DISPUTED',
        dispute_note: note
      });

      return { success: true };
    } catch (err) {
      console.log('[CHECKPOINT] disputeBill error:', err.message);
      return { success: false };
    }
  }

  // ===============================================
  // DASHBOARD QUERIES
  // ===============================================

  async frequentClients() {
    try {
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');
      const Client = mongoose.model('Client', ClientSchema, 'clients');

      const completedOrders = await ServiceOrder.aggregate([
        { $match: { status: 'COMPLETED' } },
        { $group: { _id: '$request_id', count: { $sum: 1 } } }
      ]);

      const requests = await ServiceRequest.find({
        _id: { $in: completedOrders.map(o => o._id) }
      });

      const clientIds = [...new Set(requests.map(r => r.client_id))];
      const clients = await Client.find({ _id: { $in: clientIds } });

      return clients.sort((a, b) => b.created_at - a.created_at);
    } catch (err) {
      console.log('[CHECKPOINT] frequentClients error:', err.message);
      return [];
    }
  }

  async uncommittedClients() {
    try {
      const Client = mongoose.model('Client', ClientSchema, 'clients');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');

      const clients = await Client.find();
      const result = [];

      for (const client of clients) {
        const requests = await ServiceRequest.countDocuments({ client_id: client._id });
        if (requests >= 3) result.push(client);
      }

      return result;
    } catch (err) {
      console.log('[CHECKPOINT] uncommittedClients error:', err.message);
      return [];
    }
  }

  async acceptedQuotes(year, month) {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');

      return await Quote.find({
        status: 'ACCEPTED',
        updated_at: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1)
        }
      });
    } catch (err) {
      console.log('[CHECKPOINT] acceptedQuotes error:', err.message);
      return [];
    }
  }

  async prospectiveClients() {
    try {
      const Client = mongoose.model('Client', ClientSchema, 'clients');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');

      const clientsWithRequests = await ServiceRequest.distinct('client_id');
      return await Client.find({ _id: { $nin: clientsWithRequests } });
    } catch (err) {
      console.log('[CHECKPOINT] prospectiveClients error:', err.message);
      return [];
    }
  }

  async largestJob() {
    try {
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');

      const completedOrders = await ServiceOrder.find({ status: 'COMPLETED' });
      const requestIds = completedOrders.map(o => o.request_id);

      return await ServiceRequest.findOne({
        _id: { $in: requestIds }
      }).sort({ num_rooms: -1 });
    } catch (err) {
      console.log('[CHECKPOINT] largestJob error:', err.message);
      return null;
    }
  }

  async overdueBills() {
    try {
      const Bill = mongoose.model('Bill', BillSchema, 'bills');
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      return await Bill.find({
        status: 'UNPAID',
        created_at: { $lt: sevenDaysAgo }
      });
    } catch (err) {
      console.log('[CHECKPOINT] overdueBills error:', err.message);
      return [];
    }
  }

  async badClients() {
    try {
      const Bill = mongoose.model('Bill', BillSchema, 'bills');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      const Client = mongoose.model('Client', ClientSchema, 'clients');

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const unpaidBills = await Bill.find({
        status: 'UNPAID',
        created_at: { $lt: sevenDaysAgo }
      });

      const orderIds = unpaidBills.map(b => b.order_id);
      const orders = await ServiceOrder.find({ _id: { $in: orderIds } });
      const requestIds = orders.map(o => o.request_id);
      const requests = await ServiceRequest.find({ _id: { $in: requestIds } });
      const clientIds = requests.map(r => r.client_id);

      return await Client.find({ _id: { $in: clientIds } });
    } catch (err) {
      console.log('[CHECKPOINT] badClients error:', err.message);
      return [];
    }
  }

  async goodClients() {
    try {
      const Bill = mongoose.model('Bill', BillSchema, 'bills');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      const Client = mongoose.model('Client', ClientSchema, 'clients');

      const paidBills = await Bill.find({
        status: 'PAID',
        paid_at: { $exists: true }
      });

      const fastPayBills = paidBills.filter(bill => {
        if (!bill.paid_at) return false;
        const hoursToPayment = (bill.paid_at - bill.created_at) / (1000 * 60 * 60);
        return hoursToPayment <= 24;
      });

      const orderIds = fastPayBills.map(b => b.order_id);
      const orders = await ServiceOrder.find({ _id: { $in: orderIds } });
      const requestIds = orders.map(o => o.request_id);
      const requests = await ServiceRequest.find({ _id: { $in: requestIds } });
      const clientIds = requests.map(r => r.client_id);

      return await Client.find({ _id: { $in: clientIds } });
    } catch (err) {
      console.log('[CHECKPOINT] goodClients error:', err.message);
      return [];
    }
  }

  // ============================
  // FEATURE FLAGS / ADMIN
  // ============================
  async enableClaudeHaikuForAllClients() {
    try {
      console.log('[CHECKPOINT] enableClaudeHaikuForAllClients called');
      const Client = mongoose.model('Client', ClientSchema, 'clients');

      await Client.updateMany({}, { claude_haiku_enabled: true });

      return { success: true };
    } catch (err) {
      console.log('[CHECKPOINT] enableClaudeHaikuForAllClients error:', err.message);
      return { success: false };
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, decoded };
    } catch (err) {
      console.log('[CHECKPOINT] verifyToken error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async isDbReady() {
    try {
      const state = mongoose.connection.readyState;
      // States: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      return state === 1;
    } catch (err) {
      console.log('[CHECKPOINT] isDbReady check failed:', err.message);
      return false;
    }
  }
}

DbService.ClientSchema = ClientSchema;
DbService.UserAccountSchema = UserAccountSchema;
DbService.ServiceRequestSchema = ServiceRequestSchema;
DbService.QuoteSchema = QuoteSchema;
DbService.ServiceOrderSchema = ServiceOrderSchema;
DbService.BillSchema = BillSchema;

module.exports = DbService;
