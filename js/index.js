/* ==========================================
   HAMARA BAZAAR HOMEPAGE ENGINE
========================================== */


/* ==========================================
   FEATURED PRODUCTS
========================================== */

function renderFeaturedProducts(){

    const container =
        document.getElementById(
            "featuredProducts"
        );

    if(!container){

        return;

    }

    const products =
        getFeaturedProducts();


    container.innerHTML = "";


    if(products.length === 0){

        container.innerHTML = `

            <div class="emptyState">

                <div class="emptyIcon">

                    ⭐

                </div>

                <p>

                    Featured products
                    will appear here.

                </p>

            </div>

        `;

        return;

    }


    products.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "productCard";


        card.innerHTML = `

            <div class="productImage">

                ${
                    product.image

                    ?

                    `<img
                        src="${product.image}"
                        alt="${product.name}">
                    `

                    :

                    `<span>
                        ${product.emoji || "📦"}
                    </span>`

                }

            </div>


            <div class="productBody">

                <div class="productName">

                    ${product.name}

                </div>


                <div class="productShop">

                    ${getShopName(product.shopId)}

                </div>


                <div class="productPrice">

                    ₹${product.price}

                </div>

            </div>

        `;


        card.onclick = function(){

            openProduct(product.id);

        };


        container.appendChild(card);

    });

}


/* ==========================================
   GET SHOP NAME
========================================== */

function getShopName(shopId){

    const shop =
        getShop(shopId);


    if(!shop){

        return "Local Seller";

    }


    return shop.name ||
        "Local Seller";

}


/* ==========================================
   POPULAR SHOPS
========================================== */

function renderPopularShops(){

    const container =
        document.getElementById(
            "shopScroll"
        );

    if(!container){

        return;

    }

    const shops =
        getAllShops();


    container.innerHTML = "";


    if(shops.length === 0){

        container.innerHTML = `

            <div class="emptyState">

                <div class="emptyIcon">

                    🏪

                </div>

                <p>

                    Local shops will
                    appear here.

                </p>

            </div>

        `;

        return;

    }


    shops.forEach(shop => {

        const card =
            document.createElement("div");


        card.className =
            "shopMarketplaceCard";


        card.innerHTML = `

            <div class="shopMarketplaceImage">

                ${
                    shop.banner

                    ?

                    `<img
                        src="${shop.banner}"
                        alt="${shop.name}">
                    `

                    :

                    `<span>
                        🏪
                    </span>`

                }

            </div>


            <div class="shopMarketplaceBody">

                <div class="shopMarketplaceName">

                    ${shop.name}

                </div>


                <div class="shopMarketplaceCategory">

                    ${shop.category || "Local Business"}

                </div>


                <div class="shopMarketplaceStatus">

                    🟢 Open

                </div>

            </div>

        `;


        card.onclick = function(){

            localStorage.setItem(

                "hb_selectedShop",

                shop.id

            );


            window.location.href =
                "shop.html";

        };


        container.appendChild(card);

    });

}


/* ==========================================
   HOMEPAGE INITIALIZATION
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    function(){

        renderCategories();

        renderFeaturedProducts();

        renderPopularShops();

    }

);
