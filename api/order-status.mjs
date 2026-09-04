const SUPABASE_URL =
  "https://ospxdofouvetwkzoztfs.supabase.co";

export default async function handler(
  request,
  response
) {
  response.setHeader("Allow", "GET");
  response.setHeader(
    "Cache-Control",
    "no-store"
  );

  if (request.method !== "GET") {
    return response.status(405).json({
      error: "Method not allowed. Use GET.",
    });
  }

  const serviceKey =
    process.env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) {
    return response.status(500).json({
      error:
        "SUPABASE_SERVICE_KEY is not configured.",
    });
  }

  const rawOrderCode =
    Array.isArray(request.query?.order_code)
      ? request.query.order_code[0]
      : request.query?.order_code;

  const orderCode =
    typeof rawOrderCode === "string"
      ? rawOrderCode.trim().toUpperCase()
      : "";

  if (
    !orderCode ||
    orderCode.length > 20
  ) {
    return response.status(400).json({
      error:
        "A valid order number is required.",
    });
  }

  try {
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/order_requests?order_code=eq.${encodeURIComponent(
        orderCode
      )}&select=id,order_code,product,quantity,delivery_date,status`,
      {
        method: "GET",

        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    if (!supabaseResponse.ok) {
      const errorText =
        await supabaseResponse.text();

      let error;

      try {
        error = JSON.parse(errorText);
      } catch {
        error = {
          message:
            errorText ||
            "The order could not be read from the database.",
        };
      }

      return response
        .status(supabaseResponse.status)
        .json({
          error,
        });
    }

    const rows =
      await supabaseResponse.json();

    if (
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return response.status(404).json({
        error: "Order not found.",
      });
    }

    const order = rows[0];

    return response.status(200).json({
      success: true,

      order: {
        id: order.id,
        order_code: order.order_code,
        product: order.product,
        quantity: order.quantity,
        delivery_date:
          order.delivery_date,
        status: order.status,
      },
    });
  } catch (error) {
    return response.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}