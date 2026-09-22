#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  DEFAULT_END_DATE,
  DEFAULT_OUT_DIR,
  DEFAULT_START_DATE,
  buildTwoWeekClassIntakeAudit,
  writeAuditArtifacts,
} = require('../src/lib/bna/two-week-class-intake-audit');

const {
  redactSensitiveText,
  redactedRef,
  sha256,
} = require('../src/lib/bna/class-drive-intake-reconcile');

const REPO_ROOT = path.resolve(__dirname, '..');
const MAIN_REPO = path.join(process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\User', 'BNA v2.0');

function parseArgs(argv) {
  const args = {
    startDate: DEFAULT_START_DATE,
    endDate: DEFAULT_END_DATE,
    outDir: path.join(REPO_ROOT, DEFAULT_OUT_DIR),
    envFiles: [],
    skipDrive: false,
    skipDb: false,
    includePrivateText: false,
    jobIds: [],
    minJobId: null,
    maxJobId: null,
    jobLimit: 700,
    drivePageSize: 100,
    requireNoWrite: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--start-date') args.startDate = argv[++i];
    else if (item.startsWith('--start-date=')) args.startDate = item.slice('--start-date='.length);
    else if (item === '--end-date') args.endDate = argv[++i];
    else if (item.startsWith('--end-date=')) args.endDate = item.slice('--end-date='.length);
    else if (item === '--out-dir') args.outDir = path.resolve(argv[++i]);
    else if (item.startsWith('--out-dir=')) args.outDir = path.resolve(item.slice('--out-dir='.length));
    else if (item === '--env-file') args.envFiles.push(path.resolve(argv[++i]));
    else if (item.startsWith('--env-file=')) args.envFiles.push(path.resolve(item.slice('--env-file='.length)));
    else if (item === '--skip-drive') args.skipDrive = true;
    else if (item === '--skip-db') args.skipDb = true;
    else if (item === '--include-private-text') args.includePrivateText = true;
    else if (item === '--job-id') args.jobIds.push(Number(argv[++i]));
    else if (item.startsWith('--job-id=')) args.jobIds.push(Number(item.slice('--job-id='.length)));
    else if (item === '--min-job-id') args.minJobId = Number(argv[++i]);
    else if (item.startsWith('--min-job-id=')) args.minJobId = Number(item.slice('--min-job-id='.length));
    else if (item === '--max-job-id') args.maxJobId = Number(argv[++i]);
    else if (item.startsWith('--max-job-id=')) args.maxJobId = Number(item.slice('--max-job-id='.length));
    else if (item === '--job-limit') args.jobLimit = Number(argv[++i]) || args.jobLimit;
    else if (item.startsWith('--job-limit=')) args.jobLimit = Number(item.slice('--job-limit='.length)) || args.jobLimit;
    else if (item === '--drive-page-size') args.drivePageSize = Number(argv[++i]) || args.drivePageSize;
    else if (item.startsWith('--drive-page-size=')) args.drivePageSize = Number(item.slice('--drive-page-size='.length)) || args.drivePageSize;
    else if (item === '--allow-write') args.requireNoWrite = false;
    else if (/^\d+$/.test(item)) args.jobIds.push(Number(item));
    else throw new Error(`Unknown argument: ${item}`);
  }

  if (process.env.BNA_ENV_FILE) args.envFiles.unshift(path.resolve(process.env.BNA_ENV_FILE));
  return args;
}

function parseEnvText(text) {
  const out = {};
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (key) out[key] = value;
  }
  return out;
}

function loadEnvFile(filePath, { override = false } = {}) {
  if (!filePath || !fs.existsSync(filePath)) return { loaded: false, path: filePath || '' };
  const parsed = parseEnvText(fs.readFileSync(filePath, 'utf8'));
  const loadedKeys = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined || override) {
      process.env[key] = value;
      loadedKeys.push(key);
    }
  }
  return { loaded: true, path: filePath, loaded_key_count: loadedKeys.length };
}

