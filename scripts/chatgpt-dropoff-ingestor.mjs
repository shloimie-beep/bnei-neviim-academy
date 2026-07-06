#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dropoffRoot = path.join(repoRoot, 'ops', 'chatgpt-ramble-dropoff');
const incomingDir = path.join(dropoffRoot, 'incoming');
const reportsDir = path.join(dropoffRoot, 'pickups');
const runtimeDir = path.join(repoRoot, '.runtime', 'chatgpt-dropoff-ingestor');
const statePath = path.join(runtimeDir, 'state.json');
const envLocalPath = path.join(repoRoot, '.env.local');
const requiredPacketFiles = ['packet.json', 'RAW.md', 'CODEX_PROMPT.md', 'MANIFEST.json', 'status.json'];
const readyStatuses = new Set(['ready_for_codex_audit', 'ready_for_codex_pickup']);
const terminalStatuses = new Set(['done_verified', 'rejected', 'blocked_needs_operator_decision']);
const helperBotPacketIds = new Set([
  'helper-bot-workspace-agent-01-audit-map',
  'helper-bot-workspace-agent-02-query-filter-results',
  'helper-bot-workspace-agent-03-action-confirmation-tools',
  'helper-bot-workspace-agent-04-agent-console-ui',
  'helper-bot-workspace-agent-05-tests-dropoff',
  'helper-bot-workspace-agent-master',
]);
const secretPatterns = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/g,
  /\brailway_[A-Za-z0-9_-]{20,}\b/gi,
  /\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"]?[A-Za-z0-9_.\-]{24,}/gi,
];

