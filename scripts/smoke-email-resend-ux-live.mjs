#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function parseSetCookie(response) {
  const raw = response.headers.get('set-cookie') || '';
  const first = raw.split(';')[0] || '';
  const index = first.indexOf('=');
  if (index <= 0) return null;
  return { name: first.slice(0, index), value: first.slice(index + 1) };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoSecretText(value, label) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value || {});
  assert(!/re_[A-Za-z0-9_-]{12,}/.test(serialized), `${label} exposed a Resend API key-looking value`);
  assert(!/whsec_[A-Za-z0-9+/=_-]{12,}/.test(serialized), `${label} exposed a Resend webhook secret-looking value`);
}

async function requestText(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

async function requestJson(url, options = {}) {
  const { response, text } = await requestText(url, {
    ...options,
    headers: { accept: 'application/json', ...(options.headers || {}) },
  });
  try {
    return { response, data: JSON.parse(text) };
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
}

async function loginOperationsSession(appUrl, username, password) {
  const response = await fetch(`${appUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`operations login returned ${response.status}: ${text.slice(0, 300)}`);
  }
  const data = JSON.parse(text);
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return { cookie, role: data.role || null, scope: data.scope?.type || null };
}

async function collectEmailRuntimeState({ appUrl, username, password, width }) {
  const { cookie, role, scope } = await loginOperationsSession(appUrl, username, password);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height: 900 },
  });
  await context.addCookies([{
    name: cookie.name,
    value: cookie.value,
    url: appUrl,
  }]);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  try {
    const emailTarget = `${appUrl}/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi&smoke=${Date.now()}`;
    await page.goto(emailTarget, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.ops-app-shell', { timeout: 30000 });
    await page.waitForSelector('[data-top-filter-rail][data-current-module="communications"]', { timeout: 30000 });
    await page.waitForSelector('[data-top-filter-id="email"][aria-current="page"]', { timeout: 30000 });
    await page.waitForSelector('[data-email-operator-workspace]', { timeout: 30000 });
    await page.waitForTimeout(2500);

    const emailState = await page.evaluate(() => {
      const workspace = document.querySelector('[data-email-operator-workspace]');
      const text = workspace?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const sendButtons = Array.from(document.querySelectorAll('[data-email-send-gates] button')).map((button) => ({
        text: button.textContent.trim().replace(/\s+/g, ' '),
        disabled: button.disabled,
      }));
      return {
        current_module: document.querySelector('[data-top-filter-rail]')?.getAttribute('data-current-module') || '',
        active_filter: document.querySelector('[data-top-filter-id="email"]')?.getAttribute('aria-current') || '',
        has_workspace: Boolean(workspace),
        has_readiness_gates: Boolean(document.querySelector('[data-email-readiness-gates]')),
        has_draft_editor: Boolean(document.querySelector('[data-email-draft-editor]')),
        has_from: Boolean(document.querySelector('#commEmailFrom')),
        has_reply_to: Boolean(document.querySelector('#commEmailReplyTo')),
        has_template: Boolean(document.querySelector('#commEmailTemplate')),
        has_related_record: Boolean(document.querySelector('#commEmailRelatedRecord')),
        mentions_provider_account: /Provider account/i.test(text),
        mentions_sender_identity: /Sender identity/i.test(text),
        mentions_domain_readiness: /Domain readiness/i.test(text),
        mentions_send_confirmation: /SEND_RESEND_EMAIL/i.test(text),
        mentions_no_send: /No email is sent/i.test(text),
        forbidden_crm_terms: (text.match(/GoHighLevel|LeadConnector/gi) || []),
        enabled_send_buttons: sendButtons.filter((button) => !button.disabled),
        send_buttons: sendButtons,
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
      };
    });

    assert(emailState.current_module === 'communications', `runtime current module was ${emailState.current_module || 'blank'}`);
    assert(emailState.active_filter === 'page', 'Email filter was not active');
    assert(emailState.has_workspace && emailState.has_readiness_gates && emailState.has_draft_editor, 'Email workspace/editor did not render');
    assert(emailState.has_from && emailState.has_reply_to && emailState.has_template && emailState.has_related_record, 'Email draft editor missing scoped fields');
    assert(emailState.mentions_provider_account && emailState.mentions_sender_identity && emailState.mentions_domain_readiness, 'Email readiness gates did not separate provider/sender/domain state');
    assert(emailState.mentions_send_confirmation && emailState.mentions_no_send, 'Email workspace did not show send confirmation/no-send guardrails');
    assert(emailState.forbidden_crm_terms.length === 0, `Email workspace included forbidden external CRM terms: ${emailState.forbidden_crm_terms.join(', ')}`);
    assert(emailState.enabled_send_buttons.length === 0, `Email workspace exposed enabled send buttons: ${emailState.enabled_send_buttons.map((button) => button.text).join(', ')}`);
    assert(!emailState.page_overflow, `Email page overflowed at ${width}px: ${emailState.scroll_width} > ${emailState.client_width}`);

    const settingsTarget = `${appUrl}/operations?workspace=rabbi_sheller_provider&view=communications&section=settings&smoke=${Date.now()}`;
    await page.goto(settingsTarget, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('[data-communications-integrations]', { timeout: 30000 });
    await page.waitForTimeout(2500);
    const settingsState = await page.evaluate(() => {
      const panel = document.querySelector('[data-communications-integrations]');
      const text = panel?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const emailButtons = Array.from(panel?.querySelectorAll('button') || [])
        .filter((button) => /SEND_RESEND_EMAIL|Send locked|Send/i.test(button.textContent || ''))
        .map((button) => ({
          text: button.textContent.trim().replace(/\s+/g, ' '),
          disabled: button.disabled,
        }));
      return {
        has_panel: Boolean(panel),
        has_webhook_events: Boolean(document.querySelector('[data-resend-webhook-events]')),
        mentions_provider_connection: /Provider connection/i.test(text),
        mentions_sender_identity: /Sender identity/i.test(text),
        mentions_domain: /Domain/i.test(text),
        mentions_raw_hidden: /Raw provider payloads are hidden by default/i.test(text),
        enabled_email_send_buttons: emailButtons.filter((button) => !button.disabled && !/locked/i.test(button.text)),
        email_buttons: emailButtons,
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
      };
    });

    assert(settingsState.has_panel, 'Communications integrations panel did not render');
    assert(settingsState.has_webhook_events && settingsState.mentions_raw_hidden, 'Settings Resend webhook event readback/raw-hidden copy did not render');
    assert(settingsState.mentions_provider_connection && settingsState.mentions_sender_identity && settingsState.mentions_domain, 'Settings Resend card did not separate provider/sender/domain readiness');
    assert(settingsState.enabled_email_send_buttons.length === 0, `Settings exposed enabled email send buttons: ${settingsState.enabled_email_send_buttons.map((button) => button.text).join(', ')}`);
    assert(!settingsState.page_overflow, `Settings page overflowed at ${width}px: ${settingsState.scroll_width} > ${settingsState.client_width}`);

    return {
      width,
      role,
      scope,
      email: emailState,
      settings: settingsState,
      console_errors: consoleErrors,
    };
  } finally {
    await browser.close();
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-email-resend-ux-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-email-resend-ux-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Email/Resend UX Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- resend_health_checked: ${report.summary.resend_health_checked}`,
    `- resend_domain_endpoint_readable: ${report.summary.resend_domain_endpoint_readable}`,
    `- resend_events_endpoint_readable: ${report.summary.resend_events_endpoint_readable}`,
    `- provider_sender_domain_separated: ${report.summary.provider_sender_domain_separated}`,
    `- external_send_performed: ${report.summary.external_send_performed}`,
    `- runtime_widths_checked: ${report.summary.runtime_widths_checked.join(', ') || 'none'}`,
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = {
    ...loadEnvFile('C:\\Users\\User\\BNA v2.0\\.env.local'),
    ...loadEnvFile(path.join(root, '.env.local')),
    ...process.env,
  };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required');
  const authedHeaders = { Authorization: basicAuthHeader(username, password) };
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      resend_health_checked: false,
      resend_domain_endpoint_readable: false,
      resend_events_endpoint_readable: false,
      provider_sender_domain_separated: false,
      external_send_performed: false,
      runtime_widths_checked: [],
    },
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  try {
    await step('health endpoint reachable', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.ok || data.status || data.uptime !== undefined, 'health response did not look healthy');
      return { ok: true };
    });

    const health = await step('Resend health separates provider, sender, and domain readiness', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/integrations/resend/health`, { headers: authedHeaders });
      assert(data.provider === 'resend', 'Resend health provider mismatch');
      assert(typeof data.configured === 'boolean', 'Resend health missing configured boolean');
      assert(typeof data.connected === 'boolean', 'Resend health missing connected boolean');
      assert(typeof data.sender_configured === 'boolean', 'Resend health missing sender_configured boolean');
      assert(typeof data.domain_configured === 'boolean', 'Resend health missing domain_configured boolean');
      assert(typeof data.domain_verified === 'boolean', 'Resend health missing domain_verified boolean');
      assert(typeof data.send_allowed === 'boolean', 'Resend health missing send_allowed boolean');
      assert(data.send_blocked === !data.send_allowed, 'send_blocked does not mirror send_allowed');
      assertNoSecretText(data, 'Resend health');
      report.summary.resend_health_checked = true;
      report.summary.provider_sender_domain_separated = true;
      return {
        configured: data.configured,
        connected: data.connected,
        sender_configured: data.sender_configured,
        domain_configured: data.domain_configured,
        domain_verified: data.domain_verified,
        send_allowed: data.send_allowed,
        domain: data.domain || null,
      };
    });

    await step('Resend domain endpoint is readable or safely blocked', async () => {
      const { response, data } = await requestJson(`${appUrl}/api/bna/integrations/resend/domains`, {
        headers: authedHeaders,
        acceptStatuses: [200, 401, 403, 503],
      });
      assert(![401, 403].includes(response.status), `Resend domain endpoint auth failed with ${response.status}`);
      assert(data.provider === 'resend', 'Resend domain endpoint provider mismatch');
      if (response.status === 200) {
        assert(Array.isArray(data.domains), 'Resend domains response did not include domains array');
      } else {
        assert(data.blocker || data.error, 'Resend domains safe-block response lacked blocker/error');
      }
      assertNoSecretText(data, 'Resend domains');
      report.summary.resend_domain_endpoint_readable = true;
      return { status: response.status, domains_count: Array.isArray(data.domains) ? data.domains.length : null };
    });

    await step('Resend webhook events endpoint hides raw payload by default', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/integrations/resend/events`, { headers: authedHeaders });
      assert(data.provider === 'resend', 'Resend events endpoint provider mismatch');
      assert(data.raw_payload_hidden === true, 'Resend events endpoint did not hide raw payloads by default');
      assert(Array.isArray(data.events), 'Resend events endpoint did not return an events array');
      assert(data.events.every((event) => event.payload === null || event.payload === undefined), 'Resend events included raw payload without explicit include flag');
      assertNoSecretText(data, 'Resend events');
      report.summary.resend_events_endpoint_readable = true;
      return { events_count: data.events.length, raw_payload_hidden: data.raw_payload_hidden };
    });

    if (health.domain) {
      await step('Configured Resend domain status endpoint is readable or safely blocked', async () => {
        const { response, data } = await requestJson(`${appUrl}/api/bna/integrations/resend/domains/${encodeURIComponent(health.domain)}/status`, {
          headers: authedHeaders,
          acceptStatuses: [200, 404, 503],
        });
        assert(data.provider === 'resend', 'Resend domain status provider mismatch');
        assertNoSecretText(data, 'Resend domain status');
        return { status: response.status, domain: health.domain, domains_count: data.domains_count ?? null };
      });
    }

    for (const width of [1024, 390]) {
      await step(`Operations Email UX runtime at ${width}px`, async () => {
        const state = await collectEmailRuntimeState({ appUrl, username, password, width });
        report.summary.runtime_widths_checked.push(width);
        assertNoSecretText(state, `Email runtime ${width}px`);
        return state;
      });
    }
  } finally {
    const paths = writeReports(report);
    report.report_paths = paths;
    const failed = report.steps.filter((item) => !item.ok);
    console.log(`Report: ${paths.markdown}`);
    if (failed.length) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
