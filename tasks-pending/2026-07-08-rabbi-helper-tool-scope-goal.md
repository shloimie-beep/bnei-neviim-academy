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
| Next requirement IDs to work | Continue `REQ-20260708-095`; 151 contracts are now local wrapper-backed, 66 are deployed/live-smoked, the prior 18 internal-action wrappers are pushed but deploy-blocked after two Railway failures, and the 67 newer packet wrappers are local verified but not deployed; full autonomy remains blocked by 12 fallback blockers, deploy/live smoke for 85 local-only wrappers, external approval gates, and saved all-163 Agent Mode proof |

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
| `REQ-20260708-095` | Implement the scoped helper wrappers, planner intents, result cards, audit writes, and live Agent Mode proof for the mapped contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | implementation | P0 | 2+ | `REQ-20260708-091` through `REQ-20260708-094` | Each contract moves from `tool_wrapper_missing` to executable only after server-side scope filters, planner coverage, permission gates, destination/result-card scope, redacted audit logging, negative tests, and Agent Mode saved proof exist. | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/safety.js`, `src/lib/bna/helper/destination-resolver.js`, `server.js`, follow-up tests | yes for app/server-visible behavior | Open / 151 local, 66 deployed, 18 deploy-blocked, 67 deploy pending; full autonomy blocked |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260708-014` | rabbi_helper_tool_scope_map | Maintain the generated 163-contract Rabbi helper scope map against helper parity. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-091`, `REQ-20260708-094` | Regenerate with `node scripts/generate-rabbi-helper-tool-scope-map.mjs` whenever parity changes. | internal | Done / local verified |
| `TASK-20260708-015` | rabbi_helper_agent_mode_prompt | Deploy and live-readback the registered `rabbi-helper-tool-scope-map` Agent Review prompt. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-093` | Prompt read back live from `/agent-review-prompts/rabbi-helper-tool-scope-map.md` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`. | internal | Done / deployed |
| `TASK-20260708-016` | rabbi_helper_wrapper_batches | Implement scoped helper wrapper batches from the generated map. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-095` | Investigate Railway failures for deployment IDs `d970e263-1726-41c1-a694-10c1659503ee` and `75d6f181-e7c6-41a3-9e70-efcc4c61fea1`, then deploy/live-smoke all 85 local-only wrappers and replace or explicitly block the 12 registered fallback-only tools. | internal | Open / no missing wrappers, partial pushed + deploy blocked + local verified / autonomy blocked |

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
| `REQ-20260708-095` | `src/lib/bna/helper/tool-registry.js`, `planner.js`, `permissions.js`, `safety.js`, parity/scope maps, helper tests, action coverage, lazy-subnav tests | First runtime alias batch plus read-only batch plus parent/student summary batch plus dry-run preview wrappers, draft-only sidekick wrappers, internal-action wrappers, content/provider action wrappers, the scoped packet wrapper batch, and the final approval/provider packet wrapper batch for email/newsletter approvals, visibility/state-change requests, community/Telegram/Google sync packets, parent/provider setup packets, lead/brand/asset packets, and moderated question review packets. Scope-map generator treats write-shaped missing wrappers as write/draft/approval-gated instead of read-only. | PASS `node --check src/lib/bna/helper/tool-registry.js`; PASS `node --check src/lib/bna/helper/planner.js`; PASS `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS focused helper/scope/Agent Review tests 40/40; PASS `git diff --check` with line-ending warnings only; refreshed Rabbi scope map 163 contracts with 151 `tool_wrapper_available_local`, 12 fallback blockers, and 0 missing wrappers | `9618a4d4`, `16a69c9e`, `9e611cbd`, `304d68a8`, `d23c9ec2`, `17ff491b`, `b49a74e2`, `381a8f34`, `2895654e`, `7abad605`, `a65a3457`, `a97268ab`; current final packet batch commit pending | through `a97268ab`; current final packet batch push pending | Railway deployment `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f` `SUCCESS` covers the first 66 wrapper-backed contracts. Deploy attempts for the prior 18 internal-action wrappers failed after image push on `d970e263-1726-41c1-a694-10c1659503ee` and `75d6f181-e7c6-41a3-9e70-efcc4c61fea1`; 85 local-only wrappers are verified locally and still need deploy/live smoke. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260708-090` | Done | Raw/register files | `raw-input/RAW-20260708-028-rabbi-helper-tool-scope-goal.md`, this file | Manual source coverage | None |
| `REQ-20260708-091` | Done / local verified | 163-contract JSON/MD map with stricter write/draft/approval policies | `scripts/generate-rabbi-helper-tool-scope-map.mjs`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md` | PASS generator and focused helper/scope/Agent Review tests after current final packet batch; previous full `npm test` 1666/1666 | No contracts remain `tool_wrapper_missing`; 12 fallback blockers remain |
| `REQ-20260708-092` | Done / local verified | Template JSON | `ops/helper-tool-scope/account-bot-scope-template.json` | PASS focused tests 16/16 | Automatic subaccount provisioning not implemented |
| `REQ-20260708-093` | Done / deployed / live readback verified | Registered prompt and generated markdown; live readback returned `200` with expected markers | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | PASS Agent Review focused tests; PASS OneTime live smoke; PASS prompt readback | Agent Mode has not yet saved a PASS/BLOCKED/FAIL result for the all-163 probe run |
| `REQ-20260708-094` | Done / local verified | Test files | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | PASS `node --check`; PASS focused tests 16/16 | None |
| `REQ-20260708-095` | Open / 151 local wrapper-backed contracts, 66 deployed, 18 deploy-blocked, 67 deploy pending / autonomy blocked | 151 contracts now `tool_wrapper_available_local`; 12 are registered fallback blockers; 0 remain `tool_wrapper_missing`; no read-only wrappers remain missing | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/safety.js`, `scripts/generate-rabbi-helper-tool-scope-map.mjs`, action coverage artifacts, scope maps, tests | PASS focused helper/scope/Agent Review tests 40/40; previous deploy/live smoke through Railway deployment `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f` covers the first 66 wrapper-backed contracts | Full autonomy still blocked by 12 fallback blockers, deploy/live smoke for the 85 local-only wrappers after Railway deployment failure investigation, external approval gates, and saved Agent Mode proof |

