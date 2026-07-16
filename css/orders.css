document.addEventListener(

"DOMContentLoaded",

function(){

    renderOrders();

});

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

            <div class="orderHeader">

                <div>

                    <h3>

                        Order #${order.id}

                    </h3>

                    <p>

                        ${new Date(order.createdAt).toLocaleDateString()}

                    </p>

                </div>

                <div class="status ${order.status.toLowerCase()}">

                    ${order.status}

                </div>

            </div>

            <div class="orderBody">

                <p>

                    👤 ${order.customerName}

                </p>

                <p>

                    💰 ₹${order.total}

                </p>

                <p>

                    📍 ${order.customerAddress}

                </p>

            </div>

            <div class="orderButtons">

                <button class="secondaryBtn">

                    📞 Contact Support

                </button>

                <button class="primaryBtn">

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
