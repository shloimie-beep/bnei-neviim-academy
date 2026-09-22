const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const studyAssistant = require('../src/lib/bna/study-assistant-readiness');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

const APPROVED_SOURCE_BODY = 'Rabbi-approved source body should be hashed, not returned.';

function approvedSource(overrides = {}) {
  return {
    canonical_reference: 'Mishnah Berakhot 1:1',
    title: 'Mishnah Berakhot 1:1',
    index_title: 'Mishnah Berakhot',
    version_title: 'Sefaria Community Translation',
    language: 'en',
    license: 'CC-BY',
    attribution: 'Sefaria',
    source_url: 'https://www.sefaria.org/Mishnah_Berakhot.1.1',
    retrieved_at: '2026-06-19T12:00:00Z',
    content: APPROVED_SOURCE_BODY,
    rabbi_approval_status: 'rabbi_approved',
    quote_permission: 'allowed',
    summary_permission: 'allowed',
    index_permission: 'allowed',
    retrieval_scope: 'provider_wide',
    ...overrides,
  };
}

test('source-version approval preview hashes content and returns metadata only', () => {
  const preview = studyAssistant.buildSourceVersionApprovalPreview({ source: approvedSource() });

  assert.equal(preview.requirement_id, 'REQ-20260619-312');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.production_mutation_performed, false);
  assert.equal(preview.source_version_ready, true);
  assert.equal(preview.content_returned, false);
  assert.equal(preview.source.content_returned, false);
  assert.equal(preview.source.missing_fields.length, 0);
  assert.match(preview.source.canonical_reference, /Mishnah Berakhot/);
  assert.doesNotMatch(JSON.stringify(preview), /Rabbi-approved source body/);
});

test('scoped retrieval preview allows approved sources and blocks restricted or cross-student sources without returning text', () => {
  const preview = studyAssistant.buildScopedStudyRetrievalPreview({
    audience: { role: 'student', student_id: 7, cohort_key: 'one_time_mishnah' },
    sources: [
      approvedSource({ source_ref: 'provider', retrieval_scope: 'provider_wide' }),
      approvedSource({ source_ref: 'cohort', retrieval_scope: 'cohort', cohort_key: 'one_time_mishnah' }),
      approvedSource({ source_ref: 'own_student', retrieval_scope: 'student_private', student_id: 7 }),
      approvedSource({ source_ref: 'other_student', retrieval_scope: 'student_private', student_id: 8 }),
      approvedSource({ source_ref: 'restricted', retrieval_scope: 'restricted' }),
      approvedSource({ source_ref: 'raw_transcript', retrieval_scope: 'cohort', raw_unreviewed: true }),
    ],
  });

  assert.equal(preview.requirement_id, 'REQ-20260619-312');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.answer_generation_enabled, false);
  assert.equal(preview.content_returned, false);
  assert.equal(preview.summary.allowed_sources, 3);
  assert.equal(preview.summary.blocked_sources, 3);
  assert.equal(preview.summary.restricted_sources_blocked, 1);
  assert.equal(preview.summary.raw_or_unreviewed_blocked, 1);
  assert.equal(preview.summary.cross_student_blocked, 1);
  assert.ok(preview.allowed_sources.some((source) => source.source_ref === 'own_student'));
  assert.ok(preview.blocked_sources.some((source) => source.reason === 'student_scope_mismatch'));
  assert.ok(preview.blocked_sources.some((source) => source.reason === 'restricted_source_not_for_study_assistant'));
  [...preview.allowed_sources, ...preview.blocked_sources].forEach((source) => {
    assert.equal(source.content_returned, false);
  });
  assert.doesNotMatch(JSON.stringify(preview), /Rabbi-approved source body/);
});

test('study assistant readiness keeps feature flag and all launch gates disabled', () => {
  const readiness = studyAssistant.buildStudyAssistantReadiness({
    sources: [
      approvedSource({ retrieval_scope: 'provider_wide' }),
      approvedSource({ retrieval_scope: 'cohort', cohort_key: 'one_time_mishnah' }),
      approvedSource({ retrieval_scope: 'student_private', student_id: 7 }),
      approvedSource({ retrieval_scope: 'restricted' }),
      { title: 'Draft source missing metadata', retrieval_scope: 'cohort', content: 'Draft text.' },
    ],
    example_student_id: 7,
  });

  assert.equal(readiness.requirement_id, 'REQ-20260619-312');
  assert.equal(readiness.status, 'implemented_read_only');
  assert.equal(readiness.preview_only, true);
  assert.equal(readiness.external_write_performed, false);
  assert.equal(readiness.production_mutation_performed, false);
  assert.equal(Object.values(readiness.gates).every((value) => value === false), true);
  assert.deepEqual(readiness.approved_source_version_whitelist, studyAssistant.SOURCE_VERSION_REQUIRED_FIELDS);
  assert.ok(readiness.future_capabilities.includes('explain_assigned_mishnah'));
  assert.ok(readiness.future_capabilities.includes('cite_approved_sefaria_references'));
  assert.ok(readiness.prohibited_behaviors.includes('fabricate_citations'));
  assert.ok(readiness.prohibited_behaviors.includes('ingest_arbitrary_versions'));
  assert.equal(readiness.retrieval_policy.apply_authorization_before_retrieval, true);
  assert.equal(readiness.retrieval_policy.arbitrary_versions_allowed, false);
  assert.equal(readiness.retrieval_policy.content_returned_by_readiness, false);
  assert.deepEqual(
    readiness.sections.map((section) => section.key),
    [
      'source_version_model',
      'provider_wide_retrieval',
      'cohort_retrieval',
      'student_private_retrieval',
      'restricted_sources',
      'licensing_review',
      'citation_verification',
      'transcript_privacy',
      'disabled_feature_flag',
      'rabbi_approval',
      'audit_release',
    ]
  );
  assert.equal(readiness.summary.source_versions_seen, 5);
  assert.equal(readiness.summary.missing_required_metadata, 1);
  assert.equal(readiness.summary.rabbi_approved_sources, 4);
  assert.equal(readiness.summary.license_reviewed_sources, 4);
  assert.equal(readiness.summary.citation_verified_sources, 4);
  assert.equal(readiness.summary.scope_counts.restricted, 1);
  assert.deepEqual(readiness.blockers, []);
  assert.match(readiness.guardrails.join(' '), /Study assistant feature flag remains disabled/);
  assert.equal(readiness.sections.find((section) => section.key === 'audit_release').status, 'live_smoke_ready');
  assert.doesNotMatch(JSON.stringify(readiness), /Draft text/);
});

