'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, Save, Share2, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface RequestBuilderProps {
  onSend: (request: any) => void;
  isLoading?: boolean;
}

export function RequestBuilder({ onSend, isLoading }: RequestBuilderProps) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: 'Content-Type', value: 'application/json' },
  ]);
  const [params, setParams] = useState<Array<{ key: string; value: string }>>([]);
  const [body, setBody] = useState('');
  const [auth, setAuth] = useState({ type: 'none', value: '' });

  const handleSend = () => {
    const request = {
      method,
      url: buildUrl(),
      headers: headersToObject(),
      body: method !== 'GET' && body ? JSON.parse(body) : undefined,
    };
    onSend(request);
  };

  const buildUrl = () => {
    if (params.length === 0 || !params[0].key) return url;
    const queryString = params
      .filter(p => p.key)
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return `${url}?${queryString}`;
  };

  const headersToObject = () => {
    const obj: Record<string, string> = {};
    headers.filter(h => h.key).forEach(h => {
      obj[h.key] = h.value;
    });
    if (auth.type === 'bearer' && auth.value) {
      obj['Authorization'] = `Bearer ${auth.value}`;
    } else if (auth.type === 'api-key' && auth.value) {
      obj['X-API-Key'] = auth.value;
    }
    return obj;
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const addParam = () => setParams([...params, { key: '', value: '' }]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Method and URL */}
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="HEAD">HEAD</SelectItem>
              <SelectItem value="OPTIONS">OPTIONS</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="https://api.example.com/endpoint"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !url}>
            <Play className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>

        {/* Tabs for params, headers, body, auth */}
        <Tabs defaultValue="params">
          <TabsList>
            <TabsTrigger value="params">
              Params {params.filter(p => p.key).length > 0 && `(${params.filter(p => p.key).length})`}
            </TabsTrigger>
            <TabsTrigger value="headers">
              Headers {headers.filter(h => h.key).length > 0 && `(${headers.filter(h => h.key).length})`}
            </TabsTrigger>
            {method !== 'GET' && <TabsTrigger value="body">Body</TabsTrigger>}
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </TabsList>

          {/* Params Tab */}
          <TabsContent value="params" className="space-y-3">
            {params.map((param, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => {
                    const newParams = [...params];
                    newParams[i].key = e.target.value;
                    setParams(newParams);
                  }}
                />
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => {
                    const newParams = [...params];
                    newParams[i].value = e.target.value;
                    setParams(newParams);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParams(params.filter((_, idx) => idx !== i))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addParam}>
              Add Parameter
            </Button>
          </TabsContent>

          {/* Headers Tab */}
          <TabsContent value="headers" className="space-y-3">
            {headers.map((header, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Header Name"
                  value={header.key}
                  onChange={(e) => {
                    const newHeaders = [...headers];
                    newHeaders[i].key = e.target.value;
                    setHeaders(newHeaders);
                  }}
                />
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => {
                    const newHeaders = [...headers];
                    newHeaders[i].value = e.target.value;
                    setHeaders(newHeaders);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHeaders(headers.filter((_, idx) => idx !== i))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addHeader}>
              Add Header
            </Button>
          </TabsContent>

          {/* Body Tab */}
          {method !== 'GET' && (
            <TabsContent value="body">
              <Textarea
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-mono min-h-[200px]"
              />
            </TabsContent>
          )}

          {/* Auth Tab */}
          <TabsContent value="auth" className="space-y-4">
            <div>
              <Label>Auth Type</Label>
              <Select value={auth.type} onValueChange={(type) => setAuth({ ...auth, type })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api-key">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {auth.type !== 'none' && (
              <div>
                <Label>{auth.type === 'bearer' ? 'Token' : 'API Key'}</Label>
                <Input
                  type="password"
                  placeholder={auth.type === 'bearer' ? 'Enter token' : 'Enter API key'}
                  value={auth.value}
                  onChange={(e) => setAuth({ ...auth, value: e.target.value })}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

interface ResponseViewerProps {
  response: any;
  isLoading?: boolean;
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState('body');

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Send a request to see the response</p>
        </div>
      </Card>
    );
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Status and timing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}
            >
              {response.status}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {response.latency}ms
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyResponse}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Response tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">
              Headers ({Object.keys(response.headers || {}).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="body">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </TabsContent>

          <TabsContent value="headers">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">{key}:</span>
                  <span className="text-gray-600">{value as string}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
