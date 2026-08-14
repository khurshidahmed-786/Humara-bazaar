/* ==========================================================
   RIDER DASHBOARD — PHASE 3 CORE

   First shippable slice:
   - approved rider availability
   - rider-pull available orders
   - single active delivery trip
   - secure accept RPC
   - secure pickup RPC

   Delivery PIN, completion, multi-order trip expansion and
   financial settlement are deliberately not implemented here.
   ========================================================== */

const riderApp = document.getElementById("riderApp");
const riderUnauthorized = document.getElementById("riderUnauthorized");

let riderProfile = null;

function riderEscape(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
}

async function initRiderDashboardPhase3() {
    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch (err) {
        console.error("Rider auth failed:", err);
    }

    if (!user) {
        window.location.href = "login.html?redirect=riderdashboard.html";
        return;
    }

    try {
        riderProfile = await dbGetMyRiderApplication();
    } catch (err) {
        console.error("Could not load rider profile:", err);
    }

    if (!riderProfile || riderProfile.status !== "approved") {
        riderApp.style.display = "none";
        riderUnauthorized.style.display = "flex";
        return;
    }

    await renderRiderPhase3();
}

async function renderRiderPhase3() {
    riderApp.innerHTML = `
        <div class="riderTopbar">
            <button class="businessBack" onclick="location.href='services.html'">←</button>
            <div>
                <div class="businessTopTitle">Rider Dashboard</div>
                <div class="businessTopSubtitle">${riderEscape(riderProfile.full_name || "")}</div>
            </div>
            <button id="riderRefreshBtn" class="secondaryBusinessAction" type="button">Refresh</button>
        </div>

        <section class="riderAvailabilityCard">
            <div>
                <strong>Ready to Deliver</strong>
                <p>Go online to see delivery opportunities in your tehsil.</p>
            </div>
            <label class="riderSwitch">
                <input type="checkbox" id="riderAvailableToggle"
                    ${(riderProfile.availability === "online" || riderProfile.available) ? "checked" : ""}>
                <span class="riderSlider"></span>
            </label>
        </section>

        <section class="businessStats">
            <div class="businessStat">
                <strong id="availableCount">0</strong>
                <span>Available</span>
            </div>
            <div class="businessStat">
                <strong id="activeCount">0</strong>
                <span>Active</span>
            </div>
            <div class="businessStat">
                <strong id="activeEarning">₹0</strong>
                <span>Trip Earning</span>
            </div>
        </section>

        <section class="riderOrders">
            <div class="businessSectionHeader">
                <h2>Available Deliveries</h2>
            </div>
            <div id="riderAvailableOrders"></div>
        </section>

        <section class="riderOrders" style="margin-top:26px;">
            <div class="businessSectionHeader">
                <h2>Active Trip</h2>
            </div>
            <div id="riderActiveTrip"></div>
        </section>
    `;

    document.getElementById("riderRefreshBtn").onclick = renderRiderPhase3;

    document.getElementById("riderAvailableToggle").onchange = async event => {
        const checked = event.target.checked;
        event.target.disabled = true;

        try {
            await dbRiderSetAvailability(checked);
            riderProfile.availability = checked ? "online" : "offline";
            riderProfile.available = checked;
            await renderRiderPhase3();
        } catch (err) {
            console.error(err);
            alert(err.message || "Could not update availability.");
            event.target.checked = !checked;
            event.target.disabled = false;
        }
    };

    let available = [];
    let activeTrip = { trip_id: null, orders: [] };

    try {
        available = await dbRiderGetAvailableOrders(20);
    } catch (err) {
        console.error("Available orders failed:", err);
        showRiderError("riderAvailableOrders", err);
    }

    try {
        activeTrip = await dbRiderGetActiveTrip();
    } catch (err) {
        console.error("Active trip failed:", err);
        showRiderError("riderActiveTrip", err);
    }

    document.getElementById("availableCount").textContent = available.length;
    const activeOrders = Array.isArray(activeTrip.orders) ? activeTrip.orders : [];
    document.getElementById("activeCount").textContent = activeOrders.length;
    document.getElementById("activeEarning").textContent =
        `₹${activeOrders.reduce((sum, order) => sum + (Number(order.rider_share) || 0), 0)}`;

    await renderAvailableOrders(available);
    await renderActiveTrip(activeTrip);
}

async function resolveShops(orders) {
    const shopIds = [...new Set(
        (orders || []).map(order => order.shop_id).filter(Boolean)
    )];

    if (!shopIds.length) return {};

    try {
        const shops = await dbGetShopsByIds(shopIds);
        return Object.fromEntries(shops.map(shop => [shop.id, shop]));
    } catch (err) {
        console.error("Could not load shops:", err);
        return {};
    }
}

