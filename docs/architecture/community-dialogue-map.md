# Community Dialogue Map

All dialogue paths are first-party BNA records unless a later connector is
explicitly approved. External sends are approval-gated and audited.

## Paths

| Path | Initiator | Allowed recipients | Visibility | Private data excluded | Storage | Notification path | Approval needed | Bot involvement | Audit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Super Admin to School Admin/Rabbi | super_admin | school_admin, rabbi, school_manager | platform/admin | secrets unless explicitly needed | `bna_internal_threads/messages`, tickets/tasks | Telegram/email/manual after approval | yes for external send | super-admin bot can draft/route | action log/task ledger |
| School Admin/Rabbi to School Managers | rabbi/admin | school_manager, staff | school admin | unrelated provider/student private data | internal threads/tasks | portal/Operations/email draft | external send only | school admin bot drafts | action log |
| School Admin/Rabbi to Parents | rabbi/admin | scoped parents | parent-facing | admin-only analysis, other students, technical notes | weekly updates, community messages, parent notes | parent portal/email/WhatsApp draft | yes for sends | draft parent update | action log |
| School Admin/Rabbi to Students | rabbi/admin | scoped students | student-facing | parent private notes, internal analysis | assignments, worksheets, student messages | student portal | yes for external send | worksheet/student bot | action log |
| Parent to School Admin/Rabbi | parent | school admin/support | parent/support | other students, admin-only systems | support ticket, parent note, community thread | portal/Operations | no for internal record | parent bot can create ticket | action log |
| Parent to Service Provider Request Thread | parent | approved provider/admin | parent/provider scoped | private BNA student notes, other providers | provider messages/requests | provider portal/admin notification draft | yes for external send | request_provider_contact | action log |
| Service Provider to Provider Manager | provider_admin | provider_manager/staff | provider workspace | BNA private student data | provider workspace messages/tasks | provider portal | no internal, yes external | provider bot drafts | action log |
| Service Provider to School Admin/Rabbi | provider_admin/manager | school admin/rabbi | provider-school scoped | unrelated students/providers | support ticket, community thread, provider message | Operations/provider portal | external sends only | provider bot can create ticket | action log |
| Service Provider to Parent Request Status | provider_admin/manager | requesting parent/admin | request scoped | other parent requests, BNA internal notes | provider messages | provider/parent portal, email draft | yes for external send | provider bot drafts | action log |
| Student to Student Bot | student | student bot | student-only | parent/admin private notes, other students | assistant thread/messages | student portal | no external send | explain assignment, goals | bot action log |
| Parent to Parent Bot | parent | parent bot | parent/own child | admin-only analysis, other students, technical logs | assistant thread/messages | parent portal | no external send | answer, ticket, request provider | bot action log |
| Provider to Provider Bot | provider_admin/manager | provider bot | provider-only | BNA private student data, other providers | assistant thread/messages | provider portal | no external send | listing/update/request help | bot action log |
| Bot to Ticket | any permitted role | support/admin | scoped by actor role | secrets and private context outside role | `bna_support_tickets` | Operations | no for internal record | `create_ticket` | action log |
| Bot to Decision | admin/school manager/support | Shloimie's Decisions | admin | private data summarized only as needed | `bna_tasks` with `needs_decision` | Operations | no for internal record | `create_decision` | action log |
| Bot to Codex/Claude | super/admin/operator/technical | technical queue | internal technical | secrets, parent/student private data unless needed and approved | task/ticket | Codex/agent queue | yes when risky | `route_bug_to_codex` | action log/changelog |
| Newsletter to Parent Dashboard Hero | admin | scoped parents | parent-facing | private notes, task/deploy chatter, payment internals | `bna_weekly_updates` | parent portal | approval/select hero | `draft_weekly_update`, `select_weekly_update_hero` | action log |
| Provider Newsletter to Subscribed Audience | provider/admin | subscribed provider/community audience | provider/community | other providers, unrelated students | weekly/provider update records | provider/parent/student portals | approval/select audience | provider bot drafts | action log |
| Learning Community Thread | rabbi/admin/manager/member as allowed | community members | community scoped | admin-only/private notes | `bna_community_threads/messages` | portal/internal notification | external send only | `post_community_message` | action log |

## Privacy Defaults

- Parent-facing content may include only parent-safe student context and the
  latest approved updates relevant to the parent's child.
- Student-facing content may include assignments, goals, allowed messages, and
  student-safe feedback only.
- Provider-facing content may include provider profile/listing state, own
  requests, linked communities, and provider updates only.
- Admin-only psychoanalysis/internal analysis never appears in parent, student,
  provider, public, newsletter, or bot outputs.
- Codex/deploy/task chatter never appears in public, parent, student, or
  provider newsletters.

## Notification Rule

Creating a first-party record is safe when role checks pass. Sending through
email, WhatsApp, Telegram, Buffer, payment links, provider-owned apps, or any
other external connector requires the relevant approval gate and smoke-tested
connector configuration.
