# Status

Current status: `active`

## 2026-07-13 One Time-First Addendum

- Captured `RAW-20260713-003` from the operator addendum and kept this as part of the existing active run.
- Recorded correction decisions `DEC-20260713-003`, `DEC-20260713-004`, and `DEC-20260713-005`.
- Added source-statement matrix `ops/execution-runs/2026-07-12-shared-crm-communication-agents-addendum/source-statement-matrix-RAW-20260713-003.json`.
- Added packet manifest `ops/prompt-packets/2026-07-13-onetime-first-owner-tests-performance-mobile-crm-addendum/manifest.json`.
- Added requirement register `tasks-pending/2026-07-13-onetime-first-owner-tests-performance-mobile-crm-addendum.md`.
- New current order is One Time first: owner-only integration tests, architecture/performance baseline, dedicated One Time shell, mobile CRM IA, then verifier.
- BNA frontend parity is deferred; BNA remains protected by privacy, security, shared runtime, database migration, workspace isolation, and branding regression checks.
- No owner email/WhatsApp send, Railway mutation, app code change, or public auto-reply activation occurred during this control-correction step.

## 2026-07-13 Owner-Test Readiness

- `REQ-20260713-906` is blocked only on missing secure owner-test destinations.
- Added the no-send owner-test readiness checker and report path.
- Resend is configured, connected, domain-verified, and send-ready for One Time.
- One Time WAPI provider setup is ready with one-time scoped credentials, instance metadata, sender phone metadata, webhook secret, and class link.
- Public auto-reply readiness is true, but Telegram notification approval remains false.
- Local/keyholder/Railway readback found no owner-test email or WhatsApp aliases, so no email, WhatsApp, CRM mutation, public auto-reply activation, Railway mutation, or external write was performed.

## 2026-07-13 Architecture/Performance Baseline

- `REQ-20260713-907` is Done.
- Added `scripts/audit-onetime-architecture-performance-baseline.mjs` and package script `one-time:architecture-performance-baseline`.
- Added ADR `docs/architecture/one-time-app-shell-adr-2026-07-13.md`: next implementation path is a dedicated same-repo One Time app shell that keeps shared backend/API/contact/outbox/agent/ticket contracts.
- Ran `npm run one-time:architecture-performance-baseline -- --repeats=2` against `https://join.onetimeonetime.com` at live SHA `e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1`.
- Baseline report: `ops/performance-audits/2026-07-13-onetime-architecture-performance-baseline/report.md`.
- Result: 160 measured samples, 0 skipped, 32 attention samples, no production writes, no failed-request budget breaches, no console-error budget breaches, and no direct slow API budget breaches.
- Attention classification: public landing transfer (`large_transfer=16`) and tasks route DOM weight (`heavy_dom=16`).
- `REQ-20260713-908` is Done, `REQ-20260713-911` is ready, and `REQ-20260713-906` remains blocked only on secure owner aliases.

## 2026-07-13 Dedicated One Time Provider Shell Routing

- `REQ-20260713-908` first routing slice is committed, pushed, deployed, and live-smoked on One Time Railway at `c0b8ab8139c6166d89527a949ce4dd70bf67df3a`.
- Normal One Time provider login now returns the dedicated provider-shell payload (`dedicated_provider_shell=true`, `operations_shell=false`) instead of `portal_redirect=true`.
- `/provider.html?admin_provider=one-time` and provider aliases stay in the dedicated One Time provider shell by default and do not load `operations-shell.css` or `operations-shell.js`.
- Scoped Operations remains available as an explicit fallback only when `ops_fallback=1` is present.
- Registered `ACTION-ONETIME-PROVIDER-OPERATIONS-FALLBACK` and added visible fallback links in the provider shell.
- Verification passed: `node --check server.js`, provider login/review navigation browser tests, route-role/action-coverage tests, action watchdog, execution-run validation, signed local provider CRM layout smoke, BNA Railway deployment `33571043-54ce-4631-99c1-b54209edebc7`, One Time Railway deployment `b39ce70a-89e0-44a3-80c5-77e8c2b43754`, and live smoke `ops/live-smokes/2026-07-13T06-06-50-onetime-provider-shell-routing.md`.
- CRM route-module slice is locally verified: the CRM renderer now lives in `public/js/one-time-provider-crm-route.js`, default provider overview shows a route placeholder without loading CRM, active CRM loads only the CRM module, mailbox loads only after navigation, and `ops/performance-audits/2026-07-13-onetime-provider-route-module-budget/report.md` passed.
- CRM route-module slice is also deployed/live-smoked on One Time at `a9447271e29ed0f30401b05f760f4d314f91c9a9`: Railway deployment `fac38cc0-23c4-4158-8556-4c11e6c95215` reached `SUCCESS`, exact-SHA One Time separate-instance smoke passed, and `ops/live-smokes/2026-07-13T06-38-20-407Z-onetime-provider-route-module-live-smoke.md` confirms overview loads no route module, CRM loads only the CRM module, mailbox loads only its stub, Operations assets stay absent, and no sends or production mutations occurred.
- Mailbox/messages route-module slice is locally verified: mailbox review and signed mailbox render/load/thread helpers live in `public/js/one-time-provider-mailbox-route.js`; One Time review messages live in `public/js/one-time-provider-communications-route.js`; expanded route-module budget passed across overview, CRM, mailbox, and communications with no Operations CSS/JS.
- Mailbox/messages route-module slice is deployed/live-smoked on One Time at `72650231e9d6eba9a367a59251cb58202f8910b1`: Railway deployment `df3a27b2-a930-430d-b29d-0d8390b62a17` reached `SUCCESS`, exact-SHA One Time separate-instance smoke passed, and `ops/live-smokes/2026-07-13T06-59-53-991Z-onetime-provider-route-module-live-smoke.md` confirms overview loads no route module, CRM/mailbox/communications each load only their own module, Operations assets stay absent, 390px CRM has no horizontal overflow, and no sends or production mutations occurred.

## 2026-07-13 Mobile CRM IA Current-State And PQC

- `REQ-20260713-909` is in progress with the prerequisite audit/PQC gate complete.
- Current-state audit: `ops/ui-audits/2026-07-13-onetime-mobile-crm-ia-current-state/report.md`.
- Product Quality packet: `ops/prompt-packets/2026-07-13-onetime-mobile-crm-ia/00-mobile-crm-ia.product-quality.json`.
- Validation passed: `npm run pqc:validate -- ops/prompt-packets/2026-07-13-onetime-mobile-crm-ia/00-mobile-crm-ia.product-quality.json`.
- Local CRM workbench smoke refreshed the split-shell/monolith 1440/1024/768/430/390 evidence with no horizontal overflow, no wrong-workspace leak, and no failed request/console/page errors.
- No UI implementation, deployment, external send, CRM mutation, provider mutation, payment/access change, or production data mutation occurred in this prerequisite step.
- Next: implement the scoped mobile CRM list/detail/subview/action-state IA from the validated packet, then run local screenshots/accessibility/action proof, deploy One Time, and live-smoke before marking `REQ-20260713-909` Done.

## 2026-07-13 Mobile CRM IA Local Implementation

- `REQ-20260713-909` now has a local implementation and proof, and the deployed/live proof is complete.
- Operations CRM selected-contact workspace now exposes `data-crm-mobile-ia="list-detail-subview-action"`, focused contact header, class/access context in the header, horizontal section rail, tab panels, contextual More actions overflow, lazy Activity/Conversations/Tasks loading, and mobile one-pane profile hiding.
- Local proof passed: generated-shell consistency, shared CRM/action-registry tests, action watchdog, refreshed action parity reports, and `npm run one-time:smoke:operations-crm-workbench-local`.
- The local CRM smoke report is `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`; it passes split shell and monolith at 1440, 1024, 768, 430, and 390 with no horizontal overflow, no console/page/request failures, no writes, mobile Back restoration, and lazy conversations/tasks requests.
- Commit `e971aa1e69eae63be8682b699b78d4b7733fefb8` is pushed to `origin/master`.
- One Time Railway deployment `9baac6d8-a249-49f7-a228-a77efcf87d5f` reached `SUCCESS`; `https://join.onetimeonetime.com/api/deploy-info` returned the exact commit.
- BNA Railway deployment `1e95c912-8985-42a2-b4d7-294f26dd0939` reached `SUCCESS`; `https://bneineviimacademy.org/api/deploy-info` returned the exact commit.
- Live proof passed: One Time exact-SHA separate-instance smoke, One Time CRM workbench live smoke `ops/live-smokes/2026-07-13T07-45-19-025Z-one-time-operations-crm-workbench-live-smoke.md`, One Time route-module smoke `ops/live-smokes/2026-07-13T07-45-30-679Z-onetime-provider-route-module-live-smoke.md`, BNA exact-SHA deploy-info readback, and Operations workspace taxonomy smoke `ops/live-smokes/2026-07-13T07-48-07-488Z-operations-workspace-taxonomy-live-smoke.md`.
- `REQ-20260713-909` is Done. Next: start `REQ-20260713-911` instrumentation/regression gates; keep `REQ-20260713-906` blocked until secure owner aliases exist.

## 2026-07-13 Performance Instrumentation And Regression Gates

