# Rabbi Scheller / One Time App Backend Advice - 2026-06-14

## Executive Recommendation

Use `shloimie-beep/one-time-one-time` as the technical source of truth for the existing One Time web/backend product. Treat `shloimie-beep/one-time-app` as a mobile companion prototype and UI reference, not as the current backend.

Do not merge either repo into BNA yet. Keep One Time records, members, media, payments, Rabbi tasks, and provider workspace data scoped separately until the ownership, billing, login, and moderation decisions are approved.

Build previews inside BNA only when they are clearly preview-only, like `/preview/one-time-mishnah`. Do not replace Rabbi Scheller's live site or checkout path without approval.

## What Exists

### one-time-app

- App type: Expo / React Native mobile app.
- Frontend: mobile screens for home, login, albums, and content playback.
- Backend: small Express demo API with login and sample content endpoints.
- Database: basic Drizzle `users` table only.
- Auth/login: demo in-memory login in `server/routes.ts`.
- Admin/backend: none beyond the demo server.
- Analytics: none found.
- Billing: none found.
- Resend/email: none found.
- Payment links/subscriptions: none found.
- Video library: UI/client shape exists, but backend content is sample/hard-coded.
- Forum/comments/questions/moderation: none found.
- Deployment/live URL: not proven from code in this pass.

### one-time-one-time

- App type: full React/Vite web app with Express backend.
- Frontend: public landing, login/register, customer dashboard, admin dashboard, video library, subscribers, analytics, comments, questions, documents, albums, audio/hotline, settings, banners, whitelist, RSS, messages, and live meeting pages.
- Backend: large Express route surface with session auth, mobile token auth, subscriber management, Stripe checkout, Resend email, media uploads, Vimeo tooling, Voitex/Telnyx hotline routes, analytics, comments/questions, notifications, and parental controls.
- Database: PostgreSQL/Drizzle schema with users, subscriptions, phone numbers, media, documents, albums, comments, questions, watch progress, analytics, direct messages, banners, parental controls, sessions, and more.
- Auth/login: session auth, mobile bearer tokens, password reset/change, admin role checks.
- Admin/backend: strong admin surface exists, but needs security hardening before reuse.
- Analytics: `activity_events` plus admin dashboards and summary/retention endpoints.
- Billing: Stripe checkout/subscription/admin refund/cancel tooling exists. Green Invoice was not found.
- Resend/email: Replit Resend connector client and email templates exist.
- Payment links/subscriptions: Stripe checkout flows exist for standard and Plus subscriptions.
- Video library: robust media model with categories, videos, documents, albums, RSS audio, thumbnails, Vimeo import/sync/embed/fix, progress, likes, favorites, related videos, and continue watching.
- Forum/comments/questions: video comments, admin comments, video study questions exist.
- Moderation: no AI moderation or child-safety state machine found.
- Deployment/live URL: not proven from code alone.

## What Should Be Used

Strong candidates to reuse or adapt:

- Video-library data model: categories, videos, thumbnail path, Vimeo IDs/embed URLs, media type, status, sort order.
- Vimeo lessons: upload flow, secure embed URL handling, domain whitelist, thumbnail sync, import/export repair scripts.
- Resend structure: connector-based client and email template layout.
- Analytics shape: activity event table and admin reporting concepts.
- Customer/member access concepts: subscriptions, trial state, phone numbers, whitelisted access, dashboard sessions.
- Admin media tools: video upload/finalize, thumbnail generation, document/PDF conversion, album tracks.
- Questions/comments as a seed for Rabbi question queue after adding moderation.

Use inside BNA only after mapping to BNA's first-party workspace model:

- `workspace_id` or equivalent Rabbi/One Time workspace scope.
- `role_scope` and `visible_to_roles`.
- Audit logs for every admin action.
- No BNA school/private student data inside One Time records.

## What Should Not Be Used Unchanged

Do not reuse unchanged:

- Demo auth from `one-time-app`.
- Hard-coded setup/bootstrap route in `one-time-one-time`.
- Debug DB/user/login endpoints in production.
- Broad CORS policy without origin review.
- Query-token phone list export routes without stronger controls.
- Committed `uploads/` and `mp3_cache/` artifacts as source-of-truth storage.
- Existing comments/questions as a child forum without AI moderation and human review states.
- Any Stripe billing flow if the approved provider becomes Green Invoice or another provider.
- Any duplicate user/member system that conflicts with BNA workspace identities.
- Any live deployment path without Shloimie approval.

No active GHL/GoHighLevel/LeadConnector runtime should be added. Historical or accidental references must remain archive-only.

## Credential Needs

Needed for a proper live/backend audit:

- Admin login for the One Time web app.
- Rabbi Scheller login or a test member login.
- Backend/deployment dashboard access.
- Production/staging database URL.
- Stripe dashboard or connector access, if Stripe remains relevant.
- Green Invoice dashboard/API access, if BNA is moving One Time billing there.
- Resend account/domain/API or connector access.
- Vimeo account/API access.
- Voitex/Telnyx or phone-provider access.
- Replit object storage access.
- Current live domain and deployment URL.

Do not bypass auth, scrape passwords, or paste secrets into repo docs or chat logs.

## Billing Advice

The existing One Time backend is Stripe-oriented. The current BNA prompt asks specifically about Green Invoice behavior. That means the billing decision is not just a code reuse decision.

Recommended next step:

1. Decide provider: Stripe, Green Invoice, or another subscription provider.
2. Decide billing policy: first charge, first-of-month recurring, refunds, cancellations, proration, failed payments.
3. Keep the BNA/One Time preview page checkout inactive until those decisions are approved.
4. If Green Invoice is chosen, build a first-party BNA/One Time billing adapter instead of trying to bend the old Stripe implementation directly.

## Forum / Questions Advice

The old repo has comments and video questions, but not enough safety structure for boys' live questions/comments.

Minimum safe MVP:

- `submitted`
- `ai_approved`
- `needs_human_review`
- `hidden`
- `rejected`
- `escalated`
- `user_locked_pending_review`
- `user_suspended_by_admin`

Severe content should be hidden immediately, posting temporarily locked, and escalated to Shloimie/Rabbi/admin. Do not auto-permanently ban a child without human review.

Reward quality, not volume. Avoid public leaderboards unless explicitly approved.

## Preview Recommendation

The first preview should be a simple funnel:

- Main CTA: `Join the Mishnah Shiur`.
- Secondary quiet link: `Preview the Video Library`.
- One monthly membership offer.
- ILS/USD price placeholders until approved.
- No live checkout.
- No "biggest" or "most popular" claim unless proof is confirmed.

Implemented preview route in BNA:

- `/preview/one-time-mishnah`
- `/one-time-preview`

This is only a preview. It must not replace the live Rabbi Scheller site until Shloimie approves it.

## Final Source-Of-Truth Call

- Existing web/backend source: `one-time-one-time`.
- Existing mobile shell reference: `one-time-app`.
- BNA source for workspace/task/assistant orchestration: BNA repo.
- Future direction: keep One Time as its own provider workspace and integrate carefully through first-party BNA APIs, not by collapsing all databases immediately.
