# Cross-Worker Contracts

These contracts freeze the minimal shared vocabulary for workers W1-W4. They
were written after inspecting the current Express/static app shape:
`server.js`, `public/operations.html`, `src/lib/bna/*`,
`src/lib/actions/*`, and the existing integration modules under
`src/lib/integrations/*`.

Workers must not introduce a second app framework. New work should use the
existing Node/Express, static frontend, `src/lib/bna/*`, script, test, and ops
artifact conventions unless Prompt 05 later performs a coordinated refactor.

## Instance And Tenancy

Stable keys:

- `instance`
- `organization`
- `workspace`
- `brand`
- `deployment_mode`
- `membership`
- `role`
- `module_visibility`

Required behavior:

- Normal clients run as WebCraft SaaS tenants.
- One Time can run as a scoped workspace now.
- One Time can later run as a separate single-tenant partner-owned instance.
- The canonical codebase stays shared.
- A split One Time instance must use separate database, domain, and secrets.
- One Time must not expose BNA private data.
- A super admin may switch only between authorized instances and workspaces.

Minimum shapes:

```js
instance = {
  id,
  slug,
  name,
  deployment_mode, // "saas_tenant" | "single_tenant_partner"
  canonical_codebase: "bna-platform",
  database_scope,
  domain_scope,
  secret_scope
}

workspace = {
  id,
  instance_id,
  organization_id,
  slug,
  brand_id,
  visibility,
  module_visibility
}

membership = {
  actor_id,
  instance_id,
  workspace_id,
  role,
  status
}
```

## Product Entities

Workers should use these entity names when naming files, docs, tests, and
integration notes:

- `member`
- `student`
- `service_provider`
- `community`
- `community_group`
- `course`
- `course_module`
- `lesson`
- `video_asset`
- `enrollment`
- `progress`
- `task`
- `decision`
- `calendar_event`
- `reward`
- `reward_assignment`
- `integration_connection`
- `agent_run`
- `intake_prompt`

## API And Module Boundaries

Workers should build normalized functions/events and record shared wiring needs
in their integration notes instead of editing `server.js` directly.

Core boundaries:

```js
resolveInstance(request)
resolveWorkspace(request)
requireWorkspaceRole(context, allowedRoles)
listVisibleModules(context)
assertWorkspaceIsolation(context, record)
```

Domain boundaries:

```js
createCommunity(context, input)
createCommunityGroup(context, input)
createCourse(context, input)
createCourseModule(context, input)
createLesson(context, input)
attachVideoToLesson(context, input)
recordProgress(context, input)
assignReward(context, input)
```

Intake and agent boundaries:

```js
createPromptIntake(context, input)
dedupePromptIntake(context, input)
routeParsedItem(context, parsedItem)
createAgentRun(context, input)
recordAgentRunEvidence(context, input)
```

Integration boundaries:

```js
getIntegrationReadiness(context, provider)
createIntegrationConnection(context, input)
prepareVimeoUpload(context, input)
prepareZoomClassSession(context, input)
prepareResendMessage(context, input)
```

Event names:

```text
instance.changed
workspace.changed
membership.changed
module.visibility.changed
community.created
course.created
lesson.video.attached
prompt_intake.created
prompt_intake.deduped
parsed_item.routed
agent_run.completed
integration.readiness.checked
```

## UI Contracts

W2 may build against view models without waiting for shared endpoint wiring.
Final binding belongs to Prompt 05.

```js
InstanceShellViewModel = {
  activeInstance,
  activeWorkspace,
  authorizedWorkspaces,
  activeRole,
  visibleModules,
  brand
}

ModuleCardViewModel = {
  key,
  label,
  status,
  visibility,
  primaryMetric,
  secondaryMetric,
  actionState
}

CourseViewModel = {
  course,
  modules,
  lessons,
  enrollments,
  progressSummary,
  videoReadiness
}

CommunityViewModel = {
  community,
  groups,
  moderationQueueSummary,
  recentActivity
}
```

UI event names:

```text
ui.instance.switch_requested
ui.workspace.switch_requested
ui.module.opened
ui.course.opened
ui.community.opened
ui.provider.opened
ui.reward.opened
ui.prompt_queue.opened
```

## Audit And Provenance

Every derived record must retain:

- source channel or source file
- source ID when available
- workspace and instance
- actor
- timestamp
- raw/provenance pointer when allowed
- idempotency key where applicable

Private raw text, secrets, credential bodies, and student-sensitive details
must not be committed. Use redacted summaries, fingerprints, and stable IDs.
