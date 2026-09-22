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
const serverJs = await fs.readFile(path.join(root, 'server.js'), 'utf8');
const contractChecks = [
  ['recipient preview endpoint exists', /app\.get\('\/api\/bna\/parent-announcements\/recipients'/.test(serverJs)],
  ['recipient preview builder exists', /buildParentAnnouncementRecipientPreview/.test(serverJs)],
  ['recipient preview is no-send', /send_enabled: false/.test(serverJs) && /future_confirm_required: 'APPROVE_PARENT_WEEKLY_UPDATE_SEND'/.test(serverJs)],
  ['spouse policy candidates are separated', /spouse_policy_review_candidates/.test(serverJs)],
  ['external students are excluded', /excluded_external_students/.test(serverJs)],
  ['Operations API client is wired', /getParentAnnouncementRecipients/.test(operationsHtml)],
  ['recipient preview renderer exists', /renderParentAnnouncementRecipientPreview/.test(operationsHtml)],
  ['recipient preview button exists', /Preview Recipients No-Send/.test(operationsHtml)],
  ['guardrail copy exists', /No email, WhatsApp, portal message, communication log, Buffer\/social action, Google\/Drive action, or external CRM write was performed/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static recipient preview contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = (env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080').replace(/\/$/, '');
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';
if (!username || !password) throw new Error('Smoke Operations credentials are required');

const fixtureAnnouncements = [
  {
    id: 9101,
    title: 'This week at BNA',
    summary: 'Parents can review the week in one quiet, approved readback.',
    body: 'Fixture-only update copy for no-send recipient preview.',
    image_url: '',
    video_url: '',
    status: 'selected',
    selected_for_parent_portal: true,
    approved_for_parent_portal: true,
    week_start: '2026-06-15',
    created_at: '2026-06-15T09:00:00.000Z',
  },
];

const fixtureRecipients = {
  success: true,
  dry_run: true,
  no_send: true,
  local_write_performed: false,
  external_write_performed: false,
  workspace_key: 'bna',
  project_key: 'bnei_neviim_academy',
  project_id: 1,
  audience: 'current_bna_student_parents',
  send_enabled: false,
  send_blocked_reason: 'Weekly update test-send/live-send rules are not enabled from this preview.',
  future_confirm_required: 'APPROVE_PARENT_WEEKLY_UPDATE_SEND',
  summary: {
    eligible_recipients: 2,
    active_student_records: 2,
    missing_student_parent_email: 1,
    excluded_external_students: 1,
    review_only_signup_candidates: 1,
    spouse_policy_review_candidates: 1,
    duplicate_email_records: 0,
  },
  recipients: [
    {
      parent_email: 'fixture.parent.one@example.com',
      parent_name: 'Fixture Parent One',
      parent_phone: '+15555550101',
      student_names: ['Fixture Student One'],
      source_records: [{ type: 'student', id: 99001, student_name: 'Fixture Student One', parent_name: 'Fixture Parent One', status: 'active' }],
      send_status: 'preview_only_not_sent',
    },
    {
      parent_email: 'fixture.parent.two@example.com',
      parent_name: 'Fixture Parent Two',
      parent_phone: '+15555550102',
      student_names: ['Fixture Student Two'],
      source_records: [{ type: 'student', id: 99002, student_name: 'Fixture Student Two', parent_name: 'Fixture Parent Two', status: 'active' }],
      send_status: 'preview_only_not_sent',
    },
  ],
  review_only_signup_candidates: [],
  spouse_policy_review_candidates: [],
  missing_student_email: [],
  excluded_external_students: [],
  duplicate_email_records: [],
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
let announcementGetHits = 0;
let recipientPreviewHits = 0;
let writeAttempts = 0;

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

await context.route('**/api/bna/parent-announcements**', async (route) => {
  const request = route.request();
  const url = request.url();
  if (request.method() === 'GET' && url.includes('/recipients')) {
    recipientPreviewHits += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtureRecipients),
    });
    return;
  }
  if (request.method() === 'GET') {
    announcementGetHits += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        dry_run: true,
        no_send: true,
        external_write_performed: false,
        local_write_performed: false,
        latest_announcement: fixtureAnnouncements[0],
        announcements: fixtureAnnouncements,
      }),
    });
    return;
  }
  writeAttempts += 1;
  await route.fulfill({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Smoke guard blocked parent announcement write/send attempt' }),
  });
});

