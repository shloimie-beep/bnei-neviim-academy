# Operations Action Registry, Telegram, UI Bot QA

Date: 2026-06-11

## Summary

Built the Operations Action Registry layer so Telegram, in-app bots, and UI
buttons can call the same typed backend actions. Normal operations now route to
typed actions before Codex; Codex routing is reserved for code, repo, deploy,
test, migration, debugging, and technical implementation work.

## Actions Implemented

Registry total: 40 actions.

- calendar: `create_calendar_event`, `update_calendar_event`,
  `delete_calendar_event`, `sync_google_calendar`, `sync_google_classroom`,
  `open_calendar_event`, `mark_event_parent_visible`,
  `mark_event_student_visible`, `mark_event_admin_only`
- communications: `add_timeline_note`, `create_help_request`,
  `move_lead_stage`
- content: `open_content_item_url`
- email: `draft_email_from_newsletter`, `draft_email`, `refine_email`,
  `approve_email`, `schedule_email`, `send_test_email`,
  `pause_scheduled_email`, `view_email_log`
- newsletter: `find_latest_newsletter_draft`, `refine_newsletter_draft`,
  `save_newsletter_revision`, `approve_newsletter`
- parent: `create_parent_visible_event`, `show_child_calendar`,
  `draft_message_to_admin`, `view_parent_visible_notes`
- provider: `create_provider_class_session`, `create_provider_question_post`,
  `update_provider_profile`
- social: `generate_social_posts_from_newsletter`
- student: `create_student_schedule_item`, `show_today_plan`,
  `show_assignments`, `explain_assignment`
- tasks: `create_task`, `update_task_stage`
- whatsapp: `generate_whatsapp_from_newsletter`

## Files Changed

- `src/lib/actions/types.js`
- `src/lib/actions/permissions.js`
- `src/lib/actions/registry.js`
- `src/lib/actions/actions/operations.js`
- `src/lib/actions/audit-log.js`
- `src/lib/actions/runner.js`
- `src/lib/actions/page-action-map.js`
- `src/lib/bna/telegram-action-router.js`
- `server.js`
- `scripts/telegram-kimi-bridge.mjs`
- `public/operations.html`
- `ops/action-registry/actions.json`
- `ops/action-registry/page-action-map.json`
- `ops/action-registry/ui-button-map.md`
- `tests/action-registry-telegram-ui-bot.test.js`

## Architecture

Added a central registry with metadata for each action:

- action id, label, description, category
- page contexts, related routes, UI button labels
- allowed roles and workspaces
- required and optional inputs
- validation, dry-run support, approval requirement
- execution handler, audit event, success/failure messages
- Telegram command and intent examples

Added a runner that:

- identifies role/workspace/source
- validates inputs
- checks permissions
- supports dry-run previews
- blocks sensitive actions unless approved
- executes safe handlers
- writes audit/timeline records
- returns structured action results

## Telegram Routing

The Telegram bridge now attempts typed operation routing before task capture or
Codex routing. Tested classifier examples include:

- "Refine the newsletter" -> `refine_newsletter_draft`
- "Draft an email from the newsletter" -> `draft_email_from_newsletter`
- "Draft an email to parents..." -> `draft_email`
- "Create a task..." -> `create_task`
- "Move task 12 to done" -> `update_task_stage`
- "Create calendar event..." -> `create_calendar_event`
- "Move the lead to Payment Pending" -> `move_lead_stage`
- code/repo/deploy/test/debug prompts -> Codex development routing

Telegram live sending was not performed.

## Server And UI Wiring

- `GET /api/bna/actions`
- `POST /api/bna/actions/run`
- `GET /api/bna/actions/audit-log`
- Existing bot action preview/execute endpoints now use the shared runner.
- Operations UI `api.runAction()` posts to `/actions/run`.
- Bot Actions metadata is registry-backed through workspace platform payloads.

## Privacy And Scope

Verified rules:

- Parent actions stay in BNA parent-visible scope.
- Student helper actions stay in student-visible scope.
- Provider participant/program actions stay in `rabbi_sheller_provider`.
- Provider participants do not receive BNA goals, check-ins, private school
  notes, or accountability context.
- Sensitive send/publish/payment/access/role/sync actions require approval and
  connector readiness.

## Dry-Run And Approval QA

- Newsletter refinement can run without Codex and writes an audit log.
- Email drafting can run without sending an email.
- Calendar event creation supports dry run.
- `send_test_email`, `schedule_email`, Google sync, payment/access changes,
  public publishing, and note exposure remain approval gated.
- Tests confirm no real send occurs in test mode.

## UI Button Mapping

Created `ops/action-registry/ui-button-map.md` with route, button label,
action id, role, behavior, and wired/disabled status coverage for major
Operations, parent, student, and provider participant pages.

## Tests

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS action registry module load check: 40 actions
- PASS focused tests:
  `node --test tests/action-registry-telegram-ui-bot.test.js tests/parent-student-polish-contract.test.js tests/parent-student-portal-contract.test.js tests/service-provider-directory.test.js`
  passed 46/46
- PASS `npm test` passed 268/268
- PASS `npm run app:smoke`
  `ops/live-smokes/2026-06-11T12-42-55-641Z-live-app-smoke.md`
- PASS `npm run openai:smoke`
  `ops/openai-smokes/2026-06-11T12-43-12-855Z-openai-sidekick-smoke.md`
- PASS `npm run railway:doctor`
- PARTIAL `npm run lighthouse`: report was written to `lighthouse-report.html`,
  then Lighthouse exited 1 because Chrome temp cleanup hit Windows `EPERM`.
  Scores extracted from the generated report: performance 63, accessibility 84,
  best-practices 100, SEO 100, agentic-browsing 50.

## Remaining Missing Actions

No P0 missing action was found for the requested newsletter, email, task,
calendar, parent/student helper, or provider separation flows.

Remaining P1/P2 follow-up:

- Replace the simple intent classifier with a schema-constrained OpenAI
  extraction path once production credentials and action telemetry are stable.
- Expand UI button map to every secondary admin/settings button.
- Add live Telegram end-to-end QA in a sandbox chat before enabling broad
  operator use.
- Connect real email/WhatsApp/social/calendar connectors behind the existing
  approval gates.

## Acceptance

- Telegram can refine newsletter without creating a Codex task: passed by typed
  runner test.
- Telegram can draft email without creating a Codex task: passed by typed
  runner test.
- Telegram can create/update tasks through registry: passed.
- Telegram can create calendar events through registry: passed with dry run.
- Code/development requests route to Codex only when appropriate: passed.
- UI buttons have a typed action map: passed.
- Parent/student/provider scopes are protected: passed.
- Real sending/publishing/payment actions require approval/config: passed.
- Every action run writes an audit log event: passed in runner tests.
