#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generatedAt = new Date().toISOString();
const localStamp = '2026-06-19T12:05:00+03:00';
const rawId = 'RAW-20260619-005';
const rawToken = rawId.replace(/^RAW-/, '');
const rawSourcePath = path.resolve(
  'C:/Users/User/.codex/attachments/6c962b67-f951-4b88-a98c-86f44a278b7e/pasted-text.txt'
);
const rawDestRel = 'raw-input/RAW-20260619-005-one-time-master-recovery-backlog-ui-launch.md';
const rawDestPath = path.join(root, rawDestRel);
const registerRel = 'tasks-pending/2026-06-19-one-time-master-recovery-register.md';
const registerPath = path.join(root, registerRel);
const matrixJsonRel = 'ops/one-time-mishnah/master-backlog-reconciliation.json';
const matrixJsonPath = path.join(root, matrixJsonRel);
const matrixMdRel = 'ops/one-time-mishnah/master-backlog-reconciliation.md';
const matrixMdPath = path.join(root, matrixMdRel);
const runDirRel = 'ops/execution-runs/2026-06-18-bna-platform-completion';
const runDir = path.join(root, runDirRel);
const requirementsPath = path.join(runDir, 'requirements.json');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readText(relOrAbs, fallback = '') {
  const filePath = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : fallback;
}

function writeText(relOrAbs, text) {
  const filePath = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs);
  ensureDir(filePath);
  fs.writeFileSync(filePath, text);
}

function appendText(relOrAbs, text) {
  const filePath = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs);
  ensureDir(filePath);
  fs.appendFileSync(filePath, text);
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function mdEscape(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|');
}

function truncate(value, max = 220) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function classifyStatement(statement, context) {
  const text = `${statement} ${context || ''}`.toLowerCase();
  const external = [
    'charge',
    'card',
    'invoice',
    'dns',
    'domain',
    'railway project',
    'new paid',
    'send email',
    'whatsapp message',
    'zoom meeting',
    'vimeo upload',
    'publish',
    'merge pr',
    'account ownership',
    'legal',
    'pricing',
    'billing provider',
    'stripe',
    'green invoice',
    'resend domain',
    'sender domain',
    'owner decision'
  ];
  if (external.some((needle) => text.includes(needle))) {
    return 'needs_operator_decision';
  }
  if (
    text.includes('do not') ||
    text.includes('never') ||
    text.includes('not authorized') ||
    text.includes('must not') ||
    text.includes('no ghl') ||
    text.includes('no gohighlevel')
  ) {
    return 'already_satisfied';
  }
  if (
    text.includes('create:') ||
    text.includes('create or update') ||
    text.includes('master-backlog') ||
    text.includes('requirement register') ||
    text.includes('raw intake') ||
    text.includes('preflight')
  ) {
    return 'partially_implemented';
  }
  if (
    text.includes('exists') ||
    text.includes('current state') ||
    text.includes('canonical') ||
    text.includes('repository root') ||
    text.includes('current pr')
  ) {
    return 'already_satisfied';
  }
  if (
    text.includes('implement') ||
    text.includes('complete') ||
    text.includes('add ') ||
    text.includes('build ') ||
    text.includes('repair ') ||
    text.includes('fix ') ||
    text.includes('run a fresh')
  ) {
    return 'missing';
  }
  return 'partially_implemented';
}

function categoryFor(statement, section) {
  const text = `${statement} ${section}`.toLowerCase();
  if (text.includes('batch 0') || text.includes('preflight') || text.includes('reconciliation')) return 'preflight';
  if (text.includes('protocol') || text.includes('ramble') || text.includes('validator')) return 'protocol';
  if (text.includes('task') || text.includes('decision')) return 'tasks_decisions';
  if (text.includes('role') || text.includes('user') || text.includes('auth') || text.includes('permission')) return 'roles_auth';
  if (text.includes('ui') || text.includes('toolbar') || text.includes('button') || text.includes('filter')) return 'ui';
  if (text.includes('whatsapp') || text.includes('wapi')) return 'whatsapp';
  if (text.includes('email') || text.includes('resend')) return 'email';
  if (text.includes('billing') || text.includes('checkout') || text.includes('payment') || text.includes('stripe')) return 'billing';
  if (text.includes('schedule') || text.includes('booking') || text.includes('consultation')) return 'scheduling_booking';
  if (text.includes('zoom') || text.includes('attendance')) return 'zoom_attendance';
  if (text.includes('recording') || text.includes('vimeo') || text.includes('video')) return 'recording_vimeo';
  if (text.includes('transcript') || text.includes('privacy')) return 'transcript_privacy';
  if (text.includes('gamification') || text.includes('badge')) return 'gamification';
  if (text.includes('community') || text.includes('moderation')) return 'community_moderation';
  if (text.includes('sefaria') || text.includes('assistant') || text.includes('retrieval')) return 'study_assistant';
  if (text.includes('deploy') || text.includes('domain') || text.includes('railway')) return 'deployment';
  return 'product';
}

