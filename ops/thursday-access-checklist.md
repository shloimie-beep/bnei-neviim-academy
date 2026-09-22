# One Time Thursday Access Checklist

Last updated: 2026-06-16

Purpose: capture the human/account-owner work that must happen with Rabbi
Scheller and Shloimie before Codex can safely turn local integration readiness
into live integrations. This checklist does not authorize live sends, billing,
uploads, DNS writes, Zoom writes, Buffer publishing, WAPI sends, account grants,
or credential copying by itself.

## Zoom

- Status: blocked until Rabbi/owner enables developer access or attends a live
  owner session.
- Need Zoom for Developers View/Edit for Shloimie, or the owner present.
- Create/authorize a Server-to-Server OAuth app for One Time scheduling.
- Store Account ID, Client ID, and Client Secret only through BNA keyholder or
  Railway secret flow.
- Initial scope should be meeting read/write only unless recording scopes are
  explicitly approved.
- Do not use a Webhook Only app or General App as a substitute.

## GoDaddy / DNS

- Status: blocked because Delegate Access failed or is incomplete.
- Confirm exact One Time domain list and which domain/subdomain is primary.
- Repair delegate access or use owner login with 2FA present.
- DNS access is needed for site records, email/Resend records, and redirects.
- Copy exact DNS values from real provider dashboards only; do not infer values
  from screenshots or truncated previews.

## Vimeo

- Status: API readiness unknown; manual upload plus paste-URL fallback remains
  available.
- Confirm Vimeo plan and primary account-holder access.
- Create a Vimeo API app if possible.
- Generate a personal access token with the minimum scopes needed.
- Verify upload access, folder/library access, private/unlisted embed, domain
  embed limits, and filtered-device playback.
- Store token securely through provider integration/keyholder path only.
- If API upload is blocked, use manual upload and paste Vimeo URL into the
  first-party library draft.

## Resend

- Status: provider-owned sender decision needed.
- Rabbi should find the existing Resend login if one exists.
- Preferred model: separate provider-owned One Time Resend account/domain.
- Fallback: Shloimie-managed Resend sender only with explicit managed-service
  approval.
- Domain/subdomain DNS records are required before any production send.
- No email send is approved by this checklist.

## Buffer

- Status: account/channel ownership decision needed.
- Decide whether Rabbi uses an existing Buffer account or creates a One Time
  provider-owned Buffer account.
- Capture API key only through secure integration/keyholder path.
- Confirm connected Facebook, LinkedIn, YouTube, or other channel IDs.
- Draft/schedule/post actions remain approval-gated; no live publish is
  approved by this checklist.

## WAPI / WhatsApp

- Status: phone number and provider-owned connection decision needed.
- Decide Rabbi's WhatsApp number and whether it should be connected through
  WAPI/Whapi.
- Capture instance/key data only through secure integration/keyholder path.
- No WhatsApp sends, broadcasts, or webhook writes are approved by this
  checklist.

## Stripe

- Status: live billing remains blocked.
- Confirm account/business owner, payout/legal ownership, Shloimie's role, and
  whether One Time uses Stripe or another payment provider.
- Finalize prices, refund/legal copy, product names, checkout flow, webhook
  ownership, rollback/revoke path, and smoke-readback plan.
- No live products, prices, checkout links, webhooks, charges, or account grants
  are approved by this checklist.

## Google Drive

- Status: optional connector; first-party workflow must not depend on OAuth.
- Confirm whether Rabbi will use a provider-owned Drive folder for class
  recordings and source files.
- If yes, store OAuth/client/refresh-token material only through keyholder or
  Railway secret flow.
- Manual upload/drop-folder workflow remains acceptable while OAuth is blocked.

## Old One Time App

- Status: preserve until audited.
- Do not shut down, overwrite, redirect, or revoke the old app/admin/member
  access until content, members, routes, media, payment/access ownership, and
  source data are audited.
- Export or preserve class content, member/library records, assets, current
  routes, and live links before migration.
- Plan redirects only after the target BNA/One Time routes, member access,
  rollback path, and live smoke proof are ready.

## Safe Closeout Rule

Codex may continue building read-only readiness, first-party draft records,
manual fallback paths, setup tasks, and helper blockers. Anything that writes
to an external provider or changes live member/payment/access state requires a
separate explicit approval gate and verification path.
