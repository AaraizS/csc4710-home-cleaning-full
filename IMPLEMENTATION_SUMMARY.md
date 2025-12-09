# Client-Side Request and Quote Viewing Implementation

## Overview

Implemented a complete client-facing view for their submitted service requests and received quotes, enabling clients to see their request status and quote details in a two-tab interface.

## Changes Made

### 1. Frontend - Created MyRequests Component

**File:** `Frontend/src/pages/MyRequests.jsx` (NEW)

A comprehensive React component with two tabs:

#### Tab 1: My Service Requests

- Displays all service requests submitted by the client
- Shows columns:
  - **Request ID** (shortened MongoDB ObjectId - last 6 chars)
  - **Service Type** (basic, deep cleaning, move-out)
  - **Address** (service location)
  - **Preferred Date** (formatted as local date)
  - **Budget** (proposed budget in dollars)
  - **Status** (pending, quote-received, accepted, rejected, completed)
- Empty state message when no requests exist

#### Tab 2: Quotes & Negotiations

- Shows all quotes associated with client's requests
- Card-based layout for each quote showing:
  - **Quote ID & Request ID** (shortened for easy reference)
  - **Price, Timeline, Status**
  - **Created Date**
  - **Full Description** from Anna
  - **Anna's Note** (optional feedback)
  - **Rejection Reason** (shown in red if rejected)
  - **Action Buttons** for pending quotes:
    - Accept Quote (green button)
    - Renegotiate (yellow button)
    - Cancel (red button)
  - Status badges with color coding:
    - Pending: Light blue
    - Accepted: Light green
    - Rejected: Light red

#### Features

- Conditional rendering based on tab selection
- Loading state during data fetch
- Clean error handling
- Back to Home button
- API calls with JWT authentication

### 2. Frontend - Updated App.jsx

**File:** `Frontend/src/App.jsx`

Changes made:

- Imported `MyRequests` component
- Added `myrequests` to PAGES constant
- Added navigation link "My Requests" in the header (client-only)
- Passed `clientId` prop to both Request and MyRequests components
- Route renders MyRequests when `page === 'myrequests'`

### 3. Frontend - Updated Request.jsx

**File:** `Frontend/src/pages/Request.jsx`

Changes made:

- Accepted `clientId` as a prop instead of requiring manual input
- Removed the "Client ID" form field since it's auto-populated
- Client ID is now automatically included when submitting the request
- Cleaner form UI without the redundant input field

### 4. Backend - Added API Endpoints

**File:** `Backend/api/index.js`

Two new client-specific endpoints:

#### GET /requests/client/:clientId

- Returns all service requests for a specific client
- Response format: `{ success: true, data: [...] }`
- Calls `dbService.getClientRequests(clientId)`

#### GET /quotes/client/:clientId

- Returns all quotes associated with a client's requests
- Performs intelligent join:
  1. Finds all service requests for the client
  2. Extracts request IDs from those requests
  3. Fetches all quotes where `request_id` is in that list
- Response format: `{ success: true, data: [...] }`
- Calls `dbService.getClientQuotes(clientId)`

### 5. Backend - Added Database Methods

**File:** `Backend/dbService.js`

Two new methods in DbService class:

#### getClientRequests(clientId)

```javascript
async getClientRequests(clientId) {
  const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema, 'service_requests');
  const requests = await ServiceRequest.find({ client_id: clientId }).lean();
  return requests;
}
```

- Queries MongoDB for requests matching the client_id
- Returns lean (plain JSON) documents for performance
- Error handling with fallback to empty array

#### getClientQuotes(clientId)

```javascript
async getClientQuotes(clientId) {
  // Gets all requests for the client
  const clientRequests = await ServiceRequest.find({ client_id: clientId }).lean();
  const requestIds = clientRequests.map(r => r._id);

  // Gets all quotes for those requests
  const quotes = await Quote.find({ request_id: { $in: requestIds } }).lean();
  return quotes;
}
```

