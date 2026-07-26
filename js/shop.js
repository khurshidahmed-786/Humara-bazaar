/* ==========================================
   PUBLIC SHOP PAGE (real Supabase data)
========================================== */

let currentShop = null;


function getShopIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}


async function loadShopPage(){

    if(!document.getElementById("displayName")) return;

    const shopId = getShopIdFromUrl();

    if(!shopId){
        document.getElementById("displayName").innerText = "Shop Not Found";
        return;
    }

    const shop = await dbGetShop(shopId);

    if(!shop){
        document.getElementById("displayName").innerText = "Shop Not Found";
        return;
    }

    currentShop = shop;


    /* NAME + DESCRIPTION */

    document.getElementById("displayName").innerText = shop.name || "Unnamed Shop";
    document.getElementById("displayDescription").innerText = shop.description || "";


    /* LOCATION */

    const locationText = shop.location || shop.address || "";
    const billboardLocation = document.getElementById("displayLocation");

    if(locationText){
        billboardLocation.innerText = "📍 " + locationText;
    } else {
        billboardLocation.innerText = "";
    }


    /* HOURS */

    document.getElementById("displayTime").innerText =
        `Open: ${shop.open_time || "8:00 AM"} — ${shop.close_time || "8:00 PM"}`;


    /* LOGO */

    const logo = document.getElementById("displayLogo");
    const logoPlaceholder = document.getElementById("logoPlaceholder");

    if(logo){
        if(shop.logo){
            logo.src = shop.logo;
            logo.style.display = "block";
            if(logoPlaceholder) logoPlaceholder.style.display = "none";
        } else {
            logo.style.display = "none";
            if(logoPlaceholder) logoPlaceholder.style.display = "flex";
        }
    }


    /* OPEN/CLOSED STATUS */

    updateShopStatus(shop);


    /* PRODUCTS */

    await renderShopProducts(shop.id);


    /* ACTION BAR */

    const browseBtn = document.getElementById("browseProductsBtn");
    if(browseBtn){
        browseBtn.onclick = function(){
            document.querySelector(".shopProducts").scrollIntoView({ behavior: "smooth" });
        };
    }

    const contactBtn = document.getElementById("contactShopBtn");
    if(contactBtn){
        contactBtn.onclick = function(){
            alert("Direct contact is coming soon. For now, add items to your cart and checkout to place an order.");
        };
    }
}


async function renderShopProducts(shopId){

    let products = [];

    try {
        products = await dbGetProductsByShop(shopId);
    } catch(err) {
        console.error(err);
    }

    renderSection("featuredProducts", products.filter(p => p.section === "featured"));
    renderSection("newProducts", products.filter(p => p.section === "new"));
    renderSection("saleProducts", products.filter(p => p.section === "sale"));
}


function renderSection(containerId, list){

    const wrap = document.getElementById(containerId);
    if(!wrap) return;

    const section = wrap.closest(".productSection");

    if(!list || list.length === 0){
        wrap.innerHTML = "";
        if(section) section.classList.add("hidden");
        return;
    }

    if(section) section.classList.remove("hidden");

    wrap.innerHTML = "";

    list.forEach(product => {
        wrap.innerHTML += `
            <div class="product" onclick="openProduct(${product.id})">
                <div class="image">
                    ${
                        product.image
                        ? `<img src="${product.image}" alt="${product.name}">`
                        : (product.emoji || "📦")
                    }
                </div>
                <div class="info">
                    ${product.name}
                    <div class="price">₹${product.price}</div>
                </div>
            </div>
        `;
    });
}


function openProduct(id){
    window.location.href = `product.html?id=${id}`;
}


function updateShopStatus(shop){

    const status = document.getElementById("shopStatus");
    if(!status) return;

    if(!shop.open_time || !shop.close_time){
        status.innerHTML = "🟢 Open Now";
        return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    function timeToMinutes(time){
        const match = time.trim().match(/^(\d{1,2}):?(\d{0,2})\s*(AM|PM)?$/i);
        if(!match) return null;

        let hour = parseInt(match[1]);
        let minute = parseInt(match[2] || "0");
        const period = match[3] ? match[3].toUpperCase() : null;

        if(period === "PM" && hour !== 12) hour += 12;
        if(period === "AM" && hour === 12) hour = 0;

        return hour * 60 + minute;
    }

    const openMinutes = timeToMinutes(shop.open_time);
    const closeMinutes = timeToMinutes(shop.close_time);

    if(openMinutes === null || closeMinutes === null){
        status.innerHTML = "🟢 Open Now";
        return;
    }

    let isOpen;

    // Overnight shop, e.g. 6:00 PM → 2:00 AM
    if(closeMinutes < openMinutes){
        isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    } else {
        isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }

    if(isOpen){
        status.innerHTML = "🟢 Open Now";
        status.classList.remove("closed");
    } else {
        status.innerHTML = "🔴 Closed Now";
        status.classList.add("closed");
    }
}


document.addEventListener("DOMContentLoaded", function(){
    loadShopPage();
});
