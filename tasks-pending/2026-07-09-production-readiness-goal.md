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
| REQ-20260709-052 | Execute the next unblocked engineering readiness batch. | RAW-20260709-010 | BNA + OneTime | Codex | implementation | P0 | 3 | REQ-20260709-051 | Next batch is selected from audit evidence, implemented, verified, pushed, deployed/live-smoked when app-visible, or blocked precisely. | TBD | yes if app-visible | Pending |

## Current baseline from latest closeout

- `master`: pushed and clean at `cd0ca35c`.
- BNA live URL: `https://bneineviimacademy.org`.
- BNA latest runtime fix deploy: Railway `skillful-motivation`,
  deployment `e468f43f-810e-49cf-b2a2-03e76281e8f9`, `SUCCESS`.
- OneTime live URL: `https://join.onetimeonetime.com`.
- OneTime latest runtime deploy: Railway `one-time-production` /
  `one-time-web`, deployment `5c47678a-3a05-4d52-8e03-db86fa1959ab`,
  `SUCCESS`.
- Final target guard after proof push passed at head `cd0ca35c`.
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
| PERF-20260709-001 | Open engineering blocker | Codex | BNA Operations renders with 0 console errors, but startup still performs 118 API reads, median 1064ms, P95 2855ms, max 3622ms. | Profile and reduce startup fetch fanout; lazy-load non-current modules; cache repeated support/student reads; inspect indexes only after fanout is reduced. |

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
| OneTime target guard | Expected blocked before commit | Target checks passed, but guard refused because the production-readiness docs were uncommitted. Rerun after push required. |
| OneTime separate-instance smoke | PASS | Health/config/root/public/OneTime/member/classroom routes returned 200. |
| Rabbi OneTime landing smoke | PASS | `ops/live-smokes/2026-07-09T12-28-55-415Z-rabbi-onetime-landing-smoke.md`. |
| `npm run one-time:setup:check` | EXPECTED BLOCKED | Ready 4/8. Blocks: Zoom alias, Stripe sandbox/price alias, WAPI instance/phone, campaign copy/list/suppression/seed approval. |
| `npm run one-time:wapi:readiness` | EXPECTED BLOCKED | `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`; outbound token configured, but instance ID, phone metadata, auto-reply approval, and class link are missing. |

## Next unblocked engineering batch

`PERF-20260709-001` is the next unblocked production-readiness engineering
batch: reduce BNA Operations startup fanout. It does not require external
account access, sends, payment, DNS, or credentials. The next session should
profile which startup calls are actually needed for the current dashboard,
defer non-current module loads, and preserve the existing live-smoke/profile
proof loop.

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260709-047 | Done | Raw/register/standing goal/memory note created. | Static file readback; ledger/changelog pending closeout commit. | None |
| REQ-20260709-048 | Done | Current baseline recorded above. | Baseline reconciled against launch catch-up register and active execution run. | None |
| REQ-20260709-049 | Done | First audit results table above. | PASS repo/security/privacy/BNA/OneTime public checks; expected blocked setup/WAPI checks recorded. | OneTime target guard needs clean-tree rerun after this commit. |
| REQ-20260709-050 | Already satisfied | `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md`; launch catch-up register. | Lead capture live-smoked in prior closeout. | Automated Zoom invite/payment/access/campaign remain blocked. |
| REQ-20260709-051 | Done | Known blockers table plus first audit results. | External blockers retained; performance blocker selected as next engineering batch. | None |
| REQ-20260709-052 | Pending | Next batch selected: `PERF-20260709-001`. | Pending implementation. | BNA Operations startup still has too many initial API calls. |
