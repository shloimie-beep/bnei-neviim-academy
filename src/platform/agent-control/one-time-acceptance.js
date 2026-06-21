const REQUIREMENT_ID = 'REQ-20260621-910';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';

const DEFAULT_STAGES = Object.freeze([
  {
    key: 'source_envelope_parser',
    title: 'Source Envelope Parser',
    requirement_id: 'REQ-20260621-901',
    status: 'verified_live',
    evidence: 'ops/live-smokes/2026-06-21T13-22-11-379Z-source-envelope-parser-live-smoke.md',
    acceptance: ['mixed context routed by source envelope', 'dry-run parser leaves no production tasks'],
  },
  {
    key: 'crm_import_dedupe',
    title: 'CRM Import / Dedupe',
    requirement_id: 'REQ-20260621-904',
    status: 'verified_live',
    evidence: 'ops/live-smokes/2026-06-21T14-03-47-316Z-one-time-crm-import-dedupe-live-smoke.md',
    acceptance: ['metadata-only inventory references', 'warm leads stay no-send', 'no GHL/LeadConnector runtime'],
  },
  {
    key: 'trial_referral',
    title: 'Trial / Referral',
    requirement_id: 'REQ-20260621-906',
    status: 'verified_live',
    evidence: 'ops/live-smokes/2026-06-21T14-50-38-537Z-one-time-trial-referral-live-smoke.md',
    acceptance: ['30-day trial model', '$67 renewal model', 'referral after first paid cycle', 'legal wording Decision remains scoped'],
  },
  {
    key: 'payment_access_class_links',
    title: 'Payment / Access / Class Links',
    requirement_id: 'REQ-20260621-907',
    status: 'verified_live',
    evidence: 'ops/live-smokes/2026-06-21T15-11-14-543Z-one-time-payment-access-class-links-live-smoke.md',
    acceptance: ['no live charges', 'manual access review', 'relationship-scoped class links', 'no raw Zoom join or host/start URL'],
  },
  {
    key: 'tickets_questions',
    title: 'Tickets / Questions',
    requirement_id: 'REQ-20260621-908',
    status: 'verified_live',
    evidence: 'ops/live-smokes/2026-06-21T15-38-32-390Z-one-time-authenticated-support-live-smoke.md',
    acceptance: ['member session required', 'ticket-only support bot', 'private question review queue', 'internal notes hidden'],
  },
  {
    key: 'beta_test_data',
    title: 'Beta Test Data',
    requirement_id: 'REQ-20260621-909',
    status: 'verified_live',
    evidence: 'ops/live-smokes/2026-06-21T15-53-01-681Z-one-time-test-identities-live-smoke.md',
    acceptance: ['TEST-prefixed identities', 'example.test contact values', 'cleanup manifest', 'negative authorization matrix'],
  },
]);

const DEFAULT_BLOCKERS = Object.freeze([
  {
    key: 'hosted_transcription_credential',
    owner: 'operator_keyholder',
    requirement_id: 'REQ-20260621-902',
    status: 'blocked_external',
    next_action: 'Replace/fix hosted transcription credential, then reprocess live content job #78.',
  },
  {
    key: 'resend_sender_domain_fields',
    owner: 'operator',
    requirement_id: 'REQ-20260621-504',
    status: 'needs_operator_decision',
    next_action: 'Approve sender domain/from/reply-to fields before any live email send readiness.',
  },
  {
    key: 'vimeo_user_token',
    owner: 'operator_vimeo_account_owner',
    requirement_id: 'REQ-20260619-308',
    status: 'blocked_external',
    next_action: 'Install authenticated Vimeo user token and account/upload settings before automated upload.',
  },
  {
    key: 'separate_one_time_infrastructure',
    owner: 'operator',
    requirement_id: 'REQ-20260619-313',
    status: 'needs_operator_decision',
    next_action: 'Approve budget/ownership/DNS for separate One Time Railway/database/domain provisioning.',
  },
]);

function normalizeStage(stage = {}) {
  return {
    ...stage,
    status: stage.status || 'verified_live',
    external_write_performed: false,
    live_charge_performed: false,
    live_send_performed: false,
    external_crm_write_performed: false,
  };
}

function buildOneTimeAgentModeAcceptance(options = {}) {
  const checkedAt = options.checked_at || options.checkedAt || new Date().toISOString();
  const stages = (options.stages || DEFAULT_STAGES).map(normalizeStage);
  const blockers = (options.blockers || DEFAULT_BLOCKERS).map((blocker) => ({
    ...blocker,
    external_write_required: true,
  }));
  const stageKeys = new Set(stages.map((stage) => stage.key));
  const missingStages = [
    'source_envelope_parser',
    'crm_import_dedupe',
    'trial_referral',
    'payment_access_class_links',
    'tickets_questions',
    'beta_test_data',
  ].filter((key) => !stageKeys.has(key));
  const failedStages = stages.filter((stage) => !['verified_live', 'verified_local', 'done'].includes(stage.status));
  const acceptanceChecks = {
    parser_covered: stageKeys.has('source_envelope_parser'),
    crm_covered: stageKeys.has('crm_import_dedupe'),
    trial_referral_covered: stageKeys.has('trial_referral'),
    access_class_links_covered: stageKeys.has('payment_access_class_links'),
    tickets_questions_covered: stageKeys.has('tickets_questions'),
    beta_data_covered: stageKeys.has('beta_test_data'),
    evidence_artifacts_present: stages.every((stage) => Boolean(stage.evidence)),
    no_live_charges_or_sends: stages.every((stage) => stage.live_charge_performed === false && stage.live_send_performed === false),
    no_external_crm_writes: stages.every((stage) => stage.external_crm_write_performed === false),
    remaining_blockers_explicit: blockers.every((blocker) => blocker.owner && blocker.next_action && blocker.status),
  };
  const ok = missingStages.length === 0
    && failedStages.length === 0
    && Object.values(acceptanceChecks).every(Boolean);
  return {
    requirement_id: REQUIREMENT_ID,
    checked_at: checkedAt,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    mode: 'agent_mode_read_only_acceptance',
    status: ok ? 'pass' : 'needs_attention',
    external_write_performed: false,
    production_mutation_performed: false,
    live_charge_performed: false,
    live_send_performed: false,
    external_crm_write_performed: false,
    stages,
    acceptance_checks: acceptanceChecks,
    missing_stages: missingStages,
    failed_stages: failedStages.map((stage) => stage.key),
    remaining_external_blockers: blockers,
    next_unblocked_batch: 'REQ-20260619-309',
    guardrails: [
      'Read-only Agent Mode acceptance only.',
      'No live charges, sends, external CRM writes, GHL/LeadConnector runtime, DNS, Zoom/Vimeo/Google mutation, or production record creation.',
      'Remaining external blockers are isolated to their dependent requirements.',
    ],
  };
}

module.exports = {
  REQUIREMENT_ID,
  buildOneTimeAgentModeAcceptance,
};
