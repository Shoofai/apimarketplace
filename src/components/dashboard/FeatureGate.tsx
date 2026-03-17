import Link from 'next/link';
import { Lock, Zap, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PLAN_ORDER = ['free', 'pro', 'enterprise'] as const;
type Plan = (typeof PLAN_ORDER)[number];

function meetsRequirement(current: string, required: Plan): boolean {
  const currentIdx = PLAN_ORDER.indexOf(current as Plan);
  const requiredIdx = PLAN_ORDER.indexOf(required);
  if (currentIdx === -1) return false;
  return currentIdx >= requiredIdx;
}

const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_ICONS: Record<Plan, React.ElementType> = {
  free: Lock,
  pro: Zap,
  enterprise: Building2,
};

interface FeatureGateProps {
  requiredPlan: Plan;
  currentPlan: string;
  featureName: string;
  description?: string;
  children: React.ReactNode;
}

export function FeatureGate({
  requiredPlan,
  currentPlan,
  featureName,
  description,
  children,
}: FeatureGateProps) {
  if (meetsRequirement(currentPlan, requiredPlan)) {
    return <>{children}</>;
  }

  const PlanIcon = PLAN_ICONS[requiredPlan] ?? Lock;
  const planLabel = PLAN_LABELS[requiredPlan] ?? requiredPlan;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PlanIcon className="h-8 w-8 text-primary" />
          </div>
          <Badge variant="secondary" className="mx-auto mb-2 w-fit">
            {planLabel} Feature
          </Badge>
          <CardTitle className="text-xl">{featureName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description ??
              `${featureName} is available on the ${planLabel} plan. Upgrade to unlock this feature and more.`}
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard/settings/billing">
              Upgrade to {planLabel}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link href="/marketplace">Explore APIs instead</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
