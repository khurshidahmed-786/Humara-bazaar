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


    const products =
        getProductsByShop(shop.id);


    renderSection(

        "featuredProducts",

        "featuredSection",

        products.filter(

            p => p.section === "featured"

        )

    );


    renderSection(

        "newProducts",

        "newSection",

        products.filter(

            p => p.section === "new"

        )

    );


    renderSection(

        "saleProducts",

        "saleSection",

        products.filter(

            p => p.section === "sale"

        )

    );

}
function renderSection(

    containerId,

    sectionId,

    list

){

    const wrap =
        document.getElementById(
            containerId
        );


    const section =
        document.getElementById(
            sectionId
        );


    if(!wrap || !section){

        return;

    }


    /*
    ======================================
    HIDE EMPTY SECTION
    ======================================
    */

    if(!list || list.length === 0){

        section.classList.add(
            "hidden"
        );

        wrap.innerHTML = "";

        return;

    }


    /*
    ======================================
    SHOW SECTION
    ======================================
    */

    section.classList.remove(
        "hidden"
    );


    wrap.innerHTML = "";


    list.forEach(product => {

        wrap.innerHTML += `

        <div

            class="product"

            onclick="
                openProduct(${product.id})
            ">

            <div class="image">

                ${
                    product.image

                    ?

                    `<img
                        src="${product.image}"
                        alt="${product.name}">
                    `

                    :

                    (
                        product.emoji
                        ||
                        "📦"
                    )
                }

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

    if(
        !document.getElementById(
            "displayName"
        )
    ){

        return;

    }


    const shop =
        getCurrentShop();


    if(!shop){

        document.getElementById(
            "displayName"
        ).innerText =
            "Shop Not Found";

        return;

    }


    /*
    ======================================
    SHOP NAME
    ======================================
    */

    document.getElementById(
        "displayName"
    ).innerText =

        shop.name
        ||
        "Unnamed Shop";


    /*
    ======================================
    DESCRIPTION
    ======================================
    */

    document.getElementById(
        "displayDescription"
    ).innerText =

        shop.description
        ||
        "Welcome to our shop.";


    /*
    ======================================
    LOCATION
    ======================================
    */

    const locationText =

        shop.location
        ||
        "Local Market";


    const billboardLocation =

        document.getElementById(
            "displayLocation"
        );


    const shopLocation =

        document.getElementById(
            "shopLocation"
        );


    if(billboardLocation){

        billboardLocation.innerText =

            "📍 " +
            locationText;

    }


    if(shopLocation){

        shopLocation.innerText =

            "📍 " +
            locationText;

    }


    /*
    ======================================
    OPENING HOURS
    ======================================
    */

    document.getElementById(
        "displayTime"
    ).innerText =

        `Open: ${
            shop.open || "8:00 AM"
        } - ${
            shop.close || "8:00 PM"
        }`;


    /*
    ======================================
    SHOP LOGO
    ======================================
    */

    const logo =
        document.getElementById(
            "displayLogo"
        );


    const placeholder =
        document.getElementById(
            "logoPlaceholder"
        );


    if(
        shop.logo &&
        shop.logo.trim() !== ""
    ){

        logo.src =
            shop.logo;

        logo.style.display =
            "block";


        if(placeholder){

            placeholder.style.display =
                "none";

        }

    }

    else{

        logo.style.display =
            "none";


        if(placeholder){

            placeholder.style.display =
                "flex";

        }

    }


    /*
    ======================================
    SHOP BILLBOARD COLOR
    ======================================
    */

    const billboard =
        document.getElementById(
            "shopBillboard"
        );


    if(billboard){

        billboard.style.background =

            shop.themeColor
            ||
            "#B63A3A";

    }


    /*
    ======================================
    SHOP STATUS
    ======================================
    */

    updateShopStatus(
        shop
    );


    /*
    ======================================
    PRODUCTS
    ======================================
    */

    renderShopProducts();

}

document.addEventListener(

"DOMContentLoaded",

function(){

    loadShopPage();

});
/* ==========================================
   BUSINESS → SHOP
========================================== */

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
function updateShopStatus(shop){

    const status =
        document.getElementById(
            "shopStatus"
        );


    if(!status){

        return;

    }


    /*
    ======================================
    FALLBACK
    ======================================
    */

    if(
        !shop.open ||
        !shop.close
    ){

        status.innerHTML =
            "🟢 Open Now";

        return;

    }


    const now =
        new Date();


    const currentMinutes =

        now.getHours() * 60
        +
        now.getMinutes();


    function timeToMinutes(time){

        const match =

            time
                .trim()
                .match(
                    /^(\d{1,2}):?(\d{0,2})\s*(AM|PM)?$/i
                );


        if(!match){

            return null;

        }


        let hour =
            parseInt(
                match[1]
            );


        let minute =

            parseInt(
                match[2] || "0"
            );


        const period =

            match[3]
            ?

            match[3].toUpperCase()

            :

            null;


        if(
            period === "PM" &&
            hour !== 12
        ){

            hour += 12;

        }


        if(
            period === "AM" &&
            hour === 12
        ){

            hour = 0;

        }


        return (

            hour * 60
            +
            minute

        );

    }


    const openMinutes =

        timeToMinutes(
            shop.open
        );


    const closeMinutes =

        timeToMinutes(
            shop.close
        );


    if(
        openMinutes === null ||
        closeMinutes === null
    ){

        status.innerHTML =
            "🟢 Open Now";

        return;

    }


    let isOpen;


    /*
    Overnight shop
    Example:
    6:00 PM → 2:00 AM
    */

    if(
        closeMinutes <
        openMinutes
    ){

        isOpen =

            currentMinutes >=
            openMinutes

            ||

            currentMinutes <=
            closeMinutes;

    }

    else{

        isOpen =

            currentMinutes >=
            openMinutes

            &&

            currentMinutes <=
            closeMinutes;

    }


    if(isOpen){

        status.innerHTML =
            "🟢 Open Now";

        status.classList.remove(
            "closed"
        );

    }

    else{

        status.innerHTML =
            "🔴 Closed Now";

        status.classList.add(
            "closed"
        );

    }

}
