# Ramble Intake - 2026-07-13 - One Time Drive-to-Classroom Video Automation

## Raw Intake

Raw record: `raw-input/RAW-20260713-004-onetime-drive-classroom-video-automation.md`

The operator gave a goal-mode Codex packet to complete the existing One Time
Drive-to-classroom video automation workflow. The requested end-to-end path is:

Drive drop -> stable-file detection -> exactly-once content job -> conservative
edge edit -> private timestamped transcript -> title/description/Torah
metadata -> bot-knowledge handoff -> private/unlisted Vimeo upload -> class
review package -> approval-gated member publication -> latest parent/student
portal video -> older-class library view.

Literal credential material supplied in chat is not stored here.

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260713-004 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-13-onetime-drive-classroom-video-automation.md |
| Packet manifest | ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/MANIFEST.md |

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Complete the One Time Drive-to-classroom video automation goal packet through terminal statuses, starting with raw intake, packet DAG/control tower, current-state audit gates, and then unblocked implementation batches while keeping Vimeo credentials secret-safe. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260713-913, then REQ-20260713-914 through REQ-20260713-920 as gates allow |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260713-912 | Register raw source, router output, packet DAG, scope, exclusions, source mapping, and active-run collision constraints. | SRC-RAW-20260713-004-001, 003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | protocol | P0 | 00-control-tower | none | Raw record, register, and packet manifest exist; source statements mapped; provider writes separated; active dirty run not overwritten. | raw-input, tasks-pending, ops/prompt-packets | no | Done |
| REQ-20260713-913 | Audit current implementation against the requested Drive-to-classroom workflow and classify each capability as already satisfied, partial, stale, missing, blocked, or needs verification. | SRC-RAW-20260713-004-002 | same | Codex | current-state audit | P0 | 00-control-tower | REQ-20260713-912 | Required files/routes/schemas/tests inspected; comparison table produced; no duplicate pipeline created. | src/lib/bna/one-time-vimeo-studio-pipeline.js, scripts/one-time-vimeo-studio-pipeline.mjs, tests, Drive intake, classroom/library files | no | Done |
| REQ-20260713-914 | Implement or verify canonical Drive intake from the configured One Time Drive lane with stable-file admission, idempotent content jobs, leases, retry/dead-letter states, and source provenance. | SRC-RAW-20260713-004-004 | same | Codex | backend/workflow | P0 | 02-drive-intake-orchestrator | REQ-20260713-913 | Drive API/config path used; supported MIME/formats including safe MKV/OBS coverage where proven; duplicate prevention tests pass; no source-file mutation. | Drive intake map, new drive video orchestrator, job schema, tests | server-visible yes if runtime changes | Done |
| REQ-20260713-915 | Implement or verify conservative video edge editing with explicit sidecar priority, safe black/silence edge detection, optional transcript/audio-assisted suggestions, edit evidence, hashes, and output verification. | SRC-RAW-20260713-004-005 | same | Codex | media processing | P0 | 03-media-edit-and-long-transcription | REQ-20260713-913 | Original preserved; default opener zero; no middle cuts/effects/captions; output stream/duration/hash checks pass; reruns idempotent. | Vimeo studio pipeline, FFmpeg utilities, tests | no unless runtime UI/API changes | Done |
| REQ-20260713-916 | Implement long-form private transcription with audio extraction, provider-safe chunking, overlap/deduplication, timestamps, retries, versioning, hashes, and no transcript body in Git/logs. | SRC-RAW-20260713-004-006 | same | Codex | transcription | P0 | 03-media-edit-and-long-transcription | REQ-20260713-915 | Chunked transcript harness passes on synthetic/private fixture; transcript body redacted from reports; statuses draft/machine_complete/needs_review/approved/superseded/rejected supported. | transcription modules, OpenAI credential resolver, tests | no unless runtime changes | In progress - local harness committed/pushed/deployed; provider/private fixture integration pending |
| REQ-20260713-917 | Create versioned metadata generation and bot-knowledge handoff contracts for title, bullet description, Masechta/Perek/Mishnah/topic fields, confidence/review rules, transliteration, and scoped knowledge promotion. | SRC-RAW-20260713-004-007 | same | Codex | metadata/knowledge handoff | P0 | 04-transcript-metadata-and-knowledge-handoff | REQ-20260713-916 | Testable module exists; schema version recorded; review fields surfaced; knowledge handoff contains no raw transcript/private leakage. | metadata modules, helper knowledge/source grounding, tests | server-visible if API/UI changes | In progress - local contract committed/pushed/deployed; DB/review integration pending |
| REQ-20260713-918 | Complete Vimeo owner readiness and private upload packet: protected credential intake, owner account/project readback, synthetic private smoke, duplicate/retry/processing/playback/rollback evidence. | SRC-RAW-20260713-004-008, 011 | same | Codex + operator for external authorization | provider setup | P0 | 05-vimeo-owner-readiness-and-private-upload | REQ-20260713-912, DEC-20260713-006 | Keyholder credentials read back; direct bearer/upload readiness distinguished from app credentials; synthetic private upload only after explicit gate; no public publish. | src/lib/integrations/vimeo.js, scripts/vimeo-private-smoke.mjs, readiness docs/tests | no deploy unless runtime changes; external write gate required | In progress |
| REQ-20260713-919 | Build or verify review-package, class-session/member-library persistence, latest-video query, older-class library, parent/student entitlements, and workspace isolation. | SRC-RAW-20260713-004-009 | same | Codex | classroom/library | P0 | 06-class-package-classroom-and-latest-video | REQ-20260713-917, REQ-20260713-918 | Approval-gated publication; no cross-workspace video/class records; parent/student portals show only entitled approved videos; tests and live smoke where app-visible. | member library routes/files, public classroom/portal files, schema/tests | yes for app-visible changes | Not started |
| REQ-20260713-920 | Produce current-state visual audit and then scoped Rabbi content-processing UI packet with queue/details/review states, action placement, mobile/desktop screenshots, accessibility, action/route registry, tests, deploy/live smoke. | SRC-RAW-20260713-004-010 | same | Codex | product/UI | P0 | 01-current-state-visual-audit / 07-rabbi-content-processing-ui | REQ-20260713-912; PQC validation before UI code | Before screenshots and state matrix exist; PQC validates; UI implementation split into focused packet; after screenshots/live smoke required for Done. | content command center, public portals, action/route registries, UI audit scripts | yes | Blocked until current-state visual audit and PQC Definition of Ready pass |

