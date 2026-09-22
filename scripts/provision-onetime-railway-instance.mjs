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
const DEFAULT_REPORT = 'ops/one-time-mishnah/onetime-railway-provisioning-report.json';
const CONFIRM_PHRASE = 'PROVISION_ONE_TIME_INSTANCE';
const RAILWAY_BIN = 'railway';
const SAFE_VARIABLE_NAMES = new Set([
  'APP_MODE',
  'APP_INSTANCE',
  'DEFAULT_WORKSPACE_KEY',
  'DEFAULT_PROJECT_KEY',
  'BRAND_KEY',
  'PUBLIC_LANGUAGE',
  'BNA_RAILWAY_PROCESS',
  'BNA_COOKIE_SECURE',
  'STUDENT_BOT_ENABLED',
  'BNA_ACCOUNTABILITY_ENABLED',
  'SEFARIA_STUDY_ASSISTANT_ENABLED',
  'APP_URL',
  'BNA_APP_URL',
  'NEXT_PUBLIC_APP_URL',
  'PUBLIC_BASE_URL',
  'APP_BASE_URL',
]);

function parseArgs(argv) {
  const options = {
    planPath: DEFAULT_PLAN,
    reportPath: DEFAULT_REPORT,
    apply: false,
    confirm: '',
    json: false,
    checkAuth: false,
    skipSecrets: false,
    skipDeploy: false,
    skipDomain: false,
    writeReport: false,
    projectId: process.env.ONE_TIME_RAILWAY_PROJECT_ID || '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--plan') {
      options.planPath = argv[index + 1];
      index += 1;
    } else if (arg === '--report') {
      options.reportPath = argv[index + 1];
      options.writeReport = true;
      index += 1;
    } else if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--confirm') {
      options.confirm = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--check-auth') {
      options.checkAuth = true;
    } else if (arg === '--skip-secrets') {
      options.skipSecrets = true;
    } else if (arg === '--skip-deploy') {
      options.skipDeploy = true;
    } else if (arg === '--skip-domain') {
      options.skipDomain = true;
    } else if (arg === '--write-report') {
      options.writeReport = true;
    } else if (arg === '--project-id') {
      options.projectId = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function usage() {
  return `Usage: node scripts/provision-onetime-railway-instance.mjs [--json] [--check-auth] [--write-report]
       node scripts/provision-onetime-railway-instance.mjs --apply --confirm ${CONFIRM_PHRASE} [--skip-secrets] [--skip-deploy] [--skip-domain]

Dry-run by default. The apply path is guarded and refuses the shared BNA Railway
project. Pass --project-id or ONE_TIME_RAILWAY_PROJECT_ID to reuse a known empty
One Time project instead of creating by name. It never prints secret values.
Required secrets are read from process environment and written with railway
variable set --stdin only when --apply is confirmed.`;
}

function loadPlan(planPath) {
  const fullPath = path.resolve(planPath);
  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return parsed.plan || parsed;
}

function commandForShell(args) {
  return args.map((part) => {
    const value = String(part);
    if (/^[A-Za-z0-9_./:=@${}\-]+$/.test(value)) return value;
    return `"${value.replace(/"/g, '\\"')}"`;
  }).join(' ');
}

function redactCommand(args) {
  return args.map((part) => {
    const value = String(part);
    const key = value.split('=')[0];
    if (!SAFE_VARIABLE_NAMES.has(key) && /=(?:[^${].*)$/.test(value) && /(SECRET|PASSWORD|TOKEN|KEY|DATABASE_URL|WEBHOOK)/i.test(key)) {
      return `${key}=[redacted]`;
    }
    return value;
  });
}

function runCommand(args, options = {}) {
  const commandLine = commandForShell(args);
  const result = process.platform === 'win32'
    ? spawnSync(commandLine, {
      encoding: 'utf8',
      shell: true,
      windowsHide: true,
      input: options.input,
    })
    : spawnSync(args[0], args.slice(1), {
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
      input: options.input,
    });

  return {
    command: redactCommand(args).join(' '),
    status: result.status,
    ok: result.status === 0,
    raw_stdout: result.stdout ? result.stdout.trim() : '',
    stdout: result.stdout ? result.stdout.trim().slice(0, 4000) : '',
    stderr: result.stderr ? result.stderr.trim().replace(/\s+/g, ' ').slice(0, 1000) : (result.error?.message || ''),
  };
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

function arrayFromRailwayList(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.projects)) return parsed.projects;
  if (Array.isArray(parsed?.data)) return parsed.data;
  return [];
}

function projectName(project) {
  return String(project?.name || project?.projectName || project?.project?.name || '').trim();
}

function projectId(project) {
  return String(project?.id || project?.projectId || project?.project?.id || '').trim();
}

function extractCreatedProject(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.project) return payload.project;
  if (payload.id || payload.name || payload.projectId) return payload;
  if (payload.data?.project) return payload.data.project;
  if (payload.data?.id || payload.data?.projectId) return payload.data;
  return null;
}

