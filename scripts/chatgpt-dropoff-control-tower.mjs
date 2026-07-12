#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { listPacketDirs, loadPacket, validatePacket } from './chatgpt-dropoff-ingestor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packetStatus = await import(pathToFileURL(path.join(__dirname, '..', 'src', 'platform', 'ingestion', 'packet-status.js')).href);
const {
  isTerminalPacketStatus,
  packetStatusValue,
} = packetStatus.default || packetStatus;
const repoRoot = path.resolve(__dirname, '..');
const dropoffRoot = path.join(repoRoot, 'ops', 'chatgpt-ramble-dropoff');
const controlTowerMd = path.join(dropoffRoot, 'CONTROL-TOWER.md');
const controlTowerJson = path.join(dropoffRoot, 'CONTROL-TOWER.json');
const controlTowerGeneratedPaths = new Set([
  'ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md',
  'ops/chatgpt-ramble-dropoff/CONTROL-TOWER.json',
]);

function nowIso() {
  return new Date().toISOString();
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    json: false,
    write: false,
    noAgentStatus: false,
    packet: '',
    limit: 50,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--write') args.write = true;
    else if (arg === '--no-agent-status') args.noAgentStatus = true;
    else if (arg === '--packet') args.packet = argv[++index] || '';
    else if (arg.startsWith('--packet=')) args.packet = arg.split('=').slice(1).join('=');
    else if (arg === '--limit') args.limit = Number(argv[++index] || 0);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.split('=').slice(1).join('=') || 0);
  }
  return args;
}

function run(command, args = []) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 8,
  });
  return {
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || (result.error ? result.error.message : ''),
  };
}

function gitSummary() {
  const branch = run('git', ['branch', '--show-current']);
  const status = run('git', ['status', '--short']);
  const dirtyFiles = status.stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2).trim() || line.slice(0, 2),
      path: line.slice(3).trim(),
    }))
    .filter((entry) => !controlTowerGeneratedPaths.has(entry.path.replace(/\\/g, '/')));
  return {
    branch: branch.stdout.trim() || 'unknown',
    dirty: dirtyFiles.length > 0,
    dirty_files: dirtyFiles,
    collision_warning: dirtyFiles.length
      ? 'Worktree has local changes. New agents must claim a non-overlapping lane or wait before editing these files.'
      : '',
  };
}

function classifyPacket(loaded, validation) {
  const status = packetStatusValue(loaded.status.status || loaded.packet.status || '');
  if (isTerminalPacketStatus(status)) return 'terminal';
  if (validation.findings.some((finding) => finding.severity === 'blocker')) return 'blocked';
  if (validation.ready) return 'ready';
  if (validation.findings.some((finding) => finding.code === 'not_ready_status')) return 'draft';
  if (validation.findings.some((finding) => finding.severity === 'skip')) return 'skipped';
  return 'unknown';
}

function packetSummary(args = {}) {
  const dirs = listPacketDirs({ packet: args.packet }).slice(0, Math.max(Number(args.limit || 50), 1));
  const items = dirs.map((dir) => {
    const loaded = loadPacket(dir);
    const validation = validatePacket(loaded);
    const packet = loaded.packet || {};
    const status = loaded.status || {};
    const normalizedStatus = packetStatusValue(status.status || packet.status || '');
    const state = classifyPacket(loaded, validation);
    return {
      packet_id: loaded.packetId,
      path: loaded.packetPath,
      state,
      status: normalizedStatus,
      implementation_status: status.implementation_status || '',
      packet_type: packet.packet_type || loaded.manifest.packet_type || 'implementation_bundle',
      packet_role: packet.packet_role || loaded.manifest.packet_role || '',
      owner: status.owner || packet.owner || packet.created_by || 'ChatGPT',
      lane_key: packet.lane_key || loaded.manifest.lane_key || '',
      workspace: packet.workspace || '',
      project: packet.project || '',
      scope_summary: packet.scope_summary || loaded.manifest.title || '',
      next_action: status.next_action || packet.next_action || '',
      blockers: [
        ...(Array.isArray(status.remaining_blockers) ? status.remaining_blockers : []),
        ...validation.findings
          .filter((finding) => finding.severity === 'blocker')
          .map((finding) => finding.message),
      ].filter(Boolean).slice(0, 6),
      findings: validation.findings,
      ready_for_pickup: validation.ready,
      terminal: isTerminalPacketStatus(normalizedStatus),
      picked_up_by: status.picked_up_by || '',
      picked_up_at: status.picked_up_at || '',
      task_ids_created: status.task_ids_created || [],
      requirement_ids_created: status.requirement_ids_created || [],
      evidence: status.evidence || [],
      updated_at: status.updated_at || packet.updated_at || packet.created_at || '',
    };
  });
  const counts = {};
  for (const item of items) counts[item.state] = (counts[item.state] || 0) + 1;
  return { count: items.length, counts, items };
}

