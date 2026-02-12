'use client';

import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change)}% vs last period</span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface UsageDashboardProps {
  subscriptionId: string;
}

export function UsageDashboard({ subscriptionId }: UsageDashboardProps) {
  // Mock data - replace with actual API calls
  const apiCallsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'API Calls',
        data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const statusCodeData = {
    labels: ['2xx Success', '4xx Client Error', '5xx Server Error'],
    datasets: [
      {
        data: [8500, 450, 50],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const latencyData = {
    labels: ['0-100ms', '100-200ms', '200-300ms', '300-500ms', '500ms+'],
    datasets: [
      {
        label: 'Request Count',
        data: [3200, 4100, 1800, 700, 200],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const endpointData = {
    labels: ['/users', '/posts', '/comments', '/auth/login', '/profile'],
    datasets: [
      {
        label: 'Requests',
        data: [3200, 2800, 1900, 1200, 900],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total API Calls"
          value="12,543"
          change={12.5}
          icon={<Activity className="w-6 h-6 text-blue-600" />}
        />
        <MetricCard
          title="Success Rate"
          value="94.5%"
          change={2.3}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <MetricCard
          title="Avg Latency"
          value="142ms"
          change={-5.2}
          icon={<Activity className="w-6 h-6 text-purple-600" />}
        />
        <MetricCard
          title="Monthly Cost"
          value="$47.85"
          change={8.1}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* API Calls Over Time */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Calls (Last 7 Days)</h3>
        <div className="h-80">
          <Line data={apiCallsData} options={chartOptions} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Code Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Code Distribution</h3>
          <div className="h-64">
            <Doughnut data={statusCodeData} options={chartOptions} />
          </div>
        </Card>

        {/* Latency Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latency Distribution</h3>
          <div className="h-64">
            <Bar data={latencyData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Top Endpoints */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Endpoints</h3>
        <div className="h-80">
          <Bar data={endpointData} options={{...chartOptions, indexAxis: 'y' as const}} />
        </div>
      </Card>

      {/* Usage Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Usage</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3">Endpoint</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Calls</th>
                <th className="pb-3">Avg Latency</th>
                <th className="pb-3">Success Rate</th>
                <th className="pb-3">Last Called</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { endpoint: '/users', method: 'GET', calls: 3200, latency: 125, success: 98.2, last: '2 min ago' },
                { endpoint: '/posts', method: 'GET', calls: 2800, latency: 156, success: 95.1, last: '5 min ago' },
                { endpoint: '/comments', method: 'POST', calls: 1900, latency: 201, success: 92.8, last: '12 min ago' },
                { endpoint: '/auth/login', method: 'POST', calls: 1200, latency: 89, success: 96.5, last: '1 min ago' },
                { endpoint: '/profile', method: 'GET', calls: 900, latency: 142, success: 97.1, last: '7 min ago' },
              ].map((row, i) => (
                <tr key={i} className="text-sm">
                  <td className="py-3 font-mono">{row.endpoint}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {row.method}
                    </span>
                  </td>
                  <td className="py-3">{row.calls.toLocaleString()}</td>
                  <td className="py-3">{row.latency}ms</td>
                  <td className="py-3">
                    <span className={`${row.success >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {row.success}%
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{row.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
