import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.ONETIME_BASE_URL || process.env.BNA_LIVE_BASE_URL || 'https://join.onetimeonetime.com',
    expectedSha: process.env.BNA_EXPECT_DEPLOYED_SHA || '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--expected-sha') {
      options.expectedSha = argv[index + 1] || options.expectedSha;
      index += 1;
    } else if (arg.startsWith('--expected-sha=')) {
      options.expectedSha = arg.slice('--expected-sha='.length);
    } else if (/^https?:\/\//i.test(arg)) {
      options.baseUrl = arg;
    } else if (!arg.startsWith('--') && !options.baseUrl) {
      options.baseUrl = arg;
    }
  }
  options.baseUrl = String(options.baseUrl || '').replace(/\/$/, '');
  options.expectedSha = String(options.expectedSha || '').trim();
  return options;
}

const options = parseArgs(process.argv.slice(2));
const baseUrl = options.baseUrl;
const outDir = path.resolve('ops/live-smokes');

const FIELD_MESSAGES = {
  contact_name: 'Enter the parent or contact name.',
  email_missing: 'Enter an email address.',
  email_invalid: 'Enter a valid email address.',
  audience_type: 'Choose Family or School.',
  location: 'Enter your city or location.',
  reminder_preference: 'Choose Email, WhatsApp, Both, or No reminders.',
  phone: 'Enter a WhatsApp number or choose a different reminder option.',
  reminder_consent: 'Confirm that we may send the selected class information and reminders.',
};

function redactValue(name, value) {
  const key = String(name || '').toLowerCase();
  const raw = String(value || '');
  if (!raw) return '';
  if (key.includes('email')) return raw.replace(/^(.).+(@.+)$/, '$1***$2');
  if (key.includes('phone') || key.includes('whatsapp')) return raw.replace(/\d(?=\d{2})/g, '*');
  if (key.includes('name')) return '[redacted-name]';
  return raw.length > 120 ? `${raw.slice(0, 117)}...` : raw;
}

function redactedPayloadShape(payload = {}) {
  return {
    keys: Object.keys(payload).sort(),
    metadata_keys: payload.metadata && typeof payload.metadata === 'object' ? Object.keys(payload.metadata).sort() : [],
    contact_name_present: Boolean(payload.contact_name),
    email_present: Boolean(payload.email),
    phone_present: Boolean(payload.phone),
    audience_type: payload.audience_type || '',
    signup_as: payload.signup_as || payload.metadata?.signup_as || '',
    location_present: Boolean(payload.location),
    timezone: payload.timezone || '',
    reminder_preference: payload.reminder_preference || '',
    reminder_consent: payload.reminder_consent ?? null,
    idempotency_key_present: Boolean(payload.idempotency_key),
    source: payload.source || '',
  };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  return {
    status: response.status,
    ok: response.ok,
    json: await response.json().catch(() => null),
  };
}

async function inspectControls(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('form input, form select, form textarea, form button')).map((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName.toLowerCase(),
      name: node.getAttribute('name') || '',
      id: node.id || '',
      type: node.getAttribute('type') || (node.tagName.toLowerCase() === 'button' ? 'submit' : ''),
      required: Boolean(node.required),
      disabled: Boolean(node.disabled),
      hidden: Boolean(node.hidden || node.closest('[hidden]') || style.display === 'none' || style.visibility === 'hidden'),
      checked: 'checked' in node ? Boolean(node.checked) : null,
      value: node.value || '',
      ariaInvalid: node.getAttribute('aria-invalid') || '',
      ariaDescribedBy: node.getAttribute('aria-describedby') || '',
      rect: {
        x: Math.round(rect.x * 100) / 100,
        y: Math.round(rect.y * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      },
    };
  }));
}

async function visibleErrorsAndFocus(page) {
  return page.evaluate(() => ({
    activeElement: {
      tag: document.activeElement?.tagName?.toLowerCase() || '',
      id: document.activeElement?.id || '',
      name: document.activeElement?.getAttribute('name') || '',
      text: document.activeElement?.textContent?.trim()?.replace(/\s+/g, ' ').slice(0, 140) || '',
      ariaInvalid: document.activeElement?.getAttribute('aria-invalid') || '',
    },
    visibleErrors: Array.from(document.querySelectorAll('.field-error.visible')).map((node) => ({
      field: node.getAttribute('data-error-for') || '',
      text: node.textContent.trim(),
    })),
    status: document.querySelector('[data-form-status]')?.textContent?.trim() || '',
  }));
}

