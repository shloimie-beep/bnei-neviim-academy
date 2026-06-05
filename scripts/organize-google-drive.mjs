import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const secretsDir = path.join(repoRoot, '.secrets');
const clientPath = path.join(secretsDir, 'google-oauth-client.json');
const tokenPath = path.join(secretsDir, 'google-refresh-token.txt');
const pipelinePath = path.join(secretsDir, 'google-drive-pipeline.json');
const railwayGoogleEnvPath = path.join(secretsDir, 'railway-google-env.txt');
const backupDir = path.join(repoRoot, '.runtime', 'drive-config-backups');

const SIMPLIFIED_NAMES = {
  websiteMomentsIntake: '00 Upload Here - Website Images',
  raw: '00 Upload Here - Raw Media Intake',
  processing: '10 Processing - Temporary',
  processed: '20 Processed Recordings - Source Media',
  approved: '30 Approved Website Assets',
  failed: '90 Failed - Needs Review',
  legacy: '_Archive - Legacy Pipeline Folders',
  brandMirror: 'GitHub Canonical - Drive Brand Mirror (Deprecated)',
};

const LEGACY_STAGE_KEYS = [
  '03 Transcribed',
  '05 WhatsApp Ready',
  '06 Newsletter Candidates',
  '07 Social Candidates',
  '08 Blog Candidates',
  '09 Brand Kit Suggestions',
  '11 Published',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadClient() {
  const parsed = readJson(clientPath);
  const client = parsed.web || parsed.installed;
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

async function getFile(drive, fileId) {
  if (!fileId) return null;
  const result = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'id,name,mimeType,parents,webViewLink',
  });
  return result.data;
}

async function listChildren(drive, folderId) {
  if (!folderId) return [];
  const children = [];
  let pageToken;
  do {
    const result = await drive.files.list({
      q: [`'${driveLiteral(folderId)}' in parents`, 'trashed=false'].join(' and '),
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'nextPageToken,files(id,name,mimeType,parents,webViewLink)',
      pageToken,
      pageSize: 100,
    });
    children.push(...(result.data.files || []));
    pageToken = result.data.nextPageToken;
  } while (pageToken);
  return children;
}

async function ensureFolder(drive, name, parentId) {
  const result = await drive.files.list({
    q: [
      `name='${driveLiteral(name)}'`,
      "mimeType='application/vnd.google-apps.folder'",
      `'${driveLiteral(parentId)}' in parents`,
      'trashed=false',
    ].join(' and '),
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id,name,mimeType,parents,webViewLink)',
    pageSize: 1,
  });
  if (result.data.files?.[0]) return result.data.files[0];

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    supportsAllDrives: true,
    fields: 'id,name,mimeType,parents,webViewLink',
  });
  return created.data;
}

async function renameFile(drive, fileId, name, logLines) {
  const current = await getFile(drive, fileId);
  if (!current || current.name === name) return current;
  const updated = await drive.files.update({
    fileId,
    supportsAllDrives: true,
    requestBody: { name },
    fields: 'id,name,mimeType,parents,webViewLink',
  });
  logLines.push(`Renamed ${current.name} -> ${name}`);
  return updated.data;
}

async function moveFileToFolder(drive, file, targetFolderId, logLines, targetName = 'target') {
  if (!file?.id || !targetFolderId) return null;
  const parents = Array.isArray(file.parents) ? file.parents : [];
  if (parents.includes(targetFolderId) && parents.length === 1) return file;

  const updated = await drive.files.update({
    fileId: file.id,
    addParents: targetFolderId,
    removeParents: parents.join(',') || undefined,
    supportsAllDrives: true,
    fields: 'id,name,mimeType,parents,webViewLink',
  });
  logLines.push(`Moved ${file.name} -> ${targetName}`);
  return updated.data;
}

function backupConfig() {
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (fs.existsSync(pipelinePath)) {
    fs.copyFileSync(pipelinePath, path.join(backupDir, `${stamp}-google-drive-pipeline.json`));
  }
  if (fs.existsSync(railwayGoogleEnvPath)) {
    fs.copyFileSync(railwayGoogleEnvPath, path.join(backupDir, `${stamp}-railway-google-env.txt`));
  }
}

function writeRailwayGoogleEnv(config) {
  if (!fs.existsSync(railwayGoogleEnvPath)) return;
  const lines = fs.readFileSync(railwayGoogleEnvPath, 'utf8').split(/\r?\n/);
  const next = lines.map((line) => {
    if (line.startsWith('GOOGLE_DRIVE_PIPELINE_CONFIG=')) {
      return `GOOGLE_DRIVE_PIPELINE_CONFIG=${JSON.stringify(config)}`;
    }
    return line;
  });
  fs.writeFileSync(railwayGoogleEnvPath, next.join('\n').replace(/\n*$/, '\n'));
}

