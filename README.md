# Anna Johnson - Home Cleaning Service Management System

A full-stack web application for managing home cleaning service requests, quotes, orders, bills, and analytics.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation & Configuration](#installation--configuration)
5. [Running the Project](#running-the-project)
6. [Project Structure](#project-structure)
7. [Key Features Walkthrough](#key-features-walkthrough)
8. [Documentation](#documentation)
9. [Contributions](#contributions)

---

## Overview

This system is designed for a home cleaning business owner (Anna Johnson) and her clients:

- **Clients** can submit cleaning requests, view and accept/renegotiate quotes, and manage bills.
- **Admin (Anna)** can view all requests, send quotes, complete orders, create bills, and monitor analytics.

The app uses **JWT-based authentication**, **Mongoose/MongoDB** for data persistence, and **React** for the frontend UI.

---

## Features

### Client Features

- **User Registration & Login** – Secure account creation and authentication.
- **Submit Service Requests** – Specify cleaning type, room count, preferred schedule, and budget.
- **View Requests** – Track all submitted requests and their statuses.
- **View & Manage Quotes** – Accept quotes or submit counter-offers (renegotiate).
- **Bill Management** – View bills, pay securely, or dispute with notes.

### Admin Features (Anna)

- **Request Management** – View all incoming client requests.
- **Quote Management** – Create, send, and respond to quote renegotiations.
- **Order Tracking** – Monitor accepted jobs and mark them as completed.
- **Bill Creation & Tracking** – Create bills for completed orders and track payments/disputes.
- **Comprehensive Analytics** – Insights on frequent clients, uncommitted clients, overdue bills, bad clients, good clients, largest jobs, and prospective clients.

### General Features

- **In-App User Manual** – Professional user guide accessible from login and post-login screens.
- **Responsive Design** – Works on desktop and mobile devices.
- **JWT-Based Auth** – Secure token-based authentication with 24-hour expiry.

---

## Tech Stack

### Frontend

- **Framework**: React 18 with Vite
- **Routing**: Hash-based (client-side routing)
- **HTTP Client**: Fetch API
- **Styling**: CSS (included in App.jsx)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

### Deployment

- **Frontend**: Vercel (auto-deploy from GitHub main branch)
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas (cloud)

---

## Installation & Configuration

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

### Clone the Repository

```bash
git clone https://github.com/AaraizS/csc4710-home-cleaning-full.git
cd csc4710-home-cleaning-full
```

### Backend Setup

1. **Navigate to the Backend directory:**

   ```bash
   cd Backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `Backend` directory with:

   ```
   PORT=5052
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   ```

   Replace:

   - `<username>` and `<password>` with your MongoDB Atlas credentials.
   - `<cluster>` with your cluster name.
   - `<database>` with your database name (e.g., `test` or `Project2`).
   - `your-secret-key-here` with a strong random string.

4. **Verify MongoDB connection:**
   ```bash
   npm start
   ```
   You should see output like: `Server running on http://localhost:5052`

### Frontend Setup

1. **Navigate to the Frontend directory:**

   ```bash
   cd ../Frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure API base URL (if needed):**
   Open `Frontend/src/api.js` and ensure the `API_BASE` constant points to your backend:
   ```js
   const API_BASE = "http://localhost:5052"; // for local dev
   // or
   const API_BASE = "https://your-vercel-backend.vercel.app"; // for production
   ```

---

## Running the Project

### Local Development (Both Backend and Frontend)

**Terminal 1 – Backend:**

```bash
cd Backend
npm start
```

Expected output:

```
Server running on http://localhost:5052
Connected to MongoDB
```

**Terminal 2 – Frontend:**

```bash
cd Frontend
npm run dev
```

Expected output:

```
  VITE v5.0.0  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open `http://localhost:5173/` in your browser. You should see the Anna Johnson Home Cleaning login page.

### Test Accounts (for Development)

After running the seed script or registering manually:

- **Client Example**: Email: `test@test.com`, Password: `1234`
- **Admin (Anna)**: Email: `anna@homecleaning.com`, Password: `admin123`

---

## Project Structure

```
csc4710-home-cleaning-full/
├── Backend/
│   ├── api/
│   │   └── index.js           # Main Express routes
│   ├── dbService.js           # MongoDB business logic and schemas
│   ├── app.js                 # Legacy routes (some endpoints)
│   ├── .env                   # Environment variables (create this)
│   ├── package.json
│   └── node_modules/
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Request.jsx
│   │   │   ├── MyRequests.jsx
│   │   │   ├── Quotes.jsx
│   │   │   ├── Bills.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── UserManual.jsx
│   │   ├── App.jsx            # Main app shell & routing
│   │   ├── api.js             # HTTP wrapper functions
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/
├── DeveloperManual.md         # Developer documentation
├── UserManual.jsx             # (in Frontend/src/pages/)
├── sql.txt                    # SQL queries for reference
├── README.md                  # This file
└── .gitignore
```

---

## Key Features Walkthrough

### 1. User Registration & Login

- Visit `http://localhost:5173/` and click "Register here".
- Fill in your information and submit.
- Log in with your credentials.
- Welcome message displays your first name.

### 2. Client Submitting a Request

- After login, click **Submit Request**.
- Provide address, cleaning type, room count, schedule, budget, and optional notes/photos.
- Submit the form. Anna receives the request on her dashboard.

### 3. Admin (Anna) Creating a Quote

- Log in as Anna or as admin.
- Go to **Dashboard** → **Requests** tab.
- Click "Create Quote" for a request.
- Specify price, time window, and notes.
- Client receives the quote notification.

### 4. Client Accepting or Renegotiating a Quote

- Go to **Quotes** tab.
- View available quotes.
- Click **Accept** to accept, or **Renegotiate** to submit a counter-offer.
- Anna receives renegotiation requests and can respond with new quotes.

### 5. Admin Completing an Order

- When a quote is accepted, it becomes an order.
- Go to **Orders** tab to see active orders.
- Once service is completed, create a bill (go to **Bills** tab → **Create Bill**).
- The order is automatically marked **COMPLETED**.

### 6. Client Paying or Disputing a Bill

- Go to **Bills** tab.
- Select a bill from the list.
- Click **Pay** and enter the amount, or **Dispute** with a note.
- Bill status updates: **PAID** (green), **UNPAID** (red), **DISPUTED** (yellow).

### 7. Analytics Dashboard

- Go to **Dashboard** → **Analytics** tab.
- View 8 key metrics: frequent clients, uncommitted clients, this month's quotes, prospective clients, largest jobs (completed orders only), overdue bills, bad clients, good clients.

---

## Documentation

### User Manual

- **In-App**: Click **User Manual** link in the navigation (available before and after login).
- **File**: `Frontend/src/pages/UserManual.jsx` – comprehensive guide for clients and admin.

### Developer Manual

- **File**: `DeveloperManual.md` in the project root.
- Includes: architecture diagrams, API descriptions, schema definitions, extension guidelines, and future enhancements.

### SQL Queries

- **File**: `sql.txt` in the project root.
- Contains 20+ SQL statements corresponding to all major queries (analytics, CRUD operations, billing, etc.).

---

## Contributions

This project was developed collaboratively by two students.

### Contributors

#### Suganeshwara Anand

- **Hours**: 20 hours
- **Primary Contributions**:
  - Database schema design and Mongoose model creation.
  - Data validation and error handling across API endpoints.
  - Analytics query optimization and filtering logic.
  - Admin dashboard UI refinement and layout design.
  - Bill status color coding and visual improvements.
  - Testing and quality assurance (sample data generation and cleanup scripts).
  - Developer Manual documentation (DeveloperManual.md) with architectural diagrams and API descriptions.
  - SQL query documentation (sql.txt) with 20+ corresponding statements.
  - Client-side request/quote/bill form validation and user feedback messages.
  - Performance optimization for analytics (using `.lean()` queries).
  - Code review and documentation cleanup.

#### Aaraiz Sohail

- **Hours**: 18 hours
- **Primary Contributions**:
  - Frontend architecture and React component design (App.jsx, Login, Register, Request, MyRequests, Quotes, Bills, UserManual pages).
  - Hash-based routing and JWT token handling.
  - HTTP API wrapper (Frontend/src/api.js) and integration with backend endpoints.
  - Backend API design and Express route configuration (api/index.js).
  - Core business logic implementation in dbService.js (40+ database operations).
  - MongoDB Atlas configuration and connection management.
  - JWT authentication (login/register with token generation and expiration).
  - Quote renegotiation workflow design and implementation.
  - Order lifecycle management (acceptance → completion → bill creation).
  - Bill management system (create, pay, dispute with status tracking).
  - Comprehensive analytics dashboard (8-section admin view).
  - User Manual documentation (in-app and in-code).
  - GitHub-to-Vercel deployment pipeline.
  - Bug fixes and refinements across frontend and backend (~25+ commits).

### Summary

- **Total Project Hours**: 38 hours (combined)
- **Pair Programming & Collaboration**: Multiple code reviews, collaborative debugging, and joint architectural decisions.
- **Key Technical Decisions**:
  - JWT-based authentication over session-based.
  - Mongoose/MongoDB over traditional SQL for flexibility and dynamic schema.
  - Hash-based routing for simplicity in single-page app architecture.
  - Vercel deployment for both frontend and backend auto-deployment from GitHub.

---

## Troubleshooting

### Cannot connect to MongoDB

- Verify `MONGO_URI` in `.env` is correct.
- Check that your IP is whitelisted in MongoDB Atlas: https://cloud.mongodb.com/v2/cluster → Network Access.
- Ensure username and password match your MongoDB Atlas credentials (URL-encode special characters).

### Frontend cannot reach backend

- Ensure backend is running on `http://localhost:5052`.
- Check `Frontend/src/api.js` for correct `API_BASE` URL.
- In browser DevTools (Network tab), verify requests are reaching the backend.

### Port 5052 already in use

- Kill the process: `lsof -ti:5052 | xargs kill -9`
- Or use a different port: Update `PORT` in `.env` and `API_BASE` in `Frontend/src/api.js`.

### Login shows empty welcome message

- This happened when `first_name` wasn't included in JWT. Fixed in commit a80bfc5.
- Ensure backend includes `first_name` in `loginUser()` response.

---

## Future Enhancements

Refer to the **Developer Manual** (DeveloperManual.md) for:

- Multi-user admin roles (dispatcher, cleaner, manager).
- Real payment processor integration (Stripe, PayPal).
- Email/SMS notifications.
- Calendar integration and automated reminders.
- Advanced analytics with date-range filters and charts.
- Full test suite (Jest, React Testing Library).

---

## License

This project is for educational purposes (CSC 4710 - Database Design and Implementation).

---

## Contact & Support

For issues, questions, or feature requests, please open an issue on the GitHub repository:
https://github.com/AaraizS/csc4710-home-cleaning-full

---

**Last Updated**: December 9, 2025
