/**
 * Emit validation-context.json.
 */
import fs from 'node:fs';
import path from 'node:path';
export function writeValidationContextJson(context, outPath) {
    const dir = path.dirname(outPath);
    if (dir !== '.') {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outPath, JSON.stringify(context, null, 2), 'utf-8');
}
//# sourceMappingURL=json.js.map