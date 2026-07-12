# One Time P0/P1 Corrective Completion

Raw source: `raw-input/RAW-20260712-001-onetime-pr129-completion-followup.md`
Execution run: `ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion`
Continues prior run:
`ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective`
Delivery lane: PR #129,
`codex/onetime-p0p1-corrective-20260711`

## Git Truth At Capture

- Clean worktree:
  `C:\Users\User\BNA-onetime-p0p1-corrective-20260711`
- Branch: `codex/onetime-p0p1-corrective-20260711`
- PR URL: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR head at capture: `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- Base/master at audit time: `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`
- Existing corrective commits present:
  `e49bd3b00291818bb44e4a483fdd69b35f599c28`,
  `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`

## Register Rule

This continuation does not open a new PR or delivery lane. It reconciles the
July 12 operator prompt into the existing PR #129 branch. Prior local evidence
from July 11 is input only; app-visible requirements are not Done until
implementation, authentic tests, screenshots/runtime proof, current PR records,
authorized release, and exact deployed SHA live smoke are recorded.

## Requirements

| ID | Priority | Batch | Status | Requirement | Terminal Criteria |
| --- | --- | --- | --- | --- | --- |
| REQ-20260712-001 | P0 | intake-run | Verified | Capture the July 12 follow-up prompt, Robot/image context, and continuation run before implementation. | Raw input, daily memory, register, run files, latest pointer, and prior-run continuation state validate. |
| REQ-20260712-002 | P0 | delivery-truth-ci | Needs operator decision | Reconcile PR #129 delivery truth and add CI enforcement for Operations build/checks, focused One Time tests, and secrets audit. | PR/run/ledger/control-tower/latest truth is current and local gates pass; GitHub workflow publishing requires a token/maintainer with `workflow` scope. |
| REQ-20260712-003 | P0 | canonical-operations-proof | Verified | Ensure browser tests load real `/operations` bootstrap/generated CSS/JS assets, not raw `public/operations.html`. | Canonical-route harness proves the served route uses generated assets and direct source HTML cannot substitute as proof. |
| REQ-20260712-004 | P0 | rabbi-provider-login | Verified | Normal One Time provider credentials establish a scoped Operations session and land on canonical `/operations`; provider aliases resolve to the same shell. | Authentic login/session browser test passes; old provider CRM is not independently reachable; BNA Super Admin remains unchanged. |
| REQ-20260712-012 | P0 | urgent-signup-addendum-intake | Verified | Capture the urgent signup/reminder workflow addendum into the active run without opening a competing PR. | Raw addendum, dated register, daily memory, and machine-readable run records exist. |
| REQ-20260712-013 | P0 | direct-signup-page | Needs operator decision | Create canonical `/one-time/signup`, route all public Sign Up Now actions to it, and remove duplicate/internal signup copy. | Local route/action/config/browser proof is complete, but deployment/live/operator proof requires release authorization before terminal verification. |
| REQ-20260712-005 | P0 | first-party-crm | Blocked | Complete the first-party One Time CRM DTO, list/detail/timeline/actions/mailbox journey with real API persistence and cross-workspace denial. | Local DTO/API/UI/tests/responsive smoke pass; terminal proof requires `BNA_ONETIME_CRM_TEST_DATABASE_URL` and `npm run one-time:smoke:crm-journey-local-db`. |
| REQ-20260712-006 | P0 | onboarding-linkage | Not started | Complete first signup and Family/School continuation linkage with exact original lead IDs, UTM/referrer preservation, classification, and real API persistence. | Signup has required contact fields only; continuation validates product/crm lead IDs; Family and School branches persist without external sends/payments/access changes. |
| REQ-20260712-007 | P1 | landing-robot-config | Not started | Complete public landing hierarchy, remove placeholders/competing CTAs, optimize full-silhouette Robot launcher, and synchronize One Time config/assets/navigation. | Rendered landing matches approved copy and visual direction; Robot is recognizable and accessible; config matches live paths; unavailable assets hide cleanly. |
| REQ-20260712-008 | P0 | ramble-to-done-service | Needs operator decision | Implement one canonical `ingestOperatorRamble()` service and route Operations, Telegram, ChatGPT/Codex dropoff, and file intake through it before specialized extraction. | Local service/API/dropoff tests and watchdogs pass; terminal Done requires release/live proof under the separate release gate. |
| REQ-20260712-009 | P0 | regression-suite | Needs operator decision | Add mandatory regression tests for long rambles, duplicate Telegram idempotency, codex_chat recognition, blocked-decision independence, result propagation, failed verification, release gating, ID validation, intake API parent records, packet status, and worker-offline state. | Local regression tests pass; terminal Done remains release/live-smoke gated because server-visible protocol behavior changed. |
| REQ-20260712-010 | P1 | screenshots-matrix-pr | Not started | Produce required screenshots and requirement matrix linking source statements to code, tests, screenshots, PR/commit, and deploy/live proof. | Screenshots exist for required views at required widths; matrix is current and does not claim live proof before deployment. |
| REQ-20260712-011 | P1 | release-live-smoke | Needs operator decision | Merge/deploy/live-smoke only after explicit release authorization. | After approval, exact deployed SHA is live-smoked; until then report ready-for-release with the single blocker. |

## Decisions And Blockers

| ID | Decision | Missing information | Owner | Recommended option | Blocks requirements | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DEC-20260712-001 | Production release authorization | Explicit approval to merge/deploy PR #129 and run live smoke on the exact deployed SHA. | Operator / reviewer | Review PR #129 after verification, then explicitly approve or reject release. | REQ-20260712-011 and terminal Done state for app-visible requirements. | Needs operator decision |
| DEC-20260712-002 | Local/test CRM database proof | `BNA_ONETIME_CRM_TEST_DATABASE_URL` pointing at an approved local/test Postgres database. | Operator / local test environment | Provide a non-production test database URL and rerun `npm run one-time:smoke:crm-journey-local-db`. | REQ-20260712-005 terminal verification and dependent REQ-20260712-006. | Blocked |

## Open Questions

None for local implementation. Deployment remains authorization-gated.

## Durable Memory Candidates

| ID | Candidate | Promote? | Reason |
| --- | --- | --- | --- |
| MEM-20260712-001 | Definition of Done for this One Time lane requires implementation, authentic tests, visual/runtime proof, current PR records, authorized deploy, and exact deployed SHA live smoke. | No immediate MEMORY edit. | This already matches AGENTS and BNA-RAMBLE-TO-DONE; keep it scoped to this run unless repeated as a new durable rule. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-20260712-002 | `package.json`, run files, control tower, ledger/changelog | Reconcile PR/run truth and add local focused gate. | `gh pr view`, `npm run bna:run:validate`, local gate commands, secrets audit, and push rejection readback for workflow scope. | Pending | Pending | CI workflow publishing blocked until a workflow-scope GitHub credential is available |
| REQ-20260712-003 | `tests/one-time-operations-ui-smoke.test.js`, `scripts/split-operations-shell.mjs`, Operations bootstrap/generated assets | Canonical-route test harness serves real bootstrap/generated assets; splitter emits shared shell helpers needed before deferred loading. | `npm run operations:build`; `npm run operations:check-generated`; `npm run operations:check-canonical`; `npm run test:onetime:focused` 42/42. | Pending | Pending | Blocked until release authorization |
| REQ-20260712-004 | `server.js`, `public/operations.html`, generated Operations assets, provider login tests | Bridge real One Time provider sessions into project-scoped Operations identity; redirect normal provider login and aliases to canonical `/operations`; clean targeted disabled-state copy. | `node --check server.js`; `operations:check-generated`; `operations:check-canonical`; `test:onetime:focused` 44/44; targeted copy scan. | Pending | Pending | Blocked until release authorization |
| REQ-20260712-013 | `server.js`, `public/one-time/signup.html`, `public/one-time/index.html`, `public/js/bna-bot-widget.js`, One Time config/route/action registries, focused signup tests | Standalone direct signup route with required first-step fields, reminder gating, canonical CTAs, and no customer-facing internal copy. | `node --check server.js`; `node --check public/js/bna-bot-widget.js`; focused signup/reminder tests 30/30; `npm run test:onetime:focused` 53/53; `npm run watchdog:actions`; `npm run bna:run:validate`. | Pending | Pending | Blocked until release authorization |
| REQ-20260712-005 | `src/lib/bna/crm-contact-model.js`, `server.js`, `public/operations.html`, generated Operations assets, CRM tests/smokes | Enrich first-party CRM DTO, add safe identity edits/follow-up task creation/timeline rows, target mailbox to selected contact, and add local/test DB journey smoke. | Local tests/smoke pass; real local/test DB journey is blocked because `BNA_ONETIME_CRM_TEST_DATABASE_URL` is missing. | Pending | Pending | Blocked on local/test DB proof and later release authorization |
| REQ-20260712-006 | `server.js`, landing/signup/onboarding files/tests | Link quick signup to continuation with lead IDs and UTM/referrer. | Family/School API/browser journey. | Pending | Pending | Blocked until release authorization |
| REQ-20260712-007 | `public/one-time/index.html`, `public/one-time-preview.html`, `public/js/bna-bot-widget.js`, One Time config/assets | Complete approved public landing and Robot launcher. | Screenshot set, public smoke, asset/readability checks. | Pending | Pending | Blocked until release authorization |
| REQ-20260712-008 | `src/platform/ingestion/operator-ramble-service.js`, `src/platform/ingestion/packet-status.js`, `server.js`, `scripts/chatgpt-dropoff-ingestor.mjs`, `scripts/chatgpt-dropoff-control-tower.mjs`, Operations source/generated assets, focused ingestion/API/dropoff tests | Canonical service emits statement maps, requirement/job projections, receipts, worker-health truth, status propagation, packet-status migration/rejection, and release-gated verification propagation; Operations API and ChatGPT dropoff/control-tower payloads use the shared contracts; duplicate task #1945 packet claim corrected. | Service/dropoff/control-tower/intake tests pass; `test:onetime:focused` 54/54; Operations build/check/canonical; raw/action/protocol watchdogs; secrets audit; run validator. | Pending | Pending | Release/live-smoke remains gated separately |
| REQ-20260712-009 | `tests/ingestion/ramble-regression-suite.test.js`, `tests/ingestion/operator-ramble-service.test.js`, `tests/chatgpt-dropoff-ingestor.test.js`, `tests/chatgpt-dropoff-control-tower.test.js`, `tests/one-time-intake-api-readback.test.js`, `src/platform/ingestion/`, `server.js`, Operations source/generated assets | Mandatory ramble-to-done regressions cover adapter recognition, statement offsets/hashes, no-lost mapping, exact execution IDs, blocked-decision independence, failed verification staying open, UI release/live gate, intake API readback, packet-status migration/rejection, and worker-offline truth. | `node --test tests/ingestion/ramble-regression-suite.test.js` 4/4; service test 6/6; dropoff/control-tower/intake readback 12/12; `test:onetime:focused` 54/54; watchdogs; secrets audit; run validator. | Pending | Pending | Release/live-smoke remains gated separately |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
| --- | --- | --- | --- | --- | --- |
| REQ-20260712-001 | Verified | Raw/register/run/latest files | Raw/run/task files | Pending full `npm run bna:run:validate` after register write | Implementation work remains |
| REQ-20260712-002 | Needs operator decision | `package.json`; July 11 run reconciliation; push rejection readback for workflow scope | Package script, run records | `operations:check-generated`, `operations:check-canonical`, `operations:build` diff clean, `test:onetime:focused` 42/42, `secrets:audit`; `git push` blocked only on workflow file scope | CI workflow file must be added by a workflow-scope GitHub credential |
| REQ-20260712-003 | Verified | Canonical smoke serves `operations-bootstrap.html` and generated assets, not raw `operations.html`; splitter shared helpers rebuilt into shell | Test harness, splitter, generated assets | `operations:build`, `operations:check-generated`, `operations:check-canonical`, `test:onetime:focused` 42/42 | Remote GitHub check will run after push |
| REQ-20260712-004 | Verified | Normal provider login browser journey and alias redirects; scoped provider session bridges into canonical Operations; targeted internal disabled-state copy removed | Server auth/session routes, Operations source/generated assets, provider login browser test | `node --check server.js`, `operations:check-generated`, `operations:check-canonical`, `test:onetime:focused` 44/44 | Remote GitHub check will run after push |
| REQ-20260712-013 | Needs operator decision | Canonical `/one-time/signup`; public CTA routing; responsive Playwright journey; route/action/config coverage | Signup page, landing, bot widget, server route, registries, focused tests | `node --check server.js`, `node --check public/js/bna-bot-widget.js`, focused signup/reminder tests 30/30, `test:onetime:focused` 53/53, `watchdog:actions`, `bna:run:validate` | Deployment/live/operator proof requires release authorization |
| REQ-20260712-005 | Blocked | CRM DTO/API/UI implementation, first-party follow-up task creation, targeted mailbox return state, responsive browser/API smoke, blocked local/test DB report | `src/lib/bna/crm-contact-model.js`, `server.js`, Operations source/generated assets, CRM tests/smokes | `node --test tests/crm-contact-model.test.js tests/service-provider-scope-routes.test.js` 10/10, `test:onetime:focused` 54/54, `one-time:smoke:operations-crm-workbench-local` PASS, `one-time:smoke:crm-journey-local-db` BLOCKED missing `BNA_ONETIME_CRM_TEST_DATABASE_URL` | Real local/test Postgres persistence proof still required |
| REQ-20260712-008 | Needs operator decision | Canonical `ingestOperatorRamble()` service, shared packet-status contract, Operations parse API receipts, ChatGPT dropoff/control-tower canonical status normalization, `codex_done` migration/rejection, worker-offline truth, duplicate task #1945 claim correction, regenerated Operations assets | `src/platform/ingestion/operator-ramble-service.js`, `src/platform/ingestion/packet-status.js`, `server.js`, `scripts/chatgpt-dropoff-ingestor.mjs`, `scripts/chatgpt-dropoff-control-tower.mjs`, Operations source/generated assets, focused tests, corrected packet status | Syntax checks; service test 6/6; dropoff/control-tower/intake readback 12/12; `test:onetime:focused` 54/54; Operations build/check/canonical; `watchdog:raw`; `watchdog:actions`; `watchdog:protocol-drift`; `secrets:audit`; `bna:run:validate` | Terminal Done requires production release/live smoke |
| REQ-20260712-009 | Needs operator decision | Mandatory ramble-to-done regression suite is locally passing for statement mapping, ID contracts, blocked-decision independence, verification/release gates, packet-status migration/rejection, intake readback, and worker-offline truth | `tests/ingestion/ramble-regression-suite.test.js`, `tests/ingestion/operator-ramble-service.test.js`, `tests/chatgpt-dropoff-ingestor.test.js`, `tests/chatgpt-dropoff-control-tower.test.js`, `tests/one-time-intake-api-readback.test.js`, service/status/server/Operations files | Dedicated ramble suite 4/4; service test 6/6; dropoff/control-tower/intake readback 12/12; `test:onetime:focused` 54/54; watchdogs; secrets audit; run validator | Terminal Done requires production release/live smoke |
| REQ-20260712-011 | Needs operator decision | This register | None | Not run | Release authorization required |
