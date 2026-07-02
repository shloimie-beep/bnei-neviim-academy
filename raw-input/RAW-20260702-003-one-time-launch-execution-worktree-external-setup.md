# RAW-20260702-003 - One Time Launch Execution Worktree External Setup

Source channel: codex_chat
Captured at: 2026-07-02
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Privacy classification: internal_goal_mode_packet_no_secrets_no_contact_rows
Parse status: registered

## Raw Operator Packet

Shloimie provided a `BNA_GOAL_MODE_EXECUTION_PACKET` titled:

> One Time Launch Execution: Worktree Cleanup, External Setup Apply, Deploy/Smoke, Provider Setup, WhatsApp Setup Message, and Top Task View

Primary objective:

> Continue the One Time launch goal from the current local state, clean up the worktree, preserve/commit real work, run all runnable setup/readback/smoke packets, and convert every remaining external blocker into exact top visible tasks.

Operator permission update:

> Shloimie authorizes Codex to keep working and run every safe runnable packet without asking again.

Permission includes:

- cleaning/reconciling the current worktree;
- committing and pushing launch/unblocker work;
- running tests/smokes;
- provisioning/applying One Time Railway/project/database setup if scripts and targets are present;
- configuring/deploying the separate One Time Railway service if target values are present;
- using `sdratler@gmail.com` for seed/test email and internal failure alerts;
- using configured/keyholder secrets by alias/fingerprint only;
- running safe Resend test/seed sends to `sdratler@gmail.com` after final live links exist;
- sending exactly one safe WhatsApp setup message to Rabbi if Rabbi's phone number and a configured sending provider are available;
- creating exact GoDaddy DNS instructions for `join.onetimeonetime.com`;
- running post-setup deploy/live smoke when setup checker passes.

Permission does not include:

- real bulk campaign send to imported leads without final copy, final segment, suppression proof, seed-send pass, and exact send command;
- live Stripe payment;
- production paid-user subscription cancellation;
- apex/root `onetimeonetime.com` DNS mutation;
- hard delete of production data;
- exposing secrets;
- GHL/LeadConnector runtime;
- broad privacy-sensitive exports.

Current Codex-reported state to consume:

- Local proof recorded for 30-day no-card free signup/access.
- Local proof recorded for member/admin workspace and portal basics.
- Local proof recorded for click-tracked attendance v1.
- Draft-only email/campaign readiness recorded.
- Task sorting/filtering locally verified.
- Whapi/WAPI and Buffer setup panels locally guarded.
- Existing paying-users migration audit packet prepared.
- `npm run one-time:setup:check` exists and currently reports 0/8 external setup areas ready.
- Post-setup deploy/live-smoke packet exists at `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`.
- Current blockers are external setup values/targets: Railway One Time project/service/env/DB alias, `join.onetimeonetime.com`, Zoom details, Vimeo token alias, Stripe test alias/product/price, Whapi/WAPI account/phone/token, campaign copy/list/suppression/seed proof.

Hard decisions:

- Same GitHub repo.
- Separate One Time Railway project/service/database preferred.
- `join.onetimeonetime.com` is temporary campaign launch domain.
- Apex/root `onetimeonetime.com` untouched.
- New signups get 30 days free from signup.
- Attendance v1 = class-link click.
- WhatsApp provider = existing repo Whapi/WAPI direction. If Shloimie says Wappy, map to Whapi/WAPI unless repo proves otherwise.
- Vimeo is video host; Drive is intake/drop.
- Stripe product = `$67/month`.
- Existing paying users are audited/migrated, not canceled.
- Shloimie should see the next exact task at the top of task views.

Hard safety:

- Do not print secrets.
- Do not commit secrets.
- Do not screenshot secrets.
- Do not mutate apex/root DNS.
- Do not send bulk campaign.
- Do not send WhatsApp broadcasts.
- Do not run live payment.
- Do not cancel subscriptions.
- Do not hard-delete production records.
- Do not merge BNA contacts/classes/content into One Time.

Required preflight included reading BNA source-of-truth files, active run state,
setup checkers, One Time configs, Railway scripts, One Time launch/signup/member
files, WhatsApp/Vimeo/Stripe/task files, route/action registries, and running:

- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git log --oneline -10`
- `npm run bna:run:status`
- `npm run bna:run:next`
- `npm run one-time:setup:check`
- `npm run pqc:all`

## Parsed Intent

Shloimie wants Codex to continue automatically through safe work, avoid repeated
generic blockers, preserve local work, and turn each remaining external setup
gap into an exact visible task with owner, missing field, and next action.

## Created Records

- Requirement register:
  `tasks-pending/2026-07-02-one-time-launch-execution-worktree-external-setup.md`
- Top visible operator tasks:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.md`
