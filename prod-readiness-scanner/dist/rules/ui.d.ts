/**
 * UI rules: UI-1 (unwired/suspicious), UI-2 (dead link), UI-3 (orphan route).
 */
import type { AppGraph } from '../core/graph-types.js';
import type { RuleContext } from './types.js';
import type { Finding } from '../core/types.js';
export declare function runUiRules(graph: AppGraph, context: RuleContext): Finding[];
//# sourceMappingURL=ui.d.ts.map