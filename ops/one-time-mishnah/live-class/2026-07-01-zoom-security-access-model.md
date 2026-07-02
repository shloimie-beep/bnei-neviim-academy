# One Time Zoom And Class Link Security Model

Generated: 2026-07-01T19:13:57+03:00

Requirement: `REQ-20260701-612`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Status

Security model documented. Final Zoom/session configuration is blocked until
Shloimie supplies approved session details.

No Zoom meeting, registrant, calendar event, live-session record, reminder,
email, WhatsApp message, or external provider write was created by this packet.

## Current Verified Behavior

- Public campaign and member-login entry pages do not expose direct Zoom links.
- Member APIs require a valid member token before returning member library or
  live-session data.
- Invalid classroom access codes return unauthorized errors without private
  media or Zoom values.
- Authenticated live-access members can receive live-session state through the
  member API; anonymous visitors cannot.

Evidence:

- `ops/live-smokes/2026-07-01T16-07-50-327Z-one-time-member-path-live-smoke.md`
- `server.js`
- `public/js/rabbi-member.js`
- `public/one-time-classroom.html`

## Required Model

- Store final class sessions as One Time project-scoped records.
- Store Zoom details only on gated live-session records.
- Public landing pages show class offer and member login entry only, never raw
  Zoom URLs.
- Member display checks active access grants before showing live links.
- Library-only access can see recordings/materials but not live Zoom links.
- Live/trial access can see live-session link state only after login or access
  code validation.
- Link change resets reminder/send state so stale links are not resent.

## Required Inputs Before Configuration

- Approved Zoom meeting/session URL or account-managed meeting details.
- Class date/time, timezone, duration, title, and status.
- Whether the link is reusable or class-specific.
- Whether registration is required.
- Who can view live links: trial, live paid, comped, Rabbi/admin.
- Approved reminder/send policy.
- Rollback policy for changed/canceled/rescheduled links.

## Decision

This remains `Needs operator decision` until the approved Zoom/session details
and activation policy are supplied. Do not paste private Zoom links into
tracked files.
