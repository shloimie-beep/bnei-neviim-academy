#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  buildNewestRecordingTrace,
  renderNewestRecordingTraceMarkdown,
} = require('../src/lib/bna/newest-drive-recording-trace');
const {
  redactSensitiveText,
  redactedRef,
  sha256,
} = require('../src/lib/bna/class-drive-intake-reconcile');

const REPO_ROOT = path.resolve(__dirname, '..');
const MAIN_REPO = path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'BNA v2.0');
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, 'ops', 'class-drive-intake', '2026-06-25-issue-24-newest-recording');

function parseArgs(argv) {
  const args = {
    envFiles: [],
    outDir: DEFAULT_OUT_DIR,
    skipDrive: false,
    drivePageSize: 50,
    jobLimit: 500,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--out-dir') args.outDir = path.resolve(argv[++i]);
    else if (item.startsWith('--out-dir=')) args.outDir = path.resolve(item.slice('--out-dir='.length));
    else if (item === '--env-file') args.envFiles.push(path.resolve(argv[++i]));
    else if (item.startsWith('--env-file=')) args.envFiles.push(path.resolve(item.slice('--env-file='.length)));
    else if (item === '--skip-drive') args.skipDrive = true;
    else if (item === '--drive-page-size') args.drivePageSize = Number(argv[++i] || 50) || 50;
    else if (item.startsWith('--drive-page-size=')) args.drivePageSize = Number(item.slice('--drive-page-size='.length) || 50) || 50;
    else if (item === '--job-limit') args.jobLimit = Number(argv[++i] || 500) || 500;
    else if (item.startsWith('--job-limit=')) args.jobLimit = Number(item.slice('--job-limit='.length) || 500) || 500;
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
  for (const root of [...new Set(secretRoots())]) {
    if (!fs.existsSync(root)) continue;
    for (const name of [
      'railway-database-url.txt',
      'railway-google-env.txt',
      'railway-google-env-pending.txt',
      'google-oauth-client.json',
      'google-refresh-token.txt',
      'google-drive-pipeline.json',
    ]) {
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
          error: redactSensitiveText(error.message),
        });
      }
    }
  }
  return loaded;
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
  const googleAuth = detectGoogleAuthPath();
  const folders = driveStageFolders();
  return {
    generated_at: new Date().toISOString(),
    no_production_mutation: true,
    database: {
      status: dbReady ? 'ready' : 'blocked',
      connection_ref: process.env.DATABASE_URL ? redactedRef(process.env.DATABASE_URL, 'database_url') : null,
      blocker: dbReady ? '' : 'No DATABASE_URL/PGHOST was configured for read-only DB inspection.',
    },
    canonical_google_auth: googleAuth,
    drive_stage_folders: folders,
    drive_readback: driveReadback,
    loaded_env_files: envLoadResults.map((item) => ({
      loaded: item.loaded,
      path_hash: item.path ? sha256(path.resolve(item.path)).slice(0, 16) : null,
    })),
    loaded_secret_files: loadedSecretFiles,
  };
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
  if (args.skipDrive) return { skipped: true, reason: 'skip-drive supplied', files: [] };
  const folders = auth.drive_stage_folders?.folders || [];
  if (!folders.length) return { skipped: true, reason: 'no configured Drive stage folders', files: [] };
  const { authClient, blocker } = await buildGoogleAuth(auth.canonical_google_auth || {});
  if (!authClient) return { skipped: true, reason: blocker, files: [] };
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
        orderBy: 'modifiedTime desc',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      for (const file of result.data.files || []) files.push({ ...file, folder_label: folder.env_key, folder_ref: folder.ref });
    }
    return { skipped: false, reason: '', files };
  } catch (error) {
    return { skipped: true, reason: error.message, files: [] };
  }
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

async function loadDbSnapshot({ selectedDriveFileId = '', jobLimit = 500 } = {}) {
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
  try {
    snapshot.jobs = await queryIfTable(client, 'bna_content_jobs', `
      SELECT *
      FROM bna_content_jobs
      WHERE ($1::text <> '' AND drive_file_id = $1::text)
         OR drive_file_id IS NOT NULL
         OR source_type ILIKE ANY(ARRAY['%drive%','%recording%','%class%'])
         OR COALESCE(parse_json::text, '') ILIKE '%mixed_recording_parse%'
         OR COALESCE(parse_json::text, '') ILIKE '%class_notes%'
      ORDER BY
        CASE WHEN $1::text <> '' AND drive_file_id = $1::text THEN 0 ELSE 1 END,
        COALESCE(updated_at, created_at) DESC NULLS LAST,
        id DESC
      LIMIT $2
    `, [selectedDriveFileId || '', jobLimit]);

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
    const rawStableIds = snapshot.intakeParseRuns.map((run) => {
      try {
        return JSON.parse(JSON.stringify(run.metadata || {})).raw_intake_stable_id;
      } catch (_error) {
        return null;
      }
    }).filter(Boolean);
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
    snapshot.blockers.push(redactSensitiveText(error.message));
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

function authStatusForTrace(auth) {
  return {
    database: auth.database?.status || 'unknown',
    google_drive: auth.canonical_google_auth?.status || 'unknown',
    configured_drive_folders: auth.drive_stage_folders?.configured_count || 0,
    loaded_secret_file_count: auth.loaded_secret_files?.length || 0,
  };
}

function writeEvidence(outDir, trace) {
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'NEWEST-RECORDING-TRACE.json');
  const mdPath = path.join(outDir, 'NEWEST-RECORDING-TRACE.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(trace, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderNewestRecordingTraceMarkdown(trace));
  return { jsonPath, mdPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const envLoadResults = loadEnvironment(args);
  const loadedSecretFiles = loadSecretFiles();
  let auth = authReadiness(envLoadResults, loadedSecretFiles);
  const driveReadback = await readDriveMetadata(args, auth);
  auth = authReadiness(envLoadResults, loadedSecretFiles, driveReadback);
  const newestDriveFileId = driveReadback.files?.length
    ? driveReadback.files
      .slice()
      .sort((a, b) => new Date(b.modifiedTime || b.createdTime || 0) - new Date(a.modifiedTime || a.createdTime || 0))[0]?.id || ''
    : '';
  const snapshot = await loadDbSnapshot({
    selectedDriveFileId: newestDriveFileId,
    jobLimit: args.jobLimit,
  });
  const trace = buildNewestRecordingTrace({
    generatedAt: new Date().toISOString(),
    driveFiles: driveReadback.files || [],
    snapshot,
    dbBlockers: snapshot.blockers,
    driveReadback,
    authStatus: authStatusForTrace(auth),
  });
  const evidence = writeEvidence(args.outDir, trace);
  process.stdout.write(`${JSON.stringify({
    status: trace.verdict.status,
    no_production_mutation: trace.no_production_mutation,
    selected_job: trace.selection.selected_job?.job_ref || null,
    selected_drive_file: trace.selection.selected_file?.id_ref?.redacted || null,
    blocker: trace.verdict.blocker || null,
    evidence,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${redactSensitiveText(error.stack || error.message)}\n`);
  process.exitCode = 1;
});
