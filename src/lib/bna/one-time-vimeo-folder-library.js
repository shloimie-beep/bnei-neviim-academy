const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const vimeo = require('../integrations/vimeo');
const {
  loadSecret,
  redactSecrets,
  redactSecretText,
  safeSecretSourceLabel,
} = require('../integrations/secret-loader');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_LIBRARY_APPROVAL_FLAG = 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING';
const REVIEW_PACKAGE_CONFIRMATION = 'CREATE_ONE_TIME_LIBRARY_REVIEW';
const VIMEO_UPLOAD_CONFIRMATION = 'UPLOAD_ONE_TIME_VIMEO_LIBRARY';
const DEFAULT_DROP_FOLDER = path.join('media-inbox', 'one-time-vimeo-drop');
const DEFAULT_REPORT_DIR = path.join('ops', 'one-time-mishnah', 'vimeo-folder-library');
const SUPPORTED_VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm']);

function compactText(value, max = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function longText(value, max = 60000) {
  return String(value || '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  return /^(1|true|yes|y)$/i.test(String(value || '').trim());
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function normalizeTranscriptStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  if (['draft', 'review', 'approved'].includes(text)) return text;
  return 'review';
}

function normalizePackageStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  if (['draft', 'review', 'approved', 'published', 'archived'].includes(text)) return text;
  return 'review';
}

function normalizeLibraryVisibility(value) {
  const text = String(value || '').trim().toLowerCase();
  if (['private', 'tier', 'specific_members', 'smoke'].includes(text)) return text;
  return 'tier';
}

function normalizeRequiredTier(value) {
  const text = String(value || '').trim().toLowerCase();
  if (['library_only', 'live_class', 'all_members', 'admin_preview', 'smoke'].includes(text)) return text;
  return 'library_only';
}

function titleFromFile(filePath) {
  const stem = path.basename(filePath, path.extname(filePath));
  return compactText(stem.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), 180)
    || 'One Time Mishnah class recording';
}

function defaultDropFolder(repoRoot = process.cwd()) {
  return path.resolve(repoRoot, DEFAULT_DROP_FOLDER);
}

function resolveDropFolder(folder, repoRoot = process.cwd()) {
  if (!folder) return defaultDropFolder(repoRoot);
  return path.resolve(repoRoot, folder);
}

function safeRelative(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return '';
  }
  return relative.split(path.sep).join('/');
}

function isSupportedVideoFile(filePath) {
  return SUPPORTED_VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function sidecarPathsFor(filePath) {
  const extension = path.extname(filePath);
  const base = filePath.slice(0, extension ? -extension.length : filePath.length);
  return unique([
    `${filePath}.json`,
    `${base}.json`,
    `${base}.metadata.json`,
  ]);
}

function scrubMetadata(metadata, secrets = []) {
  return redactSecrets(metadata && typeof metadata === 'object' ? metadata : {}, secrets);
}

function readSidecarMetadata(filePath, secrets = []) {
  for (const sidecarPath of sidecarPathsFor(filePath)) {
    if (!fs.existsSync(sidecarPath)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
      const metadata = parsed && typeof parsed === 'object' ? parsed : {};
      return {
        present: true,
        path: sidecarPath,
        metadata,
        safe_metadata: scrubMetadata(metadata, secrets),
        error: '',
      };
    } catch (error) {
      return {
        present: true,
        path: sidecarPath,
        metadata: {},
        safe_metadata: {},
        error: `Sidecar JSON could not be parsed: ${error.message}`,
      };
    }
  }
  return { present: false, path: '', metadata: {}, safe_metadata: {}, error: '' };
}

function discoverVideoFiles(folder, options = {}) {
  const root = path.resolve(folder);
  if (!fs.existsSync(root)) return [];
  const files = [];
  const recursive = options.recursive === true;
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (recursive) visit(fullPath);
        continue;
      }
      if (entry.isFile() && isSupportedVideoFile(fullPath)) files.push(fullPath);
    }
  };
  visit(root);
  return files.sort((a, b) => a.localeCompare(b));
}

function metadataValue(metadata, ...keys) {
  for (const key of keys) {
    if (metadata[key] !== undefined && metadata[key] !== null && String(metadata[key]).trim() !== '') return metadata[key];
  }
  return '';
}

