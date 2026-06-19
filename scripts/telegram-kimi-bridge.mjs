import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { pipeline as streamPipeline } from 'stream/promises';
import ffmpegPath from 'ffmpeg-static';
import { google } from 'googleapis';
import {
  listSocialAccounts,
  buildAccountAliases,
  createSocialPost,
  listBlogs,
} from './buffer-ops.mjs';

const require = createRequire(import.meta.url);
const {
  hasContentCommitToSchedulingIntent,
  hasPublicPublishNowIntent,
  parseContentOutputTypeFromText: parseContentOutputTypeFromTextCore,
  shouldBlockContentDraftEditIntent,
} = require('../src/lib/bna/telegram-content-intent');
const integrationSecretLoader = require('../src/lib/integrations/secret-loader');
const {
  isConfirmationText,
  isHandlerBlocked,
  planTelegramIntent,
  shouldAskForExternalApproval,
  stripConfirmationPrefix,
  summarizeIntentPlan,
} = require('../src/lib/bna/telegram-agent-intent');
const {
  buildCodexWorkFromPlanningSession,
  buildPlanningTelegramReply,
  buildVisiblePlanningPrompt,
  hasExplicitPromptImplementationStart,
  hasPromptPlanningIntent,
  isPromptPlanningCancel,
  isPromptPlanningRefinement,
  promptPlanningKind,
} = require('../src/lib/bna/telegram-planning-intent');
const {
  extractInterestedParentLeads,
  hasInterestedParentLeadCaptureIntent,
} = require('../src/lib/bna/telegram-contact-lead-capture');
const {
  detectTelegramAccountabilityType,
  extractTelegramAccountabilityDetails,
  hasParentAccountabilityRoutingIntent,
  isLikelyTelegramStudentAccountabilityUnit,
} = require('../src/lib/bna/telegram-accountability-parser');
const {
  classifyTelegramActionRequest,
  formatTelegramActionResult,
} = require('../src/lib/bna/telegram-action-router');
const {
  hasDirectReplyInsteadOfCodexIntent,
} = require('../src/lib/bna/telegram-direct-reply-guard');
const {
  hasTelegramNoteToCrmIntent,
  parseTelegramNoteToCrm,
} = require('../src/lib/bna/telegram-note-to-crm');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, '.runtime');
const envLocalPath = path.join(repoRoot, '.env.local');
const academyTokenFile = path.join(repoRoot, '.secrets', 'telegram-bot-token.txt');
const rabbiElieTokenFile = path.join(repoRoot, '.secrets', 'telegram-rabbi-elie-scheller-bot-token.txt');
const googleOAuthClientFile = path.join(repoRoot, '.secrets', 'google-oauth-client.json');
const googleRefreshTokenFile = path.join(repoRoot, '.secrets', 'google-refresh-token.txt');
const googleDrivePipelineFile = path.join(repoRoot, '.secrets', 'google-drive-pipeline.json');
const mediaInboxDir = path.join(repoRoot, 'media-inbox');
const mediaDropDir = path.join(repoRoot, 'media-drop');
const mediaDropInboxDir = path.join(mediaDropDir, 'inbox');
const mediaDropProcessedDir = path.join(mediaDropDir, 'processed');
const publicLearningMomentsFeedFile = path.join(repoRoot, 'public', 'data', 'learning-moments.json');
const opsPendingDir = path.join(repoRoot, 'ops', 'pending');
const opsCompletedDir = path.join(repoRoot, 'ops', 'completed');
const agentTaskLedgerFile = path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl');
const agentChangelogFile = path.join(repoRoot, 'ops', 'agent-changelog.md');
const BNA_BRIDGE_PROFILE = 'bna';
const RABBI_ELIE_BRIDGE_PROFILE = 'rabbi-elie-scheller';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const RABBI_ELIE_AGENT_FILES = [
  'agents/rabbi-elie-scheller/AGENTS.md',
  'agents/rabbi-elie-scheller/MEMORY.md',
  'agents/rabbi-elie-scheller/SETUP.md',
];

function normalizeBridgeProfile(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
  if (['rabbi-elie', 'rabbi-elie-scheller', 'elie-scheller', 'one-time-rabbi'].includes(normalized)) {
    return RABBI_ELIE_BRIDGE_PROFILE;
  }
  return BNA_BRIDGE_PROFILE;
}

function cliOptionValue(name) {
  const args = process.argv.slice(2);
  const index = args.findIndex((arg) => arg === name || arg.startsWith(`${name}=`));
  if (index < 0) return '';
  const current = args[index];
  if (current.includes('=')) return current.split('=').slice(1).join('=');
  return args[index + 1] || '';
}

function commandArgs() {
  const args = process.argv.slice(2);
  const result = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--profile') {
      index += 1;
      continue;
    }
    if (arg.startsWith('--profile=')) continue;
    result.push(arg);
  }
  return result;
}

const bridgeProfile = normalizeBridgeProfile(
  cliOptionValue('--profile') || process.env.TELEGRAM_BRIDGE_PROFILE || BNA_BRIDGE_PROFILE
);

function runtimeFileForProfile(baseName, extension) {
  const suffix = bridgeProfile === BNA_BRIDGE_PROFILE ? '' : `-${bridgeProfile}`;
  return path.join(runtimeDir, `${baseName}${suffix}.${extension}`);
}

const logFile = runtimeFileForProfile('telegram-kimi-bridge', 'log');
const lockFile = runtimeFileForProfile('telegram-kimi-bridge', 'lock');
const pendingDecisionsFile = runtimeFileForProfile('telegram-pending-decisions', 'json');
const pendingExternalActionsFile = runtimeFileForProfile('telegram-pending-external-actions', 'json');
const telegramChatModesFile = runtimeFileForProfile('telegram-chat-modes', 'json');
const telegramTaskWatchStateFile = runtimeFileForProfile('telegram-task-watch-state', 'json');
const telegramMultipartSpecFile = runtimeFileForProfile('telegram-multipart-specs', 'json');
const telegramPlanningPromptsFile = runtimeFileForProfile('telegram-planning-prompts', 'json');

fs.mkdirSync(runtimeDir, { recursive: true });
fs.mkdirSync(mediaInboxDir, { recursive: true });
fs.mkdirSync(mediaDropInboxDir, { recursive: true });
fs.mkdirSync(mediaDropProcessedDir, { recursive: true });
fs.mkdirSync(opsPendingDir, { recursive: true });
fs.mkdirSync(opsCompletedDir, { recursive: true });

const agentReplyQueue = [];
let agentReplyRunning = false;
let agentReplySequence = 0;
let activeTelegramCodexEnabled = true;
let activeBridgeConfig = null;
let activeBridgeBotIdentity = null;
let stopBridgeRuntimeHeartbeat = null;
let bridgeShutdownInProgress = false;

function appendAgentTaskLedger(entry) {
  const payload = {
    recorded_at: new Date().toISOString(),
    ...entry,
  };
  fs.mkdirSync(path.dirname(agentTaskLedgerFile), { recursive: true });
  fs.appendFileSync(agentTaskLedgerFile, `${JSON.stringify(payload)}\n`);
}

function appendAgentChangelog(entry) {
  const title = String(entry.title || 'Agent change').replace(/\r?\n/g, ' ').trim();
  const lines = [
    '',
    `## ${new Date().toISOString()} - ${title}`,
    '',
    entry.summary ? String(entry.summary).trim() : '',
    entry.task_id ? `- task_id: ${entry.task_id}` : '',
    entry.source ? `- source: ${entry.source}` : '',
    entry.worker ? `- worker: ${entry.worker}` : '',
    '',
  ].filter(Boolean);
  fs.mkdirSync(path.dirname(agentChangelogFile), { recursive: true });
  fs.appendFileSync(agentChangelogFile, `${lines.join('\n')}\n`);
}

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  fs.appendFileSync(logFile, `${stamped}\n`);
}

function readBridgeLock() {
  try {
    if (!fs.existsSync(lockFile)) return {};
    const raw = fs.readFileSync(lockFile, 'utf8').replace(/^(\uFEFF|ï»¿)/, '').trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    const corruptPath = `${lockFile}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    try {
      fs.renameSync(lockFile, corruptPath);
      log(`Moved unreadable bridge lock to ${path.basename(corruptPath)}: ${error instanceof Error ? error.message : String(error)}`);
    } catch {}
    return {};
  }
}

function acquireLock() {
  try {
    const existingPid = Number(readBridgeLock().pid || 0);

    if (existingPid) {
      try {
        process.kill(existingPid, 0);
        throw new Error(`Bridge already running with PID ${existingPid}`);
      } catch (error) {
        if (error && error.code !== 'ESRCH') {
          throw error;
        }
      }
    }

    fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2));
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

function updateBridgeLock(details = {}) {
  try {
    const current = readBridgeLock();
    if (Number(current.pid) !== process.pid) return;
    fs.writeFileSync(lockFile, JSON.stringify({
      ...current,
      ...details,
      updatedAt: new Date().toISOString(),
    }, null, 2));
  } catch (error) {
    log(`Could not update bridge lock metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function releaseLock() {
  try {
    if (!fs.existsSync(lockFile)) return;
    const parsed = readBridgeLock();
    if (Number(parsed.pid) === process.pid) {
      fs.unlinkSync(lockFile);
    }
  } catch {}
}

function parseEnvFile(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadBridgeEnv() {
  const fromFile = fs.existsSync(envLocalPath)
    ? parseEnvFile(fs.readFileSync(envLocalPath, 'utf8'))
    : {};
  return { ...fromFile, ...process.env };
}

function parseJsonConfig(value, label) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function loadConfig() {
  const academyToken = fs.existsSync(academyTokenFile)
    ? fs.readFileSync(academyTokenFile, 'utf8').trim()
    : '';

  const env = loadBridgeEnv();
  const openaiSecret = integrationSecretLoader.loadConfigValue({
    envName: 'OPENAI_API_KEY',
    names: ['openai-api-key', 'openaiv2'],
    fileNames: ['openai-api-key.txt', 'openaiv2.txt'],
    repoRoot,
  }) || env.OPENAI_API_KEY || '';
  const kimiSecret = integrationSecretLoader.loadConfigValue({
    envName: 'KIMI_API_KEY',
    names: ['kimi-api-key'],
    fileNames: ['kimi-api-key.txt'],
    repoRoot,
  }) || env.KIMI_API_KEY || '';
  const rabbiElieToken = fs.existsSync(rabbiElieTokenFile)
    ? fs.readFileSync(rabbiElieTokenFile, 'utf8').trim()
    : '';
  const isRabbiElieProfile = bridgeProfile === RABBI_ELIE_BRIDGE_PROFILE;
  const botToken = isRabbiElieProfile
    ? (
        rabbiElieToken ||
        env.TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER ||
        env.RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN ||
        ''
      )
    : (
        academyToken ||
        env.TELEGRAM_BOT_TOKEN ||
        env.TELEGRAM_BOT_TOKEN_SHLOIMIE ||
        env.TELEGRAM_BOT_TOKEN_AHUVA ||
        ''
      );
  const allowedChatIds = (isRabbiElieProfile
    ? [
        env.TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER,
        env.RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID,
        env.ONE_TIME_TELEGRAM_CHAT_ID,
      ]
    : [
        env.TELEGRAM_CHAT_ID_BNA,
        env.TELEGRAM_CHAT_ID,
        env.TELEGRAM_CHAT_ID_SHLOIMIE,
        env.TELEGRAM_CHAT_ID_AHUVA,
      ])
    .filter(Boolean)
    .map((value) => String(value).trim());
  const requestedPrimaryAgent = String(env.TELEGRAM_PRIMARY_AGENT || 'codex').trim().toLowerCase();
  const primaryAgent = requestedPrimaryAgent === 'kimi' ? 'codex' : (requestedPrimaryAgent || 'codex');
  const scopedOpsUsername = env.ONE_TIME_OPS_USERNAME || env.RABBI_ELIE_SCHELLER_OPS_USERNAME || '';
  const scopedOpsPassword = env.ONE_TIME_OPS_PASSWORD || env.RABBI_ELIE_SCHELLER_OPS_PASSWORD || '';
  const codexEnabled = isRabbiElieProfile
    ? String(env.RABBI_ELIE_SCHELLER_CODEX_ENABLED || 'false').toLowerCase() === 'true'
    : true;

  return {
    bridgeProfile,
    bridgeProfileLabel: isRabbiElieProfile ? 'Rabbi Elie Scheller / One Time' : 'BNA academy',
    scopedProjectKey: isRabbiElieProfile ? ONE_TIME_PROJECT_KEY : '',
    runtimeAgentKey: isRabbiElieProfile ? '' : 'telegram-academy-bridge',
    agentDisplayName: isRabbiElieProfile ? 'Rabbi Elie Scheller' : 'Shloimie',
    agentContextFiles: isRabbiElieProfile ? RABBI_ELIE_AGENT_FILES : [],
    codexEnabled,
    botToken,
    academyToken,
    allowedChatIds,
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: isRabbiElieProfile ? scopedOpsUsername : env.OPS_USERNAME || '',
    opsPassword: isRabbiElieProfile ? scopedOpsPassword : env.OPS_PASSWORD || '',
    primaryAgent,
    codexCommand: env.CODEX_CLI_COMMAND || 'codex',
    codexModel: env.CODEX_CLI_MODEL || '',
    codexTimeoutMs: Number(env.CODEX_BRIDGE_TIMEOUT_MS || env.KIMI_BRIDGE_TIMEOUT_MS || 15 * 60 * 1000),
    asyncAgentReplies: String(env.TELEGRAM_ASYNC_AGENT_REPLIES || 'true').toLowerCase() !== 'false',
    kimiModel: env.KIMI_CLI_MODEL || 'bna-kimi',
    kimiApiKey: kimiSecret || env.KIMI_API_KEY || '',
    kimiApiBaseUrl: env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1',
    kimiApiModel: env.KIMI_MODEL || 'kimi-k2.6',
    kimiTimeoutMs: Number(env.KIMI_BRIDGE_TIMEOUT_MS || 240000),
    openaiApiKey: openaiSecret || env.OPENAI_API_KEY || '',
    openaiBaseUrl: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiSummaryModel: env.OPENAI_MODEL || 'gpt-4.1-mini',
    openaiResearchModel: env.OPENAI_RESEARCH_MODEL || env.OPENAI_MODEL || 'gpt-4.1-mini',
    openaiTranscriptionModel: env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe',
    openaiRequestTimeoutMs: Number(env.OPENAI_REQUEST_TIMEOUT_MS || 10 * 60 * 1000),
    apiPrimaryProvider: normalizeApiPrimaryProvider(
      env.BNA_AI_PRIMARY_PROVIDER || env.TELEGRAM_API_PRIMARY_PROVIDER || env.AI_PRIMARY_PROVIDER || 'openai'
    ),
    telegramDefaultReplyMode: normalizeTelegramReplyMode(
      env.TELEGRAM_DEFAULT_REPLY_MODE || env.TELEGRAM_DEFAULT_CHAT_MODE || 'openai'
    ),
    transcriptionMaxBytes: Number(env.TRANSCRIPTION_MAX_BYTES || 25 * 1024 * 1024),
    telegramUploadMaxBytes: Number(env.TELEGRAM_UPLOAD_MAX_BYTES || 45 * 1024 * 1024),
    driveWatchIntervalMs: Number(env.DRIVE_WATCH_INTERVAL_MS || 10000),
    taskWatchIntervalMs: Number(env.TELEGRAM_TASK_WATCH_INTERVAL_MS || 45000),
    runtimeHeartbeatMs: Number(env.TELEGRAM_BRIDGE_HEARTBEAT_MS || 45000),
  };
}

function loadGoogleDriveAuth() {
  const env = loadBridgeEnv();
  const inlineClient = parseJsonConfig(
    env.GOOGLE_OAUTH_CLIENT_JSON || env.GOOGLE_OAUTH_CLIENT_CONFIG || '',
    'GOOGLE_OAUTH_CLIENT_JSON'
  );
  const fileClient = fs.existsSync(googleOAuthClientFile)
    ? parseJsonConfig(fs.readFileSync(googleOAuthClientFile, 'utf8'), '.secrets/google-oauth-client.json')
    : null;
  const parsed = inlineClient || fileClient || {};
  const client = parsed.web || parsed.installed || {};
  const clientId = env.GOOGLE_CLIENT_ID || client.client_id || '';
  const clientSecret = env.GOOGLE_CLIENT_SECRET || client.client_secret || '';
  const redirectUri = env.GOOGLE_REDIRECT_URI || client.redirect_uris?.[0];
  const refreshToken = env.GOOGLE_REFRESH_TOKEN || (
    fs.existsSync(googleRefreshTokenFile)
      ? fs.readFileSync(googleRefreshTokenFile, 'utf8').trim()
      : ''
  );
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth client is not configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET on the worker or provide .secrets/google-oauth-client.json.');
  }
  if (!refreshToken) {
    throw new Error('Google refresh token is not configured. Set GOOGLE_REFRESH_TOKEN on the worker or send /drive_auth from the local bridge to create .secrets/google-refresh-token.txt.');
  }
  const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

function loadGoogleDrivePipelineConfig() {
  const env = loadBridgeEnv();
  if (String(env.GOOGLE_DRIVE_PIPELINE_CONFIG || '').trim()) {
    return parseJsonConfig(env.GOOGLE_DRIVE_PIPELINE_CONFIG, 'GOOGLE_DRIVE_PIPELINE_CONFIG');
  }
  if (fs.existsSync(googleDrivePipelineFile)) {
    return parseJsonConfig(fs.readFileSync(googleDrivePipelineFile, 'utf8'), '.secrets/google-drive-pipeline.json');
  }
  if (String(env.GOOGLE_DRIVE_PIPELINE_FOLDER_ID || '').trim()) {
    throw new Error('Google Drive pipeline root ID is configured, but Telegram Drive intake needs GOOGLE_DRIVE_PIPELINE_CONFIG with stage folder IDs.');
  }
  throw new Error('Google Drive pipeline config is not configured. Set GOOGLE_DRIVE_PIPELINE_CONFIG on the worker or run npm run drive:setup locally to create .secrets/google-drive-pipeline.json.');
}

function loadOffset() {
  const offsetFile = currentOffsetFilePath();
  try {
    const parsed = JSON.parse(fs.readFileSync(offsetFile, 'utf8'));
    return Number(parsed.offset || 0);
  } catch {
    return 0;
  }
}

function saveOffset(offset) {
  const offsetFile = currentOffsetFilePath();
  fs.writeFileSync(offsetFile, JSON.stringify({ offset }, null, 2));
}

let activeTokenFingerprint = 'default';

function currentOffsetFilePath() {
  return path.join(runtimeDir, `telegram-kimi-offset-${activeTokenFingerprint}.json`);
}

function todayMemoryPath() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(repoRoot, 'memory', `${date}.md`);
}

function readContextFile(relativePath, maxChars = 1800) {
  try {
    const absolutePath = path.join(repoRoot, relativePath);
    let content = fs.readFileSync(absolutePath, 'utf8').trim();
    if (content.length > maxChars) {
      content = content.slice(0, maxChars).trimEnd();
      content += '\n[truncated]';
    }
    return content;
  } catch {
    return '[missing]';
  }
}

function readContextFiles(relativePaths, maxCharsPerFile = 1800) {
  return relativePaths
    .map((relativePath) => {
      const content = readContextFile(relativePath, maxCharsPerFile);
      return content === '[missing]' ? '' : `## ${relativePath}\n${content}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function readTailContextFile(relativePath, maxChars = 2400) {
  try {
    const absolutePath = path.join(repoRoot, relativePath);
    const content = fs.readFileSync(absolutePath, 'utf8').trim();
    if (content.length <= maxChars) return content;
    return `[tail truncated]\n${content.slice(-maxChars).trimStart()}`;
  } catch {
    return '[missing]';
  }
}

function latestTaskPendingFiles(limit = 5) {
  const dir = path.join(repoRoot, 'tasks-pending');
  try {
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => {
        const relativePath = `tasks-pending/${name}`;
        const absolutePath = path.join(repoRoot, relativePath);
        return { relativePath, mtimeMs: fs.statSync(absolutePath).mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, limit)
      .map((item) => item.relativePath);
  } catch {
    return [];
  }
}

function buildRecentRepoContext(maxCharsPerFile = 1800) {
  return readContextFiles([
    'SYSTEM-STATE.md',
    'ops/openai-sidekick-capabilities.md',
    ...latestTaskPendingFiles(5),
  ], maxCharsPerFile);
}

function buildAgentSyncContext(maxCharsPerFile = 2400) {
  return [
    'Shared agent sync files:',
    '',
    '## ops/agent-task-ledger.jsonl',
    readTailContextFile('ops/agent-task-ledger.jsonl', maxCharsPerFile),
    '',
    '## ops/agent-changelog.md',
    readTailContextFile('ops/agent-changelog.md', maxCharsPerFile),
  ].join('\n');
}

function buildOpenAiCapabilityContext() {
  return [
    'Hosted API Telegram assistant capability contract:',
    '- The hosted API assistant is for brainstorming, planning, tone/content drafting, system navigation, and reading summarized live context. The underlying provider is internal routing; do not mention OpenAI/Kimi in ordinary replies unless Shloimie explicitly asks for diagnostics.',
    '- The hosted API provider receives repo context from AGENTS.md, MEMORY.md, TASKS.md, SYSTEM-STATE.md, internal Codex handoff notes, today memory, shared task ledger, and agent changelog.',
    '- The hosted API provider receives live app snapshots for system/navigation/task/student/content/accounting questions and Drive snapshots for Drive/upload/intake questions.',
    '- For Operations/dashboard questions, the live app snapshot is the primary source of truth: sections, subtabs, visible buttons/actions, task lanes, task records/comments, students, content, contacts, accounting, devices, agent fleet status, and recent updates.',
    '- If the operator asks to order, sort, audit, or brainstorm items in a section, answer from the live app snapshot first. Do not answer from transcripts unless the operator explicitly asks for transcript/class-content topics.',
    '- Safe writes already happen before the model reply through bridge capture: Tasks, Student accountability, Accounting/payment intake, Content/media jobs, Decisions, saved Content draft edits, and Codex work queue records.',
    '- Content edits such as revising a newsletter, Facebook post, WhatsApp update, or blog draft should edit the saved Content output directly through the hosted API provider first, not be routed as coding work.',
    '- For Facebook/WhatsApp/blog content, show the draft in Telegram and refine it with the operator in natural writing-partner language. Do not route normal wording changes to Codex.',
    '- Commit means the operator is done refining and wants the saved draft pushed to Buffer as a scheduling draft. Commit is not the same as publish now.',
    '- Code edits, filesystem edits, database migrations, deployments, tests, and destructive/high-risk operations must route to Codex as a tracked task/job, not be claimed as completed by the hosted API provider.',
    '- When the hosted API provider identifies implementation work, it should say it is queued/assigned to Codex and rely on the bridge task queue/ledger/changelog for synchronization.',
    '- Every meaningful action should be synchronized through durable shared files or app records: memory/YYYY-MM-DD.md, TASKS.md, ops/agent-task-ledger.jsonl, ops/agent-changelog.md, tasks-pending/*.md, and app task records.',
    '- Do not expose secrets, API keys, raw credentials, private access codes, or full raw transcripts unless the operator explicitly asks and the bridge provided them.',
  ].join('\n');
}

function isScopedProjectBot(config = {}) {
  return Boolean(config.scopedProjectKey);
}

function buildScopedAgentContext(config = {}, maxCharsPerFile = 2400) {
  const files = Array.isArray(config.agentContextFiles) ? config.agentContextFiles : [];
  if (!files.length) return '';
  return [
    `Scoped agent profile: ${config.bridgeProfileLabel || config.bridgeProfile || 'project bot'}`,
    `Scoped project key: ${config.scopedProjectKey || 'none'}`,
    '',
    readContextFiles(files, maxCharsPerFile),
  ].filter(Boolean).join('\n');
}

function buildApiSystemInstructions(config = {}) {
  if (isScopedProjectBot(config)) {
    return [
      'You are Rabbi Elie Scheller\'s scoped One Time Mishnah Class Telegram sidekick.',
      'Answer using ONLY the repo/app context provided by the user message.',
      'Keep the reply practical, organized, and concise.',
      'Use ASCII characters only in the final reply.',
      'Your scope is One Time Mishnah Class tasks, comments, brainstorming, shiur ideas, source-sheet work, Torah class prep, marketing/community/legacy CRM setup planning, and decisions inside that project.',
      'Do not expose or discuss BNA private Students, Accounting, Devices, student accountability, broad content pipelines, credentials, private access codes, or operator-only Changelog details.',
      'If asked for out-of-scope BNA private data, say this bot is scoped to One Time Mishnah Class and suggest asking Shloimie through the academy bot.',
      'Usually summarize and ask before creating tasks unless the message explicitly says to create, add, file, assign, or comment on a task.',
      'When a task should be created, ask for or infer the useful fields: category, assignee, urgency, decision required, and any context.',
      'Allowed assignees are Rabbi Elie Scheller, Shloimie, and Unassigned.',
      'Allowed One Time categories are Marketing, Content, Technology, Admin, Accounting, Community Setup, Community, General, Torah Class Prep, Source Sheets, and Shiur Ideas.',
      'Codex/repo editing is disabled for this scoped bot unless Shloimie explicitly enables it later.',
      'When a decision is needed, give 2-3 options formatted exactly like "Option A: label", "Option B: label", and "Option C: label" so Telegram can create buttons.',
      'Do not ask unnecessary questions when a concise answer or next step is clear.',
    ].join('\n');
  }

  return [
    'You are the active BNA Telegram sidekick for this repository.',
    'Answer using ONLY the repo context provided by the user message.',
    'Keep the reply practical and concise.',
    'Use ASCII characters only in the final reply.',
    'If the message contains a ramble, break it into the clearest next tasks.',
    'If the operator asks to make or refine a prompt for Codex or ChatGPT, treat that as planning mode first: show a visible prompt/brief draft in chat and refine it before implementation unless they explicitly ask to build, test, run, or apply it.',
    'If the operator asks for goal mode, says to set the prompt as a goal, gives a GPT/ChatGPT correction output, or asks to work through the whole prompt/list until done, produce a BNA_GOAL_MODE_EXECUTION_PACKET using tasks-pending/_template-goal-mode-correction-output.md and route it to Codex execution instead of only summarizing.',
    'When the operator says to test something that can be verified through browser interaction, assume Playwright/browser automation is required and report the actual browser checks performed.',
    'If the operator says "build everything", choose the order from TASKS.md and the newest tasks-pending handoffs, start executing, and do not ask for ordering confirmation unless there is a real blocker or product decision.',
    'Use the BNA lanes Tasks, Students, Content, Contacts, and Accounting. Do not use the old Pipeline, Signups, Billing, or Ramble tab language.',
    'Use task language like Decisions, My Tasks, Changelog, and Done. Codex work belongs in Changelog, not in Shloimie personal tasks.',
    'When a live Operations snapshot is included, treat it as the primary source for questions about sections, buttons, tasks, ordering, status, pending/queued work, accountability, payments, contacts, content jobs, and system updates.',
    'If the operator asks about logistics, scheduling, tasks, dashboard sections, or what is waiting, answer from the live app/system snapshot. Do not switch to transcript/class-topic inventory unless the operator explicitly asks for transcript topics, class content, or what was learned.',
    'If asked to order or audit a dashboard section, list the relevant live items with IDs/statuses and recommend an order. If the snapshot is incomplete, say exactly which endpoint or section is missing instead of guessing.',
    'Only assign work to Shloimie or Codex. Kimi may be a temporary hosted API provider, but it is not the active worker or task assignee.',
    'Telegram should feel like natural conversation first. Do not announce background queues or Codex job mechanics; mention capture only when a real task, student note, payment item, content item, or decision was created or needs action.',
    'Strategy, product, research, and "why is the system behaving this way" questions should be answered directly first, with recommendations and tradeoffs. Do not turn them into Codex tasks unless the operator asks to build the fix or the needed implementation is obvious.',
    'Do not surprise the operator with random questions. If you see a useful recommendation from the current system state, label it as a suggestion and explain why it matters.',
    'When a decision is needed, give 2-3 options formatted exactly like "Option A: label", "Option B: label", and "Option C: label" so Telegram can create buttons.',
    'Do not ask format-option questions for transcript/topic/content drafting requests. If the operator asks for topics, a transcript summary, a newsletter, or a revised post, choose the most useful default and return the actual text in chat.',
    'For Facebook posts and other parent-facing copy, act like a natural writing partner: show the current draft in chat, accept conversational edits, and keep refining through the hosted API provider. Only when the operator says commit, create the Buffer draft/scheduling handoff. Do not use Codex-task language for copy refinement.',
    'Avoid vague headings like "Next" by itself. Use Captured, Already filed, Queued work, and Blocked only if blocked.',
    'If the operator references recent work by phrase, such as "the image slider", first use SYSTEM-STATE.md and the newest tasks-pending handoff before asking what they mean.',
    'If the live snapshot contains a task that was just auto-captured from the same operator message, do not make that capture the main answer unless the operator asked to create or file a task. Answer the actual question first.',
    'If the operator asks why a Telegram reply was cut off, malformed, or missing, use only the recent Telegram memory included below. Say clearly when the hosted assistant cannot inspect delivery logs and that Codex must inspect the bridge/logs for a real diagnosis.',
  ].join('\n');
}

function buildPlatformMemoryContext(outputType) {
  const sharedFiles = [
    'brand-kit/README.md',
    'brand-kit/01-core-beliefs.md',
    'brand-kit/02-teaching-voice.md',
    'brand-kit/03-parent-messaging.md',
    'brand-kit/04-student-growth-principles.md',
    'brand-kit/05-phrases-to-use.md',
    'brand-kit/06-phrases-to-avoid.md',
  ];
  const platformFiles = ({
    facebook_post: ['content-memory/platform-prompts/facebook.md', 'content-memory/facebook/examples.md'],
    weekly_newsletter: ['content-memory/platform-prompts/whatsapp.md', 'content-memory/whatsapp/examples.md'],
    blog_draft: ['content-memory/platform-prompts/blog.md', 'content-memory/blog/examples.md'],
    whatsapp_update: ['content-memory/platform-prompts/whatsapp.md', 'content-memory/whatsapp/examples.md'],
  })[outputType] || ['content-memory/platform-prompts/whatsapp.md', 'content-memory/whatsapp/examples.md'];

  return readContextFiles([...sharedFiles, ...platformFiles], 1600);
}

function appendMemoryEntry(role, text, metadata = {}) {
  const memoryPath = todayMemoryPath();
  const timestamp = new Date().toISOString();
  const lines = [
    '',
    `### ${role} ${timestamp}`,
    '',
    ...Object.entries(metadata).map(([key, value]) => `- ${key}: ${value}`),
    metadata && Object.keys(metadata).length > 0 ? '' : null,
    text.trim(),
    '',
  ].filter(Boolean);

  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
  fs.appendFileSync(memoryPath, `${lines.join('\n')}\n`);
}

function readMultipartSpecState() {
  try {
    if (!fs.existsSync(telegramMultipartSpecFile)) return {};
    const raw = fs.readFileSync(telegramMultipartSpecFile, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMultipartSpecState(state) {
  fs.mkdirSync(path.dirname(telegramMultipartSpecFile), { recursive: true });
  fs.writeFileSync(telegramMultipartSpecFile, JSON.stringify(state || {}, null, 2));
}

function looksLikeMultipartSpecChunk(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  const normalized = raw.toLowerCase();
  const bulletCount = (raw.match(/(?:^|\n)\s*[-*]\s+/g) || []).length;
  const numberedCount = (raw.match(/(?:^|\n)\s*\d+\.\s+/g) || []).length;
  const sectionHeadingCount = (raw.match(/(?:^|\n)\s*[A-Z][A-Za-z /&-]{2,40}:\s*(?:\n|$)/g) || []).length;
  return (
    raw.length > 500 && (bulletCount >= 4 || numberedCount >= 3 || sectionHeadingCount >= 2) ||
    /\b(content|contacts|accounting|students|tasks)\s*>\s*[a-z]/i.test(raw) ||
    /\b(subtabs|acceptance checklist|visual direction|specific layout changes|student portal redesign|global ui rules|primary sidebar item)\b/i.test(raw) ||
    /\b(left drawer|desktop sidebar|hamburger|compact cards|detail screen|detail drawer)\b/i.test(normalized)
  );
}

function hasCodexImplementationTask(captureSummary = {}) {
  return (captureSummary.tasks || [])
    .filter((task) => task?.id)
    .filter((task) => /codex|kimi|agent|system/i.test(String(task.assigned_to || '')));
}

function cleanupMultipartSpecState(state) {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [chatId, entry] of Object.entries(state || {})) {
    const updatedAt = Date.parse(entry?.updated_at || '');
    if (!updatedAt || updatedAt < cutoff || !Array.isArray(entry?.chunks) || !entry.chunks.length) {
      delete state[chatId];
    }
  }
  return state;
}

async function handleMultipartSpecContext(config, text, chatId, messageId, captureSummary = {}) {
  if (isScopedProjectBot(config) || !config.opsUsername || !config.opsPassword) return captureSummary;

  const isSpecChunk = looksLikeMultipartSpecChunk(text);
  const codexTasks = hasCodexImplementationTask(captureSummary);
  if (!isSpecChunk && !codexTasks.length) return captureSummary;

  const state = cleanupMultipartSpecState(readMultipartSpecState());
  const existing = state[chatId]?.chunks || [];
  const currentChunk = isSpecChunk
    ? [{
        message_id: messageId,
        recorded_at: new Date().toISOString(),
        text: String(text || '').trim().slice(0, 8000),
      }]
    : [];

  if (!codexTasks.length) {
    const chunks = [...existing, ...currentChunk]
      .filter((chunk) => chunk.text)
      .slice(-8);
    state[chatId] = {
      updated_at: new Date().toISOString(),
      chunks,
    };
    writeMultipartSpecState(state);
    return captureSummary;
  }

  const chunks = [...existing, ...currentChunk]
    .filter((chunk) => chunk.text)
    .slice(-10);
  delete state[chatId];
  writeMultipartSpecState(state);
  if (!chunks.length) return captureSummary;

  const body = [
    'Split Telegram spec context attached automatically.',
    '',
    'These were consecutive Telegram messages that looked like one implementation brief. Use them as acceptance criteria for this task.',
    '',
    ...chunks.map((chunk, index) => [
      `Part ${index + 1} - Telegram message ${chunk.message_id}:`,
      chunk.text,
    ].join('\n')),
  ].join('\n\n').slice(0, 30000);

  for (const task of codexTasks) {
    try {
      await appRequest(config, 'POST', `/api/bna/tasks/${task.id}/comments`, {
        body,
        author: 'Telegram bridge',
        visibility: 'internal',
        source: 'telegram',
        source_context: {
          chat_id: chatId,
          message_id: messageId,
          grouped_message_ids: chunks.map((chunk) => chunk.message_id),
          bridge_profile: config.bridgeProfile,
          reason: 'multipart_spec_context',
        },
      });
      appendAgentTaskLedger({
        event: 'multipart_spec_context_attached',
        source: 'telegram_bridge',
        chat_id: chatId,
        message_id: messageId,
        task_id: task.id,
        title: task.title,
        notes: `Attached ${chunks.length} split Telegram spec chunk(s) to task #${task.id}.`,
        stage: task.stage,
        category: task.category,
        assigned_to: task.assigned_to || null,
      });
    } catch (error) {
      log(`Could not attach multipart spec context to task #${task.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    ...captureSummary,
    multipartSpecAttached: true,
    multipartSpecChunks: chunks.length,
  };
}

function sanitizeFileName(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'file';
}

function formatBytes(bytes) {
  const size = Number(bytes || 0);
  if (size >= 1024 * 1024 * 1024) return `${(size / 1024 / 1024 / 1024).toFixed(1)}GB`;
  if (size >= 1024 * 1024) return `${Math.ceil(size / 1024 / 1024)}MB`;
  if (size >= 1024) return `${Math.ceil(size / 1024)}KB`;
  return `${size}B`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function todayFolderName() {
  return new Date().toISOString().slice(0, 10);
}

function pendingJobPath(jobId) {
  return path.join(opsPendingDir, `${jobId}.json`);
}

function completedJobPath(jobId) {
  return path.join(opsCompletedDir, `${jobId}.json`);
}

function saveJob(job) {
  const targetPath = job.status === 'completed' ? completedJobPath(job.id) : pendingJobPath(job.id);
  fs.writeFileSync(targetPath, JSON.stringify(job, null, 2));
}

function listPendingJobs(limit = 10) {
  const entries = fs.existsSync(opsPendingDir)
    ? fs.readdirSync(opsPendingDir).filter((name) => name.endsWith('.json'))
    : [];

  return entries
    .map((name) => {
      const fullPath = path.join(opsPendingDir, name);
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      return parsed;
    })
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .slice(0, limit);
}

function parsePublishIntent(text) {
  const normalized = String(text || '').trim();
  if (!normalized) {
    return {
      isPublishRequest: false,
      publishNow: false,
      targets: [],
      summary: '',
    };
  }

  const match = normalized.match(/^(publish|post)(?:\s+(now|draft))?\s+(.+)$/i);
  if (!match) {
    return {
      isPublishRequest: false,
      publishNow: false,
      targets: [],
      summary: normalized,
    };
  }

  const publishMode = (match[2] || '').toLowerCase();
  const remainder = match[3].trim();
  const separatorIndex = remainder.indexOf('|');
  const targetPart = separatorIndex >= 0 ? remainder.slice(0, separatorIndex).trim() : remainder;
  const summaryPart = separatorIndex >= 0 ? remainder.slice(separatorIndex + 1).trim() : '';

  const targets = targetPart
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    isPublishRequest: true,
    publishNow: publishMode === 'now',
    targets,
    summary: summaryPart,
  };
}

function getTelegramMessageText(msg) {
  return (msg.text || msg.caption || '').trim();
}

function detectMediaDescriptor(msg) {
  if (Array.isArray(msg.photo) && msg.photo.length > 0) {
    const photo = msg.photo[msg.photo.length - 1];
    return {
      kind: 'photo',
      fileId: photo.file_id,
      filename: `photo-${msg.message_id}.jpg`,
      mimeType: 'image/jpeg',
      fileSize: photo.file_size,
    };
  }

  if (msg.video) {
    return {
      kind: 'video',
      fileId: msg.video.file_id,
      filename: msg.video.file_name || `video-${msg.message_id}.mp4`,
      mimeType: msg.video.mime_type || 'video/mp4',
      fileSize: msg.video.file_size,
    };
  }

  if (msg.document) {
    return {
      kind: 'document',
      fileId: msg.document.file_id,
      filename: msg.document.file_name || `document-${msg.message_id}`,
      mimeType: msg.document.mime_type || 'application/octet-stream',
      fileSize: msg.document.file_size,
    };
  }

  if (msg.voice) {
    return {
      kind: 'voice',
      fileId: msg.voice.file_id,
      filename: `voice-${msg.message_id}.ogg`,
      mimeType: msg.voice.mime_type || 'audio/ogg',
      fileSize: msg.voice.file_size,
    };
  }

  return null;
}

function detectLocalFileDescriptor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  const videoTypes = new Map([
    ['.mp4', 'video/mp4'],
    ['.mov', 'video/quicktime'],
    ['.m4v', 'video/mp4'],
    ['.webm', 'video/webm'],
  ]);
  const audioTypes = new Map([
    ['.mp3', 'audio/mpeg'],
    ['.m4a', 'audio/mp4'],
    ['.wav', 'audio/wav'],
    ['.ogg', 'audio/ogg'],
    ['.opus', 'audio/ogg'],
  ]);
  const imageTypes = new Map([
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.png', 'image/png'],
    ['.webp', 'image/webp'],
    ['.gif', 'image/gif'],
  ]);

  if (videoTypes.has(extension)) {
    return {
      kind: 'video',
      fileId: '',
      filename,
      mimeType: videoTypes.get(extension),
    };
  }

  if (audioTypes.has(extension)) {
    return {
      kind: 'voice',
      fileId: '',
      filename,
      mimeType: audioTypes.get(extension),
    };
  }

  if (imageTypes.has(extension)) {
    return {
      kind: 'photo',
      fileId: '',
      filename,
      mimeType: imageTypes.get(extension),
    };
  }

  return {
    kind: 'document',
    fileId: '',
    filename,
    mimeType: 'application/octet-stream',
  };
}

function listDropInboxFiles() {
  if (!fs.existsSync(mediaDropInboxDir)) return [];
  return fs.readdirSync(mediaDropInboxDir)
    .map((name) => path.join(mediaDropInboxDir, name))
    .filter((filePath) => {
      try {
        return fs.statSync(filePath).isFile();
      } catch {
        return false;
      }
    })
    .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);
}

function copyDropFileToMediaInbox(sourcePath) {
  const dateFolder = ensureDirectory(path.join(mediaInboxDir, todayFolderName()));
  const extension = path.extname(sourcePath);
  const baseName = sanitizeFileName(path.basename(sourcePath, extension));
  const targetPath = path.join(
    dateFolder,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-drop-${baseName}${extension}`
  );
  fs.copyFileSync(sourcePath, targetPath);
  return targetPath;
}

async function listDriveRawIntakeFiles({ includeIngestingFallback = true } = {}) {
  const auth = loadGoogleDriveAuth();
  const config = loadGoogleDrivePipelineConfig();
  const rawFolderId = config.stages?.['01 Raw Intake'];
  const ingestingFolderId = config.stages?.['02 Ingesting'];
  if (!rawFolderId) throw new Error('Drive pipeline config is missing the raw media intake stage');

  const drive = google.drive({ version: 'v3', auth });
  const listFromFolder = (folderId) => drive.files.list({
    q: [
      `'${folderId}' in parents`,
      'trashed=false',
      "mimeType!='application/vnd.google-apps.folder'",
    ].join(' and '),
    fields: 'files(id,name,mimeType,size,webViewLink,createdTime,parents)',
    orderBy: 'createdTime desc',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  let result = await listFromFolder(rawFolderId);
  if (!result.data.files?.length && includeIngestingFallback && ingestingFolderId) {
    result = await listFromFolder(ingestingFolderId);
  }

  return {
    drive,
    config,
    files: result.data.files || [],
  };
}

async function listDriveFilesFromFolder(drive, folderId, { pageSize = 10, imageOnly = false } = {}) {
  if (!folderId) return [];
  const query = [
    `'${String(folderId).replace(/'/g, "\\'")}' in parents`,
    'trashed=false',
    "mimeType!='application/vnd.google-apps.folder'",
  ];
  if (imageOnly) query.push("mimeType contains 'image/'");

  const result = await drive.files.list({
    q: query.join(' and '),
    fields: 'files(id,name,mimeType,size,webViewLink,createdTime,modifiedTime,parents)',
    orderBy: 'createdTime desc',
    pageSize,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return result.data.files || [];
}

async function listDriveWebsiteImageFiles() {
  const auth = loadGoogleDriveAuth();
  const config = loadGoogleDrivePipelineConfig();
  const websiteFolderId = config.websiteMomentsIntake
    || config.simplifiedFolders?.websiteImages
    || config.websiteImages;
  if (!websiteFolderId) {
    throw new Error('Drive pipeline config is missing the Website Images intake folder');
  }

  const drive = google.drive({ version: 'v3', auth });
  return {
    drive,
    config,
    files: await listDriveFilesFromFolder(drive, websiteFolderId, { imageOnly: true }),
    folderId: websiteFolderId,
  };
}

function shouldAttachDriveContext(text) {
  const normalized = String(text || '').toLowerCase();
  return /\b(drive|folder|folders|intake|raw intake|processed|parsed|transcribed|whatsapp ready|uploaded|moved|latest file|last file|latest video|last video|recording|audio file|video file)\b/.test(normalized);
}

function formatDriveSize(size) {
  const n = Number(size || 0);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 1024 * 1024 * 1024) return `${Math.round(n / 1024 / 1024 / 1024)}GB`;
  if (n >= 1024 * 1024) return `${Math.round(n / 1024 / 1024)}MB`;
  return `${Math.round(n / 1024)}KB`;
}

function formatDriveFileLine(file) {
  const size = formatDriveSize(file.size);
  const modified = file.modifiedTime ? file.modifiedTime.replace(/\.\d+Z$/, 'Z') : '';
  return [
    `- ${file.name || file.id}`,
    file.mimeType ? `(${file.mimeType})` : '',
    size ? `size ${size}` : '',
    modified ? `modified ${modified}` : '',
    file.webViewLink ? `link ${file.webViewLink}` : '',
  ].filter(Boolean).join(' ');
}

async function listDriveFolderFiles(drive, folderId, pageSize = 8) {
  if (!folderId) return [];
  const result = await drive.files.list({
    q: [`'${String(folderId).replace(/'/g, "\\'")}' in parents`, 'trashed=false'].join(' and '),
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    pageSize,
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,parents,driveId)',
  });
  return result.data.files || [];
}

async function buildDriveContextForMessage(text) {
  if (!shouldAttachDriveContext(text)) return '';

  const auth = loadGoogleDriveAuth();
  const pipelineConfig = loadGoogleDrivePipelineConfig();
  const drive = google.drive({ version: 'v3', auth });

  const [aboutResult, sharedDrivesResult] = await Promise.all([
    drive.about.get({ fields: 'user(displayName,emailAddress),storageQuota(usage,usageInDrive,limit)' }),
    drive.drives.list({ pageSize: 100, fields: 'drives(id,name,hidden)' }).catch(() => ({ data: { drives: [] } })),
  ]);

  const lines = [
    'Google Drive context available to the Telegram bridge:',
    `- Signed-in Drive account: ${aboutResult.data.user?.emailAddress || aboutResult.data.user?.displayName || 'unknown'}`,
    `- Shared Drives visible through this credential: ${(sharedDrivesResult.data.drives || []).length}`,
  ];
  if ((sharedDrivesResult.data.drives || []).length) {
    lines.push(`- Shared Drive names: ${(sharedDrivesResult.data.drives || []).map((item) => item.name).join(', ')}`);
  } else {
    lines.push('- No Workspace Shared Drives are visible through this OAuth token; current BNA pipeline is in this account My Drive.');
  }

  if (pipelineConfig.root) {
    try {
      const root = await drive.files.get({
        fileId: pipelineConfig.root,
        supportsAllDrives: true,
        fields: 'id,name,webViewLink,parents',
      });
      lines.push('');
      lines.push(`BNA pipeline root: ${root.data.name || 'BNA V2'} (${root.data.webViewLink || root.data.id})`);
    } catch (error) {
      lines.push('');
      lines.push(`BNA pipeline root configured but not readable: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  lines.push('');
  lines.push('BNA pipeline stages and newest files:');
  for (const [stage, folderId] of Object.entries(pipelineConfig.stages || {})) {
    const files = await listDriveFolderFiles(drive, folderId, 4).catch((error) => [{ name: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]);
    lines.push(`- ${stage}: ${files.length} recent item(s) shown`);
    for (const file of files.slice(0, 4)) {
      lines.push(`  ${formatDriveFileLine(file)}`);
    }
  }

  const recent = await drive.files.list({
    q: "trashed=false and mimeType!='application/vnd.google-apps.folder'",
    corpora: 'allDrives',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    orderBy: 'modifiedTime desc',
    pageSize: 12,
    fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,parents,driveId)',
  }).catch(() => ({ data: { files: [] } }));

  lines.push('');
  lines.push('Newest accessible non-folder files across visible Drive scope:');
  for (const file of recent.data.files || []) {
    lines.push(formatDriveFileLine(file));
  }
  lines.push('');
  lines.push('Use this Drive context to answer location/status questions directly. Do not claim access to personal/shared drives that are not listed here.');
  return lines.join('\n');
}

function shouldAttachAppContext(text) {
  const normalized = String(text || '').toLowerCase();
  return /\b(system|dashboard|operations|section|sections|buttons?|actions?|task|tasks|queue|queued|pending|waiting|in progress|done|changelog|students?|accountability|torah|learning progress|content|recording|transcript|blog|whatsapp|communications?|team|tickets?|support|facebook|newsletter|payments?|accounting|signup|signups|contacts?|parents?|members?|devices?|tablet|green invoice|projects?|one time|rabbi|live|zoom|classes?|session|schedule|link|access|what'?s left|what is left|status|updates?|capabilities|capability|can you see|what do you see|order|sort|audit|brainstorm|logistics|scheduling)\b/.test(normalized);
}

function wantsWholeSystemSnapshot(text) {
  return /\b(system|dashboard|operations|sections?|buttons?|actions?|everything|all the things|all sections|whole system|what do you see|can you see|status|updates?|what'?s left|what is left|order|sort|audit|brainstorm|pending|waiting|queue|queued|team|tickets?|support|logistics|scheduling)\b/i.test(String(text || ''));
}

function wantsAccountingSnapshot(text) {
  return /\b(payments?|accounting|signup|signups|tuition|cash|credit|green invoice|invoice|paid|unpaid|reminder|due|parents?|contacts?)\b/i.test(String(text || ''));
}

function wantsStudentSnapshot(text) {
  return /\b(students?|accountability|torah|learning progress|goal|goals|inside|listening|private meeting|check-?in|devices?|tablet|qstudio|qustodio|bedtime|wake)\b/i.test(String(text || ''));
}

function wantsContentSnapshot(text) {
  return /\b(content|recording|transcript|blog|whatsapp|facebook|newsletter|youtube|media|draft|publish|post|prompt|prompts|bundle|bundles)\b/i.test(String(text || ''));
}

function wantsLiveClassSnapshot(text) {
  return /\b(live|zoom|classes?|class sessions?|session|schedule|tonight|link|member access|live access|library access|recordings?)\b/i.test(String(text || ''));
}

function wantsTaskSnapshot(text) {
  return /\b(task|tasks|queue|queued|pending|waiting|decision|decisions|my work|rabbi|codex|brief|briefs|implementation|changelog|done|order|sort|audit|section)\b/i.test(String(text || ''));
}

function sanitizeContextText(value, maxChars = 220) {
  const text = String(value ?? '')
    .replace(/https?:\/\/[^\s<>"']*zoom[^\s<>"']*/gi, '[zoom link redacted]')
    .replace(/\b(?:sk|rk|pat|xoxp|AIza)[A-Za-z0-9_\-]{12,}\b/g, '[redacted]')
    .replace(/\b\d{8,}:[A-Za-z0-9_\-]{20,}\b/g, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length > maxChars ? `${text.slice(0, maxChars - 15).trim()}...[truncated]` : text;
}

function compactDateForContext(value) {
  if (!value) return '';
  return String(value).replace('T', ' ').replace(/\.\d+Z$/, 'Z').slice(0, 19);
}

function countByField(items = [], field, fallback = 'unknown') {
  return (Array.isArray(items) ? items : []).reduce((counts, item) => {
    const key = sanitizeContextText(item?.[field] || fallback, 80) || fallback;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function formatCounts(counts = {}) {
  return Object.entries(counts)
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([key, value]) => `${key}:${value}`)
    .join(', ') || 'none';
}

function detectRequestedAppSections(text) {
  const normalized = String(text || '').toLowerCase();
  const broad = wantsWholeSystemSnapshot(text);
  const sections = new Set();
  if (broad || wantsTaskSnapshot(text)) sections.add('tasks');
  if (broad || wantsStudentSnapshot(text)) sections.add('students');
  if (broad || wantsContentSnapshot(text)) sections.add('content');
  if (broad || wantsLiveClassSnapshot(text)) sections.add('live_classes');
  if (broad || /\bcontacts?|parents?|roster|signup|signups|intake|follow-?up|tags?|communications?|whatsapp\b/.test(normalized)) sections.add('contacts');
  if (broad || wantsAccountingSnapshot(text)) sections.add('accounting');
  if (broad || /\bteam|tickets?|support|rabbi\b/.test(normalized)) sections.add('support');
  if (broad || /\bagent|fleet|codex|automation|background|worker|swarm\b/.test(normalized)) sections.add('agents');
  if (!sections.size) sections.add('tasks');
  return sections;
}

function buildOperationsUiInventoryContext(sections = new Set(['tasks', 'students', 'content', 'contacts', 'accounting', 'support'])) {
  const ui = {
    tasks: {
      subtabs: ['Overview', 'Decisions', 'My Tasks', 'Schedule', 'Research', 'Changelog', 'Done'],
      primaryActions: ['Open task card/details', 'Add comment', 'Mark done', 'Archive', 'Use Schedule for planned/due One Time work', 'Use Decision lane when Shloimie must decide', 'Use Changelog for queued, active, and verified machine work'],
      filters: ['Urgency/date/project filters', 'Clear filters', 'Lane/subtab chips'],
    },
    students: {
      subtabs: ['Overview', 'Group Goal', 'Student List', 'Student Profile', 'Goal Board', 'Tablet Access', 'Questions', 'Portal Links'],
      primaryActions: ['Open student profile', 'Save / Update Torah Entry', 'Create Goal Board Item', 'Check Not Yet/Half/Done/Wait/Archive', 'Add Mock Tablet', 'Open/Refresh/Regenerate portal link'],
      filters: ['Needs Setup', 'Due Today', 'Checked Off', 'Missed', 'Access Open', 'Locked', 'Needs Review'],
    },
    content: {
      subtabs: ['Library', 'Selected', 'Repurpose', 'Newsletter', 'Prompts', 'Bundles'],
      primaryActions: ['Select content', 'Choose output', 'Open details', 'Open Drive file', 'Approve or revise', 'View/Edit Prompt', 'Make output', 'Save prompt version'],
      filters: ['Media type', 'Uploaded date', 'Project', 'Collapsed Filters panel'],
    },
    contacts: {
      subtabs: ['Parents', 'Interested Parents', 'Communications', 'Students', 'Intake', 'Needs Follow-up', 'Tags'],
      primaryActions: ['Open roster card', 'Email', 'WhatsApp', 'Mark follow-up', 'Open student', 'Review communication timeline/tags/source/language/payment fields'],
      filters: ['Parent/student/intake/follow-up/tag subtabs'],
    },
    accounting: {
      subtabs: ['Overview', 'Payments', 'Needs Attention', 'Paid', 'Needs Signup', 'Exceptions'],
      primaryActions: ['Review parent/student/payment roster', 'Check amount/method/status/next due', 'Use overview summaries before table views'],
      filters: ['Payment status subtabs', 'Attention/exception views'],
    },
    support: {
      subtabs: ['Tickets & Messages'],
      primaryActions: ['Open Ticket', 'Triage', 'Start', 'Resolve', 'Jump to linked task', 'Use Team for internal Rabbi/Shloimie communication and repair requests'],
      filters: ['Status', 'Severity', 'Category'],
    },
    agents: {
      subtabs: ['Changelog Queue', 'Agent Fleet Status'],
      primaryActions: ['Inspect queued/active/completed agent work in Changelog', 'Read completed changelog', 'Review fleet status', 'Escalate blocked tasks to Decisions'],
      filters: ['Owner/stage/project'],
    },
  };

  const lines = ['Operations UI inventory available to the hosted assistant:'];
  for (const key of ['tasks', 'students', 'content', 'contacts', 'accounting', 'support', 'agents']) {
    if (!sections.has(key)) continue;
    const item = ui[key];
    lines.push(`- ${key.toUpperCase()} subtabs: ${item.subtabs.join(', ')}`);
    lines.push(`  Actions/buttons: ${item.primaryActions.join('; ')}`);
    lines.push(`  Filters: ${item.filters.join('; ')}`);
  }
  return lines.join('\n');
}

function compactTaskForContext(task) {
  return [
    `#${task.id}`,
    String(task.title || 'Untitled').replace(/\s+/g, ' ').slice(0, 130),
    `stage=${task.stage || 'unknown'}`,
    `owner=${task.assigned_to || 'Unassigned'}`,
    task.urgency ? `urgency=${task.urgency}` : '',
    task.category ? `category=${task.category}` : '',
    task.project_short_name || task.project_name ? `project=${task.project_short_name || task.project_name}` : '',
  ].filter(Boolean).join(' | ');
}

function compactTaskDetailForContext(task, comments = []) {
  const parts = [
    compactTaskForContext(task),
    task.decision_required ? 'decision_required=true' : '',
    task.due_date ? `due=${compactDateForContext(task.due_date)}` : '',
    task.created_at ? `created=${compactDateForContext(task.created_at)}` : '',
    task.updated_at ? `updated=${compactDateForContext(task.updated_at)}` : '',
    task.notes ? `notes=${sanitizeContextText(task.notes, 260)}` : '',
    task.verification_notes ? `verification=${sanitizeContextText(task.verification_notes, 220)}` : '',
    comments.length ? `comments=${comments.map((comment) => `(${compactDateForContext(comment.created_at)} ${sanitizeContextText(comment.author, 40)}: ${sanitizeContextText(comment.body, 180)})`).join(' ')}` : '',
  ].filter(Boolean);
  return parts.join(' | ');
}

function compactBriefForContext(brief) {
  return [
    brief.id || brief.slug || brief.filename || brief.relative_path || 'brief',
    sanitizeContextText(brief.title || brief.name || brief.filename || brief.relative_path || 'Implementation brief', 120),
    brief.lifecycle_stage ? `stage=${brief.lifecycle_stage}` : '',
    brief.status ? `status=${brief.status}` : '',
    brief.updated_at || brief.mtime ? `updated=${compactDateForContext(brief.updated_at || brief.mtime)}` : '',
    brief.relative_path ? `file=${brief.relative_path}` : '',
    brief.summary ? `summary=${sanitizeContextText(brief.summary, 220)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactStudentForContext(student) {
  return [
    `#${student.id}`,
    String(student.name || 'Unnamed student').replace(/\s+/g, ' ').slice(0, 80),
    student.status ? `status=${student.status}` : '',
    student.parent_name ? `parent=${String(student.parent_name).replace(/\s+/g, ' ').slice(0, 60)}` : '',
    Number.isFinite(Number(student.accountability_count)) ? `accountability=${student.accountability_count}` : '',
    Number.isFinite(Number(student.follow_up_count)) ? `followups=${student.follow_up_count}` : '',
    student.torah_trip_progress_percentage !== undefined && student.torah_trip_progress_percentage !== null
      ? `torah_trip=${Math.round(Number(student.torah_trip_progress_percentage))}%`
      : '',
    student.device_status ? `device=${student.device_status}` : '',
    student.latest_device_name ? `tablet=${sanitizeContextText(student.latest_device_name, 60)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactAccountabilityForContext(event) {
  return [
    `#${event.id}`,
    event.student_name || event.student?.name ? `student=${sanitizeContextText(event.student_name || event.student?.name, 70)}` : '',
    event.event_type ? `type=${event.event_type}` : '',
    sanitizeContextText(event.title || 'Accountability event', 110),
    event.progress_percent !== null && event.progress_percent !== undefined ? `progress=${event.progress_percent}%` : '',
    event.follow_up_required ? 'follow_up=true' : '',
    event.next_check_in_date ? `next=${compactDateForContext(event.next_check_in_date)}` : '',
    event.notes ? `notes=${sanitizeContextText(event.notes, 200)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactContentJobForContext(job) {
  const outputSummary = Array.isArray(job.outputs)
    ? job.outputs.slice(0, 4).map((output) => `${output.output_type || 'output'}:${output.status || 'unknown'}#${output.id}`).join(',')
    : '';
  return [
    `#${job.id}`,
    String(job.title || job.filename || 'Untitled content').replace(/\s+/g, ' ').slice(0, 110),
    `status=${job.status || 'unknown'}`,
    job.source_type ? `source=${job.source_type}` : '',
    job.drive_stage ? `drive=${job.drive_stage}` : '',
    outputSummary ? `outputs=${outputSummary}` : '',
    job.summary ? `summary=${sanitizeContextText(job.summary, 160)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactPromptForContext(prompt) {
  return [
    prompt.prompt_key || prompt.key || prompt.output_type || `#${prompt.id}`,
    sanitizeContextText(prompt.label || prompt.title || prompt.name || 'Prompt', 90),
    prompt.active_version_id ? `active_version=${prompt.active_version_id}` : '',
    prompt.updated_at ? `updated=${compactDateForContext(prompt.updated_at)}` : '',
    prompt.description ? `description=${sanitizeContextText(prompt.description, 180)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactDeviceForContext(device) {
  return [
    `#${device.id}`,
    sanitizeContextText(device.device_name || device.name || 'Tablet', 80),
    device.student?.name || device.student_name ? `student=${sanitizeContextText(device.student?.name || device.student_name, 70)}` : '',
    device.status || device.status_label ? `status=${device.status_label || device.status}` : '',
    device.provider ? `provider=${device.provider}` : '',
    device.active_session?.expires_at ? `expires=${compactDateForContext(device.active_session.expires_at)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactPaymentForContext(item) {
  return [
    `#${item.id}`,
    String(item.student_name || item.child_name || item.name || item.parent_name || item.parent_email || 'Payment record').replace(/\s+/g, ' ').slice(0, 90),
    item.parent_name ? `parent=${String(item.parent_name).replace(/\s+/g, ' ').slice(0, 60)}` : '',
    item.payment_status || item.status ? `status=${item.payment_status || item.status}` : '',
    item.payment_method || item.method ? `method=${item.payment_method || item.method}` : '',
    item.payment_amount || item.amount ? `amount=${item.payment_amount || item.amount}` : '',
    item.payment_due_date ? `due=${item.payment_due_date}` : '',
    item.received_at ? `received=${item.received_at}` : '',
  ].filter(Boolean).join(' | ');
}

function communicationDeliveryStatusForContext(item = {}) {
  const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};
  const sourceContext = item.source_context && typeof item.source_context === 'object' ? item.source_context : {};
  const status = metadata.delivery_status || sourceContext.delivery_status || '';
  if (status) return String(status).toLowerCase();
  if (metadata.sent === true || sourceContext.wapi_status) return 'sent';
  if (String(item.channel || '').toLowerCase() === 'whatsapp' && item.follow_up_required && String(item.source || '') === 'wapi') return 'unknown';
  return '';
}

function compactCommunicationForContext(item = {}) {
  const name = item.lead_parent_name || item.signup_parent_name || item.signup_student_name || item.student_name || 'general';
  const status = communicationDeliveryStatusForContext(item);
  const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};
  const sourceContext = item.source_context && typeof item.source_context === 'object' ? item.source_context : {};
  const error = metadata.error || sourceContext.error || '';
  return [
    `#${item.id}`,
    sanitizeContextText(name, 80),
    `${item.channel || 'unknown'}/${item.direction || 'unknown'}`,
    item.contact_type ? `type=${item.contact_type}` : '',
    status ? `delivery=${status}` : '',
    item.follow_up_required ? 'follow_up=true' : '',
    item.created_at || item.occurred_at ? `at=${compactDateForContext(item.occurred_at || item.created_at)}` : '',
    sanitizeContextText(item.summary || item.body || '', 120),
    error ? `error=${sanitizeContextText(error, 100)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactProviderContactForContext(provider = {}) {
  return [
    `#${provider.id}`,
    sanitizeContextText(provider.provider_name || provider.display_name || 'Provider', 80),
    provider.contact_name ? `contact=${sanitizeContextText(provider.contact_name, 70)}` : '',
    provider.contact_email ? `email=${sanitizeContextText(provider.contact_email, 80)}` : 'email=missing',
    provider.contact_phone ? 'phone=present' : 'phone=missing',
    provider.whatsapp_phone ? 'whatsapp=present' : 'whatsapp=missing',
    provider.login_username ? 'login_username=present' : 'login_username=missing',
    provider.status ? `status=${provider.status}` : '',
    provider.provider_status ? `provider_status=${provider.provider_status}` : '',
  ].filter(Boolean).join(' | ');
}

function compactSupportTicketForContext(ticket) {
  return [
    `#${ticket.id}`,
    sanitizeContextText(ticket.title || 'Untitled ticket', 110),
    ticket.status ? `status=${ticket.status}` : '',
    ticket.severity ? `severity=${ticket.severity}` : '',
    ticket.category ? `category=${ticket.category}` : '',
    ticket.related_task_id ? `task=#${ticket.related_task_id}` : '',
    ticket.created_at ? `created=${compactDateForContext(ticket.created_at)}` : '',
  ].filter(Boolean).join(' | ');
}

function compactLiveSessionForContext(session = {}) {
  return [
    `#${session.id}`,
    sanitizeContextText(session.title || 'Live class', 110),
    session.start_at ? `start=${compactDateForContext(session.start_at)}` : '',
    session.status ? `status=${session.status}` : '',
    session.required_tier ? `tier=${session.required_tier}` : '',
    session.zoom_meeting_url ? 'zoom=current_link_present' : 'zoom=missing',
    session.link_version || session.zoom_link_version ? `link_version=${session.link_version || session.zoom_link_version}` : '',
    session.link_changed_needs_send ? 'needs_resend=true' : '',
    Number.isFinite(Number(session.eligible_count)) ? `eligible=${session.eligible_count}` : '',
    Number.isFinite(Number(session.ineligible_count)) ? `skipped=${session.ineligible_count}` : '',
    session.recording_status ? `recording=${session.recording_status}` : '',
  ].filter(Boolean).join(' | ');
}

function compactLiveMemberForContext(member = {}) {
  return [
    `#${member.id}`,
    sanitizeContextText(member.display_name || member.email || 'Member', 90),
    member.email ? `email=${sanitizeContextText(member.email, 90)}` : 'email=missing',
    member.phone ? 'phone=present' : 'phone=missing',
    member.access_tier ? `tier=${member.access_tier}` : '',
    member.access_status ? `status=${member.access_status}` : '',
    member.access_enabled === false ? 'enabled=false' : 'enabled=true',
    member.access_url ? 'portal_link=present' : 'portal_link=missing',
  ].filter(Boolean).join(' | ');
}

async function buildBnaAppSnapshotForMessage(config, text) {
  if (!shouldAttachAppContext(text) || !config.opsUsername || !config.opsPassword) return '';

  const scopedProject = isScopedProjectBot(config);
  const requestedSections = detectRequestedAppSections(text);
  const includeTasks = requestedSections.has('tasks') || scopedProject;
  const includeStudents = !scopedProject && requestedSections.has('students');
  const includeContent = !scopedProject && requestedSections.has('content');
  const includeLiveClasses = requestedSections.has('live_classes') || (scopedProject && wantsLiveClassSnapshot(text));
  const asksForScopedContacts = /\b(whatsapp|wa|communications?|contacts?|parents?|provider|rabbi|scheller|sheller)\b/i.test(String(text || ''));
  const includeContacts = requestedSections.has('contacts') && (!scopedProject || asksForScopedContacts);
  const includeProviders = requestedSections.has('contacts') || /\b(provider|rabbi|scheller|sheller|one time|whatsapp)\b/i.test(String(text || ''));
  const includeAccounting = !scopedProject && requestedSections.has('accounting');
  const includeSupport = requestedSections.has('support') || scopedProject;
  const includeAgents = !scopedProject && requestedSections.has('agents');
  const includeTaskDetails = wantsTaskSnapshot(text) || wantsWholeSystemSnapshot(text);

  const requests = [
    ['projects', appRequest(config, 'GET', '/api/bna/projects')],
    includeTasks ? ['tasks', appRequest(config, 'GET', '/api/bna/tasks')] : null,
    includeAgents ? ['agentFleet', appRequest(config, 'GET', '/api/bna/agent-fleet/status')] : null,
    includeStudents ? ['students', appRequest(config, 'GET', '/api/bna/students')] : null,
    includeStudents ? ['torah', appRequest(config, 'GET', '/api/bna/torah-learning')] : null,
    includeStudents ? ['accountability', appRequest(config, 'GET', '/api/bna/accountability?limit=80')] : null,
    includeStudents ? ['devices', appRequest(config, 'GET', '/api/bna/devices')] : null,
    includeStudents ? ['deviceRules', appRequest(config, 'GET', '/api/bna/device-access-rules')] : null,
    includeContent ? ['contentJobs', appRequest(config, 'GET', '/api/bna/content-jobs')] : null,
    includeContent ? ['contentPrompts', appRequest(config, 'GET', '/api/bna/content-prompts')] : null,
    includeContent ? ['contentBundles', appRequest(config, 'GET', '/api/bna/content-bundles')] : null,
    includeLiveClasses ? ['liveSessions', appRequest(config, 'GET', '/api/bna/live-sessions')] : null,
    includeLiveClasses ? ['liveMembers', appRequest(config, 'GET', '/api/bna/members')] : null,
    includeProviders ? ['serviceProviders', appRequest(config, 'GET', '/api/bna/service-providers')] : null,
    includeContacts ? ['signups', appRequest(config, 'GET', '/api/bna/signups')] : null,
    includeContacts ? ['contactCommunications', appRequest(config, 'GET', '/api/bna/contact-communications')] : null,
    includeAccounting ? ['signups', appRequest(config, 'GET', '/api/bna/signups')] : null,
    includeAccounting ? ['paymentIntake', appRequest(config, 'GET', '/api/bna/payment-intake')] : null,
    includeAccounting ? ['payments', appRequest(config, 'GET', '/api/bna/payments')] : null,
    includeAccounting ? ['paymentReminders', appRequest(config, 'GET', '/api/bna/payment-reminders/due')] : null,
    includeAccounting ? ['greenInvoiceWebhooks', appRequest(config, 'GET', '/api/bna/green-invoice/webhooks?limit=12')] : null,
    includeSupport ? ['supportTickets', appRequest(config, 'GET', '/api/bna/support-tickets')] : null,
  ].filter(Boolean);

  const settled = await Promise.allSettled(requests.map(([, request]) => request));
  const data = {};
  const errors = [];
  requests.forEach(([key], index) => {
    const result = settled[index];
    if (result.status === 'fulfilled') {
      data[key] = result.value || {};
    } else {
      errors.push(`${key}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
    }
  });

  const tasks = Array.isArray(data.tasks?.tasks) ? data.tasks.tasks : [];
  const activeTasksAll = tasks.filter((task) => !['done', 'archive'].includes(String(task.stage || '')));
  const activeTasks = activeTasksAll.slice(0, includeTaskDetails ? 35 : 14);
  const recentDoneTasks = tasks.filter((task) => String(task.stage || '') === 'done').slice(0, includeTaskDetails ? 12 : 6);
  const codexTasks = activeTasks.filter((task) => /codex|kimi|system|agent/i.test(String(task.assigned_to || ''))).slice(0, 8);
  const shloimieTasks = activeTasks.filter((task) => /shloimie/i.test(String(task.assigned_to || ''))).slice(0, 6);
  const decisionTasks = activeTasks.filter((task) => String(task.stage || '') === 'needs_decision' || task.decision_required).slice(0, 6);
  const supportTickets = Array.isArray(data.supportTickets?.tickets) ? data.supportTickets.tickets : [];
  const openSupportTickets = supportTickets.filter((ticket) => !['resolved', 'closed'].includes(String(ticket.status || ''))).slice(0, includeTaskDetails ? 12 : 6);
  const taskComments = {};

  if (includeTaskDetails && activeTasks.length) {
    const commentTasks = activeTasks
      .filter((task) => Number(task.comment_count || 0) > 0 || /codex|decision|pending|queue|audit|order/i.test(`${task.assigned_to || ''} ${task.stage || ''} ${task.title || ''}`))
      .slice(0, 12);
    const settledComments = await Promise.allSettled(commentTasks.map((task) => appRequest(config, 'GET', `/api/bna/tasks/${task.id}/comments`)));
    commentTasks.forEach((task, index) => {
      const result = settledComments[index];
      if (result.status === 'fulfilled' && Array.isArray(result.value?.comments)) {
        taskComments[task.id] = result.value.comments.slice(-3);
      }
    });
  }

  const lines = [
    scopedProject
      ? 'Live One Time Mishnah Class app snapshot available to this scoped Telegram bridge:'
      : 'Live BNA app snapshot available to the Telegram bridge:',
    '- Source: protected BNA app APIs through the bridge service account.',
    scopedProject
      ? '- Scope: One Time Mishnah Class project routes only. Students, Accounting, Devices, Content, and operator-only areas are intentionally not requested.'
      : '- Snapshot is summarized and sanitized; secrets, access codes, raw credentials, and full raw transcripts are intentionally omitted.',
  ];

  if (!scopedProject) {
    lines.push('');
    lines.push(buildOperationsUiInventoryContext(requestedSections));
  }

  if (Array.isArray(data.projects?.projects)) {
    lines.push('');
    lines.push('Projects:');
    for (const project of data.projects.projects.slice(0, 8)) {
      lines.push(`- ${project.project_key || project.id}: ${project.name || project.short_name || 'Project'}`);
    }
  }

  if (includeProviders && Array.isArray(data.serviceProviders?.providers)) {
    const providers = data.serviceProviders.providers.slice(0, 10);
    lines.push('');
    lines.push(`Service providers/contact visibility: ${data.serviceProviders.providers.length} provider record(s), ${providers.length} shown.`);
    for (const provider of providers) lines.push(`- provider ${compactProviderContactForContext(provider)}`);
  }

  if (includeTasks) {
    lines.push('');
    lines.push(`Tasks section live data: total=${tasks.length}, active=${activeTasksAll.length}, shown=${activeTasks.length}.`);
    lines.push(`- Stage counts: ${formatCounts(countByField(tasks, 'stage'))}`);
    lines.push(`- Owner counts: ${formatCounts(countByField(tasks, 'assigned_to', 'Unassigned'))}`);
    lines.push(`- Category counts: ${formatCounts(countByField(tasks, 'category'))}`);
    if (activeTasks.length) {
      lines.push('Active task records to use for ordering/audits:');
      for (const task of activeTasks) {
        lines.push(`- ${includeTaskDetails ? compactTaskDetailForContext(task, taskComments[task.id] || []) : compactTaskForContext(task)}`);
      }
    }
    if (codexTasks.length) {
      lines.push('Active Codex tasks:');
      for (const task of codexTasks) lines.push(`- ${compactTaskForContext(task)}`);
    }
    if (shloimieTasks.length) {
      lines.push('Active Shloimie tasks:');
      for (const task of shloimieTasks) lines.push(`- ${compactTaskForContext(task)}`);
    }
    if (decisionTasks.length) {
      lines.push('Decision/clarification tasks:');
      for (const task of decisionTasks) lines.push(`- ${compactTaskForContext(task)}`);
    }
    if (recentDoneTasks.length) {
      lines.push('Recent done/changelog task records:');
      for (const task of recentDoneTasks) lines.push(`- ${compactTaskForContext(task)}`);
    }
  }

  if (includeSupport) {
    lines.push('');
    lines.push(`Team tickets live data: total=${supportTickets.length}, open=${openSupportTickets.length}.`);
    lines.push(`- Status counts: ${formatCounts(countByField(supportTickets, 'status'))}`);
    lines.push(`- Severity counts: ${formatCounts(countByField(supportTickets, 'severity'))}`);
    if (openSupportTickets.length) {
      lines.push('Open Team tickets:');
      for (const ticket of openSupportTickets) lines.push(`- ${compactSupportTicketForContext(ticket)}`);
    }
  }

  if (includeAgents && data.agentFleet) {
    lines.push('');
    lines.push('Agent fleet / background automation:');
    lines.push(`- status=${data.agentFleet.fleet?.status || data.agentFleet.status || 'unknown'}`);
    lines.push(`- active_queue=${data.agentFleet.queue?.pending ?? data.agentFleet.pending ?? 'unknown'}`);
    if (Array.isArray(data.agentFleet.queue?.tasks)) {
      for (const task of data.agentFleet.queue.tasks.slice(0, 8)) lines.push(`- queued ${compactTaskForContext(task)}`);
    }
  }

  if (includeStudents && Array.isArray(data.students?.students)) {
    const students = data.students.students.slice(0, 20);
    lines.push('');
    lines.push(`Students: ${data.students.students.length} visible, ${students.length} shown.`);
    for (const student of students) lines.push(`- ${compactStudentForContext(student)}`);
  }

  const torahSummary = data.torah?.summary || data.torah?.group || null;
  if (includeStudents && torahSummary) {
    lines.push('');
    lines.push('Torah learning summary:');
    lines.push(`- group=${Math.round(Number(torahSummary.groupPercentage || torahSummary.group_percentage || 0))}%`);
    lines.push(`- trip_unlocked=${Boolean(torahSummary.tripUnlocked ?? torahSummary.trip_unlocked)}`);
    if (Array.isArray(data.torah.students)) {
      for (const student of data.torah.students.slice(0, 8)) {
        lines.push(`- ${student.name || student.student_name}: ${Math.round(Number(student.totalTripProgressPercentage ?? student.total_trip_progress_percentage ?? student.percentage ?? 0))}%`);
      }
    }
  }

  if (includeStudents && Array.isArray(data.accountability?.events)) {
    const events = data.accountability.events.slice(0, 20);
    lines.push('');
    lines.push(`Student accountability events: ${data.accountability.events.length} visible, newest ${events.length} shown.`);
    lines.push(`- Event type counts shown: ${formatCounts(countByField(events, 'event_type'))}`);
    for (const event of events) lines.push(`- ${compactAccountabilityForContext(event)}`);
  }

  if (includeStudents && Array.isArray(data.devices?.devices)) {
    const devices = data.devices.devices.slice(0, 12);
    lines.push('');
    lines.push(`Tablet/device access: provider_mode=${data.devices.provider_mode || 'unknown'}, real_device_calls_enabled=${Boolean(data.devices.real_device_calls_enabled)}, devices=${data.devices.devices.length}.`);
    for (const device of devices) lines.push(`- ${compactDeviceForContext(device)}`);
  }

  if (includeStudents && Array.isArray(data.deviceRules?.rules)) {
    lines.push(`Device access rules: ${data.deviceRules.rules.length} visible.`);
    for (const rule of data.deviceRules.rules.slice(0, 10)) {
      lines.push(`- #${rule.id} student=${sanitizeContextText(rule.student?.name || rule.student_name || rule.student_id, 70)} device=${sanitizeContextText(rule.device?.device_name || rule.device_id, 70)} type=${rule.rule_type || 'unknown'} duration=${rule.duration_minutes || ''} enabled=${rule.enabled !== false}`);
    }
  }

  if (includeContent && Array.isArray(data.contentJobs?.jobs)) {
    const jobs = data.contentJobs.jobs.slice(0, 18);
    lines.push('');
    lines.push(`Content jobs: ${data.contentJobs.jobs.length} visible, newest ${jobs.length} shown.`);
    lines.push(`- Status counts shown: ${formatCounts(countByField(data.contentJobs.jobs, 'status'))}`);
    lines.push(`- Drive stage counts shown: ${formatCounts(countByField(data.contentJobs.jobs, 'drive_stage'))}`);
    for (const job of jobs) lines.push(`- ${compactContentJobForContext(job)}`);
  }

  if (includeContent && Array.isArray(data.contentPrompts?.prompts)) {
    lines.push('');
    lines.push(`Content prompts: ${data.contentPrompts.prompts.length} visible.`);
    for (const prompt of data.contentPrompts.prompts.slice(0, 12)) lines.push(`- ${compactPromptForContext(prompt)}`);
  }

  if (includeContent && Array.isArray(data.contentBundles?.bundles)) {
    lines.push(`Content bundles: ${data.contentBundles.bundles.length} visible.`);
    for (const bundle of data.contentBundles.bundles.slice(0, 8)) {
      lines.push(`- #${bundle.id} ${sanitizeContextText(bundle.title || 'Bundle', 110)} | status=${bundle.status || 'unknown'} | jobs=${Array.isArray(bundle.jobs) ? bundle.jobs.length : 0} | outputs=${Array.isArray(bundle.outputs) ? bundle.outputs.length : 0}`);
    }
  }

  if (includeLiveClasses) {
    const liveSessions = Array.isArray(data.liveSessions?.sessions) ? data.liveSessions.sessions : [];
    const liveMembers = Array.isArray(data.liveMembers?.members) ? data.liveMembers.members : [];
    lines.push('');
    lines.push(`Live classes: sessions=${liveSessions.length}, members=${liveMembers.length}. Zoom URLs are omitted from this general snapshot.`);
    for (const session of liveSessions.slice(0, 12)) lines.push(`- session ${compactLiveSessionForContext(session)}`);
    const liveAccessMembers = liveMembers.filter((member) => String(member.access_tier || '') === 'live_plus_library').slice(0, 12);
    lines.push(`Live access members shown: ${liveAccessMembers.length} of ${liveMembers.filter((member) => String(member.access_tier || '') === 'live_plus_library').length}.`);
    for (const member of liveAccessMembers) lines.push(`- member ${compactLiveMemberForContext(member)}`);
  }

  if (includeContacts || includeAccounting) {
    const signups = Array.isArray(data.signups?.signups) ? data.signups.signups : [];
    if (includeContacts) {
      lines.push('');
      lines.push(`Contacts/roster: signups/contact records=${signups.length}.`);
      lines.push(`- Signup status counts: ${formatCounts(countByField(signups, 'status'))}`);
      lines.push(`- Payment status counts: ${formatCounts(countByField(signups, 'payment_status'))}`);
      for (const item of signups.slice(0, 12)) lines.push(`- contact ${compactPaymentForContext(item)} | email=${sanitizeContextText(item.parent_email, 80)} | phone=${sanitizeContextText(item.parent_phone, 40)}`);
      const communications = Array.isArray(data.contactCommunications?.communications) ? data.contactCommunications.communications : [];
      lines.push(`Communications: records=${communications.length}.`);
      for (const item of communications.slice(0, 12)) {
        lines.push(`- communication ${compactCommunicationForContext(item)}`);
      }
    }
  }

  if (includeAccounting) {
    const signups = Array.isArray(data.signups?.signups) ? data.signups.signups : [];
    const intake = Array.isArray(data.paymentIntake?.intake) ? data.paymentIntake.intake
      : Array.isArray(data.paymentIntake?.items) ? data.paymentIntake.items
      : Array.isArray(data.paymentIntake?.payment_intake) ? data.paymentIntake.payment_intake
        : Array.isArray(data.paymentIntake?.payments) ? data.paymentIntake.payments
          : [];
    const payments = Array.isArray(data.payments?.payments) ? data.payments.payments : [];
    const reminders = Array.isArray(data.paymentReminders?.candidates) ? data.paymentReminders.candidates : [];
    const webhooks = Array.isArray(data.greenInvoiceWebhooks?.events) ? data.greenInvoiceWebhooks.events
      : Array.isArray(data.greenInvoiceWebhooks?.webhooks) ? data.greenInvoiceWebhooks.webhooks
        : [];
    lines.push('');
    lines.push(`Accounting: signups=${signups.length}, payment_intake=${intake.length}, payments=${payments.length}, reminders_due=${reminders.length}, recent_green_invoice_webhooks=${webhooks.length}.`);
    for (const item of signups.slice(0, 8)) lines.push(`- signup ${compactPaymentForContext(item)}`);
    for (const item of intake.slice(0, 6)) lines.push(`- intake ${compactPaymentForContext(item)}`);
    for (const item of payments.slice(0, 6)) lines.push(`- payment ${compactPaymentForContext(item)}`);
    for (const item of reminders.slice(0, 6)) lines.push(`- reminder ${compactPaymentForContext(item)}`);
    for (const event of webhooks.slice(0, 6)) lines.push(`- webhook #${event.id} event=${sanitizeContextText(event.event_type || event.event || 'unknown', 80)} status=${event.processing_status || event.status || 'unknown'} received=${compactDateForContext(event.webhook_received_at || event.created_at)} matched_student=${event.matched_student_id || ''} matched_signup=${event.matched_signup_id || ''}`);
  }

  if (errors.length) {
    lines.push('');
    lines.push('Snapshot lookup errors:');
    for (const error of errors.slice(0, 6)) lines.push(`- ${error.slice(0, 260)}`);
  }

  lines.push('');
  lines.push(scopedProject
    ? 'Use this app snapshot to answer One Time task/status questions directly. If the message is not an explicit task/comment command, summarize and ask before creating new tasks.'
    : 'Use this app snapshot to answer navigation/status/ordering/audit questions directly. For section ordering, use the live records above and recommend next order. If a write/build/deploy/code edit is needed, route it into tracked Codex work rather than pretending the hosted assistant performed it. Do not substitute transcript/class-topic content for dashboard/system questions.');
  return lines.join('\n');
}

async function moveDriveFile(drive, file, targetFolderId) {
  if (!targetFolderId || !file?.id) return file;
  const parents = Array.isArray(file.parents) ? file.parents.join(',') : '';
  const result = await drive.files.update({
    fileId: file.id,
    addParents: targetFolderId,
    removeParents: parents || undefined,
    fields: 'id,name,mimeType,size,webViewLink,parents',
    supportsAllDrives: true,
  });
  return result.data;
}

async function downloadDriveFileToMediaInbox(drive, file) {
  const dateFolder = ensureDirectory(path.join(mediaInboxDir, todayFolderName()));
  const extension = path.extname(file.name || '') || guessExtensionForMime(file.mimeType);
  const baseName = sanitizeFileName(path.basename(file.name || `drive-${file.id}`, extension));
  const existing = fs.readdirSync(dateFolder)
    .filter((name) => name.includes(`drive-${baseName}`) && name.endsWith(extension))
    .map((name) => path.join(dateFolder, name))
    .find((candidatePath) => {
      const expectedSize = Number(file.size || 0);
      try {
        return expectedSize > 0 && fs.statSync(candidatePath).size === expectedSize;
      } catch {
        return false;
      }
    });
  if (existing) return existing;

  const localPath = path.join(
    dateFolder,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-drive-${baseName}${extension}`
  );

  const response = await drive.files.get(
    { fileId: file.id, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );
  await streamPipeline(response.data, fs.createWriteStream(localPath));
  return localPath;
}

function guessExtensionForMime(mimeType) {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized.includes('quicktime')) return '.mov';
  if (normalized.includes('mp4')) return '.mp4';
  if (normalized.includes('webm')) return '.webm';
  if (normalized.includes('mpeg')) return '.mp3';
  if (normalized.includes('wav')) return '.wav';
  if (normalized.includes('jpeg')) return '.jpg';
  if (normalized.includes('png')) return '.png';
  return '';
}

function formatAccountsReply(accounts) {
  if (!accounts.length) {
    return 'No connected Buffer social channels were found for this workspace.';
  }

  const aliasMap = buildAccountAliases(accounts);
  const lines = ['Connected Buffer channels:'];
  for (const [alias, account] of aliasMap.entries()) {
    const locality = account?.meta?.storefrontAddress?.locality
      ? ` (${account.meta.storefrontAddress.locality})`
      : '';
    lines.push(`- ${alias} -> ${account.platform} / ${account.name}${locality}`);
  }
  return lines.join('\n');
}

function formatBlogsReply(blogs) {
  if (!blogs.length) {
    return 'No first-party BNA blog destination is configured yet.';
  }

  return ['First-party BNA blog destinations:', ...blogs.map((blog) => `- ${blog.name} (${blog.url || blog.id})`)].join('\n');
}

function formatQueueReply(jobs) {
  if (!jobs.length) {
    return 'The pending ops queue is empty.';
  }

  return [
    'Pending ops queue:',
    ...jobs.map((job) => {
      const targets = Array.isArray(job.targets) && job.targets.length > 0 ? job.targets.join(', ') : 'none';
      return `- ${job.id}: ${job.kind} / ${job.status} / targets=${targets}`;
    }),
  ].join('\n');
}

function isActiveStage(stage) {
  return !['done', 'archive'].includes(String(stage || ''));
}

function isAgentOwnedTask(task) {
  return /codex|kimi|system|agent/i.test(String(task?.assigned_to || ''));
}

function taskStatusLine(task) {
  return [
    `#${task.id}`,
    String(task.title || 'Untitled task').replace(/\s+/g, ' ').slice(0, 110),
    `[${task.stage || 'unknown'}]`,
    task.assigned_to ? `owner=${task.assigned_to}` : '',
  ].filter(Boolean).join(' ');
}

async function loadLiveTasks(config) {
  const result = await appRequest(config, 'GET', '/api/bna/tasks');
  return Array.isArray(result?.tasks) ? result.tasks : [];
}

async function formatLiveTaskQueueReply(config) {
  let tasks = [];
  let codexQueue = null;
  try {
    tasks = await loadLiveTasks(config);
    if (!isScopedProjectBot(config)) {
      try {
        codexQueue = await appRequest(config, 'GET', '/api/bna/codex-queue/status?limit=12');
      } catch (error) {
        log(`Observable Codex queue read skipped: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    const legacyJobs = listPendingJobs(10);
    return [
      `Could not load the live Operations task queue: ${error instanceof Error ? error.message : String(error)}`,
      '',
      formatQueueReply(legacyJobs),
    ].join('\n');
  }

  const active = tasks.filter((task) => isActiveStage(task.stage));
  const codex = active.filter(isAgentOwnedTask);
  const decisions = active.filter((task) => String(task.stage || '') === 'needs_decision');
  const minePattern = isScopedProjectBot(config)
    ? /rabbi elie|elie scheller|shloimie/i
    : /shloimie|operator/i;
  const mine = active.filter((task) => minePattern.test(String(task.assigned_to || task.author || '')));
  const localMediaJobs = listPendingJobs(50);
  const codexJobs = Array.isArray(codexQueue?.queue?.jobs) ? codexQueue.queue.jobs : [];

  const lines = [
    isScopedProjectBot(config) ? 'Live One Time queue:' : 'Live Operations queue:',
    ...(isScopedProjectBot(config) ? [] : [`- Codex jobs: ${codexJobs.length || codex.length}`]),
    `- Decisions: ${decisions.length}`,
    isScopedProjectBot(config) ? `- Rabbi/Shloimie tasks: ${mine.length}` : `- My/Operator tasks: ${mine.length}`,
    ...(isScopedProjectBot(config) ? [] : [`- Legacy local media/intake jobs: ${localMediaJobs.length}`]),
  ];

  if (!isScopedProjectBot(config) && codexJobs.length) {
    lines.push('');
    lines.push('Codex job queue:');
    for (const job of codexJobs.slice(0, 12)) {
      const ids = [
        job.ticket_id ? `ticket #${job.ticket_id}` : '',
        job.task_id ? `task #${job.task_id}` : '',
        job.id ? `job #${job.id}` : '',
      ].filter(Boolean).join(' / ');
      lines.push(`- ${ids || 'job'} [${job.status || 'unknown'}] ${taskSummaryTitle(job, 100)}`);
    }
  } else if (!isScopedProjectBot(config) && codex.length) {
    lines.push('');
    lines.push('Changelog queue:');
    for (const task of codex.slice(0, 12)) {
      lines.push(`- ${taskStatusLine(task)}`);
    }
  }

  if (!isScopedProjectBot(config) && localMediaJobs.length) {
    lines.push('');
    lines.push('Note: legacy local media/intake jobs are separate from live app tasks; they should not be treated as Codex implementation work.');
  }

  return lines.join('\n');
}

function readPendingDecisions() {
  if (!fs.existsSync(pendingDecisionsFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(pendingDecisionsFile, 'utf8'));
  } catch {
    return {};
  }
}

function writePendingDecisions(decisions) {
  fs.writeFileSync(pendingDecisionsFile, JSON.stringify(decisions, null, 2));
}

function readPendingExternalActions() {
  if (!fs.existsSync(pendingExternalActionsFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(pendingExternalActionsFile, 'utf8'));
  } catch {
    return {};
  }
}

function writePendingExternalActions(actions) {
  fs.writeFileSync(pendingExternalActionsFile, JSON.stringify(actions, null, 2));
}

function savePendingExternalAction(messageId, action) {
  const actions = readPendingExternalActions();
  actions[String(messageId)] = {
    created_at: new Date().toISOString(),
    ...action,
  };
  writePendingExternalActions(actions);
}

function deletePendingExternalAction(messageId) {
  const actions = readPendingExternalActions();
  delete actions[String(messageId)];
  writePendingExternalActions(actions);
}

function savePendingDecisionSet(messageId, options, metadata = {}) {
  const decisions = readPendingDecisions();
  decisions[String(messageId)] = {
    created_at: new Date().toISOString(),
    options,
    ...metadata,
  };
  writePendingDecisions(decisions);
}

function normalizeTelegramReplyMode(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'codex' || normalized === 'codex_cli') return 'codex';
  if (
    normalized === 'openai' ||
    normalized === 'openai_api' ||
    normalized === 'open_api' ||
    normalized === 'api'
  ) {
    return 'openai';
  }
  return 'openai';
}

function normalizeApiPrimaryProvider(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (['kimi', 'kimmy', 'moonshot', 'moonshot_ai'].includes(normalized)) return 'kimi';
  return 'openai';
}

function apiProviderConfigs(config = {}) {
  const openaiProvider = config.openaiApiKey ? {
    kind: 'openai',
    label: 'OpenAI',
    apiKey: config.openaiApiKey,
    baseUrl: config.openaiBaseUrl,
    model: config.openaiSummaryModel,
  } : null;
  const kimiProvider = config.kimiApiKey ? {
    kind: 'kimi',
    label: 'Kimi',
    apiKey: config.kimiApiKey,
    baseUrl: config.kimiApiBaseUrl,
    model: config.kimiApiModel,
  } : null;
  return (config.apiPrimaryProvider === 'kimi'
    ? [kimiProvider, openaiProvider]
    : [openaiProvider, kimiProvider]
  ).filter(Boolean);
}

function apiProviderPathLabel(config = {}) {
  const providers = apiProviderConfigs(config);
  if (!providers.length) return 'not configured';
  return providers.map((provider) => `${provider.label} API (${provider.model})`).join(' -> ');
}

function readTelegramChatModes() {
  try {
    return JSON.parse(fs.readFileSync(telegramChatModesFile, 'utf8'));
  } catch {
    return {};
  }
}

function writeTelegramChatModes(modes) {
  fs.writeFileSync(telegramChatModesFile, JSON.stringify(modes, null, 2));
}

function getTelegramChatMode(chatId, config = {}) {
  const modes = readTelegramChatModes();
  const saved = modes[String(chatId)];
  const savedMode = saved && typeof saved === 'object' ? saved.mode : saved;
  return normalizeTelegramReplyMode(savedMode || config.telegramDefaultReplyMode || 'openai');
}

function setTelegramChatMode(chatId, mode) {
  const normalized = normalizeTelegramReplyMode(mode);
  const modes = readTelegramChatModes();
  modes[String(chatId)] = {
    mode: normalized,
    updated_at: new Date().toISOString(),
  };
  writeTelegramChatModes(modes);
  return normalized;
}

function detectTelegramModeButton(text) {
  const normalized = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (normalized === 'codex') return 'codex';
  if (['assistant', 'chat', 'api chat', 'hosted chat', 'openai api', 'open api', 'openai'].includes(normalized)) return 'openai';
  return null;
}

function telegramModeKeyboard() {
  const row = activeTelegramCodexEnabled
    ? [{ text: 'Assistant' }, { text: 'Codex' }]
    : [{ text: 'Assistant' }];
  return {
    keyboard: [row],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function readPromptPlanningSessions() {
  try {
    if (!fs.existsSync(telegramPlanningPromptsFile)) return {};
    const raw = fs.readFileSync(telegramPlanningPromptsFile, 'utf8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writePromptPlanningSessions(sessions) {
  fs.writeFileSync(telegramPlanningPromptsFile, JSON.stringify(sessions || {}, null, 2));
}

function promptPlanningSessionKey(chatId) {
  return String(chatId || '').trim();
}

function getActivePromptPlanningSession(chatId) {
  const key = promptPlanningSessionKey(chatId);
  if (!key) return null;
  const sessions = readPromptPlanningSessions();
  const session = sessions[key];
  if (!session || session.status !== 'active') return null;
  const updatedAt = Date.parse(session.updated_at || session.created_at || '');
  if (Number.isFinite(updatedAt) && Date.now() - updatedAt > 24 * 60 * 60 * 1000) {
    session.status = 'expired';
    session.expired_at = new Date().toISOString();
    sessions[key] = session;
    writePromptPlanningSessions(sessions);
    return null;
  }
  return session;
}

function savePromptPlanningSession(chatId, session) {
  const key = promptPlanningSessionKey(chatId);
  if (!key || !session) return session;
  const sessions = readPromptPlanningSessions();
  sessions[key] = {
    ...session,
    updated_at: new Date().toISOString(),
  };
  writePromptPlanningSessions(sessions);
  return sessions[key];
}

function finishPromptPlanningSession(chatId, status, extra = {}) {
  const key = promptPlanningSessionKey(chatId);
  if (!key) return null;
  const sessions = readPromptPlanningSessions();
  const session = sessions[key];
  if (!session) return null;
  sessions[key] = {
    ...session,
    ...extra,
    status,
    updated_at: new Date().toISOString(),
    [`${status}_at`]: new Date().toISOString(),
  };
  writePromptPlanningSessions(sessions);
  return sessions[key];
}

function createPromptPlanningSession(chatId, messageId, text) {
  const now = new Date().toISOString();
  const session = {
    id: `${chatId}-${messageId || Date.now()}`,
    status: 'active',
    kind: promptPlanningKind(text),
    original_text: String(text || '').trim(),
    revision_inputs: [],
    source_message_ids: [messageId].filter(Boolean).map(String),
    created_at: now,
    updated_at: now,
  };
  session.current_prompt = buildVisiblePlanningPrompt(session);
  return savePromptPlanningSession(chatId, session);
}

function refinePromptPlanningSession(chatId, messageId, text, session) {
  const updated = {
    ...(session || getActivePromptPlanningSession(chatId)),
  };
  updated.revision_inputs = [
    ...(Array.isArray(updated.revision_inputs) ? updated.revision_inputs : []),
    {
      text: String(text || '').trim(),
      message_id: messageId ? String(messageId) : null,
      received_at: new Date().toISOString(),
    },
  ];
  updated.source_message_ids = [
    ...new Set([
      ...(Array.isArray(updated.source_message_ids) ? updated.source_message_ids : []),
      ...(messageId ? [String(messageId)] : []),
    ]),
  ];
  updated.current_prompt = buildVisiblePlanningPrompt(updated);
  return savePromptPlanningSession(chatId, updated);
}

function isLikelyCodexDevelopmentRequest(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (hasDirectReplyInsteadOfCodexIntent(normalized)) return false;
  if (/\bbuild everything\b/.test(normalized)) return true;
  if (hasPromptPlanningIntent(normalized) && !hasExplicitPromptImplementationStart(normalized)) return false;

  const devVerb = /\b(build|fix|wire|deploy|test|inspect|edit|update|change|add|create|implement|rename|standardize|connect|scope|migrate|refactor|verify|remove|hide|get rid|stop showing)\b/.test(normalized);
  const devObject =
    /\b(repo|backend|database|schema|table|migration|server|server\.js|railway|webhook|telegram bridge|telegram bot|bot setup|agent config|agent configuration|task manager|dashboard|section|planned briefs?|implementation briefs?|project filter|access|route|routing|parser|buttons?|code|files?)\b/.test(normalized);

  if (devVerb && devObject) return true;
  if (/\b(codex|kodak|codak|programming|developer|development|cli|app implementation|backend implementation)\b/.test(normalized)) {
    return /\b(do|build|fix|wire|inspect|edit|update|implement|change|create|setup|set up|remove|hide|get rid)\b/.test(normalized);
  }
  return false;
}

function selectTelegramReplyMode(config, chatId, text) {
  if (!config.codexEnabled) {
    return { mode: 'openai', reason: 'scoped_openai_only' };
  }
  const chatMode = getTelegramChatMode(chatId, config);
  if (chatMode === 'codex') {
    return { mode: 'codex', reason: 'manual_codex' };
  }
  if (isLikelyCodexDevelopmentRequest(text)) {
    return { mode: 'codex', reason: 'development_request' };
  }
  return { mode: 'openai', reason: 'openai_default' };
}

function extractDecisionOptions(text) {
  const options = [];
  const seen = new Set();
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^(?:[-*]\s*)?(?:Option\s*)?([A-D])[\):.-]\s*(.{3,80})$/i)
      || line.match(/^(?:[-*]\s*)?(Recommended|Yes|No|Approve|Reject|Urgent|Today|This week|Low priority)[\):.-]\s*(.{0,80})$/i);
    if (!match) continue;

    const label = `${match[1]}${match[2] ? `: ${match[2]}` : ''}`
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .slice(0, 48)
      .trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    options.push(label);
    if (options.length >= 4) break;
  }
  return options.length >= 2 ? options : [];
}

function buildCodexPrompt(config, messageText, chatId, messageId, extraContext = '') {
  const date = new Date().toISOString();
  const memoryRelativePath = path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/');
  const scopedContext = buildScopedAgentContext(config);
  return [
    isScopedProjectBot(config)
      ? 'You are Codex only if Shloimie explicitly enabled Codex for this scoped One Time bot.'
      : 'You are Codex, the active BNA Telegram development sidekick for this repository.',
    isScopedProjectBot(config)
      ? 'This scoped bot is limited to One Time Mishnah Class task collaboration. Do not expose broader BNA private areas.'
      : 'The operator wants Telegram to feel like talking directly to Codex in the CLI while building the system.',
    isScopedProjectBot(config)
      ? 'Answer and work only inside the scoped project unless Shloimie explicitly changes this scope.'
      : 'You may inspect and edit files when the operator asks for development work. For pure questions, answer directly.',
    '',
    'Operator message metadata:',
    `- chat_id: ${chatId}`,
    `- message_id: ${messageId}`,
    `- received_at: ${date}`,
    '',
    'Repo context: AGENTS.md',
    readContextFile('AGENTS.md', 1800),
    '',
    'Repo context: TASKS.md',
    readContextFile('TASKS.md', 1800),
    '',
    'Repo context: current system state and newest handoffs',
    buildRecentRepoContext(1800),
    '',
    'Repo context: OpenAI capability and synchronization contract',
    buildOpenAiCapabilityContext(),
    '',
    ...(scopedContext
      ? [
          'Repo context: scoped agent files',
          scopedContext,
          '',
        ]
      : []),
    'Repo context: shared agent ledger and changelog tail',
    buildAgentSyncContext(2200),
    '',
    ...(extraContext
      ? [
          'Repo context: request-specific external system snapshot',
          extraContext,
          '',
        ]
      : []),
    'Repo context: tasks-pending/2026-05-26-login-legacy CRM-audit.md',
    readContextFile('tasks-pending/2026-05-26-login-legacy CRM-audit.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-27-bna-telegram-accountability-audit.md',
    readContextFile('tasks-pending/2026-05-27-bna-telegram-accountability-audit.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-27-content-repurposing-pipeline.md',
    readContextFile('tasks-pending/2026-05-27-content-repurposing-pipeline.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-28-accountability-and-ramble-routing.md',
    readContextFile('tasks-pending/2026-05-28-accountability-and-ramble-routing.md', 1600),
    '',
    'Repo context: brand-kit/README.md',
    readContextFile('brand-kit/README.md', 1200),
    '',
    'Repo context: brand-kit/01-core-beliefs.md',
    readContextFile('brand-kit/01-core-beliefs.md', 1200),
    '',
    'Repo context: brand-kit/03-parent-messaging.md',
    readContextFile('brand-kit/03-parent-messaging.md', 1200),
    '',
    `Repo context: ${memoryRelativePath}`,
    readTailContextFile(memoryRelativePath, 3200),
    '',
    'Instructions:',
    '- Treat the message as coming from the repo owner in Telegram.',
    '- Keep the final Telegram reply practical and concise.',
    '- If the operator asks to build, fix, inspect, wire, deploy, test, or update the repo, do the work end-to-end when feasible.',
    '- If the operator says "build everything", choose the order from TASKS.md and the newest tasks-pending handoffs, start executing, and do not ask for ordering confirmation unless there is a real blocker or product decision.',
    '- If the operator asks for goal mode, says to set the prompt as a goal, gives a GPT/ChatGPT correction output, or asks to work through the whole prompt/list until done, produce a BNA_GOAL_MODE_EXECUTION_PACKET using tasks-pending/_template-goal-mode-correction-output.md and route it to Codex execution instead of only summarizing.',
    '- If the operator asks to make or refine a prompt for Codex or ChatGPT, treat that as planning mode first: show a visible prompt/brief draft in chat and refine it before implementation unless they explicitly ask to build, test, run, or apply it.',
    '- When the operator says to test something that can be verified through browser interaction, assume Playwright/browser automation is required and report the actual browser checks performed.',
    '- If you change files, include a short summary and verification in the final reply.',
    '- Return a Telegram-ready reply in plain text.',
    '- Use ASCII characters only in the final reply. Do not use emoji, arrows, curly quotes, or em dashes.',
    '- If the message includes a ramble, break it into the clearest next tasks in the reply.',
    '- The BNA dashboard lanes are Tasks, Students, Content, Contacts, and Accounting. Do not use the old Pipeline, Signups, Billing, or Ramble tab language.',
    '- The Tasks dashboard should feel like a normal task manager: Decisions, My Tasks, Changelog, and Done. Codex machine work belongs in Changelog after it is queued or completed; Shloimie should not see machine work as his personal tasks.',
    '- The active human worker is Shloimie. The active development agent is Codex. Kimi is only a provider fallback or legacy alias.',
    '- Telegram should feel like natural conversation first. Do not announce background queues or Codex job mechanics; mention capture only when a real task, student note, payment item, content item, or decision was created or needs action.',
    '- Strategy, product, research, and "why is the system behaving this way" questions should be answered directly first, with recommendations and tradeoffs. Do not turn them into Codex tasks unless the operator asks to build the fix or the needed implementation is obvious.',
    '- Do not surprise the operator with random questions. If you see a useful recommendation from the current system state, label it as a suggestion and explain why it matters.',
    '- When a decision is needed, give 2-3 crisp options formatted exactly like "Option A: label", "Option B: label", and "Option C: label" so Telegram can create buttons.',
    '- Do not ask format-option questions for transcript/topic/content drafting requests. If the operator asks for topics, a transcript summary, a newsletter, or a revised post, choose the most useful default and return the actual text in chat.',
    '- If the request is clear, answer naturally or say what you will do next instead of asking unnecessary questions.',
    '- Student accountability means a named student private meeting, attendance, goals, daily or weekly progress, struggles, interests, decisions, next check-in, and notes about how the discussion went. General app, API, content, or dashboard rambles are tasks, not student accountability.',
    '- Content is WhatsApp and Facebook first, with YouTube, blog, newsletter, and Google Business Profile as later branches.',
    '- Avoid vague headings like "Next" by itself. Use "Captured", "Already filed", "Queued work", and "Blocked only if blocked".',
    '- Do not ask whether to file tasks if the intent is clear. The bridge already captures tasks, payment intake, accountability, and content jobs.',
    '- If the operator references recent work by phrase, such as "the image slider", first use SYSTEM-STATE.md and the newest tasks-pending handoff before asking what they mean.',
    '',
    'Operator message:',
    messageText.trim(),
  ].join('\n');
}

function buildKimiPrompt(config, messageText, chatId, messageId, extraContext = '') {
  return buildCodexPrompt(config, messageText, chatId, messageId, extraContext)
    .replace('You are Codex only if Shloimie explicitly enabled Codex for this scoped One Time bot.', 'You are Rabbi Elie Scheller\'s scoped One Time Mishnah Class Telegram sidekick.')
    .replace('You are Codex, the active BNA Telegram development sidekick for this repository.', 'You are the active BNA Telegram sidekick for this repository.')
    .replace('The operator wants Telegram to feel like talking directly to Codex in the CLI while building the system.', 'Answer using ONLY the repo context included below unless the operator explicitly asks you to inspect or edit code.');
}

function buildApiFallbackMessages(config, messageText, chatId, messageId, extraContext = '') {
  const date = new Date().toISOString();
  const memoryRelativePath = path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/');
  const scopedContext = buildScopedAgentContext(config);
  const system = buildApiSystemInstructions(config);
  const scoped = isScopedProjectBot(config);
  const repoContext = scoped
    ? [
        'Repo context: scoped access summary',
        [
          '- This is the Rabbi Elie Scheller One Time Mishnah Class profile.',
          '- It may use One Time project/task/comment APIs through scoped Operations credentials.',
          '- It must not expose BNA private Students, Accounting, Devices, student accountability, broad Content, or operator-only Changelog areas.',
        ].join('\n'),
        '',
        'Repo context: scoped agent files',
        scopedContext || '[missing scoped agent files]',
        '',
        'Repo context: One Time handoff',
        readContextFile('tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md', 2600),
        '',
      ]
    : [
        'Repo context: AGENTS.md',
        readContextFile('AGENTS.md', 1800),
        '',
        'Repo context: MEMORY.md',
        readContextFile('MEMORY.md', 2200),
        '',
        'Repo context: TASKS.md',
        readContextFile('TASKS.md', 1800),
        '',
        'Repo context: PROJECT-NOTES.md',
        readContextFile('PROJECT-NOTES.md', 1400),
        '',
        'Repo context: current system state and newest handoffs',
        buildRecentRepoContext(1800),
        '',
        'Repo context: OpenAI capability and synchronization contract',
        buildOpenAiCapabilityContext(),
        '',
        'Repo context: shared agent ledger and changelog tail',
        buildAgentSyncContext(2200),
        '',
      ];

  const user = [
    'Operator message metadata:',
    `- chat_id: ${chatId}`,
    `- message_id: ${messageId}`,
    `- received_at: ${date}`,
    '',
    ...repoContext,
    ...(extraContext
      ? [
          'Repo context: request-specific external system snapshot',
          extraContext,
          '',
        ]
      : []),
    ...(scoped ? [] : [
      'Repo context: tasks-pending/2026-05-26-login-legacy CRM-audit.md',
      readContextFile('tasks-pending/2026-05-26-login-legacy CRM-audit.md', 1800),
      '',
      'Repo context: tasks-pending/2026-05-27-bna-telegram-accountability-audit.md',
      readContextFile('tasks-pending/2026-05-27-bna-telegram-accountability-audit.md', 1800),
      '',
      'Repo context: tasks-pending/2026-05-27-content-repurposing-pipeline.md',
      readContextFile('tasks-pending/2026-05-27-content-repurposing-pipeline.md', 1800),
      '',
      'Repo context: tasks-pending/2026-05-28-accountability-and-ramble-routing.md',
      readContextFile('tasks-pending/2026-05-28-accountability-and-ramble-routing.md', 1600),
      '',
      'Repo context: brand-kit/README.md',
      readContextFile('brand-kit/README.md', 1200),
      '',
      'Repo context: brand-kit/01-core-beliefs.md',
      readContextFile('brand-kit/01-core-beliefs.md', 1200),
      '',
      'Repo context: brand-kit/03-parent-messaging.md',
      readContextFile('brand-kit/03-parent-messaging.md', 1200),
      '',
      `Repo context: ${memoryRelativePath}`,
      readTailContextFile(memoryRelativePath, 3200),
      '',
    ]),
    'Operator message:',
    messageText.trim(),
  ].join('\n');

  return { system, user };
}

function cleanKimiOutput(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\n*To resume this session:[^\n]*/g, '')
    .trim();
}

function cleanCodexOutput(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\n*To resume this session:[^\n]*/g, '')
    .trim();
}

function runCodex(prompt, config) {
  const lastMessageDir = ensureDirectory(path.join(runtimeDir, 'codex-last-messages'));
  const lastMessagePath = path.join(
    lastMessageDir,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(16).slice(2)}.txt`
  );
  const args = [
    '--sandbox',
    'danger-full-access',
    '--ask-for-approval',
    'never',
  ];
  if (config.codexModel) {
    args.push('--model', config.codexModel);
  }
  args.push(
    'exec',
    '-C',
    repoRoot,
    '--output-last-message',
    lastMessagePath,
    '-',
  );

  return new Promise((resolve, reject) => {
    const child = spawn(config.codexCommand || 'codex', args, {
      cwd: repoRoot,
      shell: false,
      env: {
        ...process.env,
        PYTHONUTF8: '1',
        PYTHONIOENCODING: 'utf-8',
        LANG: 'C.UTF-8',
      },
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error(`Codex timed out after ${config.codexTimeoutMs}ms`));
    }, config.codexTimeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const lastMessage = fs.existsSync(lastMessagePath)
        ? fs.readFileSync(lastMessagePath, 'utf8')
        : '';
      const cleanedLastMessage = cleanCodexOutput(lastMessage);
      if (code === 0) {
        resolve(cleanedLastMessage || cleanCodexOutput(stdout));
        return;
      }
      reject(new Error(cleanCodexOutput(lastMessage || stderr || stdout || `Codex exited ${code}`)));
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

function runKimi(prompt, model, timeoutMs) {
  const args = [
    '--quiet',
    '--work-dir',
    repoRoot,
    '--model',
    model,
    '--max-steps-per-turn',
    '20',
    '--prompt',
    prompt,
  ];

  const invoke = (kimiArgs) =>
    new Promise((resolve, reject) => {
      const child = spawn('kimi', kimiArgs, {
        cwd: repoRoot,
        shell: false,
        env: {
          ...process.env,
          PYTHONUTF8: '1',
          PYTHONIOENCODING: 'utf-8',
          LANG: 'C.UTF-8',
        },
      });

      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Kimi timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        const cleanedStdout = cleanKimiOutput(stdout);
        const cleanedStderr = cleanKimiOutput(stderr);
        if (code === 0) {
          resolve(cleanedStdout);
          return;
        }
        reject(new Error((cleanedStderr || cleanedStdout || `exit ${code}`).trim()));
      });
    });

  return invoke(args);
}

function runDriveMemorySync(command = 'sync-memory', timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/google-drive-setup.mjs', command], {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Drive memory sync timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error((stderr || stdout || `Drive sync exited ${code}`).trim()));
    });
  });
}

function runDriveContentLibrarySync(args = [], timeoutMs = 10 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/sync-drive-content-library.mjs', ...args], {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Drive content library sync timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error((stderr || stdout || `Drive content library sync exited ${code}`).trim()));
    });
  });
}

function parseDriveContentLibrarySyncArgs(text) {
  const raw = String(text || '').replace(/^\/sync_content_drive\b/i, '').trim();
  if (!raw) return ['--all', '--verify'];
  const parts = raw.split(/\s+/).filter(Boolean);
  const args = [];
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      args.push('--job-id', part);
    } else if ([
      '--all',
      '--articles',
      '--force',
      '--dry-run',
      '--verify',
      '--no-ai',
    ].includes(part)) {
      args.push(part);
    } else {
      throw new Error(`Unsupported sync argument: ${part}`);
    }
  }
  return args;
}

function driveContentSyncReply(output, prefix = 'Drive content library sync complete.') {
  const text = String(output || '').trim();
  if (!text) return prefix;
  return [prefix, '', text.slice(-3000)].join('\n');
}

function queueDriveContentLibrarySync(config, chatId, messageId, contentJobId) {
  if (!contentJobId) return;
  runDriveContentLibrarySync(['--job-id', String(contentJobId), '--verify'])
    .then((output) => sendReply(
      config.botToken,
      chatId,
      driveContentSyncReply(output, `Drive transcript library synced for content job #${contentJobId}.`),
      messageId
    ))
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      log(`Drive content library sync failed for content job ${contentJobId}: ${message}`);
      return sendReply(
        config.botToken,
        chatId,
        `Drive transcript library sync failed for content job #${contentJobId}: ${message.slice(0, 1200)}`,
        messageId
      );
    });
}

function runOpenAiSidekickSmoke(timeoutMs = 240000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/smoke-openai-sidekick.mjs'], {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Hosted Assistant smoke timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error((stderr || stdout || `Hosted Assistant smoke exited ${code}`).trim()));
    });
  });
}

function runNpmScript(scriptName, timeoutMs = 10 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npmCommand, ['run', scriptName], {
      cwd: repoRoot,
      shell: false,
      env: process.env,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`${scriptName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve([stdout, stderr].filter(Boolean).join('\n').trim());
        return;
      }
      reject(new Error((stderr || stdout || `${scriptName} exited ${code}`).trim()));
    });
  });
}

async function runRailwayDeployAndDoctor() {
  const deployOutput = await runNpmScript('railway:redeploy', 20 * 60 * 1000);
  const doctorOutput = await runNpmScript('railway:doctor', 8 * 60 * 1000);
  return [
    'Railway deploy completed.',
    '',
    deployOutput,
    '',
    'Railway doctor:',
    doctorOutput,
  ].join('\n').trim();
}

function runAgentFleet(args = ['--status'], timeoutMs = 10 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/agent-fleet-supervisor.mjs', ...args], {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Agent fleet command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error((stderr || stdout || `Agent fleet exited ${code}`).trim()));
    });
  });
}

function startAgentFleet(timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', 'scripts/start-agent-fleet.ps1'], {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Agent fleet start timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error((stderr || stdout || `Agent fleet start exited ${code}`).trim()));
    });
  });
}

async function runKimiApiFallback(config, messageText, chatId, messageId) {
  if (!config.kimiApiKey) {
    throw new Error('No KIMI_API_KEY configured for API fallback');
  }

  const externalContextParts = [];
  if (!isScopedProjectBot(config)) {
    try {
      const driveContext = await buildDriveContextForMessage(messageText);
      if (driveContext) {
        log(`Attached Google Drive context to Kimi API fallback message ${messageId} (${driveContext.length} chars)`);
        externalContextParts.push(driveContext);
      }
    } catch (error) {
      externalContextParts.push(`Google Drive context lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      log(`Drive context lookup failed for Kimi API fallback message ${messageId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  try {
    const appContext = await buildBnaAppSnapshotForMessage(config, messageText);
    if (appContext) {
      log(`Attached BNA app snapshot to Kimi API fallback message ${messageId} (${appContext.length} chars)`);
      externalContextParts.push(appContext);
    }
  } catch (error) {
    externalContextParts.push(`BNA app snapshot lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    log(`BNA app snapshot lookup failed for Kimi API fallback message ${messageId}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const { system, user } = buildApiFallbackMessages(config, messageText, chatId, messageId, externalContextParts.join('\n\n'));
  const response = await fetch(`${config.kimiApiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.kimiApiKey}`,
    },
    body: JSON.stringify({
      model: config.kimiApiModel,
      max_tokens: 900,
      thinking: { type: 'disabled' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kimi API fallback ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('')
    : typeof content === 'string'
      ? content
      : '';

  return cleanKimiOutput(text);
}

async function runChatApiProvider(provider, messages, options = {}) {
  const maxTokens = Number.isFinite(options.maxTokens) ? options.maxTokens : 2200;
  const temperature = Number.isFinite(options.temperature) ? options.temperature : null;
  const response = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: maxTokens,
      ...(temperature === null ? {} : { temperature }),
      ...(provider.kind === 'kimi' ? { thinking: { type: 'disabled' } } : {}),
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider.label} API ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('')
    : typeof content === 'string'
      ? content
      : '';
  return cleanKimiOutput(text);
}

async function runConfiguredChatCompletion(config, messages, options = {}) {
  const providers = apiProviderConfigs(config);
  const purpose = options.purpose || 'chat completion';
  const errors = [];

  for (const provider of providers) {
    try {
      const text = await runChatApiProvider(provider, messages, options);
      if (String(text || '').trim()) {
        return {
          provider: provider.label,
          providerKind: provider.kind,
          text: String(text || '').trim(),
          errors,
        };
      }
      errors.push(`${provider.label}: empty response`);
    } catch (error) {
      errors.push(`${provider.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`No API provider succeeded for ${purpose}. ${errors.join(' | ') || 'No OpenAI/Kimi API key configured.'}`);
}

function shouldUseOpenAiResearch(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (/\b(latest|current|today|recent|newest|up to date|up-to-date|look up|research|investigate|web search|search the web|youtube api|api docs|agentic framework|frameworks|market|competitor|seo|aeo|geo)\b/.test(normalized)) {
    return true;
  }
  if (/\bwhat (?:other )?(?:tools|apis|frameworks|integrations|capabilities)\b/.test(normalized)) return true;
  return false;
}

function extractResponsesOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text.trim();
  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function runOpenAiResearchResponse(config, messageText, system, user) {
  if (!config.openaiApiKey) throw new Error('OPENAI_API_KEY is not configured');
  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiResearchModel || config.openaiSummaryModel,
      tools: [{ type: 'web_search' }],
      tool_choice: 'auto',
      include: ['web_search_call.action.sources'],
      max_output_tokens: 900,
      input: [
        {
          role: 'system',
          content: [
            system,
            '',
            'Research mode is enabled. Use web search only when it materially improves the answer.',
            'When you use web information, include concise source links in the answer.',
            'For BNA system questions, combine live repo/app context with research. Do not ignore the local context.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: [
            user,
            '',
            'Original research trigger:',
            String(messageText || '').trim(),
          ].join('\n'),
        },
      ],
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI Responses research ${response.status}: ${body.slice(0, 700)}`);
  }
  const data = JSON.parse(body);
  const text = extractResponsesOutputText(data);
  if (!text) throw new Error('OpenAI Responses research returned no text');
  return cleanKimiOutput(text);
}

async function runApiFallback(config, messageText, chatId, messageId) {
  const externalContextParts = [];
  if (!isScopedProjectBot(config)) {
    try {
      const driveContext = await buildDriveContextForMessage(messageText);
      if (driveContext) {
        log(`Attached Google Drive context to API fallback message ${messageId} (${driveContext.length} chars)`);
        externalContextParts.push(driveContext);
      }
    } catch (error) {
      externalContextParts.push(`Google Drive context lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      log(`Drive context lookup failed for API fallback message ${messageId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  try {
    const appContext = await buildBnaAppSnapshotForMessage(config, messageText);
    if (appContext) {
      log(`Attached BNA app snapshot to API fallback message ${messageId} (${appContext.length} chars)`);
      externalContextParts.push(appContext);
    }
  } catch (error) {
    externalContextParts.push(`BNA app snapshot lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    log(`BNA app snapshot lookup failed for API fallback message ${messageId}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const { system, user } = buildApiFallbackMessages(config, messageText, chatId, messageId, externalContextParts.join('\n\n'));
  if (config.apiPrimaryProvider !== 'kimi' && config.openaiApiKey && shouldUseOpenAiResearch(messageText)) {
    try {
      log(`Using OpenAI Responses web-search research path for message ${messageId}`);
      const reply = await runOpenAiResearchResponse(config, messageText, system, user);
      return { provider: 'OpenAI Research', reply, errors: [] };
    } catch (error) {
      log(`OpenAI research path failed for message ${messageId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const providers = apiProviderConfigs(config);

  const errors = [];
  for (const provider of providers) {
    try {
      const reply = await runChatApiProvider(provider, [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      return { provider: provider.label, reply, errors };
    } catch (error) {
      errors.push(`${provider.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`No API fallback succeeded. ${errors.join(' | ') || 'No OpenAI/Kimi API key configured.'}`);
}

async function telegramRequest(botToken, method, payload = null, signal) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    signal,
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(data)}`);
  }
  return data.result;
}

async function telegramUploadFile(botToken, method, fields, fileField, localPath, filename) {
  const buffer = fs.readFileSync(localPath);

  async function attemptUpload(uploadFields) {
    const form = new FormData();
    for (const [key, value] of Object.entries(uploadFields || {})) {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    }
    form.append(fileField, new Blob([buffer], { type: 'application/octet-stream' }), filename || path.basename(localPath));

    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      body: form,
    });

    const data = await response.json();
    if (!data.ok) {
      const error = new Error(`Telegram ${method} failed: ${data.description || response.status}`);
      error.telegramDescription = data.description || '';
      throw error;
    }
    return data.result;
  }

  try {
    return await attemptUpload(fields);
  } catch (error) {
    const description = String(error.telegramDescription || error.message || '');
    if (fields?.reply_to_message_id && /message to be replied not found/i.test(description)) {
      const fallbackFields = { ...fields };
      delete fallbackFields.reply_to_message_id;
      return attemptUpload(fallbackFields);
    }
    throw error;
  }
}

async function appRequest(config, method, endpoint, body = null) {
  if (!config.opsUsername || !config.opsPassword) {
    return null;
  }

  const response = await fetch(`${config.appUrl.replace(/\/+$/, '')}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`BNA app ${endpoint} failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return data;
}

async function reportBridgeRuntimeStatus(config, {
  status = 'running',
  botIdentity = null,
  details = {},
} = {}) {
  if (!config?.runtimeAgentKey) return null;
  if (!config.opsUsername || !config.opsPassword) return null;

  try {
    const result = await appRequest(config, 'POST', '/api/bna/agent-fleet/status', {
      agent_key: config.runtimeAgentKey,
      status,
      pid: process.pid,
      mode: isScopedProjectBot(config) ? 'scoped-polling' : 'academy-polling',
      host: os.hostname(),
      started_at: readBridgeLock().startedAt || null,
      stale_after_ms: Math.max(Number(config.runtimeHeartbeatMs || 45000) * 3, 180000),
      queue_size: 1,
      ready_count: 1,
      details: {
        script: 'scripts/telegram-kimi-bridge.mjs',
        bridge_profile: config.bridgeProfile || 'bna',
        bridge_profile_label: config.bridgeProfileLabel || 'BNA academy',
        bot_username: botIdentity?.username || '',
        bot_id: botIdentity?.id || null,
        active_source: 'scripts/telegram-kimi-bridge.mjs',
        process_selector: process.env.BNA_RAILWAY_PROCESS || process.env.RAILWAY_PROCESS || process.env.PROCESS_TYPE || 'local',
        api_path: apiProviderPathLabel(config),
        telegram_default_reply_mode: config.telegramDefaultReplyMode || 'openai',
        allowed_chat_ids_count: Array.isArray(config.allowedChatIds) ? config.allowedChatIds.length : 0,
        codex_enabled: Boolean(config.codexEnabled),
        ...details,
      },
    });
    updateBridgeLock({
      runtime_status: status,
      runtime_reported_at: new Date().toISOString(),
    });
    return result;
  } catch (error) {
    log(`Bridge runtime status report failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function startBridgeRuntimeHeartbeat(config, botIdentity) {
  if (!config?.runtimeAgentKey || !config.opsUsername || !config.opsPassword) {
    return async () => null;
  }

  let stopped = false;
  const intervalMs = Math.max(30000, Number(config.runtimeHeartbeatMs || 45000));
  const sendHeartbeat = async (status = 'running', details = {}) => {
    if (stopped && status === 'running') return null;
    return reportBridgeRuntimeStatus(config, { status, botIdentity, details });
  };

  sendHeartbeat('running', { lifecycle: 'startup' }).catch(() => null);
  const interval = setInterval(() => {
    sendHeartbeat('running', { lifecycle: 'heartbeat' }).catch(() => null);
  }, intervalMs);
  interval.unref?.();

  return async (status = 'stopped', details = {}) => {
    if (stopped) return null;
    stopped = true;
    clearInterval(interval);
    return sendHeartbeat(status, details);
  };
}

async function shutdownBridge(exitCode = 0, status = 'stopped', details = {}) {
  if (bridgeShutdownInProgress) return;
  bridgeShutdownInProgress = true;
  try {
    if (stopBridgeRuntimeHeartbeat) {
      await stopBridgeRuntimeHeartbeat(status, details);
    } else if (activeBridgeConfig) {
      await reportBridgeRuntimeStatus(activeBridgeConfig, {
        status,
        botIdentity: activeBridgeBotIdentity,
        details,
      });
    }
  } finally {
    releaseLock();
    process.exit(exitCode);
  }
}

async function parseCanonicalIntakeToApp(config, text, context = {}) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  return appRequest(config, 'POST', '/api/bna/intake/parse', {
    raw_input: raw,
    source_type: context.source_type || 'telegram_ramble',
    source_id: context.source_id || null,
    source_channel: 'telegram',
    source_chat_id: context.chat_id || null,
    source_message_id: context.message_id || null,
    created_by: config.bridgeProfile || 'telegram_bridge',
    project_key: context.project_key || config.scopedProjectKey || undefined,
    intake_type: /\b(website|homepage|correction|missed|fix everything|big ramble|large ramble)\b/i.test(raw) ? 'broad_correction' : 'general',
    requirement_register_path: /\b(website|homepage|correction|missed|fix everything|big ramble|large ramble)\b/i.test(raw)
      ? `tasks-pending/${new Date().toISOString().slice(0, 10)}-website-ramble-correction-audit.md`
      : undefined,
    dry_run: Boolean(context.dry_run),
  });
}

function parseProviderOnboardingTelegramPayload(text = '', msg = {}) {
  const raw = String(text || '').trim();
  const isCommand = /^\/provider_onboard\b/i.test(raw);
  const clearIntent = /\b(service provider|provider|tutor|tutoring|chug|class|shiur|rabbi|rebbe)\b/i.test(raw)
    && /\b(sign\s*up|signup|join|list|listing|provider index|offer services|free listing)\b/i.test(raw);
  if (!isCommand && !clearIntent) return null;
  const commandText = raw.replace(/^\/provider_onboard\b/i, '').trim();
  const payload = {
    channel: 'telegram',
    external_user_id: String(msg?.from?.id || msg?.chat?.id || ''),
    source_context: {
      telegram_chat_id: String(msg?.chat?.id || ''),
      telegram_message_id: msg?.message_id || null,
      raw_text: raw.slice(0, 4000),
    },
    raw_intake: raw,
  };
  const tokenText = commandText || raw;
  const tokenPattern = /\b(provider|name|business|contact|email|phone|whatsapp|category|categories|area|location|language|languages|offering|service|description|website|image)\s*:\s*([^|;\n]+)/gi;
  let match;
  while ((match = tokenPattern.exec(tokenText))) {
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (!value) continue;
    if (['provider', 'name', 'business'].includes(key)) payload.provider_name = value;
    else if (key === 'contact') payload.contact_name = value;
    else if (key === 'email') payload.email = value;
    else if (['phone', 'whatsapp'].includes(key)) payload[key] = value;
    else if (['category', 'categories'].includes(key)) payload.category = value;
    else if (['area', 'location'].includes(key)) payload.location = value;
    else if (['language', 'languages'].includes(key)) payload.language = value;
    else if (['offering', 'service'].includes(key)) payload.services_offered = value;
    else if (key === 'description') payload.description = value;
    else if (key === 'website') payload.website = value;
    else if (key === 'image') payload.profile_photo_url = value;
  }
  const parts = commandText.split('|').map((part) => part.trim()).filter(Boolean);
  if (!payload.provider_name && parts[0] && !/^[a-z_ ]+:/i.test(parts[0])) payload.provider_name = parts[0];
  if (!payload.email) {
    const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
    if (email) payload.email = email.toLowerCase();
  }
  if (!payload.phone) {
    const phone = raw.match(/(?:\+?\d[\d\s().-]{6,}\d)/)?.[0] || '';
    if (phone) payload.phone = phone.replace(/\s+/g, ' ').trim();
  }
  if (!payload.category) {
    if (/rabbi|rebbe|shiur|torah|mishn(a|ah)|gemara/i.test(raw)) payload.category = 'rabbeim-shiurim';
    else if (/tutor|homework|math|english|academic/i.test(raw)) payload.category = 'tutoring';
    else if (/coach|executive function/i.test(raw)) payload.category = 'coaching';
    else if (/therapy|therapist|support/i.test(raw)) payload.category = 'therapy-support';
    else if (/camp|program/i.test(raw)) payload.category = 'camps-programs';
    else if (/chug|class|course/i.test(raw)) payload.category = 'chugim-classes';
  }
  if (!payload.language) {
    const languageMatch = raw.match(/\b(English|Hebrew|Yiddish|Ivrit|Lashon Hakodesh)\b/i)?.[0] || '';
    if (languageMatch) payload.language = languageMatch;
  }
  if (!payload.description) payload.description = commandText || raw;
  if (!payload.services_offered) payload.services_offered = payload.description;
  return payload;
}

async function handleProviderOnboardingTelegramCommand(config, msg) {
  const text = getTelegramMessageText(msg);
  const payload = parseProviderOnboardingTelegramPayload(text, msg);
  if (!payload) return false;
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  if (!config.opsUsername || !config.opsPassword) {
    await sendReply(config.botToken, chatId, 'Provider signup capture needs Operations credentials configured.', messageId);
    return true;
  }
  const missing = [];
  if (!payload.provider_name) missing.push('provider/name');
  if (!payload.email && !payload.phone && !payload.whatsapp) missing.push('email or phone');
  if (!payload.category) missing.push('category');
  if (!payload.location) missing.push('location/area');
  if (!payload.language) missing.push('language');
  if (!payload.services_offered) missing.push('offering/service');
  if (missing.length) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'I can capture a provider signup when these details are present:',
        missing.map((item) => `- ${item}`).join('\n'),
        '',
        'Example:',
        '/provider_onboard provider: Cohen Tutoring | contact: Rabbi Cohen | phone: +972... | category: tutoring | area: Beit Shemesh | language: English | offering: Free intro math class',
      ].join('\n'),
      messageId
    );
    return true;
  }
  try {
    const result = await appRequest(config, 'POST', '/api/provider-signup', payload);
    appendAgentTaskLedger({
      event: 'provider_signup_captured',
      source: 'telegram',
      chat_id: chatId,
      message_id: messageId,
      title: `Provider signup captured: ${payload.provider_name}`,
      stage: 'pending_admin_review',
      category: 'provider_index',
      assigned_to: 'Shloimie',
      provider_id: result?.providerId || null,
      slug: result?.slug || null,
    });
    await sendReply(
      config.botToken,
      chatId,
      [
        `Provider signup captured: ${payload.provider_name}`,
        `Status: ${result?.status || 'pending'} - admin approval required before public listing.`,
        result?.completeness !== undefined ? `Completeness: ${result.completeness}%` : '',
        result?.slug ? `Profile slug reserved: ${result.slug}` : '',
      ].filter(Boolean).join('\n'),
      messageId
    );
  } catch (error) {
    await sendReply(config.botToken, chatId, `Provider signup capture failed: ${error instanceof Error ? error.message : String(error)}`, messageId);
  }
  return true;
}

function redactZoomLinksForTelegram(value = '') {
  return String(value || '').replace(/https?:\/\/[^\s<>"']*zoom[^\s<>"']*/gi, '[zoom link redacted]');
}

function extractTelegramUrl(text = '') {
  const urls = String(text || '').match(/https?:\/\/[^\s<>"')]+/gi) || [];
  return urls[0] || '';
}

function extractLiveMemberReference(text = '') {
  const raw = String(text || '');
  const idMatch = raw.match(/\b(?:member|m)\s*#?\s*(\d+)\b/i);
  if (idMatch) return { member_id: Number(idMatch[1]) };
  const emailMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) return { email: emailMatch[0].toLowerCase() };
  return {};
}

function extractLiveSessionReference(text = '') {
  const raw = String(text || '');
  const idMatch = raw.match(/\b(?:session|class)\s*#?\s*(\d+)\b/i);
  if (idMatch) return { session_id: Number(idMatch[1]) };
  if (/\b(tonight|today|now|next class|current class)\b/i.test(raw)) return { tonight: true };
  return {};
}

async function createLiveClassClarificationTask(config, msg, title, notes) {
  try {
    const result = await appRequest(config, 'POST', '/api/bna/tasks', {
      title,
      notes: redactZoomLinksForTelegram(notes),
      stage: 'needs_decision',
      category: 'communications',
      urgency: 'today',
      assigned_to: 'Shloimie',
      project: 'one_time_mishnah_class',
      source: 'telegram',
      created_by: 'telegram_bridge',
      source_context: {
        telegram_chat_id: String(msg.chat?.id || ''),
        telegram_message_id: msg.message_id || null,
        live_class_clarification: true,
      },
    });
    return result?.task || result || null;
  } catch (error) {
    log(`Live class clarification task failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function resolveLiveSessionForTelegram(config, text) {
  const ref = extractLiveSessionReference(text);
  if (ref.session_id) {
    const sessions = await appRequest(config, 'GET', '/api/bna/live-sessions');
    return (sessions?.sessions || []).find((session) => Number(session.id) === Number(ref.session_id)) || null;
  }
  if (ref.tonight) {
    const result = await appRequest(config, 'GET', '/api/bna/live-sessions/tonight');
    return result?.session || null;
  }
  return null;
}

async function resolveLiveMemberForTelegram(config, text) {
  const ref = extractLiveMemberReference(text);
  if (ref.member_id) {
    const result = await appRequest(config, 'GET', `/api/bna/members?q=${encodeURIComponent(String(ref.member_id))}`);
    return (result?.members || []).find((member) => Number(member.id) === Number(ref.member_id)) || null;
  }
  if (ref.email) {
    const result = await appRequest(config, 'GET', `/api/bna/members?q=${encodeURIComponent(ref.email)}`);
    const matches = (result?.members || []).filter((member) => String(member.email || '').toLowerCase() === ref.email);
    return matches.length === 1 ? matches[0] : null;
  }
  return null;
}

async function handleLiveClassTelegramCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const normalized = String(text || '').toLowerCase();
  if (!wantsLiveClassSnapshot(text)) return false;
  if (!config.opsUsername || !config.opsPassword) return false;

  if (/\b(tonight|today|current|next)\b/i.test(text) && /\bzoom\b/i.test(text) && /\blink\b/i.test(text) && /\b(what|show|send me|give me|where)\b/i.test(text)) {
    try {
      const result = await appRequest(config, 'GET', '/api/bna/live-sessions/tonight');
      const session = result?.session;
      if (!session) throw new Error('No scheduled live session was found.');
      await sendReply(
        config.botToken,
        chatId,
        [
          `${session.title || 'Tonight class'}`,
          `Start: ${compactDateForContext(session.start_at) || 'not set'}`,
          `Link version: ${session.link_version || session.zoom_link_version || 1}`,
          session.zoom_meeting_url ? `Zoom: ${session.zoom_meeting_url}` : 'Zoom: not set',
        ].join('\n'),
        messageId
      );
    } catch (error) {
      await sendReply(config.botToken, chatId, error.message || 'I could not find tonight\'s Zoom link.', messageId);
    }
    return true;
  }

  if (/\b(who|list|show)\b/i.test(text) && /\blive access\b/i.test(text)) {
    try {
      const result = await appRequest(config, 'GET', '/api/bna/members?access_tier=live_plus_library');
      const members = result?.members || [];
      const lines = [
        `Live access members: ${members.length}`,
        ...members.slice(0, 20).map((member) => `#${member.id} ${member.display_name || member.email || 'Member'} | ${member.access_status || 'status'} | ${member.email || 'no email'}`),
      ];
      await sendReply(config.botToken, chatId, lines.join('\n'), messageId);
    } catch (error) {
      await sendReply(config.botToken, chatId, error.message || 'I could not load live access members.', messageId);
    }
    return true;
  }

  if (/\b(change|replace|update)\b/i.test(text) && /\b(link|zoom)\b/i.test(text)) {
    const zoomUrl = extractTelegramUrl(text);
    const session = await resolveLiveSessionForTelegram(config, text).catch(() => null);
    if (!zoomUrl || !/zoom/i.test(zoomUrl) || !session?.id) {
      const task = await createLiveClassClarificationTask(
        config,
        msg,
        'Clarify live class Zoom link change',
        `Telegram asked to change a live class Zoom link, but the request was missing ${!zoomUrl ? 'the new Zoom URL' : 'a specific session/tonight reference'}.\n\nOriginal message: ${redactZoomLinksForTelegram(text)}`
      );
      await sendReply(config.botToken, chatId, task?.id ? `I need the exact session and new Zoom URL. I opened task #${task.id} to clarify it.` : 'I need the exact session and new Zoom URL before changing anything.', messageId);
      return true;
    }
    try {
      const result = await appRequest(config, 'PATCH', `/api/bna/live-sessions/${session.id}`, {
        zoom_meeting_url: zoomUrl,
      });
      await sendReply(
        config.botToken,
        chatId,
        `Updated ${result?.session?.title || `session #${session.id}`} to link version ${result?.session?.link_version || result?.session?.zoom_link_version || 'new'}. Send the updated link when ready.`,
        messageId
      );
    } catch (error) {
      await sendReply(config.botToken, chatId, error.message || 'I could not update the Zoom link.', messageId);
    }
    return true;
  }

  if (/\bsend\b/i.test(text) && /\b(member|email|zoom|link)\b/i.test(text) && /\bzoom|link\b/i.test(text)) {
    const session = await resolveLiveSessionForTelegram(config, text).catch(() => null);
    const member = await resolveLiveMemberForTelegram(config, text).catch(() => null);
    if (!session?.id || !member?.id) {
      const task = await createLiveClassClarificationTask(
        config,
        msg,
        'Clarify live class Zoom send request',
        `Telegram asked to send a member their Zoom link, but the request did not clearly identify both member and session.\n\nOriginal message: ${redactZoomLinksForTelegram(text)}`
      );
      await sendReply(config.botToken, chatId, task?.id ? `I need the exact member and session before sending. I opened task #${task.id} to clarify it.` : 'I need the exact member and session before sending.', messageId);
      return true;
    }
    try {
      const result = await appRequest(config, 'POST', `/api/bna/live-sessions/${session.id}/send-zoom-link`, {
        member_id: member.id,
        dryRun: false,
      });
      const summary = result?.summary || {};
      await sendReply(
        config.botToken,
        chatId,
        `Zoom send attempted for ${member.display_name || member.email || `member #${member.id}`}. Result: ${Object.entries(summary).map(([key, value]) => `${value} ${key}`).join(', ') || 'no recipients'}.`,
        messageId
      );
    } catch (error) {
      await sendReply(config.botToken, chatId, error.message || 'I could not send the Zoom link.', messageId);
    }
    return true;
  }

  return false;
}

async function handleTypedOperationsAction(config, msg, intentPlan) {
  const chatId = String(msg.chat.id);
  const text = msg.text?.trim() || '';
  const messageId = msg.message_id;
  const actionRoute = classifyTelegramActionRequest({
    text,
    intentPlan,
    scoped: isScopedProjectBot(config),
  });

  if (actionRoute.kind !== 'typed_action') return false;
  if (!config.opsUsername || !config.opsPassword) {
    log(`Typed action ${actionRoute.action_id} skipped for chat ${chatId}: Operations credentials missing`);
    return false;
  }

  const workspace = isScopedProjectBot(config) ? 'rabbi_sheller_provider' : 'bna';
  const result = await appRequest(config, 'POST', '/api/bna/actions/run', {
    action_id: actionRoute.action_id,
    inputs: actionRoute.inputs || {},
    source: 'telegram',
    workspace,
    actor_role: isScopedProjectBot(config) ? 'provider_admin' : 'operator',
    dry_run: Boolean(actionRoute.dry_run),
    page_context: {
      telegram_chat_id: chatId,
      telegram_message_id: messageId,
      confidence: actionRoute.confidence,
      reason: actionRoute.reason,
    },
  });

  const reply = formatTelegramActionResult(result);
  const delivery = await sendReply(config.botToken, chatId, reply, messageId);
  appendMemoryEntry('Telegram Typed Action', JSON.stringify({
    action_id: actionRoute.action_id,
    reason: actionRoute.reason,
    confidence: actionRoute.confidence,
    result_status: result.success ? (result.executed ? 'executed' : 'previewed') : 'failed',
    audit_log: result.audit_log?.action_run_id || null,
  }), {
    chat_id: chatId,
    message_id: messageId,
    telegram_chunks: delivery.chunks,
    telegram_message_ids: delivery.message_ids.join(','),
  });
  return true;
}

function parseWhatsappTarget(text = '') {
  const value = String(text || '').trim();
  const target = {};
  const patterns = [
    ['signup_id', /\bsignup\s*[:#]?\s*(\d+)/i],
    ['lead_id', /\blead\s*[:#]?\s*(\d+)/i],
    ['student_id', /\bstudent\s*[:#]?\s*(\d+)/i],
    ['to', /\b(?:phone|to|number)\s*[:#]?\s*([+()\-\s\d]{7,})/i],
  ];
  for (const [key, pattern] of patterns) {
    const match = value.match(pattern);
    if (match) target[key] = key.endsWith('_id') ? Number(match[1]) : match[1].trim();
  }
  if (!target.to && !target.signup_id && !target.lead_id && !target.student_id && /^[+()\-\s\d]{7,}$/.test(value)) {
    target.to = value;
  }
  return target;
}

function parseWhatsappSendCommand(text = '') {
  const commandText = String(text || '').replace(/^\/(?:send_whatsapp|whatsapp_send|wa_send)\b/i, '').trim();
  const [targetPart, ...messageParts] = commandText.split('|');
  const message = messageParts.join('|').trim();
  return {
    target: parseWhatsappTarget(targetPart),
    message,
  };
}

function parseWhatsappSyncCommand(text = '') {
  const commandText = String(text || '').replace(/^\/(?:wapi_sync|whatsapp_sync|wa_sync)\b/i, '').trim();
  const tokens = {};
  for (const match of commandText.matchAll(/([a-z_]+)\s*:\s*([^|\s]+)/gi)) {
    tokens[match[1].toLowerCase()] = match[2].trim();
  }
  const payload = {
    count: Number(tokens.count || tokens.limit || 100),
    sort: tokens.sort || 'desc',
    dry_run: /\b(dry_run|dry-run|preview|test)\b/i.test(commandText),
  };
  if (tokens.chat || tokens.chat_id) payload.chat_id = tokens.chat || tokens.chat_id;
  if (tokens.since_hours || tokens.since) payload.since_hours = Number(tokens.since_hours || tokens.since);
  if (tokens.time_from || tokens.from) payload.time_from = tokens.time_from || tokens.from;
  if (tokens.time_to || tokens.to) payload.time_to = tokens.time_to || tokens.to;
  if (tokens.offset) payload.offset = Number(tokens.offset);
  if (tokens.from_me) payload.from_me = tokens.from_me;
  return payload;
}

function formatWapiSyncReply(result = {}) {
  const run = result.sync_run || {};
  return [
    result.dry_run ? 'Whapi sync preview complete:' : 'Whapi log sync complete:',
    `- Run: ${run.id || 'unknown'} (${run.status || 'unknown'})`,
    `- Fetched: ${result.fetched || 0}`,
    `- Imported: ${result.imported || 0}`,
    `- Duplicates: ${result.duplicates || 0}`,
    `- Failed: ${result.failed || 0}`,
    result.dry_run && Array.isArray(result.preview) && result.preview.length
      ? `- Preview: ${result.preview.slice(0, 3).map((item) => item.summary || item.message_id).join(' | ')}`
      : '',
  ].filter(Boolean).join('\n');
}

function parseWhatsappLinkCommand(text = '') {
  const commandText = String(text || '').replace(/^\/(?:link_whatsapp|whatsapp_link|wa_link)\b/i, '').trim();
  const tokens = {};
  const tokenPattern = /\b(comm(?:unication)?|note|message|signup|lead|student|phone|parent|parent_name|student_name|email)\s*[:#]\s*([^|]+)/gi;
  let match;
  while ((match = tokenPattern.exec(commandText))) {
    const key = match[1].toLowerCase();
    tokens[key] = match[2].trim();
  }
  const communicationId = Number(tokens.communication || tokens.comm || tokens.note || tokens.message || 0);
  const payload = {};
  if (tokens.signup) payload.signup_id = Number(tokens.signup);
  if (tokens.lead) payload.lead_id = Number(tokens.lead);
  if (tokens.student) payload.student_id = Number(tokens.student);
  if (tokens.phone) payload.parent_phone = tokens.phone;
  if (tokens.parent || tokens.parent_name) payload.parent_name = tokens.parent || tokens.parent_name;
  if (tokens.student_name) payload.student_name = tokens.student_name;
  if (tokens.email) payload.parent_email = tokens.email;
  if (!payload.signup_id && !payload.lead_id && !payload.student_id) payload.create_lead = true;
  return { communicationId, payload };
}

function formatWapiDiagnosticsReply(data = {}) {
  const recent = Array.isArray(data.recent_whatsapp_communications) ? data.recent_whatsapp_communications : [];
  const lines = [
    'WAPI / WhatsApp status:',
    `- Inbound webhook: ${data.inbound_webhook_configured ? 'configured' : 'not configured'}`,
    `- Outbound sending: ${data.outbound_configured ? 'configured' : 'missing token'}`,
    `- Whapi log sync: ${data.sync_configured ? 'configured' : 'missing token'}`,
    `- Outbound base: ${data.outbound_base_url || 'not set'}`,
    data.latest_sync_run ? `- Latest sync: #${data.latest_sync_run.id} ${data.latest_sync_run.status}, fetched ${data.latest_sync_run.fetched_count || 0}, imported ${data.latest_sync_run.imported_count || 0}` : '',
    data.required_outbound_env?.length ? `- Missing send env: ${data.required_outbound_env.join(', ')}` : '',
    data.required_sync_env?.length ? `- Missing sync env: ${data.required_sync_env.join(', ')}` : '',
  ].filter(Boolean);
  if (recent.length) {
    lines.push('');
    lines.push('Recent WhatsApp logs:');
    for (const item of recent.slice(0, 6)) {
      lines.push(`- ${compactCommunicationForContext(item)}`);
    }
  }
  return lines.join('\n');
}

async function handleWhatsappSendCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const parsed = parseWhatsappSendCommand(getTelegramMessageText(msg));
  if (!parsed.message || (!parsed.target.to && !parsed.target.signup_id && !parsed.target.lead_id && !parsed.target.student_id)) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Use:',
        '/send_whatsapp signup:123 | message text',
        '/send_whatsapp lead:123 | message text',
        '/send_whatsapp student:123 | message text',
        '/send_whatsapp phone:+972501234567 | message text',
      ].join('\n'),
      messageId
    );
    return;
  }
  const result = await appRequest(config, 'POST', '/api/bna/contact-communications/send-whatsapp', {
    ...parsed.target,
    body: parsed.message,
    confirm: 'SEND_WHATSAPP',
    source: 'telegram',
    created_by: config.agentDisplayName || 'Telegram bot',
  });
  await sendReply(
    config.botToken,
    chatId,
    result?.sent
      ? `WhatsApp sent and logged as communication #${result.communication?.id || 'unknown'}.`
      : `WhatsApp did not confirm sent. Status=${result?.delivery_status || result?.communication?.metadata?.delivery_status || 'unknown'}${result?.communication?.id ? `, communication #${result.communication.id}` : ''}.`,
    messageId
  );
}

async function handleWhatsappLinkCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const parsed = parseWhatsappLinkCommand(getTelegramMessageText(msg));
  if (!parsed.communicationId) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Use:',
        '/link_whatsapp communication:12 signup:3',
        '/link_whatsapp communication:12 lead:7',
        '/link_whatsapp communication:12 parent: Shalom Galambo | phone:+972501234567 | student_name:Eitan Chaim',
      ].join('\n'),
      messageId
    );
    return;
  }
  const result = await appRequest(config, 'POST', `/api/bna/contact-communications/${parsed.communicationId}/link`, {
    ...parsed.payload,
    link_note: 'Linked from Telegram command',
  });
  const createdLeadLine = result?.createdLead?.id ? ` Created parent lead #${result.createdLead.id}.` : '';
  await sendReply(
    config.botToken,
    chatId,
    `Communication #${result?.communication?.id || parsed.communicationId} linked as ${result?.communication?.contact_type || 'contact'}.${createdLeadLine}`,
    messageId
  );
}

function formatTelegramNoteToCrmReply(result = {}) {
  if (!result?.success) {
    return `CRM note match failed: ${result?.error || 'unknown error'}`;
  }
  if (!result.matched) {
    const hint = result.reason === 'ambiguous_match'
      ? 'I found more than one plausible WhatsApp row.'
      : 'I could not confidently match a local WhatsApp row.';
    return [
      `${hint} No CRM note was saved and no WhatsApp message was sent.`,
      'Try: /crm_note communication:12 | note: short context',
      'Or: /crm_note contact:Name | note: short context',
    ].join('\n');
  }
  const matchId = result.match?.communication_id || result.source_communication_id || 'unknown';
  if (result.dry_run) {
    return `CRM note preview matched WhatsApp communication #${matchId}. No CRM note was saved and no WhatsApp message was sent.`;
  }
  return [
    `Linked Telegram note to WhatsApp communication #${matchId}.`,
    `Saved CRM note #${result.communication?.id || 'unknown'}.`,
    'No WhatsApp message was sent.',
  ].join('\n');
}

async function handleTelegramNoteToCrmCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const parsed = parseTelegramNoteToCrm(text);
  if (!parsed.matched) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Use:',
        '/crm_note contact:Nati Fries | note: was about carpool, not a school lead',
        '/crm_note communication:12 | note: follow up next week',
        'Or: that WhatsApp with Nati Fries was about carpool, not a school lead',
      ].join('\n'),
      messageId
    );
    return;
  }
  const result = await appRequest(config, 'POST', '/api/bna/contact-communications/match-note', {
    ...parsed,
    created_by: config.agentDisplayName || 'Telegram bot',
    telegram_chat_id: chatId,
    telegram_message_id: messageId,
  });
  await sendReply(config.botToken, chatId, formatTelegramNoteToCrmReply(result), messageId);
}

async function getApprovedOutputExamples(config, outputType, limit = 3) {
  try {
    const data = await appRequest(config, 'GET', '/api/bna/content-jobs');
    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    return jobs
      .flatMap((job) => (Array.isArray(job.outputs) ? job.outputs : [])
        .filter((output) => output.output_type === outputType && ['approved', 'published'].includes(output.status))
        .map((output) => ({
          title: output.title || 'Approved draft',
          body: output.body || '',
          status: output.status,
        })))
      .filter((output) => output.body.trim())
      .slice(0, limit);
  } catch (error) {
    log(`Approved ${outputType} examples unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

function formatApprovedExamples(examples) {
  if (!examples.length) return 'No approved examples captured yet.';
  return examples
    .map((example, index) => [
      `Example ${index + 1}: ${example.title} (${example.status})`,
      example.body.slice(0, 1200),
    ].join('\n'))
    .join('\n\n');
}

function appendApprovedOutputExample(output) {
  const outputType = output?.output_type;
  const body = String(output?.body || '').trim();
  if (!body) return null;

  const relativePath = outputType === 'facebook_post'
    ? 'content-memory/facebook/examples.md'
    : outputType === 'whatsapp_update'
      ? 'content-memory/whatsapp/examples.md'
      : '';
  if (!relativePath) return null;

  const absolutePath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const title = String(output.title || outputType).replace(/\r?\n/g, ' ').trim();
  const entry = [
    '',
    `### ${new Date().toISOString().slice(0, 10)} - ${title}`,
    '',
    body,
    '',
  ].join('\n');
  fs.appendFileSync(absolutePath, entry);
  return relativePath;
}

function splitRambleIntoUnits(text) {
  return String(text || '')
    .replace(/\s+\b(another thing that i need to happen is|task for myself(?:\s+is)?|put something on my list|a decision for myself is|decision for myself is|anytime i tell you to test something|i still need to|i need to figure out|i need to finish|i need to make)\b/gi, '\n$1')
    .split(/\r?\n|[.;]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function detectAccountabilityType(text) {
  return detectTelegramAccountabilityType(text);
  const normalized = String(text || '').toLowerCase();
  if (/\b(question|asked|asks|שאלה|\?)\b/.test(normalized)) return 'question';
  if (/\b(goal|goals|work on|practice|commit|kabbalah|accountability)\b/.test(normalized)) return 'student_goal';
  if (/\b(private|meeting|met with|1:1|one on one|check in)\b/.test(normalized)) return 'private_meeting';
  if (/\b(decided|decision|we agreed|agreed to|next time)\b/.test(normalized)) return 'decision';
  if (/\b(class|shiur|lesson|learned|taught|topic|recording)\b/.test(normalized)) return 'learning_note';
  return null;
}

function detectPaymentIntake(text) {
  const normalized = String(text || '').toLowerCase();
  if (!/\b(paid|paid me|payment received|cash|credit|green invoice|invoice|tuition|registration|deposit|שילם|שילמה|שילמו)\b/.test(normalized)) {
    return null;
  }

  const amountMatch = String(text).match(/(?:₪|ils|nis)?\s*(\d{2,6}(?:[.,]\d{1,2})?)/i);
  const method = /\bcash\b/i.test(text)
    ? 'cash'
    : /\bgreen invoice|invoice|credit|card\b/i.test(text)
      ? 'green_invoice'
      : 'unknown';
  const parentMatch = String(text).match(/\b(?:parent|mom|mother|father|dad|from|paid by)\s+([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){0,3})/);
  const studentMatch = String(text).match(/\b(?:student|kid|son|daughter|boy|child)\s+([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){0,2})/);

  if (!amountMatch && !parentMatch && !studentMatch && method === 'unknown') {
    return null;
  }

  return {
    amount: amountMatch ? Number(amountMatch[1].replace(',', '.')) : null,
    method,
    parent_name: parentMatch?.[1] || null,
    student_name: studentMatch?.[1] || null,
  };
}

function findMentionedStudent(text, students) {
  const normalized = normalizeStudentLookupText(text);
  return students.find((student) => {
    const name = normalizeStudentLookupText(student.name);
    if (!name) return false;
    const aliases = studentAliases(student);
    return aliases.some((alias) => alias && normalized.includes(alias));
  }) || null;
}

function candidateStudentsForDecision(students, limit = 8) {
  return [...students]
    .filter((student) => student?.id && student?.name)
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    .slice(0, limit);
}

function eventNeedsStudentDecision(eventType, student) {
  if (student) return false;
  return ['question', 'student_goal', 'private_meeting', 'decision'].includes(eventType);
}

function normalizeStudentLookupText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function studentAliases(student) {
  const rawName = String(student?.name || '');
  const normalizedName = normalizeStudentLookupText(rawName);
  const parts = normalizedName.split(/\s+/).filter((part) => part.length >= 3);
  const aliases = new Set([normalizedName, ...parts]);

  if (/אמיתי|קוסובסקי/.test(rawName)) {
    [
      'amitay',
      'amitai',
      'amiti',
      'amity',
      'amitize',
      'amitai kosovsky',
      'amitay kosovsky',
      'kosovsky',
      'amiti kosovsky',
    ].forEach((alias) => aliases.add(normalizeStudentLookupText(alias)));
  }

  return [...aliases].filter((alias) => alias.length >= 3);
}

function isLikelyStudentAccountabilityUnit(text, eventType, student) {
  return isLikelyTelegramStudentAccountabilityUnit(text, eventType, student);
  if (student) return true;

  const normalized = String(text || '').toLowerCase();
  const systemRamble = /\b(api|app|dashboard|telegram|bot|bridge|drive|folder|whisper|openai|kimi|kimmy|codex|video|facebook|whatsapp|youtube|blog|newsletter|pipeline|repo|database|railway|legacy crm)\b/.test(normalized);
  if (systemRamble) return false;

  if (eventType === 'learning_note' || eventType === 'question') {
    return /\b(class question|student asked|boy asked|asked by|question from)\b/.test(normalized);
  }

  return /\b(private meeting|met with|one on one|1:1|check in|check-in|student goal|goal for|attendance|next meeting|next check)\b/.test(normalized);
}

function extractAccountabilityDetails(text) {
  return extractTelegramAccountabilityDetails(text, { eventType: detectAccountabilityType(text) });
  const normalized = String(text || '').toLowerCase();
  const details = {
    metadata: {
      parser: 'telegram-accountability-v1',
    },
  };

  const ratioMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of|of|instead of)\s*(\d+(?:\.\d+)?)/);
  if (ratioMatch) {
    const actual = Number(ratioMatch[1]);
    const target = Number(ratioMatch[2]);
    if (target > 0) {
      details.goal_actual_value = actual;
      details.goal_target_value = target;
      details.progress_percent = Math.max(0, Math.min(100, Math.round((actual / target) * 100)));
    }
  }

  const percentMatch = normalized.match(/(\d{1,3})\s*%/);
  if (percentMatch) {
    details.progress_percent = Math.max(0, Math.min(100, Number(percentMatch[1])));
  }

  const unitMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|pages?|daf|blatt|mishnayos?|questions?|times?)\b/);
  if (unitMatch && details.goal_actual_value === undefined) {
    details.goal_actual_value = Number(unitMatch[1]);
    details.goal_unit = unitMatch[2];
  } else if (unitMatch) {
    details.goal_unit = unitMatch[2];
  }

  if (/\b(missed|absent|did not show|no show)\b/.test(normalized)) details.attendance_status = 'missed';
  else if (/\b(late|came late)\b/.test(normalized)) details.attendance_status = 'late';
  else if (/\b(showed up|attended|came|was there|present)\b/.test(normalized)) details.attendance_status = 'attended';

  if (/\b(very focused|focused|engaged|talkative|opened up|participated)\b/.test(normalized)) details.engagement_level = 'high';
  else if (/\b(quiet|hard for him|struggled|distracted|not focused|shut down)\b/.test(normalized)) details.engagement_level = 'low';
  else if (/\b(okay|fine|somewhat|medium)\b/.test(normalized)) details.engagement_level = 'medium';

  if (/\b(follow up|check next|next week|next meeting|remind me|needs reminder|ask him)\b/.test(normalized)) {
    details.follow_up_required = true;
  }

  const topicMatch = String(text).match(/\b(?:topic|about|regarding)\s+([^.;,\n]{4,60})/i);
  if (topicMatch) details.topic = topicMatch[1].trim();

  return details;
}

function isExploratoryQuestionWithoutTaskIntent(text) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return false;

  const questionShape =
    /[?]/.test(normalized) ||
    /^(so |okay |ok |yeah |but |also )*(are|is|do|does|can|could|would|will|why|how|what|where|when)\b/.test(normalized) ||
    /\b(are there ways|is there a way|will i be able|would i be able|how are we able|what do we need|why aren't you able|why are you not able)\b/.test(normalized);
  if (!questionShape) return false;

  const explicitCommand =
    /^(please\s+)?(check|fix|build|wire|deploy|test|verify|run|start|restart|implement|add|remove|change|update|create|make|generate|send|publish|queue|mark|assign|transcribe|process|ingest)\b/.test(normalized) ||
    /\b(i need you to|i want you to|you need to|please|fix that|fix this|do this|make this|build this|check what happened|create a task|queue codex|assign .*codex)\b/.test(normalized);
  if (explicitCommand) return false;

  const requestToAct =
    /\b(can you|could you|would you)\b.{0,80}\b(check|fix|build|wire|deploy|test|verify|run|start|restart|implement|add|remove|change|update|create|make|generate|send|publish|queue|mark|assign|transcribe|process|ingest|investigate)\b/.test(normalized);
  if (requestToAct) return false;

  return true;
}

function inferScopedOneTimeCategory(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(marketing|ad|ads|outreach|flyer|campaign|copy)\b/.test(normalized)) return 'marketing';
  if (/\b(content|post|blog|video|recording|caption|whatsapp|facebook)\b/.test(normalized)) return 'content';
  if (/\b(bot|login|access|api|website|dashboard|technology|tech|software|tooling)\b/.test(normalized)) return 'technology';
  if (/\b(accounting|payment|invoice|money|budget|tuition)\b/.test(normalized)) return 'accounting';
  if (/\b(legacy crm|crm|pipeline)\b/.test(normalized)) return 'community_setup';
  if (/\b(community|participant|attendee|parent|family|group)\b/.test(normalized)) return 'community';
  if (/\b(torah research|halacha|halachic|halakhic|psak|sheilah|shaila|shailah|sefaria|source lookup|look up|research)\b/.test(normalized)
    && /\b(question|source|sources|sefaria|halacha|halachic|halakhic|psak|fast|fasting|shabbos|shabbat)\b/.test(normalized)) return 'torah_research';
  if (/\b(source sheet|sources?|mareh|makom|sefaria)\b/.test(normalized)) return 'source_sheets';
  if (/\b(shiur idea|ideas?|topic|topics?|sugya)\b/.test(normalized)) return 'shiur_ideas';
  if (/\b(class prep|prepare class|prep|mishnah|mishna|torah class|lesson)\b/.test(normalized)) return 'torah_class_prep';
  if (/\b(admin|schedule|logistics|registration)\b/.test(normalized)) return 'admin';
  return 'general';
}

function inferScopedOneTimeAssignee(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(shloimie|shlomo|dratler)\b/.test(normalized)) return 'Shloimie';
  if (/\b(rabbi elie|elie scheller|rabbi|me|mine|my task)\b/.test(normalized)) return 'Rabbi Elie Scheller';
  return null;
}

function hasConcreteScopedTaskAction(text) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  return /\b(start|build|fix|wire|set up|setup|configure|connect|hook up|implement|add|remove|delete|archive|merge|reconcile|clean|clean up|update|change|replace|upload|parse|process|transcribe|source|link|attach|create|make|run|deploy|smoke test|audit|check|verify|finish)\b/.test(normalized);
}

function hasExplicitScopedDecisionChoice(text) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  if (/\boption\s+[a-c]\s*[:.-]/i.test(text)) return true;
  if (hasConcreteScopedTaskAction(normalized)) return false;
  if (/\b(choose|which one|which option|a\/b|a b or c|option a|option b|option c|what do you recommend|should we)\b/.test(normalized)) return true;
  return /\b(decide|decision|figure out|not sure)\b/.test(normalized)
    && /\b(whether|between|which|option|approach|path|keep|drop)\b/.test(normalized);
}

function hasExplicitScopedTaskIntent(text) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  return (
    /^\/(?:task|todo|decision)\b/.test(normalized) ||
    /^(?:task|todo|decision)\s*[:.-]/.test(normalized) ||
    /\b(create|add|file|make|put|open|assign)\b.{0,80}\b(task|todo|decision)\b/.test(normalized) ||
    /\b(make this|add this|file this|turn this)\b.{0,60}\b(task|todo|decision)\b/.test(normalized) ||
    /\b(decision required|needs decision|mark .*decision)\b/.test(normalized)
  );
}

function hasExplicitScopedSupportTicketIntent(text) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return false;
  if (/^\/(?:ticket|support)\b/.test(normalized)) return true;
  if (/^(?:ticket|support)\s*[:.-]/.test(normalized)) return true;
  if (/\b(open|create|file|make|put)\b.{0,80}\b(?:a\s+)?(?:support\s+)?ticket\b/.test(normalized)) return true;
  const systemArea = /\b(bot|telegram|login|password|access|dashboard|website|app|api|task manager|tasks?|comments?|parser|watchdog|automation|workflow|drive|payment|checkout|recording|worksheet|link)\b/.test(normalized);
  const brokenSignal = /\b(broken|not working|doesn'?t work|isn'?t working|bug|error|failed|failing|stuck|crash|crashed|blocked|can'?t|cannot|unable|locked out|down|missing)\b/.test(normalized);
  return systemArea && brokenSignal;
}

function scopedSupportTicketTitleFromText(text) {
  let title = String(text || '').trim()
    .replace(/^\/(?:ticket|support)\b[:\s-]*/i, '')
    .replace(/^(?:ticket|support)\s*[:.-]\s*/i, '')
    .replace(/^(?:please\s+)?(?:open|create|file|make|put)\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:support\s+)?ticket\s*(?:for\s+)?[:\s-]*/i, '')
    .trim();
  if (!title) title = String(text || '').trim();
  title = title.split(/\n|(?<=[.!?])\s+/)[0] || title;
  title = title.replace(/\s+/g, ' ').slice(0, 160).trim();
  return title || 'One Time support ticket';
}

function inferScopedSupportTicketSeverity(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(blocking|blocked|production down|down|locked out|cannot log in|can'?t log in|no access|nothing works)\b/.test(normalized)) return 'blocking';
  if (/\b(urgent|high|broken|not working|doesn'?t work|isn'?t working|failed|failing|error|can'?t|cannot|unable)\b/.test(normalized)) return 'high';
  if (/\b(low|minor|small|cosmetic|not urgent)\b/.test(normalized)) return 'low';
  return 'normal';
}

function inferScopedSupportTicketCategory(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(login|password|log in|signin|sign in)\b/.test(normalized)) return 'login';
  if (/\b(bot|telegram|api)\b/.test(normalized)) return 'bot_api';
  if (/\b(task manager|tasks?|comments?|parser|watchdog)\b/.test(normalized)) return 'task_manager';
  if (/\b(automation|workflow|trigger)\b/.test(normalized)) return 'automation';
  if (/\b(payment|checkout|invoice|billing)\b/.test(normalized)) return 'payment';
  if (/\b(drive|google doc|folder)\b/.test(normalized)) return 'drive';
  if (/\b(recording|video|audio)\b/.test(normalized)) return 'recording';
  if (/\b(worksheet|source sheet|source-sheet)\b/.test(normalized)) return 'worksheet';
  if (/\b(access|permission|link|portal)\b/.test(normalized)) return 'access';
  if (/\b(parent|student|member|customer|data)\b/.test(normalized)) return 'student_parent_data';
  return 'other';
}

function scopedTaskTitleFromText(text) {
  let title = String(text || '').trim()
    .replace(/^\/(?:task|todo|decision)\b[:\s-]*/i, '')
    .replace(/^(?:task|todo|decision)\s*[:.-]\s*/i, '')
    .replace(/^(?:please\s+)?(?:create|add|file|make|put|open)\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:task|todo|decision)\s*(?:for\s+)?[:\s-]*/i, '')
    .replace(/^(?:assign)\s+(?:this\s+)?(?:task\s+)?(?:to\s+)?/i, '')
    .trim();
  if (!title) title = String(text || '').trim();
  title = title.replace(/\s+/g, ' ').slice(0, 180).trim();
  return title || 'One Time task';
}

function parseScopedCommentCommand(text) {
  const raw = String(text || '').trim();
  const match =
    raw.match(/^\/(?:comment|note)\s+(?:on|for)?\s*(?:task\s*)?#?(\d+)\s*[:.-]\s*([\s\S]+)$/i) ||
    raw.match(/^(?:comment|note)\s+(?:on|for)?\s*(?:task\s*)?#?(\d+)\s*[:.-]\s*([\s\S]+)$/i) ||
    raw.match(/^(?:task\s*)?#?(\d+)\s+(?:comment|note)\s*[:.-]\s*([\s\S]+)$/i);
  if (!match) return null;
  const taskId = Number(match[1]);
  const body = String(match[2] || '').trim();
  if (!Number.isFinite(taskId) || taskId <= 0 || !body) return null;
  return { taskId, body };
}

async function captureScopedProjectToApp(config, text, chatId, messageId) {
  if (!config.opsUsername || !config.opsPassword) {
    return { enabled: false, tasksCreated: 0, eventsCreated: 0, commentsCreated: 0, supportTicketsCreated: 0 };
  }

  const commentCommand = parseScopedCommentCommand(text);
  if (commentCommand) {
    const result = await appRequest(config, 'POST', `/api/bna/tasks/${commentCommand.taskId}/comments`, {
      body: commentCommand.body,
      author: config.agentDisplayName || 'Rabbi Elie Scheller',
      visibility: 'project',
      source: 'telegram',
      source_context: { chat_id: chatId, message_id: messageId, bridge_profile: config.bridgeProfile },
    });
    return {
      enabled: true,
      tasksCreated: 0,
      eventsCreated: 0,
      commentsCreated: 1,
      supportTicketsCreated: 0,
      comments: [result?.comment].filter(Boolean),
    };
  }

  if (hasExplicitScopedSupportTicketIntent(text)) {
    const result = await appRequest(config, 'POST', '/api/bna/support-tickets', {
      title: scopedSupportTicketTitleFromText(text),
      description: text,
      severity: inferScopedSupportTicketSeverity(text),
      category: inferScopedSupportTicketCategory(text),
      source: 'telegram',
      reporter_name: config.agentDisplayName || 'Rabbi Elie Scheller',
      reporter_role: 'external_user',
      project_key: config.scopedProjectKey || ONE_TIME_PROJECT_KEY,
      source_context: { chat_id: chatId, message_id: messageId, bridge_profile: config.bridgeProfile },
    });
    const ticket = result?.ticket || result;
    if (ticket?.id) {
      appendAgentTaskLedger({
        event: 'support_ticket_created',
        source: 'telegram_scoped',
        bridge_profile: config.bridgeProfile,
        chat_id: chatId,
        message_id: messageId,
        support_ticket_id: ticket.id,
        related_task_id: ticket.related_task_id || result?.task?.id || null,
        title: ticket.title,
        severity: ticket.severity,
        category: ticket.category,
        project_key: ticket.project_key || config.scopedProjectKey || ONE_TIME_PROJECT_KEY,
      });
    }
    return {
      enabled: true,
      tasksCreated: result?.task?.id ? 1 : 0,
      tasks: result?.task?.id ? [result.task] : [],
      eventsCreated: 0,
      commentsCreated: 0,
      supportTicketsCreated: ticket?.id ? 1 : 0,
      supportTickets: ticket?.id ? [ticket] : [],
    };
  }

  if (!hasExplicitScopedTaskIntent(text)) {
    return { enabled: true, tasksCreated: 0, eventsCreated: 0, commentsCreated: 0, supportTicketsCreated: 0 };
  }

  const decisionRequired = hasExplicitScopedDecisionChoice(text);
  const assignee = inferScopedOneTimeAssignee(text) || (decisionRequired ? null : 'Codex');
  let intakeResult = null;
  let task = null;
  try {
    intakeResult = await parseCanonicalIntakeToApp(config, text, {
      source_type: 'telegram_scoped_task',
      source_id: messageId,
      chat_id: chatId,
      message_id: messageId,
      project_key: config.scopedProjectKey || ONE_TIME_PROJECT_KEY,
      dry_run: false,
    });
    const canonicalTask = intakeResult?.apply?.created?.tasks?.[0] || intakeResult?.tasks?.[0] || null;
    if (canonicalTask?.id) task = { task: canonicalTask };
  } catch (error) {
    log(`Canonical intake capture fell back to direct scoped task create: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!task) {
    task = await appRequest(config, 'POST', '/api/bna/tasks', {
      title: scopedTaskTitleFromText(text),
      raw_text: text,
      notes: text,
      source: 'telegram',
      created_by: config.bridgeProfile || 'rabbi-elie-scheller',
      author: config.agentDisplayName || 'Rabbi Elie Scheller',
      project_key: config.scopedProjectKey || ONE_TIME_PROJECT_KEY,
      category: inferScopedOneTimeCategory(text),
      assigned_to: assignee,
      stage: decisionRequired ? 'needs_decision' : 'assigned',
      decision_required: decisionRequired,
      ai_parsed: {
        parser: 'telegram-scoped-one-time-v1',
        kind: decisionRequired ? 'decision' : 'task',
        original_text: text,
        project: config.scopedProjectKey || ONE_TIME_PROJECT_KEY,
      },
    });
  }
  const createdTask = task?.task || task;
  if (createdTask?.id) {
    appendAgentTaskLedger({
      event: 'task_created',
      source: 'telegram_scoped',
      bridge_profile: config.bridgeProfile,
      chat_id: chatId,
      message_id: messageId,
      task_id: createdTask.id,
      title: createdTask.title,
      stage: createdTask.stage,
      category: createdTask.category,
      assigned_to: createdTask.assigned_to || null,
      intake_parse_run_id: intakeResult?.parse_run?.id || intakeResult?.apply?.parse_run?.id || null,
      project_key: createdTask.project_key || config.scopedProjectKey || ONE_TIME_PROJECT_KEY,
    });
  }

  return {
    enabled: true,
    tasksCreated: createdTask?.id ? 1 : 0,
    tasks: createdTask?.id ? [createdTask] : [],
    rawIntake: intakeResult?.raw_intake || null,
    rawIntakeId: intakeResult?.raw_intake?.stable_id || null,
    rambleProtocol: intakeResult?.parsed?.ramble_protocol || null,
    parsedItemCounts: intakeResult?.parsed?.ramble_protocol?.item_counts || null,
    eventsCreated: 0,
    commentsCreated: 0,
    supportTicketsCreated: 0,
  };
}

async function captureContactLeadsToApp(config, text, chatId, messageId) {
  const extractedLeads = extractInterestedParentLeads(text, { chatId, messageId });
  if (!extractedLeads.length) {
    return {
      leadsDetected: hasInterestedParentLeadCaptureIntent(text),
      contactLeadsCreated: 0,
      contactLeadsUpdated: 0,
      contactLeadsMatched: 0,
      contactNotesCreated: 0,
      contacts: [],
    };
  }

  const contacts = [];
  let contactLeadsCreated = 0;
  let contactLeadsUpdated = 0;
  let contactLeadsMatched = 0;
  let contactNotesCreated = 0;

  for (const extracted of extractedLeads) {
    const { communication, ...leadPayload } = extracted;
    const result = await appRequest(config, 'POST', '/api/bna/parent-leads', {
      ...leadPayload,
      source: 'telegram',
      metadata: {
        ...(leadPayload.metadata || {}),
        source_context: { chat_id: chatId, message_id: messageId },
      },
    });

    const savedLead = result?.lead || null;
    const matchedExisting = result?.matched_existing || null;
    if (savedLead?.id) {
      if (result?.merged_existing) contactLeadsUpdated += 1;
      else contactLeadsCreated += 1;

      const note = await appRequest(config, 'POST', '/api/bna/contact-communications', {
        contact_type: 'lead',
        lead_id: savedLead.id,
        channel: 'phone',
        direction: 'call',
        summary: communication?.summary || `${savedLead.parent_name || extracted.parent_name}: lead update`,
        body: communication?.body || extracted.notes || text,
        follow_up_required: Boolean(communication?.follow_up_required),
        source: 'telegram',
        created_by: config.agentDisplayName || 'Telegram bot',
        source_context: { chat_id: chatId, message_id: messageId },
        metadata: {
          parser: 'telegram-contact-lead-capture-v1',
          lead_source: 'operator_ramble',
        },
      });
      if (note?.communication?.id) contactNotesCreated += 1;
      contacts.push({
        id: savedLead.id,
        parent_name: savedLead.parent_name || extracted.parent_name,
        status: savedLead.status || extracted.status,
        interest_level: savedLead.interest_level || extracted.interest_level,
        action: result?.merged_existing ? 'updated' : 'created',
      });
      continue;
    }

    if (matchedExisting?.id) {
      const contactType = matchedExisting.kind === 'student' ? 'student' : 'signup';
      const notePayload = {
        contact_type: contactType,
        channel: 'phone',
        direction: 'call',
        summary: communication?.summary || `${matchedExisting.display_name || extracted.parent_name}: lead update matched existing record`,
        body: communication?.body || extracted.notes || text,
        follow_up_required: Boolean(communication?.follow_up_required),
        source: 'telegram',
        created_by: config.agentDisplayName || 'Telegram bot',
        source_context: { chat_id: chatId, message_id: messageId },
        metadata: {
          parser: 'telegram-contact-lead-capture-v1',
          matched_existing_kind: matchedExisting.kind,
        },
      };
      if (contactType === 'student') notePayload.student_id = matchedExisting.id;
      else notePayload.signup_id = matchedExisting.id;
      const note = await appRequest(config, 'POST', '/api/bna/contact-communications', notePayload);
      if (note?.communication?.id) contactNotesCreated += 1;
      contactLeadsMatched += 1;
      contacts.push({
        id: matchedExisting.id,
        parent_name: matchedExisting.display_name || extracted.parent_name,
        status: matchedExisting.status || '',
        interest_level: '',
        action: `matched_${matchedExisting.kind || 'existing'}`,
      });
    }
  }

  if (contacts.length) {
    appendAgentTaskLedger({
      event: 'contact_leads_captured',
      source: 'telegram',
      chat_id: chatId,
      message_id: messageId,
      title: 'Captured interested-parent lead update',
      stage: 'done',
      category: 'communications',
      assigned_to: 'Codex',
      notes: `Captured ${contactLeadsCreated} new lead(s), updated ${contactLeadsUpdated}, matched ${contactLeadsMatched}, and added ${contactNotesCreated} contact note(s).`,
      contact_names: contacts.slice(0, 12).map((contact) => contact.parent_name).filter(Boolean),
    });
  }

  return {
    leadsDetected: true,
    contactLeadsCreated,
    contactLeadsUpdated,
    contactLeadsMatched,
    contactNotesCreated,
    contacts,
  };
}

async function captureTelegramNoteToCrm(config, text, chatId, messageId) {
  const empty = {
    telegramCrmNoteIntent: false,
    telegramCrmNoteMatched: false,
    telegramCrmNotesCreated: 0,
    telegramCrmNoteReason: '',
    telegramCrmNoteCommunicationId: null,
    telegramCrmNoteMatchedCommunicationId: null,
  };

  if (!hasTelegramNoteToCrmIntent(text)) return empty;

  const parsed = parseTelegramNoteToCrm(text);
  if (!parsed.matched) {
    return {
      ...empty,
      telegramCrmNoteIntent: true,
      telegramCrmNoteReason: parsed.reason || 'missing_match_fields',
    };
  }

  try {
    const result = await appRequest(config, 'POST', '/api/bna/contact-communications/match-note', {
      raw_text: text,
      contact_clue: parsed.contact_clue,
      note_text: parsed.note_text,
      communication_id: parsed.communication_id || undefined,
      telegram_chat_id: chatId,
      telegram_message_id: messageId,
      created_by: config.agentDisplayName || 'Telegram bot',
    });

    const created = Boolean(result?.created && result?.communication?.id);
    if (created) {
      appendAgentTaskLedger({
        event: 'telegram_note_to_crm_captured',
        source: 'telegram',
        chat_id: chatId,
        message_id: messageId,
        title: 'Captured Telegram note into CRM contact communications',
        stage: 'done',
        category: 'communications',
        assigned_to: 'Codex',
        notes: `Linked Telegram note to contact communication #${result.match?.communication_id || result.match?.matched_communication_id || 'unknown'} with no external send.`,
        communication_id: result.communication.id,
        matched_communication_id: result.match?.communication_id || null,
      });
    }

    return {
      ...empty,
      telegramCrmNoteIntent: true,
      telegramCrmNoteMatched: Boolean(result?.matched),
      telegramCrmNotesCreated: created ? 1 : 0,
      telegramCrmNoteReason: result?.reason || (result?.matched ? 'matched' : 'not_matched'),
      telegramCrmNoteCommunicationId: result?.communication?.id || null,
      telegramCrmNoteMatchedCommunicationId: result?.match?.communication_id || null,
    };
  } catch (error) {
    log(`Telegram note-to-CRM capture skipped: ${error instanceof Error ? error.message : String(error)}`);
    return {
      ...empty,
      telegramCrmNoteIntent: true,
      telegramCrmNoteReason: 'match_note_endpoint_error',
    };
  }
}

async function captureRambleToApp(config, text, chatId, messageId) {
  if (isScopedProjectBot(config)) {
    return captureScopedProjectToApp(config, text, chatId, messageId);
  }

  if (hasDirectReplyInsteadOfCodexIntent(text)) {
    return { enabled: true, tasksCreated: 0, eventsCreated: 0, paymentIntakeCreated: 0 };
  }

  if (!config.opsUsername || !config.opsPassword) {
    return { enabled: false, tasksCreated: 0, eventsCreated: 0 };
  }

  const telegramNoteCapture = await captureTelegramNoteToCrm(config, text, chatId, messageId);
  if (telegramNoteCapture.telegramCrmNoteIntent) {
    return {
      enabled: true,
      tasksCreated: 0,
      eventsCreated: 0,
      studentMatchDecisions: [],
      paymentIntakeCreated: 0,
      contactLeadsCreated: 0,
      contactLeadsUpdated: 0,
      contactLeadsMatched: 0,
      contactNotesCreated: 0,
      contacts: [],
      ...telegramNoteCapture,
    };
  }

  let paymentIntakeCreated = 0;
  const payment = detectPaymentIntake(text);
  if (payment) {
    await appRequest(config, 'POST', '/api/bna/payment-intake', {
      ...payment,
      status: 'needs_signup',
      source: 'telegram',
      source_context: { chat_id: chatId, message_id: messageId },
      notes: text,
    });
    paymentIntakeCreated = 1;
  }

  let contactCapture = {
    leadsDetected: false,
    contactLeadsCreated: 0,
    contactLeadsUpdated: 0,
    contactLeadsMatched: 0,
    contactNotesCreated: 0,
    contacts: [],
  };
  if (hasInterestedParentLeadCaptureIntent(text)) {
    contactCapture = await captureContactLeadsToApp(config, text, chatId, messageId);
  }

  let students = [];
  try {
    const studentsResult = await appRequest(config, 'GET', '/api/bna/students');
    students = studentsResult?.students || [];
  } catch (error) {
    log(`Student lookup skipped: ${error instanceof Error ? error.message : String(error)}`);
  }

  let eventsCreated = 0;
  const studentMatchDecisions = [];
  const rambleUnits = splitRambleIntoUnits(text);
  const accountabilityUnits = new Set();
  for (const unit of rambleUnits) {
    const eventType = detectAccountabilityType(unit);
    if (!eventType) continue;

    const student = findMentionedStudent(unit, students);
    if (!isLikelyStudentAccountabilityUnit(unit, eventType, student)) {
      continue;
    }

    const structuredDetails = extractAccountabilityDetails(unit);
    const created = await appRequest(config, 'POST', '/api/bna/accountability', {
      event_type: eventType,
      student_id: student?.id || null,
      student_name: student?.name || null,
      title: unit.slice(0, 180),
      notes: text,
      topic: structuredDetails.topic || null,
      question_text: eventType === 'question' ? unit : null,
      goal_target_value: structuredDetails.goal_target_value ?? null,
      goal_actual_value: structuredDetails.goal_actual_value ?? null,
      goal_unit: structuredDetails.goal_unit || null,
      progress_percent: structuredDetails.progress_percent ?? null,
      attendance_status: structuredDetails.attendance_status || null,
      engagement_level: structuredDetails.engagement_level || null,
      follow_up_required: Boolean(structuredDetails.follow_up_required),
      metadata: structuredDetails.metadata,
      source: 'telegram',
      source_message_id: String(messageId),
    });
    eventsCreated += 1;
    accountabilityUnits.add(unit);

    if (eventNeedsStudentDecision(eventType, student)) {
      studentMatchDecisions.push({
        event: created?.event,
        candidates: candidateStudentsForDecision(students),
      });
    }
  }

  let taskResult = null;
  const taskRamble = rambleUnits
    .filter((unit) => !accountabilityUnits.has(unit))
    .filter((unit) => !detectPaymentIntake(unit))
    .filter((unit) => !hasPromptPlanningIntent(unit))
    .join('\n')
    .trim();
  const singleSentenceSystemTask = eventsCreated
    && /\b(i need you|can you|fix|build|wire|deploy|codex|bot|dashboard|parser|parse|routing|app|system|website|drive)\b/i.test(text);
  const suppressGenericTaskCapture = Boolean(contactCapture.leadsDetected);
  const taskRambleInput = suppressGenericTaskCapture
    ? ''
    : taskRamble || (singleSentenceSystemTask && !hasPromptPlanningIntent(text) ? text : '');
  if (taskRambleInput && !isExploratoryQuestionWithoutTaskIntent(text)) {
    taskResult = await appRequest(config, 'POST', '/api/bna/bot/capture', {
      text: taskRambleInput,
      source: 'telegram',
      source_channel: 'telegram',
      source_chat_id: chatId,
      source_message_id: messageId,
      message_type: 'text',
      created_by: 'telegram',
    });
    for (const task of taskResult?.tasks || []) {
      appendAgentTaskLedger({
        event: 'task_created',
        source: 'telegram',
        chat_id: chatId,
        message_id: messageId,
        task_id: task.id,
        title: task.title,
        notes: task.notes,
        stage: task.stage,
        category: task.category,
        urgency: task.urgency,
        assigned_to: task.assigned_to || null,
      });
    }
  }

  return {
    enabled: true,
    tasksCreated: Number(taskResult?.tasks_created || taskResult?.tasks?.length || (taskResult?.task ? 1 : 0)),
    tasks: taskResult?.tasks || (taskResult?.task ? [taskResult.task] : []),
    observableTicket: taskResult?.ticket || null,
    observableTicketsCreated: taskResult?.ticket?.id ? 1 : 0,
    rawIntake: taskResult?.raw_intake || null,
    rawIntakeId: taskResult?.raw_intake?.stable_id || null,
    rambleProtocol: taskResult?.parsed?.ramble_protocol || null,
    parsedItemCounts: taskResult?.parsed?.ramble_protocol?.item_counts || null,
    agentJobs: taskResult?.agent_jobs || (taskResult?.agent_job ? [taskResult.agent_job] : []),
    agentJobsCreated: Number(taskResult?.agent_jobs?.length || (taskResult?.agent_job ? 1 : 0)),
    eventsCreated,
    studentMatchDecisions,
    paymentIntakeCreated,
    contactLeadsCreated: contactCapture.contactLeadsCreated,
    contactLeadsUpdated: contactCapture.contactLeadsUpdated,
    contactLeadsMatched: contactCapture.contactLeadsMatched,
    contactNotesCreated: contactCapture.contactNotesCreated,
    contacts: contactCapture.contacts,
    telegramCrmNoteIntent: telegramNoteCapture.telegramCrmNoteIntent,
    telegramCrmNoteMatched: telegramNoteCapture.telegramCrmNoteMatched,
    telegramCrmNotesCreated: telegramNoteCapture.telegramCrmNotesCreated,
    telegramCrmNoteReason: telegramNoteCapture.telegramCrmNoteReason,
    telegramCrmNoteCommunicationId: telegramNoteCapture.telegramCrmNoteCommunicationId,
    telegramCrmNoteMatchedCommunicationId: telegramNoteCapture.telegramCrmNoteMatchedCommunicationId,
  };
}

const TELEGRAM_SAFE_TEXT_LIMIT = 3900;
const TELEGRAM_FALLBACK_TEXT_LIMIT = 1800;

function splitTelegramText(text, maxLength = TELEGRAM_SAFE_TEXT_LIMIT) {
  const normalized = String(text ?? '').replace(/\r/g, '').trim();
  if (!normalized) return ['[empty reply]'];
  if (normalized.length <= maxLength) return [normalized];
  const chunks = [];
  let remaining = normalized;
  while (remaining.length > maxLength) {
    let sliceAt = remaining.lastIndexOf('\n', maxLength);
    if (sliceAt < Math.floor(maxLength * 0.6)) {
      sliceAt = remaining.lastIndexOf(' ', maxLength);
    }
    if (sliceAt < 1) sliceAt = maxLength;
    chunks.push(remaining.slice(0, sliceAt).trim());
    remaining = remaining.slice(sliceAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function isTelegramMessageTooLongError(error) {
  return /message is too long|message text is too long|message_too_long/i.test(String(error?.message || error || ''));
}

async function sendTelegramMessageWithReplyFallback(botToken, params) {
  try {
    return await telegramRequest(botToken, 'sendMessage', params);
  } catch (err) {
    if (params.reply_to_message_id) {
      const withoutReply = { ...params };
      delete withoutReply.reply_to_message_id;
      try {
        const result = await telegramRequest(botToken, 'sendMessage', withoutReply);
        log(`Telegram sendMessage reply fallback used for chat ${params.chat_id}; original reply_to_message_id=${params.reply_to_message_id}`);
        return result;
      } catch (fallbackError) {
        if (isTelegramMessageTooLongError(fallbackError) || !isTelegramMessageTooLongError(err)) {
          throw fallbackError;
        }
      }
    }
    throw err;
  }
}

async function sendReply(botToken, chatId, text, replyToMessageId, options = {}) {
  const chunks = splitTelegramText(text, options.maxLength || TELEGRAM_SAFE_TEXT_LIMIT);
  const sent = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunkText = chunks.length > 1 ? `Part ${i + 1}/${chunks.length}\n${chunks[i]}` : chunks[i];
    const params = {
      chat_id: chatId,
      text: chunkText,
    };
    if (i === 0 && options.includeModeKeyboard !== false) {
      params.reply_markup = telegramModeKeyboard();
    }
    // Only reply to message if it's recent (within last hour) to avoid errors
    if (i === 0 && replyToMessageId) {
      params.reply_to_message_id = replyToMessageId;
    }
    try {
      const result = await sendTelegramMessageWithReplyFallback(botToken, params);
      sent.push({
        message_id: result?.message_id || null,
        part: i + 1,
        parts: chunks.length,
        chars: chunkText.length,
      });
      log(`Telegram sendMessage delivered chat ${chatId} part ${i + 1}/${chunks.length} chars=${chunkText.length} message_id=${result?.message_id || 'unknown'}`);
    } catch (err) {
      if (!isTelegramMessageTooLongError(err)) {
        throw err;
      }
      const smallerChunks = splitTelegramText(chunks[i], TELEGRAM_FALLBACK_TEXT_LIMIT);
      log(`Telegram sendMessage reported a too-long chunk for chat ${chatId}; retrying part ${i + 1}/${chunks.length} as ${smallerChunks.length} smaller part(s).`);
      for (let j = 0; j < smallerChunks.length; j += 1) {
        const smallerText = `Part ${i + 1}.${j + 1}/${chunks.length}\n${smallerChunks[j]}`;
        const smallerParams = {
          chat_id: chatId,
          text: smallerText,
        };
        if (i === 0 && j === 0 && options.includeModeKeyboard !== false) {
          smallerParams.reply_markup = telegramModeKeyboard();
        }
        if (i === 0 && j === 0 && replyToMessageId) {
          smallerParams.reply_to_message_id = replyToMessageId;
        }
        const result = await sendTelegramMessageWithReplyFallback(botToken, smallerParams);
        sent.push({
          message_id: result?.message_id || null,
          part: `${i + 1}.${j + 1}`,
          parts: chunks.length,
          chars: smallerText.length,
        });
        log(`Telegram sendMessage delivered chat ${chatId} part ${i + 1}.${j + 1}/${chunks.length} chars=${smallerText.length} message_id=${result?.message_id || 'unknown'}`);
      }
    }
  }
  return {
    chunks: sent.length,
    message_ids: sent.map((item) => item.message_id).filter(Boolean),
    char_lengths: sent.map((item) => item.chars),
  };
}

async function sendDashboardMenu(config, chatId, replyToMessageId) {
  if (isScopedProjectBot(config)) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'One Time bot is live.',
        '',
        'Scope: One Time Mishnah Class tasks, comments, decisions, shiur ideas, source sheets, and class prep.',
        'Dashboard: https://bneineviimacademy.org/operations?view=tasks',
        '',
        'Useful commands:',
        '- /queue',
        '- /status',
        '- /help',
        '- task: prepare source sheet for...',
        '- comment task #123: ...',
      ].join('\n'),
      replyToMessageId
    );
    return;
  }

  await sendReply(
    config.botToken,
    chatId,
    [
      'BNA Telegram bridge is live. Ramble in plain English or open a lane.',
      '',
      'Dashboard: https://bneineviimacademy.org/operations',
      'Tasks: https://bneineviimacademy.org/operations?view=tasks',
      'Students: https://bneineviimacademy.org/operations?view=students',
      'Content: https://bneineviimacademy.org/operations?view=content',
      'Contacts: https://bneineviimacademy.org/operations?view=contacts',
      'Accounting: https://bneineviimacademy.org/operations?view=accounting',
    ].join('\n'),
    replyToMessageId
  );
}

async function sendDecisionButtons(botToken, chatId, replyToMessageId, sourceMessageId, options, metadata = {}) {
  if (!options.length) return;
  const existingDecisions = readPendingDecisions();
  if (existingDecisions[String(sourceMessageId)]?.sent_at) return;
  savePendingDecisionSet(sourceMessageId, options, metadata);
  const decisions = readPendingDecisions();
  if (decisions[String(sourceMessageId)]) {
    decisions[String(sourceMessageId)].sent_at = new Date().toISOString();
    writePendingDecisions(decisions);
  }
  await telegramRequest(botToken, 'sendMessage', {
    chat_id: chatId,
    text: 'Quick decision buttons:',
    reply_to_message_id: replyToMessageId,
    reply_markup: {
      inline_keyboard: options.map((label, index) => ([
        { text: label, callback_data: `decision:${sourceMessageId}:${index}` },
      ])),
    },
  });
}

async function sendExternalActionApproval(botToken, chatId, replyToMessageId, sourceMessageId, intentPlan, text, sourceMsg = {}) {
  savePendingExternalAction(sourceMessageId, {
    chat_id: chatId,
    source_message_id: sourceMessageId,
    text,
    reply_text: String(sourceMsg?.reply_to_message?.text || ''),
    reply_caption: String(sourceMsg?.reply_to_message?.caption || ''),
    intent_plan: summarizeIntentPlan(intentPlan),
  });

  await telegramRequest(botToken, 'sendMessage', {
    chat_id: chatId,
    text: [
      'I understood this as a public send/publish action.',
      '',
      'I can prepare drafts and internal records automatically, but I need confirmation before sending or publishing anything to other people.',
    ].join('\n'),
    reply_to_message_id: replyToMessageId,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Confirm Send/Publish', callback_data: `external:approve:${sourceMessageId}` },
          { text: 'Cancel', callback_data: `external:cancel:${sourceMessageId}` },
        ],
      ],
    },
  });
}

async function sendContentApproval(botToken, chatId, replyToMessageId, {
  outputId,
  jobId,
  body,
  heading = 'WhatsApp copy draft:',
  approveLabel = 'Save Final Draft',
  publishLabel = '',
}) {
  const keyboard = [
    [
      { text: approveLabel, callback_data: `content:approve:${outputId}` },
      { text: 'Reject', callback_data: `content:reject:${outputId}` },
    ],
  ];
  if (publishLabel) {
    keyboard.push([{ text: publishLabel, callback_data: `content:publish:${outputId}` }]);
  }
  keyboard.push([{ text: 'Open Content Queue', url: 'https://bneineviimacademy.org/operations?view=content' }]);

  const params = {
    chat_id: chatId,
    text: [
      heading,
      '',
      body,
      '',
      outputId ? `Saved draft: Content output #${outputId}.` : '',
      jobId ? `Source: Content job ${jobId}.` : '',
      '',
      publishLabel
        ? 'Reply with wording changes and I will rewrite it here. When it is ready, tap Commit to Buffer Draft or say "commit this" to create a Buffer draft for scheduling.'
        : 'Reply with wording changes and I will rewrite it here. When it is ready, save it as the final approved version.',
    ].filter(Boolean).join('\n'),
    reply_to_message_id: replyToMessageId,
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };
  if (replyToMessageId) {
    params.reply_to_message_id = replyToMessageId;
  }

  try {
    await telegramRequest(botToken, 'sendMessage', params);
  } catch (error) {
    if (params.reply_to_message_id) {
      delete params.reply_to_message_id;
      await telegramRequest(botToken, 'sendMessage', params);
      return;
    }
    throw error;
  }
}

async function sendContentNextActionButtons(botToken, chatId, replyToMessageId, {
  jobId,
  title,
  summary,
  mediaUrl,
}) {
  if (!jobId) return;
  const lines = [
    `New Drive content is ready: ${title || `Content job ${jobId}`}`,
    '',
    summary ? `Summary:\n${summary.slice(0, 900)}` : 'It has been saved in the content queue.',
    mediaUrl ? `\nDrive link: ${mediaUrl}` : '',
    '',
    'What do you want to do with it?',
  ].filter(Boolean);

  const params = {
    chat_id: chatId,
    text: lines.join('\n'),
    reply_to_message_id: replyToMessageId || undefined,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Make WhatsApp Copy', callback_data: `content:make_whatsapp:${jobId}` },
          { text: 'Make Facebook Post', callback_data: `content:make_facebook:${jobId}` },
        ],
        [{ text: 'Make Website Blog', callback_data: `content:make_blog:${jobId}` }],
        [{ text: 'Open Content Queue', url: 'https://bneineviimacademy.org/operations?view=content' }],
      ],
    },
  };
  try {
    await telegramRequest(botToken, 'sendMessage', params);
  } catch (error) {
    if (params.reply_to_message_id) {
      delete params.reply_to_message_id;
      await telegramRequest(botToken, 'sendMessage', params);
      return;
    }
    throw error;
  }
}

function compactTelegramLine(value, maxLength = 110) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length <= maxLength) return normalized;

  const preview = normalized.slice(0, maxLength + 1);
  const sentenceBreak = Math.max(
    preview.lastIndexOf('. '),
    preview.lastIndexOf('? '),
    preview.lastIndexOf('! ')
  );
  if (sentenceBreak >= Math.floor(maxLength * 0.45)) {
    return preview.slice(0, sentenceBreak + 1).trim();
  }

  const wordBreak = preview.lastIndexOf(' ');
  const cut = wordBreak >= Math.floor(maxLength * 0.6)
    ? preview.slice(0, wordBreak)
    : preview.slice(0, maxLength);
  return `${cut.replace(/[\s,;:.-]+$/, '').trim()}...`;
}

function taskSummaryTitle(task = {}, maxLength = 110) {
  return compactTelegramLine(task.title || `Task #${task.id || '?'}`, maxLength) || `Task #${task.id || '?'}`;
}

function buildRambleCaptureConfirmationLines(captureSummary = {}) {
  if (!hasStructuredCapture(captureSummary)) return [];
  const sourceDate = String(captureSummary.rambleProtocol?.source_date || todayFolderName()).slice(0, 10);
  const memoryPath = captureSummary.rambleProtocol?.raw_capture_path || `memory/${sourceDate}.md`;
  const rawId = captureSummary.rawIntakeId || captureSummary.rawIntake?.stable_id || captureSummary.rambleProtocol?.raw_id || '';
  const counts = captureSummary.parsedItemCounts || captureSummary.rambleProtocol?.item_counts || {};
  const countParts = [
    ['requirements', counts.requirements],
    ['tasks', counts.tasks],
    ['decisions', counts.decisions],
    ['open questions', counts.open_questions],
  ].filter(([, count]) => Number(count || 0) > 0)
    .map(([label, count]) => `${count} ${label}`);
  const registerPath = captureSummary.rawIntake?.requirement_register_path || captureSummary.rambleProtocol?.requirement_register_path || '';
  const goalMode = Boolean(captureSummary.rambleProtocol?.goal_mode_required || captureSummary.rambleProtocol?.goal_mode_execution_requested);
  const needsHandoff = Boolean(
    captureSummary.rambleProtocol?.needs_internal_handoff ||
    (captureSummary.tasks || []).some((task) => /codex|kimi|system|agent/i.test(String(task?.assigned_to || ''))) ||
    Number(captureSummary.agentJobsCreated || 0)
  );
  return [
    'Ramble protocol:',
    rawId ? `- Raw ID: ${rawId}.` : '',
    `- Raw saved: ${memoryPath}; visible items are distilled, not raw transcript.`,
    countParts.length ? `- Parsed counts: ${countParts.join(', ')}.` : '',
    registerPath ? `- Requirement register: ${registerPath}.` : '',
    goalMode ? '- Goal mode: create/continue the Codex goal and work requirements to terminal statuses.' : '',
    needsHandoff ? '- Future Codex handoff: tasks-pending/_template-ramble-intake.md.' : '',
    '- Done requires ledger/changelog plus proof, live smoke, blocker, or superseded status.',
  ].filter(Boolean);
}

function captureSummaryText(captureSummary = {}) {
  if (!captureSummary.enabled) return 'No structured BNA capture was created for this message.';

  const lines = [];
  const visibleTasks = (captureSummary.tasks || [])
    .filter((task) => task?.id && String(task.stage || '') !== 'archive')
    .slice(0, 3);

  if (visibleTasks.length) {
    lines.push('Already filed:');
    for (const task of visibleTasks) {
      const title = taskSummaryTitle(task, 96);
      const owner = String(task.assigned_to || '').trim();
      const ownerLabel = /shloimie/i.test(owner)
        ? 'Shloimie'
        : /codex|kimi|system|agent/i.test(owner)
          ? 'Codex'
          : 'Unassigned';
      const stage = String(task.stage || '').trim();
      const section = stage === 'needs_decision' || stage === 'raw_input'
        ? 'Decisions'
        : ownerLabel === 'Shloimie'
          ? 'My Tasks'
        : ownerLabel === 'Codex'
          ? 'Changelog'
          : 'Tasks';
      lines.push(`- #${task.id} ${section} / ${ownerLabel}: ${title}`);
    }
    const hiddenCount = Math.max(0, Number(captureSummary.tasksCreated || 0) - visibleTasks.length);
    if (hiddenCount) lines.push(`- ${hiddenCount} more task(s) filed`);
  } else if (captureSummary.tasksCreated) {
    lines.push(`Filed in Tasks: ${captureSummary.tasksCreated} task(s).`);
  }

  if (captureSummary.observableTicket?.id) {
    lines.push(`Created ticket #${captureSummary.observableTicket.id}.`);
  }

  const visibleAgentJobs = (captureSummary.agentJobs || [])
    .filter((job) => job?.id || job?.job_id)
    .slice(0, 3);
  if (visibleAgentJobs.length) {
    for (const job of visibleAgentJobs) {
      const jobId = job.id || job.job_id;
      const taskId = job.task_id ? `, task #${job.task_id}` : '';
      lines.push(`Queued for Codex: job #${jobId}${taskId}.`);
    }
  } else if (captureSummary.agentJobsCreated) {
    lines.push(`Queued for Codex: ${captureSummary.agentJobsCreated} job(s).`);
  }

  if (captureSummary.eventsCreated) {
    lines.push(`Filed in Students: ${captureSummary.eventsCreated} accountability item(s).`);
  }

  if (captureSummary.paymentIntakeCreated) {
    lines.push(`Filed in Accounting: ${captureSummary.paymentIntakeCreated} payment intake item(s).`);
  }

  const contactLeadCount =
    Number(captureSummary.contactLeadsCreated || 0) +
    Number(captureSummary.contactLeadsUpdated || 0) +
    Number(captureSummary.contactLeadsMatched || 0);
  if (contactLeadCount || Number(captureSummary.contactNotesCreated || 0)) {
    const parts = [];
    if (captureSummary.contactLeadsCreated) parts.push(`${captureSummary.contactLeadsCreated} new`);
    if (captureSummary.contactLeadsUpdated) parts.push(`${captureSummary.contactLeadsUpdated} updated`);
    if (captureSummary.contactLeadsMatched) parts.push(`${captureSummary.contactLeadsMatched} matched existing`);
    const leadLabel = parts.length ? parts.join(', ') : `${contactLeadCount} lead`;
    lines.push(`Filed in Contacts: ${leadLabel}; ${Number(captureSummary.contactNotesCreated || 0)} note(s).`);
  }

  if (captureSummary.telegramCrmNotesCreated) {
    lines.push(`Filed in Contacts: ${captureSummary.telegramCrmNotesCreated} Telegram CRM note(s).`);
  } else if (captureSummary.telegramCrmNoteIntent) {
    const reason = String(captureSummary.telegramCrmNoteReason || 'no confident match').replace(/_/g, ' ');
    lines.push(`Could not safely match that WhatsApp note yet: ${reason}.`);
  }

  if (captureSummary.commentsCreated) {
    lines.push(`Filed in One Time comments: ${captureSummary.commentsCreated} comment(s).`);
  }

  if (captureSummary.supportTicketsCreated) {
    const visibleTickets = (captureSummary.supportTickets || [])
      .filter((ticket) => ticket?.id)
      .slice(0, 3);
    if (visibleTickets.length) {
      for (const ticket of visibleTickets) {
        lines.push(`Filed in Support: #${ticket.id} ${ticket.title || 'ticket'}.`);
      }
    } else {
      lines.push(`Filed in Team: ${captureSummary.supportTicketsCreated} ticket(s).`);
    }
  }

  lines.push(...buildRambleCaptureConfirmationLines(captureSummary));

  return lines.length ? lines.join('\n') : 'Captured in BNA.';
}

function hasStructuredCapture(captureSummary = {}) {
  return Boolean(
    Number(captureSummary.tasksCreated || 0) ||
    Number(captureSummary.eventsCreated || 0) ||
    Number(captureSummary.paymentIntakeCreated || 0) ||
    Number(captureSummary.contactLeadsCreated || 0) ||
    Number(captureSummary.contactLeadsUpdated || 0) ||
    Number(captureSummary.contactLeadsMatched || 0) ||
    Number(captureSummary.contactNotesCreated || 0) ||
    Number(captureSummary.telegramCrmNotesCreated || 0) ||
    Boolean(captureSummary.telegramCrmNoteIntent) ||
    Number(captureSummary.commentsCreated || 0) ||
    Number(captureSummary.supportTicketsCreated || 0) ||
    Number(captureSummary.observableTicketsCreated || 0) ||
    Number(captureSummary.agentJobsCreated || 0) ||
    Boolean(captureSummary.rawIntakeId || captureSummary.rawIntake?.stable_id) ||
    captureSummary.studentMatchDecisions?.length
  );
}

function isRunnableCodexTask(task = {}) {
  if (!task?.id) return false;
  const owner = String(task.assigned_to || '').trim();
  const stage = String(task.stage || '').trim();
  if (!/codex|kimi|system|agent/i.test(owner)) return false;
  if (['done', 'archive', 'needs_decision'].includes(stage)) return false;
  return true;
}

function runnableCodexTasksFromCapture(captureSummary = {}) {
  return (captureSummary.tasks || []).filter(isRunnableCodexTask);
}

function shouldWorkExistingCodexQueue(text) {
  const normalized = String(text || '').toLowerCase();
  if (!/\b(task|tasks|todo|queue|queued|work|finish|done|codex|goal|goalmode|prompt|output|correction|packet)\b/.test(normalized)) return false;
  return (
    /\b(work through|keep going|finish up|finish everything|build everything|do all|all of the tasks|all those tasks|start doing|until (they'?re|they are|its|it's) done|not just waiting|not waiting)\b/.test(normalized)
    || /\b(goal\s*mode|goal\s*setting\s*mode|goalmode|set (it|this|that) as a goal|make (it|this|that) a goal)\b/.test(normalized)
    || /\b(work through (the )?(whole|entire|full) (prompt|output|list|register|correction|packet)|do all (of )?(those|these|the) things|keep (working|going) (until|till) (everything|it|they) (is|are|'?s|'?re)? done)\b/.test(normalized)
    || /\b(tasks? (are|is) getting worked on|tasks?.*worked on)\b/.test(normalized)
  );
}

function blocksAutomaticCodexWork(text) {
  return hasDirectReplyInsteadOfCodexIntent(text)
    || /\b(don't build|do not build|don't code|do not code|don't implement|do not implement|nothing yet|not yet|just design|only design|just brainstorm|only brainstorm|tell me first|explain first)\b/i.test(String(text || ''));
}

function taskListSummary(tasks = [], limit = 8) {
  return tasks
    .slice(0, limit)
    .map((task) => `#${task.id} ${taskSummaryTitle(task, 100)}`)
    .join(', ');
}

function buildCodexTaskWorkMessage(originalText, tasks = [], source = 'captured') {
  const taskLines = tasks
    .map((task) => [
      `- Task #${task.id}: ${String(task.title || 'Untitled task').replace(/\s+/g, ' ').trim()}`,
      task.project_short_name || task.project_name ? `  Project: ${task.project_short_name || task.project_name}` : '',
      task.category ? `  Category: ${task.category}` : '',
      task.urgency ? `  Urgency: ${task.urgency}` : '',
      task.notes ? `  Notes: ${String(task.notes).replace(/\s+/g, ' ').slice(0, 500)}` : '',
    ].filter(Boolean).join('\n'))
    .join('\n');

  return [
    `Codex work batch source: ${source}.`,
    '',
    'Operator message:',
    String(originalText || '').trim(),
    '',
    'Active Codex-owned tasks to work now:',
    taskLines || '- No task IDs were supplied; inspect TASKS.md and the app task queue before choosing work.',
    '',
    'Instructions for this work batch:',
    '- Start working through the listed Codex tasks now; do not just summarize them.',
    '- Choose the safest practical order when there are multiple tasks.',
    '- If the source is a GPT/ChatGPT correction output or goal-mode packet, create/continue the active Codex goal and work the dated requirement register until every item reaches a terminal status.',
    '- Keep edits scoped and preserve existing data.',
    '- When a listed task is finished, update the app task record to stage done when possible, append the shared ledger/changelog, and include verification.',
    '- If a listed task is too large to finish in this batch, leave it in progress or assigned with clear next steps, not forgotten.',
    '- Return a Telegram-ready progress report with completed items, in-progress items, verification, and blockers only if blocked.',
  ].join('\n');
}

async function markCodexTasksInProgress(config, tasks = [], chatId, messageId, reason = 'codex_work_queue') {
  const updated = [];
  for (const task of tasks.filter(isRunnableCodexTask)) {
    if (String(task.stage || '') === 'in_progress') {
      updated.push(task);
      continue;
    }

    try {
      const result = await appRequest(config, 'PATCH', `/api/bna/tasks/${task.id}`, {
        stage: 'in_progress',
        assigned_to: 'Codex',
        started_at: task.started_at || new Date().toISOString(),
        verification_notes: `Started automatically from Telegram ${reason}.`,
      });
      const patched = result?.task || { ...task, stage: 'in_progress', assigned_to: 'Codex' };
      updated.push(patched);
      appendAgentTaskLedger({
        event: 'task_started',
        source: 'telegram_bridge',
        chat_id: chatId,
        message_id: messageId,
        task_id: task.id,
        title: patched.title || task.title || null,
        stage: patched.stage || 'in_progress',
        assigned_to: patched.assigned_to || 'Codex',
        notes: `Queued for automatic Codex work via ${reason}.`,
      });
    } catch (error) {
      log(`Could not mark task #${task.id} in progress: ${error instanceof Error ? error.message : String(error)}`);
      updated.push(task);
    }
  }
  return updated;
}

async function loadActiveCodexTasks(config, limit = 8) {
  const result = await appRequest(config, 'GET', '/api/bna/tasks');
  const tasks = Array.isArray(result?.tasks) ? result.tasks : [];
  return tasks
    .filter(isRunnableCodexTask)
    .sort((a, b) => {
      const urgencyScore = (task) => String(task.urgency || '') === 'urgent' ? 0 : 1;
      const stageScore = (task) => String(task.stage || '') === 'in_progress' ? 0 : 1;
      return urgencyScore(a) - urgencyScore(b)
        || stageScore(a) - stageScore(b)
        || new Date(a.created_at || 0) - new Date(b.created_at || 0);
    })
    .slice(0, limit);
}

async function loadTasksByIds(config, taskIds = []) {
  const wanted = new Set(taskIds.map((id) => String(id)));
  if (!wanted.size) return [];
  const result = await appRequest(config, 'GET', '/api/bna/tasks');
  const tasks = Array.isArray(result?.tasks) ? result.tasks : [];
  return tasks.filter((task) => wanted.has(String(task.id)));
}

async function sendTaskCompletionReminders(config, chatId, replyToMessageId, trackedTasks = []) {
  const trackedIds = trackedTasks.map((task) => task?.id).filter(Boolean);
  if (!trackedIds.length) return;

  let latestTasks = [];
  try {
    latestTasks = await loadTasksByIds(config, trackedIds);
  } catch (error) {
    log(`Could not load task completion status: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  for (const task of latestTasks.filter((item) => String(item.stage || '') === 'done')) {
    await sendReply(
      config.botToken,
      chatId,
      [
        `Task complete: #${task.id} ${taskSummaryTitle(task, 120)}`,
        task.verification_notes ? `Verified: ${String(task.verification_notes).replace(/\s+/g, ' ').slice(0, 500)}` : '',
      ].filter(Boolean).join('\n'),
      replyToMessageId,
      { includeModeKeyboard: false }
    );
  }
}

function readTaskWatchState() {
  try {
    if (!fs.existsSync(telegramTaskWatchStateFile)) {
      return { initialized: false, tasks: {} };
    }
    const parsed = JSON.parse(fs.readFileSync(telegramTaskWatchStateFile, 'utf8'));
    return {
      initialized: Boolean(parsed.initialized),
      tasks: parsed.tasks && typeof parsed.tasks === 'object' ? parsed.tasks : {},
    };
  } catch (error) {
    log(`Task watch state read failed: ${error instanceof Error ? error.message : String(error)}`);
    return { initialized: false, tasks: {} };
  }
}

function writeTaskWatchState(state) {
  fs.writeFileSync(telegramTaskWatchStateFile, JSON.stringify({
    initialized: true,
    updated_at: new Date().toISOString(),
    tasks: state.tasks || {},
  }, null, 2));
}

function watchedTaskSnapshot(task) {
  return {
    id: task.id,
    title: taskSummaryTitle(task, 120),
    stage: String(task.stage || ''),
    assigned_to: String(task.assigned_to || ''),
    updated_at: task.updated_at || null,
    completed_at: task.completed_at || null,
    verified_at: task.verified_at || null,
    verification_notes: task.verification_notes || null,
  };
}

function taskWatchShouldTrack(task) {
  return task?.id && isAgentOwnedTask(task);
}

function taskWatchChangeLines(previous, current) {
  const lines = [];
  if (!previous) return lines;

  if (previous.stage !== current.stage) {
    if (current.stage === 'done') {
      lines.push(`Task complete: #${current.id} ${current.title}`);
    } else if (current.stage === 'archive') {
      lines.push(`Task archived: #${current.id} ${current.title}`);
    } else {
      lines.push(`Task moved: #${current.id} ${current.title} (${previous.stage || 'unknown'} -> ${current.stage || 'unknown'})`);
    }
  }

  if (!previous.verified_at && current.verified_at) {
    lines.push(`Task verified: #${current.id} ${current.title}`);
  }

  if (current.stage === 'done' && !previous.completed_at && current.completed_at && previous.stage === current.stage) {
    lines.push(`Task complete: #${current.id} ${current.title}`);
  }

  if (lines.length && current.verification_notes) {
    lines.push(`Verified: ${String(current.verification_notes).replace(/\s+/g, ' ').slice(0, 400)}`);
  }

  return lines;
}

async function maybeTaskStatusWatch(config) {
  const chatId = config.allowedChatIds[0];
  if (!chatId || !config.taskWatchIntervalMs) return;

  let tasks = [];
  try {
    tasks = await loadLiveTasks(config);
  } catch (error) {
    log(`Task watch skipped: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  const watched = tasks
    .filter(taskWatchShouldTrack)
    .map(watchedTaskSnapshot);
  const current = Object.fromEntries(watched.map((task) => [String(task.id), task]));
  const state = readTaskWatchState();

  if (!state.initialized) {
    writeTaskWatchState({ tasks: current });
    log(`Task watch initialized with ${watched.filter((task) => isActiveStage(task.stage)).length} active agent task(s).`);
    return;
  }

  const notifications = [];
  for (const task of watched) {
    const previous = state.tasks[String(task.id)];
    notifications.push(...taskWatchChangeLines(previous, task));
  }

  writeTaskWatchState({ tasks: current });

  if (!notifications.length) return;

  const chunks = [];
  let chunk = ['Task updates:'];
  for (const line of notifications.slice(0, 18)) {
    const next = [...chunk, line].join('\n');
    if (next.length > 3200) {
      chunks.push(chunk.join('\n'));
      chunk = ['Task updates:', line];
    } else {
      chunk.push(line);
    }
  }
  if (notifications.length > 18) {
    chunk.push(`...and ${notifications.length - 18} more task update(s).`);
  }
  chunks.push(chunk.join('\n'));

  for (const text of chunks) {
    await sendReply(config.botToken, chatId, text, null, { includeModeKeyboard: false });
  }
}

function codexQueueStartedText(tasks = []) {
  if (!tasks.length) return '';
  return [
    `Codex work started: ${taskListSummary(tasks)}.`,
    'I will send Telegram reminders as tracked tasks are marked done.',
  ].join('\n');
}

function enqueueAgentReplyJob(job) {
  const queuedAhead = agentReplyQueue.length + (agentReplyRunning ? 1 : 0);
  const queued = {
    ...job,
    id: ++agentReplySequence,
    queuedAt: new Date().toISOString(),
    position: queuedAhead + 1,
  };
  agentReplyQueue.push(queued);
  log(`Queued Codex reply job ${queued.id} for chat ${queued.chatId} message ${queued.messageId}; position ${queued.position}`);
  processAgentReplyQueue().catch((error) => {
    log(`Agent reply queue failed: ${error instanceof Error ? error.message : String(error)}`);
  });
  return queued;
}

async function processAgentReplyQueue() {
  if (agentReplyRunning) return;
  agentReplyRunning = true;
  try {
    while (agentReplyQueue.length) {
      const job = agentReplyQueue.shift();
      try {
        await runAgentReplyJob(job);
      } catch (error) {
        log(`Agent reply job ${job?.id || '?'} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } finally {
    agentReplyRunning = false;
  }
}

async function runAgentReplyJob(job) {
  const { config, text, chatId, messageId, prompt, trackedTasks = [] } = job;
  log(`Starting Codex reply job ${job.id} for chat ${chatId} message ${messageId}`);
  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  let reply;
  let replyProvider = 'Codex CLI';
  try {
    if (String(config.primaryAgent || '').toLowerCase() === 'kimi') {
      replyProvider = 'Kimi CLI';
      reply = await runKimi(buildKimiPrompt(config, text, chatId, messageId), config.kimiModel, config.kimiTimeoutMs);
    } else {
      reply = await runCodex(prompt, config);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`${replyProvider} failed, using API fallback: ${message}`);
    const fallback = await runApiFallback(config, text, chatId, messageId);
    replyProvider = `${fallback.provider} API fallback`;
    reply = fallback.reply;
  }

  const delivery = await sendReply(
    config.botToken,
    chatId,
    reply,
    messageId,
  );
  appendMemoryEntry(`${replyProvider} Reply`, reply, {
    chat_id: chatId,
    reply_to_message_id: messageId,
    async_agent_job_id: job.id,
    telegram_chunks: delivery.chunks,
    telegram_message_ids: delivery.message_ids.join(','),
  });
  await sendTaskCompletionReminders(config, chatId, messageId, trackedTasks);
  log(`Completed Codex reply job ${job.id} for chat ${chatId} message ${messageId} via ${replyProvider}`);

  const decisionOptions = extractDecisionOptions(reply);
  if (decisionOptions.length) {
    await sendDecisionButtons(config.botToken, chatId, messageId, messageId, decisionOptions, {
      source_text: text,
      reply_text: reply,
    });
  }
}

async function sendStudentMatchButtons(botToken, chatId, replyToMessageId, decisions = []) {
  for (const decision of decisions.slice(0, 3)) {
    const event = decision?.event;
    const candidates = decision?.candidates || [];
    if (!event?.id || !candidates.length) continue;

    const keyboard = [];
    for (let i = 0; i < candidates.length; i += 2) {
      keyboard.push(candidates.slice(i, i + 2).map((student) => ({
        text: String(student.name || `Student ${student.id}`).slice(0, 28),
        callback_data: `student:${event.id}:${student.id}`,
      })));
    }
    keyboard.push([{ text: 'Open Students', url: 'https://bneineviimacademy.org/operations?view=students' }]);

    await telegramRequest(botToken, 'sendMessage', {
      chat_id: chatId,
      text: [
        'Which student should this accountability note attach to?',
        '',
        String(event.title || 'Student note').slice(0, 420),
      ].join('\n'),
      reply_to_message_id: replyToMessageId || undefined,
      reply_markup: { inline_keyboard: keyboard },
    });
  }
}

async function downloadTelegramFile(botToken, fileId, preferredName) {
  const file = await telegramRequest(botToken, 'getFile', { file_id: fileId });
  const filePath = file?.file_path;
  if (!filePath) {
    throw new Error('Telegram did not return a file_path');
  }

  const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download Telegram file: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const dateFolder = ensureDirectory(path.join(mediaInboxDir, todayFolderName()));
  const extension = path.extname(preferredName || filePath) || path.extname(filePath);
  const baseName = sanitizeFileName(path.basename(preferredName || filePath, extension));
  const targetPath = path.join(
    dateFolder,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${baseName}${extension}`
  );
  fs.writeFileSync(targetPath, buffer);
  return {
    localPath: targetPath,
    filePath,
    size: buffer.length,
  };
}

function resolveTargetAccounts(targetTokens, accounts) {
  const aliasMap = buildAccountAliases(accounts);
  const resolved = [];
  const unresolved = [];

  for (const rawToken of targetTokens) {
    const token = slugify(rawToken.replace(/^@/, ''));
    if (!token) continue;

    if (aliasMap.has(token)) {
      resolved.push({ alias: token, account: aliasMap.get(token) });
      continue;
    }

    const platformMatches = accounts.filter((account) => slugify(account.platform) === token);
    if (platformMatches.length === 1) {
      const account = platformMatches[0];
      const aliasEntry = [...aliasMap.entries()].find(([, value]) => value.id === account.id);
      resolved.push({ alias: aliasEntry ? aliasEntry[0] : token, account });
      continue;
    }

    if (platformMatches.length > 1) {
      unresolved.push(`${rawToken} (multiple matches, use /accounts for aliases)`);
      continue;
    }

    unresolved.push(rawToken);
  }

  return { resolved, unresolved, aliasMap };
}

function buildJob({
  kind,
  chatId,
  messageId,
  caption,
  localPath = '',
  mediaUrl = '',
  mimeType = '',
  targets = [],
  publishNow = false,
  summary = '',
  status = 'queued',
  notes = [],
}) {
  const id = `${todayFolderName()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    kind,
    createdAt: new Date().toISOString(),
    chatId,
    messageId,
    caption,
    localPath,
    mediaUrl,
    mimeType,
    targets,
    publishNow,
    summary,
    status,
    notes,
  };
}

function defaultContentOutputsForMedia(kind, caption) {
  return [{
    output_type: 'teaching_philosophy_note',
    title: 'Repurpose-ready asset',
    body: caption || 'Transcribed and summarized. Waiting for the next repurposing instruction.',
    status: 'draft',
    metadata: { source_media_kind: kind },
  }];
}

function shouldGenerateWhatsAppDraft(caption) {
  return /\b(whatsapp|wa update|daily update|parent update|parents update|update for parents|caption|copy)\b/i.test(String(caption || ''))
    && !hasParentAccountabilityRoutingIntent(caption)
    && !/\b(do not|don't|dont|not yet|hold|wait)\b/i.test(String(caption || ''));
}

function shouldGenerateFacebookDraft(caption) {
  return /\b(facebook|fb|social post|facebook post)\b/i.test(String(caption || ''))
    && !/\b(do not|don't|dont|not yet|hold|wait)\b/i.test(String(caption || ''));
}

function shouldAutoSendGeneratedWhatsAppDraftPreview({ outputId = '' } = {}) {
  return !outputId;
}

function hasMarketingContentIntent(text) {
  const normalized = String(text || '').toLowerCase();
  return /\b(whatsapp|facebook|fb|instagram|linkedin|youtube|google business|gbp|blog|newsletter|email|parent update|daily update|caption|copy|post|publish|repurpose|marketing|social)\b/.test(normalized);
}

function hasClassContentIntent(text) {
  const normalized = String(text || '').toLowerCase();
  return /\b(class recording|class notes|class session|classes?|shiur|lesson|teaching philosophy|topics? covered|covered in class|what we learned|learned today|sources?|verses?|pasuk|pesukim|parsha|chumash|tanach|mishna|mishnah|gemara|deuteronomy|lashon hara|gaava|humility|torah discussion)\b/.test(normalized);
}

function hasTaskStudentParserIntent(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (/\b(do not parse|don't parse|dont parse|hold parse|manual review only)\b/.test(normalized)) return false;
  const taskIntent = /\b(task|tasks|my task|codex|kimi|kimmy|code|coding|dashboard|parser|parse|route|routing|fix|build|wire|deploy|app|bot|system)\b/.test(normalized)
    || /\b(i need you to|we need to|need to|can you|please)\b/.test(normalized);
  const studentIntent = /\b(accountability|student accountability|student goal|student goals|student meeting|student meetings|private meeting|private meetings|meeting with|met with|one on one|1:1|check in|check-in|next check|follow up|follow-up|attendance|engagement|progress|inside|listening|listened|followed along|following along|distracted|off task|off-task|timer|percent|percentage|completed|goal minutes|torah progress|daily torah|group goal|student asked)\b/.test(normalized);
  return taskIntent || studentIntent;
}

function classifyMediaRouting(caption, transcriptText = '', options = {}) {
  const captionText = String(caption || '');
  const transcriptOnlyText = String(transcriptText || '');
  const text = `${captionText}\n${transcriptOnlyText}`;
  const parentAccountabilityIntent = hasParentAccountabilityRoutingIntent(text);
  const captionMarketingIntent = hasMarketingContentIntent(captionText);
  const transcriptMarketingIntent = hasMarketingContentIntent(transcriptOnlyText);
  const marketingIntent = captionMarketingIntent
    || Boolean(options.generatedContent)
    || Boolean(options.publishIntent?.isPublishRequest);
  const classContentIntent = hasClassContentIntent(text);
  const parserIntent = parentAccountabilityIntent || hasTaskStudentParserIntent(text);
  const parserOnly = parentAccountabilityIntent || (parserIntent && !marketingIntent && !classContentIntent);
  return {
    marketingIntent,
    captionMarketingIntent,
    transcriptMarketingIntent,
    classContentIntent,
    parserIntent,
    parserOnly,
    contentLane: parentAccountabilityIntent ? false : (marketingIntent || classContentIntent || (!parserIntent && transcriptMarketingIntent) || !parserIntent),
    shouldParse: parserIntent || classContentIntent,
  };
}

function shouldAutoParseMixedRecording(transcriptText, caption = '') {
  return classifyMediaRouting(caption, transcriptText).shouldParse;
}

function buildRecordingIntakeTranscript(caption = '', transcriptText = '') {
  return [
    caption ? `Caption/context:\n${String(caption).trim()}` : '',
    transcriptText ? `Transcript:\n${String(transcriptText).trim()}` : '',
  ].filter(Boolean).join('\n\n').trim();
}

function shouldUseRecordingIntake(routing = {}, caption = '', transcriptText = '') {
  return Boolean(
    routing.parserOnly
    && routing.shouldParse
    && buildRecordingIntakeTranscript(caption, transcriptText)
  );
}

function buildGeneratedContentOutputs(kind, caption, {
  whatsAppDraft = '',
  facebookDraft = '',
} = {}) {
  const outputs = defaultContentOutputsForMedia(kind, caption);
  if (whatsAppDraft || shouldGenerateWhatsAppDraft(caption)) {
    outputs.push({
      output_type: 'whatsapp_update',
      title: 'WhatsApp update draft',
      body: whatsAppDraft || '',
      platform: 'whatsapp',
      status: whatsAppDraft ? 'needs_approval' : 'draft',
      metadata: { source_media_kind: kind },
    });
  }
  if (facebookDraft || shouldGenerateFacebookDraft(caption)) {
    outputs.push({
      output_type: 'facebook_post',
      title: 'Facebook post draft',
      body: facebookDraft || '',
      platform: 'facebook',
      status: facebookDraft ? 'needs_approval' : 'draft',
      metadata: { source_media_kind: kind },
    });
  }
  return outputs;
}

function isLatestDriveIngestRequest(text) {
  const normalized = String(text || '').toLowerCase();
  const mentionsDriveUpload = /\b(drive|raw intake|intake folder|drive folder|uploaded|dropped|added|put)\b/.test(normalized);
  const mentionsMedia = /\b(video|recording|audio|file|media|mp4|mov|m4a)\b/.test(normalized);
  const wantsProcessing = /\b(caption|captions|whatsapp|facebook|fb|post|transcribe|transcript|process|ingest|queue|title|name|summary)\b/.test(normalized);
  return mentionsDriveUpload && mentionsMedia && wantsProcessing;
}

function buildLatestDriveIngestCaption(text) {
  const original = String(text || '').trim();
  return [
    'Use the newest media file in Google Drive BNA V2 / 00 Upload Here - Raw Media Intake.',
    'Title/name the content yourself from the transcript; do not ask the operator for the filename unless the raw media intake folder is empty.',
    'Create a short WhatsApp parent caption in newsletter form: tight video-summary bullets first, then a compact weekly recap if the transcript includes weekly topics.',
    'Create a separate longer Facebook caption in a warmer narrative style. Do not reuse the WhatsApp copy for Facebook.',
    'Keep Facebook as a draft/approval item unless the operator explicitly says publish now.',
    '',
    'Original operator request:',
    original,
  ].join('\n');
}

function isLatestVideoEditRequest(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (/^\/(?:edit_video|video_edit|remotion_edit|edit_drive|edit_drop|drop_edit)\b/i.test(normalized)) return true;
  const mentionsSource = /\b(latest|newest|raw intake|intake folder|drive|uploaded|dropped|video|clip|mp4|mov)\b/.test(normalized);
  const mentionsEditor = /\b(edit|render|remotion|make a cut|cut this|timeline)\b/.test(normalized);
  const mentionsOperation = /\b(speed up|slow down|faster|slower|overlay|background audio|audio overlay|music|subtitle|caption|transition|fade|zoom|focus|crop|brighten|brighter|lighter|darken|trim|cut|from \d|at \d)\b/.test(normalized);
  return mentionsSource && mentionsEditor && mentionsOperation;
}

function isDirectVideoEditCaption(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (/^\/(?:edit_video|video_edit|remotion_edit)\b/i.test(normalized)) return true;
  const mentionsEditor = /\b(edit|render|remotion|timeline)\b/.test(normalized);
  const mentionsOperation = /\b(speed up|slow down|faster|slower|overlay|background audio|audio overlay|music|subtitle|transition|fade|zoom|focus|crop|brighten|brighter|lighter|darken|trim|cut|from \d|at \d)\b/.test(normalized);
  return mentionsEditor && mentionsOperation;
}

function extractVideoEditInstruction(text, commandPattern = /^\/(?:edit_video|video_edit|remotion_edit|edit_drive)\b/i) {
  const instruction = String(text || '').replace(commandPattern, '').trim();
  return instruction || 'Make a clean first-pass edit from this source video. Keep the original audio and use a vertical social format unless the source is clearly horizontal.';
}

function getTranscriptText(transcription) {
  if (!transcription) return '';
  if (typeof transcription === 'string') return transcription;
  if (typeof transcription.text === 'string') return transcription.text;
  if (Array.isArray(transcription.chunks)) {
    return transcription.chunks
      .map((chunk, index) => {
        const text = getTranscriptText(chunk.transcription);
        return text ? `[part ${index + 1}]\n${text}` : '';
      })
      .filter(Boolean)
      .join('\n\n')
      .trim();
  }
  if (Array.isArray(transcription.segments)) {
    return transcription.segments
      .map((segment) => {
        const speaker = segment.speaker || segment.speaker_label || segment.label || '';
        const text = segment.text || '';
        return speaker ? `${speaker}: ${text}` : text;
      })
      .join('\n')
      .trim();
  }
  return '';
}

function isAudioVideoMime(mimeType) {
  return /^audio\//i.test(String(mimeType || '')) || /^video\//i.test(String(mimeType || ''));
}

function isImageMime(mimeType) {
  return /^image\//i.test(String(mimeType || ''));
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const timeoutMs = Number(options.timeoutMs || 0);
    const spawnOptions = { ...options };
    delete spawnOptions.timeoutMs;
    const child = spawn(command, args, {
      cwd: repoRoot,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...spawnOptions,
    });

    let stdout = '';
    let stderr = '';
    let timer = null;
    let settled = false;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        child.kill();
        reject(new Error(`${path.basename(command)} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }
    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${path.basename(command)} exited ${code}: ${(stderr || stdout).slice(0, 1000)}`));
    });
  });
}

function parseJsonSummary(stdout) {
  const text = String(stdout || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const match = text.match(/\{[\s\S]*\}\s*$/);
  return match ? JSON.parse(match[0]) : null;
}

function isLocalVideoPath(filePath) {
  const descriptor = detectLocalFileDescriptor(filePath);
  return descriptor.kind === 'video' || /^video\//i.test(descriptor.mimeType || '');
}

function isLocalRemotionAssetPath(filePath) {
  const descriptor = detectLocalFileDescriptor(filePath);
  return descriptor.kind === 'photo'
    || descriptor.kind === 'voice'
    || /^image\//i.test(descriptor.mimeType || '')
    || /^audio\//i.test(descriptor.mimeType || '');
}

function isDriveRemotionAssetFile(file) {
  const descriptor = detectLocalFileDescriptor(file?.name || '');
  return descriptor.kind === 'photo'
    || descriptor.kind === 'voice'
    || /^image\//i.test(file?.mimeType || '')
    || /^audio\//i.test(file?.mimeType || '');
}

function remotionAssetKindFromPath(filePath, mimeType = '') {
  const descriptor = detectLocalFileDescriptor(filePath);
  if (descriptor.kind === 'photo' || /^image\//i.test(mimeType || descriptor.mimeType || '')) return 'image';
  if (descriptor.kind === 'voice' || /^audio\//i.test(mimeType || descriptor.mimeType || '')) return 'audio';
  return 'asset';
}

function remotionAssetBaseKey(filePath) {
  return slugify(path.basename(filePath, path.extname(filePath))).slice(0, 32) || 'asset';
}

function buildRemotionAssetList(items = []) {
  const counts = { image: 0, audio: 0, asset: 0 };
  const used = new Set();
  return items
    .filter((item) => item?.localPath && fs.existsSync(item.localPath))
    .slice(0, 12)
    .map((item) => {
      const kind = item.kind || remotionAssetKindFromPath(item.localPath, item.mimeType);
      counts[kind] = (counts[kind] || 0) + 1;
      const preferred = sanitizeFileName(item.key || remotionAssetBaseKey(item.originalName || item.localPath));
      let key = preferred || `${kind}${counts[kind]}`;
      if (!key || used.has(key)) key = `${kind}${counts[kind]}`;
      let suffix = 2;
      while (used.has(key)) key = `${preferred || kind}${suffix++}`;
      used.add(key);
      return {
        key,
        kind,
        localPath: item.localPath,
        originalName: item.originalName || path.basename(item.localPath),
      };
    });
}

function formatRemotionAssetSummary(assets = []) {
  if (!assets.length) return 'Assets: none';
  return `Assets: ${assets.map((asset) => `${asset.key} (${asset.kind})`).join(', ')}`;
}

async function runRemotionSourceEdit(localPath, instruction, { maxDurationSeconds = 120, assets = [] } = {}) {
  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${sanitizeFileName(path.basename(localPath, path.extname(localPath)))}`;
  const summaryPath = path.join(repoRoot, 'src', 'remotion', 'generated', `${runId}.telegram-summary.json`);
  const remotionAssets = buildRemotionAssetList(assets);
  const args = [
    'scripts/video-edit-source.mjs',
    '--source',
    localPath,
    '--max-duration',
    String(maxDurationSeconds),
    '--summary',
    summaryPath,
    '--json',
    instruction,
  ];
  for (const asset of remotionAssets) {
    args.push('--asset', `${asset.key}=${asset.localPath}`);
  }
  const { stdout, stderr } = await runProcess(process.execPath, args, {
    timeoutMs: Math.max(180000, maxDurationSeconds * 12000),
  });
  const summary = parseJsonSummary(stdout)
    || (fs.existsSync(summaryPath) ? JSON.parse(fs.readFileSync(summaryPath, 'utf8')) : null);
  if (!summary?.outputPath) {
    throw new Error(`Remotion edit finished without a JSON output path. ${stderr || stdout}`.slice(0, 1200));
  }
  const outputPath = path.isAbsolute(summary.outputPath)
    ? summary.outputPath
    : path.join(repoRoot, summary.outputPath);
  const propsPath = summary.propsPath
    ? (path.isAbsolute(summary.propsPath) ? summary.propsPath : path.join(repoRoot, summary.propsPath))
    : '';
  const outputSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
  return {
    ...summary,
    inputAssets: remotionAssets,
    outputPath,
    propsPath,
    outputSize,
  };
}

async function sendVideoEditResult(config, chatId, messageId, result, sourceLabel, instruction) {
  const relativeOutput = path.relative(repoRoot, result.outputPath).replace(/\\/g, '/');
  const relativeProps = result.propsPath ? path.relative(repoRoot, result.propsPath).replace(/\\/g, '/') : '';
  const lines = [
    'Remotion edit rendered.',
    `Source: ${sourceLabel}`,
    `Provider: ${result.provider || 'unknown'}`,
    `Duration: ${result.props?.durationSeconds || result.props?.sourceDurationSeconds || 'unknown'}s`,
    result.inputAssets?.length ? formatRemotionAssetSummary(result.inputAssets) : '',
    `Output: ${relativeOutput}`,
    relativeProps ? `Timeline props: ${relativeProps}` : '',
    result.notes?.length ? `Notes: ${result.notes.slice(0, 3).join(' ')}` : '',
  ].filter(Boolean);

  appendMemoryEntry('Remotion Video Edit', lines.concat(['', 'Instruction:', instruction]).join('\n'), {
    chat_id: chatId,
    message_id: messageId,
    output: relativeOutput,
    props: relativeProps,
  });
  appendAgentTaskLedger({
    event: 'remotion_video_rendered',
    source: 'telegram',
    title: 'Render natural-language Remotion video edit',
    notes: `${sourceLabel} -> ${relativeOutput}`,
    stage: 'done',
    assigned_to: 'Codex',
  });

  await sendReply(config.botToken, chatId, lines.join('\n'), messageId);

  if (!fs.existsSync(result.outputPath)) {
    await sendReply(config.botToken, chatId, 'The render path was reported, but I do not see the file on disk.', messageId);
    return;
  }

  if (result.outputSize > config.telegramUploadMaxBytes) {
    await sendReply(
      config.botToken,
      chatId,
      `Rendered file is ${formatBytes(result.outputSize)}, which is too large to send back through Telegram. It is saved locally at ${relativeOutput}.`,
      messageId
    );
    return;
  }

  await telegramUploadFile(
    config.botToken,
    'sendDocument',
    {
      chat_id: chatId,
      reply_to_message_id: messageId,
      caption: `Remotion edit: ${path.basename(result.outputPath)}`,
    },
    'document',
    result.outputPath,
    path.basename(result.outputPath)
  );
}

async function createTranscriptionAudioChunks(localPath, descriptor) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg is not available, so large media cannot be compressed or split automatically.');
  }

  const chunksDir = ensureDirectory(path.join(
    mediaInboxDir,
    todayFolderName(),
    'transcription-chunks',
    sanitizeFileName(path.basename(localPath, path.extname(localPath)))
  ));
  const outputPattern = path.join(chunksDir, 'part-%03d.mp3');
  const existingChunks = fs.readdirSync(chunksDir)
    .filter((name) => name.toLowerCase().endsWith('.mp3'))
    .sort()
    .map((name) => {
      const chunkPath = path.join(chunksDir, name);
      return {
        localPath: chunkPath,
        descriptor: {
          kind: 'audio',
          filename: name,
          mimeType: 'audio/mpeg',
        },
        size: fs.statSync(chunkPath).size,
      };
    })
    .filter((chunk) => chunk.size > 0);

  if (existingChunks.length) {
    return {
      chunks: existingChunks,
      mode: 'ffmpeg-audio-chunks',
      chunksDir,
      originalMimeType: descriptor.mimeType,
      reused: true,
    };
  }

  await runProcess(ffmpegPath, [
    '-hide_banner',
    '-y',
    '-i',
    localPath,
    '-vn',
    '-ac',
    '1',
    '-ar',
    '16000',
    '-b:a',
    '32k',
    '-f',
    'segment',
    '-segment_time',
    '600',
    '-reset_timestamps',
    '1',
    outputPattern,
  ]);

  const chunks = fs.readdirSync(chunksDir)
    .filter((name) => name.toLowerCase().endsWith('.mp3'))
    .sort()
    .map((name) => {
      const chunkPath = path.join(chunksDir, name);
      return {
        localPath: chunkPath,
        descriptor: {
          kind: 'audio',
          filename: name,
          mimeType: 'audio/mpeg',
        },
        size: fs.statSync(chunkPath).size,
      };
    });

  if (!chunks.length) {
    throw new Error('ffmpeg did not create any transcription chunks from this media file.');
  }

  const tooLarge = chunks.find((chunk) => chunk.size > 24 * 1024 * 1024);
  if (tooLarge) {
    throw new Error(`A compressed audio chunk is still ${Math.ceil(tooLarge.size / 1024 / 1024)}MB. This recording needs a lower bitrate or shorter chunks.`);
  }

  return {
    chunks,
    mode: 'ffmpeg-audio-chunks',
    chunksDir,
    originalMimeType: descriptor.mimeType,
  };
}

async function createWhatsAppVideoParts(localPath) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg is not available, so WhatsApp video parts cannot be created automatically.');
  }

  const partsDir = ensureDirectory(path.join(
    mediaInboxDir,
    todayFolderName(),
    'whatsapp-parts',
    sanitizeFileName(path.basename(localPath, path.extname(localPath)))
  ));
  const outputPattern = path.join(partsDir, 'whatsapp-part-%02d.mp4');
  const existingParts = fs.readdirSync(partsDir)
    .filter((name) => name.toLowerCase().endsWith('.mp4'))
    .sort()
    .map((name) => {
      const partPath = path.join(partsDir, name);
      return {
        localPath: partPath,
        filename: name,
        size: fs.statSync(partPath).size,
      };
    })
    .filter((part) => part.size > 0);

  if (existingParts.length) {
    return {
      parts: existingParts,
      partsDir,
      reused: true,
    };
  }

  await runProcess(ffmpegPath, [
    '-hide_banner',
    '-y',
    '-i',
    localPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-b:v',
    '640k',
    '-maxrate',
    '900k',
    '-bufsize',
    '1400k',
    '-c:a',
    'aac',
    '-b:a',
    '64k',
    '-movflags',
    '+faststart',
    '-f',
    'segment',
    '-segment_time',
    '540',
    '-reset_timestamps',
    '1',
    outputPattern,
  ]);

  const parts = fs.readdirSync(partsDir)
    .filter((name) => name.toLowerCase().endsWith('.mp4'))
    .sort()
    .map((name) => {
      const partPath = path.join(partsDir, name);
      return {
        localPath: partPath,
        filename: name,
        size: fs.statSync(partPath).size,
      };
    });

  if (!parts.length) {
    throw new Error('ffmpeg did not create any WhatsApp video parts.');
  }

  return {
    parts,
    partsDir,
  };
}

async function prepareTranscriptionInputs(config, localPath, descriptor) {
  const stats = fs.statSync(localPath);
  const isVideo = /^video\//i.test(String(descriptor.mimeType || ''));
  const shouldExtractAudio = isVideo || (stats.size > config.transcriptionMaxBytes && isAudioVideoMime(descriptor.mimeType));

  if (!shouldExtractAudio && stats.size <= config.transcriptionMaxBytes) {
    return {
      chunks: [{
        localPath,
        descriptor,
        size: stats.size,
      }],
      mode: 'original-file',
    };
  }

  if (!isAudioVideoMime(descriptor.mimeType)) {
    throw new Error(`File is ${Math.ceil(stats.size / 1024 / 1024)}MB. OpenAI transcription upload limit is 25MB, and this file is not marked as audio/video.`);
  }

  return createTranscriptionAudioChunks(localPath, descriptor);
}

async function transcribeSingleMediaWithOpenAI(config, localPath, descriptor) {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured for transcription');
  }

  const stats = fs.statSync(localPath);
  if (stats.size > config.transcriptionMaxBytes) {
    throw new Error(`File is ${Math.ceil(stats.size / 1024 / 1024)}MB. OpenAI transcription upload limit is 25MB; split or compress this video first.`);
  }

  const buffer = fs.readFileSync(localPath);
  const form = new FormData();
  form.append('model', config.openaiTranscriptionModel);
  form.append('file', new Blob([buffer], { type: descriptor.mimeType }), descriptor.filename);

  if (config.openaiTranscriptionModel.includes('diarize')) {
    form.append('response_format', 'diarized_json');
    form.append('chunking_strategy', 'auto');
  } else {
    form.append('response_format', 'json');
    form.append(
      'prompt',
      'This is a Bnei Neviim Academy parent/class update. The audio may mix English and Hebrew. Preserve names, Torah terms, food notes, logistics, student questions, and action items.'
    );
  }

  const timeout = Number.isFinite(config.openaiRequestTimeoutMs)
    ? config.openaiRequestTimeoutMs
    : 10 * 60 * 1000;
  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: form,
    signal: AbortSignal.timeout(timeout),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI transcription ${response.status}: ${body.slice(0, 500)}`);
  }

  return JSON.parse(body);
}

async function transcribeMediaWithOpenAI(config, localPath, descriptor) {
  const prepared = await prepareTranscriptionInputs(config, localPath, descriptor);
  const chunks = [];

  for (let index = 0; index < prepared.chunks.length; index += 1) {
    const chunk = prepared.chunks[index];
    log(`OpenAI transcription chunk ${index + 1}/${prepared.chunks.length}: ${path.relative(repoRoot, chunk.localPath).replace(/\\/g, '/')}`);
    const transcription = await transcribeSingleMediaWithOpenAI(
      config,
      chunk.localPath,
      chunk.descriptor
    );
    log(`OpenAI transcription chunk ${index + 1}/${prepared.chunks.length} complete`);
    chunks.push({
      index: index + 1,
      local_path: path.relative(repoRoot, chunk.localPath).replace(/\\/g, '/'),
      size_bytes: chunk.size,
      transcription,
    });
  }

  const text = chunks
    .map((chunk) => {
      const chunkText = getTranscriptText(chunk.transcription);
      return prepared.chunks.length > 1 ? `[part ${chunk.index}]\n${chunkText}` : chunkText;
    })
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return {
    text,
    chunks,
    processing: {
      mode: prepared.mode,
      chunk_count: chunks.length,
      chunks_dir: prepared.chunksDir
        ? path.relative(repoRoot, prepared.chunksDir).replace(/\\/g, '/')
        : null,
    },
  };
}

async function generateWhatsAppDraft(config, transcriptText, caption) {
  const platformMemory = buildPlatformMemoryContext('whatsapp_update');
  const approvedExamples = await getApprovedOutputExamples(config, 'whatsapp_update', 3);

  const completion = await runConfiguredChatCompletion(config, [
    {
      role: 'system',
      content: [
        'You write short WhatsApp captions for Bnei Neviim Academy parents.',
        'Before drafting, use the brand kit, platform prompt, and approved examples provided by the user message.',
        'Return only the message to copy and paste.',
        'Write in English unless the operator explicitly asks for Hebrew.',
        "Use Shloimie's BNA voice: professional, direct, warm, grounded, parent-friendly, concise, and Torah-aware when the source is Torah-based.",
        'This is not marketing copy. It is a clear parent update from someone serious about Torah, growth, and the whole child.',
        'For a daily class update, begin with "Today at Bnei Neviim Academy:" unless the operator says it will be pasted under a video.',
        'For a weekly recap, begin with "This week at Bnei Neviim Academy:" unless the operator says it will be pasted under a video.',
        'Use plain short bullet points unless a paragraph is clearly better; do not use emojis unless the operator explicitly asks for them.',
        'Lead with the actual learning, discussion, practical message, source, question, class detail, logistics, or tomorrow note.',
        'Ignore operator backend notes, parser/debug comments, task instructions, Codex/system work, dashboard fixes, and technical corrections; do not include them in parent-facing copy.',
        'Do not overhype. Do not invent facts, quotes, sources, outcomes, or student details.',
        'Avoid phrases like "our learners explored", "journey", "special moments", "that is very special", "we are thrilled", "we are excited", "the practical message is simple", and similar marketing language.',
        'Do not write "if Torah really matters, the basics have to support it"; state the sleep, breakfast, food, screens, and routine points directly.',
        'Do not describe the conversation as something you "turned into" another idea. State what was discussed or learned directly.',
        'Do not describe how students felt unless the transcript explicitly says so.',
        'Do not expose private student accountability details.',
        'If the copy will be pasted under an uploaded video, write it like a compact newsletter caption: video-summary bullets first, weekly recap bullets second.',
        'If the transcript has one main message or concern, lead with short bullet points on that main point before listing other updates.',
        'If the transcript also includes other activities, add a separate section called "This week at BNA" or similar.',
        'Do not use meta labels like "Main message from the video" when the message is going under the video.',
        'If the transcript includes logistics like food, breakfast, location, forest, or tomorrow, include those clearly.',
        'If Hebrew names or Torah terms appear, preserve them as best as possible.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        'Caption/instructions:',
        caption || '[none]',
        '',
        'Brand kit and platform memory:',
        platformMemory || '[none]',
        '',
        'Recent approved WhatsApp examples:',
        formatApprovedExamples(approvedExamples),
        '',
        'Transcript:',
        transcriptText.slice(0, 12000),
      ].join('\n'),
    },
  ], {
    purpose: 'WhatsApp summary generation',
    temperature: 0.4,
    maxTokens: 2200,
  });
  return completion.text;
}

async function generateFacebookDraft(config, transcriptText, caption) {
  const platformMemory = buildPlatformMemoryContext('facebook_post');
  const approvedExamples = await getApprovedOutputExamples(config, 'facebook_post', 3);

  const completion = await runConfiguredChatCompletion(config, [
    {
      role: 'system',
      content: [
        'You write Facebook posts for Bnei Neviim Academy.',
        'Use the brand kit, platform prompt, and approved examples provided by the user message.',
        'Return only the Facebook post text.',
        'Write in English unless the operator explicitly asks for Hebrew.',
        "Use Shloimie's BNA voice: professional, grounded, concise, specific, slightly poetic only when it sharpens the truth, and never generic or fluffy.",
        'If the source is about a specific day, begin with "Today at Bnei Neviim Academy, " followed immediately by one concrete detail from the transcript.',
        'If the source covers a full week or multiple recordings, begin with "This week at Bnei Neviim Academy, " followed immediately by one concrete detail from the transcript.',
        'Use 1 to 3 short paragraphs.',
        'Show what happened at BNA with confidence and specificity; do not sound like a brochure or generic school marketing.',
        'Explain the deeper educational point in plain language only after the concrete detail.',
        'Use a final-line CTA only when appropriate: "Contact us to learn more about enrolling."',
        'Do not overhype. Do not invent facts, quotes, sources, outcomes, or student details. Preserve Hebrew names and Torah terms when they appear.',
        'Avoid phrases like "our learners explored", "journey", "special moments", "we are thrilled", "we are excited", and "the practical message is simple".',
        'Do not write "we turned the conversation into..." or similar setup language. Go directly into what was discussed, learned, practiced, or noticed.',
        'Do not describe how students felt unless the transcript explicitly says so.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        'Caption/instructions:',
        caption || '[none]',
        '',
        'Brand kit and platform memory:',
        platformMemory || '[none]',
        '',
        'Recent approved Facebook examples:',
        formatApprovedExamples(approvedExamples),
        '',
        'Transcript:',
        transcriptText.slice(0, 14000),
      ].join('\n'),
    },
  ], {
    purpose: 'Facebook draft generation',
    temperature: 0.45,
    maxTokens: 2200,
  });
  return completion.text;
}

async function generateContentTitle(config, transcriptText, caption, fallbackName) {
  const fallback = String(fallbackName || 'Drive media').replace(/\.[^.]+$/, '').trim();
  if (!config.openaiApiKey || !String(transcriptText || '').trim()) {
    return fallback;
  }

  try {
    const completion = await runConfiguredChatCompletion(config, [
      {
        role: 'system',
        content: 'Create a clear 5 to 9 word internal title for this Bnei Neviim content item. Return only the title. The title must be in English, even if the transcript is Hebrew or another language.',
      },
      {
        role: 'user',
        content: [
          'Operator instruction:',
          caption || '[none]',
          '',
          'Transcript excerpt:',
          String(transcriptText || '').slice(0, 5000),
        ].join('\n'),
      },
    ], {
      purpose: 'content title generation',
      temperature: 0.2,
      maxTokens: 80,
    });
    return String(completion.text || fallback)
      .replace(/^["']|["']$/g, '')
      .trim()
      .slice(0, 120) || fallback;
  } catch (error) {
    log(`Content title generation skipped: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

async function describeImageWithOpenAI(config, localPath, caption = '') {
  const mimeType = detectLocalFileDescriptor(localPath).mimeType || 'image/jpeg';
  const imageBuffer = fs.readFileSync(localPath);
  const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

  try {
    const completion = await runConfiguredChatCompletion(config, [
      {
        role: 'system',
        content: [
          'Describe this Bnei Neviim Academy image for an internal content pipeline.',
          'Return a concise but useful description: what is visible, likely setting, people/activity if clear, and any useful context for WhatsApp or Facebook reuse.',
          'Do not identify people by name unless the caption explicitly names them.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Operator caption/instructions:\n${caption || '[none]'}` },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ], {
      purpose: 'image description',
      temperature: 0.25,
      maxTokens: 900,
    });
    return completion.text;
  } catch (error) {
    if (String(caption || '').trim()) {
      log(`Image description provider failed; using caption fallback: ${error instanceof Error ? error.message : String(error)}`);
      return `Operator image caption/instructions: ${caption.trim()}`;
    }
    throw error;
  }
}

function shouldPublishImageToWebsite(caption = '') {
  const normalized = String(caption || '').toLowerCase();
  return /\b(website image|website images|learning moment|learning moments|homepage image|homepage slider|image slider|public website|publish image|post image to website|load image onto the website|add image to website)\b/.test(normalized)
    && !/\b(do not|don't|dont|hold|wait|not yet|draft only|candidate only)\b/.test(normalized);
}

function titleFromImageFilename(fileName = '') {
  const withoutExtension = path.basename(String(fileName || 'learning moment'), path.extname(String(fileName || '')));
  const cleaned = withoutExtension
    .replace(/^\d{8}[_-]\d{6}[_-]?/g, '')
    .replace(/^(img|image|photo|pxl|dsc|drive)[_-]*/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const title = cleaned || 'BNA learning moment';
  return title.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 90);
}

function websiteMomentDisplayDate(file = {}) {
  const rawDate = file.createdTime || file.modifiedTime || new Date().toISOString();
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

async function buildWebsiteMomentMetadata(config, localPath, driveFile, caption = '') {
  const fallbackTitle = titleFromImageFilename(driveFile?.name || path.basename(localPath));
  const fallback = {
    title: fallbackTitle,
    description: 'A Bnei Neviim Academy learning moment from the website image intake.',
    alt: `${fallbackTitle} at Bnei Neviim Academy`,
    date: websiteMomentDisplayDate(driveFile),
  };

  if (!config.openaiApiKey) return fallback;

  try {
    const description = await describeImageWithOpenAI(config, localPath, [
      caption || 'Website learning-moment image intake.',
      'Use this for internal website image metadata. Keep it factual and do not identify people by name unless the caption names them.',
    ].join(' '));
    return {
      ...fallback,
      description: description ? description.slice(0, 420) : fallback.description,
      alt: description ? excerptText(description, 130) : fallback.alt,
    };
  } catch (error) {
    log(`Website image metadata fallback used: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function excerptText(value, maxLength = 160) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim()}...`;
}

async function addLearningMomentImage(localPath, metadata) {
  const relativeSource = path.relative(repoRoot, localPath).replace(/\\/g, '/');
  const result = await runProcess(process.execPath, [
    'scripts/add-learning-moment-image.mjs',
    '--source',
    relativeSource,
    '--title',
    metadata.title,
    '--description',
    metadata.description,
    '--alt',
    metadata.alt,
    '--date',
    metadata.date,
  ], { timeoutMs: 120000 });
  const parsed = parseJsonSummary(result.stdout);
  if (!parsed?.success) {
    throw new Error(`Learning Moments image script did not return success: ${result.stdout || result.stderr}`);
  }
  return parsed;
}

async function publishDriveImageToWebsiteMoments(config, {
  drive,
  pipelineConfig,
  driveFile,
  caption = '',
  sourceLabel = 'Website Images intake',
} = {}) {
  const localPath = await downloadDriveFileToMediaInbox(drive, driveFile);
  const descriptor = detectLocalFileDescriptor(localPath);
  if (!isImageMime(descriptor.mimeType)) {
    throw new Error(`${driveFile?.name || 'Drive file'} is not an image file`);
  }

  const metadata = await buildWebsiteMomentMetadata(config, localPath, driveFile, caption);
  const published = await addLearningMomentImage(localPath, metadata);
  const approvedFolderId = pipelineConfig?.simplifiedFolders?.approvedAssets
    || pipelineConfig?.stages?.['10 Approved']
    || pipelineConfig?.stages?.['11 Published'];
  let moved = null;
  if (approvedFolderId) {
    moved = await moveDriveFile(drive, driveFile, approvedFolderId);
  }

  const memoryLines = [
    `Picked up ${driveFile.name} from Drive ${sourceLabel}.`,
    `Downloaded to ${path.relative(repoRoot, localPath).replace(/\\/g, '/')}.`,
    `Published website Learning Moment image: ${published.image}.`,
    `Updated ${path.relative(repoRoot, publicLearningMomentsFeedFile).replace(/\\/g, '/')}.`,
    approvedFolderId ? 'Moved Drive original to 30 Approved Website Assets.' : 'Drive approved-assets folder was not configured; original was not moved.',
  ];
  appendMemoryEntry('Website Image Intake', memoryLines.join('\n'), {
    drive_file_id: driveFile.id,
    image: published.image,
    moved_to: moved?.parents?.join(',') || approvedFolderId || '',
  });

  return {
    localPath,
    metadata,
    published,
    moved,
    lines: memoryLines,
  };
}

function detectWeeklyReportIntent(text) {
  const normalized = String(text || '').toLowerCase();
  const wantsReport = /\b(end[-\s]?of[-\s]?week|weekly|week\s+update|newsletter|parent\s+update|letter|report)\b/.test(normalized);
  const mentionsSource = /\b(transcript|recording|class|shiur|uploaded|drive|weber|torah|what\s+we\s+learned)\b/.test(normalized);
  const directTranscriptAsk = /\b(take|use|look at|pull from|go to)\b[\s\S]{0,80}\b(transcript|recording|class recording)\b/.test(normalized)
    && /\b(end|week|newsletter|parent\s+update|letter|report|what\s+we\s+learned)\b/.test(normalized);
  const organizeWeeklyRecordings = /\b(organize|arrange|pull together|put together|summarize|review|use)\b[\s\S]{0,120}\b(recordings?|transcripts?|audios?|videos?|content)\b[\s\S]{0,80}\b(this week|week|weekly)\b/.test(normalized)
    || /\b(all|every)\b[\s\S]{0,50}\b(recordings?|transcripts?|audios?|videos?)\b[\s\S]{0,80}\b(this week|week|weekly)\b/.test(normalized);
  const wantsErevShabbosMessage = /\b(?:erev|eruv|arab)\s+shabb(?:os|at)\b/.test(normalized)
    || /\bshabb(?:os|at)\s+(?:message|update|whatsapp|whats\s*app)\b/.test(normalized)
    || /\bparsha\s+(?:message|update|whatsapp|whats\s*app|summary)\b/.test(normalized);
  const wantsWhatsappParentMessage = /\b(?:whatsapp|whats\s*app)\b/.test(normalized)
    && /\b(?:message|update|copy|draft|parents?|group)\b/.test(normalized);
  const weeklyLearningContext = /\b(?:this|last|past)\s+week\b/.test(normalized)
    || /\bwhat\s+we\s+learned\b/.test(normalized)
    || /\b(last\s+(?:little\s+)?video\s+message|last\s+message)\b/.test(normalized)
    || /\bparsha\b/.test(normalized);
  return (wantsReport && mentionsSource)
    || directTranscriptAsk
    || organizeWeeklyRecordings
    || (wantsErevShabbosMessage && (mentionsSource || weeklyLearningContext))
    || (wantsWhatsappParentMessage && weeklyLearningContext);
}

function parseRequestedContentJobId(text) {
  const match = String(text || '').match(/\b(?:content\s*)?job\s*#?\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function parseJobDate(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : 0;
}

async function getContentJobs(config) {
  const data = await appRequest(config, 'GET', '/api/bna/content-jobs');
  return Array.isArray(data?.jobs) ? data.jobs : [];
}

function contentJobHasTranscript(job) {
  return String(job?.transcript_text || '').trim().length > 0;
}

function isSeparateOneTimeContentJob(job) {
  const haystack = [
    job?.title,
    job?.caption,
    job?.notes,
    job?.parse_json ? JSON.stringify(job.parse_json) : '',
  ].filter(Boolean).join(' ').toLowerCase();
  return /\b(one time|rabbi elie|elie scheller|elie sheller|scheller|sheller|micro school|micro-school|mission of learning)\b/.test(haystack);
}

function wantsOneTimeContent(text) {
  return /\b(one time|rabbi elie|scheller|sheller|micro school|mishnah class)\b/i.test(String(text || ''));
}

function weeklyReportWindowDays(text) {
  const match = String(text || '').match(/\b(?:last|past)\s+(\d{1,2})\s+days?\b/i);
  if (match) return Math.max(1, Math.min(30, Number(match[1])));
  return 8;
}

function selectWeeklyTranscriptJobs(jobs, text) {
  const includeOneTime = wantsOneTimeContent(text);
  const windowMs = weeklyReportWindowDays(text) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const withTranscripts = jobs
    .filter((job) => contentJobHasTranscript(job))
    .filter((job) => String(job.status || '') !== 'archived')
    .filter((job) => includeOneTime || !isSeparateOneTimeContentJob(job))
    .sort((a, b) => parseJobDate(b.created_at || b.updated_at) - parseJobDate(a.created_at || a.updated_at));

  const recent = withTranscripts.filter((job) => {
    const date = parseJobDate(job.created_at || job.updated_at);
    return date && now - date <= windowMs;
  });

  return (recent.length ? recent : withTranscripts.slice(0, 8)).slice(0, 12);
}

async function selectContentJobsForWeeklyReport(config, text) {
  const jobs = await getContentJobs(config);
  const requestedId = parseRequestedContentJobId(text);
  if (requestedId) {
    const requested = jobs.find((job) => Number(job.id) === requestedId);
    return requested ? [requested] : [];
  }

  return selectWeeklyTranscriptJobs(jobs, text);
}

function formatContentJobContext(job, index, maxTranscriptChars = 10000) {
  return [
    `Recording ${index + 1}: content job #${job.id} - ${job.title || 'Untitled'}`,
    job.created_at ? `Uploaded: ${job.created_at}` : '',
    job.caption ? `Caption/instruction: ${job.caption}` : '',
    job.drive_stage ? `Drive stage: ${job.drive_stage}` : '',
    'Structured summary:',
    formatJobSummaryForPrompt(job),
    '',
    'Transcript excerpt:',
    String(job.transcript_text || '').slice(0, maxTranscriptChars),
  ].filter(Boolean).join('\n');
}

function formatWeeklyJobsForPrompt(jobs, maxTotalChars = 90000) {
  let remaining = maxTotalChars;
  const sections = [];
  jobs.forEach((job, index) => {
    if (remaining <= 0) return;
    const perJobLimit = Math.max(3500, Math.floor(remaining / Math.max(1, jobs.length - index)));
    const section = formatContentJobContext(job, index, perJobLimit);
    sections.push(section.slice(0, remaining));
    remaining -= section.length + 6;
  });
  return sections.join('\n\n---\n\n');
}

function formatJobSummaryForPrompt(job) {
  const parsed = job?.parse_json || {};
  const summary = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
  return summary && summary !== '{}' ? summary : '[no structured summary available]';
}

async function generateWeeklyReportDraft(config, jobsInput, operatorInstruction) {
  const jobs = (Array.isArray(jobsInput) ? jobsInput : [jobsInput]).filter(Boolean);
  if (!jobs.length || !jobs.some(contentJobHasTranscript)) {
    throw new Error('No selected content jobs have transcripts yet.');
  }

  const completion = await runConfiguredChatCompletion(config, [
    {
      role: 'system',
      content: [
        'You write parent-facing Bnei Neviim Academy weekly newsletters.',
        'Use the transcript as the factual source. Do not invent details.',
        'Bnei Neviim Academy is in Beit Shemesh, Israel; use Israel school context and Israel Parsha assumptions unless the operator explicitly says otherwise.',
        'Use all provided recordings. The first recording is usually the newest/latest recording; give it proper attention if the operator mentions the last video.',
        'Write in English unless the operator explicitly asks for Hebrew.',
        "Preserve Jewish terms naturally: Torah, Hashem, Har Sinai, naaseh v'nishma, Moshe Rabbeinu, gaavah, anavah.",
        "Use Shloimie's BNA voice: calm, direct, honest, parent-friendly, Torah-aware, practical, concise, and slightly poetic only where useful.",
        'Begin with a short opening paragraph that starts: "This week at Bnei Neviim Academy, " and includes a concrete learning theme or class detail.',
        'Use the format Subject, Preheader, What we learned, What stood out, Growth we are building, A few practical notes, and Closing unless the operator asks for WhatsApp-only copy.',
        'For Erev Shabbos, Shabbos, Parsha, or WhatsApp-only requests, write a concise WhatsApp message: latest video summary first when requested, then what the boys learned, then actual class questions.',
        'Use actual topics, sources, questions, discussions, class moments, logistics, and practical notes.',
        'No generic newsletter language, vague summaries, fluffy encouragement, or school-brochure language.',
        'Avoid phrases like "our learners explored", "special moments", "amazing journey", "we are thrilled", "we are excited", and "the practical message is simple".',
        'Do not write "we turned the conversation into..." or similar setup language. State what happened directly.',
        'Do not expose private student accountability details.',
        'If the operator gives a Masmid of the Week note, include it as a positive parent-facing shout-out.',
        'Return only the final message to copy and paste.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Operator instruction: ${operatorInstruction || '[none]'}`,
        '',
        `Content jobs included: ${jobs.map((job) => `#${job.id} ${job.title || 'Untitled'}`).join('; ')}`,
        '',
        'Weekly recordings, summaries, and transcripts:',
        formatWeeklyJobsForPrompt(jobs),
      ].join('\n'),
    },
  ], {
    purpose: 'weekly report generation',
    temperature: 0.45,
    maxTokens: 2200,
  });
  return completion.text;
}

function detectWeeklyTranscriptTopicIntent(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;

  const operationalSystemAsk = /\b(dashboard|operations|system|task|tasks|queue|queued|pending|section|sections|buttons?|actions?|accountability|students?|contacts?|communications?|whatsapp|accounting|payments?|devices?|tablet|codex|agent|fleet|logistics|scheduling|status|updates?|audit|order|sort|brainstorm)\b/.test(normalized);
  const explicitTranscriptSource = /\b(transcripts?|recordings?|audios?|videos?|content jobs?|class recordings?|class transcript|raw transcript)\b/.test(normalized);
  const explicitClassContentAsk = /\b(class content|torah topics?|learning topics?|what we learned|covered in class|sources?|pesukim|parsha|shiur topics?)\b/.test(normalized);
  const mentionsSource = /\b(transcripts?|recordings?|audios?|videos?|content jobs?|all the files|all of them|whole week|this week|rest of the week)\b/.test(normalized);
  const asksForTopics = /\b(list|go through|actual things|topics?|covered|learned|what we learned|discussed|class report|all notes|everything we learned)\b/.test(normalized);
  const asksForFinalDraft = /\b(newsletter|parent update|whatsapp|facebook|post|copy block|caption|draft)\b/.test(normalized);

  if (operationalSystemAsk && !(explicitTranscriptSource && explicitClassContentAsk)) return false;
  return mentionsSource && asksForTopics && !asksForFinalDraft;
}

async function generateWeeklyTranscriptTopicInventory(config, jobsInput, operatorInstruction) {
  const jobs = (Array.isArray(jobsInput) ? jobsInput : [jobsInput]).filter(Boolean);
  if (!jobs.length || !jobs.some(contentJobHasTranscript)) {
    throw new Error('No selected content jobs have transcripts yet.');
  }

  const detailed = /\b(detailed|all notes|class report|everything|all of them|all the topics)\b/i.test(String(operatorInstruction || ''));
  const completion = await runConfiguredChatCompletion(config, [
    {
      role: 'system',
      content: [
        'You create factual topic inventories from Bnei Neviim Academy class transcripts.',
        'Use every provided transcript and structured summary. Do not invent details.',
        'Return the actual answer directly. Do not ask the operator to pick a format or answer a follow-up question.',
        'Write in English. Preserve Jewish/Torah terms naturally when they appear, but do not over-polish into marketing copy.',
        'Separate real learning topics from operations, logistics, student accountability, payments, and private admin details.',
        detailed
          ? 'Use a detailed class-report structure with headings, sub-bullets, questions discussed, sources/topics mentioned, and practical themes.'
          : 'Use concise bullet points grouped by topic.',
        'Keep it useful for turning into a parent update later, but do not write the parent update unless asked.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Operator instruction: ${operatorInstruction || '[none]'}`,
        '',
        `Content jobs included: ${jobs.map((job) => `#${job.id} ${job.title || 'Untitled'}`).join('; ')}`,
        '',
        'Weekly recordings, summaries, and transcripts:',
        formatWeeklyJobsForPrompt(jobs, 110000),
      ].join('\n'),
    },
  ], {
    purpose: 'transcript topic generation',
    temperature: 0.25,
    maxTokens: 2200,
  });
  return completion.text;
}

async function handleWeeklyTranscriptTopicRequest(config, msg, forcedInstruction = '') {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = forcedInstruction || getTelegramMessageText(msg);

  if (!detectWeeklyTranscriptTopicIntent(text)) {
    return false;
  }

  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  let jobs = [];
  try {
    jobs = await selectContentJobsForWeeklyReport(config, text);
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `I tried to pull the transcript jobs, but the dashboard API failed: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
    return true;
  }

  if (!jobs.length) {
    await sendReply(
      config.botToken,
      chatId,
      'I do not see transcribed recordings for this week yet. Drop recordings into Drive Raw Media Intake and run /ingest_drive first.',
      messageId
    );
    return true;
  }

  try {
    const inventory = await generateWeeklyTranscriptTopicInventory(config, jobs, text);
    appendMemoryEntry('Weekly Transcript Topic Inventory', inventory, {
      chat_id: chatId,
      message_id: messageId,
      content_job_ids: jobs.map((job) => job.id).join(','),
      provider: 'OpenAI',
    });
    appendAgentTaskLedger({
      event: 'weekly_transcript_topics_generated',
      source: 'telegram',
      chat_id: chatId,
      message_id: messageId,
      task_id: null,
      title: 'Generate weekly transcript topic inventory',
      notes: `Generated in-chat topic inventory through OpenAI from content jobs ${jobs.map((job) => `#${job.id}`).join(', ')}. No Codex task was created.`,
      stage: 'done',
      category: 'content',
      assigned_to: 'OpenAI',
    });

    await sendReply(
      config.botToken,
      chatId,
      [
        `Here is the topic inventory from ${jobs.length} transcript${jobs.length === 1 ? '' : 's'}:`,
        '',
        inventory,
      ].join('\n'),
      messageId
    );
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `I found ${jobs.length} transcript${jobs.length === 1 ? '' : 's'}, but generating the topic inventory failed: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
  }

  return true;
}

async function upsertContentOutput(config, job, outputType, fields) {
  const outputs = Array.isArray(job?.outputs) ? job.outputs : [];
  const existing = outputs.find((output) => output.output_type === outputType && output.status !== 'archived');
  if (existing?.id) {
    const result = await appRequest(config, 'PATCH', `/api/bna/content-outputs/${existing.id}`, fields);
    return result?.output;
  }

  const result = await appRequest(config, 'POST', `/api/bna/content-jobs/${job.id}/outputs`, {
    output_type: outputType,
    ...fields,
  });
  return result?.output;
}

async function handleWeeklyReportRequest(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);

  if (!detectWeeklyReportIntent(text)) {
    return false;
  }

  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  let jobs = [];
  try {
    jobs = await selectContentJobsForWeeklyReport(config, text);
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `I tried to pull the content jobs, but the dashboard API failed: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
    return true;
  }

  if (!jobs.length) {
    await sendReply(
      config.botToken,
      chatId,
      'I do not see transcribed recordings for this week yet. Drop recordings into Drive Raw Media Intake and run /ingest_drive, then ask for the weekly report again.',
      messageId
    );
    return true;
  }

  try {
    const draft = await generateWeeklyReportDraft(config, jobs, text);
    const primaryJob = jobs[0];
    const output = await upsertContentOutput(config, primaryJob, 'weekly_newsletter', {
      title: `End-of-week parent update from ${jobs.length} recording${jobs.length === 1 ? '' : 's'}`,
      body: draft,
      platform: 'whatsapp',
      status: 'needs_approval',
      metadata: {
        source: 'telegram_direct_weekly_report',
        job_ids: jobs.map((job) => job.id),
        source_message_id: messageId,
        source_chat_id: chatId,
        generated_at: new Date().toISOString(),
      },
    });

    appendMemoryEntry('Weekly Report Draft', draft, {
      chat_id: chatId,
      message_id: messageId,
      content_job_ids: jobs.map((job) => job.id).join(','),
      output_id: output?.id,
    });

    await sendContentApproval(config.botToken, chatId, messageId, {
      outputId: output?.id,
      jobId: primaryJob.id,
      body: draft,
      heading: `End-of-week update from ${jobs.length} recording${jobs.length === 1 ? '' : 's'}:`,
      approveLabel: 'Approve Update',
    });
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `I found ${jobs.length} transcribed recording${jobs.length === 1 ? '' : 's'}, but generating the weekly report failed: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
  }

  return true;
}

function safeJsonValue(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function contentOutputTypeLabel(outputType) {
  return ({
    whatsapp_update: 'WhatsApp update',
    facebook_post: 'Facebook post',
    weekly_newsletter: 'weekly newsletter',
    blog_draft: 'website blog draft',
    linkedin_post: 'LinkedIn post',
    youtube_description: 'YouTube description',
    google_business_post: 'Google Business post',
    daily_report: 'daily report',
    parent_email: 'parent email',
    teaching_philosophy_note: 'teaching philosophy note',
    short_clip: 'short clip packaging',
  })[outputType] || 'content draft';
}

function platformForContentOutputType(outputType) {
  return ({
    whatsapp_update: 'whatsapp',
    facebook_post: 'facebook',
    weekly_newsletter: 'email',
    blog_draft: 'website',
    linkedin_post: 'linkedin',
    youtube_description: 'youtube',
    google_business_post: 'google_business',
    daily_report: 'internal',
    parent_email: 'email',
    teaching_philosophy_note: 'teaching_philosophy',
    short_clip: 'short_clip',
  })[outputType] || null;
}

function parseContentOutputTypeFromText(text, fallbackText = '') {
  return parseContentOutputTypeFromTextCore(text, fallbackText);
}

function parseContentOutputIdFromText(text) {
  const value = String(text || '');
  const explicit = value.match(/\b(?:content\s*)?output\s*#?\s*(\d+)\b/i)
    || value.match(/\b(?:content\s*)?draft\s*#?\s*(\d+)\b/i);
  if (explicit) return Number(explicit[1]);
  if (/\b(output|draft|facebook|whatsapp|newsletter|blog|post)\b/i.test(value)) {
    const loose = value.match(/#\s*(\d+)\b/);
    if (loose) return Number(loose[1]);
  }
  return null;
}

function parseReplyContentOutputId(msg) {
  return parseContentOutputIdFromText(msg?.reply_to_message?.text || msg?.reply_to_message?.caption || '');
}

function parseReplyContentJobId(msg) {
  const replyText = String(msg?.reply_to_message?.text || msg?.reply_to_message?.caption || '');
  const match = replyText.match(/\bContent job\s+#?\s*(\d+)\b/i)
    || replyText.match(/\bSaved in Content job\s+#?\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function isDraftLikeReply(msg) {
  const replyText = String(msg?.reply_to_message?.text || msg?.reply_to_message?.caption || '');
  return /\b(Content output #\d+|Saved in Content job|WhatsApp copy draft|Facebook post draft|Website blog draft|weekly update|newsletter draft|Approve this text)\b/i.test(replyText);
}

function looksLikeContentRevisionFollowup(text, replyText = '') {
  const normalized = `${text || ''}\n${replyText || ''}`.toLowerCase();
  const structureInstruction = /\b(first section|next section|second section|underneath|at the top|date on top|copy block|one block|bullet points?|bullets?|emojis?|shout[-\s]?out|section should|should be just|structure it)\b/.test(normalized);
  const contentSubject = /\b(this video|last video|recordings?|transcripts?|what we learned this week|learned this week|weekly|newsletter|whatsapp|post|parent update|parsha|parshas|torah|masmid|learner of the week|hebrew words?|spell.*hebrew|use hebrew|gaava|pride|orchos|tzadikim|shelach)\b/.test(normalized);
  const correctionTone = /^\s*(no|no so|okay|ok|yeah|yes|right|also)\b/i.test(String(text || ''))
    || /\b(i want|you have to|don't|do not|instead|make it|change it|fix it)\b/i.test(String(text || ''));
  const hasEditShape = /\b(should|want|need|make|use|write|spell|add|include|remove|change|fix|structure)\b/i.test(String(text || ''));

  return Boolean(contentSubject && (structureInstruction || correctionTone) && hasEditShape);
}

function detectContentDraftEditIntent(msg) {
  const text = getTelegramMessageText(msg);
  const replyText = String(msg?.reply_to_message?.text || msg?.reply_to_message?.caption || '');
  const combined = `${text}\n${replyText}`;
  const lower = combined.toLowerCase();
  const contentFollowup = looksLikeContentRevisionFollowup(text, replyText);
  const editVerb = /\b(edit|revise|rewrite|change|fix|shorten|tighten|clean up|adjust|polish|redo|regenerate|make it|make this|make the|less fluffy|more concise|more direct|add|include|remove|take out|get rid)\b/.test(lower)
    || contentFollowup;
  if (!editVerb) return null;

  const outputId = parseContentOutputIdFromText(text) || parseReplyContentOutputId(msg);
  const jobId = parseRequestedContentJobId(text) || parseReplyContentJobId(msg);
  const outputType = parseContentOutputTypeFromText(text, replyText);
  const draftLikeReply = isDraftLikeReply(msg);
  const draftEvidence = Boolean(outputId || jobId || outputType || contentFollowup || /\b(draft|post|newsletter|facebook|whatsapp|blog|caption|copy block|copy-paste|content output)\b/i.test(combined) || draftLikeReply);
  if (!draftEvidence) return null;

  if (shouldBlockContentDraftEditIntent({
    text,
    replyText,
    outputId,
    jobId,
    outputType,
    contentFollowup,
    draftLikeReply,
  })) {
    return null;
  }

  const devOnly = /\b(telegram bot|bridge|codex|repo|server|database|railway|code|implementation)\b/i.test(text)
    && !/\b(facebook|whatsapp|newsletter|blog|draft|post|caption|copy)\b/i.test(text);
  if (devOnly) return null;

  return { outputId, jobId, outputType, contentFollowup };
}

function latestOutputSort(a, b) {
  return Date.parse(b.output.updated_at || b.output.created_at || 0) - Date.parse(a.output.updated_at || a.output.created_at || 0);
}

function sourceJobsForOutputFromJobs(allJobs, selectedJob, output) {
  const metadata = safeJsonValue(output?.metadata, {});
  const ids = new Set([
    selectedJob?.id,
    output?.job_id,
    ...(Array.isArray(metadata.job_ids) ? metadata.job_ids : []),
    ...(Array.isArray(metadata.requested_job_ids) ? metadata.requested_job_ids : []),
  ].map(Number).filter(Boolean));
  const sourceJobs = allJobs
    .filter((job) => ids.has(Number(job.id)))
    .sort((a, b) => parseJobDate(b.created_at || b.updated_at) - parseJobDate(a.created_at || a.updated_at));
  return sourceJobs.length ? sourceJobs : [selectedJob].filter(Boolean);
}

function withSourceJobs(allJobs, selected) {
  if (!selected) return selected;
  return {
    ...selected,
    sourceJobs: sourceJobsForOutputFromJobs(allJobs, selected.job, selected.output),
  };
}

async function selectContentOutputForEdit(config, intent) {
  const jobs = await getContentJobs(config);
  const outputs = jobs
    .flatMap((job) => (Array.isArray(job.outputs) ? job.outputs : []).map((output) => ({ job, output })))
    .filter(({ output }) => output?.id && String(output.status || '') !== 'archived' && String(output.body || '').trim());

  if (intent.outputId) {
    const exact = outputs.find(({ output }) => Number(output.id) === Number(intent.outputId));
    if (!exact) throw new Error(`Content output #${intent.outputId} was not found or has no saved body.`);
    return withSourceJobs(jobs, exact);
  }

  let candidates = outputs;
  if (intent.jobId) {
    candidates = candidates.filter(({ job }) => Number(job.id) === Number(intent.jobId));
  }
  if (intent.outputType) {
    candidates = candidates.filter(({ output }) => output.output_type === intent.outputType);
  }

  if (!candidates.length && intent.outputType) {
    candidates = outputs.filter(({ output }) => output.output_type === intent.outputType);
  }
  if (!candidates.length && intent.jobId) {
    candidates = outputs.filter(({ job }) => Number(job.id) === Number(intent.jobId));
  }
  if (!candidates.length) {
    throw new Error('I could not find a saved content draft to edit. Mention an output number, like "edit output #39", or reply to a draft message.');
  }

  return withSourceJobs(jobs, candidates.sort(latestOutputSort)[0]);
}

function buildDraftRevisionSystemPrompt(outputType) {
  const label = contentOutputTypeLabel(outputType);
  return [
    `You revise saved ${label} drafts for Bnei Neviim Academy.`,
    'You are editing an existing draft, not creating a coding task.',
    'Apply the operator instruction directly and preserve the factual content unless the instruction says to remove it.',
    'Do not invent new facts, dates, names, student details, payments, or claims.',
    'Write in English unless the operator explicitly asks otherwise.',
    'Keep the voice direct, warm, useful, and not corny or fluffy.',
    'If the instruction says shorter, actually shorten it. If it says add a section, add only that section using the provided source context.',
    'Return only the revised final text. Do not include explanations, headings like "Here is", markdown fences, or status notes.',
  ].join(' ');
}

async function reviseContentDraftWithProvider(provider, { output, job, sourceJobs = [], instruction, platformMemory, approvedExamples }) {
  const metadata = safeJsonValue(output.metadata, {});
  const sourceJobIds = Array.isArray(metadata.job_ids) ? metadata.job_ids.join(', ') : '';
  const jobsForContext = sourceJobs.length ? sourceJobs : [job].filter(Boolean);
  const jobContext = [
    sourceJobIds ? `Original selected job IDs: ${sourceJobIds}` : '',
    formatWeeklyJobsForPrompt(jobsForContext, output.output_type === 'weekly_newsletter' ? 90000 : 50000),
  ].filter(Boolean).join('\n\n');

  return runChatApiProvider(provider, [
    { role: 'system', content: buildDraftRevisionSystemPrompt(output.output_type) },
    {
      role: 'user',
      content: [
        'Operator edit instruction:',
        instruction,
        '',
        `Saved output #${output.id} (${contentOutputTypeLabel(output.output_type)}):`,
        output.body,
        '',
        'Source/context:',
        jobContext || '[no source context available]',
        '',
        'Brand/platform memory:',
        platformMemory || '[none]',
        '',
        'Approved examples:',
        formatApprovedExamples(approvedExamples),
      ].join('\n'),
    },
  ]);
}

async function reviseContentDraft(config, { output, job, sourceJobs = [], instruction }) {
  const platformMemory = buildPlatformMemoryContext(output.output_type);
  const approvedExamples = await getApprovedOutputExamples(config, output.output_type, 3);
  const providers = apiProviderConfigs(config);

  const errors = [];
  for (const provider of providers) {
    try {
      const body = await reviseContentDraftWithProvider(provider, {
        output,
        job,
        sourceJobs,
        instruction,
        platformMemory,
        approvedExamples,
      });
      return {
        provider: provider.label,
        providerKind: provider.kind,
        body: String(body || '').trim(),
        errors,
      };
    } catch (error) {
      errors.push(`${provider.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`No content edit provider succeeded. ${errors.join(' | ') || 'No OpenAI/Kimi API key configured.'}`);
}

function approvalLabelsForOutput(outputType) {
  if (outputType === 'facebook_post') {
    return { approveLabel: 'Save Final Draft', publishLabel: 'Commit to Buffer Draft' };
  }
  if (outputType === 'linkedin_post' || outputType === 'youtube_description') {
    return { approveLabel: 'Save Final Draft', publishLabel: 'Commit to Buffer Draft' };
  }
  if (outputType === 'blog_draft') {
    return { approveLabel: 'Approve Blog', publishLabel: 'Publish Blog' };
  }
  if (outputType === 'weekly_newsletter') {
    return { approveLabel: 'Approve Update', publishLabel: '' };
  }
  return { approveLabel: 'Approve Text', publishLabel: '' };
}

function detectContentApprovalTextIntent(msg) {
  const text = getTelegramMessageText(msg);
  const replyText = String(msg?.reply_to_message?.text || msg?.reply_to_message?.caption || '');
  const combined = `${text}\n${replyText}`;
  const lowerText = text.toLowerCase();
  const commitToScheduler = hasContentCommitToSchedulingIntent(text, replyText);
  const publishNow = hasPublicPublishNowIntent(text, replyText);
  const approveVerb = /\b(approve|approved|save|saved|final version|last version|final draft|looks good|i like this|use this|keep this|save this as (an )?example|save as (an )?example|mark approved|this is good)\b/.test(lowerText)
    || commitToScheduler
    || publishNow;
  if (!approveVerb) return null;

  const outputId = parseContentOutputIdFromText(text) || parseReplyContentOutputId(msg);
  const jobId = parseRequestedContentJobId(text) || parseReplyContentJobId(msg);
  const outputType = parseContentOutputTypeFromText(text, replyText);
  const draftEvidence = Boolean(outputId || jobId || outputType || isDraftLikeReply(msg) || /\b(draft|post|newsletter|facebook|whatsapp|blog|caption|copy block|content output)\b/i.test(combined));
  if (!draftEvidence) return null;

  return {
    outputId,
    jobId,
    outputType,
    commitToScheduler,
    publishNow,
  };
}

async function handleContentApprovalTextRequest(config, msg) {
  const intent = detectContentApprovalTextIntent(msg);
  if (!intent) return false;

  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;

  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  try {
    const { job, output } = await selectContentOutputForEdit(config, intent);
    if (intent.commitToScheduler || intent.publishNow) {
      const result = await appRequest(config, 'POST', `/api/bna/content-outputs/${output.id}/actions`, {
        action: 'approve_publish',
        publishNow: Boolean(intent.publishNow),
      });
      await sendReply(
        config.botToken,
        chatId,
        [
          intent.publishNow
            ? `${contentOutputTypeLabel(output.output_type)} #${output.id} approved and published.`
            : `${contentOutputTypeLabel(output.output_type)} #${output.id} committed to Buffer as a draft.`,
          result?.message || 'The output is approved and filed in the content system.',
        ].join('\n'),
        messageId
      );
      return true;
    }

    const result = await appRequest(config, 'PATCH', `/api/bna/content-outputs/${output.id}`, {
      status: 'approved',
    });
    const updatedOutput = result?.output || output;
    const promotedPath = appendApprovedOutputExample(updatedOutput);
    if (promotedPath) {
      runDriveMemorySync('push-memory').catch((error) => {
        log(`Approved example Drive push failed: ${error instanceof Error ? error.message : String(error)}`);
      });
    }

    appendMemoryEntry('Content Draft Approved', String(updatedOutput.body || '').slice(0, 5000), {
      chat_id: chatId,
      message_id: messageId,
      content_job_id: job.id,
      output_id: output.id,
    });
    appendAgentTaskLedger({
      event: 'content_draft_approved',
      source: 'telegram',
      chat_id: chatId,
      message_id: messageId,
      title: `Approve ${contentOutputTypeLabel(output.output_type)} output #${output.id}`,
      notes: `Marked saved Content output #${output.id} approved and saved it as a prompt example when possible.`,
      stage: 'done',
      category: 'content',
      assigned_to: 'OpenAI',
    });

    await sendReply(
      config.botToken,
      chatId,
      [
        `Saved as approved ${contentOutputTypeLabel(output.output_type)} #${output.id}.`,
        promotedPath ? `Also saved as a reusable local example: ${promotedPath}.` : 'Also saved as a reusable backend prompt example.',
        'Future drafts can learn from this version.',
      ].join('\n'),
      messageId
    );
    return true;
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `I tried to approve/save the content draft, but it failed: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
    return true;
  }
}

async function handleContentDraftEditRequest(config, msg) {
  const intent = detectContentDraftEditIntent(msg);
  if (!intent) return false;

  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const instruction = getTelegramMessageText(msg);

  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  try {
    const { job, output, sourceJobs = [] } = await selectContentOutputForEdit(config, intent);
    const previousMetadata = safeJsonValue(output.metadata, {});
    const revision = await reviseContentDraft(config, { output, job, sourceJobs, instruction });
    const nextMetadata = {
      ...previousMetadata,
      revised_at: new Date().toISOString(),
      revision_source: 'telegram_openai_content_edit',
      revision_instruction: instruction,
      previous_output_id: output.id,
      ai_provider: revision.provider,
      ai_model: revision.providerKind === 'kimi' ? config.kimiApiModel : config.openaiSummaryModel,
      fallback_errors: revision.errors,
      source_chat_id: chatId,
      source_message_id: messageId,
    };

    const updated = await appRequest(config, 'PATCH', `/api/bna/content-outputs/${output.id}`, {
      body: revision.body,
      status: 'needs_approval',
      platform: output.platform || platformForContentOutputType(output.output_type),
      metadata: nextMetadata,
    });
    const updatedOutput = updated?.output || { ...output, body: revision.body, metadata: nextMetadata, status: 'needs_approval' };

    appendMemoryEntry('Content Draft Edited', revision.body, {
      chat_id: chatId,
      message_id: messageId,
      content_job_id: job.id,
      output_id: output.id,
      provider: revision.provider,
    });
    appendAgentTaskLedger({
      event: 'content_draft_edited',
      source: 'telegram',
      chat_id: chatId,
      message_id: messageId,
      task_id: null,
      title: `Edit ${contentOutputTypeLabel(output.output_type)} output #${output.id}`,
      notes: `Saved revised draft through ${revision.provider} API. No Codex task was created.`,
      stage: 'done',
      category: 'content',
      assigned_to: revision.provider,
    });

    const labels = approvalLabelsForOutput(updatedOutput.output_type);
    await sendContentApproval(config.botToken, chatId, messageId, {
      outputId: updatedOutput.id,
      jobId: job.id,
      body: updatedOutput.body,
      heading: `Revised ${contentOutputTypeLabel(updatedOutput.output_type)} #${updatedOutput.id}:`,
      approveLabel: labels.approveLabel,
      publishLabel: labels.publishLabel,
    });

    return true;
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `I tried to edit the saved content draft directly, but it failed: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
    return true;
  }
}

async function createSocialPostsForTargets(targets, summary, mediaItems, publishNow) {
  const results = [];
  for (const target of targets) {
    const account = target.account;
    const platform = String(account.platform || '').toLowerCase();
    if (platform === 'youtube' && !mediaItems.some((item) => String(item.type || '').startsWith('video/'))) {
      results.push({
        alias: target.alias,
        ok: false,
        message: 'YouTube posting requires a video file.',
      });
      continue;
    }
    if (platform === 'google' && summary.trim().length === 0 && mediaItems.length === 0) {
      results.push({
        alias: target.alias,
        ok: false,
        message: 'Google posts need text or media.',
      });
      continue;
    }

    try {
      const created = await createSocialPost({
        accountId: account.id,
        summary,
        media: mediaItems,
        publishNow,
        targetPlatform: platform,
      });
      results.push({
        alias: target.alias,
        ok: true,
        status: created?.results?.post?.status || (publishNow ? 'published' : 'draft'),
        postId: created?.results?.post?._id || '',
      });
    } catch (error) {
      results.push({
        alias: target.alias,
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}

async function createFacebookDraftFromContentOutput(config, outputId) {
  const jobs = await getContentJobs(config);
  const job = jobs.find((candidate) =>
    Array.isArray(candidate.outputs)
    && candidate.outputs.some((output) => Number(output.id) === Number(outputId))
  );
  const output = job?.outputs?.find((item) => Number(item.id) === Number(outputId));
  if (!job || !output) {
    throw new Error(`Content output #${outputId} was not found in the content queue`);
  }
  if (output.output_type !== 'facebook_post') {
    throw new Error(`Content output #${outputId} is ${output.output_type || 'not Facebook'}, not facebook_post`);
  }
  if (!String(output.body || '').trim()) {
    throw new Error(`Content output #${outputId} has no Facebook text`);
  }

  const accounts = await listSocialAccounts();
  const { resolved, unresolved } = resolveTargetAccounts(['facebook'], accounts);
  if (!resolved.length || unresolved.length) {
    throw new Error(unresolved.length
      ? `Could not resolve Facebook account: ${unresolved.join(', ')}`
      : 'No connected Facebook account was found. Use /accounts to confirm aliases.');
  }

  const localPath = job.local_path ? path.resolve(repoRoot, job.local_path) : '';
  const hasLocalMedia = Boolean(localPath && fs.existsSync(localPath));
  const results = await createSocialPostsForTargets(resolved, output.body, [], false);
  const failed = results.filter((item) => !item.ok);
  if (failed.length) {
    throw new Error(failed.map((item) => `${item.alias}: ${item.message}`).join('; '));
  }

  await appRequest(config, 'PATCH', `/api/bna/content-outputs/${outputId}`, {
    status: 'approved',
    metadata: {
      social_post_provider: 'buffer',
      buffer_draft_created_at: new Date().toISOString(),
      buffer_results: results,
      media_uploaded: false,
      media_attachment_pending: hasLocalMedia,
    },
  });

  return { job, output, results, mediaUploaded: false, mediaAttachmentPending: hasLocalMedia };
}

async function createDraftOutputFromContentJob(config, jobId, outputType) {
  const jobs = await getContentJobs(config);
  const job = jobs.find((candidate) => Number(candidate.id) === Number(jobId));
  if (!job) {
    throw new Error(`Content job #${jobId} was not found`);
  }

  const sourceText = String(job.transcript_text || job.caption || job.notes || '').trim();
  if (!sourceText) {
    throw new Error(`Content job #${jobId} does not have transcript/description text yet`);
  }

  const instructions = {
    facebook_post: `Create a Facebook post for this BNA content. Use a warm narrative style. Original caption: ${job.caption || '[none]'}`,
    whatsapp_update: `Create a WhatsApp parent update for this BNA content. Use short bullet points. Original caption: ${job.caption || '[none]'}`,
    blog_draft: `Create an English first-party website blog article for Bnei Neviim Academy. Use useful headings, real topics from the recording, and parent-facing SEO language. Original caption: ${job.caption || '[none]'}`,
  };
  const instruction = instructions[outputType] || `Create a ${outputType} draft for this BNA content. Original caption: ${job.caption || '[none]'}`;

  const generated = await appRequest(config, 'POST', `/api/bna/content-jobs/${job.id}/actions`, {
    action: 'generate_output',
    output_type: outputType,
    instruction,
  });

  return {
    job,
    output: generated.output,
    draft: generated.output?.body || '',
    prompt: generated.prompt || null,
  };
}

async function parseMixedContentJob(config, jobId, options = {}) {
  const parserInstruction = [
    options.instruction || '',
    options.archiveSourceAfterParse
      ? 'This is parser intake, not marketing Content. File tasks and named student accountability/Torah updates into their proper sections, then archive the source from the Content lane.'
      : '',
  ].filter(Boolean).join('\n\n');
  return appRequest(config, 'POST', `/api/bna/content-jobs/${jobId}/parse-mixed-recording`, {
    instruction: [
      'This recording may include both operator tasks and student accountability.',
      'Split operator personal tasks into Tasks assigned to Shloimie.',
      'Split coding, app, dashboard, parser, website, bot, Railway, legacy CRM, Remotion, or Codex work into Tasks assigned to Codex.',
      'Split student goals, decisions, private meeting notes, and questions into Student Accountability.',
      'For student Goal Board updates, include goal_board fields: section, subsection, checklist, bedtime_time, chosen_consequence, recovery_path, incentive, incentive_percent_target, parent_visible, student_visible, approval_required, and approval_status.',
      'Parent meeting, parent recording, or parent chat goals must be parent_visible true, student_visible false, approval_required true, and approval_status pending_review.',
      'Keep Content limited to teaching philosophy, actual class topics, verses/sources, class discussions, and class questions.',
      'Do not put goals, tasks, accountability, private meetings, daily progress, or follow-up items into Content class notes.',
      'For sources, write the best source/reference heard; include Hebrew source text only when it is present in the transcript.',
      'If inside-learning group goal minutes are discussed, create group goal entries using the weighted scoring rule.',
      'If daily Torah timer accountability is discussed, create daily_torah_updates with exact minutes: inside_engaged_minutes for following inside, listening_without_following_minutes for listening but not following, distracted_minutes for off-task time, and timer_total_minutes when heard.',
      'For INSIDE goals, inside/following counts 100%, listening without following counts 50%, and distracted time counts 0%. For LISTENING goals, engaged listening counts 100%.',
      'If the operator gives shorthand progress such as "Kosofsky 50%", store that percentage as a group-goal entry even without exact minutes.',
      parserInstruction,
    ].filter(Boolean).join(' '),
    archive_source_after_parse: Boolean(options.archiveSourceAfterParse),
  });
}

async function markContentJobParsedAfterMixedParse(config, jobId, existingNotes = '') {
  try {
    const result = await appRequest(config, 'PATCH', `/api/bna/content-jobs/${jobId}`, {
      drive_stage: '04 Parsed',
      notes: appendContentJobNote(existingNotes, [
        `Auto-parse stage sync (${new Date().toISOString()}):`,
        '- Mixed-recording parser completed successfully.',
        '- Content job stage marked 04 Parsed after successful parse.',
      ]),
    });
    return result?.job || null;
  } catch (error) {
    log(`Could not mark content job #${jobId} as 04 Parsed after auto-parse: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function parseMixedRecordingIntake(config, payload = {}, options = {}) {
  const parserInstruction = [
    options.instruction || '',
    'This recording is internal parser intake, not marketing Content. File operator tasks and named student accountability/Torah updates into their proper sections without creating a Content job.',
  ].filter(Boolean).join('\n\n');
  return appRequest(config, 'POST', '/api/bna/recording-intake/parse-mixed-recording', {
    ...payload,
    instruction: parserInstruction,
  });
}

async function handleScopedStructuredTextCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);

  if (text === '/help' || text === '/capabilities' || text === '/openai_capabilities') {
    await sendReply(
      config.botToken,
      chatId,
      [
        'One Time bot commands:',
        '- Plain messages use scoped Assistant chat for brainstorming and organization',
        '- /status',
        '- /queue',
        '- /ticket bot is not responding...',
        '- task: prepare source sheet for...',
        '- decision: choose registration flow...',
        '- comment task #123: add this context...',
        '',
        'Scope: One Time Mishnah Class tasks, comments, support tickets, decisions, shiur ideas, source sheets, Torah class prep, marketing, community, legacy CRM setup, admin, and accounting planning.',
        'Not available here: BNA Students, Accounting, Devices, broad Content jobs, Drive/legacy CRM posting commands, agent fleet, hosted-assistant smoke, or Codex repo execution.',
      ].join('\n'),
      messageId
    );
    return true;
  }

  if (text === '/queue' || text === '/tasks') {
    await sendReply(config.botToken, chatId, await formatLiveTaskQueueReply(config), messageId);
    return true;
  }

  if (/^\/(?:accounts|blogs|drive_auth|sync_drive_memory|pull_drive_memory|sync_content_drive|ingest_drive|drive|website_images|edit_video|video_edit|remotion_edit|edit_drive|edit_drop|drop_edit|smoke_openai|openai_smoke|railway_deploy|deploy|railway_doctor|agent_fleet|fleet_)/i.test(text)) {
    await sendReply(
      config.botToken,
      chatId,
      'That command is not enabled for the scoped One Time bot. This bot only handles One Time task collaboration and brainstorming.',
      messageId
    );
    return true;
  }

  return false;
}

async function handleStructuredTextCommand(config, msg, intentPlan = {}) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);

  if (isScopedProjectBot(config)) {
    return handleScopedStructuredTextCommand(config, msg);
  }

  if (text === '/help') {
    await sendReply(
      config.botToken,
      chatId,
      [
        'BNA bot commands:',
        '- Plain messages use Assistant chat by default; clear repo/development work routes to Codex',
        '- Press the bottom buttons to switch between Assistant and Codex',
        '- /status',
        '- /capabilities',
        '- /smoke_assistant',
        '- /railway_deploy',
        '- /agent_fleet_status',
        '- /agent_fleet_start',
        '- /agent_fleet_once',
        '- /accounts',
        '- /blogs',
        '- /queue',
        '- /wapi_status',
        '- /wapi_sync dry_run',
        '- /wapi_sync count:100 since_hours:168',
        '- /send_whatsapp signup:123 | message text',
        '- /link_whatsapp communication:12 signup:3',
        '- /crm_note contact:Name | note: context for latest WhatsApp',
        '- /provider_onboard provider: Name | phone: +972... | category: tutoring | area: Beit Shemesh | language: English | offering: Free intro class',
        '- /drive_auth',
        '- /sync_drive_memory',
        '- /pull_drive_memory',
        '- /sync_content_drive',
        '- /ingest_drive WhatsApp update',
        '- /website_images publish newest Website Images intake photo to Learning Moments',
        '- /edit_video from 3s to 8s speed up 2x, add subtitle: Forest learning',
        '- /edit_drop brighten it, zoom center, add title: BNA moment',
        '- /status',
        '- Send a ramble to capture Tasks, Students, Contacts, or Accounting items',
        '- Ask to make/refine a Codex or ChatGPT prompt to enter visible planning mode before implementation',
        '- Upload audio/video/image to create a Content job',
        '- Reply to a draft or say "edit output #39: make it shorter" to revise saved WhatsApp/Facebook/newsletter/blog drafts through Assistant',
        '- Reply to a draft with "approve this", "save as final", or "save this as an example" to save it as the approved version',
        '- Ask for "organize all recordings this week" or "make the weekly parent update" to draft from this week\'s transcripts',
        '- Decision points should come back with quick button-style options',
        '- publish draft <target ...> | your caption',
        '- schedule/commit social copy after approval; Buffer scheduling still requires explicit confirmation in Operations',
        'Upload a photo, video, or document with a publish command in the caption and I will save the asset, then queue the social draft. Buffer media attachment needs a hosted media URL.',
      ].join('\n'),
      messageId
    );
    return true;
  }

  if (text === '/capabilities' || text === '/openai_capabilities') {
    const chatMode = getTelegramChatMode(chatId, config);
    await sendReply(
      config.botToken,
      chatId,
      [
        'Assistant capabilities:',
        '',
        `Mode: ${chatMode === 'codex' ? 'Codex forced' : 'Assistant chat default'}`,
        '',
        'Can read/summarize:',
        '- AGENTS, MEMORY, TASKS, SYSTEM-STATE, internal Codex handoff notes',
        '- Today memory, shared agent ledger, and agent changelog tails',
        '- Live BNA app snapshots for task/student/content/accounting/system questions',
        '- Google Drive pipeline snapshots for Drive/upload/intake questions',
        '- Web research through the hosted research path when available',
        '',
        'Can write safely through the bridge:',
        '- Create Tasks, Student accountability items, Accounting/payment intake, Content jobs, Decisions',
        '- Revise saved WhatsApp, Facebook, newsletter, and blog drafts directly through Assistant and save them back to Content outputs',
        '- Approve/save a content draft by plain Telegram text and store approved versions as reusable prompt examples',
        '- Keep Codex/ChatGPT prompt-building requests in visible planning mode until the operator says to build/apply/run/test',
        '- Generate weekly parent updates from all recent transcribed Drive/content jobs, not only one latest file',
        '- Queue Codex-owned implementation tasks and mark them in progress',
        '- Ingest media/Drive/drop-folder files, transcribe/describe them, and create content records',
        '',
        'Routes to Codex instead of pretending:',
        '- Code edits, filesystem writes, migrations, deployments, tests, destructive changes, and long implementation work',
        '- Autonomous agent-fleet worker can claim queued Changelog tasks, run Codex, run verifier smokes, update Changelog/ledger, and notify Telegram',
        '',
        'Sync trail:',
        '- memory/YYYY-MM-DD.md',
        '- TASKS.md',
        '- ops/agent-task-ledger.jsonl',
        '- ops/agent-changelog.md',
        '- tasks-pending/*.md',
        '- live BNA app task records',
      ].join('\n'),
      messageId
    );
    return true;
  }

  if (text === '/smoke_openai' || text === '/openai_smoke' || text === '/smoke_assistant' || text === '/assistant_smoke') {
    try {
      await sendReply(config.botToken, chatId, 'Running hosted Assistant smoke test now. This checks repo memory, live Operations APIs, Drive folders, transcript exports, and an actual hosted assistant answer from that data.', messageId);
      const output = await runOpenAiSidekickSmoke();
      await sendReply(config.botToken, chatId, output || 'Hosted Assistant smoke completed.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Hosted Assistant smoke failed: ${error instanceof Error ? error.message : String(error)}`,
        messageId
      );
    }
    return true;
  }

  if (text === '/railway_deploy' || text === '/deploy' || text === '/railway_doctor') {
    try {
      await sendReply(config.botToken, chatId, 'Running Railway deploy and live doctor now. I will send the result here when it finishes.', messageId);
      const output = await runRailwayDeployAndDoctor();
      await sendReply(config.botToken, chatId, output.slice(-3500) || 'Railway deploy and doctor completed.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Railway deploy/doctor failed: ${error instanceof Error ? error.message : String(error)}`.slice(0, 3500),
        messageId
      );
    }
    return true;
  }

  if (text === '/agent_fleet_status' || text === '/fleet_status') {
    try {
      const output = await runAgentFleet(['--status'], 120000);
      await sendReply(config.botToken, chatId, output || 'Agent fleet status checked.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Agent fleet status failed: ${error instanceof Error ? error.message : String(error)}`,
        messageId
      );
    }
    return true;
  }

  if (text === '/agent_fleet_start' || text === '/fleet_start') {
    try {
      const output = await startAgentFleet();
      await sendReply(config.botToken, chatId, output || 'Agent fleet watcher started.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Agent fleet start failed: ${error instanceof Error ? error.message : String(error)}`,
        messageId
      );
    }
    return true;
  }

  if (text === '/agent_fleet_once' || text === '/fleet_once') {
    try {
      await sendReply(config.botToken, chatId, 'Agent fleet is claiming one Codex task, running Codex, then running verifier smokes. This may take a while.', messageId);
      const output = await runAgentFleet(['--once', '--max-tasks', '1'], 40 * 60 * 1000);
      await sendReply(config.botToken, chatId, output || 'Agent fleet one-shot completed.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Agent fleet one-shot failed: ${error instanceof Error ? error.message : String(error)}`,
        messageId
      );
    }
    return true;
  }

  if (text === '/accounts') {
    try {
      const health = await appRequest(config, 'GET', '/api/bna/integrations/buffer/health');
      if (health && health.ok === false) {
        await sendReply(config.botToken, chatId, `Buffer setup blocker: ${health.blocker || 'Buffer is not ready.'}`, messageId);
        return true;
      }
      const channelResult = await appRequest(config, 'GET', '/api/bna/integrations/buffer/channels');
      const accounts = (channelResult?.channels || []).map((channel) => ({
        id: channel.id,
        originId: channel.id,
        platform: channel.service || channel.platform,
        name: channel.displayName || channel.name || channel.service,
        provider: 'buffer',
      }));
      await sendReply(config.botToken, chatId, formatAccountsReply(accounts), messageId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await sendReply(config.botToken, chatId, `Buffer accounts unavailable: ${message}`, messageId);
    }
    return true;
  }

  if (text === '/blogs') {
    const blogs = await listBlogs();
    await sendReply(config.botToken, chatId, formatBlogsReply(blogs), messageId);
    return true;
  }

  if (text === '/queue') {
    await sendReply(config.botToken, chatId, await formatLiveTaskQueueReply(config), messageId);
    return true;
  }

  if (text === '/wapi_status' || text === '/whatsapp_status' || text === '/wa_status') {
    try {
      const diagnostics = await appRequest(config, 'GET', '/api/bna/wapi/diagnostics');
      const communications = await appRequest(config, 'GET', '/api/bna/contact-communications');
      diagnostics.recent_whatsapp_communications = (Array.isArray(communications?.communications) ? communications.communications : [])
        .filter((item) => String(item.channel || '').toLowerCase() === 'whatsapp')
        .slice(0, 6);
      await sendReply(config.botToken, chatId, formatWapiDiagnosticsReply(diagnostics), messageId);
    } catch (error) {
      await sendReply(config.botToken, chatId, `WAPI status failed: ${error instanceof Error ? error.message : String(error)}`, messageId);
    }
    return true;
  }

  if (/^\/(?:wapi_sync|whatsapp_sync|wa_sync)\b/i.test(text)) {
    try {
      const payload = parseWhatsappSyncCommand(text);
      const result = await appRequest(config, 'POST', '/api/bna/wapi/sync', payload);
      await sendReply(config.botToken, chatId, formatWapiSyncReply(result), messageId);
    } catch (error) {
      await sendReply(config.botToken, chatId, `Whapi sync failed: ${error instanceof Error ? error.message : String(error)}`, messageId);
    }
    return true;
  }

  if (/^\/(?:send_whatsapp|whatsapp_send|wa_send)\b/i.test(text)) {
    try {
      await handleWhatsappSendCommand(config, msg);
    } catch (error) {
      await sendReply(config.botToken, chatId, `WhatsApp send failed: ${error instanceof Error ? error.message : String(error)}`, messageId);
    }
    return true;
  }

  if (/^\/(?:link_whatsapp|whatsapp_link|wa_link)\b/i.test(text)) {
    try {
      await handleWhatsappLinkCommand(config, msg);
    } catch (error) {
      await sendReply(config.botToken, chatId, `WhatsApp link failed: ${error instanceof Error ? error.message : String(error)}`, messageId);
    }
    return true;
  }

  if (hasTelegramNoteToCrmIntent(text)) {
    try {
      await handleTelegramNoteToCrmCommand(config, msg);
    } catch (error) {
      await sendReply(config.botToken, chatId, `CRM note match failed: ${error instanceof Error ? error.message : String(error)}`, messageId);
    }
    return true;
  }

  if (text === '/drive_auth') {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Open this on the computer running the BNA bridge, approve Google, then come back here:',
        'http://localhost:8080/api/google/oauth/start?redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fgoogle%2Foauth%2Fcallback',
        '',
        'After approval, send /sync_drive_memory.',
      ].join('\n'),
      messageId
    );
    return true;
  }

  if (text === '/sync_drive_memory') {
    try {
      const output = await runDriveMemorySync('sync-memory');
      await sendReply(config.botToken, chatId, output || 'Drive memory sync complete.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Drive memory sync failed: ${error instanceof Error ? error.message : String(error)}`,
        messageId
      );
    }
    return true;
  }

  if (text === '/pull_drive_memory') {
    try {
      const output = await runDriveMemorySync('pull-memory');
      await sendReply(config.botToken, chatId, output || 'Pulled Drive memory into repo.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Drive memory pull failed: ${error instanceof Error ? error.message : String(error)}`,
        messageId
      );
    }
    return true;
  }

  if (/^\/sync_content_drive\b/i.test(text)) {
    try {
      const args = parseDriveContentLibrarySyncArgs(text);
      await sendReply(config.botToken, chatId, 'Syncing the Drive content library now. I will send the result when it finishes.', messageId);
      const output = await runDriveContentLibrarySync(args);
      await sendReply(config.botToken, chatId, driveContentSyncReply(output), messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `Drive content library sync failed: ${error instanceof Error ? error.message : String(error)}`.slice(0, 3500),
        messageId
      );
    }
    return true;
  }

  if (/^\/(?:edit_video|video_edit|remotion_edit|edit_drive)\b/i.test(text)) {
    await handleDriveVideoEditCommand(config, msg);
    return true;
  }

  if (/^\/(?:edit_drop|drop_edit)\b/i.test(text)) {
    await handleDropVideoEditCommand(config, msg);
    return true;
  }

  if (/^\/(?:ingest_drive|drive)\b/i.test(text)) {
    await handleDriveIngestCommand(config, msg);
    return true;
  }

  if (!msg.__approvedExternalAction && shouldAskForExternalApproval(intentPlan)) {
    await sendExternalActionApproval(config.botToken, chatId, messageId, messageId, intentPlan, text, msg);
    return true;
  }

  if (!isHandlerBlocked(intentPlan, 'contentApproval') && await handleContentApprovalTextRequest(config, msg)) {
    return true;
  }

  if (!isHandlerBlocked(intentPlan, 'contentDraftEdit') && await handleContentDraftEditRequest(config, msg)) {
    return true;
  }

  if (!isHandlerBlocked(intentPlan, 'weeklyTranscriptTopic') && await handleWeeklyTranscriptTopicRequest(config, msg)) {
    return true;
  }

  if (!isHandlerBlocked(intentPlan, 'latestVideoEdit') && isLatestVideoEditRequest(text)) {
    await handleDriveVideoEditCommand(config, {
      ...msg,
      text: `/edit_video ${text}`,
      caption: '',
    });
    return true;
  }

  if (!isHandlerBlocked(intentPlan, 'latestDriveIngest') && isLatestDriveIngestRequest(text)) {
    await handleDriveIngestCommand(config, {
      ...msg,
      text: `/ingest_drive ${buildLatestDriveIngestCaption(text)}`,
      caption: '',
    });
    return true;
  }

  if (!isHandlerBlocked(intentPlan, 'weeklyReport') && await handleWeeklyReportRequest(config, msg)) {
    return true;
  }

  const publishText = msg.__approvedExternalAction || isConfirmationText(text)
    ? stripConfirmationPrefix(text)
    : text;
  const publishIntent = parsePublishIntent(publishText);
  if (!publishIntent.isPublishRequest) {
    return false;
  }

  if (!msg.__approvedExternalAction && publishIntent.publishNow) {
    await sendExternalActionApproval(config.botToken, chatId, messageId, messageId, {
      ...intentPlan,
      primaryIntent: 'publish_send',
      requiresApproval: true,
    }, text, msg);
    return true;
  }

  const accounts = await listSocialAccounts();
  const { resolved, unresolved } = resolveTargetAccounts(publishIntent.targets, accounts);

  if (!resolved.length) {
    const detail = unresolved.length
      ? `Unable to resolve targets: ${unresolved.join(', ')}`
      : 'No target accounts were specified.';
    await sendReply(config.botToken, chatId, `${detail}\nUse /accounts to see valid aliases.`, messageId);
    return true;
  }

  if (unresolved.length) {
    await sendReply(
      config.botToken,
      chatId,
      `Some targets could not be resolved: ${unresolved.join(', ')}\nUse /accounts to see valid aliases.`,
      messageId
    );
    return true;
  }

  const results = await createSocialPostsForTargets(
    resolved,
    publishIntent.summary,
    [],
    publishIntent.publishNow
  );

  const job = buildJob({
    kind: 'social-text',
    chatId,
    messageId,
    caption: publishText,
    targets: resolved.map((item) => item.alias),
    publishNow: publishIntent.publishNow,
    summary: publishIntent.summary,
    status: results.every((item) => item.ok) ? 'completed' : 'partial',
    notes: results.map((item) => (item.ok ? `${item.alias}: ${item.status}` : `${item.alias}: ${item.message}`)),
  });
  saveJob(job);

  await sendReply(
    config.botToken,
    chatId,
    [
      `Saved job ${job.id}.`,
      ...results.map((item) =>
        item.ok
          ? `- ${item.alias}: ${item.status}${item.postId ? ` (${item.postId})` : ''}`
          : `- ${item.alias}: ${item.message}`
      ),
    ].join('\n'),
    messageId
  );

  return true;
}

async function handleMediaMessage(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const descriptor = detectMediaDescriptor(msg);
  if (!descriptor) {
    return false;
  }

  if (config.allowedChatIds.length > 0 && !config.allowedChatIds.includes(chatId)) {
    await sendReply(config.botToken, chatId, 'This bot is private.', messageId);
    return true;
  }

  const caption = getTelegramMessageText(msg);
  
  // Check file size first (Telegram bot API limit is ~20MB for downloads)
  const MAX_TELEGRAM_BOT_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  if (descriptor.fileSize && descriptor.fileSize > MAX_TELEGRAM_BOT_FILE_SIZE) {
    await sendReply(
      config.botToken,
      chatId,
      `File too large (${formatBytes(descriptor.fileSize)}). Telegram bot limit is 20MB.\n\n` +
      `Options:\n` +
      `1. Use Google Drive: upload to "00 Upload Here - Raw Media Intake"\n` +
      `2. Use /ingest_drop command with a file in media-drop/inbox\n` +
      `3. Compress the video and try again`,
      messageId
    );
    return true;
  }
  
  let download;
  try {
    download = await downloadTelegramFile(config.botToken, descriptor.fileId, descriptor.filename);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('file is too big')) {
      await sendReply(
        config.botToken,
        chatId,
        `File too large for Telegram bot download.\n\n` +
        `Options:\n` +
        `1. Upload to Google Drive "00 Upload Here - Raw Media Intake"\n` +
        `2. Use /ingest_drop command with a file in media-drop/inbox\n` +
        `3. Compress the video and try again`,
        messageId
      );
      return true;
    }
    throw error;
  }

  if (descriptor.kind === 'video' && isDirectVideoEditCaption(caption)) {
    const instruction = extractVideoEditInstruction(caption);
    await sendReply(
      config.botToken,
      chatId,
      [
        `Saved video to ${path.relative(repoRoot, download.localPath).replace(/\\/g, '/')}.`,
        `Remotion instruction: ${instruction}`,
        'Rendering now. This can take a bit for larger videos.',
      ].join('\n'),
      messageId
    );
    try {
      const result = await runRemotionSourceEdit(download.localPath, instruction, { maxDurationSeconds: 120 });
      await sendVideoEditResult(config, chatId, messageId, result, descriptor.filename || path.basename(download.localPath), instruction);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Telegram upload Remotion edit failed: ${message}`);
      await sendReply(config.botToken, chatId, `Remotion edit failed: ${message}`, messageId);
    }
    return true;
  }

  const publishIntent = parsePublishIntent(caption);
  const job = buildJob({
    kind: `media-${descriptor.kind}`,
    chatId,
    messageId,
    caption,
    localPath: download.localPath,
    mediaUrl: '',
    mimeType: descriptor.mimeType,
    targets: publishIntent.targets,
    publishNow: publishIntent.publishNow,
    summary: publishIntent.summary,
  });

  const replyLines = [
    `Saved ${descriptor.kind} to ${path.relative(repoRoot, download.localPath).replace(/\\/g, '/')}.`,
    'Queued for transcription, summary, labeling, and repurpose-ready storage. Buffer draft handoff is deferred until publish approval.',
  ];

  if (publishIntent.isPublishRequest) {
    const requestedPublishNow = Boolean(publishIntent.publishNow);
    if (requestedPublishNow) {
      publishIntent.publishNow = false;
      job.publishNow = false;
      job.notes.push('Publish-now was downgraded to draft because public publishing requires confirmation.');
      replyLines.push('Publish-now requested; creating a draft only. I will not publish publicly without a separate confirmation.');
    }

    const mediaItem = {
      url: job.mediaUrl || '',
      type: descriptor.mimeType,
      caption: caption || '',
    };
    const accounts = await listSocialAccounts();
    const { resolved, unresolved } = resolveTargetAccounts(publishIntent.targets, accounts);

    if (resolved.length > 0 && unresolved.length === 0) {
      if (!mediaItem.url) {
        replyLines.push('Buffer draft will include the text only; the media file is saved locally until hosted media attachment support is wired.');
      }
      const results = await createSocialPostsForTargets(
        resolved,
        publishIntent.summary || caption,
        mediaItem.url ? [mediaItem] : [],
        publishIntent.publishNow
      );
      job.targets = resolved.map((item) => item.alias);
      job.status = results.every((item) => item.ok) ? 'completed' : 'partial';
      job.notes = results.map((item) => (item.ok ? `${item.alias}: ${item.status}` : `${item.alias}: ${item.message}`));
      replyLines.push(
        ...results.map((item) =>
          item.ok
            ? `- ${item.alias}: ${item.status}${item.postId ? ` (${item.postId})` : ''}`
            : `- ${item.alias}: ${item.message}`
        )
      );
    } else {
      job.status = 'queued';
      job.notes = unresolved.length > 0
        ? [`Unresolved targets: ${unresolved.join(', ')}`]
        : ['No valid publish targets supplied'];
      replyLines.push(
        unresolved.length > 0
          ? `Queued only. Could not resolve: ${unresolved.join(', ')}`
          : 'Queued only. No valid publish targets were supplied.'
      );
    }
  } else {
    job.status = 'queued';
    job.notes = ['Asset saved locally and queued; Buffer draft handoff is deferred until publish approval'];
    replyLines.push('Queued the asset for follow-up. Add a caption like "publish draft facebook | your caption" next time to create a social post automatically.');
  }

  saveJob(job);

  let transcriptText = '';
  let transcription = null;
  let whatsAppDraft = '';
  let facebookDraft = '';
  let whatsAppVideoParts = [];
  let contentJobId = '';
  let whatsAppOutputId = '';
  let facebookOutputId = '';
  let routing = classifyMediaRouting(caption, '', { publishIntent });

  try {
    if (descriptor.kind === 'video' && shouldGenerateWhatsAppDraft(caption)) {
      try {
        replyLines.push('Creating WhatsApp-friendly video parts...');
        const videoParts = await createWhatsAppVideoParts(download.localPath);
        whatsAppVideoParts = videoParts.parts;
        replyLines.push(
          `Created ${whatsAppVideoParts.length} WhatsApp video part(s) in ${path.relative(repoRoot, videoParts.partsDir).replace(/\\/g, '/')}.`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`WhatsApp video part creation failed: ${message}`);
        replyLines.push(`WhatsApp video parts not created: ${message}`);
      }
    }

    if (['video', 'voice', 'document'].includes(descriptor.kind)) {
      try {
        replyLines.push('Transcribing with OpenAI...');
        transcription = await transcribeMediaWithOpenAI(config, download.localPath, descriptor);
        transcriptText = getTranscriptText(transcription);
        if (transcription?.processing?.mode === 'ffmpeg-audio-chunks') {
          replyLines.push(`Long media prepared as ${transcription.processing.chunk_count} compressed audio chunk(s) for transcription.`);
        }
        replyLines.push(`Transcript captured (${transcriptText.length} characters).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Transcription failed: ${message}`);
        replyLines.push(`Transcription not completed: ${message}`);
      }
    }

    if (transcriptText && shouldGenerateWhatsAppDraft(caption)) {
      try {
        whatsAppDraft = await generateWhatsAppDraft(config, transcriptText, caption);
        replyLines.push('WhatsApp draft generated.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`WhatsApp draft failed: ${message}`);
        replyLines.push(`WhatsApp draft not generated: ${message}`);
      }
    }

    if (transcriptText && shouldGenerateFacebookDraft(caption)) {
      try {
        facebookDraft = await generateFacebookDraft(config, transcriptText, caption);
        replyLines.push('Facebook draft generated.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Facebook draft failed: ${message}`);
        replyLines.push(`Facebook draft not generated: ${message}`);
      }
    }

    routing = classifyMediaRouting(caption, transcriptText, {
      generatedContent: Boolean(whatsAppDraft || facebookDraft),
      publishIntent,
    });
    const contentTitle = await generateContentTitle(config, transcriptText, caption, `${descriptor.kind} from Telegram ${messageId}`);

    if (shouldUseRecordingIntake(routing, caption, transcriptText)) {
      try {
        const parsed = await parseMixedRecordingIntake(config, {
          title: contentTitle,
          source_type: 'telegram_media',
          source_message_id: String(messageId),
          source_chat_id: chatId,
          local_path: path.relative(repoRoot, download.localPath).replace(/\\/g, '/'),
          media_url: job.mediaUrl || null,
          mime_type: descriptor.mimeType,
          caption,
          transcript_text: buildRecordingIntakeTranscript(caption, transcriptText),
          transcript_json: transcription || null,
        });
        const counts = parsed?.counts || {};
        replyLines.push('Filed recording directly into Tasks/Students; no Content job was created.');
        replyLines.push(`Filed automatically: Tasks ${counts.tasks || 0}, Students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Recording intake parse failed for Telegram media ${messageId}: ${message}`);
        replyLines.push(`Auto-parse not completed: ${message}`);
      }
    } else {
      const outputs = routing.contentLane
        ? buildGeneratedContentOutputs(descriptor.kind, caption, { whatsAppDraft, facebookDraft })
        : [];
      const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
        title: contentTitle,
        source_type: 'telegram_media',
        source_message_id: String(messageId),
        source_chat_id: chatId,
        local_path: path.relative(repoRoot, download.localPath).replace(/\\/g, '/'),
        media_url: job.mediaUrl || null,
        mime_type: descriptor.mimeType,
        caption,
        status: whatsAppDraft || facebookDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested',
        transcript_text: transcriptText || null,
        transcript_json: transcription || null,
        parse_json: null,
        notes: [
          'Content pipeline job created from Telegram media.',
          routing.contentLane ? 'Buffer draft handoff is intentionally deferred until a publish command or approval step.' : '',
          whatsAppVideoParts.length
            ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
            : '',
          'Queued work: transcribe, summarize, label, and wait for the next repurposing instruction before drafting platform outputs.',
        ].filter(Boolean).join('\n'),
        outputs,
      });
      contentJobId = contentJob?.job?.id || '';
      const whatsAppOutput = Array.isArray(contentJob?.outputs)
        ? contentJob.outputs.find((output) => output.output_type === 'whatsapp_update')
        : null;
      whatsAppOutputId = whatsAppOutput?.id || '';
      const facebookOutput = Array.isArray(contentJob?.outputs)
        ? contentJob.outputs.find((output) => output.output_type === 'facebook_post')
        : null;
      facebookOutputId = facebookOutput?.id || '';
      replyLines.push(`Content pipeline job: ${contentJobId || 'created'}.`);
      if (contentJobId && routing.shouldParse) {
        try {
          const parsed = await parseMixedContentJob(config, contentJobId);
          await markContentJobParsedAfterMixedParse(config, contentJobId, contentJob?.job?.notes || '');
          const counts = parsed?.counts || {};
          replyLines.push(`Auto-parsed tasks/students: tasks ${counts.tasks || 0}, students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          log(`Auto mixed parse failed for content job ${contentJobId}: ${message}`);
          replyLines.push(`Auto-parse not completed: ${message}`);
        }
      }
    }
  } catch (error) {
    log(`Content job capture failed: ${error instanceof Error ? error.message : String(error)}`);
    replyLines.push('Content pipeline job was not created; media is still saved and queued locally.');
  }

  appendMemoryEntry('Telegram Asset', replyLines.join('\n'), {
    chat_id: chatId,
    message_id: messageId,
    job_id: job.id,
  });

  const shouldSyncDriveContentLibrary = Boolean(contentJobId && transcriptText && routing.contentLane);
  if (shouldSyncDriveContentLibrary) {
    replyLines.push('Drive content library sync queued.');
  }

  await sendReply(config.botToken, chatId, [`Saved job ${job.id}.`, ...replyLines].join('\n'), messageId);
  if (shouldSyncDriveContentLibrary) {
    queueDriveContentLibrarySync(config, chatId, messageId, contentJobId);
  }

  for (let index = 0; index < whatsAppVideoParts.length; index += 1) {
    const part = whatsAppVideoParts[index];
    if (part.size > config.telegramUploadMaxBytes) {
      await sendReply(
        config.botToken,
        chatId,
        `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length} is ${Math.ceil(part.size / 1024 / 1024)}MB, so I left it saved locally instead of uploading it back to Telegram: ${path.relative(repoRoot, part.localPath).replace(/\\/g, '/')}`,
        messageId
      );
      continue;
    }

    try {
      await telegramUploadFile(
        config.botToken,
        'sendDocument',
        {
          chat_id: chatId,
          reply_to_message_id: messageId,
          caption: `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length}`,
        },
        'document',
        part.localPath,
        part.filename
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Telegram upload of WhatsApp part failed: ${message}`);
      await sendReply(
        config.botToken,
        chatId,
        `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length} was saved locally but could not be uploaded back to Telegram: ${message}`,
        messageId
      );
    }
  }

  if (whatsAppDraft) {
    if (shouldAutoSendGeneratedWhatsAppDraftPreview({ outputId: whatsAppOutputId, contentJobId })) {
      await sendReply(
        config.botToken,
        chatId,
        [
          'WhatsApp copy draft:',
          '',
          whatsAppDraft,
        ].join('\n'),
        messageId
      );
    } else {
      log(`Automatic WhatsApp draft preview suppressed for Content job ${contentJobId || 'unknown'}; draft is saved in Operations.`);
    }
  }
  if (facebookDraft) {
    if (facebookOutputId) {
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: facebookOutputId,
        jobId: contentJobId,
        body: facebookDraft,
        heading: 'Facebook post draft:',
        approveLabel: 'Save Final Draft',
        publishLabel: 'Commit to Buffer Draft',
      });
    } else {
      await sendReply(config.botToken, chatId, ['Facebook post draft:', '', facebookDraft].join('\n'), messageId);
    }
  }
  return true;
}

async function handleDropIngestCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const caption = text.replace(/^\/(?:ingest_drop|drop)\b/i, '').trim()
    || 'WhatsApp update: make this into a parent WhatsApp summary with bullet points and split the video if needed.';
  const files = listDropInboxFiles();

  if (!files.length) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Drop folder is ready, but I do not see a file yet.',
        `Put the video here: ${mediaDropInboxDir}`,
        'Then send: /ingest_drop WhatsApp update: make this into a parent update.',
      ].join('\n'),
      messageId
    );
    return true;
  }

  const sourcePath = files[0];
  const sourceStats = fs.statSync(sourcePath);
  const localPath = copyDropFileToMediaInbox(sourcePath);
  const descriptor = detectLocalFileDescriptor(localPath);
  const replyLines = [
    `Picked up ${path.basename(sourcePath)} from media-drop/inbox (${formatBytes(sourceStats.size)}).`,
    `Copied into ${path.relative(repoRoot, localPath).replace(/\\/g, '/')}.`,
    'Queued for local transcription, summary, labeling, and repurpose-ready storage. Buffer draft handoff is deferred.',
  ];

  await sendReply(config.botToken, chatId, replyLines.join('\n'), messageId);

  const job = buildJob({
    kind: `drop-${descriptor.kind}`,
    chatId,
    messageId,
    caption,
    localPath,
    mediaUrl: '',
    mimeType: descriptor.mimeType,
    status: 'queued',
    notes: ['Local drop-folder asset saved and queued; Buffer draft handoff is deferred until publish approval'],
  });
  saveJob(job);

  let transcriptText = '';
  let transcription = null;
  let whatsAppDraft = '';
  let facebookDraft = '';
  let whatsAppVideoParts = [];
  let contentJobId = '';
  let whatsAppOutputId = '';
  let facebookOutputId = '';
  let routing = classifyMediaRouting(caption, '');

  try {
    if (descriptor.kind === 'video' && shouldGenerateWhatsAppDraft(caption)) {
      try {
        const videoParts = await createWhatsAppVideoParts(localPath);
        whatsAppVideoParts = videoParts.parts;
        replyLines.push(
          `Created ${whatsAppVideoParts.length} WhatsApp video part(s) in ${path.relative(repoRoot, videoParts.partsDir).replace(/\\/g, '/')}.`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop WhatsApp video part creation failed: ${message}`);
        replyLines.push(`WhatsApp video parts not created: ${message}`);
      }
    }

    if (['video', 'voice', 'document'].includes(descriptor.kind)) {
      try {
        transcription = await transcribeMediaWithOpenAI(config, localPath, descriptor);
        transcriptText = getTranscriptText(transcription);
        if (transcription?.processing?.mode === 'ffmpeg-audio-chunks') {
          replyLines.push(`Long media prepared as ${transcription.processing.chunk_count} compressed audio chunk(s) for transcription.`);
        }
        replyLines.push(`Transcript captured (${transcriptText.length} characters).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop transcription failed: ${message}`);
        replyLines.push(`Transcription not completed: ${message}`);
      }
    }

    if (!transcriptText && isImageMime(descriptor.mimeType)) {
      try {
        transcriptText = await describeImageWithOpenAI(config, localPath, caption);
        transcription = {
          text: transcriptText,
          kind: 'image_description',
        };
        replyLines.push('Image description captured.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop image description failed: ${message}`);
        replyLines.push(`Image description not completed: ${message}`);
      }
    }

    if (transcriptText && shouldGenerateWhatsAppDraft(caption)) {
      try {
        whatsAppDraft = await generateWhatsAppDraft(config, transcriptText, caption);
        replyLines.push('WhatsApp draft generated.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop WhatsApp draft failed: ${message}`);
        replyLines.push(`WhatsApp draft not generated: ${message}`);
      }
    }

    if (transcriptText && shouldGenerateFacebookDraft(caption)) {
      try {
        facebookDraft = await generateFacebookDraft(config, transcriptText, caption);
        replyLines.push('Facebook draft generated.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop Facebook draft failed: ${message}`);
        replyLines.push(`Facebook draft not generated: ${message}`);
      }
    }

    routing = classifyMediaRouting(caption, transcriptText, {
      generatedContent: Boolean(whatsAppDraft || facebookDraft),
    });
    const contentTitle = await generateContentTitle(config, transcriptText, caption, `drop folder ${path.basename(sourcePath)}`);

    if (shouldUseRecordingIntake(routing, caption, transcriptText)) {
      try {
        const parsed = await parseMixedRecordingIntake(config, {
          title: contentTitle,
          source_type: 'local_drop',
          source_message_id: String(messageId),
          source_chat_id: chatId,
          local_path: path.relative(repoRoot, localPath).replace(/\\/g, '/'),
          media_url: null,
          mime_type: descriptor.mimeType,
          caption,
          transcript_text: buildRecordingIntakeTranscript(caption, transcriptText),
          transcript_json: transcription || null,
        });
        const counts = parsed?.counts || {};
        replyLines.push('Filed recording directly into Tasks/Students; no Content job was created.');
        replyLines.push(`Filed automatically: Tasks ${counts.tasks || 0}, Students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop recording intake parse failed for ${path.basename(sourcePath)}: ${message}`);
        replyLines.push(`Auto-parse not completed: ${message}`);
      }
    } else {
      const outputs = routing.contentLane
        ? buildGeneratedContentOutputs(descriptor.kind, caption, { whatsAppDraft, facebookDraft })
        : [];
      const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
        title: contentTitle,
        source_type: 'local_drop',
        source_message_id: String(messageId),
        source_chat_id: chatId,
        local_path: path.relative(repoRoot, localPath).replace(/\\/g, '/'),
        media_url: null,
        mime_type: descriptor.mimeType,
        caption,
        status: whatsAppDraft || facebookDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested',
        transcript_text: transcriptText || null,
        transcript_json: transcription || null,
        parse_json: null,
        notes: [
          'Content pipeline job created from local media-drop folder.',
          routing.contentLane ? 'Buffer draft handoff is intentionally deferred until a publish command or approval step.' : '',
          whatsAppVideoParts.length
            ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
            : '',
          'Queued work: WhatsApp lane first; blogs/social/video-editor templates are later channels.',
        ].filter(Boolean).join('\n'),
        outputs,
      });

      contentJobId = contentJob?.job?.id || '';
      const whatsAppOutput = Array.isArray(contentJob?.outputs)
        ? contentJob.outputs.find((output) => output.output_type === 'whatsapp_update')
        : null;
      whatsAppOutputId = whatsAppOutput?.id || '';
      const facebookOutput = Array.isArray(contentJob?.outputs)
        ? contentJob.outputs.find((output) => output.output_type === 'facebook_post')
        : null;
      facebookOutputId = facebookOutput?.id || '';
      replyLines.push(`Content pipeline job: ${contentJobId || 'created'}.`);
      if (contentJobId && routing.shouldParse) {
        try {
          const parsed = await parseMixedContentJob(config, contentJobId);
          await markContentJobParsedAfterMixedParse(config, contentJobId, contentJob?.job?.notes || '');
          const counts = parsed?.counts || {};
          replyLines.push(`Auto-parsed tasks/students: tasks ${counts.tasks || 0}, students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          log(`Drop auto mixed parse failed for content job ${contentJobId}: ${message}`);
          replyLines.push(`Auto-parse not completed: ${message}`);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Drop content job capture failed: ${message}`);
    replyLines.push('Content pipeline job was not created; media is still saved locally.');
  }

  try {
    const processedDir = ensureDirectory(path.join(mediaDropProcessedDir, todayFolderName()));
    const processedPath = path.join(processedDir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${sanitizeFileName(path.basename(sourcePath))}`);
    fs.renameSync(sourcePath, processedPath);
    replyLines.push(`Moved original drop file to ${path.relative(repoRoot, processedPath).replace(/\\/g, '/')}.`);
  } catch (error) {
    log(`Could not move drop source file: ${error instanceof Error ? error.message : String(error)}`);
  }

  appendMemoryEntry('Drop Asset', replyLines.join('\n'), {
    chat_id: chatId,
    message_id: messageId,
    job_id: job.id,
  });

  await sendReply(config.botToken, chatId, [`Saved drop job ${job.id}.`, ...replyLines].join('\n'), messageId);

  for (let index = 0; index < whatsAppVideoParts.length; index += 1) {
    const part = whatsAppVideoParts[index];
    if (part.size > config.telegramUploadMaxBytes) {
      await sendReply(
        config.botToken,
        chatId,
        `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length} is ${formatBytes(part.size)}, so I left it saved locally: ${path.relative(repoRoot, part.localPath).replace(/\\/g, '/')}`,
        messageId
      );
      continue;
    }

    try {
      await telegramUploadFile(
        config.botToken,
        'sendDocument',
        {
          chat_id: chatId,
          reply_to_message_id: messageId,
          caption: `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length}`,
        },
        'document',
        part.localPath,
        part.filename
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Telegram upload of drop WhatsApp part failed: ${message}`);
      await sendReply(
        config.botToken,
        chatId,
        `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length} was saved locally but could not be uploaded back to Telegram: ${message}`,
        messageId
      );
    }
  }

  if (whatsAppDraft) {
    if (whatsAppOutputId) {
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: whatsAppOutputId,
        jobId: contentJobId,
        body: whatsAppDraft,
      });
    } else {
      await sendReply(
        config.botToken,
        chatId,
        ['WhatsApp copy draft:', '', whatsAppDraft].join('\n'),
        messageId
      );
    }
  }

  if (facebookDraft) {
    if (facebookOutputId) {
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: facebookOutputId,
        jobId: contentJobId,
        body: facebookDraft,
        heading: 'Facebook post draft:',
        approveLabel: 'Save Final Draft',
        publishLabel: 'Commit to Buffer Draft',
      });
    } else {
      await sendReply(config.botToken, chatId, ['Facebook post draft:', '', facebookDraft].join('\n'), messageId);
    }
  }

  return true;
}

async function handleDriveVideoEditCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const instruction = extractVideoEditInstruction(text);

  let drive;
  let pipelineConfig;
  let driveFile;
  let companionDriveFiles = [];
  let localAssets = [];
  let localPath = '';

  try {
    const listed = await listDriveRawIntakeFiles();
    drive = listed.drive;
    pipelineConfig = listed.config;
    driveFile = (listed.files || []).find((file) => {
      const descriptor = detectLocalFileDescriptor(file.name || '');
      return /^video\//i.test(file.mimeType || '') || descriptor.kind === 'video';
    });
    companionDriveFiles = (listed.files || [])
      .filter((file) => file.id !== driveFile?.id && isDriveRemotionAssetFile(file))
      .slice(0, 12);

    if (!driveFile) {
      await sendReply(
        config.botToken,
        chatId,
        [
          'I do not see a video in Drive Raw Media Intake yet.',
          'Drop the source video into BNA V2 / 00 Upload Here - Raw Media Intake, then send:',
          '/edit_video from 3s to 8s speed up 2x, add subtitle: Forest learning',
        ].join('\n'),
        messageId
      );
      return true;
    }

    const ingestingFile = await moveDriveFile(drive, driveFile, pipelineConfig.stages?.['02 Ingesting']);
    driveFile = { ...driveFile, ...ingestingFile };
    localPath = await downloadDriveFileToMediaInbox(drive, driveFile);

    for (const companion of companionDriveFiles) {
      const moved = await moveDriveFile(drive, companion, pipelineConfig.stages?.['02 Ingesting']);
      const companionFile = { ...companion, ...moved };
      const companionPath = await downloadDriveFileToMediaInbox(drive, companionFile);
      localAssets.push({
        localPath: companionPath,
        originalName: companionFile.name || path.basename(companionPath),
        mimeType: companionFile.mimeType || '',
        kind: remotionAssetKindFromPath(companionPath, companionFile.mimeType),
        driveFile: companionFile,
      });
    }

    await sendReply(
      config.botToken,
      chatId,
      [
        `Picked up ${driveFile.name} from Drive Raw Media Intake for Remotion editing.`,
        formatRemotionAssetSummary(buildRemotionAssetList(localAssets)),
        `Instruction: ${instruction}`,
        'Rendering now. This can take a bit for larger videos.',
      ].join('\n'),
      messageId
    );

    const result = await runRemotionSourceEdit(localPath, instruction, {
      maxDurationSeconds: 120,
      assets: localAssets,
    });
    await sendVideoEditResult(config, chatId, messageId, result, driveFile.name || path.basename(localPath), instruction);

    const targetFolderId = pipelineConfig.stages?.['07 Social Candidates'] || pipelineConfig.stages?.['04 Parsed'];
    if (targetFolderId) {
      try {
        await moveDriveFile(drive, driveFile, targetFolderId);
      } catch (error) {
        log(`Could not move edited Drive source file after render: ${error instanceof Error ? error.message : String(error)}`);
      }
      for (const asset of localAssets) {
        if (!asset.driveFile?.id) continue;
        try {
          await moveDriveFile(drive, asset.driveFile, targetFolderId);
        } catch (error) {
          log(`Could not move edited Drive companion asset after render: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Drive Remotion edit failed: ${message}`);
    await sendReply(config.botToken, chatId, `Remotion edit failed: ${message}`, messageId);
  }

  return true;
}

async function handleDropVideoEditCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const instruction = extractVideoEditInstruction(text, /^\/(?:edit_drop|drop_edit)\b/i);
  const files = listDropInboxFiles();
  const sourcePath = files.find(isLocalVideoPath);
  const assetSources = files
    .filter((filePath) => filePath !== sourcePath && isLocalRemotionAssetPath(filePath))
    .slice(0, 12);

  if (!sourcePath) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Drop folder is ready, but I do not see a video file yet.',
        `Put the video here: ${mediaDropInboxDir}`,
        'Then send: /edit_drop from 3s to 8s speed up 2x, add subtitle: Forest learning',
      ].join('\n'),
      messageId
    );
    return true;
  }

  const localPath = copyDropFileToMediaInbox(sourcePath);
  const localAssets = assetSources.map((assetPath) => {
    const descriptor = detectLocalFileDescriptor(assetPath);
    return {
      localPath: copyDropFileToMediaInbox(assetPath),
      originalName: path.basename(assetPath),
      mimeType: descriptor.mimeType || '',
      kind: remotionAssetKindFromPath(assetPath, descriptor.mimeType),
      sourcePath: assetPath,
    };
  });
  await sendReply(
    config.botToken,
    chatId,
    [
      `Picked up ${path.basename(sourcePath)} from media-drop/inbox for Remotion editing.`,
      formatRemotionAssetSummary(buildRemotionAssetList(localAssets)),
      `Instruction: ${instruction}`,
      'Rendering now. This can take a bit for larger videos.',
    ].join('\n'),
    messageId
  );

  try {
    const result = await runRemotionSourceEdit(localPath, instruction, {
      maxDurationSeconds: 120,
      assets: localAssets,
    });
    await sendVideoEditResult(config, chatId, messageId, result, path.basename(sourcePath), instruction);

    const processedDir = ensureDirectory(path.join(mediaDropProcessedDir, todayFolderName()));
    const processedPath = path.join(processedDir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${sanitizeFileName(path.basename(sourcePath))}`);
    fs.renameSync(sourcePath, processedPath);
    for (const asset of localAssets) {
      if (!asset.sourcePath || !fs.existsSync(asset.sourcePath)) continue;
      const assetProcessedPath = path.join(
        processedDir,
        `${new Date().toISOString().replace(/[:.]/g, '-')}-${sanitizeFileName(path.basename(asset.sourcePath))}`
      );
      fs.renameSync(asset.sourcePath, assetProcessedPath);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Drop Remotion edit failed: ${message}`);
    await sendReply(config.botToken, chatId, `Remotion edit failed: ${message}`, messageId);
  }

  return true;
}

async function handleWebsiteImageIngestCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const caption = text.replace(/^\/(?:ingest_website_images|website_images|ingest_images)\b/i, '').trim()
    || 'Website image intake: publish this image to the public Learning Moments feed.';

  let listed;
  try {
    listed = await listDriveWebsiteImageFiles();
  } catch (error) {
    await sendReply(
      config.botToken,
      chatId,
      `Website image intake failed before processing: ${error instanceof Error ? error.message : String(error)}`,
      messageId
    );
    return true;
  }

  if (!listed.files.length) {
    await sendReply(
      config.botToken,
      chatId,
      [
        'Website Images intake is connected, but I do not see an image there yet.',
        'Put images into BNA V2 / 00 Upload Here - Website Images, then send /website_images.',
      ].join('\n'),
      messageId
    );
    return true;
  }

  const driveFile = listed.files[0];
  await sendReply(
    config.botToken,
    chatId,
    `Picked up ${driveFile.name} from Website Images intake. Publishing it to the public Learning Moments feed now.`,
    messageId
  );

  try {
    const result = await publishDriveImageToWebsiteMoments(config, {
      drive: listed.drive,
      pipelineConfig: listed.config,
      driveFile,
      caption,
      sourceLabel: 'Website Images intake',
    });
    await sendReply(
      config.botToken,
      chatId,
      [
        `Published ${driveFile.name} to the website Learning Moments feed.`,
        `Image: ${result.published.image}`,
        `Feed: ${path.relative(repoRoot, publicLearningMomentsFeedFile).replace(/\\/g, '/')}`,
        'Drive original moved to approved website assets.',
      ].join('\n'),
      messageId
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Website image intake failed for ${driveFile.name}: ${message}`);
    const failedFolderId = listed.config?.simplifiedFolders?.failedNeedsReview || listed.config?.stages?.['99 Failed'];
    if (failedFolderId) {
      try {
        await moveDriveFile(listed.drive, driveFile, failedFolderId);
      } catch (moveError) {
        log(`Could not move failed website image to review folder: ${moveError instanceof Error ? moveError.message : String(moveError)}`);
      }
    }
    await sendReply(config.botToken, chatId, `Website image publish failed: ${message}`, messageId);
  }

  return true;
}

const DEFAULT_DRIVE_INGEST_CAPTION = [
  'Auto Drive Intake:',
  'Transcribe audio/video or describe image.',
  'Title/name it from the content.',
  'Save it in the BNA content queue with the Drive link.',
  'Then ask the operator what to do next with platform action buttons.',
].join(' ');

function parseRepairDriveJobIds(args = []) {
  return [...new Set(args
    .filter((arg) => !String(arg || '').startsWith('--'))
    .flatMap((arg) => String(arg || '').split(/[,\s]+/))
    .map((part) => {
      const match = part.match(/(?:job[#:]?)?(\d+)/i);
      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean))];
}

function appendContentJobNote(existingNotes, noteLines = []) {
  const note = (Array.isArray(noteLines) ? noteLines : [noteLines])
    .filter(Boolean)
    .join('\n')
    .trim();
  return [String(existingNotes || '').trim(), note].filter(Boolean).join('\n\n');
}

async function findDriveFileById(drive, fileId) {
  const result = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'id,name,mimeType,size,webViewLink,parents,createdTime,modifiedTime',
  });
  return result.data;
}

async function loadContentJobById(config, jobId) {
  const jobs = await getContentJobs(config);
  return jobs.find((job) => Number(job.id) === Number(jobId)) || null;
}

async function reprocessDriveContentJob(config, jobId, options = {}) {
  const job = await loadContentJobById(config, jobId);
  if (!job) throw new Error(`Content job #${jobId} was not found`);
  const driveFileId = String(job.drive_file_id || '').trim();
  if (!driveFileId) throw new Error(`Content job #${jobId} has no Drive file ID`);

  const existingTranscriptChars = String(job.transcript_text || '').trim().length;
  if (existingTranscriptChars && !options.force) {
    let parseResult = null;
    let finalDriveStage = job.drive_stage || '';
    const routing = classifyMediaRouting(job.caption || '', job.transcript_text || '');
    if (options.parse || (options.autoParse && routing.shouldParse)) {
      parseResult = await parseMixedContentJob(config, jobId, {
        instruction: 'Repair follow-up after Drive transcription reprocess. Parse only actual operator tasks, student accountability, Torah learning updates, class topics, and source questions heard in the transcript.',
      });
      if (parseResult?.success && !parseResult?.dry_run) {
        const stagePatch = await appRequest(config, 'PATCH', `/api/bna/content-jobs/${jobId}`, {
          drive_stage: '04 Parsed',
          notes: appendContentJobNote(job.notes, [
            `Reprocess parse notes (${new Date().toISOString()}):`,
            '- Existing transcript parsed through the mixed-recording parser.',
            '- Content job stage marked 04 Parsed after successful parse.',
          ]),
        });
        finalDriveStage = stagePatch?.job?.drive_stage || '04 Parsed';
      }
    }
    return {
      job_id: Number(jobId),
      skipped: true,
      reason: 'already_has_transcript',
      transcript_chars: existingTranscriptChars,
      status: job.status || '',
      drive_stage: finalDriveStage,
      parse: parseResult
        ? {
            success: Boolean(parseResult.success),
            skipped: Boolean(parseResult.skipped),
            counts: parseResult.counts || {},
          }
        : null,
    };
  }

  const auth = loadGoogleDriveAuth();
  const pipelineConfig = loadGoogleDrivePipelineConfig();
  const drive = google.drive({ version: 'v3', auth });
  const driveFile = await findDriveFileById(drive, driveFileId);
  const targetFolderId = pipelineConfig.stages?.['03 Transcribed'] || '';

  if (options.dryRun) {
    return {
      job_id: Number(jobId),
      dry_run: true,
      title: job.title || '',
      status: job.status || '',
      drive_stage: job.drive_stage || '',
      drive_file: {
        id: driveFile.id,
        name: driveFile.name || '',
        mime_type: driveFile.mimeType || '',
        size_bytes: Number(driveFile.size || 0),
      },
      would_update: existingTranscriptChars ? 'skip_without_force' : 'transcribe_and_patch_existing_job',
    };
  }

  let localPath = '';
  try {
    localPath = await downloadDriveFileToMediaInbox(drive, driveFile);
    const descriptor = detectLocalFileDescriptor(localPath);
    let transcription = null;
    let transcriptText = '';

    if (isImageMime(descriptor.mimeType)) {
      transcriptText = await describeImageWithOpenAI(config, localPath, job.caption || DEFAULT_DRIVE_INGEST_CAPTION);
      transcription = { text: transcriptText, kind: 'image_description' };
    } else if (isAudioVideoMime(descriptor.mimeType) || ['video', 'voice', 'document', 'audio'].includes(descriptor.kind)) {
      transcription = await transcribeMediaWithOpenAI(config, localPath, descriptor);
      transcriptText = getTranscriptText(transcription);
    } else {
      throw new Error(`Drive file MIME type ${descriptor.mimeType || driveFile.mimeType || 'unknown'} is not supported for automatic reprocessing`);
    }

    if (!String(transcriptText || '').trim()) {
      throw new Error('Transcription returned empty text');
    }

    let movedFile = null;
    if (targetFolderId) {
      movedFile = await moveDriveFile(drive, driveFile, targetFolderId);
    }

    const relativeLocalPath = path.relative(repoRoot, localPath).replace(/\\/g, '/');
    const reprocessNotes = [
      `Reprocess notes (${new Date().toISOString()}):`,
      `- Reprocessed existing Drive content job #${jobId}.`,
      `- Drive file: ${driveFile.name || driveFile.id} (${driveFile.id}).`,
      `- Downloaded to: ${relativeLocalPath}.`,
      `- Transcript captured: ${transcriptText.length} characters.`,
      transcription?.processing?.mode
        ? `- Transcription processing: ${transcription.processing.mode}, ${transcription.processing.chunk_count || 1} chunk(s).`
        : '',
      targetFolderId ? '- Drive file moved to stage: 03 Transcribed.' : '- Drive file not moved: 03 Transcribed folder is not configured.',
    ];

    const updated = await appRequest(config, 'PATCH', `/api/bna/content-jobs/${jobId}`, {
      status: 'transcribed',
      transcript_text: transcriptText,
      transcript_json: transcription,
      drive_folder_id: movedFile?.parents?.[0] || targetFolderId || job.drive_folder_id || null,
      drive_stage: '03 Transcribed',
      notes: appendContentJobNote(job.notes, reprocessNotes),
    });

    let parseResult = null;
    let finalPatchedJob = updated?.job || {};
    const routing = classifyMediaRouting(job.caption || '', transcriptText);
    if (options.parse || (options.autoParse && routing.shouldParse)) {
      parseResult = await parseMixedContentJob(config, jobId, {
        instruction: 'Repair follow-up after Drive transcription reprocess. Parse only actual operator tasks, student accountability, Torah learning updates, class topics, and source questions heard in the transcript.',
      });
      if (parseResult?.success && !parseResult?.dry_run) {
        const stagePatch = await appRequest(config, 'PATCH', `/api/bna/content-jobs/${jobId}`, {
          drive_stage: '04 Parsed',
          notes: appendContentJobNote(updated?.job?.notes || appendContentJobNote(job.notes, reprocessNotes), [
            `Reprocess parse notes (${new Date().toISOString()}):`,
            '- Reprocessed transcript parsed through the mixed-recording parser.',
            '- Content job stage marked 04 Parsed after successful parse.',
          ]),
        });
        finalPatchedJob = stagePatch?.job || finalPatchedJob;
      }
    }

    return {
      job_id: Number(jobId),
      status: finalPatchedJob?.status || updated?.job?.status || 'transcribed',
      drive_stage: finalPatchedJob?.drive_stage || updated?.job?.drive_stage || '03 Transcribed',
      transcript_chars: transcriptText.length,
      local_path: relativeLocalPath,
      drive_file_name: driveFile.name || '',
      parse: parseResult
        ? {
            success: Boolean(parseResult.success),
            skipped: Boolean(parseResult.skipped),
            counts: parseResult.counts || {},
          }
        : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await appRequest(config, 'PATCH', `/api/bna/content-jobs/${jobId}`, {
        status: 'blocked',
        notes: appendContentJobNote(job.notes, [
          `Reprocess failed (${new Date().toISOString()}):`,
          `- Drive file: ${driveFile.name || driveFile.id} (${driveFile.id}).`,
          localPath ? `- Downloaded to: ${path.relative(repoRoot, localPath).replace(/\\/g, '/')}.` : '',
          `- Error: ${message}`,
        ]),
      });
    } catch (patchError) {
      log(`Could not mark content job #${jobId} blocked after reprocess failure: ${patchError instanceof Error ? patchError.message : String(patchError)}`);
    }
    throw error;
  }
}

async function repairDriveContentJobsFromArgs(config, args = []) {
  const jobIds = parseRepairDriveJobIds(args);
  if (!jobIds.length) {
    throw new Error('Provide one or more content job IDs, for example: reprocess-drive-job 73 74');
  }
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    parse: args.includes('--parse'),
    autoParse: args.includes('--auto-parse'),
  };
  const results = [];
  for (const jobId of jobIds) {
    const result = await reprocessDriveContentJob(config, jobId, options);
    results.push(result);
    console.log(JSON.stringify(result));
  }
  return results;
}

async function handleDriveIngestCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const caption = text.replace(/^\/(?:ingest_drive|drive)\b/i, '').trim()
    || DEFAULT_DRIVE_INGEST_CAPTION;

  let drive;
  let pipelineConfig;
  let driveFile;
  let localPath = '';
  let descriptor = null;
  const replyLines = [];

  try {
    const listed = await listDriveRawIntakeFiles();
    drive = listed.drive;
    pipelineConfig = listed.config;
    if (!listed.files.length) {
      await sendReply(
        config.botToken,
        chatId,
        [
          'Drive Raw Media Intake is connected, but I do not see a file there yet.',
          'I checked the configured BNA V2 / 00 Upload Here - Raw Media Intake folder and did not find a media file to process.',
          'If the upload is still syncing, wait until Drive finishes uploading and send the same request again.',
          'If it is in another Drive/account/folder, move it into BNA V2 / 00 Upload Here - Raw Media Intake.',
        ].join('\n'),
        messageId
      );
      return true;
    }

    driveFile = listed.files[0];
    const ingestingFile = await moveDriveFile(drive, driveFile, pipelineConfig.stages?.['02 Ingesting']);
    driveFile = { ...driveFile, ...ingestingFile };
    localPath = await downloadDriveFileToMediaInbox(drive, driveFile);
    descriptor = detectLocalFileDescriptor(localPath);

    replyLines.push(`Picked up ${driveFile.name} from Drive Raw Media Intake.`);
    replyLines.push(`Moved it to Drive stage: 02 Ingesting.`);
    replyLines.push(`Downloaded to ${path.relative(repoRoot, localPath).replace(/\\/g, '/')}.`);
    replyLines.push(
      isImageMime(descriptor.mimeType) && shouldPublishImageToWebsite(caption)
        ? 'Website image publish requested; publishing to the public Learning Moments feed.'
        : 'Queued for transcription, summary, labeling, and repurpose-ready storage. Buffer draft handoff is deferred.'
    );
    await sendReply(config.botToken, chatId, replyLines.join('\n'), messageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sendReply(config.botToken, chatId, `Drive ingest failed before processing: ${message}`, messageId);
    return true;
  }

  if (isImageMime(descriptor.mimeType) && shouldPublishImageToWebsite(caption)) {
    try {
      const result = await publishDriveImageToWebsiteMoments(config, {
        drive,
        pipelineConfig,
        driveFile,
        caption,
        sourceLabel: 'Raw Media Intake',
      });
      await sendReply(
        config.botToken,
        chatId,
        [
          `Published ${driveFile.name} to the website Learning Moments feed.`,
          `Image: ${result.published.image}`,
          `Feed: ${path.relative(repoRoot, publicLearningMomentsFeedFile).replace(/\\/g, '/')}`,
          'Drive original moved to approved website assets.',
        ].join('\n'),
        messageId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failedFolderId = pipelineConfig?.simplifiedFolders?.failedNeedsReview || pipelineConfig?.stages?.['99 Failed'];
      if (failedFolderId) {
        try {
          await moveDriveFile(drive, driveFile, failedFolderId);
        } catch (moveError) {
          log(`Could not move failed Raw Intake website image to review folder: ${moveError instanceof Error ? moveError.message : String(moveError)}`);
        }
      }
      await sendReply(config.botToken, chatId, `Website image publish failed: ${message}`, messageId);
    }
    return true;
  }

  const job = buildJob({
    kind: `drive-${descriptor.kind}`,
    chatId,
    messageId,
    caption,
    localPath,
    mediaUrl: driveFile.webViewLink || '',
    mimeType: descriptor.mimeType,
    status: 'queued',
    notes: [`Google Drive file ${driveFile.id} downloaded from Drive Raw Media Intake`],
  });
  saveJob(job);

  let transcriptText = '';
  let transcription = null;
  let whatsAppDraft = '';
  let facebookDraft = '';
  let whatsAppVideoParts = [];
  let contentJobId = '';
  let whatsAppOutputId = '';
  let facebookOutputId = '';
  let finalDriveStage = '02 Ingesting';
  let contentTitle = '';
  let routing = classifyMediaRouting(caption);

  try {
    if (descriptor.kind === 'video' && shouldGenerateWhatsAppDraft(caption)) {
      try {
        const videoParts = await createWhatsAppVideoParts(localPath);
        whatsAppVideoParts = videoParts.parts;
        replyLines.push(`Created ${whatsAppVideoParts.length} WhatsApp video part(s).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive WhatsApp video part creation failed: ${message}`);
        replyLines.push(`WhatsApp video parts not created: ${message}`);
      }
    }

    if (['video', 'voice', 'document'].includes(descriptor.kind)) {
      try {
        transcription = await transcribeMediaWithOpenAI(config, localPath, descriptor);
        transcriptText = getTranscriptText(transcription);
        finalDriveStage = '03 Transcribed';
        if (transcription?.processing?.mode === 'ffmpeg-audio-chunks') {
          replyLines.push(`Long media prepared as ${transcription.processing.chunk_count} compressed audio chunk(s) for transcription.`);
        }
        replyLines.push(`Transcript captured (${transcriptText.length} characters).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive transcription failed: ${message}`);
        replyLines.push(`Transcription not completed: ${message}`);
      }
    }

    if (!transcriptText && isImageMime(descriptor.mimeType)) {
      try {
        transcriptText = await describeImageWithOpenAI(config, localPath, caption);
        transcription = {
          text: transcriptText,
          kind: 'image_description',
        };
        finalDriveStage = '04 Parsed';
        replyLines.push('Image description captured.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive image description failed: ${message}`);
        replyLines.push(`Image description not completed: ${message}`);
      }
    }

    if (transcriptText && shouldGenerateWhatsAppDraft(caption)) {
      try {
        whatsAppDraft = await generateWhatsAppDraft(config, transcriptText, caption);
        finalDriveStage = '05 WhatsApp Ready';
        replyLines.push('WhatsApp draft generated.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive WhatsApp draft failed: ${message}`);
        replyLines.push(`WhatsApp draft not generated: ${message}`);
      }
    }

    if (transcriptText && shouldGenerateFacebookDraft(caption)) {
      try {
        facebookDraft = await generateFacebookDraft(config, transcriptText, caption);
        if (finalDriveStage === '03 Transcribed') finalDriveStage = '07 Social Candidates';
        replyLines.push('Facebook draft generated.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive Facebook draft failed: ${message}`);
        replyLines.push(`Facebook draft not generated: ${message}`);
      }
    }

    routing = classifyMediaRouting(caption, transcriptText, {
      generatedContent: Boolean(whatsAppDraft || facebookDraft),
    });
    contentTitle = await generateContentTitle(config, transcriptText, caption, `Drive ${driveFile.name}`);

    if (shouldUseRecordingIntake(routing, caption, transcriptText)) {
      try {
        const parsed = await parseMixedRecordingIntake(config, {
          title: contentTitle,
          source_type: 'google_drive',
          source_message_id: String(messageId),
          source_chat_id: chatId,
          local_path: path.relative(repoRoot, localPath).replace(/\\/g, '/'),
          media_url: driveFile.webViewLink || null,
          drive_file_id: driveFile.id,
          drive_folder_id: pipelineConfig.stages?.[finalDriveStage] || null,
          drive_stage: finalDriveStage,
          mime_type: descriptor.mimeType,
          caption,
          transcript_text: buildRecordingIntakeTranscript(caption, transcriptText),
          transcript_json: transcription || null,
        });
        const counts = parsed?.counts || {};
        finalDriveStage = '04 Parsed';
        replyLines.push('Filed Drive recording directly into Tasks/Students; no Content job was created.');
        replyLines.push(`Filed automatically: Tasks ${counts.tasks || 0}, Students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive recording intake parse failed for ${driveFile.name}: ${message}`);
        replyLines.push(`Auto-parse not completed: ${message}`);
      }
    } else {
      const outputs = routing.contentLane
        ? buildGeneratedContentOutputs(descriptor.kind, caption, { whatsAppDraft, facebookDraft })
        : [];
      const processingNotes = replyLines.length
        ? `Processing notes:\n${replyLines.join('\n')}`
        : '';
      const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
        title: contentTitle,
        source_type: 'google_drive',
        source_message_id: String(messageId),
        source_chat_id: chatId,
        local_path: path.relative(repoRoot, localPath).replace(/\\/g, '/'),
        media_url: driveFile.webViewLink || null,
        drive_file_id: driveFile.id,
        drive_folder_id: pipelineConfig.stages?.[finalDriveStage] || null,
        drive_stage: finalDriveStage,
        mime_type: descriptor.mimeType,
        caption,
        status: whatsAppDraft || facebookDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested',
        transcript_text: transcriptText || null,
        transcript_json: transcription || null,
        parse_json: null,
        notes: [
          'Content pipeline job created from Google Drive Raw Media Intake.',
          `Drive stage: ${finalDriveStage}.`,
          whatsAppVideoParts.length
            ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
            : '',
          processingNotes,
        ].filter(Boolean).join('\n'),
        outputs,
      });

      contentJobId = contentJob?.job?.id || '';
      const whatsAppOutput = Array.isArray(contentJob?.outputs)
        ? contentJob.outputs.find((output) => output.output_type === 'whatsapp_update')
        : null;
      whatsAppOutputId = whatsAppOutput?.id || '';
      const facebookOutput = Array.isArray(contentJob?.outputs)
        ? contentJob.outputs.find((output) => output.output_type === 'facebook_post')
        : null;
      facebookOutputId = facebookOutput?.id || '';
      replyLines.push(`Content job: ${contentJobId || 'created'}.`);
      if (contentJobId && routing.shouldParse) {
        try {
          const parsed = await parseMixedContentJob(config, contentJobId);
          await markContentJobParsedAfterMixedParse(config, contentJobId, contentJob?.job?.notes || '');
          const counts = parsed?.counts || {};
          finalDriveStage = '04 Parsed';
          replyLines.push(`Auto-parsed tasks/students: tasks ${counts.tasks || 0}, students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          log(`Drive auto mixed parse failed for content job ${contentJobId}: ${message}`);
          replyLines.push(`Auto-parse not completed: ${message}`);
        }
      }
    }
    if (!whatsAppDraft && !facebookDraft && contentJobId && routing.contentLane) {
      replyLines.push('Telegram next-action buttons queued.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Drive content job capture failed: ${message}`);
    replyLines.push(`Content job was not created: ${message}`);
  }

  try {
    const targetFolderId = pipelineConfig.stages?.[finalDriveStage] || pipelineConfig.stages?.['99 Failed'];
    if (targetFolderId) {
      driveFile = await moveDriveFile(drive, driveFile, targetFolderId);
      replyLines.push(`Moved Drive file to stage: ${finalDriveStage}.`);
    }
  } catch (error) {
    log(`Could not move Drive file after processing: ${error instanceof Error ? error.message : String(error)}`);
  }

  appendMemoryEntry('Drive Asset', replyLines.join('\n'), {
    chat_id: chatId,
    message_id: messageId,
    job_id: job.id,
    drive_file_id: driveFile.id,
  });

  const shouldSyncDriveContentLibrary = Boolean(contentJobId && transcriptText && routing.contentLane);
  if (shouldSyncDriveContentLibrary) {
    replyLines.push('Drive content library sync queued.');
  }

  await sendReply(config.botToken, chatId, [`Saved Drive job ${job.id}.`, ...replyLines].join('\n'), messageId);
  if (shouldSyncDriveContentLibrary) {
    queueDriveContentLibrarySync(config, chatId, messageId, contentJobId);
  }

  for (let index = 0; index < whatsAppVideoParts.length; index += 1) {
    const part = whatsAppVideoParts[index];
    if (part.size > config.telegramUploadMaxBytes) {
      await sendReply(
        config.botToken,
        chatId,
        `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length} is ${formatBytes(part.size)}, so I left it saved locally: ${path.relative(repoRoot, part.localPath).replace(/\\/g, '/')}`,
        messageId
      );
      continue;
    }

    try {
      await telegramUploadFile(
        config.botToken,
        'sendDocument',
        {
          chat_id: chatId,
          reply_to_message_id: messageId,
          caption: `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length}`,
        },
        'document',
        part.localPath,
        part.filename
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Telegram upload of Drive WhatsApp part failed: ${message}`);
      await sendReply(
        config.botToken,
        chatId,
        `WhatsApp video part ${index + 1}/${whatsAppVideoParts.length} was saved locally but could not be uploaded back to Telegram: ${message}`,
        messageId
      );
    }
  }

  if (whatsAppDraft) {
    if (shouldAutoSendGeneratedWhatsAppDraftPreview({ outputId: whatsAppOutputId, contentJobId })) {
      await sendReply(config.botToken, chatId, ['WhatsApp copy draft:', '', whatsAppDraft].join('\n'), messageId);
    } else {
      log(`Automatic Drive WhatsApp draft preview suppressed for Content job ${contentJobId || 'unknown'}; draft is saved in Operations.`);
    }
  }

  if (facebookDraft) {
    if (facebookOutputId) {
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: facebookOutputId,
        jobId: contentJobId,
        body: facebookDraft,
        heading: 'Facebook post draft:',
        approveLabel: 'Save Final Draft',
        publishLabel: 'Commit to Buffer Draft',
      });
    } else {
      await sendReply(config.botToken, chatId, ['Facebook post draft:', '', facebookDraft].join('\n'), messageId);
    }
  }

  if (!whatsAppDraft && !facebookDraft && contentJobId && routing.contentLane) {
    await sendContentNextActionButtons(config.botToken, chatId, messageId, {
      jobId: contentJobId,
      title: contentTitle,
      summary: transcriptText,
      mediaUrl: driveFile.webViewLink || '',
    });
  }

  return true;
}

async function handleTextMessage(config, msg) {
  const chatId = String(msg.chat.id);
  const text = msg.text?.trim() || '';
  const messageId = msg.message_id;

  if (!text) return;
  log(`Text message received from chat ${chatId} message ${messageId}: ${text.slice(0, 120).replace(/\s+/g, ' ')}`);

  if (config.allowedChatIds.length > 0 && !config.allowedChatIds.includes(chatId)) {
    await sendReply(config.botToken, chatId, 'This bot is private.', messageId);
    return;
  }

  if (text === '/start') {
    await sendDashboardMenu(config, chatId, messageId);
    return;
  }

  const requestedMode = detectTelegramModeButton(text);
  if (requestedMode) {
    if (requestedMode === 'codex' && !config.codexEnabled) {
      await sendReply(
        config.botToken,
        chatId,
        'Codex mode is not enabled for this scoped bot. One Time chat stays on Assistant with scoped task access.',
        messageId
      );
      return;
    }
    const mode = setTelegramChatMode(chatId, requestedMode);
    appendMemoryEntry('Telegram Reply Mode', `Mode set to ${mode}.`, {
      chat_id: chatId,
      message_id: messageId,
    });
    await sendReply(
      config.botToken,
      chatId,
      mode === 'codex'
        ? 'Mode set to Codex. I will use Codex for replies until you switch back.'
        : 'Mode set to Assistant chat. Development work still routes to Codex automatically.',
      messageId
    );
    return;
  }

  if (text === '/diagnostics' || text === '/provider_status') {
    const chatMode = getTelegramChatMode(chatId, config);
    await sendReply(
      config.botToken,
      chatId,
      [
        'Assistant diagnostics:',
        `Mode: ${chatMode === 'codex' ? 'Codex' : 'Assistant chat'}`,
        `API path: ${apiProviderPathLabel(config)}`,
        `API keys: OpenAI ${config.openaiApiKey ? 'configured' : 'missing'}, Kimi ${config.kimiApiKey ? 'configured' : 'missing'}`,
        `Codex: ${config.codexEnabled ? 'enabled' : 'disabled'}`,
      ].join('\n'),
      messageId
    );
    return;
  }

  if (text === '/status') {
    const queueCount = listPendingJobs(50).length;
    const chatMode = getTelegramChatMode(chatId, config);
    if (isScopedProjectBot(config)) {
      await sendReply(
        config.botToken,
        chatId,
        [
          'Bridge status: online',
          `Profile: ${config.bridgeProfileLabel}`,
          'Scope: One Time Mishnah Class tasks/comments only',
          `Telegram mode: ${chatMode === 'codex' ? 'Codex' : 'Assistant chat'}`,
          `Assistant chat: ${apiProviderConfigs(config).length ? 'configured' : 'not configured'}`,
          `Scoped Operations login: ${config.opsUsername && config.opsPassword ? 'configured' : 'missing'}`,
          `Allowed chats: ${config.allowedChatIds.join(',') || 'all'}`,
        ].join('\n'),
        messageId,
      );
      return;
    }
    await sendReply(
      config.botToken,
      chatId,
      [
        'Bridge status: online',
        `Profile: ${config.bridgeProfileLabel}`,
        `Telegram mode: ${chatMode === 'codex' ? 'Codex' : 'Assistant chat'}`,
        `Codex CLI: ${config.codexCommand}${config.codexModel ? ` (${config.codexModel})` : ''}`,
        `Assistant chat: ${apiProviderConfigs(config).length ? 'configured' : 'not configured'}`,
        'Workspace: BNA v2.0',
        `Drive watcher: every ${Math.round(config.driveWatchIntervalMs / 1000)}s`,
        `Codex queue: ${agentReplyQueue.length} waiting, ${agentReplyRunning ? '1 active' : '0 active'}`,
        `Pending ops jobs: ${queueCount}`,
      ].join('\n'),
      messageId,
    );
    return;
  }

  if (/^\/(?:ingest_drop|drop)\b/i.test(text)) {
    await handleDropIngestCommand(config, msg);
    return;
  }

  if (/^\/(?:ingest_website_images|website_images|ingest_images)\b/i.test(text)) {
    await handleWebsiteImageIngestCommand(config, msg);
    return;
  }

  if (await handleLiveClassTelegramCommand(config, msg)) {
    appendMemoryEntry('Telegram Live Class Action', redactZoomLinksForTelegram(text), {
      chat_id: chatId,
      message_id: messageId,
    });
    return;
  }

  if (await handleProviderOnboardingTelegramCommand(config, msg)) {
    appendMemoryEntry('Telegram Provider Signup Capture', text, {
      chat_id: chatId,
      message_id: messageId,
    });
    return;
  }

  const intentPlan = planTelegramIntent({
    text,
    replyText: String(msg?.reply_to_message?.text || msg?.reply_to_message?.caption || ''),
    isCommand: /^\/\w+/.test(text),
    scoped: isScopedProjectBot(config),
  });
  const summarizedIntentPlan = summarizeIntentPlan(intentPlan);
  appendMemoryEntry('Telegram Intent Plan', JSON.stringify(summarizedIntentPlan), {
    chat_id: chatId,
    message_id: messageId,
  });
  log(
    `Intent plan for chat ${chatId} message ${messageId}: ` +
    `${summarizedIntentPlan.primaryIntent} confidence=${summarizedIntentPlan.confidence} ` +
    `blocked=${summarizedIntentPlan.blockedHandlers.join(',') || 'none'} approval=${summarizedIntentPlan.requiresApproval ? 'yes' : 'no'}`
  );

  const operatorMemoryAlreadyAppended = !/^\/\w+/.test(text);
  if (operatorMemoryAlreadyAppended) {
    appendMemoryEntry('Telegram Operator', text, {
      chat_id: chatId,
      message_id: messageId,
    });
  }

  const multipartSpecChunk = looksLikeMultipartSpecChunk(text);
  if (!multipartSpecChunk && await handleStructuredTextCommand(config, msg, intentPlan)) {
    appendMemoryEntry('Telegram Action', text, {
      chat_id: chatId,
      message_id: messageId,
    });
    return;
  }

  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  if (!operatorMemoryAlreadyAppended) {
    appendMemoryEntry('Telegram Operator', text, {
      chat_id: chatId,
      message_id: messageId,
    });
  }

  const activePlanningSession = getActivePromptPlanningSession(chatId);
  if (activePlanningSession && isPromptPlanningCancel(text)) {
    finishPromptPlanningSession(chatId, 'cancelled', {
      cancelled_by_message_id: messageId ? String(messageId) : null,
      cancelled_by_text: text,
    });
    appendMemoryEntry('Prompt Planning Cancelled', text, {
      chat_id: chatId,
      message_id: messageId,
      planning_prompt_id: activePlanningSession.id,
    });
    await sendReply(config.botToken, chatId, 'Planning prompt cancelled. Send a new prompt-building request when you want to start again.', messageId);
    return;
  }

  if (activePlanningSession && hasExplicitPromptImplementationStart(text)) {
    const appliedSession = finishPromptPlanningSession(chatId, 'applied', {
      applied_by_message_id: messageId ? String(messageId) : null,
      applied_by_text: text,
    }) || activePlanningSession;
    const codexWorkText = buildCodexWorkFromPlanningSession(appliedSession, text);
    const prompt = buildCodexPrompt(config, codexWorkText, chatId, messageId);
    const replyRouting = { mode: 'codex', reason: 'planning_prompt_applied' };
    appendMemoryEntry('Prompt Planning Applied', codexWorkText, {
      chat_id: chatId,
      message_id: messageId,
      planning_prompt_id: appliedSession.id,
    });

    if (config.asyncAgentReplies) {
      enqueueAgentReplyJob({
        config,
        text: codexWorkText,
        chatId,
        messageId,
        prompt,
        replyRouting,
        trackedTasks: [],
      });
      await sendReply(
        config.botToken,
        chatId,
        'Planning prompt applied. Codex work started from the refined draft, and I will send the result back here.',
        messageId,
      );
      return;
    }

    let reply;
    let replyProvider = 'Codex CLI';
    try {
      reply = await runCodex(prompt, config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Codex planning-prompt execution failed, using API fallback: ${message}`);
      const fallback = await runApiFallback(config, codexWorkText, chatId, messageId);
      replyProvider = `${fallback.provider} API fallback`;
      reply = fallback.reply;
    }
    const delivery = await sendReply(config.botToken, chatId, reply, messageId);
    appendMemoryEntry(`${replyProvider} Reply`, reply, {
      chat_id: chatId,
      reply_to_message_id: messageId,
      reply_mode: 'codex',
      reply_mode_reason: 'planning_prompt_applied',
      telegram_chunks: delivery.chunks,
      telegram_message_ids: delivery.message_ids.join(','),
    });
    return;
  }

  if (activePlanningSession && !hasPromptPlanningIntent(text) && isPromptPlanningRefinement(text)) {
    const session = refinePromptPlanningSession(chatId, messageId, text, activePlanningSession);
    appendMemoryEntry('Prompt Planning Refinement', text, {
      chat_id: chatId,
      message_id: messageId,
      planning_prompt_id: session.id,
    });
    const delivery = await sendReply(config.botToken, chatId, buildPlanningTelegramReply(session), messageId);
    appendMemoryEntry('Prompt Planning Draft', session.current_prompt, {
      chat_id: chatId,
      reply_to_message_id: messageId,
      planning_prompt_id: session.id,
      telegram_chunks: delivery.chunks,
      telegram_message_ids: delivery.message_ids.join(','),
    });
    return;
  }

  if (await handleTypedOperationsAction(config, msg, intentPlan)) {
    return;
  }

  let captureSummary = { enabled: false, tasksCreated: 0, eventsCreated: 0, paymentIntakeCreated: 0 };
  try {
    captureSummary = await captureRambleToApp(config, text, chatId, messageId);
    captureSummary = await handleMultipartSpecContext(config, text, chatId, messageId, captureSummary);
    log(
      `Capture summary for chat ${chatId} message ${messageId}: tasks=${captureSummary.tasksCreated || 0}, events=${captureSummary.eventsCreated || 0}, payments=${captureSummary.paymentIntakeCreated || 0}, contacts=${(captureSummary.contactLeadsCreated || 0) + (captureSummary.contactLeadsUpdated || 0) + (captureSummary.contactLeadsMatched || 0)}, contact_notes=${captureSummary.contactNotesCreated || 0}, comments=${captureSummary.commentsCreated || 0}, support_tickets=${captureSummary.supportTicketsCreated || 0}`
    );
    appendMemoryEntry('BNA Capture', JSON.stringify(captureSummary), {
      chat_id: chatId,
      message_id: messageId,
    });
  } catch (error) {
    log(`BNA app capture failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (hasPromptPlanningIntent(text) && !hasExplicitPromptImplementationStart(text)) {
    const session = createPromptPlanningSession(chatId, messageId, text);
    appendMemoryEntry('Prompt Planning Provenance', text, {
      chat_id: chatId,
      message_id: messageId,
      planning_prompt_id: session.id,
    });
    const reply = [
      buildPlanningTelegramReply(session),
      hasStructuredCapture(captureSummary) ? captureSummaryText(captureSummary) : '',
    ].filter(Boolean).join('\n\n');
    const delivery = await sendReply(config.botToken, chatId, reply, messageId);
    appendMemoryEntry('Prompt Planning Draft', session.current_prompt, {
      chat_id: chatId,
      reply_to_message_id: messageId,
      planning_prompt_id: session.id,
      telegram_chunks: delivery.chunks,
      telegram_message_ids: delivery.message_ids.join(','),
    });
    if (captureSummary.studentMatchDecisions?.length) {
      await sendStudentMatchButtons(config.botToken, chatId, messageId, captureSummary.studentMatchDecisions);
    }
    return;
  }

  const replyRouting = selectTelegramReplyMode(config, chatId, text);
  const canStartCodexWork = !blocksAutomaticCodexWork(text);
  let trackedCodexTasks = canStartCodexWork ? runnableCodexTasksFromCapture(captureSummary) : [];
  let trackedTaskSource = trackedCodexTasks.length ? 'captured_telegram_tasks' : '';
  if (canStartCodexWork && !trackedCodexTasks.length && shouldWorkExistingCodexQueue(text)) {
    try {
      trackedCodexTasks = await loadActiveCodexTasks(config, 8);
      trackedTaskSource = trackedCodexTasks.length ? 'active_codex_task_queue' : '';
    } catch (error) {
      log(`Active Codex task lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (trackedCodexTasks.length) {
    trackedCodexTasks = await markCodexTasksInProgress(config, trackedCodexTasks, chatId, messageId, trackedTaskSource);
  }

  const codexWorkText = trackedCodexTasks.length
    ? buildCodexTaskWorkMessage(text, trackedCodexTasks, trackedTaskSource)
    : text;
  const prompt = buildCodexPrompt(config, codexWorkText, chatId, messageId);

  if (replyRouting.mode === 'codex' && config.asyncAgentReplies) {
    const queued = enqueueAgentReplyJob({
      config,
      text: codexWorkText,
      chatId,
      messageId,
      prompt,
      replyRouting,
      trackedTasks: trackedCodexTasks,
    });
    if (hasStructuredCapture(captureSummary)) {
      await sendReply(
        config.botToken,
        chatId,
        [
          captureSummaryText(captureSummary),
          codexQueueStartedText(trackedCodexTasks),
        ].filter(Boolean).join('\n\n'),
        messageId,
      );
    } else if (trackedCodexTasks.length) {
      await sendReply(
        config.botToken,
        chatId,
        codexQueueStartedText(trackedCodexTasks),
        messageId,
      );
    } else {
      log(`Codex reply job ${queued.id} queued without Telegram placeholder for message ${messageId} (${replyRouting.reason})`);
    }
    if (captureSummary.studentMatchDecisions?.length) {
      await sendStudentMatchButtons(config.botToken, chatId, messageId, captureSummary.studentMatchDecisions);
    }
    return;
  }

  let reply;
  let replyProvider = replyRouting.mode === 'openai' ? 'Assistant' : 'Codex CLI';
  let autoQueuedCodexWork = null;
  if (replyRouting.mode === 'openai' && trackedCodexTasks.length && config.asyncAgentReplies) {
    autoQueuedCodexWork = enqueueAgentReplyJob({
      config,
      text: codexWorkText,
      chatId,
      messageId,
      prompt,
      replyRouting: { mode: 'codex', reason: trackedTaskSource || 'captured_codex_tasks' },
      trackedTasks: trackedCodexTasks,
    });
  }

  if (replyRouting.mode === 'openai') {
    try {
      const apiReply = await runApiFallback(config, text, chatId, messageId);
      replyProvider = `${apiReply.provider} API`;
      reply = apiReply.reply;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Hosted assistant reply failed, trying CLI fallback without Codex: ${message}`);
      try {
        replyProvider = 'Kimi CLI fallback';
        const kimiReply = await runKimi(buildKimiPrompt(config, text, chatId, messageId), config.kimiModel, config.kimiTimeoutMs);
        reply = kimiReply;
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        log(`Kimi CLI fallback also failed: ${fallbackMessage}`);
        replyProvider = 'Hosted chat unavailable';
        reply = [
          'The hosted chat engine is temporarily unavailable for this reply.',
          'To keep Telegram fast, I did not fall back to Codex for this normal chat message.',
          'Press Codex or send a clear build/fix/deploy request if you want coding mode.',
        ].join('\n');
      }
    }
  } else {
    try {
      if (String(config.primaryAgent || '').toLowerCase() === 'kimi') {
        replyProvider = 'Kimi CLI';
        reply = await runKimi(buildKimiPrompt(config, text, chatId, messageId), config.kimiModel, config.kimiTimeoutMs);
      } else {
        reply = await runCodex(prompt, config);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`${replyProvider} failed, using API fallback: ${message}`);
      const fallback = await runApiFallback(config, text, chatId, messageId);
      replyProvider = `${fallback.provider} API fallback`;
      reply = fallback.reply;
    }
  }

  const replyParts = [reply];
  if (captureSummary.enabled && hasStructuredCapture(captureSummary)) {
    replyParts.push(captureSummaryText(captureSummary));
  }
  if (autoQueuedCodexWork) {
    replyParts.push(codexQueueStartedText(trackedCodexTasks));
  }
  reply = replyParts.filter(Boolean).join('\n\n');

  const delivery = await sendReply(config.botToken, chatId, reply, messageId);
  appendMemoryEntry(`${replyProvider} Reply`, reply, {
    chat_id: chatId,
    reply_to_message_id: messageId,
    reply_mode: replyRouting.mode,
    reply_mode_reason: replyRouting.reason,
    telegram_chunks: delivery.chunks,
    telegram_message_ids: delivery.message_ids.join(','),
  });
  if (captureSummary.studentMatchDecisions?.length) {
    await sendStudentMatchButtons(config.botToken, chatId, messageId, captureSummary.studentMatchDecisions);
  }
  const decisionOptions = extractDecisionOptions(reply);
  if (decisionOptions.length) {
    await sendDecisionButtons(config.botToken, chatId, messageId, messageId, decisionOptions, {
      source_text: text,
      reply_text: reply,
    });
  }
}

async function handleCallbackQuery(config, query) {
  const callbackId = query.id;
  const chatId = String(query.message?.chat?.id || '');
  const messageId = query.message?.message_id;
  const data = String(query.data || '');

  if (config.allowedChatIds.length > 0 && !config.allowedChatIds.includes(chatId)) {
    await telegramRequest(config.botToken, 'answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'This bot is private.',
      show_alert: true,
    });
    return;
  }

  const decisionMatch = data.match(/^decision:(\d+):(\d+)$/);
  if (decisionMatch) {
    const sourceMessageId = decisionMatch[1];
    const optionIndex = Number(decisionMatch[2]);
    const decisions = readPendingDecisions();
    const option = decisions[sourceMessageId]?.options?.[optionIndex];

    await telegramRequest(config.botToken, 'answerCallbackQuery', {
      callback_query_id: callbackId,
      text: option ? `Captured: ${option}` : 'Decision captured.',
    });

    appendMemoryEntry('Telegram Decision', option || data, {
      chat_id: chatId,
      source_message_id: sourceMessageId,
      callback_message_id: messageId,
    });

    const sourceText = String(decisions[sourceMessageId]?.source_text || '').trim();
    const continuationText = [
      sourceText,
      option ? `Selected format: ${option}` : '',
    ].filter(Boolean).join('\n');
    const shouldContinueTranscriptTopics = detectWeeklyTranscriptTopicIntent(continuationText)
      || (
        !sourceText
        && /\b(topic|topics|class report|all notes|transcripts?|recordings?|week)\b/i.test(String(option || ''))
      );
    if (shouldContinueTranscriptTopics) {
      await handleWeeklyTranscriptTopicRequest(config, {
        chat: { id: chatId },
        message_id: messageId,
        text: continuationText || 'Go through and list the actual things we learned this week from all transcripts and recordings. Selected format: detailed class report style with all notes.',
      });
      return;
    }

    await sendReply(
      config.botToken,
      chatId,
      option ? `Decision captured: ${option}` : 'Decision captured.',
      messageId
    );
    return;
  }

  const externalActionMatch = data.match(/^external:(approve|cancel):(\d+)$/);
  if (externalActionMatch) {
    const action = externalActionMatch[1];
    const sourceMessageId = externalActionMatch[2];
    const pendingActions = readPendingExternalActions();
    const pending = pendingActions[sourceMessageId];

    if (!pending) {
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: 'That approval request is no longer available.',
        show_alert: true,
      });
      return;
    }

    if (action === 'cancel') {
      deletePendingExternalAction(sourceMessageId);
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: 'Canceled.',
      });
      await sendReply(config.botToken, chatId, 'Canceled. Nothing was sent or published.', messageId);
      return;
    }

    await telegramRequest(config.botToken, 'answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'Confirmed. Running the approved action now.',
    });

    deletePendingExternalAction(sourceMessageId);
    appendMemoryEntry('Telegram External Action Approved', String(pending.text || ''), {
      chat_id: chatId,
      source_message_id: sourceMessageId,
      callback_message_id: messageId,
    });

    const approvedText = stripConfirmationPrefix(pending.text || '');
    const approvedPlan = {
      ...(pending.intent_plan || {}),
      primaryIntent: 'publish_send',
      requiresApproval: false,
      blockedHandlers: [],
    };
    const handled = await handleStructuredTextCommand(config, {
      chat: { id: chatId },
      message_id: Number(sourceMessageId) || messageId,
      text: approvedText,
      reply_to_message: {
        text: pending.reply_text || '',
        caption: pending.reply_caption || '',
      },
      __approvedExternalAction: true,
    }, approvedPlan);

    if (!handled) {
      await sendReply(
        config.botToken,
        chatId,
        'Confirmed, but I could not match that request to a configured send/publish tool. Nothing was sent or published.',
        messageId
      );
    }
    return;
  }

  if (/^task:(mine|codex|kimi|urgent|done):\d+$/.test(data)) {
    await telegramRequest(config.botToken, 'answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'Task quick actions were retired. Use Operations for manual task changes.',
      show_alert: true,
    });
    return;
  }

  const studentMatch = data.match(/^student:(\d+):(\d+)$/);
  if (studentMatch) {
    const eventId = studentMatch[1];
    const studentId = Number(studentMatch[2]);
    try {
      const studentsResult = await appRequest(config, 'GET', '/api/bna/students');
      const student = (studentsResult?.students || []).find((candidate) => Number(candidate.id) === studentId);
      if (!student) throw new Error(`Student #${studentId} was not found`);

      await appRequest(config, 'PATCH', `/api/bna/accountability/${eventId}`, {
        student_id: student.id,
        student_name: student.name,
      });
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: `Attached to ${student.name}.`,
      });
      await sendReply(config.botToken, chatId, `Accountability note #${eventId} attached to ${student.name}.`, messageId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: `Student match failed: ${message.slice(0, 160)}`,
        show_alert: true,
      });
    }
    return;
  }

  const actionMatch = data.match(/^content:(make_whatsapp|make_facebook|make_blog|parse_mixed):(\d+)$/);
  if (actionMatch) {
    const action = actionMatch[1];
    const jobId = actionMatch[2];
    if (action === 'parse_mixed') {
      try {
        await telegramRequest(config.botToken, 'answerCallbackQuery', {
          callback_query_id: callbackId,
          text: 'Parsing tasks and student accountability...',
        });
        const result = await parseMixedContentJob(config, jobId);
        const counts = result?.counts || {};
        const needsReview = Array.isArray(result?.report?.needs_review) ? result.report.needs_review : [];
        await sendReply(
          config.botToken,
          chatId,
          [
            `Parsed Content job #${jobId}.`,
            '',
            `Tasks created: ${counts.tasks || 0}`,
            `Student accountability items: ${counts.accountability_events || 0}`,
            `Group-goal entries: ${counts.group_goal_entries || 0}`,
            `Torah progress entries: ${counts.torah_learning_entries || 0}`,
            result?.report?.summary ? `\nSummary:\n${result.report.summary}` : '',
            needsReview.length ? `\nNeeds review:\n- ${needsReview.slice(0, 6).join('\n- ')}` : '',
            '',
            'Open Students or Tasks in Operations to review what was filed.',
          ].filter(Boolean).join('\n'),
          messageId
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await telegramRequest(config.botToken, 'answerCallbackQuery', {
          callback_query_id: callbackId,
          text: `Parse failed: ${message.slice(0, 160)}`,
          show_alert: true,
        });
        await sendReply(config.botToken, chatId, `Mixed recording parse failed: ${message}`, messageId);
      }
      return;
    }
    const outputType = action === 'make_facebook'
      ? 'facebook_post'
      : action === 'make_blog'
        ? 'blog_draft'
        : 'whatsapp_update';
    const draftLabels = {
      make_facebook: 'Facebook post draft:',
      make_blog: 'Website blog draft:',
      make_whatsapp: 'WhatsApp copy draft:',
    };
    const approveLabels = {
      make_facebook: 'Save Final Draft',
      make_blog: 'Approve Blog',
      make_whatsapp: 'Approve WhatsApp',
    };
    const publishLabels = {
      make_facebook: 'Commit to Buffer Draft',
      make_blog: 'Publish Blog',
      make_whatsapp: '',
    };
    try {
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: action === 'make_facebook'
          ? 'Writing Facebook draft...'
          : action === 'make_blog'
            ? 'Writing website blog draft...'
            : 'Writing WhatsApp copy...',
      });
      const result = await createDraftOutputFromContentJob(config, jobId, outputType);
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: result.output.id,
        jobId: result.job.id,
        body: result.draft,
        heading: [
          draftLabels[action] || 'Content draft:',
          result.prompt?.version ? `Prompt v${result.prompt.version}` : '',
        ].filter(Boolean).join(' '),
        approveLabel: approveLabels[action] || 'Approve',
        publishLabel: publishLabels[action] || '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: `Draft failed: ${message.slice(0, 180)}`,
        show_alert: true,
      });
      await sendReply(config.botToken, chatId, `Draft failed: ${message}`, messageId);
    }
    return;
  }

  const match = data.match(/^content:(approve|reject|publish):(\d+)$/);
  if (!match) {
    await telegramRequest(config.botToken, 'answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'Unknown action.',
    });
    return;
  }

  const action = match[1];
  const outputId = match[2];

  if (action === 'publish') {
    try {
      const result = await appRequest(config, 'POST', `/api/bna/content-outputs/${outputId}/actions`, {
        action: 'approve_publish',
        publishNow: false,
      });
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: String(result?.message || 'Buffer draft created.').slice(0, 180),
      });
      await sendReply(
        config.botToken,
        chatId,
        [
          `Committed Content output #${outputId} to Buffer as a draft.`,
          result?.message || 'The output is approved and available in the connected scheduling surface.',
        ].join('\n'),
        messageId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: `Publish failed: ${message.slice(0, 160)}`,
        show_alert: true,
      });
      await sendReply(config.botToken, chatId, `Publish failed: ${message}`, messageId);
    }
    return;
  }

  const status = action === 'approve' ? 'approved' : 'rejected';
  const result = await appRequest(config, 'PATCH', `/api/bna/content-outputs/${outputId}`, {
    status,
  });
  const output = result?.output;

  await telegramRequest(config.botToken, 'answerCallbackQuery', {
    callback_query_id: callbackId,
    text: status === 'approved' ? 'Approved.' : 'Rejected.',
  });

  let promotedPath = null;
  if (status === 'approved') {
    promotedPath = appendApprovedOutputExample(output);
    if (promotedPath) {
      runDriveMemorySync('push-memory').catch((error) => {
        log(`Approved example Drive push failed: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
  }
  const outputLabel = output?.output_type === 'weekly_newsletter'
    ? 'weekly update'
    : output?.output_type === 'whatsapp_update'
      ? 'WhatsApp draft'
      : output?.output_type === 'facebook_post'
        ? 'Facebook draft'
        : 'content draft';
  const label = status === 'approved' ? `Approved ${outputLabel}` : `Rejected ${outputLabel}`;
  await sendReply(
    config.botToken,
    chatId,
    [
      `${label} #${outputId}.`,
      status === 'approved'
        ? `Already filed: the Content output is marked approved.${promotedPath ? ` Saved as future example: ${promotedPath}.` : ''} You can paste/send it now, or ask me to publish it through the connected channel.`
        : 'Already filed: the Content output is marked rejected. Send the correction as a reply or regenerate from the Content queue.',
      output?.body ? `\nText:\n${output.body}` : '',
    ].filter(Boolean).join('\n'),
    messageId
  );
}

async function ensurePollingMode(botToken) {
  try {
    const info = await telegramRequest(botToken, 'getWebhookInfo');
    if (info?.url) {
      log(`Deleting existing webhook so local polling can take over: ${info.url}`);
      await telegramRequest(botToken, 'deleteWebhook', {
        drop_pending_updates: false,
      });
    }
  } catch (error) {
    log(`Webhook check failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function maybeAutoIngestDrive(config) {
  const chatId = config.allowedChatIds[0];
  if (!chatId) return false;

  let listed;
  try {
    listed = await listDriveRawIntakeFiles({ includeIngestingFallback: false });
  } catch (error) {
    log(`Drive auto-watch skipped: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }

  if (!listed.files.length) return false;

  const newest = listed.files[0];
  log(`Drive auto-watch picked up newest Raw Media Intake file: ${newest.name} (${newest.id})`);
  await handleDriveIngestCommand(config, {
    chat: { id: chatId },
    message_id: 0,
    text: `/ingest_drive ${DEFAULT_DRIVE_INGEST_CAPTION}`,
  });
  return true;
}

async function maybeAutoPublishWebsiteImage(config) {
  const chatId = config.allowedChatIds[0];
  if (!chatId) return false;

  let listed;
  try {
    listed = await listDriveWebsiteImageFiles();
  } catch (error) {
    log(`Website image auto-watch skipped: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }

  if (!listed.files.length) return false;

  const newest = listed.files[0];
  log(`Website image auto-watch picked up newest Website Images file: ${newest.name} (${newest.id})`);
  try {
    const result = await publishDriveImageToWebsiteMoments(config, {
      drive: listed.drive,
      pipelineConfig: listed.config,
      driveFile: newest,
      caption: 'Auto Website Images Intake: publish to the public Learning Moments feed.',
      sourceLabel: 'Website Images intake',
    });
    await sendReply(
      config.botToken,
      chatId,
      [
        `Published Website Images intake photo: ${newest.name}.`,
        `Image: ${result.published.image}`,
        `Feed: ${path.relative(repoRoot, publicLearningMomentsFeedFile).replace(/\\/g, '/')}`,
        'Drive original moved to approved website assets.',
      ].join('\n'),
      0
    );
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Website image auto-watch failed for ${newest.name}: ${message}`);
    const failedFolderId = listed.config?.simplifiedFolders?.failedNeedsReview || listed.config?.stages?.['99 Failed'];
    if (failedFolderId) {
      try {
        await moveDriveFile(listed.drive, newest, failedFolderId);
      } catch (moveError) {
        log(`Could not move failed Website Images auto-watch file: ${moveError instanceof Error ? moveError.message : String(moveError)}`);
      }
    }
    await sendReply(config.botToken, chatId, `Website Images auto-publish failed for ${newest.name}: ${message}`, 0);
    return true;
  }
}

async function getBotIdentity(botToken) {
  const identity = await telegramRequest(botToken, 'getMe');
  return {
    id: identity?.id,
    username: identity?.username || '',
    firstName: identity?.first_name || '',
  };
}

async function main() {
  const args = commandArgs();
  const command = args[0] || '';

  if (command === 'ingest-website-image-once') {
    const config = loadConfig();
    const chatId = config.allowedChatIds[0];
    if (!chatId) throw new Error('No allowed Telegram chat id is configured for one-off website image ingest.');
    await handleWebsiteImageIngestCommand(config, {
      chat: { id: chatId },
      message_id: Math.floor(Date.now() / 1000),
      text: `/website_images ${args.slice(1).join(' ')}`.trim(),
    });
    return;
  }

  if (command === 'ingest-drive-once') {
    const config = loadConfig();
    const chatId = config.allowedChatIds[0];
    if (!chatId) throw new Error('No allowed Telegram chat id is configured for one-off Drive ingest.');
    await handleDriveIngestCommand(config, {
      chat: { id: chatId },
      message_id: Math.floor(Date.now() / 1000),
      text: `/ingest_drive ${args.slice(1).join(' ')}`.trim(),
    });
    return;
  }

  if (command === 'reprocess-drive-job' || command === 'repair-drive-content-job') {
    const config = loadConfig();
    await repairDriveContentJobsFromArgs(config, args.slice(1));
    return;
  }

  acquireLock();
  process.on('exit', releaseLock);
  process.on('SIGINT', () => {
    shutdownBridge(0, 'stopped', { lifecycle: 'signal', signal: 'SIGINT' }).catch(() => {
      releaseLock();
      process.exit(0);
    });
  });
  process.on('SIGTERM', () => {
    shutdownBridge(0, 'stopped', { lifecycle: 'signal', signal: 'SIGTERM' }).catch(() => {
      releaseLock();
      process.exit(0);
    });
  });

  const config = loadConfig();
  if (!config.botToken) {
    throw new Error(isScopedProjectBot(config)
      ? 'No Rabbi Elie Telegram bot token found. Set TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER or add .secrets/telegram-rabbi-elie-scheller-bot-token.txt.'
      : 'No Telegram bot token found. Set TELEGRAM_BOT_TOKEN or add .secrets/telegram-bot-token.txt.');
  }
  if (isScopedProjectBot(config) && (!config.opsUsername || !config.opsPassword)) {
    throw new Error('Rabbi Elie scoped bot requires ONE_TIME_OPS_USERNAME and ONE_TIME_OPS_PASSWORD (or RABBI_ELIE_SCHELLER_OPS_USERNAME/PASSWORD aliases).');
  }
  if (isScopedProjectBot(config) && !config.allowedChatIds.length) {
    throw new Error('Rabbi Elie scoped bot requires TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER (or RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID / ONE_TIME_TELEGRAM_CHAT_ID) before startup.');
  }
  activeTelegramCodexEnabled = Boolean(config.codexEnabled);
  activeBridgeConfig = config;
  activeTokenFingerprint = config.botToken.slice(0, 10).replace(/[^a-zA-Z0-9_-]/g, '_');

  const botIdentity = await getBotIdentity(config.botToken);
  activeBridgeBotIdentity = botIdentity;
  const academyIdentity = config.academyToken
    ? await getBotIdentity(config.academyToken)
    : null;

  if (!isScopedProjectBot(config) && config.academyToken && config.botToken !== config.academyToken) {
    throw new Error('Bridge refused to start because the selected Telegram token is not the academy token.');
  }

  updateBridgeLock({
    profile: config.bridgeProfileLabel,
    bot_id: botIdentity.id || null,
    bot_username: botIdentity.username || '',
    academy_bot_username: academyIdentity?.username || '',
    default_reply_mode: config.telegramDefaultReplyMode || 'openai',
    build_agent: config.codexEnabled ? (config.primaryAgent || 'codex') : 'disabled',
    allowed_chat_ids: config.allowedChatIds,
  });

  await ensurePollingMode(config.botToken);
  stopBridgeRuntimeHeartbeat = startBridgeRuntimeHeartbeat(config, botIdentity);

  let offset = loadOffset();
  let busy = false;
  let nextDriveWatchAt = 0;
  let nextTaskWatchAt = Date.now() + 5000;
  log(
    `Bridge starting. Profile=${config.bridgeProfileLabel} Bot=${botIdentity.username || botIdentity.firstName || botIdentity.id} TelegramDefault=${config.telegramDefaultReplyMode || 'openai'} BuildAgent=${config.codexEnabled ? (config.primaryAgent || 'codex') : 'disabled'} CodexModel=${config.codexModel || 'default'} ApiPath=${apiProviderPathLabel(config)} OpenAIKey=${config.openaiApiKey ? 'yes' : 'no'} KimiKey=${config.kimiApiKey ? 'yes' : 'no'} AllowedChats=${config.allowedChatIds.join(',') || 'all'}`
  );
  if (academyIdentity) {
    log(`Academy token resolves to ${academyIdentity.username || academyIdentity.firstName || academyIdentity.id}`);
  }

  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const updates = await telegramRequest(
        config.botToken,
        'getUpdates',
        {
          offset,
          timeout: 10,
          allowed_updates: ['message', 'callback_query'],
        },
        controller.signal,
      );
      clearTimeout(timeout);

      if (!isScopedProjectBot(config) && !updates.length && !busy && Date.now() >= nextDriveWatchAt) {
        nextDriveWatchAt = Date.now() + config.driveWatchIntervalMs;
        busy = true;
        try {
          const websiteImagePublished = await maybeAutoPublishWebsiteImage(config);
          if (!websiteImagePublished) {
            await maybeAutoIngestDrive(config);
          }
        } catch (error) {
          log(`Drive auto-watch failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          busy = false;
        }
      }

      if (!isScopedProjectBot(config) && !busy && Date.now() >= nextTaskWatchAt) {
        nextTaskWatchAt = Date.now() + config.taskWatchIntervalMs;
        busy = true;
        try {
          await maybeTaskStatusWatch(config);
        } catch (error) {
          log(`Task watch failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          busy = false;
        }
      }

      for (const update of updates) {
        offset = update.update_id + 1;
        saveOffset(offset);

        const msg = update.message;
        const callbackQuery = update.callback_query;
        if (!msg && !callbackQuery) continue;
        const updateKind = callbackQuery
          ? `callback:${String(callbackQuery.data || '').slice(0, 80)}`
          : msg.text
            ? 'text'
            : detectMediaDescriptor(msg)
              ? 'media'
              : 'unsupported';
        log(`Processing Telegram update ${update.update_id} (${updateKind})`);

        if (busy) {
          if (msg) {
            await sendReply(
              config.botToken,
              String(msg.chat.id),
              'Still working on your last message. Send the next one in a moment.',
              msg.message_id,
            );
          } else if (callbackQuery) {
            await telegramRequest(config.botToken, 'answerCallbackQuery', {
              callback_query_id: callbackQuery.id,
              text: 'Still working. Try again in a moment.',
            });
          }
          continue;
        }

        busy = true;
        try {
          if (callbackQuery) {
            await handleCallbackQuery(config, callbackQuery);
          } else if (msg.text) {
            await handleTextMessage(config, msg);
          } else if (detectMediaDescriptor(msg)) {
            if (isScopedProjectBot(config)) {
              await sendReply(
                config.botToken,
                String(msg.chat.id),
                'Media intake is not enabled for the scoped One Time bot yet. Send text task/comment/brainstorm messages here, or use the academy bot for media workflows.',
                msg.message_id,
              );
            } else {
              await handleMediaMessage(config, msg);
            }
          } else {
            await sendReply(
              config.botToken,
              String(msg.chat.id),
              'This message type is not wired yet. Text, photo, video, voice, and document uploads are supported.',
              msg.message_id,
            );
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          log(`Message handling failed: ${message}`);
          try {
            if (msg) {
              await sendReply(
                config.botToken,
                String(msg.chat.id),
                `Bridge error: ${message.slice(0, 700)}`,
                msg.message_id,
              );
            } else if (callbackQuery) {
              await telegramRequest(config.botToken, 'answerCallbackQuery', {
                callback_query_id: callbackQuery.id,
                text: `Bridge error: ${message.slice(0, 180)}`,
                show_alert: true,
              });
            }
          } catch (sendError) {
            log(`Failed to send error reply: ${sendError instanceof Error ? sendError.message : String(sendError)}`);
          }
        } finally {
          busy = false;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Polling loop error: ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

main().catch(async (error) => {
  log(`Fatal bridge error: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  const detail = {
    lifecycle: 'fatal_error',
    error_message: (error instanceof Error ? error.message : String(error)).slice(0, 400),
  };
  if (stopBridgeRuntimeHeartbeat) {
    await stopBridgeRuntimeHeartbeat('error', detail);
  } else if (activeBridgeConfig) {
    await reportBridgeRuntimeStatus(activeBridgeConfig, {
      status: 'error',
      botIdentity: activeBridgeBotIdentity,
      details: detail,
    });
  }
  releaseLock();
  process.exit(1);
});
