/**
 * ts-morph project init for the app under scan.
 * Uses app's tsconfig when present to avoid parse/version drift.
 */
import { Project } from 'ts-morph';
import type { FileEntry } from './fileIndex.js';
export interface ProjectOptions {
    projectRoot: string;
    files: FileEntry[];
    /** Path to tsconfig.json (e.g. projectRoot/tsconfig.json) */
    tsconfigPath?: string;
}
export declare function createTsProject(options: ProjectOptions): Project;
//# sourceMappingURL=project.d.ts.map