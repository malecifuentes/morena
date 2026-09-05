# Online order update — existing Session 8 project

## Database commands

1. Open https://supabase.com/dashboard and select the existing Morena Bakery project (`ospxdofouvetwkzoztfs`).
2. Open **SQL Editor → New query**.
3. Copy the **entire contents of `db/online-order.sql`** from this repository, paste into the editor, and click **Run**. This is the complete migration; do not recreate the project or table.

The migration adds a nullable `items` JSONB column to the existing `public.order_requests`. Each new website order stores an array such as `[{"product":"Banana Bread","quantity":2}]`. Existing product/quantity summaries and historical rows remain intact; old rows may have null `items`.

It changes old `Pending` statuses to `Received`, sets the initial status to `Received`, and assigns `MB-<id>` and `created_at` during the insert. Only status-related checks are replaced; other existing constraints remain. Historical `Cancelled` records remain readable. New orders always start at `Received`, and status changes must follow `Received → Confirmed → Preparing → Completed`.

To advance an order, use the existing Supabase **Table Editor → order_requests**, locate its folio, and edit `status` one step at a time. No new admin application is required.

## Deployment

After the SQL succeeds, commit/push these changes to the branch connected to the existing Vercel project, or deploy this working directory through your usual Vercel workflow. Deploy frontend and API changes together. Keep the existing `SUPABASE_SERVICE_KEY` and `OPENAI_API_KEY` environment variables. No new environment variables or npm dependencies are needed.

The existing Vercel Node function reads `data/products.json` using a literal URL relative to its module, so Vercel's file tracing can include the catalogue in the server function bundle.

## Behavior

- Existing catalogue detail links still prefill the product and quantity.
- The order form loads available Morena products from the same catalogue; the backend validates against that file too.
- The existing 1–12 quantity limit is preserved per product.
- Review displays all selected products, quantities, name, phone and requested delivery date. Edit returns to the preserved form and cart.
- Confirm submits the reviewed snapshot. Repeat clicks are disabled while sending and after success.
- The existing `/api/order-request` makes one Supabase INSERT with `return=representation`. The database assigns the folio in that insert; there is no second PATCH or GET.
- Confirmation displays the folio and status from that function response, with no automatic order-status request. The separate Check Order Status link remains available for later use.
- The existing status lookup continues to show the retained product and quantity summaries, without exposing contact information.
- No delivery address is added: the requested required fields and existing flow collect name, phone and delivery date.

## Verification

With Node.js 22 or newer, run from the project directory:

```sh
node --test tests/*.test.mjs
```

After deployment, create a test order using View Details, choose quantity 2, add a second product with another quantity, review, edit, review again, then confirm. Check that the confirmation shows the returned folio and `Received`. In browser Network tools, confirmation should issue just `POST /api/order-request`, with no order-status lookup. Verify its row in Supabase has `items`, `created_at`, folio and status, then advance its status through the allowed sequence and use the existing status page to check it.
