# Universal Action Parity

Generated at 2026-07-16T23:12:30.031Z.

Requirement: REQ-20260623-013

## Release Gate

- Status: passed
- all_visible_controls_classified: pass (71/71)
- zero_visible_missing_contracts: pass (0)
- zero_missing_handlers: pass (0)
- zero_missing_tests: pass (0)
- zero_risky_actions_without_approval: pass (0)
- telegram_request_parity_present: pass (80)
- website_assistant_request_parity_present: pass (263)
- agent_work_handoff_parity_present: pass (121)

## Summary

- Root registry actions: 176
- Detailed typed actions: 87
- Visible UI hooks: 71
- Visible UI hooks classified: 71
- Missing contracts: 0
- Missing handlers: 0
- Missing tests: 0
- Risky actions without approval: 0

## Parity Sources

| Source | Count |
| --- | ---: |
| ui_button | 71 |
| telegram_request | 80 |
| website_assistant_request | 263 |
| operations_helper_request | 226 |
| automation_action | 115 |
| agent_work_handoff | 121 |

## Visible Control Classifications

| Classification | Count |
| --- | ---: |
| preview_then_approve | 46 |
| read_only | 9 |
| secure_deep_link_only | 6 |
| blocked_connector | 4 |
| not_applicable | 2 |
| executable | 4 |

## Required Category Coverage

