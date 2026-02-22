/**
 * Callsites extractor: fetch, axios, router.push, server action invocations.
 */
import { SyntaxKind } from 'ts-morph';
import { addNode, callsiteNode } from '../core/graph/graph.js';
export function extractCallsites(graph, options) {
    const { files, getSourceFile } = options;
    for (const f of files) {
        if (f.isMigration)
            continue;
        const sf = getSourceFile(f.filePath);
        if (!sf)
            continue;
        const calls = sf.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const call of calls) {
            const expr = call.getExpression();
            const text = expr.getText();
            const line = call.getStartLineNumber();
            if (text === 'fetch') {
                const args = call.getArguments();
                const first = args[0]?.getText();
                const path = first?.replace(/^["']|["']$/g, '').replace(/`/g, '') ?? '';
                if (path.startsWith('/') || path.startsWith('http')) {
                    const node = callsiteNode(f.filePath, 'fetch', { line, targetPath: path });
                    addNode(graph, node);
                }
            }
            else if (text.includes('axios') && (text.endsWith('.get') || text.endsWith('.post') || text.endsWith('.put') || text.endsWith('.patch') || text.endsWith('.delete'))) {
                const args = call.getArguments();
                const first = args[0]?.getText();
                const path = first?.replace(/^["']|["']$/g, '') ?? '';
                const node = callsiteNode(f.filePath, 'axios', { line, targetPath: path });
                addNode(graph, node);
            }
            else if (text.includes('push') && (text.endsWith('.push') || text === 'push')) {
                const args = call.getArguments();
                const first = args[0]?.getText();
                const path = first?.replace(/^["']|["']$/g, '') ?? '';
                if (path.startsWith('/')) {
                    const node = callsiteNode(f.filePath, 'router', { line, targetPath: path });
                    addNode(graph, node);
                }
            }
        }
    }
}
//# sourceMappingURL=callsites.js.map