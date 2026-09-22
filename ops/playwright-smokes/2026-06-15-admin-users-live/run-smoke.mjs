import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function parseEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const result = {};
    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator <= 0) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

const root = process.cwd();
const env = { ...(await parseEnvFile(path.join(root, '.env.local'))), ...process.env };
const smokeDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = env.SMOKE_OUT_DIR ? path.resolve(root, env.SMOKE_OUT_DIR) : smokeDir;
await fs.mkdir(outDir, { recursive: true });

const operationsHtml = await fs.readFile(path.join(root, 'public', 'operations.html'), 'utf8');
const contractChecks = [
  ['admin users renderer exists', /function renderAdminUsersPanel/.test(operationsHtml)],
  ['super-admin user management marker exists', /data-super-admin-user-management/.test(operationsHtml)],
  ['external users row builder exists', /function adminExternalUserRows/.test(operationsHtml)],
  ['external user account marker exists', /data-external-user-account/.test(operationsHtml)],
  ['access-link action is wired', /createAdminOpsAccessLink/.test(operationsHtml) && /api\.createOpsAccessLink/.test(operationsHtml)],
  ['parent-account separation copy exists', /External provider\/Rabbi users are project members or Operations identities, not parent portal accounts/.test(operationsHtml)],
  ['no-send guardrail copy exists', /No email, WhatsApp, password reset, billing, member-library, or external connector write runs from this panel/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static Admin Users contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = (env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080').replace(/\/$/, '');
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';
if (!username || !password) throw new Error('Smoke Operations credentials are required');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const writeRequests = [];
let countWrites = false;

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('request', (request) => {
  if (!countWrites) return;
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method())) return;
  if (/\/api\/bna\/logout\b/.test(request.url())) return;
  writeRequests.push({ method: request.method(), url: request.url() });
});

const returnTo = encodeURIComponent('/operations?workspace=platform&view=admin&section=users');
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 20000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
countWrites = true;
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('[data-super-admin-user-management]', { timeout: 20000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

const desktopMetrics = await page.evaluate(() => {
  const panel = document.querySelector('[data-super-admin-user-management]');
  const text = panel ? panel.textContent : '';
  return {
    hasPanel: Boolean(panel),
    hasUsersExternalAccess: text.includes('Users / External Access'),
    hasExternalUsers: text.includes('External Users'),
    hasInternalUsers: text.includes('Internal Users'),
    hasAccessLinkGate: text.includes('Access Link Gate'),
    hasParentSeparation: text.includes('Parent account separation'),
    hasOneTimeCredentialsBoundary: text.includes('One Time app credentials'),
    hasNoWriteCopy: text.includes('No email, WhatsApp, password reset, billing, member-library, or external connector write runs from this panel'),
    hasNoNaN: !text.includes('NaN'),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
  };
});

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForSelector('[data-super-admin-user-management]', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });
const mobileMetrics = await page.evaluate(() => {
  const panel = document.querySelector('[data-super-admin-user-management]');
  const text = panel ? panel.textContent : '';
  return {
    viewport: { width: innerWidth, height: innerHeight },
    hasPanel: Boolean(panel),
    hasNoWriteCopy: text.includes('No email, WhatsApp, password reset, billing, member-library, or external connector write runs from this panel'),
    hasNoNaN: !text.includes('NaN'),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
  };
});

await browser.close();

if (
  !desktopMetrics.hasPanel ||
  !desktopMetrics.hasUsersExternalAccess ||
  !desktopMetrics.hasExternalUsers ||
  !desktopMetrics.hasInternalUsers ||
  !desktopMetrics.hasAccessLinkGate ||
  !desktopMetrics.hasParentSeparation ||
  !desktopMetrics.hasOneTimeCredentialsBoundary ||
  !desktopMetrics.hasNoWriteCopy ||
  !desktopMetrics.hasNoNaN ||
  !desktopMetrics.noHorizontalOverflow
) {
  throw new Error(`Desktop Admin Users metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
if (!mobileMetrics.hasPanel || !mobileMetrics.hasNoWriteCopy || !mobileMetrics.hasNoNaN || !mobileMetrics.noHorizontalOverflow) {
  throw new Error(`Mobile Admin Users metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
if (writeRequests.length) {
  throw new Error(`Admin Users view made unexpected write requests: ${JSON.stringify(writeRequests)}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}/operations?workspace=platform&view=admin&section=users`;
const report = `# Admin Users ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations rendered Admin > Users as a super-admin user
management readback with external users separated from parent accounts.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

- PASS desktop metrics: ${JSON.stringify(desktopMetrics)}
- PASS mobile metrics: ${JSON.stringify(mobileMetrics)}
- PASS unexpected write requests after login: ${writeRequests.length}

## Screenshots

- ${screenshotPrefix}desktop.png
- ${screenshotPrefix}mobile.png

## Guardrails

No email, WhatsApp, password reset, parent account creation, billing link,
Zoom/access change, member-library publish, Google/Drive action, Buffer/social
action, external connector write, or external CRM write was triggered. The
access-link action is visible as a guarded click path only and was not invoked
by this readback smoke.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, desktopMetrics, mobileMetrics, writeRequests }, null, 2));
