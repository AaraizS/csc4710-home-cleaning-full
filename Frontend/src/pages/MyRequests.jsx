import React, { useState, useEffect } from 'react'

export default function MyRequests({ clientId }){
  const [requests, setRequests] = useState([])
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('requests')
  const [showRenegotiateModal, setShowRenegotiateModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [renegotiateNote, setRenegotiateNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (clientId) {
      loadRequests()
      loadQuotes()
    }
  }, [clientId])

  async function loadRequests(){
    setLoading(true)
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      console.log('Loading requests for clientId:', clientId)
      const res = await fetch(`${API_BASE}/requests/client/${clientId}`, { headers })
      const data = await res.json()
      console.log('Requests response:', data)
      console.log('Setting requests to:', data.data)
      setRequests(data.data || [])
    } catch (err) {
      console.error('Error loading requests:', err.message)
      setRequests([])
    }
    setLoading(false)
  }

  async function loadQuotes(){
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(`${API_BASE}/quotes/client/${clientId}`, { headers })
      const data = await res.json()
      console.log('Quotes response:', data)
      setQuotes(data.data || [])
    } catch (err) {
      console.error('Error loading quotes:', err.message)
    }
  }

  async function handleRenegotiate(quote){
    setSelectedQuote(quote)
    setRenegotiateNote('')
    setShowRenegotiateModal(true)
  }

  async function submitRenegotiation(){
    if (!renegotiateNote.trim()) {
      alert('Please enter a renegotiation message')
      return
    }

    setSubmitting(true)
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(`${API_BASE}/quotes/${selectedQuote._id}/renegotiate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ note: renegotiateNote })
      })

      const data = await res.json()
      if (data.success) {
        alert('Renegotiation message sent to Anna!')
        setShowRenegotiateModal(false)
        setRenegotiateNote('')
        setSelectedQuote(null)
        loadQuotes()
      } else {
        alert('Error: ' + (data.error || 'Could not submit renegotiation'))
      }
    } catch (err) {
      alert('Error submitting renegotiation: ' + err.message)
    }
    setSubmitting(false)
  }

  return (
    <section>
      <h2>My Service Requests</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'requests' ? '#007bff' : '#f5f5f5',
            color: activeTab === 'requests' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'requests' ? 'bold' : 'normal'
          }}
        >
          My Requests
        </button>
        <button 
          onClick={() => setActiveTab('quotes')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'quotes' ? '#007bff' : '#f5f5f5',
            color: activeTab === 'quotes' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'quotes' ? 'bold' : 'normal'
          }}
        >
          Quotes & Negotiations
        </button>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {loading && <p>Loading...</p>}

        {activeTab === 'requests' && (
          <div>
            <h3>My Service Requests</h3>
            {requests.length === 0 ? (
              <p>No service requests submitted yet</p>
            ) : (
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#e9ecef'}}>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Request ID</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Service Type</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Address</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Preferred Date</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Budget</th>
                    <th style={{border: '1px solid #ddd', padding: '8px'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => (
                    <tr key={i}>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>{req._id?.toString().slice(-6)}</strong></td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.cleaning_type}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.service_address}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.preferred_datetime ? new Date(req.preferred_datetime).toLocaleDateString() : 'N/A'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>${req.proposed_budget || 'N/A'}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.status || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div>
            <h3>Quotes & Negotiations</h3>
            {quotes.length === 0 ? (
              <p>No quotes received yet</p>
            ) : (
              <div>
                {quotes.map((quote, i) => (
                  <div key={i} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
                      <div><strong>Quote ID:</strong> {quote._id?.toString().slice(-6)}</div>
                      <div><strong>Request ID:</strong> {quote.request_id?.toString().slice(-6)}</div>
                      <div><strong>Price:</strong> ${quote.price}</div>
                      <div><strong>Status:</strong> <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: quote.status === 'accepted' ? '#d4edda' : quote.status === 'rejected' ? '#f8d7da' : '#e7f3ff',
                        color: quote.status === 'accepted' ? '#155724' : quote.status === 'rejected' ? '#721c24' : '#0c5ff4'
                      }}>{quote.status || 'Pending'}</span></div>
                      <div><strong>Timeline:</strong> {quote.timeline}</div>
                      <div><strong>Created:</strong> {new Date(quote.created_at).toLocaleDateString()}</div>
                    </div>
                    
                    {quote.description && (
                      <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>Description:</strong> {quote.description}
                      </div>
                    )}

                    {quote.notes && (
                      <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>Anna's Note:</strong> {quote.notes}
                      </div>
                    )}

                    {quote.rejection_reason && (
                      <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', color: '#721c24' }}>
                        <strong>Rejection Reason:</strong> {quote.rejection_reason}
                      </div>
                    )}

                    {quote.status === 'pending' && (
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                        <p><strong>Actions:</strong></p>
                        <button onClick={() => handleAccept(quote)} style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Accept Quote
                        </button>
                        <button onClick={() => handleRenegotiate(quote)} style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Renegotiate
                        </button>
                        <button onClick={() => handleReject(quote)} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Renegotiation Modal */}
      {showRenegotiateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3>Submit Renegotiation Message</h3>
            {selectedQuote && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>Quote ID:</strong> {selectedQuote._id?.toString().slice(-6)} | <strong>Price:</strong> ${selectedQuote.price}
              </div>
            )}
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Your Renegotiation Message:</strong>
            </label>
            <textarea
              value={renegotiateNote}
              onChange={(e) => setRenegotiateNote(e.target.value)}
              placeholder="Tell Anna about your concerns or counter-offer..."
              style={{
                width: '100%',
                height: '120px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '15px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRenegotiateModal(false)
                  setSelectedQuote(null)
                  setRenegotiateNote('')
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitRenegotiation}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffc107',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Renegotiation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function handleAccept(quote) {
  // This would need to be moved inside the component to have access to state
  // For now, clients can use the Quotes section to accept
  alert('Please use the main Quotes section to accept this quote')
}

function handleReject(quote) {
  // This would need to be moved inside the component to have access to state
  // For now, clients can use the Quotes section to reject
  alert('Please use the main Quotes section to reject this quote')
}
