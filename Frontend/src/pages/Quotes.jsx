import React, { useState } from 'react'
import { acceptQuote } from '../api'

export default function Quotes(){
  const [out, setOut] = useState('')
  const [quoteId, setQuoteId] = useState('')
  const [action, setAction] = useState('accept')

  async function onAccept(e){
    e.preventDefault()
    try{
      if (action === 'accept') {
        const res = await acceptQuote({ quote_id: quoteId })
        setOut(JSON.stringify(res, null, 2))
      } else if (action === 'renegotiate') {
        setOut(JSON.stringify({ message: 'Please contact Anna Johnson to renegotiate the quote' }, null, 2))
      } else if (action === 'cancel') {
        setOut(JSON.stringify({ message: 'Quote cancelled. You can submit a new request.' }, null, 2))
      }
    }catch(err){ setOut(err.toString()) }
  }

  return (
    <section>
      <h2>Manage Quotes</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
      <form onSubmit={onAccept} style={{maxWidth:'500px'}}>
        <label>Quote ID: <input value={quoteId} onChange={(e) => setQuoteId(e.target.value)} required /></label><br />
        
        <label>Action:
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="accept">Accept Quote</option>
            <option value="renegotiate">Renegotiate</option>
            <option value="cancel">Cancel</option>
          </select>
        </label><br />
        
        <button type="submit">
          {action === 'accept' ? 'Accept' : action === 'renegotiate' ? 'Request Renegotiation' : 'Cancel Quote'}
        </button>
      </form>
      <pre className="output">{out}</pre>
    </section>
  )
}
