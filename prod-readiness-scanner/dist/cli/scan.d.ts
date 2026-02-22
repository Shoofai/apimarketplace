/**
 * Scan command: run extractors, rules, emit validation-context.
 */
export interface ScanOptions {
    project: string;
    out: string;
    format: ('json' | 'md')[];
    failOn?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
export declare function runScan(options: ScanOptions): {
    success: boolean;
    exitCode: number;
};
//# sourceMappingURL=scan.d.ts.map