const catalogueView = document.querySelector("#catalogue-view");
const detailView = document.querySelector("#detail-view");
const catalogue = document.querySelector("#catalogue");
const productDetail = document.querySelector("#product-detail");

let products = [];

const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 0,
});

function availabilityMarkup(available) {
  const status = available ? "Available" : "Unavailable";
  const className = available
    ? "availability"
    : "availability unavailable";

  return `<span class="${className}">${status}</span>`;
}

function buildOrderUrl(product, quantity = 1) {
  const params = new URLSearchParams({
    product: product.name,
    quantity: quantity,
  });

  return `order.html?${params.toString()}`;
}

function showCatalogue() {
  history.replaceState({}, "", window.location.pathname);
  document.title = "Morena Bakery — Product Catalogue";

  detailView.classList.add("d-none");
  catalogueView.classList.remove("d-none");

  if (!products.length) {
    catalogue.innerHTML = `
      <div class="col-12">
        <p class="empty-state">
          No products are available right now. Please check again soon.
        </p>
      </div>
    `;
    return;
  }

  catalogue.innerHTML = products
    .map(
      (product) => `
        <div class="col-12 col-md-6 col-lg-4">
          <article class="card product-card">

            <img
              class="card-img-top product-image"
              src="${product.image}"
              alt="${product.name}"
            >

            <div class="card-body">
              <p class="category">${product.category}</p>

              <h2>${product.name}</h2>

              <div class="mt-auto">

                <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <span class="price">
                    ${currency.format(product.price)}
                  </span>

                  ${availabilityMarkup(product.available)}
                </div>

                <a
                  class="card-link"
                  href="?product=${product.id}"
                  data-product-id="${product.id}"
                >
                  View details
                  <i
                    class="bi bi-arrow-right"
                    aria-hidden="true"
                  ></i>
                </a>

              </div>
            </div>

          </article>
        </div>
      `
    )
    .join("");
}

function showDetail(productId, pushState = false) {
  const product = products.find(
    (item) => item.id === Number(productId)
  );

  catalogueView.classList.add("d-none");
  detailView.classList.remove("d-none");

  if (pushState) {
    history.pushState(
      { productId },
      "",
      `?product=${productId}`
    );
  }

  if (!product || !product.available) {
    document.title = "Product unavailable — Morena Bakery";

    productDetail.innerHTML = `
      <p class="empty-state">
        This product is not available right now.
        Please choose another product.
      </p>
    `;

    return;
  }

  document.title = `${product.name} — Morena Bakery`;

  productDetail.innerHTML = `
    <article class="detail-panel">

      <div class="detail-image-container">
        <img
          class="detail-product-image"
          src="${product.image}"
          alt="${product.name}"
        >
      </div>

      <div class="detail-copy">

        <p class="category">${product.category}</p>

        <h1 id="product-name">
          ${product.name}
        </h1>

        <p class="description">
          ${product.description}
        </p>

        <div class="detail-meta">

          <span class="price">
            ${currency.format(product.price)}
          </span>

          ${availabilityMarkup(product.available)}

        </div>

        <div class="quantity-block">

          <label for="quantity">
            Quantity
          </label>

          <select
            id="quantity"
            class="form-select"
            aria-label="Quantity"
            data-product-name="${product.name}"
          >
            ${Array.from(
              { length: 12 },
              (_, index) =>
                `<option value="${index + 1}">${index + 1}</option>`
            ).join("")}
          </select>

        </div>

        <div class="mt-4">
          <a
            class="card-link"
            id="order-link"
            href="${buildOrderUrl(product, 1)}"
          >
            <i
              class="bi bi-bag-heart"
              aria-hidden="true"
            ></i>
            Place an order
          </a>
        </div>

      </div>

    </article>
  `;
}

function renderFromUrl() {
  const productId = new URLSearchParams(
    window.location.search
  ).get("product");

  if (productId) {
    showDetail(productId);
  } else {
    showCatalogue();
  }
}

document.addEventListener("change", (event) => {
  if (event.target.id !== "quantity") {
    return;
  }

  const quantity = event.target.value;

  const productId = new URLSearchParams(
    window.location.search
  ).get("product");

  const product = products.find(
    (item) => item.id === Number(productId)
  );

  const orderLink = document.querySelector("#order-link");

  if (product && orderLink) {
    orderLink.href = buildOrderUrl(
      product,
      quantity
    );
  }
});

document.addEventListener("click", (event) => {
  const productLink = event.target.closest(
    "[data-product-id]"
  );

  const backLink = event.target.closest(
    "[data-back]"
  );

  if (productLink) {
    event.preventDefault();

    showDetail(
      productLink.dataset.productId,
      true
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (backLink) {
    event.preventDefault();

    history.pushState(
      {},
      "",
      window.location.pathname
    );

    showCatalogue();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});

window.addEventListener(
  "popstate",
  renderFromUrl
);

fetch("data/products.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        "Products could not be loaded."
      );
    }

    return response.json();
  })

  .then((data) => {
    products = data.filter(
      (product) =>
        product.bakery === "Morena"
    );

    renderFromUrl();
  })

  .catch((error) => {
    console.error(
      "Error loading products:",
      error
    );

    showCatalogue();
  });