#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://join.onetimeonetime.com';
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'ui-audits', '2026-07-09-onetime-parallel-frontend-audit');
const RAW_ID = 'RAW-20260709-011';
const REQUIREMENT_ID = 'REQ-20260709-064';

const VIEWPORTS = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

const ROUTES = [
  { id: 'one-time', route: '/one-time', surface: 'One Time public landing', viewClass: 'PUBLIC_MARKETING', auth: 'none' },
  { id: 'one-time-mishnayos', route: '/one-time/mishnayos', surface: 'One Time Mishnayos public alias', viewClass: 'PUBLIC_MARKETING', auth: 'none' },
  { id: 'rabbi-member', route: '/rabbi-member', surface: 'One Time member home', viewClass: 'MEMBER_PARENT_PORTAL', auth: 'none' },
  { id: 'member-library', route: '/member-library', surface: 'One Time member library entry', viewClass: 'MEMBER_PARENT_PORTAL', auth: 'none' },
  { id: 'one-time-classroom', route: '/one-time-classroom', surface: 'One Time classroom entry', viewClass: 'STUDENT_PORTAL', auth: 'none' },
  {
    id: 'one-time-classroom-review',
    route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    surface: 'One Time classroom review fixture',
    viewClass: 'STUDENT_PORTAL',
    auth: 'none',
  },
  { id: 'provider-review', route: '/provider.html?review=one-time', surface: 'One Time provider review fixture', viewClass: 'RABBI_PROVIDER_ADMIN', auth: 'none' },
  {
    id: 'operations-onetime-overview',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
    surface: 'Operations scoped One Time overview',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    auth: 'operations',
    redact: true,
  },
  {
    id: 'operations-rabbi-email-inbox',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi',
    surface: 'Operations scoped Rabbi email inbox',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    auth: 'operations',
    redact: true,
  },
];

const HEADER_SELECTORS = [
  'header',
  '.site-header',
  '.one-time-header',
  '.brand-topbar',
  '.ops-brand-topbar',
  '.topbar',
  '.mobile-app-header',
];

const TOPBAR_SELECTORS = [
  'header',
  'nav',
  '.brand-topbar',
  '.topbar',
  '.ops-brand-topbar',
  '.portal-topbar-actions',
  '.top-actions',
  '.board-toolbar',
  '.top-filter-row',
  '.filter-tabs',
  '.filter-row',
  '.section-tab-list',
  '[role="tablist"]',
];

const INTERACTIVE_SELECTORS = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="tab"]',
  '[role="link"]',
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

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(text || '').replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function short(value, max = 160) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function redactSensitive(value) {
  return String(value || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(?:\+?972|0)?[ -]?(?:5[0-9]|2|3|4|8|9)[ -]?\d[ -]?\d{3}[ -]?\d{4}\b/g, '[redacted-phone]')
    .replace(/\b(?:sk|rk|pk|whsec|ghp|github_pat|xoxb|SG)\_[A-Za-z0-9_\-]{12,}\b/g, '[redacted-token]')
    .replace(/\b[A-Za-z0-9_\-]{32,}\b/g, '[redacted-long-token]');
}

function operationsLoginEnv(env = {}, baseUrl = '') {
  const host = (() => {
    try {
      return new URL(baseUrl).hostname;
    } catch {
      return '';
    }
  })();
  if (!/onetimeonetime\.com$/i.test(host)) return env;

  return {
    ...env,
    OPS_USERNAME: '',
    OPS_PASSWORD: '',
    BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
    BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
    BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
  };
}

function ariaToLines(node, depth = 0, lines = []) {
  if (!node || depth > 8) return lines;
  const indent = '  '.repeat(depth);
  const name = redactSensitive(node.name || '');
  lines.push(`${indent}- ${node.role || 'node'}${name ? `: ${short(name, 120)}` : ''}`);
  for (const child of node.children || []) ariaToLines(child, depth + 1, lines);
  return lines;
}

async function safeAccessibilitySnapshot(page) {
  const provider = page.accessibility;
  if (!provider || typeof provider.snapshot !== 'function') {
    return {
      snapshot: null,
      unavailable: 'playwright_accessibility_api_unavailable',
    };
  }

  try {
    return {
      snapshot: await provider.snapshot({ interestingOnly: false }),
      unavailable: '',
    };
  } catch (error) {
    return {
      snapshot: null,
      unavailable: error?.message || 'accessibility_snapshot_failed',
    };
  }
}

