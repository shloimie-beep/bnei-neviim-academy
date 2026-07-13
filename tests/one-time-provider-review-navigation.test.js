const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');

function json(res, payload, statusCode = 200) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function createProviderReviewServer() {
  let activePort = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    if (url.pathname === '/api/one-time-review/provider') {
      const data = buildOneTimeSharedReviewData({ baseUrl: `http://127.0.0.1:${activePort || 0}` });
      return json(res, {
        success: true,
        ...data.provider_portal,
        links: data.links,
        test_only: true,
        external_write_performed: false,
      });
    }
    if (url.pathname === '/api/provider-portal/session') {
      return json(res, signedProviderPortalPayload(`http://127.0.0.1:${activePort || 0}`));
    }
    if (url.pathname === '/api/provider-portal/inquiries') {
      return json(res, { cards: [] });
    }
    if (url.pathname === '/api/provider-portal/calendar-events') {
      return json(res, { events: [] });
    }
    if (url.pathname === '/api/provider-portal/mailbox') {
      return json(res, {
        mailbox: {
          readiness: {
            inbox_address: 'info@onetimeonetime.com',
            readiness: { send_allowed: false },
          },
          threads: [
            {
              thread_key: 'parent-welcome',
              contact_name: 'One Time Parent',
              contact_email: 'parent@example.test',
              subject: 'Welcome question',
              preview: 'Can you confirm tonight class link?',
              message_count: 1,
              needs_reply: true,
            },
          ],
        },
      });
    }
    if (url.pathname === '/api/provider-portal/mailbox/parent-welcome') {
      return json(res, {
        mailbox: {
          readiness: {
            inbox_address: 'info@onetimeonetime.com',
            readiness: { send_allowed: false },
          },
        },
        thread: {
          thread_key: 'parent-welcome',
          subject: 'Welcome question',
          reply_to_address: 'parent@example.test',
          messages: [
            {
              direction: 'inbound',
              from_name: 'One Time Parent',
              from_address: 'parent@example.test',
              subject: 'Welcome question',
              preview: 'Can you confirm tonight class link?',
              body_text: 'Can you confirm tonight class link?',
              status: 'received',
              occurred_at: '2026-07-08T12:00:00.000Z',
            },
          ],
        },
      });
    }

    const requested = url.pathname === '/' ? '/provider.html' : url.pathname;
    const filePath = path.resolve(publicRoot, decodeURIComponent(requested.replace(/^\/+/, '')));
    if (!filePath.startsWith(publicRoot)) return json(res, { error: 'forbidden' }, 403);
    fs.readFile(filePath, (error, body) => {
      if (error) return json(res, { error: 'not found' }, 404);
      res.writeHead(200, { 'content-type': contentType(filePath) });
      res.end(body);
    });
  });
  return {
    listen() {
      return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          activePort = server.address().port;
          resolve(`http://127.0.0.1:${activePort}`);
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

function signedProviderPortalPayload(baseUrl) {
  return {
    provider: {
      id: 1,
      provider_name: 'Rabbi Eli Scheller',
      display_name: 'Rabbi Eli Scheller',
      login_username: 'one_time_admin',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      entitlement_plan: 'rabbi_sheller_partner',
      status: 'active',
      plan: { label: 'One Time Mishnah Class workspace' },
    },
    scope: {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      entitlements: ['crm_contacts', 'parent_portal', 'student_portal'],
    },
    profile: { id: 1 },
    services: [
      {
        id: 8,
        title: 'One Time Mishnah Class',
        description: 'Live class and member library workspace.',
        status: 'active',
        service_type: 'learning',
        city: 'Online',
      },
    ],
    links: {
      one_time_home: '/one-time',
      parent: '/parent.html?review=one-time',
      student: '/student.html?review=one-time',
      member: '/rabbi-member?review=one-time',
      classroom: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
      email_preview: '/one-time-email-review.html',
    },
    crm_workspace: {
      current_records: { parents: 0, students: 0, support_items: 1 },
    },
    one_time_class_media_enabled: true,
    one_time_class_media: [],
    wapi_setup: {
      integration: {
        label: 'WhatsApp / WAPI',
        status: 'not_configured',
        notes: 'Connect Whapi/WAPI, paste the token, and BNA will verify before messages are enabled.',
      },
      instructions: ['Connect Whapi/WAPI.', 'Save the token for verification.'],
      docs_url: `${baseUrl}/docs`,
      dashboard_url: `${baseUrl}/dashboard`,
    },
    guardrails: {
      public_changes: 'One Time provider changes stay pending review until approved.',
    },
    messages: [
      {
        id: 1,
        subject: 'Parent support',
        direction: 'parent_to_provider',
        status: 'draft_available',
        created_at: '2026-07-08T12:00:00.000Z',
        body: 'Parent support message captured in the One Time CRM.',
      },
    ],
    entitlements: [],
    integrations: [],
    access_checklist: [],
    media: [],
    comments: [],
    google_business: {},
    upgrade: {},
  };
}

function sourceBlock(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  assert.notEqual(start, -1, `missing start pattern ${startPattern}`);
  const tail = source.slice(start);
  const end = tail.search(endPattern);
  assert.notEqual(end, -1, `missing end pattern ${endPattern}`);
  return tail.slice(0, end);
}

test('One Time provider review, view-as, and signed sessions use the same Rabbi-facing section model', () => {
  const sectionsBlock = sourceBlock(
    providerHtml,
    /if \(oneTimeReviewMode \|\| oneTimeViewAsRabbiToken \|\| signedOneTimeSession\) \{/,
    /const sections = providerIsPlusPlan/
  );

  assert.match(sectionsBlock, /oneTimeReviewMode \|\| oneTimeViewAsRabbiToken \|\| signedOneTimeSession/);
  assert.match(sectionsBlock, /providerWapiSetupEnabled\(\)/);
  for (const section of ['overview', 'crm', 'mailbox', 'communications', 'billing', 'content', 'class_setup', 'class_media', 'users', 'badges', 'activity']) {
    assert.match(sectionsBlock, new RegExp(`id: '${section}'`), `missing ${section} review section`);
  }
  for (const hiddenSection of ['commercial', 'integrations', 'access']) {
    assert.doesNotMatch(sectionsBlock, new RegExp(`id: '${hiddenSection}'`), `review model should not expose ${hiddenSection}`);
  }
});

test('signed One Time provider session uses production Rabbi workspace navigation', async () => {
  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    await page.goto(`${baseUrl}/provider.html?admin_provider=one-time&section=crm`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-provider-nav="crm"].active');

    const navText = await page.locator('#providerNav').innerText();
    assert.match(navText, /CRM/);
    assert.match(navText, /Mailbox/);
    assert.match(navText, /WhatsApp/);
    assert.match(navText, /Billing/);
    for (const hidden of ['Commercial Model', 'External Apps', 'Access Checklist', 'API Usage', 'Settings']) {
      assert.doesNotMatch(navText, new RegExp(hidden, 'i'));
    }

    const crmText = await page.locator('[data-provider-section="crm"]').innerText();
    assert.match(crmText, /One Time CRM Inbox/);
    assert.equal(await page.locator('[data-one-time-provider-crm-shell]').count(), 1);
    assert.equal(await page.locator('.one-time-crm-workbench').count(), 1);
    assert.equal(await page.locator('.one-time-crm-detail').count(), 1);
    assert.match(crmText, /Open Inbox/);
    assert.match(crmText, /Preview Email/);
    assert.match(crmText, /Selected CRM view/);
    assert.match(crmText, /Class access/);
    assert.doesNotMatch(crmText, /TEST Parent|TEST Student|test\.parent|configured|not configured|BNA Academy/i);

    await page.locator('[data-one-time-provider-crm-shell] [data-provider-nav="mailbox"]').first().click();
    await page.waitForSelector('[data-provider-nav="mailbox"].active');
    await page.waitForFunction(() => Boolean(window.OneTimeProviderRouteModules?.mailbox), null, {
      timeout: 10000,
    });
    const routeModules = await page.evaluate(() => Object.keys(window.OneTimeProviderRouteModules || {}).sort());
    assert.deepEqual(routeModules, ['crm', 'mailbox']);
    assert.equal(await page.locator('[data-provider-section="mailbox"]').isVisible(), true);
    assert.equal(await page.locator('[data-provider-section="mailbox"] [data-route-module="one-time-provider-mailbox-route"]').count() > 0, true);
    await page.locator('#providerNav [data-provider-nav="communications"]').click();
    await page.waitForSelector('[data-provider-nav="communications"].active');
    await page.waitForFunction(() => Boolean(window.OneTimeProviderRouteModules?.communications), null, {
      timeout: 10000,
    });
    const routeModulesAfterMessages = await page.evaluate(() => Object.keys(window.OneTimeProviderRouteModules || {}).sort());
    assert.deepEqual(routeModulesAfterMessages, ['communications', 'crm', 'mailbox']);
    assert.equal(await page.locator('[data-provider-section="communications"] [data-route-module="one-time-provider-communications-route"]').count() > 0, true);
    await page.locator('#providerNav [data-provider-nav="billing"]').click();
    await page.waitForSelector('[data-provider-nav="billing"].active');
    await page.waitForFunction(() => Boolean(window.OneTimeProviderRouteModules?.billing), null, {
      timeout: 10000,
    });
    const routeModulesAfterBilling = await page.evaluate(() => Object.keys(window.OneTimeProviderRouteModules || {}).sort());
    assert.deepEqual(routeModulesAfterBilling, ['billing', 'communications', 'crm', 'mailbox']);
    const billingText = await page.locator('[data-provider-section="billing"]').innerText();
    assert.match(billingText, /Billing V2/);
    assert.match(billingText, /\$67\.00 \/ month/);
    assert.match(billingText, /No Stripe trial/);
    assert.match(billingText, /Start live billing/);
    assert.match(billingText, /Create refund/);
    assert.match(billingText, /Run access automation/);
    assert.doesNotMatch(billingText, /30 days free|trial active|automatic refund enabled|automatic refunds enabled/i);
    assert.equal(await page.locator('[data-provider-section="billing"] [data-action-id="ACTION-ONETIME-BILLING-LIVE-CHARGE-BLOCKED"]').isDisabled(), true);
    assert.equal(await page.locator('[data-provider-section="billing"] [data-action-id="ACTION-ONETIME-BILLING-REFUND-REVIEW-BLOCKED"]').isDisabled(), true);
    assert.equal(await page.locator('[data-provider-section="billing"] [data-action-id="ACTION-ONETIME-BILLING-ACCESS-AUTOMATION-BLOCKED"]').isDisabled(), true);
    await page.locator('#providerNav [data-provider-nav="crm"]').click();
    await page.waitForSelector('[data-provider-nav="crm"].active');

    const bodyText = await page.locator('body').innerText();
    assert.match(bodyText, /RABBI ACCOUNT/);
    assert.doesNotMatch(bodyText, /TEST review mode|Close Preview|TEST-ONETIME-REVIEW-ACCESS/i);

    const parentHref = await page.locator('.one-time-sidebar-action', { hasText: 'Parent View' }).getAttribute('href');
    const studentHref = await page.locator('.one-time-sidebar-action', { hasText: 'Student View' }).getAttribute('href');
    const classroomHref = await page.locator('.one-time-sidebar-action', { hasText: 'Classroom' }).getAttribute('href');
    assert.equal(parentHref, '/parent/login');
    assert.equal(studentHref, '/student/login');
    assert.equal(classroomHref, '/one-time-classroom.html');

    await page.locator('#providerNav [data-provider-nav="whatsapp_setup"]').click();
    await page.waitForSelector('[data-provider-section="whatsapp_setup"]:not(.provider-section-hidden)');
    const whatsAppText = await page.locator('[data-provider-section="whatsapp_setup"]').innerText();
    assert.match(whatsAppText, /No send/);
    assert.match(whatsAppText, /Save WhatsApp Setup/);
    assert.doesNotMatch(whatsAppText, /Send WhatsApp now|SEND_WHATSAPP/i);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(mobileOverflow, false);
  } finally {
    await browser.close();
    await local.close();
  }
});

test('actual signed Rabbi provider login does not show Super Admin bridge chrome', async () => {
  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    await page.goto(`${baseUrl}/provider.html?section=crm`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-one-time-provider-crm-shell]');

    const bodyText = await page.locator('body').innerText();
    assert.match(bodyText, /RABBI ACCOUNT/);
    assert.match(bodyText, /Sign Out/);
    assert.doesNotMatch(bodyText, /Back to Super Admin|Return to Super Admin|Scoped Rabbi workspace|ADMIN ON RABBI ACCOUNT|opened by Super Admin/i);
    assert.doesNotMatch(bodyText, /TEST Parent|TEST Student|test\.parent|BNA Academy/i);
    assert.equal(await page.locator('#oneTimeAdminProviderBanner').count(), 0);
    assert.equal(await page.locator('[data-one-time-provider-crm-shell]').count(), 1);
    assert.equal(await page.locator('.one-time-crm-workbench').count(), 1);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(mobileOverflow, false);
  } finally {
    await browser.close();
    await local.close();
  }
});

test('One Time provider review preserves the requested section instead of resetting to Overview', () => {
  const helperBlock = sourceBlock(
    providerHtml,
    /function oneTimeReviewInitialSection\(\)/,
    /function updateProviderSectionUrl\(section\)/
  );
  const renderBlock = sourceBlock(
    providerHtml,
    /function renderOneTimeProviderReview\(data, viewAsSession = null\)/,
    /async function loadSession\(\)/
  );

  assert.match(helperBlock, /providerSectionFromLocation\(\)/);
  assert.match(helperBlock, /providerSections\(\)\.some\(item => item\.id === section\)/);
  assert.match(renderBlock, /activeProviderSection = oneTimeReviewInitialSection\(\);/);
  assert.match(renderBlock, /setProviderSection\(activeProviderSection\);/);
  assert.doesNotMatch(renderBlock, /activeProviderSection = 'overview';/);
  assert.doesNotMatch(renderBlock, /setProviderSection\('overview'\);/);
});

test('One Time provider review updates overview cards in place and hides inactive panels until selection', () => {
  const renderBlock = sourceBlock(
    providerHtml,
    /function renderOneTimeProviderReview\(data, viewAsSession = null\)/,
    /async function loadSession\(\)/
  );

  assert.match(renderBlock, /querySelector\('\[data-one-time-overview-cards\]'\)/);
  assert.match(renderBlock, /dataset\.oneTimeOverviewCards = 'true'/);
  assert.doesNotMatch(renderBlock, /overviewPanel\?\.appendChild\(overviewList\)/);
  assert.match(renderBlock, /classList\.add\('provider-section-hidden'\)/);
  assert.doesNotMatch(renderBlock, /classList\.remove\('provider-section-hidden'\)/);
});

test('One Time provider review keeps Communications selected through load, tab switch, and re-render', async () => {
  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    await page.goto(`${baseUrl}/provider.html?review=one-time&section=communications`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-provider-nav="communications"].active');

    assert.equal(await page.locator('[data-provider-section="communications"]').isVisible(), true);
    assert.equal(await page.locator('[data-provider-section="overview"]').isVisible(), false);
    assert.equal(await page.locator('[data-provider-section="overview"] [data-one-time-overview-cards]').count(), 1);

    await page.locator('#providerNav [data-provider-nav="crm"]').click();
    assert.equal(await page.locator('[data-provider-section="crm"]').isVisible(), true);
    assert.match(page.url(), /section=crm/);

    await page.locator('#providerNav [data-provider-nav="communications"]').click();
    assert.equal(await page.locator('[data-provider-section="communications"]').isVisible(), true);
    assert.match(page.url(), /section=communications/);

    await page.evaluate(async () => {
      const data = await fetch('/api/one-time-review/provider').then((response) => response.json());
      renderOneTimeProviderReview(data);
    });
    await page.waitForSelector('[data-provider-nav="communications"].active');
    assert.equal(await page.locator('[data-provider-section="communications"]').isVisible(), true);
    assert.equal(await page.locator('[data-provider-section="overview"] [data-one-time-overview-cards]').count(), 1);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(mobileOverflow, false);
  } finally {
    await browser.close();
    await local.close();
  }
});

