#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const MARKER = 'TEST-BNA-SEED';
const WORKSPACE_KEY = 'test_bna_seed_school';
const PROJECT_KEY = 'test_bna_seed_project';
const TEST_EMAIL = 'test-bna-seed@example.invalid';
const TEST_STUDENT = 'TEST BNA Seed Student';
const TEST_HEBREW_GOAL = 'TEST-BNA-SEED: \u05d9\u05e2\u05d3 \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea';

const LANES = [
  'workspaces',
  'users',
  'students',
  'tasks',
  'decisions',
  'events',
  'content',
  'communities',
  'accounting',
  'automations',
  'integrations',
  'live_classes',
  'hebrew_goals',
  'helper_memory',
  'helper_actions',
];

const CLEANUP_TABLES = [
  'bna_assistant_action_audit',
  'bna_assistant_memory',
  'bna_task_comments',
  'bna_content_outputs',
  'bna_class_sessions',
  'bna_content_jobs',
  'bna_group_goal_entries',
  'bna_group_goals',
  'bna_accountability_events',
  'bna_torah_learning_entries',
  'bna_torah_learning_goals',
  'bna_devices',
  'bna_payment_intake',
  'bna_students',
  'bna_signup_agreement_signatures',
  'signups',
  'bna_tasks',
  'bna_workspace_invitations',
  'bna_project_members',
  'bna_projects',
  'bna_workspaces',
];

function parseArgs(argv) {
  const args = {
    command: 'plan',
    dryRun: false,
  };

  for (const arg of argv) {
    if (['plan', 'seed', 'cleanup'].includes(arg)) args.command = arg;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--help' || arg === '-h') args.command = 'help';
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function loadLocalEnv() {
  for (const name of ['.env.local', '.env']) {
    loadEnvFile(path.join(process.cwd(), name));
  }
}

function buildPlan() {
  return {
    marker: MARKER,
    default_command: 'plan',
    commands: ['plan', 'seed --dry-run', 'seed', 'cleanup --dry-run', 'cleanup'],
    safety: {
      mutation_requires: [
        'BNA_TEST_DATA_ALLOW=1',
        'DATABASE_URL set',
        'database name contains "test"',
      ],
      refused_targets: [
        'Railway',
        'Supabase',
        'Neon',
        'Render',
        'non-test database names',
      ],
    },
    fixture: {
      workspace_key: WORKSPACE_KEY,
      project_key: PROJECT_KEY,
      record_prefix: MARKER,
      email_domain: 'example.invalid',
      lanes: LANES,
    },
    cleanup_order: CLEANUP_TABLES,
  };
}

function assertSafeDatabaseUrl(rawUrl) {
  if (process.env.BNA_TEST_DATA_ALLOW !== '1') {
    throw new Error('Refusing mutation: set BNA_TEST_DATA_ALLOW=1 for local test-data seed/cleanup.');
  }
  if (!rawUrl) throw new Error('Refusing mutation: DATABASE_URL is required.');

  const parsed = new URL(rawUrl);
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, '')).toLowerCase();
  const host = parsed.hostname.toLowerCase();
  const joined = `${host}/${databaseName}`;
  const forbidden = /(railway|supabase|neon|render|amazonaws|digitalocean|fly\.dev|heroku|production|prod)/i;

  if (!databaseName.includes('test')) {
    throw new Error(`Refusing mutation: database name must contain "test" (received "${databaseName || '[empty]'}").`);
  }
  if (forbidden.test(joined)) {
    throw new Error(`Refusing mutation: database target looks non-local or production-like (${host}/${databaseName}).`);
  }

  return rawUrl;
}

function json(value) {
  return JSON.stringify(value);
}

