# Operations Action Registry, Telegram, UI Bot Handoff

Status: ready for Codex implementation
Priority: P0 architecture
Created: 2026-06-11

## Objective

Build and audit the Operations Action Registry so Telegram, in-app bots, and UI
buttons can call the same safe backend actions instead of turning normal
operations into Codex tasks.

This is not a UI redesign pass. This is the action-system pass that makes
natural-language operations real.

## Core Rule

Every major Operations button should map to a typed action. Telegram and in-app
bots should trigger the same action by natural language. Codex should only be
used for code/development work: repo changes, bug fixes, deploys, migrations,
tests, debugging, and technical implementation.

Do not make every Telegram request into a task. Do not route normal operations
to Codex if a typed action exists.

Normal operations that should not require Codex include:

- refine newsletter
- draft/refine/approve/schedule email
- generate WhatsApp update
- create/update task or stage
- move a lead to Payment Pending
- create/update calendar event
- parse uploaded class transcript
- generate worksheet or source sheet drafts
- create parent update or question digest
- update provider profile
- create class session
- mark content approved
- add timeline note
- update parent/student visible note
- open provider index search
- generate a prefilled WhatsApp link

## Suggested Files

- `src/lib/actions/registry.ts`
- `src/lib/actions/types.ts`
- `src/lib/actions/runner.ts`
- `src/lib/actions/permissions.ts`
- `src/lib/actions/audit-log.ts`
- `src/lib/actions/page-action-map.ts`
- `src/lib/actions/actions/`
- `ops/action-registry/actions.json`
- `ops/action-registry/page-action-map.json`
- `ops/action-registry/ui-button-map.md`

Adapt names if the current JavaScript/static setup prefers `.js`, but keep the
central registry/runner/permissions/audit concepts.

## Action Schema

Each action should define:

- `action_id`
- `label`
- `description`
- `category`
- `page_contexts`
- `allowed_roles`
- `allowed_workspaces`
- `required_inputs`
- `optional_inputs`
- `validation`
- `dry_run_supported`
- `approval_required`
- `execution_handler`
- `audit_log_event`
- `success_message`
- `failure_message`
- `related_routes`
- UI button labels that map to it
- Telegram command/intent examples

Categories:

- tasks
- calendar
- content
- newsletter
- email
- whatsapp
- social
- provider
- student
- parent
- communications
- accounting
- settings
- bot
- admin
- system

## Action Runner Flow

1. Receive action request.
2. Identify user, role, workspace, source, and related object.
3. Validate inputs.
4. Check permissions.
5. Run dry-run preview if supported or needed.
6. Ask approval if sensitive.
7. Execute the handler.
8. Write audit/timeline log.
9. Return structured result.
10. Update UI state where possible.

Sensitive actions requiring approval:

- send email
- send WhatsApp via API
- publish social post
- change payment/access status
- delete/archive data
- expose notes to parent/student
- publish provider profile
- invite user
- change role/permissions
- sync external connector
- send message to parent/student/provider
- mark payment paid
- public website/provider listing changes

Safe actions that can usually execute without approval:

- create/refine draft
- create internal task
- add private note
- create calendar draft/event if admin
- generate worksheet/source-sheet draft
- generate preview
- search records
- summarize page
- show stale tasks

## Telegram Action Router

Update Telegram routing to classify messages into:

- normal chat / strategy
- typed BNA operation action
- Codex/development task
- memory/task capture
- clarification needed

Routing priority:

1. If it matches a typed action, execute through the registry.
2. If it is code/repo/deploy/test/debugging, route to Codex.
3. If it is a ramble/task capture, parse and create tasks/decisions.
4. If unclear, ask a concise clarification.

Example Telegram outcomes:

- "I found the newsletter draft. I can refine it. Here are the proposed changes."
- "I drafted the email from Rabbi Sheller's identity. Approve to schedule?"
- "I moved this lead to Payment Pending and created a follow-up task."
- "I created the calendar event and added it to the student-visible calendar."
- "This requires Codex because it changes code. I created a Codex-ready task."

## First Implementation Flow: Newsletter / Content

Implement or audit this first.

User says: "Refine the newsletter."

Bot should:

1. Find the latest newsletter draft or ask which draft if ambiguous.
2. Load relevant content item.
3. Load brand/content memory if available.
4. Load output prompt/config.
5. Refine draft.
6. Show before/after summary.
7. Save revised draft.
8. Create audit log.
9. Offer next actions: copy, approve, schedule email, draft WhatsApp, make
   social post, send to test email, open in UI.

