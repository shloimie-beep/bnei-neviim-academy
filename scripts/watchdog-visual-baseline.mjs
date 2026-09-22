#!/usr/bin/env node
import fs from 'fs';
import net from 'net';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import {
  addFinding,
  ensureDir,
  isFailureSeverity,
  overallSeverity,
  printCliResult,
  readText,
  relative,
  repoRoot,
  writeWatchdogReport,
} from './lib/watchdog-common.mjs';

const CSS_FILES = [
  'public/css/bna-app-shell.css',
  'public/css/bna-site-nav.css',
  'public/css/bna-pages.css',
  'public/css/one-time-shared-review.css',
  'public/css/integration-setup.css',
];

const VIEWPORTS = [
  { id: 'mobile-390', width: 390, height: 844 },
  { id: 'tablet-768', width: 768, height: 1024 },
  { id: 'desktop-1440', width: 1440, height: 900 },
];

const DEFAULT_BROWSER_ROUTES = [
  { id: 'public-home', label: 'Public home', route: '/', surface: 'public' },
  { id: 'public-signup', label: 'Signup', route: '/signup.html', surface: 'public' },
  { id: 'operations', label: 'Operations', route: '/operations.html?view=tasks', surface: 'operations' },
  { id: 'provider', label: 'Provider review', route: '/provider.html?review=one-time', surface: 'provider' },
  { id: 'parent-support', label: 'Parent support', route: '/parent.html?review=one-time#help', surface: 'parent/support' },
  { id: 'student-support', label: 'Student support', route: '/student.html?review=one-time#help_account', surface: 'student/support' },
  { id: 'one-time-home', label: 'One Time home', route: '/one-time', surface: 'one_time' },
  {
    id: 'one-time-classroom',
    label: 'One Time classroom',
    route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    surface: 'classroom',
  },
  { id: 'one-time-email-review', label: 'One Time email review', route: '/one-time-email-review.html', surface: 'support' },
];

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    baseUrl: '',
    startLocal: false,
    screenshotRoot: '',
    browser: false,
  };
  for (const arg of argv) {
    if (arg === '--start-local') {
      args.startLocal = true;
      args.browser = true;
    } else if (arg === '--browser') {
      args.browser = true;
    } else if (arg.startsWith('--base-url=')) {
      args.baseUrl = arg.split('=').slice(1).join('=');
      args.browser = true;
    } else if (arg.startsWith('--screenshots=')) {
      args.screenshotRoot = arg.split('=').slice(1).join('=');
    }
  }
  return args;
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
    if (child?.exitCode !== null && child?.exitCode !== undefined) {
      throw new Error(`Local server exited early with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(baseUrl, { headers: { 'cache-control': 'no-cache' } });
      if (response.status === 200) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Local server did not become ready: ${lastError}`);
}

async function startLocalServer() {
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      DATABASE_URL: '',
      ONE_TIME_REVIEW_ONLY_NO_DB: '1',
      BNA_OWNER_REVIEW_QA: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr.on('data', (chunk) => logs.push(String(chunk)));
  await waitForReady(`${baseUrl}/`, child);
  return { baseUrl, child, logs };
}

