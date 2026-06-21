# Known Blockers

## REQ-20260619-313

Blocked before separate live deployment because the available Railway token is
project-scoped to the shared `skillful-motivation` project. Account-level
Railway auth or a pre-created separate One Time project token is required.

Exact action:

- Provide account-level Railway access that can create/list projects, or create
  `one-time-production` with `one-time-web` and `one-time-postgres` and provide
  a scoped token for that project.

## Domain

`app.onetimeonetime.com` cannot be attached until the One Time web service
exists. Exact CNAME/TXT records are pending Railway generation.

## REQ-20260621-902

Hosted transcription remains blocked on `401 invalid_credential`. Provide or
rotate the hosted transcription credential, then reprocess content job #78.

## Not Blockers For UI Review Package

- Resend sender/domain values: sending remains disabled.
- Vimeo user-level upload token: manual Vimeo references remain supported.
- Zoom meeting creation: protected join/readiness model remains testable without
  creating real meetings.
