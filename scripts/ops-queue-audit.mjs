#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildQueueAudit,
  compactConsoleRows,
  requeueCandidates,
  writeQueueAuditFiles,
} from './lib/ops-queue-reconciler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function parseArgs(argv = []) {
  const args = {
    json: false,
    write: true,
    noLive: false,
    staleMinutes: null,
    requeueCandidates: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--write') args.write = true;
    else if (arg === '--no-write') args.write = false;
    else if (arg === '--no-live') args.noLive = true;
    else if (arg === '--requeue-candidates') args.requeueCandidates = true;
    else if (arg === '--stale-minutes') args.staleMinutes = Number(argv[++index] || 0);
    else if (arg.startsWith('--stale-minutes=')) args.staleMinutes = Number(arg.split('=').slice(1).join('=') || 0);
  }
  return args;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 18000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function loadLiveTasksFromApi(env = {}) {
  const appUrl = env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || '';
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!appUrl || !username || !password) {
    return { tasks: [], warning: 'BNA_APP_URL/OPS_USERNAME/OPS_PASSWORD not available for API live-task read.' };
  }
  const response = await fetchWithTimeout(`${appUrl.replace(/\/+$/, '')}/api/bna/tasks?limit=1000`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Live API task read failed ${response.status}: ${text.slice(0, 500)}`);
  const data = text ? JSON.parse(text) : {};
  return { tasks: Array.isArray(data.tasks) ? data.tasks : [], warning: '' };
}

async function loadLiveTasksFromDb(env = {}) {
  if (!env.DATABASE_URL) return { tasks: [], warning: 'DATABASE_URL not available for DB live-task read.' };
  const pg = await import('pg');
  const Pool = pg.Pool || pg.default?.Pool;
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1/i.test(env.DATABASE_URL) ? false : { rejectUnauthorized: false },
  });
  try {
    const result = await pool.query(
      `SELECT t.*, p.project_key, p.name AS project_name, p.short_name AS project_short_name
       FROM bna_tasks t
       LEFT JOIN bna_projects p ON p.id = t.project_id
       ORDER BY t.updated_at DESC, t.created_at DESC
       LIMIT 1000`
    );
    return { tasks: result.rows || [], warning: '' };
  } finally {
    await pool.end().catch(() => {});
  }
}

async function loadLiveTasks(env = {}, args = {}) {
  if (args.noLive) return { tasks: [], warnings: ['Live task read skipped with --no-live.'] };
  const warnings = [];
  try {
    const api = await loadLiveTasksFromApi(env);
    if (api.tasks.length) return { tasks: api.tasks, warnings };
    if (api.warning) warnings.push(api.warning);
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : String(error));
  }
  try {
    const db = await loadLiveTasksFromDb(env);
    if (db.tasks.length) return { tasks: db.tasks, warnings };
    if (db.warning) warnings.push(db.warning);
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : String(error));
  }
  return { tasks: [], warnings };
}

function printSummary(summary, { json = false, candidates = false } = {}) {
  if (json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  console.log('Operations queue audit');
  console.log(`Generated: ${summary.generated_at}`);
  console.log(`Stale threshold: ${summary.stale_threshold_minutes} minutes`);
  console.log('');
  console.table(summary.counts);
  console.log('');
  console.table(compactConsoleRows(summary, 30));
  if (summary.warnings?.length) {
    console.log('');
    console.log('Warnings:');
    for (const warning of summary.warnings) console.log(`- ${warning}`);
  }
  if (candidates) {
    console.log('');
    console.log('Safe requeue candidates:');
    const rows = requeueCandidates(summary).map((item) => ({
      item: item.task_id ? `#${item.task_id}` : item.id,
      status: item.current_status,
      reason: item.next_action,
    }));
    console.table(rows);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, '.env')),
    ...process.env,
  };
  const live = await loadLiveTasks(env, args);
  const summary = buildQueueAudit({
    repoRoot,
    liveTasks: live.tasks,
    staleThresholdMinutes: Number(args.staleMinutes || env.OPS_QUEUE_HEARTBEAT_STALE_MINUTES || 15),
  });
  summary.warnings = [...(summary.warnings || []), ...live.warnings].filter(Boolean);
  if (args.write) {
    const paths = writeQueueAuditFiles(summary, { repoRoot });
    summary.output = {
      json: path.relative(repoRoot, paths.jsonPath).replace(/\\/g, '/'),
      markdown: path.relative(repoRoot, paths.mdPath).replace(/\\/g, '/'),
      latest: path.relative(repoRoot, paths.latestPath).replace(/\\/g, '/'),
    };
  }
  printSummary(summary, { json: args.json, candidates: args.requeueCandidates });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
