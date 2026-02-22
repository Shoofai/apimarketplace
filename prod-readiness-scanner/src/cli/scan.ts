/**
 * Scan command: run extractors, rules, emit validation-context.
 */

import path from 'node:path';
import fs from 'node:fs';
import { buildFileIndex } from '../core/fileIndex.js';
import { createTsProject } from '../core/project.js';
import { createGraph } from '../core/graph/graph.js';
import { extractRoutes } from '../extractors/routes.js';
import { extractEndpoints } from '../extractors/endpoints.js';
import { extractUiActions } from '../extractors/uiActions.js';
import { extractCallsites } from '../extractors/callsites.js';
import { extractSupabase } from '../extractors/supabase.js';
import { extractMigrations } from '../extractors/migrations.js';
import { extractEnv } from '../extractors/env.js';
import { runAllRules } from '../rules/index.js';
import { buildValidationContext, isFindingSuppressed } from '../reporting/build-context.js';
import { writeValidationContextJson } from '../reporting/json.js';
import { writeValidationContextMarkdown } from '../reporting/markdown.js';
import type { ValidationBaseline } from '../core/baseline-types.js';

export interface ScanOptions {
  project: string;
  out: string;
  format: ('json' | 'md')[];
  failOn?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const SEVERITY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

function loadBaseline(projectRoot: string): ValidationBaseline | null {
  const p = path.join(projectRoot, 'validation-baseline.json');
  try {
    const content = fs.readFileSync(p, 'utf-8');
    return JSON.parse(content) as ValidationBaseline;
  } catch {
    return null;
  }
}

export function runScan(options: ScanOptions): { success: boolean; exitCode: number } {
  const projectRoot = path.resolve(options.project);
  const outDir = path.resolve(projectRoot, options.out);

  const files = buildFileIndex({
    projectRoot,
    excludePaths: [
      path.join(projectRoot, 'prod-readiness-scanner'),
      path.join(projectRoot, 'packages', 'prod-readiness-scanner'),
    ],
  });

  const project = createTsProject({
    projectRoot,
    files,
  });

  const getSourceFile = (filePath: string) => project.getSourceFile(filePath) ?? undefined;

  const graph = createGraph();

  extractRoutes(graph, { projectRoot, files });
  extractEndpoints(graph, { projectRoot, files, getSourceFile });
  extractUiActions(graph, { files, getSourceFile });
  extractCallsites(graph, { files, getSourceFile });
  extractSupabase(graph, { files, getSourceFile });
  extractMigrations(graph, { files });
  extractEnv(graph, { projectRoot, files });

  const findings = runAllRules(graph, { projectRoot });
  const baseline = loadBaseline(projectRoot);
  const context = buildValidationContext(graph, findings, { baseline, projectRoot });

  if (options.format.includes('json')) {
    const jsonPath = path.join(outDir, 'validation-context.json');
    writeValidationContextJson(context, jsonPath);
    console.log('Wrote', jsonPath);
  }
  if (options.format.includes('md')) {
    const mdPath = path.join(outDir, 'validation-context.md');
    writeValidationContextMarkdown(context, mdPath);
    console.log('Wrote', mdPath);
  }

  const failOn = options.failOn ?? 'CRITICAL';
  const thresholdIndex = SEVERITY_ORDER.indexOf(failOn);
  const activeFindings = findings.filter((f) => !isFindingSuppressed(f, baseline));
  const blocking = activeFindings.filter((f) => {
    const idx = SEVERITY_ORDER.indexOf(f.severity);
    return idx >= thresholdIndex;
  });

  if (blocking.length > 0) {
    console.error(`Found ${blocking.length} finding(s) at or above ${failOn}`);
    return { success: false, exitCode: 1 };
  }
  return { success: true, exitCode: 0 };
}
