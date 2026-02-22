/**
 * Emit validation-context.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ValidationContext } from '../core/types.js';

export function writeValidationContextJson(context: ValidationContext, outPath: string): void {
  const dir = path.dirname(outPath);
  if (dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outPath, JSON.stringify(context, null, 2), 'utf-8');
}
