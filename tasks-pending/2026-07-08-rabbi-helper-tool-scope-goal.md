# 2026-07-08 - Rabbi Helper Tool Scope Goal

## Raw intake

Preserved in
`raw-input/RAW-20260708-028-rabbi-helper-tool-scope-goal.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260708-028` |
| Source | `codex_chat` |
| Parse status | `registered` |
| Requirement register | `tasks-pending/2026-07-08-rabbi-helper-tool-scope-goal.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Scope every current helper parity gap for the Rabbi / One Time bot into an account-scoped natural-language tool contract, create Agent Mode test prompts, and work the resulting register to terminal statuses with proof or blockers. |
| Goal tool used | yes |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | Continue `REQ-20260708-095`; all 163 contracts are local wrapper-backed, pushed, and deployed/live-smoked on current OneTime Railway deployment `c4548c39-b215-4f45-ab3d-27185c2a86ba`; full autonomy remains blocked by saved all-163 Agent Mode proof, external approval gates, per-tool live audit readback, and automatic subaccount provisioning from the scope template |

## Scope Rules

- The Rabbi bot account is locked to `rabbi_sheller_provider` /
  `one_time_mishnah_class`.
- Server code must recompute workspace/project/provider scope from the
  authenticated helper account. Browser/client scope cannot be trusted.
- Parent/student records are available to the Rabbi bot only as provider-visible
  One Time classroom/contact summaries, never by parent/student impersonation.
- BNA Academy, global Operations, unrelated provider, unrelated family/student,
  raw private message bodies, contact exports, secrets, setup tokens, student
  access codes, and unredacted private screenshots are forbidden.
- External sends, public publishing, uploads, payment/access changes,
  credential writes, DNS/account mutations, Drive/Vimeo/Zoom/Stripe/WAPI/
  WhatsApp/Buffer writes, and deploys require explicit auditable approval and
  configured credentials before any live action.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260708-090` | Register the raw goal-mode intake and requirement register. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | intake | P0 | 1 | none | Raw wording is preserved; register names requirements, blockers, evidence, and continuation. | `raw-input/RAW-20260708-028-rabbi-helper-tool-scope-goal.md`, this file | no | Done |
