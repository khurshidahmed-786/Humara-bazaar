/* ==========================================================
   HAMARA BAZAAR — RIDER SYSTEM
   Final production RPC helpers
   ========================================================== */

async function dbRiderV2SetAvailability(available) {
    const {data,error}=await sb.rpc("fn_set_rider_availability",{p_available:Boolean(available)});
    if(error) throw error; return data;
}
async function dbRiderV2GetAvailableOrders(limit=20) {
    const {data,error}=await sb.rpc("fn_get_available_rider_orders",{p_limit:limit});
    if(error) throw error; return Array.isArray(data)?data:[];
}
async function dbRiderV2AcceptOrder(orderId) {
    const {data,error}=await sb.rpc("fn_rider_accept_order",{p_order_id:Number(orderId)});
    if(error) throw error; return data;
}
async function dbRiderV2GetActiveTrip() {
    const {data,error}=await sb.rpc("fn_rider_get_active_trip_summary");
    if(error) throw error;
    if(data?.trip_id) return data;
    const fallback=await sb.rpc("fn_get_rider_active_trip");
    if(fallback.error) throw fallback.error;
    return fallback.data||{trip_id:null,orders:[]};
}
async function dbRiderV2GetTripCandidates(tripId) {
    const {data,error}=await sb.rpc("fn_rider_get_trip_candidates",{p_trip_id:Number(tripId)});
    if(error) throw error; return Array.isArray(data)?data:[];
}
async function dbRiderV2AddOrderToTrip(tripId,orderId) {
    const {data,error}=await sb.rpc("fn_rider_add_order_to_trip",{p_trip_id:Number(tripId),p_order_id:Number(orderId)});
    if(error) throw error; return data;
}
async function dbRiderV2Pickup(orderId) {
    const {data,error}=await sb.rpc("fn_rider_mark_picked_up",{p_order_id:Number(orderId)});
    if(error) throw error; return data;
}
async function dbRiderV2OutForDelivery(orderId) {
    const {data,error}=await sb.rpc("fn_rider_mark_out_for_delivery",{p_order_id:Number(orderId)});
    if(error) throw error; return data;
}
async function dbRiderV2VerifyPin(orderId,pin) {
    const {data,error}=await sb.rpc("fn_rider_verify_delivery_pin",{p_order_id:Number(orderId),p_pin:String(pin)});
    if(error) throw error; return data;
}
async function dbRiderV2CompleteDelivery(orderId,paymentMethod,amountCollected=0) {
    const {data,error}=await sb.rpc("fn_rider_complete_delivery",{p_order_id:Number(orderId),p_payment_method:paymentMethod,p_amount_collected:Number(amountCollected)||0});
    if(error) throw error; return data;
}
async function dbRiderV2ReportIssue(orderId,issueType,description="") {
    const {data,error}=await sb.rpc("fn_rider_report_delivery_issue",{p_order_id:Number(orderId),p_issue_type:issueType,p_description:description||null});
    if(error) throw error; return data;
}
async function dbRiderV2Stats() {
    const {data,error}=await sb.rpc("fn_get_rider_dashboard_stats");
    if(error) throw error; return data||{};
}
async function dbRiderV2History(limit=50) {
    const {data,error}=await sb.rpc("fn_get_rider_delivery_history",{p_limit:limit});
    if(error) throw error; return Array.isArray(data)?data:[];
}
async function dbRiderV2SubmitCOD(amount,notes="") {
    const {data,error}=await sb.rpc("fn_rider_submit_cod",{p_submitted_amount:Number(amount)||0,p_notes:notes||null});
    if(error) throw error; return data;
}
/* ==========================================================
   RIDER V4 — helper additions
   Replace js/rider.js with this file if your current rider.js
   does not already contain these functions.
   ========================================================== */

async function dbRiderV4FinancialSummary(){
    const {data,error}=await sb.rpc("fn_rider_financial_summary");
    if(error)throw error;
    return data||{};
}

async function dbRiderV4Earnings(period="all",limit=100){
    const {data,error}=await sb.rpc("fn_rider_earnings_report",{
        p_period:period,
        p_limit:Number(limit)||100
    });
    if(error)throw error;
    return Array.isArray(data)?data:[];
}

async function dbAdminUpdateDeliveryIssue(issueId,status,notes=""){
    const {data,error}=await sb.rpc("fn_admin_update_delivery_issue",{
        p_issue_id:Number(issueId),
        p_status:String(status),
        p_notes:notes||null
    });
    if(error)throw error;
    return data;
}

async function dbAdminPayRiderSettlement(settlementId,reference,notes=""){
    const {data,error}=await sb.rpc("fn_admin_pay_rider_settlement",{
        p_settlement_id:Number(settlementId),
        p_payment_reference:String(reference),
        p_notes:notes||null
    });
    if(error)throw error;
    return data;
}
