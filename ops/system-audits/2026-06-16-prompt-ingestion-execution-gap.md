# Prompt Ingestion And Execution Gap Audit - 2026-06-16

## Question

Shloimie asked why many prompts, Markdown files, GPT-generated scopes, and
ramble-derived updates feel like they are not getting done, and whether Codex is
seeing the information being dropped into Downloads, attachments, and repo
memory/task files.

## Short Answer

Codex can read Downloads, attachments, and repo files when explicitly pointed at
them or when an audit task searches those paths. Codex is not automatically
watching `C:\Users\User\Downloads`, and a file appearing there does not become
an executable task by itself.

The main failure is not total invisibility. The failure is that the pipeline has
too many separate states:

- file exists,
- file was classified,
- requirement was mapped,
- task/handoff was created,
- local code was implemented,
- screenshots/tests passed,
- live deploy and Railway smoke passed,
- external/human blockers were resolved,
- ledger/task/dashboard state was closed.

Those states are currently spread across `TASKS.md`, `memory/YYYY-MM-DD.md`,
`tasks-pending/*.md`, `ops/download-prompt-audit/*`,
`ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`, queue audits, proof
folders, and live app task rows. That makes real work look lost even when it is
only blocked or locally complete.

## What Was Seen

### Downloads

Recent Downloads prompt material includes:

- `2026-06-16-parallel-chatgpt-prompts.zip`
- `2026-06-16-full-ws-closeout-parent-student-login-codex-prompt.md`
- WS01-WS11 prompt variants and duplicates from 2026-06-15
- ChatGPT Pro prompt packet files 00-10
- Kimi/Rabbi/One Time prompt files
- older BNA, registration, provider, public website, and legacy prompt files

The earlier Downloads audit classified 117 top-level Markdown files and 81
unique content groups. That audit concluded all top-level Markdown groups at the
time were classified. A newer full WS closeout prompt and the parallel prompt
zip arrived afterward and were handled through later tasks/attachments rather
than the old count.

The loose Stripe key file in Downloads was a separate secret-handling issue. It
was moved to the local BNA keyholder and removed from Downloads. It is not an
implementation prompt.

### Attachments

The 2026-06-16 ramble-router attachments were visible and map to:

| Attachment theme | Workstream |
| --- | --- |
| UI/public shell/Operations/mobile QA | `UI-01` |
| Operations workflows, decisions, pending/access, stale queue | `OPS-02` |
| Scoped BNA Helper with real tools | `HELPER-03` |
| Rabbi Scheller / OneTime product funnels and 7pm class | `RABBI-04` |
| Integrations/keyholder/external-action gates | `INT-05` |
| Community/course/gamification/parent progress | `COMMUNITY-06` |
| Parallel orchestrator/source-of-truth closeout | `MASTER-07` |

These were captured in `memory/2026-06-16.md`, `TASKS.md`, task handoffs, and
ledger records.

## Current State Of The Big Prompt Pack

| Workstream | Current state | Why it still feels unfinished |
| --- | --- | --- |
| Full WS01-WS11 plus parent-managed student login | Deployed and live-smoked on Railway deployment `dfbc65fa-fec4-4633-b45f-93adce342cc4`. | Remaining WS closeouts need live DB/fixture access, credentials, or decisions. |
| Downloads prompt audit | Classified the old top-level Markdown pile and produced status/evidence ledgers. | It is still open in `TASKS.md` because it is being used as an umbrella for remaining blocked closeouts. It is not a live watcher. |
| `MASTER-07` | Completed as coordination/proof/source-of-truth closeout. | It intentionally did not implement every child workstream itself. |
| `UI-01` | Local implementation, tests, screenshots, and no-overflow proof passed. | Live rollout is pending a clean/approved deploy path. |
| `OPS-02` | Local implementation and queue audit proof passed. | Live deploy, Railway smoke, and approved queue/data cleanup remain. |
| `HELPER-03` | Local helper APIs, drawer flow, permissions, redaction, tests, and screenshots passed. | Live helper reconciliation/deploy is pending a safe release path. |
| `RABBI-04` | Local draft product system, noindex funnel pages, 7pm calendar model, leads, and source-prep proof passed. | Live deploy and product decisions remain: prices, legal/refund copy, billing, launch copy, source transcript. |
| `INT-05` | Local integration readiness, approval gates, diagnostics, and Stripe keyholder storage are verified. | Live deploy plus provider credentials/DNS/account decisions remain. |
| `COMMUNITY-06` | Base WS11 privacy/readback deployed; additive extension locally verified. | Additive extension still needs clean/approved live rollout and migration. |

