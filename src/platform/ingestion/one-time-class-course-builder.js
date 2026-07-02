const { buildPlatformContext, fail, ok, stableId, unwrap } = require('../core');
const {
  attachVideoToLesson,
  createCourse,
  createCourseModule,
  createLesson,
  createVideoAssetReference,
} = require('../courses');
const {
  ONE_TIME_CANONICAL_INGESTION_FLOW,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeClassIngestionContract,
} = require('../instances/one-time');
const { compactWhitespace, titleFromActionText } = require('../../lib/bna/task-shaping');
const { parsePlatformIntake } = require('./canonical-parser');
const { createIntakeSourceRecord } = require('./intake-source');

const ONE_TIME_CLASS_COURSE_BUILDER_VERSION = 'one-time-class-course-builder-v1';

function normalizedRawText(input = {}) {
  return compactWhitespace(
    input.raw_text ||
    input.rawText ||
    input.raw_input ||
    input.text ||
    input.transcript_text ||
    input.transcriptText ||
    ''
  );
}

function labeledValue(text = '', labels = []) {
  const joined = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const match = String(text || '').match(new RegExp(`\\b(?:${joined})\\s*[:=-]\\s*([^.;\\n]+)`, 'i'));
  return match ? compactWhitespace(match[1]) : '';
}

function extractCourseTitle(text = '') {
  return labeledValue(text, ['course', 'class', 'program'])
    || (/\bcreate\s+(?:a\s+)?new\s+course\b/i.test(text) ? 'One Time Mishnah Course Draft' : '')
    || 'One Time Mishnah Class Draft';
}

function extractModuleInfo(text = '') {
  const labeled = labeledValue(text, ['module', 'unit']);
  const moduleMatch = String(text || '').match(/\b(?:use\s+this\s+as\s+)?module\s*(\d+)?(?:\s*[:=-])?\s*([^.;\n]*)/i);
  const number = moduleMatch?.[1] ? Number(moduleMatch[1]) : null;
  const title = labeled
    || compactWhitespace(moduleMatch?.[2] || '')
    || (number ? `Module ${number}` : 'Intake Draft Module');
  return {
    title,
    number,
    sort_order: number ? number * 100 : 100,
  };
}

function extractLessonTitle(text = '') {
  return labeledValue(text, ['lesson'])
    || (/\bnext\s+lesson\b/i.test(text) ? titleFromActionText(text, 'Next One Time lesson draft') : '')
    || 'One Time Lesson Draft';
}

function detectSourceType(text = '', input = {}) {
  const explicit = String(input.source_type || input.sourceType || '').toLowerCase();
  const value = `${explicit} ${text}`.toLowerCase();
  if (/\bzoom\b/.test(value)) return 'zoom_recording';
  if (/\bvimeo\b/.test(value)) return 'vimeo_asset';
  if (/\b(drop[-\s]?folder|approved folder|local folder|uploaded video|video file)\b/.test(value)) {
    return 'approved_drop_folder_video';
  }
  if (/\b(transcript|class notes|shiur|lesson)\b/.test(value)) return 'transcript_only';
  return 'operator_text';
}

function providerForSource(sourceType = '') {
  if (sourceType === 'zoom_recording') return 'zoom';
  if (sourceType === 'vimeo_asset') return 'vimeo';
  if (sourceType === 'approved_drop_folder_video') return 'drop_folder';
  return 'local_preview';
}

function extractTopics(text = '') {
  const matches = String(text || '').match(/\b(?:mishnah|mishna|mishnayos|gemara|berachos|brachos|pirkei avos|perek|pasuk|rashi)\b[^.;,\n]*/gi) || [];
  return [...new Set(matches.map(compactWhitespace).filter(Boolean))].slice(0, 8);
}

function includesCue(text = '', pattern) {
  return pattern.test(String(text || ''));
}

function provenance(base = {}, title = '') {
  return {
    raw_id: base.raw_id,
    source_id: base.source_id,
    source_fingerprint: base.source_fingerprint,
    source_excerpt: compactWhitespace(base.raw_text).slice(0, 360),
    source_title: title || null,
  };
}

