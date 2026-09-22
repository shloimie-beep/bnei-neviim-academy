import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const baseUrl = (process.argv[2] || process.env.BNA_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/$/, '');
const outDir = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(outDir, { recursive: true });

const viewport = { width: 390, height: 844 };
const forbiddenPrivatePatterns = [
  /password_hash/i,
  /refresh_token/i,
  /setup token value/i,
  /bnaStudentAccessCode/i,
  /Student linked/i,
  /Daily checkoff/i,
  /private notes/i,
  /Linked Records/i,
];

const routes = [
  {
    id: 'home',
    path: '/',
    expect: [/Bnei Neviim Academy/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'home-bot-open',
    path: '/',
    expect: [/Bnei Neviim Academy/i],
    openBot: true,
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'signup-en',
    path: '/signup.html',
    expect: [/Required Registration Documents/i, /Parent 1/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'signup-he',
    path: '/signup-he.html',
    expect: [/Bnei Neviim Academy/i],
    documentCardCountAtLeast: 4,
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'doc-parent-handbook',
    path: '/documents/registration-document?document=parent_handbook&lang=en',
    expect: [/Handbook/i, /signature/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'doc-tuition',
    path: '/documents/registration-document?document=tuition_agreement&lang=en',
    expect: [/Tuition/i, /signature/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'doc-waiver',
    path: '/documents/registration-document?document=safety_acknowledgment_waiver&lang=en',
    expect: [/Waiver|Safety/i, /signature/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'doc-student-handbook',
    path: '/documents/registration-document?document=student_code_of_conduct&lang=en',
    expect: [/Student Handbook|Code of Conduct/i, /signature/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'parent-login',
    path: '/parent/login',
    expect: [/Parent Login|Parent Portal|Log in/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'parent-accountability-onboard',
    path: '/parent/login?onboard=accountability',
    expect: [/parent|accountability|onboarding/i],
    staleStudentCodeShouldClear: true,
  },
  {
    id: 'student-login',
    path: '/student/login',
    expect: [/Student|Access|Login|code/i],
    staleStudentCodeShouldClear: false,
  },
  {
    id: 'provider-login',
    path: '/provider/login',
    expect: [/Provider portal/i, /Provider workspace|Scoped Provider Workspace/i],
    staleStudentCodeShouldClear: true,
  },
];

const pass = [];
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
  pass.push(message);
}

function routeUrl(routePath) {
  return `${baseUrl}${routePath}`;
}

function screenshotName(route) {
  return `${route.id}-${viewport.width}x${viewport.height}.png`;
}

async function seedStaleStudentCode(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('bnaStudentAccessCode', 'stale-mobile-smoke-code');
  });
}

async function readText(page) {
  return page.locator('body').innerText({ timeout: 10000 });
}

async function checkNoOverflow(page, routeId) {
  const metrics = await page.evaluate(() => ({
    htmlScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
  }));
  const limit = metrics.clientWidth + 6;
  assert(metrics.htmlScrollWidth <= limit, `${routeId}: html does not overflow horizontally (${metrics.htmlScrollWidth}/${metrics.clientWidth})`);
  assert(metrics.bodyScrollWidth <= limit, `${routeId}: body does not overflow horizontally (${metrics.bodyScrollWidth}/${metrics.clientWidth})`);
}

async function runRoute(page, route) {
  const pageErrors = [];
  const onPageError = (error) => pageErrors.push(error.message || String(error));
  page.on('pageerror', onPageError);

  await seedStaleStudentCode(page);
  await page.goto(routeUrl(route.path), { waitUntil: 'networkidle' });
  await page.waitForTimeout(route.openBot ? 1200 : 500);

  if (route.openBot) {
    await page.locator('.bna-bot-launcher').click({ timeout: 10000 });
    await page.waitForSelector('.bna-bot-panel.is-open', { timeout: 10000 });
  }

  const text = await readText(page);
  for (const pattern of route.expect) {
    assert(pattern.test(text), `${route.id}: expected text ${pattern}`);
  }
  for (const pattern of forbiddenPrivatePatterns) {
    assert(!pattern.test(text), `${route.id}: did not expose private pattern ${pattern}`);
  }
  if (route.documentCardCountAtLeast) {
    const cardCount = await page.locator('.document-card').count();
    assert(cardCount >= route.documentCardCountAtLeast, `${route.id}: rendered at least ${route.documentCardCountAtLeast} document cards`);
  }
  if (route.staleStudentCodeShouldClear) {
    const stored = await page.evaluate(() => localStorage.getItem('bnaStudentAccessCode'));
    assert(!stored, `${route.id}: stale student access code cleared on non-student surface`);
  }

  await checkNoOverflow(page, route.id);
  await page.screenshot({ path: path.join(outDir, screenshotName(route)), fullPage: true });
  assert(pageErrors.length === 0, `${route.id}: no page runtime errors`);
  page.off('pageerror', onPageError);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport, isMobile: true });

try {
  for (const route of routes) {
    try {
      await runRoute(page, route);
    } catch (error) {
      failures.push(`${route.id}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

const result = failures.length ? 'FAIL' : 'PASS';
const report = [
  '# Mobile Public/Login/Document Matrix Live Smoke',
  '',
  `- Base URL: \`${baseUrl}\``,
  `- Viewport: \`${viewport.width}x${viewport.height}\``,
  `- Result: ${result}`,
  '- Scope: homepage, public helper launcher/panel, signup forms, required registration document pages, parent/student/provider login shells.',
  '- Guardrail: no form submission, provider signup, parent/student login, assistant send, email, WhatsApp, billing, Google API call, connector write, or external CRM write was executed.',
  '',
  '## Routes',
  '',
  ...routes.map((route) => `- \`${route.path}\` -> \`${screenshotName(route)}\``),
  '',
  '## Checks',
  '',
  ...pass.map((item) => `- PASS ${item}`),
  ...(failures.length ? ['', '## Failures', '', ...failures.map((item) => `- FAIL ${item}`)] : []),
  '',
].join('\n');

fs.writeFileSync(path.join(outDir, 'report.md'), report);
console.log(report);

if (failures.length) {
  process.exitCode = 1;
}
