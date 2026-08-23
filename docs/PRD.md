# Product Requirements Document (PRD)

## Project

Multi-Bakery Subscription Platform — Morena Pilot

## Overview

This project explores a digital subscription platform concept for small bakeries and dessert businesses.

The long-term product vision is to allow multiple bakeries to operate their own digital storefronts with separate products, branding and customer order requests.

The current implementation focuses on Morena Bakery as the pilot. The Morena pilot is used to build and validate the customer experience before expanding the platform to additional bakery tenants.

## Problem

Many small bakeries receive orders manually through WhatsApp, Instagram or other social media channels. Customers may need to exchange several messages to ask about available products, prices, quantities and delivery dates.

This process can make customer requests difficult to organise and can lead to delayed responses or incomplete order information.

## Target Users

### Primary User: Small Bakery Owners

The primary users are owners of small bakeries and dessert businesses that currently receive customer enquiries and order requests manually through WhatsApp, Instagram or other social media channels.

They need a simple digital storefront where customers can view products and submit structured order requests.

For the current implementation, Morena Bakery represents this primary user.

### Secondary User: Bakery Customers

The secondary users are customers who want to browse available products, check prices and availability, select a quantity and submit an order request without exchanging multiple messages with the bakery.

They need a clear and simple experience that allows them to provide the information necessary for the bakery to follow up on their request.

## Goal

The goal of the current Morena pilot is to provide a simple digital storefront where customers can:

* Browse available products.
* View product details, prices and availability.
* Select a quantity.
* Submit an online order request.
* Receive confirmation that their request was successfully recorded.

The broader product goal is to use the Morena pilot as the foundation for a future subscription platform serving multiple independent bakeries.

## Current MVP Features

* Product catalogue
* Product images
* Product details and descriptions
* Product prices
* Product availability
* Quantity selection
* Online order request form
* Product and quantity carried from Product Details to the order form
* Order request storage in Supabase
* Successful submission confirmation
* Navigation between the Product Catalogue, Product Details and Online Order Request Form

## User Stories

* As a customer, I want to browse Morena Bakery products so that I can decide what I would like to order.
* As a customer, I want to see product details, prices and availability before submitting an order request.
* As a customer, I want to select the quantity I want before continuing to the order form.
* As a customer, I want my selected product and quantity to carry into the order form so that I do not have to enter the same information again.
* As a customer, I want to provide my name, phone number and delivery date so that the bakery has the information needed to follow up on my request.
* As a customer, I want to receive confirmation that my request was successfully recorded.
* As a bakery owner, I want customer order requests to be stored in a structured format so that they can be reviewed after submission.

## Current Customer Flow

The current Morena Bakery customer flow is:

**Product Catalogue → Product Details → Select Quantity → Place an Order → Online Order Request Form → Successful Submission Confirmation**

The customer can also navigate back to the Product Catalogue from the Product Details screen and from the Online Order Request Form.

## Out of Scope

The current Morena pilot does not include:

* Online payments
* Customer accounts or login
* Inventory management
* Delivery tracking
* Administrative dashboards
* Chatbot integration
* Third-party delivery services
* Shopping cart
* Multiple active bakery storefronts
* Bakery tenant administration
* Full multi-tenant order management

## Success Criteria

The current Morena pilot will be considered successful when:

* Customers can view the Morena Bakery product catalogue.
* Customers can view product details, prices and availability.
* Customers can select a quantity.
* The selected product and quantity are carried into the Online Order Request Form.
* Customers can complete the required order request information.
* Customers can submit an online order request successfully.
* The submitted request is stored in the `order_requests` table in Supabase.
* Required fields are validated before submission.
* Customers receive a confirmation message after a successful submission.
* Navigation between the implemented screens works correctly.

## Future Product Direction

The broader multi-bakery subscription platform may later include:

* Multiple independent bakery storefronts
* Tenant-based bakery data separation
* Bakery administration tools
* Product customization
* Calendar availability
* Automatic quotations
* Delivery options
* Shopping cart
* Image upload

These features are part of the future product direction and are not presented as functionality currently implemented in the Morena Bakery pilot.
