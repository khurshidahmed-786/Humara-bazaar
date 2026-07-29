/* ==========================================================
   SETTINGS PAGE
   Role-adaptive: customer vs seller. Admin controls live only
   in superadmin.html / tehsil-admin.html, never here.
   ========================================================== */

const NOTIFICATION_PREFS_KEY = "hb_notification_prefs";

function row(icon, label, href, extraRight){
    return `
        <a class="settingsRow" href="${href}">
            <span class="left">${icon} ${label}</span>
            <span class="right chevron">${extraRight || "›"}</span>
        </a>
    `;
}

function soonRow(icon, label){
    return `
        <div class="settingsRow soon">
            <span class="left">${icon} ${label}</span>
            <span class="soonTag">Coming Soon</span>
        </div>
    `;
}

async function initSettingsPage(){

    const app = document.getElementById("settingsApp");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=settings.html";
        return;
    }

    let businesses = [];

    try {
        businesses = await dbGetBusinessesByOwner(user.id);
    } catch(err) {
        console.error(err);
    }

    const isSeller = businesses && businesses.length > 0;

    app.innerHTML = `

        <div class="settingsCard">
            <div class="profileSummary">
                <div class="avatar">👤</div>
                <div>
                    <div class="name">${user.name || "Hamara Bazaar User"}</div>
                    <div class="meta">${user.phone || user.email || ""}</div>
                    <div class="roleBadge">${isSeller ? "Seller" : "Customer"}</div>
                </div>
            </div>
        </div>

        <div class="settingsSection">Account</div>
        <div class="settingsCard">
            ${row("👤", "Profile", "profile.html")}
            <button class="settingsRow" id="changePasswordBtn" style="border:none; background:none; text-align:left;">
                <span class="left">🔒 Change Password</span>
                <span class="right chevron">›</span>
            </button>
        </div>

        <div class="settingsSection">Shopping & Orders</div>
        <div class="settingsCard">
            ${row("📦", "My Orders", "orders.html")}
            ${soonRow("🏠", "Saved Addresses")}
        </div>

        <div class="settingsSection">Notifications</div>
        <div class="settingsCard" id="notificationsCard"></div>

        ${isSeller ? `
        <div class="settingsSection">Seller Settings</div>
        <div class="settingsCard">
            ${row("🏪", "My Shop", "role.html")}
            ${row("🧾", "Manage Products", "myproducts.html")}
            ${row("📋", "Shop Orders", "sellerorders.html")}
            ${row("📊", "Seller Dashboard", "dashboard.html")}
            ${soonRow("🔛", "Shop Visibility")}
        </div>
        ` : `
        <div class="settingsSection">Seller Settings</div>
        <div class="settingsCard">
            ${row("🏪", "Create Your Shop", "createshop.html")}
        </div>
        `}

        <div class="settingsSection">Help & Information</div>
        <div class="settingsCard">
            ${soonRow("💬", "Help & Support")}
            ${soonRow("ℹ️", "About Hamara Bazaar")}
            ${soonRow("📄", "Terms & Conditions")}
            ${soonRow("🔐", "Privacy Policy")}
            ${soonRow("↩️", "Refund Policy")}
        </div>

        <button class="logoutBtn" id="settingsLogoutBtn">🚪 Log Out</button>
    `;

    renderNotificationToggles();
    wireChangePassword();
    wireLogout();
}

function getNotificationPrefs(){
    try {
        const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
        if(!raw) return { orderUpdates: true, deliveryUpdates: true, promotional: false };
        return JSON.parse(raw);
    } catch(err) {
        return { orderUpdates: true, deliveryUpdates: true, promotional: false };
    }
}

function saveNotificationPrefs(prefs){
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

function renderNotificationToggles(){

    const card = document.getElementById("notificationsCard");
    const prefs = getNotificationPrefs();

    card.innerHTML = `
        <div class="toggleRow">
            <span>Order Updates</span>
            <label class="switch">
                <input type="checkbox" id="toggleOrder" ${prefs.orderUpdates ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        </div>
        <div class="toggleRow">
            <span>Delivery Updates</span>
            <label class="switch">
                <input type="checkbox" id="toggleDelivery" ${prefs.deliveryUpdates ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        </div>
        <div class="toggleRow">
            <span>Promotional Offers</span>
            <label class="switch">
                <input type="checkbox" id="togglePromo" ${prefs.promotional ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        </div>
    `;

    document.getElementById("toggleOrder").onchange = function(e){
        const p = getNotificationPrefs();
        p.orderUpdates = e.target.checked;
        saveNotificationPrefs(p);
    };

    document.getElementById("toggleDelivery").onchange = function(e){
        const p = getNotificationPrefs();
        p.deliveryUpdates = e.target.checked;
        saveNotificationPrefs(p);
    };

    document.getElementById("togglePromo").onchange = function(e){
        const p = getNotificationPrefs();
        p.promotional = e.target.checked;
        saveNotificationPrefs(p);
    };
}

function wireChangePassword(){

    const overlay = document.getElementById("passwordModalOverlay");
    const input = document.getElementById("newPasswordInput");
    const error = document.getElementById("passwordError");

    document.getElementById("changePasswordBtn").onclick = function(){
        input.value = "";
        error.style.display = "none";
        overlay.classList.add("show");
    };

    document.getElementById("passwordCancelBtn").onclick = function(){
        overlay.classList.remove("show");
    };

    document.getElementById("passwordSaveBtn").onclick = async function(){

        const newPassword = input.value;

        if(!newPassword || newPassword.length < 6){
            error.innerText = "Password must be at least 6 characters.";
            error.style.display = "block";
            return;
        }

        const btn = document.getElementById("passwordSaveBtn");
        btn.disabled = true;
        btn.innerText = "Saving...";

        try {
            await authUpdatePassword(newPassword);
            overlay.classList.remove("show");
            alert("Password updated successfully.");
        } catch(err) {
            console.error(err);
            error.innerText = err.message || "Could not update password.";
            error.style.display = "block";
        }

        btn.disabled = false;
        btn.innerText = "Save";
    };
}

function wireLogout(){

    const overlay = document.getElementById("logoutModalOverlay");

    document.getElementById("settingsLogoutBtn").onclick = function(){
        overlay.classList.add("show");
    };

    document.getElementById("logoutCancelBtn").onclick = function(){
        overlay.classList.remove("show");
    };

    document.getElementById("logoutConfirmBtn").onclick = async function(){
        if(typeof handleLogout === "function"){
            await handleLogout();
        }
    };
}

document.addEventListener("DOMContentLoaded", initSettingsPage);
