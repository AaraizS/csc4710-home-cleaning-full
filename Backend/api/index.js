const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DbService = require('../dbService');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

const db = DbService.getDbServiceInstance();

app.get('/', (req, res) => {
  res.json({ message: 'Home Cleaning System Backend Running' });
});

// ===========================
// LOGIN
// ===========================
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await db.loginUser(username, password);
  res.json(result);
});

// ===========================
// REGISTER CLIENT
// ===========================
app.post('/clients/register', async (req, res) => {
  const {
    first_name,
    last_name,
    address,
    phone,
    email,
    cc_last4,
    cc_token,
    password
  } = req.body;

  const result = await db.registerClient(
    first_name,
    last_name,
    address,
    phone,
    email,
    cc_last4,
    cc_token,
    password
  );

  res.json(result);
});

// ===========================
// CREATE REQUEST
// ===========================
app.post('/requests/new', async (req, res) => {
  const {
    client_id,
    service_address,
    cleaning_type,
    num_rooms,
    preferred_datetime,
    proposed_budget,
    notes
  } = req.body;

  const result = await db.createServiceRequest(
    client_id,
    service_address,
    cleaning_type,
    num_rooms,
    preferred_datetime || null,
    proposed_budget || null,
    notes || null
  );

  res.json(result);
});

// ===========================
// ADD PHOTO
// ===========================
app.post('/requests/add-photo', async (req, res) => {
  const { request_id, photo_url } = req.body;
  const result = await db.addPhoto(request_id, photo_url);
  res.json(result);
});

// ===========================
// CREATE QUOTE
// ===========================
app.post('/quotes/create', async (req, res) => {
  const {
    request_id,
    price,
    time_window_start,
    time_window_end,
    note
  } = req.body;

  const result = await db.createQuote(
    request_id,
    price,
    time_window_start,
    time_window_end,
    note
  );

  res.json(result);
});

// ===========================
// ACCEPT QUOTE
// ===========================
app.post('/quotes/accept', async (req, res) => {
  const { quote_id } = req.body;
  const result = await db.acceptQuote(quote_id);
  res.json(result);
});

// ===========================
// COMPLETE ORDER
// ===========================
app.post('/orders/complete', async (req, res) => {
  const { order_id } = req.body;
  const result = await db.completeOrder(order_id);
  res.json(result);
});

// ===========================
// CREATE BILL
// ===========================
app.post('/bills/create', async (req, res) => {
  const { order_id, amount } = req.body;
  const result = await db.createBill(order_id, amount);
  res.json(result);
});

// ===========================
// PAY BILL
// ===========================
app.post('/bills/pay', async (req, res) => {
  const { bill_id, client_id, amount } = req.body;
  const result = await db.payBill(bill_id, client_id, amount);
  res.json(result);
});

// ===========================
// DISPUTE BILL
// ===========================
app.post('/bills/dispute', async (req, res) => {
  const { bill_id, note } = req.body;
  const result = await db.disputeBill(bill_id, note);
  res.json(result);
});

// ===========================
// DASHBOARD
// ===========================
app.get('/dashboard/frequent-clients', async (req, res) => {
  res.json(await db.frequentClients());
});

app.get('/dashboard/uncommitted-clients', async (req, res) => {
  res.json(await db.uncommittedClients());
});

app.get('/dashboard/accepted-quotes', async (req, res) => {
  const { year, month } = req.query;
  res.json(await db.acceptedQuotes(year, month));
});

app.get('/dashboard/prospective-clients', async (req, res) => {
  res.json(await db.prospectiveClients());
});

app.get('/dashboard/largest-job', async (req, res) => {
  res.json(await db.largestJob());
});

app.get('/dashboard/overdue-bills', async (req, res) => {
  res.json(await db.overdueBills());
});

app.get('/dashboard/bad-clients', async (req, res) => {
  res.json(await db.badClients());
});

app.get('/dashboard/good-clients', async (req, res) => {
  res.json(await db.goodClients());
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

// ===========================
// HEALTH & READINESS
// ===========================
app.get('/health', async (req, res) => {
  try {
    const dbReady = await db.isDbReady();
    res.json({ status: 'ok', uptime: process.uptime(), db: dbReady ? 'connected' : 'disconnected' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/ready', async (req, res) => {
  try {
    const ready = await db.isDbReady();
    if (ready) return res.json({ ready: true });
    return res.status(503).json({ ready: false });
  } catch (err) {
    return res.status(503).json({ ready: false, error: err.message });
  }
});

// ===========================
// DETAILED HEALTH CHECKS
// ===========================
app.get('/health/detailed', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: { connected: false },
    mysql: { connected: false }
  };

  try {
    checks.mongodb.connected = await db.isDbReady();
  } catch (err) {
    checks.mongodb.error = err.message;
  }

  res.json({
    status: checks.mongodb.connected ? 'ok' : 'degraded',
    checks
  });
});

app.get('/health/live', (req, res) => {
  res.json({ alive: true, timestamp: new Date().toISOString() });
});

app.get('/health/startup', async (req, res) => {
  try {
    const dbReady = await db.isDbReady();
    if (dbReady) {
      return res.json({ startup: 'ready', message: 'Backend is fully operational' });
    }
    return res.status(503).json({ startup: 'not-ready', message: 'Database not ready' });
  } catch (err) {
    return res.status(503).json({ startup: 'error', error: err.message });
  }
});

// ===========================
// ADMIN: Enable Claude Haiku 4.5 for all clients
// ===========================
app.post('/admin/enable-claude-haiku', async (req, res) => {
  try {
    const result = await db.enableClaudeHaikuForAllClients();
    if (result && result.success) res.json({ success: true, message: 'Claude Haiku enabled for all clients' });
    else res.status(500).json({ success: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===========================
// Insert sample project request into MongoDB (flexible schema)
// ===========================
app.post('/t1', async (req, res) => {
  try {
    const T1 = mongoose.model('t1', new mongoose.Schema({}, { strict: false }));
    const payload = req.body;
    payload.created_at = new Date();
    const doc = await T1.create(payload);
    res.json({ success: true, inserted: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export for Vercel
module.exports = app;
