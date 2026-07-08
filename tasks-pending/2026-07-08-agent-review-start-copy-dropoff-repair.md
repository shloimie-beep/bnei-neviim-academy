# Ramble Intake - 2026-07-08 - Agent Review Start, Copy, And Drop-off Repair

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-002-agent-review-start-copy-dropoff-repair.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-002 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-agent-review-start-copy-dropoff-repair.md |

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Implement the Agent Review Start Audit -> Copy -> Drop-off save -> Readback flow, record the failed partial One Time audit, verify with tests/smoke where safe, and leave all related requirements in terminal or explicitly blocked status. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260708-007 through REQ-20260708-014 |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260708-007 | Add explicit Start Audit state to Agent Review prompt cards. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | agent-review-workflow | P0 | 1 | none | Hub exposes Start Audit / I started this agent mode; starting records in-progress prompt/run/idempotency context, owner context when available, status, started_at, and visible timer/state. | server.js, public/agent-review.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-008 | Gate Copy Agent Prompt behind started audit state and include draft/result ID. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | prompt-contract | P0 | 1 | REQ-20260708-007 | Copy auto-starts or blocks until start; copied prompt includes in-progress AGR/draft/result ID, exact drop-off URL, API fallback, and top/bottom drop-off rules. | server.js, public/agent-review.html, prompt files/tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-009 | Harden Agent Mode prompt language for drop-off-first behavior. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | prompt-contract | P0 | 1 | REQ-20260708-008 | Generated prompts contain mandatory Start Audit, keep drop-off open, blocked-save, no-manual-upload, emergency paste, API fallback, and final response language. | src/lib/bna/agent-review-hub.js, public/agent-review-prompts, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-010 | Support partial BLOCKED saves in the Agent Review drop-off form/API. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | drop-off-api | P0 | 1 | none | Drop-off accepts `blocked`, `fail`, and `pass`; BLOCKED can save without full route matrix and includes blocked route/step, attempted action, observed failure, partial routes, helper responses, suggested correction, evidence notes, and idempotency key. | server.js, public/agent-review-dropoff.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-011 | Add readback confirmation after Agent Review save. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | result-readback | P0 | 1 | REQ-20260708-010 | Save confirmation shows AGR ID, status, prompt key, idempotency key, readback URL, timestamp, and Open saved readback link. Prompt tells agent to verify readback before final. | server.js, public/agent-review-dropoff.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-012 | Add autosave/draft persistence for drop-off notes without storing secrets. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | draft-persistence | P1 | 2 | REQ-20260708-010 | Drop-off page locally or server-side autosaves draft text/state and excludes cookies, passwords, API keys, screenshots with private data, refresh tokens, and reusable access secrets. | public/agent-review-dropoff.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-013 | Add watchdog/tests for generated prompt compliance and blocked partial save. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | verification | P0 | 2 | REQ-20260708-007, REQ-20260708-010 | Tests verify generated prompts include Start Audit, Copy, drop-off URL, blocked save, final answer format, API fallback, no manual upload language; blocked partial save is accepted. | tests/agent-review-hub.test.js, tests/agent-mode-task-dropoff.test.js, tests/agent-mode-operations-dropoff-prompts.test.js | no | Done locally |
| REQ-20260708-014 | Record the failed One Time Agent Mode audit as durable fail/partial evidence. | RAW-20260708-002 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | audit-record | P0 | 0 | none | Durable record exists with fail/partial status, blocker, visited routes, partial findings, and future backlog recommendations. It does not mark Issue #24 complete. | raw-input, tasks-pending, ledger/changelog | no | Done locally |
| REQ-20260708-015 | Lock the Agent Mode workflow into a reusable template/protocol. | RAW-20260708-005 | BNA Operations / Agent Review | Codex | prompt-template-protocol | P0 | 2 | REQ-20260708-007, REQ-20260708-009 | A repo-visible Agent Mode protocol/template artifact documents the reusable Start Audit -> Copy -> Drop-off -> Readback sequence, names the generator/source prompt, and tests prove generated prompts stay aligned to the template. | docs, src/lib/bna/agent-review-hub.js, tests/agent-review-hub.test.js | no | Done locally |

