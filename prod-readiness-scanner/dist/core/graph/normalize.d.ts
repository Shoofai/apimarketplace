/**
 * Normalization helpers for graph and findings.
 */
/** Normalize path to use forward slashes and relative to project root */
export declare function normalizePath(filePath: string, projectRoot: string): string;
/** Normalize route path from App Router folder (e.g. src/app/api/foo/route.ts -> /api/foo) */
export declare function routePathFromAppFile(relativePath: string): string;
//# sourceMappingURL=normalize.d.ts.map