function latestReports(dirName, limit = 8) {
  const dir = path.join(dropoffRoot, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const absolute = path.join(dir, entry.name);
      const stat = fs.statSync(absolute);
      return {
        path: relative(absolute),
        updated_at: stat.mtime.toISOString(),
        size: stat.size,
      };
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, limit);
}

function processIsAlive(pid) {
  const numericPid = Number(pid);
  if (!Number.isFinite(numericPid) || numericPid <= 0) return false;
  try {
    process.kill(numericPid, 0);
    return true;
  } catch {
    return false;
  }
}

function inspectTaskLock(taskId = '', sampledAt = new Date()) {
  if (!taskId) return { health: 'not_inspected_no_task_id', evidence: 'local_lock=not_inspected_no_task_id' };
  const lockPath = path.join(repoRoot, '.runtime', 'agent-fleet', `task-${taskId}.lock.json`);
  const relativeLockPath = relative(lockPath);
  if (!fs.existsSync(lockPath)) return { health: 'missing_lock', evidence: `local_lock=missing path=${relativeLockPath}` };
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    const pid = Number(lock.pid || 0);
    const signalAt = lock.heartbeat_at || lock.started_at || lock.startedAt || '';
    const signalMs = Date.parse(signalAt);
    const ageHours = Number.isFinite(signalMs)
      ? Number(((sampledAt.getTime() - signalMs) / 3600000).toFixed(2))
      : null;
    const pidRunning = processIsAlive(pid);
    const health = pidRunning && typeof ageHours === 'number' && ageHours >= 0 && ageHours <= 2
      ? 'fresh_running_lock'
      : pidRunning
        ? 'running_old_heartbeat'
        : 'stale_lock_dead_pid';
    const evidence = [
      `local_lock=${health}`,
      pid ? `pid=${pid}` : '',
      signalAt ? `heartbeat=${signalAt}` : '',
      typeof ageHours === 'number' ? `age_hours=${ageHours}` : '',
      `path=${relativeLockPath}`,
    ].filter(Boolean).join(' ');
    return { health, evidence };
  } catch (error) {
    return {
      health: 'unreadable_lock',
      evidence: `local_lock=unreadable path=${relativeLockPath} error=${String(error?.message || error).slice(0, 120)}`,
    };
  }
}

