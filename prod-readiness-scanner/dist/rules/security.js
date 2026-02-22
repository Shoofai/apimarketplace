/**
 * Security rules: SEC-1 (service role exposure), SEC-2 (NEXT_PUBLIC misuse).
 */
import { getNodesByKind } from '../core/graph/graph.js';
import { createFinding } from './evidence.js';
const SERVICE_ROLE_PATTERN = /service_role|createClient\s*\([^)]*service/;
const NEXT_PUBLIC_SECRET = /NEXT_PUBLIC_.*?(SECRET|TOKEN|KEY)/i;
/** Known-safe public keys (anon key, URL); RLS protects data. */
const ALLOWED_PUBLIC_KEYS = new Set([
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
]);
export function runSecurityRules(graph, context) {
    const findings = [];
    const envVars = getNodesByKind(graph, 'EnvVar');
    for (const ev of envVars) {
        if (ev.isPublic && (ev.name.includes('SERVICE') || ev.name.includes('service_role'))) {
            findings.push(createFinding(`sec-1-${ev.id}`, 'SEC-1', 'security', 'CRITICAL', 'HIGH', 'Service role or secret in public env', `NEXT_PUBLIC_ or public env may expose service role: ${ev.name}`, ev.filePath, ev.line, 'Never use NEXT_PUBLIC_ for service role or secrets.'));
        }
        if (NEXT_PUBLIC_SECRET.test(ev.name) && !ALLOWED_PUBLIC_KEYS.has(ev.name)) {
            findings.push(createFinding(`sec-2-${ev.id}`, 'SEC-2', 'security', 'HIGH', 'HIGH', 'NEXT_PUBLIC_ may expose secret', `Env var name suggests secret/token: ${ev.name}`, ev.filePath, ev.line, 'Rename or use server-only env.'));
        }
    }
    return findings;
}
//# sourceMappingURL=security.js.map