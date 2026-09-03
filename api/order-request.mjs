const SUPABASE_URL = "https://ospxdofouvetwkzoztfs.supabase.co";

export default async function handler(request, response) {
  response.setHeader("Allow", "POST");

  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) {
    return response.status(500).json({
      error: "SUPABASE_SERVICE_KEY is not configured.",
    });
  }

  let body;

  try {
    body =
      typeof request.body === "string"
        ? JSON.parse(request.body)
        : request.body;
  } catch {
    return response.status(400).json({
      error: "Request body must be valid JSON.",
    });
  }

  const fields = [
    "product",
    "quantity",
    "customer_name",
    "phone",
    "delivery_date",
  ];

  if (
    !body ||
    typeof body !== "object" ||
    fields.some(
      (field) =>
        body[field] === undefined ||
        body[field] === null ||
        String(body[field]).trim() === ""
    )
  ) {
    return response.status(400).json({
      error: `Required JSON fields: ${fields.join(", ")}.`,
    });
  }

  const orderRequest = {
    product: String(body.product).trim(),
    quantity: String(body.quantity).trim(),
    customer_name: String(body.customer_name).trim(),
    phone: String(body.phone).trim(),
    delivery_date: String(body.delivery_date).trim(),
    status: "Pending",
  };

  try {
    // 1. Create the order and return the new row
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/order_requests`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(orderRequest),
      }
    );

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();

      let error;

      try {
        error = JSON.parse(errorText);
      } catch {
        error = {
          message: errorText || "Supabase write failed.",
        };
      }

      return response.status(supabaseResponse.status).json({
        error,
      });
    }

    const createdRows = await supabaseResponse.json();
    const createdOrder = createdRows[0];

    if (!createdOrder || !createdOrder.id) {
      return response.status(500).json({
        error: "The order was created, but its ID could not be returned.",
      });
    }

    // 2. Build the public order code
    const orderCode = `MB-${createdOrder.id}`;

    // 3. Save the order code in the same row
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/order_requests?id=eq.${createdOrder.id}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          order_code: orderCode,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();

      return response.status(updateResponse.status).json({
        error: errorText || "The order code could not be saved.",
      });
    }

    const updatedRows = await updateResponse.json();
    const finalOrder = updatedRows[0];

    return response.status(201).json({
      success: true,
      message: "Order request saved.",
      order: {
        id: finalOrder.id,
        order_code: finalOrder.order_code,
        product: finalOrder.product,
        quantity: finalOrder.quantity,
        customer_name: finalOrder.customer_name,
        phone: finalOrder.phone,
        delivery_date: finalOrder.delivery_date,
        status: finalOrder.status,
      },
    });
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}