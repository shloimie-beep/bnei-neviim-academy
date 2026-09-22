#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'ui-audits', '2026-07-07-parent-student-login-ui-polish');

const VIEWPORTS = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-tablet-wide', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

const ROUTES = [
  {
    id: 'student-review',
    route: '/student.html?review=one-time',
    surface: 'One Time student review entry',
    viewClass: 'STUDENT_PORTAL',
  },
  {
    id: 'student-login',
    route: '/student/login',
    surface: 'Student login shell',
    viewClass: 'STUDENT_PORTAL',
  },
  {
    id: 'parent-login',
    route: '/parent/login',
    surface: 'Parent login shell',
    viewClass: 'MEMBER_PARENT_PORTAL',
  },
  {
    id: 'parent-review',
    route: '/parent.html?review=one-time',
    surface: 'One Time parent/member review entry',
    viewClass: 'MEMBER_PARENT_PORTAL',
  },
];

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) return match.slice(prefix.length);
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

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(value || '').replace(/\r\n/g, '\n')}\n`);
}

function posixRelative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function shortText(value, max = 140) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function severityForFinding(finding) {
  if (finding.code === 'VQ-SCOPE-001') return 'P0';
  if (finding.code === 'VQ-RESPONSIVE-001') return 'P1';
  return 'P2';
}

async function collectPageMetrics(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText?.replace(/\s+/g, ' ').trim() || '';
    const doc = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollWidth = Math.max(doc?.scrollWidth || 0, body?.scrollWidth || 0);
    const scrollHeight = Math.max(doc?.scrollHeight || 0, body?.scrollHeight || 0);
    const viewportOverflowX = scrollWidth > viewportWidth + 2;

    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };

    const rectSummary = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        className: String(el.className || '').slice(0, 120),
        id: el.id || '',
        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        scrollWidth: Math.round(el.scrollWidth || 0),
        clientWidth: Math.round(el.clientWidth || 0),
      };
    };

    const buttons = Array.from(document.querySelectorAll('button, a.btn, a.button, .btn, [role="button"], input[type="submit"]')).filter(visible).map(rectSummary);
    const inputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(visible).map(rectSummary);
    const cards = Array.from(document.querySelectorAll('.card, .panel, .portal-card, .auth-card, .login-card, section, main > div')).filter(visible).slice(0, 25).map(rectSummary);
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, [role="heading"]')).filter(visible).map(rectSummary);
    const isAllowedScrollRail = (el, style) => {
      const className = String(el.className || '');
      const role = String(el.getAttribute('role') || '');
      const hasRailClass = /\b(portal-topbar-actions|top-actions|filter-row|filter-tabs|section-tab-list)\b/.test(className);
      const isScrollable = ['auto', 'scroll'].includes(style.overflowX);
      return isScrollable && (hasRailClass || role === 'tablist' || el.hasAttribute('data-top-filter-rail'));
    };

    const overflowElements = Array.from(document.querySelectorAll('body *')).filter((el) => {
      if (!visible(el)) return false;
      const style = window.getComputedStyle(el);
      if (isAllowedScrollRail(el, style)) return false;
      return el.scrollWidth > el.clientWidth + 3 && el.getBoundingClientRect().width <= viewportWidth + 1;
    }).slice(0, 12).map(rectSummary);

    const buttonHeights = buttons.map((item) => item.height).filter((height) => height > 0);
    const inputHeights = inputs.map((item) => item.height).filter((height) => height > 0);
    const topVisible = Array.from(document.body.querySelectorAll('main, section, .portal-shell, .auth-card, .login-card, .card, h1, h2')).filter(visible).map(rectSummary)[0] || null;

    return {
      title: document.title,
      textSample: text.slice(0, 1200),
      viewportWidth,
      viewportHeight,
      scrollWidth,
      scrollHeight,
      viewportOverflowX,
      bodyClass: document.body?.className || '',
      buttonCount: buttons.length,
      buttonHeights,
      inputHeights,
      buttons: buttons.slice(0, 20),
      inputs: inputs.slice(0, 20),
      cards,
      headings: headings.slice(0, 12),
      overflowElements,
      topVisible,
      hasAdminLeakText: /\b(Super Admin|Operations|Codex|debug|raw task|configured|not configured)\b/i.test(text),
      hasRoleLabel: /\b(student|parent|member|one time|login|portal|preview)\b/i.test(text),
      hasPasswordField: Boolean(document.querySelector('input[type="password"]')),
      hasHorizontalOverflow: viewportOverflowX || overflowElements.length > 0,
      firstViewportTextLength: Array.from(document.querySelectorAll('body *')).filter(visible).filter((el) => el.getBoundingClientRect().top < viewportHeight).map((el) => el.innerText || '').join(' ').replace(/\s+/g, ' ').trim().length,
    };
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
  const buttonSpread = metrics.buttonHeights.length > 1
    ? Math.max(...metrics.buttonHeights) - Math.min(...metrics.buttonHeights)
    : 0;
  const inputSpread = metrics.inputHeights.length > 1
    ? Math.max(...metrics.inputHeights) - Math.min(...metrics.inputHeights)
    : 0;
  const tooSmallButtons = metrics.buttonHeights.filter((height) => height > 0 && height < 44);

  if (metrics.hasHorizontalOverflow) {
    findings.push({
      ...context,
      code: 'VQ-RESPONSIVE-001',
      issue: 'Horizontal overflow or clipped element detected.',
      evidence: metrics.overflowElements.map((item) => `${item.tag}.${item.className || item.id}: ${item.width}/${item.scrollWidth}`).join('; ') || `scrollWidth ${metrics.scrollWidth} > viewport ${metrics.viewportWidth}`,
      expected_fix: 'Constrain wide elements, allow button/input text to wrap, and remove horizontal page scroll.',
    });
  }
  if (viewport.width <= 430 && tooSmallButtons.length) {
    findings.push({
      ...context,
      code: 'VQ-A11Y-001',
      issue: 'Mobile tappable controls are below 44px height.',
      evidence: `Button heights: ${metrics.buttonHeights.join(', ')}`,
      expected_fix: 'Set a consistent mobile min-height of at least 44px for visible actions.',
    });
  }
  if (buttonSpread > 12) {
    findings.push({
      ...context,
      code: 'VQ-ALIGN-001',
      issue: 'Visible button heights are inconsistent.',
      evidence: `Height spread ${buttonSpread}px across ${metrics.buttonHeights.length} actions.`,
      expected_fix: 'Normalize action button padding/min-height and group primary/secondary actions on a consistent grid.',
    });
  }
  if (inputSpread > 10) {
    findings.push({
      ...context,
      code: 'VQ-LAYOUT-002',
      issue: 'Input/control heights are inconsistent.',
      evidence: `Input height spread ${inputSpread}px across ${metrics.inputHeights.length} controls.`,
      expected_fix: 'Use one form-control sizing model for fields/selects/textareas in the entry surface.',
    });
  }
  if (!metrics.hasRoleLabel) {
    findings.push({
      ...context,
      code: 'VQ-IA-001',
      issue: 'Role context is not obvious in visible text.',
      evidence: shortText(metrics.textSample),
      expected_fix: 'Expose a clear Student, Parent, Member, or One Time preview label near the heading.',
    });
  }
  if (metrics.hasAdminLeakText && /student|parent/i.test(routeInfo.id)) {
    findings.push({
      ...context,
      code: 'VQ-SCOPE-001',
      issue: 'Parent/student entry surface contains admin/debug/setup-looking language.',
      evidence: shortText(metrics.textSample),
      expected_fix: 'Remove admin/debug/setup language from normal parent/student entry surfaces or move it behind a role-gated support view.',
    });
  }
  if (metrics.topVisible && metrics.topVisible.y > 96) {
    findings.push({
      ...context,
      code: 'VQ-LAYOUT-002',
      issue: 'First meaningful content starts too low on the page.',
      evidence: `First visible major block starts at y=${metrics.topVisible.y}px.`,
      expected_fix: 'Reduce top padding/header dead space so the login/entry purpose appears in the first viewport.',
    });
  }
  if (viewport.width <= 430 && metrics.firstViewportTextLength < 80) {
    findings.push({
      ...context,
      code: 'VQ-IA-001',
      issue: 'Mobile first viewport appears sparse or under-explained.',
      evidence: `First viewport text length ${metrics.firstViewportTextLength}.`,
      expected_fix: 'Bring role label, brief helper copy, and primary action into the first mobile viewport without extra decorative space.',
    });
  }
  return findings.map((finding) => ({ ...finding, severity: severityForFinding(finding) }));
}

async function main() {
  const baseUrl = String(argValue('base-url', process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL)).replace(/\/+$/, '');
  const outDir = path.resolve(argValue('out-dir', DEFAULT_OUT_DIR));
  const screenshotDir = path.join(outDir, 'screenshots');
  ensureDir(screenshotDir);

  const report = {
    audit_id: 'AUD-20260707-parent-student-login-ui-polish',
    raw_id: 'RAW-20260707-010',
    packet_id: 'PKT-20260707-100',
    requirement_id: 'REQ-20260707-102',
    started_at: new Date().toISOString(),
    base_url: baseUrl,
    routes: ROUTES,
    viewports: VIEWPORTS,
    checks: [],
    findings: [],
    guardrails: [
      'No payment, checkout, access grant, external send, DNS write, credential change, provider mutation, or production data mutation was performed.',
      'Screenshots cover public/review/login entry states only.',
    ],
  };

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(20000);

    for (const routeInfo of ROUTES) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const url = `${baseUrl}${routeInfo.route}`;
        const started = Date.now();
        const check = {
          route_id: routeInfo.id,
          route: routeInfo.route,
          surface: routeInfo.surface,
          view_class: routeInfo.viewClass,
          viewport: viewport.id,
          ok: false,
          duration_ms: 0,
          screenshot: '',
          metrics: null,
          error: '',
        };
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(350);
          const metrics = await collectPageMetrics(page);
          const screenshotPath = path.join(screenshotDir, `${routeInfo.id}-${viewport.id}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          check.ok = true;
          check.screenshot = posixRelative(screenshotPath);
          check.metrics = metrics;
          report.findings.push(...buildFindings(routeInfo, viewport, metrics, check.screenshot));
        } catch (error) {
          check.error = error?.message || String(error);
        } finally {
          check.duration_ms = Date.now() - started;
          report.checks.push(check);
        }
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
    '# Parent And Student Login UI Polish - Current State Audit',
    '',
    `Generated: ${report.completed_at}`,
    `Base URL: ${baseUrl}`,
    `Status: ${report.status}`,
    '',
    '## Summary',
    '',
    `- Routes checked: ${ROUTES.length}`,
    `- Viewports checked: ${VIEWPORTS.map((viewport) => viewport.id).join(', ')}`,
    `- Screenshots: ${report.checks.filter((check) => check.screenshot).length}`,
    `- Findings: ${report.findings.length}`,
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
    ...(report.findings.length ? [] : ['No automated visual findings were detected. Manual screenshot review is still required before UI done.', '']),
    '## Checks',
    '',
    ...report.checks.map((check) => {
      const marker = check.ok ? 'PASS' : 'FAIL';
      const detail = check.error ? ` - ${check.error}` : '';
      return `- ${marker} ${check.route_id} ${check.viewport} (${check.duration_ms}ms)${detail}`;
    }),
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ];
  writeText(reportMd, lines.join('\n'));
  console.log(`Parent/student login UI audit: ${report.status}`);
  console.log(`Report: ${posixRelative(reportMd)}`);
  if (report.checks.some((check) => !check.ok)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
