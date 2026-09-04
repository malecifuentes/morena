# Morena Bakery — Product and Transaction Flow

## Project

Multi-Bakery Subscription Platform — Morena Bakery Pilot

## Current Version

Delivery 4

## Purpose

This document describes the implemented customer, transaction, order-status and chatbot flows for the Morena Bakery pilot.

The current product allows a customer to browse products, create a multi-product order request, persist the transaction in Supabase, receive a unique order number, retrieve the order later and interact with a grounded AI chatbot.

---

## 1. Product Catalogue Flow

### Entry Point

The customer opens the deployed Morena Bakery website.

### Flow

**Customer → Product Catalogue → Product Cards → Product Details or Place an Order**

### Customer Actions

The customer can:

- Browse available Morena Bakery products
- View product images
- View product names
- View prices
- View availability
- Open product details
- Continue to the ordering experience
- Interact with Ask Morena Bakery

### Product Data

Product information is loaded from:

`data/products.json`

### Possible Outcomes

**Product available**

The customer can view its information and continue through the normal product flow.

**Product unavailable**

The interface prevents the product from proceeding through the normal available-product flow.

**Product data unavailable**

The interface displays an appropriate empty or unavailable state.

---

## 2. Product Details Flow

### Flow

**Product Catalogue → Selected Product → Product Details → Quantity Selection → Ordering Experience**

### Customer Actions

The customer can:

- Review product image
- Review product name
- Review description
- Review price
- Review availability
- Select a quantity
- Continue to the ordering experience
- Return to the Product Catalogue

### Output

The selected product and quantity can be used to continue the customer ordering process.

---

## 3. Multi-Product Order Flow

### Entry Point

The customer opens:

`order.html`

### Flow

**Order Page → Select Product → Select Quantity → Add to Order → Review Cart**

The customer can repeat the product-selection process to add multiple products to the same transaction.

### Cart Actions

The customer can:

- Add products
- Increase quantities
- Decrease quantities
- Remove products
- Review the current order before submission

### Example Final Order

The final Delivery 4 validation transaction contained:

- 1x Banana Bread
- 1x Red Velvet Heart Cake

---

## 4. Customer Information Flow

After creating the product selection, the customer provides:

- Customer name
- Phone number
- Requested delivery date

### Flow

**Cart → Customer Information → Requested Delivery Date → Submit Order Request**

### Required Transaction Information

The submitted request contains:

- Product summary
- Quantity summary
- Customer name
- Phone
- Requested delivery date

The application does not consider the transaction successfully completed until the backend confirms that the database operation and order-number persistence have succeeded.

---

## 5. Order Submission Flow

### Frontend

The browser sends the completed transaction to:

`/api/order-request`

Method:

`POST`

### Flow

**Browser → `/api/order-request` → Validation → Supabase → Database ID → Order Code → Completed Transaction Response**

### Backend Validation

The serverless function verifies:

- Supported HTTP method
- Valid request body
- Product information exists
- Quantity information exists
- Customer name exists
- Phone exists
- Requested delivery date exists
- Supabase server-side credential is configured

### Security Boundary

The browser does not communicate with Supabase using the secret service credential.

The serverless backend reads:

`SUPABASE_SERVICE_KEY`

from the deployment environment.

---

## 6. Supabase Transaction Creation Flow

The order is stored in:

`order_requests`

### Step 1 — Initial Insert

The backend inserts the core transaction data:

- Product
- Quantity
- Customer name
- Phone
- Requested delivery date
- Initial status

New transactions use:

`Pending`

### Step 2 — Database ID

Supabase generates the transaction:

`id`

Example:

`15`

### Step 3 — Customer-Facing Order Number

The backend uses the database ID to construct:

`MB-ID`

For transaction ID `15`:

`MB-15`

### Step 4 — Order Code Persistence

The backend updates the same database record and stores:

`order_code = MB-15`

### Important Database Behavior

The `order_code` field is unique.

