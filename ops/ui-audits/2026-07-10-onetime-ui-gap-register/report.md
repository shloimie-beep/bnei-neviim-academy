# One Time Canonical UI Gap Register

Generated: 2026-07-10T07:06:48.664Z
Raw ID: RAW-20260710-001
Status: OPEN_GAPS_REGISTERED

## Latest Evidence Read

- Latest authenticated deployed visual audit: ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/report.md
- Latest local mobile nav refinement readback: ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-local/report.md
- Latest live mobile nav refinement readback: ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-live/report.md
- Automated findings in latest audit: 0
- Screenshots reviewed manually: 8
- UI/process gaps registered: 8

## Important Distinction

The deployed app is no longer in the earlier obviously broken state. Lag is measured fixed, the latest automated visual audit passes, and the mobile nav clipping gap is now deployed/live-smoked. A later operator screenshot review reopened the mobile nav visual state because the inactive chips still looked too close to the rejected design; that refinement is now deployed and live-proven. The remaining UI complaints are smaller but real: brand/copy consistency, provider text fitting, and proof governance.

## Gap Register

| Gap ID | Severity | Status | Routes | Evidence | Packet |
|---|---|---|---|---|---|
| UIGAP-20260710-001 | P1 | DONE_DEPLOYED_LIVE_SMOKED | /one-time<br>/rabbi-member<br>/one-time-classroom<br>/provider.html?review=one-time | Local: `mobile-nav-containment-local-readback.md`<br>Live: `ops/ui-audits/2026-07-10-onetime-mobile-nav-containment-live/report.md` | WINDOW-01-mobile-nav-containment.md |
| UIGAP-20260710-002 | P2 | OPEN_COPY_NORMALIZATION_PACKET_REQUIRED | /one-time<br>/provider.html?review=one-time<br>/student/login<br>/rabbi-member | SS-20260710-001, SS-20260710-005, SS-20260710-008 | WINDOW-03-brand-copy-normalization.md |
| UIGAP-20260710-003 | P2 | OPEN_IMPLEMENTATION_PACKET_REQUIRED | /provider.html?review=one-time | SS-20260710-005, SS-20260710-006 | WINDOW-02-provider-text-fit.md |
| UIGAP-20260710-004 | P0-process | PROCESS_REPAIR_PACKET_REQUIRED | all audited routes | ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/report.md | WINDOW-04-source-evidence-guardrail.md |
| UIGAP-20260710-005 | P1-process | PROCESS_REPAIR_PACKET_REQUIRED | historical One Time UI audit packages | ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/report.md | WINDOW-05-stale-audit-mapping.md |
| UIGAP-20260710-006 | P2-review | MACHINE_PASS_MANUAL_REVIEW_LIMITED | /operations scoped One Time overview<br>/operations Rabbi email inbox | SS-20260710-007 | WINDOW-06-manual-review-closeout.md |
| UIGAP-20260710-007 | P1-proof | BLOCKED_AGENT_MODE_PROOF_NOT_STARTED | agent-review-prompts/rabbi-helper-tool-scope-map<br>agent-review-prompts/rabbi-telegram-helper-ticket-smoke | ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/report.md | not-code-window-agent-mode-run-required |
| UIGAP-20260710-008 | P1 | DONE_DEPLOYED_LIVE_SMOKED | /one-time<br>/rabbi-member<br>/member-library<br>/one-time-classroom<br>/provider.html?review=one-time | Raw: `raw-input/RAW-20260710-006-onetime-mobile-nav-white-chip-correction.md`<br>Local: `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-local/report.md`<br>Live: `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-live/report.md` | REQ-20260710-036 |

## Manual Review Notes

### SS-20260710-001 - /one-time (1440-desktop)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/one-time-1440-desktop-viewport.png`
- Note: Strong black/yellow hero and conversion bar. Brand text still reads OneTimeOneTime, which is tracked separately.

### SS-20260710-002 - /one-time (390-mobile)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/one-time-390-mobile-viewport.png`
- Note: Mobile nav clips/truncates the rightmost FAQ item at the viewport edge despite the automated zero-finding report.

### SS-20260710-003 - /rabbi-member (390-mobile)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/rabbi-member-390-mobile-viewport.png`
- Note: Member area is coherent, but the top nav clips on the right edge on mobile.

### SS-20260710-004 - /one-time-classroom (390-mobile)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/one-time-classroom-390-mobile-viewport.png`
- Note: Classroom content is compact and on-brand; the active Classroom tab truncates on the right edge.

