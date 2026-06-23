#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretsDir = path.join(repoRoot, '.secrets');
const clientPath = path.join(secretsDir, 'google-oauth-client.json');
const tokenPath = path.join(secretsDir, 'google-refresh-token.txt');
const runDate = process.argv[2] || new Date().toISOString().slice(0, 10);
const sourceRoot = path.join(repoRoot, 'ops', 'ux-audit-runs', `${runDate}-click-map`);
const reportPath = path.join(sourceRoot, 'drive-upload.json');
const reportMdPath = path.join(sourceRoot, 'drive-upload.md');
const ROOT_FOLDER = 'BNA UX Audit';
const RUN_FOLDER = `${runDate} Click Map`;
const CONCURRENCY = Math.max(1, Math.min(Number(process.env.DRIVE_UPLOAD_CONCURRENCY || 3), 6));

if (!fs.existsSync(sourceRoot)) {
  throw new Error(`Audit run folder does not exist: ${sourceRoot}`);
}

const drive = google.drive({ version: 'v3', auth: authWithRefreshToken() });
const uploaded = [];
const failed = [];

await main();

async function main() {
  const root = await ensureFolder(ROOT_FOLDER, 'root');
  const run = await ensureFolder(RUN_FOLDER, root.id);
  const folderIds = new Map([['', run.id]]);

  const files = listFiles(sourceRoot)
    .filter((filePath) => !filePath.endsWith('drive-upload.json') && !filePath.endsWith('drive-upload.md'))
    .sort((a, b) => uploadPriority(a) - uploadPriority(b) || a.localeCompare(b));

  for (const relDir of unique(files.map((filePath) => path.dirname(path.relative(sourceRoot, filePath))).filter((item) => item !== '.'))) {
    await ensureRelativeFolder(relDir, folderIds, run.id);
  }

  await runPool(files, CONCURRENCY, async (filePath, index) => {
    const rel = path.relative(sourceRoot, filePath).replace(/\\/g, '/');
    const parentRel = path.dirname(rel) === '.' ? '' : path.dirname(rel).replace(/\\/g, '/');
    const parentId = folderIds.get(parentRel);
    try {
      const file = await uploadOrUpdateFile(filePath, path.basename(filePath), parentId);
      uploaded.push({ path: rel, id: file.id, webViewLink: file.webViewLink || '', size: fs.statSync(filePath).size });
      if ((index + 1) % 100 === 0) console.log(`Uploaded ${index + 1}/${files.length}`);
    } catch (error) {
      failed.push({ path: rel, error: error.message });
      console.error(`Failed ${rel}: ${error.message}`);
    }
  });

  const report = {
    uploaded_at: new Date().toISOString(),
    sourceRoot,
    driveRoot: root,
    driveRunFolder: run,
    uploadedCount: uploaded.length,
    failedCount: failed.length,
    uploaded,
    failed,
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, [
    '# UX Audit Drive Upload',
    '',
    `Drive folder: ${run.webViewLink || run.id}`,
    `Uploaded files: ${uploaded.length}`,
    `Failed files: ${failed.length}`,
    '',
    failed.length ? '## Failures' : 'No upload failures recorded.',
    '',
    ...failed.map((item) => `- ${item.path}: ${item.error}`),
    '',
  ].join('\n'));
  console.log(JSON.stringify({
    folder: run.webViewLink || run.id,
    uploaded: uploaded.length,
    failed: failed.length,
    reportPath,
  }, null, 2));
}

async function ensureRelativeFolder(relDir, folderIds, runId) {
  const parts = relDir.split(/[\\/]+/).filter(Boolean);
  let currentRel = '';
  let parentId = runId;
  for (const part of parts) {
    currentRel = currentRel ? `${currentRel}/${part}` : part;
    if (!folderIds.has(currentRel)) {
      const folder = await ensureFolder(part, parentId);
      folderIds.set(currentRel, folder.id);
    }
    parentId = folderIds.get(currentRel);
  }
}

async function ensureFolder(name, parentId) {
  const existing = await findFile(name, parentId, "mimeType='application/vnd.google-apps.folder'");
  if (existing) return existing;
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId === 'root' ? undefined : [parentId],
    },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true,
  });
  return response.data;
}

async function uploadOrUpdateFile(filePath, name, parentId) {
  const mimeType = mimeTypeForFile(filePath);
  const existing = await findFile(name, parentId, "mimeType!='application/vnd.google-apps.folder'");
  const media = { mimeType, body: fs.createReadStream(filePath) };
  const fields = 'id,name,webViewLink,size,modifiedTime';
  if (existing) {
    const response = await drive.files.update({
      fileId: existing.id,
      media,
      fields,
      supportsAllDrives: true,
    });
    return response.data;
  }
  const response = await drive.files.create({
    requestBody: { name, parents: [parentId] },
    media,
    fields,
    supportsAllDrives: true,
  });
  return response.data;
}

async function findFile(name, parentId, extraQuery = '') {
  const safeName = String(name).replace(/'/g, "\\'");
  const safeParent = String(parentId).replace(/'/g, "\\'");
  const q = [
    'trashed=false',
    `name='${safeName}'`,
    `'${safeParent}' in parents`,
    extraQuery,
  ].filter(Boolean).join(' and ');
  const response = await drive.files.list({
    q,
    fields: 'files(id,name,webViewLink,size,modifiedTime)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return response.data.files?.[0] || null;
}

function authWithRefreshToken() {
  const parsed = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
  const client = parsed.web || parsed.installed;
  const auth = new google.auth.OAuth2(client.client_id, client.client_secret, client.redirect_uris?.[0]);
  auth.setCredentials({ refresh_token: fs.readFileSync(tokenPath, 'utf8').trim() });
  return auth;
}

function listFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listFiles(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

async function runPool(items, concurrency, worker) {
  let index = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = index++;
      await worker(items[current], current);
    }
  });
  await Promise.all(runners);
}

function uploadPriority(filePath) {
  const rel = path.relative(sourceRoot, filePath).replace(/\\/g, '/');
  if (!rel.startsWith('screenshots/')) return 0;
  if (/screenshots\/(drawers|modals|dropdowns|errors)\//.test(rel)) return 1;
  return 2;
}

function mimeTypeForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.png': 'image/png',
    '.txt': 'text/plain',
  }[ext] || 'application/octet-stream';
}

function unique(values) {
  return [...new Set(values)];
}