async function cleanup(client) {
  const queries = [
    [`DELETE FROM bna_assistant_action_audit WHERE metadata->>'seed_marker' = $1 OR requester_key = $1`, [MARKER]],
    [`DELETE FROM bna_assistant_memory WHERE metadata->>'seed_marker' = $1 OR user_key = $1`, [MARKER]],
    [`DELETE FROM bna_task_comments WHERE source_context->>'seed_marker' = $1 OR body LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_content_outputs WHERE metadata->>'seed_marker' = $1 OR title LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_class_sessions WHERE title LIKE $1`, [`${MARKER}%`]],
    [`DELETE FROM bna_content_jobs WHERE notes LIKE $1 OR title LIKE $1`, [`${MARKER}%`]],
    [`DELETE FROM bna_group_goal_entries WHERE metadata->>'seed_marker' = $1 OR notes LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_group_goals WHERE metadata->>'seed_marker' = $1 OR title LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_accountability_events WHERE metadata->>'seed_marker' = $1 OR title LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_torah_learning_entries WHERE student_id IN (SELECT id FROM bna_students WHERE notes LIKE $1 OR name LIKE $1)`, [`${MARKER}%`]],
    [`DELETE FROM bna_torah_learning_goals WHERE student_id IN (SELECT id FROM bna_students WHERE notes LIKE $1 OR name LIKE $1)`, [`${MARKER}%`]],
    [`DELETE FROM bna_devices WHERE metadata->>'seed_marker' = $1 OR device_name LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_payment_intake WHERE source_context->>'seed_marker' = $1 OR notes LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_students WHERE notes LIKE $1 OR name LIKE $1 OR parent_email = $2`, [`${MARKER}%`, TEST_EMAIL]],
    [`DELETE FROM bna_signup_agreement_signatures WHERE metadata->>'seed_marker' = $1 OR signer_email = $2`, [MARKER, TEST_EMAIL]],
    [`DELETE FROM signups WHERE notes LIKE $1 OR parent_email = $2 OR student_name LIKE $1`, [`${MARKER}%`, TEST_EMAIL]],
    [`DELETE FROM bna_tasks WHERE ai_parsed->>'seed_marker' = $1 OR title LIKE $2`, [MARKER, `${MARKER}%`]],
    [`DELETE FROM bna_workspace_invitations WHERE metadata->>'seed_marker' = $1 OR email = $2`, [MARKER, TEST_EMAIL]],
    [`DELETE FROM bna_project_members WHERE metadata->>'seed_marker' = $1 OR login_username = $2`, [MARKER, 'test_seed_operator']],
    [`DELETE FROM bna_projects WHERE project_key = $1 OR metadata->>'seed_marker' = $2`, [PROJECT_KEY, MARKER]],
    [`DELETE FROM bna_workspaces WHERE workspace_key = $1 OR metadata->>'seed_marker' = $2`, [WORKSPACE_KEY, MARKER]],
  ];

  for (const [text, params] of queries) await client.query(text, params);
  return queries.length;
}

