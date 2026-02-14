import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { NewTopicForm } from './NewTopicForm';

export default async function ForumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: topics } = await supabase
    .from('forum_topics')
    .select('id, title, slug, category, created_at')
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Community forum
          </h1>
          <p className="text-muted-foreground">Discuss APIs and share tips</p>
        </div>
        <NewTopicForm />
      </div>

      {(!topics || topics.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle>No topics yet</CardTitle>
            <CardDescription>Start a discussion.</CardDescription>
          </CardHeader>
          <CardContent>
            <NewTopicForm triggerLabel="New topic" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {(topics as { id: string; title: string; slug: string; category?: string | null }[]).map((t) => (
            <Link key={t.id} href={`/dashboard/forum/${t.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    {t.category && <span className="text-xs text-muted-foreground">{t.category}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
