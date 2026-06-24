#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  APPLY_GATE_PHRASE,
  DEFAULT_REPAIR_JOB_RANGE,
  buildGuardedBackfillDryRun,
  buildPipelineTraceRows,
  evaluateSuspectedCauses,
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  renderBackfillMarkdown,
  renderPipelineCensusMarkdown,
  sha256,
} = require('../src/lib/bna/class-drive-intake-reconcile');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, 'ops', 'class-drive-intake', '2026-06-24-closeout');
const MAIN_REPO = path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'BNA v2.0');

function parseJobRange(value) {
  const raw = String(value || '').trim();
  const range = raw.match(/^(\d+)-(\d+)$/);
  if (range) return [Number(range[1]), Number(range[2])];
  const single = Number(raw);
  return Number.isFinite(single) ? [single, single] : DEFAULT_REPAIR_JOB_RANGE.slice();
}

function parseArgs(argv) {
  const args = {
    command: 'all',
    write: false,
    apply: false,
    gate: '',
    skipDrive: false,
    drivePageSize: 50,
    jobs: DEFAULT_REPAIR_JOB_RANGE.slice(),
    outDir: DEFAULT_OUT_DIR,
    envFiles: [],
  };
  const rest = [...argv];
  if (rest[0] && !rest[0].startsWith('-')) args.command = rest.shift();
  for (let i = 0; i < rest.length; i += 1) {
    const item = rest[i];
    if (item === '--write') args.write = true;
    else if (item === '--apply') args.apply = true;
    else if (item === '--skip-drive') args.skipDrive = true;
    else if (item === '--gate') args.gate = rest[++i] || '';
    else if (item === '--jobs') args.jobs = parseJobRange(rest[++i]);
    else if (item === '--out-dir') args.outDir = path.resolve(rest[++i]);
    else if (item === '--env-file') args.envFiles.push(path.resolve(rest[++i]));
    else if (item === '--drive-page-size') args.drivePageSize = Number(rest[++i] || 50) || 50;
    else if (item.startsWith('--jobs=')) args.jobs = parseJobRange(item.slice('--jobs='.length));
    else if (item.startsWith('--out-dir=')) args.outDir = path.resolve(item.slice('--out-dir='.length));
    else if (item.startsWith('--env-file=')) args.envFiles.push(path.resolve(item.slice('--env-file='.length)));
  }
  if (process.env.BNA_ENV_FILE) args.envFiles.unshift(path.resolve(process.env.BNA_ENV_FILE));
  return args;
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return { loaded: false, path: filePath || '' };
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
  return { loaded: true, path: filePath };
}

function loadEnvironment(args) {
  const candidates = [
    path.join(REPO_ROOT, '.env.local'),
    path.join(REPO_ROOT, '.env'),
    path.join(MAIN_REPO, '.env.local'),
    path.join(MAIN_REPO, '.env'),
    ...args.envFiles,
  ];
  const seen = new Set();
  return candidates
    .filter(Boolean)
    .map((file) => path.resolve(file))
    .filter((file) => {
      if (seen.has(file)) return false;
      seen.add(file);
      return true;
    })
    .map(loadEnvFile);
}

function setSecretEnv(key, value, { override = true } = {}) {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  if (!override && process.env[key]) return false;
  process.env[key] = normalized;
  return true;
}

function secretRoots() {
  return [
    process.env.BNA_SECRET_ROOT,
    path.join(REPO_ROOT, '.secrets'),
    path.join(MAIN_REPO, '.secrets'),
    path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'BNA-Keyholder'),
  ].filter(Boolean).map((item) => path.resolve(item));
}

