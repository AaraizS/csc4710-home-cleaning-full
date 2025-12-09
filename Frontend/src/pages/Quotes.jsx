import React, { useState, useEffect } from 'react'

export default function Quotes({ clientId }){
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showRenegotiateModal, setShowRenegotiateModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [renegotiateNote, setRenegotiateNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (clientId) {
      loadQuotes()
    }
  }, [clientId])

  async function loadQuotes(){
    setLoading(true)
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      console.log('Loading quotes for clientId:', clientId)
      const res = await fetch(`${API_BASE}/quotes/client/${clientId}`, { headers })
      const data = await res.json()
      console.log('Quotes response:', data)
      setQuotes(data.data || [])
    } catch (err) {
      console.error('Error loading quotes:', err.message)
      setQuotes([])
    }
    setLoading(false)
  }

  async function handleAccept(quote){
    setSubmitting(true)
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(`${API_BASE}/quotes/${quote._id}/accept`, {
        method: 'POST',
        headers
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ Quote accepted successfully!')
        loadQuotes()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error: ' + (data.error || 'Could not accept quote'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
    setSubmitting(false)
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
        setMessage('✓ Renegotiation message sent to Anna!')
        setShowRenegotiateModal(false)
        setRenegotiateNote('')
        setSelectedQuote(null)
        loadQuotes()
        setTimeout(() => setMessage(''), 5000)
      } else {
        setMessage('Error: ' + (data.error || 'Could not submit renegotiation'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
    setSubmitting(false)
  }

  async function handleReject(quote){
    if (!window.confirm('Are you sure you want to reject this quote?')) return
    
    setSubmitting(true)
    try {
      const API_BASE = 'https://csc4710-home-cleaning-api.vercel.app'
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      const res = await fetch(`${API_BASE}/quotes/${quote._id}/reject`, {
        method: 'POST',
        headers
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ Quote rejected')
        loadQuotes()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error: ' + (data.error || 'Could not reject quote'))
      }
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
    setSubmitting(false)
  }

  return (
    <section>
      <h2>Available Quotes</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>

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

      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {loading && <p>Loading quotes...</p>}

        {!loading && quotes.length === 0 && (
          <p>No quotes available yet. Submit a service request to receive quotes from Anna.</p>
        )}

        {!loading && quotes.length > 0 && (
          <div>
            {quotes.map((quote, i) => (
              <div key={i} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <strong>Quote ID:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>{quote._id?.toString().slice(-6)}</span>
                  </div>
                  <div>
                    <strong>Request ID:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>{quote.request_id?.toString().slice(-6)}</span>
                  </div>
                  <div>
                    <strong>Price:</strong> <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>${quote.price}</span>
                  </div>
                  <div>
                    <strong>Status:</strong> <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: quote.status === 'ACCEPTED' ? '#d4edda' : quote.status === 'REJECTED' ? '#f8d7da' : quote.status === 'RENEGOTIATING' ? '#fff3cd' : '#e7f3ff',
                      color: quote.status === 'ACCEPTED' ? '#155724' : quote.status === 'REJECTED' ? '#721c24' : quote.status === 'RENEGOTIATING' ? '#856404' : '#0c5ff4'
                    }}>{quote.status || 'PENDING'}</span>
                  </div>
                  <div>
                    <strong>Timeline:</strong> {quote.timeline || 'N/A'}
                  </div>
                  <div>
                    <strong>Created:</strong> {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {quote.note && (
                  <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <strong>Quote Details:</strong> {quote.note}
                  </div>
                )}

                {quote.client_note && (
                  <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', borderLeft: '4px solid #ffc107' }}>
                    <strong>Your Renegotiation Note:</strong> {quote.client_note}
                  </div>
                )}

                {quote.status === 'PENDING' && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleAccept(quote)}
                      disabled={submitting}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1
                      }}>
                      Accept Quote
                    </button>
                    <button 
                      onClick={() => handleRenegotiate(quote)}
                      disabled={submitting}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#ffc107', 
                        color: '#333', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1
                      }}>
                      Renegotiate
                    </button>
                    <button 
                      onClick={() => handleReject(quote)}
                      disabled={submitting}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1
                      }}>
                      Reject
                    </button>
                  </div>
                )}

                {quote.status === 'ACCEPTED' && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                    ✓ You have accepted this quote. Anna will contact you to schedule the service.
                  </div>
                )}

                {quote.status === 'REJECTED' && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', color: '#721c24' }}>
                    ✗ You have rejected this quote. You can submit a new request if needed.
                  </div>
                )}

                {quote.status === 'RENEGOTIATING' && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                    ⧖ Waiting for Anna's response to your renegotiation message.
                  </div>
                )}
              </div>
            ))}
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
            <h3>Renegotiate Quote</h3>
            {selectedQuote && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>Quote ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedQuote._id?.toString().slice(-6)}</span>
                <br />
                <strong>Current Price:</strong> ${selectedQuote.price}
              </div>
            )}
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Your Renegotiation Message:</strong>
            </label>
            <textarea
              value={renegotiateNote}
              onChange={(e) => setRenegotiateNote(e.target.value)}
              placeholder="Describe your concerns, suggest a counter-offer, or ask questions about the quote..."
              style={{
                width: '100%',
                height: '120px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '15px',
                fontSize: '14px'
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
