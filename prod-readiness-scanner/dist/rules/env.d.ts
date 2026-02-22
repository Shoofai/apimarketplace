/**
 * Env rules: SEC-3 (missing env validation) - flag vars not in .env.example.
 */
import type { AppGraph } from '../core/graph-types.js';
import type { RuleContext } from './types.js';
import type { Finding } from '../core/types.js';
export declare function runEnvRules(graph: AppGraph, _context: RuleContext): Finding[];
//# sourceMappingURL=env.d.ts.map