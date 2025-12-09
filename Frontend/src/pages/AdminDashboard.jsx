import React, { useState, useEffect } from 'react'
import { createQuote, completeOrder, createBill } from '../api'

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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Load data on mount and when tab changes
  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData(){
    setLoading(true)
    setMessage('')
    try {
      // Fetch data from backend API
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      if (activeTab === TABS.requests) {
        const res = await fetch(API_BASE + '/requests/all', { headers })
        const data = await res.json()
        setRequests(data.data || [])
      } else if (activeTab === TABS.quotes) {
        const res = await fetch(API_BASE + '/quotes/all', { headers })
        const data = await res.json()
        setQuotes(data.data || [])
      } else if (activeTab === TABS.orders) {
        const res = await fetch(API_BASE + '/orders/all', { headers })
        const data = await res.json()
        setOrders(data.data || [])
      } else if (activeTab === TABS.bills) {
        const res = await fetch(API_BASE + '/bills/all', { headers })
        const data = await res.json()
        setBills(data.data || [])
      }
    } catch (err) {
      setMessage('Error loading data: ' + err.message)
    }
    setLoading(false)
  }

  // REQUEST MANAGEMENT TAB
  function RequestsTab(){
    const [quoteData, setQuoteData] = useState({ request_id: '', price: '', description: '', timeline: '' })
    const [rejectId, setRejectId] = useState('')

    async function handleCreateQuote(){
      if (!quoteData.request_id || !quoteData.price) {
        setMessage('Request ID and Price required')
        return
      }
      try {
        const res = await createQuote({
          request_id: quoteData.request_id,
          price: Number(quoteData.price),
          description: quoteData.description,
          timeline: quoteData.timeline
        })
        setMessage('Quote created: ' + JSON.stringify(res))
        setQuoteData({ request_id: '', price: '', description: '', timeline: '' })
      } catch (err) {
        setMessage('Error: ' + err.message)
      }
    }

    return (
      <div>
        <h3>Service Requests</h3>
        <div style={{ marginBottom: '20px' }}>
          <h4>Respond to Request with Quote</h4>
          <label>Request ID: <input value={quoteData.request_id} onChange={(e) => setQuoteData({...quoteData, request_id: e.target.value})} /></label><br />
          <label>Price: <input type="number" step="0.01" value={quoteData.price} onChange={(e) => setQuoteData({...quoteData, price: e.target.value})} /></label><br />
          <label>Description: <textarea value={quoteData.description} onChange={(e) => setQuoteData({...quoteData, description: e.target.value})} style={{width: '100%', minHeight: '80px'}}></textarea></label><br />
          <label>Timeline: <input placeholder="e.g., 2 days" value={quoteData.timeline} onChange={(e) => setQuoteData({...quoteData, timeline: e.target.value})} /></label><br />
          <button onClick={handleCreateQuote} style={{marginTop: '10px'}}>Send Quote</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>Reject Request</h4>
          <label>Request ID: <input value={rejectId} onChange={(e) => setRejectId(e.target.value)} /></label><br />
          <button onClick={() => setMessage('Rejection sent for request: ' + rejectId)} style={{marginTop: '10px', backgroundColor: '#d9534f'}}>Reject Request</button>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Pending Requests</h4>
          {requests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#e9ecef'}}>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Client</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Service</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Address</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Budget</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={i}>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{req._id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.client_id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.cleaning_type}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.service_address}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>${req.proposed_budget || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  // QUOTES MANAGEMENT TAB
  function QuotesTab(){
    return (
      <div>
        <h3>Manage Quotes</h3>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Quotes Sent</h4>
          {quotes.length === 0 ? (
            <p>No quotes sent yet</p>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#e9ecef'}}>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Quote ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Request ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Price</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, i) => (
                  <tr key={i}>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{quote._id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{quote.request_id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>${quote.price}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{quote.status || 'Pending'}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{quote.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  // ORDERS MANAGEMENT TAB
  function OrdersTab(){
    const [orderId, setOrderId] = useState('')

    async function markCompleted(){
      if (!orderId) {
        setMessage('Order ID required')
        return
      }
      try {
        const res = await completeOrder({ order_id: orderId })
        setMessage('Order marked as completed: ' + JSON.stringify(res))
        setOrderId('')
        loadData()
      } catch (err) {
        setMessage('Error: ' + err.message)
      }
    }

    return (
      <div>
        <h3>Manage Orders</h3>
        <div style={{ marginBottom: '20px' }}>
          <h4>Mark Order as Completed</h4>
          <label>Order ID: <input value={orderId} onChange={(e) => setOrderId(e.target.value)} /></label><br />
          <button onClick={markCompleted} style={{marginTop: '10px'}}>Mark as Completed</button>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Active Orders</h4>
          {orders.length === 0 ? (
            <p>No active orders</p>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#e9ecef'}}>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Order ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Quote ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Price</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Accepted Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={i}>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{order._id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{order.quote_id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>${order.price}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{order.status}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{new Date(order.accepted_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  // BILLS MANAGEMENT TAB
  function BillsTab(){
    const [billData, setBillData] = useState({ order_id: '', amount: '', due_date: '', notes: '' })

    async function handleCreateBill(){
      if (!billData.order_id || !billData.amount) {
        setMessage('Order ID and Amount required')
        return
      }
      try {
        const res = await createBill({
          order_id: billData.order_id,
          amount: Number(billData.amount),
          due_date: billData.due_date,
          notes: billData.notes
        })
        setMessage('Bill created: ' + JSON.stringify(res))
        setBillData({ order_id: '', amount: '', due_date: '', notes: '' })
        loadData()
      } catch (err) {
        setMessage('Error: ' + err.message)
      }
    }

    return (
      <div>
        <h3>Manage Bills</h3>
        <div style={{ marginBottom: '20px' }}>
          <h4>Create New Bill</h4>
          <label>Order ID: <input value={billData.order_id} onChange={(e) => setBillData({...billData, order_id: e.target.value})} /></label><br />
          <label>Amount: <input type="number" step="0.01" value={billData.amount} onChange={(e) => setBillData({...billData, amount: e.target.value})} /></label><br />
          <label>Due Date: <input type="date" value={billData.due_date} onChange={(e) => setBillData({...billData, due_date: e.target.value})} /></label><br />
          <label>Notes: <textarea value={billData.notes} onChange={(e) => setBillData({...billData, notes: e.target.value})} style={{width: '100%', minHeight: '60px'}}></textarea></label><br />
          <button onClick={handleCreateBill} style={{marginTop: '10px'}}>Create Bill</button>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>All Bills</h4>
          {bills.length === 0 ? (
            <p>No bills created</p>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#e9ecef'}}>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Bill ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Order ID</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Amount</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                  <th style={{border: '1px solid #ddd', padding: '8px'}}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, i) => (
                  <tr key={i}>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{bill._id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{bill.order_id}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>${bill.amount}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{bill.status}</td>
                    <td style={{border: '1px solid #ddd', padding: '8px'}}>{new Date(bill.due_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  // ANALYTICS TAB
  function AnalyticsTab(){
    return (
      <div>
        <h3>Business Analytics</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px'}}>
          <div style={{padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px'}}>
            <h4>Total Requests</h4>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{requests.length}</p>
          </div>
          <div style={{padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px'}}>
            <h4>Quotes Sent</h4>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{quotes.length}</p>
          </div>
          <div style={{padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '4px'}}>
            <h4>Active Orders</h4>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{orders.length}</p>
          </div>
          <div style={{padding: '15px', backgroundColor: '#fff3e0', borderRadius: '4px'}}>
            <h4>Bills Outstanding</h4>
            <p style={{fontSize: '24px', fontWeight: 'bold'}}>{bills.filter(b => b.status !== 'paid').length}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section>
      <h2>Admin Dashboard - Anna Johnson</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab(TABS.requests)}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === TABS.requests ? '#007bff' : '#f5f5f5',
            color: activeTab === TABS.requests ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === TABS.requests ? 'bold' : 'normal'
          }}
        >
          Requests
        </button>
        <button 
          onClick={() => setActiveTab(TABS.quotes)}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === TABS.quotes ? '#007bff' : '#f5f5f5',
            color: activeTab === TABS.quotes ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === TABS.quotes ? 'bold' : 'normal'
          }}
        >
          Quotes
        </button>
        <button 
          onClick={() => setActiveTab(TABS.orders)}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === TABS.orders ? '#007bff' : '#f5f5f5',
            color: activeTab === TABS.orders ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === TABS.orders ? 'bold' : 'normal'
          }}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab(TABS.bills)}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === TABS.bills ? '#007bff' : '#f5f5f5',
            color: activeTab === TABS.bills ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === TABS.bills ? 'bold' : 'normal'
          }}
        >
          Bills
        </button>
        <button 
          onClick={() => setActiveTab(TABS.analytics)}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === TABS.analytics ? '#007bff' : '#f5f5f5',
            color: activeTab === TABS.analytics ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === TABS.analytics ? 'bold' : 'normal'
          }}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {loading && <p>Loading...</p>}
        {message && <div style={{padding: '10px', marginBottom: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px'}}>{message}</div>}
        
        {activeTab === TABS.requests && <RequestsTab />}
        {activeTab === TABS.quotes && <QuotesTab />}
        {activeTab === TABS.orders && <OrdersTab />}
        {activeTab === TABS.bills && <BillsTab />}
        {activeTab === TABS.analytics && <AnalyticsTab />}
      </div>
    </section>
  )
}
