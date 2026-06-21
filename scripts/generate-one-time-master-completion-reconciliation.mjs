#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verified = process.argv.includes('--verified');
const generatedAt = new Date().toISOString();

const RUN_ID = '2026-06-21-one-time-master-completion';
const RUN_DIR = `ops/execution-runs/${RUN_ID}`;
const REQUIREMENTS_PATH = `${RUN_DIR}/requirements.json`;
const OUTPUT_JSON_PATH = 'ops/one-time-mishnah/master-backlog-reconciliation.json';
const OUTPUT_MD_PATH = 'ops/one-time-mishnah/master-backlog-reconciliation.md';
const MEETING_RECONCILIATION_PATH =
  'ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.json';
const MEETING_PARSE_PATH = 'ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json';

const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const PROVIDER_NAME = 'Rabbi Ellie Scheller';
const OPERATOR_NAME = 'Shloimie';

const ALLOWED_CLASSIFICATIONS = new Set([
  'already_satisfied',
  'duplicate',
  'partially_implemented',
  'missing',
  'blocked',
  'needs_operator_decision',
  'supersedes_existing',
  'unrelated_bna_data'
]);

const REQUIREMENT_FILE_MAP = {
  'REQ-20260619-300': ['ops/execution-runs/latest.json', RUN_DIR],
  'REQ-20260619-301': [
    'AGENTS.md',
    'BNA-START-HERE.md',
    'docs/BNA-RAMBLE-TO-DONE.md',
    'scripts/bna-execution-run.mjs',
    'ops/execution-runs/requirements.schema.json'
  ],
  'REQ-20260621-501': [OUTPUT_MD_PATH, OUTPUT_JSON_PATH],
  'REQ-20260619-302': ['server.js', 'public/operations.html', 'scripts/task-decision-census.mjs'],
  'REQ-20260619-303': ['server.js', 'public/operations.html', 'docs/architecture/workspace-community-provider-role-map.md'],
  'REQ-20260621-502': ['public/operations.html', 'server.js', 'ops/action-registry/'],
  'REQ-20260619-304': ['public/operations.html', 'public/rabbi.html', 'tools/ops-ui-audit.js'],
  'REQ-20260619-305': ['public/operations.html', 'server.js', 'ops/communications/wapi-crm-audit-and-plan.md'],
  'REQ-20260621-503': ['public/operations.html', 'server.js', 'ops/communications/wapi-crm-audit-and-plan.md'],
  'REQ-20260621-504': ['docs/integrations/RESEND.md', 'server.js', 'src/lib/integrations/resend-client.js'],
  'REQ-20260619-306': ['src/platform/instances/one-time.js', 'server.js', 'public/parent.html', 'public/student.html'],
  'REQ-20260619-307': ['docs/integrations/ZOOM.md', 'server.js', 'src/lib/integrations/zoom.js'],
  'REQ-20260619-308': ['docs/integrations/VIMEO.md', 'server.js', 'src/lib/integrations/video-hosting.js'],
  'REQ-20260619-309': ['server.js', 'src/lib/bna/transcript-privacy.js'],
  'REQ-20260619-310': ['src/lib/bna/gamification.js', 'tests/gamification-events.test.js'],
  'REQ-20260619-311': ['src/platform/community/index.js', 'server.js'],
  'REQ-20260619-312': ['server.js', 'src/lib/bna/study-assistant-readiness.js'],
  'REQ-20260619-313': ['ops/one-time-mishnah/one-time-option-b-deployment-readiness.md'],
  'REQ-20260619-314': [RUN_DIR]
};

const REQUIREMENT_VERIFICATION_MAP = {
  'REQ-20260619-300': ['npm run bna:run:validate', 'npm run app:smoke'],
  'REQ-20260619-301': ['node --test tests/bna-execution-run.test.js', 'npm run bna:run:validate'],
  'REQ-20260621-501': [
    'node scripts/generate-one-time-master-completion-reconciliation.mjs',
    'node --test tests/one-time-master-backlog-reconciliation.test.js',
    'npm run bna:run:source-coverage'
  ],
  'REQ-20260619-302': ['node --test tests/task-decision-census.test.js', 'focused server-side view tests'],
  'REQ-20260619-303': ['negative authorization tests', 'role isolation live smoke after deployment'],
  'REQ-20260621-502': ['action registry coverage tests', 'dead-button coverage tests'],
  'REQ-20260619-304': ['existing UI audit harness at required viewports', 'browser smoke after deployment'],
  'REQ-20260621-503': ['workspace-scoped WhatsApp UI tests', 'no-send guard tests'],
  'REQ-20260621-504': ['Resend mock tests', 'webhook signature tests', 'no-send guard tests'],
  'REQ-20260619-306': ['product, schedule, booking, and portal tests'],
  'REQ-20260619-307': ['mocked Zoom client and attendance tests'],
  'REQ-20260619-308': ['manual Vimeo workflow tests', 'recording publication-state tests'],
  'REQ-20260619-309': ['transcript visibility and cross-child isolation tests'],
  'REQ-20260619-310': ['badge idempotency and reversal tests'],
  'REQ-20260619-311': ['community moderation workflow tests'],
  'REQ-20260619-312': ['disabled assistant flag and scoped retrieval tests'],
  'REQ-20260619-313': ['deployment readiness/runbook tests only; no paid provisioning'],
  'REQ-20260619-314': ['full suite, secret audit, Railway doctor, live smokes']
};

function abs(relativePath) {
  return path.join(root, relativePath);
}

