const crypto = require('crypto');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_PROJECT_ROOT_ID = '16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2';
const ONE_TIME_CONTENT_MEDIA_PARENT_ID = '1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv';
const GOOGLE_DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';

const ONE_TIME_CONTENT_MEDIA_INTAKE_LANES = [
  {
    key: 'videoDrop',
    canonical_key: 'videos_audio_transcription_upload',
    name: '04.00 Upload Here - Videos and Audio for Transcription',
    previous_names: ['04.00 Upload Here - Rabbi Video Drops'],
    drive_stage: 'one_time_video_drop',
    purpose: 'Rabbi class videos, shiur audio, meeting recordings, and any media that should become transcript, parse, or content candidates.',
    handling: 'automation/transcription intake; can create content jobs; still no publish/send without approval.',
    backend_use: 'bna_content_jobs.project_id=one_time_mishnah_class, source_type=google_drive, drive_stage=one_time_video_drop',
    intended_audience: 'rabbi_facing',
    lane_type: 'transcription',
    rabbi_facing: true,
    super_admin_visible: true,
    triggers_transcription: true,
    source_material_only: false,
    copy_label: 'Send this link for videos/audio',
  },
  {
    key: 'sourceMaterials',
    canonical_key: 'slideshows_source_materials_upload',
    name: '04.05 Upload Here - Slideshows and Source Materials',
    previous_names: [],
    drive_stage: 'one_time_source_material_upload',
    purpose: 'PowerPoints, Google Slides, PDFs, worksheets, source sheets, handouts, and classroom materials that do not need transcription.',
    handling: 'source_material / slideshow_reference; no transcription; index only until reviewed.',
    backend_use: 'bna_content_jobs.source_type=google_drive_source_material, drive_stage=one_time_source_material_upload, eligible_for_transcription=false',
    intended_audience: 'rabbi_facing',
    lane_type: 'source_material',
    rabbi_facing: true,
    super_admin_visible: true,
    triggers_transcription: false,
    source_material_only: true,
    copy_label: 'Send this link for slideshows/source sheets/materials',
  },
  {
    key: 'ingestionQueue',
    canonical_key: 'ingestion_queue_transcribe_parse',
    name: '04.10 Ingestion Queue - Transcribe and Parse',
    previous_names: [],
    drive_stage: 'one_time_ingestion_queue',
    purpose: 'Files/jobs actively being processed into transcripts, source notes, clip plans, and content jobs.',
    handling: 'internal workflow queue; not the main Rabbi-facing drop-off folder unless intentionally used.',
    backend_use: 'bna_content_jobs.status=ingested|parsed with Drive file/folder IDs preserved',
    intended_audience: 'internal',
    lane_type: 'transcription_queue',
    rabbi_facing: false,
    super_admin_visible: true,
    triggers_transcription: true,
    source_material_only: false,
  },
  {
    key: 'sourceMaterialReview',
    canonical_key: 'source_material_review',
    name: '04.20 Source Material Review',
    previous_names: [],
    drive_stage: 'one_time_source_material_review',
    purpose: 'Reviewed or queued slide/source-material references, source sheets, and worksheet review.',
    handling: 'review lane only; no automatic public/member output.',
    backend_use: 'bna_content_outputs output_type=source_material_review before member-visible or newsletter use',
    intended_audience: 'super_admin_only',
    lane_type: 'source_material_review',
    rabbi_facing: false,
    super_admin_visible: true,
    triggers_transcription: false,
    source_material_only: true,
  },
  {
    key: 'socialOutputs',
    canonical_key: 'social_newsletter_output_drafts',
    name: '04.30 Social and Newsletter Output Drafts - Platform Review',
    previous_names: ['04.30 Social Output Drafts - Platform Review'],
    drive_stage: 'one_time_social_output_review',
    purpose: 'Facebook, LinkedIn, YouTube, Instagram, WhatsApp, newsletter, and email drafts awaiting platform review.',
    handling: 'no sends or publishes without explicit approval.',
    backend_use: 'bna_content_outputs output_type/platform metadata before any Buffer or platform write',
    intended_audience: 'internal',
    lane_type: 'review_output',
    rabbi_facing: false,
    super_admin_visible: true,
    triggers_transcription: false,
    source_material_only: false,
  },
  {
    key: 'approvedPosted',
    canonical_key: 'approved_and_posted_outputs',
    name: '04.90 Approved and Posted Outputs',
    previous_names: ['04.90 Approved and Posted Social Outputs'],
    drive_stage: 'one_time_social_approved_posted',
    purpose: 'Approved exports, destination URLs, screenshots, posted/published evidence, metrics, and rollback notes.',
    handling: 'archive/evidence only.',
    backend_use: 'Buffer/social destination evidence and Workflow Q/R reporting after approval',
    intended_audience: 'archive',
    lane_type: 'approved_archive',
    rabbi_facing: false,
    super_admin_visible: true,
    triggers_transcription: false,
    source_material_only: false,
  },
  {
    key: 'needsDecision',
    canonical_key: 'needs_shloimie_decision',
    name: '04.99 Needs Shloimie Decision',
    previous_names: [],
    drive_stage: 'one_time_needs_shloimie_decision',
    purpose: 'Ambiguous files, wrong-lane uploads, permissions/conflict issues, and files needing operator routing.',
    handling: 'no automation until resolved.',
    backend_use: 'operator decision queue; do not transcribe, publish, send, or create member-visible output',
    intended_audience: 'super_admin_only',
    lane_type: 'decision_queue',
    rabbi_facing: false,
    super_admin_visible: true,
    triggers_transcription: false,
    source_material_only: false,
  },
];

