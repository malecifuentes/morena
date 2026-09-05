# Functional Requirements Document (FRD)

> Online-order update: see [setup and migration instructions](ONLINE-ORDER-SETUP.md). The current flow adds an explicit review step, structured items, atomic folio creation, and Received → Confirmed → Preparing → Completed. The Delivery 4 descriptions and validation records below document the earlier implementation.


## Project

Multi-Bakery Subscription Platform — Morena Bakery Pilot

## Current Product Scope

This FRD describes the functionality currently implemented and available in the Morena Bakery pilot for Delivery 4.

The current product includes:

- Product Catalogue
- Product Details and Pricing
- Multi-Product Order Request
- Quantity Management
- Serverless Order Submission
- Supabase Transaction Storage
- Unique Order Number
- Order Status
- Successful Submission Confirmation
- Check Order Status
- Grounded AI Chatbot

---

## Screen 1 – Product Catalogue

### What the user sees

- Morena Bakery branding
- Available products
- Product images
- Product categories
- Product prices
- Availability status
- Links to view product details
- Access to Place an Order
- Ask Morena Bakery chatbot

### What the user does

The customer browses the Morena Bakery product catalogue and can select a product to view more information.

The customer can also continue to the ordering experience or ask the Morena Bakery assistant a question.

### Inputs

- Morena Bakery product catalogue loaded from `data/products.json`

### Outputs

- Product names
- Product images
- Product categories
- Product prices
- Product availability
- Navigation to Product Details
- Navigation to Place an Order
- Grounded chatbot responses

### Edge Cases

- If no products are available, the system displays an appropriate empty state.
- If product data cannot be loaded, the catalogue does not display unavailable product information.

---

## Screen 2 – Product Details and Pricing

### What the user sees

- Product image
- Product name
- Product description
- Product category
- Product price
- Availability status
- Quantity selector
- Link to continue with an order
- Navigation back to the Product Catalogue

### What the user does

The customer reviews the selected product and can select a quantity before continuing to the ordering experience.

The customer can also return to the Product Catalogue.

### Inputs

- Selected product
- Selected quantity

### Outputs

- Product details
- Product price
- Product availability
- Selected quantity
- Navigation to the ordering experience
- Navigation back to the Product Catalogue

### Edge Cases

- If a product is unavailable, it cannot proceed through the normal available-product flow.
- If the requested product cannot be found, the system displays an appropriate unavailable-product message.
- Quantity selection is limited to supported values.

---

## Screen 3 – Multi-Product Order Request

### What the user sees

- Morena Bakery branding
- Product selector
- Quantity selector
- Add to Order control
- Current order/cart
- Quantity adjustment controls
- Product removal controls
- Customer name field
- Phone field
- Requested delivery date field
- Submit order request button
- Link to Check Order Status
- Navigation back to the Product Catalogue

### What the user does

The customer creates an order request containing one or more Morena Bakery products.

The customer can:

- Select a product
- Select a quantity
- Add the product to the order
- Add additional products
- Increase or decrease quantities
- Remove products
- Enter customer name
- Enter phone number
- Select a requested delivery date
- Submit the complete order request

### Inputs

- One or more products
- Quantity for each product
- Customer name
- Phone
- Requested delivery date

### Frontend Processing

Before submission, the selected products and quantities are converted into transaction summaries that can be stored with the order request.

The frontend sends the completed transaction to:

`/api/order-request`

using a `POST` request.

### Backend Processing

The serverless order function:

1. Accepts only the supported request method.
2. Validates required fields.
3. Reads the Supabase service credential from a server-side environment variable.
4. Creates the transaction in Supabase.
5. Receives the newly generated database ID.
6. Creates a customer-facing order number using that ID.
7. Updates the transaction with the generated order number.
8. Returns the completed transaction information to the frontend.

### Outputs

A successful order contains:

- Database transaction ID
- Unique order number
- Products
- Quantities
- Customer name
- Phone
- Requested delivery date
- Initial status

### Validation

