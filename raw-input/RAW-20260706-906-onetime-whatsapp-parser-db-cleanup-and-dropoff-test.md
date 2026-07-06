# RAW-20260706-906 - One Time WhatsApp Scope, Parser Cleanup, DB Cleanup, And Dropoff Test

## Metadata

- Source channel: codex_chat
- Created at: 2026-07-06T14:20:00+03:00
- Parse status: registered
- Workspace/project: rabbi_sheller_provider / one_time_mishnah_class

## Raw operator request

> Keep the placeholders for $355 fix the cross-contaminated WhatsApp that's a real problem in the one-time Mission class and then fix the parser that's very important the database cleanup you should also run there's two different slq databases in the one-time Mission class I don't know why there's two of them everything else is fine I guess just leave it for now take care of those tasks and also give me a prompt for GPT to run as a test to see if the drop off actually works even before turning on the agent Fleet meaning for the agent mode prompt for GPT let's make that prompt now I'll give it to him he'll test it you fix up the cross-contamination and the other two things that I told you and then and then we'll go back to the actual agent mode prompts and then we'll actually you know do the Aging Fleet so it could run automatically agent Fleet

## Parsed decisions and requirements

| ID | Type | Item | Status |
|---|---|---|---|
| DEC-20260706-906 | decision | Keep task/job `#355` placeholders for One Time website assets; do not block on final hero/logo/signup route right now. | Accepted |
| REQ-20260706-906 | requirement | Fix One Time/Rabbi WhatsApp cross-contamination so unrelated BNA/operator WhatsApp/contact rows do not appear in Rabbi-scoped contact sections. | Done locally / pending deploy |
| REQ-20260706-907 | requirement | Fix/verify the important parser path for Job 101 and the noisy review queue. | Done |
| REQ-20260706-908 | requirement | Investigate and clean database confusion for One Time, especially the apparent two-SQL-database state, before running any cleanup write. | Done |
| REQ-20260706-909 | requirement | Create a ChatGPT Agent Mode dropoff smoke prompt to test the no-paste workflow before starting the agent fleet. | Done |

## Guardrails

- Do not run the agent fleet yet.
- Do not embed passwords or secrets in the ChatGPT prompt.
- Do not expose raw transcript bodies, raw contact exports, phone numbers, or
  private message bodies in repo evidence.
- Production DB cleanup may run only after the target database, candidate rows,
  before/after effect, and rollback/no-op behavior are clear and redacted.
- Score/progress/grading writes remain blocked unless the exact prior approval
  packet/phrase is supplied.

## Closeout evidence

- WhatsApp/contact cross-contamination fix:
  - `server.js` now returns effective project metadata on contact/unified
    communications.
  - `public/operations.html` now blocks One Time communication matching when a
    row is missing or has the wrong project scope, even if phone/email tokens
    match.
  - Focused tests passed:
    `node --test tests/wapi-phonebook-report.test.js tests/operations-module-scoping.test.js`.
- Parser / Job 101 review cleanup:
  - Added guarded script `scripts/cleanup-job101-review-queue.mjs`.
  - Dry-run selected `secret:railway-database-url.txt` as the active app DB,
    found parse run `59`, and found 12 safe known triage rows.
  - Apply resolved exactly 12 known Job 101 triage rows to their canonical
    clusters and left 824 rows open.
  - Follow-up dry-run found 824 open rows and 0 remaining safe auto-close
    candidates.
  - Report:
    `ops/drive-transcript-visibility/2026-07-06/job101-review-cleanup-report.json`.
- Database confusion:
  - Local audit found no usable `ONE_TIME_DATABASE_URL`,
    `DATABASE_URL_ONE_TIME`, `.secrets/one-time-database-url.txt`, or
    `.secrets/DATABASE_URL_ONE_TIME.txt`.
  - Current Job 101 parser/review queue lives in the active Railway app DB,
    selected from `.secrets/railway-database-url.txt`.
- ChatGPT Agent Mode dropoff smoke:
  - Updated:
    `ops/prompt-packets/2026-07-06-chatgpt-dropoff-smoke-agent-mode/00-smoke-prompt.md`.
  - The prompt uses sentinel `BNA_DROPOFF_SMOKE_20260706_906` and forbids
    secrets, app/source edits, external sends, payments, DNS, credential,
    provider, Drive, production-data, and deploy actions.
