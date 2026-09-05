import { test, after } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/order-request.mjs";

const originalFetch = globalThis.fetch;
const originalKey = process.env.SUPABASE_SERVICE_KEY;
process.env.SUPABASE_SERVICE_KEY = "test-only";
after(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_KEY;
  else process.env.SUPABASE_SERVICE_KEY = originalKey;
});
const valid = () => ({
  customer_name: " Test Customer ", phone: " 5555-1234 ", delivery_date: "2026-09-10",
  items: [{ product: "Banana Bread", quantity: 2 }, { product: "Box of 6 Cupcakes", quantity: 3 }],
});
async function call(body, method = "POST") {
  const response = {
    headers: {}, setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await handler({ method, body }, response);
  return response;
}

test("multi-product insert returns database folio/status directly, with no PATCH or lookup", async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    const data = JSON.parse(options.body);
    assert.deepEqual(data.items, valid().items);
    assert.equal(data.customer_name, "Test Customer");
    assert.equal(data.phone, "5555-1234");
    assert.equal(data.status, "Received");
    assert.equal(data.product, "2x Banana Bread | 3x Box of 6 Cupcakes");
    return { ok: true, json: async () => [{ ...data, id: 42, order_code: "MB-42", status: "Received", created_at: "2026-09-04T12:00:00Z" }] };
  };
  const response = await call({ ...valid(), status: "Completed", order_code: "fake" });
  assert.equal(response.code, 201);
  assert.equal(response.body.order.order_code, "MB-42");
  assert.equal(response.body.order.status, "Received");
  assert.equal(response.body.order.created_at, "2026-09-04T12:00:00Z");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.method, "POST");
  assert.equal(requests[0].options.headers.Prefer, "return=representation");
});

test("invalid requests are rejected before any database call", async () => {
  globalThis.fetch = async () => { assert.fail("Invalid order reached database"); };
  const cases = [null, "{bad json", {}, { ...valid(), customer_name: " " },
    { ...valid(), phone: " " }, { ...valid(), delivery_date: "2026-02-30" },
    { ...valid(), delivery_date: "tomorrow" }, { ...valid(), items: [] },
    { ...valid(), items: [{ product: "Unknown cake", quantity: 1 }] },
    ...[0, -1, 1.5, 13, "2", null].map((quantity) => ({ ...valid(), items: [{ product: "Banana Bread", quantity }] })),
    { ...valid(), items: [{ product: "Banana Bread", quantity: 1 }, { product: "Banana Bread", quantity: 2 }] },
  ];
  for (const body of cases) assert.equal((await call(body)).code, 400, JSON.stringify(body));
  assert.equal((await call(valid(), "GET")).code, 405);
});

test("original single-product API payload is still accepted", async () => {
  globalThis.fetch = async (_url, options) => {
    const data = JSON.parse(options.body);
    assert.deepEqual(data.items, [{ product: "Banana Bread", quantity: 2 }]);
    return { ok: true, json: async () => [{ ...data, id: 43, order_code: "MB-43" }] };
  };
  const body = valid();
  delete body.items;
  assert.equal((await call({ ...body, product: "Banana Bread", quantity: "2" })).code, 201);
});

test("failed writes and incomplete responses never report success", async () => {
  globalThis.fetch = async () => ({ ok: false });
  assert.equal((await call(valid())).code, 502);
  globalThis.fetch = async () => ({ ok: true, json: async () => [{ id: 44, status: "Received" }] });
  const incomplete = await call(valid());
  assert.equal(incomplete.code, 502);
  assert.equal(incomplete.body.success, undefined);
  globalThis.fetch = async () => { throw new Error("network"); };
  assert.equal((await call(valid())).code, 502);
});
