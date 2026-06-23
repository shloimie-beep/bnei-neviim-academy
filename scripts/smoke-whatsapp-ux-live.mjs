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

async function requestText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

async function requestJson(url, options = {}) {
  const { text } = await requestText(url, {
    ...options,
    headers: { accept: 'application/json', ...(options.headers || {}) },
  });
  try {
    return { data: JSON.parse(text) };
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
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return { cookie, role: data.role || null, scope: data.scope?.type || null };
}

function expectIncludes(text, terms, label) {
  const missing = terms.filter((term) => !text.includes(term));
  assert(!missing.length, `${label} missing markers: ${missing.join(', ')}`);
}

async function collectOperationsRuntimeState({ appUrl, username, password, width }) {
  const { cookie, role, scope } = await loginOperationsSession(appUrl, username, password);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    extraHTTPHeaders: { Cookie: `${cookie.name}=${cookie.value}` },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  try {
    const target = `${appUrl}/operations?workspace=rabbi_sheller_provider&view=communications&section=whatsapp&smoke=${Date.now()}`;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.ops-app-shell', { timeout: 30000 });
    await page.waitForSelector('[data-top-filter-rail][data-current-module="communications"]', { timeout: 30000 });
    await page.waitForSelector('[data-top-filter-id="whatsapp"][aria-current="page"]', { timeout: 30000 });
    await page.waitForTimeout(5000);

    const state = await page.evaluate(() => {
      const workspace = document.querySelector('[data-wapi-three-pane-workspace]');
      const phonebookPane = document.querySelector('#wapiPhonebookPane');
      const mobileStepper = document.querySelector('[data-wapi-mobile-back-navigation]');
      const confirmationGate = document.querySelector('[data-whatsapp-send-confirmation-gate]');
      const workspaceText = workspace?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const phonebookText = phonebookPane?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const sendButtons = Array.from(document.querySelectorAll('[data-whatsapp-no-send-actions] button, [data-whatsapp-send-readiness] button, [data-whatsapp-send-confirmation-gate] button')).map((button) => ({
        text: button.textContent.trim().replace(/\s+/g, ' '),
        disabled: button.disabled,
      }));
      return {
        current_module: document.querySelector('[data-top-filter-rail]')?.getAttribute('data-current-module') || '',
        active_filter: document.querySelector('[data-top-filter-id="whatsapp"]')?.getAttribute('aria-current') || '',
        has_workspace: Boolean(workspace),
        has_phonebook_pane: Boolean(phonebookPane),
        has_conversation_pane: Boolean(document.querySelector('#wapiConversationPane')),
        has_details_pane: Boolean(document.querySelector('#wapiDetailsPane')),
        has_mobile_back_navigation: Boolean(mobileStepper),
        mobile_back_navigation_visible: Boolean(mobileStepper) && getComputedStyle(mobileStepper).display !== 'none',
        has_sticky_action_area: Boolean(document.querySelector('[data-wapi-sticky-action-area]')),
        has_no_send_actions: Boolean(document.querySelector('[data-whatsapp-no-send-actions]')),
        has_send_readiness: Boolean(document.querySelector('[data-whatsapp-send-readiness]')),
        has_confirmation_gate: Boolean(confirmationGate),
        confirmation_gate_disabled: Array.from(confirmationGate?.querySelectorAll('button') || []).some((button) => button.disabled),
        has_phonebook_card: Boolean(phonebookPane?.querySelector('.contact-card')),
        has_phonebook_empty_state: /No WhatsApp phonebook records are available yet|Build the phonebook report/i.test(phonebookText),
        mentions_raw_hidden: /Raw provider payloads are hidden by default/i.test(workspaceText),
        mentions_no_send: /No WhatsApp message, broadcast, or external CRM write/i.test(workspaceText),
        forbidden_crm_terms: (workspaceText.match(/GoHighLevel|LeadConnector/gi) || []),
        active_panes: Array.from(document.querySelectorAll('.wapi-workspace-pane.mobile-active')).map((pane) => pane.id),
        pane_grid: workspace ? getComputedStyle(workspace).gridTemplateColumns : '',
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
        send_buttons: sendButtons,
      };
    });

    assert(state.current_module === 'communications', `runtime current module was ${state.current_module || 'blank'}`);
    assert(state.active_filter === 'page', 'WhatsApp filter was not active');
    assert(state.has_workspace, 'WhatsApp workspace did not render');
    assert(state.has_phonebook_pane && state.has_conversation_pane && state.has_details_pane, 'three-pane workspace panes did not render');
    assert(state.has_mobile_back_navigation, 'mobile back navigation marker did not render');
    assert(state.has_sticky_action_area, 'sticky action area did not render');
    assert(state.has_send_readiness, 'send readiness gate did not render');
    assert(state.has_confirmation_gate && state.confirmation_gate_disabled, 'confirmation gate did not render as disabled');
    assert(state.has_phonebook_card || state.has_phonebook_empty_state, 'phonebook pane has neither cards nor an empty state');
    assert(state.mentions_raw_hidden, 'runtime workspace did not mention hidden raw payloads');
    assert(state.mentions_no_send, 'runtime workspace did not mention no-send guardrails');
    assert(state.forbidden_crm_terms.length === 0, `runtime workspace included forbidden external CRM terms: ${state.forbidden_crm_terms.join(', ')}`);
    assert(!state.page_overflow, `page overflowed at ${width}px: ${state.scroll_width} > ${state.client_width}`);
    if (width < 600) {
      assert(state.mobile_back_navigation_visible, 'mobile back navigation was not visible on mobile');
      assert(state.active_panes.includes('wapiPhonebookPane'), 'mobile phonebook pane was not the active initial pane');
    }

    return {
      width,
      role,
      scope,
      ...state,
      console_errors: consoleErrors,
    };
  } finally {
    await browser.close();
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-whatsapp-ux-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-whatsapp-ux-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# WhatsApp UX Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
    `- phonebook_scope: ${report.summary.phonebook_scope || 'unknown'}`,
    `- raw_payload_hidden: ${report.summary.raw_payload_hidden}`,
    `- wapi_sync_configured: ${report.summary.wapi_sync_configured}`,
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
  const auth = basicAuthHeader(username, password);
  const authedHeaders = { Authorization: auth };
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      operations_markers_checked: 0,
      phonebook_scope: '',
    raw_payload_hidden: false,
    wapi_sync_configured: false,
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
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok' || data.ok !== false, 'Health endpoint did not return ok');
      return { status: data.status, database: data.database || null };
    });

    await step('Operations WhatsApp workspace markers are deployed', async () => {
      const { text } = await requestText(`${appUrl}/operations?view=communications&section=whatsapp&workspace=rabbi_sheller_provider&smoke=${Date.now()}`, {
        headers: authedHeaders,
      });
      const markers = [
        'data-wapi-three-pane-workspace',
        'id="wapiPhonebookPane"',
        'id="wapiConversationPane"',
        'id="wapiDetailsPane"',
        'data-wapi-mobile-back-navigation',
        'data-wapi-sticky-action-area',
        'data-whatsapp-no-send-actions',
        'data-whatsapp-send-readiness',
        'data-whatsapp-send-confirmation-gate',
        'Raw provider payloads are hidden by default',
        'No WhatsApp message, broadcast, or external CRM write',
      ];
      expectIncludes(text, markers, 'Operations WhatsApp workspace');
      report.summary.operations_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('workspace-scoped WAPI phonebook report hides raw payloads', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/wapi/phonebook-report?workspace=rabbi_sheller_provider&limit=20`, {
        headers: authedHeaders,
      });
      assert(data.success === true, 'phonebook report did not return success');
      assert(data.raw_payload_hidden === true, 'phonebook report did not hide raw payloads');
      assert(data.external_write_performed !== true, 'phonebook report performed an external write');
      report.summary.phonebook_scope = data.scope || '';
      report.summary.raw_payload_hidden = true;
      return {
        scope: data.scope || null,
        workspace_key: data.workspace_key || null,
        groups: Array.isArray(data.phonebook)
          ? data.phonebook.length
          : data.phonebook && typeof data.phonebook === 'object'
            ? Object.keys(data.phonebook).length
            : Array.isArray(data.groups)
              ? data.groups.length
              : 0,
      };
    });

    await step('WhatsApp message readback stays no-send and hides raw provider payloads', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/whatsapp/messages?workspace=rabbi_sheller_provider&limit=10`, {
        headers: authedHeaders,
      });
      assert(Array.isArray(data.messages), 'whatsapp messages response did not include a messages array');
      assert(data.raw_payload_hidden === true, 'whatsapp messages did not hide raw payloads');
      assert(data.external_send_performed !== true, 'whatsapp messages performed an external send');
      const messages = Array.isArray(data.messages) ? data.messages : [];
      assert(messages.every((message) => !Object.prototype.hasOwnProperty.call(message, 'raw_payload')), 'raw_payload leaked in message rows');
      report.summary.external_send_performed = Boolean(data.external_send_performed);
      return { messages: messages.length, raw_payload_hidden: data.raw_payload_hidden };
    });

    await step('WAPI diagnostics are read-only', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/wapi/diagnostics`, { headers: authedHeaders });
      assert(data.success === true, 'WAPI diagnostics did not return success');
      assert(Array.isArray(data.required_sync_env), 'required_sync_env missing');
      assert(data.external_write_performed !== true, 'diagnostics performed an external write');
      report.summary.wapi_sync_configured = Boolean(data.sync_configured);
      return {
        sync_configured: Boolean(data.sync_configured),
        required_sync_env: data.required_sync_env,
      };
    });

    await step('Operations WhatsApp runtime UX renders at desktop and mobile widths', async () => {
      const states = [];
      for (const width of [1024, 390]) {
        states.push(await collectOperationsRuntimeState({ appUrl, username, password, width }));
      }
      report.summary.runtime_widths_checked = states.map((state) => state.width);
      return {
        widths: states.map((state) => ({
          width: state.width,
          active_filter: state.active_filter,
          has_workspace: state.has_workspace,
          mobile_back_navigation_visible: state.mobile_back_navigation_visible,
          page_overflow: state.page_overflow,
          active_panes: state.active_panes,
          phonebook_has_card_or_empty_state: state.has_phonebook_card || state.has_phonebook_empty_state,
          console_errors: state.console_errors.length,
        })),
      };
    });
  } finally {
    const paths = writeReports(report);
    report.report_paths = paths;
    const failed = report.steps.filter((step) => !step.ok);
    console.log(JSON.stringify({ ok: failed.length === 0, report: paths.markdown }, null, 2));
    if (failed.length) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
