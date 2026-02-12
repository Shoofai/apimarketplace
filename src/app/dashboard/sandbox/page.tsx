'use client';

import { useState } from 'react';
import { RequestBuilder, ResponseViewer } from '@/components/features/sandbox/RequestBuilder';
import { Button } from '@/components/ui/button';
import { Share2, History } from 'lucide-react';

export default function SandboxPage() {
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleSendRequest = async (request: any) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      const responseData = {
        status: res.status,
        data,
        headers: Object.fromEntries(res.headers.entries()),
        latency,
      };

      setResponse(responseData);
      setHistory([{ request, response: responseData, timestamp: new Date() }, ...history]);
    } catch (error: any) {
      setResponse({
        status: 0,
        data: { error: error.message },
        headers: {},
        latency: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Testing Console</h1>
            <p className="text-gray-600">Test API endpoints with a powerful request builder</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Builder */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Request</h2>
            <RequestBuilder onSend={handleSendRequest} isLoading={isLoading} />
          </div>

          {/* Response Viewer */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Response</h2>
            <ResponseViewer response={response} isLoading={isLoading} />
          </div>
        </div>

        {/* Request History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Recent Requests</h2>
            <div className="space-y-2">
              {history.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-lg border hover:border-blue-500 cursor-pointer transition"
                  onClick={() => setResponse(item.response)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">{item.request.method}</span>
                      <span className="text-sm text-gray-600">{item.request.url}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${item.response.status >= 200 && item.response.status < 300 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.response.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
