const crypto = require('crypto');
const path = require('path');

const { ONE_TIME_PROJECT_KEY, ONE_TIME_WORKSPACE_KEY } = require('./one-time-drive-intake-map');

const TRANSCRIPT_STATUSES = Object.freeze([
  'draft',
  'machine_complete',
  'needs_review',
  'review',
  'approved',
  'superseded',
  'rejected',
]);
const DEFAULT_CHUNK_SECONDS = 600;
const DEFAULT_OVERLAP_SECONDS = 15;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_AUDIO_SAMPLE_RATE = 16000;
const DEFAULT_AUDIO_BITRATE = '32k';

function sha256(value) {
  return crypto.createHash('sha256').update(String(value ?? '')).digest('hex');
}

function normalizeWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeTranscriptForDedupe(value = '') {
  return normalizeWhitespace(value).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');
}

function toPositiveNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function sanitizeFileBase(value = 'chunk') {
  return String(value || 'chunk')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'chunk';
}

function buildLongFormChunkPlan({
  durationSeconds = 0,
  chunkSeconds = DEFAULT_CHUNK_SECONDS,
  overlapSeconds = DEFAULT_OVERLAP_SECONDS,
} = {}) {
  const duration = toPositiveNumber(durationSeconds, 0);
  if (!duration) {
    return {
      mode: 'long_form_chunk_plan',
      chunk_seconds: chunkSeconds,
      overlap_seconds: overlapSeconds,
      chunks: [],
      blockers: ['missing_duration_seconds'],
    };
  }

  const baseChunk = Math.max(30, toPositiveNumber(chunkSeconds, DEFAULT_CHUNK_SECONDS));
  const overlap = Math.min(Math.max(0, Number(overlapSeconds) || 0), Math.max(0, baseChunk / 2));
  const chunks = [];
  let index = 0;
  for (let anchor = 0; anchor < duration; anchor += baseChunk) {
    index += 1;
    const nominalStart = anchor;
    const nominalEnd = Math.min(duration, anchor + baseChunk);
    const start = Math.max(0, nominalStart - (index === 1 ? 0 : overlap));
    const end = Math.min(duration, nominalEnd + (nominalEnd >= duration ? 0 : overlap));
    chunks.push({
      chunk_index: index,
      total_chunks: 0,
      nominal_start_seconds: Number(nominalStart.toFixed(3)),
      nominal_end_seconds: Number(nominalEnd.toFixed(3)),
      start_seconds: Number(start.toFixed(3)),
      end_seconds: Number(end.toFixed(3)),
      duration_seconds: Number((end - start).toFixed(3)),
      overlap_before_seconds: Number((nominalStart - start).toFixed(3)),
      overlap_after_seconds: Number((end - nominalEnd).toFixed(3)),
      status: 'planned',
    });
  }
  for (const chunk of chunks) chunk.total_chunks = chunks.length;
  return {
    mode: 'long_form_chunk_plan',
    chunk_seconds: baseChunk,
    overlap_seconds: overlap,
    chunks,
    blockers: [],
  };
}

function buildAudioExtractionCommands({
  inputPath = '',
  outputDir = '',
  chunkPlan = {},
  outputBase = 'one-time-transcript',
  sampleRate = DEFAULT_AUDIO_SAMPLE_RATE,
  bitrate = DEFAULT_AUDIO_BITRATE,
} = {}) {
  const base = sanitizeFileBase(outputBase);
  return (chunkPlan.chunks || []).map((chunk) => {
    const outputPath = path.join(outputDir, `${base}-part-${String(chunk.chunk_index).padStart(3, '0')}.mp3`);
    return {
      chunk_index: chunk.chunk_index,
      start_seconds: chunk.start_seconds,
      duration_seconds: chunk.duration_seconds,
      output_path: outputPath,
      descriptor: {
        filename: path.basename(outputPath),
        mimeType: 'audio/mpeg',
      },
      ffmpeg_args: [
        '-hide_banner',
        '-y',
        '-ss', String(chunk.start_seconds),
        '-i', inputPath,
        '-t', String(chunk.duration_seconds),
        '-vn',
        '-ac', '1',
        '-ar', String(sampleRate),
        '-b:a', bitrate,
        outputPath,
      ],
      no_provider_call: true,
    };
  });
}

function absoluteSegmentTimes(segment = {}, chunk = {}) {
  const start = Number(segment.start_seconds ?? segment.start ?? 0);
  const end = Number(segment.end_seconds ?? segment.end ?? start);
  const relative = segment.relative !== false;
  const offset = relative ? Number(chunk.start_seconds || 0) : 0;
  return {
    start_seconds: Number((offset + start).toFixed(3)),
    end_seconds: Number((offset + end).toFixed(3)),
  };
}