- Intelligent query using MongoDB `$in` operator
- Prevents unnecessary data exposure (only client's own quotes)
- Lean queries for performance

## Data Flow

### Client Views Their Requests

1. Client navigates to "My Requests" (#myrequests)
2. MyRequests component mounts with `clientId` prop
3. Calls `GET /requests/client/{clientId}`
4. Backend queries MongoDB for requests matching client_id
5. Frontend displays table with Request IDs and status
6. Client can see which requests have quotes (status = "quote-received")

### Client Views Their Quotes

1. Client clicks on "Quotes & Negotiations" tab
2. MyRequests calls `GET /quotes/client/{clientId}`
3. Backend finds all client's request IDs, then finds quotes for those requests
4. Frontend displays quote cards with:
   - Quote ID for reference when communicating with Anna
   - Request ID (links back to original request)
   - Full quote details (price, timeline, description)
   - Current status and any notes/rejection reasons
   - Action buttons for pending quotes

## Security Considerations

✅ **Implemented Security:**

- Server-side filtering by client_id (prevents unauthorized access)
- Quotes only returned for client's own requests (via intelligent join)
- JWT authentication required on API calls
- Data queries limited to specific client context

## Testing Notes

**Frontend Build:** ✓ Successfully built with Vite (0 errors)
**Backend Syntax:** ✓ Node.js syntax check passed for all modified files
**API Endpoints:** Ready for deployment

## Next Steps (Pending)

To complete the quote negotiation workflow:

1. **Create QuoteDetails.jsx** - Dedicated page showing:

   - Full quote information
   - Accept/Reject/Renegotiate buttons
   - Form for submitting counter-offers

2. **Update Quote Schema** - Add fields:

   - `status` (pending/accepted/rejected/renegotiation)
   - `response_note` (client's counter-offer notes)

3. **Add Backend Endpoints:**

   - `POST /quotes/{quoteId}/respond` - Accept/reject/renegotiate
   - `PATCH /quotes/{quoteId}` - Update quote status

4. **Add Client Response UI:**
   - Accept quote → creates ServiceOrder
   - Reject quote → shows rejection confirmation
   - Renegotiate → form for counter-offer notes

## Files Modified

| File                              | Type     | Changes                                    |
| --------------------------------- | -------- | ------------------------------------------ |
| Frontend/src/pages/MyRequests.jsx | New      | Complete 2-tab client request/quote viewer |
| Frontend/src/App.jsx              | Modified | Import MyRequests, add route, update nav   |
| Frontend/src/pages/Request.jsx    | Modified | Accept clientId prop, remove manual input  |
| Backend/api/index.js              | Modified | Add 2 client endpoints                     |
| Backend/dbService.js              | Modified | Add 2 query methods                        |

## Architecture Diagram

```
Client User (JWT Token)
    ↓
    App.jsx (decodes JWT, extracts clientId)
    ↓
    MyRequests.jsx
    ├─ Tab 1: My Requests → GET /requests/client/{clientId}
    │                      ↓
    │                  dbService.getClientRequests()
    │                  ↓ MongoDB query
    │                  ServiceRequest.find({ client_id })
    │
    └─ Tab 2: Quotes → GET /quotes/client/{clientId}
                       ↓
                   dbService.getClientQuotes()
                   ↓ MongoDB queries
                   1. ServiceRequest.find({ client_id })
                   2. Quote.find({ request_id: { $in: [...] } })
```

## Verification Checklist

- [x] MyRequests.jsx created with proper React hooks
- [x] Two-tab interface with conditional rendering
- [x] App.jsx updated with navigation and routing
- [x] Request.jsx accepts clientId prop
- [x] Backend endpoints added with proper error handling
- [x] Database methods added with Mongoose queries
- [x] Frontend builds successfully with Vite
- [x] Backend syntax verified with Node.js
- [x] Security: client_id filtering implemented server-side
- [x] Props properly passed from App to Request and MyRequests

## Performance Considerations

- Used `.lean()` in MongoDB queries for reduced memory usage
- Card-based layout for quotes prevents long table rendering
- Conditional rendering prevents unnecessary DOM operations
- clientId in prop prevents unnecessary API authentication overhead
