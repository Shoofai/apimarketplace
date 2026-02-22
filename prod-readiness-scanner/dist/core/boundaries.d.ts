/**
 * Detect "use client" and "use server" boundaries from file content.
 */
export interface BoundaryInfo {
    isClient: boolean;
    isServerAction: boolean;
}
export declare function getBoundaryInfo(filePath: string): BoundaryInfo;
//# sourceMappingURL=boundaries.d.ts.map