# Rabbi Scheller / One Time App Access And Backend Audit

Date: 2026-06-14

## Status

Read-only repo audit completed from local/private repo access. No Rabbi live
site was modified.

## Repos

- `shloimie-beep/one-time-app`
  - Expo / React Native mobile companion prototype.
  - Demo backend only.
  - No real billing, Resend, analytics, or production media backend found.
- `shloimie-beep/one-time-one-time`
  - Existing full web/backend source.
  - React/Vite frontend, Express backend, PostgreSQL/Drizzle schema.
  - Includes admin dashboard, customer portal, media library, analytics,
    Stripe, Resend, Vimeo, phone/hotline tooling, comments, and questions.

## Login / Access

Known from code:

- `one-time-app` has demo login route `POST /api/auth/login`.
- `one-time-one-time` has session login, register, forgot/reset password,
  mobile token login, admin checks, and subscriber/member roles.

Not proven:

- Current live URL.
- Current Replit/deployment target.
- Current admin credentials.
- Rabbi/member credentials.

Credentials needed:

- Admin login.
- Rabbi Scheller login or test member login.
- Deployment dashboard access.
- Production/staging database URL.
- Stripe/Green Invoice decision and dashboard access.
- Resend account/domain/API or connector access.
- Vimeo account/API access.
- Phone provider access.
- Object storage access.

Do not guess or print credentials.

## Existing Backend Inventory

| Area | one-time-app | one-time-one-time |
|---|---|---|
| Analytics | none found | `activity_events`, admin analytics, retention/summary endpoints |
| Billing | none found | Stripe checkout, subscription, refund/cancel tooling |
| Resend/email | none found | Resend client and templates |
| Video library | sample UI/data | categories, videos, uploads, thumbnails, Vimeo, progress |
| Thumbnails | client sample assets | custom thumbnail/upload/sync flows |
| Content upload | demo/sample | admin upload/finalize, documents, albums, RSS audio |
| Admin/backend | none | large admin dashboard and APIs |
| Forum/questions | none | comments/questions exist, no AI child-safety state machine |
| Database/storage | demo users table | PostgreSQL/Drizzle plus storage/media caches |

## Useful For BNA

- Video-library schema concepts.
- Vimeo import/embed/thumbnail lessons.
- Resend template structure.
- Analytics event model.
- Subscriber/member access ideas.
- Admin media tooling.
- Questions/comments only after moderation is added.

## Should Remain Separate

- One Time member/subscriber data.
- Rabbi media library and paid membership flow.
- Payment/subscription logic until provider and policy are approved.
- BNA school student/parent records.

## Should Integrate With BNA

- Provider workspace identity.
- Lead capture into first-party BNA pipelines.
- Tasks, tickets, decisions, notifications, and content-job handoffs.
- Preview pages under BNA until launch approval.

## Risks

- Debug/setup/bootstrap routes must be removed or locked before production.
- A setup secret literal exists in old code and must not be reused or printed.
- Broad CORS needs tightening.
- Query-token phone exports need stronger controls.
- Committed media caches are not durable source-of-truth storage.
- Questions/comments are not safe for boys without AI moderation and human
  review states.

## Recommendation

Use `one-time-one-time` as the technical source of truth for the existing
One Time web/backend product. Treat `one-time-app` as a mobile shell reference.
Keep BNA preview routes preview-only until Shloimie approves launch, billing,
login, and moderation decisions.
