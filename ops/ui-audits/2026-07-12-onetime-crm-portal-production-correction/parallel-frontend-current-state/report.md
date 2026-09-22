# One Time Parallel Frontend Audit

Generated: 2026-07-12T15:01:51.107Z
Base URL: https://join.onetimeonetime.com
Status: captured
Operations auth: railway
Drive mirror: Drive mirror unavailable; repo evidence saved.

## Designer Brief

The One Time experience needs one black/yellow product language across the public funnel, member/library/classroom entry points, and Rabbi-scoped Operations views. The current-state audit is intentionally evidence-first: it measures what the user sees before asking Codex to touch shared app files. Static chrome work should wait until the active deploy/edit lane is clear.

The north star for the next implementation packet is a compact premium header/footer system: a larger clean logo, a strong yellow active state with black text, readable dark/cream inactive nav, no BNA visual bleed, no mobile overflow, and a first viewport that quickly shows the offer or current workspace task instead of stacked chrome.

## Summary

- Routes requested: 9
- Viewports requested: 1440-desktop, 1024-desktop-tablet, 768-tablet, 430-mobile, 390-mobile
- Screenshots captured: 140
- Checks skipped: 0
- Findings: 28

## Finding Counts

- VQ-A11Y-008: 4
- VQ-CRED-006: 10
- VQ-IA-006: 10
- VQ-LAYOUT-003: 14
- VQ-RESP-005: 4
- VQ-TYPE-006: 14

## Priority Findings

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time public landing / 1440-desktop

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-1440-desktop-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 1440/1867
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 1440-desktop

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-1440-desktop-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time Mishnayos public alias / 1440-desktop

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-1440-desktop-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 1440/1867
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 1440-desktop

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-1440-desktop-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped One Time overview / 1440-desktop

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/operations-onetime-overview-1440-desktop-viewport.png
- Impact: Important control text is clipped.
- Evidence: CRM 1 20/28; Classes 0 20/37; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped Rabbi email inbox / 1440-desktop

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/operations-rabbi-email-inbox-1440-desktop-viewport.png
- Impact: Important control text is clipped.
- Evidence: CRM 7 20/29; Classes 0 20/37; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time public landing / 1024-desktop-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-1024-desktop-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 1024/1867
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 1024-desktop-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-1024-desktop-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time Mishnayos public alias / 1024-desktop-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-1024-desktop-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 1024/1867
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 1024-desktop-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-1024-desktop-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped One Time overview / 1024-desktop-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/operations-onetime-overview-1024-desktop-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: CRM 1 20/28; Classes 0 20/37; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped Rabbi email inbox / 1024-desktop-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/operations-rabbi-email-inbox-1024-desktop-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: CRM 1 20/28; Classes 0 20/37; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time public landing / 768-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-768-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 768/1867
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 768-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time Mishnayos public alias / 768-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-768-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 768/1867
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 768-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Sign Up Now=42px; Open navigation=42px; ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE=36px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-430-mobile-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 430/1550
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Sign Up Now=42px; Open navigation=42px; ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE=36px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 430/1550
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Sign Up Now=42px; Open navigation=42px; ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE=36px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-390-mobile-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 390/1550
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Sign Up Now=42px; Open navigation=42px; ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE=36px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: Important control text is clipped.
- Evidence: ROSH HASHANAH SPECIAL • 61 DAYS TO ROSH HASHANAH • JOIN FREE 390/1550
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

## Patch Plan

- Static chrome packet: blocked until the dirty One Time/app-visible lane is clear. Likely files are `public/one-time/index.html`, `public/rabbi-member.html`, `public/member-library.html`, `public/one-time-classroom.html`, shared One Time CSS, and focused chrome tests.
- Landing reframe packet: use `/api/one-time/campaign` or explicit campaign config for the Israel-time Rosh Hashanah deadline; keep `$67` as copy/config only; preserve `/api/one-time/interest`; do not promise checkout, portal access, Zoom creation, or sends.
- Provider Operations parity packet: keep Rabbi dashboard as scoped Operations IA, not provider-lite. Use left workspace sidebar, compact command rail, predictable tabs/filters, aligned actions, first-party CRM tracking, content pipeline, communications, and scoped payment/status visibility only where allowed.

