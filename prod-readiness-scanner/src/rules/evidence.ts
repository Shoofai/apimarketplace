import { captureEvidence } from '../core/evidence.js';
import type { Finding } from '../core/types.js';

export function createFinding(
  id: string,
  code: string,
  category: string,
  severity: Finding['severity'],
  confidence: Finding['confidence'],
  title: string,
  description: string,
  filePath: string,
  line?: number,
  recommendedFix?: string
): Finding {
  return {
    id,
    code,
    category,
    severity,
    confidence,
    title,
    description,
    evidence: [captureEvidence(filePath, line, undefined, undefined, description)],
    recommendedFix: {
      type: 'manual',
      notes: recommendedFix ? [recommendedFix] : [],
    },
  };
}