- `REQ-20260713-911` is Done.
- Added shared request instrumentation in `server.js`: `X-Request-Id`, `X-BNA-Trace-Id`, `X-BNA-Deploy-SHA`, `X-BNA-Target-App`, `X-BNA-Response-Bytes`, and `Server-Timing` with `app`, `handler`, `db`, and `pool` spans.
- Wrapped pool/client query paths for database and pool-wait timing, added privacy-safe browser RUM collection under `/api/performance/rum`, and created the `bna_performance_events` table contract.
- Added `public/js/one-time-performance-rum.js` and loaded it from One Time public/provider/Operations entrypoints with route redaction and no cookie/localStorage/DOM-text capture.
- Added the performance regression gate `scripts/audit-onetime-performance-regression-gates.mjs`, expanded route-module budgets, and recorded `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`.
- Commit `2c72bc0bf060d33567544e97d07c77317e54e971` is pushed to `origin/master`.
- One Time Railway deployment `e0674590-9e8c-4f01-aaf1-00c1cf27ef41` reached `SUCCESS`; `https://join.onetimeonetime.com/api/deploy-info` returned the exact commit and `target_app=one-time`.
- BNA Railway deployment `9b3c68bc-fbce-48d2-8636-c2583e25aa57` reached `SUCCESS`; `https://bneineviimacademy.org/api/deploy-info` returned the exact commit and `target_app=bna`.
- Live proof passed: production performance gate against `https://join.onetimeonetime.com`, Operations taxonomy smoke `ops/live-smokes/2026-07-13T08-16-56-138Z-operations-workspace-taxonomy-live-smoke.md`, One Time CRM workbench smoke `ops/live-smokes/2026-07-13T08-19-54-835Z-one-time-operations-crm-workbench-live-smoke.md`, One Time provider route-module smoke `ops/live-smokes/2026-07-13T08-19-55-092Z-onetime-provider-route-module-live-smoke.md`, and exact-SHA One Time separate-instance smoke.
- `REQ-20260713-910` verifier is now blocked only by `REQ-20260713-906` missing secure owner-test aliases.

## Completed In This Batch

- Created run and register for the addendum.
- Ran `git fetch origin master`; HEAD and origin/master match at `7c0b8530ed733cce1a5f0fc1f40fa3b8232fec0c`.
- Verified Rabbi Telegram readiness and performed an approved live Telegram smoke before this run registration.
- Implemented `scripts/smoke-rabbi-agent-review-direct-proof.mjs`.
- Ran `npm run app:smoke:rabbi-agent-review-direct-proof`; result `direct_codex_verified`, two terminal prompt states, zero proof blockers.
- Ran `npm run production:readiness:gate -- --json --allow-dirty`; Agent Mode proof blocker is gone.
- Committed and pushed `966ded41b517433533f24370949426cfd1200213` to `origin/master`.
- Deployed `966ded41b517433533f24370949426cfd1200213` to BNA production and verified live `/api/deploy-info`.
- Deployed `966ded41b517433533f24370949426cfd1200213` to One Time production and verified live `/api/deploy-info`.
- Redeployed current `master` tip `7fee7ca15874e1964da8d59671322130fe9ed2e0` to both BNA and One Time and verified both live `/api/deploy-info` endpoints.
- Ran One Time separate-instance live smoke at the deployed SHA.
- Verified the One Time Mishnah signup form bug path directly: Family and School button clicks set the hidden form value and submit the correct no-write intercepted payload; API dry-run normalizes both choices correctly.
- Ran `npm run app:smoke:crm-identity-isolation -- --allow-transactional-live-proof --write-report`; same synthetic email and phone coexist across BNA and One Time workspaces, workspace-filtered lookups isolate each workspace, same-workspace duplicate is blocked, and rollback leaves zero synthetic rows.

## Current Blockers

- Full production readiness still blocks on external One Time setup fields:
  `rabbi_stripe_test_secret_key_alias_or_test_key_status`,
  `67_month_product_price_id_or_alias`,
  `final_campaign_copy`,
  `exact_recipient_segment_or_list`,
  `suppression_unsubscribe_proof`,
  `explicit_seed_packet_approval`.
- Owner-only live integration tests block on missing secure owner-test aliases:
  `ONE_TIME_OWNER_TEST_EMAIL` and `ONE_TIME_OWNER_TEST_WHATSAPP` or approved
  equivalent aliases must be configured through the approved secret path.
- `REQ-20260713-906` owner-only live integration tests are blocked only on
  missing secure owner-test aliases; `REQ-20260713-910` final verifier remains
  blocked by that owner-alias requirement.
- Main addendum implementation remains open across the verifier and remaining
  Rabbi Telegram/ticket-approval proof.

## Shared CRM Product Slice

