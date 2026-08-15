/* ==========================================================
   HAMARA BAZAAR — RIDER V2
   Complete single-order delivery experience.
   ========================================================== */

let riderV2Profile = null;
let riderV2Shops = {};
let riderV2ActiveTrip = { trip_id: null, orders: [] };

const r2$ = id => document.getElementById(id);

function r2escape(value) {
    const el = document.createElement("div");
    el.textContent = value == null ? "" : String(value);
    return el.innerHTML;
}

function r2open(html) {
    r2$("riderV2Sheet").innerHTML = html;
    r2$("riderV2Backdrop").style.display = "flex";
}

function r2close() {
    r2$("riderV2Backdrop").style.display = "none";
    r2$("riderV2Sheet").innerHTML = "";
}

function r2maps(address) {
    return "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(address || "");
}

function r2tel(phone) {
    return `tel:${encodeURIComponent(phone || "")}`;
}

async function r2shops(orders) {
    const ids = [...new Set((orders || []).map(o => o.shop_id).filter(Boolean))];
    if (!ids.length || typeof dbGetShopsByIds !== "function") return {};
    try {
        const shops = await dbGetShopsByIds(ids);
        return Object.fromEntries((shops || []).map(s => [s.id, s]));
    } catch (e) {
        console.warn("Shop lookup failed:", e);
        return {};
    }
}

function r2status(online) {
    const el = r2$("riderV2Status");
    el.textContent = online ? "ONLINE" : "OFFLINE";
    el.className = `r2-status ${online ? "online" : ""}`;
}

async function r2init() {
    r2$("riderV2Loading").style.display = "none";

    let user = null;
    try { user = await authGetCurrentUser(); } catch (e) { console.error(e); }

    if (!user) {
        location.href = "login.html?redirect=riderdashboard.html";
        return;
    }

    try { riderV2Profile = await dbGetMyRiderApplication(); } catch (e) {
        console.error("Rider application:", e);
    }

    if (!riderV2Profile || riderV2Profile.status !== "approved") {
        r2$("riderV2Unauthorized").style.display = "block";
        return;
    }

    r2$("riderV2App").style.display = "block";
    r2$("riderV2Name").textContent = riderV2Profile.full_name || "";

    const online = riderV2Profile.availability === "online" || riderV2Profile.available === true;
    r2$("riderV2Availability").checked = online;
    r2status(online);

    r2$("riderV2Availability").addEventListener("change", async e => {
        const desired = e.target.checked;
        e.target.disabled = true;
        try {
            await dbRiderV2SetAvailability(desired);
            riderV2Profile.availability = desired ? "online" : "offline";
            riderV2Profile.available = desired;
            r2status(desired);
            await r2refresh();
        } catch (error) {
            e.target.checked = !desired;
            r2status(!desired);
            alert(error.message || "Could not update availability.");
        } finally {
            e.target.disabled = false;
        }
    });

    r2$("refreshRiderV2").onclick = r2refresh;
    r2$("openHistory").onclick = r2history;
    r2$("riderV2Backdrop").addEventListener("click", e => {
        if (e.target === r2$("riderV2Backdrop")) r2close();
    });

    await r2refresh();
}

async function r2refresh() {
    const [stats, active, available] = await Promise.allSettled([
        dbRiderV2Stats(),
        dbRiderV2GetActiveTrip(),
        dbRiderV2GetAvailableOrders(20)
    ]);

    const s = stats.status === "fulfilled" ? stats.value : {};
    riderV2ActiveTrip = active.status === "fulfilled"
        ? active.value : { trip_id: null, orders: [] };
    const avail = available.status === "fulfilled" ? available.value : [];

    r2$("statToday").textContent = s.today_delivered ?? 0;
    r2$("statTodayEarn").textContent = `₹${Number(s.today_earnings || 0)}`;
    r2$("statCod").textContent = `₹${Number(s.today_cod || 0)}`;
    r2$("statActive").textContent = s.active_orders ?? 0;

    riderV2Shops = await r2shops([
        ...(riderV2ActiveTrip.orders || []),
        ...avail
    ]);

    r2renderActive(riderV2ActiveTrip);
    r2renderAvailable(avail);
}

