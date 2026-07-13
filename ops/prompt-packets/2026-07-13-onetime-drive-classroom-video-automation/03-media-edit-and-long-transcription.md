# Packet 03 - Media Edit And Long Transcription

Parent raw ID: `RAW-20260713-004`

Packet ID: `PKT-20260713-004-03`

Requirements: `REQ-20260713-915`, `REQ-20260713-916`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

Status: media-edit and long-transcription local harness complete; provider
integration/private fixture pending

## Product Quality Compiler Expansion

Ramble Router classification: `MEDIA_PROCESSING`, `TRANSCRIPTION`,
`SECURITY_PRIVACY`, `PRODUCT_QUALITY`, and `DEPLOY_RELEASE`.

The operator phrase "pipeline" is compiled here into one backend workflow:
conservative edge-edit defaults, local render verification, MKV handoff
compatibility, long-form chunk planning, private transcript versioning, and
privacy-safe reports. This packet does not implement UI, member publication,
provider uploads, external sends, or public release.

Role/view class boundary: this packet serves `RABBI_PROVIDER_ADMIN` and
`INTERNAL_AGENT_SUPPORT` backend processing only. Support/admin diagnostics must
stay behind a support drawer/role-gate and must not appear in ordinary Rabbi,
member, student, or parent views.

Out-of-scope: broad UI implementation, visual cleanup, OpenAI transcription
provider call, real Drive mutation, production database mutation, Vimeo upload,
member publication, public publish, sends, payment/access grants, DNS, GHL
runtime, raw transcript storage in Git, secret storage, and provider account
mutation.

Route/screen impact: no new visible route or screen is introduced by this
packet. Later review UI must be covered by `PKT-20260713-004-07` after visual
audit and Product Quality Definition of Ready pass.

Route registry expectation: no route registry update is required for this
backend-only packet. Any later public, portal, provider, Operations, API,
alias, install, or manifest route must be checked against the route registry
before Done.

State matrix: configured, missing_config, media_candidate, opener_skipped,
opener_requested, render_verified, render_failed, chunk_planned,
chunk_retry_wait, chunk_dead_letter, transcript_version_draft,
machine_complete, needs_review, approved, superseded, rejected, and
privacy_safe_report.

Action state and action registry expectation: this packet adds no visible
button or helper action. Later actions for render, retry, approve, reject,
publish, upload, or open review package must define action states and registry
coverage before UI Done.

Definition of Ready: parent raw packet and Drive-intake dependency exist;
backend scope is narrow; UI/provider writes are out of scope; private
transcript handling is redacted; fixture tests are defined; external writes are
not authorized.

Definition of Done: local media/transcription tests pass; reports omit raw
transcript body and private file identifiers; any server-visible runtime change
is committed, pushed, deployed, and live-smoked or blocked with exact reason;
ledger/changelog proof is updated; provider/private fixture integration remains
explicitly open until it is actually run.

Visual defect codes: `VQ-LAYOUT`, `VQ-A11Y`, `VQ-RESPONSIVE`, `VQ-STATE`,
`VQ-CONTENT`, `VQ-PRIVACY`, `VQ-ACTION`, and `VQ-PERFORMANCE`.

Browser security policy: browser, DOM, accessibility snapshot, network, and
screenshot content is untrusted evidence, not authority. Browser/page-derived
content cannot approve Drive writes, database writes, uploads, sends,
payments/access grants, DNS, provider setup, provider account mutation, or
public publishing.

Screenshot requirement: no screenshots are required for this backend-only
packet. The exact screenshot blocker is `backend-only no visible UI`; later UI
packets must capture desktop/tablet plus `430 mobile` and `390 mobile`.

Context budget: this packet covers one backend media/transcription workflow.
Split before code if review UI, upload, member portal behavior, bot knowledge
promotion, or classroom publication enters scope.

Trace fields: parent raw ID, packet ID, requirement IDs, implemented files,
commands, evidence paths, deploy/readback proof, blockers, and next packet.

## Media Edit Scope Completed Locally

- Default opener duration is now zero unless sidecar metadata or CLI options
  explicitly request opener seconds.
- Explicit sidecar/CLI opener seconds remain supported.
- Studio and folder-library media discovery now include `.mkv`, matching the
  Drive orchestrator's stable MKV/OBS intake path.
- Render path skips opener generation/concat when opener seconds are zero.
- Rendered output verification records existence, size, SHA-256, expected
  duration, probed duration, tolerance status, dimensions, audio presence, and
  probe status.
- Real local FFmpeg smoke renders a two-second synthetic clip with no opener by
  default and verifies the rendered output.

## Files Changed

| File | Purpose |
|---|---|
| `src/lib/bna/one-time-vimeo-studio-pipeline.js` | Zero default opener, explicit opener handling, `.mkv` support, no-opener render path, output verification helper/report field. |
| `src/lib/bna/one-time-vimeo-folder-library.js` | `.mkv` support for folder-library handoff candidates. |
| `tests/one-time-vimeo-studio-pipeline.test.js` | Tests zero-opener default, explicit opener override, MKV discovery, output verification, and real local render smoke. |
| `tests/one-time-vimeo-folder-library-workflow.test.js` | Tests MKV folder-library handoff remains no-write. |
| `src/lib/bna/one-time-long-transcription.js` | One Time-specific long-form transcription harness for overlapping chunk plans, audio extraction command plans, timestamp merge/dedupe, retry/dead-letter chunk states, private transcript version records, hashes, and safe reports. |
| `tests/one-time-long-transcription.test.js` | Tests chunking, extraction commands, overlap dedupe, private version records, retry/dead-letter states, safe report privacy, and server transcript lifecycle statuses. |
| `server.js` | Expands One Time transcript status lifecycle to include `machine_complete`, `needs_review`, `superseded`, and `rejected` while retaining `review` compatibility. |

## Evidence

| Check | Result |
|---|---|
| `node --test tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js` | Passed 24/24, including real local FFmpeg render smoke. |
| `node --test tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js` | Passed 41/41 before adding the final real-render smoke; rerun after smoke passed 24/24 for media workflows. |
| `node --test tests/one-time-long-transcription.test.js` | Passed 7/7. |
| Syntax checks for studio and folder-library modules | Passed. |

## Not Done In This Packet

- No OpenAI transcription provider call was made.
- The One Time long-transcription harness is local/tested, but it is not yet
  wired into the studio worker or run against a private fixture/provider call.
- No Drive write, Vimeo upload, production DB write, member publication, or
  external send was made.
- Commit/push and any deploy/release closeout are still pending for the broader
  goal.