function buildDryRun(checklist, options = {}) {
  const domainStep = checklist.apply_checklist.find((step) => step.key === 'attach_domain');
  const publicDomain = domainStep?.command?.[2] || 'join.onetimeonetime.com';
  const applySteps = checklist.apply_checklist
    .filter((step) => !(options.skipDeploy && step.key === 'deploy_web'))
    .filter((step) => !(options.skipDomain && step.key === 'attach_domain'))
    .map((step) => ({
      key: step.key,
      command: redactCommand(step.command).join(' '),
      secret_names: step.secret_names || undefined,
      note: step.note,
    }));

  return {
    mode: 'dry_run',
    ok: true,
    mutation_performed: false,
    confirmation_required: CONFIRM_PHRASE,
    apply_command: `npm run one-time:railway-provision:apply -- --apply --confirm ${CONFIRM_PHRASE}`,
    target: checklist.target,
    safety_guards: checklist.safety_guards,
    planned_steps: applySteps,
    database_steps: checklist.database_steps,
    verification_commands: checklist.verification_commands,
    remaining_blockers: [
      'Railway account auth must allow railway list/init/add/variable/up/domain for the One Time project.',
      `Manual DNS remains separate after Railway returns fresh ${publicDomain} records.`,
    ],
  };
}

function summarizeReadiness(checklist, railwayChecks) {
  const listCheck = railwayChecks.find((item) => item.command === 'railway list --json');
  const statusCheck = railwayChecks.find((item) => item.command === 'railway status --json');
  const projects = listCheck?.ok ? arrayFromRailwayList(parseJson(listCheck.raw_stdout || listCheck.stdout)) : [];
  const projectNames = projects.map(projectName).filter(Boolean);
  const targetProject = projects.find((project) => projectName(project).toLowerCase() === checklist.target.target_project.toLowerCase()) || null;
  const statusText = `${statusCheck?.stdout || ''}\n${statusCheck?.stderr || ''}`;
  const linkedForbidden = new RegExp(checklist.target.forbidden_project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(statusText);
  return {
    account_readable: Boolean(listCheck?.ok),
    target_project_visible: Boolean(targetProject),
    target_project_id_known: Boolean(projectId(targetProject)),
    forbidden_project_visible: projectNames.some((name) => name.toLowerCase() === checklist.target.forbidden_project.toLowerCase()),
    current_link_mentions_forbidden_project: linkedForbidden,
    target_project_id: targetProject ? '[known]' : '',
    blocked_reason: listCheck?.ok
      ? ''
      : 'Railway account-level project listing is unavailable; run railway login or provide a scoped One Time project token.',
  };
}

function readSecretFromEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value || /\b(redacted|placeholder|example|dummy|sample)\b/i.test(value)) return '';
  return value;
}

function runReadOnlyChecks(checklist) {
  return checklist.read_only_checks.map((command) => runCommand(command));
}

function ensureApplyAllowed(checklist, options) {
  const failures = [];
  if (!checklist.target.ok) failures.push(...checklist.target.failures);
  if (!options.apply) failures.push('Run with --apply to mutate Railway.');
  if (options.apply && options.confirm !== CONFIRM_PHRASE) {
    failures.push(`Missing confirmation phrase: --confirm ${CONFIRM_PHRASE}`);
  }
  return failures;
}

