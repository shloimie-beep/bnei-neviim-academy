# One Time Neon Landing Polish And Production Deploy - 2026-07-12

## Raw inputs

| Raw ID | Source | Status | Path |
|---|---|---|---|
| RAW-20260712-005 | Codex attachment | registered | `raw-input/RAW-20260712-005-onetime-neon-landing-polish.md` |
| RAW-20260712-006 | Codex chat deployment override | registered | `raw-input/RAW-20260712-006-onetime-neon-polish-deploy-instruction.md` |

## Scope

Focused implementation of the One Time public landing visual polish, asset selection, responsive verification, commit/push, production-branch merge, One Time Railway deploy, and live smoke verification.

## Requirements

| ID | Requirement | Acceptance criteria | Evidence | Status |
|---|---|---|---|---|
| REQ-20260712-201 | Preflight and process the approved student and Rabbi teaching assets. | `smilykid.png` copied to the public One Time student asset path; 6-8 selected Rabbi photos optimized to WebP; source-to-destination map recorded; no ZIP/originals committed. | Asset map, git file list, committed landing asset manifest, deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`. | Done - live verified |
| REQ-20260712-202 | Replace the landing page with the requested neon/chrome visual system. | Header shows only logo, subtitle, Sign Up Now, and hamburger; drawer works at all viewports; ticker appears only beneath header; hero has full-grid treatment; no gold/mustard palette. | Screenshot set under `ops/ui-audits/2026-07-13-onetime-landing-image-addendum/`; focused landing tests 50/50; live `/` and `/one-time/` route smokes passed. | Done - live verified |
| REQ-20260712-203 | Implement requested section content and CTA placement. | What You Receive uses smiling-child circle and eight equal-height features; What He'll Gain uses three editorial panels with approved images; How It Works has exactly three requested steps and no CTA; Who It's For uses the dark Norfolk image treatment; final CTA above footer; exactly three large Sign Up Now buttons. | Screenshot set; `tests/one-time-focused-landing.test.js`; explicit copy rechecked against RAW-20260712-005; deployed SHA `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`. | Done - live verified |
| REQ-20260712-204 | Implement Rabbi Scheller carousel with real selected photos. | 6-8 WebP slides render in 16:9 frames with labels, controls, dots, keyboard/swipe/autoplay/pause, reduced-motion behavior, and no stretching. | Asset manifest, focused landing tests, local responsive screenshot review, live route smoke. | Done - live verified |
| REQ-20260712-205 | Improve Robot Scheller public launcher without breaking the assistant. | Full robot is visible in closed launcher and open header; hover/focus label says Ask Robot Scheller; Current class information and existing helper actions still work. | Local WhatsApp/launcher smoke, focused landing tests, live public WhatsApp readiness readback with no send/external write. | Done - live verified |
| REQ-20260712-206 | Preserve signup workflow and polish public signup footer/header as needed. | `/one-time/signup` remains lightweight, fields/tests pass, footer has Home/Sign Up Now/Privacy/Terms/Member Login, no payment/access/send side effects added. | `tests/one-time-direct-signup-page.test.js`; signup screenshot; live landing smoke and interest dry-run smoke passed. | Done - live verified |
| REQ-20260712-207 | Verify, commit, push, merge to production, deploy to Railway, and live-smoke. | Local tests and visual checks pass; branch pushed; production branch updated to expected SHA; One Time Railway deploy succeeds; live `/one-time/` and `/one-time/signup` serve the expected SHA and smoke tests pass. | Commit `dc540e121a9bce02a8d0e738ec4e99a9c8edc831`; Railway deployment `2bdb5c35-df6b-4fc6-8d33-1eecff1eff82`; initial live smoke reports `ops/live-smokes/2026-07-13T13-38-48-323Z-rabbi-onetime-landing-smoke.md` and `ops/live-smokes/2026-07-13T13-38-48-485Z-one-time-interest-dry-run-live-smoke.md`; current live descendant SHA `7ec31290c08ede0957dbd60b2c3253979253feba` also smoke-verified with reports `ops/live-smokes/2026-07-13T13-43-30-683Z-rabbi-onetime-landing-smoke.md` and `ops/live-smokes/2026-07-13T13-43-30-703Z-one-time-interest-dry-run-live-smoke.md`; separate-instance smoke passed. | Done - live verified |

## Deployment decision

| ID | Decision | Owner | Status |
|---|---|---|---|
| DEC-20260712-201 | The previous visual-approval gate is superseded by the operator's explicit deployment instruction in RAW-20260712-006. | Shloimie | Done |

## Out of scope

- No external email/WhatsApp sends.
- No charge, checkout, access grant, DNS change, or provider account mutation.
- No unrelated BNA/Operations UI cleanup.
- No stock, AI, or unrelated child images for missing benefit photography.
