#!/usr/bin/env node
const baseUrl = String(process.env.ONETIME_BASE_URL || process.argv[2] || '').replace(/\/+$/, '');

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

  const config = await fetchText('/api/one-time/instance-config');
  assertText('/api/one-time/instance-config', config.text, /"app_instance"\s*:\s*"onetime"/, 'instance config is not One Time');
  assertText('/api/one-time/instance-config', config.text, /"workspace_key"\s*:\s*"rabbi_sheller_provider"/, 'workspace key is not scoped to Rabbi provider');
  assertText('/api/one-time/instance-config', config.text, /"student_bot_enabled"\s*:\s*false/, 'student bot is not disabled');

  for (const route of ['/', '/public', '/one-time', '/one-time/']) {
    const result = await fetchText(route);
    assertText(route, result.text, /Your Child Can Love Learning Mishnayos/i, 'canonical launch funnel headline missing');
    assertText(route, result.text, /OneTimeOneTime Mishnah/i, 'One Time focused brand missing');
    assertText(route, result.text, /Sign Up Now/i, 'signup CTA missing');
    assertText(route, result.text, /signup-strip/i, 'email signup strip missing');
    assertText(route, result.text, /id="signupEmail"/i, 'signup email input missing');
    assertText(route, result.text, /\/api\/one-time\/interest/i, 'signup form does not target One Time interest endpoint');
    assertNoText(route, result.text, /name="parentName"|name="phone"|name="region"|name="notes"/i, 'retired multi-field lead capture is still visible');
    assertNoText(route, result.text, /classroom code|recovery code|fallback classroom password/i, 'retired classroom/recovery-code copy leaked into public funnel');
    assertNoText(route, result.text, /Learn Mishnayos Live with Rabbi Eli Scheller/i, 'stale Rabbi preview page is still being served');
    assertNoText(route, result.text, /Bnei Nevi'?im Academy|Torah Learning for Boys/i, 'BNA public homepage leaked into One Time target');
  }

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
    checks,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    base_url: baseUrl,
    checks,
    error: error.message,
  }, null, 2));
  process.exit(1);
}
