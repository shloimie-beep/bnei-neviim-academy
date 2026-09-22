const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const vimeo = require('../src/lib/integrations/vimeo');

function makeClient(steps = []) {
  const requests = [];
  return {
    requests,
    async request(requestPath, options = {}) {
      requests.push({ path: requestPath, options });
      const next = steps.shift();
      if (!next) return {};
      if (next instanceof Error) throw next;
      if (typeof next === 'function') return next(requestPath, options);
      if (next.error) {
        const error = new Error(next.error.message || 'Vimeo mock error');
        error.status = next.error.status || 500;
        error.data = next.error.data || {};
        throw error;
      }
      return next;
    },
  };
}

test('Vimeo readiness exposes exact states for configuration, token, permissions, and target checks', async () => {
  const noToken = await vimeo.checkVimeoTokenCapabilities({ token: '' });
  assert.equal(noToken.status, 'credential_missing');
  assert.match(noToken.reason, /missing/i);
  assert.match(noToken.next_action, /VIMEO_ACCESS_TOKEN/);

  const invalidClient = makeClient([{ error: { status: 401, message: 'invalid token' } }]);
  const invalid = await vimeo.checkVimeoTokenCapabilities({ token: 'secret-token', client: invalidClient });
  assert.equal(invalid.status, 'credential_invalid');

  const permissionClient = makeClient([{ error: { status: 403, message: 'upload scope required' } }]);
  const permission = await vimeo.checkVimeoTokenCapabilities({ token: 'secret-token', client: permissionClient });
  assert.equal(permission.status, 'permission_missing');

  const missingTargetClient = makeClient([
    { name: 'BNA Vimeo Test', uri: '/users/12345', account: 'starter' },
    { data: [] },
  ]);
  const missingTarget = await vimeo.checkVimeoTokenCapabilities({
    token: 'secret-token',
    client: missingTargetClient,
    accountConfirmed: true,
    expectedAccountName: 'BNA Vimeo Test',
  });
  assert.equal(missingTarget.status, 'test_target_missing');

  const readyClient = makeClient([
    { name: 'BNA Vimeo Test', uri: '/users/12345', account: 'starter' },
    { data: [{ name: 'BNA Private Tests', uri: '/users/12345/projects/67890' }] },
  ]);
  const ready = await vimeo.checkVimeoTokenCapabilities({
    token: 'secret-token',
    client: readyClient,
    accountConfirmed: true,
    expectedAccountName: 'BNA Vimeo Test',
    testProjectName: 'BNA Private Tests',
  });
  assert.equal(ready.status, 'private_test_ready');
  assert.equal(ready.capabilities.read_account, true);
  assert.equal(ready.capabilities.upload, true);
  assert.doesNotMatch(JSON.stringify(ready), /secret-token/);
});

test('Vimeo upload request uses private privacy defaults and normalized metadata', () => {
  const request = vimeo.createVimeoUploadRequest({
    title: 'Mishnah synthetic smoke',
    description: 'Synthetic test only.',
    size_bytes: 12,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    class_session_id: 'class-1',
    transcript_id: 'transcript-1',
    privacy: 'public',
  }, {
    token: 'secret-token',
  });

  assert.equal(request.status, 'private_test_ready');
  assert.equal(request.upload_request.body.upload.approach, 'tus');
  assert.equal(request.upload_request.body.privacy.view, 'nobody');
  assert.equal(request.upload_request.body.privacy.embed, 'private');
  assert.equal(request.upload_request.privacy.public_publish_performed, false);
  assert.match(request.upload_request.body.description, /BNA duplicate key/);
  assert.match(request.upload_request.duplicate_key, /rabbi_sheller_provider/);
});

