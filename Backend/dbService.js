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
  client_id: mongoose.Schema.Types.ObjectId,
  price: Number,
  time_window_start: Date,
  time_window_end: Date,
  note: String,
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'RENEGOTIATING'], default: 'PENDING' },
  client_note: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const ServiceOrderSchema = new mongoose.Schema({
  request_id: mongoose.Schema.Types.ObjectId,
  client_id: mongoose.Schema.Types.ObjectId,
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
  // CREATE QUOTE - see new implementation in admin section below
  // Old implementation removed - using admin version that includes updateRequestStatus

  // ============================
  // ACCEPT QUOTE → CREATE ORDER
  // Old methods removed - newer implementations below handle proper workflows

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

  // Get all service requests
  async getAllServiceRequests() {
    try {
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      const Client = mongoose.model('Client', ClientSchema, 'clients');
      
      const requests = await ServiceRequest.find().lean();
      
      // Enrich with client names
      const enriched = [];
      for (const req of requests) {
        const client = await Client.findById(req.client_id).lean();
        enriched.push({
          ...req,
          client_name: client?.first_name || 'Unknown'
        });
      }
      
      return enriched;
    } catch (err) {
      console.log('[CHECKPOINT] getAllServiceRequests error:', err.message);
      return [];
    }
  }

  // Get all quotes
  async getAllQuotes() {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const quotes = await Quote.find().lean();
      return quotes;
    } catch (err) {
      console.log('[CHECKPOINT] getAllQuotes error:', err.message);
      return [];
    }
  }

  // Get all orders
  async getAllOrders() {
    try {
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');
      const orders = await ServiceOrder.find().lean();
      return orders;
    } catch (err) {
      console.log('[CHECKPOINT] getAllOrders error:', err.message);
      return [];
    }
  }

  // Get all bills
  async getAllBills() {
    try {
      const Bill = mongoose.model('Bill', BillSchema, 'bills');
      const bills = await Bill.find().lean();
      return bills;
    } catch (err) {
      console.log('[CHECKPOINT] getAllBills error:', err.message);
      return [];
    }
  }

  // Get client's own requests
  async getClientRequests(clientId) {
    try {
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      
      // Build query that matches both string and ObjectId formats
      let requests = [];
      
      // Try multiple query approaches
      if (mongoose.Types.ObjectId.isValid(clientId)) {
        const objId = new mongoose.Types.ObjectId(clientId);
        requests = await ServiceRequest.find({ client_id: objId }).lean();
      }
      
      // If no results, try as direct string/value
      if (requests.length === 0) {
        requests = await ServiceRequest.find({ client_id: clientId }).lean();
      }
      
      // Try partial match on toString version
      if (requests.length === 0) {
        const allRequests = await ServiceRequest.find({}).lean();
        requests = allRequests.filter(r => String(r.client_id) === String(clientId));
      }
      
      console.log(`[CHECKPOINT] getClientRequests(${clientId}): found ${requests.length} requests`);
      return requests || [];
    } catch (err) {
      console.log('[CHECKPOINT] getClientRequests error:', err.message);
      return [];
    }
  }

  // Get client's own quotes
  async getClientQuotes(clientId) {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      
      // Get all service requests for this client - try multiple formats
      let clientRequests = [];
      
      if (mongoose.Types.ObjectId.isValid(clientId)) {
        const objId = new mongoose.Types.ObjectId(clientId);
        clientRequests = await ServiceRequest.find({ client_id: objId }).lean();
      }
      
      if (clientRequests.length === 0) {
        clientRequests = await ServiceRequest.find({ client_id: clientId }).lean();
      }
      
      if (clientRequests.length === 0) {
        const allRequests = await ServiceRequest.find({}).lean();
        clientRequests = allRequests.filter(r => String(r.client_id) === String(clientId));
      }
      
      const requestIds = clientRequests.map(r => r._id);
      
      // Get quotes for those requests
      const quotes = await Quote.find({ request_id: { $in: requestIds } }).lean();
      console.log(`[CHECKPOINT] getClientQuotes(${clientId}): found ${clientRequests.length} requests and ${quotes.length} quotes`);
      return quotes || [];
    } catch (err) {
      console.log('[CHECKPOINT] getClientQuotes error:', err.message);
      return [];
    }
  }

  // Update quote with renegotiation note
  async renegotiateQuote(quoteId, note) {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const quote = await Quote.findByIdAndUpdate(
        quoteId,
        { 
          client_note: note,
          status: 'RENEGOTIATING',
          updated_at: new Date()
        },
        { new: true }
      );
      console.log(`[CHECKPOINT] renegotiateQuote(${quoteId}): updated`);
      return quote;
    } catch (err) {
      console.log('[CHECKPOINT] renegotiateQuote error:', err.message);
      return null;
    }
  }

  // Accept a quote
  async acceptQuote(quoteId) {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');
      
      const quote = await Quote.findById(quoteId);
      if (!quote) return null;

      // Create service order
      const order = await ServiceOrder.create({
        request_id: quote.request_id,
        client_id: quote.client_id,
        status: 'ACCEPTED',
        created_at: new Date()
      });

      // Update quote status
      await Quote.findByIdAndUpdate(
        quoteId,
        { 
          status: 'ACCEPTED',
          updated_at: new Date()
        }
      );

      console.log(`[CHECKPOINT] acceptQuote(${quoteId}): created order ${order._id}`);
      return quote;
    } catch (err) {
      console.log('[CHECKPOINT] acceptQuote error:', err.message);
      return null;
    }
  }

  // Reject a quote
  async rejectQuote(quoteId) {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const quote = await Quote.findByIdAndUpdate(
        quoteId,
        { 
          status: 'REJECTED',
          updated_at: new Date()
        },
        { new: true }
      );
      console.log(`[CHECKPOINT] rejectQuote(${quoteId}): rejected`);
      return quote;
    } catch (err) {
      console.log('[CHECKPOINT] rejectQuote error:', err.message);
      return null;
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

  // Create quote
  async createQuote(requestId, price, timeline, note) {
    try {
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      
      // Get the request to find client_id
      const request = await ServiceRequest.findById(requestId).lean();
      if (!request) return { success: false, error: 'Request not found' };

      const quote = await Quote.create({
        request_id: new mongoose.Types.ObjectId(requestId),
        client_id: request.client_id,
        price,
        timeline,
        note,
        status: 'PENDING'
      });
      console.log('[CHECKPOINT] Quote created:', quote._id);
      return { success: true, quote_id: quote._id };
    } catch (err) {
      console.log('[CHECKPOINT] createQuote error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Update request status
  async updateRequestStatus(requestId, status) {
    try {
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      await ServiceRequest.findByIdAndUpdate(requestId, { status });
      console.log('[CHECKPOINT] Request status updated:', status);
      return { success: true };
    } catch (err) {
      console.log('[CHECKPOINT] updateRequestStatus error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Create bill
  async createBill(orderId, amount, note) {
    try {
      const Bill = mongoose.model('Bill', BillSchema, 'bills');
      const bill = await Bill.create({
        order_id: new mongoose.Types.ObjectId(orderId),
        amount,
        note,
        status: 'unpaid',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      console.log('[CHECKPOINT] Bill created:', bill._id);
      return { success: true, bill_id: bill._id };
    } catch (err) {
      console.log('[CHECKPOINT] createBill error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Get comprehensive analytics
  async getAnalytics() {
    try {
      const Client = mongoose.model('Client', ClientSchema, 'clients');
      const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
      const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');
      const ServiceOrder = mongoose.model('ServiceOrder', ServiceOrderSchema, 'service_orders');
      const Bill = mongoose.model('Bill', BillSchema, 'bills');

      const analytics = {};

      // 1. Frequent clients - most completed orders
      const frequentRaw = await ServiceOrder.aggregate([
        { $group: { _id: '$client_id', order_count: { $sum: 1 } } },
        { $sort: { order_count: -1 } },
        { $limit: 5 }
      ]);
      
      analytics.frequent_clients = [];
      for (const item of frequentRaw) {
        const client = await Client.findById(item._id).lean();
        analytics.frequent_clients.push({
          name: client?.first_name || 'Unknown',
          order_count: item.order_count
        });
      }

      // 2. Uncommitted clients - 3+ requests but no orders
      const allClients = await Client.find().lean();
      const clientIds = allClients.map(c => c._id);
      
      analytics.uncommitted_clients = [];
      for (const clientId of clientIds) {
        const requestCount = await ServiceRequest.countDocuments({ client_id: clientId });
        const orderCount = await ServiceOrder.countDocuments({ client_id: clientId });
        if (requestCount >= 3 && orderCount === 0) {
          const client = await Client.findById(clientId).lean();
          analytics.uncommitted_clients.push({
            name: client?.first_name || 'Unknown',
            request_count: requestCount
          });
        }
      }

      // 3. This month's accepted quotes
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      analytics.monthly_quotes = await Quote.find({
        status: 'ACCEPTED',
        created_at: { $gte: monthStart }
      }).lean();

      // 4. Prospective clients - registered but no requests
      analytics.prospective_clients = [];
      for (const client of allClients) {
        const requestCount = await ServiceRequest.countDocuments({ client_id: client._id });
        if (requestCount === 0) {
          analytics.prospective_clients.push({
            name: client.first_name || 'Unknown',
            created_at: client.created_at
          });
        }
      }

      // 5. Largest jobs - most rooms completed
      analytics.largest_jobs = await ServiceRequest.find()
        .sort({ num_rooms: -1 })
        .limit(5)
        .lean();

      // 6. Overdue bills - unpaid older than 1 week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      analytics.overdue_bills = await Bill.find({
        status: 'unpaid',
        due_date: { $lt: oneWeekAgo }
      }).lean();

      // 7. Bad clients - never paid overdue bills
      const billsByClient = {};
      const unpaidBills = await Bill.find({ status: 'unpaid', due_date: { $lt: oneWeekAgo } }).lean();
      for (const bill of unpaidBills) {
        const order = await ServiceOrder.findById(bill.order_id).lean();
        if (order) {
          const clientId = String(order.client_id);
          billsByClient[clientId] = (billsByClient[clientId] || 0) + 1;
        }
      }

      analytics.bad_clients = [];
      for (const [clientId, overdueCount] of Object.entries(billsByClient)) {
        if (overdueCount > 0) {
          const client = await Client.findById(clientId).lean();
          analytics.bad_clients.push({
            name: client?.first_name || 'Unknown',
            overdue_count: overdueCount
          });
        }
      }

      // 8. Good clients - paid within 24 hours
      const onTimeBills = await Bill.find({ status: 'paid' }).lean();
      const goodClientMap = {};
      for (const bill of onTimeBills) {
        if (bill.paid_at && bill.created_at) {
          const paidTime = new Date(bill.paid_at).getTime();
          const createdTime = new Date(bill.created_at).getTime();
          const hours = (paidTime - createdTime) / (1000 * 60 * 60);
          if (hours <= 24) {
            const order = await ServiceOrder.findById(bill.order_id).lean();
            if (order) {
              const clientId = String(order.client_id);
              goodClientMap[clientId] = (goodClientMap[clientId] || 0) + 1;
            }
          }
        }
      }

      analytics.good_clients = [];
      for (const [clientId, count] of Object.entries(goodClientMap)) {
        const client = await Client.findById(clientId).lean();
        analytics.good_clients.push({
          name: client?.first_name || 'Unknown',
          on_time_count: count
        });
      }

      console.log('[CHECKPOINT] Analytics retrieved');
      return analytics;
    } catch (err) {
      console.log('[CHECKPOINT] getAnalytics error:', err.message);
      return {};
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