## Why Things Are Not Getting Done

1. Downloads is not an intake queue.
   Dropping a file into Downloads does not automatically create a Codex task.
   It only becomes active when a thread asks Codex to read it or a script/audit
   scans it.

2. "Covered" has been overloaded.
   The audit often says a prompt is covered when it is implemented locally,
   superseded, blocked, or already deployed. That is useful for mapping, but it
   is not the same as done.

3. App-visible work has a stricter done definition.
   `AGENTS.md` requires app/server/dashboard-visible work to deploy and pass
   live Railway doctor/smoke checks before it is truly done. Many items are
   locally complete but cannot be marked done yet.

4. The dirty worktree blocks safe releases.
   The repo currently contains many unrelated in-flight local workstreams. A
   normal Railway redeploy would ship the whole accumulated bundle, so agents
   keep stopping at "safe deploy window or isolated release path needed."

5. Human/external blockers are real blockers.
   Pricing, legal/refund wording, product launch decisions, DNS, account
   ownership, Buffer/Resend/Stripe/Zoom/Vimeo/Google credentials, source
   transcripts, and live fixtures cannot be responsibly guessed.

6. Queue and ledger records are stale.
   The latest queue audit showed many `Active stale` records, including
   ledger-only rows whose implementation may already be done or blocked. The
   status model needs terminal closeout records, not more duplicate starts.

7. `tasks-pending/*.md` is internal by design.
   Handoff briefs are intentionally not visible as public Pending cards. That
   is good for avoiding clutter, but it makes work feel hidden unless a visible
   register points to each brief.

8. Some GPT-generated prompts are audit scopes, not execution tickets.
   Several prompts tell Codex to audit/map/plan. Under the repo rules, prompt
   refinement mode does not imply implementation unless the request says build,
   apply, test, deploy, or otherwise executes a change.

## What Should Be Happening

Every prompt source should move through one canonical intake register:

1. Source appears by attachment, pasted text, Telegram, Downloads, or repo file.
2. Codex records source path, hash/fingerprint, timestamp, and whether it is
   secret-bearing.
3. Codex dedupes against previous prompt files.
4. Codex assigns a `cycle_id`, `workstream_id`, owner, status, and visible task
   link.
5. Codex writes or updates one handoff brief only if implementation context is
   needed.
6. Codex starts a ledger record before work.
7. Codex either implements and verifies, or records a terminal blocked state
   with exactly what is needed.
8. App-visible work is not marked done until deployed and live-smoked.
9. The visible queue shows one of: `not_started`, `running`, `local_verified`,
   `blocked_needs_human_decision`, `blocked_needs_credentials`,
   `blocked_needs_safe_deploy`, `deployed_verified`, `superseded`, or
   `legacy_excluded`.

## Recommended Fixes

1. Build a prompt intake register and scanner.
   Add a command that scans Downloads plus recent Codex attachments, hashes
   prompt files, detects duplicates, ignores/flags secret-bearing files, and
   writes a register under `ops/prompt-intake/`.

2. Separate "local complete" from "done".
   The dashboard/task queue should display `local_verified_live_followup`
   instead of leaving those items as vague active or pending work.

3. Add terminal closeout records for stale ledger items.
   Run a queue reconciliation pass that closes old ledger-only `Active stale`
   rows as `completed_verified`, `blocked`, `superseded`, or `legacy_excluded`
   based on proof.

4. Make GPT prompt packets machine-readable.
   Every generated prompt should include:
   `cycle_id`, `workstream_id`, `source`, `action_type`, `definition_of_done`,
   `requires_deploy`, `external_blockers`, `proof_commands`, and
   `terminal_status_rule`.

5. Use one safe prompt inbox.
   Instead of relying on random Downloads names and duplicate suffixes, copy or
   attach prompts into a canonical intake lane. Do not put secrets there.

6. Approve a release strategy.
   Choose either a deliberate accumulated-bundle deploy or isolated worktrees
   per workstream. Without that, local work will keep piling up behind the same
   live rollout blocker.

## Immediate Next Actions

1. Build the prompt intake scanner/register so new dropped files cannot vanish
   into Downloads.
2. Run a stale-ledger closeout pass for the 118 active-stale records reported
   by the queue audit.
3. Decide the release path for locally verified workstreams: `UI-01`, `OPS-02`,
   `HELPER-03`, `INT-05`, `RABBI-04`, and the `COMMUNITY-06` additive extension.
