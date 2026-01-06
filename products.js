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
    { id:101, name:"2026 潮流百搭厚邊框鈦輕盈系列", price:3980, colors:["gold","gray"], category:"UNISEX", material:"titanium", shape:"other", type:"光學眼鏡", url:"goods/good1.html", image:"image/goods/1/1-1.jpg" },
    { id:102, name:"2026 潮流百搭厚邊框鈦輕盈系列", price:3980, colors:["gold","gray"], category:"UNISEX", material:"titanium", shape:"wellington", type:"光學眼鏡", url:"goods/good2.html", image:"image/goods/2/1-1.jpg" },
    { id:103, name:"2026 潮流百搭厚邊框鈦輕盈系列", price:3980, colors:["black"], category:"UNISEX", material:"titanium", shape:"square", type:"光學眼鏡", url:"goods/good3.html", image:"image/goods/3/1-1.jpg" },
    { id:104, name:"經典時尚系列 墨鏡", price:3980, colors:["black"], category:"UNISEX", material:"plastic", shape:"", type:"太陽眼鏡", url:"goods/good4.html", image:"image/goods/4/1-1.jpg" },
    { id:105, name:"金屬濾藍光眼鏡", price:1584, colors:["pink","gold"], category:"UNISEX", material:"metal", shape:"postom", type:"抗藍光眼鏡", url:"goods/good5.html", image:"image/goods/5/1-1.jpg" },
    { id:106, name:"無度數濾藍光盒裝眼鏡", price:1584, colors:["brown"], category:"UNISEX", material:"metal", shape:"postom", type:"抗藍光眼鏡", url:"goods/good6.html", image:"image/goods/6/1-1.jpg" },
    { id:107, name:"Chill墨鏡系列", price:1736, colors:["black","gray"], category:"WOMENS", material:"metal", shape:"other", type:"太陽眼鏡", url:"goods/good7.html", image:"image/goods/7/1-1.jpg" },
    { id:108, name:"經典時尚系列", price:4980, colors:["brown"], category:"WOMENS", material:"plastic", shape:"square", type:"光學眼鏡", url:"goods/good8.html", image:"image/goods/8/1-1.jpg" },
    { id:109, name:"360°®超彈力耐壓系列 兒童款", price:2980, colors:["pink","brown","blue"], category:"KID&JUNIOR", material:"resin", shape:"oval", type:"光學眼鏡", url:"goods/good9.html", image:"image/goods/9/1-1.jpg" },
    { id:110, name:"2024 日本製春夏系列眼鏡", price:3980, colors:["green","pink","clear"], category:"UNISEX", material:"resin", shape:"", type:"光學眼鏡", url:"goods/good10.html", image:"image/goods/10/1-1.jpg" },
    { id:111, name:"復古厚感膠框系列", price:1899, colors:["pink","gray","brown"], category:"UNISEX", material:"resin", shape:"square", type:"光學眼鏡", url:"goods/good11.html", image:"image/goods/11/1-1.jpg" },
    { id:112, name:"Switch 2024 SWITCH Renew系列", price:2786, colors:["black"], category:"MENS", material:"resin", shape:"wellington", type:"光學眼鏡", url:"goods/good12.html", image:"image/goods/12/1-1.jpg" },
    { id:113, name:"Chill系列", price:2533, colors:["black","gray"], category:"MENS", material:"resin", shape:"square", type:"光學眼鏡", url:"goods/good13.html", image:"image/goods/13/1-1.jpg" },
    { id:114, name:"STAR WARS設計款 角色系列-孩童款", price:2786, colors:["brown"], category:"KID&JUNIOR", material:"resin", shape:"wellington", type:"太陽眼鏡", url:"goods/good14.html", image:"image/goods/14/1-1.jpg" },
    { id:115, name:"ZOOTOPIA 眼鏡盒", price:390, colors:["green","gray"], category:"CASE", material:"", shape:"", type:"配件", url:"goods/good15.html", image:"image/goods/15/1-1.png" }
];

// ===== DOM 元素 =====
const grid = document.getElementById("productGrid");
const resultCount = document.querySelector(".result-bar strong");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const filterBtn = document.getElementById("filterBtn");
const filterBox = document.getElementById("advanceFilter");
const applyFilterBtn = document.getElementById("applyFilter");
const selectedTagsBox = document.getElementById("selectedTags");
const sortBtn = document.getElementById("sortBtn");
const sortList = document.getElementById("sortList");
const sortWrapper = document.querySelector(".sort-wrapper");

// ===== 初始 =====
let selectedFilters = { type: [], category: [], color: [], material: [], shape: [], price: [] };
let currentProducts = [...products];
filterBox.style.display = "none";

