'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RequestBuilder, ResponseViewer } from '@/components/features/sandbox/RequestBuilder';
import { Button } from '@/components/ui/button';
import { Share2, History, TestTube2 } from 'lucide-react';

export default function SandboxPage() {
  const searchParams = useSearchParams();
  const apiId = searchParams.get('api');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [initialRequest, setInitialRequest] = useState<{ url?: string; method?: string; subscriptionId?: string } | undefined>();

  useEffect(() => {
    if (!apiId) return;
    fetch(`/api/apis/${apiId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.api?.base_url) {
          setInitialRequest({ url: data.api.base_url, method: 'GET' });
        }
      })
      .catch(() => {});
  }, [apiId]);

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

      const responseData = data.status != null
        ? { status: data.status, data: data.body, headers: data.headers || {}, latency: data.latency ?? latency }
        : { status: res.status, data, headers: Object.fromEntries(res.headers.entries()), latency };

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube2 className="h-6 w-6" />
            API Testing Console
          </h1>
          <p className="text-muted-foreground">Test API endpoints with a powerful request builder</p>
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
          <h2 className="text-base font-semibold mb-2">Request</h2>
          <RequestBuilder onSend={handleSendRequest} isLoading={isLoading} initialRequest={initialRequest} />
        </div>

        {/* Response Viewer */}
        <div>
          <h2 className="text-base font-semibold mb-2">Response</h2>
          <ResponseViewer response={response} isLoading={isLoading} />
        </div>
      </div>

      {/* Request History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-2">Recent Requests</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="bg-card p-4 rounded-lg border hover:border-primary cursor-pointer transition"
                onClick={() => setResponse(item.response)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold">{item.request.method}</span>
                    <span className="text-sm text-muted-foreground">{item.request.url}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${item.response.status >= 200 && item.response.status < 300 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {item.response.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
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
  );
}