It is allowed to remain null during the initial insert because the database-generated ID is required before the backend can construct the customer-facing order number.

The backend persists the generated order code immediately after receiving the database ID.

### Complete Persistence Flow

**POST Transaction → Supabase INSERT → Generate ID → Backend Creates `MB-ID` → Supabase PATCH → Completed Transaction**

---

## 7. Database Structure

The transaction table contains:

- `id`
- `created_at`
- `product`
- `quantity`
- `customer_name`
- `phone`
- `delivery_date`
- `status`
- `order_code`

### Implemented Constraints

The table includes:

- Primary key on `id`
- Required core transaction fields
- Unique `order_code`
- Default `Pending` status
- Controlled valid status values

### Supported Status Values

- `Pending`
- `Confirmed`
- `Completed`
- `Cancelled`

---

## 8. Successful Order Confirmation Flow

A successful customer response is returned only after the order has been stored and the generated order code has been persisted.

### Flow

**Supabase Transaction → Serverless Backend → Browser → Successful Confirmation**

### Customer Sees

- Successful order request message
- Unique order number
- Current status
- Check Order Status option

### Final Validated Example

Order:

`MB-15`

Status:

`Pending`

### Important Meaning

`Pending` means the order request was successfully recorded.

It does not mean that Morena Bakery has automatically confirmed the order.

---

## 9. Check Order Status Flow

### Entry Point

The customer opens:

`order-status.html`

The customer can also reach this experience directly from a successful order confirmation.

### Flow

**Customer → Order Number → Check Status → `/api/order-status` → Supabase → Result**

### Input

Example:

`MB-15`

### Backend Request

Method:

`GET`

Endpoint:

`/api/order-status`

### Backend Processing

The serverless function:

1. Validates the request method.
2. Reads the supplied order number.
3. Normalizes the order number.
4. Reads the Supabase credential from the server-side environment.
5. Queries `order_requests` using `order_code`.
6. Determines whether a matching transaction exists.
7. Returns only the permitted customer-facing information.

---

## 10. Successful Order Read-Back

When a matching transaction exists, the status experience displays:

- Order number
- Current status
- Products
- Quantities
- Requested delivery date

### Final Validated Read-Back

Order:

`MB-15`

Status:

`Pending`

Products:

`1x Banana Bread | 1x Red Velvet Heart Cake`

Quantity:

`1, 1`

Requested delivery date:

`2026-09-05`

### Privacy Boundary

The public status response does not return:

- Customer name
- Phone number

The endpoint also uses:

`Cache-Control: no-store`

for the public status response.

---

## 11. Order Not-Found Flow

If the supplied order number does not match a transaction:

**Customer → Invalid Order Number → `/api/order-status` → Supabase → No Matching Record → Not-Found Response**

### Validated Example

Input:

`MB-99999`

Result:

The interface displays a clear message indicating that the order could not be found.

The system does not display a false successful result.

---

## 12. Order Status URL Prefill

After a successful transaction, the customer can select Check Order Status.

The confirmation can pass the order number through the URL.

Example:

`order-status.html?order_code=MB-15`

The status page reads the query parameter and prefills the order-number field.

### Flow

**Order Confirmation → Check Order Status → URL Order Code → Prefilled Status Field**

The customer can then request the current order information.

---

## 13. Grounded AI Chatbot Flow

### Entry Point

The chatbot is available from the Morena Bakery catalogue interface.

### Customer Experience

**Customer → Ask Morena Bakery → Enter Question → Send**

The frontend sends the message to:

`/api/chat`

Method:

`POST`

### Backend Flow

**Browser → `/api/chat` → Server-Side Morena Context → AI Provider → Grounded Response → Browser**

### Server-Side Credential

The chatbot backend reads:

`OPENAI_API_KEY`

from the deployment environment.

The secret API key is not included in frontend code.

---

## 14. Chatbot Grounding Flow

The serverless chatbot function supplies Morena Bakery-specific context and explicit response restrictions.

### Supported Information

The assistant can respond to supported questions about:

