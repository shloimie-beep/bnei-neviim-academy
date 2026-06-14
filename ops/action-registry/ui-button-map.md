# Action Registry UI Button Map

Generated from `src/lib/actions/registry.js`.

## create_task
- Label: Create task
- Category: tasks
- Page contexts: tasks, dashboard, internal_dialogue, telegram
- Buttons: Create Task, Add Task, Save Task
- Approval required: no

## create_ticket
- Label: Create ticket
- Category: communications
- Page contexts: support_tickets, parent_helper, provider_workspace, telegram, bot
- Buttons: Create Ticket, Report Issue
- Approval required: no

## create_decision
- Label: Create decision
- Category: tasks
- Page contexts: tasks, decisions, telegram, bot
- Buttons: Create Decision, Needs Decision
- Approval required: no

## update_task_stage
- Label: Update task stage
- Category: tasks
- Page contexts: tasks, task_detail, telegram
- Buttons: Move Task, Mark Done, Archive
- Approval required: no

## add_timeline_note
- Label: Add timeline note
- Category: communications
- Page contexts: internal_dialogue, task_detail, student_detail, provider_detail
- Buttons: Add Note, Save Note
- Approval required: no

## find_latest_newsletter_draft
- Label: Find latest newsletter draft
- Category: newsletter
- Page contexts: content, communications, telegram
- Buttons: Latest Newsletter, Open Draft
- Approval required: no

## refine_newsletter_draft
- Label: Refine newsletter draft
- Category: newsletter
- Page contexts: content, communications, telegram
- Buttons: Refine Newsletter, Save Revision
- Approval required: no

## save_newsletter_revision
- Label: Save newsletter revision
- Category: newsletter
- Page contexts: content
- Buttons: Save Revision
- Approval required: no

## approve_newsletter
- Label: Approve newsletter
- Category: newsletter
- Page contexts: content, communications
- Buttons: Approve Newsletter
- Approval required: yes

## draft_weekly_update
- Label: Draft weekly update
- Category: newsletter
- Page contexts: content, communications, parent_portal, telegram, bot
- Buttons: Draft Weekly Update
- Approval required: no

## select_weekly_update_hero
- Label: Select weekly update hero
- Category: newsletter
- Page contexts: content, parent_portal, communications, bot
- Buttons: Select Hero Update
- Approval required: yes

## draft_email_from_newsletter
- Label: Draft email from newsletter
- Category: email
- Page contexts: content, communications, telegram
- Buttons: Draft Email, Email This
- Approval required: no

## draft_email
- Label: Draft email
- Category: email
- Page contexts: communications, telegram
- Buttons: Draft Email, Create Email Draft
- Approval required: no

## refine_email
- Label: Refine email
- Category: email
- Page contexts: communications, telegram
- Buttons: Refine Email
- Approval required: no

## approve_email
- Label: Approve email
- Category: email
- Page contexts: communications
- Buttons: Approve Email
- Approval required: yes

## schedule_email
- Label: Schedule email
- Category: email
- Page contexts: communications
- Buttons: Schedule Email
- Approval required: yes

## send_test_email
- Label: Send test email
- Category: email
- Page contexts: communications, settings
- Buttons: Send Test Email
- Approval required: yes

## pause_scheduled_email
- Label: Pause scheduled email
- Category: email
- Page contexts: communications
- Buttons: Pause Email
- Approval required: yes

## view_email_log
- Label: View email log
- Category: email
- Page contexts: communications, settings
- Buttons: View Email Log
- Approval required: no

## create_calendar_event
- Label: Create calendar event
- Category: calendar
- Page contexts: calendar, student_portal, parent_portal, telegram
- Buttons: New Event, Create Event
- Approval required: no

## update_calendar_event
- Label: Update calendar event
- Category: calendar
- Page contexts: calendar
- Buttons: Edit Event
- Approval required: no

## delete_calendar_event
- Label: Archive calendar event
- Category: calendar
- Page contexts: calendar
- Buttons: Archive Event, Delete Event
- Approval required: yes

## create_student_schedule_item
- Label: Create student schedule item
- Category: student
- Page contexts: student_detail, student_portal, calendar
- Buttons: Add Student Event
- Approval required: no

## create_parent_visible_event
- Label: Create parent-visible event
- Category: parent
- Page contexts: parent_portal, student_detail, calendar
- Buttons: Add Parent Event
- Approval required: no

## create_provider_class_session
- Label: Create provider class session
- Category: provider
- Page contexts: provider_workspace, provider_participant, calendar
- Buttons: New Class Session
- Approval required: no

## sync_google_calendar
- Label: Sync Google Calendar
- Category: calendar
- Page contexts: settings, calendar
- Buttons: Sync Google Calendar
- Approval required: yes

## sync_google_classroom
- Label: Sync Google Classroom
- Category: calendar
- Page contexts: settings, assignments
- Buttons: Sync Google Classroom
- Approval required: yes

## google_drive_find_file_preview
- Label: Preview Drive file search
- Category: content
- Page contexts: settings, content, provider_workspace, telegram, bot
- Buttons: Preview Drive Search, Find Drive File
- Approval required: no