| `REQ-20260708-091` | Map the helper-bot audit baseline and every current helper parity `tool_needed` row into Rabbi / One Time scope contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | helper-scope | P0 | 1 | `ops/helper-tool-parity-map.json` current | Every current `tool_needed` row remains covered, and the original 163-contract issue #88/Rabbi audit baseline is preserved with current source status, scope lock, allowed/forbidden data, action policy, confirmation policy, natural-language examples, negative tests, Agent Mode probe, and implementation gap. | `scripts/generate-rabbi-helper-tool-scope-map.mjs`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md` | no | Done / local verified |
| `REQ-20260708-092` | Add a reusable account-bot scope template for future subaccounts such as Benny. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | helper-scope | P0 | 1 | `REQ-20260708-091` | Template requires account key, workspace/project, allowed surfaces/tools, forbidden tools, and external approval policy; Benny example is tasks/studio only and denies payments, contacts/CRM, integrations, settings, agent fleet, and super-admin diagnostics. | `ops/helper-tool-scope/account-bot-scope-template.json` | no | Done / local verified |
| `REQ-20260708-093` | Add the exact Agent Mode prompt for testing all mapped Rabbi tool contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | agent-mode | P0 | 1 | `REQ-20260708-091` | Prompt key `rabbi-helper-tool-scope-map` tells Agent Mode to test every contract, save PASS/FAIL/BLOCKED through drop-off, refuse partial PASS, and avoid all live external mutations. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | yes | Done / deployed / live readback verified |
| `REQ-20260708-094` | Add validator coverage so the scope map cannot drift from helper parity. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | tests | P0 | 1 | `REQ-20260708-091`, `REQ-20260708-092`, `REQ-20260708-093` | Test fails if a current `tool_needed` parity row lacks a Rabbi contract, scope locks are missing, privacy/external-write gates are missing, natural-language probes are missing, or the Benny template loses its limits. | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | no | Done / local verified |
| `REQ-20260708-095` | Implement the scoped helper wrappers, planner intents, result cards, audit writes, and live Agent Mode proof for the mapped contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | implementation | P0 | 2+ | `REQ-20260708-091` through `REQ-20260708-094` | Each contract moves from `tool_wrapper_missing` or fallback-only placeholder to executable only after server-side scope filters, planner coverage, permission gates, destination/result-card scope, redacted audit logging, negative tests, and Agent Mode saved proof exist. | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/safety.js`, `src/lib/bna/helper/destination-resolver.js`, `server.js`, follow-up tests | yes for app/server-visible behavior | Open / 163 local and deployed; full autonomy blocked by Agent Mode proof, external gates, live audit readback, and auto-provisioning |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260708-014` | rabbi_helper_tool_scope_map | Maintain the generated 163-contract Rabbi helper scope map against helper parity. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-091`, `REQ-20260708-094` | Regenerate with `node scripts/generate-rabbi-helper-tool-scope-map.mjs` whenever parity changes. | internal | Done / local verified |
| `TASK-20260708-015` | rabbi_helper_agent_mode_prompt | Deploy and live-readback the registered `rabbi-helper-tool-scope-map` Agent Review prompt. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-093` | Prompt read back live from `/agent-review-prompts/rabbi-helper-tool-scope-map.md` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`. | internal | Done / deployed |
| `TASK-20260708-016` | rabbi_helper_wrapper_batches | Implement scoped helper wrapper batches from the generated map. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-095` | Run the saved `rabbi-helper-tool-scope-map` Agent Mode prompt against the deployed app, save PASS/FAIL/BLOCKED drop-off proof for all 163 contracts, and keep approval-gated external/provider lanes blocked until `DEC-20260708-019` is satisfied. | internal | Open / all wrappers local + deployed; Agent Mode proof and external gates remain |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260708-019` | Live external-write autonomy for Rabbi helper tools remains gated. | Exact approved sender/channel/account/credentials/recipient segment/copy for each send, upload, charge, access grant, DNS/account mutation, credential write, or publish action. | Shloimie/Codex | Keep all external/provider mutations draft-only or blocked until explicit approval and credentials are present, then add per-tool confirmation gates and readback proof. | Allow only internal writes first; or make every external provider action setup-task-only until later. | Without this gate the Rabbi bot could mutate accounts, send messages, charge/grant access, or publish from the wrong scope. | Provide exact approval and configured credentials per external lane; otherwise leave those contracts blocked or draft-only. | `REQ-20260708-095` | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260708-091` | `ops/helper-tool-scope/*`, generator script, `ops/helper-tool-parity-map.*` | Preserve the 163-contract audit baseline while covering all current `tool_needed` parity rows after the parent/student summary, preview-action, and draft-only sidekick wrapper batches. | PASS `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS focused tests; PASS full `npm test` 1666/1666 | Pending | Pending | Not required |
| `REQ-20260708-092` | `ops/helper-tool-scope/account-bot-scope-template.json` | Encode template and Benny example. | PASS `node --test tests/rabbi-helper-tool-scope-map.test.js` | Pending | Pending | Not required |
| `REQ-20260708-093` | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | Register and generate exact Agent Mode prompt. | PASS `node --test tests/agent-review-hub.test.js`; PASS live readback `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163` | `9618a4d4`, `16a69c9e` | `16a69c9e` | Railway deployment `500242a9-860f-4599-a145-eb9515bae0a4` `SUCCESS`; OneTime live smoke passed |
| `REQ-20260708-094` | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | Add drift and guardrail tests. | PASS `node --check` touched files; PASS focused tests 16/16 | Pending | Pending | Not required |
| `REQ-20260708-095` | `src/lib/bna/helper/tool-registry.js`, `planner.js`, `permissions.js`, `safety.js`, parity/scope maps, helper tests, action coverage, lazy-subnav tests | First runtime alias batch plus read-only batch plus parent/student summary batch plus dry-run preview wrappers, draft-only sidekick wrappers, internal-action wrappers, content/provider action wrappers, scoped packet wrappers, final approval/provider packet wrappers, and the final fallback-replacement scoped packet wrappers for contact, parent, course, worksheet, library item, provider profile, setup flow, video ingest/transcription, student-question parse, worksheet generation, and library publish approval. Scope-map generator treats write-shaped wrappers as write/draft/approval-gated and preserves deliberate read-only readiness wrappers. | PASS `node --check src/lib/bna/helper/tool-registry.js`; PASS `node --check src/lib/bna/helper/planner.js`; PASS `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS focused helper/scope/Agent Review/OneTime reset tests 44/44; PASS full `npm test` 1674/1674; PASS `npm run secrets:audit`; PASS `npm run watchdog:protocol-drift`; refreshed Rabbi scope map 163 contracts with 163 `tool_wrapper_available_local`, 0 fallback blockers, and 0 missing wrappers | through `3c3ed03c` | through `3c3ed03c` | Current Railway deployment `c4548c39-b215-4f45-ab3d-27185c2a86ba` reached `SUCCESS` on `one-time-production / one-time-web / production`; `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed; `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com` passed; live readback of `/agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200` with `REQ-20260708-093`, `RABBI-HELPER-SCOPE-163`, and OneTime scope markers. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260708-090` | Done | Raw/register files | `raw-input/RAW-20260708-028-rabbi-helper-tool-scope-goal.md`, this file | Manual source coverage | None |
| `REQ-20260708-091` | Done / local verified | 163-contract JSON/MD map with stricter write/draft/approval policies | `scripts/generate-rabbi-helper-tool-scope-map.mjs`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md` | PASS generator and focused helper/scope/Agent Review tests after current fallback-replacement batch; previous full `npm test` 1666/1666 | No contracts remain `tool_wrapper_missing`; no fallback blockers remain |
| `REQ-20260708-092` | Done / local verified | Template JSON | `ops/helper-tool-scope/account-bot-scope-template.json` | PASS focused tests 16/16 | Automatic subaccount provisioning not implemented |
| `REQ-20260708-093` | Done / deployed / live readback verified | Registered prompt and generated markdown; live readback returned `200` with expected markers | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | PASS Agent Review focused tests; PASS OneTime live smoke; PASS prompt readback | Agent Mode has not yet saved a PASS/BLOCKED/FAIL result for the all-163 probe run |
| `REQ-20260708-094` | Done / local verified | Test files | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | PASS `node --check`; PASS focused tests 16/16 | None |
| `REQ-20260708-095` | Open / 163 local wrapper-backed contracts deployed/live-smoked / autonomy blocked | 163 contracts now `tool_wrapper_available_local`; 0 are registered fallback blockers; 0 remain `tool_wrapper_missing`; no read-only wrappers remain missing; current OneTime production deployment `c4548c39-b215-4f45-ab3d-27185c2a86ba` includes the full wrapper lineage through current branch tip. | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/safety.js`, `scripts/generate-rabbi-helper-tool-scope-map.mjs`, action coverage artifacts, scope maps, tests | PASS focused helper/scope/Agent Review/OneTime reset tests 44/44; PASS full `npm test` 1674/1674; PASS secrets/protocol checks; PASS OneTime target guards; PASS Railway deployment `c4548c39-b215-4f45-ab3d-27185c2a86ba` `SUCCESS`; PASS OneTime separate-instance live smoke; PASS Rabbi landing live smoke; PASS live prompt readback with 163-scope markers | Full autonomy still blocked by saved all-163 Agent Mode PASS/FAIL/BLOCKED drop-off proof, `DEC-20260708-019` external/write approvals, per-tool live audit readback evidence, and automatic subaccount provisioning from the template |

