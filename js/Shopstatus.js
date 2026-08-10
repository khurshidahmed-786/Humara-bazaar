/* ==========================================================
   HAMARA BAZAAR — SHOP STATUS UTILITIES

   Shared by index.js, shops.js, shop.js and dashboard.js.

   shop.open_time / shop.close_time are stored as 24-hour
   "HH:MM" strings (this is what <input type="time"> gives us).

   shop.manual_status is one of:
     "auto"   -> follow open_time/close_time            (default)
     "open"   -> force open regardless of the clock
     "closed" -> force closed regardless of the clock
                 (the "closed today" toggle in the dashboard)

   Include this file BEFORE any page script that calls these
   functions, e.g.:
       <script src="js/shopStatus.js"></script>
       <script src="js/shops.js"></script>
   ========================================================== */


/* ----------------------------------------
   IS THE SHOP OPEN RIGHT NOW?
---------------------------------------- */

function isShopOpenNow(shop){

    if(shop.manual_status === "closed") return false;
    if(shop.manual_status === "open") return true;

    /* No hours configured yet — don't falsely show "closed" */
    if(!shop.open_time || !shop.close_time) return true;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const openMinutes = timeStringToMinutes(shop.open_time);
    const closeMinutes = timeStringToMinutes(shop.close_time);

    if(openMinutes === null || closeMinutes === null) return true;

    if(openMinutes === closeMinutes){
        return true; // same open/close time = treated as 24 hours
    }

    if(openMinutes < closeMinutes){
        /* normal same-day range, e.g. 09:00 - 21:00 */
        return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
    }
    else{
        /* overnight range, e.g. 18:00 - 02:00 */
        return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
    }
}


/* ----------------------------------------
   BADGE HTML (used on shop cards)
---------------------------------------- */

function shopStatusBadgeHTML(shop){

    const open = isShopOpenNow(shop);

    return open
        ? `<span class="shopStatusBadge shopStatusOpen">🟢 Open</span>`
        : `<span class="shopStatusBadge shopStatusClosed">🔴 Closed</span>`;
}


/* ----------------------------------------
   "HH:MM" (24hr) -> minutes since midnight
---------------------------------------- */

function timeStringToMinutes(value){

    if(!value) return null;

    const parts = value.split(":");
    if(parts.length < 2) return null;

    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);

    if(isNaN(h) || isNaN(m)) return null;

    return h * 60 + m;
}


/* ----------------------------------------
   "HH:MM" (24hr) -> "8:00 AM" for display
---------------------------------------- */

function formatTime12h(time24){

    if(!time24) return "";

    const minutes = timeStringToMinutes(time24);
    if(minutes === null) return "";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    const period = h >= 12 ? "PM" : "AM";
    const hour12 = (h % 12 === 0) ? 12 : (h % 12);

    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}


/* ----------------------------------------
   BACKWARD COMPAT: parse old free-text times
   ("8:00 AM", "8 pm", "20:00"...) into the
   "HH:MM" 24hr format <input type="time"> needs.
   Used only when loading existing shop data that
   was saved before the time picker existed.
---------------------------------------- */

function parseTimeTo24Hour(value){

    if(!value) return "";

    const trimmed = value.trim();

    /* already "HH:MM" 24hr */
    if(/^\d{1,2}:\d{2}$/.test(trimmed) && !/[APap][Mm]/.test(trimmed)){
        const [h, m] = trimmed.split(":");
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    const match = trimmed.match(/(\d{1,2})(?::(\d{2}))?\s*([APap][Mm])?/);
    if(!match) return "";

    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if(isNaN(hour)) return "";

    if(meridiem === "PM" && hour < 12) hour += 12;
    if(meridiem === "AM" && hour === 12) hour = 0;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}