## google_drive_create_doc_preview
- Label: Preview Drive Doc creation
- Category: content
- Page contexts: settings, content, calendar, telegram, bot
- Buttons: Preview Doc Create, Create Google Doc Preview
- Approval required: yes

## google_drive_create_folder_preview
- Label: Preview Drive folder creation
- Category: content
- Page contexts: settings, content, provider_workspace, telegram, bot
- Buttons: Preview Folder Create, Create Provider Folder Preview
- Approval required: yes

## google_drive_move_file_preview
- Label: Preview Drive file move
- Category: content
- Page contexts: settings, content, provider_workspace, telegram, bot
- Buttons: Preview Drive Move, Put File In Folder Preview
- Approval required: yes

## open_calendar_event
- Label: Open calendar event
- Category: calendar
- Page contexts: calendar
- Buttons: Open Event
- Approval required: no

## mark_event_parent_visible
- Label: Mark event parent-visible
- Category: calendar
- Page contexts: calendar
- Buttons: Parent Visible
- Approval required: yes

## mark_event_student_visible
- Label: Mark event student-visible
- Category: calendar
- Page contexts: calendar
- Buttons: Student Visible
- Approval required: yes

## mark_event_admin_only
- Label: Mark event admin-only
- Category: calendar
- Page contexts: calendar
- Buttons: Admin Only
- Approval required: no

## generate_whatsapp_from_newsletter
- Label: Generate WhatsApp from newsletter
- Category: whatsapp
- Page contexts: content, communications, telegram
- Buttons: Draft WhatsApp
- Approval required: no

## generate_social_posts_from_newsletter
- Label: Generate social posts from newsletter
- Category: social
- Page contexts: content, communications
- Buttons: Make Social Posts
- Approval required: no

## open_content_item_url
- Label: Open content item
- Category: content
- Page contexts: content
- Buttons: Open in UI
- Approval required: no

## show_today_plan
- Label: Show today plan
- Category: student
- Page contexts: student_portal, student_helper
- Buttons: Today Plan, Ask BNA Helper
- Approval required: no

## show_assignments
- Label: Show assignments
- Category: student
- Page contexts: student_portal, parent_portal
- Buttons: Assignments
- Approval required: no

## generate_student_worksheet
- Label: Generate student worksheet
- Category: student
- Page contexts: student_detail, assignments, student_helper, parent_helper, bot
- Buttons: Generate Worksheet, Regenerate Worksheet
- Approval required: no

## explain_assignment
- Label: Explain assignment
- Category: student
- Page contexts: student_portal, student_helper
- Buttons: Explain
- Approval required: no

## create_help_request
- Label: Create help request
- Category: communications
- Page contexts: student_helper, parent_helper, messages_help
- Buttons: Ask for help, Ask BNA Helper, Parent Help
- Approval required: no

## create_report_problem_ticket
- Label: Create report-problem ticket
- Category: communications
- Page contexts: parent_portal, student_portal, parent_helper, messages_help, support_tickets
- Buttons: Report problem, Send feedback, Report a bug, Report a suggestion
- Approval required: no

## show_child_calendar
- Label: Show child calendar
- Category: parent
- Page contexts: parent_portal, parent_helper
- Buttons: Calendar, Show Calendar
- Approval required: no

## draft_message_to_admin
- Label: Draft message to admin
- Category: parent
- Page contexts: parent_helper, messages_help
- Buttons: Draft Message
- Approval required: no

## draft_parent_response
- Label: Draft parent response
- Category: parent
- Page contexts: parent_helper, communications, telegram, bot
- Buttons: Draft Parent Response
- Approval required: no

## view_parent_visible_notes
- Label: View parent-visible notes
- Category: parent
- Page contexts: parent_portal, parent_helper
- Buttons: Visible Notes
- Approval required: no

## create_provider_question_post
- Label: Create provider question/post
- Category: provider
- Page contexts: provider_participant, provider_workspace
- Buttons: Post Question, Save Post
- Approval required: no

## post_community_message
- Label: Post community message
- Category: communications
- Page contexts: community, communications, provider_workspace, telegram, bot
- Buttons: Post Community Message
- Approval required: no

## request_provider_contact
- Label: Request provider contact
- Category: provider
- Page contexts: parent_portal, provider_index, parent_helper, bot
- Buttons: Request Provider Contact
- Approval required: no

## update_provider_profile
- Label: Update provider profile
- Category: provider
- Page contexts: provider_workspace, provider_index
- Buttons: Save Provider, Publish Provider
- Approval required: yes

## capture_provider_google_business_link
- Label: Capture provider Google Business link
- Category: provider
- Page contexts: provider_workspace, provider_index, settings, google_workspace, bot, telegram
- Buttons: Capture Google Business Link, Save Google Profile Link, Store Place ID
- Approval required: yes

## move_lead_stage
- Label: Move lead stage
- Category: communications
- Page contexts: contacts, pipelines, telegram
- Buttons: Move Lead, Payment Pending
- Approval required: no

## queue_telegram_report
- Label: Queue Telegram report
- Category: communications
- Page contexts: telegram, admin, bot
- Buttons: Queue Telegram Report
- Approval required: yes

## route_bug_to_codex
- Label: Route bug to Codex
- Category: system
- Page contexts: support_tickets, admin, bot, telegram
- Buttons: Route To Codex
- Approval required: yes
