/**
 * Runs generated checks and collects results.
 */

import type { CheckDefinition, CheckResult, CheckResultWithMeta } from './types';

export interface RunOptions {
  onProgress?: (current: number, total: number) => void;
}

export class CheckRunner {
  async runChecks(
    checks: CheckDefinition[],
    options?: RunOptions
  ): Promise<CheckResultWithMeta[]> {
    const enabled = checks.filter((c) => c.enabled);
    const total = enabled.length;
    const results: CheckResultWithMeta[] = [];

    for (let i = 0; i < enabled.length; i++) {
      options?.onProgress?.(i + 1, total);
      const check = enabled[i];
      let result: CheckResult;
      try {
        result = await check.validator();
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        result = {
          passed: false,
          message: 'Check threw an error',
          detail: err.message,
        };
      }
      results.push({
        ...result,
        id: check.id,
        category: check.category,
        name: check.name,
        severity: check.severity,
        fixPromptTemplate: check.fixPromptTemplate,
      });
    }

    return results;
  }
}
