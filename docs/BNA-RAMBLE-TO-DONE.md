# BNA Ramble To Done Protocol

This protocol exists so large operator rambles, GPT outputs, and Codex prompt
packets turn into resumable execution instead of half-finished task piles.

## Core Rule

Natural language is source input. A broad ramble or correction packet must
become stable requirements, current-state comparison, implementation batches,
verification evidence, and a next-session handoff before anyone claims it is
done.

## Requirement IDs

- Use stable IDs in `REQ-YYYYMMDD-###` format.
- Keep IDs stable across sessions, commits, audits, and handoffs.
- A requirement can be `not_started`, `in_progress`, `needs_verification`,
  `blocked`, `needs_operator_decision`, `done`, `already_satisfied`,
  `verified`, `failed`, `archived`, or `superseded`.
- Closed statuses need evidence. App-visible or server-visible closed statuses
  also need deployment/live evidence unless the item is explicitly blocked.
- `blocked` and `needs_operator_decision` rows need `blocker`,
  `blocker_owner`, and `blocker_next_action`.

## Source Mapping

Every broad ramble, GPT packet, audit package, Drive source, or connector input
must be registered as a source before requirements are closed.

Each registered source needs:

- source ID;
- repo source path or connector ID;
- timestamp;
- content fingerprint;
- privacy classification;
- workspace;
- project;
- source type.

Every captured source statement must map to one active requirement, an existing
requirement, or an explicit excluded/unrelated classification. For large
packets, keep the statement-level matrix in a separate JSON file and point the
active run at it through `source_statement_matrices`.

## Current-State Comparison

Before implementation, compare the requirement to the current repository:

- inspect the files, routes, APIs, schemas, registries, and tests involved;
- identify whether work is already satisfied, partially implemented, stale, or
  missing;
- record the baseline in the execution run;
- avoid duplicating an existing harness, route, test, or register.

Task titles are not proof. A task can say "done" while the app still lacks the
behavior, tests, deploy proof, or live smoke.

## Delta-First Inspection

Start with the smallest useful delta:

- read the active run and `NEXT-SESSION.md`;
- inspect recent commits and local dirty state;
- inspect only the relevant files before editing;
- prefer targeted tests before broader suites;
- do not start loops, crawls, watchdogs, deploys, or external writes unless the
  active requirement explicitly needs them and permission exists.

## No Unnecessary Loops

Do not run watch loops, agent fleet loops, full UI crawls, live deploys, or
production-data mutations as a side effect of resuming a ramble. Run only the
checks required for the current requirement and record what was skipped.

## Evidence-Based Completion

A requirement is not complete until the execution run records:

- inspected files/routes/workflows;
- implementation summary or already-satisfied proof;
- verification commands and results;
- evidence paths;
- ledger/changelog updates;
- deployment/live-smoke proof for app-visible or server-visible work, or an
  explicit blocker.

`done` means evidence exists. `blocked` means the blocker and next action are
specific enough for the next session to resume.

Deployment evidence must be positive proof for live-required closed work.
Phrases such as "not deployed", "deployment withheld", "dry-run only", or
"operator rule" can explain a blocker, but they cannot be the only deployment
evidence for a `done`, `already_satisfied`, or `verified` live-required row.

Evidence entries that are repo paths must exist. Do not point a completed
requirement at a missing file.

## NEXT-SESSION Handoff

Every active run with remaining work must have `NEXT-SESSION.md`.

The handoff must include:

- current branch and PR context;
- open requirement IDs and statuses;
- exact blockers;
- the next safe command or inspection step;
- commands that must not be run yet;
- the prompt to use after required external input arrives.

If work remains, `NEXT-SESSION.md` must name at least one open requirement ID.
A handoff that only says to continue later is stale.

There must be only one active execution run under `ops/execution-runs/`. If the
active pointer, branch, HEAD, remote HEAD, or PR reference is recorded in
`requirements.json`, `npm run bna:run:validate` must confirm it still matches
the local checkout.

## Independent Verification

Implementation and verification are separate jobs. A verification pass should
inspect the run, re-check changed files, run deterministic tests, and confirm
that evidence supports the claimed statuses. The verification agent should not
silently mark screenshot-based UI fixes done without audit output and proof.

## Audit Harness, Audit Output, Implementation

Keep these separate:

- Audit harness: the tool that captures screenshots, DOM/state, findings, and a
  review package. Building or testing the harness does not fix the UI.
- Audit output: the generated folder or `agent-review-package.zip` created by
  running the harness. The output is evidence and source material.
- Implementation: the actual UI/API/schema/test changes made after inspecting
  the audit output.

If the audit harness exists but the audit output is missing, UI remediation
requirements that depend on screenshots or state maps stay `blocked` with this
blocker:

`Waiting for user to upload agent-review-package.zip or audit output path`

## Execution Run Files

Execution runs live under `ops/execution-runs/<run-id>/` and include:

- `SOURCE.md`
- `REQUIREMENTS.md`
- `requirements.json`
- `BASELINE.md`
- `PLAN.md`
- `STATUS.md`
- `EVIDENCE.md`
- `TEST-RESULTS.md`
- `DEPLOYMENT.md`
- `NEXT-SESSION.md`
- `run.json`

Use `npm run bna:run:validate` before closeout and `npm run bna:run:resume`
when starting a new session.
