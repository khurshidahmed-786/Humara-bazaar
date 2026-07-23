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


    /*
    No featured products
    */

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


    /*
    Show maximum 10
    products on homepage
    */

    products
        .slice(0,10)
        .forEach(

            product => {

                container.innerHTML += `

                <div
                class="product"
                onclick="
                openProduct(${product.id})
                ">


                    <div class="image">

                        ${
                            product.emoji ||
                            "📦"
                        }

                    </div>


                    <div class="info">


                        <div class="productName">

                            ${
                                product.name ||
                                "Unnamed Product"
                            }

                        </div>


                        <div class="price">

                            ₹${
                                product.price ||
                                0
                            }

                        </div>


                    </div>


                </div>

                `;

            }

        );

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

        loadHomePage();

    }

);
