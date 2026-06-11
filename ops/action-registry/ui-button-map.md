# UI Button Action Map

Generated from `src/lib/actions/registry.js` on 2026-06-11.

| Page context | Visible button labels | action_id | Allowed roles | Expected behavior | Status |
| --- | --- | --- | --- | --- | --- |
| internal_dialogue | Add Note, Save Note | `add_timeline_note` | super_admin, admin, bna_admin, operator, system | Add an internal note to an Operations timeline or dialogue thread. | wired |
| task_detail | Add Note, Save Note | `add_timeline_note` | super_admin, admin, bna_admin, operator, system | Add an internal note to an Operations timeline or dialogue thread. | wired |
| student_detail | Add Note, Save Note | `add_timeline_note` | super_admin, admin, bna_admin, operator, system | Add an internal note to an Operations timeline or dialogue thread. | wired |
| provider_detail | Add Note, Save Note | `add_timeline_note` | super_admin, admin, bna_admin, operator, system | Add an internal note to an Operations timeline or dialogue thread. | wired |
| communications | Approve Email | `approve_email` | super_admin, admin, bna_admin, operator, system | Approve an email draft for scheduling or sending. | wired |
| content | Approve Newsletter | `approve_newsletter` | super_admin, admin, bna_admin, operator, system | Mark a newsletter draft approved after human review. | wired |
| communications | Approve Newsletter | `approve_newsletter` | super_admin, admin, bna_admin, operator, system | Mark a newsletter draft approved after human review. | wired |
| calendar | New Event, Create Event | `create_calendar_event` | super_admin, admin, bna_admin, operator, system | Create an internal BNA calendar event without requiring Google Calendar. | wired |
| student_portal | New Event, Create Event | `create_calendar_event` | super_admin, admin, bna_admin, operator, system | Create an internal BNA calendar event without requiring Google Calendar. | wired |
| parent_portal | New Event, Create Event | `create_calendar_event` | super_admin, admin, bna_admin, operator, system | Create an internal BNA calendar event without requiring Google Calendar. | wired |
| telegram | New Event, Create Event | `create_calendar_event` | super_admin, admin, bna_admin, operator, system | Create an internal BNA calendar event without requiring Google Calendar. | wired |
| student_helper | Ask for help, Ask BNA Helper, Parent Help | `create_help_request` | parent, student, super_admin, admin, bna_admin, operator, system | Create a parent/student-safe help request for staff. | wired |
| parent_helper | Ask for help, Ask BNA Helper, Parent Help | `create_help_request` | parent, student, super_admin, admin, bna_admin, operator, system | Create a parent/student-safe help request for staff. | wired |
| messages_help | Ask for help, Ask BNA Helper, Parent Help | `create_help_request` | parent, student, super_admin, admin, bna_admin, operator, system | Create a parent/student-safe help request for staff. | wired |
| parent_portal | Add Parent Event | `create_parent_visible_event` | super_admin, admin, bna_admin, operator, system | Create a parent-visible child calendar item. | wired |
| student_detail | Add Parent Event | `create_parent_visible_event` | super_admin, admin, bna_admin, operator, system | Create a parent-visible child calendar item. | wired |
| calendar | Add Parent Event | `create_parent_visible_event` | super_admin, admin, bna_admin, operator, system | Create a parent-visible child calendar item. | wired |
| provider_workspace | New Class Session | `create_provider_class_session` | super_admin, admin, operator, provider_admin, system | Create a provider program session without exposing BNA school accountability. | wired |
| provider_participant | New Class Session | `create_provider_class_session` | super_admin, admin, operator, provider_admin, system | Create a provider program session without exposing BNA school accountability. | wired |
| calendar | New Class Session | `create_provider_class_session` | super_admin, admin, operator, provider_admin, system | Create a provider program session without exposing BNA school accountability. | wired |
| provider_participant | Post Question, Save Post | `create_provider_question_post` | super_admin, admin, operator, provider_admin, participant, system | Create a structured provider participant question or post. | wired |
| provider_workspace | Post Question, Save Post | `create_provider_question_post` | super_admin, admin, operator, provider_admin, participant, system | Create a structured provider participant question or post. | wired |
| operations_shell | Report Problem, Send Bug Report | `create_report_problem_ticket` | super_admin, admin, bna_admin, operator, system | Create a support-ticket preview from the current UI context. | wired |
| settings | Report Problem, Send Bug Report | `create_report_problem_ticket` | super_admin, admin, bna_admin, operator, system | Create a support-ticket preview from the current UI context. | wired |
| telegram | Report Problem, Send Bug Report | `create_report_problem_ticket` | super_admin, admin, bna_admin, operator, system | Create a support-ticket preview from the current UI context. | wired |
| student_detail | Add Student Event | `create_student_schedule_item` | super_admin, admin, bna_admin, operator, system | Create a student-visible schedule item in the BNA calendar. | wired |
| student_portal | Add Student Event | `create_student_schedule_item` | super_admin, admin, bna_admin, operator, system | Create a student-visible schedule item in the BNA calendar. | wired |
| calendar | Add Student Event | `create_student_schedule_item` | super_admin, admin, bna_admin, operator, system | Create a student-visible schedule item in the BNA calendar. | wired |
| tasks | Create Task, Add Task, Save Task | `create_task` | super_admin, admin, bna_admin, operator, system | Create an internal Operations task from typed inputs or natural language. | wired |
| dashboard | Create Task, Add Task, Save Task | `create_task` | super_admin, admin, bna_admin, operator, system | Create an internal Operations task from typed inputs or natural language. | wired |
| internal_dialogue | Create Task, Add Task, Save Task | `create_task` | super_admin, admin, bna_admin, operator, system | Create an internal Operations task from typed inputs or natural language. | wired |
| telegram | Create Task, Add Task, Save Task | `create_task` | super_admin, admin, bna_admin, operator, system | Create an internal Operations task from typed inputs or natural language. | wired |
| calendar | Archive Event, Delete Event | `delete_calendar_event` | super_admin, admin, bna_admin, operator, system | Archive an internal calendar event. Destructive external deletes require approval. | wired |
| communications | Draft Email, Create Email Draft | `draft_email` | super_admin, admin, bna_admin, operator, system | Create a safe email draft without sending it. | wired |
| telegram | Draft Email, Create Email Draft | `draft_email` | super_admin, admin, bna_admin, operator, system | Create a safe email draft without sending it. | wired |
| content | Draft Email, Email This | `draft_email_from_newsletter` | super_admin, admin, bna_admin, operator, system | Create an email draft using an approved or draft newsletter body. | wired |
| communications | Draft Email, Email This | `draft_email_from_newsletter` | super_admin, admin, bna_admin, operator, system | Create an email draft using an approved or draft newsletter body. | wired |
| telegram | Draft Email, Email This | `draft_email_from_newsletter` | super_admin, admin, bna_admin, operator, system | Create an email draft using an approved or draft newsletter body. | wired |
| parent_helper | Draft Message | `draft_message_to_admin` | parent, super_admin, admin, bna_admin, operator, system | Draft a parent-visible message to staff without exposing private internals. | wired |
| messages_help | Draft Message | `draft_message_to_admin` | parent, super_admin, admin, bna_admin, operator, system | Draft a parent-visible message to staff without exposing private internals. | wired |
| communications | Draft WhatsApp, Create WhatsApp Draft | `draft_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Create a WhatsApp draft for BNA or provider communications without sending it. | wired |
| content | Draft WhatsApp, Create WhatsApp Draft | `draft_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Create a WhatsApp draft for BNA or provider communications without sending it. | wired |
| parent_detail | Draft WhatsApp, Create WhatsApp Draft | `draft_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Create a WhatsApp draft for BNA or provider communications without sending it. | wired |
| provider_workspace | Draft WhatsApp, Create WhatsApp Draft | `draft_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Create a WhatsApp draft for BNA or provider communications without sending it. | wired |
| telegram | Draft WhatsApp, Create WhatsApp Draft | `draft_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Create a WhatsApp draft for BNA or provider communications without sending it. | wired |
| student_portal | Explain | `explain_assignment` | student, bna_admin, admin, super_admin, system | Explain a student-visible assignment without admin-only notes. | wired |
| student_helper | Explain | `explain_assignment` | student, bna_admin, admin, super_admin, system | Explain a student-visible assignment without admin-only notes. | wired |
| content | Latest Newsletter, Open Draft | `find_latest_newsletter_draft` | super_admin, admin, bna_admin, operator, system | Find the newest saved weekly newsletter draft. | wired |
| communications | Latest Newsletter, Open Draft | `find_latest_newsletter_draft` | super_admin, admin, bna_admin, operator, system | Find the newest saved weekly newsletter draft. | wired |
| telegram | Latest Newsletter, Open Draft | `find_latest_newsletter_draft` | super_admin, admin, bna_admin, operator, system | Find the newest saved weekly newsletter draft. | wired |
| content | Make Social Posts | `generate_social_posts_from_newsletter` | super_admin, admin, bna_admin, operator, system | Generate social copy drafts without publishing. | wired |
| communications | Make Social Posts | `generate_social_posts_from_newsletter` | super_admin, admin, bna_admin, operator, system | Generate social copy drafts without publishing. | wired |
| parent_detail | Generate Weekly Update, Parent Update | `generate_weekly_update` | super_admin, admin, bna_admin, operator, system | Generate a parent-visible weekly update draft from permitted student context. | wired |
| student_detail | Generate Weekly Update, Parent Update | `generate_weekly_update` | super_admin, admin, bna_admin, operator, system | Generate a parent-visible weekly update draft from permitted student context. | wired |
| content | Generate Weekly Update, Parent Update | `generate_weekly_update` | super_admin, admin, bna_admin, operator, system | Generate a parent-visible weekly update draft from permitted student context. | wired |
| telegram | Generate Weekly Update, Parent Update | `generate_weekly_update` | super_admin, admin, bna_admin, operator, system | Generate a parent-visible weekly update draft from permitted student context. | wired |
| content | Draft WhatsApp | `generate_whatsapp_from_newsletter` | super_admin, admin, bna_admin, operator, system | Generate a WhatsApp draft from a newsletter without sending it. | wired |
| communications | Draft WhatsApp | `generate_whatsapp_from_newsletter` | super_admin, admin, bna_admin, operator, system | Generate a WhatsApp draft from a newsletter without sending it. | wired |
| telegram | Draft WhatsApp | `generate_whatsapp_from_newsletter` | super_admin, admin, bna_admin, operator, system | Generate a WhatsApp draft from a newsletter without sending it. | wired |
| communications | Generate WhatsApp Link, Open WhatsApp | `generate_whatsapp_link` | super_admin, admin, bna_admin, operator, system | Create a prefilled wa.me link without using the WhatsApp API. | wired |
| contacts | Generate WhatsApp Link, Open WhatsApp | `generate_whatsapp_link` | super_admin, admin, bna_admin, operator, system | Create a prefilled wa.me link without using the WhatsApp API. | wired |
| settings | Generate WhatsApp Link, Open WhatsApp | `generate_whatsapp_link` | super_admin, admin, bna_admin, operator, system | Create a prefilled wa.me link without using the WhatsApp API. | wired |
| telegram | Generate WhatsApp Link, Open WhatsApp | `generate_whatsapp_link` | super_admin, admin, bna_admin, operator, system | Create a prefilled wa.me link without using the WhatsApp API. | wired |
| communications | Log WhatsApp, Add Timeline Note | `log_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Record a WhatsApp communication in the contact timeline without sending anything. | wired |
| contacts | Log WhatsApp, Add Timeline Note | `log_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Record a WhatsApp communication in the contact timeline without sending anything. | wired |
| telegram | Log WhatsApp, Add Timeline Note | `log_whatsapp_message` | super_admin, admin, bna_admin, operator, system | Record a WhatsApp communication in the contact timeline without sending anything. | wired |
| calendar | Admin Only | `mark_event_admin_only` | super_admin, admin, bna_admin, operator, system | Restrict an event to internal/admin visibility. | wired |
| calendar | Parent Visible | `mark_event_parent_visible` | super_admin, admin, bna_admin, operator, system | Make an event visible to parents after admin review. | wired |
| calendar | Student Visible | `mark_event_student_visible` | super_admin, admin, bna_admin, operator, system | Make an event visible to the assigned student after admin review. | wired |
| contacts | Move Lead, Payment Pending | `move_lead_stage` | super_admin, admin, bna_admin, operator, system | Move a lead or pipeline card to a typed stage such as Payment Pending. | wired |
| pipelines | Move Lead, Payment Pending | `move_lead_stage` | super_admin, admin, bna_admin, operator, system | Move a lead or pipeline card to a typed stage such as Payment Pending. | wired |
| telegram | Move Lead, Payment Pending | `move_lead_stage` | super_admin, admin, bna_admin, operator, system | Move a lead or pipeline card to a typed stage such as Payment Pending. | wired |
| calendar | Open Event | `open_calendar_event` | super_admin, admin, bna_admin, operator, system, parent, student, provider_admin, participant | Return a direct route to a calendar event detail. | wired |
| content | Open in UI | `open_content_item_url` | super_admin, admin, bna_admin, operator, system | Return a URL to a content item. | wired |
| communications | Pause Email | `pause_scheduled_email` | super_admin, admin, bna_admin, operator, system | Pause a scheduled email send. | wired |
| provider_workspace | Prepare Access Request | `prepare_rabbi_sheller_access_request` | super_admin, admin, operator, system | Prepare a safe checklist/message for access to Rabbi Sheller’s external class/member system. | wired |
| settings | Prepare Access Request | `prepare_rabbi_sheller_access_request` | super_admin, admin, operator, system | Prepare a safe checklist/message for access to Rabbi Sheller’s external class/member system. | wired |
| telegram | Prepare Access Request | `prepare_rabbi_sheller_access_request` | super_admin, admin, operator, system | Prepare a safe checklist/message for access to Rabbi Sheller’s external class/member system. | wired |
| parent_detail | Publish to Parent Portal | `publish_weekly_update_to_parent_portal` | super_admin, admin, bna_admin, operator, system | Mark an approved weekly update as parent-visible. | wired |
| student_detail | Publish to Parent Portal | `publish_weekly_update_to_parent_portal` | super_admin, admin, bna_admin, operator, system | Mark an approved weekly update as parent-visible. | wired |
| content | Publish to Parent Portal | `publish_weekly_update_to_parent_portal` | super_admin, admin, bna_admin, operator, system | Mark an approved weekly update as parent-visible. | wired |
| communications | Refine Email | `refine_email` | super_admin, admin, bna_admin, operator, system | Refine an email draft without sending it. | wired |
| telegram | Refine Email | `refine_email` | super_admin, admin, bna_admin, operator, system | Refine an email draft without sending it. | wired |
| content | Refine Newsletter, Save Revision | `refine_newsletter_draft` | super_admin, admin, bna_admin, operator, system | Refine a saved newsletter draft and save a revision when a draft exists. | wired |
| communications | Refine Newsletter, Save Revision | `refine_newsletter_draft` | super_admin, admin, bna_admin, operator, system | Refine a saved newsletter draft and save a revision when a draft exists. | wired |
| telegram | Refine Newsletter, Save Revision | `refine_newsletter_draft` | super_admin, admin, bna_admin, operator, system | Refine a saved newsletter draft and save a revision when a draft exists. | wired |
| content | Save Revision | `save_newsletter_revision` | super_admin, admin, bna_admin, operator, system | Save a revised newsletter body as a new content output revision. | wired |
| communications | Schedule Email | `schedule_email` | super_admin, admin, bna_admin, operator, system | Schedule an email only after approval and connector readiness. | wired |
| contacts | WhatsApp Login Link | `send_parent_login_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare the parent portal login WhatsApp copy; live send remains approval-gated. | wired |
| parent_detail | WhatsApp Login Link | `send_parent_login_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare the parent portal login WhatsApp copy; live send remains approval-gated. | wired |
| parent_portal | WhatsApp Login Link | `send_parent_login_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare the parent portal login WhatsApp copy; live send remains approval-gated. | wired |
| telegram | WhatsApp Login Link | `send_parent_login_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare the parent portal login WhatsApp copy; live send remains approval-gated. | wired |
| communications | Send Test Email | `send_test_email` | super_admin, admin, bna_admin, operator, system | Send a test email only when approved and email connector is configured. | wired |
| settings | Send Test Email | `send_test_email` | super_admin, admin, bna_admin, operator, system | Send a test email only when approved and email connector is configured. | wired |
| parent_detail | Send Weekly Update | `send_weekly_update_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare or send an approved parent weekly update by WhatsApp. | wired |
| communications | Send Weekly Update | `send_weekly_update_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare or send an approved parent weekly update by WhatsApp. | wired |
| telegram | Send Weekly Update | `send_weekly_update_whatsapp` | super_admin, admin, bna_admin, operator, system | Prepare or send an approved parent weekly update by WhatsApp. | wired |
| communications | Send Group WhatsApp | `send_whatsapp_to_group` | super_admin, admin, bna_admin, operator, system | Prepare an approved WhatsApp group/broadcast send through the connector. | wired |
| telegram | Send Group WhatsApp | `send_whatsapp_to_group` | super_admin, admin, bna_admin, operator, system | Prepare an approved WhatsApp group/broadcast send through the connector. | wired |
| communications | Send WhatsApp, Send via WAPI | `send_whatsapp_via_wapi` | super_admin, admin, bna_admin, operator, system | Send an approved WhatsApp message through the WAPI connector. | wired |
| contacts | Send WhatsApp, Send via WAPI | `send_whatsapp_via_wapi` | super_admin, admin, bna_admin, operator, system | Send an approved WhatsApp message through the WAPI connector. | wired |
| telegram | Send WhatsApp, Send via WAPI | `send_whatsapp_via_wapi` | super_admin, admin, bna_admin, operator, system | Send an approved WhatsApp message through the WAPI connector. | wired |
| student_portal | Assignments | `show_assignments` | super_admin, admin, bna_admin, operator, system, parent, student | Show student-visible assignments only. | wired |
| parent_portal | Assignments | `show_assignments` | super_admin, admin, bna_admin, operator, system, parent, student | Show student-visible assignments only. | wired |
| parent_portal | Calendar, Show Calendar | `show_child_calendar` | parent, super_admin, admin, bna_admin, operator, system | Show parent-visible child calendar events only. | wired |
| parent_helper | Calendar, Show Calendar | `show_child_calendar` | parent, super_admin, admin, bna_admin, operator, system | Show parent-visible child calendar events only. | wired |
| student_portal | Today Plan, Ask BNA Helper | `show_today_plan` | student, bna_admin, admin, super_admin, system | Show a student-safe today plan. | wired |
| student_helper | Today Plan, Ask BNA Helper | `show_today_plan` | student, bna_admin, admin, super_admin, system | Show a student-safe today plan. | wired |
| operations_shell | Summarize Page | `summarize_current_page` | super_admin, admin, bna_admin, operator, system | Summarize the current Operations page for the Super Admin assistant without exposing prompts. | wired |
| ui_bot | Summarize Page | `summarize_current_page` | super_admin, admin, bna_admin, operator, system | Summarize the current Operations page for the Super Admin assistant without exposing prompts. | wired |
| settings | Sync Google Calendar | `sync_google_calendar` | super_admin, admin, bna_admin, operator, system | Run Google Calendar sync only after explicit approval and connector readiness. | wired |
| calendar | Sync Google Calendar | `sync_google_calendar` | super_admin, admin, bna_admin, operator, system | Run Google Calendar sync only after explicit approval and connector readiness. | wired |
| settings | Sync Google Classroom | `sync_google_classroom` | super_admin, admin, bna_admin, operator, system | Run Google Classroom sync only after explicit approval and connector readiness. | wired |
| assignments | Sync Google Classroom | `sync_google_classroom` | super_admin, admin, bna_admin, operator, system | Run Google Classroom sync only after explicit approval and connector readiness. | wired |
| calendar | Edit Event | `update_calendar_event` | super_admin, admin, bna_admin, operator, system | Update an internal calendar event. | wired |
| provider_workspace | Save Provider, Publish Provider | `update_provider_profile` | super_admin, admin, operator, provider_admin, system | Update provider program/profile draft data. | wired |
| provider_index | Save Provider, Publish Provider | `update_provider_profile` | super_admin, admin, operator, provider_admin, system | Update provider program/profile draft data. | wired |
| tasks | Move Task, Mark Done, Archive | `update_task_stage` | super_admin, admin, bna_admin, operator, system | Move a task to another Operations stage. | wired |
| task_detail | Move Task, Mark Done, Archive | `update_task_stage` | super_admin, admin, bna_admin, operator, system | Move a task to another Operations stage. | wired |
| telegram | Move Task, Mark Done, Archive | `update_task_stage` | super_admin, admin, bna_admin, operator, system | Move a task to another Operations stage. | wired |
| communications | View Email Log | `view_email_log` | super_admin, admin, bna_admin, operator, system | Read recent email log entries. | wired |
| settings | View Email Log | `view_email_log` | super_admin, admin, bna_admin, operator, system | Read recent email log entries. | wired |
| parent_portal | Visible Notes | `view_parent_visible_notes` | parent, super_admin, admin, bna_admin, operator, system | Read only notes explicitly marked parent-visible. | wired |
| parent_helper | Visible Notes | `view_parent_visible_notes` | parent, super_admin, admin, bna_admin, operator, system | Read only notes explicitly marked parent-visible. | wired |
| communications | View WhatsApp Thread | `view_whatsapp_thread` | super_admin, admin, bna_admin, operator, system | Load recent WhatsApp timeline entries for a contact or student. | wired |
| contacts | View WhatsApp Thread | `view_whatsapp_thread` | super_admin, admin, bna_admin, operator, system | Load recent WhatsApp timeline entries for a contact or student. | wired |
| telegram | View WhatsApp Thread | `view_whatsapp_thread` | super_admin, admin, bna_admin, operator, system | Load recent WhatsApp timeline entries for a contact or student. | wired |
