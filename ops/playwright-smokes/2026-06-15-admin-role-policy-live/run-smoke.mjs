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
  ['role policy renderer exists', /function renderAdminRolesPolicyPanel/.test(operationsHtml)],
  ['role policy matrix marker exists', /data-role-access-policy-matrix/.test(operationsHtml)],
  ['spouse policy is visible', /Second Parent \/ Spouse/.test(operationsHtml)],
  ['provider rabbi policy is visible', /Service Provider \/ Rabbi Sheller/.test(operationsHtml)],
  ['community policy is visible', /Community Member/.test(operationsHtml)],
  ['agent lifecycle policy is visible', /Codex \/ Agent Work/.test(operationsHtml)],
  ['no-write guardrail copy exists', /This page does not create invitations, login tokens, password resets, email sends, WhatsApp sends, access grants, billing changes, or external connector writes/.test(operationsHtml)],
  ['approval gates are named', /APPROVE_PARENT_WEEKLY_UPDATE_SEND/.test(operationsHtml) && /APPROVE_GOOGLE_LIVE_ADAPTER_TEST/.test(operationsHtml) && /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static role policy contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
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

const returnTo = encodeURIComponent('/operations?workspace=platform&view=admin&section=roles');
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 20000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
countWrites = true;
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('[data-role-access-policy-matrix]', { timeout: 20000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

const desktopMetrics = await page.evaluate(() => ({
  hasMatrix: Boolean(document.querySelector('[data-role-access-policy-matrix]')),
  hasSuperAdmin: document.body.textContent.includes('Super Admin / Operator'),
  hasBnaAdmin: document.body.textContent.includes('BNA School Admin / Rabbi'),
  hasSpousePolicy: document.body.textContent.includes('Second Parent / Spouse') && document.body.textContent.includes('Policy Needed'),
  hasProviderRabbi: document.body.textContent.includes('Service Provider / Rabbi Sheller'),
  hasCommunityMember: document.body.textContent.includes('Community Member'),
  hasCodexLifecycle: document.body.textContent.includes('Codex / Agent Work'),
  hasNoWriteCopy: document.body.textContent.includes('This page does not create invitations, login tokens, password resets, email sends, WhatsApp sends, access grants, billing changes, or external connector writes'),
  hasApprovalGates: document.body.textContent.includes('APPROVE_PARENT_WEEKLY_UPDATE_SEND')
    && document.body.textContent.includes('SEND_PARENT_PASSWORD_SETUP')
    && document.body.textContent.includes('APPROVE_GOOGLE_LIVE_ADAPTER_TEST')
    && document.body.textContent.includes('APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForSelector('[data-role-access-policy-matrix]', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });
const mobileMetrics = await page.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  hasMatrix: Boolean(document.querySelector('[data-role-access-policy-matrix]')),
  hasNoWriteCopy: document.body.textContent.includes('This page does not create invitations, login tokens, password resets, email sends, WhatsApp sends, access grants, billing changes, or external connector writes'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await browser.close();

if (!desktopMetrics.hasMatrix || !desktopMetrics.hasSuperAdmin || !desktopMetrics.hasBnaAdmin || !desktopMetrics.hasSpousePolicy || !desktopMetrics.hasProviderRabbi || !desktopMetrics.hasCommunityMember || !desktopMetrics.hasCodexLifecycle || !desktopMetrics.hasNoWriteCopy || !desktopMetrics.hasApprovalGates || !desktopMetrics.noHorizontalOverflow) {
  throw new Error(`Desktop role policy metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
if (!mobileMetrics.hasMatrix || !mobileMetrics.hasNoWriteCopy || !mobileMetrics.noHorizontalOverflow) {
  throw new Error(`Mobile role policy metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
if (writeRequests.length) {
  throw new Error(`Role policy view made unexpected write requests: ${JSON.stringify(writeRequests)}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}/operations?workspace=platform&view=admin&section=roles`;
const report = `# Admin Role Policy ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations rendered Admin > Roles as a read-only role/access policy matrix and did not create invitations, grants, sends, tokens, billing changes, or connector writes.

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

No invitation, login token, password reset, email, WhatsApp, access grant, billing change, Google/Drive action, Buffer/social action, One Time publishing action, external connector write, or external CRM write was triggered. This is a read-only policy/readback surface.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, desktopMetrics, mobileMetrics, writeRequests }, null, 2));
