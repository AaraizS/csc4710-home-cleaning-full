# E-R Diagram and Relational Model for Home Cleaning Service Management System

## 1. Entity-Relationship Diagram (Chen Notation)

```
                                    ┌─────────────────────────┐
                                    │      CLIENTS            │
                                    ├─────────────────────────┤
                                    │  client_id              │
                                    │  first_name             │
                                    │  last_name              │
                                    │  address                │
                                    │  phone                  │
                                    │  email                  │
                                    │  cc_last4               │
                                    │  cc_token               │
                                    │  created_at             │
                                    └────────┬────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    │                        │                        │
         ┌──────────┴──────┐     ┌──────────┴──────┐     ┌──────────┴──────┐
         │ (1,N)           │     │ (1,N)           │     │ (1,N)           │
         │ HAS_ACCOUNT     │     │ SUBMITS         │     │ RECEIVES        │
         │                 │     │                 │     │                 │
    ┌────▼──────────────────┐   ┌─────────────────▼─┐   ┌────────────────▼──┐
    │  ◇ USER_ACCOUNTS      │   │  ◇ SERVICE_       │   │  ◇ QUOTES         │
    │  (entity)             │   │    REQUESTS       │   │  (entity)         │
    │ ┌─────────────────┐   │   │  (entity)         │   │ ┌───────────────┐  │
    │ │ user_id (PK)    │   │   │ ┌────────────────┐│   │ │ quote_id(PK) │  │
    │ │ username        │   │   │ │request_id(PK)  ││   │ │ price        │  │
    │ │ password        │   │   │ │service_address ││   │ │ time_start   │  │
    │ │ role            │   │   │ │cleaning_type   ││   │ │ time_end     │  │
    │ │ created_at      │   │   │ │num_rooms       ││   │ │ note         │  │
    │ └─────────────────┘   │   │ │preferred_date  ││   │ │ status       │  │
    └────────────────────────┘   │ │proposed_budget ││   │ │ client_note  │  │
                                 │ │notes           ││   │ │ created_at   │  │
                                 │ │photos          ││   │ │ updated_at   │  │
                                 │ │status          ││   │ │              │  │
                                 │ │created_at      ││   │ │              │  │
                                 │ └────────────────┘│   │ └───────────────┘  │
                                 └──────┬────────────┘   └────────┬───────────┘
                                        │                         │
                                        │ (1,N)                   │ (1,N)
                                        │ FOR                     │ QUOTED_FOR
                                        │                         │
                                        │         ┌───────────────┘
                                        │         │
                                        │   ┌─────▼──────────────┐
                                        │   │  ◇ SERVICE_ORDERS  │
                                        │   │  (entity)          │
                                        └───┤ ┌────────────────┐ │
                                            │ │order_id (PK)   │ │
                                            │ │status          │ │
                                            │ │completed_at    │ │
                                            │ │created_at      │ │
                                            │ └────────────────┘ │
                                            └────────┬───────────┘
                                                     │
                                                     │ (1,N)
                                                     │ FOR
                                                     │
                                            ┌────────▼───────┐
                                            │  ◇ BILLS       │
                                            │  (entity)      │
                                            │ ┌────────────┐ │
                                            │ │bill_id(PK) │ │
                                            │ │amount      │ │
                                            │ │status      │ │
                                            │ │dispute_note│ │
                                            │ │paid_at     │ │
                                            │ │due_date    │ │
                                            │ │created_at  │ │
                                            │ └────────────┘ │
                                            └────────────────┘
```

### Chen Notation Elements:

| Symbol                    | Meaning                                   |
| ------------------------- | ----------------------------------------- |
| **Rectangle (◇)**         | Entity with attributes listed inside      |
| **Diamond**               | Relationship (labeled on connecting line) |
| **(1,N)**                 | Cardinality: 1 = one side, N = many side  |
| **Attribute names**       | Listed inside entity rectangle            |
| **Underlined attributes** | Primary key (PK)                          |

### Relationships in Chen Notation:

