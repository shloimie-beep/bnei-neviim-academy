# BNA Start-to-Finish Ramble Protocol v3

**Repository:** `shloimie-beep/bnei-neviim-academy`
**Purpose:** Make a new GitHub-connected ChatGPT or Codex session capable of receiving a ramble, determining the actual repository state, completing the requested work, resuming safely when interrupted, and proving completion without wasting effort on repeated audits or loops.
**Version:** 3.0
**Created:** 2026-06-18

---

# 1. Fundamental rule

A prompt, plan, task, audit, screenshot, changelog line, or partial implementation is not completion.

The required lifecycle is:

1. requirement captured;
2. current implementation inspected;
3. requirement classified as existing, partial, missing, conflicting, or blocked;
4. implementation completed;
5. targeted tests passed;
6. full phase verification passed;
7. commit created;
8. deployment completed when live behavior is requested;
9. live behavior verified;
10. evidence recorded;
11. requirement closed.

No agent may claim that a run is complete while a non-blocked required item remains unverified.

---

# 2. Fresh-chat bootstrap

A new GitHub-connected ChatGPT conversation must be started with:

```text
Read `BNA-START-HERE.md` in the BNA repository, inspect the current run and current GitHub state, then process the ramble I provide according to the repository protocol. Do not restart completed work and do not trust task labels without implementation evidence.
```

The repository must contain:

```text
BNA-START-HERE.md
docs/BNA-RAMBLE-TO-DONE.md
templates/BNA-FRESH-CHAT-STARTER.md
templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md
templates/BNA-CODEX-VERIFICATION-PROMPT.md
ops/execution-runs/README.md
ops/execution-runs/latest.json
ops/execution-runs/requirements.schema.json
```

`BNA-START-HERE.md` is intentionally short. It points the new session to the durable protocol, active execution run, repository memory, and resume instructions.

A new chat does not automatically know prior conversation state. The protocol works because its durable state is committed to GitHub and the user gives the one-line bootstrap instruction above.

---

# 3. Sources of truth

Before processing a new ramble, inspect:

1. `BNA-START-HERE.md`
2. `docs/BNA-RAMBLE-TO-DONE.md`
3. `ops/execution-runs/latest.json`
4. the active run's `requirements.json`, `STATUS.md`, and `NEXT-SESSION.md`
5. `AGENTS.md`
6. `MEMORY.md`
7. `SYSTEM-STATE.md`
8. `TASKS.md`
9. newest relevant `tasks-pending/*.md`
10. recent `ops/agent-task-ledger.jsonl`
11. recent `ops/agent-changelog.md`
12. current `master`, branches, pull requests, working tree, and recent commits
13. relevant implementation and test files

Do not reread the entire repository repeatedly during one run. Produce one baseline inventory and use deltas afterward.

---

# 4. Credit- and time-efficiency policy

## 4.1 Delta-first inspection

At the beginning of a run:

- identify current branch and HEAD;
- identify the last verified run/commit;
- inspect only changes since that point;
- reuse existing route maps, audit reports, screenshots, test fixtures, and execution ledgers;
- do not rebuild tools that already exist and pass their own tests.

## 4.2 No unnecessary loops

Do not:

- run autonomous watch loops;
- start `agent:fleet --watch`;
- repeatedly poll the same status;
- run multiple agents against the same files;
- recreate the same plan after each phase;
- repeat a full UI crawl after every CSS change;
- rerun the complete test suite after every small edit;
- redeploy repeatedly to discover basic local failures;
- rewrite large files from scratch when a focused change is sufficient.

## 4.3 Test schedule

Use:

- focused tests after each requirement group;
- one phase-level test gate;
- one complete final local verification;
- one post-deployment live smoke when deployment is required.

A full Playwright/UI crawl should normally run at most:

1. once for baseline evidence, if no recent usable baseline exists;
2. once after implementation for final comparison.

Run additional targeted browser checks only for failed or ambiguous states.

## 4.4 Existing verified work

When an item appears complete:

