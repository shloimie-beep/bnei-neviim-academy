import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, 'ops', 'performance-audits', '2026-07-13-onetime-performance-regression-gates');

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileBytes(relativePath) {
  return fs.statSync(path.join(repoRoot, relativePath)).size;
}

function check(id, passed, detail, evidence = []) {
  return { id, passed: Boolean(passed), detail, evidence };
}

function assertIncludes(text, pattern) {
  return pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern);
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
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

  const report = {
    generated_at: new Date().toISOString(),
    requirement_id: 'REQ-20260713-911',
    status: checks.every((item) => item.passed) ? 'passed' : 'failed',
    scope: 'Local One Time performance instrumentation and regression-gate audit. No database, live HTTP, sends, payments, external accounts, or production writes.',
    budgets,
    checks,
  };

  fs.writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    '# One Time Performance Regression Gates',
    '',
    `Generated: ${report.generated_at}`,
    `Requirement: ${report.requirement_id}`,
    `Status: ${report.status.toUpperCase()}`,
    '',
    report.scope,
    '',
    '## Checks',
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...checks.map((item) => `| \`${item.id}\` | ${item.passed ? 'PASS' : 'FAIL'} | ${String(item.detail).replace(/\|/g, '\\|')} |`),
    '',
    '## Budgets',
    '',
    '| Budget | Actual | Max |',
    '| --- | ---: | ---: |',
    ...Object.entries(budgets).map(([id, budget]) => `| \`${id}\` | ${budget.actual} | ${budget.max} |`),
    '',
    '## Guardrails',
    '',
    '- No browser screenshots, contact data, raw message bodies, owner destinations, cookies, tokens, sends, payments, provider mutations, Railway mutations, or production data writes are performed by this audit.',
    '- RUM payload checks are marker and size checks only; live storage proof is handled by deployment smoke/readback.',
  ];
  fs.writeFileSync(path.join(outDir, 'report.md'), `${lines.join('\n')}\n`);

  if (report.status !== 'passed') {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    ok: true,
    report: path.relative(repoRoot, path.join(outDir, 'report.md')).replace(/\\/g, '/'),
    json: path.relative(repoRoot, path.join(outDir, 'report.json')).replace(/\\/g, '/'),
  }, null, 2));
}

main();
