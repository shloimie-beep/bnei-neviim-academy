'use strict';

const ONE_TIME_PRESENTATION_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_PRESENTATION_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PRESENTATION_DRIVE_STAGE = 'one_time_presentation_source_material';
const ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID = '15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp';
const ONE_TIME_CONTENT_MEDIA_FOLDER_ID = '1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv';

const ONE_TIME_PRESENTATION_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.google-apps.presentation',
]);

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

function isOneTimePresentationFile(file = {}) {
  const mimeType = cleanText(file.mimeType || file.mime_type).toLowerCase();
  if (ONE_TIME_PRESENTATION_MIME_TYPES.has(mimeType)) return true;
  return PRESENTATION_EXTENSIONS.has(getFileExtension(file.name || file.title || file.filename));
}

function appendDriveResourceKey(url, explicitUrl = '') {
  const resourceKeyMatch = cleanText(explicitUrl).match(/[?&]resourcekey=([^&#]+)/i);
  if (!resourceKeyMatch) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}resourcekey=${resourceKeyMatch[1]}`;
}

function drivePresentationOpenUrl(file = {}) {
  const explicit = cleanText(file.webViewLink || file.web_view_link || file.media_url || file.url);
  const id = cleanText(file.id || file.drive_file_id);
  const mimeType = cleanText(file.mimeType || file.mime_type).toLowerCase();
  if (!id) return /^https?:\/\//i.test(explicit) ? explicit : '';
  if (mimeType === 'application/vnd.google-apps.presentation') {
    return `https://docs.google.com/presentation/d/${encodeURIComponent(id)}/edit`;
  }
  return appendDriveResourceKey(`https://drive.google.com/file/d/${encodeURIComponent(id)}/view`, explicit);
}

function drivePresentationDownloadUrl(file = {}) {
  const id = cleanText(file.id || file.drive_file_id);
  if (!id) return drivePresentationOpenUrl(file);
  const mimeType = cleanText(file.mimeType || file.mime_type).toLowerCase();
  if (mimeType === 'application/vnd.google-apps.presentation') {
    return `https://docs.google.com/presentation/d/${encodeURIComponent(id)}/export/pptx`;
  }
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

function getParentFolderId(file = {}, fallbackFolderId = '') {
  if (fallbackFolderId) return fallbackFolderId;
  if (Array.isArray(file.parents) && file.parents.length) return cleanText(file.parents[0]);
  return cleanText(file.drive_folder_id || file.folder_id);
}

function buildOneTimePresentationContentJobPayload(file = {}, options = {}) {
  const title = cleanText(file.name || file.title || file.filename) || 'Rabbi PowerPoint presentation';
  const driveFileId = cleanText(file.id || file.drive_file_id);
  const mimeType = cleanText(file.mimeType || file.mime_type);
  const folderId = getParentFolderId(file, options.folderId || options.drive_folder_id);
  const openUrl = drivePresentationOpenUrl(file);
  const downloadUrl = drivePresentationDownloadUrl(file);
  const stage = options.driveStage || ONE_TIME_PRESENTATION_DRIVE_STAGE;

  return {
    project_key: ONE_TIME_PRESENTATION_PROJECT_KEY,
    workspace_key: ONE_TIME_PRESENTATION_WORKSPACE_KEY,
    title,
    status: options.status || 'needs_approval',
    source_type: 'google_drive',
    media_url: openUrl,
    drive_file_id: driveFileId,
    drive_folder_id: folderId,
    drive_stage: stage,
    mime_type: mimeType,
    caption: 'Rabbi PowerPoint presentation received. Preserved for Shloimie review and download.',
    notes: 'Original presentation is preserved in Google Drive; use the open/download links for review.',
    parse_json: {
      content_kind: 'one_time_powerpoint_presentation',
      presentation_intake: true,
      preserve_original: true,
      email_notification_required: true,
      open_url: openUrl,
      download_url: downloadUrl,
      source_folder_id: folderId,
      source_drive_stage: stage,
      source_file_id: driveFileId,
      source_file_name: title,
      source_mime_type: mimeType,
      source_created_time: cleanText(file.createdTime || file.created_time),
      source_modified_time: cleanText(file.modifiedTime || file.modified_time),
      source_size: cleanText(file.size),
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

function buildOneTimePresentationEmail(fileOrPayload = {}, options = {}) {
  const file = fileOrPayload.parse_json ? {
    id: fileOrPayload.drive_file_id,
    name: fileOrPayload.title,
    mimeType: fileOrPayload.mime_type,
    webViewLink: fileOrPayload.media_url,
  } : fileOrPayload;
  const payload = fileOrPayload.parse_json
    ? fileOrPayload
    : buildOneTimePresentationContentJobPayload(file, options);
  const title = cleanText(payload.title || file.name || file.title) || 'Rabbi PowerPoint presentation';
  const openUrl = cleanText(payload.parse_json?.open_url || payload.media_url || drivePresentationOpenUrl(file));
  const downloadUrl = cleanText(payload.parse_json?.download_url || drivePresentationDownloadUrl(file));
  const subject = `Rabbi sent a PowerPoint presentation: ${title}`;
  const text = [
    `Rabbi sent a PowerPoint presentation: ${title}`,
    '',
    openUrl ? `Open presentation: ${openUrl}` : '',
    downloadUrl ? `Download presentation: ${downloadUrl}` : '',
    '',
    'The original presentation is preserved in the One Time class Google Drive intake folder.',
  ].filter((line) => line !== '').join('\n');
  const html = [
    `<p>Rabbi sent a PowerPoint presentation: <strong>${escapeHtml(title)}</strong></p>`,
    openUrl ? `<p><a href="${escapeHtml(openUrl)}">Open presentation</a></p>` : '',
    downloadUrl ? `<p><a href="${escapeHtml(downloadUrl)}">Download presentation</a></p>` : '',
    '<p>The original presentation is preserved in the One Time class Google Drive intake folder.</p>',
  ].filter(Boolean).join('\n');
  return { subject, text, html };
}

module.exports = {
  ONE_TIME_PRESENTATION_PROJECT_KEY,
  ONE_TIME_PRESENTATION_WORKSPACE_KEY,
  ONE_TIME_PRESENTATION_DRIVE_STAGE,
  ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID,
  ONE_TIME_CONTENT_MEDIA_FOLDER_ID,
  ONE_TIME_PRESENTATION_MIME_TYPES,
  PRESENTATION_EXTENSIONS,
  isOneTimePresentationFile,
  drivePresentationOpenUrl,
  drivePresentationDownloadUrl,
  buildOneTimePresentationContentJobPayload,
  buildOneTimePresentationEmail,
};
