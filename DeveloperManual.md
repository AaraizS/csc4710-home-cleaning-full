# Developer Manual – Anna Johnson Home Cleaning System

## 1. Overview

This project is a full-stack web application for managing a home cleaning business. It supports:

- **Clients**: request cleanings, view quotes, manage bills.
- **Admin (Anna)**: manage requests, quotes, orders, bills, and view analytics.

Tech stack:

- **Frontend**: React (Vite-style single-page app) using hash-based routing.
- **Backend**: Node.js + Express.
- **Database**: MongoDB Atlas via Mongoose.
- **Auth**: JWT-based login for client and admin accounts.

## 2. High-Level Architecture

```text
[ Browser ]
    |
    |  HTTP (fetch via ./Frontend/src/api.js)
    v
[ React Frontend ]  --JWT-->  [ Express API ]  --Mongoose-->  [ MongoDB Atlas ]
          |                            |
          |                            +--> Business logic in dbService.js
          |
          +--> UI pages (Login, Register, Request, Quotes, Bills, AdminDashboard, UserManual)
```

Key repositories and folders:

- `Frontend/` – React app (pages, components, API wrapper).
- `Backend/` – Express server, API endpoints, and database service.
- `Backend/dbService.js` – core business logic and MongoDB access.
- `Backend/api/index.js` – HTTP routes mapping to dbService.

## 3. Data Model

Defined in `Backend/dbService.js` using Mongoose schemas.

### 3.1 Client

```js
const ClientSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  address: String,
  phone: String,
  email: { type: String, unique: true },
  cc_last4: String,
  cc_token: String,
  claude_haiku_enabled: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});
```

### 3.2 UserAccount

```js
const UserAccountSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // plain or bcrypt hash
  role: { type: String, enum: ["CLIENT", "ADMIN"], default: "CLIENT" },
  client_id: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now },
});
```

### 3.3 ServiceRequest

```js
const ServiceRequestSchema = new mongoose.Schema({
  client_id: mongoose.Schema.Types.ObjectId,
  service_address: String,
  cleaning_type: String,
  num_rooms: Number,
  preferred_datetime: Date,
  proposed_budget: Number,
  notes: String,
  photos: [String],
  status: {
    type: String,
    enum: ["pending", "quote_received", "rejected", "completed"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
});
```

### 3.4 Quote

```js
const QuoteSchema = new mongoose.Schema({
  request_id: mongoose.Schema.Types.ObjectId,
  client_id: mongoose.Schema.Types.ObjectId,
  price: Number,
  time_window_start: Date,
  time_window_end: Date,
  note: String,
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "RENEGOTIATING", "RENEGOTIATED"],
    default: "PENDING",
  },
  client_note: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
```

### 3.5 ServiceOrder

```js
const ServiceOrderSchema = new mongoose.Schema({
  request_id: mongoose.Schema.Types.ObjectId,
  client_id: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ["ACCEPTED", "COMPLETED"],
    default: "ACCEPTED",
  },
  completed_at: Date,
  created_at: { type: Date, default: Date.now },
});
```

### 3.6 Bill

```js
const BillSchema = new mongoose.Schema({
  order_id: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: {
    type: String,
    enum: ["UNPAID", "PAID", "DISPUTED"],
    default: "UNPAID",
  },
  dispute_note: String,
  created_at: { type: Date, default: Date.now },
  paid_at: Date,
  due_date: Date,
});
```

## 4. Backend Structure and APIs

### 4.1 Entry Points

- `Backend/app.js` – original Express app (legacy routes, some analytics).
- `Backend/api/index.js` – main API used by the React frontend.

The React app uses `Frontend/src/api.js` to call routes defined in `api/index.js`, which in turn call methods in `dbService.js`.

### 4.2 Auth & Client APIs (api/index.js)

- `POST /auth/login`

  - Body: `{ username, password }`
  - Uses `dbService.loginUser`.
  - Returns: `{ success, token, role, client_id, username, first_name }`.
  - JWT contains: `userId, username, role, client_id, first_name`.

- `POST /clients/register`
  - Body: `{ first_name, last_name, address, phone, email, cc_last4, cc_token, password }`.
  - Uses `dbService.registerClient`.

### 4.3 Client-side Operations

- `POST /requests/new` → `dbService.createServiceRequest`
- `POST /requests/add-photo` → `dbService.addPhoto`
- `GET /quotes/client/:client_id` → fetch client quotes
- `GET /bills/client/:client_id` → `dbService.getBillsForClient`
- `POST /bills/pay` → `dbService.payBill`
- `POST /bills/dispute` → `dbService.disputeBill`

### 4.4 Admin Operations

- `GET /admin/requests` – list client requests.
- `POST /quotes/create` – create quote for a request.
- `POST /quotes/accept` – client accepts a quote (in app, triggered from frontend).
- `POST /quotes/:quoteId/resubmit` – admin responds to renegotiation (creates new quote, marks old one RENEGOTIATED).
- `GET /admin/orders` – view current service orders.
- `POST /bills/create` – create bill for an order. Also marks related order as `COMPLETED`.
- `GET /admin/bills` – list bills for admin.
- `GET /admin/analytics` – returns analytics object used in `AdminDashboard.jsx`.

Consult `Backend/api/index.js` for the precise route signatures and request/response shapes.

## 5. Analytics Logic

Implemented in `dbService.getAnalytics()` and exposed via `/admin/analytics`.

It returns an object:

```js
{
  frequent_clients: [...],
  uncommitted_clients: [...],
  monthly_quotes: [...],
  prospective_clients: [...],
  largest_jobs: [...],
  overdue_bills: [...],
  bad_clients: [...],
  good_clients: [...]
}
```

Key rules:

