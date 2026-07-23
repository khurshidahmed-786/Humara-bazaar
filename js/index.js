/* ==========================================
   HAMARA BAZAAR HOME PAGE ENGINE
========================================== */


/* ==========================================
   LOAD HOMEPAGE
========================================== */

function loadHomePage(){

    renderFeaturedProducts();

    renderPopularShops();

}


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
                📦
            </div>

            <p>
                No featured products yet.
            </p>

        </div>

        `;

        return;

    }

    products
        .slice(0,10)
        .forEach(product => {

            container.innerHTML += `

            <article
            class="hbProductCard"
            onclick="openProduct(${product.id})">


                <div class="hbProductImage">

                    ${
                        product.image

                        ?

                        `<img
                        src="${product.image}"
                        alt="${product.name}">`

                        :

                        `<span>
                            ${product.emoji || "📦"}
                        </span>`
                    }

                </div>


                <div class="hbProductDetails">


                    <h3 class="hbProductName">

                        ${
                            product.name ||
                            "Unnamed Product"
                        }

                    </h3>


                    <div class="hbProductBottom">


                        <span class="hbProductPrice">

                            ₹${product.price || 0}

                        </span>


                        <button
                        class="hbAddCartBtn"
                        onclick="
                        event.stopPropagation();
                        addToCartFromHome(${product.id});
                        ">

                            +

                        </button>


                    </div>


                </div>


            </article>

            `;

        });

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


    /*
    No shops
    */

    if(shops.length === 0){

        container.innerHTML = `

        <div class="emptyState">

            <div class="emptyIcon">

                🏪

            </div>

            <p>

                No shops available yet.

            </p>

        </div>

        `;

        return;

    }


    /*
    Show maximum 10
    shops on homepage
    */

    shops
        .slice(0,10)
        .forEach(

            shop => {

                container.innerHTML += `

                <div
                class="shopCard"
                onclick="
                openShop(${shop.id})
                ">


                    <div class="shopImage">

                        ${
                            shop.logo
                            ?

                            `<img
                            src="${shop.logo}"
                            alt="${shop.name}">`

                            :

                            "🏪"

                        }

                    </div>


                    <div class="shopInfo">


                        <div class="shopName">

                            ${
                                shop.name ||
                                "Unnamed Shop"
                            }

                        </div>


                        <div class="shopCategory">

                            ${
                                shop.category ||
                                "Local Business"
                            }

                        </div>


                    </div>


                </div>

                `;

            }

        );

}


/* ==========================================
   START HOMEPAGE
========================================== */
document.addEventListener(
    "DOMContentLoaded",
    function(){

        renderCategories();

        renderFeaturedProducts();

        renderPopularShops();

    }
);
function addToCartFromHome(productId){

    const product =
        getProductById(productId);

    if(!product){

        return;

    }

    /*
    Use existing cart system
    */

    if(typeof addToCart === "function"){

        addToCart(product);

        updateCartBadge();

        return;

    }

    /*
    Fallback
    */

    alert(
        "Product added to cart."
    );

}
