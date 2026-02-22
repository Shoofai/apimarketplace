/**
 * Env rules: SEC-3 (missing env validation) - flag vars not in .env.example.
 */
import { getNodesByKind } from '../core/graph/graph.js';
import { createFinding } from './evidence.js';
export function runEnvRules(graph, _context) {
    const findings = [];
    const envVars = getNodesByKind(graph, 'EnvVar');
    for (const ev of envVars) {
        if (ev.inExample === false && !ev.name.startsWith('NEXT_PUBLIC_')) {
            findings.push(createFinding(`sec-3-${ev.id}`, 'SEC-3', 'security', 'MEDIUM', 'LOW', 'Env var not in .env.example', `Used in code but not declared in .env.example: ${ev.name}. Needs confirmation.`, ev.filePath, ev.line, 'Add to .env.example and document; validate at startup if required.'));
        }
    }
    return findings;
}
//# sourceMappingURL=env.js.map