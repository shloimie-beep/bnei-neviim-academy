const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildDropoffEmail,
  buildDropoffNotifications,
  driveFileDownloadUrl,
  isDirectDownloadCandidate,
  isNativeGoogleFile,
  watchedDropoffLanesFromMap,
} = require('../src/lib/bna/one-time-drive-dropoff-notifier');

const driveMap = JSON.parse(fs.readFileSync('ops/one-time-mishnah-class/drive-social-ingestion-map.json', 'utf8'));
const script = fs.readFileSync('scripts/notify-one-time-drive-dropoffs.mjs', 'utf8');
const runner = fs.readFileSync('scripts/run-one-time-drive-dropoff-notifier.ps1', 'utf8');
const scheduledRunner = fs.readFileSync('scripts/run-one-time-drive-dropoff-notifier.vbs', 'utf8');
const registerScript = fs.readFileSync('scripts/register-one-time-drive-dropoff-notifier.ps1', 'utf8');

test('dropoff notifier watches only the two Rabbi-facing intake folders', () => {
  const lanes = watchedDropoffLanesFromMap(driveMap);
  assert.equal(lanes.length, 2);
  assert.deepEqual(lanes.map((lane) => lane.key), ['videoDrop', 'sourceMaterials']);
  assert.ok(lanes.every((lane) => lane.rabbi_facing));
  assert.equal(lanes.find((lane) => lane.key === 'videoDrop').triggers_transcription, true);
  assert.equal(lanes.find((lane) => lane.key === 'sourceMaterials').source_material_only, true);
});

test('dropoff notifier creates direct download links only for original Drive files', () => {
  const pptx = {
    id: 'pptx-file',
    name: 'Sanhedrin.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  const nativeSlides = {
    id: 'slides-file',
    name: 'Sanhedrin',
    mimeType: 'application/vnd.google-apps.presentation',
  };

  assert.equal(isNativeGoogleFile(nativeSlides), true);
  assert.equal(isDirectDownloadCandidate(pptx), true);
  assert.equal(isDirectDownloadCandidate(nativeSlides), false);
  assert.equal(driveFileDownloadUrl(pptx), 'https://drive.google.com/uc?export=download&id=pptx-file');
  assert.equal(driveFileDownloadUrl(nativeSlides), '');
});

test('dropoff notifier suppresses converted native Slides when original pptx exists', () => {
  const lanes = watchedDropoffLanesFromMap(driveMap);
  const sourceLane = lanes.find((lane) => lane.key === 'sourceMaterials');
  const filesByLane = {
    videoDrop: [],
    sourceMaterials: [
      {
        id: 'native-slides',
        name: 'Sanhedrin',
        mimeType: 'application/vnd.google-apps.presentation',
        webViewLink: 'https://docs.google.com/presentation/d/native-slides/edit',
      },
      {
        id: 'original-pptx',
        name: 'Sanhedrin.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        webViewLink: 'https://docs.google.com/presentation/d/original-pptx/edit?rtpof=true',
      },
    ],
  };

  const { notifications, suppressions, seenUpdates } = buildDropoffNotifications({
    lanes: [sourceLane],
    filesByLane,
    state: { seen_file_ids: {} },
  });

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].file_id, 'original-pptx');
  assert.equal(notifications[0].direct_download_available, true);
  assert.match(notifications[0].download_url, /original-pptx/);
  assert.equal(suppressions.length, 1);
  assert.equal(suppressions[0].id, 'native-slides');
  assert.equal(seenUpdates.length, 2);
});

test('dropoff email explains original PowerPoint download behavior and guardrails', () => {
  const { subject, text } = buildDropoffEmail({
    notifications: [
      {
        file_name: 'Sanhedrin.pptx',
        lane_title: '04.05 Upload Here - Slideshows and Source Materials',
        route: 'slideshow/source-material',
        view_url: 'https://docs.google.com/presentation/d/original-pptx/edit?rtpof=true',
        download_url: 'https://drive.google.com/uc?export=download&id=original-pptx',
        source_material_only: true,
        triggers_transcription: false,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      },
    ],
    scannedAt: '2026-06-28T00:00:00.000Z',
  });

  assert.match(subject, /New Rabbi Drive upload/);
  assert.match(text, /Download original file: https:\/\/drive\.google\.com\/uc\?export=download&id=original-pptx/);
  assert.match(text, /desktop PowerPoint/);
  assert.match(text, /does not publish, transcribe, send to students, or change any production data/);
});

test('dropoff notifier CLI and scheduler wrapper keep send mode explicit', () => {
  assert.match(script, /--send/);
  assert.match(script, /--mark-existing/);
  assert.match(script, /ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO/);
  assert.match(runner, /notify-one-time-drive-dropoffs\.mjs/);
  assert.match(runner, /\$Send/);
  assert.match(runner, /\$MarkExisting/);
  assert.match(scheduledRunner, /-Send/);
  assert.match(registerScript, /run-one-time-drive-dropoff-notifier\.vbs/);
  assert.match(registerScript, /New-ScheduledTaskAction/);
  assert.match(registerScript, /-WorkingDirectory \$RepoRoot/);
});
