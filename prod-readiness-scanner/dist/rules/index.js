/**
 * Rule registry: run all V1 rules and return combined findings.
 */
import { runUiRules } from './ui.js';
import { runRouteRules } from './routes.js';
import { runSecurityRules } from './security.js';
import { runDbRules } from './db.js';
import { runPerfRules } from './performance.js';
import { runEnvRules } from './env.js';
export function runAllRules(graph, context) {
    const findings = [];
    findings.push(...runUiRules(graph, context));
    findings.push(...runRouteRules(graph, context));
    findings.push(...runSecurityRules(graph, context));
    findings.push(...runDbRules(graph, context));
    findings.push(...runPerfRules(graph, context));
    findings.push(...runEnvRules(graph, context));
    return findings;
}
//# sourceMappingURL=index.js.map