/**
 * Security rules: SEC-1 (service role exposure), SEC-2 (NEXT_PUBLIC misuse).
 */
import type { AppGraph } from '../core/graph-types.js';
import type { RuleContext } from './types.js';
import type { Finding } from '../core/types.js';
export declare function runSecurityRules(graph: AppGraph, context: RuleContext): Finding[];
//# sourceMappingURL=security.d.ts.map