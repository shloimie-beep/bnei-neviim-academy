#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const outRoot = path.join(repoRoot, 'ops', 'live-smokes');

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

const positionalUrl = process.argv.slice(2).find((arg) => /^https?:\/\//i.test(arg));
const baseUrl = normalizeBaseUrl(
  argValue('--base-url', positionalUrl || process.env.ONETIME_BASE_URL || 'https://join.onetimeonetime.com')
);
const expectedSha = String(argValue('--expected-sha', process.env.BNA_EXPECT_DEPLOYED_SHA || '')).trim();

if (!baseUrl) {
  console.error('Pass --base-url or set ONETIME_BASE_URL.');
  process.exit(1);
}

async function fetchDeployInfo(checks) {
  const response = await fetch(`${baseUrl}/api/deploy-info`, { redirect: 'follow' });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Keep the raw status in the check below; do not echo the whole body.
  }
  checks.push({
    id: 'deploy_info_ok',
    passed: response.ok && json?.status === 'ok',
    detail: JSON.stringify({
      status: response.status,
      deploy_status: json?.status || null,
      target_app: json?.target_app || null,
      commit_sha: json?.commit_sha || null,
    }),
  });
  if (expectedSha) {
    checks.push({
      id: 'deploy_info_exact_sha',
      passed: new RegExp(`^${escapeRegExp(expectedSha)}$`).test(String(json?.commit_sha || '')),
      detail: JSON.stringify({ expected_sha: expectedSha, actual_sha: json?.commit_sha || null }),
    });
  }
  checks.push({
    id: 'deploy_info_one_time_target',
    passed: json?.target_app === 'one-time',
    detail: JSON.stringify({ target_app: json?.target_app || null }),
  });
  return json || {};
}

