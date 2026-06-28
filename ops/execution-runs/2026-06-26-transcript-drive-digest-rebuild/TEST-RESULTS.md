# Test Results

Passed:

- `node --check src/lib/bna/transcript-digest-export.js`
- `node --check scripts/export-content-digests.cjs`
- `node --check scripts/export-content-transcripts.mjs`
- `node --test tests/transcript-digest-export.test.js` - 8/8
- `node --test tests/two-week-class-intake-audit.test.js` - 7/7
- `npm run content:export-digests -- --privacy-scan` - 29 recordings, 0
  privacy findings
- `npm run content:sync-drive-library -- --dry-run --no-ai` - 75 transcript
  jobs with text, 59 real transcript jobs selected, 0 creates, 0 updates, 0
  AI calls; #83 planned create and #65-#70 planned updates
- `npm run content:sync-drive-library -- --no-ai --verify --job-id 83` - 1
  transcript job selected, 1 private Drive doc created, 0 updates, 0 AI calls,
  readback #83 9683 chars ok
- Read-only Drive folder listing - `01 Transcript Library` exists, 46 docs, 0
  docs created since `2026-06-25T00:00:00Z`, #65-#70 exist, #83 absent
- Post-sync read-only Drive folder listing - `01 Transcript Library` has 47
  docs, #83 exists, raw ID/link not tracked
- `npm run content:drive-intake-audit` - read-only audit, 18 Drive recordings,
  29 content jobs, 13 student question rows, final status PARTIAL
- `npm run content:card-topic-audit` - 29 digest recordings audited, 29
  generated clean titles, 10 Needs parse, 0 Needs routing, 0 Needs topic
  classification, 0 raw transcript bodies
- `node --test tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js` - 8/8
- `node --check server.js` - passed
- `node --check scripts/audit-content-card-topic-filter.cjs` - passed
- `npm run bna:run:validate` - passed after content-card/topic-filter repair,
  14 done, 3 blocked on deploy/live proof, and 1 needs-operator-decision
- `npm run bna:run:next` - passed, no unblocked executable batch
- JSON parse checks for package/run/digest/gap/repair/Drive-plan artifacts and
  `ops/agent-task-ledger.jsonl` - passed
- `npm run secrets:audit` - passed, 3392 tracked paths checked, 0 tracked
  secret-risk files found
- Targeted scan of the new #83 evidence and active run docs found no raw Drive
  URLs, raw transcript markers, or credential strings
- `git diff --check` - passed with line-ending warnings only

Full `npm test` was not run for this dry-run/digest batch because the change
is scoped to local tooling, docs, generated evidence, and focused parser/privacy
tests.

No broader full-suite run was performed.
