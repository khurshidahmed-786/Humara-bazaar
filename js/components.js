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

            <div class="brandText">

                <div class="brandName">

                    ${title}

                </div>

                <div class="brandTag">

                    Delivering Happiness

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

    <div class="marketBar">

        📍 <span id="marketName">

        Surankote Bazaar

        </span>

    </div>

    `;

}

function renderBottomNav(current){

    return `

    <nav class="bottomNav">

        <a
        href="home.html"
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
        href="services.html"
        class="${current=="services"?"active":""}">

            🧰
            <span>Services</span>

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
async function renderLayout(page){

    let currentUser = null;

    if(typeof authGetCurrentUser === "function"){

        try {
            currentUser = await authGetCurrentUser();
        } catch(err) {
            console.error(err);
            currentUser = null;
        }

    }

    let currentRole = null;

    if(currentUser && typeof dbGetMyRole === "function"){

        try {
            currentRole = await dbGetMyRole();
        } catch(err) {
            console.error(err);
            currentRole = null;
        }

    }

    document.getElementById(

        "headerContainer"

    ).innerHTML =

    renderHeader()

    +

    renderSidebar(currentUser, currentRole);
const pagesWithoutBottomNav = [

    "dashboard",

    "sellerorders",

    "createshop",

    "product",

    "superadmin",

    "tehsil-admin"

];

if(

    pagesWithoutBottomNav.includes(page)

){

    document.getElementById(

        "bottomNavContainer"

    ).innerHTML = "";

}else{

    document.getElementById(

        "bottomNavContainer"

    ).innerHTML =

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
function renderSidebar(user, role){

    const accountSection = user ? `

        <div class="sidebarAccount">

            👋 Hi, ${user.name || "there"}

        </div>


    
    ` : `

        <a
        href="login.html"
        class="sidebarLogout">

            🔑 Login

        </a>

    `;

    let adminLink = "";

    if(role && role.role === "super_admin"){

        adminLink = `
        <a href="superadmin.html">

            🛡️ Super Admin

        </a>
        `;

    }else if(role && role.role === "tehsil_admin"){

        adminLink = `
        <a href="tehsil-admin.html">

            🛡️ Tehsil Admin

        </a>
        `;

    }else if(user){

        adminLink = `
        <a href="admin-apply.html">

            🛡️ Become a Tehsil Admin

        </a>
        `;

    }

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

        ${accountSection}

        <a href="home.html">

            🏠 Home

        </a>


        <a href="orders.html">

            📦 My Orders

        </a>


        <a href="role.html">

            🏪 My Business

        </a>

        ${adminLink}

            <a href="settings.html">

            ⚙ Settings

        </a>


    </div>


    <div
    id="overlay"
    class="overlay">

    </div>

    `;

}


async function handleLogout(){

    if(typeof authSignOut !== "function"){
        return;
    }

    try {
        await authSignOut();
    } catch(err) {
        console.error(err);
    }

    location.href = "home.html";

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
