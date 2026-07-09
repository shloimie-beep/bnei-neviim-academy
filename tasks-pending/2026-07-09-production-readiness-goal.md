# Production Readiness Goal

## Raw intake

Source: `RAW-20260709-010`

Shloimie made production readiness the active umbrella goal: get the entire
BNA and OneTime system ready for production.

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Get the entire BNA and OneTime system production-ready by maintaining a durable production-readiness goal, auditing every launch-critical surface, executing unblocked fixes through verification/deploy/live-smoke, and leaving exact owner/blocker/next-action records for anything external or unsafe to complete automatically. |
| Goal tool used | yes |
| Standing goal promoted | `GOAL-PROD-001` |
| Production-ready meaning | All critical public, Operations, portal, helper, privacy, deploy, performance, and provider setup gates are either passing with current evidence or blocked with exact owner and next action. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |

## Production Readiness Definition

The system is not production-ready merely because it deploys. It is
production-ready when these classes are green or precisely blocked:

- Public funnels: BNA and OneTime public pages load, explain the offer safely,
  and capture leads without privacy leaks or false portal/payment promises.
- Operations: Super Admin can log in, navigate, use helper/tools, and see no
  blank screens or major console/server errors.
- Portals: parent/student/provider/Rabbi surfaces enforce scope and do not show
  wrong workspace, fixture/test labels, private data, or unusable actions.
- Lead capture/CRM: submissions create first-party local records and follow-up
  notes; no external CRM/runtime writes are required for the launch lane.
- Communications: email/WhatsApp/WAPI/campaign paths are no-send by default
  unless exact recipient/copy/sender/approval exists.
- Payments/access: checkout, subscriptions, portal access, and member grants
  are blocked until Stripe/price/access policy are explicitly approved and
  smoked.
- Privacy/security: public routes expose anonymous-safe data only; private
  routes reject anonymous/wrong-scope access.
- Performance: launch-critical pages render fast enough to operate and have no
  broken startup errors; known slow/fanout issues are tracked as engineering
  work.
- Deploy/release: master is pushed, release guards pass, deployment targets are
  explicit, deployments reach `SUCCESS`, and live smoke/readback evidence is
  recorded.
- Proof: each requirement has source provenance, files inspected, verification,
  evidence, ledger/changelog, and deploy/live-smoke where applicable.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-047 | Promote production readiness to a durable standing goal. | RAW-20260709-010 | agent_ops | Codex | goal-memory | P0 | 0 | none | Raw input, standing goal, memory note, register, ledger/changelog records exist. | QUALITY-GOALS.md; MEMORY.md; memory/2026-07-09.md; tasks-pending; ops ledgers | no | Done |
| REQ-20260709-048 | Establish the production readiness matrix and current baseline. | RAW-20260709-010 | BNA + OneTime | Codex | readiness-audit | P0 | 1 | REQ-20260709-047 | Register names readiness classes, live URLs, current deploys, known blockers, and first audit commands. | this file; launch catch-up register; active execution run | no | Done |
| REQ-20260709-049 | Run a first production readiness audit from the current live state. | RAW-20260709-010 | BNA + OneTime | Codex | verification | P0 | 1 | REQ-20260709-048 | Representative release, security, action, route, helper, public, and OneTime setup checks pass or produce exact blockers. | smoke/watchdog outputs | maybe | Done |
| REQ-20260709-050 | Keep immediate lead-capture/free-class lane production-live while blocking unapproved full-launch automations. | RAW-20260709-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | launch-scope | P0 | 2 | REQ-20260709-049 | Public lead capture remains live and verified; full portal/payment/WAPI/campaign launch remains blocked until external values exist. | server.js; public/one-time; launch registers | yes if code changes | Already satisfied |
| REQ-20260709-051 | Convert remaining production blockers into owner/action records. | RAW-20260709-010 | BNA + OneTime + agent_ops | Codex | blockers | P0 | 2 | REQ-20260709-049 | External blockers and engineering blockers have stable IDs, owner, recommended next action, and evidence. | tasks-pending; ops ledgers; active execution run | no | Done |
| REQ-20260709-052 | Execute the next unblocked engineering readiness batch. | RAW-20260709-010 | BNA + OneTime | Codex | implementation | P0 | 3 | REQ-20260709-051 | Next batch is selected from audit evidence, implemented, verified, pushed, deployed/live-smoked when app-visible, or blocked precisely. | public/js/operations-shell.js; server.js; tests/one-time-external-user-portal.test.js | yes | Done |

## Current baseline from latest closeout

