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

<span id="cartBadge">

0

</span>

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

    renderHeader()

    +

    renderSidebar();

    document.getElementById(

        "bottomNavContainer"

    ).innerHTML =

    renderBottomNav(page);

    bindLayoutEvents();
updateCartBadge();
}
function bindLayoutEvents(){

    const menu =

    document.getElementById(

        "menuBtn"

    );

    const sidebar =

    document.getElementById(

        "sidebar"

    );

    const overlay =

    document.getElementById(

        "overlay"

    );

    menu.onclick=function(){

        sidebar.classList.add(

            "open"

        );

        overlay.classList.add(

            "show"

        );

    };

    overlay.onclick=function(){

        sidebar.classList.remove(

            "open"

        );

        overlay.classList.remove(

            "show"

        );

    };

}
function renderSidebar(){

    return `

    <div
    id="sidebar"
    class="sidebar">

        <h2>

            Hamara Bazaar

        </h2>

        <a href="#">

            👤 My Profile

        </a>

        <a href="#">

            📦 My Orders

        </a>

        <a href="#">

            ❤️ Wishlist

        </a>

        <a href="#">

            🏪 Become Seller

        </a>

        <a href="#">

            ⚙ Settings

        </a>

    </div>

    <div
    id="overlay"
    class="overlay">

    </div>

    `;

}
function updateCartBadge(){

    const badge =

    document.getElementById(

        "cartBadge"

    );

    if(!badge){

        return;

    }

    const cart = getCart();

    let total = 0;

    cart.forEach(item=>{

        total += item.quantity;

    });

    badge.innerText = total;

}
