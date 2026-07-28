document.addEventListener("DOMContentLoaded", async function () {

    const user = await authGetCurrentUser();

    if(!user){
        alert("Please login to view your orders.");
        window.location.href = "login.html";
        return;
    }

    await renderOrders(user.id);
});


async function renderOrders(customerId) {

    const activeWrap = document.getElementById("activeOrders");
    const historyWrap = document.getElementById("historyOrders");

    activeWrap.innerHTML = "";
    historyWrap.innerHTML = "";

    let orders = [];

    try {
        orders = await dbGetOrdersByCustomer(customerId);
    } catch(err) {
        console.error(err);
        activeWrap.innerHTML = `<div class="emptyBox"><p>Failed to load orders.</p></div>`;
        return;
    }

    if (orders.length === 0) {

        activeWrap.innerHTML = `
        <div class="emptyBox">
            <div class="emptyIcon">📦</div>
            <h2>No Orders Yet</h2>
            <p>Your placed orders will appear here.</p>
            <a href="home.html" class="shopBtn">Continue Shopping</a>
        </div>
        `;

        return;
    }

    let activeCount = 0;

    orders.forEach(order => {
        if (order.status !== "Delivered" && order.status !== "Cancelled") {
            activeCount++;
        }
    });

    activeWrap.innerHTML = `
    <div class="summaryCard">
        <h2>📦 My Orders</h2>
        <p>${activeCount} Active Order(s)</p>
    </div>
    `;

    orders.forEach(order => {

        let itemsHTML = "";

        (order.items || []).forEach(item => {
            itemsHTML += `
            <div class="itemRow">
                <span>${item.emoji || "📦"} ${item.name}</span>
                <span>x${item.quantity}</span>
            </div>
            `;
        });

        const card = `
        <div class="orderCard">
            <div class="orderTop">
                <div>
                    <div class="orderNumber">Order #${String(order.id).padStart(4, "0")}</div>
                    <div class="orderDate">${new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div class="status ${order.status.toLowerCase().replace(/\s/g,'')}">
                    ${order.status}
                </div>
            </div>
            <div class="productsBox">
                <h4>Products</h4>
                ${itemsHTML}
            </div>
            <div class="billBox">
                <div><span>Products</span><span>₹${order.subtotal}</span></div>
                <div><span>Delivery</span><span>₹${order.delivery}</span></div>
                <div class="totalRow"><span>Total</span><span>₹${order.total}</span></div>
            </div>
        </div>
        `;

        if (order.status === "Delivered" || order.status === "Cancelled") {
            historyWrap.innerHTML += card;
        } else {
            activeWrap.innerHTML += card;
        }
    });
}
