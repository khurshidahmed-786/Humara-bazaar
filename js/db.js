/* ==========================================================
   HAMARA BAZAAR — SUPABASE DATA LAYER (v1)

   These are the NEW real-backend functions. They are prefixed
   (auth*, db*) so they don't collide with the OLD localStorage
   functions in database.js / shop.js / product.js while we
   migrate the app page by page.

   Every function here is async — always use `await`.
   ========================================================== */


/* ==========================================
   AUTH
   (Email + password for now. Phone OTP login
   comes later once an SMS provider is connected —
   phone is still stored on the profile.)
   ========================================== */

async function authSignUp(email, password, profileFields) {

    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;

    // If email confirmation is ON in your Supabase project, data.user
    // exists but data.session is null until the user clicks the email
    // link. We can still create their profile row right away.
    const { error: profileError } = await sb
        .from("profiles")
        .insert({
            id: data.user.id,
            email,
            name: profileFields.name,
            phone: profileFields.phone,
            market: profileFields.market || ""
        });

    if (profileError) throw profileError;

    return data;
}

async function authSignIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

async function authSignOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
}

async function authUpdatePassword(newPassword) {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
}

async function authGetCurrentUser() {

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) return null;
    return profile;
}


/* ==========================================
   BUSINESSES
   ========================================== */

