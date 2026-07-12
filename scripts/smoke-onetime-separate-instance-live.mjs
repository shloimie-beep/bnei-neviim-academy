#!/usr/bin/env node
const args = process.argv.slice(2);
let expectedSha = process.env.BNA_EXPECT_DEPLOYED_SHA || '';
let baseUrlArg = process.env.ONETIME_BASE_URL || '';
for (const arg of args) {
  if (arg.startsWith('--expected-sha=')) {
    expectedSha = arg.slice('--expected-sha='.length);
  } else if (arg === '--expected-sha') {
    // Handled by the indexed pass below.
  } else if (/^https?:\/\//i.test(arg) && !baseUrlArg) {
    baseUrlArg = arg;
  } else if (!baseUrlArg && !arg.startsWith('--')) {
    baseUrlArg = arg;
  }
}
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--expected-sha') expectedSha = args[index + 1] || expectedSha;
}

const baseUrl = String(baseUrlArg || '').replace(/\/+$/, '');
expectedSha = String(expectedSha || '').trim();

if (!baseUrl) {
  console.error('Set ONETIME_BASE_URL or pass the base URL as the first argument.');
  process.exit(1);
}

const checks = [];

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'follow' });
  const text = await response.text().catch(() => '');
  checks.push({ path, status: response.status, ok: response.status >= 200 && response.status < 400 });
  return { response, text };
}

function assertText(path, text, pattern, message) {
  if (!pattern.test(text)) {
    throw new Error(`${path}: ${message}`);
  }
}

function assertNoText(path, text, pattern, message) {
  if (pattern.test(text)) {
    throw new Error(`${path}: ${message}`);
  }
}

try {
  let healthPath = '/api/health';
  let health = await fetchText('/api/health');
  if (health.response.status === 404) {
    healthPath = '/health';
    health = await fetchText('/health');
  }
  assertText(healthPath, health.text, /ok|healthy|database/i, 'health route did not return a healthy marker');

  const deployInfo = await fetchText('/api/deploy-info');
  assertText('/api/deploy-info', deployInfo.text, /"status"\s*:\s*"ok"/, 'deploy info did not return ok');
  if (expectedSha) {
    assertText('/api/deploy-info', deployInfo.text, new RegExp(`"commit_sha"\\s*:\\s*"${expectedSha.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `deployed SHA does not match ${expectedSha}`);
  }

  const config = await fetchText('/api/one-time/instance-config');
  assertText('/api/one-time/instance-config', config.text, /"app_instance"\s*:\s*"onetime"/, 'instance config is not One Time');
  assertText('/api/one-time/instance-config', config.text, /"workspace_key"\s*:\s*"rabbi_sheller_provider"/, 'workspace key is not scoped to Rabbi provider');
  assertText('/api/one-time/instance-config', config.text, /"student_bot_enabled"\s*:\s*false/, 'student bot is not disabled');

  for (const route of ['/', '/public', '/one-time', '/one-time/']) {
    const result = await fetchText(route);
    assertText(route, result.text, /Give your son a love for Torah you never thought possible\./i, 'canonical launch funnel headline missing');
    assertText(route, result.text, /One Time Mishnayos/i, 'One Time focused brand missing');
    assertText(route, result.text, /Sign Up Now/i, 'signup CTA missing');
    assertText(route, result.text, /href="\/one-time\/signup"/i, 'direct signup page link missing');
    assertNoText(route, result.text, /Your Child Can Love Learning Mishnayos/i, 'retired launch headline is still visible');
    assertNoText(route, result.text, /data-signup-modal|signup-strip|id="interestForm"|id="signupStudentName"|name="student/i, 'retired inline/modal/student signup field is still visible');
    assertNoText(route, result.text, /name="parentName"|name="region"|name="notes"/i, 'retired lead-capture field naming is still visible');
    assertNoText(route, result.text, /parent access next steps|Parent portal setup instructions/i, 'old portal-access promise leaked into public funnel');
    assertNoText(route, result.text, /classroom code|recovery code|fallback classroom password/i, 'retired classroom/recovery-code copy leaked into public funnel');
    assertNoText(route, result.text, /Learn Mishnayos Live with Rabbi Eli Scheller/i, 'stale Rabbi preview page is still being served');
    assertNoText(route, result.text, /Bnei Nevi'?im Academy|Torah Learning for Boys/i, 'BNA public homepage leaked into One Time target');
  }

  const signup = await fetchText('/one-time/signup');
  assertText('/one-time/signup', signup.text, /name="contact_name"/i, 'signup contact name input missing');
  assertText('/one-time/signup', signup.text, /name="signup_as"/i, 'Family/School selector missing');
  assertText('/one-time/signup', signup.text, /<option value="Family">Family<\/option>/i, 'Family signup option missing');
  assertText('/one-time/signup', signup.text, /<option value="School">School<\/option>/i, 'School signup option missing');
  assertText('/one-time/signup', signup.text, /name="email"/i, 'signup email input missing');
  assertText('/one-time/signup', signup.text, /name="phone"/i, 'optional phone input missing');
  assertText('/one-time/signup', signup.text, /\/api\/one-time\/interest/i, 'signup form does not target One Time interest endpoint');
  assertNoText('/one-time/signup', signup.text, /name="student|student_name|signupStudentName/i, 'first lightweight signup asks for student name');

  for (const route of ['/operations-login.html', '/parent.html', '/student.html', '/provider.html', '/one-time-classroom.html']) {
    const result = await fetchText(route);
    assertText(route, result.text, /One Time|Mishnah|portal|workspace|operations/i, 'expected One Time/portal marker missing');
    if (/student\.html|parent\.html/.test(route)) {
      assertText(route, result.text, /one-time-single-tenant\.js/, 'single-tenant portal helper is not loaded');
    }
  }

  console.log(JSON.stringify({
    ok: true,
    base_url: baseUrl,
    expected_sha: expectedSha,
    checks,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    base_url: baseUrl,
    expected_sha: expectedSha,
    checks,
    error: error.message,
  }, null, 2));
  process.exit(1);
}
