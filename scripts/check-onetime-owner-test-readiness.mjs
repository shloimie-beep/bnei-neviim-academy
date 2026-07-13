#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildOneTimeWapiReadiness } from './check-onetime-wapi-readiness.mjs';
import { runRailwayVariablesReadback } from './check-onetime-external-setup-readiness.mjs';

const require = createRequire(import.meta.url);
const {
  getResendConfig,
  getResendReadiness,
} = require('../src/lib/integrations/resend-client');
const {
  buildOneTimeOwnerTestReadiness,
  renderOneTimeOwnerTestReadinessMarkdown,
} = require('../src/lib/bna/one-time-owner-test-readiness');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

function parseArgs(argv = []) {
  const args = {
    json: false,
    writeReport: false,
    inspectRailway: true,
    inspectKeyholder: true,
    reportDir: path.join('ops', 'watchdog-audits'),
    confirm: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--write-report') args.writeReport = true;
    else if (arg === '--no-railway') args.inspectRailway = false;
    else if (arg === '--no-keyholder') args.inspectKeyholder = false;
    else if (arg === '--report-dir') {
      args.reportDir = argv[index + 1] || args.reportDir;
      index += 1;
    } else if (arg.startsWith('--confirm=')) {
      args.confirm = arg.slice('--confirm='.length);
    } else if (arg === '--confirm') {
      args.confirm = argv[index + 1] || '';
      index += 1;
    }
  }
  return args;
}

function parseEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) env[key] = value;
  }
  return env;
}

function loadRuntimeEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
}

function safeError(error) {
  return {
    message: String(error?.message || error || 'unknown').slice(0, 240),
    status: error?.status || error?.statusCode || null,
    code: error?.code || null,
    blocker: String(error?.blocker || '').slice(0, 240) || null,
  };
}

function writeReport(report, args) {
  if (!args.writeReport) return null;
  const stamp = report.checked_at.replace(/[:.]/g, '-');
  const outDir = path.resolve(repoRoot, args.reportDir);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${stamp}-onetime-owner-test-readiness.json`);
  const mdPath = path.join(outDir, `${stamp}-onetime-owner-test-readiness.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${renderOneTimeOwnerTestReadinessMarkdown(report)}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    md: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

export async function runOwnerTestReadiness(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const env = options.env || loadRuntimeEnv();
  let railwayVariables = null;
  if (args.inspectRailway) {
    railwayVariables = runRailwayVariablesReadback({
      repoRoot,
      env,
      ...(options.railwayRunner ? { runner: options.railwayRunner } : {}),
    });
  }

  let resendReadiness = {};
  let resendError = null;
  try {
    const resendConfig = getResendConfig({ repoRoot, profile: 'rabbi' });
    resendReadiness = await getResendReadiness({ config: resendConfig, fetchImpl: options.fetchImpl || fetch });
  } catch (error) {
    resendError = safeError(error);
  }

  let wapiReadiness = {};
  let wapiError = null;
  try {
    wapiReadiness = buildOneTimeWapiReadiness({
      repoRoot,
      env,
      inspectKeyholder: args.inspectKeyholder,
      inspectRailway: false,
      railwayVariables,
    });
  } catch (error) {
    wapiError = safeError(error);
  }

  const report = buildOneTimeOwnerTestReadiness({
    env,
    repoRoot,
    resendReadiness,
    resendError,
    wapiReadiness,
    wapiError,
    railwayVariables,
    inspectKeyholder: args.inspectKeyholder,
    confirm: args.confirm,
  });
  const reportPaths = writeReport(report, args);
  const payload = { ...report, report_paths: reportPaths };
  if (args.json) console.log(JSON.stringify(payload, null, 2));
  else console.log(renderOneTimeOwnerTestReadinessMarkdown(payload));
  if (!report.readiness.email_preflight_ready || !report.readiness.whatsapp_preflight_ready) process.exitCode = 1;
  return payload;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  runOwnerTestReadiness().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 2;
  });
}
