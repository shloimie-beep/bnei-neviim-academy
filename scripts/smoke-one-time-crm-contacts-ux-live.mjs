#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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

async function requestJson(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  try {
    return { response, data: text ? JSON.parse(text) : {} };
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
}

async function requestText(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html, text/plain, */*',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  return { response, text };
}

async function loginOperationsSession(appUrl, username, password) {
  const { response, data } = await requestJson(`${appUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
    },
    body: JSON.stringify({ username, password }),
  });
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return cookie;
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-crm-contacts-ux-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-crm-contacts-ux-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time CRM Contacts UX Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Scoped Counts',
    `- Parent leads returned: ${report.parent_leads_count ?? 'n/a'}`,
    `- Leads with returned project_key: ${report.parent_leads_with_project_key ?? 'n/a'}`,
    `- Contact communications returned: ${report.contact_communications_count ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke records scoped counts and UI markers only; it does not write contacts, send email, send WhatsApp, trigger payment, or call an external CRM.',
    '- Parent lead rows are requested with project_key=one_time_mishnah_class and workspace=rabbi_sheller_provider.',
    '- The report intentionally avoids raw contact bodies and raw private notes.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(root, '.env.local')),
    ...loadEnvFile(path.join(root, '.env')),
    ...process.env,
  };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required for live smoke');

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
  };
  const step = async (name, fn) => {
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, detail: typeof detail === 'string' ? detail : '' });
      return detail;
    } catch (error) {
      report.steps.push({ name, ok: false, detail: error.message });
      throw error;
    }
  };

  let cookie;
  await step('Operations login', async () => {
    cookie = await loginOperationsSession(appUrl, username, password);
    return `cookie ${cookie.name}`;
  });

  const authHeaders = {
    authorization: basicAuthHeader(username, password),
    cookie: `${cookie.name}=${cookie.value}`,
  };
  const oneTimeParams = 'project_key=one_time_mishnah_class&workspace=rabbi_sheller_provider';

  await step('Scoped One Time parent leads API responds', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/parent-leads?${oneTimeParams}`, {
      headers: authHeaders,
    });
    assert(Array.isArray(data.leads), 'parent leads response did not include leads array');
    const rowsWithProject = data.leads.filter((lead) => lead.project_key);
    const wrongProject = rowsWithProject.find((lead) => lead.project_key !== 'one_time_mishnah_class');
    assert(!wrongProject, `parent leads response leaked project ${wrongProject?.project_key}`);
    report.parent_leads_count = data.leads.length;
    report.parent_leads_with_project_key = rowsWithProject.length;
    return `${data.leads.length} scoped leads`;
  });

  await step('Scoped One Time contact communications API responds', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/contact-communications?${oneTimeParams}`, {
      headers: authHeaders,
    });
    assert(Array.isArray(data.communications), 'contact communications response did not include communications array');
    report.contact_communications_count = data.communications.length;
    return `${data.communications.length} scoped communications`;
  });

  await step('Operations ships CRM Contacts UX markers', async () => {
    const { text } = await requestText(`${appUrl}/operations`, {
      headers: authHeaders,
    });
    assert(text.includes('data-one-time-crm-contacts-ux'), 'Operations HTML missing One Time CRM Contacts UX marker');
    assert(text.includes('REQ-20260621-905'), 'Operations HTML missing CRM Contacts requirement id');
    assert(text.includes('One Time CRM Contacts'), 'Operations HTML missing CRM Contacts heading');
    assert(text.includes('No email, WhatsApp, payment, or external CRM write'), 'Operations HTML missing no-send guardrail copy');
    assert(text.includes('Private BNA goals, check-ins, admin notes, and school-only student data are not shown in One Time Contacts'), 'Operations HTML missing BNA privacy guardrail copy');
    assert(text.includes('Dedupe / review'), 'Operations HTML missing dedupe/review state');
    assert(text.includes('getParentLeads(workspaceDataFilters)'), 'Operations HTML missing scoped parent-lead fetch');
    return 'CRM Contacts panel and scope markers shipped';
  });

  const paths = writeReports(report);
  console.log(JSON.stringify({
    ok: true,
    report: path.relative(root, paths.mdPath).replace(/\\/g, '/'),
    parent_leads_count: report.parent_leads_count,
    contact_communications_count: report.contact_communications_count,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
