# Status

Current status: `READY FOR REVIEW - #83 Drive evidence plus local content-card/topic-filter repair; Issue #41 remains open`.

Done locally:

- Active run/register/raw source created.
- Policy doc added.
- Safe digest exporter added.
- Legacy raw exporter blocks default raw transcript-body export.
- Section classifier/router added.
- Digest memory generated for 29 recordings.
- `TRANSCRIPT-GAPS`, `REPAIR-CANDIDATES`, and
  `DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN` artifacts generated.
- GitHub issue #41 Drive addendum captured as `RAW-20260626-006`.
- Read-only Drive folder proof confirms `01 Transcript Library` exists, older
  #65-#70 docs exist, no docs were created after `2026-06-25T00:00:00Z`, and
  #83 is still absent from the transcript library.
- Owner approval `RAW-20260626-007` captured for the exact #83 non-dry-run
  Drive transcript-library sync.
- Approved #83 sync completed: 1 transcript job selected, 1 private Drive doc
  created, 0 updates, 0 AI calls, and Drive readback #83 was ok.
- PR #45 content-card/topic-filter addendum captured as `RAW-20260626-008`.
- Content card/topic filter audit completed for all 29 digest recordings:
  29 generated clean titles, 10 Needs parse states, 0 Needs routing, 0 Needs
  topic classification, 29 multi-topic cards, raw transcript bodies false.
- Local PR code makes Operations Content jobs receive digest-card metadata from privacy-safe
  repo manifests, and the Content UI shows clean title, summary, main points,
  categories, parse/digest/routing/topic status, and next action.
- The top topic filter now uses normalized multi-topic digest/classification
  categories and no longer depends on raw transcript-body topic search.
- Focused tests and privacy scan passed.

Remaining terminal blocker:

- `REQ-20260626-126` / `DEC-20260626-101`: owner approval is required before
  any raw export, any further Drive write beyond #83, production reparse/
  canonical write, worker retry, paid retranscription, class backfill, broad
  Drive sync, or other production mutation.
- `REQ-20260626-131` / `REQ-20260626-132` / `REQ-20260626-133`:
  app-visible Operations UI Done/final-verification status requires PR
  review/merge plus deploy/live-smoke proof.

Issue #41 is not marked done.
