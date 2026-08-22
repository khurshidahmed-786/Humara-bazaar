/* This is an ESTIMATE shown at checkout — just the ₹40 base fee.
   The real delivery charge (base + distance + off-hour + rain) is
   only known once a rider is dispatched and the km is entered, at
   which point dbSetOrderDeliveryPricing() recalculates order.delivery
   and order.total for real. See js/deliveryPricing.js.

   The distance shown/checked on THIS page (js/location.js,
   haversineDistanceKm) is a separate, straight-line ESTIMATE used
   only to (a) show the customer roughly how far the order is going
   and (b) block checkout for a shop that's clearly outside the
   configured max delivery radius. It never changes delivery_charge —
   that's still set later, by the Tehsil Admin, unchanged. */
const DELIVERY_FEE_PER_SHOP = DELIVERY_BASE_FEE;

let checkoutUser = null;

/* Customer's captured delivery coordinates. Stay null if they only
   type an address — that's allowed, we just can't show/enforce a
   distance for that shop group without both ends of the line. */
let customerLatitude = null;
let customerLongitude = null;

/* Cached per-shop breakdown, built once from the cart and reused by
   both the on-page estimate and the actual place-order call, so we
   don't re-fetch products/shops twice. Rebuilt if the cart changes,
   which can't happen without leaving this page. */
let checkoutShopGroups = null;

/* Shop ids currently outside the configured max delivery radius —
   checked before allowing Place Order. */
let blockedShopIds = new Set();


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
    document.getElementById("useCurrentLocationBtn").onclick = useCurrentLocationForCheckout;

    /* Build the shop groups once so the delivery estimate can render
       as soon as a location is captured (no need to wait for
       Place Order to be clicked). */
    try {
        checkoutShopGroups = await buildShopGroups(cart);
    } catch(err){
        console.error("Could not prepare delivery estimate:", err);
    }
});


/* ==========================================
   DELIVERY LOCATION (GPS)
========================================== */

async function useCurrentLocationForCheckout(){

    const btn = document.getElementById("useCurrentLocationBtn");
    const statusEl = document.getElementById("locationStatus");
    const addressInput = document.getElementById("customerAddress");

    btn.disabled = true;
    btn.innerText = "Locating…";
    statusEl.className = "locationStatus";
    statusEl.innerText = "";

    try {

        const loc = await getCurrentLocation();

        customerLatitude = loc.latitude;
        customerLongitude = loc.longitude;

        if(!isLocationAccurate(loc.accuracy)){
            statusEl.className = "locationStatus warn";
            statusEl.innerText = "📍 Your location may not be very accurate. Please confirm your delivery address below.";
        } else {
            statusEl.className = "locationStatus success";
            statusEl.innerText = "📍 Location captured.";
        }

        /* Best-effort prefill only — never overwrites something the
           customer already typed, and they can still edit it freely. */
        const address = await reverseGeocodeBestEffort(loc.latitude, loc.longitude);
        if(address && !addressInput.value.trim()){
            addressInput.value = address;
        }

        await renderDeliveryEstimate();

    } catch(err){

        statusEl.className = "locationStatus error";
        statusEl.innerText = err.message || "Couldn't get your location. You can still enter your delivery address manually.";

    } finally {

        btn.disabled = false;
        btn.innerText = "📍 Use My Current Location";

    }
}


/* ==========================================
   SHOP GROUPING (shared by estimate + place order)
========================================== */

async function buildShopGroups(cart){

    const enrichedItems = [];

    for(const item of cart){
        const product = await dbGetProductById(item.productId);
        if(product){
            enrichedItems.push({ ...item, product });
        }
    }

    const shopGroups = {};

    enrichedItems.forEach(item => {
        const shopId = item.product.shop_id;
        if(!shopGroups[shopId]) shopGroups[shopId] = { shopId, items: [], shop: null };
        shopGroups[shopId].items.push(item);
    });

    for(const shopId of Object.keys(shopGroups)){
        try {
            shopGroups[shopId].shop = await dbGetShop(Number(shopId));
        } catch(shopErr){
            console.error("Could not load shop for delivery estimate:", shopErr);
        }
    }

    return Object.values(shopGroups);
}


