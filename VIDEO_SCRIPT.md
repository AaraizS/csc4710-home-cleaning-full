# Home Cleaning Service Management System - Video Demo Script
## 20-30 Minute Presentation

---

## PART 1: INTRODUCTION & SYSTEM OVERVIEW (2-3 minutes)

### Speaker: [Partner 1]

**[Start Recording]**

**Intro:**
"Hello, this is [Name]. Together with my partner [Partner Name], we're presenting the Home Cleaning Service Management System, a comprehensive full-stack web application built for managing cleaning service requests, quotes, orders, bills, and business analytics.

This system serves two main user roles:
- **Clients** who can submit cleaning service requests, receive and negotiate quotes, and manage their bills
- **Admin (Anna Johnson)** who can manage all client requests, create quotes, track orders, generate bills, and analyze business metrics

The system is built with:
- **React** frontend with modern UI
- **Node.js/Express** backend API
- **MongoDB** cloud database
- **JWT-based authentication** for secure login

Let me demonstrate the full functionality by walking through real-world workflows. For each key feature, I'll show you how data flows through the system, then update the database and show how the results change."

---

## PART 2: SYSTEM SETUP & DATABASE OVERVIEW (2 minutes)

### Speaker: [Partner 1]

**[Continue Recording]**

"First, let me show you our database schema. We have 6 main entities connected by relationships:

1. **CLIENTS** - Customer information (name, email, address, payment details)
2. **USER_ACCOUNTS** - Login credentials with role-based access (CLIENT or ADMIN)
3. **SERVICE_REQUESTS** - Cleaning requests submitted by clients
4. **QUOTES** - Pricing proposals from admin for specific requests
5. **SERVICE_ORDERS** - Confirmed orders when a client accepts a quote
6. **BILLS** - Invoices for completed orders

The workflow is: Client submits request → Admin creates quote → Client accepts quote → Work completed → Bill created → Payment processed"

**[Show the ER_DIAGRAM_AND_SCHEMA.md file with Chen notation diagram]**

"Here's our Entity-Relationship diagram using Chen notation. You can see the one-to-many relationships between entities. Now let's see this in action."

---

## PART 3: DEMONSTRATE CLIENT WORKFLOW (6-7 minutes)

### Speaker: [Partner 1]

**[Continue Recording]**

### 3.1: Client Registration & Login

"Let's start by registering a new client. I'll create a client account with basic information."

**[Navigate to Registration page and show form]**

"Here's the registration form. Let me fill it with client details:
- Name: John Smith
- Email: john.smith@email.com
- Address: 456 Oak Street
- Phone: 555-0234
- Credit Card: 1234

[PAUSE RECORDING to complete registration and verify data in database]
[RESUME RECORDING]

Great! The client 'john.smith' has been registered. Now let me log in as this client."

**[Login with john.smith credentials]**

"After login, the client sees their personalized dashboard with options to submit new requests, view existing quotes, and manage bills."

### 3.2: Submit Service Request - First Example

"Let me submit a cleaning service request. I'll click 'New Request'."

**[Navigate to Request page, show form]**

"Here's what a service request looks like:
- Service Address: 456 Oak Street, Suite 3
- Cleaning Type: Deep Cleaning
- Number of Rooms: 3
- Preferred Date/Time: Tomorrow at 10 AM
- Proposed Budget: $300
- Special Notes: Pet-friendly products please

[PAUSE - Complete form submission]
[RESUME RECORDING]

Perfect! The request has been created with status 'PENDING'. Now let me show what happens on the admin side. Let me log out and switch to the admin account."

**[Logout and Login as Admin - anna/password]**

### 3.3: Admin Views All Requests

"Now I'm logged in as Anna (the admin). Let me check the Admin Dashboard to see all incoming requests."

**[Navigate to Admin Dashboard → Requests section]**

