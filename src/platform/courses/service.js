const { contextScopeFields } = require('../core/context');
const { cleanString, normalizeKey, stableId } = require('../core/ids');
const { fail, ok } = require('../core/result');
const { assertWorkspaceIsolation, requirePermission } = require('../rbac');

function courseScope(context = {}, input = {}) {
  return {
    ...contextScopeFields(context),
    instance_id: cleanString(input.instance_id || context.instance?.id),
    workspace_id: cleanString(input.workspace_id || context.workspace?.id),
    workspace_key: cleanString(input.workspace_key || context.workspace?.key),
  };
}

function createCourse(context = {}, input = {}) {
  const scope = courseScope(context, input);
  const permission = requirePermission(context, 'course:create', scope);
  if (!permission.ok) return permission;
  const title = cleanString(input.title);
  if (!title) return fail('missing_course_title', 'Course title is required', {}, 400);
  const slug = normalizeKey(input.slug || title);
  return ok({
    id: cleanString(input.id || stableId('COURSE', [scope.workspace_id, slug])),
    ...scope,
    community_id: cleanString(input.community_id || input.communityId),
    slug,
    title,
    description: cleanString(input.description),
    status: normalizeKey(input.status || 'draft') || 'draft',
    visibility: normalizeKey(input.visibility || 'workspace') || 'workspace',
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 100,
    version: cleanString(input.version || 'v1'),
    metadata: input.metadata || {},
  });
}

function createCourseModule(context = {}, course = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, course);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'course:create', course);
  if (!permission.ok) return permission;
  const title = cleanString(input.title || input.name);
  if (!title) return fail('missing_module_title', 'Course module title is required', {}, 400);
  const slug = normalizeKey(input.slug || title);
  return ok({
    id: cleanString(input.id || stableId('COURSEMODULE', [course.id, slug])),
    course_id: course.id,
    ...courseScope(context, course),
    slug,
    title,
    description: cleanString(input.description),
    status: normalizeKey(input.status || 'draft') || 'draft',
    visibility: normalizeKey(input.visibility || course.visibility || 'workspace') || 'workspace',
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 100,
    metadata: input.metadata || {},
  });
}

function createLesson(context = {}, courseModule = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, courseModule);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'course:create', courseModule);
  if (!permission.ok) return permission;
  const title = cleanString(input.title);
  if (!title) return fail('missing_lesson_title', 'Lesson title is required', {}, 400);
  const slug = normalizeKey(input.slug || title);
  return ok({
    id: cleanString(input.id || stableId('LESSON', [courseModule.id, slug])),
    course_id: courseModule.course_id,
    module_id: courseModule.id,
    ...courseScope(context, courseModule),
    slug,
    title,
    summary: cleanString(input.summary),
    status: normalizeKey(input.status || 'draft') || 'draft',
    visibility: normalizeKey(input.visibility || courseModule.visibility || 'workspace') || 'workspace',
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 100,
    metadata: input.metadata || {},
  });
}

function createVideoAssetReference(context = {}, input = {}) {
  const scope = courseScope(context, input);
  const permission = requirePermission(context, 'course:create', scope);
  if (!permission.ok) return permission;
  const provider = normalizeKey(input.provider || 'external');
  const providerAssetId = cleanString(input.provider_asset_id || input.providerAssetId || input.source_url || input.playback_url);
  if (!providerAssetId) return fail('missing_video_asset_id', 'provider_asset_id, source_url, or playback_url is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('VIDEOASSET', [scope.workspace_id, provider, providerAssetId])),
    ...scope,
    provider,
    provider_asset_id: providerAssetId,
    source_url: cleanString(input.source_url || input.sourceUrl),
    playback_url: cleanString(input.playback_url || input.playbackUrl),
    thumbnail_url: cleanString(input.thumbnail_url || input.thumbnailUrl),
    duration_seconds: Number.isFinite(Number(input.duration_seconds || input.durationSeconds)) ? Number(input.duration_seconds || input.durationSeconds) : null,
    privacy: normalizeKey(input.privacy || 'workspace') || 'workspace',
    transcript_reference: cleanString(input.transcript_reference || input.transcriptReference),
    status: normalizeKey(input.status || 'approved_reference') || 'approved_reference',
    metadata: input.metadata || {},
  });
}

function attachVideoToLesson(context = {}, lesson = {}, video = {}, input = {}) {
  const lessonIsolation = assertWorkspaceIsolation(context, lesson);
  if (!lessonIsolation.ok) return lessonIsolation;
  const videoIsolation = assertWorkspaceIsolation(context, video);
  if (!videoIsolation.ok) return videoIsolation;
  const permission = requirePermission(context, 'course:create', lesson);
  if (!permission.ok) return permission;
  return ok({
    id: cleanString(input.id || stableId('LESSONVIDEO', [lesson.id, video.id])),
    lesson_id: lesson.id,
    video_asset_id: video.id,
    course_id: lesson.course_id,
    module_id: lesson.module_id,
    ...courseScope(context, lesson),
    role: normalizeKey(input.role || 'primary') || 'primary',
    status: normalizeKey(input.status || 'active') || 'active',
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 100,
    metadata: input.metadata || {},
  });
}

function enrollMember(context = {}, course = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, course);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'course:create', course);
  if (!permission.ok) return permission;
  const personId = cleanString(input.person_id || input.personId || input.student_id || input.studentId);
  if (!personId) return fail('missing_enrollment_person', 'person_id or student_id is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('ENROLLMENT', [course.id, personId])),
    course_id: course.id,
    ...courseScope(context, course),
    person_id: personId,
    student_id: cleanString(input.student_id || input.studentId),
    status: normalizeKey(input.status || 'active') || 'active',
    progress_percent: Math.max(0, Math.min(100, Number(input.progress_percent || input.progressPercent || 0))),
    metadata: input.metadata || {},
  });
}

function recordProgress(context = {}, enrollment = {}, input = {}) {
  const action = cleanString(enrollment.person_id) === cleanString(context.actor?.person_id || context.actor?.id)
    || cleanString(enrollment.student_id) === cleanString(context.actor?.student_id || context.actor?.id)
    ? 'course:progress:write_own'
    : 'course:progress:write';
  const permission = requirePermission(context, action, {
    ...enrollment,
    student_id: enrollment.student_id,
    person_id: enrollment.person_id,
  });
  if (!permission.ok) return permission;
  const progress = Math.max(0, Math.min(100, Number(input.progress_percent || input.progressPercent || enrollment.progress_percent || 0)));
  return ok({
    id: cleanString(input.id || stableId('PROGRESS', [enrollment.id, input.lesson_id || input.module_id || progress])),
    enrollment_id: enrollment.id,
    course_id: enrollment.course_id,
    lesson_id: cleanString(input.lesson_id || input.lessonId),
    module_id: cleanString(input.module_id || input.moduleId),
    ...courseScope(context, enrollment),
    progress_percent: progress,
    status: progress >= 100 ? 'completed' : normalizeKey(input.status || 'in_progress') || 'in_progress',
    source: normalizeKey(input.source || 'manual') || 'manual',
    metadata: input.metadata || {},
  });
}

module.exports = {
  attachVideoToLesson,
  createCourse,
  createCourseModule,
  createLesson,
  createVideoAssetReference,
  enrollMember,
  recordProgress,
};
