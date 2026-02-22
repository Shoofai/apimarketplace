/**
 * Endpoints extractor: Next API route handlers (GET/POST/etc) and server actions.
 */
import { addNode, endpointNode } from '../core/graph/graph.js';
import { routePathFromAppFile } from '../core/graph/normalize.js';
import { getBoundaryInfo } from '../core/boundaries.js';
import path from 'node:path';
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
export function extractEndpoints(graph, options) {
    const { projectRoot, files, getSourceFile } = options;
    for (const f of files) {
        if (f.isMigration)
            continue;
        const rel = path.relative(projectRoot, f.filePath).replace(/\\/g, '/');
        if ((rel.includes('/route.') && rel.startsWith('src/app')) || (rel.includes('/route.') && rel.startsWith('app'))) {
            const sf = getSourceFile(f.filePath);
            if (!sf)
                continue;
            const routePath = routePathFromAppFile(rel);
            const isApi = routePath.startsWith('/api');
            const exports = sf.getExportedDeclarations();
            for (const method of HTTP_METHODS) {
                const decls = exports.get(method);
                if (!decls?.length)
                    continue;
                const first = decls[0];
                const line = 'getStartLineNumber' in first ? first.getStartLineNumber() : undefined;
                const mutatesData = method !== 'GET';
                const node = endpointNode(routePath, f.filePath, {
                    line,
                    method,
                    mutatesData,
                    isServerAction: false,
                    isApiRoute: isApi,
                });
                addNode(graph, node);
            }
        }
        const boundary = getBoundaryInfo(f.filePath);
        if (boundary.isServerAction) {
            const sf = getSourceFile(f.filePath);
            if (!sf)
                continue;
            const exports = sf.getExportedDeclarations();
            for (const [name, decls] of exports) {
                for (const d of decls) {
                    if (d.getKindName() === 'FunctionDeclaration' || d.getKindName() === 'ArrowFunction') {
                        const line = d.getStartLineNumber();
                        const node = endpointNode(name, f.filePath, {
                            line,
                            mutatesData: true,
                            isServerAction: true,
                            isApiRoute: false,
                        });
                        addNode(graph, node);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=endpoints.js.map