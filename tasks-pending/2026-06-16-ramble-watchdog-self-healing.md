# Ramble Watchdog / Self-Healing Operating System

Status: deployed and live-smoked; queue hygiene and automation decisions remain.

Source prompt:

- `C:\Users\User\Downloads\2026-06-16-codex-ramble-watchdog-self-healing-operating-system.md`

Cycle ID:

- `2026-06-16-ramble-watchdog-self-healing-operating-system`

## Implemented And Deployed

- Added `ops/watchdog-rules.md` with source-of-truth, ramble intake, decision,
  pending blocker, done/proof, UI quality, integration/secret, child/student
  safety, external approval gate, and staged helper watchdog tool rules.
- Added `scripts/watchdog-audit.mjs` and package script
  `npm run watchdog:audit`.
- Extended `scripts/prompts-audit.mjs` so watchdog prompts map to the
  `WATCHDOG` workstream and prompt records include stable `prompt_id`,
  `source_type`, `summary`, `linked_goal_ids`, `linked_decision_ids`,
  `linked_pending_ids`, and `linked_proof_paths` aliases.
- Added `GOAL-009` to `ops/operating-goals.md` and
  `ops/operating-goals.json` for ramble watchdog / goal-led work until done.
- Added an Operations `Watchdog` module in `public/operations.html`, with
  Goals, Decisions, Pending, Codex Work, Proof Gaps, Blocked/Stale, prompt gap,
  UI issue, Done-with-proof, Thursday access, and report/proof panels.
- Added `watchdog` to Operations allowed-view defaults in both
  `public/operations.html` and `server.js`.
- Added a stable AGENTS rule to run `npm run watchdog:audit` after major
  ramble-derived closeouts or scattered status states.
- Deployed commit `3b34755` to Railway production deployment
  `fac52051-3b45-4f41-ab7e-22df8789f32d`.

## First Audit Output

- `npm run prompts:audit` scanned 216 sources and wrote:
  - `ops/prompt-intake-register.jsonl`
  - `ops/prompt-intake-summary.md`
  - `ops/system-audits/2026-06-16-prompt-intake-register.md`
  - `tasks-pending/2026-06-16-prompt-intake-register.md`
- `npm run watchdog:audit` wrote:
  - `ops/watchdog-audits/2026-06-16T15-26-watchdog-audit.md`

Current watchdog findings from that run:

- Severity: high.
- Goals reviewed: 9.
- Prompt sources reviewed: 216.
- Findings total: 7.
- Stale ledger records needing terminal closeout: 69 latest running/in-progress
  groups older than the configured threshold.
- Local-verified prompt groups needing deploy/live proof: 61.
- TASKS rows with weak proof/source wording remain as queue hygiene work.
- Thursday/account-owner blockers remain external/human-gated.
- Operations watchdog control center and helper architecture were found present.
- No source-of-truth secret-pattern findings were reported.

## Live Proof

- Railway doctor reached `SUCCESS` for deployment
  `fac52051-3b45-4f41-ab7e-22df8789f32d`.
- Standard live smokes passed:
  - `ops/live-smokes/2026-06-16T15-18-39-613Z-live-app-smoke.md`
  - `ops/live-smokes/2026-06-16T15-18-45-855Z-public-route-privacy-smoke.md`
  - `ops/live-smokes/2026-06-16T15-18-38-487Z-student-auth-policy-live-smoke.md`
  - `ops/live-smokes/2026-06-16T15-18-38-452Z-operator-setup-live-smoke.md`
  - `ops/live-smokes/2026-06-16T15-19-02-250Z-assistant-onboarding-intake-live-smoke.md`
  - `ops/live-smokes/2026-06-16T15-19-02-304Z-signup-credit-email-preview-live-smoke.md`
  - `ops/live-smokes/2026-06-16T15-19-02-327Z-ws11-parent-progress-live-smoke.md`
- Watchdog live browser smoke passed:
  `ops/live-smokes/2026-06-16T15-20-14-711Z-watchdog-live-smoke.md`.
- Direct authenticated live readback confirmed `allowedViews` includes
  `watchdog`, integration readiness still returns 15 cards, and no raw
  secret-like pattern matched the integration status response.

## Staged / Not Yet Automatic

- Watchdog helper tool names are staged in `ops/watchdog-rules.md`; they are
  not yet separate live helper actions beyond the existing scoped helper
  registry/planner/permission/audit/result-link foundation.
- The watchdog audit is manual (`npm run watchdog:audit`) until Shloimie decides
  whether to create an automatic Downloads/attachments monitor.
- The audit is read-only. It does not auto-close stale ledger records or mutate
  Operations tasks.

## Remaining Decisions / Blockers

- Decide whether watchdog audits stay manual or become automatic.
- Decide what safe auto-fixes the watchdog may perform without separate review.
- Decide when to promote staged watchdog helper tools into real helper actions.
- Complete Thursday access/account-owner decisions for Zoom, GoDaddy/DNS,
  Vimeo, Resend, Buffer, WAPI/WhatsApp, Stripe, and old One Time app
  preservation before any live external writes.
- Close stale ledger-only starts with terminal completed/blocked/superseded/
  failed records based on proof or blockers.

## Verification

Completed:

- `node --check scripts/watchdog-audit.mjs`
- `node --check scripts/prompts-audit.mjs`
- `node --check server.js`
- `node --check scripts/agent-fleet-supervisor.mjs`
- `node --check scripts/telegram-kimi-bridge.mjs`
- focused Operations contract tests (41/41)
- `npm run prompts:audit`
- `npm run watchdog:audit`
- `npm test` (654/654)
- `npm run secrets:audit`
- `npm run integrations:audit`

Blocked/not performed:

- Approved deploy, Railway doctor, and live Operations smoke if the local
  Watchdog UI is to be marked deployed/verified.
