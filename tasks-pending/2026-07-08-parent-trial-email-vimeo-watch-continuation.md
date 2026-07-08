# Ramble Intake - 2026-07-08 - Parent Trial Email, Vimeo, And Watch Tracking Continuation

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-001-parent-trial-email-vimeo-watch-continuation.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-parent-trial-email-vimeo-watch-continuation.md |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260708-001 | Reconcile the prior July 7 parent trial/login ramble against current repo and live DB state. | RAW-20260708-001, RAW-20260707-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` plus shared parent/student platform | Codex | reconciliation | P0 | 0 | none | Register states what was done, what is blocked, and what is missing, backed by file/test/live DB readback. | tasks-pending, server.js, tests, live DB readback | no | Done locally |
| REQ-20260708-002 | Provide an auditable One Time parent trial access email path for the operator-approved test parent email, redacted in repo. | RAW-20260708-001 | One Time parent/member access | Codex | access-email | P0 | 1 | REQ-20260708-001 | Email copy and route are One Time scoped, include parent password setup/access, 30-day trial framing, classroom/library link, and do not grant billing/paid status beyond a clear test/trial access record. | server.js, email/logging helpers, tests/scripts | yes if sent | Done locally, pending deploy/live send |
| REQ-20260708-003 | Ensure the parent can set/reset the child/student login password from the parent portal. | RAW-20260708-001 | parent/student portal | Codex | auth-workflow | P0 | 1 | REQ-20260708-001 | Existing parent-managed student password endpoint is verified against the parent session and test parent record; missing One Time-specific bridge is repaired or blocked precisely. | server.js, public/parent.html, public/student.html, tests | yes if app-visible | Verified locally |
| REQ-20260708-004 | Persist member-library watch/click tracking server-side so parent reporting can show watched videos and time watched. | RAW-20260708-001 | One Time member library/classroom | Codex | analytics-tracking | P0 | 1 | REQ-20260708-001 | Library progress is no longer only localStorage; API records watch seconds/progress/events scoped by access code and item, with no cross-workspace leakage and no raw private data exposure. | server.js, public/member-library.html, tests | yes | Done locally, pending deploy |
| REQ-20260708-005 | Check Vimeo import readiness and import/organize existing Vimeo content only if credentials and safe target are available. | RAW-20260708-001 | One Time Vimeo/library | Codex + operator | external-provider | P0 | 2 | REQ-20260708-001 | Current Vimeo token/access status is read without exposing secrets; if ready, run safe dry-run/import path; if missing, record exact blocker and keep manual Vimeo URL fallback available. | scripts/one-time-vimeo-folder-library.mjs, src/lib/integrations/vimeo.js, Railway/env/readiness | yes if app-visible/imported | Blocked on source/import selection |
| REQ-20260708-006 | Send the approved test parent email to the operator-approved test parent email, redacted in repo, and record proof only after the correct scoped flow is implemented/verified. | RAW-20260708-001 | One Time parent trial access | Codex | live-send | P0 | 3 | REQ-20260708-002, REQ-20260708-003, REQ-20260708-004 | Live send uses the approved recipient from chat context, creates/links test/trial access as intended, logs email and communication rows, and provides a non-secret readback. | API/script/live DB/email log | yes | Pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260708-001 | Vimeo import needs a real source/import selection before external Vimeo mutation or library publishing. | The official workflow sees a configured keyholder Vimeo token, but the safe import folder has zero candidate video files and no approved Vimeo folder/video selection was provided. | Operator + Codex | Use the dry-run folder workflow first: drop approved `.mp4`, `.mov`, `.m4v`, or `.webm` files into `media-inbox/one-time-vimeo-drop`, or provide exact Vimeo folder/video selection for a read-only inventory/import packet. | Manually paste approved Vimeo URLs into class packages; defer Vimeo import; run an opt-in private Vimeo smoke after target account/project are confirmed. | Without a source selection, importing all recent account videos could publish unrelated/private content into the classroom. | Provide/drop the specific videos or approve a named Vimeo folder/video-selection import packet. | REQ-20260708-005 | Open |

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260708-001 | What exact student/child display name should be used for the test parent account if not a generated test child? | The operator asked for a random student but also wants to set up a kid login. | No, Codex can use a clearly TEST-labeled child for now | Open |
| Q-20260708-002 | Should the One Time trial email link point to the BNA-hosted shared review target, `join.onetimeonetime.com`, or the current deployed canonical path? | The email should not send a stale or misleading class link. | Blocks polished final copy only; Codex can use current canonical route after readback | Open |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-001 | prior register, live DB, tests | Inspect current state and update this register. | PASS live DB readback for the approved recipient: no One Time member access and 0 published library items; prior July 7 `REQ-20260707-111` was blocked. | Pending | Pending | Not required |
| REQ-20260708-002 | server/email/API/script | Added admin-only `/api/bna/one-time/parent-trial-invite` with `SEND_ONE_TIME_PARENT_TRIAL_INVITE`, TEST-labeled student/lead/member access, parent password setup token, One Time trial email template, email log, and communication log. | PASS focused tests. | Pending | Pending | Required if sent |
| REQ-20260708-004 | server + member-library | Added `one_time_member_watch_progress`, `one_time_member_watch_events`, progress API, and client-side open/manual/HTML5/Vimeo event tracking with localStorage fallback. | PASS focused tests. | Pending | Pending | Required |
| REQ-20260708-005 | Vimeo scripts/status | Ran safe dry-run/readiness scripts; no external write. | PASS `npm run one-time:vimeo-library -- --json`: keyholder token configured, 0 candidates, no upload/publish/write; PASS `node scripts\vimeo-private-smoke.mjs --json`: preview-only disabled, no write. | Pending | Pending | Required only if imported |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-001 | Done locally | Prior register shows `REQ-20260707-111` blocked; live DB has existing BNA signup rows for the approved recipient, no parent password account, no One Time member access, and zero published One Time library items. | `tasks-pending/2026-07-08-parent-trial-email-vimeo-watch-continuation.md` | Direct DB readback; source/test inspection | None for reconciliation. |
| REQ-20260708-002 | Done locally, pending deploy/live send | Added One Time parent trial invite route/template with explicit confirmation and no payment/checkout creation. | `server.js`; `src/lib/bna/rabbi-emails.js`; `tests/one-time-parent-trial-invite.test.js` | PASS `node --check server.js`; PASS focused tests 40/40. | Commit, push, deploy, then call the live route to send. |
| REQ-20260708-003 | Verified locally | Parent-managed student login reset already existed and is covered by tests; new route creates a TEST-labeled One Time student record so the parent session has a child to manage. | `server.js`; existing `public/parent.html`; existing `public/student.html` | PASS `tests/student-portal-auth-policy.test.js`; PASS `tests/parent-student-portal-contract.test.js`. | Needs live walkthrough after email is sent. |
| REQ-20260708-004 | Done locally, pending deploy | Added server-side watch progress/current state and append-only events, and wired member library to sync manual progress, media opens, HTML5 video updates, and Vimeo Player time updates when available. | `server.js`; `public/member-library.html`; `tests/one-time-member-library.test.js` | PASS `node --check server.js`; PASS focused tests 40/40; PASS `npm run watchdog:actions`. | Deploy and live smoke/readback required. |
| REQ-20260708-005 | Blocked on source/import selection | Official Vimeo folder workflow sees keyholder token configured but found 0 local candidate videos; private Vimeo smoke stayed preview-only disabled. Existing live DB has only archived smoke Vimeo rows and one draft Drive/manual class row, with 0 published library items. | `ops/one-time-mishnah/vimeo-folder-library/2026-07-08T05-55-25-683Z-report.md` | PASS dry-run with no external write; no import/publish performed. | Provide approved video files in `media-inbox/one-time-vimeo-drop` or approve a named Vimeo folder/video selection. |
