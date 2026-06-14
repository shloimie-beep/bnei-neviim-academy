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

## Current Blockers

- Confirm deployed Google OAuth env vars.
- Confirm test-user email addresses.
- Confirm Drive scope policy before expanding preview-only Drive actions beyond
  existing owner pipeline.
- Connect an actual test-user account before live disconnect/revoke smoke can
  prove Google-side revocation.
