# One Time Launch Readiness - 2026-06-22

Status: safe code/readiness implemented; live external actions remain blocked pending explicit operator approval.

## Public Funnel

- `/one-time` now presents a simple worldwide Mishnayos funnel.
- The public hero uses Vimeo `1158542993?h=daa31d3417`.
- CTA text is `START 30 DAYS FREE`; the form posts only to `/api/one-time/interest`.
- Legal shell pages exist at `/one-time/privacy.html` and `/one-time/terms.html`.
- The public page no longer links to TEST provider/parent/student/classroom review routes.

## Campaign Timer

- `/api/one-time/campaign` returns server time, offer key, timezone, configured start/deadline, and read-only launch state.
- If `ONE_TIME_CAMPAIGN_DEADLINE_AT` is absent, the UI shows a pending operator-decision message instead of a fake resetting timer.
- Required env keys:
  - `ONE_TIME_CAMPAIGN_START_AT`
  - `ONE_TIME_CAMPAIGN_DEADLINE_AT`
  - `ONE_TIME_CAMPAIGN_TIME_ZONE`
  - `ONE_TIME_CAMPAIGN_OFFER_KEY`

## Vimeo

- Public hero/promo: `https://player.vimeo.com/video/1158542993?h=daa31d3417`
- Member lesson sample: `https://player.vimeo.com/video/1178363755?h=282ea2577c`
- The classroom embeds the lesson iframe in-site and keeps a secondary fallback Vimeo link.
- No Vimeo upload, metadata mutation, privacy change, or publish action was performed.

## Email

- Email templates remain no-send previews until the sender/domain and audience are approved.
- The public form records first-party interest only; it does not trigger Resend, WhatsApp, or CRM sends.
- Live email is blocked by `DEC-20260622-ONE-TIME-EMAIL-SENDER`.

## Stripe

- Copy now states `$67 USD per month after a 30-day free trial`.
- No checkout session, payment link, subscription, invoice, live charge, or access grant is created.
- Live checkout is blocked by `DEC-20260622-ONE-TIME-STRIPE-LIVE-POLICY`.

## View as Rabbi

- Platform-super-admin endpoints were added:
  - `POST /api/bna/one-time/view-as-rabbi/start`
  - `GET /api/bna/one-time/view-as-rabbi/session`
  - `POST /api/bna/one-time/view-as-rabbi/end`
- Tokens are signed, short-lived, One Time scoped, and read-only.
- The provider preview shows a persistent `VIEWING AS RABBI - READ ONLY` banner and exit action.
- The preview returns Rabbi-relevant modules without write-capable secrets, live member join URLs, or external mutation.

## Verification

- `node --check server.js` passed.
- `node --test tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js tests\one-time-product-system.test.js` passed 15/15.
- `npm test` passed 1044/1044.
- `npm run watchdog:actions` passed.
- `npm run watchdog:security` passed.
- `node scripts\audit-secrets.mjs` passed with 4040 tracked paths and 0 tracked secret-risk files.
- `git diff --check` passed with Windows line-ending warnings only.
- Local `ONE_TIME_REVIEW_ONLY_NO_DB=1` server readback passed on `127.0.0.1:8099`: `/one-time` returned 200 with public Vimeo hero and no TEST review link, `/api/one-time/campaign` returned 200 with pending-deadline decision, and `/api/one-time-review/classroom` returned 200 with lesson Vimeo embed.
- `npm run bna:run:validate` failed only for the known isolated-branch/historical-evidence caveat: active run metadata expects `codex/agent-control-center-20260619`, and this stripped worktree lacks older live-smoke files.
