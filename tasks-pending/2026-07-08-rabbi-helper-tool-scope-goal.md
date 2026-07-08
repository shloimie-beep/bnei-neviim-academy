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
| Next requirement IDs to work | `REQ-20260708-095` implementation batches after this mapping/validator batch |

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
| `REQ-20260708-091` | Map all current helper parity `tool_needed` rows into Rabbi / One Time scope contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | helper-scope | P0 | 1 | `ops/helper-tool-parity-map.json` current | Every current `tool_needed` row has one contract with scope lock, allowed/forbidden data, action policy, confirmation policy, natural-language examples, negative tests, Agent Mode probe, and implementation gap. | `scripts/generate-rabbi-helper-tool-scope-map.mjs`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md` | no | Done / local verified |
| `REQ-20260708-092` | Add a reusable account-bot scope template for future subaccounts such as Benny. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | helper-scope | P0 | 1 | `REQ-20260708-091` | Template requires account key, workspace/project, allowed surfaces/tools, forbidden tools, and external approval policy; Benny example is tasks/studio only and denies payments, contacts/CRM, integrations, settings, agent fleet, and super-admin diagnostics. | `ops/helper-tool-scope/account-bot-scope-template.json` | no | Done / local verified |
| `REQ-20260708-093` | Add the exact Agent Mode prompt for testing all mapped Rabbi tool contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | agent-mode | P0 | 1 | `REQ-20260708-091` | Prompt key `rabbi-helper-tool-scope-map` tells Agent Mode to test every contract, save PASS/FAIL/BLOCKED through drop-off, refuse partial PASS, and avoid all live external mutations. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | yes | Local verified / commit-push-deploy-live-smoke pending |
| `REQ-20260708-094` | Add validator coverage so the scope map cannot drift from helper parity. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | tests | P0 | 1 | `REQ-20260708-091`, `REQ-20260708-092`, `REQ-20260708-093` | Test fails if a current `tool_needed` parity row lacks a Rabbi contract, scope locks are missing, privacy/external-write gates are missing, natural-language probes are missing, or the Benny template loses its limits. | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | no | Done / local verified |
| `REQ-20260708-095` | Implement the scoped helper wrappers, planner intents, result cards, audit writes, and live Agent Mode proof for the mapped contracts. | `RAW-20260708-028` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | implementation | P0 | 2+ | `REQ-20260708-091` through `REQ-20260708-094` | Each contract moves from `tool_wrapper_missing` to executable only after server-side scope filters, planner coverage, permission gates, destination/result-card scope, redacted audit logging, negative tests, and Agent Mode saved proof exist. | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/planner.js`, `src/lib/bna/helper/permissions.js`, `src/lib/bna/helper/destination-resolver.js`, `server.js`, follow-up tests | yes for app/server-visible behavior | Open / blocks full autonomy |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260708-014` | rabbi_helper_tool_scope_map | Maintain the generated 163-contract Rabbi helper scope map against helper parity. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-091`, `REQ-20260708-094` | Regenerate with `node scripts/generate-rabbi-helper-tool-scope-map.mjs` whenever parity changes. | internal | Done / local verified |
| `TASK-20260708-015` | rabbi_helper_agent_mode_prompt | Deploy and live-readback the registered `rabbi-helper-tool-scope-map` Agent Review prompt. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-093` | Commit/push, release via approved path, then read back `/agent-review-prompts/rabbi-helper-tool-scope-map.md`. | internal | Pending |
| `TASK-20260708-016` | rabbi_helper_wrapper_batches | Implement scoped helper wrapper batches from the generated map. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-028` | `REQ-20260708-095` | Start with low-risk read/list/query/result-card tools, then internal writes, then draft-only/external-gated tools. | internal | Open |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260708-019` | Live external-write autonomy for Rabbi helper tools remains gated. | Exact approved sender/channel/account/credentials/recipient segment/copy for each send, upload, charge, access grant, DNS/account mutation, credential write, or publish action. | Shloimie/Codex | Keep all external/provider mutations draft-only or blocked until explicit approval and credentials are present, then add per-tool confirmation gates and readback proof. | Allow only internal writes first; or make every external provider action setup-task-only until later. | Without this gate the Rabbi bot could mutate accounts, send messages, charge/grant access, or publish from the wrong scope. | Provide exact approval and configured credentials per external lane; otherwise leave those contracts blocked or draft-only. | `REQ-20260708-095` | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260708-091` | `ops/helper-tool-scope/*`, generator script | Generate one Rabbi account-scoped contract per current parity `tool_needed` row. | PASS `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `node scripts/generate-rabbi-helper-tool-scope-map.mjs`; PASS `npm run helper:parity`; PASS focused tests 16/16 | Pending | Pending | Not required |
| `REQ-20260708-092` | `ops/helper-tool-scope/account-bot-scope-template.json` | Encode template and Benny example. | PASS `node --test tests/rabbi-helper-tool-scope-map.test.js` | Pending | Pending | Not required |
| `REQ-20260708-093` | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | Register and generate exact Agent Mode prompt. | PASS `node --test tests/agent-review-hub.test.js` | Pending | Pending | Required before live Agent Mode can copy/read prompt from production |
| `REQ-20260708-094` | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | Add drift and guardrail tests. | PASS `node --check` touched files; PASS focused tests 16/16 | Pending | Pending | Not required |
| `REQ-20260708-095` | Helper runtime files | Implement wrappers in future batches. | Not started | Pending | Pending | Required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260708-090` | Done | Raw/register files | `raw-input/RAW-20260708-028-rabbi-helper-tool-scope-goal.md`, this file | Manual source coverage | None |
| `REQ-20260708-091` | Done / local verified | 163-contract JSON/MD map | `scripts/generate-rabbi-helper-tool-scope-map.mjs`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`, `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md` | PASS generator, helper parity, and focused tests 16/16 | Full runtime wrappers still missing |
| `REQ-20260708-092` | Done / local verified | Template JSON | `ops/helper-tool-scope/account-bot-scope-template.json` | PASS focused tests 16/16 | Automatic subaccount provisioning not implemented |
| `REQ-20260708-093` | Local verified / deploy pending | Registered prompt and generated markdown | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-helper-tool-scope-map.md`, `public/agent-review-prompts/index.json` | PASS Agent Review focused tests | Commit/push/deploy/live prompt readback still required |
| `REQ-20260708-094` | Done / local verified | Test files | `tests/rabbi-helper-tool-scope-map.test.js`, `tests/agent-review-hub.test.js` | PASS `node --check`; PASS focused tests 16/16 | None |
| `REQ-20260708-095` | Open / autonomy blocked | Implementation gaps encoded in every contract | Runtime helper files not yet implemented in this batch | Not started | 163 `tool_wrapper_missing` contracts still need wrappers, planner intents, permission gates, scoped result cards, audit logging, negative runtime tests, and saved Agent Mode proof |

## Exact Remaining Agent-Mode Autonomy Gaps

The mapping batch does not make the Rabbi bot autonomous yet. These gaps still
block full agent-mode autonomy:

1. All 163 current parity gaps are still `tool_wrapper_missing`; the generated
   contracts scope them, but the helper registry wrappers are not implemented.
2. Natural-language planner coverage is specified per contract but not wired
   for the 163 missing wrappers.
3. Server-side scope filters, destination resolver calls, and scoped result
   cards still need implementation for each wrapper.
4. Redacted helper audit logs need per-tool writes and readback proof.
5. Parent/student/provider privacy negative tests exist at the contract level,
   but runtime tests must be added as wrapper batches land.
6. External-write, financial/access, credential, upload, DNS/account, publish,
   Drive/Vimeo/Zoom/Stripe/WAPI/WhatsApp/Buffer lanes remain blocked by
   `DEC-20260708-019` until exact approval, credentials, and confirmation
   gates exist.
7. The registered Agent Review prompt is local until committed, pushed,
   deployed, and live-read back from production.
8. Agent Mode has not yet saved a PASS/BLOCKED/FAIL drop-off result for the
   all-163 probe run.
