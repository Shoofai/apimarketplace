import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { stakeholder_id } = await req.json();
    if (!stakeholder_id) {
      return new Response(
        JSON.stringify({ error: "stakeholder_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("provider_profiles").upsert(
      { stakeholder_id, provider_stage: "discovered" },
      { onConflict: "stakeholder_id" }
    );

    await supabase
      .from("stakeholders")
      .update({
        funnel_stage: "segmented",
        last_stage_change_at: new Date().toISOString(),
      })
      .eq("id", stakeholder_id);

    try {
      await supabase.from("nurture_queue").insert({
        stakeholder_id,
        sequence_type: "provider_discovered",
        scheduled_for: new Date().toISOString(),
      });
    } catch {
      // Nurture queue may not exist
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-provider-funnel-entry error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
