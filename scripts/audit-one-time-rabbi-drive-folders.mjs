#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const require = createRequire(import.meta.url);
const {
  ONE_TIME_CONTENT_MEDIA_INTAKE_LANES,
  ONE_TIME_CONTENT_MEDIA_PARENT_ID,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_PROJECT_ROOT_ID,
  ONE_TIME_WORKSPACE_KEY,
  classifyDriveIntakeFile,
  completeLanesFromMap,
  driveFolderUrl,
  laneNameMatches,
  sanitizeDriveFileMetadata,
} = require('../src/lib/bna/one-time-drive-intake-map');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSecretsDir = path.join(repoRoot, '.secrets');
const auditDir = path.join(repoRoot, 'ops', 'one-time-mishnah', 'drive-ingestion-audit');
const driveSocialMapPath = path.join(repoRoot, 'ops', 'one-time-mishnah-class', 'drive-social-ingestion-map.json');
const driveSocialMapMdPath = path.join(repoRoot, 'ops', 'one-time-mishnah-class', 'drive-social-ingestion-map.md');
const partnershipMapPath = path.join(repoRoot, 'ops', 'one-time-mishnah-class', 'partnership-drive-map.json');
const partnershipMapMdPath = path.join(repoRoot, 'ops', 'one-time-mishnah-class', 'partnership-drive-map.md');

const PRESENTATION_MIMES = [
  'application/vnd.google-apps.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

function argsObject(argv) {
  const args = { write: false };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write') args.write = true;
    else if (arg === '--client') args.clientPath = argv[index += 1];
    else if (arg.startsWith('--client=')) args.clientPath = arg.slice('--client='.length);
    else if (arg === '--token') args.tokenPath = argv[index += 1];
    else if (arg.startsWith('--token=')) args.tokenPath = arg.slice('--token='.length);
    else if (arg === '--parent-id') args.parentId = argv[index += 1];
    else if (arg.startsWith('--parent-id=')) args.parentId = arg.slice('--parent-id='.length);
  }
  return args;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function loadClient(clientPath) {
  const parsed = readJson(clientPath);
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

function loadRefreshToken(tokenPath) {
  if (process.env.GOOGLE_REFRESH_TOKEN) return process.env.GOOGLE_REFRESH_TOKEN;
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, 'utf8').trim();
  throw new Error(`Missing Google refresh token at ${tokenPath}`);
}

function authWithRefreshToken(clientPath, tokenPath) {
  const client = loadClient(clientPath);
  const auth = new google.auth.OAuth2(client.clientId, client.clientSecret, client.redirectUri);
  auth.setCredentials({ refresh_token: loadRefreshToken(tokenPath) });
  return auth;
}

function driveLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function driveGet(drive, fileId) {
  const result = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,webViewLink,parents,createdTime,modifiedTime',
    supportsAllDrives: true,
  });
  return result.data;
}

