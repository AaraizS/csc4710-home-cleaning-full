import React, { useState } from 'react'
import {
  frequentClients, uncommittedClients, acceptedQuotes,
  prospectiveClients, largestJob, overdueBills, badClients, goodClients,
  enableClaude
} from '../api'

export default function Dashboard(){
  const [out, setOut] = useState('')

  async function run(fn){
    setOut('loading...')
    try{
      const res = await fn()
      setOut(JSON.stringify(res, null, 2))
    }catch(err){ setOut(err.toString()) }
  }

  return (
    <section>
      <h2>Dashboard</h2>
      <div className="grid">
        <button onClick={()=>run(frequentClients)}>Frequent clients</button>
        <button onClick={()=>run(uncommittedClients)}>Uncommitted clients</button>
        <button onClick={()=>run(()=>acceptedQuotes(new Date().getFullYear(), new Date().getMonth()+1))}>This month's accepted quotes</button>
        <button onClick={()=>run(prospectiveClients)}>Prospective clients</button>
        <button onClick={()=>run(largestJob)}>Largest job</button>
        <button onClick={()=>run(overdueBills)}>Overdue bills</button>
        <button onClick={()=>run(badClients)}>Bad clients</button>
        <button onClick={()=>run(goodClients)}>Good clients</button>
        <button onClick={async ()=>{ setOut('enabling...'); const r = await enableClaude(); setOut(JSON.stringify(r, null, 2)) }}>Enable Claude Haiku for all clients</button>
      </div>
      <pre className="output">{out}</pre>
    </section>
  )
}
