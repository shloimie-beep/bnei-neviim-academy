# One Time External User Portal And Ticketing

Captured: 2026-06-10

## Status

First-pass implementation shipped and deployed on 2026-06-10. This file remains
as the handoff for remaining One Time external-user follow-up, not as the source
of truth for already-completed portal/ticketing work.

Drive was rechecked on 2026-06-10 with `npm run drive:setup-one-time`.
The canonical separate Drive workspace already exists:

- `My Drive / One Time Mishnah Class - Rabbi Elie Scheller`
- `https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`

The canonical final proposal copy is filed in:

- `00 Start Here - Proposal and Project Map`
- `https://docs.google.com/document/d/1fOqY1fgje49rD9gW9xWmW2RZ3hRQ8Whq/edit`

The original upload remains preserved separately:

- `https://docs.google.com/document/d/1ZHr8ZNg6q_YDTvg4vG-T3jdK0P6GrPIn/edit`

The June 9 proposal draft is archived under `90 Completed and Approved /
Historical Drafts`:

- `https://docs.google.com/document/d/1egcDUVYcP5oAW4-h-JWfF1vhZmUzul7N/edit`

The superseded generic Start Here copy was also archived:

- `https://docs.google.com/document/d/1TfOILYcMgPytKFI0d0IxuuIvFXySUcS8/edit`

## Operator Intent

Rabbi Elie Scheller should become the first external user/account in the BNA
system, under Shloimie as super admin.

This is not just a parent portal. The system needs a broader `Users` concept:

- Shloimie: super admin across BNA and One Time.
- Rabbi Elie Scheller: external user/account owner for One Time.
- BNA parents/students: BNA school records.
- One Time parents/students: Rabbi Elie's own scoped customer/student records.

Rabbi Elie needs a scoped copy of the useful BNA task-management workflow:

- task manager
- task comments
- natural-language parser for updating task state
- watchdog-style monitoring and stale/broken-work detection
- Telegram bot/API access
- support ticket reporting for broken system behavior

He should not see BNA-only fields or private BNA areas.

## Current System Reality

Already implemented:

- Project-scoped `BNA` and `One Time Mishnah Class` tasks.
- One Time categories, assignments, comments, and Decision Required support.
- Scoped One Time login path for project task APIs.
- First-pass `one_time_admin` external workspace for Rabbi Elie with allowed
  views: Tasks, Students, Content, Contacts, Accounting, Support, Roadmap.
- Project ownership columns/backfill for shared record tables used by One Time
  parents/students/content/accounting/accountability records.
- Project-scoped One Time parent lead, student, task, task comment, support
  ticket, content, payment, and roadmap APIs.
- Support ticket storage, comments, status/severity/category fields, and
  automatic Codex task handoff for high/blocking or bot/task/automation tickets.
- Operations Support and Roadmap views.
- Final proposal roadmap/workflow task seeding from the June 10 full-workflow
  proposal.
- Rabbi Telegram bridge profile:
  `npm run telegram:rabbi`.
- Rabbi scoped Telegram support-ticket capture for `/ticket`, `support:`, and
  clear broken-system language.
- Rabbi agent context under `agents/rabbi-elie-scheller/`.
- Railway has `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER` and
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`.
- Railway and local `.env.local` now have generated `ONE_TIME_OPS_USERNAME` and
  `ONE_TIME_OPS_PASSWORD`. The local copy is saved in
  `.secrets/one-time-ops-credentials.txt`.
- Canonical One Time Drive workspace and project docs exist.

Known blockers:

- Missing `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`.
- 2026-06-10 Telegram `getUpdates` showed a `/start` update from Shlomo/chat
  `8202155026`; that is an operator test update, not a confirmed Rabbi Elie
  chat ID.
- No hosted bridge worker/runtime yet for `npm run telegram:rabbi`.
- Rabbi bridge startup now intentionally fails if no allowed chat ID is set, so
  the bot cannot run open to all chats that know the token.
- Broader super-admin Users/account management UI is still a follow-up; first
  pass uses the scoped Operations login/env model.

## Product Model To Build

### 1. User And Account Model

Audit current auth/session/schema first, then add the smallest durable model
that supports:

- `super_admin`: Shloimie.
- `external_user`: Rabbi Elie Scheller.
- external account/project association: One Time Mishnah Class.
- scoped parent records owned by the external user/account.
- scoped student records owned by the external user/account.
- BNA school students and parents remaining separate from One Time records.

Avoid naming every non-admin record `parent`. Use `users` or `accounts` for
actual login identities, and keep parents/students as domain records under the
right account/project.

### 2. Scoped Rabbi Dashboard

Rabbi Elie should be able to log in and see a clean One Time workspace:

- One Time tasks.
- One Time support tickets.
- One Time students.
- One Time parents.
- One Time content/source-sheet/shiur prep items where relevant.
- No BNA private Students, Accounting, Devices, parent accountability, or
  operator-only Changelog unless explicitly granted later.

The UI can reuse BNA components where possible, but labels and fields should be
scoped to Rabbi Elie's use case, not BNA school operations.

### 3. Task Manager Clone, Scoped Not Duplicated

Do not create a second task system if project scoping can handle it. Reuse the
existing task APIs and UI patterns with role/project filters:

- tasks
- comments
- assignees
- decision-required items
- categories
- status/stage
- natural-language task updates

One Time categories should remain:

- Marketing
- Content
- Technology
- Admin
- Accounting
- GHL Setup
- Community
- General
- Torah Class Prep
- Source Sheets
- Shiur Ideas

### 4. Support Ticket System

Add a Rabbi-facing way to report system issues. This should be separate enough
from Torah/project tasks that broken-system reports are easy for Shloimie/Codex
to triage.

Suggested first-pass ticket fields:

- title
- description
- severity: low, normal, high, blocking
- status: open, triage, in_progress, resolved, closed
- reporter user/account
- project/account
- assigned_to: Shloimie, Codex, Unassigned
- source: dashboard, Telegram, API
- related task id
- related screenshot/media, if present
- comments/history

Tickets should flow into Shloimie/Codex visibility quickly and should support a
Telegram notification when a real support ticket is created.

### 5. Natural-Language Parser And Watchdog

Rabbi Elie's bot/dashboard should have scoped parser behavior:

- explicit task creation creates One Time tasks.
- explicit system-problem reports create One Time support tickets.
- ambiguous brainstorms summarize and ask before creating tasks.
- task updates and comments should stay inside One Time.
- no BNA-only fields should be requested or shown.

Watchdog-style monitoring should exist for One Time system health:

- stale Rabbi tickets
- stale Codex-owned One Time implementation tasks
- missing bot credentials
- broken scoped login
- failed task/comment APIs

The watchdog should not expose private BNA records in Rabbi-facing output.

### 6. Telegram Bot Runtime

Finish the Rabbi bot only after these values exist:

- `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
- `ONE_TIME_OPS_USERNAME`
- `ONE_TIME_OPS_PASSWORD`

