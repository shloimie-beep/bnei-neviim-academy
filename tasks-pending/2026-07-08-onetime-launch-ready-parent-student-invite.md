# OneTime Launch-Ready Parent/Student Invite - 2026-07-08

Raw input: `raw-input/RAW-20260708-009-onetime-launch-ready-live-parent-student.md`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260708-039 | Pushed; deploy/live-smoke blocked | OneTime live parent trial invites must not create or display `TEST`, `codex-test`, or walkthrough-only labels unless an explicit smoke/test mode is requested. | Commit `b7ba8418` pushed to `origin/master`. `server.js` now defaults invites to `production`, applies smoke labels only under explicit smoke/test mode, removes test tags for production, and filters existing test-tag rows during lookup. PASS focused tests 59/59; PASS workspace-scope guardrail. Live deploy not proven; see `ops/watchdog-audits/2026-07-08-onetime-parent-student-auth-deploy-blocker.md`. |
| REQ-20260708-040 | Pushed; deploy/live-smoke blocked | A live OneTime invite must require real parent and student display names before sending; no hidden fallback to `TEST One Time Student`. | Commit `b7ba8418` pushed. `server.js` rejects non-smoke invite sends without `parent_name` and `student_name`; no `TEST One Time Student` fallback remains in the live route. PASS `tests/one-time-parent-trial-invite.test.js`. Live deploy not proven. |
| REQ-20260708-041 | Pushed; deploy/live-smoke blocked | OneTime parent setup, member library, and classroom surfaces must not show BNA/BNA Academy copy, palette, home links, or loading flashes in the normal launch path. | Commit `b7ba8418` pushed. Edited launch pages remove normal-path public return/home links and OneTime surfaces use OneTime copy. PASS focused tests 59/59; PASS `node scripts/watchdog-workspace-scope-guardrails.mjs --json`. Live readback still showed old public-return/fallback markers, so deploy is blocked/stale. |
| REQ-20260708-042 | Pushed; deploy/live-smoke blocked | The normal OneTime parent/student/member journey must not lead with fallback access-code/password UX; fallback code is support-only and hidden unless explicitly requested or the secure link fails. | Commit `b7ba8418` pushed. Normal library/classroom routes now use member session auth or secure invite links without visible fallback/recovery code controls; parent setup has OneTime forgot-password email flow. Parent portal exposes one button to reset a child's password. PASS relevant tests. Live readback still showed old fallback markers, so deploy is blocked/stale. |
| REQ-20260708-043 | Pushed; deploy/live-smoke blocked | OneTime parent invite copy must use a warmer parent-facing OneTime/Rabbi voice and clearly include parent setup, class/library, and live-shiur links without backend/test language. | Commit `b7ba8418` pushed. `src/lib/bna/rabbi-emails.js` parent invite now has parent setup, "Tonight's live shiur Zoom link", classroom/schedule/worksheets, library/review materials, and Rabbi signoff. PASS `tests/one-time-parent-trial-invite.test.js`; PASS workspace-scope guardrail. Live resend remains blocked. |
| REQ-20260708-044 | Pushed; deploy/live-smoke blocked | Remove or replace unapproved/unfit Rabbi face/avatar imagery from launch surfaces. | Commit `b7ba8418` pushed. `public/rabbi-member.html` no longer uses the `onetime-hero-vertical.webp` portrait as the member header background. Live readback still showed the old portrait marker, so deploy is blocked/stale. |
| REQ-20260708-045 | Pending | Agent Mode launch-readiness audit prompts must be navigation-first, autonomous, start/drop-off aware, and must report `FAIL`/`BLOCKED` into the Operations drop-off even if navigation breaks. | Pending prompt/workflow fix. |
| REQ-20260708-046 | Needs operator decision | Send a fresh live OneTime parent/student invite only after the live student display name is explicit and the post-fix dry run proves no test/BNA leakage. | Blocked on `DEC-20260708-008`. |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-20260708-008 | Choose the exact live OneTime student display name for the production parent invite to `sd***@gmail.com`. | The operator said this must be a live student, not `TEST`/`Dratler Student`, but did not name the OneTime student to create/update. | Shloimie | Provide the exact student name to use for this OneTime invite. | Use a generic non-test placeholder such as `OneTime Student`; reuse a BNA student such as Menachem; do no live send. | Guessing can create the wrong live OneTime record or mix BNA/student data into OneTime. | Reply with the exact OneTime student display name for the invite. | `REQ-20260708-046` | Needs operator decision |