## Exact Remaining Agent-Mode Autonomy Gaps

The mapping batch does not make the Rabbi bot autonomous yet. These gaps still
block full agent-mode autonomy:

1. The Rabbi audit baseline still tracks 163 contracts, and all 163 now have
   local scoped wrappers. There are 0 `tool_wrapper_missing` contracts and 0
   registered fallback/setup blockers.
2. Current action-policy breakdown: 88 `internal_write`, 35 `draft_only`, 9
   `approval_gated_external_write`, 9
   `approval_gated_internal_state_change`, and 22 `read_only`.
3. All 163 wrapper-backed contracts are now deployed through current Railway
   deployment `c4548c39-b215-4f45-ab3d-27185c2a86ba` on
   `one-time-production / one-time-web / production`. The earlier failed
   deployments `d970e263-1726-41c1-a694-10c1659503ee`,
   `75d6f181-e7c6-41a3-9e70-efcc4c61fea1`, and
   `a23e4e82-2199-4fd9-9b17-482c385dabcc` are no longer the active blocker.
   Post-deploy `app:smoke:onetime-separate-instance`,
   `app:smoke:rabbi-onetime-landing`, instance-config readback, and live prompt
   readback all passed.
4. Natural-language planner coverage is wired for all 163 contracts, including
   the final fallback-replacement wrappers for contact, parent, course,
   worksheet, library item, provider profile, setup flow, class-video ingest,
   transcription readiness, student-question parse, worksheet generation, and
   publish approval packets.
