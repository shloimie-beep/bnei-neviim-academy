# BNA Tasks

Completed older entries that mention former GHL/legacy-CRM work are historical
changelog context only. They are superseded by the current no-GHL policy and do
not authorize active GHL runtime paths.

## Now

- [ ] `RAW-20260626-004` / `RAW-20260626-006` / `RAW-20260626-007` /
  `RAW-20260626-008` / `RAW-20260628-002` / `REQ-20260626-116` through
  `REQ-20260626-133` plus `REQ-20260628-134` through `REQ-20260628-140`:
  Transcript/Drive/class intake digest rebuild plus Issue #41 Drive addendum,
  approved #83 sync, and Drive-backed parser/backlog repair goal.
  Current status: #83 private Drive doc sync done; PR #45 and follow-up PR #46
  are merged and deployed to Railway `fd93be96-8bec-4c06-b42f-c53d177eab40`.
  Issue #41 status comment posted:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4825192594`.
  Live readback now returns all 29 digest cards with job #83's clean generated
  title, 10 explicit `Needs parse` jobs, normalized topic/status data, and no
  raw transcript text inside `digest_card` payloads. Fresh read-only backlog
  audit remains `PARTIAL` with 10 jobs needing parse/reparse review. The
  class-question dry-run now resolves the old human-match question blocker by
  routing unmatched/ambiguous question candidates as class questions for all
  active students: 917 future `bna_accountability_events` writes are planned if
  a separate production apply path is approved, including 912 class-question
  broadcast inserts, 5 matched student-question inserts, and 2 existing rows
  skipped. The PR #49 catch-up package now adds repo-safe no-write evidence:
  `BACKLOG-CATCHUP-CENSUS` covers all 29 digest recordings with 10 `Needs
  parse` jobs, 29 ready research/content cards, 13 question candidates, 34
  internal task/action candidates, and 0 score/progress row-level changes;
  `APPLY-LANE-DESIGN` documents the owner gate/snapshot/rollback/refusal
  controls while keeping production apply disabled. Shloimie then approved a
  private-source, no-write reparse/canonical-write dry-run for exactly jobs
  `21, 25, 26, 30, 31, 56, 57, 58, 59, 71`; the generated sanitized evidence
  inspected all 10 private transcript sources, found 261 student-name mentions,
  1,285 question candidates, 36 matched personal-question candidates, 1,249
  class-question broadcast candidates, 119 internal task candidates, 1
  score/progress row, and 55 concrete score/progress no-op reasons. No
  production apply command has been approved or implemented; the no-write owner decision
  packet is
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/STUDENT-QUESTION-SCORE-APPROVAL-PACKET.md`.
  Private reparse dry-run evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN.md`.
  Owner approval is still required for any production parser/question/task/
  score/progress write or other unsafe/raw/external path. Done:
  active execution run created, Drive-first raw storage and GitHub digest
  policy documented, repo-safe digest exporter added, default raw transcript
  export blocked, 29 body-free recording digests generated, and sanitized
  Drive/library evidence recorded. Issue #41 read-only proof confirmed the
  `01 Transcript Library` folder existed with jobs #65-#70 and without #83; Shloimie then
  approved the exact #83-only command, which created the private Drive doc and
  verified readback. Sanitized proof stores only hashed Drive pointers. The
  Operations Content card repair now locally audits all 29 digest recordings, attaches
  digest-card metadata to content jobs, shows clean generated titles, summary,
  main points, categories, parse/digest/routing/topic status, next action, and
  normalized multi-topic filters without raw transcript topic search.
  Verification passed: focused syntax checks, digest tests, two-week audit
  tests, content-card/topic-filter tests, digest privacy scan 0 findings,
  content-card topic audit, Drive sync dry-run/no-AI, approved #83
  sync/readback, read-only Drive listing, fresh read-only intake audit, deploy,
  Railway doctor, live app/content/taxonomy smokes, live content-card readback,
  class-question broadcast dry-run evidence, and active run validation.
  Remaining decision: `DEC-20260626-101` keeps raw
  transcript-body export, any further Drive writes beyond #83, production
  reparse/canonical writes, worker retry, paid retranscription, class backfill,
  broad Drive sync, and other production mutations blocked until Shloimie
  explicitly approves an exact next action. Register:
  `tasks-pending/2026-06-26-transcript-drive-digest-rebuild.md`.
- [x] `RAW-20260626-004` / `REQ-20260626-116` through
  `REQ-20260626-120`: Canonical Issue #24 owner follow-up for helper/task
  guardrails and required Agent Mode pilot reruns. Broad parallel Agent Mode
  audits are paused until `operations-super-admin`, `public-login-setup`, and
  `cross-role-wrong-permission` each have visible AGR or exact BLOCKED
  evidence. PR #38 merged to master
  `ad3b5c3160cbd344bab807768205a2d116314d93`; Railway deployment
  `07dd8ba5-293f-4380-a081-1102af1a8d9e` reached `SUCCESS`; `npm test`
  passed 1365/1365; action/security watchdogs and secrets audit passed.
  Expanded public-helper smoke passed 32/32 endpoint/probe refusals. Required
  pilot AGRs saved/read back: `AGR-a41cb14c36a6e714`
  (`operations-super-admin`), `AGR-2d5ccbd80a818f1c`
  (`public-login-setup`), and `AGR-5d6456b6c9516ab2`
  (`cross-role-wrong-permission`).
- [x] `RAW-20260626-003` / `REQ-20260626-109` through
  `REQ-20260626-115`: Agent Mode self-save/drop-off contract and public helper
  Tier-3 unsafe-action guardrails. PR #36 merged to master
  `469486b9928ceb16cbea97bd7b6815a15504a2a3`; Railway deployment
  `b7b1b5b6-ede8-42a9-9a3a-c1b22684cdee` reached `SUCCESS`; `npm test`
  passed 1363/1363; action/link/security watchdogs and secrets audit passed.
  Live smokes passed for app, Agent Mode Task/Decision drop-off, public helper
  unsafe-action refusal, and the exact `operations-super-admin` owner pilot.
  New owner pilot result: `AGR-3785159b6650d1fa`. Task `#1738` was neutralized
  as archived history with audit comment `#12439` and agent job `#346`
  completed.
- [x] `RAW-20260626-001`, `RAW-20260626-002` /
  `PARENT-20260626-001` / `REQ-20260626-001` through
  `REQ-20260626-008`: Agent Review drop-off,
  scoped context access, helper false-success repair, and hybrid Agent Mode
  prompt/drop-off on owner Tasks/Decisions. Run:
  `ops/execution-runs/2026-06-26-agent-review-dropoff-repair/` on branch
  `codex/agent-mode-task-decision-dropoff-20260626`. PR #32 and PR #33 merged;
  app-visible implementation deployed from master SHA
  `d072466511af64cf4f413be7c42f79c18a00848e` to Railway build
  `d734fc78-2c71-411b-80f4-61c88fe0ba55` and live smokes passed. Live Task/
  Decision proof: owner task `#1734` saved PASS result
  `AGR-e571d939e011d301`; Decision `#1735` saved BLOCKED result
  `AGR-19cfa47542407167` and linked repair task `#1736`. Issue #18 remains
  `NOT SAFE TO APPLY`; no class backfill was applied.
- [x] `RAW-20260625-024` / `PARENT-20260625-024` /
  `REQ-20260625-024` through `REQ-20260625-030`: GitHub issue #24 is
  live verified and terminal Done. Scope completed: secure owner-only Agent
  Review Hub, short-lived review sessions, full helper/link/action audit,
  mobile-copyable Agent Mode prompt pack and typed result drop-off, navigation
  IA duplicate cleanup, newest Drive recording read-only trace, and
  integration/deploy/live closeout. PRs #25-#30 merged; final app-visible
  deployed commit is `9b000c1baa7c12e0e5d8d585ee88b1ef55fc7942` on Railway deployment
  `24c1d191-3f50-4d0a-9da8-687ba2f1a434`; live Review Hub/helper/app/privacy/class-trace smokes
  passed. Live result proof: `AGR-96dfac2f8c31163c`. The newest recording
  trace remains `PARTIAL / content_job:83`, not fully processed. Issue #18
  remains `NOT SAFE TO APPLY`; no class backfill was applied. Final Issue #24 evidence: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24#issuecomment-4802269945.
- [x] `RAW-20260624-009` / `REQ-20260624-040` through
  `REQ-20260624-048`: GitHub issue #20 parent run is closed in
  `ops/execution-runs/2026-06-24-issue-20-parent-run/` on branch
  `codex/issue-20-parent-run-20260624`. Scope: visual-quality gate,
  persistent agent browser, bot/helper accuracy, durable result drop-off,
  background agent fleet execution, queue hygiene, owner walkthrough, and final
  integration/deploy/live closeout. PR #22 merged at
  `378cc562a7dd4ffc8f2cc81a7341502df42d0295`, Railway auto-deployed
  deployment `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa`, and live smokes passed.
  All requirements are terminal Done. No class backfill, production data
  mutation, send, charge, DNS, credential/account change, Drive write, Buffer
  publish, or public publishing was performed.
- [x] `RAW-20260624-008` / `REQ-20260624-028`: GitHub issue #18 read-only
  class intake reconciliation has local terminal evidence in
  `ops/execution-runs/2026-06-24-issue-18-class-intake-readonly/` on branch
  `codex/issue-18-class-intake-readonly-20260624`. Verdict:
  `NOT SAFE TO APPLY - reasons listed`; `safe_to_apply=false`, no approved
  candidate jobs, no row-level change plan, and expected row counts `{}`.
  Focused validation, run validation, source coverage, stale-evidence check,
  secret audit, privacy scans, and diff check passed. PR #21 is merged as
  read-only evidence; terminal evidence was posted to Issue #18 at comment
  `4792923047`. No class backfill apply or production write is approved.
- [x] `RAW-20260624-007` / `REQ-20260624-032` through
  `REQ-20260624-039`: Clean-slate acceptance, queue reconciliation, synthetic
  ramble proof, owner walkthrough, preservation manifest, and GitHub-visible
  handoff. Current status: release truth is consistent; PR #16 is merged,
  current Railway deployment `c0aafbc5-a6fa-42ca-828e-38ac8ee02cc7` runs
  deployed SHA `116fea3339a922b045857f7ece8cc9a64e7cda64`; live smokes passed;
  live task reconciler reports 0 active machine tasks; production census
  reports 19 Decisions, 48 blocked records from queue audit, and 308
  Done/Activity records; synthetic ramble acceptance passed without production
  queue pollution. PR #19 merged to master at
  `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772`; Railway auto-deployed the same
  SHA in deployment `f8362b06-06b5-41f2-b4eb-102f67a91b85`; post-merge doctor
  and live smokes passed. `REQ-20260624-028` moved into successor run
  `ops/execution-runs/2026-06-24-issue-18-class-intake-readonly/`; no class
  backfill apply is approved. Handoff:
  `ops/acceptance/2026-06-24-clean-slate/final-handoff.md`.
- [x] `RAW-20260624-005` / `REQ-20260624-019` through
  `REQ-20260624-031`: Final release integration, deployment,
  live verification, and guarded class recovery. Scope: verify the
  clean-slate control manifest and Prompt 02-08 lane handoffs, integrate all
  valid lane branches into the final release branch, reconcile PR #14, PR #15,
  and local Rabbi closeout history, run the full release gate, merge the final
  PR, deploy merged `master` to Railway, live-smoke the deployed SHA, and apply
  class backfill only if Prompt 04's exact safe recommendation and all recovery
  gates pass. Current status: PR #16 was merged to `master` at
  `c14507ab121daa221689ba285c203605bf2d64bf`; Railway auto-deployed that same
  SHA in deployment `e26fec62-1a08-43a8-abb9-1b030b0ea786`; Railway doctor and
  live smokes passed; Stripe/payment and Vimeo/shared-review readiness passed
  without charge, grant, upload, publication, send, DNS, credential, or
  external connector writes. Canonical records were pushed in checkpoint
  `d4253fd683e60e403f256cb2a2c30acf821f32e4`; safe merged lane worktrees and
  refs were pruned with the shared Vimeo checkout retained as a safety
  exception. Class backfill remains terminally blocked under current evidence
  because Prompt 04 reports `safe_to_apply=false`, zero approved candidate
  jobs, and no row-level write plan. Register:
  `tasks-pending/2026-06-24-final-release-integration-deploy-live-verify.md`.
- [x] Finish `RAW-20260624-003` / `TASK-20260624-001`: clean-slate control
  tower reconciliation for PR #14, PR #15, and the preserved local Rabbi
  closeout. Completed so far: repository/worktree census, preservation branch
  `codex/preserve-rabbi-closeout-20260624` at `487a660b`, clean integration
  branch `codex/clean-slate-integration-20260624`, PR #14 merge, PR #15 merge,
  preserved closeout merge, PR reconciliation evidence, canonical execution
  run, queue/Decision reconciliation, control/lane handoffs, pushed control
  branch commit `f34cdd05`, and draft control PR #16:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/16`.
  No deploy, production DB mutation, class backfill, Stripe/Vimeo write, real
  send, DNS change, or credential change is approved in this goal.
- [x] Finish `RAW-20260623-006`: Rabbi Scheller workspace parity, unified
  login, navigation, tenant isolation, and API-usage readiness on isolated
  branch `codex/rabbi-scheller-parity-20260624` in
  `C:\Users\User\Documents\Codex\2026-06-24\rabbi-scheller-parity`.
  Collision check completed against the dirty shared checkout and other active
  worktrees; local verification passed focused suite 74/74 plus provider API
  Usage, provider navigation, Operations navigation, and portal chooser browser
  smokes at 390x844, 768x1024, and 1440x900. Commit
  `8f8b0b458a95d146777808dbdf1f760618632615` was pushed to GitHub branch
  `codex/rabbi-scheller-parity-20260624` / draft PR #15, deployed to Railway
  production deployment `5e37d2a0-7e81-4339-a721-c4286e8ecaa8`, and
  live-smoked with standard app smoke
  `ops/live-smokes/2026-06-24T07-01-44-515Z-live-app-smoke.md` plus
  Rabbi workspace smoke
  `ops/live-smokes/2026-06-24T07-05-37-232Z-rabbi-scheller-workspace-live-smoke.md`.
- [x] Execute `RAW-20260623-001`: Universal Service Provider Studio goal-mode
  implementation in clean worktree
  `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio`.
  Register: `tasks-pending/2026-06-23-universal-service-provider-studio.md`.
  Active run: `ops/execution-runs/2026-06-23-service-provider-studio/`.
  Completed: raw/register, canonical audit, credential-free Studio
  implementation, clean integration from latest default, default-branch push,
  standard live smoke, read-only Studio live smoke, and final evidence closeout.
- [ ] Continue `RAW-20260621-001` / `REQ-20260619-301` in the active run
  `ops/execution-runs/2026-06-21-one-time-master-completion/`: Batch 0 is
  committed and PR #5 was advanced to `e1706a8e` through a workflow-safe
  fast-forward checkpoint. The next executable batch is protocol repair, then
  backlog reconciliation, production Task/Decision cleanup, roles/users, action
  coverage, UI correction, communications, product/portal/media/Zoom/community
  foundations, and final verification. External credential/account/DNS/legal/
  financial decisions block only their dependent requirements.
- [x] Superseded by `RAW-20260621-001`: `RAW-20260619-005` / `REQ-20260619-300` through `REQ-20260619-314` was the previous local-only One Time master recovery run. Its still-relevant requirements were migrated into `ops/execution-runs/2026-06-21-one-time-master-completion/`, where safe commit/push/deploy/live-smoke work is now authorized and true external blockers are isolated to their dependent requirements.
- [ ] Continue `RAW-20260619-002` / `REQ-20260619-203` after the local
  One Time Drive brief no-write batch. Completed locally: newest Drive brief
  discovery, deterministic One Time-only dry-run parse, Operations Preview
  Drive Brief action, Rabbi Owner/Shloimie Admin seed repair, secure
  Vimeo/Zoom/Resend docs, credential handoff, focused tests 49/49, and active
  run evidence updates. Next: broaden canonical Telegram/Drive/transcript/
  ramble ingestion hardening and add negative One Time scope/RBAC tests without
  production data mutation or deployment.
- [ ] Continue `RAW-20260619-001` / `REQ-20260618-112` Agent Control Center
  from branch `codex/agent-control-center-20260619`. Local backend/API/UI,
  prompt generation, seal validation, action-registry coverage, and focused
  contract tests are implemented. Next exact batch: run a safe local DB/API
  smoke for one demo task/run, add negative scoped-identity tests, browser-smoke
  `/operations?view=agents` and `/operations/agents/runs/:runKey`, then record
  manual Agent Mode smoke evidence. Do not deploy or mutate production data
  without explicit approval.
- [ ] Resume the active execution run at
  `ops/execution-runs/2026-06-18-bna-platform-completion/` after the
  Operations audit ZIP/output path is available. Current imported June 18 UI
  remediation areas are blocked on audit output, not complete.
- [ ] Execute `RAW-20260618-001`: mobile-first Operations, workspace
  isolation, public/PWA guardrails, scoped modules, helper, Hebrew, seed data,
  tests, deploy/live-smoke, and documentation through terminal requirement
  statuses. Register:
  `tasks-pending/2026-06-18-mobile-operations-workspace-audit.md`. First
  practical batch is public/PWA identity and public-nav guardrails:
  implementation is local-verified, not deployed/live-smoked, for `REQ-20260618-003` through
  `REQ-20260618-006` (`npm test` 747/747, in-app Browser guardrail smoke, true
  390px Playwright mobile smoke, and Railway doctor passed), but deploy/live
  smoke remains blocked until the mixed dirty worktree can be deployed through
  a scope-safe bundle or explicit deploy decision. Workspace model foundation
  is also local-verified, not deployed/live-smoked, for `REQ-20260618-007`: visible/server directory
  normalization uses `school`, `service_provider`, and `family` with
  `super_admin` as context. Workspace/student isolation guard tightening is
  local-verified, not deployed/live-smoked, for the first `REQ-20260618-008` server slice: accountability
  student filtering now asserts student access, bulk content generation asserts
  every selected job ID before generating, scoped 403 status codes are
  preserved, `node --check server.js` passed, focused workspace tests passed,
  and full `npm test` passed 748/748. Operations shell/design work is
  local-verified, not deployed/live-smoked, for the first `REQ-20260618-009`/`REQ-20260618-010` slice:
  the main shell now has a role-scoped horizontal module toolbar ordered
  Decisions, Tasks, Calendar, Students, Content, Community, Accounting,
  Automations, Users, Integrations; Operations cards use shared light
  parchment tokens; focused tests, full `npm test` 748/748, and local
  Playwright viewports 360/390/768/1440 passed with no body overflow. Data-safe
  production backfill/constraints, broader negative API/live smoke coverage,
  and deploy proof remain open. Task/intake/calendar simplification is also
  local-verified, not deployed/live-smoked, for the first `REQ-20260618-011`/`REQ-20260618-012`/
  `REQ-20260618-013` slice: visible task lanes now read Decisions, Tasks,
  Codex Queue, Blocked, Calendar, and Done / Activity; owner filters are
  people-focused; old Intake Review/Review Queue navigation routes into
  Decisions; Calendar is internal-first with no Google Sync prompts in the main
  calendar surface; focused tests passed 65/65, full `npm test` passed 748/748,
  and local Playwright smoke passed at 390/1440 with no body/document overflow.
  Community, Content/Research, and Live Classes module scoping is also
  local-verified, not deployed/live-smoked, for `REQ-20260618-014`/`REQ-20260618-015`/
  `REQ-20260618-016`: active workspace/project filters now drive the BNA and
  One Time community/content/live-class surfaces; BNA hides One Time-only
  content/class controls outside explicit global/provider context; focused and
  wider related suites passed, full `npm test` passed 752/752, and local
  Playwright module-scoping smoke passed at mobile/desktop viewports. Admin,
  Communications, Integrations, and Automations scoping is now local-verified, not deployed/live-smoked,
  for `REQ-20260618-017`: Operations passes selected workspace/project filters
  into people, contact communications, social/email/DNS drafts, automations,
  and integration-status calls; global Integration Readiness stays Platform
  only; focused and broader suites passed, full `npm test` passed 754/754, and
  local Playwright smoke passed under
  `ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/report.md`.
  Student detail, accountability, devices, assignments, and Goal Board identity
  hardening is local-verified, not deployed/live-smoked, for `REQ-20260618-018`: selected student detail
  views now send selected workspace/project plus selected student filters,
  server routes enforce requested project/student/device ownership, linked
  student IDs outrank name/Hebrew aliases, focused student/identity tests
  passed 26/26, broader related tests passed 77/77, full `npm test` passed
  759/759, and local Playwright smoke passed under
  `ops/playwright-smokes/2026-06-18-student-detail-scope-local/report.md`.
  Student/accountability Hebrew RTL work is local-verified, not deployed/live-smoked, for
  `REQ-20260618-019`: the student portal topbar, goal filters/statuses, device
  access state labels, daily weekday labels, questions, assignments, helper
  controls, and dates are language-driven in Hebrew mode; the strengthened
  Hebrew audit passed, focused portal/Hebrew tests passed 32/32, full
  `npm test` passed 759/759, and strict local Playwright smoke passed under
  `ops/playwright-smokes/2026-06-18-student-hebrew-rtl-local/report.md`.
  Scoped helper/action-audit work is local-verified, not deployed/live-smoked, for `REQ-20260618-020`:
  project-scoped helper permissions now reject workspace switching through
  helper arguments, helper audit/action-log paths were inspected, focused
  helper/assistant tests passed 32/32, action/route-security tests passed
  37/37, `npm run watchdog:actions` and `npm run watchdog:security` both
  passed, and full `npm test` passed 760/760. Remaining seed-data work,
  backend/live idempotency proof, live duplicate-data audit, data cleanup, and
  deploy/live proof remain open. Safe repeatable seed/test data is now
  dry-run local-verified, not deployed/live-smoked and not live-DB-applied, for `REQ-20260618-022`: `npm run seed:req022`
  generates TEST-prefixed seed and cleanup SQL covering school/provider/family
  workspaces, roles, student/Hebrew, assignments, tasks, decisions, calendar,
  content, community, automations, and helper action audit rows; seed dry-run,
  cleanup dry-run, focused tests, action/security watchdogs, and full
  `npm test` 764/764 passed. Real DB apply/readback/cleanup and deploy/live
  proof remain blocked pending an explicit safe target/release decision.
  Preserve the existing developer tester ticket-capture brief as active until
  it is completed or terminally blocked.
- [x] Process `RAW-20260617-017`: Menachem Mendel Dratler already existed as
  live student `#2800`, so Codex updated the linked student/person metadata
  instead of creating a duplicate. His personal student WhatsApp number ending
  `0425` is stored on the live person record, Ahuva's parent-portal contact
  phone/email were preserved, parent-child links/tags now mark him as
  Shloimie/Ahuva's son, and WhatsApp communication `#1637` was sent with his
  private student portal login link. The portal code/link is not recorded in
  tracked files.
- [x] Register and execute the Rabbi Scheller / OneTime Mishnayos goal-mode
  packet from `RAW-20260617-010`: the raw prompt was preserved, the ID
  collision with helper deep-link work was repaired, and the dated register is
  terminal at 21 Done, 8 Already satisfied, 2 Blocked, 1 Needs operator
  decision, 0 Pending. `/one-time` and `/one-time/mishnayos` now live-smoke as
  a focused Worldwide OneTime Mishnayos draft with one `Join the Shir` CTA,
  `$67 planned`, no old Academy & Hotline copy, no active charge/access/send
  path, and a temporary text-free hero fallback. The OneTime child-facing bot
  is disabled pending explicit approval. Meeting prep, asset audit, parent
  privacy audit, Telegram status audit, raw backlog audit, and approval-only
  email drafts are recorded. Proof:
  `tasks-pending/2026-06-17-rabbi-scheller-onetime-mishnayos-register.md`,
  `ops/live-smokes/2026-06-17T14-28-38-904Z-onetime-focused-landing-live-smoke.md`,
  `ops/live-smokes/2026-06-17T14-32-28-274Z-public-route-privacy-smoke.md`,
  and `ops/playwright-smokes/2026-06-17-onetime-focused-landing-local/report.md`.
  Post-closeout verification passed: focused tests 36/36, full `npm test`
  721/721, and action/security/link/general/UI/visual watchdogs all severity
  `ok`.
  Remaining blockers/decisions: approved OneTime/Rabbi hero media rights,
  actual OneTime parent enrollment/billing sync after payment/access data,
  final global public nav/provider CTA direction, Telegram bridge restart/safe
  smoke, $67 billing cadence/payment provider, Resend/domain, Vimeo/Zoom/
  GoDaddy account access, and meeting time AM/PM confirmation.
- [x] Install universal agentic goal memory and watchdog hardening from
  `RAW-20260617-005` / `GOAL-20260617-005`: raw-first intake now covers
  rambles, GPT/Codex output packets, helper messages, class recordings,
  communications, student observations, research, provider/contact/accounting
  notes, and workspace routing; parser lanes, goal candidates, action/route
  registries, helper intake tools, watchdog commands, GitHub quality gate, and
  repair-task hooks are installed. Verification/proof: focused hardening tests
  11/11, full `npm test` 713/713, `npm run watchdog:all`,
  `ops/goal-audits/2026-06-17-goal-memory-install-audit.md`,
  `ops/watchdog-audits/2026-06-17-watchdog-install-audit.md`,
  `ops/raw-intake-audits/2026-06-17-raw-intake-backfill-plan.md`, OpenAI/Kimi
  smoke `ops/openai-smokes/2026-06-17T12-00-36-308Z-openai-sidekick-smoke.md`,
  Railway deployment `a2a5bf56-4661-4063-8ead-e1c66010ac9e`, live app smoke
  `ops/live-smokes/2026-06-17T12-03-49-136Z-live-app-smoke.md`, public
  privacy smoke
  `ops/live-smokes/2026-06-17T12-04-00-461Z-public-route-privacy-smoke.md`,
  and Operations helper smoke
  `ops/live-smokes/2026-06-17T12-03-48-493Z-operations-helper-live-smoke.md`.
  Commit remains explicitly blocked because the worktree has pre-existing
  mixed-scope dirty changes.
