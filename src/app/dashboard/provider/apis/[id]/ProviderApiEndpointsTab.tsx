import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EndpointRow {
  id: string;
  method: string;
  path: string;
  summary: string | null;
}

interface ProviderApiEndpointsTabProps {
  endpoints: EndpointRow[];
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-700 dark:text-green-400',
  POST: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  PUT: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  PATCH: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

export function ProviderApiEndpointsTab({ endpoints }: ProviderApiEndpointsTabProps) {
  if (endpoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            All available endpoints from OpenAPI specification
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          No endpoints recorded yet. Endpoints are populated from your OpenAPI spec when you publish or sync the API.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints</CardTitle>
        <CardDescription>
          {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} from your specification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium w-24">Method</th>
                <th className="p-3 font-medium">Path</th>
                <th className="p-3 font-medium text-muted-foreground">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {endpoints.map((e) => (
                <tr key={e.id}>
                  <td className="p-3">
                    <Badge variant="secondary" className={METHOD_COLORS[e.method] ?? ''}>
                      {e.method}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono">{e.path}</td>
                  <td className="p-3 text-muted-foreground">{e.summary ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
