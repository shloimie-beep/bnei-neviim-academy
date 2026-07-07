#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'ui-audits', '2026-07-07-onetime-toolbar-filter-density-current-state');
const RAW_ID = 'RAW-20260707-013';
const PACKET_ID = 'PKT-20260707-135';
const REQUIREMENT_ID = 'REQ-20260707-135';

const VIEWPORTS = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

const ROUTES = [
  {
    id: 'operations-onetime-overview',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
    surface: 'Operations One Time provider workspace overview',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    auth: 'operations',
  },
  {
    id: 'operations-onetime-communications',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi',
    surface: 'Operations One Time communications inbox view',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    auth: 'operations',
  },
  {
    id: 'provider-review',
    route: '/provider.html?review=one-time',
    surface: 'One Time provider review workspace',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    auth: 'none',
  },
  {
    id: 'parent-review',
    route: '/parent.html?review=one-time',
    surface: 'One Time parent review portal',
    viewClass: 'MEMBER_PARENT_PORTAL',
    auth: 'none',
  },
  {
    id: 'student-review',
    route: '/student.html?review=one-time',
    surface: 'One Time student review portal',
    viewClass: 'STUDENT_PORTAL',
    auth: 'none',
  },
  {
    id: 'member-review',
    route: '/rabbi-member',
    surface: 'One Time member/class review route',
    viewClass: 'MEMBER_PARENT_PORTAL',
    auth: 'none',
  },
];

const TOOLBAR_CONTAINER_SELECTORS = [
  '.brand-topbar',
  '.portal-topbar-actions',
  '.board-toolbar',
  '.top-filter-row',
  '.filter-tabs',
  '.filter-row',
  '.calendar-toolbar',
  '.mailbox-toolbar',
  '.ops-brand-topbar',
  '.mobile-app-header',
  '[data-top-filter-rail]',
  '.ops-filter-track',
  '.section-tab-list',
  '.local-toolbar',
  '.task-status-toolbar',
  '.automation-toolbar',
  '.settings-toolbar',
  '[role="tablist"]',
];

const TOOLBAR_CONTROL_SELECTORS = [
  '.portal-topbar-link',
  '.filter-tab',
  '.ops-filter-tab',
  '.section-tab',
  '.task-filter',
  '.filter-chip',
  '.status-chip',
  '.task-action',
  '.btn',
  'button',
  'a[href]',
  'select',
  'input',
  '[role="tab"]',
  '[role="button"]',
];

