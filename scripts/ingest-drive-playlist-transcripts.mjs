import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const secretsDir = path.join(repoRoot, '.secrets');
const pipelinePath = path.join(secretsDir, 'google-drive-pipeline.json');
const clientPath = path.join(secretsDir, 'google-oauth-client.json');
const tokenPath = path.join(secretsDir, 'google-refresh-token.txt');
const openAiSecretPath = path.join(secretsDir, 'openai-api-key.txt');

const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const GOOGLE_FOLDER_MIME = 'application/vnd.google-apps.folder';
const TEXTISH_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/vtt',
  'application/x-subrip',
  'application/octet-stream',
]);

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadConfig() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  return {
    appUrl: (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, ''),
    username: env.OPS_USERNAME || '',
    password: env.OPS_PASSWORD || '',
    openAiApiKey: (fs.existsSync(openAiSecretPath) ? fs.readFileSync(openAiSecretPath, 'utf8').trim() : '') || env.OPENAI_API_KEY || '',
    openAiBaseUrl: (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    openAiModel: env.OPENAI_MODEL || 'gpt-4.1-mini',
    pipeline: env.GOOGLE_DRIVE_PIPELINE_CONFIG ? JSON.parse(env.GOOGLE_DRIVE_PIPELINE_CONFIG) : readJsonIfExists(pipelinePath) || {},
  };
}

