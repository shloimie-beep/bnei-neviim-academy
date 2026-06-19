# Ramble Intake - 2026-06-17 - universal-agentic-goal-memory-watchdog-hardening

This register captures the downloaded prompt
`C:\Users\User\Downloads\bna_universal_agentic_goal_memory_watchdog_hardening_prompt.md`
as a goal-mode implementation packet.

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-005 | codex_chat / downloaded prompt | implemented | raw-input/RAW-20260617-005-universal-agentic-goal-memory-watchdog-hardening.md | Full prompt preserved before implementation. |

## Goal

| ID | Goal | Status |
|---|---|---|
| GOAL-20260617-005 | Install the universal BNA agentic goal memory and watchdog hardening layer across raw intake, parser schema, goal memory, action/route registries, watchdogs, tests, package scripts, agent fleet, helper/intake surfaces, and proof closeout. | Done - deployed and verified; commit step explicitly blocked by pre-existing mixed dirty worktree. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-101 | Capture prompt and inspect current reality | Preserve raw prompt, inspect git state, branch, latest commit, source-of-truth docs, existing tasks, ops, memory, and runtime files without overwriting local work. | Agent lifecycle | Raw prompt file, this register, git status inspection. | Done |
| REQ-20260617-102 | Install permanent source-of-truth docs | Create/update `QUALITY-GOALS.md`, `GOAL-MODE.md`, `AGENTIC-MEMORY.md`, memory-topic docs, raw-input README, action/route registries, goal ledger, and audit READMEs. | Source of truth | File existence, full tests, watchdogs. | Done |
| REQ-20260617-103 | Strengthen AGENTS universal protocol | Add universal natural-language intake, goal memory, goal promotion, watchdog, action/route registry, privacy/scope, definition-of-done, and stale-doc rules. | Agent rules | `AGENTS.md` updated; watchdog general audit reports zero ramble-protocol findings. | Done |
| REQ-20260617-104 | Add durable goal-memory migration | Add `railway-migration-2026-06-17-agentic-goal-memory.sql` for raw intake extensions, goal memory, goal links, goal checks, and agent events. | Database | SQL file added and syntax/static checks passed. Live schema apply not run in this batch. | Done |
| REQ-20260617-105 | Create shared parser schema and goal-memory modules | Add/update intake schema, parser hardening, goal memory, goal registry, and ramble protocol modules with full multi-lane item schema. | Parser / memory | Focused parser/goal tests and full `npm test` 713/713. | Done |
| REQ-20260617-106 | Implement goal promotion workflow | Functions for raw capture, parsing, goal promotion, linking, retrieval, coverage assertion, check result recording, and repair task creation. | Goal memory | `tests/agentic-goal-memory-hardening.test.js`; full tests. | Done |
| REQ-20260617-107 | Create action registry and audit | Ensure every visible UI action can be registered and audited for handlers/routes/disabled/coming-soon/helper actions/mobile. | Watchdog / UI | `npm run watchdog:actions` passed with zero findings. | Done |
| REQ-20260617-108 | Create route registry and security route audit | Route registry declares access/scope/expected logged-out behavior and watchdog verifies public/private/portal safety. | Security / routes | `npm run watchdog:links` and `npm run watchdog:security` passed with zero findings. | Done |
| REQ-20260617-109 | Create UI and visual watchdogs | Add structural UI smoke and visual baseline checks for core public, portal, and Operations routes across mobile/tablet/desktop. | UI watchdog | `npm run watchdog:ui` and `npm run watchdog:visual` passed with zero findings. | Done |
| REQ-20260617-110 | Create raw-intake drift watchdog | Detect stale raw/unparsed input, parse failures, dropped uploaded classes, missing raw records, important communication alerts, wrong workspace content, and unreviewed goal candidates. | Intake watchdog | `npm run watchdog:raw` passed with zero findings. | Done |
| REQ-20260617-111 | Create content/class/research routing watchdog | Audit content jobs, transcripts, class notes, student questions, research items, student/accountability notes, and workspace routing. | Content / research | `npm run watchdog:content` passed with zero findings. | Done |
| REQ-20260617-112 | Create communications alert watchdog | Audit inbound parent/accountability email/WhatsApp/WAPI/form/payment/provider/student signals with redacted summaries and follow-up/alert checks. | Communications | `npm run watchdog:communications` passed with zero findings. | Done |
| REQ-20260617-113 | Add GitHub Actions quality gate docs/workflow | Add workflow and branch protection documentation with no-secrets local-safe watchdog modes. | CI / GitHub | `.github/workflows/bna-quality-gate.yml`; `docs/github-branch-protection.md`; syntax/static checks. | Done |
| REQ-20260617-114 | Add package scripts | Add watchdog scripts without breaking existing commands. | Tooling | `package.json` parse and watchdog commands passed. | Done |
| REQ-20260617-115 | Integrate agent fleet verifier | Agent fleet must run relevant watchdogs before done, create reports/tasks on failures, and avoid false done. | Agent fleet | `scripts/agent-fleet-supervisor.mjs` updated and syntax-checked. | Done |
| REQ-20260617-116 | Integrate Helper as intake/action surface | Helper input creates raw intake, parses structured output, retrieves relevant goals, uses action registry, and reports raw ID/counts/next action. | BNA Helper | Helper registry/planner/permission updates; focused tests; live Operations helper smoke passed. | Done |
| REQ-20260617-117 | Integrate Drive/class recording raw intake | Drive/raw media/class recordings create raw records, parse into class/student/research/content/task/accountability/provider lanes, and link back to raw files. | Drive / class intake | Parser lanes, class-recording tests, raw-intake backfill plan, and drift/content watchdogs. | Done |
| REQ-20260617-118 | Add parser/watchdog eval tests | Add safe-fixture tests for goals, class recordings, student questions, communications, action registry, and route security. | Tests | Focused hardening tests 11/11; full `npm test` 713/713. | Done |
| REQ-20260617-119 | Add observability and audit trail | Append major events to `ops/goal-ledger.jsonl` and/or `bna_agent_events`, with redaction and stable event types. | Observability | `ops/goal-ledger.jsonl`, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`. | Done |
| REQ-20260617-120 | Add automatic repair loop | Watchdog findings create `WATCH-*` plus actionable REQ/TASK records with route, goal, evidence, repro, severity, and suggested fix when safe. | Watchdog / tasking | `src/lib/bna/goal-memory.js`; hardening tests; watchdog install audit. | Done |
| REQ-20260617-121 | Create backfill and migration audits | Add goal-memory install audit, watchdog install audit, and raw-intake backfill plan for existing memory, handoffs, content, communications, and tasks. | Audit / backfill | `ops/goal-audits/2026-06-17-goal-memory-install-audit.md`; `ops/watchdog-audits/2026-06-17-watchdog-install-audit.md`; `ops/raw-intake-audits/2026-06-17-raw-intake-backfill-plan.md`. | Done |
| REQ-20260617-122 | Run verification matrix | Run syntax checks, tests, watchdogs, optional UI/visual, OpenAI smoke if feasible, and Railway doctor if live env is available; document blockers exactly. | Verification | Full local + watchdog + OpenAI + Railway + live smoke proof below. | Done |
| REQ-20260617-123 | Commit/report if allowed | Commit all changes if appropriate and produce final status table with blockers and next live-smoke checklist. | Closeout | Final status table below; commit explicitly blocked due pre-existing mixed dirty tree. | Done with commit blocker |

## Guardrails

- No secrets, private parent/student/provider data, contact exports, or private message bodies were exposed in repo proof.
- Sample fixtures and redacted summaries were used.
- No live sends, posts, charges, DNS writes, uploads, syncs, account grants, credential copies, or direct DB migration apply were performed.
- Existing local work was preserved; no unrelated dirty-tree changes were reverted.

## Verification Proof

| Check | Result | Evidence |
|---|---|---|
| Focused hardening tests | PASS 11/11 | `node --test tests/intake-parser-goals.test.js tests/intake-parser-class-recording.test.js tests/intake-parser-student-questions.test.js tests/intake-parser-communications.test.js tests/watchdog-action-registry.test.js tests/watchdog-route-security.test.js tests/agentic-goal-memory-hardening.test.js` |
| Full tests | PASS 713/713 | `npm test` |
| Watchdog all | PASS | `npm run watchdog:all` |
| General watchdog | PASS with seven older hygiene findings | `ops/watchdog-audits/2026-06-17T12-09-watchdog-audit.md` |
| Link/action/security/raw/content/communications/UI/visual watchdogs | PASS with zero new findings | `ops/watchdog-audits/2026-06-17T12-09-*` reports |
| Hosted AI smoke | PASS | `ops/openai-smokes/2026-06-17T12-00-36-308Z-openai-sidekick-smoke.md` |
| Railway deploy | SUCCESS | Deployment `a2a5bf56-4661-4063-8ead-e1c66010ac9e` |
| Railway doctor | PASS | Deployment status `SUCCESS` |
| Live app smoke | PASS | `ops/live-smokes/2026-06-17T12-03-49-136Z-live-app-smoke.md` |
| Public privacy smoke | PASS | `ops/live-smokes/2026-06-17T12-04-00-461Z-public-route-privacy-smoke.md` |
| Operations helper smoke | PASS | `ops/live-smokes/2026-06-17T12-03-48-493Z-operations-helper-live-smoke.md` |

## Final Audit

| ID | Status | Evidence | Remaining issue |
|---|---|---|---|
| REQ-20260617-101 | Done | Raw file and git/source inspection. | None |
| REQ-20260617-102 | Done | Source-of-truth docs and registries added. | None |
| REQ-20260617-103 | Done | `AGENTS.md`; zero ramble-protocol watchdog findings. | None |
| REQ-20260617-104 | Done | Migration file added. | Live DB apply not run; no runtime dependency. |
| REQ-20260617-105 | Done | Parser/schema/goal modules and tests. | None |
| REQ-20260617-106 | Done | Goal-memory helpers and tests. | None |
| REQ-20260617-107 | Done | Action registry watchdog zero findings. | None |
| REQ-20260617-108 | Done | Link/security watchdogs zero findings. | None |
| REQ-20260617-109 | Done | UI/visual watchdogs zero findings. | None |
| REQ-20260617-110 | Done | Raw-intake watchdog zero findings. | None |
| REQ-20260617-111 | Done | Content routing watchdog zero findings. | None |
| REQ-20260617-112 | Done | Communications watchdog zero findings. | None |
| REQ-20260617-113 | Done | GitHub quality gate workflow and branch-protection doc. | Branch protection itself remains a GitHub settings action. |
| REQ-20260617-114 | Done | Package scripts and command verification. | None |
| REQ-20260617-115 | Done | Agent fleet verifier updated. | None |
| REQ-20260617-116 | Done | Helper tools/planner plus live helper smoke. | None |
| REQ-20260617-117 | Done | Class-recording parser tests and raw/content watchdogs. | None |
| REQ-20260617-118 | Done | Focused tests and full `npm test`. | None |
| REQ-20260617-119 | Done | Ledgers/changelog/source-of-truth updates. | None |
| REQ-20260617-120 | Done | Repair-task helper path and watchdog install audit. | None |
| REQ-20260617-121 | Done | Goal/watchdog/backfill audit files. | None |
| REQ-20260617-122 | Done | Local, watchdog, OpenAI, Railway, and live smoke matrix. | None |
| REQ-20260617-123 | Done with commit blocker | Final report and explicit blocker. | Commit not performed because the worktree has extensive pre-existing mixed-scope dirty changes. |

## Closeout Summary

The hardening prompt is implemented, deployed, and verified. Future rambles,
helper messages, class recordings, communications, and downloaded GPT/Codex
outputs now have a raw-first intake path, goal-candidate promotion path,
watchdog coverage, repair-task hooks, and durable proof requirements.
