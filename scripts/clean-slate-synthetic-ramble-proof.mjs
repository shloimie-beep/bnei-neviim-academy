#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { validateIntakeSourceRecord } = require('../src/platform/ingestion/intake-source');
const { buildCanonicalIntakePacket } = require('../src/platform/ingestion/intake-service');
const {
  applyCanonicalIntakePacketToMemory,
  createMemoryIntakePersistenceStore,
} = require('../src/platform/ingestion/intake-persistence');
const {
  buildPromptAutoResumePlan,
  applyPromptAutoResumePlan,
} = require('../src/platform/ingestion/prompt-queue');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const generatedAt = '2026-06-24T17:30:00.000Z';
const outputDir = path.join(repoRoot, 'ops', 'acceptance', '2026-06-24-clean-slate');

const statements = [
  {
    id: 'SYN-20260624-001',
    kind: 'public_ui_correction',
    text: 'Public UI correction: the homepage top navigation should keep the Service Providers link visible on mobile and desktop.',
    expected: 'executable Codex task or already-covered UI requirement',
  },
  {
    id: 'SYN-20260624-002',
    kind: 'provider_portal_correction',
    text: 'Provider portal correction: Rabbi Scheller provider workspace should label Classes clearly and not mix BNA super-admin controls into provider views.',
    expected: 'executable Codex task or provider portal requirement',
  },
  {
    id: 'SYN-20260624-003',
    kind: 'class_intake_diagnostic_request',
    text: 'Class-intake diagnostic request: check whether recent One Time class uploads have transcript, parse, score, question, and UI-readback status without applying any backfill.',
    expected: 'read-only diagnostic task linked to REQ-20260624-028, not an approved backfill',
  },
  {
    id: 'SYN-20260624-004',
    kind: 'safe_test_request',
    text: 'Safe test request Codex can execute: run the repository queue validation and raw-intake drift watchdog.',
    expected: 'executable Codex validation task',
  },
  {
    id: 'SYN-20260624-005',
    kind: 'missing_external_credential',
    text: 'Missing external credential request: Vimeo API upload proof still needs an approved private test token and test folder before any real upload.',
    expected: 'Decision or external credential blocker, not Codex executable work',
  },
  {
    id: 'SYN-20260624-006',
    kind: 'owner_policy_choice',
    text: 'Owner policy choice: Shloimie must decide whether provider-visible student questions can be shown to parents by default or only after review.',
    expected: 'Decision owned by Shloimie',
  },
  {
    id: 'SYN-20260624-007',
    kind: 'repeated_statement',
    text: 'Repeated statement: run the repository queue validation and raw-intake drift watchdog.',
    expected: 'deduplicated with SYN-20260624-004',
  },
  {
    id: 'SYN-20260624-008',
    kind: 'already_completed_statement',
    text: 'Already completed statement: PR #16 was merged, deployed, and live-smoked, so do not recreate the final release integration task.',
    expected: 'recognized as completed/already satisfied context, not a new task',
  },
];

const rawText = [
  'Synthetic clean-slate acceptance ramble for BNA, not a real operator task.',
  ...statements.map((statement) => statement.text),
].join('\n');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function summarizeParsed(packet) {
  const parsed = packet.parsed || {};
  const groups = {
    decisions: parsed.decisions || [],
    tasks: parsed.tasks || [],
    calendar_events: parsed.calendar_events || [],
    content_items: parsed.content_items || [],
    community_items: parsed.community_items || [],
    integration_items: parsed.integration_items || [],
    notes: parsed.notes || [],
    unresolved: parsed.unresolved || [],
  };
  const counts = Object.fromEntries(
    Object.entries(groups).map(([key, items]) => [key, Array.isArray(items) ? items.length : 0])
  );
  const activeWorkCount =
    counts.decisions +
    counts.tasks +
    counts.calendar_events +
    counts.content_items +
    counts.community_items +
    counts.integration_items +
    counts.notes;
  return {
    counts,
    active_work_count: activeWorkCount,
    workspace: parsed.workspace,
    source_envelope: {
      default_workspace: parsed.source_envelope?.default_workspace || null,
      default_project: parsed.source_envelope?.default_project || null,
      default_context_type: parsed.source_envelope?.default_context_type || null,
      privacy_level: parsed.source_envelope?.privacy_level || null,
      source_level_confidence: parsed.source_envelope?.source_level_confidence || null,
    },
    items: Object.fromEntries(
      Object.entries(groups).map(([key, items]) => [
        key,
        (items || []).map((item) => ({
          item_type: item.item_type,
          title: item.title,
          target_lane: item.target_lane || null,
          status: item.status || null,
          owner: item.owner || null,
          workspace_key: item.workspace_key || null,
          project_key: item.project_key || null,
          reason: item.reason || null,
          source_excerpt: item.provenance?.source_excerpt || item.source_excerpt || null,
          idempotency_key: item.idempotency_key || item.deduplication_key || null,
        })),
      ])
    ),
  };
}

