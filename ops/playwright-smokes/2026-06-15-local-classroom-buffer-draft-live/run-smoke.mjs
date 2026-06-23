import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

function requireText(body, patterns, label) {
  const missing = patterns.filter((pattern) => !pattern.test(body));
  if (missing.length) {
    throw new Error(`${label} missing expected copy: ${missing.map((pattern) => pattern.source).join(', ')}`);
  }
}

async function login(page, baseUrl, username, password, returnTo) {
  await page.goto(`${baseUrl}/operations-login.html?returnTo=${encodeURIComponent(returnTo)}`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await Promise.all([
    page.waitForURL(/\/operations\?/, { timeout: 20000, waitUntil: 'domcontentloaded' }),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ]);
  await page.waitForLoadState('domcontentloaded');
}

async function pageMetrics(page) {
  return page.evaluate(() => ({
    title: document.title,
    url: location.href,
    body: document.body.textContent || '',
    hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
}

const root = process.cwd();
const env = { ...(await parseEnvFile(path.join(root, '.env.local'))), ...process.env };
const baseUrl = String(env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
const username = env.SMOKE_OPS_USERNAME || env.OPS_USERNAME || '';
const password = env.SMOKE_OPS_PASSWORD || env.OPS_PASSWORD || '';
if (!username || !password) throw new Error('Operations smoke credentials are required.');

const outDir = path.join(root, 'ops', 'playwright-smokes', '2026-06-15-local-classroom-buffer-draft-live');
await fs.mkdir(outDir, { recursive: true });

const operationsHtml = await fs.readFile(path.join(root, 'public', 'operations.html'), 'utf8');
requireText(operationsHtml, [
  /data-local-classroom-first/,
  /data-one-time-classroom-flow/,
  /Buffer draft-only/,
  /No Resend or mass email required/,
  /does not require Google Classroom OAuth/,
], 'local Operations source contract');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

await login(page, baseUrl, username, password, '/operations?workspace=bna&view=students&section=assignments');
await page.waitForFunction(() => document.body.textContent.includes('Local classroom first'), null, { timeout: 25000 });
const classroom = await pageMetrics(page);
requireText(classroom.body, [
  /BNA Classroom/,
  /Stream/,
  /Classwork/,
  /People/,
  /Calendar/,
  /Review/,
  /does not require Google Classroom OAuth/,
  /Google optional and gated/,
  /Buffer draft-only/,
  /Email manual\/current path/,
  /Resend campaigns off/,
], 'live BNA classroom page');
if (classroom.hasHorizontalOverflow) throw new Error(`Desktop classroom overflow: ${classroom.scrollWidth} > ${classroom.innerWidth}`);
await page.screenshot({ path: path.join(outDir, 'desktop-classroom.png'), fullPage: true });

await page.goto(`${baseUrl}/operations?workspace=rabbi_sheller_provider&view=content&section=one_time_library`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.body.textContent.includes('Local One Time Classroom'), null, { timeout: 25000 });
const oneTime = await pageMetrics(page);
requireText(oneTime.body, [
  /Local One Time Classroom/,
  /Rabbi Elie Scheller \/ One Time/,
  /Content parsing enabled/,
  /Buffer draft-only/,
  /No auto-publish/,
  /No Resend or mass email required/,
  /member-library publishing, public Q&A, notifications, rewards, and leaderboards/i,
], 'live One Time classroom handoff');
if (oneTime.hasHorizontalOverflow) throw new Error(`Desktop One Time overflow: ${oneTime.scrollWidth} > ${oneTime.innerWidth}`);
await page.screenshot({ path: path.join(outDir, 'desktop-one-time.png'), fullPage: true });

const storageState = await context.storageState();
const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, storageState });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(`${baseUrl}/operations?workspace=bna&view=students&section=assignments`, { waitUntil: 'domcontentloaded' });
await mobilePage.waitForFunction(() => document.body.textContent.includes('Local classroom first'), null, { timeout: 25000 });
const mobileClassroom = await pageMetrics(mobilePage);
if (mobileClassroom.hasHorizontalOverflow) {
  throw new Error(`Mobile classroom overflow: ${mobileClassroom.scrollWidth} > ${mobileClassroom.innerWidth}`);
}
await mobilePage.screenshot({ path: path.join(outDir, 'mobile-classroom.png'), fullPage: true });

await mobileContext.close();
await context.close();
await browser.close();

const report = [
  '# Local Classroom / One Time / Buffer Draft Live Smoke',
  '',
  `Base URL: ${baseUrl}`,
  `BNA classroom URL: ${classroom.url}`,
  `One Time URL: ${oneTime.url}`,
  `Desktop classroom width: ${classroom.scrollWidth}/${classroom.innerWidth}`,
  `Mobile classroom width: ${mobileClassroom.scrollWidth}/${mobileClassroom.innerWidth}`,
  `Console errors: ${consoleErrors.length ? consoleErrors.join(' | ') : 'none'}`,
  '',
  'PASS. Authenticated live Operations rendered the first-party Classroom lanes, One Time/Rabbi classroom handoff, Google optional gate, manual email posture, and Buffer draft-only policy without desktop or mobile horizontal overflow.',
  '',
].join('\n');
await fs.writeFile(path.join(outDir, 'report.md'), report, 'utf8');
console.log(report);
