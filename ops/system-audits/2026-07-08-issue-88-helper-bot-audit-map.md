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
  tests/workspace-rbac-negative-isolation.test.js` (26/26)

## Remaining Agent-Mode Autonomy Gaps

1. Query/filter/result-card tools are still not implemented for many natural
   questions. The refreshed base parity map still has 145 `tool_needed` rows,
   including
   parent/student progress reads, payments/accounting reads, CRM/contact
   filters, content/class/session reads, provider leads, calendar drafts, and
   several prompt/goal lifecycle operations.
2. The Rabbi 163-contract scope baseline has only 18 local runtime wrappers so
   far. Twelve contracts are fallback/setup blockers, and 133 contracts still
   show `tool_wrapper_missing`.
3. The 18 local wrappers are not full agent-mode autonomy yet. They still need
   commit/push/deploy where app-visible, live readback where applicable, and a
   saved Agent Mode PASS/BLOCKED result.
4. Scoped Operations deep links for Rabbi/One Time are conservative by default.
   Helper permissions allow project-scoped task/navigation tools, but the route
   destination resolver currently blocks `/operations` for non-super-admin
   scoped roles and falls back to `/provider`. Autonomy needs an explicit
   route-policy packet for which scoped roles may open `tasks`, `studio`, or
   other allowed Operations modules without gaining platform-wide access.
5. The parity map remains inventory-level. It does not yet include full
   per-capability fields from the issue's suggested schema such as result
   renderer, parameter contract, negative-test owner, deep-link renderer, and
   live-readback evidence for every row.
6. Planner coverage is still partial. Deterministic planner coverage exists
   for navigation, tickets, task updates, performance reports, classroom
   drafts, automation drafts, and the first Rabbi alias batch, but most
   remaining inventory rows do not have natural-language intent routing or
   safe missing-input prompts.
7. Confirmation-gated execution exists, but agent-mode autonomy still needs a
   productized action console/timeline UI with visible plan, confirmation,
   execution, result links, errors, and audit readback across desktop/mobile.
8. External-write/autonomy lanes remain blocked by policy and credentials:
   sends, Buffer, WAPI/WhatsApp, Stripe/payment, DNS, Vimeo/Drive/Zoom writes,
   access grants, destructive actions, and provider secret changes require
   separate approval gates and evidence.
9. Live agent-mode proof is not complete for this issue. Local tests passed,
   but there was no deploy/live smoke or Agent Review saved PASS/BLOCKED result
   for the refreshed map, the first alias batch, and the scope/privacy negative
   tests in this scoped audit.

## Guardrails Observed

- No external send, publish, charge, DNS/account change, credential write,
  access grant, production data mutation, upload, Drive/Vimeo/Zoom write, or
  external CRM write was performed.
- No secrets or raw private bodies were added.
- Existing unrelated dirty files from the July 8 Rabbi Telegram ticket work
  were not modified by this audit.
