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
const mediaInboxDir = path.join(repoRoot, 'media-inbox');
const mediaDropDir = path.join(repoRoot, 'media-drop');
const mediaDropInboxDir = path.join(mediaDropDir, 'inbox');
const mediaDropProcessedDir = path.join(mediaDropDir, 'processed');
const opsPendingDir = path.join(repoRoot, 'ops', 'pending');
const opsCompletedDir = path.join(repoRoot, 'ops', 'completed');

fs.mkdirSync(runtimeDir, { recursive: true });
fs.mkdirSync(mediaInboxDir, { recursive: true });
fs.mkdirSync(mediaDropInboxDir, { recursive: true });
fs.mkdirSync(mediaDropProcessedDir, { recursive: true });
fs.mkdirSync(opsPendingDir, { recursive: true });
fs.mkdirSync(opsCompletedDir, { recursive: true });

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  fs.appendFileSync(logFile, `${stamped}\n`);
}

function acquireLock() {
  try {
    const existingPid = fs.existsSync(lockFile)
      ? Number(JSON.parse(fs.readFileSync(lockFile, 'utf8')).pid || 0)
      : 0;

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
    const parsed = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
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

  return {
    botToken,
    academyToken,
    allowedChatIds,
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
    kimiModel: env.KIMI_CLI_MODEL || 'bna-kimi',
    kimiApiKey: env.KIMI_API_KEY || '',
    kimiApiBaseUrl: env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1',
    kimiApiModel: env.KIMI_MODEL || 'kimi-k2.6',
    kimiTimeoutMs: Number(env.KIMI_BRIDGE_TIMEOUT_MS || 240000),
    openaiApiKey: env.OPENAI_API_KEY || '',
    openaiBaseUrl: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiSummaryModel: env.OPENAI_MODEL || 'gpt-4.1-mini',
    openaiTranscriptionModel: env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-transcribe-diarize',
    transcriptionMaxBytes: Number(env.TRANSCRIPTION_MAX_BYTES || 25 * 1024 * 1024),
    telegramUploadMaxBytes: Number(env.TELEGRAM_UPLOAD_MAX_BYTES || 45 * 1024 * 1024),
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
  const platformFiles = outputType === 'facebook_post'
    ? ['content-memory/platform-prompts/facebook.md', 'content-memory/facebook/examples.md']
    : ['content-memory/platform-prompts/whatsapp.md', 'content-memory/whatsapp/examples.md'];

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

async function listDriveRawIntakeFiles() {
  const auth = loadGoogleDriveAuth();
  const config = loadGoogleDrivePipelineConfig();
  const rawFolderId = config.stages?.['01 Raw Intake'];
  if (!rawFolderId) throw new Error('Drive pipeline config is missing 01 Raw Intake');

  const drive = google.drive({ version: 'v3', auth });
  const result = await drive.files.list({
    q: [
      `'${rawFolderId}' in parents`,
      'trashed=false',
      "mimeType!='application/vnd.google-apps.folder'",
    ].join(' and '),
    fields: 'files(id,name,mimeType,size,webViewLink,createdTime,parents)',
    orderBy: 'createdTime asc',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return {
    drive,
    config,
    files: result.data.files || [],
  };
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

function savePendingDecisionSet(messageId, options) {
  const decisions = readPendingDecisions();
  decisions[String(messageId)] = {
    created_at: new Date().toISOString(),
    options,
  };
  writePendingDecisions(decisions);
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

function buildKimiPrompt(messageText, chatId, messageId) {
  const date = new Date().toISOString();
  const memoryRelativePath = path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/');
  return [
    'You are the active BNA Telegram sidekick for this repository.',
    'Answer using ONLY the repo context included below unless the operator explicitly asks you to inspect or edit code.',
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
    'Repo context: tasks-pending/2026-05-26-login-ghl-audit.md',
    readContextFile('tasks-pending/2026-05-26-login-ghl-audit.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-27-bna-telegram-accountability-audit.md',
    readContextFile('tasks-pending/2026-05-27-bna-telegram-accountability-audit.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-27-content-repurposing-pipeline.md',
    readContextFile('tasks-pending/2026-05-27-content-repurposing-pipeline.md', 1800),
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
    readContextFile(memoryRelativePath, 2200),
    '',
    'Instructions:',
    '- Treat the message as coming from the repo owner in Telegram.',
    '- Keep the reply practical and concise.',
    '- Do not use tools unless the operator explicitly asks you to inspect or change files.',
    '- Return a concise Telegram-ready reply in plain text.',
    '- Use ASCII characters only in the final reply. Do not use emoji, arrows, curly quotes, or em dashes.',
    '- If the message includes a ramble, break it into the clearest next tasks in the reply.',
    '- The BNA dashboard lanes are Tasks, Students, Content, Contacts, and Accounting. Do not use the old Pipeline, Signups, Billing, or Ramble tab language.',
    '- Task stages are Raw Input, Needs Decision, Assigned, In Progress, Done, and Archive.',
    '- The only active workers are Shloimie and Kimi. If assigning work, assign it to one of those two.',
    '- When a decision is needed, give 2-3 crisp options formatted exactly like "Option A: label", "Option B: label", and "Option C: label" so Telegram can create buttons.',
    '- If the request is clear, say what was captured or what you will do next instead of asking unnecessary questions.',
    '- Student accountability means private meeting date, attendance, goals, struggles, interests, decisions, next check-in, and notes about how the discussion went.',
    '- Content is WhatsApp and Facebook first, with YouTube, blog, newsletter, and Google Business Profile as later branches.',
    '- Avoid vague headings like "Next" by itself. Use "Captured", "Already filed", "Queued work", and "Blocked only if blocked".',
    '- Do not ask whether to file tasks if the intent is clear. The bridge already captures tasks, payment intake, accountability, and content jobs.',
    '',
    'Operator message:',
    messageText.trim(),
  ].join('\n');
}

function buildApiFallbackMessages(messageText, chatId, messageId) {
  const date = new Date().toISOString();
  const memoryRelativePath = path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/');
  const system = [
    'You are the active BNA Telegram sidekick for this repository.',
    'Answer using ONLY the repo context provided by the user message.',
    'Keep the reply practical and concise.',
    'Use ASCII characters only in the final reply.',
    'If the message contains a ramble, break it into the clearest next tasks.',
    'Use the BNA lanes Tasks, Students, Content, Contacts, and Accounting. Do not use the old Pipeline, Signups, Billing, or Ramble tab language.',
    'Use task stages Raw Input, Needs Decision, Assigned, In Progress, Done, and Archive.',
    'Only assign work to Shloimie or Kimi.',
    'When a decision is needed, give 2-3 options formatted exactly like "Option A: label", "Option B: label", and "Option C: label" so Telegram can create buttons.',
    'Avoid vague headings like "Next" by itself. Use Captured, Already filed, Queued work, and Blocked only if blocked.',
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
    'Repo context: TASKS.md',
    readContextFile('TASKS.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-26-login-ghl-audit.md',
    readContextFile('tasks-pending/2026-05-26-login-ghl-audit.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-27-bna-telegram-accountability-audit.md',
    readContextFile('tasks-pending/2026-05-27-bna-telegram-accountability-audit.md', 1800),
    '',
    'Repo context: tasks-pending/2026-05-27-content-repurposing-pipeline.md',
    readContextFile('tasks-pending/2026-05-27-content-repurposing-pipeline.md', 1800),
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
    readContextFile(memoryRelativePath, 2200),
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

async function runKimiApiFallback(config, messageText, chatId, messageId) {
  if (!config.kimiApiKey) {
    throw new Error('No KIMI_API_KEY configured for API fallback');
  }

  const { system, user } = buildApiFallbackMessages(messageText, chatId, messageId);
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
  const form = new FormData();
  for (const [key, value] of Object.entries(fields || {})) {
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
    throw new Error(`Telegram ${method} failed: ${data.description || response.status}`);
  }
  return data.result;
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
  if (!/\b(paid|payment|paying|cash|credit|green invoice|invoice|tuition|registration|deposit|שילם|תשלום)\b/.test(normalized)) {
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

  return {
    amount: amountMatch ? Number(amountMatch[1].replace(',', '.')) : null,
    method,
    parent_name: parentMatch?.[1] || null,
    student_name: studentMatch?.[1] || null,
  };
}

function findMentionedStudent(text, students) {
  const normalized = String(text || '').toLowerCase();
  return students.find((student) => {
    const name = String(student.name || '').toLowerCase();
    if (!name) return false;
    const parts = name.split(/\s+/).filter((part) => part.length >= 3);
    return normalized.includes(name) || parts.some((part) => normalized.includes(part));
  }) || null;
}

async function captureRambleToApp(config, text, chatId, messageId) {
  if (!config.opsUsername || !config.opsPassword) {
    return { enabled: false, tasksCreated: 0, eventsCreated: 0 };
  }

  const taskResult = await appRequest(config, 'POST', '/api/bna/tasks', {
    ramble: text,
    source: 'telegram',
    created_by: 'telegram',
  });

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
  for (const unit of splitRambleIntoUnits(text)) {
    const eventType = detectAccountabilityType(unit);
    if (!eventType) continue;

    const student = findMentionedStudent(unit, students);
    await appRequest(config, 'POST', '/api/bna/accountability', {
      event_type: eventType,
      student_id: student?.id || null,
      student_name: student?.name || null,
      title: unit.slice(0, 180),
      notes: text,
      question_text: eventType === 'question' ? unit : null,
      source: 'telegram',
      source_message_id: String(messageId),
    });
    eventsCreated += 1;
  }

  return {
    enabled: true,
    tasksCreated: Number(taskResult?.tasks_created || (taskResult?.task ? 1 : 0)),
    eventsCreated,
    paymentIntakeCreated,
  };
}

function splitTelegramText(text, maxLength = 3500) {
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let remaining = text;
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

async function sendReply(botToken, chatId, text, replyToMessageId) {
  const chunks = splitTelegramText(text);
  for (let i = 0; i < chunks.length; i += 1) {
    const params = {
      chat_id: chatId,
      text: chunks[i],
    };
    // Only reply to message if it's recent (within last hour) to avoid errors
    if (i === 0 && replyToMessageId) {
      params.reply_to_message_id = replyToMessageId;
    }
    try {
      await telegramRequest(botToken, 'sendMessage', params);
    } catch (err) {
      // If replying fails, try without reply_to_message_id
      if (params.reply_to_message_id) {
        delete params.reply_to_message_id;
        await telegramRequest(botToken, 'sendMessage', params);
      } else {
        throw err;
      }
    }
  }
}

async function sendDashboardMenu(botToken, chatId, replyToMessageId) {
  await telegramRequest(botToken, 'sendMessage', {
    chat_id: chatId,
    text: 'BNA Telegram bridge is live. Ramble in plain English or open a lane.',
    reply_to_message_id: replyToMessageId,
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Dashboard', url: 'https://bneineviimacademy.org/operations' }],
        [{ text: 'Tasks', url: 'https://bneineviimacademy.org/operations?view=tasks' }],
        [{ text: 'Students', url: 'https://bneineviimacademy.org/operations?view=students' }],
        [{ text: 'Content', url: 'https://bneineviimacademy.org/operations?view=content' }],
        [{ text: 'Contacts', url: 'https://bneineviimacademy.org/operations?view=contacts' }],
        [{ text: 'Accounting', url: 'https://bneineviimacademy.org/operations?view=accounting' }],
      ],
    },
  });
}

async function sendDecisionButtons(botToken, chatId, replyToMessageId, sourceMessageId, options) {
  if (!options.length) return;
  savePendingDecisionSet(sourceMessageId, options);
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

async function sendContentApproval(botToken, chatId, replyToMessageId, { outputId, jobId, body }) {
  await telegramRequest(botToken, 'sendMessage', {
    chat_id: chatId,
    text: [
      'WhatsApp copy draft:',
      '',
      body,
      '',
      jobId ? `Saved in Content job ${jobId}.` : '',
      '',
      'Approve this text when it is ready to paste/send.',
    ].filter(Boolean).join('\n'),
    reply_to_message_id: replyToMessageId,
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Approve WhatsApp Text', callback_data: `content:approve:${outputId}` },
          { text: 'Reject', callback_data: `content:reject:${outputId}` },
        ],
        [{ text: 'Open Content Queue', url: 'https://bneineviimacademy.org/operations?view=content' }],
      ],
    },
  });
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
  const outputTypes = [
    'whatsapp_update',
    'facebook_post',
    'youtube_description',
    'google_business_post',
    'blog_draft',
    'weekly_newsletter',
    'daily_report',
  ];

  return outputTypes.map((outputType) => ({
    output_type: outputType,
    title: `${outputType.replace(/_/g, ' ')} draft`,
    body: caption || '',
    status: 'draft',
    metadata: { source_media_kind: kind },
  }));
}

function shouldGenerateWhatsAppDraft(caption) {
  return /\b(whatsapp|daily update|parent update|parents|summary|caption)\b/i.test(String(caption || ''));
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

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });

    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${path.basename(command)} exited ${code}: ${(stderr || stdout).slice(0, 1000)}`));
    });
  });
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

  const response = await fetch(`${config.openaiBaseUrl.replace(/\/+$/, '')}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: form,
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
    const transcription = await transcribeSingleMediaWithOpenAI(
      config,
      chunk.localPath,
      chunk.descriptor
    );
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
            'Use warm, natural language.',
            'Use short emoji bullet points. Include simple emojis like 💪 🙂 🤘 👉 when they fit.',
            'Do not overhype. Do not invent details.',
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
        '- /status',
        '- /accounts',
        '- /blogs',
        '- /queue',
        '- /drive_auth',
        '- /sync_drive_memory',
        '- /pull_drive_memory',
        '- /ingest_drive WhatsApp update',
        '- /status',
        '- Send a ramble to capture Tasks, Students, Contacts, or Accounting items',
        '- Upload audio/video/image to create a Content job',
        '- Decision points should come back with quick button-style options',
        '- publish draft <target ...> | your caption',
        '- publish now <target ...> | your caption',
        'Upload a photo, video, or document with a publish command in the caption and I will push the asset into GHL and queue or draft the post.',
      ].join('\n'),
      messageId
    );
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
    await sendReply(config.botToken, chatId, formatQueueReply(listPendingJobs()), messageId);
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

  if (/^\/(?:ingest_drive|drive)\b/i.test(text)) {
    await handleDriveIngestCommand(config, msg);
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
      `1. Use Google Drive: Upload to "01 Raw Intake" folder\n` +
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
        `1. Upload to Google Drive "01 Raw Intake" folder\n` +
        `2. Use /ingest_drop command with a file in media-drop/inbox\n` +
        `3. Compress the video and try again`,
        messageId
      );
      return true;
    }
    throw error;
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
    'Queued for transcription and content processing. GHL upload is deferred until publish approval.',
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
  let whatsAppVideoParts = [];
  let contentJobId = '';
  let whatsAppOutputId = '';

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

    const outputs = defaultContentOutputsForMedia(descriptor.kind, caption);
    if (whatsAppDraft) {
      const whatsAppOutput = outputs.find((output) => output.output_type === 'whatsapp_update');
      if (whatsAppOutput) {
        whatsAppOutput.body = whatsAppDraft;
        whatsAppOutput.status = 'needs_approval';
      }
    }

    const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
      title: `${descriptor.kind} from Telegram ${messageId}`,
      source_type: 'telegram_media',
      source_message_id: String(messageId),
      source_chat_id: chatId,
      local_path: path.relative(repoRoot, download.localPath).replace(/\\/g, '/'),
      media_url: job.mediaUrl || null,
      mime_type: descriptor.mimeType,
      caption,
      status: whatsAppDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested',
      transcript_text: transcriptText || null,
      transcript_json: transcription || null,
      notes: [
        'Content pipeline job created from Telegram media.',
        'GHL upload is intentionally deferred until a publish command or approval step.',
        whatsAppVideoParts.length
          ? `WhatsApp video parts: ${whatsAppVideoParts.map((part) => path.relative(repoRoot, part.localPath).replace(/\\/g, '/')).join(', ')}`
          : '',
        'Queued work: transcribe if audio/video, parse, draft platform outputs, then ask for approval before publishing.',
      ].filter(Boolean).join('\n'),
      outputs,
    });
    contentJobId = contentJob?.job?.id || '';
    const whatsAppOutput = Array.isArray(contentJob?.outputs)
      ? contentJob.outputs.find((output) => output.output_type === 'whatsapp_update')
      : null;
    whatsAppOutputId = whatsAppOutput?.id || '';
    replyLines.push(`Content pipeline job: ${contentJobId || 'created'}.`);
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
    'Queued for local transcription and WhatsApp processing. GHL upload is deferred.',
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
  let whatsAppVideoParts = [];
  let contentJobId = '';
  let whatsAppOutputId = '';

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

    const outputs = defaultContentOutputsForMedia(descriptor.kind, caption);
    if (whatsAppDraft) {
      const whatsAppOutput = outputs.find((output) => output.output_type === 'whatsapp_update');
      if (whatsAppOutput) {
        whatsAppOutput.body = whatsAppDraft;
        whatsAppOutput.status = 'needs_approval';
      }
    }

    const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
      title: `${descriptor.kind} from drop folder ${path.basename(sourcePath)}`,
      source_type: 'local_drop',
      source_message_id: String(messageId),
      source_chat_id: chatId,
      local_path: path.relative(repoRoot, localPath).replace(/\\/g, '/'),
      media_url: null,
      mime_type: descriptor.mimeType,
      caption,
      status: whatsAppDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested',
      transcript_text: transcriptText || null,
      transcript_json: transcription || null,
      notes: [
        'Content pipeline job created from local media-drop folder.',
        'GHL upload is intentionally deferred until a publish command or approval step.',
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
    replyLines.push(`Content pipeline job: ${contentJobId || 'created'}.`);
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
          'Drive Raw Intake is connected, but I do not see a file there yet.',
          'Drop the video into BNA V2 / 01 Raw Intake, then send:',
          '/ingest_drive WhatsApp update',
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

    replyLines.push(`Picked up ${driveFile.name} from Drive Raw Intake.`);
    replyLines.push(`Moved it to Drive stage: 02 Ingesting.`);
    replyLines.push(`Downloaded to ${path.relative(repoRoot, localPath).replace(/\\/g, '/')}.`);
    replyLines.push('Queued for transcription and WhatsApp processing. GHL upload is deferred.');
    await sendReply(config.botToken, chatId, replyLines.join('\n'), messageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sendReply(config.botToken, chatId, `Drive ingest failed before processing: ${message}`, messageId);
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
    notes: [`Google Drive file ${driveFile.id} downloaded from Raw Intake`],
  });
  saveJob(job);

  let transcriptText = '';
  let transcription = null;
  let whatsAppDraft = '';
  let whatsAppVideoParts = [];
  let contentJobId = '';
  let whatsAppOutputId = '';
  let finalDriveStage = '02 Ingesting';

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

    const outputs = defaultContentOutputsForMedia(descriptor.kind, caption);
    if (whatsAppDraft) {
      const whatsAppOutput = outputs.find((output) => output.output_type === 'whatsapp_update');
      if (whatsAppOutput) {
        whatsAppOutput.body = whatsAppDraft;
        whatsAppOutput.status = 'needs_approval';
      }
    }

    const contentJob = await appRequest(config, 'POST', '/api/bna/content-jobs', {
      title: `${descriptor.kind} from Drive ${driveFile.name}`,
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
      status: whatsAppDraft ? 'needs_approval' : transcriptText ? 'transcribed' : 'ingested',
      transcript_text: transcriptText || null,
      transcript_json: transcription || null,
      notes: [
        'Content pipeline job created from Google Drive Raw Intake.',
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
    replyLines.push(`Content job: ${contentJobId || 'created'}.`);
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

  return true;
}

async function handleTextMessage(config, msg) {
  const chatId = String(msg.chat.id);
  const text = msg.text?.trim() || '';
  const messageId = msg.message_id;

  if (!text) return;

  if (config.allowedChatIds.length > 0 && !config.allowedChatIds.includes(chatId)) {
    await sendReply(config.botToken, chatId, 'This bot is private.', messageId);
    return;
  }

  if (text === '/start') {
    await sendDashboardMenu(config.botToken, chatId, messageId);
    return;
  }

  if (text === '/status') {
    const queueCount = listPendingJobs(50).length;
    await sendReply(
      config.botToken,
      chatId,
      `Bridge status: online\nCLI model: ${config.kimiModel}\nAPI fallback: ${config.kimiApiModel}\nWorkspace: BNA v2.0\nPending ops jobs: ${queueCount}`,
      messageId,
    );
    return;
  }

  if (/^\/(?:ingest_drop|drop)\b/i.test(text)) {
    await handleDropIngestCommand(config, msg);
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
    appendMemoryEntry('BNA Capture', JSON.stringify(captureSummary), {
      chat_id: chatId,
      message_id: messageId,
    });
  } catch (error) {
    log(`BNA app capture failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const prompt = buildKimiPrompt(text, chatId, messageId);
  let reply;
  try {
    reply = await runKimi(prompt, config.kimiModel, config.kimiTimeoutMs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/max (number of )?steps reached/i.test(message)) {
      log('CLI reached max steps, using direct Kimi API fallback');
      reply = await runKimiApiFallback(config, text, chatId, messageId);
    } else {
      throw error;
    }
  }

  appendMemoryEntry('Kimi Reply', reply, {
    chat_id: chatId,
    reply_to_message_id: messageId,
  });

  if (captureSummary.enabled) {
    reply = [
      reply,
      '',
      `Captured in BNA: ${captureSummary.tasksCreated} task(s), ${captureSummary.eventsCreated} accountability item(s), ${captureSummary.paymentIntakeCreated || 0} payment intake item(s).`,
    ].join('\n');
  }

  await sendReply(config.botToken, chatId, reply, messageId);
  const decisionOptions = extractDecisionOptions(reply);
  if (decisionOptions.length) {
    await sendDecisionButtons(config.botToken, chatId, messageId, messageId, decisionOptions);
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

    await sendReply(
      config.botToken,
      chatId,
      option ? `Decision captured: ${option}` : 'Decision captured.',
      messageId
    );
    return;
  }

  const match = data.match(/^content:(approve|reject):(\d+)$/);
  if (!match) {
    await telegramRequest(config.botToken, 'answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'Unknown action.',
    });
    return;
  }

  const action = match[1];
  const outputId = match[2];
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
  const label = status === 'approved' ? 'Approved WhatsApp draft' : 'Rejected WhatsApp draft';
  await sendReply(
    config.botToken,
    chatId,
    [
      `${label} #${outputId}.`,
      status === 'approved'
        ? `Already filed: the Content output is marked approved.${promotedPath ? ` Saved as future example: ${promotedPath}.` : ''} You can paste/send the WhatsApp text now.`
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

async function getBotIdentity(botToken) {
  const identity = await telegramRequest(botToken, 'getMe');
  return {
    id: identity?.id,
    username: identity?.username || '',
    firstName: identity?.first_name || '',
  };
}

async function main() {
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
  log(
    `Bridge starting. Bot=${botIdentity.username || botIdentity.firstName || botIdentity.id} Model=${config.kimiModel} AllowedChats=${config.allowedChatIds.join(',') || 'all'}`
  );
  if (academyIdentity) {
    log(`Academy token resolves to ${academyIdentity.username || academyIdentity.firstName || academyIdentity.id}`);
  }

  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);
      const updates = await telegramRequest(
        config.botToken,
        'getUpdates',
        {
          offset,
          timeout: 30,
          allowed_updates: ['message', 'callback_query'],
        },
        controller.signal,
      );
      clearTimeout(timeout);

      for (const update of updates) {
        offset = update.update_id + 1;
        saveOffset(offset);

        const msg = update.message;
        const callbackQuery = update.callback_query;
        if (!msg && !callbackQuery) continue;

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
