import { Command } from 'commander';
import { apiJson } from '../lib/client';

interface ProxyResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  latency: number;
}

/**
 * kinetic test <url>
 * Test an API endpoint by routing through the platform proxy.
 *
 * Usage:
 *   kinetic test https://api.example.com/v1/users
 *   kinetic test https://api.example.com/v1/users --method POST --data '{"name":"Alice"}'
 *   kinetic test https://api.example.com/v1/users -H "X-API-Key: sk_live_..." --json
 */
export function registerTest(program: Command): void {
  program
    .command('test <url>')
    .description('Test an API endpoint through the Kinetic proxy')
    .option('-X, --method <method>', 'HTTP method', 'GET')
    .option('-H, --header <header...>', 'request headers (format: "Key: Value")')
    .option('-d, --data <body>', 'request body (JSON string)')
    .option('-s, --subscription <id>', 'subscription ID (attaches your API key automatically)')
    .option('--json', 'output raw JSON response')
    .action(async (
      url: string,
      opts: { method: string; header?: string[]; data?: string; subscription?: string; json?: boolean }
    ) => {
      try {
        const headers: Record<string, string> = {};
        for (const h of opts.header ?? []) {
          const idx = h.indexOf(':');
          if (idx !== -1) {
            headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
          }
        }

        const payload: Record<string, unknown> = {
          method: opts.method.toUpperCase(),
          url,
          headers: Object.keys(headers).length ? headers : undefined,
          body: opts.data ?? undefined,
          subscription_id: opts.subscription ?? undefined,
        };

        console.log(`\n→ ${opts.method.toUpperCase()} ${url}\n`);

        const result = await apiJson<ProxyResponse>('/api/proxy', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const statusColor = result.status >= 400 ? '\x1b[31m' : result.status >= 300 ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(`${statusColor}Status: ${result.status}${reset}  (${result.latency}ms)\n`);

        // Print relevant headers
        const interestingHeaders = ['content-type', 'x-ratelimit-limit', 'x-ratelimit-remaining'];
        for (const [k, v] of Object.entries(result.headers ?? {})) {
          if (interestingHeaders.includes(k.toLowerCase())) {
            console.log(`  ${k}: ${v}`);
          }
        }

        console.log('\nResponse body:');
        if (typeof result.body === 'object') {
          console.log(JSON.stringify(result.body, null, 2));
        } else {
          console.log(String(result.body));
        }
        console.log();
      } catch (e) {
        console.error(e instanceof Error ? e.message : 'Request failed');
        process.exit(1);
      }
    });
}
