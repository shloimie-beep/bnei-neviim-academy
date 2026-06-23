# BNA Helper / Action Registry Matrix - 2026-06-14

Current action sources:

- UI/admin action registry: `src/lib/actions/registry.js`
- Action runner/audit: `src/lib/actions/runner.js`, `src/lib/actions/audit-log.js`
- Telegram classifier: `src/lib/bna/telegram-action-router.js`
- Portal helper preview endpoint: `/api/portal-bot/actions/preview`
- Operations helper preview/execute endpoints: `/api/bna/bot-actions/preview`, `/api/bna/bot-actions/execute`
- Operations task action endpoints: `/api/bna/tasks/:id/actions/*`

## Matrix

| Tool/action area | UI | Helper | Telegram | Roles | Dry-run | Approval | Audit | Tests |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Create task | Yes | Partial | Yes | admin/operator scoped | Yes | No for safe create | Yes | Yes |
| Update task stage | Yes | Partial | Yes | admin/operator scoped | Yes | Depends on stage | Yes | Yes |
| Mark task done | Yes | Partial | Yes | admin/operator scoped | No | No | Yes | Focused task tests |
| Reassign task | Yes | Partial | Partial | admin/operator scoped | No | No | Yes | Focused task tests |
| Add task comment | Yes | Not fully typed | Partial | admin/operator scoped | No | No | Yes | Yes |
| Create decision | Yes | Yes | Yes | admin/school manager | Yes | No | Yes | Yes |
| Choose decision option | Yes | Partial | Partial | admin/super admin | No | No | Yes | Focused task tests |
| Needs more info on decision | Yes | Planned | Planned | admin/super admin | No | No | Yes | Added in this pass |
| Route bug to Codex | UI/Helper preview | Yes | Yes | super admin/admin | Yes | Yes | Yes | Yes |
| Create support ticket | Yes | Yes | Yes | parent/provider/admin scoped | Yes | No | Yes | Yes |
| Create calendar event | Yes | Preview/typed | Yes | admin/provider scoped | Yes | No for internal | Yes | Yes |
| Update calendar event | Yes | Preview/typed | Planned | admin/provider scoped | Yes | Depends | Yes | Registry tests |
| Sync Google calendar/classroom | Preview controls | Preview | Planned | admin only | Yes | Yes | Yes | Yes |
| Draft email/newsletter | Yes | Yes | Yes | admin/operator | Yes | Yes before live send | Yes | Yes |
| Send test email | Yes | Preview/typed | Planned | admin only | Yes | Yes | Yes | Yes |
| Request provider contact | Parent/provider UI | Yes | Yes | parent/provider scoped | Yes | Yes before live send | Yes | Yes |
| Create provider class session | Yes | Preview/typed | Yes | provider admin/admin | Yes | No for draft | Yes | Yes |
| Draft parent response | Yes | Yes | Yes | parent/admin scoped | Yes | Yes before send | Yes | Yes |
| Generate worksheet | Yes | Yes | Yes | parent/admin scoped | Yes | No for draft | Yes | Yes |
| Show today/assignments/child calendar | Yes | Yes | Yes | parent/student scoped | Yes | No | Yes | Yes |
| Rabbi source-sheet task | Partial | Planned | Planned | Rabbi workspace only | Yes | No | Needs add | Open |
| Rabbi shiur idea | Partial | Planned | Planned | Rabbi workspace only | Yes | No | Needs add | Open |
| One Time video-library item | Partial | Planned | Planned | Rabbi/provider admin | Yes | Approval for publish | Needs add | Open |
| Referral ledger entry | No | Planned | Planned | admin only | Yes | Yes before credit | Needs add | Open |
| Forum question moderation | No | Planned | Planned | student/member submit, Rabbi/admin review | Yes | Human review for severe | Needs add | Open |

## Added / Fixed In This Pass

- Operations task decision buttons now call typed task endpoints for `choose-decision`, `convert-to-task`, `reassign`, `mark-done`, and `needs-more-info`.
- Added `/api/bna/tasks/:id/actions/needs-more-info` so decision cards can be held open without choosing a fake option.
- Task calendar selected-day panel now shows:
  - `Add task to this date`
  - `Move selected task to this date`
- Operations task filters now expose workspace, assignee, type, status/date, and clearer labels without "Workspace Bucket".

## Rabbi-Scoped Helper Rules

Allowed for Rabbi Scheller inside the One Time workspace:

- "This task is done."
- "This task is not done."
- "Move this to next week."
- "Assign this to Shloimie."
- "Add this as a shiur idea."
- "Make this a source-sheet task."
- "Show me what is pending for me."
- "Show me what is pending for Shloimie."

Required guard:

- These actions must resolve to Rabbi Scheller / One Time workspace unless the actor is Shloimie/super admin.
- They must not expose BNA private students, BNA parent data, family-accountability notes, or Codex implementation tasks to Rabbi's teaching flow.

## Missing Typed Actions

High-value next actions:

- `retitle_task_naturally`
- `add_decision_option`
- `mark_decision_needs_more_info`
- `move_task_workspace`
- `schedule_task_on_date`
- `create_rabbi_shiur_idea`
- `create_rabbi_source_sheet_task`
- `create_one_time_video_library_item`
- `create_referral_ledger_entry`
- `submit_student_question_for_moderation`
- `review_moderated_question`
- `award_question_points`

## Safety Gates

- Live email, WhatsApp, social posting, payment, billing credit, Google sync, external provider booking, and deployment actions require explicit approval.
- Parent/student/provider helper contexts must stay role-scoped and must not show admin-only notes, private psychoanalysis, other families, provider credentials, or internal implementation records.
- Child/student forum actions must auto-hide severe content and escalate to human review, not auto-permanently ban.
