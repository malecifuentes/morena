# Functional Requirements Document (FRD)

## Feature

Online Order Request Form

## Context

This feature is part of a multi-bakery subscription platform. Each bakery has its own storefront, products, prices, and branding. Morena is the pilot bakery used to validate the platform.

---

## Screen 1 – Online Order Form

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

---

## Screen 2 – Confirmation

### What the user sees

A confirmation message indicating that the bakery has successfully received the order request.

### Outputs

- Order request successfully recorded.
- Customer informed that the bakery will contact them to confirm the order.

---

## Error State

If any required field is empty or the selected date is invalid, the system displays an error message and prevents the order request from being submitted until all required information is completed correctly.