async function main() {
  if (!fs.existsSync(pipelinePath)) {
    throw new Error(`Missing ${pipelinePath}`);
  }

  const dryRun = process.argv.includes('--dry-run');
  const pipeline = readJson(pipelinePath);
  const auth = authWithRefreshToken();
  const drive = google.drive({ version: 'v3', auth });
  const logLines = [];

  const rootId = pipeline.root;
  if (!rootId) throw new Error('Pipeline config is missing root.');
  const root = await getFile(drive, rootId);
  if (!root) throw new Error(`Could not read Drive root ${rootId}`);

  const rawId = pipeline.stages?.['01 Raw Intake'];
  const processingId = pipeline.stages?.['02 Ingesting'];
  const processedId = pipeline.stages?.['04 Parsed'];
  const approvedId = pipeline.stages?.['10 Approved'];
  const failedId = pipeline.stages?.['99 Failed'];
  if (!rawId || !processingId || !processedId || !approvedId || !failedId) {
    throw new Error('Pipeline config is missing one of the required core stage IDs.');
  }

  if (dryRun) {
    console.log('Dry run only. No Drive files or config will be changed.');
    console.log(JSON.stringify({
      root: root.name,
      simplifiedNames: SIMPLIFIED_NAMES,
      coreIds: { rawId, processingId, processedId, approvedId, failedId },
      legacyStageKeys: LEGACY_STAGE_KEYS,
    }, null, 2));
    return;
  }

  backupConfig();

  if (pipeline.websiteMomentsIntake) {
    await renameFile(drive, pipeline.websiteMomentsIntake, SIMPLIFIED_NAMES.websiteMomentsIntake, logLines);
  }
  await renameFile(drive, rawId, SIMPLIFIED_NAMES.raw, logLines);
  await renameFile(drive, processingId, SIMPLIFIED_NAMES.processing, logLines);
  await renameFile(drive, processedId, SIMPLIFIED_NAMES.processed, logLines);
  await renameFile(drive, approvedId, SIMPLIFIED_NAMES.approved, logLines);
  await renameFile(drive, failedId, SIMPLIFIED_NAMES.failed, logLines);

  const legacyFolder = await ensureFolder(drive, SIMPLIFIED_NAMES.legacy, rootId);

  for (const stageKey of LEGACY_STAGE_KEYS) {
    const folderId = pipeline.stages?.[stageKey];
    if (!folderId || [processedId, approvedId, failedId, rawId, processingId].includes(folderId)) continue;
    const folder = await getFile(drive, folderId).catch(() => null);
    if (!folder) continue;
    const children = await listChildren(drive, folderId);
    const targetId = stageKey === '11 Published' ? approvedId : processedId;
    const targetName = stageKey === '11 Published' ? SIMPLIFIED_NAMES.approved : SIMPLIFIED_NAMES.processed;
    for (const child of children) {
      if (child.mimeType === 'application/vnd.google-apps.folder') continue;
      await moveFileToFolder(drive, child, targetId, logLines, targetName);
    }
    await moveFileToFolder(drive, folder, legacyFolder.id, logLines, SIMPLIFIED_NAMES.legacy);
  }

  if (pipeline.brandKit) {
    const brandFolder = await renameFile(drive, pipeline.brandKit, SIMPLIFIED_NAMES.brandMirror, logLines).catch(() => null);
    if (brandFolder) {
      await moveFileToFolder(drive, brandFolder, legacyFolder.id, logLines, SIMPLIFIED_NAMES.legacy);
    }
  }

  const nextConfig = {
    ...pipeline,
    sourceOfTruth: {
      transcripts: 'GitHub content-memory/transcripts plus live app database',
      brandKit: 'GitHub brand-kit/',
      platformMemory: 'GitHub content-memory/',
      driveRole: 'operator upload/source-media library only',
      updatedAt: new Date().toISOString(),
    },
    simplifiedFolders: {
      rawIntake: rawId,
      websiteImages: pipeline.websiteMomentsIntake || null,
      processing: processingId,
      processedRecordings: processedId,
      approvedAssets: approvedId,
      failedNeedsReview: failedId,
      legacyArchive: legacyFolder.id,
    },
    stages: {
      ...pipeline.stages,
      '01 Raw Intake': rawId,
      '02 Ingesting': processingId,
      '03 Transcribed': processedId,
      '04 Parsed': processedId,
      '05 WhatsApp Ready': processedId,
      '06 Newsletter Candidates': processedId,
      '07 Social Candidates': processedId,
      '08 Blog Candidates': processedId,
      '09 Brand Kit Suggestions': legacyFolder.id,
      '10 Approved': approvedId,
      '11 Published': approvedId,
      '99 Failed': failedId,
    },
  };

  fs.writeFileSync(pipelinePath, `${JSON.stringify(nextConfig, null, 2)}\n`);
  writeRailwayGoogleEnv(nextConfig);

  console.log([
    `Organized Drive root: ${root.name}`,
    `Legacy archive: ${legacyFolder.name} (${legacyFolder.id})`,
    '',
    ...logLines,
    '',
    `Updated ${path.relative(repoRoot, pipelinePath)}`,
    fs.existsSync(railwayGoogleEnvPath) ? `Updated ${path.relative(repoRoot, railwayGoogleEnvPath)}` : '',
  ].filter(Boolean).join('\n'));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
