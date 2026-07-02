const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  ONE_TIME_PRESENTATION_DRIVE_STAGE,
  ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID,
  isOneTimePresentationFile,
  drivePresentationOpenUrl,
  drivePresentationDownloadUrl,
  buildOneTimePresentationContentJobPayload,
  buildOneTimePresentationEmail,
} = require('../src/lib/bna/one-time-presentation-intake');

test('One Time presentation intake detects PowerPoint and Google Slides files', () => {
  assert.equal(isOneTimePresentationFile({
    name: 'Sanhedrin New.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  }), true);
  assert.equal(isOneTimePresentationFile({
    name: 'Rabbi source deck',
    mimeType: 'application/vnd.google-apps.presentation',
  }), true);
  assert.equal(isOneTimePresentationFile({
    name: 'Source Material.PPSX',
    mimeType: 'application/octet-stream',
  }), true);
  assert.equal(isOneTimePresentationFile({
    name: 'class recording.mp4',
    mimeType: 'video/mp4',
  }), false);
});

test('One Time presentation payload preserves Drive source and exposes open/download URLs', () => {
  const file = {
    id: 'drive-file-123',
    name: 'Sanhedrin New.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    webViewLink: 'https://drive.google.com/file/d/drive-file-123/view',
    parents: [ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID],
    createdTime: '2026-06-30T10:00:00.000Z',
  };
  const payload = buildOneTimePresentationContentJobPayload(file);
  assert.equal(payload.project_key, 'one_time_mishnah_class');
  assert.equal(payload.workspace_key, 'rabbi_sheller_provider');
  assert.equal(payload.drive_stage, ONE_TIME_PRESENTATION_DRIVE_STAGE);
  assert.equal(payload.drive_file_id, 'drive-file-123');
  assert.equal(payload.drive_folder_id, ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID);
  assert.equal(payload.parse_json.presentation_intake, true);
  assert.equal(payload.parse_json.preserve_original, true);
  assert.equal(payload.parse_json.open_url, 'https://drive.google.com/file/d/drive-file-123/view');
  assert.equal(payload.parse_json.download_url, 'https://drive.google.com/uc?export=download&id=drive-file-123');
});

test('uploaded PowerPoint open links use Drive file view even when Drive returns an editor preview link', () => {
  const file = {
    id: 'drive-file-mobile',
    name: 'Bava Basra.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    webViewLink: 'https://docs.google.com/presentation/d/drive-file-mobile/edit?usp=drive_link&rtpof=true&sd=true',
    parents: [ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID],
  };
  assert.equal(drivePresentationOpenUrl(file), 'https://drive.google.com/file/d/drive-file-mobile/view');

  const payload = buildOneTimePresentationContentJobPayload(file);
  assert.equal(payload.media_url, 'https://drive.google.com/file/d/drive-file-mobile/view');
  assert.equal(payload.parse_json.open_url, 'https://drive.google.com/file/d/drive-file-mobile/view');
  assert.equal(payload.parse_json.download_url, 'https://drive.google.com/uc?export=download&id=drive-file-mobile');
});

test('Google Slides links open in Slides and export as pptx', () => {
  const file = {
    id: 'slides-456',
    name: 'Mishnah Sources',
    mimeType: 'application/vnd.google-apps.presentation',
  };
  assert.equal(drivePresentationOpenUrl(file), 'https://docs.google.com/presentation/d/slides-456/edit');
  assert.equal(drivePresentationDownloadUrl(file), 'https://docs.google.com/presentation/d/slides-456/export/pptx');
});

test('One Time presentation email names the Rabbi PowerPoint and includes both links', () => {
  const payload = buildOneTimePresentationContentJobPayload({
    id: 'drive-file-789',
    name: 'Sanhedrin New.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  const email = buildOneTimePresentationEmail(payload);
  assert.match(email.subject, /Rabbi sent a PowerPoint presentation: Sanhedrin New\.pptx/);
  assert.match(email.text, /Open presentation: https:\/\/drive\.google\.com\/file\/d\/drive-file-789\/view/);
  assert.match(email.text, /Download presentation: https:\/\/drive\.google\.com\/uc\?export=download&id=drive-file-789/);
  assert.match(email.html, /Download presentation/);
});

test('server, bridge, UI, env, and registries are wired for PowerPoint intake', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
  const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

  assert.match(server, /app\.post\('\/api\/bna\/one-time\/presentation-intake'/);
  assert.match(server, /sendOneTimePresentationNotificationEmail/);
  assert.match(server, /duplicate_content_job_no_resend/);
  assert.match(server, /recordOneTimePresentationEmailResult/);

  assert.match(bridge, /maybeAutoIngestOneTimePresentations/);
  assert.match(bridge, /\/api\/bna\/one-time\/presentation-intake/);
  assert.match(bridge, /ONE_TIME_PRESENTATION_SOURCE_FOLDER_ID/);

  assert.match(operationsHtml, /function contentDownloadHref/);
  assert.match(operationsHtml, /Download presentation/);
  assert.match(operationsHtml, /Open presentation/);

  assert.match(envExample, /ONETIME_POWERPOINT_NOTIFY_EMAIL=/);

  const route = routeRegistry.routes.find((item) => item.route === '/api/bna/one-time/presentation-intake');
  assert.ok(route, 'route registry includes presentation intake endpoint');
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /duplicate Drive files do not re-send email/);

  const actionIds = new Set(actionRegistry.actions.map((item) => item.action_id));
  assert.equal(actionIds.has('ACTION-ONETIME-PRESENTATION-OPEN'), true);
  assert.equal(actionIds.has('ACTION-ONETIME-PRESENTATION-DOWNLOAD'), true);
});
