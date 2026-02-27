import { anthropic, CLAUDE_MODELS, calculateCost } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

export interface APIReviewScore {
  overall_score: number;
  spec_completeness: number;
  docs_coverage: number;
  error_handling: number;
  versioning: number;
  summary: string;
}

interface APIInput {
  id: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  base_url?: string | null;
  version?: string | null;
}

/**
 * Scores an API submission for quality using Claude.
 * Evaluates spec completeness, documentation, error handling, and versioning.
 */
export async function scoreAPISubmission(
  api: APIInput,
  openApiRaw: string | null
): Promise<APIReviewScore> {
  const specSection = openApiRaw
    ? `OpenAPI Spec (first 8000 chars):\n\`\`\`\n${openApiRaw.slice(0, 8000)}\n\`\`\``
    : 'No OpenAPI spec provided.';

  const prompt = `You are an API quality reviewer. Score the following API submission on four dimensions, each 0–100, then write a 2–3 sentence summary.

API Details:
- Name: ${api.name}
- Description: ${api.description ?? api.short_description ?? 'Not provided'}
- Base URL: ${api.base_url ?? 'Not provided'}
- Declared Version: ${api.version ?? 'Not provided'}

${specSection}

Score each dimension strictly and objectively:

1. **spec_completeness** (0–100): Are all endpoints documented? Are request/response schemas defined? Are parameters described? Penalty if spec is missing entirely.
2. **docs_coverage** (0–100): Are descriptions present on endpoints, parameters, and schemas? Are examples or sample responses provided?
3. **error_handling** (0–100): Are error responses (4xx, 5xx) defined with schema and meaningful descriptions? Are common errors handled?
4. **versioning** (0–100): Is a version present in the spec or base URL? Is there a changelog or deprecation policy?

Respond ONLY with valid JSON in this exact format (no markdown fences, no extra text):
{"overall_score":75,"spec_completeness":80,"docs_coverage":70,"error_handling":60,"versioning":90,"summary":"The API has a solid OpenAPI spec with most endpoints documented. Error responses could be more descriptive. Versioning is well declared via the base URL."}`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODELS.HAIKU,
      max_tokens: 512,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = calculateCost(CLAUDE_MODELS.HAIKU, inputTokens, outputTokens);
    // ai_usage_tracking requires non-null user/org — skip for system-initiated reviewer
    void cost;

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    let parsed: Partial<APIReviewScore>;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      logger.warn('api-reviewer: failed to parse JSON, using fallback', { text });
      parsed = {};
    }

    const clamp = (v: unknown) =>
      typeof v === 'number' ? Math.max(0, Math.min(100, Math.round(v))) : 50;

    const spec_completeness = clamp(parsed.spec_completeness);
    const docs_coverage = clamp(parsed.docs_coverage);
    const error_handling = clamp(parsed.error_handling);
    const versioning = clamp(parsed.versioning);
    const overall_score =
      typeof parsed.overall_score === 'number'
        ? clamp(parsed.overall_score)
        : Math.round((spec_completeness + docs_coverage + error_handling + versioning) / 4);
    const summary =
      typeof parsed.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim()
        : 'No summary available.';

    return { overall_score, spec_completeness, docs_coverage, error_handling, versioning, summary };
  } catch (err) {
    logger.error('api-reviewer: failed to score API', { apiId: api.id, err });
    return {
      overall_score: 0,
      spec_completeness: 0,
      docs_coverage: 0,
      error_handling: 0,
      versioning: 0,
      summary: 'AI review could not be completed at this time.',
    };
  }
}

/**
 * Runs the AI reviewer and upserts the result into api_review_scores.
 */
export async function runAndStoreReview(
  api: APIInput,
  openApiRaw: string | null
): Promise<APIReviewScore> {
  const score = await scoreAPISubmission(api, openApiRaw);
  const supabase = createAdminClient();
  await supabase
    .from('api_review_scores')
    .upsert(
      {
        api_id: api.id,
        overall_score: score.overall_score,
        spec_completeness: score.spec_completeness,
        docs_coverage: score.docs_coverage,
        error_handling: score.error_handling,
        versioning: score.versioning,
        summary: score.summary,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'api_id' }
    );
  return score;
}