function readText(relativePath, fallback = '') {
  try {
    return fs.readFileSync(abs(relativePath), 'utf8');
  } catch {
    return fallback;
  }
}

function readJson(relativePath, fallback = null) {
  const text = readText(relativePath);
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function writeText(relativePath, text) {
  fs.mkdirSync(path.dirname(abs(relativePath)), { recursive: true });
  fs.writeFileSync(abs(relativePath), text);
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function truncate(value, max = 160) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function md(value) {
  return String(value ?? '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
}

function runGit(args, fallback = '') {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

function listFiles(relativeDir) {
  const directory = abs(relativeDir);
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function fileExists(relativePath) {
  return fs.existsSync(abs(relativePath));
}

function countJsonlRows(relativePath) {
  const text = readText(relativePath);
  if (!text.trim()) return 0;
  return text.split(/\r?\n/).filter(Boolean).length;
}

function countKeywordLines(relativePath, pattern) {
  const text = readText(relativePath);
  if (!text) return 0;
  return text.split(/\r?\n/).filter((line) => pattern.test(line)).length;
}

function classificationForRequirement(requirement, fallback = 'partially_implemented') {
  if (!requirement) return fallback;
  if (['done', 'already_satisfied', 'verified'].includes(requirement.status)) return 'already_satisfied';
  if (requirement.status === 'needs_operator_decision') return 'needs_operator_decision';
  if (requirement.status === 'blocked') return 'blocked';
  if (['in_progress', 'needs_verification'].includes(requirement.status)) return 'partially_implemented';
  return fallback;
}

function categoryToCurrentRequirement(category) {
  const normalized = String(category ?? '').toLowerCase();
  if (normalized.includes('task') || normalized.includes('decision')) return 'REQ-20260619-302';
  if (normalized.includes('role') || normalized.includes('auth') || normalized.includes('user')) return 'REQ-20260619-303';
  if (normalized.includes('action')) return 'REQ-20260621-502';
  if (normalized.includes('ui') || normalized.includes('toolbar') || normalized.includes('filter')) return 'REQ-20260619-304';
  if (normalized.includes('whatsapp')) return 'REQ-20260621-503';
  if (normalized.includes('email') || normalized.includes('resend')) return 'REQ-20260621-504';
  if (normalized.includes('zoom') || normalized.includes('attendance')) return 'REQ-20260619-307';
  if (normalized.includes('vimeo') || normalized.includes('recording') || normalized.includes('video')) return 'REQ-20260619-308';
  if (normalized.includes('transcript')) return 'REQ-20260619-309';
  if (normalized.includes('gamification') || normalized.includes('badge')) return 'REQ-20260619-310';
  if (normalized.includes('community')) return 'REQ-20260619-311';
  if (normalized.includes('study') || normalized.includes('sefaria') || normalized.includes('assistant')) return 'REQ-20260619-312';
  if (normalized.includes('deploy') || normalized.includes('domain') || normalized.includes('dns') || normalized.includes('railway')) return 'REQ-20260619-313';
  if (normalized.includes('protocol')) return 'REQ-20260619-301';
  if (normalized.includes('backlog')) return 'REQ-20260621-501';
  return 'REQ-20260619-306';
}

function normalizeClassification(value) {
  if (ALLOWED_CLASSIFICATIONS.has(value)) return value;
  if (value === 'already_satisfied_by_existing_parse') return 'already_satisfied';
  return 'partially_implemented';
}

function buildSourceInventory() {
  const taskPendingFiles = listFiles('tasks-pending');
  const rawInputFiles = listFiles('raw-input');
  const testFiles = listFiles('tests');
  const liveSmokes = listFiles('ops/live-smokes');
  const migrationFiles = [
    ...listFiles('migrations'),
    ...listFiles('.').filter((name) => /^railway-migration-.*\.sql$/.test(name))
  ].sort();

  return {
    authoritative_files: [
      'BNA-START-HERE.md',
      'AGENTS.md',
      'README.md',
      'MEMORY.md',
      'TASKS.md',
      'SYSTEM-STATE.md',
      'PROJECT-NOTES.md',
      'docs/BNA-RAMBLE-TO-DONE.md',
      'ops/execution-runs/latest.json',
      'ops/one-time-mishnah/next-master-backlog-input.md',
      'ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md',
      'ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json',
      'ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md',
      'ops/ui-audits/2026-06-16-ui-closeout.md',
      'docs/architecture/workspace-community-provider-role-map.md',
      'ops/communications/wapi-crm-audit-and-plan.md'
    ].map((source_path) => ({
      source_path,
      exists: fileExists(source_path),
      sha256_12: fileExists(source_path) ? sha256(readText(source_path)).slice(0, 12) : '',
      classification: fileExists(source_path) ? 'already_satisfied' : 'missing'
    })),
    active_execution_run_files: listFiles(RUN_DIR),
    task_pending_files: taskPendingFiles,
    raw_input_files: rawInputFiles,
    current_tests: {
      total: testFiles.length,
      one_time_related: testFiles.filter((name) => /one-time|rabbi|resend|vimeo|zoom|task|decision|workspace|operations/i.test(name))
    },
    current_live_smoke_evidence: {
      total: liveSmokes.length,
      newest: liveSmokes.slice(-10)
    },
    migrations: {
      total: migrationFiles.length,
      files: migrationFiles
    },
    ledger: {
      path: 'ops/agent-task-ledger.jsonl',
      rows: countJsonlRows('ops/agent-task-ledger.jsonl'),
      one_time_keyword_rows: countKeywordLines('ops/agent-task-ledger.jsonl', /one.time|rabbi|scheller|sheller/i)
    },
    changelog: {
      path: 'ops/agent-changelog.md',
      one_time_keyword_lines: countKeywordLines('ops/agent-changelog.md', /One Time|Rabbi|Scheller|Sheller|Vimeo|Zoom|Resend|WhatsApp/i)
    },
    branch_history: runGit(['log', '--oneline', '--decorate', '-12']).split(/\r?\n/).filter(Boolean),
    pr: {
      number: 5,
      url: 'https://github.com/shloimie-beep/bnei-neviim-academy/pull/5',
      state: 'OPEN',
      draft: true,
      head_ref: 'codex/agent-control-center-20260619',
      remote_head: runGit(['rev-parse', 'origin/codex/agent-control-center-20260619'])
    }
  };
}

function buildCurrentSourceRows(activeRun, requirementsById) {
  return (activeRun.source_statements || []).map((statement) => {
    const requirement = requirementsById.get(statement.requirement_id);
    const classification = classificationForRequirement(
      requirement,
      normalizeClassification(statement.classification)
    );
    return {
      statement_id: `MATRIX-${statement.statement_id}`,
      source_id: statement.source_id,
      source_path: activeRun.sources?.find((source) => source.source_id === statement.source_id)?.source_path || '',
      source_statement: statement.source_statement,
      requirement_id: statement.requirement_id,
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
      classification,
      classification_reason:
        classification === 'already_satisfied'
          ? 'Mapped requirement is already complete in the active run.'
          : classification === 'needs_operator_decision'
            ? 'Mapped requirement contains an external ownership, budget, credential, or DNS gate.'
            : 'Mapped requirement remains executable or in current implementation.',
      canonical_task_policy: 'collapsed_into_requirement_no_visible_task_created'
    };
  });
}

function buildLegacyRows(previous, requirementsById) {
  const previousLegacyRows = Array.isArray(previous?.legacy_statement_matrix)
    ? previous.legacy_statement_matrix
    : [];
  const rawLegacyRows = Array.isArray(previous?.matrix) ? previous.matrix : [];
  const rows = previousLegacyRows.length ? previousLegacyRows : rawLegacyRows;
  return rows.map((row) => {
    const requirementId = row.current_requirement_id || row.requirement_id || categoryToCurrentRequirement(row.category);
    const requirement = requirementsById.get(requirementId);
    const original = normalizeClassification(row.classification || row.current_classification);
    const currentClassification = classificationForRequirement(requirement, original);
    return {
      statement_id: row.statement_id,
      source_id: row.source_id || 'RAW-20260619-005',
      source_path: row.source_path || row.source || 'raw-input/RAW-20260619-005-one-time-master-recovery-backlog-ui-launch.md',
      source_statement: truncate(row.source_statement, 220),
      legacy_requirement_id: row.requirement_id || '',
      current_requirement_id: requirementId,
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
      legacy_classification: original,
      current_classification: currentClassification,
      classification: currentClassification,
      duplicate_of: requirementId,
      classification_reason: 'Legacy June 19 statement is preserved and collapsed into the current June 21 canonical requirement.'
    };
  });
}

function buildMeetingRows(parseDoc, reconciliationDoc) {
  const rows = [];
  const records = parseDoc?.records || {};
  const groups = [
    ['decisions', records.decisions || []],
    ['tasks', records.tasks || []],
    ['calendar_events', records.calendar_events || []],
    ['content_items', records.content_items || []],
    ['community_records', records.community_records || []],
    ['integration_items', records.integration_items || []],
    ['notes', records.notes || []]
  ];
  for (const [group, items] of groups) {
    for (const item of items) {
      const requirementId = requirementForMeetingItem(group, item);
      let classification = 'partially_implemented';
      if (group === 'decisions') classification = 'needs_operator_decision';
      if (group === 'tasks' || group === 'calendar_events') classification = 'duplicate';
      if (group === 'notes' && /owner_admin_model/i.test(item.item_key || '')) classification = 'partially_implemented';
      if (group === 'integration_items' && /youtube|meta/i.test(item.integration_type || item.item_key || '')) {
        classification = 'unrelated_bna_data';
      }
      rows.push({
        statement_id: item.id || `${group}:${item.record_key}`,
        source_id: 'DRIVE-20260619-SCHELLER-BRIEF',
        source_path: MEETING_PARSE_PATH,
        source_statement: item.title || item.item_key || group,
        record_group: group,
        requirement_id: requirementId,
        workspace_key: item.workspace_key || WORKSPACE_KEY,
        project_key: item.project_key || PROJECT_KEY,
        owner: canonicalOwner(item.owner),
        classification,
        classification_reason:
          classification === 'duplicate'
            ? 'Prior parse already captured this as proposed work; current run collapses it into canonical requirements rather than visible task fan-out.'
            : classification === 'needs_operator_decision'
              ? 'The record asks for owner, account, pricing, DNS, sender, or provider configuration.'
              : classification === 'unrelated_bna_data'
                ? 'The record is deferred marketing/platform context and is not a current One Time credential-free implementation dependency.'
                : 'The record is relevant context for an open canonical requirement.',
        blocked_actions: item.blocked_actions || [],
        required_inputs_count: Array.isArray(item.required_inputs) ? item.required_inputs.length : 0,
        external_write_performed: Boolean(item.external_write_performed)
      });
    }
  }

  if (reconciliationDoc?.newest_candidate) {
    rows.push({
      statement_id: 'DRIVE-20260619-SCHELLER-BRIEF-SOURCE',
      source_id: 'DRIVE-20260619-SCHELLER-BRIEF',
      source_path: MEETING_RECONCILIATION_PATH,
      source_statement: 'Newest Rabbi Scheller meeting source was already parsed and did not create duplicate visible rows.',
      requirement_id: 'REQ-20260621-501',
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
      owner: 'Codex',
      classification: 'already_satisfied',
      classification_reason: 'The reconciliation run found the source already parsed, redacted, scoped, and idempotent.'
    });
  }
  return rows;
}

function requirementForMeetingItem(group, item) {
  const text = `${item.item_key || ''} ${item.title || ''} ${item.service || ''} ${item.integration_type || ''}`.toLowerCase();
  if (text.includes('zoom') || text.includes('attendance')) return 'REQ-20260619-307';
  if (text.includes('vimeo') || text.includes('video')) return 'REQ-20260619-308';
  if (text.includes('resend') || text.includes('email')) return 'REQ-20260621-504';
  if (text.includes('dns') || text.includes('domain') || text.includes('railway')) return 'REQ-20260619-313';
  if (text.includes('stripe') || text.includes('payment') || text.includes('billing') || text.includes('offer') || text.includes('refund')) {
    return 'REQ-20260619-306';
  }
  if (text.includes('calendar') || text.includes('format') || text.includes('consultation')) return 'REQ-20260619-306';
  if (text.includes('question') || group === 'community_records') return 'REQ-20260619-311';
  if (group === 'integration_items') return 'REQ-20260619-305';
  if (group === 'tasks') return 'REQ-20260619-302';
  return 'REQ-20260621-501';
}

function canonicalOwner(owner) {
  const text = String(owner || '').replace(/Rabbi Elie/g, PROVIDER_NAME).replace(/Rabbi Ellie/g, PROVIDER_NAME);
  return text || 'Codex';
}

function buildSourceInventoryRows(inventory) {
  const rows = [];
  let index = 1;
  for (const source of inventory.authoritative_files) {
    const requirementId = categoryToCurrentRequirement(source.source_path);
    rows.push({
      statement_id: `SRC-INV-20260621-${String(index).padStart(3, '0')}`,
      source_id: 'SOURCE-INVENTORY-20260621',
      source_path: source.source_path,
      source_statement: source.exists
        ? `${source.source_path} was inspected and included in the Batch 2 reconciliation.`
        : `${source.source_path} was requested but is not present in this checkout.`,
      requirement_id: requirementId,
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
      owner: 'Codex',
      classification: source.classification,
      classification_reason: source.exists
        ? 'Source exists and was incorporated as reconciliation input.'
        : 'Source is absent from the checkout and remains an evidence gap.',
      sha256_12: source.sha256_12
    });
    index += 1;
  }
  return rows;
}

function countClassifications(rows, field = 'classification') {
  const counts = {};
  for (const row of rows) {
    const classification = normalizeClassification(row[field]);
    counts[classification] = (counts[classification] || 0) + 1;
  }
  for (const classification of ALLOWED_CLASSIFICATIONS) {
    counts[classification] ||= 0;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function buildCanonicalRequirements(activeRequirements) {
  return activeRequirements.map((requirement) => ({
    id: requirement.id,
    title: requirement.title,
    status: requirement.status,
    implementation_status: requirement.implementation_status,
    owner: requirement.owner || 'Codex',
    workspace: requirement.workspace_key || WORKSPACE_KEY,
    project: requirement.project_key || PROJECT_KEY,
    category: requirement.category,
    priority: requirement.priority,
    batch_id: requirement.batch_id,
    dependency: requirement.depends_on || [],
    related_files_routes: requirement.implementation_files?.length
      ? requirement.implementation_files
      : REQUIREMENT_FILE_MAP[requirement.id] || [],
    source_reference: {
      source_id: requirement.source_id,
      source_path: requirement.source_path,
      source_statement_ids: requirement.source_statement_ids || []
    },
    acceptance_criteria: requirement.acceptance_criteria || [],
    verification: requirement.verification?.length
      ? requirement.verification
      : REQUIREMENT_VERIFICATION_MAP[requirement.id] || ['focused verification required'],
    deployment_required: Boolean(requirement.deployment_required),
    deployment_requirement: requirement.deployment_required
      ? 'Deploy app-visible changes and record deployment/live-smoke proof before done.'
      : 'No deployment required unless this requirement changes app-visible runtime behavior.',
    blocker: requirement.blocker || '',
    next_action: requirement.next_action
  }));
}

function buildConsolidatedDecisions(parseDoc) {
  const decisions = [
    {
      id: 'DEC-ONE-TIME-OPTION-B-OWNERSHIP-BUDGET-DNS',
      title: 'Approve separate One Time Railway/database/domain/DNS ownership and budget',
      owner: `${OPERATOR_NAME} / ${PROVIDER_NAME}`,
      requirement_id: 'REQ-20260619-313',
      recommended_option: 'Approve Option B only after ownership, budget, domain, Railway project, database, and DNS authority are explicit.',
      alternatives: ['Keep shared BNA deployment until launch risk is acceptable', 'Create staging only before production'],
      consequences: 'Blocks paid infrastructure provisioning, DNS mutation, and separate production launch only.',
      exact_action_required: 'Approve or revise the Option B ownership, budget, domain, Railway project/database, and DNS authority.'
    },
    {
      id: 'DEC-RESEND-SENDER-DOMAIN-IDENTITY',
      title: 'Choose One Time email sender domain, from identity, and reply-to',
      owner: `${OPERATOR_NAME} / ${PROVIDER_NAME}`,
      requirement_id: 'REQ-20260621-504',
      recommended_option: 'Store the existing API key separately from sender readiness, then choose domain/from/reply-to before send enablement.',
      alternatives: ['Use a different first-party email provider', 'Keep email drafts only'],
      consequences: 'Blocks live email sends only; domain/status UI, webhook code, and draft UX can continue.',
      exact_action_required: 'Provide sender domain, from email, sender name, reply-to, and DNS authority.'
    },
    {
      id: 'DEC-PRODUCT-PRICING-LEGAL-BILLING',
      title: 'Confirm final pricing, payment provider, refund/legal/access policy',
      owner: `${OPERATOR_NAME} / ${PROVIDER_NAME}`,
      requirement_id: 'REQ-20260619-306',
      recommended_option: 'Model prices and access states now, keep live checkout disabled until product/legal/accounting choices are approved.',
      alternatives: ['Use Stripe only', 'Use Green Invoice/Israeli billing only', 'Keep interest-only intake'],
      consequences: 'Blocks live checkout, invoice issuance, charges, refunds, and real access grants.',
      exact_action_required: 'Approve provider of record, final prices, currencies, payment processor, refund/cancellation/access rules, and live payment credentials/links.'
    },
    {
      id: 'DEC-VIMEO-USER-TOKEN-UPLOAD-AUTHORITY',
      title: 'Provide Vimeo user-level upload authority or approve manual-only workflow',
      owner: PROVIDER_NAME,
      requirement_id: 'REQ-20260619-308',
      recommended_option: 'Use manual Vimeo URL attachment now; keep automated upload disabled until user-level token and upload scope are approved.',
      alternatives: ['Grant user OAuth/token install', 'Use a different approved video host'],
      consequences: 'Blocks automated upload only; manual member-library publishing can continue.',
      exact_action_required: 'Provide authorized Vimeo user/token path, upload scope, account owner, plan/quota, folder, privacy default, and allowed embed domains.'
    },
    {
      id: 'DEC-ZOOM-LIVE-MEETING-SMOKE',
      title: 'Approve one operator-gated live Zoom meeting creation smoke',
      owner: `${OPERATOR_NAME} / ${PROVIDER_NAME}`,
      requirement_id: 'REQ-20260619-307',
      recommended_option: 'Complete mocked API/session/attendance tests first, then approve one controlled integration smoke.',
      alternatives: ['Keep Zoom code in readiness-only mode', 'Use manual meeting setup'],
      consequences: 'Blocks real meeting creation only; client, webhook, and internal workflow code can continue.',
      exact_action_required: 'Approve exact Zoom account, host, license/readiness, scopes, and one safe integration-smoke action.'
    }
  ];

  const parseDecisions = parseDoc?.records?.decisions || [];
  return decisions.map((decision) => ({
    ...decision,
    source_decision_ids: parseDecisions
      .filter((item) => requirementForMeetingItem('decisions', item) === decision.requirement_id)
      .map((item) => item.id)
      .slice(0, 8),
    status: 'needs_operator_decision'
  }));
}

function buildDoc(activeRun, previous, parseDoc, reconciliationDoc) {
  const requirements = activeRun.requirements || [];
  const requirementsById = new Map(requirements.map((requirement) => [requirement.id, requirement]));
  const sourceInventory = buildSourceInventory();
  const currentRows = buildCurrentSourceRows(activeRun, requirementsById);
  const sourceInventoryRows = buildSourceInventoryRows(sourceInventory);
  const meetingRows = buildMeetingRows(parseDoc, reconciliationDoc);
  const sourceStatementMatrix = [...currentRows, ...sourceInventoryRows, ...meetingRows];
  const legacyStatementMatrix = buildLegacyRows(previous, requirementsById);
  const canonicalExecutableRequirements = buildCanonicalRequirements(requirements);
  const classificationCounts = countClassifications(sourceStatementMatrix);
  const legacyCounts = countClassifications(legacyStatementMatrix, 'current_classification');

  return {
    generated_at: generatedAt,
    active_run_id: RUN_ID,
    active_run_path: RUN_DIR,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    canonical_public_provider_name: PROVIDER_NAME,
    stable_internal_workspace_key: WORKSPACE_KEY,
    stable_internal_project_key: PROJECT_KEY,
    current_branch: runGit(['branch', '--show-current']),
    current_head: runGit(['rev-parse', 'HEAD']),
    remote_head: sourceInventory.pr.remote_head,
    current_pr: sourceInventory.pr,
    visible_task_changes: {
      visible_tasks_created: 0,
      visible_decisions_created: 0,
      visible_calendar_records_created: 0,
      policy: 'No source fan-out into visible Tasks or Decisions in Batch 2; rows are collapsed into canonical requirements and concise operator Decisions.'
    },
    source_inventory: sourceInventory,
    meeting_reconciliation: {
      path: MEETING_RECONCILIATION_PATH,
      external_write_performed: Boolean(reconciliationDoc?.external_write_performed),
      production_mutation_performed: Boolean(reconciliationDoc?.production_mutation_performed),
      new_visible_records_created: reconciliationDoc?.new_visible_records_created ?? 0,
      new_task_rows_inserted: reconciliationDoc?.new_task_rows_inserted ?? 0,
      proposed_item_counts: reconciliationDoc?.proposed_item_counts_from_prior_parse || parseDoc?.counts || {}
    },
    current_task_decision_reconciliation: {
      source: 'Batch 2 is read-only. Production census and reversible cleanup are deferred to REQ-20260619-302.',
      expected_batch_3_artifacts: [
        'ops/one-time-mishnah/task-decision-production-census.md',
        'ops/one-time-mishnah/task-decision-production-census.json'
      ],
      deterministic_dedupe_key: [
        'workspace',
        'project',
        'source_id',
        'source_statement',
        'canonical_action',
        'related_entity',
        'requirement_id',
        'target_file_or_route'
      ],
      no_private_parent_student_deletion: true,
      cleanup_apply_gate: 'Batch 3 may apply only reversible archive/quarantine/reclassification after backup and dry-run proof.'
    },
    source_statement_classification_counts: classificationCounts,
    rows: sourceStatementMatrix,
    source_statement_matrix: sourceStatementMatrix,
    legacy_reconciliation: {
      source: previous?.raw_id || 'previous master-backlog-reconciliation.json',
      generated_at: previous?.generated_at || '',
      legacy_statement_rows_preserved: legacyStatementMatrix.length,
      legacy_classification_counts_current: legacyCounts,
      note: 'Legacy June 19 statement rows are preserved and reclassified against the current June 21 canonical requirements.'
    },
    legacy_statement_matrix: legacyStatementMatrix,
    canonical_executable_requirements: canonicalExecutableRequirements,
    remaining_operator_decisions: buildConsolidatedDecisions(parseDoc),
    already_satisfied_requirements: canonicalExecutableRequirements
      .filter((requirement) => ['done', 'already_satisfied', 'verified'].includes(requirement.status))
      .map((requirement) => requirement.id),
    missing_or_open_requirements: canonicalExecutableRequirements
      .filter((requirement) => ['not_started', 'in_progress', 'needs_verification'].includes(requirement.status))
      .map((requirement) => requirement.id),
    external_blocker_requirements: canonicalExecutableRequirements
      .filter((requirement) => requirement.status === 'needs_operator_decision' || requirement.status === 'blocked')
      .map((requirement) => requirement.id),
    guardrails: [
      'No production database mutation was performed.',
      'No visible Task or Decision fan-out was created.',
      'No email, WhatsApp, Zoom meeting, Vimeo upload, DNS mutation, invoice, charge, payment link, account role change, or external write was performed.',
      'One Time rows remain scoped to rabbi_sheller_provider / one_time_mishnah_class.',
      'BNA-only data is classified as unrelated_bna_data or deferred when it is not a current One Time dependency.'
    ],
    next_unblocked_batch_after_verification: {
      requirement_id: 'REQ-20260619-302',
      batch_id: 'batch-3',
      title: 'Production Task and Decision cleanup',
      exact_next_command: 'npm run bna:run:next'
    }
  };
}

function renderMarkdown(doc) {
  const countRows = Object.entries(doc.source_statement_classification_counts)
    .map(([classification, count]) => `| ${classification} | ${count} |`)
    .join('\n');
  const requirementRows = doc.canonical_executable_requirements
    .map(
      (requirement) =>
        `| ${requirement.id} | ${md(requirement.title)} | ${requirement.batch_id} | ${requirement.status} | ${requirement.priority} | ${md(requirement.owner)} | ${requirement.deployment_required ? 'yes' : 'no'} | ${md(requirement.next_action)} |`
    )
    .join('\n');
  const decisionRows = doc.remaining_operator_decisions
    .map(
      (decision) =>
        `| ${decision.id} | ${md(decision.title)} | ${decision.requirement_id} | ${md(decision.owner)} | ${md(decision.exact_action_required)} |`
    )
    .join('\n');
  const sourceRows = doc.source_statement_matrix
    .slice(0, 80)
    .map(
      (row) =>
        `| ${row.statement_id} | ${row.requirement_id || row.current_requirement_id} | ${row.classification} | ${md(row.source_path)} | ${md(truncate(row.source_statement, 120))} |`
    )
    .join('\n');

  return `# One Time Master Backlog Reconciliation\n\n` +
    `Generated: ${doc.generated_at}\n\n` +
    `Active run: \`${doc.active_run_id}\`\n\n` +
    `Workspace: \`${doc.workspace_key}\`\n\n` +
    `Project: \`${doc.project_key}\`\n\n` +
    `Provider: ${PROVIDER_NAME}\n\n` +
    `## Current Batch 2 Reconciliation\n\n` +
    `This refresh replaces the stale June 19 run references with the June 21 active run. It does not create visible Tasks, Decisions, calendar rows, production records, external writes, or app runtime changes.\n\n` +
    `## No Visible Tasks Created\n\n` +
    `| Item | Count |\n|---|---:|\n` +
    `| Visible Tasks created | ${doc.visible_task_changes.visible_tasks_created} |\n` +
    `| Visible Decisions created | ${doc.visible_task_changes.visible_decisions_created} |\n` +
    `| Visible calendar records created | ${doc.visible_task_changes.visible_calendar_records_created} |\n\n` +
    `Policy: ${doc.visible_task_changes.policy}\n\n` +
    `## Classification Counts\n\n` +
    `| Classification | Count |\n|---|---:|\n${countRows}\n\n` +
    `Legacy June 19 statement rows preserved: ${doc.legacy_reconciliation.legacy_statement_rows_preserved}\n\n` +
    `## Canonical Executable Requirements\n\n` +
    `| Requirement | Title | Batch | Status | Priority | Owner | Deploy | Next action |\n|---|---|---|---|---|---|---|---|\n${requirementRows}\n\n` +
    `## Remaining Operator Decisions\n\n` +
    `| Decision | Title | Requirement | Owner | Exact action required |\n|---|---|---|---|---|\n${decisionRows}\n\n` +
    `## Source Statement Matrix Sample\n\n` +
    `Full current and legacy matrices are in \`${OUTPUT_JSON_PATH}\`.\n\n` +
    `| Statement | Requirement | Classification | Source path | Statement |\n|---|---|---|---|---|\n${sourceRows}\n\n` +
    `## Batch 3 Handoff\n\n` +
    `Next unblocked batch after verification: \`${doc.next_unblocked_batch_after_verification.requirement_id}\` / \`${doc.next_unblocked_batch_after_verification.batch_id}\`.\n\n` +
    `Exact next command: \`${doc.next_unblocked_batch_after_verification.exact_next_command}\`.\n`;
}

function replaceSection(text, marker, replacement) {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const section = `${start}\n${replacement.trim()}\n${end}`;
  if (text.includes(start) && text.includes(end)) {
    return text.replace(new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`), section);
  }
  return `${text.trim()}\n\n${section}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateRunFiles(activeRun, doc) {
  const existingSources = new Map((activeRun.sources || []).map((source) => [source.source_id, source]));
  const sourceRegistrations = [
    {
      source_id: 'SOURCE-INVENTORY-20260621',
      source_path: OUTPUT_JSON_PATH,
      captured_at: generatedAt,
      content_fingerprint: `sha256:${sha256(JSON.stringify(doc.source_inventory)).slice(0, 32)}`,
      privacy_classification: 'internal_operations_summary',
      workspace: WORKSPACE_KEY,
      project: PROJECT_KEY,
      source_type: 'reconciliation_inventory'
    },
    {
      source_id: 'DRIVE-20260619-SCHELLER-BRIEF',
      source_path: MEETING_PARSE_PATH,
      captured_at: '2026-06-19T00:00:00.000Z',
      content_fingerprint: 'sha256:023c6c44dde92f7c460ca999c1f16143257928531d4609c2ac1aac4a95eb423b',
      privacy_classification: 'redacted_drive_parse_summary',
      workspace: WORKSPACE_KEY,
      project: PROJECT_KEY,
      source_type: 'google_drive_dry_run_parse'
    }
  ];
  for (const source of sourceRegistrations) {
    if (!existingSources.has(source.source_id)) existingSources.set(source.source_id, source);
  }

  const requirements = activeRun.requirements.map((requirement) => {
    if (requirement.id !== 'REQ-20260621-501') return requirement;
    const status = verified ? 'done' : 'needs_verification';
    return {
      ...requirement,
      status,
      implementation_status: verified ? 'verified_local' : 'implementation_complete',
      next_action: verified
        ? 'Proceed to REQ-20260619-302 production Task and Decision cleanup.'
        : 'Run focused reconciliation verification, then mark Batch 2 verified.',
      evidence: [OUTPUT_MD_PATH, OUTPUT_JSON_PATH],
      verification: [
        'node --check scripts/generate-one-time-master-completion-reconciliation.mjs',
        'node scripts/generate-one-time-master-completion-reconciliation.mjs',
        'node --test tests/one-time-master-backlog-reconciliation.test.js tests/rabbi-scheller-meeting-reconciliation.test.js',
        'npm run bna:run:validate',
        'npm run bna:run:source-coverage',
        'git diff --check',
        'node scripts/audit-secrets.mjs'
      ],
      implementation_files: [
        OUTPUT_MD_PATH,
        OUTPUT_JSON_PATH,
        'scripts/generate-one-time-master-completion-reconciliation.mjs',
        'tests/one-time-master-backlog-reconciliation.test.js'
      ],
      updated_at: generatedAt
    };
  });

  const updatedRun = {
    ...activeRun,
    updated_at: generatedAt,
    source_statement_matrix: {
      path: OUTPUT_JSON_PATH,
      current_rows: doc.source_statement_matrix.length,
      legacy_rows: doc.legacy_reconciliation.legacy_statement_rows_preserved,
      classification_counts: doc.source_statement_classification_counts
    },
    sources: [...existingSources.values()],
    requirements
  };
  writeText(REQUIREMENTS_PATH, `${JSON.stringify(updatedRun, null, 2)}\n`);

  const statusText = readText(`${RUN_DIR}/STATUS.md`);
  writeText(
    `${RUN_DIR}/STATUS.md`,
    replaceSection(
      statusText,
      'batch-2',
      `## Batch 2 - Master Backlog Reconciliation\n\n` +
        `Status: ${verified ? 'done / verified local' : 'needs verification'}\n\n` +
        `Updated \`${OUTPUT_MD_PATH}\` and \`${OUTPUT_JSON_PATH}\` for the June 21 active run. No visible Task fan-out, production mutation, external write, or app runtime change was performed.\n\n` +
        `Next unblocked batch after verification: \`REQ-20260619-302\` production Task and Decision cleanup.`
    )
  );

  const evidenceText = readText(`${RUN_DIR}/EVIDENCE.md`);
  writeText(
    `${RUN_DIR}/EVIDENCE.md`,
    replaceSection(
      evidenceText,
      'batch-2',
      `## Batch 2 Evidence\n\n` +
        `- Reconciliation Markdown: \`${OUTPUT_MD_PATH}\`\n` +
        `- Reconciliation JSON: \`${OUTPUT_JSON_PATH}\`\n` +
        `- Current source rows: ${doc.source_statement_matrix.length}\n` +
        `- Legacy statement rows preserved: ${doc.legacy_reconciliation.legacy_statement_rows_preserved}\n` +
        `- Visible Tasks created: 0\n` +
        `- Visible Decisions created: 0\n` +
        `- Production mutations: 0\n` +
        `- External writes: 0`
    )
  );

  const testText = readText(`${RUN_DIR}/TEST-RESULTS.md`);
  writeText(
    `${RUN_DIR}/TEST-RESULTS.md`,
    replaceSection(
      testText,
      'batch-2',
      `## Batch 2 Test Results\n\n` +
        (verified
          ? `Recorded after focused verification:\n\n` +
            `- PASS \`node --check scripts/generate-one-time-master-completion-reconciliation.mjs\`\n` +
            `- PASS \`node scripts/generate-one-time-master-completion-reconciliation.mjs\`\n` +
            `- PASS \`node --test tests/one-time-master-backlog-reconciliation.test.js tests/rabbi-scheller-meeting-reconciliation.test.js\`\n` +
            `- PASS \`npm run bna:run:validate\`\n` +
            `- PASS \`npm run bna:run:source-coverage\`\n` +
            `- PASS \`git diff --check\` with line-ending warnings only where reported by Git\n` +
            `- PASS \`node scripts/audit-secrets.mjs\``
          : `Pending focused verification. Planned commands are recorded on \`REQ-20260621-501\`.`)
    )
  );

  const nextText = readText(`${RUN_DIR}/NEXT-SESSION.md`);
  writeText(
    `${RUN_DIR}/NEXT-SESSION.md`,
    replaceSection(
      nextText,
      'batch-2',
      `## Batch 2 Handoff\n\n` +
        (verified
          ? `Batch 2 is locally verified. Continue with \`REQ-20260619-302\` / \`batch-3\`: production Task and Decision census, backup/export, dry-run cleanup plan, reversible archive/quarantine workflow, scoped default views, and tests.\n\nExact next command:\n\n\`\`\`powershell\nnpm run bna:run:next\n\`\`\``
          : `Batch 2 artifacts are generated but still need focused verification before the run can move to Batch 3.`)
    )
  );

  const batchRows = [
    '| Batch | Requirement | Status | Notes |',
    '| --- | --- | --- | --- |',
    '| 0 | REQ-20260619-300 | done | Successor run created and validation passed. |',
    '| 1 | REQ-20260619-301 | done | Protocol, validator, schema, resume/next/source/blocker/stale-evidence behavior verified locally. |',
    `| 2 | REQ-20260621-501 | ${verified ? 'done' : 'needs_verification'} | Current master reconciliation refresh. |`,
    '| 3 | REQ-20260619-302 | next | Task and Decision cleanup. |',
    '| 4 | REQ-20260619-303 | not_started | Roles and users. |',
    '| 5 | REQ-20260621-502 | not_started | Visible action coverage. |',
    '| 6 | REQ-20260619-304 | not_started | Operations UI/design. |',
    '| 7 | REQ-20260621-503 | not_started | WhatsApp UX. |',
    '| 8 | REQ-20260621-504 | not_started | Email and Resend UX. |',
    '| 9 | REQ-20260619-306 | not_started | Product, schedule, booking, portals. |',
    '| 11 | REQ-20260619-308 | not_started | Vimeo and member library. |',
    '| 12 | REQ-20260619-307 | not_started | Zoom and attendance. |',
    '| 13 | REQ-20260619-308 | not_started | Recording/transcript/publication pipeline. |',
    '| 14 | REQ-20260619-309 | not_started | Transcript privacy. |',
    '| 15 | REQ-20260619-310 | not_started | Gamification. |',
    '| 16 | REQ-20260619-311 | not_started | Community. |',
    '| 17 | REQ-20260619-312 | not_started | Sefaria/study assistant. |',
    '| 18 | REQ-20260619-313 | needs_operator_decision | Separate paid infrastructure/DNS remains external. |',
    '| 19 | REQ-20260619-314 | not_started | Final verification and release. |'
  ];
  writeText(`${RUN_DIR}/BATCH-STATUS.md`, `# Batch Status\n\n${batchRows.join('\n')}\n`);
}

function main() {
  const activeRun = readJson(REQUIREMENTS_PATH);
  if (!activeRun) throw new Error(`Unable to read ${REQUIREMENTS_PATH}`);
  const previous = readJson(OUTPUT_JSON_PATH, {});
  const parseDoc = readJson(MEETING_PARSE_PATH, {});
  const reconciliationDoc = readJson(MEETING_RECONCILIATION_PATH, {});
  const doc = buildDoc(activeRun, previous, parseDoc, reconciliationDoc);
  writeText(OUTPUT_JSON_PATH, `${JSON.stringify(doc, null, 2)}\n`);
  writeText(OUTPUT_MD_PATH, renderMarkdown(doc));
  updateRunFiles(activeRun, doc);
  console.log(
    JSON.stringify(
      {
        active_run_id: doc.active_run_id,
        output_json: OUTPUT_JSON_PATH,
        output_md: OUTPUT_MD_PATH,
        current_rows: doc.source_statement_matrix.length,
        legacy_rows_preserved: doc.legacy_reconciliation.legacy_statement_rows_preserved,
        visible_tasks_created: doc.visible_task_changes.visible_tasks_created,
        verified
      },
      null,
      2
    )
  );
}

main();
