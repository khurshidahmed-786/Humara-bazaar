/* ==========================================================
   HAMARA BAZAAR HOMEPAGE ENGINE
   (Now pulling real data from Supabase instead of localStorage)
   ========================================================== */


/* ==========================================
   FEATURED PRODUCTS
   ========================================== */

async function renderFeaturedProducts(){

    const container = document.getElementById("featuredProducts");
    if(!container) return;

    let products = [];

    try {
        products = await dbGetFeaturedProducts();
    } catch(err) {
        console.error("Failed to load featured products:", err);
    }

    container.innerHTML = "";

    if(products.length === 0){
        container.innerHTML = `
            <div class="emptyState">
                <div class="emptyIcon">⭐</div>
                <p>Featured products will appear here.</p>
            </div>
        `;
        return;
    }

    // Fetch shop names for all products in ONE query instead of one-per-product
    const shopIds = [...new Set(products.map(p => p.shop_id))];
    let shopMap = {};

    try {
        const shops = await dbGetShopsByIds(shopIds);
        shops.forEach(shop => { shopMap[shop.id] = shop.name; });
    } catch(err) {
        console.error("Failed to load shop names:", err);
    }

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "productCard";

        card.innerHTML = `
            <div class="productImage">
                ${
                    product.image
                    ? `<img src="${product.image}" alt="${product.name}">`
                    : `<span>${product.emoji || "📦"}</span>`
                }
            </div>

            <div class="productBody">
                <div class="productName">${product.name}</div>
                <div class="productShop">${shopMap[product.shop_id] || "Local Seller"}</div>
                <div class="productPrice">₹${product.price}</div>
            </div>
        `;

        card.onclick = function(){
            window.location.href = `product.html?id=${product.id}`;
        };

        container.appendChild(card);
    });
}


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
   HOMEPAGE INITIALIZATION
   ========================================== */

document.addEventListener("DOMContentLoaded", function(){
    renderCategories();
    renderFeaturedProducts();
    renderPopularShops();
});
