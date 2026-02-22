/**
 * Env extractor: process.env.X, Deno.env.get; compare to .env.example.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { AppGraph } from '../core/graph-types.js';
import { addNode, envVarNode } from '../core/graph/graph.js';
import type { FileEntry } from '../core/fileIndex.js';

export interface EnvExtractorOptions {
  projectRoot: string;
  files: FileEntry[];
}

const PROCESS_ENV = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
const DENO_ENV = /Deno\.env\.get\s*\(\s*["']([^"']+)["']\s*\)/g;

function loadExampleEnv(projectRoot: string): Set<string> {
  const candidates = [
    path.join(projectRoot, '.env.example'),
    path.join(projectRoot, 'env.example'),
  ];
  for (const p of candidates) {
    try {
      const content = fs.readFileSync(p, 'utf-8');
      const names = new Set<string>();
      for (const line of content.split(/\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
        if (match) names.add(match[1]);
      }
      return names;
    } catch {
      //
    }
  }
  return new Set();
}

export function extractEnv(graph: AppGraph, options: EnvExtractorOptions): void {
  const { projectRoot, files } = options;
  const exampleVars = loadExampleEnv(projectRoot);

  const seen = new Set<string>();

  for (const f of files) {
    if (f.isMigration) continue;
    let content: string;
    try {
      content = fs.readFileSync(f.filePath, 'utf-8');
    } catch {
      continue;
    }

    let m: RegExpExecArray | null;
    PROCESS_ENV.lastIndex = 0;
    while ((m = PROCESS_ENV.exec(content)) !== null) {
      const name = m[1];
      const key = `${f.filePath}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const line = content.slice(0, m.index).split(/\n/).length;
      const isPublic = name.startsWith('NEXT_PUBLIC_');
      const node = envVarNode(name, f.filePath, isPublic, {
        line,
        inExample: exampleVars.has(name),
      });
      addNode(graph, node);
    }
    DENO_ENV.lastIndex = 0;
    while ((m = DENO_ENV.exec(content)) !== null) {
      const name = m[1];
      const key = `${f.filePath}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const line = content.slice(0, m.index).split(/\n/).length;
      const node = envVarNode(name, f.filePath, false, { line, inExample: exampleVars.has(name) });
      addNode(graph, node);
    }
  }
}
