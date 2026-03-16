import { notFound } from 'next/navigation';
import { getFeatureFlag } from '@/lib/utils/feature-flags';

export default async function WorkflowsLayout({ children }: { children: React.ReactNode }) {
  const workflowsEnabled = await getFeatureFlag('workflows');
  if (!workflowsEnabled) {
    notFound();
  }
  return <>{children}</>;
}
