import React, { useState, useEffect } from 'react'

export default function MyRequests({ clientId }){
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (clientId) {
      loadRequests()
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
      setRequests(data.data || [])
    } catch (err) {
      console.error('Error loading requests:', err.message)
      setRequests([])
    }
    setLoading(false)
  }

  return (
    <section>
      <h2>My Service Requests</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>

      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {loading && <p>Loading...</p>}

        {!loading && requests.length === 0 && (
          <p>No service requests submitted yet</p>
        )}

        {!loading && requests.length > 0 && (
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
                  <td style={{border: '1px solid #ddd', padding: '8px'}}><strong>{req._id?.toString().slice(-6) || 'N/A'}</strong></td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.cleaning_type || 'N/A'}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.service_address || 'N/A'}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.preferred_datetime ? new Date(req.preferred_datetime).toLocaleDateString() : 'N/A'}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>${req.proposed_budget || 'N/A'}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{req.status || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
