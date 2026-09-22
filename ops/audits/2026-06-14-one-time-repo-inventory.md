# One Time Repo Inventory - 2026-06-14

Source repos verified:

- `shloimie-beep/one-time-app`, private GitHub repo, `main` at `a3463bc6756ac34d8f304451fa0e5190309b8ae1`.
- `shloimie-beep/one-time-one-time`, private GitHub repo, `main` at `050fe2468a3f5601e74e738c219cbe5c1bdf398e`.

Temporary audit clones were read from `C:\Users\User\AppData\Local\Temp\bna-one-time-audit-20260614-160251`. No One Time production behavior was modified.

## one-time-app

Type: Expo / React Native mobile app with a small Express demo backend.

Runtime:

- `package.json` name `my-app`.
- Main entry `client/index.js`.
- Expo 54, React 19, React Native 0.81, React Navigation, TanStack Query.
- Backend scripts use `tsx server/index.ts`, Express 5, Drizzle, `pg`.
- `app.json` identifies app name `OneTimeOneTime`, slug `onetimeonetime`, bundle/package `com.onetimeonetime.app`.

Frontend:

- Screens: `HomeScreen`, `LoginScreen`, `AlbumDetailScreen`, `ContentPlayerScreen`.
- Components: themed cards, inputs, settings modal, content card, zoomable image.
- Client API helpers under `client/lib/api.ts`, `client/lib/auth.ts`, `client/lib/content.ts`.
- Assets include app icons, empty-state images, default avatar, logo, screenshots, and design guidelines.

Backend:

- `server/routes.ts` exposes only:
  - `POST /api/auth/login`
  - `GET /api/content/home`
  - `GET /api/content/sections`
  - `GET /api/content/favorites`
  - `GET /api/content/:id`
- Current auth is demo-style in-memory email/password token logic.
- Content data is hard-coded sample content with categories such as Stories, Mishnayos, One Daf One Daf, Just Kidding Podcast, and Documents.

Database/schema:

- `shared/schema.ts` only defines a basic `users` table with `username` and `password`.
- Drizzle config references `DATABASE_URL`, but the current route file does not use a real content database.

Billing/payment:

- No Stripe, Green Invoice, checkout, subscription, invoice, or webhook implementation found.

Email/Resend:

- No Resend/email implementation found.

Analytics:

- No analytics/event model found.

Video library:

- Mobile UI and sample content support video/audio/photo playback.
- Real media library APIs are not present here.

Login/auth:

- Demo login only. Not production-ready.

Moderation/forum/questions:

- No forum, student question queue, comments, moderation states, or gamification found.

Reuse recommendation:

- Reuse: Expo mobile shell patterns, content player UI, simple category browsing, app assets.
- Keep separate: Mobile build tooling and bundle identity.
- Archive or replace: Demo auth, hard-coded sample content, thin backend.

Risks:

- Demo credentials and sample data must not become production auth.
- No billing, email, moderation, real media storage, or access control here.

## one-time-one-time

Type: Full React/Vite web app plus Express backend, PostgreSQL/Drizzle schema, admin dashboard, customer portal, media library, hotline/audio tooling, payments, email, analytics, and mobile/API support.

Runtime:

- `package.json` name `rest-express`.
- Vite/React 18 frontend with Wouter, Radix UI, Tailwind, Recharts, DnD, Uppy upload tooling.
- Express 4 backend with sessions, Passport local, PostgreSQL via `pg`, Drizzle ORM, Stripe, Resend, Vimeo, Voitex, Telnyx-style phone routes, Replit object storage.
- Build script compiles frontend/backend to `dist`.

Frontend:

- Public/member pages: landing, login, register, dashboard, setup, forgot/reset password, Gadlus HaAdam.
- Admin pages: dashboard, subscribers, analytics, videos, featured videos, comments, questions, documents, albums, audio, hotline, menu, conference, messages, settings, banners, whitelist, RSS feed, announcement, live meeting.
- UI supports video library, admin uploads, content management, subscriber management, analytics, messages, and parental controls.

Backend/API:

- Auth: register, login, logout, session user, mobile login/token, password reset/change, admin user management.
- Billing: Stripe publishable key, checkout creation, plus checkout, subscription status, admin refund/cancel/trial/account-type tools.
- Email: forgot password, new password, bulk email, Resend client.
- Media: admin videos, video upload/finalize, thumbnails, Vimeo import/export/fix/sync, MP3 download, hotline upload, RSS audio, documents/PDF pages, albums/tracks.
- Portal APIs: videos, viewed status, trending, stream, documents, albums, comments, questions, likes, favorites, progress, notifications, preferences.
- Admin APIs: subscribers, analytics, call stats, whitelisted phone/email records, trial numbers, conference controls, export/import.
- Phone/hotline: phone-list endpoints, Telnyx-style IVR routes, Voitex webhook/client/service.
- Parent/safety adjacent: parental controls, watch-time logs, direct messages.