Then choose runtime:

- preferred: separate Railway worker for `npm run telegram:rabbi`
- local Windows service only for browser/GHL work that needs local Chrome
- API-only planning is acceptable until credentials/runtime are decided

After setup, smoke:

- `/status` from Rabbi's chat
- scoped task list
- create a test One Time task
- add a task comment
- create a test support ticket
- confirm Students/Accounting/Devices/BNA private APIs are blocked

### 7. API Access

Rabbi Elie can use the same underlying API style as the current Telegram bot,
but with scoped credentials and route guards.

Minimum API contract:

- list/create/update One Time tasks
- add/list One Time task comments
- list/create/update One Time support tickets
- list/create/update One Time parents
- list/create/update One Time students
- no access to BNA private endpoints by default

### 8. GHL And Business System Boundaries

GHL work must still follow the One Time agent-loop rules:

- observe current state first
- API first
- browser only for UI-only gaps
- explicit approval before writes
- smoke one workflow at a time

The proposal expects reporting for leads, customers, revenue, expenses, ad
performance, churn, support tickets, and partner distributions.

## Acceptance Criteria

- Shloimie can log in as super admin and manage Rabbi Elie's external account.
- Rabbi Elie can log in with his own scoped credentials.
- Rabbi sees only One Time records.
- Rabbi has separate parents and students from BNA.
- Rabbi can create/update One Time tasks through dashboard and Telegram.
- Rabbi can open support tickets for broken system behavior.
- Shloimie/Codex can see and resolve Rabbi support tickets.
- Natural-language parser routes Rabbi task updates and support reports to the
  correct scoped objects.
- Scoped tests prove Rabbi access cannot read BNA Students, Accounting, Devices,
  or operator-only data.
- App-visible changes are deployed, Railway doctor passes, and live smoke
  verifies scoped login, task, comment, student/parent, ticket, and bot behavior.

## 2026-06-10 Verification

- `node --check server.js`
- `node --check scripts/setup-one-time-partnership-drive.mjs`
- `node --check scripts/telegram-kimi-bridge.mjs`
- `node --test tests/one-time-external-user-portal.test.js` passed 8/8.
- `npm test` passed 166/166.
- `npm run drive:setup-one-time` placed the final June 10 proposal copy in
  Start Here and archived the older copies.
- Railway variables now include One Time scoped username/password; Rabbi chat ID
  remains missing.
- `npm run telegram:rabbi` locally now fails on the intended missing chat-ID
  guard, after reading the scoped credentials.
- Railway deployment `226ab9dd-42ff-4012-89fb-a4d0b3126a8f` reached SUCCESS.
- Standard live smoke passed:
  `ops/live-smokes/2026-06-10T05-47-59-136Z-live-app-smoke.md`.
- Focused One Time live smoke passed:
  `ops/live-smokes/2026-06-10T05-51-13-997Z-one-time-scoped-smoke.json`.

## Remaining Implementation Order

1. Confirm Rabbi Elie's real Telegram chat ID and set
   `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` on Railway/local env.
2. Choose and start the hosted Rabbi bridge runtime for `npm run telegram:rabbi`.
3. Smoke `/status`, One Time task creation, task comment, and support ticket
   creation from Rabbi's real chat.
4. Build broader super-admin Users/account management UI for future external
   users.
5. Expand watchdog/SLA reporting around stale One Time tickets and scoped bot
   runtime health.
