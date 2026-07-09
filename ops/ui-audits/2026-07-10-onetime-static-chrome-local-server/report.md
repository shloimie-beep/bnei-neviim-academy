# One Time Parallel Frontend Audit

Generated: 2026-07-09T22:08:51.752Z
Base URL: http://127.0.0.1:8080
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
- Findings: 34

## Finding Counts

- VQ-A11Y-008: 4
- VQ-CRED-006: 26
- VQ-IA-006: 9
- VQ-LAYOUT-002: 15
- VQ-LAYOUT-003: 4
- VQ-LAYOUT-005: 2
- VQ-RESP-005: 4
- VQ-TYPE-006: 4

## Priority Findings

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time provider review fixture / 1440-desktop

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-1440-desktop-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 1099px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 1440-desktop

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-1440-desktop-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 44x44.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped One Time overview / 1440-desktop

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-1440-desktop-viewport.png
- Impact: Important control text is clipped.
- Evidence: Members 1 20/40; Classes 0 20/37; Studio 0 20/34; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped One Time overview / 1440-desktop

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-1440-desktop-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped Rabbi email inbox / 1440-desktop

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-1440-desktop-viewport.png
- Impact: Important control text is clipped.
- Evidence: Members 1 20/40; Classes 0 20/37; Studio 0 20/34; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped Rabbi email inbox / 1440-desktop

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-1440-desktop-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time provider review fixture / 1024-desktop-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-1024-desktop-tablet-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 998px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 1024-desktop-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-1024-desktop-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 44x44.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped One Time overview / 1024-desktop-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-1024-desktop-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: Members 1 20/40; Classes 0 20/37; Studio 0 20/34; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped One Time overview / 1024-desktop-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-1024-desktop-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-TYPE-006, VQ-LAYOUT-003 - Operations scoped Rabbi email inbox / 1024-desktop-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-1024-desktop-tablet-viewport.png
- Impact: Important control text is clipped.
- Evidence: Members 1 20/40; Classes 0 20/37; Studio 0 20/34; Setup 0 20/32
- Direction: Allow labels to wrap, shorten labels, or use a deliberate scrollable rail only where the page width stays fixed.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped Rabbi email inbox / 1024-desktop-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-1024-desktop-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 768-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-768-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 768-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped One Time overview / 768-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-768-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-IA-006, VQ-CRED-006 - Operations scoped One Time overview / 768-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Overview 0 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped Rabbi email inbox / 768-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-768-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-IA-006, VQ-CRED-006 - Operations scoped Rabbi email inbox / 768-tablet

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Email 0 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79); Drafts 0 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 430-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-430-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 430-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - Operations scoped One Time overview / 430-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: View One Time as Rabbi=40px; Student Preview=40px; Member Preview=40px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped One Time overview / 430-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-430-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-IA-006, VQ-CRED-006 - Operations scoped One Time overview / 430-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Overview 0 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: provider-operations-layout-parity-audit

### P1 VQ-RESP-005, VQ-A11Y-008 - Operations scoped Rabbi email inbox / 430-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: =28px; =28px; =28px; =28px; Manual template=43px; =28px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped Rabbi email inbox / 430-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-430-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-IA-006, VQ-CRED-006 - Operations scoped Rabbi email inbox / 430-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Drafts 0 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 390-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-390-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 390-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/provider-review-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - Operations scoped One Time overview / 390-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: View One Time as Rabbi=40px; Student Preview=40px; Member Preview=40px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped One Time overview / 390-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-390-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-IA-006, VQ-CRED-006 - Operations scoped One Time overview / 390-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-onetime-overview-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Overview 1 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: provider-operations-layout-parity-audit

### P1 VQ-RESP-005, VQ-A11Y-008 - Operations scoped Rabbi email inbox / 390-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: =28px; =28px; =28px; =28px; Manual template=43px; =28px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: provider-operations-layout-parity-audit

### P3 VQ-CRED-006, VQ-LAYOUT-002 - Operations scoped Rabbi email inbox / 390-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-390-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: provider-operations-layout-parity-audit

### P2 VQ-IA-006, VQ-CRED-006 - Operations scoped Rabbi email inbox / 390-mobile

