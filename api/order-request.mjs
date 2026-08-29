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
    fields.some((field) => body[field] === undefined || body[field] === null)
  ) {
    return response.status(400).json({
      error: `Required JSON fields: ${fields.join(", ")}.`,
    });
  }

  const orderRequest = Object.fromEntries(
    fields.map((field) => [field, body[field]])
  );

  try {
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/order_requests`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
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
        error = { message: errorText || "Supabase write failed." };
      }

      return response.status(supabaseResponse.status).json({ error });
    }

    return response.status(201).json({
      success: true,
      message: "Order request saved.",
    });
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
