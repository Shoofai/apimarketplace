/**
 * Callsites extractor: fetch, axios, router.push, server action invocations.
 */
import type { SourceFile } from 'ts-morph';
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface CallsitesExtractorOptions {
    files: FileEntry[];
    getSourceFile: (filePath: string) => SourceFile | undefined;
}
export declare function extractCallsites(graph: AppGraph, options: CallsitesExtractorOptions): void;
//# sourceMappingURL=callsites.d.ts.map