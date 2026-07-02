import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const integrationSecretLoader = require('../src/lib/integrations/secret-loader');
const aiCredentialResolver = require('../src/lib/integrations/ai-credential-resolver');
const repoRoot = path.resolve(__dirname, '..');
const secretsDir = path.join(repoRoot, '.secrets');
const clientPath = path.join(secretsDir, 'google-oauth-client.json');
const tokenPath = path.join(secretsDir, 'google-refresh-token.txt');
const pipelinePath = path.join(secretsDir, 'google-drive-pipeline.json');
const openAiSecretPath = path.join(secretsDir, 'openai-api-key.txt');
const kimiSecretPath = path.join(secretsDir, 'kimi-api-key.txt');

const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const GOOGLE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const APP_MARKER_KEY = 'bnaContentLibrary';
const APP_MARKER_VALUE = 'marketing';

const FOLDER_NAMES = {
  root: '40 Content Library - Marketing',
  transcripts: '01 Transcript Library',
  indexes: '02 Article Source Indexes',
  websiteArticles: '03 Website Articles',
  draftArticles: '04 Draft Articles',
  approvedCopy: '05 Published / Approved Copy',
  archive: '99 Content Archive',
};

const TEST_TITLE_RE = /\b(smoke|test content|prompt studio|codex smoke|selected-content)\b/i;
const OPERATIONAL_TITLE_RE = /\b(complete google business profile|handling ui updates|extracting questions from all transcripts|setting up automated facebook post)\b/i;

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
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
    env[key] = value;
  }
  return env;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readSecret(name, env = {}) {
  if (env[name]) return env[name];
  if (name === 'OPENAI_API_KEY' && fs.existsSync(openAiSecretPath)) {
    return fs.readFileSync(openAiSecretPath, 'utf8').trim();
  }
  if (name === 'KIMI_API_KEY' && fs.existsSync(kimiSecretPath)) {
    return fs.readFileSync(kimiSecretPath, 'utf8').trim();
  }
  return '';
}

function loadClient() {
  const parsed = readJsonIfExists(clientPath);
  const client = parsed?.web || parsed?.installed;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error(`Invalid Google OAuth client JSON at ${clientPath}`);
  }
  return {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || client.redirect_uris?.[0],
  };
}

function loadRefreshToken(env = process.env) {
  if (env.GOOGLE_REFRESH_TOKEN) return env.GOOGLE_REFRESH_TOKEN;
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, 'utf8').trim();
  throw new Error(`Missing Google refresh token at ${tokenPath}`);
}

function authWithRefreshToken(env = process.env) {
  const client = loadClient();
  const auth = new google.auth.OAuth2(client.clientId, client.clientSecret, client.redirectUri);
  auth.setCredentials({ refresh_token: loadRefreshToken(env) });
  return auth;
}

