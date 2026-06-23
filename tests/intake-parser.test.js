const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  CANONICAL_ARRAY_KEYS,
  GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH,
  RAMBLE_INTAKE_TEMPLATE_PATH,
  RAMBLE_PROTOCOL_VERSION,
  parseIntakeText,
} = require('../src/lib/bna/intake-parser');
const { taskHasRequiredShape } = require('../src/lib/bna/task-shaping');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const telegramBridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const parserSource = fs.readFileSync('src/lib/bna/intake-parser.js', 'utf8');

function assertCanonicalShape(parsed) {
  assert.equal(typeof parsed.raw_input, 'string');
  assert.ok(parsed.source);
  assert.ok(parsed.language);
  assert.equal(typeof parsed.summary, 'string');
  assert.equal(parsed.ramble_protocol?.protocol_version, RAMBLE_PROTOCOL_VERSION);
  assert.equal(parsed.ramble_protocol?.internal_handoff_template, RAMBLE_INTAKE_TEMPLATE_PATH);
  for (const key of CANONICAL_ARRAY_KEYS) {
    assert.ok(Array.isArray(parsed[key]), `${key} should be an array`);
  }
  [
    ['requirements', 'REQ-'],
    ['tasks', 'TASK-'],
    ['decisions', 'DEC-'],
    ['open_questions', 'Q-'],
    ['memory_candidates', 'MEM-'],
    ['student_notes', 'NOTE-'],
    ['content_items', 'CONTENT-'],
    ['accounting_items', 'ACCT-'],
    ['contact_items', 'CONTACT-'],
  ].forEach(([key, prefix]) => {
    for (const item of parsed[key] || []) {
      assert.ok(String(item.stable_id || '').startsWith(prefix), `${key} item should have ${prefix} stable ID`);
      assert.ok(item.source_quote, `${key} item should preserve a source quote`);
      assert.ok(item.verification_method, `${key} item should include verification guidance`);
    }
  });
  for (const task of parsed.tasks) {
    assert.ok(taskHasRequiredShape(task), `task is missing canonical fields: ${JSON.stringify(task)}`);
    assert.notEqual(task.title, parsed.raw_input);
  }
}

function allStableIds(parsed) {
  return CANONICAL_ARRAY_KEYS
    .flatMap((key) => parsed[key] || [])
    .map((item) => item.stable_id)
    .filter(Boolean);
}

test('parser returns the canonical top-level shape and shaped task fields', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Task: Codex should build the dashboard parser.',
      'Decision: choose whether parents see diet notes.',
      'Ticket: dashboard parser is broken.',
      'Student Eli Cohen goal to practice Mishnah.',
      'Diet note: add a protein snack.',
    ].join(' '),
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.tasks.length >= 1);
  assert.equal(parsed.decisions.length, 1);
  assert.ok(parsed.tickets.length >= 1);
  assert.ok(parsed.goals.length >= 1);
  assert.ok(parsed.diet_nutrition_notes.length >= 1);
});

test('parser stable IDs include source context so same-day rambles do not collide', () => {
  const input = {
    raw_input: 'Task: Codex should fix the intake source.',
    source_type: 'codex_chat',
    source_date: '2026-06-23',
  };
  const first = parseIntakeText({ ...input, source_id: 'chat-a' });
  const second = parseIntakeText({ ...input, source_id: 'chat-b' });
  const repeat = parseIntakeText({ ...input, source_id: 'chat-a' });

  assert.match(first.tasks[0].stable_id, /^TASK-20260623-001-[A-F0-9]{8}$/);
  assert.equal(first.tasks[0].stable_id, repeat.tasks[0].stable_id);
  assert.notEqual(first.tasks[0].stable_id, second.tasks[0].stable_id);
});

test('task and ticket display IDs remain unique even with the same TASK prefix', () => {
  const parsed = parseIntakeText({
    raw_input: 'Task: Codex should update parser. Ticket: operations parser is broken.',
    source_type: 'codex_chat',
    source_date: '2026-06-23',
  });
  const ids = allStableIds(parsed);

  assert.equal(new Set(ids).size, ids.length);
  assert.match(parsed.tasks[0].stable_id, /^TASK-20260623-001-[A-F0-9]{8}$/);
  assert.match(parsed.tickets[0].stable_id, /^TASK-20260623-001-[A-F0-9]{8}$/);
  assert.notEqual(parsed.tasks[0].stable_id, parsed.tickets[0].stable_id);
});

