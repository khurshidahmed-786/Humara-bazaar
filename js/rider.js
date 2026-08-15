/* ==========================================================
   HAMARA BAZAAR — PHASE 3 RIDER CORE DB HELPERS

   Uses secure Postgres RPCs. Keep this file after db.js so
   `sb` is already initialized.
   ========================================================== */

async function dbRiderSetAvailability(available) {
    const { data, error } = await sb.rpc("fn_set_rider_availability", {
        p_available: Boolean(available)
    });
    if (error) throw error;
    return data;
}

async function dbRiderGetAvailableOrders(limit = 20) {
    const { data, error } = await sb.rpc("fn_get_available_rider_orders", {
        p_limit: limit
    });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function dbRiderAcceptOrder(orderId) {
    const { data, error } = await sb.rpc("fn_rider_accept_order", {
        p_order_id: Number(orderId)
    });
    if (error) throw error;
    return data;
}

async function dbRiderGetActiveTrip() {
    const { data, error } = await sb.rpc("fn_get_rider_active_trip");
    if (error) throw error;
    return data || { trip_id: null, orders: [] };
}

async function dbRiderMarkPickedUp(orderId) {
    const { data, error } = await sb.rpc("fn_rider_mark_picked_up", {
        p_order_id: Number(orderId)
    });
    if (error) throw error;
    return data;
}
