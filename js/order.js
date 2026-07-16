document.addEventListener(

"DOMContentLoaded",

function(){

    renderOrders();

});
function renderOrderItems(order){

let html="";

order.items.forEach(item=>{

const product=getProductById(item.productId);

if(!product){

return;

}

html += `

<div class="orderItem">

<div>

${product.emoji || "📦"}

${product.name}

</div>

<div>

x${item.quantity}

</div>

</div>

`;

});

return html;

}
function renderOrders(){

    const activeWrap = document.getElementById("activeOrders");

    const historyWrap = document.getElementById("historyOrders");

    activeWrap.innerHTML = "";

    historyWrap.innerHTML = "";

    const orders = getOrders();

    if(orders.length===0){

        activeWrap.innerHTML = `

        <div class="emptyBox">

            <h3>

                📦 No Orders Yet

            </h3>

            <p>

                Your placed orders will appear here.

            </p>

        </div>

        `;

        return;

    }

    orders.forEach(order=>{
let html = `

<div class="orderCard">

<div class="orderTop">

<div>

<div class="orderNumber">

Order #${String(order.id).slice(-4)}

</div>

<div class="orderDate">

${new Date(order.createdAt).toLocaleString()}

</div>

</div>

<div class="status ${order.status.toLowerCase().replace(/\s/g,"")}">

${order.status}

</div>

</div>

<div class="orderSection">

<div class="sectionHeading">

Customer

</div>

<div>

👤 ${order.customerName}

</div>

<div>

📞 ${order.customerPhone}

</div>

<div>

📍 ${order.customerAddress}

</div>

</div>

<div class="orderSection">

<div class="sectionHeading">

Products

</div>

${renderOrderItems(order)}

</div>

<div class="bill">

<div>

<span>

Products

</span>

<span>

₹${order.subtotal || order.total}

</span>

</div>

<div>

<span>

Delivery

</span>

<span>

₹${order.delivery || 30}

</span>

</div>

<div class="billTotal">

<span>

Total

</span>

<span>

₹${order.total}

</span>

</div>

</div>

<div class="orderActions">
<button
class="secondaryBtn"
onclick="alert('Support Coming Soon')">

📞 Contact Support

</button>

<button
class="primaryBtn"
onclick="alert('Invoice Coming Soon')">

🧾 Invoice

</button>

</div>

</div>

`;
        if(

            order.status==="Delivered" ||

            order.status==="Cancelled"

        ){

            historyWrap.innerHTML += html;

        }

        else{

            activeWrap.innerHTML += html;

        }

    });

}
