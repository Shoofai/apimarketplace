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
    const {
      stakeholder_id,
      slot_id,
      meeting_type = "intro_call",
      notes,
    } = await req.json();

    if (!stakeholder_id || !slot_id) {
      return new Response(
        JSON.stringify({ error: "stakeholder_id and slot_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: slot, error: slotError } = await supabase
      .from("meeting_slots")
      .update({
        is_available: false,
        booked_by: stakeholder_id,
        meeting_type,
      })
      .eq("id", slot_id)
      .eq("is_available", true)
      .select()
      .single();

    if (slotError || !slot) {
      return new Response(
        JSON.stringify({ error: "Slot no longer available" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const scheduledAt = `${slot.slot_date}T${slot.slot_time}`;

    await supabase
      .from("investor_profiles")
      .update({
        meeting_scheduled_at: scheduledAt,
        meeting_type,
        meeting_notes: notes ?? null,
      })
      .eq("stakeholder_id", stakeholder_id);

    await supabase
      .from("stakeholders")
      .update({
        funnel_stage: "converting",
        last_stage_change_at: new Date().toISOString(),
      })
      .eq("id", stakeholder_id);

    await supabase.from("stakeholder_interactions").insert({
      stakeholder_id,
      interaction_type: "meeting_scheduled",
      interaction_data: {
        slot_id,
        meeting_type,
        scheduled_for: scheduledAt,
      },
      score_delta: 25,
    });

    try {
      await supabase.from("nurture_queue").insert([
        {
          stakeholder_id,
          sequence_type: "investor_meeting_confirmation",
          scheduled_for: new Date().toISOString(),
        },
        {
          stakeholder_id,
          sequence_type: "founder_meeting_alert",
          scheduled_for: new Date().toISOString(),
        },
      ]);
    } catch {
      // nurture_queue may not exist
    }

    return new Response(
      JSON.stringify({
        success: true,
        meeting: {
          date: slot.slot_date,
          time: slot.slot_time,
          duration: slot.duration_minutes,
          video_link: slot.video_link ?? null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("book-investor-meeting error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
