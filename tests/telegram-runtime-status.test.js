const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const {
  TELEGRAM_SIDEKICK_RUNTIME_KEYS,
  assertTelegramBridgeStartupPolicy,
  buildTelegramPrivateIdentityProfile,
  buildTelegramRuntimeReadiness,
} = require('../src/lib/bna/telegram-runtime-status');

test('Telegram runtime readiness prefers fresh hosted academy worker heartbeat', () => {
  const readiness = buildTelegramRuntimeReadiness({
    tokenConfigured: true,
    allowedChatIdsConfigured: true,
    localLock: { present: false, updated_at: null, age_minutes: null },
    localLog: { present: false, updated_at: null, age_minutes: null },
    hostedRuntime: {
      agent_key: TELEGRAM_SIDEKICK_RUNTIME_KEYS.shloimie,
      status: 'running',
      stale: false,
      last_seen_at: '2026-06-17T14:30:00.000Z',
      host: 'academy-worker',
      pid: 4242,
      mode: 'academy-polling',
      details: { process_selector: 'telegram-academy' },
    },
  });

  assert.equal(readiness.configured, true);
  assert.equal(readiness.status, 'configured');
  assert.deepEqual(readiness.blockers, []);
  assert.equal(readiness.details.runtime_source, 'agent_runtime_status');
  assert.equal(readiness.details.bridge_runtime_healthy, true);
  assert.equal(readiness.details.bridge_runtime_status, 'running');
  assert.equal(readiness.details.bridge_runtime_host, 'academy-worker');
});

test('Telegram runtime readiness marks stale hosted worker as blocked', () => {
  const readiness = buildTelegramRuntimeReadiness({
    tokenConfigured: true,
    allowedChatIdsConfigured: true,
    localLock: { present: false, updated_at: null, age_minutes: null },
    localLog: { present: false, updated_at: null, age_minutes: null },
    hostedRuntime: {
      agent_key: TELEGRAM_SIDEKICK_RUNTIME_KEYS.shloimie,
      status: 'running',
      stale: true,
      last_seen_at: '2026-06-17T12:00:00.000Z',
      host: 'academy-worker',
    },
  });

  assert.equal(readiness.status, 'blocked_runtime_stale');
  assert.equal(readiness.details.bridge_runtime_stale, true);
  assert.match(readiness.blockers.join('\n'), /heartbeat is stale/i);
});

test('Telegram runtime readiness falls back to local lock when no hosted worker heartbeat exists', () => {
  const readiness = buildTelegramRuntimeReadiness({
    tokenConfigured: true,
    allowedChatIdsConfigured: true,
    localLock: { present: true, updated_at: '2026-06-17T14:31:00.000Z', age_minutes: 5 },
    localLog: { present: true, updated_at: '2026-06-17T14:31:00.000Z', age_minutes: 5 },
    hostedRuntime: null,
  });

  assert.equal(readiness.status, 'configured');
  assert.equal(readiness.details.runtime_source, 'local_runtime_files');
  assert.equal(readiness.details.bridge_runtime_status, 'running_local');
});

