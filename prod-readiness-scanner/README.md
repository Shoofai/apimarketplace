# Production Readiness Scanner

CLI that scans a Next.js + TypeScript + Supabase repo and produces `validation-context.json` and `validation-context.md` for the Production Readiness dashboard and Cursor.

## Build

```bash
npm install
npm run build
```

## Run from repo root

From the app repo root (parent of `prod-readiness-scanner/`):

```bash
node prod-readiness-scanner/dist/cli/index.js scan --project . --out . --format json,md --fail-on CRITICAL
```

Or use the app scripts (after building the scanner once):

```bash
npm run scanner:build
npm run audit:prod
```

- **audit:prod** — Writes `validation-context.json` and `validation-context.md` to project root; exits with code 1 if any finding is CRITICAL.
- **audit:prod:strict** — Same but fails on HIGH or above.

## Options

- `--project <path>` — Project root to scan (default: `.`).
- `--out <path>` — Directory to write output (default: `./audit`). Use `.` to write to project root.
- `--format json,md` — Output formats.
- `--fail-on CRITICAL|HIGH|MEDIUM|LOW` — Exit code 1 if any active finding is at or above this severity.

## Baseline

To suppress known gaps, add `validation-baseline.json` at project root (see `validation-baseline.example.json` in the app repo). Suppressed findings are still reported but do not affect ship decision or exit code.

## Rulebook

See `docs/scanner/RULEBOOK_V2.md` in the app repo for rule IDs, severity, and remediation.
