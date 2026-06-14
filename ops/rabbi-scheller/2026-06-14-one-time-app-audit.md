# Rabbi Scheller / One Time App Audit

Date: 2026-06-14

## Evidence

- `shloimie-beep/one-time-app` main verified at
  `a3463bc6756ac34d8f304451fa0e5190309b8ae1`.
- `shloimie-beep/one-time-one-time` main verified at
  `050fe2468a3f5601e74e738c219cbe5c1bdf398e`.
- Temporary local audit clones were inspected at
  `C:\Users\User\AppData\Local\Temp\bna-one-time-audit-20260614-160251`.
- Supporting notes:
  - `ops/audits/2026-06-14-one-time-repo-inventory.md`
  - `ops/audits/2026-06-14-rabbi-scheller-app-backend-advice.md`
  - `ops/audits/2026-06-14-one-time-billing-referral-plan.md`

No live One Time production behavior was changed.

## 1. Repo Purpose

`one-time-app` is an Expo/React Native mobile companion prototype with a small
demo Express backend and sample content.

`one-time-one-time` is the existing full web/backend product source for the One
Time membership/media app: public funnel, member dashboard, admin dashboard,
video library, subscriptions, email, analytics, hotline/audio, comments, and
questions.

## 2. Tech Stack

`one-time-app`:

- Expo 54, React 19, React Native 0.81.
- React Navigation, TanStack Query, Drizzle, PostgreSQL client packages.
- Express 5 demo backend run with `tsx`.

`one-time-one-time`:

- Vite/React 18 frontend with Wouter, Radix UI, Tailwind, Recharts, Uppy, and
  DnD tooling.
- Express 4 backend, Passport local auth, sessions, PostgreSQL, Drizzle ORM.
- Stripe, Resend, Vimeo tooling, Google Cloud storage package, phone/hotline
  services, PDF/media conversion utilities.

## 3. Routes And Screens

`one-time-app` screens include home, login, album detail, and content player.
The demo API exposes login and content browsing endpoints.

`one-time-one-time` includes public landing/login/register/password pages,
member dashboard, setup flow, Gadlus HaAdam page, and a broad admin area:
dashboard, subscribers, analytics, videos, featured videos, comments,
questions, documents, albums, audio, hotline, menu, conference, messages,
settings, banners, whitelist, RSS, announcements, and live meeting.

## 4. Backend / Server Structure

`one-time-app` has a thin server with sample-content routes and basic auth.

`one-time-one-time` has a large backend under `server/`:

- `routes.ts` for API routes.
- `storage.ts` for database/storage operations.
- `stripeClient.ts` for Stripe.
- `resendClient.ts` and `emailTemplates.ts` for email.
- `vimeoService.ts` and thumbnail/media helpers.
- `voitex*` hotline/phone files.
- `webhookHandlers.ts`, converters, static/Vite helpers, and DB setup.

## 5. Auth / Login System

`one-time-app` auth is demo-style and not production-ready.

`one-time-one-time` has session auth, Passport local auth, mobile token auth,
password reset/change, admin role checks, and subscriber/member flows. It needs
security review before reuse because setup/debug/bootstrap paths exist.

## 6. How To Get Shloimie Logged In

Do not invent credentials.

Safe path:

1. Confirm the live One Time admin URL and deployment target.
2. Obtain or reset an admin account through the existing owner-approved
   password reset/admin flow.
3. If no safe admin exists, add a bootstrap script in the One Time repo that
   requires a local secret and refuses to run accidentally in production.
4. Record only that access was created or reset. Do not put passwords or reset
   links in repo docs.

Current BNA-side task-manager access for Rabbi Scheller was handled separately
through scoped Operations access and should not be confused with the One Time
production backend/admin login.

## 7. Existing Billing / Payment Links

`one-time-app` has no real billing implementation.

`one-time-one-time` is Stripe-oriented. It includes checkout/subscription
routes, Stripe client code, subscription status, and admin refund/cancel/trial
tools. Green Invoice was not found in the audited source. No BNA preview route
should activate checkout until provider, pricing, refund, and subscription
anchor decisions are approved.

## 8. Resend / Email Usage

`one-time-app` has no Resend/email implementation.

