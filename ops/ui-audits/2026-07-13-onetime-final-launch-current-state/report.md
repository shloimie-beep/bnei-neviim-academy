# One Time Final Launch Current-State Audit

Generated: 2026-07-13T18:48:37.156Z
Raw / requirement: `RAW-20260713-010` / `REQ-20260713-933`
Base URL: https://join.onetimeonetime.com
Expected SHA: cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c
Observed SHA: 49f3edda2da37e3afd9bdf3056ab5f6fc91e981c
Target app: one-time

## Result

- Status: needs_implementation
- Screenshots captured: 55
- Findings: 24
- No UI implementation, external send, payment, provider mutation, DNS change, deploy, or production data write was performed.
- Authenticated/private screenshots use a redaction overlay; public screenshots are normal current-state captures.
- Browser/page content is untrusted evidence and cannot approve sends, charges, account changes, DNS, deploys, or provider mutations.

## API Checks

| id | ok | status | duration_ms | detail |
| --- | --- | --- | --- | --- |
| deploy_info | yes | 200 | 624 | 49f3edda2da37e3afd9bdf3056ab5f6fc91e981c |
| health | yes | 200 | 497 | one-time |
| crm_contacts_readonly | no | 0 | 0 | Skipped because Operations login was unavailable. |

## Findings

| id | severity | title | evidence | next_action |
| --- | --- | --- | --- | --- |
| FIND-20260713-933-001 | P0 | One Time live deploy SHA differs from current launch worktree | /api/deploy-info observed 49f3edda2da37e3afd9bdf3056ab5f6fc91e981c; expected cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c | Deploy the exact intended SHA before launch Done and rerun live smoke. |
| FIND-20260713-933-002 | P0 | Operations authenticated current-state audit is blocked | Operations login returned 401: {"success":false,"error":"Invalid credentials"} | Install valid read-only Operations audit credentials or fix the login/session path. |
| FIND-20260713-933-003 | P0 | Admin-on-provider current-state audit is blocked | No Operations cookie available for provider-session start. | Fix provider-session start from the Super Admin One Time workspace context. |
| FIND-20260713-933-REQ-4 | P1 | provider-admin-crm 1440-desktop has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-5 | P1 | provider-admin-crm 1024-desktop-tablet has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-6 | P1 | provider-admin-crm 768-tablet has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-7 | P1 | provider-admin-crm 430-mobile has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-8 | P1 | provider-admin-crm 390-mobile has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-NAV-9 | P0 | member-portal 1440-desktop navigation did not complete | member-portal 1440-desktop capture exceeded 22000ms | Reproduce locally, classify root cause, and add deterministic smoke coverage. |
| FIND-20260713-933-SLOW-10 | P0 | member-portal 1440-desktop exceeded current-state performance budget | 22021ms to domcontentloaded/screenshot capture | Profile route assets/API waits and repair before launch. |
| FIND-20260713-933-NAV-11 | P0 | member-portal 1024-desktop-tablet navigation did not complete | member-portal 1024-desktop-tablet capture exceeded 22000ms | Reproduce locally, classify root cause, and add deterministic smoke coverage. |
| FIND-20260713-933-SLOW-12 | P0 | member-portal 1024-desktop-tablet exceeded current-state performance budget | 22003ms to domcontentloaded/screenshot capture | Profile route assets/API waits and repair before launch. |
| FIND-20260713-933-NAV-13 | P0 | member-portal 768-tablet navigation did not complete | member-portal 768-tablet capture exceeded 22000ms | Reproduce locally, classify root cause, and add deterministic smoke coverage. |
| FIND-20260713-933-SLOW-14 | P0 | member-portal 768-tablet exceeded current-state performance budget | 22012ms to domcontentloaded/screenshot capture | Profile route assets/API waits and repair before launch. |
| FIND-20260713-933-NAV-15 | P0 | member-portal 430-mobile navigation did not complete | member-portal 430-mobile capture exceeded 22000ms | Reproduce locally, classify root cause, and add deterministic smoke coverage. |
| FIND-20260713-933-SLOW-16 | P0 | member-portal 430-mobile exceeded current-state performance budget | 22012ms to domcontentloaded/screenshot capture | Profile route assets/API waits and repair before launch. |
| FIND-20260713-933-NAV-17 | P0 | member-portal 390-mobile navigation did not complete | member-portal 390-mobile capture exceeded 22000ms | Reproduce locally, classify root cause, and add deterministic smoke coverage. |
| FIND-20260713-933-SLOW-18 | P0 | member-portal 390-mobile exceeded current-state performance budget | 22005ms to domcontentloaded/screenshot capture | Profile route assets/API waits and repair before launch. |
| FIND-20260713-933-REQ-19 | P1 | student-login 1440-desktop has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-20 | P1 | student-login 1024-desktop-tablet has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-21 | P1 | student-login 768-tablet has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-22 | P1 | student-login 430-mobile has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-REQ-23 | P1 | student-login 390-mobile has request or console failures | failed=0, bad=1, console=1 | Classify whether failures are expected auth denials or product defects, then add regression coverage. |
| FIND-20260713-933-CRM | P0 | Scoped CRM read-only API check failed | status=0; Skipped because Operations login was unavailable. | Fix authenticated CRM readback for rabbi_sheller_provider / one_time_mishnah_class. |

