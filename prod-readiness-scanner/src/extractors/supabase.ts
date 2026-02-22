/**
 * Supabase usage extractor: from().select(), insert, update, delete, storage.
 */

import type { SourceFile } from 'ts-morph';
import type { AppGraph } from '../core/graph-types.js';
import { addNode, supabaseQueryNode } from '../core/graph/graph.js';
import { getBoundaryInfo } from '../core/boundaries.js';
import type { FileEntry } from '../core/fileIndex.js';

export interface SupabaseExtractorOptions {
  files: FileEntry[];
  getSourceFile: (filePath: string) => SourceFile | undefined;
}

type SupabaseOp = 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'rpc';

export function extractSupabase(graph: AppGraph, options: SupabaseExtractorOptions): void {
  const { files, getSourceFile } = options;

  for (const f of files) {
    if (f.isMigration) continue;
    const sf = getSourceFile(f.filePath);
    if (!sf) continue;
    if (!sf.getFullText().includes('.from(')) continue;

    const boundary = getBoundaryInfo(f.filePath);
    const isClient = boundary.isClient;

    const text = sf.getFullText();
    const fromRegex = /\.from\s*\(\s*["']([^"']+)["']\s*\)/g;
    let m: RegExpExecArray | null;
    while ((m = fromRegex.exec(text)) !== null) {
      const table = m[1];
      const pos = m.index;
      const line = text.slice(0, pos).split(/\n/).length;
      const after = text.slice(pos);
      let operation: SupabaseOp = 'select';
      if (after.match(/\.(insert|upsert)\s*\(/)) operation = after.includes('.upsert(') ? 'upsert' : 'insert';
      else if (after.match(/\.update\s*\(/)) operation = 'update';
      else if (after.match(/\.delete\s*\(/)) operation = 'delete';
      else if (after.match(/\.rpc\s*\(/)) operation = 'rpc';
      else {
        const selectMatch = after.match(/\.select\s*\(([\s\S]*?)\)/);
        const selectArg = selectMatch?.[1]?.trim() ?? '';
        const hasPagination = /\.(range|limit)\s*\(/.test(after);
        const isSingleRow = /\.(single|maybeSingle)\s*\(/.test(after);
        const isCountOnly = /head\s*:\s*true/.test(selectArg);
        const selectAll = selectArg === '*' || selectArg === '' || /^\s*["']?\*["']?\s*$/.test(selectArg);
        const node = supabaseQueryNode(f.filePath, table, 'select', {
          line,
          hasPagination,
          selectAll,
          isClient,
          isSingleRow,
          isCountOnly,
        });
        addNode(graph, node);
      }
      if (operation !== 'select') {
        const node = supabaseQueryNode(f.filePath, table, operation, { line, isClient });
        addNode(graph, node);
      }
    }
  }
}