async function renderAvailableOrders(orders) {
    const container = document.getElementById("riderAvailableOrders");

    if (!orders.length) {
        container.innerHTML = `
            <div class="adminEmpty">
                ${riderProfile.availability === "online"
                    ? "No delivery is available right now."
                    : "Turn on Ready to Deliver to see available orders."}
            </div>`;
        return;
    }

    const shopsById = await resolveShops(orders);
    container.innerHTML = "";

    orders.forEach(order => {
        const shop = shopsById[order.shop_id];
        const card = document.createElement("div");
        card.className = "riderOrderCard";

        const pricing = Number.isFinite(Number(order.rider_payout))
            ? `₹${Number(order.rider_payout)}`
            : "Pricing pending";

        card.innerHTML = `
            <div class="riderOrderTop">
                <strong>Order #${riderEscape(order.id)}</strong>
                <span class="shopStatusBadge shopStatusOpen">Available</span>
            </div>

            <div class="riderRoute">
                <div class="riderRouteRow">
                    <span class="riderRouteDot riderRouteFrom"></span>
                    <div>
                        <div class="riderRouteLabel">Pickup</div>
                        <div class="riderRouteValue">${riderEscape(shop?.name || "Shop")}</div>
                    </div>
                </div>

                <div class="riderRouteLine"></div>

                <div class="riderRouteRow">
                    <span class="riderRouteDot riderRouteTo"></span>
                    <div>
                        <div class="riderRouteLabel">Customer</div>
                        <div class="riderRouteValue">
                            ${riderEscape(order.customer_address || "Delivery address available")}
                        </div>
                    </div>
                </div>
            </div>

            <div class="riderPayoutRow">
                <span>Your current delivery payout</span>
                <strong>${pricing}</strong>
            </div>

            <div class="riderOrderMeta">
                <span>🧾 Order total: ₹${riderEscape(order.total)}</span>
                <span>💳 ${riderEscape(order.payment_status || "Payment pending")}</span>
                ${order.customer_phone
                    ? `<a href="tel:${encodeURIComponent(order.customer_phone)}">📞 Call customer</a>`
                    : ""}
            </div>

            <div class="riderOrderActions">
                <button class="primaryBusinessAction" type="button" data-accept>
                    Accept Delivery
                </button>
            </div>
        `;

        card.querySelector("[data-accept]").onclick = async event => {
            const button = event.currentTarget;
            button.disabled = true;
            button.textContent = "Accepting...";

            try {
                await dbRiderAcceptOrder(order.id);
                await renderRiderPhase3();
            } catch (err) {
                console.error(err);
                alert(err.message || "This delivery is no longer available.");
                button.disabled = false;
                button.textContent = "Accept Delivery";
            }
        };

        container.appendChild(card);
    });
}

async function renderActiveTrip(trip) {
    const container = document.getElementById("riderActiveTrip");
    const orders = Array.isArray(trip?.orders) ? trip.orders : [];

    if (!trip?.trip_id || !orders.length) {
        container.innerHTML = `
            <div class="adminEmpty">
                No active delivery. Accept an available order to start your trip.
            </div>`;
        return;
    }

    const shopsById = await resolveShops(orders);

    container.innerHTML = `
        <div class="riderOrderCard">
            <div class="riderOrderTop">
                <strong>Trip #${riderEscape(trip.trip_id)}</strong>
                <span class="shopStatusBadge shopStatusOpen">Active</span>
            </div>
            ${orders.map(order => {
                const shop = shopsById[order.shop_id];
                const picked = order.pickup_status === "picked_up";
                return `
                    <div style="padding:14px 0; border-bottom:1px solid #eee;">
                        <div class="riderOrderTop">
                            <strong>Order #${riderEscape(order.order_id)}</strong>
                            <span>${picked ? "Picked up" : "Waiting for pickup"}</span>
                        </div>

                        <div class="riderRoute">
                            <div class="riderRouteRow">
                                <span class="riderRouteDot riderRouteFrom"></span>
                                <div>
                                    <div class="riderRouteLabel">Shop</div>
                                    <div class="riderRouteValue">${riderEscape(shop?.name || "Shop")}</div>
                                </div>
                            </div>

                            <div class="riderRouteLine"></div>

                            <div class="riderRouteRow">
                                <span class="riderRouteDot riderRouteTo"></span>
                                <div>
                                    <div class="riderRouteLabel">${riderEscape(order.customer_name || "Customer")}</div>
                                    <div class="riderRouteValue">${riderEscape(order.customer_address || "—")}</div>
                                </div>
                            </div>
                        </div>

                        <div class="riderPayoutRow">
                            <span>Your earning</span>
                            <strong>₹${riderEscape(order.rider_share || 0)}</strong>
                        </div>

                        <div class="riderOrderMeta">
                            ${order.customer_phone
                                ? `<a href="tel:${encodeURIComponent(order.customer_phone)}">📞 Call customer</a>`
                                : ""}
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customer_address || "")}"
                               target="_blank" rel="noopener">🧭 Navigate</a>
                        </div>

                        <div class="riderOrderActions">
                            ${!picked
                                ? `<button class="primaryBusinessAction" type="button" data-pickup="${order.order_id}">
                                       📦 Mark Picked Up
                                   </button>`
                                : `<span class="shopStatusBadge shopStatusOpen">Picked Up</span>`}
                            <span style="display:block;margin-top:8px;color:#777;font-size:13px;">
                                Delivery completion with PIN will be added in the next phase.
                            </span>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;

    container.querySelectorAll("[data-pickup]").forEach(button => {
        button.onclick = async event => {
            const btn = event.currentTarget;
            btn.disabled = true;
            btn.textContent = "Updating...";

            try {
                await dbRiderMarkPickedUp(btn.dataset.pickup);
                await renderRiderPhase3();
            } catch (err) {
                console.error(err);
                alert(err.message || "Could not mark the order picked up.");
                btn.disabled = false;
                btn.textContent = "📦 Mark Picked Up";
            }
        };
    });
}

function showRiderError(containerId, err) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="adminEmpty">
            Could not load this section. ${riderEscape(err?.message || "Please refresh.")}
        </div>`;
}

document.addEventListener("DOMContentLoaded", initRiderDashboardPhase3);
