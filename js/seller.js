/* ==========================================
   HAMARA BAZAAR
   MOBILE-FIRST BUSINESS DASHBOARD
========================================== */


/* ==========================================
   APP ROOT
========================================== */

const app =
    document.getElementById(
        "sellerApp"
    );


/* ==========================================
   GET ACTIVE BUSINESS
========================================== */

const business =
    getActiveBusiness();


/* ==========================================
   NO BUSINESS
========================================== */

if(!business){

    app.innerHTML = `

        <div class="businessEmpty">

            <div class="emptyIcon">

                🏪

            </div>

            <h2>

                No Business Selected

            </h2>

            <p>

                Select a business from
                My Business to continue.

            </p>

            <button
                onclick="
                location.href='role.html'
                ">

                ← My Business

            </button>

        </div>

    `;

}


/* ==========================================
   BUSINESS FOUND
========================================== */

else{

    const shop =
        getShopByBusinessId(
            business.id
        );

    renderDashboard(
        business,
        shop
    );

}


/* ==========================================
   DASHBOARD
========================================== */

function renderDashboard(
    business,
    shop
){

    if(!shop){

        app.innerHTML = `

            <div class="businessEmpty">

                <div class="emptyIcon">

                    🏪

                </div>

                <h2>

                    Complete Your Business

                </h2>

                <p>

                    Your business is registered,
                    but your shop setup
                    is not complete.

                </p>

                <button
                    onclick="
                    location.href='createshop.html'
                    ">

                    Complete Setup →

                </button>

            </div>

        `;

        return;

    }


    /* ======================================
       DATA
    ====================================== */

    const products =
        getProductsByShop(
            shop.id
        );


    const orders =
        getOrders().filter(

            order =>
                order.shopId == shop.id

        );


    const pendingOrders =
        orders.filter(

            order =>
                order.status == "Pending"

        ).length;


    /* ======================================
       DASHBOARD UI
    ====================================== */

    app.innerHTML = `

    <div class="businessApp">


        <!-- APP HEADER -->

        <div class="businessTopbar">

            <button
                class="businessBack"
                onclick="
                location.href='role.html'
                ">

                ←

            </button>

            <div>

                <div class="businessTopTitle">

                    My Business

                </div>

                <div class="businessTopSubtitle">

                    Manage your business

                </div>

            </div>

        </div>



        <!-- BUSINESS IDENTITY -->

        <section
            class="businessIdentity">


            <div class="businessLogo">

                <img
                    src="${
                        shop.logo ||
                        'assets/shop-placeholder.png'
                    }"
                    alt="Business Logo">

            </div>


            <div class="businessIdentityInfo">

                <h1>

                    ${business.name}

                </h1>

                <p>

                    ${shop.category || "Local Business"}

                </p>

                <span class="businessStatus">

                    ● Active

                </span>

            </div>


           <button
    class="businessMore"
    onclick="
    location.href='createshop.html?edit=true'
    ">

                ⋮

            </button>

        </section>



        <!-- QUICK STATS -->

        <section
            class="businessStats">


            <div class="businessStat">

                <strong>

                    ${products.length}

                </strong>

                <span>

                    Products

                </span>

            </div>


            <div class="businessStat">

                <strong>

                    ${orders.length}

                </strong>

                <span>

                    Orders

                </span>

            </div>


            <div class="businessStat">

                <strong>

                    ${pendingOrders}

                </strong>

                <span>

                    Pending

                </span>

            </div>


            <div class="businessStat">

                <strong>

                    New

                </strong>

                <span>

                    Rating

                </span>

            </div>


        </section>



        <!-- PRIMARY ACTION -->

        <button
            class="primaryBusinessAction"
            onclick="
            location.href='addproduct.html'
            ">

            <span>

                ＋

            </span>

            Add Product

        </button>



        <!-- BUSINESS ACTIONS -->

        <section
            class="businessActions">


            <div
                class="businessAction"
                onclick="
                location.href='myproducts.html'
                ">

                <div class="businessActionIcon">

                    📦

                </div>

                <div>

                    <strong>

                        My Products

                    </strong>

                    <span>

                        Manage your products

                    </span>

                </div>

                <b>

                    ›

                </b>

            </div>



            <div
                class="
                businessAction
                ${
                    pendingOrders > 0
                    ? 'businessActionAlert'
                    : ''
                }
                "
                onclick="
                location.href='sellerorders.html'
                ">

                <div class="businessActionIcon">

                    🛒

                </div>

                <div>

                    <strong>

                        Incoming Orders

                    </strong>

                    <span>

                        ${
                            pendingOrders
                        }
                        pending order(s)

                    </span>

                </div>

                <b>

                    ›

                </b>

            </div>



           <div
    class="businessAction"
    onclick="
    location.href='createshop.html?edit=true'
    ">

                <div class="businessActionIcon">

                    ✏️

                </div>

                <div>

                    <strong>

                        Edit Business

                    </strong>

                    <span>

                        Update your business

                    </span>

                </div>

                <b>

                    ›

                </b>

            </div>



            <div
                class="businessAction"
                onclick="
                openShop(${shop.id})
                ">

                <div class="businessActionIcon">

                    👁

                </div>

                <div>

                    <strong>

                        View My Shop

                    </strong>

                    <span>

                        See your customer view

                    </span>

                </div>

                <b>

                    ›

                </b>

            </div>


        </section>



        <!-- RECENT PRODUCTS -->

        <section
            class="businessRecent">


            <div class="businessSectionHeader">

                <h2>

                    Recent Products

                </h2>

                <a
                    href="myproducts.html">

                    View All

                </a>

            </div>


            <div
                id="recentProducts">

            </div>


        </section>


    </div>

    `;

}
