/**
 * UI actions extractor: buttons, links, forms (ts-morph JSX).
 * Stub detection: empty handler, only console/toast, TODO/FIXME.
 */

import type { SourceFile } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';
import type { AppGraph } from '../core/graph-types.js';
import { addNode, uiActionNode } from '../core/graph/graph.js';
import type { FileEntry } from '../core/fileIndex.js';

const ACTION_ELEMENTS = new Set([
  'button',
  'a',
  'form',
]);
const ACTION_COMPONENTS = new Set([
  'Button',
  'IconButton',
  'MenuItem',
  'DropdownMenuItem',
]);

const STUB_PATTERNS = /TODO|FIXME|coming soon|not implemented/i;

export interface UiActionsExtractorOptions {
  files: FileEntry[];
  getSourceFile: (filePath: string) => SourceFile | undefined;
}

function isStubHandler(body: string): boolean {
  const t = body.trim();
  if (!t || t === '{}' || t === ';') return true;
  if (/^console\.\s*(log|warn|error|info)\s*\(/.test(t)) return true;
  if (/^toast\s*\(/.test(t)) return true;
  if (/^alert\s*\(/.test(t)) return true;
  if (/return\s*;?\s*$/.test(t) && t.length < 20) return true;
  if (STUB_PATTERNS.test(t)) return true;
  return false;
}

function getLabelFromJsx(node: { getText(): string }): string | undefined {
  const text = node.getText();
  const aria = text.match(/aria-label=["']([^"']+)["']/);
  if (aria) return aria[1];
  const title = text.match(/title=["']([^"']+)["']/);
  if (title) return title[1];
  const dataTest = text.match(/data-testid=["']([^"']+)["']/);
  if (dataTest) return dataTest[1];
  return undefined;
}

export function extractUiActions(graph: AppGraph, options: UiActionsExtractorOptions): void {
  const { files, getSourceFile } = options;

  for (const f of files) {
    if (f.isMigration) continue;
    const sf = getSourceFile(f.filePath);
    if (!sf) continue;

    const jsx = sf.getDescendantsOfKind(SyntaxKind.JsxElement);
    for (const el of jsx) {
      const opening = el.getOpeningElement();
      const tagNode = opening.getTagNameNode();
      const tag = tagNode.getText();
      const isIntrinsic = ACTION_ELEMENTS.has(tag);
      const isComponent = ACTION_COMPONENTS.has(tag);
      if (!isIntrinsic && !isComponent) continue;

      const line = opening.getStartLineNumber();
      let href: string | undefined;
      let handlerName: string | undefined;
      let suspicious = false;

      const attrs = opening.getAttributes();
      for (const attr of attrs) {
        if (attr.getKindName() !== 'JsxAttribute') continue;
        const nameNode = (attr as { getNameNode(): { getText(): string } }).getNameNode();
        const name = nameNode.getText();
        const init = (attr as { getInitializer(): { getText(): string } | undefined }).getInitializer();
        if (name === 'href' && init) {
          const text = init.getText();
          const match = text.match(/["']([^"']+)["']/);
          if (match) href = match[1];
        }
        if ((name === 'onClick' || name === 'onSubmit') && init) {
          const text = init.getText();
          const idMatch = text.match(/(\w+)\s*[\(\)]/);
          if (idMatch) handlerName = idMatch[1];
          if (isStubHandler(text)) suspicious = true;
        }
      }

      const label = getLabelFromJsx(opening);
      const node = uiActionNode(f.filePath, tag, {
        line,
        label,
        href,
        handlerName,
        suspicious,
      });
      addNode(graph, node);
    }
  }
}