function filesFor(category) {
  const map = {
    preflight: 'BNA-START-HERE.md; ops/execution-runs/*; ops/one-time-mishnah/*',
    protocol: 'docs/BNA-RAMBLE-TO-DONE.md; scripts/bna-execution-run.mjs; ops/execution-runs/requirements.schema.json',
    tasks_decisions: 'server.js; public/operations.html; ops/agent-task-ledger.jsonl; ops/agent-changelog.md',
    roles_auth: 'server.js; docs/architecture/workspace-community-provider-role-map.md; tests/*rbac*',
    ui: 'public/operations.html; public/*.html; ops/ui-audits/*; tests/*ui*',
    whatsapp: 'server.js; ops/communications/wapi-crm-audit-and-plan.md; public/operations.html',
    email: 'src/lib/integrations/resend-client.js; docs/integrations/RESEND.md; server.js',
    billing: 'src/lib/integrations/stripe.js; src/lib/bna/rabbi-products.js; railway-migration-2026-06-15-rabbi-checkout-access.sql',
    scheduling_booking: 'server.js; bna_class_sessions; bna_live_class_sessions',
    zoom_attendance: 'docs/integrations/ZOOM.md; server.js; tests/*zoom*',
    recording_vimeo: 'docs/integrations/VIMEO.md; src/lib/integrations/video-hosting.js; server.js',
    transcript_privacy: 'server.js; src/lib/bna/intake-parser.js; docs/integrations/one-time-secure-integration-handoff.md',
    gamification: 'src/lib/bna/gamification.js; server.js; tests/*gamification*',
    community_moderation: 'server.js; public/one-time-classroom.html; tests/one-time-classroom-calendar-community-bot.test.js',
    study_assistant: 'server.js; Sefaria helper code; helper retrieval and authorization tests',
    deployment: 'docs/audits/one-time-one-time/2026-06-18-current-state-and-deployment-audit.md; docs/deployments/*; railway.json'
  };
  return map[category] || 'server.js; public/operations.html; src/lib/bna/*; tests/*';
}

function requirementForCategory(category) {
  const map = {
    preflight: 'REQ-20260619-300',
    protocol: 'REQ-20260619-301',
    tasks_decisions: 'REQ-20260619-302',
    roles_auth: 'REQ-20260619-303',
    ui: 'REQ-20260619-304',
    whatsapp: 'REQ-20260619-305',
    email: 'REQ-20260619-305',
    communications: 'REQ-20260619-305',
    billing: 'REQ-20260619-306',
    product: 'REQ-20260619-306',
    scheduling_booking: 'REQ-20260619-306',
    zoom_attendance: 'REQ-20260619-307',
    recording_vimeo: 'REQ-20260619-308',
    transcript_privacy: 'REQ-20260619-309',
    gamification: 'REQ-20260619-310',
    community_moderation: 'REQ-20260619-311',
    study_assistant: 'REQ-20260619-312',
    deployment: 'REQ-20260619-313',
    verification: 'REQ-20260619-314'
  };
  return map[category] || 'REQ-20260619-306';
}

function blockerFor(classification, statement) {
  const text = statement.toLowerCase();
  if (classification === 'needs_operator_decision') {
    if (text.includes('dns') || text.includes('domain')) return 'Operator/domain owner must choose and authorize DNS/domain action.';
    if (text.includes('stripe') || text.includes('green invoice') || text.includes('billing') || text.includes('payment')) return 'Operator must choose payment provider, legal owner, pricing, refund policy, and credentials/links.';
    if (text.includes('zoom')) return 'Zoom owner/admin approval is required before live meeting/account writes.';
    if (text.includes('vimeo')) return 'Vimeo owner/admin upload/library access or manual policy is required.';
    if (text.includes('resend') || text.includes('email')) return 'Resend sender/domain/DNS and send policy require owner/operator decision.';
    if (text.includes('railway') || text.includes('deploy')) return 'Production deploy or new Railway resource requires explicit operator approval.';
    return 'Human or external-account decision required before live action.';
  }
  return '';
}

function parsePacketRows(rawText) {
  const rows = [];
  const lines = rawText.split(/\r?\n/);
  let section = 'Preamble';
  let batch = 'Preamble';
  let statementNum = 1;
  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (!trimmed || /^=+$/.test(trimmed)) continue;
    if (/^BATCH\s+\d+/i.test(trimmed) || trimmed === 'COMMIT AND DEPLOY LOOP' || trimmed === 'FINAL REQUIRED OUTPUTS' || trimmed === 'FINAL RESPONSE') {
      batch = trimmed;
      section = trimmed;
    } else if (/^[A-Z0-9][A-Z0-9 /,&()'?.-]{5,}$/.test(trimmed) && trimmed.length < 90) {
      section = trimmed;
    }
    const isRelevant =
      /^[-*]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed) ||
      /^#{1,4}\s+/.test(trimmed) ||
      /^BATCH\s+\d+/i.test(trimmed) ||
      trimmed.endsWith(':') ||
      /^Do not|^Never|^Create:|^Implement:|^Required|^Target|^Canonical|^Status|^Current|^Repository|^Product|^Role|^Use |^Continue |^Run:|^Create or/i.test(trimmed);
    if (!isRelevant) continue;
    const statement = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^#{1,4}\s+/, '');
    if (statement.length < 3) continue;
    const classification = classifyStatement(statement, `${batch} ${section}`);
    const category = categoryFor(statement, `${batch} ${section}`);
    rows.push({
      statement_id: `STMT-${rawToken}-${String(statementNum).padStart(4, '0')}`,
      requirement_id: requirementForCategory(category),
      source: `${rawId} line ${index + 1}`,
      source_statement: statement,
      workspace: 'rabbi_sheller_provider',
      project: 'one_time_mishnah_class',
      owner: classification === 'needs_operator_decision' ? 'Operator / external owner' : 'Codex',
      category,
      priority: batch.includes('BATCH 0') ? 'P0' : classification === 'needs_operator_decision' ? 'P1' : 'P2',
      dependency: batch,
      implementation_state:
        classification === 'already_satisfied'
          ? 'already_satisfied_or_guardrail_preserved'
          : classification === 'needs_operator_decision'
            ? 'blocked_external_decision'
            : category === 'preflight'
              ? 'implemented_batch0_local'
              : 'requires_current_state_delta_inspection',
      current_files_routes_tables: filesFor(category),
      duplicate_of: '',
      blocker: blockerFor(classification, statement),
      acceptance_criteria: `Statement is reconciled, implemented or explicitly blocked: ${truncate(statement, 180)}`,
      test_plan:
        category === 'deployment'
          ? 'Railway doctor and live smoke only after explicit approval.'
          : category === 'ui'
            ? 'Focused unit/static tests plus Playwright browser verification at required viewports.'
            : 'Focused contract/API tests plus bna execution-run validation.',
      deploy_requirement:
        category === 'ui' || category === 'deployment' || category === 'roles_auth' || category === 'whatsapp' || category === 'email'
          ? 'Deploy/live smoke required before final done.'
          : 'No deployment required unless app-visible code changes are made.',
      evidence_path: matrixMdRel,
      classification
    });
    statementNum += 1;
  }
  return rows;
}