function loadEnvText(text, { override = true } = {}) {
  const loaded = [];
  for (const line of String(text || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (/^[A-Z0-9_]+$/.test(key) && setSecretEnv(key, value, { override })) loaded.push(key);
  }
  return loaded;
}

function loadJsonSecret(text, { override = true } = {}) {
  const loaded = [];
  const data = JSON.parse(text);
  const envLike = data.env || data.environment || data;
  const mappings = [
    ['client_id', 'GOOGLE_CLIENT_ID'],
    ['clientId', 'GOOGLE_CLIENT_ID'],
    ['client_secret', 'GOOGLE_CLIENT_SECRET'],
    ['clientSecret', 'GOOGLE_CLIENT_SECRET'],
    ['refresh_token', 'GOOGLE_REFRESH_TOKEN'],
    ['refreshToken', 'GOOGLE_REFRESH_TOKEN'],
    ['private_key', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'],
    ['privateKey', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'],
    ['client_email', 'GOOGLE_SERVICE_ACCOUNT_EMAIL'],
    ['clientEmail', 'GOOGLE_SERVICE_ACCOUNT_EMAIL'],
  ];
  const nestedClients = [envLike.web, envLike.installed, envLike.oauth, envLike.google_oauth].filter(Boolean);
  for (const source of [envLike, ...nestedClients]) {
    for (const [from, to] of mappings) {
      if (source?.[from] && setSecretEnv(to, source[from], { override })) loaded.push(to);
    }
    for (const [key, value] of Object.entries(source || {})) {
      if (/^[A-Z0-9_]+$/.test(key) && setSecretEnv(key, value, { override })) loaded.push(key);
    }
  }
  if (envLike.root && setSecretEnv('BNA_DRIVE_ROOT_FOLDER_ID', envLike.root, { override })) loaded.push('BNA_DRIVE_ROOT_FOLDER_ID');
  if (envLike.websiteMomentsIntake && setSecretEnv('BNA_DRIVE_WEBSITE_MOMENTS_INTAKE_FOLDER_ID', envLike.websiteMomentsIntake, { override })) loaded.push('BNA_DRIVE_WEBSITE_MOMENTS_INTAKE_FOLDER_ID');
  if (envLike.stages && typeof envLike.stages === 'object') {
    let index = 0;
    for (const [label, folderId] of Object.entries(envLike.stages)) {
      index += 1;
      const suffix = String(label || `stage_${index}`)
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 48);
      const key = `BNA_DRIVE_STAGE_${suffix || index}_FOLDER_ID`;
      if (setSecretEnv(key, folderId, { override })) loaded.push(key);
    }
  }
  if (envLike.simplifiedFolders && typeof envLike.simplifiedFolders === 'object') {
    for (const [label, folderId] of Object.entries(envLike.simplifiedFolders)) {
      const suffix = String(label || '')
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 48);
      const key = `BNA_DRIVE_SIMPLIFIED_${suffix}_FOLDER_ID`;
      if (setSecretEnv(key, folderId, { override })) loaded.push(key);
    }
  }
  return [...new Set(loaded)];
}

function loadSecretFiles() {
  const loaded = [];
  const roots = [...new Set(secretRoots())];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const files = [
      'railway-database-url.txt',
      'railway-google-env.txt',
      'railway-google-env-pending.txt',
      'google-oauth-client.json',
      'google-refresh-token.txt',
      'google-drive-pipeline.json',
    ];
    for (const name of files) {
      const filePath = path.join(root, name);
      if (!fs.existsSync(filePath)) continue;
      try {
        const text = fs.readFileSync(filePath, 'utf8');
        let keys = [];
        if (name === 'railway-database-url.txt') {
          if (setSecretEnv('DATABASE_URL', text, { override: true })) keys.push('DATABASE_URL');
        } else if (name.endsWith('.json')) {
          keys = loadJsonSecret(text, { override: true });
        } else if (name === 'google-refresh-token.txt') {
          if (setSecretEnv('GOOGLE_REFRESH_TOKEN', text, { override: true })) keys.push('GOOGLE_REFRESH_TOKEN');
        } else {
          keys = loadEnvText(text, { override: true });
        }
        loaded.push({
          file: name,
          path_hash: sha256(filePath).slice(0, 16),
          loaded_keys: [...new Set(keys)].sort(),
        });
      } catch (error) {
        loaded.push({
          file: name,
          path_hash: sha256(filePath).slice(0, 16),
          error: error.message,
        });
      }
    }
  }
  return loaded;
}