"Here's John Smith's request that we just created:
- Service Address: 456 Oak Street, Suite 3
- Cleaning Type: Deep Cleaning
- 3 Rooms
- Status: PENDING
- Created just moments ago

As the admin, I can now create a quote for this request. Let me click to create a quote."

### 3.4: Admin Creates Quote for Request

**[Click to create quote]**

"Here's the quote form:
- Price: $280 (slightly lower than proposed budget)
- Time Window: Tomorrow 10:00 AM to 12:00 PM (2-hour window)
- Note: 'We'll use eco-friendly products. 2 cleaners for faster service'

[PAUSE - Create quote]
[RESUME RECORDING]

The quote has been created with status 'PENDING'. Now let me go back to the client view to show how John sees this quote."

### 3.5: Client Views Quote and Accepts

**[Logout and Login as Client - john.smith]**

"Now I'm back as John (the client). Let me go to the Quotes section to see Anna's quote."

**[Navigate to Quotes]**

"Great! Here's the quote Anna created:
- Price: $280
- Time Window: Tomorrow 10:00 AM - 12:00 PM
- Note: 'We'll use eco-friendly products. 2 cleaners for faster service'
- Status: PENDING (waiting for my response)

I'm happy with this quote, so let me accept it by clicking the Accept button."

**[Click Accept]**

"Perfect! The quote status has changed from PENDING to ACCEPTED. Behind the scenes, this action:
1. Updates the quote status to ACCEPTED
2. Creates a SERVICE_ORDER with status ACCEPTED
3. Updates the original request status to quote_received

The job is now confirmed and ready for the admin to complete."

---

## PART 4: DEMONSTRATE ORDER COMPLETION & BILLING (6-7 minutes)

### Speaker: [Partner 2 - takes over]

**[Partner 2 comes in]**

"Thanks [Partner 1]. Now let me continue with the order completion and billing process. Let me switch to the admin view to mark the order as completed and create the bill."

**[Logout and Login as Admin]**

### 4.1: Admin Marks Order as Completed

"I'm now logged in as Anna (admin). Let me go to the Orders section to see the confirmed order."

**[Navigate to Admin Dashboard → Orders]**

"Here's John's order that was created when he accepted the quote:
- Request ID: from John's deep cleaning request
- Status: ACCEPTED
- Amount quoted: $280
- Created: [timestamp]

After the cleaning work is completed, I need to mark this order as COMPLETED. Let me click the Complete button."

**[Click Complete Order button]**

"[PAUSE - Mark order complete]
[RESUME RECORDING]

Excellent! The order status has changed from ACCEPTED to COMPLETED. The completed_at timestamp has been recorded. Now I can create a bill for this work."

### 4.2: Admin Creates Bill

"Now let me create the bill. I'll navigate to the Bills section."

**[Navigate to Bills section]**

"Let me click to create a new bill for the completed order."

**[Click Create Bill]**

"The bill creation form shows:
- Order ID: the completed order
- Amount: $280 (from the quote)
- Status: UNPAID (default)
- Due Date: 7 days from today

Let me create this bill."

**[PAUSE - Create bill]
[RESUME RECORDING]

Perfect! A new bill has been created with status UNPAID. The amount is $280, and the due date is 7 days from today. Now let me show how the client sees this bill."

### 4.3: Client Views and Pays Bill

**[Logout and Login as Client - john.smith]**

"I'm back as John. Let me go to my Bills section to see the invoice."

**[Navigate to Bills]**

"Here's the bill Anna created:
- Bill ID: [shows ID]
- Amount: $280
- Status: UNPAID
- Due Date: [7 days from now]
- Created: [timestamp]

Now I'll pay this bill by clicking the Pay button."

**[Click Pay Bill]**

"[PAUSE - Process payment]
[RESUME RECORDING]

Great! The bill status has changed from UNPAID to PAID, and the paid_at timestamp shows the exact time of payment. The workflow is complete:

Request submitted → Quote created → Quote accepted → Order completed → Bill paid