## Parsed Tasks

No new human-facing Tasks should be created from this packet. The work belongs
in the Agent Review/Codex lifecycle and this internal register. Future UI
cleanup prompts should be created only after the drop-off flow is reliable.

## Decisions

None required for this implementation batch. Live deployment may be blocked
later if branch drift, auth, or unrelated dirty work prevents a safe push/deploy.

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260708-003 | Should the failed partial audit be replayed from the live hub immediately after this repair deploy, or should it wait for a new owner Agent Mode session? | A real Agent Mode rerun needs owner login/session timing and should not be faked by local tests. | No for implementation; may block live Agent Mode evidence only | Open |

## Durable Memory Candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260708-001 | Agent Review prompts must treat drop-off as a workflow state: Start Audit, keep drop-off open, save pass/fail/blocked, verify readback, then final chat response. | Maybe after implementation | This appears durable for future Agent Mode prompt reliability, but should be promoted after code/test proof. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-014 | raw-input, tasks-pending, ops agent-review evidence | Record failed audit before code edits. | PASS raw record and execution-run evidence include failed/partial findings, routes visited, and blocker. | Pending | Pending | Not required |
| REQ-20260708-007..011 | `server.js`, `public/agent-review.html`, `public/agent-review-dropoff.html`, `src/lib/bna/agent-review-hub.js`, agent review prompt files | Reuse typed result API; add start state, copy gate, partial blocked fields, readback UI, and regenerated prompt contract. | PASS `node --check server.js`; PASS focused Agent Review tests 33/33; PASS `npm run watchdog:actions`; PASS `git diff --check`. | Commit `8f3320a0` pushed to `origin/master` | BLOCKED | Production still serves the older Agent Review prompt/drop-off assets; Railway deploy is blocked by explicit target auth/link failure. |
| REQ-20260708-012..013 | drop-off UI/tests/scripts | Add local draft autosave, secret-looking draft guard, compliance tests, registries. | PASS focused Agent Review tests 33/33; PASS action watchdog; route/action registries updated. | Commit `8f3320a0` pushed to `origin/master` | BLOCKED | App-visible deployment/live smoke blocked by Railway target auth. |
| REQ-20260708-015 | docs + prompt generator tests | Create a reusable Agent Mode template/protocol artifact and lock it to generated prompts with regression coverage. | PASS protocol doc added; PASS generated prompts include protocol pointer; PASS focused tests 33/33. | Commit `8f3320a0` pushed to `origin/master` | BLOCKED for live app assets; GitHub-visible protocol is pushed. | Production prompt readback does not yet include the protocol pointer because deploy has not picked up `8f3320a0`. |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-007 | Done locally, pending deploy/live smoke | Hub prompt cards show Start Audit, workflow state, start/result ref, timer, and call `/api/bna/agent-review/prompts/start` with CSRF. | `server.js`; `public/agent-review.html`; `ops/action-registry.json`; `ops/route-registry.json`; `tests/agent-review-hub.test.js` | PASS focused tests 66/66; PASS action watchdog. | Commit, push, deploy, live readback. |
| REQ-20260708-008 | Done locally, pending deploy/live smoke | Copy Agent Prompt now calls Start Audit first and prepends the in-progress AGR/draft ID, workflow state, started_at, idempotency key, and readback URL. | `public/agent-review.html`; `server.js` | PASS focused tests 66/66. | Commit, push, deploy, live readback. |
| REQ-20260708-009 | Done locally, pending deploy/live smoke | Generated prompts include `## Required Workflow State`, keep drop-off open, save BLOCKED if blocked, API fallback, readback requirement, and final markers. | `src/lib/bna/agent-review-hub.js`; `public/agent-review-prompts/*` | PASS `npm run agent-review:prompts`; PASS focused tests 66/66. | Commit, push, deploy, production prompt readback. |
| REQ-20260708-010 | Done locally, pending deploy/live smoke | Drop-off supports blocked route/step, attempted action, observed failure, partial routes, partial helper responses, and evidence notes; API metadata stores these fields. | `server.js`; `public/agent-review-dropoff.html` | PASS focused tests 66/66. | Commit, push, deploy, live blocked-save smoke. |
| REQ-20260708-011 | Done locally, pending deploy/live smoke | Save confirmation shows AGR ID, status, prompt key, idempotency key, readback URL, timestamp, and readback/repair links. | `public/agent-review-dropoff.html`; `server.js` | PASS focused tests 66/66. | Commit, push, deploy, live readback. |
| REQ-20260708-012 | Done locally, pending deploy/live smoke | Drop-off autosaves local browser drafts under prompt/run/idempotency scope and refuses secret-looking drafts. | `public/agent-review-dropoff.html` | PASS focused tests 66/66; inline script parse passed. | Commit, push, deploy. |
| REQ-20260708-013 | Done locally | Added registry/test coverage for start route/action, regenerated prompts, partial blocked save fields, and drop-off/readback contract. | `tests/agent-review-hub.test.js`; registries | PASS 66 focused tests; PASS `npm run watchdog:actions`; PASS `git diff --check`. | None after deploy evidence is recorded. |
| REQ-20260708-014 | Done locally | `RAW-20260708-002` and execution-run evidence preserve the failed partial audit, routes visited, blocker, and partial findings without marking Issue #24 complete. | `raw-input/RAW-20260708-002-agent-review-start-copy-dropoff-repair.md`; `ops/execution-runs/2026-06-26-agent-review-dropoff-repair/evidence/2026-07-08-one-time-brand-helper-toolbar-audit-failed-partial.md`; this register | PASS file/readback inspection. | None. |
| REQ-20260708-015 | Done locally | `docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md` documents the reusable workflow; `src/lib/bna/agent-review-hub.js` generated prompts point to it; `tests/agent-review-hub.test.js` locks the doc, generator, and generated prompt pack together. | `raw-input/RAW-20260708-005-agent-mode-template-protocol-lock.md`; `docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md`; `public/agent-review-prompts/*.md`; `tests/agent-review-hub.test.js` | PASS `npm run agent-review:prompts`; PASS focused tests 33/33; PASS watchdogs/hygiene. | Commit/push/deploy remains pending with the broader app-visible closeout. |

