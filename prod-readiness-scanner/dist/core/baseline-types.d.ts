/**
 * Baseline / suppression format.
 * Teams can mark known gaps as accepted so ship decision and scoring ignore them.
 */
export interface BaselineEntry {
    /** Rule ID (e.g. AUTH-1, UI-1) */
    ruleId: string;
    /** Optional: only suppress when file path matches (glob or substring) */
    filePath?: string;
    /** Optional: only suppress when line matches */
    line?: number;
    /** Optional: suppress by finding id once known */
    gapId?: string;
}
export interface ValidationBaseline {
    version?: number;
    /** Entries that are accepted/suppressed */
    suppress: BaselineEntry[];
}
//# sourceMappingURL=baseline-types.d.ts.map