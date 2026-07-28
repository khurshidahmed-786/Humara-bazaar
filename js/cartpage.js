const DELIVERY_FEE_PER_SHOP = 30;


document.addEventListener("DOMContentLoaded", function(){
    renderCart();
});


async function renderCart(){

    const app = document.getElementById("cartApp");
    const cart = getCart();

    if(cart.length === 0){
        app.innerHTML = `
            <div class="emptyCart">
                <div style="font-size:80px;">🛒</div>
                <h2>Your Cart is Empty</h2>
                <p>Add products from your favourite shops.</p>
                <a href="home.html">Continue Shopping</a>
            </div>
        `;
        return;
    }

    app.innerHTML = `<div class="container"><h2>🛒 Your Cart</h2><div id="cartGroups"></div></div>`;

    const groupsWrap = document.getElementById("cartGroups");
    groupsWrap.innerHTML = `<p style="padding:20px 0; color:#777;">Loading your cart...</p>`;


    /* FETCH REAL PRODUCT DATA FOR EVERY CART ITEM */

    const enrichedItems = [];

    for(const item of cart){
        const product = await dbGetProductById(item.productId);
        if(product){
            enrichedItems.push({ ...item, product });
        }
    }

    if(enrichedItems.length === 0){
        groupsWrap.innerHTML = `<p style="padding:20px 0; color:#777;">These products are no longer available.</p>`;
        return;
    }


    /* GROUP BY SHOP — each shop becomes its own mini-order at checkout */

    const shopGroups = {};

    enrichedItems.forEach(item => {
        const shopId = item.product.shop_id;
        if(!shopGroups[shopId]) shopGroups[shopId] = [];
        shopGroups[shopId].push(item);
    });

    const shopIds = Object.keys(shopGroups);
    const shops = await dbGetShopsByIds(shopIds);
    const shopMap = {};
    shops.forEach(s => { shopMap[s.id] = s; });


    let grandTotal = 0;
    let html = "";

    for(const shopId of shopIds){

        const items = shopGroups[shopId];
        const shopName = shopMap[shopId] ? shopMap[shopId].name : "Shop";

        let shopSubtotal = 0;

        let itemsHtml = "";

        items.forEach(item => {

            const subtotal = item.product.price * item.quantity;
            shopSubtotal += subtotal;

            itemsHtml += `
                <div class="cartCard">
                    <div class="cartTop">
                        <div style="display:flex; gap:10px; align-items:center;">
                            ${
                                item.product.image
                                ? `<img src="${item.product.image}" alt="${item.product.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;">`
                                : `<span style="font-size:28px;">${item.product.emoji || "📦"}</span>`
                            }
                            <div>
                                <div class="cartName">${item.product.name}</div>
                            </div>
                        </div>
                        <div class="cartPrice">₹${item.product.price}</div>
                    </div>
                    <div class="qtyRow">
                        <button class="qtyBtn" onclick="changeQty(${item.product.id},-1)">−</button>
                        <div class="qtyNumber">${item.quantity}</div>
                        <button class="qtyBtn" onclick="changeQty(${item.product.id},1)">+</button>
                    </div>
                    <div style="margin-top:18px;">Subtotal : <b>₹${subtotal}</b></div>
                    <button class="removeBtn" onclick="deleteCartItem(${item.product.id})">🗑 Remove</button>
                </div>
            `;
        });

        const shopTotal = shopSubtotal + DELIVERY_FEE_PER_SHOP;
        grandTotal += shopTotal;

        html += `
            <div style="margin-bottom:24px;">
                <div style="font-weight:bold; color:#345D2A; padding:10px 0; font-size:15px;">
                    🏪 ${shopName}
                </div>
                ${itemsHtml}
                <div class="summary">
                    <div class="summaryRow"><span>Items Total</span><span>₹${shopSubtotal}</span></div>
                    <div class="summaryRow"><span>Delivery</span><span>₹${DELIVERY_FEE_PER_SHOP}</span></div>
                    <hr style="margin:12px 0;">
                    <div class="summaryRow summaryTotal"><span>Shop Total</span><span>₹${shopTotal}</span></div>
                </div>
            </div>
        `;
    }

    html += `
        <div class="summary" style="border:2px solid #345D2A;">
            <div class="summaryRow summaryTotal"><span>Grand Total</span><span>₹${grandTotal}</span></div>
            ${
                shopIds.length > 1
                ? `<p style="font-size:12px; color:#888; margin-top:8px;">Your order will be split into ${shopIds.length} separate orders, one per shop.</p>`
                : ""
            }
            <button class="checkoutBtn" onclick="location.href='checkout.html'">Proceed to Checkout →</button>
        </div>
    `;

    groupsWrap.innerHTML = html;
}


function changeQty(productId, change){

    const cart = getCart();
    const item = cart.find(i => i.productId == productId);

    if(!item) return;

    item.quantity += change;

    if(item.quantity < 1){
        deleteCartItem(productId);
        return;
    }

    saveCart(cart);
    renderCart();
}


function deleteCartItem(productId){
    removeFromCart(productId);
    renderCart();
}