- At least one product is required.
- Quantity is required.
- Customer name is required.
- Phone is required.
- Requested delivery date is required.
- Empty required values are rejected by the backend.
- Invalid request bodies return an error response.

### Error Cases

- Unsupported HTTP method
- Missing required transaction information
- Invalid JSON request
- Missing server-side Supabase configuration
- Supabase write failure
- Order number update failure
- Network or unexpected server error

The interface must not show a successful confirmation if the transaction was not successfully completed.

---

## Serverless Function – Order Creation

### Route

`/api/order-request`

### Method

`POST`

### Purpose

Create and persist the core Delivery 4 customer transaction.

### Required Request Data

- `product`
- `quantity`
- `customer_name`
- `phone`
- `delivery_date`

### Server-Side Configuration

The function uses:

`SUPABASE_SERVICE_KEY`

This value is stored as a deployment environment variable and is not exposed to the frontend.

### Transaction Sequence

The transaction is created in two persistence steps:

1. The order request is inserted into Supabase.
2. Supabase generates and returns the transaction `id`.
3. The backend creates an order number in the format `MB-ID`.
4. The backend updates the same transaction with that `order_code`.

Example:

Database ID:

`15`

Customer-facing order number:

`MB-15`

### Successful Response

The backend returns transaction information including:

- `id`
- `order_code`
- `product`
- `quantity`
- `customer_name`
- `phone`
- `delivery_date`
- `status`

---

## Successful Submission Confirmation

After the transaction is stored successfully and its order number has been persisted, the customer receives a confirmation on the order page.

The confirmation includes:

- Successful order request message
- Unique order number
- Current order status
- Access to Check Order Status

The unique order number follows this format:

`MB-XX`

Example:

`MB-15`

New order requests initially use:

`Pending`

A successfully submitted request is recorded but is not automatically considered confirmed by Morena Bakery.

---

## Screen 4 – Check Order Status

### What the user sees

- Morena Bakery branding
- Order number field
- Check status control
- Order result area
- Navigation back to the catalogue

### What the user does

The customer enters an order number such as:

`MB-15`

and requests the current order information.

### Inputs

- Order number

### Frontend Processing

The page sends a `GET` request to:

`/api/order-status`

with the supplied order number.

### Successful Outputs

For an existing order, the interface displays:

- Order number
- Current status
- Products
- Quantities
- Requested delivery date

### Privacy Requirement

The public status experience does not display or return:

- Customer name
- Phone number

### Not-Found Case

If the order number does not match an existing transaction, the backend returns a not-found response.

The interface displays a clear message indicating that the order could not be found.

### URL Prefill

When the customer reaches Check Order Status from a successful order confirmation, the order number can be supplied through the page URL and prefilled into the order number field.

---

## Serverless Function – Order Status

### Route

`/api/order-status`

### Method

`GET`

### Purpose

Read back a persisted transaction using its customer-facing order number.

### Required Input

- `order_code`

### Server-Side Processing

The function:

1. Accepts only the supported request method.
2. Validates that an order number was provided.
3. Normalizes the supplied order number.
4. Reads the Supabase service credential from the server-side environment.
5. Queries the `order_requests` table by `order_code`.
6. Returns a not-found response when no matching transaction exists.
7. Returns only non-sensitive order information when a match exists.
8. Uses `Cache-Control: no-store` for the public status response.

### Successful Response Data

- `id`
- `order_code`
- `product`
- `quantity`
- `delivery_date`
- `status`

---

## Screen 5 – Ask Morena Bakery

### What the user sees

- Ask Morena Bakery heading
- Introductory assistant message
- Customer question field
- Send button
- Conversation area
- Assistant responses

### What the user does

The customer enters a question related to Morena Bakery or the ordering process.

### Inputs

- Customer message

### Frontend Processing

The browser sends the customer message to:

`/api/chat`

using a `POST` request.

### Outputs

- Customer message displayed in the conversation
- Grounded Morena Bakery assistant response
- Connection or error feedback when the assistant cannot respond

---

## Serverless Function – Grounded Chatbot

### Route

`/api/chat`

### Method

`POST`

### Purpose

