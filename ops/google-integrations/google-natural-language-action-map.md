# Google Natural-Language Action Map

Date: 2026-06-14

## Shared Execution Contract

Every Google action must:

1. Detect workspace and role.
2. Check permission.
3. Check connection and scope.
4. Show a dry-run preview.
5. Ask confirmation for external writes.
6. Execute only if connected and approved.
7. Log the action.
8. Create a task/ticket if blocked by missing OAuth, scope, credentials, or
   provider approval.

## Drive

| Natural command | Current mode | Required work |
|---|---|---|
| Find the latest Rabbi Scheller Mishnah video | Preview-only action registered | `google_drive_find_file_preview`; no Drive read until connected. |
| Create a Google Doc summary for this class | Preview-only action registered | `google_drive_create_doc_preview`; external write waits for approval/scope adapter. |
| Put this transcript into the One Time folder | Preview-only action registered | `google_drive_move_file_preview`; known-folder policy still required before live write. |
| List files in the BNA raw media intake | Preview-only action registered | `google_drive_find_file_preview`; owner/test-user connection still required for real metadata read. |
| Create a folder for this provider | Preview-only action registered | `google_drive_create_folder_preview`; provider-scoped folder policy still required. |

## Calendar

| Natural command | Current mode | Required work |
|---|---|---|
| Schedule Rabbi Scheller launch planning for Tuesday at 8 | Internal calendar works now | Use `create_calendar_event`; optional Google sync after approval. |
| Put this task on the calendar | Internal calendar works now | Link task/event and add Google dry-run. |
| Show this week's meetings | Internal calendar works now | Add optional Google read after connection. |
| Create the 8-week launch calendar | Preview-only action registered | `calendar_batch_launch_plan_preview`; no internal or Google Calendar writes until reviewed start date and later explicit write confirmation. |

Registered action now:

- `sync_google_calendar` is approval-gated and dry-run capable.
- `calendar_batch_launch_plan_preview` is approval-gated and dry-run capable.

## Classroom

| Natural command | Current mode | Required work |
|---|---|---|
| Create a draft assignment from this YouTube video | Internal assignment and Google payload preview exist | Add natural-language wrapper around assignment preview. |
| Make a worksheet for this student | Internal worksheet action exists | Keep student privacy filters active. |
| List courses | Test-user OAuth only | Use course list endpoint after connection. |
| Put this material under the right topic | Preview-only action registered | `classroom_topic_material_preview`; topic lookup/create policy and OAuth approval still required before live write. |
| Preview the Google Classroom payload | Implemented on assignment cards | Keep live sync typed-confirmation gated. |

Registered action now:

- `sync_google_classroom` is approval-gated and dry-run capable.
- `classroom_topic_material_preview` is approval-gated and dry-run capable.

## Google Business Profile

| Natural command | Current mode | Required work |
|---|---|---|
| Attach this provider's Google Business link | Implemented manual-only action | `capture_provider_google_business_link`; approval-gated, no live GBP API. |
| Find the Place ID from this Maps link if possible | Preview-only action registered | `google_business_place_id_lookup`; extracts IDs from supplied text/URLs only, no Maps/Places lookup until API approval. |
| Show providers with connected GBP | Manual/connector status now | Add Operations filter. |
| List accessible GBP locations for this provider | Preview-only action registered | `google_business_list_locations_preview`; live locations read requires provider OAuth and `business.manage`. |

## Missing Typed Actions

None for the current preview-only Google action map. Live adapters remain
blocked by OAuth/scope/provider approval gates.

## UI Surface

Operations Settings > Google Workspace now shows the current readiness model.
Future helper buttons should point to the same action registry instead of
adding page-specific Google handlers.
