'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, Activity, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function ProviderAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedApi, setSelectedApi] = useState('all');

  // Mock data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12400, 15600, 18200, 21500, 24800, 28300],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const subscribersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Active Subscribers',
        data: [124, 156, 189, 215, 248, 283],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const planDistribution = {
    labels: ['Free', 'Starter', 'Pro', 'Enterprise'],
    datasets: [
      {
        data: [45, 120, 95, 23],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  const endpointPerformance = {
    labels: ['/weather/forecast', '/weather/current', '/weather/history', '/weather/alerts', '/weather/map'],
    datasets: [
      {
        label: 'Avg Latency (ms)',
        data: [125, 98, 156, 110, 178],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
      },
      {
        label: 'Success Rate (%)',
        data: [99.2, 99.8, 98.5, 99.5, 97.8],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Analytics</h1>
            <p className="text-gray-600">Monitor your API performance and revenue</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedApi} onValueChange={setSelectedApi}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All APIs</SelectItem>
                <SelectItem value="weather">Weather API</SelectItem>
                <SelectItem value="maps">Maps API</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold">$28,342</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>14.2% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Subscribers</p>
                <p className="text-3xl font-bold">283</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>14% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total API Calls</p>
                <p className="text-3xl font-bold">1.2M</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>8.5% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                <p className="text-3xl font-bold">4.8</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(142 reviews)</span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Subscriber Growth */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>
            <div className="h-64">
              <Bar data={subscribersData} options={chartOptions} />
            </div>
          </Card>

          {/* Plan Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
            <div className="h-64">
              <Doughnut data={planDistribution} options={chartOptions} />
            </div>
          </Card>
        </div>

        {/* Endpoint Performance */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Endpoint Performance</h3>
          <div className="h-80">
            <Bar data={endpointPerformance} options={chartOptions} />
          </div>
        </Card>

        {/* Top Subscribers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Subscribers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">API Calls (30d)</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { org: 'Acme Corp', plan: 'Enterprise', calls: 245000, revenue: 2499, status: 'active', since: 'Jan 2026' },
                  { org: 'TechStart Inc', plan: 'Pro', calls: 98000, revenue: 499, status: 'active', since: 'Feb 2026' },
                  { org: 'DevTeam LLC', plan: 'Pro', calls: 87000, revenue: 499, status: 'active', since: 'Dec 2025' },
                  { org: 'Cloud Systems', plan: 'Starter', calls: 45000, revenue: 99, status: 'active', since: 'Mar 2026' },
                  { org: 'Data Solutions', plan: 'Enterprise', calls: 198000, revenue: 2499, status: 'active', since: 'Nov 2025' },
                ].map((row, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-3 font-medium">{row.org}</td>
                    <td className="py-3">
                      <Badge variant={row.plan === 'Enterprise' ? 'default' : 'secondary'}>
                        {row.plan}
                      </Badge>
                    </td>
                    <td className="py-3">{row.calls.toLocaleString()}</td>
                    <td className="py-3 font-semibold">${row.revenue}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{row.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
