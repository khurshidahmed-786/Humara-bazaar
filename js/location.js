/* ==========================================================
   HAMARA BAZAAR — LOCATION UTILITY
   Single source of truth for:
     - getCurrentLocation()      (GPS capture, all error cases)
     - haversineDistanceKm()     (straight-line distance)
     - reverseGeocodeBestEffort() (best-effort address text from lat/lng)
     - googleMapsDirectionsUrl() (opens Google Maps externally)
     - formatDistanceKm()        (one rounding rule, used everywhere)

   Include this BEFORE any script that captures a location or shows
   a distance/navigate link: createshop.js, checkout.js, riderdashboard.js.

   IMPORTANT: this file does NOT decide delivery charges. The
   authoritative delivery fee is still computed in
   js/deliveryPricing.js from a distance entered by the Tehsil Admin
   at dispatch (unchanged, existing behavior). Distances calculated
   here (checkout estimate, max-radius check) are informational only.
   ========================================================== */


/* ----------------------------------------
   GPS capture

   Wraps navigator.geolocation with sensible defaults and maps every
   failure mode to a short, user-facing message + a stable `code` so
   calling code can branch on it if needed.

   Never throws synchronously — always resolves/rejects the promise,
   so a caller can safely `try { await getCurrentLocation() } catch`.
---------------------------------------- */

function getCurrentLocation(options = {}) {

    return new Promise((resolve, reject) => {

        if (!("geolocation" in navigator)) {
            reject({ code: "UNSUPPORTED", message: "Your browser doesn't support location. Please enter your address manually." });
            return;
        }

        // navigator.geolocation silently fails on non-HTTPS origins
        // (except localhost) — catch that explicitly with a clear message
        // rather than letting it time out mysteriously.
        if (!window.isSecureContext) {
            reject({ code: "INSECURE", message: "Location requires a secure (https) connection. Please enter your address manually." });
            return;
        }

        const opts = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
            ...options
        };

        navigator.geolocation.getCurrentPosition(
            pos => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy // metres
            }),
            err => {
                let code = "UNKNOWN";
                let message = "Unable to determine your location. Please enter your address manually.";

                if (err.code === err.PERMISSION_DENIED) {
                    code = "DENIED";
                    message = "Location permission was denied. You can enter your delivery address manually.";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    code = "UNAVAILABLE";
                    message = "Unable to determine your location. Please enter your address manually.";
                } else if (err.code === err.TIMEOUT) {
                    code = "TIMEOUT";
                    message = "Location request timed out. Please enter your address manually.";
                }

                reject({ code, message });
            },
            opts
        );
    });
}


/* ----------------------------------------
   Accuracy check

   ⚠️ 100m is an assumed threshold (not specified) — a GPS fix wider
   than this shows the "may not be accurate" hint. Change freely,
   nothing else depends on the exact number.
---------------------------------------- */

const LOCATION_ACCURACY_WARN_METERS = 100;

function isLocationAccurate(accuracyMeters) {
    if (accuracyMeters == null) return true; // unknown accuracy — don't block
    return accuracyMeters <= LOCATION_ACCURACY_WARN_METERS;
}


/* ----------------------------------------
   Straight-line (Haversine) distance in km.

   Used for: checkout delivery estimate + max-delivery-radius check
   ONLY. It is NOT used to set the final delivery charge — that
   still comes from the distance the Tehsil Admin enters at dispatch
   (js/deliveryPricing.js), unchanged from existing behavior.

   Road distance (Google Distance Matrix/Routes API) can replace this
   later once a Google Maps Platform API key is configured — see the
   implementation report for what that would take.
---------------------------------------- */

function haversineDistanceKm(lat1, lng1, lat2, lng2) {

    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius, km

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}


/* ----------------------------------------
   Centralized display rounding for distance.
   One rule, used everywhere a km figure is shown to a customer.
---------------------------------------- */

function formatDistanceKm(km) {
    if (km == null || isNaN(km)) return "—";
    return `${Math.round(km * 10) / 10} km`;
}


/* ----------------------------------------
   Best-effort reverse geocoding: turns lat/lng into a human-readable
   address to PRE-FILL the address box. The customer/seller always
   sees and can edit the result before confirming — this never
   silently substitutes for their confirmation.

   No Google Maps API key is configured yet (per project owner), so
   this uses OpenStreetMap's free Nominatim endpoint as a best-effort
   fallback. If it fails or times out, the address field is simply
   left for manual entry — this is never allowed to block the flow.

   TODO (when a Google Maps Platform key is available): swap this for
   the Google Geocoding API, called from a Supabase Edge Function so
   the key stays server-side. See implementation report.
---------------------------------------- */

async function reverseGeocodeBestEffort(latitude, longitude) {

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=0`,
            { signal: controller.signal, headers: { "Accept": "application/json" } }
        );

        clearTimeout(timeoutId);

        if (!res.ok) return null;

        const data = await res.json();
        return data && data.display_name ? data.display_name : null;

    } catch (err) {
        console.error("Reverse geocode failed (non-blocking):", err);
        return null;
    }
}


/* ----------------------------------------
   Google Maps "Open in Maps" link.

   Accepts either {latitude, longitude} (preferred — precise) or a
   plain address string (fallback when coordinates aren't saved,
   e.g. shops created before this feature). No API key needed — this
   is just the public maps.google.com URL scheme, which works on
   Android/iOS/desktop alike.
---------------------------------------- */

function googleMapsDirectionsUrl(destination) {

    if (destination && typeof destination === "object" &&
        destination.latitude != null && destination.longitude != null) {
        return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination || "")}`;
}