function applyProvisioning(plan, checklist, options) {
  const startedAt = new Date().toISOString();
  const report = {
    mode: 'apply',
    ok: false,
    mutation_performed: false,
    started_at: startedAt,
    target: checklist.target,
    steps: [],
    blockers: [],
    dns_records: [],
    verification_commands: checklist.verification_commands,
  };

  const applyFailures = ensureApplyAllowed(checklist, options);
  if (applyFailures.length) {
    report.blockers.push(...applyFailures);
    return report;
  }

  const readOnlyChecks = runReadOnlyChecks(checklist);
  report.read_only_checks = readOnlyChecks.map(({ command, ok, status, stderr }) => ({ command, ok, status, stderr }));
  const readiness = summarizeReadiness(checklist, readOnlyChecks);
  report.auth = readiness;
  if (!readiness.account_readable) {
    report.blockers.push(readiness.blocked_reason);
    return report;
  }
  if (readiness.current_link_mentions_forbidden_project) {
    report.blockers.push(`Current Railway link mentions forbidden project ${checklist.target.forbidden_project}; unlink or use a clean temp directory before applying.`);
    return report;
  }

  const listCheck = readOnlyChecks.find((item) => item.command === 'railway list --json');
  const listPayload = parseJson(listCheck?.raw_stdout || listCheck?.stdout || '');
  const projects = arrayFromRailwayList(listPayload);
  let targetProject = options.projectId
    ? projects.find((project) => projectId(project) === options.projectId) || { id: options.projectId, name: checklist.target.target_project }
    : projects.find((project) => projectName(project).toLowerCase() === checklist.target.target_project.toLowerCase()) || null;

  if (!targetProject) {
    const initStep = runCommand([RAILWAY_BIN, 'init', '--name', checklist.target.target_project, '--json']);
    report.steps.push({ key: 'create_project', command: initStep.command, ok: initStep.ok, status: initStep.status, stderr: initStep.stderr });
    if (!initStep.ok) {
      report.blockers.push(`Railway project creation failed: ${initStep.stderr || 'unknown error'}`);
      return report;
    }
    report.mutation_performed = true;
    targetProject = extractCreatedProject(parseJson(initStep.stdout));
  } else {
    report.steps.push({ key: 'reuse_project', ok: true, project: checklist.target.target_project, project_id_known: Boolean(projectId(targetProject)) });
  }

  const targetProjectId = projectId(targetProject);
  if (!targetProjectId) {
    report.blockers.push('Railway did not return a target project id. Re-run railway list --json and apply with a visible one-time-production project.');
    return report;
  }

  const environment = plan.railway?.environment || 'production';
  const linkStep = runCommand([RAILWAY_BIN, 'link', '--project', targetProjectId, '--environment', environment, '--json']);
  report.steps.push({ key: 'link_project', command: linkStep.command, ok: linkStep.ok, status: linkStep.status, stderr: linkStep.stderr });
  if (!linkStep.ok) {
    report.blockers.push(`Railway link failed: ${linkStep.stderr || 'unknown error'}`);
    return report;
  }

  const postgresStep = runCommand([RAILWAY_BIN, 'add', '--database', 'postgres', '--service', checklist.target.postgres_service, '--json']);
  report.steps.push({ key: 'create_or_verify_postgres', command: postgresStep.command, ok: postgresStep.ok, status: postgresStep.status, stderr: postgresStep.stderr });
  if (!postgresStep.ok) {
    report.blockers.push(`Railway Postgres setup failed: ${postgresStep.stderr || 'unknown error'}`);
    return report;
  }
  report.mutation_performed = true;

  const webStep = runCommand([RAILWAY_BIN, 'add', '--service', checklist.target.web_service, '--json']);
  report.steps.push({ key: 'create_or_verify_web', command: webStep.command, ok: webStep.ok, status: webStep.status, stderr: webStep.stderr });
  if (!webStep.ok) {
    report.blockers.push(`Railway web service setup failed: ${webStep.stderr || 'unknown error'}`);
    return report;
  }

  const nonSecretPairs = Object.entries(plan.variables?.non_secret || {}).map(([key, value]) => `${key}=${value}`);
  if (nonSecretPairs.length) {
    const varsStep = runCommand([RAILWAY_BIN, 'variable', 'set', '--service', checklist.target.web_service, '--environment', environment, '--skip-deploys', ...nonSecretPairs]);
    report.steps.push({ key: 'set_non_secret_variables', command: varsStep.command, ok: varsStep.ok, status: varsStep.status, stderr: varsStep.stderr });
    if (!varsStep.ok) {
      report.blockers.push(`Setting non-secret variables failed: ${varsStep.stderr || 'unknown error'}`);
      return report;
    }
  }

  const databaseReference = plan.variables?.database_reference || '${{ one-time-postgres.DATABASE_URL }}';
  const dbRefStep = runCommand([RAILWAY_BIN, 'variable', 'set', '--service', checklist.target.web_service, '--environment', environment, '--skip-deploys', `DATABASE_URL=${databaseReference}`]);
  report.steps.push({ key: 'set_database_reference', command: dbRefStep.command, ok: dbRefStep.ok, status: dbRefStep.status, stderr: dbRefStep.stderr });
  if (!dbRefStep.ok) {
    report.blockers.push(`Setting DATABASE_URL service reference failed: ${dbRefStep.stderr || 'unknown error'}`);
    return report;
  }

  const missingSecrets = [];
  if (!options.skipSecrets) {
    const requiredSecretNames = (plan.variables?.required_secret_names || [])
      .map((item) => item.name)
      .filter((name) => name && name !== 'DATABASE_URL');
    for (const name of requiredSecretNames) {
      const value = readSecretFromEnv(name);
      if (!value) {
        missingSecrets.push(name);
        continue;
      }
      const secretStep = runCommand([RAILWAY_BIN, 'variable', 'set', '--service', checklist.target.web_service, '--environment', environment, '--skip-deploys', '--stdin', name], { input: value });
      report.steps.push({ key: `set_secret_${name}`, command: secretStep.command, ok: secretStep.ok, status: secretStep.status, stderr: secretStep.stderr });
      if (!secretStep.ok) {
        report.blockers.push(`Setting required secret ${name} failed: ${secretStep.stderr || 'unknown error'}`);
        return report;
      }
    }
  }
  if (missingSecrets.length) {
    report.blockers.push(`Required secret values missing from environment: ${missingSecrets.join(', ')}. Set through the approved keyholder/Railway workflow, then rerun with --apply.`);
    return report;
  }

  if (!options.skipDeploy) {
    const deployStep = runCommand([RAILWAY_BIN, 'up', '.', '--project', targetProjectId, '--service', checklist.target.web_service, '--environment', environment, '--detach', '--message', 'One Time pilot review deployment', '--json']);
    report.steps.push({ key: 'deploy_web', command: deployStep.command, ok: deployStep.ok, status: deployStep.status, stderr: deployStep.stderr });
    if (!deployStep.ok) {
      report.blockers.push(`Railway deploy failed: ${deployStep.stderr || 'unknown error'}`);
      return report;
    }
  }

  if (!options.skipDomain) {
    const attachDomainStep = checklist.apply_checklist.find((step) => step.key === 'attach_domain');
    const publicDomain = attachDomainStep?.command?.[2] || 'join.onetimeonetime.com';
    const domainStep = runCommand([RAILWAY_BIN, 'domain', publicDomain, '--service', checklist.target.web_service, '--json']);
    const domainPayload = parseJson(domainStep.stdout);
    report.steps.push({ key: 'attach_domain', command: domainStep.command, ok: domainStep.ok, status: domainStep.status, stderr: domainStep.stderr });
    if (!domainStep.ok) {
      report.blockers.push(`Railway domain attach failed: ${domainStep.stderr || 'unknown error'}`);
      return report;
    }
    report.dns_records = domainPayload?.records || domainPayload?.dnsRecords || domainPayload?.verificationRecords || [];
  }

  report.ok = report.blockers.length === 0;
  report.completed_at = new Date().toISOString();
  return report;
}