async function seed(client) {
  const deleted_steps = await cleanup(client);

  const workspace = (await client.query(
    `INSERT INTO bna_workspaces (workspace_key, workspace_type, name, short_name, metadata)
     VALUES ($1, 'school', $2, 'TEST Seed', $3::jsonb)
     RETURNING id`,
    [WORKSPACE_KEY, `${MARKER} Workspace`, json({ seed_marker: MARKER, lane: 'workspaces' })],
  )).rows[0];

  const project = (await client.query(
    `INSERT INTO bna_projects (workspace_id, project_key, name, short_name, description, metadata)
     VALUES ($1, $2, $3, 'TEST Seed', $4, $5::jsonb)
     RETURNING id`,
    [workspace.id, PROJECT_KEY, `${MARKER} Project`, 'Isolated BNA acceptance-test fixture project.', json({ seed_marker: MARKER, lane: 'workspaces' })],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_project_members (workspace_id, project_id, person_name, role, access_level, login_username, metadata)
     VALUES ($1, $2, $3, 'owner', 'owner', 'test_seed_operator', $4::jsonb)`,
    [workspace.id, project.id, `${MARKER} Operator`, json({ seed_marker: MARKER, lane: 'users' })],
  );

  await client.query(
    `INSERT INTO bna_workspace_invitations (workspace_id, project_id, email, person_name, role, access_level, invited_by, metadata)
     VALUES ($1, $2, $3, $4, 'viewer', 'viewer', 'test_seed_operator', $5::jsonb)`,
    [workspace.id, project.id, TEST_EMAIL, `${MARKER} Invitee`, json({ seed_marker: MARKER, lane: 'users' })],
  );

  const signup = (await client.query(
    `INSERT INTO signups (workspace_id, parent_name, parent_email, parent_phone, student_name, student_age, previous_school,
       reason_applying, payment_method, payment_status, payment_amount, form_language, waiver_accepted,
       tuition_agreement_accepted, status, tags, notes)
     VALUES ($1, $2, $3, '+972000000000', $4, 11, 'TEST Previous School', 'Acceptance-test signup fixture',
       'bank_transfer', 'pending', 1000, 'he', true, true, 'new', ARRAY['TEST'], $5)
     RETURNING id`,
    [workspace.id, `${MARKER} Parent`, TEST_EMAIL, TEST_STUDENT, `${MARKER} signup/contact/community fixture`],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_signup_agreement_signatures (workspace_id, signup_id, agreement_type, agreement_version, agreement_text,
       signer_name, signer_email, metadata)
     VALUES ($1, $2, 'parent_handbook', 'TEST', 'TEST agreement text', $3, $4, $5::jsonb)`,
    [workspace.id, signup.id, `${MARKER} Parent`, TEST_EMAIL, json({ seed_marker: MARKER, lane: 'communities' })],
  );

  const student = (await client.query(
    `INSERT INTO bna_students (workspace_id, signup_id, name, parent_name, parent_email, parent_phone, age, grade,
       current_school, student_access_code, status, tags, notes)
     VALUES ($1, $2, $3, $4, $5, '+972000000000', 11, 'TEST', 'TEST Previous School',
       'TEST-SEED-CODE', 'active', ARRAY['TEST'], $6)
     RETURNING id`,
    [workspace.id, signup.id, TEST_STUDENT, `${MARKER} Parent`, TEST_EMAIL, `${MARKER} student fixture`],
  )).rows[0];

  const task = (await client.query(
    `INSERT INTO bna_tasks (workspace_id, title, notes, stage, category, urgency, source, source_context, ai_parsed,
       created_by, assigned_to, related_signup_id)
     VALUES ($1, $2, $3, 'decision_required', 'operations', 'today', 'import', $4, $5::jsonb, 'test-seed', 'System Work', $6)
     RETURNING id`,
    [
      workspace.id,
      `${MARKER}: Decision fixture`,
      'Decision Required record for acceptance-test routing.',
      MARKER,
      json({ seed_marker: MARKER, lane: 'decisions' }),
      signup.id,
    ],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_task_comments (workspace_id, task_id, author, body, source, source_context)
     VALUES ($1, $2, 'test-seed', $3, 'system', $4::jsonb)`,
    [workspace.id, task.id, `${MARKER}: helper/action audit comment`, json({ seed_marker: MARKER, lane: 'tasks' })],
  );

  await client.query(
    `INSERT INTO bna_payment_intake (workspace_id, signup_id, parent_name, parent_email, student_name, amount, method,
       payment_type, status, source, source_context, notes)
     VALUES ($1, $2, $3, $4, $5, 1000, 'bank_transfer', 'registration', 'needs_signup', 'manual', $6::jsonb, $7)`,
    [workspace.id, signup.id, `${MARKER} Parent`, TEST_EMAIL, TEST_STUDENT, json({ seed_marker: MARKER, lane: 'accounting' }), `${MARKER} payment/community fixture`],
  );

  const contentJob = (await client.query(
    `INSERT INTO bna_content_jobs (workspace_id, title, source_type, status, transcript_text, parse_json, notes)
     VALUES ($1, $2, 'manual', 'transcribed', $3, $4::jsonb, $5)
     RETURNING id`,
    [workspace.id, `${MARKER}: Content fixture`, 'TEST transcript for class/content fixture.', json({ seed_marker: MARKER, lane: 'content' }), `${MARKER} content fixture`],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_content_outputs (workspace_id, job_id, output_type, title, body, platform, status, metadata)
     VALUES ($1, $2, 'parent_email', $3, 'TEST parent update body.', 'email', 'draft', $4::jsonb)`,
    [workspace.id, contentJob.id, `${MARKER}: Parent update draft`, json({ seed_marker: MARKER, lane: 'content' })],
  );

  await client.query(
    `INSERT INTO bna_class_sessions (workspace_id, content_job_id, class_date, title, summary, topics, student_questions, transcript_text)
     VALUES ($1, $2, CURRENT_DATE, $3, 'TEST class summary.', $4::jsonb, $5::jsonb, 'TEST transcript')`,
    [
      workspace.id,
      contentJob.id,
      `${MARKER}: Live class fixture`,
      json(['TEST topic', 'self-governance']),
      json([{ student: TEST_STUDENT, question: 'TEST question?' }]),
    ],
  );

  const goal = (await client.query(
    `INSERT INTO bna_accountability_events (workspace_id, event_type, student_id, student_name, title, notes, topic,
       progress_percent, follow_up_required, metadata, source)
     VALUES ($1, 'student_goal', $2, $3, $4, 'TEST Hebrew/RTL goal fixture.', 'Hebrew goal', 50, true, $5::jsonb, 'manual')
     RETURNING id`,
    [workspace.id, student.id, TEST_STUDENT, TEST_HEBREW_GOAL, json({ seed_marker: MARKER, lane: 'hebrew_goals' })],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_accountability_events (workspace_id, event_type, student_id, student_name, title, notes, metadata, source)
     VALUES ($1, 'decision', $2, $3, $4, 'TEST decision/accountability event.', $5::jsonb, 'manual')`,
    [workspace.id, student.id, TEST_STUDENT, `${MARKER}: Accountability decision`, json({ seed_marker: MARKER, lane: 'events' })],
  );

  const torahGoal = (await client.query(
    `INSERT INTO bna_torah_learning_goals (workspace_id, student_id, goal_minutes, goal_type, active, start_date)
     VALUES ($1, $2, 30, 'INSIDE', true, CURRENT_DATE)
     RETURNING id`,
    [workspace.id, student.id],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_torah_learning_entries (workspace_id, student_id, goal_id, date, inside_engaged_minutes,
       counted_minutes, individual_percentage, daily_completion_percentage, note)
     VALUES ($1, $2, $3, CURRENT_DATE, 15, 15, 50, 50, $4)`,
    [workspace.id, student.id, torahGoal.id, `${MARKER} Torah entry fixture`],
  );

  const groupGoal = (await client.query(
    `INSERT INTO bna_group_goals (workspace_id, title, description, target_minutes, scoring_rule, metadata)
     VALUES ($1, $2, 'TEST group goal fixture.', 30, 'inside_minutes', $3::jsonb)
     RETURNING id`,
    [workspace.id, `${MARKER}: Group Goal`, json({ seed_marker: MARKER, lane: 'events' })],
  )).rows[0];

  await client.query(
    `INSERT INTO bna_group_goal_entries (workspace_id, goal_id, student_id, student_name, target_minutes,
       inside_following_minutes, weighted_minutes, progress_percent, notes, source_content_job_id, metadata)
     VALUES ($1, $2, $3, $4, 30, 15, 15, 50, $5, $6, $7::jsonb)`,
    [workspace.id, groupGoal.id, student.id, TEST_STUDENT, `${MARKER} group entry fixture`, contentJob.id, json({ seed_marker: MARKER, lane: 'events' })],
  );

  await client.query(
    `INSERT INTO bna_devices (workspace_id, student_id, device_name, platform, provider, provider_device_id, metadata)
     VALUES ($1, $2, $3, 'android', 'mock', 'TEST-SEED-DEVICE', $4::jsonb)`,
    [workspace.id, student.id, `${MARKER}: Mock tablet`, json({ seed_marker: MARKER, lane: 'students' })],
  );

  await client.query(
    `INSERT INTO bna_assistant_memory (workspace_id, project_id, user_key, user_role, surface, module_key,
       subject_type, subject_id, memory_key, memory_value, visibility, metadata)
     VALUES ($1, $2, $3, 'owner', 'operations', 'assistant', 'student', $4, 'test_seed_context',
       'TEST scoped memory for acceptance tests.', 'scoped', $5::jsonb)`,
    [workspace.id, project.id, MARKER, String(student.id), json({ seed_marker: MARKER, lane: 'helper_memory' })],
  );

  for (const actionKey of ['automations.read_status', 'integrations.read_status']) {
    await client.query(
      `INSERT INTO bna_assistant_action_audit (workspace_id, project_id, requester_key, requester_role, surface,
         action_key, action_label, target_type, target_id, risk_level, confirmation_tier, result, result_summary, metadata)
       VALUES ($1, $2, $3, 'owner', 'operations', $4, $5, 'workspace', $6, 'read_only', 'none', 'executed', $7, $8::jsonb)`,
      [
        workspace.id,
        project.id,
        MARKER,
        actionKey,
        `TEST ${actionKey}`,
        PROJECT_KEY,
        `${MARKER} helper action fixture`,
        json({ seed_marker: MARKER, lane: actionKey.startsWith('automations') ? 'automations' : 'integrations' }),
      ],
    );
  }

  return { deleted_steps, workspace_id: workspace.id, project_id: project.id, signup_id: signup.id, student_id: student.id, task_id: task.id, goal_id: goal.id };
}

async function mutate(command) {
  loadLocalEnv();
  const databaseUrl = assertSafeDatabaseUrl(process.env.DATABASE_URL);
  const { Client } = await import('pg');
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();
  try {
    await client.query('BEGIN');
    const result = command === 'seed'
      ? { seeded: await seed(client) }
      : { deleted_steps: await cleanup(client), seeded: null };
    await client.query('COMMIT');
    return { marker: MARKER, command, ...result };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/bna-test-data.mjs plan
  node scripts/bna-test-data.mjs seed --dry-run
  BNA_TEST_DATA_ALLOW=1 DATABASE_URL=postgres://.../bna_test node scripts/bna-test-data.mjs seed
  BNA_TEST_DATA_ALLOW=1 DATABASE_URL=postgres://.../bna_test node scripts/bna-test-data.mjs cleanup
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'help') {
    printHelp();
    return;
  }

  if (args.command === 'plan' || args.dryRun) {
    console.log(JSON.stringify({ ...buildPlan(), command: args.command, dry_run: args.dryRun }, null, 2));
    return;
  }

  const result = await mutate(args.command);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
