const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'

async function post(path, body){
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

async function get(path){
  const res = await fetch(API_BASE + path)
  return res.json()
}

// Auth
export async function loginUser(username, password){ return post('/auth/login', { username, password }) }

// Client functions
export async function registerClient(data){ return post('/clients/register', data) }
export async function createRequest(data){ return post('/requests/new', data) }
export async function addPhoto(data){ return post('/requests/add-photo', data) }
export async function acceptQuote(data){ return post('/quotes/accept', data) }
export async function payBill(data){ return post('/bills/pay', data) }
export async function disputeBill(data){ return post('/bills/dispute', data) }

// Admin-only functions
export async function createQuote(data){ return post('/quotes/create', data) }
export async function completeOrder(data){ return post('/orders/complete', data) }
export async function createBill(data){ return post('/bills/create', data) }
export async function enableClaude(){ return post('/admin/enable-claude-haiku', {}) }

export async function insertT1(data){ return post('/t1', data) }

// dashboard (admin only)
export async function frequentClients(){ return get('/dashboard/frequent-clients') }
export async function uncommittedClients(){ return get('/dashboard/uncommitted-clients') }
export async function acceptedQuotes(year, month){ return get(`/dashboard/accepted-quotes?year=${year}&month=${month}`) }
export async function prospectiveClients(){ return get('/dashboard/prospective-clients') }
export async function largestJob(){ return get('/dashboard/largest-job') }
export async function overdueBills(){ return get('/dashboard/overdue-bills') }
export async function badClients(){ return get('/dashboard/bad-clients') }
export async function goodClients(){ return get('/dashboard/good-clients') }

export default { registerClient, createRequest, loginUser }
