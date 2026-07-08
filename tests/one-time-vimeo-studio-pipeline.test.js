const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const pipeline = require('../src/lib/bna/one-time-vimeo-studio-pipeline');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'one-time-vimeo-studio-'));
}

function writeFakeVideo(folder, name = 'berachos-class.mp4', metadata = {}) {
  fs.mkdirSync(folder, { recursive: true });
  const videoPath = path.join(folder, name);
  fs.writeFileSync(videoPath, Buffer.from('synthetic video placeholder'));
  fs.writeFileSync(path.join(folder, 'class.json'), JSON.stringify({
    title: 'Mishnah Berachos 1:1',
    class_date: '2026-07-08',
    masechta: 'Berachos',
    perek: '1',
    mishnah_range: '1',
    duration_seconds: 120,
    summary: 'Reviewed class summary.',
    transcript_status: 'review',
    synthetic_test: true,
    contains_sensitive_data: false,
    ...metadata,
  }, null, 2));
  return videoPath;
}

test('studio pipeline discovers folder drops and builds deterministic trim plans', async () => {
  const root = tempDir();
  const drop = path.join(root, 'last-class');
  writeFakeVideo(drop, 'last-class.mp4', {
    trim_start_seconds: 18,
    trim_end_seconds: 7,
    opener_title: 'One Time Test Opener',
  });

  const report = await pipeline.runStudioPipeline({
    folder: root,
    processedFolder: path.join(root, 'processed'),
    render: false,
    runVimeoDryRun: false,
  });

  assert.equal(report.workflow, 'one_time_vimeo_studio_pipeline');
  assert.equal(report.workspace_key, pipeline.ONE_TIME_WORKSPACE_KEY);
  assert.equal(report.project_key, pipeline.ONE_TIME_PROJECT_KEY);
  assert.equal(report.external_write_performed, false);
  assert.equal(report.production_mutation_performed, false);
  assert.equal(report.member_visibility_performed, false);
  assert.equal(report.candidates.length, 1);

  const candidate = report.candidates[0];
  assert.equal(candidate.title, 'Mishnah Berachos 1:1');
  assert.equal(candidate.trim_plan.trim_start_seconds, 18);
  assert.equal(candidate.trim_plan.trim_end_seconds, 7);
  assert.equal(candidate.trim_plan.strategy, 'sidecar_or_manifest');
  assert.equal(candidate.opener.title, 'One Time Test Opener');
  assert.equal(candidate.output.rendered, false);
  assert.equal(candidate.output.sidecar_exists, false);
});

test('studio pipeline forces One Time scope and records wrong-scope sidecar blockers', async () => {
  const root = tempDir();
  const drop = path.join(root, 'wrong-scope');
  writeFakeVideo(drop, 'wrong.mp4', {
    workspace_key: 'bna',
    project_key: 'bna',
  });

  const report = await pipeline.runStudioPipeline({
    folder: root,
    processedFolder: path.join(root, 'processed'),
    render: false,
    runVimeoDryRun: false,
  });

  const candidate = report.candidates[0];
  assert.equal(candidate.workspace_key, pipeline.ONE_TIME_WORKSPACE_KEY);
  assert.equal(candidate.project_key, pipeline.ONE_TIME_PROJECT_KEY);
  assert.match(candidate.blockers.join(' '), /workspace_key must be rabbi_sheller_provider/);
  assert.match(candidate.blockers.join(' '), /project_key must be one_time_mishnah_class/);
});

test('studio sidecar is compatible with the existing Vimeo folder workflow shape', () => {
  const root = tempDir();
  const drop = path.join(root, 'sidecar');
  const videoPath = writeFakeVideo(drop, 'sidecar.mp4', {
    transcript_text: 'Short synthetic transcript for local test only.',
    trim_start_seconds: 3,
    trim_end_seconds: 2,
  });
  const processed = path.join(root, 'processed');
  const candidate = pipeline.buildStudioCandidate(
    { drop_root: drop, video_path: videoPath },
    root,
    processed,
    {},
  );
  const sidecar = pipeline.buildVimeoSidecar(candidate, { status: 'rendered' });

  assert.equal(sidecar.workspace_key, pipeline.ONE_TIME_WORKSPACE_KEY);
  assert.equal(sidecar.project_key, pipeline.ONE_TIME_PROJECT_KEY);
  assert.equal(sidecar.title, 'Mishnah Berachos 1:1');
  assert.equal(sidecar.masechta, 'Berachos');
  assert.equal(sidecar.perek, '1');
  assert.equal(sidecar.mishnah_range, '1');
  assert.equal(sidecar.transcript_status, 'review');
  assert.match(sidecar.transcript_text, /synthetic transcript/);
  assert.equal(sidecar.metadata.intake_source, 'one_time_vimeo_studio_pipeline');
});

test('studio reports redact transcript body from committed evidence', async () => {
  const root = tempDir();
  const drop = path.join(root, 'transcript');
  writeFakeVideo(drop, 'transcript.mp4', {
    transcript_text: 'This transcript body should not appear in the Markdown report.',
  });

  const report = await pipeline.runStudioPipeline({
    folder: root,
    processedFolder: path.join(root, 'processed'),
    render: false,
    runVimeoDryRun: false,
  });
  const markdown = pipeline.formatMarkdownReport(report);

  assert.match(markdown, /Transcript: `present`/);
  assert.doesNotMatch(markdown, /This transcript body should not appear/);
  assert.doesNotMatch(JSON.stringify(report), /This transcript body should not appear/);
});

test('package script exposes the studio processor', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.match(pkg.scripts['one-time:vimeo-studio'], /one-time-vimeo-studio-pipeline\.mjs/);
});

