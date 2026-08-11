/* ==========================================================
   RIDER DASHBOARD
   Lives at riderdashboard.html, reached from Services -> Riders
   once a rider's application is approved.
   ========================================================== */

const riderApp = document.getElementById("riderApp");
const riderUnauthorized = document.getElementById("riderUnauthorized");

let myRiderProfile = null;


async function initRiderDashboard(){

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=riderdashboard.html";
        return;
    }

    let application = null;

    try {
        application = await dbGetMyRiderApplication();
    } catch(err) {
        console.error(err);
    }

    if(!application || application.status !== "approved"){
        riderApp.style.display = "none";
        riderUnauthorized.style.display = "flex";
        return;
    }

    myRiderProfile = application;

    await renderRiderDashboard();
}


async function renderRiderDashboard(){

    let orders = [];

    try {
        orders = await dbGetOrdersAssignedToRider(myRiderProfile.id);
    } catch(err) {
        console.error(err);
    }

    const activeOrders = orders.filter(o => o.delivery_status !== "delivered");
    const completedOrders = orders.filter(o => o.delivery_status === "delivered");

    const readyCount = orders.filter(o => o.status === "Ready" && o.delivery_status === "assigned").length;
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (Number(o.rider_payout) || 0), 0);

    riderApp.innerHTML = `

        <div class="riderTopbar">
            <button class="businessBack" onclick="location.href='services.html'">←</button>
            <div>
                <div class="businessTopTitle">Rider Dashboard</div>
                <div class="businessTopSubtitle">${myRiderProfile.full_name || ""}</div>
            </div>
        </div>

        <section class="riderAvailabilityCard">
            <div>
                <strong>Ready to Deliver</strong>
                <p>Toggle on so the Tehsil Admin can assign you new orders.</p>
            </div>
            <label class="riderSwitch">
                <input type="checkbox" id="riderAvailableToggle" ${myRiderProfile.available ? "checked" : ""}>
                <span class="riderSlider"></span>
            </label>
        </section>

        <section class="businessStats">
            <div class="businessStat">
                <strong>${activeOrders.length}</strong>
                <span>Active</span>
            </div>
            <div class="businessStat">
                <strong>${readyCount}</strong>
                <span>Ready Now</span>
            </div>
            <div class="businessStat">
                <strong>₹${totalEarnings}</strong>
                <span>Earnings</span>
            </div>
        </section>

        <section class="riderOrders">
            <div class="businessSectionHeader">
                <h2>Your Deliveries</h2>
            </div>
            <div id="riderActiveOrders"></div>
        </section>

        <section class="riderOrders" style="margin-top:26px;">
            <div class="businessSectionHeader">
                <h2>Completed</h2>
            </div>
            <div id="riderCompletedOrders"></div>
        </section>
    `;

    document.getElementById("riderAvailableToggle").onchange = async function(event){

        const checked = event.target.checked;

        try {
            await dbSetRiderAvailability(myRiderProfile.id, checked);
            myRiderProfile.available = checked;
        } catch(err) {
            console.error(err);
            alert(err.message || "Could not update your availability.");
            event.target.checked = !checked;
        }
    };

    renderOrderCards("riderActiveOrders", activeOrders, "No deliveries assigned to you right now. Turn on \"Ready to Deliver\" so the Tehsil Admin can send you orders.");
    renderOrderCards("riderCompletedOrders", completedOrders, "No completed deliveries yet.");
}