function r2renderActive(trip) {
    const container = r2$("riderV2Active");
    const order = Array.isArray(trip?.orders) ? trip.orders[0] : null;

    if (!trip?.trip_id || !order) {
        container.innerHTML = `<div class="r2-card r2-empty">No active delivery right now.</div>`;
        return;
    }

    const shop = riderV2Shops[order.shop_id];
    const state = order.delivery_status;
    const label = {
        assigned: "Assigned",
        picked_up: "Picked Up",
        out_for_delivery: "Out for Delivery",
        delivery_attention_required: "Attention Required"
    }[state] || state;

    let mainAction = "";
    if (state === "assigned") {
        mainAction = `<button class="r2-btn primary" data-action="pickup">📦 I've Picked It Up</button>`;
    } else if (state === "picked_up") {
        mainAction = `<button class="r2-btn primary" data-action="out">🚴 Out for Delivery</button>`;
    } else if (state === "out_for_delivery") {
        mainAction = `<button class="r2-btn primary" data-action="deliver">✅ Confirm Delivery</button>`;
    }

    container.innerHTML = `
        <article class="r2-order">
            <div class="r2-order-head">
                <div>
                    <div class="r2-order-id">Order #${r2escape(order.order_id)}</div>
                    <div class="r2-mini">Trip #${r2escape(trip.trip_id)}</div>
                </div>
                <span class="r2-state">${r2escape(label)}</span>
            </div>

            <div class="r2-route">
                <div class="r2-route-row">
                    <span class="r2-dot"></span>
                    <div>
                        <div class="r2-label">Pickup</div>
                        <div class="r2-value">${r2escape(shop?.name || "Shop")}</div>
                    </div>
                </div>
                <div class="r2-line"></div>
                <div class="r2-route-row">
                    <span class="r2-dot to"></span>
                    <div>
                        <div class="r2-label">Customer</div>
                        <div class="r2-value">${r2escape(order.customer_name || "Customer")}</div>
                        <div class="r2-mini">${r2escape(order.customer_address || "Address unavailable")}</div>
                    </div>
                </div>
            </div>

            <div class="r2-meta">
                ${shop?.phone ? `<a href="${r2tel(shop.phone)}">📞 Shop</a>` : ""}
                ${order.customer_phone ? `<a href="${r2tel(order.customer_phone)}">📞 Customer</a>` : ""}
                <a href="${r2maps(order.customer_address)}" target="_blank" rel="noopener">🧭 Navigate</a>
            </div>

            <div class="r2-earn">
                <span>Your earning</span>
                <strong>₹${Number(order.rider_share || 0)}</strong>
            </div>

            <div class="r2-actions">
                ${mainAction}
                <button class="r2-btn danger" data-action="issue">⚠ Report Problem</button>
            </div>
        </article>
    `;

    container.querySelector("[data-action='pickup']")?.addEventListener("click", async () => {
        try {
            await dbRiderV2Pickup(order.order_id);
            await r2refresh();
        } catch (e) {
            alert(e.message || "Pickup could not be recorded.");
        }
    });

    container.querySelector("[data-action='out']")?.addEventListener("click", async () => {
        try {
            await dbRiderV2OutForDelivery(order.order_id);
            await r2refresh();
        } catch (e) {
            alert(e.message || "Could not move the order to Out for Delivery.");
        }
    });

    container.querySelector("[data-action='deliver']")?.addEventListener("click", () => {
        r2deliverySheet(order);
    });

    container.querySelector("[data-action='issue']")?.addEventListener("click", () => {
        r2issueSheet(order.order_id);
    });
}

