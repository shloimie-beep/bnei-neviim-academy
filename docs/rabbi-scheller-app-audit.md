# Rabbi Scheller App Audit Template

Date started: 2026-06-14

Workspace: Rabbi Elie Scheller / One Time Mishnah Class

Purpose: inspect the existing Rabbi Scheller app/Replit runtime, preserve what
matters, and migrate operational source of truth into the GitHub-managed BNA /
One Time workspace without exposing secrets.

## Access Needed

- Replit/source app access or export
- Non-secret config map and `.env.example` equivalents
- Database/storage location and schema notes
- Runtime/deployment details
- Vimeo/video library access
- Resend account/domain status
- Domain/DNS access
- Payment processor/checkout access
- Contact/email list exports
- Drive/source-sheet/worksheet folders

## Questions To Answer

- What does the current app do?
- Where is the source code?
- What database/storage does it use?
- What stats/analytics exist?
- How are users/auth handled?
- How are videos/library/class materials handled?
- What should be preserved?
- What should be replaced by BNA first-party systems?
- What can stay temporarily?
- What secrets/env vars are needed?
- What payment/email/domain dependencies exist?
- What is the safest migration path?

## Findings

Pending source/app access.

## Migration Recommendation

Pending audit. Default safe assumption: keep existing delivery paths stable while
BNA Operations becomes the first-party source of truth for CRM, tasks, decisions,
comments, payments/access workflow, launch timeline, and internal dialogue.

## Required Follow-Up Tasks

- Audit Rabbi Scheller's Replit app and create migration plan.
- Sync source and non-secret config map into Shloimie's GitHub workflow.
- Decide analytics/backend strategy.
- Decide Replit migration path.
- Configure payment/email/domain flows only after access and approval gates.