- `REQ-20260712-302` is now in progress with a bounded shared-module slice locally verified.
- Added canonical CRM contact service wiring for list/timeline DTO envelopes.
- Added shared browser CRM modules under `public/js/crm/` and core CRM styling under `public/css/crm-core.css`.
- Operations now loads the shared CRM modules before the shell and marks the contacts index, contact workspace, and inspector with shared CRM component attributes.
- Replaced internal/dead-end CRM copy in this slice with customer-facing empty states and concise disabled-channel tooltips.
- Registered the scoped email navigation, WhatsApp no-send link, and disabled Create Task placeholder actions.
- Local verification passed: syntax checks, focused CRM/isolation tests `31/31`, generated-shell check, PQC validation, secret audit, action watchdog, protocol drift watchdog, execution-run validation, and whitespace diff check.
- First deployment of `1bbe74691eac18c83808f27cd9c9dfa949b1aa7a` exposed a live adapter mismatch in the CRM contacts API (`db.query is not a function`), caught by the One Time Operations CRM workbench smoke.
- Hotfix `bf0ec619b5ed10b2c057d5cf4f1553362d6614f4` wraps `operationsCrmContactRows(scope, pool, filters)` correctly and updates the CRM workbench smoke expectations for the customer-facing review copy.
- BNA and One Time are deployed at `bf0ec619b5ed10b2c057d5cf4f1553362d6614f4`; post-deploy Railway doctors passed.
- One Time Operations CRM workbench live smoke passed with 12 scoped cards and selected timeline read-only. The full `REQ-20260712-302` remains in progress because dedicated workspace/actions and deeper parity are still open.
- Follow-up URL-state slice is locally verified and pending deploy: selected CRM contact and CRM filters/search/sort/list-scroll now sync into `crm_contact`, `crm_search`, `crm_type`, `crm_status`, `crm_source`, `crm_tag`, `crm_sort`, and `crm_scroll` URL params.
- Verification for URL-state slice passed: generated-shell check, focused CRM/isolation tests `32/32`, local Playwright CRM workbench smoke across split shell and monolith, action watchdog, protocol drift watchdog, secret audit, execution-run validation, and whitespace diff check.
- URL-state slice is deployed at `f818822bb3969dca5d27f7c5a70d4dbf0baa8744`; BNA and One Time deploy-info match, post-deploy Railway doctors passed, One Time separate-instance smoke passed, and One Time Operations CRM workbench live smoke passed with 12 scoped cards and selected timeline read-only.
- Local CRM update/no-auto-task slice is locally verified and pending deploy: selected contact workspace now exposes a local first-party update form, the client sends `create_follow_up_task: false`, and the server creates CRM follow-up tasks only when `create_follow_up_task` is explicitly true.
- Local CRM update/no-auto-task slice is deployed at `224bc077919c624f115c264d35e35092ed4144da`; BNA and One Time deploy-info match, post-deploy Railway doctors passed, One Time separate-instance smoke passed, and One Time Operations CRM workbench live smoke passed with 12 scoped cards and selected timeline read-only.
- Explicit CRM Create task action slice is deployed at `ded53274e31f91abff7944c094bdcdfaa9c55c5e`: the dead-end `ACTION-CRM-CREATE-TASK-PENDING` placeholder is replaced by active `ACTION-CRM-CREATE-TASK`, the client only creates a task after an explicit click with `create_follow_up_task: true`, read-only preview disables the action, BNA/One Time deploy-info match, and One Time Operations CRM workbench live smoke passed with 12 scoped cards and read-only selected timeline.
- Enabled CRM workspace tabs slice is deployed at `1c4880418954d984c08683ba0955a32549eb33aa`: Overview, Activity, Conversations, Tasks, and Access are enabled click targets with customer-facing panels, the Activity timeline remains the default, BNA deployment `d580fdf6-535a-42e4-bfab-aff27fc0ce7b` and One Time deployment `e66f0964-6752-4c20-8eac-adec647b58dd` reached `SUCCESS`, both deploy-info endpoints returned the SHA, and the One Time Operations CRM workbench live smoke passed with 12 scoped cards and read-only selected timeline.
- Shared CRM contract/geometry slice is deployed at `909cb26d9a21a1e505ee30835ff31646b7c1c9cd` for `REQ-20260712-302`: `public/js/crm/contact-workspace.js` owns the `shared-crm-v1` workbench contract, Operations emits the same component order, pane count, mobile/tablet breakpoint, and 40px back-control target as data attributes, and local smoke asserts the contract across split shell and monolith at 1440/1024/768/430/390. BNA deployment `d5771dd9-f35a-4610-b382-e15afe4a885e` and One Time deployment `279b82a0-a726-4493-a4f6-23ed409b487d` reached `SUCCESS`, both deploy-info endpoints returned the SHA, and the live One Time Operations CRM workbench smoke passed.
- Shared Identity/Family workspace slice is deployed at `d1c0d3a596ad420876941445faad9f1e60c7ce48` for `REQ-20260712-302`: the shared tab registry now exposes `Identity` and `Family` tabs, Operations renders customer-facing identity, communication preference, consent/suppression, family/school, membership, class activity, follow-up, and notes panels, and local smoke clicks both tabs across split shell and monolith without any write request. BNA deployment `32cd90dd-38cf-4398-93db-6af86939deeb` and One Time deployment `00290796-3917-4269-b573-981cf0ff7206` reached `SUCCESS`, both deploy-info endpoints returned the SHA, and the live One Time Operations CRM workbench smoke passed.
- Dedicated Add Contact slice is deployed at `de48d8aef8b4764b5144a89edef9e269c102c25f` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-ADD-CONTACT`, server POST `/api/bna/crm/contacts` creates or updates one workspace-scoped first-party contact, writes workspace-scoped email/phone/WhatsApp identities, records a local pipeline event, returns the stable `bna_contacts:<id>` contact key, and opens the contact workspace without sending messages, granting access, importing, charging, or creating tasks automatically. BNA deployment `e3f91da7-ed02-4554-8b05-7ea11606cf2e` and One Time deployment `4cd41025-343f-488a-bf07-4f6550fa2a0d` reached `SUCCESS`, both deploy-info endpoints returned the SHA, and the live One Time Operations CRM workbench smoke passed with 12 scoped cards and read-only selected timeline.
- Dedicated Archive Contact slice is deployed at `3293d3528ace28938d5f13d8b65b485448c9ebc9` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-ARCHIVE-CONTACT`, the explicit click uses the existing workspace-scoped CRM PATCH route with `status=archived`, `create_follow_up_task=false`, and no-send/no-access/no-import/no-external-write flags, then clears the selected contact and reloads the active list. BNA deployment `d454d665-4e81-43d7-868e-8c02888c0080` and One Time deployment `e4883410-13ce-4ad8-8d59-db5fc50effd4` reached `SUCCESS`, both deploy-info endpoints returned the SHA, and the live One Time Operations CRM workbench smoke passed.
- Dedicated Complete/Reopen task slice is deployed at `ec1e893848f12242a30fd1fc59c236442997f30e` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-COMPLETE-TASK` and `ACTION-CRM-REOPEN-TASK` on linked follow-up tasks in the Tasks tab, the explicit clicks use scoped `PATCH /api/bna/tasks/:id` through `api.updateTask`, and local smoke verifies the controls without clicking a write. BNA deployment `3b43615c-3fde-4fad-bb1c-326baed500aa` and One Time deployment `8f022587-8b8e-474e-8c59-886b68e18faa` reached `SUCCESS`, both deploy-info endpoints returned the SHA, the live One Time Operations CRM workbench smoke passed, and deployed JS/CSS marker checks confirmed the controls.
- Dedicated Link member slice is deployed at `8ea9b798fe9187fbb5f311fbd6073b49f1befcf3` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-LINK-MEMBER` in Access/Family as an explicit first-party action that creates a disabled member shell only (`access_status=paused`, `access_enabled=false`), with no portal link, class link, library access, message send, payment, import, or external CRM write. The direct `bna_contacts` aggregate now scopes email fallback rollups for communications, support, tasks, and membership through the workspace-mapped project before displaying them in the contact workspace. BNA deployment `91234f89-084d-4dc0-bc8b-4de7fbd33325` and One Time deployment `dc45500e-960c-4adf-8e78-dcb92a2a725c` reached `SUCCESS`, both deploy-info endpoints returned the SHA, the One Time live CRM workbench smoke passed, and deployed JS/HTML marker checks confirmed the Link member controls.
- Dedicated Link family/student slice is deployed at `003e3e7fe23684a40131e53be280787811bcc8a4` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-LINK-FAMILY` and `ACTION-CRM-LINK-STUDENT` in the Family tab, Link family persists first-party relationship metadata/tags through the CRM PATCH route, Link student creates a paused first-party student shell with no login/access code/class access, and the contact aggregate now reads same-project student shells by parent email. BNA deployment `f8ff55d2-ebe1-4f1e-8250-7a4d34e873a6` and One Time deployment `7e9d6c53-e77f-493a-82ea-573e6b1fcb29` reached `SUCCESS`; focused tests, local CRM workbench smoke, exact-SHA One Time route smoke, and deployed JS marker checks passed.
- Dedicated Schedule/Change/Clear follow-up slice is deployed at `eee9a431dd426d8627652b972c3d3336eaf18362` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-SET-FOLLOW-UP`, `ACTION-CRM-CHANGE-FOLLOW-UP`, and `ACTION-CRM-CLEAR-FOLLOW-UP`; the scoped CRM PATCH route now persists empty follow-up values as `null` instead of ignoring them, records `crm_action_id` metadata, keeps `create_follow_up_task=false`, and performs no external send, payment, access grant, import, or external CRM write. BNA deployment `01b5cbf9-a187-4c5e-8e4e-a5e8985d3445` and One Time deployment `2eeead32-2f44-49b9-9a70-1528c3ad5945` reached `SUCCESS`; focused tests, local/live CRM workbench smokes, action watchdog, exact-SHA One Time route smoke, deploy-info readbacks, and deployed JS marker checks passed.
- Dedicated Add note/Add tag/Remove tag/Assign owner/Change lifecycle slice is deployed at `15796035598280b3ae14d748e3673d6a186af5cd` for `REQ-20260712-303`: Operations exposes `ACTION-CRM-ADD-NOTE`, `ACTION-CRM-ADD-TAG`, `ACTION-CRM-REMOVE-TAG`, `ACTION-CRM-ASSIGN-OWNER`, and `ACTION-CRM-CHANGE-LIFECYCLE`; the scoped CRM PATCH route now persists an explicit empty tag list instead of ignoring final tag removal, records local event metadata, keeps `create_follow_up_task=false`, and performs no external send, payment, access grant, import, automatic task creation, or external CRM write. BNA deployment `7e32345a-71c3-4296-a899-f10710339020` and One Time deployment `8dc13638-9225-4c0f-99ca-bdc2bb5daab1` reached `SUCCESS`; focused tests, local/live CRM workbench smokes, action watchdog, exact-SHA One Time route smoke, deploy-info readbacks, and deployed JS marker checks passed.
- Canonical contact conversation/task DTO route slice is deployed at `1a8bca34048a8b0213b0a608cae5320727f6747b` for `REQ-20260712-302`: `src/lib/bna/crm/contact-service.js` now exposes separate selected-contact `conversations` and `tasks` DTO envelopes, `server.js` exposes protected read-only `/api/bna/crm/contacts/:id/conversations` and `/api/bna/crm/contacts/:id/tasks` routes with server-derived workspace/project scope, and `public/js/crm/crm-api.js` has shared path helpers. BNA deployment `aa2a2f07-7900-4eed-beb8-7fc47e20cfcd` and One Time deployment `11a938f8-387c-43e6-bfa9-5e91d10645fc` reached `SUCCESS`; focused tests, route/action watchdogs, exact-SHA One Time route smoke, live CRM workbench smoke, deploy-info readbacks, and a read-only live endpoint smoke for `/conversations` and `/tasks` passed.
- CRM workspace DTO consumption slice is deployed at `132fdbdb454f51f7c9d073237e8c21b1e5fba070` for `REQ-20260712-302`: the selected contact workspace now fetches timeline, conversations, and tasks through canonical contact DTO endpoints in parallel, stores separate detail payloads, and renders the Conversations and Tasks tabs from server-owned DTOs. BNA deployment `d717976a-69b1-4e9d-9758-9c774b3d468d` and One Time deployment `a698d7a2-6531-40b2-a7e9-1b7868650f0a` reached `SUCCESS`; focused tests, local/live CRM workbench smokes, action/protocol watchdogs, exact-SHA One Time route smoke, deployed JS marker checks, deploy-info readbacks, and read-only endpoint DTO proof passed.
- CRM task DTO actions slice is deployed at `09d239dd095e59299f06c5b3cd38893cd5696fb8` for `REQ-20260712-303`: the selected contact Tasks tab now exposes explicit Complete/Reopen controls on server-owned task DTO rows, using registered `ACTION-CRM-COMPLETE-TASK` and `ACTION-CRM-REOPEN-TASK` markers and the same scoped `api.updateTask` mutation path as linked follow-up task actions. BNA deployment `91aab958-0b12-442b-bf15-545517abc9b9` and One Time deployment `36827b53-3ffb-420e-ac37-2ef329db94ec` reached `SUCCESS`; focused tests, local/live CRM workbench smokes, action/protocol/link/security watchdogs, exact-SHA One Time route smoke, deploy-info readbacks, and deployed JS marker checks passed.
- CRM support-ticket aggregate slice is deployed at `e830ca924a2fd4853fc523a4bad6e55c454bf420` for `REQ-20260712-302`: scoped support tickets now contribute to contact activity counts and selected-contact Activity timeline rows, are labeled as `Support ticket`, and are excluded from Conversations and Tasks DTOs. BNA deployment `2db01b8e-2241-413e-8df1-21a2926e892b` and One Time deployment `2357d677-5991-40e4-8c05-621b201d0ad6` reached `SUCCESS`; focused tests, local/live CRM workbench smokes, tenant-isolation tests, action/protocol/link/security watchdogs, exact-SHA One Time route smoke, deploy-info readbacks, and read-only live DTO proof passed.

## One Time Bot Knowledge / Landing Polish Slice

