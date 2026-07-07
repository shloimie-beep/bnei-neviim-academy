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

function sourceBlock(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  assert.notEqual(start, -1, `missing start pattern ${startPattern}`);
  const tail = source.slice(start);
  const end = tail.search(endPattern);
  assert.notEqual(end, -1, `missing end pattern ${endPattern}`);
  return tail.slice(0, end);
}

test('One Time provider review and view-as sessions use the same Rabbi-facing section model', () => {
  const sectionsBlock = sourceBlock(
    providerHtml,
    /if \(oneTimeReviewMode \|\| oneTimeViewAsRabbiToken\) \{/,
    /const sections = providerIsPlusPlan/
  );

  assert.match(sectionsBlock, /oneTimeReviewMode \|\| oneTimeViewAsRabbiToken/);
  for (const section of ['overview', 'crm', 'mailbox', 'communications', 'content', 'class_setup', 'class_media', 'users', 'badges', 'activity']) {
    assert.match(sectionsBlock, new RegExp(`id: '${section}'`), `missing ${section} review section`);
  }
  for (const hiddenSection of ['commercial', 'integrations', 'access']) {
    assert.doesNotMatch(sectionsBlock, new RegExp(`id: '${hiddenSection}'`), `review model should not expose ${hiddenSection}`);
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

test('One Time Rabbi CRM and mailbox review hide Super Admin setup diagnostics', async () => {
  const local = createProviderReviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });

    await page.goto(`${baseUrl}/provider.html?review=one-time&section=crm`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-provider-nav="crm"].active');
    const crmText = await page.locator('[data-provider-section="crm"]').innerText();
    assert.match(crmText, /One Time CRM Inbox/);
    assert.match(crmText, /Open Inbox/);
    assert.match(crmText, /Preview Email/);
    assert.match(crmText, /Draft Message/);
    assert.match(crmText, /TEST Parent One Time/);
    assert.doesNotMatch(crmText, /configured|not configured|webhook|runtime config|Needs live policy|Needs sender decision|Bulk email locked|Access Checklist|Commercial Model|External Apps/i);

    await page.goto(`${baseUrl}/provider.html?review=one-time&section=mailbox`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-provider-nav="mailbox"].active');
    const mailboxText = await page.locator('[data-provider-section="mailbox"]').innerText();
    assert.match(mailboxText, /info@onetimeonetime\.com/);
    assert.match(mailboxText, /Worksheet link question/);
    assert.match(mailboxText, /Preview Email/);
    assert.match(mailboxText, /Save Draft/);
    assert.doesNotMatch(mailboxText, /configured|not configured|Inbound webhook|runtime config|Needs live policy|Needs sender decision|Bulk email locked|Provider login required/i);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(mobileOverflow, false);
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