function parseCandidateScope(metadata = {}) {
  const workspaceKey = compactText(metadataValue(metadata, 'workspace_key', 'workspaceKey'), 120);
  const projectKey = compactText(metadataValue(metadata, 'project_key', 'projectKey'), 120);
  const blockers = [];
  if (workspaceKey && workspaceKey !== ONE_TIME_WORKSPACE_KEY) {
    blockers.push(`Sidecar workspace_key must be ${ONE_TIME_WORKSPACE_KEY}; found ${workspaceKey}.`);
  }
  if (projectKey && projectKey !== ONE_TIME_PROJECT_KEY) {
    blockers.push(`Sidecar project_key must be ${ONE_TIME_PROJECT_KEY}; found ${projectKey}.`);
  }
  return {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    blockers,
  };
}

function buildClassPackagePayload(candidate, media = {}) {
  const metadata = candidate.metadata || {};
  const mediaUrl = compactText(media.media_url || metadataValue(metadata, 'vimeo_url', 'vimeoUrl', 'media_url', 'mediaUrl'), 1000);
  const parsed = mediaUrl ? vimeo.parseVimeoUrl(mediaUrl) : { ok: false, id: '' };
  const vimeoId = compactText(media.vimeo_id || metadataValue(metadata, 'vimeo_id', 'vimeoId') || parsed.id, 80);
  const transcriptStatus = normalizeTranscriptStatus(metadataValue(metadata, 'transcript_status', 'transcriptStatus'));
  const packageMetadata = {
    intake_source: 'one_time_vimeo_folder_library',
    raw_id: 'RAW-20260706-967',
    folder_candidate_id: candidate.id,
    folder_relative_path: candidate.source_file.relative_path,
    source_file_name: candidate.source_file.name,
    source_sha256: candidate.source_hash,
    sidecar_present: candidate.sidecar.present,
    vimeo_upload_status: media.upload_status || 'not_uploaded',
    scoped_workspace_key: ONE_TIME_WORKSPACE_KEY,
    scoped_project_key: ONE_TIME_PROJECT_KEY,
  };
  return {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    title: compactText(metadataValue(metadata, 'title', 'class_title', 'classTitle') || candidate.title, 240),
    class_date: normalizeDate(metadataValue(metadata, 'class_date', 'classDate', 'date')),
    description: longText(metadataValue(metadata, 'description'), 5000),
    summary: longText(metadataValue(metadata, 'summary', 'class_summary', 'classSummary'), 5000),
    media_provider: vimeoId || mediaUrl ? 'vimeo' : 'placeholder',
    media_url: mediaUrl || '',
    vimeo_id: vimeoId || '',
    thumbnail_url: compactText(metadataValue(metadata, 'thumbnail_url', 'thumbnailUrl'), 1000),
    masechta: compactText(metadataValue(metadata, 'masechta'), 120),
    perek: compactText(metadataValue(metadata, 'perek'), 80),
    mishnah_range: compactText(metadataValue(metadata, 'mishnah_range', 'mishnahRange', 'mishnah'), 120),
    duration_seconds: Math.max(0, Number(metadataValue(metadata, 'duration_seconds', 'durationSeconds') || 0) || 0),
    transcript_text: longText(metadataValue(metadata, 'transcript_text', 'transcript'), 60000),
    transcript_status: transcriptStatus,
    source_sheet_draft: longText(metadataValue(metadata, 'source_sheet_draft', 'sourceSheetDraft'), 60000),
    package_status: normalizePackageStatus(metadataValue(metadata, 'package_status', 'packageStatus') || 'review'),
    updated_by: compactText(metadataValue(metadata, 'updated_by', 'actor') || 'one-time-vimeo-folder-library', 120),
    metadata: packageMetadata,
  };
}

