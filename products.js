// ===== 收藏功能 =====
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function initFavoriteButtons() {
  document.querySelectorAll(".favorite").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.dataset.id;

      if (favorites.includes(id)) {
        favorites = favorites.filter(x => x !== id);
        btn.classList.remove("active");
        btn.textContent = "♡";
      } else {
        favorites.push(id);
        btn.classList.add("active");
        btn.textContent = "♥";
      }

      localStorage.setItem("favorites", JSON.stringify(favorites));
    });
  });
}

// ===== 商品資料 =====
const products = [
  { id:101, name:"2026 潮流百搭厚邊框鈦輕盈系列", price:3980, colors:["beige","black"], category:"MEN", material:"鈦合金", shape:"方框", url:"goods/good1.html", image:"image/goods/1/1-1.jpg" },
  { id:102, name:"極簡金屬輕量框", price:3280, colors:["black"], category:"WOMEN", material:"金屬", shape:"圓框", url:"goods/good2.html", image:"image/goods/2/2-1.jpg" },
  { id:103, name:"抗藍光學生款", price:2680, colors:["beige"], category:"KID&JUNIOR", material:"醋酸纖維/塑膠", shape:"貓眼框", url:"goods/good3.html", image:"image/goods/3/3-1.jpg" }
];

const grid = document.getElementById("productGrid");
const resultCount = document.querySelector(".result-bar strong"); // 結果數量

// ===== 渲染商品 =====
function renderProducts(list) {
  grid.innerHTML = "";

  if(list.length===0){
    grid.innerHTML="<p>查無商品</p>";
  } else {
    list.forEach(p=>{
      const isFav = favorites.includes(String(p.id));

      grid.innerHTML += `
        <a href="${p.url}" class="product-link">
          <article class="product-card">
            <button class="favorite ${isFav?"active":""}" data-id="${p.id}">
              ${isFav?"♥":"♡"}
            </button>
            <img src="${p.image || 'image/default.jpg'}">
            <p class="title">${p.name}</p>
            <p class="price">NT$${p.price}</p>
            <div class="colors">
              ${p.colors.map(c=>`<span class="color ${c}"></span>`).join("")}
            </div>
          </article>
        </a>
      `;
    });
  }

  initFavoriteButtons();
  updateResultCount(list.length);
}

// ===== 更新結果數量 =====
function updateResultCount(count){
  resultCount.textContent = count;
}

// ===== 搜尋功能 =====
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const filterBtn = document.getElementById("filterBtn");
const filterBox = document.getElementById("advanceFilter");
const applyFilterBtn = document.getElementById("applyFilter");

function performSearch() {
  const keyword = searchInput.value.trim().toLowerCase();
  const result = products.filter(p => p.name.toLowerCase().includes(keyword));
  renderProducts(result);
}

searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("input", performSearch);

// ===== 清除條件 =====
clearBtn.addEventListener("click", () => {
  // 清空搜尋框
  searchInput.value = "";

  // 移除所有選項按鈕的 active
  document.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".option-panel").forEach(op => op.classList.remove("active"));
  document.querySelectorAll(".sub-btn").forEach(sb => sb.classList.remove("active"));

  // 重置篩選條件
  selectedFilters = { category: [], color: [], material: [], shape: [] };

  // 清空標籤區
  selectedTagsBox.innerHTML = "";

  // 顯示所有商品
  renderProducts(products);

  // 隱藏進階篩選面板
  filterBox.classList.remove("show");
  filterBox.style.display = "none";
});


// ===== 進階篩選顯示 =====
filterBox.style.display = "none"; // 初始隱藏
filterBtn.addEventListener("click", ()=>{
  filterBox.classList.toggle("show");
  filterBox.style.display = filterBox.classList.contains("show") ? "block" : "none";
});

// ===== 篩選選項切換 =====
document.querySelectorAll(".main-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    document.querySelectorAll(".main-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".filter-group").forEach(g => g.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// ===== 次分類顯示 =====
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".option-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// ===== 選項按鈕切換 =====
document.querySelectorAll(".option-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
  });
});

// ===== 已選標籤顯示 =====
const selectedTagsBox = document.getElementById("selectedTags");
let selectedFilters = { category: [], color: [], material: [], shape: [] };

function renderTags() {
  selectedTagsBox.innerHTML = "";

  Object.entries(selectedFilters).forEach(([type, values]) => {
    values.forEach(val => {
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.innerHTML = `
        ${val}
        <button data-type="${type}" data-value="${val}">×</button>
      `;
      selectedTagsBox.appendChild(tag);
    });
  });

// 刪除標籤
selectedTagsBox.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const { type, value } = btn.dataset;
    
    // 移除 selectedFilters 裡的條件
    selectedFilters[type] = selectedFilters[type].filter(v => v !== value);

    // 取消所有 option-btn 的 active（不限分類）
    document.querySelectorAll(`.option-btn[data-type="${type}"][data-value="${value}"]`)
      .forEach(b => b.classList.remove("active"));

    // 套用篩選
    applyFilters();
  });
});
}


// ===== 套用篩選條件 =====
function applyFilters(){
  let result = [...products];

  const getSelected = (type) =>
    [...document.querySelectorAll(`.option-btn[data-type="${type}"].active`)]
      .map(btn => btn.dataset.value);

  selectedFilters.category = getSelected("category");
  selectedFilters.color = getSelected("color");
  selectedFilters.material = getSelected("material");
  selectedFilters.shape = getSelected("shape");

  if(selectedFilters.category.length) result = result.filter(p => selectedFilters.category.includes(p.category));
  if(selectedFilters.color.length) result = result.filter(p => p.colors.some(c => selectedFilters.color.includes(c)));
  if(selectedFilters.material.length) result = result.filter(p => selectedFilters.material.includes(p.material));
  if(selectedFilters.shape.length) result = result.filter(p => selectedFilters.shape.includes(p.shape));

  renderProducts(result);
  renderTags();
}

applyFilterBtn.addEventListener("click", ()=>{
  applyFilters();
  filterBox.classList.remove("show");
  filterBox.style.display = "none";
});

const sortBtn = document.getElementById("sortBtn");
const sortList = document.getElementById("sortList");

// 目前商品列表
let currentProducts = [...products];

// 切換下拉顯示
sortBtn.addEventListener("click", () => {
    sortList.parentElement.classList.toggle("show");
});


// 選擇排序方式
sortList.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
        const sortType = li.dataset.sort;

        // 更新按鈕文字
        sortBtn.textContent = li.textContent + " ⬍";

        // 排序
        if (sortType === "newest") {
            currentProducts.sort((a,b) => b.id - a.id); // 假設 id 越大越新
        } else if (sortType === "price-desc") {
            currentProducts.sort((a,b) => b.price - a.price);
        } else if (sortType === "price-asc") {
            currentProducts.sort((a,b) => a.price - b.price);
        }

        // 重新渲染
        renderProducts(currentProducts);

        // 隱藏下拉
        sortList.parentElement.classList.remove("show");
    });
});

// ===== 初始化頁面 =====
renderProducts(products);
