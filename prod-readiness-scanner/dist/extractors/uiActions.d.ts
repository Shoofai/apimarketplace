/**
 * UI actions extractor: buttons, links, forms (ts-morph JSX).
 * Stub detection: empty handler, only console/toast, TODO/FIXME.
 */
import type { SourceFile } from 'ts-morph';
import type { AppGraph } from '../core/graph-types.js';
import type { FileEntry } from '../core/fileIndex.js';
export interface UiActionsExtractorOptions {
    files: FileEntry[];
    getSourceFile: (filePath: string) => SourceFile | undefined;
}
export declare function extractUiActions(graph: AppGraph, options: UiActionsExtractorOptions): void;
//# sourceMappingURL=uiActions.d.ts.map