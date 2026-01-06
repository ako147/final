(() => {
  const KEY_PRIMARY = "vh_cart";
  const KEY_FALLBACKS = ["cart", "cartItems"];
  const KEY_ORDERS = "vh_orders";

  const $ = (sel) => document.querySelector(sel);

  function readRaw() {
    // 先讀 vh_cart，沒有就兼容舊 key
    let raw = localStorage.getItem(KEY_PRIMARY);
    if (!raw) {
      for (const k of KEY_FALLBACKS) {
        raw = localStorage.getItem(k);
        if (raw) break;
      }
    }
    return raw;
  }

  function loadCart() {
    try {
      const raw = readRaw();
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.map(normalizeItem).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(KEY_PRIMARY, JSON.stringify(items));
    // 同步觸發：讓同頁面的 badge 也能立刻更新
    window.dispatchEvent(new Event("vhcartchange"));
  }

  function normalizeItem(item) {
    if (!item) return null;

    const id = String(item.id ?? "");
    if (!id) return null;

    const title = String(item.title ?? item.name ?? "未命名商品");

    const price =
      typeof item.price === "number" ? item.price : parsePrice(item.price);

    const qty = clampInt(item.qty ?? item.quantity ?? 1, 1, 99);

    const image = item.image ? String(item.image) : "";

    return { id, title, price, qty, image };
  }

  function parsePrice(v) {
    if (v == null) return 0;
    const s = String(v);
    const n = Number(s.replace(/[^\d]/g, "")); // "NT$2,786" -> 2786
    return Number.isFinite(n) ? n : 0;
  }

  function clampInt(v, min, max) {
    const n = Number.parseInt(v, 10);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function formatMoney(n) {
    const safe = Number.isFinite(n) ? n : 0;
    return "NT$" + safe.toLocaleString("zh-TW");
  }

  function subtotal(items) {
    return items.reduce((sum, it) => sum + it.price * it.qty, 0);
  }

  function count(items) {
    return items.reduce((sum, it) => sum + it.qty, 0);
  }

  // ===== Orders (for account page) =====
  function loadOrders() {
    try {
      const raw = localStorage.getItem(KEY_ORDERS);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  }

  function getCurrentUser() {
    const raw = localStorage.getItem("currentUser");
    if (!raw || raw === "null") return null;
    try {
      return JSON.parse(raw);
    } catch {
      // 如果你某頁存成純字串，也給你兼容
      return { name: raw };
    }
  }

  function makeOrderId() {
    // 簡單夠用：時間 + 亂數
    return "OD" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // 暴露給其他頁面用（商品頁加入購物車可直接呼叫）
  window.VHCart = {
    get() {
      return loadCart();
    },
    add(item) {
      const items = loadCart();
      const it = normalizeItem(item);
      if (!it) return;

      const found = items.find((x) => x.id === it.id);
      if (found) found.qty = clampInt(found.qty + it.qty, 1, 99);
      else items.push(it);

      saveCart(items);
    },
    remove(id) {
      const items = loadCart().filter((x) => x.id !== String(id));
      saveCart(items);
    },
    setQty(id, qty) {
      const items = loadCart();
      const it = items.find((x) => x.id === String(id));
      if (!it) return;
      it.qty = clampInt(qty, 1, 99);
      saveCart(items);
    },
    clear() {
      saveCart([]);
    },
    count() {
      return count(loadCart());
    },
    subtotal() {
      return subtotal(loadCart());
    },
  };

  // ===== Cart page rendering =====
  function render() {
    const list = $("#cartItems");
    const empty = $("#cartEmpty");
    if (!list || !empty) return;

    const items = loadCart();
    list.innerHTML = "";

    // 順手更新右上角購物車 badge（如果頁面有）
    const badge = document.getElementById("cartCount");
    if (badge) badge.textContent = String(count(items));

    if (items.length === 0) {
      list.style.display = "none";

      // 你如果沒寫 .is-hidden，也保證會顯示
      empty.classList.remove("is-hidden");
      empty.style.display = "";

      updateSummary(items);
      return;
    }

    list.style.display = "";

    // 有商品就把「購物車空的」那段整段藏起來
    empty.classList.add("is-hidden");
    empty.style.display = "none";

    for (const it of items) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.id = it.id;

      row.innerHTML = `
        <div class="cart-thumb">
          ${
            it.image
              ? `<img src="${it.image}" alt="">`
              : `<div class="cart-thumb-placeholder"></div>`
          }
        </div>

        <div class="cart-info">
          <div class="cart-name">${escapeHtml(it.title)}</div>
          <div class="cart-meta">單價 ${formatMoney(it.price)}</div>

          <div class="cart-actions">
            <div class="qty" aria-label="數量調整">
              <button class="qty-btn" type="button" data-action="dec" aria-label="減少">−</button>
              <input class="qty-input" type="number" min="1" max="99" value="${
                it.qty
              }" inputmode="numeric" />
              <button class="qty-btn" type="button" data-action="inc" aria-label="增加">+</button>
            </div>

            <button class="link-danger" type="button" data-action="remove">移除</button>
          </div>
        </div>

        <div class="cart-line-total">${formatMoney(it.price * it.qty)}</div>
      `;

      list.appendChild(row);
    }

    updateSummary(items);
  }

  function updateSummary(items) {
    const sub = subtotal(items);
    const shipping = sub >= 999 || sub === 0 ? 0 : 60; // 滿999免運
    const total = sub + shipping;

    const elSub = $("#subtotal");
    const elShip = $("#shipping");
    const elTotal = $("#total");

    if (elSub) elSub.textContent = formatMoney(sub);
    if (elShip) elShip.textContent = formatMoney(shipping);
    if (elTotal) elTotal.textContent = formatMoney(total);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function bindEvents() {
    const list = $("#cartItems");
    if (list) {
      list.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const row = btn.closest(".cart-item");
        if (!row) return;

        const id = row.dataset.id;
        const action = btn.dataset.action;

        const items = loadCart();
        const it = items.find((x) => x.id === id);
        if (!it) return;

        if (action === "inc") it.qty = clampInt(it.qty + 1, 1, 99);
        if (action === "dec") it.qty = clampInt(it.qty - 1, 1, 99);

        if (action === "remove") {
          saveCart(items.filter((x) => x.id !== id));
          render();
          return;
        }

        saveCart(items);
        render();
      });

      list.addEventListener("change", (e) => {
        const input = e.target.closest(".qty-input");
        if (!input) return;

        const row = input.closest(".cart-item");
        if (!row) return;

        const id = row.dataset.id;
        const qty = clampInt(input.value, 1, 99);

        const items = loadCart();
        const it = items.find((x) => x.id === id);
        if (!it) return;

        it.qty = qty;
        saveCart(items);
        render();
      });
    }

    const clearBtn = $("#clearCartBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!confirm("確定要清空購物車？")) return;
        saveCart([]);
        render();
      });
    }

    const checkoutBtn = $("#checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        const items = loadCart();
        if (items.length === 0) {
          alert("購物車是空的，先去逛一下啦。");
          return;
        }

        const user = getCurrentUser();
        if (!user) {
          if (confirm("你還沒登入，先去登入再結帳？")) {
            // 先把想回來的頁面帶著，之後你 login.js 支援 redirect 就能原路回來
            const here = "cart.html";
            window.location.href = `login.html?redirect=${encodeURIComponent(here)}`;
          }
          return;
        }

        // 計算金額（跟 summary 同一套）
        const sub = subtotal(items);
        const shipping = sub >= 999 || sub === 0 ? 0 : 60;
        const total = sub + shipping;

        // 建立訂單（展示版：存在 localStorage）
        const order = {
          orderId: makeOrderId(),
          createdAt: new Date().toISOString(),
          status: "已成立",
          user: {
            name: user.username || user.name || "使用者",
            email: user.email || "",
          },
          items: items.map((x) => ({ ...x })), // 複製一份避免被後面改到
          subtotal: sub,
          shipping,
          total,
        };

        const orders = loadOrders();
        orders.unshift(order);
        saveOrders(orders);

        // 清空購物車
        saveCart([]);
        render();

        alert("結帳完成（展示版）！我把訂單先存到「我的帳戶」用的資料庫了。");

        // 你之後做 account.html 就會用到這個
        window.location.href = "account.html?tab=orders";
      });
    }

    window.addEventListener("vhcartchange", () => {
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    render();
  });
})();