function buildCandidate(filePath, folder, options = {}) {
  const root = path.resolve(folder);
  const absolutePath = path.resolve(filePath);
  const relativePath = safeRelative(root, absolutePath);
  if (!relativePath) throw new Error(`Video file is outside the configured drop folder: ${filePath}`);
  const stat = fs.statSync(absolutePath);
  const sidecar = readSidecarMetadata(absolutePath, options.secrets || []);
  const metadata = sidecar.metadata || {};
  const sourceHash = sha256(`${relativePath}:${stat.size}:${stat.mtimeMs}`);
  const scope = parseCandidateScope(metadata);
  const safety = {
    synthetic_test: normalizeBoolean(metadataValue(metadata, 'synthetic_test', 'syntheticTest', 'synthetic')),
    contains_sensitive_data: normalizeBoolean(metadataValue(metadata, 'contains_sensitive_data', 'containsSensitiveData')),
    real_class_recording: normalizeBoolean(metadataValue(metadata, 'real_class_recording', 'realClassRecording')),
  };
  const blockers = [...scope.blockers];
  if (sidecar.error) blockers.push(sidecar.error);
  if (stat.size < 1) blockers.push('Video file is empty.');
  if (safety.contains_sensitive_data) blockers.push('Sidecar marks this file as containing sensitive data; automated upload is blocked.');
  const title = compactText(metadataValue(metadata, 'title', 'class_title', 'classTitle') || titleFromFile(absolutePath), 240);
  const candidate = {
    id: sourceHash.slice(0, 16),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    title,
    absolute_path: absolutePath,
    source_hash: sourceHash,
    source_file: {
      name: path.basename(absolutePath),
      relative_path: relativePath,
      extension: path.extname(absolutePath).toLowerCase(),
      size_bytes: stat.size,
      modified_at: stat.mtime.toISOString(),
    },
    sidecar: {
      present: sidecar.present,
      path: sidecar.path ? safeRelative(root, sidecar.path) || path.basename(sidecar.path) : '',
      metadata: sidecar.safe_metadata,
      error: sidecar.error,
    },
    metadata,
    safety,
    blockers,
  };
  candidate.class_package_payload = buildClassPackagePayload(candidate);
  candidate.publish_readiness = directPublishReadiness(candidate.class_package_payload);
  return candidate;
}

function directPublishReadiness(payload = {}) {
  const missing = [];
  if (!payload.title) missing.push('title');
  if (!payload.media_url || !payload.vimeo_id || payload.media_provider !== 'vimeo') missing.push('vimeo_media');
  if (!payload.masechta) missing.push('masechta');
  if (!payload.perek) missing.push('perek');
  if (!payload.mishnah_range) missing.push('mishnah_range');
  if (payload.transcript_status !== 'approved') missing.push('approved_transcript_status');
  if (!payload.summary && !payload.description) missing.push('summary_or_description');
  return {
    ready: missing.length === 0,
    missing,
    next_action: missing.length
      ? `Review package needs ${missing.join(', ')} before member-library publish.`
      : 'Package has the minimum metadata for approval-gated member-library publish.',
  };
}

function loadVimeoToken(repoRoot = process.cwd(), options = {}) {
  const provided = vimeo.normalizeVimeoTokenInput(options.vimeoToken || options.token || '');
  if (provided) {
    return {
      configured: true,
      value: provided,
      source: 'provided',
      length: provided.length,
      fingerprint: sha256(provided).slice(0, 12),
      blocker: null,
    };
  }
  const loaded = loadSecret({
    envName: 'VIMEO_ACCESS_TOKEN',
    names: ['vimeo-access-token', 'vimeo'],
    fileNames: ['vimeo-access-token.txt', 'vimeo.txt'],
    repoRoot,
  });
  const normalized = vimeo.normalizeVimeoTokenInput(loaded.value);
  return {
    configured: Boolean(normalized),
    value: normalized,
    source: loaded.configured ? safeSecretSourceLabel(loaded) : 'not configured',
    length: normalized.length,
    fingerprint: normalized ? sha256(normalized).slice(0, 12) : '',
    blocker: normalized ? null : loaded.blocker,
  };
}

function shouldPermitUpload(candidate, options = {}, tokenStatus = {}) {
  const blockers = [];
  if (options.apply !== true) blockers.push('Upload blocked: --apply was not provided.');
  if (options.upload !== true) blockers.push('Upload not requested.');
  if (options.uploadConfirmation !== VIMEO_UPLOAD_CONFIRMATION) {
    blockers.push(`Upload blocked: --upload-confirm must be ${VIMEO_UPLOAD_CONFIRMATION}.`);
  }
  if (!tokenStatus.configured) blockers.push('Upload blocked: VIMEO_ACCESS_TOKEN is not configured.');
  if (candidate.safety.contains_sensitive_data) blockers.push('Upload blocked: sidecar marks the file as sensitive.');
  if (!candidate.safety.synthetic_test && options.allowRealMedia !== true) {
    blockers.push('Upload blocked: real/non-synthetic media requires --allow-real-media after review.');
  }
  if (candidate.blockers.length) blockers.push(...candidate.blockers);
  return {
    permitted: blockers.length === 0,
    blockers,
  };
}

