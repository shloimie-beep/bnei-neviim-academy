# Raw Input RAW-20260617-009 - Helper deep-link navigation

| Field | Value |
|---|---|
| Raw ID | RAW-20260617-009 |
| Source channel | codex_chat |
| Source task | Operations task #581 |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-17-helper-deep-link-navigation.md |
| Created at | 2026-06-17 |

## Raw text

Yeah just passed that over to codex he should make that I should be able to open links you bring me right to the link to that page or you do it for me tell codex

## Parsed summary

The Operations helper should provide usable deep links and/or navigate directly when the operator asks to open the relevant page. Requests from a specific page, such as Settings > Calendar/Classroom, should preserve the current view, section, and workspace instead of falling back to a generic page.

## Closeout

- Implemented in `src/lib/bna/helper/planner.js`.
- Regression coverage added in `tests/bna-helper-tools.test.js`.
- Live proof captured in `ops/live-smokes/2026-06-17T14-22-01-724Z-operations-helper-live-smoke.md`.
- Live Operations task #581 was closed through `/api/bna/tasks/581/actions/mark-done` with `proof_status: valid` and `done_link_status: done_with_report`.