- Products included in its Morena Bakery context
- How to place an order
- Multi-product ordering
- Order numbers
- Initial order status
- Check Order Status

### Unsupported Information

The chatbot must not invent information such as:

- Prices not included in its context
- Ingredients
- Product sizes
- Delivery fees
- Payment methods
- Opening hours
- Addresses
- Promotions
- Unsupported policies

### Missing Information Flow

**Customer asks unsupported question → Chatbot checks supplied context → Information unavailable → Chatbot states limitation**

The assistant may recommend contacting Morena Bakery directly for confirmation.

---

## 15. Order-Specific Chatbot Flow

The chatbot does not directly query or modify individual orders.

### Example

Customer asks:

`What is the status of order MB-15?`

### Expected Flow

**Customer → Chatbot → Recognises Order-Specific Question → Directs Customer to Check Order Status**

The chatbot must not claim that it has directly retrieved the transaction.

The actual transaction lookup occurs through:

`/api/order-status`

---

## 16. Chatbot Validation Flow

The final chatbot validation included the following scenarios:

### Known Product Information

Question:

`What products do you have?`

Expected behavior:

The assistant identifies the products contained in its Morena Bakery context.

### Unknown Information

Question:

`How much does the Banana Bread cost?`

Expected behavior:

The assistant does not invent a price and explains that the information is unavailable in its supplied context.

### Ordering Process

Question:

`How can I place an order?`

Expected behavior:

The assistant explains the Morena Bakery ordering process.

### Individual Order

Question:

`What is the status of order MB-15?`

Expected behavior:

The assistant directs the customer to Check Order Status instead of claiming direct access to the order.

---

## 17. Security Flow

### Supabase

**Browser → Morena Backend → Supabase**

The Supabase service credential remains on the server side.

### AI Provider

**Browser → Morena Chat Backend → AI Provider**

The AI API credential remains on the server side.

### Environment Variables

The deployed application uses:

- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`

Secret values must not be included in:

- Public HTML
- Frontend JavaScript
- Repository documentation
- Committed `.env` files

---

## 18. Complete Delivery 4 Customer Flow

The complete implemented customer transaction is:

**Product Catalogue**

↓

**Product Selection**

↓

**Multi-Product Cart**

↓

**Customer Information**

↓

**Requested Delivery Date**

↓

**Submit Order Request**

↓

**`/api/order-request`**

↓

**Supabase Initial Insert**

↓

**Database ID Generated**

↓

**Backend Generates `MB-ID`**

↓

**Order Code Persisted**

↓

**Pending Status**

↓

**Successful Confirmation**

↓

**Customer Receives Order Number**

↓

**Check Order Status**

↓

**`/api/order-status`**

↓

**Supabase Read-Back**

↓

**Customer Sees Order Information and Status**

---

## 19. Final Delivery 4 Validation

The final deployed transaction used for Delivery 4 validation is:

### Order

`MB-15`

### Products

- 1x Banana Bread
- 1x Red Velvet Heart Cake

### Status

`Pending`

### Requested Delivery Date

`2026-09-05`

### Successfully Validated

- Public product deployment
- Multi-product transaction
- Serverless order submission
- Supabase persistence
- Database-generated ID
- Unique customer-facing order number
- Initial order status
- Successful order confirmation
- Order read-back using `MB-15`
- Correct products and quantities
- Correct requested delivery date
- Not-found handling using `MB-99999`
- Public status privacy boundary
- Grounded AI chatbot
- Server-side AI integration
- Chatbot refusal to invent unavailable information
- Chatbot guidance for order-specific questions

---

## 20. Current Implementation Boundary

The Morena Bakery pilot does not currently include:

- Payment processing
- Customer accounts
- Login
- Administrative dashboard
- Multiple active bakery tenants
- Tenant administration
- Third-party delivery integration
- Automatic order confirmation

These features remain outside the current Delivery 4 scope.

The current implementation focuses on one complete, persistent and retrievable customer transaction together with grounded customer assistance.