# External Access Persistence Workflow

Date: 2026-06-15

Status: dry-run preview implemented; real persistence still approval-gated and
disabled. This file does not approve, create, edit, invite, reset, email,
message, bill, publish, grant member-library access, write
Google/Drive/Buffer/WAPI, or touch Rabbi Scheller's live app.

## Purpose

Operations Admin > Users currently separates external users from parent
accounts and can create a short-lived Operations access link for an already
configured scoped username. The remaining gap is a safe persistence workflow
for creating or editing an external Operations user without mixing that user
with parent, student, provider-portal, billing, member-library, or Rabbi-owned
live-app credentials.

This packet turns the blocker into a concrete implementation target. It is not
a standing approval to add the write path.

## Current State

- The live Admin Users panel renders `Users / External Access`.
- External user cards are read from project member rows and metadata with
  `account_type: external_user`.
- The panel states that external provider/Rabbi users are not parent accounts.
- `Create external user` has a dry-run preview form in Admin > Users. It
  returns planned person, membership, compatibility project-member, access-link,
  audit, guardrail, and required-readback fields but writes no rows.
- Real external-user persistence is still disabled until the workflow is
  approved and the write path is implemented.
- Short-lived Operations access links already exist through
  `POST /api/bna/ops-access-links`, are restricted to platform admin, expire in
  20 minutes, redeem once, and do not send a message.
- Existing `POST /api/bna/people` is a generic internal person/member row
  helper. It is not the approved external-account creation workflow by itself.

## Approval Phrase

Use this exact phrase before implementing a runtime create/edit endpoint:

`APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW`

A valid approval must include the phrase plus every required field below.
Without those fields, Codex should keep the UI read-only or produce a dry-run
preview only.

## Required Fields

- Target person preferred name and legal/display name if different.
- Contact email and phone, or a clear reason no contact value should be stored.
- Workspace/project key, such as `bna` or `one_time_mishnah_class`.
- Account classification: external Operations user, BNA internal user,
  service provider workspace user, or one-time admin.
- Role and access level. Access level must be one of `owner`, `manager`,
  `member`, or `viewer`.
- Scoped Operations username, or explicit approval to create no login username.
- Allowed workspace views, if different from the existing scoped defaults.
- Whether a short-lived Operations access link should be created now. Default:
  no link.
- Delivery channel for the access link if one is approved. Default: no send.
- Reason for access and expected end date or review date.
- Rollback/revoke owner and revoke steps.
- Required readback evidence before marking implementation done.

## Future Write Shape

The runtime implementation should be one transaction with `dry_run` support:

1. Require a platform `super_admin` Operations session.
2. Require `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` for real writes.
3. Resolve the target workspace with `workspaceProjectKey` and
   `assertWorkspaceAccess`.
4. Upsert canonical `bna_people` with safe identity/contact fields only.
5. Upsert canonical `bna_workspace_memberships` for workspace, role, access
   level, active state, tags, and metadata.
6. Upsert the compatibility `bna_project_members` row while the Admin Users
   panel still reads that source. Metadata should include
   `account_type: external_user`, `project_scope`, `login_username`, approval
   provenance, and rollback owner.
7. Do not create or store a raw password.
8. Do not send email, WhatsApp, SMS, Telegram, or portal messages.
9. Do not create parent magic links, parent password resets, provider-portal
   setup tokens, member-library credentials, checkout sessions, billing rows,
   or Rabbi-owned live-app accounts.
10. Optionally create one short-lived Operations access link only when the
    approval explicitly asks for it; use the existing `bna_ops_access_links`
    path and record no-send delivery status.
11. Write an audit record with actor, target workspace, target username, dry-run
    flag, approval phrase, rollback owner, and no-external-write flags.
12. Return readback showing the person, memberships, compatibility row,
    access-link status, and every external-write flag as false.

## API Contract

Preview/target endpoint:

`POST /api/bna/admin/external-access`

Current runtime behavior:

- `dry_run:true` returns a no-write preview/readback.
- `dry_run:false` without the approval phrase is rejected.
- `dry_run:false` with the approval phrase is still rejected in the current
  deployment because the write implementation is not enabled yet.
- All current responses include `external_write_performed:false`.

Required request fields:

- `approval_phrase`
- `dry_run`
- `person`
- `workspace_key`
- `account_type`
- `role`
- `access_level`
- `login_username`
- `allowed_views`
- `create_access_link`
- `delivery_policy`
- `access_reason`
- `review_by`
- `rollback_owner`

Required response fields:

- `success`
- `dry_run`
- `external_write_performed`
- `person`
- `memberships`
- `project_member`
- `access_link`
- `audit`
- `guardrails`
- `required_readback`

## UI Contract

Admin > Users uses an in-app dry-run preview form, not browser prompts. Real
create/edit controls stay locked until the approved write implementation exists.

The form must show:

- Current workspace and account classification.
- Parent account separation warning.
- One Time app credential separation warning.
- No-send/no-billing/no-member-access guardrail.
- Dry-run preview before any real write.
- Explicit approval phrase field for real writes.
- Rollback/revoke owner.
- Readback panel after save.

## Smoke Tests

Add these before enabling the button:

- Dry-run creates no `bna_people`, `bna_workspace_memberships`,
  `bna_project_members`, or `bna_ops_access_links` rows.
- Missing approval phrase is rejected for non-dry-run requests.
- Scoped `one_time_admin` cannot create or edit other external users.
- Platform admin can create one approved test external user in the approved
  workspace.
- Created user appears in Admin > Users as an external user, not a parent
  account.
- Parent portal login and student portal login do not accept the external
  username.
- Provider portal login does not accept the external username unless a separate
  provider setup token/password flow was explicitly used.
- Access link creation is still a separate one-time action and expires after
  20 minutes.
- Revoke/rollback archives or deactivates the membership without deleting audit
  history.
- Readback verifies no email, WhatsApp, SMS, Telegram, billing, member-library,
  Google, Drive, Buffer, WAPI, external CRM, or Rabbi live-app write occurred.

## Rollback

Rollback should deactivate or archive access instead of deleting records:

- Set the canonical workspace membership inactive.
- Set the compatibility `bna_project_members.active` flag false.
- Expire or mark used any outstanding `bna_ops_access_links`.
- Keep audit metadata and reason for revoke.
- Do not remove parent/student/provider/member records because this workflow
  must not create those records in the first place.

## Guardrail

Do not use the generic person/member endpoint as a hidden external-account
creator. Do not turn a short-lived access link into an invite system. Do not
create Rabbi app credentials, provider portal passwords, parent/student portal
accounts, billing access, member-library access, Google scopes, Buffer access,
WhatsApp/email sends, or external CRM writes from this workflow.
