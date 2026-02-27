'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Handle,
  Position,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type WorkflowNodeType = 'api_call' | 'transform' | 'condition' | 'delay';

export interface WorkflowNodeData {
  id: string;
  type: WorkflowNodeType;
  name: string;
  config: Record<string, unknown>;
}

export interface WorkflowCanvasNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowCanvasEdge {
  id: string;
  source: string;
  target: string;
}

function BaseNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  return (
    <Card className={`px-4 py-3 min-w-[160px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !border-2" />
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {(data.type ?? 'node').replace('_', ' ')}
        </Badge>
        <span className="font-medium text-sm truncate">{data.name || data.id}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !border-2" />
    </Card>
  );
}

const nodeTypes: Record<WorkflowNodeType, React.ComponentType<NodeProps<WorkflowNodeData>>> = {
  api_call: BaseNode,
  transform: BaseNode,
  condition: BaseNode,
  delay: BaseNode,
};

function toReactFlowNode(n: WorkflowCanvasNode): Node<WorkflowNodeData> {
  return {
    id: n.id,
    type: n.type,
    position: n.position,
    data: { id: n.id, type: n.type, name: n.name, config: n.config },
  };
}

function toWorkflowNode(n: Node<WorkflowNodeData>): WorkflowCanvasNode {
  return {
    id: n.id,
    type: (n.type as WorkflowNodeType) || 'api_call',
    name: n.data?.name ?? n.id,
    config: n.data?.config ?? {},
    position: n.position,
  };
}

function toReactFlowEdge(e: WorkflowCanvasEdge): Edge {
  return { id: e.id, source: e.source, target: e.target };
}

interface WorkflowCanvasInnerProps {
  nodes: WorkflowCanvasNode[];
  edges: WorkflowCanvasEdge[];
  onNodesChange: (nodes: WorkflowCanvasNode[]) => void;
  onEdgesChange: (edges: WorkflowCanvasEdge[]) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

function WorkflowCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  selectedNodeId,
}: WorkflowCanvasInnerProps) {
  const rfNodes = useMemo(
    () =>
      nodes.map((n) => {
        const rf = toReactFlowNode(n);
        return { ...rf, selected: n.id === selectedNodeId };
      }),
    [nodes, selectedNodeId]
  );
  const rfEdges = useMemo(() => edges.map(toReactFlowEdge), [edges]);

  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      const nextRf = applyNodeChanges(changes, rfNodes);
      onNodesChange(nextRf.map(toWorkflowNode));
    },
    [rfNodes, onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: EdgeChange[]) => {
      const nextRf = applyEdgeChanges(changes, rfEdges);
      onEdgesChange(nextRf.map((e) => ({ id: e.id, source: e.source, target: e.target })));
    },
    [rfEdges, onEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newEdge: WorkflowCanvasEdge = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
      };
      onEdgesChange([...edges, newEdge]);
    },
    [edges, onEdgesChange]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="h-[400px] w-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export interface WorkflowCanvasProps {
  nodes: WorkflowCanvasNode[];
  edges: WorkflowCanvasEdge[];
  onNodesChange: (nodes: WorkflowCanvasNode[]) => void;
  onEdgesChange: (edges: WorkflowCanvasEdge[]) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  selectedNodeId,
}: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeSelect={onNodeSelect}
        selectedNodeId={selectedNodeId}
      />
    </ReactFlowProvider>
  );
}
