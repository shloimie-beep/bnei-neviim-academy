# One Time Thursday Access Session

Cycle ID: `2026-06-16-one-time-integrations-access-agent-audit`

## Purpose

Capture the external/account-owner blockers that should be handled with Rabbi
Scheller and Shloimie in person on Thursday, while Codex continues building the
safe app-side readiness, status, and checklist surfaces.

## Thursday Checklist

### Zoom

- Confirm Rabbi/owner access to the Zoom account that should own One Time
  meetings.
- Enable Zoom developer permissions or create/authorize a Server-to-Server OAuth
  app.
- App name: `One Time Mishnah Class Scheduler`.
- Capture account ID, client ID, and client secret through the keyholder/Railway
  secret path only.
- Required initial scopes: meeting read/write. Do not add recording scopes until
  approved.
- Do not use a Webhook Only app or General App as a substitute for the required
  Server-to-Server OAuth setup.

### GoDaddy / DNS

- Repair Delegate Access or use owner login with 2FA present.
- Confirm domain list and primary domain for One Time.
- Confirm `OneTimeOneTime.com` current hosting, DNS, redirects, and old-site
  status.
- Copy exact DNS record values from provider dashboards only after they are
  visible in the real dashboard. Do not use truncated screenshot values.

### Resend

- Try to find the old Resend login.
- If missing, decide whether to create a new One Time Resend account or approve
  a temporary Shloimie-managed sender exception.
- Prefer provider-owned domain setup such as `mail.onetimeonetime.com`.
- Copy exact DNS records from Resend dashboard after account/domain setup.

### Vimeo

- Confirm plan and primary account-holder login.
- Create Developer API app if available.
- Generate a personal access token securely with the minimum scopes needed.
- Verify whether upload access is available; paid plans should normally have API
  upload access, while free/older apps may need manual review.
- Check private video, domain embed, and filtered-device viewing behavior.

### Buffer

- Decide whether One Time already has its own Buffer account or needs one.
- Capture API key through the secure integration/keyholder path.
- Confirm connected social channels. Draft/schedule/post actions remain
  approval-gated.

### WAPI / WhatsApp

- Decide Rabbi's WhatsApp number and provider-owned WAPI connection.
- Capture instance/key data through the secure integration/keyholder path.
- No live sends without explicit approval.

### Stripe

- Confirm business/payment owner, payout owner, Shloimie's role, and pricing.
- Do not create live products, prices, checkout links, or account grants until
  pricing/payment ownership is approved.

### Google Drive

- Confirm whether Rabbi will use a provider-owned Drive folder for recordings,
  source files, worksheets, and class prep.
- If OAuth is used, store client/refresh-token material only through the
  keyholder/Railway secret path.
- Keep the manual upload/drop-folder path available while OAuth is blocked.

### Old One Time App

- Do not shut down, overwrite, redirect, or revoke the existing One Time app,
  admin path, member library, or member access until content/members/routes are
  audited and preserved.
- Export or preserve class content, member/library records, assets, current
  URLs, live links, and payment/access ownership notes before migration.
- Plan redirects only after the target BNA/One Time routes, rollback/revoke
  path, and live smoke proof are ready.

## Current Status

- Zoom and GoDaddy/DNS are external blockers until Thursday.
- App-side status cards, DNS task placeholders, and provider-scoped integration
  setup are now built and deployed.
- Any secret transfer must use the BNA keyholder/Railway env path and must not
  appear in chat, tracked files, screenshots, logs, or task titles.
- Canonical checklist: `ops/thursday-access-checklist.md`.

## 2026-06-16 Closeout

- Stabilization branch:
  `codex/one-time-integrations-access-audit-2026-06-16`.
- Stabilization commit: `35e0571`.
- Railway production deployment:
  `47da54d6-fda7-495a-84ab-90b51ebdefe1` reached `SUCCESS`.
- Live verification passed: Railway doctor, main app smoke, public route
  privacy smoke, student-auth smoke, operator setup smoke, assistant onboarding
  intake smoke, signup credit email preview smoke, WS11 parent-progress smoke,
  and direct authenticated `/api/bna/integrations/status` readback with 15
  readiness cards.
- Thursday session remains for real account access, DNS values, API keys,
  ownership decisions, pricing/payment decisions, and explicit approvals only.
  No live sends, uploads, posts, charges, DNS writes, account grants, or
  credential copying were performed.
