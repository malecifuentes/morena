# Morena Bakery — Brand Brief

## What it is

Morena Bakery is the pilot bakery for a subscription-based multi-bakery platform designed for small bakeries that want their own digital storefront. Customers can browse Morena's product catalogue, view prices and availability, and submit an online order request through a simple and organized experience.

## Palette

- Primary: #6B2D3E (deep burgundy — use for headings, navigation and key brand elements)
- Accent: #C89B6D (warm caramel — use for prices, highlights and the main button)
- Background: #FAF3EA (warm cream — use as the main page background)

## Fonts

- Headings: Libre Baskerville
- Body: Karla

## Tone

Warm, artisanal, trustworthy. Not this: not a generic corporate e-commerce site or a cold mass-market bakery platform.

## Screens

- Product Catalogue (home)
- Product Details and Pricing
- Keep typography, spacing, colors, and visual styling consistent across both screens.

## Stack, pinned

Plain HTML, CSS and JavaScript reading a local JSON file, styled with Bootstrap 5 loaded from a CDN. No framework, no npm, no build step.

Bootstrap 5 — two lines, both required:

```html
<!-- in <head> -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- just before </body> -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>