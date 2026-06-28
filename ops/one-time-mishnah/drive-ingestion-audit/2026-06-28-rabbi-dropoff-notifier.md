# Rabbi Drop-Off Email Notifier

Date: 2026-06-28

Status: active locally through Windows Task Scheduler.

## Main Workflow

Rabbi-facing upload folders:

- Videos/audio for transcription: https://drive.google.com/drive/folders/1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t
- Slideshows/source sheets/materials: https://drive.google.com/drive/folders/15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp

Actual Drive title corrected:

- `04.00 Upload Here - Rabbi Video Drops`
- changed to `04.00 Upload Here - Videos and Audio for Transcription`

## Notification Behavior

- Watcher script: `scripts/notify-one-time-drive-dropoffs.mjs`
- Manual runner: `scripts/run-one-time-drive-dropoff-notifier.ps1`
- Scheduled launcher: `scripts/run-one-time-drive-dropoff-notifier.vbs`
- Scheduled task name: `BNA One Time Drive Dropoff Email`
- Frequency: every 5 minutes.
- Recipient: operator email configured in the local scheduled task.
- State file: `.runtime/one-time-drive-dropoff-notifier/state.json`
- Log file: `.runtime/one-time-drive-dropoff-notifier/scheduled-task.log`

The watcher emails new file notifications with:

- file name;
- folder lane;
- Drive view link;
- direct download link when the uploaded file is an original downloadable Drive file.

For PowerPoints, the watcher prefers the original `.pptx` over a same-title
native Google Slides conversion so embedded media is preserved for desktop
PowerPoint download/playback.

## Verification

- Baseline run marked existing files in the two watched folders as seen: 0.
- Local Gmail send path test passed with setup-test message id `19f0f4ac1dcbce47`.
- Manual watcher run checked both folders and found 0 current items.
- Scheduled task was registered and manually triggered.
- Task Scheduler readback showed `Last Result: 0`.
- Scheduled run log recorded both folders, 0 items, 0 new notifications.

## Guardrails

This watcher sends only the operator notification email. It does not transcribe,
publish, call AI, export raw transcripts, write student/member portals, update
scores/progress, mutate production DB rows, backfill classes, move/delete Drive
files, post social/newsletter output, or grant access.
