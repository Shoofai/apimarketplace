#!/usr/bin/env node
/**
 * prod-readiness-scanner CLI
 * Usage: prod-readiness-scanner scan [--project .] [--out ./audit] [--format json,md] [--fail-on CRITICAL]
 */
import { runScan } from './scan.js';
const args = process.argv.slice(2);
const command = args[0] ?? 'scan';
if (command === 'scan') {
    let project = '.';
    let out = './audit';
    let format = ['json', 'md'];
    let failOn = 'CRITICAL';
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--project' && args[i + 1]) {
            project = args[++i];
        }
        else if (args[i] === '--out' && args[i + 1]) {
            out = args[++i];
        }
        else if (args[i] === '--format' && args[i + 1]) {
            const f = args[++i].split(',').map((s) => s.trim().toLowerCase());
            format = f.filter((s) => s === 'json' || s === 'md');
            if (format.length === 0)
                format = ['json', 'md'];
        }
        else if (args[i] === '--fail-on' && args[i + 1]) {
            const v = args[++i].toUpperCase();
            if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(v)) {
                failOn = v;
            }
        }
    }
    const result = runScan({
        project,
        out,
        format,
        failOn,
    });
    process.exit(result.exitCode);
}
else {
    console.error('Usage: prod-readiness-scanner scan [--project .] [--out ./audit] [--format json,md] [--fail-on CRITICAL]');
    process.exit(1);
}
//# sourceMappingURL=index.js.map