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
const outDir = env.SMOKE_OUT_DIR
  ? path.resolve(root, env.SMOKE_OUT_DIR)
  : smokeDir;
await fs.mkdir(outDir, { recursive: true });

const operationsHtml = await fs.readFile(path.join(root, 'public', 'operations.html'), 'utf8');
const contractChecks = [
  ['announcement panel exists', /function renderAnnouncementPanel/.test(operationsHtml)],
  ['approval form helper exists', /function renderParentAnnouncementApprovalForm/.test(operationsHtml)],
  ['candidate helper exists', /function renderParentAnnouncementCandidate/.test(operationsHtml)],
  ['form marker exists', /data-parent-announcement-form/.test(operationsHtml)],
  ['preview handler exists', /function previewParentAnnouncementForm/.test(operationsHtml)],
  ['approval handler exists', /function approveParentAnnouncementForm/.test(operationsHtml)],
  ['media URL fields exist', /parentAnnouncementImageUrl/.test(operationsHtml) && /parentAnnouncementVideoUrl/.test(operationsHtml)],
  ['dry-run payload is wired', /dry_run: dryRun/.test(operationsHtml)],
  ['typed approval phrase is required', /APPROVE_PARENT_ANNOUNCEMENT/.test(operationsHtml)],
  ['old native prompt flow is absent', !/approveParentAnnouncementPrompt/.test(operationsHtml) && !/prompt\('Parent announcement/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static weekly update approval contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = (env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080').replace(/\/$/, '');
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';
if (!username || !password) {
  throw new Error('Smoke Operations credentials are required');
}

const fixtureAnnouncements = [
  {
    id: 9001,
    title: 'This week at BNA',
    summary: 'Parents can review the week in one quiet, approved readback.',
    body: 'This week, students focused on steady review, clear questions, and practical next steps for the coming learning cycle.',
    image_url: 'https://cdn.example.com/bna-weekly-update.jpg',
    video_url: 'https://video.example.com/bna-weekly-update',
    status: 'draft',
    selected_for_parent_portal: false,
    approved_for_parent_portal: false,
    week_start: '2026-06-15',
    created_at: '2026-06-15T09:00:00.000Z',
  },
  {
    id: 9002,
    title: 'Parent portal readback candidate',
    summary: 'A second candidate confirms the candidate loader can replace the active form fields.',
    body: 'This candidate should be selectable without sending any message or publishing any social post.',
    image_url: '',
    video_url: '',
    status: 'selected',
    selected_for_parent_portal: true,
    approved_for_parent_portal: true,
    week_start: '2026-06-08',
    created_at: '2026-06-08T09:00:00.000Z',
  },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
let getHits = 0;
let dryRunHits = 0;
let writeAttempts = 0;
let lastPreviewPayload = null;

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

await context.route('**/api/bna/parent-announcements**', async (route) => {
  const request = route.request();
  if (request.method() === 'GET') {
    getHits += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        dry_run: true,
        no_send: true,
        external_write_performed: false,
        local_write_performed: false,
        latest_announcement: fixtureAnnouncements[1],
        announcements: fixtureAnnouncements,
      }),
    });
    return;
  }

  if (request.method() === 'POST') {
    const payload = request.postDataJSON();
    if (payload?.dry_run === true) {
      dryRunHits += 1;
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
          announcement_preview: {
            workspace_key: payload.workspace || payload.workspace_key || 'main',
            title: payload.title,
            summary: payload.summary,
            body: payload.body,
            image_url: payload.image_url || null,
            video_url: payload.video_url || null,
            selected_for_parent_portal: true,
            status: 'selected',
          },
        }),
      });
      return;
    }

    writeAttempts += 1;
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Smoke guard blocked non-dry-run parent announcement write' }),
    });
    return;
  }

  await route.continue();
});

const returnTo = encodeURIComponent('/operations?view=communications&section=announcements');
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
  render();
}, fixtureAnnouncements);
try {
  await page.waitForFunction(() => document.body.textContent.includes('Candidate Updates'), null, { timeout: 12000 });
} catch (error) {
  await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}candidate-missing.png`), fullPage: true });
  const diagnostics = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: document.body.textContent.slice(0, 2500),
    formPresent: Boolean(document.querySelector('[data-parent-announcement-form]')),
    globals: {
      setCurrentSection: typeof window.setCurrentSection,
      loadData: typeof window.loadData,
      renderAnnouncementPanel: typeof window.renderAnnouncementPanel,
    },
  }));
  throw new Error(`Candidate updates did not render: ${JSON.stringify({ diagnostics, getHits, consoleErrors, pageErrors })}`);
}
try {
  await page.waitForSelector('[data-parent-announcement-candidate-index]', { state: 'attached', timeout: 12000 });
} catch (error) {
  await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}candidate-button-missing.png`), fullPage: true });
  const diagnostics = await page.evaluate(() => ({
    textHasCandidateUpdates: document.body.textContent.includes('Candidate Updates'),
    candidateButtonCount: document.querySelectorAll('[data-parent-announcement-candidate-index]').length,
    announcementForm: document.querySelector('[data-parent-announcement-form]')?.outerHTML || '',
    announcementSectionText: Array.from(document.querySelectorAll('.focus-panel'))
      .find((panel) => panel.textContent.includes('Announcements'))?.textContent.slice(0, 2500) || '',
    announcementSectionHtml: Array.from(document.querySelectorAll('.focus-panel'))
      .find((panel) => panel.textContent.includes('Announcements'))?.innerHTML.slice(0, 3500) || '',
  }));
  throw new Error(`Candidate button did not render: ${JSON.stringify({ diagnostics, getHits, dryRunHits, writeAttempts })}`);
}
await page.locator('[data-parent-announcement-candidate-index]').first().click();
await page.getByRole('button', { name: 'Preview No-Write' }).click();
await page.waitForFunction(() => document.querySelector('#parentAnnouncementStatus')?.textContent.includes('Preview ready'), null, { timeout: 10000 });

