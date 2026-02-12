import { anthropic, CLAUDE_MODELS, calculateCost } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';
import { ParsedSpec, ParsedEndpoint } from '@/lib/utils/openapi-parser';

export interface PlaygroundConfig {
  apiId: string;
  apiKey: string;
  spec: ParsedSpec;
  language: 'javascript' | 'python' | 'go' | 'ruby' | 'java' | 'php' | 'csharp' | 'typescript';
}

/**
 * Builds system prompt for AI code generation
 */
function buildSystemPrompt(config: PlaygroundConfig): string {
  const { spec, apiKey, language } = config;

  const endpointList = spec.endpoints
    .map((endpoint: ParsedEndpoint) => {
      return `- ${endpoint.method} ${endpoint.path}
  Description: ${endpoint.summary || endpoint.description || 'No description'}
  ${endpoint.parameters?.length ? `Parameters: ${endpoint.parameters.map(p => `${p.name} (${p.in}, ${p.required ? 'required' : 'optional'})`).join(', ')}` : ''}`;
    })
    .join('\n\n');

  return `You are an expert API integration assistant for ${spec.info.title}. You help developers write production-ready code to integrate with this API.

API Details:
- Name: ${spec.info.title}
- Description: ${spec.info.description || 'No description available'}
- Base URL: ${spec.info.baseUrl}
- Version: ${spec.info.version}
- Authentication: API Key via X-API-Key header
- User's API Key: ${apiKey}

Available Endpoints:
${endpointList}

Generate code in ${language} that:
1. Uses proper error handling and catches all potential errors
2. Includes type definitions where applicable (TypeScript, Go, Java, C#)
3. Follows best practices and conventions for ${language}
4. Is production-ready with proper logging (not just a demo)
5. Includes clear comments explaining each step
6. Handles rate limiting with exponential backoff if relevant
7. Validates input parameters before making requests
8. Parses and handles the API response properly

Important:
- Always include the API key in the X-API-Key header
- Use proper HTTP client libraries for ${language}
- Include error handling for network failures, API errors, and edge cases
- For async operations, use appropriate patterns (promises, async/await, goroutines, etc.)
- Keep code clean, readable, and maintainable

When the user asks a question, generate complete, runnable code that solves their problem. Be concise but thorough.`;
}

/**
 * Generates code using Claude API with streaming response
 */
export async function* generateCode(
  config: PlaygroundConfig,
  userPrompt: string,
  userId: string,
  organizationId: string,
  sessionId?: string
): AsyncGenerator<string> {
  const systemPrompt = buildSystemPrompt(config);

  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 4096,
    temperature: 0.3,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  let fullResponse = '';
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of stream) {
    if (chunk.type === 'message_start') {
      inputTokens = chunk.message.usage.input_tokens;
    } else if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullResponse += text;
        yield text;
      }
    } else if (chunk.type === 'message_delta') {
      outputTokens = chunk.usage.output_tokens;
    }
  }

  // Log usage
  const cost = calculateCost(CLAUDE_MODELS.SONNET, inputTokens, outputTokens);
  const supabase = createAdminClient();

  await supabase.from('ai_usage_tracking').insert({
    user_id: userId,
    organization_id: organizationId,
    feature: 'playground',
    model: CLAUDE_MODELS.SONNET,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: cost,
    session_id: sessionId,
  });

  logger.info('AI code generated', {
    userId,
    language: config.language,
    inputTokens,
    outputTokens,
    cost,
  });
}

/**
 * Explains code using AI
 */
export async function* explainCode(
  code: string,
  language: string,
  userId: string,
  organizationId: string
): AsyncGenerator<string> {
  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 2048,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: `Explain this ${language} code in detail. Focus on what each section does, highlighting:
- API calls and their purpose
- Error handling strategies
- Data transformation logic
- Best practices being followed

Be educational and help a developer understand how this code works.

Code:
\`\`\`${language}
${code}
\`\`\``,
      },
    ],
  });

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of stream) {
    if (chunk.type === 'message_start') {
      inputTokens = chunk.message.usage.input_tokens;
    } else if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    } else if (chunk.type === 'message_delta') {
      outputTokens = chunk.usage.output_tokens;
    }
  }

  const cost = calculateCost(CLAUDE_MODELS.SONNET, inputTokens, outputTokens);
  const supabase = createAdminClient();

  await supabase.from('ai_usage_tracking').insert({
    user_id: userId,
    organization_id: organizationId,
    feature: 'explain',
    model: CLAUDE_MODELS.SONNET,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: cost,
  });
}

/**
 * Debugs code errors using AI
 */
export async function* debugError(
  code: string,
  error: string,
  language: string,
  userId: string,
  organizationId: string
): AsyncGenerator<string> {
  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 3072,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: `Debug this ${language} code that is producing an error. Identify the issue and provide a fixed version.

Code:
\`\`\`${language}
${code}
\`\`\`

Error:
\`\`\`
${error}
\`\`\`

Please:
1. Explain what's causing the error
2. Provide the corrected code
3. Explain what was changed and why`,
      },
    ],
  });

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of stream) {
    if (chunk.type === 'message_start') {
      inputTokens = chunk.message.usage.input_tokens;
    } else if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    } else if (chunk.type === 'message_delta') {
      outputTokens = chunk.usage.output_tokens;
    }
  }

  const cost = calculateCost(CLAUDE_MODELS.SONNET, inputTokens, outputTokens);
  const supabase = createAdminClient();

  await supabase.from('ai_usage_tracking').insert({
    user_id: userId,
    organization_id: organizationId,
    feature: 'debug',
    model: CLAUDE_MODELS.SONNET,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: cost,
  });
}

/**
 * Natural language API exploration
 */
export async function* exploreAPI(
  spec: ParsedSpec,
  query: string,
  userId: string,
  organizationId: string
): AsyncGenerator<string> {
  const endpointList = spec.endpoints
    .map(
      (e: ParsedEndpoint) =>
        `${e.method} ${e.path} - ${e.summary || e.description || 'No description'}`
    )
    .join('\n');

  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 2048,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `You are an API documentation assistant for ${spec.info.title}.

Available endpoints:
${endpointList}

User query: ${query}

Help the user find and understand the relevant endpoints. Be concise and helpful.`,
      },
    ],
  });

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of stream) {
    if (chunk.type === 'message_start') {
      inputTokens = chunk.message.usage.input_tokens;
    } else if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    } else if (chunk.type === 'message_delta') {
      outputTokens = chunk.usage.output_tokens;
    }
  }

  const cost = calculateCost(CLAUDE_MODELS.SONNET, inputTokens, outputTokens);
  const supabase = createAdminClient();

  await supabase.from('ai_usage_tracking').insert({
    user_id: userId,
    organization_id: organizationId,
    feature: 'explore',
    model: CLAUDE_MODELS.SONNET,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: cost,
  });
}
