/**
 * Rule engine interface: each rule receives graph + context, returns Finding[].
 */

import type { AppGraph } from '../core/graph-types.js';
import type { Finding } from '../core/types.js';

export interface RuleContext {
  projectRoot: string;
}

export type RuleFn = (graph: AppGraph, context: RuleContext) => Finding[];

export interface Rule {
  code: string;
  category: string;
  run: RuleFn;
}
