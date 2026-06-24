#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.cwd();
const laneDir = path.join(root, 'ops', 'parallel-closeout', '2026-06-24-clean-slate-system-closeout', 'lanes', 'public-ui');
const screenshotDir = path.join(laneDir, 'screenshots');
const reportJson = path.join(laneDir, 'public-ui-smoke-report.json');
const reportMd = path.join(laneDir, 'PUBLIC-UI-SMOKE.md');
const deltaMd = path.join(laneDir, 'VISUAL-DELTA.md');
const productionBaseUrl = (process.env.BNA_PUBLIC_PRODUCTION_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');

const viewports = [
  { id: '390x844', width: 390, height: 844 },
  { id: '768x1024', width: 768, height: 1024 },
  { id: '1440x900', width: 1440, height: 900 },
];

const localRoutes = [
  { id: 'home', path: '/', expectsHeroGap: true, expectsFullRouteMap: true },
  { id: 'school', path: '/school', expectsFullRouteMap: true },
  { id: 'families', path: '/parents', expectsFullRouteMap: true },
  { id: 'service-providers', path: '/service-providers', expectsFullRouteMap: true },
  { id: 'provider-join', path: '/providers/join?onboard=provider', expectsFullRouteMap: true },
  { id: 'one-time', path: '/one-time', expectsOneTimeFooterMap: true },
  { id: 'blog', path: '/blog', expectsFullRouteMap: true },
  { id: 'faq', path: '/faq', expectsFullRouteMap: true },
  { id: 'signup', path: '/signup.html', expectsFullRouteMap: true },
  { id: 'signup-he', path: '/signup-he.html', expectsFullRouteMap: true },
  { id: 'parent-login', path: '/parent/login', publicMarketingChecks: false },
  { id: 'student-login', path: '/student/login', publicMarketingChecks: false },
  { id: 'provider-login', path: '/provider', publicMarketingChecks: false },
  { id: 'operations-login', path: '/operations-login.html', publicMarketingChecks: false },
];

const productionRoutes = [
  { id: 'home', path: '/', expectsHeroGap: true },
  { id: 'service-providers', path: '/service-providers' },
  { id: 'one-time', path: '/one-time' },
  { id: 'blog', path: '/blog' },
  { id: 'faq', path: '/faq' },
  { id: 'signup', path: '/signup.html' },
];

const aliasChecks = [
  { path: '/register', expected: [200] },
  { path: '/families', expected: [200] },
  { path: '/parent-app', expected: [200] },
  { path: '/providers', expected: [200] },
  { path: '/community', expected: [200] },
  { path: '/he', expected: [200] },
  { path: '/he/blog', expected: [200] },
  { path: '/he/faq', expected: [200] },
  { path: '/he/school', expected: [200] },
  { path: '/he/parents', expected: [200] },
  { path: '/he/service-providers', expected: [200] },
  { path: '/one-time/mishnayos', expected: [200] },
  { path: '/one-time/member-login', expected: [302] },
];

const routeDestinations = [
  ['Home', ['/', '/he']],
  ['School', ['/school', '/he/school']],
  ['Families', ['/parents', '/he/parents']],
  ['Provider Directory', ['/service-providers', '/he/service-providers']],
  ['One Time', ['/one-time']],
  ['Blog', ['/blog', '/he/blog']],
  ['FAQ', ['/faq', '/he/faq']],
  ['Register', ['/signup.html', '/signup-he.html']],
  ['Parent Login', ['/parent/login']],
  ['Student Login', ['/student/login']],
  ['Rabbi / Provider Login', ['/provider']],
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function escapeMd(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForReady(baseUrl, child) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < 30000) {
    if (child.exitCode !== null) throw new Error(`Local server exited early with code ${child.exitCode}`);
    try {
      const response = await fetch(baseUrl, { headers: { 'cache-control': 'no-cache' } });
      if (response.status === 200) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Local server did not become ready: ${lastError}`);
}

function parseRgb(value) {
  const match = String(value || '').match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const [r, g, b, a = '1'] = match[1].split(',').map((part) => Number(part.trim()));
  if (![r, g, b].every(Number.isFinite)) return null;
  return { r, g, b, a: Number.isFinite(a) ? a : 1 };
}

function srgb(value) {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  return 0.2126 * srgb(color.r) + 0.7152 * srgb(color.g) + 0.0722 * srgb(color.b);
}

function contrastRatio(foreground, background) {
  if (!foreground || !background) return null;
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

async function gitHead() {
  return await new Promise((resolve) => {
    const child = spawn('git', ['rev-parse', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.on('close', () => resolve(output.trim() || 'unknown'));
  });
}

async function installMockRoutes(context) {
  await context.route('**/api/torah-learning/public-summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: '2026-06-24',
        group: { groupPercentage: 15, tripUnlocked: false },
        metrics: {
          activeStudentCount: 5,
          completedStudentCount: 0,
          averageClassTripPercentage: 15,
          averageDailyCompletionPercentage: 0,
        },
      }),
    });
  });
  await context.route('**/api/provider-categories', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        categories: [
          { name: 'Torah classes', slug: 'torah-classes' },
          { name: 'Tutoring', slug: 'tutoring' },
        ],
      }),
    });
  });
  await context.route('**/api/providers**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        providers: [
          {
            display_name: 'BNA Provider Preview',
            slug: 'bna-provider-preview',
            short_description: 'Approved local preview row used for visual QA.',
            location_label: 'Beit Shemesh',
            categories: [{ name: 'Torah classes', slug: 'torah-classes' }],
            languages: ['English', 'Hebrew'],
            offerings: [
              {
                title: 'Small-group Torah support',
                offering_type: 'class',
                age_range: '8-13',
                schedule_text: 'Weekly',
                is_free: true,
                description: 'A public-safe listing row for layout and filter checks.',
              },
            ],
          },
        ],
      }),
    });
  });
  await context.route('**/api/one-time/campaign', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        campaign: {
          headline: '30 DAYS TO JOIN - START WITH 30 DAYS FREE',
          deadline_configured: true,
          deadline_at: '2026-12-31T21:00:00.000Z',
          server_now: '2026-06-24T12:00:00.000Z',
          time_zone: 'Asia/Jerusalem',
        },
      }),
    });
  });
}

async function inspectPage({ browser, target, baseUrl, route, viewport, mockLocal }) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.width < 768,
    hasTouch: viewport.width < 768,
    colorScheme: 'light',
  });
  if (mockLocal) await installMockRoutes(context);

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon|Failed to load resource/i.test(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  const url = `${baseUrl}${route.path}`;
  const screenshotPath = path.join(screenshotDir, `${target}-${route.id}-${viewport.id}.png`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(500);

    if (viewport.width < 768) {
      const toggle = (await page.locator('.bna-site-nav .bna-site-nav-toggle').count())
        ? page.locator('.bna-site-nav .bna-site-nav-toggle').first()
        : page.locator('.nav-menu-toggle').first();
      if (await toggle.count()) {
        await toggle.click().catch(() => {});
        await page.waitForTimeout(150);
      }
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });

    const metrics = await page.evaluate(() => {
      function rgbAlpha(value) {
        const match = String(value || '').match(/rgba?\(([^)]+)\)/i);
        if (!match) return 0;
        const parts = match[1].split(',').map((part) => Number(part.trim()));
        return Number.isFinite(parts[3]) ? parts[3] : 1;
      }
      function visible(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
      }
      function effectiveBackground(el) {
        let node = el;
        while (node) {
          const style = getComputedStyle(node);
          if (rgbAlpha(style.backgroundColor) > 0.12) return style.backgroundColor;
          node = node.parentElement;
        }
        return 'rgb(255, 255, 255)';
      }
      function textOf(el) {
        return (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      }
      const header = Array.from(document.querySelectorAll('.bna-site-nav, body > nav, .site-header')).find(visible);
      const hero = document.querySelector('.hero');
      const headerRect = header?.getBoundingClientRect();
      const heroRect = hero?.getBoundingClientRect();
      const activeCandidates = Array.from(document.querySelectorAll(
        '.home-filter-chip.is-active, .filter-btn.is-active, .bna-site-nav-link.is-active, [role="tab"][aria-selected="true"], [aria-current="page"], [aria-pressed="true"]',
      )).filter(visible);
      const activeStates = activeCandidates.map((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          selector: el.matches('.home-filter-chip') ? '.home-filter-chip.is-active'
            : el.matches('.filter-btn') ? '.filter-btn.is-active'
              : el.matches('.bna-site-nav-link') ? '.bna-site-nav-link.is-active'
                : el.getAttribute('role') === 'tab' ? '[role="tab"][aria-selected="true"]'
                  : el.getAttribute('aria-pressed') === 'true' ? '[aria-pressed="true"]'
                    : '[aria-current="page"]',
          text: textOf(el).slice(0, 90),
          color: style.color,
          backgroundColor: effectiveBackground(el),
          ariaCurrent: el.getAttribute('aria-current') || '',
          ariaSelected: el.getAttribute('aria-selected') || '',
          ariaPressed: el.getAttribute('aria-pressed') || '',
          role: el.getAttribute('role') || '',
          width: rect.width,
          height: rect.height,
          hasMarker: Boolean(getComputedStyle(el, '::before').content && getComputedStyle(el, '::before').content !== 'none'),
        };
      });
      const visibleText = Array.from(document.querySelectorAll('body *'))
        .filter(visible)
        .map(textOf)
        .filter(Boolean);
      const placeholderHits = visibleText
        .filter((text) => /\b(coming soon|graphic placeholder|placeholder|lorem|todo|sample profile)\b/i.test(text))
        .slice(0, 20);
      const genericErrors = visibleText
        .filter((text) => /\b(could not load|unavailable|failed to load|error loading)\b/i.test(text))
        .slice(0, 20);
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .filter(visible)
        .map((heading) => ({ tag: heading.tagName.toLowerCase(), text: textOf(heading).slice(0, 90) }));
      const navLinks = Array.from(document.querySelectorAll('.bna-site-nav a, .bna-site-footer a, .footer-links a, .nav a'))
        .filter(visible)
        .map((link) => ({
          text: textOf(link),
          href: link.getAttribute('href') || '',
          ariaCurrent: link.getAttribute('aria-current') || '',
        }));
      const footerLinks = Array.from(document.querySelectorAll('.bna-site-footer a, .footer-links a'))
        .filter(visible)
        .map((link) => ({ text: textOf(link), href: link.getAttribute('href') || '' }));
      const skipLink = document.querySelector('.bna-site-skip-link');
      const skipHref = skipLink?.getAttribute('href') || '';
      const skipTarget = skipHref.startsWith('#') ? document.querySelector(skipHref) : null;
      const toggle = document.querySelector('.bna-site-nav .bna-site-nav-toggle, .nav-menu-toggle');
      const focusTarget = activeCandidates[0] || document.querySelector('.bna-site-nav a, button, a');
      if (focusTarget) focusTarget.focus();
      const focusStyle = focusTarget ? getComputedStyle(focusTarget) : null;
      const touchTargetFailures = Array.from(document.querySelectorAll('a, button, summary, input, select, textarea'))
        .filter(visible)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { text: textOf(el).slice(0, 60), tag: el.tagName.toLowerCase(), width: rect.width, height: rect.height };
        })
        .filter((item) => item.width < 24 || item.height < 24)
        .slice(0, 20);
      return {
        title: document.title,
        statusText: document.body ? '' : 'no body',
        header: headerRect ? { top: headerRect.top, bottom: headerRect.bottom, height: headerRect.height } : null,
        hero: heroRect ? { top: heroRect.top, bottom: heroRect.bottom, height: heroRect.height } : null,
        heroMarginTop: hero ? getComputedStyle(hero).marginTop : null,
        horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        activeStates,
        placeholderHits,
        genericErrors,
        headings,
        navLinks,
        footerLinks,
        skipLink: skipLink ? { href: skipHref, targetExists: Boolean(skipTarget) } : null,
        mobileMenuExpanded: toggle ? toggle.getAttribute('aria-expanded') === 'true' : null,
        focusVisible: focusStyle ? {
          outlineStyle: focusStyle.outlineStyle,
          outlineWidth: focusStyle.outlineWidth,
          boxShadow: focusStyle.boxShadow,
        } : null,
        landmarks: {
          nav: Boolean(document.querySelector('nav')),
          main: Boolean(document.querySelector('main, .hero')),
          footer: Boolean(document.querySelector('footer')),
        },
        touchTargetFailures,
      };
    });

    await context.close();
    const headerHeroGapPx = metrics.header && metrics.hero
      ? Number((metrics.hero.top - metrics.header.bottom).toFixed(2))
      : null;
    const activeStates = metrics.activeStates.map((state) => {
      const ratio = contrastRatio(parseRgb(state.color), parseRgb(state.backgroundColor));
      const semanticOk = Boolean(state.ariaCurrent || state.ariaSelected === 'true' || state.ariaPressed === 'true' || state.role === 'tab');
      return {
        ...state,
        contrastRatio: ratio == null ? null : Number(ratio.toFixed(2)),
        contrastOk: ratio != null && ratio >= 4.5,
        semanticOk,
      };
    });
    return {
      target,
      route: route.id,
      path: route.path,
      publicMarketingChecks: route.publicMarketingChecks !== false,
      viewport: viewport.id,
      url,
      screenshot: rel(screenshotPath),
      ok: true,
      headerHeroGapPx,
      headerHeroGapOk: !route.expectsHeroGap || (headerHeroGapPx != null && Math.abs(headerHeroGapPx) <= 1),
      heroMarginTop: metrics.heroMarginTop,
      horizontalOverflowPx: metrics.horizontalOverflowPx,
      activeStates,
      activeStateContrastOk: activeStates.every((state) => state.contrastOk),
      activeStateSemanticsOk: activeStates.every((state) => state.semanticOk),
      placeholderHits: metrics.placeholderHits,
      genericErrors: metrics.genericErrors,
      headings: metrics.headings,
      headingOrderOk: headingOrderOk(metrics.headings),
      navLinks: metrics.navLinks,
      footerLinks: metrics.footerLinks,
      routeMapOk: route.expectsFullRouteMap ? routeMapPresent(metrics.navLinks, metrics.footerLinks) : true,
      oneTimeFooterMapOk: route.expectsOneTimeFooterMap ? oneTimeFooterMapPresent(metrics.footerLinks) : true,
      duplicateVisibleLabels: duplicateVisibleLabels(metrics.navLinks),
      skipLinkOk: !route.expectsFullRouteMap || Boolean(metrics.skipLink?.targetExists),
      mobileMenuOk: viewport.width >= 768 || metrics.mobileMenuExpanded !== false,
      focusVisibleOk: focusVisibleOk(metrics.focusVisible),
      landmarksOk: Boolean(metrics.landmarks.nav && metrics.landmarks.main && metrics.landmarks.footer),
      touchTargetFailures: metrics.touchTargetFailures,
      consoleErrors,
    };
  } catch (error) {
    await context.close();
    return {
      target,
      route: route.id,
      path: route.path,
      publicMarketingChecks: route.publicMarketingChecks !== false,
      viewport: viewport.id,
      url,
      screenshot: fs.existsSync(screenshotPath) ? rel(screenshotPath) : '',
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function headingOrderOk(headings) {
  if (!headings.length) return false;
  const levels = headings.map((heading) => Number(heading.tag.slice(1))).filter(Number.isFinite);
  if (!levels.includes(1)) return false;
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] - levels[index - 1] > 1) return false;
  }
  return true;
}

function normalizeHref(href) {
  if (!href) return '';
  try {
    const url = new URL(href, 'https://bneineviimacademy.org');
    if (url.origin !== 'https://bneineviimacademy.org') return href;
    return `${url.pathname}${url.search}`.replace(/\/$/, '') || '/';
  } catch {
    return href;
  }
}

function routeMapPresent(navLinks, footerLinks) {
  const hrefs = new Set([...navLinks, ...footerLinks].map((link) => normalizeHref(link.href)));
  return routeDestinations.every(([, expectedHrefs]) => expectedHrefs.some((href) => hrefs.has(normalizeHref(href))));
}

function oneTimeFooterMapPresent(footerLinks) {
  const expected = ['BNA', 'School', 'Families', 'Provider Directory', 'One Time', 'Blog', 'FAQ', 'BNA Register', 'Member Login'];
  const labels = new Set(footerLinks.map((link) => link.text));
  return expected.every((label) => labels.has(label));
}

function duplicateVisibleLabels(navLinks) {
  const byLabel = new Map();
  for (const link of navLinks) {
    if (!link.text) continue;
    const href = normalizeHref(link.href);
    if (!byLabel.has(link.text)) byLabel.set(link.text, new Set());
    byLabel.get(link.text).add(href);
  }
  return [...byLabel.entries()]
    .filter(([, hrefs]) => hrefs.size > 1)
    .map(([label, hrefs]) => ({ label, hrefs: [...hrefs] }));
}

function focusVisibleOk(style) {
  if (!style) return false;
  const outlineWidth = Number.parseFloat(style.outlineWidth || '0');
  return outlineWidth >= 2 || (style.boxShadow && style.boxShadow !== 'none');
}

function localFailures(row) {
  const failures = [];
  const publicMarketingChecks = row.publicMarketingChecks !== false;
  if (!row.ok) failures.push(`load failed: ${row.error}`);
  if (row.headerHeroGapOk === false) failures.push(`header/hero gap ${row.headerHeroGapPx}px`);
  if (row.horizontalOverflowPx > 1) failures.push(`horizontal overflow ${row.horizontalOverflowPx}px`);
  if (row.activeStateContrastOk === false) failures.push('active state contrast failed');
  if (row.activeStateSemanticsOk === false) failures.push('active state semantics failed');
  if (publicMarketingChecks && row.placeholderHits?.length) failures.push(`placeholder text: ${row.placeholderHits.join('; ')}`);
  if (publicMarketingChecks && row.genericErrors?.length) failures.push(`generic error text: ${row.genericErrors.join('; ')}`);
  if (publicMarketingChecks && row.headingOrderOk === false) failures.push('heading order failed');
  if (row.routeMapOk === false) failures.push('public route map incomplete');
  if (row.oneTimeFooterMapOk === false) failures.push('One Time footer route map incomplete');
  if (row.duplicateVisibleLabels?.length) failures.push(`duplicate labels: ${JSON.stringify(row.duplicateVisibleLabels)}`);
  if (row.skipLinkOk === false) failures.push('skip link missing or target missing');
  if (row.mobileMenuOk === false) failures.push('mobile menu did not open');
  if (publicMarketingChecks && row.focusVisibleOk === false) failures.push('focus visibility failed');
  if (publicMarketingChecks && row.landmarksOk === false) failures.push('landmark coverage failed');
  if (publicMarketingChecks && row.touchTargetFailures?.length) failures.push(`small touch targets: ${JSON.stringify(row.touchTargetFailures)}`);
  if (row.consoleErrors?.length) failures.push(`console errors: ${row.consoleErrors.join('; ')}`);
  return failures;
}

async function runAliasChecks(baseUrl) {
  const results = [];
  for (const check of aliasChecks) {
    try {
      const response = await fetch(`${baseUrl}${check.path}`, { redirect: 'manual', headers: { 'cache-control': 'no-cache' } });
      results.push({
        path: check.path,
        status: response.status,
        location: response.headers.get('location') || '',
        ok: check.expected.includes(response.status),
      });
    } catch (error) {
      results.push({ path: check.path, status: 0, location: '', ok: false, error: error.message });
    }
  }
  return results;
}

function writeReports(report) {
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);
  const localRows = report.rows.filter((row) => row.target === 'integration-base-local');
  const productionRows = report.rows.filter((row) => row.target === 'production-public');
  const lines = [
    '# Public UI Closeout Smoke',
    '',
    `Generated: ${report.generated_at}`,
    `Base SHA: ${report.base_sha}`,
    `Production URL: ${report.production_base_url}`,
    `Result: ${report.summary.local_ok ? 'PASS' : 'FAIL'}`,
    '',
    'Guardrail: production checks are anonymous public browser reads only. No external credentials, database writes, deploys, sends, uploads, charges, DNS changes, or secret reads were performed.',
    '',
    '## Route Checks',
    '',
    '| Target | Route | Viewport | Gap px | Gap OK | Active contrast | Active semantics | Overflow px | Route map | Skip link | Focus | Screenshot | Failures |',
    '| --- | --- | --- | ---: | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
    ...localRows.map((row) => `| ${[
      row.target,
      row.path,
      row.viewport,
      row.headerHeroGapPx ?? 'n/a',
      row.headerHeroGapOk === false ? 'no' : 'yes',
      row.activeStateContrastOk === false ? 'no' : 'yes',
      row.activeStateSemanticsOk === false ? 'no' : 'yes',
      row.horizontalOverflowPx ?? 'n/a',
      row.routeMapOk === false || row.oneTimeFooterMapOk === false ? 'no' : 'yes',
      row.skipLinkOk === false ? 'no' : 'yes',
      row.focusVisibleOk === false ? 'no' : 'yes',
      row.screenshot || '',
      localFailures(row).join('; ') || 'none',
    ].map(escapeMd).join(' | ')} |`),
    '',
    '## Alias Checks',
    '',
    '| Path | Status | Location | OK |',
    '| --- | ---: | --- | --- |',
    ...report.alias_checks.map((row) => `| ${[row.path, row.status, row.location, row.ok ? 'yes' : 'no'].map(escapeMd).join(' | ')} |`),
    '',
    '## Production Read-Only Screenshots',
    '',
    '| Route | Viewport | Gap px | Overflow px | Screenshot | Notes |',
    '| --- | --- | ---: | ---: | --- | --- |',
    ...productionRows.map((row) => `| ${[
      row.path,
      row.viewport,
      row.headerHeroGapPx ?? 'n/a',
      row.horizontalOverflowPx ?? 'n/a',
      row.screenshot || '',
      row.ok ? 'captured' : row.error || 'failed',
    ].map(escapeMd).join(' | ')} |`),
    '',
  ];
  fs.writeFileSync(reportMd, `${lines.join('\n')}\n`);

  const deltas = [];
  for (const local of localRows) {
    const production = productionRows.find((row) => row.route === local.route && row.viewport === local.viewport);
    if (!production) continue;
    const gapDelta = local.headerHeroGapPx != null && production.headerHeroGapPx != null
      ? Math.abs(local.headerHeroGapPx - production.headerHeroGapPx)
      : null;
    if (gapDelta != null && gapDelta > 1) {
      deltas.push({
        route: local.path,
        viewport: local.viewport,
        selector: '.hero',
        local: `header/hero gap ${local.headerHeroGapPx}px`,
        production: `header/hero gap ${production.headerHeroGapPx}px`,
        expected: 'gap <= 1px',
        severity: production.headerHeroGapOk === false ? 'high' : 'info',
        fix: local.headerHeroGapOk ? 'branch already fixes local layout; production needs deployment after release approval' : 'fix branch CSS/markup',
        test: 'computed bounding rect assertion',
      });
    }
    if (local.activeStateSemanticsOk !== production.activeStateSemanticsOk) {
      deltas.push({
        route: local.path,
        viewport: local.viewport,
        selector: '.home-filter-chip.is-active, .filter-btn.is-active',
        local: `active semantics ${local.activeStateSemanticsOk ? 'pass' : 'fail'}`,
        production: `active semantics ${production.activeStateSemanticsOk ? 'pass' : 'fail'}`,
        expected: 'selected controls expose aria-pressed/current/selected',
        severity: production.activeStateSemanticsOk === false ? 'medium' : 'info',
        fix: local.activeStateSemanticsOk ? 'branch has aria state; production needs deployment after release approval' : 'add aria state',
        test: 'computed active-state semantics assertion',
      });
    }
  }
  const deltaLines = [
    '# Public UI Visual Delta',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '| Route | Viewport | Selector | Integration-base behavior | Production behavior | Expected behavior | Severity | Fix | Test |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...(deltas.length ? deltas.map((row) => `| ${[
      row.route,
      row.viewport,
      row.selector,
      row.local,
      row.production,
      row.expected,
      row.severity,
      row.fix,
      row.test,
    ].map(escapeMd).join(' | ')} |`) : ['| All compared routes | All compared viewports | n/a | No computed local/production delta | No computed local/production delta | Keep local assertions passing | info | none | lane smoke |']),
    '',
  ];
  fs.writeFileSync(deltaMd, `${deltaLines.join('\n')}\n`);
}

async function main() {
  ensureDir(laneDir);
  ensureDir(screenshotDir);
  const port = await freePort();
  const localBaseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      ONE_TIME_REVIEW_ONLY_NO_DB: '1',
      DATABASE_URL: '',
      BNA_OWNER_REVIEW_QA: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));

  let browser;
  let aliasResults = [];
  const rows = [];
  try {
    await waitForReady(localBaseUrl, child);
    browser = await chromium.launch({ headless: true });
    for (const viewport of viewports) {
      for (const route of localRoutes) {
        rows.push(await inspectPage({ browser, target: 'integration-base-local', baseUrl: localBaseUrl, route, viewport, mockLocal: true }));
      }
      for (const route of productionRoutes) {
        rows.push(await inspectPage({ browser, target: 'production-public', baseUrl: productionBaseUrl, route, viewport, mockLocal: false }));
      }
    }
    aliasResults = await runAliasChecks(localBaseUrl);
  } finally {
    if (browser) await browser.close();
    child.kill();
  }

  const localRows = rows.filter((row) => row.target === 'integration-base-local');
  const failures = localRows.flatMap((row) => localFailures(row).map((failure) => ({ route: row.path, viewport: row.viewport, failure })));
  for (const alias of aliasResults) {
    if (!alias.ok) failures.push({ route: alias.path, viewport: 'alias', failure: `status ${alias.status}` });
  }
  const report = {
    generated_at: new Date().toISOString(),
    base_sha: await gitHead(),
    local_base_url: localBaseUrl,
    production_base_url: productionBaseUrl,
    guardrails: {
      external_credentials: false,
      production_private_state_readback: false,
      production_database_mutation: false,
      deploy: false,
      external_write: false,
    },
    rows,
    alias_checks: aliasResults,
    summary: {
      local_ok: failures.length === 0,
      local_failure_count: failures.length,
      failures,
      production_rows_captured: rows.filter((row) => row.target === 'production-public' && row.ok).length,
    },
    server_log_tail: logs.join('').split(/\r?\n/).filter(Boolean).slice(-30),
  };
  writeReports(report);
  if (failures.length) {
    console.error(`Public UI closeout smoke failed. Report: ${rel(reportMd)}`);
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`Public UI closeout smoke passed. Report: ${rel(reportMd)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
