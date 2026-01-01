  // 讀取收藏清單
  event.preventDefault();
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  document.querySelectorAll(".favorite").forEach(btn => {
    const productId = btn.dataset.id;

    // 初始化：如果已收藏 → 顯示紅心
    if (favorites.includes(productId)) {
      btn.classList.add("active");
      btn.textContent = "♥";
    }

    btn.addEventListener("click", e => {
      e.stopPropagation(); // 不跳轉商品頁

      if (favorites.includes(productId)) {
        // 取消收藏
        favorites = favorites.filter(id => id !== productId);
        btn.classList.remove("active");
        btn.textContent = "♡";
      } else {
        // 加入收藏
        favorites.push(productId);
        btn.classList.add("active");
        btn.textContent = "♥";
      }

      localStorage.setItem("favorites", JSON.stringify(favorites));
    });
  });

