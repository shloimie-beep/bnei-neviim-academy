# 09 — Current Capability Gap Inventory

Grounded to `master` commit `d68e3f9`. Regenerate at pickup; current source wins.

## Four competing runtime engines

1. Telegram monolith with hand-built routing and local memory/state.
2. Dormant canonical `assistant_*` control-plane schema/contract.
3. Operations Helper with 169 tools and its own planner/profile/confirmation/audit tables.
4. Web/universal assistant with `bna_assistant_*` plus hardcoded regex actions and a separate public chat path.

The canonical schema has drift: control-center code selects columns not present in the declared tables (`channel_key` versus `channel_id`, approval field names, and a missing draft status). Execute real Postgres queries; existing fake DB tests do not catch this.

## Telegram hardcoded routed action IDs — 24

```text
add_decision_option
calendar_batch_launch_plan_preview
capture_provider_google_business_link
classroom_topic_material_preview
create_one_time_video_library_item
create_provider_classroom_draft
create_rabbi_shiur_idea
create_rabbi_source_sheet_task
create_referral_ledger_entry
create_task
find_latest_newsletter_draft
google_business_list_locations_preview
google_business_place_id_lookup
move_lead_stage
move_task_workspace
preview_one_time_member_library_publish_package
preview_social_schedule_package
refine_newsletter_draft
retitle_task_naturally
review_moderated_question
schedule_task_on_date
show_contact_communication_history
submit_student_question_for_moderation
update_task_stage
```

This is the real Telegram action denominator at the audit point—not 80.

## Typed actions without Helper wrapper — 11

```text
create_student_schedule_item
explain_assignment
generate_whatsapp_from_newsletter
pause_scheduled_email
preview_one_time_member_library_publish_package
preview_social_schedule_package
schedule_assistant_reminder
schedule_email
schedule_task_on_date
send_test_email
show_today_plan
```

## Helper-only tools without live typed-action contract — 100

- **Automations:** `create_automation`, `update_automation`
- **Calendar:** `create_calendar_event_draft`, `list_calendar_sessions`, `update_calendar_event_draft`
- **Codex/agent:** `audit_queue_status`, `create_codex_work_item`
- **Communications:** `draft_social_post`, `schedule_social_post_via_buffer`, `send_email`
- **Contacts/CRM:** `create_contact`, `create_provider_lead`, `list_provider_leads`, `update_provider_lead`
- **Content:** `create_content_item`, `draft_mishnayos_landing_page`
- **Decisions:** `add_decision_comment`, `convert_decision_to_task`, `send_decision_to_codex`
- **Intake:** `capture_ramble`, `capture_raw_intake`, `distill_ramble`
- **Integrations:** `create_dns_setup_task`, `create_integration_setup_task`, `mark_integration_blocked_until_thursday`, `rotate_provider_api_key`, `save_provider_api_key`, `show_integration_status`, `test_buffer_connection`, `test_resend_connection`, `test_vimeo_connection`, `test_wapi_connection`
- **Navigation:** `open_operations_view`
- **Operations:** `create_setup_flow`
- **Parents:** `create_parent`, `create_parent_question`, `create_parent_visible_summary`, `update_parent_helper_profile`
- **Provider setup:** `create_provider_landing_page`, `create_provider_offer`, `create_provider_profile`, `create_provider_workspace`, `update_provider_brand_kit`, `update_rabbi_brand_kit`
- **Reports:** `show_one_time_launch_checklist`, `show_task_report`
- **Students:** `create_accountability_note`, `create_assignment`, `create_shoutout_draft`, `create_student`, `create_student_goal`, `create_student_question`, `create_student_question_queue`, `create_worksheet_from_transcript`, `list_students`, `mark_attendance`, `parse_student_questions`, `reset_student_login`, `show_my_assignments`, `show_my_goals`, `show_parent_students`, `show_student_progress`, `show_student_progress_for_parent`, `submit_checkoff`, `submit_question`, `submit_worksheet_answer`, `update_goal_progress`, `update_student`
- **Studio:** `create_course`, `create_lesson`, `create_library_item`, `create_worksheet`, `generate_worksheet`, `ingest_class_video_from_drive_or_upload`, `parse_recording`, `publish_library_item_after_approval`, `transcribe_video`
- **Support:** `create_support_ticket`
- **Tasks:** `add_task_comment`, `archive_duplicate_pending`, `ask_for_help`, `attach_drive_file`, `create_class_session`, `create_goal`, `create_pending_blocker`, `link_prompt_to_goal`, `mark_pending_received`, `mark_task_done`, `mark_task_verified`, `reprocess_decision`, `request_missing_input`, `update_goal_status`, `update_task`, `upload_provider_asset_reference`
- **Video:** `attach_vimeo_url_to_library_item`, `mark_manual_vimeo_upload_needed`, `prepare_vimeo_upload`
- **Watchdog/goals:** `run_watchdog_audit`, `show_goal_status`, `show_operating_goals`

Each must become one of: canonical capability backed by a real handler, compatibility alias to a typed action, preview-only with honest state, blocked/unavailable with exact reason, or intentionally excluded. A packet/dry-run wrapper is not equivalent to execution.

## Registry/report drift

- Live typed actions: 80.
- Helper tools: 169; 69 overlap typed IDs.
- Root/UI actions: 127; zero exact ID intersection with typed actions and no canonical foreign key.
- Route records at audit: 140.
- `ops/action-registry/actions.json` is stale: it contains `open_internal_calendar` absent from live source and omits live `record_agent_result`.
- Universal parity generated July 9 reports 120 root actions while current root registry has 127.
- Current parity marks Telegram as 80 based on examples/context; runtime hardcodes 24.
- Shared planner matched only 56 of its own 123 English examples (45.5%); zero Hebrew examples existed.

## Permission defects to remove

- `src/lib/actions/permissions.js` treats admin-like roles as interchangeable.
- `runAction` and `/api/bna/actions/run` allow request payload role/workspace values to outrank trusted context.
- Telegram currently hardcodes Shloimie as BNA `operator` rather than platform `super_admin`.
- Super-admin all-workspace read and a mutation target are different concepts; every write still names one scope.

## Planner defects to remove

- Current planner metadata lacks complete strict input schemas and explicit effect semantics.
- Deterministic scoring is targeted to a small action subset.
- Helper AI planner receives metadata but not complete argument schemas.
- Unmatched Helper text can default to `create_task`; replace with clarify/no match.
- Regex routing may remain as a high-confidence guard for a few dangerous or exact commands, but cannot be the natural-language architecture.
