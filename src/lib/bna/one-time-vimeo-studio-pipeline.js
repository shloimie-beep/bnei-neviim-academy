const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ffmpegPath = require('ffmpeg-static');

const folderWorkflow = require('./one-time-vimeo-folder-library');

const ONE_TIME_WORKSPACE_KEY = folderWorkflow.ONE_TIME_WORKSPACE_KEY;
const ONE_TIME_PROJECT_KEY = folderWorkflow.ONE_TIME_PROJECT_KEY;
const SUPPORTED_VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm']);

const DEFAULT_INBOX_FOLDER = path.join('media-inbox', 'one-time-vimeo-studio-drop');
const DEFAULT_PROCESSED_FOLDER = path.join('media-inbox', 'one-time-vimeo-studio-processed');
const DEFAULT_REPORT_DIR = path.join('ops', 'one-time-mishnah', 'vimeo-studio-pipeline');
const DEFAULT_TRIM_START_SECONDS = 30;
const DEFAULT_TRIM_END_SECONDS = 15;
const DEFAULT_OPENER_SECONDS = 3;
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

function compactText(value, max = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function longText(value, max = 60000) {
  return String(value || '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  return /^(1|true|yes|y)$/i.test(String(value || '').trim());
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function sanitizeFileName(value) {
  return String(value || 'one-time-class')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || 'one-time-class';
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function safeRelative(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return '';
  return relative.split(path.sep).join('/');
}

function reportPath(root, target) {
  return safeRelative(root, target) || target;
}

function isSupportedVideoFile(filePath) {
  return SUPPORTED_VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function statHash(filePath, relativePath = filePath) {
  const stat = fs.statSync(filePath);
  return sha256(`${relativePath}:${stat.size}:${stat.mtimeMs}`).slice(0, 16);
}

function readJsonFile(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function sidecarPathsFor(videoPath, dropRoot) {
  const extension = path.extname(videoPath);
  const base = videoPath.slice(0, extension ? -extension.length : videoPath.length);
  return [
    path.join(dropRoot, 'class.json'),
    path.join(dropRoot, 'metadata.json'),
    path.join(dropRoot, 'manifest.json'),
    path.join(dropRoot, 'one-time-class.json'),
    `${videoPath}.json`,
    `${base}.json`,
    `${base}.metadata.json`,
  ];
}

function readDropMetadata(videoPath, dropRoot) {
  const metadata = {};
  const sources = [];
  const errors = [];
  for (const filePath of sidecarPathsFor(videoPath, dropRoot)) {
    if (!fs.existsSync(filePath)) continue;
    try {
      Object.assign(metadata, readJsonFile(filePath));
      sources.push(filePath);
    } catch (error) {
      errors.push(`Sidecar JSON could not be parsed: ${path.basename(filePath)} (${error.message})`);
    }
  }
  return { metadata, sources, errors };
}

function metadataValue(metadata = {}, ...keys) {
  for (const key of keys) {
    if (metadata[key] !== undefined && metadata[key] !== null && String(metadata[key]).trim() !== '') {
      return metadata[key];
    }
  }
  return '';
}

function findVideoFiles(folder, recursive = false) {
  if (!fs.existsSync(folder)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (recursive && !entry.name.startsWith('.') && !/^(_?processed|renders)$/i.test(entry.name)) visit(fullPath);
        continue;
      }
      if (entry.isFile() && isSupportedVideoFile(fullPath)) files.push(fullPath);
    }
  };
  visit(path.resolve(folder));
  return files.sort((a, b) => a.localeCompare(b));
}

function discoverStudioDrops(folder, options = {}) {
  const root = path.resolve(folder || DEFAULT_INBOX_FOLDER);
  if (!fs.existsSync(root)) return [];
  if (fs.statSync(root).isFile()) {
    return isSupportedVideoFile(root) ? [{ drop_root: path.dirname(root), video_path: root }] : [];
  }

  const directVideos = findVideoFiles(root, false).map((videoPath) => ({
    drop_root: root,
    video_path: videoPath,
  }));
  const childDrops = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    if (/^(_?processed|renders)$/i.test(entry.name)) continue;
    const childRoot = path.join(root, entry.name);
    const childVideos = findVideoFiles(childRoot, options.recursive === true);
    for (const videoPath of childVideos) {
      childDrops.push({ drop_root: childRoot, video_path: videoPath });
    }
  }
  return [...directVideos, ...childDrops].sort((a, b) => a.video_path.localeCompare(b.video_path));
}

function parseDurationFromFfmpegOutput(output = '') {
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function probeVideo(filePath, fallback = {}) {
  const fallbackDuration = Number(fallback.duration_seconds || fallback.durationSeconds || 0) || 60;
  if (!ffmpegPath || !fs.existsSync(filePath)) {
    return {
      duration_seconds: fallbackDuration,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      has_audio: true,
      probed: false,
    };
  }
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-i', filePath], {
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const duration = parseDurationFromFfmpegOutput(output) || fallbackDuration;
  const dimensions = output.match(/,\s*(\d{2,5})x(\d{2,5})(?:[,\s]|$)/);
  return {
    duration_seconds: Number.isFinite(duration) ? duration : fallbackDuration,
    width: dimensions ? Number(dimensions[1]) : DEFAULT_WIDTH,
    height: dimensions ? Number(dimensions[2]) : DEFAULT_HEIGHT,
    has_audio: /Audio:/i.test(output),
    probed: result.status === 0 || /Duration:/i.test(output),
  };
}

function numericMetadata(metadata, keys, fallback = 0) {
  for (const key of keys) {
    const value = Number(metadataValue(metadata, key));
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return fallback;
}

function buildTrimPlan(metadata = {}, probe = {}, options = {}) {
  const durationSeconds = Math.max(1, Number(probe.duration_seconds || metadata.duration_seconds || 60) || 60);
  const defaultStart = Math.max(0, Number(options.defaultTrimStartSeconds ?? DEFAULT_TRIM_START_SECONDS) || 0);
  const defaultEnd = Math.max(0, Number(options.defaultTrimEndSeconds ?? DEFAULT_TRIM_END_SECONDS) || 0);
  const contentStart = metadataValue(metadata, 'content_start_seconds', 'contentStartSeconds');
  const trimStart = metadataValue(metadata, 'trim_start_seconds', 'trimStartSeconds');
  const contentEnd = metadataValue(metadata, 'content_end_seconds', 'contentEndSeconds');
  const trimEnd = metadataValue(metadata, 'trim_end_seconds', 'trimEndSeconds');

  const startSeconds = contentStart !== ''
    ? Number(contentStart)
    : trimStart !== ''
      ? Number(trimStart)
      : defaultStart;
  const endSeconds = contentEnd !== ''
    ? Number(contentEnd)
    : durationSeconds - (trimEnd !== '' ? Number(trimEnd) : defaultEnd);
  const safeStart = Math.max(0, Math.min(Number.isFinite(startSeconds) ? startSeconds : 0, Math.max(0, durationSeconds - 1)));
  const safeEnd = Math.max(safeStart + 1, Math.min(Number.isFinite(endSeconds) ? endSeconds : durationSeconds, durationSeconds));
  return {
    source_duration_seconds: durationSeconds,
    trim_start_seconds: Number(safeStart.toFixed(3)),
    trim_end_seconds: Number(Math.max(0, durationSeconds - safeEnd).toFixed(3)),
    content_end_seconds: Number(safeEnd.toFixed(3)),
    output_content_seconds: Number((safeEnd - safeStart).toFixed(3)),
    opener_seconds: Math.max(0, Number(metadataValue(metadata, 'opener_seconds', 'openerSeconds') || options.openerSeconds || DEFAULT_OPENER_SECONDS) || 0),
    strategy: contentStart !== '' || trimStart !== '' || contentEnd !== '' || trimEnd !== ''
      ? 'sidecar_or_manifest'
      : 'configured_default',
    note: 'V1 records deterministic trim points; automatic semantic class-start/class-end detection is a later approval packet.',
  };
}

function transcriptFromMetadata(metadata = {}, dropRoot = '') {
  const inline = metadataValue(metadata, 'transcript_text', 'transcript');
  if (inline) return longText(inline);
  const transcriptFile = compactText(metadataValue(metadata, 'transcript_file', 'transcriptFile'), 500);
  if (!transcriptFile) return '';
  const resolved = path.resolve(dropRoot, transcriptFile);
  const resolvedRoot = path.resolve(dropRoot);
  if (!resolved.startsWith(resolvedRoot) || !fs.existsSync(resolved)) return '';
  return longText(fs.readFileSync(resolved, 'utf8'));
}

function titleFromVideo(filePath) {
  return compactText(
    path.basename(filePath, path.extname(filePath))
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    180,
  ) || 'One Time Mishnah class recording';
}

function parseScopeBlockers(metadata = {}) {
  const blockers = [];
  const workspaceKey = compactText(metadataValue(metadata, 'workspace_key', 'workspaceKey'), 120);
  const projectKey = compactText(metadataValue(metadata, 'project_key', 'projectKey'), 120);
  if (workspaceKey && workspaceKey !== ONE_TIME_WORKSPACE_KEY) {
    blockers.push(`Sidecar workspace_key must be ${ONE_TIME_WORKSPACE_KEY}; found ${workspaceKey}.`);
  }
  if (projectKey && projectKey !== ONE_TIME_PROJECT_KEY) {
    blockers.push(`Sidecar project_key must be ${ONE_TIME_PROJECT_KEY}; found ${projectKey}.`);
  }
  return blockers;
}

function buildStudioCandidate(drop, folderRoot, processedRoot, options = {}) {
  const dropRoot = path.resolve(drop.drop_root);
  const videoPath = path.resolve(drop.video_path);
  const metadataRead = readDropMetadata(videoPath, dropRoot);
  const metadata = metadataRead.metadata;
  const probe = probeVideo(videoPath, metadata);
  const trimPlan = buildTrimPlan(metadata, probe, options);
  const relativePath = safeRelative(folderRoot, videoPath) || path.basename(videoPath);
  const candidateId = statHash(videoPath, relativePath);
  const title = compactText(metadataValue(metadata, 'title', 'class_title', 'classTitle') || titleFromVideo(videoPath), 240);
  const slug = `${candidateId}-${sanitizeFileName(title)}`;
  const outputDir = path.join(processedRoot, slug);
  const outputFile = path.join(outputDir, `${sanitizeFileName(title)}.edited.mp4`);
  const sidecarFile = outputFile.replace(/\.mp4$/i, '.json');
  const transcriptText = transcriptFromMetadata(metadata, dropRoot);
  const scopeBlockers = parseScopeBlockers(metadata);
  const safety = {
    synthetic_test: normalizeBoolean(metadataValue(metadata, 'synthetic_test', 'syntheticTest', 'synthetic')),
    contains_sensitive_data: normalizeBoolean(metadataValue(metadata, 'contains_sensitive_data', 'containsSensitiveData')),
    real_class_recording: normalizeBoolean(metadataValue(metadata, 'real_class_recording', 'realClassRecording'))
      || !normalizeBoolean(metadataValue(metadata, 'synthetic_test', 'syntheticTest', 'synthetic')),
  };
  const blockers = [...metadataRead.errors, ...scopeBlockers];
  if (safety.contains_sensitive_data) blockers.push('Sidecar marks this file as containing sensitive data; Vimeo upload remains blocked.');
  return {
    id: candidateId,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    title,
    drop_root: dropRoot,
    source_file: {
      absolute_path: videoPath,
      relative_path: relativePath,
      name: path.basename(videoPath),
      extension: path.extname(videoPath).toLowerCase(),
      size_bytes: fs.statSync(videoPath).size,
    },
    metadata_sources: metadataRead.sources.map((source) => safeRelative(dropRoot, source) || path.basename(source)),
    metadata,
    safety,
    probe,
    trim_plan: trimPlan,
    opener: {
      title: compactText(metadataValue(metadata, 'opener_title', 'openerTitle') || 'One Time Mishnah', 80),
      subtitle: compactText(metadataValue(metadata, 'opener_subtitle', 'openerSubtitle') || title, 140),
      seconds: trimPlan.opener_seconds,
    },
    output: {
      dir: outputDir,
      video_path: outputFile,
      sidecar_path: sidecarFile,
    },
    transcript: {
      present: Boolean(transcriptText),
      status: compactText(metadataValue(metadata, 'transcript_status', 'transcriptStatus') || (transcriptText ? 'review' : 'draft'), 40),
      length: transcriptText.length,
      sha256: transcriptText ? sha256(transcriptText).slice(0, 16) : '',
      text: transcriptText,
    },
    blockers,
  };
}

function buildVimeoSidecar(candidate, rendered = {}) {
  const metadata = candidate.metadata || {};
  return {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    title: candidate.title,
    class_date: normalizeDate(metadataValue(metadata, 'class_date', 'classDate', 'date')),
    description: longText(metadataValue(metadata, 'description'), 5000),
    summary: longText(metadataValue(metadata, 'summary', 'class_summary', 'classSummary'), 5000),
    masechta: compactText(metadataValue(metadata, 'masechta'), 120),
    perek: compactText(metadataValue(metadata, 'perek'), 80),
    mishnah_range: compactText(metadataValue(metadata, 'mishnah_range', 'mishnahRange', 'mishnah'), 120),
    duration_seconds: Math.max(0, Math.round((candidate.trim_plan?.output_content_seconds || 0) + (candidate.opener?.seconds || 0))),
    transcript_text: candidate.transcript.text || '',
    transcript_status: candidate.transcript.status || 'draft',
    package_status: compactText(metadataValue(metadata, 'package_status', 'packageStatus') || 'review', 40),
    synthetic_test: candidate.safety.synthetic_test,
    contains_sensitive_data: candidate.safety.contains_sensitive_data,
    real_class_recording: candidate.safety.real_class_recording,
    trim_start_seconds: candidate.trim_plan.trim_start_seconds,
    trim_end_seconds: candidate.trim_plan.trim_end_seconds,
    opener_seconds: candidate.opener.seconds,
    source_file_name: candidate.source_file.name,
    source_sha256: candidate.id,
    edited_output_status: rendered.status || 'planned',
    updated_by: 'one-time-vimeo-studio-pipeline',
    metadata: {
      intake_source: 'one_time_vimeo_studio_pipeline',
      parent_raw_id: 'RAW-20260708-011',
      studio_candidate_id: candidate.id,
      trim_strategy: candidate.trim_plan.strategy,
      opener_title: candidate.opener.title,
      opener_subtitle: candidate.opener.subtitle,
      processed_video_name: path.basename(candidate.output.video_path),
    },
  };
}

function escapeDrawtext(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,');
}

function fontPathForOptions(options = {}) {
  const provided = options.fontPath || process.env.BNA_VIDEO_OPENER_FONT || '';
  if (provided && fs.existsSync(provided)) return provided;
  const windowsArial = 'C:\\Windows\\Fonts\\arial.ttf';
  return fs.existsSync(windowsArial) ? windowsArial : '';
}

function ffmpegFontPart(fontPath) {
  if (!fontPath) return '';
  return `fontfile=${fontPath.replace(/\\/g, '/').replace(/:/g, '\\:')}:`;
}

function runFfmpeg(args, label) {
  const result = spawnSync(ffmpegPath, args, {
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = `${result.stdout || ''}\n${result.stderr || ''}`.slice(0, 1600);
    throw new Error(`${label} failed with exit code ${result.status}: ${detail}`);
  }
}

function renderOpener(candidate, openerPath, options = {}) {
  const width = Number(options.width || DEFAULT_WIDTH);
  const height = Number(options.height || DEFAULT_HEIGHT);
  const seconds = Math.max(0.1, Number(candidate.opener.seconds || DEFAULT_OPENER_SECONDS));
  const fontPart = ffmpegFontPart(fontPathForOptions(options));
  const title = escapeDrawtext(candidate.opener.title || 'One Time Mishnah');
  const subtitle = escapeDrawtext(candidate.opener.subtitle || candidate.title);
  const filter = [
    `drawbox=x=0:y=ih-126:w=iw:h=126:color=0xFACC15:t=fill`,
    `drawtext=${fontPart}text='${title}':fontcolor=0xFACC15:fontsize=74:x=(main_w-text_w)/2:y=(main_h-text_h)/2-80`,
    `drawtext=${fontPart}text='${subtitle}':fontcolor=white:fontsize=42:x=(main_w-text_w)/2:y=(main_h-text_h)/2+8`,
    `drawtext=${fontPart}text='Rabbi Elie Scheller':fontcolor=black:fontsize=34:x=(main_w-text_w)/2:y=main_h-82`,
  ].join(',');
  runFfmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x050505:s=${width}x${height}:r=30:d=${seconds}`,
    '-f', 'lavfi',
    '-i', `anullsrc=channel_layout=stereo:sample_rate=48000`,
    '-t', String(seconds),
    '-vf', filter,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-shortest',
    openerPath,
  ], 'opener render');
}

function renderTrimmed(candidate, trimmedPath, options = {}) {
  const width = Number(options.width || DEFAULT_WIDTH);
  const height = Number(options.height || DEFAULT_HEIGHT);
  const length = Math.max(0.1, Number(candidate.trim_plan.output_content_seconds || 1));
  const start = Math.max(0, Number(candidate.trim_plan.trim_start_seconds || 0));
  const videoFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`;
  const args = ['-y', '-ss', String(start), '-i', candidate.source_file.absolute_path];
  if (!candidate.probe.has_audio) {
    args.push('-f', 'lavfi', '-t', String(length), '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000');
  }
  args.push('-t', String(length), '-map', '0:v:0');
  if (candidate.probe.has_audio) {
    args.push('-map', '0:a:0?');
  } else {
    args.push('-map', '1:a:0');
  }
  args.push(
    '-vf', videoFilter,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '23',
    '-c:a', 'aac',
    '-ar', '48000',
    '-ac', '2',
    '-movflags', '+faststart',
    trimmedPath,
  );
  runFfmpeg(args, 'trim render');
}

function concatFiles(files, outputPath, workDir) {
  const concatPath = path.join(workDir, 'concat.txt');
  const lines = files.map((filePath) => `file '${filePath.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(concatPath, `${lines.join('\n')}\n`);
  runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', concatPath, '-c', 'copy', outputPath], 'concat render');
}

function renderCandidate(candidate, options = {}) {
  ensureDir(candidate.output.dir);
  const workDir = path.join(candidate.output.dir, '_work');
  ensureDir(workDir);
  const openerPath = path.join(workDir, 'opener.mp4');
  const trimmedPath = path.join(workDir, 'trimmed.mp4');
  renderOpener(candidate, openerPath, options);
  renderTrimmed(candidate, trimmedPath, options);
  concatFiles([openerPath, trimmedPath], candidate.output.video_path, workDir);
  return {
    status: 'rendered',
    render_performed: true,
    video_path: candidate.output.video_path,
    sidecar_path: candidate.output.sidecar_path,
  };
}

function writeCandidateSidecar(candidate, rendered = {}) {
  ensureDir(candidate.output.dir);
  const sidecar = buildVimeoSidecar(candidate, rendered);
  fs.writeFileSync(candidate.output.sidecar_path, `${JSON.stringify(sidecar, null, 2)}\n`);
  return sidecar;
}

function safeCandidateReport(candidate, rendered = {}, repoRoot = process.cwd()) {
  return {
    id: candidate.id,
    workspace_key: candidate.workspace_key,
    project_key: candidate.project_key,
    title: candidate.title,
    source_file: {
      relative_path: candidate.source_file.relative_path,
      name: candidate.source_file.name,
      extension: candidate.source_file.extension,
      size_bytes: candidate.source_file.size_bytes,
    },
    metadata_sources: candidate.metadata_sources,
    safety: candidate.safety,
    trim_plan: candidate.trim_plan,
    opener: candidate.opener,
    transcript: {
      present: candidate.transcript.present,
      status: candidate.transcript.status,
      length: candidate.transcript.length,
      sha256: candidate.transcript.sha256,
    },
    output: {
      rendered: rendered.render_performed === true,
      video_path: reportPath(repoRoot, rendered.video_path || candidate.output.video_path),
      sidecar_path: reportPath(repoRoot, rendered.sidecar_path || candidate.output.sidecar_path),
      video_exists: Boolean(rendered.video_path && fs.existsSync(rendered.video_path)),
      sidecar_exists: fs.existsSync(candidate.output.sidecar_path),
    },
    blockers: candidate.blockers,
  };
}

function summarizeVimeoDryRun(report = {}) {
  return {
    workflow: report.workflow || 'one_time_vimeo_folder_library',
    dry_run: report.dry_run === true,
    external_write_performed: report.external_write_performed === true,
    production_mutation_performed: report.production_mutation_performed === true,
    member_visibility_performed: report.member_visibility_performed === true,
    summary: report.summary || {},
    candidates: (report.candidates || []).map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      upload_status: candidate.upload_result?.status || '',
      review_package_status: candidate.database_result?.status || '',
      publish_status: candidate.publish_result?.status || '',
      publish_ready: candidate.publish_readiness?.ready === true,
      blockers: candidate.blockers || [],
    })),
  };
}

async function runStudioPipeline(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const folder = path.resolve(repoRoot, options.folder || DEFAULT_INBOX_FOLDER);
  const processedRoot = path.resolve(repoRoot, options.processedFolder || DEFAULT_PROCESSED_FOLDER);
  const render = options.render === true;
  const runVimeoDryRun = options.runVimeoDryRun !== false;
  const report = {
    ok: true,
    generated_at: new Date().toISOString(),
    workflow: 'one_time_vimeo_studio_pipeline',
    raw_id: 'RAW-20260708-011',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    folder: reportPath(repoRoot, folder),
    folder_relative_to_repo: reportPath(repoRoot, folder),
    processed_folder: reportPath(repoRoot, processedRoot),
    processed_folder_relative_to_repo: reportPath(repoRoot, processedRoot),
    render_requested: render,
    external_write_performed: false,
    production_mutation_performed: false,
    member_visibility_performed: false,
    candidates: [],
    blockers: [],
    next_actions: [],
  };

  if (!fs.existsSync(folder)) {
    if (options.ensureFolder === false) {
      report.ok = false;
      report.blockers.push(`Folder not found: ${folder}`);
      return finalizeReport(report);
    }
    ensureDir(folder);
  }
  ensureDir(processedRoot);

  const drops = discoverStudioDrops(folder, { recursive: options.recursive === true });
  const limited = Number(options.limit || 0) > 0 ? drops.slice(0, Number(options.limit)) : drops;
  for (const drop of limited) {
    const candidate = buildStudioCandidate(drop, folder, processedRoot, options);
    let rendered = {
      status: render ? 'not_started' : 'planned',
      render_performed: false,
      video_path: render ? '' : candidate.output.video_path,
      sidecar_path: candidate.output.sidecar_path,
    };
    if (render) {
      try {
        rendered = renderCandidate(candidate, options);
        writeCandidateSidecar(candidate, rendered);
      } catch (error) {
        rendered = {
          status: 'failed',
          render_performed: false,
          error: error.message,
          video_path: candidate.output.video_path,
          sidecar_path: candidate.output.sidecar_path,
        };
        candidate.blockers.push(`Render failed: ${error.message}`);
      }
    }
    const safe = safeCandidateReport(candidate, rendered, repoRoot);
    if (render && rendered.render_performed && runVimeoDryRun) {
      const vimeoReport = await folderWorkflow.runFolderLibraryWorkflow({
        repoRoot,
        folder: candidate.output.dir,
        apply: false,
        ensureFolder: false,
      });
      safe.vimeo_dry_run = summarizeVimeoDryRun(vimeoReport);
      report.external_write_performed = report.external_write_performed || vimeoReport.external_write_performed === true;
      report.production_mutation_performed = report.production_mutation_performed || vimeoReport.production_mutation_performed === true;
      report.member_visibility_performed = report.member_visibility_performed || vimeoReport.member_visibility_performed === true;
    }
    report.candidates.push(safe);
  }

  if (!report.candidates.length) {
    report.next_actions.push(`Drop a folder containing .mp4, .mov, .m4v, or .webm into ${report.folder_relative_to_repo}.`);
  }
  if (!render) {
    report.next_actions.push('Run again with --render after reviewing the trim/opener plan.');
  }
  report.next_actions.push('Real Vimeo upload, production DB review-package writes, member visibility, and bot knowledge promotion remain separate approval-gated packets.');
  return finalizeReport(report);
}

function finalizeReport(report) {
  report.summary = {
    candidate_count: report.candidates.length,
    rendered_count: report.candidates.filter((candidate) => candidate.output?.rendered).length,
    sidecar_count: report.candidates.filter((candidate) => candidate.output?.sidecar_exists).length,
    blockers_count: report.blockers.length + report.candidates.reduce((sum, candidate) => sum + (candidate.blockers?.length || 0), 0),
  };
  return report;
}

function formatMarkdownReport(report = {}) {
  const lines = [
    `# One Time Vimeo Studio Pipeline Report - ${report.generated_at || ''}`,
    '',
    `- Workflow: \`${report.workflow}\``,
    `- Scope: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `- Folder: \`${report.folder_relative_to_repo || report.folder || ''}\``,
    `- Processed folder: \`${report.processed_folder_relative_to_repo || report.processed_folder || ''}\``,
    `- Render requested: \`${report.render_requested === true}\``,
    `- External write performed: \`${report.external_write_performed === true}\``,
    `- Production mutation performed: \`${report.production_mutation_performed === true}\``,
    `- Member visibility performed: \`${report.member_visibility_performed === true}\``,
    '',
    '## Summary',
    '',
    `- Candidates: ${report.summary?.candidate_count || 0}`,
    `- Rendered: ${report.summary?.rendered_count || 0}`,
    `- Sidecars: ${report.summary?.sidecar_count || 0}`,
    `- Blockers: ${report.summary?.blockers_count || 0}`,
    '',
    '## Candidates',
    '',
  ];
  if (!report.candidates?.length) {
    lines.push('- No media candidates found.');
  } else {
    for (const candidate of report.candidates) {
      lines.push(`- \`${candidate.id}\` ${candidate.title}`);
      lines.push(`  - Source: \`${candidate.source_file?.relative_path || candidate.source_file?.name || ''}\``);
      lines.push(`  - Trim: start ${candidate.trim_plan?.trim_start_seconds}s, remove tail ${candidate.trim_plan?.trim_end_seconds}s, strategy \`${candidate.trim_plan?.strategy || ''}\``);
      lines.push(`  - Opener: ${candidate.opener?.seconds || 0}s, \`${candidate.opener?.title || ''}\``);
      lines.push(`  - Transcript: \`${candidate.transcript?.present ? 'present' : 'missing'}\`, status \`${candidate.transcript?.status || ''}\`, length ${candidate.transcript?.length || 0}`);
      lines.push(`  - Output video exists: \`${candidate.output?.video_exists === true}\``);
      lines.push(`  - Sidecar exists: \`${candidate.output?.sidecar_exists === true}\``);
      if (candidate.vimeo_dry_run) {
        lines.push(`  - Vimeo dry-run candidates: ${candidate.vimeo_dry_run.summary?.candidate_count || 0}`);
        lines.push(`  - Vimeo external write: \`${candidate.vimeo_dry_run.external_write_performed === true}\``);
        lines.push(`  - Vimeo DB mutation: \`${candidate.vimeo_dry_run.production_mutation_performed === true}\``);
        lines.push(`  - Vimeo member visibility: \`${candidate.vimeo_dry_run.member_visibility_performed === true}\``);
      }
      if (candidate.blockers?.length) lines.push(`  - Blockers: ${candidate.blockers.join('; ')}`);
    }
  }
  if (report.next_actions?.length) {
    lines.push('', '## Next Actions', '');
    for (const action of report.next_actions) lines.push(`- ${action}`);
  }
  return lines.join('\n');
}

function writeWorkflowReport(report, options = {}) {
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const reportDir = path.resolve(repoRoot, options.reportDir || DEFAULT_REPORT_DIR);
  ensureDir(reportDir);
  const stamp = (report.generated_at || new Date().toISOString()).replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-report.json`);
  const mdPath = path.join(reportDir, `${stamp}-report.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${formatMarkdownReport(report)}\n`);
  return { jsonPath, mdPath };
}

module.exports = {
  DEFAULT_INBOX_FOLDER,
  DEFAULT_OPENER_SECONDS,
  DEFAULT_PROCESSED_FOLDER,
  DEFAULT_REPORT_DIR,
  DEFAULT_TRIM_END_SECONDS,
  DEFAULT_TRIM_START_SECONDS,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  SUPPORTED_VIDEO_EXTENSIONS,
  buildStudioCandidate,
  buildTrimPlan,
  buildVimeoSidecar,
  discoverStudioDrops,
  formatMarkdownReport,
  probeVideo,
  runStudioPipeline,
  writeWorkflowReport,
};
