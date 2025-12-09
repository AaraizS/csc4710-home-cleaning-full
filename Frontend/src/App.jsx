// Frontend Application - Home Cleaning Service Management System
import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Request from './pages/Request'
import Quotes from './pages/Quotes'
import Bills from './pages/Bills'
import Dashboard from './pages/Dashboard'

const PAGES = {
  home: 'home',
  login: 'login',
  register: 'register',
  request: 'request',
  quotes: 'quotes',
  bills: 'bills',
  dashboard: 'dashboard'
}

export default function App(){
  const [page, setPage] = useState(PAGES.home)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(()=>{
    function onHash(){
      const h = window.location.hash.replace('#','')
      if(h && Object.values(PAGES).includes(h)) setPage(h)
      else setPage(PAGES.home)
    }
    window.addEventListener('hashchange', onHash)
    onHash()
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  function handleLogin(userData) {
    setUser(userData)
    setIsAdmin(userData.role === 'ADMIN')
    setPage(PAGES.home)
  }

  function handleLogout() {
    setUser(null)
    setIsAdmin(false)
    setPage(PAGES.home)
  }

  if (!user) {
    return (
      <div className="app">
        <header>
          <h1>Anna Johnson - Home Cleaning</h1>
        </header>
        <main>
          {page === PAGES.register && <Register />}
          {(page === PAGES.home || page === PAGES.login) && <Login onLogin={handleLogin} />}
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>Anna Johnson - Home Cleaning</h1>
        <nav>
          <a href="#home">Home</a>
          {!isAdmin && <a href="#request">Submit Request</a>}
          {!isAdmin && <a href="#quotes">Quotes</a>}
          {!isAdmin && <a href="#bills">Bills</a>}
          {isAdmin && <a href="#dashboard">Dashboard</a>}
          <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout ({isAdmin ? 'Admin' : 'Client'})</button>
        </nav>
      </header>

      <main>
        {page === PAGES.home && (
          <section>
            <h2>Welcome, {isAdmin ? 'Anna' : 'Client'}!</h2>
            <p>{isAdmin ? 'View dashboard and manage operations' : 'Submit requests, view quotes, and pay bills'}</p>
          </section>
        )}

        {!isAdmin && page === PAGES.request && <Request />}
        {!isAdmin && page === PAGES.quotes && <Quotes />}
        {!isAdmin && page === PAGES.bills && <Bills />}
        {isAdmin && page === PAGES.dashboard && <Dashboard />}
      </main>

      <footer>
        <small>Demo frontend - User: {user.role}, ID: {user.client_id}</small>
      </footer>
    </div>
  )
    </div>
  )
}