async function maybeUploadCandidate(candidate, options = {}, tokenStatus = {}) {
  const gate = shouldPermitUpload(candidate, options, tokenStatus);
  if (!options.upload) {
    return {
      status: 'not_requested',
      external_write_performed: false,
      blockers: [],
      media: buildClassPackagePayload(candidate),
    };
  }
  if (!gate.permitted) {
    return {
      status: 'blocked',
      external_write_performed: false,
      blockers: gate.blockers,
      media: buildClassPackagePayload(candidate),
    };
  }
  const bytes = fs.readFileSync(candidate.absolute_path);
  const upload = await vimeo.uploadVimeoAsset({
    title: candidate.class_package_payload.title,
    description: candidate.class_package_payload.description || candidate.class_package_payload.summary,
    bytes,
    size_bytes: bytes.length,
    file_name: candidate.source_file.name,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    class_session_id: candidate.metadata.class_session_id || candidate.metadata.classSessionId || '',
    source_sha256: candidate.source_hash,
    synthetic_test: candidate.safety.synthetic_test,
    test_only: candidate.safety.synthetic_test && options.allowRealMedia !== true,
    contains_sensitive_data: false,
    real_class_recording: candidate.safety.real_class_recording,
    privacy: options.privacy || 'private',
  }, {
    token: tokenStatus.value,
    client: options.client,
    retries: options.retries,
    testProjectUri: options.vimeoProjectUri || options.testProjectUri || '',
    markTestOnly: candidate.safety.synthetic_test && options.allowRealMedia !== true,
    verifyPlayback: options.verifyPlayback === true,
    checkRemoteDuplicates: options.checkRemoteDuplicates === true,
  });
  const video = upload.video || {};
  const playback = video.playback || {};
  const mediaUrl = video.link || playback.playback_url || (playback.vimeo_id ? `https://vimeo.com/${playback.vimeo_id}` : '');
  const linkedPayload = buildClassPackagePayload(candidate, {
    media_url: mediaUrl,
    vimeo_id: playback.vimeo_id || '',
    upload_status: upload.status || 'uploaded',
  });
  return {
    status: upload.ok ? 'uploaded' : 'failed',
    external_write_performed: upload.external_write_performed === true,
    blockers: upload.ok ? [] : [upload.reason || upload.next_action || 'Vimeo upload failed.'],
    upload,
    media: linkedPayload,
  };
}

function databaseUrlFromOptions(options = {}) {
  return compactText(options.databaseUrl || process.env.DATABASE_URL || process.env.PGURL || '', 4000);
}

function requirePg() {
  try {
    return require('pg');
  } catch (error) {
    throw new Error(`pg dependency is required for --create-review-package: ${error.message}`);
  }
}

