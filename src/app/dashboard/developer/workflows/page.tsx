'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Save, Plus, Trash2, Settings, Workflow } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'api_call' | 'transform' | 'condition' | 'delay';
  name: string;
  config: Record<string, unknown>;
}

interface ApiOption {
  id: string;
  name: string;
  slug: string;
  base_url: string;
}

export default function WorkflowBuilderPage() {
  const [workflow, setWorkflow] = useState<WorkflowNode[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [savedWorkflowId, setSavedWorkflowId] = useState<string | null>(null);
  const [apis, setApis] = useState<ApiOption[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  useEffect(() => {
    fetch('/api/apis?status=published')
      .then((res) => res.ok ? res.json() : { apis: [] })
      .then((data) => setApis(data.apis || []))
      .catch(() => setApis([]));
  }, []);

  function addNode(type: WorkflowNode['type']) {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      name: `${type}_${workflow.length + 1}`,
      config: {},
    };
    setWorkflow([...workflow, newNode]);
  }

  function removeNode(id: string) {
    setWorkflow(workflow.filter((n) => n.id !== id));
  }

  async function saveWorkflow() {
    setSaveLoading(true);
    try {
      if (savedWorkflowId) {
        const response = await fetch(`/api/workflows/${savedWorkflowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes: workflow, edges: [] }),
        });
        if (response.ok) {
          alert('Workflow updated!');
        } else {
          const data = await response.json();
          alert(data?.error || 'Failed to update');
        }
      } else {
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: workflowName,
            nodes: workflow,
            edges: [],
          }),
        });
        const data = await response.json();
        if (response.ok && data.workflow?.id) {
          setSavedWorkflowId(data.workflow.id);
          alert('Workflow saved!');
        } else {
          alert(data?.error || 'Failed to save');
        }
      }
    } finally {
      setSaveLoading(false);
    }
  }

  async function runWorkflow() {
    if (!savedWorkflowId) {
      alert('Save the workflow first, then run it.');
      return;
    }
    setRunLoading(true);
    try {
      const response = await fetch(`/api/workflows/${savedWorkflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: {} }),
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Workflow ${data.result?.status ?? 'completed'}! Execution ID: ${data.result?.executionId ?? '—'}`);
      } else {
        const data = await response.json();
        alert(data?.error || 'Execution failed');
      }
    } finally {
      setRunLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            API Workflows
          </h1>
          <p className="text-muted-foreground">Build and automate multi-step API integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveWorkflow} disabled={saveLoading}>
            <Save className="h-4 w-4 mr-2" />
            {saveLoading ? 'Saving…' : 'Save'}
          </Button>
          <Button onClick={runWorkflow} disabled={runLoading}>
            <Play className="h-4 w-4 mr-2" />
            {runLoading ? 'Running…' : 'Run'}
          </Button>
        </div>
      </div>

      {/* Workflow Name */}
      <div>
        <Label>Workflow Name</Label>
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="max-w-md"
          placeholder="Enter workflow name"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr_300px]">
        {/* Node Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add Nodes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('api_call')}
            >
              <Plus className="h-4 w-4 mr-2" />
              API Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('transform')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Transform
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('condition')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Condition
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('delay')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Delay
            </Button>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Workflow Canvas</CardTitle>
            <CardDescription>
              {workflow.length === 0
                ? 'Add nodes from the palette to build your workflow'
                : `${workflow.length} node${workflow.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workflow.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Start by adding nodes from the left panel
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflow.map((node, index) => (
                  <div key={node.id}>
                    <Card
                      className={`cursor-pointer transition-colors ${
                        selectedNode === node.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{node.type}</Badge>
                              <span className="font-medium">{node.name}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode(node.id);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNode(node.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {index < workflow.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-px h-6 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Node Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                {(() => {
                  const node = workflow.find((n) => n.id === selectedNode);
                  if (!node) return null;

                  return (
                    <>
                      <div>
                        <Label>Node Name</Label>
                        <Input
                          value={node.name}
                          onChange={(e) => {
                            setWorkflow(
                              workflow.map((n) =>
                                n.id === selectedNode ? { ...n, name: e.target.value } : n
                              )
                            );
                          }}
                        />
                      </div>

                      {node.type === 'api_call' && (
                        <>
                          <div>
                            <Label>API</Label>
                            <Select
                              value={(node.config?.apiId as string) ?? ''}
                              onValueChange={(v) =>
                                setWorkflow(
                                  workflow.map((n) =>
                                    n.id === selectedNode
                                      ? { ...n, config: { ...n.config, apiId: v } }
                                      : n
                                  )
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select API" />
                              </SelectTrigger>
                              <SelectContent>
                                {apis.map((api) => (
                                  <SelectItem key={api.id} value={api.id}>
                                    {api.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Endpoint</Label>
                            <Input
                              placeholder="/users"
                              value={(node.config?.endpoint as string) ?? ''}
                              onChange={(e) =>
                                setWorkflow(
                                  workflow.map((n) =>
                                    n.id === selectedNode
                                      ? { ...n, config: { ...n.config, endpoint: e.target.value } }
                                      : n
                                  )
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Method</Label>
                            <Select
                              value={(node.config?.method as string) ?? 'GET'}
                              onValueChange={(v) =>
                                setWorkflow(
                                  workflow.map((n) =>
                                    n.id === selectedNode
                                      ? { ...n, config: { ...n.config, method: v } }
                                      : n
                                  )
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="GET" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {node.type === 'delay' && (
                        <div>
                          <Label>Delay (ms)</Label>
                          <Input
                            type="number"
                            placeholder="1000"
                            value={((node.config?.delayMs as number) ?? 1000) || ''}
                            onChange={(e) =>
                              setWorkflow(
                                workflow.map((n) =>
                                  n.id === selectedNode
                                    ? { ...n, config: { ...n.config, delayMs: Number(e.target.value) || 1000 } }
                                    : n
                                )
                              )
                            }
                          />
                        </div>
                      )}

                      {node.type === 'condition' && (
                        <div>
                          <Label>Condition</Label>
                          <Input
                            placeholder="response.status === 200"
                            value={(node.config?.condition as string) ?? ''}
                            onChange={(e) =>
                              setWorkflow(
                                workflow.map((n) =>
                                  n.id === selectedNode
                                    ? { ...n, config: { ...n.config, condition: e.target.value } }
                                    : n
                                )
                              )
                            }
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a node to configure</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
