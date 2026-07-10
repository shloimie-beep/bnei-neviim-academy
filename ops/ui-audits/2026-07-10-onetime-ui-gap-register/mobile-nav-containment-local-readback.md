# One Time Mobile Nav Containment Local Readback

Generated: 2026-07-10 local Codex session

Scope: `UIGAP-20260710-001` / `REQ-20260710-007`

## Operator Correction

The first local fix used grid-like mobile nav blocks. Shloimie rejected that screenshot as visually unacceptable and clarified the desired mobile pattern: compact black header, visible white hamburger-style cue, horizontal sliding options, white/black chip treatment, and no ugly stacked grid.

## Implemented Locally

- `/one-time`: mobile nav is a horizontal chip rail with a visible white hamburger/scroll cue, white selected chip, white text on dark chips, and yellow CTA preserved.
- `/rabbi-member`, `/member-library`, `/one-time-classroom`: member/classroom navs use horizontal mobile rails with a visible hamburger/scroll cue instead of clipped right-edge links.
- `/provider.html?review=one-time`: provider review top nav uses the same horizontal rail/cue pattern and long CRM text is constrained inside cards.
- `public/js/bna-bot-widget.js`: One Time public assistant launcher now stays in the lower safe area on mobile instead of overlapping the top nav.

## Local Evidence

Ignored local screenshots and generated report are under:

`ops/ui-audits/2026-07-10-onetime-mobile-nav-containment-local/`

Tracked summary from the local Playwright readback:

| Route | 390px | 430px | Notes |
|---|---|---|---|
| `/one-time` | Pass | Pass | No page overflow, visible hamburger cue, no fixed assistant overlap. |
| `/rabbi-member` | Pass | Pass | Intentional horizontal nav rail with cue. |
| `/member-library` | Pass | Pass | Wrapper constrained after initial overflow was caught and fixed. |
| `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS` | Pass | Pass | Intentional horizontal nav rail with cue. |
| `/provider.html?review=one-time` | Pass | Pass | Intentional horizontal nav rail with cue; CRM text stays inside cards. |

Verification run:

- PASS custom Playwright mobile containment readback: 10/10 checks passed.
- PASS `node --check public/js/bna-bot-widget.js`.
- PASS `npm run one-time:smoke:provider-crm-layout-local`.
- PASS `npm run one-time:smoke:canonical-journey-local`.
- BROADER AUDIT NON-TERMINAL: `npm run audit:onetime-toolbar-density` still exits `captured_with_failures` because of pre-existing parent-review 34px controls, member whitespace findings, and flaky Operations communications capture. Those are not closed by this nav slice.

## Terminal Status

Superseded by deployed/live-smoked proof. `REQ-20260710-007` is Done after commit `0017b458`, OneTime Railway deployment `90990bd3-676f-433f-8a97-dfa6fa4723b7`, and live readback `ops/ui-audits/2026-07-10-onetime-mobile-nav-containment-live/report.md` passed 10/10 checks.