## 2026-07-08 Continuation Evidence

| Item | Result | Evidence |
|---|---|---|
| Prompt pack regenerated | PASS | `npm run agent-review:prompts` generated 15 files in `public/agent-review-prompts/`. |
| Focused Agent Review/drop-off tests | PASS | `node --test tests/agent-review-hub.test.js tests/agent-mode-task-dropoff.test.js tests/agent-mode-operations-dropoff-prompts.test.js tests/watchdog-action-registry.test.js` passed 32/32. |
| Syntax and JSON checks | PASS | `node --check server.js`; `node --check src/lib/bna/agent-review-hub.js`; JSON parse passed for the action registry, route registry, prompt index, and smoke JSON. |
| Watchdogs and hygiene | PASS | `npm run watchdog:actions` passed with 0 findings and report `ops/watchdog-audits/2026-07-08T06-08-watchdog-action-audit.md`; `npm run watchdog:protocol-drift` wrote `ops/watchdog-audits/2026-07-08-product-quality-drift.md`; `npm run secrets:audit` passed with 0 tracked secret-risk files; `git diff --check` exited 0 with line-ending warnings only. |
| Agent fleet | PASS | `npm run agent:fleet:status` showed supervisor PID 13544 running; `npm run agent:fleet:readiness` returned Overall OK true. No duplicate supervisor was started. |
| Browser smoke | PASS local edited server | `ops/live-smokes/2026-07-08T06-20-30-agent-review-start-dropoff-local-smoke.md` saved synthetic BLOCKED AGR readback `AGR-af79c7b82048ff1d` for `one-time-brand-helper-toolbar-audit`. |
| Template/protocol lock | PASS local | `docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md` added; generated prompts now include `Reusable protocol/template: docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md`; focused tests passed 33/33. |
| Full `npm test` | FAILED outside this scope | Full suite still has 8 failures in existing helper destination resolver, One Time Operations CSS/product/provider/route tests, and scoped Studio auth tests. The Agent Review/drop-off tests pass inside the suite. |
| Deploy/live production proof | BLOCKED | Not pushed/deployed from this checkout. Production cannot verify the new Start Audit UI until scoped commit, push, and deployment happen. |

