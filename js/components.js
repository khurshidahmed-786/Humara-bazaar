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

        <div style="position:relative;">

        <button
        id="notifBtn"
        class="iconBtn"
        onclick="toggleNotificationPanel(); return false;">

            🔔

            <span id="notifBadge" class="iconBadge" style="display:none;">

                0

            </span>

        </button>

       <div id="notifPanel" class="notifPanel">

            <div class="notifPanelHeader">

                <span>Notifications</span>

            </div>

            <div id="notifList" class="notifList">

                <div class="notifEmpty">Loading...</div>

            </div>

        </div>

        </div>

        <button
        id="cartBtn"
        class="iconBtn"
        onclick="location.href='cart.html'">

            🛒

            <span id="cartBadge" class="iconBadge">

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

        
      <a  href="home.html"
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
        
      <a  href="services.html"
        class="${current=="services"?"active":""}">

            🧰
            <span>Services</span>

        </a>
        
      <a  href="orders.html"
        class="${current=="orders"?"active":""}">

            📦
            <span>Orders</span>

        </a>

        
        <a href="profile.html"
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

    if(currentUser){
        refreshNotifBadge();
    }

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


      <a  
        href="#"
        onclick="handleLogout(); return false;"
        class="sidebarLogout">

            🚪 Logout

        </a>

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


/* ==========================================
   NOTIFICATION BELL + PANEL
   ========================================== */

function timeAgo(dateString){

    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

    if(seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if(minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if(hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

async function refreshNotifBadge(){

    const badge = document.getElementById("notifBadge");
    if(!badge || typeof dbGetUnreadNotificationCount !== "function") return;

    let count = 0;

    try {
        count = await dbGetUnreadNotificationCount();
    } catch(err) {
        console.error(err);
        return;
    }

    if(count > 0){
        badge.innerText = count > 99 ? "99+" : count;
        badge.style.display = "flex";
    }else{
        badge.style.display = "none";
    }
}

function toggleNotificationPanel(){

    const panel = document.getElementById("notifPanel");
    if(!panel) return;

    const isOpening = !panel.classList.contains("show");

    panel.classList.toggle("show");

    if(isOpening){
        loadNotificationPanel();
    }
}

async function loadNotificationPanel(){

    const list = document.getElementById("notifList");
    if(!list) return;

    let notifications = [];

    try {
        notifications = await dbGetMyNotifications(20);
    } catch(err) {
        console.error(err);
        list.innerHTML = `<div class="notifEmpty">Couldn't load notifications.</div>`;
        return;
    }

    if(!notifications || notifications.length === 0){
        list.innerHTML = `<div class="notifEmpty">🔔<br>No notifications yet.</div>`;
        return;
    }

    list.innerHTML = "";

    notifications.forEach(n => {

        const item = document.createElement("button");
        item.className = "notifItem" + (n.is_read ? "" : " unread");

        item.innerHTML = `
            <div class="notifTitle">${n.title}</div>
            <div class="notifMessage">${n.message}</div>
            <div class="notifTime">${timeAgo(n.created_at)}</div>
        `;

        item.onclick = function(){

            if(n.action_url){
                window.location.href = n.action_url;
            }else{
                document.getElementById("notifPanel").classList.remove("show");
            }
        };

        list.appendChild(item);
    });

    // Opening the panel is the "read" action — no separate button needed.
    const hadUnread = notifications.some(n => !n.is_read);

    if(hadUnread){
        try {
            await dbMarkAllNotificationsRead();
            refreshNotifBadge();
        } catch(err) {
            console.error(err);
        }
    }
}// Close the panel when clicking anywhere outside it
document.addEventListener("click", function(event){

    const panel = document.getElementById("notifPanel");
    const btn = document.getElementById("notifBtn");
    if(!panel || !panel.classList.contains("show")) return;

    if(!panel.contains(event.target) && event.target !== btn){
        panel.classList.remove("show");
    }
});

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
