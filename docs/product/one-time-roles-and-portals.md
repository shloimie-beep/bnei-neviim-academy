# One Time Roles And Portals

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Visible Human Roles

The One Time product model exposes only these human roles:

- `admin_owner`
- `service_provider`
- `parent`
- `student`

There is no visible generic `teacher` or `staff` role in the One Time product
model. Older/internal compatibility aliases may still exist in code so legacy
routes keep working, but they must map into the four visible roles.

## Membership

- Rabbi Elie Scheller: service provider and workspace owner
- Shloimie: admin/owner with full management access
- Parents: linked children and approved workspace information only
- Students: own portal, classes, coursework, progress, and approved community
  information only

## Portal Contracts

Service-provider / owner portal:

- class and course management
- students and parents in the One Time workspace
- attendance and exact minutes
- course/video/resource drafts
- approved announcements
- milestones, achievements, and rewards
- integration readiness
- class/course prompt editing

Parent portal:

- linked child only
- attendance and exact minutes
- progress percentage and course progress
- approved achievements, milestones, reward status, summaries, announcements,
  reminders, and transactional messages
- no other student and no private provider/admin notes

Student portal:

- own live class schedule
- own attendance/minutes and progress
- own lessons, videos, worksheets, achievements, milestones, and enabled reward
  progress
- announcements and role-scoped assistant
- no other student private information

Admin portal:

- all One Time workspace data
- audit/configuration/user/module/branding management
- prompt-version review
- visible/safe impersonation only if implemented
- no hidden cross-tenant leakage

## Prompt Hierarchy

Prompt/context order:

1. `platform_safety_system`
2. `instance_workspace`
3. `role`
4. `class_course`
5. `individual_user_student`
6. `current_session_source_context`

Prompt changes must be versioned and auditable. Parent and student assistants
must use only authorized data, and no other student's records may enter a
student or parent prompt.

Code contract: `buildOneTimeRoleContract()`, `buildOneTimePortalContracts()`,
and `buildOneTimePromptHierarchy()` in `src/platform/instances/one-time.js`.
