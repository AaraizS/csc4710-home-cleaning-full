import React, { useState } from 'react'
import { registerClient } from '../api'

export default function Register(){
  const [out, setOut] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    const f = new FormData(e.target)
    const data = Object.fromEntries(f.entries())
    setLoading(true)
    setMessage('')
    try{
      const res = await registerClient(data)
      if (res.success) {
        setMessage('✓ Account created successfully! Redirecting to login...')
        setOut('')
        setTimeout(() => {
          window.location.hash = '#login'
        }, 2000)
      } else {
        setMessage('Error: ' + (res.error || 'Registration failed'))
        setOut(JSON.stringify(res, null, 2))
      }
    }catch(err){ 
      setMessage('Error: ' + err.toString())
      setOut(err.toString())
    }
    setLoading(false)
  }

  return (
    <section>
      <h2>Register</h2>
      <button onClick={() => window.location.hash = '#login'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Login</button>
      <form onSubmit={onSubmit}>
        <label>First name: <input name="first_name" required /></label><br />
        <label>Last name: <input name="last_name" required /></label><br />
        <label>Address: <input name="address" required /></label><br />
        <label>Phone: <input name="phone" /></label><br />
        <label>Email: <input name="email" type="email" required /></label><br />
        <label>Password: <input name="password" type="password" required /></label><br />
        <label>CC last4: <input name="cc_last4" maxLength={4} /></label><br />
        <button type="submit" disabled={loading}>{loading? 'Saving...' : 'Register'}</button>
      </form>
      {message && <div style={{ marginTop: '15px', padding: '12px', backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', borderRadius: '4px', border: '1px solid ' + (message.includes('Error') ? '#f5c6cb' : '#c3e6cb') }}>{message}</div>}
      {out && <pre className="output">{out}</pre>}
    </section>
  )
}
