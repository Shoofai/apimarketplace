import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { ReplyForm } from './ReplyForm';
import { ReportButton } from '@/components/reports/ReportButton';

export default async function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: topic } = await supabase
    .from('forum_topics')
    .select('id, title, slug, category, created_at')
    .eq('id', id)
    .single();

  if (!topic) notFound();

  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, user_id, body, created_at')
    .eq('topic_id', id)
    .is('hidden_at', null)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIST_LIMIT);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/forum"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          {(topic as { title: string }).title}
        </h1>
        {(topic as { category?: string }).category && (
          <span className="text-sm text-muted-foreground">{(topic as { category: string }).category}</span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(posts ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">No posts yet. Be the first to reply.</p>
          ) : (
            (posts as { id: string; user_id: string; body: string; created_at: string }[]).map((p) => (
              <div key={p.id} className="border-l-2 pl-4 py-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">
                    {new Date(p.created_at).toLocaleString()}
                  </p>
                  <p className="whitespace-pre-wrap">{p.body}</p>
                </div>
                <ReportButton resourceType="forum_post" resourceId={p.id} />
              </div>
            ))
          )}
          <ReplyForm topicId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
