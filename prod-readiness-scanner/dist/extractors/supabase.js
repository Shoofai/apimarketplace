/**
 * Supabase usage extractor: from().select(), insert, update, delete, storage.
 */
import { addNode, supabaseQueryNode } from '../core/graph/graph.js';
import { getBoundaryInfo } from '../core/boundaries.js';
export function extractSupabase(graph, options) {
    const { files, getSourceFile } = options;
    for (const f of files) {
        if (f.isMigration)
            continue;
        const sf = getSourceFile(f.filePath);
        if (!sf)
            continue;
        if (!sf.getFullText().includes('.from('))
            continue;
        const boundary = getBoundaryInfo(f.filePath);
        const isClient = boundary.isClient;
        const text = sf.getFullText();
        const fromRegex = /\.from\s*\(\s*["']([^"']+)["']\s*\)/g;
        let m;
        while ((m = fromRegex.exec(text)) !== null) {
            const table = m[1];
            const pos = m.index;
            const line = text.slice(0, pos).split(/\n/).length;
            const after = text.slice(pos);
            let operation = 'select';
            if (after.match(/\.(insert|upsert)\s*\(/))
                operation = after.includes('.upsert(') ? 'upsert' : 'insert';
            else if (after.match(/\.update\s*\(/))
                operation = 'update';
            else if (after.match(/\.delete\s*\(/))
                operation = 'delete';
            else if (after.match(/\.rpc\s*\(/))
                operation = 'rpc';
            else {
                const selectMatch = after.match(/\.select\s*\((.*?)\)/s);
                const selectArg = selectMatch?.[1]?.trim() ?? '';
                const hasPagination = /\.(range|limit)\s*\(/.test(after);
                const isSingleRow = /\.(single|maybeSingle)\s*\(/.test(after);
                const isCountOnly = /head\s*:\s*true/.test(selectArg);
                const selectAll = selectArg === '*' || selectArg === '' || /^\s*["']?\*["']?\s*$/.test(selectArg);
                const node = supabaseQueryNode(f.filePath, table, 'select', {
                    line,
                    hasPagination,
                    selectAll,
                    isClient,
                    isSingleRow,
                    isCountOnly,
                });
                addNode(graph, node);
            }
            if (operation !== 'select') {
                const node = supabaseQueryNode(f.filePath, table, operation, { line, isClient });
                addNode(graph, node);
            }
        }
    }
}
//# sourceMappingURL=supabase.js.map