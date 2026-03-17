import { createAdminClient } from '@/lib/supabase/admin';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { CheckCircle2, Package } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Changelog | ${name}`,
    description: `What's new on ${name} — a record of every shipped feature and improvement.`,
  };
}

interface Sprint {
  id: string;
  sprint_number: number;
  name: string;
  phase: string;
  status: string;
  completed_at?: string;
  deliverables: { id: string; name: string; is_completed: boolean }[];
}

async function getCompletedSprints(): Promise<Sprint[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('implementation_sprints')
    .select('id, sprint_number, name, phase, status, completed_at, deliverables:sprint_deliverables(id, name, is_completed)')
    .eq('status', 'completed')
    .order('sprint_number', { ascending: false })
    .limit(50);
  return (data ?? []) as Sprint[];
}

export default async function ChangelogPage() {
  const [sprints, name] = await Promise.all([getCompletedSprints(), getPlatformName()]);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Changelog"
        subtitle={`What's new on ${name} — shipped features and improvements.`}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {sprints.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No releases yet.</div>
        ) : (
          <ol className="relative space-y-10 border-l border-gray-200 pl-8 dark:border-gray-800">
            {sprints.map((sprint) => {
              const completed = sprint.deliverables.filter((d) => d.is_completed);
              return (
                <li key={sprint.id} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[2.125rem] flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white dark:bg-primary-900/40 dark:ring-gray-950">
                    <Package className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                  </span>

                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Sprint {sprint.sprint_number} — {sprint.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      {sprint.phase && (
                        <span className="rounded-full border border-gray-200 px-2 py-0.5 dark:border-gray-700">
                          {sprint.phase}
                        </span>
                      )}
                      {sprint.completed_at && (
                        <time dateTime={sprint.completed_at}>
                          {new Date(sprint.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                      )}
                    </div>
                  </div>

                  {completed.length > 0 && (
                    <ul className="space-y-1.5">
                      {completed.map((d) => (
                        <li key={d.id} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{d.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Have a feature request?{' '}
            <Link href="/dashboard/forum" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              Post it in the community forum
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              contact us
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