function r2renderAvailable(orders) {
    const container = r2$("riderV2Available");

    if (!orders.length) {
        container.innerHTML = `
            <div class="r2-card r2-empty">
                <strong>No deliveries available.</strong>
                <div class="r2-note">Orders appear here after shops mark them ready.</div>
            </div>`;
        return;
    }

    container.innerHTML = orders.map(o => {
        const shop = riderV2Shops[o.shop_id];
        return `
            <article class="r2-order">
                <div class="r2-order-head">
                    <div class="r2-order-id">Order #${r2escape(o.id)}</div>
                    <span class="r2-state">Available</span>
                </div>

                <div class="r2-route">
                    <div class="r2-route-row">
                        <span class="r2-dot"></span>
                        <div>
                            <div class="r2-label">Pickup</div>
                            <div class="r2-value">${r2escape(shop?.name || "Shop")}</div>
                        </div>
                    </div>
                    <div class="r2-line"></div>
                    <div class="r2-route-row">
                        <span class="r2-dot to"></span>
                        <div>
                            <div class="r2-label">Customer</div>
                            <div class="r2-value">${r2escape(o.customer_name || "Customer")}</div>
                            <div class="r2-mini">${r2escape(o.customer_address || "Address unavailable")}</div>
                        </div>
                    </div>
                </div>

                <div class="r2-meta">
                    <span>Order ₹${r2escape(o.total || 0)}</span>
                    <span>${r2escape(o.payment_status || "Payment pending")}</span>
                </div>

                <div class="r2-earn">
                    <span>Current rider payout</span>
                    <strong>₹${Number(o.rider_payout || 0)}</strong>
                </div>

                <div class="r2-actions">
                    <button class="r2-btn primary" data-accept="${r2escape(o.id)}">Accept Delivery</button>
                    ${o.customer_phone ? `<a class="r2-btn" href="${r2tel(o.customer_phone)}">📞 Call</a>` : ""}
                </div>
            </article>`;
    }).join("");

    container.querySelectorAll("[data-accept]").forEach(button => {
        button.addEventListener("click", async () => {
            button.disabled = true;
            button.textContent = "Accepting…";
            try {
                await dbRiderV2AcceptOrder(button.dataset.accept);
                await r2refresh();
            } catch (e) {
                alert(e.message || "This delivery is no longer available.");
                button.disabled = false;
                button.textContent = "Accept Delivery";
            }
        });
    });
}

function r2deliverySheet(order) {
    let paymentMethod = "online_prepaid";

    r2open(`
        <div class="r2-sheet-head">
            <h3>Complete Delivery</h3>
            <button class="r2-close" onclick="r2close()">×</button>
        </div>

        <div class="r2-note">
            Ask the customer to open their order and show/give the 4-digit delivery PIN.
        </div>

        <div class="r2-pin">
            ${[0,1,2,3].map(i => `<input maxlength="1" inputmode="numeric" data-pin="${i}">`).join("")}
        </div>

        <button class="r2-btn primary" id="r2VerifyPin" style="width:100%;">Verify PIN</button>
        <div id="r2PinMessage" class="r2-note"></div>

        <div id="r2PaymentStep" style="display:none;margin-top:18px;">
            <h3>Payment</h3>

            <div class="r2-payment">
                <button data-pay="online_prepaid" class="selected">
                    <strong>✅ Paid Online</strong>
                    <span>No cash to collect</span>
                </button>
                <button data-pay="cod">
                    <strong>💵 COD</strong>
                    <span>Collect cash</span>
                </button>
            </div>

            <div id="r2CodBox" class="r2-amount" style="display:none;">
                <label for="r2CodAmount">Cash collected</label>
                <input id="r2CodAmount" type="number" min="0" step="0.01" value="${Number(order.total || 0)}">
                <div class="r2-note">Expected amount: ₹${Number(order.total || 0)}</div>
            </div>

            <button id="r2Complete" class="r2-btn primary"
                style="width:100%;margin-top:14px;">Confirm Delivery</button>
        </div>
    `);

    const pinInputs = [...document.querySelectorAll("[data-pin]")];
    pinInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, "").slice(0, 1);
            if (input.value && pinInputs[index + 1]) pinInputs[index + 1].focus();
        });
    });
    pinInputs[0]?.focus();

    r2$("r2VerifyPin").onclick = async () => {
        const pin = pinInputs.map(x => x.value).join("");
        if (!/^\d{4}$/.test(pin)) {
            r2$("r2PinMessage").textContent = "Enter all 4 digits.";
            return;
        }

        const btn = r2$("r2VerifyPin");
        btn.disabled = true;
        btn.textContent = "Checking…";

        try {
            const result = await dbRiderV2VerifyPin(order.order_id, pin);
            if (!result?.verified) {
                r2$("r2PinMessage").textContent =
                    result?.locked
                        ? "Too many incorrect attempts. Contact Tehsil Admin."
                        : `Incorrect PIN. Attempts remaining: ${result?.attempts_remaining ?? 0}`;
                btn.disabled = false;
                btn.textContent = "Verify PIN";
                return;
            }

            r2$("r2PinMessage").textContent = "PIN verified ✓";
            r2$("r2PaymentStep").style.display = "block";
            btn.textContent = "PIN Verified";
        } catch (e) {
            r2$("r2PinMessage").textContent = e.message || "Verification failed.";
            btn.disabled = false;
            btn.textContent = "Verify PIN";
        }
    };

    document.querySelectorAll("[data-pay]").forEach(button => {
        button.onclick = () => {
            paymentMethod = button.dataset.pay;
            document.querySelectorAll("[data-pay]").forEach(b => b.classList.toggle("selected", b === button));
            r2$("r2CodBox").style.display = paymentMethod === "cod" ? "block" : "none";
        };
    });

    r2$("r2Complete").onclick = async () => {
        const amount = paymentMethod === "cod"
            ? Number(r2$("r2CodAmount").value || 0)
            : 0;

        const btn = r2$("r2Complete");
        btn.disabled = true;
        btn.textContent = "Completing…";

        try {
            await dbRiderV2CompleteDelivery(order.order_id, paymentMethod, amount);
            r2close();
            await r2refresh();
            alert("Delivery completed successfully.");
        } catch (e) {
            alert(e.message || "Delivery could not be completed.");
            btn.disabled = false;
            btn.textContent = "Confirm Delivery";
        }
    };
}

