const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID,
  ONE_TIME_VIDEO_DROP_FOLDER_ID,
  ONE_TIME_SOURCE_MATERIAL_FOLDER_ID,
  ONE_TIME_VIDEO_DROP_STAGE,
  ONE_TIME_SOURCE_MATERIAL_STAGE,
  ONE_TIME_DROPOFF_FOLDERS,
  buildOneTimeDriveDropoffContentJobPayload,
  buildOneTimeDriveDropoffEmail,
  hasOneTimeDriveDropoffEmailSent,
} = require('../src/lib/bna/one-time-drive-dropoff-email');

test('video/audio Drive dropoff builds an email notification payload with open and download links', () => {
  const payload = buildOneTimeDriveDropoffContentJobPayload({
    id: 'drive-video-123',
    name: 'Rabbi class recording.mov',
    mimeType: 'video/quicktime',
    parents: [ONE_TIME_VIDEO_DROP_FOLDER_ID],
    createdTime: '2026-06-30T07:00:00.000Z',
    modifiedTime: '2026-06-30T07:01:00.000Z',
  });

  assert.equal(payload.project_key, 'one_time_mishnah_class');
  assert.equal(payload.workspace_key, 'rabbi_sheller_provider');
  assert.equal(payload.drive_stage, ONE_TIME_VIDEO_DROP_STAGE);
  assert.equal(payload.drive_folder_id, ONE_TIME_VIDEO_DROP_FOLDER_ID);
  assert.equal(payload.parse_json.drive_dropoff_classification, 'video_audio_for_transcription');
  assert.equal(payload.parse_json.video_audio_for_transcription, true);
  assert.equal(payload.parse_json.open_url, 'https://drive.google.com/file/d/drive-video-123/view');
  assert.equal(payload.parse_json.download_url, 'https://drive.google.com/uc?export=download&id=drive-video-123');

  const email = buildOneTimeDriveDropoffEmail(payload, { jobId: 501 });
  assert.match(email.subject, /Rabbi Drive dropoff received: Rabbi class recording\.mov/);
  assert.match(email.text, /Watched folder: 04\.00 Upload Here - Rabbi Video Drops/);
  assert.match(email.text, /Classification: Video\/audio for transcription/);
  assert.match(email.text, /File type: video\/quicktime/);
  assert.match(email.text, /Created: 2026-06-30T07:00:00\.000Z/);
  assert.match(email.text, /Modified: 2026-06-30T07:01:00\.000Z/);
  assert.match(email.text, /Internal reference: content job #501/);
  assert.match(email.text, /Open in Drive: https:\/\/drive\.google\.com\/file\/d\/drive-video-123\/view/);
  assert.match(email.text, /Download original file: https:\/\/drive\.google\.com\/uc\?export=download&id=drive-video-123/);
});

test('presentation and source-material Drive dropoff preserves original-file download links', () => {
  const payload = buildOneTimeDriveDropoffContentJobPayload({
    id: 'drive-pptx-456',
    name: 'Sanhedrin source deck.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    parents: [ONE_TIME_SOURCE_MATERIAL_FOLDER_ID],
    webViewLink: 'https://docs.google.com/presentation/d/drive-pptx-456/edit?usp=drive_link&rtpof=true&sd=true',
  });

  assert.equal(payload.drive_stage, ONE_TIME_SOURCE_MATERIAL_STAGE);
  assert.equal(payload.drive_folder_id, ONE_TIME_SOURCE_MATERIAL_FOLDER_ID);
  assert.equal(payload.parse_json.drive_dropoff_classification, 'slideshow_source_sheet_material');
  assert.equal(payload.parse_json.source_material_intake, true);
  assert.equal(payload.parse_json.presentation_intake, true);
  assert.equal(payload.parse_json.content_kind, 'one_time_powerpoint_presentation');
  assert.equal(payload.parse_json.open_url, 'https://drive.google.com/file/d/drive-pptx-456/view');
  assert.equal(payload.parse_json.download_url, 'https://drive.google.com/uc?export=download&id=drive-pptx-456');

  const email = buildOneTimeDriveDropoffEmail(payload, { jobId: 'job-456' });
  assert.match(email.text, /Watched folder: 04\.05 Upload Here - Slideshows and Source Materials/);
  assert.match(email.text, /Classification: Slideshow\/source sheet\/material/);
  assert.match(email.text, /Download original file: https:\/\/drive\.google\.com\/uc\?export=download&id=drive-pptx-456/);
});

test('current content/media intake folder is watched for PowerPoint files only', () => {
  const payload = buildOneTimeDriveDropoffContentJobPayload({
    id: 'drive-current-intake-pptx',
    name: 'Bava Basra.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    parents: [ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID],
  });

  assert.equal(payload.drive_stage, ONE_TIME_SOURCE_MATERIAL_STAGE);
  assert.equal(payload.drive_folder_id, ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID);
  assert.equal(payload.parse_json.presentation_intake, true);
  assert.equal(payload.parse_json.source_material_intake, true);
  assert.equal(payload.parse_json.watched_folder_label, '04 Content and Media Intake');

  assert.throws(
    () => buildOneTimeDriveDropoffContentJobPayload({
      id: 'drive-current-intake-audio',
      name: 'current folder audio.m4a',
      mimeType: 'audio/mp4',
      parents: [ONE_TIME_CONTENT_MEDIA_INTAKE_FOLDER_ID],
    }),
    /Only PowerPoint or Google Slides files/
  );
});

test('Google Slides source material uses Drive open link and pptx export download link', () => {
  const payload = buildOneTimeDriveDropoffContentJobPayload({
    id: 'slides-789',
    name: 'Mishnah class sources',
    mimeType: 'application/vnd.google-apps.presentation',
    parents: [ONE_TIME_SOURCE_MATERIAL_FOLDER_ID],
  });

  assert.equal(payload.parse_json.open_url, 'https://docs.google.com/presentation/d/slides-789/edit');
  assert.equal(payload.parse_json.download_url, 'https://docs.google.com/presentation/d/slides-789/export/pptx');
});

test('dropoff email sent state prevents duplicate notification attempts', () => {
  assert.equal(hasOneTimeDriveDropoffEmailSent({ email_sent: true }), true);
  assert.equal(hasOneTimeDriveDropoffEmailSent({ dropoff_email_notification: { sent: true } }), true);
  assert.equal(hasOneTimeDriveDropoffEmailSent({ presentation_email_notification: { sent: true } }), true);
  assert.equal(hasOneTimeDriveDropoffEmailSent({ drive_dropoff_email_sent: true }), true);
  assert.equal(hasOneTimeDriveDropoffEmailSent({ dropoff_email_notification: { sent: false } }), false);
});

test('email-only watcher targets the approved Drive dropoff folders and no polling bridge', () => {
  const script = fs.readFileSync('scripts/one-time-drive-dropoff-email-watch.mjs', 'utf8');
  assert.equal(ONE_TIME_DROPOFF_FOLDERS.length, 3);
  assert.match(script, /ONE_TIME_DROPOFF_FOLDERS/);
  assert.match(script, /\/api\/bna\/one-time\/drive-dropoff-intake/);
  assert.match(script, /notify_email: true/);
  assert.doesNotMatch(script, /telegram-kimi-bridge/);
  assert.doesNotMatch(script, /getUpdates/);
  assert.doesNotMatch(script, /sendReply/);
  assert.doesNotMatch(script, /telegramRequest/);
});

test('scheduler registration points to the email-only watcher and keeps the five-minute task contract', () => {
  const ps1 = fs.readFileSync('scripts/register-one-time-drive-dropoff-notifier.ps1', 'utf8');
  assert.match(ps1, /BNA One Time Drive Dropoff Email/);
  assert.match(ps1, /\[int\]\$EveryMinutes = 5/);
  assert.match(ps1, /one-time-drive-dropoff-email-watch\.mjs/);
  assert.match(ps1, /Recipient configured/);
  assert.doesNotMatch(ps1, /telegram-kimi-bridge/);
});

test('server route is email-only, idempotent, and registry-covered', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const routeStart = server.indexOf("app.post('/api/bna/one-time/drive-dropoff-intake'");
  const routeEnd = server.indexOf("app.post('/api/bna/one-time/presentation-intake'", routeStart);
  assert.notEqual(routeStart, -1, 'drive dropoff route is present');
  assert.notEqual(routeEnd, -1, 'presentation route follows drive dropoff route');
  const routeBlock = server.slice(routeStart, routeEnd);
  assert.match(routeBlock, /hasOneTimeDriveDropoffEmailSent/);
  assert.match(server, /duplicate_drive_file_email_already_sent/);
  assert.match(server, /routePath === '\/api\/bna\/one-time\/drive-dropoff-intake' && method === 'POST'/);
  assert.match(server, /routePath === '\/api\/bna\/one-time\/presentation-intake' && method === 'POST'/);
  assert.doesNotMatch(routeBlock, /sendReply|getUpdates|telegramRequest/i);

  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const route = routeRegistry.routes.find((item) => item.route === '/api/bna/one-time/drive-dropoff-intake');
  assert.ok(route, 'route registry includes drive dropoff intake endpoint');
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /no Drive mutation, Telegram notification/);
});

test('Operations links still render for presentation and source-material jobs', () => {
  const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
  assert.match(operationsHtml, /function isPresentationContentJob/);
  assert.match(operationsHtml, /source_material_intake === true/);
  assert.match(operationsHtml, /drive_dropoff_classification === 'slideshow_source_sheet_material'/);
  assert.match(operationsHtml, /function contentDownloadHref/);
  assert.match(operationsHtml, /Open presentation/);
  assert.match(operationsHtml, /Download presentation/);
});