- [x] Complete cycle `2026-06-16-one-time-integrations-access-agent-audit`:
  provider-scoped integration records/secret refs, Vimeo manual/API readiness,
  Thursday blocker cards, agent gap audit, full local verification, accumulated
  deploy, Railway doctor, live smokes, and direct authenticated live
  integrations status readback. Deployed Railway production
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667` from closeout commit `a2d29e6`
  after code stabilization commit `35e0571`. Handoffs:
  `tasks-pending/2026-06-16-provider-integrations-secret-storage.md`,
  `tasks-pending/2026-06-16-one-time-thursday-access-session.md`,
  `tasks-pending/2026-06-16-agent-work-gap-audit.md`. Audit:
  `ops/audits/2026-06-16-agent-work-gap-audit.md`.
- [ ] Thursday access session: repair/confirm Zoom Server-to-Server OAuth,
  GoDaddy/DNS access, Resend account/domain records, Vimeo account/API/upload
  readiness, Buffer channels/API key, WAPI/WhatsApp ownership, and Stripe
  payment/pricing ownership. Also preserve/audit the old One Time app before
  shutdown, redirects, or member-access changes. Checklist:
  `ops/thursday-access-checklist.md`. Do not perform live sends, uploads,
  posts, charges, DNS writes, or account grants without approval gates.
- [x] Reconcile formerly local-only workstreams into one release status:
  `UI-01`, `OPS-02`, `HELPER-03`, `INT-05`, `RABBI-04`, and `COMMUNITY-06`
  additive work now has an accumulated deploy/live-smoke proof path or an
  explicit remaining human/external blocker recorded, not vague done labels.
- [x] Build a canonical prompt intake scanner/register so Downloads files,
  Codex attachments, GPT-generated prompt zips, and ramble-router specs map to
  one visible status path instead of drifting across audits and handoffs.
  Added `npm run prompts:audit`, `ops/prompt-intake-register.jsonl`,
  `ops/prompt-intake-summary.md`,
  `ops/system-audits/2026-06-16-prompt-intake-register.md`, and
  `tasks-pending/2026-06-16-prompt-intake-register.md`. Stale ledger row
  cleanup remains a separate queue hygiene task. Diagnosis:
  `ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md`. Handoff:
  `tasks-pending/2026-06-16-prompt-ingestion-execution-audit.md`.
- [x] Install the final Ramble Protocol and Raw Input Queue before the large
  website correction ramble: added `bna_raw_intake` migration/storage plan,
  raw-first intake preservation, stable requirement/task/decision/question IDs,
  the dated requirement register, repo fallback docs, and Telegram raw-ID/count
  confirmations. Verification: `npm test` 660/660 and watchdog report
  `ops/watchdog-audits/2026-06-16T17-31-watchdog-audit.md` with 0 ramble
  protocol findings. Register:
  `tasks-pending/2026-06-16-website-ramble-correction-audit.md`.
- [x] Harden and deploy goal-mode ramble execution; proof
  `ops/live-smokes/2026-06-17T04-53-04-502Z-goal-mode-helper-live-smoke.md`:
  `AGENTS.md`, the ramble
  templates, parser metadata, Telegram bridge prompts, and watchdog checks now
  recognize `BNA_GOAL_MODE_EXECUTION_PACKET` / "set it as a goal" / "work the
  whole prompt until done" language. Production deployment
  `ff95e44f-f1f5-4eeb-a83d-fc8f9456674b` passed Railway doctor, live app
  smoke, public privacy smoke, student-auth/onboarding/signup smokes, and the
  targeted live goal-mode/helper smoke
  `ops/live-smokes/2026-06-17T04-53-04-502Z-goal-mode-helper-live-smoke.md`.
  The first targeted smoke found a duplicate parse-review queue idempotency bug;
  that was fixed before the final deployment. Parent child-login reset proof:
  `ops/playwright-smokes/2026-06-17-parent-login-and-child-login-live-latest/report.md`.
- [x] Complete `REQ-20260616-027` portal security audit; proof
  `ops/security-audits/2026-06-17-parent-student-provider-portal-security.md`:
  parent/student/provider/member public shells avoid known private snippets,
  protected portal APIs reject anonymous access, and portal API namespaces now
  emit no-store/noindex headers. Deployed Railway
  `142fde45-420c-4311-a35d-1d51338caaad`; expanded live privacy smoke passed
  at `ops/live-smokes/2026-06-17T05-10-00-447Z-public-route-privacy-smoke.md`.
- [x] Complete Operations Activity / Queue Health correction batch
  `REQ-20260616-009` through `REQ-20260616-016`: compact shared-shell task
  toolbar, mobile-safe filter/action controls, readable Activity lane, grouped
  Queue Health statuses, and explicit Activity detail/action cues. Deployed
  Railway `a46f54ea-8ec0-4573-b69a-aa3dc52ea108`; proof:
  `ops/live-smokes/2026-06-17T05-51-37-025Z-operations-activity-queue-health-live-smoke.md`
  and local screenshots/report under
  `ops/playwright-smokes/2026-06-17-operations-activity-queue-health-local/`.
- [x] Complete BNA Helper correction batch `REQ-20260616-017` through
  `REQ-20260616-019`: one responsive helper launcher path with no old floating
  bubble, dynamic person/workspace helper branding, and natural-language
  planning for Operations navigation, task edit, task completion, support
  tickets, decisions, pending, content, and calendar/schedule lanes. Deployed
  Railway `753667c9-2d24-492f-a27a-e9cb1a2a6c5f`; proof:
  `ops/live-smokes/2026-06-17T06-13-37-317Z-operations-helper-live-smoke.md`.
- [x] Complete workspace taxonomy/list/selector/role correction batch
  `REQ-20260616-005` through `REQ-20260616-008` plus `REQ-20260616-063`:
  backend and Operations workspace directory now use Super Admin, School,
  Service Provider, and Family; workspace options are deduped by key; the
  sidebar selector has explicit Workspace type and Specific workspace steps;
  role/scope labels are visible; stale Family/Home Accountability labels are
  absent from visible workspace UI/API output. Deployed Railway
  `d5ee8e25-d777-4f76-bc38-fcfee8db4874`; proof:
  `ops/live-smokes/2026-06-17T06-42-15-688Z-operations-workspace-taxonomy-live-smoke.md`
  and local Browser proof
  `ops/playwright-smokes/2026-06-17-operations-workspace-taxonomy-local/report.md`.
- [x] Complete public/portal navigation and positioning correction batch with proof:
  `REQ-20260616-020`, `REQ-20260616-021`, `REQ-20260616-025`,
  `REQ-20260616-026`, and `REQ-20260616-064`: public nav is grouped under
  `Explore` and `Portal Login`, portal login destinations are safe public
  entry points, portal pages have consistent topbar links, and homepage
  positioning now separates Schools / AI Microschool, Families / Parent App,
  and Service Provider Network with AI overhead/rabbi-pay messaging. Deployed
  Railway `f0bfc896-88ae-4752-b331-7a02c06566b3`; proof:
  `ops/live-smokes/2026-06-17T07-20-54-368Z-public-navigation-positioning-smoke.md`
  and local Browser proof
  `ops/playwright-smokes/2026-06-17-public-navigation-positioning-local/report.md`.
- [x] Complete Rabbi Scheller / OneTime landing correction batch with proof:
  `REQ-20260616-028` and `REQ-20260616-029` are done, and
  `REQ-20260616-030` is blocked only for live payment-link creation pending
  configured Stripe or Green Invoice credentials/links. `/rabbi` now hydrates
  to `OneTimeOneTime`, uses black/white/bright-yellow OneTime styling, remains
  noindex/preview-only, shows $67 and $149 tier cards, and keeps Stripe/Green
  Invoice checkout buttons disabled with explicit setup-blocked copy. Deployed
  Railway `9c24a5ba-320e-4e39-bc33-8228d51e72b4`; proof:
  `ops/live-smokes/2026-06-17T07-50-31-511Z-rabbi-onetime-landing-smoke.md`,
  local Browser proof
  `ops/playwright-smokes/2026-06-17-rabbi-onetime-landing-local/browser-smoke.json`,
  and live Browser proof
  `ops/playwright-smokes/2026-06-17-rabbi-onetime-landing-live/browser-smoke.json`.
  Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T07-56-watchdog-audit.md`.
- [x] Complete safe OpenAI keyholder setup with Kimi fallback
  `REQ-20260616-031`: OpenAI now loads from the outside-repo keyholder alias
  `openaiv2.txt` without copying the key into the repo, `.secrets`, Railway,
  logs, screenshots, or chat; diagnostics are redacted and report only
  metadata/fingerprints/request IDs; OpenAI primary smoke and Kimi
  fallback/temporary-primary smoke both pass. Deployed Railway
  `4381af8c-e48c-4d86-9997-1fe319a5acfa`; proof:
  `ops/qa-runs/2026-06-17T08-07-32-779Z-openai-diagnostics.md`,
  `ops/openai-smokes/2026-06-17T08-12-06-839Z-openai-sidekick-smoke.md`, and
  `ops/openai-smokes/2026-06-17T08-13-22-082Z-openai-sidekick-smoke.md`.
  Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T08-22-watchdog-audit.md`.
  Production/Railway OpenAI rotation remains approval-gated; keep current
  Kimi-primary mode until explicitly approved.
- [x] Complete Operations settings/dashboard/integrations/automations correction
  batch `REQ-20260616-032` through `REQ-20260616-042`: dashboard context is
  compact and deduped; Settings category pages use compact leaf tabs; Users &
  Roles, Learning Portal Access, API Limits, Billing & Payments, real
  Integrations, Resend, Buffer, Google Calendar/Classroom, and Automation
  Center now have separated, understandable, guarded settings surfaces.
  Deployed Railway production `5bd23d08-d44b-41ea-b8f1-5fca56edad80`; proof:
  local browser report
  `ops/playwright-smokes/2026-06-17-operations-settings-dashboard-local/report.md`,
  live targeted smoke
  `ops/live-smokes/2026-06-17T08-58-37-286Z-operations-settings-dashboard-live-smoke.md`,
  live app smoke
  `ops/live-smokes/2026-06-17T08-58-38-007Z-live-app-smoke.md`, and public
  privacy smoke
  `ops/live-smokes/2026-06-17T08-58-23-715Z-public-route-privacy-smoke.md`.
  Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T09-04-watchdog-audit.md`.
- [x] Complete provider classroom/community and Provider Index settings batch with proof:
  `REQ-20260616-043` through `REQ-20260616-046`: service-provider classroom
  setup can be drafted from natural language through shared actions, BNA
  Helper, Telegram routing, and the provider portal; Operations exposes
  mobile-safe classroom/community setup and Rabbi/One Time private-reply,
  moderation, and publish controls; Provider Index settings are organized as
  Public Provider Index, Provider Plans, Provider Entitlements, Provider
  Onboarding, and Commercial Models with `Free for now` visible. Deployed
  Railway production `b0fa9953-9529-45d8-a56d-c74d428154ff`; proof: local
  Browser report
  `ops/playwright-smokes/2026-06-17-provider-classroom-settings-local/report.md`,
  live targeted smoke
  `ops/live-smokes/2026-06-17T09-31-12-926Z-provider-classroom-settings-live-smoke.md`,
  live app smoke
  `ops/live-smokes/2026-06-17T09-31-13-642Z-live-app-smoke.md`, and public
  privacy smoke
  `ops/live-smokes/2026-06-17T09-31-23-384Z-public-route-privacy-smoke.md`.
  Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T09-37-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift
  while preserving older queue/proof hygiene findings.
- [x] Complete content/research scope batch with proof: `REQ-20260616-047`
  through `REQ-20260616-052`: content jobs and class sessions are explicitly
  project/workspace-scoped, Operations content loading uses the active
  workspace project filter, BNA admin prompt library shows 11 loaded prompt
  previews in readable cards, the Research tab is backed by scoped class
  sessions, student question shell/server views remain portal-safe, and the
  content sync audit records no-external-write boundaries. Deployed Railway
  production `b695d66b-da92-4d00-8a9b-e8a0035334d5`; proof: audit
  `ops/system-audits/2026-06-17-content-research-scope-audit.md`, local
  Browser report
  `ops/playwright-smokes/2026-06-17-content-research-scope-local/report.md`,
  live targeted smoke
  `ops/live-smokes/2026-06-17T10-08-41-217Z-content-research-scope-live-smoke.md`,
  live app smoke
  `ops/live-smokes/2026-06-17T10-08-41-988Z-live-app-smoke.md`, and public
  privacy smoke
  `ops/live-smokes/2026-06-17T10-08-54-466Z-public-route-privacy-smoke.md`.
  Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T10-16-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift
  while preserving older queue/proof hygiene findings.
- [x] Complete communications screening/imports batch with proof:
  `REQ-20260616-053` through `REQ-20260616-060`: Communications overview/cards
  are readable and now surface Top News, Screening Pipeline, and dry-run Contact
  Imports; manual and WAPI communications share first-party screening metadata;
  important inbound parent/accountability messages create local no-send
  attention artifacts; contact imports preview CSV/vCard/email exports with
  mapping/classification/dedupe and commit blocked; WAPI lane shows live-pull
  diagnostics and local Phonebook Workspace. Deployed Railway production
  `3991f132-9207-4386-a9fd-b6148db5944f`; proof: audit
  `ops/system-audits/2026-06-17-communications-screening-imports-audit.md`,
  local Browser report
  `ops/playwright-smokes/2026-06-17-communications-screening-local/report.md`,
  live targeted smoke
  `ops/live-smokes/2026-06-17T10-46-34-893Z-communications-screening-live-smoke.md`,
  live app smoke
  `ops/live-smokes/2026-06-17T10-45-20-615Z-live-app-smoke.md`, and public
  privacy smoke
  `ops/live-smokes/2026-06-17T10-46-28-607Z-public-route-privacy-smoke.md`.
  Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T10-55-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift
  while preserving older queue/proof hygiene findings.
  Full `npm test` passed 696/696. Superseded by the final register closeout
  below.
- [x] Complete final website correction register closeout with proof:
  `REQ-20260616-003`, `REQ-20260616-004`, `REQ-20260616-061`,
  `REQ-20260616-062`, and `REQ-20260616-065` through `REQ-20260616-069` are
  done. Uploaded/class recordings now share canonical raw-first intake with
  rambles; stale content job `27` was reprocessed into `RAW-20260617-004` /
  parse run `4`; provider public/index/join/portal/classroom/plans routes are
  connected; the final desktop/mobile display audit passed; internal
  calendar/classroom is the current source of truth while Google remains a
  guarded connector; provider API-key storage/rotation copy and helper controls
  are exposed; Helper can create/edit local automation and billing workflow
  metadata; and registers/ledger/changelog proof are updated. Final register status:
  69 Done, 1 Blocked (`REQ-20260616-030` live Rabbi payment-link creation),
  0 Pending. Deployed Railway production
  `b3b7e0f6-1f07-4ec1-8ff4-f65c701ff58d`; proof:
  `ops/system-audits/2026-06-17-final-register-surfaces-audit.md`,
  local Browser report
  `ops/playwright-smokes/2026-06-17-final-register-surfaces-local/report.md`,
  final live app smoke
  `ops/live-smokes/2026-06-17T11-22-42-701Z-live-app-smoke.md`,
  final public privacy smoke
  `ops/live-smokes/2026-06-17T11-23-39-214Z-public-route-privacy-smoke.md`,
  and final register-surface smoke
  `ops/live-smokes/2026-06-17T11-24-18-485Z-final-register-surfaces-live-smoke.md`.
  Full `npm test` passed 702/702. Final watchdog proof:
  `ops/watchdog-audits/2026-06-17T11-28-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift for
  this closeout while preserving older queue/proof hygiene findings.
- [ ] Deploy the One Time Email Contacts Operations section after choosing a
  clean deploy window: the live data import is complete and verified, but the
  new Rabbi workspace `Contacts > Email Contacts` UI is local-only because the
  worktree already contains unrelated edits. Handoff:
  `tasks-pending/2026-06-16-one-time-email-contacts-import.md`. Proof:
  `ops/imports/2026-06-16-one-time-email-contacts-import.md`.
- [x] Create durable operating-goals and UI closeout registers for the current
  broad closeout: `ops/operating-goals.md`,
  `ops/operating-goals.json`, `ops/thursday-access-checklist.md`, and
  `ops/ui-audits/2026-06-16-ui-closeout.md` with curated screenshots under
  `ops/ui-audits/2026-06-16/`.
- [x] Ship the ramble-watchdog/self-healing operating-system foundation:
  watchdog rules, `npm run watchdog:audit`, `GOAL-009`, prompt-register
  aliases, AGENTS rule, source-of-truth trail, and the Operations Watchdog
  module are deployed in Railway
  `fac52051-3b45-4f41-ab7e-22df8789f32d`. Current report:
  `ops/watchdog-audits/2026-06-16T15-26-watchdog-audit.md`. Live proof:
  `ops/live-smokes/2026-06-16T15-20-14-711Z-watchdog-live-smoke.md`.
  Handoff: `tasks-pending/2026-06-16-ramble-watchdog-self-healing.md`.
- [x] Close the remaining Watchdog audit hygiene findings from the older
  `ops/watchdog-audits/2026-06-16T15-26-watchdog-audit.md`: stale ledger
  starts, formerly local-only prompt groups, weak proof/source wording, generic
  external blocker rows, source-pointer gaps, and unmapped prompt sources are
  closed or reclassified. Proof:
  `ops/watchdog-audits/2026-06-17T13-26-watchdog-audit.md`;
  `ops/system-audits/2026-06-17-prompt-intake-register.md`.
- [x] Use `ops/prompt-intake-summary.md` to close stale ledger-only starts with
  terminal done/deployed-verified/blocked/superseded records and durable prompt
  mappings. Proof: `ops/prompt-intake-summary.md`;
  `ops/agent-task-ledger.jsonl`.
- [ ] Decide whether prompt intake/watchdog audits should remain explicit manual
  commands or become an automatic Downloads/attachments monitor. Source:
  `ops/watchdog-audits/2026-06-17T13-26-watchdog-audit.md`.
- [x] MASTER-07: Coordinate parallel ramble-router workstreams, proof folders,
  blockers, source-of-truth status, and final closeout. Proof:
  `ops/proofs/2026-06-16-ramble-router-parallel-closeout/MASTER-CLOSEOUT.md`.
- [x] COMMUNITY-06: Build first Mishnayos community/course/progress foundation
  with privacy-safe parent/student visibility, reusing the existing One Time
  Mishnah Class/WS11 foundation instead of creating a duplicate Mishnah silo.
- [x] COMMUNITY-06: Add or verify gamification event ledger, worksheet/question
  submission flow, shoutout/reference approval, course library/admin surfaces,
  and scoped parent progress reports.
  Proof: `tasks-pending/2026-06-16-community-06-mishnayos-community-gamification-parent-progress.md`.
- [x] COMMUNITY-06: Prove parent cannot see another student and student cannot
  update another student's work/progress; keep unapproved shoutouts/references
  hidden from parents. Proof: Railway deployment
  `7c8c7010-497c-41c7-a127-6370cca049eb`, WS11 parent-progress live smoke
  `ops/live-smokes/2026-06-16T11-00-29-396Z-ws11-parent-progress-live-smoke.md`,
  and public/privacy/student-auth smokes recorded in
  `tasks-pending/2026-06-15-gamification-community-parent-progress.md`.
- [x] COMMUNITY-06 additive local extension: added assigned course
  questions/responses, worksheet due-date support, Operations Community module,
  student portal answer flow, parent progress/activity/worksheet/question/
  shoutout aliases, privacy-focused contract tests, and screenshots under
  `screenshots/community-06/`. Handoff:
  `tasks-pending/2026-06-16-community-06-mishnayos-community-gamification-parent-progress.md`.
- [x] COMMUNITY-06 live rollout follow-up: the additive extension shipped in
  the accumulated Railway deployment
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; Railway doctor plus live
  public/privacy, student-auth, and WS11 parent-progress smokes passed.
- [x] INT-05 safe integrations closeout is deployed and verified:
  redacted readiness/status exists for keyholder/secrets, Google Drive,
  Telegram, Gmail reminders, Resend, Stripe, Green Invoice, Buffer, Zoom,
  Vimeo/video hosting, archived GHL Social, and external-action gates; unsafe
  scheduled live sends are disabled by default; Buffer/Resend/Stripe/Zoom/
  Vimeo/Google/GHL writes stay preview-first and approval-gated, including
  exact Resend send confirmation and integration namespace aliases. Local
  proof: focused integration/redaction tests 26/26, `npm test` 649/649,
  `npm run secrets:audit`, `npm run smoke:int05-integrations`, and screenshots
  `screenshots/int-05-integrations-desktop.png` /
  `screenshots/int-05-integrations-mobile.png` /
  `screenshots/int-05-action-gate-preview.png`. On 2026-06-16, the loose
  Stripe live secret from Downloads was imported into the local BNA keyholder as
  `stripe-secret-key.txt`, removed from Downloads, and verified by
  fingerprint-only diagnostics; it was not copied to `.secrets` or Railway.
  On 2026-06-16 the accumulated app bundle was deployed as Railway production
  deployment `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; Railway doctor, live app,
  public privacy, student-auth, operator setup, assistant onboarding, signup
  credit email preview, and WS11 parent-progress smokes passed. A direct
  authenticated live read of `/api/bna/integrations/status` returned 15
  readiness cards including WAPI/WhatsApp, GoDaddy/DNS, provider-owned
  integration records, and Vimeo/video hosting with no raw secret-pattern
  match. Provider credential/DNS/account-owner decisions remain Thursday/
  human-gated.
- [x] Complete UI-01 local public/Operations shell cleanup: reconciled the
  newer Operations source, standardized the public header/footer/hamburger
  across homepage/blog/FAQ/article/signup/audience pages, added `/school` and
  `/parents` while preserving `/service-providers`, compacted Operations
  status chips/helper entry, exposed Calendar in the platform workspace,
  removed the duplicate public helper launcher from Operations, saved
  screenshots under `screenshots/ui-01/`, and passed full local proof
  (`npm test` 646/646 plus browser/no-overflow smokes). Handoff:
  `tasks-pending/2026-06-16-ui-brand-operations-layout.md`.
- [ ] UI-01 additional visual proof follow-up: the accumulated bundle is
  deployed in Railway deployment `db7ea5aa-c4cd-49df-9b74-f233c3e53667` and
  Railway doctor, live app smoke, Operations login/session coverage, and public
  route privacy smoke passed. Run a narrow live mobile Operations/browser
  screenshot pass if UI-specific screenshot proof is needed.
- [x] Reconcile the full WS01-WS11 closeout prompt and implement
  parent-managed student username/password login: cycle
  `2026-06-16-full-ws-prompt-closeout-parent-student-login`, source prompt
  `C:\Users\User\Downloads\2026-06-16-full-ws-closeout-parent-student-login-codex-prompt.md`,
  authoritative attachment
  `C:\Users\User\.codex\attachments\a1e0641b-6e96-450e-b6ea-fb46b5ef62c1\pasted-text.txt`,
  and handoff
  `tasks-pending/2026-06-16-full-ws-closeout-parent-student-login.md`.
  Required local scope is student password-account/session/audit schema,
  parent reset UI/API, student username/password login plus access-code
  fallback, focused tests, screenshots/proof artifacts, and an evidence-based
  WS01-WS11 status matrix. Deployed to Railway production as
  `dfbc65fa-fec4-4633-b45f-93adce342cc4`; live app, public privacy, and
  student-auth smokes passed. External sends/publishes/billing/account grants
  stay blocked unless explicitly approved.
- [ ] Finish the Downloads prompt implementation audit: reconcile the active
  BNA/Rabbi/WS/Kimi Markdown prompt packet from Downloads against current repo
  state, patch remaining true gaps, and keep
  `ops/download-prompt-audit/2026-06-15-downloads-prompt-status.md` as the
  status map, with file coverage in
  `ops/download-prompt-audit/2026-06-16-downloads-file-coverage-index.md` and
  requirement evidence in
  `ops/download-prompt-audit/2026-06-16-requirement-evidence-ledger.md`.
  Shloimie's actual WS01-WS11 attachment map is now recorded at
  `ops/download-prompt-audit/2026-06-16-actual-ws-prompt-list-map.md`. WS01
  Operations UI/mobile/readability is locally patched and verified, and the
  2026-06-16 resumed pass patched a public website/signup/provider BNA Helper
  consistency gap. The accumulated app bundle was deployed to Railway on
  2026-06-16 as deployment `81912f69-e43f-4131-96f1-a6b26bb95166`, with full
  local tests 617/617 and production Railway/app/privacy/auth/onboarding/
  signup/AI/email-dry-run smokes passing. A follow-up WS11 migration/readback
  fix and targeted Operator Setup live smoke were deployed/verified in Railway
  deployment `7c8c7010-497c-41c7-a127-6370cca049eb`. Remaining closeouts are
  now the narrower items that require local `DATABASE_URL`, credentials/DNS/
  account access, queue cleanup decisions, or human launch/legal/billing/
  product decisions. Blocked/pending source:
  `ops/download-prompt-audit/2026-06-15-downloads-prompt-status.md`.
- [ ] Complete HELPER-03 scoped BNA Helper: consolidate to one Operations helper
  entry point, add the newer server-side helper context/message/confirm/run API
  contract on top of the existing helper tool registry, harden role/workspace
  permission checks, redacted audit, confirmation gates, integration readiness,
  result links, focused tests, and desktop/mobile browser proof. Handoff:
  `tasks-pending/2026-06-16-helper-03-scoped-bna-helper.md`. External sends,
  publishes, billing/account grants, Google writes, Zoom/Vimeo writes, and
  member publishing remain approval-gated. The local implementation and proof
  pass are complete as of 2026-06-16 with helper screenshots in
  `ops/proofs/helper-03-2026-06-16/`; the remaining closeout is a safe
  deploy/live-reconcile window to verify any live duplicate-helper mismatch
  against the current production UI before marking the work done.
- [x] Implement WS11 gamification, Mishnah community course library, student
  participation, approved shoutouts, and parent progress locally: added
  additive schema/bootstrap, backend helpers, admin/student/parent APIs,
  student portal community rendering, Operations student controls, and focused
  privacy/model tests. Verification passed syntax checks, focused WS11 tests
  12/12, full `npm test` 611/611, and diff hygiene. Handoff:
  `tasks-pending/2026-06-15-gamification-community-parent-progress.md`.