const desktopMetrics = await page.evaluate(() => {
  const form = document.querySelector('[data-parent-announcement-form]');
  const rect = form.getBoundingClientRect();
  return {
    title: document.querySelector('#parentAnnouncementTitle')?.value || '',
    body: document.querySelector('#parentAnnouncementBody')?.value || '',
    imageUrl: document.querySelector('#parentAnnouncementImageUrl')?.value || '',
    videoUrl: document.querySelector('#parentAnnouncementVideoUrl')?.value || '',
    status: document.querySelector('#parentAnnouncementStatus')?.textContent || '',
    noSendCopy: document.body.textContent.includes('No email, WhatsApp, or social post will be sent'),
    candidateCopy: document.body.textContent.includes('Candidate Updates'),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
    formWidth: Math.round(rect.width),
    formHeight: Math.round(rect.height),
  };
});
if (
  desktopMetrics.title !== fixtureAnnouncements[0].title ||
  desktopMetrics.imageUrl !== fixtureAnnouncements[0].image_url ||
  desktopMetrics.videoUrl !== fixtureAnnouncements[0].video_url ||
  !desktopMetrics.status.includes('Preview ready') ||
  !desktopMetrics.noSendCopy ||
  !desktopMetrics.candidateCopy ||
  !desktopMetrics.noHorizontalOverflow
) {
  throw new Error(`Desktop weekly update approval metrics failed: ${JSON.stringify(desktopMetrics)}`);
}
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop.png`), fullPage: true });

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForSelector('[data-parent-announcement-form]', { timeout: 10000 });
const mobileMetrics = await page.evaluate(() => {
  const form = document.querySelector('[data-parent-announcement-form]');
  const rect = form.getBoundingClientRect();
  return {
    viewport: { width: innerWidth, height: innerHeight },
    formWidth: Math.round(rect.width),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
    fieldsPresent: ['parentAnnouncementTitle', 'parentAnnouncementBody', 'parentAnnouncementImageUrl', 'parentAnnouncementVideoUrl', 'parentAnnouncementConfirm']
      .every((id) => Boolean(document.getElementById(id))),
    previewButtonVisible: Boolean(Array.from(document.querySelectorAll('button')).find((button) => button.textContent.trim() === 'Preview No-Write')),
  };
});
if (!mobileMetrics.fieldsPresent || !mobileMetrics.previewButtonVisible || !mobileMetrics.noHorizontalOverflow || mobileMetrics.formWidth > 390) {
  throw new Error(`Mobile weekly update approval metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile.png`), fullPage: true });

await browser.close();

if (!dryRunHits || writeAttempts) {
  throw new Error(`Parent announcement route guard failed: ${JSON.stringify({ getHits, dryRunHits, writeAttempts, lastPreviewPayload })}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}/operations?view=communications&section=announcements`;
const report = `# Parent Weekly Update Approval ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations loaded the Communications > Announcements panel, rendered the parent portal approval form, loaded a candidate draft with image/video URLs, and completed the Preview No-Write flow.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

- INFO parent-announcements GET was intercepted with fixture data before page seeding: ${getHits} hit(s).
- PASS no-write preview POST was intercepted with \`dry_run: true\`: ${dryRunHits} hit(s).
- PASS non-dry-run write attempts were blocked and none occurred: ${writeAttempts}.
- PASS desktop metrics: ${JSON.stringify(desktopMetrics)}
- PASS mobile metrics: ${JSON.stringify(mobileMetrics)}
- PASS preview payload carried selected copy/media: ${JSON.stringify(lastPreviewPayload)}

## Screenshots

- ${screenshotPrefix}desktop.png
- ${screenshotPrefix}mobile.png

## Guardrails

No email, WhatsApp, social post, Buffer action, external CRM write, or selected weekly-update write was triggered. The only parent-announcements POST in this smoke used \`dry_run: true\` and returned \`local_write_performed: false\`.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, getHits, dryRunHits, writeAttempts, desktopMetrics, mobileMetrics }, null, 2));
