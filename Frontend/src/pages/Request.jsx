import React, { useState } from 'react'
import { createRequest, insertT1 } from '../api'

export default function Request(){
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    const f = new FormData(e.target)
    const photos = f.get('photos') ? f.get('photos').split('\n').map(s=>s.trim()).filter(Boolean) : []
    const data = {
      client_id: Number(f.get('client_id')),
      service_address: f.get('service_address'),
      cleaning_type: f.get('cleaning_type'),
      num_rooms: Number(f.get('num_rooms')),
      preferred_datetime: f.get('preferred_datetime') ? new Date(f.get('preferred_datetime')).toISOString() : null,
      proposed_budget: f.get('proposed_budget') ? Number(f.get('proposed_budget')) : null,
      notes: f.get('notes'),
      photos
    }
    setLoading(true)
    try{
      const res = await createRequest(data)
      // also save to Mongo t1 for demo
      await insertT1(data)
      setOut(JSON.stringify(res, null, 2))
    }catch(err){ setOut(err.toString()) }
    setLoading(false)
  }

  return (
    <section>
      <h2>Submit Service Request</h2>
      <form onSubmit={onSubmit}>
        <label>Client ID: <input name="client_id" required /></label><br />
        <label>Service address: <input name="service_address" required /></label><br />
        <label>Cleaning type: <select name="cleaning_type"><option>basic</option><option>deep cleaning</option><option>move-out</option></select></label><br />
        <label>Number of rooms: <input name="num_rooms" type="number" min="1" defaultValue={1} required /></label><br />
        <label>Preferred datetime: <input name="preferred_datetime" type="datetime-local" /></label><br />
        <label>Proposed budget: <input name="proposed_budget" type="number" step="0.01" /></label><br />
        <label>Notes: <textarea name="notes"></textarea></label><br />
        <label>Photos (one URL per line): <textarea name="photos"></textarea></label><br />
        <button type="submit" disabled={loading}>{loading? 'Submitting...' : 'Submit Request'}</button>
      </form>
      <pre className="output">{out}</pre>
    </section>
  )
}
