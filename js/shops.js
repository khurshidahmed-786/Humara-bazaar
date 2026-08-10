/* ==========================================================
   ALL SHOPS PAGE
   Real Supabase-backed shop directory, with optional
   ?category= filter and client-side name search.

   NOTE: js/shopStatus.js must be included BEFORE this file —
   it provides isShopOpenNow() / shopStatusBadgeHTML().
   ========================================================== */

let allShopsCache = [];
let currentCategoryFilter = "";

function applyShopFilters(){

    const searchInput = document.getElementById("shopSearchInput");
    const term = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filtered = allShopsCache;

    if(currentCategoryFilter){
        filtered = filtered.filter(shop => (shop.category || "") === currentCategoryFilter);
    }

    if(term){
        filtered = filtered.filter(shop => (shop.name || "").toLowerCase().includes(term));
    }

    renderShopsGrid(filtered);
}

async function populateShopCategoryFilter(){

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

    select.onchange = function(){
        currentCategoryFilter = select.value;
        applyShopFilters();
    };
}

async function initShopsPage(){

    const params = new URLSearchParams(window.location.search);
    currentCategoryFilter = params.get("category") || "";

    let shops = [];

    try {
        shops = await dbGetAllShops();
    } catch(err) {
        console.error("Failed to load shops:", err);
    }

    allShopsCache = shops;

    await populateShopCategoryFilter();

    const categorySelect = document.getElementById("categoryFilter");
    if(categorySelect && currentCategoryFilter){
        categorySelect.value = currentCategoryFilter;
    }

    applyShopFilters();

    const searchInput = document.getElementById("shopSearchInput");

    if(searchInput){
        searchInput.oninput = applyShopFilters;
    }
}

document.addEventListener("DOMContentLoaded", initShopsPage);

function renderShopsGrid(shops){

    const grid = document.getElementById("allShopsGrid");
    const empty = document.getElementById("shopsEmpty");

    grid.innerHTML = "";

    if(shops.length === 0){
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    shops.forEach(shop => {

        const card = document.createElement("div");
        card.className = "shopMarketplaceCard";

        card.innerHTML = `
            <div class="shopMarketplaceImage" style="position:relative;">
                ${
                    shop.banner
                    ? `<img src="${shop.banner}" alt="${shop.name}">`
                    : `<span>🏪</span>`
                }
                ${
                    shop.logo
                    ? `<img class="shopMarketplaceLogo" src="${shop.logo}" alt="${shop.name} logo">`
                    : ""
                }
            </div>

            <div class="shopMarketplaceBody">
                <div class="shopMarketplaceName">${shop.name}</div>
                <div class="shopMarketplaceCategory">${shop.category || "Local Business"}</div>
                <div class="shopMarketplaceStatus">${shopStatusBadgeHTML(shop)}</div>
            </div>
        `;

        card.onclick = function(){
            window.location.href = `shop.html?id=${shop.id}`;
        };

        grid.appendChild(card);
    });
}