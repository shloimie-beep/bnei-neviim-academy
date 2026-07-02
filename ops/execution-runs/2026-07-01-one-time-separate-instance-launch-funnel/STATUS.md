# Status

Current status: `in_progress`.

- `REQ-20260701-700`: done. Raw intake, decisions, register, active run, and
  Product Quality gate repair are complete.
- `REQ-20260701-701`: blocked after safe no-write readiness. The Railway target
  guard, provisioning check, database bootstrap check, package scripts, focused
  tests, readiness report, and secret split report are complete. Actual Railway
  project/service/database creation, variable writes, custom-domain attachment,
  deploy/promote, and real database bootstrap require exact external target and
  confirmation details.
- `REQ-20260701-703`: blocked only for separate One Time join-domain live
  verification. `join.onetimeonetime.com` host routing is wired for the One
  Time landing and member entry paths; `/one-time` remains fallback, `/rabbi`
  remains compatible, and BNA root remains separate. The current BNA Railway
  app target was deployed and live-smoked on 2026-07-02. Live
  `join.onetimeonetime.com` smoke remains deferred to `REQ-20260701-717` until
  the separate One Time Railway/custom-domain/DNS gates exist.
- `REQ-20260701-704`: blocked only for separate One Time join-domain live
  verification. The landing/signup page now matches the launch offer sections,
  required signup fields, UTM/campaign capture, and safety copy. Static local
  Playwright screenshots passed for desktop/tablet/mobile, and the current BNA
  live `/rabbi` One Time landing smoke passed. Live `join.onetimeonetime.com`
  smoke is still blocked by separate One Time Railway/custom-domain/DNS.
- `REQ-20260701-705`: blocked after local verification from `RAW-20260702-002`.
  No-card 30-day signup/trial/access preview, referral capture, and scoped
  first-party One Time contracts pass locally. Final launch status still needs
  the separate One Time Railway service/database and deployed/live smoke.
- `REQ-20260701-706`: blocked after local verification from `RAW-20260702-002`.
  Member/admin workspace, private-question/community, class/course/video,
  role/portal, and parent/student scope contracts pass locally. Final status
  still needs deployed/live proof and final live content/session details.
- `REQ-20260701-707`: blocked after local verification from `RAW-20260702-002`.
  Attendance v1 remains click-tracked, not manual. Local progress/media/class
  link smokes pass; deployed/live member class-link smoke is still required.
- `REQ-20260701-709`: blocked after local verification from `RAW-20260702-002`.
  Confirmation/reminder/campaign/outbox previews are draft-only/no-send with
  suppression and consent checks. Real seed/campaign send remains blocked until
  final live link, exact recipient segment/list, suppression proof, final copy,
  and an explicit campaign packet exist.
- `REQ-20260701-711`: done locally. Operations now has a One Time WhatsApp
  Setup panel for the existing Whapi/WAPI direction, with spoken `Wappy` mapped
  to Whapi/WAPI, setup/readiness actions, redacted credential fingerprints, and
  no-send guardrails. Real Whapi/WAPI sends/reminders remain blocked until
  provider account/number/token/instance/webhook details and explicit approval
  exist.
- `REQ-20260701-712`: done locally. Operations now shows a One Time Social
  Scheduler Setup panel for Buffer. Local first-party social drafts are allowed,
  but provider Buffer draft creation and schedule confirmation are server/UI
  blocked until a future approved social packet supplies exact source, channel,
  copy, timing, rollback/no-post policy, and approval phrase.
- `REQ-20260701-715`: done. The existing paying-users migration audit packet is
  prepared from aggregate/read-only evidence, includes required classification
  lanes and a no-send platform-update email draft, and keeps all billing,
  cancellation, refund, subscription, access-migration, and send actions
  blocked.
- `REQ-20260701-716`: partially live-verified after local verification.
  Operations task cards now sort newest active work first, push
  completed/superseded/history rows below active work, show
  workspace/project/owner signals, keep super-admin filters broad, and hide
  internal tech-only cards from project-scoped Rabbi provider views unless
  explicitly shared or provider-actionable. The current BNA Railway app target
  was deployed and general Operations task API smoke passed. A targeted live
  task-view sorting/visibility smoke remains needed before changing this item
  to terminal `done`.
- `npm run bna:run:next` now reports no unblocked executable batch. Remaining
  work is blocked by external setup/approval, dependent on those blockers, or
  reserved for deploy/live-smoke closeout.
- External/operator-gated requirements are recorded for join DNS/custom-domain,
  separate Railway/DB target details, Zoom details, campaign send, Vimeo token,
  and Stripe test/live decisions.

## RAW-20260702-003 Launch Execution Permission Update

- Shloimie authorized Codex to keep running every safe runnable packet without
  asking again, including no-secret setup/readback checks and deploy/live smoke
  when external setup is ready.
- No new external setup value was present in this session. Safe checks still
  report `0/8` external setup areas ready.
- Separate One Time Railway apply, separate database bootstrap,
  `join.onetimeonetime.com` deploy/live smoke, Resend seed send, Stripe sandbox
  smoke, and WhatsApp setup message remain blocked because required target
  labels/aliases/provider fields are missing.
- Exact top visible operator tasks were created at
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.md`.
  The first task is `TASK-20260702-001`: create or identify the separate One
  Time Railway target.
- GoDaddy join-only DNS instructions were created at
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-godaddy-join-subdomain-instructions.md`.
- Worktree reconciliation was recorded at
  `ops/worktree-reconciliation/2026-07-02-one-time-launch-execution/report.md`.
  Codex then reconciled the dirty worktree, preserved local-only evidence,
  committed/pushed the intentional cleanup branch, opened PR #62, deployed the
  existing BNA Railway target, and live-smoked it successfully.
