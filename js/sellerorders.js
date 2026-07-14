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

console.log(orders);
}