function normalizeDriveName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function driveFolderUrl(id) {
  return id ? `https://drive.google.com/drive/folders/${id}` : '';
}

function stableHash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function laneNameMatches(definition, name) {
  const normalized = normalizeDriveName(name);
  if (!definition || !normalized) return false;
  return [definition.name].concat(definition.previous_names || []).some((candidate) => normalizeDriveName(candidate) === normalized);
}

function findLaneDefinition(value) {
  const key = String(value?.key || value || '');
  const name = String(value?.name || '');
  return ONE_TIME_CONTENT_MEDIA_INTAKE_LANES.find((lane) => (
    lane.key === key
    || lane.canonical_key === key
    || lane.drive_stage === key
    || laneNameMatches(lane, name || key)
  )) || null;
}

function mergeLaneWithDefinition(lane = {}, definition = findLaneDefinition(lane) || {}) {
  const actualName = lane.actual_name || lane.actualName || lane.name || definition.name || lane.key || 'Drive folder';
  const isAlias = Boolean(definition.name && actualName !== definition.name && laneNameMatches(definition, actualName));
  return {
    ...definition,
    ...lane,
    key: definition.key || lane.key,
    canonical_key: definition.canonical_key || lane.canonical_key || lane.key,
    target_name: definition.name || actualName,
    actual_name: actualName,
    name: definition.name || actualName,
    previous_names: definition.previous_names || lane.previous_names || [],
    webViewLink: lane.webViewLink || lane.web_view_link || driveFolderUrl(lane.id),
    status: lane.status || (lane.id ? (isAlias ? 'reused_semantic_alias' : 'reused_exact') : 'missing'),
    title_mismatch: Boolean(isAlias),
  };
}

function completeLanesFromMap(map = {}) {
  const existing = Array.isArray(map.lanes) ? map.lanes : [];
  return ONE_TIME_CONTENT_MEDIA_INTAKE_LANES.map((definition) => {
    const found = existing.find((lane) => findLaneDefinition(lane)?.key === definition.key);
    return mergeLaneWithDefinition(found || {}, definition);
  });
}

