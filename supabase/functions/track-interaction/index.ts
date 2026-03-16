import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SCORE_WEIGHTS: Record<string, number> = {
  page_view: 1,
  api_viewed: 2,
  api_docs_viewed: 2,
  playground_used: 3,
  signup: 5,
  login: 2,
  demo_requested: 4,
  pricing_viewed: 2,
  contact_form: 3,
  newsletter_signup: 2,
  captured: 1,
  search_performed: 1,
  filter_used: 1,
  comparison_viewed: 2,
  collection_created: 3,
  api_favorited: 2,
  api_subscribed: 4,
  org_created: 4,
  support_ticket: 3,
  referral_clicked: 2,
  traction_view: 5,
  data_room_access: 10,
  document_download: 8,
  pitch_deck_view: 15,
  doc_view: 5,
  meeting_request: 25,
  meeting_scheduled: 25,
  email_reply: 10,
  linkedin_connect: 5,
  referral_made: 20,
  follow_up_initiated: 15,
  term_sheet_viewed: 30,
};

const WARMTH_SIGNAL_TYPES = new Set([
  "traction_view",
  "pitch_deck_view",
  "data_room_access",
  "document_download",
  "meeting_request",
  "email_reply",
  "linkedin_connect",
  "referral_made",
  "follow_up_initiated",
  "term_sheet_viewed",
]);

interface TrackPayload {
  stakeholder_id?: string;
  email?: string;
  interaction_type: string;
  interaction_data?: Record<string, unknown>;
  page_url?: string;
  session_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: TrackPayload = await req.json();
    const interactionType = payload?.interaction_type?.trim();
    if (!interactionType) {
      return new Response(
        JSON.stringify({ error: "interaction_type is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stakeholderId = payload.stakeholder_id;
    const email = payload.email?.trim()?.toLowerCase();
    if (!stakeholderId && !email) {
      return new Response(
        JSON.stringify({ error: "stakeholder_id or email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let resolvedStakeholderId: string;

    let stakeholderType: string | null = null;

    if (stakeholderId) {
      const { data: row } = await supabase
        .from("stakeholders")
        .select("id, stakeholder_type")
        .eq("id", stakeholderId)
        .maybeSingle();
      if (!row) {
        return new Response(
          JSON.stringify({ error: "stakeholder not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      resolvedStakeholderId = row.id;
      stakeholderType = row.stakeholder_type ?? null;
    } else {
      const { data: row } = await supabase
        .from("stakeholders")
        .select("id, stakeholder_type")
        .eq("email", email)
        .maybeSingle();
      if (!row) {
        return new Response(
          JSON.stringify({ error: "stakeholder not found for email" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      resolvedStakeholderId = row.id;
      stakeholderType = row.stakeholder_type ?? null;
    }

    const scoreDelta = SCORE_WEIGHTS[interactionType] ?? 1;

    await supabase.from("stakeholder_interactions").insert({
      stakeholder_id: resolvedStakeholderId,
      interaction_type: interactionType,
      interaction_data: payload.interaction_data ?? {},
      page_url: payload.page_url ?? null,
      session_id: payload.session_id ?? null,
      score_delta: scoreDelta,
    });

    await supabase.rpc("increment_engagement", {
      p_stakeholder_id: resolvedStakeholderId,
      p_score_delta: scoreDelta,
    });

    if (
      stakeholderType === "investor" &&
      WARMTH_SIGNAL_TYPES.has(interactionType)
    ) {
      const warmthUrl = `${supabaseUrl}/functions/v1/investor-warmth-scorer`;
      fetch(warmthUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stakeholder_id: resolvedStakeholderId,
          signal_type: interactionType,
        }),
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        ok: true,
        stakeholder_id: resolvedStakeholderId,
        interaction_type: interactionType,
        score_delta: scoreDelta,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("track-interaction error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