| Category | State | Actions |
| --- | --- | --- |
| provider_profile | covered_by_canonical_registry | capture_provider_google_business_link<br>google_business_list_locations_preview<br>google_business_place_id_lookup<br>update_provider_profile |
| provider_listing | covered_by_canonical_registry | request_provider_contact |
| provider_website | covered_by_canonical_registry | ACTION-STUDIO-AI-VIDEO-WORKER-HANDOFF<br>ACTION-STUDIO-APPLY-CORRECTION<br>ACTION-STUDIO-COMPILE-PROMPT<br>ACTION-STUDIO-CREATE-PROJECT<br>ACTION-STUDIO-GENERATE-STORYBOARD<br>ACTION-STUDIO-HANDOFF-CONTENT |
| brand | not_applicable_current_surface | No current visible control in this category; future work must add a typed registry row before exposing UI or assistant execution. |
| landing_page | covered_by_canonical_registry | ACTION-ONETIME-PUBLIC-HELPER-OPEN<br>ACTION-ONETIME-PUBLIC-WHATSAPP |
| seo | covered_by_canonical_registry | capture_provider_google_business_link<br>google_business_list_locations_preview<br>google_business_place_id_lookup |
| course | covered_by_canonical_registry | ACTION-ONETIME-CLASS-PACKAGE-PREVIEW<br>ACTION-PROVIDER-CLASSROOM-DRAFT<br>classroom_topic_material_preview<br>create_provider_class_session<br>create_provider_classroom_draft<br>create_rabbi_shiur_idea |
| class | covered_by_canonical_registry | ACTION-AGENT-REVIEW-COPY-SESSION<br>ACTION-AGENT-REVIEW-EXIT<br>ACTION-AGENT-REVIEW-RETURN-HUB<br>ACTION-ONETIME-CLASS-LINK-REVEAL-DISABLED<br>ACTION-ONETIME-CLASS-PACKAGE-PREVIEW<br>ACTION-ONETIME-GET-CURRENT-CLASS-LINK |
| lesson | covered_by_canonical_registry | create_one_time_video_library_item<br>create_rabbi_shiur_idea |
| video | covered_by_canonical_registry | ACTION-STUDIO-AI-VIDEO-WORKER-HANDOFF<br>create_one_time_video_library_item |
| worksheet | covered_by_canonical_registry | generate_student_worksheet |
| community | covered_by_canonical_registry | ACTION-CRM-OPEN-SCOPED-INBOX<br>ACTION-CRM-OPEN-WHATSAPP-THREAD<br>ACTION-PROVIDER-CLASSROOM-DRAFT<br>ACTION-PROVIDER-MAILBOX-THREAD-OPEN<br>create_provider_classroom_draft<br>create_provider_question_post |
| announcement | covered_by_canonical_registry | approve_newsletter<br>draft_email_from_newsletter<br>draft_weekly_update<br>find_latest_newsletter_draft<br>generate_social_posts_from_newsletter<br>generate_whatsapp_from_newsletter |
| chart | not_applicable_current_surface | No current visible control in this category; future work must add a typed registry row before exposing UI or assistant execution. |
| dashboard_layout | covered_by_canonical_registry | ACTION-ONETIME-PUBLIC-SECTION-NAV<br>open_internal_calendar<br>show_child_calendar |
| email_campaign | covered_by_canonical_registry | ACTION-CRM-OPEN-SCOPED-INBOX<br>ACTION-ONETIME-PARENT-PASSWORD-REQUEST<br>ACTION-ONETIME-PROVIDER-SESSION-START<br>ACTION-OPERATIONS-EMAIL-INBOX-BNA<br>ACTION-OPERATIONS-EMAIL-INBOX-RABBI<br>ACTION-PARENT-ACCESS-LINK-EMAIL |
| drip_sequence | covered_by_canonical_registry | draft_drip_sequence |
| template_version | covered_by_canonical_registry | ACTION-CRM-REPLY-DRAFT-BLOCKED<br>ACTION-ONETIME-COMMUNICATION-AGENT-COMPARE<br>ACTION-ONETIME-COMMUNICATION-AGENT-PUBLISH<br>ACTION-ONETIME-COMMUNICATION-AGENT-RESTORE<br>ACTION-ONETIME-COMMUNICATION-AGENT-SAVE-DRAFT<br>ACTION-ONETIME-MEMBER-LIBRARY-APPROVE |
| automation | covered_by_canonical_registry | ACTION-HELPER-CREATE-AUTOMATION<br>draft_automation |
| segment | covered_by_canonical_registry | ACTION-CRM-ACTION-OVERFLOW<br>ACTION-CRM-ADD-CONTACT<br>ACTION-CRM-ADD-NOTE<br>ACTION-CRM-ADD-TAG<br>ACTION-CRM-ARCHIVE-CONTACT<br>ACTION-CRM-ASSIGN-OWNER |
| reminder | covered_by_canonical_registry | ACTION-CRM-SET-FOLLOW-UP<br>create_calendar_event<br>create_student_schedule_item<br>delete_calendar_event<br>open_calendar_event<br>pause_scheduled_email |
| ticket | covered_by_canonical_registry | ACTION-ONETIME-MEMBER-SUPPORT-TICKET<br>ACTION-ONETIME-RABBI-TELEGRAM-TICKET-CREATE<br>ACTION-ONETIME-RABBI-TICKET-APPROVE-CODEX<br>ACTION-ONETIME-RABBI-TICKET-ASK-RABBI<br>ACTION-ONETIME-RABBI-TICKET-KEEP<br>ACTION-ONETIME-RABBI-TICKET-REJECT |
| support | covered_by_canonical_registry | ACTION-ONETIME-MEMBER-SUPPORT-TICKET<br>ACTION-ONETIME-SUPPORT-CONSUMER-INTAKE<br>ACTION-ONETIME-SUPPORT-CONSUMER-OPERATOR-DECISION<br>create_help_request<br>create_report_problem_ticket<br>create_ticket |
| file_intake | covered_by_canonical_registry | ACTION-HELPER-CAPTURE-RAW-INTAKE<br>ACTION-ONETIME-DRIVE-BRIEF-PREVIEW<br>google_drive_create_doc_preview<br>google_drive_create_folder_preview<br>google_drive_find_file_preview<br>google_drive_move_file_preview |
| integration | covered_by_canonical_registry | ACTION-CRM-OPEN-WHATSAPP-THREAD<br>ACTION-INTEGRATION-SETUP-OPEN<br>ACTION-INTEGRATION-SETUP-VALIDATE<br>ACTION-ONETIME-GET-CURRENT-CLASS-LINK<br>ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN<br>ACTION-ONETIME-LIVE-ZOOM-LINK-SEND |
| billing | covered_by_canonical_registry | ACTION-ONETIME-PAYMENT-ACCESS-GRANT-DISABLED<br>ACTION-ONETIME-PAYMENT-ACCESS-REVIEW-CHECKOUTS<br>ACTION-ONETIME-PAYMENT-ACCESS-REVIEW-CLASS-LINKS |
| agent_work | covered_by_canonical_registry | ACTION-AGENT-RESULT-RECORD<br>ACTION-AGENT-REVIEW-COPY-PROMPT<br>ACTION-AGENT-REVIEW-COPY-SESSION<br>ACTION-AGENT-REVIEW-EXIT<br>ACTION-AGENT-REVIEW-MARK-BLOCKED<br>ACTION-AGENT-REVIEW-OPEN-CONTEXT |
| deployment_status | covered_by_canonical_registry | ACTION-ONETIME-AGENT-ACCEPTANCE-VIEW-STATUS<br>ACTION-ONETIME-MEMBER-LIBRARY-SMOKE<br>ACTION-ONETIME-SCOPED-AGENT-STATUS<br>ACTION-PROVIDER-SECTION-NAVIGATION |

## Guardrails

- Telegram, website assistant, Operations helper, automation, and Agent Work rows are derived from the existing action registries.
- Browser click substitution is not a parity source.
- Future categories without current visible controls are marked not_applicable_current_surface, not missing_contract.
