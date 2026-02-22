'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface FeatureFlagRowProps {
  flag: {
    id: string;
    name: string;
    description: string | null;
    enabled_globally: boolean;
  };
}

export function FeatureFlagRow({ flag }: FeatureFlagRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle(checked: boolean) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/feature-flags/${encodeURIComponent(flag.name)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_enabled: checked }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('Feature flag update failed:', data.error ?? res.statusText);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor={flag.name} className="text-base font-medium">
            {flag.name}
          </Label>
          <Badge variant={flag.enabled_globally ? 'default' : 'secondary'}>
            {flag.enabled_globally ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {flag.description ?? ''}
        </p>
      </div>
      <div className="ml-4">
        <Switch
          id={flag.name}
          defaultChecked={flag.enabled_globally}
          disabled={loading}
          onCheckedChange={handleToggle}
        />
      </div>
    </div>
  );
}
