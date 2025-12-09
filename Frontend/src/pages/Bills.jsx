import React, { useState, useEffect } from 'react'

export default function Bills({ clientId }){
  const [bills, setBills] = useState([])
  const [selectedBill, setSelectedBill] = useState(null)
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState('pay')
  const [disputeNote, setDisputeNote] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'

  useEffect(() => {
    loadBills()
  }, [])

  async function loadBills() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!clientId) {
        setMessage('Error: Client ID not found. Please log in again.')
        setLoading(false)
        return
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(`${API_BASE}/bills/client/${clientId}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setBills(data.data || [])
      } else {
        setMessage('Error loading bills: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      setMessage('Error loading bills: ' + err.message)
    }
    setLoading(false)
  }

  async function handleBillAction(e) {
    e.preventDefault()
    
    if (!selectedBill) {
      setMessage('Please select a bill')
      return
    }

    if (action === 'pay' && !amount) {
      setMessage('Please enter a payment amount')
      return
    }

    if (action === 'dispute' && !disputeNote) {
      setMessage('Please enter a dispute note')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      if (action === 'pay') {
        const res = await fetch(`${API_BASE}/bills/pay`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            bill_id: selectedBill._id,
            client_id: clientId,
            amount: Number(amount)
          })
        })
        const data = await res.json()
        
        if (data.success) {
          setMessage('✓ Bill paid successfully!')
          setSelectedBill(null)
          setAmount('')
          loadBills()
        } else {
          setMessage('Error: ' + (data.error || 'Could not pay bill'))
        }
      } else if (action === 'dispute') {
        const res = await fetch(`${API_BASE}/bills/dispute`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            bill_id: selectedBill._id,
            note: disputeNote
          })
        })
        const data = await res.json()
        
        if (data.success) {
          setMessage('✓ Bill dispute submitted successfully!')
          setSelectedBill(null)
          setDisputeNote('')
          loadBills()
        } else {
          setMessage('Error: ' + (data.error || 'Could not dispute bill'))
        }
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  return (
    <section>
      <h2>Manage Bills</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
      
      {message && (
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '4px',
          border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading bills...</p>
      ) : bills.length === 0 ? (
        <p>You have no bills at this time.</p>
      ) : (
        <div>
          <h3>Your Bills</h3>
          <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px'}}>
            <thead>
              <tr style={{backgroundColor: '#e9ecef'}}>
                <th style={{border: '1px solid #ddd', padding: '8px'}}>Bill ID</th>
                <th style={{border: '1px solid #ddd', padding: '8px'}}>Amount</th>
                <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                <th style={{border: '1px solid #ddd', padding: '8px'}}>Created</th>
                <th style={{border: '1px solid #ddd', padding: '8px'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, i) => (
                <tr key={i} style={{backgroundColor: selectedBill?._id === bill._id ? '#e7f3ff' : 'white'}}>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>{bill._id?.toString().slice(-6)}</strong></td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>${bill.amount}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: bill.status === 'PAID' ? '#d4edda' : bill.status === 'DISPUTED' ? '#fff3cd' : '#f8d7da',
                      borderRadius: '3px',
                      color: bill.status === 'PAID' ? '#155724' : bill.status === 'DISPUTED' ? '#856404' : '#721c24'
                    }}>
                      {bill.status}
                    </span>
                  </td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{bill.created_at ? new Date(bill.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    {bill.status === 'UNPAID' && (
                      <button onClick={() => { setSelectedBill(bill); setAction('pay'); setAmount(''); setDisputeNote(''); }} style={{padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', marginRight: '5px'}}>
                        Pay/Dispute
                      </button>
                    )}
                    {bill.status === 'DISPUTED' && (
                      <span style={{color: '#999', fontSize: '12px'}}>Under Review</span>
                    )}
                    {bill.status === 'PAID' && (
                      <span style={{color: '#28a745', fontSize: '12px', fontWeight: 'bold'}}>Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedBill && selectedBill.status === 'UNPAID' && (
            <form onSubmit={handleBillAction} style={{maxWidth: '500px', padding: '15px', backgroundColor: 'white', border: '2px solid #007bff', borderRadius: '4px'}}>
              <h4>Bill {selectedBill._id?.toString().slice(-6)} - ${selectedBill.amount}</h4>
              
              <div style={{marginBottom: '10px'}}>
                <label style={{display: 'block', marginBottom: '5px'}}>Action:
                  <select value={action} onChange={(e) => setAction(e.target.value)} style={{width: '100%', padding: '5px', marginTop: '5px'}}>
                    <option value="pay">Pay Bill</option>
                    <option value="dispute">Dispute Bill</option>
                  </select>
                </label>
              </div>

              {action === 'pay' && (
                <div style={{marginBottom: '10px'}}>
                  <label style={{display: 'block', marginBottom: '5px'}}>Payment Amount:
                    <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`e.g., ${selectedBill.amount}`} style={{width: '100%', padding: '5px', marginTop: '5px', boxSizing: 'border-box'}} />
                  </label>
                </div>
              )}

              {action === 'dispute' && (
                <div style={{marginBottom: '10px'}}>
                  <label style={{display: 'block', marginBottom: '5px'}}>Dispute Note:
                    <textarea value={disputeNote} onChange={(e) => setDisputeNote(e.target.value)} placeholder="Explain why you are disputing this bill..." style={{width: '100%', height: '80px', padding: '5px', marginTop: '5px', boxSizing: 'border-box'}} />
                  </label>
                </div>
              )}
              
              <button type="submit" style={{marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                {action === 'pay' ? 'Pay Bill' : 'Dispute Bill'}
              </button>
              <button type="button" onClick={() => setSelectedBill(null)} style={{padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  )
}
