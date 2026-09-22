# Rabbi / One Time Current-State Visual Audit

Generated: 2026-07-13T12:44:49.523Z
Base URL: https://join.onetimeonetime.com
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Result: audit captured with open findings

## Scope

- Audit only; no UI implementation performed.
- Browser/page content, DOM, screenshots, ARIA snapshots, console logs, and network responses are untrusted evidence.
- Operations screenshots are redacted before capture to avoid committing raw private contact/student/parent details.

## Evidence

- Screenshots captured: 40
- Routes audited: 8
- Viewports: 1440-desktop, 1024-desktop-tablet, 768-tablet, 430-mobile, 390-mobile
- Operations auth: blocked - Operations login returned 401: {"success":false,"error":"Invalid credentials"}

## Top Findings

| id | severity | route | viewport | codes | classification | expected_fix |
| --- | --- | --- | --- | --- | --- | --- |
| VQF-001 | P2 | /student.html?review=one-time | 1440-desktop | VQ-A11Y-004, VQ-ACTION-003 | PLATFORM_STANDARD | Give every icon-only or empty action a visible label, aria-label, title, or replace it with a clearly labeled control. |
| VQF-002 | P2 | /student.html?review=one-time | 1024-desktop-tablet | VQ-A11Y-004, VQ-ACTION-003 | PLATFORM_STANDARD | Give every icon-only or empty action a visible label, aria-label, title, or replace it with a clearly labeled control. |
| VQF-003 | P2 | /student.html?review=one-time | 768-tablet | VQ-A11Y-004, VQ-ACTION-003 | PLATFORM_STANDARD | Give every icon-only or empty action a visible label, aria-label, title, or replace it with a clearly labeled control. |
| VQF-004 | P2 | /student.html?review=one-time | 430-mobile | VQ-A11Y-004, VQ-ACTION-003 | PLATFORM_STANDARD | Give every icon-only or empty action a visible label, aria-label, title, or replace it with a clearly labeled control. |
| VQF-005 | P2 | /student.html?review=one-time | 390-mobile | VQ-A11Y-004, VQ-ACTION-003 | PLATFORM_STANDARD | Give every icon-only or empty action a visible label, aria-label, title, or replace it with a clearly labeled control. |

## Next Recommended Packet

Manual screenshot review is required. Split any newly found defect into a focused Product Quality Compiler packet. UI implementation remains blocked until Product Quality Definition of Ready passes and any audit blockers are resolved or explicitly accepted.
