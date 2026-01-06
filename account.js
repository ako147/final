document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  const guestView = document.getElementById("guestView");
  const accountApp = document.getElementById("accountApp");

  // ===== 1) 沒登入：顯示提示區 =====
  if (!user) {
    guestView.hidden = false;
    accountApp.hidden = true;

    // 如果你之後想登入完回到本頁，就靠 redirect 參數
    const redirect = encodeURIComponent("account.html");
    const goLogin = document.getElementById("goLogin");
    const goRegister = document.getElementById("goRegister");
    if (goLogin) goLogin.href = `login.html?tab=login&redirect=${redirect}`;
    if (goRegister) goRegister.href = `login.html?tab=register&redirect=${redirect}`;
    return;
  }

  // ===== 2) 已登入：顯示帳戶內容 =====
  guestView.hidden = true;
  accountApp.hidden = false;

  // 顯示使用者資訊
  const username = user.username || "使用者";
  const email = user.email || "-";
  const loginAt = user.loginAt || "-";

  setText("profileName", username);
  setText("profileEmail", email);
  setText("profileLoginAt", loginAt);

  setText("infoUsername", username);
  setText("infoEmail", email);

  // Avatar 取首字
  const avatarLetter = (username.trim()[0] || "U").toUpperCase();
  setText("profileAvatar", avatarLetter);

  // ===== 3) Tabs 切換 =====
  const miniTabs = document.querySelectorAll("[data-acc-tab]");
  miniTabs.forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.accTab, true));
  });

  const urlTab = new URLSearchParams(location.search).get("tab");
  activateTab(urlTab === "orders" ? "orders" : "profile", false);

  // ===== 4) 訂單渲染 =====
  renderOrders();

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function activateTab(tab, pushState) {
    // 左側按鈕 active
    miniTabs.forEach(b => b.classList.toggle("active", b.dataset.accTab === tab));

    // 右側 panel 顯示
    const profilePanel = document.getElementById("tab-profile");
    const ordersPanel = document.getElementById("tab-orders");
    if (profilePanel) profilePanel.hidden = tab !== "profile";
    if (ordersPanel) ordersPanel.hidden = tab !== "orders";

    if (pushState) {
      const next = tab === "orders" ? "account.html?tab=orders" : "account.html";
      history.replaceState(null, "", next);
    }

    // 切到訂單時順便重畫一次
    if (tab === "orders") renderOrders();
  }

  function getOrders() {
    return JSON.parse(localStorage.getItem("vh_orders") || "[]");
  }

  function renderOrders() {
    const list = document.getElementById("ordersList");
    const empty = document.getElementById("ordersEmpty");
    if (!list || !empty) return;

    const orders = getOrders();
    list.innerHTML = "";

    if (!orders.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    orders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card";

      const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "-";

      const itemsHtml = (order.items || [])
        .map(it => {
          const title = it.title || "未命名商品";
          const qty = Number(it.qty || 1);
          const price = Number(it.price || 0);
          return `<div class="order-item">
                    <span class="oi-title">${escapeHtml(title)}</span>
                    <span class="oi-meta">x${qty} · NT$${(price * qty).toLocaleString()}</span>
                  </div>`;
        })
        .join("");

      card.innerHTML = `
        <div class="order-top">
          <div>
            <div class="order-id">訂單 #${escapeHtml(order.id || "-")}</div>
            <div class="order-time">${createdAt}</div>
          </div>
          <div class="order-right">
            <span class="order-pill">${escapeHtml(order.status || "處理中")}</span>
            <div class="order-total">NT$${Number(order.total || 0).toLocaleString()}</div>
          </div>
        </div>

        <div class="order-items">
          ${itemsHtml}
        </div>
      `;

      list.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
