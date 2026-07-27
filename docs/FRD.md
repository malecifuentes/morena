# Functional Requirements Document (FRD)

## Core Features

Product Catalogue, Product Pricing and Online Order Request

## Context

These core features are part of a multi-bakery subscription platform. Each bakery has its own storefront, products, prices, and branding. Morena is the pilot bakery used to validate the platform.

---

## Screen 1 – Product Catalogue

### What the user sees

- Bakery name and branding
- List of available products
- Product image (optional placeholder)
- Product category
- Product price
- Button to view product details

### What the user does

The customer browses the products available for the selected bakery and chooses one to view more information.

### Inputs

- Bakery identifier (tenant)
- Product catalogue stored for that bakery

### Outputs

- Products belonging only to the selected bakery
- Product names
- Product prices
- Product availability

### Edge Cases

- If the bakery has no products, the system displays "No products available."
- If the bakery does not exist, the system displays "Bakery not found."
- Products from other bakeries are never displayed.

---

## Screen 2 – Product Details and Pricing

### What the user sees

- Product name
- Product description
- Product category
- Product price
- Availability
- Button to request the product

### What the user does

The customer reviews the product information and decides whether to continue with the order request.

### Inputs

- Selected product
- Bakery identifier

### Outputs

- Product details
- Product price
- Availability status
- Navigation to the online order request form

### Edge Cases

- If the product is unavailable, the order button is disabled.
- If the product does not belong to the selected bakery, it is not displayed.
- If the product cannot be found, the system displays an error message.

---

## Screen 3 – Online Order Form

### What the user sees

- Bakery name
- Available products
- Product prices
- Order request form

### What the user does

The customer selects a product, enters the requested quantity, name, phone number, and preferred pickup or delivery date, then submits the order request.

### Inputs

- Bakery (selected automatically)
- Product
- Quantity
- Customer name
- Phone number
- Requested date

### Outputs

- Confirmation that the order request has been submitted.
- The request is stored under the selected bakery.
- The customer receives a confirmation message.

---

## Screen 4 – Confirmation

### What the user sees

A confirmation message indicating that the bakery has successfully received the order request.

### What the user does

The customer reviews the confirmation message and waits for the bakery to contact them regarding the order.

### Outputs

- Order request successfully recorded.
- The customer is informed that the bakery will contact them to confirm the order.

---

## Error State

If any required field is empty or the selected date is invalid, the system displays an error message and prevents the order request from being submitted until all required information is completed correctly.