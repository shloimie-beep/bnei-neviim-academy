# Backlog Cleanup Report - 2026-06-17

Status: passed

## What Was Cleaned

- Closed stale observable jobs for already-completed work and restored the
  active machine queue to zero.
- Archived parser false-positive Codex tasks created from class/content
  recordings, including the final live false positive `#1061` / job `#228`.
- Hardened recording parsing so class/source material such as "what Codex can
  do" does not become a Codex implementation job.
- Drained Drive Raw Media Intake and Processing Temporary.
- Corrected repo fallback raw intake ID for the dropped system-debug prompt to
  `RAW-20260617-018`.

## Drive Drain Evidence

Final Drive audit: `ops/drive-audits/2026-06-17T17-48-36-323Z-google-drive-audit.md`.

| Folder | Final state |
| --- | --- |
| Raw Media Intake | No recent items visible. |
| Website Images Intake | No recent items visible. |
| Processing Temporary | No recent items visible. |
| Processed Recordings Source Media | Recovered audio/image files are present. |

Processed/recovered content jobs in this sweep include jobs `64` through `71`,
with the final recovered image moved to parsed/source media as content job `71`.

## Code/Test Evidence

- Parser/filing hardening: `src/lib/bna/intake-parser.js`, `server.js`.
- Regression tests: `tests/intake-parser-class-recording.test.js`,
  `tests/telegram-media-routing.test.js`.
- Full test suite: `npm test` passed `744/744`.
- Railway deployment: `8f7d16a8-9c0e-4298-9901-7bfc3075a1b2`, doctor `SUCCESS`.
- Live smoke: `ops/live-smokes/2026-06-17T17-52-27-607Z-live-app-smoke.md`.

## Remaining Cleanup

Historical ledger-only stale/unknown markers remain as reporting hygiene, but
they are not active Codex jobs and there are no requeue candidates.

## Post-Report Fresh Tasks Closed

After this report was first written, Telegram created task `#1078` / job `#232`
and task `#1079` / job `#233`. Both were completed before final closeout.

- Esti Dratler `#53986` is linked to Dratler Family household `#1312` /
  `dratler_family`, with accountability event `#96` and clean goal item `#97`.
- The Operations workspace directory now shows exactly `platform`, `bna`,
  `rabbi_sheller_provider`, and `dratler_family`.
- Duplicate provider workspace `provider_1` and unrelated individual household
  workspaces are not visible in the operator switcher.
- Final deployment: `ca0075c2-5ce1-4a70-b6c8-e8d2c116adae`.
- Final live smoke:
  `ops/live-smokes/2026-06-17T18-30-21-330Z-live-app-smoke.md`.
- Final queue proof:
  `ops/system-audits/2026-06-17T18-31-06-470Z-task-queue-reconciler.md`
  and fleet status with observable jobs `0`.
