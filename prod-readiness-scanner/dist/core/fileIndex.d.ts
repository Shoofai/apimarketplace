/**
 * File index: glob TS/TSX/JS/JSX and SQL migration files.
 * Excludes scanner package and common non-app dirs.
 */
export interface FileEntry {
    filePath: string;
    relativePath: string;
    ext: string;
    isMigration: boolean;
}
export interface FileIndexOptions {
    projectRoot: string;
    include?: string[];
    excludeDirs?: string[];
    /** Extra paths to exclude (e.g. scanner package when in-repo) */
    excludePaths?: string[];
}
export declare function buildFileIndex(options: FileIndexOptions): FileEntry[];
//# sourceMappingURL=fileIndex.d.ts.map