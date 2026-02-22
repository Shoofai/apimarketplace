import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { SubmitChallengeForm } from './SubmitChallengeForm';

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: challenge } = await supabase
    .from('developer_challenges')
    .select('id, title, description, api_id, starts_at, ends_at')
    .eq('id', id)
    .single();

  if (!challenge) notFound();

  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, score, status, proof_description, created_at')
    .eq('challenge_id', id)
    .order('score', { ascending: false, nullsFirst: false })
    .limit(DEFAULT_LIST_LIMIT);

  const mySubmission = (submissions ?? []).find((s) => (s as { user_id: string }).user_id === user.id);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/discover/challenges"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          {(challenge as { title: string }).title}
        </h1>
        {(challenge as { description?: string }).description && (
          <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{(challenge as { description: string }).description}</p>
        )}
      </div>

      {!mySubmission ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit your entry</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmitChallengeForm challengeId={id} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your submission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Status: {(mySubmission as { status: string }).status}</p>
            {(mySubmission as { proof_description?: string }).proof_description && (
              <p className="text-muted-foreground mt-2">{(mySubmission as { proof_description: string }).proof_description}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">#</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(submissions ?? []).slice(0, 20).map((s, i) => (
                <tr key={(s as { id: string }).id} className="border-b">
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2">{(s as { score: number | null }).score ?? '—'}</td>
                  <td className="py-2">{(s as { status: string }).status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
