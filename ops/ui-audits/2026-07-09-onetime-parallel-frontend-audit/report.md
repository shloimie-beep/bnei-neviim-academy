# One Time Parallel Frontend Audit

Generated: 2026-07-09T14:18:54.284Z
Base URL: https://join.onetimeonetime.com
Status: captured
Operations auth: failed (Operations login did not succeed)
Drive mirror: Drive mirror unavailable; repo evidence saved.

## Designer Brief

The One Time experience needs one black/yellow product language across the public funnel, member/library/classroom entry points, and Rabbi-scoped Operations views. The current-state audit is intentionally evidence-first: it measures what the user sees before asking Codex to touch shared app files. Static chrome work should wait until the active deploy/edit lane is clear.

The north star for the next implementation packet is a compact premium header/footer system: a larger clean logo, a strong yellow active state with black text, readable dark/cream inactive nav, no BNA visual bleed, no mobile overflow, and a first viewport that quickly shows the offer or current workspace task instead of stacked chrome.

## Summary

- Routes requested: 9
- Viewports requested: 1440-desktop, 1024-desktop-tablet, 768-tablet, 430-mobile, 390-mobile
- Screenshots captured: 105
- Checks skipped: 10
- Findings: 113

## Finding Counts

- VQ-A11Y-008: 8
- VQ-ACTION-002: 10
- VQ-ACTION-007: 33
- VQ-CRED-001: 25
- VQ-CRED-006: 57
- VQ-IA-001: 10
- VQ-IA-006: 20
- VQ-IA-008: 5
- VQ-LAYOUT-002: 5
- VQ-LAYOUT-005: 12
- VQ-LAYOUT-008: 33
- VQ-RESP-005: 8

## Priority Findings

