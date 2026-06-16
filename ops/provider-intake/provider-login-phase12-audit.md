# Provider Login / Grabify Bug Phase 12 Audit

Date: 2026-06-15

Status: current read-only audit and regression coverage. No provider password,
setup token, admin link, email, WhatsApp, billing action, public listing change,
or external connector write was created by this pass.

## Summary

The active BNA provider portal implementation already has a scoped provider
login flow, provider session table, setup-token flow, provider-owned profile
and service editing, and prior live smoke evidence. This pass did not find an
active `Grabify` reference in the current provider login path or active app
source surfaces that were inspected.

The next useful work is not to replace the provider login. It is to run a fresh
live provider credential smoke when an approved test provider or temporary
smoke account is available, then record the result against the Phase 12 bug.

## Evidence

- Live provider portal smoke:
  `ops/live-smokes/2026-06-10T12-05-01-939Z-provider-portal-smoke.md`
- Implementation test:
  `tests/service-provider-directory.test.js`
- Active portal page:
  `public/provider.html`
- Active server routes:
  `server.js`
- Provider setup email live readback:
  `ops/live-smokes/2026-06-14T18-58-10-provider-setup-email-live-readback.md`

Prior live smoke passed on deployment `56747aa2-6dd8-41ad-96a8-2846097e46d8`:

- admin creates temporary pending-review provider login
- provider logs in and receives scoped session
- provider session endpoint returns only own workspace
- provider creates service for BNA review
- admin archives temporary provider

## Active Routes And APIs

Public provider portal routes:

- `/provider`
- `/provider/login`
- `/provider-dashboard`

Provider portal APIs:

- `GET /api/provider-portal/setup-token`
- `POST /api/provider-portal/setup-password`
- `POST /api/provider-portal/login`
- `POST /api/provider-portal/logout`
- `GET /api/provider-portal/session`
- `PATCH /api/provider-portal/profile`
- `POST /api/provider-portal/services`
- `POST /api/provider-portal/messages/:id/reply`

Operations/admin provider APIs include provider setup email and provider record
management under the admin-only BNA routes.

## Phase 12 Requirement Check

| Requirement | Current evidence | Status |
|---|---|---|
| Audit route | `/provider`, `/provider/login`, `/provider-dashboard`, and provider portal APIs are present. | Implemented |
| Audit credentials | Provider setup tokens and password hashes exist; no raw password values are printed or stored in docs. | Implemented with secret-safe handling |
| Audit session cookie | `PROVIDER_SESSION_COOKIE_NAME`, `bna_provider_sessions`, and provider session issue/clear functions exist. | Implemented |
| Audit auth guard | `requireProviderSession` protects provider session/profile/service/message APIs. | Implemented |
| Audit workspace role assignment | Provider payload is scoped to the provider record/workspace; provider edits stay pending review. | Implemented |
| Provider user rows | `bna_service_providers` has `login_username`, `password_hash`, `password_set_at`, and `last_login_at`. | Implemented |
| Failed login explains missing access without secrets | Missing username/password returns a required-fields error; invalid credentials return generic `Invalid provider credentials`. | Implemented |
| Mobile/desktop flow | Provider page renders login and setup-password panels; prior visual/live smokes covered provider login surfaces. | Implemented, fresh smoke still useful |
| Shloimie admin-manager access | Shloimie manages provider setup and review through Operations/admin routes, not through a provider-scoped account. | Implemented |
| Rabbi/provider scoped access | Provider can log in once a setup token/password is completed for that provider record. | Implemented |
| Grabify bug check | No active `Grabify` reference was found in `server.js`, `public/provider.html`, `public/operations.html`, or active provider tests. | No active source hit found |

## Current Guardrails

- Provider login is scoped to a provider record.
- Provider portal does not expose private BNA student, parent, accounting, or
  Operations admin data.
- Provider-owned edits go to BNA review rather than direct public mutation.
- Draft, rejected, and archived providers cannot log in through the standard
  provider credential route.
- Failed login responses stay generic and do not reveal whether a username,
  provider row, status, or password hash exists.
- Setup token errors are reported without printing token values.
- No live billing, charge, payout, admin-fee automation, or payment connector
  write is enabled by provider login.

## Fresh Live Smoke Needed

Run only with an approved temporary provider or approved existing provider
test account:

1. Open `/provider/login` on desktop and mobile widths.
2. Submit blank credentials and verify the required-fields error.
3. Submit invalid credentials and verify only the generic invalid-credentials
   message appears.
4. Complete setup through an approved short-lived setup token.
5. Log in and verify `GET /api/provider-portal/session` returns only the
   provider's own profile, services, sessions, messages, commercial model,
   entitlements, external app settings, and access checklist.
6. Create or edit one service and verify it lands in `pending_review`.
7. Verify no BNA private students, parents, accounting data, admin tasks,
   internal communications, or One Time member-library data appears.
8. Archive or delete the temporary smoke provider.

## Current Recommendation

Treat Phase 12 as implemented with prior live evidence, but keep a fresh
provider-login smoke on the next deployment checklist if the operator reports a
current login failure. Do not create raw passwords in chat. Use setup tokens,
approved test provider rows, and the local keyholder workflow for any
credential handoff.
