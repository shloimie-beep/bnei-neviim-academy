# Parent And Student Login UI Polish - Current State Audit

Generated: 2026-07-07T14:20:42.559Z
Base URL: https://bneineviimacademy.org
Status: captured

## Summary

- Routes checked: 4
- Viewports checked: 1440-desktop, 1024-tablet-wide, 768-tablet, 430-mobile, 390-mobile
- Screenshots: 20
- Findings: 22

## Finding Counts

- VQ-A11Y-001: 6
- VQ-RESPONSIVE-001: 2
- VQ-ALIGN-001: 5
- VQ-LAYOUT-002: 4
- VQ-SCOPE-001: 5

## Findings

### P2 VQ-A11Y-001 - One Time student review entry / 430-mobile

- Route: /student.html?review=one-time
- Issue: Mobile tappable controls are below 44px height.
- Evidence: Button heights: 42, 36, 36, 42
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-review-430-mobile.png
- Expected fix: Set a consistent mobile min-height of at least 44px for visible actions.

### P1 VQ-RESPONSIVE-001 - One Time student review entry / 390-mobile

- Route: /student.html?review=one-time
- Issue: Horizontal overflow or clipped element detected.
- Evidence: div.brand-lockup: 162/180
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-review-390-mobile.png
- Expected fix: Constrain wide elements, allow button/input text to wrap, and remove horizontal page scroll.

### P2 VQ-A11Y-001 - One Time student review entry / 390-mobile

- Route: /student.html?review=one-time
- Issue: Mobile tappable controls are below 44px height.
- Evidence: Button heights: 42, 36, 36, 42
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-review-390-mobile.png
- Expected fix: Set a consistent mobile min-height of at least 44px for visible actions.

### P2 VQ-ALIGN-001 - Student login shell / 1440-desktop

- Route: /student/login
- Issue: Visible button heights are inconsistent.
- Evidence: Height spread 15px across 5 actions.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-1440-desktop.png
- Expected fix: Normalize action button padding/min-height and group primary/secondary actions on a consistent grid.

### P2 VQ-ALIGN-001 - Student login shell / 1024-tablet-wide

- Route: /student/login
- Issue: Visible button heights are inconsistent.
- Evidence: Height spread 15px across 5 actions.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-1024-tablet-wide.png
- Expected fix: Normalize action button padding/min-height and group primary/secondary actions on a consistent grid.

### P2 VQ-ALIGN-001 - Student login shell / 768-tablet

- Route: /student/login
- Issue: Visible button heights are inconsistent.
- Evidence: Height spread 15px across 5 actions.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-768-tablet.png
- Expected fix: Normalize action button padding/min-height and group primary/secondary actions on a consistent grid.

### P2 VQ-A11Y-001 - Student login shell / 430-mobile

- Route: /student/login
- Issue: Mobile tappable controls are below 44px height.
- Evidence: Button heights: 33, 33, 42, 41, 48
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-430-mobile.png
- Expected fix: Set a consistent mobile min-height of at least 44px for visible actions.

### P2 VQ-ALIGN-001 - Student login shell / 430-mobile

- Route: /student/login
- Issue: Visible button heights are inconsistent.
- Evidence: Height spread 15px across 5 actions.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-430-mobile.png
- Expected fix: Normalize action button padding/min-height and group primary/secondary actions on a consistent grid.

### P2 VQ-LAYOUT-002 - Student login shell / 430-mobile

- Route: /student/login
- Issue: First meaningful content starts too low on the page.
- Evidence: First visible major block starts at y=115px.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-430-mobile.png
- Expected fix: Reduce top padding/header dead space so the login/entry purpose appears in the first viewport.

### P2 VQ-A11Y-001 - Student login shell / 390-mobile

- Route: /student/login
- Issue: Mobile tappable controls are below 44px height.
- Evidence: Button heights: 33, 33, 42, 41, 48
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-390-mobile.png
- Expected fix: Set a consistent mobile min-height of at least 44px for visible actions.

### P2 VQ-ALIGN-001 - Student login shell / 390-mobile

- Route: /student/login
- Issue: Visible button heights are inconsistent.
- Evidence: Height spread 15px across 5 actions.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-390-mobile.png
- Expected fix: Normalize action button padding/min-height and group primary/secondary actions on a consistent grid.

### P2 VQ-LAYOUT-002 - Student login shell / 390-mobile

- Route: /student/login
- Issue: First meaningful content starts too low on the page.
- Evidence: First visible major block starts at y=115px.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/student-login-390-mobile.png
- Expected fix: Reduce top padding/header dead space so the login/entry purpose appears in the first viewport.

### P0 VQ-SCOPE-001 - Parent login shell / 1440-desktop

- Route: /parent/login
- Issue: Parent/student entry surface contains admin/debug/setup-looking language.
- Evidence: BNA Bnei Neviim Academy Parent Portal Public site Families Student login Parent Login Use the email or phone number BNA has on file with the
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-1440-desktop.png
- Expected fix: Remove admin/debug/setup language from normal parent/student entry surfaces or move it behind a role-gated support view.

