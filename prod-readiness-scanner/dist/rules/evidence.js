import { captureEvidence } from '../core/evidence.js';
export function createFinding(id, code, category, severity, confidence, title, description, filePath, line, recommendedFix) {
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
//# sourceMappingURL=evidence.js.map