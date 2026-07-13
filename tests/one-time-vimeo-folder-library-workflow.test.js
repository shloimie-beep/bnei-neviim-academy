const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const workflow = require('../src/lib/bna/one-time-vimeo-folder-library');

function tempDrop() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'one-time-vimeo-drop-'));
}

function makeVideo(folder, name = 'berachos-synthetic-test.mp4', metadata = {}) {
  const filePath = path.join(folder, name);
  fs.writeFileSync(filePath, Buffer.from('synthetic video bytes'));
  fs.writeFileSync(filePath.replace(/\.[^.]+$/i, '.json'), JSON.stringify({
    title: 'Mishnah Berachos 1:1',
    class_date: '2026-07-06',
    masechta: 'Berachos',
    perek: '1',
    mishnah_range: '1',
    summary: 'Reviewed class summary.',
    transcript_status: 'approved',
    synthetic_test: true,
    contains_sensitive_data: false,
    ...metadata,
  }, null, 2));
  return filePath;
}

function makeClient(steps = []) {
  const requests = [];
  return {
    requests,
    async request(requestPath, options = {}) {
      requests.push({ path: requestPath, options });
      const next = steps.shift();
      if (!next) return {};
      if (next.error) {
        const error = new Error(next.error.message || 'mock Vimeo error');
        error.status = next.error.status || 500;
        throw error;
      }
      return typeof next === 'function' ? next(requestPath, options) : next;
    },
  };
}

test('One Time Vimeo folder workflow defaults to the Rabbi Scheller Mishnah scope', async () => {
  const folder = tempDrop();
  makeVideo(folder);

  const report = await workflow.runFolderLibraryWorkflow({
    folder,
    repoRoot: process.cwd(),
    vimeoToken: 'secret-token',
  });

  assert.equal(report.workspace_key, workflow.ONE_TIME_WORKSPACE_KEY);
  assert.equal(report.project_key, workflow.ONE_TIME_PROJECT_KEY);
  assert.equal(report.dry_run, true);
  assert.equal(report.external_write_performed, false);
  assert.equal(report.production_mutation_performed, false);
  assert.equal(report.member_visibility_performed, false);
  assert.equal(report.vimeo_access_status.configured, true);
  assert.equal(report.vimeo_access_status.fingerprint.length, 12);
  assert.equal(report.candidates.length, 1);
  assert.equal(report.candidates[0].workspace_key, workflow.ONE_TIME_WORKSPACE_KEY);
  assert.equal(report.candidates[0].project_key, workflow.ONE_TIME_PROJECT_KEY);
  assert.equal(report.candidates[0].class_package_payload.media_provider, 'placeholder');
  assert.equal(report.candidates[0].publish_readiness.ready, false);
  assert.doesNotMatch(JSON.stringify(report), /secret-token/);
});

test('folder workflow blocks sidecar attempts to route outside One Time', async () => {
  const folder = tempDrop();
  makeVideo(folder, 'wrong-scope-synthetic-test.mp4', {
    workspace_key: 'bna',
    project_key: 'bna',
  });

  const report = await workflow.runFolderLibraryWorkflow({
    folder,
    repoRoot: process.cwd(),
    vimeoToken: 'secret-token',
  });

  assert.equal(report.candidates.length, 1);
  assert.match(report.candidates[0].blockers.join(' '), /workspace_key must be rabbi_sheller_provider/);
  assert.match(report.candidates[0].blockers.join(' '), /project_key must be one_time_mishnah_class/);
  assert.equal(report.external_write_performed, false);
});

test('Vimeo upload requires apply and exact upload confirmation', async () => {
  const folder = tempDrop();
  makeVideo(folder);

  const report = await workflow.runFolderLibraryWorkflow({
    folder,
    repoRoot: process.cwd(),
    vimeoToken: 'secret-token',
    apply: true,
    upload: true,
    uploadConfirmation: 'WRONG',
  });

  assert.equal(report.candidates[0].upload_result.status, 'blocked');
  assert.match(report.candidates[0].upload_result.blockers.join(' '), /UPLOAD_ONE_TIME_VIMEO_LIBRARY/);
  assert.equal(report.external_write_performed, false);
});

test('folder workflow accepts MKV handoff candidates after Drive stability proof', async () => {
  const folder = tempDrop();
  makeVideo(folder, 'obs-class-recording.mkv', {
    transcript_status: 'review',
  });

  const report = await workflow.runFolderLibraryWorkflow({
    folder,
    repoRoot: process.cwd(),
    vimeoToken: 'secret-token',
  });

  assert.equal(report.candidates.length, 1);
  assert.equal(report.candidates[0].source_file.extension, '.mkv');
  assert.equal(report.external_write_performed, false);
});

test('synthetic upload can run through a mocked private Vimeo client without leaking the token', async () => {
  const folder = tempDrop();
  makeVideo(folder);
  const client = makeClient([
    {
      uri: '/videos/123456789',
      link: 'https://vimeo.com/123456789',
      upload: { upload_link: 'https://upload.vimeo.test/tus/1' },
      privacy: { view: 'nobody', embed: 'private' },
    },
    {},
    {},
  ]);

  const report = await workflow.runFolderLibraryWorkflow({
    folder,
    repoRoot: process.cwd(),
    vimeoToken: 'secret-token',
    apply: true,
    upload: true,
    uploadConfirmation: workflow.VIMEO_UPLOAD_CONFIRMATION,
    client,
  });

  const candidate = report.candidates[0];
  assert.equal(candidate.upload_result.status, 'uploaded');
  assert.equal(candidate.class_package_payload.media_provider, 'vimeo');
  assert.equal(candidate.class_package_payload.vimeo_id, '123456789');
  assert.equal(report.external_write_performed, true);
  assert.equal(report.member_visibility_performed, false);
  assert.equal(client.requests.some((request) => request.path === '/me/videos'), true);
  assert.doesNotMatch(JSON.stringify(report), /secret-token/);
});

test('member-library publish stays blocked without the existing One Time approval flag', async () => {
  const folder = tempDrop();
  makeVideo(folder, 'manual-vimeo-synthetic-test.mp4', {
    vimeo_url: 'https://vimeo.com/987654321',
  });

  const report = await workflow.runFolderLibraryWorkflow({
    folder,
    repoRoot: process.cwd(),
    vimeoToken: 'secret-token',
    apply: true,
    publish: true,
  });

  const candidate = report.candidates[0];
  assert.equal(candidate.publish_result.status, 'blocked');
  assert.match(candidate.publish_result.blockers.join(' '), /create-review-package/i);
  assert.equal(report.member_visibility_performed, false);
});

test('package script exposes the folder workflow', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.match(pkg.scripts['one-time:vimeo-library'], /one-time-vimeo-folder-library\.mjs/);
});
