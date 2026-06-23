# BNA Helper Tool Audit

Date: 2026-06-14

Latest deployment note: `show_contact_communication_history` is deployed on
Railway deployment `fcdf52fe-f623-47c5-8029-194eb68d7cb6` and live-smoked at
`ops/live-smokes/2026-06-15T04-08-37-882Z-contact-history-helper-live-smoke.md`.
It is read-only/dry-run for helper and Telegram history previews.

## Current Tool Sources

- Shared action registry: `src/lib/actions/registry.js`
- Action runner and audit log: `src/lib/actions/runner.js`
- Operations preview/execute endpoints:
  - `/api/bna/actions/run`
  - `/api/bna/bot-actions/preview`
  - `/api/bna/bot-actions/execute`
- Task action endpoints:
  - `/api/bna/tasks/:id/actions/mark-done`
  - `/api/bna/tasks/:id/actions/mark-pending`
  - `/api/bna/tasks/:id/actions/needs-more-info`
  - `/api/bna/tasks/:id/actions/choose-decision`
- Public/portal assistant: `public/js/bna-bot-widget.js` plus server assistant
  handlers.

## Role-Scoped Helper Rule

There should be one helper everywhere, not separate unrelated assistants. The
helper changes scope by actor and page:

- Public BNA helper: public content, lead capture, tickets.
- Parent helper: that parent and their children only.
- Student helper: authenticated student only.
- Provider helper: provider workspace only.
- Rabbi helper: One Time/Rabbi content and participants only.
- Super Admin helper: full permitted BNA Operations scope.

Student names or student-specific helper labels appear only after valid auth.

## Tool Matrix