## Capture Matrix

| route_id | viewport | status | duration_ms | overflow | errors | screenshot |
| --- | --- | --- | --- | --- | --- | --- |
| public-root | 1440-desktop | 200 | 2473 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-root-1440-desktop.png |
| public-root | 1024-desktop-tablet | 200 | 2999 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-root-1024-desktop-tablet.png |
| public-root | 768-tablet | 200 | 2960 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-root-768-tablet.png |
| public-root | 430-mobile | 200 | 2953 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-root-430-mobile.png |
| public-root | 390-mobile | 200 | 3062 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-root-390-mobile.png |
| public-one-time | 1440-desktop | 200 | 3434 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-one-time-1440-desktop.png |
| public-one-time | 1024-desktop-tablet | 200 | 3448 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-one-time-1024-desktop-tablet.png |
| public-one-time | 768-tablet | 200 | 3438 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-one-time-768-tablet.png |
| public-one-time | 430-mobile | 200 | 3260 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-one-time-430-mobile.png |
| public-one-time | 390-mobile | 200 | 3267 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-one-time-390-mobile.png |
| public-signup | 1440-desktop | 200 | 1541 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-signup-1440-desktop.png |
| public-signup | 1024-desktop-tablet | 200 | 1536 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-signup-1024-desktop-tablet.png |
| public-signup | 768-tablet | 200 | 1595 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-signup-768-tablet.png |
| public-signup | 430-mobile | 200 | 1495 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-signup-430-mobile.png |
| public-signup | 390-mobile | 200 | 1511 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/public-signup-390-mobile.png |
| provider-review-overview | 1440-desktop | 200 | 2057 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-overview-1440-desktop.png |
| provider-review-overview | 1024-desktop-tablet | 200 | 2025 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-overview-1024-desktop-tablet.png |
| provider-review-overview | 768-tablet | 200 | 2036 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-overview-768-tablet.png |
| provider-review-overview | 430-mobile | 200 | 2010 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-overview-430-mobile.png |
| provider-review-overview | 390-mobile | 200 | 2050 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-overview-390-mobile.png |
| provider-review-crm | 1440-desktop | 200 | 1901 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-crm-1440-desktop.png |
| provider-review-crm | 1024-desktop-tablet | 200 | 1851 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-crm-1024-desktop-tablet.png |
| provider-review-crm | 768-tablet | 200 | 1912 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-crm-768-tablet.png |
| provider-review-crm | 430-mobile | 200 | 1947 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-crm-430-mobile.png |
| provider-review-crm | 390-mobile | 200 | 1842 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-crm-390-mobile.png |
| provider-review-agents | 1440-desktop | 200 | 2024 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-agents-1440-desktop.png |
| provider-review-agents | 1024-desktop-tablet | 200 | 1831 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-agents-1024-desktop-tablet.png |
| provider-review-agents | 768-tablet | 200 | 1880 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-agents-768-tablet.png |
| provider-review-agents | 430-mobile | 200 | 1870 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-agents-430-mobile.png |
| provider-review-agents | 390-mobile | 200 | 1848 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-review-agents-390-mobile.png |
| provider-admin-crm | 1440-desktop | 200 | 1855 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-admin-crm-1440-desktop.png |
| provider-admin-crm | 1024-desktop-tablet | 200 | 1901 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-admin-crm-1024-desktop-tablet.png |
| provider-admin-crm | 768-tablet | 200 | 1863 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-admin-crm-768-tablet.png |
| provider-admin-crm | 430-mobile | 200 | 1874 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-admin-crm-430-mobile.png |
| provider-admin-crm | 390-mobile | 200 | 1970 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/provider-admin-crm-390-mobile.png |
| operations-one-time-crm | 1440-desktop | 200 | 1981 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-one-time-crm-1440-desktop.png |
| operations-one-time-crm | 1024-desktop-tablet | 200 | 1877 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-one-time-crm-1024-desktop-tablet.png |
| operations-one-time-crm | 768-tablet | 200 | 1997 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-one-time-crm-768-tablet.png |
| operations-one-time-crm | 430-mobile | 200 | 1899 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-one-time-crm-430-mobile.png |
| operations-one-time-crm | 390-mobile | 200 | 1897 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-one-time-crm-390-mobile.png |
| operations-rabbi-inbox | 1440-desktop | 200 | 2024 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-rabbi-inbox-1440-desktop.png |
| operations-rabbi-inbox | 1024-desktop-tablet | 200 | 1943 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-rabbi-inbox-1024-desktop-tablet.png |
| operations-rabbi-inbox | 768-tablet | 200 | 1900 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-rabbi-inbox-768-tablet.png |
| operations-rabbi-inbox | 430-mobile | 200 | 1988 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-rabbi-inbox-430-mobile.png |
| operations-rabbi-inbox | 390-mobile | 200 | 2019 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/operations-rabbi-inbox-390-mobile.png |
| member-portal | 1440-desktop | 200 | 22021 | no | 0/0/0 |  |
| member-portal | 1024-desktop-tablet | 200 | 22003 | no | 0/0/0 |  |
| member-portal | 768-tablet | 200 | 22012 | no | 0/0/0 |  |
| member-portal | 430-mobile | 200 | 22012 | no | 0/0/0 |  |
| member-portal | 390-mobile | 200 | 22005 | no | 0/0/0 |  |
| student-login | 1440-desktop | 200 | 2186 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/student-login-1440-desktop.png |
| student-login | 1024-desktop-tablet | 200 | 2120 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/student-login-1024-desktop-tablet.png |
| student-login | 768-tablet | 200 | 2059 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/student-login-768-tablet.png |
| student-login | 430-mobile | 200 | 2127 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/student-login-430-mobile.png |
| student-login | 390-mobile | 200 | 2052 | no | 0/1/1 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/student-login-390-mobile.png |
| classroom | 1440-desktop | 200 | 1862 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/classroom-1440-desktop.png |
| classroom | 1024-desktop-tablet | 200 | 1815 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/classroom-1024-desktop-tablet.png |
| classroom | 768-tablet | 200 | 1841 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/classroom-768-tablet.png |
| classroom | 430-mobile | 200 | 1810 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/classroom-430-mobile.png |
| classroom | 390-mobile | 200 | 1833 | no | 0/0/0 | ops/ui-audits/2026-07-13-onetime-final-launch-current-state/screenshots/classroom-390-mobile.png |