function r2issueSheet(orderId) {
    const opts = [
        ["customer_unavailable","Customer unavailable"],
        ["customer_refused","Customer refused"],
        ["wrong_address","Wrong address"],
        ["shop_not_ready","Shop not ready"],
        ["shop_closed","Shop closed"],
        ["customer_requested_reschedule","Customer requested reschedule"],
        ["vehicle_problem","Vehicle problem"],
        ["payment_problem","Payment problem"],
        ["damaged_order","Order damaged"],
        ["missing_item","Missing item"],
        ["other","Other"]
    ];

    r2open(`
        <div class="r2-sheet-head">
            <h3>Report Delivery Problem</h3>
            <button class="r2-close" onclick="r2close()">×</button>
        </div>
        <div class="r2-issues">
            ${opts.map(([v,l]) => `<button class="r2-issue" data-issue="${v}">${l}</button>`).join("")}
        </div>
        <textarea id="r2IssueNote" class="r2-textarea" rows="4"
            placeholder="Add details (optional)"></textarea>
    `);

    document.querySelectorAll("[data-issue]").forEach(btn => {
        btn.onclick = async () => {
            try {
                await dbRiderV2ReportIssue(
                    orderId,
                    btn.dataset.issue,
                    r2$("r2IssueNote").value.trim()
                );
                r2close();
                await r2refresh();
                alert("Problem reported to Tehsil Admin.");
            } catch (e) {
                alert(e.message || "Could not report the problem.");
            }
        };
    });
}

async function r2history() {
    try {
        const history = await dbRiderV2History(50);

        r2open(`
            <div class="r2-sheet-head">
                <h3>Delivery History</h3>
                <button class="r2-close" onclick="r2close()">×</button>
            </div>
            <div style="margin-top:10px;">
                ${history.length
                    ? history.map(item => `
                        <div class="r2-history">
                            <div>
                                <strong>Order #${r2escape(item.order_id)}</strong>
                                <span>${r2escape(item.customer_name || "Customer")}</span>
                                <span>${r2escape(item.customer_address || "")}</span>
                                <span>${item.delivered_at ? new Date(item.delivered_at).toLocaleString() : ""}</span>
                                <span>${r2escape(item.delivered_payment_method || "")}
                                    ${item.delivered_payment_method === "cod"
                                        ? ` · COD ₹${Number(item.delivered_amount_collected || 0)}` : ""}
                                </span>
                            </div>
                            <div class="r2-history-earn">₹${Number(item.rider_share || 0)}</div>
                        </div>
                    `).join("")
                    : `<div class="r2-empty">No completed deliveries yet.</div>`}
            </div>
        `);
    } catch (e) {
        alert(e.message || "Could not load history.");
    }
}

document.addEventListener("DOMContentLoaded", r2init);
window.r2close = r2close;
