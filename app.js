
const $ = (selector) => document.querySelector(selector);

const KEYS = {
  products: "shopease_products",
  cart: "shopease_cart",
  user: "shopease_demo_user"
};

const starterProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1499,
    category: "Electronics",
    image: "https://placehold.co/600x400/ece8ff/4033ad?text=Headphones"
  },
  {
    id: 2,
    name: "Classic T-Shirt",
    price: 599,
    category: "Fashion",
    image: "https://placehold.co/600x400/fce7f3/9d174d?text=T-Shirt"
  },
  {
    id: 3,
    name: "Table Lamp",
    price: 899,
    category: "Home",
    image: "https://placehold.co/600x400/fef3c7/92400e?text=Lamp"
  },
  {
    id: 4,
    name: "JavaScript Guide",
    price: 450,
    category: "Books",
    image: "https://placehold.co/600x400/dcfce7/166534?text=Book"
  },
  {
    id: 5,
    name: "Smart Watch",
    price: 2499,
    category: "Electronics",
    image: "https://placehold.co/600x400/dbeafe/1e40af?text=Smart+Watch"
  },
  {
    id: 6,
    name: "Casual Backpack",
    price: 1199,
    category: "Fashion",
    image: "https://placehold.co/600x400/f3e8ff/6b21a8?text=Backpack"
  }
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    alert("Unable to save data. Check browser storage settings.");
    return false;
  }
}

let products = readStorage(KEYS.products, starterProducts);
let cart = readStorage(KEYS.cart, []);
let editingId = null;

if (!Array.isArray(products)) products = starterProducts;
if (!Array.isArray(cart)) cart = [];

let currentUser = readStorage(KEYS.user, null);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeImage(url) {
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol)
      ? parsed.href
      : "";
  } catch {
    return "";
  }
}

