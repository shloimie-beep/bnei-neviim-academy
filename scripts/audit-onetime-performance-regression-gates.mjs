#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, 'ops', 'performance-audits', '2026-07-13-onetime-performance-regression-gates');

function parseArgs(argv) {
  const parsed = {
    baseUrl: '',
    expectedSha: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') parsed.baseUrl = argv[++index] || '';
    else if (arg.startsWith('--base-url=')) parsed.baseUrl = arg.slice('--base-url='.length);
    else if (arg === '--expected-sha') parsed.expectedSha = argv[++index] || '';
    else if (arg.startsWith('--expected-sha=')) parsed.expectedSha = arg.slice('--expected-sha='.length);
  }
  parsed.baseUrl = String(parsed.baseUrl || '').replace(/\/+$/, '');
  parsed.expectedSha = String(parsed.expectedSha || '').trim();
  return parsed;
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileBytes(relativePath) {
  return fs.statSync(path.join(repoRoot, relativePath)).size;
}

function check(id, passed, detail, evidence = []) {
  return { id, passed: Boolean(passed), detail, evidence };
}

function hasServerTimingMetrics(header) {
  const value = String(header || '');
  return ['app;dur=', 'handler;dur=', 'db;dur=', 'pool;dur='].every((marker) => value.includes(marker));
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function safeDetail(value) {
  return String(value === undefined || value === null ? '' : value).replace(/\|/g, '\\|');
}

function oneTimeRailwayEnv() {
  const env = loadSmokeEnv({ root: repoRoot });
  return {
    ...env,
    OPS_USERNAME: '',
    OPS_PASSWORD: '',
    BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
    BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
    BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
  };
}

async function readLiveResponse(baseUrl, route, {
  method = 'GET',
  headers = {},
  body = null,
  cookie = null,
} = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      accept: 'application/json, text/html, text/plain, */*',
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie: `${cookie.name}=${cookie.value}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  return { response, text, json };
}

function responseHeaderProof(response) {
  const serverTiming = response.headers.get('server-timing') || '';
  const traceId = response.headers.get('x-bna-trace-id') || '';
  const deploySha = response.headers.get('x-bna-deploy-sha') || '';
  const targetApp = response.headers.get('x-bna-target-app') || '';
  const responseBytes = response.headers.get('x-bna-response-bytes') || '';
  return {
    server_timing: serverTiming,
    trace_id_present: Boolean(traceId),
    deploy_sha: deploySha,
    target_app: targetApp,
    response_bytes: responseBytes,
    has_required_server_timing_metrics: hasServerTimingMetrics(serverTiming),
  };
}

function assertLiveResponse(route, result, {
  expectedStatus = 200,
  expectedSha = '',
  requireTargetApp = true,
} = {}) {
  const proof = responseHeaderProof(result.response);
  if (result.response.status !== expectedStatus) {
    throw new Error(`${route} returned ${result.response.status}: ${result.text.slice(0, 500)}`);
  }
  if (!proof.has_required_server_timing_metrics) {
    throw new Error(`${route} did not include app/handler/db/pool Server-Timing metrics`);
  }
  if (!proof.trace_id_present) throw new Error(`${route} did not include X-BNA-Trace-Id`);
  if (expectedSha && proof.deploy_sha !== expectedSha) {
    throw new Error(`${route} deploy SHA mismatch: ${proof.deploy_sha || '(missing)'} !== ${expectedSha}`);
  }
  if (requireTargetApp && proof.target_app !== 'one-time') {
    throw new Error(`${route} target app mismatch: ${proof.target_app || '(missing)'}`);
  }
  if (!/^\d+$/.test(proof.response_bytes)) {
    throw new Error(`${route} did not include numeric X-BNA-Response-Bytes`);
  }
  return proof;
}

async function liveStep(liveChecks, id, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    liveChecks.push(check(id, true, `${Date.now() - started}ms`, details.evidence || []));
    liveChecks[liveChecks.length - 1].details = details;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    liveChecks.push(check(id, false, message, []));
  }
}

async function collectLiveChecks({ baseUrl, expectedSha }) {
  const liveChecks = [];
  let deployedSha = expectedSha;
  let cookie = null;

  await liveStep(liveChecks, 'live_deploy_info_headers', async () => {
    const result = await readLiveResponse(baseUrl, '/api/deploy-info');
    const proof = assertLiveResponse('/api/deploy-info', result, { expectedSha, requireTargetApp: true });
    if (!result.json || result.json.status !== 'ok') throw new Error('/api/deploy-info did not return ok JSON');
    if (result.json.target_app !== 'one-time') throw new Error(`/api/deploy-info target_app was ${result.json.target_app}`);
    deployedSha = result.json.commit_sha || deployedSha;
    if (expectedSha && deployedSha !== expectedSha) {
      throw new Error(`/api/deploy-info commit mismatch: ${deployedSha || '(missing)'} !== ${expectedSha}`);
    }
    return {
      commit_sha: deployedSha,
      target_app: result.json.target_app,
      header_proof: proof,
      evidence: ['https://join.onetimeonetime.com/api/deploy-info'],
    };
  });

  await liveStep(liveChecks, 'live_health_db_pool_timing', async () => {
    const result = await readLiveResponse(baseUrl, '/api/health');
    const proof = assertLiveResponse('/api/health', result, { expectedSha: deployedSha, requireTargetApp: true });
    if (!result.json || result.json.status !== 'ok') throw new Error('/api/health did not return ok JSON');
    if (result.json.database !== 'connected') throw new Error('/api/health database was not connected');
    if (!proof.server_timing.includes('queries:')) throw new Error('/api/health did not include db query count in Server-Timing');
    return {
      status: result.json.status,
      database: result.json.database,
      header_proof: proof,
      evidence: ['https://join.onetimeonetime.com/api/health'],
    };
  });

  await liveStep(liveChecks, 'live_one_time_shell_rum_loaded', async () => {
    const result = await readLiveResponse(baseUrl, '/one-time');
    const proof = assertLiveResponse('/one-time', result, { expectedSha: deployedSha, requireTargetApp: true });
    if (!result.text.includes('/js/one-time-performance-rum.js')) {
      throw new Error('/one-time did not include the RUM client script');
    }
    return {
      rum_client_loaded: true,
      html_bytes_seen: result.text.length,
      header_proof: proof,
      evidence: ['https://join.onetimeonetime.com/one-time'],
    };
  });

  await liveStep(liveChecks, 'live_rum_dry_run_contract', async () => {
    const result = await readLiveResponse(baseUrl, '/api/performance/rum?dry_run=true', {
      method: 'POST',
      body: {
        metric_name: 'route_transition',
        metric_value_ms: 12.3,
        route_path: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&contact=john@example.com&phone=15551234567',
        route_id: 'one_time_operations_contact_redaction_probe',
        viewport: { width: 430, height: 932 },
        no_pii_contract: true,
        idempotency_key: `live-proof-${Date.now()}`,
      },
    });
    const proof = assertLiveResponse('/api/performance/rum?dry_run=true', result, { expectedSha: deployedSha, requireTargetApp: true });
    if (!result.json || result.json.success !== true) throw new Error('RUM dry run did not return success');
    if (result.json.dry_run !== true) throw new Error('RUM dry run did not report dry_run=true');
    if (result.json.external_write_performed !== false) throw new Error('RUM dry run reported an external write');
    if (result.json.no_pii_contract !== true) throw new Error('RUM dry run did not preserve the no-PII contract');
    return {
      code: result.json.code,
      dry_run: result.json.dry_run,
      target_app: result.json.target_app,
      route_id: result.json.route_id,
      external_write_performed: result.json.external_write_performed,
      header_proof: proof,
      evidence: ['https://join.onetimeonetime.com/api/performance/rum?dry_run=true'],
    };
  });

  await liveStep(liveChecks, 'live_scoped_operations_crm_headers', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv(), cwd: repoRoot });
    if (!login.cookie?.value) throw new Error(login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    const result = await readLiveResponse(
      baseUrl,
      '/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&sort=last_activity_desc&limit=1',
      { cookie }
    );
    const proof = assertLiveResponse('/api/bna/crm/contacts', result, { expectedSha: deployedSha, requireTargetApp: true });
    if (!result.json || !Array.isArray(result.json.cards)) throw new Error('Scoped CRM contacts response did not include cards array');
    const wrongWorkspace = result.json.cards.find((card) => card.workspace_key && card.workspace_key !== 'rabbi_sheller_provider');
    const wrongProject = result.json.cards.find((card) => card.project_key && card.project_key !== 'one_time_mishnah_class');
    if (wrongWorkspace) throw new Error('Scoped CRM contacts included a different workspace');
    if (wrongProject) throw new Error('Scoped CRM contacts included a different project');
    return {
      auth_source: login.source,
      cards_count: result.json.cards.length,
      filtered_total: Number(result.json.filtered_total || result.json.cards.length || 0),
      external_write_performed: result.json.external_write_performed === true,
      header_proof: proof,
      evidence: ['https://join.onetimeonetime.com/api/bna/crm/contacts'],
    };
  });

  return {
    base_url: baseUrl,
    expected_sha: expectedSha,
    deployed_sha: deployedSha,
    checks: liveChecks,
  };
}

function collectLocalAudit() {
  const server = readText('server.js');
  const rum = readText('public/js/one-time-performance-rum.js');
  const oneTimeLanding = readText('public/one-time/index.html');
  const provider = readText('public/provider.html');
  const operationsSource = readText('public/operations.html');
  const operationsBootstrap = readText('public/operations-bootstrap.html');

  const budgets = {
    rum_bytes: { actual: fileBytes('public/js/one-time-performance-rum.js'), max: 7000 },
    provider_html_bytes: { actual: fileBytes('public/provider.html'), max: 190000 },
    operations_shell_bytes: { actual: fileBytes('public/js/operations-shell.js'), max: 1200000 },
    operations_bootstrap_bytes: { actual: fileBytes('public/operations-bootstrap.html'), max: 5000 },
    crm_route_module_bytes: { actual: fileBytes('public/js/one-time-provider-crm-route.js'), max: 12000 },
    mailbox_route_module_bytes: { actual: fileBytes('public/js/one-time-provider-mailbox-route.js'), max: 20000 },
    communications_route_module_bytes: { actual: fileBytes('public/js/one-time-provider-communications-route.js'), max: 5000 },
    billing_route_module_bytes: { actual: fileBytes('public/js/one-time-provider-billing-route.js'), max: 22000 },
  };

  const checks = [
    check('server_timing_headers', ['Server-Timing', 'X-BNA-Trace-Id', 'X-BNA-Response-Bytes', 'X-BNA-Deploy-SHA'].every((marker) => server.includes(marker)), 'Server emits trace/deploy/response-size timing headers.', ['server.js']),
    check('db_pool_timing_wrapped', ['instrumentPoolForPerformance(pool)', "recordDbPerformance('db'", "recordDbPerformance('pool'"].every((marker) => server.includes(marker)), 'Pool query/connect and client query paths record db/pool timing.', ['server.js']),
    check('rum_endpoint_registered', ["app.post('/api/performance/rum'", 'bna_performance_events', 'PERFORMANCE_RUM_ACCEPTED'].every((marker) => server.includes(marker)), 'Privacy-safe browser RUM endpoint and table are registered.', ['server.js']),
    check('rum_route_path_sanitized_server', ['sanitizePerformanceRoutePath', '[redacted-contact]', '[redacted-email]', '[redacted-number]'].every((marker) => server.includes(marker)), 'Server sanitizes route paths before storing RUM.', ['server.js']),
    check('rum_client_entrypoints', [oneTimeLanding, provider, operationsSource, operationsBootstrap].every((html) => html.includes('/js/one-time-performance-rum.js')), 'One Time landing, provider shell, Operations source, and generated bootstrap load the RUM client.', ['public/one-time/index.html', 'public/provider.html', 'public/operations.html', 'public/operations-bootstrap.html']),
    check('rum_client_privacy_contract', ['safeRoutePath', '[redacted-contact]', '[redacted-email]', '[redacted-number]', 'no_pii_contract'].every((marker) => rum.includes(marker)) && !/document\.cookie|localStorage|innerText|textContent/.test(rum), 'RUM client redacts route details and avoids cookies/localStorage/DOM text capture.', ['public/js/one-time-performance-rum.js']),
    check('rum_client_route_transition', ['pushState', 'replaceState', 'popstate', 'route_transition'].every((marker) => rum.includes(marker)), 'RUM client records SPA route transitions as a separate metric.', ['public/js/one-time-performance-rum.js']),
    ...Object.entries(budgets).map(([id, budget]) => check(
      `budget_${id}`,
      budget.actual <= budget.max,
      `${budget.actual} <= ${budget.max} bytes`,
      ['public/js/one-time-performance-rum.js', 'public/provider.html', 'public/js/operations-shell.js', 'public/operations-bootstrap.html']
    )),
  ];

  return { budgets, checks };
}

function writeReports(report) {
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'report.json');
  const mdPath = path.join(outDir, 'report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    '# One Time Performance Regression Gates',
    '',
    `Generated: ${report.generated_at}`,
    `Requirement: ${report.requirement_id}`,
    `Status: ${report.status.toUpperCase()}`,
    '',
    report.scope,
    '',
    '## Local Checks',
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...report.checks.map((item) => `| \`${item.id}\` | ${item.passed ? 'PASS' : 'FAIL'} | ${safeDetail(item.detail)} |`),
    '',
    '## Budgets',
    '',
    '| Budget | Actual | Max |',
    '| --- | ---: | ---: |',
    ...Object.entries(report.budgets).map(([id, budget]) => `| \`${id}\` | ${budget.actual} | ${budget.max} |`),
  ];

  if (report.live) {
    lines.push(
      '',
      '## Live Checks',
      '',
      `Base URL: ${report.live.base_url}`,
      `Expected SHA: ${report.live.expected_sha || '(not required)'}`,
      `Observed SHA: ${report.live.deployed_sha || '(not reported)'}`,
      '',
      '| Check | Status | Detail |',
      '| --- | --- | --- |',
      ...report.live.checks.map((item) => `| \`${item.id}\` | ${item.passed ? 'PASS' : 'FAIL'} | ${safeDetail(item.detail)} |`),
    );
  }

  lines.push(
    '',
    '## Guardrails',
    '',
    '- Local checks do not read contact data, raw message bodies, owner destinations, cookies, tokens, sends, payments, provider mutations, Railway mutations, or production data.',
    '- Live checks are read-only except for an explicit RUM dry run, which returns `external_write_performed=false` and does not store an event.',
    '- Operations readback records counts and workspace guard flags only.',
  );
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const local = collectLocalAudit();
  const live = args.baseUrl ? await collectLiveChecks(args) : null;
  const allChecks = [...local.checks, ...(live?.checks || [])];
  const report = {
    generated_at: new Date().toISOString(),
    requirement_id: 'REQ-20260713-911',
    status: allChecks.every((item) => item.passed) ? 'passed' : 'failed',
    scope: live
      ? 'Local and production One Time performance instrumentation, budget, Server-Timing, trace-header, route RUM, and scoped CRM readback gate.'
      : 'Local One Time performance instrumentation and regression-gate audit. No database, live HTTP, sends, payments, external accounts, or production writes.',
    budgets: local.budgets,
    checks: local.checks,
    live,
  };
  const paths = writeReports(report);
  if (report.status !== 'passed') {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    ok: true,
    report: relative(paths.mdPath),
    json: relative(paths.jsonPath),
    live: Boolean(live),
    deployed_sha: live?.deployed_sha || '',
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
