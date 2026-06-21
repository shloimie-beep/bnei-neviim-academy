#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildOneTimeRailwayProvisioningChecklist,
} = require('../src/platform/instances/one-time-separate-deployment');

const DEFAULT_PLAN = 'ops/one-time-mishnah/separate-instance-provisioning-plan.json';
const RAILWAY_BIN = 'railway';

function parseArgs(argv) {
  const options = {
    planPath: DEFAULT_PLAN,
    offline: false,
    json: false,
    allowBlocked: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--plan') {
      options.planPath = argv[index + 1];
      index += 1;
    } else if (arg === '--offline') {
      options.offline = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--allow-blocked') {
      options.allowBlocked = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function usage() {
  return `Usage: node scripts/preflight-onetime-railway-provisioning.mjs [--plan <path>] [--offline] [--json] [--allow-blocked]

Dry-run only. Performs read-only Railway auth/project checks unless --offline is
set, validates the One Time target plan, and prints redacted provisioning steps.
It never creates projects, services, domains, deployments, variables, or DNS records.`;
}

function runReadOnlyRailway(args) {
  const commandLine = [RAILWAY_BIN, ...args].map((part) => {
    if (/^[A-Za-z0-9_./:=@-]+$/.test(part)) return part;
    return `"${String(part).replace(/"/g, '\\"')}"`;
  }).join(' ');
  const result = process.platform === 'win32'
    ? spawnSync(commandLine, {
      encoding: 'utf8',
      shell: true,
      windowsHide: true,
    })
    : spawnSync(RAILWAY_BIN, args, {
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
  return {
    command: ['railway', ...args],
    status: result.status,
    ok: result.status === 0,
    stdout: result.stdout ? result.stdout.trim().slice(0, 2000) : '',
    stderr: result.stderr ? result.stderr.trim().slice(0, 2000) : (result.error?.message || ''),
  };
}

function parseProjectList(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.projects)) return parsed.projects;
    if (Array.isArray(parsed.data)) return parsed.data;
  } catch {
    return [];
  }
  return [];
}

function projectName(project) {
  return String(project?.name || project?.projectName || project?.project?.name || '').trim();
}

function summarizeAuth(checklist, checks) {
  const listCheck = checks.find((item) => item.command.join(' ') === 'railway list --json');
  const statusCheck = checks.find((item) => item.command.join(' ') === 'railway status --json');
  const projects = listCheck?.ok ? parseProjectList(listCheck.stdout) : [];
  const names = projects.map(projectName).filter(Boolean);
  const hasTarget = names.some((name) => name.toLowerCase() === checklist.target.target_project.toLowerCase());
  const hasForbidden = names.some((name) => name.toLowerCase() === checklist.target.forbidden_project.toLowerCase());
  const statusText = `${statusCheck?.stdout || ''}\n${statusCheck?.stderr || ''}`;
  const linkedForbidden = new RegExp(checklist.target.forbidden_project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(statusText);
  return {
    account_readable: Boolean(listCheck?.ok),
    target_project_visible: hasTarget,
    forbidden_project_visible: hasForbidden,
    current_link_mentions_forbidden_project: linkedForbidden,
    blocked_reason: listCheck?.ok
      ? ''
      : 'Railway account-level project listing is unavailable; provide account auth or a scoped One Time project token.',
  };
}

function loadPlan(planPath) {
  const fullPath = path.resolve(planPath);
  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return parsed.plan || parsed;
}

function redactCheck(check) {
  return {
    command: check.command.join(' '),
    ok: check.ok,
    status: check.status,
    stderr_summary: check.ok ? '' : check.stderr.replace(/\s+/g, ' ').slice(0, 240),
  };
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }

  const plan = loadPlan(options.planPath);
  const checklist = buildOneTimeRailwayProvisioningChecklist(plan);
  const checks = options.offline ? [] : checklist.read_only_checks.map((command) => runReadOnlyRailway(command.slice(1)));
  const auth = options.offline
    ? { account_readable: false, target_project_visible: false, forbidden_project_visible: false, current_link_mentions_forbidden_project: false, blocked_reason: 'Offline mode; Railway auth not checked.' }
    : summarizeAuth(checklist, checks);

  const output = {
    ok: checklist.target.ok && !auth.current_link_mentions_forbidden_project && (options.offline || auth.account_readable),
    dry_run_only: true,
    plan_path: path.relative(process.cwd(), path.resolve(options.planPath)).replace(/\\/g, '/'),
    target: checklist.target,
    auth,
    read_only_checks: checks.map(redactCheck),
    safety_guards: checklist.safety_guards,
    apply_checklist: checklist.apply_checklist,
    database_steps: checklist.database_steps,
    verification_commands: checklist.verification_commands,
  };

  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(`One Time Railway provisioning preflight: ${output.ok ? 'ready' : 'blocked'}`);
    console.log(`Target project: ${checklist.target.target_project}`);
    console.log(`Web service: ${checklist.target.web_service}`);
    console.log(`Postgres service: ${checklist.target.postgres_service}`);
    if (!checklist.target.ok) console.log(`Target failures: ${checklist.target.failures.join('; ')}`);
    if (auth.blocked_reason) console.log(`Blocked: ${auth.blocked_reason}`);
    if (auth.current_link_mentions_forbidden_project) {
      console.log(`Blocked: current Railway link mentions forbidden project ${checklist.target.forbidden_project}.`);
    }
    console.log('Dry-run only. No Railway mutation was performed.');
  }

  if (!output.ok && !options.allowBlocked) process.exitCode = 2;
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}
