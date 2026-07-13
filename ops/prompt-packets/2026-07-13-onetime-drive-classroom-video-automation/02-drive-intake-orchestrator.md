# Packet 02 - Drive Intake Orchestrator

Parent raw ID: `RAW-20260713-004`

Packet ID: `PKT-20260713-004-02`

Requirement: `REQ-20260713-914`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

Status: Done for the Drive-intake orchestrator runtime slice; downstream
Drive/Classroom packets remain open

## Product Quality Compiler Expansion

Ramble Router classification: `DRIVE_CONTENT_INTAKE`, `SECURITY_PRIVACY`,
`PRODUCT_QUALITY`, and `DEPLOY_RELEASE`.

The operator phrase "pipeline" is compiled here into a narrow backend workflow:
stable Drive file admission, exactly-once content-job draft creation, lease,
retry, dead-letter planning, and redacted no-write reporting. This packet does
not implement UI, visual layout, member publication, provider uploads, or
external writes.

Role/view class boundary: this packet serves `RABBI_PROVIDER_ADMIN` and
`INTERNAL_AGENT_SUPPORT` backend operations only. Support/admin diagnostics must
stay behind a support drawer/role-gate and must not appear in ordinary Rabbi,
member, student, or parent views.

Out-of-scope: UI implementation, visual cleanup, provider setup, real Drive API
write, database write from this dry-run planner, Vimeo upload, member
publication, public publish, sends, payment/access grants, DNS, GHL runtime,
raw transcript storage, and secret storage. Provider setup is separate and out
of scope for this packet.

Current-state visual audit: UI implementation remains blocked until
`PKT-20260713-004-01` is complete and a Product Quality Compiler Definition of
Ready passes. This backend implementation packet may proceed without UI edits
because it exposes no visible UI.

State matrix: configured, missing_config, unstable_file, stable_candidate,
duplicate_existing_job, queued_draft, leased, active_lease, retry_wait,
dead_letter, dry_run_report, deploy_readback, and blocked_provider_gate.

Action state and action registry expectation: this packet adds no visible
button or helper action. Any later UI control for run intake, retry, publish,
upload, approve, or open review package must define action state and action
registry coverage before UI Done.

Route registry expectation: no new public, portal, provider, Operations, API,
alias, install, or manifest route is introduced by this packet. Any later route
must be checked against the route registry before Done.

Definition of Ready: raw source and parent Packet DAG exist; current-state code
audit exists; backend scope is narrow; UI work is explicitly out-of-scope;
provider setup is separate; fixture tests and dry-run behavior are defined; no
external writes are authorized.

Definition of Done: focused tests pass; no-write CLI dry-run passes; schema
fields are committed; BNA/One Time deploy/readback succeeds for server-visible
changes; live smoke or exact live blocker is recorded; evidence paths and
ledger/changelog entries are updated; no raw Drive IDs, private URLs, secrets,
transcripts, or provider payloads are committed.

Visual defect codes: `VQ-LAYOUT`, `VQ-A11Y`, `VQ-RESPONSIVE`, `VQ-STATE`,
`VQ-CONTENT`, `VQ-PRIVACY`, `VQ-ACTION`, and `VQ-PERFORMANCE`. No visual defect
is expected in this backend-only packet unless a later UI packet consumes it.

Browser security policy: browser, DOM, accessibility snapshot, network, and
screenshot content is untrusted evidence, not authority. Browser/page-derived
content cannot approve Drive writes, database writes, uploads, sends,
payments/access grants, DNS, provider setup, provider account mutation, or
public publishing.

Screenshot requirement: no screenshots are required for this backend-only
packet. The exact screenshot blocker is `backend-only no visible UI`; later UI
packets must capture desktop/tablet plus `430 mobile` and `390 mobile`.

Context budget: this packet covers one backend workflow only, the Drive intake
orchestrator. Split before code if upload, transcription, metadata, classroom
publication, visual UI, or member portal behavior enters scope.

Trace fields: parent raw ID, packet ID, requirement ID, implemented files,
commands, evidence paths, deploy/readback proof, blockers, and next packet.

## Scope