| Relationship    | Entities                                  | Cardinality | Meaning                                      |
| --------------- | ----------------------------------------- | ----------- | -------------------------------------------- |
| **HAS_ACCOUNT** | CLIENTS (1) → USER_ACCOUNTS (N)           | (1,N)       | One client has multiple user accounts        |
| **SUBMITS**     | CLIENTS (1) → SERVICE_REQUESTS (N)        | (1,N)       | One client submits multiple service requests |
| **RECEIVES**    | CLIENTS (1) → QUOTES (N)                  | (1,N)       | One client receives multiple quotes          |
| **FOR**         | SERVICE_REQUESTS (1) → SERVICE_ORDERS (N) | (1,N)       | One request can have multiple orders         |
| **QUOTED_FOR**  | QUOTES (N) → SERVICE_ORDERS (1)           | (N,1)       | Multiple quotes can relate to one order      |
| **FOR**         | SERVICE_ORDERS (1) → BILLS (N)            | (1,N)       | One order has multiple bills                 |

---

## 2. Assumptions and Justifications

### 2.1 Entity Assumptions

1. **CLIENTS**: Central entity representing service customers

   - Each client has a unique email for identification
   - Credit card information stored as last 4 digits + token for security
   - Multiple roles possible through separate USER_ACCOUNTS table

2. **USER_ACCOUNTS**: Authentication and authorization entity

   - Separated from CLIENTS to support different user types (CLIENT, ADMIN)
   - One client can have multiple user accounts (though typically one)
   - Supports admin users who may not be clients

3. **SERVICE_REQUESTS**: Initiated by clients to request cleaning services

   - Status tracks workflow: pending → quote_received → rejected/completed
   - Photos stored as JSON to support flexible image metadata
   - Proposed budget is client's estimate

4. **QUOTES**: Service provider's response to service requests

   - Many quotes can exist for one request (competitive bidding)
   - Status tracks negotiation workflow: PENDING → ACCEPTED/REJECTED/RENEGOTIATING → RENEGOTIATED
   - Separate from SERVICE_ORDERS to decouple quoting from order fulfillment
   - Time window defines available service time slots

5. **SERVICE_ORDERS**: Confirmed work orders after quote acceptance

   - Created when a quote is accepted
   - Status tracks completion: ACCEPTED → COMPLETED
   - Links request to billing

6. **BILLS**: Invoice and payment tracking
   - One bill per order (1:1 logical relationship, but modeled as 1:N for flexibility)
   - Status supports payment workflow: UNPAID → PAID or DISPUTED
   - Dispute mechanism allows clients to contest charges
   - Timestamps support payment analytics

### 2.2 Relationship Assumptions

| Relationship                      | Cardinality | Justification                                                                      |
| --------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| CLIENTS → USER_ACCOUNTS           | 1:N         | One client can have multiple logins (primary + backup accounts)                    |
| CLIENTS → SERVICE_REQUESTS        | 1:N         | Clients submit multiple service requests over time                                 |
| CLIENTS → QUOTES                  | 1:N         | Clients receive multiple quotes (same request or different requests)               |
| CLIENTS → SERVICE_ORDERS          | 1:N         | Clients place multiple orders                                                      |
| SERVICE_REQUESTS → QUOTES         | 1:N         | Multiple quotes (or none) per request enable competitive pricing                   |
| SERVICE_REQUESTS → SERVICE_ORDERS | 1:N         | Technically 1:1 when quote accepted, but 1:N allows for business logic flexibility |
| SERVICE_ORDERS → BILLS            | 1:N         | Typically 1:1, but 1:N allows future split billing scenarios                       |

### 2.3 Constraint Justifications

1. **Primary Keys**: All entities have auto-increment integer PKs for:

   - Simple indexing and performance
   - Referential integrity enforcement
   - Easy relationship navigation

2. **Foreign Keys**: All relationships enforced via FK constraints to:

   - Prevent orphaned records
   - Maintain referential integrity
   - Cascade options not explicitly set (conservative approach)

3. **Unique Constraints**:

   - `email` in CLIENTS: Prevents duplicate registrations
   - `username` in USER_ACCOUNTS: Ensures unique login identifiers

4. **Enumerations**: Used for status fields to:

   - Restrict valid values
   - Document workflow states
   - Improve query efficiency

5. **Timestamps**:
   - `created_at`: Audit trail and sorting
   - `updated_at` (in QUOTES, BILLS): Track modifications
   - `paid_at`, `completed_at`: Event-specific timestamps for analytics

### 2.4 Business Logic Embedded in Schema

