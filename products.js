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
    { id:101, name:"2026 潮流百搭厚邊框鈦輕盈系列", price:3980, colors:["beige","black"], category:"MEN", material:"鈦合金", shape:"方框", type:"光學眼鏡", url:"goods/good1.html", image:"image/goods/1/1-1.jpg" },
    { id:102, name:"極簡金屬輕量框", price:3280, colors:["black"], category:"WOMEN", material:"金屬", shape:"圓框", type:"光學眼鏡", url:"goods/good2.html", image:"image/goods/2/2-1.jpg" },
    { id:103, name:"抗藍光學生款", price:2680, colors:["beige"], category:"KID&JUNIOR", material:"醋酸纖維/塑膠", shape:"貓眼框", type:"藍光眼鏡", url:"goods/good3.html", image:"image/goods/3/3-1.jpg" },
    { id:104, name:"時尚太陽鏡 A款", price:3980, colors:["black"], category:"UNISEX", material:"金屬", shape:"飛行員款", type:"太陽眼鏡", url:"goods/good4.html", image:"image/goods/4/4-1.jpg" },
    { id:105, name:"眼鏡盒配件套組", price:580, colors:["black","beige"], category:"UNISEX", material:"塑膠", shape:"其他", type:"配件", url:"goods/good5.html", image:"image/goods/5/5-1.jpg" }
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
                        <button class="favorite ${isFav?"active":""}" data-id="${p.id}">${isFav?"♥":"♡"}</button>
                        <img src="${p.image || 'image/default.jpg'}">
                        <p class="title">${p.name}</p>
                        <p class="price">NT$${p.price}</p>
                        <div class="colors">${p.colors.map(c=>`<span class="color ${c}"></span>`).join("")}</div>
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

// ===== 排序 =====
sortBtn.addEventListener("click", ()=>{ sortList.parentElement.classList.toggle("show"); });
sortList.querySelectorAll("li").forEach(li=>{
    li.addEventListener("click", ()=>{
        const sortType = li.dataset.sort;
        sortBtn.textContent = li.textContent + " ⬍";
        if(sortType==="newest") currentProducts.sort((a,b)=>b.id-a.id);
        else if(sortType==="price-desc") currentProducts.sort((a,b)=>b.price-b.price);
        else if(sortType==="price-asc") currentProducts.sort((a,b)=>a.price-b.price);
        renderProducts(currentProducts);
        sortList.parentElement.classList.remove("show");
    });
});

// ===== 初始化 =====
renderProducts(products);
