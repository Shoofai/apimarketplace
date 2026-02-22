/**
 * Performance rules: PERF-1 (no pagination), PERF-2 (SELECT *).
 */
import type { AppGraph } from '../core/graph-types.js';
import type { RuleContext } from './types.js';
import type { Finding } from '../core/types.js';
export declare function runPerfRules(graph: AppGraph, _context: RuleContext): Finding[];
//# sourceMappingURL=performance.d.ts.map