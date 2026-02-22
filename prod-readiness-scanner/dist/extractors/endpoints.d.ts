/**
 * Endpoints extractor: Next API route handlers (GET/POST/etc) and server actions.
 */
import type { SourceFile } from 'ts-morph';
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface EndpointsExtractorOptions {
    projectRoot: string;
    files: FileEntry[];
    getSourceFile: (filePath: string) => SourceFile | undefined;
}
export declare function extractEndpoints(graph: AppGraph, options: EndpointsExtractorOptions): void;
//# sourceMappingURL=endpoints.d.ts.map