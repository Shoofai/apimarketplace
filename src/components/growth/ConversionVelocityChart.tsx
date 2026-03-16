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

export type VelocityRow = {
  from_stage: string;
  to_stage: string;
  avg_hours: number | null;
  transition_count: number;
};

interface Props {
  data: VelocityRow[];
}

function hoursLabel(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export default function ConversionVelocityChart({ data }: Props) {
  const labels = data.map(r => `${r.from_stage} → ${r.to_stage}`);
  const values = data.map(r => r.avg_hours ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Avg hours',
        data: values,
        backgroundColor: 'rgba(96,165,250,0.75)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { x?: number | null }; dataIndex: number }) => {
            const hours = ctx.parsed?.x ?? 0;
            const row = data[ctx.dataIndex];
            return `${hoursLabel(hours)} avg · ${row.transition_count} transitions`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => hoursLabel(Number(value)),
        },
      },
      y: {
        ticks: { font: { size: 11 } },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No transition data yet.
      </div>
    );
  }

  return (
    <div style={{ height: `${Math.max(200, data.length * 36)}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