async function withDatabase(databaseUrl, fn) {
  const { Client } = requirePg();
  const client = new Client({
    connectionString: databaseUrl,
    ssl: /sslmode=require|railway|render|supabase|neon|amazonaws/i.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function getOneTimeProject(client) {
  const project = (await client.query(
    'SELECT id, project_key, name FROM bna_projects WHERE project_key = $1 LIMIT 1',
    [ONE_TIME_PROJECT_KEY],
  )).rows[0];
  if (!project?.id) throw new Error(`Project ${ONE_TIME_PROJECT_KEY} was not found.`);
  return project;
}

function dbGate(options = {}) {
  const blockers = [];
  if (options.apply !== true) blockers.push('Review package DB write blocked: --apply was not provided.');
  if (options.reviewConfirmation !== REVIEW_PACKAGE_CONFIRMATION) {
    blockers.push(`Review package DB write blocked: --review-confirm must be ${REVIEW_PACKAGE_CONFIRMATION}.`);
  }
  const databaseUrl = databaseUrlFromOptions(options);
  if (!databaseUrl) blockers.push('Review package DB write blocked: DATABASE_URL/PGURL is missing.');
  return { permitted: blockers.length === 0, blockers, databaseUrl };
}

async function upsertReviewPackage(client, candidate, packagePayload, options = {}) {
  const project = await getOneTimeProject(client);
  const metadata = {
    ...(packagePayload.metadata || {}),
    workflow_run_id: options.runId || '',
    review_package_created_by: 'one-time-vimeo-folder-library',
  };
  const existingId = Number(candidate.metadata.class_session_id || candidate.metadata.classSessionId || 0) || null;
  let existing = null;
  if (existingId) {
    existing = (await client.query(
      `SELECT id FROM bna_class_sessions WHERE id = $1 AND project_id = $2 LIMIT 1`,
      [existingId, project.id],
    )).rows[0] || null;
    if (!existing) throw new Error(`Class session ${existingId} is not scoped to ${ONE_TIME_PROJECT_KEY}.`);
  } else {
    existing = (await client.query(
      `SELECT id FROM bna_class_sessions
       WHERE project_id = $1
         AND metadata->>'folder_candidate_id' = $2
       LIMIT 1`,
      [project.id, candidate.id],
    )).rows[0] || null;
  }
  const values = [
    project.id,
    packagePayload.class_date || null,
    packagePayload.title,
    packagePayload.description || null,
    packagePayload.summary || null,
    packagePayload.media_provider,
    packagePayload.media_url || null,
    packagePayload.vimeo_id || null,
    packagePayload.thumbnail_url || null,
    packagePayload.masechta || null,
    packagePayload.perek || null,
    packagePayload.mishnah_range || null,
    packagePayload.duration_seconds || null,
    packagePayload.transcript_text || null,
    packagePayload.transcript_status,
    packagePayload.source_sheet_draft || null,
    packagePayload.package_status,
    packagePayload.updated_by,
    JSON.stringify(metadata),
  ];
  if (existing?.id) {
    const updated = (await client.query(
      `UPDATE bna_class_sessions
       SET class_date = $2,
           title = $3,
           description = $4,
           summary = $5,
           media_provider = $6,
           media_url = $7,
           vimeo_id = $8,
           thumbnail_url = $9,
           masechta = $10,
           perek = $11,
           mishnah_range = $12,
           duration_seconds = $13,
           transcript_text = $14,
           transcript_status = $15,
           source_sheet_draft = $16,
           package_status = $17,
           updated_by = $18,
           metadata = COALESCE(metadata, '{}'::jsonb) || $19::jsonb,
           updated_at = NOW()
       WHERE id = $20
         AND project_id = $1
       RETURNING id, project_id, title, media_provider, media_url, vimeo_id, package_status`,
      [...values, existing.id],
    )).rows[0];
    return { action: 'updated_review_package', class_session: updated };
  }
  const inserted = (await client.query(
    `INSERT INTO bna_class_sessions (
       project_id, class_date, title, description, summary, media_provider, media_url,
       vimeo_id, thumbnail_url, masechta, perek, mishnah_range, duration_seconds,
       transcript_text, transcript_status, source_sheet_draft, package_status,
       updated_by, metadata, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12, $13,
       $14, $15, $16, $17,
       $18, $19::jsonb, NOW()
     )
     RETURNING id, project_id, title, media_provider, media_url, vimeo_id, package_status`,
    values,
  )).rows[0];
  return { action: 'created_review_package', class_session: inserted };
}

function buildMemberSnapshot(packagePayload = {}) {
  return {
    title: packagePayload.title || '',
    description: packagePayload.description || packagePayload.summary || '',
    class_date: packagePayload.class_date || null,
    media_provider: packagePayload.media_provider || 'placeholder',
    media_url: packagePayload.media_url || '',
    vimeo_id: packagePayload.vimeo_id || '',
    thumbnail_url: packagePayload.thumbnail_url || '',
    masechta: packagePayload.masechta || '',
    perek: packagePayload.perek || '',
    mishnah_range: packagePayload.mishnah_range || '',
    duration_seconds: packagePayload.duration_seconds || null,
    assets: [],
    source_sheet_draft: packagePayload.source_sheet_draft || '',
    transcript_status: packagePayload.transcript_status || 'review',
  };
}

function publishGate(candidateResult, options = {}) {
  const blockers = [];
  if (options.publish !== true) blockers.push('Publish not requested.');
  if (options.apply !== true) blockers.push('Publish blocked: --apply was not provided.');
  if (options.approvalFlag !== ONE_TIME_LIBRARY_APPROVAL_FLAG) {
    blockers.push(`Publish blocked: --approval-flag must be ${ONE_TIME_LIBRARY_APPROVAL_FLAG}.`);
  }
  const visibility = normalizeLibraryVisibility(options.libraryVisibility || options.library_visibility);
  if (visibility === 'private') blockers.push('Publish blocked: library visibility must be an explicit member-visible tier or smoke target.');
  const readiness = directPublishReadiness(candidateResult.class_package_payload);
  if (!readiness.ready) blockers.push(readiness.next_action);
  if (!candidateResult.database_result?.class_session?.id) blockers.push('Publish blocked: review package was not created or updated.');
  return {
    permitted: blockers.length === 0,
    blockers,
    visibility,
    requiredTier: normalizeRequiredTier(options.requiredTier || options.required_tier),
  };
}

async function publishReviewPackage(client, candidateResult, options = {}) {
  const gate = publishGate(candidateResult, options);
  if (!options.publish) {
    return { status: 'not_requested', member_visibility_performed: false, blockers: [] };
  }
  if (!gate.permitted) {
    return { status: 'blocked', member_visibility_performed: false, blockers: gate.blockers };
  }
  const project = await getOneTimeProject(client);
  const classSessionId = Number(candidateResult.database_result.class_session.id);
  const actor = compactText(options.actor || 'one-time-vimeo-folder-library', 120);
  const snapshot = buildMemberSnapshot(candidateResult.class_package_payload);
  await client.query(
    `UPDATE bna_class_sessions
     SET package_status = 'approved',
         updated_by = $3,
         updated_at = NOW()
     WHERE id = $1
       AND project_id = $2`,
    [classSessionId, project.id, actor],
  );
  const archivedExisting = (await client.query(
    `UPDATE one_time_member_library_items
     SET publish_status = 'archived',
         archived_by = $3,
         archived_at = NOW(),
         rollback_metadata = COALESCE(rollback_metadata, '{}'::jsonb) || $4::jsonb,
         updated_at = NOW()
     WHERE project_id = $1
       AND class_session_id = $2
       AND publish_status = 'published'
     RETURNING id, publish_status`,
    [
      project.id,
      classSessionId,
      actor,
      JSON.stringify({ archived_for_folder_workflow_republish: true, at: new Date().toISOString() }),
    ],
  )).rows;
  const item = (await client.query(
    `INSERT INTO one_time_member_library_items (
       project_id, class_session_id, destination, library_visibility, required_tier,
       publish_status, title, description, media_provider, media_url, vimeo_id,
       thumbnail_url, class_date, package_snapshot, approved_by, approved_at,
       published_by, published_at, updated_at
     ) VALUES (
       $1, $2, 'member_library', $3, $4,
       'published', $5, $6, $7, $8, $9,
       $10, $11, $12::jsonb, $13, NOW(),
       $13, NOW(), NOW()
     )
     RETURNING id, publish_status, library_visibility, required_tier, title, media_provider, media_url, vimeo_id`,
    [
      project.id,
      classSessionId,
      gate.visibility,
      gate.requiredTier,
      snapshot.title,
      snapshot.description || null,
      snapshot.media_provider,
      snapshot.media_url || null,
      snapshot.vimeo_id || null,
      snapshot.thumbnail_url || null,
      snapshot.class_date || null,
      JSON.stringify(snapshot),
      actor,
    ],
  )).rows[0];
  await client.query(
    `UPDATE bna_class_sessions
     SET package_status = 'published',
         updated_by = $3,
         updated_at = NOW()
     WHERE id = $1
       AND project_id = $2`,
    [classSessionId, project.id, actor],
  );
  await client.query(
    `INSERT INTO one_time_library_publish_events (
       project_id, library_item_id, class_session_id, action, actor, approval_flag,
       before_state, after_state, notes
     ) VALUES ($1, $2, $3, 'publish', $4, $5, $6::jsonb, $7::jsonb, $8)`,
    [
      project.id,
      item.id,
      classSessionId,
      actor,
      ONE_TIME_LIBRARY_APPROVAL_FLAG,
      JSON.stringify({ archived_existing: archivedExisting }),
      JSON.stringify(item),
      'Published by approval-gated One Time Vimeo folder workflow.',
    ],
  );
  return {
    status: 'published',
    member_visibility_performed: true,
    item,
    archived_existing_count: archivedExisting.length,
    blockers: [],
  };
}

async function runFolderLibraryWorkflow(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const folder = resolveDropFolder(options.folder, repoRoot);
  if (options.ensureFolder !== false && !fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const tokenStatus = loadVimeoToken(repoRoot, options);
  const secrets = tokenStatus.value ? [tokenStatus.value] : [];
  const runId = options.runId || new Date().toISOString();
  const discovered = discoverVideoFiles(folder, { recursive: options.recursive === true });
  const limited = Number(options.limit || 0) > 0 ? discovered.slice(0, Number(options.limit)) : discovered;
  const report = {
    ok: true,
    run_id: runId,
    generated_at: new Date().toISOString(),
    workflow: 'one_time_vimeo_folder_library',
    raw_id: 'RAW-20260706-967',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    folder,
    folder_relative_to_repo: safeRelative(repoRoot, folder) || folder,
    dry_run: options.apply !== true,
    apply_requested: options.apply === true,
    upload_requested: options.upload === true,
    review_package_requested: options.createReviewPackage === true,
    publish_requested: options.publish === true,
    external_write_performed: false,
    production_mutation_performed: false,
    member_visibility_performed: false,
    vimeo_access_status: {
      configured: tokenStatus.configured,
      source: tokenStatus.source,
      length: tokenStatus.length,
      fingerprint: tokenStatus.fingerprint,
    },
    gates: {
      upload_confirmation_required: VIMEO_UPLOAD_CONFIRMATION,
      upload_confirmation_present: options.uploadConfirmation === VIMEO_UPLOAD_CONFIRMATION,
      review_confirmation_required: REVIEW_PACKAGE_CONFIRMATION,
      review_confirmation_present: options.reviewConfirmation === REVIEW_PACKAGE_CONFIRMATION,
      publish_approval_required: ONE_TIME_LIBRARY_APPROVAL_FLAG,
      publish_approval_present: options.approvalFlag === ONE_TIME_LIBRARY_APPROVAL_FLAG,
      allow_real_media: options.allowRealMedia === true,
    },
    candidates: [],
    blockers: [],
    next_actions: [],
  };
  if (!tokenStatus.configured) report.blockers.push(tokenStatus.blocker || 'Vimeo access token is not configured.');
  for (const filePath of limited) {
    const candidate = buildCandidate(filePath, folder, { secrets });
    const uploadResult = await maybeUploadCandidate(candidate, options, tokenStatus);
    const packagePayload = uploadResult.media || buildClassPackagePayload(candidate);
    let databaseResult = { status: 'not_requested', mutation_performed: false, blockers: [] };
    let publishResult = { status: 'not_requested', member_visibility_performed: false, blockers: [] };
    if (options.createReviewPackage === true) {
      const gate = dbGate(options);
      if (!gate.permitted) {
        databaseResult = { status: 'blocked', mutation_performed: false, blockers: gate.blockers };
      } else {
        await withDatabase(gate.databaseUrl, async (client) => {
          await client.query('BEGIN');
          try {
            const dbWrite = await upsertReviewPackage(client, candidate, packagePayload, { ...options, runId });
            databaseResult = { status: 'written', mutation_performed: true, ...dbWrite, blockers: [] };
            const provisional = {
              class_package_payload: packagePayload,
              database_result: databaseResult,
            };
            publishResult = await publishReviewPackage(client, provisional, options);
            await client.query('COMMIT');
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          }
        });
      }
    } else if (options.publish === true) {
      publishResult = {
        status: 'blocked',
        member_visibility_performed: false,
        blockers: ['Publish requires --create-review-package so the scoped review package exists first.'],
      };
    }
    const candidateResult = {
      id: candidate.id,
      workspace_key: candidate.workspace_key,
      project_key: candidate.project_key,
      title: candidate.title,
      source_file: candidate.source_file,
      sidecar: candidate.sidecar,
      safety: candidate.safety,
      blockers: unique([...candidate.blockers, ...uploadResult.blockers, ...databaseResult.blockers, ...publishResult.blockers]),
      class_package_payload: packagePayload,
      publish_readiness: directPublishReadiness(packagePayload),
      upload_result: uploadResult,
      database_result: databaseResult,
      publish_result: publishResult,
    };
    report.external_write_performed = report.external_write_performed || uploadResult.external_write_performed === true;
    report.production_mutation_performed = report.production_mutation_performed || databaseResult.mutation_performed === true;
    report.member_visibility_performed = report.member_visibility_performed || publishResult.member_visibility_performed === true;
    report.candidates.push(candidateResult);
  }
  report.summary = {
    candidate_count: report.candidates.length,
    ready_for_review_count: report.candidates.filter((candidate) => candidate.blockers.length === 0).length,
    upload_blocked_count: report.candidates.filter((candidate) => candidate.upload_result.status === 'blocked').length,
    review_package_written_count: report.candidates.filter((candidate) => candidate.database_result.status === 'written').length,
    published_count: report.candidates.filter((candidate) => candidate.publish_result.status === 'published').length,
    blockers_count: report.blockers.length + report.candidates.reduce((count, candidate) => count + candidate.blockers.length, 0),
  };
  if (!report.candidates.length) {
    report.next_actions.push(`Drop .mp4, .mov, .m4v, or .webm files into ${report.folder_relative_to_repo}.`);
  }
  if (report.upload_requested && report.summary.upload_blocked_count) {
    report.next_actions.push(`To upload after review, use --apply --upload --upload-confirm ${VIMEO_UPLOAD_CONFIRMATION}. Add --allow-real-media only for reviewed real class recordings.`);
  }
  if (report.publish_requested && !report.member_visibility_performed) {
    report.next_actions.push(`Member-library publish requires --approval-flag ${ONE_TIME_LIBRARY_APPROVAL_FLAG}, explicit visibility/tier, and a scoped review package.`);
  }
  const redacted = redactSecrets(report, secrets);
  const noSecretCheck = vimeo.assertNoVimeoSecrets(redacted, secrets);
  if (!noSecretCheck.ok || JSON.stringify(redacted).includes(tokenStatus.value)) {
    throw new Error('Workflow report failed no-secret validation.');
  }
  return redacted;
}

function formatMarkdownReport(report = {}) {
  const lines = [
    `# One Time Vimeo Folder Library Report - ${report.generated_at || ''}`,
    '',
    `- Workflow: \`${report.workflow}\``,
    `- Scope: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `- Folder: \`${report.folder_relative_to_repo || report.folder || ''}\``,
    `- Dry run: \`${report.dry_run === true}\``,
    `- Vimeo access: \`${report.vimeo_access_status?.configured ? 'configured' : 'missing'}\` from \`${report.vimeo_access_status?.source || 'not configured'}\` fingerprint \`${report.vimeo_access_status?.fingerprint || 'none'}\``,
    `- External Vimeo write performed: \`${report.external_write_performed === true}\``,
    `- DB mutation performed: \`${report.production_mutation_performed === true}\``,
    `- Member visibility performed: \`${report.member_visibility_performed === true}\``,
    '',
    '## Summary',
    '',
    `- Candidates: ${report.summary?.candidate_count || 0}`,
    `- Ready for review: ${report.summary?.ready_for_review_count || 0}`,
    `- Upload blocked: ${report.summary?.upload_blocked_count || 0}`,
    `- Review packages written: ${report.summary?.review_package_written_count || 0}`,
    `- Published: ${report.summary?.published_count || 0}`,
    '',
    '## Candidates',
    '',
  ];
  if (!report.candidates?.length) {
    lines.push('- No media candidates found.');
  } else {
    for (const candidate of report.candidates) {
      lines.push(`- \`${candidate.id}\` ${candidate.title}`);
      lines.push(`  - File: \`${candidate.source_file?.relative_path || ''}\``);
      lines.push(`  - Upload: \`${candidate.upload_result?.status || 'not_requested'}\``);
      lines.push(`  - Review package: \`${candidate.database_result?.status || 'not_requested'}\``);
      lines.push(`  - Publish: \`${candidate.publish_result?.status || 'not_requested'}\``);
      lines.push(`  - Publish readiness: \`${candidate.publish_readiness?.ready ? 'ready' : 'needs_review'}\``);
      if (candidate.blockers?.length) lines.push(`  - Blockers: ${candidate.blockers.join('; ')}`);
    }
  }
  if (report.next_actions?.length) {
    lines.push('', '## Next Actions', '');
    for (const action of report.next_actions) lines.push(`- ${action}`);
  }
  return lines.join('\n');
}

function writeWorkflowReport(report, options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const reportDir = path.resolve(repoRoot, options.reportDir || DEFAULT_REPORT_DIR);
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = (report.generated_at || new Date().toISOString()).replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-report.json`);
  const mdPath = path.join(reportDir, `${stamp}-report.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${formatMarkdownReport(report)}\n`);
  return { jsonPath, mdPath };
}

module.exports = {
  DEFAULT_DROP_FOLDER,
  DEFAULT_REPORT_DIR,
  ONE_TIME_LIBRARY_APPROVAL_FLAG,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  REVIEW_PACKAGE_CONFIRMATION,
  SUPPORTED_VIDEO_EXTENSIONS,
  VIMEO_UPLOAD_CONFIRMATION,
  buildCandidate,
  buildClassPackagePayload,
  defaultDropFolder,
  directPublishReadiness,
  discoverVideoFiles,
  formatMarkdownReport,
  loadVimeoToken,
  publishGate,
  resolveDropFolder,
  runFolderLibraryWorkflow,
  writeWorkflowReport,
};
