import { readFile } from "node:fs/promises";

const SUPABASE_URL = "https://ospxdofouvetwkzoztfs.supabase.co";
const catalogue = JSON.parse(
  await readFile(new URL("../data/products.json", import.meta.url), "utf8")
);

export default async function handler(request, response) {
  response.setHeader("Allow", "POST");
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed. Use POST." });
  }
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return response.status(500).json({ error: "SUPABASE_SERVICE_KEY is not configured." });
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  } catch {
    return response.status(400).json({ error: "Request body must be valid JSON." });
  }
  const fields = ["customer_name", "phone", "delivery_date"];
  if (!body || fields.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
    return response.status(400).json({ error: `Required fields: ${fields.join(", ")}.` });
  }
  const deliveryDate = body.delivery_date.trim();
  const parsedDate = new Date(`${deliveryDate}T00:00:00Z`);
  if (body.customer_name.trim().length > 100 || body.phone.trim().length > 20 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== deliveryDate) {
    return response.status(400).json({ error: "Enter a valid name, phone number and delivery date." });
  }
  // Keep support for the original single-product API payload.
  const items = body.items ?? [{ product: body.product, quantity: Number(body.quantity) }];
  const available = catalogue.filter((product) => product.bakery === "Morena" && product.available);
  if (!Array.isArray(items) || !items.length || items.length > available.length ||
      items.some((item) => !item || !available.some((product) => product.name === item.product) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 12) ||
      new Set(items.map((item) => item.product)).size !== items.length) {
    return response.status(400).json({ error: "Select available catalogue products with a quantity from 1 to 12 each, without duplicate products." });
  }
  const orderRequest = {
    items: items.map(({ product, quantity }) => ({ product, quantity })),
    // Preserve the existing status page and historical summary columns.
    product: items.map((item) => `${item.quantity}x ${item.product}`).join(" | "),
    quantity: items.map((item) => item.quantity).join(", "),
    customer_name: body.customer_name.trim(),
    phone: body.phone.trim(),
    delivery_date: deliveryDate,
    status: "Received",
  };
  try {
    // The database trigger assigns the folio in this same insert.
    const saved = await fetch(`${SUPABASE_URL}/rest/v1/order_requests`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(orderRequest),
    });
    if (!saved.ok) {
      return response.status(502).json({ error: "The order could not be saved. Please try again." });
    }
    const [order] = await saved.json();
    if (!order?.order_code || !order?.status) {
      return response.status(502).json({ error: "The order service did not return a folio and status. Contact Morena Bakery before retrying." });
    }
    return response.status(201).json({
      success: true,
      message: "Order received successfully.",
      order: {
        id: order.id, order_code: order.order_code, status: order.status,
        items: order.items, product: order.product, quantity: order.quantity,
        customer_name: order.customer_name, phone: order.phone,
        delivery_date: order.delivery_date, created_at: order.created_at,
      },
    });
  } catch {
    return response.status(502).json({ error: "The order service could not confirm the result. Contact Morena Bakery before retrying." });
  }
}
