function renderHeader(title = "Hamara Bazaar"){

    return `

    <header class="topbar">

        <button
        id="menuBtn"
        class="iconBtn">

            ☰

        </button>

        <div class="brand">

            <img
            src="assets/logo icon.png"
            class="brandLogo"
            alt="Logo">

            <div>

                <div class="brandName">

                    ${title}

                </div>

                <div class="brandTag">

                    Delivering Happiness

                </div>

                <div class="brandLocation">

                    📍 Surankote Bazaar

                </div>

            </div>

        </div>

        <button
        id="cartBtn"
        class="iconBtn"
        onclick="location.href='cart.html'">

            🛒

        </button>

    </header>

    `;

}

function renderBottomNav(current){

    return `

    <nav class="bottomNav">

        <a
        href="index.html"
        class="${current=="home"?"active":""}">

            🏠
            <span>Home</span>

        </a>

        <a
        href="shops.html"
        class="${current=="shops"?"active":""}">

            🛍
            <span>Shops</span>

        </a>

        <a
        href="sellerorders.html"
        class="${current=="orders"?"active":""}">

            📦
            <span>Orders</span>

        </a>

        <a
        href="profile.html"
        class="${current=="profile"?"active":""}">

            👤
            <span>Profile</span>

        </a>

    </nav>

    `;

}
function renderLayout(page){

    document.getElementById(

        "headerContainer"

    ).innerHTML =

    renderHeader();

    document.getElementById(

        "bottomNavContainer"

    ).innerHTML =

    renderBottomNav(page);

}
