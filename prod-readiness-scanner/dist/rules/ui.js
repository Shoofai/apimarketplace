/**
 * UI rules: UI-1 (unwired/suspicious), UI-2 (dead link), UI-3 (orphan route).
 */
import { getNodesByKind } from '../core/graph/graph.js';
import { createFinding } from './evidence.js';
/** Next.js route groups like (public) are not in the URL; return path as seen in the browser. */
function routePathToUrlForm(routePath) {
    const withoutGroups = routePath.replace(/\/\([^)]+\)/g, '').replace(/\/+/g, '/');
    return withoutGroups || '/';
}
export function runUiRules(graph, context) {
    const findings = [];
    const uiActions = getNodesByKind(graph, 'UiAction');
    const routes = getNodesByKind(graph, 'Route');
    const routePaths = new Set();
    for (const r of routes) {
        routePaths.add(r.path);
        routePaths.add(routePathToUrlForm(r.path));
    }
    for (const action of uiActions) {
        if (action.suspicious) {
            findings.push(createFinding(`ui-1-${action.id}`, 'UI-1', 'ui', 'MEDIUM', 'HIGH', 'Suspicious or unwired UI action', `Button/link may be unwired or stub: ${action.label || action.element} (${action.filePath})`, action.filePath, action.line, 'Wire to a real handler or remove placeholder.'));
        }
        if (action.href) {
            const pathname = action.href.split('?')[0].split('#')[0];
            const hrefMatchesRoute = routePaths.has(action.href) || routePaths.has(pathname);
            if (!hrefMatchesRoute && !action.href.startsWith('http') && !action.href.startsWith('#') && action.href !== '-') {
                findings.push(createFinding(`ui-2-${action.id}`, 'UI-2', 'ui', 'MEDIUM', 'HIGH', 'Dead link', `Link href "${action.href}" does not match any discovered route.`, action.filePath, action.line, 'Fix href to a valid route or use Link with existing path.'));
            }
        }
    }
    const callsites = getNodesByKind(graph, 'Callsite');
    const calledPaths = new Set(callsites
        .filter((c) => c.targetPath?.startsWith('/'))
        .map((c) => c.targetPath.split('?')[0]));
    for (const route of routes) {
        if (!route.isApi)
            continue;
        if (!calledPaths.has(route.path)) {
            findings.push(createFinding(`ui-3-${route.id}`, 'UI-3', 'ui', 'LOW', 'MEDIUM', 'Orphan API route', `API route ${route.path} may never be called (no matching callsite).`, route.filePath, undefined, 'Confirm route is used (e.g. from server action or external).'));
        }
    }
    return findings;
}
//# sourceMappingURL=ui.js.map