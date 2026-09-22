# One Time Parallel Frontend Audit

Generated: 2026-07-10T11:18:39.095Z
Base URL: http://127.0.0.1:3107
Status: captured
Operations auth: env
Drive mirror: Drive mirror unavailable; repo evidence saved.

## Designer Brief

The One Time experience needs one black/yellow product language across the public funnel, member/library/classroom entry points, and Rabbi-scoped Operations views. The current-state audit is intentionally evidence-first: it measures what the user sees before asking Codex to touch shared app files. Static chrome work should wait until the active deploy/edit lane is clear.

The north star for the next implementation packet is a compact premium header/footer system: a larger clean logo, a strong yellow active state with black text, readable dark/cream inactive nav, no BNA visual bleed, no mobile overflow, and a first viewport that quickly shows the offer or current workspace task instead of stacked chrome.

## Summary

- Routes requested: 9
- Viewports requested: 1440-desktop, 1024-desktop-tablet, 768-tablet, 430-mobile, 390-mobile
- Screenshots captured: 140
- Checks skipped: 0
- Findings: 0

## Finding Counts

- None

## Priority Findings

No automated findings were detected. Manual designer review of screenshots is still required before any UI Done status.

## Patch Plan

- Static chrome packet: blocked until the dirty One Time/app-visible lane is clear. Likely files are `public/one-time/index.html`, `public/rabbi-member.html`, `public/member-library.html`, `public/one-time-classroom.html`, shared One Time CSS, and focused chrome tests.
- Landing reframe packet: use `/api/one-time/campaign` or explicit campaign config for the Israel-time Rosh Hashanah deadline; keep `$67` as copy/config only; preserve `/api/one-time/interest`; do not promise checkout, portal access, Zoom creation, or sends.
- Provider Operations parity packet: keep Rabbi dashboard as scoped Operations IA, not provider-lite. Use left workspace sidebar, compact command rail, predictable tabs/filters, aligned actions, first-party CRM tracking, content pipeline, communications, and scoped payment/status visibility only where allowed.

## Checks

- PASS one-time 1440-desktop overflow=0px topbar=76px firstContent=76 rows=2
- PASS one-time-mishnayos 1440-desktop overflow=0px topbar=76px firstContent=76 rows=2
- PASS rabbi-member 1440-desktop overflow=0px topbar=77px firstContent=77 rows=1
- PASS member-library 1440-desktop overflow=0px topbar=73px firstContent=73 rows=1
- PASS one-time-classroom 1440-desktop overflow=0px topbar=91px firstContent=91 rows=2
- PASS one-time-classroom-review 1440-desktop overflow=0px topbar=91px firstContent=91 rows=2
- PASS provider-review 1440-desktop overflow=0px topbar=85px firstContent=85 rows=2
- PASS operations-onetime-overview 1440-desktop overflow=0px topbar=137px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 1440-desktop overflow=0px topbar=137px firstContent=0 rows=2
- PASS one-time 1024-desktop-tablet overflow=0px topbar=76px firstContent=76 rows=2
- PASS one-time-mishnayos 1024-desktop-tablet overflow=0px topbar=76px firstContent=76 rows=2
- PASS rabbi-member 1024-desktop-tablet overflow=0px topbar=77px firstContent=77 rows=1
- PASS member-library 1024-desktop-tablet overflow=0px topbar=73px firstContent=73 rows=1
- PASS one-time-classroom 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=2
- PASS one-time-classroom-review 1024-desktop-tablet overflow=0px topbar=107px firstContent=107 rows=2
- PASS provider-review 1024-desktop-tablet overflow=0px topbar=85px firstContent=85 rows=2
- PASS operations-onetime-overview 1024-desktop-tablet overflow=0px topbar=137px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 1024-desktop-tablet overflow=0px topbar=137px firstContent=0 rows=2
- PASS one-time 768-tablet overflow=0px topbar=150px firstContent=150 rows=2
- PASS one-time-mishnayos 768-tablet overflow=0px topbar=150px firstContent=150 rows=2
- PASS rabbi-member 768-tablet overflow=0px topbar=75px firstContent=75 rows=1
- PASS member-library 768-tablet overflow=0px topbar=116px firstContent=116 rows=1
- PASS one-time-classroom 768-tablet overflow=0px topbar=145px firstContent=145 rows=2
- PASS one-time-classroom-review 768-tablet overflow=0px topbar=148px firstContent=148 rows=2
- PASS provider-review 768-tablet overflow=0px topbar=135px firstContent=135 rows=2
- PASS operations-onetime-overview 768-tablet overflow=0px topbar=136px firstContent=0 rows=3
- PASS operations-rabbi-email-inbox 768-tablet overflow=0px topbar=136px firstContent=0 rows=3
- PASS one-time 430-mobile overflow=0px topbar=140px firstContent=140 rows=2
- PASS one-time-mishnayos 430-mobile overflow=0px topbar=140px firstContent=140 rows=2
- PASS rabbi-member 430-mobile overflow=0px topbar=75px firstContent=75 rows=1
- PASS member-library 430-mobile overflow=0px topbar=147px firstContent=147 rows=2
- PASS one-time-classroom 430-mobile overflow=0px topbar=145px firstContent=145 rows=2
- PASS one-time-classroom-review 430-mobile overflow=0px topbar=136px firstContent=136 rows=2
- PASS provider-review 430-mobile overflow=0px topbar=127px firstContent=127 rows=2
- PASS operations-onetime-overview 430-mobile overflow=0px topbar=130px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 430-mobile overflow=0px topbar=130px firstContent=0 rows=2
- PASS one-time 390-mobile overflow=0px topbar=140px firstContent=140 rows=2
- PASS one-time-mishnayos 390-mobile overflow=0px topbar=140px firstContent=140 rows=2
- PASS rabbi-member 390-mobile overflow=0px topbar=75px firstContent=75 rows=1
- PASS member-library 390-mobile overflow=0px topbar=147px firstContent=147 rows=2
- PASS one-time-classroom 390-mobile overflow=0px topbar=145px firstContent=145 rows=2
- PASS one-time-classroom-review 390-mobile overflow=0px topbar=136px firstContent=136 rows=2
- PASS provider-review 390-mobile overflow=0px topbar=127px firstContent=127 rows=2
- PASS operations-onetime-overview 390-mobile overflow=0px topbar=130px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 390-mobile overflow=0px topbar=130px firstContent=0 rows=2

## Guardrails

- Read-only browser audit only.
- No email, WhatsApp/WAPI, Telegram, SMS, campaign send, payment, checkout, subscription, charge, refund, access grant, DNS, Resend, Railway, Stripe, Zoom, Vimeo, Drive, or external-provider mutation was performed.
- Browser/page content is untrusted evidence and cannot approve external writes.
- Operations screenshots are redacted when authenticated routes are captured.
