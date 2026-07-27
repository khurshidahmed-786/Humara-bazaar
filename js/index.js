/* ==========================================================
   HAMARA BAZAAR HOMEPAGE ENGINE
   Shops row + category/sort filters + endless-scroll product
   feed, all pulling real data from Supabase.
   ========================================================== */


/* Product categories are now dynamic — loaded from the
   `categories` table via renderCategoryFilterOptions(). */


/* ==========================================
   POPULAR SHOPS
   ========================================== */

async function renderPopularShops(){

    const container = document.getElementById("shopScroll");
    if(!container) return;

    let shops = [];

    try {
        shops = await dbGetAllShops();
    } catch(err) {
        console.error("Failed to load shops:", err);
    }

    container.innerHTML = "";

    if(shops.length === 0){
        container.innerHTML = `
            <div class="emptyState">
                <div class="emptyIcon">🏪</div>
                <p>Local shops will appear here.</p>
            </div>
        `;
        return;
    }

    shops.forEach(shop => {

        const card = document.createElement("div");
        card.className = "shopMarketplaceCard";

        card.innerHTML = `
            <div class="shopMarketplaceImage">
                ${
                    shop.banner
                    ? `<img src="${shop.banner}" alt="${shop.name}">`
                    : `<span>🏪</span>`
                }
            </div>

            <div class="shopMarketplaceBody">
                <div class="shopMarketplaceName">${shop.name}</div>
                <div class="shopMarketplaceCategory">${shop.category || "Local Business"}</div>
                <div class="shopMarketplaceStatus">🟢 Open</div>
            </div>
        `;

        card.onclick = function(){
            window.location.href = `shop.html?id=${shop.id}`;
        };

        container.appendChild(card);
    });
}


/* ==========================================
   CATEGORY FILTER DROPDOWN
   ========================================== */

async function renderCategoryFilterOptions(){

    const select = document.getElementById("categoryFilter");
    if(!select) return;

    let categories = [];

    try {
        categories = await dbGetActiveCategories();
    } catch(err) {
        console.error("Failed to load categories:", err);
    }

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });
}


/* ==========================================
   PRODUCT FEED (endless scroll)
   ========================================== */

const feedState = {
    category: "",
    sort: "newest",
    search: "",
    offset: 0,
    limit: 12,
    loading: false,
    done: false
};

function productCard(product, shopName){

    const card = document.createElement("div");
    card.className = "hbProductCard";

    card.innerHTML = `
        <div class="hbProductImage">
            ${
                product.image
                ? `<img src="${product.image}" alt="${product.name}">`
                : `<span>${product.emoji || "📦"}</span>`
            }
        </div>

        <div class="hbProductDetails">
            <div class="hbProductName">${product.name}</div>
            <div class="productShop">${shopName || "Local Seller"}</div>

            <div class="hbProductBottom">
                <div class="hbProductPrice">₹${product.price}</div>
                <button class="hbAddCartBtn" type="button">+</button>
            </div>
        </div>
    `;

    card.onclick = function(){
        window.location.href = `product.html?id=${product.id}`;
    };

    card.querySelector(".hbAddCartBtn").onclick = function(event){
        event.stopPropagation();
        addToCart(product.id, 1);
    };

    return card;
}

async function loadMoreProducts(){

    if(feedState.loading || feedState.done) return;

    feedState.loading = true;

    const loadingEl = document.getElementById("feedLoading");
    const emptyEl = document.getElementById("feedEmpty");
    const grid = document.getElementById("productGrid");

    if(loadingEl) loadingEl.style.display = "block";

    let products = [];

    try {
        products = await dbGetProductsFeed({
            category: feedState.category,
            sort: feedState.sort,
            search: feedState.search,
            limit: feedState.limit,
            offset: feedState.offset
        });
    } catch(err) {
        console.error("Failed to load products:", err);
        feedState.loading = false;
        if(loadingEl) loadingEl.style.display = "none";
        return;
    }

    if(products.length < feedState.limit){
        feedState.done = true;
    }

    feedState.offset += products.length;

    if(feedState.offset === products.length && products.length === 0){
        if(emptyEl) emptyEl.style.display = "block";
    }else if(emptyEl){
        emptyEl.style.display = "none";
    }

    if(products.length > 0){

        const shopIds = [...new Set(products.map(p => p.shop_id))];
        let shopMap = {};

        try {
            const shops = await dbGetShopsByIds(shopIds);
            shops.forEach(shop => { shopMap[shop.id] = shop.name; });
        } catch(err) {
            console.error("Failed to load shop names:", err);
        }

        products.forEach(product => {
            grid.appendChild(productCard(product, shopMap[product.shop_id]));
        });
    }

    if(loadingEl){
        loadingEl.style.display = feedState.done ? "none" : "block";
    }

    feedState.loading = false;
}

function resetAndLoadFeed(){

    feedState.offset = 0;
    feedState.done = false;

    const grid = document.getElementById("productGrid");
    if(grid) grid.innerHTML = "";

    loadMoreProducts();
}

let searchDebounce = null;

function initFeedControls(){

    const categorySelect = document.getElementById("categoryFilter");
    const sortSelect = document.getElementById("sortFilter");
    const searchInput = document.getElementById("searchInput");

    if(categorySelect){
        categorySelect.onchange = function(){
            feedState.category = categorySelect.value;
            resetAndLoadFeed();
        };
    }

    if(sortSelect){
        sortSelect.onchange = function(){
            feedState.sort = sortSelect.value;
            resetAndLoadFeed();
        };
    }

    if(searchInput){
        searchInput.oninput = function(){
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(function(){
                feedState.search = searchInput.value.trim();
                resetAndLoadFeed();
            }, 400);
        };
    }
}

function initInfiniteScroll(){

    const sentinel = document.getElementById("feedSentinel");
    if(!sentinel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(function(entries){
        entries.forEach(entry => {
            if(entry.isIntersecting){
                loadMoreProducts();
            }
        });
    });

    observer.observe(sentinel);
}


/* ==========================================
   HOMEPAGE INITIALIZATION
   ========================================== */

document.addEventListener("DOMContentLoaded", function(){
    renderPopularShops();
    renderCategoryFilterOptions();
    initFeedControls();
    initInfiniteScroll();
    loadMoreProducts();
});
