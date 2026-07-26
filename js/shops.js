/* ==========================================================
   ALL SHOPS PAGE
   Real Supabase-backed shop directory, with optional
   ?category= filter and client-side name search.
   ========================================================== */

let allShopsCache = [];

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

        grid.appendChild(card);
    });
}

async function initShopsPage(){

    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get("category");

    let shops = [];

    try {
        shops = await dbGetAllShops();
    } catch(err) {
        console.error("Failed to load shops:", err);
    }

    if(categoryFilter){
        shops = shops.filter(shop =>
            (shop.category || "").toLowerCase() === categoryFilter.toLowerCase()
        );
    }

    allShopsCache = shops;
    renderShopsGrid(allShopsCache);

    const searchInput = document.getElementById("shopSearchInput");

    if(searchInput){
        searchInput.oninput = function(){
            const term = searchInput.value.trim().toLowerCase();

            const filtered = term
                ? allShopsCache.filter(shop => (shop.name || "").toLowerCase().includes(term))
                : allShopsCache;

            renderShopsGrid(filtered);
        };
    }
}

document.addEventListener("DOMContentLoaded", initShopsPage);
