import { Command } from 'commander';
import { apiFetch } from '../lib/client';
import { getPlatformUrl } from '../lib/config';

/**
 * kinetic search <query>
 * Search the marketplace catalog (public, no auth required).
 *
 * Options:
 *   --limit <n>     results per page (default 10)
 *   --category <c>  filter by category slug
 *   --json          output raw JSON
 */
export function registerSearch(program: Command): void {
  program
    .command('search <query>')
    .description('Search the Kinetic API Marketplace catalog')
    .option('-l, --limit <n>', 'results per page', '10')
    .option('-c, --category <slug>', 'filter by category slug')
    .option('--json', 'output raw JSON')
    .action(async (query: string, opts: { limit: string; category?: string; json?: boolean }) => {
      try {
        const sp = new URLSearchParams({ q: query, limit: opts.limit });
        if (opts.category) sp.set('category', opts.category);

        const base = getPlatformUrl().replace(/\/$/, '');
        const res = await apiFetch(`/api/marketplace/search?${sp.toString()}`, { noAuth: true });
        const data = await res.json() as {
          apis: {
            id: string;
            name: string;
            slug: string;
            short_description?: string;
            avg_rating?: number;
            organization: { name: string; slug: string };
            category?: { name: string };
          }[];
          total: number;
        };

        if (opts.json) {
          console.log(JSON.stringify(data, null, 2));
          return;
        }

        if (!data.apis?.length) {
          console.log(`No APIs found for "${query}"`);
          return;
        }

        console.log(`\nFound ${data.total} result(s) for "${query}" (showing ${data.apis.length}):\n`);
        for (const api of data.apis) {
          const org = api.organization?.name ?? '';
          const cat = api.category?.name ?? '';
          const rating = api.avg_rating != null ? `★ ${api.avg_rating.toFixed(1)}` : '';
          console.log(`  ${api.name}  ${org ? `by ${org}` : ''}  ${cat}  ${rating}`);
          if (api.short_description) {
            console.log(`    ${api.short_description}`);
          }
          console.log(`    ${base}/marketplace/${api.organization?.slug}/${api.slug}`);
          console.log();
        }
      } catch (e) {
        console.error(e instanceof Error ? e.message : 'Search failed');
        process.exit(1);
      }
    });
}
