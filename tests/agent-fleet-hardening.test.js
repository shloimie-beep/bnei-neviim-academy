const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const {
  AGENT_FLEET_PERMISSION_TIERS,
  buildParentCoordinationAudit,
  buildStartupShortcutMatrix,
  classifyAgentFleetCommand,
  redactAgentFleetText,
} = require('../src/lib/bna/agent-fleet-hardening');

test('agent fleet permission tiers classify safe, release, and blocked commands', () => {
  assert.equal(AGENT_FLEET_PERMISSION_TIERS.tier_3.blocked_by_default, true);
  assert.equal(classifyAgentFleetCommand('npm test').tier, 0);
  assert.equal(classifyAgentFleetCommand('git commit -m checkpoint').tier, 1);
  assert.equal(classifyAgentFleetCommand('npm run railway:doctor').tier, 2);
  const send = classifyAgentFleetCommand('node scripts/send-parent-update.mjs --send');
  assert.equal(send.tier, 3);
  assert.equal(send.blocked_by_default, true);
  const backfill = classifyAgentFleetCommand('APPLY_GUARDED_CLASS_BACKFILL=true npm run class:backfill');
  assert.equal(backfill.tier, 3);
  assert.equal(backfill.allowed_without_decision, false);
});

test('agent fleet redaction removes common secret-shaped values from logs', () => {
  const text = [
    'Authorization: Bearer abc123456789SECRET',
    `token=ghp_${'A'.repeat(24)}`,
    `api_key=sk-${'b'.repeat(24)}`,
  ].join('\n');
  const redacted = redactAgentFleetText(text);

  assert.doesNotMatch(redacted, /abc123456789SECRET/);
  assert.doesNotMatch(redacted, /ghp_A/);
  assert.doesNotMatch(redacted, /sk-b/);
  assert.match(redacted, /\[redacted/);
});

test('parent coordination audit catches pointer drift and duplicate canonical tasks', () => {
  const clean = buildParentCoordinationAudit({
    latest: { path: 'ops/execution-runs/2026-06-24-issue-20-parent-run' },
    laneManifest: {
      parent_run_path: 'ops/execution-runs/2026-06-24-issue-20-parent-run',
      active_pointer_owner: 'parent',
      parent_branch: 'codex/issue-20-parent-run-20260624',
      lanes: [
        { lane_id: 'agent-fleet', status: 'queued', requirement_ids: ['REQ-20260624-045'] },
        { lane_id: 'final-integration', status: 'done', requirement_ids: ['REQ-20260624-048'] },
      ],
    },
    requirements: {
      requirements: [
        { id: 'REQ-20260624-045', status: 'not_started' },
        { id: 'REQ-20260624-048', status: 'not_started', depends_on: ['REQ-20260624-045'] },
      ],
      tasks: [
        { canonical_task_key: 'bna_platform|agent_fleet|REQ-20260624-045' },
      ],
    },
    git: { branch: 'codex/issue-20-parent-run-20260624' },
  });
  assert.equal(clean.ok, true);
  assert.equal(clean.finding_count, 0);

  const drift = buildParentCoordinationAudit({
    latest: { path: 'ops/execution-runs/other' },
    laneManifest: {
      parent_run_path: 'ops/execution-runs/2026-06-24-issue-20-parent-run',
      active_pointer_owner: 'child',
      lanes: [],
    },
    requirements: {
      requirements: [{ id: 'REQ-1' }, { id: 'REQ-1' }],
      tasks: [{ canonical_task_key: 'dup' }, { canonical_task_key: 'dup' }],
    },
  });

  assert.equal(drift.ok, false);
  assert.ok(drift.findings.some((finding) => finding.type === 'active_pointer_drift'));
  assert.ok(drift.findings.some((finding) => finding.type === 'duplicate_requirement_id'));
  assert.ok(drift.findings.some((finding) => finding.type === 'duplicate_canonical_task'));
});

test('parent coordination audit supports active continuation run requirement IDs and no-upstream warnings', () => {
  const audit = buildParentCoordinationAudit({
    latest: { path: 'ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation' },
    laneManifest: {
      parent_run_path: 'ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation',
      active_pointer_owner: 'parent',
      lanes: [
        { lane_id: 'agent-fleet', status: 'blocked', requirement_ids: ['REQ-20260702-102'] },
      ],
    },
    requirements: {
      requirements: [
        { id: 'REQ-20260702-102', title: 'Verify background agent/fleet status', status: 'blocked' },
      ],
      tasks: [],
    },
    git: { branch: 'codex/chatgpt-dropoff-publish-defaults-20260704', upstream_missing: true },
    expectedAgentFleetRequirementId: 'REQ-20260702-102',
    finalRequirementId: null,
  });

  assert.equal(audit.ok, true);
  assert.ok(audit.findings.some((finding) => finding.type === 'branch_has_no_upstream'));
  assert.equal(audit.findings.some((finding) => finding.type === 'active_pointer_drift'), false);
  assert.equal(audit.findings.some((finding) => finding.type === 'agent_fleet_lane_scope'), false);
});

test('startup shortcut matrix exposes start stop restart status and open-log controls', () => {
  const actions = new Set(buildStartupShortcutMatrix().map((item) => item.action));
  for (const action of ['start', 'stop', 'restart', 'status', 'open_log', 'watchdog_start', 'watchdog_stop', 'watchdog_status']) {
    assert.equal(actions.has(action), true);
  }
});

test('supervisor and Windows launchers wire the hardening controls', async () => {
  const supervisor = fs.readFileSync('scripts/agent-fleet-supervisor.mjs', 'utf8');
  const fleetPs1 = fs.readFileSync('scripts/start-agent-fleet.ps1', 'utf8');
  const fleetStartupPs1 = fs.readFileSync('scripts/register-agent-fleet-startup.ps1', 'utf8');
  const fleetStartupVbs = fs.readFileSync('scripts/run-agent-fleet-startup.vbs', 'utf8');
  const watchdogPs1 = fs.readFileSync('scripts/start-watchdog.ps1', 'utf8');
  const supervisorModule = await import(pathToFileURL(path.join(process.cwd(), 'scripts', 'agent-fleet-supervisor.mjs')).href);
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.equal(supervisorModule.AGENT_FLEET_PERMISSION_TIERS.tier_3.blocked_by_default, true);
  assert.equal(supervisorModule.classifyAgentFleetCommand('node scripts/send.mjs --send').tier, 3);
  assert.equal(
    supervisorModule.buildTaskQueueReconcilerCommand({ dryRun: true }),
    'node scripts/task-queue-reconciler.mjs --no-telegram',
  );
  assert.equal(
    supervisorModule.buildTaskQueueReconcilerCommand({ dryRun: false }),
    'node scripts/task-queue-reconciler.mjs --apply --no-telegram',
  );
  assert.equal(
    supervisorModule.buildChatGptDropoffIngestCommand({ dryRun: false }, { chatGptDropoffLimit: 3 }),
    'node scripts/chatgpt-dropoff-ingestor.mjs --apply --json --limit 3',
  );
  assert.equal(
    supervisorModule.buildChatGptDropoffIngestCommand({ dryRun: true }, { chatGptDropoffLimit: 3 }),
    'node scripts/chatgpt-dropoff-ingestor.mjs --json --limit 3',
  );
  assert.equal(
    supervisorModule.buildChatGptDropoffCommentCollectCommand({ dryRun: false }, { chatGptDropoffCommentLimit: 5 }),
    'node scripts/chatgpt-dropoff-comment-collector.mjs --apply --json --limit 5',
  );
  assert.equal(
    supervisorModule.buildChatGptDropoffCommentCollectCommand({ dryRun: true }, { chatGptDropoffCommentLimit: 5 }),
    'node scripts/chatgpt-dropoff-comment-collector.mjs --json --limit 5',
  );
  assert.deepEqual(
    supervisorModule.filterObservableJobsForClaim(
      [
        { id: 10, task_id: 501, status: 'queued' },
        { id: 11, task_id: 502, status: 'queued' },
        { id: 12, status: 'queued' },
        { id: 13, task_id: 501, status: 'running' },
        { id: 14, task_id: 503, status: 'queued' },
        { id: 15, task_id: 504, status: 'queued' },
      ],
      [
        { id: 501, stage: 'assigned', assigned_to: 'Codex' },
        { id: 502, stage: 'done', assigned_to: 'Codex' },
        {
          id: 503,
          stage: 'assigned',
          assigned_to: 'Codex',
          ai_parsed: {
            agent_executable: false,
            recording_review_task: true,
          },
        },
        {
          id: 504,
          stage: 'assigned',
          assigned_to: 'Codex',
          ai_parsed: {
            needs_human_review: true,
          },
        },
      ],
      { tasks: {} },
      { taskTimeoutMs: 1000, maxRetries: 2 },
    ).map((job) => job.id),
    [10],
  );
  assert.deepEqual(
    supervisorModule.observableJobTaskIdsMissingFromTasks(
      [
        { id: 385, task_id: 1869, status: 'queued' },
        { id: 386, task_id: 501, status: 'queued' },
      ],
      [{ id: 501, stage: 'assigned', assigned_to: 'Codex' }],
    ),
    [1869],
  );
  const hydratedTasks = supervisorModule.mergeTasksById(
    [{ id: 501, stage: 'assigned', assigned_to: 'Codex' }],
    [{ id: 1869, stage: 'assigned', assigned_to: 'Codex' }],
  );
  assert.deepEqual(
    supervisorModule.filterObservableJobsForClaim(
      [{ id: 385, task_id: 1869, status: 'queued' }],
      hydratedTasks,
      { tasks: {} },
      { taskTimeoutMs: 1000, maxRetries: 2 },
    ).map((job) => job.id),
    [385],
  );
  assert.deepEqual(
    supervisorModule.sortObservableJobsForClaim(
      [
        { id: 377, task_id: 1851, status: 'queued', created_at: '2026-07-05T10:00:00Z' },
        { id: 385, task_id: 1869, status: 'queued', created_at: '2026-07-05T11:00:00Z' },
      ],
      [
        { id: 1851, stage: 'assigned', assigned_to: 'Codex', source_channel: 'manual', urgency: 'urgent' },
        { id: 1869, stage: 'assigned', assigned_to: 'Codex', source_channel: 'chatgpt_dropoff', urgency: 'this_week' },
      ],
    ).map((job) => job.id),
    [385, 377],
  );
  assert.match(supervisor, /hydrateObservableJobTasks/);
  assert.match(supervisor, /loadTaskById\(config, linkedTaskId\)/);
  assert.match(supervisor, /notifyAgentFleet/);
  assert.match(supervisor, /Could not send \${label}/);
  assert.match(supervisor, /permission_tier_3_blocked/);
  assert.match(supervisor, /Permission tiers: Tier 0/);
  assert.match(supervisor, /redactAgentFleetText/);
  assert.match(supervisor, /runChatGptDropoffCommentCollectBeforeClaim/);
  assert.match(supervisor, /AGENT_FLEET_CHATGPT_COMMENT_COLLECT/);
  assert.match(supervisor, /AGENT_FLEET_KIMI_FALLBACK_ENABLED/);
  assert.match(supervisor, /kimi-k2\.7-code-highspeed/);
  assert.match(supervisor, /function shouldRunKimiFallback/);
  assert.match(supervisor, /function runKimiFallback/);
  assert.match(supervisor, /Kimi coding fallback/);
  assert.match(fleetStartupPs1, /\$createArgs = @\("\/Create"/);
  assert.match(fleetStartupPs1, /schtasks\.exe @createArgs/);
  assert.match(fleetStartupPs1, /"\/SC", "ONLOGON"/);
  assert.match(fleetStartupPs1, /run-agent-fleet-startup\.vbs/);
  assert.match(fleetStartupPs1, /\[Environment\]::GetFolderPath\("Startup"\)/);
  assert.match(fleetStartupPs1, /BNA-Agent-Fleet\.vbs/);
  assert.match(fleetStartupPs1, /installed user Startup fallback instead/);
  assert.match(fleetStartupVbs, /start-agent-fleet\.ps1/);
  assert.match(fleetStartupVbs, /shell\.Run command, 0, False/);
  assert.equal(
    packageJson.scripts['agent:fleet:register-startup'],
    'powershell -ExecutionPolicy Bypass -File scripts/register-agent-fleet-startup.ps1',
  );
  assert.equal(
    packageJson.scripts['chatgpt:dropoff:comments:apply'],
    'node scripts/chatgpt-dropoff-comment-collector.mjs --apply --json',
  );

  for (const script of [fleetPs1, watchdogPs1]) {
    assert.match(script, /\[switch\]\$Stop/);
    assert.match(script, /\[switch\]\$Status/);
    assert.match(script, /\[switch\]\$OpenLog/);
    assert.match(script, /\$MaxStartAttempts/);
    assert.match(script, /Get-CurrentLoginName/);
    assert.match(script, /-WindowStyle Hidden/);
    assert.match(script, /Start-Process -FilePath "notepad\.exe"/);
  }
});

test('readiness script contains no-write synthetic GitHub and result bridge proof', () => {
  const script = fs.readFileSync('scripts/agent-fleet-readiness.mjs', 'utf8');

  assert.match(script, /buildGitHubIntakePreview/);
  assert.match(script, /buildGitHubStatusPreview/);
  assert.match(script, /record_agent_result/);
  assert.match(script, /external_write_performed: false/);
  assert.match(script, /parent_run_not_marked_complete: true/);
  assert.match(script, /resolveActiveRunRelativePath/);
  assert.match(script, /synthesizeLaneManifest/);
  assert.match(script, /upstream_missing/);
  assert.match(script, /stdio: \['ignore', 'pipe', 'pipe'\]/);
});
