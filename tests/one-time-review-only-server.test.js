const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const test = require('node:test');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRoute(baseUrl, route, child, logs) {
  const deadline = Date.now() + 30000;
  let lastError = '';
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited ${child.exitCode}: ${logs.join('')}`);
    }
    try {
      const response = await fetch(`${baseUrl}${route}`);
      if (response.status < 500) return response;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await wait(250);
  }
  throw new Error(`timed out waiting for ${route}: ${lastError}; logs: ${logs.join('')}`);
}

test('One Time review-only server serves fixture routes without database secrets', async (t) => {
  const port = 19000 + Math.floor(Math.random() * 900);
  const baseUrl = `http://127.0.0.1:${port}`;
  const logs = [];
  const child = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
      ONE_TIME_REVIEW_ONLY_NO_DB: '1',
      DATABASE_URL: '',
      OPS_USERNAME: '',
      OPS_PASSWORD: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  child.stderr.on('data', (chunk) => logs.push(chunk.toString()));
  t.after(() => {
    if (child.exitCode === null) child.kill();
  });

  const landing = await waitForRoute(baseUrl, '/one-time', child, logs);
  assert.equal(landing.status, 200);
  assert.match(await landing.text(), /One Time Mishnayos/);

  const pages = [
    '/provider.html?review=one-time',
    '/parent.html?review=one-time',
    '/student.html?review=one-time',
    '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    '/one-time-email-review.html',
  ];
  for (const route of pages) {
    const response = await fetch(`${baseUrl}${route}`);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type') || '', /html/i, route);
  }

  const parentReview = await (await fetch(`${baseUrl}/parent.html?review=one-time`)).text();
  assert.match(parentReview, /One Time Parent Review/);
  assert.match(parentReview, /\/api\/one-time-review\/parent/);
  assert.match(parentReview, /One Time Parent Helper/);
  assert.doesNotMatch(parentReview, /data-parent-onboarding-form/);

  const apiRoutes = [
    '/api/one-time-review/parent',
    '/api/one-time-review/student',
    '/api/one-time-review/provider',
    '/api/one-time-review/classroom',
    '/api/one-time-review/email-templates',
  ];
  for (const route of apiRoutes) {
    const response = await fetch(`${baseUrl}${route}`);
    assert.equal(response.status, 200, route);
    const json = await response.json();
    assert.equal(json.success, true, route);
    assert.equal(json.external_write_performed, false, route);
    assert.equal(json.test_only, true, route);
  }

  const student = await (await fetch(`${baseUrl}/api/one-time-review/student`)).json();
  assert.equal(student.bot_enabled, false);
  assert.equal(student.bna_accountability_enabled, false);

  const email = await (await fetch(`${baseUrl}/api/one-time-review/email-templates`)).json();
  assert.equal(email.send_disabled, true);
  assert.ok(email.email_templates.length >= 21);
});
