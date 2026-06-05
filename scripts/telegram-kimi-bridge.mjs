import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { pipeline as streamPipeline } from 'stream/promises';
import ffmpegPath from 'ffmpeg-static';
import { google } from 'googleapis';
import {
  listSocialAccounts,
  buildAccountAliases,
  uploadLocalFileToGhl,
  createSocialPost,
  listBlogs,
} from './ghl-ops.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, '.runtime');
const logFile = path.join(runtimeDir, 'telegram-kimi-bridge.log');
const envLocalPath = path.join(repoRoot, '.env.local');
const academyTokenFile = path.join(repoRoot, '.secrets', 'telegram-bot-token.txt');
const googleOAuthClientFile = path.join(repoRoot, '.secrets', 'google-oauth-client.json');
const googleRefreshTokenFile = path.join(repoRoot, '.secrets', 'google-refresh-token.txt');
const googleDrivePipelineFile = path.join(repoRoot, '.secrets', 'google-drive-pipeline.json');
const lockFile = path.join(runtimeDir, 'telegram-kimi-bridge.lock');
const pendingDecisionsFile = path.join(runtimeDir, 'telegram-pending-decisions.json');
const telegramChatModesFile = path.join(runtimeDir, 'telegram-chat-modes.json');
const telegramTaskWatchStateFile = path.join(runtimeDir, 'telegram-task-watch-state.json');
const mediaInboxDir = path.join(repoRoot, 'media-inbox');
const mediaDropDir = path.join(repoRoot, 'media-drop');
const mediaDropInboxDir = path.join(mediaDropDir, 'inbox');
const mediaDropProcessedDir = path.join(mediaDropDir, 'processed');
const publicLearningMomentsFeedFile = path.join(repoRoot, 'public', 'data', 'learning-moments.json');
const opsPendingDir = path.join(repoRoot, 'ops', 'pending');
const opsCompletedDir = path.join(repoRoot, 'ops', 'completed');
const agentTaskLedgerFile = path.join(repoRoot, 'ops', 'agent-task-ledger.jsonl');
const agentChangelogFile = path.join(repoRoot, 'ops', 'agent-changelog.md');

fs.mkdirSync(runtimeDir, { recursive: true });
fs.mkdirSync(mediaInboxDir, { recursive: true });
fs.mkdirSync(mediaDropInboxDir, { recursive: true });
fs.mkdirSync(mediaDropProcessedDir, { recursive: true });
fs.mkdirSync(opsPendingDir, { recursive: true });
fs.mkdirSync(opsCompletedDir, { recursive: true });

const agentReplyQueue = [];
let agentReplyRunning = false;
let agentReplySequence = 0;

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

function loadConfig() {
  const fromFile = fs.existsSync(envLocalPath)
    ? parseEnvFile(fs.readFileSync(envLocalPath, 'utf8'))
    : {};

  const academyToken = fs.existsSync(academyTokenFile)
    ? fs.readFileSync(academyTokenFile, 'utf8').trim()
    : '';
  const openaiSecret = fs.existsSync(path.join(repoRoot, '.secrets', 'openai-api-key.txt'))
    ? fs.readFileSync(path.join(repoRoot, '.secrets', 'openai-api-key.txt'), 'utf8').trim()
    : '';
  const kimiSecret = fs.existsSync(path.join(repoRoot, '.secrets', 'kimi-api-key.txt'))
    ? fs.readFileSync(path.join(repoRoot, '.secrets', 'kimi-api-key.txt'), 'utf8').trim()
    : '';

  const env = { ...fromFile, ...process.env };
  const botToken =
    academyToken ||
    env.TELEGRAM_BOT_TOKEN ||
    env.TELEGRAM_BOT_TOKEN_SHLOIMIE ||
    env.TELEGRAM_BOT_TOKEN_AHUVA ||
    '';
  const allowedChatIds = [
    env.TELEGRAM_CHAT_ID_BNA,
    env.TELEGRAM_CHAT_ID,
    env.TELEGRAM_CHAT_ID_SHLOIMIE,
    env.TELEGRAM_CHAT_ID_AHUVA,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());
  const requestedPrimaryAgent = String(env.TELEGRAM_PRIMARY_AGENT || 'codex').trim().toLowerCase();
  const primaryAgent = requestedPrimaryAgent === 'kimi' ? 'codex' : (requestedPrimaryAgent || 'codex');

  return {
    botToken,
    academyToken,
    allowedChatIds,
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
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
    openaiTranscriptionModel: env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe',
    openaiRequestTimeoutMs: Number(env.OPENAI_REQUEST_TIMEOUT_MS || 10 * 60 * 1000),
    telegramDefaultReplyMode: normalizeTelegramReplyMode(
      env.TELEGRAM_DEFAULT_REPLY_MODE || env.TELEGRAM_DEFAULT_CHAT_MODE || 'openai'
    ),
    transcriptionMaxBytes: Number(env.TRANSCRIPTION_MAX_BYTES || 25 * 1024 * 1024),
    telegramUploadMaxBytes: Number(env.TELEGRAM_UPLOAD_MAX_BYTES || 45 * 1024 * 1024),
    driveWatchIntervalMs: Number(env.DRIVE_WATCH_INTERVAL_MS || 10000),
    taskWatchIntervalMs: Number(env.TELEGRAM_TASK_WATCH_INTERVAL_MS || 45000),
  };
}

function loadGoogleDriveAuth() {
  if (!fs.existsSync(googleOAuthClientFile)) {
    throw new Error('Missing .secrets/google-oauth-client.json');
  }
  if (!fs.existsSync(googleRefreshTokenFile)) {
    throw new Error('Missing .secrets/google-refresh-token.txt. Send /drive_auth first.');
  }

  const parsed = JSON.parse(fs.readFileSync(googleOAuthClientFile, 'utf8'));
  const client = parsed.web || parsed.installed;
  const auth = new google.auth.OAuth2(
    client.client_id,
    client.client_secret,
    client.redirect_uris?.[0]
  );
  auth.setCredentials({ refresh_token: fs.readFileSync(googleRefreshTokenFile, 'utf8').trim() });
  return auth;
}