- Operator correction captured as `RAW-20260713-001`: the One Time WhatsApp bot must know portal/member/library/parent-login/student-login access is not being granted yet, and the public landing header/buttons/hero CTA need a focused polish pass.
- `REQ-20260712-310` is now in progress with a bounded local slice: the existing WhatsApp provider-bot profile/runtime no longer publishes stale portal/member/library/trial/pricing claims as approved facts.
- `config/service-provider-bots/one-time.json` version `2026-07-13-v1` marks offer terms as `not_published_for_bot`, removes portal/library/accountability claims from approved bot benefits, and adds explicit access-policy copy saying portal, library, student-login, parent-login, and member access are not being opened or promised yet.
- `src/lib/bna/provider-lead-bot.js` now treats trial/pricing/access facts as unpublished unless the profile explicitly publishes them, and the deterministic replies/system prompt avoid the old `30-day` / `$67` bot claims.
- One Time public landing header now uses the member-section-style black/yellow lockup and public section nav; yellow button shadows are softened; section/final CTA spacing is tighter; the mobile hero CTA is top-weighted so it clears the bottom browser/launcher zone.
- Product Quality Compiler packet `PKT-20260713-001` validates for this focused public landing/bot-knowledge correction.
- Local verification passed: focused One Time/bot tests `33/33`, local responsive landing smoke with 1440/1024/768/430/390 screenshots, action watchdog, protocol drift watchdog, secret audit, execution-run validation, provider-lead-bot syntax check, and whitespace diff check with line-ending warnings only.
- The focused slice is deployed at `301b408b36fa982d4562d06f30de56758cd0e168`; BNA deployment `640fc22a-5172-4729-ab92-7882426a13e0` and One Time deployment `2c2c7631-a004-4019-bf3f-328cd61cd905` reached `SUCCESS`.
- BNA and One Time deploy-info both returned `301b408b36fa982d4562d06f30de56758cd0e168`; One Time separate-instance smoke and live Rabbi/One Time landing smoke passed.
- V2 operator correction is deployed at `3712308731910a6e77fb9a18ce18b57ae35f22dd`: `config/service-provider-bots/one-time.json` version `2026-07-13-v2` now says "We are not giving portal access yet," and the focused tests assert deterministic replies plus generated system prompt keep portal/member/library/parent-login/student-login access unpublished.
- V2 public polish is live: BNA deployment `77191e2f-0aaf-4fde-ae2c-cf69ce299af8` and One Time deployment `38d75556-5a94-42d3-b8b3-65a5a3290fe7` reached `SUCCESS`, both deploy-info endpoints returned `3712308731910a6e77fb9a18ce18b57ae35f22dd`, and live marker checks confirmed the yellow token/header shadow/mobile CTA/signup-header changes.
- V2 live smokes passed: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 3712308731910a6e77fb9a18ce18b57ae35f22dd` and `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` with report `ops/live-smokes/2026-07-13T00-26-05-640Z-rabbi-onetime-landing-smoke.md`.
- The full channel-independent WhatsApp/email communication-agent model remains open.

## One Time Signup Form P0 Slice

- Operator P0 packet captured as `RAW-20260713-002`: Wave 1 must repair, deploy, and live-verify the One Time Mishnah signup form before continuing public WhatsApp, private Rabbi Telegram, and ticket-approval work.
- Production failure reproduced on `https://join.onetimeonetime.com/one-time/signup` at live SHA `3712308731910a6e77fb9a18ce18b57ae35f22dd`: `Family + No reminders + no phone + no consent` attempted zero POSTs and focused the acknowledgement checkbox with `Check the box to confirm your class-time and reminder preferences.`
- Root cause: the live frontend and server treated acknowledgement/consent as always required, so the `No reminders` branch was blocked by a conditional field that should not have applied. The repair also replaces custom Family/School selection behavior with canonical accessible `audience_type` radio state.
- Local repair is verified and pending deploy: `public/one-time/signup.html` now uses one no-native-bubble validation path, real Family/School and reminder radio inputs, conditional phone/consent validation, no preselected reminders, field-specific accessible errors, one active submit request, and the required success copy.
- Server repair is verified and pending deploy: `src/lib/bna/one-time-signup-workflow.js` exports the canonical signup validation rules, and `server.js` returns the validation response contract, upserts the canonical One Time CRM contact, links signup/legacy lead records, writes a signup communication event, creates zero automatic tasks, and returns `contact_key`/`signup_key`/`confirmation_queued`/`reminder_preference`/`next_path`/`duplicate_submission`.
- Local verification passed: signup matrix/browser tests `17/17`, focused One Time suite `76/76`, action watchdog `finding_count=0`, secret audit, execution-run validation, syntax checks, and whitespace diff check with line-ending warnings only.
- Wave 1 form repair is deployed on One Time at runtime SHA `881f892523eb9a20137377882e2452e45cd581ca`; Railway deployment `35633776-51a0-4185-9bd0-61d73c187d45` reached `SUCCESS` and live `/api/deploy-info` returned the SHA.
- Live verification passed: One Time separate-instance smoke with exact SHA, production browser no-write/intercept submit showing one POST attempt and the approved success panel, and direct-signup API dry-run proving `direct_signup_workflow=true`, scoped workspace/project resolution, outbox previews, no database write, no send, no checkout, and no access grant.
- A synthetic live-write DB-readback attempt created `bna_contacts:37` and `bna_parent_leads:22` before local DB readback failed because the usable Railway database URL is internal-only from this machine. Both records were archived through the production CRM API with `no_send=true` and `external_write_performed=false`; no delivery cron was run. DB-level outbox cancellation remains a Railway-internal cleanup blocker if dispatchable rows exist.
- Additional regression patch deployed: a production form matrix on SHA `e0dd3d48543740efb32b35f64ad27cf0cc6e676b` found that pressing Enter on the Family/School and reminder cards did not check the underlying radios, so the keyboard-only path produced audience/reminder errors and attempted zero POSTs.
- `public/one-time/signup.html` now makes the radio cards focusable and routes Enter/Space through one `activateRadioCard` path that checks the underlying input, dispatches `change`, and preserves the same FormData path as pointer/touch selection.
- The latest One Time deployment `2645a6c7-3b51-4ae6-915f-5a267dacde22` reached `SUCCESS`; live `/api/deploy-info` returned `commit_sha=ee9391d2bd4a1ff3ef41fc99296089254373a4d6`.
- Latest live verification passed: exact-SHA One Time route smoke, full signup form matrix `ops/live-smokes/2026-07-13T09-32-18-347Z-one-time-signup-form-matrix-live.md`, direct signup dry-run `ops/live-smokes/2026-07-13T09-32-18-048Z-one-time-interest-dry-run-live-smoke.md`, CRM workbench smoke `ops/live-smokes/2026-07-13T09-33-33-379Z-one-time-operations-crm-workbench-live-smoke.md`, provider route-module smoke `ops/live-smokes/2026-07-13T09-33-33-717Z-onetime-provider-route-module-live-smoke.md`, and delivery-outbox DTO smoke `ops/live-smokes/2026-07-13T09-32-18-053Z-one-time-crm-delivery-outbox-dto-live-smoke.md`.
- Next action: continue Wave 2/3/4 remaining gated work without delaying the already-live signup form repair.

## One Time Public WhatsApp Agent Slice

- `REQ-20260713-902` is deployed to One Time production; live activation remains blocked by the explicit Telegram notification approval env.
- `config/service-provider-bots/one-time.json` is now public agent profile `one_time_parent_information_agent` version `2026-07-13-v3`, display name `Rabbi Scheller's Digital Assistant`, scoped to `rabbi_sheller_provider` / `one_time_mishnah_class` / WhatsApp.
- Approved public knowledge now includes One Time Mishnayos with Rabbi Eli Scheller, daily 7:00 p.m. Israel time schedule, local address `HaGaon MiVilna 8, Ramat Beit Shemesh Alef`, canonical signup route `/one-time/signup`, and the allowed public audiences.
- The public bot still treats price, trial, portal, library, paid membership, current-learning, and access claims as unpublished unless a verified dynamic/approved source exists.
- Added `ACTION-ONETIME-GET-CURRENT-CLASS-LINK` to `ops/action-registry.json`.
- The deterministic class-link action now releases only for `class_info_requested`, `class_info_consented`, or verified `active_member` policy states; raw class link remains out of persisted audit body, prompt context, metadata, diagnostics, and repo evidence.
- Public WhatsApp readiness reports the new public assistant identity and falls back to `/one-time/signup` when runtime WhatsApp number config is missing.
- Local verification passed: `node --check src/lib/bna/provider-lead-bot.js`, `node --check server.js`, `node --test tests/service-provider-lead-bot.test.js` (10/10), `node --test tests/one-time-brand-helper-isolation.test.js` (11/11), `npm run test:onetime:focused` (76/76), `npm run watchdog:actions`, `npm run secrets:audit`, `npm run bna:run:validate`, and `git diff --check`.
- `node scripts/check-onetime-wapi-readiness.mjs` remained no-send/no-write and reported outbound configured, One Time scoped credentials, provider setup ready, auto-reply ready/enabled/approved, and class link configured.
- Remaining activation blocker: `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM` must equal `APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM`.
- Deployed code commit `9fb436760872bab77019b3769652c8b517025c8d` to One Time Railway deployment `eac01ac4-5589-4c24-b21f-5aea52aeb8d6`; Railway doctor reached `SUCCESS`.
- Live proof passed: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 9fb436760872bab77019b3769652c8b517025c8d`.
- Live public WhatsApp readiness readback returned `Rabbi Scheller's Digital Assistant`, `Public One Time WhatsApp lead agent`, scoped workspace/project, class link configured, full number hidden, and no WhatsApp send/external write performed.

## Rabbi Telegram / Super Admin Ticket Approval Slice

- `REQ-20260713-903` and `REQ-20260713-904` are in progress with a deployed private-ticket/approval-gate slice at `8f6441523a5cd3547ecd4ba633dab90c8951ffd9`.
- Rabbi Telegram ticket capture is now separated from the public WhatsApp lead bot: scoped One Time Telegram tickets use `awaiting_super_admin_approval`, `assigned_to=Shloimie`, `suppress_task_creation=true`, and create zero initial Codex tasks/jobs.
- Super Admin ticket alerts now include a redacted ticket summary plus inline actions for Approve for Codex, Ask Rabbi, Keep as Ticket, Reject, and Open in Operations.
- The shared approval endpoint requires platform Super Admin and idempotently handles `approve_for_codex`, `ask_rabbi`, `keep_as_ticket`, and `reject`; Telegram callbacks call this endpoint instead of a separate mutation path.
- Rabbi status notifications are scoped/redacted and can notify the Rabbi when a ticket is approved, needs more information, kept, or rejected.
- Local verification passed: syntax checks, Rabbi Telegram notification/approval tests `20/20`, related One Time portal/action tests `76/76`, focused One Time suite `76/76`, action watchdog, secret audit, execution-run validation, and whitespace diff check.
- BNA deployment `6ddd918b-3c4a-453d-8a07-8b6a53407607` and One Time deployment `16a16da1-4ca7-491c-87f8-d1f9637de5f7` reached `SUCCESS`; both deploy-info endpoints returned `8f6441523a5cd3547ecd4ba633dab90c8951ffd9`.
- Live proof passed: exact-SHA One Time separate-instance smoke and unauthenticated `approval-action` route guard returning `401 Unauthorized` on both BNA and One Time.
- Telegram readiness no-send audit reports Super Admin and Rabbi Telegram targets configured/ready; this local environment has `ticket_alerts_enabled=false` and `rabbi_communication_alerts_enabled=false`, so no live Telegram send/approval job was created.
- Remaining Wave 3 work: full private Rabbi CRM/content/read/write action surface, content-parsing knowledge binding, and live receiver ownership/409 proof.
- Remaining Wave 4 work: cleanup-safe live synthetic ticket alert/approval proof, Ask Rabbi round trip, Reject proof, and completion evidence notifications.