test('server declares source-version schema, private route, scoped allowlist, and disabled bot policy', () => {
  [
    'buildStudyAssistantReadiness',
    'CREATE TABLE IF NOT EXISTS bna_one_time_source_versions',
    'canonical_reference TEXT NOT NULL',
    'content_hash TEXT NOT NULL',
    'quote_permission TEXT NOT NULL DEFAULT',
    'retrieval_scope TEXT NOT NULL DEFAULT',
    'source_text_returned BOOLEAN NOT NULL DEFAULT FALSE',
    'CREATE TABLE IF NOT EXISTS bna_one_time_study_assistant_audit_events',
    "app.get('/api/bna/one-time/study-assistant-readiness', requireAdmin",
    'study_assistant_feature_flag_enabled: false',
    'unrestricted_ai_chat_enabled: false',
    'arbitrary_version_ingestion_enabled: false',
    'answer_generation_enabled: false',
    'source_corpus_mutation_enabled: false',
    'portal_publish_enabled: false',
    'raw_source_text_returned: false',
    "routePath === '/api/bna/one-time/study-assistant-readiness' && method === 'GET'",
    "app.post('/api/one-time-classroom/bot'",
    'One Time classroom bot is disabled pending explicit operator approval',
    'source_grounded_only: true',
    'invented_sources_allowed: false',
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations shows no-write Sefaria and study assistant readiness panel', () => {
  assert.match(operations, /getOneTimeStudyAssistantReadiness/);
  assert.match(operations, /oneTimeStudyAssistantReadinessState/);
  assert.match(operations, /renderOneTimeStudyAssistantReadinessPanel/);
  assert.match(operations, /data-one-time-study-assistant-readiness/);
  assert.match(operations, /REQ-20260619-312/);
  assert.match(operations, /Sefaria \/ Study Assistant Readiness/);
  assert.match(operations, /No unrestricted AI chat, Sefaria\/API ingestion, arbitrary translation merge, arbitrary version ingestion, source corpus mutation, raw transcript retrieval, cross-student retrieval, portal publish, or answer generation runs from this panel/);
  assert.match(operations, /Source-version model/);
  assert.match(operations, /Student-private retrieval/);
  assert.match(operations, /Disabled feature flag/);
  assert.match(operations, /No arbitrary versions/);
  assert.match(operations, /Live smoke ready/);
});

test('package exposes focused study assistant live smoke script', () => {
  const packageJson = fs.readFileSync('package.json', 'utf8');
  const smokeScript = fs.readFileSync('scripts/smoke-one-time-study-assistant-live.mjs', 'utf8');
  assert.match(packageJson, /"app:smoke:one-time-study-assistant": "node scripts\/smoke-one-time-study-assistant-live\.mjs"/);
  assert.match(smokeScript, /study-assistant-readiness/);
  assert.match(smokeScript, /implemented_read_only/);
  assert.match(smokeScript, /arbitrary_version_ingestion_enabled === false/);
  assert.match(smokeScript, /answer_generation_enabled === false/);
  assert.match(smokeScript, /source_corpus_mutation_enabled === false/);
  assert.match(smokeScript, /Object\.values\(item\)\.some\(walk\)/);
  assert.doesNotMatch(smokeScript, /authorization\|set-cookie/);
  assert.doesNotMatch(smokeScript, /source-versions|study-assistant\/chat|sefaria\.org\/api|\/api\/sefaria/i);
});

test('route registry declares private no-write study assistant readiness route', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const row = routes.get('/api/bna/one-time/study-assistant-readiness');
  assert.ok(row, 'study assistant readiness route should be registered');
  assert.equal(row.access, 'private');
  assert.equal(row.public_allowed, false);
  assert.equal(row.workspace_scope_required, true);
  assert.equal(row.privacy_risk, 'critical');
  assert.match(row.security_expectation, /no unrestricted AI chat/i);
  assert.match(row.security_expectation, /Sefaria\/API ingestion/i);
  assert.match(row.security_expectation, /raw source text/i);
  assert.match(row.security_expectation, /cross-student retrieval/i);
  assert.match(row.security_expectation, /answer generation/i);
});
