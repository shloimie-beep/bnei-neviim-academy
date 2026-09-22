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

Current counts after the parent/student summary and preview wrapper batches:

- total records: 270
- `tool_available`: 63
- `requires_confirmation`: 60
- `external_blocker`: 26
- `student_safe_only`: 7
- `tool_needed`: 114

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

Follow-up Rabbi parent/student summary wrapper batch:

- Added scoped read-only wrappers for `list_students`, `show_assignments`,
  `show_child_calendar`, `view_parent_visible_notes`,
  `show_my_assignments`, `show_my_goals`, `show_parent_students`,
  `show_student_progress`, and `show_student_progress_for_parent`.
- The wrappers recompute/lock scope to `rabbi_sheller_provider` /
  `one_time_mishnah_class`, return provider-visible parent/student summaries,
  and do not return parent contact values, student access codes, private notes,
  worksheet bodies, raw instructions, private assignment links, raw goal
  metadata, raw parent-note metadata, or meeting URLs.
- Refreshed `ops/helper-tool-parity-map.json`/`.md` so the parent/student
  summary batch now shows as `tool_available`.
- Kept the Rabbi scope map at the original 163-contract audit baseline, with
  current implementation statuses: 36 `tool_wrapper_available_local`, 12
  `registered_fallback_only_blocker`, and 115 `tool_wrapper_missing`.

Follow-up Rabbi dry-run preview wrapper batch:

- Added scoped dry-run preview wrappers for
  `calendar_batch_launch_plan_preview`, `classroom_topic_material_preview`,
  `google_drive_find_file_preview`, `google_drive_create_doc_preview`,
  `google_drive_create_folder_preview`, `google_business_place_id_lookup`,
  and `google_business_list_locations_preview`.
- These wrappers call the action runner with `dry_run: true` and
  `approved: false`, recompute/lock the Rabbi / One Time workspace/project
  scope, and return redacted preview summaries instead of live external
  provider mutations.
- Preview result cards do not return raw Google/Drive/Classroom/Business
  IDs, raw URLs, document body previews, private contact values, or secrets.
- The scope-map generator now treats write-shaped missing tools as
  write/draft/approval-gated instead of leaving them in the read-only bucket.
- Refreshed `ops/helper-tool-parity-map.json`/`.md` so the preview wrappers
  show as `tool_available` or `requires_confirmation`.
- Kept the Rabbi scope map at the original 163-contract audit baseline, with
  current implementation statuses: 49 `tool_wrapper_available_local`, 12
  `registered_fallback_only_blocker`, and 102 `tool_wrapper_missing`.

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
- Rabbi parent/student summary execution rejects cross-workspace args and
  omits parent contact values, student access codes, private notes, worksheet
  bodies, raw instructions, private links, raw goal metadata, raw note
  metadata, and meeting URLs.
- Rabbi preview wrapper execution rejects cross-workspace args and proves
  preview-only behavior for Calendar, Classroom, Google Drive, and Google
  Business actions without live external reads/writes or raw external IDs.

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
  tests/workspace-rbac-negative-isolation.test.js` (30/30)
- PASS `node --test tests/watchdog-action-registry.test.js` (5/5) after
  regenerating `ops/action-registry/one-time-action-coverage.*`
- PASS full `npm test` (1664/1664)
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
- PASS current focused helper/scope/action/UI verification and full
  `npm test` after refreshing the generated action-coverage hashes and lazy
  subnav test assertions required by the already-committed Operations shell
  split.

## Remaining Agent-Mode Autonomy Gaps

1. Query/filter/result-card tools are still not implemented for many natural
   questions. The refreshed base parity map now has 114 `tool_needed` rows,
   including payments/accounting reads, CRM/contact filters beyond the first
   read-only batch, content/class/session reads, calendar/state drafts, and
   prompt/goal lifecycle operations.
2. The Rabbi 163-contract scope baseline has 49 local runtime wrappers so far.
   Twelve contracts are fallback/setup blockers, and 102 contracts still show
   `tool_wrapper_missing`.
3. The exact missing-wrapper breakdown is 68 `internal_write`, 17
   `draft_only`, 8 `approval_gated_external_write`, and 9
   `approval_gated_internal_state_change`; no missing wrapper is still
   classified as `read_only`.
4. The 49 local wrappers are not full agent-mode autonomy yet. The first 27
   are committed/pushed/deployed/prompt-readback verified through deployment
   `2107fae5-1a73-49ec-96e8-5a3a66bb8e43`; the 9 parent/student summary
   wrappers and 13 dry-run preview contracts are local-verified and still need
   a clean deploy/live smoke path. All 49 still need saved Agent Mode
   PASS/BLOCKED results.
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
   drafts, automation drafts, the first Rabbi alias batch, the read-only batch,
   the parent/student summary batch, and the preview-action batch, but most
   remaining inventory rows do not have natural-language intent routing or
   safe missing-input prompts.
8. Confirmation-gated execution exists, but agent-mode autonomy still needs a
   productized action console/timeline UI with visible plan, confirmation,
   execution, result links, errors, and audit readback across desktop/mobile.
9. External-write/autonomy lanes remain blocked by policy and credentials:
   sends, Buffer, WAPI/WhatsApp, Stripe/payment, DNS, Vimeo/Drive/Zoom writes,
   access grants, destructive actions, and provider secret changes require
   separate approval gates and evidence.
10. Live deploy and prompt readback are complete for the first 27 wrappers, but
   Agent Review has not yet saved a PASS/BLOCKED result for the refreshed map,
   the first alias batch, the read-only batch, the parent/student summary
   batch, the preview-action batch, and the scope/privacy negative tests in
   this scoped audit.

## Guardrails Observed

- No external send, publish, charge, DNS/account change, credential write,
  access grant, production data mutation, upload, Drive/Vimeo/Zoom write, or
  external CRM write was performed.
- No secrets or raw private bodies were added.
- Existing unrelated dirty files from the July 8 Rabbi Telegram ticket work
  were not modified by this audit.
