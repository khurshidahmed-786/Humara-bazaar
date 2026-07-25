/* ==========================================================
   HAMARA BAZAAR — SUPABASE CLIENT
   Requires the Supabase CDN script to be loaded BEFORE this
   file (see index.html for the <script> tag order).
   ========================================================== */

const SUPABASE_URL = "https://sfaxuzddlwttxdtxryvz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYXh1emRkbHd0dHhkdHhyeXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDY5MTksImV4cCI6MjA5NzY4MjkxOX0.1dw1kogDGEPUZdS6geoc9GgWtQ8f6uogPXes_A8r-VE";

// Named "sb" (not "supabase") to avoid clashing with the
// global `supabase` object the CDN script itself exposes.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