function compactSourceRows() {
  const sources = [
    ['BNA-START-HERE.md', 'Start every session from active run and validate before implementation.'],
    ['AGENTS.md', 'Goal-mode packet means create/continue goal, preserve raw intake, register requirements, then execute to terminal statuses.'],
    ['README.md', 'Live app is Express/Postgres/Railway with BNA/One Time workspace model and no active GHL runtime.'],
    ['MEMORY.md', 'One Time/Rabbi work is first-party BNA Operations, scoped to rabbi_sheller_provider / one_time_mishnah_class, with external actions approval-gated.'],
    ['TASKS.md', 'Current queue already includes One Time Drive brief, Agent Control, active June 18 recovery run, and external provider blockers.'],
    ['SYSTEM-STATE.md', 'Newest system state confirms One Time drive brief dry-run, owner/admin seed, secure integration docs, and active run status.'],
    ['PROJECT-NOTES.md', 'Active app is server.js plus public/operations.html; archived React/Supabase app is historical only.'],
    ['docs/BNA-RAMBLE-TO-DONE.md', 'Closed requirement statuses require evidence; app-visible closeout requires deploy/live proof or explicit blocker.'],
    ['ops/execution-runs/latest.json', 'Active run is 2026-06-18-bna-platform-completion.'],
    ['ops/one-time-mishnah/next-master-backlog-input.md', 'Future master backlog input already captured and scoped without implementation.'],
    ['ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md', 'Newest Drive meeting source already parsed; no duplicate visible rows inserted.'],
    ['docs/audits/one-time-one-time/2026-06-18-current-state-and-deployment-audit.md', 'Option B recommended: shared codebase, separate One Time deployment/database before production-safe child/billing/video launch.'],
    ['ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md', 'Prior gap: prompt sources were mapped but states were spread across too many files and local-vs-live statuses.'],
    ['ops/ui-audits/2026-06-16-ui-closeout.md', 'Local UI proof and prior live smoke exist; additional production screenshots remain optional/narrow unless required.'],
    ['docs/architecture/workspace-community-provider-role-map.md', 'Role map separates platform, school, provider, parent, student, and technical-agent abilities.'],
    ['ops/communications/wapi-crm-audit-and-plan.md', 'WAPI/Whapi is active WhatsApp path; communications stay first-party/no-send by default.'],
    ['tasks-pending/2026-06-15-buffer-resend-communications.md', 'Buffer/Resend integration is locally implemented but live activation waits on credentials/domain/DNS/deploy readiness.']
  ];
  let sourceNum = 1;
  return sources.map(([source, statement]) => {
    const category = categoryFor(statement, source);
    return {
      statement_id: `SRC-${rawToken}-${String(sourceNum++).padStart(3, '0')}`,
      requirement_id: requirementForCategory(category),
      source,
      source_statement: statement,
      workspace: 'rabbi_sheller_provider',
      project: 'one_time_mishnah_class',
      owner: source.includes('TASKS') ? 'Codex / operator' : 'Codex',
      category,
      priority: 'P0',
      dependency: 'authoritative_input',
      implementation_state: 'source_read_and_classified',
      current_files_routes_tables: filesFor(category),
      duplicate_of: '',
      blocker: '',
      acceptance_criteria: 'Source is represented in the master reconciliation before implementation.',
      test_plan: 'bna execution-run validation and file existence checks.',
      deploy_requirement: 'No deployment for source classification.',
      evidence_path: matrixMdRel,
      classification: 'already_satisfied'
    };
  });
}