Actions:

- `find_latest_newsletter_draft`
- `refine_newsletter_draft`
- `save_newsletter_revision`
- `approve_newsletter`
- `draft_email_from_newsletter`
- `schedule_email_draft`
- `generate_whatsapp_from_newsletter`
- `generate_social_posts_from_newsletter`
- `send_test_email`
- `open_content_item_url`

Never send real emails by default. Use preview/dry-run unless explicitly
approved and connector config is present.

## Additional Action Families

Email:

- `draft_email`
- `refine_email`
- `approve_email`
- `send_test_email`
- `schedule_email`
- `pause_scheduled_email`
- `create_drip_sequence`
- `pause_drip_sequence`
- `view_email_log`

Email identity rules:

- BNA school email for BNA parents/students.
- Rabbi Sheller email for Mishnayos Membership/provider communications.
- Real send/schedule/parent-student/provider email requires approval.

Calendar:

- `create_calendar_event`
- `update_calendar_event`
- `delete_calendar_event`
- `create_student_schedule_item`
- `create_parent_visible_event`
- `create_provider_class_session`
- `sync_google_calendar`
- `sync_google_classroom`
- `open_calendar_event`
- `mark_event_parent_visible`
- `mark_event_student_visible`
- `mark_event_admin_only`

Calendar scopes:

- BNA full school calendar
- parent-visible child calendar
- student-visible calendar
- provider simple program schedule

Parent/student helper actions:

- Student: `show_today_plan`, `show_calendar`, `show_assignments`,
  `explain_assignment`, `ask_question`, `update_allowed_goal`,
  `create_help_request`, `summarize_progress_for_student`
- Parent: `show_child_calendar`, `show_child_assignments`, `ask_for_help`,
  `draft_message_to_admin`, `find_service_provider`, `request_password_help`,
  `view_parent_visible_notes`

Privacy:

- Student bot cannot see admin-only notes.
- Parent bot cannot see admin-only notes unless marked parent-visible.
- Provider participant bot cannot see BNA accountability data.
- Provider admin cannot see BNA private school data.

## UI Button Mapping Audit

Create or update `ops/action-registry/ui-button-map.md`.

For every major page, list:

- page route
- visible buttons
- `action_id`
- allowed roles
- expected behavior
- status: wired / disabled / hidden / missing / no-op
- fix needed

Pages:

- Operations dashboard
- Tasks and Task detail
- Students and Student detail
- Student portal
- Parents and Parent detail
- Parent portal
- Content and Content detail
- Calendar
- Communications
- Provider Index
- Rabbi Sheller Provider Workspace
- Provider Participant Portal
- Settings
- Bot Permissions
- Email Identities
- WhatsApp
- Social/Buffer/Publer
- Google Calendar
- Google Classroom

No button should silently do nothing.

## Audit Log Shape

Each action run should store:

- `action_run_id`
- `action_id`
- `user_id`
- `role`
- `workspace_id`
- `source`: telegram / ui_bot / ui_button / system
- `input_summary`
- `dry_run_result`
- `approval_status`
- `approved_by`
- `result_status`
- `result_summary`
- `related_object_type`
- `related_object_id`
- `created_at`
- `error`

## Tests

Add tests for:

- action permission checks
- Telegram action routing
- newsletter refine dry-run
- email draft dry-run
- calendar event create dry-run
- parent/student privacy rules
- provider/BNA separation
- no real send in test mode
- Codex routing only for code/development tasks

Run:

- `npm test`
- `npm run app:smoke` if available
- `npm run openai:smoke` if available

## Report

Create `ops/qa-runs/2026-06-11-action-registry-telegram-ui-bot.md` with:

- actions implemented
- actions audited
- Telegram commands tested
- UI button mapping coverage
- privacy tests
- dry-run tests
- remaining missing actions
- blockers

## Acceptance Criteria

- Telegram can refine newsletter without creating a Codex task.
- Telegram can draft email without creating a Codex task.
- Telegram can create/update task through action registry.
- Telegram can create calendar event through action registry.
- Telegram routes code/development requests to Codex only when appropriate.
- UI buttons map to typed actions.
- In-app bot uses same action registry.
- Parent/student/provider scopes are protected.
- Real sending/publishing/payment actions require explicit approval and
  connector config.
- Every action writes an audit log.
