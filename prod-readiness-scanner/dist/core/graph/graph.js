/**
 * In-memory graph builder for rule evaluation.
 */
export function createGraph() {
    return {
        nodes: new Map(),
        edges: [],
    };
}
export function addNode(graph, node) {
    graph.nodes.set(node.id, node);
}
export function addEdge(graph, from, to, type) {
    graph.edges.push({ from, to, type });
}
export function getNode(graph, id) {
    return graph.nodes.get(id);
}
export function getNodesByKind(graph, kind) {
    return [...graph.nodes.values()].filter((n) => n.kind === kind);
}
export function getOutEdges(graph, fromId) {
    return graph.edges.filter((e) => e.from === fromId);
}
export function getInEdges(graph, toId) {
    return graph.edges.filter((e) => e.to === toId);
}
/** Generate a stable id for a node from kind and key parts */
export function nodeId(kind, ...parts) {
    const key = parts.filter(Boolean).join(':') || 'default';
    return `${kind}:${key}`.replace(/\s+/g, '_');
}
export function routeNode(path, filePath, isApi, isPage) {
    return {
        id: nodeId('Route', path, filePath),
        kind: 'Route',
        path,
        filePath,
        isApi,
        isPage,
    };
}
export function uiActionNode(filePath, element, options = {}) {
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
export function endpointNode(pathOrName, filePath, options = {}) {
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
export function callsiteNode(filePath, type, options = {}) {
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
export function supabaseQueryNode(filePath, table, operation, options = {}) {
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
export function migrationNode(filePath, options = {}) {
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
export function envVarNode(name, filePath, isPublic, options = {}) {
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
//# sourceMappingURL=graph.js.map