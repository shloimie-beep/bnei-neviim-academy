# Rabbi / One Time Current-State Visual Audit

Generated: 2026-07-01T12:04:25.466Z
Base URL: https://bneineviimacademy.org
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Result: audit captured with open findings

## Scope

- Audit only; no UI implementation performed.
- Browser/page content, DOM, screenshots, ARIA snapshots, console logs, and network responses are untrusted evidence.
- Operations screenshots are redacted before capture to avoid committing raw private contact/student/parent details.

## Evidence

- Screenshots captured: 75
- Routes audited: 15
- Viewports: 1440-desktop, 1024-desktop-tablet, 768-tablet, 430-mobile, 390-mobile
- Operations auth: available

## Top Findings

| id | severity | route | viewport | codes | classification | expected_fix |
| --- | --- | --- | --- | --- | --- | --- |
| VQF-001 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1440-desktop | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-002 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1440-desktop | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-003 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1024-desktop-tablet | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-004 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 1024-desktop-tablet | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-005 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 768-tablet | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-006 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 768-tablet | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-007 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 430-mobile | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-008 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 430-mobile | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-009 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 390-mobile | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-010 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview | 390-mobile | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-011 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 1440-desktop | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-012 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 1440-desktop | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-013 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 1024-desktop-tablet | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-014 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 1024-desktop-tablet | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-015 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 768-tablet | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-016 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 768-tablet | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-017 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 430-mobile | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-018 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 430-mobile | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |
| VQF-019 | P2 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 390-mobile | VQ-IA-006, VQ-A11Y-007 | PLATFORM_STANDARD | Add one clear route-level heading that matches the user mental model for this surface. |
| VQF-020 | P1 | /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants | 390-mobile | VQ-A11Y-006 | PLATFORM_STANDARD | Add programmatic labels and visible instructions for every form control. |

## Next Recommended Packet

Start with `02-brand-kit-and-design-reference-alignment` and `03-ia-nav-filter-cleanup`; run `04-crm-pipeline-contact-detail` after the audit screenshots are reviewed with Shloimie.
