# Codex Implementation Spec: WS03 Pending/access, Duplicate Pending Items, Done Actions, and Done/history Links

Cycle ID: `2026-06-15-cycle-ops-queue-helper-integrations`

Workstream ID: `WS03`

Repo: `shloimie-beep/bnei-neviim-academy`

Local workspace audited: `C:\Users\User\BNA v2.0`

Date prepared: `2026-06-15`

## Purpose

Fix the Operations task queue so Pending/access cards are actionable, duplicate pending cards are reconciled, Done/history cards expose verification artifacts, and completed work cannot silently look verified when it has no proof link.

This is a Codex-ready implementation spec. Do a short freshness check before editing because line numbers may drift, but do not redo the whole audit unless the relevant files have materially changed.

## Audit Snapshot

- Current branch during audit: `cleanup/onboarding-helper-crm-workspace-rabbi`
- Remote during audit: `https://github.com/shloimie-beep/bnei-neviim-academy.git`
- Last commit during audit: `ff9be174c7c65c7db41d5f4ad1c249881974f085` (`docs: record goal-mode verification evidence`, `2026-06-14 19:44:40 +0300`)
- Worktree during audit: dirty, with many modified and untracked files. Do not reset, checkout, or revert unrelated work.
- Active Operations UI: `public/operations.html`
- Active API/runtime: `server.js`
- `src/app/api` did not exist during audit. Do not implement this work in a dormant Next route tree.
- Archived files under `docs/archive/` are historical reference only. Do not edit archived TaskApp or legacy family-accountability surfaces for this work.
- Do not add GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ behavior. Active behavior belongs in first-party BNA Operations tables/APIs.

## User-facing Symptoms To Fix

1. Pending/access cards repeat or look duplicated, especially variants of `Get website and landing-page assets`.
2. Pending/access cards are mostly passive. They show `Open`, but they do not give clear queue actions such as request missing input, mark received, convert to task, mark done, or archive duplicate.
3. Done/history cards do not expose report/artifact links clearly.
4. Done/history does not flag completed items whose report/proof link is missing or broken.
5. Parser/seed/rerun paths can create duplicate queue records because they do not share one durable task-level idempotency contract.

## Files Audited

