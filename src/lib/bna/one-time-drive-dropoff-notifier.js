const {
  GOOGLE_DRIVE_FOLDER_MIME,
  classifyDriveIntakeFile,
  driveFolderUrl,
  rabbiFacingDriveLinksFromMap,
} = require('./one-time-drive-intake-map');

const DEFAULT_NOTIFY_STATE_PATH = '.runtime/one-time-drive-dropoff-notifier/state.json';
const DEFAULT_POLL_MINUTES = 5;
const GOOGLE_APPS_MIME_PREFIX = 'application/vnd.google-apps.';

function normalizeFileBaseName(name = '') {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .replace(/\s+/g, ' ');
}

function isNativeGoogleFile(file = {}) {
  return String(file.mimeType || file.mime_type || '').startsWith(GOOGLE_APPS_MIME_PREFIX);
}

function isDriveFolder(file = {}) {
  return String(file.mimeType || file.mime_type || '') === GOOGLE_DRIVE_FOLDER_MIME;
}

function isDirectDownloadCandidate(file = {}) {
  return Boolean(file.id) && !isDriveFolder(file) && !isNativeGoogleFile(file);
}

function driveFileViewUrl(file = {}) {
  if (file.webViewLink) return file.webViewLink;
  if (file.web_view_link) return file.web_view_link;
  if (!file.id) return '';
  if (isDriveFolder(file)) return driveFolderUrl(file.id);
  return `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`;
}