- `master`: pushed and clean through `ee10b24` before this target-guard
  closeout batch.
- BNA live URL: `https://bneineviimacademy.org`.
- BNA latest runtime fix deploy: Railway `skillful-motivation`,
  deployment `66a2f5af-5fb8-4b39-b897-056cd725e669`, `SUCCESS`.
- OneTime live URL: `https://join.onetimeonetime.com`.
- OneTime latest runtime deploy: Railway `one-time-production` /
  `one-time-web`, deployment `5c47678a-3a05-4d52-8e03-db86fa1959ab`,
  `SUCCESS`.
- OneTime public target routes and instance-config pass against the canonical
  join domain; local Railway CLI link mismatches are now warnings, not public
  target blockers.
- Active execution run validates with 8 done and 2 blocked full-launch setup
  requirements.
- Immediate public lead capture/free-class follow-up lane is deployed and
  live-smoked.

## Known blockers before first audit

| ID | Status | Owner | Blocker | Recommended next action |
|---|---|---|---|---|
| REQ-20260702-108 | Blocked | Shloimie / external setup, Codex to verify | Full provider/campaign setup lacks Zoom alias, Stripe sandbox/price alias, WAPI/Whapi instance/phone, final campaign copy, recipient segment/list, suppression/unsubscribe proof, and seed approval. | Provide or label the exact setup values, then rerun `npm run one-time:setup:check`. |
| REQ-20260702-110 | Blocked | Shloimie / external setup, Codex to verify | Full setup bootstrap blocked until the same external values exist. | Keep immediate lead capture live; do not enable payment/access/campaign automation until setup values pass. |
| DEC-20260709-008 | Needs operator decision | Shloimie | Exact approved free Zoom URL/alias is missing for automated invite sends. | Provide the final URL/alias or keep follow-up manual/no-send. |
| PERF-20260709-001 | Done, deployed/live-smoked | Codex | BNA Operations rendered with 0 console errors, but startup still performed 118 API reads, median 1064ms, P95 2855ms, max 3622ms. | Reduced dashboard startup fanout, removed support-ticket loading from dashboard first paint, bounded support-ticket list query, deployed BNA, and recorded live profile proof. |
| PERF-20260709-002 | Follow-up, not launch-blocking | Codex | Final dashboard profile is usable but still shows a later refresh cycle around 33s and initial slowest dashboard reads near 3s. | If more performance polish is needed, inspect dashboard refresh scheduling and tune task/device/payment reads after screenshot-led UI work. |
| DEPLOY-20260709-003 | Done | Codex | `npm run railway:doctor` loaded a stale project token even when BNA deploys used account auth, which made deploy-proof readback look blocked after successful deployments. | Updated `scripts/railway-doctor.ps1` to honor `BNA_RAILWAY_USE_ACCOUNT_AUTH` before loading `.secrets/railway-token.txt`; verified doctor passes against BNA production deployment `e1cef921-0e58-4fe7-aaf7-d9be65b06295`. |
| TARGET-20260709-004 | Done | Codex | `npm run one-time:target:guard` hard-blocked the public OneTime target when the local Railway CLI was linked to BNA, even though the canonical OneTime domain and instance config passed. | Reclassified local Railway status mismatch as a warning in `scripts/release-captain.mjs`, added regression coverage, and kept `npm run one-time:railway-target:guard` as the dedicated Railway instance proof. |

## First audit command plan

Run these before selecting the next implementation batch:

- `git status -sb`
- `npm run bna:run:validate`
- `npm run secrets:audit`
- `npm run watchdog:actions`
- `npm run watchdog:security`
- `npm run watchdog:workspace-scope`
- `npm run watchdog:raw`
- `npm run app:smoke -- https://bneineviimacademy.org`
- `npm run app:smoke:operations-helper -- https://bneineviimacademy.org`
- `npm run app:smoke:operations-workspace-taxonomy -- https://bneineviimacademy.org`
- `npm run app:smoke:public-privacy -- https://bneineviimacademy.org`
- `npm run one-time:target:guard -- --json`
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
- `npm run one-time:setup:check`
- `npm run one-time:wapi:readiness`

## First audit results