function parseRgb(value) {
  const match = String(value || '').match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => Number(part.trim()));
  const [r, g, b, a = 1] = parts;
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
  if (!foreground || !background || background.a === 0) return null;
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function escapeMd(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function auditStaticCss(findings) {
  let cssText = '';
  for (const file of CSS_FILES) {
    const text = readText(path.join(repoRoot, file));
    cssText += `\n/* ${file} */\n${text}`;
    if (!text) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-baseline',
        title: `Missing visual CSS file ${file}`,
        details: 'Canonical visual CSS files must remain present for global shell invariants.',
        evidence: [file],
        recommended_fix: 'Restore the CSS file or update the watchdog inventory with its replacement.',
        goal_ids: ['GOAL-CORE-001'],
      });
    }
  }

  const purpleHits = (cssText.match(/purple|violet|indigo|#6d|#7c|#8b/gi) || []).length;
  const beigeHits = (cssText.match(/beige|tan|sand|cream|#f5f0|#f8f1|#fff7/gi) || []).length;
  if (purpleHits > 55) {
    addFinding(findings, {
      severity: 'medium',
      category: 'visual-baseline',
      title: 'Palette may be overly purple/indigo',
      details: `Static CSS scan found ${purpleHits} purple/indigo-like tokens.`,
      evidence: CSS_FILES,
      recommended_fix: 'Review affected screens and diversify the palette if the UI reads one-note.',
      goal_ids: ['GOAL-CORE-001'],
    });
  }
  if (beigeHits > 120) {
    addFinding(findings, {
      severity: 'medium',
      category: 'visual-baseline',
      title: 'Palette may be overly beige/cream',
      details: `Static CSS scan found ${beigeHits} beige/cream-like tokens.`,
      evidence: CSS_FILES,
      recommended_fix: 'Review affected screens and diversify the palette if the UI reads one-note.',
      goal_ids: ['GOAL-CORE-001'],
    });
  }
  if (/letter-spacing:\s*-\d/i.test(cssText)) {
    addFinding(findings, {
      severity: 'high',
      category: 'visual-baseline',
      title: 'Negative letter spacing detected',
      details: 'Design rules require letter spacing to be 0, not negative.',
      evidence: CSS_FILES,
      recommended_fix: 'Remove negative letter spacing from UI CSS.',
      goal_ids: ['GOAL-CORE-001'],
    });
  }
  if (!/:focus-visible/i.test(cssText)) {
    addFinding(findings, {
      severity: 'high',
      category: 'visual-baseline',
      title: 'No visible keyboard focus style detected',
      details: 'Global UI CSS should include focus-visible states for keyboard users.',
      evidence: CSS_FILES,
      recommended_fix: 'Add shared :focus-visible styles for buttons, links, inputs, and tabs.',
      goal_ids: ['GOAL-CORE-001', 'GOAL-CORE-002'],
    });
  }
}

async function inspectRoute(page, target, viewport, screenshotRoot) {
  const consoleErrors = [];
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !/favicon|Failed to load resource|ERR_ABORTED/i.test(text)) {
      consoleErrors.push(text.slice(0, 260));
    }
  });
  await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);

  const screenshotPath = path.join(screenshotRoot, `${target.id}-${viewport.id}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false, type: 'png', animations: 'disabled' });

  const metrics = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const interactiveSelector = [
      'button',
      'summary',
      '[role="button"]',
      '[role="tab"]',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      'a.bna-site-nav-link',
      'a.bna-site-nav-button',
      'a.portal-topbar-link',
      'a.button-link',
      'a.btn',
      'a.task-action',
      '.portal-nav-button',
      '.section-tab',
      '.filter-chip',
      '.filter-btn',
    ].join(',');
    const textFitSelector = [
      'button',
      'summary',
      '.btn',
      '.button-link',
      '.task-action',
      '.portal-topbar-link',
      '.bna-site-nav-link',
      '.bna-site-nav-button',
      '.portal-nav-button',
      '.section-tab',
      '.filter-chip',
      '.filter-btn',
      '.status-pill',
      '.brand-lockup strong',
      '.bna-site-brand-name',
    ].join(',');

    function isVisible(el) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }
    function labelFor(el) {
      return (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || el.value || el.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 100);
    }
    function cssPath(el) {
      if (el.id) return `#${el.id}`;
      const cls = Array.from(el.classList || []).slice(0, 3).join('.');
      return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`;
    }
    function rectFor(el) {
      const rect = el.getBoundingClientRect();
      return {
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
        top: Number(rect.top.toFixed(2)),
        left: Number(rect.left.toFixed(2)),
      };
    }
    function parseColor(value) {
      const match = String(value || '').match(/rgba?\(([^)]+)\)/i);
      if (!match) return null;
      const [r, g, b, a = '1'] = match[1].split(',').map((part) => Number(part.trim()));
      if (![r, g, b].every(Number.isFinite)) return null;
      return { r, g, b, a: Number.isFinite(a) ? a : 1 };
    }
    function composite(top, base) {
      const alpha = Math.max(0, Math.min(1, top.a ?? 1));
      return {
        r: Math.round(top.r * alpha + base.r * (1 - alpha)),
        g: Math.round(top.g * alpha + base.g * (1 - alpha)),
        b: Math.round(top.b * alpha + base.b * (1 - alpha)),
        a: 1,
      };
    }
    function normalizedBackground(el) {
      const chain = [];
      let current = el;
      while (current && current !== document.documentElement) {
        chain.push(current);
        current = current.parentElement;
      }
      let color = { r: 255, g: 255, b: 255, a: 1 };
      for (const item of chain.reverse()) {
        const parsed = parseColor(getComputedStyle(item).backgroundColor);
        if (parsed && parsed.a > 0) color = composite(parsed, color);
      }
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
    function hasImageBackground(el) {
      let current = el;
      while (current && current !== document.documentElement) {
        const bgImage = getComputedStyle(current).backgroundImage;
        if (bgImage && bgImage !== 'none') return true;
        current = current.parentElement;
      }
      return false;
    }

    const visibleInteractives = Array.from(document.querySelectorAll(interactiveSelector)).filter(isVisible);
    const tinyTargets = visibleInteractives
      .filter((el) => {
        const type = String(el.getAttribute('type') || '').toLowerCase();
        if ((type === 'checkbox' || type === 'radio') && el.closest('label')) {
          const labelRect = el.closest('label').getBoundingClientRect();
          return labelRect.width < 32 || labelRect.height < 32;
        }
        const rect = el.getBoundingClientRect();
        return rect.width < 32 || rect.height < 32;
      })
      .map((el) => ({ selector: cssPath(el), label: labelFor(el), rect: rectFor(el) }))
      .slice(0, 12);
    const unlabeledButtons = visibleInteractives
      .filter((el) => ['BUTTON', 'SUMMARY'].includes(el.tagName) || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'tab')
      .map((el) => ({ selector: cssPath(el), label: labelFor(el), rect: rectFor(el) }))
      .filter((item) => !item.label)
      .slice(0, 12);
    const clippedText = Array.from(document.querySelectorAll(textFitSelector))
      .filter(isVisible)
      .filter((el) => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)
      .map((el) => ({ selector: cssPath(el), label: labelFor(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
      .slice(0, 12);
    const contrastSamples = visibleInteractives
      .filter((el) => {
        const style = getComputedStyle(el);
        return labelFor(el)
          && style.backgroundColor
          && style.backgroundColor !== 'transparent'
          && style.backgroundImage === 'none'
          && !hasImageBackground(el);
      })
      .slice(0, 60)
      .map((el) => {
        const style = getComputedStyle(el);
        return {
          selector: cssPath(el),
          label: labelFor(el),
          color: style.color,
          backgroundColor: normalizedBackground(el),
        };
      });
    const placeholderHits = Array.from(document.querySelectorAll('body *'))
      .filter(isVisible)
      .map((el) => labelFor(el))
      .filter((text) => /\b(?:graphic placeholder|placeholder|coming soon|lorem ipsum|todo)\b/i.test(text))
      .slice(0, 12);
    const footer = Array.from(document.querySelectorAll('footer, .bna-site-footer, .site-footer')).find(isVisible);
    const bodyTextLength = (document.body?.innerText || '').replace(/\s+/g, ' ').trim().length;

    return {
      title: document.title,
      url: window.location.href,
      viewportWidth,
      viewportHeight,
      bodyTextLength,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - viewportWidth),
      visibleInteractiveCount: visibleInteractives.length,
      tinyTargets,
      unlabeledButtons,
      clippedText,
      contrastSamples,
      placeholderHits,
      footerVisible: Boolean(footer),
    };
  });

  const contrastFailures = metrics.contrastSamples
    .map((sample) => {
      const ratio = contrastRatio(parseRgb(sample.color), parseRgb(sample.backgroundColor));
      return { ...sample, contrastRatio: ratio == null ? null : Number(ratio.toFixed(2)) };
    })
    .filter((sample) => sample.contrastRatio !== null && sample.contrastRatio < 4.5)
    .slice(0, 12);

  return {
    route_id: target.id,
    label: target.label,
    surface: target.surface,
    route: target.route,
    url: metrics.url,
    viewport: viewport.id,
    screenshot: relative(screenshotPath),
    title: metrics.title,
    body_text_length: metrics.bodyTextLength,
    horizontal_overflow_px: metrics.horizontalOverflowPx,
    visible_interactive_count: metrics.visibleInteractiveCount,
    tiny_targets: metrics.tinyTargets,
    unlabeled_buttons: metrics.unlabeledButtons,
    clipped_text: metrics.clippedText,
    contrast_failures: contrastFailures,
    placeholder_hits: metrics.placeholderHits,
    footer_visible: metrics.footerVisible,
    console_errors: consoleErrors.slice(0, 8),
  };
}

function addBrowserFindings(findings, rows) {
  for (const row of rows) {
    const evidence = [row.screenshot, row.url];
    if (row.body_text_length < 80) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: `${row.label} appears blank at ${row.viewport}`,
        details: `Rendered body text length was ${row.body_text_length}.`,
        evidence,
        recommended_fix: 'Restore the visible route content or document why the route is intentionally empty.',
        goal_ids: ['GOAL-CORE-001'],
      });
    }
    if (row.horizontal_overflow_px > 1) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: `${row.label} has horizontal overflow at ${row.viewport}`,
        details: `Rendered page overflowed by ${row.horizontal_overflow_px}px.`,
        evidence,
        recommended_fix: 'Constrain grids, long labels, media, and fixed-width panels for this viewport.',
        goal_ids: ['GOAL-CORE-004'],
      });
    }
    if (row.tiny_targets.length) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: `${row.label} has tiny tap targets at ${row.viewport}`,
        details: JSON.stringify(row.tiny_targets.slice(0, 5)),
        evidence,
        recommended_fix: 'Give visible controls stable dimensions of at least 32px by 32px, preferably 40px for primary app controls.',
        goal_ids: ['GOAL-CORE-001', 'GOAL-CORE-004'],
      });
    }
    if (row.unlabeled_buttons.length) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: `${row.label} has unlabeled controls at ${row.viewport}`,
        details: JSON.stringify(row.unlabeled_buttons.slice(0, 5)),
        evidence,
        recommended_fix: 'Add visible text, aria-label, title, or an explicit disabled reason.',
        goal_ids: ['GOAL-CORE-002'],
      });
    }
    if (row.clipped_text.length) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: `${row.label} has clipped control text at ${row.viewport}`,
        details: JSON.stringify(row.clipped_text.slice(0, 5)),
        evidence,
        recommended_fix: 'Allow wrapping, reduce compact labels, or give fixed-format controls stable responsive dimensions.',
        goal_ids: ['GOAL-CORE-001', 'GOAL-CORE-004'],
      });
    }
    if (row.contrast_failures.length) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: `${row.label} has low-contrast controls at ${row.viewport}`,
        details: JSON.stringify(row.contrast_failures.slice(0, 5)),
        evidence,
        recommended_fix: 'Adjust foreground/background token pairs to meet at least 4.5:1 contrast for control text.',
        goal_ids: ['GOAL-CORE-001'],
      });
    }
    if (row.placeholder_hits.length) {
      addFinding(findings, {
        severity: 'medium',
        category: 'visual-browser',
        title: `${row.label} shows placeholder/dead-control copy at ${row.viewport}`,
        details: row.placeholder_hits.join(' | '),
        evidence,
        recommended_fix: 'Replace placeholder text with supported content, or clearly register/disable the control with a reason.',
        goal_ids: ['GOAL-CORE-002'],
      });
    }
  }
}

function browserMatrixMarkdown(rows) {
  const lines = [
    '| Surface | Route | Viewport | Overflow px | Controls | Tiny | Unlabeled | Clipped | Contrast | Placeholder | Footer | Screenshot |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
  ];
  for (const row of rows) {
    lines.push(`| ${[
      row.surface,
      row.route,
      row.viewport,
      row.horizontal_overflow_px,
      row.visible_interactive_count,
      row.tiny_targets.length,
      row.unlabeled_buttons.length,
      row.clipped_text.length,
      row.contrast_failures.length,
      row.placeholder_hits.length,
      row.footer_visible ? 'yes' : 'no',
      row.screenshot,
    ].map(escapeMd).join(' | ')} |`);
  }
  return lines;
}

async function runBrowserAudit({ baseUrl, startLocal, screenshotRoot }) {
  let local = null;
  let resolvedBaseUrl = baseUrl;
  if (startLocal) {
    local = await startLocalServer();
    resolvedBaseUrl = local.baseUrl;
  }
  if (!resolvedBaseUrl) throw new Error('Browser visual audit needs --base-url or --start-local.');

  const stamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  const outDir = screenshotRoot
    ? path.resolve(repoRoot, screenshotRoot)
    : path.join(repoRoot, 'ops', 'visual-quality', `${stamp}-watchdog-visual-baseline`);
  const screenshotDir = path.join(outDir, 'screenshots');
  ensureDir(screenshotDir);

  let browser;
  const rows = [];
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    for (const viewport of VIEWPORTS) {
      for (const route of DEFAULT_BROWSER_ROUTES) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          isMobile: viewport.width < 768,
          hasTouch: viewport.width < 768,
        });
        const page = await context.newPage();
        const url = `${resolvedBaseUrl.replace(/\/+$/, '')}${route.route}`;
        try {
          rows.push(await inspectRoute(page, { ...route, url }, viewport, screenshotDir));
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    if (browser) await browser.close();
    if (local?.child) local.child.kill();
  }

  const jsonPath = path.join(outDir, 'visual-baseline-browser-matrix.json');
  const mdPath = path.join(outDir, 'visual-baseline-browser-matrix.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify({
    generated_at: new Date().toISOString(),
    base_url: resolvedBaseUrl,
    routes: DEFAULT_BROWSER_ROUTES,
    viewports: VIEWPORTS,
    rows,
    server_log_tail: local?.logs?.join('').split(/\r?\n/).filter(Boolean).slice(-30) || [],
  }, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${[
    '# Visual Baseline Browser Matrix',
    '',
    `Generated at ${new Date().toISOString()}.`,
    `Base URL: ${resolvedBaseUrl}`,
    '',
    'Guardrail: local browser rendering only. No production mutation, deploy, external send, charge, DNS, credential, or Drive write was performed.',
    '',
    ...browserMatrixMarkdown(rows),
    '',
  ].join('\n')}`);

  return { rows, outDir, jsonPath, mdPath };
}

