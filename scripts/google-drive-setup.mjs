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
const railwayEnvPath = path.join(secretsDir, 'railway-google-env.txt');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
];

const ROOT_NAME = process.env.GOOGLE_DRIVE_PIPELINE_ROOT_NAME || 'BNA V2';

const MEMORY_DOC_MAPPINGS = [
  { group: 'brandDocs', docName: '01 Core Beliefs', filePath: 'brand-kit/01-core-beliefs.md' },
  { group: 'brandDocs', docName: '02 Teaching Voice', filePath: 'brand-kit/02-teaching-voice.md' },
  { group: 'brandDocs', docName: '03 Parent Messaging', filePath: 'brand-kit/03-parent-messaging.md' },
  { group: 'brandDocs', docName: '04 Student Growth Principles', filePath: 'brand-kit/04-student-growth-principles.md' },
  { group: 'brandDocs', docName: '05 Phrases To Use', filePath: 'brand-kit/05-phrases-to-use.md' },
  { group: 'brandDocs', docName: '06 Phrases To Avoid', filePath: 'brand-kit/06-phrases-to-avoid.md' },
  { group: 'brandDocs', docName: '07 Brand Kit Suggestions Inbox', filePath: 'brand-kit/07-brand-kit-suggestions.md' },
  { group: 'platformDocs', docName: 'WhatsApp Prompt', filePath: 'content-memory/platform-prompts/whatsapp.md' },
  { group: 'platformDocs', docName: 'WhatsApp Approved Examples', filePath: 'content-memory/whatsapp/examples.md' },
  { group: 'platformDocs', docName: 'Facebook Prompt', filePath: 'content-memory/platform-prompts/facebook.md' },
  { group: 'platformDocs', docName: 'Facebook Approved Examples', filePath: 'content-memory/facebook/examples.md' },
];

function loadClient() {
  const parsed = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
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

function oauthClient() {
  const client = loadClient();
  return new google.auth.OAuth2(client.clientId, client.clientSecret, client.redirectUri);
}

function loadRefreshToken() {
  if (process.env.GOOGLE_REFRESH_TOKEN) return process.env.GOOGLE_REFRESH_TOKEN;
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, 'utf8').trim();
  throw new Error(
    `Google Drive is not authorized yet. Missing ${tokenPath}. Run "node scripts/google-drive-setup.mjs auth-url", open the URL, then run "node scripts/google-drive-setup.mjs exchange <code>".`
  );
}

function authWithRefreshToken() {
  const auth = oauthClient();
  auth.setCredentials({ refresh_token: loadRefreshToken() });
  return auth;
}

