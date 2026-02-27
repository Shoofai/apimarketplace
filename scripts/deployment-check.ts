#!/usr/bin/env node
/**
 * Adaptive Deployment Check (CLI)
 * Usage: npx tsx scripts/deployment-check.ts
 *
 * Discovers codebase, generates checks, runs them, prints report and exits
 * with 1 if critical or high issues found.
 */

const projectRoot = process.cwd();

async function main() {
  const { CodebaseDiscovery } = await import('../src/lib/deployment/discovery');
  const { AdaptiveCheckGenerator } = await import('../src/lib/deployment/check-generator');
  const { CheckRunner } = await import('../src/lib/deployment/runner');
  const { ReportGenerator } = await import('../src/lib/deployment/reporter');

  console.log('Adaptive Deployment Check\n');

  const discovery = new CodebaseDiscovery(projectRoot);
  const snapshot = await discovery.discover();
  await discovery.saveSnapshot(snapshot);

  console.log('Codebase Snapshot:');
  console.log(`  Framework: ${snapshot.architecture.framework}`);
  console.log(`  Database: ${snapshot.services.database?.type ?? 'none'}`);
  console.log(`  Auth: ${snapshot.services.auth?.type ?? 'none'}`);
  console.log(`  Payments: ${snapshot.services.payments?.type ?? 'none'}`);
  console.log(`  Risk Level: ${snapshot.risks.level.toUpperCase()}`);
  if (snapshot.changes) {
    console.log('\n  Changes since last check:');
    console.log(`    Files: ${snapshot.changes.filesChanged}`);
    console.log(`    Lines: ${snapshot.changes.linesChanged}`);
    console.log(`    New deps: ${snapshot.changes.newDependencies.length}`);
  }
  console.log('');

  const generator = new AdaptiveCheckGenerator();
  const checks = generator.generateChecks(snapshot);
  console.log(`Generated ${checks.length} checks\n`);

  const runner = new CheckRunner();
  const results = await runner.runChecks(checks, {
    onProgress: (current, total) => {
      process.stdout.write(`\rRunning checks... ${current}/${total}`);
    },
  });

  console.log('\n\nChecks complete!\n');

  const reporter = new ReportGenerator();
  const report = reporter.generate(snapshot, results);
  await reporter.save(report, projectRoot);
  reporter.printSummary(report);

  if (report.summary.critical > 0) {
    console.log('\nCRITICAL issues found - deployment NOT recommended');
    process.exit(1);
  }
  if (report.summary.high > 0) {
    console.log('\nHIGH priority issues found - fix before deploying');
    process.exit(1);
  }
  console.log('\nAll checks passed - ready to deploy');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
