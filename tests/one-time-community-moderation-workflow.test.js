const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const communityModeration = require('../src/lib/bna/community-moderation');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const classroom = fs.readFileSync('public/one-time-classroom.html', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

const RAW_PRIVATE_QUESTION = 'Mendy Cohen privately asked to email him at mendy@example.com or call 054-123-4567 after class.';

test('private question moderation draft is review-only and does not return raw text', () => {
  const draft = communityModeration.buildPrivateQuestionModerationDraft({
    question_ref: 'question:77',
    body: RAW_PRIVATE_QUESTION,
    author_type: 'student',
    author_label: 'Mendy Cohen',
    private_identifiers: ['Mendy Cohen'],
    desired_visibility: 'public_anonymized',
  });

  assert.equal(draft.requirement_id, 'REQ-20260619-311');
  assert.equal(draft.preview_only, true);
  assert.equal(draft.external_write_performed, false);
  assert.equal(draft.production_mutation_performed, false);
  assert.equal(draft.submitted_private, true);
  assert.equal(draft.raw_body_returned, false);
  assert.equal(draft.safe_for_auto_publish, false);
  assert.equal(draft.no_student_to_student_chat, true);
  assert.equal(draft.unrestricted_student_messaging_enabled, false);
  assert.equal(draft.temporary_hold_recommended, true);
  assert.ok(draft.report_flags.includes('contact_info'));
  assert.ok(draft.report_flags.includes('direct_chat_request'));
  assert.ok(draft.report_flags.includes('private_identifier'));
  assert.doesNotMatch(JSON.stringify(draft), /Mendy Cohen/);
  assert.doesNotMatch(JSON.stringify(draft), /mendy@example/);
  assert.doesNotMatch(JSON.stringify(draft), /054-123/);
});

test('private-to-public promotion preview stores version metadata and redacts identifiers', () => {
  const preview = communityModeration.buildPrivateToPublicPromotionPreview({
    original_body: RAW_PRIVATE_QUESTION,
    edited_body: 'Mendy Cohen asked: What source explains why the Mishnah chooses this wording? Email mendy@example.com.',
    reviewer: 'Rabbi Elie Scheller',
    private_identifiers: ['Mendy Cohen'],
  });

  assert.equal(preview.requirement_id, 'REQ-20260619-311');
  assert.equal(preview.preview_only, true);
  assert.equal(preview.original_version_stored, true);
  assert.equal(preview.edited_version_present, true);
  assert.equal(preview.anonymized_public_body_present, true);
  assert.equal(preview.original_body_returned, false);
  assert.equal(preview.edited_body_returned, false);
  assert.equal(preview.visibility_decision, 'public_anonymized');
  assert.equal(preview.review_state, 'approved_anonymized_public');
  assert.equal(preview.private_identifiers_removed, true);
  assert.equal(preview.public_version_contains_private_identifiers, false);
  assert.equal(preview.write_enabled, false);
  assert.match(preview.anonymized_public_body, /\[name redacted\]/);
  assert.match(preview.anonymized_public_body, /\[email redacted\]/);
  assert.doesNotMatch(JSON.stringify(preview), /Mendy Cohen/);
  assert.doesNotMatch(JSON.stringify(preview), /mendy@example/);
});

test('community moderation readiness covers required sections and no-write gates', () => {
  const readiness = communityModeration.buildCommunityModerationReadiness({
    threads: [
      {
        id: 1,
        thread_type: 'announcement',
        messages: [
          { id: 10, moderation_status: 'approved', status: 'visible', visibility_decision: 'cohort_visible' },
          {
            id: 11,
            moderation_status: 'held_for_parent_review',
            private_to_public_state: 'held_for_safety_review',
            visibility_decision: 'private',
            parent_visible_safety: true,
            report_flags_json: ['contact_info'],
            edit_history_json: [{ action: 'review' }],
          },
          {
            id: 12,
            moderation_status: 'approved_anonymized_public',
            private_to_public_state: 'approved_anonymized_public',
            visibility_decision: 'public_anonymized',
            delete_history_json: [{ action: 'archive' }],
          },
        ],
      },
    ],
  });

  assert.equal(readiness.requirement_id, 'REQ-20260619-311');
  assert.equal(readiness.status, 'needs_operator_decision');
  assert.equal(readiness.preview_only, true);
  assert.equal(readiness.external_write_performed, false);
  assert.equal(readiness.production_mutation_performed, false);
  assert.equal(Object.values(readiness.gates).every((value) => value === false), true);
  assert.deepEqual(
    readiness.sections.map((section) => section.key),
    [
      'rabbi_announcements',
      'cohort_discussions',
      'private_questions',
      'parent_visible_communication',
      'staff_only_notes',
      'moderated_posting',
      'edit_history',
      'deletion_history',
      'private_to_public_anonymization',
      'report_flag_flow',
      'visibility_checks',
      'no_unrestricted_student_messaging',
      'audit_release',
    ]
  );
  assert.equal(readiness.summary.threads_seen, 1);
  assert.equal(readiness.summary.messages_seen, 3);
  assert.equal(readiness.summary.pending_moderation, 1);
  assert.equal(readiness.summary.safety_holds, 1);
  assert.equal(readiness.summary.public_anonymized_items, 1);
  assert.equal(readiness.summary.edit_history_records, 1);
  assert.equal(readiness.summary.delete_history_records, 1);
  assert.equal(readiness.summary.report_flag_records, 1);
  assert.match(readiness.blockers.join(' '), /Unrestricted student-to-student private messaging remains disabled/);
});

test('server declares community moderation schema, audit trail, route, and scoped allowlist', () => {
  [
    'bna_community_moderation_events',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS original_body',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS edited_body',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS published_body',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS anonymized_body',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS visibility_decision',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS edit_history_json',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS delete_history_json',
    'ALTER TABLE bna_community_messages ADD COLUMN IF NOT EXISTS report_flags_json',
    'ALTER TABLE bna_one_time_question_reviews ADD COLUMN IF NOT EXISTS anonymized_body',
    'temporary_hold_recommended',
    'buildCommunityModerationReadiness',
    'buildModerationHistoryEvent',
    "app.get('/api/bna/one-time/community-moderation-readiness', requireAdmin",
    'raw_private_message_text_returned: false',
    'unrestricted_student_messaging_enabled: false',
    "routePath === '/api/bna/one-time/community-moderation-readiness' && method === 'GET'",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('existing One Time classroom response route remains private-first', () => {
  const responseRoute = server.slice(
    server.indexOf("app.post('/api/one-time-classroom/threads/:id/responses'"),
    server.indexOf("app.post('/api/one-time-classroom/bot'")
  );
  assert.match(responseRoute, /oneTimeClassroomScreenResponse\(responseBody\)/);
  assert.match(responseRoute, /status, moderation_status, ai_moderation_json/);
  assert.match(responseRoute, /'hidden'/);
  assert.match(responseRoute, /visible_to_classroom: false/);
  assert.match(responseRoute, /no_student_to_student_chat: true/);
  assert.match(responseRoute, /bna_community_moderation_events/);
});

test('Operations shows no-write community moderation readiness panel', () => {
  assert.match(operations, /getOneTimeCommunityModerationReadiness/);
  assert.match(operations, /renderOneTimeCommunityModerationReadinessPanel/);
  assert.match(operations, /data-one-time-community-moderation-readiness/);
  assert.match(operations, /REQ-20260619-311/);
  assert.match(operations, /Community \/ Moderation Workflow/);
  assert.match(operations, /No unrestricted student-to-student messaging, public\/member-visible post publication, external notification, temporary-hold enforcement, delete purge, or anonymized public promotion runs from this panel/);
  assert.match(operations, /Rabbi announcements/);
  assert.match(operations, /Private-to-public anonymization/);
});

test('public classroom keeps private replies and no active bot surface', () => {
  assert.match(classroom, /Reply Queue/);
  assert.match(classroom, /els\.threadList\.addEventListener\('submit'/);
  assert.match(classroom, /\/api\/one-time-classroom\/threads\/\$\{encodeURIComponent\(form\.dataset\.threadId\)\}\/responses/);
  assert.match(classroom, /Submitting for review/);
  assert.match(classroom, /Submitted for review/);
  assert.doesNotMatch(classroom, /student-to-student private messaging/i);
});

test('route registry declares private no-write community moderation readiness route', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const row = routes.get('/api/bna/one-time/community-moderation-readiness');
  assert.ok(row, 'community moderation readiness route should be registered');
  assert.equal(row.access, 'private');
  assert.equal(row.public_allowed, false);
  assert.equal(row.workspace_scope_required, true);
  assert.equal(row.privacy_risk, 'critical');
  assert.match(row.security_expectation, /no public\/member post publication/i);
  assert.match(row.security_expectation, /unrestricted student messaging/i);
  assert.match(row.security_expectation, /raw private question exposure/i);
});
