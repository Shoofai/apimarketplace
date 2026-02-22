/**
 * Emit validation-context.md (human summary).
 */
import fs from 'node:fs';
import path from 'node:path';
export function writeValidationContextMarkdown(context, outPath) {
    const lines = [
        '# Production Readiness Report',
        '',
        `**Generated:** ${context.generatedAt} | **Scanner:** ${context.scannerVersion} | **Schema:** ${context.schemaVersion}`,
        '',
        '## Ship status',
        '',
        `**Status:** \`${context.shipChecklistStatus ?? 'needs-review'}\``,
        '',
        '---',
        '## Routes',
        '',
        '| Path | Description |',
        '|------|-------------|',
        ...context.routes.map((r) => `| ${r.path} | ${r.description ?? '-'} |`),
        '',
        '---',
        '## Gaps (findings)',
        '',
    ];
    const bySeverity = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    for (const sev of bySeverity) {
        const list = context.gaps.filter((g) => g.severity === sev.toLowerCase());
        if (list.length === 0)
            continue;
        lines.push(`### ${sev} (${list.length})`, '');
        for (const g of list) {
            lines.push(`- **${g.ruleId ?? g.id}** ${g.message}`);
            if (g.filePath)
                lines.push(`  - \`${g.filePath}${g.line != null ? `:${g.line}` : ''}\``);
            lines.push(`  - Fix: ${g.fix}`, '');
        }
    }
    if (context.suppressedCount && context.suppressedCount > 0) {
        lines.push('---', '', `**Suppressed:** ${context.suppressedCount}`, '');
    }
    lines.push('---', '', '## Ship checklist', '');
    for (const item of context.shipChecklist) {
        lines.push(`- [${item.status === 'pass' ? 'x' : ' '}] ${item.label}`);
    }
    const dir = path.dirname(outPath);
    if (dir !== '.') {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
}
//# sourceMappingURL=markdown.js.map