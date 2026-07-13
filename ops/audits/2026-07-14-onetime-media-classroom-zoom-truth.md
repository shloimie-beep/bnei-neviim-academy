# One Time Media / Classroom / Zoom Truth Audit - 2026-07-14

Requirement: `REQ-20260713-938`

Raw source: `RAW-20260713-010`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Live app under test: `https://join.onetimeonetime.com`

Deployed app SHA proved: `050170d3ce5e9d0ea8e0db5ca0fa96b369bff0b5`

## Result

`REQ-20260713-938` is complete as a truth/readiness closeout. The current One
Time Drive, Vimeo, classroom/member-library, transcript privacy, and Zoom state
is scoped to Rabbi Sheller / One Time and has repeatable no-write verification.

No Vimeo upload, Drive write/move, Google Classroom write, Zoom meeting,
registrant, webhook attendance write, member publication, access mutation,
email/WhatsApp send, payment action, provider mutation, credential mutation, or
production data mutation was performed.

## Evidence

- Local suite:
  `node --test tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-long-transcription.test.js tests/one-time-transcript-metadata.test.js tests/one-time-member-library.test.js tests/one-time-transcript-privacy.test.js tests/one-time-zoom-attendance-automation.test.js`
  passed `83/83`.
- Transcript privacy live smoke:
  `ops/live-smokes/2026-07-13T21-58-08-470Z-one-time-transcript-privacy-live-smoke.md`.
- Zoom attendance/readiness live smoke:
  `ops/live-smokes/2026-07-13T21-58-09-287Z-one-time-zoom-attendance-live-smoke.md`.
- Metadata/admin package live smoke:
  `ops/live-smokes/2026-07-13T21-58-34-161Z-one-time-metadata-review-live-smoke.md`.
- Classroom/member-library read-only live smoke:
  `ops/live-smokes/2026-07-13T21-58-34-168Z-one-time-classroom-library-readonly-live-smoke.md`.
- Prior Drive/video automation register:
  `tasks-pending/2026-07-13-onetime-drive-classroom-video-automation.md`.
- Integration readiness docs:
  `docs/integrations/onetime-vimeo-zoom-resend-readiness.md`.

## Current Truth

- Drive intake is first-party and One Time scoped. The local orchestrator
  resolves the configured video drop lane, waits for stable media evidence,
  dedupes jobs, drafts scoped content jobs, handles leases/retries/dead-letter
  states, and redacts Drive identifiers from safe reports. Real Drive writes,
  file moves, and production DB mutations remain approval gated.
- Vimeo remains the default researched video host, but automated private upload
  is still blocked on owner account/project/folder, plan/scope, and explicit
  synthetic-upload approval. Existing proof is read-only or mocked/synthetic.
- Classroom/member-library readback is live and scoped. Admin class packages,
  review classroom latest-video shape, synthetic member entitlement, and
  anonymous 401 gates passed without exposing private transcript/admin fields.
  Actual publication and Vimeo-origin package integration remain gated.
- Transcript privacy is live and read-only. The API returns body-free privacy
  readiness for `REQ-20260619-309`, blocks raw transcript/public helper dumps,
  blocks guessed speaker identity as student data, and ships the Operations
  deferred panel marker.
- Zoom automation is preview/readiness only. API status, session preview,
  webhook attendance preview, blocked meeting creation, and Operations UI
  guardrails passed. No meeting creation, registrant write, webhook attendance
  write, join URL exposure, recording read/write, transcript read/write,
  summary read/write, attendance correction write, portal publish, or external
  send is enabled.

## Remaining Gated Work

- `REQ-20260713-918` remains `Needs operator decision`: choose/create the
  private Vimeo test project/folder, confirm the account plan and upload/private
  scopes, and explicitly approve `BNA_VIMEO_PRIVATE_SMOKE=1` before any
  synthetic private upload.
- `REQ-20260713-919` remains open in the earlier Drive/classroom register for
  approved publication, parent/student latest-video proof, and Vimeo-origin
  package integration.
- `REQ-20260713-920` remains blocked for the visual UI implementation packet
  until authenticated Operations/member screenshot blockers and publication /
  Vimeo gates are resolved.
- Zoom Server-to-Server OAuth/owner account setup and any live meeting or
  registrant automation require separate owner approval and a new live-smoke
  gate.

## Closeout

The final-launch requirement is Done because its acceptance criteria were to
make the integration state current, One Time scoped, and truthful with blockers.
It is not an approval to perform provider writes or publish content.