async function listChildren(drive, parentId) {
  const files = [];
  let pageToken = '';
  do {
    const result = await drive.files.list({
      q: `'${driveLiteral(parentId)}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,webViewLink,parents,createdTime,modifiedTime,size)',
      pageSize: 100,
      pageToken: pageToken || undefined,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'folder,name',
    });
    files.push(...(result.data.files || []));
    pageToken = result.data.nextPageToken || '';
  } while (pageToken);
  return files;
}

async function createFolder(drive, name, parentId) {
  const result = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id,name,mimeType,webViewLink,parents,createdTime,modifiedTime',
    supportsAllDrives: true,
  });
  return result.data;
}

function folderForLane(children, lane) {
  return children.find((child) => (
    child.mimeType === 'application/vnd.google-apps.folder' && child.name === lane.name
  )) || children.find((child) => (
    child.mimeType === 'application/vnd.google-apps.folder' && laneNameMatches(lane, child.name)
  )) || null;
}

async function ensureLaneFolder(drive, children, lane, parentId, write) {
  const existing = folderForLane(children, lane);
  if (existing) {
    return {
      ...lane,
      id: existing.id,
      webViewLink: existing.webViewLink || driveFolderUrl(existing.id),
      parents: existing.parents || [parentId],
      actual_name: existing.name,
      created: false,
      reused: true,
      status: existing.name === lane.name ? 'reused_exact' : 'reused_semantic_alias',
    };
  }
  if (!write) {
    return { ...lane, id: '', webViewLink: '', parents: [parentId], actual_name: '', created: false, reused: false, status: 'missing_dry_run' };
  }
  const created = await createFolder(drive, lane.name, parentId);
  children.push(created);
  return {
    ...lane,
    id: created.id,
    webViewLink: created.webViewLink || driveFolderUrl(created.id),
    parents: created.parents || [parentId],
    actual_name: created.name,
    created: true,
    reused: false,
    status: 'created',
  };
}

async function searchPresentations(drive) {
  const byId = new Map();
  const queryHints = ['PowerPoint', 'presentation', 'slides', 'Scheller', 'Mishnah', 'One Time', 'Rabbi'];
  for (const hint of queryHints) {
    const mimeClause = PRESENTATION_MIMES.map((mime) => `mimeType='${mime}'`).join(' or ');
    const result = await drive.files.list({
      q: `trashed=false and (${mimeClause}) and name contains '${driveLiteral(hint)}'`,
      corpora: 'allDrives',
      fields: 'files(id,name,mimeType,webViewLink,parents,createdTime,modifiedTime)',
      pageSize: 20,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'modifiedTime desc',
    });
    for (const file of result.data.files || []) byId.set(file.id, file);
  }
  return [...byId.values()].sort((a, b) => Date.parse(b.modifiedTime || 0) - Date.parse(a.modifiedTime || 0)).slice(0, 20);
}

function parentEvidence(parent, children, lanes, searchedPresentations) {
  const directFiles = children.filter((child) => child.mimeType !== 'application/vnd.google-apps.folder');
  const classified = directFiles.map((file) => {
    const classification = classifyDriveIntakeFile(file, parent);
    return sanitizeDriveFileMetadata(file, classification, parent);
  });
  const powerpoints = classified.filter((file) => file.route === 'slideshow/source-material' || /powerpoint|slides|presentation/i.test(file.name || ''));
  return {
    checked_at: new Date().toISOString(),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    approved_parent_folder_id: ONE_TIME_CONTENT_MEDIA_PARENT_ID,
    parent: {
      id: parent.id,
      name: parent.name,
      webViewLink: parent.webViewLink || driveFolderUrl(parent.id),
      mimeType: parent.mimeType,
      matches_documented_content_media_intake: parent.id === ONE_TIME_CONTENT_MEDIA_PARENT_ID && parent.name === '04 Content and Media Intake',
    },
    child_counts: {
      total: children.length,
      folders: children.filter((child) => child.mimeType === 'application/vnd.google-apps.folder').length,
      files: directFiles.length,
    },
    folders: lanes.map((lane) => ({
      key: lane.key,
      title: lane.name,
      actual_title: lane.actual_name || lane.name,
      folder_id: lane.id,
      url: lane.webViewLink,
      parent_folder_id: ONE_TIME_CONTENT_MEDIA_PARENT_ID,
      status: lane.status,
      created: Boolean(lane.created),
      reused: Boolean(lane.reused),
      intended_audience: lane.intended_audience,
      lane_type: lane.lane_type,
      triggers_transcription: Boolean(lane.triggers_transcription),
      source_material_only: Boolean(lane.source_material_only),
    })),
    direct_child_files: classified,
    powerpoint_found_in_parent: powerpoints.length > 0,
    powerpoint_candidates: powerpoints,
    presentation_search_candidates: searchedPresentations.map((file) => sanitizeDriveFileMetadata(
      file,
      classifyDriveIntakeFile(file, { id: file.parents?.[0] || '' }),
      { id: file.parents?.[0] || '' }
    )),
    operator_question: powerpoints.length ? '' : 'Rabbi said he uploaded an old PowerPoint to the media intake folder, but the current Drive listing did not show it. Please confirm upload completed or send the exact file link.',
    no_drive_move: true,
    no_drive_delete: true,
    no_transcription_started: true,
    no_publish_or_send: true,
  };
}

function updatedDriveSocialMap(existing, lanes) {
  return {
    ...existing,
    generatedAt: new Date().toISOString(),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    root: {
      id: existing.root?.id || ONE_TIME_PROJECT_ROOT_ID,
      name: existing.root?.name || 'One Time Mishnah Class - Rabbi Elie Scheller',
      webViewLink: existing.root?.webViewLink || driveFolderUrl(existing.root?.id || ONE_TIME_PROJECT_ROOT_ID),
    },
    content_media_folder: {
      id: ONE_TIME_CONTENT_MEDIA_PARENT_ID,
      name: '04 Content and Media Intake',
      webViewLink: driveFolderUrl(ONE_TIME_CONTENT_MEDIA_PARENT_ID),
    },
    lanes: lanes.map((lane) => ({
      key: lane.key,
      canonical_key: lane.canonical_key,
      name: lane.name,
      actual_name: lane.actual_name || lane.name,
      previous_names: lane.previous_names || [],
      drive_stage: lane.drive_stage,
      purpose: lane.purpose,
      handling: lane.handling,
      backend_use: lane.backend_use,
      intended_audience: lane.intended_audience,
      lane_type: lane.lane_type,
      rabbi_facing: Boolean(lane.rabbi_facing),
      super_admin_visible: lane.super_admin_visible !== false,
      triggers_transcription: Boolean(lane.triggers_transcription),
      source_material_only: Boolean(lane.source_material_only),
      copy_label: lane.copy_label || '',
      id: lane.id,
      webViewLink: lane.webViewLink,
      created: Boolean(lane.created),
      reused: Boolean(lane.reused),
      status: lane.status,
    })),
    backend_mapping: {
      ...(existing.backend_mapping || {}),
      content_job_project_key: ONE_TIME_PROJECT_KEY,
      operations_workspace_key: ONE_TIME_WORKSPACE_KEY,
      content_job_source_type: 'google_drive',
      drive_file_id_field: 'bna_content_jobs.drive_file_id',
      drive_folder_id_field: 'bna_content_jobs.drive_folder_id',
      drive_stage_field: 'bna_content_jobs.drive_stage',
      output_table: 'bna_content_outputs',
      media_upload_folder_key: 'videoDrop',
      media_upload_folder_id: lanes.find((lane) => lane.key === 'videoDrop')?.id || null,
      source_material_upload_folder_key: 'sourceMaterials',
      source_material_upload_folder_id: lanes.find((lane) => lane.key === 'sourceMaterials')?.id || null,
      output_drafts_folder_key: 'socialOutputs',
      output_drafts_folder_id: lanes.find((lane) => lane.key === 'socialOutputs')?.id || null,
      approved_outputs_folder_key: 'approvedPosted',
      approved_outputs_folder_id: lanes.find((lane) => lane.key === 'approvedPosted')?.id || null,
      ambiguous_files_folder_key: 'needsDecision',
      ambiguous_files_folder_id: lanes.find((lane) => lane.key === 'needsDecision')?.id || null,
      classification_rules: {
        audio_video: { route: 'transcription_intake', source_type: 'recording / meeting_drop / shiur_recording', eligible_for_transcription: true },
        powerpoint_google_slides: { route: 'slideshow/source-material', source_type: 'slideshow_reference', eligible_for_transcription: false, eligible_for_content_generation: 'review_required' },
        pdf_source_sheet_worksheet: { route: 'source-material', source_type: 'source_sheet / worksheet / handout', eligible_for_transcription: false, eligible_for_content_generation: 'review_required' },
        unknown: { route: 'needs Shloimie decision', eligible_for_transcription: false, automation_allowed: false },
      },
      social_publish_guard: 'No Buffer/social/newsletter/email/WhatsApp send or publish without explicit approval.',
    },
  };
}

function updatedPartnershipMap(existing, lanes) {
  const contentMediaFolders = lanes.map((lane) => ({
    key: lane.key,
    canonicalKey: lane.canonical_key,
    name: lane.name,
    actualName: lane.actual_name || lane.name,
    driveStage: lane.drive_stage,
    purpose: lane.purpose,
    handling: lane.handling,
    backendUse: lane.backend_use,
    intendedAudience: lane.intended_audience,
    laneType: lane.lane_type,
    rabbiFacing: Boolean(lane.rabbi_facing),
    triggersTranscription: Boolean(lane.triggers_transcription),
    sourceMaterialOnly: Boolean(lane.source_material_only),
    id: lane.id,
    parents: [ONE_TIME_CONTENT_MEDIA_PARENT_ID],
    webViewLink: lane.webViewLink,
    created: Boolean(lane.created),
    reused: Boolean(lane.reused),
    status: lane.status,
  }));
  const subfolders = Array.isArray(existing.subfolders) ? existing.subfolders.map((folder) => (
    folder.key === 'contentMedia'
      ? { ...folder, id: ONE_TIME_CONTENT_MEDIA_PARENT_ID, name: '04 Content and Media Intake', webViewLink: driveFolderUrl(ONE_TIME_CONTENT_MEDIA_PARENT_ID) }
      : folder
  )) : [];
  return {
    ...existing,
    generatedAt: new Date().toISOString(),
    projectFolder: {
      ...(existing.projectFolder || {}),
      id: existing.projectFolder?.id || ONE_TIME_PROJECT_ROOT_ID,
      webViewLink: existing.projectFolder?.webViewLink || driveFolderUrl(existing.projectFolder?.id || ONE_TIME_PROJECT_ROOT_ID),
    },
    subfolders,
    contentMediaIntakeFolders: contentMediaFolders,
  };
}

function renderDriveSocialMarkdown(map) {
  const rows = (map.lanes || []).map((lane) => (
    `| ${lane.name} | ${lane.actual_name || lane.name} | ${lane.id || 'missing'} | ${lane.intended_audience} | ${lane.lane_type} | ${lane.triggers_transcription ? 'yes' : 'no'} | ${lane.source_material_only ? 'yes' : 'no'} | ${lane.status || 'mapped'} |`
  )).join('\n');
  return `# One Time Drive Social Ingestion Map

Updated: ${map.generatedAt}

Parent folder: [04 Content and Media Intake](${map.content_media_folder.webViewLink})

| Target folder | Actual Drive title | Folder ID | Audience | Lane type | Triggers transcription | Source-material only | Status |
|---|---|---|---|---|---|---|---|
${rows}

## Classification Guardrails

- Audio/video files route to transcription intake and can create One Time content jobs.
- PowerPoint and Google Slides route to slideshow/source-material, are not transcribed, and stay index-only until reviewed.
- PDFs, source sheets, worksheets, and handouts route to source-material and are not transcribed.
- Unknown files route to Needs Shloimie Decision and do not trigger automation.
- Broad parent-folder children are classified by file type/lane; the parent folder itself never auto-transcribes all children.
`;
}

function renderPartnershipMarkdown(map) {
  const folders = (map.contentMediaIntakeFolders || []).map((folder) => (
    `| ${folder.name} | ${folder.actualName || folder.name} | ${folder.id || 'missing'} | ${folder.intendedAudience} | ${folder.laneType} | ${folder.triggersTranscription ? 'yes' : 'no'} | ${folder.status || 'mapped'} |`
  )).join('\n');
  return `# One Time Partnership Drive Map

Updated: ${map.generatedAt}

Project folder: [${map.projectFolder?.name || 'One Time Mishnah Class - Rabbi Elie Scheller'}](${map.projectFolder?.webViewLink || driveFolderUrl(ONE_TIME_PROJECT_ROOT_ID)})

Content/media parent: [04 Content and Media Intake](${driveFolderUrl(ONE_TIME_CONTENT_MEDIA_PARENT_ID)})

## Content And Media Intake Folders

| Target folder | Actual Drive title | Folder ID | Audience | Lane type | Triggers transcription | Status |
|---|---|---|---|---|---|---|
${folders}
`;
}

function renderStructureAuditMarkdown(evidence) {
  return `# Rabbi Folder Structure Audit

Date: ${evidence.checked_at}

Parent folder: [${evidence.parent.name}](${evidence.parent.webViewLink})

Confirmed documented parent: ${evidence.parent.matches_documented_content_media_intake ? 'yes' : 'no'}

Child count: ${evidence.child_counts.total} total, ${evidence.child_counts.folders} folders, ${evidence.child_counts.files} files.

Old PowerPoint found in parent: ${evidence.powerpoint_found_in_parent ? 'yes' : 'no'}

${evidence.operator_question ? `Operator question: ${evidence.operator_question}\n` : ''}
## Folder Results

| Folder | Actual title | Status | Audience | Lane | Transcription | Source only |
|---|---|---|---|---|---|---|
${evidence.folders.map((folder) => `| ${folder.title} | ${folder.actual_title} | ${folder.status} | ${folder.intended_audience} | ${folder.lane_type} | ${folder.triggers_transcription ? 'yes' : 'no'} | ${folder.source_material_only ? 'yes' : 'no'} |`).join('\n')}

## Direct File Classifications

${evidence.direct_child_files.length ? evidence.direct_child_files.map((file) => `- ${file.name}: ${file.route}; ${file.source_type}; transcribe=${file.eligible_for_transcription}; ${file.next_action}`).join('\n') : '- No direct files were visible in the parent listing.'}

Guardrails: no Drive files moved or deleted; no transcription, AI, production apply, publish, send, score/progress/task/student writes, class backfill, or raw transcript export occurred.
`;
}

function renderCreationLogMarkdown(evidence) {
  return `# Rabbi Folder Creation Log

Date: ${evidence.checked_at}

Approved parent: [04 Content and Media Intake](${driveFolderUrl(ONE_TIME_CONTENT_MEDIA_PARENT_ID)})

| Folder | URL | Result |
|---|---|---|
${evidence.folders.map((folder) => `| ${folder.title} | ${folder.url} | ${folder.status} |`).join('\n')}

No existing Drive files were moved, renamed, or deleted.
`;
}

function renderUiAuditMarkdown(evidence) {
  const rabbiLinks = evidence.folders.filter((folder) => folder.intended_audience === 'rabbi_facing');
  return `# Rabbi UI Drive Links Audit

Date: ${evidence.checked_at}

Super-admin UI expected links: project root, content/media parent, and all seven intake lanes.

Rabbi-facing UI expected links:

${rabbiLinks.map((folder) => `- ${folder.title}: ${folder.url}`).join('\n')}

Internal links not exposed to Rabbi-facing UI: ingestion queue, source material review, output drafts, approved archive, decision queue, private transcript library, raw backend IDs, and production DB information.
`;
}

async function main() {
  const args = argsObject(process.argv);
  const parentId = args.parentId || ONE_TIME_CONTENT_MEDIA_PARENT_ID;
  if (parentId !== ONE_TIME_CONTENT_MEDIA_PARENT_ID) {
    throw new Error(`Refusing parent ${parentId}; approved parent is ${ONE_TIME_CONTENT_MEDIA_PARENT_ID}`);
  }

  const clientPath = args.clientPath || process.env.GOOGLE_OAUTH_CLIENT_PATH || path.join(defaultSecretsDir, 'google-oauth-client.json');
  const tokenPath = args.tokenPath || process.env.GOOGLE_REFRESH_TOKEN_PATH || path.join(defaultSecretsDir, 'google-refresh-token.txt');
  const auth = authWithRefreshToken(clientPath, tokenPath);
  const drive = google.drive({ version: 'v3', auth });

  const parent = await driveGet(drive, parentId);
  const children = await listChildren(drive, parentId);
  const lanes = [];
  for (const lane of ONE_TIME_CONTENT_MEDIA_INTAKE_LANES) {
    lanes.push(await ensureLaneFolder(drive, children, lane, parentId, args.write));
  }

  const refreshedChildren = args.write ? await listChildren(drive, parentId) : children;
  const searchedPresentations = await searchPresentations(drive);
  const evidence = parentEvidence(parent, refreshedChildren, lanes, searchedPresentations);
  const driveSocialMap = updatedDriveSocialMap(readJson(driveSocialMapPath, {}), lanes);
  const partnershipMap = updatedPartnershipMap(readJson(partnershipMapPath, {}), completeLanesFromMap(driveSocialMap));

  fs.mkdirSync(auditDir, { recursive: true });
  writeJson(path.join(auditDir, '2026-06-28-rabbi-folder-structure-audit.json'), evidence);
  writeJson(path.join(auditDir, '2026-06-28-rabbi-folder-creation-log.json'), {
    checked_at: evidence.checked_at,
    approved_parent_folder_id: ONE_TIME_CONTENT_MEDIA_PARENT_ID,
    write_mode: args.write ? 'approved_folder_create_or_reuse' : 'dry_run',
    folders: evidence.folders,
    no_move: true,
    no_delete: true,
  });
  writeJson(path.join(auditDir, '2026-06-28-rabbi-ui-drive-links-audit.json'), {
    checked_at: evidence.checked_at,
    super_admin_expected_folder_count: 9,
    rabbi_facing_expected_folder_count: 2,
    folders: evidence.folders,
    rabbi_facing_folders: evidence.folders.filter((folder) => folder.intended_audience === 'rabbi_facing'),
    private_or_internal_exclusions: [
      '04.10 Ingestion Queue - Transcribe and Parse',
      '04.20 Source Material Review',
      '04.30 Social and Newsletter Output Drafts - Platform Review',
      '04.90 Approved and Posted Outputs',
      '04.99 Needs Shloimie Decision',
      'Private transcript library',
      'raw backend IDs',
      'production DB information',
    ],
  });
  fs.writeFileSync(path.join(auditDir, '2026-06-28-rabbi-folder-structure-audit.md'), renderStructureAuditMarkdown(evidence));
  fs.writeFileSync(path.join(auditDir, '2026-06-28-rabbi-folder-creation-log.md'), renderCreationLogMarkdown(evidence));
  fs.writeFileSync(path.join(auditDir, '2026-06-28-rabbi-ui-drive-links-audit.md'), renderUiAuditMarkdown(evidence));

  writeJson(driveSocialMapPath, driveSocialMap);
  writeJson(partnershipMapPath, partnershipMap);
  fs.writeFileSync(driveSocialMapMdPath, renderDriveSocialMarkdown(driveSocialMap));
  fs.writeFileSync(partnershipMapMdPath, renderPartnershipMarkdown(partnershipMap));

  const videoLane = lanes.find((lane) => lane.key === 'videoDrop');
  const sourceLane = lanes.find((lane) => lane.key === 'sourceMaterials');
  process.stdout.write(`${JSON.stringify({
    success: true,
    write_mode: args.write ? 'approved_folder_create_or_reuse' : 'dry_run',
    parent_confirmed: evidence.parent.matches_documented_content_media_intake,
    folders_created: lanes.filter((lane) => lane.created).map((lane) => lane.name),
    folders_reused: lanes.filter((lane) => lane.reused).map((lane) => ({ name: lane.name, actual_name: lane.actual_name, status: lane.status })),
    powerpoint_found_in_parent: evidence.powerpoint_found_in_parent,
    video_audio_link: videoLane?.webViewLink || '',
    slides_source_materials_link: sourceLane?.webViewLink || '',
    evidence_paths: [
      'ops/one-time-mishnah/drive-ingestion-audit/2026-06-28-rabbi-folder-structure-audit.md',
      'ops/one-time-mishnah/drive-ingestion-audit/2026-06-28-rabbi-folder-creation-log.md',
      'ops/one-time-mishnah/drive-ingestion-audit/2026-06-28-rabbi-ui-drive-links-audit.md',
    ],
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
