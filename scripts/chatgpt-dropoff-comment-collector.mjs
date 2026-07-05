#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dropoffRoot = path.join(repoRoot, 'ops', 'chatgpt-ramble-dropoff');
const incomingDir = path.join(dropoffRoot, 'incoming');
const reportsDir = path.join(dropoffRoot, 'comment-pickups');
const runtimeDir = path.join(repoRoot, '.runtime', 'chatgpt-dropoff-comment-collector');
const statePath = path.join(runtimeDir, 'state.json');
const envLocalPath = path.join(repoRoot, '.env.local');
const defaultRepo = 'shloimie-beep/bnei-neviim-academy';
const marker = 'BNA_CHATGPT_DROPOFF_PACKET';
const requiredPacketFiles = ['packet.json', 'RAW.md', 'CODEX_PROMPT.md', 'MANIFEST.json', 'status.json'];
const allowedPacketFiles = new Set([...requiredPacketFiles, 'PATCHES.md']);
const defaultTrustedAuthors = [
  'shloimie-beep',
  'sdratler',
  'chatgpt-codex-connector',
  'chatgpt-codex-connector[bot]',
  'openai-chatgpt',
  'openai-chatgpt[bot]',
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
  const trusted = String(merged.CHATGPT_DROPOFF_TRUSTED_GITHUB_AUTHORS || defaultTrustedAuthors.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    repo: merged.CHATGPT_DROPOFF_GITHUB_REPO || defaultRepo,
    trustedAuthors: new Set(trusted),
    collectLimit: Number(merged.CHATGPT_DROPOFF_COMMENT_LIMIT || 40),
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    apply: false,
    json: false,
    repo: '',
    issue: '',
    comment: '',
    url: '',
    limit: 40,
    force: false,
    allowUntrusted: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--repo') args.repo = argv[++index] || '';
    else if (arg.startsWith('--repo=')) args.repo = arg.split('=').slice(1).join('=');
    else if (arg === '--issue') args.issue = argv[++index] || '';
    else if (arg.startsWith('--issue=')) args.issue = arg.split('=').slice(1).join('=');
    else if (arg === '--comment') args.comment = argv[++index] || '';
    else if (arg.startsWith('--comment=')) args.comment = arg.split('=').slice(1).join('=');
    else if (arg === '--url') args.url = argv[++index] || '';
    else if (arg.startsWith('--url=')) args.url = arg.split('=').slice(1).join('=');
    else if (arg === '--limit') args.limit = Number(argv[++index] || 0);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=').slice(1).join('=') || 0);
    else if (arg === '--force') args.force = true;
    else if (arg === '--allow-untrusted') args.allowUntrusted = true;
  }
  if (args.url) {
    const match = args.url.match(/github\.com\/([^/]+\/[^/]+)\/(?:issues|pull)\/(\d+)(?:#issuecomment-(\d+))?/i);
    if (match) {
      args.repo = args.repo || match[1];
      args.issue = args.issue || match[2];
      args.comment = args.comment || match[3] || '';
    }
  }
  return args;
}

function safePacketId(value, fallback = '') {
  return String(value || fallback || '')
    .trim()
    .replace(/[^A-Za-z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function ghApi(pathname) {
  const result = spawnSync('gh', ['api', pathname], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0 || result.error) {
    throw new Error(`gh api failed for ${pathname}: ${String(result.stderr || result.error?.message || '').trim()}`);
  }
  return JSON.parse(result.stdout || 'null');
}

function githubIssueUrl(repo, issueNumber, commentId = '') {
  const base = `https://github.com/${repo}/issues/${issueNumber}`;
  return commentId ? `${base}#issuecomment-${commentId}` : base;
}

function fetchCandidateComments({ repo = defaultRepo, issue = '', comment = '', limit = 40 } = {}) {
  if (issue) {
    const comments = ghApi(`repos/${repo}/issues/${issue}/comments?per_page=100`);
    return comments
      .filter((item) => !comment || String(item.id) === String(comment))
      .map((item) => ({
        repo,
        issue_number: Number(issue),
        comment_id: String(item.id),
        author: item.user?.login || '',
        url: item.html_url || githubIssueUrl(repo, issue, item.id),
        body: item.body || '',
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
      }));
  }

  const issues = ghApi(`repos/${repo}/issues?state=all&sort=updated&direction=desc&per_page=${Math.max(Math.min(Number(limit || 40), 100), 1)}`);
  const results = [];
  for (const item of issues) {
    const comments = ghApi(`repos/${repo}/issues/${item.number}/comments?per_page=100`);
    for (const commentItem of comments) {
      results.push({
        repo,
        issue_number: Number(item.number),
        comment_id: String(commentItem.id),
        author: commentItem.user?.login || '',
        url: commentItem.html_url || githubIssueUrl(repo, item.number, commentItem.id),
        body: commentItem.body || '',
        created_at: commentItem.created_at || null,
        updated_at: commentItem.updated_at || null,
      });
    }
  }
  return results;
}

function extractLine(body, label) {
  const regex = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*(.+)$`, 'im');
  const match = String(body || '').match(regex);
  return match ? match[1].trim() : '';
}

function parseFileBlocks(body = '') {
  const files = {};
  const pattern = /(?:^|\n)###\s*File:\s*([^\n]+)\n```[^\n]*\n([\s\S]*?)\n```/g;
  let match = pattern.exec(body);
  while (match) {
    const name = String(match[1] || '').trim().replace(/\\/g, '/');
    const baseName = path.posix.basename(name);
    if (allowedPacketFiles.has(baseName)) files[baseName] = match[2].replace(/\s+$/g, '');
    match = pattern.exec(body);
  }
  return files;
}

function parseDropoffComment(comment = {}) {
  const body = String(comment.body || '');
  const findings = [];
  if (!body.includes(marker)) {
    return { is_dropoff: false, findings: [{ severity: 'skip', code: 'missing_marker', message: `Comment does not contain ${marker}.` }] };
  }
  const packetId = safePacketId(extractLine(body, 'Packet ID') || extractLine(body, 'packet_id'));
  const status = extractLine(body, 'Status') || extractLine(body, 'status');
  const targetFolder = extractLine(body, 'Target folder') || extractLine(body, 'Packet path') || '';
  const files = parseFileBlocks(body);
  if (!packetId) findings.push({ severity: 'blocker', code: 'missing_packet_id', message: 'Comment is missing Packet ID.' });
  if (!status) findings.push({ severity: 'blocker', code: 'missing_status', message: 'Comment is missing Status.' });
  for (const file of requiredPacketFiles) {
    if (!files[file]) findings.push({ severity: 'blocker', code: 'missing_file_block', message: `Comment is missing file block: ${file}.` });
  }
  if (!files['PATCHES.md']) {
    files['PATCHES.md'] = '# Patches\n\nNo PATCHES.md content was supplied in the GitHub comment.\n';
  }
  return {
    is_dropoff: true,
    packet_id: packetId,
    status,
    target_folder: targetFolder,
    files,
    source: {
      repo: comment.repo || defaultRepo,
      issue_number: comment.issue_number || null,
      comment_id: comment.comment_id || null,
      author: comment.author || '',
      url: comment.url || '',
      created_at: comment.created_at || null,
      updated_at: comment.updated_at || null,
      body_sha256: sha256(body),
    },
    findings,
  };
}

function loadState() {
  return readJson(statePath, { comments: {} }) || { comments: {} };
}

function saveState(state) {
  state.updated_at = nowIso();
  writeJson(statePath, state);
}

function writeReport(result) {
  ensureDir(reportsDir);
  const stamp = nowIso().replace(/[:.]/g, '-');
  const safeId = safePacketId(result.packet_id || result.comment_id || 'comment');
  const jsonPath = path.join(reportsDir, `${stamp}-${safeId}.json`);
  const mdPath = path.join(reportsDir, `${stamp}-${safeId}.md`);
  writeJson(jsonPath, result);
  const lines = [
    `# ChatGPT GitHub Comment Dropoff - ${result.packet_id || result.comment_id || 'unknown'}`,
    '',
    `Generated: ${result.generated_at}`,
    `Status: ${result.status}`,
    `Comment: ${result.url || 'n/a'}`,
    `Packet path: ${result.packet_path || 'n/a'}`,
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

function materializeDropoffComment(parsed, { targetIncomingDir = incomingDir, force = false } = {}) {
  const packetDir = path.join(targetIncomingDir, parsed.packet_id);
  const resolved = path.resolve(packetDir);
  const incomingResolved = path.resolve(targetIncomingDir);
  if (!resolved.startsWith(`${incomingResolved}${path.sep}`)) {
    throw new Error(`Refusing to write packet outside incoming directory: ${packetDir}`);
  }
  if (fs.existsSync(packetDir) && !force) {
    throw new Error(`Packet folder already exists: ${relative(packetDir)}. Use --force only after auditing the duplicate.`);
  }
  ensureDir(packetDir);
  for (const [fileName, content] of Object.entries(parsed.files)) {
    if (!allowedPacketFiles.has(fileName)) continue;
    fs.writeFileSync(path.join(packetDir, fileName), `${String(content || '').replace(/\s+$/g, '')}\n`);
  }
  writeJson(path.join(packetDir, 'COMMENT_SOURCE.json'), parsed.source);
  return packetDir;
}

async function collectOnce({ config = loadConfig(), args = parseArgs(), comments = null, writeReports = true } = {}) {
  const repo = args.repo || config.repo || defaultRepo;
  const limit = Math.max(Number(args.limit || config.collectLimit || 40), 1);
  const state = loadState();
  const candidates = comments || fetchCandidateComments({ repo, issue: args.issue, comment: args.comment, limit });
  const results = [];

  for (const comment of candidates) {
    const parsed = parseDropoffComment(comment);
    if (!parsed.is_dropoff) continue;
    const stateKey = `${parsed.source.repo}#${parsed.source.issue_number}:comment:${parsed.source.comment_id}:${parsed.source.body_sha256}`;
    const trusted = args.allowUntrusted || config.trustedAuthors.has(parsed.source.author);
    const result = {
      generated_at: nowIso(),
      status: 'skipped',
      packet_id: parsed.packet_id || null,
      comment_id: parsed.source.comment_id || null,
      author: parsed.source.author || '',
      url: parsed.source.url || '',
      packet_path: parsed.packet_id ? relative(path.join(incomingDir, parsed.packet_id)) : null,
      collected: false,
      findings: [...parsed.findings],
      error: '',
    };
    if (!trusted) {
      result.status = 'blocked_untrusted_author';
      result.findings.push({ severity: 'blocker', code: 'untrusted_author', message: `GitHub comment author is not trusted for automatic pickup: ${parsed.source.author || 'unknown'}.` });
    } else if (parsed.findings.some((finding) => finding.severity === 'blocker')) {
      result.status = 'blocked_invalid_comment_packet';
    } else if (state.comments?.[stateKey] && !args.force) {
      result.status = 'already_collected';
      result.collected = true;
    } else if (!args.apply) {
      result.status = 'ready_dry_run';
    } else {
      try {
        const packetDir = materializeDropoffComment(parsed, { targetIncomingDir: incomingDir, force: args.force });
        state.comments[stateKey] = {
          collected_at: nowIso(),
          packet_id: parsed.packet_id,
          packet_path: relative(packetDir),
          comment_url: parsed.source.url,
          author: parsed.source.author,
          body_sha256: parsed.source.body_sha256,
        };
        saveState(state);
        result.status = 'collected';
        result.collected = true;
        result.packet_path = relative(packetDir);
      } catch (error) {
        result.status = 'collect_failed';
        result.error = error instanceof Error ? error.message : String(error);
      }
    }
    if (writeReports) result.report = writeReport(result);
    results.push(result);
  }

  return {
    generated_at: nowIso(),
    apply: Boolean(args.apply),
    repo,
    candidates_checked: candidates.length,
    dropoff_comment_count: results.length,
    collected_count: results.filter((result) => result.collected).length,
    results,
  };
}

async function main() {
  ensureDir(runtimeDir);
  const config = loadConfig();
  const args = parseArgs();
  const result = await collectOnce({ config, args });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`ChatGPT GitHub comment dropoff collector: ${result.collected_count}/${result.dropoff_comment_count} collected.`);
    for (const item of result.results) {
      console.log(`- ${item.packet_id || item.comment_id}: ${item.status}${item.packet_path ? ` ${item.packet_path}` : ''}${item.error ? ` (${item.error})` : ''}`);
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
  allowedPacketFiles,
  collectOnce,
  defaultTrustedAuthors,
  fetchCandidateComments,
  materializeDropoffComment,
  marker,
  parseArgs,
  parseDropoffComment,
  parseFileBlocks,
  requiredPacketFiles,
  safePacketId,
};
