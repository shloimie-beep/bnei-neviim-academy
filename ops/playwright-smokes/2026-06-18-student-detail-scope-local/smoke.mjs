import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8095';
const username = process.env.OPS_USERNAME;
const password = process.env.OPS_PASSWORD;
const outDir = process.env.SMOKE_OUT_DIR || path.resolve('ops/playwright-smokes/2026-06-18-student-detail-scope-local');

if (!username || !password) {
  throw new Error('OPS_USERNAME and OPS_PASSWORD are required in environment for local smoke login.');
}

fs.mkdirSync(outDir, { recursive: true });

const requests = [];
const responses = [];
const assertions = [];
const screenshots = [];

function record(ok, message, detail = {}) {
  assertions.push({ ok: Boolean(ok), message, detail });
  if (!ok) {
    const error = new Error(message);
    error.detail = detail;
    throw error;
  }
}

function scopedRequestFor(pathPattern, projectKey, extra = {}) {
  return requests.some((url) => {
    if (!pathPattern.test(url)) return false;
    const parsed = new URL(url, baseUrl);
    if (parsed.searchParams.get('project_key') !== projectKey) return false;
    return Object.entries(extra).every(([key, value]) => parsed.searchParams.get(key) === String(value));
  });
}

function unscopedStudentDetailLeak(pathPattern, studentId) {
  return requests.some((url) => {
    if (!pathPattern.test(url)) return false;
    const parsed = new URL(url, baseUrl);
    return parsed.searchParams.get('project_key') !== 'bna'
      || parsed.searchParams.get('student_id') !== String(studentId);
  });
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  screenshots.push(file);
}

async function gotoOps(page, params) {
  const url = new URL('/operations', baseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

page.on('request', (request) => {
  const url = request.url();
  if (url.includes('/api/bna/') || url.includes('/api/operations/')) requests.push(url);
});

page.on('response', async (response) => {
  const url = response.url();
  if (!url.includes('/api/bna/students')) return;
  try {
    responses.push({ url, status: response.status(), body: await response.json() });
  } catch {
    responses.push({ url, status: response.status(), body: null });
  }
});

try {
  const returnTo = encodeURIComponent('/operations?workspace=bna&view=students&section=list');
  await page.goto(`${baseUrl}/operations-login.html?returnTo=${returnTo}`, { waitUntil: 'domcontentloaded' });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await Promise.all([
    page.waitForURL(/\/operations/, { timeout: 20000 }),
    page.click('#submitBtn'),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  record(scopedRequestFor(/\/api\/bna\/students/, 'bna'), 'BNA Students roster requests students with project_key=bna.');
  const roster = responses.find((item) => item.body?.students?.length)?.body?.students || [];
  const student = roster.find((item) => Number(item.id) > 0);
  const studentId = Number(student?.id || process.env.SMOKE_STUDENT_ID || 999999);
  const usedSyntheticStudentId = !student?.id;
  record(
    Boolean(student?.id) || studentId === 999999,
    usedSyntheticStudentId
      ? 'BNA Students roster was empty locally; using synthetic student_id=999999 to verify request scoping only.'
      : 'BNA Students roster returned at least one student for selected-student smoke.',
    { selected_student_id: studentId, synthetic: usedSyntheticStudentId }
  );
  await shot(page, 'bna-students-list-mobile');

  requests.length = 0;
  await gotoOps(page, { workspace: 'bna', view: 'students', section: 'profile', student: studentId });

  record(scopedRequestFor(/\/api\/bna\/students/, 'bna'), 'Selected student profile still requests the BNA-scoped student roster.');
  record(scopedRequestFor(/\/api\/bna\/assignments/, 'bna', { student_id: studentId }), 'Selected student profile requests assignments with project_key=bna and student_id.');
  record(scopedRequestFor(/\/api\/bna\/devices/, 'bna', { student_id: studentId }), 'Selected student profile requests devices with project_key=bna and student_id.');
  record(scopedRequestFor(/\/api\/bna\/device-access-rules/, 'bna', { student_id: studentId }), 'Selected student profile requests device rules with project_key=bna and student_id.');
  record(scopedRequestFor(/\/api\/bna\/accountability/, 'bna', { student_id: studentId }), 'Selected student profile requests accountability with project_key=bna and student_id.');
  record(!unscopedStudentDetailLeak(/\/api\/bna\/(assignments|devices|device-access-rules|accountability)/, studentId), 'Selected student detail made no unscoped detail-data requests.');
  await shot(page, 'bna-student-profile-mobile');

  await page.setViewportSize({ width: 1440, height: 900 });
  requests.length = 0;
  await gotoOps(page, { workspace: 'rabbi_sheller_provider', view: 'students', section: 'profile', student: studentId });
  record(scopedRequestFor(/\/api\/bna\/students/, 'one_time_mishnah_class'), 'Provider Students roster requests project_key=one_time_mishnah_class.');
  record(
    !requests.some((url) => /\/api\/bna\/torah-learning/.test(url) && new URL(url, baseUrl).searchParams.get('project_key') !== 'one_time_mishnah_class'),
    'Provider Students view makes no unscoped BNA Torah summary request.'
  );
  await shot(page, 'provider-students-scope-desktop');

  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth > document.body.clientWidth + 1,
    doc: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  record(!overflow.body && !overflow.doc, 'No body/document horizontal overflow on final desktop viewport.', overflow);

  const report = {
    result: 'passed',
    baseUrl,
    selected_student_id: studentId,
    synthetic_student_id: usedSyntheticStudentId,
    assertions,
    screenshots: screenshots.map((file) => path.relative(process.cwd(), file).replace(/\\/g, '/')),
    checked_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'report.md'), [
    '# Student Detail Scope Local Smoke - 2026-06-18',
    '',
    'Result: passed',
    '',
    `Checked local Operations on ${baseUrl} with throwaway local Operations credentials.`,
    `Selected student ID used for detail-scope assertions: ${studentId}${usedSyntheticStudentId ? ' (synthetic fallback because the local BNA roster was empty)' : ''}.`,
    '',
    '## Assertions',
    ...assertions.map((item) => `- ${item.message}`),
    '',
    '## Screenshots',
    ...report.screenshots.map((file) => `- ${file}`),
    '',
  ].join('\n'));
} catch (error) {
  const report = {
    result: 'failed',
    baseUrl,
    error: error.message,
    detail: error.detail || null,
    assertions,
    screenshots: screenshots.map((file) => path.relative(process.cwd(), file).replace(/\\/g, '/')),
    requests,
    checked_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'report.md'), [
    '# Student Detail Scope Local Smoke - 2026-06-18',
    '',
    'Result: failed',
    '',
    `Error: ${error.message}`,
    '',
    '## Assertions',
    ...assertions.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.message}`),
    '',
  ].join('\n'));
  throw error;
} finally {
  await browser.close();
}