test('parser display IDs use Jerusalem dates for timestamped intake', () => {
  const parsed = parseIntakeText({
    raw_input: 'Task: Codex should verify Jerusalem display IDs.',
    source_type: 'manual',
    createdAt: '2026-06-16T22:30:00.000Z',
  });

  assert.equal(parsed.ramble_protocol.source_date, '2026-06-17');
  assert.equal(parsed.ramble_protocol.raw_input_queue.source_date, '2026-06-17');
  assert.match(parsed.tasks[0].stable_id, /^TASK-20260617-001-[A-F0-9]{8}$/);
  assert.match(parsed.ramble_protocol.raw_id, /^RAW-20260617-001-[A-F0-9]{8}$/);
  assert.equal(parsed.source_envelope.source_date, '2026-06-17');
});

test('parent transcript can extract people, relationship, goal, diet note, and custom section review', () => {
  const parsed = parseIntakeText({
    raw_input: "Sarah Cohen's son Eli Cohen has a goal to read Mishnah. Nutrition note: Eli needs a protein snack. Custom section: bedtime independence.",
    source_type: 'parent_transcript',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.extracted_people.length >= 2);
  assert.ok(parsed.extracted_relationships.some((rel) => rel.relationship_type === 'parent_child'));
  assert.ok(parsed.goals.length >= 1);
  assert.ok(parsed.diet_nutrition_notes.length >= 1);
  assert.ok(parsed.custom_sections.some((section) => section.section_key === 'bedtime_independence'));
  assert.ok(parsed.review_items.some((item) => item.review_type === 'custom_section'));
});

test('ambiguous names and unclear scope stay in review instead of silent filing', () => {
  const parsed = parseIntakeText({
    raw_input: 'Student Eli needs a goal. Not sure which Eli.',
    source_type: 'manual',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.review_items.some((item) => ['unclear_scope', 'low_confidence_item', 'ambiguous_person'].includes(item.review_type)));
  assert.ok(parsed.filing_plan.some((plan) => plan.action === 'review' || plan.auto_file_allowed === false));
});

test('mixed Hebrew and English intake keeps language metadata and files obvious school notes', () => {
  const parsed = parseIntakeText({
    raw_input: 'תלמיד משה needs attendance note and goal to learn Torah today.',
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.equal(parsed.language.mixed, true);
  assert.ok(parsed.attendance.length >= 1);
  assert.ok(parsed.goals.length >= 1);
});

test('provider setup language creates provider lead without needing GHL assumptions', () => {
  const parsed = parseIntakeText({
    raw_input: 'Provider Rabbi Levi needs profile setup text for the service provider directory.',
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.provider_leads.length >= 1);
  assert.equal(parsed.provider_leads[0].section_key, 'provider_lead');
});

test('class recording content stays separate from task extraction', () => {
  const parsed = parseIntakeText({
    raw_input: 'Class recording: we learned Mishnah Berachos and discussed a pasuk source. Task: Codex should extract class notes.',
    source_type: 'content_recording',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.class_session_notes.length >= 1);
  assert.ok(parsed.tasks.length >= 1);
});

test('Google Classroom requests become backlog tickets only', () => {
  const parsed = parseIntakeText({
    raw_input: 'Please create a Google Classroom course and add students with assignments.',
    source_type: 'telegram',
  });
  assertCanonicalShape(parsed);
  assert.equal(parsed.tasks.length, 0);
  assert.equal(parsed.assignments.length, 0);
  assert.equal(parsed.tickets.length, 1);
  assert.match(parsed.tickets[0].title, /Google Classroom/i);
  assert.match(parsed.tickets[0].next_action, /future Classroom capabilities/i);
});

test('ramble protocol metadata preserves raw capture, distilled filing, and correction audits', () => {
  const parsed = parseIntakeText({
    raw_input: "No dude, that website note was not what I meant. Do not file the raw ramble; make a correction audit and then fix the parser confirmation.",
    source_type: 'telegram_ramble',
    source_date: '2026-06-16',
  });

  assertCanonicalShape(parsed);
  assert.equal(parsed.ramble_protocol.source_date, '2026-06-16');
  assert.equal(parsed.ramble_protocol.raw_queue_table, 'bna_raw_intake');
  assert.equal(parsed.ramble_protocol.raw_capture_path, 'memory/2026-06-16.md');
  assert.equal(parsed.ramble_protocol.visible_task_title_policy, 'distilled_action_titles_only');
  assert.equal(parsed.ramble_protocol.correction_audit_required, true);
  assert.equal(parsed.ramble_protocol.requirement_register_required, true);
  assert.equal(parsed.ramble_protocol.requirement_register_path, 'tasks-pending/2026-06-16-website-ramble-correction-audit.md');
  assert.ok(parsed.ramble_protocol.confirmations.some((line) => line.includes('Raw saved: memory/2026-06-16.md')));
  assert.ok(parsed.ramble_protocol.confirmations.some((line) => line.includes('Raw queue: bna_raw_intake')));
  assert.ok(parsed.ramble_protocol.confirmations.some((line) => line.includes('Future Codex handoff template')));
  assert.ok(parsed.ramble_protocol.required_closeout.some((line) => line.includes('ops/agent-task-ledger.jsonl')));
});

test('goal-mode GPT correction packets request durable Codex goal execution', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'ChatGPT made this correction output for Codex.',
      'Set it as a goal and work through the whole prompt until everything is done.',
      'Website correction: fix the parent portal and activity page.',
    ].join(' '),
    source_type: 'codex_chat',
    source_date: '2026-06-17',
  });

  assertCanonicalShape(parsed);
  assert.equal(parsed.ramble_protocol.goal_mode_execution_requested, true);
  assert.equal(parsed.ramble_protocol.gpt_correction_packet_detected, true);
  assert.equal(parsed.ramble_protocol.goal_mode_required, true);
  assert.equal(parsed.ramble_protocol.should_create_or_continue_goal, true);
  assert.equal(parsed.ramble_protocol.goal_mode_output_contract_path, GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH);
  assert.ok(parsed.ramble_protocol.terminal_requirement_statuses.includes('Done'));
  assert.ok(parsed.ramble_protocol.confirmations.some((line) => line.includes('Goal mode: create/continue')));
  assert.ok(parsed.ramble_protocol.required_closeout.some((line) => line.includes('active Codex goal status')));
  assert.equal(parsed.ramble_protocol.raw_input_queue.goal_mode_execution_requested, true);
});

test('AI-provided ramble protocol cannot suppress deterministic goal-mode metadata', () => {
  const rawInput = [
    '# BNA_GOAL_MODE_EXECUTION_PACKET',
    'Execution directive: set it as a goal and keep working through the whole correction register until done.',
    'Requirement: finish parent login fixes.',
  ].join('\n');
  const parsed = parseIntakeText({
    raw_input: rawInput,
    source_type: 'codex_chat',
    source_date: '2026-06-17',
    aiStructuredJson: {
      raw_input: rawInput,
      source_type: 'codex_chat',
      summary: 'Goal packet',
      tasks: [],
      ramble_protocol: {
        protocol_version: 'ai-stale',
        goal_mode_execution_requested: false,
        should_create_or_continue_goal: false,
        raw_input_queue: {
          goal_mode_execution_requested: false,
        },
      },
    },
  });

  assertCanonicalShape(parsed);
  assert.notEqual(parsed.ramble_protocol.protocol_version, 'ai-stale');
  assert.equal(parsed.ramble_protocol.goal_mode_execution_requested, true);
  assert.equal(parsed.ramble_protocol.gpt_correction_packet_detected, true);
  assert.equal(parsed.ramble_protocol.goal_mode_required, true);
  assert.equal(parsed.ramble_protocol.should_create_or_continue_goal, true);
  assert.equal(parsed.ramble_protocol.raw_input_queue.goal_mode_execution_requested, true);
  assert.equal(parsed.ramble_protocol.goal_mode_output_contract_path, GOAL_MODE_CORRECTION_OUTPUT_TEMPLATE_PATH);
});

test('broad website correction produces requirements, questions, memory, contact, content, and accounting lanes', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Website correction: the homepage must show the school model clearly.',
      'Question: should parents see the new section before launch?',
      'Remember from now on broad rambles need a register.',
      'Contact item: if I say GHL, route it to first-party contact records.',
      'Content idea: make this into a newsletter note.',
      'Payment note: parent paid tuition by invoice.',
    ].join(' '),
    source_type: 'telegram_ramble',
    source_date: '2026-06-16',
  });
  assertCanonicalShape(parsed);
  assert.ok(parsed.requirements.length >= 1);
  assert.ok(parsed.open_questions.length >= 1);
  assert.ok(parsed.memory_candidates.length >= 1);
  assert.ok(parsed.contact_items.length >= 1);
  assert.ok(parsed.content_items.length >= 1);
  assert.ok(parsed.accounting_items.length >= 1);
  assert.equal(parsed.contact_items[0].metadata.ghl_runtime_policy, 'first_party_bna_operations_only');
});

