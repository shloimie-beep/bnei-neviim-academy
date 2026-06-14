# Google Now vs Later Scope Plan

Date: 2026-06-14

## Current Rule

Natural language does not remove Google OAuth requirements. The helper can
understand "schedule this" or "put this in Classroom", but any external Google
read/write still needs a connected Google account with the correct scope.

BNA should use three modes:

1. No-OAuth/manual mode now.
2. Test-user OAuth for Shloimie, Rabbi, and known testers.
3. Public production OAuth only after the product behavior is stable enough for
   verification.

## Mode A - No-OAuth / Manual / Public Links

Works now:

- Public Google Calendar embeds or public ICS links.
- Google Maps or Google Business Profile links on provider records.
- Manually stored Place IDs.
- Public YouTube/Vimeo links.
- Manually imported Classroom/assignment details stored in BNA.
- Drive files already imported through an owner-connected pipeline, public
  Drive links, or local uploads.
- Internal BNA calendar, assignments, provider listings, tickets, tasks, and
  content records.

Do not label these as live Google sync.

## Mode B - Test-User OAuth

Use this before public approval:

- OAuth consent screen in Testing.
- Add Shloimie, Rabbi, and known testers.
- Store tokens in the first-party Google connection tables or ignored local
  secret files only.
- Expose connect, reconnect, disconnect, test connection, and dry-run actions.
- Require confirmation before any external write.
- Log every preview and execution.

## Mode C - Public Production OAuth

Only after behavior is stable:

- Final scope matrix.
- Privacy policy and data deletion/disconnect language.
- Demo video/screenshots.
- Test-user smoke evidence.
- Google verification submission for sensitive/restricted scopes.

## Scope Matrix

| Area | Now | Test-user scope to try | Production note |
|---|---|---|---|
| Calendar read/free-busy | Internal calendar and public links | `calendar.freebusy` | Use only if BNA needs availability checks. |
| Calendar event writes | Internal BNA events | `calendar.events`, `calendar.events.owned`, `calendar.app.created` | Confirm exact event ownership model before public use. |
| Classroom courses | Internal assignments | `classroom.courses.readonly` | Read-only first. |
| Classroom coursework/materials | Payload preview only | `classroom.courseworkmaterials`, `classroom.coursework.students`, `classroom.topics` | Avoid rosters, guardians, and grades unless explicitly approved. |
| Drive list/search | Public/imported links | Audit existing Drive scopes first | Prefer app-created/file-specific or known-folder access. |
| Drive create/move Docs | Dry-run only | Narrow Drive and Docs scopes after audit | Separate read/list/create/move permissions. |
| Google Business Profile | Manual profile URL and Place ID | `business.manage` only per provider | Requires provider opt-in and likely verification/API approval. |
| Maps/Place ID | Manual link or configured Maps key | None for manual links | Do not fake live GBP reviews. |

## Operations Status

- Added Operations Settings > Google Workspace.
- Cards show Drive, Calendar, Classroom, and Google Business Profile status.
- Calendar/Classroom dry-run buttons use the shared action runner.
- Drive preview buttons use the shared action runner for file search/list,
  Doc preview, folder preview, and move preview without external writes.
- Test buttons hit existing Google status/read endpoints and surface blockers.
- Reconnect opens the existing OAuth start route only when credentials exist.
- Disconnect is confirmation-gated at
  `/api/google/connections/:connectionId/disconnect` and
  `/api/bna/integrations/google/connections/:connectionId/disconnect`.
- Readiness status includes real `bna_google_connections` OAuth rows when
  test-user accounts are connected.
- Provider Google Business/Profile links can be captured through the
  approval-gated `capture_provider_google_business_link` helper action. This
  stores manual provider fields only; it does not call the live GBP API.

## Next Implementation Steps

1. Add a small admin audit log view for Google previews and executions.
2. Add live test-user smoke after OAuth credentials and test users are ready.
3. Add live Drive adapters only after scope policy approval; current Drive
   actions are preview-only.
4. Add live GBP location/review adapters only after provider OAuth,
   `business.manage`, opt-in, and API approval.