function loadJsonSecret(text, { override = true } = {}) {
  const data = JSON.parse(text);
  const envLike = data.env || data.environment || data;
  const loaded = [];
  function set(key, value) {
    const normalized = String(value || '').trim();
    if (!normalized) return;
    if (process.env[key] !== undefined && !override) return;
    process.env[key] = normalized;
    loaded.push(key);
  }

  const candidates = [envLike, envLike.web, envLike.installed, envLike.oauth, envLike.google_oauth].filter(Boolean);
  for (const source of candidates) {
    set('GOOGLE_CLIENT_ID', source.client_id || source.clientId);
    set('GOOGLE_CLIENT_SECRET', source.client_secret || source.clientSecret);
    set('GOOGLE_REFRESH_TOKEN', source.refresh_token || source.refreshToken);
    set('GOOGLE_SERVICE_ACCOUNT_EMAIL', source.client_email || source.clientEmail);
    set('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', source.private_key || source.privateKey);
    for (const [key, value] of Object.entries(source)) {
      if (/^[A-Z0-9_]+$/.test(key)) set(key, value);
    }
  }

  if (envLike.root) set('BNA_DRIVE_ROOT_FOLDER_ID', envLike.root);
  if (envLike.websiteMomentsIntake) set('BNA_DRIVE_WEBSITE_MOMENTS_INTAKE_FOLDER_ID', envLike.websiteMomentsIntake);
  if (envLike.stages && typeof envLike.stages === 'object') {
    let index = 0;
    for (const [label, folderId] of Object.entries(envLike.stages)) {
      index += 1;
      const suffix = String(label || `stage_${index}`).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
      set(`BNA_DRIVE_STAGE_${suffix || index}_FOLDER_ID`, folderId);
    }
  }
  if (envLike.simplifiedFolders && typeof envLike.simplifiedFolders === 'object') {
    for (const [label, folderId] of Object.entries(envLike.simplifiedFolders)) {
      const suffix = String(label || '').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
      set(`BNA_DRIVE_SIMPLIFIED_${suffix}_FOLDER_ID`, folderId);
    }
  }

  return [...new Set(loaded)];
}

function secretRoots() {
  return [
    process.env.BNA_SECRET_ROOT,
    path.join(REPO_ROOT, '.secrets'),
    path.join(MAIN_REPO, '.secrets'),
    path.join(process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\User', 'BNA-Keyholder'),
  ].filter(Boolean).map((item) => path.resolve(item));
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
          process.env.DATABASE_URL = text.trim();
          keys = ['DATABASE_URL'];
        } else if (name === 'google-refresh-token.txt') {
          process.env.GOOGLE_REFRESH_TOKEN = text.trim();
          keys = ['GOOGLE_REFRESH_TOKEN'];
        } else if (name.endsWith('.json')) {
          keys = loadJsonSecret(text, { override: true });
        } else {
          const parsed = parseEnvText(text);
          for (const [key, value] of Object.entries(parsed)) process.env[key] = value;
          keys = Object.keys(parsed);
        }
        loaded.push({ file: name, path_hash: sha256(filePath).slice(0, 16), loaded_keys: [...new Set(keys)].sort() });
      } catch (error) {
        loaded.push({ file: name, path_hash: sha256(filePath).slice(0, 16), error: redactSensitiveText(error.message) });
      }
    }
  }
  return loaded;
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
  const loadedEnvFiles = candidates
    .filter(Boolean)
    .map((file) => path.resolve(file))
    .filter((file) => {
      if (seen.has(file)) return false;
      seen.add(file);
      return true;
    })
    .map((file) => loadEnvFile(file, { override: false }));

  const loadedSecretFiles = loadSecretFiles();
  return { loadedEnvFiles, loadedSecretFiles };
}