### SS-20260710-005 - /provider.html?review=one-time (1440-desktop)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/provider-review-1440-desktop-viewport.png`
- Note: Provider dashboard is much improved. Remaining manual issues are OneTimeOneTime copy and long CRM email/text containment.

### SS-20260710-006 - /provider.html?review=one-time (390-mobile)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/provider-review-390-mobile-viewport.png`
- Note: Provider mobile clips top nav labels and wraps the long CRM email awkwardly across lines.

### SS-20260710-007 - /operations scoped One Time overview (1440-desktop)

- Path: `ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/screenshots/operations-onetime-overview-1440-desktop-viewport.png`
- Note: Authenticated Operations layout passes automated checks, but redaction/blur prevents content-level manual closeout.

### SS-20260710-008 - /student/login (390-mobile)

- Path: `ops/ui-audits/2026-07-09-parent-student-login-ui-polish-live-after-deploy/screenshots/student-login-390-mobile.png`
- Note: Student login shell is usable after the fix; visible copy still contains OneTimeOneTime naming.


## Scorecard

Overall: 78/100 - MANUAL_REVIEW_FOUND_GAPS

- Performance: 95/100. 0/18 live samples needing attention after deployed fixes. Evidence: `ops/performance-audits/2026-07-10-onetime-parent-review-lightweight-live-readback/report.md`.
- Public first impression: 82/100. Strong hero; mobile nav/copy issues remain. Evidence: `SS-20260710-001`.
- Mobile fit: 68/100. Several nav labels clip at 390px. Evidence: `SS-20260710-002..006`.
- Provider/Rabbi workspace: 76/100. Coherent workspace; text fit and copy polish remain. Evidence: `SS-20260710-005..006`.
- Operations parity: 80/100. Layout passes; content-level review is redaction-limited. Evidence: `SS-20260710-007`.
- Proof governance: 55/100. Screenshots exist but source coverage reports zero. Evidence: `ops/ui-audits/2026-07-10-ui-source-coverage.md`.

## Deployed Implementation Update - UIGAP-20260710-001

After operator screenshot review, the first grid-style mobile nav implementation was rejected as visually unacceptable. The local implementation was revised to a compact black One Time mobile header with a visible white hamburger/scroll cue, horizontally sliding nav chips, selected-state chip treatment, and the assistant launcher moved out of the top nav area.

Local readback: `ops/ui-audits/2026-07-10-onetime-ui-gap-register/mobile-nav-containment-local-readback.md`.

Deployed readback: `ops/ui-audits/2026-07-10-onetime-mobile-nav-containment-live/report.md`.

OneTime Railway deployment `90990bd3-676f-433f-8a97-dfa6fa4723b7` reached `SUCCESS`. Live mobile nav containment passed 10/10 checks on `https://join.onetimeonetime.com` at 390px and 430px for `/one-time/`, `/rabbi-member?review=one-time`, `/member-library?review=one-time`, `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`, and `/provider.html?review=one-time`.

## Deployed Implementation Update - UIGAP-20260710-008

After the deployed containment screenshot review, the operator rejected the dark inactive chip treatment and asked for a black mobile rail, white hamburger/sandwich cue, and horizontally sliding white option chips. Local implementation now uses white option chips with black text, yellow-inset active state, no chip wrapping, and no page overflow across the public, member, library, classroom, and provider review routes.

Local readback passed 10/10 at 390px and 430px: `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-local/report.md`.

Pushed commit `4275cb3b` and deployed to OneTime Railway service `one-time-production / one-time-web`. The first detached upload created deployment `10d8e01c-bca2-4ab1-97a4-5f6ba0161afa` but remained stuck in `INITIALIZING`; the attached retry produced deployment `802fdb51-9d0d-4f47-b314-b7aabcd308d9`, which reached `SUCCESS`.

Live readback passed 10/10 at 390px and 430px on `https://join.onetimeonetime.com`: `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-live/report.md`. Standard One Time live smokes also passed for separate instance routing and Rabbi/One Time landing branding.

Terminal status: Done - deployed/live-smoked for this scoped white-chip correction.

## Terminal Rule

This register is not a product closeout. Each open gap requires code/package audit, tests, watchdogs, commit/push, deploy/live smoke where app-visible, after screenshots, manual review, ledger/changelog, and source-statement terminal closure.