function clampClip(clip) {
  const x = Math.max(0, Math.floor(clip.x || 0));
  const y = Math.max(0, Math.floor(clip.y || 0));
  const width = Math.max(1, Math.floor(clip.width || 1));
  const height = Math.max(1, Math.floor(clip.height || 1));
  return { x, y, width, height };
}

async function addOperationsCookie(context, session, baseUrl) {
  if (!session?.cookie) return;
  await context.addCookies([{ ...session.cookie, url: baseUrl, httpOnly: true, sameSite: 'Lax' }]);
}

async function firstBox(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.count().catch(() => 0)) {
      const box = await locator.boundingBox().catch(() => null);
      if (box && box.width > 0 && box.height > 0) return { selector, box };
    }
  }
  return null;
}

async function applyOperationsRedaction(page) {
  await page.evaluate(() => {
    const redactSensitiveText = (value = '') => String(value || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b(?:\+?972|0)?[ -]?(?:5[0-9]|2|3|4|8|9)[ -]?\d[ -]?\d{3}[ -]?\d{4}\b/g, '[redacted-phone]')
      .replace(/\b(?:sk|rk|pk|whsec|ghp|github_pat|xoxb|SG)\_[A-Za-z0-9_\-]{12,}\b/g, '[redacted-token]')
      .replace(/\b[A-Za-z0-9_\-]{32,}\b/g, '[redacted-long-token]');

    const maskNode = (node, label = '[redacted private value]') => {
      if (!node || node.closest?.('header, nav, .workspace-nav, .section-tab-list, .task-actions, button')) return;
      const current = String(node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!current) return;
      node.textContent = label;
      node.setAttribute?.('data-bna-private-redacted', 'true');
    };

    const privateValueSelectors = [
      '.contact-card-title',
      '.contact-card-subtitle',
      '.contact-card-contact',
      '.contact-card-copy',
      '.contact-communication-body',
      '.contact-detail-value',
      '.crm-selected-title',
      '.crm-selected-subtitle',
      '.crm-timeline-list .timeline-item p',
      '.one-time-crm-contact-card strong',
      '.one-time-crm-contact-card p',
      '.mailbox-list li',
      '.mailbox-thread',
      '.email-draft-meta',
      '[data-private]',
      '[data-contact-id]',
      '[data-one-time-crm-contact-row] td:not(:first-child)',
    ];

    document.querySelectorAll(privateValueSelectors.join(',')).forEach((node) => maskNode(node));
    document.querySelectorAll('input, textarea').forEach((node) => {
      if ('value' in node) node.value = '';
      node.setAttribute('placeholder', node.getAttribute('aria-label') || node.getAttribute('name') || '[redacted input]');
      node.setAttribute('data-bna-private-redacted', 'true');
    });
    document.querySelectorAll('[href^="mailto:"], [href^="tel:"]').forEach((node) => {
      node.setAttribute('href', '#redacted');
      node.setAttribute('data-bna-private-redacted', 'true');
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      const redacted = redactSensitiveText(node.nodeValue);
      if (redacted !== node.nodeValue) node.nodeValue = redacted;
    }
    document.body.setAttribute('data-bna-audit-redacted', 'readable');
  });
  await page.addStyleTag({
    content: `
      body[data-bna-audit-redacted="readable"] [data-bna-private-redacted="true"] {
        color: #111827 !important;
        background: #f3f4f6 !important;
        border-color: #d1d5db !important;
      }
    `,
  });
}

async function collectMetrics(page, viewport) {
  return page.evaluate(({ viewportWidth, topbarSelectors, interactiveSelectors }) => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0
        && rect.width > 0
        && rect.height > 0
        && rect.right > 0
        && rect.left < window.innerWidth
        && rect.bottom > 0
        && rect.top < Math.max(window.innerHeight, 1200);
    };
    const rectSummary = (el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: String(el.className || '').slice(0, 120),
        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        href: el.getAttribute('href') || '',
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        scrollWidth: Math.round(el.scrollWidth || 0),
        clientWidth: Math.round(el.clientWidth || 0),
        overflowX: style.overflowX,
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontWeight: style.fontWeight,
      };
    };

    const uniqueVisible = (selectors) => {
      const seen = new Set();
      return Array.from(document.querySelectorAll(selectors.join(','))).filter((el) => {
        if (seen.has(el)) return false;
        seen.add(el);
        return visible(el);
      });
    };

    const doc = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(doc?.scrollWidth || 0, body?.scrollWidth || 0);
    const topbarEls = uniqueVisible(topbarSelectors).filter((el) => {
      if (el.matches('#portalPanel.one-time-provider-workspace > .workspace-nav')) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < (viewportWidth <= 430 ? 300 : 260);
    });
    const topbarRects = topbarEls.map(rectSummary);
    const topbarTop = topbarRects.length ? Math.min(...topbarRects.map((item) => item.y)) : 0;
    const topbarBottom = topbarRects.length ? Math.max(...topbarRects.map((item) => item.bottom)) : 0;
    const topbarHeight = Math.max(0, topbarBottom - topbarTop);
    const topRows = [...new Set(topbarRects.map((item) => Math.round(item.y / 14) * 14))].sort((a, b) => a - b);

    const interactive = uniqueVisible(interactiveSelectors).map(rectSummary);
    const tinyTapTargets = interactive.filter((item) => viewportWidth <= 430 && item.height > 0 && item.height < 44);
    const clippedText = interactive
      .concat(topbarRects)
      .filter((item) => item.scrollWidth > item.clientWidth + 4 && !['auto', 'scroll'].includes(item.overflowX));

    const firstContentCandidates = Array.from(document.querySelectorAll('main, section, .hero, .page-heading, .portal-shell, .member-shell, .classroom-shell, .one-time-ops-dashboard-hero, .panel, .card'))
      .filter(visible)
      .filter((el) => !el.closest('header, nav, footer'))
      .map(rectSummary)
      .sort((a, b) => a.y - b.y);

    const logos = Array.from(document.querySelectorAll('img, svg, [class*="logo"], [alt*="logo" i]'))
      .filter(visible)
      .map(rectSummary)
      .slice(0, 8);

    const activeNavCandidates = Array.from(document.querySelectorAll('a[aria-current], a.active, button.active, [class*="active"], [data-active="true"]'))
      .filter(visible)
      .filter((el) => el.closest('header, nav, .topbar, .brand-topbar, .ops-brand-topbar, .filter-tabs, [role="tablist"]'))
      .map(rectSummary)
      .slice(0, 12);

    const navTexts = interactive
      .filter((item) => item.y < (viewportWidth <= 430 ? 320 : 280))
      .map((item) => item.text)
      .filter(Boolean);
    const duplicateLabels = [...new Set(navTexts.filter((text, index) => navTexts.indexOf(text) !== index))].slice(0, 12);

    const footer = Array.from(document.querySelectorAll('footer'))
      .filter((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity || 1) > 0
          && rect.width > 0
          && rect.height > 0;
      })
      .map(rectSummary)[0] || null;
    const helper = Array.from(document.querySelectorAll('.bna-bot-launcher, .bna-bot-panel.is-open, .bna-bot-nudge.is-visible'))
      .filter(visible)
      .map(rectSummary)
      .filter((item) => item.width > 30 && item.height > 30)
      .slice(0, 8);
    const ctaOrForm = Array.from(document.querySelectorAll('form, [href="#start-free"], #start-free, button, input[type="submit"]'))
      .filter((el) => !el.closest('.bna-bot-launcher, .bna-bot-panel, .bna-bot-nudge'))
      .filter(visible)
      .map(rectSummary)
      .filter((item) => item.y < window.innerHeight + 200);

    const overlap = (a, b) => {
      const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
      const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
      return width * height;
    };
    const helperOverlapsCta = [];
    for (const helperItem of helper) {
      for (const target of ctaOrForm) {
        const area = overlap(helperItem, target);
        if (area > 48) helperOverlapsCta.push({ helper: helperItem, target, overlapArea: Math.round(area) });
      }
    }

    return {
      title: document.title,
      url: location.href,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth,
      pageOverflowX: scrollWidth - window.innerWidth,
      topbarHeight,
      topRowCount: topRows.length,
      topRows,
      firstContent: firstContentCandidates[0] || null,
      firstContentY: firstContentCandidates[0]?.y ?? null,
      tinyTapTargets: tinyTapTargets.slice(0, 12),
      clippedText: clippedText.slice(0, 12),
      logos,
      activeNavCandidates,
      duplicateLabels,
      footerPresent: Boolean(footer),
      helperOverlapsCta: helperOverlapsCta.slice(0, 8),
      bnaBleedTerms: (document.body?.innerText || '').match(/Bnei Neviim|BNA Academy|school goals|Hebrew\/English|GoHighLevel|LeadConnector/gi) || [],
      textSample: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1200),
    };
  }, {
    viewportWidth: viewport.width,
    topbarSelectors: TOPBAR_SELECTORS,
    interactiveSelectors: INTERACTIVE_SELECTORS,
  });
}

