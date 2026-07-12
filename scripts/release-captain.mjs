#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildProductionCloseoutGateReport } from './bna-production-closeout-gate.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRootDefault = path.resolve(path.dirname(__filename), '..');

function readNext(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    json: false,
    writeReport: false,
    strict: false,
    repoRoot: repoRootDefault,
    expectedBranch: '',
    target: '',
    targetBaseUrl: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--write-report') options.writeReport = true;
    else if (arg === '--strict') options.strict = true;
    else if (arg === '--expected-branch') {
      options.expectedBranch = readNext(argv, index, '--expected-branch');
      index += 1;
    } else if (arg.startsWith('--expected-branch=')) options.expectedBranch = arg.slice('--expected-branch='.length);
    else if (arg === '--target') {
      options.target = readNext(argv, index, '--target');
      index += 1;
    } else if (arg.startsWith('--target=')) options.target = arg.slice('--target='.length);
    else if (arg === '--target-base-url') {
      options.targetBaseUrl = readNext(argv, index, '--target-base-url');
      index += 1;
    } else if (arg.startsWith('--target-base-url=')) options.targetBaseUrl = arg.slice('--target-base-url='.length);
    else if (arg === '--repo-root') {
      options.repoRoot = path.resolve(readNext(argv, index, '--repo-root'));
      index += 1;
    } else if (arg.startsWith('--repo-root=')) options.repoRoot = path.resolve(arg.slice('--repo-root='.length));
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function commandForPlatform(command, args) {
  if (process.platform !== 'win32') return { command, args };
  if (command === 'npm') return { command: 'cmd.exe', args: ['/d', '/s', '/c', 'npm.cmd', ...args] };
  if (command === 'gh') return { command: 'cmd.exe', args: ['/d', '/s', '/c', 'gh', ...args] };
  if (command === 'railway') return { command: 'cmd.exe', args: ['/d', '/s', '/c', 'railway', ...args] };
  return { command, args };
}

export function defaultRunner(command, args = [], options = {}) {
  const actual = commandForPlatform(command, args);
  const result = spawnSync(actual.command, actual.args, {
    cwd: options.cwd || repoRootDefault,
    env: options.env || process.env,
    encoding: 'utf8',
    shell: false,
    maxBuffer: options.maxBuffer || 1024 * 1024 * 8,
  });
  return {
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error ? String(result.error.message || result.error) : '',
  };
}

function runJson(command, args, repoRoot, runner) {
  const result = runner(command, args, { cwd: repoRoot, maxBuffer: 1024 * 1024 * 8 });
  if (!result.ok) return { ok: false, error: result.stderr || result.error || result.stdout || `${command} failed`, items: [] };
  try {
    return { ok: true, items: JSON.parse(result.stdout || '[]') };
  } catch (error) {
    return { ok: false, error: `Could not parse ${command} JSON: ${error.message}`, items: [] };
  }
}

function runText(command, args, repoRoot, runner) {
  const result = runner(command, args, { cwd: repoRoot, maxBuffer: 1024 * 1024 * 8 });
  return {
    ok: result.ok,
    text: String(result.stdout || result.stderr || result.error || '').trim(),
  };
}

function normalizeTargetName(value = '') {
  return String(value || '').trim().toLowerCase().replace(/_/g, '-');
}

function normalizeBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function extractTitle(html = '') {
  const match = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function lowerText(value = '') {
  return String(value || '').toLowerCase();
}

function includesAll(text = '', required = []) {
  const normalized = lowerText(text);
  return required.filter((item) => !normalized.includes(lowerText(item)));
}

function railwayStatusSummary(status = {}) {
  const text = lowerText(JSON.stringify(status || {}));
  return {
    project_name_present: text.includes('one-time-production'),
    service_name_present: text.includes('one-time-web'),
    domain_present: text.includes('join.onetimeonetime.com'),
  };
}

async function fetchTargetText(fetchFn, url) {
  const response = await fetchFn(url, { redirect: 'follow', headers: { accept: 'text/html,application/json;q=0.8,*/*;q=0.5' } });
  const text = await response.text().catch(() => '');
  return {
    status: response.status,
    ok: response.status >= 200 && response.status < 400,
    url: response.url || url,
    title: extractTitle(text),
    text,
  };
}

export async function buildOneTimePublicTargetGate(options = {}, context = {}) {
  const repoRoot = path.resolve(options.repoRoot || repoRootDefault);
  const runner = context.runner || defaultRunner;
  const fetchFn = context.fetchFn || globalThis.fetch;
  const baseUrl = normalizeBaseUrl(options.targetBaseUrl || process.env.ONETIME_BASE_URL || 'https://join.onetimeonetime.com');
  const expectedTitlePattern = /Give Your Son A Love For Torah/i;
  const expectedHeadlinePattern = /Give your son a love for Torah you never thought possible\./i;
  const requiredText = ['Give your son a love for Torah you never thought possible.', 'One Time Mishnayos', 'Sign Up Now'];
  const forbiddenPatterns = [
    /Your Child Can Love Learning Mishnayos/i,
    /Learn Mishnayos Live with Rabbi Eli Scheller/i,
    /Bnei Nevi'?im Academy/i,
    /Torah Learning for Boys/i,
  ];
  const report = {
    target: 'one-time-public',
    target_label: 'One Time canonical public funnel',
    base_url: baseUrl,
    canonical_domain: 'join.onetimeonetime.com',
    expected_project: 'one-time-production',
    expected_service: 'one-time-web',
    expected_headline: 'Give your son a love for Torah you never thought possible.',
    canonical_routes: ['/', '/one-time/'],
    checks: [],
    blockers: [],
    warnings: [],
    secrets_redacted: true,
    production_mutation_performed: false,
    external_write_performed: false,
  };

  if (typeof fetchFn !== 'function') {
    report.blockers.push('Fetch is unavailable; cannot verify canonical One Time public target.');
    report.ok = false;
    return report;
  }

  for (const routePath of report.canonical_routes) {
    const url = `${baseUrl}${routePath}`;
    try {
      const result = await fetchTargetText(fetchFn, url);
      const missingText = includesAll(result.text, requiredText);
      const forbiddenHits = forbiddenPatterns
        .filter((pattern) => pattern.test(result.text) || pattern.test(result.title))
        .map((pattern) => String(pattern));
      const ok = result.ok
        && expectedTitlePattern.test(result.title)
        && expectedHeadlinePattern.test(result.text)
        && missingText.length === 0
        && forbiddenHits.length === 0;
      report.checks.push({
        route: routePath,
        url,
        final_url: result.url,
        status: result.status,
        title: result.title,
        ok,
        missing_text: missingText,
        forbidden_hits: forbiddenHits,
      });
      if (!result.ok) report.blockers.push(`${url} returned HTTP ${result.status}.`);
      if (!expectedTitlePattern.test(result.title)) {
        report.blockers.push(`${url} title is "${result.title || '(missing)'}"; expected the One Time focused funnel title.`);
      }
      if (!expectedHeadlinePattern.test(result.text)) {
        report.blockers.push(`${url} is missing the canonical One Time hero headline.`);
      }
      for (const item of missingText) report.blockers.push(`${url} is missing required One Time funnel text: ${item}.`);
      for (const hit of forbiddenHits) report.blockers.push(`${url} matched forbidden stale/BNA content: ${hit}.`);
    } catch (error) {
      report.checks.push({ route: routePath, url, ok: false, error: error.message });
      report.blockers.push(`${url} could not be fetched: ${error.message}.`);
    }
  }

  try {
    const config = await fetchTargetText(fetchFn, `${baseUrl}/api/one-time/instance-config`);
    let parsed = {};
    try {
      parsed = JSON.parse(config.text || '{}');
    } catch {
      parsed = {};
    }
    const configOk = config.ok
      && parsed.app_instance === 'onetime'
      && parsed.workspace_key === 'rabbi_sheller_provider'
      && parsed.project_key === 'one_time_mishnah_class';
    report.checks.push({
      route: '/api/one-time/instance-config',
      url: `${baseUrl}/api/one-time/instance-config`,
      status: config.status,
      ok: configOk,
      app_instance: parsed.app_instance || '',
      workspace_key: parsed.workspace_key || '',
      project_key: parsed.project_key || '',
    });
    if (!configOk) {
      report.blockers.push('/api/one-time/instance-config did not confirm onetime / rabbi_sheller_provider / one_time_mishnah_class.');
    }
  } catch (error) {
    report.checks.push({ route: '/api/one-time/instance-config', ok: false, error: error.message });
    report.blockers.push(`/api/one-time/instance-config could not be fetched: ${error.message}.`);
  }

  const railway = runner('railway', ['status', '--json'], { cwd: repoRoot, maxBuffer: 1024 * 1024 * 8 });
  if (railway.ok && railway.stdout) {
    try {
      const parsed = JSON.parse(railway.stdout);
      const summary = railwayStatusSummary(parsed);
      report.railway_status = {
        ok: true,
        project_name: parsed.name || '',
        project_id: parsed.id || '',
        project_name_present: summary.project_name_present,
        service_name_present: summary.service_name_present,
        domain_present: summary.domain_present,
        matches_expected: summary.project_name_present && summary.service_name_present && summary.domain_present,
      };
      const missingSignals = [];
      if (!summary.project_name_present) missingSignals.push('project one-time-production');
      if (!summary.service_name_present) missingSignals.push('service one-time-web');
      if (!summary.domain_present) missingSignals.push('domain join.onetimeonetime.com');
      if (missingSignals.length) {
        report.warnings.push(
          `Railway status is not currently linked to the One Time service (${missingSignals.join(', ')} missing); live HTTP and instance-config checks remain authoritative for this public target guard. Run npm run one-time:railway-target:guard for Railway instance proof.`,
        );
      }
    } catch (error) {
      report.warnings.push(`Railway status JSON could not be parsed: ${error.message}.`);
    }
  } else {
    report.warnings.push('Railway status readback unavailable; live HTTP target checks still ran.');
  }

  report.ok = report.blockers.length === 0;
  return report;
}

export async function buildTargetGateReport(options = {}, context = {}) {
  const target = normalizeTargetName(options.target || process.env.BNA_RELEASE_TARGET || '');
  if (!target) {
    return {
      ok: true,
      target: 'not_requested',
      status: 'not_requested',
      blockers: [],
      warnings: [],
      checks: [],
      secrets_redacted: true,
      production_mutation_performed: false,
      external_write_performed: false,
    };
  }
  if (target === 'one-time-public' || target === 'onetime-public') {
    return buildOneTimePublicTargetGate(options, context);
  }
  return {
    ok: false,
    target,
    status: 'unknown_target',
    blockers: [`Unknown release target: ${target}. Use one-time-public for the canonical One Time join domain.`],
    warnings: [],
    checks: [],
    secrets_redacted: true,
    production_mutation_performed: false,
    external_write_performed: false,
  };
}

export function classifyReleaseState(gateReport, targetGate = { ok: true, blockers: [] }) {
  const blockers = gateReport.blockers || [];
  const git = gateReport.git || {};
  if (git.branch === '(detached)') return 'detached_checkout_needs_branch';
  if (git.dirty?.total > 0) return 'local_changes_need_verify_commit_push';
  if (!git.head_pushed) return 'branch_needs_push';
  if (blockers.length) return 'blocked_by_release_gate';
  if ((targetGate.blockers || []).length) return 'blocked_by_target_gate';
  return 'ready_for_pr_merge_deploy_gate';
}

export function nextActionsForState(state, gateReport, targetGate = { blockers: [] }) {
  if (state === 'detached_checkout_needs_branch') {
    return ['Create or switch to a named codex/* branch before editing or shipping.'];
  }
  if (state === 'local_changes_need_verify_commit_push') {
    return [
      'Finish the scoped edit batch, then run the focused tests and smokes.',
      'Stage only the scoped files, commit, push, and open or update the PR.',
      'After merge, run the approved deployment path and live smoke before marking app-visible work Done.',
    ];
  }
  if (state === 'branch_needs_push') {
    return ['Push the current branch so GitHub-connected agents and deploy tooling can see it.'];
  }
  if (state === 'blocked_by_release_gate') {
    return (gateReport.blockers || []).map((blocker) => `Resolve release gate blocker: ${blocker}`);
  }
  if (state === 'blocked_by_target_gate') {
    return (targetGate.blockers || []).map((blocker) => `Resolve target gate blocker: ${blocker}`);
  }
  return [
    'Open or update the PR, wait for checks, merge when green, deploy through the approved release path, and run live smoke.',
  ];
}

function summarizePrs(items = []) {
  return items.map((pr) => ({
    number: pr.number,
    title: pr.title,
    branch: pr.headRefName,
    base: pr.baseRefName,
    draft: Boolean(pr.isDraft),
    merge_state: pr.mergeStateStatus || '',
    url: pr.url,
  }));
}

export async function buildReleaseCaptainReport(options = {}, context = {}) {
  const repoRoot = path.resolve(options.repoRoot || repoRootDefault);
  const runner = context.runner || defaultRunner;
  const gate = await buildProductionCloseoutGateReport({
    repoRoot,
    expectedBranch: options.expectedBranch || undefined,
  }, {
    repoRoot,
    runCommand: context.gateRunner,
    env: context.env || process.env,
    loadSecretFn: context.loadSecretFn,
  });
  const openPrs = runJson('gh', ['pr', 'list', '--state', 'open', '--limit', '20', '--json', 'number,title,headRefName,baseRefName,isDraft,mergeStateStatus,url'], repoRoot, runner);
  const mergedPrs = runJson('gh', ['pr', 'list', '--state', 'merged', '--limit', '8', '--json', 'number,title,headRefName,baseRefName,isDraft,mergeStateStatus,url'], repoRoot, runner);
  const runStatus = runText('npm', ['run', 'bna:run:status'], repoRoot, runner);
  const targetGate = await buildTargetGateReport(options, { ...context, runner });
  const state = classifyReleaseState(gate, targetGate);

  return {
    ok: gate.ok && targetGate.ok,
    generated_at: new Date().toISOString(),
    mode: 'release_captain_read_only',
    production_mutation_performed: false,
    external_write_performed: false,
    secrets_redacted: true,
    state,
    summary: state.replace(/_/g, ' '),
    next_actions: nextActionsForState(state, gate, targetGate),
    git: gate.git,
    target_gate: targetGate,
    active_run: gate.run,
    release_gate_blockers: gate.blockers,
    open_prs: summarizePrs(openPrs.items),
    merged_prs: summarizePrs(mergedPrs.items),
    command_health: {
      gh_open_prs: openPrs.ok ? 'ok' : openPrs.error,
      gh_merged_prs: mergedPrs.ok ? 'ok' : mergedPrs.error,
      bna_run_status: runStatus.ok ? 'ok' : runStatus.text,
    },
    run_status_text: runStatus.text,
  };
}

function markdownTable(rows) {
  return rows.map((row) => `| ${row.map((cell) => String(cell ?? '').replace(/\|/g, '\\|')).join(' |')} |`).join('\n');
}

export function renderReleaseCaptainMarkdown(report) {
  const dirty = report.git?.dirty || {};
  const targetGate = report.target_gate || { target: 'not_requested', blockers: [], warnings: [], checks: [] };
  const prs = report.open_prs.length
    ? markdownTable([
        ['PR', 'Branch', 'Title', 'State'],
        ...report.open_prs.map((pr) => [`#${pr.number}`, pr.branch, pr.title, pr.draft ? 'draft' : (pr.merge_state || 'open')]),
      ])
    : 'No open PRs reported by GitHub CLI.';
  return `# Release Captain

Generated: ${report.generated_at}

State: **${report.summary}**

| Check | Value |
| --- | --- |
| Branch | ${report.git?.branch || ''} |
| Head | ${String(report.git?.head || '').slice(0, 12)} |
| Upstream | ${report.git?.upstream || ''} |
| Head pushed | ${report.git?.head_pushed ? 'yes' : 'no'} |
| Dirty files | ${dirty.total || 0} |
| Active run | ${report.active_run?.run_id || 'none'} |

## Blockers

${report.release_gate_blockers.length ? report.release_gate_blockers.map((item) => `- ${item}`).join('\n') : '- None from the read-only release gate.'}

## Next Actions

${report.next_actions.map((item) => `- ${item}`).join('\n')}

## Target Gate

| Field | Value |
| --- | --- |
| Target | ${targetGate.target || 'not_requested'} |
| Base URL | ${targetGate.base_url || 'not requested'} |
| Expected project | ${targetGate.expected_project || 'not requested'} |
| Expected service | ${targetGate.expected_service || 'not requested'} |
| Result | ${targetGate.ok ? 'passed' : 'blocked'} |

${(targetGate.blockers || []).length ? (targetGate.blockers || []).map((item) => `- ${item}`).join('\n') : '- No target gate blockers.'}

## Open PRs

${prs}

## Guardrails

- This report is read-only: no deploy, merge, production mutation, external send, payment, DNS, access grant, or secret print.
- App-visible Done still requires merge/deploy/live-smoke evidence.
`;
}

export function writeReleaseCaptainReport(report, repoRoot = repoRootDefault) {
  const outDir = path.join(repoRoot, 'ops', 'release-captain');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = report.generated_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(outDir, `${stamp}-release-captain.json`);
  const mdPath = path.join(outDir, `${stamp}-release-captain.md`);
  const latestJson = path.join(outDir, 'latest-release-captain.json');
  const latestMd = path.join(outDir, 'latest-release-captain.md');
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = renderReleaseCaptainMarkdown(report);
  fs.writeFileSync(jsonPath, json);
  fs.writeFileSync(mdPath, markdown);
  fs.writeFileSync(latestJson, json);
  fs.writeFileSync(latestMd, markdown);
  return { jsonPath, mdPath, latestJson, latestMd };
}

function printReport(report, options = {}) {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log(`Release Captain: ${report.summary}`);
  console.log(`Branch: ${report.git?.branch || ''}`);
  console.log(`Dirty files: ${report.git?.dirty?.total || 0}`);
  console.log(`Head pushed: ${report.git?.head_pushed ? 'yes' : 'no'}`);
  if (report.target_gate?.target && report.target_gate.target !== 'not_requested') {
    console.log(`Target gate: ${report.target_gate.target} (${report.target_gate.ok ? 'passed' : 'blocked'})`);
    console.log(`Target URL: ${report.target_gate.base_url || ''}`);
  }
  for (const blocker of report.release_gate_blockers) console.log(`Blocked: ${blocker}`);
  for (const blocker of report.target_gate?.blockers || []) console.log(`Target blocked: ${blocker}`);
  for (const action of report.next_actions) console.log(`Next: ${action}`);
}

export function usage() {
  return `Usage:
  node scripts/release-captain.mjs --json
  node scripts/release-captain.mjs --write-report
  node scripts/release-captain.mjs --strict
  node scripts/release-captain.mjs --target one-time-public --strict

Read-only release status. It writes reports only when --write-report is passed.`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = await buildReleaseCaptainReport(options);
  if (options.writeReport) {
    const written = writeReleaseCaptainReport(report, options.repoRoot);
    report.report_paths = written;
  }
  printReport(report, options);
  if (options.strict && !report.ok) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      mode: 'release_captain_error',
      production_mutation_performed: false,
      external_write_performed: false,
      error: error.message,
    }, null, 2));
    process.exitCode = 1;
  });
}
