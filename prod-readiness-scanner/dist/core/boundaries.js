/**
 * Detect "use client" and "use server" boundaries from file content.
 */
import fs from 'node:fs';
const DIRECTIVE_CLIENT = 'use client';
const DIRECTIVE_SERVER = 'use server';
const MAX_HEAD_BYTES = 1024;
export function getBoundaryInfo(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf-8').slice(0, MAX_HEAD_BYTES);
    }
    catch {
        return { isClient: false, isServerAction: false };
    }
    const lines = content.split(/\r?\n/).slice(0, 20);
    let isClient = false;
    let isServerAction = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
            if (trimmed.includes(DIRECTIVE_CLIENT))
                isClient = true;
            if (trimmed.includes(DIRECTIVE_SERVER))
                isServerAction = true;
        }
        if (trimmed.startsWith('//') || trimmed.startsWith('/*'))
            continue;
        if (trimmed && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
            break;
        }
    }
    return { isClient, isServerAction };
}
//# sourceMappingURL=boundaries.js.map