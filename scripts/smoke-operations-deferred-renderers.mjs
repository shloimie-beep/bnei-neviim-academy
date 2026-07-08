#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BASE_URL = (process.argv.find((arg) => arg.startsWith('--base='))?.slice(7)
  || process.env.PERF_AUDIT_BASE_URL
  || 'http://127.0.0.1:8098').replace(/\/+$/, '');

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function cookiePair(setCookie = '') {
  return String(setCookie || '').split(';')[0] || '';
}

function resolveOpsCredentials() {
  const candidates = [
    ['ONE_TIME_OPS_USERNAME', 'ONE_TIME_OPS_PASSWORD'],
    ['OPS_USERNAME', 'OPS_PASSWORD'],
  ];
  for (const [usernameKey, passwordKey] of candidates) {
    const username = process.env[usernameKey] || '';
    const password = process.env[passwordKey] || '';
    if (username && password) return { username, password, source: usernameKey.replace(/_USERNAME$/, '') };
  }
  return { username: '', password: '', source: '' };
}

async function loginOperations(credentials) {
  if (!credentials.username || !credentials.password) {
    throw new Error('Operations credentials are missing.');
  }
  const response = await fetch(`${BASE_URL}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(credentials.username, credentials.password),
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });
  const cookie = cookiePair(response.headers.get('set-cookie'));
  if (!response.ok || !cookie.includes('=')) {
    throw new Error(`Operations login failed with status ${response.status}.`);
  }
  return cookie;
}

function assertSmoke(condition, message, details = null) {
  if (condition) return;
  if (details) console.error(JSON.stringify(details, null, 2));
  throw new Error(message);
}

loadEnvFile(process.env.BNA_LOCAL_ENV_FILE);
loadEnvFile(process.env.BNA_ENV_FILE);
loadEnvFile(path.join(ROOT, '.env.local'));

const credentials = resolveOpsCredentials();
const cookie = await loginOperations(credentials);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  extraHTTPHeaders: { cookie },
});
const consoleMessages = [];
const failedRequests = [];
const requestedUrls = [];
page.on('console', (message) => consoleMessages.push({ type: message.type(), text: message.text() }));
page.on('pageerror', (error) => consoleMessages.push({ type: 'pageerror', text: error.message }));
page.on('request', (request) => {
  const url = request.url();
  if (url.includes('/operations') || url.includes('/js/operations')) requestedUrls.push(url);
});
page.on('requestfailed', (request) => failedRequests.push({
  url: request.url(),
  failure: request.failure()?.errorText || 'request failed',
}));

const operationsPath = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview';
const navigationStart = Date.now();
await page.goto(`${BASE_URL}${operationsPath}`, { waitUntil: 'networkidle', timeout: 20000 });
const initialNavigationMs = Date.now() - navigationStart;
const initial = await page.evaluate(() => ({
  title: document.title,
  nodeCount: document.querySelectorAll('*').length,
  hasShell: Boolean(document.querySelector('.ops-app-shell')),
  deferredLoaded: Boolean(window.__operationsDeferredRenderersLoaded),
  scriptUrls: [...document.scripts].map((script) => script.src).filter(Boolean),
  bodyText: document.body.innerText.slice(0, 1200),
}));

const initialDebug = { initial, consoleMessages, failedRequests, requestedUrls };
assertSmoke(initial.hasShell, 'Operations app shell did not render.', initialDebug);
assertSmoke(initial.nodeCount > 300, `Operations initial DOM is too small: ${initial.nodeCount}.`, initialDebug);
assertSmoke(!initial.deferredLoaded, 'Deferred renderer chunk loaded during initial Program overview.', initialDebug);
assertSmoke(!initial.scriptUrls.some((url) => url.includes('/js/operations-deferred-renderers.js')), 'Deferred renderer script was attached before opening a deferred view.', initialDebug);

const beforeDeferredRequests = requestedUrls.filter((url) => url.includes('/js/operations-deferred-renderers.js')).length;
await page.evaluate(() => window.switchView('content'));
await page.waitForFunction(() => Boolean(window.__operationsDeferredRenderersLoaded), null, { timeout: 10000 });
await page.waitForFunction(() => /Content|Library|One Time Library/i.test(document.body.innerText || ''), null, { timeout: 10000 });
const after = await page.evaluate(() => ({
  nodeCount: document.querySelectorAll('*').length,
  deferredLoaded: Boolean(window.__operationsDeferredRenderersLoaded),
  hasContentRenderer: typeof window.renderContent === 'function',
  bodyText: document.body.innerText.slice(0, 1200),
  scriptUrls: [...document.scripts].map((script) => script.src).filter(Boolean),
}));
const afterDeferredRequests = requestedUrls.filter((url) => url.includes('/js/operations-deferred-renderers.js')).length;

assertSmoke(after.deferredLoaded, 'Deferred renderer chunk did not load after opening Content.');
assertSmoke(after.hasContentRenderer, 'Content renderer is not available after deferred chunk load.');
assertSmoke(afterDeferredRequests > beforeDeferredRequests, 'Deferred renderer request was not observed.');
assertSmoke(!failedRequests.length, `Requests failed: ${JSON.stringify(failedRequests)}`);
const seriousConsole = consoleMessages.filter((item) => item.type === 'error' || item.type === 'pageerror');
assertSmoke(!seriousConsole.length, `Console errors: ${JSON.stringify(seriousConsole)}`);

await browser.close();

console.log(JSON.stringify({
  ok: true,
  base_url: BASE_URL,
  auth_source: credentials.source,
  initial_navigation_ms: initialNavigationMs,
  initial: {
    node_count: initial.nodeCount,
    deferred_loaded: initial.deferredLoaded,
    script_count: initial.scriptUrls.length,
  },
  after_deferred_view: {
    node_count: after.nodeCount,
    deferred_loaded: after.deferredLoaded,
    has_content_renderer: after.hasContentRenderer,
    deferred_request_count: afterDeferredRequests,
  },
  external_write_performed: false,
}, null, 2));
