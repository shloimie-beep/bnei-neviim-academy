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
const auditDir = path.join(repoRoot, 'ops', 'drive-audits');

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function loadPipelineConfig() {
  if (process.env.GOOGLE_DRIVE_PIPELINE_CONFIG) {
    return JSON.parse(process.env.GOOGLE_DRIVE_PIPELINE_CONFIG);
  }
  return readJsonIfExists(pipelinePath) || {};
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function driveLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatBytes(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 1024 * 1024 * 1024) return `${Math.round(n / 1024 / 1024 / 1024)} GB`;
  if (n >= 1024 * 1024) return `${Math.round(n / 1024 / 1024)} MB`;
  return `${Math.round(n / 1024)} KB`;
}

function compactFile(file) {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size || null,
    sizeLabel: formatBytes(file.size),
    createdTime: file.createdTime || null,
    modifiedTime: file.modifiedTime || null,
    webViewLink: file.webViewLink || null,
    parents: file.parents || [],
    driveId: file.driveId || null,
    owners: (file.owners || []).map((owner) => ({
      displayName: owner.displayName || null,
      emailAddress: owner.emailAddress || null,
    })),
    shortcutDetails: file.shortcutDetails || null,
  };
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
  if (!fileId) return null;
  const result = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents,driveId,owners(displayName,emailAddress),shortcutDetails(targetId,targetMimeType)',
  });
  return compactFile(result.data);
}

async function listFolderChildren(drive, folderId, pageSize = 10) {
  if (!folderId) return [];
  const safeFolderId = driveLiteral(folderId);
  const files = await listAllFiles(drive, {
    q: [`'${safeFolderId}' in parents`, 'trashed=false'].join(' and '),
    fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents,driveId,owners(displayName,emailAddress),shortcutDetails(targetId,targetMimeType))',
    orderBy: 'modifiedTime desc',
    pageSize,
  }, 2);
  return files.map(compactFile);
}

async function buildDriveAudit() {
  const auth = authWithRefreshToken();
  const drive = google.drive({ version: 'v3', auth });
  const pipeline = loadPipelineConfig();

  const [aboutResult, sharedDrivesResult, rootResult] = await Promise.all([
    drive.about.get({ fields: 'user(displayName,emailAddress),storageQuota(usage,usageInDrive,limit)' }),
    drive.drives.list({ pageSize: 100, fields: 'drives(id,name,hidden)' }).catch(() => ({ data: { drives: [] } })),
    drive.files.get({
      fileId: 'root',
      fields: 'id,name,webViewLink,owners(displayName,emailAddress)',
      supportsAllDrives: true,
    }),
  ]);

  const pipelineRoot = pipeline.root ? await getDriveFile(drive, pipeline.root).catch((error) => ({ error: error.message })) : null;
  const websiteMomentsIntake = pipeline.websiteMomentsIntake
    ? await getDriveFile(drive, pipeline.websiteMomentsIntake).catch((error) => ({ error: error.message }))
    : null;

  const topLevelItems = await listAllFiles(drive, {
    q: "'root' in parents and trashed=false",
    fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents,driveId,owners(displayName,emailAddress),shortcutDetails(targetId,targetMimeType))',
    orderBy: 'folder,name',
    pageSize: 100,
  }, 5);

  const visibleFolders = await listAllFiles(drive, {
    q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'nextPageToken,files(id,name,mimeType,createdTime,modifiedTime,webViewLink,parents,driveId,owners(displayName,emailAddress))',
    orderBy: 'modifiedTime desc',
    pageSize: 200,
  }, 10);

  const recentFiles = await listAllFiles(drive, {
    q: "trashed=false and mimeType!='application/vnd.google-apps.folder'",
    corpora: 'allDrives',
    fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,parents,driveId,owners(displayName,emailAddress),shortcutDetails(targetId,targetMimeType))',
    orderBy: 'modifiedTime desc',
    pageSize: 50,
  }, 3);

  const stages = {};
  for (const [stageName, folderId] of Object.entries(pipeline.stages || {})) {
    const folder = await getDriveFile(drive, folderId).catch((error) => ({ id: folderId, name: stageName, error: error.message }));
    const recentItems = await listFolderChildren(drive, folderId, 12).catch((error) => [{ id: folderId, name: `ERROR: ${error.message}` }]);
    stages[stageName] = {
      folder,
      recentItems,
      recentItemCount: recentItems.length,
    };
  }

  const simplifiedFolders = {};
  for (const [folderKey, folderId] of Object.entries(pipeline.simplifiedFolders || {})) {
    if (!folderId) continue;
    const folder = await getDriveFile(drive, folderId).catch((error) => ({ id: folderId, name: folderKey, error: error.message }));
    const recentItems = await listFolderChildren(drive, folderId, 12).catch((error) => [{ id: folderId, name: `ERROR: ${error.message}` }]);
    simplifiedFolders[folderKey] = {
      folder,
      recentItems,
      recentItemCount: recentItems.length,
    };
  }

  const ownerCounts = new Map();
  for (const file of [...visibleFolders, ...recentFiles]) {
    const owner = file.owners?.[0]?.emailAddress || 'unknown';
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
  }

  return {
    generatedAt: new Date().toISOString(),
    account: {
      displayName: aboutResult.data.user?.displayName || null,
      emailAddress: aboutResult.data.user?.emailAddress || null,
      storageQuota: aboutResult.data.storageQuota || null,
    },
    root: compactFile(rootResult.data),
    sharedDrives: sharedDrivesResult.data.drives || [],
    pipeline: {
      configPath: fs.existsSync(pipelinePath) ? path.relative(repoRoot, pipelinePath).replace(/\\/g, '/') : null,
      root: pipelineRoot,
      websiteMomentsIntake,
      sourceOfTruth: pipeline.sourceOfTruth || null,
      simplifiedFolders,
      stages,
    },
    inventory: {
      topLevelItems: topLevelItems.map(compactFile),
      visibleFolderCount: visibleFolders.length,
      visibleFolders: visibleFolders.map(compactFile),
      recentFiles: recentFiles.map(compactFile),
      ownerCounts: Object.fromEntries([...ownerCounts.entries()].sort((a, b) => b[1] - a[1])),
    },
  };
}

