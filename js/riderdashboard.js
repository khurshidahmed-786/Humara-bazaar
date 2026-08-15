/* ==========================================================
   HAMARA BAZAAR — RIDER DASHBOARD
   Operations release: active trip + same-route additions + COD
   ========================================================== */

let riderV2Profile = null;
let riderV2Shops = {};
let riderV2ActiveTrip = { trip_id:null, orders:[] };

const r2$ = id => document.getElementById(id);

function r2escape(value){
    const el=document.createElement("div");
    el.textContent=value==null?"":String(value);
    return el.innerHTML;
}

function r2open(html){
    r2$("riderV2Sheet").innerHTML=html;
    r2$("riderV2Backdrop").style.display="flex";
}

function r2close(){
    r2$("riderV2Backdrop").style.display="none";
    r2$("riderV2Sheet").innerHTML="";
}

function r2maps(address){
    return "https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(address||"");
}

function r2tel(phone){ return `tel:${encodeURIComponent(phone||"")}`; }

async function r2shops(orders){
    const ids=[...new Set((orders||[]).map(o=>o.shop_id).filter(Boolean))];
    if(!ids.length || typeof dbGetShopsByIds!=="function") return {};
    try{
        const shops=await dbGetShopsByIds(ids);
        return Object.fromEntries((shops||[]).map(s=>[s.id,s]));
    }catch(e){
        console.warn("Shop lookup failed:",e);
        return {};
    }
}

function r2status(online){
    const el=r2$("riderV2Status");
    el.textContent=online?"ONLINE":"OFFLINE";
    el.className=`r2-status ${online?"online":""}`;
}

async function r2init(){
    r2$("riderV2Loading").style.display="none";
    let user=null;
    try{user=await authGetCurrentUser();}catch(e){console.error(e);}
    if(!user){location.href="login.html?redirect=riderdashboard.html";return;}

    try{riderV2Profile=await dbGetMyRiderApplication();}catch(e){console.error("Rider application:",e);}
    if(!riderV2Profile || riderV2Profile.status!=="approved"){
        r2$("riderV2Unauthorized").style.display="block";
        return;
    }

    r2$("riderV2App").style.display="block";
    r2$("riderV2Name").textContent=riderV2Profile.full_name||"";
    const online=riderV2Profile.availability==="online"||riderV2Profile.available===true;
    r2$("riderV2Availability").checked=online;
    r2status(online);

    r2$("riderV2Availability").addEventListener("change",async e=>{
        const desired=e.target.checked;
        e.target.disabled=true;
        try{
            await dbRiderV2SetAvailability(desired);
            riderV2Profile.availability=desired?"online":"offline";
            riderV2Profile.available=desired;
            r2status(desired);
            await r2refresh();
        }catch(error){
            e.target.checked=!desired;
            r2status(!desired);
            alert(error.message||"Could not update availability.");
        }finally{e.target.disabled=false;}
    });

    r2$("refreshRiderV2").onclick=r2refresh;
    r2$("openHistory").onclick=r2history;
    r2$("openCod").onclick=r2codSheet;
    r2$("riderV2Backdrop").addEventListener("click",e=>{
        if(e.target===r2$("riderV2Backdrop"))r2close();
    });

    await r2refresh();
}

async function r2refresh(){
    const [stats,active,available]=await Promise.allSettled([
        dbRiderV2Stats(),
        dbRiderV2GetActiveTrip(),
        dbRiderV2GetAvailableOrders(20)
    ]);

    const s=stats.status==="fulfilled"?stats.value:{};
    riderV2ActiveTrip=active.status==="fulfilled"
        ? active.value : {trip_id:null,orders:[]};
    const avail=available.status==="fulfilled"?available.value:[];

    r2$("statToday").textContent=s.today_delivered??0;
    r2$("statTodayEarn").textContent=`₹${Number(s.today_earnings||0)}`;
    r2$("statCod").textContent=`₹${Number(s.today_cod||0)}`;
    r2$("statActive").textContent=s.active_orders??0;

    riderV2Shops=await r2shops([
        ...(riderV2ActiveTrip.orders||[]),...avail
    ]);

    r2renderActive(riderV2ActiveTrip);
    r2renderTripCandidates(riderV2ActiveTrip);
    r2renderCodSummary(s);
    r2renderAvailable(avail);
}

