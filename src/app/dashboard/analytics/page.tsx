'use client';

import { useState } from 'react';
import { UsageDashboard } from '@/components/features/usage/UsageDashboard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, RefreshCw } from 'lucide-react';

export default function DeveloperAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedApi, setSelectedApi] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Developer Analytics</h1>
            <p className="text-gray-600">Monitor your API usage, performance, and costs</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedApi} onValueChange={setSelectedApi}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All APIs</SelectItem>
                <SelectItem value="api1">Weather API</SelectItem>
                <SelectItem value="api2">Payment API</SelectItem>
                <SelectItem value="api3">Maps API</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Dashboard */}
        <UsageDashboard subscriptionId="mock-sub-id" />
      </div>
    </div>
  );
}
