/**
 * File index: glob TS/TSX/JS/JSX and SQL migration files.
 * Excludes scanner package and common non-app dirs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { minimatch } from 'minimatch';

const DEFAULT_INCLUDE = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
];

const DEFAULT_EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'out',
  'dist',
  'build',
  '.git',
  'coverage',
  'prod-readiness-scanner',  // exclude scanner from scan when in-repo
  'packages/prod-readiness-scanner',
];

const MIGRATION_GLOB = 'supabase/migrations/**/*.sql';

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

export function buildFileIndex(options: FileIndexOptions): FileEntry[] {
  const {
    projectRoot,
    include = DEFAULT_INCLUDE,
    excludeDirs = DEFAULT_EXCLUDE_DIRS,
    excludePaths = [],
  } = options;

  const results: FileEntry[] = [];
  const seen = new Set<string>();

  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const rel = path.relative(projectRoot, full);

      if (ent.isDirectory()) {
        if (excludeDirs.some((d) => rel.startsWith(d) || ent.name === d)) continue;
        if (excludePaths.some((p) => full.includes(p) || rel.startsWith(p))) continue;
        walk(full);
        continue;
      }

      if (!ent.isFile()) continue;

      const ext = path.extname(ent.name).toLowerCase();
      const isMigration = minimatch(rel, MIGRATION_GLOB);
      const isCode = ['.ts', '.tsx', '.js', '.jsx'].includes(ext);

      if (!isCode && !isMigration) continue;

      if (excludePaths.some((p) => full.includes(p) || rel.startsWith(p))) continue;

      const matched = isMigration
        ? true
        : include.some((pattern) => minimatch(rel, pattern));
      if (!matched) continue;

      const norm = path.normalize(rel);
      if (seen.has(norm)) continue;
      seen.add(norm);

      results.push({
        filePath: full,
        relativePath: rel,
        ext,
        isMigration,
      });
    }
  }

  walk(projectRoot);
  return results;
}