function parseArgs(argv) {
  const options = {
    fileId: '',
    namePattern: 'youtube playlist transcripts',
    dryRun: false,
    noAi: false,
    force: false,
    refreshExisting: false,
    limit: 0,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--file-id') options.fileId = argv[++index] || '';
    else if (arg === '--name-pattern') options.namePattern = argv[++index] || '';
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--no-ai') options.noAi = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--refresh-existing') options.refreshExisting = true;
    else if (arg === '--limit') options.limit = Number(argv[++index] || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
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

function loadRefreshToken() {
  if (process.env.GOOGLE_REFRESH_TOKEN) return process.env.GOOGLE_REFRESH_TOKEN;
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, 'utf8').trim();
  throw new Error(`Missing Google refresh token at ${tokenPath}`);
}

function authWithRefreshToken() {
  const client = loadClient();
  const auth = new google.auth.OAuth2(client.clientId, client.clientSecret, client.redirectUri);
  auth.setCredentials({ refresh_token: loadRefreshToken() });
  return auth;
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

async function appRequest(config, method, endpoint, body = null) {
  if (!config.username || !config.password) {
    throw new Error('OPS_USERNAME and OPS_PASSWORD are required for content ingest.');
  }
  const response = await fetch(`${config.appUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${endpoint} failed ${response.status}: ${text.slice(0, 600)}`);
  }
  return text ? JSON.parse(text) : {};
}

function textLikeFile(file) {
  const name = String(file.name || '').toLowerCase();
  const mime = String(file.mimeType || '').toLowerCase();
  return mime === GOOGLE_DOC_MIME
    || TEXTISH_MIME_TYPES.has(mime)
    || /\.(txt|md|vtt|srt|csv)$/i.test(name);
}

async function findCandidateFiles(drive, config, options) {
  if (options.fileId) {
    const result = await drive.files.get({
      fileId: options.fileId,
      supportsAllDrives: true,
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents',
    });
    return [result.data];
  }

  const folderIds = [
    config.pipeline?.simplifiedFolders?.rawIntake,
    config.pipeline?.simplifiedFolders?.processing,
    config.pipeline?.stages?.['01 Raw Intake'],
    config.pipeline?.stages?.['02 Ingesting'],
  ].filter(Boolean);
  const seen = new Set();
  const candidates = [];
  const pattern = options.namePattern ? new RegExp(options.namePattern, 'i') : /transcript|youtube|playlist/i;

  for (const folderId of folderIds) {
    if (seen.has(`folder:${folderId}`)) continue;
    seen.add(`folder:${folderId}`);
    const files = await listAllFiles(drive, {
      q: [
        `'${driveLiteral(folderId)}' in parents`,
        'trashed=false',
        `mimeType!='${GOOGLE_FOLDER_MIME}'`,
      ].join(' and '),
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    }, 5);
    for (const file of files) {
      if (seen.has(file.id)) continue;
      seen.add(file.id);
      if (textLikeFile(file) && pattern.test(file.name || '')) candidates.push(file);
    }
  }
  return candidates;
}

async function exportTranscriptText(drive, file) {
  if (file.mimeType === GOOGLE_DOC_MIME) {
    const result = await drive.files.export(
      { fileId: file.id, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    return String(result.data || '');
  }
  const result = await drive.files.get(
    { fileId: file.id, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(result.data).toString('utf8');
}

function normalizeTranscriptText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function splitYoutubePlaylistTranscript(text, sourceName) {
  const normalized = normalizeTranscriptText(text);
  const markers = [...normalized.matchAll(/^\((\d+)\)\s+(.+?)\s+-\s+YouTube\s*$/gm)];
  if (!markers.length) {
    return [{
      index: 1,
      playlistNumber: null,
      title: sourceName.replace(/\.[^.]+$/, ''),
      url: '',
      raw: normalized,
      transcript: normalized.replace(/^Transcript:\s*/i, '').trim(),
    }];
  }

  return markers.map((marker, markerIndex) => {
    const start = marker.index || 0;
    const end = markerIndex + 1 < markers.length ? markers[markerIndex + 1].index || normalized.length : normalized.length;
    const raw = normalized.slice(start, end).trim();
    const lines = raw.split('\n').map((line) => line.trim());
    const url = lines.find((line) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(line)) || '';
    const transcriptStart = lines.findIndex((line) => /^Transcript:\s*$/i.test(line));
    const transcript = transcriptStart >= 0 ? lines.slice(transcriptStart + 1).join('\n').trim() : lines.slice(1).join('\n').trim();
    return {
      index: markerIndex + 1,
      playlistNumber: marker[1] || null,
      title: marker[2].trim(),
      url,
      raw,
      transcript,
    };
  }).filter((entry) => String(entry.transcript || '').trim());
}

function transcriptWithoutTimestamps(text) {
  return String(text || '')
    .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\)\s*/g, ' ')
    .replace(/\[[^\]]{1,40}\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceChunks(text, limit = 4) {
  const cleaned = transcriptWithoutTimestamps(text);
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return sentences.map((sentence) => sentence.trim()).filter(Boolean).slice(0, limit);
}

function titleTopics(title) {
  const normalized = String(title || '')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stop = new Set(['the', 'and', 'for', 'with', 'your', 'our', 'kids', 'kid', 'son', 'sons', 'how', 'why', 'what', 'are', 'is', 'in', 'to', 'of', 'a', 'an']);
  const words = normalized.split(/\s+/).filter((word) => word.length > 2 && !stop.has(word.toLowerCase()));
  const topics = [];
  for (let index = 0; index < words.length; index += 2) {
    const phrase = words.slice(index, index + 2).join(' ');
    if (phrase) topics.push(phrase);
    if (topics.length >= 5) break;
  }
  return topics;
}

function deterministicBreakdown(entry) {
  const sentences = sentenceChunks(entry.transcript, 6);
  const topics = [
    ...titleTopics(entry.title),
    ...(sentences[0] ? [sentences[0].split(/\s+/).slice(0, 4).join(' ')] : []),
  ].filter(Boolean).slice(0, 7);
  const summary = sentences.slice(0, 2).join(' ').slice(0, 420);
  return {
    summary: summary || `YouTube playlist transcript: ${entry.title}`,
    topics,
    discussions: sentences.slice(0, 4).map((sentence) => sentence.slice(0, 220)),
    highlights: sentences.slice(2, 5).map((sentence) => sentence.slice(0, 180)),
    sources: [],
    blog_angles: [
      `What parents can learn from "${entry.title}"`,
      `How this idea supports autonomous Torah learning`,
    ],
    class_uses: [
      'Use as a discussion starter for boys who need real-world meaning in learning.',
      'Extract short clips or quotes for parent-facing education content.',
    ],
  };
}

function readBrandContext() {
  const files = [
    'brand-kit/01-core-beliefs.md',
    'brand-kit/02-teaching-voice.md',
    'brand-kit/03-parent-messaging.md',
    'brand-kit/04-student-growth-principles.md',
    'brand-kit/05-phrases-to-use.md',
    'brand-kit/06-phrases-to-avoid.md',
  ];
  return files
    .map((file) => {
      const fullPath = path.join(repoRoot, file);
      if (!fs.existsSync(fullPath)) return '';
      return `# ${file}\n${fs.readFileSync(fullPath, 'utf8').slice(0, 1800)}`;
    })
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 9000);
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  if (!candidate.trim()) return null;
  return JSON.parse(candidate);
}

async function callOpenAiBreakdown(config, brandContext, entry) {
  if (!config.openAiApiKey) return null;
  const transcript = transcriptWithoutTimestamps(entry.transcript).slice(0, 18000);
  const response = await fetch(`${config.openAiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.openAiModel,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: [
            'You organize Bnei Neviim Academy YouTube/class transcripts for the internal Content section.',
            'Return strict JSON only.',
            'Everything visible to the operator must be English.',
            'Use the brand context for angle selection and tone, but do not write polished marketing copy yet.',
            'Do not invent Torah sources, quotes, student names, or facts.',
            'Topics must be short 2-5 word labels.',
            'Discussions and blog angles should be concrete and useful for future website blogs/classes.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            'Brand context:',
            brandContext || '[No brand context found.]',
            '',
            `Video title: ${entry.title}`,
            `Video URL: ${entry.url || 'unknown'}`,
            '',
            'Transcript excerpt:',
            transcript,
            '',
            'Return JSON with this exact shape:',
            JSON.stringify({
              summary: 'one concise 30-55 word summary',
              topics: ['2-5 word topic'],
              discussions: ['specific question/discussion from the transcript'],
              highlights: ['short useful highlight'],
              sources: ['only sources explicitly heard in transcript, otherwise empty'],
              blog_angles: ['non-generic website blog angle'],
              class_uses: ['how this can become a class or discussion'],
            }, null, 2),
          ].join('\n'),
        },
      ],
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${text.slice(0, 500)}`);
  const data = text ? JSON.parse(text) : {};
  return extractJsonObject(data.choices?.[0]?.message?.content || '');
}

function listify(value, fallback = []) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  if (value) return [String(value).trim()].filter(Boolean);
  return fallback;
}

function cleanBreakdown(value, fallback) {
  const source = value && typeof value === 'object' ? value : fallback;
  return {
    summary: String(source.summary || fallback.summary || '').replace(/\s+/g, ' ').trim(),
    topics: listify(source.topics, fallback.topics).slice(0, 8),
    discussions: listify(source.discussions, fallback.discussions).slice(0, 8),
    highlights: listify(source.highlights, fallback.highlights).slice(0, 6),
    sources: listify(source.sources, fallback.sources).slice(0, 8),
    blog_angles: listify(source.blog_angles, fallback.blog_angles).slice(0, 6),
    class_uses: listify(source.class_uses, fallback.class_uses).slice(0, 6),
  };
}

function existingPlaylistMap(jobs, fileId) {
  const matches = new Map();
  for (const job of jobs) {
    let parsed = {};
    try {
      parsed = typeof job.parse_json === 'string'
        ? JSON.parse(job.parse_json || '{}')
        : (job.parse_json || {});
    } catch {
      parsed = {};
    }
    const playlist = parsed.youtube_playlist || parsed.source_playlist || {};
    if (playlist.file_id === fileId && playlist.entry_index) {
      matches.set(String(playlist.entry_index), job);
    }
  }
  return matches;
}

function parseDateFromTitle(title) {
  const date = Date.parse(String(title || '').replace(/\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/, '$2 $1 $3'));
  if (!Number.isNaN(date)) return new Date(date).toISOString().slice(0, 10);
  return '';
}

function buildContentJobPayload({ file, entry, breakdown, processedFolderId }) {
  const sourceTitle = `YouTube: ${entry.title}`;
  const classNote = {
    title: entry.title,
    summary: breakdown.summary,
    topics: breakdown.topics,
    discussions: [...breakdown.discussions, ...breakdown.blog_angles].slice(0, 10),
    sources: breakdown.sources,
    student_questions: [],
    highlights: [...breakdown.highlights, ...breakdown.class_uses].slice(0, 10),
  };
  return {
    title: sourceTitle,
    source_type: 'google_drive',
    media_url: entry.url || file.webViewLink || null,
    drive_file_id: file.id,
    drive_folder_id: processedFolderId || file.parents?.[0] || null,
    drive_stage: '03 Transcribed',
    mime_type: 'text/youtube-playlist-transcript',
    caption: [
      `Imported from Google Drive playlist transcript document "${file.name}".`,
      entry.url ? `YouTube URL: ${entry.url}` : '',
      'Use this as a class/content source for website blogs, YouTube descriptions, newsletters, and brand-aligned parent education.',
    ].filter(Boolean).join('\n'),
    status: 'transcribed',
    transcript_text: entry.transcript,
    transcript_json: {
      kind: 'youtube_playlist_transcript',
      title: entry.title,
      url: entry.url || null,
      playlist_number: entry.playlistNumber,
      source_doc: {
        id: file.id,
        name: file.name,
        url: file.webViewLink || null,
      },
    },
    parse_json: {
      intake_lane: 'content',
      source_type: 'youtube_playlist_transcript',
      summary: breakdown.summary,
      topics: breakdown.topics,
      discussions: breakdown.discussions,
      sources: breakdown.sources,
      highlights: breakdown.highlights,
      blog_angles: breakdown.blog_angles,
      class_uses: breakdown.class_uses,
      class_notes: [classNote],
      recommended_outputs: ['blog_draft', 'youtube_description', 'weekly_newsletter', 'facebook_post', 'short_clip'],
      website_blog_candidate: true,
      class_content_candidate: true,
      youtube_playlist: {
        file_id: file.id,
        file_name: file.name,
        entry_index: entry.index,
        playlist_number: entry.playlistNumber,
        video_title: entry.title,
        video_url: entry.url || null,
        source_doc_url: file.webViewLink || null,
        date_hint: parseDateFromTitle(entry.title) || null,
      },
    },
    notes: [
      'Imported from a YouTube playlist transcript Google Doc.',
      'Brand/context organization has been attached in parse_json; generate actual copy through the Content prompt buttons so it uses the saved Brand Guide and platform prompts.',
      `Source doc: ${file.webViewLink || file.id}`,
      entry.url ? `Video: ${entry.url}` : '',
    ].filter(Boolean).join('\n'),
  };
}

async function maybeMoveFileToProcessed(drive, config, file, options) {
  const processedFolderId = config.pipeline?.simplifiedFolders?.processedRecordings || config.pipeline?.stages?.['03 Transcribed'];
  if (!processedFolderId || options.dryRun) return processedFolderId || '';
  const currentParents = file.parents || [];
  if (currentParents.includes(processedFolderId)) return processedFolderId;
  await drive.files.update({
    fileId: file.id,
    addParents: processedFolderId,
    removeParents: currentParents.join(','),
    supportsAllDrives: true,
    fields: 'id,parents',
  });
  return processedFolderId;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const drive = google.drive({ version: 'v3', auth: authWithRefreshToken() });
  const brandContext = readBrandContext();
  const files = await findCandidateFiles(drive, config, options);
  if (!files.length) {
    console.log('No matching playlist transcript files found in Raw Intake or Processing.');
    return;
  }

  const jobsData = await appRequest(config, 'GET', '/api/bna/content-jobs');
  const existingJobs = jobsData.jobs || [];
  const createdJobIds = [];
  const updatedJobIds = [];
  const summary = [];

  for (const file of files) {
    const text = await exportTranscriptText(drive, file);
    let entries = splitYoutubePlaylistTranscript(text, file.name);
    if (options.limit > 0) entries = entries.slice(0, options.limit);
    const existingByIndex = options.force ? new Map() : existingPlaylistMap(existingJobs, file.id);
    const processedFolderId = config.pipeline?.simplifiedFolders?.processedRecordings || config.pipeline?.stages?.['03 Transcribed'] || file.parents?.[0] || '';
    let createdForFile = 0;

    for (const entry of entries) {
      const existing = existingByIndex.get(String(entry.index));
      if (existing && !options.refreshExisting) {
        summary.push(`skip existing #${existing.id}: ${file.name} #${entry.index} ${entry.title}`);
        continue;
      }
      const fallback = deterministicBreakdown(entry);
      let aiBreakdown = null;
      if (!options.noAi) {
        try {
          aiBreakdown = await callOpenAiBreakdown(config, brandContext, entry);
        } catch (error) {
          summary.push(`AI fallback for ${entry.title}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      const breakdown = cleanBreakdown(aiBreakdown, fallback);
      const payload = buildContentJobPayload({ file, entry, breakdown, processedFolderId });
      if (options.dryRun) {
        summary.push(`would ${existing ? `refresh #${existing.id}` : 'create'}: ${payload.title} (${entry.transcript.length} chars)`);
        continue;
      }
      if (existing && options.refreshExisting) {
        const result = await appRequest(config, 'PATCH', `/api/bna/content-jobs/${existing.id}`, {
          title: payload.title,
          status: payload.status,
          transcript_text: payload.transcript_text,
          transcript_json: payload.transcript_json,
          parse_json: payload.parse_json,
          drive_file_id: payload.drive_file_id,
          drive_folder_id: payload.drive_folder_id,
          drive_stage: payload.drive_stage,
          notes: payload.notes,
        });
        if (result?.job?.id) {
          updatedJobIds.push(result.job.id);
          summary.push(`refreshed #${result.job.id}: ${payload.title}`);
        }
        continue;
      }
      const result = await appRequest(config, 'POST', '/api/bna/content-jobs', payload);
      const jobId = result?.job?.id;
      if (jobId) {
        createdJobIds.push(jobId);
        createdForFile += 1;
        summary.push(`created #${jobId}: ${payload.title}`);
      }
    }

    if (createdForFile > 0 || options.force) {
      await maybeMoveFileToProcessed(drive, config, file, options);
    }
  }

  let bundle = null;
  if (!options.dryRun && createdJobIds.length) {
    const bundleResult = await appRequest(config, 'POST', '/api/bna/content-bundles', {
      title: 'YouTube playlist transcripts 2024',
      notes: [
        'Imported from Google Drive playlist transcript document(s).',
        'Use this bundle to generate brand-aligned website blogs, YouTube descriptions, newsletters, parent education posts, and class/topic maps.',
        'Do not publish generated copy without operator approval.',
      ].join('\n'),
      job_ids: createdJobIds,
    });
    bundle = bundleResult.bundle || null;
  }

  console.log(JSON.stringify({
    matched_files: files.map((file) => ({ id: file.id, name: file.name, mimeType: file.mimeType, url: file.webViewLink || null })),
    created_job_ids: createdJobIds,
    updated_job_ids: updatedJobIds,
    created_count: createdJobIds.length,
    updated_count: updatedJobIds.length,
    bundle: bundle ? { id: bundle.id, title: bundle.title } : null,
    summary,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
