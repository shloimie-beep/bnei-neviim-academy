# Next Session

Continue the next dependency-ready Telegram plus website-assistant addendum
batch after deployed/live-smoked `REQ-20260623-017`. Exact next command:

```powershell
npm run bna:run:next
```

Batch 19 / `REQ-20260619-314` is done, deployed, and live-smoked. Addendum
registration `REQ-20260623-010` is done. Shared assistant control-plane
contract `REQ-20260623-011` is done and locally verified. Shared assistant
data model `REQ-20260623-012` is done, deployed, and live-smoked. Single
action parity source `REQ-20260623-013` is done, deployed, and live-smoked.
Shared registry-constrained planner/runner `REQ-20260623-014` is done,
deployed, and live-smoked. Shared drafts/templates/previews/versioning
`REQ-20260623-015` is done, deployed, and live-smoked. Unified
file/media/forwarded-message intake `REQ-20260623-016` is done, deployed, and
live-smoked. Assistant-led service-provider onboarding through Studio
`REQ-20260623-017` is done, deployed, and live-smoked.

Completed through Batch 19:

- shared Telegram/website assistant control-plane scope policy;
- generated One Time action coverage gate and no-duplicate-action-registry
  guardrails;
- One Time Operations UI/design correction;
- WhatsApp and Email/Resend communications UX in no-send mode;
- Product, scheduling, booking, portal, and billing/access foundations;
- Zoom meeting and attendance foundation with blocked live meeting creation;
- Vimeo/member-library/recording pipeline with manual Vimeo path and disabled
  automated upload;
- Transcript privacy and knowledge scoping with body-free readiness API;
- Gamification and badge audit foundation with no public individual
  leaderboard;
- Community/moderation workflow with private-first replies, private-to-public
  anonymization preview, report/flag flow, edit/delete history, no
  unrestricted student messaging, and read-only production smoke proof;
- Sefaria/study-assistant readiness with approved source-version metadata,
  scoped retrieval previews, disabled assistant feature flag, licensing/citation
  gates, and read-only production smoke proof;
- final verification and release with full clean tests, secret audit, action
  watchdog, remote branch readback, Railway doctor, standard live smoke,
  final-register surface smoke, and Operations workspace taxonomy smoke.

Batch 19 proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `2291d03a47ab0d9ec39b78561bc8e41361d959db`;
- draft PR #13;
- Railway deployment `e9949680-4330-454c-9b1c-b61dce2d475b`;
- full clean-worktree `npm test` 1071/1071;
- `npm run secrets:audit` passed;
- `npm run watchdog:actions` passed with 0 findings;
- Railway doctor readback status `SUCCESS`;
- standard live app smoke
  `ops/live-smokes/2026-06-23T17-55-00-705Z-live-app-smoke.md`;
- final register surfaces live smoke
  `ops/live-smokes/2026-06-23T17-55-27-727Z-final-register-surfaces-live-smoke.md`;
- Operations workspace taxonomy live smoke
  `ops/live-smokes/2026-06-23T17-55-27-745Z-operations-workspace-taxonomy-live-smoke.md`.

Addendum `REQ-20260623-012` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commits `ee2fe192` and `7d351b6f`;
- draft PR #13;
- Railway deployment `04756fab-bd9c-4f6b-869a-39668f64c419`;
- clean assistant/control-plane focused suite 49/49;
- main focused suite 13/13;
- standard live app smoke
  `ops/live-smokes/2026-06-23T18-25-13-013Z-live-app-smoke.md`;
- assistant readiness live smoke
  `ops/live-smokes/2026-06-23T18-26-39-444Z-assistant-control-plane-readiness-live-smoke.md`
  with 18/18 tables and 17/17 indexes present.

Addendum `REQ-20260623-013` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `19a85636ed60f9d1b148abdbc3df2e49f6fb9e4d`;
- draft PR #13;
- Railway deployment `e4b035db-e309-4402-b19c-4a26774aab8d`;
- universal parity artifact reports 133 registry rows, 22 visible controls,
  22/22 classified, 0 missing contracts, 0 missing handlers, 0 missing tests,
  and 0 risky actions without approval;
- clean watchdog action test 5/5;
- clean Telegram/UI action registry suite 33/33;
- `npm run watchdog:actions` passed with 0 findings;
- standard live app smoke
  `ops/live-smokes/2026-06-23T18-41-53-481Z-live-app-smoke.md`.

