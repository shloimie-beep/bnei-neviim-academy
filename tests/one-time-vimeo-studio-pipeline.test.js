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

test('studio edge detection parser can drive an automatic trim plan', () => {
  const black = pipeline.parseBlackSegments('[blackdetect @ 0] black_start:0 black_end:2.24 black_duration:2.24\n[blackdetect @ 0] black_start:57.1 black_end:60 black_duration:2.9');
  const silence = pipeline.parseSilenceSegments('[silencedetect @ 0] silence_start: 0\n[silencedetect @ 0] silence_end: 1.8 | silence_duration: 1.8\n[silencedetect @ 0] silence_start: 58.2\n[silencedetect @ 0] silence_end: 60 | silence_duration: 1.8');
  const blackTrim = pipeline.edgeTrimFromSegments(black, 60);
  const silenceTrim = pipeline.edgeTrimFromSegments(silence, 60);
  const edgeTrim = {
    enabled: true,
    status: 'ok',
    trim_start_seconds: Math.max(blackTrim.trim_start_seconds, silenceTrim.trim_start_seconds),
    trim_end_seconds: Math.max(blackTrim.trim_end_seconds, silenceTrim.trim_end_seconds),
    signals: { black: blackTrim, silence: silenceTrim },
  };
  const plan = pipeline.buildTrimPlan(
    {},
    { duration_seconds: 60 },
    { autoTrimEdges: true, defaultTrimStartSeconds: 0, defaultTrimEndSeconds: 0 },
    edgeTrim,
  );

  assert.equal(plan.strategy, 'auto_detected_edges');
  assert.equal(plan.trim_start_seconds, 2.24);
  assert.equal(plan.trim_end_seconds, 2.9);
  assert.equal(plan.edge_detection.enabled, true);
});

test('studio sidecar trim points override automatic edge detection', () => {
  const plan = pipeline.buildTrimPlan(
    { trim_start_seconds: 12, trim_end_seconds: 8 },
    { duration_seconds: 100 },
    { autoTrimEdges: true, defaultTrimStartSeconds: 0, defaultTrimEndSeconds: 0 },
    { enabled: true, status: 'ok', trim_start_seconds: 2, trim_end_seconds: 3 },
  );

  assert.equal(plan.strategy, 'sidecar_or_manifest');
  assert.equal(plan.trim_start_seconds, 12);
  assert.equal(plan.trim_end_seconds, 8);
});

test('studio pipeline accepts BOM-prefixed Windows sidecar JSON', async () => {
  const root = tempDir();
  const drop = path.join(root, 'bom-sidecar');
  fs.mkdirSync(drop, { recursive: true });
  const videoPath = path.join(drop, 'bom.mp4');
  fs.writeFileSync(videoPath, Buffer.from('synthetic video placeholder'));
  fs.writeFileSync(path.join(drop, 'class.json'), `\uFEFF${JSON.stringify({
    title: 'BOM Sidecar Class',
    duration_seconds: 60,
    trim_start_seconds: 4,
    synthetic_test: true,
    contains_sensitive_data: false,
  })}`);

  const report = await pipeline.runStudioPipeline({
    folder: root,
    processedFolder: path.join(root, 'processed'),
    render: false,
    runVimeoDryRun: false,
  });
  const candidate = report.candidates[0];

  assert.equal(candidate.title, 'BOM Sidecar Class');
  assert.equal(candidate.trim_plan.trim_start_seconds, 4);
  assert.deepEqual(candidate.blockers, []);
});

test('studio pipeline respects explicit non-class media safety flag', async () => {
  const root = tempDir();
  const drop = path.join(root, 'promo-smoke');
  writeFakeVideo(drop, 'promo.mp4', {
    synthetic_test: false,
    real_class_recording: false,
  });

  const report = await pipeline.runStudioPipeline({
    folder: root,
    processedFolder: path.join(root, 'processed'),
    render: false,
    runVimeoDryRun: false,
  });

  assert.equal(report.candidates[0].safety.synthetic_test, false);
  assert.equal(report.candidates[0].safety.real_class_recording, false);
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

test('studio OpenAI transcription helpers extract text without exposing keys', () => {
  assert.equal(pipeline.transcriptTextFromOpenAiResponse({ text: '  hello transcript  ' }), 'hello transcript');
  assert.equal(pipeline.transcriptTextFromOpenAiResponse({ segments: [{ text: 'one' }, { text: 'two' }] }), 'one two');
  assert.equal(pipeline.readOpenAiApiKey(tempDir(), { openaiApiKey: 'sk-test-not-real' }), 'sk-test-not-real');
  assert.equal(pipeline.readOpenAiApiKey(tempDir(), { openaiApiKey: 'TODO' }), '');
  assert.doesNotMatch(pipeline.redactCredentialText('bad sk-proj-abc123XYZ'), /sk-proj-abc123XYZ/);
});

test('studio OpenAI key resolver prefers keyholder candidates over stale repo secrets', () => {
  const root = tempDir();
  const keyholder = path.join(root, 'BNA-Keyholder');
  const secrets = path.join(root, '.secrets');
  fs.mkdirSync(keyholder, { recursive: true });
  fs.mkdirSync(secrets, { recursive: true });
  const keyholderSecret = 'sk-dummy-keyholder-valid-for-test'; // watchdog-secret-scan: allow-placeholder
  fs.writeFileSync(path.join(keyholder, 'openaiv2.txt'), keyholderSecret);
  fs.writeFileSync(path.join(secrets, 'openai-api-key.txt'), 'sk-dummy-stale-repo-secret-for-test'); // watchdog-secret-scan: allow-placeholder

  const candidates = pipeline.readOpenAiCredentialCandidates(root, {
    env: {},
    keyholderRoots: [keyholder],
    secretsRoot: secrets,
  });

  assert.equal(candidates[0].source, 'keyholder:openaiv2.txt');
  assert.equal(pipeline.readOpenAiApiKey(root, { env: {}, keyholderRoots: [keyholder], secretsRoot: secrets }), keyholderSecret);
});

test('package script exposes the studio processor', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.match(pkg.scripts['one-time:vimeo-studio'], /one-time-vimeo-studio-pipeline\.mjs/);
});

test('studio processor CLI exposes opt-in transcription flag', () => {
  const cli = fs.readFileSync('scripts/one-time-vimeo-studio-pipeline.mjs', 'utf8');
  assert.match(cli, /--transcribe-openai/);
  assert.match(cli, /transcribeOpenAI = true/);
});

test('Vimeo private smoke script loads Vimeo token through keyholder helper', () => {
  const cli = fs.readFileSync('scripts/vimeo-private-smoke.mjs', 'utf8');
  assert.match(cli, /loadSecret/);
  assert.match(cli, /vimeo-access-token/);
  assert.match(cli, /vimeo_access_token_source/);
});
