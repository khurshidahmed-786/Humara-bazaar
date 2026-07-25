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

async function dbSaveProduct(product) {
    const { data, error } = await sb
        .from("products")
        .insert(product)
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
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
}