test('academy bridge source files wire hosted heartbeat reporting and status readback', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const server = fs.readFileSync('server.js', 'utf8');

  assert.match(bridge, /TELEGRAM_SIDEKICK_RUNTIME_KEYS\.rabbi/);
  assert.match(bridge, /TELEGRAM_SIDEKICK_RUNTIME_KEYS\.shloimie/);
  assert.match(bridge, /assertTelegramBridgeStartupPolicy\(config, botIdentity\)/);
  assert.doesNotMatch(bridge, /AllowedChats=\$\{config\.allowedChatIds\.join/);
  assert.doesNotMatch(bridge, /Allowed chats: \$\{config\.allowedChatIds\.join/);
  assert.match(bridge, /\/api\/bna\/agent-fleet\/status/);
  assert.match(bridge, /process_selector: process\.env\.BNA_RAILWAY_PROCESS/);
  assert.match(server, /async function buildTelegramStatusCard\(/);
  assert.match(server, /loadAgentRuntimeStatus\(TELEGRAM_SIDEKICK_RUNTIME_KEYS\.shloimie\)/);
  assert.match(server, /loadAgentRuntimeStatus\(TELEGRAM_SIDEKICK_RUNTIME_KEYS\.legacyAcademy\)/);
  assert.match(server, /await buildTelegramStatusCard\(\)/);
});

test('Telegram private sidekick profiles are server-derived and fail closed', () => {
  const shloimie = buildTelegramPrivateIdentityProfile({
    bridgeProfile: 'bna',
    botToken: 'token',
    allowedChatIds: ['123', '123', '456'],
  }, { id: 'bot-1', username: 'academy_bot' });
  assert.equal(shloimie.profile_key, 'telegram_shloimie_super_admin');
  assert.equal(shloimie.role, 'super_admin');
  assert.equal(shloimie.scope.type, 'all');
  assert.equal(shloimie.allowed_chat_ids_count, 2);
  assert.equal(shloimie.runtime_agent_key, TELEGRAM_SIDEKICK_RUNTIME_KEYS.shloimie);

  const rabbi = buildTelegramPrivateIdentityProfile({
    bridgeProfile: 'rabbi-elie-scheller',
    botToken: 'token',
    allowedChatIds: ['789'],
  }, { id: 'bot-2', username: 'rabbi_bot' });
  assert.equal(rabbi.profile_key, 'telegram_rabbi_scheller_provider');
  assert.equal(rabbi.role, 'provider_admin');
  assert.equal(rabbi.scope.workspace_key, 'rabbi_sheller_provider');
  assert.equal(rabbi.scope.project_key, 'one_time_mishnah_class');
  assert.equal(rabbi.runtime_agent_key, TELEGRAM_SIDEKICK_RUNTIME_KEYS.rabbi);

  assert.throws(
    () => assertTelegramBridgeStartupPolicy({
      bridgeProfile: 'bna',
      botToken: 'token',
      allowedChatIds: [],
    }, { id: 'bot-1', username: 'academy_bot' }),
    /telegram_private_chat_allowlist_missing/
  );

  assert.throws(
    () => assertTelegramBridgeStartupPolicy({
      bridgeProfile: 'rabbi-elie-scheller',
      botToken: 'token',
      allowedChatIds: ['789'],
      opsUsername: '',
      opsPassword: '',
    }, { id: 'bot-2', username: 'rabbi_bot' }),
    /rabbi_scoped_operations_credentials_missing/
  );

  assert.throws(
    () => assertTelegramBridgeStartupPolicy({
      bridgeProfile: 'bna',
      botToken: 'token',
      allowedChatIds: ['123'],
      expectedBotUsername: 'expected_bot',
    }, { id: 'bot-1', username: 'other_bot' }),
    /expected_bot_username_mismatch/
  );
});

test('legacy unsigned Telegram webhook is disabled in server route', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  assert.match(server, /app\.post\('\/api\/bna\/telegram'/);
  assert.match(server, /res\.status\(410\)\.json\(\{/);
  assert.match(server, /telegram_legacy_webhook_disabled/);
  assert.doesNotMatch(server, /app\.post\('\/api\/bna\/telegram'[\s\S]{0,260}handleTelegramMessage/);
  assert.doesNotMatch(server, /app\.post\('\/api\/bna\/telegram'[\s\S]{0,260}handleTelegramCallback/);
});

test('Telegram bridge blocks direct Zoom link mutation and send routes', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const start = bridge.indexOf('async function handleLiveClassTelegramCommand');
  const end = bridge.indexOf('async function handleTypedOperationsAction', start);
  assert.ok(start > 0 && end > start, 'live class Telegram command handler should be present');
  const handler = bridge.slice(start, end);

  assert.match(handler, /Zoom link changes are blocked from Telegram/);
  assert.match(handler, /Live class link sends are blocked from Telegram/);
  assert.doesNotMatch(handler, /appRequest\(config, 'PATCH', `\/api\/bna\/live-sessions/);
  assert.doesNotMatch(handler, /send-zoom-link/);
  assert.doesNotMatch(handler, /dryRun: false/);
  assert.doesNotMatch(handler, /Zoom: \$\{session\.zoom_meeting_url\}/);
});

test('Telegram bridge blocks raw Codex CLI execution paths', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const runCodexStart = bridge.indexOf('function runCodex(prompt, config)');
  const runCodexEnd = bridge.indexOf('function runKimi', runCodexStart);
  assert.ok(runCodexStart > 0 && runCodexEnd > runCodexStart, 'runCodex slice should be present');
  const runCodex = bridge.slice(runCodexStart, runCodexEnd);

  assert.match(bridge, /const codexEnabled = false/);
  assert.match(bridge, /rawAgentExecutionEnabled: false/);
  assert.match(bridge, /function canRunTelegramRawAgent\(config = \{\}\)/);
  assert.match(bridge, /TELEGRAM_RAW_AGENT_EXECUTION_DISABLED_MESSAGE/);
  assert.match(runCodex, /assertTelegramRawAgentExecutionAllowed\(config\);[\s\S]*spawn\(config\.codexCommand/);

  const planningStart = bridge.indexOf('if (activePlanningSession && hasExplicitPromptImplementationStart(text))');
  const planningEnd = bridge.indexOf('if (activePlanningSession && !hasPromptPlanningIntent(text)', planningStart);
  assert.ok(planningStart > 0 && planningEnd > planningStart, 'planning apply slice should be present');
  const planningApply = bridge.slice(planningStart, planningEnd);
  assert.match(planningApply, /if \(!canRunTelegramRawAgent\(config\)\)/);
  assert.match(planningApply, /captureRambleToApp\(config, codexWorkText, chatId, messageId\)/);

  const taskRoutingStart = bridge.indexOf('const replyRouting = selectTelegramReplyMode(config, chatId, text);');
  const taskRoutingEnd = bridge.indexOf('const replyParts = [reply];', taskRoutingStart);
  assert.ok(taskRoutingStart > 0 && taskRoutingEnd > taskRoutingStart, 'task routing slice should be present');
  const taskRouting = bridge.slice(taskRoutingStart, taskRoutingEnd);
  assert.match(taskRouting, /trackedCodexTasks\.length && canRunRawAgent/);
  assert.match(taskRouting, /replyRouting\.mode === 'codex' && config\.asyncAgentReplies && canRunRawAgent/);
  assert.match(taskRouting, /trackedCodexTasks\.length && config\.asyncAgentReplies && canRunRawAgent/);
  assert.doesNotMatch(taskRouting, /Kimi CLI fallback/);
});

test('academy bridge can use env-based Google Drive auth on hosted worker', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const workerRunbook = fs.readFileSync('ops/academy-telegram-worker.md', 'utf8');

  assert.match(bridge, /function loadBridgeEnv\(\)/);
  assert.match(bridge, /env\.GOOGLE_CLIENT_ID/);
  assert.match(bridge, /env\.GOOGLE_CLIENT_SECRET/);
  assert.match(bridge, /env\.GOOGLE_REFRESH_TOKEN/);
  assert.match(bridge, /GOOGLE_DRIVE_PIPELINE_CONFIG/);
  assert.match(bridge, /Google Drive pipeline root ID is configured, but Telegram Drive intake needs GOOGLE_DRIVE_PIPELINE_CONFIG/);
  assert.match(workerRunbook, /GOOGLE_CLIENT_ID=\$\{\{skillful-motivation\.GOOGLE_CLIENT_ID\}\}/);
  assert.match(workerRunbook, /GOOGLE_DRIVE_PIPELINE_CONFIG=\$\{\{skillful-motivation\.GOOGLE_DRIVE_PIPELINE_CONFIG\}\}/);
  assert.match(workerRunbook, /GOOGLE_DRIVE_PIPELINE_FOLDER_ID=\$\{\{skillful-motivation\.GOOGLE_DRIVE_PIPELINE_FOLDER_ID\}\}/);
});

test('Rabbi scoped bridge uses only One Time Drive map context for Drive questions', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const rabbiGuide = fs.readFileSync('agents/rabbi-elie-scheller/AGENTS.md', 'utf8');
  const rabbiMemory = fs.readFileSync('agents/rabbi-elie-scheller/MEMORY.md', 'utf8');

  assert.match(bridge, /oneTimeDriveMapFile/);
  assert.match(bridge, /function buildScopedOneTimeDriveContextForMessage/);
  assert.match(bridge, /driveMap\.workspace_key !== 'rabbi_sheller_provider'/);
  assert.match(bridge, /driveMap\.project_key !== ONE_TIME_PROJECT_KEY/);
  assert.match(bridge, /Attached scoped One Time Drive context to API fallback message/);
  assert.match(bridge, /Attached scoped One Time Drive context to Kimi API fallback message/);
  assert.match(bridge, /Drive and web research answers must be preview\/read-only/);
  assert.match(bridge, /Support tickets are routed to Shloimie\/super-admin review/);
  assert.match(rabbiGuide, /scoped Drive map\/context previews/);
  assert.match(rabbiMemory, /safe web\s+research, scoped Drive\/context previews/);
});

test('academy bridge exits loudly after repeated duplicate getUpdates conflicts', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');

  assert.match(bridge, /function isTelegramGetUpdatesConflict/);
  assert.match(bridge, /TELEGRAM_GETUPDATES_CONFLICT_EXIT_THRESHOLD/);
  assert.match(bridge, /runtime_status: 'blocked_conflict'/);
  assert.match(bridge, /telegram_getupdates_conflict/);
  assert.match(bridge, /Polling loop conflict/);
  assert.match(bridge, /shutdownBridge\(2, 'blocked_conflict'/);
  assert.match(bridge, /parsed\.runtime_status \|\| ''/);
  assert.match(bridge, /String\(status \|\| ''\)\.startsWith\('blocked'\)/);
});

test('Telegram bridge launcher supports status stop restart and stale lock cleanup', () => {
  const launcher = fs.readFileSync('scripts/start-telegram-kimi-bridge.ps1', 'utf8');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.match(launcher, /param\(/);
  assert.match(launcher, /\[switch\]\$Restart/);
  assert.match(launcher, /\[switch\]\$Stop/);
  assert.match(launcher, /\[switch\]\$Status/);
  assert.match(launcher, /Move-BridgeLockAside/);
  assert.match(launcher, /Use -Restart to replace it/);
  assert.equal(pkg.scripts['telegram:kimi:restart'], 'powershell -ExecutionPolicy Bypass -File scripts/start-telegram-kimi-bridge.ps1 -Restart');
  assert.equal(pkg.scripts['telegram:kimi:status'], 'powershell -ExecutionPolicy Bypass -File scripts/start-telegram-kimi-bridge.ps1 -Status');
});

test('academy Drive auto-watch prompt does not trigger platform draft generation', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const start = bridge.indexOf('const DEFAULT_DRIVE_INGEST_CAPTION');
  const end = bridge.indexOf('async function handleDriveIngestCommand', start);
  const autoDrivePrompt = start >= 0 && end > start ? bridge.slice(start, end) : '';

  assert.match(autoDrivePrompt, /platform action buttons/);
  assert.doesNotMatch(autoDrivePrompt, /WhatsApp and Facebook buttons/);
  assert.doesNotMatch(autoDrivePrompt, /make this into a parent WhatsApp summary/);
  assert.ok(bridge.includes('text: `/ingest_drive ${DEFAULT_DRIVE_INGEST_CAPTION}`'));
  assert.match(bridge, /Processing notes:\\n/);
});

test('academy bridge has a targeted Drive content job reprocess command', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');

  assert.match(bridge, /async function reprocessDriveContentJob/);
  assert.match(bridge, /function parseRepairDriveJobIds/);
  assert.match(bridge, /command === 'reprocess-drive-job'/);
  assert.match(bridge, /transcribe_and_patch_existing_job/);
  assert.match(bridge, /already_has_transcript/);
  assert.match(bridge, /status: 'blocked'/);
  assert.match(bridge, /Drive file moved to stage: 03 Transcribed/);
  assert.match(bridge, /Content job stage marked 04 Parsed after successful parse/);
  assert.match(bridge, /dry_run: Boolean\(options\.dryRun\)/);
  assert.match(bridge, /force: Boolean\(options\.force\)/);
  assert.match(bridge, /no_ai: Boolean\(options\.noAi\)/);
  assert.match(bridge, /no_progress_writes: Boolean\(options\.noProgressWrites\)/);
  assert.match(bridge, /noAi: args\.includes\('--no-ai'\)/);
  assert.match(bridge, /noProgressWrites: args\.includes\('--no-progress-writes'\)/);
});

test('academy bridge recognizes Erev Shabbos Parsha WhatsApp requests as weekly reports', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const start = bridge.indexOf('function detectWeeklyReportIntent');
  const end = bridge.indexOf('function parseRequestedContentJobId', start);
  assert.ok(start > 0 && end > start, 'weekly report detector should be found');
  const sandbox = {};

  vm.runInNewContext(`${bridge.slice(start, end)}
result = { detectWeeklyReportIntent };`, sandbox);

  assert.equal(
    sandbox.result.detectWeeklyReportIntent(
      "I want the last little video message, the Erev Shabbos message for this week's Parsha, what we learned last week, give me a little WhatsApp message."
    ),
    true
  );
  assert.equal(
    sandbox.result.detectWeeklyReportIntent(
      'Arab Shabbos message for this week Parsha with the last video and what we learned'
    ),
    true
  );
});

test('academy bridge syncs visible content-job stage after auto mixed parse', () => {
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');

  assert.match(bridge, /async function markContentJobParsedAfterMixedParse/);
  assert.match(bridge, /drive_stage: '04 Parsed'/);
  assert.match(bridge, /Auto-parse stage sync/);
  assert.ok((bridge.match(/markContentJobParsedAfterMixedParse\(config, contentJobId/g) || []).length >= 3);
});