function folderLinkView(folder = {}, extra = {}) {
  return {
    key: folder.key || extra.key || '',
    title: folder.name || folder.title || extra.title || '',
    actual_title: folder.actual_name || folder.actual_title || folder.name || '',
    target_title: folder.target_name || folder.target_title || folder.name || '',
    purpose: folder.purpose || extra.purpose || '',
    handling: folder.handling || extra.handling || '',
    intended_audience: folder.intended_audience || extra.intended_audience || 'super_admin_only',
    lane_type: folder.lane_type || extra.lane_type || '',
    drive_stage: folder.drive_stage || folder.driveStage || extra.drive_stage || '',
    id: folder.id || '',
    parent_id: folder.parent_id || folder.parentId || extra.parent_id || '',
    webViewLink: folder.webViewLink || folder.web_view_link || driveFolderUrl(folder.id),
    status: folder.status || (folder.id ? 'mapped' : 'missing'),
    created: Boolean(folder.created),
    reused: Boolean(folder.reused || (folder.id && !folder.created)),
    triggers_transcription: Boolean(folder.triggers_transcription),
    source_material_only: Boolean(folder.source_material_only),
    rabbi_facing: Boolean(folder.rabbi_facing),
    super_admin_visible: folder.super_admin_visible !== false,
    copy_label: folder.copy_label || '',
  };
}

function driveFolderLinksFromMap(map = {}) {
  const root = map.root || {};
  const content = map.content_media_folder || {};
  const lanes = completeLanesFromMap(map);
  return [
    folderLinkView({
      key: 'projectRoot',
      name: root.name || 'One Time Mishnah Class - Rabbi Elie Scheller',
      purpose: 'Project root folder for the One Time Mishnah Class workspace.',
      intended_audience: 'super_admin_only',
      lane_type: 'project_root',
      id: root.id || ONE_TIME_PROJECT_ROOT_ID,
      webViewLink: root.webViewLink || driveFolderUrl(root.id || ONE_TIME_PROJECT_ROOT_ID),
      status: root.id ? 'mapped' : 'fallback',
      super_admin_visible: true,
    }),
    folderLinkView({
      key: 'contentMedia',
      name: content.name || '04 Content and Media Intake',
      purpose: 'Parent folder for Rabbi content/media intake, source material, draft review, archive, and decision queues.',
      intended_audience: 'super_admin_only',
      lane_type: 'parent',
      id: content.id || ONE_TIME_CONTENT_MEDIA_PARENT_ID,
      webViewLink: content.webViewLink || driveFolderUrl(content.id || ONE_TIME_CONTENT_MEDIA_PARENT_ID),
      status: content.id ? 'mapped' : 'fallback',
      super_admin_visible: true,
    }),
    ...lanes.map((lane) => folderLinkView(lane, { parent_id: content.id || ONE_TIME_CONTENT_MEDIA_PARENT_ID })),
  ];
}

function rabbiFacingDriveLinksFromMap(map = {}) {
  return driveFolderLinksFromMap(map).filter((folder) => folder.rabbi_facing);
}

