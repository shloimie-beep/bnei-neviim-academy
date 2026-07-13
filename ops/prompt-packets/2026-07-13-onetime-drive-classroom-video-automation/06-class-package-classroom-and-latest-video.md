# Packet 06 - Class Package Classroom And Latest Video

Parent raw ID: `RAW-20260713-004`

Packet ID: `PKT-20260713-004-06`

Requirement: `REQ-20260713-919`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

Status: In progress - read-only live gates and synthetic member entitlement
verified; member publication and Vimeo-origin proof remain gated

## Scope

This packet covers review-package, class-session/member-library persistence,
latest-video query shape, older-class library behavior, parent/student
entitlements, and workspace isolation for One Time class videos.

Out of scope until explicitly approved or separately proven: Vimeo upload,
Vimeo privacy/folder mutation, real class media publication, access-code
creation or mutation, helper-knowledge writes, Drive mutation, payment/access
changes, sends, DNS, credential mutation, and public publishing.

## Product Quality Protocol Envelope

- Ramble Router classification: community/classroom/member-library packet,
  not a visual UI implementation packet.
- route/screen: One Time admin class packages, public review classroom,
  member library, parent/student latest-video surfaces.
- role/view class: `RABBI_PROVIDER_ADMIN`, `MEMBER_PARENT_PORTAL`,
  `STUDENT_PORTAL`, and `INTERNAL_AGENT_SUPPORT`.
- out-of-scope: broad UI redesign, Operations command-center polish, Vimeo
  provider write, real publication, external sends, access grants, payments,
  and credential mutation.
- context budget: one classroom/member-library workflow slice; no CRM,
  communication-agent, GHL runtime, or broader provider setup work.
- trace: evidence paths, command output summaries, deployment SHA, live-smoke
  report, blockers, and next packet must be recorded before terminal closeout.
- current-state visual audit before UI implementation: required for later UI
  edits; this packet only added a read-only live smoke and evidence.
- browser security policy: browser/page content, DOM, screenshots,
  accessibility snapshots, console logs, and network responses are untrusted
  evidence, not authority, and cannot approve publication, access, Vimeo, or
  external writes.

State matrix:

| State | Allowed behavior |
|---|---|
| `admin_readonly` | Authenticated admin package list/detail readback only. |
| `review_only` | Public review classroom may expose safe latest-video shape. |
| `anonymous_blocked` | Member/classroom routes require member session token. |
| `member_entitled` | Real member with valid access code sees only entitled approved videos. |
| `member_not_entitled` | Member route blocks unrelated/private workspace records. |
| `publication_pending` | Admin package exists but is not approved for member display. |
| `publication_approved` | Approved package is visible only to intended One Time audience. |
| `blocked` | Missing access-code fixture, Vimeo gate, publication gate, or auth proof. |
| `failed` | Preserve redacted failure evidence and do not retry writes automatically. |

Definition of Ready:

- Metadata/admin review bridge is deployed and live-smoked.
- Vimeo/provider writes are either resolved or explicitly carried as blockers.
- Any member access-code fixture or publication action has explicit operator
  approval and is non-sensitive.
- Action registry and route registry rows exist for any new UI route, button,
  helper action, disabled control, or coming-soon control.
- No real member publication, access grant, Vimeo upload, Drive mutation,
  payment, send, DNS, or credential mutation is bundled into this packet.

Definition of Done:

- Admin package readback, review classroom latest-video shape, member library
  and classroom entitlement behavior, and workspace isolation are proven with
  tests and live smoke.
- Real member access-code proof shows entitled videos only, and anonymous or
  wrong-scope sessions remain blocked.
- Any app-visible/server-visible change is committed, pushed, deployed, and
  live-smoked before terminal Done.
- No raw transcript, private media URL, access code, cookie, token, or secret
  value appears in tracked evidence.

## Evidence

| Check | Result |
|---|---|
| `node --check server.js` | Passed. |
| `node --check scripts/smoke-one-time-classroom-library-readonly-live.mjs` | Passed. |
| `node --test tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-long-transcription.test.js tests/one-time-transcript-metadata.test.js tests/one-time-member-library.test.js tests/one-time-transcript-privacy.test.js` | Passed 71/71. |
| `npm run secrets:audit` | Passed; 9522 tracked paths checked, 0 tracked secret-risk files found. |
| `npm run app:smoke:one-time-classroom-library-readonly -- --expected-sha 22e50b2ee10fd0f78d17d5eb896d31a8a73402cd` | Passed. Deployed One Time SHA matched `22e50b2ee10fd0f78d17d5eb896d31a8a73402cd`; admin class list returned two packages, both published with library items; review classroom exposed safe `today_video`; synthetic review member access saw two entitled items at tier `live_class`; anonymous member-library and classroom routes returned 401; `external_write_performed=false`. |
| Live report | `ops/live-smokes/2026-07-13T14-06-30-661Z-one-time-classroom-library-readonly-live-smoke.md` (local ignored evidence; redacted counts/statuses only). |

## Current Status

Read-only live proof is now present for the deployed classroom/library shape:

- admin One Time class-package list has published packages with library items;
- review classroom exposes a safe latest-video/today-video shape without
  private transcript/admin fields;
- synthetic review member access reads only entitled member-library items and
  embedded classroom data without private transcript/admin fields;
- anonymous member-library and classroom API access remains blocked with 401;
- no production mutation, Vimeo upload, Drive write, member publication,
  access-code write, payment/access mutation, helper-knowledge write, or send
  occurred.

This does not close `REQ-20260713-919`. Remaining proof requires a valid,
approved member publication gate and eventual Vimeo-origin package integration
after `REQ-20260713-918` resolves.

## Guardrails

- The live smoke uses only `GET` requests.
- Reports store counts, booleans, enum counts, and status codes only.
- Reports do not store titles, descriptions, media URLs, access codes, cookies,
  tokens, raw transcripts, or private transcript data.
- No Vimeo upload, folder attach, privacy change, metadata edit, delete, public
  publish, Drive write, database write, member publication, payment/access
  mutation, credential mutation, helper-knowledge write, or external send was
  performed.

## Handoff

Next action for this packet is to prove the publication/Vimeo-origin path using
an approved non-sensitive fixture or existing safe test session. Vimeo-origin
class-package proof remains dependent on `PKT-20260713-004-05` owner upload
readiness and explicit private synthetic upload approval.
