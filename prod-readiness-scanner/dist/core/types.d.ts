/**
 * Canonical types for the validation context pack.
 * Single source of truth for scanner output and consumer (dashboard/API).
 * @see Critical prerequisites: Schema contract and versioning
 */
export declare const VALIDATION_CONTEXT_SCHEMA_VERSION = "1.0";
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type ShipStatus = 'ship' | 'no-ship' | 'needs-review';
export interface EvidenceRef {
    filePath: string;
    line?: number;
    endLine?: number;
    snippet?: string;
    reason?: string;
}
export interface Finding {
    id: string;
    code: string;
    category: string;
    severity: Severity;
    confidence: Confidence;
    title: string;
    description: string;
    related?: {
        uiActionIds?: string[];
        endpointIds?: string[];
        routePaths?: string[];
        tableNames?: string[];
    };
    evidence: EvidenceRef[];
    recommendedFix: {
        type: string;
        notes: string[];
    };
    /** When true, this finding is in the baseline and should not block ship */
    suppressed?: boolean;
}
/** Gap format for validation-context.json (consumer compatibility) */
export interface Gap {
    id: string;
    severity: string;
    category: string;
    message: string;
    fix: string;
    filePath?: string;
    line?: number;
    ruleId?: string;
    evidence?: unknown[];
    confidence?: string;
}
export interface RouteEntry {
    path: string;
    method?: string;
    status?: string;
    description?: string;
}
export interface ShipChecklistItem {
    id: string;
    label: string;
    status: 'pass' | 'fail' | 'skip';
    detail: string | null;
}
export interface ValidationContext {
    schemaVersion: string;
    generatedAt: string;
    scannerVersion: string;
    routes: RouteEntry[];
    gaps: Gap[];
    shipChecklist: ShipChecklistItem[];
    shipChecklistStatus?: ShipStatus;
    /** Count of gaps that are suppressed via baseline */
    suppressedCount?: number;
    /** Error message when scan failed (partial output) */
    error?: string;
}
//# sourceMappingURL=types.d.ts.map