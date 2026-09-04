# Morena Bakery — Customer and System Flow

## Overview

The Morena Bakery pilot includes four main customer experiences:

1. Product browsing
2. Multi-product order creation
3. Order status lookup
4. Grounded AI assistance

The primary Delivery 4 transaction is the customer order request.

---

## 1. Product Catalogue

### Purpose

Show Morena Bakery products at a glance and help customers choose what they want to order.

### Information shown

- Product image
- Product name
- Category
- Price
- Availability

### Customer actions

- Browse available products
- Open a product to view more information
- Go directly to the order page
- Use the Ask Morena Bakery chatbot

### Navigation

The Product Catalogue is the main entry point of the live Morena Bakery website.

Opening a product leads to Product Details.

Selecting Place an Order leads to the multi-product order experience.

---

## 2. Product Details

### Purpose

Give customers the information they need to understand a selected product before creating an order request.

### Information shown

- Product image
- Product name
- Description
- Price
- Availability
- Quantity options

### Customer actions

- Review product information
- Select a quantity
- Continue to the ordering experience
- Return to the Product Catalogue

### Navigation

Reached by selecting a product from the Product Catalogue.

Back returns to the Product Catalogue.

---

## 3. Multi-Product Order

### Purpose

Allow customers to create one order request containing one or more Morena Bakery products.

### Information collected

- Product selection
- Quantity for each product
- Customer name
- Phone number
- Requested delivery date

### Customer actions

- Add products to the order
- Increase or decrease product quantities
- Remove products
- Enter contact information
- Select a requested delivery date
- Submit the order

### Successful flow

**Product Selection → Shopping Cart → Customer Information → Submit Order**

The browser sends the order to:

`/api/order-request`

The serverless backend validates the request and sends the transaction to Supabase.

Supabase stores the transaction in:

`order_requests`

After the transaction is created:

- A database ID is generated
- A customer-facing order number is created in the format `MB-XX`
- The order number is stored in the database
- The transaction receives the initial status `Pending`

The customer then receives a successful confirmation containing the order number and current status.

### Error states

Possible errors include:

- Required information is missing
- Invalid request body
- Server configuration error
- Database write failure
- Network or server error

The customer receives an error message instead of a false confirmation.

---

## 4. Order Confirmation

### Purpose

Confirm that the customer's order request was recorded successfully.

### Information shown

- Successful submission message
- Unique order number
- Initial order status

Example order number:

`MB-13`

Initial status:

`Pending`

### Customer actions

- Save the order number
- Use Check Order Status
- Return to the catalogue

Important:

A submitted order request is not automatically considered confirmed by Morena Bakery.

---

## 5. Check Order Status

### Purpose

Allow customers to retrieve an existing transaction using the order number received after submission.

### Customer input

- Order number

Example:

`MB-13`

### System flow

**Customer Order Number → `/api/order-status` → Supabase → Matching Transaction**

For an existing order, the backend returns only the non-sensitive information required for customer tracking.

### Information shown

- Order number
- Current status
- Products
- Quantities
- Requested delivery date

### Privacy behavior

The public status endpoint does not return:

- Customer name
- Customer phone number

### Not-found flow

If the order number does not exist:

**Order Number → `/api/order-status` → No Matching Transaction → Not Found Message**

Example:

`MB-99999`

The interface displays a clear message indicating that the order could not be found.

---

## 6. Ask Morena Bakery

### Purpose

Provide immediate customer assistance about Morena Bakery and the ordering process.

### Customer actions

- Enter a question
- Submit the question
- Read the assistant response

### System flow

**Customer Question → `/api/chat` → AI Provider → Grounded Morena Bakery Response**

The OpenAI API key is stored only as a server-side environment variable.

### Grounding behavior

The assistant is provided with Morena Bakery-specific context.

It can answer questions about:

- Available products included in its context
- How to place an order
- Multi-product ordering
- Order numbers
- Initial order status
- How to use Check Order Status

The assistant must not invent unavailable information.

If the requested information is not included in its grounding context, it explains that it does not have that information and recommends contacting Morena Bakery directly.

### Order-specific questions

The chatbot does not directly access individual customer orders.

If a customer asks about a specific order, the assistant directs the customer to Check Order Status.

---

## 7. Complete Delivery 4 Customer Flow

The complete live customer journey is:

**Product Catalogue → Product Details / Product Selection → Multi-Product Order → Submit Order → Serverless Backend → Supabase → Unique Order Number + Pending Status → Check Order Status**

The AI assistance journey is:

**Customer Question → Ask Morena Bakery → Serverless Chat Backend → Grounded AI Response**

---

## 8. Main Backend Flow

### Order creation

`index.html / order.html`

↓

`/api/order-request`

↓

Supabase REST API

↓

`order_requests`

↓

Order number and status returned to frontend

### Order lookup

`order-status.html`

↓

`/api/order-status`

↓

Supabase REST API

↓

Matching order or not-found response

### Chatbot

`index.html`

↓

`/api/chat`

↓

OpenAI Responses API

↓

Grounded answer returned to frontend

---

## 9. Security Boundary

Sensitive credentials remain on the server side.

Environment variables used by the backend include:

- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`

These values are not stored in the public frontend code.

The frontend communicates only with the project's own serverless API routes.