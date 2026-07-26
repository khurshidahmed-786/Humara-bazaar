let sellerShop = null;


document.addEventListener("DOMContentLoaded", async function(){
    await initSellerOrders();
});


async function initSellerOrders(){

    const container = document.getElementById("ordersContainer");

    const activeBusinessId = localStorage.getItem("hb_activeBusiness");

    if(!activeBusinessId){
        container.innerHTML = `<div class="order">No business selected. <a href="role.html">Go to My Business</a></div>`;
        return;
    }

    const business = await dbGetBusinessById(activeBusinessId);

    if(!business){
        container.innerHTML = `<div class="order">No business found.</div>`;
        return;
    }

    sellerShop = await dbGetShopByBusinessId(business.id);

    if(!sellerShop){
        container.innerHTML = `<div class="order">No shop found.</div>`;
        return;
    }

    await renderOrders();
}


async function renderOrders(){

    const container = document.getElementById("ordersContainer");

    let orders = [];

    try {
        orders = await dbGetOrdersByShop(sellerShop.id);
    } catch(err) {
        console.error(err);
        container.innerHTML = `<div class="order">Failed to load orders.</div>`;
        return;
    }

    if(orders.length === 0){
        container.innerHTML = `
        <div class="order">
            <h2>📦 No Orders Yet</h2>
            <p>New customer orders will appear here.</p>
        </div>
        `;
        return;
    }

    container.innerHTML = "";

    orders.forEach(order => {
        container.innerHTML += `
        <div class="order">
            <div class="row">
                <h2>Order #${String(order.id).padStart(4, "0")}</h2>
                <div>${order.status}</div>
            </div>
            <br>
            <p>👤 ${order.customer_name}</p>
            <p>📞 ${order.customer_phone}</p>
            <p>📍 ${order.customer_address}</p>
            <br>
            <h3>Products</h3>
            ${renderItems(order)}
            <br>
            <p>💰 Total : ₹${order.total}</p>
            <br>
            ${getOrderButtons(order)}
        </div>
        `;
    });
}


function renderItems(order){

    let html = "";

    (order.items || []).forEach(item => {
        html += `
        <div class="productRow">
            <div>${item.emoji || "📦"} ${item.name}</div>
            <div>×${item.quantity}</div>
        </div>
        `;
    });

    return html;
}


function getOrderButtons(order){

    if(order.status === "Pending"){
        return `
            <a class="btn" onclick="setOrderStatus(${order.id}, 'Accepted')">Accept</a>
            <a class="btn reject" onclick="setOrderStatus(${order.id}, 'Cancelled')">Reject</a>
        `;
    }

    if(order.status === "Accepted"){
        return `<a class="btn" onclick="setOrderStatus(${order.id}, 'Preparing')">Preparing</a>`;
    }

    if(order.status === "Preparing"){
        return `<a class="btn" onclick="setOrderStatus(${order.id}, 'Ready')">Ready</a>`;
    }

    if(order.status === "Ready"){
        return `<a class="btn" onclick="setOrderStatus(${order.id}, 'Delivered')">Delivered</a>`;
    }

    return `<p>✅ ${order.status}</p>`;
}


async function setOrderStatus(id, status){

    try {
        await dbUpdateOrderStatus(id, status);
        await renderOrders();
    } catch(err) {
        console.error(err);
        alert("Failed to update order: " + err.message);
    }
}
