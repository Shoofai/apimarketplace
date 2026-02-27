import { getRequiredToken, getPlatformUrl } from './config';

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  token?: string;
  noAuth?: boolean;
}

/**
 * Fetch wrapper that automatically injects the stored JWT as a Bearer token.
 */
export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const token = options.noAuth ? undefined : (options.token ?? getRequiredToken());
  const base = getPlatformUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path}`;

  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  });
}

export async function apiJson<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await apiFetch(path, options);
  const data = await res.json() as any;
  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}
