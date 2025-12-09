import React from 'react'

export default function UserManual(){
  return (
    <section style={{maxWidth: 900}}>
      <h2>User Manual</h2>
      <p>This guide explains how clients and admins (Anna) use the Home Cleaning Service website to request cleanings, manage quotes and bills, and review analytics.</p>

      <h3>Overview</h3>
      <ul>
        <li><strong>Clients:</strong> Register, submit service requests, review and accept/renegotiate quotes, and pay or dispute bills.</li>
        <li><strong>Admin (Anna):</strong> Manage requests, send quotes, complete orders, create and track bills, and monitor analytics.</li>
      </ul>

      <h3>Getting Started (Clients)</h3>
      <ol>
        <li><strong>Register:</strong> From the Login page click “Register here”, complete the form, then submit.</li>
        <li><strong>Login:</strong> Enter your email/username and password on the Login page.</li>
        <li><strong>Welcome:</strong> After logging in, the Home page greets you by your first name.</li>
      </ol>

      <h3>Client Features</h3>
      <h4>Submit a Service Request</h4>
      <ul>
        <li>Go to <strong>Submit Request</strong>.</li>
        <li>Provide address, cleaning type, number of rooms, schedule preference, budget, and notes/photos (optional).</li>
        <li>Submit to notify Anna.</li>
      </ul>

      <h4>Track Your Requests</h4>
      <ul>
        <li>Open <strong>My Requests</strong> to see all requests and their status.</li>
        <li>Status examples: <em>pending</em>, <em>quote_received</em>, <em>rejected</em>, <em>completed</em>.</li>
      </ul>

      <h4>Review Quotes</h4>
      <ul>
        <li>Open <strong>Quotes</strong> to view quotes for your requests.</li>
        <li>You can <strong>accept</strong> a quote or <strong>renegotiate</strong> (send a counter request with notes).</li>
      </ul>

      <h4>Manage Bills</h4>
      <ul>
        <li>Open <strong>Bills</strong> to see your current and past bills.</li>
        <li>Select a bill to <strong>pay</strong> securely (amount shown), or <strong>dispute</strong> with a note.</li>
        <li>Bill status colors: <span style={{background:'#d4edda', padding:'2px 6px'}}>PAID</span>, <span style={{background:'#fff3cd', padding:'2px 6px'}}>DISPUTED</span>, <span style={{background:'#f8d7da', padding:'2px 6px'}}>UNPAID</span>.</li>
      </ul>

      <h3>Admin (Anna) Workflow</h3>
      <p>Go to <strong>Dashboard</strong> to manage operations. Tabs include:</p>
      <ul>
        <li><strong>Requests:</strong> View incoming client requests and create quotes.</li>
        <li><strong>Quotes:</strong> Track quote status and respond to renegotiations.</li>
        <li><strong>Orders:</strong> Manage accepted jobs. When you create a bill, the related order is marked <em>COMPLETED</em>.</li>
        <li><strong>Bills:</strong> Create client bills from completed orders and track payment/disputes.</li>
        <li><strong>Analytics:</strong> Operational insights described below.</li>
      </ul>

      <h4>Analytics Explained</h4>
      <ul>
        <li><strong>Frequent Clients:</strong> Top clients by completed order count.</li>
        <li><strong>Uncommitted Clients:</strong> Clients with 3+ requests but 0 orders.</li>
        <li><strong>Accepted Quotes (This Month):</strong> Quotes accepted since the 1st of the current month.</li>
        <li><strong>Prospective Clients:</strong> Registered clients who haven’t submitted any requests.</li>
        <li><strong>Largest Jobs:</strong> Requests with the most rooms among <em>completed orders</em>.</li>
        <li><strong>Overdue Bills:</strong> Bills that are UNPAID and older than one week.</li>
        <li><strong>Bad Clients:</strong> Clients with overdue unpaid bills.</li>
        <li><strong>Good Clients:</strong> Clients who paid within 24 hours of bill creation.</li>
      </ul>

      <h3>Navigation Tips</h3>
      <ul>
        <li>Use the top navigation bar to jump between pages.</li>
        <li>Clients see: Home, Submit Request, My Requests, Quotes, Bills.</li>
        <li>Admin sees: Home, Dashboard.</li>
        <li>The <strong>User Manual</strong> is always accessible from navigation.</li>
      </ul>

      <h3>Troubleshooting</h3>
      <ul>
        <li><strong>Can’t log in:</strong> Check your credentials or register a new account.</li>
        <li><strong>No quotes showing:</strong> Ensure you submitted a request; Anna must send a quote first.</li>
        <li><strong>Payment issues:</strong> If a payment fails, try again or dispute the bill with details.</li>
      </ul>

      <h3>Support</h3>
      <p>For help, contact Anna via the provided support channel in your confirmation emails.</p>

      <h3>Privacy & Security</h3>
      <ul>
        <li>Your account requires a password. Keep it secure and don’t share it.</li>
        <li>Payment information is handled securely; only the last 4 digits are stored for reference.</li>
      </ul>
    </section>
  )
}
