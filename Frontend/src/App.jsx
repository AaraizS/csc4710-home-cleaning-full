import React, { useState, useEffect } from 'react'
import Register from './pages/Register'
import Request from './pages/Request'
import Quotes from './pages/Quotes'
import Dashboard from './pages/Dashboard'

const PAGES = {
  home: 'home',
  register: 'register',
  request: 'request',
  quotes: 'quotes',
  dashboard: 'dashboard'
}

export default function App(){
  const [page, setPage] = useState(PAGES.home)

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

  return (
    <div className="app">
      <header>
        <h1>Anna Johnson - Home Cleaning</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#register">Register</a>
          <a href="#request">Submit Request</a>
          <a href="#quotes">Quotes</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
      </header>

      <main>
        {page === PAGES.home && (
          <section>
            <h2>Welcome</h2>
            <p>Use the navigation to exercise the backend API.</p>
          </section>
        )}

        {page === PAGES.register && <Register />}
        {page === PAGES.request && <Request />}
        {page === PAGES.quotes && <Quotes />}
        {page === PAGES.dashboard && <Dashboard />}
      </main>

      <footer>
        <small>Demo frontend talking to backend at <code>http://localhost:5052</code></small>
      </footer>
    </div>
  )
}