## Identity Isolation Batch

- `REQ-20260712-305` local code patch is applied and moved to `needs_verification`.
- `bna_contact_identities` now has `workspace_id`, backfill from `bna_contacts`, a dropped legacy global uniqueness constraint, and workspace-scoped uniqueness/indexes.
- Contact identity upserts now insert/conflict on `(workspace_id, identity_type, normalized_value)`.
- Signup contact dedupe, Resend inbound sender contact lookup, WAPI correction lookup, and Whapi history contact import matching now scope identity joins by workspace.
- The identity patch is deployed to both BNA and One Time. Current live `master` SHA is `7fee7ca15874e1964da8d59671322130fe9ed2e0`.
- Live database proof report: `ops/live-smokes/2026-07-12T20-48-11-384Z-crm-identity-isolation-live-smoke.md`.
- Contact conversation thread open slice is deployed under `REQ-20260712-302` through `83427a7a7d7d1c255d83f1e13da24b18265e55fd`: selected-contact conversation DTOs carry safe open metadata, conversation cards expose literal registered email/WhatsApp open actions, and the WhatsApp shortcut now opens the scoped Operations WhatsApp pane instead of an external `wa.me` link. BNA deployment `8744a95d-c510-412a-9f57-f72f69f72ce2` and One Time deployment `16db8dd7-50d7-4ec1-ad79-e951956c07c3` reached `SUCCESS`; exact-SHA One Time route smoke, live CRM workbench smoke, deployed JS marker checks, and read-only live `/conversations` DTO proof passed.
- CRM task DTO actions slice is deployed under `REQ-20260712-303` through `09d239dd095e59299f06c5b3cd38893cd5696fb8`: server-owned task DTO rows now render explicit Complete/Reopen controls that call the shared scoped task handler, BNA deployment `91aab958-0b12-442b-bf15-545517abc9b9` and One Time deployment `36827b53-3ffb-420e-ac37-2ef329db94ec` reached `SUCCESS`, exact-SHA One Time route smoke and live CRM workbench smoke passed, and deployed JS marker checks passed on both domains.
- CRM support-ticket aggregate slice is deployed under `REQ-20260712-302` through `e830ca924a2fd4853fc523a4bad6e55c454bf420`: support-ticket context is now reconciled into contact activity/timeline counts without becoming a conversation row or task row; exact-SHA One Time route smoke, live CRM workbench smoke, tenant-isolation tests, and read-only DTO readback passed.
- CRM signup-context aggregate slice is deployed under `REQ-20260712-302` through `feaece026a62daaf1ff85bdb53ac25ffb246ab89`: One Time product/signup context now travels with canonical contact cards, duplicate legacy lead rows collapse under the canonical `bna_contacts` record by workspace-scoped email/phone, and internal “not loaded” CRM copy was replaced with customer-facing membership/class empty states. BNA deployment `aff0823d-e323-439a-8837-150273689bc4` and One Time deployment `b119d430-216a-43c9-b59a-37b2b8dcfdb1` reached `SUCCESS`; exact-SHA One Time route smoke, live CRM workbench smoke, focused tests `77/77`, and read-only live DTO readback passed with 12 scoped cards, 5 signup-context cards, 0 duplicate email/phone cards, `no_send=true`, and `external_write_performed=false`.
- CRM student/member activity slice is deployed under `REQ-20260712-302` through `381023aad5fdaf1b23ef4c7ab0c12327ee2d369b`: selected-contact Activity timelines now include scoped `student_link` and `membership_access` rows for canonical contacts and legacy lead references, while Conversations and Tasks continue to exclude those aggregate rows. BNA deployment `5b39768d-21ad-4d76-b414-d685447d3542` and One Time deployment `965166eb-7cbb-4935-aa43-9ca497978b4e` reached `SUCCESS`; exact-SHA One Time route smoke, live CRM workbench smoke, focused tests `77/77`, and read-only live DTO readback passed. Current sampled One Time live data had no student/member rows, so live proof is route/exclusion health plus local/test row coverage.
- CRM class-attendance activity slice is deployed under `REQ-20260712-302` through `593398dd6f3f927e321c24fad4bd2d01e13dcd51`: selected-contact Activity timelines now include scoped `class_attendance` rows from `bna_live_class_attendance` joined through One Time members and live class sessions for canonical contacts and legacy lead references, while Conversations and Tasks continue to exclude attendance aggregate rows. BNA deployment `8886d1ce-677e-406e-a34f-49313e9fde86` and One Time deployment `1bef031c-3522-440f-8e62-ac33972515cb` reached `SUCCESS`; exact-SHA One Time route smoke, live CRM workbench smoke, focused tests `77/77`, and read-only live DTO readback passed. Current sampled One Time live data had no class-attendance rows, so row behavior is covered by tests/local smoke and live proof confirms route/exclusion health.
- CRM communication consent/suppression DTO slice is deployed under `REQ-20260712-302` through `0e33764d66519d8f45d86e57b320a1988a604058`: canonical contact cards now expose `communication_preference`, `consent_status`, `suppression_status`, and structured `communication_preferences` derived from contact/lead/signup metadata without returning raw internals. BNA deployment `1cf2ff91-2ead-4124-851d-a71b17742b56` and One Time deployment `57c2454e-60e2-40e9-9214-b7f5572df6c6` reached `SUCCESS`; exact-SHA One Time route smoke, live CRM workbench smoke, focused tests `78/78`, and read-only live DTO readback passed with 12/12 scoped cards carrying communication preferences.
- CRM suppression/opt-out Activity timeline slice is deployed under `REQ-20260712-302` through `e4d6977c2a8db5ec1d8d37c4e7efa23b72eff5d1`: selected-contact timelines now emit a read-only `communication_suppression` row when a workspace-scoped contact or parent lead carries suppressed, unsubscribed, invalid, bounced, stopped, wrong-number, do-not-contact, or opt-out state; Conversations and Tasks DTOs explicitly exclude those rows. BNA deployment `476ad2fb-8178-44b2-af2d-20d2eb7f15cd` and One Time deployment `9fd12f58-f9ca-4eb3-b581-e0b9f7aca3f9` reached `SUCCESS`; exact-SHA One Time route smoke, live CRM workbench smoke, focused tests `78/78`, and read-only live DTO readback passed with 12 scoped cards and `suppression_conversation_rows=0`.
- CRM selected-contact email-thread DTO slice is deployed under `REQ-20260712-302` through `298751d8d940c02ce4c8a9c70c5b36862ea67766`: canonical contacts and legacy One Time parent leads now surface scoped first-party `bna_communications` email rows in selected-contact timelines/conversations without browser-side mailbox unions. BNA deployment `fccc5a3d-2f96-4c7f-a8ab-5fae904b1bf7` and One Time deployment `4002d6ca-6a1c-483b-bd56-65906d60020e` reached `SUCCESS`; deploy-info readbacks matched the SHA, exact-SHA One Time route/CRM/provider smokes passed, BNA workspace taxonomy smoke passed, and read-only DTO proof found 8 mailbox candidates plus 1 selected-contact email conversation with `no_send=true` and no external writes.
- `RAW-20260713-003` control correction is registered as `REQ-20260713-905`: One Time is now the current canonical implementation target, simultaneous BNA frontend parity is superseded for this phase, shared API/security/privacy/database regression checks remain in scope, and replacement packets `REQ-20260713-906` through `REQ-20260713-911` cover owner-only live tests, architecture/performance baseline, dedicated One Time app shell, mobile CRM IA, independent performance/integration verification, and performance regression gates/final proof sections.

## CRM Legacy Contact-Note DTO Fallback - 2026-07-13

- `REQ-20260712-302` remains in progress, with the legacy contact-note DTO runtime implemented at `a1113546bcbc86e31624cf38dbd71c0f567476d6` and final deployed proof SHA `e0dd3d48543740efb32b35f64ad27cf0cc6e676b`.
- `server.js` now includes scoped `bna_contact_communications` rows in selected canonical `bna_contacts` timelines/conversations when linked by explicit canonical contact metadata, legacy lead canonical keys, `parent_lead_id`, or same-project lead email.
- The selected-contact DTO path does not merge arbitrary legacy metadata into the browser payload; it emits redacted provenance, `no_send=true`, and `external_write_performed=false`.
- BNA Railway deployment `b35f96f7-f610-410a-b206-86b6900c07f0` and One Time Railway deployment `99ea47d8-a5a1-4403-b435-a732b7df21d1` reached `SUCCESS`.
- Both live deploy-info endpoints returned `commit_sha=e0dd3d48543740efb32b35f64ad27cf0cc6e676b` with `target_app=bna` and `target_app=one-time`.
- Live proof passed: One Time separate-instance exact-SHA smoke, One Time provider route-module smoke `ops/live-smokes/2026-07-13T08-59-55-777Z-onetime-provider-route-module-live-smoke.md`, One Time CRM workbench smoke `ops/live-smokes/2026-07-13T09-00-20-966Z-one-time-operations-crm-workbench-live-smoke.md`, email-thread DTO smoke `ops/live-smokes/2026-07-13T09-00-20-963Z-one-time-crm-email-thread-dto-live-smoke.md`, Operations taxonomy smoke `ops/live-smokes/2026-07-13T09-00-42-212Z-operations-workspace-taxonomy-live-smoke.md`, and exact-SHA One Time performance gate.
- Targeted legacy contact-note live probe wrote `ops/live-smokes/2026-07-13T09-00-20-964Z-one-time-crm-contact-notes-dto-live-smoke.md`; production returned 7 canonical contacts but no positive canonical contact-note sample, so it recorded `skipped_no_live_contact_notes` without creating synthetic data.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw note/message logging, or production data mutation was performed.

