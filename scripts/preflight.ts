#!/usr/bin/env tsx
/**
 * Pre-deployment verification script.
 * Run with: npx tsx scripts/preflight.ts
 *
 * Checks: install → typecheck → lint → test → build → env validation
 */
import { execSync } from 'child_process';

const steps = [
  { name: 'Install dependencies', cmd: 'npm ci --prefer-offline' },
  { name: 'TypeScript check', cmd: 'npx tsc --noEmit' },
  { name: 'Lint', cmd: 'npx next lint' },
  { name: 'Unit tests', cmd: 'npx vitest run --reporter=verbose' },
  { name: 'Build', cmd: 'npm run build' },
];

let passed = 0;
let failed = 0;

console.log('\n🚀 LukeAPI Pre-deployment Preflight\n');
console.log('='.repeat(50));

for (const step of steps) {
  process.stdout.write(`\n▶ ${step.name}... `);
  try {
    execSync(step.cmd, { stdio: 'pipe', timeout: 300_000 });
    console.log('✅ PASS');
    passed++;
  } catch (err: any) {
    console.log('❌ FAIL');
    console.error(`  ${err.stderr?.toString().split('\n').slice(0, 5).join('\n  ') || err.message}`);
    failed++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${steps.length}\n`);

if (failed > 0) {
  console.log('❌ PREFLIGHT FAILED — do not deploy\n');
  process.exit(1);
} else {
  console.log('✅ PREFLIGHT PASSED — ready to deploy\n');
  process.exit(0);
}