export async function buildVisualBaselineAudit(options = {}) {
  const findings = [];
  auditStaticCss(findings);

  let browserAudit = null;
  if (options.browser || options.baseUrl || options.startLocal) {
    try {
      browserAudit = await runBrowserAudit(options);
      addBrowserFindings(findings, browserAudit.rows);
    } catch (error) {
      addFinding(findings, {
        severity: 'high',
        category: 'visual-browser',
        title: 'Browser visual baseline failed',
        details: error instanceof Error ? error.message : String(error),
        evidence: options.baseUrl ? [options.baseUrl] : ['--start-local'],
        recommended_fix: 'Start the local app or repair the browser audit before marking visual quality done.',
        goal_ids: ['GOAL-CORE-001', 'GOAL-CORE-004'],
      });
    }
  }

  const extraSections = [];
  if (browserAudit) {
    extraSections.push({
      title: 'Browser Matrix',
      lines: [
        `- Matrix: ${relative(browserAudit.mdPath)}`,
        `- JSON: ${relative(browserAudit.jsonPath)}`,
        `- Screenshot directory: ${relative(path.join(browserAudit.outDir, 'screenshots'))}`,
        '',
        ...browserMatrixMarkdown(browserAudit.rows),
      ],
    });
  }

  const report = writeWatchdogReport({
    kind: 'watchdog-visual-baseline',
    title: 'Watchdog Visual Baseline',
    summaryLines: [
      `CSS files scanned: ${CSS_FILES.length}`,
      browserAudit ? `Browser routes checked: ${DEFAULT_BROWSER_ROUTES.length}` : 'Browser run: skipped; pass --start-local or --base-url to enable.',
      browserAudit ? `Browser viewports checked: ${VIEWPORTS.length}` : null,
    ].filter(Boolean),
    findings,
    extraSections,
  });
  const severity = overallSeverity(findings);
  return { ok: !findings.some((finding) => isFailureSeverity(finding.severity)), severity, findings, report, browserAudit };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = await buildVisualBaselineAudit(parseArgs());
  printCliResult(audit);
  if (!audit.ok) process.exitCode = 1;
}
