/* This is an ESTIMATE shown at checkout — just the ₹40 base fee.
   The real delivery charge (base + distance + off-hour + rain) is
   only known once a rider is dispatched and the km is entered, at
   which point dbSetOrderDeliveryPricing() recalculates order.delivery
   and order.total for real. See js/deliveryPricing.js. */
const DELIVERY_FEE_PER_SHOP = DELIVERY_BASE_FEE;

let checkoutUser = null;


document.addEventListener("DOMContentLoaded", async function(){

    /* AUTH GUARD */

    checkoutUser = await authGetCurrentUser();

    if(!checkoutUser){
        alert("Please login to checkout.");
        window.location.href = "login.html";
        return;
    }

    const cart = getCart();

    if(cart.length === 0){
        alert("Your cart is empty.");
        window.location.href = "cart.html";
        return;
    }

    /* PRE-FILL FROM PROFILE */

    document.getElementById("customerName").value = checkoutUser.name || "";
    document.getElementById("customerPhone").value = checkoutUser.phone || "";
    document.getElementById("customerAddress").value = checkoutUser.market || "";

    document.getElementById("placeOrderBtn").onclick = placeOrder;
});


async function placeOrder(){

    const btn = document.getElementById("placeOrderBtn");

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if(!name || !phone || !address){
        alert("Please fill all details.");
        return;
    }

    const cart = getCart();

    if(cart.length === 0){
        alert("Your cart is empty.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Placing Order...";

    try {

        /* FETCH REAL PRODUCT DATA FOR EVERY CART ITEM */

        const enrichedItems = [];

        for(const item of cart){
            const product = await dbGetProductById(item.productId);
            if(product){
                enrichedItems.push({ ...item, product });
            }
        }

        if(enrichedItems.length === 0){
            alert("These products are no longer available.");
            btn.disabled = false;
            btn.innerText = "Place Order";
            return;
        }


        /* SPLIT INTO ONE ORDER PER SHOP */

        const shopGroups = {};

        enrichedItems.forEach(item => {
            const shopId = item.product.shop_id;
            if(!shopGroups[shopId]) shopGroups[shopId] = [];
            shopGroups[shopId].push(item);
        });

        const placedOrders = [];

        for(const shopId of Object.keys(shopGroups)){

            const items = shopGroups[shopId];

            const subtotal = items.reduce(
                (sum, item) => sum + (item.product.price * item.quantity), 0
            );

            const total = subtotal + DELIVERY_FEE_PER_SHOP;

            // Snapshot product details into the order itself, so order
            // history stays accurate even if the product changes later.
            const itemsSnapshot = items.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                emoji: item.product.emoji,
                image: item.product.image,
                quantity: item.quantity
            }));

            // Tag the order with the shop's tehsil, so the Tehsil Admin
            // can see it and assign a rider. Without this the order
            // never shows up on anyone's delivery dashboard.
            let tehsilId = null;

            try {
                const shop = await dbGetShop(Number(shopId));
                tehsilId = shop ? shop.tehsil_id : null;
            } catch(shopErr) {
                console.error("Could not resolve shop's tehsil:", shopErr);
            }

            const order = await dbSaveOrder({
                shop_id: Number(shopId),
                customer_id: checkoutUser.id,
                customer_name: name,
                customer_phone: phone,
                customer_address: address,
                items: itemsSnapshot,
                subtotal: subtotal,
                delivery: DELIVERY_FEE_PER_SHOP,
                total: total,
                status: "Pending",
                payment_status: "unpaid",
                tehsil_id: tehsilId,
                delivery_status: "unassigned"
            });

            placedOrders.push(order);
        }


        clearCart();

        window.location.href = `success.html?count=${placedOrders.length}`;

    } catch(err) {

        console.error("Place order failed:", err);
        alert("Something went wrong placing your order:\n\n" + (err.message || err));

        btn.disabled = false;
        btn.innerText = "Place Order";
    }
}
