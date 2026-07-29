/* ==========================================================
   HAMARA BAZAAR — SERVICE WORKER
   Only handles push notifications right now — no offline
   caching / asset precaching is implemented, so this is not
   yet a full PWA install-capable worker, just what push
   requires. Registered lazily from subscribeToPush() in
   js/db.js — never on page load.
   ========================================================== */

self.addEventListener("install", function(event){
    // Activate this worker immediately instead of waiting for
    // old tabs to close — there's no cached content to conflict with.
    self.skipWaiting();
});

self.addEventListener("activate", function(event){
    event.waitUntil(self.clients.claim());
});


/* ----------------------------------------------------------
   RECEIVE PUSH
   Payload shape sent by the "notify" Edge Function (Step 7):
   { title, message, actionUrl, notificationId, dedupKey }
---------------------------------------------------------- */
self.addEventListener("push", function(event){

    let payload = {};

    try {
        payload = event.data ? event.data.json() : {};
    } catch(err) {
        payload = {
            title: "Hamara Bazaar",
            message: event.data ? event.data.text() : ""
        };
    }

    const title = payload.title || "Hamara Bazaar";

    const options = {
        body: payload.message || "",
        icon: payload.icon || "/icons/icon-192.png",
        badge: payload.badge || "/icons/badge-72.png",
        data: {
            actionUrl: payload.actionUrl || "/home.html",
            notificationId: payload.notificationId || null
        },
        // using the dedup key as the notification tag means if the
        // same event somehow pushes twice, the second one replaces
        // the first on-screen instead of stacking duplicates
        tag: payload.dedupKey || undefined
    };

    event.waitUntil(self.registration.showNotification(title, options));
});


/* ----------------------------------------------------------
   NOTIFICATION CLICKED
   Focus an existing Hamara Bazaar tab and navigate it, rather
   than always opening a new one.
---------------------------------------------------------- */
self.addEventListener("notificationclick", function(event){

    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.actionUrl) || "/home.html";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList){

            for (let i = 0; i < clientList.length; i++){

                const client = clientList[i];

                try {
                    const clientOrigin = new URL(client.url).origin;

                    if (clientOrigin === self.location.origin){
                        if ("navigate" in client){
                            client.navigate(targetUrl);
                        }
                        if ("focus" in client){
                            return client.focus();
                        }
                    }
                } catch(err) {
                    // ignore and keep checking other open tabs
                }
            }

            if (self.clients.openWindow){
                return self.clients.openWindow(targetUrl);
            }

        })
    );
});