5. Redacted helper audit logging exists in the plan/execute pipeline, but
   per-tool live audit readback proof still needs to be collected by the
   all-163 Agent Mode run against the deployed app.
6. Runtime negative tests now cover all wrapper batches for workspace/project
   rejection plus privacy redaction; live Agent Mode evidence still needs to
   prove the same behavior against the running helper.
7. External-write, financial/access, credential, upload, DNS/account, publish,
   Drive/Vimeo/Zoom/Stripe/WAPI/WhatsApp/Buffer lanes remain blocked by
   `DEC-20260708-019` until exact approval, credentials, and confirmation
   gates exist.
8. Agent Mode has not yet saved a PASS/BLOCKED/FAIL drop-off result for the
   all-163 probe run.
9. The reusable account-bot scope template exists, including the Benny
   tasks/studio-only example, but automatic provisioning from that template when
   a new subaccount/login is opened is not implemented yet.
10. Rabbi Telegram live delivery still depends on
   `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`; this is outside the helper wrapper
   map, but it still blocks end-to-end Rabbi bot autonomy for live Telegram
   delivery.

## Deploy Closeout - All 163 Wrapper-Backed Contracts

- Pre-deploy verification passed on 2026-07-09:
  `node --check src/lib/bna/helper/tool-registry.js`,
  `node --check src/lib/bna/helper/planner.js`,
  `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`,
  `node scripts/generate-rabbi-helper-tool-scope-map.mjs`, focused
  helper/scope/Agent Review/OneTime reset tests 44/44, full `npm test`
  1674/1674, `npm run secrets:audit`, `npm run watchdog:protocol-drift`,
  `npm run one-time:target:guard -- --json`, and
  `npm run one-time:railway-target:guard`.
- The first generic deploy attempt failed closed before upload because the
  Railway guard defaulted to `app=bna` while the linked project was OneTime.
  The successful retry used explicit OneTime app/domain/service environment.
- Current Railway deployment `c4548c39-b215-4f45-ab3d-27185c2a86ba` reached
  `SUCCESS` for `one-time-production / production / one-time-web`. This
  supersedes the intermediate successful wrapper deployment
  `182c7db2-d019-45bc-84f0-a6a7dfe5fb86`.
- Live verification passed:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`;
  `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`;
  `GET /api/one-time/instance-config` returned
  `rabbi_sheller_provider / one_time_mishnah_class`;
  `GET /agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200`
  with `REQ-20260708-093`, `RABBI-HELPER-SCOPE-163`, and OneTime scope
  markers.
- No checkout POST, payment link creation, member creation, access grant,
  email, WhatsApp, social post, upload, charge, DNS write, or external
  connector write was performed during smoke verification.

## Deploy Closeout - 66 Wrapper-Backed Contracts

- Commits included in live deploy: `17ff491b`, `b49a74e2`, `381a8f34`, and
  `2895654e` on top of the previous read-only wrapper deploy lineage.
- Release branch: `codex/rabbi-sidekick-release-20260708` at `2895654e`.
- Railway deployment:
  `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f` (`SUCCESS`) on
  `one-time-production` / `one-time-web` / `production`.
- Live smoke:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed.
- Live readbacks:
  `/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` returned `200`
  with `REQ-20260708-100`; `/js/operations-shell.js` and
  `/js/operations-deferred-renderers.js` returned `200` with the expected split
  and fast-path markers.
- Remaining blockers:
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` for live Rabbi Telegram sends,
  deploy/live smoke for the 97 local-only wrappers, external approval gates,
  and saved all-163 Agent Mode PASS/BLOCKED proof.

## Local Verification - Internal Action Wrapper Batch

- Added local Rabbi / OneTime helper wrappers for `add_decision_option`,
  `add_timeline_note`, `create_calendar_event`, `update_calendar_event`,
  `create_parent_visible_event`, `mark_event_admin_only`,
  `create_provider_class_session`, `create_referral_ledger_entry`,
  `request_provider_contact`, `retitle_task_naturally`, and
  `update_task_stage`.
- The generated 163-contract scope map now reports 84
  `tool_wrapper_available_local`, 12 `registered_fallback_only_blocker`, and 67
  `tool_wrapper_missing`.