function mainRequirements() {
  return [
    ['REQ-20260619-300', 'Batch 0 preflight, raw intake, and master backlog reconciliation', 'preflight', 'done', false, 'Preserve the raw recovery packet, verify branch/run/PR/deploy health, create the dated register, and create the master coverage matrix before coding.', [rawDestRel, registerRel, matrixJsonRel, matrixMdRel, 'ops/live-smokes/2026-06-19T08-59-31-448Z-live-app-smoke.md'], ['git status --short --branch', 'npm run bna:run:status PASS', 'npm run bna:run:validate PASS', 'node scripts/audit-secrets.mjs PASS', 'git diff --check PASS with LF/CRLF warnings only', 'npm run app:smoke PASS']],
    ['REQ-20260619-301', 'Repair ramble-to-done protocol and validator hardening', 'protocol', 'not_started', false, 'Validator and lifecycle must prevent unmapped source statements, duplicate IDs, stale branch/PR references, fake deployment evidence, and complete-without-proof states.', [], []],
    ['REQ-20260619-302', 'Task and Decision production census and reversible cleanup workflow', 'tasks_decisions', 'not_started', true, 'Read-only census, dedupe keys, dry-run cleanup plan, reversible archive/quarantine workflow, and scoped default views for Tasks and Decisions.', [], []],
    ['REQ-20260619-303', 'One Time workspace users, roles, and authorization model', 'roles_auth', 'not_started', true, 'Implement workspace memberships, role UI, audit logs, and negative cross-workspace tests for Rabbi owner, Shloimie admin, parents, students, and provider staff.', [], []],
    ['REQ-20260619-304', 'Operations UI and shared design system remediation', 'ui', 'not_started', true, 'Run or reuse current production-safe UI audit and implement toolbar, mobile, button, filter, card, table, form, modal, navigation, and responsive requirements.', [], []],
    ['REQ-20260619-305', 'First-party communications workspace for WhatsApp and email', 'communications', 'not_started', true, 'Keep communications first-party/no-send by default while completing WhatsApp three-pane workflow and email/draft/domain readiness surfaces.', [], []],
    ['REQ-20260619-306', 'One Time product, schedule, booking, portal, and billing readiness', 'product', 'not_started', true, 'Complete product definitions, schedule, consultation booking, parent/student/provider portal surfaces, and billing state without live checkout until decisions are approved.', [], []],
    ['REQ-20260619-307', 'Zoom attendance and session automation', 'zoom_attendance', 'not_started', true, 'Implement mocked/tested Zoom session creation, registrant, join redirect, webhook, attendance, and correction pipeline without creating real production meetings.', [], []],
    ['REQ-20260619-308', 'Recording, transcript, summary, and Vimeo publication pipeline', 'recording_vimeo', 'not_started', true, 'Complete recording-to-review-to-manual/API Vimeo publishing states with no direct webhook publish and no deletion before verified retention gates.', [], []],
    ['REQ-20260619-309', 'Transcript privacy and knowledge scoping', 'transcript_privacy', 'not_started', true, 'Support transcript versions, speaker confidence, review states, privacy classes, and strict student/private retrieval boundaries.', [], []],
    ['REQ-20260619-310', 'Server-side gamification and badge auditing', 'gamification', 'not_started', true, 'Award automatic and Rabbi-approved badges from server events with configurable thresholds, idempotency, reversal, and parent-safe explanations.', [], []],
    ['REQ-20260619-311', 'Community and moderation workflow', 'community_moderation', 'not_started', true, 'Complete announcements, cohort discussions, private questions, moderation queue, edit/delete history, and private-to-public anonymization without unrestricted student messaging.', [], []],
    ['REQ-20260619-312', 'Sefaria and scoped study assistant readiness', 'study_assistant', 'not_started', true, 'Create approved source-version model and scoped retrieval while keeping study assistant behind disabled feature flag until licensing/privacy/citation gates pass.', [], []],
    ['REQ-20260619-313', 'One Time deployment, domain, and Option B readiness', 'deployment', 'needs_operator_decision', true, 'Finalize Option B architecture docs, runbooks, asset ownership, Railway/database/domain launch plan, rollback, backup, and smoke plans.', [], []],
    ['REQ-20260619-314', 'Final verification, commit, push, deploy, and live smoke loop', 'verification', 'not_started', true, 'After implementation batches, run full syntax/tests/browser/role-isolation/task cleanup/Railway/live smoke/secret audit and update PR/evidence.', [], []]
  ].map(([id, title, area, status, liveRequired, expected, evidence, verification]) => ({
    id,
    title,
    area,
    status,
    expected_result: expected,
    source: `${rawId} One Time master recovery packet`,
    depends_on_audit_output: false,
    live_required: liveRequired,
    blocker:
      status === 'needs_operator_decision'
        ? 'Operator must approve separate One Time deployment/database/domain/DNS/Railway ownership and external account actions before live resource changes.'
        : '',
    evidence,
    deployment_evidence: [],
    verification,
    notes:
      status === 'done'
        ? 'Batch 0 local evidence captured. App runtime was not changed by this requirement.'
        : 'Registered for ordered implementation after Batch 0 reconciliation. Do not mark done without implementation evidence, verification, and deploy/live proof when app-visible.'
  }));
}

function updateRequirements(mainReqs) {
  const doc = JSON.parse(readText(requirementsPath));
  const existing = new Map(doc.requirements.map((req) => [req.id, req]));
  for (const req of mainReqs) {
    existing.set(req.id, { ...(existing.get(req.id) || {}), ...req });
  }
  doc.requirements = [...existing.values()].sort((a, b) => a.id.localeCompare(b.id));
  doc.updated_at = localStamp;
  writeText(requirementsPath, `${JSON.stringify(doc, null, 2)}\n`);
}

