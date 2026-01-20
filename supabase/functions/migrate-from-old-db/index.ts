import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OLD_SUPABASE_URL = "https://uzbyrciresvwcumrzdnn.supabase.co";
const OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6YnlyY2lyZXN2d2N1bXJ6ZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTY5MjcsImV4cCI6MjA4MDkzMjkyN30.r1tMK1UCIeFq3f3uuYSufLedHjQPY-AhM8BcnSVhHbw";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_ANON_KEY);

    const newSupabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const newSupabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const newSupabase = createClient(newSupabaseUrl, newSupabaseKey);

    const results: Record<string, unknown> = {};

    const { data: oldProducts, error: prodErr } = await oldSupabase
      .from("products")
      .select("*");

    if (oldProducts && oldProducts.length > 0) {
      results.products = { count: oldProducts.length, sample: oldProducts.slice(0, 2) };

      for (const product of oldProducts) {
        await newSupabase.from("products").upsert(product, { onConflict: "id" });
      }
    } else {
      results.products = { error: prodErr?.message || "No data or access denied" };
    }

    const { data: oldCategories, error: catErr } = await oldSupabase
      .from("categories")
      .select("*");

    if (oldCategories && oldCategories.length > 0) {
      results.categories = { count: oldCategories.length };
      for (const cat of oldCategories) {
        await newSupabase.from("categories").upsert(cat, { onConflict: "id" });
      }
    } else {
      results.categories = { error: catErr?.message || "No data or access denied" };
    }

    const { data: oldVipLevels, error: vipErr } = await oldSupabase
      .from("vip_levels")
      .select("*");

    if (oldVipLevels && oldVipLevels.length > 0) {
      results.vip_levels = { count: oldVipLevels.length };
      for (const vip of oldVipLevels) {
        await newSupabase.from("vip_levels").upsert(vip, { onConflict: "id" });
      }
    } else {
      results.vip_levels = { error: vipErr?.message || "No data or access denied" };
    }

    const { data: oldPayments, error: payErr } = await oldSupabase
      .from("payment_methods")
      .select("*");

    if (oldPayments && oldPayments.length > 0) {
      results.payment_methods = { count: oldPayments.length };
      for (const pm of oldPayments) {
        await newSupabase.from("payment_methods").upsert(pm, { onConflict: "id" });
      }
    } else {
      results.payment_methods = { error: payErr?.message || "No data or access denied" };
    }

    const { data: oldBanners, error: banErr } = await oldSupabase
      .from("banners")
      .select("*");

    if (oldBanners && oldBanners.length > 0) {
      results.banners = { count: oldBanners.length };
      for (const b of oldBanners) {
        await newSupabase.from("banners").upsert(b, { onConflict: "id" });
      }
    } else {
      results.banners = { error: banErr?.message || "No data or access denied" };
    }

    const { data: oldProfiles, error: profErr } = await oldSupabase
      .from("profiles")
      .select("*");

    if (oldProfiles && oldProfiles.length > 0) {
      results.profiles = { count: oldProfiles.length };
      for (const p of oldProfiles) {
        await newSupabase.from("profiles").upsert(p, { onConflict: "id" });
      }
    } else {
      results.profiles = { error: profErr?.message || "No data or access denied" };
    }

    const { data: oldTransactions, error: transErr } = await oldSupabase
      .from("transactions")
      .select("*");

    if (oldTransactions && oldTransactions.length > 0) {
      results.transactions = { count: oldTransactions.length };
      for (const t of oldTransactions) {
        await newSupabase.from("transactions").upsert(t, { onConflict: "id" });
      }
    } else {
      results.transactions = { error: transErr?.message || "No data or access denied" };
    }

    const { data: oldVipPurchases, error: vpErr } = await oldSupabase
      .from("vip_purchases")
      .select("*");

    if (oldVipPurchases && oldVipPurchases.length > 0) {
      results.vip_purchases = { count: oldVipPurchases.length };
      for (const vp of oldVipPurchases) {
        await newSupabase.from("vip_purchases").upsert(vp, { onConflict: "id" });
      }
    } else {
      results.vip_purchases = { error: vpErr?.message || "No data or access denied" };
    }

    const { data: oldProductPurchases, error: ppErr } = await oldSupabase
      .from("product_purchases")
      .select("*");

    if (oldProductPurchases && oldProductPurchases.length > 0) {
      results.product_purchases = { count: oldProductPurchases.length };
      for (const pp of oldProductPurchases) {
        await newSupabase.from("product_purchases").upsert(pp, { onConflict: "id" });
      }
    } else {
      results.product_purchases = { error: ppErr?.message || "No data or access denied" };
    }

    const { data: oldProgress, error: progErr } = await oldSupabase
      .from("product_progress")
      .select("*");

    if (oldProgress && oldProgress.length > 0) {
      results.product_progress = { count: oldProgress.length };
      for (const prog of oldProgress) {
        await newSupabase.from("product_progress").upsert(prog, { onConflict: "id" });
      }
    } else {
      results.product_progress = { error: progErr?.message || "No data or access denied" };
    }

    const { data: oldComboSettings, error: comboErr } = await oldSupabase
      .from("vip_combo_settings")
      .select("*");

    if (oldComboSettings && oldComboSettings.length > 0) {
      results.vip_combo_settings = { count: oldComboSettings.length };
      for (const cs of oldComboSettings) {
        await newSupabase.from("vip_combo_settings").upsert(cs, { onConflict: "id" });
      }
    } else {
      results.vip_combo_settings = { error: comboErr?.message || "No data or access denied" };
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
