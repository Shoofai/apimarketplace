import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy, Target } from 'lucide-react';

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: challenges } = await supabase
    .from('developer_challenges')
    .select('id, title, description, starts_at, ends_at')
    .order('created_at', { ascending: false })
    .limit(DEFAULT_LIST_LIMIT);

  const now = new Date().toISOString();
  const active = (challenges ?? []).filter(
    (c: { starts_at?: string; ends_at?: string | null }) =>
      (c.starts_at ?? '') <= now && (!c.ends_at || c.ends_at >= now)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Developer challenges
        </h1>
        <p className="text-muted-foreground">Compete and get on the leaderboard</p>
      </div>

      {active.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No active challenges</CardTitle>
            <CardDescription>Check back later for new challenges.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(active as { id: string; title: string; description?: string | null }[]).map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {c.title}
                </CardTitle>
                {c.description && <CardDescription>{c.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/dashboard/challenges/${c.id}`}>View and submit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top submissions across challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Submit to a challenge to appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