## CRM Delivery Outbox Activity DTO - 2026-07-13

- `REQ-20260712-302` remains in progress, with the delivery-outbox Activity DTO slice implemented at `fc36995bf85e31b988e1d7e1d756bf4e51e00ca4` and deployed at `ee9391d2bd4a1ff3ef41fc99296089254373a4d6`.
- `server.js` now includes scoped `assistant_delivery_outbox` rows in selected-contact Activity timelines for canonical `bna_contacts` and legacy `bna_parent_leads` when One Time outbox rows exist.
- `src/lib/bna/crm/contact-service.js` keeps `delivery_outbox` rows out of Conversations and Tasks so queued/sent/failed/dead-letter delivery state is not presented as a sent message or task.
- DTO source context is redacted: `message_body_returned=false`, `recipient_returned=false`, `no_send=true`, and `external_write_performed=false`.
- BNA Railway deployment `b49f07c2-86e5-44d3-8092-e4ed1bdaed2e` reached `SUCCESS`; latest verified One Time Railway deployment `2645a6c7-3b51-4ae6-915f-5a267dacde22` reached `SUCCESS`.
- Both live deploy-info endpoints returned `commit_sha=ee9391d2bd4a1ff3ef41fc99296089254373a4d6`; One Time returned `target_app=one-time`.
- Live proof passed: One Time exact-SHA separate-instance smoke, One Time CRM workbench smoke, One Time provider route-module smoke, Operations workspace taxonomy smoke, and One Time performance regression gate.
- Targeted delivery-outbox DTO live probe wrote `ops/live-smokes/2026-07-13T09-32-18-053Z-one-time-crm-delivery-outbox-dto-live-smoke.md`; production returned 7 canonical contacts but no live delivery_outbox rows, so it recorded `skipped_no_live_delivery_outbox` without creating synthetic data.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw recipient/body logging, or production data mutation was performed.

## CRM Delivery Dead-Letter Activity DTO - 2026-07-13

- `REQ-20260712-302` remains in progress, with the delivery dead-letter Activity DTO slice implemented, pushed, deployed, and live-smoked at `01d5a054ad99ba0a41196b18fc5b8098972e1d5a`.
- `server.js` now includes redacted `assistant_dead_letters` rows in selected-contact Activity timelines for canonical `bna_contacts` and legacy `bna_parent_leads` when One Time dead-letter rows exist through the existing delivery-outbox lead mapping.
- Conversations and Tasks explicitly exclude `delivery_outbox` and `delivery_dead_letter` operational rows, so queued/failed/dead-letter delivery state is not presented as a message thread or task.
- DTO source context is redacted: `reason_returned=false`, `payload_returned=false`, `message_body_returned=false`, `recipient_returned=false`, `no_send=true`, and `external_write_performed=false`.
- BNA Railway deployment `86b1d98c-d4d3-4c52-8f0f-784ebee3deef` reached `SUCCESS`; One Time Railway deployment `7c81033a-ffc4-46e2-b2f5-f8ff0da1cf91` reached `SUCCESS`.
- Both live deploy-info endpoints returned `commit_sha=01d5a054ad99ba0a41196b18fc5b8098972e1d5a` with target apps `bna` and `one-time`.
- Live proof passed: One Time exact-SHA separate-instance smoke, One Time CRM workbench smoke, One Time provider route-module smoke, delivery-outbox DTO regression smoke, Operations workspace taxonomy smoke, and One Time performance regression gate.
- Targeted delivery dead-letter DTO live probe wrote `ops/live-smokes/2026-07-13T09-51-50-226Z-one-time-crm-dead-letter-dto-live-smoke.md`; production returned 7 canonical contacts but no live dead-letter rows, so it recorded `skipped_no_live_dead_letters` without creating synthetic data.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw recipient/body/reason/payload logging, or production data mutation was performed.

## CRM Signup Context And Lifecycle Activity DTO - 2026-07-13

- `REQ-20260712-302` remains in progress, with the signup-context/lifecycle Activity DTO slice implemented, pushed, deployed, and live-smoked at `c2b0878b66a50679589ee240ebdbd194622008fa`.
- `server.js` now includes scoped `bna_product_leads` rows as selected-contact `signup_context` Activity rows for canonical `bna_contacts` and legacy `bna_parent_leads`; payment links, checkout sessions, access grants, sends, and external-write flags remain redacted/false.
- `server.js` also emits redacted `bna_contact_pipeline_events` as `lifecycle_event` Activity rows for canonical contacts; raw pipeline metadata is not returned.
- `src/lib/bna/crm/contact-service.js` and `server.js` keep `signup_context` and `lifecycle_event` aggregate rows out of Conversations and Tasks.
- BNA Railway deployment `2efc3746-dbf0-4531-b4c2-d82ab1a61898` reached `SUCCESS`; One Time Railway deployment `36d753a9-b0f0-4dd6-a757-c7eb8b2f0bcb` reached `SUCCESS`.
- Both live deploy-info endpoints returned `commit_sha=c2b0878b66a50679589ee240ebdbd194622008fa` with target apps `bna` and `one-time`.
- Live proof passed: One Time exact-SHA separate-instance smoke, One Time CRM workbench smoke, One Time provider route-module smoke, BNA Operations workspace taxonomy smoke, and One Time performance regression gate.
- Targeted signup-context DTO live probe wrote `ops/live-smokes/2026-07-13T10-17-24-142Z-one-time-crm-signup-context-dto-live-smoke.md`; production had `signup_context_candidate_count=1` and `signup_context_match=true` without creating synthetic data.
- Owner-only live integration testing remains blocked only by missing secure owner aliases; refreshed readiness report `ops/watchdog-audits/2026-07-13T10-06-52-478Z-onetime-owner-test-readiness.md` shows Resend and WAPI ready, owner aliases missing, and no send performed.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw contact/message/destination logging, or production data mutation was performed by this DTO smoke.

## CRM Phone / WhatsApp Communication Matching DTO - 2026-07-13

- `REQ-20260712-302` remains in progress, with the selected-contact phone/WhatsApp communication matching slice implemented, pushed, deployed, and live-smoked at `35a0a5d2e0ad157e383537dfbb1518d2a8df33bd`.
- Runtime app-code commit `c00b46668111bbc898ddc7a571fe8d3605d6384d` added workspace/project-scoped normalized phone matching for `bna_communications` rows on canonical `bna_contacts` and legacy One Time parent leads. Final deployed commit `35a0a5d2e0ad157e383537dfbb1518d2a8df33bd` adds the redacted live smoke harness and npm hook.
- Selected-contact timelines/conversations now match communications by explicit contact id, scoped primary email, or scoped normalized primary phone. Source context stays redacted with no-send/external-write guardrails, and mailbox counts now include scoped phone-matched communication rows.
- BNA Railway deployment `a6b1ffeb-038f-45a4-b04f-ff5dc00b3125` reached `SUCCESS`; One Time Railway deployment `61721d1e-977b-4ffe-a6a2-d8cda226abf1` reached `SUCCESS`.
- Both live deploy-info endpoints returned `commit_sha=35a0a5d2e0ad157e383537dfbb1518d2a8df33bd` with target apps `bna` and `one-time`.
- Live proof passed: exact-SHA One Time separate-instance smoke, One Time CRM workbench smoke, One Time provider route-module smoke, BNA workspace taxonomy smoke, One Time performance gate, signup-context regression smoke, and the new WhatsApp DTO smoke.
- Targeted WhatsApp DTO live probe wrote `ops/live-smokes/2026-07-13T10-35-15-518Z-one-time-crm-whatsapp-thread-dto-live-smoke.md`; production returned `phone_candidate_count=2` and `selected_contact_whatsapp_thread_match=true` without synthetic data or external writes.
- Owner-only email/WhatsApp sends remain blocked only by missing secure owner-test aliases; no owner-test send or public auto-reply activation was attempted in this slice.

## CRM Direct Signup Record Activity DTO - 2026-07-13

