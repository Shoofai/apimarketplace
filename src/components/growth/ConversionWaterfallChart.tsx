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
import type { FunnelSnapshotRow } from './FunnelSnapshotChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: FunnelSnapshotRow[];
}

const WATERFALL_STAGES = [
  'captured', 'segmented', 'activated', 'engaged',
  'qualified', 'converting', 'converted',
];

export default function ConversionWaterfallChart({ data }: Props) {
  // Sum counts per stage across all stakeholder types
  const stageTotals: Record<string, number> = {};
  for (const row of data) {
    stageTotals[row.stage] = (stageTotals[row.stage] ?? 0) + row.count;
  }

  const capturedTotal = stageTotals['captured'] ?? 0;

  const percentages = WATERFALL_STAGES.map(stage =>
    capturedTotal > 0 ? Math.round(((stageTotals[stage] ?? 0) / capturedTotal) * 100) : 0
  );

  // Gradient-like colors from neutral → green, falling to red if low
  const backgroundColors = percentages.map(pct => {
    if (pct >= 80) return 'rgba(148,163,184,0.8)';
    if (pct >= 60) return 'rgba(96,165,250,0.8)';
    if (pct >= 40) return 'rgba(167,139,250,0.8)';
    if (pct >= 20) return 'rgba(251,191,36,0.8)';
    if (pct >= 10) return 'rgba(251,146,60,0.8)';
    return 'rgba(34,197,94,0.85)'; // converted — show green even if small
  });
  // Last bar (converted) always green
  backgroundColors[backgroundColors.length - 1] = 'rgba(34,197,94,0.85)';

  const chartData = {
    labels: WATERFALL_STAGES.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        label: '% of captured',
        data: percentages,
        backgroundColor: backgroundColors,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y?: number | null } }) => `${ctx.parsed?.y ?? 0}% of captured`,
        },
      },
    },
    scales: {
      y: {
        max: 100,
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  if (capturedTotal === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No captured stakeholders yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Bar data={chartData} options={options} />
      <p className="text-xs text-center text-muted-foreground">
        Each bar shows what % of all captured stakeholders reached that stage
      </p>
    </div>
  );
}
