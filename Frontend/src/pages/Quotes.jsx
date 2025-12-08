import React, { useState } from 'react'
import { createQuote, acceptQuote } from '../api'

export default function Quotes(){
  const [out, setOut] = useState('')

  async function onCreate(e){
    e.preventDefault()
    const f = new FormData(e.target)
    const data = {
      request_id: Number(f.get('request_id')),
      price: Number(f.get('price')),
      time_window_start: f.get('time_window_start') || null,
      time_window_end: f.get('time_window_end') || null,
      note: f.get('note') || null
    }
    try{
      const res = await createQuote(data)
      setOut(JSON.stringify(res, null, 2))
    }catch(err){ setOut(err.toString()) }
  }

  async function onAccept(e){
    e.preventDefault()
    const f = new FormData(e.target)
    const data = { quote_id: Number(f.get('quote_id')) }
    try{
      const res = await acceptQuote(data)
      setOut(JSON.stringify(res, null, 2))
    }catch(err){ setOut(err.toString()) }
  }

  return (
    <section>
      <h2>Quotes</h2>
      <div style={{display:'flex',gap:20}}>
        <form onSubmit={onCreate} style={{flex:1}}>
          <h3>Create Quote</h3>
          <label>Request ID: <input name="request_id" required /></label><br />
          <label>Price: <input name="price" type="number" step="0.01" required /></label><br />
          <label>Start: <input name="time_window_start" type="datetime-local" /></label><br />
          <label>End: <input name="time_window_end" type="datetime-local" /></label><br />
          <label>Note: <textarea name="note"></textarea></label><br />
          <button type="submit">Create Quote</button>
        </form>

        <form onSubmit={onAccept} style={{flex:1}}>
          <h3>Accept Quote</h3>
          <label>Quote ID: <input name="quote_id" required /></label><br />
          <button type="submit">Accept</button>
        </form>
      </div>
      <pre className="output">{out}</pre>
    </section>
  )
}