Database/schema:

- `users` with email/password, role, account type, Stripe IDs, subscription status, trial tracking, notification prefs.
- `phone_numbers`, `trial_phone_numbers`, whitelisted phone/email tables.
- Audio/hotline tables: `audio_files`, `menu_options`, `system_settings`, `conference_sessions`, participants, unmute requests, `call_logs`.
- Media tables: `video_categories`, `videos`, `documents`, `albums`, `album_tracks`, `rss_folders`, `rss_audio_items`, featured videos, dashboard banners.
- Engagement tables: video views, favorites, likes, progress, watch time logs, notifications, activity events.
- Interaction tables: direct messages, video comments, video questions.
- Safety table: parental controls with PIN hash.
- Session table: `user_sessions`.

Billing/payment pieces:

- Stripe client supports Replit connector secrets and `STRIPE_SECRET_KEY` fallback.
- Checkout endpoints exist for standard and Plus account paths.
- Admin refund/cancel/trial/subscriber-management endpoints exist.
- Green Invoice was not found in this repo.

Resend/email pieces:

- `server/resendClient.ts` reads the Replit Resend connector.
- `server/emailTemplates.ts` provides password reset, new password, and bulk email templates.
- Bulk email endpoint exists for admin subscribers.

Analytics pieces:

- `activity_events` table plus admin analytics endpoints for events, user analytics, content analytics, summary, retention, and broad dashboard metrics.
- Client has `use-track-event`.

Video library pieces:

- Strongest reusable piece in the export.
- Video categories, upload/finalize, thumbnail generation, custom thumbnail upload, Vimeo sync/import/export/fix flows, local/object-storage media handling, streaming routes, favorites, likes, progress, continue watching, related videos.
- `vimeo_embed_urls_export.sql` and Vimeo domain whitelist scripts are present.

Login/auth pieces:

- Session auth plus mobile bearer token flow.
- Password reset and admin account tooling exist.
- Needs security review before reuse because debug/setup routes and broad CORS exist.

Moderation/forum/questions:

- Video comments and admin comment review list exist.
- Video study questions exist.
- No AI moderation pipeline, student-safety state machine, points ledger, or human-review lock workflow was found.

No-GHL check:

- No active GHL, GoHighLevel, LeadConnector, `GHL_*`, or `leadconnectorhq` runtime was found in the audited source.
- The only noisy search output was bundled/minified PDF worker text plus unrelated Voitex content, not an active GHL integration.

Dangerous or secret-like findings:

- A setup/init admin route contains a hard-coded setup secret literal. Do not print it, reuse it, or deploy it unchanged.
- Debug DB/user/login routes are present and should not remain public in production.
- Phone-list endpoints depend on query tokens and expose subscriber phone exports when configured.
- `CORS origin: true` is broad and should be tightened before production.
- Large `uploads/` and `mp3_cache/` artifacts are committed; long-term media should move to storage with clean export/import scripts.
- Vimeo and media helpers log operational details aggressively; review logs before production use.
- Comment/question features lack AI moderation and child-safety review states.

Credentials needed for deeper inspection:

- Admin login for the One Time web app.
- Rabbi/member login for customer view.
- Database URL for the One Time production/staging database.
- Stripe dashboard or connector access.
- Resend account/domain/connector access.
- Vimeo account/API access.
- Voitex/Telnyx or phone-provider access.
- Replit object storage access.

## Reuse / Separation

Reuse in BNA or a cleaned One Time workspace:

- One Time video-library schema concepts.
- Vimeo import/embed/thumbnail lessons after security hardening.
- Resend template structure after sender/domain review.
- Analytics event model and admin reporting ideas.
- Subscriber/member lifecycle ideas, but not blindly.
- Comments/questions as a starting point only after moderation is added.

Keep separate:

- One Time member media app and public funnel should stay in the One Time workspace until product ownership is decided.
- BNA school student/parent records must not merge with One Time member/subscriber records.
- Rabbi Scheller provider tasks should stay scoped to the Rabbi/One Time provider workspace.

Archive or replace:

- `one-time-app` demo backend/auth.
- Any committed generated media caches that are not needed as source records.
- Debug/setup/admin bootstrap routes before any live deployment.

Credentials/blockers:

- Backend/live URL and current deployment target were not proven from code alone.
- Production database and admin credentials are needed for a live data audit.
- Billing provider decision is open: existing One Time repo uses Stripe; BNA prompt asks about Green Invoice.