test('Vimeo mock upload records progress, retries, metadata update, target folder, and no public publish', async () => {
  const client = makeClient([
    { error: { status: 429, message: 'rate limited' } },
    { uri: '/videos/123456789', link: 'https://vimeo.com/123456789', upload: { upload_link: 'https://upload.vimeo.test/tus/1' }, privacy: { view: 'nobody', embed: 'private' }, pictures: { active: true, sizes: [{ width: 640, height: 360, link: 'https://i.vimeocdn.test/thumb.jpg' }] } },
    {},
    {},
    { uri: '/videos/123456789' },
  ]);
  const progress = [];

  const result = await vimeo.uploadVimeoAsset({
    title: 'BNA synthetic smoke',
    description: 'Synthetic test only.',
    bytes: Buffer.from('synthetic-video-bytes'),
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    class_session_id: 'class-1',
    transcript_id: 'transcript-1',
    source_sha256: 'hash-1',
  }, {
    token: 'secret-token',
    client,
    retries: 1,
    testProjectUri: '/users/12345/projects/67890',
    onProgress: (event) => progress.push(event),
  });

  assert.equal(result.status, 'private_test_uploaded');
  assert.equal(result.external_write_performed, true);
  assert.equal(result.public_publish_performed, false);
  assert.equal(result.redacted_asset_id, '[vimeo-id:...6789]');
  assert.deepEqual(progress.map((event) => event.percent), [0, 100]);
  assert.equal(result.retry_attempts.some((attempt) => attempt.error_status === 429), true);
  assert.equal(client.requests.some((request) => request.path === '/users/12345/projects/67890/videos/123456789'), true);
  assert.equal(client.requests.some((request) => request.path === '/videos/123456789' && request.options.method === 'PATCH'), true);
  assert.equal(vimeo.assertNoVimeoSecrets(result, ['secret-token']).ok, true);
});

test('Vimeo duplicate protection avoids a second upload for the same synthetic asset', async () => {
  const duplicateKey = vimeo.buildVimeoDuplicateKey({
    title: 'Duplicate synthetic',
    workspace_key: 'bna',
    project_key: 'one_time_mishnah_class',
    class_session_id: 'class-2',
    transcript_id: 'transcript-2',
    source_sha256: 'same-hash',
  });
  const result = await vimeo.uploadVimeoAsset({
    title: 'Duplicate synthetic',
    bytes: Buffer.from('bytes'),
    workspace_key: 'bna',
    project_key: 'one_time_mishnah_class',
    class_session_id: 'class-2',
    transcript_id: 'transcript-2',
    source_sha256: 'same-hash',
  }, {
    token: 'secret-token',
    existingVideos: [{
      uri: '/videos/111112222',
      link: 'https://vimeo.com/111112222',
      name: 'Duplicate synthetic',
      description: `BNA duplicate key: ${duplicateKey}`,
      privacy: { view: 'nobody' },
    }],
  });

  assert.equal(result.status, 'private_test_uploaded');
  assert.equal(result.duplicate_protected, true);
  assert.equal(result.external_write_performed, false);
  assert.equal(result.redacted_asset_id, '[vimeo-id:...2222]');
});

test('Vimeo metadata, thumbnail, playback, deleted, and unavailable states normalize safely', () => {
  const video = vimeo.normalizeVimeoVideo({
    uri: '/videos/123456789',
    link: 'https://vimeo.com/123456789',
    name: 'Class video',
    duration: 42,
    status: 'available',
    privacy: { view: 'nobody', embed: 'private' },
    pictures: { active: true, sizes: [{ width: 100, height: 56, link: 'small.jpg' }, { width: 1280, height: 720, link: 'large.jpg' }] },
  });
  assert.equal(video.status, 'available');
  assert.equal(video.thumbnail.thumbnail_url, 'large.jpg');
  assert.equal(video.playback.embed_url, 'https://player.vimeo.com/video/123456789');

  const deleted = vimeo.normalizeVimeoVideo({ uri: '/videos/555551111', status: 'deleted' });
  assert.equal(deleted.status, 'deleted');
  assert.equal(deleted.playback.deleted, true);

  const unavailable = vimeo.normalizeVimeoVideo({ uri: '/videos/555552222', status: 'transcoding' });
  assert.equal(unavailable.status, 'unavailable');
  assert.equal(unavailable.playback.unavailable, true);
});

