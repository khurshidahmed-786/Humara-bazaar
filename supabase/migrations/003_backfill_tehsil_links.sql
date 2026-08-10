/* ==========================================================
   ONE-TIME BACKFILL
   Run this ONCE in the Supabase SQL editor, after deploying the
   updated createshop.js / checkout.js.

   Root cause being fixed: shops and orders were being created
   without a tehsil_id, so no Tehsil Admin could ever see them
   (dbGetShopsByTehsil / dbGetOrdersByTehsil filter on it). The
   client code is now fixed going forward — this backfills
   anything created before that fix went live.
   ========================================================== */


/* ----------------------------------------
   1. Backfill shops.tehsil_id by matching the
      shop owner's profile.market against a
      tehsil's pincode or name.
---------------------------------------- */

update public.shops s
set tehsil_id = t.id
from public.profiles p
join public.tehsils t
    on (t.pincode = p.market or t.name ilike p.market)
where s.owner_id = p.id
  and s.tehsil_id is null
  and p.market is not null
  and p.market <> '';


/* ----------------------------------------
   2. Any shop that still has no tehsil_id
      (no tehsil exists for their pincode yet)
      at least gets a clean approval_status so
      it doesn't show as null/undefined in the UI.
---------------------------------------- */

update public.shops
set approval_status = 'pending'
where approval_status is null;


/* ----------------------------------------
   3. Backfill orders.tehsil_id from their shop,
      now that shops are backfilled.
---------------------------------------- */

update public.orders o
set tehsil_id = s.tehsil_id
from public.shops s
where o.shop_id = s.id
  and o.tehsil_id is null
  and s.tehsil_id is not null;


/* ----------------------------------------
   4. Orders placed before delivery_status existed
      default to "unassigned" so they show up
      correctly on the Tehsil Admin's dashboard.
---------------------------------------- */

update public.orders
set delivery_status = 'unassigned'
where delivery_status is null;


/* ----------------------------------------
   5. Sanity check — run this after the above to see
      which shops/orders (if any) still have no tehsil,
      meaning nobody has registered as Tehsil Admin for
      their pincode yet. This is expected for new areas.
---------------------------------------- */

-- select id, name, owner_id from public.shops where tehsil_id is null;
-- select id, shop_id, created_at from public.orders where tehsil_id is null;
