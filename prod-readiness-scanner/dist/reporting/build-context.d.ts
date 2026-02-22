/**
 * Build ValidationContext from graph, findings, and options.
 * Applies baseline suppressions and ship decision.
 */
import type { AppGraph } from '../core/graph-types.js';
import type { Finding, ValidationContext } from '../core/types.js';
import type { ValidationBaseline } from '../core/baseline-types.js';
export declare function isFindingSuppressed(finding: Finding, baseline: ValidationBaseline | null): boolean;
export declare function buildValidationContext(graph: AppGraph, findings: Finding[], options?: {
    baseline?: ValidationBaseline | null;
    projectRoot?: string;
}): ValidationContext;
//# sourceMappingURL=build-context.d.ts.map