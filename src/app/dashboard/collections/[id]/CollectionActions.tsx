'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Globe, Lock } from 'lucide-react';

interface CollectionActionsProps {
  collectionId: string;
  name: string;
  isPublic: boolean;
}

export function CollectionActions({ collectionId, name, isPublic }: CollectionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublic() {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !isPublic }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteCollection() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard/collections');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={togglePublic}>
          {isPublic ? <Lock className="w-4 h-4 mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
          {isPublic ? 'Make private' : 'Make public'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deleteCollection} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete collection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
