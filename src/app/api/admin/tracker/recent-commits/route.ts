import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { withPlatformAdmin } from '@/lib/auth/admin';

export type RecentCommit = {
  sha: string;
  subject: string;
};

/**
 * GET /api/admin/tracker/recent-commits
 * Returns recent commit SHAs and subjects for adding notes (e.g. dropdown).
 */
export const GET = withPlatformAdmin(async () => {
  const repoRoot = process.cwd();
  const limit = 50;
  const commits: RecentCommit[] = [];

  try {
    const out = execSync(
      `git log --format="%h %s" -${limit}`,
      {
        cwd: repoRoot,
        encoding: 'utf-8',
        maxBuffer: 512 * 1024,
      }
    );
    const lines = String(out).trim().split('\n').filter(Boolean);
    for (const line of lines) {
      const firstSpace = line.indexOf(' ');
      if (firstSpace === -1) continue;
      const sha = line.slice(0, firstSpace).trim();
      const subject = line.slice(firstSpace + 1).trim();
      if (sha) commits.push({ sha, subject });
    }
  } catch {
    // no repo or git not available
  }

  return NextResponse.json({ commits });
});
