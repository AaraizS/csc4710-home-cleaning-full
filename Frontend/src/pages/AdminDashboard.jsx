import React, { useState, useEffect } from 'react'

const TABS = {
  requests: 'requests',
  quotes: 'quotes',
  orders: 'orders',
  bills: 'bills',
  analytics: 'analytics'
}

export default function AdminDashboard(){
  const [activeTab, setActiveTab] = useState(TABS.requests)
  const [requests, setRequests] = useState([])
  const [quotes, setQuotes] = useState([])
  const [orders, setOrders] = useState([])
  const [bills, setBills] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // For quote creation
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteTimeline, setQuoteTimeline] = useState('')
  const [quoteNote, setQuoteNote] = useState('')

  // For renegotiating quotes
  const [selectedRenegotiatingQuote, setSelectedRenegotiatingQuote] = useState(null)
  const [renegotiatePrice, setRenegotiatePrice] = useState('')
  const [renegotiateTimeline, setRenegotiateTimeline] = useState('')
  const [renegotiateNote, setRenegotiateNote] = useState('')

  // For bill creation
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [billPrice, setBillPrice] = useState('')
  const [billNote, setBillNote] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData(){
    setLoading(true)
    setMessage('')
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      if (activeTab === TABS.requests) {
        const res = await fetch(API_BASE + '/requests/all', { headers })
        const data = await res.json()
        // Filter to show only pending requests
        setRequests((data.data || []).filter(r => r.status === 'pending'))
      } else if (activeTab === TABS.quotes) {
        const res = await fetch(API_BASE + '/quotes/all', { headers })
        const data = await res.json()
        // Filter to show only pending and renegotiating quotes
        setQuotes((data.data || []).filter(q => q.status === 'PENDING' || q.status === 'RENEGOTIATING'))
      } else if (activeTab === TABS.orders) {
        const res = await fetch(API_BASE + '/orders/all', { headers })
        const data = await res.json()
        setOrders(data.data || [])
      } else if (activeTab === TABS.bills) {
        const res = await fetch(API_BASE + '/bills/all', { headers })
        const data = await res.json()
        setBills(data.data || [])
      } else if (activeTab === TABS.analytics) {
        const res = await fetch(API_BASE + '/analytics/all', { headers })
        const data = await res.json()
        setAnalytics(data.data || {})
      }
    } catch (err) {
      console.error('Error loading data:', err.message)
      setMessage('Error loading data: ' + err.message)
    }
    setLoading(false)
  }

  async function handleCreateQuote(){
    if (!selectedRequest || !quotePrice || !quoteTimeline) {
      setMessage('Please fill in all fields')
      return
    }

    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(API_BASE + '/quotes/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          request_id: selectedRequest._id,
          price: Number(quotePrice),
          timeline: quoteTimeline,
          note: quoteNote
        })
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ Quote created successfully!')
        setSelectedRequest(null)
        setQuotePrice('')
        setQuoteTimeline('')
        setQuoteNote('')
        loadData()
      } else {
        setMessage('Error: ' + (data.error || 'Could not create quote'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  async function handleRejectRequest(){
    if (!selectedRequest) return

    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(`${API_BASE}/requests/${selectedRequest._id}/reject`, {
        method: 'POST',
        headers
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ Request rejected')
        setSelectedRequest(null)
        loadData()
      } else {
        setMessage('Error: ' + (data.error || 'Could not reject request'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  async function handleResubmitRenegotiatingQuote(){
    if (!selectedRenegotiatingQuote || !renegotiatePrice || !renegotiateTimeline) {
      setMessage('Please fill in all fields')
      return
    }

    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      // Create a new quote for the same request with the updated terms
      const res = await fetch(API_BASE + '/quotes/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          request_id: selectedRenegotiatingQuote.request_id,
          price: Number(renegotiatePrice),
          timeline: renegotiateTimeline,
          note: renegotiateNote
        })
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ Quote resubmitted successfully! Client will see your counter-offer.')
        setSelectedRenegotiatingQuote(null)
        setRenegotiatePrice('')
        setRenegotiateTimeline('')
        setRenegotiateNote('')
        loadData()
      } else {
        setMessage('Error: ' + (data.error || 'Could not resubmit quote'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  async function handleCreateBill(){
    if (!selectedOrder || !billPrice) {
      setMessage('Please fill in all fields')
      return
    }

    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(API_BASE + '/bills/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          order_id: selectedOrder._id,
          amount: Number(billPrice),
          note: billNote
        })
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ Bill created successfully!')
        setSelectedOrder(null)
        setBillPrice('')
        setBillNote('')
        // Reload orders data specifically
        const ordersRes = await fetch(API_BASE + '/orders/all', { headers })
        const ordersData = await ordersRes.json()
        setOrders(ordersData.data || [])
      } else {
        setMessage('Error: ' + (data.error || 'Could not create bill'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  return (
    <section>
      <h2>Admin Dashboard - Anna Johnson</h2>

      {message && (
        <div style={{
          padding: '12px 15px',
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        {Object.values(TABS).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 15px',
              backgroundColor: activeTab === tab ? '#333' : '#ddd',
              color: activeTab === tab ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {loading && <p>Loading...</p>}

        {/* REQUESTS TAB */}
        {activeTab === TABS.requests && !loading && (
          <div>
            <h3>Service Requests</h3>
            {requests.length === 0 ? (
              <p>No pending requests</p>
            ) : (
              <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px'}}>
                <thead>
                  <tr style={{backgroundColor: '#e9ecef'}}>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Request ID</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Client Name</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Service Type</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Rooms</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Budget</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Address</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Preferred Date</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Notes</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => (
                    <tr key={i}>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>{req._id?.toString().slice(-6)}</strong></td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.client_name || 'Unknown'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.cleaning_type}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.num_rooms}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>${req.proposed_budget || 'N/A'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.service_address}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.preferred_datetime ? new Date(req.preferred_datetime).toLocaleDateString() : 'N/A'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px', fontSize: '12px'}}>{req.notes ? req.notes.substring(0, 30) + '...' : '-'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>
                        <button onClick={() => setSelectedRequest(req)} style={{padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}>
                          Quote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedRequest && (
              <div style={{padding: '15px', backgroundColor: 'white', border: '2px solid #007bff', borderRadius: '4px', marginTop: '20px'}}>
                <h4>Create Quote for Request {selectedRequest._id?.toString().slice(-6)}</h4>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Price: <input type="number" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} placeholder="e.g., 150" style={{width: '200px', padding: '5px'}} />
                  </label>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Timeline: <input type="text" value={quoteTimeline} onChange={(e) => setQuoteTimeline(e.target.value)} placeholder="e.g., 2-3 hours, Next Monday" style={{width: '200px', padding: '5px'}} />
                  </label>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Note: <textarea value={quoteNote} onChange={(e) => setQuoteNote(e.target.value)} placeholder="Additional details..." style={{width: '100%', height: '60px', padding: '5px'}} />
                  </label>
                </div>
                <button onClick={handleCreateQuote} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Create Quote
                </button>
                <button onClick={handleRejectRequest} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Reject Request
                </button>
                <button onClick={() => setSelectedRequest(null)} style={{padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* QUOTES TAB */}
        {activeTab === TABS.quotes && !loading && (
          <div>
            <h3>Pending Quotes & Renegotiations</h3>
            {quotes.length === 0 ? (
              <p>No pending quotes</p>
            ) : (
              <div>
                {quotes.map((quote, i) => (
                  <div key={i} style={{marginBottom: '15px', padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
                      <div><strong>Quote ID:</strong> {quote._id?.toString().slice(-6)}</div>
                      <div><strong>Request ID:</strong> {quote.request_id?.toString().slice(-6)}</div>
                      <div><strong>Price:</strong> ${quote.price}</div>
                      <div><strong>Status:</strong> <span style={{padding: '2px 6px', backgroundColor: quote.status === 'RENEGOTIATING' ? '#fff3cd' : '#e7f3ff', borderRadius: '3px'}}>{quote.status}</span></div>
                    </div>
                    
                    {quote.client_note && (
                      <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', borderLeft: '4px solid #ffc107'}}>
                        <strong>Client Renegotiation Note:</strong> {quote.client_note}
                      </div>
                    )}

                    {quote.status === 'RENEGOTIATING' && (
                      <button onClick={() => { setSelectedRenegotiatingQuote(quote); setRenegotiatePrice(quote.price); setRenegotiateTimeline(''); setRenegotiateNote(''); }} style={{marginTop: '10px', padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}>
                        Re-submit Quote
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedRenegotiatingQuote && (
              <div style={{padding: '15px', backgroundColor: 'white', border: '2px solid #007bff', borderRadius: '4px', marginTop: '20px'}}>
                <h4>Re-submit Quote for Request {selectedRenegotiatingQuote.request_id?.toString().slice(-6)}</h4>
                <p style={{fontSize: '12px', color: '#666', marginBottom: '15px'}}>Client's note: "{selectedRenegotiatingQuote.client_note}"</p>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    New Price: <input type="number" value={renegotiatePrice} onChange={(e) => setRenegotiatePrice(e.target.value)} placeholder="e.g., 150" step="0.01" style={{width: '200px', padding: '5px'}} />
                  </label>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Timeline: <input type="text" value={renegotiateTimeline} onChange={(e) => setRenegotiateTimeline(e.target.value)} placeholder="e.g., This weekend" style={{width: '200px', padding: '5px'}} />
                  </label>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Note: <textarea value={renegotiateNote} onChange={(e) => setRenegotiateNote(e.target.value)} placeholder="Optional notes to client..." style={{width: '100%', height: '60px', padding: '5px'}} />
                  </label>
                </div>
                <button onClick={handleResubmitRenegotiatingQuote} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Re-submit Quote
                </button>
                <button onClick={() => setSelectedRenegotiatingQuote(null)} style={{padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === TABS.orders && !loading && (
          <div>
            <h3>Accepted Orders</h3>
            {orders.length === 0 ? (
              <p>No orders yet</p>
            ) : (
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#e9ecef'}}>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Order ID</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Request ID</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Agreed Price</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Created</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i}>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>{order._id?.toString().slice(-6)}</strong></td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{order.request_id?.toString().slice(-6)}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{order.status || 'Active'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>${order.agreed_price || 0}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>
                        <button onClick={() => setSelectedOrder(order)} style={{padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}>
                          Create Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedOrder && (
              <div style={{padding: '15px', backgroundColor: 'white', border: '2px solid #007bff', borderRadius: '4px', marginTop: '20px'}}>
                <h4>Create Bill for Order {selectedOrder._id?.toString().slice(-6)}</h4>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Bill Amount: <input type="number" value={billPrice} onChange={(e) => setBillPrice(e.target.value)} placeholder="e.g., 150" step="0.01" style={{width: '200px', padding: '5px'}} />
                  </label>
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label>
                    Note: <textarea value={billNote} onChange={(e) => setBillNote(e.target.value)} placeholder="Payment terms, due date, etc..." style={{width: '100%', height: '60px', padding: '5px'}} />
                  </label>
                </div>
                <button onClick={handleCreateBill} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Create Bill
                </button>
                <button onClick={() => setSelectedOrder(null)} style={{padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* BILLS TAB */}
        {activeTab === TABS.bills && !loading && (
          <div>
            <h3>Bills</h3>
            {bills.length === 0 ? (
              <p>No bills yet</p>
            ) : (
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#e9ecef'}}>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Bill ID</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Amount</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Created</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, i) => (
                    <tr key={i}>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>{bill._id?.toString().slice(-6)}</strong></td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>${bill.amount}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>
                        <span style={{padding: '2px 6px', backgroundColor: bill.status === 'paid' ? '#d4edda' : '#f8d7da', color: bill.status === 'paid' ? '#155724' : '#721c24', borderRadius: '3px'}}>
                          {bill.status || 'Unpaid'}
                        </span>
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{bill.created_at ? new Date(bill.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === TABS.analytics && !loading && (
          <div>
            <h3>Analytics & Reports</h3>
            
            {analytics.frequent_clients && analytics.frequent_clients.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                <h4>Frequent Clients (Most Service Orders)</h4>
                <ol>
                  {analytics.frequent_clients.map((client, i) => (
                    <li key={i}>{client.name} - {client.order_count} orders</li>
                  ))}
                </ol>
              </div>
            )}

            {analytics.uncommitted_clients && analytics.uncommitted_clients.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                <h4>Uncommitted Clients (3+ Requests, No Orders)</h4>
                <ol>
                  {analytics.uncommitted_clients.map((client, i) => (
                    <li key={i}>{client.name} - {client.request_count} requests, 0 orders</li>
                  ))}
                </ol>
              </div>
            )}

            {analytics.monthly_quotes && analytics.monthly_quotes.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                <h4>This Month's Accepted Quotes</h4>
                <p>Count: {analytics.monthly_quotes.length}</p>
                <ul>
                  {analytics.monthly_quotes.slice(0, 5).map((quote, i) => (
                    <li key={i}>Quote ID: {quote._id?.toString().slice(-6)} - ${quote.price}</li>
                  ))}
                  {analytics.monthly_quotes.length > 5 && <li>... and {analytics.monthly_quotes.length - 5} more</li>}
                </ul>
              </div>
            )}

            {analytics.prospective_clients && analytics.prospective_clients.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                <h4>Prospective Clients (Registered, No Requests)</h4>
                <ol>
                  {analytics.prospective_clients.map((client, i) => (
                    <li key={i}>{client.name} - Registered {new Date(client.created_at).toLocaleDateString()}</li>
                  ))}
                </ol>
              </div>
            )}

            {analytics.largest_jobs && analytics.largest_jobs.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                <h4>Largest Jobs (Most Rooms Completed)</h4>
                <ol>
                  {analytics.largest_jobs.map((job, i) => (
                    <li key={i}>Request ID: {job._id?.toString().slice(-6)} - {job.num_rooms} rooms</li>
                  ))}
                </ol>
              </div>
            )}

            {analytics.overdue_bills && analytics.overdue_bills.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '4px', border: '1px solid #f5c6cb'}}>
                <h4>Overdue Bills (Older than 1 Week)</h4>
                <ol>
                  {analytics.overdue_bills.map((bill, i) => (
                    <li key={i}>Bill ID: {bill._id?.toString().slice(-6)} - ${bill.amount} (Due: {new Date(bill.due_date).toLocaleDateString()})</li>
                  ))}
                </ol>
              </div>
            )}

            {analytics.bad_clients && analytics.bad_clients.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '4px', border: '1px solid #f5c6cb'}}>
                <h4>Bad Clients (Never Paid Overdue Bills)</h4>
                <ol>
                  {analytics.bad_clients.map((client, i) => (
                    <li key={i}>{client.name} - {client.overdue_count} unpaid bills</li>
                  ))}
                </ol>
              </div>
            )}

            {analytics.good_clients && analytics.good_clients.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb'}}>
                <h4>Good Clients (Paid Within 24 Hours)</h4>
                <ol>
                  {analytics.good_clients.map((client, i) => (
                    <li key={i}>{client.name} - {client.on_time_count} on-time payments</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
