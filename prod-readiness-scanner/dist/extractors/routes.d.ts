/**
 * Routes extractor: App Router page and API routes.
 */
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface RoutesExtractorOptions {
    projectRoot: string;
    files: FileEntry[];
}
export declare function extractRoutes(graph: AppGraph, options: RoutesExtractorOptions): void;
//# sourceMappingURL=routes.d.ts.map