- **Frequent clients**: top 5 by completed order count.
- **Uncommitted clients**: 3+ requests and 0 orders.
- **This month’s accepted quotes**: `status: 'ACCEPTED'` and `created_at >= first day of current month`.
- **Prospective clients**: registered clients with 0 requests.
- **Largest jobs**: service requests with highest `num_rooms`, but only for requests whose orders have `status: 'COMPLETED'`.
- **Overdue bills**: `status: 'UNPAID'` and `due_date < now - 7 days`.
- **Bad clients**: clients with overdue unpaid bills.
- **Good clients**: clients who paid in ≤24h from bill `created_at`.

## 6. Frontend Architecture

Main shell: `Frontend/src/App.jsx`

- Manages auth state (`user`, `isAdmin`) from JWT stored in `localStorage`.
- Hash-based routing via `window.location.hash` → `PAGES` enum.
- Conditionally renders:
  - `Login`, `Register` when not authenticated.
  - `Request`, `MyRequests`, `Quotes`, `Bills` for clients.
  - `AdminDashboard` for admin.
  - `UserManual` for all.

Pages:

- `pages/Login.jsx` – login form, calls `loginUser` from `api.js`, passes user info (incl. `first_name`) to `App`.
- `pages/Register.jsx` – registration form, shows friendly success/error messages.
- `pages/Request.jsx` – submit service request.
- `pages/MyRequests.jsx` – list of client’s requests.
- `pages/Quotes.jsx` – handle quote acceptance and renegotiation.
- `pages/Bills.jsx` – bill selection, pay/dispute actions.
- `pages/AdminDashboard.jsx` – multi-tab admin UI for requests, quotes, orders, bills, and analytics.
- `pages/UserManual.jsx` – in-app user documentation.

HTTP calls are centralized in `Frontend/src/api.js`. When adding new backend endpoints, first extend `api.js`, then use the new function in page components.

## 7. Extending Functionality

### 7.1 Adding a New API Endpoint

1. **Define business logic** in `Backend/dbService.js`:

   ```js
   async newFeature(args) {
     // Use Mongoose models defined at top of dbService.js
     const Client = mongoose.model('Client', ClientSchema, 'clients')
     // implement logic
     return result
   }
   ```

2. **Expose via Express route** in `Backend/api/index.js`:

   ```js
   app.post("/feature/endpoint", async (req, res) => {
     try {
       const dbService = await getDbService();
       const result = await dbService.newFeature(req.body);
       res.json(result);
     } catch (err) {
       res.status(500).json({ success: false, error: err.message });
     }
   });
   ```

3. **Add frontend wrapper** in `Frontend/src/api.js`:

   ```js
   export async function callNewFeature(payload) {
     return post("/feature/endpoint", payload);
   }
   ```

4. **Use from a page/component** (`.jsx` file) via `await callNewFeature(...)`.

### 7.2 Adding a New Page

1. Create a new file in `Frontend/src/pages/`, e.g. `Reports.jsx`.
2. Update `PAGES` in `App.jsx` and add a `<Route>`-style conditional.
3. Add a navigation link in the `<nav>` section based on role (`isAdmin` vs client).

### 7.3 Adding/Changing Analytics

- All analytics live in `dbService.getAnalytics()`.
- Add your new metric there and include it in the `analytics` object.
- Update `AdminDashboard.jsx` to render the new field.
- When adding new numeric fields, prefer `.lean()` queries and avoid N+1 queries if performance becomes an issue.

## 8. Conventions and Gotchas

- **Status enums**:
  - Requests: `'pending' | 'quote_received' | 'rejected' | 'completed'` (lowercase).
  - Quotes: `'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RENEGOTIATING' | 'RENEGOTIATED'` (uppercase).
  - Orders: `'ACCEPTED' | 'COMPLETED'` (uppercase).
  - Bills: `'UNPAID' | 'PAID' | 'DISPUTED'` (uppercase).
- Be careful with **enum case-sensitivity** in Mongo queries.
- Use `mongoose.model('Name', Schema, 'collection_name')` with explicit collection names to avoid accidental pluralization differences.
- JWT payload is decoded manually in `App.jsx` (`atob(parts[1])`). If you change fields in `loginUser`, ensure the frontend decoding stays in sync.

## 9. Suggested Future Enhancements

- **Authentication/Authorization**:

  - Replace plain/bcrypt-mixed passwords with consistently hashed passwords and enforce password policies.
  - Add middleware to protect admin routes (`/admin/*`) using JWT verification.

- **Payments**:

  - Integrate a real payment processor instead of mock bill payments.
  - Add invoices/receipts for each payment.

- **Scheduling & Notifications**:

  - Add calendar integration and automated reminders for upcoming jobs and overdue bills.
  - Email or SMS notifications for new quotes, accepted quotes, and bill reminders.

- **Analytics Dashboard**:

  - Add date-range filters and charts.
  - Track revenue trends, average job size, and client retention rates.

- **Multi-User Admin**:

  - Support multiple staff accounts (roles: dispatcher, cleaner, admin) with role-based permissions.

- **Testing & Tooling**:
  - Add Jest tests for `dbService.js`.
  - Add frontend component tests (React Testing Library).
  - Introduce ESLint + Prettier to enforce code style.

## 10. Getting Started for Developers

### 10.1 Prerequisites

- Node.js and npm installed.
- MongoDB Atlas connection string configured in `Backend/.env` via `MONGO_URI`.

### 10.2 Running Backend

```bash
cd Backend
npm install
npm start
```

### 10.3 Running Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend expects the backend API to be available at the configured base URL in `Frontend/src/api.js` (e.g., `http://localhost:5052` for local dev or the deployed Vercel URL).

---

This manual should give future developers enough context to navigate the codebase, extend APIs and UI features, and safely enhance analytics and workflows.
