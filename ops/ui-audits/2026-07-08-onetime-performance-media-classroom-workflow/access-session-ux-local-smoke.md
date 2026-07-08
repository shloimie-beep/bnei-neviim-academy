# One Time Access Session UX Local Smoke
Started: 2026-07-08T09:41:45.832Z
Base URL: http://127.0.0.1:58775
Result: passed
## Checks
- Member library secure-link access opens the current-access panel and keeps fallback code as a secondary drawer.
- Member library classroom CTA carries the current resolved access code.
- Classroom secure-link access opens the current-access panel, keeps fallback code closed, and does not use the internal review shell class.
- No-current-access classroom opens fallback access support copy instead of silently doing nothing.
- Desktop 1440px and mobile 390px had no horizontal overflow and no console/page errors.
- Vimeo iframes are still lazy: zero iframe embeds before pressing Play Video.
## Viewport Results
- desktop: member overflow 0px; classroom overflow 0px; console errors 0
- mobile: member overflow 0px; classroom overflow 0px; console errors 0
## Screenshots
- ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/access-session-desktop-member-library.png
- ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/access-session-desktop-classroom.png
- ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/access-session-mobile-member-library.png
- ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/access-session-mobile-classroom.png
Guardrail: Mocked local browser smoke only; no production readback, database mutation, external upload, send, publish, charge, DNS, OAuth, or secret request was performed.