(() => {
  const KEY_PRIMARY = "vh_cart";
  const KEY_FALLBACKS = ["cart", "cartItems"];

  const $ = (sel) => document.querySelector(sel);

  function readRaw() {
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
    window.dispatchEvent(new Event("vhcartchange"));
  }

  function normalizeItem(item) {
    if (!item) return null;

    const id = String(item.id ?? item.productId ?? item.sku ?? "");
    if (!id) return null;

    const title = String(item.title ?? item.name ?? "未命名商品");

    const price = typeof item.price === "number"
      ? item.price
      : parsePrice(item.price);

    const stock = clampInt(item.stock ?? 99, 1, 9999); // 每個商品的庫存
    const qty = clampInt(item.qty ?? 1, 1, stock);

    const image = item.image ? String(item.image) : "";

    return { id, title, price, qty, stock, image };
  }

  function parsePrice(v) {
    if (v == null) return 0;
    const s = String(v);
    const n = Number(s.replace(/[^\d]/g, ""));
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

  window.VHCart = {
    get() { return loadCart(); },
    add(item) {
      const items = loadCart();
      const it = normalizeItem(item);
      if (!it) return;

      const found = items.find(x => x.id === it.id);
      if (found) found.qty = clampInt(found.qty + it.qty, 1, found.stock);
      else items.push(it);

      saveCart(items);
    },
    remove(id) {
      const items = loadCart().filter(x => x.id !== String(id));
      saveCart(items);
    },
    setQty(id, qty) {
      const items = loadCart();
      const it = items.find(x => x.id === String(id));
      if (!it) return;
      it.qty = clampInt(qty, 1, it.stock);
      saveCart(items);
    },
    clear() { saveCart([]); },
    count() { return count(loadCart()); },
    subtotal() { return subtotal(loadCart()); }
  };

  // ===== Cart page rendering =====
  function render() {
    const list = $("#cartItems");
    const empty = $("#cartEmpty");
    if (!list || !empty) return;

    const items = loadCart();
    list.innerHTML = "";

    if (items.length === 0) {
      list.style.display = "none";
      empty.classList.remove("is-hidden");
      updateSummary(items);
      return;
    }

    list.style.display = "";
    empty.classList.add("is-hidden");

    for (const it of items) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.id = it.id;

      row.innerHTML = `
        <div class="cart-thumb">
          ${it.image ? `<img src="${it.image}" alt="">` : `<div class="cart-thumb-placeholder"></div>`}
        </div>

        <div class="cart-info">
          <div class="cart-name">${escapeHtml(it.title)}</div>
          <div class="cart-meta">單價 ${formatMoney(it.price)}</div>
          <div class="cart-stock">庫存剩 ${it.stock} 件</div>

          <div class="cart-actions">
            <div class="qty" aria-label="數量調整">
              <button class="qty-btn" type="button" data-action="dec" aria-label="減少">−</button>
              <input class="qty-input" type="number" min="1" max="${it.stock}" value="${it.qty}" inputmode="numeric" />
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
    const shipping = sub >= 999 || sub === 0 ? 0 : 60;
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
        const it = items.find(x => x.id === id);
        if (!it) return;

        if (action === "inc") it.qty = clampInt(it.qty + 1, 1, it.stock);
        if (action === "dec") it.qty = clampInt(it.qty - 1, 1, it.stock);
        if (action === "remove") {
          saveCart(items.filter(x => x.id !== id));
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
        const items = loadCart();
        const it = items.find(x => x.id === id);
        if (!it) return;

        const qty = clampInt(input.value, 1, it.stock);
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

        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser || currentUser === "null") {
          if (confirm("你還沒登入，先去登入再結帳？")) {
            window.location.href = "login.html";
          }
          return;
        }

        alert("結帳功能尚未實作，感謝你的支持！");
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