| Check | Result | Evidence / blocker |
|---|---|---|
| `git status -sb` | Expected dirty | Only this production-readiness raw/register/memory goal batch was dirty. |
| `npm run bna:run:validate` | PASS | Active run validates; 8 done, 2 blocked. |
| `npm run secrets:audit` | PASS | 7402 tracked paths checked, 0 tracked secret-risk files. |
| `npm run watchdog:actions` | PASS | `ops/watchdog-audits/2026-07-09T12-28-watchdog-action-audit.md`, 0 findings. |
| `npm run watchdog:security` | PASS | `ops/watchdog-audits/2026-07-09T12-28-watchdog-security-routes.md`, 0 findings. |
| `npm run watchdog:workspace-scope` | PASS | Workspace scope guardrail passed. |
| `npm run watchdog:raw` | PASS | `ops/watchdog-audits/2026-07-09T12-28-raw-intake-drift.md`, 0 findings. |
| BNA live app smoke | PASS | `ops/live-smokes/2026-07-09T12-28-34-125Z-live-app-smoke.md`. |
| BNA Operations helper smoke | PASS | `ops/live-smokes/2026-07-09T12-28-33-152Z-operations-helper-live-smoke.md`. |
| BNA workspace taxonomy smoke | PASS | `ops/live-smokes/2026-07-09T12-28-33-249Z-operations-workspace-taxonomy-live-smoke.md`. |
| BNA public privacy smoke | PASS | `ops/live-smokes/2026-07-09T12-29-06-345Z-public-route-privacy-smoke.md`. |
| OneTime target guard | Target checks passed; strict release gate expected-dirty before commit | Canonical `/`, `/one-time/`, and `/api/one-time/instance-config` checks pass. `TARGET-20260709-004` fixed the false hard blocker from a BNA-linked local Railway CLI status. |
| OneTime separate-instance smoke | PASS | Health/config/root/public/OneTime/member/classroom routes returned 200. |
| Rabbi OneTime landing smoke | PASS | `ops/live-smokes/2026-07-09T12-28-55-415Z-rabbi-onetime-landing-smoke.md`. |
| `npm run one-time:setup:check` | EXPECTED BLOCKED | Ready 4/8. Blocks: Zoom alias, Stripe sandbox/price alias, WAPI instance/phone, campaign copy/list/suppression/seed approval. |
| `npm run one-time:wapi:readiness` | EXPECTED BLOCKED | `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`; outbound token configured, but instance ID, phone metadata, auto-reply approval, and class link are missing. |

## Next unblocked engineering batch

`PERF-20260709-001` was selected and completed as the first unblocked
production-readiness engineering batch. It did not require external account
access, sends, payment, DNS, or credentials.

## PERF-20260709-001 closeout

Implemented:

- Reduced BNA Operations dashboard startup fanout in
  `public/js/operations-shell.js` by using a dashboard light pass instead of
  loading broad module datasets on the dashboard.
- Removed `/api/bna/support-tickets` from dashboard first paint; support/API
  views still load support tickets when those views need them.
- Bounded `/api/bna/support-tickets` in `server.js` to a default max of 200
  tickets, max 500 when requested, and computed comment counts only for the
  returned ticket IDs.
- Added a regression assertion in
  `tests/one-time-external-user-portal.test.js` so the private support-ticket
  sort CTE does not regress to an invalid `ft.created_at` outer reference.

Commits pushed:

- `43b1ce9e` - `Reduce Operations dashboard startup fanout`
- `a2f15c31` - `Speed up Operations support data loading`
- `7e69aece` - `Fix support ticket query ordering`

BNA deployments:

- `daf5609f-5d79-41bb-9418-fa9390f30436` - first dashboard light-pass deploy,
  `SUCCESS`.
- `2bf06b69-b76f-499a-a932-07b5a39e2071` - support loading/query deploy,
  `SUCCESS`.
- `73c4d440-e0b3-495d-91ec-add72229b304` - support query ordering hotfix,
  `SUCCESS`.

Verification:

- PASS `node --check public/js/operations-shell.js`
- PASS `node --check server.js`
- PASS focused Operations/support/action tests.
- PASS `npm test` 1693/1693 after each final backend patch.
- PASS `npm run secrets:audit` with 7404 tracked paths and 0 secret-risk files.
- PASS `npm run watchdog:actions` with 0 findings.
- PASS `npm run watchdog:protocol-drift` with 0 findings.
- PASS `npm run bna:run:validate` with the expected 8 done / 2 blocked
  external setup state.
- PASS BNA live app smoke:
  `ops/live-smokes/2026-07-09T12-54-46-066Z-live-app-smoke.md`.
- PASS BNA Operations helper smoke:
  `ops/live-smokes/2026-07-09T12-54-45-114Z-operations-helper-live-smoke.md`.
- PASS BNA workspace taxonomy smoke:
  `ops/live-smokes/2026-07-09T12-54-45-134Z-operations-workspace-taxonomy-live-smoke.md`.
