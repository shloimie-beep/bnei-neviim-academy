'use strict';

function toArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined);
  if (typeof value === 'string') return value.split(/[\n;,]/).map((item) => item.trim()).filter(Boolean);
  return value === null || value === undefined ? [] : [value];
}

function compact(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseJsonMaybe(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function activeContentOutputs(job = {}) {
  return toArray(job.outputs).filter((output) => {
    const status = String(output?.status || '').toLowerCase();
    return status !== 'archived' && status !== 'deleted';
  });
}

function transcriptChars(job = {}) {
  if (Number.isFinite(Number(job.transcript_chars))) return Number(job.transcript_chars);
  return String(job.transcript_text || '').trim().length;
}

function contentNeedsOutput(job = {}) {
  const status = String(job.status || '').toLowerCase();
  return status === 'transcribed' && activeContentOutputs(job).length === 0;
}

function contentTopicHaystack(job = {}) {
  const parse = parseJsonMaybe(job.parse_json, {});
  return compact([
    job.title,
    job.generated_title,
    job.caption,
    job.notes,
    job.source_type,
    job.mime_type,
    job.project_key,
    job.project,
    job.summary,
    toArray(job.categories).join(' '),
    toArray(job.category_list).join(' '),
    toArray(parse.topics).join(' '),
    toArray(parse.sources).join(' '),
    toArray(parse.highlights).join(' '),
    toArray(parse.class_notes).map((note) => compact([note?.title, note?.summary].join(' '))).join(' '),
    toArray(parse.mixed_recording_parse?.class_notes).map((note) => compact([note?.title, note?.summary].join(' '))).join(' '),
  ].filter(Boolean).join(' ')).toLowerCase();
}

function contentProjectKey(job = {}) {
  return String(job.project_key || job.project || '').toLowerCase();
}

function contentCategorySet(job = {}) {
  return new Set([...toArray(job.categories), ...toArray(job.category_list)].map((item) => String(item).toLowerCase()));
}

function inferredContentTopics(job = {}) {
  const haystack = contentTopicHaystack(job);
  const categories = contentCategorySet(job);
  const project = contentProjectKey(job);
  const topics = [];
  const isClassContent = ['class_notes', 'class_session', 'student_question', 'source_sheet', 'source_sheets', 'torah_research', 'torah_class_prep', 'shiur_ideas'].some((key) => categories.has(key))
    || /\b(class recording|class session|class notes|student question|source sheet|shiur|lesson)\b/.test(haystack);
  if (project === 'one_time_mishnah_class' || /\b(one time|one-time|rabbi elie|scheller|sheller)\b/.test(haystack)) topics.push('one_time');
  if (
    isClassContent
    || /\b(torah|mishn(?:a|ah|ayos)|mishna|gemara|shiur|parsha|halacha|baba|brachos|sanhedrin|sefaria|sefer|chumash|rashi|onkelos|pasuk|jewish learning)\b/.test(haystack)
  ) topics.push('torah');
  if (isClassContent) topics.push('class_notes');
  if (/\b(psychology|emotional|confidence|motivation|mindset|behavior)\b/.test(haystack)) topics.push('psychology');
  if (/\b(health|sleep|nutrition|exercise|medical|wellness)\b/.test(haystack)) topics.push('health');
  if (isClassContent || /\b(education|school|classroom|curriculum|student|learning system|assignment|worksheet|teacher)\b/.test(haystack)) topics.push('education');
  if (/\b(parent|family|home|children|child)\b/.test(haystack)) topics.push('parenting');
  if (/\b(marketing|facebook|linkedin|newsletter|blog|reel|clip|content calendar|buffer|social post)\b/.test(haystack)) topics.push('content_marketing');
  if (categories.has('parser_error') || categories.has('drive_workflow_issue') || /\b(parser|parse|transcript|drive|google drive|export|sync|codex|dashboard|railway|api|database|server|deploy|smoke)\b/.test(haystack)) topics.push('operations');
  return [...new Set(topics)];
}

function contentTopicKey(job = {}) {
  return inferredContentTopics(job)[0] || 'other';
}

function contentSourceKey(job = {}) {
  const sourceType = String(job.source_type || job.sourceType || '').toLowerCase();
  const source = String(job.media_url || job.source_media_url || job.source || '').toLowerCase();
  if (sourceType.includes('youtube') || /youtube\.com|youtu\.be/.test(source)) return 'youtube';
  if (sourceType.includes('google_drive') || sourceType.includes('drive') || job.drive_file_ref || job.drive_file_id) return 'drive';
  if (sourceType.includes('upload') || sourceType.includes('telegram') || job.local_path) return 'upload';
  if (sourceType.includes('manual')) return 'manual';
  return 'other';
}

function contentStatusKey(job = {}) {
  const categories = new Set([...toArray(job.categories), ...toArray(job.category_list)].map((item) => String(item)));
  const title = String(job.title || job.generated_title || '').toLowerCase();
  if (categories.has('parser_error') || title.includes('needs parser review') || job.needs_parse === true) return 'needs_parse';
  if (contentNeedsOutput(job)) return 'needs_output';
  const status = String(job.status || '').toLowerCase();
  if (status.includes('approved') || activeContentOutputs(job).some((output) => String(output.status || '').toLowerCase() === 'approved')) return 'approved';
  if (status.includes('published') || activeContentOutputs(job).some((output) => String(output.status || '').toLowerCase() === 'published')) return 'published';
  return status || 'unknown';
}

function buildContentCardViewModel(jobs = []) {
  return toArray(jobs).map((job) => ({
    id: job.id || job.job_id || null,
    title: compact(job.title || job.generated_title || `Content job #${job.id || job.job_id || 'unknown'}`),
    transcript_chars: transcriptChars(job),
    topic_key: contentTopicKey(job),
    topic_keys: inferredContentTopics(job),
    source_key: contentSourceKey(job),
    status_key: contentStatusKey(job),
    needs_output: contentNeedsOutput(job),
    output_count: activeContentOutputs(job).length,
    categories: [...new Set([...toArray(job.categories), ...toArray(job.category_list)].map(String))].sort(),
    raw_transcript_body_included: false,
  }));
}

module.exports = {
  activeContentOutputs,
  buildContentCardViewModel,
  contentNeedsOutput,
  contentSourceKey,
  contentStatusKey,
  contentTopicHaystack,
  contentTopicKey,
  contentCategorySet,
  inferredContentTopics,
  transcriptChars,
};
