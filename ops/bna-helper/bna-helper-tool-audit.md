# BNA Helper Tool Audit

Date: 2026-06-14

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
| Process ticket | ticket PATCH endpoints | admin/support | workspace | no | yes | partial | implemented |
| Create decision | `create_decision` | admin/manager | workspace | yes | yes | yes | implemented |
| Choose decision option | task `choose-decision` | admin | workspace | no | yes | yes | implemented |
| Add contact note | `/contact-communications` | admin/operator | contact | no | yes | partial | implemented |
| Match Telegram note to WhatsApp CRM row | `/api/bna/contact-communications/match-note`, `/crm_note` | admin/operator | contact | yes | local note only | partial | implemented no-send |
| Update contact tag | contact/person routes | admin/operator | contact | partial | yes | partial | partial |
| Approve parent announcement | `/api/bna/parent-announcements` | admin/operator | workspace | yes | local selected update only | partial | implemented no-send |
| Create/update provider | provider APIs, `update_provider_profile` | admin/provider | provider | yes | yes | yes | partial |
| Submit provider onboarding | `/api/provider-onboarding`, `/api/provider-onboarding/intake` | public/admin | public/provider | no | yes | yes | implemented |
| Submit parent/accountability lead | `/api/parent-accountability/onboarding` | public/parent/admin | BNA lead | no | yes | yes | implemented |
| Search contacts | contact/people APIs | admin | workspace | yes | no | partial | partial |
| Show communications history | communication APIs | admin | contact | yes | no | partial | partial |
| Task-title cleanup dry-run | `npm run task:title-cleanup` | admin/operator | tasks | yes | no by default | report | implemented local CLI |
| WAPI phonebook grouping report | `/api/bna/wapi/phonebook-report`, `npm run wapi:phonebook-report` | admin | account-wide | yes | no | no | implemented read-only |
| Apply WAPI phonebook correction | `/api/bna/wapi/phonebook-corrections` | admin | account-wide | yes | local metadata only | partial | implemented no-send |
| Create pipeline card | `/api/bna/pipeline-cards` | admin/operator | workspace | no | yes | partial | implemented |
| Move pipeline stage | pipeline PATCH | admin/operator | workspace | no | yes | partial | implemented |
| Schedule social draft | content/social actions | admin/operator | workspace | yes | draft only | yes | partial |
| Create email draft | `draft_email` | admin/operator | workspace | yes | draft only | yes | implemented |
| Show automation/drip prompt | content prompts/settings | admin | workspace | yes | no | partial | partial |
| Generate weekly parent update | `draft_weekly_update` | admin/operator | BNA/provider | yes | draft only | yes | implemented |
| Calendar dry-run | `create_calendar_event`, `sync_google_calendar` | admin/operator | workspace | yes | guarded | yes | implemented |
| Classroom dry-run | assignment Google preview, `sync_google_classroom` | admin/operator | BNA | yes | guarded | yes | implemented |
| Drive search/import dry-run | `google_drive_find_file_preview`, `google_drive_create_doc_preview`, `google_drive_create_folder_preview`, `google_drive_move_file_preview` | admin/operator | workspace | yes | no external writes | yes | implemented preview-only |
| Open/switch workspace | Operations routing | admin/operator | allowed workspaces | yes | no | no | implemented |
| Explain role/scope | helper prompt/context | all roles | actor scope | yes | no | no | partial |
| Provider GBP link capture | `capture_provider_google_business_link` | admin/provider | provider | yes | internal fields only | yes | implemented manual-only |
| Rabbi Mishnah class lead capture | preview/intake | public/admin | provider | planned | yes | partial | partial |

## Prompt / Knowledge Guardrails

- Do not invent school policies.
- BNA is currently centered on the 10-1 program.
- If a policy is not in verified BNA content, offer to ask Shloimie.
- Keep private student/accountability data out of public, provider, and Rabbi
  contexts.
- The helper no longer reads saved student access codes from localStorage.

## High-Value Missing Actions

1. `retitle_task_naturally` helper action; local dry-run audit now exists via
   `npm run task:title-cleanup`, but a typed helper action is still missing.
2. `add_decision_option`
3. `schedule_task_on_date`
4. `move_task_workspace`
5. `create_rabbi_shiur_idea`
6. `create_rabbi_source_sheet_task`
7. `create_one_time_video_library_item`
8. `create_referral_ledger_entry`
9. `submit_student_question_for_moderation`
10. `review_moderated_question`
11. Drive live execution adapter after scope approval
12. Live Google Business Profile location/review adapter after provider OAuth approval

## Next Steps

- Add the missing actions in the registry first, then wire UI/helper buttons to
  registered action IDs only.
- Add action-registry artifact regeneration after each new action group.
- Add tests that parent/student/provider/Rabbi roles cannot see another scope.
- Use `npm run task:title-cleanup` before any bulk task retitle pass; only use
  apply mode with `--apply --confirm APPLY_TASK_TITLE_CLEANUP`.
