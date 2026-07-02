# Zoom Integration

Date checked: 2026-06-19

Scope: One Time class meetings, setup-session planning, recording metadata, and future read-only account checks. This file contains no secrets.

## Official Documentation

- Server-to-Server OAuth: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
- Create an internal app: https://developers.zoom.us/docs/internal-apps/create/
- API authentication: https://developers.zoom.us/docs/api/authentication/

## Current Local Implementation

- Adapter: `src/lib/integrations/zoom.js`
- One Time local media pipeline:
  `src/platform/integrations/media-local-pipeline.js`
- Existing safe operations:
  - config/readiness validation
  - required credential-name reporting
  - scope-presence check
  - no-write meeting preview
  - no-write session automation preview for `REQ-20260619-307`
  - no-write webhook attendance event preview
  - no-write attendance correction draft
  - explicit meeting-create approval guard that currently throws instead of writing
- One Time media pipeline turns Zoom recording metadata and participant events
  into class-session handoff, attendance/minutes preview, correction draft, and
  video-reference draft without storing raw meeting URLs or accepting live
  webhooks.

## Configuration Names

Non-secret identifiers may be referenced in Decisions:

- `ZOOM_ACCOUNT_ID`
- `ZOOM_ACCOUNT_OWNER`
- `ZOOM_HOST_USER`
- `ZOOM_SCOPES`

Secrets must be stored only in keyholder/server environment:

- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`
- `ZOOM_WEBHOOK_SECRET`

## Required Decision

- `DEC-20260618-201`: Verify Zoom owner role, license, and app-management path.

Needed before writes:

- owner/admin role confirmation
- Server-to-Server OAuth app permission
- host user and license state
- minimum scopes
- recording/webhook needs
- calendar sync policy

## Local Acceptance

- Meeting previews are safe and no-write.
- Session creation, registrant staging, join redirect, webhook attendance, and
  attendance correction previews are safe and no-write.
- Creating live Zoom meetings, registrants, webhook listeners, attendance
  writes, granting roles, or changing users remains blocked until explicit
  approval, release, and live smoke proof.
- `node --test tests/one-time-media-local-pipeline.test.js` verifies Zoom
  recording handoff, no raw URL/query secret exposure, and no meeting,
  webhook, attendance, upload, publish, or notification writes.