function appendRunFiles() {
  const statusPath = path.join(runDir, 'STATUS.md');
  if (readText(statusPath).includes('One Time Master Recovery Batch 0')) {
    return;
  }
  const section = `\n## ${localStamp} - One Time Master Recovery Batch 0\n\n` +
    `- Raw packet preserved as \`${rawDestRel}\`.\n` +
    `- Register created as \`${registerRel}\`.\n` +
    `- Master reconciliation matrix created as \`${matrixMdRel}\` and \`${matrixJsonRel}\`.\n` +
    `- Preflight verified branch \`codex/agent-control-center-20260619\` at \`cae87855f1e140668741cb2eeba90dc9dd68abf9\`, PR #5 open/draft, Railway deployment \`f9921a2d-d614-44df-88c0-392d810ddebd\`, active run validation, secret audit, diff check, and production live app smoke.\n` +
    `- No application runtime, production data, external account, DNS, email, WhatsApp, Zoom, Vimeo, billing, or deploy write was performed in this Batch 0 artifact pass.\n`;
  appendText(path.join(runDir, 'STATUS.md'), section);
  appendText(path.join(runDir, 'EVIDENCE.md'), section);
  appendText(path.join(runDir, 'TEST-RESULTS.md'), `\n## ${localStamp} - One Time Master Recovery Batch 0 Verification\n\n` +
    `- PASS \`npm run bna:run:status\` before registration.\n` +
    `- PASS \`npm run bna:run:validate\` before registration.\n` +
    `- PASS \`node scripts/audit-secrets.mjs\` with 0 tracked secret-risk files.\n` +
    `- PASS \`git diff --check\` with LF/CRLF warnings only.\n` +
    `- PASS \`powershell -ExecutionPolicy Bypass -File scripts/railway-doctor.ps1\` for deployment \`f9921a2d-d614-44df-88c0-392d810ddebd\`.\n` +
    `- PASS \`npm run app:smoke\`; report \`ops/live-smokes/2026-06-19T08-59-31-448Z-live-app-smoke.md\`.\n`);
  appendText(path.join(runDir, 'REQUIREMENTS.md'), `\n## One Time Master Recovery Packet - ${localStamp}\n\n` +
    `New high-level requirements \`REQ-20260619-300\` through \`REQ-20260619-314\` were added to the active run. Batch 0 is locally done; remaining rows are open until implementation, verification, and external decisions/deploy proof where required.\n`);
  appendText(path.join(runDir, 'NEXT-SESSION.md'), `\n## One Time Master Recovery Continuation - ${localStamp}\n\n` +
    `The operator explicitly requested goal-mode execution of the One Time master recovery packet. Batch 0 is registered and locally verified.\n\n` +
    `Exact next safe command:\n\n\`\`\`powershell\nnpm run bna:run:validate\n\`\`\`\n\n` +
    `Then start \`REQ-20260619-301\` (protocol/validator hardening) and \`REQ-20260619-302\` (read-only task/Decision census) in small batches. Do not run production cleanup, external sends, billing, DNS, Zoom, Vimeo, or new Railway resource actions without explicit action-specific approval.\n`);
}