- [x] Complete WS11-specific live privacy/readback closeout: fixed the startup
  migration gap so `createWs11CommunityGamificationSQL` runs before
  `ensureWs11CommunityFoundation`, deployed Railway production
  `7c8c7010-497c-41c7-a127-6370cca049eb`, read back live WS11 tables and seed
  rows, and verified parent WS11 progress hides temporary unapproved
  gamification, shoutout, worksheet draft, and parent-report rows. Report:
  `ops/live-smokes/2026-06-16T11-00-29-396Z-ws11-parent-progress-live-smoke.md`.
- [x] Complete secure Operator Setup live smoke: local implementation is
  complete for Super Admin-only short-lived laptop bootstrap packages,
  one-time encrypted secret exports, secure-download storage, stronger
  Operations headers/cookies/session IDs, and login rate limiting. Verified on
  Railway deployment `7c8c7010-497c-41c7-a127-6370cca049eb` with an
  authenticated Super Admin live smoke that created a safe no-secret package,
  downloaded it once, verified sensitive env values were blank, and confirmed a
  second redemption returned 404. Report:
  `ops/live-smokes/2026-06-16T11-00-45-574Z-operator-setup-live-smoke.md`.
  Handoff:
  `tasks-pending/2026-06-15-secure-operator-bootstrap.md`.
- [x] Deploy local Classroom-first Operations flow and Buffer draft-only social
  guardrail: Operations now presents BNA Classroom with Stream, Classwork,
  People, Calendar, and Review lanes without requiring Google Classroom/OAuth;
  Rabbi Elie Scheller / One Time has a local classroom/content handoff panel for
  sessions, materials, source sheets, worksheets, recordings, questions, and
  review-gated outputs; approved social outputs create Buffer drafts only and
  record draft metadata/publish-block policy. Email remains manual/current path;
  Resend/mass campaigns are non-blocking/out of scope. Verification passed:
  focused classroom/social tests, full `npm test` 578/578, Railway deployment
  `1fefad7b-38a2-463f-86bd-ec43df529f2b` SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T14-50-29-888Z-live-app-smoke.md`, and targeted
  live classroom smoke
  `ops/playwright-smokes/2026-06-15-local-classroom-buffer-draft-live/report.md`.
- [x] Implement WS06 safe Buffer/Resend communications integrations locally:
  added env/keyholder/.secrets secret loading, Buffer readiness/channels,
  local social drafts, explicit Buffer schedule preview/confirm, Resend
  readiness/domains/verify, local email drafts, verified-domain/fallback-gated
  send, first-party DNS setup tasks, Operations Communications integration UI,
  Telegram `/accounts` readiness, and draft-only Buffer script behavior.
  Verification passed: syntax checks, focused communications tests, and full
  `npm test` 578/578. Handoff:
  `tasks-pending/2026-06-15-buffer-resend-communications.md`.
- [ ] Activate WS06 live communications integrations only after server-side
  credentials and DNS are complete: install Buffer/Resend keys through the BNA
  keyholder/Railway env path, confirm Buffer organization/channel IDs, copy the
  complete Resend DNS records from the Resend dashboard, deploy, run Railway
  doctor, and run live Buffer/Resend readiness smokes. Do not use truncated
  screenshot DNS values. Blocked pending external credentials/DNS; handoff:
  `tasks-pending/2026-06-15-buffer-resend-communications.md`.
- [x] Reconcile WS10 One Time product/payment decision state: created the
  canonical decision handoff at
  `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`, captured
  the current preview/gated checkout reality, preserved US Stripe and Israeli
  GreenInvoice directions, separated app ownership from business/bank/payment
  account ownership, and kept live checkout, legal/accounting, email, access,
  and landing-page decisions blocked until owner approval.
- [ ] Resolve One Time launch decisions before any live checkout or public
  launch: approve pricing/currencies, provider of record, business/bank/payment
  account owner, software/revenue terms, parent/student/member login model,
  materials/access rules, Rabbi email/Resend sender, and final website assets.
  Handoff:
  `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`.
- [x] Build One Time Classroom, calendar, moderated Rabbi threads, approved
  participation leaderboard, and source-grounded Mishnah bot: first target is
  Rabbi Elie / One Time, using reusable BNA classroom foundations. Scope covers
  six-Sedarim curriculum organization, natural-language video assignment
  scheduling through BNA's internal calendar, class/video threads with AI
  moderation before visibility, parent/admin safety readback, member-facing
  classroom readback, and source-only bot behavior. Handoff:
  `tasks-pending/2026-06-15-one-time-classroom-calendar-community-bot.md`.
  Verification passed: `node --check server.js`, Operations/member/classroom/
  parent inline script parse, focused classroom/member-library/assignment/
  community/assistant/parent tests 55/55, full `npm test` 605/605, local
  in-app Browser smokes for `/one-time-classroom`, `/member-library`,
  Operations One Time Classroom console, and parent assistant safety/WS11 hooks,
  Railway deployment `5650e674-7717-4a10-b306-f64eb4a72698` SUCCESS, Railway
  doctor, live app smoke
  `ops/live-smokes/2026-06-15T15-07-00-013Z-live-app-smoke.md`, focused live
  classroom/member/admin preview/member-access rollback smoke, and public
  privacy smoke
  `ops/live-smokes/2026-06-15T15-07-51-743Z-public-route-privacy-smoke.md`.
- [x] Deploy public helper bot, service-provider ecosystem section,
  self-governance knowledge, and SODAS parenting flow: refactored the public
  helper widget into deterministic parent/student/provider/BNA/self-governance
  and SODAS paths, added delayed non-corny nudges with 24-hour localStorage
  suppression, added a reusable public helper knowledge module, and added the
  "A Learning Ecosystem, Not Just a Morning Program" homepage section with
  parent/provider/helper CTAs and English/Hebrew copy. Verification passed:
  `node --check public/js/bna-bot-widget.js`,
  `node --check public/js/bna-helper-knowledge.js`, focused helper/assistant
  tests 16/16, full `npm test` 529/529, `npm run screenshot`, local Browser
  desktop/mobile/Hebrew smoke, Railway deployment
  `a96f5825-43eb-4027-8bf9-070029af75af` SUCCESS, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T12-28-14-117Z-live-app-smoke.md`, and live
  Browser desktop plus Hebrew mobile helper smoke on
  `https://bneineviimacademy.org`.
- [x] Deploy curated helper knowledge into the hosted public assistant context:
  the backend now reads the same `public/js/bna-helper-knowledge.js` module in
  a sandbox, injects sanitized signup/BNA/provider/self-governance/student/SODAS
  context into `buildPublicAssistantKnowledgeBase`, and keeps the source
  boundary explicit that this is curated public helper context, not transcript
  RAG. Verification passed: `node --check server.js`, focused
  helper/assistant tests 17/17, full `npm test` 530/530, Railway deployment
  `a7f78fc9-e0f6-401f-9ee3-289a45ccab2e` SUCCESS, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T12-39-02-000Z-live-app-smoke.md`, and targeted
  public assistant smoke
  `ops/live-smokes/2026-06-15T12-39-23-967Z-public-helper-knowledge-live-smoke.md`.
- [x] Deploy file-backed public helper retrieval: added
  `src/lib/bna/public-helper-retrieval.js` and wired it into
  `buildPublicAssistantKnowledgeBase` so hosted public assistant answers now
  retrieve bounded, query-scored snippets from `public/js/bna-content.js`,
  brand-kit files, safe-status transcript markdown, curated helper paths, and
  existing approved/published DB content outputs. The source boundary remains
  explicit: this is bounded retrieval, not exhaustive transcript training.
  Verification passed: `node --check server.js`,
  `node --check src/lib/bna/public-helper-retrieval.js`, focused
  retrieval/helper/assistant tests 21/21, full `npm test` 534/534, Railway
  deployment `08a1bef5-b9b7-41fc-ac4f-574a73a16731` SUCCESS, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T12-48-55-011Z-live-app-smoke.md`, and targeted
  live public assistant retrieval smoke
  `ops/live-smokes/2026-06-15T12-50-35-267Z-public-helper-retrieval-live-smoke.md`.
- [ ] Optional future helper retrieval upgrade: add vector indexing, admin
  source curation controls, or richer retrieval diagnostics if the bounded
  file/DB retriever is not enough after real visitor use. Do not describe the
  helper as trained on the entire transcript library; safe transcript snippets
  are query-scored and capped. Source:
  `tasks-pending/2026-06-15-universal-assistant-mvp.md`.
- [x] Deploy assistant onboarding intake capture: added durable
  `bna_assistant_onboarding_intakes` drafts for explicit parent, student, and
  service-provider onboarding capture language, with role-scoped field
  extraction, open review questions, `no_send:true`, and no durable profile,
  child-visible, provider-public, external connector, or send action. The
  assistant now routes explicit role intake capture before anonymous public
  lead reminders. Added `scripts/smoke-assistant-onboarding-intake-live.mjs`
  and `npm run app:smoke:onboarding-intake`; final verification passed focused
  assistant/workspace/portal tests 53/53, full `npm test` 523/523, Railway
  deployment `39012fde-d811-4c8d-853f-8b52da7eb2b8`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T11-50-12-417Z-live-app-smoke.md`, and targeted
  live onboarding smoke
  `ops/live-smokes/2026-06-15T11-50-42-993Z-assistant-onboarding-intake-live-smoke.md`.
- [x] Correct Ahuva Dratler parent portal email to
  `ahuvadratler@gmail.com`, fix the parent-access target, and resend the
  parent portal login/onboarding email: Ahuva Dratler is Menachem Mendel
  Dratler's mother and parent portal contact. Menachem student #2800 plus
  signups #8 and #12 use the corrected Ahuva email where applicable. Ahuva was
  cleared from Esti Dratler external-accountability student #53986
  parent-login fields. Internal audit notes #1219 and #1222 document the
  correction. Final fresh parent portal email sent successfully with no
  WhatsApp send; live communication readback confirmed outbound email #1223
  linked to Menachem student #2800, expiring 2026-06-15T06:45:14+03:00.
- [x] Deploy public homepage Torah progress privacy hotfix: replaced named
  public Torah trip fallback cards with aggregate class progress, anonymous
  range, and trip-status cards; changed `/api/torah-learning/public-summary`
  to return aggregate `metrics` plus `students: []`; added
  `tests/public-homepage-privacy.test.js`; updated live app smoke to enforce
  the aggregate-only public contract. Verification passed: homepage inline JS
  parse, focused privacy/Torah tests 25/25, full `npm test` 435/435, Railway
  deployment `0562f80d-b24d-463b-bef4-7f027fdad077`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T05-46-52-317Z-live-app-smoke.md`, and focused
  live privacy readback
  `ops/live-smokes/2026-06-15T05-47-38-650Z-public-homepage-privacy-live-smoke.md`.
- [x] Add repeatable Phase 1 unauthenticated route privacy smoke: added
  `scripts/smoke-public-route-privacy.mjs`,
  `npm run app:smoke:public-privacy`, and
  `tests/public-route-privacy-contract.test.js` to cover the brief's public,
  parent, student, signup, provider, Operations, and parent/student portal API
  route list. Live smoke passed with anonymous shells for public routes,
  `/operations` redirecting to Operations login, `/api/parent-portal` returning
  401, `/api/parent-portal/session` returning 400 without a token, and
  `/api/student-portal` returning 401. Verification passed:
  `node --check scripts/smoke-public-route-privacy.mjs`, focused tests 50/50,
  full `npm test` 439/439, and
  `ops/live-smokes/2026-06-15T05-55-49-944Z-public-route-privacy-smoke.md`.
  No deployment was required because this was test/smoke tooling and live audit
  evidence only.
- [x] Add External Access persistence workflow readiness packet: documented the
  approval-gated Admin Users / External Access create-edit target at
  `ops/access/external-access-persistence-workflow.md`, added
  `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` to the owner approval pack,
  and covered the current read-only/no-write runtime guard in
  `tests/external-access-persistence-workflow.test.js`. Verification passed:
  focused external-access/owner-pack tests 5/5 and full `npm test` 455/455.
  No deployment was required because this was docs/test coverage only.
- [x] Deploy External Access create/edit dry-run preview: added a platform-admin
  `POST /api/bna/admin/external-access` preview endpoint and Operations Admin >
  Users readback form for external Operations access planning. The endpoint is
  no-write in production: `dry_run:true` returns person/workspace/access-link
  preview details and required readback, while `dry_run:false` is rejected until
  the explicit workflow approval phrase is approved. Verification passed:
  `node --check server.js`, focused external-access/Admin Users tests 44/44,
  full `npm test` 534/534, Railway deployment
  `937f5cf9-d824-43ed-93c1-fd532e94864f` SUCCESS, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T13-02-14-730Z-live-app-smoke.md`, and targeted
  live endpoint smoke
  `ops/live-smokes/2026-06-15T13-03-12-297Z-external-access-preview-live-smoke.md`.
- [x] Deploy read-only owner approval gateboard: added Operations Settings >
  Advanced > Approval Gates as the single readback surface for remaining
  Google, One Time publishing, billing/refund, Buffer/social, Rabbi live app,
  External Access, and Google public OAuth approval phrases and required
  fields. The gateboard copies phrases only and performs no approval, send,
  publish, bill, access grant, connector call, or external write. Verification
  passed: focused Operations/matrix/owner-pack tests 15/15, full `npm test`
  536/536, Railway deployment `6ff9c6f2-4a5c-4cfb-aecd-13d6fa88ecb2`
  SUCCESS, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T13-11-58-594Z-live-app-smoke.md`, targeted
  authenticated gateboard readback, and browser unauthenticated redirect smoke
  `ops/live-smokes/2026-06-15T13-14-03-396Z-owner-approval-gateboard-live-smoke.md`.
- [x] Deploy private One Time question digest preview: extended
  `GET /api/bna/one-time/question-moderation` with a read-only
  `digest_preview` payload and added Operations Content > One Time Library
  `Private Question Digest Preview` for Rabbi-facing review sections, duplicate
  grouping candidates, next steps, and guardrails. The digest omits submitter
  identities and performs no forum post, member-visible answer, notification,
  connector call, or external write. Verification passed: focused One Time
  moderation/forum/action tests 42/42, full `npm test` 536/536, Railway
  deployment `b43bdbf2-1526-4cab-86e8-a527f6e76b42` SUCCESS, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T13-21-40-918Z-live-app-smoke.md`, and targeted
  live digest readback
  `ops/live-smokes/2026-06-15T13-22-30-000Z-one-time-question-digest-live-smoke.md`.
- [x] Deploy One Time question public/member approval gate: added
  `APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE` to the owner approval pack and
  Operations Settings > Advanced > Approval Gates so the private digest cannot
  be confused with permission to publish a public/member answer, forum post,
  reward, leaderboard, student identity, or notification. Verification passed:
  focused gateboard/pack/matrix/One Time tests 22/22, full `npm test` 537/537,
  Railway deployment `020a76c5-7a86-4bf0-b6ea-719417bcc211` SUCCESS, Railway
  doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T13-30-27-504Z-live-app-smoke.md`, and targeted
  live gateboard/digest guardrail readback
  `ops/live-smokes/2026-06-15T13-31-15-000Z-one-time-question-public-surface-gate-live-smoke.md`.
- [x] Add Google public OAuth verification packet: documented Phase 2 Mode C
  at `ops/google-integrations/google-public-oauth-verification-packet.md`,
  anchored it to official Google OAuth/User Data Policy/demo-video sources,
  added `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET` to the owner pack,
  and covered it with `tests/google-public-oauth-verification-packet.test.js`.
  Verification passed: focused Google/owner-pack tests 6/6 and full
  `npm test` 459/459. No deployment was required because this was docs/test
  coverage only.
- [x] Deploy Google test-user OAuth scope guard: runtime defaults now use
  identity-only `GOOGLE_SCOPES`, bare OAuth start no longer implies configured
  broad scopes or Drive-pipeline setup, role defaults are identity-only,
  Classroom manage avoids roster/profile-email scopes by default, `.env.example`
  teaches per-smoke scope examples, and the OAuth callback redacts refresh
  tokens. Verification passed: focused Google OAuth/scope tests 18/18, full
  `npm test` 463/463, Railway deployment
  `8a02f9fb-6044-48ee-bfeb-747bfeecee2f`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T06-58-03-600Z-live-app-smoke.md`, and
  targeted live Google readiness readback with identity-only default/required
  scopes. Follow-up production config cleanup is also complete: Railway
  `GOOGLE_SCOPES` was narrowed to identity-only, deployment
  `16920b4a-751a-4ee3-8534-9193a2739a7c` reached SUCCESS, live smoke
  `ops/live-smokes/2026-06-15T07-09-09-425Z-live-app-smoke.md` passed, and
  targeted live readback now shows configured/default/required scopes all
  identity-only with zero configured-scope warnings.
- [x] Deploy Rabbi/One Time task manager internal dialogue board:
  `server.js` now normalizes One Time raw/bot task intake into clean
  `task_kind`, `display_title`, `why_exists`, `next_action`, raw/cleaned
  capture fields, bot-created labels, project-visible comments, activity
  history, and observable agent-job state. `public/operations.html` renders
  the One Time workspace as four columns only: Decisions, Pending/access,
  Tasks, and Done/history. Added
  `railway-migration-2026-06-15-rabbi-task-dialogue.sql` and
  `tests/rabbi-task-dialogue.test.js`. Verification passed: syntax checks,
  focused task/agent/Rabbi bundle 54/54, full `npm test` 455/455, Railway
  deployment `57d70c58-b659-4165-9da1-469137b2a568`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T06-40-02-550Z-live-app-smoke.md`, and focused
  live Rabbi dialogue API smoke
  `ops/live-smokes/2026-06-15T06-41-04-215Z-rabbi-task-dialogue-live-smoke.md`.
  Remaining external blockers are represented as Pending/access cards for
  Stripe/payment processor, Vimeo/posting rules, website/content assets,
  Zoom/manual links, and Resend/email settings.
- [ ] Continue the Rabbi Scheller / One Time white-label onboarding, Google,
  content, and CRM follow-up imported from the 2026-06-14 superprompt. Dirty
  worktree preservation is complete via
  `ops/worktree-snapshots/2026-06-14T18-50-41-pre-rabbi-whitelabel-onboarding.md`
  plus `.runtime/pre-rabbi-whitelabel-onboarding-20260614-185041.patch` and
  `.runtime/pre-rabbi-whitelabel-onboarding-status-20260614-185041.txt`.
  Route privacy re-audit is complete: public provider pages now clear stale
  student access codes, focused tests passed 36/36, full `npm test` passed
  357/357, Railway deployment `f2595077-6c36-4a04-a5b8-a69452d3dfa5` reached
  SUCCESS, and live provider/privacy smoke passed at
  `ops/playwright-smokes/2026-06-14-rabbi-whitelabel-provider-privacy-live/report.md`.
  Telegram note-to-CRM and WAPI manual correction apply UI are already
  deployed separately. Parent announcement draft persistence/readback, the
  task-title cleanup dry-run script, Rabbi Mishnayos parent/member onboarding
  lead capture, `retitle_task_naturally`, and the One Time video-library item
  helper are also complete. The One Time content library review surface is
  deployed and live-smoked. Operations > Integrations > Google is now the
  canonical deployed and live-smoked Google readiness module; Settings >
  Google Workspace remains a compatibility mirror. The surface includes a
  read-only Google Action Audit over Google, Drive, Calendar, Classroom, and
  Google Business Profile preview/execution action logs. The public helper
  mobile UX slice is also deployed and
  live-smoked: phone-width public pages now open the helper as a partial bottom
  sheet, keep the launcher reachable for minimize, and use concise 10-1
  program copy without the old follow-up nudge. The helper source-boundary
  guard is also deployed and live-smoked: public allergy/medical policy
  questions now return a verified-content boundary reply instead of allowing a
  generic policy hallucination, and hosted assistant prompts now carry explicit
  source-scope rules. The task/decision helper bundle
  (`add_decision_option`, `schedule_task_on_date`, and `move_task_workspace`)
  is deployed and live preview-smoked. Rabbi shiur/source-sheet helper actions
  are deployed and live preview-smoked. Referral/moderation helper actions are
  also deployed and live preview-smoked. The full WAPI phonebook conversation
  workspace is now deployed and live-smoked. The
  `show_contact_communication_history` helper action is also deployed and
  live-smoked as a dry-run/read-only local history preview for helper and
  Telegram requests; it reads `bna_contact_communications` only and performs no
  send, sync, tag update, broadcast, Google/Drive, Buffer/social, or external
  CRM write. Support ticket processed notifications are also deployed and
  live-smoked: resolving or closing a
  ticket now creates a local `bna_contact_communications` no-send draft plus
  an internal ticket comment, and the API returns `notification_draft`; no
  email, WhatsApp, SMS, Telegram, portal message, or external CRM write is
  sent automatically. Immediate next work is one approved One Time
  member-library publish/smoke or deeper media hosting after destination,
  visibility, hosted-media, smoke-item, and rollback approval, plus live
  Google/Drive adapters after OAuth/scope approval. Google live-adapter and One
  Time member-library publishing
  approval-readiness packets are also deployed and live-smoked in Operations,
  with exact confirmation phrases and no external writes. The One Time
  member-library publish-package preview is also deployed and live-smoked as a
  dry-run/no-write helper under the One Time Library. The Rabbi/One Time
  8-week launch-calendar preview action is also deployed and live-smoked as a
  dry-run/no-write helper under Google Calendar settings. The Google Classroom
  topic/material preview action and Google Business/Profile Place ID/location
  preview helpers are also deployed and live-smoked as dry-run/no-write
  helpers under Operations > Integrations > Google, with the old Settings >
  Google Workspace mirror kept for compatibility. The local read-only Rabbi/One
  Time task-flow audit script/report is also complete: `npm run task:rabbi-flow-audit`
  generated
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`
  after scanning 305 tasks and identifying 102 Rabbi/One Time related records.
  It performed no task patch, external write, send, publish, access grant, or
  workspace move; full `npm test` passed 392/392 and no deployment was needed.
  The private One Time question moderation queue is also deployed and
  live-smoked: question submissions now persist to
  `bna_one_time_question_reviews`, Operations Content > One Time Library shows
  a private read-only review queue, and
  `GET /api/bna/one-time/question-moderation` returns no-send/no-public-forum
  flags. No forum post, member-visible answer, send, Codex job, or external
  write is created automatically. Operations Settings > Automations now also
  has a deployed and live-smoked read-only Automation Library / Prompt Browser
  with 8 guarded workflow cards, prompt/policy readback, dry-run preview
  affordances, and disabled enable controls; it performs no external send,
  publish, billing/access change, Google write, Drive/video-host write, or
  external CRM write. The current dirty worktree is also classified into
  curated commit groups at
  `ops/worktree-snapshots/2026-06-15T03-38-00-goalmode-current-commit-groups.md`;
  nothing was staged or reverted by that safety pass. The exact Rabbi/One Time
  app access/backend audit at
  `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md` is now refreshed
  with live/Replit unknowns, login/role notes, credential source names only,
  BNA readiness surfaces, safe bootstrap/reset guidance, and no-write gates;
  focused audit-doc coverage passed 3/3 and no deployment was required. Phase
  11 now also has a local One Time forum/gamification moderation readiness plan
  at `ops/one-time-mishnah/forum-gamification-moderation-plan.md`, covering
  authenticated-only participation, AI moderation, temporary holds instead of
  auto-bans, quality rewards/badges, no public shame, no leaderboard without
  explicit approval, audit trail, and no-send/no-public-feed gates; focused
  coverage passed 4/4 and adjacent One Time workflow tests passed 42/42. Phase
  12 provider-login / Grabify bug audit is also current at
  `ops/provider-intake/provider-login-phase12-audit.md`: active provider login
  routes/session/setup/password flows, generic failed-login messaging, prior
  live provider-portal smoke, and the fresh live credential smoke checklist are
  documented; focused Phase 12 coverage passed 4/4 and adjacent provider tests
  passed 16/16 with no deployment required. Phase 14 Buffer/social scheduling
  now has a deployed and live-smoked preview-only typed action,
  `preview_social_schedule_package`, that plans channels, schedule slots,
  blockers, and the `APPROVE_BUFFER_SOCIAL_DRAFT` phrase for requests such as
  "Schedule this Facebook post" or "Make 3 posts from this video"; it performs
  no Buffer draft write, media upload, publish, send, local content write, or
  external write. Parent/accountability onboarding now also writes real
  first-party `accountability_interest` parent leads plus support ticket,
  lead-linked communication, and private in-app notification records, with a
  dry-run/no-write smoke path and no external send, child-visible goal, or
  external CRM write. The older provider onboarding/integrations foundation
  deployment gate is also closed on current production: sanitized public
  provider API/index, provider join, provider login/setup shell, and parent
  login smoke passed without live writes. The student-facing Hebrew/RTL audit
  is also complete and deployed: the student portal now uses localized labels
  for the answer prefix and Rabbi WhatsApp CTA, and the fixture-backed
  production Playwright audit passed with mobile/desktop Hebrew screenshots,
  RTL checks, no mojibake, no horizontal overflow, Hebrew source refs, and no
  private sentinel leakage. Operations Communications > Announcements now also
  has a deployed parent weekly update approval workspace with candidate
  loading, title/body/image/video URL readback, a no-write preview button, and
  typed `APPROVE_PARENT_ANNOUNCEMENT` local approval. Verified with full tests,
  Railway deployment `a298a146-8e34-408c-9a1f-f6e26e38dd0c`, live app smoke,
  and focused live Playwright smoke. Official weekly copy/media selection
  remains open until the operator chooses the parent-visible update. Weekly
  recipient preview is now also deployed: Operations Communications >
  Announcements has `Preview Recipients No-Send`, backed by
  `GET /api/bna/parent-announcements/recipients`, with current-parent counts,
  signup-only review candidates, second-parent/spouse policy candidates,
  missing-email and external-accountability exclusions, and no-send/no-write
  flags. Verified with full `npm test` 415/415, Railway deployment
  `f03ccc1f-a64d-43db-8907-70f6c62d46b7`, live app smoke
  `ops/live-smokes/2026-06-15T03-31-36-029Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/report.md`.
  Actual test-send/live-send remains disabled behind recipient policy, copy,
  media, rollback/no-send rules, and `APPROVE_PARENT_WEEKLY_UPDATE_SEND`.
  Workspace/role clarity also advanced: Admin > Roles now has a deployed
  read-only role/access policy matrix covering Super Admin, BNA School
  Admin/Rabbi, Parent primary contact, Second Parent/Spouse, Student, Service
  Provider/Rabbi Sheller, Community Member, and Codex/Agent lifecycle. It names
  approval gates without creating invitations, login tokens, resets, sends,
  access grants, billing changes, or connector writes. Verified with full
  `npm test` 416/416, Railway deployment
  `8098d014-5857-44b0-bffa-c94458917802`, live app smoke
  `ops/live-smokes/2026-06-15T03-41-18-298Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/report.md`.
  Parent/
  student onboarding/reset email work now has a deployed first slice too:
  Operations Students > Next Year Login exposes a rollout packet plus
  per-family `Preview Password Setup` and `Email Password Setup` buttons backed
  by `POST /api/bna/parent-access/password-reset`. Preview is no-write/no-send
  with `dry_run: true`; real email requires the single-family action and
  `SEND_PARENT_PASSWORD_SETUP`. Verified with full `npm test` 415/415, Railway
  deployment `990a677c-a6a5-4b2d-97d7-13f1cf83c862`, live app smoke
  `ops/live-smokes/2026-06-15T03-17-11-309Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/report.md`.
  Student assistant onboarding coaching is now deployed too: role-specific
  help/setup questions are answered in chat before generic ticket fallback,
  covering Today, goals, daily checkoff, questions, reflection, and messaging
  Rabbi/Shloimie with no support ticket, profile/goal write, send, or external
  connector write. Verified with full `npm test` 427/427, Railway deployment
  `6b77f88f-7508-43ac-b107-c713d29c34a3`, live app smoke
  `ops/live-smokes/2026-06-15T04-57-22-945Z-live-app-smoke.md`, and focused
  live fixture smoke
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-live/report.md`.
  Handoff:
  `tasks-pending/2026-06-14-rabbi-sheller-whitelabel-onboarding-google-content.md`.
