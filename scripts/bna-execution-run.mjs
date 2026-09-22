#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
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

const BLOCKER_STATUSES = new Set(['blocked', 'needs_operator_decision']);

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
  'BATCH-STATUS.md',
  'run.json'
];

const STRUCTURED_REQUIREMENT_FIELDS = [
  'source_id',
  'source_statement_ids',
  'source_path',
  'workspace_key',
  'project_key',
  'owner',
  'category',
  'priority',
  'batch_id',
  'depends_on',
  'implementation_status',
  'can_continue_without_operator',
  'next_action',
  'acceptance_criteria',
  'evidence',
  'verification',
  'implementation_files',
  'deployment_required',
  'updated_at'
];

const OPTIONAL_STRUCTURED_REQUIREMENT_FIELDS = [
  'blocker',
  'blocker_owner',
  'blocker_next_action',
  'implementation_commit',
  'pushed_commit',
  'pull_request',
  'deployment_id',
  'deployed_commit',
  'live_smoke',
  'superseded_by'
];

const DOCUMENTATION_ONLY_CATEGORIES = new Set([
  'audit',
  'backlog',
  'documentation',
  'deployment_readiness',
  'evidence',
  'preflight',
  'protocol',
  'reconciliation',
  'run_control'
]);

const IMPLEMENTATION_FILE_PREFIXES = [
  'migrations/',
  'package.json',
  'public/',
  'railway',
  'scripts/',
  'server.js',
  'src/',
  'tests/'
];

const INTERNAL_HANDOFF_PREFIXES = [
  'ops/execution-runs/',
  'ops/system-audits/',
  'ops/ui-audits/',
  'ops/watchdog-audits/',
  'raw-input/',
  'tasks-pending/'
];

const DEFAULT_BLOCKER =
  'Waiting for user to upload agent-review-package.zip or audit output path';

const SOURCE_EXCLUSION_CLASSIFICATIONS = new Set([
  'excluded',
  'unrelated',
  'non_requirement',
  'context_only',
  'duplicate',
  'archived'
]);

const DEPLOYMENT_PLACEHOLDER_PATTERN =
  /\b(not deployed|deployment withheld|intentionally withheld|operator rule|no deployment|deployment skipped|dry-run only|not run)\b/i;

const DEPLOYMENT_PROOF_PATTERN =
  /\b(railway deployment|deployment .*success|reached success|live smoke|live-smoke|smoke .*pass|ops\/live-smokes\/|production .*verified|https?:\/\/)\b/i;

const REPO_EVIDENCE_PREFIXES = [
  'AGENTS.md',
  'BNA-START-HERE.md',
  'MEMORY.md',
  'PROJECT-NOTES.md',
  'README.md',
  'SYSTEM-STATE.md',
  'TASKS.md',
  'docs/',
  'memory/',
  'ops/',
  'package.json',
  'public/',
  'railway',
  'raw-input/',
  'scripts/',
  'server.js',
  'src/',
  'tasks-pending/',
  'templates/',
  'tests/'
];

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

function nonEmptyText(value) {
  return String(value || '').trim().length > 0;
}

function textArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

function textValues(value) {
  if (Array.isArray(value)) {
    return textArray(value);
  }
  const text = String(value || '').trim();
  return text ? [text] : [];
}

function hasOwn(object, field) {
  return Object.prototype.hasOwnProperty.call(object || {}, field);
}

function normalizeRepoPath(value) {
  return String(value || '').trim().replace(/^`|`$/g, '').replaceAll('\\', '/');
}

function isClosedStatus(status) {
  return CLOSED_STATUSES.has(status);
}

function isWorkRemainingStatus(status) {
  return WORK_REMAINS_STATUSES.has(status);
}

function hasImplementationFile(files = []) {
  return textArray(files).some((filePath) => {
    const normalized = normalizeRepoPath(filePath);
    return IMPLEMENTATION_FILE_PREFIXES.some(
      (prefix) => normalized === prefix || normalized.startsWith(prefix)
    );
  });
}

function isInternalHandoffPath(value) {
  const normalized = normalizeRepoPath(value);
  return INTERNAL_HANDOFF_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(prefix)
  );
}

