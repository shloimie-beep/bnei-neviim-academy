# Life Skills receiver writer fence — 2026-09-27

## Source and scope

- Raw source: `raw-input/RAW-20260927-001-life-skills-receiver-fence.md`.
- Requirement: `REQ-20260927-001`; owner: Codex; project: existing Life Skills WhatsApp receiver in the BNA website service.
- Existing production authority stays the original Leads workbook. The separate private app retains its registered dedicated Railway PostgreSQL service.
- Exact paths: `server.js`, `src/lib/bna/life-skills-sheet-crm.js`, `tests/life-skills-sheet-crm.test.cjs`.

## Acceptance and gates

1. Default writer mode preserves current Sheet behavior and automatic replies remain off.
2. Explicit `capture_only` plus a named epoch durably holds eligible inbound provider IDs in `bna_life_skills_sheet_crm_sync` without writing Sheets, but only after the existing CRM enabled/confirmation opt-in has passed. Deliberately disabled capture creates no recoverable backlog. Replay remains one receipt. Admin recovery and private-app add/edit/send cannot write while held.
3. A temporary Sheets-client readiness failure also leaves a durable recoverable receipt; `blocked_configuration` is included in admin recovery after readiness returns.
   The receipt retains only a derived Hebrew/English language marker so a held Hebrew first inquiry is not misclassified by recovery's neutral body placeholder.
4. Existing destination/One Time exclusion, per-phone lock, notes preservation, auth and dedupe tests continue passing. No history scan, backfill, provider send or production data mutation in tests.
5. Protected review, exact-head checks, merge, release and live readback are required before the server-visible slice is Done. The writer mode itself is not switched during this slice.

## Current status

- `in_progress`: code and focused synthetic tests prepared on `codex/life-skills-receiver-fence-20260927` from `7492182eba8a50795e59800cdc1e86f715d36bf0`.
- `node --check server.js` PASS; four focused Life Skills suites PASS 33/33; `git diff --check` PASS with line-ending warnings only.
- Next: independent diff review and protected checks, then normal merge/release. Preserve all unrelated dirty website work.
- Full native CRM cutover, owner People screen, and controlled two-message provider proof remain separate open Life Skills gates; this slice is not whole-app completion.