async function captureRoute(browser, route) {
  const page = await browser.newPage({ viewport: route.viewport || { width: 1280, height: 900 } });
  const failedRequests = [];
  const badResponses = [];
  const consoleErrors = [];

  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });
  page.on('response', (response) => {
    const url = response.url();
    if (response.status() >= 400 && !/favicon\.ico/i.test(url)) {
      badResponses.push(`${response.status()} ${url}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 });
  if (route.expectSelector) {
    await page.waitForSelector(route.expectSelector, { timeout: 15000 });
  }
  if (route.expectModuleKey) {
    await page.waitForFunction(
      (key) => Boolean(window.OneTimeProviderRouteModules?.[key]),
      route.expectModuleKey,
      { timeout: 15000 }
    );
  }

  const metrics = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[src]')].map((node) => node.getAttribute('src'));
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.getAttribute('href'));
    return {
      title: document.title,
      scripts,
      styles,
      routeModuleScripts: scripts.filter((src) => /one-time-provider-.*-route\.js/.test(src || '')),
      modules: Object.keys(window.OneTimeProviderRouteModules || {}).sort(),
      crmLoaded: document.documentElement.dataset.oneTimeProviderCrmRouteModule === 'loaded',
      mailboxLoaded: document.documentElement.dataset.oneTimeProviderMailboxRouteModule === 'loaded',
      communicationsLoaded: document.documentElement.dataset.oneTimeProviderCommunicationsRouteModule === 'loaded',
      hasCrmShell: Boolean(document.querySelector('[data-one-time-provider-crm-shell]')),
      hasCrmPlaceholder: Boolean(document.querySelector('[data-one-time-provider-crm-route-placeholder]')),
      activeCrmNav: Boolean(document.querySelector('[data-provider-nav="crm"].active')),
      visibleCrmSection: Boolean(document.querySelector('[data-provider-section="crm"]:not(.provider-section-hidden)')),
      hasOperationsCss: styles.includes('/css/operations-shell.css'),
      hasOperationsJs: scripts.includes('/js/operations-shell.js') || scripts.includes('/js/operations-deferred-renderers.js'),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  });
  await page.close();

  return {
    id: route.id,
    path: route.path,
    ...metrics,
    failedRequests,
    badResponses,
    consoleErrors,
  };
}

function routeById(routes, id) {
  return routes.find((route) => route.id === id) || {};
}

async function main() {
  await mkdir(outRoot, { recursive: true });
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(outRoot, `${stamp}-onetime-provider-route-module-live-smoke.json`);
  const mdPath = path.join(outRoot, `${stamp}-onetime-provider-route-module-live-smoke.md`);
  const checks = [];

  const deployInfo = await fetchDeployInfo(checks);
  const browser = await chromium.launch({ headless: true });
  let routes = [];
  try {
    routes = [
      await captureRoute(browser, {
        id: 'overview',
        path: '/provider.html?review=one-time',
      }),
      await captureRoute(browser, {
        id: 'crm',
        path: '/provider.html?review=one-time&section=crm',
        expectSelector: '[data-one-time-provider-crm-shell]',
        expectModuleKey: 'crm',
      }),
      await captureRoute(browser, {
        id: 'mailbox',
        path: '/provider.html?review=one-time&section=mailbox',
        expectModuleKey: 'mailbox',
      }),
      await captureRoute(browser, {
        id: 'communications',
        path: '/provider.html?review=one-time&section=communications',
        expectModuleKey: 'communications',
      }),
      await captureRoute(browser, {
        id: 'crm-mobile-390',
        path: '/provider.html?review=one-time&section=crm',
        viewport: { width: 390, height: 844 },
        expectSelector: '[data-one-time-provider-crm-shell]',
        expectModuleKey: 'crm',
      }),
    ];
  } finally {
    await browser.close();
  }

  const overview = routeById(routes, 'overview');
  const crm = routeById(routes, 'crm');
  const mailbox = routeById(routes, 'mailbox');
  const communications = routeById(routes, 'communications');
  const crmMobile = routeById(routes, 'crm-mobile-390');

  checks.push(
    {
      id: 'overview_no_route_module',
      passed: overview.routeModuleScripts?.length === 0 && overview.modules?.length === 0 && overview.hasCrmShell === false && overview.hasCrmPlaceholder === true,
      detail: JSON.stringify({
        modules: overview.modules || [],
        routeModuleScripts: overview.routeModuleScripts || [],
        hasCrmShell: overview.hasCrmShell,
        hasCrmPlaceholder: overview.hasCrmPlaceholder,
      }),
    },
    {
      id: 'crm_loads_only_crm_route_module',
      passed: JSON.stringify(crm.modules || []) === JSON.stringify(['crm']) &&
        crm.routeModuleScripts?.includes('/js/one-time-provider-crm-route.js') &&
        crm.hasCrmShell === true &&
        crm.crmLoaded === true &&
        crm.mailboxLoaded === false &&
        crm.communicationsLoaded === false,
      detail: JSON.stringify({
        modules: crm.modules || [],
        routeModuleScripts: crm.routeModuleScripts || [],
        hasCrmShell: crm.hasCrmShell,
        crmLoaded: crm.crmLoaded,
        mailboxLoaded: crm.mailboxLoaded,
        communicationsLoaded: crm.communicationsLoaded,
      }),
    },
    {
      id: 'mailbox_loads_only_mailbox_route_module',
      passed: JSON.stringify(mailbox.modules || []) === JSON.stringify(['mailbox']) &&
        mailbox.routeModuleScripts?.includes('/js/one-time-provider-mailbox-route.js') &&
        mailbox.hasCrmShell === false &&
        mailbox.mailboxLoaded === true &&
        mailbox.crmLoaded === false,
      detail: JSON.stringify({
        modules: mailbox.modules || [],
        routeModuleScripts: mailbox.routeModuleScripts || [],
        hasCrmShell: mailbox.hasCrmShell,
        crmLoaded: mailbox.crmLoaded,
        mailboxLoaded: mailbox.mailboxLoaded,
      }),
    },
    {
      id: 'communications_loads_only_communications_route_module',
      passed: JSON.stringify(communications.modules || []) === JSON.stringify(['communications']) &&
        communications.routeModuleScripts?.includes('/js/one-time-provider-communications-route.js') &&
        communications.hasCrmShell === false &&
        communications.communicationsLoaded === true &&
        communications.crmLoaded === false &&
        communications.mailboxLoaded === false,
      detail: JSON.stringify({
        modules: communications.modules || [],
        routeModuleScripts: communications.routeModuleScripts || [],
        hasCrmShell: communications.hasCrmShell,
        crmLoaded: communications.crmLoaded,
        mailboxLoaded: communications.mailboxLoaded,
        communicationsLoaded: communications.communicationsLoaded,
      }),
    },
    {
      id: 'crm_mobile_no_horizontal_overflow',
      passed: crmMobile.hasCrmShell === true && crmMobile.horizontalOverflow === false,
      detail: JSON.stringify({
        hasCrmShell: crmMobile.hasCrmShell,
        horizontalOverflow: crmMobile.horizontalOverflow,
        viewport: crmMobile.viewport || null,
      }),
    },
    {
      id: 'operations_assets_absent',
      passed: routes.every((route) => !route.hasOperationsCss && !route.hasOperationsJs),
      detail: JSON.stringify(routes.map((route) => ({
        id: route.id,
        hasOperationsCss: route.hasOperationsCss,
        hasOperationsJs: route.hasOperationsJs,
      }))),
    },
    {
      id: 'no_failed_requests_or_console_errors',
      passed: routes.every((route) => !route.failedRequests.length && !route.badResponses.length && !route.consoleErrors.length),
      detail: JSON.stringify(routes.map((route) => ({
        id: route.id,
        failed: route.failedRequests.length,
        bad: route.badResponses.length,
        console: route.consoleErrors.length,
      }))),
    },
  );

  const report = {
    status: checks.every((check) => check.passed) ? 'PASS' : 'FAIL',
    generated_at: generatedAt,
    base_url: baseUrl,
    expected_sha: expectedSha || null,
    deployed_sha: deployInfo.commit_sha || null,
    deployment_source: deployInfo.deployment_source || null,
    target_app: deployInfo.target_app || null,
    scope: 'Live One Time provider route-module smoke. Read-only/review routes only; no form submission, email, WhatsApp, CRM write, payment, access grant, provider mutation, or production data write.',
    routes,
    checks,
    external_write_performed: false,
    production_data_mutation_performed: false,
  };

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(mdPath, [
    '# One Time Provider Route Module Live Smoke',
    '',
    `Status: ${report.status}`,
    `Generated: ${report.generated_at}`,
    `Base URL: ${report.base_url}`,
    `Expected SHA: ${report.expected_sha || '(not supplied)'}`,
    `Deployed SHA: ${report.deployed_sha || '(unknown)'}`,
    `Target app: ${report.target_app || '(unknown)'}`,
    '',
    report.scope,
    '',
    '## Checks',
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...checks.map((check) => `| \`${check.id}\` | ${check.passed ? 'PASS' : 'FAIL'} | ${check.detail.replace(/\|/g, '\\|')} |`),
    '',
    '## Routes',
    '',
    '| Route | Modules | Route scripts | CRM shell | Overflow | Failed/Bad/Console |',
    '| --- | --- | --- | --- | --- | --- |',
    ...routes.map((route) => [
      `\`${route.path}\``,
      `\`${(route.modules || []).join(',') || '(none)'}\``,
      `\`${(route.routeModuleScripts || []).join(',') || '(none)'}\``,
      route.hasCrmShell ? 'yes' : 'no',
      route.horizontalOverflow ? 'yes' : 'no',
      `${route.failedRequests.length}/${route.badResponses.length}/${route.consoleErrors.length}`,
    ].join(' | ')).map((line) => `| ${line} |`),
    '',
    'No external send or production mutation was attempted.',
    '',
  ].join('\n'));

  console.log(JSON.stringify({
    ok: report.status === 'PASS',
    report: rel(mdPath),
    json: rel(jsonPath),
    deployed_sha: report.deployed_sha,
    target_app: report.target_app,
  }, null, 2));

  if (report.status !== 'PASS') process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
