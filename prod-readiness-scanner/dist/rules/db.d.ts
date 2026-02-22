/**
 * DB rules: DB-1 (table without RLS), DB-2 (no policies), DB-4 (destructive DDL).
 */
import type { AppGraph } from '../core/graph-types.js';
import type { RuleContext } from './types.js';
import type { Finding } from '../core/types.js';
export declare function runDbRules(graph: AppGraph, _context: RuleContext): Finding[];
//# sourceMappingURL=db.d.ts.map