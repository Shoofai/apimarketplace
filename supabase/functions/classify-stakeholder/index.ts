import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type StakeholderType =
  | "investor"
  | "api_provider"
  | "developer"
  | "enterprise_buyer"
  | "unknown";
type CaptureSource =
  | "landing_page"
  | "product_hunt"
  | "linkedin"
  | "twitter"
  | "referral"
  | "blog"
  | "api_docs"
  | "google_ads"
  | "cold_outreach"
  | "event"
  | "organic_search"
  | "direct"
  | "other";

interface CapturePayload {
  email: string;
  full_name?: string;
  company_name?: string;
  job_title?: string;
  linkedin_url?: string;
  capture_source?: CaptureSource;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer_url?: string;
  landing_page_url?: string;
  i_am?: StakeholderType;
  marketing_consent?: boolean;
  privacy_accepted?: boolean;
}

interface SegmentationRule {
  id: string;
  stakeholder_type: StakeholderType;
  rule_name: string;
  priority: number;
  conditions: {
    job_title_keywords?: string[];
    company_keywords?: string[];
    utm_campaign_keywords?: string[];
    landing_page_contains?: string[];
    email_domain_keywords?: string[];
  };
  confidence_boost: number;
}

function normalize(s: string | undefined): string {
  if (!s) return "";
  return s.toLowerCase().trim();
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  const t = normalize(text);
  return keywords.some((k) => t.includes(normalize(k)));
}

function matchesAnySegment(path: string, segments: string[]): boolean {
  const p = normalize(path);
  return segments.some((s) => p.includes(normalize(s)));
}

function getEmailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}

function classifyStakeholder(
  payload: CapturePayload,
  rules: SegmentationRule[]
): { type: StakeholderType; confidence: number; signals: string[] } {
  const jobTitle = normalize(payload.job_title ?? "");
  const company = normalize(payload.company_name ?? "");
  const utmCampaign = normalize(payload.utm_campaign ?? "");
  const landingPage = normalize(payload.landing_page_url ?? "");
  const emailDomain = getEmailDomain(payload.email ?? "");
  const iAm = payload.i_am;

  const scores: Record<StakeholderType, number> = {
    investor: 0,
    api_provider: 0,
    developer: 0,
    enterprise_buyer: 0,
    unknown: 0,
  };
  const signals: string[] = [];

  for (const rule of rules) {
    const cond = rule.conditions;
    let matched = false;

    if (cond.job_title_keywords?.length && matchesKeywords(jobTitle, cond.job_title_keywords)) {
      matched = true;
      signals.push(`job_title:${rule.rule_name}`);
    }
    if (cond.company_keywords?.length && matchesKeywords(company, cond.company_keywords)) {
      matched = true;
      signals.push(`company:${rule.rule_name}`);
    }
    if (cond.utm_campaign_keywords?.length && matchesKeywords(utmCampaign, cond.utm_campaign_keywords)) {
      matched = true;
      signals.push(`utm:${rule.rule_name}`);
    }
    if (cond.landing_page_contains?.length && matchesAnySegment(landingPage, cond.landing_page_contains)) {
      matched = true;
      signals.push(`landing:${rule.rule_name}`);
    }
    if (cond.email_domain_keywords?.length && matchesKeywords(emailDomain, cond.email_domain_keywords)) {
      matched = true;
      signals.push(`email_domain:${rule.rule_name}`);
    }

    if (iAm && iAm === rule.stakeholder_type) {
      scores[rule.stakeholder_type] += 0.5;
      signals.push(`i_am:${rule.stakeholder_type}`);
    }

    if (matched) {
      scores[rule.stakeholder_type] =
        (scores[rule.stakeholder_type] ?? 0) + (rule.confidence_boost ?? 0.2);
    }
  }

  const entries = Object.entries(scores).filter(
    ([k]) => k !== "unknown"
  ) as [StakeholderType, number][];
  const best = entries.reduce(
    (acc, [type, score]) => (score > acc[1] ? [type, score] : acc),
    ["unknown" as StakeholderType, 0]
  );
  const [type, rawConfidence] = best;
  const confidence = Math.min(1, Math.round(rawConfidence * 100) / 100);

  return {
    type: type === "unknown" && (iAm && iAm !== "unknown") ? iAm : type,
    confidence,
    signals,
  };
}

