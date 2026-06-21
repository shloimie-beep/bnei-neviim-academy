#!/usr/bin/env node
const baseUrl = String(process.env.ONETIME_BASE_URL || process.argv[2] || '').replace(/\/+$/, '');

if (!baseUrl) {
  console.error('Set ONETIME_BASE_URL or pass the base URL as the first argument.');
  process.exit(1);
}

const checks = [];

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  const text = await response.text().catch(() => '');
  checks.push({ path, status: response.status, ok: response.status >= 200 && response.status < 400 });
  return { response, text };
}

function assertText(path, text, pattern, message) {
  if (!pattern.test(text)) {
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

  for (const route of ['/one-time', '/operations-login.html', '/parent.html', '/student.html', '/provider.html', '/one-time-classroom.html']) {
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
