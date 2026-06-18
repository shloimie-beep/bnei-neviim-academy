#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const VALID_STATUSES = new Set([
  'not_started',
  'in_progress',
  'needs_verification',
  'blocked',
  'needs_operator_decision',
  'done',
  'already_satisfied',
  'verified',
  'failed',
  'archived',
  'superseded'
]);

const CLOSED_STATUSES = new Set([
  'done',
  'already_satisfied',
  'verified',
  'failed',
  'archived',
  'superseded'
]);

const LIVE_CLOSED_STATUSES = new Set(['done', 'already_satisfied', 'verified']);

const WORK_REMAINS_STATUSES = new Set([
  'not_started',
  'in_progress',
  'needs_verification',
  'blocked',
  'needs_operator_decision'
]);

const REQUIRED_RUN_FILES = [
  'SOURCE.md',
  'REQUIREMENTS.md',
  'requirements.json',
  'BASELINE.md',
  'PLAN.md',
  'STATUS.md',
  'EVIDENCE.md',
  'TEST-RESULTS.md',
  'DEPLOYMENT.md',
  'NEXT-SESSION.md',
  'run.json'
];

const DEFAULT_BLOCKER =
  'Waiting for user to upload agent-review-package.zip or audit output path';

function readJson(filePath, errors, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${label}: cannot read valid JSON at ${filePath}: ${error.message}`);
    return null;
  }
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.some((item) => String(item || '').trim());
}

function isNonEmptyFile(filePath) {
  return fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').trim().length > 0;
}

function relativeTo(root, target) {
  return path.relative(root, target).replaceAll(path.sep, '/');
}

function parseArgs(argv) {
  const command = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'status';
  const rest = command === argv[0] ? argv.slice(1) : argv;
  const options = {
    command,
    root: process.cwd(),
    run: null,
    id: null,
    title: null,
    force: false
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--root') {
      options.root = path.resolve(rest[++index] || options.root);
    } else if (arg === '--run') {
      options.run = rest[++index] || null;
    } else if (arg === '--id') {
      options.id = rest[++index] || null;
    } else if (arg === '--title') {
      options.title = rest[++index] || null;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      options.command = 'help';
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function resolveRunContext(rootInput, runInput = null) {
  const root = path.resolve(rootInput);
  const errors = [];
  const latestPath = path.join(root, 'ops', 'execution-runs', 'latest.json');
  let runDir;
  let latest = null;

  if (runInput) {
    runDir = path.resolve(root, runInput);
  } else {
    if (!fs.existsSync(latestPath)) {
      errors.push(`latest.json is missing at ${latestPath}`);
      return { root, latestPath, latest, runDir: null, errors };
    }
    latest = readJson(latestPath, errors, 'latest.json');
    if (latest) {
      const runPath = latest.path || path.join('ops', 'execution-runs', latest.run_id || '');
      runDir = path.resolve(root, runPath);
    }
  }

  if (!runDir) {
    errors.push('No execution run was selected.');
  } else if (!fs.existsSync(runDir)) {
    const source = runInput ? '--run' : 'latest.json';
    errors.push(`${source} points to missing run: ${relativeTo(root, runDir)}`);
  }

  return { root, latestPath, latest, runDir, errors };
}

function validateRequirement(requirement, index, seenIds, errors) {
  const label = requirement?.id || `requirements[${index}]`;

  if (!requirement || typeof requirement !== 'object' || Array.isArray(requirement)) {
    errors.push(`requirements[${index}] must be an object.`);
    return;
  }

  if (!requirement.id) {
    errors.push(`requirements[${index}] is missing id.`);
  } else if (!/^REQ-\d{8}-\d{3}$/.test(requirement.id)) {
    errors.push(`${label}: id must match REQ-YYYYMMDD-###.`);
  } else if (seenIds.has(requirement.id)) {
    errors.push(`${label}: duplicate requirement id.`);
  } else {
    seenIds.add(requirement.id);
  }

  if (!requirement.title || typeof requirement.title !== 'string') {
    errors.push(`${label}: title is required.`);
  }

  if (!requirement.expected_result || typeof requirement.expected_result !== 'string') {
    errors.push(`${label}: expected_result is required.`);
  }

  if (!VALID_STATUSES.has(requirement.status)) {
    errors.push(`${label}: invalid status "${requirement.status}".`);
    return;
  }

  if (requirement.status === 'blocked' && !String(requirement.blocker || '').trim()) {
    errors.push(`${label}: blocked requirements require blocker.`);
  }

  if (requirement.depends_on_audit_output && requirement.status === 'blocked') {
    const blocker = String(requirement.blocker || '').trim();
    if (blocker !== DEFAULT_BLOCKER) {
      errors.push(`${label}: audit-output blockers must use the standard blocker text.`);
    }
  }

  if (CLOSED_STATUSES.has(requirement.status) && !nonEmptyArray(requirement.evidence)) {
    errors.push(`${label}: closed requirement requires evidence.`);
  }

  if (CLOSED_STATUSES.has(requirement.status) && !nonEmptyArray(requirement.acceptance_criteria)) {
    errors.push(`${label}: closed requirement requires acceptance criteria.`);
  }

  if (
    requirement.live_required &&
    LIVE_CLOSED_STATUSES.has(requirement.status) &&
    !nonEmptyArray(requirement.deployment_evidence)
  ) {
    errors.push(`${label}: live-required closed requirement requires deployment/live evidence.`);
  }
}