async function dbCreateBusiness(business) {
    const { data, error } = await sb
        .from("businesses")
        .insert(business)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbGetBusinessesByOwner(ownerId) {
    const { data, error } = await sb
        .from("businesses")
        .select("*")
        .eq("owner_id", ownerId);

    if (error) throw error;
    return data;
}

async function dbGetBusinessById(id) {
    const { data, error } = await sb
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

async function dbUpdateBusiness(id, updates) {
    const { data, error } = await sb
        .from("businesses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}


/* ==========================================
   SHOPS
   ========================================== */

async function dbCreateShop(shop) {
    const { data, error } = await sb
        .from("shops")
        .insert(shop)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbGetAllShops() {
    const { data, error } = await sb
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

async function dbGetShop(id) {
    const { data, error } = await sb
        .from("shops")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

async function dbGetShopsByIds(ids) {
    if (!ids.length) return [];

    const { data, error } = await sb
        .from("shops")
        .select("*")
        .in("id", ids);

    if (error) throw error;
    return data;
}

async function dbGetShopByBusinessId(businessId) {
    const { data, error } = await sb
        .from("shops")
        .select("*")
        .eq("business_id", businessId)
        .single();

    if (error) return null;
    return data;
}

async function dbUpdateShop(id, updates) {
    const { data, error } = await sb
        .from("shops")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Uploads a shop logo or banner to the "shop-images" storage bucket.
// kind: "logo" | "banner". Files are stored under the uploading
// user's own id (e.g. "<userId>/logo_169999.jpg") which matches the
// storage RLS policy from migration 002. Returns the public URL.
async function dbUploadShopImage(file, userId, kind) {

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${kind}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await sb.storage
        .from("shop-images")
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = sb.storage
        .from("shop-images")
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// Sets the shop's manual open/closed override.
// manualStatus: "auto" | "open" | "closed"
// "auto" follows open_time/close_time, "closed" is the
// "closed today" toggle in the seller dashboard, "open" forces
// the shop to show as open regardless of the clock.
async function dbSetShopManualStatus(shopId, manualStatus) {

    const { data, error } = await sb
        .from("shops")
        .update({ manual_status: manualStatus })
        .eq("id", shopId)
        .select()
        .single();

    if (error) throw error;
    return data;
}


/* ==========================================
   PRODUCTS
   ========================================== */

async function dbGetProductsByShop(shopId) {
    const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .eq("active", true);

    if (error) throw error;
    return data;
}

// Same as above but includes hidden/inactive products too —
// use this on seller-facing pages (My Products, Dashboard),
// NOT on the public shop page.
async function dbGetAllProductsByShop(shopId) {
    const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

async function dbGetFeaturedProducts() {
    const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("featured", true)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(12);

    if (error) throw error;
    return data;
}

async function dbGetProductById(id) {
    const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

// Paged, filterable, sortable product feed — powers the homepage's
// endless-scroll grid. sort: "newest" | "price_low" | "price_high".
async function dbGetProductsFeed({ category = "", sort = "newest", search = "", limit = 12, offset = 0 } = {}) {

    let query = sb
        .from("products")
        .select("*")
        .eq("active", true);

    if (category) {
        query = query.eq("category", category);
    }

    if (search) {
        query = query.ilike("name", `%${search}%`);
    }

    if (sort === "price_low") {
        query = query.order("price", { ascending: true });
    } else if (sort === "price_high") {
        query = query.order("price", { ascending: false });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function dbUploadProductImage(file, shopId) {

    const fileExt = file.name.split(".").pop();
    const filePath = `${shopId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await sb.storage
        .from("product-images")
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = sb.storage
        .from("product-images")
        .getPublicUrl(filePath);

    return data.publicUrl;
}


async function dbSaveProduct(product) {
    const { data, error } = await sb
        .from("products")
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbUpdateProduct(id, updates) {
    const { data, error } = await sb
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbDeleteProduct(id) {
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) throw error;
}


/* ==========================================
   ORDERS
   ========================================== */

async function dbSaveOrder(order) {
    const { data, error } = await sb
        .from("orders")
        .insert(order)
        .select()
        .single();

    if (error) throw error;

    // Notify the customer (confirmation) and the seller (new order) —
    // never lets a notification failure affect the order itself.
    try {
        const { data: shop } = await sb.from("shops").select("owner_id, name").eq("id", data.shop_id).single();

        const recipients = [
            {
                userId: data.customer_id,
                type: "order_placed",
                title: "Order placed!",
                message: `Your order from ${shop ? shop.name : "the shop"} has been placed successfully.`,
                relatedEntityType: "order",
                relatedEntityId: data.id,
                actionUrl: "/orders.html",
                dedupKey: `order_placed:order:${data.id}:user:${data.customer_id}`
            }
        ];

        if (shop && shop.owner_id) {
            recipients.push({
                userId: shop.owner_id,
                type: "order_placed",
                title: "New order received!",
                message: `${data.customer_name || "A customer"} placed a new order — ₹${data.total}.`,
                relatedEntityType: "order",
                relatedEntityId: data.id,
                actionUrl: "/sellerorders.html",
                dedupKey: `order_placed:order:${data.id}:user:${shop.owner_id}`
            });
        }

        await notifyUsers(recipients);
    } catch (notifyErr) {
        console.error("Order-placed notification failed:", notifyErr);
    }

    return data;
}

async function dbGetOrdersByCustomer(customerId) {
    const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

async function dbGetOrdersByShop(shopId) {
    const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

async function dbUpdateOrderStatus(id, status) {
    const { data, error } = await sb
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    try {
        const statusCopy = {
            Accepted: { type: "order_accepted", title: "Order accepted!", message: "The shop has accepted your order and will start preparing it." },
            Cancelled: { type: "order_rejected", title: "Order not accepted", message: "Sorry, the shop wasn't able to accept your order." },
            Preparing: { type: "order_status_changed", title: "Order is being prepared", message: "Your order is being prepared." },
            Ready: { type: "order_status_changed", title: "Order ready", message: "Your order is ready and will be out for delivery soon." },
            Delivered: { type: "order_delivered", title: "Order delivered!", message: "Your order has been delivered. Enjoy!" }
        };

        const copy = statusCopy[status];

        if (copy && data.customer_id) {
            await notifyUser({
                userId: data.customer_id,
                type: copy.type,
                title: copy.title,
                message: copy.message,
                relatedEntityType: "order",
                relatedEntityId: data.id,
                actionUrl: "/orders.html",
                dedupKey: `order_status:${data.id}:${status}:user:${data.customer_id}`
            });
        }
    } catch (notifyErr) {
        console.error("Order-status notification failed:", notifyErr);
    }
}

/* ==========================================================
   ADMIN & TEHSIL OPERATIONS
   Roles come from the `user_roles` table (never a browser-side
   field) — see migrations/001_admin_tehsil_system.sql.
   ========================================================== */


/* ------------------------------------------
   MY ROLE (for guards + nav)
   Returns { role: "super_admin" } or
           { role: "tehsil_admin", tehsil_id } or
           null (plain customer / not logged in)
   ------------------------------------------ */
async function dbGetMyRole() {
    const user = await authGetCurrentUser();
    if (!user) return null;

    const { data, error } = await sb
        .from("user_roles")
        .select("role, tehsil_id")
        .eq("user_id", user.id);

    if (error || !data || data.length === 0) return null;

    const superAdmin = data.find(r => r.role === "super_admin");
    if (superAdmin) return { role: "super_admin" };

    const tehsilAdmin = data.find(r => r.role === "tehsil_admin");
    if (tehsilAdmin) return { role: "tehsil_admin", tehsil_id: tehsilAdmin.tehsil_id };

    return null;
}


/* ------------------------------------------
   AUDIT LOG
   ------------------------------------------ */
async function dbLogAudit(action, targetTable, targetId, tehsilId, details) {
    const user = await authGetCurrentUser();
    if (!user) return;

    const { error } = await sb.from("audit_logs").insert({
        actor_id: user.id,
        action,
        target_table: targetTable || null,
        target_id: targetId ? String(targetId) : null,
        tehsil_id: tehsilId || null,
        details: details || null
    });

    if (error) console.error("Audit log failed:", error);
}

async function dbGetAuditLogs(tehsilId, limit = 30) {
    let query = sb
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (tehsilId) query = query.eq("tehsil_id", tehsilId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}


/* ------------------------------------------
   ADMIN APPLICATIONS
   ------------------------------------------ */
async function dbSubmitAdminApplication(fields) {
    const { data, error } = await sb
        .from("admin_applications")
        .insert(fields)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbGetMyAdminApplication() {
    const user = await authGetCurrentUser();
    if (!user) return null;

    const { data, error } = await sb
        .from("admin_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function dbGetPendingAdminApplications() {
    const { data, error } = await sb
        .from("admin_applications")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
}

// Approves an application: finds-or-creates the tehsil, grants the
// applicant the tehsil_admin role, marks the application approved.
async function dbApproveAdminApplication(application) {
    const user = await authGetCurrentUser();

    let { data: existingTehsil } = await sb
        .from("tehsils")
        .select("*")
        .or(`pincode.eq.${application.pincode},name.ilike.${application.tehsil_name}`)
        .maybeSingle();

    let tehsil = existingTehsil;

    if (!tehsil) {
        const { data: newTehsil, error: tehsilError } = await sb
            .from("tehsils")
            .insert({
                name: application.tehsil_name,
                district: application.district,
                pincode: application.pincode,
                created_by: user.id
            })
            .select()
            .single();

        if (tehsilError) throw tehsilError;
        tehsil = newTehsil;
    }

    const { error: roleError } = await sb.from("user_roles").insert({
        user_id: application.user_id,
        role: "tehsil_admin",
        tehsil_id: tehsil.id
    });

    if (roleError) throw roleError;

    const { error: appError } = await sb
        .from("admin_applications")
        .update({
            status: "approved",
            assigned_tehsil_id: tehsil.id,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
        })
        .eq("id", application.id);

    if (appError) throw appError;

    await dbLogAudit("approve_admin_application", "admin_applications", application.id, tehsil.id, {
        applicant: application.full_name,
        tehsil: tehsil.name
    });

    try {
        await notifyUser({
            userId: application.user_id,
            type: "admin_application_approved",
            title: "You're now a Tehsil Admin!",
            message: `Your application for ${tehsil.name} has been approved.`,
            relatedEntityType: "admin_application",
            relatedEntityId: application.id,
            actionUrl: "/tehsil-admin.html",
            dedupKey: `admin_app_status:${application.id}:approved`
        });
    } catch (notifyErr) {
        console.error("Admin-approval notification failed:", notifyErr);
    }

    return tehsil;
}

async function dbRejectAdminApplication(applicationId) {
    const user = await authGetCurrentUser();

    const { data, error } = await sb
        .from("admin_applications")
        .update({
            status: "rejected",
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
        })
        .eq("id", applicationId)
        .select()
        .single();

    if (error) throw error;

    await dbLogAudit("reject_admin_application", "admin_applications", applicationId, null, null);

    try {
        if (data && data.user_id) {
            await notifyUser({
                userId: data.user_id,
                type: "admin_application_rejected",
                title: "Application update",
                message: `Your application for ${data.tehsil_name} was not approved this time.`,
                relatedEntityType: "admin_application",
                relatedEntityId: applicationId,
                actionUrl: "/admin-pending.html",
                dedupKey: `admin_app_status:${applicationId}:rejected`
            });
        }
    } catch (notifyErr) {
        console.error("Admin-rejection notification failed:", notifyErr);
    }
}


/* ------------------------------------------
   TEHSILS
   ------------------------------------------ */
async function dbGetAllTehsils() {
    const { data, error } = await sb
        .from("tehsils")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

async function dbGetTehsilById(id) {
    const { data, error } = await sb
        .from("tehsils")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
}

// Super Admin only: open / pause / suspend / reopen
async function dbSetTehsilStatus(tehsilId, status) {
    const { error } = await sb
        .from("tehsils")
        .update({ status })
        .eq("id", tehsilId);

    if (error) throw error;

    await dbLogAudit("set_tehsil_status", "tehsils", tehsilId, tehsilId, { status });
}

// Tehsil Admin only: setup -> ready_for_review (enforced again by
// a DB trigger, this is just the friendly client-side call)
async function dbMarkTehsilReadyForReview(tehsilId) {
    const { error } = await sb
        .from("tehsils")
        .update({ status: "ready_for_review" })
        .eq("id", tehsilId);

    if (error) throw error;

    await dbLogAudit("mark_ready_for_review", "tehsils", tehsilId, tehsilId, null);
}

// Live readiness counts for the setup checklist
const TEHSIL_REQUIRED_CATEGORIES = ["Grocery", "Restaurant", "Fashion", "Beauty", "Electronics"];
const TEHSIL_RECOMMENDED_SHOPS_PER_CATEGORY = 2;
const TEHSIL_REQUIRED_RIDERS = 2;

async function dbGetTehsilReadiness(tehsilId) {
    const { data: shops, error: shopsError } = await sb
        .from("shops")
        .select("id, category, approval_status")
        .eq("tehsil_id", tehsilId)
        .eq("approval_status", "approved");

    if (shopsError) throw shopsError;

    const { data: riders, error: ridersError } = await sb
        .from("rider_profiles")
        .select("id")
        .eq("tehsil_id", tehsilId)
        .eq("status", "approved");

    if (ridersError) throw ridersError;

    const categoryCounts = {};
    TEHSIL_REQUIRED_CATEGORIES.forEach(cat => { categoryCounts[cat] = 0; });
    (shops || []).forEach(shop => {
        if (categoryCounts.hasOwnProperty(shop.category)) {
            categoryCounts[shop.category]++;
        }
    });

    const missingCategories = TEHSIL_REQUIRED_CATEGORIES.filter(cat => categoryCounts[cat] < 1);
    const riderCount = (riders || []).length;

    return {
        categoryCounts,
        missingCategories,
        riderCount,
        ridersOk: riderCount >= TEHSIL_REQUIRED_RIDERS,
        ready: missingCategories.length === 0 && riderCount >= TEHSIL_REQUIRED_RIDERS
    };
}


/* ------------------------------------------
   SHOP MODERATION (tehsil-scoped)
   ------------------------------------------ */
async function dbGetShopsByTehsil(tehsilId, approvalStatus) {
    let query = sb.from("shops").select("*").eq("tehsil_id", tehsilId);
    if (approvalStatus) query = query.eq("approval_status", approvalStatus);

    const { data, error } = await query.order("id", { ascending: false });
    if (error) throw error;
    return data;
}

async function dbSetShopApprovalStatus(shopId, status, tehsilId) {
    const { data, error } = await sb
        .from("shops")
        .update({ approval_status: status })
        .eq("id", shopId)
        .select()
        .single();

    if (error) throw error;

    await dbLogAudit(`shop_${status}`, "shops", shopId, tehsilId, null);

    try {
        const statusCopy = {
            approved: { title: "Your shop is live!", message: `${data.name} has been approved and is now visible to customers.` },
            rejected: { title: "Shop application update", message: `${data.name} was not approved. Contact your Tehsil Admin for details.` },
            suspended: { title: "Shop suspended", message: `${data.name} has been suspended and is no longer visible to customers.` }
        };

        const copy = statusCopy[status];

        if (copy && data.owner_id) {
            await notifyUser({
                userId: data.owner_id,
                type: `shop_${status}`,
                title: copy.title,
                message: copy.message,
                relatedEntityType: "shop",
                relatedEntityId: shopId,
                actionUrl: "/role.html",
                dedupKey: `shop_status:${shopId}:${status}`
            });
        }
    } catch (notifyErr) {
        console.error("Shop-status notification failed:", notifyErr);
    }
}


/* ------------------------------------------
   RIDER APPLICATIONS + MODERATION
   ------------------------------------------ */
async function dbSubmitRiderApplication(fields) {
    const { data, error } = await sb
        .from("rider_profiles")
        .insert(fields)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbGetMyRiderApplication() {
    const user = await authGetCurrentUser();
    if (!user) return null;

    const { data, error } = await sb
        .from("rider_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function dbGetRidersByTehsil(tehsilId, status) {
    let query = sb.from("rider_profiles").select("*").eq("tehsil_id", tehsilId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("id", { ascending: false });
    if (error) throw error;
    return data;
}

async function dbSetRiderStatus(riderId, status, tehsilId) {
    const user = await authGetCurrentUser();

    const { data, error } = await sb
        .from("rider_profiles")
        .update({
            status,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
        })
        .eq("id", riderId)
        .select()
        .single();

    if (error) throw error;

    await dbLogAudit(`rider_${status}`, "rider_profiles", riderId, tehsilId, null);

    try {
        const statusCopy = {
            approved: { type: "rider_application_approved", title: "You're an approved rider!", message: "You can now be assigned deliveries in your tehsil." },
            rejected: { type: "rider_application_rejected", title: "Application update", message: "Your rider application was not approved this time." },
            suspended: { type: "rider_suspended", title: "Rider status update", message: "Your rider account has been suspended." }
        };

        const copy = statusCopy[status];

        if (copy && data.user_id) {
            await notifyUser({
                userId: data.user_id,
                type: copy.type,
                title: copy.title,
                message: copy.message,
                relatedEntityType: "rider_profile",
                relatedEntityId: riderId,
                actionUrl: "/services.html",
                dedupKey: `rider_status:${riderId}:${status}`
            });
        }
    } catch (notifyErr) {
        console.error("Rider-status notification failed:", notifyErr);
    }
}

async function dbSetRiderAvailability(riderId, available) {
    const { error } = await sb
        .from("rider_profiles")
        .update({ available })
        .eq("id", riderId);

    if (error) throw error;
}

async function dbUploadVerificationDoc(file, userId) {
    const path = `${userId}/${Date.now()}_${file.name}`;

    const { error } = await sb.storage
        .from("verification-docs")
        .upload(path, file);

    if (error) throw error;
    return path;
}

async function dbAddVehicle(riderId, type, number, documentUrl) {
    const { error } = await sb.from("vehicles").insert({
        rider_id: riderId,
        type,
        number,
        document_url: documentUrl || null
    });

    if (error) throw error;
}


/* ------------------------------------------
   DELIVERY: ORDERS + RIDER ASSIGNMENT
   ------------------------------------------ */
async function dbGetUnassignedOrdersByTehsil(tehsilId) {
    const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("tehsil_id", tehsilId)
        .eq("delivery_status", "unassigned")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

// Locks in the delivery fee breakdown for an order at dispatch
// time — this is what actually determines what the customer is
// charged for delivery AND what the rider is owed. Call this at
// the same time you assign a rider (distanceKm/isRainy are
// collected on the same "Assign" action in the Tehsil Admin UI).
// Also recalculates order.total, since the real delivery fee can
// differ from the ₹40 base estimate shown at checkout.
async function dbSetOrderDeliveryPricing(orderId, { distanceKm = 0, isRainy = false } = {}) {

    const { data: order, error: fetchError } = await sb
        .from("orders")
        .select("subtotal")
        .eq("id", orderId)
        .single();

    if (fetchError) throw fetchError;

    const breakdown = computeDeliveryFee({ distanceKm, isRainy, atTime: new Date() });

    const { data, error } = await sb
        .from("orders")
        .update({
            distance_km: breakdown.distanceKm,
            is_rainy: breakdown.isRainy,
            is_off_hour: breakdown.isOffHour,
            delivery_base_fee: breakdown.baseFee,
            delivery_distance_fee: breakdown.distanceFee,
            delivery_off_hour_fee: breakdown.offHourFee,
            delivery_rain_fee: breakdown.rainFee,
            delivery: breakdown.totalFee,
            rider_payout: breakdown.riderPayout,
            platform_delivery_cut: breakdown.platformCut,
            total: Number(order.subtotal) + breakdown.totalFee
        })
        .eq("id", orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbAssignRiderToOrder(orderId, riderId, tehsilId) {
    const user = await authGetCurrentUser();

    const { error: assignError } = await sb.from("order_rider_assignments").insert({
        order_id: orderId,
        rider_id: riderId,
        tehsil_id: tehsilId,
        assigned_by: user.id
    });

    if (assignError) throw assignError;

    const { data: order, error: orderError } = await sb
        .from("orders")
        .update({ delivery_status: "assigned" })
        .eq("id", orderId)
        .select()
        .single();

    if (orderError) throw orderError;

    await dbLogAudit("assign_rider", "orders", orderId, tehsilId, { rider_id: riderId });

    try {
        const [{ data: shop }, { data: rider }] = await Promise.all([
            sb.from("shops").select("owner_id, name").eq("id", order.shop_id).single(),
            sb.from("rider_profiles").select("user_id, full_name").eq("id", riderId).single()
        ]);

        const recipients = [];

        if (order.customer_id) {
            recipients.push({
                userId: order.customer_id,
                type: "rider_assigned",
                title: "Rider assigned!",
                message: `${rider ? rider.full_name : "A rider"} has been assigned to deliver your order.`,
                relatedEntityType: "order",
                relatedEntityId: orderId,
                actionUrl: "/orders.html",
                dedupKey: `rider_assigned:order:${orderId}:user:${order.customer_id}`
            });
        }

        if (shop && shop.owner_id) {
            recipients.push({
                userId: shop.owner_id,
                type: "rider_assigned",
                title: "Rider assigned to order",
                message: `${rider ? rider.full_name : "A rider"} will pick up order #${orderId}.`,
                relatedEntityType: "order",
                relatedEntityId: orderId,
                actionUrl: "/sellerorders.html",
                dedupKey: `rider_assigned:order:${orderId}:user:${shop.owner_id}`
            });
        }

        if (rider && rider.user_id) {
            recipients.push({
                userId: rider.user_id,
                type: "rider_assigned",
                title: "New delivery assigned",
                message: `You've been assigned to deliver order #${orderId}${shop ? " from " + shop.name : ""}.`,
                relatedEntityType: "order",
                relatedEntityId: orderId,
                actionUrl: "/services.html",
                dedupKey: `rider_assigned:order:${orderId}:user:${rider.user_id}`
            });
        }

        if (recipients.length > 0) {
            await notifyUsers(recipients);
        }
    } catch (notifyErr) {
        console.error("Rider-assigned notification failed:", notifyErr);
    }
}

// All orders for a tehsil, any status — used by the Tehsil Admin's
// "All Orders" view so they can see where every order stands
// (Pending / Accepted / Preparing / Ready / Delivered) and its
// delivery_status (unassigned / assigned / picked_up / delivered).
async function dbGetOrdersByTehsil(tehsilId, limit = 100) {
    const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("tehsil_id", tehsilId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// Orders assigned to a specific rider (rider_profiles.id, not the
// user id), each with the shop's name/location attached so the
// rider dashboard can show "from -> to" without extra round trips.
async function dbGetOrdersAssignedToRider(riderId) {

    const { data: assignments, error: assignError } = await sb
        .from("order_rider_assignments")
        .select("order_id")
        .eq("rider_id", riderId);

    if (assignError) throw assignError;

    const orderIds = [...new Set((assignments || []).map(a => a.order_id))];
    if (orderIds.length === 0) return [];

    const { data: orders, error: ordersError } = await sb
        .from("orders")
        .select("*")
        .in("id", orderIds)
        .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    const shopIds = [...new Set((orders || []).map(o => o.shop_id))];

    let shopsById = {};

    if (shopIds.length > 0) {
        const { data: shops, error: shopsError } = await sb
            .from("shops")
            .select("id, name, location, address, logo, category")
            .in("id", shopIds);

        if (shopsError) throw shopsError;
        (shops || []).forEach(s => { shopsById[s.id] = s; });
    }

    return (orders || []).map(o => ({ ...o, shop: shopsById[o.shop_id] || null }));
}

// Rider-side delivery status: "assigned" -> "picked_up" -> "delivered".
// Kept separate from orders.status (which the SELLER controls:
// Pending/Accepted/Preparing/Ready/Delivered) so the two workflows
// never stomp on each other.
async function dbSetOrderDeliveryStatus(orderId, deliveryStatus) {
    const { data, error } = await sb
        .from("orders")
        .update({ delivery_status: deliveryStatus })
        .eq("id", orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}


/* ==========================================================
   PINCODE-BASED TEHSIL LOOKUP (welcome page gate)
   ========================================================== */
async function dbFindTehsilByPincodeOrName(query) {
    const trimmed = query.trim();

    const { data, error } = await sb
        .from("tehsils")
        .select("*")
        .or(`pincode.eq.${trimmed},name.ilike.%${trimmed}%`)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}


/* ==========================================================
   CATEGORIES (seller-suggested, admin-reviewed)
   ========================================================== */
async function dbGetActiveCategories() {
    const { data, error } = await sb
        .from("categories")
        .select("*")
        .eq("status", "approved")
        .order("name", { ascending: true });

    if (error) throw error;
    return data;
}

async function dbSuggestCategory(name) {
    const user = await authGetCurrentUser();
    if (!user) throw new Error("Please log in to suggest a category.");

    const { data, error } = await sb
        .from("categories")
        .insert({ name: name.trim(), suggested_by: user.id })
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbGetPendingCategorySuggestions() {
    const { data, error } = await sb
        .from("categories")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
}

async function dbReviewCategorySuggestion(id, status) {
    const user = await authGetCurrentUser();

    const { error } = await sb
        .from("categories")
        .update({ status, reviewed_by: user.id })
        .eq("id", id);

    if (error) throw error;

    await dbLogAudit(`category_${status}`, "categories", id, null, null);
}


/* ==========================================================
   PROFILE
   ========================================================== */
async function dbUpdateMyProfile(fields) {
    const user = await authGetCurrentUser();
    if (!user) throw new Error("Please log in.");

    const { data, error } = await sb
        .from("profiles")
        .update(fields)
        .eq("id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* ==========================================================
   NOTIFICATIONS
   Every real event in the app (order accepted, shop approved,
   rider assigned, etc.) calls notifyUser() or notifyUsers() —
   never inserts into `notifications` directly, and never fails
   the calling action if delivery fails.
   ========================================================== */

// Fires the Edge Function, which does the actual DB insert (using
// the service role key — see migration 004's RLS notes for why)
// plus the Web Push send. Always resolves, never throws — a
// notification failure must never break the business action that
// triggered it.
async function notifySend(notifications) {
    try {
        const { data, error } = await sb.functions.invoke("notify", {
            body: { notifications }
        });

        if (error) {
            console.error("Notification send failed:", error);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Notification send failed:", err);
        return null;
    }
}

// Single recipient.
// notification: { userId, type, title, message, relatedEntityType,
//                  relatedEntityId, actionUrl, data, dedupKey }
async function notifyUser(notification) {
    return notifySend([notification]);
}

// Multiple recipients for the same event, each with their own
// tailored title/message (e.g. "rider assigned" -> customer sees
// "Your rider is on the way", seller sees "Rider assigned to order #123").
// notifications: array of the same shape as notifyUser() takes.
async function notifyUsers(notifications) {
    return notifySend(notifications);
}


/* ------------------------------------------
   IN-APP NOTIFICATION READS (Step 9's bell UI uses these)
   ------------------------------------------ */
async function dbGetMyNotifications(limit = 30) {
    const user = await authGetCurrentUser();
    if (!user) return [];

    const { data, error } = await sb
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

async function dbGetUnreadNotificationCount() {
    const user = await authGetCurrentUser();
    if (!user) return 0;

    const { count, error } = await sb
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) throw error;
    return count || 0;
}

// Uses the RPC functions from migration 005 — never a direct
// .update() against notifications, by design.
async function dbMarkNotificationRead(notificationId) {
    const { error } = await sb.rpc("mark_notification_read", { notification_id: notificationId });
    if (error) throw error;
}

async function dbMarkAllNotificationsRead() {
    const { error } = await sb.rpc("mark_all_notifications_read");
    if (error) throw error;
}


/* ------------------------------------------
   NOTIFICATION PREFERENCES
   (separate from actual browser push permission — see migration 004)
   ------------------------------------------ */
async function dbGetMyNotificationPrefs() {
    const user = await authGetCurrentUser();
    if (!user) return null;

    const { data, error } = await sb
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) throw error;

    if (data) return data;

    // no row yet — return the same defaults the table itself defaults to,
    // without writing anything until the user actually changes something
    return {
        user_id: user.id,
        push_enabled: true,
        order_updates: true,
        delivery_updates: true,
        shop_updates: true,
        promotional: false
    };
}

async function dbUpdateMyNotificationPrefs(updates) {
    const user = await authGetCurrentUser();
    if (!user) throw new Error("Please log in.");

    const { data, error } = await sb
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* ==========================================================
   PUSH SUBSCRIPTION MANAGEMENT
   Public key only — the private key never leaves the Edge
   Function's secrets (see migration 004 setup notes).
   ========================================================== */

const VAPID_PUBLIC_KEY = "BEsVZa-UPEYsjPU0MMyOx-wZCf_GfeSTWci6K3Wr1SMbS6ofJp7lmxUAXqyDnBUVd-fkmqZA2o8gYyrSSOfV08E";

// Web Push wants the VAPID key as a Uint8Array, not the base64url
// string the CLI prints — this is the standard conversion.
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function isPushSupported() {
    return "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
}

function getNotificationPermissionStatus() {
    if (typeof Notification === "undefined") return "unsupported";
    return Notification.permission; // "granted" | "denied" | "default"
}

// Registers sw.js if it isn't already, and waits until it's active.
// Safe to call repeatedly — the browser no-ops a re-registration of
// the same script.
async function ensureServiceWorkerReady() {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported in this browser.");
    }

    await navigator.serviceWorker.register("/sw.js");
    return navigator.serviceWorker.ready;
}

// Call this from a real user action (a Settings toggle), never on
// page load — asking for permission unprompted gets it denied
// forever in most browsers.
async function subscribeToPush() {
    if (!isPushSupported()) {
        throw new Error("Push notifications aren't supported in this browser.");
    }

    const user = await authGetCurrentUser();
    if (!user) throw new Error("Please log in to enable notifications.");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error(
            permission === "denied"
                ? "Notifications are blocked for this site. Enable them in your browser's site settings, then try again."
                : "Notification permission was not granted."
        );
    }

    const registration = await ensureServiceWorkerReady();

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
    }

    const subJson = subscription.toJSON();

    // Upsert on endpoint, not a plain insert — see migration 004's
    // notes on why a resubscribe must overwrite cleanly rather than
    // hit the unique constraint and fail.
    const { error } = await sb.from("push_subscriptions").upsert(
        {
            user_id: user.id,
            endpoint: subJson.endpoint,
            p256dh: subJson.keys.p256dh,
            auth_key: subJson.keys.auth,
            updated_at: new Date().toISOString()
        },
        { onConflict: "endpoint" }
    );

    if (error) throw error;

    return subscription;
}

async function unsubscribeFromPush() {
    if (!isPushSupported()) return;

    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;

    await subscription.unsubscribe();

    const user = await authGetCurrentUser();
    if (user) {
        await sb.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
    }
}

// For Settings UI: is push currently actually subscribed on this
// device, separate from what notification_preferences says the
// user wants.
async function getCurrentPushSubscription() {
    if (!isPushSupported()) return null;

    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (!registration) return null;

    return registration.pushManager.getSubscription();
}
