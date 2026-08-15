/* ==========================================================
   HAMARA BAZAAR — RIDER DB HELPERS
   Production V2
   ========================================================== */

async function dbRiderV2SetAvailability(available) {
    const { data, error } = await sb.rpc("fn_set_rider_availability", {
        p_available: Boolean(available)
    });

    if (error) throw error;
    return data;
}

async function dbRiderV2GetAvailableOrders(limit = 20) {
    const { data, error } = await sb.rpc("fn_get_available_rider_orders", {
        p_limit: limit
    });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function dbRiderV2AcceptOrder(orderId) {
    const { data, error } = await sb.rpc("fn_rider_accept_order", {
        p_order_id: Number(orderId)
    });

    if (error) throw error;
    return data;
}

async function dbRiderV2GetActiveTrip() {
    const { data, error } = await sb.rpc("fn_get_rider_active_trip");

    if (error) throw error;
    return data || { trip_id: null, orders: [] };
}

async function dbRiderV2Pickup(orderId) {
    const { data, error } = await sb.rpc("fn_rider_mark_picked_up", {
        p_order_id: Number(orderId)
    });

    if (error) throw error;
    return data;
}

async function dbRiderV2OutForDelivery(orderId) {
    const { data, error } = await sb.rpc("fn_rider_mark_out_for_delivery", {
        p_order_id: Number(orderId)
    });

    if (error) throw error;
    return data;
}

async function dbRiderV2VerifyPin(orderId, pin) {
    const { data, error } = await sb.rpc("fn_rider_verify_delivery_pin", {
        p_order_id: Number(orderId),
        p_pin: String(pin)
    });

    if (error) throw error;
    return data;
}

async function dbRiderV2CompleteDelivery(
    orderId,
    paymentMethod,
    amountCollected = 0
) {
    const { data, error } = await sb.rpc("fn_rider_complete_delivery", {
        p_order_id: Number(orderId),
        p_payment_method: paymentMethod,
        p_amount_collected: Number(amountCollected) || 0
    });

    if (error) throw error;
    return data;
}

async function dbRiderV2ReportIssue(
    orderId,
    issueType,
    description = ""
) {
    const { data, error } = await sb.rpc(
        "fn_rider_report_delivery_issue",
        {
            p_order_id: Number(orderId),
            p_issue_type: issueType,
            p_description: description || null
        }
    );

    if (error) throw error;
    return data;
}

async function dbRiderV2Stats() {
    const { data, error } = await sb.rpc(
        "fn_get_rider_dashboard_stats"
    );

    if (error) throw error;
    return data || {};
}

async function dbRiderV2History(limit = 50) {
    const { data, error } = await sb.rpc(
        "fn_get_rider_delivery_history",
        {
            p_limit: limit
        }
    );

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}
