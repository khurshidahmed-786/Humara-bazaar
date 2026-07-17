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

<p>

💰 Total : ₹${order.total}

</p>

<br>

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

</div>

`;

});
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