function loadGoogleDrivePipelineConfig() {
  if (!fs.existsSync(googleDrivePipelineFile)) {
    throw new Error('Missing .secrets/google-drive-pipeline.json. Run npm run drive:setup first.');
  }
  return JSON.parse(fs.readFileSync(googleDrivePipelineFile, 'utf8'));
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
    'OpenAI Telegram sidekick capability contract:',
    '- OpenAI is the fast conversational/operator sidekick for brainstorming, planning, tone/content drafting, system navigation, and reading summarized live context.',
    '- OpenAI receives repo context from AGENTS.md, MEMORY.md, TASKS.md, SYSTEM-STATE.md, newest tasks-pending briefs, today memory, shared task ledger, and agent changelog.',
    '- OpenAI receives live app snapshots for system/navigation/task/student/content/accounting questions and Drive snapshots for Drive/upload/intake questions.',
    '- Safe writes already happen before the model reply through bridge capture: Tasks, Student accountability, Accounting/payment intake, Content/media jobs, Decisions, saved Content draft edits, and Codex work queue records.',
    '- Content edits such as revising a newsletter, Facebook post, WhatsApp update, or blog draft should edit the saved Content output directly through OpenAI API first, not be routed as coding work.',
    '- Code edits, filesystem edits, database migrations, deployments, tests, and destructive/high-risk operations must route to Codex as a tracked task/job, not be claimed as completed by OpenAI.',
    '- When OpenAI identifies implementation work, it should say it is queued/assigned to Codex and rely on the bridge task queue/ledger/changelog for synchronization.',
    '- Every meaningful action should be synchronized through durable shared files or app records: memory/YYYY-MM-DD.md, TASKS.md, ops/agent-task-ledger.jsonl, ops/agent-changelog.md, tasks-pending/*.md, and app task records.',
    '- Do not expose secrets, API keys, raw credentials, private access codes, or full raw transcripts unless the operator explicitly asks and the bridge provided them.',
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
  return /\b(system|dashboard|operations|task|tasks|queue|queued|in progress|done|changelog|students?|accountability|torah|learning progress|content|recording|transcript|blog|whatsapp|facebook|newsletter|payments?|accounting|signup|signups|green invoice|projects?|one time|rabbi|what'?s left|what is left|status|capabilities|capability|can you see|what do you see)\b/.test(normalized);
}

function wantsAccountingSnapshot(text) {
  return /\b(payments?|accounting|signup|signups|tuition|cash|credit|green invoice|invoice|paid|unpaid|reminder|due)\b/i.test(String(text || ''));
}

function wantsStudentSnapshot(text) {
  return /\b(students?|accountability|torah|learning progress|goal|goals|inside|listening|private meeting|check-?in)\b/i.test(String(text || ''));
}

function wantsContentSnapshot(text) {
  return /\b(content|recording|transcript|blog|whatsapp|facebook|newsletter|youtube|media|draft|publish|post)\b/i.test(String(text || ''));
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

async function buildBnaAppSnapshotForMessage(config, text) {
  if (!shouldAttachAppContext(text) || !config.opsUsername || !config.opsPassword) return '';

  const includeStudents = wantsStudentSnapshot(text) || /what'?s left|what is left|status|system|dashboard|operations/i.test(text);
  const includeContent = wantsContentSnapshot(text) || /what'?s left|what is left|status|system|dashboard|operations/i.test(text);
  const includeAccounting = wantsAccountingSnapshot(text);

  const requests = [
    ['projects', appRequest(config, 'GET', '/api/bna/projects')],
    ['tasks', appRequest(config, 'GET', '/api/bna/tasks')],
    includeStudents ? ['students', appRequest(config, 'GET', '/api/bna/students')] : null,
    includeStudents ? ['torah', appRequest(config, 'GET', '/api/bna/torah-learning')] : null,
    includeContent ? ['contentJobs', appRequest(config, 'GET', '/api/bna/content-jobs')] : null,
    includeAccounting ? ['signups', appRequest(config, 'GET', '/api/bna/signups')] : null,
    includeAccounting ? ['paymentIntake', appRequest(config, 'GET', '/api/bna/payment-intake')] : null,
    includeAccounting ? ['payments', appRequest(config, 'GET', '/api/bna/payments')] : null,
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
  const activeTasks = tasks.filter((task) => !['done', 'archive'].includes(String(task.stage || ''))).slice(0, 12);
  const recentDoneTasks = tasks.filter((task) => String(task.stage || '') === 'done').slice(0, 6);
  const codexTasks = activeTasks.filter((task) => /codex|kimi|system|agent/i.test(String(task.assigned_to || ''))).slice(0, 8);
  const shloimieTasks = activeTasks.filter((task) => /shloimie/i.test(String(task.assigned_to || ''))).slice(0, 6);
  const decisionTasks = activeTasks.filter((task) => String(task.stage || '') === 'needs_decision' || task.decision_required).slice(0, 6);

  const lines = [
    'Live BNA app snapshot available to the Telegram bridge:',
    '- Source: protected BNA app APIs through the bridge service account.',
    '- Snapshot is summarized and sanitized; secrets, access codes, raw credentials, and full raw transcripts are intentionally omitted.',
  ];

  if (Array.isArray(data.projects?.projects)) {
    lines.push('');
    lines.push('Projects:');
    for (const project of data.projects.projects.slice(0, 8)) {
      lines.push(`- ${project.project_key || project.id}: ${project.name || project.short_name || 'Project'}`);
    }
  }

  lines.push('');
  lines.push(`Tasks: ${tasks.length} visible total, ${activeTasks.length} active shown.`);
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
    lines.push('Recent done tasks:');
    for (const task of recentDoneTasks) lines.push(`- ${compactTaskForContext(task)}`);
  }

  if (includeStudents && Array.isArray(data.students?.students)) {
    const students = data.students.students.slice(0, 12);
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

  if (includeContent && Array.isArray(data.contentJobs?.jobs)) {
    const jobs = data.contentJobs.jobs.slice(0, 10);
    lines.push('');
    lines.push(`Content jobs: ${data.contentJobs.jobs.length} visible, newest ${jobs.length} shown.`);
    for (const job of jobs) lines.push(`- ${compactContentJobForContext(job)}`);
  }

  if (includeAccounting) {
    const signups = Array.isArray(data.signups?.signups) ? data.signups.signups : [];
    const intake = Array.isArray(data.paymentIntake?.intake) ? data.paymentIntake.intake
      : Array.isArray(data.paymentIntake?.items) ? data.paymentIntake.items
      : Array.isArray(data.paymentIntake?.payment_intake) ? data.paymentIntake.payment_intake
        : Array.isArray(data.paymentIntake?.payments) ? data.paymentIntake.payments
          : [];
    const payments = Array.isArray(data.payments?.payments) ? data.payments.payments : [];
    lines.push('');
    lines.push(`Accounting: signups=${signups.length}, payment_intake=${intake.length}, payments=${payments.length}.`);
    for (const item of signups.slice(0, 8)) lines.push(`- signup ${compactPaymentForContext(item)}`);
    for (const item of intake.slice(0, 6)) lines.push(`- intake ${compactPaymentForContext(item)}`);
    for (const item of payments.slice(0, 6)) lines.push(`- payment ${compactPaymentForContext(item)}`);
  }

  if (errors.length) {
    lines.push('');
    lines.push('Snapshot lookup errors:');
    for (const error of errors.slice(0, 6)) lines.push(`- ${error.slice(0, 260)}`);
  }

  lines.push('');
  lines.push('Use this app snapshot to answer navigation/status questions directly. If a write/build/deploy/code edit is needed, route it into tracked Codex work rather than pretending OpenAI performed it.');
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
    return 'No connected GHL social accounts were found for this location.';
  }

  const aliasMap = buildAccountAliases(accounts);
  const lines = ['Connected GHL accounts:'];
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
    return 'No GHL blog site is configured yet for this location.';
  }

  return ['Configured GHL blogs:', ...blogs.map((blog) => `- ${blog.name} (${blog._id})`)].join('\n');
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
  try {
    tasks = await loadLiveTasks(config);
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
  const mine = active.filter((task) => /shloimie|operator/i.test(String(task.assigned_to || task.author || '')));
  const localMediaJobs = listPendingJobs(50);

  const lines = [
    'Live Operations queue:',
    `- Codex Queue: ${codex.length}`,
    `- Decisions: ${decisions.length}`,
    `- My/Operator tasks: ${mine.length}`,
    `- Legacy local media/intake jobs: ${localMediaJobs.length}`,
  ];

  if (codex.length) {
    lines.push('');
    lines.push('Codex Queue:');
    for (const task of codex.slice(0, 12)) {
      lines.push(`- ${taskStatusLine(task)}`);
    }
  }

  if (localMediaJobs.length) {
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
  if (normalized === 'openai api' || normalized === 'open api' || normalized === 'openai') return 'openai';
  return null;
}

function telegramModeKeyboard() {
  return {
    keyboard: [[{ text: 'OpenAI API' }, { text: 'Codex' }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function isLikelyCodexDevelopmentRequest(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (/\bbuild everything\b/.test(normalized)) return true;

  const devVerb = /\b(build|fix|wire|deploy|test|inspect|edit|update|change|add|create|implement|rename|standardize|connect|scope|migrate|refactor|verify)\b/.test(normalized);
  const devObject =
    /\b(repo|backend|database|schema|table|migration|server|server\.js|railway|webhook|telegram bridge|telegram bot|bot setup|agent config|agent configuration|task manager|dashboard|project filter|access|route|routing|parser|buttons?|code|files?)\b/.test(normalized);

  if (devVerb && devObject) return true;
  if (/\b(codex|programming|developer|development|cli|app implementation|backend implementation)\b/.test(normalized)) {
    return /\b(do|build|fix|wire|inspect|edit|update|implement|change|create|setup|set up)\b/.test(normalized);
  }
  return false;
}

function selectTelegramReplyMode(config, chatId, text) {
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

function buildCodexPrompt(messageText, chatId, messageId, extraContext = '') {
  const date = new Date().toISOString();
  const memoryRelativePath = path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/');
  return [
    'You are Codex, the active BNA Telegram development sidekick for this repository.',
    'The operator wants Telegram to feel like talking directly to Codex in the CLI while building the system.',
    'You may inspect and edit files when the operator asks for development work. For pure questions, answer directly.',
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
    'Repo context: tasks-pending/2026-05-26-login-ghl-audit.md',
    readContextFile('tasks-pending/2026-05-26-login-ghl-audit.md', 1800),
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
    '- If you change files, include a short summary and verification in the final reply.',
    '- Return a Telegram-ready reply in plain text.',
    '- Use ASCII characters only in the final reply. Do not use emoji, arrows, curly quotes, or em dashes.',
    '- If the message includes a ramble, break it into the clearest next tasks in the reply.',
    '- The BNA dashboard lanes are Tasks, Students, Content, Contacts, and Accounting. Do not use the old Pipeline, Signups, Billing, or Ramble tab language.',
    '- The Tasks dashboard should feel like a normal task manager: Decisions, My Tasks, Changelog, and Done. Codex machine work belongs in Changelog after it is queued or completed; Shloimie should not see machine work as his personal tasks.',
    '- The active human worker is Shloimie. The active development agent is Codex. Kimi is only a provider fallback or legacy alias.',
    '- Telegram should feel like natural conversation first. Do not announce background queues or Codex job mechanics; mention capture only when a real task, student note, payment item, content item, or decision was created or needs action.',
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

function buildKimiPrompt(messageText, chatId, messageId, extraContext = '') {
  return buildCodexPrompt(messageText, chatId, messageId, extraContext)
    .replace('You are Codex, the active BNA Telegram development sidekick for this repository.', 'You are the active BNA Telegram sidekick for this repository.')
    .replace('The operator wants Telegram to feel like talking directly to Codex in the CLI while building the system.', 'Answer using ONLY the repo context included below unless the operator explicitly asks you to inspect or edit code.');
}

function buildApiFallbackMessages(messageText, chatId, messageId, extraContext = '') {
  const date = new Date().toISOString();
  const memoryRelativePath = path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/');
  const system = [
    'You are the active BNA Telegram sidekick for this repository.',
    'Answer using ONLY the repo context provided by the user message.',
    'Keep the reply practical and concise.',
    'Use ASCII characters only in the final reply.',
    'If the message contains a ramble, break it into the clearest next tasks.',
    'If the operator says "build everything", choose the order from TASKS.md and the newest tasks-pending handoffs, start executing, and do not ask for ordering confirmation unless there is a real blocker or product decision.',
    'Use the BNA lanes Tasks, Students, Content, Contacts, and Accounting. Do not use the old Pipeline, Signups, Billing, or Ramble tab language.',
    'Use task language like Decisions, My Tasks, Changelog, and Done. Codex work belongs in Changelog, not in Shloimie personal tasks.',
    'Only assign work to Shloimie or Codex. Treat Kimi as a fallback provider or legacy alias, not the active worker.',
    'Telegram should feel like natural conversation first. Do not announce background queues or Codex job mechanics; mention capture only when a real task, student note, payment item, content item, or decision was created or needs action.',
    'When a decision is needed, give 2-3 options formatted exactly like "Option A: label", "Option B: label", and "Option C: label" so Telegram can create buttons.',
    'Do not ask format-option questions for transcript/topic/content drafting requests. If the operator asks for topics, a transcript summary, a newsletter, or a revised post, choose the most useful default and return the actual text in chat.',
    'Avoid vague headings like "Next" by itself. Use Captured, Already filed, Queued work, and Blocked only if blocked.',
    'If the operator references recent work by phrase, such as "the image slider", first use SYSTEM-STATE.md and the newest tasks-pending handoff before asking what they mean.',
    'If the live snapshot contains a task that was just auto-captured from the same operator message, do not make that capture the main answer unless the operator asked to create or file a task. Answer the actual question first.',
    'If the operator asks why a Telegram reply was cut off, malformed, or missing, use only the recent Telegram memory included below. Say clearly when OpenAI cannot inspect delivery logs and that Codex must inspect the bridge/logs for a real diagnosis.',
  ].join('\n');

  const user = [
    'Operator message metadata:',
    `- chat_id: ${chatId}`,
    `- message_id: ${messageId}`,
    `- received_at: ${date}`,
    '',
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
    ...(extraContext
      ? [
          'Repo context: request-specific external system snapshot',
          extraContext,
          '',
        ]
      : []),
    'Repo context: tasks-pending/2026-05-26-login-ghl-audit.md',
    readContextFile('tasks-pending/2026-05-26-login-ghl-audit.md', 1800),
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
      reject(new Error(`OpenAI sidekick smoke timed out after ${timeoutMs}ms`));
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
      reject(new Error((stderr || stdout || `OpenAI smoke exited ${code}`).trim()));
    });
  });
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

  const { system, user } = buildApiFallbackMessages(messageText, chatId, messageId, externalContextParts.join('\n\n'));
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

async function runChatApiProvider(provider, messages) {
  const response = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 2200,
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

async function runApiFallback(config, messageText, chatId, messageId) {
  const externalContextParts = [];
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

  const { system, user } = buildApiFallbackMessages(messageText, chatId, messageId, externalContextParts.join('\n\n'));
  const providers = [
    config.openaiApiKey ? {
      kind: 'openai',
      label: 'OpenAI',
      apiKey: config.openaiApiKey,
      baseUrl: config.openaiBaseUrl,
      model: config.openaiSummaryModel,
    } : null,
    config.kimiApiKey ? {
      kind: 'kimi',
      label: 'Kimi',
      apiKey: config.kimiApiKey,
      baseUrl: config.kimiApiBaseUrl,
      model: config.kimiApiModel,
    } : null,
  ].filter(Boolean);

  const errors = [];
  for (const provider of providers) {
    try {
      const reply = await runChatApiProvider(provider, [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      const labeledReply = provider.kind === 'kimi'
        ? [
            'By the way, this is Kimi fallback. OpenAI API was unavailable for this reply, so Kimi is answering using the BNA repo context files that the bridge passed in.',
            '',
            reply,
          ].join('\n')
        : reply;
      return { provider: provider.label, reply: labeledReply, errors };
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
    .split(/\r?\n|[.;]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function detectAccountabilityType(text) {
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
  if (student) return true;

  const normalized = String(text || '').toLowerCase();
  const systemRamble = /\b(api|app|dashboard|telegram|bot|bridge|drive|folder|whisper|openai|kimi|kimmy|codex|video|facebook|whatsapp|youtube|blog|newsletter|pipeline|repo|database|railway|ghl)\b/.test(normalized);
  if (systemRamble) return false;

  if (eventType === 'learning_note' || eventType === 'question') {
    return /\b(class question|student asked|boy asked|asked by|question from)\b/.test(normalized);
  }

  return /\b(private meeting|met with|one on one|1:1|check in|check-in|student goal|goal for|attendance|next meeting|next check)\b/.test(normalized);
}

function extractAccountabilityDetails(text) {
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

async function captureRambleToApp(config, text, chatId, messageId) {
  if (!config.opsUsername || !config.opsPassword) {
    return { enabled: false, tasksCreated: 0, eventsCreated: 0 };
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
    .join('\n')
    .trim();
  const singleSentenceSystemTask = eventsCreated
    && /\b(i need you|can you|fix|build|wire|deploy|codex|bot|dashboard|parser|parse|routing|app|system|website|drive)\b/i.test(text);
  const taskRambleInput = taskRamble || (singleSentenceSystemTask ? text : '');
  if (taskRambleInput && !isExploratoryQuestionWithoutTaskIntent(text)) {
    taskResult = await appRequest(config, 'POST', '/api/bna/tasks', {
      ramble: taskRambleInput,
      source: 'telegram',
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
    tasksCreated: Number(taskResult?.tasks_created || (taskResult?.task ? 1 : 0)),
    tasks: taskResult?.tasks || (taskResult?.task ? [taskResult.task] : []),
    eventsCreated,
    studentMatchDecisions,
    paymentIntakeCreated,
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

async function sendDashboardMenu(botToken, chatId, replyToMessageId) {
  await sendReply(
    botToken,
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

async function sendContentApproval(botToken, chatId, replyToMessageId, {
  outputId,
  jobId,
  body,
  heading = 'WhatsApp copy draft:',
  approveLabel = 'Approve Text',
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
      outputId ? `Content output #${outputId}.` : '',
      '',
      body,
      '',
      jobId ? `Saved in Content job ${jobId}.` : '',
      '',
      'Approve this text when it is ready to paste/send.',
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

  await telegramRequest(botToken, 'sendMessage', {
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
  });
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

  if (captureSummary.eventsCreated) {
    lines.push(`Filed in Students: ${captureSummary.eventsCreated} accountability item(s).`);
  }

  if (captureSummary.paymentIntakeCreated) {
    lines.push(`Filed in Accounting: ${captureSummary.paymentIntakeCreated} payment intake item(s).`);
  }

  return lines.length ? lines.join('\n') : 'Captured in BNA.';
}

function hasStructuredCapture(captureSummary = {}) {
  return Boolean(
    Number(captureSummary.tasksCreated || 0) ||
    Number(captureSummary.eventsCreated || 0) ||
    Number(captureSummary.paymentIntakeCreated || 0) ||
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
  if (!/\b(task|tasks|todo|queue|queued|work|finish|done|codex)\b/.test(normalized)) return false;
  return (
    /\b(work through|keep going|finish up|finish everything|build everything|do all|all of the tasks|all those tasks|start doing|until (they'?re|they are|its|it's) done|not just waiting|not waiting)\b/.test(normalized)
    || /\b(tasks? (are|is) getting worked on|tasks?.*worked on)\b/.test(normalized)
  );
}

function blocksAutomaticCodexWork(text) {
  return /\b(don't build|do not build|don't code|do not code|don't implement|do not implement|nothing yet|not yet|just design|only design|just brainstorm|only brainstorm|tell me first|explain first)\b/i.test(String(text || ''));
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
      reply = await runKimi(buildKimiPrompt(text, chatId, messageId), config.kimiModel, config.kimiTimeoutMs);
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
  return /\b(whatsapp|daily update|parent update|parents|caption)\b/i.test(String(caption || ''))
    && !/\b(do not|don't|dont|not yet|hold|wait)\b/i.test(String(caption || ''));
}

function shouldGenerateFacebookDraft(caption) {
  return /\b(facebook|fb|social post|facebook post)\b/i.test(String(caption || ''))
    && !/\b(do not|don't|dont|not yet|hold|wait)\b/i.test(String(caption || ''));
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
  const text = `${caption || ''}\n${transcriptText || ''}`;
  const marketingIntent = hasMarketingContentIntent(text)
    || Boolean(options.generatedContent)
    || Boolean(options.publishIntent?.isPublishRequest);
  const classContentIntent = hasClassContentIntent(text);
  const parserIntent = hasTaskStudentParserIntent(text);
  const parserOnly = parserIntent && !marketingIntent && !classContentIntent;
  return {
    marketingIntent,
    classContentIntent,
    parserIntent,
    parserOnly,
    contentLane: marketingIntent || classContentIntent || !parserIntent,
    shouldParse: parserIntent || classContentIntent,
  };
}

function shouldAutoParseMixedRecording(transcriptText, caption = '') {
  return classifyMediaRouting(caption, transcriptText).shouldParse;
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
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured for WhatsApp summary generation');
  }

  const platformMemory = buildPlatformMemoryContext('whatsapp_update');
  const approvedExamples = await getApprovedOutputExamples(config, 'whatsapp_update', 3);

  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiSummaryModel,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [
            'You write short WhatsApp captions for Bnei Neviim Academy parents.',
            'Before drafting, use the brand kit, platform prompt, and approved examples provided by the user message.',
            'Return only the message to copy and paste.',
            'Write in English unless the operator explicitly asks for Hebrew.',
            'Use professional, direct parent-update language; do not sound promotional, corny, or fluffy.',
            'Use plain short bullet points; do not use emojis unless the operator explicitly asks for them.',
            'Do not overhype. Do not invent details.',
            'Avoid phrases like "Today at Bnei Neviim Academy", "our learners explored", "journey", "special moments", "that is very special", "the practical message is simple", and similar marketing language.',
            'Do not write "if Torah really matters, the basics have to support it"; state the sleep, breakfast, food, screens, and routine points directly.',
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
      ],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI WhatsApp draft ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = JSON.parse(body);
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

async function generateFacebookDraft(config, transcriptText, caption) {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured for Facebook draft generation');
  }

  const platformMemory = buildPlatformMemoryContext('facebook_post');
  const approvedExamples = await getApprovedOutputExamples(config, 'facebook_post', 3);

  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiSummaryModel,
      temperature: 0.45,
      messages: [
        {
          role: 'system',
          content: [
            'You write Facebook posts for Bnei Neviim Academy.',
            'Use the brand kit, platform prompt, and approved examples provided by the user message.',
            'Return only the Facebook post text.',
            'Write in English unless the operator explicitly asks for Hebrew.',
            'The Facebook version should be warmer, more narrative, and more complete than a WhatsApp bullet update.',
            'Use 2 to 5 short paragraphs or a concise paragraph plus bullets when useful.',
            'Do not overhype. Do not invent details. Preserve Hebrew names and Torah terms when they appear.',
            'Avoid corny school-marketing phrases like "Today at Bnei Neviim Academy", "our learners explored", "journey", and "special moments". Sound like Shloimie speaking clearly to real parents.',
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
      ],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI Facebook draft ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = JSON.parse(body);
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

async function generateContentTitle(config, transcriptText, caption, fallbackName) {
  const fallback = String(fallbackName || 'Drive media').replace(/\.[^.]+$/, '').trim();
  if (!config.openaiApiKey || !String(transcriptText || '').trim()) {
    return fallback;
  }

  try {
    const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: config.openaiSummaryModel,
        temperature: 0.2,
        messages: [
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
        ],
      }),
    });
    const body = await response.text();
    if (!response.ok) return fallback;
    const data = JSON.parse(body);
    return String(data?.choices?.[0]?.message?.content || fallback)
      .replace(/^["']|["']$/g, '')
      .trim()
      .slice(0, 120) || fallback;
  } catch (error) {
    log(`Content title generation skipped: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

async function describeImageWithOpenAI(config, localPath, caption = '') {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured for image description');
  }

  const mimeType = detectLocalFileDescriptor(localPath).mimeType || 'image/jpeg';
  const imageBuffer = fs.readFileSync(localPath);
  const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiSummaryModel,
      temperature: 0.25,
      messages: [
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
      ],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI image description ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = JSON.parse(body);
  return String(data?.choices?.[0]?.message?.content || '').trim();
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
  return (wantsReport && mentionsSource) || directTranscriptAsk || organizeWeeklyRecordings;
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
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured for weekly report generation');
  }

  const jobs = (Array.isArray(jobsInput) ? jobsInput : [jobsInput]).filter(Boolean);
  if (!jobs.length || !jobs.some(contentJobHasTranscript)) {
    throw new Error('No selected content jobs have transcripts yet.');
  }

  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiSummaryModel,
      temperature: 0.45,
      messages: [
        {
          role: 'system',
          content: [
            'You write warm, parent-facing Bnei Neviim Academy weekly updates.',
            'Use the transcript as the factual source. Do not invent details.',
            'Use all provided recordings. The first recording is usually the newest/latest recording; give it proper attention if the operator mentions the last video.',
            'Write in English unless the operator explicitly asks for Hebrew.',
            "Preserve Jewish terms naturally: Torah, Hashem, Har Sinai, naaseh v'nishma, Moshe Rabbeinu, gaavah, anavah.",
            'Style: WhatsApp-ready, clear, warm, compact, and not corny. Sound like a real teacher giving parents a useful update.',
            'Do not open with "Today at Bnei Neviim Academy" or "our learners explored". Prefer a direct opening like "Here is what we covered today" or "This week we focused on...".',
            'Use simple emoji bullets sparingly only when they help readability.',
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
      ],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI weekly report draft ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = JSON.parse(body);
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

function detectWeeklyTranscriptTopicIntent(text) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) return false;

  const mentionsSource = /\b(transcripts?|recordings?|audios?|videos?|content jobs?|all the files|all of them|whole week|this week|rest of the week)\b/.test(normalized);
  const asksForTopics = /\b(list|go through|actual things|topics?|covered|learned|what we learned|discussed|class report|all notes|everything we learned)\b/.test(normalized);
  const asksForFinalDraft = /\b(newsletter|parent update|whatsapp|facebook|post|copy block|caption|draft)\b/.test(normalized);

  return mentionsSource && asksForTopics && !asksForFinalDraft;
}

async function generateWeeklyTranscriptTopicInventory(config, jobsInput, operatorInstruction) {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured for transcript topic generation');
  }

  const jobs = (Array.isArray(jobsInput) ? jobsInput : [jobsInput]).filter(Boolean);
  if (!jobs.length || !jobs.some(contentJobHasTranscript)) {
    throw new Error('No selected content jobs have transcripts yet.');
  }

  const detailed = /\b(detailed|all notes|class report|everything|all of them|all the topics)\b/i.test(String(operatorInstruction || ''));
  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiSummaryModel,
      temperature: 0.25,
      messages: [
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
      ],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI transcript topic inventory ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = JSON.parse(body);
  return String(data?.choices?.[0]?.message?.content || '').trim();
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
  })[outputType] || null;
}

function parseContentOutputTypeFromText(text, fallbackText = '') {
  const normalized = `${text || ''}\n${fallbackText || ''}`.toLowerCase();
  if (/\b(facebook|fb)\b/.test(normalized)) return 'facebook_post';
  if (/\b(whatsapp|what'?s\s*app|wa update|parent update)\b/.test(normalized)) return 'whatsapp_update';
  if (/\b(newsletter|weekly update|week update|end[-\s]?of[-\s]?week|email)\b/.test(normalized)) return 'weekly_newsletter';
  if (/\b(blog|article|website post|website draft)\b/.test(normalized)) return 'blog_draft';
  if (/\blinkedin\b/.test(normalized)) return 'linkedin_post';
  if (/\byoutube\b/.test(normalized)) return 'youtube_description';
  return null;
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
  const draftEvidence = Boolean(outputId || jobId || outputType || contentFollowup || /\b(draft|post|newsletter|facebook|whatsapp|blog|caption|copy block|copy-paste|content output)\b/i.test(combined) || isDraftLikeReply(msg));
  if (!draftEvidence) return null;

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
  const providers = [
    config.openaiApiKey ? {
      kind: 'openai',
      label: 'OpenAI',
      apiKey: config.openaiApiKey,
      baseUrl: config.openaiBaseUrl,
      model: config.openaiSummaryModel,
    } : null,
    config.kimiApiKey ? {
      kind: 'kimi',
      label: 'Kimi',
      apiKey: config.kimiApiKey,
      baseUrl: config.kimiApiBaseUrl,
      model: config.kimiApiModel,
    } : null,
  ].filter(Boolean);

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
        body: provider.kind === 'kimi'
          ? body.replace(/^By the way, this is Kimi fallback\.[\s\S]*?\n\n/i, '').trim()
          : body,
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
    return { approveLabel: 'Approve Facebook', publishLabel: 'Create Facebook Draft' };
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
  const approveVerb = /\b(approve|approved|save|saved|final version|last version|final draft|looks good|i like this|use this|keep this|save this as (an )?example|save as (an )?example|mark approved|this is good)\b/.test(lowerText);
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
    publish: /\b(publish|create facebook draft|send to ghl|push to facebook|post it)\b/.test(lowerText),
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
    if (intent.publish) {
      const result = await appRequest(config, 'POST', `/api/bna/content-outputs/${output.id}/actions`, {
        action: 'approve_publish',
      });
      await sendReply(
        config.botToken,
        chatId,
        [
          `${contentOutputTypeLabel(output.output_type)} #${output.id} approved/published.`,
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

  const mediaItems = [];
  const localPath = job.local_path ? path.resolve(repoRoot, job.local_path) : '';
  if (localPath && fs.existsSync(localPath)) {
    const uploaded = await uploadLocalFileToGhl(localPath, {
      filename: path.basename(localPath),
      mimeType: job.mime_type || 'application/octet-stream',
    });
    if (uploaded?.url) {
      mediaItems.push({
        url: uploaded.url,
        type: job.mime_type || 'application/octet-stream',
        caption: output.body,
      });
    }
  }

  const results = await createSocialPostsForTargets(resolved, output.body, mediaItems, false);
  const failed = results.filter((item) => !item.ok);
  if (failed.length) {
    throw new Error(failed.map((item) => `${item.alias}: ${item.message}`).join('; '));
  }

  await appRequest(config, 'PATCH', `/api/bna/content-outputs/${outputId}`, {
    status: 'approved',
    metadata: {
      ghl_facebook_draft_created_at: new Date().toISOString(),
      ghl_results: results,
      media_uploaded: mediaItems.length > 0,
    },
  });

  return { job, output, results, mediaUploaded: mediaItems.length > 0 };
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
      'Split coding, app, dashboard, parser, website, bot, Railway, GHL, Remotion, or Codex work into Tasks assigned to Codex.',
      'Split student goals, decisions, private meeting notes, and questions into Student Accountability.',
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

async function handleStructuredTextCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);

  if (text === '/help') {
    await sendReply(
      config.botToken,
      chatId,
      [
        'BNA bot commands:',
        '- Plain messages use OpenAI API by default; clear repo/development work routes to Codex',
        '- Press the bottom buttons to switch between OpenAI API and Codex',
        '- /status',
        '- /capabilities',
        '- /smoke_openai',
        '- /agent_fleet_status',
        '- /agent_fleet_start',
        '- /agent_fleet_once',
        '- /accounts',
        '- /blogs',
        '- /queue',
        '- /drive_auth',
        '- /sync_drive_memory',
        '- /pull_drive_memory',
        '- /ingest_drive WhatsApp update',
        '- /website_images publish newest Website Images intake photo to Learning Moments',
        '- /edit_video from 3s to 8s speed up 2x, add subtitle: Forest learning',
        '- /edit_drop brighten it, zoom center, add title: BNA moment',
        '- /status',
        '- Send a ramble to capture Tasks, Students, Contacts, or Accounting items',
        '- Upload audio/video/image to create a Content job',
        '- Reply to a draft or say "edit output #39: make it shorter" to revise saved WhatsApp/Facebook/newsletter/blog drafts through OpenAI',
        '- Reply to a draft with "approve this", "save as final", or "save this as an example" to save it as the approved version',
        '- Ask for "organize all recordings this week" or "make the weekly parent update" to draft from this week\'s transcripts',
        '- Decision points should come back with quick button-style options',
        '- publish draft <target ...> | your caption',
        '- publish now <target ...> | your caption',
        'Upload a photo, video, or document with a publish command in the caption and I will push the asset into GHL and queue or draft the post.',
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
        'OpenAI sidekick capabilities:',
        '',
        `Mode: ${chatMode === 'codex' ? 'Codex forced' : 'OpenAI API default'}`,
        `OpenAI: ${config.openaiApiKey ? `configured (${config.openaiSummaryModel})` : 'missing'}`,
        `Kimi fallback: ${config.kimiApiKey ? `configured (${config.kimiApiModel})` : 'missing'}`,
        '',
        'Can read/summarize:',
        '- AGENTS, MEMORY, TASKS, SYSTEM-STATE, newest tasks-pending briefs',
        '- Today memory, shared agent ledger, and agent changelog tails',
        '- Live BNA app snapshots for task/student/content/accounting/system questions',
        '- Google Drive pipeline snapshots for Drive/upload/intake questions',
        '',
        'Can write safely through the bridge:',
        '- Create Tasks, Student accountability items, Accounting/payment intake, Content jobs, Decisions',
        '- Revise saved WhatsApp, Facebook, newsletter, and blog drafts directly through OpenAI API and save them back to Content outputs',
        '- Approve/save a content draft by plain Telegram text and store approved versions as reusable prompt examples',
        '- Generate weekly parent updates from all recent transcribed Drive/content jobs, not only one latest file',
        '- Queue Codex-owned implementation tasks and mark them in progress',
        '- Ingest media/Drive/drop-folder files, transcribe/describe them, and create content records',
        '',
        'Routes to Codex instead of pretending:',
        '- Code edits, filesystem writes, migrations, deployments, tests, destructive changes, and long implementation work',
        '- Autonomous agent-fleet worker can claim Codex Queue tasks, run Codex, run verifier smokes, update Changelog/ledger, and notify Telegram',
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

  if (text === '/smoke_openai' || text === '/openai_smoke') {
    try {
      await sendReply(config.botToken, chatId, 'Running OpenAI sidekick smoke test now. This checks repo memory, live Operations APIs, Drive folders, transcript exports, and an actual OpenAI answer from that data.', messageId);
      const output = await runOpenAiSidekickSmoke();
      await sendReply(config.botToken, chatId, output || 'OpenAI sidekick smoke completed.', messageId);
    } catch (error) {
      await sendReply(
        config.botToken,
        chatId,
        `OpenAI sidekick smoke failed: ${error instanceof Error ? error.message : String(error)}`,
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
    const accounts = await listSocialAccounts(true);
    await sendReply(config.botToken, chatId, formatAccountsReply(accounts), messageId);
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

  if (await handleContentApprovalTextRequest(config, msg)) {
    return true;
  }

  if (await handleContentDraftEditRequest(config, msg)) {
    return true;
  }

  if (await handleWeeklyTranscriptTopicRequest(config, msg)) {
    return true;
  }

  if (isLatestVideoEditRequest(text)) {
    await handleDriveVideoEditCommand(config, {
      ...msg,
      text: `/edit_video ${text}`,
      caption: '',
    });
    return true;
  }

  if (isLatestDriveIngestRequest(text)) {
    await handleDriveIngestCommand(config, {
      ...msg,
      text: `/ingest_drive ${buildLatestDriveIngestCaption(text)}`,
      caption: '',
    });
    return true;
  }

  if (await handleWeeklyReportRequest(config, msg)) {
    return true;
  }

  const publishIntent = parsePublishIntent(text);
  if (!publishIntent.isPublishRequest) {
    return false;
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
    caption: text,
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
    'Queued for transcription, summary, labeling, and repurpose-ready storage. GHL upload is deferred until publish approval.',
  ];

  if (publishIntent.isPublishRequest) {
    const uploaded = await uploadLocalFileToGhl(download.localPath, {
      filename: descriptor.filename,
      mimeType: descriptor.mimeType,
    });
    job.mediaUrl = uploaded.url;
    replyLines.push(`Uploaded to GHL media storage for publish request: ${uploaded.url}`);

    const mediaItem = {
      url: uploaded.url,
      type: descriptor.mimeType,
      caption: caption || '',
    };
    const accounts = await listSocialAccounts();
    const { resolved, unresolved } = resolveTargetAccounts(publishIntent.targets, accounts);

    if (resolved.length > 0 && unresolved.length === 0) {
      const results = await createSocialPostsForTargets(
        resolved,
        publishIntent.summary || caption,
        [mediaItem],
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
    job.notes = ['Asset saved locally and queued; GHL upload is deferred until publish approval'];
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
    const outputs = routing.contentLane
      ? buildGeneratedContentOutputs(descriptor.kind, caption, { whatsAppDraft, facebookDraft })
      : [];
    const contentTitle = await generateContentTitle(config, transcriptText, caption, `${descriptor.kind} from Telegram ${messageId}`);

    const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
      title: contentTitle,
      source_type: 'telegram_media',
      source_message_id: String(messageId),
      source_chat_id: chatId,
      local_path: path.relative(repoRoot, download.localPath).replace(/\\/g, '/'),
      media_url: job.mediaUrl || null,
      mime_type: descriptor.mimeType,
      caption,
      status: routing.parserOnly ? 'parsing' : (whatsAppDraft || facebookDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested'),
      transcript_text: transcriptText || null,
      transcript_json: transcription || null,
      parse_json: routing.parserOnly
        ? {
          intake_lane: 'tasks_students',
          routing: {
            parser_only: true,
            source: 'telegram_media',
          },
        }
        : null,
      notes: [
        routing.parserOnly
          ? 'Parser intake created from Telegram media. This source should be filed into Tasks/Students and hidden from Content.'
          : 'Content pipeline job created from Telegram media.',
        routing.contentLane ? 'GHL upload is intentionally deferred until a publish command or approval step.' : '',
        whatsAppVideoParts.length
          ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
          : '',
        routing.contentLane
          ? 'Queued work: transcribe, summarize, label, and wait for the next repurposing instruction before drafting platform outputs.'
          : 'Queued work: parse tasks, student accountability, and Torah progress into their proper lanes.',
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
    replyLines.push(
      routing.contentLane
        ? `Content pipeline job: ${contentJobId || 'created'}.`
        : 'Parser intake saved for automatic filing; it will not stay in Content.'
    );
    if (contentJobId && routing.shouldParse) {
      try {
        const parsed = await parseMixedContentJob(config, contentJobId, {
          archiveSourceAfterParse: routing.parserOnly,
        });
        const counts = parsed?.counts || {};
        replyLines.push(
          routing.parserOnly
            ? `Filed automatically: Tasks ${counts.tasks || 0}, Students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`
            : `Auto-parsed tasks/students: tasks ${counts.tasks || 0}, students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Auto mixed parse failed for content job ${contentJobId}: ${message}`);
        replyLines.push(`Auto-parse not completed: ${message}`);
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

  await sendReply(config.botToken, chatId, [`Saved job ${job.id}.`, ...replyLines].join('\n'), messageId);

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
        [
          'WhatsApp copy draft:',
          '',
          whatsAppDraft,
          '',
          contentJobId ? `Saved in Content job ${contentJobId}.` : '',
        ].filter(Boolean).join('\n'),
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
        approveLabel: 'Approve Facebook',
        publishLabel: 'Create Facebook Draft',
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
    'Queued for local transcription, summary, labeling, and repurpose-ready storage. GHL upload is deferred.',
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
    notes: ['Local drop-folder asset saved and queued; GHL upload is deferred until publish approval'],
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
    const outputs = routing.contentLane
      ? buildGeneratedContentOutputs(descriptor.kind, caption, { whatsAppDraft, facebookDraft })
      : [];
    const contentTitle = await generateContentTitle(config, transcriptText, caption, `drop folder ${path.basename(sourcePath)}`);

    const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
      title: contentTitle,
      source_type: 'local_drop',
      source_message_id: String(messageId),
      source_chat_id: chatId,
      local_path: path.relative(repoRoot, localPath).replace(/\\/g, '/'),
      media_url: null,
      mime_type: descriptor.mimeType,
      caption,
      status: routing.parserOnly ? 'parsing' : (whatsAppDraft || facebookDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested'),
      transcript_text: transcriptText || null,
      transcript_json: transcription || null,
      parse_json: routing.parserOnly
        ? {
          intake_lane: 'tasks_students',
          routing: {
            parser_only: true,
            source: 'local_drop',
          },
        }
        : null,
      notes: [
        routing.parserOnly
          ? 'Parser intake created from local media-drop folder. This source should be filed into Tasks/Students and hidden from Content.'
          : 'Content pipeline job created from local media-drop folder.',
        routing.contentLane ? 'GHL upload is intentionally deferred until a publish command or approval step.' : '',
        whatsAppVideoParts.length
          ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
          : '',
        routing.contentLane
          ? 'Queued work: WhatsApp lane first; blogs/social/video-editor templates are later channels.'
          : 'Queued work: parse tasks, student accountability, and Torah progress into their proper lanes.',
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
    replyLines.push(
      routing.contentLane
        ? `Content pipeline job: ${contentJobId || 'created'}.`
        : 'Parser intake saved for automatic filing; it will not stay in Content.'
    );
    if (contentJobId && routing.shouldParse) {
      try {
        const parsed = await parseMixedContentJob(config, contentJobId, {
          archiveSourceAfterParse: routing.parserOnly,
        });
        const counts = parsed?.counts || {};
        replyLines.push(
          routing.parserOnly
            ? `Filed automatically: Tasks ${counts.tasks || 0}, Students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`
            : `Auto-parsed tasks/students: tasks ${counts.tasks || 0}, students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drop auto mixed parse failed for content job ${contentJobId}: ${message}`);
        replyLines.push(`Auto-parse not completed: ${message}`);
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
        approveLabel: 'Approve Facebook',
        publishLabel: 'Create Facebook Draft',
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

async function handleDriveIngestCommand(config, msg) {
  const chatId = String(msg.chat.id);
  const messageId = msg.message_id;
  const text = getTelegramMessageText(msg);
  const caption = text.replace(/^\/(?:ingest_drive|drive)\b/i, '').trim()
    || 'WhatsApp update: make this into a parent WhatsApp summary with bullet points and split the video if needed.';

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
        : 'Queued for transcription, summary, labeling, and repurpose-ready storage. GHL upload is deferred.'
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
    const outputs = routing.contentLane
      ? buildGeneratedContentOutputs(descriptor.kind, caption, { whatsAppDraft, facebookDraft })
      : [];
    contentTitle = await generateContentTitle(config, transcriptText, caption, `Drive ${driveFile.name}`);

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
      status: routing.parserOnly ? 'parsing' : (whatsAppDraft || facebookDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested'),
      transcript_text: transcriptText || null,
      transcript_json: transcription || null,
      parse_json: routing.parserOnly
        ? {
          intake_lane: 'tasks_students',
          routing: {
            parser_only: true,
            source: 'google_drive',
          },
        }
        : null,
      notes: [
        routing.parserOnly
          ? 'Parser intake created from Google Drive Raw Media Intake. This source should be filed into Tasks/Students and hidden from Content.'
          : 'Content pipeline job created from Google Drive Raw Media Intake.',
        `Drive stage: ${finalDriveStage}.`,
        whatsAppVideoParts.length
          ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
          : '',
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
    replyLines.push(
      routing.contentLane
        ? `Content job: ${contentJobId || 'created'}.`
        : 'Parser intake saved for automatic filing; it will not stay in Content.'
    );
    if (contentJobId && routing.shouldParse) {
      try {
        const parsed = await parseMixedContentJob(config, contentJobId, {
          archiveSourceAfterParse: routing.parserOnly,
        });
        const counts = parsed?.counts || {};
        finalDriveStage = '04 Parsed';
        replyLines.push(
          routing.parserOnly
            ? `Filed automatically: Tasks ${counts.tasks || 0}, Students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`
            : `Auto-parsed tasks/students: tasks ${counts.tasks || 0}, students ${counts.accountability_events || 0}, Torah ${counts.torah_learning_entries || counts.group_goal_entries || 0}.`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log(`Drive auto mixed parse failed for content job ${contentJobId}: ${message}`);
        replyLines.push(`Auto-parse not completed: ${message}`);
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

  await sendReply(config.botToken, chatId, [`Saved Drive job ${job.id}.`, ...replyLines].join('\n'), messageId);

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
    if (whatsAppOutputId) {
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: whatsAppOutputId,
        jobId: contentJobId,
        body: whatsAppDraft,
      });
    } else {
      await sendReply(config.botToken, chatId, ['WhatsApp copy draft:', '', whatsAppDraft].join('\n'), messageId);
    }
  }

  if (facebookDraft) {
    if (facebookOutputId) {
      await sendContentApproval(config.botToken, chatId, messageId, {
        outputId: facebookOutputId,
        jobId: contentJobId,
        body: facebookDraft,
        heading: 'Facebook post draft:',
        approveLabel: 'Approve Facebook',
        publishLabel: 'Create Facebook Draft',
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
    await sendDashboardMenu(config.botToken, chatId, messageId);
    return;
  }

  const requestedMode = detectTelegramModeButton(text);
  if (requestedMode) {
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
        : 'Mode set to OpenAI API. Normal chat and content tone stay on OpenAI API, and development work still routes to Codex automatically.',
      messageId
    );
    return;
  }

  if (text === '/status') {
    const queueCount = listPendingJobs(50).length;
    const chatMode = getTelegramChatMode(chatId, config);
    await sendReply(
      config.botToken,
      chatId,
      [
        'Bridge status: online',
        `Telegram mode: ${chatMode === 'codex' ? 'Codex' : 'OpenAI API default'}`,
        `Codex CLI: ${config.codexCommand}${config.codexModel ? ` (${config.codexModel})` : ''}`,
        `API path: OpenAI API (${config.openaiSummaryModel}) -> Kimi API (${config.kimiApiModel})`,
        `API keys: OpenAI ${config.openaiApiKey ? 'configured' : 'missing'}, Kimi ${config.kimiApiKey ? 'configured' : 'missing'}`,
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

  if (await handleStructuredTextCommand(config, msg)) {
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

  appendMemoryEntry('Telegram Operator', text, {
    chat_id: chatId,
    message_id: messageId,
  });

  let captureSummary = { enabled: false, tasksCreated: 0, eventsCreated: 0, paymentIntakeCreated: 0 };
  try {
    captureSummary = await captureRambleToApp(config, text, chatId, messageId);
    log(
      `Capture summary for chat ${chatId} message ${messageId}: tasks=${captureSummary.tasksCreated || 0}, events=${captureSummary.eventsCreated || 0}, payments=${captureSummary.paymentIntakeCreated || 0}`
    );
    appendMemoryEntry('BNA Capture', JSON.stringify(captureSummary), {
      chat_id: chatId,
      message_id: messageId,
    });
  } catch (error) {
    log(`BNA app capture failed: ${error instanceof Error ? error.message : String(error)}`);
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
  const prompt = buildCodexPrompt(codexWorkText, chatId, messageId);

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
  let replyProvider = replyRouting.mode === 'openai' ? 'OpenAI API' : 'Codex CLI';
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
      log(`OpenAI default reply failed, trying Kimi CLI fallback without Codex: ${message}`);
      try {
        replyProvider = 'Kimi CLI fallback';
        const kimiReply = await runKimi(buildKimiPrompt(text, chatId, messageId), config.kimiModel, config.kimiTimeoutMs);
        reply = [
          'By the way, this is Kimi fallback. OpenAI API was unavailable for this reply, so Kimi is answering using the BNA repo context files that the bridge passed in.',
          '',
          kimiReply,
        ].join('\n');
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        log(`Kimi CLI fallback also failed: ${fallbackMessage}`);
        replyProvider = 'OpenAI and Kimi unavailable';
        reply = [
          'OpenAI API mode is selected, but the bridge could not use OpenAI or Kimi for this chat reply.',
          '',
          `OpenAI/API reason: ${message.slice(0, 350)}`,
          `Kimi reason: ${fallbackMessage.slice(0, 350)}`,
          '',
          'To keep Telegram fast, I did not fall back to Codex for this normal chat message.',
          'Press Codex or send a clear build/fix/deploy request if you want coding mode.',
        ].join('\n');
      }
    }
  } else {
    try {
      if (String(config.primaryAgent || '').toLowerCase() === 'kimi') {
        replyProvider = 'Kimi CLI';
        reply = await runKimi(buildKimiPrompt(text, chatId, messageId), config.kimiModel, config.kimiTimeoutMs);
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

  const taskMatch = data.match(/^task:(mine|codex|kimi|urgent|done):(\d+)$/);
  if (taskMatch) {
    const action = taskMatch[1];
    const normalizedAction = action === 'kimi' ? 'codex' : action;
    const taskId = taskMatch[2];
    const patch = {};
    if (action === 'mine') {
      patch.stage = 'assigned';
      patch.assigned_to = 'Shloimie';
    } else if (action === 'codex' || action === 'kimi') {
      patch.stage = 'assigned';
      patch.assigned_to = 'Codex';
    } else if (action === 'urgent') {
      patch.urgency = 'urgent';
    } else if (action === 'done') {
      patch.stage = 'done';
      patch.completed_at = new Date().toISOString();
      patch.verified_at = new Date().toISOString();
      patch.verification_notes = 'Marked done from Telegram quick action.';
    }

    try {
      const result = await appRequest(config, 'PATCH', `/api/bna/tasks/${taskId}`, patch);
      const task = result?.task || {};
      appendAgentTaskLedger({
        event: 'task_updated',
        source: 'telegram_callback',
        chat_id: chatId,
        callback_message_id: messageId,
        task_id: taskId,
        action: normalizedAction,
        patch,
        title: task.title || null,
        stage: task.stage || patch.stage || null,
        urgency: task.urgency || patch.urgency || null,
        assigned_to: task.assigned_to || patch.assigned_to || null,
      });
      if (action === 'done' || (task.assigned_to && /kimi|codex|system/i.test(task.assigned_to) && task.stage === 'done')) {
        appendAgentChangelog({
          title: task.title || `Task #${taskId} completed`,
          summary: task.verification_notes || task.notes || `Task #${taskId} was marked done from Telegram.`,
          task_id: taskId,
          source: 'telegram_callback',
          worker: task.assigned_to || 'agent',
        });
      }
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: `Task updated: ${normalizedAction}.`,
      });
      await sendReply(config.botToken, chatId, `Task #${taskId} updated: ${normalizedAction}.`, messageId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: `Task update failed: ${message.slice(0, 160)}`,
        show_alert: true,
      });
    }
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
      make_facebook: 'Approve Facebook',
      make_blog: 'Approve Blog',
      make_whatsapp: 'Approve WhatsApp',
    };
    const publishLabels = {
      make_facebook: 'Create Facebook Draft',
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
      });
      await telegramRequest(config.botToken, 'answerCallbackQuery', {
        callback_query_id: callbackId,
        text: String(result?.message || 'Published.').slice(0, 180),
      });
      await sendReply(
        config.botToken,
        chatId,
        [
          `Published Content output #${outputId}.`,
          result?.message || 'The output is approved and filed in the content system.',
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

  await telegramRequest(config.botToken, 'answerCallbackQuery', {
    callback_query_id: callbackId,
    text: status === 'approved' ? 'Approved.' : 'Rejected.',
  });

  const output = result?.output;
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
    text: [
      '/ingest_drive Auto Drive Intake:',
      'Transcribe audio/video or describe image.',
      'Title/name it from the content.',
      'Save it in the BNA content queue with the Drive link.',
      'Then ask the operator what to do next with WhatsApp and Facebook buttons.',
    ].join(' '),
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
  if (process.argv[2] === 'ingest-website-image-once') {
    const config = loadConfig();
    const chatId = config.allowedChatIds[0];
    if (!chatId) throw new Error('No allowed Telegram chat id is configured for one-off website image ingest.');
    await handleWebsiteImageIngestCommand(config, {
      chat: { id: chatId },
      message_id: Math.floor(Date.now() / 1000),
      text: `/website_images ${process.argv.slice(3).join(' ')}`.trim(),
    });
    return;
  }

  if (process.argv[2] === 'ingest-drive-once') {
    const config = loadConfig();
    const chatId = config.allowedChatIds[0];
    if (!chatId) throw new Error('No allowed Telegram chat id is configured for one-off Drive ingest.');
    await handleDriveIngestCommand(config, {
      chat: { id: chatId },
      message_id: Math.floor(Date.now() / 1000),
      text: `/ingest_drive ${process.argv.slice(3).join(' ')}`.trim(),
    });
    return;
  }

  acquireLock();
  process.on('exit', releaseLock);
  process.on('SIGINT', () => {
    releaseLock();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    releaseLock();
    process.exit(0);
  });

  const config = loadConfig();
  if (!config.botToken) {
    throw new Error('No Telegram bot token found. Set TELEGRAM_BOT_TOKEN or add .secrets/telegram-bot-token.txt.');
  }
  activeTokenFingerprint = config.botToken.slice(0, 10).replace(/[^a-zA-Z0-9_-]/g, '_');

  const botIdentity = await getBotIdentity(config.botToken);
  const academyIdentity = config.academyToken
    ? await getBotIdentity(config.academyToken)
    : null;

  if (config.academyToken && config.botToken !== config.academyToken) {
    throw new Error('Bridge refused to start because the selected Telegram token is not the academy token.');
  }

  await ensurePollingMode(config.botToken);

  let offset = loadOffset();
  let busy = false;
  let nextDriveWatchAt = 0;
  let nextTaskWatchAt = Date.now() + 5000;
  log(
    `Bridge starting. Bot=${botIdentity.username || botIdentity.firstName || botIdentity.id} TelegramDefault=${config.telegramDefaultReplyMode || 'openai'} BuildAgent=${config.primaryAgent || 'codex'} CodexModel=${config.codexModel || 'default'} ApiFallback=${config.openaiSummaryModel}->${config.kimiApiModel} OpenAIKey=${config.openaiApiKey ? 'yes' : 'no'} KimiKey=${config.kimiApiKey ? 'yes' : 'no'} AllowedChats=${config.allowedChatIds.join(',') || 'all'}`
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

      if (!updates.length && !busy && Date.now() >= nextDriveWatchAt) {
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

      if (!busy && Date.now() >= nextTaskWatchAt) {
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
            await handleMediaMessage(config, msg);
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

main().catch((error) => {
  log(`Fatal bridge error: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  process.exit(1);
});
