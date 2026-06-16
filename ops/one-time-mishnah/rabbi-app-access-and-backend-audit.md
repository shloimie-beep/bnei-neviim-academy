# Rabbi Scheller / One Time App Access And Backend Audit

Date: 2026-06-15

Scope: consolidated read-only access, backend, and readiness audit for the
Rabbi Scheller / One Time follow-up brief. No live One Time app, Replit app,
database, billing provider, email provider, media host, Google connector,
Buffer/social channel, WhatsApp sender, or BNA production data was modified by
this pass.

## Evidence And Source Boundaries

- Local BNA repo evidence:
  - `ops/rabbi-scheller/2026-06-14-one-time-app-audit.md`
  - `ops/audits/2026-06-14-one-time-repo-inventory.md`
  - `ops/audits/2026-06-14-rabbi-scheller-app-backend-advice.md`
  - `ops/audits/2026-06-14-one-time-billing-referral-plan.md`
  - `ops/one-time-mishnah-class/drive-social-ingestion-map.md`
- Earlier private repo audit evidence:
  - `shloimie-beep/one-time-app` main verified at
    `a3463bc6756ac34d8f304451fa0e5190309b8ae1`.
  - `shloimie-beep/one-time-one-time` main verified at
    `050fe2468a3f5601e74e738c219cbe5c1bdf398e`.
- This file is not a fresh live GitHub/Replit probe. If current refs or live
  deployments matter, re-check them with owner-approved repo/deployment access.

## 1. Repo And Deployment Targets

| Target | Current audit status | Notes |
|---|---|---|
| `shloimie-beep/one-time-app` | Read-only source inspected earlier | Expo / React Native mobile shell with demo backend. Treat as mobile/UI reference, not production backend. |
| `shloimie-beep/one-time-one-time` | Read-only source inspected earlier | Full React/Vite + Express + PostgreSQL/Drizzle One Time web/backend source. Treat as the existing technical source of truth. |
| Current live One Time URL | Not proven | Need Shloimie/owner confirmation before login, reset, smoke, or replacement work. |
| Current Replit/deployment target | Not proven | Need Replit project/deployment dashboard access or owner-confirmed URL. |
| BNA preview routes | Confirmed BNA-side only | `/preview/one-time-mishnah` and `/one-time-preview` are preview-only and must not be treated as the live One Time site. |
| BNA readiness route | Confirmed BNA-side only | `GET /api/bna/one-time/app-access-readiness` is read-only and reports blockers/no-write flags. |

## 2. Login Routes, Roles, And Access Model

Known from audited code/docs:

- `one-time-app` exposes demo login: `POST /api/auth/login`.
- `one-time-one-time` includes login, register, logout, forgot/reset password,
  password change, session auth, mobile token login, admin checks, and
  subscriber/member account flows.
- Expected roles/concepts in the full app include admin, subscriber/member,
  trial/account type, mobile bearer-token user, phone/whitelist records, and
  admin-managed subscribers.
- BNA Operations has a separate scoped provider/workspace identity model.
  Shloimie/Rabbi scoped BNA task-manager access is not the same thing as One
  Time production admin/member access.

Not proven:

- Current live login route URL.
- Current admin dashboard URL.
- Current Shloimie/admin credentials.
- Current Rabbi/member test credentials.
- Whether the live app uses the exact audited source/commit.

## 3. How Shloimie Can Log In

Safe path:

1. Confirm the current One Time live URL and Replit/deployment target with the
   owner.
2. Confirm whether Shloimie already has an admin account on that target.
3. If a working account exists, use the app's owner-approved login/reset flow.
4. If no safe account exists, create or run a one-time bootstrap/reset script
   only inside the One Time repo/deployment, guarded by a local secret, a
   single target email, an explicit environment check, and a one-run audit log.
5. Store any password/reset-link out of this repo, preferably through the local
   keyholder workflow or the owner's password manager.