/* ==========================================
   DELIVERY ESTIMATE (display + max-radius check)
========================================== */

async function renderDeliveryEstimate(){

    const card = document.getElementById("deliveryEstimateCard");
    const list = document.getElementById("deliveryEstimateList");

    blockedShopIds = new Set();

    if(!checkoutShopGroups || checkoutShopGroups.length === 0){
        card.style.display = "none";
        return;
    }

    // Nothing to show until we actually have a delivery location.
    if(customerLatitude == null || customerLongitude == null){
        card.style.display = "none";
        return;
    }

    card.style.display = "block";
    list.innerHTML = "";

    checkoutShopGroups.forEach(group => {

        const shop = group.shop;
        const row = document.createElement("div");
        row.className = "deliveryEstimateRow";

        if(!shop || shop.latitude == null || shop.longitude == null){

            // Existing/legacy shop with no pickup location saved yet —
            // don't block checkout for this, just can't show a distance.
            row.innerText = `${shop ? shop.name : "A shop"}: distance will be confirmed by the shop's rider.`;

        } else {

            const distanceKm = haversineDistanceKm(
                customerLatitude, customerLongitude,
                shop.latitude, shop.longitude
            );

            if(distanceKm > MAX_DELIVERY_DISTANCE_KM){

                blockedShopIds.add(group.shopId);
                row.classList.add("blocked");
                row.innerText = `${shop.name}: ${formatDistanceKm(distanceKm)} away — this location is currently outside our delivery area for this shop.`;

            } else {

                row.innerText = `${shop.name}: approx. ${formatDistanceKm(distanceKm)} away.`;

            }
        }

        list.appendChild(row);
    });
}


/* ==========================================
   PLACE ORDER
========================================== */

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

    if(blockedShopIds.size > 0){
        alert("One or more shops in your cart are outside our current delivery area for your location. Please update your address or remove those items.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Placing Order...";

    try {

        // Rebuild in case the cart changed since page load, or the
        // initial build failed (e.g. transient network error).
        const shopGroups = await buildShopGroups(cart);

        if(shopGroups.length === 0){
            alert("These products are no longer available.");
            btn.disabled = false;
            btn.innerText = "Place Order";
            return;
        }

        const placedOrders = [];

        for(const group of shopGroups){

            const items = group.items;
            const shop = group.shop;

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

            // Only compute/store an estimate when both ends of the line
            // are actually known — never guess or fake a distance.
            let estimatedDistanceKm = null;
            let distanceCalculatedAt = null;

            if(shop && shop.latitude != null && shop.longitude != null &&
               customerLatitude != null && customerLongitude != null){

                estimatedDistanceKm = Math.round(
                    haversineDistanceKm(customerLatitude, customerLongitude, shop.latitude, shop.longitude) * 10
                ) / 10;
                distanceCalculatedAt = new Date().toISOString();
            }

            const order = await dbSaveOrder({
                shop_id: group.shopId,
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
                tehsil_id: shop ? shop.tehsil_id : null,
                delivery_status: "unassigned",

                // Location snapshot — see migration 005. pickup_* comes
                // from the shop at the moment of order creation (not
                // recalculated later, even if the shop later moves);
                // delivery_* comes from the customer's confirmed location
                // for THIS order (not their saved profile, which may
                // change afterwards).
                pickup_latitude: shop ? shop.latitude : null,
                pickup_longitude: shop ? shop.longitude : null,
                delivery_latitude: customerLatitude,
                delivery_longitude: customerLongitude,
                estimated_distance_km: estimatedDistanceKm,
                distance_calculated_at: distanceCalculatedAt
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