Let me now show you what happens if a client disputes a bill. Let me create another complete workflow with a disputed bill."

---

## PART 5: DEMONSTRATE QUOTE RENEGOTIATION (4-5 minutes)

### Speaker: [Partner 2]

**[Continue Recording as Client - john.smith]**

"Let me create a second service request to demonstrate the quote renegotiation feature. This is important because clients might want to negotiate pricing or terms."

**[Navigate to submit new Request]**

"Let me submit another request:
- Service Address: 456 Oak Street, Suite 4
- Cleaning Type: Regular Cleaning
- Number of Rooms: 2
- Preferred Date: Next week
- Proposed Budget: $150
- Notes: Weekly recurring service preferred

[PAUSE - Submit request]
[RESUME RECORDING]

Request submitted. Now let me switch to admin to create a quote with a higher price to demonstrate renegotiation."

**[Logout and Login as Admin]**

### 5.1: Admin Creates Quote (Higher Price)

"I'm logged in as Anna. Let me view the new request and create a quote."

**[Navigate to Requests]**

"Here's John's second request for a 2-room regular cleaning. Let me create a quote."

**[Create Quote]**

"I'll quote $200, which is above the proposed budget of $150. This will test if John wants to renegotiate.
- Price: $200
- Time Window: Next week 2 PM - 4 PM
- Note: 'Professional team with eco-friendly supplies'

[PAUSE - Create quote]
[RESUME RECORDING]

Quote created at $200. Now let's see how the client responds."

### 5.2: Client Renegotiates Quote

**[Logout and Login as Client - john.smith]**

"As John, I see the new quote for $200, but the proposed budget was $150. I want to negotiate. Let me click Renegotiate."

**[Click Renegotiate/Counter-offer button]**

"I'll submit a counter-offer:
- My proposed price: $180
- Message: 'Can you do $180? This is for recurring weekly service, so there might be future jobs.'

[PAUSE - Submit renegotiation]
[RESUME RECORDING]

My counter-offer has been submitted. The quote status is now RENEGOTIATING. Let me switch back to admin to see how Anna responds."

### 5.3: Admin Responds to Renegotiation

**[Logout and Login as Admin]**

"As Anna, I see the client's counter-offer to reduce the price to $180. I think that's fair for weekly recurring service. Let me resubmit a new quote at that price."

**[Navigate to renegotiating quote]**

"Here's the renegotiation request from John:
- His counter-offer: $180
- His message: 'Can you do $180? This is for recurring weekly service, so there might be future jobs.'

Let me create a new quote at his requested price.
- Price: $180
- Same time window
- Note: 'Agreed! Special rate for recurring weekly service.'

[PAUSE - Resubmit quote]
[RESUME RECORDING]

I've resubmitted the quote at $180. The previous quote is now marked RENEGOTIATED, and a new quote has been created at the client's requested price. The client can now accept this new quote."

---

## PART 6: DEMONSTRATE BILL DISPUTES & ANALYTICS (5-6 minutes)

### Speaker: [Partner 1 - takes back]

**[Partner 1 takes over]**

**[Logout and Login as Client - john.smith]**

"Let me now demonstrate the bill dispute feature and then show the admin analytics. First, let me accept the renegotiated quote."

**[Navigate to Quotes]**

"I'll accept the new quote at $180."

**[Click Accept]**

"[PAUSE - Accept quote]
[RESUME RECORDING]

Quote accepted! Service order created. Now let me switch to admin to complete this order and create a bill, which I'll then dispute."

### 6.1: Admin Completes Order and Creates Bill

**[Logout and Login as Admin]**

"As Anna, let me mark the new order as completed and create a bill."

**[Navigate to Orders, mark complete, create bill]**

"[PAUSE - Complete workflow]
[RESUME RECORDING]

Bill created for $180. Now let me switch back to the client to show a dispute scenario."

