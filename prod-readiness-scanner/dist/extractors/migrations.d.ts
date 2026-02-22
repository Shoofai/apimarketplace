/**
 * Migrations & RLS extractor: parse supabase/migrations/*.sql.
 */
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface MigrationsExtractorOptions {
    files: FileEntry[];
}
export declare function extractMigrations(graph: AppGraph, options: MigrationsExtractorOptions): void;
//# sourceMappingURL=migrations.d.ts.map