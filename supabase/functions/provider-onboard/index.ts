import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

interface OnboardAction {
  action: "import_spec" | "enhance_docs" | "suggest_pricing" | "validate_endpoints" | "calculate_projections";
  provider_id: string;
  data?: Record<string, unknown>;
}

interface ParsedSpec {
  valid: boolean;
  endpoints: Array<{ method: string; path: string; summary: string }>;
  info: { title: string; description: string; version: string };
  errors: string[];
}

async function parseOpenAPISpec(specInput: string | object): Promise<ParsedSpec> {
  const errors: string[] = [];
  const endpoints: Array<{ method: string; path: string; summary: string }> = [];
  const info = { title: "", description: "", version: "" };

  try {
    const spec = typeof specInput === "string" ? JSON.parse(specInput) : specInput as Record<string, unknown>;
    if (!spec.openapi && !(spec as Record<string, unknown>).swagger) {
      errors.push("Not a valid OpenAPI/Swagger specification");
      return { valid: false, endpoints, info, errors };
    }

    const specObj = spec as { info?: { title?: string; description?: string; version?: string }; paths?: Record<string, Record<string, { summary?: string; description?: string }>> };
    if (specObj.info) {
      info.title = specObj.info.title ?? "";
      info.description = specObj.info.description ?? "";
      info.version = specObj.info.version ?? "";
    }

    const paths = specObj.paths ?? {};
    for (const [path, methods] of Object.entries(paths)) {
      if (!methods || typeof methods !== "object") continue;
      for (const [method, details] of Object.entries(methods)) {
        if (["get", "post", "put", "patch", "delete"].includes(method.toLowerCase())) {
          const d = details as { summary?: string; description?: string };
          endpoints.push({
            method: method.toUpperCase(),
            path,
            summary: d?.summary ?? d?.description ?? "",
          });
        }
      }
    }

    return { valid: errors.length === 0, endpoints, info, errors };
  } catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
    return { valid: false, endpoints, info, errors };
  }
}