async function fireFunnelHooks(
  supabaseUrl: string,
  stakeholderId: string,
  stakeholderType: StakeholderType
): Promise<void> {
  const map: Record<StakeholderType, string> = {
    investor: "investor-funnel-entry",
    api_provider: "api-provider-funnel-entry",
    developer: "developer-funnel-entry",
    enterprise_buyer: "enterprise-funnel-entry",
    unknown: "developer-funnel-entry",
  };
  const fn = map[stakeholderType];
  const url = `${supabaseUrl}/functions/v1/${fn}`;
  try {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stakeholder_id: stakeholderId }),
    }).catch(() => {});
  } catch {
    // fire-and-forget
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: CapturePayload = await req.json();
    if (!payload?.email?.trim()) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: rules } = await supabase
      .from("segmentation_rules")
      .select("id, stakeholder_type, rule_name, priority, conditions, confidence_boost")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    const ruleList = (rules ?? []) as SegmentationRule[];
    const { type: stakeholderType, confidence, signals } = classifyStakeholder(
      payload,
      ruleList
    );

    const captureSource: CaptureSource =
      payload.capture_source ?? "landing_page";
    const stakeholderRow = {
      email: payload.email.trim().toLowerCase(),
      full_name: payload.full_name?.trim() ?? null,
      company_name: payload.company_name?.trim() ?? null,
      job_title: payload.job_title?.trim() ?? null,
      linkedin_url: payload.linkedin_url?.trim() ?? null,
      stakeholder_type: stakeholderType,
      segmentation_confidence: confidence,
      segmentation_signals: signals,
      funnel_stage: "captured",
      capture_source: captureSource,
      utm_source: payload.utm_source ?? null,
      utm_medium: payload.utm_medium ?? null,
      utm_campaign: payload.utm_campaign ?? null,
      utm_content: payload.utm_content ?? null,
      utm_term: payload.utm_term ?? null,
      referrer_url: payload.referrer_url ?? null,
      landing_page_url: payload.landing_page_url ?? null,
      marketing_consent: payload.marketing_consent ?? false,
      privacy_accepted: payload.privacy_accepted ?? false,
      consent_timestamp:
        payload.privacy_accepted ?? payload.marketing_consent
          ? new Date().toISOString()
          : null,
    };

    const { data: existing } = await supabase
      .from("stakeholders")
      .select("id")
      .eq("email", stakeholderRow.email)
      .maybeSingle();

    let stakeholderId: string;
    let isExisting: boolean;

    if (existing) {
      await supabase
        .from("stakeholders")
        .update({
          last_activity_at: new Date().toISOString(),
          ...(signals.length && {
            segmentation_confidence: confidence,
            segmentation_signals: signals,
            stakeholder_type: stakeholderType,
          }),
        })
        .eq("id", existing.id);
      stakeholderId = existing.id;
      isExisting = true;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("stakeholders")
        .insert(stakeholderRow)
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      stakeholderId = inserted!.id;
      isExisting = false;
    }

    await supabase.from("stakeholder_interactions").insert({
      stakeholder_id: stakeholderId,
      interaction_type: "captured",
      interaction_data: { source: captureSource },
      page_url: payload.landing_page_url ?? null,
      score_delta: 1,
    });

    fireFunnelHooks(supabaseUrl, stakeholderId, stakeholderType);

    return new Response(
      JSON.stringify({
        stakeholder_id: stakeholderId,
        stakeholder_type: stakeholderType,
        confidence,
        funnel_stage: "captured",
        is_existing: isExisting,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("classify-stakeholder error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
