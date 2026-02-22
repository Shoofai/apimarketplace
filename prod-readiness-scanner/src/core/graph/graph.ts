/**
 * In-memory graph builder for rule evaluation.
 */

import type {
  AppGraph,
  GraphNode,
  GraphEdge,
  RouteNode,
  UiActionNode,
  EndpointNode,
  CallsiteNode,
  SupabaseQueryNode,
  MigrationNode,
  EnvVarNode,
} from '../graph-types.js';

export function createGraph(): AppGraph {
  return {
    nodes: new Map(),
    edges: [],
  };
}

export function addNode(graph: AppGraph, node: GraphNode): void {
  graph.nodes.set(node.id, node);
}

export function addEdge(graph: AppGraph, from: string, to: string, type: string): void {
  graph.edges.push({ from, to, type });
}

export function getNode<T extends GraphNode>(graph: AppGraph, id: string): T | undefined {
  return graph.nodes.get(id) as T | undefined;
}

export function getNodesByKind<K extends GraphNode['kind']>(
  graph: AppGraph,
  kind: K
): Extract<GraphNode, { kind: K }>[] {
  return [...graph.nodes.values()].filter((n) => n.kind === kind) as Extract<
    GraphNode,
    { kind: K }
  >[];
}

export function getOutEdges(graph: AppGraph, fromId: string): GraphEdge[] {
  return graph.edges.filter((e) => e.from === fromId);
}

export function getInEdges(graph: AppGraph, toId: string): GraphEdge[] {
  return graph.edges.filter((e) => e.to === toId);
}

/** Generate a stable id for a node from kind and key parts */
export function nodeId(kind: string, ...parts: string[]): string {
  const key = parts.filter(Boolean).join(':') || 'default';
  return `${kind}:${key}`.replace(/\s+/g, '_');
}

export function routeNode(
  path: string,
  filePath: string,
  isApi: boolean,
  isPage: boolean
): RouteNode {
  return {
    id: nodeId('Route', path, filePath),
    kind: 'Route',
    path,
    filePath,
    isApi,
    isPage,
  };
}

export function uiActionNode(
  filePath: string,
  element: string,
  options: {
    line?: number;
    label?: string;
    href?: string;
    handlerName?: string;
    suspicious?: boolean;
    routePath?: string;
  } = {}
): UiActionNode {
  const id = nodeId('UiAction', filePath, String(options.line ?? 0), element, options.href ?? '');
  return {
    id,
    kind: 'UiAction',
    filePath,
    line: options.line,
    label: options.label,
    element,
    href: options.href,
    handlerName: options.handlerName,
    suspicious: options.suspicious,
    routePath: options.routePath,
  };
}

export function endpointNode(
  pathOrName: string,
  filePath: string,
  options: {
    line?: number;
    method?: string;
    mutatesData?: boolean;
    isServerAction?: boolean;
    isApiRoute?: boolean;
  } = {}
): EndpointNode {
  const id = nodeId('Endpoint', pathOrName, filePath);
  return {
    id,
    kind: 'Endpoint',
    pathOrName,
    filePath,
    line: options.line,
    method: options.method,
    mutatesData: options.mutatesData ?? false,
    isServerAction: options.isServerAction ?? false,
    isApiRoute: options.isApiRoute ?? false,
  };
}

export function callsiteNode(
  filePath: string,
  type: CallsiteNode['type'],
  options: { line?: number; targetPath?: string; targetSymbol?: string } = {}
): CallsiteNode {
  const id = nodeId('Callsite', filePath, String(options.line ?? 0), type);
  return {
    id,
    kind: 'Callsite',
    filePath,
    line: options.line,
    type,
    targetPath: options.targetPath,
    targetSymbol: options.targetSymbol,
  };
}

export function supabaseQueryNode(
  filePath: string,
  table: string,
  operation: SupabaseQueryNode['operation'],
  options: {
    line?: number;
    hasPagination?: boolean;
    selectAll?: boolean;
    isClient?: boolean;
    isSingleRow?: boolean;
    isCountOnly?: boolean;
  } = {}
): SupabaseQueryNode {
  const id = nodeId('SupabaseQuery', filePath, table, operation);
  return {
    id,
    kind: 'SupabaseQuery',
    filePath,
    line: options.line,
    table,
    operation,
    hasPagination: options.hasPagination,
    selectAll: options.selectAll,
    isClient: options.isClient ?? false,
    isSingleRow: options.isSingleRow,
    isCountOnly: options.isCountOnly,
  };
}

export function migrationNode(
  filePath: string,
  options: {
    table?: string;
    rlsEnabled?: boolean;
    policyCount?: number;
    hasDestructiveDdl?: boolean;
    hasIndex?: boolean;
  } = {}
): MigrationNode {
  const id = nodeId('Migration', filePath, options.table ?? '');
  return {
    id,
    kind: 'Migration',
    filePath,
    table: options.table,
    rlsEnabled: options.rlsEnabled,
    policyCount: options.policyCount,
    hasDestructiveDdl: options.hasDestructiveDdl,
    hasIndex: options.hasIndex,
  };
}

export function envVarNode(
  name: string,
  filePath: string,
  isPublic: boolean,
  options: { line?: number; inExample?: boolean } = {}
): EnvVarNode {
  const id = nodeId('EnvVar', name, filePath);
  return {
    id,
    kind: 'EnvVar',
    name,
    filePath,
    line: options.line,
    isPublic,
    inExample: options.inExample,
  };
}
