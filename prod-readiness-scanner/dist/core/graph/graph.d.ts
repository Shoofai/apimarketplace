/**
 * In-memory graph builder for rule evaluation.
 */
import type { AppGraph, GraphNode, GraphEdge, RouteNode, UiActionNode, EndpointNode, CallsiteNode, SupabaseQueryNode, MigrationNode, EnvVarNode } from '../graph-types.js';
export declare function createGraph(): AppGraph;
export declare function addNode(graph: AppGraph, node: GraphNode): void;
export declare function addEdge(graph: AppGraph, from: string, to: string, type: string): void;
export declare function getNode<T extends GraphNode>(graph: AppGraph, id: string): T | undefined;
export declare function getNodesByKind<K extends GraphNode['kind']>(graph: AppGraph, kind: K): Extract<GraphNode, {
    kind: K;
}>[];
export declare function getOutEdges(graph: AppGraph, fromId: string): GraphEdge[];
export declare function getInEdges(graph: AppGraph, toId: string): GraphEdge[];
/** Generate a stable id for a node from kind and key parts */
export declare function nodeId(kind: string, ...parts: string[]): string;
export declare function routeNode(path: string, filePath: string, isApi: boolean, isPage: boolean): RouteNode;
export declare function uiActionNode(filePath: string, element: string, options?: {
    line?: number;
    label?: string;
    href?: string;
    handlerName?: string;
    suspicious?: boolean;
    routePath?: string;
}): UiActionNode;
export declare function endpointNode(pathOrName: string, filePath: string, options?: {
    line?: number;
    method?: string;
    mutatesData?: boolean;
    isServerAction?: boolean;
    isApiRoute?: boolean;
}): EndpointNode;
export declare function callsiteNode(filePath: string, type: CallsiteNode['type'], options?: {
    line?: number;
    targetPath?: string;
    targetSymbol?: string;
}): CallsiteNode;
export declare function supabaseQueryNode(filePath: string, table: string, operation: SupabaseQueryNode['operation'], options?: {
    line?: number;
    hasPagination?: boolean;
    selectAll?: boolean;
    isClient?: boolean;
    isSingleRow?: boolean;
    isCountOnly?: boolean;
}): SupabaseQueryNode;
export declare function migrationNode(filePath: string, options?: {
    table?: string;
    rlsEnabled?: boolean;
    policyCount?: number;
    hasDestructiveDdl?: boolean;
    hasIndex?: boolean;
}): MigrationNode;
export declare function envVarNode(name: string, filePath: string, isPublic: boolean, options?: {
    line?: number;
    inExample?: boolean;
}): EnvVarNode;
//# sourceMappingURL=graph.d.ts.map