function assertNoWriteMode(args) {
  const forbidden = [
    'APPLY_GUARDED_CLASS_BACKFILL',
    'BNA_APPLY_CLASS_BACKFILL',
    'BNA_ALLOW_PRODUCTION_WRITES',
  ].filter((key) => String(process.env[key] || '').trim());
  if (args.requireNoWrite && forbidden.length) {
    throw new Error(`Refusing to run audit while write/apply env flags are set: ${forbidden.join(', ')}`);
  }
}

async function getPgClient() {
  if (!process.env.DATABASE_URL && !process.env.PGHOST) return null;
  let pg;
  try {
    pg = require('pg');
  } catch (error) {
    throw new Error('The pg package is required for database readback. Run npm install if dependencies are missing.');
  }
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL || undefined,
    ssl: process.env.DATABASE_URL && /sslmode=require|railway|render|supabase/i.test(process.env.DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  return client;
}

async function tableExists(client, tableName) {
  const result = await client.query(
    'select to_regclass($1) as table_name',
    [tableName.includes('.') ? tableName : `public.${tableName}`]
  );
  return Boolean(result.rows[0]?.table_name);
}

async function readFirstExistingTable(client, candidates, { orderBy = 'id desc', limit = 700 } = {}) {
  for (const table of candidates) {
    if (!(await tableExists(client, table))) continue;
    const safeOrder = /^[a-zA-Z0-9_,.\s]+(desc|asc)?$/i.test(orderBy) ? orderBy : 'id desc';
    const result = await client.query(`select * from ${table} order by ${safeOrder} limit $1`, [limit]);
    return { table, rows: result.rows };
  }
  return { table: null, rows: [] };
}

async function readSnapshotFromDb(args) {
  if (args.skipDb) return { snapshot: { jobs: [] }, dbReadback: { skipped: true, reason: 'skip-db requested' } };
  const client = await getPgClient();
  if (!client) return { snapshot: { jobs: [] }, dbReadback: { skipped: true, reason: 'No DATABASE_URL/PGHOST detected' } };

  const snapshot = {};
  const readback = { skipped: false, tables: {}, errors: [] };
  try {
    await client.query('begin read only');

    const tableMap = {
      jobs: [['bna_content_jobs', 'content_jobs'], { orderBy: 'id desc', limit: args.jobLimit }],
      classSessions: [['bna_class_sessions', 'class_sessions'], { orderBy: 'id desc', limit: args.jobLimit }],
      groupGoalEntries: [['bna_group_goal_entries', 'group_goal_entries'], { orderBy: 'id desc', limit: args.jobLimit * 3 }],
      torahEntries: [['bna_torah_learning_entries', 'torah_learning_entries'], { orderBy: 'id desc', limit: args.jobLimit * 5 }],
      accountabilityEvents: [['bna_accountability_events', 'accountability_events'], { orderBy: 'id desc', limit: args.jobLimit * 5 }],
      contentOutputs: [['bna_content_outputs', 'content_outputs'], { orderBy: 'id desc', limit: args.jobLimit * 3 }],
      intakeParseRuns: [['bna_intake_parse_runs', 'intake_parse_runs'], { orderBy: 'id desc', limit: args.jobLimit * 3 }],
      rawIntake: [['bna_raw_intake', 'raw_intake'], { orderBy: 'id desc', limit: args.jobLimit * 3 }],
      students: [['bna_students', 'students'], { orderBy: 'id asc', limit: 1000 }],
    };

    for (const [key, [candidates, options]] of Object.entries(tableMap)) {
      try {
        const result = await readFirstExistingTable(client, candidates, options);
        snapshot[key] = result.rows;
        readback.tables[key] = { table: result.table, rows: result.rows.length };
      } catch (error) {
        snapshot[key] = [];
        readback.errors.push(`${key}: ${redactSensitiveText(error.message)}`);
      }
    }

    await client.query('rollback');
    return { snapshot, dbReadback: readback };
  } catch (error) {
    try { await client.query('rollback'); } catch (_rollbackError) {}
    throw error;
  } finally {
    await client.end();
  }
}

function getGoogleAuth() {
  let google;
  try {
    google = require('googleapis').google;
  } catch (error) {
    throw new Error('The googleapis package is required for Drive readback. Run npm install if dependencies are missing.');
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return { google, auth: new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/drive.readonly'] }) };
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return { google, auth };
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || undefined
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return { google, auth };
  }

  throw new Error('No Google Drive read-only auth path detected.');
}

function configuredDriveFolders() {
  const labels = [
    ['raw_intake', 'BNA_DRIVE_SIMPLIFIED_RAW_INTAKE_FOLDER_ID'],
    ['processing_temporary', 'BNA_DRIVE_SIMPLIFIED_PROCESSING_FOLDER_ID'],
    ['processed_recordings', 'BNA_DRIVE_SIMPLIFIED_PROCESSED_RECORDINGS_FOLDER_ID'],
    ['raw_stage', 'BNA_DRIVE_STAGE_01_RAW_INTAKE_FOLDER_ID'],
    ['ingesting_stage', 'BNA_DRIVE_STAGE_02_INGESTING_FOLDER_ID'],
    ['transcribed_stage', 'BNA_DRIVE_STAGE_03_TRANSCRIBED_FOLDER_ID'],
    ['parsed_stage', 'BNA_DRIVE_STAGE_04_PARSED_FOLDER_ID'],
    ['whatsapp_ready_stage', 'BNA_DRIVE_STAGE_05_WHATSAPP_READY_FOLDER_ID'],
    ['newsletter_candidates_stage', 'BNA_DRIVE_STAGE_06_NEWSLETTER_CANDIDATES_FOLDER_ID'],
    ['class_recordings', 'BNA_CLASS_RECORDINGS_FOLDER_ID'],
    ['class_drive', 'BNA_CLASS_DRIVE_FOLDER_ID'],
    ['google_class_intake', 'GOOGLE_DRIVE_CLASS_INTAKE_FOLDER_ID'],
    ['one_time_class_recordings', 'ONE_TIME_CLASS_RECORDINGS_FOLDER_ID'],
  ];

  const folders = [];
  const seen = new Set();
  for (const [label, key] of labels) {
    const id = String(process.env[key] || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    folders.push({ label, key, id });
  }

  for (const key of Object.keys(process.env).filter((item) => /^BNA_DRIVE_(STAGE|SIMPLIFIED)_.+_FOLDER_ID$/.test(item)).sort()) {
    const id = String(process.env[key] || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    folders.push({ label: key.toLowerCase().replace(/_folder_id$/, ''), key, id });
  }

  return folders;
}

function driveLiteral(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function listDriveFilesInFolder(drive, folder, args) {
  const files = [];
  let pageToken;
  for (let page = 0; page < 5; page += 1) {
    const result = await drive.files.list({
      q: [
        `'${driveLiteral(folder.id)}' in parents`,
        'trashed=false',
      ].join(' and '),
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'modifiedTime desc',
      pageSize: args.drivePageSize,
      pageToken,
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents)',
    });
    for (const file of result.data.files || []) {
      files.push({
        ...file,
        folder_label: folder.label,
        folder_key: folder.key,
        folder_ref: redactedRef(folder.id, 'drive_folder'),
      });
    }
    pageToken = result.data.nextPageToken;
    if (!pageToken) break;
  }
  return files;
}

async function readDriveFiles(args) {
  if (args.skipDrive) return { driveFiles: [], driveReadback: { skipped: true, reason: 'skip-drive requested' } };
  const folders = configuredDriveFolders();
  if (!folders.length) {
    return { driveFiles: [], driveReadback: { skipped: true, reason: 'No configured Drive folder env vars detected.' } };
  }
  try {
    const { google, auth } = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    const all = [];
    const errors = [];
    for (const folder of folders) {
      try {
        all.push(...await listDriveFilesInFolder(drive, folder, args));
      } catch (error) {
        errors.push(`${folder.label}: ${redactSensitiveText(error.message)}`);
      }
    }
    const byId = new Map();
    for (const file of all) if (file.id && !byId.has(file.id)) byId.set(file.id, file);
    return {
      driveFiles: [...byId.values()],
      driveReadback: {
        skipped: false,
        configured_folders: folders.map((folder) => ({ label: folder.label, ref: redactedRef(folder.id, 'drive_folder').redacted })),
        files_seen: byId.size,
        errors,
      },
    };
  } catch (error) {
    return { driveFiles: [], driveReadback: { skipped: true, reason: redactSensitiveText(error.message), configured_folders: folders.length } };
  }
}

function writeRunNote(outDir, meta) {
  const lines = [
    '# Two-Week Class Intake Audit Run Note',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Inputs',
    '',
    `- Start date: ${meta.args.startDate}`,
    `- End date: ${meta.args.endDate}`,
    `- Include private text: ${meta.args.includePrivateText ? 'yes - do not commit private output unless approved' : 'no'}`,
    `- DB readback: ${meta.dbReadback.skipped ? `skipped - ${meta.dbReadback.reason}` : 'attempted read-only'}`,
    `- Drive readback: ${meta.driveReadback.skipped ? `skipped - ${meta.driveReadback.reason}` : 'attempted read-only'}`,
    '',
    '## Environment Files',
    '',
    ...meta.env.loadedEnvFiles.map((item) => `- ${item.loaded ? 'loaded' : 'not found'} path_hash=${item.path ? sha256(path.resolve(item.path)).slice(0, 16) : 'none'} keys=${item.loaded_key_count || 0}`),
    '',
    '## Secret Files',
    '',
    ...meta.env.loadedSecretFiles.map((item) => `- ${item.file}: ${item.error ? `error ${item.error}` : `loaded ${item.loaded_keys?.length || 0} key(s)`}`),
    '',
    '## No-Write Guardrail',
    '',
    '- This script opens the database transaction as `BEGIN READ ONLY` and rolls back.',
    '- This script uses Google Drive read-only scopes.',
    '- This script does not move Drive files, mutate DB rows, send messages, retranscribe files, or apply backfill.',
    '',
  ];
  fs.writeFileSync(path.join(outDir, 'RUN-NOTE.md'), `${lines.join('\n')}\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  assertNoWriteMode(args);
  const env = loadEnvironment(args);
  const { snapshot, dbReadback } = await readSnapshotFromDb(args);
  const { driveFiles, driveReadback } = await readDriveFiles(args);

  const audit = buildTwoWeekClassIntakeAudit({
    startDate: args.startDate,
    endDate: args.endDate,
    snapshot,
    driveFiles,
    repoRoot: REPO_ROOT,
    jobIds: args.jobIds,
    minJobId: args.minJobId,
    maxJobId: args.maxJobId,
    includePrivateText: args.includePrivateText,
  });

  fs.mkdirSync(args.outDir, { recursive: true });
  const written = writeAuditArtifacts(audit, args.outDir);
  writeRunNote(args.outDir, { args, env, dbReadback, driveReadback });

  console.log([
    'Two-week class intake audit complete.',
    `Date range: ${args.startDate} through ${args.endDate}`,
    `Output: ${args.outDir}`,
    `Drive recordings in range: ${audit.scope_counts.drive_recordings_in_range}`,
    `Content jobs in range: ${audit.scope_counts.content_jobs_in_range}`,
    `Student question rows: ${audit.scope_counts.student_question_rows}`,
    `Final status: ${audit.final_verdict.status}`,
    `Files written: ${written.length + 1}`,
  ].join('\n'));
}

main().catch((error) => {
  console.error(redactSensitiveText(error.stack || error.message || String(error)));
  process.exitCode = 1;
});
