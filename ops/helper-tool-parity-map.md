# Helper Tool Parity Map

Generated from `src/lib/actions/registry.js`, `src/lib/bna/helper/tool-registry.js`, and the 2026-06-16 on-page scoped helper prompt.

## Summary

- external_blocker: 26
- requires_confirmation: 49
- student_safe_only: 7
- tool_available: 61
- tool_needed: 127

## Surfaces

- operations: 183
- parent: 21
- provider: 37
- rabbi: 9
- student: 20

## Notes

- `tool_available` means a helper wrapper exists and can run within the resolved scope.
- `requires_confirmation` means the helper can plan the action but must show a confirmation gate before execution.
- `tool_needed` means the current UI/action exists or was requested, but the helper wrapper is not implemented yet.
- `external_blocker` means live execution depends on credentials, account ownership, or approval-gated external systems.
- `student_safe_only` means the action belongs behind child-safe student scoping before a general helper can expose it.

## Records

| Surface | Label | Helper tool | Status | Confirm | File |
|---|---|---|---|---|---|
| operations | add decision comment | add_decision_comment | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | Add decision option | add_decision_option | tool_needed | yes | public/operations.html |
| operations | add task comment | add_task_comment | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | Add timeline note | add_timeline_note | tool_needed | no | public/operations.html |
| operations | Approve email | approve_email | tool_needed | yes | public/operations.html |
| operations | Approve newsletter | approve_newsletter | tool_needed | yes | public/operations.html |
| operations | Archive calendar event | delete_calendar_event | tool_needed | yes | public/operations.html |
| operations | archive duplicate pending | archive_duplicate_pending | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | ask for help | ask_for_help | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | attach drive file | attach_drive_file | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | attach vimeo url | attach_vimeo_url_to_library_item | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | audit queue status | audit_queue_status | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | Capture provider Google Business link | capture_provider_google_business_link | tool_needed | yes | public/operations.html |
| operations | capture ramble | capture_ramble | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | capture raw intake | capture_raw_intake | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | convert decision to task | convert_decision_to_task | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create accountability note | create_accountability_note | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create automation | create_automation | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create buffer setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create calendar event | create_calendar_event | tool_needed | no | public/operations.html |
| operations | create calendar event draft | create_calendar_event_draft | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create checkout draft only | create_checkout_draft_only | external_blocker | yes | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create codex task | create_codex_work_item | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create codex work item | create_codex_work_item | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create contact | create_contact | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | create content item | create_content_item | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create content job | create_content_item | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create course | create_course | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create decision | create_decision | tool_available | no | public/operations.html |
| operations | create dns setup task | create_dns_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create goal | create_goal | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Create help request | create_help_request | requires_confirmation | yes | public/operations.html |
| operations | create integration setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create lesson | create_lesson | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create library item | create_library_item | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create One Time video library item | create_one_time_video_library_item | tool_needed | yes | public/operations.html |
| operations | create parent | create_parent | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create parent-visible event | create_parent_visible_event | tool_needed | no | public/operations.html |
| operations | create payment intake | create_payment_intake | external_blocker | yes | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create pending access item | create_pending_blocker | tool_available | yes | src/lib/bna/helper/tool-registry.js |
| operations | create pending blocker | create_pending_blocker | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create pending item | create_pending_blocker | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | create product tier draft | create_task | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | Create provider class session | create_provider_class_session | tool_needed | no | public/operations.html |
| operations | Create provider classroom draft | create_provider_classroom_draft | requires_confirmation | yes | public/operations.html |
| operations | create provider profile | create_provider_profile | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create Rabbi shiur idea | create_rabbi_shiur_idea | requires_confirmation | yes | public/operations.html |
| operations | Create Rabbi source-sheet task | create_rabbi_source_sheet_task | requires_confirmation | yes | public/operations.html |
| operations | Create referral ledger entry | create_referral_ledger_entry | tool_needed | yes | public/operations.html |
| operations | Create report-problem ticket | create_report_problem_ticket | requires_confirmation | yes | public/operations.html |
| operations | create resend setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create setup flow | create_setup_flow | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | create shoutout draft | create_shoutout_draft | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create stripe setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create student | create_student | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create student schedule item | create_student_schedule_item | external_blocker | no | public/operations.html |
| operations | create support ticket | create_support_ticket | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | Create task | create_task | tool_available | no | public/operations.html |
| operations | Create ticket | create_ticket | requires_confirmation | yes | public/operations.html |
| operations | create vimeo setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create wapi setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | create worksheet | create_worksheet | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | create zoom meeting after confirmation and credentials | create_zoom_meeting_after_confirmation_and_credentials | external_blocker | yes | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | create zoom setup task | create_integration_setup_task | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | distill ramble | distill_ramble | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Draft automation | draft_automation | tool_needed | yes | public/operations.html |
| operations | draft buffer post | draft_social_post | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | Draft drip sequence | draft_drip_sequence | tool_needed | yes | public/operations.html |
| operations | Draft email | draft_email | tool_available | no | public/operations.html |
| operations | Draft email campaign | draft_email_campaign | tool_needed | yes | public/operations.html |
| operations | Draft email from newsletter | draft_email_from_newsletter | tool_needed | no | public/operations.html |
| operations | draft mishnayos landing page | draft_mishnayos_landing_page | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Draft parent response | draft_parent_response | tool_available | no | public/operations.html |
| operations | draft payment reminder | draft_payment_reminder | external_blocker | yes | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | draft social post | draft_social_post | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | Draft weekly update | draft_weekly_update | tool_available | no | public/operations.html |
| operations | draft whatsapp | draft_whatsapp | external_blocker | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Find latest newsletter draft | find_latest_newsletter_draft | tool_needed | no | public/operations.html |
| operations | Generate social posts from newsletter | generate_social_posts_from_newsletter | tool_needed | no | public/operations.html |
| operations | Generate student worksheet | generate_student_worksheet | tool_needed | no | public/operations.html |
| operations | Generate WhatsApp from newsletter | generate_whatsapp_from_newsletter | external_blocker | no | public/operations.html |
| operations | generate worksheet | generate_worksheet | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | ingest class video from drive or upload | ingest_class_video_from_drive_or_upload | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | link prompt to goal | link_prompt_to_goal | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | list calendar sessions | list_calendar_sessions | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | list content jobs | create_content_item | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | list payment roster | list_payment_roster | external_blocker | yes | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | list provider leads | list_provider_leads | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | list students | list_students | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | list tasks | show_task_report | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | mark attendance | mark_attendance | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Mark event admin-only | mark_event_admin_only | tool_needed | no | public/operations.html |
| operations | Mark event parent-visible | mark_event_parent_visible | tool_needed | yes | public/operations.html |
| operations | Mark event student-visible | mark_event_student_visible | tool_needed | yes | public/operations.html |
| operations | mark integration blocked until thursday | mark_integration_blocked_until_thursday | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | mark pending received | mark_pending_received | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | mark task done | mark_task_done | requires_confirmation | yes | src/lib/bna/helper/tool-registry.js |
| operations | mark task verified | mark_task_verified | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Move lead stage | move_lead_stage | tool_needed | no | public/operations.html |
| operations | Move task workspace | move_task_workspace | tool_needed | yes | public/operations.html |
| operations | Open calendar event | open_calendar_event | tool_available | no | public/operations.html |
| operations | Open content item | open_content_item_url | tool_available | no | public/operations.html |
| operations | open operations view | open_operations_view | tool_available | no | src/lib/bna/helper/tool-registry.js |
| operations | parse recording | parse_recording | tool_needed | no | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | parse student questions | parse_student_questions | tool_needed | yes | src/lib/bna/helper/tool-registry.js |
| operations | Pause scheduled email | pause_scheduled_email | external_blocker | yes | public/operations.html |
| operations | Post community message | post_community_message | tool_needed | no | public/operations.html |
| operations | Preview campaign segment | preview_campaign_segment | tool_needed | yes | public/operations.html |
| operations | Preview Classroom topic material | classroom_topic_material_preview | tool_needed | yes | public/operations.html |
| operations | Preview Drive Doc creation | google_drive_create_doc_preview | tool_needed | yes | public/operations.html |
| operations | Preview Drive file move | google_drive_move_file_preview | tool_needed | yes | public/operations.html |
| operations | Preview Drive file search | google_drive_find_file_preview | tool_needed | no | public/operations.html |
| operations | Preview Drive folder creation | google_drive_create_folder_preview | tool_needed | yes | public/operations.html |
| operations | Preview Google Business locations | google_business_list_locations_preview | tool_needed | yes | public/operations.html |
| operations | Preview Google Business Place ID lookup | google_business_place_id_lookup | tool_needed | yes | public/operations.html |
| operations | Preview launch calendar plan | calendar_batch_launch_plan_preview | tool_needed | yes | public/operations.html |
| operations | Preview One Time member-library publish package | preview_one_time_member_library_publish_package | external_blocker | yes | public/operations.html |
| operations | preview send | preview_send | external_blocker | yes | tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md |
| operations | Preview social schedule package | preview_social_schedule_package | external_blocker | yes | public/operations.html |
| operations | publish library item after approval | publish_library_item_after_approval | tool_needed | yes | src/lib/bna/helper/tool-registry.js |

Full machine-readable map: `ops/helper-tool-parity-map.json` (270 records).
