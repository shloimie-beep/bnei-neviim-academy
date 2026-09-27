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

## Verified closeout for this receiver slice

- Prepared branch `codex/life-skills-receiver-fence-20260927` from `7492182eba8a50795e59800cdc1e86f715d36bf0`; PR [#165](https://github.com/shloimie-beep/bnei-neviim-academy/pull/165) reviewed through head `bca5ddea7dc7d81668f44add9516b9fdf07868fe` and squash merged to `727973ad629228c5c1ee287304a534952da8ab2c` on 2026-09-27.
- Independent review identified two real P2 issues (first receipt vs replay and opt-in backlog) and the Hebrew recovery issue; all were fixed. Later repeated comments about opt-in and language contradict the exact reviewed head's pre-insert gate and derived-language readback, with focused tests.
- `node --check server.js` PASS; four focused Life Skills suites PASS 34/34; `git diff --check` PASS. Database-init-order 1/1 and WAPI phonebook 7/7 passed. Unrelated One Time WAPI scope string-contract suite remains 4/5 on the original master too; this change does not touch that One Time path.
- Railway website receiver deployment `4eebad7a-99f6-4177-95c5-e8fe00ed5db6` reached SUCCESS. The runtime `server.js` byte SHA-256 was `1a15db68a69a319e5da32816e39e58487acb423181d7451f766aa7be5f09fb25`, matching the clean Windows worktree file uploaded by `railway up`. The Git blob at merged commit `727973ad629228c5c1ee287304a534952da8ab2c:server.js` has SHA-256 `de5520ea475e477b1f67a8bb40748b559ac32e0bc21aeb08ddec13a187b5367f`; the worktree has `core.autocrlf=true`, and replacing CRLF with LF in its bytes yields exactly that Git-blob hash. The raw hashes must not be compared as if line endings were unchanged. Reproduce with a binary SHA-256 of `git show 727973ad629228c5c1ee287304a534952da8ab2c:server.js`, a binary SHA-256 of the checked-out `server.js`, and a SHA-256 after CRLF-to-LF normalization of the latter. Public Life Skills and health returned 200; unauthenticated private bridge returned 401. Read-only receipt aggregate: 15 synced, 0 pending. Live mode remained `sheet`, automatic replies off, no writer epoch configured.
- Status: this receiver safety slice is deployed and read back; capture-only mode itself has **not** been activated. Full native CRM cutover, owner People screen, and controlled two-message provider proof remain separate open Life Skills gates. No client message, backfill, production database mutation or live Sheet edit was performed by this slice.
