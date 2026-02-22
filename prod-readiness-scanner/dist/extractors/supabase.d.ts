/**
 * Supabase usage extractor: from().select(), insert, update, delete, storage.
 */
import type { SourceFile } from 'ts-morph';
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface SupabaseExtractorOptions {
    files: FileEntry[];
    getSourceFile: (filePath: string) => SourceFile | undefined;
}
export declare function extractSupabase(graph: AppGraph, options: SupabaseExtractorOptions): void;
//# sourceMappingURL=supabase.d.ts.map