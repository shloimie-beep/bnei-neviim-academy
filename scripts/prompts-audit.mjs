#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const today = new Date().toISOString().slice(0, 10);

const outputRegisterPath = path.join(repoRoot, 'ops', 'prompt-intake-register.jsonl');
const outputSummaryPath = path.join(repoRoot, 'ops', 'prompt-intake-summary.md');
const outputAuditPath = path.join(repoRoot, 'ops', 'system-audits', `${today}-prompt-intake-register.md`);
const outputHandoffPath = path.join(repoRoot, 'tasks-pending', `${today}-prompt-intake-register.md`);
const ledgerPath = path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl');
const changelogPath = path.join(repoRoot, 'ops', 'agent-changelog.md');
const tasksPath = path.join(repoRoot, 'TASKS.md');

const PROMPT_EXTENSIONS = new Set(['.md', '.markdown', '.txt', '.prompt']);
const SCAN_EXTENSIONS = new Set([...PROMPT_EXTENSIONS]);
const SOURCE_LIMIT_BYTES = 1024 * 1024 * 4;
const ZIP_ENTRY_LIMIT_BYTES = 1024 * 1024 * 3;
const RECENT_LOCAL_SOURCE_SINCE = Date.parse(process.env.PROMPT_AUDIT_SINCE || '2026-06-15T00:00:00');

const WORKSTREAM_RULES = [
  ['WATCHDOG', /ramble watchdog|self[- ]healing operating system|watchdog audit|watchdog-rules|run_watchdog_audit|system watchdog/i],
  ['PROMPT-INTAKE', /prompt intake|prompt ingestion|prompts?:audit|prompt register|downloads prompt/i],
  ['OPERATING-GOALS', /operating goals|durable operating|goal register/i],
  ['THURSDAY-ACCESS', /thursday access|blocked until thursday|owner access session/i],
  ['UI-01', /\bUI[-_ ]?01\b|ui[ -]brand|operations layout|header\/footer|mobile.*ui|public.*operations shell/i],
  ['OPS-02', /\bOPS[-_ ]?02\b|operations workflows|lanes|calendar|task routing|decision lifecycle|pending access/i],
  ['HELPER-03', /\bHELPER[-_ ]?03\b|scoped.*helper|natural[- ]language helper|bna helper/i],
  ['RABBI-04', /\bRABBI[-_ ]?04\b|one ?time.*product|rabbi scheller|mishnayos product|7pm.*class/i],
  ['INT-05', /\bINT[-_ ]?05\b|integration|integrations|zoom|vimeo|stripe|resend|buffer|wapi|godaddy|secret storage/i],
  ['COMMUNITY-06', /\bCOMMUNITY[-_ ]?06\b|course|gamification|parent progress|mishnayos community|worksheet/i],
  ['MASTER-07', /\bMASTER[-_ ]?07\b|parallel closeout|orchestrator|source[- ]of[- ]truth closeout/i],
  ['WS01-WS11', /\bWS(?:0[1-9]|1[01])\b|ws01|ws11|full ws closeout|parent-managed student/i],
  ['FAMILY-CLEANUP', /family accountability|legacy family|home accountability/i],
];

