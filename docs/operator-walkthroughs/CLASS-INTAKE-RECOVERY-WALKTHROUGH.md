# Class Intake Recovery Walkthrough

Purpose: recover class intake and Drive/transcription state without guessing
at production data or silently backfilling records.

1. Open `/integration-setup.html#google-drive`.
2. Select the exact target source before any readback:
   - a Drive folder ID;
   - a Drive file ID;
   - or an approved content-job range.
3. Choose the auth path:
   - local OAuth refresh token for owner-run diagnostics;
   - Railway worker variables for deployed worker readback;
   - service-account style access only if the source folder is deliberately
     shared to that account.
4. Use the minimum scope that matches the task. Prefer metadata/read-only or
   file-scoped access for diagnostics.
5. Run `npm run drive:audit` for Drive readiness.
6. Run `npm run owner-review:external-readiness` for the credential-free
   class-intake diagnostic.
7. Codex verifies routing, parser extraction, media intake, and no-write
   linked outcomes.
8. If the diagnostic says real jobs or files are needed, record the exact
   read-only approval request.
9. Do not apply a backfill from diagnostics.
10. Create a guarded backfill handoff only after source IDs, expected rows,
    rollback, owner approval, and live-smoke expectations are written down.

Success means Shloimie knows what to click, Codex knows what to verify, and no
student/class/private transcript data changes until the backfill is approved.
