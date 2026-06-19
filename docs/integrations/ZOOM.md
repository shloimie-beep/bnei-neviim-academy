# Zoom Integration

Date checked: 2026-06-19

Scope: One Time class meetings, setup-session planning, recording metadata, and future read-only account checks. This file contains no secrets.

## Official Documentation

- Server-to-Server OAuth: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
- Create an internal app: https://developers.zoom.us/docs/internal-apps/create/
- API authentication: https://developers.zoom.us/docs/api/authentication/

## Current Local Implementation

- Adapter: `src/lib/integrations/zoom.js`
- Existing safe operations:
  - config/readiness validation
  - required credential-name reporting
  - scope-presence check
  - no-write meeting preview
  - explicit meeting-create approval guard that currently throws instead of writing

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
- Creating live Zoom meetings, granting roles, or changing users remains blocked until explicit approval.
