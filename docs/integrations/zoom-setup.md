# Zoom Setup Checklist

Status: setup required. Do not create or update Zoom meetings until this
checklist is complete and an exact approval phrase is provided.

## Account Owner Steps

1. The Zoom account owner or admin creates a Server-to-Server OAuth app in the
   Zoom App Marketplace.
2. Store these values only in Railway env, `.secrets/`, or the BNA keyholder:
   `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, and `ZOOM_CLIENT_SECRET`.
3. Set non-secret metadata: `ZOOM_ACCOUNT_OWNER`, `ZOOM_HOST_USER`, and
   `ZOOM_SCOPES`.
4. Confirm the exact meeting scopes in the Zoom dashboard before enabling
   writes. Current candidate scopes for meeting preview/create readiness are
   `meeting:write:admin`, `meeting:read:admin`, and `user:read:admin` when a
   host user lookup is needed.

## Codex Guardrails

- `GET /api/bna/integrations/zoom/status` is readiness only.
- `POST /api/bna/integrations/zoom/meeting-preview` builds a local preview.
- `POST /api/bna/integrations/zoom/session-automation-preview` previews the
  One Time live-session automation contract only.
- `POST /api/bna/integrations/zoom/webhook-attendance-preview` maps sample
  Zoom participant events to attendance drafts only.
- `POST /api/bna/integrations/zoom/attendance-correction-preview` drafts
  operator-reviewed correction payloads only.
- `POST /api/bna/integrations/zoom/meetings` remains blocked in INT-05 even
  when a confirmation phrase is typed.
- No meeting creation, registrant creation, live webhook acceptance, attendance
  write, account grant, role change, user management, or Zoom settings change is
  in scope until explicit operator approval and live smoke.

## Current Sources

- Zoom Server-to-Server OAuth app setup:
  <https://developers.zoom.us/docs/internal-apps/create/>
- Zoom internal app / Server-to-Server OAuth overview:
  <https://developers.zoom.us/docs/internal-apps/>
- Zoom API authentication overview:
  <https://developers.zoom.us/docs/api/>
