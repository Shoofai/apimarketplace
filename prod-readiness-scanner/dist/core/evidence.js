/**
 * Line-range and snippet capture for findings.
 */
export function captureEvidence(filePath, line, endLine, snippet, reason) {
    return {
        filePath,
        ...(line != null && { line }),
        ...(endLine != null && { endLine }),
        ...(snippet != null && { snippet }),
        ...(reason != null && { reason }),
    };
}
//# sourceMappingURL=evidence.js.map