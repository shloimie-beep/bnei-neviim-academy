# Rabbi Scheller Meeting Prep - 2026-06-18

## Meeting

| Field | Value |
|---|---|
| Meeting | Rabbi Scheller / OneTime Mishnayos launch prep |
| Date | Thursday, 2026-06-18 |
| Time | About 8:30; confirm AM/PM and timezone, assumed Asia/Jerusalem for now |
| Location | In person, private location redacted |
| Source raw ID | RAW-20260617-010 |
| Register | tasks-pending/2026-06-17-rabbi-scheller-onetime-mishnayos-register.md |

## Objective

Leave the meeting with enough access, permissions, product decisions, and
customer-list policy to safely move the focused OneTime Mishnayos offer toward
launch without exposing credentials or private subscriber data.

## Offer Draft For Review

- Public draft name: Worldwide OneTime Mishnayos.
- Alternative names to choose from: Worldwide Mishnah Shir, Worldwide Mishnah
  Class.
- Draft primary CTA: Join the Shir.
- Draft one-line promise: The live Mishnah class kids actually look forward to.
- Draft price: $67, billing cadence needs confirmation.
- Future upsell: VIP summer module, likely $400-$500, around 30 kids, 12 weeks,
  dates and scope need Rabbi confirmation.
- Current boundary: this is not a full OneTime Academy & Hotline rebuild unless
  Rabbi and Shloimie explicitly choose that later.

## Agenda

1. Confirm final offer name and CTA.
2. Confirm $67 price and billing cadence.
3. Confirm VIP class/module price, dates, cap, and whether it should stay
   internal-only for now.
4. Confirm whether currently active subscribers get a free migration month.
5. Review old subscriber/customer list policy without copying raw emails into
   the repo.
6. Review sample email language and segments.
7. Confirm student digital library and moderated reply model.
8. Confirm no child-facing AI bot for OneTime kids initially.
9. Confirm rights to use the hero/background video and vertical OneTime images.
10. Confirm Zoom account owner/admin path.
11. Confirm GoDaddy delegate access path and 2FA/security-code handling.
12. Confirm Resend account/team/domain plan.
13. Confirm Vimeo account/API plan and whether videos can be managed by API.
14. Confirm payment provider/link owner.
15. Confirm whether current Replit/site remains external during migration or
    whether the BNA repo-hosted page becomes the draft launch path.
16. Confirm Telegram bot status and whether Rabbi/Shloimie want a live test
    during/after the meeting.
17. Confirm internal readiness timeline.

## Walkthrough Cards

### Zoom API / Developer Access

Objective: create or inspect the current Zoom app path for live class and
recording operations.

- Account owner/admin needed: yes.
- Page/account to open: Zoom App Marketplace / Build App / Server-to-Server
  OAuth app, or the current official equivalent.
- Collect: Account ID, Client ID, Client Secret, app name, app owner email,
  approved scopes, whether recordings/meetings/webinars are needed, token test
  endpoint result.
- Store secrets: local BNA keyholder or Railway env vars only after explicit
  request. Do not paste secrets into chat, repo, screenshots, or task titles.
- Current official reference:
  https://developers.zoom.us/docs/internal-apps/create/
- Test result to collect: token can call a safe read-only endpoint such as user
  or meeting list for the approved account.
- Blocker status: needs owner/admin access and final scope list.

### GoDaddy Delegate Access

Objective: get safe delegated domain/DNS access without sharing the account
password or permanent SMS codes.

- Account owner needed: yes.
- Page/account to open: GoDaddy account settings > Delegate Access.
- Collect: invitee email, access level, domains allowed, invitation status and
  expiry.
- Do not collect: GoDaddy password, permanent SMS codes, authenticator backup
  codes.
- Current official reference:
  https://www.godaddy.com/help/invite-a-delegate-to-access-my-godaddy-account-12376
- Test result to collect: Shloimie/developer can see the delegated account area
  and required domain/DNS controls.
- Blocker status: needs owner logged in and 2FA/security code live if prompted.

### Resend Setup

Objective: decide whether OneTime email uses an existing verified domain/team
or a new Resend account/domain.

- Account owner needed: likely yes for domain/DNS and billing/team access.
- Page/account to open: Resend Domains and API Keys.
- Collect: sending domain, DNS records needed, verification status, API key
  name, allowed environment, test send result, logs/monitoring path.
- Store secrets: BNA keyholder/Railway env only after explicit operator request.
- Current official references:
  https://resend.com/docs/dashboard/domains/introduction
  https://resend.com/docs/dashboard/api-keys/introduction
  https://resend.com/docs/send-with-nodejs
- Test result to collect: verified domain and a safe test email to an approved
  internal recipient only.
- Blocker status: needs domain decision and owner approval.

### Vimeo / Video Access

Objective: confirm whether videos/background media can be embedded, downloaded,
uploaded, or managed through the Vimeo API.

