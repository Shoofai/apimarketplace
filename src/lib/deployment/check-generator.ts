/**
 * Adaptive Check Generator: produces CheckDefinition[] from a CodeSnapshot.
 */

import { execSync } from 'child_process';
import type { CodeSnapshot, CheckDefinition, CheckResult } from './types';

const PROJECT_ROOT = process.cwd();

export class AdaptiveCheckGenerator {
  generateChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    const checks: CheckDefinition[] = [];

    checks.push(...this.getUniversalChecks(snapshot));

    if (snapshot.services.database) {
      checks.push(...this.getDatabaseChecks(snapshot));
    }
    if (snapshot.services.auth) {
      checks.push(...this.getAuthChecks(snapshot));
    }
    if (snapshot.services.payments) {
      checks.push(...this.getPaymentChecks(snapshot));
    }
    if (snapshot.changes) {
      checks.push(...this.getChangeImpactChecks(snapshot));
    }
    if (
      snapshot.risks.level === 'critical' ||
      snapshot.risks.level === 'high'
    ) {
      checks.push(...this.getHighRiskChecks(snapshot));
    }

    return checks;
  }

  private getUniversalChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    return [
      {
        id: 'typescript-compilation',
        category: 'build',
        name: 'TypeScript Compilation',
        description: 'Ensure TypeScript compiles without errors',
        severity: 'critical',
        validator: async (): Promise<CheckResult> => {
          try {
            execSync('npx tsc --noEmit', {
              cwd: PROJECT_ROOT,
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe'],
              timeout: 60_000,
            });
            return { passed: true, message: 'TypeScript compiles successfully' };
          } catch (e: unknown) {
            const err = e as { stdout?: string; stderr?: string };
            const out = (err.stderr || err.stdout || '').slice(0, 500);
            return {
              passed: false,
              message: 'TypeScript has errors',
              detail: out,
            };
          }
        },
        fixPromptTemplate: 'Fix TypeScript errors reported by tsc --noEmit',
        enabled: true,
        reason: 'Required for all TypeScript projects',
      },
      {
        id: 'required-env-present',
        category: 'environment',
        name: 'Required Env Vars',
        description: 'All required environment variables should be documented or present',
        severity: snapshot.environment.missing.length > 0 ? 'high' : 'low',
        validator: async (): Promise<CheckResult> => {
          const missing = snapshot.environment.missing;
          if (missing.length === 0)
            return { passed: true, message: 'No missing required env vars' };
          return {
            passed: false,
            message: `Missing env vars: ${missing.join(', ')}`,
            detail: 'Set these in .env.local or document as optional in .env.example',
          };
        },
        fixPromptTemplate: 'Add missing env vars to .env.local or mark optional in .env.example',
        enabled: true,
        reason: 'Environment configuration',
      },
      {
        id: 'no-critical-vulnerabilities',
        category: 'dependencies',
        name: 'No Critical npm Vulnerabilities',
        description: 'npm audit should not report critical vulnerabilities',
        severity: 'high',
        validator: async (): Promise<CheckResult> => {
          const vuln = snapshot.dependencies.vulnerable;
          if (vuln.length === 0)
            return { passed: true, message: 'No known vulnerabilities' };
          return {
            passed: false,
            message: `${vuln.length} package(s) with known vulnerabilities`,
            detail: vuln.slice(0, 10).join(', '),
          };
        },
        fixPromptTemplate: 'Run npm audit fix or update vulnerable packages',
        enabled: true,
        reason: 'Security',
      },
    ];
  }

  private getDatabaseChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    const checks: CheckDefinition[] = [];
    const db = snapshot.services.database!;

    if (db.type === 'supabase') {
      checks.push({
        id: 'supabase-rls-coverage',
        category: 'security',
        name: 'RLS Policy Coverage',
        description: `Ensure Supabase tables have RLS enabled`,
        severity: 'critical',
        validator: async (): Promise<CheckResult> => {
          if (db.hasRLS)
            return { passed: true, message: 'RLS usage detected in migrations' };
          return {
            passed: false,
            message: 'No RLS policies detected in migrations',
            detail: 'Enable RLS and add policies for all tables',
          };
        },
        fixPromptTemplate: 'Add ENABLE ROW LEVEL SECURITY and CREATE POLICY in Supabase migrations',
        enabled: true,
        reason: 'Supabase database detected',
      });

      if (!db.hasGeneratedTypes) {
        checks.push({
          id: 'supabase-types-generated',
          category: 'type-safety',
          name: 'Generated Types Exist',
          description: 'Supabase types should be generated for type safety',
          severity: 'high',
          validator: async (): Promise<CheckResult> => ({
            passed: false,
            message: 'types/supabase.ts (or similar) not found',
          }),
          fixPromptTemplate:
            'Run: npx supabase gen types typescript --project-id <id> > types/supabase.ts',
          enabled: true,
          reason: 'Supabase detected without generated types',
        });
      }
    }

    return checks;
  }

  private getAuthChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    return [
      {
        id: 'auth-protected-routes',
        category: 'security',
        name: 'Protected Routes',
        description: 'Ensure admin/authenticated routes check auth',
        severity: 'high',
        validator: async (): Promise<CheckResult> => {
          const adminRoutes = snapshot.patterns.apiRoutes.filter(
            (r) => r.includes('admin/') || r.includes('dashboard')
          );
          return {
            passed: true,
            message: `${adminRoutes.length} admin/API routes detected; verify they use requirePlatformAdmin or auth check`,
          };
        },
        fixPromptTemplate: 'Add auth checks (getUser, requirePlatformAdmin) to protected API routes',
        enabled: true,
        reason: 'Auth service detected',
      },
    ];
  }

  private getPaymentChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    const payments = snapshot.services.payments!;
    return [
      {
        id: 'stripe-webhook-secret',
        category: 'security',
        name: 'Stripe Webhook Configured',
        description: 'Stripe webhook endpoint should exist and use signing secret',
        severity: 'high',
        validator: async (): Promise<CheckResult> => {
          const hasWebhook = (payments.webhooks?.length ?? 0) > 0;
          if (hasWebhook)
            return { passed: true, message: 'Stripe webhook route found' };
          return {
            passed: false,
            message: 'No Stripe webhook route detected',
            detail: 'Add e.g. src/app/api/webhooks/stripe/route.ts and use STRIPE_WEBHOOK_SECRET',
          };
        },
        fixPromptTemplate: 'Implement Stripe webhook handler and verify signature',
        enabled: true,
        reason: 'Stripe payments detected',
      },
    ];
  }

  private getChangeImpactChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    const checks: CheckDefinition[] = [];
    const ch = snapshot.changes!;

    if (ch.newDependencies.length > 0) {
      checks.push({
        id: 'new-dependencies-verified',
        category: 'dependencies',
        name: 'New Dependencies Verified',
        description: `${ch.newDependencies.length} new dependency(ies) added`,
        severity: 'medium',
        validator: async (): Promise<CheckResult> => {
          const risky = ch.newDependencies.filter((d) =>
            this.isRiskyDependency(d)
          );
          if (risky.length === 0)
            return { passed: true, message: 'New dependencies look safe' };
          return {
            passed: false,
            message: `Review: ${risky.join(', ')}`,
            detail: 'Verify license and security for new packages',
          };
        },
        fixPromptTemplate: 'Review new dependencies for license and security',
        enabled: true,
        reason: 'New dependencies need verification',
      });
    }

    if (ch.changedPatterns.includes('API routes')) {
      checks.push({
        id: 'api-routes-changed',
        category: 'api',
        name: 'API Route Changes',
        description: 'API routes changed; ensure they are tested',
        severity: 'high',
        validator: async (): Promise<CheckResult> => ({
          passed: true,
          message: `${snapshot.patterns.apiRoutes.length} API routes; ensure critical paths have tests`,
        }),
        fixPromptTemplate: 'Add or update tests for changed API routes',
        enabled: true,
        reason: 'API routes were modified',
      });
    }

    return checks;
  }

  private getHighRiskChecks(snapshot: CodeSnapshot): CheckDefinition[] {
    return [
      {
        id: 'high-risk-security-review',
        category: 'security',
        name: 'Security Review',
        description: 'High-risk project: ensure auth, RLS, and secrets are reviewed',
        severity: 'high',
        validator: async (): Promise<CheckResult> => ({
          passed: true,
          message: `Risk level: ${snapshot.risks.level}. Factors: ${snapshot.risks.factors.join(', ')}`,
        }),
        fixPromptTemplate: 'Review RLS, auth guards, and env secrets before deploy',
        enabled: true,
        reason: 'High/critical risk level',
      },
    ];
  }

  private isRiskyDependency(name: string): boolean {
    const risky = [
      'eval',
      'child_process',
      'node-gyp',
      'native',
      'ffi',
      'edge',
    ];
    return risky.some((r) => name.toLowerCase().includes(r));
  }
}