- [x] Deploy and live-smoke parent/accountability onboarding lead capture.
  `POST /api/parent-accountability/onboarding` now creates or updates
  `bna_parent_leads` with `lead_type = 'accountability_interest'`, links the
  support ticket, communication note, and in-app notification to that lead, and
  exposes the category in Operations Contacts > Interested Parents. Verified
  with syntax checks, inline script parse, focused tests 22/22, full `npm test`
  414/414 before deploy, local no-write dry-run smoke
  `ops/local-smokes/2026-06-15-parent-accountability-onboarding-local.md`,
  Railway deployment `59ec51a1-56b2-4e0d-854a-ee3f8aab5558`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T01-38-34-614Z-live-app-smoke.md`, and focused
  live dry-run/parent/Operations smoke
  `ops/live-smokes/2026-06-15T01-39-30-000Z-parent-accountability-onboarding-live-smoke.md`.
  Guardrail: dry-run performs no DB write, and real submissions perform no
  email/WhatsApp/Telegram send, child-visible goal creation, or external CRM
  write.
- [x] Deploy and live-smoke canonical Operations > Integrations > Google module.
  Operations now exposes Integrations as a first-class workspace module and
  routes `Operations > Integrations > Google` to the Google readiness surface
  for Drive, Calendar, Classroom, Google Business Profile, approval packets,
  and the read-only Google Action Audit. Settings > Google Workspace remains a
  compatibility mirror. Verified with `node --check server.js`, Operations
  inline script parse, focused tests 46/46, full `npm test` 415/415, local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-integrations-module-local/report.md`,
  Railway deployment `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T01-59-10-544Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-integrations-module-live/report.md`.
  Guardrail: the page performs no Google API read/write, connector write,
  send, publish, access grant, or external CRM write.
- [x] Deploy and live-smoke the Phase 14 Buffer/social schedule preview helper.
  Added `preview_social_schedule_package` in the action registry and
  operations handler, Telegram routing for scheduling/Buffer/multi-post social
  requests, regenerated action-registry artifacts, and focused regression
  coverage. Verified with syntax checks, Operations inline script parse,
  focused action/Telegram tests 31/31, adjacent social/content/automation
  tests 53/53, full `npm test` 409/409, local action-runner smoke
  `ops/local-smokes/2026-06-15-social-schedule-preview-local.md`, Railway
  deployment `cc96c44c-303f-4dab-ada0-e6dd62738d3b`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T01-02-48-717Z-live-app-smoke.md`, and live API
  smoke
  `ops/live-smokes/2026-06-15T01-03-38-576Z-social-schedule-preview-live-smoke.md`.
  Guardrail: no Buffer draft write, media upload, publish, send, local content
  write, or external write is performed by the preview.
- [x] Document and verify the Phase 12 provider-login / Grabify bug current
  state. Added `ops/provider-intake/provider-login-phase12-audit.md` and
  `tests/provider-login-phase12-audit.test.js`. The audit confirms active
  provider login/setup/session/profile/service routes, scoped provider access,
  generic failed-login messages, no active Grabify reference in inspected
  provider login surfaces, and prior live provider portal smoke evidence. It
  keeps a fresh live credential smoke checklist for the next approved test
  provider or reported current failure. Verified with `node --check
  tests/provider-login-phase12-audit.test.js`, focused test 4/4, and adjacent
  provider-directory tests 16/16. No deployment was required because this is
  local documentation/test coverage only.
- [x] Document the One Time forum/gamification moderation readiness plan for
  Phase 11. Added
  `ops/one-time-mishnah/forum-gamification-moderation-plan.md` and
  `tests/one-time-forum-gamification-plan.test.js`. The plan requires
  authenticated participants, AI-first moderation, human review, temporary
  holds pending admin review instead of automatic bans, quality rewards/badges
  only after Rabbi/admin approval, no public shame, no leaderboard without
  explicit approval, moderation audit logging, no-send notification gates, and
  launch smokes before any member-visible surface. Verified with `node --check
  tests/one-time-forum-gamification-plan.test.js`, focused test 4/4, and
  adjacent One Time tests 42/42. No deployment was required because this is
  local documentation/test coverage only.
- [x] Refresh the exact Rabbi/One Time app access/backend audit requested by
  the source brief. Updated
  `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md` with repo/live
  URL status, login routes, roles, Shloimie access path, credential source
  names only, missing credentials, analytics/billing/Resend/media inventory,
  BNA reuse/separation/integration guidance, risks, and a safe bootstrap/reset
  plan. Added focused coverage in `tests/rabbi-scheller-audit-docs.test.js`.
  Verified with `node --check tests/rabbi-scheller-audit-docs.test.js` and
  `node --test tests/rabbi-scheller-audit-docs.test.js` 3/3. No deployment was
  required because this is local documentation/test coverage only.
- [x] Deploy and live-smoke the Operations Automation Library / Prompt
  Browser: Settings > Automations now lists service-provider onboarding,
  parent accountability lead follow-up, ticket processed acknowledgement,
  parent weekly update approval, One Time question review, One Time 8-week
  nurture, Google live-adapter gate, and Rabbi content review workflows with
  trigger, audience, channel, prompt/template, status, last/next evidence,
  linked records, dry-run preview buttons, and disabled approval-required
  enable controls. Verified with Operations inline script parse, focused
  adjacent tests 45/45, full `npm test` 396/396, local Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-automation-library-local/report.json`,
  Railway deployment `5d21c82c-d77e-4d5d-a8c2-c1b1129c17a8`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T23-58-42-116Z-live-app-smoke.md`, and live
  Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-automation-library-live/report.json`.
- [x] Deploy and live-smoke the private One Time question moderation queue:
  `submit_student_question_for_moderation` now creates a scoped
  `bna_one_time_question_reviews` row, `review_moderated_question` updates the
  private review row alongside the task/comment, and Operations Content > One
  Time Library renders `Private Question Moderation Queue` as a read-only,
  no-send/no-forum/no-member-visible surface. Verified with syntax checks,
  focused action/One Time tests 68/68, full `npm test` 393/393 before deploy,
  local API and Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-local/report.json`,
  Railway deployment `afff8d91-e0aa-426b-94f8-f128b8f57822`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T23-42-19-692Z-live-app-smoke.md`, live API smoke
  `ops/live-smokes/2026-06-14T23-42-54-513Z-one-time-question-moderation-live-smoke.md`,
  and live Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-live/report.json`.
- [x] Add a local admin review script/report for Rabbi/One Time task-flow
  cleanup without silently moving records. Added
  `scripts/rabbi-task-flow-audit.mjs`, package command
  `task:rabbi-flow-audit`, focused coverage in
  `tests/rabbi-task-flow-audit.test.js`, and generated the live read-only
  report `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`.
  Verified with syntax checks, focused task/Telegram tests 41/41, live
  read-only audit readback, and full `npm test` 392/392. No app-visible
  deployment was required.
- [x] Deploy and live-smoke the One Time member-library publish-package
  preview: `preview_one_time_member_library_publish_package` assembles package
  fields and blockers for a scoped One Time content job without publishing,
  sending, changing member visibility, writing Drive/video hosts, creating
  Buffer/social/email/WhatsApp sends, granting checkout/access, writing
  external CRM, or updating content records. Operations One Time Library cards
  can expose `Package Preview`, and Telegram routes content-job publish-package
  requests. Verified with syntax checks, Operations inline script parse,
  focused tests 34/34, full `npm test` 387/387, local browser smoke
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-local/report.md`,
  Railway deployment `32573f44-f7a6-4cbd-baa2-432cf6b1e0a6`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T22-41-22-482Z-live-app-smoke.md`, and focused
  live browser smoke
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-live/report.md`.
- [x] Deploy and live-smoke Google Business/Profile preview helpers:
  Operations Settings > Google Workspace > Google Business Profile now has
  `Place ID` and `Locations` dry-run buttons wired to
  `google_business_place_id_lookup` and
  `google_business_list_locations_preview`, and Telegram routing recognizes
  natural-language Google Business Place ID/location requests. The previews
  perform no Maps lookup, Google Business Profile API call, external read,
  external write, send, or live Google API call. Verified with syntax checks,
  Operations inline script parse, focused action/Google settings tests 32/32,
  full `npm test` 386/386, local browser smoke
  `ops/playwright-smokes/2026-06-15-google-business-preview-local/report.md`,
  Railway deployment `89294419-27aa-4527-ba8d-c7edcfddf394`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T22-22-55-796Z-live-app-smoke.md`, and focused
  live browser smoke
  `ops/playwright-smokes/2026-06-15-google-business-preview-live/report.md`.
- [x] Deploy and live-smoke the Rabbi/One Time 8-week launch-calendar preview
  action. Operations Settings > Google Workspace > Google Calendar now has an
  `8-week plan` dry-run button wired to
  `calendar_batch_launch_plan_preview`, and Telegram routing recognizes
  natural-language requests such as "Create the 8-week Rabbi Scheller launch
  calendar starting 2026-06-21." The preview generates a One Time launch plan
  only when a start date is supplied and otherwise returns a `start_date`
  blocker. It performs no internal calendar write, Google Calendar write,
  external write, send, or Google OAuth action. Verified with syntax checks,
  Operations inline script parse, focused action/Google settings tests 30/30,
  full `npm test` 384/384, local browser smoke
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-local/report.md`,
  Railway deployment `f8951767-ca5f-4c58-a8c5-696015f9d3b9`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T21-51-39-727Z-live-app-smoke.md`, and focused
  live browser smoke
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-live/report.md`.
- [x] Deploy and live-smoke local approval decision preview controls for the
  two remaining gated lanes: both approval packets now have a `Preview
  Decision Draft` button that calls the typed `create_decision` action with
  `dry_run: true`. The action response proves `executed: false` and
  `preview.decision_created: false`, so no decision task, Google read/write,
  publishing, send, checkout, member visibility, Drive/video-host,
  Buffer/social, or external CRM write is created by the preview. Verified
  with Operations inline script parse, focused tests 7/7, full `npm test`
  383/383, local browser smoke
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`,
  Railway deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`, and focused
  live browser smoke
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`.
- [x] Deploy and live-smoke approval-readiness packets for the two remaining
  approval-gated lanes: Operations Settings > Google Workspace now shows a
  Google Live Adapter Approval Packet with the exact
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` phrase, and Operations Content > One
  Time Library shows a One Time Publishing Approval Packet with
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`. Both panels explain the
  required checklist and explicitly perform no Google read/write, no
  Buffer/social, email, WhatsApp, Drive/video-host, checkout, member
  visibility, or external CRM write. Verified with Operations inline script
  parse, focused tests 7/7, full `npm test` 383/383, `git diff --check`,
  local browser smoke
  `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`,
  Railway deployment `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`, and focused
  live browser smoke
  `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`.
- [x] Deploy and live-smoke support ticket processed-notification drafts:
  resolving or closing a ticket now writes a first-party
  `bna_contact_communications` draft with
  `ticket_processed_notification`, `no_send`, and
  `external_write_performed: false` metadata, adds an internal ticket comment,
  and returns `notification_draft` to Operations so the operator sees that no
  automatic email was sent. This does not send email, WhatsApp, SMS, Telegram,
  portal messages, or external CRM writes. Verified with `node --check
  server.js`, `node --check scripts/setup-one-time-partnership-drive.mjs`,
  Operations inline script parse, focused tests 48/48, full `npm test`
  383/383, local API smoke
  `ops/live-smokes/2026-06-14T20-39-16-327Z-support-ticket-notification-local-smoke.md`,
  Railway deployment `f64213ae-1cc1-4b2e-a762-a06c3e81f3b1`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T20-40-31-601Z-live-app-smoke.md`, and focused
  live API/DB smoke
  `ops/live-smokes/2026-06-14T20-42-38-426Z-support-ticket-notification-live-smoke.md`.
- [x] Build and deploy the One Time content library surface from the existing
  scoped video-library helper into a usable internal review workspace:
  searchable One Time tab, hosted media URL support, transcript/worksheet lanes,
  internal approval queue, member-library guardrails, and reporting. Live
  Operations task #610 is marked done in the app for this review-surface slice;
  deeper member-library publishing/media hosting remains blocked on explicit
  approval and connector decisions. Verified with focused tests 7/7, full
  `npm test` 382/382, local browser/API smoke
  `ops/playwright-smokes/2026-06-14-one-time-content-library-local/report.md`,
  Railway deployment `4a77ab03-a394-4663-b4b7-55957655c6b0`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T19-20-41-625Z-live-app-smoke.md`,
  and live focused smoke
  `ops/playwright-smokes/2026-06-14-one-time-content-library-live/report.md`.
  Handoff: `tasks-pending/2026-06-14-one-time-content-library-build.md`.
- [x] Fix login/input screen blinking on mobile/PWA surfaces: Operations login
  now uses a keyboard-aware viewport variable, phone-width 16px inputs,
  horizontal-overflow protection, and no active-field auth redirect; Operations
  background refresh skips while text entry/dictation is active; parent/provider
  onboarding and the shared assistant stop stealing focus on narrow/touch
  screens. Verified with focused tests 51/51, inline script parse, full
  `npm test` 382/382, in-app browser typing smoke, forced mobile local smoke
  `ops/playwright-smokes/2026-06-14-login-stability-local/report.md`,
  Railway deployment `68b459e7-0e98-4395-a905-d67353dd4f20`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T19-18-03-287Z-live-app-smoke.md`,
  and live mobile smoke
  `ops/playwright-smokes/2026-06-14-login-stability-live/report.md`.
- [x] Check Ahuva Dratler parent access and resend the parent portal
  onboarding/login email: live data shows Ahuva attached to the Dratler parent
  records, with Esti Dratler as an external-accountability record and Menachem
  Mendel Dratler as the internal BNA student/accountability record. Sent a
  fresh parent portal magic link email through `/api/bna/parent-access/link`;
  the app returned `email_sent: true`, no email error, no WhatsApp send, expiry
  2026-06-14T22:53:39+03:00, and live communication readback confirmed outbound
  communication #1212.
- [x] Deploy and live-smoke provider setup email plus the shorter provider
  join flow: public provider signup and `/api/provider-onboarding` now send a
  provider portal setup email after the active free listing is committed,
  `/provider?setup=...` lets providers set their password and enter the portal,
  Operations provider cards can resend setup email, and `/providers/join` asks
  only 10 conversational questions. Verified with `node --check server.js`,
  focused provider tests 12/12, nearby parent/provider/One Time tests 39/39,
  local browser smoke
  `ops/playwright-smokes/2026-06-14-provider-setup-email-local/report.md`,
  full `npm test` 376/376, Railway deployment
  `f8e8a7bb-52f5-4427-bc50-2f6e70e8d40e`, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T18-57-24-784Z-live-app-smoke.md`, and live
  provider readback
  `ops/live-smokes/2026-06-14T18-58-10-provider-setup-email-live-readback.md`.
- [x] Deploy and live-smoke the WAPI phonebook-first conversation workspace:
  Operations Communications > WhatsApp now opens a phonebook-first workspace
  over the WAPI grouping report. The UI combines a phonebook/contact list,
  selected conversation timeline, and details/notes/related records panel;
  timeline readback includes matched WhatsApp/WAPI communications, Telegram/CRM
  notes, related tasks, and support tickets where linked. The Add Internal Note
  action writes only local first-party `bna_contact_communications` notes with
  `wapi_phonebook_workspace`, `no_send`, and
  `external_write_performed: false` metadata. No WhatsApp message, broadcast,
  or external CRM write is sent. Verified with syntax checks, Operations inline
  parse, focused WAPI/communications/CRM tests 19/19, full `npm test` 376/376,
  local browser smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-local/report.md`,
  Railway deployment `6c9f06bc-6c1b-47b9-980a-4e8baca73eae`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T18-51-33-221Z-live-app-smoke.md`, and live
  browser smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-live/report.md`.
- [x] Deploy and live-smoke referral/moderation helper actions:
  added `create_referral_ledger_entry`,
  `submit_student_question_for_moderation`, and `review_moderated_question` to
  the action registry, action runner, Telegram router, generated
  action-registry artifacts, and focused action tests. All three are
  approval-gated and preview-first. Approved referral execution creates only a
  scoped One Time `bna_parent_leads` referral candidate, an internal
  `bna_contact_communications` ledger note, and a local review task; it does
  not send referral asks, mint referral links, create rewards, or write any
  external CRM. Approved question execution creates/updates only private One
  Time review tasks/comments; it does not publish a forum post, send a
  response, expose member/student identity, or start Codex automatically.
  Verified with syntax checks, focused action suite 26/26, full `npm test`
  376/376, local preview smoke
  `ops/local-smokes/2026-06-14-referral-moderation-helper-actions-local-preview.json`,
  Railway deployment `e54244e1-41dd-40ae-a313-31cc0c49d6e2`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T18-25-56-841Z-live-app-smoke.md`,
  and live preview-only action smoke
  `ops/live-smokes/2026-06-14T18-26-48-024Z-referral-moderation-helper-actions-live-preview.json`.
- [x] Deploy and live-smoke Rabbi shiur/source-sheet helper actions:
  added `create_rabbi_shiur_idea` and `create_rabbi_source_sheet_task` to the
  action registry, action runner, Telegram router, generated action-registry
  artifacts, and focused action tests. Both are approval-gated and
  preview-first. Approved execution creates only scoped One Time local
  `bna_tasks` review tasks under project `one_time_mishnah_class`; no Codex
  job, Drive/Sefaria/member-library write, email/WhatsApp/social send, public
  visibility, or external CRM record is created. Verified with syntax checks,
  focused action suite 25/25, full `npm test` 375/375, local preview smoke
  `ops/local-smokes/2026-06-14-rabbi-content-helper-actions-local-preview.json`,
  Railway deployment `0dd6f6ec-26ca-4fa1-8520-6e8d76790246`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T18-08-35-649Z-live-app-smoke.md`,
  and live preview-only action smoke
  `ops/live-smokes/2026-06-14T18-09-23-665Z-rabbi-content-helper-actions-live-preview.json`.
- [x] Deploy and live-smoke the task/decision helper action bundle:
  added `add_decision_option`, `schedule_task_on_date`, and
  `move_task_workspace` to the action registry, action runner, Telegram router,
  generated action-registry artifacts, and focused action tests. All three are
  approval-gated and preview-first. Approved writes only update local
  `bna_tasks`/`bna_task_comments` fields for decision options, due/planned
  dates, or project/workspace scope; they do not create Codex jobs, connector
  writes, WhatsApp/email/social sends, or external CRM records. Verified with
  syntax checks, focused action suite 24/24, full `npm test` 374/374, local
  preview smoke
  `ops/local-smokes/2026-06-14-task-decision-helper-actions-local-preview.json`,
  Railway deployment `85c15479-f581-45d3-bb53-695fb99f8ac7`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T17-54-55-156Z-live-app-smoke.md`,
  and live preview-only action smoke
  `ops/live-smokes/2026-06-14T17-55-44-901Z-task-decision-helper-actions-live-preview.json`.
- [x] Deploy and live-smoke the One Time video-library item helper action:
  added `create_one_time_video_library_item` to the action registry, Telegram
  router, action runner, content output schema, generated action-registry
  artifacts, Operations output labels, and focused tests. The action is
  approval-gated and preview-first; approved execution creates only scoped
  first-party One Time `bna_content_jobs` plus internal `bna_content_outputs`
  draft states for library card, transcript review, thumbnail brief,
  worksheet/source-sheet plan, social copy plan, and newsletter plan. It does
  not create member/public visibility, Buffer/social drafts, email/WhatsApp
  sends, video-host writes, Drive writes, checkout, or external CRM records.
  Verified with syntax checks, focused action/One Time tests 58/58, full
  `npm test` 373/373, local preview smoke
  `ops/local-smokes/2026-06-14-one-time-video-library-action-local-preview.json`,
  Railway deployment `e93d2da8-4852-4d82-a260-39b1be5960b2`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T17-36-34-282Z-live-app-smoke.md`,
  and live preview-only action smoke
  `ops/live-smokes/2026-06-14T17-40-27-one-time-video-library-live-preview.json`.
- [x] Deploy and live-smoke the `retitle_task_naturally` helper typed action:
  added action-registry metadata, action-runner implementation, Telegram
  routing for "retitle task #... to ...", regenerated action-registry artifacts,
  and focused coverage. The action is approval-gated, previews by default,
  rejects raw ramble-looking replacement titles, preserves previous-title
  provenance as a truncated preview, and does not create agent jobs. Verified
  with syntax checks, focused action/task/watchdog tests 44/44, full
  `npm test` 372/372, Railway deployment
  `67ba8b4b-2072-4367-b12c-181cfe156424`, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T17-18-12-469Z-live-app-smoke.md`, and live
  preview-only action smoke
  `ops/live-smokes/2026-06-14T17-18-55-172Z-retitle-task-action-live-preview.md`.
- [x] Deploy and live-smoke Rabbi Mishnayos parent/member onboarding lead
  capture for the One Time preview funnel: `/one-time-preview` now routes the
  primary CTA to a guided intake form and `POST /api/one-time/mishnah/onboarding`
  creates scoped first-party review records for the One Time workspace only:
  parent lead, provider-workspace contact, internal communication transcript,
  support ticket, and Shloimie/Rabbi follow-up task. Dry-runs write nothing and
  all responses stay `no_send: true` with no checkout, access grant, email,
  WhatsApp, social post, or external CRM write. Verified with
  `node --check server.js`, inline preview script parse, focused onboarding/provider/workspace
  tests 23/23, full `npm test` 370/370, local endpoint smoke
  `ops/live-smokes/2026-06-14T-one-time-onboarding-local-smoke.json`, local
  browser smoke
  `ops/playwright-smokes/2026-06-14-one-time-onboarding-local/report.md`,
  Railway deployment `8e55d3c5-b958-42b2-b176-ae74df5bfdb8`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T17-05-14-786Z-live-app-smoke.md`,
  and live dry-run smoke
  `ops/live-smokes/2026-06-14T17-06-57-397Z-one-time-onboarding-live-dry-run.md`.
- [x] Add task-title cleanup dry-run for the Google/onboarding/CRM follow-up:
  added `scripts/task-title-cleanup-dry-run.mjs` plus
  `npm run task:title-cleanup`. The command is dry-run by default, skips
  closed tasks unless `--include-closed` is supplied, excludes full raw
  operator wording from reports, and requires
  `--apply --confirm APPLY_TASK_TITLE_CLEANUP` before live patching. Verified
  with syntax checks, focused task/watchdog/reconciler tests 28/28, full
  `npm test` 367/367, and live dry-run report
  `ops/system-audits/2026-06-14T16-37-35-442Z-task-title-cleanup-dry-run.md`
  showing 304 tasks scanned, 224 closed tasks skipped, 0 automatic patch
  candidates, and 1 manual-review item. No deployment was required because
  this slice adds local CLI/report tooling only.
- [x] Deploy and live-smoke parent announcement approved-draft persistence and
  readback from the Google/onboarding/CRM follow-up brief: added guarded
  `GET/POST /api/bna/parent-announcements` aliases over the existing
  `bna_weekly_updates` table, Operations Communications > Announcements
  readback, and an Approve Draft action. Dry-runs write nothing; non-dry-run
  approval requires `APPROVE_PARENT_ANNOUNCEMENT`; the flow never sends email,
  WhatsApp, or social posts. Verified with syntax checks, Operations inline
  parse, focused community/Operations/portal tests 38/38, full `npm test`
  360/360, local dry-run/API+UI smokes
  `ops/live-smokes/2026-06-14T16-26-08-240Z-parent-announcement-local-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-local/report.md`,
  Railway deployment `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T16-27-29-418Z-live-app-smoke.md`,
  and live dry-run/UI smokes
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.
- [x] Deploy and live-smoke the WAPI manual phonebook correction apply UI from
  the Google/onboarding/CRM follow-up brief: upgraded the earlier local
  correction overlay into a two-step apply path. Dry-runs now return an exact
  local CRM write preview, Operations shows that preview before apply, and
  confirmed applies can update first-party `bna_contacts` tags/status plus
  linked `bna_parent_leads` tags/status/lead type. Student, signup, and
  provider records are explicitly skipped; no WhatsApp message, broadcast, or
  external CRM write runs. Non-dry-run writes require `APPLY_WAPI_CORRECTION`.
  Verified with syntax checks, focused WAPI tests 5/5, adjacent
  WAPI/communications/action tests 33/33, full `npm test` 359/359, Railway
  deployment `4c152697-dbd0-4dd7-8834-83b483999459`, Railway doctor, live app
  smoke `ops/live-smokes/2026-06-14T16-22-20-061Z-live-app-smoke.md`, live
  endpoint dry-run/confirmation-gate smoke
  `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`,
  and live browser smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`.
- [x] Deploy and live-smoke the Telegram note-to-CRM matcher from the
  Google/onboarding/CRM follow-up brief: added shared parser/scorer logic in
  `src/lib/bna/telegram-note-to-crm.js`, admin endpoint
  `/api/bna/contact-communications/match-note`, Telegram `/crm_note`,
  `/whatsapp_note`, `/wa_note`, and natural-language handling for notes such as
  "that WhatsApp with X was about Y". The flow only reads local
  `bna_contact_communications`, creates a local Telegram/internal CRM note on
  confident match, supports dry-run/no-match smoke, and never sends WhatsApp
  messages. Verified with syntax checks, focused Telegram/WAPI tests 15/15,
  final `npm test` 357/357, local smoke
  `ops/live-smokes/2026-06-14T15-54-29-499Z-telegram-note-to-crm-local-smoke.md`,
  Railway deployment `73a812e2-572e-4231-a971-20aef4f52450`, Railway doctor,
  live app smoke `ops/live-smokes/2026-06-14T15-56-27-842Z-live-app-smoke.md`,
  and live endpoint dry-run smoke
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.
- [x] Deploy and live-smoke the WAPI phonebook grouping dry-run report from the
  2026-06-14 Google/onboarding/CRM follow-up brief: added shared grouping logic
  in `src/lib/bna/wapi-phonebook-report.js`, CLI
  `npm run wapi:phonebook-report`, admin-only API
  `/api/bna/wapi/phonebook-report`, and Operations Communications > WhatsApp >
  Phonebook grouping. The report is read-only/no-send, returns confidence and
  review flags, shows aggregate manual correction candidates, and keeps Nati
  Freeze/Fries as `friend_non_lead` unless actual message content shows school
  interest. Verified with syntax checks, Operations inline parse, focused
  WAPI/CRM tests 17/17, `npm test` 353/353, local smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-local/report.md`, Railway
  deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225`, Railway doctor, live app
  smoke `ops/live-smokes/2026-06-14T15-40-45-848Z-live-app-smoke.md`, and live
  smoke `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.
  Manual correction apply UI is deployed separately above; remaining WAPI work
  is the full phonebook-first conversation workspace.
