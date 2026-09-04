# Multi-Bakery Subscription Platform

## Overview

This project is a subscription-based digital platform concept designed for small bakeries and dessert businesses.

The long-term concept is to allow multiple bakeries to operate as independent tenants with their own products, prices, branding and order requests. Morena Bakery is the pilot used to build and test the current customer ordering experience.

For Delivery 4, the Morena Bakery pilot includes a complete customer transaction, persistent database storage, order status tracking and a grounded AI chatbot.

## Live Product

The current Morena Bakery product is deployed on Vercel and available at:

https://morena-one.vercel.app/

## Core Customer Transaction

The main customer transaction is an order request.

A customer can:

- Browse the Morena Bakery product catalogue.
- View product details, prices and availability.
- Add one or more products to an order.
- Select quantities for each product.
- Enter their name and phone number.
- Select a requested delivery date.
- Submit the order request through the website.

The order is sent through the project's own serverless backend function and stored in the `order_requests` table in Supabase.

After a successful transaction, the customer receives a unique order number in the format `MB-XX`.

New orders are stored with the status `Pending`.

## Order Status Tracking

Customers can use the Check Order Status feature to retrieve an existing order using its order number.

The status lookup is processed through the project's own serverless backend function.

For a valid order number, the application displays:

- Order number
- Current status
- Products
- Quantities
- Requested delivery date

If an order number does not exist, the application displays a clear not-found message.

The public status endpoint does not return the customer's name or phone number.

## Grounded AI Chatbot

The Morena Bakery website includes a customer-facing AI chatbot called Ask Morena Bakery.

The chatbot can answer questions about:

- Morena Bakery products included in its provided business context
- How to place an order
- The order request process
- How customers can check an order status

The chatbot is intentionally grounded in Morena Bakery information. It is instructed not to invent prices, ingredients, delivery fees, payment methods, opening hours, promotions or other information that is not included in its provided context.

If information is unavailable, the chatbot tells the customer that it does not have that information and recommends contacting Morena Bakery directly for confirmation.

The chatbot does not directly access individual customer orders. Customers are directed to the Check Order Status feature for order-specific information.

## Serverless Backend

The application uses serverless API functions deployed with Vercel.

### Order Creation

`/api/order-request`

Accepts the customer order request and writes the transaction to Supabase.

The transaction is first created in the database so that Supabase can return its database ID. The backend then generates the customer-facing order number using that ID and persists the resulting `MB-XX` order code with the transaction.

### Order Status

`/api/order-status`

Reads an existing order by its unique order number and returns the non-sensitive information required for customer status tracking.

### Chatbot

`/api/chat`

Receives customer questions and communicates with the AI provider from the server side.

Secret API keys are not stored in frontend code.

## Database

Supabase is used for persistent transaction storage.

The main transaction table is:

`order_requests`

The transaction records include:

- `id`
- `created_at`
- `product`
- `quantity`
- `customer_name`
- `phone`
- `delivery_date`
- `status`
- `order_code`

The database includes constraints for required transaction fields, a primary key, a unique order code and controlled status values.

The `order_code` field is unique. During order creation, the transaction is first inserted so that the database can generate its ID. The serverless backend then uses that ID to create and persist the customer-facing `MB-XX` order number.

New order requests use `Pending` as their initial status.

Supported status values are:

- `Pending`
- `Confirmed`
- `Completed`
- `Cancelled`

## Security

Sensitive credentials are kept outside the public frontend.

The application uses deployment environment variables for:

- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`

These secret keys are accessed only by server-side functions and are not exposed in the browser code.

The public order status endpoint limits the information returned and does not expose the customer's name or phone number.

## Currently Working

- Product catalogue
- Product details and pricing
- Product availability
- Multi-product shopping cart
- Quantity selection
- Customer order request form
- Serverless order submission
- Persistent Supabase transaction storage
- Unique `MB-XX` order numbers
- Initial `Pending` order status
- Successful order confirmation
- Order status lookup by order number
- Not-found handling for invalid order numbers
- Grounded Morena Bakery AI chatbot
- Server-side AI API integration
- Navigation between the catalogue, ordering and order-status experiences

## Current Screens

### Product Catalogue

Customers can browse the products currently available from Morena Bakery. Each product displays its image, name, price and availability.

### Product Details

Customers can open an individual product to view its image, description, price and availability and continue to the ordering experience.

### Order Request

Customers can add one or more products to the same order, adjust quantities, enter their contact information, select a requested delivery date and submit the order request.

After a successful submission, the transaction is stored in Supabase and the customer receives a unique order number.

### Check Order Status

Customers can enter an order number such as `MB-15` to retrieve the current status and non-sensitive order information.

An invalid or nonexistent order number produces a clear not-found response.

### Ask Morena Bakery

Customers can ask the grounded AI assistant questions about Morena Bakery and the ordering process.

The assistant is restricted to the business information supplied by the application and is instructed not to invent unavailable information.

## Problem

Many small bakeries receive customer orders manually through WhatsApp, Instagram or other social media channels. Customers may need to exchange several messages to ask about products, prices, quantities, delivery dates and the status of an existing request.

This can create delayed responses, incomplete information and difficulties organising customer requests.

## Solution

The Morena Bakery pilot provides a digital customer experience where customers can:

- Browse products and product details.
- Create an order containing one or more products.
- Submit the order through a serverless backend.
- Receive a unique order number.
- Check the status of an existing order.
- Ask a grounded AI assistant for help with Morena Bakery and its ordering process.

The broader multi-bakery subscription model remains the direction for future development beyond the current Morena Bakery pilot.

## Pilot Bakery

Morena Bakery is the first bakery configured in the project and is being used to validate the customer ordering experience before future expansion of the platform.

## Repository Structure

- `/api/order-request.mjs` — Serverless function for creating order requests
- `/api/order-status.mjs` — Serverless function for retrieving order status
- `/api/chat.mjs` — Serverless function for the grounded AI chatbot
- `/docs/PRD.md` — Product Requirements Document
- `/docs/FRD.md` — Functional Requirements Document
- `/docs/FLOW.md` — Product and transaction flow documentation
- `/docs/D1-Summary.pdf` — Delivery 1 executive summary
- `/data/products.json` — Morena Bakery product data in JSON format
- `/data/products.csv` — Product data in CSV format
- `/assets/images/` — Product and brand images
- `/index.html` — Main catalogue and chatbot interface
- `/order.html` — Multi-product order request experience
- `/order-status.html` — Customer order status lookup
- `/app.js` — Catalogue and product-detail logic
- `/styles.css` — Shared Morena Bakery styles

## Environment Variables

The deployed application requires the following server-side environment variables:

`SUPABASE_SERVICE_KEY`

Used by the serverless order functions to securely communicate with Supabase.

`OPENAI_API_KEY`

Used by the serverless chatbot function to communicate with the AI provider.

Secret values must never be committed to the repository or included in frontend JavaScript.

## Delivery 4 Validation

The live product has been tested for the following flows:

1. A customer can create a multi-product order.
2. The transaction is persisted in Supabase.
3. A unique `MB-XX` order number is generated and persisted after the database ID is created.
4. The new transaction receives the status `Pending`.
5. A valid order number can be retrieved through Check Order Status.
6. A nonexistent order number returns a clear not-found response.
7. The public status result returns non-sensitive order information without exposing the customer's name or phone number.
8. The grounded chatbot answers questions based on Morena Bakery information.
9. The chatbot declines to invent information that is not included in its provided context.
10. The chatbot directs customers to Check Order Status instead of claiming access to individual orders.

### Final Transaction Validation

A final Delivery 4 transaction was successfully completed using the deployed product.

Validated order:

`MB-15`

The transaction was:

- Created through the public Morena Bakery website
- Processed through the project's serverless backend
- Persisted in the `order_requests` Supabase table
- Assigned the status `Pending`
- Assigned the unique order number `MB-15`
- Successfully retrieved through Check Order Status

The final validation also confirmed clear not-found behavior using a nonexistent order number.

## Future Development

Future versions may expand the platform with additional bakeries, tenant-specific administration, payment processing, customer accounts and more advanced order management.

These features are outside the scope of the current Morena Bakery pilot and Delivery 4.