function secretRootMetadata() {
  return [...new Set(secretRoots())].map((root) => {
    const exists = fs.existsSync(root);
    let fileCount = 0;
    if (exists) {
      try {
        fileCount = fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isFile()).length;
      } catch (_error) {
        fileCount = 0;
      }
    }
    return { path_hash: sha256(root).slice(0, 16), exists, file_count: fileCount };
  });
}

function detectGoogleAuthPath() {
  const paths = [];
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    paths.push({
      path_type: 'application_credentials_file',
      status: fs.existsSync(credPath) ? 'ready' : 'blocked',
      path_hash: sha256(path.resolve(credPath)).slice(0, 16),
      blocker: fs.existsSync(credPath) ? '' : 'GOOGLE_APPLICATION_CREDENTIALS points to a missing file.',
    });
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    paths.push({
      path_type: 'service_account_env',
      status: 'ready',
      email_hash: sha256(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.toLowerCase()).slice(0, 16),
    });
  }
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    paths.push({
      path_type: 'oauth_refresh_token',
      status: 'ready',
      client_id_hash: sha256(process.env.GOOGLE_CLIENT_ID).slice(0, 16),
    });
  }
  return paths.find((item) => item.status === 'ready') || {
    path_type: 'none',
    status: 'blocked',
    blocker: 'No application credentials file, service-account pair, or OAuth refresh token trio was detected.',
    detected_paths: paths,
  };
}

function driveStageFolders() {
  const keys = [
    'BNA_CLASS_RECORDINGS_FOLDER_ID',
    'BNA_CLASS_DRIVE_FOLDER_ID',
    'GOOGLE_DRIVE_CLASS_RECORDINGS_FOLDER_ID',
    'GOOGLE_DRIVE_CLASS_INTAKE_FOLDER_ID',
    'DRIVE_CLASS_INTAKE_FOLDER_ID',
    'ONE_TIME_CLASS_RECORDINGS_FOLDER_ID',
    'ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID',
    'BNA_DRIVE_ROOT_FOLDER_ID',
    'BNA_DRIVE_WEBSITE_MOMENTS_INTAKE_FOLDER_ID',
    ...Object.keys(process.env).filter((key) => /^BNA_DRIVE_(STAGE|SIMPLIFIED)_.+_FOLDER_ID$/.test(key)).sort(),
  ];
  const folders = keys.filter((key) => process.env[key]).map((key) => ({
    env_key: key,
    ref: redactedRef(process.env[key], 'drive_folder'),
  }));
  return { configured_count: folders.length, folders };
}

function authReadiness(envLoadResults, loadedSecretFiles = [], driveReadback = {}) {
  const dbReady = Boolean(process.env.DATABASE_URL || process.env.PGHOST);
  return {
    generated_at: new Date().toISOString(),
    no_production_mutation: true,
    owner_read_only_phrase: 'READ_EXTERNAL_PRODUCTION_STATE',
    loaded_env_files: envLoadResults.map((item) => ({
      loaded: item.loaded,
      path_hash: item.path ? sha256(path.resolve(item.path)).slice(0, 16) : null,
    })),
    secret_roots: secretRootMetadata(),
    loaded_secret_files: loadedSecretFiles,
    database: {
      status: dbReady ? 'ready' : 'blocked',
      connection_ref: process.env.DATABASE_URL ? redactedRef(process.env.DATABASE_URL, 'database_url') : null,
      blocker: dbReady ? '' : 'No DATABASE_URL/PGHOST was configured for read-only DB inspection.',
    },
    canonical_google_auth: detectGoogleAuthPath(),
    drive_stage_folders: driveStageFolders(),
    drive_readback: driveReadback,
    production_revision_compared: false,
  };
}

function renderAuthMarkdown(auth) {
  return [
    '# Auth Readiness',
    '',
    `Generated: ${auth.generated_at}`,
    `No production mutation: ${auth.no_production_mutation !== false}`,
    '',
    '## Database',
    '',
    `- Status: ${auth.database.status}`,
    auth.database.blocker ? `- Blocker: ${auth.database.blocker}` : '- Blocker: none',
    '',
    '## Google Drive',
    '',
    `- Canonical auth path: ${auth.canonical_google_auth.path_type}`,
    `- Status: ${auth.canonical_google_auth.status}`,
    auth.canonical_google_auth.blocker ? `- Blocker: ${auth.canonical_google_auth.blocker}` : '- Blocker: none',
    `- Configured stage folders: ${auth.drive_stage_folders.configured_count}`,
    '',
    '## Secret Handling',
    '',
    '- Secret values were not printed.',
    '- Evidence contains hashes/redacted refs only.',
    '',
  ].join('\n');
}

