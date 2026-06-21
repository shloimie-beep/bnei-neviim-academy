# One Time Action Coverage

Generated: 2026-06-21T15:25:00+03:00

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Summary

- Covered visible One Time controls: 22
- Working first-party actions: workspace users, tasks, Decisions, class packages,
  classroom sessions, classroom threads, moderation review, email/social drafts,
  integration readbacks, and agent evidence readback.
- Setup-path actions: appointment booking setup, Vimeo upload setup, and
  recording retry/dead-letter setup.
- External writes remain gated: email send, WhatsApp send, Zoom meeting
  creation, Vimeo upload, public publishing, checkout/access grants, DNS, and
  connector writes.

## Required Label Coverage

| Required control | Coverage |
| --- | --- |
| Add Member | `one_time.workspace_user.invite_no_send` |
| Invite User | `one_time.workspace_user.invite_no_send` |
| Assign Role | `one_time.workspace_user.assign_role` |
| Add Class | `one_time.class_package.create` |
| Add Session | `one_time.classroom.assignment.create` |
| Add Appointment | `one_time.appointment.setup_task` |
| Add Task | `one_time.tasks.add` |
| Create Decision | `one_time.decisions.create` |
| Create Draft | `one_time.communications.create_draft` |
| Configure Integration | `one_time.integrations.configure` |
| Test Connection | `one_time.integrations.test_connection` |
| Preview Upload | `one_time.class_package.preview_upload` |
| Attach Vimeo Video | `one_time.class_package.attach_vimeo` |
| Approve | `one_time.member_library.approve` and classroom moderation review |
| Publish | `one_time.member_library.publish` |
| Unpublish | `one_time.member_library.rollback` |
| Archive | `one_time.tasks.archive_restore` |
| Restore | `one_time.tasks.archive_restore` and member-library rollback |
| Retry | `one_time.recording.retry_setup` |
| View Evidence | `one_time.agent_run.view_evidence` |

## Guardrails

- Buttons that can mutate only first-party records name the server endpoint and
  expected success/error state in
  `ops/action-registry/one-time-action-coverage.json`.
- Gated controls route to a concrete setup prompt instead of a generic
  placeholder.
- The only remaining `showNotConfigured(...)` usage is the disabled workspace
  switch denial for a user who lacks access to that workspace.
- Publish and rollback controls are local member-library actions and remain
  exact-approval gated where required.
- No live email, WhatsApp, Zoom, Vimeo upload, billing, DNS, external CRM, or
  connector write is enabled by this batch.

## Verification

- `tests/one-time-action-coverage.test.js`
- `tests/watchdog-action-registry.test.js`