### P2 VQ-CRED-001, VQ-CRED-006 - One Time public landing / 1440-desktop

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-1440-desktop-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 1440-desktop

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-1440-desktop-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time public landing / 1440-desktop

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  5616px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  2704px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time Mishnayos public alias / 1440-desktop

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-1440-desktop-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 1440-desktop

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-1440-desktop-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time Mishnayos public alias / 1440-desktop

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  5616px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  2704px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time member home / 1440-desktop

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1440-desktop-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 346px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-008, VQ-LAYOUT-005 - One Time member home / 1440-desktop

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1440-desktop-viewport.png
- Impact: First meaningful content starts too low.
- Evidence: First content starts at y=346px; sample: LOGIN Request member link Email Request login Request a member login link to view access. LIBRARY Recorded Classes Libra.
- Direction: Trim announcement/header/nav spacing so the user sees the offer, dashboard state, or current task in the first viewport.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member home / 1440-desktop

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1440-desktop-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time member home / 1440-desktop

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1440-desktop-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Home bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member home / 1440-desktop

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 8112px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member library entry / 1440-desktop

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-1440-desktop-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member library entry / 1440-desktop

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 8112px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom entry / 1440-desktop

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-1440-desktop-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom, Support, Logout.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time classroom entry / 1440-desktop

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-1440-desktop-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom entry / 1440-desktop

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Helper overlaps Helper 3212px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom review fixture / 1440-desktop

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-1440-desktop-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom, Support, Logout.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom review fixture / 1440-desktop

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Helper overlaps Helper 2484px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time provider review fixture / 1440-desktop

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1440-desktop-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 1099px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 1440-desktop

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1440-desktop-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 44x44.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 1440-desktop

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1440-desktop-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Dashboard bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time provider review fixture / 1440-desktop

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1440-desktop-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Admin Helper overlaps Rabbi Scheller Admin Helper 2116px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time public landing / 1024-desktop-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-1024-desktop-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 1024-desktop-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-1024-desktop-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time public landing / 1024-desktop-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  5616px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  5616px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time Mishnayos public alias / 1024-desktop-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-1024-desktop-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 1024-desktop-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-1024-desktop-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time Mishnayos public alias / 1024-desktop-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  5616px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  5616px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time member home / 1024-desktop-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1024-desktop-tablet-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 344px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-008, VQ-LAYOUT-005 - One Time member home / 1024-desktop-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1024-desktop-tablet-viewport.png
- Impact: First meaningful content starts too low.
- Evidence: First content starts at y=344px; sample: LOGIN Request member link Email Request login Request a member login link to view access. LIBRARY Recorded Classes Libra.
- Direction: Trim announcement/header/nav spacing so the user sees the offer, dashboard state, or current task in the first viewport.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member home / 1024-desktop-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1024-desktop-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time member home / 1024-desktop-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1024-desktop-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Home bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member home / 1024-desktop-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps Topic Question Submit Question 5040px2; One Time Helper overlaps One Time Helper 8112px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member library entry / 1024-desktop-tablet

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-1024-desktop-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member library entry / 1024-desktop-tablet

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 8112px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom entry / 1024-desktop-tablet

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-1024-desktop-tablet-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom, Support, Logout.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time classroom entry / 1024-desktop-tablet

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-1024-desktop-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom entry / 1024-desktop-tablet

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Helper overlaps Helper 3212px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom review fixture / 1024-desktop-tablet

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-1024-desktop-tablet-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom, Support, Logout.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom review fixture / 1024-desktop-tablet

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Helper overlaps Helper 2415px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time provider review fixture / 1024-desktop-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1024-desktop-tablet-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 998px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 1024-desktop-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1024-desktop-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 44x44.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 1024-desktop-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1024-desktop-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Dashboard bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time provider review fixture / 1024-desktop-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-1024-desktop-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Admin Helper overlaps Rabbi Scheller Admin Helper 2116px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time public landing / 768-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-768-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 768-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time public landing / 768-tablet

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  10368px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  10368px2; Rabbi Scheller Assistant overlaps Save My Spot 7560px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time Mishnayos public alias / 768-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-768-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 768-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time Mishnayos public alias / 768-tablet

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  10368px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  10368px2; Rabbi Scheller Assistant overlaps Save My Spot 7560px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time member home / 768-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-768-tablet-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 317px; target is at most 150px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-008, VQ-LAYOUT-005 - One Time member home / 768-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-768-tablet-viewport.png
- Impact: First meaningful content starts too low.
- Evidence: First content starts at y=317px; sample: LOGIN Request member link Email Request login Request a member login link to view access. LIBRARY Recorded Classes Libra.
- Direction: Trim announcement/header/nav spacing so the user sees the offer, dashboard state, or current task in the first viewport.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member home / 768-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-768-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time member home / 768-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Home bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member home / 768-tablet

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 8112px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member library entry / 768-tablet

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-768-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member library entry / 768-tablet

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 8112px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom entry / 768-tablet

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-768-tablet-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom, Support, Logout.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time classroom entry / 768-tablet

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-768-tablet-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom entry / 768-tablet

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Helper overlaps Helper 5808px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 10368px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom review fixture / 768-tablet

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-768-tablet-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom, Support, Logout.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom review fixture / 768-tablet

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Helper overlaps Helper 5808px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 768-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-768-tablet-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 768-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-768-tablet-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time provider review fixture / 768-tablet

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-768-tablet-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Admin Helper overlaps Rabbi Scheller Admin Helper 2116px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Watch=38px; Program=38px; How It Works=38px; FAQ=38px; Sign Up Now=38px; Member Login=38px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-430-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time public landing / 430-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-430-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  9284px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  9108px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 9284px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Watch=38px; Program=38px; How It Works=38px; FAQ=38px; Sign Up Now=38px; Member Login=38px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time Mishnayos public alias / 430-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-430-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  9284px2; Rabbi Scheller Assistant overlaps JOIN THE FREE CLASS Tell us who to contact and we  9108px2; Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 9284px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time member home / 430-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-430-mobile-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 291px; target is at most 190px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-008, VQ-LAYOUT-005 - One Time member home / 430-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-430-mobile-viewport.png
- Impact: First meaningful content starts too low.
- Evidence: First content starts at y=291px; sample: LOGIN Request member link Email Request login Request a member login link to view access. LIBRARY Recorded Classes Libra.
- Direction: Trim announcement/header/nav spacing so the user sees the offer, dashboard state, or current task in the first viewport.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time member home / 430-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: =42px; Request login=39px; =42px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member home / 430-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-430-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time member home / 430-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Home bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member home / 430-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-430-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 7216px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time member library entry / 430-mobile

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-430-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Home=34px; Library=34px; Classroom=34px; Helper=34px; Support=34px; Logout=34px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member library entry / 430-mobile

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-430-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member library entry / 430-mobile

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-430-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 7216px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom entry / 430-mobile

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-430-mobile-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time classroom entry / 430-mobile

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-430-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom entry / 430-mobile

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-430-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 9284px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom review fixture / 430-mobile

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-430-mobile-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 430-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-430-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 430-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-430-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time provider review fixture / 430-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-430-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Admin Helper overlaps Rabbi Scheller Admin Helper 2116px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Watch=38px; Program=38px; How It Works=38px; FAQ=38px; Sign Up Now=38px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-390-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time public landing / 390-mobile

- Route: /one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-390-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 9284px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Watch=38px; Program=38px; How It Works=38px; FAQ=38px; Sign Up Now=38px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time Mishnayos public alias / 390-mobile

