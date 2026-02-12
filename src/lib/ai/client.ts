import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/utils/logger';

if (!process.env.ANTHROPIC_API_KEY) {
  logger.warn('ANTHROPIC_API_KEY not set - AI Playground features will be disabled');
}

/**
 * Anthropic Claude client for AI code generation features.
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
});

/**
 * Claude model configurations
 */
export const CLAUDE_MODELS = {
  SONNET: 'claude-sonnet-4-20250514',
  OPUS: 'claude-opus-4-20250514',
  HAIKU: 'claude-3-5-haiku-20241022',
} as const;

/**
 * Pricing per million tokens (input/output)
 */
export const MODEL_PRICING = {
  [CLAUDE_MODELS.SONNET]: { input: 3.0, output: 15.0 },
  [CLAUDE_MODELS.OPUS]: { input: 15.0, output: 75.0 },
  [CLAUDE_MODELS.HAIKU]: { input: 0.8, output: 4.0 },
} as const;

/**
 * Calculate cost for token usage
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}