- Verification passed:
  `node --check` for touched helper/generator files;
  `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; focused
  helper/scope/Agent Review tests 37/37; full `npm test` 1667/1667.
- Guardrail: these wrappers use scoped internal write previews/result cards and
  do not perform external sends, public publishing, credential writes, payments,
  access changes, Google Calendar sync, contact export, or cross-workspace
  writes during verification.
- Push/deploy status: commit `7abad605` is pushed to
  `codex/rabbi-helper-tool-scope-20260708`, and release branch
  `codex/rabbi-internal-actions-release-20260708` is pushed at the same head.
- Deploy blocker: two Railway deploy attempts from the clean release worktree
  failed after build/image push: `d970e263-1726-41c1-a694-10c1659503ee` and
  `75d6f181-e7c6-41a3-9e70-efcc4c61fea1`. Build logs completed and Railway did
  not surface app runtime logs for either failed deployment.
- Production safety: active production remained on successful deployment
  `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f`; live OneTime smoke passed after the
  failed deploy attempts.
- Next action: investigate Railway failed-deployment metadata/log visibility or
  deploy path behavior, then retry a clean deploy and live smoke before marking
  the newest 18 wrappers deployed.

## Local Verification - Content/Provider Action Wrapper Batch

- Added local Rabbi / OneTime helper wrappers for `record_agent_result`,
  `create_one_time_video_library_item`,
  `submit_student_question_for_moderation`, `save_newsletter_revision`,
  `select_weekly_update_hero`, `update_provider_profile`, and
  `capture_provider_google_business_link`.
- These 7 unique wrappers cover 13 scope-map contracts across Operations,
  parent, provider, and Rabbi surfaces.
- The generated 163-contract scope map now reports 97
  `tool_wrapper_available_local`, 12 `registered_fallback_only_blocker`, and
  54 `tool_wrapper_missing`.
- Verification passed:
  `node --check` for touched helper/generator files;
  `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; focused
  helper/scope/Agent Review tests 38/38.
- Guardrail: these wrappers recompute `rabbi_sheller_provider` /
  `one_time_mishnah_class`, reject BNA scope substitution, keep
  approval-required content/provider writes in preview mode, and do not return
  raw question text, newsletter bodies, transcript text, raw URLs, Google Place
  IDs, contact exports, student access codes, or private machine payloads.
- Next action: commit/push this batch, then deploy/live-smoke it together with
  the prior 18 local-only wrappers after the Railway deployment failure path is
  understood.

## Local Verification - Scoped Packet Wrapper Batch

- Registered the existing Rabbi / OneTime local scoped packet wrapper
  definitions in the runtime helper registry, restoring `ask_for_help` and 23
  related scoped packet tools for Drive attachment references, accountability
  notes, goals, lessons, attendance, pending receipts, task verification,
  recording parse requests, private questions, student questions, worksheets,
  checkoffs, student profile updates, and login-reset requests.
- The generated 163-contract scope map now reports 121
  `tool_wrapper_available_local`, 12 `registered_fallback_only_blocker`, and
  30 `tool_wrapper_missing`.
- Guardrail: these wrappers return scoped local request packets only. They do
  not send, publish, sync, upload, save credentials, charge, grant access,
  reset live logins, return student access codes, move Drive files, call
  Google/Vimeo/Zoom/WAPI/Stripe/Buffer, or mutate official student/classroom
  records during verification.
- Verification passed:
  `node --check src/lib/bna/helper/tool-registry.js`;
  `node --check src/lib/bna/helper/planner.js`;
  `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`;
  `node scripts/generate-rabbi-helper-tool-scope-map.mjs`;
  focused helper/scope/Agent Review tests 39/39; and `git diff --check` with
  line-ending warnings only.
- Next action: commit/push this scoped batch, send the super-admin Telegram
  progress ding, and keep deploy/live smoke blocked behind the current Railway
  failure investigation for the 55 local-only wrappers.

## Local Verification - Final Approval/Provider Packet Wrapper Batch

- Added scoped Rabbi / OneTime local packet wrappers for the last 26 unique
  missing runtime names, covering 30 map contracts: email/newsletter approvals,
  duplicate-pending archive, calendar delete, Drive move preview,
  parent/student event visibility, lead/task moves, community/Telegram posts,
  moderated question review, Google Calendar/Classroom sync packets,
  parent-question/profile/summary packets, provider landing/lead/offer/
  workspace/brand/asset packets, and Rabbi brand-kit packets.
