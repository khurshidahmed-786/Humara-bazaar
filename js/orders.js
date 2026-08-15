document.addEventListener("DOMContentLoaded", async function () {
    const user = await authGetCurrentUser();
    if(!user){ alert("Please login to view your orders."); window.location.href="login.html"; return; }
    await renderOrders(user.id);
});

async function getCustomerDeliveryPin(orderId){
    const {data,error}=await sb.rpc("fn_customer_get_delivery_pin",{p_order_id:Number(orderId)});
    if(error) throw error;
    return data || {available:false};
}

function escapeOrderHtml(value){
    const el=document.createElement("div");
    el.textContent=value==null?"":String(value);
    return el.innerHTML;
}

function getDeliveryLabel(order){
    const m={
        unassigned:"Waiting for rider",
        assigned:"Rider assigned",
        picked_up:"Picked up",
        out_for_delivery:"Out for delivery",
        delivered:"Delivered",
        delivery_attention_required:"Delivery needs attention"
    };
    return m[order.delivery_status] || order.delivery_status || "";
}

function getDeliveryClass(status){
    return ({
        assigned:"riderassigned",
        picked_up:"pickedup",
        out_for_delivery:"outfordelivery",
        delivered:"delivered",
        delivery_attention_required:"attention"
    })[status] || "";
}

async function createDeliverySection(order){
    if(order.delivery_status!=="out_for_delivery") return "";
    try{
        const result=await getCustomerDeliveryPin(order.id);
        if(!result.available || !result.pin){
            return `<div class="deliveryPinCard deliveryPinWaiting"><div class="deliveryPinIcon">🔐</div><div class="deliveryPinBody"><strong>Your delivery PIN is being prepared</strong><p>Please check this order again shortly.</p></div></div>`;
        }
        return `<div class="deliveryPinCard">
            <div class="deliveryPinHeader">
                <div><div class="deliveryPinEyebrow">DELIVERY PIN</div><h3>Give this PIN to your rider</h3></div>
                <div class="deliveryPinLock">🔐</div>
            </div>
            <div class="deliveryPinDigits">${String(result.pin).split("").map(d=>`<span>${escapeOrderHtml(d)}</span>`).join("")}</div>
            <p class="deliveryPinWarning">Only share this PIN when the rider is physically delivering your order.</p>
        </div>`;
    }catch(err){
        console.error("Delivery PIN loading failed:",err);
        return `<div class="deliveryPinCard deliveryPinWaiting"><div class="deliveryPinIcon">🔐</div><div class="deliveryPinBody"><strong>Delivery PIN unavailable right now</strong><p>Please refresh this order shortly.</p></div></div>`;
    }
}

async function createOrderCard(order){
    const itemsHTML=(order.items||[]).map(item=>`<div class="itemRow"><span>${escapeOrderHtml(item.emoji||"📦")} ${escapeOrderHtml(item.name)}</span><span>x${escapeOrderHtml(item.quantity)}</span></div>`).join("");
    const deliverySection=await createDeliverySection(order);
    const ds=order.delivery_status||"";
    const label=getDeliveryLabel(order);
    const dclass=getDeliveryClass(ds);

    const deliveryProgress=ds && ds!=="delivered"?`<div class="deliveryProgress">
        <div class="deliveryProgressHeader"><strong>Delivery</strong><span class="deliveryProgressStatus ${dclass}">${escapeOrderHtml(label)}</span></div>
        <div class="deliveryProgressSteps">
            <div class="deliveryStep ${["assigned","picked_up","out_for_delivery","delivered"].includes(ds)?"done":""}"><span>✓</span><small>Rider</small></div>
            <div class="deliveryStep ${["picked_up","out_for_delivery","delivered"].includes(ds)?"done":""}"><span>✓</span><small>Picked up</small></div>
            <div class="deliveryStep ${["out_for_delivery","delivered"].includes(ds)?"done":""}"><span>✓</span><small>On the way</small></div>
            <div class="deliveryStep ${ds==="delivered"?"done":""}"><span>✓</span><small>Delivered</small></div>
        </div>
    </div>`:"";

    return `<div class="orderCard">
        <div class="orderTop">
            <div><div class="orderNumber">Order #${String(order.id).padStart(4,"0")}</div><div class="orderDate">${new Date(order.created_at).toLocaleString()}</div></div>
            <div class="status ${escapeOrderHtml(order.status.toLowerCase().replace(/\s/g,''))}">${escapeOrderHtml(order.status)}</div>
        </div>
        ${deliveryProgress}
        ${deliverySection}
        <div class="productsBox"><h4>Products</h4>${itemsHTML}</div>
        <div class="billBox"><div><span>Products</span><span>₹${escapeOrderHtml(order.subtotal)}</span></div><div><span>Delivery</span><span>₹${escapeOrderHtml(order.delivery)}</span></div><div class="totalRow"><span>Total</span><span>₹${escapeOrderHtml(order.total)}</span></div></div>
    </div>`;
}

async function renderOrders(customerId){
    const activeWrap=document.getElementById("activeOrders"), historyWrap=document.getElementById("historyOrders");
    activeWrap.innerHTML=""; historyWrap.innerHTML="";
    let orders=[];
    try{ orders=await dbGetOrdersByCustomer(customerId); }
    catch(err){ console.error(err); activeWrap.innerHTML=`<div class="emptyBox"><p>Failed to load orders.</p></div>`; return; }

    if(orders.length===0){
        activeWrap.innerHTML=`<div class="emptyBox"><div class="emptyIcon">📦</div><h2>No Orders Yet</h2><p>Your placed orders will appear here.</p><a href="home.html" class="shopBtn">Continue Shopping</a></div>`;
        return;
    }

    const activeCount=orders.filter(o=>o.status!=="Delivered"&&o.status!=="Cancelled").length;
    activeWrap.innerHTML=`<div class="summaryCard"><h2>📦 My Orders</h2><p>${activeCount} Active Order(s)</p></div>`;

    const cards=await Promise.all(orders.map(createOrderCard));
    orders.forEach((order,i)=>{
        if(order.status==="Delivered"||order.status==="Cancelled") historyWrap.innerHTML+=cards[i];
        else activeWrap.innerHTML+=cards[i];
    });
}
