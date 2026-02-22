/**
 * Performance rules: PERF-1 (no pagination), PERF-2 (SELECT *).
 */

import type { AppGraph } from '../core/graph-types.js';
import { getNodesByKind } from '../core/graph/graph.js';
import type { RuleContext } from './types.js';
import type { Finding } from '../core/types.js';
import { createFinding } from './evidence.js';

export function runPerfRules(graph: AppGraph, _context: RuleContext): Finding[] {
  const findings: Finding[] = [];
  const queries = getNodesByKind(graph, 'SupabaseQuery');

  for (const q of queries) {
    if (q.operation === 'select' && q.hasPagination === false && q.isSingleRow !== true && q.isCountOnly !== true) {
      findings.push(
        createFinding(
          `perf-1-${q.id}`,
          'PERF-1',
          'performance',
          'HIGH',
          'MEDIUM',
          'List query without pagination',
          `Select on ${q.table} has no .range() or .limit().`,
          q.filePath,
          q.line,
          'Add .range(from, to) or .limit(n) for list queries.'
        )
      );
    }
    if (q.operation === 'select' && q.selectAll === true) {
      findings.push(
        createFinding(
          `perf-2-${q.id}`,
          'PERF-2',
          'performance',
          'MEDIUM',
          'HIGH',
          'SELECT * on list',
          `Select on ${q.table} uses select('*') or select() which may over-fetch.`,
          q.filePath,
          q.line,
          'Select only needed columns.'
        )
      );
    }
  }

  return findings;
}