## Product Quality Packet

- Packet:
  `ops/prompt-packets/2026-07-08-onetime-launch-ready-parent-student-invite/01-launch-invite-setup.product-quality.json`
- Validator:
  `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-launch-ready-parent-student-invite/01-launch-invite-setup.product-quality.json`

## Implementation Batches

| Batch | Scope | Requirements | Status |
| --- | --- | --- | --- |
| B1 | Live invite data model/copy/setup route cleanup | `REQ-20260708-039` through `REQ-20260708-043` | Pushed; deploy/live-smoke blocked |
| B2 | Asset/image and OneTime visual bleed audit | `REQ-20260708-041`, `REQ-20260708-044` | Pushed; deploy/live-smoke blocked |
| B3 | Agent Mode autonomous prompt/drop-off hardening | `REQ-20260708-045` | Pending |
| B4 | Live resend/readback | `REQ-20260708-046`, `DEC-20260708-008` | Blocked until exact student name |

## Local Verification - 2026-07-08T16:11:19+03:00

- PASS `node --check server.js`
- PASS `node --check tests\one-time-parent-trial-invite.test.js`
- PASS `node --check tests\one-time-classroom-calendar-community-bot.test.js`
- PASS focused regression suite:
  `node --test tests\one-time-parent-trial-invite.test.js tests\one-time-member-library.test.js tests\one-time-classroom-calendar-community-bot.test.js tests\one-time-canonical-journey.test.js tests\one-time-shared-review-branding.test.js tests\parent-student-portal-contract.test.js tests\student-portal-auth-policy.test.js tests\workspace-scope-guardrails.test.js`
  with 59/59 passing.
- PASS `node scripts\watchdog-workspace-scope-guardrails.mjs --json` with `findings: []`.
- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-launch-ready-parent-student-invite/01-launch-invite-setup.product-quality.json`.
- PASS `npm run watchdog:protocol-drift`.
- Guardrails held: no live email was sent, no payment/checkout was created, no Zoom/Drive/Vimeo/DNS mutation was performed, no setup token/member access code/full recipient/full Zoom URL was committed.
- Remaining blockers: `REQ-20260708-045` still needs the autonomous Agent Mode prompt/drop-off hardening pass; `REQ-20260708-046` is blocked on `DEC-20260708-008` for the exact live OneTime student display name.

## Deployment Blocker - 2026-07-08T16:16:00+03:00

- Commit `b7ba8418c36d4efc4ab999b42cf1db1c66686627` was pushed to
  `origin/master`.
- `npm run one-time:target:guard -- --json` blocked because local Railway
  status resolved to the BNA project context, not
  `one-time-production / one-time-web / join.onetimeonetime.com`.
- `npm run railway:target:doctor` blocked because this shell has no explicit
  Railway project or service target.
- No CLI deploy was performed.
- Safe live readback against `https://join.onetimeonetime.com` showed the new
  commit is not deployed yet: live `/member-library` and `/one-time-classroom`
  still contained old fallback/public-return markers, live `/rabbi-member`
  still referenced the old portrait marker, and live `/one-time-parent` did
  not yet contain the new forgot-password route marker.
- PASS existing live shared-review smoke:
  `ops/live-smokes/2026-07-08T13-13-51-730Z-one-time-shared-review-live-smoke.md`.
- Status remains pushed/local-verified, not app-visible Done.

## Done Criteria

- Focused tests pass.
- PQC validator passes for the launch-readiness packet.
- Workspace-scope watchdog passes.
- Live route smoke proves OneTime parent setup route has no BNA/Academy copy.
- Live no-send dry run proves production invite has no test labels and uses
  OneTime sender/URLs/copy.
- No live resend until `DEC-20260708-008` is resolved.
