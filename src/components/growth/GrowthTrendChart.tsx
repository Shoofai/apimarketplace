'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export type DailyMetricRow = {
  metric_date: string;
  stakeholder_type: string;
  captured_count: number;
  converted_count: number;
  overall_conversion_pct: number | null;
};

interface Props {
  data: DailyMetricRow[];
}

const TYPE_COLORS: Record<string, string> = {
  developer:      'rgb(59,130,246)',
  api_provider:   'rgb(168,85,247)',
  enterprise_buyer: 'rgb(234,179,8)',
  investor:       'rgb(249,115,22)',
};

const TYPE_LABELS: Record<string, string> = {
  developer:       'Developer',
  api_provider:    'API Provider',
  enterprise_buyer:'Enterprise',
  investor:        'Investor',
};

export default function GrowthTrendChart({ data }: Props) {
  // Unique sorted dates
  const dates = [...new Set(data.map(r => r.metric_date))].sort();
  const labels = dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  // One dataset per stakeholder type (captures)
  const types = [...new Set(data.map(r => r.stakeholder_type))];
  const captureDatasets = types.map(type => {
    const color = TYPE_COLORS[type] ?? 'rgb(148,163,184)';
    const counts = dates.map(date => {
      const row = data.find(r => r.metric_date === date && r.stakeholder_type === type);
      return row?.captured_count ?? 0;
    });
    return {
      label: `${TYPE_LABELS[type] ?? type} captures`,
      data: counts,
      borderColor: color,
      backgroundColor: color.replace('rgb', 'rgba').replace(')', ',0.08)'),
      tension: 0.3,
      fill: false,
      pointRadius: 3,
    };
  });

  // Aggregate conversions line
  const conversionCounts = dates.map(date => {
    return data
      .filter(r => r.metric_date === date)
      .reduce((s, r) => s + r.converted_count, 0);
  });
  const conversionDataset = {
    label: 'Total conversions',
    data: conversionCounts,
    borderColor: 'rgb(34,197,94)',
    backgroundColor: 'rgba(34,197,94,0.08)',
    tension: 0.3,
    fill: false,
    pointRadius: 4,
    borderDash: [4, 4] as number[],
  };

  const chartData = {
    labels,
    datasets: [...captureDatasets, conversionDataset],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No daily metrics yet — the aggregation cron runs daily at 5 AM UTC.
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
