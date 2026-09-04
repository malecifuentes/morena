# Product Requirements Document (PRD)

## Project

Multi-Bakery Subscription Platform — Morena Bakery Pilot

## Current Version

Delivery 4 — Core Transaction, Order Status and Grounded AI Chatbot

## Overview

This project explores a digital subscription platform concept for small bakeries and dessert businesses.

The long-term product vision is to allow multiple bakeries to operate their own digital storefronts with separate products, branding and customer order requests.

The current implementation focuses on Morena Bakery as the pilot. The Morena Bakery pilot is used to build and validate the customer ordering experience before expanding the platform to additional bakery tenants.

For Delivery 4, the pilot includes a complete customer order transaction, persistent database storage, unique order identification, order status retrieval and a grounded AI customer assistant.

## Problem

Many small bakeries receive orders manually through WhatsApp, Instagram or other social media channels.

Customers may need to exchange several messages to ask about available products, prices, quantities, delivery dates and the status of an existing request.

This process can lead to delayed responses, incomplete order information and difficulties organising and following up on customer requests.

## Target Users

### Primary User: Small Bakery Owners

The primary users are owners of small bakeries and dessert businesses that currently receive customer enquiries and order requests manually through WhatsApp, Instagram or other social media channels.

They need a simple digital storefront where customers can view products and submit structured order requests that are stored persistently.

For the current implementation, Morena Bakery represents this primary user.

### Secondary User: Bakery Customers

The secondary users are customers who want to browse available products, create an order request, receive an order number, check the status of an existing request and obtain basic assistance without exchanging multiple messages with the bakery.

They need a clear and simple experience that allows them to provide the information necessary for the bakery to follow up on their request.

## Goal

The goal of the current Morena Bakery pilot is to provide a functional customer experience where customers can:

- Browse available products.
- View product details, prices and availability.
- Add one or more products to an order.
- Select quantities.
- Submit an online order request.
- Receive a unique order number.
- See the initial status of the order request.
- Retrieve an existing order using its order number.
- Receive a clear response when an order number does not exist.
- Ask a grounded AI assistant questions about Morena Bakery and its ordering process.

The broader product goal is to use the Morena Bakery pilot as the foundation for a future subscription platform serving multiple independent bakeries.

## Core Customer Transaction

The core transaction for Delivery 4 is the submission of a customer order request.

The transaction begins when the customer selects one or more Morena Bakery products and ends when the order request is persisted in the database and the customer receives a unique order number and initial status.

### Transaction Inputs

The customer provides:

- One or more products
- Quantity for each selected product
- Customer name
- Phone number
- Requested delivery date

### Transaction Processing

When the customer submits the order:

1. The browser sends the transaction to the project's own serverless backend function.
2. The backend validates the required transaction data.
3. The backend uses a server-side Supabase credential.
4. The transaction is inserted into the `order_requests` table.
5. Supabase generates the transaction ID.
6. The application creates a unique customer-facing order number using the `MB-XX` format.
7. The order number is persisted with the transaction.
8. The new order receives the initial status `Pending`.
9. The backend returns the successful transaction information to the customer interface.

### Transaction Output

After a successful submission, the customer receives:

- Successful submission confirmation
- Unique order number
- Initial order status

## Current MVP Features

- Product catalogue
- Product images
- Product details and descriptions
- Product prices
- Product availability
- Multi-product shopping cart
- Quantity controls
- Customer order request form
- Serverless order submission
- Supabase transaction storage
- Unique `MB-XX` order number
- Initial `Pending` status
- Successful transaction confirmation
- Check Order Status feature
- Order retrieval by order number
- Not-found handling for nonexistent order numbers
- Grounded AI chatbot
- Server-side AI API integration
- Navigation between the implemented customer experiences

## User Stories

- As a customer, I want to browse Morena Bakery products so that I can decide what I would like to order.

- As a customer, I want to see product details, prices and availability before creating an order request.

- As a customer, I want to add more than one product to the same order so that I can submit one complete request.

- As a customer, I want to adjust the quantity of each selected product so that my request reflects what I need.

- As a customer, I want to provide my name, phone number and requested delivery date so that Morena Bakery has the information needed to follow up on my request.

- As a customer, I want to receive a unique order number after submitting my request so that I can identify it later.

- As a customer, I want to see the initial status of my request so that I know it was recorded.

- As a customer, I want to retrieve my order using its order number so that I can check its current status.

- As a customer, I want to receive a clear message when an order number does not exist so that I know the lookup was unsuccessful.

- As a customer, I want to ask Morena Bakery's AI assistant basic questions about the products and ordering process so that I can receive immediate guidance.

- As a customer, I want the AI assistant to avoid inventing unavailable information so that I receive reliable guidance.

- As a bakery owner, I want customer order requests to be stored in a structured and persistent format so that they can be reviewed after submission.

- As a bakery owner, I want sensitive service credentials to remain on the server side so that they are not exposed in public frontend code.

## Current Customer Flow

The primary Morena Bakery transaction flow is:

**Product Catalogue → Product Selection → Shopping Cart → Customer Information → Submit Order → Serverless Backend → Supabase → Order Number and Pending Status → Confirmation**

The post-transaction read-back flow is:

**Order Number → Check Order Status → Serverless Backend → Supabase → Order Details and Current Status**

If the supplied order number does not exist:

**Order Number → Check Order Status → Not Found Message**

The customer assistance flow is:

**Customer Question → Ask Morena Bakery → Serverless Chat Backend → Grounded AI Response**

## Order Status

Every new order request begins with the status:

`Pending`

The database supports the following controlled status values:

- `Pending`
- `Confirmed`
- `Completed`
- `Cancelled`

The public Check Order Status experience displays only the non-sensitive information required for customer tracking.

The customer's name and phone number are not returned by the public order status endpoint.

## Database Requirements

The main transaction table is:

`order_requests`

The transaction includes the following fields:

- `id`
- `created_at`
- `product`
- `quantity`
- `customer_name`
- `phone`
- `delivery_date`
- `status`
- `order_code`

Database requirements include:

- Primary key for transaction identity
- Required transaction fields
- Unique order number
- Required order number
- Default initial status
- Controlled valid status values
- Persistent storage of successful transactions

## Serverless Backend Requirements

### Order Creation Endpoint

`/api/order-request`

Requirements:

- Accept `POST` requests.
- Reject unsupported HTTP methods.
- Validate required transaction fields.
- Use the Supabase service credential only on the server side.
- Insert the order into Supabase.
- Generate and persist the customer-facing order number.
- Return the successful transaction information.

### Order Status Endpoint

`/api/order-status`

Requirements:

- Accept `GET` requests.
- Reject unsupported HTTP methods.
- Require an order number.
- Read the matching transaction from Supabase.
- Return only the information required for customer status tracking.
- Return a clear not-found response when the order does not exist.
- Avoid returning the customer's name or phone number.
- Prevent unnecessary caching of order status responses.

### Chat Endpoint

`/api/chat`

Requirements:

- Accept `POST` requests.
- Reject unsupported HTTP methods.
- Validate that a customer message is present.
- Use the AI provider API key only on the server side.
- Provide Morena Bakery business context to ground the response.
- Return the assistant response to the customer interface.
- Avoid exposing the AI API key to the browser.

## Grounded AI Chatbot Requirements

The Ask Morena Bakery assistant must answer based on the Morena Bakery information supplied in its grounding context.

The assistant may provide guidance about:

- Available products included in its provided context
- The customer ordering process
- Multi-product order requests
- Order numbers
- Initial order status
- How to use Check Order Status

The assistant must not invent unavailable information such as:

- Prices not included in its grounding context
- Ingredients
- Product sizes
- Delivery fees
- Payment methods
- Opening hours
- Addresses
- Promotions
- Policies not included in its context

When requested information is unavailable, the assistant should state that it does not have the information and recommend contacting Morena Bakery directly for confirmation.

The chatbot must not claim to access or modify an individual customer order. Customers asking about a specific order should be directed to Check Order Status.

## Security Requirements

- `SUPABASE_SERVICE_KEY` must remain server-side.
- `OPENAI_API_KEY` must remain server-side.
- Secret credentials must not be included in public frontend JavaScript.
- Secret credentials must not be committed to the repository.
- The public order status endpoint must not return the customer's phone number.
- The public order status endpoint must not return the customer's name.
- Order status responses should not be unnecessarily cached.

## Validation Requirements

The following scenarios must be tested before final delivery:

1. Customer can browse the live product catalogue.
2. Customer can add multiple products to an order.
3. Customer can change product quantities.
4. Customer can enter the required customer information.
5. Customer can submit an order successfully.
6. The transaction is persisted in Supabase.
7. The transaction receives a unique `MB-XX` order number.
8. The transaction receives the initial status `Pending`.
9. The customer can retrieve a valid order using Check Order Status.
10. A nonexistent order number returns a clear not-found response.
11. The chatbot answers a question supported by its Morena Bakery context.
12. The chatbot does not invent information that is absent from its context.
13. The chatbot directs order-specific questions to Check Order Status.
14. The live application works through its public Vercel URL.

## Success Criteria

The current Morena Bakery pilot will be considered successful when:

- Customers can complete the core order transaction from the live product.
- The transaction goes through the project's own serverless backend.
- The transaction is stored persistently in Supabase.
- Required database constraints are present.
- A unique order number is persisted.
- A meaningful transaction status is stored.
- Customers can retrieve an existing transaction by order number.
- Invalid order numbers produce a sensible not-found response.
- The grounded AI chatbot is reachable from the live product.
- The chatbot communicates through the project's own serverless backend.
- The AI API key remains server-side.
- The chatbot stays within its provided Morena Bakery context.
- The README contains the public product URL.
- The project specification reflects the implemented product.
- Final transaction evidence is documented for Delivery 4.

## Out of Scope

The current Morena Bakery pilot does not include:

- Online payment processing
- Customer accounts or login
- Administrative dashboard
- Third-party delivery service integration
- Multiple active bakery storefronts
- Bakery tenant administration
- Full multi-tenant order management
- Automatic order confirmation
- Real-time delivery tracking

These features are not required for the current Delivery 4 implementation.

## Future Product Direction

The broader multi-bakery subscription platform may later include:

- Multiple independent bakery storefronts
- Tenant-based bakery data separation
- Bakery administration tools
- Product customization
- Calendar availability
- Automatic quotations
- Payment processing
- Delivery integrations
- Customer accounts
- Advanced order management
- Image upload

These features are part of the future product direction and are not presented as functionality currently implemented in the Morena Bakery pilot.