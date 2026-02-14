'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ResourceType = 'forum_post' | 'api_review' | 'forum_topic';

interface ReportButtonProps {
  resourceType: ResourceType;
  resourceId: string;
  variant?: 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const REPORT_REASONS = [
  'Spam or advertising',
  'Harassment or hate speech',
  'Off-topic',
  'Inappropriate content',
  'Other',
];

export function ReportButton({ resourceType, resourceId, variant = 'ghost', size = 'sm', className }: ReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [reported, setReported] = useState(false);

  async function submitReport(reason: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_type: resourceType, resource_id: resourceId, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to submit report');
      setReported(true);
    } catch {
      // Could add toast
    } finally {
      setLoading(false);
    }
  }

  if (reported) {
    return (
      <span className="text-xs text-muted-foreground">Report submitted</span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Flag className="h-3 w-3" />}
          <span className="sr-only">Report</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {REPORT_REASONS.map((reason) => (
          <DropdownMenuItem key={reason} onSelect={() => submitReport(reason)}>
            {reason}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