function money(amount) {
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function persistProducts() {
  return saveStorage(KEYS.products, products);
}

function persistCart() {
  return saveStorage(KEYS.cart, cart);
}

function renderProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const sort = $("#sortFilter").value;

  let visible = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(query);
    const matchesCategory =
      category === "all" || product.category === category;

    return matchesName && matchesCategory;
  });

  if (sort === "low") visible.sort((a, b) => a.price - b.price);
  if (sort === "high") visible.sort((a, b) => b.price - a.price);
  if (sort === "name") {
    visible.sort((a, b) => a.name.localeCompare(b.name));
  }

  $("#productCount").textContent =
    `${visible.length} product(s) found`;

  if (visible.length === 0) {
    $("#productGrid").innerHTML =
      '<p class="empty">No products found. Try another search.</p>';
    return;
  }

  $("#productGrid").innerHTML = visible.map(product => {
    const image = safeImage(product.image);

    return `
      <article class="product-card">
        <img
          class="product-image"
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >
        <div class="product-info">
          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>
          <h3>${escapeHTML(product.name)}</h3>
          <div class="product-price">₹${money(product.price)}</div>
          <div class="card-actions">
            <button data-action="add" data-id="${product.id}">
              Add to Cart
            </button>
            <button class="secondary"
              data-action="edit" data-id="${product.id}">
              Edit
            </button>
            <button class="delete-btn"
              data-action="delete" data-id="${product.id}">
              Delete
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $("#productGrid").querySelectorAll(".product-image").forEach(img => {
    img.addEventListener("error", () => {
      img.src = "https://placehold.co/600x400?text=Product";
    }, { once: true });
  });
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = money(total);

  if (cart.length === 0) {
    $("#cartItems").innerHTML =
      '<p class="empty">Your cart is empty.</p>';
    return;
  }

  $("#cartItems").innerHTML = cart.map(item => `
    <div class="cart-row">
      <span>${escapeHTML(item.name)} × ${item.quantity}</span>
      <span>₹${money(item.price * item.quantity)}</span>
      <button class="delete-btn"
        data-remove-cart="${item.id}">Remove</button>
    </div>
  `).join("");
}

function showLoginState() {
  $("#loginBtn").textContent = currentUser
    ? `Logout (${currentUser})`
    : "Login";
}

$("#loginBtn").addEventListener("click", () => {
  if (currentUser) {
    currentUser = null;
    saveStorage(KEYS.user, null);
    showLoginState();
    $("#loginMessage").textContent = "You have logged out.";
    return;
  }

  $("#loginPanel").hidden = !$("#loginPanel").hidden;
});

$("#loginForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#email").value.trim();
  const password = $("#password").value;

  if (email === "demo@shop.com" && password === "shop123") {
    currentUser = email;
    saveStorage(KEYS.user, currentUser);
    showLoginState();
    $("#loginPanel").hidden = true;
    $("#loginMessage").textContent = "Demo login successful.";
  } else {
    $("#loginMessage").textContent =
      "Invalid demo credentials. Please try again.";
  }
});

$("#addProductBtn").addEventListener("click", () => {
  editingId = null;
  $("#productForm").reset();
  $("#formTitle").textContent = "Add a product";
  $("#formMessage").textContent = "";
  $("#productForm").hidden = !$("#productForm").hidden;
});

$("#cancelForm").addEventListener("click", () => {
  $("#productForm").hidden = true;
  editingId = null;
});

$("#productForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#productName").value.trim();
  const price = Number($("#productPrice").value);
  const category = $("#productCategory").value;
  const image = $("#productImage").value.trim();

  if (!name || !Number.isFinite(price) || price <= 0) {
    $("#formMessage").textContent =
      "Enter a product name and a valid positive price.";
    return;
  }

  if (image && !safeImage(image)) {
    $("#formMessage").textContent =
      "Enter a valid HTTP or HTTPS image URL.";
    return;
  }

  const previousProducts = [...products];

  if (editingId !== null) {
    products = products.map(product =>
      product.id === editingId
        ? { ...product, name, price, category, image }
        : product
    );
  } else {
    products.push({
      id: Date.now(),
      name,
      price,
      category,
      image: image || "https://placehold.co/600x400?text=Product"
    });
  }

  if (!persistProducts()) {
    products = previousProducts;
    return;
  }

  $("#productForm").hidden = true;
  editingId = null;
  renderProducts();
});

$("#productGrid").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const product = products.find(item => item.id === id);
  if (!product) return;

  const action = button.dataset.action;

  if (action === "add") {
    const existing = cart.find(item => item.id === id);
    const previousCart = [...cart];

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    if (persistCart()) renderCart();
    else cart = previousCart;
  }

  if (action === "edit") {
    editingId = id;
    $("#productName").value = product.name;
    $("#productPrice").value = product.price;
    $("#productCategory").value = product.category;
    $("#productImage").value = product.image || "";
    $("#formTitle").textContent = "Edit product";
    $("#productForm").hidden = false;
    $("#formMessage").textContent = "";
    $("#productForm").scrollIntoView({ behavior: "smooth" });
  }

  if (action === "delete") {
    if (!confirm(`Delete "${product.name}"?`)) return;

    const previousProducts = products;
    products = products.filter(item => item.id !== id);

    if (persistProducts()) {
      renderProducts();
    } else {
      products = previousProducts;
    }
  }
});

$("#cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-cart]");
  if (!button) return;

  const id = Number(button.dataset.removeCart);
  const previousCart = [...cart];
  cart = cart.filter(item => item.id !== id);

  if (persistCart()) renderCart();
  else cart = previousCart;
});

$("#searchInput").addEventListener("input", renderProducts);
$("#categoryFilter").addEventListener("change", renderProducts);
$("#sortFilter").addEventListener("change", renderProducts);

$("#checkoutBtn").addEventListener("click", () => {
  if (!currentUser) {
    $("#checkoutMessage").textContent =
      "Please log in with the demo account before checkout.";
    $("#loginPanel").hidden = false;
    $("#loginPanel").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (cart.length === 0) {
    $("#checkoutMessage").textContent =
      "Your cart is empty. Add a product first.";
    return;
  }

  if (!confirm("Place this demo order? No payment will be taken.")) {
    return;
  }

  const previousCart = [...cart];
  cart = [];

  if (persistCart()) {
    renderCart();
    $("#checkoutMessage").textContent =
      "Demo order completed successfully!";
  } else {
    cart = previousCart;
    renderCart();
  }
});

products.forEach(product => {
  product.image = safeImage(product.image) ||
    "https://placehold.co/600x400?text=Product";
});

renderProducts();
renderCart();
showLoginState();
