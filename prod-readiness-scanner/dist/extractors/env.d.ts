/**
 * Env extractor: process.env.X, Deno.env.get; compare to .env.example.
 */
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface EnvExtractorOptions {
    projectRoot: string;
    files: FileEntry[];
}
export declare function extractEnv(graph: AppGraph, options: EnvExtractorOptions): void;
//# sourceMappingURL=env.d.ts.map