## Parsed Tasks

No broad visible human task was created. This source is represented as Codex
requirements and child packets. Human-visible tasks should only be added for
specific operator decisions such as external account approvals.

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260713-006 | Treat the supplied Vimeo values as owner app credential material, not as `VIMEO_ACCESS_TOKEN`, unless a Vimeo `/me` bearer readback succeeds later. | Which supplied value is intended to be a user token versus client ID, and whether a separate valid owner user access token exists. Current evidence: both supplied values returned 401 when tested directly as bearer tokens; the existing local `VIMEO_ACCESS_TOKEN` returned 200 for `/me`. | Operator + Codex | Keep the supplied owner credential material in the local keyholder, but do not replace the working `VIMEO_ACCESS_TOKEN`; use the existing local access token for user-authenticated account reads until a valid owner bearer token is confirmed/generated. | Replace access token with either supplied value, but that currently breaks `/me`; rerun OAuth flow to create a least-privilege user token. | Misclassifying a client credential as a user token would block account reads and uploads. Keeping the valid access token preserves current read-only readiness. | Generate or confirm a least-privilege user access token with upload/edit/private/video_files/interact before real private upload smoke. | REQ-20260713-918 | In progress |

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260713-001 | Which production Drive folder ID/config variable is the canonical `04.00 Upload Here - Videos and Audio for Transcription` lane currently deployed with? | Drive intake must start from Drive itself and avoid hardcoding folder IDs. | Blocks REQ-20260713-914 implementation if not discoverable from current config. | Answered for local implementation: the orchestrator prefers `ONE_TIME_DRIVE_VIDEO_DROP_FOLDER_ID` and falls back to the repo Drive map `drive_map:videoDrop`; live deployed env readback still pending. |
| Q-20260713-002 | Should the first real pilot use an already-approved non-sensitive class recording, or remain synthetic until Rabbi/operator review? | Real class media may contain private/student-sensitive content. | Blocks real pilot only, not dry-run/synthetic work. | Needs operator decision later |