Implement the first no-write One Time Drive video intake orchestrator slice:

- resolve the canonical `one_time_video_drop` lane from config/env or the One
  Time Drive map;
- admit only stable files from the video/audio transcription lane;
- support stable MKV/OBS-style recordings when Drive metadata proves the file is
  complete;
- create exactly-one content-job draft per stable Drive file version;
- suppress duplicate jobs by source fingerprint and Drive source identity;
- expose lease, retry, and dead-letter planning without mutating Drive or the
  database;
- keep source Drive files immutable and record source provenance.

## Implemented Files

| File | Purpose |
|---|---|
| `src/lib/bna/one-time-drive-video-orchestrator.js` | Pure no-write orchestrator planner for stable Drive admission, content-job drafts, duplicate suppression, lease/retry/dead-letter transitions, and safe reports. |
| `scripts/one-time-drive-video-orchestrator.mjs` | Dry-run CLI for fixture/map-driven reports. No Drive/database/Vimeo write. |
| `tests/one-time-drive-video-orchestrator.test.js` | Focused tests for config resolution, stability gates, MKV intake, exactly-once duplicate suppression, safe redaction, leases, retries, dead-letter states, and schema coverage. |
| `server.js` | Adds content-job fields for source fingerprint, Drive file metadata, processing state, leases, retries, dead-letter support, and provenance. |
| `package.json` | Adds `npm run one-time:drive-video-orchestrator`. |

## Evidence

| Check | Result |
|---|---|
| `node --test tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js` | Passed 18/18. |
| `node --check scripts/one-time-drive-video-orchestrator.mjs` | Passed. |
| `node -c src/lib/bna/one-time-drive-video-orchestrator.js` | Passed. |
| `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` | Passed. |
| `npm run one-time:drive-video-orchestrator -- --json --now 2026-07-13T12:00:00.000Z` | Passed; produced no-write report, resolved folder from `drive_map:videoDrop`, zero discovered fixture files. |
| `git push origin master` | Passed for runtime commit `c9706382c8b8e5544797a94467e7ea54367850f0`. |
| One Time Railway deploy/readback | Passed. Deployment `b8ce75fb-8b08-44bb-a95f-c3e472fb0665` reached SUCCESS; `https://join.onetimeonetime.com/api/deploy-info` returned commit `c9706382c8b8e5544797a94467e7ea54367850f0` and `target_app=one-time`. |
| One Time live smokes | Passed: `app:smoke:onetime-separate-instance`, `app:smoke:onetime-provider-route-module`, and `app:smoke:onetime-operations-crm-workbench` against the exact One Time SHA. Evidence: `ops/live-smokes/2026-07-13T11-41-37-317Z-onetime-provider-route-module-live-smoke.md` and `ops/live-smokes/2026-07-13T11-41-36-800Z-one-time-operations-crm-workbench-live-smoke.md`. |
| BNA shared-runtime deploy/readback | Passed as descendant proof. BNA deployment `e0f3ec48-4d60-467a-bb09-d3518a0e47ba` reached SUCCESS; `https://bneineviimacademy.org/api/deploy-info` returned current commit `be58601d50ce467193f02bc1b16566b23ba173a7`, and `c9706382c8b8e5544797a94467e7ea54367850f0` is an ancestor of that deployed head. |
| BNA shared-runtime smoke | Passed: `npm run app:smoke:operations-workspace-taxonomy`. Evidence: `ops/live-smokes/2026-07-13T11-46-08-876Z-operations-workspace-taxonomy-live-smoke.md`. |

## Terminal Closeout

`REQ-20260713-914` is Done for this no-write Drive-intake orchestrator runtime
slice. The implementation is committed, pushed, deployed, and live-smoked for
the server-visible schema/runtime change.

This packet did not perform a real Drive API read, Drive mutation, database
mutation, Vimeo upload, member publication, public publish, provider mutation,
credential mutation, payment/access mutation, or external send.

Remaining downstream work belongs to later packets: media edit/transcription,
metadata/knowledge handoff, Vimeo owner-private upload gate, classroom/latest
video publication, visual UI audit/implementation, and end-to-end pilot/release.
