/**
 * DB rules: DB-1 (table without RLS), DB-2 (no policies), DB-4 (destructive DDL).
 */
import { getNodesByKind } from '../core/graph/graph.js';
import { createFinding } from './evidence.js';
export function runDbRules(graph, _context) {
    const findings = [];
    const migrations = getNodesByKind(graph, 'Migration');
    for (const m of migrations) {
        if (m.table && m.rlsEnabled === false) {
            findings.push(createFinding(`db-1-${m.id}`, 'DB-1', 'database', 'CRITICAL', 'HIGH', 'Table without RLS', `Table ${m.table} may not have RLS enabled.`, m.filePath, undefined, 'Enable RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY.'));
        }
        if (m.table && m.rlsEnabled === true && (m.policyCount ?? 0) === 0) {
            findings.push(createFinding(`db-2-${m.id}`, 'DB-2', 'database', 'HIGH', 'HIGH', 'RLS enabled but no policies', `Table ${m.table} has RLS but no CREATE POLICY found.`, m.filePath, undefined, 'Add at least one CREATE POLICY for the table.'));
        }
        if (m.hasDestructiveDdl) {
            findings.push(createFinding(`db-4-${m.id}`, 'DB-4', 'database', 'HIGH', 'MEDIUM', 'Destructive migration', 'Migration contains DROP TABLE/COLUMN, TRUNCATE, or ALTER COLUMN TYPE.', m.filePath, undefined, 'Ensure backup/rollback plan; avoid destructive DDL in shared branches.'));
        }
    }
    return findings;
}
//# sourceMappingURL=db.js.map