### 6.2: Client Disputes Bill

**[Logout and Login as Client - john.smith]**

"I'm back as John. Let me check my bills."

**[Navigate to Bills]**

"Here's the new bill for $180. Suppose there was an issue with the service - maybe they cancelled without notice. Let me dispute this bill by clicking the Dispute button."

**[Click Dispute Bill]**

"I'll add a dispute note explaining the issue:
'Service was cancelled with only 1 hour notice. I had arranged my schedule around the appointment. Please credit account or reduce bill to $90.'

[PAUSE - Submit dispute]
[RESUME RECORDING]

The bill status has changed from UNPAID to DISPUTED, and my note is recorded."

### 6.3: Admin Views Analytics

**[Logout and Login as Admin]**

"Now let me show you the comprehensive analytics dashboard that helps Anna manage her business. Let me go to the Analytics section."

**[Navigate to Admin Dashboard → Analytics]**

"The analytics provide several key business insights:

**1. Frequent Clients** (Top 5 clients by completed orders)
- Lists clients who have completed the most orders
- Helps identify loyal customers
- Current result shows our activity so far

**2. Uncommitted Clients** (3+ requests, 0 orders)
- Clients who've submitted multiple requests but haven't placed any orders
- This might indicate problems with quoting or pricing

**3. This Month's Accepted Quotes**
- All quotes that were accepted in the current month
- Tracks confirmed work pipeline

**4. Prospective Clients** (Registered but no requests)
- New clients who signed up but haven't submitted any service requests
- Good for follow-up marketing

**5. Largest Jobs** (By number of rooms)
- Shows the biggest cleaning projects among completed orders
- Useful for planning resource allocation

**6. Overdue Bills** (Unpaid, >1 week old)
- Bills that haven't been paid and are past due date
- Helps with accounts receivable management

**7. Bad Clients** (Overdue unpaid bills)
- Clients with multiple unpaid overdue bills
- Indicates potential payment issues

**8. Good Clients** (Paid within 24 hours)
- Reliable clients who pay promptly
- Recognizes best customers for relationship management

Let me scroll through to show you current data from our demonstration."

**[Show each analytics view with current data]**

"This dashboard gives Anna a complete picture of her business health - from revenue tracking to customer relationship management."

---

## PART 7: DEMONSTRATE EDGE CASES & ERROR HANDLING (3-4 minutes)

### Speaker: [Partner 2]

**[Partner 2 continues]**

**[Login as a test client or create new one]**

"Now let me demonstrate some important error handling and edge cases in our system.

**Error Case 1: Duplicate Email Registration**

Let me try to register a new account with an email that already exists."

**[Navigate to Register]**

"I'll use John Smith's email: john.smith@email.com, but different username."

**[Attempt registration]**

"[PAUSE - Try to register]
[RESUME RECORDING]

The system correctly rejected the registration with an error message: 'Email already registered.' This prevents duplicate accounts and protects data integrity."

**Error Case 2: Invalid Login Credentials**

"Let me try logging in with an incorrect password."

**[Attempt login with wrong password]**

"[PAUSE - Try login]
[RESUME RECORDING]

The system rejects invalid credentials with: 'Invalid username or password.' This ensures only authorized users can access accounts."

**Error Case 3: Unauthorized Access**

"Let me demonstrate that clients can only see their own data. If I'm logged in as john.smith, I should not be able to see another client's requests or bills."

**[Navigate to any attempted unauthorized access]**

"The system ensures that:
- Clients only see their own service requests
- Clients only see their own quotes and bills
- Only admin can view all requests and analytics
- JWT tokens validate user identity and role on every request

This prevents information leakage and unauthorized access."

**Error Case 4: Invalid State Transitions**

"The system also prevents invalid workflow transitions. For example:
- You can't accept a quote that's already accepted
- You can't mark an order complete twice
- You can't create a bill for an incomplete order

The database constraints and API validation ensure data consistency throughout the workflow."