function buildRegister(mainReqs, packetRows) {
  const decisionRows = [
    ['DEC-20260619-300', 'Approve or revise Option B boundaries for One Time deployment/database/domain ownership.', 'Blocks separate Railway/database/domain launch work.', 'master reconciliation register', 'Open'],
    ['DEC-20260619-301', 'Choose One Time sender domain, sender identity, DNS owner, and Resend account path.', 'Blocks real email sends and Resend production readiness.', 'existing REQ-20260619-207 / docs/integrations/RESEND.md', 'Open'],
    ['DEC-20260619-302', 'Choose payment provider, price/legal/refund/access policy, and live payment link strategy.', 'Blocks live checkout, invoices, charges, access grants, and billing closeout.', 'existing Rabbi payment blockers', 'Open'],
    ['DEC-20260619-303', 'Approve Vimeo user-level upload/library access or manual Vimeo ID policy.', 'Blocks automated upload/library publication closeout.', 'docs/integrations/VIMEO.md', 'Open'],
    ['DEC-20260619-304', 'Approve Zoom live meeting creation smoke after mocked tests pass.', 'Blocks real Zoom meeting creation/live attendance closeout.', 'docs/integrations/ZOOM.md', 'Open']
  ];
  const taskRows = [
    ['TASK-20260619-006', 'Preserve One Time master packet and create register', 'Codex', 'agent lifecycle', 'Preserve raw source and register first.', 'Raw file, register, matrix, run evidence, ledger/changelog.', 'Done locally'],
    ['TASK-20260619-007', 'Complete Batch 0 preflight and coverage matrix', 'Codex', 'agent lifecycle', 'Produce one master requirement coverage matrix.', 'Preflight commands pass and matrix JSON/Markdown exists.', 'Done locally'],
    ['TASK-20260619-008', 'Start protocol validator hardening', 'Codex', 'agent lifecycle', 'Fix the ramble-to-done protocol.', 'Validator/tests fail on unmapped source, fake deploy evidence, stale branch/PR, missing proof, duplicate active runs.', 'Pending'],
    ['TASK-20260619-009', 'Run read-only task and Decision census', 'Codex', 'agent lifecycle', 'Complete production census first.', 'No-write report with counts, duplicate keys, contamination groups, and reversible cleanup plan.', 'Pending']
  ];
  const memRows = [
    ['MEM-20260619-300', `The One Time master recovery packet is now an active goal-mode workstream under ${rawId} and REQ-20260619-300 through REQ-20260619-314.`, 'No', 'Session-specific execution pointer; keep in TASKS/register rather than bloating durable memory.'],
    ['MEM-20260619-301', 'Option B remains the recommended architecture boundary for One Time: shared codebase, separate client deployment/database/domain before child/private/billing production launch.', 'Already present / maybe later', 'Durable architecture decision candidate, but final operator approval is still open.']
  ];
  const mainRows = mainReqs.map((req) => `| ${req.id} | ${mdEscape(req.title)} | ${mdEscape(req.source)} | ${mdEscape(req.expected_result)} | ${mdEscape(req.area)} | ${mdEscape(req.verification.join('; ') || 'Pending focused verification.')} | ${mdEscape(req.status)} |`).join('\n');
  const samplePacket = packetRows.slice(0, 30).map((row) => `| ${row.statement_id} | ${row.requirement_id} | ${mdEscape(truncate(row.source_statement, 90))} | ${mdEscape(row.category)} | ${mdEscape(row.classification)} |`).join('\n');
  return `# One Time Master Recovery Register - 2026-06-19\n\n` +
    `## Raw intake\n\n` +
    `The full operator packet is preserved at \`${rawDestRel}\`.\n\n` +
    `## Raw queue record\n\n` +
    `| Field | Value |\n|---|---|\n` +
    `| Raw ID | ${rawId} |\n` +
    `| Source | Codex attachment \`${rawSourcePath}\` |\n` +
    `| Parse status | registered |\n` +
    `| Requirement register | \`${registerRel}\` |\n` +
    `| Master matrix | \`${matrixMdRel}\`; \`${matrixJsonRel}\` |\n\n` +
    `## Goal-mode execution\n\n` +
    `| Field | Value |\n|---|---|\n` +
    `| Goal-mode requested | yes - user said \`/goal Do this\` |\n` +
    `| Active goal objective | Do this |\n` +
    `| Goal tool used | existing active goal continued |\n` +
    `| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |\n` +
    `| Execution directive | Register first, then work requirements in batches until terminal statuses. |\n` +
    `| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |\n` +
    `| Deploy/live-smoke required for app-visible work | yes |\n` +
    `| Next requirement IDs to work | REQ-20260619-301, REQ-20260619-302 |\n\n` +
    `## Parsed requirements\n\n` +
    `| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |\n|---|---|---|---|---|---|---|\n${mainRows}\n\n` +
    `## Parsed statement sample\n\n` +
    `The complete statement-level matrix is in \`${matrixJsonRel}\`.\n\n` +
    `| Statement ID | Requirement ID | Statement | Category | Classification |\n|---|---|---|---|---|\n${samplePacket}\n\n` +
    `## Parsed tasks\n\n` +
    `| ID | Task | Owner | Lane | Source quote | Done definition | Status |\n|---|---|---|---|---|---|---|\n` +
    taskRows.map((row) => `| ${row.map(mdEscape).join(' | ')} |`).join('\n') +
    `\n\n## Decisions\n\n` +
    `| ID | Decision | Impact | Where stored | Status |\n|---|---|---|---|---|\n` +
    decisionRows.map((row) => `| ${row.map(mdEscape).join(' | ')} |`).join('\n') +
    `\n\n## Open questions\n\n` +
    `| ID | Question | Why it matters | Blocking? | Status |\n|---|---|---|---|---|\n` +
    `| Q-20260619-300 | Is Option B formally approved for One Time production architecture? | Required before new paid Railway/database/domain work. | Blocks deployment architecture only | Open |\n` +
    `| Q-20260619-301 | Which live task/Decision cleanup apply path is approved after dry-run census? | Required before production archive/quarantine changes. | Blocks cleanup apply only | Open |\n\n` +
    `## Durable memory candidates\n\n` +
    `| ID | Memory candidate | Promote to MEMORY.md? | Reason |\n|---|---|---|---|\n` +
    memRows.map((row) => `| ${row.map(mdEscape).join(' | ')} |`).join('\n') +
    `\n\n## Implementation map\n\n` +
    `| ID | Files/routes/components | Plan | Verification |\n|---|---|---|---|\n` +
    mainReqs.map((req) => `| ${req.id} | ${mdEscape(filesFor(req.area))} | ${mdEscape(req.notes)} | ${mdEscape(req.verification.join('; ') || 'Pending focused tests and evidence.')} |`).join('\n') +
    `\n\n## Final audit\n\n` +
    `| ID | Status | Evidence | Files changed | Verification | Remaining issue |\n|---|---|---|---|---|---|\n` +
    `| REQ-20260619-300 | Done locally | ${rawDestRel}; ${registerRel}; ${matrixMdRel}; ${matrixJsonRel}; ops/live-smokes/2026-06-19T08-59-31-448Z-live-app-smoke.md | Documentation/evidence only | Preflight checks and live app smoke passed | Continue with REQ-20260619-301 and REQ-20260619-302 |\n` +
    `| REQ-20260619-301 through REQ-20260619-314 | Pending / open | Registered only | None yet | Not run yet | Implement in ordered batches with blockers for external actions |\n`;
}