- [x] Deploy and live-smoke the Google Workspace readiness panel from the
  2026-06-14 Google/onboarding/CRM goal-mode brief: local code now exposes
  `/api/bna/integrations/google/status`, adds Operations Settings > Google
  Workspace with Drive, Calendar, Classroom, and Google Business Profile cards,
  separates no-OAuth/manual, test-user OAuth, and later verification modes, and
  documents Google scopes/action maps under `ops/google-integrations/`.
  Follow-up deployment `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` added Drive
  preview-only action buttons for file search/list, Doc preview, folder
  preview, and move/import preview; these are audited dry-runs and perform no
  external Drive reads or writes.
  Follow-up deployment `03c2c30c-7639-494c-8e05-20863386c054` added
  `capture_provider_google_business_link`, an approval-gated manual provider
  Google Business/Profile link and Place ID capture action with Telegram and
  web-assistant routing. It stores manual metadata only and does not call the
  live GBP API.
  Verification passed with `node --check server.js`, focused Google/workspace/
  Operations tests, `npm test` 349/349, Railway deployments
  `e38167f2-5e6d-4447-b9d4-e195375c4315` and
  `d2ee16bc-cacd-4025-a77d-f1d358d1230c`, `npm run railway:doctor`, live app
  smokes `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md` and
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`, direct live
  reads/probes of `/api/bna/integrations/google/status` and the confirmation-
  gated disconnect route, and live browser smokes
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`
  and
  `ops/playwright-smokes/2026-06-14-google-workspace-disconnect-live/report.md`
  at desktop and 390px mobile with four Google cards, no console errors, and
  no horizontal overflow. The Drive preview follow-up passed post-deploy
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`, and live
  browser smoke
  `ops/playwright-smokes/2026-06-14-google-drive-preview-live/report.md`.
  The provider Google Business capture follow-up passed focused tests 44/44,
  `npm test` 350/350, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T15-16-29-530Z-live-app-smoke.md`, and live
  action API dry-run smoke
  `ops/live-smokes/2026-06-14T15-19-19-000Z-provider-google-business-action-smoke.md`.
  Handoff:
  `tasks-pending/2026-06-14-google-onboarding-helper-crm-workspace-followup.md`.
- [x] Deploy and live-smoke the public/portal privacy hardening from the
  2026-06-14 goal-mode brief: code now keeps
  `/parent/login?onboard=accountability` in the public onboarding/login shell
  even if a parent session exists, clears stale `bnaStudentAccessCode` from
  non-student and student-login surfaces, stops the helper from reading saved
  student codes, and redacts parent contact fields from student-audience portal
  payloads. Local verification passed with `npm test` 341/341, syntax checks,
  and browser smoke
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-fix/report.md`.
  Railway deployment `59b07235-039a-4d0c-9676-8ecea6736390` reached SUCCESS;
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T14-25-57-627Z-live-app-smoke.md`, and live
  public/parent/student privacy smoke
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-live/report.md`
  passed. Report:
  `ops/goal-mode/2026-06-14-onboarding-helper-crm-workspace-report.md`.
- [x] Create the local BNA keyholder workflow from the 2026-06-14 goal-mode
  brief: added `scripts/open-bna-keyholder.ps1`,
  `scripts/keyholder-diagnostics.mjs`, `docs/local-keyholder.md`, package
  commands `keyholder:open` and `keyholder:diagnose`, `.gitignore` protection
  for repo-local fallback folders, and regression tests proving diagnostics
  normalize BOM/quotes/whitespace without exposing secret values. Created the
  outside-repo folder `C:\Users\User\BNA-Keyholder` plus desktop shortcut
  `BNA Keyholder`. Verified with `node --check
  scripts/keyholder-diagnostics.mjs`, focused keyholder tests, `npm test`
  345/345, and diagnostics report
  `ops/qa-runs/2026-06-14T14-41-27-809Z-keyholder-diagnostics.md`.
- [x] Create the official Rabbi Scheller / One Time audit deliverables named in
  the 2026-06-14 goal-mode brief: consolidated the existing audit evidence into
  `ops/rabbi-scheller/2026-06-14-one-time-app-audit.md` with the required 18
  sections, created
  `ops/rabbi-scheller/green-invoice-billing-options.md` comparing the billing
  paths and discouraging daily payment-link sprawl, and added
  `tests/rabbi-scheller-audit-docs.test.js` so the exact report paths and
  sections stay present. Verified GitHub refs still match the audited commits,
  focused doc tests passed, and `npm test` passed 347/347.
- [x] Deploy and live-smoke the Rabbi/One Time task UI, helper, audit, and
  preview cleanup: local work now restores BNA blue/gold/parchment task styling,
  adds the BNA logo to Operations headers, shows current workspace/role/viewing/
  active-filter context, replaces `Workspace Bucket` wording with workspace/
  assignee/type/status filters, fixes decision option routing through typed
  endpoints, adds a `Needs more info` decision action, adds selected-date task
  calendar actions, creates the preview-only One Time funnel at
  `/preview/one-time-mishnah`, and writes One Time repo/backend/billing/helper
  audits under `ops/audits/`. Local verification passed with `npm test` 341/341
  and authenticated Playwright smoke at 390/430/768/1440 widths. Railway
  deployment `f8c16762-9a73-4a77-8a9b-c5cbe2a00ec8` reached SUCCESS; Railway
  doctor, live app smoke
  `ops/live-smokes/2026-06-14T13-56-08-327Z-live-app-smoke.md`, and live
  Playwright smoke
  `ops/playwright-smokes/2026-06-14-task-ui-brand-cleanup-live/report.md`
  passed. Handoff:
  `tasks-pending/2026-06-14-rabbi-task-ui-helper-workspace-handoff.md`.
- [x] Make the public website assistant a bilingual self-governance lead
  magnet: the shared bot now auto-opens after a short delay on public/signup
  surfaces, greets in English or Hebrew, sends a delayed follow-up with a
  typing pause, keeps the interface to one chat plus history/close/send, uses a
  public BNA/self-governance/content-library context instead of private task
  data, hides OpenAI/Kimi/provider details from regular users, creates
  Shloimie follow-up reminders for public contact requests, and converts clear
  public bugs/suggestions into support tickets plus Codex review items or
  Shloimie Decisions. Verified with `npm test` 337/337, local Playwright
  smoke
  `ops/playwright-smokes/2026-06-14-public-assistant-local/report.md`,
  Railway deployment `b0c87179-7801-4af3-8716-b0b87d64f299`, Railway doctor,
  live app smoke
  `ops/live-smokes/2026-06-14T13-07-54-304Z-live-app-smoke.md`, and live
  Playwright smoke
  `ops/playwright-smokes/2026-06-14-public-assistant-live/report.md`.
- [x] Deploy and live-smoke the assistant/portal/communications foundation:
  sender identity is centralized and normalizes away `Office P`, Resend is a
  configured connector with Gmail fallback, unified communications and checkout
  attempt tables/APIs are bootstrapped, credit signups now create first-party
  checkout attempts and parent access setup state, abandoned-checkout sweep is
  dry-run/approval gated, WhatsApp import is first-party and no-send by
  default, ticket/community/class/file/review readiness APIs exist, and the
  assistant drawer is keyboard-aware on mobile. Verified with `npm test`
  323/323, local assistant keyboard smoke at 390/393/430 widths, local
  Operations mobile smoke, Railway deployment
  `0cca77e2-d718-47b6-bc28-6824125597f3`, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T09-32-40-859Z-live-app-smoke.md`, and focused
  live read/dry-run smoke
  `ops/live-smokes/2026-06-14T09-33-21-093Z-assistant-portal-focused-live-smoke.json`.
  Handoff:
  `tasks-pending/2026-06-14-assistant-portal-communications.md`.
- [ ] Build the bilingual natural-language onboarding layer for parents,
  students, and service providers: the assistant should welcome each user in
  English or Hebrew, explain how to use the app, walk through recording upload,
  collect child/provider/profile goals and prompt preferences conversationally,
  and teach the self-governance/responsibility model before turning inputs into
  scoped durable records. Website provider and parent/accountability links
  should open these bot-style intakes first: provider join explains review,
  students/homeschoolers/alternative education, index/funnel direction, and asks
  listing questions step by step; parent intake asks child struggles, goals,
  motivators, chores, meals/eating preferences, recordings, and setup context.
  Public assistant thread memory and public knowledge grounding are now shipped;
  student assistant onboarding coaching is now deployed and live-smoked as a
  no-ticket/no-write deterministic role guide for Today, goals, daily
  checkoff, questions, reflection, and Rabbi/Shloimie messages. Remaining work
  is deeper parent/student/provider goal-store/profile writes and action
  execution against scoped records after explicit action rules.
  Handoff:
  `tasks-pending/2026-06-14-workspace-person-household-provider-architecture.md`.
- [x] Make Operations workspace navigation official and scalable: Super Admin
  should see a multi-workspace directory/switcher with filters for school,
  service providers, family/home accountability, parent households, community/
  project, and platform workspaces instead of a hard-coded Rabbi Sheller
  workspace label. Completed 2026-06-14: Operations side panel now has a
  Workspace Directory switcher with type filters, neutral One Time provider
  naming, parent-household directory support, type-aware sidebar profiles, and
  grouped Admin Workspaces cards. Verified with `npm test` 334/334, local
  Playwright
  `ops/playwright-smokes/2026-06-14-operations-workspace-directory-local/report.md`,
  Railway deployment `129a0092-f58e-47fe-ad1a-78529134e9c9`, Railway doctor,
  live app smoke
  `ops/live-smokes/2026-06-14T12-29-12-447Z-live-app-smoke.md`, and live
  Playwright
  `ops/playwright-smokes/2026-06-14-operations-workspace-directory-live/report.md`.
  Handoff:
  `tasks-pending/2026-06-14-workspace-person-household-provider-architecture.md`.
- [x] Deploy and live-smoke the workspace task system cleanup for Rabbi
  Scheller / One Time: local work now makes Decisions, Pending, Tasks, Calendar,
  Done, and Activity the active Operations task structure; Pending is
  human/external only; comments default to shared workspace dialogue; explicit
  comment requeue is required before spawning agent work; task calendar has
  month/week/selected-day views with Hebrew dates; and the Rabbi Scheller launch
  seed/backfill is idempotent in the server startup path. Verified with
  `npm test` 315/315, Kimi-backed hosted AI smoke, Railway deployment
  `954411df-9a0a-4892-820e-28ebbdb9c85c`, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T07-56-50-529Z-live-app-smoke.md`, live task API
  readback, and live mobile Playwright smoke
  `ops/playwright-smokes/2026-06-14-workspace-task-system-live/2026-06-14T07-58-30-461Z-report.md`.
  2026-06-15 follow-up: Tasks > Calendar selected-day view now shows an
  explicit `Selected: Monday, June 22, 2026`-style label, Hebrew date/item
  context, Add Task, Move Selected Task, and an adjacent Google Calendar
  dry-run control wired to `sync_google_calendar` with `dry_run: true` and
  `no_google_calendar_write: true`. Verified with Operations inline script
  parse, focused task/action/Google tests 45/45, full `npm test` 427/427,
  local in-app Browser check, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-local/report.md`,
  Railway deployment `84bd450e-d5e9-409c-8126-29a147ab51cd`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T05-14-42-829Z-live-app-smoke.md`, and focused
  live smoke
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/report.md`.
  2026-06-15 follow-up: Decision detail cards now render clearer
  question-style prompts, workspace/owner/due context, Option A/B/C cards with
  pros, cons, consequences, recommendation, `Needs more info`, and an inline
  decision comment box that writes only workspace comments with `requeue:
  false`. Verified with Operations inline script parse, focused
  task/action-registry tests 42/42, full `npm test` 433/433, `git diff --check`
  with only LF/CRLF warnings, local in-app Browser readback before
  the browser reload policy blocked further local browser use, Railway
  deployment `03ad6a70-0f58-40c1-abb4-f2a6bfe4e3a5`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T05-28-00-126Z-live-app-smoke.md`, and focused
  live HTTP readback
  `ops/live-smokes/2026-06-15T05-30-30-413Z-operations-decision-card-ui-live-smoke.md`.
  Handoff:
  `tasks-pending/2026-06-14-workspace-task-dialogue-rabbi-scheller.md`.
- [x] Finish BNA workspace/community/provider/bot no-GHL release on
  `cleanup/bna-workspace-community-provider-bot-no-ghl`: dirty worktree was
  preserved on a safety branch/commit, active runtime is first-party BNA plus
  explicit connectors only, provider public signup is free-listing-only, action
  registry has role-aware ticket/decision/provider/community/worksheet bot
  actions, and OpenAI key diagnostics now prove `.secrets/openai-api-key.txt`
  and Railway share the selected key fingerprint but OpenAI rejects it with
  `401 invalid_api_key`. Operator approved temporary Kimi-primary hosted AI
  mode via `BNA_AI_PRIMARY_PROVIDER=kimi` while OpenAI remains unresolved. Local
  and Railway non-secret overrides are set to `kimi`; the live task/support
  category blocker was fixed, Kimi-backed hosted AI smoke now passes
  end-to-end, and the changed bundle was deployed in Railway deployment
  `954411df-9a0a-4892-820e-28ebbdb9c85c` with Railway doctor and live app
  smoke passing. Handoff:
  `tasks-pending/2026-06-14-workspace-community-provider-bot-no-ghl.md`.
- [ ] Deploy and live-smoke the signup credit payment-link email fix: manual
  resend for signup #12 succeeded to both recorded parent emails, and local code
  now includes the configured credit `PAYMENT_LINK` in confirmation emails sent
  to Parent 1 plus Parent 2. Follow-up deployed Railway deployment
  `c9c861e4-4e1e-4f2e-9fed-7db972d9b1ab` with an admin no-send preview path on
  `/api/bna/signups/:id/send-confirmation`; live preview smoke
  `ops/live-smokes/2026-06-15T07-26-34-821Z-signup-credit-email-preview-live-smoke.md`
  proved an unpaid credit signup composes to both parent recipients and includes
  the configured payment link without sending or writing rows. Do not mark done
  until an approved live credit signup/email-log smoke sends only to approved
  test recipients and proves both parent emails receive the payment link.
  Handoff:
  `tasks-pending/2026-06-13-signup-credit-link-email-live-deploy.md`.
- [x] Deploy and live-smoke the registration toolbar/parent-permission notice
  fix: the shared public-site toolbar, no-checkbox parent responsibility
  notice, hidden backend acknowledgment, and black/readable Parent 1/Parent 2
  heading/label/name text are live. A follow-up CSS patch moved the long
  public-site nav behind the existing hamburger before it can overflow at
  1280px. Verified with syntax checks, focused registration/nav tests 9/9,
  `npm test` 353/353, Railway doctor on deployment
  `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225`, live app smoke
  `ops/live-smokes/2026-06-14T15-41-19-444Z-live-app-smoke.md`, and live
  signup/document/thank-you smoke
  `ops/playwright-smokes/2026-06-14-registration-toolbar-permission-live/report.md`.
  Handoff:
  `tasks-pending/2026-06-13-registration-toolbar-permission-live-deploy.md`.
- [x] Deploy and live-smoke the Operations parent-to-student link fix: Contacts
  now loads the student roster, resolves parent signups to student profiles by
  signup id or parent email/student name, shows a `Student linked` pill, adds
  parent-detail Linked Records, and opens the matching student profile from the
  parent record. The code is live in Railway deployment
  `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9`. Verification passed with
  `node --check server.js`, `node --check public/js/bna-bot-widget.js`, focused
  Operations/portal tests 35/35, full `npm test` 350/350, production HTML
  readback, `npm run
  railway:doctor`, live app smoke
  `ops/live-smokes/2026-06-14T15-08-19-575Z-live-app-smoke.md`, and PII-safe
  live Operations smoke
  `ops/playwright-smokes/2026-06-14-operations-parent-student-links-live/report.md`.
  Handoff:
  `tasks-pending/2026-06-14-operations-parent-student-links-live-deploy.md`.
- [ ] Build universal BNA helper and fix contact tagging/settings/Hebrew menu
  issues: local implementation and tests passed on 2026-06-13. Shipped local
  slices include role-safe universal assistant backend/widget, retired CRM
  contact compatibility cleanup, contact-role repair dry-run script, Whapi
  resolved-name fallback, Settings light-shell cleanup, Hebrew RTL drawer fix,
  and brand-kit AI context in the OpenAI sidekick smoke. Keep open until OpenAI
  API credentials are fixed, the contact repair dry-run can reach the live
  database, and the changed app bundle is deployed with Railway doctor/live
  smoke. Handoff:
  `tasks-pending/2026-06-13-universal-helper-tagging-settings-hebrew.md`.
- [x] One Time: collect Rabbi Scheller contact email, WhatsApp/contact phone,
  and scoped login username, then send the task-manager login handoff last.
  Completed 2026-06-14: live provider/project records were updated, Gmail sent
  the One Time task-manager access handoff, and WhatsApp delivery was confirmed;
  handoff:
  `tasks-pending/2026-06-12-scheller-drive-social-login-brief.md`.
- [ ] Collect missing Weber/Fober parent contact details before portal link or
  WhatsApp send: Green Invoice webhook log is empty, and no email/phone exists
  in the signup, payment intake, or payment log records. Blocked pending
  external parent contact details; source:
  `tasks-pending/2026-05-27-bna-telegram-accountability-audit.md`.
- [ ] Mapping out inner dialogue between members and the community and dialogue:
  core app implementation is deployed and live-smoked. Completed slices include
  runtime/DB audit, mobile nav/hero fix, parent permission persistence,
  learning-community/dialogue backend, newsletter hero, sliding portal bot,
  guarded email smoke, Railway deploy, and live smoke. Remaining follow-ups are
  the product/source-material items still listed below. Handoff:
  `tasks-pending/2026-06-12-inner-dialogue-community-bot-master.md`.
- [x] Audit live runtime and overlapping agent work for BNA community/dialogue
  build: Express/static runtime, live routes, current DB overlap, stale local
  Supabase URL, Railway DB secret, baseline tests, and production route shape
  were recorded before schema/UI edits.
- [ ] Normalize BNA brand kit across public, operations, parent, student, and
  form pages: several brand shell passes are already deployed; keep open until
  the master prompt surfaces are re-audited together. Handoff:
  `tasks-pending/2026-06-16-ui-brand-operations-layout.md`.
- [x] Fix mobile public navigation, hamburger menu, and hero CTA placement:
  mobile nav now includes parent, student, provider/Rabbi, signup, language,
  contact, and provider join paths; hero image/spot badge were tightened and
  screenshot-smoked.
- [x] Rebuild signup flow into four signed document pages: all four required
  document cards now open branded full registration-document pages, preserve
  the typed signup form by returning to the opener tab, and persist the same
  four-signature payload with version/language/signer context.
- [x] Add parent permission fields for leaving, swimming, food, money, and
  pickup responsibility: English/Hebrew signup forms now collect the fields;
  the API persists normalized `parent_permissions` plus pickup responsibility
  fields and backfills parent permission profiles.
- [ ] Implement parent, spouse, student, rabbi, and service-provider login
  model: parent/student/provider foundations exist; spouse/rabbi/community
  access still needs audit and completion.
- [ ] Add onboarding and reset emails for parent and student access.
  Handoff/source: `tasks-pending/2026-06-16-full-ws-closeout-parent-student-login.md`.
- [x] Complete Hebrew and RTL audit for student-facing pages: localized the
  student portal question answer prefix and Rabbi WhatsApp meeting CTA, added
  contract coverage, added a reusable fixture-backed Playwright audit, and
  deployed Railway `8a2d1967-7573-499d-955f-a21f90a990c0`. Verified with
  focused assistant/student-polish tests 12/12, full `npm test` 415/415,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T02-41-35-249Z-live-app-smoke.md`, and live
  Hebrew/RTL audit
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/report.md`.
- [x] Build learning community roles and membership model: live backend now has
  BNA-scoped learning communities, memberships, default `bna-main`, and admin
  APIs.
- [x] Build internal dialogue/forum between community members: community thread
  and message tables/APIs are live with parent, student, provider, and admin
  actor resolution.
- [x] Build sliding in-app AI bot widget.
- [x] Connect bot widget to safe backend tool/action registry: portal widget
  uses preview-only safe actions and community note posting, not a raw LLM
  endpoint.
- [x] Add newsletter hero to parent dashboard: parent portal renders selected
  weekly updates as a first-screen hero with media/history slots when data
  exists.
- [ ] Retrieve or select approved weekly newsletter copy and pool/talking-head
  media: weekly-update data model/admin API and parent hero are live; 2026-06-14
  trace confirmed the deployed parent section only renders when an update row is
  `selected`/`published` and selected for parent portal. Approved copy/media
  selection is the missing follow-up, not the hero infrastructure. 2026-06-15
  follow-up deployed the in-page Operations approval workspace with candidate
  loading, image/video URL readback, dry-run preview, typed approval, local/live
  smokes, and no-send guardrails. Blocked pending approved copy/media source:
  `tasks-pending/2026-06-12-inner-dialogue-community-bot-master.md`.
- [x] Add email smoke tests and send controlled test email to
  `sdratler@gmail.com` only when authorized: guarded dry-run smoke script is
  live; no real email was sent without explicit approval.
- [x] Add mobile screenshot smoke tests for homepage, forms, documents, login,
  parent, student, and bot: deployed registration-document stale student-code
  clearing and added a reusable 390px live Playwright matrix covering `/`,
  public helper open state, English/Hebrew signup, all four required
  registration document pages, parent login/accountability onboarding, student
  login, and provider login. Verified with focused tests 15/15, full
  `npm test` 415/415, Railway deployment
  `e7c5c182-70ff-49cd-b786-ca76de01efc2`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T02-24-39-914Z-live-app-smoke.md`, and live
  matrix report
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/report.md`.
  Guardrail: no form submission, login, assistant send, email, WhatsApp,
  billing, Google API call, connector write, or external CRM write was
  executed.
- [x] Deploy, smoke live routes, update changelog, ledger, memory, and task
  statuses: latest master-brief deployment
  `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d` reached SUCCESS and live smoke
  passed at `ops/live-smokes/2026-06-12T14-42-47-439Z-live-app-smoke.md`.

- [x] Finish the release OpenAI sidekick smoke verification for the parent/student/action-registry release: fresh local OpenAI key was stored outside chat, Drive smoke secrets were present in `C:\Users\User\bna-release-clean`, `npm run openai:smoke` passed with repo/app/Drive/OpenAI context, and the PR QA report was updated/pushed in commit `5894c79`. Report: `ops/openai-smokes/2026-06-12T06-22-48-616Z-openai-sidekick-smoke.md`.

- [x] Build the Operations Action Registry so Telegram, in-app bots, and UI
  buttons call the same typed backend actions with permissions, dry-run/approval
  gates, audit logs, and Codex routing only for code/system development:
  shipped 40 typed actions, Telegram intent routing, server/UI action endpoints,
  action artifacts, and tests. Verified with focused action/portal tests 46/46,
  `npm test` 268/268, app smoke, OpenAI smoke, and Railway doctor. Report:
  `ops/qa-runs/2026-06-11-action-registry-telegram-ui-bot.md`.
- [x] Run the production UI QA/fix loop for parent/student portals, calendar,
  provider participant portal, and only the shared Operations shell pieces
  needed for role/workspace clarity: re-verified 165 screenshots across
  360/390/430/768/1440, parent/student English and Hebrew, mobile calendar
  list/detail states, provider separation, and no horizontal overflow. Report:
  `ops/qa-runs/2026-06-11-final-release-readiness.md`.
- [ ] Build Content Library v2 normalized knowledge library: add taxonomy, segment, claim, source, claim-source, and research-task records; seed controlled Torah/ADHD/nutrition/parenting/education/operations/repurposing terms; add parser v2, backend filters, Operations review queues, and a safe backfill path without breaking existing content jobs, outputs, Prompt Studio, bundles, or publishing workflows. Handoff: `tasks-pending/2026-06-11-content-library-v2-build-brief.md`.
- [x] Deploy and live-smoke the provider onboarding/integrations foundation:
  local work added sanitized public provider index routes/API, provider profile
  Google/Profile fields, natural-language provider intake records/parser,
  parent-provider messages, provider replies, provider join form fields, public
  nav links, and credential-example cleanup. The current production deployment
  `1a60aabe-b1a7-4adc-a788-de4e71abd0bd` includes the bundle. Verified with
  `node --check server.js`, focused provider directory tests 12/12, Railway
  doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T02-11-53-759Z-live-app-smoke.md`, and focused
  no-write live browser/API smoke
  `ops/playwright-smokes/2026-06-15-provider-onboarding-foundation-live/report.md`.
  Guardrail: no provider signup, provider intake submission, parent-provider
  message, provider reply, email, WhatsApp, billing, Google API call, connector
  write, or external CRM write was executed.
