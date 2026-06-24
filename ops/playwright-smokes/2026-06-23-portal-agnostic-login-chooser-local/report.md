# Portal-Agnostic Login Chooser Local Smoke

Status: PASS

Scope: local static render of Operations, provider, student, and parent password login pages with mocked `chooser_required` responses. No database, credentials, external accounts, sends, billing, or production data writes.

| Page | Viewport | Result | Screenshot | Notes |
|---|---|---|---|---|
| operations | 390x844 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/operations-mobile-390.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| provider | 390x844 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/provider-mobile-390.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| student | 390x844 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/student-mobile-390.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| parent | 390x844 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/parent-mobile-390.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| operations | 768x1024 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/operations-tablet-768.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| provider | 768x1024 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/provider-tablet-768.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| student | 768x1024 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/student-tablet-768.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| parent | 768x1024 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/parent-tablet-768.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| operations | 1440x900 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/operations-desktop-1440.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| provider | 1440x900 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/provider-desktop-1440.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| student | 1440x900 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/student-desktop-1440.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |
| parent | 1440x900 | PASS | ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/parent-desktop-1440.png | Chooser visible; Operations, Provider, Parent, and Student destinations shown; no external destinations; no horizontal overflow. |

Checks:

- Operations, provider, student, and parent password login pages render server-resolved chooser destinations.
- Destination links come from `redirect_to` values returned by the mocked server response.
- Operations, Provider, Parent, and Student destinations are visible.
- No external destination links are rendered.
- Password fields remain masked.
- No horizontal overflow at 390x844, 768x1024, or 1440x900.
- No unexpected console errors, page errors, or network request failures. Initial unauthenticated session-probe 401 console messages are expected in this local static smoke and are recorded separately in `report.json`.