function canonicalTaskKey(row = {}) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return '';
  }
  const direct =
    row.canonical_task_id ||
    row.canonical_task_key ||
    row.canonical_key ||
    row.duplicate_fingerprint ||
    row.fingerprint;
  if (nonEmptyText(direct)) {
    return String(direct).trim();
  }

  const parts = [
    row.workspace_key,
    row.project_key,
    row.source_id || row.related_raw_id,
    row.source_statement_id || row.source_statement,
    row.canonical_action || row.action || row.title,
    row.related_entity || row.related_record_id || row.target_file || row.target_route,
    row.requirement_id
  ].map((part) => String(part || '').trim().toLowerCase());

  if (parts.filter(Boolean).length < 4) {
    return '';
  }

  return parts.join('|');
}

function isNonEmptyFile(filePath) {
  return fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').trim().length > 0;
}

function relativeTo(root, target) {
  return path.relative(root, target).replaceAll(path.sep, '/');
}

function runGit(root, args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

function isGitAncestor(root, ancestor, descendant) {
  if (!ancestor || !descendant) return false;
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
      cwd: root,
      stdio: ['ignore', 'ignore', 'ignore']
    });
    return true;
  } catch {
    return false;
  }
}

function extractRepoEvidencePath(root, value) {
  const text = String(value || '').trim().replace(/^`|`$/g, '');
  if (!text || /^https?:\/\//i.test(text) || text.startsWith('.secrets/')) {
    return null;
  }

  const match = text.match(/^([A-Za-z]:[\\/][^\s]+|[A-Za-z0-9_.\-\\/]+)(?:\s|$)/);
  if (!match) {
    return null;
  }

  const rawCandidate = match[1].replace(/[;:,.>)]+$/g, '').replaceAll('\\', '/');
  if (!rawCandidate || rawCandidate.includes('*') || rawCandidate.includes('..')) {
    return null;
  }

  if (/^[A-Za-z]:\//.test(rawCandidate)) {
    const absolute = path.resolve(rawCandidate);
    const relative = path.relative(root, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }
    return { display: rawCandidate, absolute };
  }

  const isKnownRepoPath = REPO_EVIDENCE_PREFIXES.some(
    (prefix) => rawCandidate === prefix || rawCandidate.startsWith(prefix)
  );
  if (!isKnownRepoPath) {
    return null;
  }

  return {
    display: rawCandidate,
    absolute: path.resolve(root, rawCandidate)
  };
}

function validateEvidencePaths(requirement, root, errors) {
  const entries = textArray(requirement.evidence);
  if (requirement.live_required && LIVE_CLOSED_STATUSES.has(requirement.status)) {
    entries.push(...textArray(requirement.deployment_evidence));
  }

  for (const entry of entries) {
    const candidate = extractRepoEvidencePath(root, entry);
    if (candidate && !fs.existsSync(candidate.absolute)) {
      errors.push(`${requirement.id}: evidence path does not exist: ${candidate.display}`);
    }
  }
}

function validateDeploymentEvidence(requirement, errors) {
  const requiresDeployment = Boolean(requirement.live_required || requirement.deployment_required);
  if (!requiresDeployment || !LIVE_CLOSED_STATUSES.has(requirement.status)) {
    return;
  }

  const deploymentEntries = [
    ...textArray(requirement.deployment_evidence),
    ...textValues(requirement.live_smoke),
    ...textValues(requirement.deployment_id),
    ...textValues(requirement.deployed_commit)
  ];
  if (!deploymentEntries.length) {
    errors.push(`${requirement.id}: live-required closed requirement requires deployment/live evidence.`);
    return;
  }

  const positiveEntries = deploymentEntries.filter((entry) => DEPLOYMENT_PROOF_PATTERN.test(entry));
  const onlyPlaceholders = deploymentEntries.every((entry) =>
    DEPLOYMENT_PLACEHOLDER_PATTERN.test(entry)
  );

  if (!positiveEntries.length || onlyPlaceholders) {
    errors.push(
      `${requirement.id}: deployment/live evidence must include positive deploy or live-smoke proof, not only withheld/not-deployed text.`
    );
  }
}

function validateDeploymentCommitOrder(root, requirement, errors, warnings) {
  if (!LIVE_CLOSED_STATUSES.has(requirement.status)) {
    return;
  }

  const implementationCommit = String(requirement.implementation_commit || '').trim();
  const deployedCommit = String(requirement.deployed_commit || '').trim();
  if (!implementationCommit || !deployedCommit) {
    return;
  }

  try {
    execFileSync('git', ['merge-base', '--is-ancestor', implementationCommit, deployedCommit], {
      cwd: root,
      stdio: 'ignore'
    });
  } catch (error) {
    const implementationExists = runGit(root, ['cat-file', '-e', `${implementationCommit}^{commit}`]);
    const deployedExists = runGit(root, ['cat-file', '-e', `${deployedCommit}^{commit}`]);
    if (implementationExists === null || deployedExists === null) {
      warnings.push(
        `${requirement.id}: could not verify implementation/deployed commit order because one commit is unavailable locally.`
      );
      return;
    }
    errors.push(
      `${requirement.id}: deployment evidence references deployed_commit ${deployedCommit}, which does not contain implementation_commit ${implementationCommit}.`
    );
  }
}