function draftItem(type, title, base = {}, fields = {}) {
  const itemTitle = compactWhitespace(title);
  return {
    item_id: stableId(type.toUpperCase(), [base.source_fingerprint, itemTitle, fields.reason || fields.target_lane || '']),
    item_type: type,
    title: itemTitle,
    status: fields.status || 'draft',
    confidence: fields.confidence || 'medium',
    confidence_score: Number(fields.confidence_score || 0.74),
    target_lane: fields.target_lane || 'Review',
    next_action: fields.next_action || null,
    reason: fields.reason || null,
    provenance: provenance(base, itemTitle),
    metadata: fields.metadata || {},
  };
}

function buildLocalAdminContext(options = {}) {
  const workspaceId = options.workspace_id || 'workspace-one-time-local-beta';
  return buildPlatformContext({
    instance: { id: options.instance_id || 'instance-bna-platform', slug: 'bna-platform' },
    organization: { id: 'org-bna', slug: 'bna' },
    workspace: {
      id: workspaceId,
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
    },
    actor: {
      id: options.actor_id || 'one-time-local-ingestion-admin',
      person_id: options.person_id || 'person-one-time-local-ingestion-admin',
      role: 'workspace_admin',
    },
    memberships: [{
      actor_id: options.actor_id || 'one-time-local-ingestion-admin',
      instance_id: options.instance_id || 'instance-bna-platform',
      workspace_id: workspaceId,
      role: 'workspace_admin',
      status: 'active',
    }],
  });
}

function flowCoverage({ sourceType, hasTranscript, hasAttendance, hasWorksheet, hasParentUpdate, hasStudentUpdate, publishRequested, holdPublish }) {
  const coverage = {};
  for (const stage of ONE_TIME_CANONICAL_INGESTION_FLOW) coverage[stage] = 'not_applicable';
  coverage.source_fingerprint = 'drafted';
  coverage.transcript = hasTranscript ? 'drafted' : 'review_required';
  coverage.speaker_participant_mapping = 'review_required';
  coverage.class_session = 'drafted';
  coverage.attendance_minutes = hasAttendance ? 'drafted' : 'review_required';
  coverage.class_summary = 'drafted';
  coverage.topics_questions_answers = 'drafted';
  coverage.course_lesson_placement = 'drafted';
  coverage.video_reference = ['zoom_recording', 'vimeo_asset', 'approved_drop_folder_video'].includes(sourceType) ? 'drafted' : 'review_required';
  coverage.worksheet_resource_suggestions = hasWorksheet ? 'drafted' : 'optional';
  coverage.role_scoped_updates = hasParentUpdate || hasStudentUpdate ? 'drafted_pending_approval' : 'optional';
  coverage.approval = publishRequested ? 'operator_decision_required' : 'draft_review_required';
  coverage.publish = holdPublish || !publishRequested ? 'blocked_or_not_requested' : 'blocked_until_approval';
  return coverage;
}

