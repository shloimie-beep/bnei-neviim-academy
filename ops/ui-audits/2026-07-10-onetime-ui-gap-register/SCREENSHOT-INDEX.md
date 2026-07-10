# Screenshot Index - One Time UI Gap Register

Generated: 2026-07-10T07:06:48.664Z
Raw ID: RAW-20260710-001

## Reviewed Screenshots

| ID | Route | Viewport | Path | Manual note |
|---|---|---|---|---|
| SS-20260710-001 | /one-time | 1440-desktop | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/one-time-1440-desktop-viewport.png` | Strong black/yellow hero and conversion bar. Brand text still reads OneTimeOneTime, which is tracked separately. |
| SS-20260710-002 | /one-time | 390-mobile | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/one-time-390-mobile-viewport.png` | Mobile nav clips/truncates the rightmost FAQ item at the viewport edge despite the automated zero-finding report. |
| SS-20260710-003 | /rabbi-member | 390-mobile | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/rabbi-member-390-mobile-viewport.png` | Member area is coherent, but the top nav clips on the right edge on mobile. |
| SS-20260710-004 | /one-time-classroom | 390-mobile | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/one-time-classroom-390-mobile-viewport.png` | Classroom content is compact and on-brand; the active Classroom tab truncates on the right edge. |
| SS-20260710-005 | /provider.html?review=one-time | 1440-desktop | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/provider-review-1440-desktop-viewport.png` | Provider dashboard is much improved. Remaining manual issues are OneTimeOneTime copy and long CRM email/text containment. |
| SS-20260710-006 | /provider.html?review=one-time | 390-mobile | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/provider-review-390-mobile-viewport.png` | Provider mobile clips top nav labels and wraps the long CRM email awkwardly across lines. |
| SS-20260710-007 | /operations scoped One Time overview | 1440-desktop | `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/operations-onetime-overview-1440-desktop-viewport.png` | Authenticated Operations layout passes automated checks, but redaction/blur prevents content-level manual closeout. |
| SS-20260710-008 | /student/login | 390-mobile | `ops/ui-audits/2026-07-09-parent-student-login-ui-polish-live-after-deploy/screenshots/student-login-390-mobile.png` | Student login shell is usable after the fix; visible copy still contains OneTimeOneTime naming. |

## Screenshot Evidence Mismatch

The current provider parity audit includes screenshot files under `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/`, but `npm run ui:source-coverage` produced `ops/ui-audits/2026-07-10-ui-source-coverage.md` with `screenshot_files: 0`. That mismatch is registered as `UIGAP-20260710-004`.
