/* ==========================================================
   TEHSIL ADMIN DASHBOARD
   ========================================================== */

let myTehsilId = null;

async function initTehsilAdmin(){

    const app = document.getElementById("tehsilAdminApp");
    const unauthorized = document.getElementById("unauthorized");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=tehsil-admin.html";
        return;
    }

    let role = null;

    try {
        role = await dbGetMyRole();
    } catch(err) {
        console.error(err);
    }

    if(!role || role.role !== "tehsil_admin"){
        app.style.display = "none";
        unauthorized.style.display = "block";
        return;
    }

    myTehsilId = role.tehsil_id;

    await renderTehsilAdminApp();
}

async function renderTehsilAdminApp(){

    const app = document.getElementById("tehsilAdminApp");
    app.innerHTML = `<div class="adminEmpty">Loading dashboard...</div>`;

    let tehsil, readiness, pendingShops, activeShops, pendingRiders, approvedRiders, unassignedOrders, allOrders, auditLogs, categorySuggestions;

    try {
        tehsil = await dbGetTehsilById(myTehsilId);
        readiness = await dbGetTehsilReadiness(myTehsilId);
        pendingShops = await dbGetShopsByTehsil(myTehsilId, "pending");
        activeShops = await dbGetShopsByTehsil(myTehsilId, "approved");
        pendingRiders = await dbGetRidersByTehsil(myTehsilId, "pending");
        approvedRiders = await dbGetRidersByTehsil(myTehsilId, "approved");
        unassignedOrders = await dbGetUnassignedOrdersByTehsil(myTehsilId);
        allOrders = await dbGetOrdersByTehsil(myTehsilId);
        auditLogs = await dbGetAuditLogs(myTehsilId, 15);
        categorySuggestions = await dbGetPendingCategorySuggestions();
    } catch(err) {
        console.error(err);
        app.innerHTML = `<div class="adminEmpty">Could not load your tehsil data. Please refresh.</div>`;
        return;
    }

    app.innerHTML = `

        <h2 class="adminHeading">${tehsil.name}</h2>
        <span class="adminBadge ${tehsil.status}">${tehsil.status.replace(/_/g, " ")}</span>

        <h2 class="adminHeading" style="margin-top:24px;">Launch Readiness</h2>
        <div class="adminCard" id="readinessCard"></div>

        <h2 class="adminHeading">Category Suggestions</h2>
        <p class="adminSub">New categories sellers have asked for. Approving adds them everywhere immediately.</p>
        <div id="categorySuggestionsList"></div>

        <h2 class="adminHeading">Pending Shops</h2>
        <div id="pendingShopsList"></div>

        <h2 class="adminHeading">Active Shops</h2>
        <div id="activeShopsList"></div>

        <h2 class="adminHeading">Pending Riders</h2>
        <div id="pendingRidersList"></div>

        <h2 class="adminHeading">Approved Riders</h2>
        <div id="approvedRidersList"></div>

        <h2 class="adminHeading">Unassigned Orders</h2>
        <div id="unassignedOrdersList"></div>

        <h2 class="adminHeading">All Orders</h2>
        <p class="adminSub">Every order in your tehsil and where it currently stands.</p>
        <div id="allOrdersList"></div>

        <h2 class="adminHeading">Recent Activity</h2>
        <div id="tehsilAuditList"></div>
    `;

    renderReadiness(tehsil, readiness);
    renderCategorySuggestions(categorySuggestions);
    renderShopsList("pendingShopsList", pendingShops, true);
    renderShopsList("activeShopsList", activeShops, false);
    renderRidersList("pendingRidersList", pendingRiders, true);
    renderApprovedRiders(approvedRiders);
    renderUnassignedOrders(unassignedOrders, approvedRiders);
    await renderAllOrders(allOrders);
    renderTehsilAudit(auditLogs);
}


/* ==========================================================
   ALL ORDERS (with status + delivery status)
   ========================================================== */

const ORDER_STATUS_BADGE_CLASS = {
    Pending: "pending",
    Accepted: "approved",
    Preparing: "pending",
    Ready: "approved",
    Delivered: "approved",
    Cancelled: "rejected"
};

const DELIVERY_STATUS_LABEL = {
    unassigned: "Unassigned",
    assigned: "Rider Assigned",
    picked_up: "Picked Up",
    delivered: "Delivered"
};