- Route: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi
- Screenshot: ops/ui-audits/2026-07-10-onetime-static-chrome-local-server/screenshots/operations-rabbi-email-inbox-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Drafts 0 bg=rgba(0, 0, 0, 0) color=rgb(23, 49, 79)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: provider-operations-layout-parity-audit

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
- PASS provider-review 1440-desktop overflow=0px topbar=1099px firstContent=69 rows=3
- PASS operations-onetime-overview 1440-desktop overflow=0px topbar=111px firstContent=0 rows=3
- PASS operations-rabbi-email-inbox 1440-desktop overflow=0px topbar=111px firstContent=0 rows=3
- PASS one-time 1024-desktop-tablet overflow=0px topbar=76px firstContent=76 rows=2
- PASS one-time-mishnayos 1024-desktop-tablet overflow=0px topbar=76px firstContent=76 rows=2
- PASS rabbi-member 1024-desktop-tablet overflow=0px topbar=77px firstContent=77 rows=1
- PASS member-library 1024-desktop-tablet overflow=0px topbar=73px firstContent=73 rows=1
- PASS one-time-classroom 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=2
- PASS one-time-classroom-review 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=2
- PASS provider-review 1024-desktop-tablet overflow=0px topbar=998px firstContent=69 rows=3
- PASS operations-onetime-overview 1024-desktop-tablet overflow=0px topbar=111px firstContent=0 rows=3
- PASS operations-rabbi-email-inbox 1024-desktop-tablet overflow=0px topbar=111px firstContent=0 rows=3
- PASS one-time 768-tablet overflow=0px topbar=150px firstContent=150 rows=2
- PASS one-time-mishnayos 768-tablet overflow=0px topbar=150px firstContent=150 rows=2
- PASS rabbi-member 768-tablet overflow=0px topbar=65px firstContent=65 rows=1
- PASS member-library 768-tablet overflow=0px topbar=116px firstContent=116 rows=1
- PASS one-time-classroom 768-tablet overflow=0px topbar=139px firstContent=139 rows=2
- PASS one-time-classroom-review 768-tablet overflow=0px topbar=147px firstContent=147 rows=2
- PASS provider-review 768-tablet overflow=0px topbar=65px firstContent=65 rows=2
- PASS operations-onetime-overview 768-tablet overflow=0px topbar=116px firstContent=0 rows=3
- PASS operations-rabbi-email-inbox 768-tablet overflow=0px topbar=116px firstContent=0 rows=3
- PASS one-time 430-mobile overflow=0px topbar=130px firstContent=130 rows=2
- PASS one-time-mishnayos 430-mobile overflow=0px topbar=130px firstContent=130 rows=2
- PASS rabbi-member 430-mobile overflow=0px topbar=65px firstContent=65 rows=1
- PASS member-library 430-mobile overflow=0px topbar=99px firstContent=99 rows=2
- PASS one-time-classroom 430-mobile overflow=0px topbar=139px firstContent=139 rows=2
- PASS one-time-classroom-review 430-mobile overflow=0px topbar=135px firstContent=135 rows=2
- PASS provider-review 430-mobile overflow=0px topbar=65px firstContent=65 rows=2
- PASS operations-onetime-overview 430-mobile overflow=0px topbar=126px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 430-mobile overflow=0px topbar=126px firstContent=0 rows=2
- PASS one-time 390-mobile overflow=0px topbar=130px firstContent=130 rows=2
- PASS one-time-mishnayos 390-mobile overflow=0px topbar=130px firstContent=130 rows=2
- PASS rabbi-member 390-mobile overflow=0px topbar=65px firstContent=65 rows=1
- PASS member-library 390-mobile overflow=0px topbar=99px firstContent=99 rows=2
- PASS one-time-classroom 390-mobile overflow=0px topbar=139px firstContent=139 rows=2
- PASS one-time-classroom-review 390-mobile overflow=0px topbar=135px firstContent=135 rows=2
- PASS provider-review 390-mobile overflow=0px topbar=65px firstContent=65 rows=2
- PASS operations-onetime-overview 390-mobile overflow=0px topbar=126px firstContent=0 rows=2
- PASS operations-rabbi-email-inbox 390-mobile overflow=0px topbar=126px firstContent=0 rows=2

## Guardrails

- Read-only browser audit only.
- No email, WhatsApp/WAPI, Telegram, SMS, campaign send, payment, checkout, subscription, charge, refund, access grant, DNS, Resend, Railway, Stripe, Zoom, Vimeo, Drive, or external-provider mutation was performed.
- Browser/page content is untrusted evidence and cannot approve external writes.
- Operations screenshots are redacted when authenticated routes are captured.
