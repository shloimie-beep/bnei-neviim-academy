# One Time Task And Decision Production Census

Generated: 2026-06-24T17:27:16.936Z
Source: none
Read only: yes
Tasks seen: 0

## Lane Counts

- decisions: 0
- tasks: 0
- codex_queue: 0
- pending: 0
- calendar: 0
- done_activity: 0

## Audit Dimensions

- workspace
- project
- source
- owner
- status
- requirement
- agent run
- contact
- student
- provider
- duplicate fingerprint
- age
- last activity

## Default Task Views

| View | Description |
| --- | --- |
| My Tasks | Open work owned by Shloimie/operator roles. |
| One Time Tasks | Open One Time Mishnah Class work only. |
| Codex / Agent Work | Machine work and observable agent jobs. |
| Blocked | Open work blocked by a human or external account/system. |
| Due Soon | Open work due within seven days. |
| Calendar | Open work with a planned or due date. |
| Done / Activity | Closed work and recent task activity. |
| Archived | Reversible archive, duplicate, or hidden records. |

## Default Decision Views

| View | Description |
| --- | --- |
| Needs My Decision | Open Decisions owned by Shloimie/operator roles. |
| Needs Rabbi Scheller | Open Decisions owned by Rabbi Ellie Scheller or provider staff. |
| Needs External Owner | Open Decisions blocked by an outside account, credential, legal, billing, DNS, or platform owner. |
| Decided | Decisions with a selected outcome or terminal lifecycle status. |
| Superseded | Duplicate, stale, or replaced Decision records. |
| Archived | Hidden or archived Decision records. |

## Card Contract

- concise title
- owner
- workspace
- project
- priority
- status
- next action
- blocker
- source
- due date
- latest meaningful activity
- direct action

## Warnings

- BNA_APP_URL/OPS_USERNAME/OPS_PASSWORD unavailable for live API read.
- DATABASE_URL unavailable for read-only DB census.

## Default View Rules

- My Tasks: open work assigned to or waiting on Shloimie/operator roles.
- One Time Tasks: open rabbi_sheller_provider / one_time_mishnah_class records only.
- Codex / Agent Work: Codex/agent/system work and agent_job rows, including queued/running/failed machine states.
- Blocked: human or external blockers only, with blocker owner and next action.
- Due Soon: open work due within seven days.
- Calendar: open work with due_date or planned_at.
- Done / Activity: done/archive/history rows with proof or verification notes.
- Archived: archived, hidden, or duplicate-archived rows excluded from default active views.

## Duplicate Groups

| Group fingerprint | Lane | Workspace | Project | Count | Task IDs | Source fingerprints | Dry-run action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none |  |  |  | 0 |  |  |  |

## Violations

| Type | Severity | Task ID | Lane | Workspace | Recommendation |
| --- | --- | --- | --- | --- | --- |
| none |  |  |  |  |  |

## Dry-Run Cleanup Plan

| Action | Reversible | Applies to | Reason | Apply gate |
| --- | --- | --- | --- | --- |
| none |  |  |  |  |

## Before Counts

- tasks seen: 0
- duplicate groups: 0
- violation types: 0

## After Counts

- dry run only: no production mutation was applied in this census.
- after-count snapshot if applied now: 0 tasks seen

## Workspace Isolation

- BNA records in One Time: 0
- One Time records in BNA: 0
- Passed: yes

## Reversible Apply Workflow

- This report is read-only and does not apply cleanup.
- Before any apply step, export affected task rows and comments.
- Apply one action family at a time: duplicate archive/linking, lane correction, decision owner/prompt repair, proof attachment, then title cleanup.
- Keep internal briefs and raw source wording as evidence/provenance, not visible Pending cards.
- After any approved apply, rerun this census and `npm run bna:run:validate`.

