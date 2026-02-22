/**
 * ts-morph project init for the app under scan.
 * Uses app's tsconfig when present to avoid parse/version drift.
 */

import { Project } from 'ts-morph';
import path from 'node:path';
import fs from 'node:fs';
import type { FileEntry } from './fileIndex.js';

export interface ProjectOptions {
  projectRoot: string;
  files: FileEntry[];
  /** Path to tsconfig.json (e.g. projectRoot/tsconfig.json) */
  tsconfigPath?: string;
}

export function createTsProject(options: ProjectOptions): Project {
  const { projectRoot, files, tsconfigPath } = options;
  const configPath = tsconfigPath ?? path.join(projectRoot, 'tsconfig.json');

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    ...(fs.existsSync(configPath) && { tsConfigFilePath: configPath }),
  });

  const codeFiles = files.filter((f) => !f.isMigration && /\.(tsx?|jsx?)$/i.test(f.ext));
  for (const f of codeFiles) {
    try {
      project.addSourceFileAtPath(f.filePath);
    } catch {
      // skip unreadable or invalid files
    }
  }

  return project;
}