function fileExtension(name = '') {
  const match = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

function classifyDriveIntakeFile(file = {}, parent = {}) {
  const name = String(file.name || file.title || '');
  const mimeType = String(file.mimeType || file.mime_type || '');
  const extension = fileExtension(name);
  const lowerName = name.toLowerCase();
  const parentName = String(parent.name || parent.title || '').toLowerCase();
  const parentId = parent.id || file.parent_id || '';
  const isParentFolder = file.id && file.id === ONE_TIME_CONTENT_MEDIA_PARENT_ID;
  const base = {
    id_hash: stableHash(file.id || `${name}:${mimeType}`),
    name,
    mimeType,
    extension,
    parent_id_hash: parentId ? stableHash(parentId) : '',
    eligible_for_transcription: false,
    eligible_for_content_generation: false,
    no_transcription_required: true,
    index_only_until_review: false,
    automation_allowed: false,
    no_publish_or_send_without_approval: true,
  };

  if (mimeType === GOOGLE_DRIVE_FOLDER_MIME || isParentFolder) {
    return {
      ...base,
      route: 'folder_index',
      source_type: 'folder_reference',
      next_action: 'Index child files by lane; do not auto-transcribe the broad parent folder.',
    };
  }

  const isAudio = mimeType.startsWith('audio/') || ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'].includes(extension);
  const isVideo = mimeType.startsWith('video/') || ['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv'].includes(extension);
  if (isAudio || isVideo) {
    const meetingTerms = /meeting|zoom|planning|call/.test(lowerName);
    const shiurTerms = /shiur|class|mishnah|mishna|mishnayos|rabbi|recording/.test(lowerName);
    return {
      ...base,
      route: 'transcription_intake',
      source_type: meetingTerms ? 'meeting_drop' : (shiurTerms ? 'shiur_recording' : 'recording'),
      eligible_for_transcription: true,
      eligible_for_content_generation: 'after_transcript_parse_review',
      no_transcription_required: false,
      automation_allowed: true,
      next_action: 'Create or match a scoped One Time content job, then transcribe/parse only after normal approval gates.',
    };
  }

  const isPresentation = mimeType === 'application/vnd.google-apps.presentation'
    || mimeType === 'application/vnd.ms-powerpoint'
    || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    || ['ppt', 'pptx', 'pps', 'ppsx', 'key'].includes(extension);
  if (isPresentation) {
    return {
      ...base,
      route: 'slideshow/source-material',
      source_type: 'slideshow_reference',
      secondary_source_type: 'source_material',
      eligible_for_content_generation: 'review_required',
      index_only_until_review: true,
      next_action: 'Classify as source material; attach to topic/class/session only after review; do not transcribe.',
    };
  }

  const isPdfOrSource = mimeType === 'application/pdf'
    || extension === 'pdf'
    || /source sheet|sourcesheet|worksheet|handout|mareh|mekor/i.test(name)
    || /source|worksheet|handout/.test(parentName);
  if (isPdfOrSource) {
    return {
      ...base,
      route: 'source-material',
      source_type: /worksheet/i.test(name) ? 'worksheet' : (/handout/i.test(name) ? 'handout' : 'source_sheet'),
      eligible_for_content_generation: 'review_required',
      index_only_until_review: true,
      next_action: 'Index as source material and wait for Rabbi/Shloimie review before newsletter/member/social use.',
    };
  }

  if (mimeType === 'application/vnd.google-apps.document'
    || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || ['doc', 'docx', 'txt'].includes(extension)) {
    const route = /draft|caption|newsletter|social|email|whatsapp/.test(lowerName)
      ? 'draft_output'
      : (/meeting|notes|minutes/.test(lowerName) ? 'meeting_notes' : (/source|worksheet|handout/.test(lowerName) ? 'source_material' : 'needs_review'));
    return {
      ...base,
      route,
      source_type: route,
      eligible_for_content_generation: route === 'source_material' ? 'review_required' : false,
      index_only_until_review: true,
      next_action: route === 'needs_review' ? 'Send to Needs Shloimie Decision before automation.' : 'Index metadata only and wait for review.',
    };
  }

  return {
    ...base,
    route: 'needs Shloimie decision',
    source_type: 'unknown',
    index_only_until_review: true,
    next_action: 'Place in decision queue; no transcription, content generation, publish, or send until routed.',
  };
}

function sanitizeDriveFileMetadata(file = {}, classification = classifyDriveIntakeFile(file), parent = {}) {
  return {
    id_hash: stableHash(file.id || file.name || ''),
    name: file.name || '',
    mimeType: file.mimeType || '',
    modifiedTime: file.modifiedTime || '',
    createdTime: file.createdTime || '',
    parent_id_hash: parent.id ? stableHash(parent.id) : '',
    route: classification.route,
    source_type: classification.source_type,
    secondary_source_type: classification.secondary_source_type || '',
    eligible_for_transcription: classification.eligible_for_transcription,
    eligible_for_content_generation: classification.eligible_for_content_generation,
    no_transcription_required: classification.no_transcription_required,
    index_only_until_review: classification.index_only_until_review,
    next_action: classification.next_action,
  };
}

module.exports = {
  GOOGLE_DRIVE_FOLDER_MIME,
  ONE_TIME_CONTENT_MEDIA_INTAKE_LANES,
  ONE_TIME_CONTENT_MEDIA_PARENT_ID,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_PROJECT_ROOT_ID,
  ONE_TIME_WORKSPACE_KEY,
  classifyDriveIntakeFile,
  completeLanesFromMap,
  driveFolderLinksFromMap,
  driveFolderUrl,
  findLaneDefinition,
  folderLinkView,
  laneNameMatches,
  normalizeDriveName,
  rabbiFacingDriveLinksFromMap,
  sanitizeDriveFileMetadata,
  stableHash,
};
