# Issue #88 Helper Bot Audit Map Closeout

Generated: 2026-07-08T21:47:46+03:00

Source:

- GitHub issue: #88, `helper-bot-workspace-agent-01-audit-map`
- Packet ID: `helper-bot-workspace-agent-01-audit-map`
- Parent raw ID: `RAW-20260703-003`
- Local prompt packet:
  `ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/01-current-state-audit-capability-map.md`

## Local Audit Result

The issue packet was accurate that the helper is already implemented as a
scoped server-side tool layer, not a blank chat bubble. Local inspection
confirmed:

- helper registry, planner, permissions, confirmation gates, redaction,
  destination resolver, scoped profile/knowledge, result links, and audit
  logging exist under `src/lib/bna/helper/`.
- `/api/bna/helper/context`, `/tools`, `/profile`, `/knowledge`, `/message`,
  `/confirm`, `/runs/:id`, `/plan`, `/execute`, `/audit`, and `/action-log`
  are wired in `server.js`.
- `public/operations.html` has the HELPER-03 drawer/client contract.
- server-side `registry.execute()` rechecks helper permissions before tool
  execution; browser/page context remains advisory.

## Map Update

`npm run helper:parity` showed the checked-in helper parity map was stale.
The map was regenerated from the current local action registry and helper
registry.

Original local audit counts before the Rabbi runtime alias batch:

- total records: 270
- `tool_available`: 36
- `requires_confirmation`: 34
- `external_blocker`: 26
- `student_safe_only`: 11
- `tool_needed`: 163

Updated counts after the first Rabbi runtime alias batch:

- total records: 270
- `tool_available`: 41
- `requires_confirmation`: 49
- `external_blocker`: 26
- `student_safe_only`: 9
- `tool_needed`: 145

Meaningful stale items corrected:

- `capture_raw_intake`, `run_watchdog_audit`, `show_goal_status`,
  `open_operations_view`, `update_automation`, `create_support_ticket`, and
  `create_automation` now reflect actual helper registry coverage/status.
- `create_provider_classroom_draft` is now represented for Operations,
  provider, and Rabbi surfaces as a confirmation-gated draft-only helper path.
- Newer action-registry rows such as campaign/drip/automation drafts,
  campaign segment preview, schedule assistant reminder, and record agent
  result are now included as tool-needed or external-blocker rows.

No helper runtime behavior was changed in the original issue-audit packet.

Follow-up Rabbi runtime alias batch:

- Added runtime wrappers for `capture_ramble`, `show_operating_goals`,
  `route_bug_to_codex`, `create_report_problem_ticket`, `create_ticket`,
  `create_help_request`, `create_rabbi_source_sheet_task`,
  `create_rabbi_shiur_idea`, `draft_parent_response`, and
  `draft_weekly_update`.
- Refreshed `ops/helper-tool-parity-map.json`/`.md` so those aliases now show
  as `tool_available` or `requires_confirmation` instead of stale
  `tool_needed` rows.
- Kept `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json`/`.md` as the
  original 163-contract audit baseline, with current implementation statuses:
  18 `tool_wrapper_available_local`, 12 `registered_fallback_only_blocker`,
  and 133 `tool_wrapper_missing`.

Follow-up Rabbi read-only wrapper batch:

- Added scoped read-only wrappers for `show_one_time_launch_checklist`,
  `list_calendar_sessions`, `open_calendar_event`, `view_email_log`,
  `show_contact_communication_history`, `list_provider_leads`, and
  `open_content_item_url`.
- The wrappers recompute/lock scope to `rabbi_sheller_provider` /
  `one_time_mishnah_class`, summarize results, and do not return meeting URLs,
  raw media/Drive URLs, email bodies, raw message bodies, raw email addresses,
  contact exports, parent phone/email values, or raw contact notes.
- Refreshed `ops/helper-tool-parity-map.json`/`.md` so the second batch now
  shows as `tool_available`.
- Kept the Rabbi scope map at the original 163-contract audit baseline, with
  current implementation statuses: 27 `tool_wrapper_available_local`, 12
  `registered_fallback_only_blocker`, and 124 `tool_wrapper_missing`.

## Negative Tests Added

Added focused coverage in `tests/bna-helper-tools.test.js` for the packet's
scope/privacy implications:

- provider/Rabbi helper cannot route into BNA Operations workspace links;
- cross-origin destination targets are refused and do not become browser-click
  substitutions;
- parent helpers fall back to `/parent` instead of opening Operations/admin;
- student helpers fall back to `/student` instead of opening Operations/tasks;
- One Time project-scoped helper execution rejects BNA workspace navigation
  and blocks same-workspace Operations links unless the route layer explicitly
  allows the scoped role.
- Rabbi alias execution rejects cross-workspace and cross-project runtime args
  for the new wrapper batch.
- Rabbi parent-response drafts remain draft-only and do not send.
- Rabbi raw-intake capture does not return raw private text in the result
  card.

## Verification

