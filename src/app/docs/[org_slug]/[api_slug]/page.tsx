import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { parseOpenApiSpec } from '@/lib/utils/openapi-parser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, Code, ExternalLink } from 'lucide-react';

interface DocsPageProps {
  params: Promise<{ org_slug: string; api_slug: string }>;
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { api_slug } = await params;
  const supabase = await createClient();
  const { data: api } = await supabase
    .from('apis')
    .select('name')
    .eq('slug', api_slug)
    .single();

  return {
    title: api ? `${api.name} - API Documentation` : 'API Documentation',
  };
}

export default async function APIDocsPage({ params }: DocsPageProps) {
  const { org_slug, api_slug } = await params;
  const supabase = await createClient();

  // Fetch API with OpenAPI spec from api_specs
  const { data: api, error } = await supabase
    .from('apis')
    .select(
      `
      *,
      organization:organizations!apis_organization_id_fkey(name, slug),
      endpoints:api_endpoints(*),
      api_specs(openapi_spec, openapi_raw, openapi_spec_format)
    `
    )
    .eq('slug', api_slug)
    .eq('status', 'published')
    .single();

  const specRow = api?.api_specs as { openapi_spec?: unknown; openapi_raw?: string; openapi_spec_format?: string } | null;
  if (error || !api || !specRow?.openapi_spec) {
    notFound();
  }
  const rawSpec = specRow.openapi_spec;
  if (typeof rawSpec !== 'string') {
    notFound();
  }

  // Parse OpenAPI spec
  const spec = await parseOpenApiSpec(
    rawSpec,
    (specRow.openapi_spec_format || 'json') as 'yaml' | 'json'
  );

  // Group endpoints by tag
  const endpointsByTag = spec.endpoints.reduce((acc: any, endpoint: any) => {
    const tag = endpoint.tags?.[0] || 'General';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(endpoint);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Book className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold">{spec.info.title}</h1>
                <Badge>{spec.info.version}</Badge>
              </div>
              <p className="text-gray-600">{spec.info.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="text-gray-600">
                  By <strong>{api.organization.name}</strong>
                </span>
                <span className="text-gray-400">•</span>
                <a
                  href={`/marketplace/${org_slug}/${api_slug}`}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View in Marketplace
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <Button asChild>
              <a href={`/marketplace/${org_slug}/${api_slug}`}>
                Subscribe to API
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <aside className="col-span-3">
            <Card className="p-4 sticky top-8">
              <nav className="space-y-1">
                <a
                  href="#getting-started"
                  className="block px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700"
                >
                  Getting Started
                </a>
                <a
                  href="#authentication"
                  className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Authentication
                </a>
                {Object.keys(endpointsByTag).map((tag) => (
                  <a
                    key={tag}
                    href={`#${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {tag}
                  </a>
                ))}
                <a
                  href="#error-codes"
                  className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Error Codes
                </a>
                <a
                  href="#rate-limits"
                  className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Rate Limits
                </a>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="col-span-9 space-y-8">
            {/* Getting Started */}
            <section id="getting-started">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Welcome to the {spec.info.title} documentation. This API provides access to{' '}
                    {spec.info.description?.toLowerCase()}.
                  </p>
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <code className="block bg-gray-100 p-3 rounded mb-4 text-sm">
                    {spec.info.baseUrl}
                  </code>
                  <h3 className="text-lg font-semibold mb-2">Quick Example</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
{`curl -X GET "${spec.info.baseUrl}${spec.endpoints[0]?.path || '/example'}" \\
  -H "X-API-Key: YOUR_API_KEY"`}
                  </pre>
                </div>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                <p className="text-gray-700 mb-4">
                  This API uses API Key authentication. Include your API key in the request header:
                </p>
                <code className="block bg-gray-100 p-3 rounded text-sm">
                  X-API-Key: your_api_key_here
                </code>
                <p className="text-sm text-gray-600 mt-4">
                  You can obtain your API key from the{' '}
                  <a
                    href="/dashboard"
                    className="text-blue-600 hover:underline"
                  >
                    dashboard
                  </a>{' '}
                  after subscribing to this API.
                </p>
              </Card>
            </section>

            {/* Endpoints by Tag */}
            {Object.entries(endpointsByTag).map(([tag, endpoints]: [string, any]) => (
              <section key={tag} id={tag.toLowerCase().replace(/\s+/g, '-')}>
                <h2 className="text-2xl font-bold mb-4">{tag}</h2>
                <div className="space-y-4">
                  {endpoints.map((endpoint: any) => (
                    <Card key={`${endpoint.method}-${endpoint.path}`} className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Badge
                          variant={
                            endpoint.method === 'GET'
                              ? 'default'
                              : endpoint.method === 'POST'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="font-mono"
                        >
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1">
                          <code className="text-lg font-mono">{endpoint.path}</code>
                          <p className="text-gray-600 mt-1">
                            {endpoint.summary || endpoint.description}
                          </p>
                        </div>
                      </div>

                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Parameters</h4>
                          <table className="w-full text-sm">
                            <thead className="border-b">
                              <tr className="text-left">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2">In</th>
                                <th className="pb-2">Required</th>
                                <th className="pb-2">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {endpoint.parameters.map((param: any) => (
                                <tr key={param.name}>
                                  <td className="py-2 font-mono">{param.name}</td>
                                  <td className="py-2">{param.schema?.type || param.type}</td>
                                  <td className="py-2">{param.in}</td>
                                  <td className="py-2">
                                    {param.required ? (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-500">Optional</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-gray-600">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Example Request */}
                      <Tabs defaultValue="curl" className="mt-4">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`curl -X ${endpoint.method} "${spec.info.baseUrl}${endpoint.path}" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                          </pre>
                        </TabsContent>
                        <TabsContent value="javascript">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`const response = await fetch('${spec.info.baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`}
                          </pre>
                        </TabsContent>
                        <TabsContent value="python">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import requests

response = requests.${endpoint.method.toLowerCase()}(
    '${spec.info.baseUrl}${endpoint.path}',
    headers={'X-API-Key': 'YOUR_API_KEY'}
)
data = response.json()`}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </Card>
                  ))}
                </div>
              </section>
            ))}

            {/* Error Codes */}
            <section id="error-codes">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Error Codes</h2>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 font-mono">400</td>
                      <td className="py-3">Bad Request - Invalid parameters</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono">401</td>
                      <td className="py-3">Unauthorized - Invalid API key</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono">403</td>
                      <td className="py-3">Forbidden - Insufficient permissions</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono">404</td>
                      <td className="py-3">Not Found - Resource doesn&apos;t exist</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono">429</td>
                      <td className="py-3">Too Many Requests - Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-mono">500</td>
                      <td className="py-3">Internal Server Error - Something went wrong</td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
                <p className="text-gray-700 mb-4">
                  Rate limits vary by subscription plan. Check your current usage in the dashboard.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Free</h4>
                    <p className="text-2xl font-bold">1,000</p>
                    <p className="text-sm text-gray-600">requests/month</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Pro</h4>
                    <p className="text-2xl font-bold">100,000</p>
                    <p className="text-sm text-gray-600">requests/month</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Enterprise</h4>
                    <p className="text-2xl font-bold">Unlimited</p>
                    <p className="text-sm text-gray-600">Custom limits</p>
                  </div>
                </div>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