| Tool | Route/API | Roles | Scope | Dry-run | Writes | Audit | Status |
|---|---|---|---|---|---|---|---|
| Create task | `/api/bna/actions/run` / `create_task` | admin/operator | workspace | yes | yes | yes | implemented |
| Update task stage | `update_task_stage`, task endpoints | admin/operator | workspace | yes | yes | yes | implemented |
| Mark task done/not done | task endpoints | admin/operator | workspace | partial | yes | yes | implemented |
| Add task comment | `/api/bna/tasks/:id/comments` | admin/operator | task | no | yes | yes | implemented |
| Create ticket | `create_ticket`, ticket APIs | parent/student/provider/admin | scoped | yes | yes | yes | implemented |
| Process ticket | ticket PATCH endpoints | admin/support | workspace | no | local no-send notification draft/comment only | yes | implemented no-send |
| Create decision | `create_decision` | admin/manager | workspace | yes | yes | yes | implemented |
| Choose decision option | task `choose-decision` | admin | workspace | no | yes | yes | implemented |
| Add decision option | `add_decision_option` | admin/operator | task | yes | local task/comment only | yes | implemented approval-gated |
| Schedule task on date | `schedule_task_on_date` | admin/operator | task | yes | local task due/planned date only | yes | implemented approval-gated |
| Move task workspace | `move_task_workspace` | admin/operator | task/project | yes | local task project scope only | yes | implemented approval-gated |
| Add contact note | `/contact-communications` | admin/operator | contact | no | yes | partial | implemented |
| Match Telegram note to WhatsApp CRM row | `/api/bna/contact-communications/match-note`, `/crm_note` | admin/operator | contact | yes | local note only | partial | implemented no-send |
| Update contact tag | contact/person routes | admin/operator | contact | partial | yes | partial | partial |
| Approve parent announcement | `/api/bna/parent-announcements` | admin/operator | workspace | yes | local selected update only | partial | implemented no-send |
| Create/update provider | provider APIs, `update_provider_profile` | admin/provider | provider | yes | yes | yes | partial |
| Submit provider onboarding | `/api/provider-onboarding`, `/api/provider-onboarding/intake` | public/admin | public/provider | no | yes | yes | implemented |
| Submit parent/accountability lead | `/api/parent-accountability/onboarding` | public/parent/admin | BNA lead | no | yes | yes | implemented |
| Search contacts | contact/people APIs | admin | workspace | yes | no | partial | partial |
| Show communications history | `show_contact_communication_history`, communication APIs | admin | contact | yes | no sends/sync/external writes | yes | implemented read-only |
| Task-title cleanup dry-run | `npm run task:title-cleanup` | admin/operator | tasks | yes | no by default | report | implemented local CLI |
| Rabbi task-flow audit | `npm run task:rabbi-flow-audit` | admin/operator | Rabbi/One Time tasks | yes | no | report | implemented read-only local CLI |
| Retitle one task naturally | `retitle_task_naturally`, `/api/bna/actions/run` | admin/operator | tasks | yes | approval-gated local task title update | yes | implemented |
| WAPI phonebook grouping report | `/api/bna/wapi/phonebook-report`, `npm run wapi:phonebook-report` | admin | account-wide | yes | no | no | implemented read-only |
| Apply WAPI phonebook correction | `/api/bna/wapi/phonebook-corrections` | admin | account-wide | yes | local metadata only | partial | implemented no-send |
| Create pipeline card | `/api/bna/pipeline-cards` | admin/operator | workspace | no | yes | partial | implemented |
| Move pipeline stage | pipeline PATCH | admin/operator | workspace | no | yes | partial | implemented |
| Preview social schedule package | `preview_social_schedule_package` | admin/operator | BNA/provider workspace | yes | no Buffer draft, media upload, publish, send, local content write, or external write | yes | implemented preview-only |
| Create email draft | `draft_email` | admin/operator | workspace | yes | draft only | yes | implemented |
| Show automation/drip prompt | Operations Settings > Automations | admin | workspace | yes | no | yes | implemented read-only library |
| Generate weekly parent update | `draft_weekly_update` | admin/operator | BNA/provider | yes | draft only | yes | implemented |
| Calendar dry-run | `create_calendar_event`, `sync_google_calendar` | admin/operator | workspace | yes | guarded | yes | implemented |
| Calendar batch launch plan preview | `calendar_batch_launch_plan_preview` | admin/operator | One Time provider workspace | yes | no internal or Google Calendar writes | yes | implemented preview-only |
| Classroom dry-run | assignment Google preview, `sync_google_classroom` | admin/operator | BNA | yes | guarded | yes | implemented |
| Classroom topic/material preview | `classroom_topic_material_preview` | admin/operator | BNA/provider | yes | no Classroom read/write, internal write, send, or live Google API call | yes | implemented preview-only |
| Drive search/import dry-run | `google_drive_find_file_preview`, `google_drive_create_doc_preview`, `google_drive_create_folder_preview`, `google_drive_move_file_preview` | admin/operator | workspace | yes | no external writes | yes | implemented preview-only |
| Google live-adapter approval packet | Operations Settings > Google Workspace | admin/operator | Google connectors | yes | no | no | implemented readiness-only |
| Google approval decision preview | `create_decision` dry-run from Google approval packet | admin/operator | Google connectors | yes | local audit preview only | yes | implemented no-task/no-write |
| Open/switch workspace | Operations routing | admin/operator | allowed workspaces | yes | no | no | implemented |
| Explain role/scope | helper prompt/context | all roles | actor scope | yes | no | no | partial |
| Provider GBP link capture | `capture_provider_google_business_link` | admin/provider | provider | yes | internal fields only | yes | implemented manual-only |
| Google Business Place ID lookup preview | `google_business_place_id_lookup` | admin/provider | provider/workspace | yes | no Maps/GBP API read, no external write | yes | implemented preview-only |
| Google Business locations preview | `google_business_list_locations_preview` | admin/provider | provider/workspace | yes | no GBP locations read, no external write | yes | implemented preview-only |
| Rabbi Mishnah class lead capture | `/api/one-time/mishnah/onboarding` | public/admin | One Time provider workspace | yes | local review records only | partial | implemented no-send |
| Create One Time video library item | `create_one_time_video_library_item` | admin/operator | One Time provider workspace | yes | local content job plus internal review outputs only | yes | implemented no-send/no-publish |
| One Time publishing approval packet | Operations Content > One Time Library | admin/operator | One Time provider workspace | yes | no | no | implemented readiness-only |
| One Time publishing decision preview | `create_decision` dry-run from One Time approval packet | admin/operator | One Time provider workspace | yes | local audit preview only | yes | implemented no-task/no-write |
| One Time publish package preview | `preview_one_time_member_library_publish_package` | admin/operator | One Time provider workspace | yes | local action-audit preview only; no publish, send, visibility, checkout/access, Drive/video-host, Buffer/social, or external CRM write | yes | implemented preview-only |
| Create Rabbi shiur idea | `create_rabbi_shiur_idea` | admin/operator | One Time provider workspace | yes | local review task only | yes | implemented approval-gated |
| Create Rabbi source-sheet task | `create_rabbi_source_sheet_task` | admin/operator | One Time provider workspace | yes | local review task only | yes | implemented approval-gated |
| Create referral ledger entry | `create_referral_ledger_entry` | admin/operator | One Time provider workspace | yes | local referral candidate, ledger note, review task only | yes | implemented no-send/no-reward |
| Submit student question for moderation | `submit_student_question_for_moderation` | admin/operator | One Time provider workspace | yes | private local review task only | yes | implemented no-forum/no-send |
| Review moderated question | `review_moderated_question` | admin/operator | One Time provider workspace | yes | private local task/comment update only | yes | implemented no-publish/no-send |
| One Time question moderation queue | `GET /api/bna/one-time/question-moderation`, Operations Content > One Time Library | admin/operator | One Time provider workspace | yes | read-only private review queue only | no | implemented no-send/no-forum/no-member-visible |

