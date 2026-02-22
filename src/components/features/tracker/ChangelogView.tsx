'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CheckCircle2, ListTodo } from 'lucide-react';

interface Sprint {
  id: string;
  sprint_number: number;
  name: string;
  phase: string;
  status: string;
  completed_at?: string;
  tasks: { id: string; title: string; is_completed: boolean }[];
  deliverables: { id: string; name: string; title?: string; is_completed: boolean }[];
}

export function ChangelogView() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/tracker/sprints')
      .then((res) => res.json())
      .then((data) => setSprints(data.sprints ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Newest first for changelog
  const ordered = [...sprints].sort((a, b) => b.sprint_number - a.sprint_number);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Completed sprints and their deliverables, newest first. Source: implementation tracker.
      </p>
      <div className="space-y-6">
        {ordered.map((sprint) => (
          <Card key={sprint.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-lg">
                  Sprint {sprint.sprint_number}: {sprint.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  {sprint.completed_at && (
                    <time dateTime={sprint.completed_at}>
                      {format(new Date(sprint.completed_at), 'PPP')}
                    </time>
                  )}
                  <span className="capitalize">({sprint.status})</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{sprint.phase}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sprint.deliverables && sprint.deliverables.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Deliverables
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {sprint.deliverables.map((d) => (
                      <li key={d.id}>
                        {d.name || d.title}
                        {d.is_completed && (
                          <span className="ml-1 text-green-600 dark:text-green-400" aria-hidden>✓</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {sprint.tasks && sprint.tasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ListTodo className="h-4 w-4" />
                    Tasks
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {sprint.tasks.map((t) => (
                      <li key={t.id}>
                        {t.title}
                        {t.is_completed && (
                          <span className="ml-1 text-green-600 dark:text-green-400" aria-hidden>✓</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