const SECRET_PATTERNS = [
  /\bsk-(?:live|test|proj)?[A-Za-z0-9_-]{16,}\b/g,
  /\b(?:rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/g,
  /\brailway_[A-Za-z0-9_-]{20,}\b/gi,
  /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bya29\.[0-9A-Za-z_-]{20,}\b/g,
];

const SECRET_CONTEXT_PATTERN = /\b(api[_ -]?key|access[_ -]?token|client[_ -]?secret|secret key|password|private key|bearer token)\b/i;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function posixRelative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function isInsideRepo(filePath) {
  const relative = path.relative(repoRoot, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function safeSourcePath(filePath) {
  return isInsideRepo(filePath) ? posixRelative(filePath) : filePath;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readTextBuffer(buffer) {
  return buffer.toString('utf8').replace(/^\uFEFF/, '');
}

function compactText(value = '', max = 300) {
  return String(value || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

function linesWithSingleTrailingNewline(lines) {
  const output = [...lines];
  while (output.length && output[output.length - 1] === '') output.pop();
  return `${output.join('\n')}\n`;
}

function redactSecrets(value = '') {
  let output = String(value || '');
  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, '[redacted-secret]');
  }
  return output.replace(/(api[_ -]?key|access[_ -]?token|client[_ -]?secret|password)\s*[:=]\s*["']?[^\s"',;]{8,}/gi, '$1=[redacted-secret]');
}

function secretRisk(text = '') {
  const value = String(text || '');
  if (SECRET_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  })) return 'confirmed';
  return SECRET_CONTEXT_PATTERN.test(value) ? 'possible' : 'none';
}

function detectedTitle(text = '', fallback = '') {
  const lines = String(text || '').split(/\r?\n/).slice(0, 80);
  for (const line of lines) {
    const heading = line.match(/^\s{0,3}#{1,3}\s+(.+?)\s*#*\s*$/);
    if (heading) return compactText(redactSecrets(heading[1]), 180);
    const title = line.match(/^\s*(?:title|goal|subject)\s*:\s*(.+)$/i);
    if (title) return compactText(redactSecrets(title[1]), 180);
  }
  return compactText(path.basename(fallback).replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), 180) || 'Untitled prompt source';
}

function detectedDate(text = '', filePath = '') {
  const source = `${filePath}\n${String(text || '').slice(0, 2000)}`;
  const match = source.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return match ? match[1] : '';
}

function workstreamKey(text = '', filePath = '') {
  const source = `${filePath}\n${String(text || '').slice(0, 5000)}`;
  for (const [key, pattern] of WORKSTREAM_RULES) {
    if (pattern.test(source)) return key;
  }
  const ws = source.match(/\bWS(0[1-9]|1[01])\b/i);
  return ws ? `WS${ws[1]}` : 'UNMAPPED';
}

function rawGoalSummary(text = '') {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !/^(date|cycle id|owner|source)\s*:/i.test(line));
  return compactText(redactSecrets(lines.slice(0, 4).join(' ')), 420);
}

function normalizeTitleKey(title = '') {
  return String(title || '')
    .toLowerCase()
    .replace(/\b(codex|chatgpt|prompt|goal|follow up|follow-up|the|and|for|to|of)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 10)
    .join('-') || 'untitled';
}

function walkFiles(dir, { maxDepth = 4, include = () => true } = {}) {
  const results = [];
  function walk(current, depth) {
    if (!fs.existsSync(current) || depth < 0) return;
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.next'].includes(entry.name)) walk(full, depth - 1);
      } else if (entry.isFile() && include(full)) {
        results.push(full);
      }
    }
  }
  walk(dir, maxDepth);
  return results;
}

function promptishName(filePath = '') {
  const name = path.basename(filePath).toLowerCase();
  const ext = path.extname(name);
  return SCAN_EXTENSIONS.has(ext) && (
    /prompt|codex|chatgpt|gpt|closeout|ramble|workstream|goal|audit|handoff|integration|helper|ui|ops|rabbi|community|ws\d/i.test(name)
    || /pasted-text\.txt$/i.test(name)
  );
}

function candidateFiles() {
  const files = new Set();
  const add = (filePath) => {
    if (!filePath || !fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size > SOURCE_LIMIT_BYTES) return;
    files.add(path.resolve(filePath));
  };

  for (const relativeDir of ['tasks-pending', 'memory']) {
    const dir = path.join(repoRoot, relativeDir);
    for (const filePath of walkFiles(dir, {
      maxDepth: relativeDir === 'memory' ? 1 : 2,
      include: (candidate) => SCAN_EXTENSIONS.has(path.extname(candidate).toLowerCase()),
    })) add(filePath);
  }

  const systemAuditsDir = path.join(repoRoot, 'ops', 'system-audits');
  for (const filePath of walkFiles(systemAuditsDir, {
    maxDepth: 1,
    include: (candidate) => {
      if (!SCAN_EXTENSIONS.has(path.extname(candidate).toLowerCase())) return false;
      const name = path.basename(candidate).toLowerCase();
      if (/prompt|ingestion|intake|execution|gap|ui-closeout|operating|agent-work-gap|downloads|workstream|closeout/.test(name)) return true;
      try {
        return fs.statSync(candidate).mtimeMs >= RECENT_LOCAL_SOURCE_SINCE && /audit|handoff|prompt/.test(name);
      } catch {
        return false;
      }
    },
  })) add(filePath);

  const downloadsDir = path.join(os.homedir(), 'Downloads');
  for (const filePath of walkFiles(downloadsDir, {
    maxDepth: 1,
    include: (candidate) => {
      const ext = path.extname(candidate).toLowerCase();
      try {
        if (fs.statSync(candidate).mtimeMs < RECENT_LOCAL_SOURCE_SINCE) return false;
      } catch {
        return false;
      }
      return ext === '.zip' || promptishName(candidate);
    },
  })) add(filePath);

  const attachmentsDir = path.join(os.homedir(), '.codex', 'attachments');
  for (const filePath of walkFiles(attachmentsDir, {
    maxDepth: 3,
    include: (candidate) => {
      const ext = path.extname(candidate).toLowerCase();
      try {
        if (fs.statSync(candidate).mtimeMs < RECENT_LOCAL_SOURCE_SINCE) return false;
      } catch {
        return false;
      }
      return ext === '.zip' || PROMPT_EXTENSIONS.has(ext);
    },
  })) add(filePath);

  return [...files].sort((a, b) => a.localeCompare(b));
}

function readZipEntries(filePath) {
  const buffer = fs.readFileSync(filePath);
  const minOffset = Math.max(0, buffer.length - 0xffff - 22);
  let eocd = -1;
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) return [];
  const entryCount = buffer.readUInt16LE(eocd + 10);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  const entries = [];
  let cursor = centralOffset;
  for (let index = 0; index < entryCount && cursor < buffer.length; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.slice(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    cursor += 46 + nameLength + extraLength + commentLength;
    if (!name || name.endsWith('/') || uncompressedSize > ZIP_ENTRY_LIMIT_BYTES) continue;
    if (!PROMPT_EXTENSIONS.has(path.extname(name).toLowerCase()) && !promptishName(name)) continue;
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) continue;
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);
    let content = null;
    try {
      if (method === 0) content = compressed;
      if (method === 8) content = zlib.inflateRawSync(compressed);
    } catch {
      content = null;
    }
    if (!content) continue;
    entries.push({
      sourcePath: `${safeSourcePath(filePath)}!${name.replace(/\\/g, '/')}`,
      buffer: content,
      zipContainer: safeSourcePath(filePath),
      mtimeMs: fs.statSync(filePath).mtimeMs,
    });
  }
  return entries;
}

