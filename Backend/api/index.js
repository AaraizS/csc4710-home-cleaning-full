// Minor: add small comment for CI trigger
// Backend API - Updated for Vercel deployment
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Normalize optional /api prefix so both /health and /api/health work
app.use((req, res, next) => {
  if (req.path === '/api' || req.path === '/api/') {
    req.url = '/';
  } else if (req.path.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Simple health checks (no DB required)
app.get('/', (req, res) => {
  console.log('[CHECKPOINT] GET / - Root endpoint hit');
  res.json({ message: 'Home Cleaning System Backend Running', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  console.log('[CHECKPOINT] GET /health - Health check hit');
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/ready', (req, res) => {
  console.log('[CHECKPOINT] GET /ready - Ready check hit');
  res.json({ ready: true, message: 'Server is operational' });
});

app.get('/health/live', (req, res) => {
  console.log('[CHECKPOINT] GET /health/live - Live check hit');
  res.json({ alive: true, timestamp: new Date().toISOString() });
});

// Lazy-load DB service
let DbService;
let db;

async function getDbService() {
  console.log('[CHECKPOINT] getDbService() called');
  if (!db) {
    console.log('[CHECKPOINT] DB not initialized - initializing now');
    try {
      console.log('[CHECKPOINT] Requiring dbService module');
      DbService = require('../dbService');
      console.log('[CHECKPOINT] DbService module loaded');
      db = DbService.getDbServiceInstance();
      console.log('[CHECKPOINT] DB instance created');
      if (process.env.MONGO_URI) {
        console.log('[CHECKPOINT] MONGO_URI found (length:', process.env.MONGO_URI.length, ') - attempting connection');
        try {
          await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
          console.log('[CHECKPOINT] MongoDB connected successfully');
        } catch (err) {
          console.log('[CHECKPOINT] MongoDB Connection Error:', err.message);
        }
      } else {
        console.log('[CHECKPOINT] MONGO_URI not set - skipping MongoDB');
        console.log('[CHECKPOINT] Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('mongo')));
      }
    } catch (err) {
      console.error('[CHECKPOINT] Failed to initialize DB service:', err.message);
      throw err;
    }
  } else {
    console.log('[CHECKPOINT] DB already initialized - returning cached instance');
  }
  return db;
}

app.get('/health/detailed', async (req, res) => {
  console.log('[CHECKPOINT] GET /health/detailed - Starting detailed health check');
  const checks = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: { connected: false }
  };

  try {
    console.log('[CHECKPOINT] /health/detailed - Attempting getDbService()');
    const dbService = await getDbService();
    console.log('[CHECKPOINT] /health/detailed - getDbService() success');
    checks.mongodb.connected = await dbService.isDbReady();
    console.log('[CHECKPOINT] /health/detailed - isDbReady() returned:', checks.mongodb.connected);
  } catch (err) {
    console.log('[CHECKPOINT] /health/detailed - Error:', err.message);
    checks.mongodb.error = err.message;
  }

  res.json({
    status: checks.mongodb.connected ? 'ok' : 'degraded',
    checks
  });
});

app.get('/health/startup', async (req, res) => {
  console.log('[CHECKPOINT] GET /health/startup - Starting startup check');
  try {
    console.log('[CHECKPOINT] /health/startup - Attempting getDbService()');
    const dbService = await getDbService();
    console.log('[CHECKPOINT] /health/startup - getDbService() success');
    const dbReady = await dbService.isDbReady();
    console.log('[CHECKPOINT] /health/startup - isDbReady() returned:', dbReady);
    if (dbReady) {
      return res.json({ startup: 'ready', message: 'Backend is fully operational' });
    }
    return res.status(503).json({ startup: 'not-ready', message: 'Database not ready' });
  } catch (err) {
    console.log('[CHECKPOINT] /health/startup - Error:', err.message);
    return res.status(503).json({ startup: 'error', error: err.message });
  }
});

// All other routes require DB service
app.post('/auth/login', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { username, password } = req.body;
    const result = await dbService.loginUser(username, password);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/clients/register', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { first_name, last_name, address, phone, email, cc_last4, cc_token, password } = req.body;
    const result = await dbService.registerClient(first_name, last_name, address, phone, email, cc_last4, cc_token, password);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/requests/new', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { client_id, service_address, cleaning_type, num_rooms, preferred_datetime, proposed_budget, notes } = req.body;
    const result = await dbService.createServiceRequest(client_id, service_address, cleaning_type, num_rooms, preferred_datetime || null, proposed_budget || null, notes || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/requests/add-photo', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { request_id, photo_url } = req.body;
    const result = await dbService.addPhoto(request_id, photo_url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/quotes/create', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { request_id, price, time_window_start, time_window_end, note } = req.body;
    const result = await dbService.createQuote(request_id, price, time_window_start, time_window_end, note);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/quotes/accept', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { quote_id } = req.body;
    const result = await dbService.acceptQuote(quote_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/orders/complete', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { order_id } = req.body;
    const result = await dbService.completeOrder(order_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/bills/create', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { order_id, amount } = req.body;
    const result = await dbService.createBill(order_id, amount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/bills/pay', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { bill_id, client_id, amount } = req.body;
    const result = await dbService.payBill(bill_id, client_id, amount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/bills/dispute', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { bill_id, note } = req.body;
    const result = await dbService.disputeBill(bill_id, note);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/dashboard/frequent-clients', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.frequentClients());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/uncommitted-clients', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.uncommittedClients());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/accepted-quotes', async (req, res) => {
  try {
    const dbService = await getDbService();
    const { year, month } = req.query;
    res.json(await dbService.acceptedQuotes(year, month));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/prospective-clients', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.prospectiveClients());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/largest-job', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.largestJob());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/overdue-bills', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.overdueBills());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/bad-clients', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.badClients());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/good-clients', async (req, res) => {
  try {
    const dbService = await getDbService();
    res.json(await dbService.goodClients());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connection.collection('test').insertOne({ ping: true, time: new Date() });
    res.json({ success: true, message: 'MongoDB is connected!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/test-add-user', async (req, res) => {
  try {
    const User = mongoose.model('testUsers', new mongoose.Schema({ name: String }));
    const doc = await User.create({ name: 'Hello MongoDB' });
    res.json({ success: true, inserted: doc });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/admin/enable-claude-haiku', async (req, res) => {
  try {
    const dbService = await getDbService();
    const result = await dbService.enableClaudeHaikuForAllClients();
    if (result && result.success) res.json({ success: true, message: 'Claude Haiku enabled for all clients' });
    else res.status(500).json({ success: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/t1', async (req, res) => {
  try {
    console.log('[CHECKPOINT] /t1 POST - Ensuring DB connection');
    const dbService = await getDbService();
    console.log('[CHECKPOINT] /t1 POST - DB service ready');
    
    const payload = req.body;
    payload.created_at = new Date();
    
    console.log('[CHECKPOINT] /t1 POST - Creating model and inserting:', JSON.stringify(payload, null, 2));
    // Use modelNames to check if model already exists, if not create it
    const modelExists = mongoose.modelNames().includes('t1');
    const T1 = modelExists 
      ? mongoose.model('t1')
      : mongoose.model('t1', new mongoose.Schema({}, { strict: false }));
    const doc = await T1.create(payload);
    
    console.log('[CHECKPOINT] /t1 POST - Insert successful, ID:', doc._id);
    res.json({ success: true, inserted: doc });
  } catch (err) {
    console.log('[CHECKPOINT] /t1 POST - Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// SEED ENDPOINT: Create admin account
app.post('/seed/create-admin', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const Client = mongoose.model('Client', require('../dbService').ClientSchema, 'clients');
    const UserAccount = mongoose.model('UserAccount', require('../dbService').UserAccountSchema, 'user_accounts');

    // Create client record for Anna
    const client = await Client.create({
      first_name: name?.split(' ')[0] || 'Anna',
      last_name: name?.split(' ')[1] || 'Johnson',
      email: email,
      phone: '',
      address: 'Admin',
      cc_last4: '0000'
    });

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account with ADMIN role
    const userAccount = await UserAccount.create({
      username: email,
      password: hashedPassword,
      client_id: client._id,
      role: 'ADMIN'
    });

    res.json({
      success: true,
      message: 'Admin account created',
      client_id: client._id,
      user_account_id: userAccount._id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADMIN: Get all service requests
app.get('/requests/all', async (req, res) => {
  try {
    const dbService = await getDbService();
    const requests = await dbService.getAllServiceRequests?.() || [];
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADMIN: Get all quotes
app.get('/quotes/all', async (req, res) => {
  try {
    const dbService = await getDbService();
    const quotes = await dbService.getAllQuotes?.() || [];
    res.json({ success: true, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADMIN: Get all orders
app.get('/orders/all', async (req, res) => {
  try {
    const dbService = await getDbService();
    const orders = await dbService.getAllOrders?.() || [];
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADMIN: Get all bills
app.get('/bills/all', async (req, res) => {
  try {
    const dbService = await getDbService();
    const bills = await dbService.getAllBills?.() || [];
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLIENT: Get client's own requests
app.get('/requests/client/:clientId', async (req, res) => {
  try {
    const dbService = await getDbService();
    const requests = await dbService.getClientRequests?.(req.params.clientId) || [];
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLIENT: Get client's own quotes
app.get('/quotes/client/:clientId', async (req, res) => {
  try {
    const dbService = await getDbService();
    const quotes = await dbService.getClientQuotes?.(req.params.clientId) || [];
    res.json({ success: true, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLIENT: Renegotiate a quote
app.post('/quotes/:quoteId/renegotiate', async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, error: 'Note is required' });
    }
    
    const dbService = await getDbService();
    const quote = await dbService.renegotiateQuote?.(req.params.quoteId, note);
    
    if (quote) {
      res.json({ success: true, data: quote, message: 'Renegotiation submitted to Anna' });
    } else {
      res.status(404).json({ success: false, error: 'Quote not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLIENT: Accept a quote
app.post('/quotes/:quoteId/accept', async (req, res) => {
  try {
    const dbService = await getDbService();
    const quote = await dbService.acceptQuote?.(req.params.quoteId);
    
    if (quote) {
      res.json({ success: true, data: quote, message: 'Quote accepted' });
    } else {
      res.status(404).json({ success: false, error: 'Quote not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLIENT: Reject a quote
app.post('/quotes/:quoteId/reject', async (req, res) => {
  try {
    const dbService = await getDbService();
    const quote = await dbService.rejectQuote?.(req.params.quoteId);
    
    if (quote) {
      res.json({ success: true, data: quote, message: 'Quote rejected' });
    } else {
      res.status(404).json({ success: false, error: 'Quote not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  console.log(`[CHECKPOINT] 404 - No route matched for ${req.method} ${req.path}`);
  console.log('[CHECKPOINT] Available routes should include: GET /, /health, /ready, /health/live, /health/detailed, /health/startup');
  res.status(404).json({ error: 'Not Found', path: req.path, message: 'No matching route found' });
});

if (require.main === module) {
  const port = process.env.PORT || 5052;
  app.listen(port, () => console.log(`[CHECKPOINT] API server listening on port ${port}`));
}

console.log('[CHECKPOINT] API Module loaded - routes registered');
module.exports = app;
