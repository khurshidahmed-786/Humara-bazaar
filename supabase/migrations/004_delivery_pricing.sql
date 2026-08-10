/* ==========================================================
   MIGRATION: delivery pricing breakdown on orders

   Run this once in the Supabase SQL editor. Additive only —
   nothing existing is touched.

   Pricing model (see js/deliveryPricing.js for the single
   source of truth):
     base:      ₹40 total, rider gets ₹30
     distance:  ₹10/km,   rider gets ₹7/km   (distance entered
                manually by whoever assigns the rider)
     off-hour:  ₹20 surcharge (9PM-7AM), rider gets ₹15
     rain:      ₹20 surcharge (manual toggle), rider gets ₹15
   ========================================================== */

alter table public.orders
    add column if not exists distance_km numeric,
    add column if not exists is_rainy boolean not null default false,
    add column if not exists is_off_hour boolean not null default false,
    add column if not exists delivery_base_fee numeric,
    add column if not exists delivery_distance_fee numeric,
    add column if not exists delivery_off_hour_fee numeric,
    add column if not exists delivery_rain_fee numeric,
    add column if not exists rider_payout numeric,
    add column if not exists platform_delivery_cut numeric;