test('parser item keys are stable for idempotent parse item upsert', () => {
  const input = 'Task: Codex should verify the intake parser route. Custom section: morning checklist.';
  const first = parseIntakeText({ raw_input: input, source_type: 'manual' });
  const second = parseIntakeText({ raw_input: input, source_type: 'manual' });
  assert.deepEqual(
    first.filing_plan.map((plan) => plan.item_key),
    second.filing_plan.map((plan) => plan.item_key)
  );
  assert.match(server, /UNIQUE \(parse_run_id, item_key\)/);
  assert.match(server, /ON CONFLICT \(parse_run_id, item_key\)/);
  assert.ok(
    (server.match(/ON CONFLICT \(parse_item_id, review_type\) WHERE parse_item_id IS NOT NULL DO NOTHING/g) || []).length >= 2,
    'review queue inserts must be idempotent against duplicate parse-item review types'
  );
});

test('server, Operations UI, and Telegram bridge expose canonical intake workflow', () => {
  [
    'const createIntakeParserSQL',
    'CREATE TABLE IF NOT EXISTS bna_raw_intake',
    'CREATE TABLE IF NOT EXISTS bna_intake_parse_runs',
    'CREATE TABLE IF NOT EXISTS bna_intake_parse_items',
    'CREATE TABLE IF NOT EXISTS bna_section_definitions',
    'CREATE TABLE IF NOT EXISTS bna_section_records',
    'CREATE TABLE IF NOT EXISTS bna_parse_review_queue',
    "app.post('/api/bna/intake/parse'",
    "app.get('/api/bna/intake/parse-runs'",
    "app.post('/api/bna/intake/parse-runs/:id/apply'",
    "app.get('/api/bna/intake/review'",
    "app.post('/api/bna/intake/review/:id/resolve'",
    "app.get('/api/bna/intake/sections'",
    "app.get('/api/bna/sections'",
    "app.post('/api/bna/sections'",
    "app.patch('/api/bna/sections/:id'",
    'mixedRecordingParsedFromCanonical',
    "action === 'tasks_from_recording'",
    'createRawIntakeRecord',
    'updateRawIntakeRecordAfterParse',
    'raw_intake: intake.raw_intake',
    'raw_intake_stable_id: intake.raw_intake?.stable_id',
    "source_table: contentBacked && job.id ? 'bna_content_jobs' : null",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
  assert.ok(parserSource.includes('hasGoogleClassroomRequest'));
  assert.ok(parserSource.includes('RAMBLE_PROTOCOL_VERSION'));
  assert.ok(parserSource.includes('buildRambleProtocol'));
  assert.ok(parserSource.includes('requirements'));
  assert.ok(parserSource.includes('open_questions'));

  [
    'Intake Review',
    "intake: 'tasks'",
    "review_queue: 'tasks'",
    "parseIntake(payload = {})",
    "getIntakeParseRuns(filters = {})",
    'function renderIntakeReview()',
    'function renderIntakeReviewQueue()',
    'function renderIntakeSections()',
    "case 'intake': content = renderIntakeReview(); break;",
  ].forEach((needle) => assert.ok(operations.includes(needle), needle));
  const workspaceNavBlock = operations.slice(
    operations.indexOf('function workspaceNavViewIds'),
    operations.indexOf('function workspaceNavItems')
  );
  assert.doesNotMatch(workspaceNavBlock, /'intake'/);
  assert.match(operations, /low-confidence items should be handled as Decisions/);

  assert.ok(telegramBridge.includes("'/api/bna/intake/parse'"));
  assert.ok(telegramBridge.includes('parseCanonicalIntakeToApp'));
  assert.ok(telegramBridge.includes('buildRambleCaptureConfirmationLines'));
  assert.ok(telegramBridge.includes('Raw ID:'));
});
