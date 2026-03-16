import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const WARMTH_SIGNALS: Record<string, number> = {
  traction_view: 5,
  pitch_deck_view: 15,
  data_room_access: 10,
  document_download: 8,
  meeting_request: 25,
  email_reply: 10,
  linkedin_connect: 5,
  referral_made: 20,
  follow_up_initiated: 15,
  term_sheet_viewed: 30,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { stakeholder_id, signal_type } = await req.json();
    if (!stakeholder_id) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const points = WARMTH_SIGNALS[signal_type] ?? 0;
    if (points <= 0) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("investor_profiles")
      .select("warmth_score, traction_dashboard_views")
      .eq("stakeholder_id", stakeholder_id)
      .single();

    const currentScore = (profile?.warmth_score as number) ?? 0;
    const newScore = Math.min(currentScore + points, 100);

    const updatePayload: Record<string, unknown> = {
      warmth_score: newScore,
    };

    if (signal_type === "traction_view") {
      updatePayload.traction_dashboard_views =
        ((profile?.traction_dashboard_views as number) ?? 0) + 1;
      updatePayload.last_traction_view = new Date().toISOString();
    }
    if (signal_type === "data_room_access") {
      updatePayload.data_room_accessed = true;
      updatePayload.data_room_first_access = new Date().toISOString();
    }
    if (signal_type === "pitch_deck_view") {
      updatePayload.pitch_deck_viewed = true;
    }
    if (signal_type === "meeting_request") {
      updatePayload.meeting_requested = true;
    }

    await supabase
      .from("investor_profiles")
      .update(updatePayload)
      .eq("stakeholder_id", stakeholder_id);

    let newStage: string | null = null;
    if (newScore >= 70) newStage = "qualified";
    else if (newScore >= 40) newStage = "engaged";
    else if (newScore >= 15) newStage = "activated";

    if (newStage) {
      await supabase
        .from("stakeholders")
        .update({
          funnel_stage: newStage,
          last_stage_change_at: new Date().toISOString(),
        })
        .eq("id", stakeholder_id);
    }

    if (newScore >= 60 && currentScore < 60) {
      try {
        await supabase.from("nurture_queue").insert({
          stakeholder_id,
          sequence_type: "investor_hot_lead_alert",
          scheduled_for: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("investor-warmth-scorer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