- Account owner needed: likely yes.
- Page/account to open: Vimeo developer apps and current video asset settings.
- Collect: app availability, account plan/API permissions, token/scopes if
  approved, video IDs, embed/download permissions, owner approval for background
  hero usage.
- Do not do: scrape, bypass access controls, download unauthorized media, commit
  huge raw videos to the repo.
- Current official references:
  https://developer.vimeo.com/api/guides/start
  https://developer.vimeo.com/api/authentication
- Test result to collect: API can read approved account/video metadata, or API
  is blocked and manual approved asset path is selected.
- Blocker status: no local hero video found yet; rights and asset still needed.

### Payment / $67 Plan

Objective: make the $67 plan launch-ready without accidentally enabling
unapproved charges.

- Account owner needed: yes for Stripe/Green Invoice/payment provider.
- Page/account to open: selected payment provider dashboard and BNA Operations
  settings/payment area.
- Collect: provider of record, price amount, billing cadence, payment link or
  price/item ID, refund/access policy, tax/VAT policy, success URL, cancel URL.
- Store secrets: BNA keyholder/Railway env only after explicit request.
- Do not do: create live payment link, charge, or grant member access without
  explicit approval.
- Test result to collect: test-mode or preview-only link verified if provider
  supports it.
- Blocker status: provider/link decision still needed.

### OneTime Media Asset Import

Objective: collect approved images/video for the new page and portal previews.

- Page/folder to open: local OneTime graphics folder or approved shared Drive
  folder.
- Collect: desktop hero/poster, mobile hero/poster, logo, Rabbi image,
  permission/source notes, desired focal points.
- Store: approved optimized copies under `public/images/onetime/` or approved
  public/CDN storage; raw originals should stay outside tracked repo if large.
- Do not share publicly: unapproved media, private subscriber screenshots,
  private meeting-location images.
- Test result to collect: screenshots at 390px, 768px, and 1440px.
- Blocker status: rights confirmation needed before video use.

### Email Sequence Review

Objective: approve copy before any sends.

- Page/file to review: `ops/email-drafts/2026-06-17-rabbi-scheller-relaunch-sequence.md`.
- Collect: final offer name, price/cadence, segments, active-subscriber free
  month decision, send domain, Rabbi signoff.
- Do not do: import raw list, send campaign, or upload contacts to an external
  provider without explicit approval.
- Test result to collect: approved draft and segment policy.
- Blocker status: needs Rabbi approval.

## Sample Email For Rabbi Review

Subject options:

- A new Mishnayos class your son can look forward to
- Worldwide OneTime Mishnayos, live from Eretz Yisrael
- Join Rabbi Scheller for a new Mishnah shir

Draft:

> We are preparing a new Worldwide OneTime Mishnayos class with Rabbi Eli
> Scheller, live from Eretz Yisrael. The goal is simple: a warm, energetic
> Mishnah experience boys can look forward to, with replay/library access and a
> parent-aware portal. The planned class offer is $67, pending final billing
> confirmation. Before we open it publicly, we are confirming the schedule,
> access details, and launch benefits for current families.

Approval notes:

- Confirm exact offer name.
- Confirm whether to mention a free migration month.
- Confirm whether `$67` is monthly, one-time, or module pricing.
- Confirm whether UK/homeschool/after-school positioning should appear in the
  first email or later.

## Readiness Timeline

| Date/Phase | Item | Status |
|---|---|---|
| 2026-06-18 | Rabbi Scheller meeting | Prepared; time AM/PM needs confirmation |
| Meeting day | Zoom access decision | Needs owner/admin |
| Meeting day | GoDaddy delegate invite | Needs owner |
| Meeting day | Resend domain/team decision | Needs owner/DNS |
| Meeting day | Vimeo/API and video rights decision | Needs owner/permission |
| Meeting day | $67 payment provider/link decision | Needs provider approval |
| After meeting | Asset import/optimization | Blocked until rights/assets |
| After meeting | Final public copy pass | Needs Rabbi/Shloimie approval |
| After meeting | Email sequence approval | Needs Rabbi/Shloimie approval |
| After meeting | Deploy/live smoke | Required for app-visible launch changes |
| Later | Google Calendar sync | Pending connector/integration path; use internal tasks until then |

## What Shloimie Needs To Bring

1. Rabbi available with Zoom owner/admin access or ability to create the app.
2. Rabbi available in GoDaddy to send delegate access.
3. Decision on existing versus new Resend/domain setup.
4. Vimeo account/API access and permission to use the video.
5. Final offer name preference.
6. $67 billing cadence and provider choice.
7. VIP price/date/cap preferences.
8. Free migration month decision for active users.
9. Old subscriber/customer list export plan, without putting raw emails in repo.
10. Approval notes on the sample email sequence.
11. Confirmation of student library and moderated reply model.
12. Approved background video and hero image/source folder.