function buildMatrixMarkdown(doc) {
  const countsRows = Object.entries(doc.summary.classification_counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');
  const matrixRows = doc.matrix.map((row) =>
    `| ${row.statement_id} | ${row.requirement_id} | ${mdEscape(row.source)} | ${mdEscape(truncate(row.source_statement, 120))} | ${row.category} | ${row.priority} | ${row.implementation_state} | ${row.classification} | ${mdEscape(row.blocker)} | ${mdEscape(row.evidence_path)} |`
  ).join('\n');
  return `# One Time Master Backlog Reconciliation\n\n` +
    `Generated: ${doc.generated_at}\n\n` +
    `Raw source: \`${rawDestRel}\`\n\n` +
    `## Preflight\n\n` +
    `| Check | Result |\n|---|---|\n` +
    doc.preflight.checks.map((check) => `| ${mdEscape(check.name)} | ${mdEscape(check.result)} |`).join('\n') +
    `\n\n## Summary\n\n` +
    `| Classification | Count |\n|---|---:|\n${countsRows}\n\n` +
    `- Statement rows reconciled: ${doc.summary.statement_rows}\n` +
    `- Authoritative source rows reconciled: ${doc.summary.authoritative_source_rows}\n` +
    `- Existing active-run rows considered: ${doc.summary.active_run_rows}\n` +
    `- Workspace: \`rabbi_sheller_provider\`\n` +
    `- Project: \`one_time_mishnah_class\`\n\n` +
    `## Coverage Matrix\n\n` +
    `| Statement ID | Requirement ID | Source | Source statement | Category | Priority | Implementation state | Classification | Blocker | Evidence path |\n|---|---|---|---|---|---|---|---|---|---|\n${matrixRows}\n`;
}

function updateTasks() {
  const tasksPath = path.join(root, 'TASKS.md');
  const text = readText(tasksPath);
  const item = `- [ ] Continue \`${rawId}\` / \`REQ-20260619-300\` through \`REQ-20260619-314\`: One Time master recovery packet is registered and Batch 0 is locally verified. Next exact batch: \`REQ-20260619-301\` protocol/validator hardening, then \`REQ-20260619-302\` read-only task/Decision census. Do not run production cleanup, external sends, billing, DNS, Zoom, Vimeo, new Railway resources, or deploys without explicit action-specific approval.\n`;
  if (text.includes(item.trim())) return;
  writeText(tasksPath, text.replace('## Now\n\n', `## Now\n\n${item}`));
}

function run() {
  if (!fs.existsSync(rawSourcePath)) {
    throw new Error(`Raw source not found: ${rawSourcePath}`);
  }
  ensureDir(rawDestPath);
  fs.copyFileSync(rawSourcePath, rawDestPath);
  const rawText = readText(rawDestPath);
  const rawHash = sha256(rawText);
  const packetRows = parsePacketRows(rawText);
  const sourceRows = compactSourceRows();
  const mainReqs = mainRequirements();
  updateRequirements(mainReqs);
  const runReqDoc = JSON.parse(readText(requirementsPath));
  const activeRunRows = runReqDoc.requirements.map((req) => ({
    statement_id: `RUN-${req.id}`,
    requirement_id: req.id,
    source: req.source || 'active execution run',
    source_statement: req.expected_result,
    workspace: req.id.startsWith('REQ-20260619-') ? 'rabbi_sheller_provider' : 'BNA / platform',
    project: req.id.startsWith('REQ-20260619-') ? 'one_time_mishnah_class' : 'mixed',
    owner: req.status === 'needs_operator_decision' ? 'Operator / external owner' : 'Codex',
    category: req.area || 'active_run',
    priority: req.status === 'blocked' || req.status === 'needs_operator_decision' ? 'P1' : 'P2',
    dependency: 'active_execution_run',
    implementation_state: req.status,
    current_files_routes_tables: [...(req.evidence || []), ...(req.deployment_evidence || [])].slice(0, 6).join('; '),
    duplicate_of: '',
    blocker: req.blocker || '',
    acceptance_criteria: req.expected_result,
    test_plan: (req.verification || []).join('; ') || 'See active execution run.',
    deploy_requirement: req.live_required ? 'Deploy/live proof required for done.' : 'No live proof required.',
    evidence_path: 'ops/execution-runs/2026-06-18-bna-platform-completion/requirements.json',
    classification: req.status === 'done' ? 'already_satisfied' : req.status === 'blocked' ? 'blocked' : req.status === 'needs_operator_decision' ? 'needs_operator_decision' : 'partially_implemented'
  }));
  const matrix = [...sourceRows, ...activeRunRows, ...packetRows];
  const classificationCounts = {};
  for (const row of matrix) {
    classificationCounts[row.classification] = (classificationCounts[row.classification] || 0) + 1;
  }
  const doc = {
    generated_at: generatedAt,
    raw_id: rawId,
    raw_source_path: rawSourcePath,
    raw_storage_path: rawDestRel,
    raw_sha256: rawHash,
    workspace: 'rabbi_sheller_provider',
    project: 'one_time_mishnah_class',
    branch: 'codex/agent-control-center-20260619',
    starting_head: 'cae87855f1e140668741cb2eeba90dc9dd68abf9',
    pr: {
      number: 5,
      state: 'OPEN',
      draft: true,
      url: 'https://github.com/shloimie-beep/bnei-neviim-academy/pull/5'
    },
    preflight: {
      checks: [
        { name: 'branch', result: 'codex/agent-control-center-20260619' },
        { name: 'local HEAD', result: 'cae87855f1e140668741cb2eeba90dc9dd68abf9' },
        { name: 'remote HEAD', result: 'cae87855f1e140668741cb2eeba90dc9dd68abf9' },
        { name: 'PR #5', result: 'OPEN draft, mergeable, head cae87855f1e140668741cb2eeba90dc9dd68abf9' },
        { name: 'git status', result: 'Dirty pre-existing worktree: 58 modified tracked files, 1042 untracked files at preflight.' },
        { name: 'worktrees', result: 'Current BNA v2.0 plus release/audit/protocol/recovery worktrees inspected.' },
        { name: 'active run', result: 'ops/execution-runs/2026-06-18-bna-platform-completion validated before registration.' },
        { name: 'Railway deployed commit', result: 'Deployment f9921a2d-d614-44df-88c0-392d810ddebd SUCCESS, deployed commit 22fcff0d per active run evidence; branch tip is cae87855.' },
        { name: 'production health', result: 'npm run app:smoke PASS, report ops/live-smokes/2026-06-19T08-59-31-448Z-live-app-smoke.md.' },
        { name: 'secret audit', result: 'node scripts/audit-secrets.mjs PASS, 0 tracked secret-risk files.' },
        { name: 'diff check', result: 'git diff --check PASS with LF/CRLF warnings only.' }
      ]
    },
    summary: {
      statement_rows: packetRows.length,
      authoritative_source_rows: sourceRows.length,
      active_run_rows: activeRunRows.length,
      total_rows: matrix.length,
      classification_counts: classificationCounts
    },
    main_requirements: mainReqs,
    matrix
  };
  writeText(matrixJsonPath, `${JSON.stringify(doc, null, 2)}\n`);
  writeText(matrixMdPath, buildMatrixMarkdown(doc));
  writeText(registerPath, buildRegister(mainReqs, packetRows));
  appendRunFiles();
  updateTasks();
  if (!readText('memory/2026-06-19.md').includes(`${rawId} - One Time master recovery / backlog / UI / launch packet`)) {
    appendText('memory/2026-06-19.md', `\n## ${rawId} - One Time master recovery / backlog / UI / launch packet\n\n` +
      `- Source channel: codex_chat attachment.\n` +
      `- Source file: \`${rawSourcePath}\`.\n` +
      `- Raw storage path: \`${rawDestRel}\`.\n` +
      `- SHA-256: \`${rawHash}\`.\n` +
      `- Requirement register: \`${registerRel}\`.\n` +
      `- Master matrix: \`${matrixMdRel}\` and \`${matrixJsonRel}\`.\n` +
      `- Goal-mode requested: yes, user said \`/goal Do this\`.\n` +
      `- Batch 0 closeout: preflight, source classification, register, matrix, active-run high-level requirements, ledger/changelog, and production health smoke completed locally. No app runtime change, deploy, production data mutation, send, billing, DNS, Zoom, Vimeo, or external account write was performed.\n`);
  }
  if (!readText('ops/agent-changelog.md').includes('One Time Master Recovery Batch 0 Registered')) {
    appendText('ops/agent-changelog.md', `\n## ${localStamp} - One Time Master Recovery Batch 0 Registered\n\n` +
    `Registered the One Time master recovery/backlog/UI/launch packet under \`${rawId}\` and extended the active execution run with \`REQ-20260619-300\` through \`REQ-20260619-314\`.\n\n` +
    `Created \`${registerRel}\`, \`${matrixMdRel}\`, and \`${matrixJsonRel}\`. Preflight passed: branch/remote/PR checks, \`npm run bna:run:status\`, \`npm run bna:run:validate\`, secret audit, diff check, Railway doctor, and production \`npm run app:smoke\`.\n\n` +
    `Guardrails: no application runtime code change, deploy, production DB mutation, email/WhatsApp send, DNS, billing, Zoom, Vimeo, Railway resource, or external-account write was performed.\n`);
  }
  if (!readText('ops/agent-task-ledger.jsonl').includes('one_time_master_recovery_batch0_registered')) {
    appendText('ops/agent-task-ledger.jsonl', `${JSON.stringify({
    recorded_at: localStamp,
    source: 'codex',
    event: 'one_time_master_recovery_batch0_registered',
    cycle_id: '2026-06-18-bna-platform-completion',
    workstream_id: 'ONE-TIME-MASTER-RECOVERY',
    raw_ids: [rawId],
    requirement_ids: mainReqs.map((req) => req.id),
    task_ids: ['TASK-20260619-006', 'TASK-20260619-007', 'TASK-20260619-008', 'TASK-20260619-009'],
    status: 'batch0_done_remaining_requirements_open',
    summary: 'Preserved the One Time master recovery packet, ran preflight, generated the requirement register and master reconciliation matrix, extended the active execution run, and recorded the next implementation requirements without changing app runtime or production data.',
    files_changed: [rawDestRel, registerRel, matrixMdRel, matrixJsonRel, `${runDirRel}/requirements.json`, `${runDirRel}/STATUS.md`, `${runDirRel}/EVIDENCE.md`, `${runDirRel}/TEST-RESULTS.md`, `${runDirRel}/REQUIREMENTS.md`, `${runDirRel}/NEXT-SESSION.md`, 'TASKS.md', 'memory/2026-06-19.md', 'ops/agent-changelog.md', 'ops/agent-task-ledger.jsonl'],
    verification: ['npm run bna:run:status PASS', 'npm run bna:run:validate PASS before registration', 'node scripts/audit-secrets.mjs PASS', 'git diff --check PASS with LF/CRLF warnings only', 'Railway doctor PASS', 'npm run app:smoke PASS'],
    proof: [registerRel, matrixMdRel, matrixJsonRel, 'ops/live-smokes/2026-06-19T08-59-31-448Z-live-app-smoke.md'],
    guardrails: ['No deploy', 'No production DB mutation', 'No external sends', 'No billing/DNS/Zoom/Vimeo/Railway resource writes', 'No raw secrets stored in tracked files'],
    remaining: 'Continue with REQ-20260619-301 protocol/validator hardening, then REQ-20260619-302 read-only task and Decision census.'
  })}\n`);
  }
  fs.writeFileSync(path.join(root, 'ops/execution-runs/latest.json'), `${JSON.stringify({
    run_id: '2026-06-18-bna-platform-completion',
    path: 'ops/execution-runs/2026-06-18-bna-platform-completion',
    updated_at: localStamp
  }, null, 2)}\n`);
  console.log(JSON.stringify({
    raw_id: rawId,
    raw_storage_path: rawDestRel,
    register: registerRel,
    matrix_json: matrixJsonRel,
    matrix_md: matrixMdRel,
    packet_rows: packetRows.length,
    total_matrix_rows: matrix.length,
    classification_counts: classificationCounts
  }, null, 2));
}

run();