async function setupIntercept(page, expectedPreference = 'none') {
  const attempts = [];
  await page.route('**/api/one-time/interest', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }
    let payload = {};
    try {
      payload = JSON.parse(request.postData() || '{}');
    } catch {}
    attempts.push({ url: request.url(), payload, payload_shape: redactedPayloadShape(payload) });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        contact_key: 'diagnostic-intercept-contact',
        signup_key: 'diagnostic-intercept-signup',
        confirmation_queued: false,
        reminder_preference: payload.reminder_preference || expectedPreference,
        next_path: '/one-time',
        duplicate_submission: false,
        intercepted_no_write: true,
      }),
    });
  });
  return attempts;
}

async function clickAudience(page, audience) {
  if (!audience) return;
  const actionId = audience === 'school' ? 'ACTION-ONETIME-SIGNUP-AS-SCHOOL' : 'ACTION-ONETIME-SIGNUP-AS-FAMILY';
  await page.locator(`[data-action-id="${actionId}"]`).click();
}

async function clickReminder(page, reminder) {
  if (!reminder) return;
  await page.locator(`.radio-card:has(input[name="reminder_preference"][value="${reminder}"])`).click();
}

async function fillScenario(page, input = {}) {
  const {
    name = 'Production Matrix Parent',
    email = `prod-matrix-${Date.now()}@example.invalid`,
    audience = 'family',
    location = 'Ramat Beit Shemesh',
    reminder = 'email',
    phone = '',
    consent = true,
  } = input;
  if (name !== null) await page.fill('input[name="contact_name"]', name);
  await clickAudience(page, audience);
  if (location !== null) {
    await page.fill('input[name="location"]', location);
    await page.dispatchEvent('input[name="location"]', 'input');
  }
  if (email !== null) await page.fill('input[name="email"]', email);
  if (phone) await page.fill('input[name="phone"]', phone);
  await clickReminder(page, reminder);
  if (consent && reminder && reminder !== 'none') await page.locator('input[name="reminder_consent"]').check();
}