function enrichAgentJobLine(line = '', sampledAt = new Date()) {
  const taskId = line.match(/task #(\d+)/)?.[1] || '';
  if (!taskId) return line;
  const lock = inspectTaskLock(taskId, sampledAt);
  return `${line} (${lock.evidence})`;
}

function collectStatusSectionLines(lines = [], headerPattern, itemPattern) {
  const collected = [];
  let inSection = false;
  for (const line of lines) {
    if (headerPattern.test(line)) {
      inSection = true;
      continue;
    }
    if (!inSection) continue;
    if (itemPattern.test(line)) collected.push(line);
    else if (!line.startsWith('- ')) inSection = false;
  }
  return collected;
}

function agentFleetSummary(args = {}) {
  if (args.noAgentStatus) return { checked: false, raw: '', summary: [] };
  const result = run('node', ['scripts/agent-fleet-supervisor.mjs', '--status']);
  const lines = result.stdout.split(/\r?\n/).filter(Boolean);
  const sampledAt = new Date();
  return {
    checked: true,
    ok: result.ok,
    summary: lines.filter((line) => /^- (Supervisor|Observable|Claimable|Active Codex|Ready to claim|Queue health|ChatGPT)/.test(line)),
    not_claimable: lines.filter((line) => /^- job #/.test(line)).slice(0, 15).map((line) => enrichAgentJobLine(line, sampledAt)),
    fallback_candidates: collectStatusSectionLines(
      lines,
      /^Fallback task candidates requiring lane inspection:/,
      /^- #\d+ /
    ).slice(0, 15),
    raw_excerpt: lines.slice(0, 60),
    error: result.ok ? '' : result.stderr.trim(),
  };
}

function recommendations(report) {
  const notes = [];
  if (report.git.dirty) {
    notes.push('Do not start overlapping source edits until the dirty-file lane is claimed or isolated in another branch/worktree.');
  }
  if (report.packets.counts.ready) {
    notes.push('Run `npm run chatgpt:dropoff:apply` or let the fleet pick up ready packets.');
  }
  if (report.packets.counts.blocked) {
    notes.push('Fix blocked packet files/status before expecting agent pickup.');
  }
  if (!report.packets.counts.ready && !report.packets.counts.blocked) {
    notes.push('No ready ChatGPT packets are waiting. Give ChatGPT a scoped packet prompt instead of rerambling the same work to Codex.');
  }
  if (report.agent_fleet?.summary?.length) {
    notes.push('Use the Agent Fleet summary below to avoid duplicating work already running, blocked, or stale.');
  }
  notes.push('GitHub-connected ChatGPT sees committed/pushed files only; local dirty work must be committed/pushed or summarized in a packet before ChatGPT can use it.');
  return notes;
}

function buildReport(args = parseArgs()) {
  const report = {
    generated_at: nowIso(),
    git: gitSummary(),
    packets: packetSummary(args),
    latest_pickup_reports: latestReports('pickups'),
    latest_comment_pickup_reports: latestReports('comment-pickups'),
    agent_fleet: agentFleetSummary(args),
  };
  report.recommendations = recommendations(report);
  return report;
}

function table(rows, columns) {
  if (!rows.length) return '_None._';
  return [
    `| ${columns.map((column) => column.label).join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`),
  ].join('\n');
}

function markdown(report) {
  return `# ChatGPT / Codex Dropoff Control Tower

Generated: ${report.generated_at}

## Lane Safety

- Branch: \`${report.git.branch}\`
- Dirty worktree: ${report.git.dirty ? 'yes' : 'no'}
${report.git.collision_warning ? `- Collision warning: ${report.git.collision_warning}` : ''}

${table(report.git.dirty_files, [
    { label: 'Status', value: (row) => row.status },
    { label: 'Path', value: (row) => row.path },
  ])}

## Packet Status

- Total packets: ${report.packets.count}
- Ready: ${report.packets.counts.ready || 0}
- Blocked: ${report.packets.counts.blocked || 0}
- Draft: ${report.packets.counts.draft || 0}
- Terminal: ${report.packets.counts.terminal || 0}

${table(report.packets.items, [
    { label: 'Packet', value: (row) => row.packet_id },
    { label: 'State', value: (row) => row.state },
    { label: 'Status', value: (row) => row.status },
    { label: 'Owner', value: (row) => row.owner },
    { label: 'Lane', value: (row) => row.lane_key },
    { label: 'Scope', value: (row) => row.scope_summary || row.packet_type },
    { label: 'Next', value: (row) => row.next_action || row.blockers[0] || '' },
  ])}

## Agent Fleet

${report.agent_fleet.checked ? table(report.agent_fleet.summary.map((line) => ({ line })), [
    { label: 'Status Line', value: (row) => row.line },
  ]) : '_Not checked._'}

### Not Claimable / Needs Cleanup

${report.agent_fleet.checked ? table(report.agent_fleet.not_claimable.map((line) => ({ line })), [
    { label: 'Job', value: (row) => row.line },
  ]) : '_Not checked._'}

### Fallback Task Candidates

${report.agent_fleet.checked ? table((report.agent_fleet.fallback_candidates || []).map((line) => ({ line })), [
    { label: 'Task', value: (row) => row.line },
  ]) : '_Not checked._'}

## Recent Pickup Reports

${table(report.latest_pickup_reports, [
    { label: 'Report', value: (row) => row.path },
    { label: 'Updated', value: (row) => row.updated_at },
  ])}

## Recommendations

${report.recommendations.map((item) => `- ${item}`).join('\n')}
`;
}

function writeReport(report) {
  fs.writeFileSync(controlTowerJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(controlTowerMd, markdown(report));
  return {
    json: relative(controlTowerJson),
    markdown: relative(controlTowerMd),
  };
}

async function main() {
  const args = parseArgs();
  const report = buildReport(args);
  if (args.write) report.written = writeReport(report);
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(markdown(report));
    if (report.written) console.log(`\nWrote ${report.written.markdown} and ${report.written.json}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export {
  buildReport,
  classifyPacket,
  collectStatusSectionLines,
  enrichAgentJobLine,
  gitSummary,
  inspectTaskLock,
  markdown,
  packetSummary,
  recommendations,
  writeReport,
};