### P0 VQ-SCOPE-001 - Parent login shell / 1024-tablet-wide

- Route: /parent/login
- Issue: Parent/student entry surface contains admin/debug/setup-looking language.
- Evidence: BNA Bnei Neviim Academy Parent Portal Public site Families Student login Parent Login Use the email or phone number BNA has on file with the
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-1024-tablet-wide.png
- Expected fix: Remove admin/debug/setup language from normal parent/student entry surfaces or move it behind a role-gated support view.

### P0 VQ-SCOPE-001 - Parent login shell / 768-tablet

- Route: /parent/login
- Issue: Parent/student entry surface contains admin/debug/setup-looking language.
- Evidence: BNA Bnei Neviim Academy Parent Portal Public site Families Student login Parent Login Use the email or phone number BNA has on file with the
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-768-tablet.png
- Expected fix: Remove admin/debug/setup language from normal parent/student entry surfaces or move it behind a role-gated support view.

### P0 VQ-SCOPE-001 - Parent login shell / 430-mobile

- Route: /parent/login
- Issue: Parent/student entry surface contains admin/debug/setup-looking language.
- Evidence: BNA Bnei Neviim Academy Parent Portal Public site Families Student login Parent Login Use the email or phone number BNA has on file with the
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-430-mobile.png
- Expected fix: Remove admin/debug/setup language from normal parent/student entry surfaces or move it behind a role-gated support view.

### P2 VQ-LAYOUT-002 - Parent login shell / 430-mobile

- Route: /parent/login
- Issue: First meaningful content starts too low on the page.
- Evidence: First visible major block starts at y=123px.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-430-mobile.png
- Expected fix: Reduce top padding/header dead space so the login/entry purpose appears in the first viewport.

### P0 VQ-SCOPE-001 - Parent login shell / 390-mobile

- Route: /parent/login
- Issue: Parent/student entry surface contains admin/debug/setup-looking language.
- Evidence: BNA Bnei Neviim Academy Parent Portal Public site Families Student login Parent Login Use the email or phone number BNA has on file with the
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-390-mobile.png
- Expected fix: Remove admin/debug/setup language from normal parent/student entry surfaces or move it behind a role-gated support view.

### P2 VQ-LAYOUT-002 - Parent login shell / 390-mobile

- Route: /parent/login
- Issue: First meaningful content starts too low on the page.
- Evidence: First visible major block starts at y=123px.
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-login-390-mobile.png
- Expected fix: Reduce top padding/header dead space so the login/entry purpose appears in the first viewport.

### P2 VQ-A11Y-001 - One Time parent/member review entry / 430-mobile

- Route: /parent.html?review=one-time
- Issue: Mobile tappable controls are below 44px height.
- Evidence: Button heights: 36, 36, 40
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-review-430-mobile.png
- Expected fix: Set a consistent mobile min-height of at least 44px for visible actions.

### P1 VQ-RESPONSIVE-001 - One Time parent/member review entry / 390-mobile

- Route: /parent.html?review=one-time
- Issue: Horizontal overflow or clipped element detected.
- Evidence: div.brand-lockup: 160/180
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-review-390-mobile.png
- Expected fix: Constrain wide elements, allow button/input text to wrap, and remove horizontal page scroll.

### P2 VQ-A11Y-001 - One Time parent/member review entry / 390-mobile

- Route: /parent.html?review=one-time
- Issue: Mobile tappable controls are below 44px height.
- Evidence: Button heights: 36, 36, 40
- Screenshot: ops/ui-audits/2026-07-07-parent-student-login-ui-polish/screenshots/parent-review-390-mobile.png
- Expected fix: Set a consistent mobile min-height of at least 44px for visible actions.

## Checks

- PASS student-review 1440-desktop (3130ms)
- PASS student-review 1024-tablet-wide (2406ms)
- PASS student-review 768-tablet (2408ms)
- PASS student-review 430-mobile (2304ms)
- PASS student-review 390-mobile (2290ms)
- PASS student-login 1440-desktop (2315ms)
- PASS student-login 1024-tablet-wide (2219ms)
- PASS student-login 768-tablet (2202ms)
- PASS student-login 430-mobile (2199ms)
- PASS student-login 390-mobile (2191ms)
- PASS parent-login 1440-desktop (1394ms)
- PASS parent-login 1024-tablet-wide (1375ms)
- PASS parent-login 768-tablet (1380ms)
- PASS parent-login 430-mobile (1370ms)
- PASS parent-login 390-mobile (1402ms)
- PASS parent-review 1440-desktop (2579ms)
- PASS parent-review 1024-tablet-wide (2373ms)
- PASS parent-review 768-tablet (2313ms)
- PASS parent-review 430-mobile (2388ms)
- PASS parent-review 390-mobile (2274ms)

## Guardrails

- No payment, checkout, access grant, external send, DNS write, credential change, provider mutation, or production data mutation was performed.
- Screenshots cover public/review/login entry states only.