function buildOneTimeClassCourseIngestionPreview(input = {}, options = {}) {
  const rawText = normalizedRawText(input);
  if (!rawText) return fail('missing_raw_text', 'raw_text, text, or transcript_text is required.', {}, 400);

  const source = createIntakeSourceRecord({
    ...input,
    raw_text: input.raw_text || input.rawText || input.raw_input || input.text || '',
    transcript_text: input.transcript_text || input.transcriptText || '',
    source_provider: input.source_provider || input.sourceProvider || input.source_channel || input.sourceChannel || 'manual',
    workspace: ONE_TIME_WORKSPACE_KEY,
  });
  const rawId = input.raw_id || input.rawId || null;
  const base = {
    raw_id: rawId,
    source_id: source.stable_key,
    source_fingerprint: source.fingerprint,
    raw_text: rawText,
  };
  const parsed = parsePlatformIntake({
    raw_text: rawText,
    raw_id: rawId,
    source_id: source.stable_key,
    source_provider: source.source_provider,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    existing_records: input.existing_records || input.existingRecords || [],
  });

  const sourceType = detectSourceType(rawText, input);
  const hasTranscript = Boolean(source.has_transcript || /\b(transcript|class notes|summary|learned|lesson)\b/i.test(rawText));
  const hasAttendance = /\b(attendance|present|absent|late|minutes?|joined|no[-\s]?show)\b/i.test(rawText);
  const hasWorksheet = /\b(worksheet|source[-\s]?sheet|materials?|resource|handout)\b/i.test(rawText);
  const hasParentUpdate = /\b(parent|parents|guardian|family|families)\b/i.test(rawText) && /\b(update|summary|publish|message|progress)\b/i.test(rawText);
  const hasStudentUpdate = /\b(student|students|progress|completion|each student)\b/i.test(rawText);
  const publishRequested = includesCue(rawText, /\b(publish|send|message|notify|post)\b/i);
  const holdPublish = includesCue(rawText, /\b(do not publish|don't publish|do not send|don't send|not yet|draft only)\b/i);
  const courseTitle = extractCourseTitle(rawText);
  const moduleInfo = extractModuleInfo(rawText);
  const lessonTitle = extractLessonTitle(rawText);
  const topics = extractTopics(rawText);
  const context = options.context || buildLocalAdminContext(options);

  let course;
  let moduleRecord;
  let lesson;
  let videoReference = null;
  let lessonVideo = null;
  try {
    course = unwrap(createCourse(context, {
      title: courseTitle,
      visibility: 'workspace',
      status: 'draft',
      metadata: {
        project_key: ONE_TIME_PROJECT_KEY,
        source_fingerprint: source.fingerprint,
        preview_only: true,
      },
    }));
    moduleRecord = unwrap(createCourseModule(context, course, {
      title: moduleInfo.title,
      sort_order: moduleInfo.sort_order,
      status: 'draft',
      metadata: {
        source_fingerprint: source.fingerprint,
        module_number: moduleInfo.number,
      },
    }));
    lesson = unwrap(createLesson(context, moduleRecord, {
      title: lessonTitle,
      summary: topics.length ? `Topics: ${topics.join('; ')}` : titleFromActionText(rawText, 'One Time lesson summary draft'),
      status: holdPublish ? 'draft_hold' : 'draft',
      metadata: {
        source_fingerprint: source.fingerprint,
        source_type: sourceType,
        topics,
      },
    }));
    if (['zoom_recording', 'vimeo_asset', 'approved_drop_folder_video'].includes(sourceType)) {
      videoReference = unwrap(createVideoAssetReference(context, {
        provider: providerForSource(sourceType),
        provider_asset_id: input.provider_asset_id || input.providerAssetId || input.video_id || input.videoId || `${providerForSource(sourceType)}_${source.fingerprint.slice(0, 12)}`,
        source_url: input.source_url || input.sourceUrl || input.url || '',
        playback_url: input.playback_url || input.playbackUrl || '',
        privacy: 'workspace',
        status: 'draft_reference',
        metadata: {
          source_fingerprint: source.fingerprint,
          no_upload_performed: true,
        },
      }));
      lessonVideo = unwrap(attachVideoToLesson(context, lesson, videoReference, {
        status: 'draft',
        metadata: { source_fingerprint: source.fingerprint },
      }));
    }
  } catch (error) {
    return fail(error.code || 'course_ingestion_preview_failed', error.message, error.details || {}, error.status || 500);
  }

  const classSessionDraft = {
    id: stableId('CLASSSESSION', [source.fingerprint, lesson.id]),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    course_id: course.id,
    module_id: moduleRecord.id,
    lesson_id: lesson.id,
    title: lesson.title,
    source_type: sourceType,
    status: holdPublish ? 'draft_hold' : 'draft_review',
    topics,
    attendance_minutes_status: hasAttendance ? 'drafted_from_intake' : 'needs_review',
    approval_status: publishRequested && !holdPublish ? 'operator_approval_required' : 'not_requested_or_hold',
    provenance: provenance(base, lesson.title),
  };

  const worksheetResourceSuggestions = hasWorksheet ? [
    {
      id: stableId('RESOURCE', [source.fingerprint, 'worksheet']),
      type: /\bsource[-\s]?sheet\b/i.test(rawText) ? 'source_sheet' : 'worksheet',
      title: `Draft ${lesson.title} worksheet`,
      status: 'draft_private_review',
      visibility: 'admin_provider_only',
      provenance: provenance(base, lesson.title),
    },
  ] : [];

  const roleScopedUpdates = [];
  if (hasParentUpdate) {
    roleScopedUpdates.push({
      id: stableId('UPDATE', [source.fingerprint, 'parent']),
      audience_role: 'parent',
      status: publishRequested && !holdPublish ? 'draft_pending_operator_approval' : 'draft_hold',
      external_send_performed: false,
      provenance: provenance(base, 'Parent update draft'),
    });
  }
  if (hasStudentUpdate) {
    roleScopedUpdates.push({
      id: stableId('UPDATE', [source.fingerprint, 'student']),
      audience_role: 'student',
      status: 'draft_private_progress_review',
      external_send_performed: false,
      provenance: provenance(base, 'Student progress update draft'),
    });
  }

  const decisions = [];
  const tasks = [
    draftItem('task', 'Review speaker and participant mapping', base, {
      target_lane: 'Tasks',
      confidence: 'medium',
      confidence_score: 0.78,
      next_action: 'Confirm speakers, students, and parent/student visibility before any portal or message update.',
    }),
    draftItem('task', 'Approve One Time course lesson placement', base, {
      target_lane: 'Tasks',
      confidence: 'high',
      confidence_score: 0.88,
      next_action: 'Confirm the course, module, lesson order, and class-level prompt before publishing.',
    }),
  ];
  const reviewItems = [];

  if (publishRequested && !holdPublish) {
    decisions.push(draftItem('decision', 'Approve publishing or sending One Time class update', base, {
      target_lane: 'Decisions',
      confidence: 'high',
      confidence_score: 0.9,
      next_action: 'Approve the exact audience, copy, and destination before any send or publish action.',
      metadata: { live_write_blocked: true },
    }));
  }
  if (hasWorksheet) {
    tasks.push(draftItem('task', 'Prepare private worksheet or source-sheet draft', base, {
      target_lane: 'Tasks',
      confidence: 'medium',
      confidence_score: 0.8,
      next_action: 'Generate a private draft and route it for Rabbi/provider approval before student or parent visibility.',
    }));
  }
  if (!['zoom_recording', 'vimeo_asset', 'approved_drop_folder_video'].includes(sourceType)) {
    reviewItems.push(draftItem('review_item', 'Confirm class source before video/library placement', base, {
      status: 'needs_review',
      confidence: 'low',
      confidence_score: 0.58,
      reason: 'No Zoom, Vimeo, or approved drop-folder source was detected.',
      metadata: { source_type: sourceType },
    }));
  }
  if (courseTitle === 'One Time Mishnah Class Draft' || lessonTitle === 'One Time Lesson Draft') {
    reviewItems.push(draftItem('review_item', 'Clarify course or lesson title', base, {
      status: 'needs_review',
      confidence: 'low',
      confidence_score: 0.6,
      reason: 'The natural-language command did not name a clear course or lesson title.',
    }));
  }
  if (holdPublish) {
    reviewItems.push(draftItem('review_item', 'Keep class output private until explicitly approved', base, {
      status: 'blocked_by_operator_hold',
      confidence: 'high',
      confidence_score: 0.91,
      reason: 'The intake explicitly said not to publish or send yet.',
    }));
  }

  return ok({
    builder_version: ONE_TIME_CLASS_COURSE_BUILDER_VERSION,
    preview_only: true,
    external_write_performed: false,
    live_publish_performed: false,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    contract: buildOneTimeClassIngestionContract(),
    source,
    parser: {
      parser_version: parsed.parser_version,
      schema_valid: parsed.schema_valid,
      workspace: parsed.workspace,
      parsed_counts: {
        decisions: parsed.decisions.length,
        tasks: parsed.tasks.length,
        calendar_events: parsed.calendar_events.length,
        content_items: parsed.content_items.length,
        notes: parsed.notes.length,
        unresolved: parsed.unresolved.length,
      },
      deduplication_keys: parsed.deduplication_keys,
    },
    drafts: {
      course,
      module: moduleRecord,
      lesson,
      class_session: classSessionDraft,
      video_reference: videoReference,
      lesson_video: lessonVideo,
      worksheet_resource_suggestions: worksheetResourceSuggestions,
      role_scoped_updates: roleScopedUpdates,
    },
    decisions,
    tasks,
    review_items: reviewItems,
    flow_coverage: flowCoverage({
      sourceType,
      hasTranscript,
      hasAttendance,
      hasWorksheet,
      hasParentUpdate,
      hasStudentUpdate,
      publishRequested,
      holdPublish,
    }),
    idempotency: {
      source_fingerprint: source.fingerprint,
      course_id: course.id,
      module_id: moduleRecord.id,
      lesson_id: lesson.id,
      class_session_id: classSessionDraft.id,
      deduplication_keys: parsed.deduplication_keys,
    },
    guardrails: [
      'preview_only',
      'external_write_performed_false',
      'no_google_classroom_write',
      'no_video_upload',
      'no_parent_student_send',
      'publish_requires_operator_approval',
    ],
  });
}

module.exports = {
  ONE_TIME_CLASS_COURSE_BUILDER_VERSION,
  buildLocalAdminContext,
  buildOneTimeClassCourseIngestionPreview,
};
