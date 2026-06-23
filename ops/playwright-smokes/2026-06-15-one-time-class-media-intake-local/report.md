# One Time Class Media Intake Local Smoke - 2026-06-15T08:34:00+03:00

Result: passed

## Scope

- Local app: `http://127.0.0.1:8097`
- Provider: exact `Rabbi Elie Scheller` / `rabbi_elie_scheller`
- Project scope verified: `one_time_mishnah_class`
- Media mode: manual hosted `http://` / `https://` URLs only

## Checks

- PASS local server health endpoint.
- PASS provider session payload exposed `one_time_class_media_enabled: true`.
- PASS `POST /api/provider-portal/one-time/class-media` with `dry_run: true`.
- PASS dry-run preview returned 6 planned output lanes.
- PASS invalid `ftp://` hosted media URL returned HTTP 400.
- PASS row-count guard: no `bna_content_jobs` rows created by dry-run.
- PASS provider static page loaded with the Class Media form and no console errors.
- PASS local Operations browser login loaded One Time Library, Package Preview,
  no-publish guardrails, and `Submitted from Rabbi portal` readback.

## Notes

- The in-app Browser runtime exposes page evaluation as read-only, so it blocked
  directly setting the temporary provider session cookie in the browser.
  Authenticated provider verification was therefore performed through the
  provider API using a short-lived `bna_provider_sessions` row, then cleaned up.
- The local server PID was stopped after smoke.
- Temporary provider sessions were deleted.

## Guardrails

- No content job, class media row, member-library publish, upload, send,
  checkout/access grant, Google/Drive/video-host write, Buffer/social action,
  or external CRM write was performed.