async function dryRunServerValidation(payload) {
  const body = {
    ...payload,
    dry_run: true,
    metadata: {
      ...(payload.metadata || {}),
      synthetic_test_lead: true,
      production_signup_matrix_smoke: true,
    },
  };
  return fetchJson(`${baseUrl}/api/one-time/interest?dry_run=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function successCase(browser, scenario, report) {
  const context = await browser.newContext({
    viewport: { width: scenario.width || 430, height: 920 },
    timezoneId: scenario.timezone || 'America/New_York',
  });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', (message) => consoleMessages.push({ type: message.type(), text: message.text() }));
  page.on('pageerror', (error) => consoleMessages.push({ type: 'pageerror', text: error.message }));
  const attempts = await setupIntercept(page, scenario.input.reminder);
  await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
  await fillScenario(page, scenario.input);
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-success-panel].active', { timeout: 7000 });
  const dryRun = attempts[0]?.payload ? await dryRunServerValidation(attempts[0].payload) : null;
  const result = {
    id: scenario.id,
    name: scenario.name,
    expected: 'success',
    passed: attempts.length === 1 && dryRun?.status === 200 && dryRun?.json?.success === true,
    post_attempt_count: attempts.length,
    payload_shape: attempts[0]?.payload_shape || null,
    server_dry_run: dryRun ? {
      status: dryRun.status,
      success: dryRun.json?.success === true,
      workspace_key: dryRun.json?.preview?.workspace_key || null,
      project_key: dryRun.json?.preview?.project_key || null,
      direct_signup_workflow: dryRun.json?.preview?.direct_signup_workflow === true,
      field_errors: dryRun.json?.field_errors || null,
      guardrails: dryRun.json?.preview?.guardrails || null,
    } : null,
    errors_and_focus: await visibleErrorsAndFocus(page),
    console: consoleMessages,
  };
  if (!result.passed) {
    result.controls = (await inspectControls(page)).map((control) => ({
      ...control,
      value: redactValue(control.name || control.id, control.value),
    }));
  }
  report.scenarios.push(result);
  await context.close();
}

async function errorCase(browser, scenario, report) {
  const context = await browser.newContext({
    viewport: { width: scenario.width || 430, height: 920 },
    timezoneId: scenario.timezone || 'America/New_York',
  });
  const page = await context.newPage();
  const attempts = await setupIntercept(page, scenario.input.reminder);
  await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
  await fillScenario(page, scenario.input);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const state = await visibleErrorsAndFocus(page);
  const expectedErrors = scenario.expected_errors;
  const passed = attempts.length === 0
    && state.visibleErrors.length === expectedErrors.length
    && expectedErrors.every((expected, index) => {
      const actual = state.visibleErrors[index];
      return actual?.field === expected.field && actual?.text === expected.text;
    });
  report.scenarios.push({
    id: scenario.id,
    name: scenario.name,
    expected: 'field_error',
    passed,
    post_attempt_count: attempts.length,
    errors_and_focus: state,
    expected_errors: expectedErrors,
    controls: passed ? undefined : (await inspectControls(page)).map((control) => ({
      ...control,
      value: redactValue(control.name || control.id, control.value),
    })),
  });
  await context.close();
}

async function specialCase(browser, scenario, report, startedAt) {
  const context = await browser.newContext({
    viewport: { width: scenario.width || 430, height: 920 },
    timezoneId: scenario.timezone || 'America/New_York',
  });
  const page = await context.newPage();
  const attempts = await setupIntercept(page, 'none');
  await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
  let result = { id: scenario.id, name: scenario.name, expected: scenario.expected, passed: false };

  if (scenario.id === 'switch-whatsapp-to-email') {
    await fillScenario(page, { reminder: 'whatsapp', consent: true });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-error-for="phone"].visible');
    await clickReminder(page, 'email');
    await page.locator('input[name="reminder_consent"]').check();
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-success-panel].active');
    const errors = await visibleErrorsAndFocus(page);
    result = {
      ...result,
      passed: attempts.length === 1 && errors.visibleErrors.length === 0 && attempts[0]?.payload?.reminder_preference === 'email',
      post_attempt_count: attempts.length,
      payload_shape: attempts[0]?.payload_shape || null,
      errors_and_focus: errors,
    };
  } else if (scenario.id === 'switch-email-to-none') {
    await fillScenario(page, { reminder: 'email', consent: true });
    await clickReminder(page, 'none');
    const consentState = await page.locator('input[name="reminder_consent"]').evaluate((node) => ({
      disabled: node.disabled,
      required: node.required,
      checked: node.checked,
      hidden: Boolean(node.closest('[hidden]')),
    }));
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-success-panel].active');
    result = {
      ...result,
      passed: attempts.length === 1 && consentState.disabled && !consentState.required && !consentState.checked && consentState.hidden,
      post_attempt_count: attempts.length,
      consent_state_after_switch: consentState,
      payload_shape: attempts[0]?.payload_shape || null,
    };
  } else if (scenario.id === 'family-school-family') {
    await clickAudience(page, 'family');
    await clickAudience(page, 'school');
    await clickAudience(page, 'family');
    const selected = await page.locator('input[name="audience_type"]:checked').inputValue();
    const hidden = await page.locator('input[name="signup_as"]').inputValue();
    result = { ...result, passed: selected === 'family' && hidden === 'Family', selected, hidden_signup_as: hidden, post_attempt_count: attempts.length };
  } else if (scenario.id === 'double-click') {
    await fillScenario(page, { reminder: 'none', consent: false });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]').catch(() => null),
    ]);
    await page.waitForSelector('[data-success-panel].active');
    result = { ...result, passed: attempts.length === 1, post_attempt_count: attempts.length, payload_shape: attempts[0]?.payload_shape || null };
  } else if (scenario.id === 'server-validation-refresh') {
    await page.unroute('**/api/one-time/interest');
    let rejected = false;
    await page.route('**/api/one-time/interest', async (route) => {
      const request = route.request();
      if (request.method() !== 'POST') return route.continue();
      attempts.push({ url: request.url(), payload_shape: {} });
      rejected = true;
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, code: 'VALIDATION_ERROR', field_errors: { email: FIELD_MESSAGES.email_invalid } }),
      });
    });
    await fillScenario(page, { reminder: 'email', consent: true });
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-error-for="email"].visible');
    const beforeReload = await visibleErrorsAndFocus(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    const successCount = await page.locator('[data-success-panel].active').count();
    result = {
      ...result,
      passed: rejected && attempts.length === 1 && beforeReload.visibleErrors[0]?.field === 'email' && successCount === 0,
      post_attempt_count: attempts.length,
      before_reload: beforeReload,
      success_panel_after_reload_count: successCount,
    };
  } else if (scenario.id === 'mobile-widths') {
    const screenshots = [];
    for (const width of [430, 390]) {
      await page.setViewportSize({ width, height: 920 });
      await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
      const screenshotPath = path.join(outDir, `${startedAt.replace(/[:.]/g, '-')}-one-time-signup-${width}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        formVisible: Boolean(document.querySelector('[data-one-time-direct-signup-form]')?.offsetParent),
      }));
      screenshots.push({ width, screenshotPath, metrics });
    }
    result = {
      ...result,
      passed: screenshots.every((item) => item.metrics.formVisible && item.metrics.scrollWidth <= item.metrics.clientWidth + 1),
      screenshots,
      post_attempt_count: attempts.length,
    };
  } else if (scenario.id === 'keyboard-only') {
    await page.focus('input[name="contact_name"]');
    await page.keyboard.type('Keyboard Production Parent');
    await page.focus('[data-action-id="ACTION-ONETIME-SIGNUP-AS-FAMILY"]');
    await page.keyboard.press('Enter');
    await page.focus('input[name="location"]');
    await page.keyboard.type('Monsey');
    await page.focus('input[name="email"]');
    await page.keyboard.type(`keyboard-prod-${Date.now()}@example.invalid`);
    await page.focus('.radio-card:has(input[name="reminder_preference"][value="none"])');
    await page.keyboard.press('Enter');
    await page.focus('button[type="submit"]');
    await page.keyboard.press('Enter');
    const successVisible = await page.waitForSelector('[data-success-panel].active', { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    result = {
      ...result,
      passed: successVisible && attempts.length === 1 && attempts[0]?.payload?.audience_type === 'family' && attempts[0]?.payload?.reminder_preference === 'none',
      post_attempt_count: attempts.length,
      success_visible: successVisible,
      payload_shape: attempts[0]?.payload_shape || null,
      errors_and_focus: await visibleErrorsAndFocus(page),
      checked_audience: await page.locator('input[name="audience_type"]:checked').evaluateAll((nodes) => nodes.map((node) => node.value)),
      checked_reminder: await page.locator('input[name="reminder_preference"]:checked').evaluateAll((nodes) => nodes.map((node) => node.value)),
    };
  }

  report.scenarios.push(result);
  await context.close();
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const report = {
    started_at: startedAt,
    base_url: baseUrl,
    expected_sha: options.expectedSha || null,
    deploy_info: await fetchJson(`${baseUrl}/api/deploy-info`),
    deployed_sha_matches_expected: false,
    cta_checks: [],
    initial_controls: [],
    scenarios: [],
    passed: false,
  };
  report.deployed_sha_matches_expected = !options.expectedSha
    || report.deploy_info.json?.commit_sha === options.expectedSha;

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 430, height: 920 }, timezoneId: 'America/New_York' });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/one-time/`, { waitUntil: 'domcontentloaded' });
    report.cta_checks = await page.evaluate(() => Array.from(document.querySelectorAll('a, button'))
      .filter((node) => /sign up now/i.test(node.textContent || ''))
      .map((node, index) => ({
        index,
        tag: node.tagName.toLowerCase(),
        text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
        href: node.href || '',
        action_id: node.getAttribute('data-action-id') || '',
        type: node.getAttribute('type') || '',
        hidden: Boolean(node.hidden || node.closest('[hidden]') || window.getComputedStyle(node).display === 'none'),
      })));
    await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
    report.initial_controls = (await inspectControls(page)).map((control) => ({
      ...control,
      value: redactValue(control.name || control.id, control.value),
    }));
    await context.close();

    const successCases = [
      ['success-family-email', 'Family + Email reminders + no phone', { audience: 'family', reminder: 'email', consent: true }],
      ['success-school-email', 'School + Email reminders + no phone', { audience: 'school', reminder: 'email', consent: true }],
      ['success-family-none', 'Family + No reminders + no phone', { audience: 'family', reminder: 'none', consent: false }],
      ['success-school-none', 'School + No reminders + no phone', { audience: 'school', reminder: 'none', consent: false }],
      ['success-whatsapp-phone', 'WhatsApp reminders + valid phone + consent', { audience: 'family', reminder: 'whatsapp', phone: '+1 732 555 0101', consent: true }],
      ['success-both-phone', 'Both reminders + valid phone + consent', { audience: 'school', reminder: 'both', phone: '+1 732 555 0102', consent: true }],
    ];
    for (const [id, name, input] of successCases) {
      await successCase(browser, { id, name, input }, report);
    }

    const errorCases = [
      ['error-whatsapp-no-phone', 'WhatsApp reminders + no phone', { reminder: 'whatsapp', consent: true }, [{ field: 'phone', text: FIELD_MESSAGES.phone }]],
      ['error-both-no-phone', 'Both reminders + no phone', { reminder: 'both', consent: true }, [{ field: 'phone', text: FIELD_MESSAGES.phone }]],
      ['error-missing-audience', 'Missing audience', { audience: '', reminder: 'email', consent: true }, [{ field: 'audience_type', text: FIELD_MESSAGES.audience_type }]],
      ['error-missing-location', 'Missing location', { location: '', reminder: 'email', consent: true }, [{ field: 'location', text: FIELD_MESSAGES.location }]],
      ['error-missing-reminder', 'Missing reminder choice', { reminder: '', consent: false }, [{ field: 'reminder_preference', text: FIELD_MESSAGES.reminder_preference }]],
      ['error-invalid-email', 'Invalid email', { email: 'not-an-email', reminder: 'email', consent: true }, [{ field: 'email', text: FIELD_MESSAGES.email_invalid }]],
    ];
    for (const [id, name, input, expectedErrors] of errorCases) {
      await errorCase(browser, { id, name, input, expected_errors: expectedErrors }, report);
    }

    const specials = [
      ['switch-whatsapp-to-email', 'Switch WhatsApp to Email after phone error', 'phone optional and error clears'],
      ['switch-email-to-none', 'Switch Email to No reminders', 'consent hides and disables'],
      ['family-school-family', 'Family to School and back', 'selected value remains correct'],
      ['double-click', 'Double-click submit', 'one request'],
      ['server-validation-refresh', 'Refresh after a server validation failure', 'no malformed partial success state'],
      ['mobile-widths', 'Mobile widths 430px and 390px', 'responsive visible form'],
      ['keyboard-only', 'Keyboard-only completion', 'success'],
    ];
    for (const [id, name, expected] of specials) {
      await specialCase(browser, { id, name, expected }, report, startedAt);
    }
  } finally {
    await browser.close();
  }

  const requiredCtasOk = report.cta_checks.filter((cta) => !cta.hidden).length >= 4
    && report.cta_checks.filter((cta) => !cta.hidden).every((cta) => cta.href.endsWith('/one-time/signup') && cta.tag === 'a');
  const controlsOk = report.initial_controls.some((control) => control.name === 'audience_type' && control.value === 'family' && control.required && !control.disabled && !control.checked)
    && report.initial_controls.some((control) => control.name === 'audience_type' && control.value === 'school' && control.required && !control.disabled && !control.checked)
    && report.initial_controls.some((control) => control.name === 'reminder_consent' && control.disabled && !control.required && control.hidden)
    && report.initial_controls.some((control) => control.name === 'phone' && !control.required);
  report.passed = report.deploy_info.ok
    && report.deployed_sha_matches_expected
    && requiredCtasOk
    && controlsOk
    && report.scenarios.every((scenario) => scenario.passed);

  const stamp = startedAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(outDir, `${stamp}-one-time-signup-form-matrix-live.json`);
  const mdPath = path.join(outDir, `${stamp}-one-time-signup-form-matrix-live.md`);
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    '# One Time Signup Form Matrix Live Smoke',
    '',
    `- Base URL: ${baseUrl}`,
    `- Started: ${startedAt}`,
    `- Expected SHA: ${options.expectedSha || 'not asserted'}`,
    `- Deployed SHA: ${report.deploy_info.json?.commit_sha || 'unknown'}`,
    `- SHA Match: ${report.deployed_sha_matches_expected ? 'yes' : 'no'}`,
    `- Status: ${report.passed ? 'PASSED' : 'FAILED'}`,
    `- Visible Sign Up Now CTAs: ${report.cta_checks.filter((cta) => !cta.hidden).length}`,
    '',
    '## Scenarios',
    '',
    '| ID | Status | POSTs | Detail |',
    '| --- | --- | ---: | --- |',
    ...report.scenarios.map((scenario) => `| ${scenario.id} | ${scenario.passed ? 'PASS' : 'FAIL'} | ${scenario.post_attempt_count ?? 'n/a'} | ${scenario.name} |`),
    '',
    '## Files',
    '',
    `- JSON: ${jsonPath}`,
  ];
  await fs.writeFile(mdPath, `${lines.join('\n')}\n`);
  console.log(JSON.stringify({
    ok: report.passed,
    expected_sha: options.expectedSha || null,
    deployed_sha: report.deploy_info.json?.commit_sha || null,
    json_path: jsonPath,
    md_path: mdPath,
    failed: report.scenarios.filter((scenario) => !scenario.passed).map((scenario) => ({ id: scenario.id, name: scenario.name })),
  }, null, 2));
  if (!report.passed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
