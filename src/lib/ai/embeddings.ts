import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

/**
 * Generates an embedding vector for the given text using OpenAI.
 * Returns null if OPENAI_API_KEY is not configured.
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('embeddings: OPENAI_API_KEY not set — embeddings disabled');
    return null;
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text.slice(0, 8192),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI embeddings error ${res.status}: ${body}`);
  }

  const json = await res.json() as { data: { embedding: number[] }[] };
  return json.data[0]?.embedding ?? null;
}

/**
 * Builds the embedding text for an API from its fields.
 */
export function buildApiEmbeddingText(api: {
  name: string;
  description?: string | null;
  short_description?: string | null;
  category?: string | null;
  tags?: string[] | null;
}): string {
  const parts = [
    api.name,
    api.short_description ?? '',
    api.description ?? '',
    api.category ? `Category: ${api.category}` : '',
    api.tags?.length ? `Tags: ${api.tags.join(', ')}` : '',
  ].filter(Boolean);
  return parts.join(' ').trim();
}

/**
 * Upserts the embedding for a single API into api_embeddings.
 */
export async function upsertAPIEmbedding(apiId: string, text: string): Promise<boolean> {
  const embedding = await getEmbedding(text);
  if (!embedding) return false;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('api_embeddings')
    .upsert(
      {
        api_id: apiId,
        embedding: JSON.stringify(embedding) as unknown as string,
        embedding_text: text.slice(0, 500),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'api_id' }
    );

  if (error) {
    logger.error('embeddings: upsert failed', { apiId, error });
    return false;
  }
  return true;
}

export { EMBEDDING_DIM };