- `REQ-20260712-302` remains in progress, with the direct signup-record Activity DTO slice implemented by runtime commit `dab78d4e0b05b6e59affe08864e7207d2235652f`, deployed/proved on One Time at `1318c67da0d79e7a158aa0b13d3085906ffcdf15`, and BNA-regression checked at current proof-refresh head `d12e31694f2a0475936c945f1d7ec0d0c2c35664`.
- Selected-contact Activity timelines now include scoped direct `signups` rows as redacted `signup_record` DTOs for canonical contacts and legacy One Time leads.
- Conversations and Tasks continue to exclude `signup_record` aggregate rows, so direct signup records do not masquerade as message threads or follow-up tasks.
- DTO source context preserves no-send/no-access/no-payment guardrails: `no_send=true`, `external_write_performed=false`, `no_checkout=true`, `no_access_granted=true`, `student_name_returned=false`, `payment_link_returned=false`, and `checkout_session_returned=false`.
- Added `app:smoke:onetime-crm-signup-record-dto` for redacted read-only production proof.
- BNA Railway doctor reports current deployment `896c0a2f-ed48-4d44-ae6d-b415c669bd8d` reached `SUCCESS`; One Time Railway deployment `af6b2ea0-721e-42de-b487-fe9ef7ea27c8` reached `SUCCESS`.
- One Time live deploy-info returned `commit_sha=1318c67da0d79e7a158aa0b13d3085906ffcdf15` with `target_app=one-time`; BNA live deploy-info currently returns `commit_sha=d12e31694f2a0475936c945f1d7ec0d0c2c35664`, a proof-refresh head containing the same runtime changes.
- Live proof passed: exact-SHA One Time separate-instance smoke, One Time CRM workbench smoke, One Time provider route-module smoke, BNA workspace taxonomy smoke including current-head recheck `ops/live-smokes/2026-07-13T11-00-32-825Z-operations-workspace-taxonomy-live-smoke.md`, WhatsApp DTO regression smoke, signup-context DTO regression smoke, and One Time performance gate.
- Targeted signup-record DTO live probe wrote `ops/live-smokes/2026-07-13T10-52-56-884Z-one-time-crm-signup-record-dto-live-smoke.md`; production returned 12 scoped cards but no live direct signup rows in the inspected timelines, so it recorded `skipped_no_live_signup_records` without creating synthetic data.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw signup private data logging, or production data mutation was performed by this DTO smoke.

## CRM Website Assistant Thread Activity DTO - 2026-07-13

- `REQ-20260712-302` remains in progress, with the website assistant-thread Activity DTO slice implemented, pushed, deployed, and live-smoked at `8ea2cd06e1920eecfd1ae97b937c22d701c00099`.
- Selected-contact Activity timelines now include scoped public `bna_assistant_threads` rows as redacted `assistant_thread` DTOs for canonical contacts and legacy One Time leads.
- Conversations and Tasks continue to exclude `assistant_thread` aggregate rows, so website assistant context does not masquerade as a customer message thread or CRM task.
- DTO source context preserves no-send/no-body guardrails: `body_returned=false`, `message_body_returned=false`, `no_send=true`, and `external_write_performed=false`; the smoke records only counts and booleans, not assistant message bodies or contact identifiers.
- Added `app:smoke:onetime-crm-assistant-thread-dto` for redacted read-only production proof.
- BNA Railway deployment `55f38854-f00a-4432-bfdf-0dfcf6c400fc` reached `SUCCESS`; One Time Railway deployment `c2b6b88a-036a-4a33-93d9-3bd2f9de7719` reached `SUCCESS`.
- One Time live deploy-info returned `commit_sha=8ea2cd06e1920eecfd1ae97b937c22d701c00099` with `target_app=one-time`; BNA live deploy-info returned the same SHA with `target_app=bna`.
- Live proof passed: exact-SHA One Time separate-instance smoke, One Time CRM workbench smoke, One Time provider route-module smoke, BNA workspace taxonomy smoke, assistant-thread DTO smoke, WhatsApp DTO regression smoke, signup-context DTO regression smoke, signup-record DTO regression smoke, and One Time performance gate.
- Targeted assistant-thread DTO live probe wrote `ops/live-smokes/2026-07-13T11-11-46-025Z-one-time-crm-assistant-thread-dto-live-smoke.md`; production returned `inspected_candidate_count=1` and `assistant_thread_match=true` with zero assistant-thread rows in selected-contact Conversations.
- Guardrails: no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, credential mutation, raw assistant body/contact logging, or production data mutation was performed by this DTO smoke.

## Shared CRM Current-Phase Closeout - 2026-07-13

- `REQ-20260712-302` is Done for the current One Time-first acceptance scope.
- Latest deployed/proved runtime SHA remains `8ea2cd06e1920eecfd1ae97b937c22d701c00099`; no new runtime deploy was required for this documentation/status closeout.
- Closeout proof passed: `npm run pqc:validate -- tasks-pending/2026-07-12-shared-crm-workbench-slice.product-quality.json`, `npm run operations:build`, `npm run operations:check-generated`, `node --check server.js`, focused CRM/model/isolation tests `46/46`, action watchdog, secrets audit, and protocol-drift watchdog with zero findings.
- `RAW-20260713-003` still defers simultaneous BNA CRM frontend parity; BNA remains protected by shared runtime, API/security/privacy/database, taxonomy, and workspace-isolation regression proof.
- Dedicated CRM actions remain open under `REQ-20260712-303`; owner-only send verification remains blocked by `REQ-20260713-906` until secure owner email/WhatsApp aliases exist.
- The new One Time Drive/Classroom automation raw packet `RAW-20260713-004` is registered separately; its control packet and code/current-state capability audit are done, but Drive intake, transcription, metadata, upload, classroom publication, UI, and release packets remain open.

## Canonical CRM Contact Aggregate Service - 2026-07-13

- `REQ-20260712-306` is Done at deployed runtime SHA `8ea2cd06e1920eecfd1ae97b937c22d701c00099`.
- The server-owned canonical contact service in `src/lib/bna/crm/contact-service.js` returns the required list, selected aggregate/timeline, conversations, and tasks DTO envelopes by stable `contact_key`; the browser no longer owns a union of independent CRM/communication datasets for selected-contact detail.
- Operations routes delegate selected-contact DTO loading through `operationsCrmContactService`, with server-side workspace/project scope derivation before row loading.
- The deployed aggregate covers the scoped One Time contact record, communications, legacy contact communications, support tickets, product/signup context, direct signups, assistant threads, lifecycle events, follow-up tasks, student/member/access context, live class attendance, suppression, delivery outbox, and delivery dead-letter rows.
- Contract tests explicitly reject browser-side contact/conversation union helpers and pin the dedicated server DTO routes.
- Live proof at SHA `8ea2cd06e1920eecfd1ae97b937c22d701c00099`: One Time CRM workbench smoke passed with 12 scoped cards, assistant-thread DTO proof found a positive Activity match, WhatsApp and signup-context DTO regressions found positive matches, signup-record DTO safely skipped only because sampled production had no direct signup rows, and BNA taxonomy regression passed.
- Remaining `REQ-20260712-302` work is shared CRM product/UI breadth and One Time-first action polish, not the canonical aggregate service contract itself.

## Dedicated CRM Actions Closeout - 2026-07-13

- `REQ-20260712-303` is Done. The dedicated contact workspace has URL/back-state and mobile one-pane behavior plus the full persisted first-party action matrix.
- Implemented/deployed action coverage: Add Contact, field-specific Edit/Update through the CRM update form, Add Note, Add Tag, Remove Tag, Assign Owner, Change Lifecycle, Set/Change/Clear Follow-up, Create Task, Complete Task, Reopen Task, Open scoped email inbox/thread, Open WhatsApp thread, Link Family, Link Student, Link Member, and Archive Contact.
- The email-thread action is represented by the existing registered `ACTION-CRM-OPEN-SCOPED-INBOX` control, which opens the scoped email inbox/thread context without browser-side data union.
- Final closeout proof used the already-deployed One Time runtime SHA `8ea2cd06e1920eecfd1ae97b937c22d701c00099`; no new runtime deploy was required.
- Verification passed: focused CRM tests `46/46`, local One Time CRM workbench smoke, action watchdog finding_count `0`, and production read-only marker proof for 18 CRM action IDs on `https://join.onetimeonetime.com/operations.html`.
- Guardrails: closeout performed no external send, WhatsApp/WAPI send, Telegram send, CRM mutation, provider mutation, payment/access mutation, import, credential mutation, or production data mutation.

## CRM Internal-Copy Cleanup - 2026-07-13

- `REQ-20260712-304` is Done. Normal One Time/Rabbi CRM contact workspace, source-review, and email-contact staging surfaces now use customer-facing copy instead of internal no-send/external-write explanations.
- Cleaned visible copy for Add Contact, CRM update, selected-contact empty state, timeline, task state changes, create/complete/reopen task notices, scoped email/WhatsApp thread-open notices, member/family/student link panels, archive confirmation, legacy source-review labels, and email-contact tags.
- Safety metadata remains intact in API/source-context payloads and tests: `no_send=true`, `external_write_performed=false`, paused/member/student access states, and registered action IDs are still asserted.
- Runtime commit `a8df4c9b9cc091028105a16430aae6927cd0b429` was pushed to `origin/master`, deployed to One Time deployment `6059d148-7708-43ae-9665-abdaa544a5d6` and BNA deployment `298894e0-1890-4c39-98e7-aa9461883660`, and both `/api/deploy-info` endpoints returned the exact SHA.
- Verification passed: 47/47 focused CRM/contact tests, generated Operations shell check, local One Time CRM workbench smoke, One Time live CRM workbench smoke, BNA workspace taxonomy smoke, action watchdog finding_count `0`, run validator, diff check, and secrets audit.
- Next unblocked shared-CRM lane is `REQ-20260712-307` inbound communication pipeline. Owner-only live email/WhatsApp sends remain blocked by `REQ-20260713-906` until secure owner-test aliases are configured.

## Canonical Inbound Communication Runtime Slice - 2026-07-13

- `REQ-20260712-307` is In progress. The first runtime slice is pushed, deployed, and live-smoked, but the whole requirement is not terminal Done yet.
- Runtime commit `a692c6e002a09557b81c350c5c0187222d87b7de` added `src/lib/bna/crm/ingest-inbound-communication.js`; production head `f8df93a4ca86ecd607d5c3b63d113f77be4327c2` includes it.
- Resend inbound email now delegates canonical persistence to the shared service. The service contract also covers One Time WAPI-shaped inbound messages for workspace/project binding, contact identity resolution, canonical `bna_communications` rows, unread/timeline metadata, redacted receipts, idempotency, and zero ordinary task creation.
- One Time Railway deployment `641ad29c-d8d6-4053-b4d3-c7412fa6b7d7` and BNA Railway deployment `68858c05-474e-4419-91c7-d934e7796305` reached `SUCCESS`; both `/api/deploy-info` endpoints returned exact SHA `f8df93a4ca86ecd607d5c3b63d113f77be4327c2`.
- Verification passed: inbound tests `11/11`, broader inbound/contract tests `26/26`, One Time separate-instance smoke, One Time provider-route smoke, One Time CRM workbench smoke, and BNA workspace taxonomy smoke.
- Remaining `REQ-20260712-307` work: migrate website assistant input and private Rabbi Telegram input through the canonical service, then attach published communication-agent/version/knowledge loading and delivery-outbox execution. Owner-only sends remain blocked by `REQ-20260713-906`.