function loadConfig() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  const openaiCredentialCandidates = aiCredentialResolver.loadOpenAiCredentialCandidates({
    env,
    repoRoot,
  });
  const pipeline = env.GOOGLE_DRIVE_PIPELINE_CONFIG
    ? JSON.parse(env.GOOGLE_DRIVE_PIPELINE_CONFIG)
    : readJsonIfExists(pipelinePath) || {};
  return {
    appUrl: (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, ''),
    username: env.OPS_USERNAME || '',
    password: env.OPS_PASSWORD || '',
    pipeline,
    openaiApiKey: openaiCredentialCandidates[0]?.apiKey || readSecret('OPENAI_API_KEY', env),
    openaiBaseUrl: (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    openaiModel: env.OPENAI_MODEL || 'gpt-4.1-mini',
    kimiApiKey: integrationSecretLoader.loadConfigValue({
      envName: 'KIMI_API_KEY',
      names: ['kimi-api-key'],
      fileNames: ['kimi-api-key.txt'],
      repoRoot,
    }) || readSecret('KIMI_API_KEY', env),
    kimiBaseUrl: (env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/+$/, ''),
    kimiModel: env.KIMI_MODEL || 'kimi-k2.6',
  };
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    all: false,
    articlesOnly: false,
    force: false,
    verify: false,
    noAi: false,
    jobIds: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--all') options.all = true;
    else if (arg === '--articles') options.articlesOnly = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--verify') options.verify = true;
    else if (arg === '--no-ai') options.noAi = true;
    else if (arg === '--job-id') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--job-id requires a numeric id');
      options.jobIds.push(Number(value));
      index += 1;
    } else if (/^\d+$/.test(arg)) {
      options.jobIds.push(Number(arg));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

async function appRequest(config, endpoint) {
  if (!config.username || !config.password) {
    throw new Error('OPS_USERNAME and OPS_PASSWORD are required to read content jobs.');
  }
  const response = await fetch(`${config.appUrl}${endpoint}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

function driveLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function listAllFiles(drive, params, maxPages = 20) {
  const files = [];
  let pageToken;
  for (let page = 0; page < maxPages; page += 1) {
    const result = await drive.files.list({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      ...params,
      pageToken,
    });
    files.push(...(result.data.files || []));
    pageToken = result.data.nextPageToken;
    if (!pageToken) break;
  }
  return files;
}

async function getDriveFile(drive, fileId) {
  const result = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'id,name,mimeType,parents,webViewLink,appProperties,modifiedTime',
  });
  return result.data;
}

async function findChild(drive, parentId, name, mimeType) {
  const result = await drive.files.list({
    q: [
      `name='${driveLiteral(name)}'`,
      `mimeType='${driveLiteral(mimeType)}'`,
      `'${driveLiteral(parentId)}' in parents`,
      'trashed=false',
    ].join(' and '),
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id,name,mimeType,parents,webViewLink,appProperties,modifiedTime)',
    pageSize: 1,
  });
  return result.data.files?.[0] || null;
}

async function ensureFolder(drive, name, parentId, options, planned) {
  const existing = await findChild(drive, parentId, name, GOOGLE_FOLDER_MIME);
  if (existing) return existing;
  planned.push(`create folder: ${name}`);
  if (options.dryRun) return { id: null, name, mimeType: GOOGLE_FOLDER_MIME, webViewLink: '' };
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: GOOGLE_FOLDER_MIME,
      parents: [parentId],
      appProperties: {
        [APP_MARKER_KEY]: APP_MARKER_VALUE,
      },
    },
    supportsAllDrives: true,
    fields: 'id,name,mimeType,parents,webViewLink,appProperties,modifiedTime',
  });
  return created.data;
}

async function ensureLibraryFolders(drive, config, options) {
  const rootId = config.pipeline.root;
  if (!rootId) throw new Error('GOOGLE_DRIVE_PIPELINE_CONFIG is missing root.');
  const bnaRoot = await getDriveFile(drive, rootId);
  const planned = [];
  const libraryRoot = await ensureFolder(drive, FOLDER_NAMES.root, rootId, options, planned);
  const folders = { bnaRoot, libraryRoot };

  if (libraryRoot.id) {
    for (const [key, name] of Object.entries(FOLDER_NAMES)) {
      if (key === 'root') continue;
      folders[key] = await ensureFolder(drive, name, libraryRoot.id, options, planned);
    }
  } else {
    for (const [key, name] of Object.entries(FOLDER_NAMES)) {
      if (key === 'root') continue;
      folders[key] = { id: null, name, mimeType: GOOGLE_FOLDER_MIME, webViewLink: '' };
      planned.push(`create folder: ${FOLDER_NAMES.root}/${name}`);
    }
  }

  return { folders, planned };
}

async function findDocByProperties(drive, parentId, props, fallbackName) {
  if (!parentId) return null;
  const propQuery = Object.entries({
    [APP_MARKER_KEY]: APP_MARKER_VALUE,
    ...props,
  })
    .map(([key, value]) => `appProperties has { key='${driveLiteral(key)}' and value='${driveLiteral(value)}' }`)
    .join(' and ');
  const byProps = await listAllFiles(drive, {
    q: [
      `mimeType='${GOOGLE_DOC_MIME}'`,
      `'${driveLiteral(parentId)}' in parents`,
      'trashed=false',
      propQuery,
    ].join(' and '),
    fields: 'nextPageToken,files(id,name,mimeType,parents,webViewLink,appProperties,modifiedTime)',
    pageSize: 10,
  }, 2);
  if (byProps[0]) return byProps[0];
  return findChild(drive, parentId, fallbackName, GOOGLE_DOC_MIME);
}

async function createOrUpdateDoc(drive, docs, parentId, name, props, text, options, summary) {
  const existing = await findDocByProperties(drive, parentId, props, name);
  const desiredProps = {
    [APP_MARKER_KEY]: APP_MARKER_VALUE,
    ...props,
  };

  if (options.dryRun) {
    summary.plannedDocs.push(`${existing ? 'update' : 'create'} doc: ${name}`);
    return { action: existing ? 'would-update' : 'would-create', file: existing || { name, webViewLink: '' } };
  }

  if (existing && !options.force && props.contentUpdatedAt && existing.appProperties?.contentUpdatedAt === props.contentUpdatedAt) {
    summary.skipped += 1;
    return { action: 'skipped', file: existing };
  }

  let file = existing;
  if (!file) {
    const created = await drive.files.create({
      requestBody: {
        name,
        mimeType: GOOGLE_DOC_MIME,
        parents: [parentId],
        appProperties: desiredProps,
      },
      supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,webViewLink,appProperties,modifiedTime',
    });
    file = created.data;
  } else {
    const updated = await drive.files.update({
      fileId: file.id,
      supportsAllDrives: true,
      requestBody: {
        name,
        appProperties: desiredProps,
      },
      fields: 'id,name,mimeType,parents,webViewLink,appProperties,modifiedTime',
    });
    file = updated.data;
  }

  await replaceDocText(docs, file.id, text);
  if (existing) summary.updated += 1;
  else summary.created += 1;
  return { action: existing ? 'updated' : 'created', file };
}

async function replaceDocText(docs, documentId, text) {
  const document = await docs.documents.get({ documentId });
  const endIndex = document.data.body?.content?.at(-1)?.endIndex || 1;
  if (endIndex > 2) {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [{
          deleteContentRange: {
            range: {
              startIndex: 1,
              endIndex: endIndex - 1,
            },
          },
        }],
      },
    });
  }

  const cleanText = `${String(text || '').replace(/\u0000/g, '').trimEnd()}\n`;
  const chunkSize = 45000;
  let index = 1;
  for (let offset = 0; offset < cleanText.length; offset += chunkSize) {
    const chunk = cleanText.slice(offset, offset + chunkSize);
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [{
          insertText: {
            location: { index },
            text: chunk,
          },
        }],
      },
    });
    index += chunk.length;
  }
}

async function exportDocText(drive, fileId) {
  const response = await drive.files.export(
    { fileId, mimeType: 'text/plain' },
    { responseType: 'text' }
  );
  return String(response.data || '');
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [value];
}

function parseJsonValue(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function bulletLines(items, fallback = 'None saved.') {
  const values = asArray(items).map((item) => {
    if (typeof item === 'string') return compactWhitespace(item);
    if (item && typeof item === 'object') {
      return compactWhitespace(item.title || item.summary || item.topic || item.question_text || JSON.stringify(item));
    }
    return compactWhitespace(item);
  }).filter(Boolean);
  if (!values.length) return [`- ${fallback}`];
  return values.map((item) => `- ${item}`);
}

function flattenClassNotes(job) {
  const parsed = parseJsonValue(job.parse_json);
  const nested = parseJsonValue(parsed.mixed_recording_parse);
  return [
    ...asArray(parsed.class_notes),
    ...asArray(nested.class_notes),
  ].filter((note) => note && typeof note === 'object');
}

function extractBreakdownData(job) {
  const parsed = parseJsonValue(job.parse_json);
  const nested = parseJsonValue(parsed.mixed_recording_parse);
  return {
    summary: compactWhitespace(parsed.summary || nested.summary || job.summary || ''),
    topics: [...asArray(parsed.topics), ...asArray(nested.topics)],
    sources: [...asArray(parsed.sources), ...asArray(nested.sources)],
    highlights: [...asArray(parsed.highlights), ...asArray(nested.highlights)],
    discussions: [...asArray(parsed.discussions), ...asArray(nested.discussions)],
    studentQuestions: [...asArray(parsed.student_questions), ...asArray(nested.student_questions)],
    nextSteps: [...asArray(parsed.next_steps), ...asArray(nested.next_steps)],
    classNotes: flattenClassNotes(job),
  };
}

function breakdownLooksThin(data) {
  const structuredCount =
    data.topics.length +
    data.sources.length +
    data.highlights.length +
    data.discussions.length +
    data.studentQuestions.length +
    data.classNotes.length * 2;
  return structuredCount < 5;
}

function renderClassNote(note, index) {
  const lines = [
    `${index + 1}. ${compactWhitespace(note.title || note.topic || `Subject ${index + 1}`)}`,
  ];
  if (note.summary) lines.push(`   Summary: ${compactWhitespace(note.summary)}`);
  const fields = [
    ['Topics', note.topics],
    ['Sources', note.sources],
    ['Discussions', note.discussions],
    ['Student questions', note.student_questions],
    ['Highlights', note.highlights],
  ];
  for (const [label, value] of fields) {
    const values = asArray(value).map((item) => compactWhitespace(typeof item === 'string' ? item : JSON.stringify(item))).filter(Boolean);
    if (values.length) lines.push(`   ${label}: ${values.join('; ')}`);
  }
  return lines.join('\n');
}

function renderStructuredBreakdown(data) {
  const lines = [];
  lines.push('## Clean Subject Breakdown');
  lines.push('');
  if (data.summary) {
    lines.push('### Short Summary');
    lines.push(data.summary);
    lines.push('');
  }
  if (data.classNotes.length) {
    lines.push('### Subjects');
    data.classNotes.forEach((note, index) => {
      lines.push(renderClassNote(note, index));
      lines.push('');
    });
  }
  lines.push('### Topics');
  lines.push(...bulletLines(data.topics));
  lines.push('');
  lines.push('### Sources');
  lines.push(...bulletLines(data.sources));
  lines.push('');
  lines.push('### Student Questions');
  lines.push(...bulletLines(data.studentQuestions));
  lines.push('');
  lines.push('### Highlights');
  lines.push(...bulletLines(data.highlights));
  lines.push('');
  lines.push('### Discussions');
  lines.push(...bulletLines(data.discussions));
  lines.push('');
  if (data.nextSteps.length) {
    lines.push('### Next Steps');
    lines.push(...bulletLines(data.nextSteps));
    lines.push('');
  }
  return lines.join('\n').trim();
}

function transcriptForAi(text, maxChars = 90000) {
  const transcript = String(text || '');
  if (transcript.length <= maxChars) return transcript;
  const head = Math.floor(maxChars * 0.42);
  const tail = Math.floor(maxChars * 0.42);
  const middle = maxChars - head - tail;
  const middleStart = Math.max(0, Math.floor((transcript.length - middle) / 2));
  return [
    transcript.slice(0, head),
    '',
    `[Middle excerpt begins; ${transcript.length - maxChars} characters omitted for AI summarization only. Raw transcript is preserved below.]`,
    transcript.slice(middleStart, middleStart + middle),
    '[Middle excerpt ends.]',
    '',
    transcript.slice(-tail),
  ].join('\n');
}

function sanitizeProviderError(value) {
  return String(value || '')
    .replace(/sk-[^\s"',}]+/g, '[redacted-api-key]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .slice(0, 500);
}

function configuredAiProviders(config) {
  return [
    config.openaiApiKey ? {
      name: 'openai',
      apiKey: config.openaiApiKey,
      baseUrl: config.openaiBaseUrl,
      model: config.openaiModel,
    } : null,
    config.kimiApiKey ? {
      name: 'kimi',
      apiKey: config.kimiApiKey,
      baseUrl: config.kimiBaseUrl,
      model: config.kimiModel,
    } : null,
  ].filter(Boolean);
}

async function callAiBreakdownProvider(provider, job, data, transcript) {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: provider.name === 'kimi' ? 1 : 0.2,
      messages: [
        {
          role: 'system',
          content: [
            'You organize Bnei Neviim Academy class and marketing transcripts for article generation.',
            'Return concise Markdown only.',
            'Break the recording into concrete subjects with useful article angles.',
            'Do not invent sources, quotes, student names, or facts.',
            'If Hebrew text is garbled or uncertain, summarize the idea in English and mark uncertainty briefly.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            `Title: ${job.title || `Content job #${job.id}`}`,
            `Date: ${job.created_at || ''}`,
            '',
            'Existing parsed data:',
            JSON.stringify(data, null, 2).slice(0, 12000),
            '',
            'Transcript:',
            transcriptForAi(transcript),
            '',
            'Required shape:',
            '## Clean Subject Breakdown',
            '### Short Summary',
            '### Subjects',
            'For each subject: title, what was discussed, source if heard, student question if heard, and article angle.',
            '### Marketing/Article Angles',
            '### Notes To Verify',
          ].join('\n'),
        },
      ],
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${provider.name} ${response.status}: ${sanitizeProviderError(text)}`);
  }
  const dataJson = text ? JSON.parse(text) : {};
  return String(dataJson.choices?.[0]?.message?.content || '').trim();
}