// ===== 渲染商品 =====
function renderProducts(list){
    grid.innerHTML = "";
    if(list.length===0){
        grid.innerHTML = "<p>查無商品</p>";
    } else {
        list.forEach(p=>{
            const isFav = favorites.includes(String(p.id));
            grid.innerHTML += `
                <a href="${p.url}" class="product-link">
                  <article class="product-card">
                    <button class="favorite ${isFav ? "active" : ""}" data-id="${p.id}">
                        ${isFav ? "♥" : "♡"}
                    </button>
                    


                    <div class="product-image">
                      <img src="${p.image}" alt="${p.name}">
                    </div>
                    
                    <p class="title">${p.name}</p>
                    <p class="price">NT$${p.price}</p>
                    <div class="colors">
                        ${p.colors.map(c => `<span class="color ${c}"></span>`).join("")}
                    </div>
                  </article>
                </a>
                `;
        });
    }
    initFavoriteButtons();
    resultCount.textContent = list.length;
}

// ===== 搜尋功能 =====
function performSearch(){
    const keyword = searchInput.value.trim().toLowerCase();
    const result = products.filter(p => p.name.toLowerCase().includes(keyword));
    currentProducts = result;
    renderProducts(result);
}
searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("input", performSearch);

// ===== 清除條件 =====
clearBtn.addEventListener("click", ()=>{
    searchInput.value = "";
    selectedFilters = { type: [], category: [], color: [], material: [], shape: [], price: [] };
    document.querySelectorAll(".option-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".main-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".option-panel").forEach(p=>p.classList.remove("active")); // 新增
    selectedTagsBox.innerHTML = "";
    currentProducts = [...products];
    renderProducts(products);
    filterBox.classList.remove("show");
    filterBox.style.display = "none";
});

// ===== 顯示/隱藏進階篩選 =====
filterBtn.addEventListener("click", ()=>{
    filterBox.classList.toggle("show");
    filterBox.style.display = filterBox.classList.contains("show") ? "block" : "none";
});

// ===== 大分類 =====
document.querySelectorAll(".main-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        document.querySelectorAll(".main-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".filter-group").forEach(g=>g.classList.remove("active"));
        document.getElementById(btn.dataset.target).classList.add("active");
        selectedFilters.type = [btn.textContent.trim()];
        renderTags();
        applyFilters();
    });
});

// ===== 小條件按鈕 點擊展開 panel =====
document.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const targetPanel = document.getElementById(btn.dataset.target);
        // 關閉其他 panel
        document.querySelectorAll(".option-panel").forEach(p=>{
            if(p !== targetPanel) p.classList.remove("active");
        });
        // 切換自己
        targetPanel.classList.toggle("active");
    });
});

// ===== 次分類（小條件選擇） =====
document.querySelectorAll(".option-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        btn.classList.toggle("active");
        const type = btn.dataset.type;
        const value = btn.dataset.value;
        if(!selectedFilters[type]) selectedFilters[type] = [];
        if(btn.classList.contains("active")){
            if(!selectedFilters[type].includes(value)) selectedFilters[type].push(value);
        } else {
            selectedFilters[type] = selectedFilters[type].filter(v=>v!==value);
        }
        renderTags();
        applyFilters();
    });
});

// ===== 渲染標籤 =====
function renderTags(){
    selectedTagsBox.innerHTML = "";
    Object.entries(selectedFilters).forEach(([type, values])=>{
        values.forEach(val=>{
            const tag = document.createElement("div");
            tag.className = "tag";
            tag.innerHTML = `${val} <button data-type="${type}" data-value="${val}">×</button>`;
            selectedTagsBox.appendChild(tag);
        });
    });
    selectedTagsBox.querySelectorAll("button").forEach(btn=>{
        btn.addEventListener("click", ()=>{
            const { type, value } = btn.dataset;
            selectedFilters[type] = selectedFilters[type].filter(v=>v!==value);
            document.querySelectorAll(`.option-btn[data-type="${type}"][data-value="${value}"]`)
                .forEach(b=>b.classList.remove("active"));
            renderTags();
            applyFilters();
        });
    });
}

// ===== 套用篩選 =====
function applyFilters(){
    let result = [...products];
    if(selectedFilters.type.length) result = result.filter(p=>selectedFilters.type.includes(p.type));
    if(selectedFilters.category.length) result = result.filter(p=>selectedFilters.category.includes(p.category));
    if(selectedFilters.color.length) result = result.filter(p=>p.colors.some(c=>selectedFilters.color.includes(c)));
    if(selectedFilters.material.length) result = result.filter(p=>selectedFilters.material.includes(p.material));
    if(selectedFilters.shape.length) result = result.filter(p=>selectedFilters.shape.includes(p.shape));
    if(selectedFilters.price.length) {
        result = result.filter(p => {
            return selectedFilters.price.some(range => {
                if(range === "5001+") return p.price > 5000;
                const [min,max] = range.split("-").map(n=>parseInt(n));
                return p.price >= min && p.price <= max;
            });
        });
    }
    currentProducts = result;
    renderProducts(result);
}

// ===== 初始化 =====
renderProducts(products);
