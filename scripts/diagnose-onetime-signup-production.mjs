import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'https://join.onetimeonetime.com';
const outDir = path.resolve('ops/live-smokes');
const submitModeArg = process.argv.find((arg) => arg.startsWith('--submit-mode='));
const submitMode = submitModeArg ? submitModeArg.split('=')[1] : 'intercept';
const allowLiveSubmit = submitMode === 'live';

function redactValue(name, value) {
  const key = String(name || '').toLowerCase();
  const raw = String(value || '');
  if (!raw) return '';
  if (key.includes('email')) return raw.replace(/^(.).+(@.+)$/, '$1***$2');
  if (key.includes('phone') || key.includes('whatsapp')) return raw.replace(/\d(?=\d{2})/g, '*');
  if (key.includes('name')) return '[redacted-name]';
  return raw.length > 80 ? `${raw.slice(0, 77)}...` : raw;
}

async function fetchJson(url) {
  const response = await fetch(url);
  return {
    status: response.status,
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

async function inspectErrorsAndFocus(page) {
  return page.evaluate(() => ({
    activeElement: {
      tag: document.activeElement?.tagName?.toLowerCase() || '',
      id: document.activeElement?.id || '',
      name: document.activeElement?.getAttribute('name') || '',
      text: document.activeElement?.textContent?.trim()?.slice(0, 120) || '',
      ariaInvalid: document.activeElement?.getAttribute('aria-invalid') || '',
    },
    visibleErrors: Array.from(document.querySelectorAll('.field-error.visible')).map((node) => ({
      field: node.getAttribute('data-error-for') || '',
      text: node.textContent.trim(),
      rect: (() => {
        const rect = node.getBoundingClientRect();
        return {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        };
      })(),
    })),
    status: document.querySelector('[data-form-status]')?.textContent?.trim() || '',
  }));
}

async function fillBase(page, { audience = 'Family', reminder = 'none', phone = '', consent = false } = {}) {
  await page.fill('input[name="contact_name"]', 'Production Diagnostic Parent');
  await page.click(`input[name="audience_type"][value="${audience.toLowerCase()}"]`);
  await page.fill('input[name="location"]', 'Ramat Beit Shemesh');
  await page.dispatchEvent('input[name="location"]', 'input');
  await page.fill('input[name="email"]', `prod-diagnostic-${Date.now()}@example.invalid`);
  if (phone) await page.fill('input[name="phone"]', phone);
  await page.check(`input[name="reminder_preference"][value="${reminder}"]`);
  if (consent) await page.check('input[name="reminder_consent"]');
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const report = {
    started_at: startedAt,
    base_url: baseUrl,
    submit_mode: submitMode,
    deploy_info: await fetchJson(`${baseUrl}/api/deploy-info`),
    landing: {},
    signup: {},
    scenarios: [],
  };

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 430, height: 920 }, timezoneId: 'America/New_York' });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (error) => consoleMessages.push({ type: 'pageerror', text: error.message }));

  try {
    await page.goto(`${baseUrl}/one-time/`, { waitUntil: 'domcontentloaded' });
    report.landing.url = page.url();
    report.landing.ctas = await page.evaluate(() => Array.from(document.querySelectorAll('a, button')).filter((node) => /sign up now/i.test(node.textContent || '')).map((node) => ({
      tag: node.tagName.toLowerCase(),
      text: node.textContent.trim().replace(/\s+/g, ' '),
      href: node.href || '',
      actionId: node.getAttribute('data-action-id') || '',
      type: node.getAttribute('type') || '',
      hidden: Boolean(node.hidden || node.closest('[hidden]') || window.getComputedStyle(node).display === 'none'),
    })));

    const firstCta = report.landing.ctas.find((cta) => cta.href.includes('/one-time/signup'));
    if (!firstCta) throw new Error('No Sign Up Now CTA found on landing');
    await page.click(`a[href*="/one-time/signup"]`);
    await page.waitForURL(/\/one-time\/signup\/?$/);
    report.signup.route_from_first_cta = page.url();

    report.signup.initial_controls = (await inspectControls(page)).map((control) => ({
      ...control,
      value: redactValue(control.name || control.id, control.value),
    }));

    const postAttempts = [];
    if (!allowLiveSubmit) {
      await page.route('**/api/one-time/interest', async (route) => {
        const request = route.request();
        if (request.method() !== 'POST' || request.url().includes('dry_run')) {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            contact_key: 'diagnostic-intercept-contact',
            signup_key: 'diagnostic-intercept-signup',
            confirmation_queued: false,
            reminder_preference: 'none',
            next_path: '/one-time/signup',
            duplicate_submission: false,
            intercepted_no_write: true,
          }),
        });
      });
    }
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/one-time/interest')) {
        let parsed = null;
        try {
          parsed = JSON.parse(request.postData() || '{}');
        } catch {
          parsed = null;
        }
        postAttempts.push({
          url: request.url(),
          keys: parsed ? Object.keys(parsed).sort() : [],
          metadataKeys: parsed?.metadata ? Object.keys(parsed.metadata).sort() : [],
          audience_type: parsed?.audience_type || '',
          reminder_preference: parsed?.metadata?.reminder_preference || parsed?.reminder_preference || '',
          has_phone: Boolean(parsed?.phone || parsed?.whatsapp),
          reminder_consent: parsed?.reminder_consent ?? parsed?.metadata?.reminder_consent ?? null,
        });
      }
    });

    await fillBase(page, { audience: 'Family', reminder: 'none', consent: false });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(400);
    report.scenarios.push({
      name: 'Family + No reminders + no phone + no consent',
      expected_by_packet: 'success',
      actual: {
        url: page.url(),
        submit_mode: submitMode,
        post_attempt_count: postAttempts.length,
        errors_and_focus: await inspectErrorsAndFocus(page),
        controls: (await inspectControls(page)).map((control) => ({
          ...control,
          value: redactValue(control.name || control.id, control.value),
        })),
      },
    });

    await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
    const dryRunPayload = await page.evaluate(async () => {
      const payload = {
        contact_name: 'Production Diagnostic Parent',
        parent_name: 'Production Diagnostic Parent',
        email: `prod-diagnostic-${Date.now()}@example.invalid`,
        phone: '',
        audience_type: 'family',
        family_school_classification: 'family',
        signup_as: 'Family',
        location: 'Ramat Beit Shemesh',
        city_label: 'Ramat Beit Shemesh',
        city_name: 'Ramat Beit Shemesh',
        timezone: 'America/New_York',
        reminder_preference: 'none',
        reminder_consent: false,
        source: 'one_time_public_signup',
        source_landing_page: '/one-time/signup',
        dry_run: true,
        idempotency_key: `prod-diagnostic-${Date.now()}`,
        metadata: {
          synthetic_test: true,
          source: 'production_signup_diagnostic',
          reminder_preference: 'none',
          reminder_consent: false,
          audience_type: 'family',
          family_school_classification: 'family',
        },
      };
      const response = await fetch('/api/one-time/interest?dry_run=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return {
        status: response.status,
        json: await response.json().catch(() => null),
        request_keys: Object.keys(payload).sort(),
      };
    });
    report.scenarios.push({
      name: 'Direct production API dry-run canonical payload',
      actual: dryRunPayload,
    });
  } finally {
    report.console = consoleMessages;
    await browser.close();
  }

  const stamp = startedAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(outDir, `${stamp}-one-time-signup-production-diagnostic.json`);
  const mdPath = path.join(outDir, `${stamp}-one-time-signup-production-diagnostic.md`);
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(mdPath, [
    '# One Time Signup Production Diagnostic',
    '',
    `- Base URL: ${baseUrl}`,
    `- Started: ${startedAt}`,
    `- Deployed SHA: ${report.deploy_info.json?.commit_sha || 'unknown'}`,
    `- Signup route from first CTA: ${report.signup.route_from_first_cta || 'not reached'}`,
    `- Landing Sign Up CTA count: ${report.landing.ctas?.length || 0}`,
    '',
    '## Failure Reproduction',
    '',
    ...report.scenarios.map((scenario) => [
      `### ${scenario.name}`,
      '',
      `- Expected by packet: ${scenario.expected_by_packet || 'n/a'}`,
      `- POST attempts: ${scenario.actual?.post_attempt_count ?? 'n/a'}`,
      `- Visible errors: ${JSON.stringify(scenario.actual?.errors_and_focus?.visibleErrors || scenario.actual?.json?.field_errors || scenario.actual?.json?.error || [])}`,
      `- Focus: ${JSON.stringify(scenario.actual?.errors_and_focus?.activeElement || {})}`,
      `- Response status: ${scenario.actual?.status ?? 'n/a'}`,
      '',
    ].join('\n')),
    '## Files',
    '',
    `- JSON: ${jsonPath}`,
    '',
  ].join('\n'));
  console.log(JSON.stringify({
    ok: true,
    json_path: jsonPath,
    md_path: mdPath,
    deployed_sha: report.deploy_info.json?.commit_sha || null,
    first_scenario: report.scenarios[0],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
