# Issue #24 - Agent Review Hub, Helper Audit, Navigation IA, and Newest Drive Trace

## Raw intake

GitHub issue #24 is the authorized Goal Mode source packet:
https://github.com/shloimie-beep/bnei-neviim-academy/issues/24

The raw issue body and comments stay canonical in GitHub and are linked through
`RAW-20260625-024`. This register distills the packet into executable
requirements without creating duplicate visible Tasks or a second protocol.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260625-024 |
| Parent ID | PARENT-20260625-024 |
| Source | GitHub issue #24 and kickoff comment #4799296754 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-25-issue-24-agent-review-hub.md |
| Execution run | ops/execution-runs/2026-06-25-issue-24-agent-review-hub/ |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Execute GitHub issue #24 as the authorized Goal Mode source packet through terminal statuses, including push/merge/deploy/live verification for app-visible work. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | none; all Issue #24 requirements are terminal Done |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260625-024 | Register Issue #24 and create parent run/coordinated lanes | RAW-20260625-024 | bna_platform / agent_review_hub | Codex | run_control | P0 | 0 | none | Source preserved, baseline recorded, Issue #20/#18 state checked, one active parent run, no duplicate visible Tasks | raw/register/run files | no | Done |
| REQ-20260625-025 | Trace the newest Drive recording read-only | RAW-20260625-024 | bna_platform / class_drive_intake | Codex | read_only_trace | P0 | A | REQ-20260625-024 | Newest matching Drive recording selected by timestamp/source ID and traced through every required production stage with sanitized evidence and no writes | script/evidence/run files | no | Done |
| REQ-20260625-026 | Build secure owner-only Agent Review Hub and review sessions | RAW-20260625-024 | bna_platform / agent_review_hub | Codex | app_security_ui | P0 | B | REQ-20260625-024 | Owner login required, short-lived scoped sessions, no all-access URL secret, banner/exit/audit/expiry, role matrix, prompt links, live hub URL | server/public/src/tests/registries | yes | Done |
| REQ-20260625-027 | Audit and repair helper route/action grounding | RAW-20260625-024 | bna_platform / helper_correctness | Codex | helper_actions | P0 | C | REQ-20260625-026 | Every helper surface inventoried; internal links use resolver; typed actions audited; human-like eval matrix passes or produces repair requirements | server/src/scripts/tests/evidence | yes | Done |
| REQ-20260625-028 | Create Agent Mode prompt pack and typed result drop-off | RAW-20260625-024 | bna_platform / agent_mode_review | Codex | agent_result_bridge | P0 | D | REQ-20260625-026 | Mobile-copyable prompt files exist and are exposed; Submit Agent Review Result persists through typed action/API with readback proof | public/docs/server/src/tests | yes | Done |
| REQ-20260625-029 | Clean navigation IA and duplicate controls | RAW-20260625-024 | bna_platform / navigation_ia | Codex | ui_navigation | P1 | E | REQ-20260625-026 | Side nav owns modules, tabs/filters are scoped children, duplicates are removed, watchdog passes, mobile has no overflow | public/scripts/tests/registries | yes | Done |
| REQ-20260625-030 | Integrate, test, push, merge, deploy, live verify, and report to Issue #24 | RAW-20260625-024 | bna_platform / release_closeout | Codex | release_closeout | P0 | Z | REQ-20260625-025 through REQ-20260625-029 | Focused/full tests, watchdogs, secret audit, run validation, PR, merge, deploy, Railway/live smokes, Issue #24 final evidence, exact final response format | run/deploy/evidence files | yes | Done |

## Parsed tasks

No new default visible owner Tasks were created. Issue #24 machine work stays in
the parent execution run and internal Agent Work lane.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260625-024 | bna_platform\|agent_review_hub\|github_issue_24\|parent_run | Execute Issue #24 parent run | Codex | bna_platform / agent_review_hub | RAW-20260625-024 | REQ-20260625-024 through REQ-20260625-030 | Owner can now run Agent Mode audit from live hub | Agent Work | done |

## Decisions

