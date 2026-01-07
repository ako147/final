document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     變數
  ========================================================= */
  const thumbnails = document.querySelectorAll("#thumbList img");
  const mainImageDiv = document.getElementById("mainImage");
  const mainImg = mainImageDiv?.querySelector("img");
  const zoomPreview = document.getElementById("zoomPreview");
  const zoomImg = document.getElementById("zoomImg");

  const specSelect = document.getElementById("spec");
  const cartBtn = document.querySelector(".btn-cart");
  const buyBtn = document.querySelector(".btn-buy");

  const minusBtn = document.getElementById("minus");
  const plusBtn = document.getElementById("plus");
  const qtyInput = document.getElementById("qty");

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  const stars = document.querySelectorAll(".star");
  const ratingText = document.getElementById("ratingText");
  const messageList = document.getElementById("messageList");

  let selectedRating = 0;

  const productId =
    document.querySelector(".product-title")?.textContent.trim() ||
    "goods-unknown";

  /* =========================================================
     購物車徽章
  ========================================================= */
  function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    if (window.VHCart && typeof window.VHCart.count === "function") {
      badge.textContent = String(window.VHCart.count());
    }
  }

  /* =========================================================
     庫存相關（唯一真實來源：spec data-stock）
  ========================================================= */
  function getCurrentStock() {
    const opt = specSelect?.selectedOptions?.[0];
    return opt ? parseInt(opt.dataset.stock, 10) || 0 : 0;
  }

  function updateStockUI() {
    const stock = getCurrentStock();
    const stockEl = document.querySelector(".stock");

    if (!stockEl) return;

    if (stock <= 0) {
      stockEl.textContent = "缺貨中";
      qtyInput.value = 0;
      plusBtn.disabled = true;
      minusBtn.disabled = true;
      cartBtn.disabled = true;
      buyBtn.disabled = true;
    } else {
      stockEl.textContent = `現庫存剩下 ${stock} 件`;
      qtyInput.value = Math.min(Math.max(1, qtyInput.value || 1), stock);
      plusBtn.disabled = false;
      minusBtn.disabled = false;
      cartBtn.disabled = false;
      buyBtn.disabled = false;
    }
  }

  /* =========================================================
     建立購物車商品資料
  ========================================================= */
  function buildCartItem() {
    const title =
      document.querySelector(".product-title")?.textContent.trim() ||
      "未命名商品";

    const priceText = document.querySelector(".price")?.textContent || "0";
    const price = Number(priceText.replace(/[^\d]/g, "")) || 0;

    const qty = Math.max(1, parseInt(qtyInput.value || "1", 10));
    const spec = specSelect?.value || "default";
    const stock = getCurrentStock();

    let image = mainImg?.getAttribute("src") || "";
    image = image.replace(/^\.\.\//, "");

    return {
      id: `goods-15-${spec}`,
      title: `${title} (${spec})`,
      price,
      image,
      qty,
      stock,
    };
  }

  function addToCart({ redirect = false } = {}) {
    if (!window.VHCart || typeof window.VHCart.add !== "function") {
      alert("購物車功能未載入，請確認 cart.js 已正確引入");
      return;
    }

    window.VHCart.add(buildCartItem());
    updateCartBadge();

    if (redirect) {
      window.location.href = "../cart.html";
    }
  }

  /* =========================================================
     縮圖切換
  ========================================================= */
  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (!mainImg || !zoomImg) return;
      mainImg.src = thumb.src;
      zoomImg.src = thumb.src;
    });
  });

  /* =========================================================
     規格切換
  ========================================================= */
  specSelect?.addEventListener("change", () => {
    const selectedSpec = specSelect.value;

    thumbnails.forEach((img) => {
      img.style.display =
        img.dataset.spec === selectedSpec ? "block" : "none";
    });

    const firstImg = document.querySelector(
      `#thumbList img[data-spec="${selectedSpec}"]`
    );

    if (firstImg && mainImg && zoomImg) {
      mainImg.src = firstImg.src;
      zoomImg.src = firstImg.src;
    }

    updateStockUI();
  });

  /* =========================================================
     放大鏡
  ========================================================= */
  mainImageDiv?.addEventListener("mouseenter", () => {
    if (!zoomPreview || !zoomImg || !mainImg) return;
    zoomPreview.style.display = "block";
    zoomImg.src = mainImg.src;
  });

  mainImageDiv?.addEventListener("mouseleave", () => {
    if (!zoomPreview) return;
    zoomPreview.style.display = "none";
  });

  mainImageDiv?.addEventListener("mousemove", (e) => {
    if (!zoomPreview || !zoomImg) return;

    const rect = mainImageDiv.getBoundingClientRect();
    const xPercent = (e.clientX - rect.left) / rect.width;
    const yPercent = (e.clientY - rect.top) / rect.height;

    zoomImg.style.left =
      -(zoomImg.offsetWidth - zoomPreview.offsetWidth) * xPercent + "px";
    zoomImg.style.top =
      -(zoomImg.offsetHeight - zoomPreview.offsetHeight) * yPercent + "px";
  });

  /* =========================================================
     數量控制
  ========================================================= */
  plusBtn.addEventListener("click", () => {
    const stock = getCurrentStock();
    let current = parseInt(qtyInput.value) || 1;
    if (current < stock) qtyInput.value = current + 1;
  });

  minusBtn.addEventListener("click", () => {
    let current = parseInt(qtyInput.value) || 1;
    if (current > 1) qtyInput.value = current - 1;
  });

  qtyInput.addEventListener("input", () => {
    const stock = getCurrentStock();
    let current = parseInt(qtyInput.value) || 1;
    if (current > stock) qtyInput.value = stock;
    if (current < 1) qtyInput.value = 1;
  });

  /* =========================================================
     加入購物車 / 立即購買
  ========================================================= */
  cartBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    cartBtn.classList.add("added");
    cartBtn.textContent = "已加入 ✔";

    setTimeout(() => {
      cartBtn.classList.remove("added");
      cartBtn.textContent = "加入購物車";
    }, 1500);

    addToCart({ redirect: false });
  });

  buyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    addToCart({ redirect: true });
  });

  /* =========================================================
     商品資訊分頁
  ========================================================= */
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.tab)?.classList.add("active");
    });
  });

  /* =========================================================
     留言星級
  ========================================================= */
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);

      stars.forEach((s) => {
        s.classList.toggle(
          "active",
          parseInt(s.dataset.value) <= selectedRating
        );
      });

      ratingText.textContent = `評分：${selectedRating} 顆星`;
    });
  });

  /* =========================================================
     留言送出
  ========================================================= */
  document.getElementById("submitMessage")?.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!username || !message || selectedRating === 0) {
      alert("請填寫姓名、留言內容並選擇星級");
      return;
    }

    const newMessage = {
      username,
      message,
      rating: selectedRating,
      time: new Date().toLocaleString(),
    };

    const messages =
      JSON.parse(localStorage.getItem(`messages-${productId}`)) || [];
    messages.unshift(newMessage);

    localStorage.setItem(
      `messages-${productId}`,
      JSON.stringify(messages)
    );

    renderMessages();
    updateRatingSummary();

    document.getElementById("username").value = "";
    document.getElementById("message").value = "";
    selectedRating = 0;
    stars.forEach((s) => s.classList.remove("active"));
    ratingText.textContent = "請選擇評分";
  });

  /* =========================================================
     留言顯示
  ========================================================= */
  function renderMessages() {
    const messages =
      JSON.parse(localStorage.getItem(`messages-${productId}`)) || [];
    messageList.innerHTML = "";

    messages.forEach((msg) => {
      const div = document.createElement("div");
      div.className = "message-item";
      div.innerHTML = `
        <div class="message-header">
          ${msg.username}
          <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-content">
          ${"★".repeat(msg.rating)}${"☆".repeat(5 - msg.rating)}<br>
          ${msg.message}
        </div>
      `;
      messageList.appendChild(div);
    });
  }

  function updateRatingSummary() {
    const messages =
      JSON.parse(localStorage.getItem(`messages-${productId}`)) || [];
    const ratingStars = document.getElementById("ratingStars");
    const ratingInfo = document.getElementById("ratingInfo");

    if (!ratingStars || !ratingInfo) return;

    if (messages.length === 0) {
      ratingStars.textContent = "☆☆☆☆☆";
      ratingInfo.textContent = "0.0（0 則評價）";
      return;
    }

    const total = messages.reduce((sum, m) => sum + Number(m.rating), 0);
    const avg = (total / messages.length).toFixed(1);
    const fullStars = Math.round(avg);

    ratingStars.textContent =
      "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
    ratingInfo.textContent = `${avg}（${messages.length} 則評價）`;
  }

  /* =========================================================
     初始化
  ========================================================= */
  renderMessages();
  updateRatingSummary();
  updateStockUI();
  updateCartBadge();

  window.addEventListener("vhcartchange", updateCartBadge);
});
