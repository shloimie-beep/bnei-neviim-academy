# Workspace, Community, Provider Role Map

## Actors

- Super Admin: Shloimie/platform owner.
- Platform Manager: delegated platform operator.
- Support Admin: support and ticket triage.
- Technical Agent: Codex/Claude/system agent for approved technical work.
- School Rabbi/Rebbe/Admin: BNA school owner/admin.
- School Manager: delegated school manager.
- Staff: school staff.
- Service Provider Admin: owns a provider listing/workspace.
- Service Provider Manager: delegated provider manager.
- Parent: parent portal user.
- Student: student portal user.

## Workspaces

- Platform: all-workspace control layer.
- BNA Academy / School: school parents, students, staff, learning communities,
  assignments, newsletters, approved providers, and school bot context.
- Service Provider: provider profile, provider managers, provider updates,
  provider requests, and external CTA.
- Rabbi Sheller / One Time: first provider workspace, separated from BNA Academy
  unless explicit cross-enrollment exists.

## Canonical Role Names

The live database still accepts older compatibility values in some columns, so
canonical roles are attached through identity and membership metadata before
the role-column migration is safe.

| Canonical role | Compatibility values | Scope |
| --- | --- | --- |
| `platform_super_admin` | `super_admin`, platform `owner` | All workspaces; only role that can permanently remove One Time workspace users. |
| `workspace_owner` | `project_owner`, `owner`, `rabbi` | Own provider workspace; Rabbi Elie Scheller for One Time. |
| `workspace_admin` | `one_time_admin`, `admin`, `project admin` | Own provider workspace; delegated admin. |
| `workspace_manager` | `project_manager`, `manager`, `project admin` | Own provider workspace; Shloimie scoped One Time manager login. |
| `provider_staff` | `service_provider`, `teacher`, `provider_staff` | Assigned provider/class records only. |
| `parent` | `parent` | Linked child and approved One Time parent/member records only. |
| `student` | `student`, `child` | Own enrollment/student-safe records only. |

For One Time, `src/lib/bna/one-time-role-model.js` is the current role contract:
Rabbi Elie Scheller is `workspace_owner` for
`rabbi_sheller_provider` / `one_time_mishnah_class`; Shloimie has the platform
`platform_super_admin` identity and the scoped One Time manager/admin
compatibility role. Live invite, deactivate, remove, and role-change writes
remain approval-gated; the implemented contract and UI preview are no-write
readback until persistence is explicitly approved.

## Object Matrix

Legend: V=view, C=create, E=edit, A=archive/delete, M=message, P=approve,
X=export, B=trigger bot action.

| Actor | Workspace | Learning Community | Provider Listing | Provider Workspace | Parent Portal | Student Portal | Weekly/Provider Update | Bot Prompt | Ticket | Decision | Worksheet/Assignment | Private Student Note | Admin-only Internal Analysis |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Super Admin | V C E A X B | V C E A M P X B | V C E A P X B | V C E A M P X B | V E X B | V E X B | V C E A P X B | V C E A P X B | V C E A M P X B | V C E A P X B | V C E A P X B | V C E A X | V C E A X |
| Platform Manager | V C E X B | V C E M P X B | V C E P X B | V C E M P X B | V E X B | V E X B | V C E P X B | V C E P B | V C E M P X B | V C E P B | V C E P B | V E X | V E X |
| Support Admin | V E B | V M B | V E M B | V M B | V B | V B | V B | V B | V C E M X B | C M B | V B | no default | no default |
| Technical Agent | V B | V B | V B | V B | no default | no default | no default | V B | V C E B | V C E B | no default | no default | no default |
| School Rabbi/Rebbe/Admin | V E B | V C E A M P X B | V E M P B | V M B | V E M B | V E M B | V C E A P B | V C E P B | V C E M B | V C B | V C E A P B | V C E A | V C E A |
| School Manager | V E B | V C E M P B | V E M P B | V M B | V E M B | V E M B | V C E P B | V E B | V C E M B | V C B | V C E P B | V C E | V E |
| Staff | V B | V M B | V B | no default | V M B | V M B | V C B | V B | V C M B | C B | V C E B | V C E | no default unless delegated |
| Service Provider Admin | V own B | V linked M B | V E own B | V C E M B | no default | no default | V C E own B | V E own B | V C M own B | C own B | no default | no default | no default |
| Service Provider Manager | V own B | V linked M B | V E own B | V E M B | no default | no default | V C E own B | V own B | V C M own B | C own B | no default | no default | no default |
| Parent | V own B | V linked M B | V approved linked B | no default | V own M B | V own-child safe B | V approved audience B | no default | V C M own B | C own B | V C own-child B | parent-safe only | no default |
| Student | V own B | V linked M B | V approved linked B | no default | no default | V own M B | V approved audience B | no default | C own B | no default | V own B | no default | no default |

## Server-Side Checks

- Super/admin roles are the only roles allowed to create or approve learning
  communities.
- School rabbi/admin/school manager can link providers into learning
  communities.
- Parents/students can view only providers approved for their scoped community
  or public approved listings.
- Provider admins/managers can edit only their provider profile/workspace and
  must not receive private BNA student data by default.
- Parent and student bot context excludes admin-only notes, internal analysis,
  other students, technical logs, and Codex/deploy context.
- Technical routing to Codex is restricted to super/admin/operator/technical
  roles and requires approval for risky actions.

## Current Implementation Anchors

- Roles/actions: `src/lib/actions/types.js`, `src/lib/actions/registry.js`,
  `src/lib/actions/permissions.js`
- Action execution/audit: `src/lib/actions/runner.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/actions/audit-log.js`
- Core app tables/APIs: `server.js`
- Public/portal UI: `public/`
