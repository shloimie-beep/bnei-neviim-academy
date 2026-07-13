# One Time Landing Image Addendum - 2026-07-13

## Scope

This is a narrow addendum to the completed One Time public landing rebuild:
`tasks-pending/2026-07-10-onetime-public-landing-production-rebuild.md`.

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`.

Primary route: `/one-time`.

## Requirements

| ID | Requirement | Source | Status | Evidence |
|---|---|---|---|---|
| REQ-20260713-921 | Run collision/source-of-truth checks before editing the landing image lane. | RAW-20260713-005 | Done - live verified | `npm run chatgpt:dropoff:tower`; `git diff -- public/one-time/index.html public/assets/one-time`; context reads listed in raw record |
| REQ-20260713-922 | Replace the Clarity card placeholder with the operator-selected `14.37.21` classroom image as an optimized WebP asset. | RAW-20260713-005 | Done - live verified | `public/assets/one-time/outcomes/clarity-class.webp`; `public/one-time/index.html`; manifest; `after-gain-1440.png`; `after-gain-anchor-390.png`; deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831` |
| REQ-20260713-923 | Replace the Excitement for learning Torah card placeholder with the operator-selected `14.37.22` classroom image using a moderate crop/zoom. | RAW-20260713-005 | Done - live verified | `public/assets/one-time/outcomes/excitement-learning-torah.webp`; `public/one-time/index.html`; manifest; crop `object-position: 50% 54%` and `scale(1.1)`; `after-gain-1440.png`; deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831` |
| REQ-20260713-924 | Add `Norfolk, Virginia.jpg` as the dark atmospheric background for the Who It's For section. | RAW-20260713-005 | Done - live verified | Source supplied at `C:\Users\User\Downloads\Norfolk, Virginia.jpg`; imported as `public/assets/one-time/backgrounds/who-its-for-norfolk-virginia.webp`; `after-who-1440.png`; `after-who-430.png`; deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`. |
| REQ-20260713-925 | Use the operator-supplied `Lakewood 3.jpg` image for the Accomplishment card after confirming no prior active assignment existed. | RAW-20260713-005; operator follow-up 2026-07-13 | Done - live verified | Source supplied at `C:\Users\User\Downloads\Lakewood 3.jpg`; imported as `public/assets/one-time/outcomes/accomplishment-lakewood-class.webp`; `after-gain-1440.png`; `after-gain-390.png`; deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`. |
| REQ-20260713-926 | Capture before/after screenshots, run focused landing checks, commit/push the landing slice, deploy the One Time landing, and live-smoke the lead/signup path after authorization. | RAW-20260713-005; operator follow-up 2026-07-13 | Done - live verified | `ops/ui-audits/2026-07-13-onetime-landing-image-addendum/`; focused tests 50/50; local WhatsApp smoke; Railway deployment `2bdb5c35-df6b-4fc6-8d33-1eecff1eff82`; initial live smoke reports `ops/live-smokes/2026-07-13T13-38-48-323Z-rabbi-onetime-landing-smoke.md` and `ops/live-smokes/2026-07-13T13-38-48-485Z-one-time-interest-dry-run-live-smoke.md`; current live descendant smoke reports `ops/live-smokes/2026-07-13T13-43-30-683Z-rabbi-onetime-landing-smoke.md` and `ops/live-smokes/2026-07-13T13-43-30-703Z-one-time-interest-dry-run-live-smoke.md`; landing release SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`; current live SHA `7ec31290c08ede0957dbd60b2c3253979253feba` |
| REQ-20260713-927 | Use the operator-supplied `14.37.22.jpeg` classroom image as a faded, masked hero background using the current One Time black/yellow/ice-blue visual language. | RAW-20260713-005; operator follow-up 2026-07-13 | Done - live verified | Source supplied at `C:\Users\User\Downloads\WhatsApp Image 2026-07-13 at 14.37.22.jpeg`; imported as `public/assets/one-time/hero/hero-classroom-background.webp`; `after-hero-toolbar-1440.png`; `after-hero-toolbar-390.png`; deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`. |
| REQ-20260713-928 | Reconcile remaining landing text and top-toolbar consistency before launch traffic, including black One Time lockup treatment and drawer-based toolbar navigation. | RAW-20260713-005; RAW-20260713-001; RAW-20260712-005 | Done - live verified | `public/one-time/index.html`; `public/one-time/signup.html`; `ops/action-registry.json`; black lockup, drawer menu visible, desktop nav hidden; explicit landing copy rechecked against RAW-20260712-005; focused tests 50/50; live route smoke passed on deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`. |

## Deployment

The operator explicitly redirected the active goal to landing-first deployment on 2026-07-13.

- Commit pushed: `dc540e121a9bce02a8d0e738ec4e99a9c8edc831` (`Polish One Time landing imagery`).
- Railway target: One Time production `one-time-web`.
- Railway deployment: `2bdb5c35-df6b-4fc6-8d33-1eecff1eff82`, status `SUCCESS`, initially served landing release SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`.
- Live URL: `https://join.onetimeonetime.com`.
- Current live deploy-info after the parallel One Time lane redeployed a descendant commit: `commit_sha=7ec31290c08ede0957dbd60b2c3253979253feba`, `target_app=one-time`, `target_service=one-time-web`. `dc540e121a9bce02a8d0e738ec4e99a9c8edc831` is an ancestor of this live SHA, so the landing release remains included.
- Live smokes passed against both the landing release SHA and the current live descendant SHA: `npm run app:smoke:rabbi-onetime-landing`, `npm run app:smoke:onetime-separate-instance`, and `npm run app:smoke:one-time-interest-dry-run`.
- Public WhatsApp readiness readback passed with `configured=true`, scoped workspace/project, hidden full number, `no_whatsapp_sent=true`, and `external_write_performed=false`.
