import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    const { data: profile, error: upsertErr } = await supabase
      .from("developer_profiles")
      .upsert({ stakeholder_id, developer_stage: "landed" }, { onConflict: "stakeholder_id" })
      .select("id")
      .single();

    if (upsertErr) throw upsertErr;

    await supabase
      .from("stakeholders")
      .update({ funnel_stage: "segmented", last_stage_change_at: new Date().toISOString() })
      .eq("id", stakeholder_id);

    try {
      await supabase.from("nurture_queue").insert({
        stakeholder_id,
        sequence_type: "developer_landed",
        scheduled_for: new Date().toISOString(),
      });
    } catch { /* table may not exist */ }

    return new Response(
      JSON.stringify({ success: true, developer_id: profile?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("developer-funnel-entry error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
