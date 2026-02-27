/**
 * Dynamic Discovery Engine for the Adaptive Deployment Auditor.
 * Scans the codebase on every run and produces a CodeSnapshot.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import type {
  CodeSnapshot,
  DatabaseInfo,
  AuthInfo,
  PaymentInfo,
  StorageInfo,
  EmailInfo,
  AnalyticsInfo,
} from './types';

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  'out',
  'dist',
  'build',
  '.git',
  'coverage',
  'prod-readiness-scanner',
  'packages/prod-readiness-scanner',
  '.claude',
]);

const SNAPSHOT_FILE = '.deployment-snapshot.json';

export class CodebaseDiscovery {
  private projectRoot: string;
  private previousSnapshot: CodeSnapshot | null = null;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = path.resolve(projectRoot);
  }

  async discover(): Promise<CodeSnapshot> {
    const [
      git,
      architecture,
      services,
      patterns,
      dependencies,
      environment,
      customLogic,
    ] = await Promise.all([
      this.detectGitInfo(),
      this.detectArchitecture(),
      this.detectServices(),
      this.detectPatterns(),
      this.detectDependencies(),
      this.detectEnvironment(),
      this.detectCustomLogic(),
    ]);

    const risks = this.assessRisks({ services, patterns, customLogic });

    const snapshot: CodeSnapshot = {
      timestamp: new Date().toISOString(),
      git,
      architecture,
      services,
      patterns,
      dependencies,
      environment,
      customLogic,
      risks,
    };

    await this.loadPreviousSnapshot();
    if (this.previousSnapshot) {
      snapshot.changes = this.detectChanges(this.previousSnapshot, snapshot);
    }

    return snapshot;
  }

  /** Persist current snapshot for next run's change detection. */
  async saveSnapshot(snapshot: CodeSnapshot): Promise<void> {
    const filePath = path.join(this.projectRoot, SNAPSHOT_FILE);
    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
  }

  /** Load previous snapshot from disk for change detection. */
  async loadPreviousSnapshot(): Promise<void> {
    const filePath = path.join(this.projectRoot, SNAPSHOT_FILE);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.previousSnapshot = JSON.parse(content) as CodeSnapshot;
    } catch {
      this.previousSnapshot = null;
    }
  }

  private async detectGitInfo(): Promise<CodeSnapshot['git']> {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      }).trim();
      const commit = execSync('git rev-parse HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      }).trim();
      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      });
      return { branch, commit, uncommitted: status.length > 0 };
    } catch {
      return { branch: 'unknown', commit: 'unknown', uncommitted: false };
    }
  }

  private async detectArchitecture(): Promise<CodeSnapshot['architecture']> {
    const pkgPath = path.join(this.projectRoot, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf-8').catch(() => '{}');
    const pkg = JSON.parse(content) as Record<string, unknown>;
    const deps = (pkg.dependencies as Record<string, string>) || {};
    const nextVersion = deps.next?.replace(/^\^/, '') ?? 'unknown';

    const hasAppDir =
      (await this.pathExists(path.join(this.projectRoot, 'src/app'))) ||
      (await this.pathExists(path.join(this.projectRoot, 'app')));
    const hasPagesDir =
      (await this.pathExists(path.join(this.projectRoot, 'src/pages'))) ||
      (await this.pathExists(path.join(this.projectRoot, 'pages')));

    let packageManager = 'npm';
    if (await this.pathExists(path.join(this.projectRoot, 'pnpm-lock.yaml')))
      packageManager = 'pnpm';
    else if (await this.pathExists(path.join(this.projectRoot, 'yarn.lock')))
      packageManager = 'yarn';

    const engines = pkg.engines as Record<string, string> | undefined;
    const nodeVersion =
      engines?.node ?? process.version.replace(/^v/, '');

    return {
      framework: `Next.js ${nextVersion}`,
      version: nextVersion,
      router: hasAppDir ? 'app' : 'pages',
      packageManager,
      nodeVersion,
    };
  }

  private async detectServices(): Promise<CodeSnapshot['services']> {
    const pkgPath = path.join(this.projectRoot, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf-8').catch(() => '{}');
    const pkg = JSON.parse(content) as Record<string, unknown>;
    const deps = {
      ...((pkg.dependencies as Record<string, string>) || {}),
      ...((pkg.devDependencies as Record<string, string>) || {}),
    };
    const services: CodeSnapshot['services'] = {};

    if (deps['@supabase/supabase-js']) {
      services.database = {
        type: 'supabase',
        version: deps['@supabase/supabase-js'],
        tables: await this.detectSupabaseTables(),
        hasRLS: await this.detectRLSUsage(),
        hasGeneratedTypes: await this.detectSupabaseGeneratedTypes(),
      };
    } else if (deps['@prisma/client']) {
      services.database = {
        type: 'prisma',
        version: deps['@prisma/client'],
        schema: await this.pathExists(
          path.join(this.projectRoot, 'prisma/schema.prisma')
        ),
      };
    }

    if (deps['@supabase/supabase-js'] && (await this.detectAuthUsage())) {
      services.auth = {
        type: 'supabase-auth',
        flows: await this.detectAuthFlows(),
      };
    } else if (deps['next-auth']) {
      services.auth = {
        type: 'next-auth',
        providers: await this.detectNextAuthProviders(),
      };
    }

    if (deps['stripe']) {
      services.payments = {
        type: 'stripe',
        version: deps['stripe'],
        webhooks: await this.detectStripeWebhooks(),
        products: [],
      };
    }

    if (await this.detectStorageUsage()) {
      services.storage = {
        type: 'supabase-storage',
        buckets: await this.detectStorageBuckets(),
      };
    }

    if (deps['resend']) {
      services.email = { type: 'resend', version: deps['resend'] };
    } else if (deps['@sendgrid/mail']) {
      services.email = { type: 'sendgrid', version: deps['@sendgrid/mail'] };
    }

    if (deps['posthog-js']) {
      services.analytics = { type: 'posthog', version: deps['posthog-js'] };
    }

    return services;
  }

  private async detectPatterns(): Promise<CodeSnapshot['patterns']> {
    const codeFiles = await this.findFiles(['.ts', '.tsx', '.js', '.jsx']);
    const apiRoutes: string[] = [];
    const serverComponents: string[] = [];
    const clientComponents: string[] = [];
    const middleware: string[] = [];
    const cron: string[] = [];

    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      if (rel.includes('/api/') && (rel.endsWith('route.ts') || rel.endsWith('route.js'))) {
        apiRoutes.push(rel);
        if (rel.includes('/api/cron/')) cron.push(rel);
      } else if (
        rel === 'middleware.ts' ||
        rel === 'middleware.js' ||
        rel === 'src/middleware.ts' ||
        rel === 'src/middleware.js'
      ) {
        middleware.push(rel);
      } else if (rel.endsWith('.tsx') || rel.endsWith('.ts') || rel.endsWith('.jsx') || rel.endsWith('.js')) {
        const content = await fs.readFile(full, 'utf-8').catch(() => '');
        const isClient =
          content.includes("'use client'") || content.includes('"use client"');
        if (isClient) clientComponents.push(rel);
        else if (rel.includes('app/') || rel.includes('src/app/') || rel.includes('components/'))
          serverComponents.push(rel);
      }
    }

    return {
      apiRoutes,
      serverComponents,
      clientComponents,
      middleware,
      cron,
    };
  }

  private async detectDependencies(): Promise<CodeSnapshot['dependencies']> {
    const pkgPath = path.join(this.projectRoot, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf-8').catch(() => '{}');
    const pkg = JSON.parse(content) as Record<string, unknown>;
    const production = (pkg.dependencies as Record<string, string>) || {};
    const development = (pkg.devDependencies as Record<string, string>) || {};

    let outdated: string[] = [];
    let vulnerable: string[] = [];
    try {
      const out = execSync('npm outdated --json', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      outdated = Object.keys(JSON.parse(out));
    } catch (e: unknown) {
      const err = e as { stdout?: string };
      if (err.stdout) {
        try {
          outdated = Object.keys(JSON.parse(err.stdout));
        } catch {
          // ignore
        }
      }
    }
    try {
      const out = execSync('npm audit --json', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      const audit = JSON.parse(out) as { vulnerabilities?: Record<string, unknown> };
      vulnerable = Object.keys(audit.vulnerabilities || {});
    } catch {
      // audit may fail
    }

    return {
      production,
      development,
      outdated,
      vulnerable,
    };
  }

  private async detectEnvironment(): Promise<CodeSnapshot['environment']> {
    const required: string[] = [];
    const optional: string[] = [];
    const examplePath = path.join(this.projectRoot, '.env.example');
    try {
      const content = await fs.readFile(examplePath, 'utf-8');
      for (const line of content.split('\n')) {
        const key = line.split('=')[0]?.trim();
        if (key && !key.startsWith('#')) required.push(key);
      }
    } catch {
      // no .env.example
    }

    const localPath = path.join(this.projectRoot, '.env.local');
    const provided = new Set<string>();
    try {
      const content = await fs.readFile(localPath, 'utf-8');
      for (const line of content.split('\n')) {
        const key = line.split('=')[0]?.trim();
        if (key && !key.startsWith('#')) provided.add(key);
      }
    } catch {
      // no .env.local
    }

    const missing = required.filter((k) => !provided.has(k));
    for (const k of provided) {
      if (!required.includes(k)) optional.push(k);
    }

    const codeFiles = await this.findFiles(['.ts', '.tsx', '.js', '.jsx']);
    const exposed = new Set<string>();
    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      const content = await fs.readFile(full, 'utf-8').catch(() => '');
      const matches = content.match(/NEXT_PUBLIC_\w+/g) || [];
      matches.forEach((m) => exposed.add(m));
    }

    return {
      required,
      optional,
      missing,
      exposed: [...exposed],
    };
  }

  private async detectCustomLogic(): Promise<CodeSnapshot['customLogic']> {
    const authFlows = await this.findAuthFlows();
    const paymentFlows = await this.findPaymentFlows();
    const dataModels = await this.findDataModels();
    const businessRules = await this.findBusinessRules();
    return { authFlows, paymentFlows, dataModels, businessRules };
  }

  private assessRisks(data: {
    services: CodeSnapshot['services'];
    patterns: CodeSnapshot['patterns'];
    customLogic: CodeSnapshot['customLogic'];
  }): CodeSnapshot['risks'] {
    const factors: string[] = [];
    let level: CodeSnapshot['risks']['level'] = 'low';

    if (data.services.payments) {
      factors.push('Handles financial transactions');
      level = 'high';
    }
    if (
      data.services.database &&
      data.services.database.type === 'supabase' &&
      data.services.database.hasRLS === false
    ) {
      factors.push('Database may lack RLS policies');
      level = level === 'high' ? 'critical' : 'high';
    }
    if (data.services.auth) {
      factors.push('User authentication');
      if (level === 'low') level = 'medium';
    }
    if (data.customLogic.businessRules.length > 10) {
      factors.push('Complex business logic');
      if (level === 'low') level = 'medium';
    }
    if (data.patterns.apiRoutes.length > 50) {
      factors.push('Large API surface');
      if (level === 'low') level = 'medium';
    }

    return { level, factors };
  }

  private detectChanges(
    previous: CodeSnapshot,
    current: CodeSnapshot
  ): NonNullable<CodeSnapshot['changes']> {
    const prevDeps = Object.keys(previous.dependencies.production);
    const currDeps = Object.keys(current.dependencies.production);
    const newDependencies = currDeps.filter((d) => !prevDeps.includes(d));
    const removedDependencies = prevDeps.filter((d) => !currDeps.includes(d));

    const newPatterns: string[] = [];
    const changedPatterns: string[] = [];
    if (
      current.patterns.apiRoutes.length !== previous.patterns.apiRoutes.length
    ) {
      changedPatterns.push('API routes');
    }
    if (current.services.database && !previous.services.database) {
      newPatterns.push('Database integration');
    }
    if (current.services.payments && !previous.services.payments) {
      newPatterns.push('Payment processing');
    }

    let filesChanged = 0;
    let linesChanged = 0;
    try {
      if (previous.git.commit && current.git.commit && previous.git.commit !== current.git.commit) {
        const out = execSync(
          `git diff --stat ${previous.git.commit} ${current.git.commit}`,
          { cwd: this.projectRoot, encoding: 'utf-8' }
        );
        const lastLine = out.trim().split('\n').pop();
        const match = lastLine?.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\), (\d+) deletions?\(-\))?/);
        if (match) {
          filesChanged = parseInt(match[1] ?? '0', 10);
          if (match[2] && match[3])
            linesChanged = parseInt(match[2], 10) + parseInt(match[3], 10);
        }
      }
    } catch {
      // ignore
    }

    return {
      filesChanged,
      linesChanged,
      newDependencies,
      removedDependencies,
      newPatterns,
      changedPatterns,
    };
  }

  private async findFiles(extensions: string[]): Promise<string[]> {
    const results: string[] = [];
    const walk = async (dir: string): Promise<void> => {
      let entries: Array<{ name: string; isDirectory: () => boolean }>;
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        const rel = path.relative(this.projectRoot, full);
        if (ent.isDirectory()) {
          const seg = rel.split(path.sep)[0];
          if (seg && EXCLUDE_DIRS.has(seg)) continue;
          if (EXCLUDE_DIRS.has(ent.name)) continue;
          await walk(full);
          continue;
        }
        const ext = path.extname(ent.name).toLowerCase();
        if (extensions.includes(ext)) results.push(rel);
      }
    };
    await walk(this.projectRoot);
    return results;
  }

  private async pathExists(p: string): Promise<boolean> {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  }

  private async detectSupabaseTables(): Promise<string[] | undefined> {
    const migrationsDir = path.join(this.projectRoot, 'supabase/migrations');
    const exists = await this.pathExists(migrationsDir);
    if (!exists) return undefined;
    const files = await fs.readdir(migrationsDir).catch(() => []);
    const tables = new Set<string>();
    for (const f of files) {
      if (!f.endsWith('.sql')) continue;
      const content = await fs
        .readFile(path.join(migrationsDir, f), 'utf-8')
        .catch(() => '');
      const createMatch = content.match(/CREATE TABLE (?:IF NOT EXISTS )?["']?(\w+)["']?/gi);
      if (createMatch) {
        createMatch.forEach((m) => {
          const name = m.replace(/CREATE TABLE (?:IF NOT EXISTS )?["']?/i, '').replace(/["']?/i, '').trim();
          if (name) tables.add(name);
        });
      }
    }
    return tables.size > 0 ? [...tables] : undefined;
  }

  private async detectRLSUsage(): Promise<boolean> {
    const migrationsDir = path.join(this.projectRoot, 'supabase/migrations');
    const exists = await this.pathExists(migrationsDir);
    if (!exists) return false;
    const files = await fs.readdir(migrationsDir).catch(() => []);
    for (const f of files) {
      if (!f.endsWith('.sql')) continue;
      const content = await fs
        .readFile(path.join(migrationsDir, f), 'utf-8')
        .catch(() => '');
      if (content.includes('ENABLE ROW LEVEL SECURITY') || content.includes('CREATE POLICY')) return true;
    }
    return false;
  }

  private async detectSupabaseGeneratedTypes(): Promise<boolean> {
    const candidates = [
      'types/supabase.ts',
      'src/types/supabase.ts',
      'lib/supabase-types.ts',
      'src/lib/supabase-types.ts',
    ];
    for (const c of candidates) {
      if (await this.pathExists(path.join(this.projectRoot, c))) return true;
    }
    return false;
  }

  private async detectAuthUsage(): Promise<boolean> {
    const codeFiles = await this.findFiles(['.ts', '.tsx']);
    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      const content = await fs.readFile(full, 'utf-8').catch(() => '');
      if (
        content.includes('getUser') ||
        content.includes('getSession') ||
        content.includes('signInWithPassword') ||
        content.includes('createClient')
      ) {
        return true;
      }
    }
    return false;
  }

  private async detectAuthFlows(): Promise<string[]> {
    const flows: string[] = [];
    const appDir = path.join(this.projectRoot, 'src/app');
    const authDir = path.join(appDir, '(auth)');
    if (await this.pathExists(authDir)) {
      const entries = await fs.readdir(authDir, { withFileTypes: true }).catch(() => []);
      entries.forEach((e) => {
        if (e.isDirectory()) flows.push(e.name);
        else if (e.name === 'login' || e.name === 'signup') flows.push(e.name);
      });
    }
    if (flows.length === 0) flows.push('auth');
    return flows;
  }

  private async detectNextAuthProviders(): Promise<string[]> {
    const codeFiles = await this.findFiles(['.ts', '.tsx']);
    const providers: string[] = [];
    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      const content = await fs.readFile(full, 'utf-8').catch(() => '');
      const m = content.match(/Providers?\s*[=\[].*?(\w+Provider)/g);
      if (m) m.forEach((x) => providers.push(x));
    }
    return [...new Set(providers)].slice(0, 10);
  }

  private async detectStripeWebhooks(): Promise<string[]> {
    const apiRoutes = await this.findFiles(['.ts', '.js']);
    const webhooks = apiRoutes.filter(
      (r) =>
        r.includes('stripe') &&
        (r.endsWith('route.ts') || r.endsWith('route.js'))
    );
    return webhooks;
  }

  private async detectStorageUsage(): Promise<boolean> {
    const codeFiles = await this.findFiles(['.ts', '.tsx']);
    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      const content = await fs.readFile(full, 'utf-8').catch(() => '');
      if (content.includes('from(\'') && content.includes('storage') && content.includes('supabase')) return true;
    }
    return false;
  }

  private async detectStorageBuckets(): Promise<string[]> {
    const codeFiles = await this.findFiles(['.ts', '.tsx']);
    const buckets: string[] = [];
    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      const content = await fs.readFile(full, 'utf-8').catch(() => '');
      const m = content.match(/\.from\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      if (m) m.forEach((x) => {
        const name = x.replace(/\.from\s*\(\s*['"]/, '').replace(/['"]\s*\)/, '');
        if (name && !buckets.includes(name)) buckets.push(name);
      });
    }
    return buckets;
  }

  private async findAuthFlows(): Promise<string[]> {
    const flows: string[] = [];
    const appAuth = path.join(this.projectRoot, 'src/app', '(auth)');
    if (await this.pathExists(appAuth)) flows.push('(auth)');
    return flows;
  }

  private async findPaymentFlows(): Promise<string[]> {
    const codeFiles = await this.findFiles(['.ts', '.tsx']);
    const flows: string[] = [];
    for (const rel of codeFiles) {
      if (rel.includes('subscription') || rel.includes('checkout') || rel.includes('stripe'))
        flows.push(rel);
    }
    return flows.slice(0, 15);
  }

  private async findDataModels(): Promise<string[]> {
    const tables = (await this.detectSupabaseTables()) || [];
    return tables.slice(0, 30);
  }

  private async findBusinessRules(): Promise<string[]> {
    const codeFiles = await this.findFiles(['.ts', '.tsx']);
    const keywords = ['verification', 'trust', 'score', 'approve', 'reject', 'claim', 'moderation'];
    const rules: string[] = [];
    for (const rel of codeFiles) {
      const full = path.join(this.projectRoot, rel);
      const content = await fs.readFile(full, 'utf-8').catch(() => '');
      if (keywords.some((k) => content.toLowerCase().includes(k))) rules.push(rel);
    }
    return rules.slice(0, 20);
  }
}
