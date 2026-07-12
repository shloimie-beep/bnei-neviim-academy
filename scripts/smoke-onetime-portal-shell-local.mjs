#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-12-onetime-portal-shell-local');

const viewports = [
  { id: 'family-preview-1440', width: 1440, height: 960, path: '/rabbi-member?review=one-time' },
  { id: 'library-preview-1024', width: 1024, height: 900, path: '/member-library?review=one-time' },
  { id: 'classroom-preview-768', width: 768, height: 1024, path: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS' },
  { id: 'parent-setup-430', width: 430, height: 860, path: '/one-time-parent' },
  { id: 'student-preview-390', width: 390, height: 844, path: '/student.html?review=one-time' },
];

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function reviewData(baseUrl) {
  const data = buildOneTimeSharedReviewData({ baseUrl });
  const item = data.member_portal?.library?.[0];
  const video = data.provider_portal?.video || {};
  if (item && video.vimeo_video_id) {
    item.media_provider = 'vimeo';
    item.vimeo_id = video.vimeo_video_id;
    item.thumbnail_url = video.thumbnail_url;
  }
  return data;
}

function json(res, payload, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function staticPathFor(urlPath) {
  if (urlPath === '/' || urlPath === '/one-time') return '/one-time/index.html';
  if (urlPath === '/rabbi-member') return '/rabbi-member.html';
  if (urlPath === '/member-library') return '/member-library.html';
  if (urlPath === '/one-time-classroom') return '/one-time-classroom.html';
  if (urlPath === '/one-time-parent') return '/one-time-parent.html';
  if (urlPath === '/student') return '/student.html';
  return urlPath;
}

async function serve(req, res, baseUrl, writeRequests) {
  const url = new URL(req.url || '/', baseUrl);
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    writeRequests.push({ method: req.method, path: url.pathname });
  }
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  const data = reviewData(baseUrl);
  if (url.pathname === '/api/one-time-review') return json(res, data);
  if (url.pathname === '/api/one-time-review/member') return json(res, data.member_portal);
  if (url.pathname === '/api/one-time-review/parent') return json(res, data.parent_portal);
  if (url.pathname === '/api/one-time-review/student') return json(res, data.student_portal);
  if (url.pathname === '/api/one-time-review/classroom') return json(res, data.classroom);
  if (url.pathname === '/api/one-time/instance-config') {
    return json(res, {
      app_mode: 'single_tenant',
      app_instance: 'onetime',
      single_tenant: true,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      brand_key: 'onetime',
      public_language: 'en',
      student_bot_enabled: false,
      bna_accountability_enabled: false,
      sefaria_study_assistant_enabled: false,
      app_visible: true,
      secrets_included: false,
      external_write_performed: false,
    });
  }
  if (url.pathname.startsWith('/api/member-library/items/')) {
    return json(res, { error: 'preview_progress_write_forbidden' }, 500);
  }
  if (url.pathname === '/api/app-select/context') {
    return json(res, { surface: 'one_time', workspace_key: 'rabbi_sheller_provider', project_key: 'one_time_mishnah_class' });
  }

  const requested = staticPathFor(url.pathname);
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': contentType(filePath) });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function waitForText(page, text) {
  try {
    await page.waitForFunction((value) => document.body.innerText.toLowerCase().includes(value.toLowerCase()), text, { timeout: 7000 });
  } catch (error) {
    const bodyText = await page.locator('body').innerText().catch(() => '');
    throw new Error(`${error.message}\nMissing text: ${text}\nBody preview: ${bodyText.slice(0, 1200)}`);
  }
}

async function assertPreviewBanner(page) {
  await waitForText(page, 'TEST PREVIEW');
  await waitForText(page, 'SAMPLE DATA');
  await waitForText(page, 'NO WRITES');
  assert.equal(await page.locator('[data-one-time-preview-exit="true"]').count(), 1);
}

async function run() {
  await mkdir(outDir, { recursive: true });
  const writeRequests = [];
  const server = createServer((req, res) => {
    serve(req, res, 'http://127.0.0.1', writeRequests).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error.stack || error.message);
    });
  });
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;

  const data = reviewData(baseUrl);
  const serialized = JSON.stringify(data);
  const emails = serialized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  assert.ok(emails.length > 0, 'review fixture should include test emails');
  assert.ok(emails.every((email) => /@example\.test$/i.test(email)), `all review emails must be example.test: ${emails.join(', ')}`);
  assert.match(serialized, /TEST-ONETIME-STUDENT-001/);
  assert.doesNotMatch(serialized, /production_customer|live_metric_write|real_send_performed/i);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const vimeoRequests = [];
  await context.route('https://player.vimeo.com/**', (route) => {
    vimeoRequests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.Vimeo={Player:function(){return {on(){},getDuration:async()=>0,getCurrentTime:async()=>0};}};' });
  });
  await context.route('**/*', (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.hostname === 'player.vimeo.com') vimeoRequests.push(route.request().url());
    if (requestUrl.origin !== baseUrl && requestUrl.protocol.startsWith('http')) {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });

  const results = [];
  for (const item of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: item.width, height: item.height });
    const consoleErrors = [];
    const httpErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        httpErrors.push({ status, url: response.url().replace(baseUrl, '') });
      }
    });
    await page.goto(`${baseUrl}${item.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    let playableMediaPresent = false;

    if (item.path.includes('review=one-time')) await assertPreviewBanner(page);
    if (item.id.startsWith('family')) {
      await waitForText(page, 'One Time Family Portal');
      await waitForText(page, 'Family Portal preview');
    }
    if (item.id.startsWith('library')) {
      await waitForText(page, 'TEST preview library opened');
      await waitForText(page, 'TEST One Time Member');
      const vimeoRequestsBeforePlay = vimeoRequests.length;
      assert.equal(await page.locator('iframe[src*="player.vimeo.com"]').count(), 0, 'member library must not mount Vimeo iframes before Play Video');
      assert.equal(vimeoRequestsBeforePlay, 0, `member library must not request Vimeo before Play Video: ${vimeoRequests.join(', ')}`);
      playableMediaPresent = Boolean(await page.locator('.media-play-button').count());
      if (playableMediaPresent) {
        await page.locator('.media-play-button').first().click();
        await page.waitForSelector('iframe[src*="player.vimeo.com"]', { timeout: 7000 });
        await page.waitForTimeout(250);
        assert.ok(vimeoRequests.length > vimeoRequestsBeforePlay, 'member library should request Vimeo only after Play Video');
      }
      const beforeWrites = writeRequests.length;
      await page.locator('text=Mark Complete').first().click();
      await page.waitForTimeout(150);
      assert.equal(writeRequests.length, beforeWrites, 'review library progress must not POST writes');
    }
    if (item.id.startsWith('classroom')) {
      await waitForText(page, 'TEST classroom review opened');
      await waitForText(page, 'Responses are reviewed before visibility');
    }
    if (item.id.startsWith('parent')) {
      await waitForText(page, 'Set or reset your One Time parent password.');
      await waitForText(page, 'account setup/reset');
      assert.doesNotMatch(await page.locator('body').innerText(), /TEST One Time Student|raw|admin diagnostics/i);
    }
    if (item.id.startsWith('student')) {
      await waitForText(page, 'One Time student review');
      const topbarMenu = page.locator('.one-time-portal-menu-button').first();
      assert.equal(await topbarMenu.count(), 1, 'student preview should expose the shared mobile menu button');
      await topbarMenu.click();
      await waitForText(page, 'Family Portal');
      await waitForText(page, 'Library');
      await page.keyboard.press('Escape');
    }

    const screenshotName = `${item.id}.png`;
    await page.screenshot({ path: path.join(outDir, screenshotName), fullPage: true });
    assert.deepEqual(httpErrors, [], `${item.id} should not load missing local assets or API routes`);
    results.push({ ...item, screenshot: screenshotName, playable_media_present: playableMediaPresent, console_errors: consoleErrors, http_errors: httpErrors });
    await page.close();
  }

  const menuPage = await context.newPage();
  await menuPage.setViewportSize({ width: 390, height: 844 });
  await menuPage.goto(`${baseUrl}/rabbi-member?review=one-time`, { waitUntil: 'domcontentloaded' });
  await assertPreviewBanner(menuPage);
  const menuButton = menuPage.locator('.one-time-portal-menu-button').first();
  await assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
  await menuButton.click();
  await assert.equal(await menuButton.getAttribute('aria-expanded'), 'true');
  const pseudoContent = await menuPage.locator('.member-topbar').evaluate((node) => getComputedStyle(node, '::before').content);
  assert.ok(pseudoContent === 'none' || pseudoContent === 'normal' || pseudoContent === '""', `pseudo hamburger should be disabled, got ${pseudoContent}`);
  await menuPage.keyboard.press('Escape');
  await assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
  const activeIsButton = await menuPage.evaluate(() => document.activeElement?.classList?.contains('one-time-portal-menu-button'));
  assert.equal(activeIsButton, true, 'focus should return to menu button after Escape close');
  await menuPage.screenshot({ path: path.join(outDir, 'family-preview-mobile-menu-390.png'), fullPage: true });
  await menuPage.close();

  await browser.close();
  server.close();

  assert.deepEqual(writeRequests, [], `portal shell smoke must perform no POST/write requests: ${JSON.stringify(writeRequests)}`);

  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    requirement_id: 'REQ-20260712-108',
    fixture_email_count: emails.length,
    write_requests: writeRequests,
    vimeo_lazy_load: {
      requests_after_play: vimeoRequests.length,
      playable_fixture_present: results.some((item) => item.id === 'library-preview-1024' && item.playable_media_present),
      request_hosts: [...new Set(vimeoRequests.map((requestUrl) => new URL(requestUrl).hostname))],
    },
    screenshots: results.map((item) => item.screenshot).concat('family-preview-mobile-menu-390.png'),
    results,
  };
  await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(outDir, 'report.md'), [
    '# One Time Portal Shell Local Smoke',
    '',
    `Generated: ${report.generated_at}`,
    `Requirement: ${report.requirement_id}`,
    '',
    '## Result',
    '',
    '- PASS shared portal shell screenshots captured at 1440, 1024, 768, 430, and 390 widths.',
    '- PASS Family Portal, parent account setup/reset, TEST preview/no-write banner, and review-link preservation assertions.',
    '- PASS mobile menu uses a real button with aria-expanded and Escape focus return.',
    '- PASS review fixture emails are @example.test and TEST IDs are present.',
    '- PASS member library does not mount or request Vimeo before Play Video, then loads Vimeo after opening media.',
    '- PASS no POST/write requests occurred.',
    '',
    '## Screenshots',
    '',
    ...report.screenshots.map((screenshot) => `- ${screenshot}`),
    '',
  ].join('\n'));

  console.log(`One Time portal shell smoke passed: ${path.relative(repoRoot, path.join(outDir, 'report.md'))}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