async function generateAiBreakdown(config, job, data) {
  const providers = configuredAiProviders(config);
  if (!providers.length) {
    return [
      '## Clean Subject Breakdown',
      '',
      'No AI provider is configured for additional subject extraction. Existing parsed notes are shown below.',
      '',
      renderStructuredBreakdown(data),
    ].join('\n').trim();
  }
  const transcript = String(job.transcript_text || '').trim();
  const failures = [];
  for (const provider of providers) {
    try {
      const generated = await callAiBreakdownProvider(provider, job, data, transcript);
      if (generated) return generated;
      failures.push(`${provider.name}: empty response`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`AI breakdown failed for job #${job.id}: ${failures.map(sanitizeProviderError).join(' | ')}`);
}

function isRealTranscriptJob(job) {
  const title = String(job.title || '');
  const transcriptLength = String(job.transcript_text || '').trim().length;
  if (!transcriptLength) return false;
  if (TEST_TITLE_RE.test(title) || OPERATIONAL_TITLE_RE.test(title)) return false;
  if (transcriptLength >= 1800) return true;
  const hasMedia = Boolean(job.media_url || job.drive_file_id || job.local_path);
  const hasPublishedMarketingOutput = asArray(job.outputs).some((output) =>
    ['facebook_post', 'youtube_description', 'blog_draft', 'whatsapp_update'].includes(output.output_type) &&
    ['approved', 'published', 'needs_approval'].includes(output.status)
  );
  return hasMedia && (hasPublishedMarketingOutput || /\b(video|post|class|recording|torah|learning|update)\b/i.test(title));
}

function safeDocName(value, maxLength = 140) {
  return String(value || 'Untitled')
    .replace(/[\\/:*?"<>|#\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim() || 'Untitled';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function outputSummary(outputs = []) {
  const list = asArray(outputs);
  if (!list.length) return 'none';
  return list.map((output) => `${output.output_type || 'output'}:${output.status || 'unknown'}#${output.id || '?'}`).join(', ');
}

async function renderTranscriptDoc(config, job, options, summary) {
  const data = extractBreakdownData(job);
  let breakdown = renderStructuredBreakdown(data);
  const needsAi = !options.noAi && breakdownLooksThin(data);
  if (needsAi && !options.dryRun) {
    try {
      breakdown = await generateAiBreakdown(config, job, data);
      summary.aiBreakdowns += 1;
    } catch (error) {
      summary.warnings.push(error instanceof Error ? error.message : String(error));
      breakdown = renderStructuredBreakdown(data);
    }
  } else if (needsAi && options.dryRun) {
    summary.aiBreakdownsPlanned += 1;
  }

  const transcript = String(job.transcript_text || '').trim();
  return [
    `# ${job.title || `Content job #${job.id}`}`,
    '',
    '## Metadata',
    '',
    `- Content job: #${job.id}`,
    `- Created: ${job.created_at || ''}`,
    `- Updated: ${job.updated_at || ''}`,
    `- Status: ${job.status || ''}`,
    `- Drive stage: ${job.drive_stage || 'none'}`,
    `- Source type: ${job.source_type || 'unknown'}`,
    `- Source recording: ${job.media_url || 'none'}`,
    `- Transcript characters: ${transcript.length}`,
    `- Outputs: ${outputSummary(job.outputs)}`,
    '',
    breakdown,
    '',
    '## Raw Transcript',
    '',
    transcript || '[No transcript text saved for this content job.]',
    '',
  ].join('\n');
}

function renderArticleDoc(post) {
  const body = asArray(post.body).map((paragraph) => String(paragraph || '').trim()).filter(Boolean);
  return [
    `# ${post.title || post.slug}`,
    '',
    '## Metadata',
    '',
    `- Language: ${post.lang || 'en'}`,
    `- Slug: ${post.slug || ''}`,
    `- Category: ${post.category || ''}`,
    `- Meta title: ${post.metaTitle || ''}`,
    `- Meta description: ${post.metaDescription || ''}`,
    `- Image: ${post.image || ''}`,
    `- Published at: ${post.publishedAt || ''}`,
    '',
    '## Excerpt',
    '',
    post.excerpt || '',
    '',
    '## Keywords',
    '',
    ...bulletLines(post.keywords),
    '',
    '## Article Body',
    '',
    ...body.flatMap((paragraph) => [paragraph, '']),
    '## CTA',
    '',
    post.cta || '',
    '',
  ].join('\n');
}

function loadWebsiteArticles() {
  const scriptPath = path.join(repoRoot, 'public', 'js', 'bna-content.js');
  const sandbox = {
    window: {},
    console: { warn() {}, log() {}, error() {} },
    fetch: async () => ({ ok: true, json: async () => ({ posts: [] }) }),
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), sandbox, { filename: scriptPath });
  const staticPosts = asArray(sandbox.window.BNAContent?.blogPosts);
  const publishedPath = path.join(repoRoot, 'public', 'data', 'website-blog-posts.json');
  const published = asArray(readJsonIfExists(publishedPath)?.posts);
  const byKey = new Map();
  for (const post of [...staticPosts, ...published]) {
    if (!post?.slug || !post?.title) continue;
    const key = `${post.lang || 'en'}:${post.slug}`;
    if (!byKey.has(key)) byKey.set(key, post);
  }
  return [...byKey.values()].sort((a, b) =>
    String(a.lang || 'en').localeCompare(String(b.lang || 'en')) ||
    String(a.title || '').localeCompare(String(b.title || ''))
  );
}

function renderContentLibraryIndex(folders, transcriptRows, articleRows, generatedAt) {
  return [
    '# BNA Content Library Index',
    '',
    `Generated: ${generatedAt}`,
    '',
    'This Drive folder is the operator-facing marketing mirror for transcripts and website articles. The live BNA app database remains the working source for transcript text, and the repo remains canonical for durable agent memory.',
    '',
    '## Folders',
    '',
    `- Transcript Library: ${folders.transcripts.webViewLink || folders.transcripts.name}`,
    `- Article Source Indexes: ${folders.indexes.webViewLink || folders.indexes.name}`,
    `- Website Articles: ${folders.websiteArticles.webViewLink || folders.websiteArticles.name}`,
    `- Draft Articles: ${folders.draftArticles.webViewLink || folders.draftArticles.name}`,
    `- Published / Approved Copy: ${folders.approvedCopy.webViewLink || folders.approvedCopy.name}`,
    '',
    '## Current Counts',
    '',
    `- Transcript docs: ${transcriptRows.length}`,
    `- Website article docs: ${articleRows.length}`,
    '',
    '## Recent Transcript Docs',
    '',
    ...transcriptRows.slice(0, 20).map((row) => `- #${row.id} ${row.title} (${row.date}) - ${row.url || 'pending link'}`),
    '',
    '## Website Article Docs',
    '',
    ...articleRows.slice(0, 30).map((row) => `- ${row.lang}:${row.slug} - ${row.title} - ${row.url || 'pending link'}`),
    '',
  ].join('\n');
}

function renderTranscriptIndex(rows, generatedAt, allTranscriptCount, realTranscriptCount) {
  return [
    '# Transcript Index',
    '',
    `Generated: ${generatedAt}`,
    '',
    `Live transcript jobs found: ${allTranscriptCount}`,
    `Real content transcript jobs synced: ${realTranscriptCount}`,
    '',
    '| Job | Date | Title | Status | Chars | Drive Doc | Source |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
    ...rows.map((row) => `| #${row.id} | ${row.date} | ${String(row.title || '').replace(/\|/g, '\\|')} | ${row.status || ''} | ${row.chars} | ${row.url || ''} | ${row.source || ''} |`),
    '',
  ].join('\n');
}

function renderArticleIndex(rows, generatedAt) {
  return [
    '# Website Article Index',
    '',
    `Generated: ${generatedAt}`,
    '',
    '| Language | Slug | Title | Category | Drive Doc |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.lang || 'en'} | ${row.slug || ''} | ${String(row.title || '').replace(/\|/g, '\\|')} | ${String(row.category || '').replace(/\|/g, '\\|')} | ${row.url || ''} |`),
    '',
  ].join('\n');
}

async function syncTranscripts(drive, docs, config, folders, jobs, options, summary) {
  const rows = [];
  for (const job of jobs) {
    const name = `#${job.id} - ${safeDocName(job.title || `Content job ${job.id}`)}`;
    const props = {
      contentKind: 'transcript',
      contentJobId: String(job.id),
      contentUpdatedAt: String(job.updated_at || job.created_at || ''),
    };
    const existing = await findDocByProperties(drive, folders.transcripts.id, props, name);
    if (existing && !options.force && !options.dryRun && existing.appProperties?.contentUpdatedAt === props.contentUpdatedAt) {
      summary.skipped += 1;
      rows.push({
        id: job.id,
        date: formatDate(job.created_at),
        title: job.title || `Content job #${job.id}`,
        status: job.status || '',
        chars: String(job.transcript_text || '').trim().length,
        source: job.media_url || '',
        url: existing.webViewLink || '',
        action: 'skipped',
        fileId: existing.id || '',
      });
      continue;
    }
    const text = await renderTranscriptDoc(config, job, options, summary);
    const result = await createOrUpdateDoc(
      drive,
      docs,
      folders.transcripts.id,
      name,
      props,
      text,
      options,
      summary
    );
    rows.push({
      id: job.id,
      date: formatDate(job.created_at),
      title: job.title || `Content job #${job.id}`,
      status: job.status || '',
      chars: String(job.transcript_text || '').trim().length,
      source: job.media_url || '',
      url: result.file?.webViewLink || '',
      action: result.action,
      fileId: result.file?.id || '',
    });
  }
  return rows;
}

async function syncArticles(drive, docs, folders, posts, options, summary) {
  const rows = [];
  for (const post of posts) {
    const key = `${post.lang || 'en'}:${post.slug}`;
    const name = `${post.lang || 'en'} - ${safeDocName(post.title || post.slug)}`;
    const result = await createOrUpdateDoc(
      drive,
      docs,
      folders.websiteArticles.id,
      name,
      {
        contentKind: 'website_article',
        articleKey: key,
        articleSlug: String(post.slug || ''),
        articleLang: String(post.lang || 'en'),
        contentUpdatedAt: String(post.publishedAt || post.updatedAt || 'static'),
      },
      renderArticleDoc(post),
      options,
      summary
    );
    rows.push({
      lang: post.lang || 'en',
      slug: post.slug || '',
      title: post.title || '',
      category: post.category || '',
      url: result.file?.webViewLink || '',
      action: result.action,
      fileId: result.file?.id || '',
    });
  }
  return rows;
}

async function syncIndexes(drive, docs, folders, transcriptRows, articleRows, options, summary, counts) {
  const generatedAt = new Date().toISOString();
  await createOrUpdateDoc(
    drive,
    docs,
    folders.libraryRoot.id,
    '00 Content Library Index',
    { contentKind: 'index', indexKey: 'content_library', contentUpdatedAt: generatedAt },
    renderContentLibraryIndex(folders, transcriptRows, articleRows, generatedAt),
    { ...options, force: true },
    summary
  );
  await createOrUpdateDoc(
    drive,
    docs,
    folders.indexes.id,
    '00 Transcript Index',
    { contentKind: 'index', indexKey: 'transcripts', contentUpdatedAt: generatedAt },
    renderTranscriptIndex(transcriptRows, generatedAt, counts.allTranscriptCount, counts.realTranscriptCount),
    { ...options, force: true },
    summary
  );
  await createOrUpdateDoc(
    drive,
    docs,
    folders.indexes.id,
    '00 Website Article Index',
    { contentKind: 'index', indexKey: 'website_articles', contentUpdatedAt: generatedAt },
    renderArticleIndex(articleRows, generatedAt),
    { ...options, force: true },
    summary
  );
}

async function verifyReadback(drive, transcriptRows, articleRows, summary) {
  const checks = [
    ...transcriptRows.filter((row) => row.fileId).slice(0, 2),
    ...transcriptRows.filter((row) => row.id === 26 && row.fileId).slice(0, 1),
    ...articleRows.filter((row) => row.fileId).slice(0, 2),
  ];
  const seen = new Set();
  for (const row of checks) {
    if (!row.fileId || seen.has(row.fileId)) continue;
    seen.add(row.fileId);
    const text = await exportDocText(drive, row.fileId);
    const ok = text.includes('Raw Transcript') || text.includes('Article Body');
    summary.readbacks.push({
      id: row.id || `${row.lang}:${row.slug}`,
      chars: text.length,
      ok,
    });
    if (!ok) summary.warnings.push(`Readback missing expected sections for ${row.id || row.slug}`);
  }
}

function printSummary(summary) {
  const lines = [
    `Drive content library sync ${summary.dryRun ? 'dry run' : 'complete'}.`,
    `Live transcript jobs with text: ${summary.allTranscriptCount}`,
    `Real transcript jobs selected: ${summary.realTranscriptCount}`,
    `Website articles selected: ${summary.articleCount}`,
    `Created docs: ${summary.created}`,
    `Updated docs: ${summary.updated}`,
    `Skipped unchanged docs: ${summary.skipped}`,
    `AI breakdowns generated: ${summary.aiBreakdowns}`,
    `AI breakdowns planned: ${summary.aiBreakdownsPlanned}`,
  ];
  if (summary.libraryUrl) lines.push(`Content Library: ${summary.libraryUrl}`);
  if (summary.plannedFolders.length) {
    lines.push('', 'Planned folders:', ...summary.plannedFolders.map((item) => `- ${item}`));
  }
  if (summary.plannedDocs.length) {
    lines.push('', 'Planned docs:', ...summary.plannedDocs.slice(0, 80).map((item) => `- ${item}`));
    if (summary.plannedDocs.length > 80) lines.push(`- ... ${summary.plannedDocs.length - 80} more`);
  }
  if (summary.readbacks.length) {
    lines.push('', 'Readback checks:');
    for (const item of summary.readbacks) lines.push(`- ${item.id}: ${item.chars} chars, ${item.ok ? 'ok' : 'needs review'}`);
  }
  if (summary.warnings.length) {
    lines.push('', 'Warnings:', ...summary.warnings.map((warning) => `- ${warning}`));
  }
  console.log(lines.join('\n'));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const auth = authWithRefreshToken();
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });
  const summary = {
    dryRun: options.dryRun,
    allTranscriptCount: 0,
    realTranscriptCount: 0,
    articleCount: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    aiBreakdowns: 0,
    aiBreakdownsPlanned: 0,
    plannedFolders: [],
    plannedDocs: [],
    warnings: [],
    readbacks: [],
    libraryUrl: '',
  };

  const { folders, planned } = await ensureLibraryFolders(drive, config, options);
  summary.plannedFolders = planned;
  summary.libraryUrl = folders.libraryRoot.webViewLink || '';

  const data = await appRequest(config, '/api/bna/content-jobs');
  const allJobs = Array.isArray(data.jobs) ? data.jobs : [];
  const jobsWithTranscripts = allJobs.filter((job) => String(job.transcript_text || '').trim());
  summary.allTranscriptCount = jobsWithTranscripts.length;
  let selectedJobs = jobsWithTranscripts.filter(isRealTranscriptJob);
  if (options.jobIds.length) {
    const ids = new Set(options.jobIds.map(Number));
    selectedJobs = selectedJobs.filter((job) => ids.has(Number(job.id)));
  }
  selectedJobs.sort((a, b) => Number(b.id) - Number(a.id));
  summary.realTranscriptCount = selectedJobs.length;

  const articles = loadWebsiteArticles();
  summary.articleCount = articles.length;

  let transcriptRows = [];
  let articleRows = [];
  if (!options.articlesOnly) {
    transcriptRows = await syncTranscripts(drive, docs, config, folders, selectedJobs, options, summary);
  }
  if (options.articlesOnly || options.all || (!options.jobIds.length && !options.articlesOnly)) {
    articleRows = await syncArticles(drive, docs, folders, articles, options, summary);
  }

  if (!options.jobIds.length || options.all || options.articlesOnly) {
    await syncIndexes(drive, docs, folders, transcriptRows, articleRows, options, summary, {
      allTranscriptCount: summary.allTranscriptCount,
      realTranscriptCount: summary.realTranscriptCount,
    });
  }

  if (options.verify && !options.dryRun) {
    await verifyReadback(drive, transcriptRows, articleRows, summary);
  }

  printSummary(summary);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