1. inspect the implementation;
2. inspect its prior tests/evidence;
3. confirm the relevant code has not changed since that evidence;
4. run only the smallest targeted check needed;
5. mark it `closed_existing` in notes while retaining the canonical JSON status `closed`.

Do not consume credits rebuilding or re-auditing unchanged verified work.

## 4.5 External blockers

Check a missing credential, browser login, or external API once.

If unavailable:

- record the exact blocker;
- complete every credential-free step;
- provide one exact command/manual action;
- continue with unrelated requirements;
- do not loop on the unavailable dependency.

---

# 5. Ramble intake

For each new ramble, recording, transcript, screenshot set, or audit:

## 5.1 Preserve the source

Create or update:

```text
memory/YYYY-MM-DD.md
```

Record:

- source description;
- raw transcript or link;
- authoritative distilled requirements;
- normalized names and terms;
- transcription noise to ignore;
- durable product decisions;
- genuine unresolved decisions.

## 5.2 Classify each statement

Classify as:

- requirement;
- acceptance criterion;
- preference;
- context;
- transcription noise;
- genuine blocker/question.

Do not convert unrelated speech-to-text insertions into work.

## 5.3 Permanent requirement IDs

Every requirement receives a stable ID:

```text
BNA-PWA-001
BNA-OPS-002
BNA-WS-003
BNA-GOAL-004
BNA-HELPER-005
```

IDs survive across chats, branches, commits, tests, deployment, and verification.

Never silently merge unrelated requirements. Add sub-IDs when needed.

---

# 6. Current-state comparison before implementation

For every requirement, determine:

- `closed_existing`
- `partial`
- `missing`
- `conflicting`
- `blocked`

The decision must be based on actual code, tests, data migrations, deployment, and live evidence—not task labels.

The agent must produce a short baseline matrix before editing:

```text
ID | Current verdict | Evidence | Required delta
```

Long explanations belong below the matrix.

---

# 7. Execution-run files

Every substantial run must use:

```text
ops/execution-runs/YYYY-MM-DD-<slug>/
  SOURCE.md
  REQUIREMENTS.md
  requirements.json
  BASELINE.md
  PLAN.md
  STATUS.md
  EVIDENCE.md
  TEST-RESULTS.md
  DEPLOYMENT.md
  NEXT-SESSION.md
  run.json
```

Update:

```text
ops/execution-runs/latest.json
```

with:

- active run path;
- repository;
- branch;
- base branch;
- baseline commit;
- current HEAD;
- run status;
- remaining IDs;
- blocked IDs;
- last updated time.

---

# 8. Requirement JSON

Minimum shape:

```json
[
  {
    "id": "BNA-OPS-001",
    "priority": "P1",
    "area": "operations-shell",
    "source": "voice transcript 02:03-02:40",
    "requirement": "Use one clear horizontal module toolbar on mobile.",
    "acceptance_criteria": [
      "At 390px the toolbar scrolls horizontally.",
      "Controls do not wrap into uneven rows.",
      "The active module is clear.",
      "There is no body-level horizontal overflow."
    ],
    "current_verdict": "partial",
    "status": "in_progress",
    "implementation_commits": [],
    "files_changed": [],
    "tests": [],
    "evidence": [],
    "relevant_file_fingerprints": {},
    "blocker": null
  }
]
```

Allowed canonical statuses:

```text
not_started
in_progress
blocked
implemented
verified_local
verified_live
closed
```

Never use “mostly done,” “handled,” or “addressed.”

---

# 9. Codex implementation contract

Every implementation prompt must contain:

