/**
 * Parses API collection files from Postman v2.1, Insomnia v4, and Bruno formats.
 * Returns a flat list of extracted requests with method, URL, headers, and body.
 */

export type CollectionFormat = 'postman' | 'insomnia' | 'bruno' | 'unknown';

export interface ExtractedRequest {
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ParsedCollection {
  format: CollectionFormat;
  name: string;
  requests: ExtractedRequest[];
  baseUrls: string[];
}

/** Detect format from the raw JSON/text content. */
export function detectFormat(raw: string): CollectionFormat {
  try {
    const obj = JSON.parse(raw);
    if (obj?.info?._postman_id || obj?.info?.schema?.includes('postman')) return 'postman';
    if (obj?._type === 'export' && obj?.resources) return 'insomnia';
    if (obj?.exportFormat === 'insomnia' || obj?.__export_format === 4) return 'insomnia';
  } catch {
    // plain text — could be Bruno .bru
    if (raw.includes('meta {') || raw.includes('get {') || raw.includes('post {')) return 'bruno';
  }
  return 'unknown';
}

/** Extract the base URL (scheme + host + port) from a full URL string. */
export function extractBaseUrl(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** Flatten a Postman item tree (folders can nest arbitrarily). */
function flattenPostmanItems(items: any[]): ExtractedRequest[] {
  const results: ExtractedRequest[] = [];
  for (const item of items ?? []) {
    if (item.item) {
      results.push(...flattenPostmanItems(item.item));
    } else if (item.request) {
      const req = item.request;
      let url = '';
      if (typeof req.url === 'string') {
        url = req.url;
      } else if (req.url?.raw) {
        url = req.url.raw;
      }
      // Resolve Postman variables like {{baseUrl}} — leave as-is; we'll strip the variable later
      const headers: Record<string, string> = {};
      for (const h of req.header ?? []) {
        if (h.key && !h.disabled) headers[h.key] = h.value ?? '';
      }
      results.push({
        name: item.name ?? '',
        method: (req.method ?? 'GET').toUpperCase(),
        url,
        headers,
        body: req.body?.raw ?? undefined,
      });
    }
  }
  return results;
}

export function parsePostman(raw: string): ParsedCollection {
  const obj = JSON.parse(raw);
  const requests = flattenPostmanItems(obj.item ?? []);
  const baseUrls = dedupeBaseUrls(requests.map((r) => r.url));
  return { format: 'postman', name: obj.info?.name ?? 'Postman Collection', requests, baseUrls };
}

export function parseInsomnia(raw: string): ParsedCollection {
  const obj = JSON.parse(raw);
  const resources: any[] = obj.resources ?? [];
  const requests: ExtractedRequest[] = resources
    .filter((r) => r._type === 'request')
    .map((r) => {
      const headers: Record<string, string> = {};
      for (const h of r.headers ?? []) {
        if (h.name && h.enabled !== false) headers[h.name] = h.value ?? '';
      }
      return {
        name: r.name ?? '',
        method: (r.method ?? 'GET').toUpperCase(),
        url: r.url ?? '',
        headers,
        body: r.body?.text ?? undefined,
      };
    });
  const baseUrls = dedupeBaseUrls(requests.map((r) => r.url));
  return { format: 'insomnia', name: obj?.resources?.find((r: any) => r._type === 'workspace')?.name ?? 'Insomnia Collection', requests, baseUrls };
}

/**
 * Parse a Bruno .bru plain-text file.
 * Bruno format:
 *   meta { name: Foo }
 *   get { url: https://api.example.com/v1/foo }
 *   headers { ... }
 */
export function parseBrunoFile(text: string): ExtractedRequest | null {
  const methodMatch = text.match(/^(get|post|put|patch|delete|head|options)\s*\{/im);
  const nameMatch = text.match(/meta\s*\{[^}]*name:\s*(.+)/i);
  const urlMatch = text.match(/url:\s*(.+)/i);
  if (!methodMatch || !urlMatch) return null;
  const headers: Record<string, string> = {};
  const headerBlock = text.match(/headers\s*\{([\s\S]*?)\}/i);
  if (headerBlock) {
    for (const line of headerBlock[1].split('\n')) {
      const m = line.trim().match(/^([^:]+):\s*(.+)$/);
      if (m) headers[m[1].trim()] = m[2].trim();
    }
  }
  return {
    name: nameMatch?.[1]?.trim() ?? '',
    method: methodMatch[1].toUpperCase(),
    url: urlMatch[1].trim(),
    headers,
  };
}

function dedupeBaseUrls(urls: string[]): string[] {
  const set = new Set<string>();
  for (const url of urls) {
    // Strip Postman variables {{var}} before parsing
    const cleaned = url.replace(/\{\{[^}]+\}\}/g, 'placeholder');
    const base = extractBaseUrl(cleaned);
    if (base && base !== 'https://placeholder') set.add(base);
  }
  return Array.from(set);
}

export function parseCollection(raw: string, hintFormat?: string): ParsedCollection {
  const fmt = (hintFormat as CollectionFormat) || detectFormat(raw);
  switch (fmt) {
    case 'postman': return parsePostman(raw);
    case 'insomnia': return parseInsomnia(raw);
    case 'bruno': {
      const req = parseBrunoFile(raw);
      const requests = req ? [req] : [];
      const baseUrls = dedupeBaseUrls(requests.map((r) => r.url));
      return { format: 'bruno', name: 'Bruno Collection', requests, baseUrls };
    }
    default:
      // Try both JSON formats
      try { return parsePostman(raw); } catch {}
      try { return parseInsomnia(raw); } catch {}
      return { format: 'unknown', name: 'Unknown Collection', requests: [], baseUrls: [] };
  }
}
