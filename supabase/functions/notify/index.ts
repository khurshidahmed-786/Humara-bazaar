// ============================================================
// HAMARA BAZAAR — "notify" Edge Function
//
// Called by js/db.js's notifyUser()/notifyUsers(), never called
// directly by a page. For each notification in the request body:
//   1. Insert the in-app notification row (service role — bypasses
//      RLS, which is why this can create a notification "for"
//      someone other than the caller).
//   2. Skip cleanly if it's a duplicate (dedup_key already used
//      for that user) rather than erroring.
//   3. Look up the recipient's notification_preferences; skip the
//      push step (not the in-app step) if they've turned that
//      category off.
//   4. Send Web Push to every subscription on file for that user.
//   5. Delete any subscription the push service reports as
//      gone (404/410) instead of retrying it forever.
//
// A failure sending push for one recipient never stops the other
// recipients in the same batch, and never surfaces as a failure
// to the business action that triggered this call.
// ============================================================

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected
// automatically into every Edge Function — nothing to set manually
// for these two. VAPID_* are the ones you set with `supabase secrets set`.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Service-role client — bypasses RLS. Used only inside this
// server-side function, never anywhere in frontend code.
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Maps a notification `type` to the notification_preferences
// column that governs whether PUSH (not the in-app row) should
// be attempted. Anything not matched here is always allowed
// through (e.g. admin/rider application status — not something
// a user should be able to silently mute).
function preferenceCategoryFor(type: string): string | null {
    if (type.startsWith("order_")) return "order_updates";
    if (type.startsWith("rider_") || type === "order_picked_up" || type === "order_out_for_delivery") return "delivery_updates";
    if (type.startsWith("shop_")) return "shop_updates";
    if (type === "promotional" || type.startsWith("promo_")) return "promotional";
    return null;
}

Deno.serve(async (req) => {

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // ---- Require a real logged-in caller, not just any valid
        // ---- (e.g. anon-key) JWT — platform-level JWT verification
        // ---- alone does not distinguish the two.
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: callerData, error: callerError } = await callerClient.auth.getUser();

        if (callerError || !callerData?.user) {
            return new Response(JSON.stringify({ error: "Not authenticated" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const body = await req.json();
        const notifications = Array.isArray(body?.notifications) ? body.notifications : [];

        if (notifications.length === 0) {
            return new Response(JSON.stringify({ error: "No notifications provided" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const results = [];

        for (const n of notifications) {

            if (!n.userId || !n.type || !n.title || !n.message) {
                results.push({ userId: n.userId || null, skipped: true, reason: "missing required fields" });
                continue;
            }

            // ---- 1 & 2: insert the in-app row, treating a dedup
            // ---- collision as "already exists", not an error.
            const { data: inserted, error: insertError } = await supabaseAdmin
                .from("notifications")
                .insert({
                    user_id: n.userId,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    related_entity_type: n.relatedEntityType || null,
                    related_entity_id: n.relatedEntityId ? String(n.relatedEntityId) : null,
                    action_url: n.actionUrl || null,
                    data: n.data || null,
                    dedup_key: n.dedupKey || null
                })
                .select()
                .single();

            if (insertError) {
                if (insertError.code === "23505") {
                    // duplicate dedup_key for this user — already notified, skip silently
                    results.push({ userId: n.userId, skipped: true, reason: "duplicate" });
                    continue;
                }

                console.error("Notification insert failed:", insertError);
                results.push({ userId: n.userId, skipped: true, reason: "insert_failed" });
                continue;
            }

            // ---- 3: check push preferences for this recipient
            const { data: prefs } = await supabaseAdmin
                .from("notification_preferences")
                .select("*")
                .eq("user_id", n.userId)
                .maybeSingle();

            const pushEnabled = prefs ? prefs.push_enabled : true; // defaults match the table's own defaults
            const category = preferenceCategoryFor(n.type);
            const categoryEnabled = category && prefs ? prefs[category] !== false : true;

            if (!pushEnabled || !categoryEnabled) {
                results.push({ userId: n.userId, notificationId: inserted.id, pushed: false, reason: "preferences" });
                continue;
            }

            // ---- 4 & 5: send push to every subscription this user has
            const { data: subs } = await supabaseAdmin
                .from("push_subscriptions")
                .select("*")
                .eq("user_id", n.userId);

            const pushPayload = JSON.stringify({
                title: n.title,
                message: n.message,
                actionUrl: n.actionUrl || "/home.html",
                notificationId: inserted.id,
                dedupKey: n.dedupKey || undefined
            });

            let pushedCount = 0;

            for (const sub of subs || []) {
                try {
                    await webpush.sendNotification(
                        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
                        pushPayload
                    );
                    pushedCount++;
                } catch (err: any) {
                    if (err?.statusCode === 404 || err?.statusCode === 410) {
                        // subscription is gone — clean it up so we stop trying it
                        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
                    } else {
                        console.error(`Push send failed for subscription ${sub.id}:`, err);
                    }
                }
            }

            results.push({ userId: n.userId, notificationId: inserted.id, pushed: pushedCount > 0, subscriptionsTried: (subs || []).length });
        }

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("notify function error:", err);
        return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
