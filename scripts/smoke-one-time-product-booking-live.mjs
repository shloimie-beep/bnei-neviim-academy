#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

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

function scrub(value) {
  return JSON.parse(JSON.stringify(value || {}, (key, item) => {
    if (/password|token|secret|key|cookie|authorization/i.test(key)) return '[redacted]';
    return item;
  }));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text: text.slice(0, 400) };
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data };
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
  if (!response.ok) throw new Error(`operations login returned ${response.status}: ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return { cookie, role: data.role || null, scope: data.scope || null };
}

function futureIso(daysAhead = 2) {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  date.setUTCHours(17, 0, 0, 0);
  return date.toISOString();
}

async function collectApiState({ appUrl, cookie, startedAt }) {
  const headers = { Cookie: `${cookie.name}=${cookie.value}` };
  const initial = (await requestJson(`${appUrl}/api/bna/one-time/product-system`, { headers })).data;
  const offers = Array.isArray(initial.product_offers) ? initial.product_offers : [];
  const monthly = offers.find((offer) => offer.offer_key === 'membership_67_monthly');
  const intensive = offers.find((offer) => offer.offer_key === 'premium_masechta_intensive');
  assert(monthly?.price_amount_cents === 6700, 'monthly offer was not present at 6700 cents');
  assert(monthly.checkout_enabled === false && monthly.payment_links_enabled === false, 'monthly offer exposed checkout/payment links');
  assert(intensive?.billing_model === 'fixed_duration', 'premium Masechta intensive offer was not fixed-duration');
  assert(initial.availability?.external_write_performed === false, 'availability indicated an external write');
  assert((initial.availability?.rules || []).some((rule) => rule.rule_key === 'israel_7pm_recurring'), '7pm Israel availability rule was missing');
  assert((initial.appointment_types || []).length >= 5, 'appointment type templates were missing');
  assert(initial.portal_foundations?.student?.join_class_enabled === false, 'student Join Class was not gated');

  const classPayload = {
    title: `Codex Batch 9/10 Smoke Class ${startedAt}`,
    start_at: futureIso(2),
    duration_minutes: 60,
    masechta: 'Smoke',
    perek: '1',
    mishnah_range: '1:1',
    visibility: 'admin_only',
    event_status: 'draft',
    notes: 'Created by safe Batch 9/10 live smoke. No Zoom or external calendar write.',
  };
  const createdClass = (await requestJson(`${appUrl}/api/bna/one-time/calendar-events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(classPayload),
  })).data;
  assert(createdClass.success === true, 'calendar event create did not succeed');
  assert(createdClass.no_zoom_meeting_created === true, 'calendar event create did not confirm no Zoom');
  assert(createdClass.external_calendar_write_performed === false, 'calendar event create performed or reported an external calendar write');
  assert(createdClass.calendar_event?.title === classPayload.title, 'calendar event title did not round trip');

  const appointmentPayload = {
    appointment_type: 'consultation',
    starts_at: futureIso(3),
    parent_name: 'Codex Smoke Parent',
    parent_email: 'codex-smoke@example.invalid',
    student_name: 'Codex Smoke Student',
    duration_minutes: 30,
    buffer_minutes: 10,
    private_notes: 'Safe Batch 9/10 live smoke appointment intent.',
    parent_visible_summary: 'Smoke consultation intent only.',
    status: 'intent',
  };
  const createdAppointment = (await requestJson(`${appUrl}/api/bna/one-time/appointment-intents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(appointmentPayload),
  })).data;
  assert(createdAppointment.success === true, 'appointment intent create did not succeed');
  assert(createdAppointment.no_zoom_meeting_created === true, 'appointment intent did not confirm no Zoom');
  assert(createdAppointment.external_calendar_write_performed === false, 'appointment intent performed or reported an external calendar write');
  assert(createdAppointment.appointment_intent?.parent_email === appointmentPayload.parent_email, 'appointment intent email did not round trip');

  const finalState = (await requestJson(`${appUrl}/api/bna/one-time/product-system`, { headers })).data;
  assert((finalState.appointment_intents || []).some((intent) => intent.parent_email === appointmentPayload.parent_email), 'created appointment intent was not visible in product-system payload');
  assert((finalState.calendar?.events || []).some((event) => event.title === classPayload.title), 'created class event was not visible in product-system payload');

  return {
    initial: {
      offer_count: offers.length,
      availability_rule_count: initial.availability?.rules?.length || 0,
      appointment_type_count: initial.appointment_types?.length || 0,
      student_join_enabled: initial.portal_foundations?.student?.join_class_enabled,
    },
    created_class_id: createdClass.calendar_event?.id || null,
    created_appointment_id: createdAppointment.appointment_intent?.id || null,
    final: {
      calendar_events: finalState.calendar?.events?.length || 0,
      appointment_intents: finalState.appointment_intents?.length || 0,
      portal_parent_sections: finalState.portal_foundations?.parent?.sections?.length || 0,
      portal_student_sections: finalState.portal_foundations?.student?.sections?.length || 0,
      portal_provider_sections: finalState.portal_foundations?.provider?.sections?.length || 0,
    },
  };
}

async function collectUiState({ appUrl, cookie, width }) {
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
    const target = `${appUrl}/operations?workspace=rabbi_sheller_provider&view=service_providers&section=schedule&smoke=${Date.now()}`;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.ops-app-shell', { timeout: 30000 });
    await page.waitForSelector('[data-one-time-availability-booking]', { timeout: 30000 });
    await page.waitForSelector('#oneTimeClassTitle', { timeout: 30000 });
    await page.waitForSelector('#oneTimeAppointmentType', { timeout: 30000 });
    await page.waitForTimeout(2000);
    const state = await page.evaluate(() => {
      const text = document.body.textContent.replace(/\s+/g, ' ').trim();
      const enabledSendOrZoomButtons = Array.from(document.querySelectorAll('button'))
        .filter((button) => !button.disabled)
        .map((button) => button.textContent.trim().replace(/\s+/g, ' '))
        .filter((label) => /send|zoom|charge|invoice|payment link/i.test(label));
      return {
        has_schedule_form: Boolean(document.querySelector('#oneTimeClassTitle')),
        has_appointment_form: Boolean(document.querySelector('#oneTimeAppointmentType')),
        has_availability_panel: Boolean(document.querySelector('[data-one-time-availability-booking]')),
        mentions_internal_class: /Add Class saves an internal OneTime calendar event only/i.test(text),
        mentions_no_zoom: /does not create a Zoom meeting/i.test(text),
        mentions_no_external_calendar: /external calendar/i.test(text),
        enabled_send_or_zoom_buttons: enabledSendOrZoomButtons,
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
      };
    });
    assert(state.has_schedule_form && state.has_appointment_form && state.has_availability_panel, 'Batch 9/10 Operations controls did not render');
    assert(state.mentions_internal_class && state.mentions_no_zoom && state.mentions_no_external_calendar, 'Batch 9/10 guardrail copy did not render');
    assert(state.enabled_send_or_zoom_buttons.length === 0, `Unexpected enabled send/Zoom/payment buttons: ${state.enabled_send_or_zoom_buttons.join(', ')}`);
    assert(!state.page_overflow, `Operations schedule overflowed at ${width}px: ${state.scroll_width} > ${state.client_width}`);
    return { width, state, console_errors: consoleErrors };
  } finally {
    await browser.close();
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-product-booking-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-product-booking-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(scrub(report), null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Product Booking Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- product_offers_readable: ${report.summary.product_offers_readable}`,
    `- availability_readable: ${report.summary.availability_readable}`,
    `- portal_foundations_readable: ${report.summary.portal_foundations_readable}`,
    `- internal_class_event_created: ${report.summary.internal_class_event_created}`,
    `- internal_appointment_intent_created: ${report.summary.internal_appointment_intent_created}`,
    `- external_write_performed: ${report.summary.external_write_performed}`,
    `- zoom_meeting_created: ${report.summary.zoom_meeting_created}`,
    `- runtime_widths_checked: ${report.summary.runtime_widths_checked.join(', ')}`,
    '',
    'Only internal One Time class-event and appointment-intent records were created. No payment, invoice, email, WhatsApp, Zoom meeting, access grant, participant invite, upload, or external calendar write was performed.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function runStep(report, name, fn) {
  const started = Date.now();
  try {
    const data = await fn();
    report.steps.push({ name, ok: true, duration_ms: Date.now() - started, data: scrub(data) });
    return data;
  } catch (error) {
    report.steps.push({
      name,
      ok: false,
      duration_ms: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  const appUrl = String(env.OPS_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required for live smoke');

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      product_offers_readable: false,
      availability_readable: false,
      portal_foundations_readable: false,
      internal_class_event_created: false,
      internal_appointment_intent_created: false,
      external_write_performed: false,
      zoom_meeting_created: false,
      runtime_widths_checked: [],
    },
  };

  try {
    const login = await runStep(report, 'operations login', () => loginOperationsSession(appUrl, username, password));
    const apiState = await runStep(report, 'product-system api and internal records', () => collectApiState({
      appUrl,
      cookie: login.cookie,
      startedAt: report.started_at,
    }));
    report.summary.product_offers_readable = apiState.initial.offer_count >= 2;
    report.summary.availability_readable = apiState.initial.availability_rule_count >= 1;
    report.summary.portal_foundations_readable = apiState.final.portal_parent_sections > 0 && apiState.final.portal_student_sections > 0 && apiState.final.portal_provider_sections > 0;
    report.summary.internal_class_event_created = Boolean(apiState.created_class_id);
    report.summary.internal_appointment_intent_created = Boolean(apiState.created_appointment_id);

    for (const width of [1440, 390]) {
      await runStep(report, `operations schedule ui ${width}px`, () => collectUiState({ appUrl, cookie: login.cookie, width }));
      report.summary.runtime_widths_checked.push(width);
    }
  } finally {
    const paths = writeReports(report);
    console.log(JSON.stringify({ ok: report.steps.every((step) => step.ok), report: paths }, null, 2));
    if (report.steps.some((step) => !step.ok)) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