## 2026-07-08 Pushed/Live Readback Evidence

| Item | Result | Evidence |
|---|---|---|
| Commit/push | PASS | `8f3320a0 Add One Time classroom rewards scoreboard` is on `master` and `origin/master`; it includes the Agent Review protocol/drop-off/template changes plus the separate classroom scoreboard lane. |
| Clean focused Agent Review tests | PASS | `node --test tests/agent-review-hub.test.js tests/agent-mode-task-dropoff.test.js tests/agent-mode-operations-dropoff-prompts.test.js tests/watchdog-action-registry.test.js` passed 33/33. |
| Clean combined classroom tests | PASS | `node --test tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-forum-gamification-plan.test.js tests/one-time-gamification-badge-audit.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js` passed 16/16 for the combined commit. |
| Syntax and hygiene | PASS | `node --check server.js`; `node --check src/lib/bna/agent-review-hub.js`; `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `npm run secrets:audit`; `git diff --check`. |
| Full `npm test` | FAIL outside this Agent Review scope | 1606/1614 passed. Failing tests: helper destination resolver readbacks/results; One Time Operations CSS global override guard; scoped OneTime product APIs/public draft route regex; provider review navigation click intercept; provider admin-provider no-session route count; Operations scoped Studio auth/me preservation. |
| Production prompt readback | BLOCKED stale deploy | `https://bneineviimacademy.org/agent-review-prompts/one-time-brand-helper-toolbar-audit.md` returned 200 but still showed `Generated: 2026-07-08T06:05:00.620Z` and did not include `Reusable protocol/template: docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md`. |
| Production prompt index readback | BLOCKED stale deploy | `https://bneineviimacademy.org/agent-review-prompts/index.json` returned 200 with `generated_at=2026-07-08T06:05:00.620Z`, not the committed `2026-07-08T06:33:18.874Z` prompt pack. |
| Production drop-off readback | BLOCKED stale deploy | Exact drop-off URL returned 200, but live HTML did not contain `blocked_route_or_step`, `partial_routes_visited`, `readbackPanel`, or the robust `data.result?.result_ref` readback fallback. |
| Live acceptance smoke | PASS unrelated to new prompt assets | `npm run app:smoke:one-time-agent-mode-acceptance` passed and wrote `ops/live-smokes/2026-07-08T06-45-04-413Z-one-time-agent-mode-acceptance-live-smoke.md`; this smoke does not prove the new Agent Review prompt/drop-off assets are deployed. |
| Railway deploy gate | BLOCKED | `npm run railway:doctor` without service target was blocked by the target guard. With `BNA_RAILWAY_SERVICE_NAME=skillful-motivation`, the guard selected the intended BNA target, but `railway link --project bd5b6d78-5e83-4e83-89b2-cd5f52ed7889 --environment production --service skillful-motivation --json` failed `Unauthorized`. Owner/agent with valid Railway target auth must deploy `8f3320a0` and rerun production readback. |

Remaining closeout blocker: implementation and GitHub-visible protocol are
pushed, but app-visible Agent Review prompt/drop-off assets are not live. Do
not mark the Agent Review drop-off repair fully Done until Railway deploy
auth/target access is repaired, production serves commit `8f3320a0` or later,
and prompt/drop-off readbacks confirm the reusable protocol and partial
BLOCKED save fields.