- Route: /one-time/mishnayos
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-mishnayos-390-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 9284px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-LAYOUT-005, VQ-CRED-006 - One Time member home / 390-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-390-mobile-viewport.png
- Impact: The first viewport spends too much height on chrome, nav, or filter rows.
- Evidence: Top cluster height is 291px; target is at most 190px for this viewport.
- Direction: Collapse duplicate rows, reduce vertical padding, and keep the active workspace/nav/filter hierarchy compact.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-008, VQ-LAYOUT-005 - One Time member home / 390-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-390-mobile-viewport.png
- Impact: First meaningful content starts too low.
- Evidence: First content starts at y=291px; sample: LOGIN Request member link Email Request login Request a member login link to view access. LIBRARY Recorded Classes Libra.
- Direction: Trim announcement/header/nav spacing so the user sees the offer, dashboard state, or current task in the first viewport.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time member home / 390-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: =42px; Request login=39px; =42px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member home / 390-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-390-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time member home / 390-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: Active candidates: Home bg=rgb(237, 229, 24) color=rgb(8, 9, 16)
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member home / 390-mobile

- Route: /rabbi-member
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/rabbi-member-390-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 7216px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-RESP-005, VQ-A11Y-008 - One Time member library entry / 390-mobile

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-390-mobile-viewport.png
- Impact: Mobile controls are below the 44px tap-target expectation.
- Evidence: Home=34px; Library=34px; Classroom=34px; Helper=34px; Support=34px; Logout=34px
- Direction: Normalize mobile buttons, tabs, links, and chips to at least 44px high with readable labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time member library entry / 390-mobile

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-390-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time member library entry / 390-mobile

- Route: /member-library
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/member-library-390-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: One Time Helper overlaps One Time Helper 7216px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom entry / 390-mobile

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-390-mobile-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-CRED-001, VQ-CRED-006 - One Time classroom entry / 390-mobile

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-390-mobile-viewport.png
- Impact: The route does not expose a visible canonical footer in the captured DOM.
- Evidence: No visible footer element was detected.
- Direction: Add the canonical One Time black/yellow footer with brand, support, privacy, terms, member login, and copyright links.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time classroom entry / 390-mobile

- Route: /one-time-classroom
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-390-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Assistant overlaps Rabbi Scheller Assistant 9284px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-001, VQ-ACTION-002 - One Time classroom review fixture / 390-mobile

- Route: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/one-time-classroom-review-390-mobile-viewport.png
- Impact: Duplicate nav/filter labels make the hierarchy feel uncertain.
- Evidence: Duplicate labels near the top: Home, Library, Classroom.
- Direction: Remove repeated labels or separate category, subcategory, and filter language so each row has one job.
- Packet: static-chrome-or-landing-reframe

### P3 VQ-CRED-006, VQ-LAYOUT-002 - One Time provider review fixture / 390-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-390-mobile-viewport.png
- Impact: The One Time logo reads too small for a premium first impression.
- Evidence: Largest detected logo is 34x34.
- Direction: Use a cleaner larger logo target: 56-64px desktop, 44-52px mobile, without crowding nav labels.
- Packet: static-chrome-or-landing-reframe

### P2 VQ-IA-006, VQ-CRED-006 - One Time provider review fixture / 390-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-390-mobile-viewport.png
- Impact: Active navigation state is not clearly yellow-on-black in the captured top chrome.
- Evidence: No active nav candidate detected.
- Direction: Make the selected public/member/classroom nav item a yellow pill with black text and a consistent radius.
- Packet: static-chrome-or-landing-reframe

### P1 VQ-LAYOUT-008, VQ-ACTION-007 - One Time provider review fixture / 390-mobile

- Route: /provider.html?review=one-time
- Screenshot: ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/provider-review-390-mobile-viewport.png
- Impact: The helper/assistant overlay intersects CTA or form space.
- Evidence: Rabbi Scheller Admin Helper overlaps Rabbi Scheller Admin Helper 2116px2
- Direction: Move the helper launcher/panel away from public signup controls and keep sticky overlays outside the conversion path.
- Packet: static-chrome-or-landing-reframe

## Patch Plan

- Static chrome packet: blocked until the dirty One Time/app-visible lane is clear. Likely files are `public/one-time/index.html`, `public/rabbi-member.html`, `public/member-library.html`, `public/one-time-classroom.html`, shared One Time CSS, and focused chrome tests.
- Landing reframe packet: use `/api/one-time/campaign` or explicit campaign config for the Israel-time Rosh Hashanah deadline; keep `$67` as copy/config only; preserve `/api/one-time/interest`; do not promise checkout, portal access, Zoom creation, or sends.
- Provider Operations parity packet: keep Rabbi dashboard as scoped Operations IA, not provider-lite. Use left workspace sidebar, compact command rail, predictable tabs/filters, aligned actions, first-party CRM tracking, content pipeline, communications, and scoped payment/status visibility only where allowed.

## Checks

