document.addEventListener("DOMContentLoaded", () => {
  // =================== 變數 ===================
  const thumbnails = document.querySelectorAll("#thumbList img");
  const mainImageDiv = document.getElementById("mainImage");
  const mainImg = mainImageDiv?.querySelector("img");
  const zoomPreview = document.getElementById("zoomPreview");
  const zoomImg = document.getElementById("zoomImg");
  const specSelect = document.getElementById("spec");
  const cartBtn = document.querySelector(".btn-cart");
  const buyBtn = document.querySelector(".btn-buy"); // ✅ 新增：立即購買
  const minusBtn = document.getElementById("minus");
  const plusBtn = document.getElementById("plus");
  const qtyInput = document.getElementById("qty");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const stars = document.querySelectorAll(".star");
  const ratingText = document.getElementById("ratingText");
  const messageList = document.getElementById("messageList");
  let selectedRating = 0;
  // 商品 ID（可用於購物車或其他用途）
  const productId = document.querySelector(".product-title")?.textContent.trim() || "goods-unknown";

  // ✅ 徽章更新（下拉選單的購物車數字）
  function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    if (window.VHCart && typeof window.VHCart.count === "function") {
      badge.textContent = String(window.VHCart.count());
    }
  }

  // ✅ 組合商品資料（加入購物車用）
  function buildCartItem() {
    const title = document.querySelector(".product-title")?.textContent.trim() || "未命名商品";
    const priceText = document.querySelector(".price")?.textContent || "0";
    const price = Number(priceText.replace(/[^\d]/g, "")) || 0;

    const qty = Math.max(1, parseInt(qtyInput?.value || "1", 10));
    const spec = specSelect?.value || "default";
    const stock = getCurrentStock();

    let image = mainImg?.getAttribute("src") || "";
    image = image.replace(/^\.\.\//, "");

    return {
      id: `goods-15-${spec}`,       // 同商品不同規格不同 id
      title: `${title} (${spec})`,
      price,
      image,
      qty,
      stock                        // ✅ 關鍵
    };
  }


  // ✅ 真正加入購物車（可選要不要跳頁）
  function addToCart({ redirect = false } = {}) {
    if (!window.VHCart || typeof window.VHCart.add !== "function") {
      alert("購物車功能未載入（找不到 VHCart）。請確認商品頁有載入 ../cart.js");
      return;
    }

    window.VHCart.add(buildCartItem());
    updateCartBadge();

    // ✅ 只有 redirect = true 才跳頁（加入購物車不跳、立即購買才跳）
    if (redirect) {
      window.location.href = "../cart.html";
    }
  }

  // =================== 縮圖切換 ===================
  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (!mainImg || !zoomImg) return;
      mainImg.src = thumb.src;
      zoomImg.src = thumb.src;
    });
  });
  // =================== 庫存顯示與數量控制 ===================
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
      qtyInput.value = Math.min(Math.max(1, qtyInput.value), stock);
      plusBtn.disabled = false;
      minusBtn.disabled = false;
      cartBtn.disabled = false;
      buyBtn.disabled = false;
    }
  }

  // =================== 規格切換 ===================
  specSelect?.addEventListener("change", () => {
    const selectedSpec = specSelect.value;

    thumbnails.forEach(img => {
      img.style.display = img.dataset.spec === selectedSpec ? "block" : "none";
    });

    const firstImg = document.querySelector(`#thumbList img[data-spec="${selectedSpec}"]`);
    if (firstImg && mainImg && zoomImg) {
      mainImg.src = firstImg.src;
      zoomImg.src = firstImg.src;
    }

    updateStockUI();   // ✅ 切規格就更新庫存
    updateCartBadge();
  });


  // =================== 放大鏡 ===================
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
    if (!mainImageDiv || !zoomPreview || !zoomImg) return;

    const rect = mainImageDiv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = x / rect.width;
    const yPercent = y / rect.height;

    const moveX = -(zoomImg.offsetWidth - zoomPreview.offsetWidth) * xPercent;
    const moveY = -(zoomImg.offsetHeight - zoomPreview.offsetHeight) * yPercent;

    zoomImg.style.left = moveX + "px";
    zoomImg.style.top = moveY + "px";
  });

  // =================== 加入購物車（✅ 不跳頁） ===================
  cartBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    // 1) 按鈕動畫（保留你原本效果）
    cartBtn.classList.add("added");
    cartBtn.textContent = "已加入 ✔";

    setTimeout(() => {
      cartBtn.classList.remove("added");
      cartBtn.textContent = "加入購物車";
    }, 1500);

    // 2) 加入購物車（不跳頁）
    addToCart({ redirect: false });
  });

  // =================== 立即購買（✅ 加入後跳去購物車） ===================
  buyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    addToCart({ redirect: true });
  });

    // =================== 數量控制（含庫存限制） ===================
    // 取得庫存數字
    const stockElement = document.querySelector(".stock");
    const stockMatch = stockElement.textContent.match(/\d+/); // 抓取數字
    const maxStock = stockMatch ? parseInt(stockMatch[0], 10) : 1;

    // 若庫存為 0，禁用按鈕
    if (maxStock === 0) {
        plusBtn.disabled = true;
        cartBtn.disabled = true;
        document.querySelector(".btn-buy").disabled = true;
        stockElement.textContent = "缺貨中";
        qtyInput.value = 0;
    }

    // 加號按鈕
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


  // =================== 商品資訊三欄切換 ===================
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // =================== 留言板星級選擇 ===================
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);

      stars.forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.value) <= selectedRating);
      });

      ratingText.textContent = `評分：${selectedRating} 顆星`;
    });
  });

  // =================== 留言送出 ===================
    document.getElementById("submitMessage").addEventListener("click", () => {
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
            time: new Date().toLocaleString()
        };

        // 取得商品 ID
        const productId = document.querySelector(".product-title")?.textContent.trim() || "goods-unknown";

        // 從 localStorage 取出該商品留言
        const messages = JSON.parse(localStorage.getItem(`messages-${productId}`)) || [];

        // 新增留言到最前面
        messages.unshift(newMessage);

        // 存回 localStorage
        localStorage.setItem(`messages-${productId}`, JSON.stringify(messages));
        
        // 重新顯示留言和更新評分

        renderMessages();
        updateRatingSummary();

        // 清空輸入
        document.getElementById("username").value = "";
        document.getElementById("message").value = "";
        selectedRating = 0;
        stars.forEach(s => s.classList.remove("active"));
        ratingText.textContent = "請選擇評分";
    });


  // =================== 顯示留言 ===================
    function renderMessages() {
        const productId = document.querySelector(".product-title")?.textContent.trim() || "goods-unknown";
        const messages = JSON.parse(localStorage.getItem(`messages-${productId}`)) || [];
        messageList.innerHTML = "";

        messages.forEach(msg => {
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

  // =================== 更新平均星級 ===================
  function updateRatingSummary() {
      const productId = document.querySelector(".product-title")?.textContent.trim() || "goods-unknown";
        const messages = JSON.parse(localStorage.getItem(`messages-${productId}`)) || [];
        const ratingStars = document.getElementById("ratingStars");
        const ratingInfo = document.getElementById("ratingInfo");

        if (messages.length === 0) {
            ratingStars.textContent = "☆☆☆☆☆";
            ratingInfo.textContent = "0.0（0 則評價）";
            return;
        }

        const total = messages.reduce((sum, msg) => sum + Number(msg.rating), 0);
        const avg = (total / messages.length).toFixed(1);
        const fullStars = Math.round(avg);

        ratingStars.textContent = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
        ratingInfo.textContent = `${avg}（${messages.length} 則評價）`;
    }

  // =================== 頁面初始化 ===================
  renderMessages();
  updateRatingSummary();
  updateCartBadge();

  // 如果其他頁面或同頁有更新購物車，badge 跟著更新
  window.addEventListener("vhcartchange", updateCartBadge);
});