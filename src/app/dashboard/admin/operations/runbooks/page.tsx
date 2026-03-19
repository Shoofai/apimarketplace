'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, ChevronRight, AlertTriangle, Database, CreditCard, HardDrive, Activity, RotateCcw, Network } from 'lucide-react';
import Link from 'next/link';

interface Runbook {
  name: string;
  title: string;
}

interface RunbookDetail {
  title: string;
  content: string;
}

const RUNBOOK_ICONS: Record<string, React.ReactNode> = {
  'database-failover': <Database className="h-5 w-5 text-red-500" />,
  'stripe-unavailable': <CreditCard className="h-5 w-5 text-purple-500" />,
  'redis-down': <HardDrive className="h-5 w-5 text-orange-500" />,
  'high-error-rate': <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  'deployment-rollback': <RotateCcw className="h-5 w-5 text-blue-500" />,
  'kong-gateway-failure': <Network className="h-5 w-5 text-green-500" />,
};

const SEVERITY_MAP: Record<string, string> = {
  'database-failover': 'SEV-1',
  'stripe-unavailable': 'SEV-2',
  'redis-down': 'SEV-3',
  'high-error-rate': 'SEV-1',
  'deployment-rollback': 'SEV-1',
  'kong-gateway-failure': 'SEV-2',
};

const SEVERITY_COLORS: Record<string, string> = {
  'SEV-1': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'SEV-2': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'SEV-3': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [selected, setSelected] = useState<RunbookDetail | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/runbooks')
      .then((r) => r.json())
      .then((data) => {
        setRunbooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function selectRunbook(name: string) {
    setSelectedName(name);
    const res = await fetch(`/api/admin/runbooks?name=${name}`);
    const data = await res.json();
    setSelected(data);
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/operations">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Operations
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Incident Runbooks
        </h1>
        <p className="text-muted-foreground">
          Step-by-step procedures for responding to production incidents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runbook List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading runbooks...</p>
          ) : (
            runbooks.map((rb) => {
              const severity = SEVERITY_MAP[rb.name];
              return (
                <button
                  key={rb.name}
                  onClick={() => selectRunbook(rb.name)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedName === rb.name
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {RUNBOOK_ICONS[rb.name] || <Activity className="h-5 w-5" />}
                      <div>
                        <p className="font-medium text-sm">{rb.title}</p>
                        {severity && (
                          <Badge className={`mt-1 text-xs ${SEVERITY_COLORS[severity] || ''}`}>
                            {severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Runbook Content */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selectedName && RUNBOOK_ICONS[selectedName]}
                  <CardTitle>{selected.title}</CardTitle>
                  {selectedName && SEVERITY_MAP[selectedName] && (
                    <Badge className={SEVERITY_COLORS[SEVERITY_MAP[selectedName]] || ''}>
                      {SEVERITY_MAP[selectedName]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {selected.content}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Select a runbook to view its procedures</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