export function validateExecutionRun(rootInput = process.cwd(), runInput = null) {
  const context = resolveRunContext(rootInput, runInput);
  const errors = [...context.errors];
  const warnings = [];

  if (!context.runDir || errors.length) {
    return { ...context, errors, warnings, requirements: [], counts: {}, workRemains: false };
  }

  for (const fileName of REQUIRED_RUN_FILES) {
    const filePath = path.join(context.runDir, fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required run file: ${relativeTo(context.root, filePath)}`);
    }
  }

  const runJsonPath = path.join(context.runDir, 'run.json');
  const requirementsPath = path.join(context.runDir, 'requirements.json');
  const runJson = fs.existsSync(runJsonPath) ? readJson(runJsonPath, errors, 'run.json') : null;
  const requirementsDoc = fs.existsSync(requirementsPath)
    ? readJson(requirementsPath, errors, 'requirements.json')
    : null;

  if (runJson && requirementsDoc && runJson.run_id !== requirementsDoc.run_id) {
    errors.push(`run.json run_id does not match requirements.json run_id.`);
  }

  if (context.latest && requirementsDoc && context.latest.run_id !== requirementsDoc.run_id) {
    errors.push(`latest.json run_id does not match requirements.json run_id.`);
  }

  const requirements = Array.isArray(requirementsDoc?.requirements)
    ? requirementsDoc.requirements
    : [];

  if (!requirementsDoc) {
    // readJson already recorded the error.
  } else {
    if (!requirementsDoc.run_id) {
      errors.push('requirements.json is missing run_id.');
    }
    if (!requirementsDoc.title) {
      errors.push('requirements.json is missing title.');
    }
    if (!Array.isArray(requirementsDoc.requirements)) {
      errors.push('requirements.json requirements must be an array.');
    }
  }

  const seenIds = new Set();
  requirements.forEach((requirement, index) => {
    validateRequirement(requirement, index, seenIds, errors);
  });

  const workRemains = requirements.some((requirement) =>
    WORK_REMAINS_STATUSES.has(requirement.status)
  );
  const nextSessionPath = path.join(context.runDir, 'NEXT-SESSION.md');
  if (workRemains && !isNonEmptyFile(nextSessionPath)) {
    errors.push('NEXT-SESSION.md is required and must be non-empty while work remains.');
  }

  const counts = {};
  for (const requirement of requirements) {
    counts[requirement.status] = (counts[requirement.status] || 0) + 1;
  }

  return { ...context, errors, warnings, requirements, counts, workRemains };
}

function printValidation(result) {
  const runLabel = result.runDir ? relativeTo(result.root, result.runDir) : '(none)';
  console.log(`Execution run: ${runLabel}`);

  if (Object.keys(result.counts).length) {
    console.log('Requirement status counts:');
    for (const status of [...VALID_STATUSES]) {
      if (result.counts[status]) {
        console.log(`- ${status}: ${result.counts[status]}`);
      }
    }
  }

  if (result.workRemains) {
    console.log('Work remains: yes');
  } else if (result.requirements.length) {
    console.log('Work remains: no');
  }

  for (const warning of result.warnings) {
    console.log(`WARNING: ${warning}`);
  }

  if (result.errors.length) {
    console.error('Validation failed:');
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    return false;
  }

  console.log('Validation passed.');
  return true;
}

function createRun(options) {
  const root = path.resolve(options.root);
  const today = new Date().toISOString().slice(0, 10);
  const id = options.id || `${today}-bna-execution-run`;
  const title = options.title || id.replace(/-/g, ' ');
  const runDir = path.join(root, 'ops', 'execution-runs', id);

  if (fs.existsSync(runDir) && !options.force) {
    throw new Error(`Run already exists: ${relativeTo(root, runDir)}. Use --force to refresh.`);
  }

  fs.mkdirSync(runDir, { recursive: true });

  const files = {
    'SOURCE.md': `# Source\n\nDescribe the source ramble, prompt, file, or audit packet.\n`,
    'REQUIREMENTS.md': `# Requirements\n\nMachine-readable requirements live in requirements.json.\n`,
    'requirements.json': JSON.stringify(
      {
        run_id: id,
        title,
        updated_at: new Date().toISOString(),
        requirements: []
      },
      null,
      2
    ).concat('\n'),
    'BASELINE.md': `# Baseline\n\nRecord current-state inspection before implementation.\n`,
    'PLAN.md': `# Plan\n\nRecord implementation batches and verification gates.\n`,
    'STATUS.md': `# Status\n\nRecord current run status.\n`,
    'EVIDENCE.md': `# Evidence\n\nRecord proof paths and verification notes.\n`,
    'TEST-RESULTS.md': `# Test Results\n\nRecord commands and results.\n`,
    'DEPLOYMENT.md': `# Deployment\n\nRecord deploy/live-smoke proof or blockers.\n`,
    'NEXT-SESSION.md': `# Next Session\n\nRecord exact resume steps while work remains.\n`,
    'run.json': JSON.stringify(
      {
        run_id: id,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
        protocol: 'docs/BNA-RAMBLE-TO-DONE.md',
        requirements_file: 'requirements.json'
      },
      null,
      2
    ).concat('\n')
  };

  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(runDir, fileName);
    if (!fs.existsSync(filePath) || options.force) {
      fs.writeFileSync(filePath, content);
    }
  }

  const latestPath = path.join(root, 'ops', 'execution-runs', 'latest.json');
  fs.mkdirSync(path.dirname(latestPath), { recursive: true });
  fs.writeFileSync(
    latestPath,
    JSON.stringify(
      {
        run_id: id,
        path: relativeTo(root, runDir),
        updated_at: new Date().toISOString()
      },
      null,
      2
    ).concat('\n')
  );

  console.log(`Initialized execution run: ${relativeTo(root, runDir)}`);
}

