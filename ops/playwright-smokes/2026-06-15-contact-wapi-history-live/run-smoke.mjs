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
  ['signup matcher exists', /function communicationMatchesSignup/.test(operationsHtml)],
  ['lead matcher exists', /function communicationMatchesLead/.test(operationsHtml)],
  ['phone variants exist', /function phoneTokenVariantsClient/.test(operationsHtml)],
  ['email matcher exists', /function communicationEmailTokens/.test(operationsHtml)],
  ['read-only guardrail exists', /function renderCommunicationHistoryGuardrail/.test(operationsHtml)],
  ['signup history marker exists', /data-contact-communication-history="signup"/.test(operationsHtml)],
  ['lead history marker exists', /data-contact-communication-history="lead"/.test(operationsHtml)],
  ['no-send guardrail text exists', /No Whapi sync, WhatsApp send, broadcast, CRM tag update, or external CRM write/.test(operationsHtml)],
];
const failedContracts = contractChecks.filter(([, ok]) => !ok);
if (failedContracts.length) {
  throw new Error(`Static contact WAPI history contract failed: ${failedContracts.map(([name]) => name).join(', ')}`);
}

const baseUrl = (env.SMOKE_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080').replace(/\/$/, '');
const isLocalSmoke = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(baseUrl);
const username = env.SMOKE_OPS_USERNAME || (isLocalSmoke ? 'local-smoke' : env.OPS_USERNAME || '');
const password = env.SMOKE_OPS_PASSWORD || (isLocalSmoke ? 'local-smoke-pass' : env.OPS_PASSWORD || '');
const screenshotPrefix = env.SMOKE_SCREENSHOT_PREFIX || '';
if (!username || !password) throw new Error('Smoke Operations credentials are required');

const fixtureSignups = [
  {
    id: 9901,
    parent_name: 'Fixture Parent Match',
    parent_email: 'fixture.parent.match@example.com',
    parent_phone: '050-111-1111',
    student_name: 'Fixture Student Match',
    student_grade: '6',
    status: 'accepted',
    payment_status: 'paid',
    tags: ['current-parent'],
    created_at: '2026-06-14T09:00:00.000Z',
    updated_at: '2026-06-15T08:30:00.000Z',
  },
];

const fixtureLeads = [
  {
    id: 8801,
    parent_name: 'Fixture Lead Match',
    parent_email: 'fixture.lead.match@example.com',
    parent_phone: '+972 50-222-2222',
    other_phones: ['050-333-3333'],
    student_name: 'Fixture Lead Student',
    lead_type: 'school_interest',
    status: 'interested',
    interest_level: 'hot',
    source: 'telegram',
    source_detail: 'Fixture no-send smoke',
    tags: ['school-interest'],
    created_at: '2026-06-14T10:00:00.000Z',
    updated_at: '2026-06-15T08:40:00.000Z',
  },
];

const fixtureCommunications = [
  {
    id: 7701,
    contact_type: 'general',
    channel: 'whatsapp',
    direction: 'inbound',
    summary: 'WhatsApp from Fixture Parent Match',
    body: 'Asked whether the weekly schedule is posted yet.',
    follow_up_required: true,
    source: 'wapi',
    source_context: {
      from_number: '+972501111111',
      chat_id: '972501111111@s.whatsapp.net',
      delivery_status: 'read',
    },
    metadata: { push_name: 'Fixture Parent Match' },
    occurred_at: '2026-06-15T08:45:00.000Z',
    created_at: '2026-06-15T08:45:10.000Z',
  },
  {
    id: 7702,
    contact_type: 'general',
    channel: 'whatsapp',
    direction: 'inbound',
    summary: 'WhatsApp from Fixture Lead Match',
    body: 'Asked for BNA tuition and visit timing.',
    follow_up_required: false,
    source: 'wapi',
    source_context: {
      from_number: '0502222222',
      chat_id: '972502222222@s.whatsapp.net',
      delivery_status: 'delivered',
    },
    metadata: { push_name: 'Fixture Lead Match' },
    occurred_at: '2026-06-15T08:50:00.000Z',
    created_at: '2026-06-15T08:50:10.000Z',
  },
  {
    id: 7703,
    contact_type: 'general',
    channel: 'email',
    direction: 'inbound',
    summary: 'Email from Fixture Lead Match',
    body: 'Email follow-up matched by source address.',
    follow_up_required: false,
    source: 'communications',
    source_context: {
      from_address: 'Fixture Lead <fixture.lead.match@example.com>',
      to_address: 'ops@example.com',
    },
    metadata: {},
    occurred_at: '2026-06-15T08:52:00.000Z',
    created_at: '2026-06-15T08:52:10.000Z',
  },
];

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

await context.route('**/api/bna/signups**', async (route) => {
  if (route.request().method() !== 'GET') return route.continue();
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ signups: fixtureSignups }) });
});
await context.route('**/api/bna/parent-leads**', async (route) => {
  if (route.request().method() !== 'GET') return route.continue();
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ leads: fixtureLeads }) });
});
await context.route('**/api/bna/contact-communications**', async (route) => {
  if (route.request().method() !== 'GET') return route.continue();
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ communications: fixtureCommunications }) });
});

const returnTo = encodeURIComponent('/operations?workspace=bna&view=contacts&section=parents');
await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Username').fill(username);
await page.getByLabel('Password').fill(password);
await Promise.all([
  page.waitForURL(/\/operations\?/, { timeout: 20000 }),
  page.getByRole('button', { name: 'Sign In' }).click(),
]);
countWrites = true;
await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => typeof render === 'function' && typeof contactKey === 'function', null, { timeout: 20000 });

