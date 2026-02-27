import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileJson } from 'lucide-react';
import { ImportClient } from './ImportClient';

export const metadata = { title: 'Import Collection | Dashboard' };

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileJson className="h-6 w-6" />
          Import API Collection
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload a Postman, Insomnia, or Bruno collection. We&apos;ll automatically match the APIs you&apos;re already using to their marketplace listings.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
