# Ramble Intake - 2026-06-17 - mobile-assistant-keyboard-layout

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-013 | operations_ui / task #560 | implemented | raw-input/RAW-20260617-013-mobile-assistant-keyboard-layout.md | Backlog task asks for the mobile assistant sheet to stay usable when the phone keyboard opens. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-214 | Mobile assistant sheet tracks visible viewport height | Keyboard-driven `visualViewport` resize/scroll changes update CSS variables used by the mobile assistant sheet. | `public/js/bna-bot-widget.js` | Focused tests; targeted live smoke | Done |
| REQ-20260617-215 | Composer remains reachable above the mobile keyboard | The assistant composer remains visible and tappable after the input receives focus and the visible viewport shrinks. | `public/js/bna-bot-widget.js` | Focused tests; targeted live smoke | Done |
| REQ-20260617-216 | Assistant messages keep an internal scroll region | The panel header/composer stay fixed within the sheet while the thread scrolls without page-level horizontal overflow. | `public/js/bna-bot-widget.js`; portal/public pages | Focused tests; targeted live smoke | Done |
| REQ-20260617-217 | Mobile helper avoids horizontal overflow | Phone-width public/portal assistant layouts fit the viewport in LTR and RTL-safe positioning. | `public/js/bna-bot-widget.js` | Focused tests; targeted live smoke | Done |
| REQ-20260617-218 | Task #560 closes with live proof | Add repeatable test/smoke coverage, deploy public/runtime changes, run live verification, and close task #560 only with evidence. | Tests / scripts / Operations task API | `npm test`; Railway deployment; live smokes; task readback | Done |

## Parsed Tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-560 | Fix mobile assistant keyboard layout | Codex | Universal assistant / mobile UX | "Make the assistant sheet stay visible when the mobile keyboard opens, with the composer reachable and no horizontal overflow." | Universal assistant mobile keyboard layout is implemented, tested, deployed, live-smoked, and task #560 is closed with valid proof. | Done |

## Guardrails

- Do not send email, WhatsApp, Telegram, social posts, payments, DNS changes, account grants, credential copies, uploads, or external connector writes.
- Live smoke may use public pages and mocked assistant API responses. Do not create real assistant messages in production during layout proof.
- Keep this scoped to the universal assistant mobile layout unless verification exposes a directly related regression.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-214 | Done | The widget sets `--app-vh` from `visualViewport.height`, computes `--keyboard-offset`, and mobile CSS uses the offset in the panel bottom position. | `public/js/bna-bot-widget.js`; `tests/mobile-assistant-keyboard-layout.test.js`; `tests/universal-assistant-contract.test.js` | Focused tests; `npm run app:smoke:mobile-assistant-keyboard` | None |
| REQ-20260617-215 | Done | `keepAssistantComposerReachable()` runs on panel open, input focus, and viewport changes; the live smoke confirmed composer bottom stays above simulated keyboard top. | `public/js/bna-bot-widget.js`; `scripts/smoke-mobile-assistant-keyboard-live.mjs` | Targeted live smoke passed at 390px LTR and 360px RTL | None |
| REQ-20260617-216 | Done | Panel remains a fixed grid with header/history/thread/typing/composer rows; thread has `min-height: 0`, `min-width: 0`, and internal overflow while panel/form/input prevent horizontal expansion. | `public/js/bna-bot-widget.js`; `tests/mobile-assistant-keyboard-layout.test.js` | Focused tests; full `npm test` | None |
| REQ-20260617-217 | Done | Mobile panel width is constrained to `calc(100vw - 16px)` and live smoke confirmed no document/body horizontal overflow in LTR and RTL scenarios. | `public/js/bna-bot-widget.js`; `scripts/smoke-mobile-assistant-keyboard-live.mjs` | `npm run app:smoke:mobile-assistant-keyboard` | None |
| REQ-20260617-218 | Done | Task #560 was deployed, live-smoked, closed through the official app API with valid proof, and its linked observable agent job was completed so it stopped reactivating. | `package.json`; `scripts/smoke-mobile-assistant-keyboard-live.mjs`; repo closeout files | `npm test` passed 727/727; Railway deployment `96acd1a4-a7b4-444e-b822-8baa53f9b4e2` succeeded; live app smoke `ops/live-smokes/2026-06-17T15-09-14-847Z-live-app-smoke.md`; mobile keyboard smoke `ops/live-smokes/2026-06-17T15-11-24-907Z-mobile-assistant-keyboard-live-smoke.md`; task #560 final readback `done` / `history` / `completed` with `proof_status: valid`, `done_link_status: done_with_report`, and `effective_agent_status: completed`; final reconciler `ops/system-audits/2026-06-17T15-18-49-025Z-task-queue-reconciler.md` showed active machine tasks reduced to 5 | None |
