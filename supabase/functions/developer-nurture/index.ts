import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "noreply@apimarketplace.pro";

interface NurtureStep {
  delay_hours: number;
  subject: string;
  template: string;
  condition?: string;
}

const DEVELOPER_SEQUENCES: Record<string, NurtureStep[]> = {
  signed_up: [
    { delay_hours: 0.5, subject: "Your API key is ready — make your first call in 30 seconds", template: "dev_welcome" },
    { delay_hours: 24, subject: "3 APIs trending this week that match your stack", template: "dev_trending_apis" },
    { delay_hours: 72, subject: "Build something cool? Share it and get $10 credit", template: "dev_referral_intro" },
  ],
  api_key_created: [
    { delay_hours: 48, subject: "Haven't made your first call yet? Here's a 1-min quickstart", template: "dev_activation_nudge", condition: "first_call_made IS NULL" },
  ],
  first_call_made: [
    { delay_hours: 2, subject: "🎉 First API call success! Here's what to try next", template: "dev_first_call_celebration" },
  ],
  active_user: [
    { delay_hours: 168, subject: "Your API usage this week + new APIs you might like", template: "dev_weekly_digest" },
  ],
  code_generated: [
    { delay_hours: 1, subject: "Ready to test that code live? Get your free API key", template: "dev_post_codegen_cta" },
  ],
};

function buildEmailHtml(template: string, data: Record<string, unknown>): string {
  const name = (data.full_name as string) || "Developer";
  const apiUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://apimarketplace.pro";

  const templates: Record<string, string> = {
    dev_welcome: `
      <h2>Welcome, ${name}! 👋</h2>
      <p>Your account is ready. Here's how to make your first API call in 30 seconds:</p>
      <ol>
        <li>Go to <a href="${apiUrl}/dashboard/settings/api-keys">API Keys</a> and generate a key</li>
        <li>Browse the <a href="${apiUrl}/marketplace">marketplace</a> and find an API</li>
        <li>Click "Generate Code" to get instant integration code in your language</li>
      </ol>
      <p><a href="${apiUrl}/marketplace" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Explore APIs →</a></p>
    `,
    dev_trending_apis: `
      <h2>Trending APIs this week 📈</h2>
      <p>Based on your preferences, here are APIs developers are integrating right now:</p>
      <p><a href="${apiUrl}/marketplace">Browse trending APIs →</a></p>
    `,
    dev_referral_intro: `
      <h2>Share and earn $10 💰</h2>
      <p>Built something cool with our marketplace? Share your referral link and earn $10 credit for each developer who signs up.</p>
      <p><a href="${apiUrl}/dashboard/referrals">Get your referral link →</a></p>
    `,
    dev_activation_nudge: `
      <h2>Still haven't made your first call? 🚀</h2>
      <p>It takes less than 60 seconds. Here's the fastest path:</p>
      <ol>
        <li><a href="${apiUrl}/marketplace">Pick any API</a></li>
        <li>Click "Generate Code" — choose your language</li>
        <li>Copy, paste, run</li>
      </ol>
      <p><a href="${apiUrl}/marketplace">Make your first call now →</a></p>
    `,
    dev_first_call_celebration: `
      <h2>You made your first API call! 🎉</h2>
      <p>That's activation. Here's what to explore next:</p>
      <ul>
        <li><a href="${apiUrl}/marketplace">Discover more APIs</a> in your stack</li>
        <li><a href="${apiUrl}/dashboard/analytics">View your usage stats</a></li>
        <li><a href="${apiUrl}/dashboard/collections">Create an API collection</a></li>
      </ul>
    `,
    dev_weekly_digest: `
      <h2>Your API activity this week 📊</h2>
      <p>Check your detailed analytics and discover new APIs that match your projects.</p>
      <p><a href="${apiUrl}/dashboard/analytics">View your analytics →</a></p>
    `,
    dev_post_codegen_cta: `
      <h2>Your code is ready to run 🔧</h2>
      <p>You generated integration code — now get a free API key to test it live in 30 seconds.</p>
      <p><a href="${apiUrl}/signup?ref=nurture_codegen" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Sign up free →</a></p>
    `,
  };

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a2e;">
    ${templates[template] ?? `<p>Hi ${name}, thanks for using API Marketplace!</p>`}
    <hr style="margin-top:40px;border:none;border-top:1px solid #eee;"/>
    <p style="font-size:12px;color:#888;">You're receiving this because you signed up at <a href="${apiUrl}">${apiUrl}</a>. <a href="${apiUrl}/dashboard/settings/notifications">Unsubscribe</a></p>
  </body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[developer-nurture] Skipping send (no RESEND_API_KEY): to=${to}, subject=${subject}`);
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Resend error:", result);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Email send failed:", e);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Accept either a single trigger or a batch run
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const stageTrigger = body.stage as string | undefined;
    const stakeholderIdTrigger = body.stakeholder_id as string | undefined;

    // If called with a specific stakeholder_id + stage, process just that one
    if (stakeholderIdTrigger && stageTrigger) {
      const steps = DEVELOPER_SEQUENCES[stageTrigger] ?? [];
      if (steps.length === 0) {
        return new Response(JSON.stringify({ ok: true, message: "No sequence for stage" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: stakeholder } = await supabase
        .from("stakeholders")
        .select("id, email, full_name")
        .eq("id", stakeholderIdTrigger)
        .single();

      if (!stakeholder) {
        return new Response(JSON.stringify({ error: "Stakeholder not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let sent = 0;
      for (const step of steps) {
        const scheduledFor = new Date(Date.now() + step.delay_hours * 3600 * 1000);
        // Immediate send if delay is <= 0, otherwise insert into a queue for later
        if (step.delay_hours <= 0) {
          const html = buildEmailHtml(step.template, stakeholder as Record<string, unknown>);
          const ok = await sendEmail(stakeholder.email, step.subject, html);
          if (ok) sent++;
        } else {
          // Log for scheduling (a cron can pick this up)
          await supabase.from("stakeholder_interactions").insert({
            stakeholder_id: stakeholder.id,
            interaction_type: "nurture_scheduled",
            interaction_data: { template: step.template, subject: step.subject, scheduled_for: scheduledFor.toISOString(), stage: stageTrigger },
            score_delta: 0,
          }).catch(() => {});
        }
      }

      return new Response(JSON.stringify({ ok: true, sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Batch mode: find developers with overdue scheduled nurture interactions and send them
    // This is designed to run as a cron (e.g. every hour)
    const { data: scheduled } = await supabase
      .from("stakeholder_interactions")
      .select("id, stakeholder_id, interaction_data")
      .eq("interaction_type", "nurture_scheduled")
      .lte("created_at", new Date().toISOString())
      .limit(50);

    if (!scheduled?.length) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sent = 0;
    for (const row of scheduled) {
      const data = row.interaction_data as Record<string, unknown>;
      const scheduledFor = data.scheduled_for as string;
      if (new Date(scheduledFor) > new Date()) continue; // Not yet due

      const { data: stakeholder } = await supabase
        .from("stakeholders")
        .select("email, full_name")
        .eq("id", row.stakeholder_id)
        .single();

      if (!stakeholder) continue;

      const html = buildEmailHtml(data.template as string, stakeholder as Record<string, unknown>);
      const ok = await sendEmail(stakeholder.email, data.subject as string, html);
      if (ok) {
        sent++;
        // Mark as sent by updating interaction type
        await supabase.from("stakeholder_interactions").update({ interaction_type: "nurture_sent" }).eq("id", row.id);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: scheduled.length, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("developer-nurture error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