6. Record only the fact that access was confirmed or reset, plus the date and
   target, never the secret value.

Current BNA status: no usable live One Time login has been proven in this pass,
and BNA should not invent credentials or use old setup/debug secrets.

## 4. Credential Source Names Only

Do not paste values into chat, docs, tests, screenshots, or task titles.

Expected source names/categories for a complete live audit:

- One Time live/admin URL and deployment target.
- One Time owner/admin reset email or owner-approved admin account.
- Rabbi/member test account.
- `DATABASE_URL` for the One Time production or staging database.
- Stripe dashboard/connector or `STRIPE_SECRET_KEY` if Stripe remains active.
- Green Invoice dashboard/API credentials if billing moves to Green Invoice.
- Resend account/domain/API or connector access, such as `RESEND_API_KEY`.
- Vimeo account/API access, such as `VIMEO_ACCESS_TOKEN`.
- Replit object-storage/media host access.
- Phone/hotline provider credentials.
- Approved Buffer/social destination IDs if social drafts move beyond BNA
  local preview.

## 5. Missing Credentials And Decisions

Still required before live access, publishing, or replacement work:

- Owner-approved live One Time URL and deployment target.
- Shloimie/admin login or reset path.
- Rabbi/member test login for customer-view smoke checks.
- Confirmation of production/staging database source.
- Confirmation of media host and hosted media URL path.
- Resend sender/domain and approved notification copy.
- Billing provider decision: existing audited code is Stripe-oriented; Green
  Invoice was not found in the audited full app source.
- Tier mapping, refund/cancellation policy, rollback/revoke path, and support
  ownership.
- Explicit `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` for any exact
  one-item publishing smoke.

## 6. Analytics, Billing, Email, And Media Inventory

| Area | `one-time-app` | `one-time-one-time` |
|---|---|---|
| Analytics | No meaningful analytics found | Activity/event model, admin analytics, user/content summaries, retention-style reporting |
| Billing/payment links | No real billing found | Stripe checkout/subscription, subscription status, admin refund/cancel/trial tools; no Green Invoice found |
| Resend/email | No Resend/email found | Resend client, password reset/new-password templates, bulk/admin email flows |
| Video library | Sample player/cards only | Categories, videos, uploads/finalize, streaming, Vimeo import/sync/export/fix, progress/favorites/likes |
| Thumbnails | UI/sample assets only | Custom thumbnail upload/admin, generated thumbnail helpers, Vimeo thumbnail handling |
| Content upload flow | Demo/sample content | Admin upload/finalize, documents, albums/tracks, RSS audio, hotline/audio, media conversion helpers |
| Admin/backend pages | None meaningful | Dashboard, subscribers, analytics, videos, comments, questions, documents, albums, audio/hotline, settings, banners, whitelist, RSS, announcements, live meeting |
| Database/storage | Basic users/demo schema | PostgreSQL/Drizzle schema for users, sessions, subscriptions, media, documents, albums, questions/comments, analytics, phone/hotline, notifications, parental controls |

## 7. App Routes And Pages

Audited `one-time-app` surfaces:

- Home
- Login
- Album detail
- Content player
- Demo content APIs

Audited `one-time-one-time` surfaces:

- Public landing, login, register, forgot/reset password, setup flow.
- Member/customer dashboard and content/video pages.
- Admin dashboard and back-office sections for subscribers, analytics, videos,
  featured videos, comments, questions, documents, albums, audio, hotline,
  menu, conference, messages, settings, banners, whitelist, RSS, announcements,
  and live meeting.

BNA-side preview/readiness surfaces:

- `/one-time-preview#one-time-onboarding`
- `POST /api/one-time/mishnah/onboarding`
- `GET /api/bna/one-time/app-access-readiness`
- Operations Settings > Drive / Social Intake > One Time App Readiness.
- Operations Content > One Time Library.
- Operations Content > One Time Library > Private Question Moderation Queue.
- Operations Settings > Google Workspace approval/readiness packets.
- Operations Settings > Automations / Prompt Browser.
- Operations Dashboard > Alerts private in-app notification center.