async function findFolder(drive, name, parentId = 'root') {
  const safeName = String(name).replace(/'/g, "\\'");
  const safeParent = String(parentId).replace(/'/g, "\\'");
  const result = await drive.files.list({
    q: [
      "mimeType='application/vnd.google-apps.folder'",
      'trashed=false',
      `name='${safeName}'`,
      `'${safeParent}' in parents`,
    ].join(' and '),
    fields: 'files(id,name,webViewLink)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return result.data.files?.[0] || null;
}

async function ensureFolder(drive, name, parentId = 'root') {
  const existing = await findFolder(drive, name, parentId);
  if (existing) return { ...existing, created: false };
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId === 'root' ? undefined : [parentId],
    },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true,
  });
  return { ...created.data, created: true };
}

async function ensureDoc(drive, name, parentId) {
  const safeName = String(name).replace(/'/g, "\\'");
  const safeParent = String(parentId).replace(/'/g, "\\'");
  const existing = await drive.files.list({
    q: [
      "mimeType='application/vnd.google-apps.document'",
      'trashed=false',
      `name='${safeName}'`,
      `'${safeParent}' in parents`,
    ].join(' and '),
    fields: 'files(id,name,webViewLink)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  if (existing.data.files?.[0]) return { ...existing.data.files[0], created: false };
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentId],
    },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true,
  });
  return { ...created.data, created: true };
}

async function ensurePipeline(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const root = await ensureFolder(drive, ROOT_NAME, 'root');
  const websiteMomentsIntake = await ensureFolder(drive, '00 Upload Here - Website Images', root.id);
  const rawIntake = await ensureFolder(drive, '00 Upload Here - Raw Media Intake', root.id);
  const processing = await ensureFolder(drive, '10 Processing - Temporary', root.id);
  const processed = await ensureFolder(drive, '20 Processed Recordings - Source Media', root.id);
  const approved = await ensureFolder(drive, '30 Approved Website Assets', root.id);
  const failed = await ensureFolder(drive, '90 Failed - Needs Review', root.id);
  const legacy = await ensureFolder(drive, '_Archive - Legacy Pipeline Folders', root.id);

  // Keep the historical stage keys so existing bridge/server code remains compatible,
  // but map redundant output stages to the simplified operator-facing folders.
  const stages = {
    '01 Raw Intake': rawIntake,
    '02 Ingesting': processing,
    '03 Transcribed': processed,
    '04 Parsed': processed,
    '05 WhatsApp Ready': processed,
    '06 Newsletter Candidates': processed,
    '07 Social Candidates': processed,
    '08 Blog Candidates': processed,
    '09 Brand Kit Suggestions': legacy,
    '10 Approved': approved,
    '11 Published': approved,
    '99 Failed': failed,
  };

  const brandKit = await ensureFolder(drive, 'GitHub Canonical - Drive Brand Mirror (Deprecated)', legacy.id);
  const brandDocs = {};
  for (const docName of [
    '01 Core Beliefs',
    '02 Teaching Voice',
    '03 Parent Messaging',
    '04 Student Growth Principles',
    '05 Phrases To Use',
    '06 Phrases To Avoid',
    '07 Brand Kit Suggestions Inbox',
  ]) {
    brandDocs[docName] = await ensureDoc(drive, docName, brandKit.id);
  }

  const platformMemory = await ensureFolder(drive, 'Platform Memory', brandKit.id);
  const platformDocs = {};
  for (const docName of [
    'WhatsApp Prompt',
    'WhatsApp Approved Examples',
    'Facebook Prompt',
    'Facebook Approved Examples',
    'YouTube Prompt',
    'Blog Prompt',
    'Newsletter Prompt',
  ]) {
    platformDocs[docName] = await ensureDoc(drive, docName, platformMemory.id);
  }

  return { root, websiteMomentsIntake, stages, brandKit, brandDocs, platformMemory, platformDocs, legacy };
}

function writeRailwayEnv(refreshToken, pipeline) {
  const client = loadClient();
  const config = {
    root: pipeline.root.id,
    websiteMomentsIntake: pipeline.websiteMomentsIntake.id,
    stages: Object.fromEntries(Object.entries(pipeline.stages).map(([name, folder]) => [name, folder.id])),
    sourceOfTruth: {
      transcripts: 'GitHub content-memory/transcripts plus live app database',
      brandKit: 'GitHub brand-kit/',
      platformMemory: 'GitHub content-memory/',
      driveRole: 'operator upload/source-media library only',
      updatedAt: new Date().toISOString(),
    },
    simplifiedFolders: {
      rawIntake: pipeline.stages['01 Raw Intake'].id,
      websiteImages: pipeline.websiteMomentsIntake.id,
      processing: pipeline.stages['02 Ingesting'].id,
      processedRecordings: pipeline.stages['04 Parsed'].id,
      approvedAssets: pipeline.stages['10 Approved'].id,
      failedNeedsReview: pipeline.stages['99 Failed'].id,
      legacyArchive: pipeline.legacy?.id || null,
    },
    brandKit: pipeline.brandKit.id,
    brandDocs: Object.fromEntries(Object.entries(pipeline.brandDocs).map(([name, doc]) => [name, doc.id])),
    platformMemory: pipeline.platformMemory.id,
    platformDocs: Object.fromEntries(Object.entries(pipeline.platformDocs).map(([name, doc]) => [name, doc.id])),
  };

  const lines = [
    `GOOGLE_CLIENT_ID=${client.clientId}`,
    `GOOGLE_CLIENT_SECRET=${client.clientSecret}`,
    `GOOGLE_REDIRECT_URI=${client.redirectUri}`,
    `GOOGLE_REFRESH_TOKEN=${refreshToken}`,
    `GOOGLE_DRIVE_PIPELINE_ROOT_NAME=${ROOT_NAME}`,
    `GOOGLE_DRIVE_PIPELINE_FOLDER_ID=${pipeline.root.id}`,
    `GOOGLE_DRIVE_PIPELINE_CONFIG=${JSON.stringify(config)}`,
    `GOOGLE_SCOPES=${SCOPES.join(' ')}`,
  ];
  fs.writeFileSync(railwayEnvPath, `${lines.join('\n')}\n`);
  fs.writeFileSync(pipelinePath, `${JSON.stringify(config, null, 2)}\n`);
}

async function exportDocText(drive, fileId) {
  const response = await drive.files.export(
    { fileId, mimeType: 'text/plain' },
    { responseType: 'text' }
  );
  return String(response.data || '').trim();
}

async function replaceDocText(docs, documentId, text) {
  const document = await docs.documents.get({ documentId });
  const endIndex = document.data.body?.content?.at(-1)?.endIndex || 1;
  const requests = [];
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: endIndex - 1,
        },
      },
    });
  }
  requests.push({
    insertText: {
      location: { index: 1 },
      text: `${text.trim()}\n`,
    },
  });
  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests },
  });
}

