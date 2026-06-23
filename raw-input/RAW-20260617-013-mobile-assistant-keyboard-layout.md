# Raw Input RAW-20260617-013 - Mobile assistant keyboard layout

| Field | Value |
|---|---|
| Raw ID | RAW-20260617-013 |
| Source channel | operations_ui |
| Source task | Operations task #560 |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-17-mobile-assistant-keyboard-layout.md |
| Created at | 2026-06-17 |
| Implemented at | 2026-06-17T18:12:00+03:00 |

## Raw text

Fix mobile assistant keyboard layout

## Source task notes

Make the assistant sheet stay visible when the mobile keyboard opens, with the composer reachable and no horizontal overflow.

## Parsed summary

Harden the universal assistant widget so mobile browser keyboard changes keep the assistant sheet and composer inside the visible viewport, preserve scroll behavior for the message thread, and avoid horizontal overflow on public/portal pages.

## Closeout

- Universal assistant mobile CSS now uses a `visualViewport`-backed `--app-vh` height plus `--keyboard-offset` to lift the sheet above the mobile keyboard.
- The mobile assistant panel clamps to the visible viewport, keeps the composer reachable, preserves an internal message scroll region, and hides the launcher while the keyboard-compressed panel is open.
- Focus and viewport-change handlers now re-sync the assistant viewport and keep the composer reachable after mobile keyboard changes.
- Verification passed: focused assistant tests, `npm test` (727/727), Railway deployment `96acd1a4-a7b4-444e-b822-8baa53f9b4e2`, live app smoke, and targeted mobile keyboard live smoke in LTR and RTL phone scenarios with assistant APIs mocked.
- Live task #560 was closed through the app API and read back as `done` / `history` / `completed` with `proof_status: valid` and `done_link_status: done_with_report`.
