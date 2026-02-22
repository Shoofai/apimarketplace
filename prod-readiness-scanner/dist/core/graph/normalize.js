/**
 * Normalization helpers for graph and findings.
 */
import path from 'node:path';
/** Normalize path to use forward slashes and relative to project root */
export function normalizePath(filePath, projectRoot) {
    const rel = path.relative(projectRoot, path.normalize(filePath));
    return rel.replace(/\\/g, '/');
}
/** Normalize route path from App Router folder (e.g. src/app/api/foo/route.ts -> /api/foo) */
export function routePathFromAppFile(relativePath) {
    const normalized = relativePath.replace(/\\/g, '/');
    const withoutPage = normalized.replace(/\/page\.(tsx?|jsx?)$/, '');
    const withoutRoute = withoutPage.replace(/\/route\.(ts|js)$/, '');
    const segments = withoutRoute.split('/').filter(Boolean);
    if (segments[0] === 'src' && segments[1] === 'app') {
        segments.shift();
        segments.shift();
    }
    else if (segments[0] === 'app') {
        segments.shift();
    }
    const joined = '/' + segments.join('/');
    return joined || '/';
}
//# sourceMappingURL=normalize.js.map