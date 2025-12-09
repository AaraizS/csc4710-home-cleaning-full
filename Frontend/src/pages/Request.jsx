import React, { useState } from 'react'
import { createRequest, insertT1 } from '../api'

export default function Request(){
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoError, setPhotoError] = useState('')

  const MAX_PHOTOS = 5

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length > MAX_PHOTOS) {
      setPhotoError(`Maximum ${MAX_PHOTOS} photos allowed. You selected ${files.length}.`)
      e.target.value = ''
      return
    }
    setPhotoError('')
    setPhotoFiles(files)
  }

  async function onSubmit(e){
    e.preventDefault()
    const f = new FormData(e.target)
    
    if (photoFiles.length > MAX_PHOTOS) {
      setOut(JSON.stringify({ error: `Maximum ${MAX_PHOTOS} photos allowed` }, null, 2))
      return
    }

    // Convert files to base64 or file names for storage
    const photoNames = photoFiles.map(file => file.name)
    
    const data = {
      client_id: Number(f.get('client_id')),
      service_address: f.get('service_address'),
      cleaning_type: f.get('cleaning_type'),
      num_rooms: Number(f.get('num_rooms')),
      preferred_datetime: f.get('preferred_datetime') ? new Date(f.get('preferred_datetime')).toISOString() : null,
      proposed_budget: f.get('proposed_budget') ? Number(f.get('proposed_budget')) : null,
      notes: f.get('notes'),
      photos: photoNames
    }
    setLoading(true)
    try{
      const res = await createRequest(data)
      // also save to Mongo t1 for demo
      await insertT1(data)
      setOut(JSON.stringify(res, null, 2))
      setPhotoFiles([])
      // Reset file input
      const fileInput = e.target.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    }catch(err){ setOut(err.toString()) }
    setLoading(false)
  }

  return (
    <section>
      <h2>Submit Service Request</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
      <form onSubmit={onSubmit}>
        <label>Client ID: <input name="client_id" required /></label><br />
        <label>Service address: <input name="service_address" required /></label><br />
        <label>Cleaning type: <select name="cleaning_type"><option>basic</option><option>deep cleaning</option><option>move-out</option></select></label><br />
        <label>Number of rooms: <input name="num_rooms" type="number" min="1" defaultValue={1} required /></label><br />
        <label>Preferred datetime: <input name="preferred_datetime" type="datetime-local" /></label><br />
        <label>Proposed budget: <input name="proposed_budget" type="number" step="0.01" /></label><br />
        <label>Notes: <textarea name="notes"></textarea></label><br />
        <label>Upload Photos (max {MAX_PHOTOS}): <input type="file" multiple accept="image/*" onChange={handlePhotoChange} /></label><br />
        {photoFiles.length > 0 && <p style={{color:'green'}}>Selected {photoFiles.length} photo(s)</p>}
        {photoError && <p style={{color:'red'}}>{photoError}</p>}
        <button type="submit" disabled={loading}>{loading? 'Submitting...' : 'Submit Request'}</button>
      </form>
      <pre className="output">{out}</pre>
    </section>
  )
}
