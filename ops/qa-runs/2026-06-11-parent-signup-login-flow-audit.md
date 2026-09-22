# Parent Signup To Login Flow Audit

Date: 2026-06-12

## Current Coverage

- Public signup routes and registration document flow are present.
- `/api/submit?dry_run=true` validates the registration payload without creating live records.
- The app smoke verified all six agreement signatures are required for the dry-run signup path.
- Parent auth supports password accounts, reset tokens, legacy magic links, and HttpOnly parent sessions.
- Operations can prepare/send parent login links through guarded backend paths, but this pass did not send any live links.

## Verification

- PASS `npm run app:smoke` with local app URL `http://127.0.0.1:8102`
- PASS `npm test` (276/276)

## Not Done

- No live parent login rollout was sent.
- No production deployment was run.
- No bulk parent communication was triggered.

## Next Action

Use a clean deploy workspace, confirm the target parent cohort and sending channel, deploy, run Railway doctor/live smoke, then send a small approved batch of login links.
