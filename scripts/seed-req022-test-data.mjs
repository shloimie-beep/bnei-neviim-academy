#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

export const REQ022_SEED_PREFIX = 'TEST_REQ022';
export const REQ022_SEED_KEY = 'req022_safe_repeatable_seed_v1';
export const APPLY_CONFIRMATION = 'APPLY_REQ022_TEST_SEED';
export const CLEANUP_CONFIRMATION = 'CLEANUP_REQ022_TEST_SEED';
export const REQUIRED_COVERAGE = Object.freeze([
  'school_workspace',
  'service_provider_workspace',
  'family_workspace',
  'workspace_roles',
  'students',
  'assignments',
  'tasks',
  'decisions',
  'calendar',
  'content_research',
  'community',
  'automations',
  'hebrew_portal_fixture',
  'helper_action_audit',
  'cleanup_path',
]);

function normalizeRunId(value = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return normalized || 'local';
}

function sqlLiteral(value = '') {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function jsonbLiteral(value = {}) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function arrayLiteral(values = []) {
  return `ARRAY[${values.map(sqlLiteral).join(', ')}]`;
}

function seedName(runId, suffix) {
  return `${REQ022_SEED_PREFIX}_${runId}_${suffix}`.replace(/[^A-Za-z0-9_ -]+/g, '_').slice(0, 160);
}

function seedKey(runId, suffix) {
  return `${REQ022_SEED_PREFIX.toLowerCase()}_${runId}_${suffix}`.replace(/[^a-z0-9_]+/g, '_').slice(0, 120);
}

function baseMetadata(runId, area, extra = {}) {
  return {
    req022_seed_key: REQ022_SEED_KEY,
    seed_prefix: REQ022_SEED_PREFIX,
    run_id: runId,
    area,
    external_write_performed: false,
    cleanup_selector: 'metadata.req022_seed_key + TEST_REQ022 prefix',
    ...extra,
  };
}

export function buildSeedScenario(options = {}) {
  const runId = normalizeRunId(options.runId || process.env.BNA_REQ022_SEED_RUN_ID || 'local');
  const schoolProjectKey = seedKey(runId, 'school');
  const providerProjectKey = seedKey(runId, 'provider');
  const familyProjectKey = seedKey(runId, 'family');
  const schoolWorkspaceKey = seedKey(runId, 'school_workspace');
  const providerWorkspaceKey = seedKey(runId, 'provider_workspace');
  const familyWorkspaceKey = seedKey(runId, 'family_workspace');
  const studentAccessCode = seedKey(runId, 'student_access').toUpperCase();

  return {
    runId,
    seedKey: REQ022_SEED_KEY,
    prefix: REQ022_SEED_PREFIX,
    confirmation: {
      apply: APPLY_CONFIRMATION,
      cleanup: CLEANUP_CONFIRMATION,
    },
    projects: [
      { key: schoolProjectKey, name: seedName(runId, 'School Project'), type: 'school' },
      { key: providerProjectKey, name: seedName(runId, 'Provider Project'), type: 'service_provider' },
      { key: familyProjectKey, name: seedName(runId, 'Family Project'), type: 'family' },
    ],
    workspaces: [
      { key: schoolWorkspaceKey, projectKey: schoolProjectKey, name: seedName(runId, 'School Workspace'), type: 'school' },
      { key: providerWorkspaceKey, projectKey: providerProjectKey, name: seedName(runId, 'Provider Workspace'), type: 'service_provider' },
      { key: familyWorkspaceKey, projectKey: familyProjectKey, name: seedName(runId, 'Family Workspace'), type: 'family' },
    ],
    members: [
      { projectKey: schoolProjectKey, personName: seedName(runId, 'Admin'), role: 'admin', accessLevel: 'manager' },
      { projectKey: providerProjectKey, personName: seedName(runId, 'Rabbi Provider'), role: 'teacher', accessLevel: 'owner' },
      { projectKey: familyProjectKey, personName: seedName(runId, 'Parent'), role: 'parent', accessLevel: 'member' },
    ],
    student: {
      projectKey: schoolProjectKey,
      name: seedName(runId, 'Student'),
      nameEn: seedName(runId, 'Student'),
      nameHe: '\u05ea\u05dc\u05de\u05d9\u05d3 \u05d1\u05d3\u05d9\u05e7\u05d4',
      parentName: seedName(runId, 'Parent'),
      parentEmail: `${seedKey(runId, 'parent')}@example.test`,
      accessCode: studentAccessCode,
      tags: ['test:req022', `test-run:${runId}`, 'hebrew:fixture'],
    },
    helperAudit: {
      requestId: `${REQ022_SEED_PREFIX}_${runId}_helper_request`,
      planId: `${REQ022_SEED_PREFIX}_${runId}_helper_plan`,
      toolCallId: `${REQ022_SEED_PREFIX}_${runId}_helper_action`,
      workspaceKey: schoolWorkspaceKey,
      projectKey: schoolProjectKey,
    },
    schoolWorkspaceKey,
    providerWorkspaceKey,
    familyWorkspaceKey,
    schoolProjectKey,
    providerProjectKey,
    familyProjectKey,
  };
}

function cleanupStatements(scenario) {
  const prefixPattern = `${scenario.prefix}%`;
  const seedKeyValue = scenario.seedKey;
  const runId = scenario.runId;
  return [
    `DELETE FROM bna_helper_tool_audit_log WHERE request_id LIKE ${sqlLiteral(prefixPattern)} OR args_redacted->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR args_redacted->>'run_id' = ${sqlLiteral(runId)};`,
    `DELETE FROM bna_assignment_students ast USING bna_assignments a WHERE ast.assignment_id = a.id AND (a.metadata->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR a.title LIKE ${sqlLiteral(prefixPattern)});`,
    `DELETE FROM bna_assignments WHERE metadata->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR title LIKE ${sqlLiteral(prefixPattern)};`,
    `DELETE FROM bna_devices d USING bna_students s WHERE d.student_id = s.id AND (${sqlLiteral('test:req022')} = ANY(COALESCE(s.tags, ARRAY[]::text[])) OR s.name LIKE ${sqlLiteral(prefixPattern)});`,
    `DELETE FROM bna_calendar_events WHERE metadata_json->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR title LIKE ${sqlLiteral(prefixPattern)};`,
    `DELETE FROM bna_learning_communities WHERE metadata_json->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR community_key LIKE ${sqlLiteral(`${scenario.prefix.toLowerCase()}%`)};`,
    `DELETE FROM bna_automations WHERE metadata->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR automation_key LIKE ${sqlLiteral(`${scenario.prefix.toLowerCase()}%`)};`,
    `DELETE FROM bna_content_jobs WHERE title LIKE ${sqlLiteral(prefixPattern)} OR notes LIKE ${sqlLiteral(`%${seedKeyValue}%`)};`,
    `DELETE FROM bna_tasks WHERE ai_parsed->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR title LIKE ${sqlLiteral(prefixPattern)};`,
    `DELETE FROM bna_project_members WHERE metadata->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR person_name LIKE ${sqlLiteral(prefixPattern)};`,
    `DELETE FROM bna_students WHERE ${sqlLiteral('test:req022')} = ANY(COALESCE(tags, ARRAY[]::text[])) OR name LIKE ${sqlLiteral(prefixPattern)} OR student_access_code = ${sqlLiteral(scenario.student.accessCode)};`,
    `DELETE FROM bna_workspaces WHERE metadata->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR "key" LIKE ${sqlLiteral(`${scenario.prefix.toLowerCase()}%`)};`,
    `DELETE FROM bna_projects WHERE metadata->>'req022_seed_key' = ${sqlLiteral(seedKeyValue)} OR project_key LIKE ${sqlLiteral(`${scenario.prefix.toLowerCase()}%`)};`,
  ];
}

export function buildCleanupSql(scenario = buildSeedScenario()) {
  return [
    '-- REQ-20260618-111 cleanup SQL. Deletes only TEST_REQ022 rows selected by prefix or req022 metadata.',
    'BEGIN;',
    ...cleanupStatements(scenario),
    'COMMIT;',
  ].join('\n');
}

export function buildSeedSql(scenario = buildSeedScenario()) {
  const lines = [
    '-- REQ-20260618-111 safe repeatable seed SQL. TEST_REQ022 fixture prefix is preserved for compatibility.',
    '-- This script starts by cleaning prior TEST_REQ022 rows for the same fixture family.',
    'BEGIN;',
    ...cleanupStatements(scenario),
    '',
  ];

  for (const project of scenario.projects) {
    lines.push(
      `INSERT INTO bna_projects (project_key, name, short_name, description, status, metadata) VALUES (${sqlLiteral(project.key)}, ${sqlLiteral(project.name)}, ${sqlLiteral(project.type)}, ${sqlLiteral('REQ-022 isolated TEST seed project')}, 'active', ${jsonbLiteral(baseMetadata(scenario.runId, 'project', { workspace_type: project.type }))}) ON CONFLICT (project_key) DO UPDATE SET name = EXCLUDED.name, short_name = EXCLUDED.short_name, description = EXCLUDED.description, metadata = COALESCE(bna_projects.metadata, '{}'::jsonb) || EXCLUDED.metadata, updated_at = NOW();`
    );
  }

  for (const workspace of scenario.workspaces) {
    lines.push(
      `INSERT INTO bna_workspaces (project_id, "key", workspace_key, name, type, status, metadata) SELECT p.id, ${sqlLiteral(workspace.key)}, ${sqlLiteral(workspace.key)}, ${sqlLiteral(workspace.name)}, ${sqlLiteral(workspace.type)}, 'active', ${jsonbLiteral(baseMetadata(scenario.runId, 'workspace', { project_key: workspace.projectKey }))} FROM bna_projects p WHERE p.project_key = ${sqlLiteral(workspace.projectKey)} ON CONFLICT ("key") DO UPDATE SET project_id = EXCLUDED.project_id, workspace_key = EXCLUDED.workspace_key, name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, metadata = COALESCE(bna_workspaces.metadata, '{}'::jsonb) || EXCLUDED.metadata, updated_at = NOW();`
    );
  }

  for (const member of scenario.members) {
    lines.push(
      `INSERT INTO bna_project_members (project_id, person_name, role, access_level, active, metadata) SELECT p.id, ${sqlLiteral(member.personName)}, ${sqlLiteral(member.role)}, ${sqlLiteral(member.accessLevel)}, TRUE, ${jsonbLiteral(baseMetadata(scenario.runId, 'workspace_role', { project_key: member.projectKey }))} FROM bna_projects p WHERE p.project_key = ${sqlLiteral(member.projectKey)} ON CONFLICT (project_id, person_name) DO UPDATE SET role = EXCLUDED.role, access_level = EXCLUDED.access_level, active = TRUE, metadata = COALESCE(bna_project_members.metadata, '{}'::jsonb) || EXCLUDED.metadata, updated_at = NOW();`
    );
  }

  lines.push(
    `INSERT INTO bna_students (project_id, name, name_en, name_he, parent_name, parent_email, age, grade, current_school, student_access_code, student_access_enabled, status, tags, notes) SELECT p.id, ${sqlLiteral(scenario.student.name)}, ${sqlLiteral(scenario.student.nameEn)}, ${sqlLiteral(scenario.student.nameHe)}, ${sqlLiteral(scenario.student.parentName)}, ${sqlLiteral(scenario.student.parentEmail)}, 12, 'TEST', 'REQ-022 fixture school', ${sqlLiteral(scenario.student.accessCode)}, TRUE, 'active', ${arrayLiteral(scenario.student.tags)}, ${sqlLiteral(`${REQ022_SEED_KEY} safe Hebrew/student fixture`)} FROM bna_projects p WHERE p.project_key = ${sqlLiteral(scenario.student.projectKey)} ON CONFLICT (student_access_code) DO UPDATE SET project_id = EXCLUDED.project_id, name = EXCLUDED.name, name_en = EXCLUDED.name_en, name_he = EXCLUDED.name_he, parent_name = EXCLUDED.parent_name, parent_email = EXCLUDED.parent_email, tags = EXCLUDED.tags, notes = EXCLUDED.notes, updated_at = NOW();`
  );

  lines.push(
    `INSERT INTO bna_devices (student_id, device_name, platform, provider, provider_device_id, status, notes, metadata) SELECT s.id, ${sqlLiteral(seedName(scenario.runId, 'Tablet'))}, 'web', 'mock', ${sqlLiteral(seedKey(scenario.runId, 'device'))}, 'accountability_only', ${sqlLiteral('REQ-022 fixture device; no provider call')}, ${jsonbLiteral(baseMetadata(scenario.runId, 'student_device'))} FROM bna_students s WHERE s.student_access_code = ${sqlLiteral(scenario.student.accessCode)};`
  );

  lines.push(
    `INSERT INTO bna_assignments (project_id, title, instructions, source_type, language_mode, worksheet_type, schedule_text, schedule_plan, sync_mode, status, created_by, metadata) SELECT p.id, ${sqlLiteral(seedName(scenario.runId, 'Hebrew Assignment'))}, ${sqlLiteral('TEST assignment for Hebrew/RTL and student detail scoping.')}, 'manual', 'hebrew', 'reflection', 'Tomorrow 10:00', ${jsonbLiteral({ dry_run: true, no_google_write: true })}, 'app_only', 'draft', 'req022_seed', ${jsonbLiteral(baseMetadata(scenario.runId, 'assignment', { no_google_write: true }))} FROM bna_projects p WHERE p.project_key = ${sqlLiteral(scenario.schoolProjectKey)};`
  );

  lines.push(
    `INSERT INTO bna_assignment_students (assignment_id, student_id, student_name, status, sync_status, metadata) SELECT a.id, s.id, s.name, 'assigned', 'not_requested', ${jsonbLiteral(baseMetadata(scenario.runId, 'assignment_student'))} FROM bna_assignments a CROSS JOIN bna_students s WHERE a.metadata->>'req022_seed_key' = ${sqlLiteral(scenario.seedKey)} AND s.student_access_code = ${sqlLiteral(scenario.student.accessCode)};`
  );

  lines.push(
    `INSERT INTO bna_tasks (title, notes, stage, category, urgency, source, ai_parsed, created_by, assigned_to, project_id) SELECT ${sqlLiteral(seedName(scenario.runId, 'Task'))}, ${sqlLiteral('REQ-022 task fixture for Operations Tasks lane.')}, 'assigned', 'operations', 'this_week', 'manual', ${jsonbLiteral(baseMetadata(scenario.runId, 'task'))}, 'req022_seed', 'Codex', p.id FROM bna_projects p WHERE p.project_key = ${sqlLiteral(scenario.schoolProjectKey)};`,
    `INSERT INTO bna_tasks (title, notes, stage, category, urgency, source, ai_parsed, created_by, assigned_to, project_id) SELECT ${sqlLiteral(seedName(scenario.runId, 'Decision'))}, ${sqlLiteral('REQ-022 decision fixture represented as needs_decision task.')}, 'needs_decision', 'operations', 'today', 'manual', ${jsonbLiteral(baseMetadata(scenario.runId, 'decision', { decision_fixture: true }))}, 'req022_seed', 'Shloimie', p.id FROM bna_projects p WHERE p.project_key = ${sqlLiteral(scenario.schoolProjectKey)};`
  );

  lines.push(
    `INSERT INTO bna_calendar_events (workspace_key, related_type, title, description, start_at, end_at, status, visibility, source, metadata_json, created_by) VALUES (${sqlLiteral(scenario.schoolWorkspaceKey)}, 'task', ${sqlLiteral(seedName(scenario.runId, 'Calendar Check-in'))}, ${sqlLiteral('REQ-022 internal calendar fixture; no Google sync.')}, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 30 minutes', 'scheduled', 'internal', 'manual', ${jsonbLiteral(baseMetadata(scenario.runId, 'calendar', { no_google_write: true }))}, 'req022_seed');`
  );

  lines.push(
    `INSERT INTO bna_content_jobs (title, source_type, caption, status, transcript_text, parse_json, notes) VALUES (${sqlLiteral(seedName(scenario.runId, 'Content Research'))}, 'manual', ${sqlLiteral('REQ-022 reusable teaching-content fixture')}, 'needs_approval', ${sqlLiteral('TEST transcript for scoped content/research fixture.')}, ${jsonbLiteral(baseMetadata(scenario.runId, 'content_research', { project_key: scenario.schoolProjectKey }))}, ${sqlLiteral(`${REQ022_SEED_KEY} project_key=${scenario.schoolProjectKey}`)});`
  );

  lines.push(
    `INSERT INTO bna_learning_communities (workspace_key, project_id, community_key, title, description, owner_name, visibility, status, metadata_json) SELECT ${sqlLiteral(scenario.schoolWorkspaceKey)}, p.id, ${sqlLiteral(seedKey(scenario.runId, 'community'))}, ${sqlLiteral(seedName(scenario.runId, 'Community'))}, ${sqlLiteral('REQ-022 scoped community fixture')}, 'Rabbi Shloimie', 'members', 'active', ${jsonbLiteral(baseMetadata(scenario.runId, 'community'))} FROM bna_projects p WHERE p.project_key = ${sqlLiteral(scenario.schoolProjectKey)} ON CONFLICT (workspace_key, community_key) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata_json = COALESCE(bna_learning_communities.metadata_json, '{}'::jsonb) || EXCLUDED.metadata_json, updated_at = NOW();`
  );

  lines.push(
    `INSERT INTO bna_automations (automation_key, name, summary, description, package_key, package_name, service_key, service_name, scope_type, project_id, owner, responsible_person, status, automation_type, trigger_type, trigger_label, channel, audience, permissions, setup_blockers, config, metadata, created_by, updated_by) SELECT ${sqlLiteral(seedKey(scenario.runId, 'automation'))}, ${sqlLiteral(seedName(scenario.runId, 'Automation Draft'))}, ${sqlLiteral('REQ-022 local-only automation fixture')}, ${sqlLiteral('Dry-run metadata only; no external handler.')}, 'test', 'REQ-022 Test Package', 'local', 'Local only', 'project', p.id, 'Codex', 'Shloimie', 'draft', 'workflow', 'manual', 'Manual fixture trigger', 'dashboard', 'BNA Operations', ${jsonbLiteral({ registry_edits_only: true, no_external_write: true })}, ${jsonbLiteral(['Fixture only; do not enable live handler.'])}, ${jsonbLiteral({ dry_run: true })}, ${jsonbLiteral(baseMetadata(scenario.runId, 'automation', { no_external_write: true }))}, 'req022_seed', 'req022_seed' FROM bna_projects p WHERE p.project_key = ${sqlLiteral(scenario.schoolProjectKey)} ON CONFLICT (automation_key) DO UPDATE SET name = EXCLUDED.name, summary = EXCLUDED.summary, description = EXCLUDED.description, status = EXCLUDED.status, permissions = COALESCE(bna_automations.permissions, '{}'::jsonb) || EXCLUDED.permissions, setup_blockers = EXCLUDED.setup_blockers, metadata = COALESCE(bna_automations.metadata, '{}'::jsonb) || EXCLUDED.metadata, updated_by = EXCLUDED.updated_by, updated_at = NOW();`
  );

  lines.push(
    `INSERT INTO bna_helper_tool_audit_log (request_id, client_request_id, plan_id, tool_call_id, conversation_id, message_hash, tool_name, action_label, risk_level, status, requires_confirmation, confirmed, user_name, user_role, workspace_key, project_key, record_type, record_id, page_context_redacted, args_redacted, result_redacted, error_message) VALUES (${sqlLiteral(scenario.helperAudit.requestId)}, ${sqlLiteral(seedKey(scenario.runId, 'client'))}, ${sqlLiteral(scenario.helperAudit.planId)}, ${sqlLiteral(scenario.helperAudit.toolCallId)}, ${sqlLiteral(seedKey(scenario.runId, 'conversation'))}, ${sqlLiteral(seedKey(scenario.runId, 'message_hash'))}, 'open_operations_view', ${sqlLiteral(seedName(scenario.runId, 'Helper Audit'))}, 'low', 'planned', FALSE, FALSE, 'REQ-022 Seed', 'one_time_admin', ${sqlLiteral(scenario.helperAudit.workspaceKey)}, ${sqlLiteral(scenario.helperAudit.projectKey)}, 'seed_fixture', ${sqlLiteral(scenario.runId)}, ${jsonbLiteral(baseMetadata(scenario.runId, 'helper_page_context', { route: '/operations' }))}, ${jsonbLiteral(baseMetadata(scenario.runId, 'helper_args', { workspace_key: scenario.helperAudit.workspaceKey, project_key: scenario.helperAudit.projectKey }))}, ${jsonbLiteral({ dry_run: true, no_external_write: true })}, NULL);`
  );

  lines.push('COMMIT;');
  return lines.join('\n');
}

export function buildPlanJson(scenario = buildSeedScenario(), options = {}) {
  return {
    ok: true,
    dry_run: !options.apply,
    cleanup_mode: Boolean(options.cleanup),
    seed_key: scenario.seedKey,
    seed_prefix: scenario.prefix,
    run_id: scenario.runId,
    required_coverage: REQUIRED_COVERAGE,
    target_projects: scenario.projects.map((project) => project.key),
    target_workspaces: scenario.workspaces.map((workspace) => ({ key: workspace.key, type: workspace.type })),
    safety: {
      default_dry_run: true,
      apply_requires_confirmation: APPLY_CONFIRMATION,
      cleanup_requires_confirmation: CLEANUP_CONFIRMATION,
      no_external_writes: true,
      cleanup_selector: 'TEST_REQ022 prefix and req022 metadata only',
      secrets_printed: false,
    },
  };
}

export function buildMarkdownReport(scenario = buildSeedScenario(), options = {}) {
  const plan = buildPlanJson(scenario, options);
  const mode = options.cleanup ? 'cleanup' : 'seed';
  const action = options.apply ? 'apply requested' : 'dry run';
  return [
    `# REQ-20260618-111 ${mode} ${action}`,
    '',
    `- Seed key: \`${plan.seed_key}\``,
    `- Prefix: \`${plan.seed_prefix}\``,
    `- Run ID: \`${plan.run_id}\``,
    `- Dry run: \`${plan.dry_run}\``,
    `- Cleanup mode: \`${plan.cleanup_mode}\``,
    '- External writes: `false`',
    '- Secrets printed: `false`',
    '- Cleanup selector: `TEST_REQ022` prefix plus `req022_seed_key` metadata.',
    '',
    '## Coverage',
    '',
    ...REQUIRED_COVERAGE.map((item) => `- ${item}`),
    '',
    '## Apply Guard',
    '',
    `- Seed apply requires \`${APPLY_CONFIRMATION}\`.`,
    `- Cleanup apply requires \`${CLEANUP_CONFIRMATION}\`.`,
    '- Without the phrase, this script only writes/prints SQL and does not connect to Postgres.',
    '',
  ].join('\n');
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    apply: false,
    cleanup: false,
    confirm: '',
    runId: '',
    outDir: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--cleanup') options.cleanup = true;
    else if (arg === '--run-id') options.runId = argv[++index] || '';
    else if (arg === '--out-dir') options.outDir = argv[++index] || '';
    else if (arg === '--confirm') options.confirm = argv[++index] || '';
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function helpText() {
  return [
    'Usage: node scripts/seed-req022-test-data.mjs [--dry-run] [--cleanup] [--apply --confirm PHRASE] [--run-id ID] [--out-dir DIR]',
    '',
    'Default mode is dry-run. Real database writes require DATABASE_URL and an explicit confirmation phrase.',
    `Seed apply phrase: ${APPLY_CONFIRMATION}`,
    `Cleanup apply phrase: ${CLEANUP_CONFIRMATION}`,
  ].join('\n');
}

function writeOutputs(outDir, scenario, options, sqlText) {
  if (!outDir) return [];
  const resolved = path.resolve(repoRoot, outDir);
  fs.mkdirSync(resolved, { recursive: true });
  const files = [
    ['plan.json', `${JSON.stringify(buildPlanJson(scenario, options), null, 2)}\n`],
    ['report.md', buildMarkdownReport(scenario, options)],
    [options.cleanup ? 'cleanup.sql' : 'seed.sql', `${sqlText}\n`],
    [options.cleanup ? 'seed.sql' : 'cleanup.sql', `${options.cleanup ? buildSeedSql(scenario) : buildCleanupSql(scenario)}\n`],
  ];
  for (const [name, contents] of files) {
    fs.writeFileSync(path.join(resolved, name), contents);
  }
  return files.map(([name]) => path.join(resolved, name));
}

async function executeSql(sqlText) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for --apply');
  }
  const { Client } = await import('pg');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sqlText);
  } finally {
    await client.end();
  }
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    console.log(helpText());
    return;
  }
  const scenario = buildSeedScenario({ runId: options.runId });
  const sqlText = options.cleanup ? buildCleanupSql(scenario) : buildSeedSql(scenario);
  const report = buildMarkdownReport(scenario, options);
  const written = writeOutputs(options.outDir, scenario, options, sqlText);

  if (options.apply) {
    const required = options.cleanup ? CLEANUP_CONFIRMATION : APPLY_CONFIRMATION;
    if (options.confirm !== required) {
      throw new Error(`Refusing database write. Pass --confirm ${required}.`);
    }
    await executeSql(sqlText);
  }

  console.log(report);
  if (written.length) {
    console.log('## Files');
    for (const file of written) {
      console.log(`- ${path.relative(repoRoot, file).replace(/\\/g, '/')}`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error.message || String(error));
    process.exit(1);
  });
}