test('Vimeo member entitlement allows scoped playback and denies cross-workspace/deleted/unavailable videos', () => {
  const context = { workspace_key: 'rabbi_sheller_provider' };
  const video = { workspace_key: 'rabbi_sheller_provider', course_id: 'course-1', playback: { unavailable: false } };
  const allowed = vimeo.checkMemberVideoEntitlement(context, video, { status: 'active', tier: 'library_only', course_id: 'course-1' });
  assert.equal(allowed.allowed, true);
  assert.equal(allowed.status, 'member_entitled');

  const crossWorkspace = vimeo.checkMemberVideoEntitlement(context, { ...video, workspace_key: 'bna' }, { status: 'active', tier: 'library_only' });
  assert.equal(crossWorkspace.allowed, false);
  assert.equal(crossWorkspace.status, 'cross_workspace_denied');

  const deleted = vimeo.checkMemberVideoEntitlement(context, { ...video, deleted: true }, { status: 'active', tier: 'library_only' });
  assert.equal(deleted.status, 'deleted_video');

  const unavailable = vimeo.checkMemberVideoEntitlement(context, { ...video, playback: { unavailable: true } }, { status: 'active', tier: 'library_only' });
  assert.equal(unavailable.status, 'unavailable_playback');
});

test('Vimeo class-session and transcript linkage creates scoped audit evidence without writes', () => {
  const linked = vimeo.linkVimeoVideoToClassSession({
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    class_session_id: 'class-3',
    transcript_id: 'transcript-3',
    vimeo_url: 'https://player.vimeo.com/video/998877665',
  });

  assert.equal(linked.ok, true);
  assert.equal(linked.status, 'manual_ready');
  assert.equal(linked.class_session_linkage.linked, true);
  assert.equal(linked.transcript_linkage.linked, true);
  assert.equal(linked.video_asset.provider_asset_id, '998877665');
  assert.equal(linked.external_write_performed, false);
  assert.equal(linked.audit_event.redacted_asset_id, '[vimeo-id:...7665]');
});

test('Vimeo private synthetic smoke is gated and can run against a fully mocked safe target', async () => {
  const disabled = await vimeo.runVimeoPrivateSyntheticSmoke({ enabled: false, token: 'secret-token' });
  assert.equal(disabled.status, 'preview_only');
  assert.equal(disabled.smoke_ran, false);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-vimeo-smoke-'));
  const syntheticPath = path.join(tempDir, 'bna-synthetic-smoke-video.mp4');
  fs.writeFileSync(syntheticPath, Buffer.from('synthetic test media'));

  const client = makeClient([
    { name: 'BNA Vimeo Test', uri: '/users/12345', account: 'starter' },
    { data: [{ name: 'BNA Private Tests', uri: '/users/12345/projects/67890' }] },
    { data: [] },
    { uri: '/videos/222223333', link: 'https://vimeo.com/222223333', upload: { upload_link: 'https://upload.vimeo.test/tus/2' }, privacy: { view: 'nobody', embed: 'private' } },
    {},
    {},
    { uri: '/videos/222223333' },
  ]);

  const smoke = await vimeo.runVimeoPrivateSyntheticSmoke({
    enabled: true,
    token: 'secret-token',
    client,
    accountConfirmed: true,
    expectedAccountName: 'BNA Vimeo Test',
    testProjectName: 'BNA Private Tests',
    syntheticFile: syntheticPath,
  });

  assert.equal(smoke.status, 'private_test_uploaded');
  assert.equal(smoke.smoke_ran, true);
  assert.equal(smoke.destination.uri, '/users/12345/projects/67890');
  assert.equal(smoke.cleanup_or_test_only_state, 'test_only_marked');
  assert.equal(smoke.public_publish_performed, false);
  assert.equal(vimeo.assertNoVimeoSecrets(smoke, ['secret-token']).ok, true);
});

test('Vimeo readiness state vocabulary is explicit and contains no bare Blocked state', () => {
  assert.deepEqual(vimeo.VIMEO_READINESS_STATES, [
    'not_configured',
    'preview_only',
    'mock_tested',
    'credential_missing',
    'credential_invalid',
    'permission_missing',
    'test_target_missing',
    'private_test_ready',
    'private_test_uploaded',
    'manual_ready',
    'automated_ready',
    'live',
  ]);
  assert.equal(vimeo.VIMEO_READINESS_STATES.includes('Blocked'), false);
  const mock = vimeo.vimeoReadinessState('mock_tested', {
    reason: 'Mock contract tests passed without provider writes.',
    next_action: 'Configure a private synthetic test target for provider smoke.',
  });
  assert.equal(mock.status, 'mock_tested');
  assert.match(mock.reason, /Mock contract/);
  assert.match(mock.next_action, /private synthetic/);
});