`one-time-one-time` has `server/resendClient.ts`, email templates, password
reset/new-password email, and bulk email/admin messaging flows. Sender domain,
approval gates, unsubscribe/compliance, and template copy need review before
reuse.

## 9. Analytics / Tracking Usage

`one-time-app` has no meaningful analytics system.

`one-time-one-time` has an `activity_events` style analytics model, admin
analytics pages, event tracking hooks, user/content analytics, summaries, and
retention-style reporting.

## 10. Video Library / Backend

`one-time-app` has content player UI and sample media browsing only.

`one-time-one-time` has the strongest reusable video-library foundation:
categories, videos, uploads/finalize flow, streaming routes, thumbnail support,
Vimeo import/sync/fix/export, documents, albums, RSS audio, favorites, likes,
progress, related videos, and continue-watching behavior.

## 11. Database / Storage

`one-time-app` has a basic users schema and demo/sample content.

`one-time-one-time` has a substantial PostgreSQL/Drizzle schema: users,
sessions, subscriptions, phone numbers, media, documents, albums, comments,
questions, watch progress, analytics, messages, banners, parental controls,
hotline/audio records, and related engagement tables. Media/object storage
strategy needs cleanup before production reuse.

## 12. Admin Dashboard / Back Office

`one-time-app` has no real admin back office.

`one-time-one-time` has a broad admin dashboard for subscribers, videos,
analytics, comments, questions, documents, albums, audio/hotline, settings,
messages, banners, whitelist, RSS, and live meeting. This should be treated as
an external One Time admin surface until a deliberate BNA integration plan is
approved.

## 13. Content / Video Thumbnail Support

`one-time-app` has UI-level content cards and playback references.

`one-time-one-time` includes video thumbnails, custom thumbnail upload/admin
screens, thumbnail generation helper code, Vimeo thumbnail/embed handling, and
content library display concepts that can inform BNA/One Time integration.

## 14. What BNA Should Reuse

- Video library schema ideas and thumbnail/media workflow lessons.
- Vimeo import/embed/thumbnail lessons after security hardening.
- Resend template structure after sender/domain review.
- Analytics event model and admin reporting concepts.
- Customer/member lifecycle concepts.
- Admin media tooling concepts.
- Comments/questions only as a starting point after moderation is added.

## 15. What BNA Should Not Reuse

- Demo auth from `one-time-app`.
- Hard-coded setup/bootstrap route behavior from `one-time-one-time`.
- Debug DB/user/login endpoints in production.
- Broad CORS behavior without origin review.
- Query-token phone export patterns without stronger controls.
- Committed generated media caches as source-of-truth storage.
- Comments/questions as a child forum without AI moderation and human review.
- Any live billing flow before provider/pricing/policy approval.
- Any merged identity model that mixes BNA school students with One Time
  members/subscribers.

## 16. Security Risks

- Setup/bootstrap logic exists and includes a hard-coded secret literal. The
  value is intentionally not reproduced here.
- Debug/admin/helper routes need production review.
- Broad CORS behavior needs tightening.
- Phone export routes depend on query-token style access.
- Media caches/uploads are present in source and need storage hygiene.
- Logging should be reviewed for secrets and private media details.
- Comments/questions lack AI moderation and child-safety review states.
- Billing/admin actions need strong audit logs before reuse.

## 17. Missing Credentials / Access

Needed for a complete live/backend audit:

- Current One Time admin URL and deployment target.
- Shloimie/admin login or owner-approved reset path.
- Rabbi/member test login.
- Production/staging database URL.
- Stripe dashboard or connector access if Stripe remains active.
- Green Invoice dashboard/API access if billing moves there.
- Resend account/domain/connector access.
- Vimeo account/API access.
- Phone provider access.
- Replit object storage access.

## 18. Recommended Next Architecture

Keep the products separate first:

- BNA remains the first-party operations/workspace/CRM/task/helper system.
- One Time remains a provider/project workspace with separate member, media,
  billing, and admin concepts.
- Integrate through scoped BNA APIs and typed actions, not by merging databases
  blindly.
- Use the BNA preview route only for approved preview work. Do not replace the
  live One Time site or activate checkout without Shloimie approval.
- Build a cleaned One Time backend path only after auth, billing, moderation,
  storage, and live admin access decisions are settled.