- [x] Deploy and live-smoke the registration/provider/student-security pass: public signup now shows four visible required docs, shared BNA UI/token guidance is in place, provider intake/AI Max application fields are expanded without checkout, student portal invalid-code handling is hardened, and the Rabbi/One Time video workflow is briefed. Railway deployment `d4f0be3c-1890-4f4a-9364-41ef6d57df58` reached SUCCESS; Railway doctor, live app smoke, and targeted production signup/provider/student security smoke passed. Handoff: `tasks-pending/2026-06-12-registration-provider-security-rabbi-video.md`.
- [x] Decide the final student portal auth model: superseded the 2026-06-15
  private-code-only decision. Parent-managed student username/password login is
  now the approved model, documented at
  `ops/access/student-portal-auth-policy.md`; access-code fallback remains
  available and audited with the earlier `bna_student_portal_auth_attempts`
  guardrails. Active implementation/verification is tracked in
  `tasks-pending/2026-06-16-full-ws-closeout-parent-student-login.md`.
- [ ] Confirm AI Max pricing, payment, and delivery terms before enabling any checkout, paid automation, ad launch, or billing flow. Blocked pending owner decision; source: `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`.
- [x] Fix Torah/public content contamination from backend/task remarks: public content generation now applies shared source-separation guardrails, filters operational/admin/task/accountability lines before draft generation, persists the guardrails into saved public prompt rows on startup, refuses meta disclaimers like "technical/admin remarks were excluded," and routes corrupted Torah-section task notes to the Operations topic instead of Torah. Verified with `node --check server.js`, `node --check tests/public-content-contamination-guard.test.js`, focused content/routing tests 43/43, `npm test` 237/237, Railway deployment `d7f7fe38-207d-401b-b4ee-3ea9e49f34cb` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-11T08-12-52-256Z-live-app-smoke.md`, and live `/api/bna/content-prompts` readback confirming guardrails on all 6 public prompts.
- [x] Add per-card Content Library research/source links and student questions: every Content Library item now exposes student questions, sourceable topics, Sefaria search/direct source links, and a source-sheet task action while task/decision captures stay out of Content. Verified with `node --check server.js`, Operations script parse, focused Content tests 7/7, `npm test` 230/230, local card smoke `tmp/qa-runs/content-card-research-links/local-content-card-research-links-smoke.json`, Railway deployment `6b375c1d-ce49-4d2b-8582-b86825baa483` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-11T07-36-26-862Z-live-app-smoke.md`, and production card smoke `tmp/qa-runs/content-card-research-links/production-content-card-research-links-smoke.json`.
- [x] Add Content Library topic/source filters and clear transcript-only backlog status: Content Library now shows top Topic and Source filters, Torah/psychology/health/etc. topic pills, source pills/links, output counts, transcript length, and `Needs Output` / `Generate output` for saved transcripts with no platform drafts. Verified with `node --check server.js`, Operations script parse, focused Content tests 9/9, `npm test` 229/229, local Content UI smoke `tmp/qa-runs/content-library-taxonomy/local-content-library-taxonomy-smoke.json`, Railway deployment `a5692ae9-0284-4614-910e-dfd3076390bd` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-11T07-19-34-467Z-live-app-smoke.md`, and production Content UI smoke `tmp/qa-runs/content-library-taxonomy/production-content-library-taxonomy-smoke.json`.
- [x] Complete Operations full professional QA/product-polish pass: behaved as a fake user across Platform, BNA School Workspace, Rabbi Sheller Provider Workspace, parent/student/provider portals, settings, connectors, mobile, role/workspace switching, primary prompts/actions, dry-run workflows, privacy checks, and production pages; fixed workspace switcher search/stable hook, not-configured placeholder polish, and bot action preview response shape. Verified with `node --check server.js`, Operations script parse, `npm test` 220/220, `npm run screenshot`, `npm run openai:smoke`, Lighthouse `lighthouse-report.html` (performance 63, accessibility 84, best-practices 100, SEO 100; Windows temp-profile cleanup after report write), local full QA matrix `tmp/qa-runs/operations-full-qa-results-clean.json` (54 routes, 15 workflows, 38 screenshots, 0 failures), Railway deployment `ea35c7ae-f36d-4fd1-98f2-4327ceea530e` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T20-07-12-261Z-live-app-smoke.md`, production UI smoke `tmp/qa-runs/live-smoke/production-ui-smoke.json`, and QA report `ops/qa-runs/2026-06-10-operations-full-qa.md`.
- [x] Complete the BNA internal-first CRM/workspace connector pass: Operations is now the canonical CRM/workflow/calendar/task/communication/provider/settings shell with Platform, BNA School, and Rabbi Sheller Provider workspaces; persisted workspace settings, connector settings, internal calendar events, pipeline cards, internal dialogue, and typed bot action logs; manual/test/not-configured connector states for email identities, WhatsApp, social, Google Calendar/Classroom, Rabbi video/library, and disabled legacy CRM legacy reference; role-aware nav and scoped provider access; settings tabs that load promptly without unrelated CRM hydration; and local/live desktop/mobile portal smoke coverage. Verified with `node --check server.js`, Operations script parse, focused tests 49/49, `npm test` 220/220, local Operations/portal Playwright smoke `ops/playwright-smokes/2026-06-10T19-23-57-000Z-bna-operations-crm-local/report.md`, `npm run screenshot`, Lighthouse report `lighthouse-report.html` (scores: performance 68, accessibility 84, best-practices 100, SEO 100; CLI exit was Windows temp cleanup after report write), Railway deployment `86d727fc-1b09-4b90-847f-479506f665d4` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T19-29-39-508Z-live-app-smoke.md`, and production Operations/portal Playwright smoke `ops/playwright-smokes/2026-06-10T19-31-30-000Z-bna-operations-crm-production/report.md`.
- [x] Build the BNA Operations SaaS/CRM redesign: shipped the global workspace shell with nested left subnav, top bar/breadcrumbs, Dashboard, Service Providers, Communications, API Usage, Team/Admin, Settings, clean query-addressable detail surfaces, parent/student/provider portal IA cleanup, Hebrew/RTL portal support, guarded not-configured states, faster task API/query handling, and immediate Operations shell rendering for slow data hydration. Verified with `node --check server.js`, `npm test` 219/219, local Playwright smoke `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/report.md`, Railway deployment `13d594d3-42ff-4df3-8c06-7c9ad1b9ec6b` SUCCESS, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T16-01-05-691Z-live-app-smoke.md`, and production Playwright smoke `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/report.md`.
- [x] Turn Rabbi meeting drop #1 into a One Time build brief: distilled Content job #57 into `tasks-pending/2026-06-10-one-time-rabbi-meeting-build-brief.md` with internal-first platform direction, parent/student/Rabbi admin surfaces, Rabbi stack discovery checklist, platform/login/ownership/Classroom/integration decision gates, implementation slices, and acceptance criteria.
- [x] Implement One Time meeting drops and student navigation cleanup: added structured Rabbi meeting artifacts/tasks from Content job #57, created Meeting Drops artifact #1 with linked tasks #417-#422, added Decision Required follow-ups for legacy CRM/internal stack and access model, compact student list/workspace navigation, mobile hamburger full navigation page, light student workspace polish, tests, Railway deployment `5c96321e-1759-4cdb-9541-3920d4fa518b`, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T14-20-47-965Z-live-app-smoke.md`, and production Playwright smoke `ops/playwright-smokes/2026-06-10T14-21-37-287Z-one-time-meeting-student-nav-live-structured/report.md`
- [x] Convert the One Time/Rabbi roadmap into scheduled task work and Team tickets: removed the separate Roadmap Operations section for scoped users, added Tasks > Schedule for planned/due One Time proposal work, backfilled proposal workflow task metadata/details, renamed Support to Team/Tickets & Messages, kept Rabbi as a limited project admin without programming controls, updated the shared UI shell to crisp black/white/gold, fixed Railway to bind the app on `0.0.0.0`, deployed Railway `35707ab0-1069-44e3-a34d-0a062ca7833c`, and verified with `npm test` 204/204, Railway doctor, live app smoke `ops/live-smokes/2026-06-10T13-03-37-257Z-live-app-smoke.md`, OpenAI smoke `ops/openai-smokes/2026-06-10T13-04-44-064Z-openai-sidekick-smoke.md`, and live Playwright visual smoke `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/report.md`
- [x] Apply app-wide BNA brand shell and million-dollar SaaS UI polish: live task #402 is done/verified; app-wide light BNA brand shell/topbars, Operations provider directory UI, parent/student/provider portal brand bars, Telegram UI-intent parser guard, `npm test` 204/204, Railway deployment `56747aa2-6dd8-41ad-96a8-2846097e46d8`, live app smoke, and desktop/mobile Playwright smokes passed
- [x] Generate Sefaria source sheets from every class transcript: live task #322 is done/verified; produced `content-memory/source-sheets/2026-06-10-transcript-wide-class-source-sheets.md` with transcript coverage, direct Sefaria links, source maps, review notes, and verified URL/link checks
- [x] Add sourced bibliography workflow for public content videos as a second stage: live task #323 is done/verified; Content Research now creates `public_content_bibliography` tasks and stores outputs under `content-memory/public-bibliographies/` after tests, deploy, Railway doctor, app smoke, and live bundle readback
- [x] Map and build the service-provider login and parent-facing approved-provider directory: provider account/session schema, scoped `/provider` login, provider-only profile/service/class edits held in `pending_review`, Operations provider API, parent approved-provider directory filters for city/type/price/age/capacity/class time, explicit near-me radius geocoder/PostGIS blocker, Rabbi discount display, no-live-billing guardrails, seeded 7:00 Rabbi Scheller Mishnah class, `npm test` 204/204, Railway deployment `56747aa2-6dd8-41ad-96a8-2846097e46d8`, live app smoke, provider portal smoke, and Playwright visual smoke passed
- [x] Build person-detail side menus for students, parents, contacts, and users: live task #328 was corrected from the mislabeled Telegram message 977 capture, implemented with custom side/dropdown section menus for student, parent/contact, lead, and People/user detail views, deployed in Railway `5f0ebd68-5e24-49ee-890e-1c21a329c17c`, and verified with Railway doctor plus live smoke `ops/live-smokes/2026-06-10T05-41-59-944Z-live-app-smoke.md`
- [x] Fix BNA task list project assignment bug: live task #325 is done; generic source-sheet tasks now stay in BNA unless explicitly One Time/Mishnah/Rabbi Elie, task #322 was corrected to BNA, duplicate #324 remains archived, and Railway deployment `0e351331-0fe5-4b27-96c3-d04a22ce0e04` passed doctor/live smoke
- [x] Add Content Research section for uploaded recording topics: Operations Content now has a Research tab backed by class sessions, shows sourceable topics/questions/sources/highlights, and can create Codex source-sheet tasks for whole sessions with Sefaria/source-map requirements; deployed Railway `c72af775-5e41-47cc-ad8c-27d47bd7f047`, Railway doctor, full tests, live app smoke, and live Playwright Content Research smoke passed
- [x] Build Google Classroom worksheet assignment lane: Operations assignment creator from YouTube/material links, worksheet prompt patching, per-student worksheet generation/editing, natural scheduling, optional video-processing jobs, guarded Google Classroom/Calendar sync preview/live action, and student/parent portal assignment display; deployed Railway `6b210aa5-b85a-4328-b2bd-2d41d5c31ed2`, Railway doctor, full tests, live app smoke, and live assignment UI/API smoke passed
- [x] Update public website positioning copy from "boys who don't fit the system" to "boys ready for something more than regular school" in English and Hebrew; deployed Railway `af620276-69c4-47e4-b614-fee15171381a`, Railway doctor/live smoke/live text checks passed
- [x] Import the uploaded YouTube playlist transcript Google Doc into Content: created 23 per-video transcript jobs (#32-#54), bundle #1 `YouTube playlist transcripts 2024`, matching class sessions, transcript exports, a repo bundle brief, and verified Drive content-library sync
- [x] Ship parent/student question sharing with Sefaria source suggestions, goal share toggles, parent responses, and attendance in parent portal; deployed Railway `0dfa1e49-d8b1-4cbc-8ab9-aa6ac061d244`, Railway doctor, live app smoke, and live Playwright smoke passed
- [x] Deploy Operations filter overlays, polished student picker, student daily Goal Board rows/chart/message-rabbi flow, passwordless parent portal access, and duplicate email guards; Railway `6a4bbd52-5c36-467e-b46c-23d31bfeff74`, live app smoke, and live Playwright smoke passed
- [x] Add inline comments inside expanded Operations task details and protect Windows+H dictation/text entry from background dashboard re-renders; live HTML check and live app smoke passed on deployment `ed9b96a0-1a0a-4e23-a6fc-7beb34b4e584` while Railway CLI still reported `INITIALIZING`
- [x] Fix Operations decision-card completion flow: resolved decision cards now leave Decisions, plain decisions close into Done, and selected options that create agent work move to Changelog; deployed Railway `af620276-69c4-47e4-b614-fee15171381a` and live smoke passed
- [x] Update Content prompt feedback workflow so WhatsApp, Facebook, newsletter, website blog, LinkedIn, and YouTube outputs use one correction/regenerate action that patches and versions the saved prompt before regenerating; deployed Railway `a54d62da-0abc-4986-83ae-a5ad3df35d6f` and live smoke passed
- [x] Switch social posting from legacy CRM Social Planner to Buffer for Facebook, LinkedIn, and YouTube; Railway env, server approval path, Telegram bridge copy, Operations buttons, diagnostics, deploy, and live smoke are verified
- [x] Test the WhatsApp-first content lane with a real long video upload
- [x] Re-ingest/audit old raw rambles into the new Tasks / Students / Content / Contacts / Accounting model; live audit now shows 0 active tasks and 0 raw-looking task titles
- [x] Add Telegram student-match decision buttons when accountability capture cannot confidently match a student
- [x] Remove Telegram per-task owner/status buttons and make parser routing explicit in capture replies
- [x] Expand student accountability fields for meeting attendance, goal progress, engagement, follow-up, and next check-in
- [x] Add protected payment reminder preview/dry-run/send controls for Accounting
- [x] Clean Tasks UI so cards open details by click and no longer show raw ramble/test buttons
- [x] Remove bad `Fh` test student/signup from active BNA views
- [x] Tighten WhatsApp/Facebook/weekly-update prompts to English, natural, and not corny
- [x] Complete Google OAuth once and create the live `BNA V2` Drive pipeline folders.
  Proof/source: `ops/agent-changelog.md`.
- [x] Wire `/ingest_drive` in Telegram after Drive folder IDs are available in Railway
- [x] Wire direct Google Drive doc sync commands so Drive Platform Memory docs can update repo `content-memory/`
- [x] Promote approved platform outputs into reusable prompt examples automatically
- [x] Add Content Prompt Studio with prompt versions, examples/files, regenerate, approval, and weekly bundles
- [x] Replace `Active Work` with `Decisions` and keep personal tasks separate from undecided choices
- [x] Remove generic Tasks pending/planned language; open work now stays in Decisions, My Tasks, Changelog Queue, Done, or Archive.
  Proof/source: `ops/agent-changelog.md`.
- [x] Simplify Operations Tasks so machine work is visible inside Changelog from queued to in-progress to verified instead of a separate Codex Queue lane
- [x] Add required 2026-2027 registration document package signature flow from `bnei_neviim_registration_documents_bilingual_codex.md`; do not use the old Student Contract file
- [x] Replace the signup package flow with six separate full-screen document cards/signatures: Tuition Agreement, Parent Handbook, Student Code of Conduct, Safety Waiver, Registration/Intake, and Parent Agreement/Signature Page
- [x] Update signup payment options to first tuition payment by credit, cash, or bank transfer and switch the default Morning payment link to `https://mrng.to/rCH4DWiR5t`
- [x] Deploy latest signup/task UI changes to Railway, set production `PAYMENT_LINK=https://mrng.to/rCH4DWiR5t`, and verify live signup package/bank-transfer UI
- [x] Remove the visible Planned/Implementation Briefs section from Operations Tasks; `tasks-pending/*.md` now stays internal to Codex handoffs
- [x] Rework Content Library into collapsed cards with per-card generation and selected multi-card generation
- [x] Make Telegram content buttons use the same versioned prompt generator as the dashboard
- [x] Configure content generation with provider fallback
- [x] Remove raw natural-language Telegram wording from visible Tasks/Changelog cards
- [x] Add shared Codex task ledger and agent changelog under `ops/`
- [x] Add persistent Telegram `OpenAI API` / `Codex` mode buttons and route ordinary chat to OpenAI API by default
- [x] Add repeatable OpenAI sidekick smoke test for repo, app API, Drive, transcripts, and Telegram access
- [x] Expand Telegram OpenAI sidekick live Operations context so it can answer dashboard section/button/task/accountability/content/contact/accounting/system questions from protected app data instead of only transcripts
- [x] Build autonomous Codex agent fleet supervisor for queued machine work and verifier smokes
- [x] Deploy observable Telegram/bot -> ticket -> task -> Codex job lifecycle with queue APIs, status replies, stale detection, Operations job visibility, and live agent-fleet readback; 2026-06-15 follow-up canonicalized `bna_agent_jobs.status` to `queued`, `running`, `completed`, `failed`, and `blocked_needs_human_decision`, strengthened `tests/observable-codex-queue.test.js`, redeployed Railway deployment `bee86ce8-747b-4287-90e3-bfa86f7077ab`, and live-read `/api/bna/codex-queue/status` with 5 sampled canonical queued jobs.
- [x] Clean Content routing so goals, tasks, and accountability leave Content while class topics and sources stay visible
- [x] Build automatic student accountability tablet-access MVP: bedtime/wake-up agreement fields, self-checkoff auto-approved access sessions, missed-goal lock/accountability review, Operations filters, and student portal access-rule display
- [x] Build project-scoped task collaboration for BNA and One Time Mishnah Class
- [x] Add task comments, Decision Required marker, and One Time category/assignment support
- [x] Add Rabbi Elie Scheller scoped login/access and Telegram agent wiring on the shared framework; live bot startup still needs Rabbi bot token/chat credentials
- [x] Reconcile paid-but-unlinked intake records for Weber/Huda and Galambo/Eitan into admin-created signup rows; missing contact fields are intentionally blank and `needs_signup` intake count is now 0
- [x] Build the content parser beyond WhatsApp: transcript -> tasks, accountability, class notes, parent notes, newsletter snippets
- [x] Add Content section website-blog generation/publish controls so approved recordings/videos/content can become public blog posts on the website
- [x] Add Drive Raw Intake website-image automation so a single dropped image can be approved/pushed into the public website image lane
- [x] Push updated `GOOGLE_DRIVE_PIPELINE_CONFIG` to Railway with Website Images intake and simplified folder metadata
- [x] Stop the elevated stale Telegram poller process PID `178552` and restart the bridge so the newest Telegram research/proactive-insight code is live
- [x] Extend Telegram/day-recording parser to update student accountability and Torah daily goal completion from spoken progress reports
- [x] Harden mixed recording parser routing and compact Content cards: topic-only collapsed cards, expanded detail sections, auto-parse triggers, and duplicate-safe filing
- [x] Add first-pass mixed recording parser: content job -> tasks, student accountability, class notes, and group-goal entries with fallback review report
- [x] Add edit/regenerate flow for platform drafts through tracked prompt versions
- [x] Add legacy CRM Facebook draft creation from approved content outputs
- [x] Verify the live legacy CRM Facebook publish path with a real post: Content output #52 is published as Facebook reel `6a26eb3dc39f87e2e6cf9f34`, and future draft/publish actions now store legacy CRM post readback metadata.
  Proof/source: `ops/agent-changelog.md`.
- [x] Add blog-create flow later, after the WhatsApp lane is reliable; first-party website blog publishing is live
- [x] Add approval rules and safer target-selection for multi-account publishing
- [x] Build separate Drive `Website Moments Intake` lane that auto-adds approved images to the homepage carousel
- [x] Audit and fix live Torah group progress drift; public and admin summaries now show 15 percent for all five students and trip locked
- [x] Build daily progress update flow for the 30-page trip goal
- [x] Update homepage 30-page trip goal progress to 3.5/30
- [x] Remove public text panels from homepage Learning Moments carousel while keeping internal metadata
- [x] Wire OpenAI transcription for Telegram audio/video uploads, including long-video audio chunking
- [x] Add Telegram approve/reject buttons for WhatsApp content drafts
- [x] Add local `media-drop/inbox` ingest path for videos too large to send through Telegram
- [x] Add Google OAuth callback/setup endpoints and Drive pipeline folder generator
- [x] Add Hebrew signup form at `/signup-he.html`
- [x] Add repo-side BNA Brand Kit skeleton
- [x] Add repo-side content memory and make WhatsApp drafts read brand/platform memory plus approved examples
- [x] Align app-side AI config to `kimi-k2.6`
- [x] Set up the Telegram -> local Kimi CLI bridge into this repo brain
- [x] Fix the hosted operations login/session flow and redeploy it. Proof/source:
  `ops/agent-changelog.md`.
- [x] Fix the signup payment flow to `Cash` vs `Credit` and redeploy it.
  Proof/source: `ops/agent-changelog.md`.
- [x] Remove the broken `mailto:` signup fallback that opened the email app
- [x] Wire Telegram media intake into local storage with legacy CRM upload deferred until publish approval
- [x] Add Telegram commands for `/accounts`, `/blogs`, and `/queue`
- [x] Reshape operations dashboard language around Tasks, Students, Content, Contacts, and Accounting
- [x] Finish Telegram UI redesign acceptance follow-up: Contacts now uses compact clickable roster cards with a detail panel instead of a dense table
- [x] Reconcile split Telegram UI redesign messages 425-428: Content, Contacts, and Accounting now use the requested focused subtabs, Student Profile/Content/Prompts/Contacts/Accounting passed final live acceptance, and the bridge buffers split specs into the Codex task context
- [x] Reconcile Braka/Baraka partial Green Invoice payment: signup #7 now shows ILS 800 paid by Green Invoice transaction DP488806585 on 2026-06-01 09:16, ILS 200 remaining, and payment-intake #7 is matched instead of needs_signup
- [x] Convert the public homepage Blog section into a one-row horizontal carousel so only three desktop cards show at a time and the rest scroll instead of taking over the page
- [x] Audit hidden/internal work surfaces after the operator's "are things forgotten?" check and record the current live task/blocker state in `ops/system-audits/2026-06-07-forgotten-work-and-accounting-audit.md`
- [x] Merge Accounting duplicates by hiding already-matched payment-intake rows from the roster; live Accounting now shows exactly five family/student payment rows and `Needs signup` is 0
- [x] Add required signup Tuition Agreement modal/signature flow with signer name/email, server timestamp, client click timestamp, agreement version, and detailed signature record storage
- [x] Add homepage schedule section, 30-page trip goal progress bar, and Learning Moments carousel
- [x] Update homepage 30-page trip goal progress from 2/30 to 3/30 and file it as Changelog task #33
- [x] Replace reused carousel placeholder images with three new forest images from Drive Raw Intake
- [x] Add `SYSTEM-STATE.md` so Telegram/Kimi can understand recent Codex work like "the image slider"
- [x] Add `npm run learning:progress -- <pages>` for repeatable homepage progress updates

## Next

- [x] Build the Provider Commercial Model, Entitlements, and Pre-Integration Provider Setup layer: shipped free listing, paid managed setup, school/micro-school workspace, and revenue-share partner modes; provider status/commercial model/source-of-truth/integration fields; entitlement, integration, access-checklist, onboarding, and public CTA structures; Rabbi Sheller as the active revenue-share provider with Replit/Vimeo external delivery pending access; public `/providers/join`; and active-provider-only commercial admin UI. Verified with tests, screenshots, Railway deployment `ddc13990-3e9c-4b4a-872c-3cc498b25dc7`, live smoke, focused provider UI smoke, and live browser onboarding workflow. QA report: `ops/qa-runs/2026-06-11-provider-commercial-model.md`.
- [x] Agent fleet: audit and backfill the missed Telegram ingestion around messages 645-646, explain why it failed, fix the routing gap if needed, and report completion to Telegram (live task #220)
- [x] Add Telegram-driven Remotion source-video editing: `/edit_video`, `/edit_drop`, direct small upload captions, source timeline composition, and render-return path
- [x] Run the first operator-directed plain-English Remotion video edit from an available source clip and verify the rendered MP4 output; fallback source used because no fresh non-generated clip was present.
  Proof/source: `ops/agent-changelog.md`.
- [ ] Build BNA Organic Clip Factory: ingest Drive/local image and video folders, auto-inventory assets, generate 22-second vertical Remotion clips with 2-second image chunks, captions/transcript overlays, transitions, background music, and a final flyer/update card, plus a CapCut handoff pack/prompt for manual finishing
- [ ] Produce first BNA `Set your son free` daily-video intro clip: use the 4K Downloader audio segment from 1:10-1:27, 4-5 slow-motion boy clips from local/Drive sources such as drums and cooking, pan/zoom transitions, top title overlay, and a roughly 15-second intro render
  Source/handoff: `tasks-pending/2026-06-17-watchdog-backlog-cleanup.md`; create
  a dedicated media handoff before implementation.
- [x] One Time: map first-party BNA Operations capability for the Rabbi Sheller
  platform before external writes: completed
  `ops/one-time-mishnah/first-party-capability-map.md` covering contacts, tags,
  pipelines/opportunities, calendars/classes, payments/access, workflows,
  community/membership support, social/content posting through Buffer,
  WhatsApp/WAPI, no-GHL policy, browser-only Rabbi-owned gaps, and external-write
  acceptance gates. Verified with focused One Time/audit tests 41/41, full
  `npm test` 420/420, and `git diff --check`; no deployment required.
- [x] One Time: turn the partnership proposal into a drafting pack for Claude
  or another writing assistant: completed
  `ops/one-time-mishnah/partnership-drafting-pack.md` and
  `tests/one-time-partnership-drafting-pack.test.js` covering a cleaner
  agreement draft, values checklist, refund/cancellation policy options,
  family/device/Zoom/access rules, landing-page copy, launch emails, and
  reactivation copy. Verified with focused One Time/drafting tests 48/48, full
  `npm test` 424/424, and `git diff --check` with only existing LF/CRLF
  warnings; no deployment required because this is local documentation/test
  coverage only.
- [x] One Time: convert the Green Invoice vs Stripe and refund/cancellation
  blocker into an approval-ready billing policy packet: expanded
  `ops/rabbi-scheller/green-invoice-billing-options.md` with provider-of-record
  rules, Green Invoice/Stripe/manual-bridge options, required billing
  decisions, refund/cancellation options, exact approval phrases, and no-live
  write guardrails. Updated `tests/rabbi-scheller-audit-docs.test.js` to lock
  the packet. Verified `node --check tests/rabbi-scheller-audit-docs.test.js`,
  focused doc tests 4/4, and full `npm test` 444/444. No deployment required;
  actual checkout/access implementation remains blocked until Shloimie chooses
  provider, prices, policy, access start, failed-payment handling, and rollback.
- [x] Goal-mode follow-up: add the phase-by-phase completion/blocker matrix at
  `ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md`, covering
  phases 0-16 from the original 2026-06-14 brief, status labels, evidence,
  owner/connector blockers, and approval phrases for Google live adapters, One
  Time member-library publishing, One Time billing/provider policy, and Buffer
  social drafts. Added `tests/goalmode-completion-matrix.test.js`; verified
  focused matrix tests 2/2 and full `npm test` 444/444. No deployment required.
- [x] Goal-mode follow-up: add the owner approval unblocker pack at
  `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md`, collecting
  copy-paste templates and required fields for Google live adapter smoke, One
  Time member-library publishing smoke, One Time billing/refund policy,
  Buffer/social draft or publish, and Rabbi live app access confirmation.
  Added `tests/goalmode-owner-approval-unblocker-pack.test.js`; focused pack
  tests passed 2/2. No deployment required and no live writes performed.
- [x] One Time: design the Rabbi content/media intake workflow from Drive drops
  into recordings, source sheets, worksheets, question digests, organic clips,
  ad candidates, approval, posting, and reporting: completed
  `ops/one-time-mishnah/content-media-intake-workflow.md` and
  `tests/one-time-content-media-intake-workflow.test.js`. Verified with
  focused One Time/content tests 46/46, full `npm test` 422/422, and
  `git diff --check` with only existing LF/CRLF warnings; no deployment
  required because this is local documentation/test coverage only.
- [x] One Time: deploy Rabbi-facing Class Media intake with manual hosted URLs:
  corrected Rabbi Elie Scheller provider scoping to
  `one_time_mishnah_class`, added provider-portal `Class Media`, added
  provider-authenticated POST/PATCH class-media APIs with dry-run support,
  persisted real submissions to One Time `bna_content_jobs` and internal output
  lanes, wired class-session readback and Operations provenance/readiness
  labels, and kept upload/publish/send/access/external writes blocked. Verified
  with focused tests 25/25, full `npm test` 432/432, local API/browser smoke,
  Railway deployment `2d58bd61-d3a7-477b-adee-b8eac5fd9599`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T05-32-09-348Z-live-app-smoke.md`, and live
  dry-run endpoint smoke
  `ops/live-smokes/2026-06-15T05-34-00-000Z-one-time-class-media-intake-live-smoke.md`.
- [x] One Time: ship first-pass external Rabbi portal/ticketing: generated scoped One Time Operations login, deployed `one_time_admin` project scope, Team tickets and Tasks > Schedule instead of a separate Roadmap section, project-scoped task/comment/parent/student/support-ticket APIs, final proposal task scheduling/workflow metadata seeding, and scoped Telegram support-ticket capture. Railway deployment `35707ab0-1069-44e3-a34d-0a062ca7833c`, Railway doctor, live smoke `ops/live-smokes/2026-06-10T13-03-37-257Z-live-app-smoke.md`, OpenAI smoke `ops/openai-smokes/2026-06-10T13-04-44-064Z-openai-sidekick-smoke.md`, and focused One Time live visual smoke passed.
- [x] Add self-serve provider portal credential setup for public provider join:
  created safe provider usernames, provider setup tokens, setup email delivery,
  `/provider?setup=...` password setup, provider session entry, and Operations
  resend setup email. Deployed Railway
  `f8e8a7bb-52f5-4427-bc50-2f6e70e8d40e`; focused tests, full `npm test`
  376/376, Railway doctor, live app smoke, and live provider readback passed.
- [x] One Time: finish broader Users/account management UI under Shloimie
  super admin, beyond the first scoped Rabbi login: deployed Admin > Users /
  External Access with external users separated from parent accounts, guarded
  short-lived Operations access-link creation for configured login usernames,
  and explicit no-send/no-billing/no-member-library/no-external-write
  guardrails. New external-user creation/editing remains disabled until a
  dedicated persistence workflow is approved. Verified with Operations inline
  script parse, focused Operations/One Time tests 41/41, full `npm test`
  426/426, local browser smoke
  `ops/playwright-smokes/2026-06-15-admin-users-local/report.md`, Railway
  deployment `8d87ea87-8034-4533-85f7-71b70e99ccb5`, Railway doctor SUCCESS,
  live app smoke `ops/live-smokes/2026-06-15T04-38-14-284Z-live-app-smoke.md`,
  and focused live smoke
  `ops/playwright-smokes/2026-06-15-admin-users-live/report.md`.
- [ ] One Time: finish live Rabbi bot runtime by collecting the confirmed Rabbi chat ID, setting `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, choosing/starting the hosted bridge worker for `npm run telegram:rabbi`, and smoking `/status`, task/comment, and ticket creation; scoped One Time username/password are now installed locally and on Railway
- [x] Live task #260: Fix parent access link and polish parent/student dashboards; direct parent links, student daily/source display polish, weekly private meeting slots, parent financial/attendance dashboard, July registration-renewal safeguards, deployment, Railway doctor, live app smoke, and targeted production portal smoke passed
- [x] Fix Operations parent-login link handoff so the emailed parent portal link opens directly for the parent email on file without requiring the parent to type the email again; keep email copy, make clipboard failure non-blocking, and verify parent session creation. Deployed Railway `ccd3c5a4-5776-4382-b2e1-a365a459c960`; live smoke and targeted parent/student HTML checks passed.
- [x] Polish student portal daily display/filtering: Hebrew source refs even in English UI, collapsible question/resource cards, clearer goal filters for today/upcoming/waiting/done, and meeting/message-rabbi visibility. Proof: `ops/agent-fleet-runs/2026-06-09T20-00-23-763Z-task-260.md`.
- [x] Assign weekly private meeting slots for all active boys between 9:00 and 10:00, one student per weekday while roster is five boys, then show the meeting day/time in student and parent portal dashboards. Proof: `ops/agent-fleet-runs/2026-06-09T20-00-23-763Z-task-260.md`.
- [x] Build parent dashboard financial/attendance panel: today's attendance, overall attendance, up-to-date/payment state, parent-visible financial reminders, and bottom WhatsApp button to Rabbi Shloimie. Proof: `ops/agent-fleet-runs/2026-06-09T20-00-23-763Z-task-260.md`.
- [x] Prepare and test July 1 registration-renewal email/flow: existing emails can resubmit signup, sign all documents/handbooks/agreements, receive yearly/prorated billing copy, and get the correct credit-card link once the old/new payment links are confirmed. Proof: `ops/agent-fleet-runs/2026-06-09T20-00-23-763Z-task-260.md`.
- [ ] Add internal/external accountability filters and parent agreement inputs: distinguish BNA school students from external accountability people, show boy/girl/external grouping, and let parents add bedtimes/child agreements tied to parent/Rabbi weekly meeting schedules; coordinate with the active filter/dropdown agent and do not overwrite their filter refactor
  Handoff/source: `tasks-pending/2026-06-09-parent-student-dashboard-registration-followup.md`.
- [x] Live task #311: Audit Telegram bot button/API coverage for Goal Board and parent accountability fields; Telegram text/media routing now preserves sections, subsections, checklists, bedtime agreements, consequences, incentives, parent meeting summaries, and reviewed student visibility while keeping parent recordings out of Content jobs
- [ ] Add Shotstack or Creatomate credentials and render adapter for cloud/platform-specific video edits if local Remotion rendering is not enough; blocked until a cloud-render provider is chosen and credentials exist
  Blocked pending external provider choice/credentials; source:
  `tasks-pending/2026-06-17-watchdog-backlog-cleanup.md`.
- [x] Add first-pass selected-content generator so Newsletter/Facebook/WhatsApp/etc. can use multiple recordings with the same saved prompt
- [x] Add richer weekly newsletter review/edit workflow after bundle generation is reliable; live dashboard now supports review bundles, source lists, draft edit/save, regenerate, approve/example, and archive without sending email
- [ ] Add guarded weekly newsletter recipient preview, test-send, and typed-confirmation live send after parent recipient list/approval rules are confirmed
- [ ] Rotate/renew the Buffer `BNAv2` API key before it expires on 2026-07-09 and update Railway/local secrets without committing the key
  Blocked pending external Buffer/Railway keyholder access and explicit secret
  rotation approval; source: `ops/agent-task-ledger.jsonl`.
- [x] After the next intentional Railway deploy, verify the latest deployment
  record no longer points at stale bad deployment
  `47f8d5d1-c425-4a79-8e31-ec4cb71f5dcc`: verified 2026-06-15 with
  `npm run railway:doctor`. Railway now reports service `skillful-motivation`,
  deployment `988985c6-f310-4f84-b169-85878aa16d3c`, status `SUCCESS`, and the
  doctor passed for production.
- [ ] Call Hillel's rabbi about whether to keep his learning approach inspiration/connection-first before moving him into text-based learning (live task #172)
  Source: `ops/system-audits/2026-06-17-prompt-intake-register.md`.
- [ ] Set up updated payment links: new signups immediate charge then first-of-month 12-payment schedule; existing credit-card parents first-of-month link with no immediate charge (live task #173)
  Blocked pending payment-provider links/owner approval; source:
  `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`.
- [ ] Update `www.bneineviimacademy.org` DNS/Railway custom-domain setup so the www address gets a valid certificate or redirects cleanly (live task #194)
  Blocked pending external registrar/Railway custom-domain access; source:
  `ops/agent-task-ledger.jsonl`.
- [x] Build first-pass Contacts `Interested Parents` CRM lane with BNA-owned lead status, lead category, interest level, tags, notes, next follow-up, historical legacy CRM linkage fields, and a separate Communications log; seeded Adina Block and Sari Kaplan as school-interest leads
- [x] Add hosted-media URL support for Buffer social posts so Telegram/Content
  photos and videos can attach to Buffer drafts instead of creating text-only
  drafts: deployed Railway `a6c7b3a4-0e2c-456a-9a26-f93af982f2fa`.
  Buffer `createPost` now sends direct hosted image/video URLs through the
  current ordered `assets` array, records media attachment metadata, rejects
  local paths and Drive/Dropbox preview links before a Buffer write, and keeps
  binary hosting/upload out of BNA. Verified with focused Buffer/One Time/Google
  tests, full `npm test` 484/484, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-15T07-40-12-729Z-live-app-smoke.md`, and no-write
  hosted-media preview smoke
  `ops/live-smokes/2026-06-15T07-41-24-838Z-buffer-hosted-media-preview-live-smoke.md`.
  Actual Buffer draft/publish still requires approved source, channel/account,
  schedule, rollback/no-post policy, stable hosted media, and
  `APPROVE_BUFFER_SOCIAL_DRAFT`.
- [x] Build WAPI/Whapi WhatsApp lead-candidate review importer: audit recent
  WhatsApp contacts into reviewable first-party candidates, match current
  parents first, and avoid any external CRM writes. Deployed Railway
  `988985c6-f310-4f84-b169-85878aa16d3c`: WAPI phonebook correction preview
  now plans a local `bna_parent_leads` `create_lead_candidate` write only for
  unmatched school/content/group-interest WhatsApp contacts; existing
  lead/signup/student matches are skipped to avoid duplicates. Confirmed apply
  remains gated by `APPLY_WAPI_CORRECTION`, writes only first-party BNA rows,
  and never sends WhatsApp or writes an external CRM. Verified with focused
  WAPI/Whapi tests 13/13, full `npm test` 488/488, Railway doctor, live app
  smoke `ops/live-smokes/2026-06-15T07-48-33-953Z-live-app-smoke.md`, and
  no-write WAPI lead-candidate preview smoke
  `ops/live-smokes/2026-06-15T07-49-22-656Z-wapi-lead-candidate-preview-live-smoke.md`.
- [x] Build WAPI/Whapi WhatsApp conversation history sync for Contacts cards: expanded parent and interested-parent cards now render safe local contact communication history matched by record ID, normalized phone variants, email, and WAPI source context, using the existing first-party communications/Whapi import path. Deployed Railway `7a866693-367d-4c1d-81d2-f6e8c60f4288`; full `npm test` 417/417, live app smoke `ops/live-smokes/2026-06-15T03-54-38-056Z-live-app-smoke.md`, and focused live smoke `ops/playwright-smokes/2026-06-15-contact-wapi-history-live/report.md` passed with zero write/send requests.
- [x] Confirm whether the intended Wappy product is `wappy.chat` or `wappy.ai`,
  and verify number portability, WhatsApp Business API access, webhooks/API
  export, Zapier/Pipedrive timing, AI automation, and data ownership before
  choosing any future WhatsApp connector: completed local no-write decision
  packet at `ops/communications/wappy-connector-decision-packet.md`.
  Current decision is not to select Wappy yet. `wappy.chat` publicly reads as a
  website WhatsApp widget with an AI Chat add-on; `wappy.ai` publicly reads as
  an AI-agent WhatsApp workflow product, but neither has enough public API,
  export, number-model, compliance, ownership, or rollback evidence to become a
  BNA runtime connector. Active BNA WhatsApp work remains Whapi/WAPI
  import/readback/correction preview only. No Wappy env vars, API client,
  webhook route, dashboard control, Telegram command, send, broadcast, external
  CRM write, or connector switch was added.
- [x] Redesign Operations section top controls into compact subcategory count buttons plus open date/status/category/tag filters, removing duplicate large count cards across Tasks, Students, Content, Contacts, and Accounting
- [x] Implement Drive Raw Intake website-image watcher from `tasks-pending/2026-06-03-website-moments-and-parser-routing.md`
- [x] Archive stale family-accountability docs and dormant Next/Supabase code paths; retained legacy files now live under `docs/archive/` and are marked historical reference only
- [ ] Decide whether the long-term runtime stays Express or moves fully to Next
  Decision blocker/source: `PROJECT-NOTES.md`; handoff/source:
  `tasks-pending/2026-06-17-watchdog-backlog-cleanup.md`.
- [ ] Rebuild the operations dashboard against one canonical API surface
  Handoff/source: `tasks-pending/2026-06-16-ops-workflows-lanes-calendar-routing.md`.
- [x] Add smoke tests for login, task APIs, signup submit, and contact sync
- [x] Configure Green Invoice webhook logging, reconciliation, and manual reprocess path
- [ ] Verify Green Invoice sender-side webhook delivery/log settings once account access is available; app-side receiver/log/reprocess path is complete
  Blocked pending Green Invoice account access; source:
  `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`.
- [x] Clean Green Invoice app route so only one live `/api/webhooks/green-invoice` handler processes production webhooks
- [x] Fix Railway deploy bundle so `src/` library imports are included in production
- [x] Add a bot command to trigger Railway deploys and smoke checks from Telegram (`/railway_deploy`)

## Blockers

- [x] First-party website blog posting is live; an external CRM blog site is no longer required for BNA website articles
- [x] Buffer social account lookup is the active social scheduler path for Facebook, LinkedIn, and YouTube
- [x] Content approval no longer depends on the old default Facebook account env var; ambiguous social posting should resolve through Buffer channel/account selection
- [ ] Google posting needs explicit alias selection because multiple Google accounts are connected
  Blocked pending alias decision; source:
  `tasks-pending/2026-06-14-google-onboarding-helper-crm-workspace-followup.md`.
- [ ] Rabbi Elie scoped Telegram bot token is configured locally and in Railway, with `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`; the One Time Drive folder and scoped Operations login are set up and smoke-tested, but live bot startup intentionally blocks until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is confirmed and a hosted bridge runtime for `npm run telegram:rabbi` is chosen/started
- [ ] Real Android/tablet shutoff requires a physical test tablet plus confirmed QStudio/Qustodio/Headwind/FreeKiosk credentials; app-side device control is mock-only until then
- [ ] Green Invoice sender-side delivery logs/settings require access to the Green Invoice account; app receiver, logs, idempotency, and reprocess are already built
  Blocked pending Green Invoice account access; source:
  `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`.
- [ ] Cloud video rendering requires choosing/provisioning Shotstack, Creatomate, or another provider if local Remotion is not enough
  Blocked pending external provider choice/credentials; source:
  `tasks-pending/2026-06-17-watchdog-backlog-cleanup.md`.
- [x] Unsynced paid intake records were reconciled into admin-created signup rows; unknown parent contact fields are intentionally blank instead of blocking the Accounting roster
- [x] Voice/audio transcription is wired through the content ingestion path
- [x] External CRM blog posting is not required for first-party website blogs; Buffer remains the social distribution connector

## Recent Wins

- [x] Deployed One Time member-library publishing slice: Operations Content >
  One Time Library now has a Class Package Manager for `bna_class_sessions`,
  Vimeo/manual hosted URLs, linked worksheets/source sheets, explicit
  visibility/tier publishing, rollback, and smoke. Public `/member-library`
  reads only active-code, tier-visible, published safe fields. Railway
  deployment `16920b4a-751a-4ee3-8534-9193a2739a7c`, full `npm test` 470/470,
  live app smoke
  `ops/live-smokes/2026-06-15T07-09-28-789Z-live-app-smoke.md`, and focused
  member-library smoke
  `ops/live-smokes/2026-06-15T07-10-48-018Z-one-time-member-library-live-smoke.md`
  passed. No real Vimeo upload/API, Drive/video-host write, email, WhatsApp,
  Buffer/social, checkout/billing, external CRM, public forum, or student
  goal-checkoff merge was added.
- [x] Deployed One Time thumbnail preview UI: Operations Content > One Time Library cards now show a `Thumbnail Preview` panel from `thumbnail_brief` metadata, parsed metadata, or job thumbnail/image URL fields, with an `Open Thumbnail` link and a missing-thumbnail state. Railway deployment `85107895-5677-4580-b3f6-7d91c1e70025`, doctor, full `npm test` 409/409 before deploy, live app smoke `ops/live-smokes/2026-06-15T01-24-36-196Z-live-app-smoke.md`, and renderer-based live Playwright smoke `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md` passed. This is display-only and performs no thumbnail generation/upload, member-library publish, send, access grant, Drive/video-host write, Buffer action, or external CRM write.
- [x] Deployed the private Operations in-app notification center: `bna_in_app_notifications` and no-send notification preferences now back Dashboard > Alerts, with read/unread/archive controls and hooks for onboarding, support tickets, ticket processed drafts, Rabbi content review, and One Time question moderation. Railway deployment `a3c49708-8c22-462a-bb88-60b43abd94c2`, doctor, full `npm test` 399/399, live app smoke `ops/live-smokes/2026-06-15T00-27-55-812Z-live-app-smoke.md`, and focused live notification smoke `ops/live-smokes/2026-06-15T00-30-00-000Z-notification-center-live-smoke.md` passed. External sends/writes remain locked behind future explicit approval.
- [x] Deployed One Time app/admin/member-library access readiness: Operations Settings > Drive / Social Intake now shows `One Time App Readiness`, and `GET /api/bna/one-time/app-access-readiness` returns read-only blockers with no-write flags. Railway deployment `55102a5c-f6a6-4866-aacf-d0086ba6b909`, doctor, full `npm test` 388/388, live app smoke `ops/live-smokes/2026-06-14T23-05-50-938Z-live-app-smoke.md`, and live Playwright smoke `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-live/report.md` passed. Actual One Time admin/app/member-library writes remain blocked until owner-approved access, destination, media, billing/access, rollback, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` are explicit.
- [x] Deployed Google Classroom topic/material preview: Operations Settings > Google Workspace > Google Classroom now has a `Topic/material` dry-run button wired to `classroom_topic_material_preview`, and Telegram routes Classroom material/topic requests. Railway deployment `72a371b8-50b7-48c8-8cf7-f3efa7b1f8a4`, doctor, full `npm test` 385/385, live app smoke `ops/live-smokes/2026-06-14T22-09-44-742Z-live-app-smoke.md`, and live Playwright smoke `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-live/report.md` passed. The action performs no Classroom read/write, internal write, send, external write, or live Google API call.
- [x] Deployed open service-provider join: `/providers/join` and provider signup APIs now create active free listings and provider workspaces immediately, with an approved default service row for directory visibility. BNA can pause/reject/archive later; no checkout, billing, payout, email, WhatsApp, or social automation is enabled by provider join. Railway deployment `9333f378-1565-475f-a938-3cefd96a3e0b`, doctor, live app smoke, and live provider-join HTML check passed.
- [x] Create the full UX click-map audit package without redesigning the app: captured and organized 2,237 live screenshots across desktop, laptop, tablet, mobile, and small-mobile; generated `manifest.json`, `screenshots.csv`, `actions.csv`, `routes.csv`, `flows.csv`, `issues.csv`, navigation map, role/workspace matrix, context-clarity failures, button/action audit, mobile audit, top findings, implementation backlog, and screenshot index at `ops/ux-audit-runs/2026-06-11-click-map/`; mirrored the folder to Google Drive `BNA UX Audit / 2026-06-11 Click Map` with 2,273 uploaded files and 0 upload failures.
- [x] Deployed parent-driven accountability and Hebrew parent portal defaults: parent chat/meeting uploads can create parent-visible, student-hidden pending-review Goal Board items with sections/subsections/checklists/agreements/consequences/incentives; parent portal has Hebrew/English toggle, Hebrew/RTL default from Hebrew tags, goal section/status filters, parent parser instructions, and multi-file/folder meeting upload. Live Menachem goal #81, Esti external record #53986, and Amitai Kosofsky Hebrew tags were verified. Railway deployment `b086984f-904f-458f-8a2e-759a1dd4db3a`, Railway doctor, and live app smoke passed.
- [x] Restored the installed phone/PWA app so it opens Operations while normal browser visits to `/` still show the public website; deployed Railway `9033bcc2-b822-472b-bcae-087becc6140e`, Railway doctor, live app smoke, live manifest/redirect checks, and live mobile Playwright Operations smoke passed.
- [x] Updated live Dratler accountability records: Menachem Mendel Dratler now syncs to Ahuva Dratler for parent portal access, signup #8 preserves prior Shloimie contact details in notes, Esti Dratler was added as a separate external accountability record with a private access code, and Ahuva parent-login link generation was verified without sending email.
- [x] Clarified Operations parent portal buttons after deployment: parent records now show `Open Parent Portal` for Shloimie inspection/copy with no email sent, `Email Login Link` for emailing the parent, and `WhatsApp Login Link` for confirmed WhatsApp send. Railway deployment `017f1a95-ccb1-477e-bb0a-3c414bf34ac8` reached SUCCESS; live app smoke and authenticated Operations HTML checks passed.
- [x] Fixed and deployed the parent portal access-link handoff: Operations email/WhatsApp login links now use the parent email on file, clipboard failures no longer make a sent email look failed, parent link-opening state is visible, lead records can receive portal links, and parent/student source labels prefer Hebrew `heRef`. Student portal question cards and goal cards are collapsible, with today/waiting goals opened by default. Railway deployment `ccd3c5a4-5776-4382-b2e1-a365a459c960` reached SUCCESS; `npm test`, live app smoke, and targeted live HTML checks passed.
- [x] Re-fixed the Content prompt feedback regenerate flow on 2026-06-09: the bottom action now reads `Apply Correction + Regenerate`, shows an inline patch/regenerate waiting state, preserves correction text on errors, updates the draft in place from the API response, and refreshes the patched prompt text; deployed to Railway and live smoke `ops/live-smokes/2026-06-09T18-01-36-963Z-live-app-smoke.md` passed.
- [x] Re-fixed the public homepage/PWA regression on 2026-06-09 after later changes restored the Operations manifest at `/manifest.json`. Live `/manifest.json` is public again, `/operations-manifest.json` is Operations-only, stale `/operations?source=pwa` redirects to `/`, and live smoke passed.
- [x] Added and deployed Tasks `Torah Research` category for halacha/source lookup questions: mixed recordings now route marked halacha research questions to Codex-owned Torah Research tasks with Sefaria search/API instructions, direct Sefaria-link requirements, source maps, source summaries, and open points for Shloimie/rav review; student philosophy/hashkafa questions stay in Student Questions/class notes. Railway deployment `8181117e-0d32-4127-b96f-52fac247e081` reached SUCCESS.
- [x] Deployed Operations-wide dropdown filter cleanup: Tasks, Students,
  Content, Contacts parent roster, Contacts interested-parent leads, and
  Accounting now use compact dropdowns for variable filters such as category,
  project, status, payment, tags, media, method, source, interest, and
  accountability state, while date choices remain compact chips. Railway
  deployment `bdbcd6d9-a1df-4671-96c3-9dea7d429135` reached SUCCESS and live
  smoke `ops/live-smokes/2026-06-09T06-21-28-612Z-live-app-smoke.md` passed.
- [x] Deployed first-pass Contacts Interested Parents CRM: live Contacts now has `Interested Parents` and `Communications` subtabs, school/content/group lead categories, lead status/interest filters, notes/touchpoints, quick follow-up/status actions, and seeded school-interest leads for Adina Block and Sari Kaplan. Railway deployment `c79744c8-94ca-42bc-a889-637084075f00` reached SUCCESS, live smoke `ops/live-smokes/2026-06-09T06-15-10-568Z-live-app-smoke.md` passed, and production UI/API checks confirmed both leads and notes.
- [x] Deployed inline Contacts parent cards and compact tag dropdowns: parent
  cards now open their own full detail in place, the tag filter is one dropdown,
  existing tags can be applied from the expanded card, and the future WhatsApp
  conversation-history sync is explicitly tracked as separate work. Railway
  deployment `f7307ad7-3c44-4e96-8342-47b49fe8c837` reached SUCCESS and live
  smoke `ops/live-smokes/2026-06-09T06-07-33-468Z-live-app-smoke.md` passed.
- [x] Deployed the Operations-wide compact subcategory/filter cleanup: Tasks, Students, Content, Contacts, and Accounting now show counts once in the top subcategory buttons, open section filters underneath, and no duplicate large count cards. Railway deployment `7cba3b98-cd37-4059-9f10-87d20c6e09bd` reached SUCCESS and live smoke `ops/live-smokes/2026-06-09T05-35-48-705Z-live-app-smoke.md` passed.
- [x] Built and deployed the BNA agent watchdog on top of `agent-fleet-supervisor.mjs`: `npm run watchdog:once/start/status`, `.runtime/watchdog` locks/state, timestamped `ops/system-audits/*-watchdog` reports, live `/api/bna/agent-fleet/status` watchdog details, soft stale-task repair rules, Telegram alert deduping, and Railway doctor visibility. Railway deployment `84c9e8b3-00ac-4031-b6e6-12629a6725c9` reached SUCCESS.
- [x] Restored Android/PWA Operations launch while keeping the public `.org` root as the website. `/manifest.json` and `/operations-manifest.json` now start at `/operations`, standalone root launches redirect to `/operations`, stale `/operations?source=pwa` shortcuts stay in the Operations login flow, the service worker cache is bumped, and Railway deployment `15de2d24-fedf-4fe1-83b4-461b4805b951` reached SUCCESS with live smoke and live PWA checks passing.
- [x] Corrected the June 7 and June 8 Torah audio parse, added admin-only Student Analysis in Operations, created live follow-up tasks #172 and #173, deployed Railway deployment `39e03acd-7199-4e65-ba88-a5e7fe8043c3`, and verified with `npm test`, OpenAI smoke, live app smoke, Railway doctor, and production Playwright.
- [x] Completed the Telegram UI redesign follow-up for task #130: after the app shell/sidebar/subtabs deploy, Codex removed the student portal Add Goal/configuration UI and collapsed the admin Goal Board creation form behind an Add Goal expander. Railway deployment `54a5e5f4-078a-4ce6-b76d-2f60d022e9f1` passed live smoke `ops/live-smokes/2026-06-07T08-55-35-102Z-live-app-smoke.md` and targeted live student-portal mobile validation.
- [x] Deployed the first-pass BNA Command Center UI cleanup: Operations now has a top Daily Command Center, cleaner task lanes/cards, clearer student accountability/device signal cards, compact Content next-action cards, roster-only Accounting, a simplified student portal command strip, and shared public-page spacing/card polish. Railway deployment `683dc322-538e-4ca0-bdb5-272c194d9861` passed live smoke `ops/live-smokes/2026-06-07T03-00-07-526Z-live-app-smoke.md`.
- [x] Fixed the Operations dashboard `column j.summary does not exist` load error by correcting the content-bundles API summary query; added that endpoint to live smoke coverage and deployed a clearer Task Manager strip with active filters, clear filters, and separate Decisions/My Work/Rabbi/Codex lanes.
- [x] Deployed automatic accountability-based tablet access MVP: students can create bedtime/wake-up agreements, choose the rule/consequence, and a 100 percent checkoff automatically opens the configured approved-access session in the BNA device layer while Q Studio/Qustodio remains the content filter.
  Proof/source: `ops/agent-changelog.md`.
- [x] Fixed the agent-fleet completion gap: deployable app changes now require Railway redeploy plus live doctor/smoke before a Codex task can be marked done; cleaned and closed stuck raw task #99 with a speaker-diarization implementation brief.
- [x] Cleared the live Changelog Queue: the agent fleet completed/verified tasks #43, #49, #65, #72, and #98; Codex manually closed #100 and #101 after adding OpenAI web-search research mode plus proactive-insight prompt rules. Latest smoke reports Active Codex tasks: 0.
- [x] Fixed the cause of the crazy-long Telegram/task output: the agent fleet was writing raw Codex CLI failure output into visible `verification_notes` for task #100. Future failures are summarized, with the full raw log kept only in `ops/agent-fleet-runs/`.
- [x] Added OpenAI Responses `web_search` research mode for Telegram OpenAI questions about current info, APIs, frameworks, YouTube/research needs, SEO/AEO/GEO, and similar research prompts.
- [x] Built the autonomous Codex agent fleet: `scripts/agent-fleet-supervisor.mjs` claims live Changelog Queue tasks, locks them, runs Codex CLI, runs verifier commands including `npm test` and `npm run openai:smoke`, updates task comments, writes `ops/agent-fleet-runs/`, appends the changelog/ledger, and notifies Telegram. Telegram commands added: `/agent_fleet_status`, `/agent_fleet_start`, and `/agent_fleet_once`. Live umbrella task #67 was marked done/verified; active queue is now #72, #65, #49, #43.
- [x] Updated Operations Tasks so Changelog shows queued, in-progress, and completed agent work in one visible place.
  Proof/source: `ops/agent-changelog.md`.
- [x] Smoke-tested the OpenAI Telegram sidekick end-to-end: `npm run openai:smoke -- --telegram` passed, proving OpenAI can read repo memory files, 18 transcript exports, 10 protected BNA app endpoints, 7 Drive folders, live student/payment/task/Torah data, and send the Telegram summary. Added `/smoke_openai` for future Telegram reruns; latest report is `ops/openai-smokes/2026-06-05T11-35-17-138Z-openai-sidekick-smoke.md`.
- [x] Completed the QStudio/Qustodio/FreeKiosk device-control implementation brief with a sub-agent checklist at `tasks-pending/2026-06-05-qstudio-device-control-checklist.md`; live task #81 is done/verified, with hardware/login verification left for the real devices.
- [x] Fixed another Telegram OpenAI content routing gap: transcript/topic requests like "list what we learned this week from all transcripts" now generate an in-chat OpenAI topic inventory directly instead of asking A/B/C format questions or turning into a Codex task; the missed weekly inventory was generated from 8 live transcript jobs and sent to Telegram.
- [x] Cleaned and simplified the Google Drive pipeline: `BNA V2` now uses clear upload folders for raw media and website images, source media is consolidated in `20 Processed Recordings - Source Media`, old redundant stages are archived, brand/memory/transcripts are GitHub-canonical, 18 transcript Markdown files were exported, and the Telegram bridge was restarted with the new folder wording.
- [x] Routed Telegram content-draft edits and approvals through OpenAI/API content workflows so saved WhatsApp/Facebook/newsletter/blog outputs can be revised, approved, and saved as examples directly instead of becoming Codex tasks
- [x] Split Operations Tasks into a visible agent queue inside `Changelog`; live smoke at the time showed 8 queued agent tasks and 38 changelog items, and cleaned queue titles
- [x] Replaced recycled blog card imagery with dedicated downloaded media thumbnails under `public/images/blog/`, including representative screenshots from videos
- [x] Expanded Telegram OpenAI sidekick context with capability/sync rules, shared ledger/changelog tails, live BNA app snapshots, Drive snapshots, and a `/capabilities` command
- [x] Updated Telegram task automation so Codex-owned captured tasks auto-start, move to in-progress, and send Telegram completion reminders when tracked tasks are marked done
  Proof/source: `ops/agent-changelog.md`.
- [x] Added Drive-aware Telegram OpenAI replies and `npm run drive:audit`; the current credential sees `office@bneineviimacademy.org` My Drive, zero Workspace Shared Drives, and the latest processed video `20260604_191840.mp4` in `BNA V2 / 04 Parsed`
- [x] Switched the Telegram bridge from provider-chat mode to Codex CLI primary for plain development messages; restarted live bridge on PID `123424` and verified startup log reports `Primary=codex`
- [x] Added Telegram-driven Remotion source-video editing: `NaturalVideoEdit` composition, `scripts/video-edit-source.mjs`, package scripts, `/edit_video` for Drive Raw Intake, `/edit_drop` for local drop folder, direct small-upload edit captions, bridge restart on PID `25032`, and smoke render for speed/brightness/subtitle timeline edits
- [x] Hardened Operations Content and mixed recording parsing on Railway deployment `f167fd34-7dd4-4671-bcfc-64fc6dddc006`: compact cards now show only short English topic chips, expanded cards keep full details, audio/video uploads can auto-route personal tasks vs Codex/system tasks vs student accountability/Torah progress, latest content job #19 is parsed, and duplicate parse calls are skipped safely
- [x] Added natural-language Remotion editing command: plain English requests now generate safe video props and render MP4s via `npm run video:edit`
- [x] Installed and verified Remotion video studio tooling with BNA starter portrait/wide compositions and rendered MP4 outputs in `renders/`
- [x] Converted the public homepage into a one-page Blog/FAQ experience with anchor navigation, topic filters, FAQ filters, homepage Blog/FAQ JSON-LD, `robots.txt`, and `sitemap.xml`; live smoke passed on Railway deployment `631758d2-d759-46e0-886b-d85322502b95`
- [x] Simplified Operations Accounting into one payment roster and removed Recent Payments, Pending Payments, and Green Invoice webhook audit from the visible payment section on Railway deployment `0b7adc21-6b1b-423b-aa73-190ed27964ee`
- [x] Launched public Blog, Article, FAQ, Hebrew route shells, homepage philosophy cards, Blog/FAQ navigation, and SEO/AEO JSON-LD on Railway deployment `da9dfcc5-94e8-473e-abf4-5cc85f2da6b4`
- [x] Found and fixed the legacy CRM auth issue in code by switching to the current legacy CRM PIT API
- [x] Found and fixed the broken operations login/session flow in local code
- [x] Confirmed local Kimi CLI is configured for `kimi-k2.6`
- [x] Created a repo-level pending-work convention using `tasks-pending/*.md`
- [x] Local Telegram bot now routes directly to local Kimi CLI on `kimi-k2.6`
- [x] Confirmed the connected legacy CRM social accounts for Facebook, YouTube, and Google
- [x] Confirmed legacy CRM media upload works from local code
- [x] Confirmed legacy CRM social draft creation works from local code
- [x] Confirmed 2026-06-01 that Content job #6 uploads video to legacy CRM media and creates a Bnei Neviim Academy Facebook draft
- [x] Added a legacy CRM Social diagnostics endpoint at `/api/bna/legacy CRM-social/diagnostics`
- [x] Cleaned the Operations task manager language so old raw rambles stay out of the visible task UI
- [x] Mobile-smoked Tasks, Content, and Students with Playwright after the task/content/student UI changes
- [x] Fixed Railway deploy auth loop by switching scripts to project-token mode and explicit service/environment targeting
- [x] Added `npm run railway:doctor` as a repeatable pre-deploy health check
- [x] Redeployed to Railway and smoke-tested live health, homepage, operations login, and mobile Operations views
- [x] Added structured student accountability fields and mobile student profile metrics
- [x] Removed Telegram quick action buttons for captured tasks; owner and lane now come from parser routing.
- [x] Tightened Tasks routing: Changelog is read-only machine work, Done is Shloimie's completed personal work
  Proof/source: `ops/agent-changelog.md`.
- [x] Added safe payment reminder endpoints and Accounting UI controls; local smoke passed without sending live email
- [x] Added Telegram student-match buttons for unmatched accountability notes and a protected accountability PATCH endpoint
- [x] Verified legacy CRM Facebook draft creation works for text and media content through the Content action path
- [x] Added Content tab and database tables for raw uploads, platform drafts, and approval status
- [x] Added shared content pipeline brief at `tasks-pending/2026-05-27-content-repurposing-pipeline.md`
- [x] Added Content Prompt Studio: each platform output has a versioned prompt, examples/files, generate/regenerate, copy, and approval flow
- [x] Added collapsed Content Library cards and selected-content generation so multiple recordings can generate one platform draft without creating a separate prompt path
- [x] Approved content outputs now save themselves as reusable examples for that platform prompt
- [x] Live prompt-generation smoke passed on Railway using Kimi `kimi-k2.6` with prompt v1
- [x] Live Tasks smoke passed after raw task #31 cleanup and Changelog task #30 rewrite
- [x] Live selected-content smoke passed on Railway deployment `7bb99db0-1351-4e0b-ba21-baade568e1ea`: two temporary content jobs generated one WhatsApp draft with prompt v1 and were archived afterward
- [x] Live homepage smoke passed on Railway deployment `cecac732-66b3-4273-956d-8d977a936825`: 3.5/30, 12 percent, image-only Learning Moments, 0 browser errors
- [x] Created Drive `BNA V2 / 00 Website Moments Intake` folder for future homepage image intake
- [x] Corrected the Torah student list to canonical `Eitan Chaim Golombo` and marked the duplicate `Golambo` row inactive
- [x] Corrected Torah trip progress so June 3 daily completion adds one cumulative unit: all five public cards show 15 percent and the trip remains locked
- [x] Replaced the public 30-page trip tracker with the Torah group-goal system: homepage shows only names plus cumulative trip percentages, while private daily minutes/goals stay admin-only
- [x] Added Green Invoice webhook audit logging, nested payload parsing, unmatched payment intake capture, and a manual reprocess path in Accounting; local nested-payload smoke passed and the live public endpoint is serving
- [x] Cleaned Content job #19 fallback parse into concrete student accountability goals, private Torah goal minutes, and Operations student-goal checkoff buttons; live Torah public progress remains 15 percent and trip locked
- [x] Added private student checkoff links at `/student.html`; all five current students have live access codes, canonical names, 15 percent Torah trip progress, and scoped `student_goal` checkoff updates
- [x] Cleaned Accounting payment state so Braka/Baraka is the only active pending payment; Dratler and Kosofsky are paid cash, Weber is paid Green Invoice intake, and Golombo/Galambo is paid cash intake needing signup
- [x] Added first-party website blog publishing from Content outputs: `blog_draft` prompts, Operations Website Blog generation, Telegram `Make Website Blog`, approval/publish to public JSON, and dynamic homepage/blog/article loading. legacy CRM blogs are no longer a blocker for website articles.
- [x] Added homepage Learning Moments dynamic image feed plus `npm run website:add-moment -- --source ...` to optimize/copy images into the public carousel feed; Drive watcher/approval automation remains next.
- [x] Expanded mixed-recording parsing with `daily_torah_updates` so spoken daily Torah completion writes admin-visible daily entries and cumulative 30-unit trip progress recalculates without setting public trip progress to 100.
- [x] Extended Telegram Remotion editing so Drive/drop-folder companion images and audio become overlay assets for `/edit_video` and `/edit_drop`; dry-run smoke confirmed image overlay, audio overlay, and subtitle props.
- [x] Cleaned Telegram task refinement and agent ownership: task confirmations use polished titles, quick buttons show Mine/Codex/Urgent/Done, Codex is the visible machine-work owner, and Kimi is fallback only.
  Proof/source: `ops/agent-changelog.md`.

## Read Next

- `SYSTEM-STATE.md`
- `tasks-pending/2026-06-11-content-library-v2-build-brief.md`
- `tasks-pending/2026-05-31-website-slider-and-telegram-context.md`
- `tasks-pending/2026-05-26-login-legacy CRM-audit.md`
- `tasks-pending/2026-05-27-content-repurposing-pipeline.md`
- `tasks-pending/2026-05-27-bna-telegram-accountability-audit.md`
- `memory/2026-05-26.md`

## 2026-06-15 — One Time Two-Login + White-Label + Scoped Parsing

**Status:** In Progress (local complete, deploy pending)
**Source:** `kimi-one-time-rabbi-whatsapp-workspace-handoff.md`
**Worker:** Kimi (implementation); Codex (deploy owner)

### Completed
- [x] Create `bna_workspace_integrations` table for WhatsApp ownership tracking
- [x] Create `bna_project_branding` table for white-label theming
- [x] Create `bna_contact_identity_audit` table for name resolution audit trail
- [x] Create `bna_workspace_notes` + `bna_workspace_note_items` tables for scoped meeting notes
- [x] Add `ONE_TIME_OWNER_USERNAME`/`ONE_TIME_OWNER_PASSWORD` env vars (Rabbi)
- [x] Add `ONE_TIME_MANAGER_USERNAME`/`ONE_TIME_MANAGER_PASSWORD` env vars (Shloimie)
- [x] Backward compatibility: old `ONE_TIME_OPS_USERNAME` → manager role
- [x] `identifyOpsUser()` returns `project_owner` / `project_manager` with correct `allowedViews`
- [x] `isScopedOpsPathAllowed()` blocks manager from admin-only paths
- [x] `actualContactNameFromSources()` with correct precedence and placeholder rejection
- [x] `inferProjectKeyFromTranscript()` and `inferParticipantsFromTranscript()` helpers
- [x] Update parser system prompt with workspace scoping rules
- [x] Add `GET /api/bna/workspace-settings/:key/branding` endpoint
- [x] Update `operations.html` sidebar, topbar, mobile header for white-label branding
- [x] Update `currentWorkspaceRoleLabel()` for owner/manager display
- [x] Update `.env.example` with new vars and documentation
- [x] `node --check server.js` PASS

### Pending / Needs Shloimie
- [ ] Set Railway env vars for owner and manager credentials
- [ ] Rabbi confirms WhatsApp phone number for `bna_workspace_integrations`. Blocked pending Rabbi confirmation; source: `tasks-pending/2026-06-12-scheller-drive-social-login-brief.md`.
- [ ] Decide exact One Time brand colors and logo URL (currently placeholder `#1E3A5F` / `#F5A623`)
  Decision source: `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`.
- [ ] Codex deploy when clean worktree window available
  Blocked pending clean deploy window; source:
  `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`.
- [ ] Live smoke test of scoped login (owner sees settings, manager does not)
- [ ] Live smoke test of branding API readback
- [ ] Seed `bna_workspace_integrations` with Rabbi's WhatsApp as owner
  Blocked pending confirmed Rabbi WhatsApp number; source:
  `tasks-pending/2026-06-12-scheller-drive-social-login-brief.md`.
- [ ] Seed `bna_project_branding` with final brand assets
  Blocked pending final brand assets; source:
  `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`.

### Decisions Needed
- Exact hex colors for One Time brand
- Logo image URL or upload path
- Rabbi's confirmed WhatsApp phone number
- Whether manager (Shloimie) should ever have `settings` access on One Time workspace

## 2026-06-16 - OPS-02 Operations Workflow Correctness

**Status:** Local implementation verified; live deploy/data cleanup follow-up
remains gated
**Source:** ramble-router uploaded Operations workflow prompt

### Active
- [x] Reconcile the active Operations source of truth against the newer repo UI
  and record whether Service Providers/sidebar/Calendar are rendered from
  `public/operations.html` and `server.js`.
- [x] Verify generic signups/leads stay under BNA enrollment,
  Contacts/Communications, or Funnel/Pipelines, while provider-specific leads
  are clearly scoped as provider acquisition/participants.
  Proof/source: `tasks-pending/2026-06-16-ops-workflows-lanes-calendar-routing.md`.
- [x] Tighten decision comment feedback so Add Decision Comment visibly reports
  saved/reprocess/Codex-routing state.
- [x] Verify pending/access actions, duplicate archive behavior, Done/history
  proof links, and `npm run ops:audit-queue` output.
- [x] Keep SDDraftler and Menachem identity dedupe review-only unless database
  evidence or operator approval proves the merge/category.
- [ ] Deploy the verified Operations bundle, run the Railway doctor/live smoke,
  and perform any approved safe queue/data cleanup. Local proof:
  `tasks-pending/2026-06-16-ops-workflows-lanes-calendar-routing.md`,
  `ops/playwright-smokes/2026-06-16-ops-02-local/report.md`, and
  `ops/queue-audits/2026-06-16T12-42-41-531Z-queue-audit.md`.

### Guardrails
- [x] Do not change pricing, payment ownership, legal/accounting ownership,
  login model, public copy, external sends, account grants, Google writes,
  Buffer publishes, billing actions, or ambiguous identity merges in OPS-02.

## 2026-06-16 - RABBI-04 OneTime Mishnayos Product System

**Status:** Local implementation verified; live deploy/product decisions remain
gated
**Source:** ramble-router uploaded Rabbi Scheller / OneTime product spec

### Active
- [x] Add a first-party OneTime product system for draft tiers, regional
  funnels, interest leads, 7pm Israel schedules, calendar views, and
  source-prep jobs.
- [x] Add draft/noindex `/one-time` public funnel pages with pricing clearly
  marked decision-pending and no checkout or account-grant path.
- [x] Surface OneTime product decisions, candidate pricing, leads, calendar,
  and source-prep status in the scoped Operations workspace.
- [x] Verify backend routes, public pages, Operations UI, and screenshots at
  desktop and mobile widths. Local proof:
  `tasks-pending/2026-06-16-rabbi-04-onetime-product-system.md`,
  `screenshots/rabbi-04/report.md`, focused OneTime/Rabbi/assistant/UI tests
  25/25, and full `npm test` 646/646.
- [ ] Deploy the verified OneTime product-system bundle from a clean/approved
  release path, run Railway doctor plus live public/Operations smokes, and only
  then mark the app-visible work fully deployed.

### Decisions Needed
- [ ] Approve final OneTime tier names, prices, refund/legal copy, and billing
  provider readiness before any checkout button or live payment path is shown.
  Decision source: `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`.
- [ ] Provide or ingest the June 15 Rabbi Scheller / OneTime meeting transcript
  or source artifact before treating meeting-specific claims as grounded.
  Source blocker: `tasks-pending/2026-06-17-watchdog-backlog-cleanup.md`.
- [ ] Approve any live sends, Zoom writes, Google/Drive writes, Buffer posts,
  member account grants, or external integrations separately.
  Approval source: `ops/thursday-access-checklist.md`.

## 2026-06-16 - On-Page Scoped Helper Tool Parity

**Status:** Local implementation verified; live deploy/migration follow-up
required
**Source:** `C:\Users\User\Downloads\2026-06-16-codex-on-page-scoped-helper-tool-parity-prompt (1).md`

### Completed Locally
- [x] Add scoped helper resolver, safety policy, profile/questionnaire, and
  knowledge modules for admin, Rabbi, provider, parent, student, and family
  contexts.
- [x] Harden helper permissions so provider/parent/family/student scopes cannot
  use global admin tools or cross-scope records.
- [x] Extend helper tool registry metadata with side-effect level, allowed
  scopes, required role, confirmation policy, and audit metadata.
- [x] Add helper profile, questionnaire, knowledge, chat alias, and action-log
  endpoints plus local startup SQL/migration.
- [x] Add the Operations scoped helper card with helper name, access summary,
  tool count, safety badge, suggested actions, and `Teach helper`.
- [x] Generate `ops/helper-tool-parity-map.md` and
  `ops/helper-tool-parity-map.json` with 254 records.
- [x] Verify locally with `npm run helper:parity`, focused helper tests 14/14,
  desktop/mobile Playwright launcher smoke, and full `npm test` 666/666.

### Pending
- [ ] Deploy the verified helper bundle, apply/read back
  `railway-migration-2026-06-16-helper-profile-knowledge.sql` if startup SQL
  has not already created the tables, run Railway doctor, and live-smoke the
  Operations helper launcher.
- [ ] Prioritize the 160 `tool_needed` parity records into future helper-tool
  implementation waves.
  Handoff/source: `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`.

## 2026-06-16 - Parent Portal Child Login Reset Clarity

**Status:** Local implementation verified; deploy/live smoke follow-up required
**Source:** Codex chat correction, `RAW-20260616-003`

### Completed Locally
- [x] Confirmed the backend student-login reset route is parent-session scoped
  through `getParentPortalStudentForSession(session.parentEmail, studentId)`.
- [x] Updated the parent account page so each child reset form shows the child
  name in the heading, copy, username/password labels, submit button, and saved
  status.
- [x] Added regression coverage in parent/student portal tests and verified
  `public/parent.html` inline script syntax.

### Pending
- [ ] Include this parent portal correction in the next deploy and live parent
  portal smoke.

## 2026-06-17 - Parent Login Public Entry Safety

**Status:** Local implementation verified; full multi-portal audit and live
deploy/smoke still pending
**Source:** `RAW-20260616-001`,
`tasks-pending/2026-06-16-website-ramble-correction-audit.md`,
`tasks-pending/2026-06-17-website-ramble-correction-audit.md`

### Completed Locally
- [x] Confirmed public parent navigation points to `/parent/login` rather than
  directly exposing private parent portal data.
- [x] Updated `public/parent-login.html` so existing parent sessions show an
  explicit continue panel instead of silently redirecting into `/parent`.
- [x] Added a `Use a different parent login` action that logs out the current
  parent session and returns to the login form.
- [x] Replaced `Start Accountability Intake` with
  `Request parent access / Family App setup`.
- [x] Added regression coverage and a partial parent-route security audit:
  `ops/security-audits/2026-06-17-parent-portal-routing-security.md`.
- [x] Verified focused tests 41/41, full `npm test` 667/667, parent-login
  Playwright smoke, JSONL ledger parse, and watchdog audit report
  `ops/watchdog-audits/2026-06-17T03-55-watchdog-audit.md`.

### Deployed Proof
- [x] Deployed the verified parent-login and child-login bundle; live proof:
  `ops/playwright-smokes/2026-06-17-parent-login-and-child-login-live-latest/report.md`.
- [x] Finished the broader `REQ-20260616-027` portal security audit with
  no-store/noindex headers and expanded protected-route live smoke; proof:
  `ops/security-audits/2026-06-17-parent-student-provider-portal-security.md`.

## 2026-06-17 - Goal-Mode Ramble Protocol Hardening

**Status:** Protocol hardening deployed/live-smoked; full correction-register
execution continues under the active goal
**Source:** `RAW-20260617-001`,
`tasks-pending/2026-06-17-goal-mode-ramble-protocol-hardening.md`

### Completed And Deployed
- [x] Created an active Codex goal for hardening the protocol and completing
  the full correction register to terminal statuses.
- [x] Added the `Goal-Mode Ramble Execution Trigger` rules to `AGENTS.md`.
- [x] Added the reusable
  `tasks-pending/_template-goal-mode-correction-output.md` contract with
  `BNA_GOAL_MODE_EXECUTION_PACKET`.
- [x] Extended the ramble intake template, raw-input fallback docs, parser
  metadata, Telegram/hosted assistant instructions, and watchdog checks for
  goal-mode correction packets.
- [x] Verified syntax and focused protocol/parser/Telegram tests 26/26.
- [x] Deployed the protocol/parser/Telegram bundle and ran Railway doctor plus
  live app, expanded privacy, goal-mode/helper, student-auth, onboarding, and
  signup smokes. Proof:
  `ops/live-smokes/2026-06-17T04-53-04-502Z-goal-mode-helper-live-smoke.md`.

### Pending
- [ ] Continue working the full `RAW-20260616-001` correction register until
  every requirement is Done, Already satisfied, Blocked, Failed, Needs operator
  decision, or Archived with proof.
