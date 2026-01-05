document.addEventListener("DOMContentLoaded", () => {
    // =================== 變數 ===================
    const thumbnails = document.querySelectorAll("#thumbList img");
    const mainImageDiv = document.getElementById('mainImage');
    const mainImg = mainImageDiv.querySelector('img');
    const zoomPreview = document.getElementById('zoomPreview');
    const zoomImg = document.getElementById('zoomImg');
    const specSelect = document.getElementById("spec");
    const cartBtn = document.querySelector('.btn-cart');
    const minusBtn = document.getElementById("minus");
    const plusBtn = document.getElementById("plus");
    const qtyInput = document.getElementById("qty");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const stars = document.querySelectorAll(".star");
    const ratingText = document.getElementById("ratingText");
    const messageList = document.getElementById("messageList");
    let selectedRating = 0;

    // =================== 縮圖切換 ===================
    thumbnails.forEach(thumb => {
        thumb.addEventListener("click", () => {
            mainImg.src = thumb.src;
            zoomImg.src = thumb.src;
        });
    });

    // =================== 規格切換 ===================
    specSelect.addEventListener("change", () => {
        const selectedSpec = specSelect.value;

        thumbnails.forEach(img => {
            if (img.dataset.spec === selectedSpec) {
                img.style.display = "block";
            } else {
                img.style.display = "none";
            }
        });

        // 主圖切換成第一張該規格縮圖
        const firstImg = document.querySelector(`#thumbList img[data-spec="${selectedSpec}"]`);
        if (firstImg) {
            mainImg.src = firstImg.src;
            zoomImg.src = firstImg.src;
        }
    });

    // =================== 放大鏡 ===================
    mainImageDiv.addEventListener('mouseenter', () => {
        zoomPreview.style.display = 'block';
        zoomImg.src = mainImg.src;
    });

    mainImageDiv.addEventListener('mouseleave', () => {
        zoomPreview.style.display = 'none';
    });

    mainImageDiv.addEventListener('mousemove', (e) => {
        const rect = mainImageDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = x / rect.width;
        const yPercent = y / rect.height;

        const moveX = -(zoomImg.offsetWidth - zoomPreview.offsetWidth) * xPercent;
        const moveY = -(zoomImg.offsetHeight - zoomPreview.offsetHeight) * yPercent;

        zoomImg.style.left = moveX + 'px';
        zoomImg.style.top = moveY + 'px';
    });


    // =================== 加入購物車動畫 ===================
    cartBtn.addEventListener('click', () => {
        cartBtn.classList.add('added');
        cartBtn.textContent = '已加入 ✔';

        setTimeout(() => {
            cartBtn.classList.remove('added');
            cartBtn.textContent = '加入購物車';
        }, 1500);
    });

    // =================== 數量控制 ===================
    plusBtn.addEventListener("click", () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    });

    minusBtn.addEventListener("click", () => {
        let current = parseInt(qtyInput.value);
        if (current > 1) {
            qtyInput.value = current - 1;
        }
    });

    // =================== 商品資訊三欄切換 ===================
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });

    // =================== 留言板星級選擇 ===================
    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.value);

            stars.forEach(s => {
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

        const messages = JSON.parse(localStorage.getItem("messages")) || [];
        messages.unshift(newMessage);
        localStorage.setItem("messages", JSON.stringify(messages));

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
        const messages = JSON.parse(localStorage.getItem("messages")) || [];
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
        const messages = JSON.parse(localStorage.getItem("messages")) || [];
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
});
