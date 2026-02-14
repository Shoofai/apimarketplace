'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

export function OnboardingChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 'subscribe', label: 'Subscribe to your first API', href: '/marketplace', done: false },
    { id: 'sandbox', label: 'Test an API in Sandbox', href: '/dashboard/sandbox', done: false },
    { id: 'ai', label: 'Generate code with AI', href: '/dashboard/playground', done: false },
    { id: 'team', label: 'Invite a team member', href: '/dashboard/settings/team', done: false },
  ]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/user/onboarding/checklist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items?.length) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  const allDone = items.length > 0 && items.every((i) => i.done);
  if (dismissed || allDone) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Get started</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            Dismiss
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent"
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={item.done ? 'text-muted-foreground line-through' : ''}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
