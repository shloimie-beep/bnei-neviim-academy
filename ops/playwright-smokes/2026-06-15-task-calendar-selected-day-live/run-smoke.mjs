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
  ['selected day renderer exists', /function renderTaskSelectedDayPanel/.test(operationsHtml)],
  ['selected label copy exists', /Selected: \$\{escapeHtml\(selectedLabel\)\}/.test(operationsHtml)],
  ['selected label formatter exists', /function selectedTaskCalendarLabel/.test(operationsHtml)],
  ['Google dry-run button exists', /Google dry-run/.test(operationsHtml)],
  ['Google dry-run handler exists', /function previewSelectedDateGoogleCalendarDryRun/.test(operationsHtml)],
  ['Google dry-run uses action registry', /action_id: 'sync_google_calendar'/.test(operationsHtml)],
  ['Google dry-run is dry-run only', /dry_run: true/.test(operationsHtml) && /no_google_calendar_write: true/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static task calendar contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = (env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080').replace(/\/$/, '');
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';
if (!username || !password) throw new Error('Smoke Operations credentials are required');

const selectedDate = env.SMOKE_SELECTED_DATE || '2026-06-22';
const targetPath = `/operations?workspace=bna&view=tasks&section=schedule&calendar_mode=day&date=${selectedDate}`;
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

const returnTo = encodeURIComponent(targetPath);
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 20000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
countWrites = true;
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('.task-calendar-day-panel', { timeout: 20000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

const desktopMetrics = await page.evaluate(() => {
  const panel = document.querySelector('.task-calendar-day-panel');
  const text = panel ? panel.textContent : '';
  return {
    hasPanel: Boolean(panel),
    hasSelectedLabel: /Selected:\s+\w+,\s+\w+\s+\d{1,2},\s+20\d{2}/.test(text),
    hasHebrewDate: /5786/.test(text),
    hasAddTask: text.includes('Add task to this date'),
    hasMoveTask: text.includes('Move selected task to this date'),
    hasGoogleDryRun: text.includes('Google dry-run'),
    hasNoNaN: !text.includes('NaN'),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
  };
});

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForSelector('.task-calendar-day-panel', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });
const mobileMetrics = await page.evaluate(() => {
  const panel = document.querySelector('.task-calendar-day-panel');
  const text = panel ? panel.textContent : '';
  return {
    viewport: { width: innerWidth, height: innerHeight },
    hasPanel: Boolean(panel),
    hasSelectedLabel: text.includes('Selected:'),
    hasGoogleDryRun: text.includes('Google dry-run'),
    hasNoNaN: !text.includes('NaN'),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
  };
});

await browser.close();

if (
  !desktopMetrics.hasPanel ||
  !desktopMetrics.hasSelectedLabel ||
  !desktopMetrics.hasHebrewDate ||
  !desktopMetrics.hasAddTask ||
  !desktopMetrics.hasMoveTask ||
  !desktopMetrics.hasGoogleDryRun ||
  !desktopMetrics.hasNoNaN ||
  !desktopMetrics.noHorizontalOverflow
) {
  throw new Error(`Desktop task calendar metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
if (!mobileMetrics.hasPanel || !mobileMetrics.hasSelectedLabel || !mobileMetrics.hasGoogleDryRun || !mobileMetrics.hasNoNaN || !mobileMetrics.noHorizontalOverflow) {
  throw new Error(`Mobile task calendar metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
if (writeRequests.length) {
  throw new Error(`Task calendar selected-day view made unexpected write requests: ${JSON.stringify(writeRequests)}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}${targetPath}`;
const report = `# Task Calendar Selected Day ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations rendered the Tasks > Calendar selected-day
panel with an explicit selected date, Hebrew date/item context, task add/move
actions, and an adjacent Google Calendar dry-run action.

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

The smoke did not click the dry-run button and recorded zero write requests
after login. The visible Google Calendar control is wired to
\`sync_google_calendar\` with \`dry_run: true\` and
\`no_google_calendar_write: true\`; no Google Calendar event, internal calendar
event, email, WhatsApp, Buffer/social action, external connector write, or
external CRM write was triggered by this readback smoke.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, desktopMetrics, mobileMetrics, writeRequests }, null, 2));