Addendum `REQ-20260623-014` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `12a586f0`;
- draft PR #13;
- Railway deployment `d61bbb67-c6bd-409a-89a1-c0e9c63e11e6`;
- shared planner contract in `src/platform/assistant/action-planner.js`;
- planner contract test `tests/assistant-action-planner-contract.test.js`;
- clean focused suite 47/47;
- main focused suite 47/47;
- standard live app smoke
  `ops/live-smokes/2026-06-23T18-53-31-401Z-live-app-smoke.md`.

Addendum `REQ-20260623-015` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `bc4c6348`;
- draft PR #13;
- Railway deployment `be818786-b5ab-416a-bbb3-0818c79cfc76`;
- shared draft/versioning contract in
  `src/platform/assistant/draft-versioning.js`;
- draft/versioning contract test
  `tests/assistant-draft-versioning-contract.test.js`;
- clean focused suite 60/60;
- main focused suite 60/60;
- standard live app smoke
  `ops/live-smokes/2026-06-23T19-05-47-613Z-live-app-smoke.md`.

Addendum `REQ-20260623-016` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `be1383a2`;
- draft PR #13;
- Railway deployment `6a3c0cfe-44bb-4154-8f1c-00bcf6f9a169`;
- shared file/media intake contract in
  `src/platform/assistant/file-media-intake.js`;
- file/media intake contract test
  `tests/assistant-file-media-intake-contract.test.js`;
- clean focused suite 41/41;
- main focused suite 42/42;
- standard live app smoke
  `ops/live-smokes/2026-06-23T19-14-56-082Z-live-app-smoke.md`.

Addendum `REQ-20260623-017` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `a1186d5c`;
- draft PR #13;
- Railway deployment `24301b82-8b71-45e4-b0a9-aa3d2f236cad`;
- provider onboarding Studio contract in
  `src/platform/assistant/provider-onboarding-studio.js`;
- provider onboarding contract test
  `tests/assistant-provider-onboarding-studio-contract.test.js`;
- clean focused suite 59/59;
- main focused suite 59/59;
- standard live app smoke
  `ops/live-smokes/2026-06-23T19-25-10-625Z-live-app-smoke.md`.

Addendum `REQ-20260623-018` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `c77501e1`;
- draft PR #13;
- Railway deployment `c8abec9b-5f50-481d-8d5c-7c39714ffa3a`;
- parent self-service contract in
  `src/platform/assistant/parent-self-service.js`;
- parent self-service contract test
  `tests/assistant-parent-self-service-contract.test.js`;
- clean focused suite 47/47;
- main focused suite 47/47;
- standard live app smoke
  `ops/live-smokes/2026-06-23T19-37-26-570Z-live-app-smoke.md`.

Addendum `REQ-20260623-019` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `f68e9d3d`;
- draft PR #13;
- Railway deployment `5196fc2f-1e56-4a6f-a1ff-e44649831540`;
- canonical chart/dashboard contract in
  `src/platform/assistant/chart-dashboard-config.js`;
- parent self-service refactored to consume that contract in
  `src/platform/assistant/parent-self-service.js`;
- chart/dashboard contract test
  `tests/assistant-chart-dashboard-config-contract.test.js`;
- clean focused suite 59/59;
- main focused suite 59/59;
- standard live app smoke
  `ops/live-smokes/2026-06-23T19-51-57-448Z-live-app-smoke.md`.

Addendum `REQ-20260623-020` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `8a7c1c66`;
- draft PR #13;
- Railway deployment `b796a1b9-8de7-43ea-90fb-0f9a87a9304b`;
- campaign control contract in
  `src/platform/assistant/campaign-control.js`;
- registry/planner/runner integration in
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/platform/assistant/action-planner.js`;
- campaign contract test
  `tests/assistant-campaign-control-contract.test.js`;
- clean focused assistant/action suite 97/97;
- clean `npm run watchdog:actions` 0 findings;
- main focused assistant/action suite 97/97;
- standard live app smoke
  `ops/live-smokes/2026-06-23T20-05-05-992Z-live-app-smoke.md`.

Addendum `REQ-20260623-021` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `6137985a`;
- draft PR #13;
- Railway deployment `8006f53f-d12b-4a38-9233-26b9f217d26b`;
- automation builder contract in
  `src/platform/assistant/automation-builder.js`;
- registry/planner/runner integration in
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/platform/assistant/action-planner.js`;
- detailed action registry aligned in `ops/action-registry/actions.json`;
- automation contract test
  `tests/assistant-automation-builder-contract.test.js`;
