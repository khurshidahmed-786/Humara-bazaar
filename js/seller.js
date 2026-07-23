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
   NO BUSINESS SELECTED
========================================== */

if(!business){

    app.innerHTML = `

    <div class="sellerContainer">

        <div class="shopCard">

            <h2>
                No Business Selected
            </h2>

            <p>
                Please select a business
                from My Business.
            </p>

            <br>

            <a href="role.html">

                ← My Business

            </a>

        </div>

    </div>

    `;

}


/* ==========================================
   BUSINESS SELECTED
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

    /*
    ======================================
    SHOP NOT FOUND
    ======================================
    */

    if(!shop){

        app.innerHTML = `

        <div class="sellerContainer">

            <div class="shopCard">

                <h2>
                    Shop Setup Required
                </h2>

                <p>
                    Your business exists,
                    but no shop is linked
                    to this business.
                </p>

                <br>

                <a href="createshop.html">

                    Complete Shop Setup →

                </a>

            </div>

        </div>

        `;

        return;

    }


    /*
    ======================================
    GET SHOP DATA
    ======================================
    */

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


    /*
    ======================================
    RENDER DASHBOARD
    ======================================
    */

    app.innerHTML = `

    <div class="sellerContainer">

        <header class="sellerHeader">

            <h1>

                Business Dashboard

            </h1>

            <p>

                Managing

                <strong>

                    ${business.name}

                </strong>

            </p>

            <p>

                Manage your business
                from one place.

            </p>

        </header>


        <div class="shopCard">

            <div
            style="
            display:flex;
            align-items:center;
            gap:20px;
            ">

                <img

                src="${
                    shop.logo ||
                    'assets/shop-placeholder.png'
                }"

                style="
                width:90px;
                height:90px;
                border-radius:20px;
                object-fit:cover;
                background:#F3F3F3;
                ">

                <div>

                    <div class="shopName">

                        🏪 ${business.name}

                    </div>

                    <div
                    style="
                    margin-top:6px;
                    color:#777;
                    ">

                        Shop:
                        ${shop.name}

                    </div>

                    <div
                    style="
                    margin-top:8px;
                    color:#666;
                    ">

                        ${shop.open || "8:00 AM"}

                        —

                        ${shop.close || "8:00 PM"}

                    </div>

                </div>

            </div>


            <div class="shopDescription">

                ${
                    shop.description ||
                    "No description yet."
                }

            </div>

        </div>


        <div class="stats">

            <div class="stat">

                <div class="statValue">

                    ${products.length}

                </div>

                <div class="statLabel">

                    📦 Products

                </div>

            </div>


            <div class="stat">

                <div class="statValue">

                    ${orders.length}

                </div>

                <div class="statLabel">

                    🛒 Orders

                </div>

            </div>


            <div class="stat">

                <div class="statValue">

                    New

                </div>

                <div class="statLabel">

                    ⭐ Rating

                </div>

            </div>


            <div class="stat">

                <div class="statValue">

                    0

                </div>

                <div class="statLabel">

                    👀 Visitors

                </div>

            </div>

        </div>


        <div class="quickActions">


            <div
            class="actionCard"
            onclick="
            location.href='addproduct.html'
            ">

                <div class="actionIcon">

                    ➕

                </div>

                <div class="actionTitle">

                    Add Product

                </div>

                <div class="actionText">

                    Publish a new product

                </div>

            </div>


            <div
            class="actionCard"
            onclick="
            location.href='myproducts.html'
            ">

                <div class="actionIcon">

                    📦

                </div>

                <div class="actionTitle">

                    My Products

                </div>

                <div class="actionText">

                    Manage products

                </div>

            </div>


            <div
            class="actionCard"
            onclick="
            location.href='createshop.html'
            ">

                <div class="actionIcon">

                    ✏️

                </div>

                <div class="actionTitle">

                    Edit Business

                </div>

                <div class="actionText">

                    Update business details

                </div>

            </div>


            <div
            class="
            actionCard
            ${pendingOrders > 0
                ? 'newOrders'
                : ''}
            "
            onclick="
            location.href='sellerorders.html'
            ">

                <div class="actionIcon">

                    📦

                </div>

                <div class="actionTitle">

                    Incoming Orders

                </div>

                <div class="actionText">

                    ${pendingOrders}
                    Pending Order(s)

                </div>

            </div>


            <div
            class="actionCard"
            onclick="
            openShop(${shop.id})
            ">

                <div class="actionIcon">

                    👁

                </div>

                <div class="actionTitle">

                    View Shop

                </div>

                <div class="actionText">

                    See customer view

                </div>

            </div>


        </div>


        <h2
        style="margin-top:50px;">

            Recent Products

        </h2>


        <div id="recentProducts">

        </div>


    </div>

    `;

}
