/**
 * Builds and saves diagnostic reports from snapshot + check results.
 */

import fs from 'fs/promises';
import path from 'path';
import type { CodeSnapshot, CheckResultWithMeta, DiagnosticReport } from './types';

const REPORT_FILE = '.deployment-report.json';

export class ReportGenerator {
  generate(snapshot: CodeSnapshot, results: CheckResultWithMeta[]): DiagnosticReport {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      passed: 0,
      total: results.length,
    };

    for (const r of results) {
      if (r.passed) {
        summary.passed++;
      } else {
        switch (r.severity) {
          case 'critical':
            summary.critical++;
            break;
          case 'high':
            summary.high++;
            break;
          case 'medium':
            summary.medium++;
            break;
          case 'low':
            summary.low++;
            break;
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      snapshot,
      results,
      summary,
    };
  }

  async save(report: DiagnosticReport, projectRoot: string = process.cwd()): Promise<string> {
    const filePath = path.join(projectRoot, REPORT_FILE);
    await fs.writeFile(
      filePath,
      JSON.stringify(
        {
          ...report,
          snapshot: {
            ...report.snapshot,
            patterns: report.snapshot.patterns,
          },
        },
        null,
        2
      ),
      'utf-8'
    );
    return filePath;
  }

  printSummary(report: DiagnosticReport): void {
    const s = report.summary;
    console.log('\nResults:');
    console.log(`  Critical: ${s.critical}`);
    console.log(`  High:     ${s.high}`);
    console.log(`  Medium:   ${s.medium}`);
    console.log(`  Low:     ${s.low}`);
    console.log(`  Passed:  ${s.passed}/${s.total}`);

    if (s.critical > 0 || s.high > 0) {
      const failed = report.results.filter((r) => !r.passed && (r.severity === 'critical' || r.severity === 'high'));
      if (failed.length > 0) {
        console.log('\nFailed (critical/high):');
        failed.forEach((f) => {
          console.log(`  - [${f.severity}] ${f.name}: ${f.message ?? ''}`);
        });
      }
    }
  }
}