function renderOrderCards(containerId, orders, emptyText){

    const container = document.getElementById(containerId);

    if(!orders || orders.length === 0){
        container.innerHTML = `<div class="adminEmpty">${emptyText}</div>`;
        return;
    }

    container.innerHTML = "";

    orders.forEach(order => {

        const shop = order.shop;
        const fromText = shop ? (shop.location || shop.address || shop.name) : "Pickup location";
        const itemCount = Array.isArray(order.items) ? order.items.length : 0;

        const readyBadge = order.status === "Ready"
            ? `<span class="shopStatusBadge shopStatusOpen">✅ Ready for pickup</span>`
            : `<span class="shopStatusBadge">${order.status}</span>`;

        let actionHTML = "";

        if(order.delivery_status === "assigned"){
            actionHTML = `<button class="primaryBusinessAction" data-action="pickup">📦 Mark Picked Up</button>`;
        }
        else if(order.delivery_status === "picked_up"){
            actionHTML = `<button class="primaryBusinessAction" data-action="deliver">✅ Mark Delivered</button>`;
        }
        else if(order.delivery_status === "delivered"){
            actionHTML = `<span class="shopStatusBadge shopStatusOpen">Delivered</span>`;
        }

        const hasPricing = order.rider_payout !== null && order.rider_payout !== undefined;

        const breakdownChips = hasPricing
            ? [
                `Base ₹${order.delivery_base_fee ?? DELIVERY_BASE_FEE}`,
                order.distance_km ? `Distance (${order.distance_km}km) ₹${order.delivery_distance_fee ?? 0}` : null,
                order.is_off_hour ? `🌙 Off-hour +₹${order.delivery_off_hour_fee ?? 0}` : null,
                order.is_rainy ? `🌧 Rain +₹${order.delivery_rain_fee ?? 0}` : null
              ].filter(Boolean).map(r => `<span class="feeChip">${r}</span>`).join("")
            : `<span class="feeChip">Pricing pending</span>`;

        const card = document.createElement("div");
        card.className = "riderOrderCard";

        card.innerHTML = `
            <div class="riderOrderTop">
                <strong>Order #${order.id}</strong>
                ${readyBadge}
            </div>

            <div class="riderRoute">
                <div class="riderRouteRow">
                    <span class="riderRouteDot riderRouteFrom"></span>
                    <div>
                        <div class="riderRouteLabel">From — ${shop ? shop.name : "Shop"}</div>
                        <div class="riderRouteValue">${fromText}</div>
                    </div>
                </div>
                <div class="riderRouteLine"></div>
                <div class="riderRouteRow">
                    <span class="riderRouteDot riderRouteTo"></span>
                    <div>
                        <div class="riderRouteLabel">To — ${order.customer_name || "Customer"}</div>
                        <div class="riderRouteValue">${order.customer_address || "—"}</div>
                    </div>
                </div>
            </div>

            <div class="riderPayoutRow">
                <span>Your payout</span>
                <strong>₹${hasPricing ? order.rider_payout : "—"}</strong>
            </div>

            <div class="riderOrderMeta">
                ${breakdownChips}
            </div>

            <div class="riderOrderMeta">
                <span>🛍 ${itemCount} item${itemCount === 1 ? "" : "s"}</span>
                <span>🧾 Order total: ₹${order.total}</span>
                ${order.customer_phone ? `<a href="tel:${order.customer_phone}">📞 ${order.customer_phone}</a>` : ""}
            </div>

            <div class="riderOrderActions">
                ${actionHTML}
            </div>
        `;

        const pickupBtn = card.querySelector('[data-action="pickup"]');
        if(pickupBtn){
            pickupBtn.onclick = async function(){
                pickupBtn.disabled = true;
                pickupBtn.innerText = "Updating...";
                try {
                    await dbSetOrderDeliveryStatus(order.id, "picked_up");
                    await renderRiderDashboard();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not update this order.");
                    pickupBtn.disabled = false;
                    pickupBtn.innerText = "📦 Mark Picked Up";
                }
            };
        }

        const deliverBtn = card.querySelector('[data-action="deliver"]');
        if(deliverBtn){
            deliverBtn.onclick = async function(){
                deliverBtn.disabled = true;
                deliverBtn.innerText = "Updating...";
                try {
                    await dbSetOrderDeliveryStatus(order.id, "delivered");
                    await dbUpdateOrderStatus(order.id, "Delivered");
                    await renderRiderDashboard();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not update this order.");
                    deliverBtn.disabled = false;
                    deliverBtn.innerText = "✅ Mark Delivered";
                }
            };
        }

        container.appendChild(card);
    });
}


document.addEventListener("DOMContentLoaded", initRiderDashboard);
