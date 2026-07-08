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
| Next requirement IDs to work | Continue `REQ-20260708-095`; first runtime alias batch and second read-only wrapper batch are local-verified, but full autonomy remains blocked |

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
| `REQ-20260708-095` | Implement the scoped helper wrappers, planner intents, result cards, audit writes, and live Agent Mode proof for the mapped contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | implementation | P0 | 2+ | `REQ-20260708-091` through `REQ-20260708-094` | Each contract moves from `tool_wrapper_missing` to executable only after server-side scope filters, planner coverage, permission gates, destination/result-card scope, redacted audit logging, negative tests, and Agent Mode saved proof exist. | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/safety.js`, `src/lib/bna/helper/destination-resolver.js`, `server.js`, follow-up tests | yes for app/server-visible behavior | Open / 27 contracts local-wrapper-backed; blocks full autonomy |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260708-014` | rabbi_helper_tool_scope_map | Maintain the generated 163-contract Rabbi helper scope map against helper parity. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-091`, `REQ-20260708-094` | Regenerate with `node scripts/generate-rabbi-helper-tool-scope-map.mjs` whenever parity changes. | internal | Done / local verified |
| `TASK-20260708-015` | rabbi_helper_agent_mode_prompt | Deploy and live-readback the registered `rabbi-helper-tool-scope-map` Agent Review prompt. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-093` | Prompt read back live from `/agent-review-prompts/rabbi-helper-tool-scope-map.md` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`. | internal | Done / deployed |
| `TASK-20260708-016` | rabbi_helper_wrapper_batches | Implement scoped helper wrapper batches from the generated map. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-095` | Continue from 27 local-wrapper-backed contracts; next safe batch should target the remaining 39 read-only missing wrappers before broader internal writes. | internal | Open / partial local verified |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260708-019` | Live external-write autonomy for Rabbi helper tools remains gated. | Exact approved sender/channel/account/credentials/recipient segment/copy for each send, upload, charge, access grant, DNS/account mutation, credential write, or publish action. | Shloimie/Codex | Keep all external/provider mutations draft-only or blocked until explicit approval and credentials are present, then add per-tool confirmation gates and readback proof. | Allow only internal writes first; or make every external provider action setup-task-only until later. | Without this gate the Rabbi bot could mutate accounts, send messages, charge/grant access, or publish from the wrong scope. | Provide exact approval and configured credentials per external lane; otherwise leave those contracts blocked or draft-only. | `REQ-20260708-095` | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260708-091` | `ops/helper-tool-scope/*`, generator script, `ops/helper-tool-parity-map.*` | Preserve the 163-contract audit baseline while covering all 136 current `tool_needed` parity rows after the read-only wrapper batch. | PASS `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `node scripts/generate-helper-tool-parity-map.mjs`; PASS focused tests 27/27 | Pending | Pending | Not required |
| `REQ-20260708-092` | `ops/helper-tool-scope/account-bot-scope-template.json` | Encode template and Benny example. | PASS `node --test tests/rabbi-helper-tool-scope-map.test.js` | Pending | Pending | Not required |
| `REQ-20260708-093` | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | Register and generate exact Agent Mode prompt. | PASS `node --test tests/agent-review-hub.test.js`; PASS live readback `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163` | `9618a4d4`, `16a69c9e` | `16a69c9e` | Railway deployment `500242a9-860f-4599-a145-eb9515bae0a4` `SUCCESS`; OneTime live smoke passed |
| `REQ-20260708-094` | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | Add drift and guardrail tests. | PASS `node --check` touched files; PASS focused tests 16/16 | Pending | Pending | Not required |
| `REQ-20260708-095` | `src/lib/bna/helper/tool-registry.js`, `planner.js`, `permissions.js`, `safety.js`, parity/scope maps, helper tests | First runtime alias batch plus read-only batch: `show_one_time_launch_checklist`, `list_calendar_sessions`, `open_calendar_event`, `view_email_log`, `show_contact_communication_history`, `list_provider_leads`, `open_content_item_url`. | PASS focused helper/scope/RBAC tests 27/27; PASS syntax checks; PASS full `npm test` 1661/1661; PASS `npm run watchdog:actions`; PASS `npm run secrets:audit`; PASS `npm run watchdog:protocol-drift`; refreshed parity map 270 rows and Rabbi scope map 163 contracts with 27 `tool_wrapper_available_local` | `9618a4d4`, `16a69c9e`, `9e611cbd` | `9e611cbd` | Blocked: local deploy/live smoke would include unrelated dirty `server.js`, Operations shell/performance, Telegram readiness, and raw-input worktree changes |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260708-090` | Done | Raw/register files | `raw-input/RAW-20260708-028-rabbi-helper-tool-scope-goal.md`, this file | Manual source coverage | None |
| `REQ-20260708-091` | Done / local verified | 163-contract JSON/MD map; base parity now 270 rows with 136 `tool_needed` | `scripts/generate-rabbi-helper-tool-scope-map.mjs`, `ops/helper-tool-parity-map.json`, `ops/helper-tool-parity-map.md`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md` | PASS generator, helper parity, and focused tests 27/27 | Full runtime wrappers still missing for 124 contracts; 12 fallback blockers remain |
| `REQ-20260708-092` | Done / local verified | Template JSON | `ops/helper-tool-scope/account-bot-scope-template.json` | PASS focused tests 16/16 | Automatic subaccount provisioning not implemented |
| `REQ-20260708-093` | Done / deployed / live readback verified | Registered prompt and generated markdown; live readback returned `200` with expected markers | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | PASS Agent Review focused tests; PASS OneTime live smoke; PASS prompt readback | Agent Mode has not yet saved a PASS/BLOCKED/FAIL result for the all-163 probe run |
| `REQ-20260708-094` | Done / local verified | Test files | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | PASS `node --check`; PASS focused tests 16/16 | None |
| `REQ-20260708-095` | Open / partial pushed / autonomy blocked | 27 contracts now `tool_wrapper_available_local`; 12 are registered fallback blockers; 124 remain `tool_wrapper_missing` | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/safety.js`, `scripts/generate-rabbi-helper-tool-scope-map.mjs`, parity/scope maps, tests | PASS `node --test tests/bna-helper-tools.test.js tests/rabbi-helper-tool-scope-map.test.js tests/one-time-rbac-negative-isolation.test.js tests/workspace-rbac-negative-isolation.test.js` (27/27); PASS syntax checks; PASS full `npm test` 1661/1661 after regenerating One Time action coverage; PASS action/protocol/secrets watchdogs; PASS push `9e611cbd` | Full autonomy still blocked by 124 missing wrappers, 12 fallback blockers, deploy/live smoke for the read-only batch, and saved Agent Mode proof |