function readRepoText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8').trim() : '';
}

function writeRepoText(relativePath, text) {
  const absolutePath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  if (fs.existsSync(absolutePath)) {
    const backupDir = path.join(repoRoot, '.runtime', 'drive-sync-backups', new Date().toISOString().replace(/[:.]/g, '-'));
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(absolutePath, path.join(backupDir, relativePath.replace(/[\\/]/g, '__')));
  }
  fs.writeFileSync(absolutePath, `${text.trim()}\n`);
}

async function syncMemoryDocs(auth, mode = 'auto') {
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });
  const pipeline = await ensurePipeline(auth);
  const results = [];

  for (const mapping of MEMORY_DOC_MAPPINGS) {
    const file = pipeline[mapping.group]?.[mapping.docName];
    if (!file?.id) {
      results.push({ ...mapping, action: 'missing-doc' });
      continue;
    }

    const repoText = readRepoText(mapping.filePath);
    const driveText = await exportDocText(drive, file.id);
    const driveLooksEmpty = driveText.length < 20;
    let action = 'unchanged';

    if (mode === 'push' || (mode === 'auto' && repoText && (driveLooksEmpty || driveText !== repoText))) {
      await replaceDocText(docs, file.id, repoText);
      action = 'pushed-repo-to-drive';
    } else if (mode === 'pull' || (mode === 'auto' && !repoText && driveText)) {
      writeRepoText(mapping.filePath, driveText);
      action = 'pulled-drive-to-repo';
    }

    results.push({
      ...mapping,
      action,
      driveChars: driveText.length,
      repoChars: repoText.length,
      url: file.webViewLink,
    });
  }

  writeRailwayEnv(loadRefreshToken(), pipeline);
  return results;
}

async function main() {
  fs.mkdirSync(secretsDir, { recursive: true });
  const command = process.argv[2] || 'auth-url';
  const auth = oauthClient();

  if (command === 'auth-url') {
    const url = auth.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      include_granted_scopes: true,
    });
    console.log(url);
    return;
  }

  if (command === 'exchange') {
    const code = process.argv.slice(3).join(' ').trim();
    if (!code) throw new Error('Usage: node scripts/google-drive-setup.mjs exchange <code>');
    const { tokens } = await auth.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error('Google did not return a refresh token. Re-run auth-url and make sure prompt=consent is used.');
    }
    fs.writeFileSync(tokenPath, `${tokens.refresh_token}\n`);
    auth.setCredentials(tokens);
    const pipeline = await ensurePipeline(auth);
    writeRailwayEnv(tokens.refresh_token, pipeline);
    console.log(`Created/confirmed ${ROOT_NAME} Drive pipeline.`);
    console.log(`Root folder: ${pipeline.root.webViewLink}`);
    console.log(`Railway env written to ${railwayEnvPath}`);
    return;
  }

  if (command === 'setup-folders') {
    const authed = authWithRefreshToken();
    const pipeline = await ensurePipeline(authed);
    writeRailwayEnv(loadRefreshToken(), pipeline);
    console.log(`Created/confirmed ${ROOT_NAME} Drive pipeline.`);
    console.log(`Root folder: ${pipeline.root.webViewLink}`);
    console.log(`Railway env written to ${railwayEnvPath}`);
    return;
  }

  if (['sync-memory', 'push-memory', 'pull-memory'].includes(command)) {
    const mode = command === 'push-memory' ? 'push' : command === 'pull-memory' ? 'pull' : 'auto';
    const results = await syncMemoryDocs(authWithRefreshToken(), mode);
    console.log(`Drive memory sync complete (${mode}).`);
    for (const result of results) {
      console.log(`- ${result.action}: ${result.filePath} <-> ${result.docName}`);
    }
    console.log(`Pipeline config written to ${pipelinePath}`);
    console.log(`Railway env written to ${railwayEnvPath}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
