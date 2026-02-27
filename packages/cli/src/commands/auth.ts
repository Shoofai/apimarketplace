import { Command } from 'commander';
import prompts from 'prompts';
import { createClient } from '@supabase/supabase-js';
import { readConfig, writeConfig, clearConfig, getPlatformUrl } from '../lib/config';
import { apiFetch } from '../lib/client';

/**
 * kinetic auth
 * Authenticate with the Kinetic API Marketplace and store the JWT locally.
 *
 * Subcommands:
 *   kinetic auth          – sign in interactively
 *   kinetic auth status   – print current user
 *   kinetic auth logout   – clear stored credentials
 */
export function registerAuth(program: Command): void {
  const auth = program.command('auth').description('Manage authentication');

  // kinetic auth (default: sign in)
  auth
    .action(async () => {
      const { email } = await prompts({
        type: 'text',
        name: 'email',
        message: 'Email',
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email',
      });
      if (!email) return;

      const { password } = await prompts({
        type: 'password',
        name: 'password',
        message: 'Password',
      });
      if (!password) return;

      let platformUrl = getPlatformUrl();
      // Allow overriding the platform URL on first auth
      const cfg = readConfig();
      if (!cfg.platform_url) {
        const { url } = await prompts({
          type: 'text',
          name: 'url',
          message: 'Platform URL (press Enter for default)',
          initial: 'https://api.kineticapi.com',
        });
        platformUrl = (url as string) || 'https://api.kineticapi.com';
      }

      try {
        // Fetch Supabase config from the platform to get project URL and anon key
        const configRes = await apiFetch('/api/auth/cli-config', { noAuth: true, token: undefined });
        if (!configRes.ok) {
          console.error('Cannot reach platform. Check your platform URL.');
          process.exit(1);
        }
        const { supabase_url, supabase_anon_key } = await configRes.json() as {
          supabase_url: string;
          supabase_anon_key: string;
        };

        const supabase = createClient(supabase_url, supabase_anon_key, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          console.error(`Authentication failed: ${error.message}`);
          process.exit(1);
        }

        writeConfig({
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          platform_url: platformUrl,
          user_email: data.user?.email,
        });

        console.log(`\nSigned in as ${data.user?.email}`);
        console.log(`Token stored in ~/.kinetic/config.json\n`);
      } catch (e) {
        console.error(e instanceof Error ? e.message : 'Authentication failed');
        process.exit(1);
      }
    });

  auth
    .command('status')
    .description('Show current authentication status')
    .action(() => {
      const cfg = readConfig();
      if (cfg.access_token) {
        console.log(`Signed in as: ${cfg.user_email ?? '(unknown)'}`);
        console.log(`Platform: ${cfg.platform_url ?? 'https://api.kineticapi.com'}`);
      } else {
        console.log('Not signed in. Run: kinetic auth');
      }
    });

  auth
    .command('logout')
    .description('Clear stored credentials')
    .action(() => {
      clearConfig();
      console.log('Signed out.');
    });
}