test('One Time Rabbi CRM, mailbox, and access review hide Super Admin setup diagnostics', async () => {
  assert.match(providerHtml, /Provider access boundary/);
  assert.match(providerHtml, /Rabbi \/ One Time workspace/);
  assert.doesNotMatch(
    providerHtml,
    /Eli Scheller can operate inside rabbi_sheller_provider \/ one_time_mishnah_class|super-admin access|Super Admin diagnostics/i,
  );

  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });

    await page.goto(`${baseUrl}/provider.html?review=one-time&section=crm`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-provider-nav="crm"].active');
    const crmText = await page.locator('[data-provider-section="crm"]').innerText();
    assert.match(crmText, /One Time CRM Inbox/);
    assert.equal(await page.locator('[data-one-time-provider-crm-shell]').count(), 1);
    assert.equal(await page.locator('.one-time-crm-workbench').count(), 1);
    assert.equal(await page.locator('.one-time-crm-detail').count(), 1);
    assert.match(crmText, /Open Inbox/);
    assert.match(crmText, /Preview Email/);
    assert.match(crmText, /Draft Message/);
    assert.match(crmText, /Selected CRM view/);
    assert.match(crmText, /Parent records|Parent/);
    assert.doesNotMatch(crmText, /TEST Parent One Time|TEST Student One Time|Message Actions/);
    assert.doesNotMatch(crmText, /configured|not configured|webhook|runtime config|Needs live policy|Needs sender decision|Bulk email locked|Access Checklist|Commercial Model|External Apps|rabbi_sheller_provider|one_time_mishnah_class|Super Admin diagnostics/i);

    await page.goto(`${baseUrl}/provider.html?review=one-time&section=mailbox`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-provider-nav="mailbox"].active');
    const mailboxText = await page.locator('[data-provider-section="mailbox"]').innerText();
    assert.match(mailboxText, /info@onetimeonetime\.com/);
    assert.match(mailboxText, /Worksheet link question/);
    assert.match(mailboxText, /Preview Email/);
    assert.match(mailboxText, /Save Draft/);
    assert.doesNotMatch(mailboxText, /configured|not configured|Inbound webhook|runtime config|Needs live policy|Needs sender decision|Bulk email locked|Provider login required|rabbi_sheller_provider|one_time_mishnah_class|Super Admin diagnostics/i);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(mobileOverflow, false);
  } finally {
    await browser.close();
    await local.close();
  }
});