function finding(routeInfo, viewport, screenshot, code, severity, issue, evidence, expectedFix) {
  return {
    finding_id: `VQF-20260709-011-${String(finding.counter += 1).padStart(3, '0')}`,
    route_id: routeInfo.id,
    route: routeInfo.route,
    surface: routeInfo.surface,
    viewport: viewport.id,
    screenshot_path: screenshot || '',
    defect_codes: Array.isArray(code) ? code : [code],
    severity,
    user_impact: issue,
    evidence,
    expected_fix: expectedFix,
    requirement_id: REQUIREMENT_ID,
    safe_packet: routeInfo.id.startsWith('operations') ? 'provider-operations-layout-parity-audit' : 'static-chrome-or-landing-reframe',
  };
}
finding.counter = 0;

function buildFindings(routeInfo, viewport, metrics, screenshot) {
  const findings = [];
  const isMobile = viewport.width <= 430;
  const maxTopbarHeight = isMobile ? 190 : 150;
  const maxFirstContentY = isMobile ? 260 : 300;

  if (metrics.pageOverflowX > 2) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-LAYOUT-007', 'VQ-RESP-001'],
      'P1',
      'The page creates horizontal overflow.',
      `Document width exceeds viewport by ${metrics.pageOverflowX}px.`,
      'Constrain wide cards, nav rails, media, and fixed overlays so the page itself never scrolls sideways.'
    ));
  }
  if (metrics.topbarHeight > maxTopbarHeight) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-LAYOUT-005', 'VQ-CRED-006'],
      'P2',
      'The first viewport spends too much height on chrome, nav, or filter rows.',
      `Top cluster height is ${metrics.topbarHeight}px; target is at most ${maxTopbarHeight}px for this viewport.`,
      'Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.'
    ));
  }
  if (metrics.topRowCount > (isMobile ? 4 : 3)) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-IA-001', 'VQ-LAYOUT-005'],
      'P2',
      'The top of the screen has too many stacked navigation or filter bands.',
      `Detected ${metrics.topRowCount} row bands at y=${metrics.topRows.join(', ')}.`,
      'Use one clear header/nav contract and move list filters next to the list they affect.'
    ));
  }
  if (metrics.firstContentY !== null && metrics.firstContentY > maxFirstContentY) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-IA-008', 'VQ-LAYOUT-005'],
      'P2',
      'First meaningful content starts too low.',
      `First content starts at y=${metrics.firstContentY}px; sample: ${short(metrics.firstContent?.text, 120)}.`,
      'Trim announcement/header/nav spacing so the user sees the offer, dashboard state, or current task in the first viewport.'
    ));
  }
  if (metrics.tinyTapTargets.length) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-RESP-005', 'VQ-A11Y-008'],
      'P1',
      'Mobile controls are below the 44px tap-target expectation.',
      metrics.tinyTapTargets.slice(0, 6).map((item) => `${short(item.text || item.className, 60)}=${item.height}px`).join('; '),
      'Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.'
    ));
  }
  if (metrics.clippedText.length) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-TYPE-006', 'VQ-LAYOUT-003'],
      'P2',
      'Important control text is clipped.',
      metrics.clippedText.slice(0, 6).map((item) => `${short(item.text || item.className, 60)} ${item.clientWidth}/${item.scrollWidth}`).join('; '),
      'Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.'
    ));
  }
  if (metrics.duplicateLabels.length) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-IA-001', 'VQ-ACTION-002'],
      'P2',
      'Duplicate nav/filter labels make the hierarchy feel uncertain.',
      `Duplicate labels near the top: ${metrics.duplicateLabels.join(', ')}.`,
      'Remove repeated labels or separate category, subcategory, and filter language so each row has one job.'
    ));
  }
  if (!metrics.footerPresent && ['one-time', 'one-time-mishnayos', 'rabbi-member', 'member-library', 'one-time-classroom'].includes(routeInfo.id)) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-CRED-001', 'VQ-CRED-006'],
      'P2',
      'The route does not expose a visible canonical footer in the captured DOM.',
      'No visible footer element was detected.',
      'Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.'
    ));
  }
  if (metrics.logos.length && metrics.logos.every((logo) => logo.width < (isMobile ? 40 : 54) || logo.height < (isMobile ? 40 : 54))) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-CRED-006', 'VQ-LAYOUT-002'],
      'P3',
      'The One Time logo reads too small for a premium first impression.',
      `Largest detected logo is ${Math.max(...metrics.logos.map((item) => item.width))}x${Math.max(...metrics.logos.map((item) => item.height))}.`,
      'Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.'
    ));
  }
  if (!metrics.activeNavCandidates.some((item) => /rgb\(\s*(255|245|237|217)\s*,|#(fff35a|ede518|ffd200)|yellow|gold/i.test(`${item.backgroundColor} ${item.color}`))) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-IA-006', 'VQ-CRED-006'],
      'P2',
      'Active navigation state is not clearly yellow-on-black in the captured top chrome.',
      metrics.activeNavCandidates.length ? `Active candidates: ${metrics.activeNavCandidates.map((item) => `${short(item.text, 50)} bg=${item.backgroundColor} color=${item.color}`).join('; ')}` : 'No active nav candidate detected.',
      'Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.'
    ));
  }
  if (metrics.helperOverlapsCta.length) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-LAYOUT-008', 'VQ-ACTION-007'],
      'P1',
      'The helper/assistant overlay intersects CTA or form space.',
      metrics.helperOverlapsCta.map((item) => `${short(item.helper.text || item.helper.className, 50)} overlaps ${short(item.target.text || item.target.className, 50)} ${item.overlapArea}px2`).join('; '),
      'Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.'
    ));
  }
  if (metrics.bnaBleedTerms.length) {
    findings.push(finding(
      routeInfo,
      viewport,
      screenshot,
      ['VQ-DATA-006', 'VQ-CRED-006'],
      'P1',
      'One Time surface includes terms that may indicate BNA or external runtime bleed.',
      `Matched: ${[...new Set(metrics.bnaBleedTerms)].join(', ')}.`,
      'Remove BNA Academy/public school language and any GHL/LeadConnector text from One Time public/member/provider surfaces unless it is an explicit scoped support artifact.'
    ));
  }

  return findings;
}