function r2renderActive(trip){
    const container=r2$("riderV2Active");
    const orders=Array.isArray(trip?.orders)?trip.orders:[];

    if(!trip?.trip_id || !orders.length){
        container.innerHTML=`<div class="r2-card r2-empty">No active trip right now. Accept a delivery to start one.</div>`;
        return;
    }

    container.innerHTML=`
        <div class="r2-card">
            <div class="r2-order-head">
                <div>
                    <div class="r2-title">Trip #${r2escape(trip.trip_id)}</div>
                    <div class="r2-mini">${orders.length}/${Number(trip.max_orders||3)} orders · Trip earning ₹${Number(trip.trip_earnings||0)}</div>
                </div>
                <span class="r2-state">${r2escape(trip.status||"Active")}</span>
            </div>

            ${orders.map((order,index)=>r2tripOrderCard(order,index)).join("")}
        </div>
    `;

    container.querySelectorAll("[data-trip-action]").forEach(button=>{
        button.addEventListener("click",async()=>{
            const action=button.dataset.tripAction;
            const orderId=Number(button.dataset.orderId);
            button.disabled=true;
            try{
                if(action==="pickup") await dbRiderV2Pickup(orderId);
                if(action==="out") await dbRiderV2OutForDelivery(orderId);
                if(action==="deliver") r2deliverySheet(
                    orders.find(o=>Number(o.order_id)===orderId)
                );
                if(action==="issue") r2issueSheet(orderId);
                if(action!=="deliver" && action!=="issue") await r2refresh();
            }catch(e){
                alert(e.message||"Action failed.");
                button.disabled=false;
            }
        });
    });
}

function r2tripOrderCard(order,index){
    const shop=riderV2Shops[order.shop_id];
    const state=order.delivery_status;
    let action="";
    if(state==="assigned") action=`<button class="r2-btn primary" data-trip-action="pickup" data-order-id="${order.order_id}">📦 Picked Up</button>`;
    else if(state==="picked_up") action=`<button class="r2-btn primary" data-trip-action="out" data-order-id="${order.order_id}">🚴 Out for Delivery</button>`;
    else if(state==="out_for_delivery") action=`<button class="r2-btn primary" data-trip-action="deliver" data-order-id="${order.order_id}">✅ Confirm Delivery</button>`;
    const label={assigned:"Assigned",picked_up:"Picked Up",out_for_delivery:"Out for Delivery",delivered:"Delivered",delivery_attention_required:"Attention"}[state]||state;

    return `
        <article class="r2-order" style="margin-top:12px;">
            <div class="r2-order-head">
                <div>
                    <div class="r2-order-id">${index+1}. Order #${r2escape(order.order_id)}</div>
                    <div class="r2-mini">Your earning ₹${Number(order.rider_share||0)}</div>
                </div>
                <span class="r2-state">${r2escape(label)}</span>
            </div>

            <div class="r2-route">
                <div class="r2-route-row">
                    <span class="r2-dot"></span>
                    <div><div class="r2-label">Pickup</div><div class="r2-value">${r2escape(shop?.name||"Shop")}</div></div>
                </div>
                <div class="r2-line"></div>
                <div class="r2-route-row">
                    <span class="r2-dot to"></span>
                    <div>
                        <div class="r2-label">Customer</div>
                        <div class="r2-value">${r2escape(order.customer_name||"Customer")}</div>
                        <div class="r2-mini">${r2escape(order.customer_address||"Address unavailable")}</div>
                    </div>
                </div>
            </div>

            <div class="r2-meta">
                ${shop?.phone?`<a href="${r2tel(shop.phone)}">📞 Shop</a>`:""}
                ${order.customer_phone?`<a href="${r2tel(order.customer_phone)}">📞 Customer</a>`:""}
                <a href="${r2maps(order.customer_address)}" target="_blank" rel="noopener">🧭 Navigate</a>
            </div>

            <div class="r2-actions">
                ${action}
                ${state!=="delivered"?`<button class="r2-btn danger" data-trip-action="issue" data-order-id="${order.order_id}">⚠ Report Problem</button>`:""}
            </div>
        </article>
    `;
}