## Canonical Inbound Communication Pipeline Runtime Slice - 2026-07-13

- `REQ-20260712-307` is In progress with the first runtime slice deployed. It is not terminal Done yet.
- Runtime commit `a692c6e002a09557b81c350c5c0187222d87b7de` added `src/lib/bna/crm/ingest-inbound-communication.js` and connected Resend inbound email plus One Time WAPI inbound mirroring to the canonical service.
- The canonical service handles explicit binding/workspace/project resolution, contact creation/reuse, workspace-scoped identities, canonical `bna_communications` persistence, unread/timeline metadata, redacted receipts, idempotency, and zero ordinary task creation.
- Current production head `f8df93a4ca86ecd607d5c3b63d113f77be4327c2` includes the inbound runtime slice and is live on both One Time and BNA.
- One Time Railway doctor passed for deployment `641ad29c-d8d6-4053-b4d3-c7412fa6b7d7`; One Time deploy-info returned the exact current SHA and target app. Current-head One Time CRM smoke passed at `ops/live-smokes/2026-07-13T12-25-01-672Z-one-time-operations-crm-workbench-live-smoke.md`.
- BNA Railway doctor passed for deployment `68858c05-474e-4419-91c7-d934e7796305`; BNA deploy-info returned the exact current SHA. Current-head BNA taxonomy smoke passed at `ops/live-smokes/2026-07-13T12-25-01-801Z-operations-workspace-taxonomy-live-smoke.md`.
- Local proof before the runtime commit passed the new inbound/service tests and shared CRM regression suite `49/49`, syntax checks, generated Operations shell check, run validator, diff check, and secrets audit. Current focused proof also passed `tests/inbound-communication-pipeline.test.js` `4/4`, inbound/Resend service suite `11/11`, and broader inbound/communication contract suite `26/26`.
- Remaining work for `REQ-20260712-307`: route website assistant input, private Rabbi Telegram input, communication-agent version/knowledge loading, and delivery-outbox execution through the same canonical service.
- Owner-only live email/WhatsApp sends remain blocked by `REQ-20260713-906` until secure owner-test aliases are configured through the approved secret path.

## Canonical Inbound Website Assistant And Rabbi Telegram Slice - 2026-07-13

- `REQ-20260712-307` remains In progress, but website assistant input and
  private Rabbi Telegram approval-ticket intake now route through the canonical
  inbound service.
- Existing website assistant user-message mirroring remains wired through
  `mirrorAssistantUserMessageToInboundCommunication`, with assistant message
  receipts recorded as redacted assistant tool-call metadata and no external
  send.
- Runtime commit `c8865b070b8f2ee59615ad2a3ddf21ee171a32d8` adds
  `mirrorRabbiTelegramSupportTicketToInboundCommunication`: Rabbi Telegram
  support tickets are mirrored into `bna_communications` with ticket linkage,
  hashed Telegram identifiers, no Telegram chat-id-to-phone coercion, no
  contact identity creation, no ordinary task creation, no outbox send, and a
  redacted canonical receipt on the support ticket source context.
- The mirror uses a savepoint so support-ticket capture is preserved even if
  canonical communication capture fails; failures are recorded as no-send,
  redacted `canonical_inbound_communication.status=failed` context.
- One Time Railway deployment `ca335eed-37f9-4c47-acf3-cb310d1c80da` and BNA
  Railway deployment `cb2ee7e7-abee-4cbf-95ec-a12711a25442` reached `SUCCESS`.
- One Time deploy-info returned
  `commit_sha=c8865b070b8f2ee59615ad2a3ddf21ee171a32d8`,
  `target_app=one-time`; BNA deploy-info returned the same commit with
  `target_app=bna`.
- Live proof passed: One Time separate-instance smoke, One Time CRM workbench
  smoke, One Time provider route-module smoke, and BNA workspace taxonomy smoke
  at exact SHA `c8865b070b8f2ee59615ad2a3ddf21ee171a32d8`.
- Remaining `REQ-20260712-307` work: attach published
  communication-agent/version/knowledge loading and delivery-outbox execution
  to the canonical inbound path. Owner-only email/WhatsApp live sends remain
  blocked by `REQ-20260713-906`.
## 2026-07-13 - Communication-Agent Metadata And Outbox Convergence Local Proof

- Advanced `REQ-20260712-307` with the local communication-agent/outbox slice.
- `src/lib/bna/crm/communication-agent-runtime.js` now loads the existing
  published One Time provider lead-bot profile as the channel-assigned
  communication agent for One Time email and WhatsApp.
- Canonical inbound `bna_communications` metadata and redacted receipts now
  include agent key, version, knowledge snapshot, binding key, reply mode, and
  no-secret/no-raw-class-link flags.
- `whatsapp:one_time_agent_reply` is now an allowed One Time delivery-outbox
  channel; class-link replies store a placeholder in the outbox payload and
  substitute the server-approved link only at final provider delivery.
- `maybeSendOneTimeWapiAutoReply` now claims/dedupes the bot reply and queues
  `assistant_delivery_outbox` instead of calling WAPI directly from the webhook
  auto-reply handler.
- Local verification passed: focused agent/inbound/outbox suite `30/30`,
  adjacent inbound/outbox suite `16/16`, `node --check` for touched runtime
  files, and `npm run bna:run:validate`.
- Deployment/live smoke pending for this slice. Owner-only email/WhatsApp live
  sends remain blocked by `REQ-20260713-906` until secure aliases exist.

## 2026-07-13 - Canonical Inbound Communication Pipeline Closeout

- `REQ-20260712-307` is Done for the canonical inbound pipeline scope.
- Commit `40ffdc1aca34a02774275ba7b2902e46c709e9ce` pushed the
  communication-agent metadata/outbox runtime slice to `origin/master`; it is
  included in integrated deployed head
  `43f7c33733880745d8f1191c86fe8e196ef68baa`.
- One Time Railway deployment `9cc413fb-da9b-42f4-a2b1-ce5b6744d2cb`
  reached `SUCCESS`; `/api/deploy-info` returned exact SHA
  `43f7c33733880745d8f1191c86fe8e196ef68baa` and `target_app=one-time`.
- BNA Railway doctor passed for deployment
  `c4f33394-0881-425b-a2de-c862e44dd09e`; `/api/deploy-info` returned exact
  SHA `43f7c33733880745d8f1191c86fe8e196ef68baa`.
- Live proof passed: One Time separate-instance smoke, One Time CRM workbench
  smoke, One Time provider route-module smoke, and BNA workspace taxonomy smoke
  at the exact deployed SHA.
- Evidence reports: `ops/live-smokes/2026-07-13T13-24-30-029Z-one-time-operations-crm-workbench-live-smoke.md`,
  `ops/live-smokes/2026-07-13T13-24-38-990Z-onetime-provider-route-module-live-smoke.md`,
  and `ops/live-smokes/2026-07-13T13-24-53-876Z-operations-workspace-taxonomy-live-smoke.md`.
- Owner-only live email/WhatsApp sends remain blocked by
  `REQ-20260713-906` until secure aliases exist; no owner-test send, WAPI send,
  Telegram send, public auto-reply enablement, credential mutation, payment or
  access mutation, raw private payload logging, or destructive production
  mutation was performed in this closeout.

## 2026-07-13 - One Time WAPI Zero-Task Contact Capture Closeout

- `REQ-20260712-308` is Done.
- Runtime commit `7ec31290c08ede0957dbd60b2c3253979253feba` suppresses generic
  CRM task creation for One Time WAPI attention artifacts when
  `create_task_on_inbound=false` / `ordinary_inbound_creates_task=false`.
- Provider-bot support tickets now dedupe by
  workspace/project/contact/thread/action class and store only a thread hash,
  not the raw thread key; fallback same-message idempotency remains for legacy
  rows.
- Clean-worktree verification passed: `node --check server.js`, WAPI/bot/
  inbound/outbox tests `29/29`, and communications-screening tests `5/5`.
- One Time Railway deployment `75d521fa-6826-49f5-875a-5f6f03f3dc44`
  reached `SUCCESS`; One Time `/api/deploy-info` returned exact SHA
  `7ec31290c08ede0957dbd60b2c3253979253feba`.
- BNA `/api/deploy-info` returned exact SHA
  `7ec31290c08ede0957dbd60b2c3253979253feba` and BNA taxonomy smoke passed;
  Railway doctor access passed, but the current Railway deployment status still
  reported `BUILDING` during closeout.
- Live proof passed: One Time separate-instance smoke, One Time CRM workbench
  smoke, One Time provider route-module smoke, and BNA workspace taxonomy smoke.
- Evidence reports: `ops/live-smokes/2026-07-13T13-45-08-361Z-one-time-operations-crm-workbench-live-smoke.md`,
  `ops/live-smokes/2026-07-13T13-44-50-006Z-onetime-provider-route-module-live-smoke.md`,
  and `ops/live-smokes/2026-07-13T13-44-53-216Z-operations-workspace-taxonomy-live-smoke.md`.
- Owner-only live WAPI send/inbound proof remains blocked by
  `REQ-20260713-906` secure aliases; no external send, public auto-reply
  enablement, credential mutation, payment/access mutation, raw private payload
  logging, or destructive production mutation was performed.
