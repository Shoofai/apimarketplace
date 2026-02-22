import { NextResponse } from 'next/server';
import { execSync, execFileSync } from 'child_process';
import { withPlatformAdmin } from '@/lib/auth/admin';

const SHA_REGEX = /^[0-9a-f]{7,40}$/i;
const MESSAGE_MAX_LENGTH = 4096;

export type ChangelogNoteEntry = {
  sha: string;
  date: string;
  subject: string;
  note: string;
};

const F = '\x01'; // field separator (won't appear in notes)
const R = '\x02'; // record separator

/**
 * GET /api/admin/tracker/changelog-notes
 * Returns recent commits that have git notes (ref=implemented) for the changelog.
 */
export const GET = withPlatformAdmin(async () => {
  const repoRoot = process.cwd();
  const maxCount = 50;
  let entries: ChangelogNoteEntry[] = [];

  try {
    const out = execSync(
      `git log --show-notes=implemented --format="%h${F}%ad${F}%s${F}%N${R}" --date=short -${maxCount}`,
      {
        cwd: repoRoot,
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024,
      }
    );

    const raw = String(out).trim();
    if (!raw) return NextResponse.json({ entries });

    const records = raw.split(R).filter((r) => r.length > 0);
    for (const record of records) {
      const idx = record.indexOf(F);
      if (idx === -1) continue;
      const sha = record.slice(0, idx).trim();
      const rest = record.slice(idx + 1);
      const idx2 = rest.indexOf(F);
      if (idx2 === -1) continue;
      const date = rest.slice(0, idx2).trim();
      const rest2 = rest.slice(idx2 + 1);
      const idx3 = rest2.indexOf(F);
      if (idx3 === -1) continue;
      const subject = rest2.slice(0, idx3).trim();
      const note = rest2.slice(idx3 + 1).replace(/^\n+|\n+$/g, '').trim();
      if (sha && date) {
        entries.push({ sha, date, subject, note });
      }
    }
  } catch {
    entries = [];
  }

  return NextResponse.json({ entries });
});

/**
 * POST /api/admin/tracker/changelog-notes
 * Add or update a git note (ref=implemented) for a commit.
 * Body: { sha: string, message: string }
 */
export const POST = withPlatformAdmin(async (req: Request) => {
  let body: { sha?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const sha = typeof body.sha === 'string' ? body.sha.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!SHA_REGEX.test(sha)) {
    return NextResponse.json(
      { error: 'Invalid or missing sha (use 7–40 hex characters)' },
      { status: 400 }
    );
  }
  if (!message || message.length > MESSAGE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Message required and must be ≤ ${MESSAGE_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }

  const repoRoot = process.cwd();

  try {
    execFileSync(
      'git',
      ['notes', '--ref=implemented', 'add', '-f', '-m', message, sha],
      { cwd: repoRoot, encoding: 'utf-8' }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to add note: ${msg}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, sha });
});
