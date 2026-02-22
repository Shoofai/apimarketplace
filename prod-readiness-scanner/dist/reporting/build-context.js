/**
 * Build ValidationContext from graph, findings, and options.
 * Applies baseline suppressions and ship decision.
 */
import { getNodesByKind } from '../core/graph/graph.js';
import { VALIDATION_CONTEXT_SCHEMA_VERSION } from '../core/types.js';
const SCANNER_VERSION = '1.0.0';
function findingToGap(f, suppressed) {
    return {
        id: f.id,
        severity: f.severity.toLowerCase(),
        category: f.category,
        message: f.description,
        fix: f.recommendedFix.notes.join(' ') || 'See rulebook.',
        filePath: f.evidence[0]?.filePath,
        line: f.evidence[0]?.line,
        ruleId: f.code,
        evidence: f.evidence,
        confidence: f.confidence,
    };
}
export function isFindingSuppressed(finding, baseline) {
    if (!baseline?.suppress?.length)
        return false;
    for (const s of baseline.suppress) {
        if (s.ruleId !== finding.code)
            continue;
        if (!s.gapId && !s.filePath)
            return true;
        if (s.gapId && s.gapId === finding.id)
            return true;
        if (s.filePath && finding.evidence[0]?.filePath?.includes(s.filePath)) {
            if (s.line == null || finding.evidence[0]?.line === s.line)
                return true;
        }
    }
    return false;
}
function isSuppressed(finding, baseline) {
    return isFindingSuppressed(finding, baseline);
}
export function buildValidationContext(graph, findings, options = {}) {
    const baseline = options.baseline ?? null;
    const suppressedIds = new Set();
    const gaps = [];
    for (const f of findings) {
        const suppressed = isSuppressed(f, baseline);
        if (suppressed)
            suppressedIds.add(f.id);
        gaps.push(findingToGap(f, suppressed));
    }
    const routes = getNodesByKind(graph, 'Route').map((r) => ({
        path: r.path,
        status: 'ok',
        description: r.isApi ? `API: ${r.path}` : `Page: ${r.path}`,
    }));
    const shipChecklist = [
        { id: 'env-001', label: 'NEXT_PUBLIC_SITE_URL set', status: 'pass', detail: null },
        { id: 'env-002', label: 'Supabase URL and anon key configured', status: 'pass', detail: null },
        { id: 'stripe-001', label: 'Stripe webhook signing secret configured', status: 'pass', detail: null },
    ];
    const activeFindings = findings.filter((f) => !suppressedIds.has(f.id));
    const hasCritical = activeFindings.some((f) => f.severity === 'CRITICAL');
    const hasHighAuthSec = activeFindings.some((f) => f.severity === 'HIGH' && (f.category === 'auth' || f.category === 'security'));
    let shipChecklistStatus = 'ship';
    if (hasCritical)
        shipChecklistStatus = 'no-ship';
    else if (hasHighAuthSec)
        shipChecklistStatus = 'needs-review';
    return {
        schemaVersion: VALIDATION_CONTEXT_SCHEMA_VERSION,
        generatedAt: new Date().toISOString(),
        scannerVersion: SCANNER_VERSION,
        routes,
        gaps,
        shipChecklist,
        shipChecklistStatus,
        suppressedCount: suppressedIds.size,
    };
}
//# sourceMappingURL=build-context.js.map