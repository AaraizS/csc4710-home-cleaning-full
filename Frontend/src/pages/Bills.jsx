import React, { useState } from 'react'
import { payBill, disputeBill } from '../api'

export default function Bills(){
  const [out, setOut] = useState('')
  const [billId, setBillId] = useState('')
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState('pay')
  const [disputeNote, setDisputeNote] = useState('')

  async function handleBillAction(e){
    e.preventDefault()
    try{
      if (action === 'pay') {
        const res = await payBill({ bill_id: billId, client_id: '', amount: Number(amount) })
        setOut(JSON.stringify(res, null, 2))
      } else if (action === 'dispute') {
        const res = await disputeBill({ bill_id: billId, note: disputeNote })
        setOut(JSON.stringify(res, null, 2))
      }
      setBillId('')
      setAmount('')
      setDisputeNote('')
    }catch(err){ setOut(err.toString()) }
  }

  return (
    <section>
      <h2>Manage Bills</h2>
      <button onClick={() => window.location.hash = '#home'} style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
      <form onSubmit={handleBillAction} style={{maxWidth:'500px'}}>
        <label>Bill ID: <input value={billId} onChange={(e) => setBillId(e.target.value)} required /></label><br />
        
        <label>Action:
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="pay">Pay Bill</option>
            <option value="dispute">Dispute Bill</option>
          </select>
        </label><br />

        {action === 'pay' && (
          <label>Amount: <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
        )}

        {action === 'dispute' && (
          <label>Dispute Note: <textarea value={disputeNote} onChange={(e) => setDisputeNote(e.target.value)} required></textarea></label>
        )}
        <br />
        
        <button type="submit">{action === 'pay' ? 'Pay Bill' : 'Dispute Bill'}</button>
      </form>
      <pre className="output">{out}</pre>
    </section>
  )
}
