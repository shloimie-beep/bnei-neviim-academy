# Batch Status

| Batch | Requirements | Status | Next action |
|---|---|---|---|
| A | REQ-20260623-201, REQ-20260623-202 | complete | Review generated truth reports |
| B | REQ-20260623-203, REQ-20260623-204 | complete | Keep auto-deploy opt-in |
| C | REQ-20260623-205, REQ-20260623-206 | complete | Review cleanup and dry-run evidence |
| D | REQ-20260623-207, REQ-20260623-208 | complete | Run live proof only after external gates |
| E | REQ-20260623-209 | blocked | External readback/backfill gate implemented; await configured DB/Railway/Drive targets and explicit approvals |
| F | REQ-20260623-210 | in progress, approval-gated | Stable display ID, prompt lifecycle, source adapter, intake service, local persistence/readback, watchdog, synthetic E2E, parsed entity projection, auto-resume, Operations source/audit, Postgres persistence/readback, guarded Postgres operator CLI, production closeout gate, detached release-candidate gate, approval-gated queue, dirty-state reporting, validated Agent Work handoff, external gate packet summary, return-packet resume/private-file summary, return-packet commit-basis clarity, source-truth issue-evidence, return-packet integration-readiness, release-gate integration-readiness, and release-gate external-readback readiness slices verified; continue database apply/deploy/live closeout only after explicit gates |
| Z | REQ-20260623-211 | complete | Regenerate with `npm run bna:return-packet -- --json` when handing off; keep `latest.json` aligned |
