/* CUSTOMER ORDERS — DELIVERY TRACKING + PIN */
document.addEventListener("DOMContentLoaded",async function(){const user=await authGetCurrentUser();if(!user){alert("Please login to view your orders.");window.location.href="login.html";return;}await renderOrders(user.id);});

async function getCustomerDeliveryPin(orderId){const{data,error}=await sb.rpc("fn_customer_get_delivery_pin",{p_order_id:Number(orderId)});if(error)throw error;return data||{available:false};}
function escapeOrderHtml(v){const e=document.createElement("div");e.textContent=v==null?"":String(v);return e.innerHTML;}
function deliveryLabel(o){return({unassigned:"Waiting for rider",assigned:"Rider assigned",picked_up:"Picked up",out_for_delivery:"Out for delivery",delivered:"Delivered",delivery_attention_required:"Delivery needs attention"})[o.delivery_status]||o.delivery_status||"";}
function deliveryClass(s){return({assigned:"riderassigned",picked_up:"pickedup",out_for_delivery:"outfordelivery",delivered:"delivered",delivery_attention_required:"attention"})[s]||"";}

async function deliverySection(order){
  if(order.delivery_status==="delivered"){return `<div class="deliveryProgress deliveryCompleted"><div class="deliveryProgressHeader"><strong>Delivery</strong><span class="deliveryProgressStatus delivered">Delivered</span></div><div class="deliveryCompletedMessage">✅ Your order has been delivered.</div></div>`;}
  if(order.delivery_status!=="out_for_delivery")return "";
  try{
    const r=await getCustomerDeliveryPin(order.id);
    if(!r.available||!r.pin)return `<div class="deliveryPinCard deliveryPinWaiting"><div class="deliveryPinIcon">🔐</div><div class="deliveryPinBody"><strong>Your delivery PIN is being prepared</strong><p>Please check this order again shortly.</p></div></div>`;
    return `<div class="deliveryPinCard"><div class="deliveryPinHeader"><div><div class="deliveryPinEyebrow">DELIVERY PIN</div><h3>Give this PIN to your rider</h3></div><div class="deliveryPinLock">🔐</div></div><div class="deliveryPinDigits">${String(r.pin).split("").map(d=>`<span>${escapeOrderHtml(d)}</span>`).join("")}</div><p class="deliveryPinWarning">Only share this PIN when the rider is physically delivering your order.</p></div>`;
  }catch(e){console.error(e);return `<div class="deliveryPinCard deliveryPinWaiting"><div class="deliveryPinIcon">🔐</div><div class="deliveryPinBody"><strong>Delivery PIN unavailable right now</strong><p>Please refresh this order shortly.</p></div></div>`;}
}

function progress(order){const s=order.delivery_status||"";if(!s)return "";return `<div class="deliveryProgress"><div class="deliveryProgressHeader"><strong>Delivery</strong><span class="deliveryProgressStatus ${deliveryClass(s)}">${escapeOrderHtml(deliveryLabel(order))}</span></div><div class="deliveryProgressSteps"><div class="deliveryStep ${["assigned","picked_up","out_for_delivery","delivered"].includes(s)?"done":""}"><span>✓</span><small>Rider</small></div><div class="deliveryStep ${["picked_up","out_for_delivery","delivered"].includes(s)?"done":""}"><span>✓</span><small>Picked up</small></div><div class="deliveryStep ${["out_for_delivery","delivered"].includes(s)?"done":""}"><span>✓</span><small>On the way</small></div><div class="deliveryStep ${s==="delivered"?"done":""}"><span>✓</span><small>Delivered</small></div></div></div>`;}

async function orderCard(order){
 const items=(order.items||[]).map(i=>`<div class="itemRow"><span>${escapeOrderHtml(i.emoji||"📦")} ${escapeOrderHtml(i.name)}</span><span>x${escapeOrderHtml(i.quantity)}</span></div>`).join("");
 return `<div class="orderCard"><div class="orderTop"><div><div class="orderNumber">Order #${String(order.id).padStart(4,"0")}</div><div class="orderDate">${new Date(order.created_at).toLocaleString()}</div></div><div class="status ${escapeOrderHtml(String(order.status||"").toLowerCase().replace(/\s/g,""))}">${escapeOrderHtml(order.status)}</div></div>${progress(order)}${await deliverySection(order)}<div class="productsBox"><h4>Products</h4>${items}</div><div class="billBox"><div><span>Products</span><span>₹${escapeOrderHtml(order.subtotal)}</span></div><div><span>Delivery</span><span>₹${escapeOrderHtml(order.delivery)}</span></div><div class="totalRow"><span>Total</span><span>₹${escapeOrderHtml(order.total)}</span></div></div></div>`;
}

async function renderOrders(customerId){
 const activeWrap=document.getElementById("activeOrders"),historyWrap=document.getElementById("historyOrders");activeWrap.innerHTML="";historyWrap.innerHTML="";
 let orders=[];try{orders=await dbGetOrdersByCustomer(customerId);}catch(e){console.error(e);activeWrap.innerHTML='<div class="emptyBox"><p>Failed to load orders.</p></div>';return;}
 if(!orders.length){activeWrap.innerHTML='<div class="emptyBox"><div class="emptyIcon">📦</div><h2>No Orders Yet</h2><p>Your placed orders will appear here.</p><a href="home.html" class="shopBtn">Continue Shopping</a></div>';return;}
 const active=orders.filter(o=>o.status!=="Delivered"&&o.status!=="Cancelled"&&o.delivery_status!=="delivered");
 activeWrap.innerHTML=`<div class="summaryCard"><h2>📦 My Orders</h2><p>${active.length} Active Order(s)</p></div>`;
 const cards=await Promise.all(orders.map(orderCard));
 orders.forEach((o,i)=>{if(o.status==="Delivered"||o.status==="Cancelled"||o.delivery_status==="delivered")historyWrap.innerHTML+=cards[i];else activeWrap.innerHTML+=cards[i];});
}