- PASS `npm run helper:parity`
- PASS `node --check scripts/generate-helper-tool-parity-map.mjs`
- PASS `node --check server.js`
- PASS `node --test tests/bna-helper-tools.test.js` (13/13)
- PASS `node --test tests/helper-scope-profile-knowledge.test.js` (7/7)
- PASS `node --test tests/universal-assistant-mvp.test.js` (4/4)
- PASS `node --test tests/service-provider-scope-routes.test.js` (3/3)

Follow-up verification:

- PASS `node scripts/generate-helper-tool-parity-map.mjs`
- PASS `node scripts/generate-rabbi-helper-tool-scope-map.mjs`
- PASS `node --check scripts/generate-rabbi-helper-tool-scope-map.mjs`
- PASS `node --check src/lib/bna/helper/tool-registry.js`
- PASS `node --check src/lib/bna/helper/planner.js`
- PASS `node --check src/lib/bna/helper/permissions.js`
- PASS `node --check src/lib/bna/helper/safety.js`
- PASS `node --test tests/bna-helper-tools.test.js
  tests/rabbi-helper-tool-scope-map.test.js
  tests/one-time-rbac-negative-isolation.test.js
  tests/workspace-rbac-negative-isolation.test.js` (27/27)
- PASS `node --test tests/watchdog-action-registry.test.js` (5/5) after
  regenerating `ops/action-registry/one-time-action-coverage.*`
- PASS full `npm test` (1661/1661)
- PASS `npm run watchdog:actions`
- PASS `npm run secrets:audit`
- PASS `npm run watchdog:protocol-drift`
- PASS Railway deployment `500242a9-860f-4599-a145-eb9515bae0a4` reached
  `SUCCESS` on `one-time-production` / `one-time-web` / `production`
- PASS `npm run app:smoke:onetime-separate-instance --
  https://join.onetimeonetime.com`
- PASS live prompt readback
  `/agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200` with
  `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`

## Remaining Agent-Mode Autonomy Gaps

1. Query/filter/result-card tools are still not implemented for many natural
   questions. The refreshed base parity map now has 136 `tool_needed` rows,
   including parent/student progress reads, payments/accounting reads,
   CRM/contact filters beyond the first read-only batch, content/class/session
   reads, calendar drafts, and several prompt/goal lifecycle operations.
2. The Rabbi 163-contract scope baseline has 27 local runtime wrappers so far.
   Twelve contracts are fallback/setup blockers, and 124 contracts still show
   `tool_wrapper_missing`.
3. The exact missing-wrapper breakdown is 53 `internal_write`, 39 `read_only`,
   28 `draft_only`, 2 `approval_gated_external_write`, and 2
   `approval_gated_internal_state_change`.
4. The 27 local wrappers are not full agent-mode autonomy yet. The first 18
   are committed/pushed/deployed/prompt-readback verified; the read-only batch
   is committed and pushed as `9e611cbd`, but deploy/live smoke is blocked
   because the local worktree contains unrelated dirty `server.js`,
   Operations shell/performance, Telegram readiness, and raw-input changes.
   All 27 still need saved Agent Mode PASS/BLOCKED results.
5. Scoped Operations deep links for Rabbi/One Time are conservative by default.
   Helper permissions allow project-scoped task/navigation tools, but the route
   destination resolver currently blocks `/operations` for non-super-admin
   scoped roles and falls back to `/provider`. Autonomy needs an explicit
   route-policy packet for which scoped roles may open `tasks`, `studio`, or
   other allowed Operations modules without gaining platform-wide access.
6. The parity map remains inventory-level. It does not yet include full
   per-capability fields from the issue's suggested schema such as result
   renderer, parameter contract, negative-test owner, deep-link renderer, and
   live-readback evidence for every row.
7. Planner coverage is still partial. Deterministic planner coverage exists
   for navigation, tickets, task updates, performance reports, classroom
   drafts, automation drafts, the first Rabbi alias batch, and the read-only
   batch, but most remaining inventory rows do not have natural-language intent
   routing or safe missing-input prompts.
8. Confirmation-gated execution exists, but agent-mode autonomy still needs a
   productized action console/timeline UI with visible plan, confirmation,
   execution, result links, errors, and audit readback across desktop/mobile.
9. External-write/autonomy lanes remain blocked by policy and credentials:
   sends, Buffer, WAPI/WhatsApp, Stripe/payment, DNS, Vimeo/Drive/Zoom writes,
   access grants, destructive actions, and provider secret changes require
   separate approval gates and evidence.
10. Live deploy and prompt readback are complete for the first alias batch, but Agent
   Review has not yet saved a PASS/BLOCKED result for the refreshed map, the
   first alias batch, the read-only batch, and the scope/privacy negative tests
   in this scoped audit.

## Guardrails Observed

- No external send, publish, charge, DNS/account change, credential write,
  access grant, production data mutation, upload, Drive/Vimeo/Zoom write, or
  external CRM write was performed.
- No secrets or raw private bodies were added.
- Existing unrelated dirty files from the July 8 Rabbi Telegram ticket work
  were not modified by this audit.