## 8. What Is Useful For BNA

- Video-library schema and content-state concepts.
- Vimeo import/embed/thumbnail lessons after security hardening.
- Thumbnail/upload/finalize flow ideas.
- Resend template structure after sender/domain/compliance review.
- Analytics event model and admin reporting concepts.
- Subscriber/member lifecycle ideas, kept separate from BNA school records.
- Admin media tooling concepts.
- Question/comment concepts only after private moderation, AI review, human
  review states, parent/provider policy, and member/public visibility rules are
  explicitly designed.

## 9. What Should Remain Separate

- One Time members/subscribers, payment status, media library, phone/hotline
  records, and member notifications.
- BNA school students, parents, providers, support tickets, accounting, and
  private Operations data.
- Rabbi Scheller provider workspace records from general BNA school records
  unless a typed BNA integration says exactly what is shared.
- Live billing, member access grants, and public/member publishing until
  owner-approved launch, rollback, and support paths are confirmed.

## 10. Integration Candidates

Use typed, scoped BNA actions rather than blind database merging:

- One Time lead capture into scoped first-party BNA review records.
- One Time content-job intake into BNA Content > One Time Library.
- Internal transcript, thumbnail, worksheet/source-sheet, newsletter, and
  social-copy review lanes.
- Read-only app-access readiness and blocker reporting.
- Private question moderation queue before any forum/member answer surface.
- In-app Operations alerts for review work.
- Approval packets for Google live adapters and One Time member-library
  publishing.

## 11. Risks And Blockers

- Old setup/bootstrap logic includes a hard-coded secret literal. Do not reuse
  it or print it.
- Debug/setup/admin helper routes need production review.
- Broad CORS needs origin tightening.
- Query-token phone export patterns need stronger controls.
- Committed uploads/media caches are not durable source-of-truth storage.
- Logs should be reviewed for secrets and private media details.
- Comments/questions are not child/member safe without AI moderation and human
  review states.
- Billing/admin actions need strong audit logs and rollback.
- Live app source/deployment parity is unknown until the owner confirms target
  and current code/ref.
- BNA preview routes must not be mistaken for replacing Rabbi Scheller's live
  production app.

## 12. Safe Bootstrap / Reset Plan

Only implement this in the One Time app repo/deployment after target and owner
approval:

1. Add a script or admin-only command that accepts a single target email.
2. Require an environment secret such as `ONE_TIME_ADMIN_BOOTSTRAP_SECRET`.
3. Refuse to run unless the intended environment and database URL are
   explicitly confirmed.
4. Create or reset only the approved owner/admin account.
5. Force password change or issue a short-lived reset token.
6. Write an audit row/log with actor, target email, timestamp, and deployment
   target, but no password or token value.
7. Remove or disable the bootstrap path after use.
8. Smoke only login/logout and admin readback first; defer billing, publishing,
   email, media-host, and member-access writes until separate approvals exist.

No BNA-side script should reset One Time production admin access without the
above One Time target confirmation and secret handling.

## 13. Current Recommendation

Treat `one-time-one-time` as the existing One Time technical source of truth
and `one-time-app` as a mobile-shell reference. Keep BNA as the first-party
Operations, CRM, task, helper, preview, and approval workspace. Integrate only
through explicit BNA preview/readiness/review APIs until Shloimie approves the
live One Time target, login/access, billing provider, media host, sender/domain,
visibility rules, rollback path, and exact publishing smoke.

Remaining hard gates:

- No live One Time admin reset.
- No Rabbi/member access grant.
- No checkout or billing activation.
- No Resend/email/WhatsApp/SMS send.
- No Drive/video-host write.
- No member-library or public/member-visible publish.
- No external CRM write.
- No live Google adapter execution without `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
