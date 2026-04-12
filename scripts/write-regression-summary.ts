// @ts-nocheck — local utility script, not part of the Next.js app
/**
 * Reads Playwright JSON report (test-results/regression-results.json) and writes
 * a compact regression-summary.json for the Regression Dashboard.
 * Run after: npx playwright test --config=playwright.regression.config.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const RESULTS_PATH = path.join(process.cwd(), 'test-results', 'regression-results.json');
const SUMMARY_PATH = path.join(process.cwd(), 'test-results', 'regression-summary.json');

interface PlaywrightJsonReport {
  config?: unknown;
  suites?: Array<{
    title?: string;
    specs?: Array<{
      title?: string;
      tests?: Array<{
        title?: string;
        results?: Array<{ status?: string; duration?: number }>;
      }>;
    }>;
  }>;
  stats?: {
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
    duration?: number;
  };
  startTime?: string;
  duration?: number;
}

function collectTests(suites: PlaywrightJsonReport['suites'], acc: { title: string; outcome: string; duration?: number }[] = []): void {
  if (!suites) return;
  for (const suite of suites) {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const result = t.results?.[t.results.length - 1];
        const status = result?.status ?? 'skipped';
        const duration = result?.duration;
        acc.push({
          title: [suite.title, spec.title, t.title].filter(Boolean).join(' > ') || t.title || 'unknown',
          outcome: status,
          duration,
        });
      }
    }
    collectTests(suite.suites, acc);
  }
}

function main(): void {
  let raw: string;
  try {
    raw = fs.readFileSync(RESULTS_PATH, 'utf-8');
  } catch (e) {
    const summary = {
      lastRun: new Date().toISOString(),
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      durationMs: 0,
      error: 'No regression-results.json found. Run: npm run test:e2e:regression',
      results: [] as { title: string; outcome: string; duration?: number }[],
    };
    fs.mkdirSync(path.dirname(SUMMARY_PATH), { recursive: true });
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
    console.log('Wrote regression-summary.json (no results file).');
    process.exit(0);
    return;
  }

  let report: PlaywrightJsonReport;
  try {
    report = JSON.parse(raw) as PlaywrightJsonReport;
  } catch (e) {
    const summary = {
      lastRun: new Date().toISOString(),
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      durationMs: 0,
      error: 'Invalid JSON in regression-results.json',
      results: [] as { title: string; outcome: string; duration?: number }[],
    };
    fs.mkdirSync(path.dirname(SUMMARY_PATH), { recursive: true });
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
    console.log('Wrote regression-summary.json (parse error).');
    process.exit(1);
    return;
  }

  const results: { title: string; outcome: string; duration?: number }[] = [];
  collectTests(report.suites, results);

  const passed = results.filter((r) => r.outcome === 'expected' || r.outcome === 'passed').length;
  const failed = results.filter((r) => r.outcome === 'unexpected' || r.outcome === 'failed').length;
  const skipped = results.filter((r) => r.outcome === 'skipped').length;
  const durationMs = report.duration ?? report.stats?.duration ?? 0;

  const summary = {
    lastRun: report.startTime ?? new Date().toISOString(),
    passed,
    failed,
    skipped,
    total: results.length,
    durationMs,
    error: failed > 0 ? `${failed} test(s) failed` : undefined,
    results,
  };

  fs.mkdirSync(path.dirname(SUMMARY_PATH), { recursive: true });
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
  console.log(`Wrote regression-summary.json: ${passed} passed, ${failed} failed, ${skipped} skipped.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