## Prompt / Knowledge Guardrails

- Do not invent school policies.
- BNA is currently centered on the 10-1 program.
- If a policy is not in verified BNA content, offer to ask Shloimie.
- Public allergy/medical policy questions are now intercepted before hosted AI
  with `public_policy_boundary`: the assistant says there is no verified BNA
  policy in the current public content and offers to ask Shloimie.
- Hosted assistant prompts now carry an explicit source boundary: public BNA
  content, role-scoped portal/workspace context, and server action results
  only. Do not fill gaps from generic school-policy knowledge.
- Processing a ticket by moving it to `resolved` or `closed` creates only a
  first-party `bna_contact_communications` no-send draft plus an internal
  ticket comment. It does not automatically send email, WhatsApp, SMS,
  Telegram, portal messages, or external CRM writes.
- Approval-readiness packets are not execution. The Google packet requires
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` before any later test-user live Google
  adapter smoke, and the One Time publishing packet requires
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` before any later member-library
  publishing connector work. The packets themselves perform no external
  writes, sends, checkout/access, member visibility, or connector publishing.
- `Preview Decision Draft` buttons inside approval packets are also not
  execution. They call `create_decision` with `dry_run: true`, may write only a
  local action-audit preview row, and must prove `executed: false` plus
  `preview.decision_created: false`; they must not create Shloimie decision
  tasks or perform connector/publishing/sending writes.
- One Time question moderation is private review only. `Private Question
  Moderation Queue` and `GET /api/bna/one-time/question-moderation` must not
  create forum posts, member-visible answers, sends, Codex jobs, checkout/
  access grants, Drive/video-host writes, or external CRM writes.
- Operations Settings > Automations is a read-only Automation Library and
  Prompt Browser. Its preview buttons explain dry-run paths only; they must not
  run external sends, publish content, change billing/access/member visibility,
  write Google/Drive/video hosts, create checkout/access grants, or write
  external CRM systems.
- Keep private student/accountability data out of public, provider, and Rabbi
  contexts.
- The helper no longer reads saved student access codes from localStorage.
- Public mobile helper UX now follows the goal-mode brief: phone-width public
  pages use a partial bottom sheet rather than a full-screen takeover, the
  launcher remains reachable to minimize the sheet, and public copy uses the
  current 10-1 program language without the old "I'm still here" nudge.

## High-Value Missing Actions

1. Drive live execution adapter after scope approval
2. Live Google Business Profile location/review adapter after provider OAuth approval

## Next Steps