async function r2renderTripCandidates(trip){
    const container=r2$("riderV2TripCandidates");
    if(!trip?.trip_id){
        container.innerHTML="";
        return;
    }

    try{
        const candidates=await dbRiderV2GetTripCandidates(trip.trip_id);
        if(!candidates.length){
            container.innerHTML="";
            return;
        }

        container.innerHTML=`
            <div class="r2-section" style="margin-top:18px;">
                <h2>Fits This Trip</h2>
            </div>
            ${candidates.map(o=>`
                <article class="r2-order">
                    <div class="r2-order-head">
                        <div>
                            <div class="r2-order-id">Order #${r2escape(o.id)}</div>
                            <div class="r2-mini">${r2escape(o.customer_name||"Customer")}</div>
                        </div>
                        <span class="r2-state">Additional stop</span>
                    </div>

                    <div class="r2-route">
                        <div class="r2-route-row">
                            <span class="r2-dot"></span>
                            <div><div class="r2-label">Pickup</div><div class="r2-value">${r2escape(riderV2Shops[o.shop_id]?.name||"Shop")}</div></div>
                        </div>
                        <div class="r2-line"></div>
                        <div class="r2-route-row">
                            <span class="r2-dot to"></span>
                            <div><div class="r2-label">Customer</div><div class="r2-value">${r2escape(o.customer_name||"Customer")}</div><div class="r2-mini">${r2escape(o.customer_address||"Address unavailable")}</div></div>
                        </div>
                    </div>

                    <div class="r2-earn">
                        <span>Additional base earning</span>
                        <strong>₹20</strong>
                    </div>

                    <div class="r2-actions">
                        <button class="r2-btn primary" data-add-trip="${r2escape(o.id)}">Add to Trip</button>
                    </div>
                </article>
            `).join("");

        container.querySelectorAll("[data-add-trip]").forEach(btn=>{
            btn.onclick=async()=>{
                btn.disabled=true; btn.textContent="Adding…";
                try{
                    await dbRiderV2AddOrderToTrip(trip.trip_id,btn.dataset.addTrip);
                    await r2refresh();
                }catch(e){
                    alert(e.message||"This order could not be added to the trip.");
                    btn.disabled=false; btn.textContent="Add to Trip";
                }
            };
        });
    }catch(e){
        console.warn("Trip candidates failed:",e);
        container.innerHTML="";
    }
}

function r2renderCodSummary(stats){
    const cod=Number(stats.today_cod||0);
    const el=r2$("riderV2CodSummary");
    el.innerHTML=`
        <div class="r2-card">
            <div class="r2-earn">
                <span>COD collected today</span>
                <strong>₹${cod}</strong>
            </div>
            <div class="r2-note">
                COD cash is separate from your rider earnings. Submit collected cash to Tehsil Admin for reconciliation.
            </div>
        </div>
    `;
}

function r2issueSheet(orderId){
    const options=[
        ["customer_unavailable","Customer unavailable"],
        ["customer_refused","Customer refused"],
        ["wrong_address","Wrong address"],
        ["shop_not_ready","Shop not ready"],
        ["shop_closed","Shop closed"],
        ["customer_requested_reschedule","Customer requested reschedule"],
        ["vehicle_problem","Vehicle problem"],
        ["payment_problem","Payment problem"],
        ["damaged_order","Order damaged"],
        ["missing_item","Missing item"],
        ["other","Other"]
    ];

    r2open(`
        <div class="r2-sheet-head">
            <h3>Report Delivery Problem</h3>
            <button class="r2-close" onclick="r2close()">×</button>
        </div>
        <div class="r2-note">Tell Tehsil Admin what is preventing this delivery.</div>
        <div class="r2-issues" style="margin-top:12px;">
            ${options.map(([v,l])=>`<button class="r2-issue" data-issue="${v}">${l}</button>`).join("")}
        </div>
        <textarea id="r2IssueNote" class="r2-textarea" rows="4"
            placeholder="Add details (optional)"></textarea>
    `);

    document.querySelectorAll("[data-issue]").forEach(btn=>{
        btn.onclick=async()=>{
            btn.disabled=true;
            try{
                await dbRiderV2ReportIssue(
                    orderId,
                    btn.dataset.issue,
                    r2$("r2IssueNote").value.trim()
                );
                r2close();
                await r2refresh();
                alert("Problem reported to Tehsil Admin.");
            }catch(e){
                alert(e.message||"Could not report the problem.");
                btn.disabled=false;
            }
        };
    });
}

function r2deliverySheet(order){
    let paymentMethod="online_prepaid";
    if(!order)return;

    r2open(`
        <div class="r2-sheet-head"><h3>Complete Delivery</h3><button class="r2-close" onclick="r2close()">×</button></div>
        <div class="r2-note">Ask the customer for the 4-digit delivery PIN.</div>
        <div class="r2-pin">${[0,1,2,3].map(i=>`<input maxlength="1" inputmode="numeric" data-pin="${i}">`).join("")}</div>
        <button class="r2-btn primary" id="r2VerifyPin" style="width:100%;">Verify PIN</button>
        <div id="r2PinMessage" class="r2-note"></div>

        <div id="r2PaymentStep" style="display:none;margin-top:18px;">
            <h3>Payment</h3>
            <div class="r2-payment">
                <button data-pay="online_prepaid" class="selected"><strong>✅ Paid Online</strong><span>No cash to collect</span></button>
                <button data-pay="cod"><strong>💵 COD</strong><span>Collect cash</span></button>
            </div>
            <div id="r2CodBox" class="r2-amount" style="display:none;">
                <label for="r2CodAmount">Cash collected</label>
                <input id="r2CodAmount" type="number" min="0" step="0.01" value="${Number(order.total||0)}">
                <div class="r2-note">Expected amount: ₹${Number(order.total||0)}</div>
            </div>
            <button id="r2Complete" class="r2-btn primary" style="width:100%;margin-top:14px;">Confirm Delivery</button>
        </div>
    `);

    const pinInputs=[...document.querySelectorAll("[data-pin]")];
    pinInputs.forEach((input,index)=>{
        input.addEventListener("input",()=>{
            input.value=input.value.replace(/\D/g,"").slice(0,1);
            if(input.value&&pinInputs[index+1])pinInputs[index+1].focus();
        });
    });
    pinInputs[0]?.focus();

    r2$("r2VerifyPin").onclick=async()=>{
        const pin=pinInputs.map(x=>x.value).join("");
        if(!/^\d{4}$/.test(pin)){
            r2$("r2PinMessage").textContent="Enter all 4 digits.";
            return;
        }
        const btn=r2$("r2VerifyPin");
        btn.disabled=true; btn.textContent="Checking…";
        try{
            const result=await dbRiderV2VerifyPin(order.order_id,pin);
            if(!result?.verified){
                r2$("r2PinMessage").textContent=result?.locked
                    ?"Too many incorrect attempts. Contact Tehsil Admin."
                    :`Incorrect PIN. Attempts remaining: ${result?.attempts_remaining??0}`;
                btn.disabled=false; btn.textContent="Verify PIN"; return;
            }
            r2$("r2PinMessage").textContent="PIN verified ✓";
            r2$("r2PaymentStep").style.display="block";
            btn.textContent="PIN Verified";
        }catch(e){
            r2$("r2PinMessage").textContent=e.message||"Verification failed.";
            btn.disabled=false; btn.textContent="Verify PIN";
        }
    };

    document.querySelectorAll("[data-pay]").forEach(button=>{
        button.onclick=()=>{
            paymentMethod=button.dataset.pay;
            document.querySelectorAll("[data-pay]").forEach(b=>b.classList.toggle("selected",b===button));
            r2$("r2CodBox").style.display=paymentMethod==="cod"?"block":"none";
        };
    });

    r2$("r2Complete").onclick=async()=>{
        const amount=paymentMethod==="cod"?Number(r2$("r2CodAmount").value||0):0;
        const btn=r2$("r2Complete");
        btn.disabled=true; btn.textContent="Completing…";
        try{
            await dbRiderV2CompleteDelivery(order.order_id,paymentMethod,amount);
            r2close();
            await r2refresh();
            alert("Delivery completed successfully.");
        }catch(e){
            alert(e.message||"Delivery could not be completed.");
            btn.disabled=false; btn.textContent="Confirm Delivery";
        }
    };
}

function r2codSheet(){
    r2open(`
        <div class="r2-sheet-head"><h3>Submit COD</h3><button class="r2-close" onclick="r2close()">×</button></div>
        <div class="r2-note">Enter the cash amount you are handing to Tehsil Admin. The system will compare it with outstanding COD collections.</div>
        <div class="r2-amount" style="margin-top:16px;">
            <label for="r2SubmitCodAmount">Amount submitted</label>
            <input id="r2SubmitCodAmount" type="number" min="0" step="0.01" placeholder="₹0">
        </div>
        <textarea id="r2CodNote" class="r2-textarea" rows="3" placeholder="Optional note"></textarea>
        <button id="r2SubmitCodBtn" class="r2-btn primary" style="width:100%;margin-top:12px;">Submit COD</button>
    `);

    r2$("r2SubmitCodBtn").onclick=async()=>{
        const amount=Number(r2$("r2SubmitCodAmount").value||0);
        if(amount<=0){alert("Enter the amount submitted.");return;}
        const btn=r2$("r2SubmitCodBtn");
        btn.disabled=true; btn.textContent="Submitting…";
        try{
            const result=await dbRiderV2SubmitCOD(amount,r2$("r2CodNote").value.trim());
            r2close();
            await r2refresh();
            alert(`COD submission #${result.submission_id} created.`);
        }catch(e){
            alert(e.message||"COD submission failed.");
            btn.disabled=false; btn.textContent="Submit COD";
        }
    };
}

function r2history(){
    dbRiderV2History(50).then(history=>{
        r2open(`
            <div class="r2-sheet-head"><h3>Delivery History</h3><button class="r2-close" onclick="r2close()">×</button></div>
            <div style="margin-top:10px;">
                ${history.length?history.map(item=>`
                    <div class="r2-history">
                        <div>
                            <strong>Order #${r2escape(item.order_id)}</strong>
                            <span>${r2escape(item.customer_name||"Customer")}</span>
                            <span>${r2escape(item.customer_address||"")}</span>
                            <span>${item.delivered_at?new Date(item.delivered_at).toLocaleString():""}</span>
                            <span>${r2escape(item.delivered_payment_method||"")}${item.delivered_payment_method==="cod"?` · COD ₹${Number(item.delivered_amount_collected||0)}`:""}</span>
                        </div>
                        <div class="r2-history-earn">₹${Number(item.rider_share||0)}</div>
                    </div>
                `).join(""):`<div class="r2-empty">No completed deliveries yet.</div>`}
            </div>
        `);
    }).catch(e=>alert(e.message||"Could not load history."));
}

document.addEventListener("DOMContentLoaded",r2init);
window.r2close=r2close;