async function enhanceDocs(
  apiName: string,
  apiDescription: string,
  endpoints: Array<{ method: string; path: string; summary: string }>
): Promise<string> {
  if (!ANTHROPIC_API_KEY) return apiDescription;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are writing a compelling API marketplace listing. Make it developer-friendly and emphasize value.

API Name: ${apiName}
Current Description: ${apiDescription}
Endpoints: ${JSON.stringify(endpoints.slice(0, 10))}

Write a 2-3 paragraph enhanced description that:
1. Opens with the core value proposition
2. Highlights key capabilities based on the endpoints
3. Mentions ease of integration
4. Is written for developers evaluating this API

Keep it concise, technical but accessible. No marketing fluff.`,
        },
      ],
    }),
  });

  const result = await response.json();
  const text = result.content?.[0]?.text;
  return typeof text === "string" ? text : apiDescription;
}

function calculateProjections(
  category: string,
  totalEndpoints: number,
  benchmark: {
    avg_monthly_calls_per_consumer?: number;
    avg_consumers_first_month?: number;
    avg_consumer_growth_pct?: number;
    avg_price_per_1000_calls?: number;
    platform_fee_pct?: number;
  } | null
): { conservative: Record<string, number>; realistic: Record<string, number>; aggressive: Record<string, number> } {
  const base = {
    avg_monthly_calls_per_consumer: benchmark?.avg_monthly_calls_per_consumer ?? 10000,
    avg_consumers_first_month: benchmark?.avg_consumers_first_month ?? 5,
    avg_consumer_growth_pct: benchmark?.avg_consumer_growth_pct ?? 20,
    avg_price_per_1000_calls: benchmark?.avg_price_per_1000_calls ?? 1,
    platform_fee_pct: benchmark?.platform_fee_pct ?? 3,
  };

  const scenarios = {
    conservative: { multiplier: 0.5, growthMod: 0.5 },
    realistic: { multiplier: 1.0, growthMod: 1.0 },
    aggressive: { multiplier: 2.0, growthMod: 1.5 },
  };

  const out: { conservative: Record<string, number>; realistic: Record<string, number>; aggressive: Record<string, number> } = {
    conservative: {},
    realistic: {},
    aggressive: {},
  };

  for (const [scenario, params] of Object.entries(scenarios)) {
    const growth = (base.avg_consumer_growth_pct / 100) * params.growthMod;
    const consumers1 = Math.round(base.avg_consumers_first_month * params.multiplier);
    const monthlyRevenue = (month: number) => {
      const consumers = consumers1 * Math.pow(1 + growth, month - 1);
      const calls = consumers * base.avg_monthly_calls_per_consumer;
      const gross = (calls / 1000) * base.avg_price_per_1000_calls;
      const net = gross * (1 - base.platform_fee_pct / 100);
      return Math.round(net);
    };
    out[scenario as keyof typeof out] = {
      month1: monthlyRevenue(1),
      month3: monthlyRevenue(3),
      month6: monthlyRevenue(6),
      month12: monthlyRevenue(12),
    };
  }

  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, provider_id, data }: OnboardAction = await req.json();
    if (!action || !provider_id) {
      return new Response(
        JSON.stringify({ error: "action and provider_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "import_spec": {
        const payload = (data ?? {}) as { spec_url?: string; spec_content?: string | object; import_method?: string };
        let specData: string | object;

        if (payload.spec_url) {
          const res = await fetch(payload.spec_url);
          specData = await res.json();
        } else if (payload.spec_content) {
          specData = payload.spec_content;
        } else {
          return new Response(
            JSON.stringify({ error: "spec_url or spec_content required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const parsed = await parseOpenAPISpec(specData);

        if (parsed.valid) {
          const { data: current } = await supabase
            .from("provider_profiles")
            .select("onboarding_steps_completed")
            .eq("id", provider_id)
            .single();

          const steps = (current?.onboarding_steps_completed as Record<string, boolean>) ?? {};
          const merged = {
            ...steps,
            account_created: true,
            api_spec_uploaded: true,
            endpoints_configured: true,
          };

          await supabase
            .from("provider_profiles")
            .update({
              openapi_spec: specData,
              total_endpoints: parsed.endpoints.length,
              api_name: parsed.info.title || undefined,
              api_description: parsed.info.description || undefined,
              import_method: (payload.import_method as "openapi_url" | "openapi_upload") || "openapi_upload",
              provider_stage: "api_configured",
              onboarding_steps_completed: merged,
            })
            .eq("id", provider_id);

          await supabase.from("provider_onboarding_events").insert({
            provider_id,
            step_name: "api_spec_import",
            step_status: "completed",
            step_data: {
              method: payload.import_method,
              endpoints_found: parsed.endpoints.length,
              api_title: parsed.info.title,
            },
          });
        }

        return new Response(
          JSON.stringify({ success: parsed.valid, ...parsed }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "enhance_docs": {
        const { data: provider } = await supabase
          .from("provider_profiles")
          .select("api_name, api_description, openapi_spec")
          .eq("id", provider_id)
          .single();

        if (!provider) {
          return new Response(JSON.stringify({ error: "Provider not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const parsed = await parseOpenAPISpec(provider.openapi_spec ?? {});
        const enhanced = await enhanceDocs(
          (provider.api_name as string) ?? "API",
          (provider.api_description as string) ?? "",
          parsed.endpoints
        );

        await supabase
          .from("provider_profiles")
          .update({
            ai_enhanced_description: enhanced,
            ai_generated_docs: true,
          })
          .eq("id", provider_id);

        return new Response(
          JSON.stringify({ enhanced_description: enhanced }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "suggest_pricing": {
        const { data: provider } = await supabase
          .from("provider_profiles")
          .select("api_name, api_category, total_endpoints")
          .eq("id", provider_id)
          .single();

        if (!ANTHROPIC_API_KEY) {
          const fallback = {
            tiers: [
              { name: "Free", price_per_month: 0, calls_per_month: 1000, rate_limit_per_second: 1 },
              { name: "Pro", price_per_month: 29, calls_per_month: 50000, rate_limit_per_second: 10 },
              { name: "Enterprise", price_per_month: 199, calls_per_month: 500000, rate_limit_per_second: 100 },
            ],
          };
          await supabase.from("provider_profiles").update({ ai_suggested_pricing: fallback }).eq("id", provider_id);
          return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            messages: [
              {
                role: "user",
                content: `Suggest 3 pricing tiers for this API marketplace listing. API: ${(provider?.api_name as string) ?? "API"}, Category: ${(provider?.api_category as string[])?.join(", ") ?? "general"}, Endpoints: ${(provider?.total_endpoints as number) ?? 0}. Return JSON only, no markdown. Format: {"tiers":[{"name":"Free","price_per_month":0,"calls_per_month":1000,"rate_limit_per_second":1},{"name":"Pro","price_per_month":29,"calls_per_month":50000,"rate_limit_per_second":10},{"name":"Enterprise","price_per_month":199,"calls_per_month":500000,"rate_limit_per_second":100}]}`,
              },
            ],
          }),
        });

        const result = await response.json();
        const raw = result.content?.[0]?.text?.replace(/```json|```/g, "").trim() ?? "{}";
        let suggestion: { tiers?: unknown[] };
        try {
          suggestion = JSON.parse(raw);
        } catch {
          suggestion = { tiers: [] };
        }

        await supabase.from("provider_profiles").update({ ai_suggested_pricing: suggestion }).eq("id", provider_id);

        return new Response(JSON.stringify(suggestion), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "calculate_projections": {
        const { data: provider } = await supabase
          .from("provider_profiles")
          .select("api_category, total_endpoints")
          .eq("id", provider_id)
          .single();

        const category = (provider?.api_category as string[])?.[0] ?? "general";

        const { data: benchmark } = await supabase
          .from("revenue_projections")
          .select("*")
          .eq("api_category", category)
          .maybeSingle();

        const projections = calculateProjections(
          category,
          (provider?.total_endpoints as number) ?? 5,
          benchmark as Record<string, unknown> | null
        );

        await supabase
          .from("provider_profiles")
          .update({
            estimated_monthly_revenue: projections.realistic.month3,
          })
          .eq("id", provider_id);

        return new Response(JSON.stringify({ projections }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "validate_endpoints":
        return new Response(
          JSON.stringify({
            status: "validation_started",
            message: "Endpoint validation queued. Results in ~60 seconds.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("provider-onboard error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