function printResume(result) {
  const ok = printValidation(result);
  if (!ok) {
    return false;
  }

  const nextSessionPath = path.join(result.runDir, 'NEXT-SESSION.md');
  console.log('\n--- NEXT-SESSION.md ---');
  console.log(fs.readFileSync(nextSessionPath, 'utf8').trim());

  const openRequirements = result.requirements.filter((requirement) =>
    WORK_REMAINS_STATUSES.has(requirement.status)
  );
  if (openRequirements.length) {
    console.log('\nOpen requirements:');
    for (const requirement of openRequirements) {
      const blocker = requirement.blocker ? ` (${requirement.blocker})` : '';
      console.log(`- ${requirement.id} ${requirement.status}: ${requirement.title}${blocker}`);
    }
  }

  return true;
}

function printHelp() {
  console.log(`BNA execution run tool

Usage:
  node scripts/bna-execution-run.mjs init [--id <run-id>] [--title <title>] [--force]
  node scripts/bna-execution-run.mjs status [--run <path>] [--root <repo-root>]
  node scripts/bna-execution-run.mjs validate [--run <path>] [--root <repo-root>]
  node scripts/bna-execution-run.mjs resume [--run <path>] [--root <repo-root>]
`);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    printHelp();
    process.exitCode = 2;
    return;
  }

  if (options.command === 'help') {
    printHelp();
    return;
  }

  if (options.command === 'init') {
    try {
      createRun(options);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
    return;
  }

  if (!['status', 'validate', 'resume'].includes(options.command)) {
    console.error(`Unknown command: ${options.command}`);
    printHelp();
    process.exitCode = 2;
    return;
  }

  const result = validateExecutionRun(options.root, options.run);
  const ok = options.command === 'resume' ? printResume(result) : printValidation(result);
  process.exitCode = ok ? 0 : 1;
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  main();
}