function validateActiveRunUniqueness(root, selectedRunDir, errors) {
  const runsDir = path.join(root, 'ops', 'execution-runs');
  if (!fs.existsSync(runsDir)) {
    return;
  }

  const activeRuns = [];
  for (const entry of fs.readdirSync(runsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const runJsonPath = path.join(runsDir, entry.name, 'run.json');
    if (!fs.existsSync(runJsonPath)) {
      continue;
    }
    const localErrors = [];
    const runJson = readJson(runJsonPath, localErrors, 'run.json');
    if (runJson?.active) {
      activeRuns.push(path.join(runsDir, entry.name));
    }
  }

  if (activeRuns.length > 1) {
    errors.push(
      `Multiple active execution runs found: ${activeRuns
        .map((runDir) => relativeTo(root, runDir))
        .join(', ')}.`
    );
  }

  if (selectedRunDir && activeRuns.length === 1 && path.resolve(activeRuns[0]) !== path.resolve(selectedRunDir)) {
    errors.push(
      `latest.json selected ${relativeTo(root, selectedRunDir)}, but active run is ${relativeTo(
        root,
        activeRuns[0]
      )}.`
    );
  }
}

function validateGitRefs(root, requirementsDoc, runJson, errors, warnings) {
  const refs = requirementsDoc?.git_refs || runJson?.git_refs;
  if (!refs || typeof refs !== 'object' || Array.isArray(refs)) {
    return;
  }

  const expectedBranch = refs.expected_branch || refs.branch || refs.current_branch || null;
  const expectedHead = refs.expected_head || refs.head || refs.current_head || null;
  const expectedRemoteHead =
    refs.expected_remote_head || refs.remote_head || refs.current_remote_head || null;
  const remoteBranch = refs.remote_branch || refs.pr_branch || null;

  if (refs.expected_branch && refs.current_branch && refs.expected_branch !== refs.current_branch) {
    errors.push(`git_refs: stale branch reference ${refs.current_branch}; expected ${refs.expected_branch}.`);
  }
  if (refs.expected_head && refs.current_head && refs.expected_head !== refs.current_head) {
    errors.push(`git_refs: stale head reference ${refs.current_head}; expected ${refs.expected_head}.`);
  }
  if (
    refs.expected_remote_head &&
    refs.current_remote_head &&
    refs.expected_remote_head !== refs.current_remote_head
  ) {
    errors.push(
      `git_refs: stale remote head reference ${refs.current_remote_head}; expected ${refs.expected_remote_head}.`
    );
  }

  const actualBranch = runGit(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (expectedBranch && actualBranch && actualBranch !== expectedBranch) {
    errors.push(`git_refs: branch ${expectedBranch} is stale; current branch is ${actualBranch}.`);
  } else if (expectedBranch && !actualBranch) {
    warnings.push('git_refs: could not verify current branch because git is unavailable.');
  }

  const actualHead = runGit(root, ['rev-parse', 'HEAD']);
  if (expectedHead && actualHead && actualHead !== expectedHead) {
    const correctiveCommits = textArray(refs.existing_corrective_commits || refs.corrective_commits);
    if (correctiveCommits.includes(expectedHead) && isGitAncestor(root, expectedHead, actualHead)) {
      warnings.push(
        `git_refs: recorded head ${expectedHead} is an earlier corrective commit; current head is ${actualHead}.`
      );
    } else {
      errors.push(`git_refs: head ${expectedHead} is stale; current head is ${actualHead}.`);
    }
  } else if (expectedHead && !actualHead) {
    warnings.push('git_refs: could not verify current HEAD because git is unavailable.');
  }

  const actualRemoteHead = remoteBranch
    ? runGit(root, ['rev-parse', `origin/${remoteBranch}`])
    : runGit(root, ['rev-parse', '@{u}']);
  if (expectedRemoteHead && actualRemoteHead && actualRemoteHead !== expectedRemoteHead) {
    errors.push(
      `git_refs: remote head ${expectedRemoteHead} is stale; upstream head is ${actualRemoteHead}.`
    );
  } else if (expectedRemoteHead && !actualRemoteHead) {
    warnings.push('git_refs: could not verify upstream HEAD because no upstream is configured.');
  }

  if (refs.pr_number && refs.pr_url && !new RegExp(`/pull/${refs.pr_number}(?:\\b|$)`).test(refs.pr_url)) {
    errors.push(`git_refs: PR URL does not match pr_number ${refs.pr_number}.`);
  }

  if (refs.pr_head_branch && refs.pr_branch && refs.pr_head_branch !== refs.pr_branch) {
    errors.push(`git_refs: stale PR branch reference ${refs.pr_head_branch}; expected ${refs.pr_branch}.`);
  }
}

function matrixDefinitions(requirementsDoc) {
  const definitions = [];
  if (requirementsDoc?.source_statement_matrix) {
    definitions.push(requirementsDoc.source_statement_matrix);
  }
  if (Array.isArray(requirementsDoc?.source_statement_matrices)) {
    definitions.push(...requirementsDoc.source_statement_matrices);
  }
  return definitions.map((definition) =>
    typeof definition === 'string' ? { path: definition } : definition
  );
}

function validateSourceRegistry(root, requirementsDoc, sourceMetadataRequired, errors) {
  const sourceIds = new Set();
  if (requirementsDoc?.sources !== undefined && !Array.isArray(requirementsDoc.sources)) {
    errors.push('requirements.json sources must be an array when present.');
    return sourceIds;
  }

  const sources = Array.isArray(requirementsDoc?.sources) ? requirementsDoc.sources : [];
  if (sourceMetadataRequired && !sources.length) {
    errors.push('requirements.json sources must define metadata for captured source statements.');
  }

  for (const [index, source] of sources.entries()) {
    const label = source?.source_id || `sources[${index}]`;
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      errors.push(`sources[${index}] must be an object.`);
      continue;
    }

    if (!nonEmptyText(source.source_id)) {
      errors.push(`${label}: source_id is required.`);
    } else if (sourceIds.has(source.source_id)) {
      errors.push(`${label}: duplicate source_id.`);
    } else {
      sourceIds.add(source.source_id);
    }

    if (!nonEmptyText(source.source_path) && !nonEmptyText(source.connector_id)) {
      errors.push(`${label}: source_path or connector_id is required.`);
    }
    for (const field of [
      'captured_at',
      'content_fingerprint',
      'privacy_classification',
      'workspace',
      'project',
      'source_type'
    ]) {
      if (!nonEmptyText(source[field])) {
        errors.push(`${label}: ${field} is required.`);
      }
    }

    if (nonEmptyText(source.source_path)) {
      const sourcePath = extractRepoEvidencePath(root, source.source_path);
      if (sourcePath && !fs.existsSync(sourcePath.absolute)) {
        errors.push(`${label}: source_path does not exist: ${sourcePath.display}`);
      }
    }
  }

  return sourceIds;
}

function normalizeSourceStatement(row, fallbackSourceId = '') {
  return {
    statement_id: row?.statement_id || row?.id || '',
    source_id: row?.source_id || fallbackSourceId || '',
    source_statement: row?.source_statement || row?.statement || row?.text || '',
    requirement_id: row?.requirement_id || row?.mapped_requirement_id || '',
    existing_requirement_id: row?.existing_requirement_id || '',
    classification: row?.classification || row?.mapping_classification || '',
    raw: row
  };
}

function validateSourceStatements(root, requirementsDoc, requirementIds, sourceIds, errors) {
  const statements = [];
  const definitions = matrixDefinitions(requirementsDoc);

  if (
    requirementsDoc?.source_statements !== undefined &&
    !Array.isArray(requirementsDoc.source_statements)
  ) {
    errors.push('requirements.json source_statements must be an array when present.');
  } else if (Array.isArray(requirementsDoc?.source_statements)) {
    statements.push(...requirementsDoc.source_statements.map((row) => normalizeSourceStatement(row)));
  }

  for (const definition of definitions) {
    const matrixPath = definition?.path || definition?.file || '';
    if (!nonEmptyText(matrixPath)) {
      errors.push('source statement matrix definition requires path.');
      continue;
    }

    const absoluteMatrixPath = path.resolve(root, matrixPath);
    if (!fs.existsSync(absoluteMatrixPath)) {
      errors.push(`source statement matrix is missing: ${matrixPath}`);
      continue;
    }

    const matrixDoc = readJson(absoluteMatrixPath, errors, `source statement matrix ${matrixPath}`);
    if (!matrixDoc) {
      continue;
    }

    const rows = Array.isArray(matrixDoc.matrix)
      ? matrixDoc.matrix
      : Array.isArray(matrixDoc.rows)
        ? matrixDoc.rows
        : Array.isArray(matrixDoc.source_statements)
          ? matrixDoc.source_statements
          : null;

    if (!rows) {
      errors.push(`source statement matrix ${matrixPath} must include matrix, rows, or source_statements array.`);
      continue;
    }

    const fallbackSourceId = definition.source_id || matrixDoc.raw_id || '';
    statements.push(...rows.map((row) => normalizeSourceStatement(row, fallbackSourceId)));
  }

  const seenStatements = new Set();
  for (const [index, statement] of statements.entries()) {
    const label = statement.statement_id || `source_statements[${index}]`;
    if (!nonEmptyText(statement.statement_id)) {
      errors.push(`${label}: statement_id is required.`);
    } else if (seenStatements.has(statement.statement_id)) {
      errors.push(`${label}: duplicate source statement id.`);
    } else {
      seenStatements.add(statement.statement_id);
    }

    if (!nonEmptyText(statement.source_statement)) {
      errors.push(`${label}: source_statement is required.`);
    }

    if (sourceIds.size && !sourceIds.has(statement.source_id)) {
      errors.push(`${label}: source_id ${statement.source_id || '(missing)'} is not registered in sources.`);
    }

    const mappedRequirementId = statement.requirement_id || statement.existing_requirement_id;
    const classification = String(statement.classification || '').trim().toLowerCase();
    const excluded = SOURCE_EXCLUSION_CLASSIFICATIONS.has(classification);

    if (!mappedRequirementId && !excluded) {
      errors.push(`${label}: captured source statement is unmapped.`);
    }

    if (mappedRequirementId && !requirementIds.has(mappedRequirementId)) {
      errors.push(`${label}: maps to unknown requirement id ${mappedRequirementId}.`);
    }
  }
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

function validateRequirement(requirement, index, seenIds, errors, root) {
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

  for (const field of STRUCTURED_REQUIREMENT_FIELDS) {
    if (!hasOwn(requirement, field)) {
      errors.push(`${label}: structured requirement field ${field} is required.`);
    }
  }

  for (const field of OPTIONAL_STRUCTURED_REQUIREMENT_FIELDS) {
    if (!hasOwn(requirement, field)) {
      continue;
    }
    if (field === 'superseded_by' && requirement.status === 'superseded' && !nonEmptyText(requirement[field])) {
      errors.push(`${label}: superseded requirements require superseded_by.`);
    }
  }

  for (const arrayField of [
    'source_statement_ids',
    'depends_on',
    'acceptance_criteria',
    'evidence',
    'verification',
    'implementation_files'
  ]) {
    if (hasOwn(requirement, arrayField) && !Array.isArray(requirement[arrayField])) {
      errors.push(`${label}: ${arrayField} must be an array.`);
    }
  }

  if (
    hasOwn(requirement, 'can_continue_without_operator') &&
    typeof requirement.can_continue_without_operator !== 'boolean'
  ) {
    errors.push(`${label}: can_continue_without_operator must be boolean.`);
  }

  if (hasOwn(requirement, 'deployment_required') && typeof requirement.deployment_required !== 'boolean') {
    errors.push(`${label}: deployment_required must be boolean.`);
  }

  if (root && nonEmptyText(requirement.source_path)) {
    const sourcePath = extractRepoEvidencePath(root, requirement.source_path);
    if (sourcePath && !fs.existsSync(sourcePath.absolute)) {
      errors.push(`${label}: source_path does not exist: ${sourcePath.display}`);
    }
  }

  if (!VALID_STATUSES.has(requirement.status)) {
    errors.push(`${label}: invalid status "${requirement.status}".`);
    return;
  }

  if (BLOCKER_STATUSES.has(requirement.status)) {
    if (!String(requirement.blocker || '').trim()) {
      errors.push(`${label}: ${requirement.status} requirements require blocker.`);
    }
    if (!String(requirement.blocker_owner || '').trim()) {
      errors.push(`${label}: ${requirement.status} requirements require blocker_owner.`);
    }
    if (!String(requirement.blocker_next_action || requirement.next_action || '').trim()) {
      errors.push(`${label}: ${requirement.status} requirements require blocker_next_action or next_action.`);
    }
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

  if (root && CLOSED_STATUSES.has(requirement.status)) {
    validateEvidencePaths(requirement, root, errors);
  }

  validateDeploymentEvidence(requirement, errors);
}

function validateRequirementRelationships(root, requirements, errors, warnings) {
  const byId = new Map();
  for (const requirement of requirements) {
    if (requirement?.id) {
      byId.set(requirement.id, requirement);
    }
  }

  for (const requirement of requirements) {
    if (!requirement || typeof requirement !== 'object' || Array.isArray(requirement)) {
      continue;
    }

    const dependsOn = textArray(requirement.depends_on);
    for (const dependencyId of dependsOn) {
      const dependency = byId.get(dependencyId);
      if (!dependency) {
        errors.push(`${requirement.id}: depends_on references unknown requirement ${dependencyId}.`);
        continue;
      }
      if (isClosedStatus(requirement.status) && !isClosedStatus(dependency.status)) {
        errors.push(
          `${requirement.id}: cannot be ${requirement.status} while dependency ${dependencyId} is ${dependency.status}.`
        );
      }
    }

    if (
      LIVE_CLOSED_STATUSES.has(requirement.status) &&
      (requirement.live_required || requirement.deployment_required) &&
      nonEmptyText(requirement.implementation_commit) &&
      !nonEmptyText(requirement.pushed_commit)
    ) {
      errors.push(`${requirement.id}: app-visible closed requirement has implementation_commit but no pushed_commit.`);
    }

    const category = String(requirement.category || '').trim().toLowerCase();
    const docOnlyAllowed = DOCUMENTATION_ONLY_CATEGORIES.has(category);
    const implementationFiles = textArray(requirement.implementation_files);
    const docOnlyImplementation =
      implementationFiles.length > 0 && !hasImplementationFile(implementationFiles);
    const looksLikeImplementation =
      requirement.live_required ||
      requirement.deployment_required ||
      /implement|portal|ui|server|api|cleanup|roles|users|communications|email|whatsapp|zoom|vimeo|task|decision/i.test(
        `${requirement.category || ''} ${requirement.title || ''}`
      );

    if (
      LIVE_CLOSED_STATUSES.has(requirement.status) &&
      looksLikeImplementation &&
      docOnlyImplementation &&
      !docOnlyAllowed
    ) {
      errors.push(`${requirement.id}: implementation requirement contains documentation/evidence files only.`);
    }

    if (
      requirement.live_required &&
      LIVE_CLOSED_STATUSES.has(requirement.status) &&
      /local(ly)?\s+(complete|verified|done).*live|live.*local(ly)?\s+(complete|verified|done)/i.test(
        [...textArray(requirement.evidence), String(requirement.implementation_status || '')].join(' ')
      )
    ) {
      errors.push(`${requirement.id}: local implementation is described as live completion.`);
    }

    validateDeploymentCommitOrder(root, requirement, errors, warnings);
  }
}

function validateCanonicalTasks(requirementsDoc, errors) {
  const taskGroups = [];
  if (Array.isArray(requirementsDoc?.tasks)) {
    taskGroups.push(...requirementsDoc.tasks.map((task) => ({ task, source: 'tasks' })));
  }
  if (Array.isArray(requirementsDoc?.canonical_tasks)) {
    taskGroups.push(...requirementsDoc.canonical_tasks.map((task) => ({ task, source: 'canonical_tasks' })));
  }

  const seen = new Map();
  for (const [index, { task, source }] of taskGroups.entries()) {
    const key = canonicalTaskKey(task);
    if (key) {
      if (seen.has(key)) {
        errors.push(
          `${source}[${index}]: duplicate canonical task key ${key}; first seen at ${seen.get(key)}.`
        );
      } else {
        seen.set(key, `${source}[${index}]`);
      }
    }

    const visible =
      task?.visible === true ||
      task?.user_visible === true ||
      task?.default_visible === true ||
      task?.target_lane === 'tasks' ||
      task?.lane === 'tasks';
    const pathValues = [
      task?.source_path,
      task?.related_path,
      task?.handoff_path,
      task?.evidence_path,
      ...(Array.isArray(task?.evidence_paths) ? task.evidence_paths : [])
    ];
    if (visible && pathValues.some((value) => isInternalHandoffPath(value))) {
      errors.push(`${source}[${index}]: internal handoff file appears as a visible user Task.`);
    }
  }
}

export function validateExecutionRun(rootInput = process.cwd(), runInput = null) {
  const context = resolveRunContext(rootInput, runInput);
  const errors = [...context.errors];
  const warnings = [];

  if (!context.runDir || errors.length) {
    return { ...context, errors, warnings, requirements: [], counts: {}, workRemains: false };
  }

  validateActiveRunUniqueness(context.root, context.runDir, errors);

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

  validateGitRefs(context.root, requirementsDoc, runJson, errors, warnings);

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
    validateRequirement(requirement, index, seenIds, errors, context.root);
  });
  validateRequirementRelationships(context.root, requirements, errors, warnings);
  validateCanonicalTasks(requirementsDoc, errors);

  const sourceMetadataRequired =
    Boolean(requirementsDoc) &&
    (Array.isArray(requirementsDoc.source_statements) ||
      matrixDefinitions(requirementsDoc).length > 0);
  const sourceIds = validateSourceRegistry(
    context.root,
    requirementsDoc,
    sourceMetadataRequired,
    errors
  );
  if (requirementsDoc) {
    validateSourceStatements(context.root, requirementsDoc, seenIds, sourceIds, errors);
  }

  const workRemains = requirements.some((requirement) =>
    WORK_REMAINS_STATUSES.has(requirement.status)
  );
  const nextSessionPath = path.join(context.runDir, 'NEXT-SESSION.md');
  if (workRemains && !isNonEmptyFile(nextSessionPath)) {
    errors.push('NEXT-SESSION.md is required and must be non-empty while work remains.');
  } else if (workRemains) {
    const nextSessionText = fs.readFileSync(nextSessionPath, 'utf8');
    const openRequirementIds = requirements
      .filter((requirement) => WORK_REMAINS_STATUSES.has(requirement.status))
      .map((requirement) => requirement.id)
      .filter(Boolean);
    if (
      openRequirementIds.length &&
      !openRequirementIds.some((requirementId) => nextSessionText.includes(requirementId))
    ) {
      errors.push('NEXT-SESSION.md is stale: it must name at least one open requirement ID.');
    }
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

function dependenciesAreClosed(requirement, requirementsById) {
  return textArray(requirement.depends_on).every((dependencyId) => {
    const dependency = requirementsById.get(dependencyId);
    return dependency && isClosedStatus(dependency.status);
  });
}

function nextUnblockedRequirement(requirements) {
  const requirementsById = new Map(
    requirements.filter((requirement) => requirement?.id).map((requirement) => [requirement.id, requirement])
  );

  return requirements.find((requirement) => {
    if (!requirement || !isWorkRemainingStatus(requirement.status)) {
      return false;
    }
    if (BLOCKER_STATUSES.has(requirement.status)) {
      return false;
    }
    if (requirement.can_continue_without_operator === false) {
      return false;
    }
    return dependenciesAreClosed(requirement, requirementsById);
  });
}

function approvalGatedRequirements(requirements) {
  return requirements.filter((requirement) => {
    if (!requirement || !isWorkRemainingStatus(requirement.status)) {
      return false;
    }
    if (BLOCKER_STATUSES.has(requirement.status)) {
      return false;
    }
    return requirement.can_continue_without_operator === false;
  });
}

function printApprovalGatedRequirements(requirements) {
  const gated = approvalGatedRequirements(requirements);
  if (!gated.length) {
    return;
  }

  console.log('\nApproval-gated open requirements:');
  for (const requirement of gated) {
    console.log(`- ${requirement.id} ${requirement.status}: ${requirement.title}`);
    console.log(`  owner: ${requirement.blocker_owner || requirement.owner || '(missing)'}`);
    console.log(`  blocker: ${requirement.blocker || requirement.next_action || '(missing)'}`);
    console.log(
      `  next_action: ${requirement.blocker_next_action || requirement.next_action || '(missing)'}`
    );
  }
}

function printNext(result) {
  const ok = printValidation(result);
  if (!ok) {
    return false;
  }

  const next = nextUnblockedRequirement(result.requirements);
  if (!next) {
    console.log('\nNext unblocked executable batch: none');
    printApprovalGatedRequirements(result.requirements);
    return true;
  }

  console.log('\nNext unblocked executable batch:');
  console.log(`- batch_id: ${next.batch_id || '(none)'}`);
  console.log(`- requirement: ${next.id} ${next.status}: ${next.title}`);
  if (next.next_action) {
    console.log(`- next_action: ${next.next_action}`);
  }
  return true;
}

function printExternalBlockers(result) {
  const ok = printValidation(result);
  if (!ok) {
    return false;
  }

  const blockers = result.requirements.filter((requirement) => BLOCKER_STATUSES.has(requirement.status));
  console.log('\nRemaining external blockers:');
  if (!blockers.length && !approvalGatedRequirements(result.requirements).length) {
    console.log('- none');
    return true;
  }

  for (const requirement of blockers) {
    console.log(`- ${requirement.id}: ${requirement.title}`);
    console.log(`  owner: ${requirement.blocker_owner || '(missing)'}`);
    console.log(`  blocker: ${requirement.blocker || '(missing)'}`);
    console.log(`  next_action: ${requirement.blocker_next_action || requirement.next_action || '(missing)'}`);
  }
  printApprovalGatedRequirements(result.requirements);
  return true;
}

function sourceCoverage(requirementsDoc = {}) {
  const counts = new Map();
  const statements = Array.isArray(requirementsDoc.source_statements)
    ? requirementsDoc.source_statements
    : [];
  for (const statement of statements) {
    const classification = String(statement.classification || 'unclassified').trim() || 'unclassified';
    counts.set(classification, (counts.get(classification) || 0) + 1);
  }
  return { statements, counts };
}

function printSourceCoverage(result) {
  const ok = printValidation(result);
  if (!ok) {
    return false;
  }

  const requirementsPath = path.join(result.runDir, 'requirements.json');
  const localErrors = [];
  const requirementsDoc = readJson(requirementsPath, localErrors, 'requirements.json') || {};
  const coverage = sourceCoverage(requirementsDoc);
  console.log('\nSource coverage report:');
  console.log(`- source statements: ${coverage.statements.length}`);
  for (const [classification, count] of [...coverage.counts.entries()].sort()) {
    console.log(`- ${classification}: ${count}`);
  }
  const unmapped = coverage.statements.filter((statement) => {
    const mappedRequirementId =
      statement.requirement_id || statement.existing_requirement_id || statement.mapped_requirement_id;
    const classification = String(statement.classification || '').trim().toLowerCase();
    return !mappedRequirementId && !SOURCE_EXCLUSION_CLASSIFICATIONS.has(classification);
  });
  console.log(`- unmapped executable statements: ${unmapped.length}`);
  return true;
}

function printStaleEvidence(result) {
  const staleErrors = result.errors.filter((error) =>
    /evidence path does not exist|deployment\/live evidence|withheld\/not-deployed|local implementation is described as live|stale|older|does not contain implementation_commit/i.test(
      error
    )
  );

  if (!staleErrors.length) {
    const ok = printValidation(result);
    if (!ok) {
      return false;
    }
    console.log('\nStale evidence detection: none');
    return true;
  }

  printValidation(result);
  console.log('\nStale evidence detection:');
  for (const error of staleErrors) {
    console.log(`- ${error}`);
  }
  return false;
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
    'BATCH-STATUS.md': `# Batch Status\n\nRecord each batch, requirement ID, status, and next action.\n`,
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
  const next = nextUnblockedRequirement(result.requirements);
  if (next) {
    console.log('\nNext unblocked executable batch:');
    console.log(`- ${next.batch_id || '(none)'} / ${next.id}: ${next.title}`);
    console.log(`- next_action: ${next.next_action || '(none)'}`);
  } else {
    console.log('\nNext unblocked executable batch: none');
    printApprovalGatedRequirements(result.requirements);
  }

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
  node scripts/bna-execution-run.mjs next [--run <path>] [--root <repo-root>]
  node scripts/bna-execution-run.mjs blockers [--run <path>] [--root <repo-root>]
  node scripts/bna-execution-run.mjs source-coverage [--run <path>] [--root <repo-root>]
  node scripts/bna-execution-run.mjs stale-evidence [--run <path>] [--root <repo-root>]
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

  const validationCommands = new Set([
    'status',
    'validate',
    'resume',
    'next',
    'next-batch',
    'blockers',
    'external-blockers',
    'source-coverage',
    'stale-evidence'
  ]);

  if (!validationCommands.has(options.command)) {
    console.error(`Unknown command: ${options.command}`);
    printHelp();
    process.exitCode = 2;
    return;
  }

  const result = validateExecutionRun(options.root, options.run);
  let ok;
  if (options.command === 'resume') {
    ok = printResume(result);
  } else if (options.command === 'next' || options.command === 'next-batch') {
    ok = printNext(result);
  } else if (options.command === 'blockers' || options.command === 'external-blockers') {
    ok = printExternalBlockers(result);
  } else if (options.command === 'source-coverage') {
    ok = printSourceCoverage(result);
  } else if (options.command === 'stale-evidence') {
    ok = printStaleEvidence(result);
  } else {
    ok = printValidation(result);
  }
  process.exitCode = ok ? 0 : 1;
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  main();
}