## Exact Remaining Agent-Mode Autonomy Gaps

The mapping batch does not make the Rabbi bot autonomous yet. These gaps still
block full agent-mode autonomy:

1. The refreshed base helper parity map has no remaining `tool_wrapper_missing`
   contracts, but registered fallback placeholders still need real scoped
   replacements before autonomy.
2. The Rabbi audit baseline still tracks 163 contracts: 151 now have local
   wrappers and 12 are registered fallback/setup blockers.
3. Current action-policy breakdown: 88 `internal_write`, 35 `draft_only`, 9
   `approval_gated_external_write`, 9
   `approval_gated_internal_state_change`, and 22 `read_only`; no read-only
   wrappers remain missing.
4. Fallback-only blocker breakdown: 8 `internal_write`, 2 `read_only`, 1
   `draft_only`, and 1 `approval_gated_external_write`; these are registered
   placeholders, not autonomous execution.
5. The first 66 wrapper-backed contracts are deployed through Railway deployment
   `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f`, including the parent/student
   summary wrappers, dry-run preview contracts, and draft-only sidekick
   contracts. The newest 18 internal-action wrappers are committed and pushed
   in `7abad605`, but deploy attempts `d970e263-1726-41c1-a694-10c1659503ee`
   and `75d6f181-e7c6-41a3-9e70-efcc4c61fea1` both failed after image push
   without surfaced app error logs. The newest 13 content/provider action
   wrappers are pushed but not deployed yet. The newest 24 local scoped packet
   wrappers and 30 final approval/provider packet contracts are local verified
   and not deployed yet. All 151 wrapper-backed
   contracts still need saved Agent Mode PASS/BLOCKED proof before autonomy can
   be claimed.
6. Natural-language planner coverage is wired for the first alias batch, the
   second read-only batch, the parent/student summary batch, the preview-action
   batch, the draft-only sidekick batch, the internal-action batch, and the
   content/provider action batch; the local scoped packet wrappers are
   registered as safe scoped request packets, and the final approval/provider
   packet wrappers now have intent routing and safe no-write approval packets.
7. Server-side scope filters, destination resolver calls, and scoped result
   cards still need implementation/readback for the 12 fallback-only tools
   before those placeholders stop blocking autonomy.
8. Redacted helper audit logging exists in the plan/execute pipeline, but
   per-tool audit readback proof still needs to be collected as batches land.
9. Runtime negative tests now cover the first alias batch, read-only batch,
   parent/student summary batch, preview/draft batches, internal-action batch,
   content/provider action batch, local scoped packet batch, and final
   approval/provider packet batch
   workspace/project rejection plus privacy redaction; parent/student/provider
   privacy negative tests must continue to expand per wrapper batch.
10. External-write, financial/access, credential, upload, DNS/account, publish,
   Drive/Vimeo/Zoom/Stripe/WAPI/WhatsApp/Buffer lanes remain blocked by
   `DEC-20260708-019` until exact approval, credentials, and confirmation
   gates exist.
11. Agent Mode has not yet saved a PASS/BLOCKED/FAIL drop-off result for the
   all-163 probe run.
12. Latest final approval/provider packet wrapper batch verification is focused so far:
   `node --check` passed for touched helper/generator files,
   `node scripts/generate-rabbi-helper-tool-scope-map.mjs` refreshed the map,
   `git diff --check` had line-ending warnings only, and focused
   helper/scope/Agent Review tests passed 40/40. Full `npm test`,
   deploy/live smoke, and saved Agent Mode PASS/BLOCKED proof still remain for
   the newest final packet batch; deploy/live smoke also remains pending for
   the prior 55 local-only wrappers because of the Railway deployment failures.

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
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` for live Rabbi Telegram sends, 12
  fallback/setup blockers, deploy/live smoke for the 85 local-only wrappers,
  external approval gates, and saved all-163 Agent Mode PASS/BLOCKED proof.

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
  `node --test tests/bna-helper-tools.test.js tests/rabbi-helper-tool-scope-map.test.js tests/agent-review-hub.test.js`
  passed 40/40; `git diff --check` reported only line-ending warnings.
- Next action: commit/push this final packet batch, then either replace the 12
  fallback-only tools with scoped wrappers or record explicit blockers, and
  investigate the Railway failure path before deploy/live-smoke for the 85
  local-only wrappers.