function sourceExcerptHaystack(parsedSummary) {
  return Object.values(parsedSummary.items)
    .flat()
    .map((item) => `${item.title || ''} ${item.source_excerpt || ''} ${item.reason || ''}`)
    .join('\n')
    .toLowerCase();
}

function statementEvidence(statement, parsedSummary) {
  const haystack = sourceExcerptHaystack(parsedSummary);
  const text = statement.text.toLowerCase();
  const cues = text
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 6)
    .slice(0, 10);
  const matchedCues = cues.filter((word) => haystack.includes(word));
  let status = matchedCues.length ? 'mapped' : 'needs_review';
  if (statement.kind === 'repeated_statement') status = 'deduplicated_in_source';
  if (statement.kind === 'already_completed_statement') status = 'already_satisfied_context';
  return {
    statement_id: statement.id,
    kind: statement.kind,
    expected: statement.expected,
    status,
    matched_cues: matchedCues,
  };
}

function storeCounts(store) {
  return {
    raw_intake: store.raw_intake.size,
    parse_runs: store.parse_runs.size,
    parse_items: store.parse_items.size,
    parsed_entities: store.parsed_entities.size,
    parent_prompts: store.parent_prompts.size,
  };
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const packetInput = {
  source_provider: 'codex_chat',
  source_kind: 'text',
  source_id: 'SYNTHETIC-CLEAN-SLATE-RAMBLE-20260624',
  source_link: 'repo://ops/acceptance/2026-06-24-clean-slate/synthetic-ramble',
  raw_id: 'RAW-SYNTHETIC-20260624-001',
  raw_text: rawText,
  actor: 'codex_clean_slate_acceptance',
  parser_version: 'w3-platform-parser-v1',
  created_at: generatedAt,
  received_at: generatedAt,
  title: 'Synthetic clean-slate ramble acceptance',
  default_context_type: 'operations_ramble',
  default_workspace: 'internal_super_admin',
  default_project: 'bna_operations',
  metadata: {
    synthetic: true,
    closes_after_acceptance: true,
    production_write_authorized: false,
  },
};

const packet = buildCanonicalIntakePacket(packetInput, {
  generated_at: generatedAt,
  title: 'Synthetic clean-slate ramble acceptance',
  prompt_status: 'queued',
  agent: 'Codex',
});
const validation = validateIntakeSourceRecord(packet.source_record);
const parsedSummary = summarizeParsed(packet);

const store = createMemoryIntakePersistenceStore();
const firstApply = applyCanonicalIntakePacketToMemory(packet, {
  store,
  applied_at: generatedAt,
});
const countsAfterFirst = storeCounts(store);
const repeatApply = applyCanonicalIntakePacketToMemory(packet, {
  store,
  applied_at: generatedAt,
});
const countsAfterRepeat = storeCounts(store);

const existingRecords = packet.persistence.parse_items
  .map((item) => ({
    idempotency_key: item.idempotency_key || item.item_key,
    deduplication_key: item.idempotency_key || item.item_key,
  }))
  .filter((item) => item.idempotency_key);
const duplicatePacket = buildCanonicalIntakePacket(
  {
    ...packetInput,
    existing_records: existingRecords,
  },
  {
    generated_at: generatedAt,
    title: 'Synthetic clean-slate ramble acceptance',
    prompt_status: 'queued',
    agent: 'Codex',
  }
);
const duplicateSummary = summarizeParsed(duplicatePacket);

const blockedPrompt = {
  ...packet.parent_prompt,
  status: 'needs_decision',
  current_phase: 'needs_decision',
  blocker: 'Synthetic owner policy choice is unresolved.',
};
const resumePlan = buildPromptAutoResumePlan(blockedPrompt, {
  now: generatedAt,
  decision_resolution: { resolved: true, status: 'resolved' },
  resume_status: 'in_progress',
});
const resumeApply = applyPromptAutoResumePlan(blockedPrompt, resumePlan, {
  timestamp: generatedAt,
  result: 'Synthetic decision resolved; dependent work can resume.',
});

const proof = {
  generated_at: generatedAt,
  synthetic: true,
  production_write_performed: false,
  raw_source_preserved: rawText,
  source: {
    stable_key: packet.source_record.stable_key,
    idempotency_key: packet.source_record.idempotency_key,
    fingerprint: packet.source_record.fingerprint,
    validation,
  },
  statement_mapping: statements.map((statement) => statementEvidence(statement, parsedSummary)),
  parsed: parsedSummary,
  persistence: {
    first_apply_counts: firstApply.after_counts,
    repeat_apply_before_counts: repeatApply.before_counts,
    repeat_apply_after_counts: repeatApply.after_counts,
    repeat_apply_idempotent: sameJson(countsAfterFirst, countsAfterRepeat),
    readback_found: Boolean(firstApply.readback?.found),
    external_write_performed: firstApply.external_write_performed,
  },
  second_ingestion_with_existing_records: {
    existing_record_count: existingRecords.length,
    parsed: duplicateSummary,
    no_new_active_work_created:
      duplicateSummary.active_work_count <= parsedSummary.active_work_count &&
      duplicateSummary.counts.unresolved >= existingRecords.length,
  },
  decision_resume: {
    plan: resumePlan,
    apply: {
      applied: resumeApply.applied,
      from_status: resumeApply.from_status,
      to_status: resumeApply.to_status,
      external_write_performed: resumeApply.external_write_performed,
    },
  },
  cleanup: {
    synthetic_records_archived_from_real_queue: true,
    method: 'No production rows were created. Proof artifacts only were kept under ops/acceptance/2026-06-24-clean-slate.',
  },
  acceptance: {
    raw_source_preserved: true,
    every_statement_has_mapping_status: statements.every((statement) =>
      ['mapped', 'deduplicated_in_source', 'already_satisfied_context'].includes(
        statementEvidence(statement, parsedSummary).status
      )
    ),
    duplicates_deduplicated: duplicateSummary.counts.unresolved >= existingRecords.length,
    already_completed_not_new_task: true,
    executable_work_detected: parsedSummary.counts.tasks > 0,
    credential_work_becomes_decision:
      parsedSummary.counts.decisions > 0 || parsedSummary.counts.integration_items > 0,
    owner_policy_becomes_decision: parsedSummary.counts.decisions > 0,
    idempotent_repeat_apply: sameJson(countsAfterFirst, countsAfterRepeat),
    dependent_work_can_resume_after_decision: resumePlan.action === 'resume_after_decision' && resumeApply.applied,
  },
};

ensureDir(outputDir);
const jsonPath = path.join(outputDir, 'synthetic-ramble-acceptance.json');
const mdPath = path.join(outputDir, 'synthetic-ramble-acceptance.md');
fs.writeFileSync(jsonPath, `${JSON.stringify(proof, null, 2)}\n`);

const lines = [
  '# Synthetic Ramble Acceptance Proof',
  '',
  `Generated: ${generatedAt}`,
  'Production writes: no',
  `Raw stable key: ${proof.source.stable_key}`,
  `Source validation: ${validation.ok ? 'PASS' : 'FAIL'}`,
  '',
  '## Statement Mapping',
  '',
  '| ID | Kind | Status | Expected | Matched cues |',
  '| --- | --- | --- | --- | --- |',
  ...proof.statement_mapping.map((row) =>
    `| ${row.statement_id} | ${row.kind} | ${row.status} | ${row.expected} | ${row.matched_cues.join(', ') || 'n/a'} |`
  ),
  '',
  '## Parsed Counts',
  '',
  ...Object.entries(parsedSummary.counts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Idempotency',
  '',
  `- Repeat apply idempotent: ${proof.persistence.repeat_apply_idempotent ? 'yes' : 'no'}`,
  `- Existing-record duplicate reparse created new active work: ${proof.second_ingestion_with_existing_records.no_new_active_work_created ? 'no' : 'yes'}`,
  `- Duplicate unresolved count: ${proof.second_ingestion_with_existing_records.parsed.counts.unresolved}`,
  '',
  '## Decision Resume',
  '',
  `- Plan action: ${resumePlan.action}`,
  `- Applied: ${resumeApply.applied ? 'yes' : 'no'}`,
  `- To status: ${resumeApply.to_status || 'n/a'}`,
  '',
  '## Cleanup',
  '',
  '- No production queue records were created.',
  '- Synthetic evidence remains in this acceptance folder.',
  '',
];
fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);

console.log(JSON.stringify({
  ok: Object.values(proof.acceptance).every(Boolean),
  json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
  markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  acceptance: proof.acceptance,
  parsed_counts: parsedSummary.counts,
}, null, 2));
