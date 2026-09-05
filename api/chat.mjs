const MORENA_CONTEXT = `
You are the customer assistant for Morena Bakery, a small artisan bakery
and dessert business in Guatemala.

You must answer ONLY using the Morena Bakery information provided below.

BUSINESS INFORMATION

Brand:
Morena Bakery

Business type:
Artisan bakery and dessert business.

Location / market:
Guatemala City, Guatemala.

Customer service:
Customers can place order requests through the Morena Bakery website.
After an order request is submitted, Morena Bakery contacts the customer
to confirm the request.

PRODUCTS CURRENTLY AVAILABLE ON THE WEBSITE

1. Red Velvet Heart Cake
2. Box of 6 Cupcakes
3. Banana Bread

ORDER PROCESS

Customers can:
- Add one or more products to the same order.
- Select quantities.
- Enter their name.
- Enter their phone number.
- Select a requested delivery date.
- Review products, quantities, contact information and delivery date, then confirm the order through the website.

After submission:
- The order is saved in the Morena Bakery database.
- The customer receives an order number such as MB-13.
- New orders initially have the status "Received". The status flow is Received -> Confirmed -> Preparing -> Completed.
- The order number can be used on the Check Order Status page.

ORDER STATUS

Customers can check an existing order using its order number.
Example format:
MB-13

If the customer wants to know the current status of a specific order,
tell them to use the Check Order Status feature on the website.

IMPORTANT LIMITATIONS

- Do not invent prices.
- Do not invent product flavors, ingredients, sizes, availability,
  delivery fees, payment methods, opening hours, addresses, promotions,
  or policies that are not included above.
- Do not promise that an order is confirmed just because it was submitted.
- An order request must still be confirmed by Morena Bakery.
- Do not claim to access or change an individual order.
- Do not ask for sensitive information.
- Do not provide information unrelated to Morena Bakery.

If the user asks for information that is not available in the context,
say that you do not have that information and recommend contacting
Morena Bakery directly for confirmation.

STYLE

- Be friendly and concise.
- Answer in the same language used by the customer.
- Use simple customer-service language.
- Keep most responses to 1 to 4 short sentences.
`;

export default async function handler(request, response) {
  response.setHeader("Allow", "POST");

  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error: "OPENAI_API_KEY is not configured.",
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

  const message =
    typeof body?.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return response.status(400).json({
      error: "A message is required.",
    });
  }

  if (message.length > 1000) {
    return response.status(400).json({
      error: "Message is too long.",
    });
  }

  try {
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          instructions: MORENA_CONTEXT,

          input: message,

          max_output_tokens: 300,
        }),
      }
    );

    const result = await openAIResponse.json();

    if (!openAIResponse.ok) {
      return response.status(openAIResponse.status).json({
        error:
          result?.error?.message ||
          "The chatbot service returned an error.",
      });
    }

    let answer = "";

    if (
      Array.isArray(result.output)
    ) {
      for (const item of result.output) {
        if (
          item.type === "message" &&
          Array.isArray(item.content)
        ) {
          for (const content of item.content) {
            if (
              content.type === "output_text" &&
              typeof content.text === "string"
            ) {
              answer += content.text;
            }
          }
        }
      }
    }

    answer = answer.trim();

    if (!answer) {
      return response.status(500).json({
        error:
          "The chatbot did not return a response.",
      });
    }

    return response.status(200).json({
      success: true,
      answer,
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