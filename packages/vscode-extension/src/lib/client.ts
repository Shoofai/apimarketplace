import * as vscode from 'vscode';
import { getPlatformUrl } from './config';

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  token?: string;
}

export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const base = getPlatformUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
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
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}
