/* ==========================================
   HAMARA BAZAAR
   MOBILE-FIRST BUSINESS DASHBOARD
   (Now pulling real data from Supabase)
 
   NOTE: js/shopStatus.js must be included BEFORE this file —
   it provides isShopOpenNow() / shopStatusBadgeHTML().
========================================== */
 
 
const app = document.getElementById("sellerApp");
 
 
/* ==========================================
   INIT
========================================== */
 
async function initDashboard(){
 
    const activeBusinessId = localStorage.getItem("hb_activeBusiness");
 
    if(!activeBusinessId){
 
        app.innerHTML = `
            <div class="businessEmpty">
                <div class="emptyIcon">🏪</div>
                <h2>No Business Selected</h2>
                <p>Select a business from My Business to continue.</p>
                <button onclick="location.href='role.html'">← My Business</button>
            </div>
        `;
        return;
    }
 
    const business = await dbGetBusinessById(activeBusinessId);
 
    if(!business){
 
        app.innerHTML = `
            <div class="businessEmpty">
                <div class="emptyIcon">🏪</div>
                <h2>No Business Selected</h2>
                <p>Select a business from My Business to continue.</p>
                <button onclick="location.href='role.html'">← My Business</button>
            </div>
        `;
        return;
    }
 
    const shop = await dbGetShopByBusinessId(business.id);
 
    await renderDashboard(business, shop);
}
 
 
/* ==========================================
   DASHBOARD
========================================== */
 
async function renderDashboard(business, shop){
 
    if(!shop){
 
        app.innerHTML = `
            <div class="businessEmpty">
                <div class="emptyIcon">🏪</div>
                <h2>Complete Your Business</h2>
                <p>Your business is registered, but your shop setup is not complete.</p>
                <button onclick="location.href='createshop.html'">Complete Setup →</button>
            </div>
        `;
        return;
    }
 
    /* DATA */
 
    let products = [];
    let orders = [];
 
    try {
        products = await dbGetAllProductsByShop(shop.id);
    } catch(err) { console.error(err); }
 
    try {
        orders = await dbGetOrdersByShop(shop.id);
    } catch(err) { console.error(err); }
 
    const pendingOrders = orders.filter(o => o.status == "Pending").length;
 
    const hoursText = (shop.open_time && shop.close_time)
        ? `${formatTime12h(shop.open_time)} — ${formatTime12h(shop.close_time)}`
        : "Hours not set";
 
 
    /* DASHBOARD UI */
 
    app.innerHTML = `
 
    <div class="businessApp">
 
        <div class="businessTopbar">
            <button class="businessBack" onclick="location.href='role.html'">←</button>
            <div>
                <div class="businessTopTitle">My Business</div>
                <div class="businessTopSubtitle">Manage your business</div>
            </div>
        </div>
 
 
        <section class="businessIdentity">
 
            <div class="businessLogo">
                <img src="${shop.logo || 'assets/shop-placeholder.png'}" alt="Business Logo">
            </div>
 
            <div class="businessIdentityInfo">
                <h1>${business.name}</h1>
                <p>${shop.category || "Local Business"}</p>
                <p style="font-size:12px;color:#888;margin-top:2px;">${hoursText}</p>
 
                <div class="businessStatusToggle">
                    ${shopStatusBadgeHTML(shop)}
                    <select id="manualStatusSelect" class="businessStatusSelect">
                        <option value="auto">Auto (follow hours)</option>
                        <option value="open">Force Open</option>
                        <option value="closed">Force Closed</option>
                    </select>
                </div>
 
            </div>
 
            <button class="businessMore" onclick="location.href='createshop.html?edit=true'">⋮</button>
 
        </section>
 
 
        <section class="businessStats">
 
            <div class="businessStat">
                <strong>${products.length}</strong>
                <span>Products</span>
            </div>
 
            <div class="businessStat">
                <strong>${orders.length}</strong>
                <span>Orders</span>
            </div>
 
            <div class="businessStat">
                <strong>${pendingOrders}</strong>
                <span>Pending</span>
            </div>
 
            <div class="businessStat">
                <strong>New</strong>
                <span>Rating</span>
            </div>
 
        </section>
 
 
        <button class="primaryBusinessAction" onclick="location.href='addproduct.html'">
            <span>＋</span>
            Add Product
        </button>
 
 
        <section class="businessActions">
 
            <div class="businessAction" onclick="location.href='myproducts.html'">
                <div class="businessActionIcon">📦</div>
                <div>
                    <strong>My Products</strong>
                    <span>Manage your products</span>
                </div>
                <b>›</b>
            </div>
 
            <div class="businessAction ${pendingOrders > 0 ? 'businessActionAlert' : ''}"
                 onclick="location.href='sellerorders.html'">
                <div class="businessActionIcon">🛒</div>
                <div>
                    <strong>Incoming Orders</strong>
                    <span>${pendingOrders} pending order(s)</span>
                </div>
                <b>›</b>
            </div>
 
            <div class="businessAction" onclick="location.href='createshop.html?edit=true'">
                <div class="businessActionIcon">✏️</div>
                <div>
                    <strong>Edit Business</strong>
                    <span>Update your business</span>
                </div>
                <b>›</b>
            </div>
 
            <div class="businessAction" onclick="location.href='shop.html?id=${shop.id}'">
                <div class="businessActionIcon">👁</div>
                <div>
                    <strong>View My Shop</strong>
                    <span>See your customer view</span>
                </div>
                <b></b>
            </div>
 
        </section>
 
 
        <section class="businessRecent">
 
            <div class="businessSectionHeader">
                <h2>Recent Products</h2>
                <a href="myproducts.html">View All</a>
            </div>
 
            <div id="recentProducts"></div>
 
        </section>
 
    </div>
    `;
 
 
    /* MANUAL OPEN/CLOSED TOGGLE */
 
    const manualStatusSelect = document.getElementById("manualStatusSelect");
    manualStatusSelect.value = shop.manual_status || "auto";
 
    manualStatusSelect.onchange = async function(){
 
        const previousValue = shop.manual_status || "auto";
        const newValue = manualStatusSelect.value;
 
        manualStatusSelect.disabled = true;
 
        try {
            const updatedShop = await dbSetShopManualStatus(shop.id, newValue);
            shop.manual_status = updatedShop.manual_status;
 
            /* re-render just the badge next to the dropdown */
            const badgeContainer = manualStatusSelect.parentElement;
            badgeContainer.querySelector(".shopStatusBadge").outerHTML = shopStatusBadgeHTML(shop);
        }
        catch(err){
            console.error(err);
            alert("Couldn't update your shop status: " + err.message);
            manualStatusSelect.value = previousValue;
        }
        finally{
            manualStatusSelect.disabled = false;
        }
    };
 
 
    /* RECENT PRODUCTS (top 5, newest first) */
 
    const recentContainer = document.getElementById("recentProducts");
    const recent = [...products]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
 
    if(recent.length === 0){
        recentContainer.innerHTML = `<p style="color:#777; padding: 10px 0;">No products yet. Add your first one!</p>`;
    } else {
        recentContainer.innerHTML = recent.map(p => `
            <div class="businessAction">
                <div class="businessActionIcon">${p.emoji || "📦"}</div>
                <div>
                    <strong>${p.name}</strong>
                    <span>₹${p.price}</span>
                </div>
            </div>
        `).join("");
    }
}
 
 
initDashboard();
 


