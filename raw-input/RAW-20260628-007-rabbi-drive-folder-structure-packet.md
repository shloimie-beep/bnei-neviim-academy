# RAW-20260628-007 - Rabbi Drive Folder Structure Packet

Source: Codex chat goal-mode execution packet.

Captured at: 2026-06-28T18:20:00+03:00

Privacy classification: approved_targeted_drive_folder_create_repo_safe

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Raw Source

Shloimie supplied a `BNA_GOAL_MODE_EXECUTION_PACKET` for PR #49 / Issue #41.

Goal: create and verify the actual Rabbi Scheller / One Time Drive drop-off
structure needed now. Rabbi used the current broad media intake folder and
uploaded an old PowerPoint. The system needs a safe, organized folder system
for future videos, meetings, slideshows, source sheets, and output drafts.

Exact folder Rabbi used:

`https://drive.google.com/drive/folders/1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv`

Known source-of-truth:

- This folder is documented as `04 Content and Media Intake` / media intake
  folder under `One Time Mishnah Class - Rabbi Elie Scheller`.
- Existing docs say it is for Rabbi video drops, worksheets, source sheets,
  recordings, organic clips, ad candidates, and publishing handoff notes.
- Rabbi already dropped an old PowerPoint into this folder.
- This broad folder is acceptable as a parent folder, but it should not be the
  only operational drop-off lane.

Allowed in this batch:

- read Drive folder metadata and child listings;
- create missing Drive folders/subfolders under the Rabbi/One Time project
  folder;
- update repo-safe folder maps/docs/evidence;
- update backend mapping/config;
- update UI links/buttons/status labels;
- add tests;
- classify the uploaded PowerPoint/slideshow as source material;
- create sanitized evidence;
- comment/update PR or create a clean continuation PR if needed.

Forbidden in this batch:

- no production apply or `--apply`;
- no production DB mutation;
- no student portal/question/score/task writes;
- no class backfill;
- no raw transcript-body export;
- no AI calls;
- no sends/publishes/social/email/WhatsApp;
- no Drive file deletes;
- no Drive moves by default;
- no credential/account/DNS changes.

Required folder structure under `04 Content and Media Intake`:

1. `04.00 Upload Here - Videos and Audio for Transcription`
2. `04.05 Upload Here - Slideshows and Source Materials`
3. `04.10 Ingestion Queue - Transcribe and Parse`
4. `04.20 Source Material Review`
5. `04.30 Social and Newsletter Output Drafts - Platform Review`
6. `04.90 Approved and Posted Outputs`
7. `04.99 Needs Shloimie Decision`

Required Drive behavior:

- Inspect exact parent folder `1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv`.
- Confirm it is `04 Content and Media Intake`.
- List child files/folders.
- Find or diagnose Rabbi's uploaded PowerPoint.
- If visible, record sanitized metadata, classify as `slideshow_reference` and
  `source_material`, mark `no_transcription_required`, mark
  `index_only_until_review`, do not transcribe, and do not publish/send/use for
  newsletter automatically.
- Reuse existing folders; do not create duplicates with slightly different
  names.
- Do not delete anything.
- Do not move anything by default.

Required UI behavior:

- Super-admin view shows clickable/copyable links for project root, parent
  folder, and all seven lanes with purpose/audience/transcription/source-only
  status.
- Rabbi-facing view shows only approved drop-off links:
  videos/audio upload and slideshows/source-material upload.
- Rabbi-facing view must not expose internal ingestion queues, draft folders,
  approved archive, private transcript library, raw backend IDs, production DB
  info, or admin-only evidence links.

Required verification:

- `node --check` changed JS/CJS files.
- Focused tests for Drive folder classification and UI link rendering.
- `npm run bna:run:validate`
- `npm run bna:run:next`
- `npm run bna:run:status`
- `npm run secrets:audit`
- JSON/JSONL parse checks.
- Privacy scan for raw transcript bodies, credential strings, private
  student/family data, and forbidden raw Drive URLs/IDs.
- `git diff --check`

Final answer must include:

1. exact folder link to send Rabbi for videos/audio;
2. exact folder link to send Rabbi for slideshows/source sheets/materials;
3. whether the old PowerPoint was found;
4. whether it was classified as source material and excluded from
   transcription;
5. whether super-admin UI now has clickable/copyable Drive links;
6. exact next safe command.
