/**
 * In-memory graph node/edge types for rule evaluation.
 * Enables "UI action → endpoint → table lacking RLS" style findings.
 */
export type NodeKind = 'Route' | 'UiAction' | 'Endpoint' | 'Callsite' | 'SupabaseQuery' | 'Migration' | 'EnvVar' | 'Table';
export interface BaseNode {
    id: string;
    kind: NodeKind;
}
export interface RouteNode extends BaseNode {
    kind: 'Route';
    path: string;
    filePath: string;
    isApi: boolean;
    isPage: boolean;
}
export interface UiActionNode extends BaseNode {
    kind: 'UiAction';
    filePath: string;
    line?: number;
    label?: string;
    element: string;
    href?: string;
    handlerName?: string;
    suspicious?: boolean;
    routePath?: string;
}
export interface EndpointNode extends BaseNode {
    kind: 'Endpoint';
    pathOrName: string;
    filePath: string;
    line?: number;
    method?: string;
    mutatesData: boolean;
    isServerAction: boolean;
    isApiRoute: boolean;
}
export interface CallsiteNode extends BaseNode {
    kind: 'Callsite';
    filePath: string;
    line?: number;
    type: 'fetch' | 'axios' | 'router' | 'serverAction';
    targetPath?: string;
    targetSymbol?: string;
}
export interface SupabaseQueryNode extends BaseNode {
    kind: 'SupabaseQuery';
    filePath: string;
    line?: number;
    table: string;
    operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'rpc';
    hasPagination?: boolean;
    selectAll?: boolean;
    isClient: boolean;
    /** True when .single() or .maybeSingle() is used — no PERF-1. */
    isSingleRow?: boolean;
    /** True when select(..., { head: true }) — count-only, no rows; no PERF-1. */
    isCountOnly?: boolean;
}
export interface MigrationNode extends BaseNode {
    kind: 'Migration';
    filePath: string;
    table?: string;
    rlsEnabled?: boolean;
    policyCount?: number;
    hasDestructiveDdl?: boolean;
    hasIndex?: boolean;
}
export interface EnvVarNode extends BaseNode {
    kind: 'EnvVar';
    name: string;
    filePath: string;
    line?: number;
    isPublic: boolean;
    inExample?: boolean;
}
export type GraphNode = RouteNode | UiActionNode | EndpointNode | CallsiteNode | SupabaseQueryNode | MigrationNode | EnvVarNode;
export interface GraphEdge {
    from: string;
    to: string;
    type: string;
}
export interface AppGraph {
    nodes: Map<string, GraphNode>;
    edges: GraphEdge[];
}
//# sourceMappingURL=graph-types.d.ts.map