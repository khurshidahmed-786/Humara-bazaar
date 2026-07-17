document.addEventListener(

"DOMContentLoaded",

function(){

    renderOrders();

});
function renderOrders(){

    const container = document.getElementById(

        "ordersContainer"

    );

    const shop = getCurrentShop();

    if(!shop){

        container.innerHTML = `

        <div class="order">

        No shop found.

        </div>

        `;

        return;

    }
const orders = getOrders();

const sellerOrders = orders.filter(

    order => order.shopId == shop.id

);

if(sellerOrders.length===0){

    container.innerHTML=`

    <div class="order">

        <h2>📦 No Orders Yet</h2>

        <p>

            New customer orders will appear here.

        </p>

    </div>

    `;

    return;

}

container.innerHTML="";

sellerOrders.forEach(order=>{

container.innerHTML += `

<div class="order">

<div class="row">

<h2>

Order #${String(order.id).slice(-4)}

</h2>

<div>

${order.status}

</div>

</div>

<br>

<p>

👤 ${order.customerName}

</p>

<p>

📞 ${order.customerPhone}

</p>

<p>

📍 ${order.customerAddress}

</p>

<br>

<h3>

Products

</h3>

${renderItems(order)}

<br>

<p>

💰 Total : ₹${order.total}

</p>

<br>

${getOrderButtons(order)}

</div>

`;

});
}
function getOrderButtons(order){

if(order.status==="Pending"){

return `

<a
class="btn"
onclick="acceptOrder(${order.id})">

Accept

</a>

<a
class="btn reject"
onclick="rejectOrder(${order.id})">

Reject

</a>

`;

}

if(order.status==="Accepted"){

return `

<a
class="btn"
onclick="prepareOrder(${order.id})">

Preparing

</a>

`;

}

if(order.status==="Preparing"){

return `

<a
class="btn"
onclick="readyOrder(${order.id})">

Ready

</a>

`;

}

if(order.status==="Ready"){

return `

<a
class="btn"
onclick="deliverOrder(${order.id})">

Delivered

</a>

`;

}

return `
<p>

✅ ${order.status}

</p>
`;
}
function prepareOrder(id){

updateOrderStatus(id,"Preparing");

renderOrders();

}

function readyOrder(id){

updateOrderStatus(id,"Ready");

renderOrders();

}

function deliverOrder(id){

updateOrderStatus(id,"Delivered");

renderOrders();

}
function acceptOrder(id){

updateOrderStatus(

id,

"Accepted"

);

renderOrders();

}
function rejectOrder(id){

    updateOrderStatus(
        id,
        "Cancelled"
    );

    renderOrders();

}

function renderItems(order){

    let html="";

    order.items.forEach(item=>{

        const product=getProductById(item.productId);

        if(!product){

            return;

        }

        html += `

<div class="productRow">

<div>

${product.emoji || "📦"}

${product.name}

</div>

<div>

×${item.quantity}

</div>

</div>

`;

    });

    return html;

}
