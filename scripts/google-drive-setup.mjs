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
  const stageNames = [
    '01 Raw Intake',
    '02 Ingesting',
    '03 Transcribed',
    '04 Parsed',
    '05 WhatsApp Ready',
    '06 Newsletter Candidates',
    '07 Social Candidates',
    '08 Blog Candidates',
    '09 Brand Kit Suggestions',
    '10 Approved',
    '11 Published',
    '99 Failed',
  ];

  const stages = {};
  for (const stage of stageNames) {
    stages[stage] = await ensureFolder(drive, stage, root.id);
  }

  const brandKit = await ensureFolder(drive, 'BNA Brand Kit', root.id);
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

  return { root, stages, brandKit, brandDocs };
}

function writeRailwayEnv(refreshToken, pipeline) {
  const client = loadClient();
  const config = {
    root: pipeline.root.id,
    stages: Object.fromEntries(Object.entries(pipeline.stages).map(([name, folder]) => [name, folder.id])),
    brandKit: pipeline.brandKit.id,
    brandDocs: Object.fromEntries(Object.entries(pipeline.brandDocs).map(([name, doc]) => [name, doc.id])),
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
    const refreshToken = fs.readFileSync(tokenPath, 'utf8').trim();
    auth.setCredentials({ refresh_token: refreshToken });
    const pipeline = await ensurePipeline(auth);
    writeRailwayEnv(refreshToken, pipeline);
    console.log(`Created/confirmed ${ROOT_NAME} Drive pipeline.`);
    console.log(`Root folder: ${pipeline.root.webViewLink}`);
    console.log(`Railway env written to ${railwayEnvPath}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