```text
IMPLEMENT THE WORK. DO NOT MERELY ANALYZE IT, CREATE TICKETS, WRITE A PLAN, OR MOVE DIFFICULT ITEMS INTO A BACKLOG.

Resume any existing working tree, branch, audit harness, execution ledger, or unfinished run before creating replacements.

Choose the practical dependency order. Do not ask for ordering confirmation unless a genuine product, security, legal, destructive-data, or paid-service decision is required.

Completing one phase does not complete the prompt.

For each requirement ID:
1. inspect current implementation and prior evidence;
2. skip unnecessary rebuilding of closed unchanged work;
3. implement the required delta;
4. add or update requirement-specific tests;
5. run focused verification;
6. commit the change;
7. deploy when required and credentials are available;
8. run targeted live verification;
9. record evidence;
10. close the requirement only when every acceptance criterion is proven.

Never claim full completion while a required non-blocked ID remains below `closed`.

If the environment or context limit interrupts the run:
- commit safe completed work;
- update all run files;
- write exact resume instructions in `NEXT-SESSION.md`;
- list remaining IDs;
- return a PARTIAL verdict;
- do not describe the overall prompt as completed.
```

---

# 10. Dependency-based implementation order

Use this default order:

1. discover and resume existing work;
2. build baseline and requirement ledger;
3. add failing regression tests;
4. canonicalize routes/runtime;
5. data model, migrations, authorization, and RLS;
6. APIs and backend behavior;
7. frontend structure and design system;
8. responsive/mobile behavior;
9. accessibility and localization;
10. integrations and helper action permissions;
11. end-to-end tests;
12. final local verification;
13. deployment;
14. live verification;
15. independent completion verification.

Do not start with cosmetic work when backend scoping or route architecture is unresolved.

---

# 11. Repository files that must stay current

## `AGENTS.md`

Keep concise. It must say:

- read `BNA-START-HERE.md` first for rambles and major builds;
- use the active execution run;
- do not claim completion without evidence;
- resume rather than restart;
- obey the credit-efficiency policy;
- record partial handoffs.

## `MEMORY.md`

Store durable rules only:

- one unified scoped OpenAI helper;
- three workspace types;
- super admin is a role/context;
- requirement-led execution;
- evidence-based completion;
- delta-first, no unnecessary loops.

## `TASKS.md`

Show the high-level queue and link to active requirement IDs. Do not duplicate the entire execution ledger.

## `SYSTEM-STATE.md`

Record the actual current architecture, deployment, canonical routes, migrations, and verified behavior. Remove or label superseded contradictory entries.

## `tasks-pending/*.md`

Use only for concrete briefs that are not already represented by an active execution run. Do not create a new brief merely to postpone implementation.

## Agent ledger/changelog

Append concise structured events, but never use the changelog as proof by itself.

---

# 12. Executable protocol support

The repository should provide:

```text
scripts/bna-execution-run.mjs
```

and package scripts similar to:

```json
{
  "bna:run:init": "node scripts/bna-execution-run.mjs init",
  "bna:run:status": "node scripts/bna-execution-run.mjs status",
  "bna:run:validate": "node scripts/bna-execution-run.mjs validate",
  "bna:run:resume": "node scripts/bna-execution-run.mjs resume"
}
```

The validator must fail when:

- required IDs are missing;
- an item is `closed` without acceptance criteria;
- closed items have no evidence;
- a live-required item lacks deployment/live evidence;
- `latest.json` points to a missing run;
- `NEXT-SESSION.md` is absent while work remains;
- duplicate requirement IDs exist.

The script must not call an LLM or run loops. It is deterministic repository tooling.

---

# 13. Evidence standards

Every closed ID needs appropriate evidence:

- commit SHA;
- relevant files;
- migration;
- test names and results;
- screenshot or visual comparison;
- API/database verification;
- deployment ID and deployed commit;
- live URL/check;
- rollback notes where applicable.

`EVIDENCE.md` must include:

```text
ID | Status | Commit | Tests | Evidence | Deployment/live
```

Keep long explanations outside tables.

---

# 14. Verification gates

