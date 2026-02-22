/**
 * Routes extractor: App Router page and API routes.
 */

import type { AppGraph } from '../core/graph-types.js';
import { addNode, routeNode } from '../core/graph/graph.js';
import { routePathFromAppFile } from '../core/graph/normalize.js';
import type { FileEntry } from '../core/fileIndex.js';
import path from 'node:path';

export interface RoutesExtractorOptions {
  projectRoot: string;
  files: FileEntry[];
}

export function extractRoutes(graph: AppGraph, options: RoutesExtractorOptions): void {
  const { projectRoot, files } = options;

  for (const f of files) {
    if (f.isMigration) continue;
    const rel = path.relative(projectRoot, f.filePath).replace(/\\/g, '/');

    if (
      rel.includes('/page.') &&
      (rel.endsWith('.tsx') || rel.endsWith('.ts') || rel.endsWith('.jsx') || rel.endsWith('.js'))
    ) {
      const routePath = routePathFromAppFile(rel);
      const node = routeNode(routePath, f.filePath, false, true);
      addNode(graph, node);
    }

    if (
      rel.includes('/route.') &&
      (rel.endsWith('.ts') || rel.endsWith('.js'))
    ) {
      const routePath = routePathFromAppFile(rel);
      const node = routeNode(routePath, f.filePath, true, false);
      addNode(graph, node);
    }
  }
}