function nowIso() {
  return new Date().toISOString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function readPacketJson(filePath, jsonErrors, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    jsonErrors.push({
      file: path.basename(filePath),
      message: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const at = line.indexOf('=');
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadConfig(env = process.env) {
  const merged = { ...parseEnvFile(envLocalPath), ...env };
  return {
    appUrl: merged.BNA_APP_URL || merged.NEXT_PUBLIC_APP_URL || 'http://localhost:8080',
    opsUsername: merged.OPS_USERNAME || '',
    opsPassword: merged.OPS_PASSWORD || '',
    defaultProject: merged.CHATGPT_DROPOFF_DEFAULT_PROJECT || 'one_time_mishnah_class',
    pollMs: Number(merged.CHATGPT_DROPOFF_POLL_MS || merged.AGENT_FLEET_POLL_MS || 60 * 1000),
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    apply: false,
    json: false,
    watch: false,
    dryRun: false,
    force: false,
    noLive: false,
    limit: 20,
    packet: '',
    pollMs: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--watch') args.watch = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--no-live') args.noLive = true;
    else if (arg === '--packet') args.packet = argv[++index] || '';
    else if (arg.startsWith('--packet=')) args.packet = arg.split('=').slice(1).join('=');
    else if (arg === '--limit') args.limit = Number(argv[++index] || 0);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=').slice(1).join('=') || 0);
    else if (arg === '--poll-ms') args.pollMs = Number(argv[++index] || 0);
    else if (arg.startsWith('--poll-ms=')) args.pollMs = Number(arg.split('=').slice(1).join('=') || 0);
  }
  if (args.dryRun) args.apply = false;
  return args;
}

function safePacketId(value, fallback = '') {
  return String(value || fallback || '')
    .trim()
    .replace(/[^A-Za-z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function listPacketDirs({ packet = '' } = {}) {
  if (!fs.existsSync(incomingDir)) return [];
  if (packet) {
    const direct = path.resolve(repoRoot, packet);
    const fromIncoming = path.join(incomingDir, packet);
    const target = fs.existsSync(direct) ? direct : fromIncoming;
    return fs.existsSync(target) && fs.statSync(target).isDirectory() ? [target] : [];
  }
  return fs.readdirSync(incomingDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(incomingDir, entry.name))
    .sort();
}

function readTextIfExists(filePath, maxChars = 120000) {
  if (!fs.existsSync(filePath)) return '';
  const text = fs.readFileSync(filePath, 'utf8');
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

function packetFiles(packetDir) {
  const result = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(absolute);
      } else if (entry.isFile()) {
        result.push(absolute);
      }
    }
  };
  if (fs.existsSync(packetDir)) walk(packetDir);
  return result.sort();
}

function fingerprintPacket(packetDir) {
  const hash = crypto.createHash('sha256');
  for (const filePath of packetFiles(packetDir)) {
    const rel = path.relative(packetDir, filePath).replace(/\\/g, '/');
    hash.update(rel);
    hash.update('\0');
    hash.update(fs.readFileSync(filePath));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function findSecretLikeText(packetDir) {
  const findings = [];
  for (const filePath of packetFiles(packetDir)) {
    const rel = path.relative(packetDir, filePath).replace(/\\/g, '/');
    if (/\.(png|jpg|jpeg|gif|webp|pdf|zip)$/i.test(rel)) continue;
    const text = readTextIfExists(filePath, 300000);
    for (const pattern of secretPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) findings.push({ file: rel, pattern: String(pattern).slice(1, 80) });
    }
  }
  return findings;
}

function loadPacket(packetDir) {
  const jsonErrors = [];
  const packet = readPacketJson(path.join(packetDir, 'packet.json'), jsonErrors, {});
  const status = readPacketJson(path.join(packetDir, 'status.json'), jsonErrors, {});
  const manifest = readPacketJson(path.join(packetDir, 'MANIFEST.json'), jsonErrors, {});
  const packetId = safePacketId(packet.packet_id || status.packet_id || manifest.packet_id, path.basename(packetDir));
  const fingerprint = fingerprintPacket(packetDir);
  const files = packetFiles(packetDir).map(relative);
  return {
    packetDir,
    packetPath: relative(packetDir),
    packet,
    status,
    manifest,
    packetId,
    fingerprint,
    files,
    jsonErrors,
    missingFiles: requiredPacketFiles.filter((name) => !fs.existsSync(path.join(packetDir, name))),
    rawText: readTextIfExists(path.join(packetDir, 'RAW.md'), 8000),
    codexPrompt: readTextIfExists(path.join(packetDir, 'CODEX_PROMPT.md'), 12000),
    patchesText: readTextIfExists(path.join(packetDir, 'PATCHES.md'), 12000),
  };
}

function declaredPacketIds(loaded) {
  return [
    ['packet.json', loaded.packet.packet_id],
    ['status.json', loaded.status.packet_id],
    ['MANIFEST.json', loaded.manifest.packet_id],
  ]
    .filter(([, value]) => String(value || '').trim())
    .map(([file, value]) => ({ file, packet_id: safePacketId(value) }));
}

function isHelperBotPacket(loaded) {
  const text = [
    loaded.packetId,
    path.basename(loaded.packetDir),
    loaded.packetPath,
    loaded.packet.scope_summary,
    loaded.packet.packet_role,
    loaded.rawText,
    loaded.codexPrompt,
  ].join('\n').toLowerCase();
  return text.includes('helper-bot-workspace-agent');
}

function validatePacket(loaded, options = {}) {
  const findings = [];
  if (!loaded.packetId) findings.push({ severity: 'blocker', code: 'missing_packet_id', message: 'Packet ID is missing.' });
  for (const error of loaded.jsonErrors || []) {
    findings.push({ severity: 'blocker', code: 'invalid_json', message: `${error.file} is not valid JSON: ${error.message}` });
  }
  for (const file of loaded.missingFiles) {
    findings.push({ severity: 'blocker', code: 'missing_required_file', message: `Missing required file: ${file}` });
  }
  const statusValue = String(loaded.status.status || '').trim();
  if (!statusValue) {
    findings.push({ severity: 'blocker', code: 'missing_ready_status', message: 'status.json must declare status ready_for_codex_audit or ready_for_codex_pickup.' });
  } else if (terminalStatuses.has(statusValue)) {
    if (!options.force) {
      findings.push({ severity: 'skip', code: 'terminal_status', message: `Packet is already terminal: ${statusValue}` });
    }
  } else if (!readyStatuses.has(statusValue)) {
    findings.push({ severity: 'skip', code: 'not_ready_status', message: `Packet status is not ready: ${statusValue}` });
  }
  const ids = declaredPacketIds(loaded);
  const uniqueIds = [...new Set(ids.map((entry) => entry.packet_id))];
  if (!String(loaded.packet.packet_id || '').trim()) {
    findings.push({ severity: 'blocker', code: 'missing_packet_json_id', message: 'packet.json must declare packet_id.' });
  }
  if (uniqueIds.length > 1) {
    findings.push({
      severity: 'blocker',
      code: 'packet_id_mismatch',
      message: `Packet IDs do not match: ${ids.map((entry) => `${entry.file}=${entry.packet_id}`).join(', ')}.`,
    });
  }
  if (isHelperBotPacket(loaded)) {
    const folderId = safePacketId(path.basename(loaded.packetDir));
    if (!helperBotPacketIds.has(loaded.packetId)) {
      findings.push({ severity: 'blocker', code: 'unknown_helper_bot_lane', message: `Unknown helper-bot packet lane: ${loaded.packetId}.` });
    }
    if (folderId !== loaded.packetId) {
      findings.push({ severity: 'blocker', code: 'helper_bot_folder_id_mismatch', message: `Helper-bot folder name must match packet_id: ${folderId} != ${loaded.packetId}.` });
    }
  }
  if (loaded.packet.secrets_included === true) {
    findings.push({ severity: 'blocker', code: 'declared_secrets_included', message: 'packet.json declares secrets_included=true.' });
  }
  if (loaded.status.secrets_included === true) {
    findings.push({ severity: 'blocker', code: 'declared_secrets_included', message: 'status.json declares secrets_included=true.' });
  }
  if (loaded.packet.external_writes_performed === true || loaded.status.external_writes_performed === true) {
    findings.push({ severity: 'blocker', code: 'declared_external_writes', message: 'Packet declares external_writes_performed=true.' });
  }
  for (const secret of findSecretLikeText(loaded.packetDir).slice(0, 8)) {
    findings.push({ severity: 'blocker', code: 'secret_like_text', message: `Secret-like text found in ${secret.file}.` });
  }
  return {
    ok: !findings.some((finding) => finding.severity === 'blocker'),
    ready: !findings.some((finding) => ['blocker', 'skip'].includes(finding.severity)),
    findings,
  };
}

function projectForPacket(loaded, config = {}) {
  const text = [
    loaded.packet.workspace,
    loaded.packet.project,
    loaded.packet.scope_summary,
    loaded.rawText,
    loaded.codexPrompt,
  ].join('\n').toLowerCase();
  if (/one[_ -]?time|rabbi|scheller|sheller|mishnah/.test(text)) return 'one_time_mishnah_class';
  if (/bna|academy|operations|platform/.test(text)) return 'bna';
  return config.defaultProject || 'one_time_mishnah_class';
}

function buildCodexPickupTaskPayload(loaded, config = {}) {
  const packetTitle = loaded.packet.scope_summary || loaded.manifest.title || loaded.packetId;
  const packetType = String(loaded.packet.packet_type || loaded.manifest.packet_type || 'implementation_bundle').trim()
    || 'implementation_bundle';
  const typeLabel = packetType.replace(/[_-]+/g, ' ');
  const title = `Pick up ChatGPT ${typeLabel} packet: ${String(packetTitle).slice(0, 120)}`;
  const rawText = [
    `Codex task: pick up ChatGPT dropoff packet ${loaded.packetId}.`,
    `Packet type: ${packetType}`,
    `Packet path: ${loaded.packetPath}`,
    `Fingerprint: ${loaded.fingerprint}`,
    '',
    'Required behavior:',
    '- Read the packet files first.',
    '- Audit ChatGPT output against the current repo before applying anything.',
    '- If this is a memory/preference packet, preserve raw source and promote only valid durable memory.',
    '- Apply only valid changes that match the repo and scope.',
    '- Run relevant tests/smokes/watchdogs.',
    '- Update packet status, requirement register, task ledger, and changelog with proof.',
    '- Do not perform external writes, sends, payments, access grants, DNS, credential changes, provider mutations, or production data changes without explicit operator approval.',
    '',
    'Packet CODEX_PROMPT excerpt:',
    loaded.codexPrompt.slice(0, 3500) || '[none]',
  ].join('\n');
  return {
    title,
    raw_text: rawText,
    notes: rawText,
    summary: `Repo-visible ChatGPT packet ${loaded.packetId} is ready for Codex audit and implementation.`,
    source: 'chatgpt_dropoff',
    source_channel: 'chatgpt_dropoff',
    source_chat_id: 'repo',
    source_message_id: `${loaded.packetId}:${loaded.fingerprint.slice(0, 16)}`,
    source_context: {
      source: 'chatgpt_dropoff_ingestor',
      packet_id: loaded.packetId,
      packet_type: packetType,
      packet_path: loaded.packetPath,
      fingerprint: loaded.fingerprint,
      files: loaded.files,
      packet_status: loaded.status.status || loaded.packet.status || null,
    },
    created_by: 'chatgpt-dropoff-ingestor',
    author: 'chatgpt-dropoff-ingestor',
    assigned_to: 'Codex',
    owner: 'Codex',
    agent_executable: true,
    task_kind: 'agent_job',
    item_type: 'task',
    stage: 'assigned',
    category: 'operations',
    urgency: loaded.packet.priority === 'urgent' ? 'urgent' : 'this_week',
    project: projectForPacket(loaded, config),
    project_key: projectForPacket(loaded, config),
    dedupe_key: `chatgpt_dropoff:${loaded.packetId}:${loaded.fingerprint.slice(0, 16)}`,
    ai_parsed: {
      parser: 'chatgpt-dropoff-ingestor-v1',
      kind: 'task',
      task_kind: 'agent_job',
      display_title: title,
      original_text: rawText,
      agent_executable: true,
      source_packet_id: loaded.packetId,
      source_packet_type: packetType,
      source_packet_path: loaded.packetPath,
      source_packet_fingerprint: loaded.fingerprint,
    },
  };
}

async function appRequest(config, method, endpoint, body = null) {
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('OPS_USERNAME/OPS_PASSWORD are required to queue ChatGPT dropoff packets.');
  }
  const response = await fetch(`${config.appUrl.replace(/\/+$/, '')}${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${endpoint} failed ${response.status}: ${text.slice(0, 900)}`);
  return text ? JSON.parse(text) : {};
}

function loadState() {
  return readJson(statePath, { packets: {} }) || { packets: {} };
}

function saveState(state) {
  state.updated_at = nowIso();
  writeJson(statePath, state);
}

function updatePacketStatus(loaded, updates = {}) {
  const statusPath = path.join(loaded.packetDir, 'status.json');
  const current = readJson(statusPath, {}) || {};
  writeJson(statusPath, {
    ...current,
    packet_id: loaded.packetId,
    updated_at: nowIso(),
    ...updates,
  });
}

function writePickupReport(result) {
  ensureDir(reportsDir);
  const stamp = nowIso().replace(/[:.]/g, '-');
  const safeId = safePacketId(result.packet_id || 'packet');
  const jsonPath = path.join(reportsDir, `${stamp}-${safeId}.json`);
  const mdPath = path.join(reportsDir, `${stamp}-${safeId}.md`);
  writeJson(jsonPath, result);
  const lines = [
    `# ChatGPT Dropoff Pickup - ${result.packet_id}`,
    '',
    `Generated: ${result.generated_at}`,
    `Packet: ${result.packet_path}`,
    `Status: ${result.status}`,
    `Queued: ${result.queued ? 'yes' : 'no'}`,
    result.task_id ? `Task: #${result.task_id}` : '',
    result.agent_job_id ? `Agent job: #${result.agent_job_id}` : '',
    '',
    '## Findings',
    '',
    ...(result.findings || []).map((finding) => `- ${finding.severity}: ${finding.code} - ${finding.message}`),
    '',
    result.error ? `Error: ${result.error}` : '',
  ].filter(Boolean);
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { json: relative(jsonPath), md: relative(mdPath) };
}

async function processPacket(packetDir, { config = loadConfig(), args = parseArgs(), state = loadState() } = {}) {
  const loaded = loadPacket(packetDir);
  const validation = validatePacket(loaded, { force: args.force });
  const stateKey = `${loaded.packetId}:${loaded.fingerprint}`;
  const prior = state.packets?.[stateKey] || null;
  const result = {
    generated_at: nowIso(),
    packet_id: loaded.packetId,
    packet_path: loaded.packetPath,
    fingerprint: loaded.fingerprint,
    status: 'skipped',
    queued: false,
    task_id: null,
    agent_job_id: null,
    findings: validation.findings,
    error: '',
  };

  if (!validation.ok) {
    result.status = 'blocked';
    updatePacketStatus(loaded, {
      status: 'blocked_needs_operator_decision',
      implementation_status: 'blocked',
      remaining_blockers: validation.findings.map((finding) => finding.message),
    });
  } else if (!validation.ready) {
    result.status = 'skipped';
  } else if (prior && !args.force) {
    result.status = 'already_queued';
    result.queued = Boolean(prior.queued);
    result.task_id = prior.task_id || null;
    result.agent_job_id = prior.agent_job_id || null;
  } else if (!args.apply || args.noLive) {
    result.status = 'ready_dry_run';
  } else {
    const payload = buildCodexPickupTaskPayload(loaded, config);
    try {
      const response = await appRequest(config, 'POST', '/api/bna/tasks/create-from-text', payload);
      result.status = 'queued';
      result.queued = true;
      result.task_id = response.task?.id || response.task_id || null;
      result.agent_job_id = response.task?.agent_job_id || response.task?.latest_agent_job_id || null;
      state.packets[stateKey] = {
        queued: true,
        packet_id: loaded.packetId,
        fingerprint: loaded.fingerprint,
        packet_path: loaded.packetPath,
        task_id: result.task_id,
        agent_job_id: result.agent_job_id,
        queued_at: nowIso(),
      };
      saveState(state);
      updatePacketStatus(loaded, {
        status: 'codex_queued',
        implementation_status: 'queued',
        picked_up_by: 'chatgpt-dropoff-ingestor',
        picked_up_at: nowIso(),
        raw_ids_created: loaded.status.raw_ids_created || [],
        task_ids_created: result.task_id ? [String(result.task_id)] : loaded.status.task_ids_created || [],
        requirement_ids_created: loaded.status.requirement_ids_created || [],
        verification: [
          ...(loaded.status.verification || []),
          `Queued for Codex by scripts/chatgpt-dropoff-ingestor.mjs as task #${result.task_id || 'unknown'}.`,
        ],
        remaining_blockers: [],
      });
    } catch (error) {
      result.status = 'queue_failed';
      result.error = error instanceof Error ? error.message : String(error);
      updatePacketStatus(loaded, {
        status: 'blocked_needs_operator_decision',
        implementation_status: 'queue_failed',
        remaining_blockers: [result.error],
      });
    }
  }

  result.report = writePickupReport(result);
  return result;
}

async function scanOnce(options = {}) {
  const config = options.config || loadConfig();
  const args = options.args || parseArgs();
  const state = loadState();
  const dirs = listPacketDirs({ packet: args.packet }).slice(0, Math.max(Number(args.limit || 20), 1));
  const results = [];
  for (const dir of dirs) {
    // Packet pickup is intentionally serial to avoid duplicate queue writes.
    // eslint-disable-next-line no-await-in-loop
    results.push(await processPacket(dir, { config, args, state }));
  }
  return {
    generated_at: nowIso(),
    apply: Boolean(args.apply && !args.noLive),
    packet_count: dirs.length,
    queued_count: results.filter((result) => result.queued).length,
    results,
  };
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  ensureDir(runtimeDir);
  const args = parseArgs();
  const config = loadConfig();
  if (args.watch) {
    const pollMs = Math.max(args.pollMs || config.pollMs, 5000);
    console.log(`ChatGPT dropoff ingestor watching ${relative(incomingDir)} every ${pollMs}ms.`);
    while (true) {
      try {
        const result = await scanOnce({ config, args });
        if (result.queued_count || !args.json) console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
      }
      await sleep(pollMs);
    }
  }
  const result = await scanOnce({ config, args });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`ChatGPT dropoff scan: ${result.queued_count}/${result.packet_count} queued.`);
    for (const item of result.results) {
      console.log(`- ${item.packet_id}: ${item.status}${item.task_id ? ` task #${item.task_id}` : ''}${item.error ? ` (${item.error})` : ''}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export {
  buildCodexPickupTaskPayload,
  declaredPacketIds,
  fingerprintPacket,
  helperBotPacketIds,
  isHelperBotPacket,
  listPacketDirs,
  loadPacket,
  parseArgs,
  projectForPacket,
  requiredPacketFiles,
  scanOnce,
  safePacketId,
  validatePacket,
};