async function captureCrop(page, filePath, selectorSet) {
  const selected = await firstBox(page, selectorSet);
  if (!selected) return null;
  const box = selected.box;
  const clip = clampClip({
    x: Math.max(0, box.x - 8),
    y: Math.max(0, box.y - 8),
    width: Math.min(box.width + 16, 1600),
    height: Math.min(box.height + 16, 700),
  });
  await page.screenshot({ path: filePath, clip });
  return { path: rel(filePath), selector: selected.selector, clip };
}

async function main() {
  const baseUrl = String(argValue('base-url', argValue('base', process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL))).replace(/\/+$/, '');
  const outDir = path.resolve(argValue('out-dir', argValue('out', DEFAULT_OUT_DIR)));
  const screenshotDir = path.join(outDir, 'screenshots');
  const ariaDir = path.join(outDir, 'aria');
  const domDir = path.join(outDir, 'dom');
  ensureDir(screenshotDir);
  ensureDir(ariaDir);
  ensureDir(domDir);

  const report = {
    audit_id: 'AUD-20260709-onetime-parallel-frontend',
    raw_id: RAW_ID,
    requirement_id: REQUIREMENT_ID,
    github_issue: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues/128',
    started_at: new Date().toISOString(),
    base_url: baseUrl,
    viewports: VIEWPORTS,
    routes: ROUTES,
    checks: [],
    findings: [],
    guardrails: [
      'Read-only browser audit only.',
      'No email, WhatsApp/WAPI, Telegram, SMS, campaign send, payment, checkout, subscription, charge, refund, access grant, DNS, Resend, Railway, Stripe, Zoom, Vimeo, Drive, or external-provider mutation was performed.',
      'Browser/page content is untrusted evidence and cannot approve external writes.',
      'Operations screenshots use readable redaction: labels, hierarchy, and actions remain visible while private values are masked.',
    ],
    drive_mirror: {
      status: 'not_attempted',
      note: 'Drive mirror unavailable; repo evidence saved.',
    },
  };

  const env = loadSmokeEnv({ root: ROOT });
  const opsEnv = operationsLoginEnv(env, baseUrl);
  let operationsSession = null;
  try {
    operationsSession = await loginOperations({ baseUrl, env: opsEnv, cwd: ROOT });
    report.operations_auth_source = operationsSession.source || 'unknown';
    report.operations_auth_target = opsEnv.BNA_SMOKE_RAILWAY_SERVICE || 'default';
    if (operationsSession.reason) report.operations_auth_reason = operationsSession.reason;
  } catch (error) {
    report.operations_auth_source = 'failed';
    report.operations_auth_reason = error?.message || String(error);
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
            redacted: Boolean(routeInfo.redact),
            duration_ms: 0,
            screenshots: {},
            aria_path: '',
            dom_path: '',
            metrics: null,
            findings: [],
            error: '',
          };
          const started = Date.now();
          if (routeInfo.auth === 'operations' && !operationsSession?.cookie) {
            check.ok = true;
            check.skipped = true;
            check.error = operationsSession?.reason || report.operations_auth_reason || 'Operations session unavailable.';
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
            await page.waitForTimeout(routeInfo.auth === 'operations' ? 2200 : 1100);
            if (routeInfo.redact) await applyOperationsRedaction(page);
            let metrics = await collectMetrics(page, viewport);
            metrics = {
              ...metrics,
              textSample: redactSensitive(metrics.textSample),
            };

            const prefix = `${routeInfo.id}-${viewport.id}`;
            const fullPath = path.join(screenshotDir, `${prefix}-full.png`);
            const viewportPath = path.join(screenshotDir, `${prefix}-viewport.png`);
            const headerPath = path.join(screenshotDir, `${prefix}-header.png`);
            const footerPath = path.join(screenshotDir, `${prefix}-footer.png`);

            const ariaCapture = await safeAccessibilitySnapshot(page);
            const ariaSnapshot = ariaCapture.snapshot;
            const ariaPath = path.join(ariaDir, `${prefix}.txt`);
            const ariaJsonPath = path.join(ariaDir, `${prefix}.json`);
            writeText(ariaPath, ariaToLines(ariaSnapshot).join('\n'));
            writeJson(ariaJsonPath, ariaSnapshot || { unavailable: ariaCapture.unavailable || true });
            const domPath = path.join(domDir, `${prefix}.txt`);
            const domText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
            writeText(domPath, redactSensitive(domText).slice(0, 12000));

            await page.screenshot({ path: viewportPath, fullPage: false });
            await page.screenshot({ path: fullPath, fullPage: true });
            const headerCrop = await captureCrop(page, headerPath, HEADER_SELECTORS).catch(() => null);
            const footerCrop = await captureCrop(page, footerPath, ['footer']).catch(() => null);

            check.ok = true;
            check.screenshots.full_page = rel(fullPath);
            check.screenshots.first_viewport = rel(viewportPath);
            if (headerCrop) check.screenshots.header_topbar = headerCrop.path;
            if (footerCrop) check.screenshots.footer = footerCrop.path;
            check.aria_path = rel(ariaPath);
            check.accessibility_path = rel(ariaJsonPath);
            check.dom_path = rel(domPath);
            check.metrics = metrics;
            check.findings = buildFindings(routeInfo, viewport, metrics, check.screenshots.first_viewport);
            report.findings.push(...check.findings);
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
  report.finding_summary = report.findings.reduce((summary, item) => {
    for (const code of item.defect_codes || []) summary[code] = (summary[code] || 0) + 1;
    return summary;
  }, {});

  const manifest = {
    audit_id: report.audit_id,
    generated_at: report.completed_at,
    base_url: report.base_url,
    raw_id: RAW_ID,
    requirement_id: REQUIREMENT_ID,
    checks: report.checks.map((check) => ({
      route_id: check.route_id,
      route: check.route,
      viewport: check.viewport,
      ok: check.ok,
      skipped: check.skipped,
      redacted: check.redacted,
      screenshots: check.screenshots,
      aria_path: check.aria_path,
      dom_path: check.dom_path,
      finding_ids: check.findings.map((item) => item.finding_id),
      timestamp: report.completed_at,
      error: check.error,
    })),
    guardrails: report.guardrails,
    drive_mirror: report.drive_mirror,
  };

  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(outDir, 'manifest.json'), manifest);

  const lines = [
    '# One Time Parallel Frontend Audit',
    '',
    `Generated: ${report.completed_at}`,
    `Base URL: ${report.base_url}`,
    `Status: ${report.status}`,
    `Operations auth: ${report.operations_auth_source || 'not attempted'}${report.operations_auth_reason ? ` (${report.operations_auth_reason})` : ''}`,
    `Drive mirror: ${report.drive_mirror.note}`,
    '',
    '## Designer Brief',
    '',
    'The One Time experience needs one black/yellow product language across the public funnel, member/library/classroom entry points, and Rabbi-scoped Operations views. The current-state audit is intentionally evidence-first: it measures what the user sees before asking Codex to touch shared app files. Static chrome work should wait until the active deploy/edit lane is clear.',
    '',
    'The north star for the next implementation packet is a compact premium header/footer system: a larger clean logo, a strong yellow active state with black text, readable dark/cream inactive nav, no BNA visual bleed, no mobile overflow, and a first viewport that quickly shows the offer or current workspace task instead of stacked chrome.',
    '',
    '## Summary',
    '',
    `- Routes requested: ${ROUTES.length}`,
    `- Viewports requested: ${VIEWPORTS.map((item) => item.id).join(', ')}`,
    `- Screenshots captured: ${report.checks.reduce((count, check) => count + Object.keys(check.screenshots || {}).length, 0)}`,
    `- Checks skipped: ${report.checks.filter((check) => check.skipped).length}`,
    `- Findings: ${report.findings.length}`,
    '',
    '## Finding Counts',
    '',
    ...(Object.keys(report.finding_summary).length
      ? Object.entries(report.finding_summary).sort().map(([code, count]) => `- ${code}: ${count}`)
      : ['- None']),
    '',
    '## Priority Findings',
    '',
    ...(report.findings.length
      ? report.findings.map((item) => [
          `### ${item.severity} ${item.defect_codes.join(', ')} - ${item.surface} / ${item.viewport}`,
          '',
          `- Route: ${item.route}`,
          `- Screenshot: ${item.screenshot_path}`,
          `- Impact: ${item.user_impact}`,
          `- Evidence: ${redactSensitive(item.evidence)}`,
          `- Direction: ${item.expected_fix}`,
          `- Packet: ${item.safe_packet}`,
          '',
        ].join('\n'))
      : ['No automated findings were detected. Manual designer review of screenshots is still required before any UI Done status.', '']),
    '## Patch Plan',
    '',
    '- Static chrome packet: blocked until the dirty One Time/app-visible lane is clear. Likely files are `public/one-time/index.html`, `public/rabbi-member.html`, `public/member-library.html`, `public/one-time-classroom.html`, shared One Time CSS, and focused chrome tests.',
    '- Landing reframe packet: use `/api/one-time/campaign` or explicit campaign config for the Israel-time Rosh Hashanah deadline; keep `$67` as copy/config only; preserve `/api/one-time/interest`; do not promise checkout, portal access, Zoom creation, or sends.',
    '- Provider Operations parity packet: keep Rabbi dashboard as scoped Operations IA, not provider-lite. Use left workspace sidebar, compact command rail, predictable tabs/filters, aligned actions, first-party CRM tracking, content pipeline, communications, and scoped payment/status visibility only where allowed.',
    '',
    '## Checks',
    '',
    ...report.checks.map((check) => {
      const marker = check.skipped ? 'SKIP' : check.ok ? 'PASS' : 'FAIL';
      const metrics = check.metrics ? ` overflow=${check.metrics.pageOverflowX}px topbar=${check.metrics.topbarHeight}px firstContent=${check.metrics.firstContentY ?? 'n/a'} rows=${check.metrics.topRowCount}` : '';
      return `- ${marker} ${check.route_id} ${check.viewport}${metrics}${check.error ? ` - ${check.error}` : ''}`;
    }),
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ];
  writeText(path.join(outDir, 'report.md'), lines.join('\n'));

  console.log(`One Time parallel frontend audit: ${report.status}`);
  console.log(`Report: ${rel(path.join(outDir, 'report.md'))}`);
  if (report.checks.some((check) => !check.ok && !check.skipped)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
