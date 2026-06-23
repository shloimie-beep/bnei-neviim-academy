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
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-contact-history-helper-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-contact-history-helper-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Contact History Helper Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const detail = step.error ? ` - ${step.error}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${detail}`;
    }),
    '',
    '## Action Summary',
    `- action_id: ${report.action_summary?.action_id || 'n/a'}`,
    `- dry_run: ${report.action_summary?.dry_run}`,
    `- executed: ${report.action_summary?.executed}`,
    `- total_matches: ${report.action_summary?.total_matches}`,
    `- blockers: ${(report.action_summary?.blockers || []).join('; ') || 'none'}`,
    `- no_send: ${report.action_summary?.no_send}`,
    `- external_write_performed: ${report.action_summary?.external_write_performed}`,
    `- local_write_performed: ${report.action_summary?.local_write_performed}`,
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data };
}

async function main() {
  const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required');

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    action_summary: null,
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.steps.push({
        name,
        ok: false,
        duration_ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  try {
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      assert(data.database === 'connected', 'Database is not connected');
      return { status: data.status, database: data.database };
    });

    await step('contact history helper dry-run', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/actions/run`, {
        method: 'POST',
        headers: {
          Authorization: basicAuthHeader(username, password),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_id: 'show_contact_communication_history',
          workspace_key: 'bna',
          source: 'contact_history_helper_live_smoke',
          dry_run: true,
          inputs: {
            phone: '+15550000000',
            email: 'codex-contact-history-smoke@example.invalid',
            limit: 3,
          },
        }),
      });
      assert(data.success === true, 'Action response did not return success');
      assert(data.dry_run === true, 'Action did not stay in dry-run mode');
      assert(data.executed === false, 'Action should not execute in this smoke');
      const preview = data.preview || {};
      assert(preview.contact_history_preview_created === true, 'Preview marker is missing');
      assert(preview.no_send === true, 'no_send guardrail is missing');
      assert(preview.external_write_performed === false, 'External write guardrail failed');
      assert(preview.whatsapp_send_performed === false, 'WhatsApp send guardrail failed');
      assert(preview.broadcast_created === false, 'Broadcast guardrail failed');
      assert(preview.contact_tag_write_performed === false, 'Contact tag write guardrail failed');
      assert(preview.google_drive_write_performed === false, 'Google Drive write guardrail failed');
      assert(preview.buffer_social_write_performed === false, 'Buffer write guardrail failed');
      assert(preview.local_write_performed === false, 'Contact history helper should not write contact records');
      report.action_summary = {
        action_id: preview.action_id || data.action?.action_id || 'show_contact_communication_history',
        dry_run: data.dry_run,
        executed: data.executed,
        total_matches: preview.summary?.total_matches ?? null,
        blockers: Array.isArray(preview.blockers) ? preview.blockers : [],
        no_send: preview.no_send,
        external_write_performed: preview.external_write_performed,
        local_write_performed: preview.local_write_performed,
      };
      return report.action_summary;
    });
  } finally {
    report.finished_at = new Date().toISOString();
    report.success = report.steps.every((item) => item.ok);
    report.report_files = writeReports(report);
    console.log(`Report: ${report.report_files.markdown}`);
  }

  if (!report.success) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