- Keep wiring new UI/helper buttons through registered action IDs only.
- Add action-registry artifact regeneration after each new action group.
- Add tests that parent/student/provider/Rabbi roles cannot see another scope.
- Use `npm run task:title-cleanup` before any bulk task retitle pass; only use
  apply mode with `--apply --confirm APPLY_TASK_TITLE_CLEANUP`.
- Use `npm run task:rabbi-flow-audit` before Rabbi/One Time task-flow cleanup.
  It has no apply mode, redacts private BNA title-preview terms, and must not
  move, close, retitle, reassign, publish, send, grant access, or write
  external systems from the report alone.
- Use `retitle_task_naturally` for one-off task title cleanup through the helper;
  it still requires typed approval before writing.
- Use `add_decision_option`, `schedule_task_on_date`, and
  `move_task_workspace` for decision/task organization through the helper; they
  remain approval-gated and must not create agent jobs or connector writes.
- Use `create_one_time_video_library_item` for One Time/Rabbi video-library
  review intake; it creates internal draft states only and does not publish or
  send.
- Use `create_rabbi_shiur_idea` and `create_rabbi_source_sheet_task` for
  One Time/Rabbi content planning; they create local review tasks only and do
  not start Codex, publish, send, or write external systems.
- Use `create_referral_ledger_entry` for One Time referral review intake; it
  creates local first-party referral candidate/ledger/review records only and
  does not send asks, mint referral links, create rewards, or write external
  systems.
- Use `submit_student_question_for_moderation` and
  `review_moderated_question` for private One Time question moderation; they
  create or update private review tasks/comments and
  `bna_one_time_question_reviews` rows only. Review the queue from Operations
  Content > One Time Library or
  `GET /api/bna/one-time/question-moderation`; it must not publish forum
  posts, send responses, expose identities, change member visibility, or start
  Codex automatically.
- Use the deployed approval-readiness packets before the remaining live lanes:
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` for Google live adapter testing and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` for One Time member-library
  publishing.
- Use `preview_one_time_member_library_publish_package` to inspect One Time
  member-library package fields and blockers for a content job before any
  connector work. It is preview-only and must not publish, send, change member
  visibility, grant checkout/access, write Drive/video hosts, create
  Buffer/social/email/WhatsApp sends, or write external CRM.
- Use `preview_social_schedule_package` for Buffer/social scheduling requests
  such as "Schedule this Facebook post", "Make 3 posts from this video", or
  "one post per day this week". It previews channels, schedule slots, blockers,
  and the `APPROVE_BUFFER_SOCIAL_DRAFT` phrase only; it must not create Buffer
  drafts, upload media, publish, send, write local content records, or write
  external systems.
- Use Operations Settings > Drive / Social Intake `One Time App Readiness` and
  `GET /api/bna/one-time/app-access-readiness` to inspect external One Time
  app/admin/member-library blockers. It is read-only and must not reset admin
  passwords, grant member access, publish, write Drive/video hosts, send
  email/WhatsApp/SMS, create checkout/billing writes, or write external CRM.
- Use `calendar_batch_launch_plan_preview` for One Time/Rabbi 8-week launch
  calendar planning. It previews only, requires a reviewed start date before
  any real event creation path, and must not write internal or Google Calendar
  events.
- Use `classroom_topic_material_preview` for Google Classroom
  course/topic/material planning. It previews only, requires a reviewed course,
  topic ID or approved topic-create policy, and Google Classroom OAuth before
  any live Classroom read/write path.
- Use `google_business_place_id_lookup` and
  `google_business_list_locations_preview` for Google Business/Profile preview
  planning. They do not call Maps or GBP APIs; live location/review adapters
  remain blocked until provider opt-in, `business.manage`, OAuth/API approval,
  and explicit external-read/write confirmation.
- Use Operations Settings > Automations to review workflow triggers, channels,
  prompt/template families, linked records, and approval status before building
  or enabling any live automation. It is a map, not an execution surface.
- Use `show_contact_communication_history` for helper/Telegram requests to
  preview local contact history by lead/signup/student ID, normalized phone,
  email, contact name, or WAPI source context. It reads local
  `bna_contact_communications` only and must not sync Whapi, send WhatsApp,
  create broadcasts, update contact/lead tags, send email, or write external
  CRM systems.