## Exact Remaining Agent-Mode Autonomy Gaps

The mapping batch does not make the Rabbi bot autonomous yet. These gaps still
block full agent-mode autonomy:

1. The refreshed base helper parity map has 136 current `tool_needed` rows.
2. The Rabbi audit baseline still tracks 163 contracts: 27 now have local
   wrappers, 12 are registered fallback/setup blockers, and 124 remain
   `tool_wrapper_missing`.
3. Missing-wrapper breakdown: 53 `internal_write`, 39 `read_only`, 28
   `draft_only`, 2 `approval_gated_external_write`, and 2
   `approval_gated_internal_state_change`.
4. Fallback-only blocker breakdown: 8 `internal_write`, 3 `read_only`, and 1
   `draft_only`; these are registered placeholders, not autonomous execution.
5. The 27 wrapper-backed contracts still need saved Agent Mode PASS/BLOCKED
   proof before autonomy can be claimed; the read-only batch is committed and
   pushed as `9e611cbd`, but deploy/live-smoke is blocked by unrelated dirty
   local server/Operations/Telegram worktree changes.
6. Natural-language planner coverage is wired only for the first alias batch
   and the second read-only batch; the remaining missing wrappers still need
   intent routing and safe missing-input prompts.
7. Server-side scope filters, destination resolver calls, and scoped result
   cards still need implementation/readback for the remaining wrappers.
8. Redacted helper audit logging exists in the plan/execute pipeline, but
   per-tool audit readback proof still needs to be collected as batches land.
9. Runtime negative tests now cover the first alias and read-only batches'
   workspace/project rejection and privacy redaction; parent/student/provider
   privacy negative tests must expand per wrapper batch.
10. External-write, financial/access, credential, upload, DNS/account, publish,
   Drive/Vimeo/Zoom/Stripe/WAPI/WhatsApp/Buffer lanes remain blocked by
   `DEC-20260708-019` until exact approval, credentials, and confirmation
   gates exist.
11. Agent Mode has not yet saved a PASS/BLOCKED/FAIL drop-off result for the
   all-163 probe run.