function writeReport(reportPath, report) {
  const fullPath = path.resolve(reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(report, null, 2)}\n`);
  return fullPath;
}

function printReport(report, options) {
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`One Time Railway provisioning: ${report.ok ? 'ready' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Target: ${report.target?.target_project || 'unknown'} / ${report.target?.web_service || 'unknown'}`);
  if (report.mutation_performed) console.log('Mutation performed: yes');
  else console.log('Mutation performed: no');
  for (const blocker of report.blockers || report.remaining_blockers || []) {
    console.log(`Blocked: ${blocker}`);
  }
  if (report.apply_command) console.log(`Apply command: ${report.apply_command}`);
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }

  const plan = loadPlan(options.planPath);
  const checklist = buildOneTimeRailwayProvisioningChecklist(plan);
  let report = options.apply
    ? applyProvisioning(plan, checklist, options)
    : buildDryRun(checklist, options);

  if (options.checkAuth && !options.apply) {
    const checks = runReadOnlyChecks(checklist);
    report = {
      ...report,
      auth: summarizeReadiness(checklist, checks),
      read_only_checks: checks.map(({ command, ok, status, stderr }) => ({ command, ok, status, stderr })),
    };
    report.ok = report.ok && report.auth.account_readable && !report.auth.current_link_mentions_forbidden_project;
  }

  if (options.writeReport || options.apply) {
    report.report_path = path.relative(process.cwd(), writeReport(options.reportPath, report)).replace(/\\/g, '/');
  }

  printReport(report, options);
  if (options.apply && !report.ok) process.exitCode = 2;
  if (options.checkAuth && !options.apply && !report.ok) process.exitCode = 2;
} catch (error) {
  const failure = {
    ok: false,
    mode: 'error',
    mutation_performed: false,
    error: error.message,
  };
  console.error(JSON.stringify(failure, null, 2));
  process.exit(1);
}
