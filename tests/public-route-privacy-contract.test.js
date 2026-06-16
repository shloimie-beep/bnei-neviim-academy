const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const studentHtml = fs.readFileSync(path.join(publicDir, 'student.html'), 'utf8');
const parentHtml = fs.readFileSync(path.join(publicDir, 'parent.html'), 'utf8');
const providerHtml = fs.readFileSync(path.join(publicDir, 'provider.html'), 'utf8');
const smokeScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'smoke-public-route-privacy.mjs'), 'utf8');

const publicRouteFiles = [
  'index.html',
  'parent.html',
  'student.html',
  'signup.html',
  'signup-he.html',
  'service-providers.html',
  'providers-join.html',
  'provider-profile.html',
  'one-time-preview.html',
];

const privateStudentStrings = [
  'Huda Weber',
  'Hillel Baraka',
  'Menachem Mendel Dratler',
  'Eitan Chaim Golombo',
  'Amitai Kosofsky',
  'ahuvadratler@gmail.com',
];

test('public and portal route shells do not embed known private student data', () => {
  for (const fileName of publicRouteFiles) {
    const source = fs.readFileSync(path.join(publicDir, fileName), 'utf8');
    for (const privateValue of privateStudentStrings) {
      assert.doesNotMatch(source, new RegExp(privateValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${fileName} contains ${privateValue}`);
    }
  }
});

test('student route supports session login and clears stale browser access codes', () => {
  assert.match(studentHtml, /const STORAGE_KEY = 'bnaStudentAccessCode'/);
  assert.match(studentHtml, /const initialAccessCode = new URLSearchParams\(window\.location\.search\)\.get\('code'\) \|\| ''/);
  assert.match(studentHtml, /if \(!initialAccessCode\) localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(studentHtml, /\/api\/student-portal\/session/);
  assert.match(studentHtml, /\/api\/student-portal\/login/);
  assert.match(studentHtml, /function handlePortalCredentialError/);
  assert.match(studentHtml, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(studentHtml, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(studentHtml, /get\('code'\) \|\| localStorage\.getItem/);
});

test('parent, student, provider, and Operations private APIs are gated server-side', () => {
  assert.match(server, /app\.get\('\/api\/parent-portal', async \(req, res\) => \{[\s\S]*?if \(!session\) return res\.status\(401\)\.json\(\{ error: 'Parent session is required' \}\)/);
  assert.match(server, /app\.get\('\/api\/student-portal', async \(req, res\) => \{[\s\S]*?await getStudentForPortalCredential\(req, res, code\)/);
  assert.match(server, /app\.get\('\/api\/provider-portal\/session', requireProviderSession/);
  assert.match(server, /app\.get\('\/operations', requireAdmin/);
  assert.match(parentHtml, /\/api\/parent-portal\/login/);
  assert.match(providerHtml, /\/api\/provider-portal\/login/);
});

test('repeatable public route privacy smoke covers the Phase 1 unauthenticated route list', () => {
  for (const route of [
    '/',
    '/parent',
    '/parent.html',
    '/parent/login',
    '/student',
    '/student.html',
    '/student/login',
    '/signup',
    '/signup.html',
    '/signup-he',
    '/providers',
    '/service-providers',
    '/become-service-provider',
    '/operations',
    '/api/parent-portal',
    '/api/parent-portal/session',
    '/api/student-portal',
  ]) {
    assert.match(smokeScript, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(smokeScript, /FORBIDDEN_RESPONSE_SNIPPETS/);
  assert.match(smokeScript, /student_access_code/);
  assert.match(smokeScript, /parent_email/);
});
