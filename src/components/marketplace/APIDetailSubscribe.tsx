'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscribeModal, type PricingPlan } from './SubscribeModal';

interface APIDetailSubscribeProps {
  apiId: string;
  apiName: string;
  plans: PricingPlan[];
}

export function APIDetailSubscribe({ apiId, apiName, plans }: APIDetailSubscribeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedPlanId, setPreselectedPlanId] = useState<string | null>(null);

  const openModal = (planId?: string | null) => {
    setPreselectedPlanId(planId ?? null);
    setModalOpen(true);
  };

  return (
    <>
      <Button size="lg" onClick={() => openModal()} disabled={!plans?.length}>
        Subscribe
      </Button>

      <SubscribeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        apiId={apiId}
        apiName={apiName}
        plans={plans ?? []}
        defaultPlanId={preselectedPlanId}
      />
    </>
  );
}

export function ChoosePlanButton({
  apiId,
  apiName,
  plans,
  planId,
}: APIDetailSubscribeProps & { planId: string }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button className="w-full" onClick={() => setModalOpen(true)}>
        Choose Plan
      </Button>
      <SubscribeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        apiId={apiId}
        apiName={apiName}
        plans={plans ?? []}
        defaultPlanId={planId}
      />
    </>
  );
}
