# Build Readiness

Quick reference to keep Next.js production builds reliable.

## Scripts

| Script | Use |
|--------|-----|
| `npm run build` | Production build (webpack). Use in CI. |
| `npm run build:clean` | Remove `.next` then build. Use after branch switches, failed/killed builds, or lock/ENOENT errors. |

## When to Clean Build

- **CI:** Run `npm run build:clean` (or equivalent) so each run starts from a clean cache.
- **Locally:** After switching branches, after a failed or killed build, or when you see:
  - "Unable to acquire lock at .next/lock"
  - "ENOENT" / "_buildManifest.js.tmp"

If lock error persists: ensure no other `next dev` or `next build` is running, then `rm -rf .next` and run `npm run build` again.

## Bundler

Production build uses **webpack** (`next build --webpack`) to avoid Turbopack output-path issues (e.g. "No such file or directory" when writing dynamic route segments). Do not remove `--webpack` until your Next.js version is known to fix that.

## Concurrency

- Run only **one** `next build` per workspace (no parallel builds on the same directory).
- If a scanner or "Regenerate" runs `next build`, ensure it does not run at the same time as CI build.

## App-specific

- **Next.js:** 15.x. Middleware → proxy migration applies to Next 16+; no change needed yet.
- **Build workers:** `NEXT_PRIVATE_BUILD_WORKERS=1` is set in the build script for stability.
- **Analyze:** `npm run analyze` also uses webpack for consistency.
