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
| REQ-20260712-201 | Preflight and process the approved student and Rabbi teaching assets. | `smilykid.png` copied to the public One Time student asset path; 6-8 selected Rabbi photos optimized to WebP; source-to-destination map recorded; no ZIP/originals committed. | Asset map and git file list. | In progress |
| REQ-20260712-202 | Replace the landing page with the requested neon/chrome visual system. | Header shows only logo, subtitle, Sign Up Now, and hamburger; drawer works at all viewports; ticker appears only beneath header; hero has full-grid treatment; no gold/mustard palette. | Screenshots and DOM metrics at 1440, 1024, 768, 430, 390. | In progress |
| REQ-20260712-203 | Implement requested section content and CTA placement. | What You Receive uses smiling-child circle and eight equal-height features; What He'll Gain uses three editorial panels with labeled pending image slots; How It Works has exactly three requested steps and no CTA; Who It's For uses distinctive orbit/map composition; final CTA above footer; exactly three large Sign Up Now buttons. | Screenshots, static tests, CTA count check. | In progress |
| REQ-20260712-204 | Implement Rabbi Scheller carousel with real selected photos. | 6-8 WebP slides render in 16:9 frames with labels, controls, dots, keyboard/swipe/autoplay/pause, reduced-motion behavior, and no stretching. | Asset map, screenshots, carousel metrics. | In progress |
| REQ-20260712-205 | Improve Robot Scheller public launcher without breaking the assistant. | Full robot is visible in closed launcher and open header; hover/focus label says Ask Robot Scheller; Current class information and existing helper actions still work. | Robot screenshots and focused tests. | In progress |
| REQ-20260712-206 | Preserve signup workflow and polish public signup footer/header as needed. | `/one-time/signup` remains lightweight, fields/tests pass, footer has Home/Sign Up Now/Privacy/Terms/Member Login, no payment/access/send side effects added. | Signup screenshot, focused signup tests, live smoke. | In progress |
| REQ-20260712-207 | Verify, commit, push, merge to production, deploy to Railway, and live-smoke. | Local tests and visual checks pass; branch pushed; production branch updated to expected SHA; One Time Railway deploy succeeds; live `/one-time/` and `/one-time/signup` serve the expected SHA and smoke tests pass. | Test logs, commit SHA, deployment ID/status, live smoke output. | In progress |

## Deployment decision

| ID | Decision | Owner | Status |
|---|---|---|---|
| DEC-20260712-201 | The previous visual-approval gate is superseded by the operator's explicit deployment instruction in RAW-20260712-006. | Shloimie | Done |

## Out of scope

- No external email/WhatsApp sends.
- No charge, checkout, access grant, DNS change, or provider account mutation.
- No unrelated BNA/Operations UI cleanup.
- No stock, AI, or unrelated child images for missing benefit photography.
