import { anthropic, CLAUDE_MODELS, calculateCost } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

export type SDKLanguage = 'typescript' | 'python' | 'go';

export const SDK_LANGUAGE_META: Record<SDKLanguage, { label: string; filename: string; ext: string }> = {
  typescript: { label: 'TypeScript', filename: 'client.ts', ext: 'ts' },
  python: { label: 'Python', filename: 'client.py', ext: 'py' },
  go: { label: 'Go', filename: 'client.go', ext: 'go' },
};

export interface GeneratedSDK {
  code: string;
  language: SDKLanguage;
  filename: string;
}

const LANGUAGE_INSTRUCTIONS: Record<SDKLanguage, string> = {
  typescript: `Generate a complete, typed TypeScript/Node.js SDK client using the native fetch API (no external dependencies besides built-in). Include:
- A typed client class with methods for every endpoint
- Full TypeScript interfaces for all request and response bodies
- Proper error handling with a custom APIError class
- JSDoc comments on all public methods
- The file should be self-contained and importable without additional setup`,

  python: `Generate a complete Python 3.10+ SDK client using the \`requests\` library. Include:
- A typed client class (using dataclasses and type hints) with methods for every endpoint
- Type annotations on all parameters and return values
- Proper error handling with a custom APIError exception class
- Docstrings on all public methods
- The file should be self-contained (only needs \`requests\` installed)`,

  go: `Generate a complete Go SDK client. Include:
- A Client struct with methods for every endpoint
- Go structs for all request and response types
- Proper error handling using Go's error interface
- Comments on all exported types and functions
- Uses only the standard library (net/http, encoding/json)`,
};

/**
 * Generates a typed SDK client for the given API spec and language using Claude.
 */
export async function generateSDK(
  apiName: string,
  apiId: string,
  openApiRaw: string,
  language: SDKLanguage,
  userId: string | null,
  organizationId: string | null
): Promise<GeneratedSDK> {
  const meta = SDK_LANGUAGE_META[language];
  const specSnippet = openApiRaw.slice(0, 12000);

  const prompt = `You are an expert SDK generator. Given the following OpenAPI specification, generate a production-ready SDK client.

API Name: ${apiName}
Language: ${meta.label}

${LANGUAGE_INSTRUCTIONS[language]}

OpenAPI Specification:
\`\`\`
${specSnippet}
\`\`\`

Important rules:
- Output ONLY the source code file content — no explanation, no markdown fences, no comments outside the code
- The client must authenticate via an API key passed to the constructor (header: X-API-Key)
- Every endpoint in the spec must have a corresponding method
- Handle HTTP error status codes by throwing/raising an appropriate error`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODELS.HAIKU,
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const cost = calculateCost(CLAUDE_MODELS.HAIKU, inputTokens, outputTokens);

  if (userId && organizationId) {
    try {
      const supabase = createAdminClient();
      await supabase.from('ai_usage_tracking').insert({
        user_id: userId,
        organization_id: organizationId,
        feature: 'sdk_generator',
        model: CLAUDE_MODELS.HAIKU,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: cost,
      });
    } catch (err) {
      logger.warn('sdk-generator: could not log usage', { err });
    }
  }

  const code = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  return {
    code: code.trim(),
    language,
    filename: `${apiId.slice(0, 8)}_${meta.filename}`,
  };
}
