/**
 * Rule registry: run all V1 rules and return combined findings.
 */

import type { AppGraph } from '../core/graph-types.js';
import type { Finding } from '../core/types.js';
import type { RuleContext } from './types.js';
import { runUiRules } from './ui.js';
import { runRouteRules } from './routes.js';
import { runSecurityRules } from './security.js';
import { runDbRules } from './db.js';
import { runPerfRules } from './performance.js';
import { runEnvRules } from './env.js';

export function runAllRules(graph: AppGraph, context: RuleContext): Finding[] {
  const findings: Finding[] = [];
  findings.push(...runUiRules(graph, context));
  findings.push(...runRouteRules(graph, context));
  findings.push(...runSecurityRules(graph, context));
  findings.push(...runDbRules(graph, context));
  findings.push(...runPerfRules(graph, context));
  findings.push(...runEnvRules(graph, context));
  return findings;
}
