import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8094';
const username = process.env.OPS_USERNAME;
const password = process.env.OPS_PASSWORD;
const outDir = process.env.SMOKE_OUT_DIR || path.resolve('ops/playwright-smokes/2026-06-18-admin-comms-integrations-local');

if (!username || !password) {
  throw new Error('OPS_USERNAME and OPS_PASSWORD are required in environment for local smoke login.');
}

fs.mkdirSync(outDir, { recursive: true });

const requests = [];
const assertions = [];
const screenshots = [];

function record(ok, message, detail = {}) {
  assertions.push({ ok: Boolean(ok), message, detail });
  if (!ok) {
    const error = new Error(message);
    error.detail = detail;
    throw error;
  }
}

function requestUrls(pattern) {
  return requests.filter((url) => pattern.test(url));
}

function hasRequest(pattern) {
  return requestUrls(pattern).length > 0;
}

function scopedRequestFor(pathPattern, projectKey) {
  return requests.some((url) => {
    if (!pathPattern.test(url)) return false;
    const parsed = new URL(url, baseUrl);
    return parsed.searchParams.get('project_key') === projectKey;
  });
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  screenshots.push(file);
}

async function gotoOps(page, params) {
  const url = new URL('/operations', baseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('request', (request) => {
  const url = request.url();
  if (url.includes('/api/bna/') || url.includes('/api/operations/')) requests.push(url);
});

try {
  const returnTo = encodeURIComponent('/operations?workspace=bna&view=admin&section=users');
  await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await Promise.all([
    page.waitForURL(/\/operations/, { timeout: 20000 }),
    page.click('#submitBtn'),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  record(scopedRequestFor(/\/api\/bna\/people/, 'bna'), 'BNA Admin > Users requests people with project_key=bna.');
  await shot(page, 'bna-admin-users-mobile');

  requests.length = 0;
  await gotoOps(page, { workspace: 'bna', view: 'communications', section: 'overview' });
  record(scopedRequestFor(/\/api\/bna\/contact-communications/, 'bna'), 'BNA Communications requests contact communications with project_key=bna.');
  await shot(page, 'bna-communications-mobile');

  requests.length = 0;
  await gotoOps(page, { workspace: 'bna', view: 'integrations', section: 'communications' });
  record(scopedRequestFor(/\/api\/bna\/communications\/social\/drafts/, 'bna'), 'BNA Communications Integrations requests social drafts with project_key=bna.');
  record(scopedRequestFor(/\/api\/bna\/communications\/email\/drafts/, 'bna'), 'BNA Communications Integrations requests email drafts with project_key=bna.');
  record(scopedRequestFor(/\/api\/bna\/communications\/dns-tasks/, 'bna'), 'BNA Communications Integrations requests DNS tasks with project_key=bna.');
  await shot(page, 'bna-integrations-communications-mobile');

  requests.length = 0;
  await gotoOps(page, { workspace: 'bna', view: 'automations', section: 'center' });
  record(scopedRequestFor(/\/api\/bna\/automations/, 'bna'), 'BNA Automations requests automations with project_key=bna.');
  await shot(page, 'bna-automations-mobile');

  requests.length = 0;
  await gotoOps(page, { workspace: 'bna', view: 'integrations', section: 'readiness' });
  const bnaBody = await page.locator('body').innerText({ timeout: 10000 });
  record(!hasRequest(/\/api\/bna\/integrations\/status/), 'BNA Integrations readiness deep link does not fetch global integration status.');
  record(!/Integration Readiness/.test(bnaBody), 'BNA Integrations readiness deep link does not render global Integration Readiness.');
  await shot(page, 'bna-integrations-readiness-hidden-mobile');

  await page.setViewportSize({ width: 1440, height: 900 });
  requests.length = 0;
  await gotoOps(page, { workspace: 'platform', view: 'integrations', section: 'readiness' });
  const platformBody = await page.locator('body').innerText({ timeout: 10000 });
  record(hasRequest(/\/api\/bna\/integrations\/status/), 'Platform Integrations readiness fetches global integration status explicitly.');
  record(/Integration Readiness/.test(platformBody), 'Platform Integrations readiness renders global Integration Readiness.');
  await shot(page, 'platform-integrations-readiness-desktop');

  requests.length = 0;
  await gotoOps(page, { workspace: 'rabbi_sheller_provider', view: 'automations', section: 'center' });
  record(scopedRequestFor(/\/api\/bna\/automations/, 'one_time_mishnah_class'), 'One Time provider Automations requests automations with project_key=one_time_mishnah_class.');
  await shot(page, 'onetime-automations-desktop');

  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth > document.body.clientWidth + 1,
    doc: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  record(!overflow.body && !overflow.doc, 'No body/document horizontal overflow on final desktop viewport.', overflow);

  const report = {
    result: 'passed',
    baseUrl,
    assertions,
    screenshots: screenshots.map((file) => path.relative(process.cwd(), file).replace(/\\/g, '/')),
    request_count: requests.length,
    checked_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'report.md'), [
    '# Admin / Communications / Integrations Local Smoke - 2026-06-18',
    '',
    'Result: passed',
    '',
    `Checked local Operations on ${baseUrl} with throwaway local Operations credentials.`,
    '',
    '## Assertions',
    ...assertions.map((item) => `- ${item.message}`),
    '',
    '## Screenshots',
    ...report.screenshots.map((file) => `- ${file}`),
    '',
  ].join('\n'));
} catch (error) {
  const report = {
    result: 'failed',
    baseUrl,
    error: error.message,
    detail: error.detail || null,
    assertions,
    screenshots: screenshots.map((file) => path.relative(process.cwd(), file).replace(/\\/g, '/')),
    requests,
    checked_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'report.md'), [
    '# Admin / Communications / Integrations Local Smoke - 2026-06-18',
    '',
    'Result: failed',
    '',
    `Error: ${error.message}`,
    '',
    '## Assertions',
    ...assertions.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.message}`),
    '',
  ].join('\n'));
  throw error;
} finally {
  await browser.close();
}
