# One Time Action Coverage

Generated at 2026-07-08T19:14:49.994Z.

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

Requirement: REQ-20260621-502

## Summary

- Status: covered
- Product controls inventoried: 21
- Registry hook controls inventoried: 19
- Root registry actions: 120
- Detailed registry actions: 80
- Registry external/app-visible write controls: 7
- Registry missing/repair rows: 0

## Required Label Coverage

| Required control | Coverage |
| --- | --- |
| Add Member / Invite User | `one_time.workspace_user.invite_no_send` |
| Assign Role | `one_time.workspace_user.assign_role` |
| Deactivate / Reactivate / Remove Membership | `one_time.workspace_user.lifecycle` |
| Add Task | `one_time.tasks.add` |
| Create Decision | `one_time.decisions.create` |
| Add Class | `one_time.class_package.create` |
| Add Session | `one_time.classroom.assignment.create` |
| Add Appointment setup | `one_time.appointment.setup_task` |
| Save / Attach Vimeo Video | `one_time.class_package.attach_vimeo` |
| Preview Upload | `one_time.class_package.preview_upload` |
| Approve | `one_time.member_library.approve` |
| Publish | `one_time.member_library.publish` |
| Unpublish / Restore Latest | `one_time.member_library.rollback` |
| Retry setup | `one_time.recording.retry_setup` |
| Post Rabbi Thread | `one_time.classroom.thread.create` |
| Approve / Feature / Parent Hold / Reject | `one_time.classroom.message.review` |
| Configure Integration | `one_time.integrations.configure` |
| Test Connection | `one_time.integrations.test_connection` |
| Create Draft | `one_time.communications.create_draft` |
| View Evidence | `one_time.agent_run.view_evidence` |
| Archive / Restore | `one_time.tasks.archive_restore` |

## Registry Hook Classification Counts

- typed_action: 1
- read_only_navigation: 1
- preview_then_approve: 1
- preview_only: 6
- approval_gated: 9
- deep_link_only: 1

## Registry Hook Coverage

| Status | Control | Action | Classification | Risk | Gate | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| covered | Ask / Search | ACTION-OPERATIONS-HELPER-OPEN | typed_action | low | direct/read-only | npm run watchdog:actions |
| covered | View One Time as Rabbi | ACTION-ONETIME-WORKSPACE-VIEW | read_only_navigation | low | direct/read-only | npm run app:smoke:operations-workspace-taxonomy |
| covered | Create automation with helper | ACTION-HELPER-CREATE-AUTOMATION | preview_then_approve | medium | approval/dry-run required | tests/watchdog-action-registry.test.js |
| covered | Preview Drive Brief | ACTION-ONETIME-DRIVE-BRIEF-PREVIEW | preview_only | low | direct/read-only | tests/watchdog-action-registry.test.js |
| covered | Package Preview | preview_one_time_member_library_publish_package | preview_only | medium | approval/dry-run required | tests/action-registry-telegram-ui-bot.test.js |
| covered | Run Smoke | ACTION-ONETIME-MEMBER-LIBRARY-SMOKE | approval_gated | high | approval/dry-run required | tests/one-time-member-library.test.js |
| covered | Preview Package | ACTION-ONETIME-CLASS-PACKAGE-PREVIEW | preview_only | low | direct/read-only | tests/one-time-member-library.test.js |
| covered | Member Preview | ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW | preview_only | low | direct/read-only | tests/one-time-member-library.test.js |
| covered | Approve | ACTION-ONETIME-MEMBER-LIBRARY-APPROVE | approval_gated | high | approval/dry-run required | tests/one-time-member-library.test.js |
| covered | Publish | ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH | approval_gated | high | approval/dry-run required | tests/one-time-member-library.test.js |
| covered | Rollback Latest | ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK | approval_gated | high | approval/dry-run required | tests/one-time-member-library.test.js |
| covered | Dry-run send | ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN | preview_only | medium | direct/read-only | tests/live-class-infrastructure.test.js |
| covered | Send links | ACTION-ONETIME-LIVE-ZOOM-LINK-SEND | approval_gated | high | approval/dry-run required | tests/live-class-infrastructure.test.js |
| covered | Generate Access Code | ACTION-PARENT-ACCESS-CODE-GENERATE | approval_gated | high | approval/dry-run required | tests/operations-pwa-login.test.js |
| covered | Open Parent Portal | ACTION-PARENT-ACCESS-LINK-OPEN | deep_link_only | medium | direct/read-only | tests/operations-pwa-login.test.js |
| covered | Email Login Link | ACTION-PARENT-ACCESS-LINK-EMAIL | approval_gated | high | approval/dry-run required | tests/operations-pwa-login.test.js |
| covered | WhatsApp Login Link | ACTION-PARENT-ACCESS-LINK-WHATSAPP | approval_gated | high | approval/dry-run required | tests/operations-pwa-login.test.js |
| covered | Preview Password Setup | ACTION-PARENT-PASSWORD-SETUP-PREVIEW | preview_only | medium | direct/read-only | tests/operations-pwa-login.test.js |
| covered | Email Password Setup | ACTION-PARENT-PASSWORD-SETUP-SEND | approval_gated | high | approval/dry-run required | tests/operations-pwa-login.test.js |
