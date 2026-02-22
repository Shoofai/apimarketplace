/**
 * Spec-only Production Readiness audit.
 * Runs OpenAPI-focused rules and returns score + gaps (no codebase scan).
 */

export interface Gap {
  id: string;
  severity: string;
  category: string;
  message: string;
  fix: string;
  filePath?: string;
  line?: number;
  ruleId?: string;
}

export interface SpecAuditResult {
  score: number;
  gaps: Gap[];
  topGaps: Gap[];
}

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

function gap(ruleId: string, severity: string, category: string, message: string, fix: string): Gap {
  return {
    id: `spec-${ruleId}-${Math.random().toString(36).slice(2, 9)}`,
    severity,
    category,
    message,
    fix,
    ruleId,
  };
}

function runRules(spec: Record<string, unknown>): Gap[] {
  const gaps: Gap[] = [];

  const version = spec.openapi ?? spec.swagger;
  if (!version || typeof version !== 'string') {
    gaps.push(
      gap(
        'openapi-version',
        'critical',
        'spec',
        'Missing OpenAPI/Swagger version (openapi or swagger field).',
        'Add "openapi": "3.0.0" (or 3.1.0) at the root of your spec.'
      )
    );
  }

  const info = spec.info as Record<string, unknown> | undefined;
  if (!info || typeof info !== 'object') {
    gaps.push(
      gap('info-present', 'critical', 'spec', 'Missing "info" object.', 'Add an "info" object with title and version.')
    );
  } else {
    if (!info.description || (typeof info.description === 'string' && !info.description.trim())) {
      gaps.push(
        gap(
          'info-description',
          'medium',
          'docs',
          'Missing or empty info.description.',
          'Add a description of your API under info.description.'
        )
      );
    }
    if (!info.version || (typeof info.version === 'string' && !info.version.trim())) {
      gaps.push(
        gap(
          'info-version',
          'high',
          'spec',
          'Missing or empty info.version.',
          'Add a semantic version under info.version (e.g. "1.0.0").'
        )
      );
    }
    const contact = info.contact as Record<string, unknown> | undefined;
    const hasContact =
      contact &&
      typeof contact === 'object' &&
      ((typeof contact.name === 'string' && contact.name.trim()) ||
        (typeof contact.email === 'string' && contact.email.trim()) ||
        (typeof contact.url === 'string' && contact.url.trim()));
    if (!hasContact) {
      gaps.push(
        gap(
          'info-contact',
          'low',
          'docs',
          'Missing info.contact (name, email, or url).',
          'Add contact name, email, or url under info.contact for support and ownership.'
        )
      );
    }
  }

  const hasSecurity =
    (Array.isArray(spec.security) && spec.security.length > 0) ||
    (spec.components && typeof spec.components === 'object' && (spec.components as Record<string, unknown>).securitySchemes);
  const components = spec.components as Record<string, unknown> | undefined;
  const securitySchemes = components?.securitySchemes;
  const hasSecuritySchemes =
    securitySchemes && typeof securitySchemes === 'object' && Object.keys(securitySchemes).length > 0;
  if (!hasSecurity && !hasSecuritySchemes) {
    gaps.push(
      gap(
        'security-declared',
        'high',
        'security',
        'No security or securitySchemes declared.',
        'Declare securitySchemes under components and/or security at root or operation level.'
      )
    );
  }

  const servers = spec.servers;
  if (!Array.isArray(servers) || servers.length === 0) {
    const hasHost = !!(spec as { host?: unknown }).host;
    if (!hasHost) {
      gaps.push(
        gap(
          'servers-present',
          'medium',
          'spec',
          'Missing servers (OpenAPI 3.x) or host (Swagger 2).',
          'Add a "servers" array with at least one URL so clients know where to send requests.'
        )
      );
    }
  }

  const paths = spec.paths as Record<string, unknown> | undefined;
  if (!paths || typeof paths !== 'object') {
    gaps.push(
      gap('paths-present', 'critical', 'spec', 'Missing "paths" object.', 'Add a "paths" object with at least one endpoint.')
    );
  } else {
    const methods = ['get', 'post', 'put', 'patch', 'delete'];
    let missingSummary = 0;
    let missingResponseSchema = 0;
    let deprecatedNoReplacement = 0;

    for (const [pathKey, pathItem] of Object.entries(paths)) {
      if (typeof pathItem !== 'object' || pathItem === null) continue;
      const pathObj = pathItem as Record<string, unknown>;
      for (const method of methods) {
        const op = pathObj[method] as Record<string, unknown> | undefined;
        if (!op || typeof op !== 'object') continue;

        const summary = op.summary ?? op.description;
        if (!summary || (typeof summary === 'string' && !summary.trim())) {
          missingSummary++;
        }

        const responses = op.responses as Record<string, unknown> | undefined;
        const successResponse = responses?.['200'] ?? responses?.['201'] ?? responses?.['2XX'];
        if (successResponse && typeof successResponse === 'object') {
          const content = (successResponse as Record<string, unknown>).content;
          const schema = content && typeof content === 'object' ? (content as Record<string, unknown>).schema : undefined;
          if (!schema) {
            missingResponseSchema++;
          }
        }

        if (op.deprecated === true) {
          const ext = op as Record<string, unknown>;
          const hasReplacement =
            typeof ext['x-replacement'] === 'string' || typeof ext['x-sunset'] === 'string';
          if (!hasReplacement) deprecatedNoReplacement++;
        }
      }
    }

    if (missingSummary > 0) {
      gaps.push(
        gap(
          'op-summary',
          'medium',
          'docs',
          `${missingSummary} operation(s) missing summary or description.`,
          'Add a short summary (or description) to each operation for clearer docs.'
        )
      );
    }
    if (missingResponseSchema > 0) {
      gaps.push(
        gap(
          'op-response-schema',
          'medium',
          'docs',
          `${missingResponseSchema} operation(s) have success response without schema.`,
          'Add content with schema for 200/201/2XX responses where applicable.'
        )
      );
    }
    if (deprecatedNoReplacement > 0) {
      gaps.push(
        gap(
          'deprecated-no-replacement',
          'low',
          'docs',
          `${deprecatedNoReplacement} deprecated operation(s) without replacement hint.`,
          'Add x-replacement path or x-sunset date when marking operations deprecated.'
        )
      );
    }
  }

  return gaps;
}

function computeScore(gaps: Gap[]): number {
  if (gaps.length === 0) return 100;
  const deducted = gaps.reduce((sum, g) => sum + (SEVERITY_WEIGHT[g.severity.toLowerCase()] ?? 5), 0);
  return Math.max(0, 100 - deducted);
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

function sortGaps(gaps: Gap[]): Gap[] {
  return [...gaps].sort((a, b) => {
    const ai = SEVERITY_ORDER.indexOf(a.severity.toLowerCase());
    const bi = SEVERITY_ORDER.indexOf(b.severity.toLowerCase());
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return (a.ruleId ?? '').localeCompare(b.ruleId ?? '');
  });
}

/**
 * Run spec-only audit on an OpenAPI spec object.
 * @param spec - Parsed OpenAPI 3.x / Swagger 2 spec (object)
 * @param topN - Number of top gaps to return (default 5)
 */
export function runSpecAudit(spec: Record<string, unknown>, topN = 5): SpecAuditResult {
  const gaps = runRules(spec);
  const sorted = sortGaps(gaps);
  const score = computeScore(gaps);
  const topGaps = sorted.slice(0, topN);
  return { score, gaps: sorted, topGaps };
}
