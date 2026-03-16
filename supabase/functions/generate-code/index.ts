import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

interface CodeGenRequest {
  api_name: string;
  api_base_url: string;
  endpoint_path: string;
  http_method: string;
  language: string;
  framework?: string;
  auth_type?: string;
  request_body_schema?: object;
  response_schema?: object;
  developer_id?: string;
  session_id?: string;
  api_id?: string;
}

const LANGUAGE_CONFIGS: Record<string, { name: string; extension: string; packageManager: string }> = {
  python: { name: "Python", extension: "py", packageManager: "pip install requests" },
  javascript: { name: "JavaScript", extension: "js", packageManager: "npm install node-fetch" },
  typescript: { name: "TypeScript", extension: "ts", packageManager: "npm install node-fetch @types/node-fetch" },
  go: { name: "Go", extension: "go", packageManager: "go get net/http" },
  curl: { name: "cURL", extension: "sh", packageManager: "" },
  rust: { name: "Rust", extension: "rs", packageManager: "# Add to Cargo.toml: reqwest = { features = [\"json\"] }" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body: CodeGenRequest = await req.json();

    if (!body.api_name || !body.endpoint_path || !body.http_method || !body.language) {
      return new Response(
        JSON.stringify({ error: "api_name, endpoint_path, http_method, language required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langConfig = LANGUAGE_CONFIGS[body.language] ?? LANGUAGE_CONFIGS.javascript;
    const baseUrl = body.api_base_url || "https://api.example.com";

    let generatedCode = "// Error generating code";

    if (ANTHROPIC_API_KEY) {
      const prompt = `Generate production-ready ${langConfig.name} code to call this API endpoint.

API: ${body.api_name}
Base URL: ${baseUrl}
Endpoint: ${body.http_method.toUpperCase()} ${body.endpoint_path}
Auth: ${body.auth_type || "api_key"}
${body.framework ? `Framework: ${body.framework}` : ""}
${body.request_body_schema ? `Request Body Schema: ${JSON.stringify(body.request_body_schema)}` : ""}
${body.response_schema ? `Response Schema: ${JSON.stringify(body.response_schema)}` : ""}

Requirements:
1. Include proper error handling
2. Use modern ${langConfig.name} patterns
3. Include TypeScript types if applicable
4. Add clear comments explaining each step
5. Use environment variable for API key (never hardcode) — name it API_KEY
6. Show example usage at the bottom
7. Be copy-paste ready

Return ONLY the code, no explanations outside of code comments. No markdown fences.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const result = await response.json();
      generatedCode = result.content?.[0]?.text || generatedCode;
    } else {
      // Fallback stub when no API key is set
      generatedCode = generateFallbackCode(body, langConfig);
    }

    // Log the generation
    const { data: codeGenRow } = await supabase.from("code_generations").insert({
      developer_id: body.developer_id ?? null,
      session_id: body.session_id ? body.session_id as unknown : null,
      api_id: body.api_id ?? null,
      api_name: body.api_name,
      language: body.language,
      framework: body.framework ?? null,
      generated_code: generatedCode,
      code_quality_score: 0.85,
    }).select("id").single();

    // Update developer stats if logged in
    if (body.developer_id) {
      const { data: dev } = await supabase
        .from("developer_profiles")
        .select("code_generations, first_code_gen_at, developer_stage")
        .eq("id", body.developer_id)
        .single();

      if (dev) {
        const updates: Record<string, unknown> = {
          code_generations: ((dev.code_generations as number) || 0) + 1,
          preferred_language: body.language,
        };
        if (!dev.first_code_gen_at) {
          updates.first_code_gen_at = new Date().toISOString();
          updates.first_code_gen_language = body.language;
        }
        const stage = dev.developer_stage as string;
        if (stage === "landed" || stage === "api_explored") {
          updates.developer_stage = "code_generated";
        }
        await supabase.from("developer_profiles").update(updates).eq("id", body.developer_id);

        // Record interaction
        const { data: devRow } = await supabase
          .from("developer_profiles")
          .select("stakeholder_id")
          .eq("id", body.developer_id)
          .single();
        if (devRow) {
          await supabase.from("stakeholder_interactions").insert({
            stakeholder_id: devRow.stakeholder_id,
            interaction_type: "code_generated",
            interaction_data: { api_name: body.api_name, language: body.language, framework: body.framework },
            score_delta: 15,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        code: generatedCode,
        language: body.language,
        framework: body.framework ?? null,
        install_command: langConfig.packageManager,
        file_extension: langConfig.extension,
        generation_id: codeGenRow?.id ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Code generation error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackCode(
  body: CodeGenRequest,
  lang: { name: string; extension: string }
): string {
  const url = `${body.api_base_url || "https://api.example.com"}${body.endpoint_path}`;
  const method = body.http_method.toUpperCase();

  switch (body.language) {
    case "python":
      return `import requests
import os

API_KEY = os.environ.get("API_KEY", "your-api-key")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# ${method} ${url}
response = requests.${method.toLowerCase()}(
    "${url}",
    headers=headers,
)

if response.ok:
    data = response.json()
    print(data)
else:
    print(f"Error {response.status_code}: {response.text}")
`;
    case "go":
      return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t"os"
)

func main() {
\tapiKey := os.Getenv("API_KEY")

\treq, err := http.NewRequest("${method}", "${url}", nil)
\tif err != nil {
\t\tpanic(err)
\t}
\treq.Header.Set("Authorization", "Bearer "+apiKey)
\treq.Header.Set("Content-Type", "application/json")

\tclient := &http.Client{}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tbody, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(body))
}
`;
    case "curl":
      return `curl -X ${method} "${url}" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json"
`;
    default: // javascript / typescript
      return `const API_KEY = process.env.API_KEY ?? "your-api-key";

async function call${body.api_name.replace(/\s+/g, "")}() {
  const response = await fetch("${url}", {
    method: "${method}",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status} \${response.statusText}\`);
  }

  const data = await response.json();
  return data;
}

// Example usage
call${body.api_name.replace(/\s+/g, "")}()
  .then(console.log)
  .catch(console.error);
`;
  }
}
