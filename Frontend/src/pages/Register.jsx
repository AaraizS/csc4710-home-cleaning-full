import React, { useState } from 'react'
import { registerClient } from '../api'

export default function Register(){
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    const f = new FormData(e.target)
    const data = Object.fromEntries(f.entries())
    setLoading(true)
    try{
      const res = await registerClient(data)
      setOut(JSON.stringify(res, null, 2))
    }catch(err){ setOut(err.toString()) }
    setLoading(false)
  }

  return (
    <section>
      <h2>Register</h2>
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
      <pre className="output">{out}</pre>
    </section>
  )
}
