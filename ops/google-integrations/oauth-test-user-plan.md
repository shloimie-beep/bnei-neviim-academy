# Google OAuth Test-User Plan

Date: 2026-06-14

## Goal

Let Shloimie, Rabbi Scheller, and known testers exercise natural-language
Google actions before public OAuth verification.

## Setup Checklist

1. Create or confirm the Google Cloud project for BNA.
2. Enable only the APIs needed for the current tests:
   - Google Calendar API
   - Google Classroom API
   - Google Drive API only after Drive scope audit
   - Google Docs API only when document creation is needed
   - Business Profile APIs only after provider opt-in and approval planning
3. OAuth consent screen:
   - Publishing status: Testing
   - App name: BNA
   - Support email: approved BNA address
   - Authorized domain: production BNA domain
   - Privacy/deletion links: BNA policy pages
4. Add test users:
   - Shloimie account
   - Rabbi Scheller account
   - one BNA test account
   - one provider test account when available
5. Configure web OAuth client:
   - Redirect URI: current `GOOGLE_REDIRECT_URI`
   - Local callback only if local testing is needed
6. Store credentials safely:
   - Railway env vars for deployed app.
   - `.secrets/google-oauth-client.json` locally if needed.
   - Never commit client secret or refresh token.

## Test Actions

| Action | Expected first result |
|---|---|
| Connect Google account | Connection row created; account email and scopes visible. |
| Test Calendar connection | Read-only event list or clear missing-scope/credential error. |
| Preview Calendar event | Dry-run payload logged; no external write. |
| Confirm Calendar event | External write only after typed confirmation. |
| Test Classroom courses | Course list or clear missing-scope/credential error. |
| Preview Classroom coursework | Payload preview; no external write. |
| Confirm Classroom coursework | External write only after typed confirmation and course ID. |
| Drive search/import | Preview-only action is registered; live read/import waits for Drive scope policy. |
| Disconnect Google account | Confirmation-gated endpoint removes local refresh token and attempts revocation when configured. |
| GBP location list | Later; do not use until provider account and `business.manage` policy are approved. |

## Acceptance Criteria

- Internal BNA features work when Google is disconnected.
- The UI never claims sync when only manual/public links exist.
- Missing credentials produce plain-English blockers.
- External writes require connected account, scope check, dry-run preview, and
  explicit confirmation.
- Action logs include actor, workspace, role, action, dry-run result, approval
  status, success/failure, and related record.

## 2026-06-15 Scope Guard Update

Completed and deployed:

- Default server `GOOGLE_SCOPES` is now identity-only:
  `https://www.googleapis.com/auth/userinfo.email`.
- `.env.example` now teaches identity-only setup plus commented per-smoke
  examples instead of Gmail, broad Drive, Classroom roster, or profile-email
  scopes by default.
- A bare `/api/google/oauth/start` no longer requests the configured/broad
  scope set or Drive-pipeline setup implicitly.
- Broader scopes require an explicit feature/scope/setup request, such as
  Calendar, Classroom, Drive-pipeline, or Business Profile, and still require
  the owner approval packet before live external execution.
- The OAuth callback page no longer displays refresh-token values. Tokens are
  written only to ignored `.secrets/` files; the browser page shows redacted
  metadata.
- Added `tests/google-oauth-scope-guard.test.js` to keep this posture durable.
- Railway deployment `8a02f9fb-6044-48ee-bfeb-747bfeecee2f` reached SUCCESS,
  live smoke passed, and live Google readiness readback confirmed
  identity-only `default_scopes` and `required_scopes`.
- Follow-up completed on 2026-06-15: Railway production `GOOGLE_SCOPES` was
  narrowed to `https://www.googleapis.com/auth/userinfo.email`, the app was
  redeployed as `16920b4a-751a-4ee3-8534-9193a2739a7c`, live smoke passed, and
  the live Google readiness payload now reports identity-only
  `configured_scopes`, `default_scopes`, and `required_scopes` with zero
  configured-scope warnings.

## Current Blockers

- Confirm test-user email addresses.
- Confirm Drive scope policy before expanding preview-only Drive actions beyond
  existing owner pipeline.
- Connect an actual test-user account before live disconnect/revoke smoke can
  prove Google-side revocation.
