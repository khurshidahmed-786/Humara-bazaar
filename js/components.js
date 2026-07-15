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
        href="orders.html"
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
if(page=="dashboard" ||

   page=="sellerorders" ||

   page=="createshop"){

    document.getElementById(

        "bottomNavContainer"

    ).innerHTML="";

}else{

    document.getElementById(

        "bottomNavContainer"

    ).innerHTML=

    renderBottomNav(page);

}

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

    <div class="sidebarHeader">

    <h2>

        Hamara Bazaar

    </h2>

    <p>

        Delivering Happiness

    </p>

</div>

<a href="index.html">

🏠 Home

</a>

<a href="orders.html">

📦 My Orders

</a>

<a href="dashboard.html">

🏪 Seller Dashboard

</a>

<a
href="#"
onclick="comingSoon()">

👤 Profile

</a>

<a
href="#"
onclick="comingSoon()">

⚙ Settings

</a>
    </div>

    <div
    id="overlay"
    class="overlay">

    </div>

    `;

}
function closeSidebar(){

    document.getElementById(

        "sidebar"

    ).classList.remove(

        "open"

    );

    document.getElementById(

        "overlay"

    ).classList.remove(

        "show"

    );

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
function comingSoon(){

    alert(

        "Coming Soon 😊"

    );

}
