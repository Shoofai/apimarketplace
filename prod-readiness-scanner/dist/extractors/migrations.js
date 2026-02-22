/**
 * Migrations & RLS extractor: parse supabase/migrations/*.sql.
 */
import fs from 'node:fs';
import { addNode, migrationNode } from '../core/graph/graph.js';
const RLS_ENABLE = /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:[\w."]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
/** Match CREATE POLICY with optional quoted name (multi-line); capture table name after ON. */
const CREATE_POLICY = /CREATE\s+POLICY\s+(?:"[^"]*"|\w+)[\s\S]*?ON\s+([\w."]+)/gi;
const TABLE_IN_ALTER = /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?([\w."]+)/i;
const CREATE_INDEX = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?[\w"]+\s+ON\s+([\w."]+)/gi;
const DESTRUCTIVE = /DROP\s+TABLE|DROP\s+COLUMN|TRUNCATE\s+|ALTER\s+COLUMN\s+[\w."]+\s+TYPE/gi;
export function extractMigrations(graph, options) {
    const { files } = options;
    const migrationFiles = files.filter((f) => f.isMigration);
    for (const f of migrationFiles) {
        let content;
        try {
            content = fs.readFileSync(f.filePath, 'utf-8');
        }
        catch {
            continue;
        }
        const tablesRls = new Map();
        const tablesPolicies = new Map();
        const tablesIndex = new Set();
        let hasDestructive = false;
        let m;
        RLS_ENABLE.lastIndex = 0;
        while ((m = RLS_ENABLE.exec(content)) !== null) {
            const tableMatch = content.slice(m.index).match(TABLE_IN_ALTER);
            if (tableMatch)
                tablesRls.set(tableMatch[1], true);
        }
        CREATE_POLICY.lastIndex = 0;
        while ((m = CREATE_POLICY.exec(content)) !== null) {
            const tableName = m[1];
            if (tableName) {
                const normalized = tableName.replace(/^public\./, '');
                tablesPolicies.set(normalized, (tablesPolicies.get(normalized) ?? 0) + 1);
                if (normalized !== tableName)
                    tablesPolicies.set(tableName, (tablesPolicies.get(tableName) ?? 0) + 1);
            }
        }
        CREATE_INDEX.lastIndex = 0;
        while ((m = CREATE_INDEX.exec(content)) !== null) {
            const tableMatch = content.slice(m.index).match(/ON\s+([\w."]+)/i);
            if (tableMatch)
                tablesIndex.add(tableMatch[1]);
        }
        if (DESTRUCTIVE.test(content))
            hasDestructive = true;
        const tables = new Set([...tablesRls.keys(), ...tablesPolicies.keys()]);
        if (tables.size === 0) {
            const node = migrationNode(f.filePath, { hasDestructiveDdl: hasDestructive });
            addNode(graph, node);
        }
        else {
            for (const table of tables) {
                const tableNorm = table.replace(/^public\./, '');
                const policyCount = tablesPolicies.get(table) ?? tablesPolicies.get(tableNorm);
                const node = migrationNode(f.filePath, {
                    table,
                    rlsEnabled: tablesRls.get(table),
                    policyCount,
                    hasIndex: tablesIndex.has(table) || tablesIndex.has(tableNorm),
                    hasDestructiveDdl: hasDestructive,
                });
                addNode(graph, node);
            }
        }
    }
}
//# sourceMappingURL=migrations.js.map