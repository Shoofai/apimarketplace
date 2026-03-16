'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type FunnelSnapshotRow = {
  stakeholder_type: string;
  stage: string;
  count: number;
  avg_engagement_score: number | null;
};

interface Props {
  data: FunnelSnapshotRow[];
}

const STAGE_ORDER = [
  'captured', 'segmented', 'activated', 'engaged',
  'qualified', 'converting', 'converted', 'churned',
];

const STAGE_COLORS: Record<string, string> = {
  captured:   'rgba(148,163,184,0.8)',
  segmented:  'rgba(96,165,250,0.8)',
  activated:  'rgba(129,140,248,0.8)',
  engaged:    'rgba(167,139,250,0.8)',
  qualified:  'rgba(251,191,36,0.8)',
  converting: 'rgba(251,146,60,0.8)',
  converted:  'rgba(34,197,94,0.8)',
  churned:    'rgba(239,68,68,0.8)',
};

const TYPE_LABELS: Record<string, string> = {
  developer:        'Developer',
  api_provider:     'API Provider',
  enterprise_buyer: 'Enterprise',
  investor:         'Investor',
};

export default function FunnelSnapshotChart({ data }: Props) {
  const types = [...new Set(data.map(r => r.stakeholder_type))];
  const labels = types.map(t => TYPE_LABELS[t] ?? t);

  const presentStages = STAGE_ORDER.filter(s => data.some(r => r.stage === s));

  const datasets = presentStages.map(stage => ({
    label: stage.charAt(0).toUpperCase() + stage.slice(1),
    data: types.map(type => {
      const row = data.find(r => r.stakeholder_type === type && r.stage === stage);
      return row?.count ?? 0;
    }),
    backgroundColor: STAGE_COLORS[stage] ?? 'rgba(148,163,184,0.8)',
    stack: 'stack',
  }));

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No funnel data yet.
      </div>
    );
  }

  return <Bar data={chartData} options={options} />;
}
