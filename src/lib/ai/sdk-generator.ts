import { anthropic, CLAUDE_MODELS, calculateCost } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

export type SDKLanguage =
  | 'typescript'
  | 'python'
  | 'go'
  | 'java'
  | 'csharp'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'dart'
  | 'rust';

export const SDK_LANGUAGE_META: Record<SDKLanguage, { label: string; filename: string; ext: string }> = {
  typescript: { label: 'TypeScript', filename: 'client.ts', ext: 'ts' },
  python: { label: 'Python', filename: 'client.py', ext: 'py' },
  go: { label: 'Go', filename: 'client.go', ext: 'go' },
  java: { label: 'Java', filename: 'Client.java', ext: 'java' },
  csharp: { label: 'C#', filename: 'Client.cs', ext: 'cs' },
  ruby: { label: 'Ruby', filename: 'client.rb', ext: 'rb' },
  php: { label: 'PHP', filename: 'Client.php', ext: 'php' },
  swift: { label: 'Swift', filename: 'Client.swift', ext: 'swift' },
  kotlin: { label: 'Kotlin', filename: 'Client.kt', ext: 'kt' },
  dart: { label: 'Dart', filename: 'client.dart', ext: 'dart' },
  rust: { label: 'Rust', filename: 'client.rs', ext: 'rs' },
};

export interface GeneratedSDK {
  code: string;
  language: SDKLanguage;
  filename: string;
}

/** Languages that tend to produce verbose output need more tokens */
const VERBOSE_LANGUAGES: SDKLanguage[] = ['java', 'csharp', 'swift', 'kotlin'];

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

  java: `Generate a complete Java 17+ SDK client. Include:
- A Client class with methods for every endpoint using java.net.http.HttpClient
- Record or POJO classes for all request and response types
- Proper error handling with a custom ApiException class
- Javadoc comments on all public methods
- Uses only standard library (java.net.http, com.google.gson for JSON if needed, otherwise manual parsing)
- Package declaration: package com.apimarketplace.sdk`,

  csharp: `Generate a complete C# (.NET 8+) SDK client. Include:
- A Client class with async methods for every endpoint using HttpClient
- Record or class types for all request and response DTOs
- Proper error handling with a custom ApiException class
- XML doc comments on all public methods
- Uses System.Net.Http and System.Text.Json
- Namespace: ApiMarketplace.Sdk`,

  ruby: `Generate a complete Ruby SDK client. Include:
- A Client class with methods for every endpoint using net/http
- Proper error handling with a custom ApiError class
- YARD documentation comments on all public methods
- Uses only the standard library (net/http, json, uri)
- The file should be self-contained and require-able`,

  php: `Generate a complete PHP 8.1+ SDK client. Include:
- A Client class with methods for every endpoint using cURL
- Typed properties and return types on all methods
- Proper error handling with a custom ApiException class
- PHPDoc comments on all public methods
- Uses only built-in functions (curl_*, json_encode/decode)
- Namespace: ApiMarketplace\\Sdk`,

  swift: `Generate a complete Swift 5.9+ SDK client. Include:
- A Client class with async/await methods for every endpoint using URLSession
- Codable structs for all request and response types
- Proper error handling with a custom APIError enum
- Documentation comments on all public methods
- Uses only Foundation framework`,

  kotlin: `Generate a complete Kotlin SDK client. Include:
- A Client class with suspend methods for every endpoint using OkHttp or java.net.http.HttpClient
- Data classes for all request and response types
- Proper error handling with a custom ApiException class
- KDoc comments on all public methods
- Uses kotlinx.serialization or Gson for JSON
- Package: com.apimarketplace.sdk`,

  dart: `Generate a complete Dart SDK client. Include:
- A Client class with async methods for every endpoint using the http package
- Typed classes for all request and response models with fromJson/toJson
- Proper error handling with a custom ApiException class
- Dartdoc comments on all public methods
- Depends only on the \`http\` package (pub.dev)`,

  rust: `Generate a complete Rust SDK client. Include:
- A Client struct with async methods for every endpoint using reqwest
- Serde-serializable structs for all request and response types
- Proper error handling using thiserror or a custom Error enum
- Doc comments on all public items
- Dependencies: reqwest, serde, serde_json, tokio`,
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
  const maxTokens = VERBOSE_LANGUAGES.includes(language) ? 8192 : 4096;

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
    max_tokens: maxTokens,
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
