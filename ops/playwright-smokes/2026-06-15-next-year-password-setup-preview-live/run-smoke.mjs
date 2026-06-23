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
  ['admin password setup endpoint exists', /app\.post\('\/api\/bna\/parent-access\/password-reset'/.test(serverJs)],
  ['dry-run preview returns no-write flags', /password_setup_preview/.test(serverJs) && /local_write_performed: false/.test(serverJs)],
  ['typed send confirmation exists', /PARENT_PASSWORD_SETUP_CONFIRM = 'SEND_PARENT_PASSWORD_SETUP'/.test(serverJs)],
  ['Operations API client is wired', /sendParentPasswordSetup\(payload\)/.test(operationsHtml)],
  ['Next Year rollout packet copy exists', /No parent onboarding campaign is sent from this page/.test(operationsHtml)],
  ['preview button exists', /Preview Password Setup/.test(operationsHtml)],
  ['send button exists', /Email Password Setup/.test(operationsHtml)],
  ['preview payload uses dry_run', /dry_run: Boolean\(dryRun\)/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static next-year password setup contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = (env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080').replace(/\/$/, '');
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';
if (!username || !password) throw new Error('Smoke Operations credentials are required');

const fixtureReadiness = {
  success: true,
  cohort: 'next_year_group',
  checked_at: '2026-06-15T09:15:00.000Z',
  confirm_required: 'PREPARE_NEXT_YEAR_LOGINS',
  summary: {
    roster_count: 1,
    login_ready: 1,
    rollout_ready: 1,
    missing_parent_email: 0,
    missing_student_link: 0,
    disabled_student_link: 0,
    parent_password_not_set: 1,
    assignmentless: 0,
    no_visible_materials: 0,
    prepared_student_links: 0,
  },
  students: [
    {
      id: 99001,
      name: 'Fixture Student',
      parent_name: 'Fixture Parent',
      parent_email: 'fixture.parent@example.com',
      parent_phone: '+15555550123',
      student_access_code: 'fixture-student-code',
      student_access_enabled: true,
      student_link_ready: true,
      parent_link_ready: true,
      parent_password_set: false,
      parent_last_login_at: null,
      assignment_count: 2,
      visible_material_count: 2,
      worksheet_ready_count: 1,
      scheduled_count: 1,
      classroom_ready_count: 0,
      login_ready: true,
      materials_ready: true,
      rollout_ready: true,
      prepared_student_link: false,
      issues: ['parent_password_not_set'],
    },
  ],
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
let previewHits = 0;
let sendAttempts = 0;
let lastPreviewPayload = null;

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

await context.route('**/api/bna/parent-access/password-reset**', async (route) => {
  const request = route.request();
  if (request.method() !== 'POST') return route.continue();
  const payload = request.postDataJSON();
  if (payload?.dry_run === true) {
    previewHits += 1;
    lastPreviewPayload = payload;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        dry_run: true,
        no_send: true,
        external_write_performed: false,
        local_write_performed: false,
        password_setup_preview: {
          contact_type: payload.contact_type,
          contact_id: payload.contact_id,
          parent_email: fixtureReadiness.students[0].parent_email,
          parent_name: fixtureReadiness.students[0].parent_name,
          student_name: fixtureReadiness.students[0].name,
          subject: 'Set or reset your Bnei Neviim Academy parent portal password',
          expires_in_minutes: 60,
          channel: 'email',
          no_bulk_send: true,
          no_whatsapp: true,
          no_external_crm_write: true,
          confirm_required: 'SEND_PARENT_PASSWORD_SETUP',
        },
      }),
    });
    return;
  }
  sendAttempts += 1;
  await route.fulfill({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Smoke guard blocked live password setup email' }),
  });
});

const dialogMessages = [];
page.on('dialog', async (dialog) => {
  dialogMessages.push(dialog.message());
  await dialog.accept();
});

const returnTo = encodeURIComponent('/operations?workspace=bna&view=students&section=next_year_login');
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 20000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
await page.waitForLoadState('domcontentloaded');
await page.evaluate((readiness) => {
  currentView = 'students';
  studentSection = 'next_year_login';
  nextYearLoginReadiness = readiness;
  render();
}, fixtureReadiness);
await page.waitForSelector('button:has-text("Preview Password Setup")', { timeout: 10000 });
await page.getByRole('button', { name: 'Preview Password Setup' }).first().click();
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

const desktopMetrics = await page.evaluate(() => ({
  hasNextYearView: document.body.textContent.includes("Next Year's Group Login Readiness"),
  hasRolloutPacket: document.body.textContent.includes('No parent onboarding campaign is sent from this page'),
  hasPreviewButton: document.body.textContent.includes('Preview Password Setup'),
  hasSendButton: document.body.textContent.includes('Email Password Setup'),
  hasParentPasswordStatus: document.body.textContent.includes('Parent Password') && document.body.textContent.includes('Not Set'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await page.setViewportSize({ width: 390, height: 900 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });
const mobileMetrics = await page.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  hasPreviewButton: document.body.textContent.includes('Preview Password Setup'),
  hasRolloutPacket: document.body.textContent.includes('No parent onboarding campaign is sent from this page'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await browser.close();

if (!previewHits || sendAttempts || !lastPreviewPayload?.dry_run) {
  throw new Error(`Password setup preview guard failed: ${JSON.stringify({ previewHits, sendAttempts, lastPreviewPayload })}`);
}
if (!desktopMetrics.hasNextYearView || !desktopMetrics.hasRolloutPacket || !desktopMetrics.hasPreviewButton || !desktopMetrics.hasSendButton || !desktopMetrics.hasParentPasswordStatus || !desktopMetrics.noHorizontalOverflow) {
  throw new Error(`Desktop next-year password setup metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
if (!mobileMetrics.hasPreviewButton || !mobileMetrics.hasRolloutPacket || !mobileMetrics.noHorizontalOverflow) {
  throw new Error(`Mobile next-year password setup metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}/operations?workspace=bna&view=students&section=next_year_login`;
const report = `# Next Year Password Setup Preview ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations rendered the Students > Next Year Login rollout packet, exposed per-family password setup preview/send buttons, and completed the password setup preview path without sending email.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

- PASS password setup preview POST was intercepted with \`dry_run: true\`: ${previewHits} hit(s).
- PASS live password setup email attempts were blocked and none occurred: ${sendAttempts}.
- PASS desktop metrics: ${JSON.stringify(desktopMetrics)}
- PASS mobile metrics: ${JSON.stringify(mobileMetrics)}
- PASS preview payload: ${JSON.stringify(lastPreviewPayload)}
- INFO preview dialog messages: ${JSON.stringify(dialogMessages)}

## Screenshots

- ${screenshotPrefix}desktop.png
- ${screenshotPrefix}mobile.png

## Guardrails

No parent password token, email, WhatsApp, onboarding campaign, portal message, student access change, external CRM write, Google/Drive action, or Buffer/social action was triggered. The only password setup POST used \`dry_run: true\` and returned \`local_write_performed: false\`.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, previewHits, sendAttempts, desktopMetrics, mobileMetrics }, null, 2));
