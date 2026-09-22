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
- Default OAuth scope posture is identity-only. Broader Calendar, Classroom,
  Drive, or Business Profile scopes must be requested by explicit feature,
  scope, or setup request for a specific approved smoke.
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
- Local packet:
  `ops/google-integrations/google-public-oauth-verification-packet.md`.
- Owner approval phrase before preparing or submitting the public packet:
  `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET`.

## Scope Matrix

| Area | Now | Test-user scope to try | Production note |
|---|---|---|---|
| Calendar read/free-busy | Internal calendar and public links | `calendar.freebusy` | Use only if BNA needs availability checks. |
| Calendar event writes | Internal BNA events | `calendar.events`, `calendar.events.owned`, `calendar.app.created` | Confirm exact event ownership model before public use. |
| Classroom courses | Internal assignments | `classroom.courses.readonly` | Read-only first. |
| Classroom coursework/materials | Payload and topic/material previews only | `classroom.courseworkmaterials`, `classroom.coursework.students`, `classroom.topics` | Avoid rosters, guardians, and grades unless explicitly approved. |
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
- Google Calendar now has a shared action-runner `8-week plan` preview button
  for the One Time/Rabbi launch calendar. It calls
  `calendar_batch_launch_plan_preview`, scopes the request to
  `rabbi_sheller_provider`, and performs no internal calendar write, Google
  Calendar write, send, or external connector action.
- Google Classroom now has a shared action-runner `Topic/material` preview
  button. It calls `classroom_topic_material_preview`, scopes the request to
  BNA, previews the course/topic/material payload, and performs no Classroom
  read/write, internal write, send, or live Google API call.
- Test buttons hit existing Google status/read endpoints and surface blockers.
- Reconnect opens the existing OAuth start route only when credentials exist.
- Disconnect is confirmation-gated at
  `/api/google/connections/:connectionId/disconnect` and
  `/api/bna/integrations/google/connections/:connectionId/disconnect`.
- Readiness status includes real `bna_google_connections` OAuth rows when
  test-user accounts are connected.
- Readiness status now reports the identity-only default scopes and a scope
  request policy so a bare OAuth start does not accidentally request broad
  Drive/Gmail/Classroom access.
- OAuth callback pages are redacted: refresh tokens are saved only under
  ignored `.secrets/` files and are not displayed in the browser.
- The Google Live Adapter Approval Packet is deployed in Operations Settings >
  Google Workspace. It lists the OAuth/test-user, Drive scope, explicit
  external-write confirmation, and smoke-evidence requirements, and names the
  exact `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` phrase. The packet is readiness
  documentation only and performs no live Google read/write.
- The packet can preview a local Shloimie decision draft through
  `create_decision` with `dry_run: true`. The preview is audit/readback only:
  it must return `executed: false` and `preview.decision_created: false`, and
  it performs no connector read/write.
- Provider Google Business/Profile links can be captured through the
  approval-gated `capture_provider_google_business_link` helper action. This
  stores manual provider fields only; it does not call the live GBP API.
- Google Business Profile now has shared action-runner `Place ID` and
  `Locations` preview buttons. They call `google_business_place_id_lookup` and
  `google_business_list_locations_preview`, extract/plan only from supplied
  inputs, and perform no Maps lookup, GBP API read, external write, send, or
  live Google API call.

## Next Implementation Steps

1. Completed: add a small admin audit log view for Google previews and
   executions. Operations Settings > Google Workspace now includes a read-only
   Google Action Audit backed by local `botActionLogs`.
2. Completed: add the Google Live Adapter Approval Packet. It is deployed and
   live-smoked, with `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` as the confirmation
   phrase for the eventual test-user live smoke.
3. Completed: add a local `Preview Decision Draft` control for the approval
   packet. It logs only a `create_decision` dry-run preview and creates no
   task, Google read/write, or connector execution.
4. Completed: add the One Time/Rabbi 8-week launch calendar dry-run preview.
   It can plan the launch sequence after a reviewed `start_date`, but it still
   creates no internal or Google Calendar events.
5. Completed: add the Google Classroom topic/material dry-run preview. It can
   plan a course material under a selected topic, but it still performs no
   Classroom read/write and needs topic policy plus OAuth approval before live
   execution.
6. Completed: add Google Business Profile Place ID and locations preview
   helpers. They close the current preview-only natural-language map but do not
   enable live GBP API access.
7. Completed locally: add the Mode C Google public OAuth verification packet at
   `ops/google-integrations/google-public-oauth-verification-packet.md`. It
   uses official Google source links, requires scope category readback from
   Cloud Console at submission time, and separates public packet approval from
   live adapter writes.
8. Completed and deployed: tighten the Mode B OAuth scope guard. Runtime
   defaults and `.env.example` now start with `userinfo.email` only, bare OAuth
   start no longer implies Drive-pipeline setup, classroom defaults avoid
   roster/profile scopes, callback pages redact refresh-token values, and the
   live readiness payload separates configured Railway scopes from
   identity-only default/required scopes. Follow-up production config cleanup
   narrowed Railway `GOOGLE_SCOPES` to `userinfo.email`; live readback now shows
   identity-only configured/default/required scopes and zero configured-scope
   warnings.
9. Add live test-user smoke after OAuth credentials, test users, scope policy,
   and explicit external-write approval are ready.
10. Add live Drive adapters only after scope policy approval; current Drive
   actions are preview-only.
11. Add live GBP location/review adapters only after provider OAuth,
   `business.manage`, opt-in, and API approval.
