/* ==========================================================
   HAMARA BAZAAR — DELIVERY PRICING ENGINE

   Single source of truth for delivery charges & the rider's cut.
   Include this BEFORE any script that computes or displays a
   delivery fee: checkout.js, db.js, tehsiladmin.js, riderdashboard.js.

   ---- THE MODEL ----
   Customer pays:  base + distance + off-hour (if any) + rain (if any)
   Rider earns:    baseCut + distanceCut + off-hour cut + rain cut
   Platform keeps: the difference

   Distance is entered manually by whoever assigns the rider
   (Tehsil Admin, at dispatch time) — see dbAssignRiderToOrder /
   dbSetOrderDeliveryPricing in db.js.

   Off-hours and rain are both evaluated at DISPATCH time (when the
   order is assigned to a rider), not at checkout, since that's
   when a rider is actually being sent out into the conditions.

   ⚠️ Assumptions made where you didn't give an exact number —
   change these two constants any time, nothing else needs updating:
     - RAIN_SURCHARGE / RAIN_SURCHARGE_RIDER_CUT (defaulted to match
       the off-hour amount: ₹20 / ₹15)
     - OFF_HOUR_START_HOUR / OFF_HOUR_END_HOUR (defaulted to 9 PM–7 AM)
   ========================================================== */


const DELIVERY_BASE_FEE = 40;
const DELIVERY_BASE_RIDER_CUT = 30;

const DELIVERY_PER_KM_FEE = 10;
const DELIVERY_PER_KM_RIDER_CUT = 7;

const OFF_HOUR_SURCHARGE = 20;
const OFF_HOUR_SURCHARGE_RIDER_CUT = 15;

const RAIN_SURCHARGE = 20;              /* ⚠️ assumed amount */
const RAIN_SURCHARGE_RIDER_CUT = 15;    /* ⚠️ assumed amount */

const OFF_HOUR_START_HOUR = 21;  /* 9 PM  ⚠️ assumed window */
const OFF_HOUR_END_HOUR = 7;     /* 7 AM  ⚠️ assumed window */


/* ----------------------------------------
   Is a given moment inside the off-hour window?
   Handles the overnight wrap (21:00 -> 07:00).
---------------------------------------- */

function isOffHourTime(date){

    const d = date instanceof Date ? date : new Date(date);
    const hour = d.getHours();

    if(OFF_HOUR_START_HOUR > OFF_HOUR_END_HOUR){
        /* overnight window, e.g. 21 -> 7 */
        return hour >= OFF_HOUR_START_HOUR || hour < OFF_HOUR_END_HOUR;
    }

    return hour >= OFF_HOUR_START_HOUR && hour < OFF_HOUR_END_HOUR;
}


/* ----------------------------------------
   Full fee breakdown for one delivery.

   params:
     distanceKm  - number, entered at dispatch
     isRainy     - boolean, toggled at dispatch
     atTime      - Date to evaluate off-hours against (defaults to now,
                   i.e. the moment the rider is actually being dispatched)

   returns:
     { baseFee, distanceFee, offHourFee, rainFee, totalFee,
       riderPayout, platformCut, distanceKm, isRainy, isOffHour }
---------------------------------------- */

function computeDeliveryFee({ distanceKm = 0, isRainy = false, atTime = new Date() } = {}){

    const distance = Math.max(0, Number(distanceKm) || 0);
    const offHour = isOffHourTime(atTime);
    const rainy = !!isRainy;

    const baseFee = DELIVERY_BASE_FEE;
    const baseRiderCut = DELIVERY_BASE_RIDER_CUT;

    const distanceFee = Math.round(distance * DELIVERY_PER_KM_FEE);
    const distanceRiderCut = Math.round(distance * DELIVERY_PER_KM_RIDER_CUT);

    const offHourFee = offHour ? OFF_HOUR_SURCHARGE : 0;
    const offHourRiderCut = offHour ? OFF_HOUR_SURCHARGE_RIDER_CUT : 0;

    const rainFee = rainy ? RAIN_SURCHARGE : 0;
    const rainRiderCut = rainy ? RAIN_SURCHARGE_RIDER_CUT : 0;

    const totalFee = baseFee + distanceFee + offHourFee + rainFee;
    const riderPayout = baseRiderCut + distanceRiderCut + offHourRiderCut + rainRiderCut;
    const platformCut = totalFee - riderPayout;

    return {
        baseFee,
        distanceFee,
        offHourFee,
        rainFee,
        totalFee,
        riderPayout,
        platformCut,
        distanceKm: distance,
        isRainy: rainy,
        isOffHour: offHour
    };
}


/* ----------------------------------------
   Small HTML chip list for a fee breakdown,
   used on the rider dashboard / admin order cards.
---------------------------------------- */

function deliveryFeeBreakdownHTML(breakdown){

    const rows = [
        `Base ₹${breakdown.baseFee}`,
        breakdown.distanceFee > 0 ? `Distance (${breakdown.distanceKm}km) ₹${breakdown.distanceFee}` : null,
        breakdown.isOffHour ? `🌙 Off-hour +₹${breakdown.offHourFee}` : null,
        breakdown.isRainy ? `🌧 Rain +₹${breakdown.rainFee}` : null
    ].filter(Boolean);

    return rows.map(r => `<span class="feeChip">${r}</span>`).join("");
}
