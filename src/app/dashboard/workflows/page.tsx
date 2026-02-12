'use client';

import { useState } from 'react';
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
import { Play, Save, Plus, Trash2, Settings } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'api_call' | 'transform' | 'condition' | 'delay';
  name: string;
  config: any;
}

export default function WorkflowBuilderPage() {
  const [workflow, setWorkflow] = useState<WorkflowNode[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: workflowName,
        nodes: workflow,
      }),
    });

    if (response.ok) {
      alert('Workflow saved!');
    }
  }

  async function runWorkflow() {
    const response = await fetch('/api/workflows/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_id: 'temp',
        nodes: workflow,
      }),
    });

    if (response.ok) {
      alert('Workflow started!');
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-2xl font-bold border-0 px-0"
          />
          <p className="text-muted-foreground">Visual API workflow builder</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={runWorkflow}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
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
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select API" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="api1">Payment API</SelectItem>
                                <SelectItem value="api2">User API</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Endpoint</Label>
                            <Input placeholder="/users" />
                          </div>
                          <div>
                            <Label>Method</Label>
                            <Select>
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
                          <Label>Delay (seconds)</Label>
                          <Input type="number" placeholder="5" />
                        </div>
                      )}

                      {node.type === 'condition' && (
                        <>
                          <div>
                            <Label>Condition</Label>
                            <Input placeholder="response.status === 200" />
                          </div>
                        </>
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
