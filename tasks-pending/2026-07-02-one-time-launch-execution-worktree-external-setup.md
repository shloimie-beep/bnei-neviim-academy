# One Time Launch Execution Worktree External Setup

Raw input: `RAW-20260702-003`
Workspace: `rabbi_sheller_provider`
Project: `one_time_mishnah_class`
Owner: Codex
Status: blocked after safe local/readback work

## Operator Decisions Preserved

- Run every safe runnable packet without asking again.
- Preserve and commit real launch/unblocker work where it can be staged without
  sweeping unrelated dirty work into the commit.
- Use `sdratler@gmail.com` for seed/test email and internal failure alerts
  after final live links exist.
- Use keyholder secrets only by alias/fingerprint/status.
- Send exactly one safe WhatsApp setup message only if Rabbi phone and a
  configured sending provider are available.
- Prepare exact GoDaddy instructions for `join.onetimeonetime.com`.
- Do not mutate apex/root `onetimeonetime.com`.
- Do not bulk-send a real campaign, run a live Stripe payment, cancel paid
  users, hard-delete data, expose secrets, add GHL/LeadConnector runtime, or
  export privacy-sensitive data.

## Requirements

### REQ-20260702-020 - Preflight And Source Coverage

Status: Done

Expected result: Source-of-truth files, active run state, setup checker, and
current launch packet are inspected before any edits or provider action.

Evidence:

- `npm run bna:run:status`
- `npm run bna:run:next`
- `npm run one-time:setup:check`
- `npm run pqc:all`

### REQ-20260702-021 - Worktree Reconciliation Without Destructive Cleanup

Status: Done

Expected result: Current dirty worktree is classified so real launch work can be
preserved and staged intentionally without `git add .`, reset, clean, or
discarding unrelated user/agent work.

Acceptance:

- Worktree report exists.
- Intended launch/protocol files are listed separately from unrelated dirty
  files.
- Any commit uses an explicit path list.

Evidence:

- `ops/worktree-reconciliation/2026-07-02-one-time-launch-execution/report.md`
- `ops/worktree-reconciliation/2026-07-02-one-time-launch-execution/changed-files.txt`

### REQ-20260702-022 - External Setup Readiness Rerun

Status: Blocked after safe check

Expected result: Re-run the no-secret setup checker and dependent guards. Apply
Railway/DB/deploy only if exact target values and confirmations are present.

Current result: `npm run one-time:setup:check` reports `0/8` external setup
areas ready and performs no external write.

Blocker owner: Shloimie/Railway/domain/provider owners

Next action: Provide/configure the exact missing setup labels and aliases listed
in the top visible operator tasks. Do not paste secret values.

### REQ-20260702-023 - GoDaddy Join Subdomain Instructions

Status: Done

Expected result: Create exact operator-facing DNS instructions for
`join.onetimeonetime.com` only, with apex/root explicitly out of scope.

Evidence:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-godaddy-join-subdomain-instructions.md`

### REQ-20260702-024 - Resend Seed/Test Readiness

Status: Blocked until final live link

Expected result: Keep Resend seed/test send path ready for
`sdratler@gmail.com`, but do not send until final live link exists and the seed
packet is ready.

Current durable sender: `info@onetimeonetime.com`.

### REQ-20260702-025 - WhatsApp Setup Message Readiness

Status: Blocked until provider details

Expected result: Prepare exactly one safe setup-message path for Rabbi, but send
nothing unless Rabbi phone number and configured Whapi/WAPI provider details are
available.

Evidence:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-rabbi-whatsapp-setup-message.md`
- No WhatsApp send performed.

### REQ-20260702-026 - Top Visible Operator Tasks

Status: Done

Expected result: Every remaining external blocker is converted into a concise
visible operator task with owner, priority, exact missing fields, forbidden
actions, and verification command after setup.

Evidence:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.json`

### REQ-20260702-027 - Commit Push PR Deploy Gate

Status: Blocked pending worktree reconciliation and external setup

Expected result: Commit/push scoped launch/unblocker work if it can be staged
safely. Deploy/live-smoke only when setup checker and target guards pass.

Blocker: Current worktree contains a large mixed dirty state with unrelated
modified and untracked files. Broad staging is unsafe. Deploy/live-smoke is
also blocked by `0/8` external setup readiness.

Next action: Stage only explicit launch execution paths if committing from this
dirty tree, or clear/commit the broader prior work in separate reviewed slices.

## Current External Setup Blockers

- Separate One Time Railway project/service/environment label.
- Separate One Time database URL/alias.
- `join.onetimeonetime.com` custom-domain attachment and DNS.
- Zoom session alias/details.
- Vimeo token alias plus Drive intake/drop alias.
- Rabbi Stripe sandbox alias and `$67/month` price/product ID or alias.
- Whapi/WAPI provider account, phone, token alias, instance ID, webhook status,
  and safe-test recipient.
- Final campaign copy, exact segment/list, suppression proof, final links, and
  seed proof.

## Terminal Rules

Do not mark launch ready until deploy/live smoke passes. Do not mark provider
setup done from generic approval language; require readiness/readback evidence
or a precise blocker.
