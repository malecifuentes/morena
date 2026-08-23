# Functional Requirements Document (FRD)

## Current Product Scope

The current product is the Morena Bakery pilot of a broader multi-bakery subscription platform concept.

This FRD describes only the functionality currently implemented and available in the Morena Bakery product.

The current product includes:

* Product Catalogue
* Product Details and Pricing
* Quantity Selection
* Online Order Request Form
* Supabase Order Request Storage
* Successful Submission Confirmation

---

## Screen 1 – Product Catalogue

### What the user sees

* Morena Bakery branding
* Available products
* Product images
* Product categories
* Product prices
* Availability status
* Link to view product details
* Access to the order request form

### What the user does

The customer browses the Morena Bakery product catalogue and selects a product to view more information.

### Inputs

* Morena Bakery product catalogue loaded from `data/products.json`

### Outputs

* Product names
* Product images
* Product categories
* Product prices
* Product availability
* Navigation to Product Details

### Edge Cases

* If no products are available, the system displays a message indicating that no products are currently available.
* If the product data cannot be loaded, the catalogue displays its empty state instead of unavailable product information.

---

## Screen 2 – Product Details and Pricing

### What the user sees

* Product image
* Product name
* Product description
* Product category
* Product price
* Availability status
* Quantity selector
* Link to place an order
* Navigation back to the Product Catalogue

### What the user does

The customer reviews the selected product, chooses a quantity between 1 and 12, and can continue directly to the Online Order Request Form.

The customer can also return to the Product Catalogue.

### Inputs

* Selected product
* Selected quantity

### Outputs

* Product details
* Product price
* Product availability
* Selected quantity
* Product and quantity passed to the Online Order Request Form
* Navigation to the Online Order Request Form
* Navigation back to the Product Catalogue

### Edge Cases

* If a product is unavailable, the product cannot proceed through the normal available-product detail flow.
* If the requested product cannot be found, the system displays a message indicating that the product is not available.
* Quantity selection is limited to values from 1 to 12.

---

## Screen 3 – Online Order Request Form

### What the user sees

* Morena Bakery branding
* Product field
* Quantity field
* Customer name field
* Phone field
* Delivery date field
* Send order request button
* Navigation back to the Product Catalogue

### What the user does

When the customer arrives from a Product Details screen, the selected product and quantity are automatically carried into the order form.

The customer completes the remaining information:

* Customer name
* Phone
* Delivery date

The customer then submits the order request.

The product and quantity can also be reviewed in the form before submission.

### Inputs

* Product
* Quantity
* Customer name
* Phone
* Delivery date

### Outputs

* An order request is written to the `order_requests` table in Supabase.
* The stored request contains the product, quantity, customer name, phone number and delivery date.
* A success message is displayed when the request is saved successfully.

### Validation

* Product is required.
* Quantity is required and must be between 1 and 12.
* Customer name is required.
* Phone is required.
* Delivery date is required.
* The delivery date must be a future date.

### Error Cases

* The form cannot be submitted when required fields are empty.
* Invalid quantity values are prevented by the quantity field limits.
* Dates before the permitted delivery date cannot be selected.
* If Supabase cannot save the request, the customer sees an error message and can try submitting the form again.

---

## Successful Submission Confirmation

The current product does not use a separate confirmation screen.

After Supabase successfully stores the order request, a confirmation message appears on the Online Order Request Form:

**“Thank you! Your order request has been saved.”**

The confirmation tells the customer that the request was recorded successfully.

---

## Data Storage

Order requests are stored in one Supabase table:

`order_requests`

The form writes the following customer-submitted information:

* Product
* Quantity
* Customer name
* Phone
* Delivery date

Supabase also maintains the record identifier and creation timestamp for each stored request.

---

## Current Navigation Flow

The implemented customer flow is:

**Product Catalogue → Product Details → Select Quantity → Place an Order → Online Order Request Form → Successful Submission Confirmation**

The customer can navigate back to the Product Catalogue from the Product Details screen and from the Online Order Request Form.

---

## Current Implementation Boundary

Morena Bakery is currently the implemented pilot.

The broader concept is a subscription platform that could support multiple independent bakery tenants in the future. Multi-tenant bakery management, tenant administration and additional bakery storefronts are not part of the currently implemented Morena Bakery product described in this FRD.
