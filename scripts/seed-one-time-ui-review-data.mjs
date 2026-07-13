#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  buildOneTimeSeedManifest,
  buildOneTimeSeedSql,
  assertOneTimeSeedIsolation,
} = require('../src/platform/instances/one-time-separate-deployment');

const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const SEED_KEY = 'one_time_ui_review_20260702';
const REQUIREMENT_ID = 'REQ-20260702-105';
const CONFIRM_PHRASE = 'SEED_ONE_TIME_UI_REVIEW_DATA';
const DEFAULT_OUT_DIR = 'ops/one-time-mishnah/mock-data/2026-07-02-ui-review';
const DEFAULT_REPORT = 'ops/one-time-mishnah/mock-data/2026-07-02-ui-review-seed-readback.json';

function parseArgs(argv) {
  const options = {
    apply: false,
    confirm: '',
    json: false,
    writeReport: false,
    reportPath: DEFAULT_REPORT,
    outDir: DEFAULT_OUT_DIR,
    databaseUrlEnv: 'DATABASE_URL',
    generatedAt: new Date().toISOString(),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--confirm') {
      options.confirm = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--json') options.json = true;
    else if (arg === '--write-report') options.writeReport = true;
    else if (arg === '--report') {
      options.reportPath = argv[index + 1] || DEFAULT_REPORT;
      options.writeReport = true;
      index += 1;
    } else if (arg === '--out-dir') {
      options.outDir = argv[index + 1] || DEFAULT_OUT_DIR;
      index += 1;
    } else if (arg === '--database-url-env') {
      options.databaseUrlEnv = argv[index + 1] || 'DATABASE_URL';
      index += 1;
    } else if (arg === '--generated-at') {
      options.generatedAt = argv[index + 1] || options.generatedAt;
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
  return `Usage: node scripts/seed-one-time-ui-review-data.mjs [--json] [--write-report]
       node scripts/seed-one-time-ui-review-data.mjs --apply --confirm ${CONFIRM_PHRASE}

Dry-run by default. Apply mode requires APP_INSTANCE=onetime,
DEFAULT_WORKSPACE_KEY=${WORKSPACE_KEY}, DEFAULT_PROJECT_KEY=${PROJECT_KEY}, a
database URL, and the exact confirmation phrase. The script never sends email,
WhatsApp, Stripe, Zoom, Vimeo, DNS, or external provider writes.`;
}

function rel(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sqlLiteral(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function jsonLiteral(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function seedMeta(extra = {}) {
  return {
    seed: SEED_KEY,
    requirement_id: REQUIREMENT_ID,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    fixture: true,
    cleanup_marker: SEED_KEY,
    external_send_performed: false,
    external_payment_performed: false,
    ...extra,
  };
}

function buildUiReviewFixture(generatedAt) {
  return {
    seed_key: SEED_KEY,
    requirement_id: REQUIREMENT_ID,
    generated_at: generatedAt,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    safety: {
      test_prefixed: true,
      reversible: true,
      external_writes: false,
      real_payment: false,
      real_email_or_whatsapp_send: false,
      raw_private_data: false,
    },
    review_people: [
      { key: 'TEST-ONETIME-ADULT-LEAD', name: 'TEST One Time Adult Lead', role: 'parent', stage: 'New Lead', email_state: 'not_sent', payment_state: 'none' },
      { key: 'TEST-ONETIME-STUDENT-MEMBER', name: 'TEST One Time Student Member', role: 'student', stage: 'Free Class Signup', email_state: 'delivered', payment_state: 'promotional_access' },
      { key: 'TEST-ONETIME-PAID-MEMBER', name: 'TEST One Time Paid Member', role: 'parent', stage: 'Paid Member', email_state: 'clicked', payment_state: 'sandbox_paid' },
      { key: 'TEST-ONETIME-PROMO-ACCESS', name: 'TEST One Time Promotional Access Member', role: 'parent', stage: 'Promotional Access', email_state: 'sent', payment_state: 'promotional_access' },
      { key: 'TEST-ONETIME-INACTIVE', name: 'TEST One Time Inactive Member', role: 'parent', stage: 'Inactive', email_state: 'opened', payment_state: 'expired' },
      { key: 'TEST-ONETIME-BOUNCED', name: 'TEST One Time Bounced Contact', role: 'viewer', stage: 'Email Clicked', email_state: 'bounced', payment_state: 'none' },
      { key: 'TEST-ONETIME-WHATSAPP', name: 'TEST One Time WhatsApp Contact', role: 'viewer', stage: 'Interested', email_state: 'suppressed', payment_state: 'none' },
    ],
    pipeline_stages: [
      'New Lead',
      'Email Clicked',
      'Free Class Signup',
      'Promotional Access',
      'Member Active',
      'Paid Member',
      'Inactive',
    ],
    class_review: {
      title: 'TEST One Time Launch Review Class',
      live_session_state: 'protected_member_link',
      attendance_events: ['class_link_viewed', 'class_link_clicked', 'attended_by_click'],
      private_question: 'TEST private Mishnah question to Rabbi',
      public_qa_preview: 'TEST Rabbi-selected public Q&A preview',
      video_item: 'TEST Vimeo Placeholder Review Replay',
    },
    setup_states: {
      stripe: ['sandbox_pending', 'paid', 'failed'],
      email: ['sent', 'delivered', 'clicked', 'bounced'],
      whatsapp: ['not_configured', 'token_missing', 'test_pending'],
      vimeo: ['placeholder_ready', 'token_missing'],
      zoom: ['protected_link_missing'],
    },
  };
}

function buildPeopleRows(fixture) {
  return fixture.review_people.map((person, index) => {
    const email = `${person.key.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.test`;
    const phone = person.key === 'TEST-ONETIME-WHATSAPP' ? '+15550101001' : null;
    const status = person.stage === 'Inactive' ? 'inactive' : 'active';
    const metadata = seedMeta({
      review_key: person.key,
      lifecycle_stage: person.stage,
      email_state: person.email_state,
      payment_state: person.payment_state,
      source: 'ui_review_seed',
      sort_order: index + 1,
    });
    return [
      sqlLiteral(person.name),
      sqlLiteral(person.name),
      sqlLiteral(email),
      phone ? sqlLiteral(phone) : 'NULL',
      sqlLiteral(status),
      jsonLiteral(metadata),
    ];
  });
}

function buildValues(rows) {
  return rows.map((row) => `    (${row.join(', ')})`).join(',\n');
}

function buildExtensionSql(fixture) {
  const peopleRows = buildPeopleRows(fixture);
  const contactRows = fixture.review_people.map((person, index) => {
    const email = `${person.key.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.test`;
    const phone = person.key === 'TEST-ONETIME-WHATSAPP' ? '+15550101001' : null;
    return [
      sqlLiteral(person.name),
      sqlLiteral(email),
      phone ? sqlLiteral(phone) : 'NULL',
      sqlLiteral(person.stage === 'New Lead' ? 'lead' : 'active'),
      sqlLiteral('ui_review_seed'),
      "ARRAY['TEST','one_time_review']",
      jsonLiteral(seedMeta({
        review_key: person.key,
        lifecycle_stage: person.stage,
        last_activity: 'TEST review event',
        next_action: person.payment_state === 'none' ? 'Review fit and invite to free class' : 'Review member access state',
        owner: 'Shloimie',
        source: 'ui_review_seed',
      })),
    ];
  });
  const communicationRows = fixture.review_people
    .filter((person) => ['sent', 'delivered', 'clicked', 'bounced'].includes(person.email_state))
    .map((person) => {
      const email = `${person.key.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.test`;
      return [
        sqlLiteral(person.key),
        sqlLiteral(email),
        sqlLiteral(`TEST One Time ${person.email_state} message`),
        sqlLiteral(person.email_state),
        jsonLiteral(seedMeta({ review_key: person.key, email_state: person.email_state, provider: 'resend_test_fixture' })),
      ];
    });
  const accessRows = [
    ['TEST-ONETIME-PROMO-ACCESS', 'TEST One Time Promotional Access Member', 'test.onetime.promotional.access@example.test', 'live_class', 'active', 'TEST promotional access review record', { access_state: 'rosh_hashanah_promotional_access' }],
    ['TEST-ONETIME-PAID-MEMBER-ACCESS', 'TEST One Time Paid Member', 'test.onetime.paid.member@example.test', 'live_class', 'active', 'TEST sandbox paid member review access', { access_state: 'sandbox_paid' }],
    ['TEST-ONETIME-INACTIVE-ACCESS', 'TEST One Time Inactive Member', 'test.onetime.inactive@example.test', 'library_only', 'archived', 'TEST inactive review access', { access_state: 'inactive' }],
  ].map((row) => [
    sqlLiteral(row[0]),
    sqlLiteral(row[1]),
    sqlLiteral(row[2]),
    sqlLiteral(row[3]),
    sqlLiteral(row[4]),
    sqlLiteral(row[5]),
    jsonLiteral(seedMeta(row[6])),
  ]);
  const taskRows = [
    ['TEST One Time next setup task - Railway target', 'Provide or verify One Time Railway project/service/database target.', 'needs_decision', 'technology', 'Shloimie', 'shloimie', 'Open Railway and create/verify one-time-production, one-time-web, and one-time-postgres.'],
    ['TEST One Time setup blocker - Whapi/WAPI token', 'Provide Rabbi-owned Whapi/WAPI account, phone, and token alias.', 'needs_decision', 'communications', 'Shloimie', 'shloimie', 'Add token to BNA keyholder and rerun setup check.'],
    ['TEST One Time setup blocker - Stripe sandbox', 'Provide Rabbi Stripe test credential alias and $67/month test price.', 'needs_decision', 'finance', 'Shloimie', 'shloimie', 'Create sandbox product/price or provide existing test price ID.'],
    ['TEST One Time setup blocker - Zoom protected link', 'Provide member-gated Zoom session details.', 'needs_decision', 'operations', 'Rabbi Elie Scheller', 'rabbi', 'Provide protected Zoom link or meeting metadata.'],
  ].map((row, index) => [
    sqlLiteral(row[0]),
    sqlLiteral(row[1]),
    sqlLiteral(row[2]),
    sqlLiteral(row[3]),
    sqlLiteral('today'),
    sqlLiteral('manual'),
    sqlLiteral(row[4]),
    sqlLiteral(PROJECT_KEY),
    sqlLiteral('task'),
    sqlLiteral(row[5]),
    sqlLiteral('blocked_needs_human_decision'),
    sqlLiteral(row[6]),
    sqlLiteral('task'),
    sqlLiteral('blocked'),
    sqlLiteral(row[5]),
    jsonLiteral(seedMeta({ review_task_index: index + 1, top_task_candidate: index === 0 })),
  ]);
  const supportRows = [
    ['TEST-OT-UI-PRIVATE-Q-000001', 'TEST private question to Rabbi', 'TEST private student question visible to Rabbi/admin only.', 'other', 'parent', '/student.html'],
    ['TEST-OT-UI-SUPPORT-000002', 'TEST class link support issue', 'TEST support ticket for a broken or missing class link.', 'link', 'parent', '/parent.html'],
    ['TEST-OT-UI-WHATSAPP-000003', 'TEST WhatsApp setup state', 'TEST Whapi/WAPI token missing state for setup panel review.', 'automation', 'provider_staff', '/operations'],
  ].map((row) => [
    sqlLiteral(row[1]),
    sqlLiteral(row[2]),
    sqlLiteral('normal'),
    sqlLiteral('open'),
    sqlLiteral(row[3]),
    sqlLiteral('TEST One Time Review'),
    sqlLiteral(row[4]),
    sqlLiteral('Shloimie'),
    sqlLiteral('system'),
    sqlLiteral(row[0]),
    sqlLiteral(WORKSPACE_KEY),
    sqlLiteral(PROJECT_KEY),
    sqlLiteral('TEST-ONETIME-UI-REVIEW'),
    sqlLiteral('test.onetime.review@example.test'),
    sqlLiteral('TEST One Time Review'),
    sqlLiteral(row[4]),
    sqlLiteral(row[5]),
    jsonLiteral(seedMeta({ support_fixture: row[0] })),
    jsonLiteral(seedMeta({ support_fixture: row[0] })),
    sqlLiteral('one_time_ui_review_seed'),
  ]);

  return `-- One Time UI review mock/test data extension.
-- TEST-prefixed, scoped to ${WORKSPACE_KEY} / ${PROJECT_KEY}, and reversible with cleanup marker ${SEED_KEY}.

BEGIN;

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = ${sqlLiteral(PROJECT_KEY)} LIMIT 1
), seed_people(preferred_name, full_name, email, phone, status, metadata) AS (
  VALUES
${buildValues(peopleRows)}
), inserted AS (
  INSERT INTO bna_people (preferred_name, full_name, email, phone, primary_language, status, metadata)
  SELECT preferred_name, full_name, email, phone, 'en', status, metadata
  FROM seed_people
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_people existing WHERE lower(existing.email) = lower(seed_people.email)
  )
  RETURNING id, preferred_name, email, metadata
), all_people AS (
  SELECT id, preferred_name, email, metadata FROM inserted
  UNION ALL
  SELECT existing.id, existing.preferred_name, existing.email, existing.metadata
  FROM bna_people existing
  JOIN seed_people seed ON lower(existing.email) = lower(seed.email)
)
INSERT INTO bna_workspace_memberships (workspace_id, person_id, role, access_level, relationship_to_owner, tags, active, metadata)
SELECT project.id,
       person.id,
       CASE
         WHEN person.metadata->>'review_key' LIKE '%STUDENT%' THEN 'student'
         WHEN person.metadata->>'review_key' LIKE '%WHATSAPP%' THEN 'viewer'
         ELSE 'parent'
       END,
       CASE WHEN person.metadata->>'review_key' LIKE '%WHATSAPP%' THEN 'viewer' ELSE 'member' END,
       CASE WHEN person.metadata->>'review_key' LIKE '%STUDENT%' THEN 'student' ELSE 'parent' END,
       ARRAY['TEST', 'one_time_ui_review'],
       TRUE,
       person.metadata
FROM all_people person
CROSS JOIN project
ON CONFLICT (workspace_id, person_id, role) DO UPDATE SET
  active = TRUE,
  metadata = COALESCE(bna_workspace_memberships.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = ${sqlLiteral(PROJECT_KEY)} LIMIT 1),
seed_people(person_name, role, access_level, login_username, metadata) AS (
  VALUES
${buildValues(fixture.review_people.map((person) => [
    sqlLiteral(person.name),
    sqlLiteral(person.role),
    sqlLiteral(person.role === 'viewer' ? 'viewer' : 'member'),
    sqlLiteral(person.key.toLowerCase().replace(/[^a-z0-9]+/g, '.')),
    jsonLiteral(seedMeta({ review_key: person.key, lifecycle_stage: person.stage })),
  ]))}
)
INSERT INTO bna_project_members (project_id, person_name, role, access_level, login_username, active, metadata)
SELECT project.id, person_name, role, access_level, login_username, TRUE, metadata
FROM project, seed_people
ON CONFLICT (project_id, person_name) DO UPDATE SET
  role = EXCLUDED.role,
  access_level = EXCLUDED.access_level,
  login_username = EXCLUDED.login_username,
  active = TRUE,
  metadata = COALESCE(bna_project_members.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH seed_contacts(full_name, primary_email, primary_phone, status, source, tags, metadata) AS (
  VALUES
${buildValues(contactRows)}
), contacts AS (
  INSERT INTO bna_contacts (full_name, primary_email, primary_phone, status, source, tags, metadata)
  SELECT full_name, primary_email, primary_phone, status, source, tags, metadata
  FROM seed_contacts
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_contacts existing WHERE lower(existing.primary_email) = lower(seed_contacts.primary_email)
  )
  RETURNING id, full_name, metadata
), all_contacts AS (
  SELECT id, full_name, metadata FROM contacts
  UNION ALL
  SELECT existing.id, existing.full_name, existing.metadata
  FROM bna_contacts existing
  JOIN seed_contacts seed ON lower(existing.primary_email) = lower(seed.primary_email)
)
INSERT INTO bna_contact_pipeline_events (contact_id, event_type, pipeline_status, summary, source, metadata)
SELECT id, 'stage_snapshot', metadata->>'lifecycle_stage', 'TEST review pipeline stage: ' || (metadata->>'lifecycle_stage'), 'ui_review_seed', metadata
FROM all_contacts
WHERE NOT EXISTS (
  SELECT 1 FROM bna_contact_pipeline_events existing
  WHERE existing.contact_id = all_contacts.id
    AND existing.source = 'ui_review_seed'
    AND existing.metadata->>'cleanup_marker' = ${sqlLiteral(SEED_KEY)}
);

WITH project AS (SELECT id FROM bna_projects WHERE project_key = ${sqlLiteral(PROJECT_KEY)} LIMIT 1),
seed_messages(review_key, to_address, subject, status, metadata) AS (
  VALUES
${buildValues(communicationRows)}
)
INSERT INTO bna_communications (
  project_id, channel, direction, communication_type, from_name, from_address,
  to_name, to_address, subject, body_text, provider, status, metadata
)
SELECT project.id, 'email', 'outbound', 'review_fixture', 'One Time TEST',
       'info@onetimeonetime.com', review_key, to_address, subject,
       'TEST email history fixture. No send occurred.', 'resend', status, metadata
FROM project, seed_messages
WHERE NOT EXISTS (
  SELECT 1 FROM bna_communications existing
  WHERE existing.project_id = project.id
    AND existing.to_address = seed_messages.to_address
    AND existing.subject = seed_messages.subject
);

INSERT INTO one_time_member_access (access_code, member_label, member_email, tier, status, notes, metadata)
VALUES
${buildValues(accessRows)}
ON CONFLICT (access_code) DO UPDATE SET
  member_label = EXCLUDED.member_label,
  member_email = EXCLUDED.member_email,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  metadata = COALESCE(one_time_member_access.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = ${sqlLiteral(PROJECT_KEY)} LIMIT 1),
class_insert AS (
  INSERT INTO bna_class_sessions (
    project_id, title, summary, topics, sources, student_questions, media_url,
    media_provider, vimeo_id, transcript_status, package_status, class_date, metadata
  )
  SELECT project.id,
         ${sqlLiteral(fixture.class_review.title)},
         'TEST live class with attendance/click and private-question states for UI review.',
         ${jsonLiteral(['Mishnah launch review', 'member access'])},
         ${jsonLiteral(['TEST source sheet', 'TEST protected Zoom link placeholder'])},
         ${jsonLiteral([
           { state: 'private_to_rabbi', text: fixture.class_review.private_question },
           { state: 'rabbi_selected_public_preview', text: fixture.class_review.public_qa_preview },
         ])},
         'https://vimeo.com/123456789',
         'vimeo',
         '123456789',
         'approved',
         'published',
         CURRENT_DATE,
         ${jsonLiteral(seedMeta({ attendance_events: fixture.class_review.attendance_events }))}
  FROM project
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_class_sessions existing
    WHERE existing.project_id = project.id AND existing.title = ${sqlLiteral(fixture.class_review.title)}
  )
  RETURNING id, project_id
), class_row AS (
  SELECT id, project_id FROM class_insert
  UNION ALL
  SELECT existing.id, existing.project_id
  FROM bna_class_sessions existing
  JOIN project ON project.id = existing.project_id
  WHERE existing.title = ${sqlLiteral(fixture.class_review.title)}
  LIMIT 1
)
INSERT INTO one_time_member_library_items (
  project_id, class_session_id, destination, library_visibility, required_tier,
  publish_status, title, description, media_provider, media_url, vimeo_id,
  thumbnail_url, class_date, package_snapshot, approved_by, approved_at, published_by, published_at
)
SELECT class_row.project_id, class_row.id, 'member_library', 'tier', 'live_class',
       'published', ${sqlLiteral(fixture.class_review.video_item)},
       'TEST Vimeo placeholder library item for UI review.',
       'placeholder', 'https://vimeo.com/123456789', '123456789',
       NULL, CURRENT_DATE, ${jsonLiteral(seedMeta({ vimeo_state: 'placeholder_ready' }))},
       'TEST Rabbi Elie Owner', NOW(), 'TEST Shloimie One Time Manager', NOW()
FROM class_row
ON CONFLICT DO NOTHING;

WITH project AS (SELECT id FROM bna_projects WHERE project_key = ${sqlLiteral(PROJECT_KEY)} LIMIT 1),
seed_tasks(title, notes, stage, category, urgency, source, assigned_to, project_key, item_type, waiting_on, agent_status, next_action, task_kind, workflow_status, status_detail, ai_parsed) AS (
  VALUES
${buildValues(taskRows)}
)
INSERT INTO bna_tasks (
  project_id, title, notes, stage, category, urgency, source, assigned_to,
  project_key, item_type, waiting_on, agent_status, next_action, task_kind,
  workflow_status, status_detail, ai_parsed
)
SELECT project.id, title, notes, stage, category, urgency, source, assigned_to,
       project_key, item_type, waiting_on, agent_status, next_action, task_kind,
       workflow_status, status_detail, ai_parsed
FROM project, seed_tasks
WHERE NOT EXISTS (
  SELECT 1 FROM bna_tasks existing
  WHERE existing.project_id = project.id AND existing.title = seed_tasks.title
);

WITH project AS (SELECT id FROM bna_projects WHERE project_key = ${sqlLiteral(PROJECT_KEY)} LIMIT 1),
seed_tickets(title, description, severity, status, category, reporter_name, reporter_role, assigned_to, source, ticket_number, workspace_key, project_key, requester_user_key, requester_email, requester_display_name, requester_role, page_path, authenticated_context, source_context, created_by) AS (
  VALUES
${buildValues(supportRows)}
)
INSERT INTO bna_support_tickets (
  project_id, title, description, severity, status, category, reporter_name,
  reporter_role, assigned_to, source, ticket_number, workspace_key, project_key,
  requester_user_key, requester_email, requester_display_name, requester_role,
  page_path, authenticated_context, notification_state, staff_reply_state,
  source_context, created_by
)
SELECT project.id, title, description, severity, status, category, reporter_name,
       reporter_role, assigned_to, source, ticket_number, workspace_key, project_key,
       requester_user_key, requester_email, requester_display_name, requester_role,
       page_path, authenticated_context, 'internal_only', 'internal_only',
       source_context, created_by
FROM project, seed_tickets
ON CONFLICT (ticket_number) DO UPDATE SET
  status = EXCLUDED.status,
  workspace_key = EXCLUDED.workspace_key,
  project_key = EXCLUDED.project_key,
  source_context = COALESCE(bna_support_tickets.source_context, '{}'::jsonb) || EXCLUDED.source_context,
  updated_at = NOW();

COMMIT;
`;
}

function buildCleanupSql() {
  const marker = sqlLiteral(SEED_KEY);
  return `-- Cleanup One Time UI review TEST data.
-- Deletes only rows with cleanup marker ${SEED_KEY}.

BEGIN;

DELETE FROM bna_communications WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_contact_pipeline_events WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_contacts WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_support_tickets
 WHERE source_context->>'cleanup_marker' = ${marker}
    OR authenticated_context->>'cleanup_marker' = ${marker}
    OR ticket_number LIKE 'TEST-OT-UI-%';
DELETE FROM bna_tasks WHERE ai_parsed->>'cleanup_marker' = ${marker};
DELETE FROM one_time_member_library_items WHERE package_snapshot->>'cleanup_marker' = ${marker};
DELETE FROM bna_class_sessions WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM one_time_member_access WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_project_members WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_workspace_memberships WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_people WHERE metadata->>'cleanup_marker' = ${marker};

COMMIT;
`;
}

function buildArtifacts(options) {
  const fixture = buildUiReviewFixture(options.generatedAt);
  const baseManifest = buildOneTimeSeedManifest({ generatedAt: options.generatedAt });
  const baseSql = buildOneTimeSeedSql(baseManifest);
  const extensionSql = buildExtensionSql(fixture);
  const sql = `${baseSql.trim()}\n\n${extensionSql.trim()}\n`;
  const cleanupSql = buildCleanupSql();
  const isolation = assertOneTimeSeedIsolation(baseManifest, sql);
  const violations = [];
  const serialized = `${JSON.stringify(fixture)}\n${sql}\n${cleanupSql}`;
  if (!serialized.includes(WORKSPACE_KEY)) violations.push('Missing workspace key.');
  if (!serialized.includes(PROJECT_KEY)) violations.push('Missing project key.');
  if (!/TEST-/.test(serialized)) violations.push('Missing TEST prefix.');
  if (/gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i.test(serialized)) violations.push('Seed contains a real-looking email domain.');
  if (/Dratler|raw private|Bnei Neviim/i.test(serialized)) violations.push('Seed contains disallowed private/BNA text.');
  return {
    fixture,
    sql,
    cleanupSql,
    validation: {
      ok: isolation.ok && violations.length === 0,
      base_seed_isolation: isolation,
      violations,
    },
  };
}

function writeArtifacts(options, artifacts) {
  const outDir = path.resolve(options.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const manifestPath = path.join(outDir, 'ui-review-fixtures.json');
  const sqlPath = path.join(outDir, 'seed-ui-review-data.sql');
  const cleanupPath = path.join(outDir, 'cleanup-ui-review-data.sql');
  fs.writeFileSync(manifestPath, `${JSON.stringify(artifacts.fixture, null, 2)}\n`);
  fs.writeFileSync(sqlPath, artifacts.sql);
  fs.writeFileSync(cleanupPath, artifacts.cleanupSql);
  return {
    manifest_path: rel(manifestPath),
    sql_path: rel(sqlPath),
    cleanup_path: rel(cleanupPath),
    sql_sha256: sha256(artifacts.sql),
    cleanup_sha256: sha256(artifacts.cleanupSql),
  };
}

function assertApplyGuards(options) {
  const blockers = [];
  if (options.confirm !== CONFIRM_PHRASE) blockers.push(`Missing confirmation phrase: --confirm ${CONFIRM_PHRASE}`);
  if (String(process.env.APP_INSTANCE || '').trim().toLowerCase() !== 'onetime') blockers.push('APP_INSTANCE must be onetime.');
  if (String(process.env.DEFAULT_WORKSPACE_KEY || '').trim() !== WORKSPACE_KEY) blockers.push(`DEFAULT_WORKSPACE_KEY must be ${WORKSPACE_KEY}.`);
  if (String(process.env.DEFAULT_PROJECT_KEY || '').trim() !== PROJECT_KEY) blockers.push(`DEFAULT_PROJECT_KEY must be ${PROJECT_KEY}.`);
  if (!String(process.env[options.databaseUrlEnv] || '').trim()) blockers.push(`${options.databaseUrlEnv} is not configured.`);
  return blockers;
}

async function applySql(options, artifacts) {
  const blockers = assertApplyGuards(options);
  if (blockers.length) return { ok: false, mutation_performed: false, blockers };
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env[options.databaseUrlEnv],
    ssl: /localhost|127\.0\.0\.1/i.test(process.env[options.databaseUrlEnv]) ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(artifacts.sql);
    return { ok: true, mutation_performed: true, blockers: [] };
  } finally {
    await client.end();
  }
}

function writeReport(reportPath, report) {
  const fullPath = path.resolve(reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(report, null, 2)}\n`);
  const mdPath = fullPath.replace(/\.json$/i, '.md');
  fs.writeFileSync(mdPath, `# One Time UI Review Seed Readback

- Generated: ${report.generated_at}
- Mode: ${report.mode}
- OK: ${report.ok ? 'yes' : 'no'}
- Mutation performed: ${report.mutation_performed ? 'yes' : 'no'}
- Workspace/project: ${WORKSPACE_KEY} / ${PROJECT_KEY}
- Seed SQL: ${report.files.sql_path}
- Cleanup SQL: ${report.files.cleanup_path}
- Manifest: ${report.files.manifest_path}
- Cleanup command: \`npm run one-time:cleanup:ui-review\`

## Planned Review Data

- Review people: ${report.counts.review_people}
- Pipeline stages: ${report.counts.pipeline_stages}
- Setup states: Stripe, email, WhatsApp, Vimeo, Zoom
- External sends/payments/provider writes: none

## Blockers

${(report.blockers || []).length ? report.blockers.map((item) => `- ${item}`).join('\n') : '- None'}
`);
  return { json: rel(fullPath), md: rel(mdPath) };
}

function printReport(report, options) {
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`One Time UI review seed: ${report.ok ? 'ok' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Mutation performed: ${report.mutation_performed ? 'yes' : 'no'}`);
  for (const blocker of report.blockers || []) console.log(`Blocked: ${blocker}`);
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }
  const artifacts = buildArtifacts(options);
  const files = writeArtifacts(options, artifacts);
  const applyResult = options.apply
    ? await applySql(options, artifacts)
    : { ok: true, mutation_performed: false, blockers: [] };
  const report = {
    ok: artifacts.validation.ok && applyResult.ok,
    mode: options.apply ? 'apply' : 'dry_run',
    generated_at: options.generatedAt,
    mutation_performed: Boolean(applyResult.mutation_performed),
    external_writes_performed: false,
    database_url_env: options.databaseUrlEnv,
    files,
    validation: artifacts.validation,
    counts: {
      review_people: artifacts.fixture.review_people.length,
      pipeline_stages: artifacts.fixture.pipeline_stages.length,
      access_states: artifacts.fixture.setup_states.stripe.length,
      email_states: artifacts.fixture.setup_states.email.length,
      whatsapp_states: artifacts.fixture.setup_states.whatsapp.length,
    },
    blockers: [...(artifacts.validation.violations || []), ...(applyResult.blockers || [])],
  };
  if (options.writeReport || options.apply) {
    report.report_paths = writeReport(options.reportPath, report);
  }
  printReport(report, options);
  if (!report.ok) process.exitCode = options.apply ? 2 : 1;
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    mode: 'error',
    mutation_performed: false,
    error: error.message,
  }, null, 2));
  process.exit(1);
}
