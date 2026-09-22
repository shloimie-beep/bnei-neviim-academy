# Implementation Selected

Date: 2026-06-11

Source package:
- Drive folder: https://drive.google.com/drive/folders/1J5SdQZKtfJcdd9UX37m4aWZxSBk9OXm0
- Local mirrored audit package used: `ops/ux-audit-runs/2026-06-11-click-map/`

Audit files used:
- `manifest.json`
- `issues.csv`
- `actions.csv`
- `routes.csv`
- `flows.csv`
- `top-findings.md`
- `implementation-backlog.md`
- `navigation-map.md`
- `role-workspace-matrix.md`
- `context-clarity-failures.md`
- `button-action-audit.md`
- `mobile-audit.md`

Selected implementation scope for this pass:
- Replace the visible Operations IA contract with a role-aware SaaS shell contract while preserving existing static APIs.
- Convert `Internal Dialogue` from top-level navigation into `Communications > Internal Dialogue`.
- Normalize legacy provider workspace routes that point at `students` into provider-safe sections.
- Make the workspace switcher compact, grouped, searchable, and explicit about workspace type and role.
- Make provider workspace navigation say Program, Participants/Members, Leads/Pipeline, Content/Videos, Schedule, Questions/Posts, Communications, Tasks, Reporting, and Settings instead of BNA school student/accountability language.
- Add parent and student assistant entry points with explicit safe-context language on desktop and mobile.
- Add Bot Permissions settings with visible context rules and prompt/context preview restricted to admin.
- Keep internal calendar usable without Google, and expose Google Calendar/Classroom as connector settings only.
- Improve tasks with operational lanes, stale sweeper, and decision-card labels.
- Keep content details behind compact review sections and action groups instead of expanding every output inline.
- Reduce settings placeholder language by rendering real rows, disabled controls, and connector status helpers.
- Update tests and QA report to reflect the new IA.

Known audit-driven blockers not fully implemented in this pass:
- Live parent/student authenticated demo credentials were not available in the Drive audit.
- Provider external delivery app, Vimeo/Replit access, and payment processor inspection remain connector/backend follow-up work.
- FullCalendar is not added as a dependency in this static pass; the calendar remains an internal list/agenda UI with connector settings.