- PASS one-time 1440-desktop overflow=0px topbar=76px firstContent=76 rows=2
- PASS one-time-mishnayos 1440-desktop overflow=0px topbar=76px firstContent=76 rows=2
- PASS rabbi-member 1440-desktop overflow=0px topbar=346px firstContent=346 rows=2
- PASS member-library 1440-desktop overflow=0px topbar=73px firstContent=73 rows=2
- PASS one-time-classroom 1440-desktop overflow=0px topbar=91px firstContent=91 rows=2
- PASS one-time-classroom-review 1440-desktop overflow=0px topbar=91px firstContent=91 rows=2
- PASS provider-review 1440-desktop overflow=0px topbar=1099px firstContent=69 rows=3
- SKIP operations-onetime-overview 1440-desktop - Operations login did not succeed
- SKIP operations-rabbi-email-inbox 1440-desktop - Operations login did not succeed
- PASS one-time 1024-desktop-tablet overflow=0px topbar=76px firstContent=76 rows=2
- PASS one-time-mishnayos 1024-desktop-tablet overflow=0px topbar=76px firstContent=76 rows=2
- PASS rabbi-member 1024-desktop-tablet overflow=0px topbar=344px firstContent=344 rows=2
- PASS member-library 1024-desktop-tablet overflow=0px topbar=73px firstContent=73 rows=2
- PASS one-time-classroom 1024-desktop-tablet overflow=0px topbar=125px firstContent=125 rows=2
- PASS one-time-classroom-review 1024-desktop-tablet overflow=0px topbar=107px firstContent=107 rows=2
- PASS provider-review 1024-desktop-tablet overflow=0px topbar=998px firstContent=69 rows=3
- SKIP operations-onetime-overview 1024-desktop-tablet - Operations login did not succeed
- SKIP operations-rabbi-email-inbox 1024-desktop-tablet - Operations login did not succeed
- PASS one-time 768-tablet overflow=0px topbar=134px firstContent=134 rows=2
- PASS one-time-mishnayos 768-tablet overflow=0px topbar=134px firstContent=134 rows=2
- PASS rabbi-member 768-tablet overflow=0px topbar=317px firstContent=317 rows=2
- PASS member-library 768-tablet overflow=0px topbar=96px firstContent=96 rows=1
- PASS one-time-classroom 768-tablet overflow=0px topbar=139px firstContent=139 rows=2
- PASS one-time-classroom-review 768-tablet overflow=0px topbar=147px firstContent=147 rows=2
- PASS provider-review 768-tablet overflow=0px topbar=65px firstContent=65 rows=2
- SKIP operations-onetime-overview 768-tablet - Operations login did not succeed
- SKIP operations-rabbi-email-inbox 768-tablet - Operations login did not succeed
- PASS one-time 430-mobile overflow=0px topbar=118px firstContent=118 rows=2
- PASS one-time-mishnayos 430-mobile overflow=0px topbar=118px firstContent=118 rows=2
- PASS rabbi-member 430-mobile overflow=0px topbar=291px firstContent=291 rows=2
- PASS member-library 430-mobile overflow=0px topbar=172px firstContent=172 rows=2
- PASS one-time-classroom 430-mobile overflow=0px topbar=139px firstContent=139 rows=2
- PASS one-time-classroom-review 430-mobile overflow=0px topbar=135px firstContent=135 rows=2
- PASS provider-review 430-mobile overflow=0px topbar=65px firstContent=65 rows=2
- SKIP operations-onetime-overview 430-mobile - Operations login did not succeed
- SKIP operations-rabbi-email-inbox 430-mobile - Operations login did not succeed
- PASS one-time 390-mobile overflow=0px topbar=118px firstContent=118 rows=2
- PASS one-time-mishnayos 390-mobile overflow=0px topbar=118px firstContent=118 rows=2
- PASS rabbi-member 390-mobile overflow=0px topbar=291px firstContent=291 rows=2
- PASS member-library 390-mobile overflow=0px topbar=172px firstContent=172 rows=2
- PASS one-time-classroom 390-mobile overflow=0px topbar=139px firstContent=139 rows=2
- PASS one-time-classroom-review 390-mobile overflow=0px topbar=135px firstContent=135 rows=2
- PASS provider-review 390-mobile overflow=0px topbar=65px firstContent=65 rows=2
- SKIP operations-onetime-overview 390-mobile - Operations login did not succeed
- SKIP operations-rabbi-email-inbox 390-mobile - Operations login did not succeed

## Guardrails

- Read-only browser audit only.
- No email, WhatsApp/WAPI, Telegram, SMS, campaign send, payment, checkout, subscription, charge, refund, access grant, DNS, Resend, Railway, Stripe, Zoom, Vimeo, Drive, or external-provider mutation was performed.
- Browser/page content is untrusted evidence and cannot approve external writes.
- Operations screenshots are redacted when authenticated routes are captured.