None at registration. External/account/credential/privacy/approval blockers
must be recorded as one reusable Decision each if encountered.

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260625-025 | Drive trace script/evidence | Select newest Drive recording read-only; trace production stages; sanitize IDs/counts | focused trace command, no-write assertion plus live hub trace surfacing passed | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | live hub surfaced trace; no deploy required for read-only trace itself |
| REQ-20260625-026 | `/operations/agent-review`, `/agent-review/session`, review session APIs, route/action registries | Owner-only hub, one-time exchange, HttpOnly cookie session, banner, Exit, result readback | unit/auth/security/browser/live checks passed | df4c147e7503b92c41c35237dd02d31b0775327b | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | Railway `24c1d191-3f50-4d0a-9da8-687ba2f1a434`, live hub smoke passed |
| REQ-20260625-027 | helper resolver/context/audit scripts | Inventory helpers, repair link/action grounding, run role matrix | helper tests, 280/280 static audit, and live helper smoke passed | df4c147e7503b92c41c35237dd02d31b0775327b | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | Railway `24c1d191-3f50-4d0a-9da8-687ba2f1a434`, helper smoke passed |
| REQ-20260625-028 | prompt files, hub links, result API/UI | Add prompt pack and typed result drop-off/readback | prompt generation plus browser/live typed result readback passed | df4c147e7503b92c41c35237dd02d31b0775327b | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | Railway `24c1d191-3f50-4d0a-9da8-687ba2f1a434`, result `AGR-96dfac2f8c31163c` |
| REQ-20260625-029 | operations navigation labels/watchdog | Remove same-level duplicate controls and enforce IA rule | nav watchdog, visual/mobile checks, and live route checks passed | df4c147e7503b92c41c35237dd02d31b0775327b | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | Railway `24c1d191-3f50-4d0a-9da8-687ba2f1a434`, live app/privacy smokes passed |
| REQ-20260625-030 | PR/deploy/live evidence | Integrate, push, PR, merge, deploy, live verify, post Issue #24 final | full test/watchdog/deploy/live suite passed | df4c147e7503b92c41c35237dd02d31b0775327b | 9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942 | PRs #25-#30 merged; final Issue comment posted |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260625-024 | Done | raw/register/run files, Issue #24 kickoff comment | raw-input, memory, tasks-pending, execution run, ledger/changelog, TASKS | `npm run bna:run:status` after registration | none |
| REQ-20260625-025 | Done | newest-recording trace JSON/MD, Issue #24 progress comment | trace script/tests/evidence | trace tests, production read-only trace, sanitized evidence check | processing verdict is `PARTIAL`, not processed |
| REQ-20260625-026 | Done | hub/session files, route/action registries, live smoke | server.js, agent-review hub/session pages/tests | hub tests plus live Review Hub smoke | none |
| REQ-20260625-027 | Done | helper audit JSON/MD, live helper smoke | helper resolver/context/audit/tests | helper tests, `npm run issue24:helper-audit`, live helper resolver smoke | none |
| REQ-20260625-028 | Done | prompt pack files/index, live result readback | prompt generator, hub/session/API/tests | prompt generation, agent-review tests, live result `AGR-96dfac2f8c31163c` | none |
| REQ-20260625-029 | Done | navigation IA audit JSON/MD, live route checks | operations UI labels, watchdog/tests | nav tests, `npm run watchdog:navigation-ia`, visual/live smokes | none |
| REQ-20260625-030 | Done | current run files, live smokes, Issue #24 final comment | run/deploy/evidence files | `npm run bna:run:status` passes with no work remaining | none |

## 2026-06-25T19:10:00+03:00 checkpoint

Local browser/API smoke now passed for `REQ-20260625-026` and
`REQ-20260625-028`: owner login, protected hub, 9 contexts, 11 prompt links,
newest-recording status `PARTIAL / content_job:83`, clean server-side
exchange, cookie-backed review session reload, banner, Exit, no all-access
URL, and typed result readback `AGR-b9a823fc37acd01b`.

Focused tests passed 62/62. Watchdogs passed for actions, helper destinations,
security, content, communications, navigation IA, secrets, and source coverage.
`npm run watchdog:raw` returned `ok true` with two medium pre-existing June
17/18 fallback-pointer findings unrelated to `RAW-20260625-024`; keep them as
separate cleanup unless the final release gate requires repairing historical
raw fallback drift.

Open release gates remain: full `npm test`, stale-evidence/run validation,
visual/mobile or equivalent browser evidence, push/PR/merge, Railway deploy,
live hub/helper/result smokes, Issue #24 final evidence comment, and terminal
status updates. Do not hand off owner Agent Mode testing until those gates are
done.

## 2026-06-25T19:30:00+03:00 checkpoint

Full local validation now passed: `npm test` 1345/1345,
`npm run bna:run:validate`, stale-evidence detection, source coverage, action
registry coverage/parity tests, and visual watchdog against
`http://127.0.0.1:18824`.

Additional fixes made during full-suite closeout: Agent Review pages now load
the shared in-app select enhancer; stale tests and the task-decision census
canonical label now use `Codex Queue`; action coverage/parity artifacts were
regenerated after adding Agent Review action rows.

Visual evidence: broad visual watchdog passed with zero findings, and a 390px
Agent Review Hub screenshot shows all 9 context cards, the result form, and the
11-file prompt pack without visible horizontal overflow. A separate scripted
390px session screenshot attempt timed out after the hub capture; keep session
mobile/live evidence open for the post-deploy smoke while relying locally on
`agent-review-local-smoke.md` for session/result behavior.

Open release gates now remain: push/PR/merge, Railway deploy, live
hub/helper/result smokes, Issue #24 final evidence comment, and terminal status
updates.

## 2026-06-25T20:15:00+03:00 final closeout

All Issue #24 requirements are terminal Done. PRs #25-#30 are merged; final
app-visible master commit `9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942` deployed on Railway deployment
`24c1d191-3f50-4d0a-9da8-687ba2f1a434`; live Review Hub/helper/app/privacy/class-trace smokes all
passed. Live Review Hub: https://bneineviimacademy.org/operations/agent-review.

Live typed result proof: `AGR-96dfac2f8c31163c`. Live newest-recording trace
shown in the hub: `PARTIAL / content_job:83`, not fully processed. Issue #18
remains `NOT SAFE TO APPLY`; no class backfill was applied.

Final Issue #24 evidence comment: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24#issuecomment-4802269945