- clean focused assistant/action suite 97/97;
- clean parity generators reported 22 visible controls and 137 registry rows;
- clean `npm run watchdog:actions` 0 findings;
- main focused assistant/action suite 97/97;
- standard live app smoke
  `ops/live-smokes/2026-06-23T20-19-39-519Z-live-app-smoke.md`.

Addendum `REQ-20260623-022` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `75c91c72`;
- draft PR #13;
- Railway deployment `7cc4fbe0-2d98-4496-b44f-f38e3a4c87e0`;
- problem-resolution contract in
  `src/platform/assistant/problem-resolution.js`;
- existing ticket action integration in
  `src/lib/actions/registry.js` and
  `src/lib/actions/actions/operations.js`;
- detailed action registry ticket rows aligned in
  `ops/action-registry/actions.json`;
- problem-resolution contract test
  `tests/assistant-problem-resolution-contract.test.js`;
- clean focused problem/planner/action suite 45/45;
- clean focused assistant/action suite 103/103;
- clean parity generators reported 22 visible controls and 137 registry rows;
- clean `npm run watchdog:actions` 0 findings;
- main focused assistant/action suite 103/103;
- standard live app smoke
  `ops/live-smokes/2026-06-23T20-31-58-654Z-live-app-smoke.md`.

Addendum `REQ-20260623-023` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `1acdb699`;
- draft PR #13;
- Railway deployment `a811771e-60e1-43f9-902c-70b0865d78ed`;
- reminder/notification contract in
  `src/platform/assistant/reminder-notifications.js`;