1. **Status Workflows**:

   - SERVICE_REQUESTS: `pending` → `quote_received` → `rejected`/`completed`
   - QUOTES: `PENDING` → `ACCEPTED`/`REJECTED`/`RENEGOTIATING` → `RENEGOTIATED`
   - SERVICE_ORDERS: `ACCEPTED` → `COMPLETED`
   - BILLS: `UNPAID` → `PAID` or `DISPUTED` → (can return to `UNPAID`)

2. **Security Considerations**:

   - Credit card tokenization (cc_token) rather than full card storage
   - Password storage (assumed hashed in practice)

3. **Data Integrity**:
   - NOT NULL constraints on critical fields (names, email, FK references)
   - TIMESTAMP defaults ensure audit trail

---

## 3. Relational Schema - CREATE TABLE Statements

```sql
-- ========================================
-- DATABASE & TABLE CREATION
-- ========================================

-- Create the database
CREATE DATABASE IF NOT EXISTS home_cleaning_service;
USE home_cleaning_service;

-- ========================================
-- TABLE: CLIENTS
-- ========================================
-- Description: Stores information about service customers
-- Primary Purpose: Central customer master data
-- Key Constraints:
--   - PK: client_id (auto-increment)
--   - UNIQUE: email (prevents duplicate registrations)
--   - NOT NULL: first_name, last_name, email (core identity fields)
-- Notes:
--   - cc_last4 and cc_token support payment processing
--   - created_at tracks customer acquisition date for analytics
CREATE TABLE IF NOT EXISTS clients (
  client_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  cc_last4 CHAR(4),
  cc_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLE: USER_ACCOUNTS
-- ========================================
-- Description: Authentication and role-based access control
-- Primary Purpose: User login management and authorization
-- Key Constraints:
--   - PK: user_id (auto-increment)
--   - FK: client_id (references clients, nullable for admin accounts)
--   - UNIQUE: username (ensures unique login identifiers)
--   - NOT NULL: username, password, role
--   - ENUM: role (CLIENT | ADMIN) restricts valid values
-- Notes:
--   - Separated from clients to support different user types
--   - client_id is nullable to allow admin-only users
--   - Password should be hashed in application layer (not stored as plaintext)
CREATE TABLE IF NOT EXISTS user_accounts (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('CLIENT', 'ADMIN') DEFAULT 'CLIENT',
  client_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- ========================================
-- TABLE: SERVICE_REQUESTS
-- ========================================
-- Description: Cleaning service requests submitted by clients
-- Primary Purpose: Initial request capture and workflow tracking
-- Key Constraints:
--   - PK: request_id (auto-increment)
--   - FK: client_id (references clients, NOT NULL - every request must belong to a client)
--   - ENUM: status (pending | quote_received | rejected | completed)
--   - NOT NULL: client_id, status
-- Notes:
--   - photos stored as JSON to support flexible image metadata
--   - num_rooms helps estimate cleaning scope
--   - preferred_datetime and proposed_budget guide quote generation
--   - status tracks workflow from initial submission to completion/rejection
--   - created_at enables sorting and analytics on request volume
Create TABLE IF NOT EXISTS service_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  service_address VARCHAR(255),
  cleaning_type VARCHAR(100),
  num_rooms INT,
  preferred_datetime DATETIME,
  proposed_budget DECIMAL(10, 2),
  notes TEXT,
  photos JSON,
  status ENUM('pending', 'quote_received', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- ========================================
-- TABLE: QUOTES
-- ========================================
-- Description: Service quotes (pricing proposals) for service requests
-- Primary Purpose: Quote management and negotiation workflow
-- Key Constraints:
--   - PK: quote_id (auto-increment)
--   - FK: request_id (references service_requests, NOT NULL)
--   - FK: client_id (references clients, NOT NULL - denormalized for query efficiency)
--   - ENUM: status (PENDING | ACCEPTED | REJECTED | RENEGOTIATING | RENEGOTIATED)
--   - NOT NULL: request_id, client_id, status
-- Notes:
--   - Multiple quotes can exist for a single request (competitive bidding)
--   - time_window_start/end define availability slots
--   - client_note allows client feedback during negotiation
--   - status tracks negotiation workflow (PENDING → ACCEPTED/REJECTED/RENEGOTIATING)
--   - updated_at tracks latest negotiation timestamp
--   - created_at enables analytics on quote-to-acceptance time
CREATE TABLE IF NOT EXISTS quotes (
  quote_id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  client_id INT NOT NULL,
  price DECIMAL(10, 2),
  time_window_start DATETIME,
  time_window_end DATETIME,
  note TEXT,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'RENEGOTIATING', 'RENEGOTIATED') DEFAULT 'PENDING',
  client_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(request_id),
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- ========================================
-- TABLE: SERVICE_ORDERS
-- ========================================
-- Description: Confirmed work orders created when a quote is accepted
-- Primary Purpose: Order fulfillment tracking and completion management
-- Key Constraints:
--   - PK: order_id (auto-increment)
--   - FK: request_id (references service_requests, NOT NULL)
--   - FK: client_id (references clients, NOT NULL - denormalized for query efficiency)
--   - ENUM: status (ACCEPTED | COMPLETED)
--   - NOT NULL: request_id, client_id, status
-- Notes:
--   - Created when client accepts a quote
--   - Decouples quoting (QUOTES table) from order execution
--   - completed_at records exact timestamp of work completion
--   - Links to BILLS for payment processing
--   - Status progression: ACCEPTED → COMPLETED
CREATE TABLE IF NOT EXISTS service_orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  client_id INT NOT NULL,
  status ENUM('ACCEPTED', 'COMPLETED') DEFAULT 'ACCEPTED',
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(request_id),
  FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- ========================================
-- TABLE: BILLS
-- ========================================
-- Description: Invoices and payment records for completed orders
-- Primary Purpose: Financial tracking and dispute management
-- Key Constraints:
--   - PK: bill_id (auto-increment)
--   - FK: order_id (references service_orders, NOT NULL - every bill must link to an order)
--   - ENUM: status (UNPAID | PAID | DISPUTED)
--   - NOT NULL: order_id, status
-- Notes:
--   - One bill per order (typically 1:1, but modeled as 1:N for future flexibility)
--   - Status workflow: UNPAID → PAID (or UNPAID → DISPUTED → UNPAID/PAID)
--   - due_date enables aging analysis and overdue tracking
--   - paid_at records exact payment timestamp (NULL if not yet paid)
--   - dispute_note stores client justification for disputed bills
--   - created_at tracks invoice generation date for audit and analytics
--   - Supports analytics:
--     - Overdue bills: WHERE status='UNPAID' AND due_date < NOW()
--     - Payment time: TIMESTAMPDIFF(HOUR, created_at, paid_at)
CREATE TABLE IF NOT EXISTS bills (
  bill_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(10, 2),
  status ENUM('UNPAID', 'PAID', 'DISPUTED') DEFAULT 'UNPAID',
  dispute_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  due_date DATETIME,
  FOREIGN KEY (order_id) REFERENCES service_orders(order_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
-- Recommended indexes for common query patterns:

-- User authentication lookups
CREATE INDEX idx_user_accounts_username ON user_accounts(username);

-- Client lookups by email
CREATE INDEX idx_clients_email ON clients(email);

-- Service request filtering by client and status
CREATE INDEX idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- Quote status and client filtering
CREATE INDEX idx_quotes_request_id ON quotes(request_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- Order and bill lookups by client
CREATE INDEX idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX idx_bills_order_id ON bills(order_id);
CREATE INDEX idx_bills_status ON bills(status);

-- Timestamp-based queries for analytics
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_created_at ON bills(created_at);
```

---

## 4. Summary of Design Decisions

| Decision                                             | Rationale                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Separate CLIENTS and USER_ACCOUNTS**               | Supports multiple user roles (admin may not be a client) and multiple accounts per client      |
| **Quotes as separate entity**                        | Enables competitive bidding; quote can be rejected without losing request data                 |
| **SERVICE_ORDERS separate from QUOTES**              | Decouples pricing negotiation from work execution; allows quote revision without order changes |
| **Denormalized FK (client_id in QUOTES and ORDERS)** | Eliminates joins for common queries; trades small redundancy for significant performance gain  |
| **JSON for photos**                                  | Flexible schema for varied image metadata without requiring separate tables                    |
| **Enumerated status fields**                         | Enforces valid workflow states; documents allowed transitions                                  |
| **created_at and updated_at timestamps**             | Comprehensive audit trail for compliance and analytics                                         |
| **Nullable fields (address, phone, cc_token)**       | Supports partial data entry and flexible registration flows                                    |
| **DECIMAL(10,2) for currency**                       | Avoids floating-point precision errors in financial calculations                               |
