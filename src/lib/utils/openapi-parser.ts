import yaml from 'yaml';
import SwaggerParser from '@apidevtools/swagger-parser';

export interface ParsedEndpoint {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters: any[];
  requestBody?: any;
  responses: Record<string, any>;
  tags: string[];
  deprecated?: boolean;
}

export interface ParsedSpec {
  info: {
    title: string;
    version: string;
    description?: string;
    baseUrl: string;
  };
  endpoints: ParsedEndpoint[];
  auth: any[];
  tags: string[];
  errors: string[];
  warnings: string[];
}

export interface ParseError {
  message: string;
  line?: number;
  path?: string;
}

/**
 * Parses an OpenAPI specification from YAML or JSON.
 * Supports OpenAPI v2 (Swagger), v3.0, and v3.1.
 * 
 * @param input - Raw OpenAPI spec as string
 * @param format - Input format ('yaml' or 'json')
 * @returns Parsed specification with endpoints and metadata
 */
export async function parseOpenApiSpec(
  input: string,
  format: 'yaml' | 'json'
): Promise<ParsedSpec> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse input
    let spec: any;
    
    if (format === 'yaml') {
      try {
        spec = yaml.parse(input);
      } catch (err) {
        throw new Error(`YAML parsing error: ${err instanceof Error ? err.message : 'Invalid YAML'}`);
      }
    } else {
      try {
        spec = JSON.parse(input);
      } catch (err) {
        throw new Error(`JSON parsing error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
      }
    }

    // Validate and dereference $refs using swagger-parser
    let api: any;
    try {
      api = await SwaggerParser.validate(spec);
    } catch (err) {
      throw new Error(`OpenAPI validation error: ${err instanceof Error ? err.message : 'Invalid specification'}`);
    }

    // Determine OpenAPI version
    const version = api.openapi || api.swagger;
    if (!version) {
      throw new Error('Unable to determine OpenAPI/Swagger version');
    }

    // Extract base URL
    let baseUrl = '';
    if (api.servers && api.servers.length > 0) {
      // OpenAPI 3.x
      baseUrl = api.servers[0].url;
    } else if (api.host) {
      // Swagger 2.0
      const scheme = api.schemes?.[0] || 'https';
      const basePath = api.basePath || '';
      baseUrl = `${scheme}://${api.host}${basePath}`;
    }

    // Extract info
    const info = {
      title: api.info?.title || 'Untitled API',
      version: api.info?.version || '1.0.0',
      description: api.info?.description,
      baseUrl,
    };

    // Extract endpoints
    const endpoints: ParsedEndpoint[] = [];
    
    if (api.paths) {
      for (const [path, methods] of Object.entries(api.paths)) {
        if (typeof methods !== 'object' || methods === null) continue;

        for (const [method, operation] of Object.entries(methods as any)) {
          // Skip non-HTTP method properties
          if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
            continue;
          }

          if (typeof operation !== 'object' || operation === null) continue;

          const endpoint: ParsedEndpoint = {
            method: method.toUpperCase(),
            path,
            summary: operation.summary,
            description: operation.description,
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {},
            tags: operation.tags || [],
            deprecated: operation.deprecated || false,
          };

          endpoints.push(endpoint);
        }
      }
    }

    // Extract authentication methods
    const auth: any[] = [];
    if (api.securitySchemes || api.securityDefinitions) {
      const schemes = api.securitySchemes || api.securityDefinitions;
      for (const [name, scheme] of Object.entries(schemes)) {
        auth.push({ name, ...scheme });
      }
    }

    // Extract unique tags
    const tags = Array.from(
      new Set(
        endpoints.flatMap((e) => e.tags).filter(Boolean)
      )
    ) as string[];

    // Add warnings for deprecated features
    if (version.startsWith('2.')) {
      warnings.push('Swagger 2.0 detected. Consider upgrading to OpenAPI 3.x for better tooling support.');
    }

    const deprecatedEndpoints = endpoints.filter((e) => e.deprecated);
    if (deprecatedEndpoints.length > 0) {
      warnings.push(`${deprecatedEndpoints.length} endpoint(s) are marked as deprecated.`);
    }

    return {
      info,
      endpoints,
      auth,
      tags,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown parsing error');
    
    return {
      info: {
        title: 'Parse Error',
        version: '0.0.0',
        description: errors[0],
        baseUrl: '',
      },
      endpoints: [],
      auth: [],
      tags: [],
      errors,
      warnings,
    };
  }
}

/**
 * Validates if a string is a valid OpenAPI specification.
 * 
 * @param input - Raw OpenAPI spec as string
 * @param format - Input format ('yaml' or 'json')
 * @returns true if valid, false otherwise
 */
export async function validateOpenApiSpec(
  input: string,
  format: 'yaml' | 'json'
): Promise<boolean> {
  try {
    const result = await parseOpenApiSpec(input, format);
    return result.errors.length === 0 && result.endpoints.length > 0;
  } catch {
    return false;
  }
}

/**
 * Extracts endpoint count by HTTP method from a parsed spec.
 * 
 * @param spec - Parsed OpenAPI specification
 * @returns Object with counts by method
 */
export function getEndpointStatsByMethod(spec: ParsedSpec): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const endpoint of spec.endpoints) {
    stats[endpoint.method] = (stats[endpoint.method] || 0) + 1;
  }
  
  return stats;
}

/**
 * Extracts endpoint count by tag from a parsed spec.
 * 
 * @param spec - Parsed OpenAPI specification
 * @returns Object with counts by tag
 */
export function getEndpointStatsByTag(spec: ParsedSpec): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const endpoint of spec.endpoints) {
    for (const tag of endpoint.tags) {
      stats[tag] = (stats[tag] || 0) + 1;
    }
  }
  
  return stats;
}