- PASS protected live support-ticket readback after hotfix:
  `/api/bna/support-tickets` returned HTTP 200, 23 tickets, about 2.9s.
- FIXED `npm run railway:doctor` account-auth mismatch in
  `DEPLOY-20260709-003`; rerun with explicit BNA account-auth target passed and
  confirmed deployment `e1cef921-0e58-4fe7-aaf7-d9be65b06295` reached
  `SUCCESS`.

## DEPLOY-20260709-003 closeout

Implemented:

- Added the same `BNA_RAILWAY_USE_ACCOUNT_AUTH` check to
  `scripts/railway-doctor.ps1` that already existed in
  `scripts/railway-redeploy.ps1`.
- Prevented doctor from loading `.secrets/railway-token.txt` when account auth
  is explicitly requested.
- Extended `tests/railway-target-guard.test.js` to assert auth-mode parity
  between doctor and redeploy scripts.

Verification:

- PASS `node --test tests\railway-target-guard.test.js tests\one-time-deployment-readiness.test.js`
  13/13.
- PASS `npm run railway:doctor` with explicit BNA target/account auth.
- PASS `npm run secrets:audit` with 7408 tracked paths and 0 secret-risk files.
- PASS `npm run bna:run:validate` with expected 8 done / 2 blocked state.
- PASS `git diff --check` with line-ending warnings only.

## TARGET-20260709-004 closeout

Implemented:

- Reclassified local Railway CLI status mismatch in the OneTime public target
  guard from hard blocker to warning after the canonical public routes and
  `/api/one-time/instance-config` pass.
- Added `railway_status.matches_expected` to make the local CLI mismatch
  visible without incorrectly blocking the public target guard.
- Added regression coverage proving a BNA-linked local Railway status does not
  fail the OneTime public target guard when live public checks pass.

Verification:

- PASS `node --check scripts\release-captain.mjs`.
- PASS `node --test tests\release-captain.test.js` 6/6.
- PASS OneTime public target checks inside
  `npm run one-time:target:guard -- --json`: canonical `/`, `/one-time/`, and
  `/api/one-time/instance-config` all returned the expected OneTime app and
  workspace/project values.
- EXPECTED DIRTY before closeout commit: the strict release captain command
  still blocked deployment state because this scoped fix and current WAPI
  readiness reports were uncommitted.
- EXPECTED BLOCKED `npm run one-time:wapi:readiness`: latest report remains
  blocked only by missing WAPI instance ID, sender phone metadata, auto-reply
  enable/approval, and class link alias.

Performance proof:

| Profile | Shell visible | Fetches under 10s | Support-ticket dashboard fetches | Slowest fetch | Console errors | Failed requests | Evidence |
|---|---:|---:|---:|---:|---:|---:|---|
| Before dashboard/support fix | 8574ms | 17 | 1 | 35859ms | 0 | 0 | `ops/performance-audits/2026-07-08-app-backend-helper-performance/residual-slowness-profile-live-bna-platform-after-dashboard-light-pass.md` |
| After hotfix | 3186ms | 16 | 0 | 2979ms | 0 | 0 | `ops/performance-audits/2026-07-08-app-backend-helper-performance/residual-slowness-profile-live-bna-platform-after-support-ticket-hotfix.md` |

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260709-047 | Done | Raw/register/standing goal/memory note created. | Static file readback; ledger/changelog pending closeout commit. | None |
| REQ-20260709-048 | Done | Current baseline recorded above. | Baseline reconciled against launch catch-up register and active execution run. | None |
| REQ-20260709-049 | Done | First audit results table above plus `TARGET-20260709-004`. | PASS repo/security/privacy/BNA/OneTime public checks; expected blocked setup/WAPI checks recorded. | None for public target; full setup/WAPI remains externally blocked. |
| REQ-20260709-050 | Already satisfied | `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md`; launch catch-up register. | Lead capture live-smoked in prior closeout. | Automated Zoom invite/payment/access/campaign remain blocked. |
| REQ-20260709-051 | Done | Known blockers table plus first audit results. | External blockers retained; performance blocker selected as next engineering batch. | None |
| REQ-20260709-052 | Done | `PERF-20260709-001`, `DEPLOY-20260709-003`, and `TARGET-20260709-004` closeouts above; commits `43b1ce9e`, `a2f15c31`, `7e69aece`, `ee10b24`. | PASS tests/gates/live smokes/support readback/profile plus focused target-guard regression checks. | Residual performance follow-up `PERF-20260709-002` is not launch-blocking; full OneTime setup still externally blocked. |