async function connectReadOnlyClient() {
  let pg;
  try {
    pg = require('pg');
  } catch (error) {
    return { client: null, blocker: `pg dependency unavailable: ${error.message}` };
  }
  if (!process.env.DATABASE_URL && !process.env.PGHOST) return { client: null, blocker: 'No DATABASE_URL/PGHOST configured.' };
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? false : { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    return { client, blocker: '' };
  } catch (error) {
    try {
      await client.end();
    } catch (_error) {
      // ignore cleanup failure
    }
    return { client: null, blocker: error.message };
  }
}

async function tableExists(client, tableName) {
  const result = await client.query('SELECT to_regclass($1) AS exists', [tableName]);
  return Boolean(result.rows[0]?.exists);
}

async function queryIfTable(client, tableName, sql, params = []) {
  if (!(await tableExists(client, tableName))) return [];
  return (await client.query(sql, params)).rows;
}

async function loadDbSnapshot(jobRange) {
  const snapshot = {
    jobs: [],
    students: [],
    classSessions: [],
    groupGoalEntries: [],
    torahEntries: [],
    accountabilityEvents: [],
    contentOutputs: [],
    intakeParseRuns: [],
    rawIntake: [],
    blockers: [],
  };
  const { client, blocker } = await connectReadOnlyClient();
  if (!client) {
    snapshot.blockers.push(blocker);
    return snapshot;
  }
  const [start, end] = jobRange;
  try {
    snapshot.jobs = await queryIfTable(client, 'bna_content_jobs', `
      SELECT *
      FROM bna_content_jobs
      WHERE id BETWEEN $1 AND $2
         OR drive_file_id IS NOT NULL
         OR transcript_text IS NOT NULL
         OR source_type ILIKE ANY(ARRAY['%drive%','%recording%','%class%'])
         OR COALESCE(parse_json::text, '') ILIKE '%mixed_recording_parse%'
         OR COALESCE(parse_json::text, '') ILIKE '%class_notes%'
      ORDER BY id ASC
      LIMIT 500
    `, [start, end]);
    const jobIds = snapshot.jobs.map((job) => Number(job.id)).filter(Boolean);
    const ids = jobIds.length ? jobIds : [-1];
    snapshot.students = await queryIfTable(client, 'bna_students', `
      SELECT id, name, parent_name, project_id, status, notes
      FROM bna_students
      WHERE COALESCE(status, 'active') NOT IN ('archived', 'inactive')
      ORDER BY name ASC
    `);
    snapshot.classSessions = await queryIfTable(client, 'bna_class_sessions', 'SELECT * FROM bna_class_sessions WHERE content_job_id = ANY($1::int[]) ORDER BY id ASC', [ids]);
    snapshot.groupGoalEntries = await queryIfTable(client, 'bna_group_goal_entries', 'SELECT * FROM bna_group_goal_entries WHERE source_content_job_id = ANY($1::int[]) ORDER BY id ASC', [ids]);
    snapshot.torahEntries = await queryIfTable(client, 'bna_torah_learning_entries', `
      SELECT *
      FROM bna_torah_learning_entries
      WHERE date >= CURRENT_DATE - INTERVAL '60 days'
         OR COALESCE(note, '') ILIKE ANY($1::text[])
      ORDER BY date DESC, id DESC
      LIMIT 2000
    `, [[...ids.map((id) => `%content job #${id}%`), ...ids.map((id) => `%job ${id}%`)]]);
    snapshot.accountabilityEvents = await queryIfTable(client, 'bna_accountability_events', `
      SELECT *
      FROM bna_accountability_events
      WHERE metadata::text ILIKE ANY($1::text[])
         OR source_message_id = ANY($2::text[])
      ORDER BY id DESC
      LIMIT 2000
    `, [[...ids.map((id) => `%source_content_job_id%${id}%`), ...ids.map((id) => `%content job #${id}%`)], ids.map(String)]);
    snapshot.contentOutputs = await queryIfTable(client, 'bna_content_outputs', 'SELECT * FROM bna_content_outputs WHERE job_id = ANY($1::int[]) ORDER BY id ASC', [ids]);
    snapshot.intakeParseRuns = await queryIfTable(client, 'bna_intake_parse_runs', `
      SELECT *
      FROM bna_intake_parse_runs
      WHERE source_table = 'bna_content_jobs'
         OR source_id = ANY($1::text[])
         OR metadata::text ILIKE '%bna_content_jobs%'
      ORDER BY id DESC
      LIMIT 2000
    `, [ids.map(String)]);
    const rawStableIds = snapshot.intakeParseRuns.map((run) => parseJsonMaybe(run.metadata, {})?.raw_intake_stable_id).filter(Boolean);
    snapshot.rawIntake = await queryIfTable(client, 'bna_raw_intake', `
      SELECT *
      FROM bna_raw_intake
      WHERE stable_id = ANY($1::text[])
         OR parsed_payload::text ILIKE '%bna_content_jobs%'
      ORDER BY id DESC
      LIMIT 2000
    `, [rawStableIds.length ? rawStableIds : ['__none__']]);
    await client.query('ROLLBACK');
  } catch (error) {
    snapshot.blockers.push(error.message);
    try {
      await client.query('ROLLBACK');
    } catch (_error) {
      // ignore cleanup failure
    }
  } finally {
    await client.end();
  }
  return snapshot;
}