function markdownLink(file) {
  if (!file?.name) return '- Unknown file';
  const size = file.sizeLabel ? `, ${file.sizeLabel}` : '';
  const modified = file.modifiedTime ? `, modified ${file.modifiedTime}` : '';
  const owner = file.owners?.[0]?.emailAddress ? `, owner ${file.owners[0].emailAddress}` : '';
  const details = `${file.mimeType || 'unknown'}${size}${modified}${owner}`;
  return file.webViewLink
    ? `- [${file.name}](${file.webViewLink}) - ${details}`
    : `- ${file.name} - ${details}`;
}

function renderMarkdown(audit) {
  const sharedDriveCount = audit.sharedDrives.length;
  const rootOwner = audit.root.owners?.[0]?.emailAddress || audit.account.emailAddress || 'unknown';
  const pipelineRoot = audit.pipeline.root;
  const nonCurrentOwners = Object.entries(audit.inventory.ownerCounts)
    .filter(([email]) => email !== audit.account.emailAddress && email !== 'unknown')
    .slice(0, 8);
  const simplifiedLabels = {
    rawIntake: 'Raw Media Intake',
    websiteImages: 'Website Images Intake',
    processing: 'Processing Temporary',
    processedRecordings: 'Processed Recordings Source Media',
    approvedAssets: 'Approved Website Assets',
    failedNeedsReview: 'Failed Needs Review',
    legacyArchive: 'Legacy Archive',
  };

  const lines = [
    `# Google Drive Audit - ${audit.generatedAt}`,
    '',
    '## What This Credential Can See',
    '',
    `- Signed-in Google account: ${audit.account.emailAddress || audit.account.displayName || 'unknown'}`,
    `- My Drive root id: ${audit.root.id || 'unknown'}`,
    `- My Drive root owner: ${rootOwner}`,
    `- Workspace Shared Drives visible: ${sharedDriveCount}`,
  ];

  if (sharedDriveCount) {
    for (const sharedDrive of audit.sharedDrives) {
      lines.push(`- Shared Drive: ${sharedDrive.name} (${sharedDrive.id})`);
    }
  } else {
    lines.push('- No separate Workspace Shared Drive is visible through this token.');
  }

  if (nonCurrentOwners.length) {
    lines.push('- Files from other owners are visible only when shared into this account or visible through shortcuts:');
    for (const [email, count] of nonCurrentOwners) {
      lines.push(`- ${email}: ${count} visible item(s) sampled`);
    }
  }

  lines.push(
    '',
    '## BNA Pipeline',
    '',
    pipelineRoot?.name
      ? markdownLink(pipelineRoot)
      : '- BNA pipeline root is not configured or not readable.',
    audit.pipeline.websiteMomentsIntake?.name
      ? `- Website moments intake: ${audit.pipeline.websiteMomentsIntake.name} (${audit.pipeline.websiteMomentsIntake.id})`
      : '- Website moments intake is not configured or not readable.',
    ''
  );

  if (audit.pipeline.sourceOfTruth) {
    lines.push(
      '## Source Of Truth',
      '',
      `- Transcripts: ${audit.pipeline.sourceOfTruth.transcripts || 'not recorded'}`,
      `- Brand kit: ${audit.pipeline.sourceOfTruth.brandKit || 'not recorded'}`,
      `- Platform memory: ${audit.pipeline.sourceOfTruth.platformMemory || 'not recorded'}`,
      `- Drive role: ${audit.pipeline.sourceOfTruth.driveRole || 'not recorded'}`,
      ''
    );
  }

  lines.push('## Operator Folder Snapshot', '');
  if (!Object.keys(audit.pipeline.simplifiedFolders || {}).length) {
    lines.push('- Simplified folder config is not present yet.', '');
  } else {
    for (const [folderKey, snapshot] of Object.entries(audit.pipeline.simplifiedFolders || {})) {
      const label = simplifiedLabels[folderKey] || folderKey;
      lines.push(`### ${label}`);
      if (snapshot.folder?.webViewLink) {
        lines.push(`Folder: [${snapshot.folder.name}](${snapshot.folder.webViewLink})`);
      } else {
        lines.push(`Folder: ${snapshot.folder?.name || snapshot.folder?.id || 'not readable'}`);
      }
      if (!snapshot.recentItems?.length) {
        lines.push('- No recent items visible.');
      } else {
        for (const item of snapshot.recentItems.slice(0, 8)) {
          lines.push(markdownLink(item));
        }
      }
      lines.push('');
    }
  }

  lines.push(
    '## Compatibility Stage Map',
    '',
    'These historical stage keys are kept so older bridge/server code still works. Duplicate stage keys may intentionally point to the same simplified folder.',
    ''
  );

  const shownFolderIds = new Map();
  for (const [stageName, stage] of Object.entries(audit.pipeline.stages || {})) {
    lines.push(`### ${stageName}`);
    if (stage.folder?.webViewLink) {
      lines.push(`Folder: [${stage.folder.name}](${stage.folder.webViewLink})`);
    } else {
      lines.push(`Folder: ${stage.folder?.name || stage.folder?.id || 'not readable'}`);
    }
    if (stage.folder?.id && shownFolderIds.has(stage.folder.id)) {
      lines.push(`- Uses the same folder as ${shownFolderIds.get(stage.folder.id)}. Recent items are shown there.`);
    } else if (!stage.recentItems?.length) {
      lines.push('- No recent items visible.');
    } else {
      if (stage.folder?.id) shownFolderIds.set(stage.folder.id, stageName);
      for (const item of stage.recentItems.slice(0, 8)) {
        lines.push(markdownLink(item));
      }
    }
    lines.push('');
  }

  lines.push(
    '## Newest Accessible Non-Folder Files',
    ''
  );
  for (const file of audit.inventory.recentFiles.slice(0, 20)) {
    lines.push(markdownLink(file));
  }

  lines.push(
    '',
    '## Recommendation',
    '',
    '- Treat Google Drive as the operator-facing upload and source-media library, not the canonical brand/memory store.',
    '- Keep transcripts exported into GitHub under content-memory/transcripts while the live app database remains the working transcript source.',
    '- Keep brand voice, examples, and agent memory in GitHub under brand-kit/ and content-memory/; Drive brand docs are deprecated mirrors only.',
    '- Operator-facing Drive shape: 00 Upload Here - Raw Media Intake, 00 Upload Here - Website Images, 10 Processing - Temporary, 20 Processed Recordings - Source Media, 30 Approved Website Assets, 90 Failed - Needs Review.',
    '- Keep personal Drive separate. Share or move only school source files into BNA V2 when they belong to the BNA pipeline.',
    '- Medium term: create a real Google Workspace Shared Drive named BNA Operations, move BNA V2 into it, then rerun setup so the bot uses stable Shared Drive folder IDs.',
    '- The OpenAI Telegram sidekick should receive this Drive snapshot automatically for Drive-related questions so it can answer location/status questions without asking which folder to check.'
  );

  return `${lines.join('\n')}\n`;
}

async function main() {
  const audit = await buildDriveAudit();
  const stamp = audit.generatedAt.replace(/[:.]/g, '-');
  ensureDirectory(auditDir);
  const jsonPath = path.join(auditDir, `${stamp}-google-drive-audit.json`);
  const markdownPath = path.join(auditDir, `${stamp}-google-drive-audit.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdown(audit));
  console.log(`Google Drive audit written:\n- ${path.relative(repoRoot, jsonPath)}\n- ${path.relative(repoRoot, markdownPath)}`);
  console.log(`Signed-in account: ${audit.account.emailAddress || audit.account.displayName || 'unknown'}`);
  console.log(`Workspace Shared Drives visible: ${audit.sharedDrives.length}`);
  console.log(`BNA pipeline root: ${audit.pipeline.root?.name || 'not configured/readable'}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
