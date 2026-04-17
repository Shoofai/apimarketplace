'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const INVESTOR_SID_KEY = 'investor_stakeholder_id';

function useInvestorSid() {
  const [sid, setSid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('sid');
    if (fromUrl) {
      try {
        sessionStorage.setItem(INVESTOR_SID_KEY, fromUrl);
      } catch {}
      setSid(fromUrl);
      return;
    }
    try {
      setSid(sessionStorage.getItem(INVESTOR_SID_KEY));
    } catch {
      setSid(null);
    }
  }, []);

  return sid;
}

interface TractionRow {
  metric_date: string;
  mrr: number;
  arr: number;
  total_signups: number;
  weekly_active_users: number;
  monthly_active_users: number;
  total_apis_listed: number;
  total_api_calls: number;
  total_providers: number;
  revenue_growth_pct: number | null;
  api_calls_growth_pct: number | null;
}

export default function TractionDashboard() {
  const sid = useInvestorSid();
  const [metrics, setMetrics] = useState<TractionRow | null>(null);

  const trackView = useCallback(() => {
    if (!sid) return;
    const supabase = createClient();
    supabase.functions
      .invoke('track-interaction', {
        body: {
          stakeholder_id: sid,
          interaction_type: 'traction_view',
          page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      })
      .catch(() => {});
  }, [sid]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('traction_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMetrics(data as TractionRow);
      });
    trackView();
  }, [trackView]);

  if (!metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  }

  const dataRoomHref = sid ? `/investors/data-room?sid=${sid}` : '/investors/data-room';
  const scheduleHref = sid ? `/investors/schedule?sid=${sid}` : '/investors/schedule';

  const cards = [
    { label: 'Monthly Recurring Revenue', value: `$${Number(metrics.mrr ?? 0).toLocaleString()}`, growth: metrics.revenue_growth_pct, icon: '💰' },
    { label: 'Annual Run Rate', value: `$${Number(metrics.arr ?? 0).toLocaleString()}`, growth: null, icon: '📈' },
    { label: 'Total Signups', value: Number(metrics.total_signups ?? 0).toLocaleString(), growth: null, icon: '👥' },
    { label: 'Weekly Active Users', value: Number(metrics.weekly_active_users ?? 0).toLocaleString(), growth: null, icon: '🔥' },
    { label: 'APIs Listed', value: Number(metrics.total_apis_listed ?? 0).toLocaleString(), growth: null, icon: '🔌' },
    { label: 'Total API Calls', value: Number(metrics.total_api_calls ?? 0).toLocaleString(), growth: metrics.api_calls_growth_pct, icon: '⚡' },
    { label: 'API Providers', value: Number(metrics.total_providers ?? 0).toLocaleString(), growth: null, icon: '🏢' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold">Live Traction Dashboard</h1>
          <p className="text-lg text-white/60">Real-time metrics from LukeAPI</p>
          <p className="mt-2 text-sm text-white/30">Updated daily · Last: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                {card.growth != null && (
                  <span className={`text-sm font-medium ${card.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {card.growth >= 0 ? '+' : ''}{card.growth}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="mt-1 text-sm text-white/40">{card.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-4 text-center">
          <Link href={dataRoomHref} className="inline-block rounded-xl bg-blue-600 px-8 py-4 font-medium text-white transition-colors hover:bg-blue-500">
            Access Full Data Room →
          </Link>
          <div>
            <Link href={scheduleHref} className="text-sm text-blue-400 hover:text-blue-300">
              Or schedule a call with the founder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