async function buildGoogleAuth(auth) {
  let googleapis;
  try {
    googleapis = require('googleapis');
  } catch (error) {
    return { authClient: null, blocker: `googleapis dependency unavailable: ${error.message}` };
  }
  const { google } = googleapis;
  if (auth.path_type === 'application_credentials_file') {
    return {
      authClient: new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      }),
      blocker: '',
    };
  }
  if (auth.path_type === 'service_account_env') {
    return {
      authClient: new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: String(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      }),
      blocker: '',
    };
  }
  if (auth.path_type === 'oauth_refresh_token') {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
    );
    client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return { authClient: client, blocker: '' };
  }
  return { authClient: null, blocker: auth.blocker || 'No ready Google auth path.' };
}

async function readDriveMetadata(args, auth) {
  if (args.skipDrive) return { skipped: true, reason: 'skip-drive supplied', files: [], files_redacted: [] };
  const folders = auth.drive_stage_folders?.folders || [];
  if (!folders.length) return { skipped: true, reason: 'no configured Drive stage folders', files: [], files_redacted: [] };
  const { authClient, blocker } = await buildGoogleAuth(auth.canonical_google_auth || {});
  if (!authClient) return { skipped: true, reason: blocker, files: [], files_redacted: [] };
  try {
    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth: authClient });
    const files = [];
    for (const folder of folders) {
      const folderId = process.env[folder.env_key];
      const result = await drive.files.list({
        q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed = false`,
        pageSize: args.drivePageSize,
        fields: 'files(id,name,mimeType,createdTime,modifiedTime,size)',
        orderBy: 'createdTime desc',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      for (const file of result.data.files || []) files.push({ ...file, folder_label: folder.env_key, folder_ref: folder.ref });
    }
    return {
      skipped: false,
      files,
      files_redacted: files.map((file) => ({
        name: redactSensitiveText(file.name),
        id_ref: redactedRef(file.id, 'drive_file'),
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        size: file.size || null,
        folder_label: file.folder_label,
        folder_ref: file.folder_ref,
      })),
    };
  } catch (error) {
    return { skipped: true, reason: error.message, files: [], files_redacted: [] };
  }
}

function reportsFrom(snapshot, auth, driveReadback, args) {
  if (driveReadback.files?.length && snapshot.jobs.length) {
    const jobDriveHashes = new Set(snapshot.jobs.map((job) => sha256(job.drive_file_id || job.source_drive_file_id || '')).filter(Boolean));
    for (const file of driveReadback.files) {
      file.no_matching_job = !jobDriveHashes.has(sha256(file.id));
      file.orphan = file.no_matching_job;
    }
  }
  const pipelineRows = buildPipelineTraceRows({
    jobs: snapshot.jobs,
    driveFiles: driveReadback.files || [],
    classSessions: snapshot.classSessions,
    groupGoalEntries: snapshot.groupGoalEntries,
    torahEntries: snapshot.torahEntries,
    accountabilityEvents: snapshot.accountabilityEvents,
    contentOutputs: snapshot.contentOutputs,
    intakeParseRuns: snapshot.intakeParseRuns,
    rawIntake: snapshot.rawIntake,
    students: snapshot.students,
  });
  const census = {
    generated_at: new Date().toISOString(),
    no_production_mutation: true,
    read_only_authorization_phrase: 'READ_EXTERNAL_PRODUCTION_STATE',
    inspected_job_range: args.jobs,
    db_blockers: snapshot.blockers,
    drive_readback: {
      skipped: driveReadback.skipped,
      reason: driveReadback.reason || '',
      files_count: driveReadback.files_redacted?.length || 0,
      files: driveReadback.files_redacted || [],
    },
    suspected_causes: evaluateSuspectedCauses({
      jobs: snapshot.jobs,
      authReadiness: auth,
      driveFiles: driveReadback.files || [],
      pipelineRows,
    }),
    pipeline_rows: pipelineRows,
  };
  const backfill = buildGuardedBackfillDryRun({
    jobs: snapshot.jobs,
    students: snapshot.students,
    classSessions: snapshot.classSessions,
    groupGoalEntries: snapshot.groupGoalEntries,
    torahEntries: snapshot.torahEntries,
    accountabilityEvents: snapshot.accountabilityEvents,
    jobRange: args.jobs,
  });
  const recommendation = {
    generated_at: backfill.generated_at,
    no_production_mutation: true,
    approved_candidate_jobs: backfill.approved_candidate_jobs,
    excluded_jobs: backfill.excluded_jobs,
    safe_to_apply: backfill.safe_to_apply,
    blocking_ambiguities: backfill.blocking_ambiguities,
    expected_row_counts: backfill.expected_row_counts,
    apply_command: backfill.apply_command,
    rollback_command: backfill.rollback_command,
    required_gate_phrase: backfill.required_gate_phrase,
    dry_run_plan_file: 'BACKFILL-DRY-RUN.md',
  };
  const sourceCoverage = buildLaneSourceCoverage({
    census,
    backfill,
    recommendation,
  });
  return { census, backfill, recommendation, sourceCoverage };
}

function evidenceExists(relativePath) {
  return fs.existsSync(path.join(REPO_ROOT, relativePath));
}

function buildLaneSourceCoverage() {
  const statements = [
    ['SRC-20260624-101', 'Create and activate the class/Drive intake goal; preserve raw source and register requirements.', 'REQ-20260624-101', ['raw-input/RAW-20260624-003-class-drive-intake-goal.md', 'tasks-pending/2026-06-24-class-drive-intake-reconciliation-goal.md']],
    ['SRC-20260624-102', 'Read control manifest and branch from the exact integration base.', 'REQ-20260624-101', ['tasks-pending/2026-06-24-class-drive-intake-reconciliation-goal.md']],
    ['SRC-20260624-103', 'Build read-only diagnostics for pipeline census, stage reports, orphan output, ambiguity, proposed changes, duplicates, UI mismatch, and credentials/workers.', 'REQ-20260624-102', ['scripts/class-drive-intake-reconcile.cjs', 'src/lib/bna/class-drive-intake-reconcile.js', 'ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.json']],
    ['SRC-20260624-104', 'Trace every known uploaded class/job through the 20 required stages, explicitly inspecting jobs 64-74 if present.', 'REQ-20260624-102', ['ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.json', 'ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.md']],
    ['SRC-20260624-105', 'Verify or disprove the suspected causes including OpenAI 401, Drive config/auth, worker/parser/apply gaps, aliases, duplicates, generic parser, deployment, and stale status.', 'REQ-20260624-103', ['ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.json', 'ops/class-drive-intake/2026-06-24-closeout/PIPELINE-CENSUS.md']],
    ['SRC-20260624-106', 'Prepare a dry-run-only guarded backfill with row-level plan, exclusions, expected counts, transaction boundaries, rollback, idempotency, and gate phrase.', 'REQ-20260624-104', ['ops/class-drive-intake/2026-06-24-closeout/BACKFILL-DRY-RUN.md', 'ops/class-drive-intake/2026-06-24-closeout/BACKFILL-RECOMMENDATION.json']],
    ['SRC-20260624-107', 'Write BACKFILL-RECOMMENDATION.json for Prompt 09 / final integrator consumption.', 'REQ-20260624-104', ['ops/class-drive-intake/2026-06-24-closeout/BACKFILL-RECOMMENDATION.json']],
    ['SRC-20260624-108', 'Cover multi-student extraction, scores/progress, student questions, linkage, ambiguity, duplicates, retries, visible failures, idempotency, read models, dry-run, and rollback with tests.', 'REQ-20260624-105', ['tests/class-drive-intake-reconcile.test.js', 'ops/class-drive-intake/2026-06-24-closeout/VERIFICATION.md']],
    ['SRC-20260624-109', 'Detect credential readiness without printing secrets or raw Drive IDs.', 'REQ-20260624-106', ['ops/class-drive-intake/2026-06-24-closeout/AUTH-READINESS.md']],
    ['SRC-20260624-110', 'Do not edit server.js; provide SHARED-PATCH.diff when shared wiring is required.', 'REQ-20260624-107', ['ops/class-drive-intake/2026-06-24-closeout/SHARED-PATCH.diff']],
    ['SRC-20260624-111', 'Run focused tests, source coverage, JSON checks, secret audit, and git diff --check.', 'REQ-20260624-108', ['ops/class-drive-intake/2026-06-24-closeout/VERIFICATION.md']],
    ['SRC-20260624-112', 'Commit and push the lane branch.', 'REQ-20260624-109', ['tasks-pending/2026-06-24-class-drive-intake-reconciliation-goal.md']],
  ].map(([statement_id, source_statement, requirement_id, evidence_paths]) => ({
    statement_id,
    source_id: 'RAW-20260624-003',
    source_statement,
    requirement_id,
    classification: 'requirement',
    evidence_paths,
    evidence_present: evidence_paths.every(evidenceExists),
  }));

  const unmapped = statements.filter((statement) => !statement.requirement_id);
  const missingEvidence = statements.filter((statement) => !statement.evidence_present);
  const byRequirement = statements.reduce((counts, statement) => {
    counts[statement.requirement_id] = (counts[statement.requirement_id] || 0) + 1;
    return counts;
  }, {});
  return {
    generated_at: new Date().toISOString(),
    source_id: 'RAW-20260624-003',
    source_path: 'raw-input/RAW-20260624-003-class-drive-intake-goal.md',
    no_production_mutation: true,
    source_statement_count: statements.length,
    mapped_statement_count: statements.length - unmapped.length,
    unmapped_executable_statement_count: unmapped.length,
    missing_evidence_count: missingEvidence.length,
    by_requirement: byRequirement,
    statements,
  };
}

function renderSourceCoverageMarkdown(report = {}) {
  return [
    '# Class/Drive Intake Source Coverage',
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Source: ${report.source_id || 'RAW-20260624-003'}`,
    `No production mutation: ${report.no_production_mutation !== false}`,
    '',
    '## Summary',
    '',
    `- Source statements: ${report.source_statement_count || 0}`,
    `- Mapped statements: ${report.mapped_statement_count || 0}`,
    `- Unmapped executable statements: ${report.unmapped_executable_statement_count || 0}`,
    `- Statements with missing evidence: ${report.missing_evidence_count || 0}`,
    '',
    '## Coverage',
    '',
    '| Statement | Requirement | Evidence Present |',
    '| --- | --- | --- |',
    ...(report.statements || []).map((statement) => `| ${statement.statement_id} | ${statement.requirement_id || ''} | ${statement.evidence_present ? 'yes' : 'no'} |`),
    '',
  ].join('\n');
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function writeEvidence(args, auth, reports) {
  writeJson(path.join(args.outDir, 'PIPELINE-CENSUS.json'), reports.census);
  writeText(path.join(args.outDir, 'PIPELINE-CENSUS.md'), renderPipelineCensusMarkdown(reports.census));
  writeJson(path.join(args.outDir, 'BACKFILL-RECOMMENDATION.json'), reports.recommendation);
  writeText(path.join(args.outDir, 'BACKFILL-DRY-RUN.md'), renderBackfillMarkdown(reports.backfill));
  writeText(path.join(args.outDir, 'AUTH-READINESS.md'), renderAuthMarkdown(auth));
  writeJson(path.join(args.outDir, 'SOURCE-COVERAGE.json'), reports.sourceCoverage);
  writeText(path.join(args.outDir, 'SOURCE-COVERAGE.md'), renderSourceCoverageMarkdown(reports.sourceCoverage));
}

function selectOutput(command, reports) {
  if (command === 'census' || command === 'stage-report') return reports.census;
  if (command === 'orphan-output') {
    return {
      generated_at: reports.census.generated_at,
      drive_orphans: reports.census.pipeline_rows.filter((row) => row.kind === 'drive_orphan'),
      structured_without_writes: reports.census.pipeline_rows.filter((row) => row.stages?.canonical_write_status?.status === 'MISSING'),
    };
  }
  if (command === 'student-ambiguity') {
    return {
      generated_at: reports.census.generated_at,
      rows: reports.census.pipeline_rows.map((row) => ({ job_id: row.job_id, ambiguity: row.stages?.ambiguity_review })).filter((row) => row.ambiguity?.status === 'NEEDS_REVIEW'),
      backfill_exclusions: reports.backfill.ambiguity_exclusions,
    };
  }
  if (command === 'proposed-changes' || command === 'backfill') return reports.backfill;
  if (command === 'duplicates') return { generated_at: reports.census.generated_at, duplicate_groups: reports.backfill.duplicate_groups, duplicate_exclusions: reports.backfill.duplicate_exclusions };
  if (command === 'ui-mismatch') {
    return {
      generated_at: reports.census.generated_at,
      rows: reports.census.pipeline_rows.filter((row) => row.stages?.operations_read_model_visibility?.status === 'UNKNOWN' || row.stages?.parent_student_visibility?.status === 'UNKNOWN'),
    };
  }
  if (command === 'credential-worker') {
    return {
      generated_at: reports.census.generated_at,
      db_blockers: reports.census.db_blockers,
      drive_readback: reports.census.drive_readback,
      worker_rows: reports.census.pipeline_rows.filter((row) => row.stages?.retry_dedup_status?.status === 'NEEDS_RETRY'),
    };
  }
  if (command === 'source-coverage') return reports.sourceCoverage;
  return reports;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if ((args.apply || args.command === 'apply' || args.command === 'rollback') && args.gate !== APPLY_GATE_PHRASE) {
    throw new Error(`Refusing mutation: guarded apply requires --gate ${APPLY_GATE_PHRASE}.`);
  }
  if (args.apply || args.command === 'apply' || args.command === 'rollback') {
    throw new Error('Refusing mutation: this parallel reconciliation lane is read-only and does not apply or roll back production data.');
  }
  const envLoadResults = loadEnvironment(args);
  const loadedSecretFiles = loadSecretFiles();
  let auth = authReadiness(envLoadResults, loadedSecretFiles);
  const driveReadback = await readDriveMetadata(args, auth);
  auth = authReadiness(envLoadResults, loadedSecretFiles, driveReadback);
  const snapshot = await loadDbSnapshot(args.jobs);
  const reports = reportsFrom(snapshot, auth, driveReadback, args);
  if (args.write || args.command === 'all') writeEvidence(args, auth, reports);
  process.stdout.write(`${JSON.stringify(selectOutput(args.command, reports), null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${redactSensitiveText(error.stack || error.message)}\n`);
  process.exitCode = 1;
});