await page.evaluate(({ fixtureSignups, fixtureLeads, fixtureCommunications }) => {
  currentView = 'contacts';
  contactSection = 'parents';
  signups = fixtureSignups;
  parentLeads = fixtureLeads;
  contactCommunications = fixtureCommunications;
  selectedContactKey = contactKey(signups[0]);
  contactDetailSection = 'communication';
  selectedLeadId = null;
  render();
}, { fixtureSignups, fixtureLeads, fixtureCommunications });
await page.waitForSelector('[data-contact-communication-history="signup"]', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop-parent.png`), fullPage: true });

const parentMetrics = await page.evaluate(() => ({
  hasHistory: Boolean(document.querySelector('[data-contact-communication-history="signup"]')),
  hasGuardrail: document.body.textContent.includes('No Whapi sync, WhatsApp send, broadcast, CRM tag update, or external CRM write'),
  hasParentMessage: document.body.textContent.includes('WhatsApp from Fixture Parent Match'),
  hasParentBody: document.body.textContent.includes('Asked whether the weekly schedule is posted yet.'),
  hasWhatsappRead: document.body.textContent.includes('WhatsApp read'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await page.evaluate(({ fixtureSignups, fixtureLeads, fixtureCommunications }) => {
  currentView = 'contacts';
  contactSection = 'interested_parents';
  signups = fixtureSignups;
  parentLeads = fixtureLeads;
  contactCommunications = fixtureCommunications;
  selectedLeadId = fixtureLeads[0].id;
  leadDetailSection = 'communication';
  render();
}, { fixtureSignups, fixtureLeads, fixtureCommunications });
await page.waitForSelector('[data-contact-communication-history="lead"]', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}desktop-lead.png`), fullPage: true });

const leadMetrics = await page.evaluate(() => ({
  hasHistory: Boolean(document.querySelector('[data-contact-communication-history="lead"]')),
  hasGuardrail: document.body.textContent.includes('No Whapi sync, WhatsApp send, broadcast, CRM tag update, or external CRM write'),
  hasLeadWhatsapp: document.body.textContent.includes('WhatsApp from Fixture Lead Match'),
  hasLeadEmail: document.body.textContent.includes('Email from Fixture Lead Match'),
  hasWhatsappDelivered: document.body.textContent.includes('WhatsApp delivered'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForSelector('[data-contact-communication-history="lead"]', { timeout: 10000 });
await page.screenshot({ path: path.join(outDir, `${screenshotPrefix}mobile-lead.png`), fullPage: true });
const mobileMetrics = await page.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  hasHistory: Boolean(document.querySelector('[data-contact-communication-history="lead"]')),
  hasGuardrail: document.body.textContent.includes('No Whapi sync, WhatsApp send, broadcast, CRM tag update, or external CRM write'),
  noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
}));

await browser.close();

if (!parentMetrics.hasHistory || !parentMetrics.hasGuardrail || !parentMetrics.hasParentMessage || !parentMetrics.hasParentBody || !parentMetrics.hasWhatsappRead || !parentMetrics.noHorizontalOverflow) {
  throw new Error(`Parent contact WAPI history metrics failed: ${JSON.stringify(parentMetrics)}`);
}
if (!leadMetrics.hasHistory || !leadMetrics.hasGuardrail || !leadMetrics.hasLeadWhatsapp || !leadMetrics.hasLeadEmail || !leadMetrics.hasWhatsappDelivered || !leadMetrics.noHorizontalOverflow) {
  throw new Error(`Lead contact WAPI history metrics failed: ${JSON.stringify(leadMetrics)}`);
}
if (!mobileMetrics.hasHistory || !mobileMetrics.hasGuardrail || !mobileMetrics.noHorizontalOverflow) {
  throw new Error(`Mobile contact WAPI history metrics failed: ${JSON.stringify(mobileMetrics)}`);
}
if (writeRequests.length) {
  throw new Error(`Contact WAPI history smoke made unexpected write requests: ${JSON.stringify(writeRequests)}`);
}
if (pageErrors.length || consoleErrors.length) {
  throw new Error(`Browser errors captured: ${JSON.stringify({ pageErrors, consoleErrors })}`);
}

const target = `${baseUrl}/operations?workspace=bna&view=contacts&section=parents`;
const report = `# Contact WAPI History ${env.SMOKE_LABEL || 'Live'} Smoke

Date: 2026-06-15
Target: ${target}

## Result

PASS. Authenticated Operations rendered Contacts parent and interested-parent cards with local WAPI/communication history matched by normalized phone/email/source context.

## Contract Checks

${contractChecks.map(([name]) => `- PASS ${name}`).join('\n')}

## Browser Checks

- PASS parent card metrics: ${JSON.stringify(parentMetrics)}
- PASS lead card metrics: ${JSON.stringify(leadMetrics)}
- PASS mobile metrics: ${JSON.stringify(mobileMetrics)}
- PASS unexpected write requests after login: ${writeRequests.length}

## Screenshots

- ${screenshotPrefix}desktop-parent.png
- ${screenshotPrefix}desktop-lead.png
- ${screenshotPrefix}mobile-lead.png

## Guardrails

The smoke used synthetic signups, leads, and communication records. No Whapi sync, WhatsApp send, broadcast, contact/tag update, external CRM write, Google/Drive action, Buffer/social action, portal message, or email send was triggered.
`;
await fs.writeFile(path.join(outDir, `${screenshotPrefix}report.md`), report, 'utf8');
console.log(JSON.stringify({ ok: true, outDir, parentMetrics, leadMetrics, mobileMetrics, writeRequests }, null, 2));
