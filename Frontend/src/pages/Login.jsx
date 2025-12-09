import React, { useState } from 'react'
import { loginUser } from '../api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await loginUser(username, password)
      if (res.success && res.token) {
        // Extract user info from response
        onLogin({ 
          role: res.role, 
          client_id: res.client_id,
          username: res.username,
          first_name: res.first_name,
          token: res.token
        })
        setUsername('')
        setPassword('')
      } else {
        setError(res.error || 'Invalid username or password')
      }
    } catch (err) {
      setError('Login failed: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <section className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Email/Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <a href="#register">Register here</a>
      </p>
      <p style={{ marginTop: '8px' }}>
        Need help? Read the <a href="#manual">User Manual</a>.
      </p>
    </section>
  )
}
