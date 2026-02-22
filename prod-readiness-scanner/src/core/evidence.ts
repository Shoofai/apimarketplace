/**
 * Line-range and snippet capture for findings.
 */

import type { EvidenceRef } from './types.js';

export function captureEvidence(
  filePath: string,
  line?: number,
  endLine?: number,
  snippet?: string,
  reason?: string
): EvidenceRef {
  return {
    filePath,
    ...(line != null && { line }),
    ...(endLine != null && { endLine }),
    ...(snippet != null && { snippet }),
    ...(reason != null && { reason }),
  };
}
