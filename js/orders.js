document.addEventListener("DOMContentLoaded", function () {
    renderOrders();
});

function renderOrders() {

    const activeWrap = document.getElementById("activeOrders");
    const historyWrap = document.getElementById("historyOrders");

    activeWrap.innerHTML = "";
    historyWrap.innerHTML = "";

    const orders = getOrders();

    if (orders.length === 0) {

        activeWrap.innerHTML = `

        <div class="emptyBox">

            <div class="emptyIcon">📦</div>

            <h2>No Orders Yet</h2>

            <p>Your placed orders will appear here.</p>

            <a href="index.html" class="shopBtn">

                Continue Shopping

            </a>

        </div>

        `;

        return;
    }

    let activeCount = 0;

    orders.forEach(order => {

        if (
            order.status !== "Delivered" &&
            order.status !== "Cancelled"
        ) {
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

        order.items.forEach(item => {

            const product = getProductById(item.productId);

            if (!product) return;

            itemsHTML += `

            <div class="itemRow">

                <span>

                    ${product.emoji || "📦"} ${product.name}

                </span>

                <span>

                    x${item.quantity}

                </span>

            </div>

            `;

        });

        const card = `

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

                <div class="status ${order.status.toLowerCase().replace(/\s/g,'')}">

                    ${order.status}

                </div>

            </div>

            <div class="productsBox">

                <h4>Products</h4>

                ${itemsHTML}

            </div>

            <div class="billBox">

                <div>

                    <span>Products</span>

                    <span>₹${order.subtotal ?? order.total-30}</span>

                </div>

                <div>

                    <span>Delivery</span>

                    <span>₹${order.delivery ?? 30}</span>

                </div>

                <div class="totalRow">

                    <span>Total</span>

                    <span>₹${order.total}</span>

                </div>

            </div>

            <div class="buttonRow">

                <button class="secondaryBtn">

                    Contact Support

                </button>

                <button class="primaryBtn">

                    Invoice

                </button>

            </div>

        </div>

        `;

        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {

            historyWrap.innerHTML += card;

        } else {

            activeWrap.innerHTML += card;

        }

    });

}
