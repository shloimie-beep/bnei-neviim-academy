'use strict';

const ONE_TIME_DROPOFF_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_DROPOFF_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID = '1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv';
const ONE_TIME_VIDEO_DROP_FOLDER_ID = '1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t';
const ONE_TIME_SOURCE_MATERIAL_FOLDER_ID = '15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp';
const ONE_TIME_VIDEO_DROP_STAGE = 'one_time_video_drop';
const ONE_TIME_SOURCE_MATERIAL_STAGE = 'one_time_presentation_source_material';

const ONE_TIME_DROPOFF_FOLDERS = [
  {
    id: ONE_TIME_VIDEO_DROP_FOLDER_ID,
    stage: ONE_TIME_VIDEO_DROP_STAGE,
    label: '04.00 Upload Here - Rabbi Video Drops',
    classification: 'video_audio_for_transcription',
    classificationLabel: 'Video/audio for transcription',
  },
  {
    id: ONE_TIME_SOURCE_MATERIAL_FOLDER_ID,
    stage: ONE_TIME_SOURCE_MATERIAL_STAGE,
    label: '04.05 Upload Here - Slideshows and Source Materials',
    classification: 'slideshow_source_sheet_material',
    classificationLabel: 'Slideshow/source sheet/material',
  },
  {
    id: ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID,
    stage: ONE_TIME_SOURCE_MATERIAL_STAGE,
    label: '04 Content and Media Intake',
    classification: 'slideshow_source_sheet_material',
    classificationLabel: 'Slideshow/source sheet/material',
    presentationOnly: true,
  },
];

const GOOGLE_APP_EXPORTS = new Map([
  ['application/vnd.google-apps.presentation', { path: 'presentation', exportSuffix: 'export/pptx' }],
  ['application/vnd.google-apps.document', { path: 'document', exportSuffix: 'export?format=docx' }],
  ['application/vnd.google-apps.spreadsheet', { path: 'spreadsheets', exportSuffix: 'export?format=xlsx' }],
  ['application/vnd.google-apps.drawing', { path: 'drawings', exportSuffix: 'export/png' }],
]);

const VIDEO_AUDIO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mp3', '.m4a', '.wav', '.ogg', '.opus']);
const PRESENTATION_EXTENSIONS = new Set(['.ppt', '.pptx', '.pps', '.ppsx']);

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getFileExtension(name) {
  const cleanName = cleanText(name).toLowerCase();
  const dotIndex = cleanName.lastIndexOf('.');
  if (dotIndex < 0) return '';
  return cleanName.slice(dotIndex);
}

function oneTimeDropoffFolderById(folderId = '') {
  const id = cleanText(folderId);
  return ONE_TIME_DROPOFF_FOLDERS.find((folder) => folder.id === id) || null;
}

function oneTimeDropoffFolderForFile(file = {}, fallbackFolderId = '') {
  const folderIds = [
    fallbackFolderId,
    file.sourceFolderId,
    file.drive_folder_id,
    file.folder_id,
    ...(Array.isArray(file.parents) ? file.parents : []),
  ].map(cleanText).filter(Boolean);
  for (const folderId of folderIds) {
    const folder = oneTimeDropoffFolderById(folderId);
    if (folder) return folder;
  }
  return null;
}

function driveFileId(file = {}) {
  return cleanText(file.id || file.drive_file_id);
}

function driveFileName(file = {}) {
  return cleanText(file.name || file.title || file.filename) || 'Rabbi Drive dropoff file';
}

function driveMimeType(file = {}) {
  return cleanText(file.mimeType || file.mime_type);
}

function isGoogleDriveFolder(file = {}) {
  return driveMimeType(file).toLowerCase() === 'application/vnd.google-apps.folder';
}

function isVideoAudioFile(file = {}) {
  const mime = driveMimeType(file).toLowerCase();
  if (mime.startsWith('video/') || mime.startsWith('audio/')) return true;
  return VIDEO_AUDIO_EXTENSIONS.has(getFileExtension(driveFileName(file)));
}