**[Show at least one attempt at invalid operation]**

---

## PART 8: DEMONSTRATE SQL QUERIES (3-4 minutes)

### Speaker: [Partner 1]

**[Switch to showing SQL query execution in database client/tool]**

"Now let me demonstrate some of the key SQL queries that power this system. These queries drive the analytics and business logic."

### Query 1: Frequent Clients

**[Show query and results in database tool]**

```sql
SELECT c.client_id, c.first_name, c.last_name, COUNT(o.order_id) AS order_count
FROM service_orders o
JOIN clients c ON o.client_id = c.client_id
WHERE o.status = 'COMPLETED'
GROUP BY c.client_id, c.first_name, c.last_name
ORDER BY order_count DESC
LIMIT 5;
```

"This query identifies our top 5 clients by number of completed orders.

[PAUSE - Make sure there are some completed orders]
[RESUME RECORDING]

The query joins CLIENTS with SERVICE_ORDERS, filters for completed orders, groups by client, and sorts by order count descending. This helps identify loyal customers.

Current result shows: [Describe current output - showing which clients have completed the most orders]

Now let me update the database by completing another order..."

**[PAUSE - Complete another order in the application]**
[RESUME RECORDING]

"Now when I run the query again, the results have changed. [Client name] now appears in the results, or their count has increased, demonstrating how the query adapts to real-time data changes."

### Query 2: Overdue Bills

**[Show next query]**