test('One Time provider review has premium topbar logo and active provider nav state', async () => {
  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    await page.goto(`${baseUrl}/provider.html?review=one-time&section=crm`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.portal-topbar-link.active[aria-current="page"]');

    const activeText = await page.locator('.portal-topbar-link.active[aria-current="page"]').first().innerText();
    assert.equal(activeText.trim(), 'Provider');

    const activeColors = await page.locator('.portal-topbar-link.active[aria-current="page"]').first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { backgroundColor: style.backgroundColor, color: style.color };
    });
    assert.match(activeColors.backgroundColor, /rgb\(237,\s*229,\s*24\)/);
    assert.match(activeColors.color, /rgb\(8,\s*9,\s*16\)|rgb\(17,\s*17,\s*17\)/);

    const logoBox = await page.locator('.brand-mark').boundingBox();
    assert.ok(logoBox, 'expected brand mark');
    assert.ok(logoBox.width >= 56, `expected desktop logo width >= 56, got ${logoBox.width}`);
    assert.ok(logoBox.height >= 56, `expected desktop logo height >= 56, got ${logoBox.height}`);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileLogoBox = await page.locator('.brand-mark').boundingBox();
    assert.ok(mobileLogoBox, 'expected mobile brand mark');
    assert.ok(mobileLogoBox.width >= 44, `expected mobile logo width >= 44, got ${mobileLogoBox.width}`);
    assert.ok(mobileLogoBox.height >= 44, `expected mobile logo height >= 44, got ${mobileLogoBox.height}`);
  } finally {
    await browser.close();
    await local.close();
  }
});

test('One Time Rabbi review refuses old setup-only sections', async () => {
  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    for (const section of ['commercial', 'integrations', 'access']) {
      await page.goto(`${baseUrl}/provider.html?review=one-time&section=${section}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-provider-nav="overview"].active');
      assert.equal(await page.locator(`[data-provider-nav="${section}"]`).count(), 0);
      assert.equal(await page.locator('[data-provider-section="overview"]').isVisible(), true);
    }
  } finally {
    await browser.close();
    await local.close();
  }
});
