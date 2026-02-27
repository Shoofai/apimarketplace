'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Save, Plus, Trash2, Settings, Workflow } from 'lucide-react';
import {
  WorkflowCanvas,
  type WorkflowCanvasNode,
  type WorkflowCanvasEdge,
} from '@/components/workflows/WorkflowCanvas';

interface ApiOption {
  id: string;
  name: string;
  slug: string;
  base_url: string;
}

interface WorkflowListItem {
  id: string;
  name: string;
}

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<WorkflowCanvasNode[]>([]);
  const [edges, setEdges] = useState<WorkflowCanvasEdge[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [savedWorkflowId, setSavedWorkflowId] = useState<string | null>(null);
  const [workflowList, setWorkflowList] = useState<WorkflowListItem[]>([]);
  const [apis, setApis] = useState<ApiOption[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  useEffect(() => {
    fetch('/api/apis?status=published')
      .then((res) => res.ok ? res.json() : { apis: [] })
      .then((data) => setApis(data.apis || []))
      .catch(() => setApis([]));
  }, []);

  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.ok ? res.json() : { workflows: [] })
      .then((data) => setWorkflowList((data.workflows ?? []).map((w: { id: string; name: string }) => ({ id: w.id, name: w.name }))))
      .catch(() => setWorkflowList([]));
  }, [savedWorkflowId]);

  function addNode(type: WorkflowCanvasNode['type']) {
    const newNode: WorkflowCanvasNode = {
      id: `node_${Date.now()}`,
      type,
      name: `${type}_${nodes.length + 1}`,
      config: {},
      position: { x: 180 * (nodes.length % 4), y: 120 * Math.floor(nodes.length / 4) },
    };
    setNodes([...nodes, newNode]);
  }

  function removeNode(id: string) {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.source !== id && e.target !== id));
    if (selectedNode === id) setSelectedNode(null);
  }

  function loadWorkflow(id: string) {
    fetch(`/api/workflows/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data?.workflow) return;
        const w = data.workflow;
        setWorkflowName(w.name || 'Untitled Workflow');
        setSavedWorkflowId(w.id);
        const rawNodes = Array.isArray(w.nodes) ? w.nodes : [];
        const rawEdges = Array.isArray(w.edges) ? w.edges : [];
        setNodes(
          rawNodes.map((n: WorkflowCanvasNode & { position?: { x: number; y: number } }, i: number) => ({
            id: n.id,
            type: n.type || 'api_call',
            name: n.name || n.id,
            config: n.config ?? {},
            position: n.position ?? { x: 180 * (i % 4), y: 120 * Math.floor(i / 4) },
          }))
        );
        setEdges(
          rawEdges.map((e: WorkflowCanvasEdge) => ({
            id: e.id,
            source: e.source,
            target: e.target,
          }))
        );
      });
  }

  async function saveWorkflow() {
    setSaveLoading(true);
    try {
      if (savedWorkflowId) {
        const response = await fetch(`/api/workflows/${savedWorkflowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workflowName, nodes, edges }),
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
            nodes,
            edges,
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
        <div className="flex gap-2 items-center">
          <Select value={savedWorkflowId ?? '__new__'} onValueChange={(v) => v !== '__new__' && loadWorkflow(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Open workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__new__">New workflow</SelectItem>
              {workflowList.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {nodes.length === 0
                ? 'Add nodes from the palette and connect them'
                : `${nodes.length} node${nodes.length !== 1 ? 's' : ''}, ${edges.length} edge${edges.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onNodeSelect={setSelectedNode}
              selectedNodeId={selectedNode}
            />
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
                  const node = nodes.find((n) => n.id === selectedNode);
                  if (!node) return null;

                  return (
                    <>
                      <div>
                        <Label>Node Name</Label>
                        <Input
                          value={node.name}
                          onChange={(e) => {
                            setNodes(
                              nodes.map((n) =>
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
                                setNodes(
                                  nodes.map((n) =>
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
                                setNodes(
                                  nodes.map((n) =>
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
                                setNodes(
                                  nodes.map((n) =>
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
                              setNodes(
                                nodes.map((n) =>
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
                              setNodes(
                                nodes.map((n) =>
                                  n.id === selectedNode
                                    ? { ...n, config: { ...n.config, condition: e.target.value } }
                                    : n
                                )
                              )
                            }
                          />
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => removeNode(node.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove node
                      </Button>
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
