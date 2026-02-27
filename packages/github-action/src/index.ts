/**
 * Kinetic API SLA Check — GitHub Action
 *
 * Calls GET {platform-url}/api/apis/{api-id}/sla with a Bearer token,
 * reads the last measurement window, and optionally fails the job if the
 * SLA has been breached.
 *
 * Inputs are read from environment variables set by the GitHub Actions runner
 * (INPUT_<UPPER_NAME>).
 */

interface SLADefinition {
  uptime_target: number | null;
  latency_p95_target_ms: number | null;
  error_rate_target: number | null;
  measurement_window: string | null;
}

interface Measurement {
  window_end: string;
  uptime_percentage: number | null;
  latency_p95_ms: number | null;
  error_rate: number | null;
  is_within_sla: boolean | null;
}

interface Violation {
  id: string;
  violation_type: string;
  severity: string | null;
  acknowledged: boolean | null;
}

interface SLAResponse {
  definition: SLADefinition | null;
  measurements: Measurement[];
  violations: Violation[];
}

function getInput(name: string): string {
  return process.env[`INPUT_${name.toUpperCase().replace(/-/g, '_')}`]?.trim() ?? '';
}

function setOutput(name: string, value: string): void {
  // GitHub Actions output format
  const delimiter = `ghadelimiter_${Date.now()}`;
  process.stdout.write(`::set-output name=${name}::${value}\n`);
  // Modern format (GITHUB_OUTPUT env file)
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const { appendFileSync } = require('fs');
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
}

function logError(msg: string): void {
  process.stderr.write(`::error::${msg}\n`);
}

function logWarning(msg: string): void {
  process.stdout.write(`::warning::${msg}\n`);
}

function logInfo(msg: string): void {
  process.stdout.write(msg + '\n');
}

function logGroup(title: string): void {
  process.stdout.write(`::group::${title}\n`);
}

function logEndGroup(): void {
  process.stdout.write('::endgroup::\n');
}

async function run(): Promise<void> {
  const apiId = getInput('api-id');
  const platformUrl = getInput('platform-url') || 'https://api.kineticapi.com';
  const apiToken = getInput('api-token');
  const failOnBreach = getInput('fail-on-breach') !== 'false';
  const minUptimeStr = getInput('min-uptime');
  const maxLatencyStr = getInput('max-latency-p95');

  if (!apiId) {
    logError('Input "api-id" is required.');
    process.exit(1);
  }
  if (!apiToken) {
    logError('Input "api-token" is required.');
    process.exit(1);
  }

  const url = `${platformUrl.replace(/\/$/, '')}/api/apis/${apiId}/sla`;
  logInfo(`Fetching SLA data from: ${url}`);

  let slaData: SLAResponse;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (res.status === 404) {
      logWarning('No SLA definition found for this API. Skipping SLA check.');
      setOutput('sla-status', 'no-definition');
      setOutput('within-sla', 'true');
      setOutput('violations-count', '0');
      return;
    }

    if (!res.ok) {
      const body = await res.text();
      logError(`Platform returned HTTP ${res.status}: ${body}`);
      process.exit(1);
    }

    slaData = await res.json() as SLAResponse;
  } catch (e) {
    logError(`Failed to reach platform: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const { definition, measurements, violations } = slaData;
  const lastMeasurement = measurements[0] ?? null;
  const openViolations = violations.filter((v) => !v.acknowledged);

  logGroup('SLA Status');

  if (!definition) {
    logInfo('No SLA definition configured for this API.');
    setOutput('sla-status', 'no-definition');
    setOutput('within-sla', 'true');
    setOutput('violations-count', '0');
    logEndGroup();
    return;
  }

  logInfo(`SLA Definition:`);
  logInfo(`  Uptime target:    ${definition.uptime_target ?? 'not set'}%`);
  logInfo(`  P95 latency:      ${definition.latency_p95_target_ms ?? 'not set'}ms`);
  logInfo(`  Error rate:       ${definition.error_rate_target != null ? (definition.error_rate_target * 100).toFixed(2) + '%' : 'not set'}`);
  logInfo(`  Window:           ${definition.measurement_window ?? '1h'}`);

  if (!lastMeasurement) {
    logInfo('No measurements available yet.');
    setOutput('sla-status', 'no-data');
    setOutput('within-sla', 'true');
    setOutput('violations-count', '0');
    logEndGroup();
    return;
  }

  logInfo(`\nLast measurement (${lastMeasurement.window_end}):`);
  logInfo(`  Uptime:           ${lastMeasurement.uptime_percentage?.toFixed(3) ?? 'N/A'}%`);
  logInfo(`  P95 latency:      ${lastMeasurement.latency_p95_ms ?? 'N/A'}ms`);
  logInfo(`  Error rate:       ${lastMeasurement.error_rate != null ? (lastMeasurement.error_rate * 100).toFixed(2) + '%' : 'N/A'}`);
  logInfo(`  Within SLA:       ${lastMeasurement.is_within_sla ?? 'unknown'}`);
  logInfo(`  Open violations:  ${openViolations.length}`);

  logEndGroup();

  // Evaluate breach
  let breached = lastMeasurement.is_within_sla === false;

  // Override checks if custom thresholds supplied
  if (minUptimeStr) {
    const minUptime = parseFloat(minUptimeStr);
    if (!isNaN(minUptime) && lastMeasurement.uptime_percentage != null && lastMeasurement.uptime_percentage < minUptime) {
      breached = true;
      logWarning(`Uptime ${lastMeasurement.uptime_percentage.toFixed(3)}% is below custom threshold ${minUptime}%`);
    }
  }
  if (maxLatencyStr) {
    const maxLatency = parseFloat(maxLatencyStr);
    if (!isNaN(maxLatency) && lastMeasurement.latency_p95_ms != null && lastMeasurement.latency_p95_ms > maxLatency) {
      breached = true;
      logWarning(`P95 latency ${lastMeasurement.latency_p95_ms}ms exceeds custom threshold ${maxLatency}ms`);
    }
  }

  const status = breached ? 'breached' : 'ok';
  setOutput('sla-status', status);
  setOutput('uptime', String(lastMeasurement.uptime_percentage ?? ''));
  setOutput('latency-p95', String(lastMeasurement.latency_p95_ms ?? ''));
  setOutput('violations-count', String(openViolations.length));
  setOutput('within-sla', String(!breached));

  if (breached) {
    const msg = `SLA breached for API ${apiId}. Last window: uptime=${lastMeasurement.uptime_percentage?.toFixed(2)}%, p95=${lastMeasurement.latency_p95_ms}ms, open violations=${openViolations.length}`;
    if (failOnBreach) {
      logError(msg);
      process.exit(1);
    } else {
      logWarning(msg);
    }
  } else {
    logInfo(`✓ SLA check passed. Uptime: ${lastMeasurement.uptime_percentage?.toFixed(3)}%, P95: ${lastMeasurement.latency_p95_ms}ms`);
  }
}

run().catch((e) => {
  logError(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