function isPresentationLikeFile(file = {}) {
  const mime = driveMimeType(file).toLowerCase();
  if (mime === 'application/vnd.google-apps.presentation') return true;
  if (mime === 'application/vnd.ms-powerpoint') return true;
  if (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return true;
  return PRESENTATION_EXTENSIONS.has(getFileExtension(driveFileName(file)));
}

function isApprovedOneTimeDropoffFile(file = {}, fallbackFolderId = '') {
  if (isGoogleDriveFolder(file)) return false;
  const folder = oneTimeDropoffFolderForFile(file, fallbackFolderId);
  if (!folder) return false;
  if (folder.presentationOnly) return isPresentationLikeFile(file);
  return true;
}

function appendDriveResourceKey(url, explicitUrl = '') {
  const resourceKeyMatch = cleanText(explicitUrl).match(/[?&]resourcekey=([^&#]+)/i);
  if (!resourceKeyMatch) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}resourcekey=${resourceKeyMatch[1]}`;
}

function driveDropoffOpenUrl(file = {}) {
  const explicit = cleanText(file.webViewLink || file.web_view_link || file.media_url || file.url);
  const id = driveFileId(file);
  const exportInfo = GOOGLE_APP_EXPORTS.get(driveMimeType(file).toLowerCase());
  if (!id) return /^https?:\/\//i.test(explicit) ? explicit : '';
  if (exportInfo) {
    return `https://docs.google.com/${exportInfo.path}/d/${encodeURIComponent(id)}/edit`;
  }
  return appendDriveResourceKey(`https://drive.google.com/file/d/${encodeURIComponent(id)}/view`, explicit);
}

function driveDropoffDownloadUrl(file = {}) {
  const id = driveFileId(file);
  if (!id) return driveDropoffOpenUrl(file);
  const exportInfo = GOOGLE_APP_EXPORTS.get(driveMimeType(file).toLowerCase());
  if (exportInfo) {
    return `https://docs.google.com/${exportInfo.path}/d/${encodeURIComponent(id)}/${exportInfo.exportSuffix}`;
  }
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

function buildOneTimeDriveDropoffContentJobPayload(file = {}, options = {}) {
  const folder = oneTimeDropoffFolderForFile(file, options.folderId || options.drive_folder_id);
  if (!folder) {
    throw new Error('Drive file is not in an approved One Time dropoff folder.');
  }
  if (folder.presentationOnly && !isPresentationLikeFile(file)) {
    throw new Error('Only PowerPoint or Google Slides files are approved from the One Time content/media intake folder.');
  }
  const title = driveFileName(file);
  const id = driveFileId(file);
  const mime = driveMimeType(file);
  const openUrl = driveDropoffOpenUrl(file);
  const downloadUrl = driveDropoffDownloadUrl(file);
  const isPresentation = isPresentationLikeFile(file);
  const classification = folder.classification;

  return {
    project_key: ONE_TIME_DROPOFF_PROJECT_KEY,
    workspace_key: ONE_TIME_DROPOFF_WORKSPACE_KEY,
    title,
    status: options.status || 'needs_approval',
    source_type: 'google_drive',
    media_url: openUrl,
    drive_file_id: id,
    drive_folder_id: folder.id,
    drive_stage: folder.stage,
    mime_type: mime,
    caption: `Rabbi Drive dropoff received in ${folder.label}.`,
    notes: 'Original file is preserved in Google Drive; use the open/download links for review.',
    parse_json: {
      content_kind: isPresentation ? 'one_time_powerpoint_presentation' : 'one_time_drive_dropoff',
      drive_dropoff_email_intake: true,
      drive_dropoff_classification: classification,
      drive_dropoff_classification_label: folder.classificationLabel,
      watched_folder_id: folder.id,
      watched_folder_label: folder.label,
      source_drive_stage: folder.stage,
      preserve_original: true,
      email_notification_required: true,
      open_url: openUrl,
      download_url: downloadUrl,
      original_download_url: downloadUrl,
      source_file_id: id,
      source_file_name: title,
      source_mime_type: mime,
      source_created_time: cleanText(file.createdTime || file.created_time),
      source_modified_time: cleanText(file.modifiedTime || file.modified_time),
      source_size: cleanText(file.size),
      video_audio_for_transcription: classification === 'video_audio_for_transcription',
      source_material_intake: classification === 'slideshow_source_sheet_material',
      presentation_intake: isPresentation,
    },
  };
}

function escapeHtml(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildOneTimeDriveDropoffEmail(payload = {}, options = {}) {
  const parsed = payload.parse_json || {};
  const title = cleanText(payload.title || parsed.source_file_name) || 'Rabbi Drive dropoff file';
  const folderLabel = cleanText(parsed.watched_folder_label) || 'One Time Drive dropoff folder';
  const classificationLabel = cleanText(parsed.drive_dropoff_classification_label) || 'One Time Drive dropoff';
  const mime = cleanText(payload.mime_type || parsed.source_mime_type) || 'unknown';
  const openUrl = cleanText(parsed.open_url || payload.media_url);
  const downloadUrl = cleanText(parsed.download_url || parsed.original_download_url);
  const created = cleanText(parsed.source_created_time);
  const modified = cleanText(parsed.source_modified_time);
  const jobId = cleanText(options.jobId || options.job_id || payload.job_id || payload.id);
  const subject = `Rabbi Drive dropoff received: ${title}`;
  const text = [
    'Rabbi Sheller dropped off a file for the One Time class.',
    '',
    `File: ${title}`,
    `Watched folder: ${folderLabel}`,
    `Classification: ${classificationLabel}`,
    `File type: ${mime}`,
    created ? `Created: ${created}` : '',
    modified ? `Modified: ${modified}` : '',
    jobId ? `Internal reference: content job #${jobId}` : '',
    openUrl ? `Open in Drive: ${openUrl}` : '',
    downloadUrl ? `Download original file: ${downloadUrl}` : '',
  ].filter(Boolean).join('\n');
  const html = [
    '<p>Rabbi Sheller dropped off a file for the One Time class.</p>',
    '<ul>',
    `<li><strong>File:</strong> ${escapeHtml(title)}</li>`,
    `<li><strong>Watched folder:</strong> ${escapeHtml(folderLabel)}</li>`,
    `<li><strong>Classification:</strong> ${escapeHtml(classificationLabel)}</li>`,
    `<li><strong>File type:</strong> ${escapeHtml(mime)}</li>`,
    created ? `<li><strong>Created:</strong> ${escapeHtml(created)}</li>` : '',
    modified ? `<li><strong>Modified:</strong> ${escapeHtml(modified)}</li>` : '',
    jobId ? `<li><strong>Internal reference:</strong> content job #${escapeHtml(jobId)}</li>` : '',
    '</ul>',
    openUrl ? `<p><a href="${escapeHtml(openUrl)}">Open in Drive</a></p>` : '',
    downloadUrl ? `<p><a href="${escapeHtml(downloadUrl)}">Download original file</a></p>` : '',
  ].filter(Boolean).join('\n');
  return { subject, text, html };
}

function hasOneTimeDriveDropoffEmailSent(parseJson = {}) {
  const parsed = parseJson && typeof parseJson === 'object' ? parseJson : {};
  return Boolean(
    parsed.email_sent === true ||
    parsed.dropoff_email_notification?.sent === true ||
    parsed.presentation_email_notification?.sent === true ||
    parsed.drive_dropoff_email_sent === true
  );
}

module.exports = {
  ONE_TIME_DROPOFF_PROJECT_KEY,
  ONE_TIME_DROPOFF_WORKSPACE_KEY,
  ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID,
  ONE_TIME_VIDEO_DROP_FOLDER_ID,
  ONE_TIME_SOURCE_MATERIAL_FOLDER_ID,
  ONE_TIME_VIDEO_DROP_STAGE,
  ONE_TIME_SOURCE_MATERIAL_STAGE,
  ONE_TIME_DROPOFF_FOLDERS,
  VIDEO_AUDIO_EXTENSIONS,
  PRESENTATION_EXTENSIONS,
  oneTimeDropoffFolderById,
  oneTimeDropoffFolderForFile,
  isApprovedOneTimeDropoffFile,
  isVideoAudioFile,
  isPresentationLikeFile,
  driveDropoffOpenUrl,
  driveDropoffDownloadUrl,
  buildOneTimeDriveDropoffContentJobPayload,
  buildOneTimeDriveDropoffEmail,
  hasOneTimeDriveDropoffEmailSent,
};