function mergeChunkTranscripts(chunks = [], { dedupeWindowSeconds = DEFAULT_OVERLAP_SECONDS * 2 } = {}) {
  const segments = [];
  const seen = [];
  for (const chunk of chunks || []) {
    for (const segment of chunk.segments || []) {
      const text = normalizeWhitespace(segment.text || '');
      if (!text) continue;
      const times = absoluteSegmentTimes(segment, chunk);
      const normalized = normalizeTranscriptForDedupe(text);
      const duplicate = seen.find((item) => (
        item.normalized === normalized
        && Math.abs(item.start_seconds - times.start_seconds) <= dedupeWindowSeconds
      ));
      if (duplicate) continue;
      const segmentRef = `chunk-${String(chunk.chunk_index || 0).padStart(3, '0')}:${sha256(`${times.start_seconds}:${text}`).slice(0, 12)}`;
      seen.push({ normalized, start_seconds: times.start_seconds });
      segments.push({
        segment_ref: segmentRef,
        chunk_index: chunk.chunk_index || null,
        start_seconds: times.start_seconds,
        end_seconds: times.end_seconds,
        text,
        text_sha256: sha256(text),
        review_state: segment.review_state || 'machine_complete',
        privacy_class: segment.privacy_class || 'needs_review',
        speaker_label: segment.speaker_label || segment.speaker || '',
      });
    }
  }
  return {
    status: 'machine_complete',
    segment_count: segments.length,
    segments,
    transcript_text: segments.map((segment) => segment.text).join('\n').trim(),
    dedupe_applied: true,
  };
}

function buildPrivateTranscriptVersion({
  contentJobId = null,
  classSessionId = null,
  mediaFingerprint = '',
  provider = 'openai',
  model = '',
  mergedTranscript = {},
  chunkPlan = {},
  previousVersion = 0,
  status = 'machine_complete',
  createdAt = new Date().toISOString(),
} = {}) {
  const transcriptText = String(mergedTranscript.transcript_text || '');
  const safeStatus = TRANSCRIPT_STATUSES.includes(status) ? status : 'machine_complete';
  return {
    schema_version: 'one_time_private_transcript.v1',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    content_job_id: contentJobId,
    class_session_id: classSessionId,
    version: Number(previousVersion || 0) + 1,
    status: safeStatus,
    provider,
    model,
    media_fingerprint: mediaFingerprint,
    transcript_sha256: transcriptText ? sha256(transcriptText) : '',
    transcript_char_count: transcriptText.length,
    transcript_body_included: false,
    raw_text_returned: false,
    chunk_count: (chunkPlan.chunks || []).length,
    segment_count: mergedTranscript.segment_count || 0,
    segment_hashes: (mergedTranscript.segments || []).map((segment) => ({
      segment_ref: segment.segment_ref,
      start_seconds: segment.start_seconds,
      end_seconds: segment.end_seconds,
      text_sha256: segment.text_sha256 || sha256(segment.text || ''),
      privacy_class: segment.privacy_class || 'needs_review',
      review_state: segment.review_state || safeStatus,
    })),
    created_at: createdAt,
  };
}

function buildChunkRetryPlan(chunks = [], {
  now = new Date().toISOString(),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
} = {}) {
  return {
    generated_at: now,
    mode: 'chunk_retry_plan_no_provider_call',
    max_attempts: maxAttempts,
    chunks: (chunks || []).map((chunk) => {
      const attempts = Number(chunk.attempts || 0);
      if (chunk.status === 'transcribed') {
        return { chunk_index: chunk.chunk_index, action: 'skip_transcribed', status: chunk.status };
      }
      if (attempts + 1 >= maxAttempts) {
        return {
          chunk_index: chunk.chunk_index,
          action: 'dead_letter_chunk',
          status: 'dead_letter',
          attempts: attempts + 1,
          last_error: chunk.last_error || 'chunk transcription failed',
        };
      }
      return {
        chunk_index: chunk.chunk_index,
        action: 'retry_chunk',
        status: 'retry_wait',
        attempts: attempts + 1,
        last_error: chunk.last_error || '',
      };
    }),
  };
}

function safeTranscriptionReport({
  chunkPlan = {},
  version = {},
  retryPlan = null,
} = {}) {
  return {
    workflow: 'one_time_long_form_private_transcription',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    no_provider_call: true,
    no_drive_write: true,
    no_database_write: true,
    transcript_body_included: false,
    raw_text_returned: false,
    chunk_count: (chunkPlan.chunks || []).length,
    chunks: (chunkPlan.chunks || []).map((chunk) => ({
      chunk_index: chunk.chunk_index,
      total_chunks: chunk.total_chunks,
      start_seconds: chunk.start_seconds,
      end_seconds: chunk.end_seconds,
      overlap_before_seconds: chunk.overlap_before_seconds,
      overlap_after_seconds: chunk.overlap_after_seconds,
      status: chunk.status,
    })),
    transcript_version: version ? {
      schema_version: version.schema_version,
      version: version.version,
      status: version.status,
      provider: version.provider,
      model: version.model,
      transcript_sha256: version.transcript_sha256,
      transcript_char_count: version.transcript_char_count,
      transcript_body_included: version.transcript_body_included === true,
      raw_text_returned: version.raw_text_returned === true,
      segment_count: version.segment_count,
      segment_hashes: version.segment_hashes || [],
    } : null,
    retry_plan: retryPlan ? {
      mode: retryPlan.mode,
      max_attempts: retryPlan.max_attempts,
      chunks: retryPlan.chunks,
    } : null,
  };
}

module.exports = {
  DEFAULT_AUDIO_BITRATE,
  DEFAULT_AUDIO_SAMPLE_RATE,
  DEFAULT_CHUNK_SECONDS,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_OVERLAP_SECONDS,
  TRANSCRIPT_STATUSES,
  buildAudioExtractionCommands,
  buildChunkRetryPlan,
  buildLongFormChunkPlan,
  buildPrivateTranscriptVersion,
  mergeChunkTranscripts,
  normalizeTranscriptForDedupe,
  safeTranscriptionReport,
  sha256,
};
