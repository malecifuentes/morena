import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../order.html", import.meta.url), "utf8");
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));

// Exercise the real page script with a minimal DOM, without sending real orders.
async function page(createOrder) {
  const elements = new Map();
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: "", hidden: false, disabled: false, innerHTML: "", textContent: "", options: [], children: [], listeners: {},
      add(option) { this.options.push(option); },
      addEventListener(type, callback) { this.listeners[type] = callback; },
      appendChild(child) { this.children.push(child); },
      reportValidity() { return true; }, focus() {},
    });
    return elements.get(selector);
  }
  element("#customer_name").value = "Test Customer";
  element("#phone").value = "5555-1234";
  element("#delivery_date").value = "2026-09-10";
  const requests = [];
  await vm.runInNewContext(`(async () => {${script}\n})()`, {
    document: { querySelector: element, createElement: () => element(`created-${Math.random()}`) },
    window: { location: { search: "?product=Banana+Bread&quantity=2" } },
    URLSearchParams, Date,
    Option: function(text, value) { this.text = text; this.value = value; },
    FormData: function() { this.get = (key) => element(`#${key}`).value; },
    alert(text) { throw new Error(text); },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return url === "data/products.json" ? { ok: true, json: async () => products } : createOrder(url, options);
    },
  });
  async function fire(selector, type = "click") {
    await element(selector).listeners[type]({ preventDefault() {} });
  }
  return { element, requests, fire };
}

test("prefill, multiple items, review/edit and confirmation use exactly the creation response", async () => {
  let submitted;
  const { element, requests, fire } = await page(async (_url, options) => {
    submitted = JSON.parse(options.body);
    return { ok: true, json: async () => ({ success: true, order: { order_code: "MB-987", status: "Received" } }) };
  });
  assert.equal(element("#product").options.length, products.filter((p) => p.bakery === "Morena" && p.available).length);
  assert.match(element("#cart-items").children[0].innerHTML, /Banana Bread/);
  assert.match(element("#cart-items").children[0].innerHTML, /Quantity: 2/);
  element("#product").value = "Box of 6 Cupcakes";
  element("#quantity").value = "3";
  await fire("#add-product-button");
  await fire("#order-form", "submit");
  assert.equal(requests.length, 1, "Review must not submit an order");
  assert.match(element("#review-details").innerHTML, /Quantity: 2/);
  assert.match(element("#review-details").innerHTML, /Quantity: 3/);
  assert.match(element("#review-details").innerHTML, /Test Customer/);
  assert.match(element("#review-details").innerHTML, /5555-1234/);
  assert.match(element("#review-details").innerHTML, /2026-09-10/);
  await fire("#edit-order");
  assert.equal(element("#order-form").hidden, false);
  element("#phone").value = "5555-5678";
  await fire("#order-form", "submit");
  await fire("#confirm-order");
  await fire("#confirm-order");
  assert.equal(requests.length, 2, "One catalogue fetch and one creation POST; no lookup or duplicate submission");
  assert.equal(requests[1].url, "/api/order-request");
  assert.deepEqual(submitted.items, [{ product: "Banana Bread", quantity: 2 }, { product: "Box of 6 Cupcakes", quantity: 3 }]);
  assert.equal(submitted.phone, "5555-5678");
  assert.match(element("#form-message").innerHTML, /MB-987/);
  assert.match(element("#form-message").innerHTML, /Status: Received/);
  assert.equal(element("#order-review").hidden, true);
});

test("creation failure preserves review and allows editing without false confirmation", async () => {
  const { element, fire } = await page(async () => ({ ok: false, json: async () => ({ error: "Could not save" }) }));
  await fire("#order-form", "submit");
  await fire("#confirm-order");
  assert.equal(element("#form-message").className, "form-message error");
  assert.equal(element("#form-message").textContent, "Could not save");
  assert.equal(element("#confirm-order").disabled, false);
  assert.equal(element("#order-review").hidden, false);
  await fire("#edit-order");
  assert.equal(element("#customer_name").value, "Test Customer");
});