## Durable Memory Candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260713-001 | The owner Vimeo credential material was updated in local keyholder on 2026-07-13; both newly supplied values failed direct bearer `/me` readback, while the existing local user access token still reads the Shloimie Dratler account. | memory-topics/one-time-rabbi-sheller.md after closeout | Durable integration state, secret-redacted. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260713-912 | raw-input, tasks-pending, ops/prompt-packets | Register source and packets only. | Packet files exist; `npm run watchdog:protocol-drift` passed with zero findings after guardrail hardening. | pending | pending | not required |
| REQ-20260713-913 | one-time Vimeo studio/folder workflows, Drive intake map, classroom/library files, schema/tests | Produce current-state capability audit; classify satisfied/partial/missing/blocked capabilities. | `node --test tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-drive-intake-folder-map.test.js` passed 25/25; broader related run passed 44/45 with separate member-library UI text assertion failure. | pending | pending | not required |
| REQ-20260713-914 | `src/lib/bna/one-time-drive-video-orchestrator.js`, `scripts/one-time-drive-video-orchestrator.mjs`, `tests/one-time-drive-video-orchestrator.test.js`, `server.js`, `package.json` | Added no-write orchestrator planner for canonical folder resolution, stable-file admission, MKV/OBS-compatible media intake when metadata proves completeness, duplicate suppression, content-job drafts, leases, retries, dead-letter transitions, and safe reports. Added schema fields for source fingerprint, processing state, lease/retry/dead-letter metadata, and provenance. | `node --test tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js` passed 18/18; CLI dry run passed with no writes; live deploy/readback verified One Time commit `c9706382c8b8e5544797a94467e7ea54367850f0`, BNA descendant `be58601d50ce467193f02bc1b16566b23ba173a7`, and named smoke evidence files exist. | c9706382c8b8e5544797a94467e7ea54367850f0 | origin/master | One Time and BNA live readback verified |
| REQ-20260713-915 | `src/lib/bna/one-time-vimeo-studio-pipeline.js`, `src/lib/bna/one-time-vimeo-folder-library.js`, `tests/one-time-vimeo-studio-pipeline.test.js`, `tests/one-time-vimeo-folder-library-workflow.test.js` | Set default opener to zero unless explicitly requested; preserved explicit sidecar/CLI opener support; added `.mkv` support through studio and folder-library handoff; skip opener render/concat when opener is zero; added rendered-output verification with SHA-256, expected/probed duration, dimensions, audio, and tolerance evidence. | Consolidated One Time Drive/media/transcription/metadata suite passed 54/54 on 2026-07-13; media workflow includes real local FFmpeg render smoke. | 2bf0c0d0e31c969f67556e1ee163ff0b9aa56ce6 | origin/master | One Time deploy-info readback `a8df4c9b9cc091028105a16430aae6927cd0b429` contains `2bf0c0d0e31c969f67556e1ee163ff0b9aa56ce6`; separate-instance and provider-route live smokes passed at `a8df4c9b9cc091028105a16430aae6927cd0b429`. |
| REQ-20260713-916 | `src/lib/bna/one-time-long-transcription.js`, `tests/one-time-long-transcription.test.js`, `server.js` | Added One Time-specific long-form transcription harness for overlapping chunk plans, audio extraction command plans, timestamp merge/dedupe, retry/dead-letter chunk states, private transcript version records, hashes, safe reports, and expanded transcript lifecycle statuses. | Consolidated One Time Drive/media/transcription/metadata suite passed 54/54; safe report tests prove private transcript body is omitted. Authenticated live transcript-privacy smoke logged in and then failed on the Operations-page marker, so no live UI marker proof is claimed. | 2bf0c0d0e31c969f67556e1ee163ff0b9aa56ce6 | origin/master | One Time deploy-info readback `a8df4c9b9cc091028105a16430aae6927cd0b429` contains the local harness; provider/private fixture integration remains pending. |
| REQ-20260713-917 | `src/lib/bna/one-time-transcript-metadata.js`, `tests/one-time-transcript-metadata.test.js` | Added versioned metadata draft and bot-knowledge handoff contracts with title/Torah field extraction, confidence/review rules, transliteration, sidecar priority, approval gates, provider-scoped private handoff, and no raw transcript body in handoff. | Consolidated One Time Drive/media/transcription/metadata suite passed 54/54; approved handoff omits raw transcript body and remains provider-scoped. | 2bf0c0d0e31c969f67556e1ee163ff0b9aa56ce6 | origin/master | One Time deploy-info readback `a8df4c9b9cc091028105a16430aae6927cd0b429` contains the local contract; DB promotion worker/review UI integration remains pending. |
| REQ-20260713-918 | local keyholder, Vimeo read-only API | Update owner credential material, verify app/client and existing access-token readbacks without upload. | Existing access token `/me` passed; both newly supplied values returned 401 when tested directly as bearer tokens; prior client-credential exchange with supplied material succeeded but did not provide user-video access. | n/a, secret store outside repo | n/a | not required |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260713-912 | Done | This register, packet manifest, `00-control-tower`, and `current-state-capability-audit` | New raw/register/packet/audit files | `npm run watchdog:protocol-drift` PASS after Product Quality guardrail hardening | Continue `REQ-20260713-914`; active execution-run files remain owned by the current run lane. |
| REQ-20260713-913 | Done | `ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/current-state-capability-audit.md` | New audit file only | Targeted One Time Drive/Vimeo tests passed 25/25; broader related run passed 44/45 and exposed a separate member-library UI text assertion failure. | Drive orchestrator, long-form transcription, metadata/knowledge handoff, and upload write proof remain open child packets. |
| REQ-20260713-914 | Done | `ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/02-drive-intake-orchestrator.md` | Orchestrator module/script/test plus `server.js` schema and `package.json` script | Targeted orchestrator/Drive-map suite passed 18/18; CLI dry run passed; One Time and BNA deploy-info readbacks verified on 2026-07-13. | Downstream media/transcription/metadata/Vimeo/classroom packets remain separate; no Drive/database/Vimeo writes were performed by this packet. |
| REQ-20260713-915 | Done | `ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/03-media-edit-and-long-transcription.md`; live deploy-info `a8df4c9b9cc091028105a16430aae6927cd0b429` contains media commit `2bf0c0d0e31c969f67556e1ee163ff0b9aa56ce6` | Studio/folder media workflow code and tests | Consolidated One Time Drive/media/transcription/metadata suite passed 54/54; live separate-instance and provider-route smokes passed at exact SHA `a8df4c9b9cc091028105a16430aae6927cd0b429`. | Downstream transcription provider/private fixture, metadata promotion, Vimeo upload, classroom publication, and UI packets remain separate requirements. |
| REQ-20260713-916 | In progress | `ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/03-media-edit-and-long-transcription.md`; local harness deployed as ancestor of live One Time SHA `a8df4c9b9cc091028105a16430aae6927cd0b429` | New long-transcription harness and transcript status schema update | Consolidated suite passed 54/54; safe report omits transcript bodies. Authenticated transcript-privacy live smoke logged in but failed on missing Operations marker, so no UI marker proof is claimed. | Provider integration/private fixture run remains pending. |
| REQ-20260713-917 | In progress | `ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/04-transcript-metadata-and-knowledge-handoff.md`; local contract deployed as ancestor of live One Time SHA `a8df4c9b9cc091028105a16430aae6927cd0b429` | Metadata/handoff module and tests | Consolidated suite passed 54/54; approved handoff omits raw transcript body and remains provider-scoped. | DB promotion worker/review UI integration remains pending. |
| REQ-20260713-918 | In progress | Secret-redacted fingerprints and read-only Vimeo results in raw/register | Keyholder files outside repo | Existing access token `/me` passed; both newly supplied values failed as bearer tokens; targeted Vimeo/Drive tests passed. | Private synthetic upload/write proof not rerun. |
