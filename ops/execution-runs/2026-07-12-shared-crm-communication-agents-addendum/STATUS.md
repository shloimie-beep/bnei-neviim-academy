# Status

Current status: `active`

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
- Main addendum implementation is not complete; identity isolation is the first active implementation batch.
- `REQ-20260712-305` is complete. Continue `REQ-20260712-306` next.

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
- Next action: continue Wave 2 public WhatsApp lead-agent activation without delaying the already-deployed form repair.

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

## Identity Isolation Batch

- `REQ-20260712-305` local code patch is applied and moved to `needs_verification`.
- `bna_contact_identities` now has `workspace_id`, backfill from `bna_contacts`, a dropped legacy global uniqueness constraint, and workspace-scoped uniqueness/indexes.
- Contact identity upserts now insert/conflict on `(workspace_id, identity_type, normalized_value)`.
- Signup contact dedupe, Resend inbound sender contact lookup, WAPI correction lookup, and Whapi history contact import matching now scope identity joins by workspace.
- The identity patch is deployed to both BNA and One Time. Current live `master` SHA is `7fee7ca15874e1964da8d59671322130fe9ed2e0`.
- Live database proof report: `ops/live-smokes/2026-07-12T20-48-11-384Z-crm-identity-isolation-live-smoke.md`.
