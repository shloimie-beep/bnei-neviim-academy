# W1 Baseline

Worker: W1
Requirement: REQ-20260619-401
Branch: `parallel/20260619-core`
Worktree: `C:\Users\User\BNA-worktrees\20260619-core`
Checkpoint: `b2fd5039990ee1cb370a49d4475a7763fb8548b7`

## Coordinator Inputs

- `C:\Users\User\BNA v2.0\ops\parallel-runs\PARALLEL-20260619-001\COORDINATION.json`
- `C:\Users\User\BNA v2.0\ops\parallel-runs\PARALLEL-20260619-001\CONTRACTS.md`
- `C:\Users\User\BNA v2.0\ops\parallel-runs\PARALLEL-20260619-001\FILE-OWNERSHIP.md`
- `C:\Users\User\BNA v2.0\ops\parallel-runs\PARALLEL-20260619-001\REQUIREMENTS.md`
- `C:\Users\User\BNA v2.0\ops\parallel-runs\PARALLEL-20260619-001\DECISIONS-AND-EXTERNAL-GATES.md`
- `C:\Users\User\BNA v2.0\ops\execution-runs\2026-06-19-parallel-platform-finish\NEXT-SESSION.md`

The shared coordinator docs were present in the main checkout and not in the
checkpointed worker worktree. Product edits stayed inside W1-owned paths in
the assigned worktree.

## Current Code Inspected

- `server.js` schema blocks for projects, project members, people, workspace
  memberships, workspaces, workspace settings, tasks, community, courses,
  students, service providers, gamification, calendar, and agent/task surfaces.
- `src/lib/bna/one-time-role-model.js`
- `src/lib/bna/community-moderation.js`
- `src/lib/bna/gamification.js`
- `src/lib/bna/goal-board.js`
- `src/lib/bna/person-resolution.js`
- `tests/workspace-person-household-provider-contract.test.js`
- `tests/universal-assistant-mvp.test.js`
- `tests/ws11-community-model-contract.test.js`
- `tests/workspace-rbac-negative-isolation.test.js`
- `tests/one-time-rbac-negative-isolation.test.js`

## Entity Classification

| Entity | Classification | Baseline |
| --- | --- | --- |
| `deployment instance` | new | No first-class instance table existed. |
| `organization/account` | new | Existing `bna_projects` is workspace/project, not organization/account. |
| `workspace/project` | extend/reuse | Reuse `bna_projects`, `bna_workspaces`, `bna_workspace_settings`; add canonical links. |
| `brand configuration` | new | Existing branding is partial workspace settings/project branding. |
| `membership/role` | extend/reuse | Reuse `bna_workspace_memberships`; add instance/invitation/audit contracts. |
| `module visibility` | new | Existing module flags are implicit settings/UI state. |
| `people/contact identity` | extend/reuse | Reuse `bna_people` and `bna_contacts`; add identity keys for dedupe. |
| `student profile` | extend/reuse | Reuse `bna_students`; add neutral profile table/link. |
| `guardian relationship` | extend/reuse | Existing parent/student links exist; add person-to-person relationship model. |
| `service provider profile` | extend/reuse | Reuse `bna_service_provider_profiles` and legacy `bna_service_providers`; add workspace assignments. |
| `community` | extend/reuse | Reuse `bna_learning_communities`, members, threads/messages; add groups/resources. |
| `course` | extend/reuse | Reuse `bna_courses` and enrollments; add modules, video assets, progress events. |
| `lesson` | extend/reuse | Reuse `bna_course_lessons`; add module/resource/video links. |
| `video asset` | new | Existing video processing jobs are workflow jobs, not provider-neutral asset references. |
| `goals/milestones/rewards` | extend/new | Existing Torah goals/gamification are specific; add neutral goal/reward lifecycle. |
| `tasks/Decisions/comments/calendar/source/agent links` | extend/reuse | Do not build a second task manager; add `bna_domain_record_links`. |
| `GHL/LeadConnector runtime` | do_not_build | Current source of truth forbids active GHL runtime additions. |
| `server.js` shared route wiring | do_not_build in W1 | Prompt 05 owns shared entrypoint edits. |

## Baseline Risks

- Current code uses several overlapping workspace concepts. W1 therefore adds a
  compatibility layer rather than replacing tables.
- Existing tests inspect `server.js` text directly. W1 does not edit that file,
  so shared wiring must be verified by Prompt 05.
- Production database execution and live smoke are external gates.