Provide customer assistance based on Morena Bakery-specific information.

### Required Request Data

- `message`

### Server-Side Configuration

The function uses:

`OPENAI_API_KEY`

The API key is stored as a deployment environment variable and is not exposed in frontend code.

### Grounding Context

The serverless function provides the assistant with Morena Bakery business information and explicit response limitations.

The assistant can answer supported questions about:

- Morena Bakery products included in its context
- How to place an order
- Multi-product ordering
- Order numbers
- Initial order status
- Check Order Status

### Grounding Restrictions

The assistant must not invent unavailable information such as:

- Prices not included in its context
- Ingredients
- Product sizes
- Delivery fees
- Payment methods
- Opening hours
- Addresses
- Promotions
- Unsupported policies

If the requested information is not available, the assistant should state that it does not have that information and recommend contacting Morena Bakery directly.

### Individual Orders

The chatbot does not directly access individual customer orders.

If a customer asks for the status of a specific order, the chatbot directs the customer to Check Order Status.

### Validation

- Message is required.
- Empty messages are rejected.
- Excessively long messages are rejected.
- Unsupported HTTP methods are rejected.
- Missing server-side AI configuration returns an error.

---

## Data Storage

Order requests are stored in the Supabase table:

`order_requests`

### Fields

- `id`
- `created_at`
- `product`
- `quantity`
- `customer_name`
- `phone`
- `delivery_date`
- `status`
- `order_code`

### Database Constraints

The implemented transaction table includes:

- Primary key on `id`
- Required core transaction fields
- Unique `order_code`
- Default `Pending` status
- Controlled valid status values

The `order_code` field remains nullable during the initial database insert because the backend requires the generated database ID before it can construct the customer-facing order number.

Immediately after the ID is returned, the backend generates and persists the `MB-ID` order code in the same transaction record.

### Supported Status Values

- `Pending`
- `Confirmed`
- `Completed`
- `Cancelled`

---

## Security Requirements

Sensitive credentials must remain server-side.

The application uses the following deployment environment variables:

- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`

The secret values must not appear in:

- Public frontend JavaScript
- Public HTML
- Repository documentation
- Committed environment files

The public order-status endpoint must not return customer name or phone number.

---

## Current Navigation Flow

### Core Transaction

**Product Catalogue → Product Details / Product Selection → Multi-Product Order → Submit Order → Serverless Backend → Supabase → Database ID → Order Number → Pending Status → Confirmation**

### Order Read-Back

**Check Order Status → Order Number → Serverless Backend → Supabase → Order Details + Status**

### Not Found

**Check Order Status → Invalid Order Number → Serverless Backend → No Matching Transaction → Not Found Message**

### Grounded Chatbot

**Product Catalogue → Ask Morena Bakery → Serverless Chat Backend → AI Provider → Grounded Response**

---

## Delivery 4 Final Validation

The deployed Morena Bakery product has been validated using a final test transaction.

### Final Test Order

Order number:

`MB-15`

Status:

`Pending`

Products:

- 1x Banana Bread
- 1x Red Velvet Heart Cake

Requested delivery date:

`2026-09-05`

The final validation confirmed:

- Successful multi-product order creation
- Persistent Supabase transaction storage
- Unique order number generation
- Initial `Pending` status
- Successful order lookup using `MB-15`
- Correct product and quantity read-back
- Correct requested delivery date read-back
- Clear not-found behavior using `MB-99999`
- Public status response without customer name or phone
- Grounded chatbot responses using Morena Bakery information
- Chatbot refusal to invent unavailable information
- Chatbot guidance for the customer ordering process
- Chatbot redirection to Check Order Status for individual order questions

---

## Current Implementation Boundary

Morena Bakery is the currently implemented pilot.

The broader subscription-platform concept may support multiple independent bakery tenants in the future.

The current implementation does not include:

- Payment processing
- Customer accounts or login
- Administrative dashboard
- Multiple active bakery storefronts
- Tenant administration
- Full multi-tenant order management
- Third-party delivery integration
- Automatic order confirmation

These features are outside the scope of the current Delivery 4 product.