const returnTo = encodeURIComponent('/operations?workspace=bna&view=communications&section=announcements');
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 20000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
await page.waitForLoadState('domcontentloaded');
await page.waitForSelector('[data-parent-announcement-form]', { timeout: 20000 });
await page.evaluate((announcements) => {
  currentView = 'communications';
  communicationsSection = 'announcements';
  parentAnnouncements = announcements;
  parentAnnouncementRecipients = null;
  render();
}, fixtureAnnouncements);
await page.waitForSelector('button:has-text("Preview Recipients No-Send")', { timeout: 10000 });
await page.getByRole('button', { name: 'Preview Recipients No-Send' }).click();
await page.waitForSelector('[data-parent-announcement-recipient-preview]', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

const desktopMetrics = await page.evaluate(() => ({
  hasPanel: Boolean(document.querySelector('[data-parent-announcement-recipient-preview]')),
  hasEligibleCount: document.body.textContent.includes('2 eligible current-parent emails'),
  hasNoSendCopy: document.body.textContent.includes('Preview only. Test-send and live-send remain disabled'),
  hasGuardrailCopy: document.body.textContent.includes('No email, WhatsApp, portal message, communication log, Buffer/social action, Google/Drive action, or external CRM write was performed'),
  hasSyntheticRecipient: document.body.textContent.includes('fixture.parent.one@example.com'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await page.setViewportSize({ width: 390, height: 900 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });
const mobileMetrics = await page.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  hasPanel: Boolean(document.querySelector('[data-parent-announcement-recipient-preview]')),
  hasNoSendCopy: document.body.textContent.includes('Preview only. Test-send and live-send remain disabled'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await browser.close();

if (!recipientPreviewHits || writeAttempts) {
  throw new Error(`Recipient preview guard failed: ${JSON.stringify({ announcementGetHits, recipientPreviewHits, writeAttempts })}`);
}
if (!desktopMetrics.hasPanel || !desktopMetrics.hasEligibleCount || !desktopMetrics.hasNoSendCopy || !desktopMetrics.hasGuardrailCopy || !desktopMetrics.hasSyntheticRecipient || !desktopMetrics.noHorizontalOverflow) {
  throw new Error(`Desktop recipient preview metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
if (!mobileMetrics.hasPanel || !mobileMetrics.hasNoSendCopy || !mobileMetrics.noHorizontalOverflow) {
  throw new Error(`Mobile recipient preview metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}/operations?workspace=bna&view=communications&section=announcements`;
const report = `# Parent Announcement Recipient Preview ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations rendered Communications > Announcements, loaded the no-send recipient preview, and displayed current-parent recipient counts without sending or writing.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

- PASS recipient preview GET was intercepted: ${recipientPreviewHits} hit(s).
- PASS parent announcement write/send attempts were blocked and none occurred: ${writeAttempts}.
- PASS desktop metrics: ${JSON.stringify(desktopMetrics)}
- PASS mobile metrics: ${JSON.stringify(mobileMetrics)}

## Screenshots

- ${screenshotPrefix}desktop.png
- ${screenshotPrefix}mobile.png

## Guardrails

The smoke used synthetic recipients only. No real parent email was read into the report, and no email, WhatsApp, portal message, communication log, Buffer/social action, Google/Drive action, external CRM write, parent-announcement write, or test-send/live-send action was triggered.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, announcementGetHits, recipientPreviewHits, writeAttempts, desktopMetrics, mobileMetrics }, null, 2));
