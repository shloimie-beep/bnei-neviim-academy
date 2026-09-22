# Meeting Intake / Task Parser Audit

Date: 2026-06-12

## Implemented / Confirmed

- Parent meeting recordings still upload through the parent portal into accountability processing.
- The bad Eitan coastal correction is now marked `hide_from_portals` and `portal_hidden`.
- Server portal visibility guards reject records with `hide_from_portals`, `portal_hidden`, or the exact known bad coastal transcript strings.
- Weekly private meeting fallback is now `09:40-10:00`, Sunday through Thursday, one 20-minute slot before 10:00 school start.
- Problem reports from parent help are routed to support-ticket review, not automatic Codex tasks.

## Verification

- PASS `node --check scripts\correct-audio-parse-2026-06-08.mjs`
- PASS focused parent/student/action-registry tests (39/39)
- PASS `npm test` (276/276)

## Notes

Historical memory/ledger records still contain the word `coastal`; those are not portal output. The live guard keeps the bad question hidden rather than deleting audit history.

## Remaining Work

- Run the correction script only when the target DB/data environment is explicitly approved.
- Keep any future parser corrections marked with portal visibility metadata when the transcript text is uncertain or not parent/student ready.