## Checks

- PASS one-time 1440-desktop overflow=0px topbar=125px firstContent=125 rows=1
- PASS one-time-mishnayos 1440-desktop overflow=0px topbar=125px firstContent=125 rows=1
- PASS rabbi-member 1440-desktop overflow=0px topbar=77px firstContent=77 rows=1
- PASS member-library 1440-desktop overflow=0px topbar=73px firstContent=73 rows=1
- PASS one-time-classroom 1440-desktop overflow=0px topbar=91px firstContent=91 rows=2
- PASS one-time-classroom-review 1440-desktop overflow=0px topbar=91px firstContent=91 rows=2
- PASS provider-review 1440-desktop overflow=0px topbar=85px firstContent=85 rows=2
- PASS operations-onetime-overview 1440-desktop overflow=0px topbar=137px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 1440-desktop overflow=0px topbar=137px firstContent=0 rows=2
- PASS one-time 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=1
- PASS one-time-mishnayos 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=1
- PASS rabbi-member 1024-desktop-tablet overflow=0px topbar=77px firstContent=77 rows=1
- PASS member-library 1024-desktop-tablet overflow=0px topbar=73px firstContent=73 rows=1
- PASS one-time-classroom 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=2
- PASS one-time-classroom-review 1024-desktop-tablet overflow=0px topbar=107px firstContent=107 rows=2
- PASS provider-review 1024-desktop-tablet overflow=0px topbar=85px firstContent=85 rows=2
- PASS operations-onetime-overview 1024-desktop-tablet overflow=0px topbar=137px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 1024-desktop-tablet overflow=0px topbar=137px firstContent=0 rows=2
- PASS one-time 768-tablet overflow=0px topbar=113px firstContent=113 rows=1
- PASS one-time-mishnayos 768-tablet overflow=0px topbar=113px firstContent=113 rows=1
- PASS rabbi-member 768-tablet overflow=0px topbar=75px firstContent=75 rows=1
- PASS member-library 768-tablet overflow=0px topbar=116px firstContent=116 rows=1
- PASS one-time-classroom 768-tablet overflow=0px topbar=145px firstContent=145 rows=2
- PASS one-time-classroom-review 768-tablet overflow=0px topbar=148px firstContent=148 rows=2
- PASS provider-review 768-tablet overflow=0px topbar=135px firstContent=135 rows=2
- PASS operations-onetime-overview 768-tablet overflow=0px topbar=136px firstContent=0 rows=3
- PASS operations-rabbi-email-inbox 768-tablet overflow=0px topbar=136px firstContent=0 rows=3
- PASS one-time 430-mobile overflow=0px topbar=89px firstContent=89 rows=1
- PASS one-time-mishnayos 430-mobile overflow=0px topbar=89px firstContent=89 rows=1
- PASS rabbi-member 430-mobile overflow=0px topbar=75px firstContent=75 rows=1
- PASS member-library 430-mobile overflow=0px topbar=147px firstContent=147 rows=2
- PASS one-time-classroom 430-mobile overflow=0px topbar=145px firstContent=145 rows=2
- PASS one-time-classroom-review 430-mobile overflow=0px topbar=136px firstContent=136 rows=2
- PASS provider-review 430-mobile overflow=0px topbar=127px firstContent=127 rows=2
- PASS operations-onetime-overview 430-mobile overflow=0px topbar=130px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 430-mobile overflow=0px topbar=130px firstContent=0 rows=2
- PASS one-time 390-mobile overflow=0px topbar=79px firstContent=79 rows=1
- PASS one-time-mishnayos 390-mobile overflow=0px topbar=79px firstContent=79 rows=1
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
- Operations screenshots use readable redaction: labels, hierarchy, and actions remain visible while private values are masked.