- `public/operations.html`
- `server.js`
- `package.json`
- `tests/rabbi-task-dialogue.test.js`
- `tests/workspace-task-no-stale-agent.test.js`
- `tests/operations-task-comments-and-dictation.test.js`
- `tests/intake-parser.test.js`
- `tests/action-registry-telegram-ui-bot.test.js`
- `tests/task-queue-reconciler.test.js`
- `scripts/agent-fleet-supervisor.mjs`
- `scripts/task-queue-reconciler.mjs`
- `scripts/rabbi-task-flow-audit.mjs`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`
- `railway-migration-2026-06-15-rabbi-task-dialogue.sql`

## Current Implementation Findings

### Operations UI

File: `public/operations.html`

- `TASK_LANE_IDS` includes `decisions`, `pending`, `tasks`, `schedule`, `done`, and `activity`.
- `RABBI_DIALOGUE_COLUMNS` labels the human blocker lane as `Pending/access` and the completed lane as `Done/history`.
- `taskStatusBucket(task)` routes:
  - `task_kind === 'history'` to `done`
  - `task_kind === 'decision'` to `decisions`
  - `task_kind === 'pending_access'` to `pending`
  - `task_kind === 'agent_job'` to `tasks`
  - completed/verified/done/archive states to `done`
  - non-agent `waiting_on` rows to `pending`
- `renderTaskCard(task, columnId)` renders card badges, title, summary/detail, and an `Open` button, then appends `renderTaskActions(task, columnId)`.
- `renderTaskActions(task, columnId)` currently returns action buttons only for `decisions`, `mine`, and `rabbi` columns. It returns no actions for `pending` or `done`.
- `taskEndpointAction(event, taskId, action, payload)` already posts to `/api/bna/tasks/:id/actions/:action`, so new actions can reuse this UI helper.
- `taskAction(event, taskId, updates)` uses `PATCH /api/bna/tasks/:id`.
- `taskDisplayDetail(task, columnId)` shows `verification_notes` for Done/history cards when present, but does not render report or proof links.
- `renderTaskDetailPage` shows comments and activity, but report paths in activity are escaped as plain text.
- `renderCodexStatusDetails()` displays `Report: ${job.report_path || job.ledger_ref || job.changelog_ref}` as escaped text, not a clickable or validated artifact link.

### Backend And Data Model

File: `server.js`

- `TASK_DIALOGUE_KINDS` includes `decision`, `pending_access`, `task`, `agent_job`, and `history`.
- `bna_tasks` has task fields such as `task_kind`, `display_title`, `summary`, `why_exists`, `next_action`, `waiting_on`, `agent_status`, source fields, parser summary fields, blocker fields, decision fields, `last_activity_at`, `verified_at`, and `verification_notes`.
- `bna_tasks` did not have task-level `dedupe_key`, `duplicate_of_task_id`, `received_at`, `requested_at`, `proof_links_json`, `proof_status`, `report_path`, `ledger_ref`, or `changelog_ref` during audit.
- `bna_agent_jobs` and `bna_tickets` do have `report_path`, `ledger_ref`, and `changelog_ref`.
- `applyAgentJobLinkedStatus()` copies completion state into the linked task and sets `task_kind = 'history'`, but it does not copy or project job report refs into the task record.
- `GET /api/bna/tasks` enriches tasks with latest job status and counts, but does not return latest job report refs or normalized proof links.
- `GET /api/bna/tasks/:id` joins the latest job, but only returns status/title/summary/blocker/error/heartbeat timestamps, not report refs.
- Existing task action endpoints:
  - `spawn-agent-job`
  - `mark-done`
  - `mark-pending`
  - `convert-to-task`
  - `reassign`
  - `needs-more-info`
  - `choose-decision`
- Missing action endpoints:
  - `mark-received`
  - `request-missing-input`
  - `archive-duplicate`
  - proof link repair/check endpoint
- Current `mark-done` accepts notes and marks the task completed/history, but it does not require or classify proof/report links.
- Current `needs-more-info` turns a card into a Decision. That is not the same as keeping a Pending/access card while requesting missing access/input.

### Duplicate And Idempotency Paths

File: `server.js`

- `createTaskFromText()` inserts a new `bna_tasks` row and does not apply a universal dedupe key.
- `captureIncomingBotMessage()` dedupes exact Telegram messages by `source_channel`, `source_chat_id`, and `source_message_id`, but not repeated same-intent tasks across different messages, parser runs, or seeders.
- Canonical intake parser idempotency exists at parse-run and parse-item level:
  - `createCanonicalIntakeParseRun()` keys by input hash, parser version, source type, and source id.
  - Parse items have a unique `(parse_run_id, item_key)` contract.
  - `fileIntakeParseRun()` skips already filed parse items.
  - `fileTaskIntakeItem()` still calls `createTaskFromText()` without task-level dedupe.
- `ensureOneTimePendingAccessDialogueCards()` seeds explicit pending access items, including:
  - seed key: `website-assets-pending-access`
  - visible title: `Get website and landing-page assets`
  - fuzzy pattern: `website assets|site assets|landing page assets|current website|homepage assets`
- `railway-migration-2026-06-15-rabbi-task-dialogue.sql` also seeds the same family of pending access cards.
- `ensureRabbiSchellerLaunchTasks()` seeds broader Rabbi/One Time launch tasks, including launch-page and asset-related tasks that can be conceptually close to the explicit pending-access cards.
- `normalizedTaskTitleKey(title)` exists, but it is not used as part of a universal task idempotency key.
- Existing seeders prevent some future duplicate seeds with fuzzy `NOT EXISTS`, but they do not collapse historical duplicates and do not cover parser/manual/rerun paths.

### Done/history Artifact Paths

- `scripts/agent-fleet-supervisor.mjs` writes run reports under `ops/agent-fleet-runs/*.md` and `*.json`.
- Agent completion patches include `report_path`, `ledger_ref`, and `changelog_ref` on agent job/ticket records.
- `ops/agent-task-ledger.jsonl` contains records with reports, verification, files, live smoke reports, and deployment IDs.
- `ops/agent-changelog.md` contains many `Report: ops/...` references.
- The Operations UI does not currently turn those artifact paths into Done/history proof links.
- Express serves `public` statically. Repo files under `ops/` are not publicly static by default and should not be exposed with a broad static mount.

## Root Cause

The visible queue mixes several task producers without one shared task-level idempotency contract:

- Seeders use local fuzzy guards.
- Canonical intake dedupes parse runs/items but not the final task row.
- Telegram capture dedupes exact message IDs but not repeated task intent.
- Manual/API task creation can still insert another similar pending card.
- Completion artifacts are stored on jobs/tickets and logs, while the task card only stores general completion notes.
- UI action rendering is column-limited, so Pending/access and Done/history cards do not expose the actions their state requires.

## Required Implementation

### 1. Start With Tracking

Before changing runtime files, append a `started` record to `ops/agent-task-ledger.jsonl`:

```json
{"timestamp":"<ISO timestamp>","cycle_id":"2026-06-15-cycle-ops-queue-helper-integrations","workstream_id":"WS03","status":"started","source":"ramble_protocol","title":"Fix Pending/access duplicates, card actions, and Done/history proof links"}
```

If blocked, append a `blocked` record with `blocker` and `needed_from_shloimie`.

When done, append a `done` record with `summary`, `files_changed`, and `tests_run`.

Also append a concise entry to `ops/agent-changelog.md`. If architecture/state files change, update `SYSTEM-STATE.md` or the current equivalent if it exists. If the work cannot be completed in one pass, update this handoff file with the exact remaining state. Do not silently leave work in progress.

### 2. Add Durable Task Idempotency

Add a migration using the repo's current migration convention. If there is no migrations folder, add a root-level Railway migration file such as:

`railway-migration-2026-06-15-pending-access-dedupe-done-links.sql`

Recommended `bna_tasks` additions:

```sql
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS dedupe_key TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS duplicate_of_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS status_detail TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS requested_by TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS received_by TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS proof_links_json JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS proof_status TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS proof_checked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bna_tasks_dedupe_key ON bna_tasks(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_duplicate_of_task_id ON bna_tasks(duplicate_of_task_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_status_detail ON bna_tasks(status_detail);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_proof_status ON bna_tasks(proof_status);
```

After the cleanup script has archived duplicate active rows, add a partial unique index for active pending/access rows:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bna_tasks_active_pending_access_dedupe
ON bna_tasks(dedupe_key)
WHERE task_kind = 'pending_access'
  AND duplicate_of_task_id IS NULL
  AND COALESCE(stage, '') NOT IN ('archive', 'done')
  AND dedupe_key IS NOT NULL
  AND dedupe_key <> '';
```

Allowed `status_detail` values for this work:

- `pending_access`
- `requested`
- `received`
- `converted_to_task`
- `duplicate_archived`
- `done_with_report`
- `done_missing_link`
- `done_broken_report_link`
- `done_needs_verification`

Allowed `proof_status` values:

- `valid`
- `missing`
- `broken`
- `unchecked`
- `not_required`

### 3. Define The Dedupe Key

Implement a shared helper in `server.js` or a local task helper module already used by `server.js`.

Required key shape:

`normalized_kind + normalized_title + project + owner + waiting_on + source_ref`

Rules:

- Use existing `normalizedTaskTitleKey(title)` as the base title normalizer if still present.
- Normalize whitespace, punctuation, hyphens, and case.
- Strip low-value prefixes such as `get`, `need`, `collect`, `ask for`, and `request` only if doing so does not collapse unrelated tasks.
- Normalize `pending_access`, `waiting_on_input`, and similar human-blocked access tasks into the same kind bucket for pending dedupe.
- `source_ref` must be stable intent/source identity, not a volatile Telegram `message_id`. For seeds, use the stable seed key. For parser/manual records, use a stable source category or canonical source object when available.
- Do not include raw message text in the key.
- Store the computed key in `bna_tasks.dedupe_key` on every new task row.

When creating a task:

1. Compute the dedupe key.
2. Look for an active canonical row with the same key and `duplicate_of_task_id IS NULL`.
3. If found, do not insert another visible task. Update activity/source metadata if useful, add a comment/activity record noting the duplicate intake, and return the canonical task with a `deduped: true` marker to callers.
4. If not found, insert the new row with `dedupe_key`.

Update these producers to use the shared path:

- `createTaskFromText()`
- `fileTaskIntakeItem()`
- `captureIncomingBotMessage()` task creation path
- `ensureOneTimePendingAccessDialogueCards()`
- `ensureRabbiSchellerLaunchTasks()` where it creates BNA task rows
- Any seed/migration helper in `server.js` that inserts pending access or launch tasks

### 4. Add Backend Actions

Add endpoints under the existing pattern:

- `POST /api/bna/tasks/:id/actions/request-missing-input`
- `POST /api/bna/tasks/:id/actions/mark-received`
- `POST /api/bna/tasks/:id/actions/archive-duplicate`
- Enhance `POST /api/bna/tasks/:id/actions/mark-done`
- Enhance `POST /api/bna/tasks/:id/actions/convert-to-task`

Action semantics:

`request-missing-input`

- Valid for `pending_access`, `task`, and human-blocked cards.
- Keeps the row in Pending/access.
- Sets `task_kind = 'pending_access'` if needed.
- Sets `status_detail = 'requested'`.
- Sets `requested_at` and `requested_by`.
- Records the requested item in comments/activity.
- Does not turn the item into a Decision.

`mark-received`

- Valid for Pending/access cards.
- Sets `status_detail = 'received'`.
- Clears or narrows `waiting_on`.
- Sets `received_at` and `received_by`.
- Records an activity/comment with who marked it received and optional notes.
- If the card is ready for Codex or already had a linked agent path, move it to `task_kind = 'task'` or the existing Codex-ready bucket according to current conventions.
- If it still needs human work, keep it visible as a normal task, not Pending/access.

`archive-duplicate`

- Requires `canonical_task_id` unless the duplicate can be auto-resolved by dedupe key.
- Sets `duplicate_of_task_id`.
- Sets `stage = 'archive'`.
- Sets `status_detail = 'duplicate_archived'`.
- Adds a comment/activity record containing the canonical task ID and reason.
- Never deletes the duplicate row.

Enhanced `convert-to-task`

- Clears human blocker fields that have been satisfied.
- Sets `status_detail = 'converted_to_task'`.
- Preserves comments, provenance, dedupe key, and duplicate linkage.

Enhanced `mark-done`

- Accept optional `proof_links`, `report_path`, `ledger_ref`, and `changelog_ref`.
- Populate `proof_links_json` with normalized link objects.
- If proof exists and validates, set `proof_status = 'valid'` and `status_detail = 'done_with_report'`.
- If no proof is present and the task type normally requires proof, set `proof_status = 'missing'` and `status_detail = 'done_missing_link'`.
- If proof exists but validation fails, set `proof_status = 'broken'` and `status_detail = 'done_broken_report_link'`.
- Do not pretend a missing-proof item is fully verified. Either leave `verified_at` null or make the UI clearly show that verification proof is missing.
- Preserve current completion behavior for tasks where proof is explicitly not required, using `proof_status = 'not_required'`.

### 5. Surface Proof Links Safely

Update `GET /api/bna/tasks` and `GET /api/bna/tasks/:id` so the UI receives:

- `dedupe_key`
- `duplicate_of_task_id`
- `status_detail`
- `requested_at`
- `received_at`
- `proof_links`
- `proof_status`
- `proof_checked_at`
- latest agent job `report_path`, `ledger_ref`, and `changelog_ref`
- ticket-level `report_path`, `ledger_ref`, and `changelog_ref` if task links through a ticket

Backfill task proof links from these sources, in priority order:

1. `bna_tasks.proof_links_json`
2. linked latest `bna_agent_jobs.report_path`
3. linked `bna_tickets.report_path`
4. path-like references in `verification_notes`
5. matching records in `ops/agent-task-ledger.jsonl`
6. matching `Report: ops/...` references in `ops/agent-changelog.md`

Do not add a broad static mount for `ops/`.

If clickable repo artifacts are needed, add an authenticated allowlisted endpoint such as:

`GET /api/bna/task-artifact?path=<repo-relative-path>`

Endpoint requirements:

- Must use the same auth/protection assumptions as the Operations dashboard.
- Reject absolute paths, `..`, URL-encoded traversal, and paths outside the repo.
- Allow only needed prefixes, for example `ops/agent-fleet-runs/`, `ops/system-audits/`, `content-memory/`, and screenshot/report folders already used by BNA.
- Allow only safe extensions needed for reports and screenshots, for example `.md`, `.json`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`.
- Never expose `.secrets`, keyholder paths, env files, or arbitrary repo files.
- Return a useful error and set `proof_status = 'broken'` when the repo-relative file does not exist.

Proof link object shape:

```json
{
  "label": "Agent fleet report",
  "type": "repo_path",
  "path": "ops/agent-fleet-runs/example.md",
  "url": "/api/bna/task-artifact?path=ops%2Fagent-fleet-runs%2Fexample.md",
  "status": "valid"
}
```

External URLs can be rendered directly if they pass normal URL validation. Optional `HEAD` checks should time out quickly and treat unknown network state as `unchecked`, not broken.

### 6. Update Operations UI

File: `public/operations.html`

Update `renderTaskActions(task, columnId)` so Pending/access and Done/history cards have state-appropriate actions.

Pending/access card actions:

- `Request input/access`
- `Mark received`
- `Convert to task`
- `Mark done`
- `Archive duplicate`

Use existing button styling and `taskEndpointAction()` patterns. Keep the cards compact and scannable.

Required UI behavior:

- `Request input/access` prompts for or accepts a short note, then calls `request-missing-input`.
- `Mark received` prompts for optional notes, then calls `mark-received`.
- `Convert to task` calls enhanced `convert-to-task`.
- `Mark done` allows a proof/report path or explicit no-proof note, then calls enhanced `mark-done`.
- `Archive duplicate` requires a canonical task ID or provides a safe duplicate selection if a matching canonical task is known.
- Pending cards should show `Requested`, `Received`, or `Pending/access` status badges based on `status_detail`.
- Duplicate archived cards should not appear as active Pending/access cards.

Done/history card behavior:

- Show `Done with report`, `Missing proof`, `Broken proof`, `Needs verification`, or `No proof required` based on `status_detail` and `proof_status`.
- Render proof links as clickable links or buttons.
- If a proof path is broken, show it as a visible flagged item rather than hiding it.
- Preserve `verification_notes`, but do not rely on free text as the only proof display.
- Done/history cards may keep `Open`, but the detail page must also show proof links and proof status.

Detail page behavior:

- Show duplicate linkage if present: `Duplicate of #<id>` and link/open canonical task.
- Show requested/received timestamps when present.
- Show proof links and validation status.
- Show latest agent job report refs.

Layout constraints:

- Verify desktop and mobile widths.
- Text must not overlap or overflow buttons/cards.
- Do not introduce nested cards.
- Do not add explanatory marketing text inside the app.

### 7. Cleanup Existing Duplicates

Add a dry-run-first script:

`scripts/pending-access-dedupe-done-links-audit.mjs`

Capabilities:

- Query active `bna_tasks` from the configured database/API path used by the repo.
- Compute the new dedupe key for existing tasks.
- Group active Pending/access duplicates.
- Specifically report all cards matching:
  - `Get website and landing-page assets`
  - `website assets`
  - `landing page assets`
  - `site assets`
  - `current website`
  - `homepage assets`
- Report older broad overlap candidates such as access/materials cards from the Rabbi/One Time launch work, but do not auto-archive broad conceptual overlaps unless they share the exact dedupe key.
- Select a canonical task per duplicate group:
  - prefer an active task with the most comments/activity
  - then newest useful `updated_at`
  - then lowest ID for stability
- Mark other active duplicates as `duplicate_archived` only when run with:

```powershell
node scripts/pending-access-dedupe-done-links-audit.mjs --apply --confirm APPLY_PENDING_ACCESS_DEDUPE
```

Dry-run output:

- `ops/system-audits/<timestamp>-pending-access-dedupe-done-links.md`
- `ops/system-audits/<timestamp>-pending-access-dedupe-done-links.json`

Apply-mode requirements:

- Archive duplicates using the same backend helper/action logic as the API if possible.
- Never delete rows.
- Append comments/activity to both duplicate and canonical tasks.
- Print and write a summary of canonical IDs, archived duplicate IDs, and unresolved review candidates.

### 8. Backfill Done/history Proof Links

The same script, or a second script if cleaner, should:

- Find Done/history tasks with missing `proof_links_json`.
- Attempt to resolve proof links from linked job/ticket/report/changelog/ledger data.
- Validate repo-relative paths against the local filesystem.
- Flag missing proof with `proof_status = 'missing'` and `status_detail = 'done_missing_link'`.
- Flag broken proof with `proof_status = 'broken'` and `status_detail = 'done_broken_report_link'`.
- Set `proof_status = 'valid'` and `status_detail = 'done_with_report'` when a proof link exists and is valid.
- Leave a clear audit report for anything that could not be resolved automatically.

### 9. Tests To Add Or Update

Add or update tests around these behaviors:

- Pending/access seeders are idempotent across repeated startup/seed runs.
- `createTaskFromText()` returns an existing active task instead of inserting a duplicate when dedupe keys match.
- Canonical intake filing does not create duplicate task rows across repeated same-intent parser runs.
- `Get website and landing-page assets` variants collapse to one active Pending/access card.
- `mark-received` updates status, timestamps, waiting fields, and activity.
- `request-missing-input` keeps the card in Pending/access and does not create a Decision.
- `archive-duplicate` links to the canonical task and removes the duplicate from active Pending/access.
- `mark-done` with valid proof sets `done_with_report`.
- `mark-done` without proof sets `done_missing_link` or equivalent and does not pretend full verification.
- Done/history API responses include proof links and latest agent job report refs.
- Operations UI renders Pending/access actions and Done/history proof badges/links.

Likely test files:

- `tests/rabbi-task-dialogue.test.js`
- `tests/intake-parser.test.js`
- `tests/workspace-task-no-stale-agent.test.js`
- `tests/operations-task-comments-and-dictation.test.js`
- `tests/action-registry-telegram-ui-bot.test.js`
- New focused file if cleaner: `tests/pending-access-dedupe-done-links.test.js`

### 10. Verification Commands

Run at minimum:

```powershell
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
node --check scripts/pending-access-dedupe-done-links-audit.mjs
node --test tests/rabbi-task-dialogue.test.js tests/intake-parser.test.js tests/workspace-task-no-stale-agent.test.js tests/operations-task-comments-and-dictation.test.js tests/action-registry-telegram-ui-bot.test.js
npm test
```

Run the cleanup/audit script in dry-run mode before apply mode:

```powershell
node scripts/pending-access-dedupe-done-links-audit.mjs
```

If dry-run output is correct, apply only with the explicit confirmation flag:

```powershell
node scripts/pending-access-dedupe-done-links-audit.mjs --apply --confirm APPLY_PENDING_ACCESS_DEDUPE
```

Browser verification:

- Start the local app.
- Open the live Operations dashboard surface, not archived React prototypes.
- Verify a Pending/access card shows all required actions.
- Exercise `Request input/access`, `Mark received`, `Convert to task`, and `Archive duplicate` against test-safe records.
- Verify the Done/history lane shows proof link states.
- Check desktop and mobile viewport widths for overlap.

Because this is app-visible/dashboard-visible work, local verification is not enough. After implementation:

```powershell
npm run railway:redeploy
npm run railway:doctor
npm run app:smoke
```

If deployment is unavailable or fails, keep the task open, append a blocked ledger record, and notify Telegram or the current operator channel with the blocker.

## Acceptance Criteria

- Only one active Pending/access card remains for `Get website and landing-page assets` and close title variants.
- Existing duplicate rows are preserved but archived/linked to the canonical task.
- Future seed, parser, Telegram, and manual creation paths share one dedupe key and do not create duplicate visible pending cards.
- Pending/access cards have visible actions for request, received, convert, done, and archive duplicate.
- `Mark received` records who/when/notes and moves the item out of the human-blocked Pending/access state when appropriate.
- `Request input/access` stays in Pending/access and records the request without turning the item into a Decision.
- Done/history cards show clickable proof/report links when available.
- Done/history cards with missing or broken proof are visibly flagged.
- Agent job report refs can surface on task list and task detail views.
- No broad static exposure of `ops/`, secrets, keyholder data, or arbitrary repo files is introduced.
- Tests and local browser checks pass.
- Live Railway deploy/doctor/smoke are completed or a clear blocked record is appended.
- `ops/agent-task-ledger.jsonl` and `ops/agent-changelog.md` are updated with start/done/blocked records.

## Final Report Requirements

The implementing Codex turn must report:

- Files changed.
- Migration name and whether it was applied locally/live.
- Duplicate audit report path.
- Canonical ID kept for `Get website and landing-page assets`.
- Duplicate IDs archived.
- Done/history proof backfill summary:
  - valid
  - missing
  - broken
  - unchecked
- Tests run and exact pass/fail status.
- Local browser verification performed.
- Railway deploy ID or failure reason.
- Any remaining human decisions needed.

## 2026-06-15 Codex Implementation Update

Status: code implemented and locally verified, but WS03 is blocked for live
database cleanup and deployment.

Implemented locally:
- Added additive task workflow, dedupe, requested/received, duplicate-linkage,
  and proof-link fields in `server.js` startup/bootstrap and in
  `railway-migration-2026-06-15-pending-access-dedupe-done-links.sql`.
- Added shared dedupe helpers in the `createTaskFromText()` path so active
  duplicate Pending/access cards resolve to a canonical row instead of creating
  another visible task.
- Added proof-link normalization and a protected allowlisted artifact endpoint:
  `/api/bna/task-artifact?path=...`.
- Added task actions `request-missing-input`, `mark-received`, and
  `archive-duplicate`; enhanced `mark-pending`, `convert-to-task`, and
  `mark-done`.
- Projected latest agent-job report, ledger, changelog, and proof-link metadata
  into task list/detail API responses.
- Updated `scripts/agent-fleet-supervisor.mjs` so completed linked jobs write
  structured proof links/status back to the task.
- Updated `public/operations.html` so Pending/access cards show request,
  received, convert, done, and duplicate-archive actions; Done/history cards
  show proof badges, proof links, and proof warnings.
- Added `scripts/pending-access-dedupe-done-links-audit.mjs` for dry-run/apply
  duplicate cleanup and Done/history proof backfill.
- Added `tests/pending-access-dedupe-done-links.test.js`.

Verification completed:
- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check scripts/pending-access-dedupe-done-links-audit.mjs`
- PASS `node --test tests/pending-access-dedupe-done-links.test.js`
- PASS focused task/parser/action suite 63/63:
  `tests/rabbi-task-dialogue.test.js`,
  `tests/intake-parser.test.js`,
  `tests/workspace-task-no-stale-agent.test.js`,
  `tests/operations-task-comments-and-dictation.test.js`,
  `tests/action-registry-telegram-ui-bot.test.js`,
  `tests/pending-access-dedupe-done-links.test.js`
- PASS individual compatibility regressions:
  `tests/bna-brand-shell.test.js`,
  `tests/workspace-person-household-provider-contract.test.js`,
  `tests/parent-student-portal-contract.test.js`
- PASS local in-app browser smoke on `http://127.0.0.1:8080/operations.html`:
  desktop and mobile Operations shell rendered, no console errors, no malformed
  trailing `.js">` text, and mobile width had no horizontal overflow.
- PASS `npm test` 592/592
- PASS `git diff --check`

Blocked verification:
- `node scripts/pending-access-dedupe-done-links-audit.mjs` failed before
  producing duplicate/proof counts:
  `getaddrinfo ENOTFOUND db.amipeuneopdbzuhlnimt.supabase.co`.
- Because the database was unreachable, the migration was not applied, existing
  duplicate rows were not archived, canonical duplicate IDs are unknown, and
  Done/history proof backfill counts are unknown.
- Because the data cleanup could not run, Railway deploy/doctor/live smoke were
  not completed for this workstream.

Root cause confirmed:
- The visible queue had several task producers but no shared task-level
  idempotency contract. Seeders, parser filing, Telegram/manual task creation,
  and agent completion paths stored related state in different places. The
  implemented code centralizes dedupe on task creation and projects proof links
  back onto task rows.

Next exact steps:
1. Restore database/network access to the configured Postgres host or provide a
   reachable `DATABASE_URL`.
2. Apply `railway-migration-2026-06-15-pending-access-dedupe-done-links.sql`.
3. Run `node scripts/pending-access-dedupe-done-links-audit.mjs`.
4. Review the generated report, then run:
   `node scripts/pending-access-dedupe-done-links-audit.mjs --apply --confirm APPLY_PENDING_ACCESS_DEDUPE`.
5. Record the canonical `Get website and landing-page assets` task ID, archived
   duplicate IDs, and proof backfill counts in this handoff and the changelog.
6. Deploy, run Railway doctor and live app smoke, then append the WS03 `done`
   ledger record.