- registry/planner/runner integration in
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/platform/assistant/action-planner.js`;
- detailed action registry aligned in `ops/action-registry/actions.json`;
- reminder contract test
  `tests/assistant-reminder-notifications-contract.test.js`;
- clean focused reminder/planner/action suite 45/45;
- clean focused assistant/action suite 109/109;
- clean parity generators reported 22 visible controls and 138 registry rows;
- clean `npm run watchdog:actions` 0 findings;
- main focused assistant/action suite 109/109;
- standard live app smoke
  `ops/live-smokes/2026-06-23T20-44-13-808Z-live-app-smoke.md`.

Addendum `REQ-20260623-024` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- commit `dd905201`;
- draft PR #13;
- Railway deployment `6620b95b-0771-4e38-9fb9-1e6c4921e2bd`;
- scope policy hardening in `src/platform/assistant/control-plane.js`;
- regression coverage in `tests/universal-control-plane-scope-policy.test.js`;
- clean scope-policy suite 10/10;
- clean focused assistant/action suite 119/119;
- clean `npm run watchdog:actions` 0 findings;
- main focused assistant/action suite 119/119;
- standard live app smoke
  `ops/live-smokes/2026-06-23T20-53-13-014Z-live-app-smoke.md`.

Addendum `REQ-20260623-025` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- corrected commit `296a276a` after reverting accidental broad-copy commit
  `44dfd772` with `0adef747`;
- draft PR #13;
- Railway deployment `02944240-4c1b-477b-a57f-5f6140e80400`;
- read-only snapshot builder in `src/platform/assistant/control-center.js`;
- protected route in `server.js`;
- existing Operations Universal Assistant panel integration in
  `public/operations.html`;
- regression coverage in `tests/assistant-control-center-contract.test.js`;
- clean control-center/data-model/scope suite 18/18;
- clean focused assistant/action suite 122/122;
- clean `npm run watchdog:actions` 0 findings;
- standard live app smoke
  `ops/live-smokes/2026-06-23T21-07-46-763Z-live-app-smoke.md`;
- focused live `/api/bna/assistant/control-center` readback returned status
  200 and no-write guards.

Addendum `REQ-20260623-026` proof:

- clean branch `codex/one-time-batch4-control-plane-20260623`;
- final QA commit `6560b8f0`;
- draft PR #13;
- required audits:
  `ops/audits/2026-06-24-telegram-system-truth.*` and
  `ops/audits/2026-06-24-telegram-action-parity.*`;
- required QA run:
  `ops/qa-runs/2026-06-24-telegram-end-to-end.*`;
- provider onboarding doc:
  `docs/product/provider-telegram-onboarding.md`;
- required return packet:
  `.runtime/telegram-audit/CHATGPT-RETURN-PACKET.*`;
- final artifact JSON parse passed;
- Railway deployment `359bd3c5-8cdc-4b70-a2eb-535e03f8d62e`;
- standard live app smoke
  `ops/live-smokes/2026-06-23T21-16-19-796Z-live-app-smoke.md`;
- focused live `/api/bna/assistant/control-center` readback returned status
  200, `total_actions=79`, `telegram_ready=79`, `website_ready=79`,
  `blocker_count=0`, and no-write guards.

Next state:

- No unblocked Telegram plus website-assistant addendum requirement remains.
- Run `npm run bna:run:next` only to verify the execution-run selector agrees
  that the remaining open item is the terminal external decision.
- Keep `REQ-20260619-313` as `needs_operator_decision` unless Shloimie/Rabbi
  approve the separate One Time paid infrastructure, ownership, and DNS path.

Do not run external sends, billing, DNS, real Zoom meeting creation, real Vimeo
upload/publication, hard deletes, live badge award/reversal writes, prize/credit
issuance, access grants, public leaderboard exposure, unreviewed community
publication, unrestricted student messaging, transcript publication, vector
corpus mutation, Sefaria/API ingestion, answer generation, separate One Time
infrastructure provisioning, or PR merge.

Queued future source: GitHub issue #7 is registered as `RAW-20260622-001` /
`PARENT-20260622-001` with queue-registration requirement
`REQ-20260622-001`. The Telegram plus website-assistant addendum is appended
as `RAW-20260623-005` / `REQ-20260623-010` with register
`tasks-pending/2026-06-23-telegram-website-control-plane-addendum.md`.

GitHub PR #5 is now merged, and Batch 4 used draft PR #13 as a clean deploy
candidate; Batches 5, 6, 7, 9, 12, 11/13, 14, 15, 16, 17, and 19 continued on
the same branch and PR. Do not create duplicate control-plane systems.

New source `RAW-20260624-001` is registered for the credential-free
Integration, Navigation, and Owner-Review Closeout pass. Requirements
`REQ-20260624-001` through `REQ-20260624-011` are appended to this run.
`REQ-20260624-001` is done. `REQ-20260624-002` has local validation proof but
is `needs_operator_decision` for GitHub workflow-scope permission.
`REQ-20260624-003` is done on PR #14 commit `094ca7c6`; it added the generated
owner-review route inventory. `REQ-20260624-004` is done on PR #14 commit
`e4378c31`; the current generated owner-review inventory has 689 route rows,
34 HTML pages, 0 missing implementation rows, 0 customer-facing orphan-review
rows, and 0 duplicate implementation groups.
`REQ-20260624-005` is done on PR #14 commit `3375c9fe`; One Time now has a
canonical local journey from `/one-time` to `/rabbi-member`, `/member-library`,
`/one-time-classroom`, questions/support, account/logout, and public-site
return, with legacy member aliases redirected or classified.
`REQ-20260624-006` is done on PR #14 commit `ca49a140`; shared public nav now
has direct School/Families/Provider Directory/One Time/Blog/FAQ/Portal
Login/Register entries, Operations stays out of consumer nav, and parent,
student, and provider topbars have stable home/help/return links.
`REQ-20260624-007` is done on PR #14 commit `d853b920`; parent/student/provider
topbars open the shared assistant widget, One Time member/library/classroom/
participant pages load the same helper/widget with `one_time_member` scope,
Operations keeps the existing BNA Helper drawer, and full credential-free
validation passed.

Next unblocked executable batch:

- `REQ-20260624-008` - run credential-free desktop/mobile browser QA across
  public visitor, parent one-child, parent multi-child, student, provider
  admin, provider participant/member, One Time member, platform super-admin,
  wrong-role, and logged-out journeys with synthetic local fixtures and mock
  integrations.

Exact next commands:

```powershell
Set-Location C:\Users\User\Documents\Codex\2026-06-24\integration-navigation-owner-review
npm run bna:run:next
```

Guardrails for this pass:

- Do not use external credentials.
- Do not read production state.
- Do not mutate a production database or apply a backfill.
- Do not deploy or run live production smoke.
- Do not send email or Telegram messages.
- Do not publish, upload, charge, alter DNS, perform OAuth/account-owner
  actions, or request secret values.
- Do not add another broad feature family or approval-wrapper-only slice.