```sql
SELECT b.* FROM bills b
WHERE b.status = 'UNPAID'
AND b.due_date < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

"This query finds unpaid bills that are overdue by more than 7 days. It helps Anna track accounts receivable.

Current result: [Shows unpaid overdue bills, or shows empty if all bills are current]

Let me create a test scenario. I'll update a bill's due_date to make it overdue..."

**[PAUSE - Manually update a bill's due_date in the database to simulate an old bill]**
[RESUME RECORDING]

"Now when I run the query again, you can see it returns the updated bill as overdue. This demonstrates how the query correctly identifies bills that need collection."

### Query 3: This Month's Accepted Quotes

**[Show query]**

```sql
SELECT q.* FROM quotes q
WHERE q.status = 'ACCEPTED'
AND q.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01');
```

"This query shows all quotes accepted in the current month - representing confirmed work coming up.

Current result: [Shows accepted quotes from this month]

We've already created and accepted several quotes, so this should show multiple records. Let me create one more quote and accept it to show how the results update..."

**[PAUSE - In application, create new quote and accept it]**
[RESUME RECORDING]

"Now the query shows an additional accepted quote. This gives Anna visibility into her confirmed revenue for the month."

### Query 4: Uncommitted Clients

**[Show query]**

```sql
SELECT c.client_id, c.first_name, c.last_name, COUNT(r.request_id) AS request_count
FROM clients c
LEFT JOIN service_requests r ON r.client_id = c.client_id
LEFT JOIN service_orders o ON o.client_id = c.client_id
GROUP BY c.client_id, c.first_name, c.last_name
HAVING COUNT(r.request_id) >= 3 AND COUNT(o.order_id) = 0;
```

"This identifies clients who've submitted 3+ requests but haven't placed any orders. These are potential lost sales.

Current result: [Shows any clients with multiple requests and no orders, or empty if all committed clients]

If we had a client with multiple requests but no orders, they would appear here. This helps Anna follow up with customers who are interested but haven't committed yet."

### Query 5: Good Clients (Prompt Payers)

**[Show query]**

```sql
SELECT c.client_id, c.first_name, c.last_name, COUNT(b.bill_id) AS on_time_count
FROM bills b
JOIN service_orders o ON b.order_id = o.order_id
JOIN clients c ON o.client_id = c.client_id
WHERE b.status = 'PAID'
AND TIMESTAMPDIFF(HOUR, b.created_at, b.paid_at) <= 24
GROUP BY c.client_id, c.first_name, c.last_name;
```

"This identifies clients who pay their bills within 24 hours - the 'good clients' who are prompt payers.

Current result: [Shows John Smith if his bills were paid quickly, or others based on actual data]

Let me show how this updates when a bill is paid. Let me create another bill and pay it to update this result..."

**[PAUSE - Create another complete request→quote→accept→complete→bill→pay workflow]**
[RESUME RECORDING]

"Now when I run the query again, you can see the results update. If John Smith paid within 24 hours, his on_time_count increases, showing he's a reliable customer."

---

## PART 9: SUMMARY & KEY FEATURES (1-2 minutes)

### Speaker: [Both Partners]

**[Continue Recording]**

"To summarize, this Home Cleaning Service Management System demonstrates:

**Core Features:**
- Complete user authentication with JWT tokens
- Role-based access control (CLIENT vs ADMIN)
- Full service request workflow from submission to completion
- Quote management with negotiation capability
- Order tracking and completion
- Bill generation and payment processing
- Comprehensive business analytics

**Database Features:**
- 6 interconnected entities with proper relationships
- Referential integrity through foreign keys
- Status enum fields to manage workflow states
- Timestamps for audit trails and analytics
- Support for complex business logic queries

**API & Architecture:**
- RESTful API endpoints for all operations
- Secure JWT-based authentication
- Mongoose/MongoDB for flexible data persistence
- React frontend with intuitive user interface
- Proper separation of concerns (controllers, services, views)

**Error Handling:**
- Input validation on all forms
- Database constraint enforcement
- Proper error messages for user guidance
- Prevention of invalid state transitions

The system successfully manages the complete lifecycle of a cleaning service business, from client acquisition through payment collection, with comprehensive analytics to support business decisions.

Thank you for watching this demonstration of the Home Cleaning Service Management System!"

**[Stop Recording]**

---

## TIMING BREAKDOWN (Total: 25-30 minutes)

| Section | Duration | Cumulative |
|---------|----------|-----------|
| 1. Introduction | 2-3 min | 2-3 min |
| 2. Database Overview | 2 min | 4-5 min |
| 3. Client Workflow | 6-7 min | 10-12 min |
| 4. Order & Billing | 6-7 min | 16-19 min |
| 5. Quote Renegotiation | 4-5 min | 20-24 min |
| 6. Disputes & Analytics | 5-6 min | 25-30 min |
| 7. Error Handling | 3-4 min | 28-34 min |
| 8. SQL Queries | 3-4 min | 31-38 min |
| 9. Summary | 1-2 min | 32-40 min |

**Note:** The script is designed for 25-30 minutes of pure presentation. The bracketed [PAUSE] sections allow time for the housekeeping work (updating database, creating additional data) without extending video time.

---

## PRE-RECORDING CHECKLIST

Before you start recording:

- [ ] Ensure the application is running on localhost
- [ ] Have at least 2-3 test client accounts ready
- [ ] Have admin account ready and tested
- [ ] Database is accessible and contains sample data
- [ ] SQL client tool is open and ready to execute queries
- [ ] Screen resolution is 1920x1080 or higher for clarity
- [ ] Close all unnecessary browser tabs and applications
- [ ] Have the script visible (printed or on second monitor)
- [ ] Test microphone audio quality
- [ ] Disable notifications and system popups

---

## DELIVERY TIPS

1. **Speak clearly and at a moderate pace** - viewers should understand all terminology
2. **Describe what you're seeing** - don't assume the viewer will understand without explanation
3. **Show both old and new results** for each query/action as required
4. **Use the pause function** - housekeeping work doesn't need to be recorded
5. **Practice transitions** between partners to ensure smooth handoff
6. **Highlight the data changes** - explain how the new result differs from the old result
7. **Keep the focus on functionality** - don't show source code or technical details beyond SQL
8. **Be ready for questions** - both partners should understand the entire system