Use repository-appropriate commands, including when applicable:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
npm test
npm run screenshot
npm run lighthouse
npm run openai:smoke
npm run railway:doctor
npm run bna:run:validate
```

## UI work

Require:

- 360×800;
- 390×844;
- 768×1024;
- 1440×900;
- no body overflow;
- route/tab/back-forward integrity;
- readable contrast;
- labelled controls;
- helper count/context tests;
- mobile and desktop screenshots;
- console/network checks.

## Workspace/student work

Require negative tests:

- workspace A cannot access workspace B;
- student A cannot access student B;
- ordinary users cannot enumerate globally;
- workspace changes clear stale filters, student selection, and helper context.

UI hiding is not authorization evidence.

## Live work

When the requested outcome affects production, local tests alone are insufficient.

Record:

- Railway deployment ID;
- deployed commit SHA;
- health check;
- targeted live checks;
- rollback procedure.

---

# 15. Audit versus implementation

Keep these separate:

1. **Harness creation** creates audit tooling.
2. **Audit execution** produces evidence and findings.
3. **Implementation** fixes requirement IDs.
4. **Post-fix audit** compares before and after.
5. **Independent verifier** decides whether work can close.

A completed audit harness does not mean an authenticated audit ran.

A completed audit does not mean defects were fixed.

---

# 16. Independent verifier

After Codex reports completion, run a separate verification instruction:

```text
VERIFY THE IMPLEMENTATION; DO NOT TRUST THE COMPLETION SUMMARY.

Read the original source, requirements.json, BASELINE.md, STATUS.md, EVIDENCE.md, TEST-RESULTS.md, DEPLOYMENT.md, NEXT-SESSION.md, and actual commits/diff.

For every requirement ID, independently determine whether every acceptance criterion is proven.

Inspect or rerun the smallest necessary tests, then the final gate where required.

Return:
1. branch and HEAD;
2. commits inspected;
3. tests inspected/rerun;
4. deployment/live evidence;
5. requirement-by-requirement verdict;
6. unresolved IDs;
7. regressions;
8. final verdict:

- PASS
- PASS WITH ONLY P2/P3 FOLLOW-UPS
- FAIL — REQUIRED WORK REMAINS

Do not return PASS if a P0/P1 item is partial, unverified, or failed.
```

---

# 17. Resume protocol

When interrupted, `NEXT-SESSION.md` must contain:

```text
Repository:
Branch:
Current HEAD:
Base branch:
Run directory:
Completed IDs:
Remaining IDs:
Blocked IDs:
Uncommitted changes:
Migrations:
Deployments:
Tests passed:
Tests failed:
Exact next commands:
Exact next requirement:
Risks:
Do-not-repeat notes:
```

A fresh Codex session must be told:

```text
Read `BNA-START-HERE.md`, then resume the active run from `ops/execution-runs/latest.json`. Do not restart, replace the ledger, or redo closed unchanged requirements. Continue until every non-blocked requirement is closed.
```

---

# 18. Anti-failure rules

Never accept:

- a plan as implementation;
- task creation as completion;
- a changelog line as proof;
- one generic smoke test as proof of all requirements;
- cosmetic polish while backend scoping remains unfinished;
- hard work moved into `TASKS.md` while claiming completion;
- local-only success for a live request;
- “done” without deployment/live proof where required;
- repeated audits of unchanged verified areas;
- a fresh session restarting instead of resuming;
- an agent stopping after the first phase.

---

# 19. Standard ChatGPT output for a new ramble

A GitHub-connected ChatGPT should return:

## A. Current-state verdict

Existing, partial, missing, conflicting, blocked.

## B. Distilled requirement ledger

Stable IDs and acceptance criteria.

## C. Copy Block 1 — Codex implementation prompt

Self-contained and directly pasteable.

## D. Copy Block 2 — independent verification prompt

Self-contained and directly pasteable.

## E. Files/protocol updates

Only durable workflow changes.

---

# 20. Definition of protocol success

The protocol succeeds when Shloimie can:

1. open a new GitHub-connected chat;
2. give one bootstrap sentence and one ramble;
3. receive one complete Codex execution prompt;
4. avoid rebuilding verified work;
5. resume without re-explaining;
6. get evidence per requirement;
7. know precisely what remains;
8. independently verify completion;
9. avoid wasting credits on loops and repeated full audits.