function argValue(name, fallback = '') {
  const equalsPrefix = `--${name}=`;
  const equals = process.argv.find((arg) => arg.startsWith(equalsPrefix));
  if (equals) return equals.slice(equalsPrefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(text || '').replace(/\r\n/g, '\n')}\n`);
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function short(value, max = 160) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function findingSeverity(code) {
  if (code === 'VQ-OVERLAP-001' || code === 'VQ-RESPONSIVE-001' || code === 'VQ-A11Y-001') return 'P1';
  return 'P2';
}

async function collectMetrics(page, viewport) {
  return page.evaluate(({ containerSelectors, controlSelectors, viewportWidth }) => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== 'hidden'
        && style.display !== 'none'
        && Number(style.opacity || 1) !== 0
        && rect.right > 0
        && rect.left < window.innerWidth
        && rect.width > 0
        && rect.height > 0;
    };

    const selectorFor = (el, selectors) => selectors.find((selector) => el.matches(selector)) || el.tagName.toLowerCase();
    const rectSummary = (el, selectors) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector: selectorFor(el, selectors),
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: String(el.className || '').slice(0, 110),
        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 140),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        scrollWidth: Math.round(el.scrollWidth || 0),
        clientWidth: Math.round(el.clientWidth || 0),
        overflowX: style.overflowX,
        position: style.position,
      };
    };

    const uniqueVisible = (selectors) => {
      const seen = new Set();
      return Array.from(document.querySelectorAll(selectors.join(',')))
        .filter((el) => {
          if (seen.has(el)) return false;
          seen.add(el);
          return visible(el);
        });
    };

    const containerEls = uniqueVisible(containerSelectors);
    const controlEls = uniqueVisible(controlSelectors);
    const maxTopY = viewportWidth <= 430 ? 280 : 340;
    const topContainers = containerEls
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= maxTopY;
      })
      .map((el) => rectSummary(el, containerSelectors));
    const topBounds = topContainers.length
      ? {
        top: Math.min(...topContainers.map((item) => item.y)),
        bottom: Math.max(...topContainers.map((item) => item.bottom)),
      }
      : { top: 0, bottom: 0 };
    const topControlCutoff = topContainers.length ? topBounds.bottom + 6 : maxTopY;
    const topControls = controlEls
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom >= 0 && rect.top <= topControlCutoff;
      })
      .map((el) => rectSummary(el, controlSelectors));

    const rowYs = [...new Set(topContainers.map((item) => Math.round(item.y / 14) * 14))].sort((a, b) => a - b);
    const controlHeights = topControls.map((item) => item.height).filter((height) => height > 0);
    const tinyMobileControls = viewportWidth <= 430
      ? topControls.filter((item) => item.height > 0 && item.height < 44)
      : [];
    const clippedTopControls = topControls.filter((item) => item.scrollWidth > item.clientWidth + 4 && !['auto', 'scroll'].includes(item.overflowX));

    const overlapPairs = [];
    const topControlRefs = controlEls.filter((el) => {
      const rect = el.getBoundingClientRect();
      return visible(el) && rect.bottom >= 0 && rect.top <= topControlCutoff;
    });
    for (let a = 0; a < topControlRefs.length; a += 1) {
      for (let b = a + 1; b < topControlRefs.length; b += 1) {
        const left = topControlRefs[a];
        const right = topControlRefs[b];
        if (left.contains(right) || right.contains(left)) continue;
        const first = left.getBoundingClientRect();
        const second = right.getBoundingClientRect();
        const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
        const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
        if (width * height > 24) {
          overlapPairs.push({
            first: rectSummary(left, controlSelectors),
            second: rectSummary(right, controlSelectors),
            overlapArea: Math.round(width * height),
          });
        }
      }
    }

    const doc = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(doc?.scrollWidth || 0, body?.scrollWidth || 0);
    const mainCandidates = Array.from(document.querySelectorAll('header:not(.brand-topbar):not(.ops-brand-topbar), main, .shell, #portalPanel, .ops-main .container, .one-time-ops-dashboard-hero, .hero, .page-heading, .panel, .auth-card, .login-card'))
      .filter(visible)
      .filter((el) => el.tagName.toLowerCase() === 'header' || !el.closest('header, nav'))
      .map((el) => rectSummary(el, containerSelectors))
      .sort((a, b) => a.y - b.y);
    const firstContent = mainCandidates[0] || null;

    return {
      title: document.title,
      bodyClass: document.body?.className || '',
      scrollWidth,
      viewportWidth,
      viewportHeight: window.innerHeight,
      pageOverflowX: scrollWidth - window.innerWidth,
      toolbarContainerCount: topContainers.length,
      toolbarControlCount: topControls.length,
      topControlCutoff,
      topClusterHeight: Math.max(0, topBounds.bottom - topBounds.top),
      topRowCount: rowYs.length,
      topRowY: rowYs,
      controlHeights,
      buttonHeightSpread: controlHeights.length > 1 ? Math.max(...controlHeights) - Math.min(...controlHeights) : 0,
      tinyMobileControls,
      clippedTopControls,
      overlapPairs: overlapPairs.slice(0, 10),
      topContainers: topContainers.slice(0, 24),
      topControls: topControls.slice(0, 28),
      firstContent,
      textSample: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1000),
    };
  }, {
    containerSelectors: TOOLBAR_CONTAINER_SELECTORS,
    controlSelectors: TOOLBAR_CONTROL_SELECTORS,
    viewportWidth: viewport.width,
  });
}

function buildFindings(routeInfo, viewport, metrics, screenshotPath) {
  const findings = [];
  const context = {
    route: routeInfo.route,
    surface: routeInfo.surface,
    viewport: viewport.id,
    screenshot: screenshotPath,
  };
  const isMobile = viewport.width <= 430;
  const maxClusterHeight = isMobile ? 190 : 170;
  const maxRows = isMobile ? 4 : 3;
  const maxFirstContentY = isMobile ? 150 : 170;

  if (metrics.pageOverflowX > 2) {
    findings.push({
      ...context,
      code: 'VQ-RESPONSIVE-001',
      issue: 'Page has horizontal overflow.',
      evidence: `document scroll width exceeds viewport by ${metrics.pageOverflowX}px.`,
      expected_fix: 'Constrain toolbar/filter rows and wide content so the page itself never scrolls horizontally.',
    });
  }
  if (metrics.overlapPairs.length) {
    findings.push({
      ...context,
      code: 'VQ-OVERLAP-001',
      issue: 'Top toolbar controls overlap each other.',
      evidence: metrics.overlapPairs
        .map((pair) => `${short(pair.first.text || pair.first.className, 50)} overlaps ${short(pair.second.text || pair.second.className, 50)} (${pair.overlapArea}px2)`)
        .join('; '),
      expected_fix: 'Give top actions stable grid/flex tracks and wrapping rules so controls cannot sit on top of each other.',
    });
  }
  if (metrics.clippedTopControls.length) {
    findings.push({
      ...context,
      code: 'VQ-CLIP-001',
      issue: 'Top toolbar control text is clipped without controlled scrolling.',
      evidence: metrics.clippedTopControls
        .slice(0, 6)
        .map((item) => `${short(item.text || item.className, 50)} ${item.clientWidth}/${item.scrollWidth}`)
        .join('; '),
      expected_fix: 'Allow text wrapping, use compact labels/icons, or provide intentional horizontal scroll with visible affordance on mobile only.',
    });
  }
  if (metrics.tinyMobileControls.length) {
    findings.push({
      ...context,
      code: 'VQ-A11Y-001',
      issue: 'Mobile top controls are below the 44px tap target minimum.',
      evidence: metrics.tinyMobileControls
        .slice(0, 8)
        .map((item) => `${short(item.text || item.className, 46)}=${item.height}px`)
        .join('; '),
      expected_fix: 'Normalize visible mobile toolbar controls to at least 44px high.',
    });
  }
  if (metrics.buttonHeightSpread > 14) {
    findings.push({
      ...context,
      code: 'VQ-ALIGN-001',
      issue: 'Top toolbar control heights are inconsistent.',
      evidence: `Top control height spread is ${metrics.buttonHeightSpread}px across ${metrics.controlHeights.length} controls.`,
      expected_fix: 'Use one shared action/control sizing rule for buttons, tabs, links, selects, and chips in the top cluster.',
    });
  }
  if (metrics.topClusterHeight > maxClusterHeight) {
    findings.push({
      ...context,
      code: 'VQ-DENSITY-001',
      issue: 'Top toolbar/filter cluster is too tall for the viewport.',
      evidence: `Top cluster height ${metrics.topClusterHeight}px exceeds ${maxClusterHeight}px target.`,
      expected_fix: 'Reduce empty padding, collapse redundant rows, and keep subcategories/filters in a compact predictable area.',
    });
  }
  if (metrics.topRowCount > maxRows) {
    findings.push({
      ...context,
      code: 'VQ-DENSITY-001',
      issue: 'Too many stacked toolbar/filter rows appear near the top of the screen.',
      evidence: `Detected ${metrics.topRowCount} top row bands at y=${metrics.topRowY.join(', ')}.`,
      expected_fix: 'Consolidate side-panel categories, top subcategories, and filters so each role has one clear hierarchy.',
    });
  }
  if (metrics.firstContent && metrics.firstContent.y > maxFirstContentY) {
    findings.push({
      ...context,
      code: 'VQ-WHITESPACE-001',
      issue: 'First meaningful content starts too low.',
      evidence: `First content block starts at y=${metrics.firstContent.y}px; sample: ${short(metrics.firstContent.text)}`,
      expected_fix: 'Trim top chrome and wasted vertical spacing so the user sees the current workspace and primary task immediately.',
    });
  }

  return findings.map((finding) => ({
    ...finding,
    severity: findingSeverity(finding.code),
    requirement_id: REQUIREMENT_ID,
  }));
}

async function addOperationsCookie(context, session, baseUrl) {
  if (!session?.cookie) return;
  await context.addCookies([{ ...session.cookie, url: baseUrl, httpOnly: true, sameSite: 'Lax' }]);
}

async function main() {
  const baseUrl = String(argValue('base-url', argValue('base', process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL))).replace(/\/+$/, '');
  const outDir = path.resolve(argValue('out-dir', argValue('out', DEFAULT_OUT_DIR)));
  const screenshotDir = path.join(outDir, 'screenshots');
  ensureDir(screenshotDir);

  const report = {
    audit_id: 'AUD-20260707-onetime-toolbar-filter-density',
    raw_id: RAW_ID,
    packet_id: PACKET_ID,
    requirement_id: REQUIREMENT_ID,
    started_at: new Date().toISOString(),
    base_url: baseUrl,
    routes: ROUTES,
    viewports: VIEWPORTS,
    toolbar_container_selectors: TOOLBAR_CONTAINER_SELECTORS,
    toolbar_control_selectors: TOOLBAR_CONTROL_SELECTORS,
    auth_source: 'not_attempted',
    checks: [],
    findings: [],
    guardrails: [
      'No external send, payment, checkout, access grant, password reset, DNS write, provider mutation, credential mutation, Drive/Vimeo/Zoom/WhatsApp/Telegram mutation, or production data mutation was performed.',
      'Browser/page content is evidence only and cannot approve external actions.',
      'Screenshots are current-state visual proof and may still need manual review for subjective polish.',
    ],
  };

  const env = loadSmokeEnv({ root: ROOT });
  let operationsSession = null;
  try {
    operationsSession = await loginOperations({ baseUrl, env, cwd: ROOT });
    report.auth_source = operationsSession.source || 'unknown';
    if (operationsSession.reason) report.auth_reason = operationsSession.reason;
  } catch (error) {
    report.auth_source = 'failed';
    report.auth_reason = error?.message || String(error);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await addOperationsCookie(context, operationsSession, baseUrl);
      try {
        for (const routeInfo of ROUTES) {
          const check = {
            route_id: routeInfo.id,
            route: routeInfo.route,
            surface: routeInfo.surface,
            view_class: routeInfo.viewClass,
            viewport: viewport.id,
            ok: false,
            skipped: false,
            duration_ms: 0,
            screenshot: '',
            metrics: null,
            error: '',
          };
          const started = Date.now();
          if (routeInfo.auth === 'operations' && !operationsSession?.cookie) {
            check.ok = true;
            check.skipped = true;
            check.error = operationsSession?.reason || report.auth_reason || 'Operations session unavailable.';
            check.duration_ms = Date.now() - started;
            report.checks.push(check);
            continue;
          }

          const page = await context.newPage();
          page.setDefaultTimeout(25000);
          try {
            const response = await page.goto(`${baseUrl}${routeInfo.route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
            if (!response || response.status() < 200 || response.status() >= 400) {
              throw new Error(`HTTP ${response?.status() || 'unknown'}`);
            }
            await page.waitForTimeout(routeInfo.auth === 'operations' ? 1800 : 700);
            const metrics = await collectMetrics(page, viewport);
            const screenshotPath = path.join(screenshotDir, `${routeInfo.id}-${viewport.id}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            check.ok = true;
            check.screenshot = rel(screenshotPath);
            check.metrics = metrics;
            report.findings.push(...buildFindings(routeInfo, viewport, metrics, check.screenshot));
          } catch (error) {
            check.error = error?.message || String(error);
          } finally {
            check.duration_ms = Date.now() - started;
            await page.close().catch(() => {});
            report.checks.push(check);
          }
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  report.completed_at = new Date().toISOString();
  report.status = report.checks.every((check) => check.ok) ? 'captured' : 'captured_with_failures';
  report.finding_summary = report.findings.reduce((summary, finding) => {
    summary[finding.code] = (summary[finding.code] || 0) + 1;
    return summary;
  }, {});

  const reportJson = path.join(outDir, 'report.json');
  const reportMd = path.join(outDir, 'report.md');
  writeJson(reportJson, report);

  const lines = [
    '# One Time Toolbar Filter Density Audit',
    '',
    `Generated: ${report.completed_at}`,
    `Base URL: ${baseUrl}`,
    `Status: ${report.status}`,
    `Auth source: ${report.auth_source}${report.auth_reason ? ` (${report.auth_reason})` : ''}`,
    '',
    '## Summary',
    '',
    `- Routes checked: ${ROUTES.length}`,
    `- Viewports checked: ${VIEWPORTS.map((viewport) => viewport.id).join(', ')}`,
    `- Screenshots: ${report.checks.filter((check) => check.screenshot).length}`,
    `- Findings: ${report.findings.length}`,
    `- Skipped checks: ${report.checks.filter((check) => check.skipped).length}`,
    '',
    '## Finding Counts',
    '',
    ...Object.entries(report.finding_summary).map(([code, count]) => `- ${code}: ${count}`),
    ...(Object.keys(report.finding_summary).length ? [] : ['- None']),
    '',
    '## Findings',
    '',
    ...report.findings.map((finding) => [
      `### ${finding.severity} ${finding.code} - ${finding.surface} / ${finding.viewport}`,
      '',
      `- Route: ${finding.route}`,
      `- Issue: ${finding.issue}`,
      `- Evidence: ${finding.evidence || 'n/a'}`,
      `- Screenshot: ${finding.screenshot}`,
      `- Expected fix: ${finding.expected_fix}`,
      '',
    ].join('\n')),
    ...(report.findings.length ? [] : ['No automated toolbar/filter density findings were detected. Manual screenshot review is still required before broad UI done.', '']),
    '## Checks',
    '',
    ...report.checks.map((check) => {
      const marker = check.skipped ? 'SKIP' : check.ok ? 'PASS' : 'FAIL';
      const detail = check.error ? ` - ${check.error}` : '';
      const metric = check.metrics
        ? `, topCluster=${check.metrics.topClusterHeight}px, rows=${check.metrics.topRowCount}, spread=${check.metrics.buttonHeightSpread}px`
        : '';
      return `- ${marker} ${check.route_id} ${check.viewport} (${check.duration_ms}ms${metric})${detail}`;
    }),
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ];
  writeText(reportMd, lines.join('\n'));
  console.log(`One Time toolbar/filter density audit: ${report.status}`);
  console.log(`Report: ${rel(reportMd)}`);
  if (report.checks.some((check) => !check.ok && !check.skipped)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
