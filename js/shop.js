/* ===========================
   BUSINESS MODULE
=========================== */

function createBusiness(business){

    let businesses = getBusinesses();

    business.id = Date.now();

    business.createdAt =
        new Date().toISOString();

    businesses.push(business);

    saveData(
        DB.BUSINESSES,
        businesses
    );

    return business;

}
function addBusinessToUser(
    userId,
    businessId
){

    let users = getUsers();

    const user = users.find(

        u => u.id == userId

    );

    if(!user){

        return false;

    }

    if(!user.businesses){

        user.businesses = [];

    }

    if(
        !user.businesses.includes(
            businessId
        )
    ){

        user.businesses.push(
            businessId
        );

    }

    saveData(
        DB.USERS,
        users
    );

    return true;

}
function getActiveBusiness(){

    const businessId = Number(

        localStorage.getItem(
            "hb_activeBusiness"
        )

    );

    if(!businessId){

        return null;

    }

    return getBusinessById(
        businessId
    );

}


function getShopByBusinessId(
    businessId
){

    return getShops().find(

        shop =>

        shop.businessId == businessId

    ) || null;

}
/* ===========================
   SHOP MODULE
=========================== */

function createShop(shop){

    let shops = getShops();

    shop.id = Date.now();

    shop.createdAt = new Date().toISOString();

    shops.push(shop);

    saveData(DB.SHOPS, shops);

    return shop;

}

function getShop(id){

    let shops = getShops();

    return shops.find(s => s.id == id);

}

function getAllShops(){

    return getShops();

}

function updateShop(updatedShop){

    let shops = getShops();

    shops = shops.map(shop =>

        shop.id == updatedShop.id

        ? updatedShop

        : shop

    );

    saveData(DB.SHOPS, shops);

}

function deleteShop(id){

    let shops = getShops();

    shops = shops.filter(

        shop => shop.id != id

    );

    saveData(DB.SHOPS, shops);

}
function getCurrentShop(){

    const id = Number(
        localStorage.getItem("hb_selectedShop")
    );

    if(!id){

        return null;

    }

    return getShops().find(

        shop => shop.id === id

    ) || null;

}
function renderShopProducts(){

    const shop = getCurrentShop();

    if(!shop){

        return;

    }

    const products = getProductsByShop(shop.id);

    renderSection(
        "featuredProducts",
        products.filter(p=>p.section==="featured")
    );

    renderSection(
        "newProducts",
        products.filter(p=>p.section==="new")
    );

    renderSection(
        "saleProducts",
        products.filter(p=>p.section==="sale")
    );

}
function renderSection(containerId,list){

    const wrap=document.getElementById(containerId);

    if(!wrap){

        return;

    }

    wrap.innerHTML="";

    if(list.length===0){

        wrap.innerHTML=`

        <div class="product">

            <div class="image">

                📦

            </div>

            <div class="info">

                No Products

            </div>

        </div>

        `;

        return;

    }

    list.forEach(product=>{

        wrap.innerHTML+=`

        <div
        class="product"
        onclick="openProduct(${product.id})">

            <div class="image">

                ${product.emoji || "📦"}

            </div>

            <div class="info">

                ${product.name}

                <div class="price">

                    ₹${product.price}

                </div>

            </div>

        </div>

        `;

    });

}
function openProduct(id){

    localStorage.setItem(

        "hb_selectedProduct",

        id

    );

    window.location.href="product.html";

}
function loadShopPage(){

    if(!document.getElementById("displayName")){

        return;

    }

    const shop = getCurrentShop();
 if(!shop){
    document.getElementById("displayName").innerText = 
       "Shop Not Found";
    return;
    
}

    document.getElementById("displayName").innerText =
    shop.name || "Unnamed Shop";

    document.getElementById("displayDescription").innerText =
    shop.description || "No description";

    document.getElementById("displayTime").innerText =
    `Open: ${shop.open || "8:00 AM"} - ${shop.close || "8:00 PM"}`;

    if(shop.logo){

        document.getElementById("displayLogo").src =
        shop.logo;

    }else{

        document.getElementById("displayLogo").style.display =
        "none";

    }

    document.getElementById("shopStatus").innerHTML =
    "🟢 Open Now";

    renderShopProducts();

}
function togglePanel(){

    const panel = document.getElementById(

        "shopPanel"

    );

    if(!panel){

        return;

    }

panel.style.display =
panel.style.display === "block"
? "none"
: "block";
}
document.addEventListener(

"DOMContentLoaded",

function(){

    loadShopPage();

});