function driveFileDownloadUrl(file = {}) {
  if (!isDirectDownloadCandidate(file)) return '';
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(file.id)}`;
}

function watchedDropoffLanesFromMap(map = {}) {
  return rabbiFacingDriveLinksFromMap(map).filter((lane) => (
    lane.key === 'videoDrop' || lane.key === 'sourceMaterials'
  )).map((lane) => ({
    key: lane.key,
    title: lane.title || lane.name || lane.target_title || lane.actual_title || '',
    actual_title: lane.actual_title || lane.actual_name || lane.title || '',
    id: lane.id || '',
    webViewLink: lane.webViewLink || driveFolderUrl(lane.id),
    purpose: lane.purpose || '',
    handling: lane.handling || '',
    lane_type: lane.lane_type || '',
    drive_stage: lane.drive_stage || '',
    triggers_transcription: Boolean(lane.triggers_transcription),
    source_material_only: Boolean(lane.source_material_only),
    rabbi_facing: Boolean(lane.rabbi_facing),
  }));
}

function newEmptyDropoffState() {
  return {
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: '',
    last_scan_at: '',
    seen_file_ids: {},
    send_log: [],
  };
}

function fileAlreadySeen(state = {}, file = {}) {
  return Boolean(file.id && state.seen_file_ids && state.seen_file_ids[file.id]);
}

function buildDropoffNotifications({ lanes = [], filesByLane = {}, state = {} } = {}) {
  const notifications = [];
  const seenUpdates = [];
  const suppressions = [];

  for (const lane of lanes) {
    const files = Array.isArray(filesByLane[lane.key]) ? filesByLane[lane.key] : [];
    const filesByBaseName = new Map();

    for (const file of files) {
      const baseName = normalizeFileBaseName(file.name || file.title || '');
      if (!filesByBaseName.has(baseName)) filesByBaseName.set(baseName, []);
      filesByBaseName.get(baseName).push(file);
    }

    for (const file of files) {
      if (!file.id || fileAlreadySeen(state, file)) continue;

      const baseName = normalizeFileBaseName(file.name || file.title || '');
      const sameBaseFiles = filesByBaseName.get(baseName) || [];
      const sameBaseHasDownloadableOriginal = sameBaseFiles.some(isDirectDownloadCandidate);
      const classification = classifyDriveIntakeFile(file, { id: lane.id, name: lane.title });
      const viewUrl = driveFileViewUrl(file);
      const downloadUrl = driveFileDownloadUrl(file);

      seenUpdates.push({
        id: file.id,
        lane_key: lane.key,
        lane_title: lane.title,
        name: file.name || file.title || '',
        mimeType: file.mimeType || file.mime_type || '',
        createdTime: file.createdTime || file.created_time || '',
        modifiedTime: file.modifiedTime || file.modified_time || '',
        first_seen_at: new Date().toISOString(),
        notified: false,
      });

      if (isNativeGoogleFile(file) && sameBaseHasDownloadableOriginal) {
        suppressions.push({
          id: file.id,
          lane_key: lane.key,
          name: file.name || file.title || '',
          reason: 'native_google_conversion_suppressed_because_original_downloadable_file_exists',
        });
        continue;
      }

      notifications.push({
        lane_key: lane.key,
        lane_title: lane.title,
        lane_url: lane.webViewLink,
        lane_type: lane.lane_type,
        triggers_transcription: lane.triggers_transcription,
        source_material_only: lane.source_material_only,
        file_id: file.id,
        file_name: file.name || file.title || '',
        mimeType: file.mimeType || file.mime_type || '',
        size: file.size || '',
        createdTime: file.createdTime || file.created_time || '',
        modifiedTime: file.modifiedTime || file.modified_time || '',
        view_url: viewUrl,
        download_url: downloadUrl,
        direct_download_available: Boolean(downloadUrl),
        native_google_file: isNativeGoogleFile(file),
        route: classification.route,
        source_type: classification.source_type,
        eligible_for_transcription: classification.eligible_for_transcription,
        no_transcription_required: classification.no_transcription_required,
        index_only_until_review: classification.index_only_until_review,
        next_action: classification.next_action,
      });
    }
  }

  return { notifications, seenUpdates, suppressions };
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let amount = bytes;
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }
  return `${amount.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function buildDropoffEmail({ notifications = [], scannedAt = new Date().toISOString() } = {}) {
  const count = notifications.length;
  const subject = count === 1
    ? `New Rabbi Drive upload: ${notifications[0].file_name}`
    : `New Rabbi Drive uploads: ${count} files`;

  const lines = [
    'A new file was added to one of the Rabbi-facing Drive drop-off folders.',
    '',
    `Checked: ${scannedAt}`,
    '',
  ];

  for (const notification of notifications) {
    lines.push(`File: ${notification.file_name}`);
    lines.push(`Folder: ${notification.lane_title}`);
    if (notification.size) lines.push(`Size: ${formatBytes(notification.size)}`);
    lines.push(`Route: ${notification.route}`);
    lines.push(`Open in Drive: ${notification.view_url}`);
    if (notification.download_url) {
      lines.push(`Download original file: ${notification.download_url}`);
    } else {
      lines.push('Download original file: not available for this native Google file; use the Drive link above.');
    }
    if (notification.source_material_only) {
      lines.push('Handling: source material only; no transcription starts from this folder.');
    } else if (notification.triggers_transcription) {
      lines.push('Handling: media/transcription intake; no public publish/send happens automatically.');
    }
    if (/presentation|powerpoint|slideshow/i.test(`${notification.mimeType} ${notification.file_name}`)) {
      lines.push('Note: for embedded PowerPoint videos, download/open the original .pptx in desktop PowerPoint.');
    }
    lines.push('');
  }

  lines.push('This notification does not publish, transcribe, send to students, or change any production data.');

  return {
    subject,
    text: lines.join('\n'),
  };
}

module.exports = {
  DEFAULT_NOTIFY_STATE_PATH,
  DEFAULT_POLL_MINUTES,
  buildDropoffEmail,
  buildDropoffNotifications,
  driveFileDownloadUrl,
  driveFileViewUrl,
  fileAlreadySeen,
  formatBytes,
  isDirectDownloadCandidate,
  isNativeGoogleFile,
  newEmptyDropoffState,
  normalizeFileBaseName,
  watchedDropoffLanesFromMap,
};
