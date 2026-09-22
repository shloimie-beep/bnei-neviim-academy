import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const baseUrl = (process.env.ONE_TIME_LIVE_BASE_URL || 'https://join.onetimeonetime.com').replace(/\/+$/, '');
const startedAt = new Date().toISOString();
const outDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.cwd();

fs.mkdirSync(outDir, { recursive: true });

function fail(message, details = {}) {
  throw new Error(`${message}: ${JSON.stringify(details)}`);
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

const browser = await chromium.launch({ headless: true });
const report = {
  started_at: startedAt,
  base_url: baseUrl,
  status: 'unknown',
  checks: [],
  screenshots: [],
};

try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(`${baseUrl}/one-time`, { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => {
    const robot = document.querySelector('[data-bna-bot-launcher], .bna-bot-launcher, .bna-bot-avatar');
    const robotRect = robot?.getBoundingClientRect();
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      hasModal: Boolean(document.querySelector('[data-signup-modal]')),
      hasStudent: /signupStudentName|name="student/i.test(document.documentElement.innerHTML),
      hasInlineSignup: /signup-strip|id="interestForm"/i.test(document.documentElement.innerHTML),
      horizontalNavCss: /overflow-x:\s*auto/i.test(document.querySelector('style')?.textContent || ''),
      robotButton: robotRect ? { x: robotRect.x, y: robotRect.y, width: robotRect.width, height: robotRect.height } : null,
      bodyOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > document.documentElement.clientWidth + 1,
    };
  });
  if (!/Give your son a love for Torah you never thought possible\./i.test(metrics.h1)) fail('new h1 missing', metrics);
  if (!metrics.hasModal) fail('signup modal missing', metrics);
  if (metrics.hasStudent) fail('student field still visible', metrics);
  if (metrics.hasInlineSignup) fail('inline signup still visible', metrics);
  if (!metrics.horizontalNavCss) fail('horizontal mobile nav css missing', metrics);
  if (metrics.bodyOverflow) fail('closed page has horizontal overflow', metrics);
  report.checks.push({ name: 'live mobile landing DOM/readability contract', ok: true, metrics });

  const mobilePath = path.join(outDir, 'live-mobile-390.png');
  await page.screenshot({ path: mobilePath, fullPage: true });
  report.screenshots.push(rel(mobilePath));

  await page.click('[data-menu-button]');
  await page.waitForTimeout(250);
  const menuMetrics = await page.evaluate(() => {
    const shell = document.querySelector('[data-nav-shell]');
    const links = Array.from(document.querySelectorAll('[data-nav-shell] a')).map((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        text: node.textContent.trim(),
        width: rect.width,
        height: rect.height,
        background: style.backgroundColor,
        color: style.color,
      };
    });
    const buttonStyle = getComputedStyle(document.querySelector('[data-menu-button]'));
    return {
      open: shell?.classList.contains('open') || false,
      shellDisplay: shell ? getComputedStyle(shell).display : '',
      shellOverflowX: shell ? getComputedStyle(shell).overflowX : '',
      menuButtonBackground: buttonStyle.backgroundColor,
      menuButtonColor: buttonStyle.color,
      links,
    };
  });
  if (!menuMetrics.open || menuMetrics.shellDisplay !== 'flex') fail('mobile menu did not open as horizontal strip', menuMetrics);
  if (menuMetrics.shellOverflowX !== 'auto') fail('mobile menu is not horizontally scrollable', menuMetrics);
  if (!menuMetrics.links.length || menuMetrics.links.some((link) => link.height < 40)) fail('mobile nav chips are undersized', menuMetrics);
  report.checks.push({ name: 'live mobile menu horizontal white-chip contract', ok: true, metrics: menuMetrics });

  const menuPath = path.join(outDir, 'live-mobile-menu-390.png');
  await page.screenshot({ path: menuPath, fullPage: false });
  report.screenshots.push(rel(menuPath));

  await page.click('[data-signup-trigger]');
  await page.waitForTimeout(250);
  const modalMetrics = await page.evaluate(() => ({
    visible: Boolean(document.querySelector('[data-signup-modal].open')),
    parentName: Boolean(document.querySelector('input[name="parent_name"]')),
    email: Boolean(document.querySelector('input[name="email"]')),
    phone: Boolean(document.querySelector('input[name="phone"]')),
    student: Boolean(document.querySelector('input[name*="student" i]')),
    family: Boolean(document.querySelector('input[name="signup_audience"][value="family"]')),
    school: Boolean(document.querySelector('input[name="signup_audience"][value="school"]')),
  }));
  if (
    !modalMetrics.visible ||
    !modalMetrics.parentName ||
    !modalMetrics.email ||
    !modalMetrics.phone ||
    modalMetrics.student ||
    !modalMetrics.family ||
    !modalMetrics.school
  ) {
    fail('signup modal contract failed', modalMetrics);
  }
  report.checks.push({ name: 'live signup modal field contract without student field', ok: true, metrics: modalMetrics });

  const modalPath = path.join(outDir, 'live-signup-modal-390.png');
  await page.screenshot({ path: modalPath, fullPage: false });
  report.screenshots.push(rel(modalPath));

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${baseUrl}/one-time`, { waitUntil: 'networkidle' });
  const desktopPath = path.join(outDir, 'live-desktop-1440.png');
  await desktop.screenshot({ path: desktopPath, fullPage: true });
  report.screenshots.push(rel(desktopPath));

  if (errors.length) fail('browser errors on live landing', { errors });
  report.status = 'passed';
} finally {
  await browser.close();
}

const jsonPath = path.join(outDir, 'report.json');
const mdPath = path.join(outDir, 'report.md');
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(mdPath, `${[
  `# One Time Public Landing Live Visual Proof - ${startedAt}`,
  '',
  `Base URL: ${baseUrl}`,
  `Result: ${report.status}`,
  '',
  '## Checks',
  ...report.checks.map((check) => `- PASS ${check.name}`),
  '',
  '## Screenshots',
  ...report.screenshots.map((shot) => `- ${shot}`),
  '',
  'No form submission, external send, payment, access grant, DNS change, or provider mutation was performed by this visual proof.',
  '',
].join('\n')}`);

console.log(JSON.stringify({ ok: true, report: rel(mdPath), screenshots: report.screenshots }, null, 2));
