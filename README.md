# Multi-Bakery Subscription Platform

## Overview

This project is a subscription-based digital platform concept designed for small bakeries and dessert businesses.

The long-term concept is to allow multiple bakeries to operate as independent tenants with their own products, prices, branding and order requests. Morena Bakery is the pilot used to build and test the current customer ordering experience.

## Live Product

The current Morena Bakery product is deployed on Vercel and available at:

https://morena-one.vercel.app/

## Currently Working

* Product catalogue
* Product details and pricing
* Product availability
* Quantity selection
* Navigation from the catalogue to product details
* Navigation from product details back to the catalogue
* Order request form
* Product and quantity selection carried from the product detail screen into the order form
* Navigation from the order form back to the catalogue
* Order requests saved to the `order_requests` table in Supabase
* Confirmation message after a successful order request

## Current Screens

### Product Catalogue

Customers can browse the products currently available from Morena Bakery. Each product displays its image, name, price and availability.

### Product Details

Customers can open an individual product to view its image, description, price and availability. They can select a quantity and continue to the order form. The selected product and quantity are carried into the form automatically.

### Order Request Form

Customers can submit an order request with:

* Product
* Quantity
* Customer name
* Phone
* Delivery date

When the form is submitted successfully, the request is stored in the `order_requests` table in Supabase and the customer sees a confirmation message.

## Problem

Many small bakeries receive customer orders manually through WhatsApp, Instagram or other social media channels. Customers may need to exchange several messages to ask about available products, prices, quantities and delivery dates. This can create delayed responses, incomplete information and difficulties organising customer requests.

## Solution

The current Morena Bakery pilot provides a digital storefront where customers can:

* Browse the product catalogue.
* View product details, prices and availability.
* Select a quantity.
* Continue directly to an order request form.
* Submit their contact and delivery information.
* Receive confirmation that the request was recorded.

The broader multi-bakery subscription model remains the direction for future development beyond the current Morena pilot.

## Current MVP Features

* Product catalogue
* Product details and pricing
* Product availability
* Quantity selection
* Order request form
* Supabase order request storage
* Successful submission confirmation
* Navigation between the catalogue, product details and order form

## Pilot Bakery

Morena Bakery is the first bakery configured in the project and is being used to validate the customer ordering experience before future expansion of the platform.

## Repository Structure

* `/docs/PRD.md` — Product Requirements Document
* `/docs/FRD.md` — Functional Requirements Document
* `/docs/D1-Summary.pdf` — Delivery 1 executive summary
* `/data/products.json` — Morena Bakery product data in JSON format
* `/data/products.csv` — Sample product data in CSV format
* `/assets/images/` — Product and brand images
* `/index.html` — Main product catalogue
* `/order.html` — Order request form
* `/app.js` — Catalogue, product detail and quantity-selection logic
* `/styles.css` — Shared Morena Bakery styles