- The generated 163-contract scope map now reports 151
  `tool_wrapper_available_local`, 12 `registered_fallback_only_blocker`, and 0
  `tool_wrapper_missing`.
- Guardrail: these wrappers return scoped local request packets only. Approval-
  gated external-write/state-change tools report an approval-required status
  and do not send, publish, sync, upload, move Drive files, delete calendar
  events, change CRM/task state, grant access, write credentials, or mutate
  official provider/parent/student records during verification.
- Verification passed:
  `node --check src/lib/bna/helper/tool-registry.js`;
  `node --check src/lib/bna/helper/planner.js`;
  `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`;
  `node scripts/generate-rabbi-helper-tool-scope-map.mjs`;
  `node --test tests/bna-helper-tools.test.js tests/rabbi-helper-tool-scope-map.test.js tests/agent-review-hub.test.js tests/provider-integrations-secret-storage.test.js`
  passed 45/45; full `npm test` passed 1670/1670; `git diff --check`
  reported only line-ending warnings; JSONL parse, secrets audit, and protocol
  drift passed.
- Next action: fallback-only replacements are now locally verified; investigate
  the Railway failure path before deploy/live-smoke for the 97 local-only
  wrappers.

## Local Verification - Fallback Replacement Wrapper Batch

- Replaced the last 12 registered fallback-only placeholders with scoped Rabbi
  / OneTime local packet wrappers: `create_contact`, `create_course`,
  `create_library_item`, `create_parent`, `create_provider_profile`,
  `create_setup_flow`, `create_worksheet`, `generate_worksheet`,
  `ingest_class_video_from_drive_or_upload`, `parse_student_questions`,
  `publish_library_item_after_approval`, and `transcribe_video`.
- The generated 163-contract scope map now reports 163
  `tool_wrapper_available_local`, 0 `registered_fallback_only_blocker`, and 0
  `tool_wrapper_missing`.
- Guardrail: these wrappers return scoped local request/readiness packets only.
  They do not create live contacts, parents, courses, worksheets, provider
  profiles, setup flows, library records, Drive/Vimeo uploads, transcription
  jobs, question parses, public publishes, access grants, credential writes, or
  external provider mutations during verification.
- Verification passed:
  `node --check src/lib/bna/helper/tool-registry.js`;
  `node --check src/lib/bna/helper/planner.js`;
  `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`;
  `node scripts/generate-rabbi-helper-tool-scope-map.mjs`;
  `node --test tests/bna-helper-tools.test.js tests/rabbi-helper-tool-scope-map.test.js tests/agent-review-hub.test.js`
  passed 41/41.
- Next action: commit/push this fallback replacement batch, investigate the
  Railway failure path, deploy/live-smoke the 97 local-only wrappers, and save
  all-163 Agent Mode PASS/BLOCKED proof.

## Deploy Attempt - Fallback Replacement Wrapper Batch

- Commits pushed on `codex/rabbi-helper-tool-scope-20260708`:
  `e5ac4827` replaced the fallback wrappers and `7c9edf73` recorded the
  verification evidence.
- Full local verification passed before deploy attempt: full `npm test`
  1671/1671, focused helper/Telegram/Agent Review tests 53/53, JSONL parse,
  `npm run secrets:audit`, and `npm run watchdog:protocol-drift`.
- Target guards passed for OneTime: `npm run one-time:target:guard -- --json`
  and `npm run one-time:railway-target:guard` both confirmed the intended
  `one-time-production` / `one-time-web` / `production` target.
- Railway deployment `a23e4e82-2199-4fd9-9b17-482c385dabcc` was attempted
  from account auth after the project-scoped token failed authorization. The
  deployment failed after build/image push; build logs showed the image push
  completed and deployment logs were empty.
- Production safety check: active OneTime production remained on the previous
  successful deployment `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f`, and
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed after the failed deploy.
- Local boot check passed with OneTime env on port `8123`: `/api/health` and
  `/api/one-time/instance-config` returned 200 with
  `rabbi_sheller_provider`, `one_time_mishnah_class`, `onetime`, and
  `onetime` brand scope. The temporary local server was stopped and port
  `8123` was released.
- Current status: 163 helper contracts are local wrapper-backed and pushed, but
  the newest 97 local-only wrapper-backed contracts are not claimed live until
  the Railway post-image deployment failure is fixed and a successful deploy
  plus live smoke/readback completes.
