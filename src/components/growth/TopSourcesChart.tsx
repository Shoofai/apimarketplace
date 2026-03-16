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

export type TopSourceRow = {
  source: string;
  total_captured: number;
  total_converted: number;
  conversion_rate: number | null;
};

interface Props {
  data: TopSourceRow[];
}

export default function TopSourcesChart({ data }: Props) {
  const labels = data.map(r => r.source);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Captured',
        data: data.map(r => r.total_captured),
        backgroundColor: 'rgba(96,165,250,0.8)',
        borderRadius: 4,
      },
      {
        label: 'Converted',
        data: data.map(r => r.total_converted),
        backgroundColor: 'rgba(34,197,94,0.8)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No source attribution data yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Bar data={chartData} options={options} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.map(row => (
          <div
            key={row.source}
            className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
          >
            <span className="truncate font-medium capitalize mr-2">{row.source}</span>
            <span className="text-muted-foreground tabular-nums shrink-0">
              {row.conversion_rate != null
                ? `${Math.round(row.conversion_rate * 100) / 100}%`
                : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