function loadLedgerRows() {
  if (!fs.existsSync(ledgerPath)) return [];
  return fs.readFileSync(ledgerPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function loadChangelogHeadings() {
  if (!fs.existsSync(changelogPath)) return [];
  return fs.readFileSync(changelogPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^##\s+/.test(line))
    .map((line) => compactText(line.replace(/^##\s+/, ''), 240));
}

function ledgerWorkstreamKey(row = {}) {
  const explicit = String(row.workstream_id || '').toUpperCase();
  if (explicit.includes('WATCHDOG')) return 'WATCHDOG';
  if (explicit.includes('PROMPT-INTAKE')) return 'PROMPT-INTAKE';
  if (explicit.includes('OPERATING-GOALS')) return 'OPERATING-GOALS';
  if (explicit.includes('THURSDAY')) return 'THURSDAY-ACCESS';
  if (explicit.includes('INT-05')) return 'INT-05';
  if (explicit.includes('UI-01')) return 'UI-01';
  if (explicit.includes('OPS-02')) return 'OPS-02';
  if (explicit.includes('HELPER-03')) return 'HELPER-03';
  if (explicit.includes('RABBI-04')) return 'RABBI-04';
  if (explicit.includes('COMMUNITY-06')) return 'COMMUNITY-06';
  return workstreamKey(`${row.workstream_id || ''}\n${row.title || ''}\n${row.summary || ''}\n${row.notes || ''}`, '');
}

function terminalLedgerStage(row = {}) {
  const raw = String(row.stage || row.status || row.event || '').toLowerCase();
  if (/deployed|live.*verified|completed_deployed/.test(raw)) return 'deployed_verified';
  if (/done|completed|workstream_done/.test(raw) && /local|followup|required|pending/i.test(`${row.stage || ''} ${row.notes || ''}`)) return 'local_verified';
  if (/done|completed/.test(raw)) return 'done_verified';
  if (/blocked/.test(raw)) return 'blocked';
  if (/audit_completed|diagnosis_completed/.test(raw)) return 'mapped';
  if (/started|running|progress/.test(raw)) return 'in_progress';
  return '';
}

function latestLedgerByWorkstream(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = ledgerWorkstreamKey(row);
    if (!key || key === 'UNMAPPED') continue;
    const stamp = row.recorded_at || row.timestamp || '';
    const current = map.get(key);
    if (!current || String(stamp).localeCompare(String(current.recorded_at || current.timestamp || '')) >= 0) {
      map.set(key, row);
    }
  }
  return map;
}

function proofFilesForWorkstream(key = '') {
  if (!key || key === 'UNMAPPED') return [];
  const roots = ['screenshots', path.join('ops', 'proofs'), path.join('ops', 'playwright-smokes'), path.join('ops', 'live-smokes'), path.join('ops', 'qa-runs')];
  const needles = new Set([
    key.toLowerCase(),
    key.toLowerCase().replace('-', ''),
    key.toLowerCase().replace('-', '_'),
  ]);
  if (key === 'INT-05') needles.add('int-05');
  if (key === 'HELPER-03') needles.add('helper-03');
  if (key === 'RABBI-04') needles.add('rabbi-04');
  if (key === 'COMMUNITY-06') needles.add('community-06');
  if (key === 'UI-01') needles.add('ui-01');
  if (key === 'OPS-02') needles.add('ops-02');
  const matches = [];
  for (const root of roots) {
    const abs = path.join(repoRoot, root);
    for (const filePath of walkFiles(abs, {
      maxDepth: 4,
      include: (candidate) => {
        const rel = posixRelative(candidate).toLowerCase();
        return [...needles].some((needle) => rel.includes(needle));
      },
    })) {
      matches.push(posixRelative(filePath));
    }
  }
  return matches.slice(0, 12);
}

function extractPathProofs(text = '') {
  const matches = [];
  const pattern = /\b(?:ops|screenshots|tasks-pending|memory)\/[A-Za-z0-9._/ -]+\.(?:md|json|png|jpg|jpeg|webp)\b/g;
  for (const match of String(text || '').matchAll(pattern)) matches.push(match[0].trim());
  return [...new Set(matches)].slice(0, 12);
}

function blockerFromText(text = '') {
  const line = String(text || '').split(/\r?\n/).find((candidate) => /\b(blocked|blocker|remaining|pending|needs|need from|external)\b/i.test(candidate));
  return line ? compactText(redactSecrets(line.replace(/^[-*#\s]+/, '')), 320) : '';
}

function nextActionFromText(text = '', status = '') {
  const lines = String(text || '').split(/\r?\n/);
  const markerIndex = lines.findIndex((line) => /\b(next action|next steps|immediate next|live follow-up|remaining)\b/i.test(line));
  if (markerIndex >= 0) {
    const candidate = lines.slice(markerIndex + 1).find((line) => line.trim() && !/^#+\s/.test(line));
    if (candidate) return compactText(redactSecrets(candidate.replace(/^[-*\d.\s]+/, '')), 320);
  }
  if (status === 'blocked') return 'Resolve the recorded blocker, then rerun local/live verification.';
  if (status === 'local_verified') return 'Deploy from an approved clean release path, then run Railway doctor and live smoke.';
  if (status === 'mapped') return 'Convert mapped source into a Codex-ready task or terminal blocked/superseded record.';
  if (status === 'seen') return 'Map this source to a workstream, task, proof path, blocker, or superseded record.';
  return '';
}

function statusForSource({ text, key, linkedLedger, duplicateStatus }) {
  if (duplicateStatus) return duplicateStatus;
  const lower = String(text || '').toLowerCase();
  const ledgerStage = linkedLedger ? terminalLedgerStage(linkedLedger) : '';
  if (/deployed|railway doctor|live smoke|live-smoked|deployment `/.test(lower)) return 'deployed_verified';
  if (ledgerStage) return ledgerStage;
  if (/local implementation verified|locally implemented|local verification passed|npm test .*pass/.test(lower)) return 'local_verified';
  if (/blocked|blocker|pending credentials|pending access|needs .*access/.test(lower)) return 'blocked';
  if (/mapped|audit completed|diagnosis complete|classified/.test(lower)) return 'mapped';
  if (key === 'PROMPT-INTAKE' || key === 'OPERATING-GOALS') return 'in_progress';
  return 'seen';
}

function linkedChangelogFor(title, key, headings) {
  const titleKey = normalizeTitleKey(title);
  return headings
    .filter((heading) => {
      const normalized = normalizeTitleKey(heading);
      return normalized.includes(titleKey) || titleKey.includes(normalized) || (key !== 'UNMAPPED' && heading.toLowerCase().includes(key.toLowerCase()));
    })
    .slice(-5);
}

function taskIdsFromText(text = '') {
  return [...new Set([...String(text || '').matchAll(/\btask\s*#?(\d{1,8})\b/gi)].map((match) => Number(match[1])))];
}

function sourceTypeForPath(sourcePath = '') {
  const value = String(sourcePath || '').replace(/\\/g, '/').toLowerCase();
  if (value.includes('/downloads/')) return 'download';
  if (value.includes('/.codex/attachments/')) return 'codex_attachment';
  if (value.includes('/memory/') || value.startsWith('memory/')) return 'repo';
  if (value.includes('/tasks-pending/') || value.startsWith('tasks-pending/')) return 'repo';
  if (value.includes('/ops/')) return 'repo';
  return 'manual';
}

function goalIdsForWorkstream(key = '') {
  const map = {
    WATCHDOG: ['GOAL-009'],
    'PROMPT-INTAKE': ['GOAL-002', 'GOAL-009'],
    'OPERATING-GOALS': ['GOAL-009'],
    'HELPER-03': ['GOAL-001'],
    'OPS-02': ['GOAL-002', 'GOAL-009'],
    'INT-05': ['GOAL-004'],
    'THURSDAY-ACCESS': ['GOAL-004', 'GOAL-006'],
    'RABBI-04': ['GOAL-006'],
    'COMMUNITY-06': ['GOAL-003'],
    'UI-01': ['GOAL-007'],
    'FAMILY-CLEANUP': ['GOAL-008'],
    'WS01-WS11': ['GOAL-003'],
  };
  return map[String(key || '').toUpperCase()] || [];
}

function buildRecords() {
  const ledgerRows = loadLedgerRows();
  const latestLedger = latestLedgerByWorkstream(ledgerRows);
  const changelogHeadings = loadChangelogHeadings();
  const sourceEntries = [];

  for (const filePath of candidateFiles()) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.zip') {
      try {
        sourceEntries.push(...readZipEntries(filePath));
      } catch {}
      continue;
    }
    try {
      const stat = fs.statSync(filePath);
      const buffer = fs.readFileSync(filePath);
      sourceEntries.push({ sourcePath: safeSourcePath(filePath), buffer, mtimeMs: stat.mtimeMs });
    } catch {}
  }

  const rawRecords = sourceEntries.map((entry) => {
    const text = readTextBuffer(entry.buffer);
    const title = detectedTitle(text, entry.sourcePath);
    const date = detectedDate(text, entry.sourcePath) || new Date(entry.mtimeMs || Date.now()).toISOString().slice(0, 10);
    const key = workstreamKey(text, entry.sourcePath);
    const digest = sha256(entry.buffer);
    const linkedLedger = latestLedger.get(key) || null;
    const explicitProofs = extractPathProofs(text);
    const linkedProofFiles = [...new Set([...explicitProofs, ...proofFilesForWorkstream(key)])].slice(0, 18);
    return {
      prompt_id: `prompt_${digest.slice(0, 16)}`,
      source_path: entry.sourcePath,
      sha256: digest,
      detected_title: title,
      detected_date: date,
      source_type: sourceTypeForPath(entry.sourcePath),
      workstream_key: key,
      summary: rawGoalSummary(text),
      raw_goal_summary: rawGoalSummary(text),
      secret_risk: secretRisk(text),
      status: 'seen',
      linked_goal_ids: goalIdsForWorkstream(key),
      linked_task_ids: taskIdsFromText(text),
      linked_decision_ids: [],
      linked_pending_ids: [],
      linked_ledger_records: linkedLedger ? [{
        recorded_at: linkedLedger.recorded_at || linkedLedger.timestamp || null,
        event: linkedLedger.event || linkedLedger.status || null,
        stage: linkedLedger.stage || linkedLedger.status || null,
        workstream_id: linkedLedger.workstream_id || null,
        title: compactText(linkedLedger.title || '', 220),
      }] : [],
      linked_changelog_records: linkedChangelogFor(title, key, changelogHeadings),
      linked_proof_paths: linkedProofFiles,
      linked_proof_files: linkedProofFiles,
      blocker: blockerFromText(text),
      next_action: '',
      duplicate_group: '',
      duplicate_of: '',
    };
  });

  const exactGroups = new Map();
  for (const record of rawRecords) {
    if (!exactGroups.has(record.sha256)) exactGroups.set(record.sha256, []);
    exactGroups.get(record.sha256).push(record);
  }
  for (const group of exactGroups.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.source_path.localeCompare(b.source_path));
    const canonical = group[0];
    for (const duplicate of group.slice(1)) {
      duplicate.duplicate_group = `sha256:${canonical.sha256.slice(0, 12)}`;
      duplicate.duplicate_of = canonical.source_path;
    }
  }

  const fuzzyGroups = new Map();
  for (const record of rawRecords) {
    const groupKey = `${record.detected_date}|${record.workstream_key}|${normalizeTitleKey(record.detected_title)}`;
    record.duplicate_group ||= groupKey;
    if (!fuzzyGroups.has(groupKey)) fuzzyGroups.set(groupKey, []);
    fuzzyGroups.get(groupKey).push(record);
  }
  for (const group of fuzzyGroups.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => {
      const aScore = a.source_path.includes('tasks-pending') || a.source_path.includes('ops/') ? 0 : 1;
      const bScore = b.source_path.includes('tasks-pending') || b.source_path.includes('ops/') ? 0 : 1;
      return aScore - bScore || a.source_path.localeCompare(b.source_path);
    });
    const canonical = group[0];
    for (const duplicate of group.slice(1)) {
      duplicate.duplicate_of ||= canonical.source_path;
    }
  }

  for (const record of rawRecords) {
    const ledger = record.linked_ledger_records[0] || null;
    const duplicateStatus = record.duplicate_of ? 'superseded' : '';
    record.status = statusForSource({
      text: `${record.detected_title}\n${record.raw_goal_summary}\n${record.blocker}`,
      key: record.workstream_key,
      linkedLedger: ledger,
      duplicateStatus,
    });
    record.next_action = nextActionFromText(`${record.raw_goal_summary}\n${record.blocker}`, record.status);
    if (!record.next_action && !record.linked_task_ids.length && !record.linked_proof_files.length) {
      record.next_action = 'Map this prompt source to a task, proof path, or terminal status.';
    }
  }

  return rawRecords.sort((a, b) => (
    a.workstream_key.localeCompare(b.workstream_key)
    || a.detected_date.localeCompare(b.detected_date)
    || a.source_path.localeCompare(b.source_path)
  ));
}

function parseActiveTasksWithoutSource() {
  if (!fs.existsSync(tasksPath)) return [];
  return fs.readFileSync(tasksPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^\s*-\s+\[\s\]\s+/.test(line))
    .filter((line) => !/\b(source|handoff|audit|prompt|proof|task|memory|ops\/|screenshots\/|tasks-pending\/)\b/i.test(line))
    .map((line) => compactText(line.replace(/^\s*-\s+\[\s\]\s+/, ''), 260))
    .slice(0, 25);
}

function staleLedgerRecords() {
  const rows = loadLedgerRows();
  const latest = new Map();
  for (const row of rows) {
    const key = `${row.cycle_id || ''}|${row.workstream_id || row.title || ''}`;
    if (!key.trim()) continue;
    latest.set(key, row);
  }
  const cutoffMs = Date.now() - 6 * 60 * 60 * 1000;
  return [...latest.values()]
    .filter((row) => {
      const stamp = Date.parse(row.recorded_at || row.timestamp || '');
      const stage = String(row.stage || row.status || row.event || '').toLowerCase();
      return stamp && stamp < cutoffMs && /started|running|in_progress/.test(stage);
    })
    .map((row) => ({
      recorded_at: row.recorded_at || row.timestamp || null,
      cycle_id: row.cycle_id || null,
      workstream_id: row.workstream_id || null,
      title: compactText(row.title || '', 220),
      stage: row.stage || row.status || row.event || null,
    }))
    .slice(0, 40);
}

function writeOutputs(records) {
  ensureDir(path.dirname(outputRegisterPath));
  fs.writeFileSync(outputRegisterPath, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);

  const byWorkstream = new Map();
  for (const record of records) {
    if (!byWorkstream.has(record.workstream_key)) byWorkstream.set(record.workstream_key, []);
    byWorkstream.get(record.workstream_key).push(record);
  }
  const promptsWithoutProof = records
    .filter((record) => !record.linked_task_ids.length && !record.linked_proof_files.length && !['superseded', 'done_verified', 'deployed_verified'].includes(record.status))
    .slice(0, 40);
  const tasksWithoutSource = parseActiveTasksWithoutSource();
  const stale = staleLedgerRecords();
  const secretRisks = records.filter((record) => record.secret_risk !== 'none');

  const lines = [
    `# Prompt Intake Register - ${today}`,
    '',
    `Generated by \`npm run prompts:audit\` at ${new Date().toISOString()}.`,
    '',
    'This register maps prompt-like sources from repo handoffs, system audits, memory, Downloads, Codex attachments, and prompt zip entries into one visible status lane. Secret-looking values are redacted or represented only by risk level.',
    '',
    '## Totals',
    '',
    `- Sources scanned: ${records.length}`,
    `- Workstreams: ${byWorkstream.size}`,
    `- Secret-risk sources: ${secretRisks.length}`,
    `- Prompt sources without linked task/proof path: ${promptsWithoutProof.length}`,
    `- Active TASKS.md rows without obvious prompt/source pointer: ${tasksWithoutSource.length}`,
    `- Stale ledger starts needing terminal closeout: ${stale.length}`,
    '',
    '## Workstreams',
    '',
  ];

  for (const [key, list] of [...byWorkstream.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const counts = list.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});
    lines.push(`### ${key}`);
    lines.push('');
    lines.push(`- Count: ${list.length}`);
    lines.push(`- Statuses: ${Object.entries(counts).map(([status, count]) => `${status} ${count}`).join(', ')}`);
    const notable = list
      .filter((record) => record.status !== 'superseded')
      .slice(0, 8);
    for (const record of notable) {
      lines.push(`- ${record.status}: ${record.detected_title} (${record.source_path})`);
      if (record.blocker) lines.push(`  Blocker: ${record.blocker}`);
      if (record.next_action) lines.push(`  Next: ${record.next_action}`);
    }
    lines.push('');
  }

  lines.push('## Prompt Sources Without Task Or Proof Path');
  lines.push('');
  if (!promptsWithoutProof.length) lines.push('- None found.');
  for (const record of promptsWithoutProof) {
    lines.push(`- ${record.workstream_key}: ${record.detected_title} (${record.source_path}) -> ${record.status}`);
  }
  lines.push('');

  lines.push('## Tasks Without Obvious Prompt Source');
  lines.push('');
  if (!tasksWithoutSource.length) lines.push('- None found.');
  for (const task of tasksWithoutSource) lines.push(`- ${task}`);
  lines.push('');

  lines.push('## Stale Ledger Records');
  lines.push('');
  if (!stale.length) lines.push('- None found.');
  for (const row of stale) {
    lines.push(`- ${row.stage}: ${row.workstream_id || row.cycle_id || 'unkeyed'} - ${row.title}`);
  }
  lines.push('');

  lines.push('## Secret-Risk Sources');
  lines.push('');
  if (!secretRisks.length) lines.push('- None found.');
  for (const record of secretRisks.slice(0, 40)) {
    lines.push(`- ${record.secret_risk}: ${record.source_path} (${record.detected_title})`);
  }
  lines.push('');

  const summary = linesWithSingleTrailingNewline(lines);
  fs.writeFileSync(outputSummaryPath, summary);
  ensureDir(path.dirname(outputAuditPath));
  fs.writeFileSync(outputAuditPath, summary);
  ensureDir(path.dirname(outputHandoffPath));
  fs.writeFileSync(outputHandoffPath, linesWithSingleTrailingNewline([
    `# Prompt Intake Register Handoff - ${today}`,
    '',
    'Status: scanner implemented and current register generated.',
    '',
    'Artifacts:',
    '',
    `- \`ops/prompt-intake-register.jsonl\``,
    `- \`ops/prompt-intake-summary.md\``,
    `- \`ops/system-audits/${today}-prompt-intake-register.md\``,
    '',
    'Next steps:',
    '',
    '- Re-run `npm run prompts:audit` after new Downloads files, Codex attachments, or prompt zips are added.',
    '- Convert unmapped prompt sources into tasks, blocked records, or superseded records.',
    '- Close stale ledger-only starts with terminal status based on proof, blocker, or supersession.',
    '- Keep secret-bearing files in the BNA keyholder; this register must not store raw secret values.',
    '',
  ]));
}

function main() {
  const records = buildRecords();
  writeOutputs(records);
  const statuses = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({
    ok: true,
    scanned: records.length,
    statuses,
    register: posixRelative(outputRegisterPath),
    summary: posixRelative(outputSummaryPath),
    audit: posixRelative(outputAuditPath),
    handoff: posixRelative(outputHandoffPath),
  }, null, 2));
}

main();