async function renderAllOrders(orders){

    const container = document.getElementById("allOrdersList");

    if(!orders || orders.length === 0){
        container.innerHTML = `<div class="adminEmpty">No orders placed in your tehsil yet.</div>`;
        return;
    }

    /* Batch-resolve shop names so we're not doing one query per card */

    const shopIds = [...new Set(orders.map(o => o.shop_id))];
    let shopsById = {};

    try {
        const shops = await dbGetShopsByIds(shopIds);
        shops.forEach(s => { shopsById[s.id] = s; });
    } catch(err) {
        console.error("Could not load shop names for order list:", err);
    }

    container.innerHTML = "";

    orders.forEach(order => {

        const shop = shopsById[order.shop_id];
        const statusClass = ORDER_STATUS_BADGE_CLASS[order.status] || "pending";
        const deliveryLabel = DELIVERY_STATUS_LABEL[order.delivery_status] || order.delivery_status || "Unassigned";

        const card = document.createElement("div");
        card.className = "adminCard";

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>Order #${order.id}</strong> — ${shop ? shop.name : "Unknown shop"} · ₹${order.total}
                    <div style="color:#777; font-size:13px; margin-top:4px;">
                        ${order.customer_name || ""} · ${order.customer_address || ""}
                    </div>
                    <div style="color:#999; font-size:12px; margin-top:4px;">
                        ${new Date(order.created_at).toLocaleString()}
                    </div>
                </div>
                <div class="adminActions" style="flex-direction:column; align-items:flex-end; gap:6px;">
                    <span class="adminBadge ${statusClass}">${order.status}</span>
                    <span class="adminBadge ${order.delivery_status === "delivered" ? "approved" : "setup"}">${deliveryLabel}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function renderReadiness(tehsil, readiness){

    const card = document.getElementById("readinessCard");

    const categoryRows = TEHSIL_REQUIRED_CATEGORIES.map(cat => {
        const count = readiness.categoryCounts[cat] || 0;
        const ok = count >= 1;
        return `
            <div class="checklistItem">
                <span>${ok ? "✅" : "⬜"} ${cat} (recommended target: ${TEHSIL_RECOMMENDED_SHOPS_PER_CATEGORY})</span>
                <span>${count} approved</span>
            </div>
        `;
    }).join("");

    const riderRow = `
        <div class="checklistItem">
            <span>${readiness.ridersOk ? "✅" : "⬜"} Approved active riders (need ${TEHSIL_REQUIRED_RIDERS})</span>
            <span>${readiness.riderCount} approved</span>
        </div>
    `;

    const canMarkReady = readiness.ready && tehsil.status === "setup";

    card.innerHTML = `
        ${categoryRows}
        ${riderRow}
        <div style="margin-top:14px;">
            ${
                tehsil.status === "setup"
                ? `<button class="adminBtn approve" id="readyBtn" ${canMarkReady ? "" : "disabled"}>Mark Ready for Review</button>`
                : tehsil.status === "ready_for_review"
                ? `<div class="adminEmpty">Waiting for Super Admin approval to go live.</div>`
                : ""
            }
        </div>
    `;

    const readyBtn = document.getElementById("readyBtn");
    if(readyBtn){
        readyBtn.onclick = async function(){
            if(!confirm("Mark this tehsil ready for review? The Super Admin will do the final check before it goes live.")) return;
            try {
                await dbMarkTehsilReadyForReview(myTehsilId);
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not update readiness.");
            }
        };
    }
}

function renderCategorySuggestions(suggestions){

    const container = document.getElementById("categorySuggestionsList");

    if(!suggestions || suggestions.length === 0){
        container.innerHTML = `<div class="adminEmpty">No new category suggestions.</div>`;
        return;
    }

    container.innerHTML = "";

    suggestions.forEach(suggestion => {

        const card = document.createElement("div");
        card.className = "adminCard";

        card.innerHTML = `
            <div class="adminRow">
                <div><strong>${suggestion.name}</strong></div>
                <div class="adminActions">
                    <button class="adminBtn approve" data-action="approve">Approve</button>
                    <button class="adminBtn reject" data-action="reject">Reject</button>
                </div>
            </div>
        `;

        card.querySelector('[data-action="approve"]').onclick = async function(){
            if(!confirm(`Add "${suggestion.name}" as a category?`)) return;
            try {
                await dbReviewCategorySuggestion(suggestion.id, "approved");
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not approve this category.");
            }
        };

        card.querySelector('[data-action="reject"]').onclick = async function(){
            if(!confirm(`Reject "${suggestion.name}"?`)) return;
            try {
                await dbReviewCategorySuggestion(suggestion.id, "rejected");
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not reject this category.");
            }
        };

        container.appendChild(card);
    });
}

function renderShopsList(containerId, shops, isPending){

    const container = document.getElementById(containerId);

    if(!shops || shops.length === 0){
        container.innerHTML = `<div class="adminEmpty">${isPending ? "No shops waiting for review." : "No active shops yet."}</div>`;
        return;
    }

    container.innerHTML = "";

    shops.forEach(shop => {

        const card = document.createElement("div");
        card.className = "adminCard";

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>${shop.name}</strong> — ${shop.category || "—"}
                </div>
                <div class="adminActions">
                    ${
                        isPending
                        ? `<button class="adminBtn approve" data-action="approve">Approve</button>
                           <button class="adminBtn reject" data-action="reject">Reject</button>`
                        : `<a class="adminBtn neutral" style="text-decoration:none;" href="shop.html?id=${shop.id}">View</a>
                           <button class="adminBtn reject" data-action="suspend">Suspend</button>`
                    }
                </div>
            </div>
        `;

        const approveBtn = card.querySelector('[data-action="approve"]');
        if(approveBtn){
            approveBtn.onclick = async function(){
                if(!confirm(`Approve shop "${shop.name}"?`)) return;
                try {
                    await dbSetShopApprovalStatus(shop.id, "approved", myTehsilId);
                    await renderTehsilAdminApp();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not approve this shop.");
                }
            };
        }

        const rejectBtn = card.querySelector('[data-action="reject"]');
        if(rejectBtn){
            rejectBtn.onclick = async function(){
                if(!confirm(`Reject shop "${shop.name}"?`)) return;
                try {
                    await dbSetShopApprovalStatus(shop.id, "rejected", myTehsilId);
                    await renderTehsilAdminApp();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not reject this shop.");
                }
            };
        }

        const suspendBtn = card.querySelector('[data-action="suspend"]');
        if(suspendBtn){
            suspendBtn.onclick = async function(){
                if(!confirm(`Suspend shop "${shop.name}"? It will stop showing publicly.`)) return;
                try {
                    await dbSetShopApprovalStatus(shop.id, "suspended", myTehsilId);
                    await renderTehsilAdminApp();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not suspend this shop.");
                }
            };
        }

        container.appendChild(card);
    });
}

function renderRidersList(containerId, riders, isPending){

    const container = document.getElementById(containerId);

    if(!riders || riders.length === 0){
        container.innerHTML = `<div class="adminEmpty">No riders waiting for review.</div>`;
        return;
    }

    container.innerHTML = "";

    riders.forEach(rider => {

        const card = document.createElement("div");
        card.className = "adminCard";

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>${rider.full_name}</strong>
                    <div style="color:#777; font-size:13px;">${rider.phone}</div>
                </div>
                <div class="adminActions">
                    <button class="adminBtn approve" data-action="approve">Approve</button>
                    <button class="adminBtn reject" data-action="reject">Reject</button>
                </div>
            </div>
        `;

        card.querySelector('[data-action="approve"]').onclick = async function(){
            if(!confirm(`Approve rider "${rider.full_name}"?`)) return;
            try {
                await dbSetRiderStatus(rider.id, "approved", myTehsilId);
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not approve this rider.");
            }
        };

        card.querySelector('[data-action="reject"]').onclick = async function(){
            if(!confirm(`Reject rider "${rider.full_name}"?`)) return;
            try {
                await dbSetRiderStatus(rider.id, "rejected", myTehsilId);
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not reject this rider.");
            }
        };

        container.appendChild(card);
    });
}

function renderApprovedRiders(riders){

    const container = document.getElementById("approvedRidersList");

    if(!riders || riders.length === 0){
        container.innerHTML = `<div class="adminEmpty">No approved riders yet.</div>`;
        return;
    }

    container.innerHTML = "";

    riders.forEach(rider => {

        const card = document.createElement("div");
        card.className = "adminCard";

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>${rider.full_name}</strong>
                    <div style="color:#777; font-size:13px;">${rider.phone}</div>
                </div>
                <div class="adminActions">
                    <label style="font-size:13px; display:flex; align-items:center; gap:6px;">
                        <input type="checkbox" data-action="available" ${rider.available ? "checked" : ""}>
                        Available
                    </label>
                    <button class="adminBtn reject" data-action="suspend">Suspend</button>
                </div>
            </div>
        `;

        card.querySelector('[data-action="available"]').onchange = async function(event){
            try {
                await dbSetRiderAvailability(rider.id, event.target.checked);
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not update availability.");
                event.target.checked = !event.target.checked;
            }
        };

        card.querySelector('[data-action="suspend"]').onclick = async function(){
            if(!confirm(`Suspend rider "${rider.full_name}"?`)) return;
            try {
                await dbSetRiderStatus(rider.id, "suspended", myTehsilId);
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not suspend this rider.");
            }
        };

        container.appendChild(card);
    });
}

function renderUnassignedOrders(orders, approvedRiders){

    const container = document.getElementById("unassignedOrdersList");

    if(!orders || orders.length === 0){
        container.innerHTML = `<div class="adminEmpty">No unassigned orders right now.</div>`;
        return;
    }

    const availableRiders = (approvedRiders || []).filter(r => r.available);

    container.innerHTML = "";

    orders.forEach(order => {

        const card = document.createElement("div");
        card.className = "adminCard";

        const riderOptions = availableRiders.length > 0
            ? availableRiders.map(r => `<option value="${r.id}">${r.full_name}</option>`).join("")
            : `<option value="">No available riders</option>`;

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>Order #${order.id}</strong> — ₹${order.total}
                    <div style="color:#777; font-size:13px;">${order.customer_name} · ${order.customer_address || ""}</div>
                </div>
            </div>
            <div class="adminAssignRow">
                <select class="adminSelect" data-action="riderSelect">${riderOptions}</select>
                <input class="adminSelect" style="width:110px;" type="number" min="0" step="0.1" placeholder="Distance (km)" data-action="distanceInput">
                <label class="adminRainToggle">
                    <input type="checkbox" data-action="rainToggle"> 🌧 Raining
                </label>
                <button class="adminBtn approve" data-action="assign" ${availableRiders.length === 0 ? "disabled" : ""}>Assign</button>
            </div>
            <div class="adminFeePreview" data-action="feePreview"></div>
        `;

        const distanceInput = card.querySelector('[data-action="distanceInput"]');
        const rainToggle = card.querySelector('[data-action="rainToggle"]');
        const feePreview = card.querySelector('[data-action="feePreview"]');

        function updateFeePreview(){
            const distanceKm = Number(distanceInput.value) || 0;
            const breakdown = computeDeliveryFee({ distanceKm, isRainy: rainToggle.checked, atTime: new Date() });
            feePreview.innerHTML = `
                Delivery will be <strong>₹${breakdown.totalFee}</strong>
                (rider gets <strong>₹${breakdown.riderPayout}</strong>) —
                ${deliveryFeeBreakdownHTML(breakdown)}
            `;
        }

        distanceInput.oninput = updateFeePreview;
        rainToggle.onchange = updateFeePreview;
        updateFeePreview();

        card.querySelector('[data-action="assign"]').onclick = async function(){
            const riderId = card.querySelector('[data-action="riderSelect"]').value;
            if(!riderId) return;

            const distanceKm = Number(distanceInput.value) || 0;
            const isRainy = rainToggle.checked;

            try {
                await dbAssignRiderToOrder(order.id, Number(riderId), myTehsilId);
                await dbSetOrderDeliveryPricing(order.id, { distanceKm, isRainy });
                await renderTehsilAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not assign a rider.");
            }
        };

        container.appendChild(card);
    });
}

function renderTehsilAudit(logs){

    const container = document.getElementById("tehsilAuditList");

    if(!logs || logs.length === 0){
        container.innerHTML = `<div class="adminEmpty">No activity recorded yet.</div>`;
        return;
    }

    container.innerHTML = "";

    logs.forEach(log => {
        const row = document.createElement("div");
        row.className = "adminCard";
        row.innerHTML = `
            <div style="font-size:13px; color:#555;">
                <strong>${log.action.replace(/_/g, " ")}</strong>
                ${log.target_table ? ` · ${log.target_table}#${log.target_id}` : ""}
                <div style="color:#999; margin-top:4px;">${new Date(log.created_at).toLocaleString()}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", initTehsilAdmin);
