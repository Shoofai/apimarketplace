import { Command } from 'commander';
import prompts from 'prompts';
import { apiJson } from '../lib/client';

interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number | null;
  included_calls: number | null;
  rate_limit_per_second: number | null;
}

interface SearchResult {
  apis: {
    id: string;
    name: string;
    slug: string;
    organization: { name: string; slug: string };
  }[];
}

/**
 * kinetic subscribe <slug>
 * Subscribe to a marketplace API. Authenticates and creates a subscription.
 * The API key is printed once and never stored.
 *
 * Usage:
 *   kinetic subscribe stripe-api
 *   kinetic subscribe stripe-api --plan free
 */
export function registerSubscribe(program: Command): void {
  program
    .command('subscribe <slug>')
    .description('Subscribe to a marketplace API')
    .option('-p, --plan <name>', 'pricing plan name to subscribe to (skips interactive prompt)')
    .option('--json', 'output raw JSON')
    .action(async (slug: string, opts: { plan?: string; json?: boolean }) => {
      try {
        // 1. Search for the API by slug
        const search = await apiJson<SearchResult>(`/api/marketplace/search?q=${encodeURIComponent(slug)}&limit=5`, { noAuth: true });

        const found = search.apis.find(
          (a) => a.slug === slug || a.name.toLowerCase() === slug.toLowerCase()
        ) ?? search.apis[0];

        if (!found) {
          console.error(`No API found matching "${slug}". Use "kinetic search ${slug}" to find the correct slug.`);
          process.exit(1);
        }

        // 2. Fetch pricing plans for the API
        const plans = await apiJson<PricingPlan[]>(`/api/apis/${found.id}/pricing-plans`, { noAuth: true }).catch(() => [] as PricingPlan[]);

        if (!plans.length) {
          console.error(`No pricing plans available for "${found.name}".`);
          process.exit(1);
        }

        // 3. Pick a plan
        let chosenPlan: PricingPlan | undefined;
        if (opts.plan) {
          chosenPlan = plans.find((p) => p.name.toLowerCase() === opts.plan!.toLowerCase());
          if (!chosenPlan) {
            console.error(`Plan "${opts.plan}" not found. Available plans: ${plans.map((p) => p.name).join(', ')}`);
            process.exit(1);
          }
        } else {
          const { planId } = await prompts({
            type: 'select',
            name: 'planId',
            message: `Select a plan for ${found.name}`,
            choices: plans.map((p) => ({
              title: `${p.name}  ${p.price_monthly != null ? `$${p.price_monthly}/mo` : 'Free'}  ${p.included_calls != null ? `${p.included_calls.toLocaleString()} calls/mo` : ''}`,
              value: p.id,
            })),
          });
          chosenPlan = plans.find((p) => p.id === planId);
        }

        if (!chosenPlan) {
          console.log('Subscription cancelled.');
          return;
        }

        // 4. Create subscription
        const result = await apiJson<{ subscription: unknown; api_key: string; message: string }>(
          '/api/subscriptions',
          {
            method: 'POST',
            body: JSON.stringify({ api_id: found.id, pricing_plan_id: chosenPlan.id }),
          }
        );

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(`\nSubscribed to: ${found.name} — ${chosenPlan.name}`);
        console.log(`\nYour API key (shown once, store it securely):\n`);
        console.log(`  ${result.api_key}\n`);
        console.log(`Add to your environment:`);
        console.log(`  export KINETIC_API_KEY="${result.api_key}"\n`);
      } catch (e) {
        console.error(e instanceof Error ? e.message : 'Subscribe failed');
        process.exit(1);
      }
    });
}
