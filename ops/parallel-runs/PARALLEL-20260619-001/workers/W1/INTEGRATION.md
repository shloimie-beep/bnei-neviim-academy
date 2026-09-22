# W1 Integration Notes

Shared entrypoints were not edited by W1. Prompt 05 should review and apply the
following integration patch ideas after merging worker branches.

## Server Startup

Suggested shared-file change in `server.js`:

```js
const createPlatformCoreSQL = fs.readFileSync(
  path.join(__dirname, 'migrations', 'parallel-20260619-core-001-platform-core.sql'),
  'utf8'
);
```

In `initDb()` and `/api/bna/migrate-db`, run after existing workspace/person
compatibility tables exist and before course/community route usage:

```js
await pool.query(createPlatformCoreSQL);
```

## Module Imports

Suggested import:

```js
const platform = require('./src/platform');
```

Build a local request context adapter rather than duplicating RBAC logic:

```js
function platformContextFromRequest(req, workspaceRow, memberships = []) {
  return platform.core.buildPlatformContext({
    instance: workspaceRow?.instance || { id: 'bna-platform', slug: 'bna-platform' },
    organization: workspaceRow?.organization || { id: 'bna', slug: 'bna' },
    workspace: workspaceRow || { id: 'bna', workspace_key: 'bna', project_key: 'bna' },
    actor: {
      id: req.opsIdentity?.username || req.session?.user || 'operations',
      person_id: req.opsIdentity?.person_id || '',
      role: req.opsIdentity?.role || 'workspace_admin',
      global_super_admin: req.opsIdentity?.scope?.type === 'all',
    },
    memberships,
  });
}
```

## Suggested Routes

All routes should use `requireAdmin`, current session checks, and
`assertWorkspaceAccess` before building the platform context.

| Method | Route | Permission | Service call | Audit event |
| --- | --- | --- | --- | --- |
| GET | `/api/platform/context` | `workspace:read` | `rbac.listVisibleModules` | `workspace.context.read` |
| POST | `/api/platform/workspaces` | `workspace:manage` | context + DB insert using migration tables | `workspace.created` |
| POST | `/api/platform/members` | `member:invite` | `domain.buildPersonUpsertPlan` | `membership.changed` |
| POST | `/api/platform/communities` | `community:create` | `community.createCommunity` | `community.created` |
| POST | `/api/platform/communities/:id/groups` | `community:create` | `community.createCommunityGroup` | `community_group.created` |
| POST | `/api/platform/courses` | `course:create` | `courses.createCourse` | `course.created` |
| POST | `/api/platform/courses/:id/modules` | `course:create` | `courses.createCourseModule` | `course_module.created` |
| POST | `/api/platform/modules/:id/lessons` | `course:create` | `courses.createLesson` | `lesson.created` |
| POST | `/api/platform/lessons/:id/videos` | `course:create` | `courses.createVideoAssetReference`, `courses.attachVideoToLesson` | `lesson.video.attached` |
| POST | `/api/platform/courses/:id/enrollments` | `course:create` | `courses.enrollMember` | `course.enrollment.changed` |
| POST | `/api/platform/enrollments/:id/progress` | `course:progress:write` or own-progress | `courses.recordProgress` | `course.progress.recorded` |
| POST | `/api/platform/goals` | `reward:manage` | `rewards.createGoal` | `goal.created` |
| POST | `/api/platform/rewards` | `reward:manage` | `rewards.createRewardCatalogItem` | `reward.created` |
| POST | `/api/platform/reward-assignments/:id/award` | `reward:manage` | `rewards.awardReward` | `reward.awarded` |
| POST | `/api/platform/domain-links` | `domain:link` | `domain.buildDomainRecordLink` | `domain.link.created` |

## Request / Response Contract

Requests should include:

```json
{
  "workspace_id": "workspace-bna",
  "idempotency_key": "optional-stable-key",
  "payload": {}
}
```

Responses should preserve W1 result shape:

```json
{
  "success": true,
  "result": {},
  "error": null
}
```

On failure:

```json
{
  "success": false,
  "error": {
    "code": "permission_denied",
    "message": "permission_denied: workspace scope mismatch",
    "details": {}
  }
}
```

## Tests Prompt 05 Should Add

- Route-level negative tests for anonymous access.
- Route-level negative tests for cross-workspace read/mutation.
- Route-level negative tests for One Time trying to enumerate BNA/family data.
- Route-level negative tests for verifier assigned-run scope.
- Migration boot test proving `createPlatformCoreSQL` runs after current
  workspace/person compatibility SQL.
- Route/action registry coverage for any new UI action that calls these routes.

## External Gates

No DNS, Railway, production deployment, production DB migration, live OAuth,
real Vimeo upload, live Zoom mutation, live Resend send, credential copy, push,
or PR was performed by W1.
