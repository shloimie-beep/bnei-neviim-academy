# Next Session

Continue `RAW-20260701-007` and `RAW-20260702-002` One Time separate-instance
launch funnel.

Current executable batch:

- `npm run bna:run:next` currently reports no unblocked executable batch.
  `REQ-20260701-701` is blocked for external apply/bootstrap details after
  safe no-write readiness. `REQ-20260701-703` and `REQ-20260701-704` are
  deployed to the existing BNA Railway app target and live-smoked on `/rabbi`,
  but still need the separate One Time `join.onetimeonetime.com` live smoke
  after the external Railway/custom-domain/DNS gates exist. `REQ-20260701-705`,
  `REQ-20260701-706`, `REQ-20260701-707`, and `REQ-20260701-709` are locally
  verified from the launch-unblocker packet but remain blocked on separate One
  Time Railway/database/domain deployment, final session/content details, or
  final campaign packet where applicable. `REQ-20260701-711` is locally done
  for the no-send Whapi/WAPI setup panel. `REQ-20260701-712` is locally done
  for Buffer/social draft-approval setup, with provider draft/schedule writes
  blocked. `REQ-20260701-715` is done as a read-only existing paying-users
  audit packet; actual migration remains blocked. `REQ-20260701-716` has
  existing-app deployment and general Operations task API smoke proof; a
  targeted live task-view sorting/visibility smoke remains needed before
  terminal `done`.

Start with:

1. Run `npm run bna:run:next`.
2. If it still reports no unblocked executable batch, clear one blocker below
   or wait for the exact external approval/input.
3. Keep join-domain live smoke under `REQ-20260701-717` until external routing
   exists.
4. Do not create separate One Time Railway resources, write provider variables,
   mutate DNS, send email/WhatsApp, run live Stripe, cancel paid users, or
   expose secrets without exact later approval.
5. Use
   `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`
   as the exact external setup checklist before asking for missing information.
6. Run `npm run one-time:setup:check` to produce the no-secret readiness
   summary before attempting provider-specific guards.

Open blockers/decisions:

- Top current operator task: `TASK-20260702-001` in
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.md`.
  Create or identify the separate One Time Railway project/service/environment,
  confirm it is separate from BNA production, and configure the One Time env
  labels without pasting secrets.
- `REQ-20260701-701`: need exact separate One Time Railway
  service/project/environment target, separate One Time database URL/alias, and
  approved One Time env values before provisioning apply/bootstrap.
- `REQ-20260701-702`: need exact separate One Time Railway
  target/custom-domain state or approval before join DNS/custom-domain work.
- `REQ-20260701-708`: need final Zoom/session details.
- `REQ-20260701-710`: need final campaign copy, exact segment/list,
  suppression proof, final links, seed proof, and explicit send command.
- `REQ-20260701-713`: need exact Vimeo access token alias/path and account
  decisions.
- `REQ-20260701-714`: need Rabbi Stripe test credential alias/path and
  product/price confirmation.
- `REQ-20260701-717`: deploy/live smoke is blocked until the separate One Time
  Railway service, separate database, and `join.onetimeonetime.com`
  custom-domain/DNS setup are ready.
- GoDaddy join-only DNS handoff:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-godaddy-join-subdomain-instructions.md`.
- Worktree reconciliation and deploy cleanup:
  `ops/worktree-reconciliation/2026-07-02-one-time-launch-execution/report.md`.
  Codex reconciled the dirty worktree, preserved local-only evidence, committed
  and pushed `codex/one-time-launch-cleanup-20260702-no-workflow`, opened PR
  #62, deployed the existing BNA Railway target, and live-smoked it. Future
  dirty-worktree deploy blockers should follow the same reconcile/preserve/
  commit-or-stash/deploy pattern without destructive reset/clean.
- Real Whapi/WAPI sending/reminders: need Rabbi/One Time provider account,
  phone number, token/instance/webhook details, and explicit safe-test/send
  approval. No real WhatsApp send is authorized in this run.
- Real Buffer draft/schedule/publish: need exact source material, channel,
  final copy, timing, rollback/no-post policy, and future approval phrase
  (`APPROVE_ONE_TIME_BUFFER_DRAFT` or `APPROVE_ONE_TIME_BUFFER_SCHEDULE`).
- Existing paying-user migration: need billing source-of-truth readback/export,
  exact payer classification, migration treatment rules, and explicit approval
  before any cancellation, refund, charge, subscription change, or access
  migration.

Operator setup checklist:

- Human-readable:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`.
- Machine-readable:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json`.

Post-setup deploy/live-smoke packet:

- `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`.
- Manifest:
  `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/manifest.json`.

No-secret readiness checker:

- Script: `scripts/check-onetime-external-setup-readiness.mjs`.
- Command: `npm run one-time:setup:check`.
- Latest report:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`.
