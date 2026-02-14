'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface RemoveFromCollectionButtonProps {
  collectionId: string;
  apiId: string;
}

export function RemoveFromCollectionButton({ collectionId, apiId }: RemoveFromCollectionButtonProps) {
  const router = useRouter();

  async function remove() {
    const res = await fetch(`/api/collections/${collectionId}/apis?api_id=${encodeURIComponent(apiId)}`, {
      method: 'DELETE',
    });
    if (res.ok) router.refresh();
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={remove}>
      Remove
    </Button>
  );
}
