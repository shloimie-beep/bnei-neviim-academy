# Bot Context And Ticket Routing

The BNA assistant is a role-aware chat interface over first-party records and
the shared Operations Action Registry. It is not a duplicate memory system and
not a raw unrestricted LLM endpoint.

## UI Contract

- Messages/output appear above.
- Input stays at the bottom.
- Thinking/loading state is visible while processing.
- User and assistant messages are visually distinct.
- Conversation history is stored when a portal/session supports it.
- Actions are typed, permissioned, audited, and dry-run capable when risky.

## Contexts

### Super Admin Bot

Allowed context: system state, deploy/test status, tasks, tickets, decisions,
changelog, prompt center, provider/school/workspace state, admin-only context.

Can: summarize dashboards, draft communications, create tickets/tasks/
decisions, request safe typed actions, route approved technical bugs to
Codex/Claude/system agents.

Cannot: expose secrets, bypass test/deploy gates, or run destructive work
without approval.

### School Admin / Rabbi Bot

Allowed context: school philosophy, learning communities, class topics,
students/parents in scope, attendance, assignments, weekly updates, approved
providers, parent/provider messages.

Can: draft parent updates, create community messages, generate worksheets,
triage parent/provider messages, create tickets/decisions, update newsletter
drafts.

Cannot: expose another workspace, private provider data, secrets, or raw
technical logs to non-admin users.

### Parent Bot

Allowed context: own child attendance, questions, interests, assignments,
parent-safe progress, upcoming meetings, weekly update, and approved provider/
community info.

Can: answer parent questions, explain weekly updates, summarize assignments,
request provider contact, create support tickets, draft parent-safe responses.

Cannot: expose admin-only psychoanalysis, internal staff notes, other students,
payment/admin internals unless parent-facing, technical logs, or Codex/system
context.

### Student Bot

Allowed context: own assignments, goals, questions, level, interests, motivation
style, student-safe feedback, and upcoming class tasks.

Can: explain assignments, generate student-safe worksheets, ask coaching-style
questions, and support learning without shame or comparison.

Cannot: reveal admin-only notes, parent/private staff notes, other students, or
technical/deploy tooling.

### Provider Bot

Allowed context: provider profile, services, CTA, provider workspace updates,
linked communities, own parent requests, newsletter drafts, and public listing
state.

Can: help improve listing, draft provider updates, summarize own requests,
create provider tasks/tickets, and update allowed profile fields.

Cannot: expose BNA private student data, other providers' records, or route to
Codex unless authorized by super-admin/system policy.

## Prompt Center

Operations should expose bot behavior as Bot Prompts / AI Assistant / Prompt
Center, not as a generic Settings mental model.

Admins should be able to:

- View the current prompt for a workspace/provider/school.
- Edit and save prompt versions.
- Test in dry-run.
- See context sources used.
- See allowed actions and privacy restrictions.
- Roll back prompt versions.

## Routing Rules

| User need | Route | Example | Action Registry |
| --- | --- | --- | --- |
| Broken page, login failure, deploy/database bug | Technical ticket/Codex queue | "This page is broken." | `create_ticket`, `route_bug_to_codex` |
| Product, design, policy, approval question | Shloimie's Decisions | "Should parents see this?" | `create_decision` |
| Parent question or concern | Support ticket/parent note | "I need help with my child's assignment." | `create_ticket`, `draft_parent_response` |
| Provider contact request | First-party provider request/message | "Ask this tutor to contact me." | `request_provider_contact` |
| Community update | Scoped learning community message | "Post this to the class." | `post_community_message` |
| Weekly update/newsletter | Draft/select approved update | "Make this the weekly update." | `draft_weekly_update`, `select_weekly_update_hero` |
| Worksheet/personalized support | Student-safe worksheet preview | "Generate a worksheet." | `generate_student_worksheet` |
| Telegram completion report | Approval-gated Telegram report | "Report this done to Telegram." | `queue_telegram_report` |

Normal parent/provider requests must not route to Codex. Codex/Claude routing
is only for technical/system implementation work and only from authorized
roles.

## Current Implementation

- `public/js/bna-bot-widget.js`: sliding assistant UI
- `src/lib/actions/registry.js`: typed action catalog
- `src/lib/actions/permissions.js`: role/workspace checks
- `src/lib/actions/actions/operations.js`: safe action handlers
- `src/lib/actions/runner.js`: dry-run, approval, execution, audit flow
- `server.js`: assistant/action endpoints and first-party data APIs
- `ops/action-registry/`: generated action artifacts for UI/tooling
