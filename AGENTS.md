# BNA Agent Operating Guide

This repository is the shared brain for BNA work across terminal, Telegram,
and future automation channels.

## Purpose

- Build and operate BNA's school systems, website, internal workflows, and
  operator sidekick tools.
- Treat this repository as the canonical workspace for durable memory and
  current execution state.

## Source Of Truth

Use these files consistently:

- `BNA-START-HERE.md`: first read for every new GitHub-connected BNA session
- `docs/BNA-RAMBLE-TO-DONE.md`: durable broad-ramble execution protocol
- `ops/execution-runs/latest.json`: active resumable execution run pointer
- `AGENTS.md`: operating rules, workflow, and channel behavior
- `MEMORY.md`: durable facts, decisions, preferences, definitions
- `TASKS.md`: active work queue, next actions, blockers
- `ops/agent-task-ledger.jsonl`: append-only task trail shared by Telegram and Codex
- `ops/agent-changelog.md`: completed agent work and verified changes
- `tasks-pending/*.md`: internal Codex handoff briefs for the next coding session
- `memory/YYYY-MM-DD.md`: daily rambles, notes, raw captures, summaries
- `PROJECT-NOTES.md`: local project migration notes and technical caveats

Do not dump transient rambles into `AGENTS.md`.

## Ramble Protocol - Required For All Operator Dumps

Rambles are first-class source input. Do not ask Shloimie to speak in a
structured format; the agent/system must structure the ramble for him.

A single ramble can contain:

- website correction
- bug report
- product requirement
- implementation task
- decision
- open question
- durable memory
- student/accountability note
- content idea
- payment/accounting note
- contact item, including operator language that says GHL/contact; route this
  to first-party BNA Operations, not a new active GHL runtime
- frustration/complaint that signals missed or incomplete work

Raw wording must be preserved. Visible task titles must be rewritten cleanly.
Every extracted item must get a stable ID. Broad correction sessions must
create a dated requirement register under `tasks-pending/`. No broad correction
coding should start until that register exists. Completion requires evidence,
not just a claim.

## Goal-Mode Ramble Execution Trigger

When Shloimie gives a GPT/ChatGPT/Codex-generated correction output, prompt
packet, long checklist, or broad ramble and says any version of `goal mode`,
`set it as a goal`, `finish everything`, `do all those things`, `work through
the whole prompt/output/list`, `keep going until done`, or `build everything`,
Codex must treat it as goal-led execution permission, not planning only.

Required behavior:

1. Create or continue an active goal when the Codex goal tool is available.
   The goal objective should cover both protocol hardening and completing the
   named correction/register work through terminal statuses.
2. Create/update the raw intake record and dated requirement register first.
   Use `tasks-pending/_template-ramble-intake.md` and, for GPT-generated
   correction packets, the output contract at
   `tasks-pending/_template-goal-mode-correction-output.md`.
3. After the register exists, start implementation immediately in practical
   batches. Do not ask Shloimie to choose the order unless a real product,
   money, access, credential, privacy, legal, or external-account decision is
   required.
4. Keep working across Codex turns until every requirement in the active
   register has a terminal status: `Done`, `Already satisfied`, `Blocked`,
   `Needs operator decision`, `Failed`, or `Archived`.
5. `Done` requires inspected files/routes/workflows, implementation evidence,
   relevant verification, final-audit evidence, ledger/changelog records, and
   deploy/live-smoke proof for app-visible or server-visible changes. If deploy
   or live smoke cannot run, leave the item open or explicitly blocked with the
   blocker and next action.
6. When context, time, deploy access, credentials, or human decisions interrupt
   the work, leave a continuation register/status note that names the next
   requirement IDs and proof/blockers. Do not mark the goal complete merely
   because the local batch ended.
7. Use the execution-run CLI to choose the next batch: `npm run bna:run:next`
   or `npm run bna:run:resume`. Continue automatically through the next
   unblocked batch. A missing credential, account action, DNS change, legal,
   financial, privacy, or explicit authorization decision blocks only the
   dependent requirement, not the whole run.
8. Each blocker/Decision must be concise and reusable: missing information,
   owner, recommended option, alternatives, consequences, and exact next
   action. Do not create repeated Decisions for the same blocker.

GPT/ChatGPT outputs meant for Codex should include a clear
`BNA_GOAL_MODE_EXECUTION_PACKET` section with raw source, requirement IDs,
expected results, suggested batches, verification expectations, blockers, and
the instruction to create/continue the Codex goal and execute until terminal
statuses. If the packet is missing but Shloimie's natural language asks for
goal mode or to finish everything, infer the same execution policy.

Stable ID formats:

- `RAW-YYYYMMDD-###` for raw input records
- `REQ-YYYYMMDD-###` for requirements
- `TASK-YYYYMMDD-###` for tasks
- `DEC-YYYYMMDD-###` for decisions
- `Q-YYYYMMDD-###` for open questions
- `MEM-YYYYMMDD-###` for durable memory candidates

A parsed item is complete only when:

1. The relevant files/routes/components/workflows were inspected.
2. The implementation matches the item.
3. Verification was run, or the blocker is documented.
4. The final audit table contains evidence.
5. Shloimie can see the item ID and status.

Structured execution-run requirements must include source, workspace/project,
owner, priority, batch, dependency, implementation status, continuation,
acceptance criteria, evidence, verification, implementation files, commit/push,
PR, deployment/live-smoke, blocker, supersession, and update metadata. The
validator rejects duplicate IDs, duplicate canonical Tasks, unmapped source
statements, internal handoffs showing as visible user Tasks, doc-only
implementation claims, stale evidence, and app-visible work marked complete
without push/deploy proof.

When the operator rambles:

1. First create or update a Raw Input Queue record.
2. Capture the raw ramble in today's file under `memory/YYYY-MM-DD.md` when
   working from Codex/manual sessions or when repo fallback is needed.
3. Distill it into:
   - durable facts for `MEMORY.md`
   - concrete next actions for `TASKS.md`
   - a dated requirement register under `tasks-pending/` for broad correction
     sessions
   - current-session internal implementation briefs for `tasks-pending/*.md`
     when a future coding session should pick up the work without re-explaining
   - repo/process rules for `AGENTS.md` only if they are stable
4. Do not show raw ramble language as task titles. Store raw wording as
   provenance only; visible tasks should be concise, rephrased, and actionable.
5. When Telegram or Codex creates or updates a task, append a structured record
   to `ops/agent-task-ledger.jsonl`.
6. When an agent task is completed, verified, deployed, or otherwise finished,
   append a concise record to `ops/agent-changelog.md`.
7. For any ramble that creates Codex/system work, use the hardened ramble
   intake closeout:
   - raw capture stays in `memory/YYYY-MM-DD.md` or `bna_raw_intake`
   - visible tasks use distilled titles only
   - future coding handoffs use `tasks-pending/_template-ramble-intake.md`
   - corrections to a prior misfiled ramble get a dated correction/audit
     handoff under `tasks-pending/`
   - completion requires `ops/agent-task-ledger.jsonl`,
     `ops/agent-changelog.md`, and proof or an explicit blocker
8. Telegram capture confirmations should name the raw ID, where the raw ramble
   was saved, how many requirements/tasks/decisions/open questions were parsed,
   the visible lane updated, and whether proof/blocker closeout remains; they
   should not say vague background-queue language for ordinary chat.

## Raw Input Queue

The Raw Input Queue is the intake layer before tasks, requirements, decisions,
content, students, contacts, or accounting. Every ramble/correction dump must
first become a raw input record.

The live database table `bna_raw_intake` is canonical for live intake. Repo
files under `raw-input/` are allowed for Codex/manual sessions or migration
fallback. Raw input is never deleted just because it was parsed. It remains
provenance.

Raw input records must track:

- stable raw ID
- source channel: `telegram`, `website_bot`, `codex_chat`, `operations_ui`,
  `drive`, `class_recording`, `website_helper`, `operations_helper`, `email`,
  `whatsapp`, `wapi`, `manual`, `other`
- raw text
- transcript text, if voice/audio/video
- source media/file/message metadata
- parse status: `raw`, `parsed`, `needs_review`, `registered`, `implemented`,
  `archived`, `failed`
- parsed payload
- created requirement IDs
- created task IDs
- created decision IDs
- open question IDs
- requirement register path, when applicable
- created_at, parsed_at, updated_at, archived_at

## Universal Natural Language Intake Protocol

Natural language from every channel is intake, not chatter to discard. This
includes Telegram, Codex chat, website helper, Operations helper, Drive files,
class recordings, email, WhatsApp/WAPI, uploads, forms, and manual operator
notes.

For each natural-language input:

1. Preserve raw wording/transcript/file metadata first in `bna_raw_intake`, or
   repo fallback `raw-input/` plus `memory/YYYY-MM-DD.md`.
2. Parse into every relevant lane: requirements, tasks, decisions, questions,
   memory, goal candidates, student notes/questions/observations, class notes,
   research, content, communications, contacts, accounting, integrations,
   service-provider/classroom items, workspace routing, alerts, and errors.
3. Assign stable IDs to every extracted item and keep source quotes as
   provenance.
4. Link parsed items to raw IDs, scope/workspace/project, affected standing
   goals, and evidence paths when available.
5. Create repair tasks or blockers when the parser loses a lane, drops raw
   provenance, or cannot decide scope safely.

## Agentic Goal Memory

Durable goals live in the goal-memory layer, not only in one prompt. Use:

- `QUALITY-GOALS.md` for standing quality goals
- `GOAL-MODE.md` for execution rules and terminal statuses
- `AGENTIC-MEMORY.md` for memory-layer definitions
- `memory-topics/*.md` for topic-scoped durable rules
- `bna_goal_memory`, `bna_goal_links`, `bna_goal_check_results`, and
  `bna_agent_events` when the live migration is applied
- `ops/goal-ledger.jsonl` and `ops/goal-audits/` for repo fallback/evidence

Every agentic goal should have a stable ID, plain-English goal, why it matters,
scope, surfaces, invariants, watchdog checks, evidence required, failure
behavior, and a repair-task template.

## Goal Promotion Rules

Create a goal candidate when Shloimie says any durable phrase such as `always`,
`never`, `every time`, `from now on`, `set this as a goal`, `make this a goal`,
`system should`, `agents must`, `goal mode`, or when the item affects privacy,
security, workspace scope, parser reliability, watchdogs, proof, or done-state
quality.

Promote a goal candidate when it is explicitly durable, repeated, safety or
privacy related, required by a standing goal, or accepted by Shloimie. Do not
promote one-off task instructions into permanent memory unless they define a
future operating rule.

## Goal Maintenance / Watchdog Rules

Watchdogs protect goals after implementation. A watchdog may be static, local,
browser-based, live, or database-backed, but it must be explicit about what it
checked and what it skipped.

When a watchdog finds a violation:

1. Create a `WATCH-YYYYMMDD-###` finding.
2. Link it to the relevant goal ID, route/action/parser lane/source channel,
   evidence path, severity, and expected behavior.
3. Create an actionable `REQ-*` or `TASK-*` repair item when Codex can act
   safely.
4. Mark external, credential, account-owner, send/publish/charge/DNS/upload, or
   privacy decisions as blocked or needs-operator-decision.
5. Do not mark the original work done until the watchdog passes, is superseded,
   or has a precise blocker.

## Action Registry Requirement

Every visible action, button, helper action, automation draft, form submit,
navigation control, and coming-soon/disabled control must have a row in
`ops/action-registry.json` or the existing detailed registry under
`ops/action-registry/`.

Registry rows must state route/view, selector or action key, label, intended
behavior, handler/API/helper tool, scope, status, disabled/coming-soon reason,
mobile expectation, tests, and evidence. If UI adds an action without registry
coverage, `npm run watchdog:actions` should fail or create a repair finding.

## Route Registry Requirement

Every public, portal, Operations, API, alias, and install/manifest route must be
declared in `ops/route-registry.json` with access level, scope, expected
logged-out behavior, privacy notes, canonical target, and smoke/security
expectations. Private routes must reject anonymous or wrong-scope access.
Public routes must not expose parent/student/provider/private Operations data.

## Privacy and Workspace-Scope Invariants

- Public pages and public helper context are anonymous-safe.
- Parent scope sees only that parent/family/student data.
- Student scope is student-safe and does not expose adult/private notes.
- Provider/rabbi scope cannot read unrelated BNA/private/provider/family data.
- BNA, One Time, provider, family legacy, and public content must not bleed
  across workspace/project boundaries.
- Raw private message bodies, contact exports, secrets, passwords, API keys,
  student-sensitive details, and screenshots with private data must not be
  committed to tracked files; use redacted summaries and stable IDs.

## Definition of Done

An item is done only when:

1. It has a stable ID and linked raw/source provenance.
2. Relevant files, routes, components, workflows, schema, and registries were
   inspected.
3. Implementation matches the expected result and scope.
4. Relevant action/route/parser/watchdog checks ran, or a blocker is explicit.
5. Evidence is recorded in the requirement register or audit file.
6. `ops/agent-task-ledger.jsonl` and `ops/agent-changelog.md` include the
   completed/verified/deployed/blocked record.
7. App-visible or server-visible changes have deploy/live-smoke proof, unless
   deployment is explicitly blocked and the item remains open/blocked.

## Stale Document Warning

Older docs, archived code, previous prompt packets, and historical setup files
are not automatically current source of truth. Before following any stale file,
check `AGENTS.md`, `MEMORY.md`, `SYSTEM-STATE.md`, `TASKS.md`, the newest
`tasks-pending/*.md`, `QUALITY-GOALS.md`, `GOAL-MODE.md`, `AGENTIC-MEMORY.md`,
and the live Express app/schema. If a stale doc conflicts with current source
of truth, create a cleanup or archive task instead of reviving old assumptions.

## Memory Promotion Rules

Promote into `MEMORY.md` only if the information is one of:

- a stable project goal
- a product requirement
- a preference that will likely matter again
- an identity fact about BNA, the operator, or a workflow
- an integration detail that should persist

Keep `MEMORY.md` compact and curated.

## Working Style

- Prefer clear, structured execution over abstract brainstorming.
- Break work into small tasks with visible progress.
- When the operator says `build everything`, treat it as permission for Codex
  to choose the implementation order, work through the queued tasks, and report
  completed/verified results. Do not ask for ordering confirmation unless a
  real blocker or product decision is required.
- When the operator asks to make or refine a prompt for Codex or ChatGPT,
  treat it as planning/refinement mode first: show the visible prompt/brief in
  chat, refine it with the operator, and only implement once the operator asks
  to build, test, run, or apply it.
- When the operator asks to test something that can be verified through browser
  interaction, use Playwright or the browser automation tools and report what
  was actually checked.
- When uncertain, propose 2-3 concrete options and recommend one.
- Preserve operator language and intent while turning it into usable plans.
- Avoid creating sprawling prompt junk drawers or giant rejected-memory files.
- After implementing ramble-derived work, record what changed, where it changed,
  verification performed, and remaining decisions in the relevant
  `tasks-pending/` handoff, `ops/agent-changelog.md`, and
  `ops/agent-task-ledger.jsonl`.
- After major ramble-derived closeouts, or when work status feels scattered
  across prompts/tasks/ledger/proof, run `npm run watchdog:audit` and use the
  newest `ops/watchdog-audits/*-watchdog-audit.md` report to identify stale
  records, missing proof, duplicate work, prompt gaps, source-of-truth drift,
  and unresolved human/external blockers.
- Operations task buckets are `Decisions`, `Pending`, and `Tasks`, with
  `Calendar` and `Done / Activity` as supporting views. `Pending` means a
  human or external system is blocking progress; it must not mean "waiting for
  Codex."
- Task lifecycle: raw source is preserved first, canonical executable
  requirements are created second, and visible Tasks are created only for
  distilled human actions with owner, workspace/project, source, next action,
  blocker if any, and direct action. Duplicate canonical task keys must be
  archived/superseded, not shown repeatedly.
- Decision lifecycle: one Decision per external blocker. A Decision stays in
  `Needs My Decision`, `Needs Rabbi Scheller`, or `Needs External Owner` until
  the missing information is supplied, then moves to `Decided`, `Superseded`,
  or `Archived`. Reuse the original Decision for repeated mentions.
- Codex/system work belongs in the agent lifecycle (`queued`, `running`,
  `completed`, `failed`, or `blocked_needs_human_decision`) and stays visible as
  agent status under Tasks/Activity, not as a human-facing Pending card.
- Do not show `tasks-pending/*.md` as a visible Planned Briefs, Pending Briefs,
  or Implementation Briefs section. Those files are internal Codex handoffs.
- Use the local BNA keyholder workflow for new or rotated API keys. The default
  keyholder folder is `C:\Users\User\BNA-Keyholder`, outside the repo. Do not
  paste secrets into chat, tracked files, screenshots, task titles, or logs.
  Diagnostics may report only metadata and fingerprints. Copying a key from the
  keyholder into `.secrets` or Railway requires an explicit operator request.

## Current Project Reality

- This repo started as a copy of an older legacy family app.
- It is being repurposed into BNA's school project.
- The current app and schema still contain family-oriented assumptions that
  need to be systematically replaced.
- The live Operations dashboard/task UI is the Express/static
  `public/operations.html` surface. The old React local-storage TaskApp
  prototype is archived under
  `docs/archive/dormant-next-supabase-app/src/app/operations/`; do not edit it
  for live Operations behavior unless deliberately reviving it in a new task.
- Archived files under `docs/archive/` are historical reference only. Do not
  use archived family-accountability docs, old Supabase setup files, or old
  launch/onboarding surfaces as current BNA product, database, school-model, or
  workflow guidance.
- Legacy Family Accountability docs are not current BNA source of truth unless
  the current task explicitly says to clean/archive them. If legacy docs mention
  Menachem/Esther, family checkoffs, kid PINs, family Supabase schema, Resend
  daily family emails, or a Next.js family scaffold, treat them as stale and
  follow BNA source-of-truth instead: `AGENTS.md`, `MEMORY.md`,
  `SYSTEM-STATE.md`, `TASKS.md`, latest `tasks-pending/*.md`, the live Express
  app in `server.js`, `public/*`, and live database schema/migrations.
- BNA does not use GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as active
  runtime. Do not add new GHL MCP tools, env vars, API clients, smoke checks,
  dashboard controls, Telegram actions, tags, workflows, docs, routes, prompts,
  or schema assumptions. Historical files belong only under
  `docs/archive/legacy-ghl/`; active contact, community, provider, parent,
  student, bot, ticket, decision, and newsletter behavior belongs in first-party
  BNA Operations tables/APIs. Buffer is only a social scheduler connector.
- Public, parent, and Operations PWAs must keep separate manifest identities:
  public `/manifest.json`, parent `/parent-manifest.json`, and Operations
  `/operations-manifest.json`. Do not make the public or parent install launch
  the private Operations app.

## Current AI Setup

- Codex is the primary development agent and visible machine-work owner.
- `Assistant` is the visible Telegram reply mode for ordinary conversation,
  tone/content refinement, brainstorms, and normal system running. It uses the
  hosted AI provider path behind the scenes.
- Clear repo, code, database, bridge, deploy, test, dashboard, or programming
  requests should route to Codex automatically.
- OpenAI is the preferred hosted AI provider when available.
- Kimi is normally fallback only for API/model-provider failures or legacy
  records, but `BNA_AI_PRIMARY_PROVIDER=kimi` is the approved temporary
  Kimi-primary mode while the OpenAI key path/account issue is unresolved.
- Kimi is never the task owner. Codex remains the development/task/deploy owner
  even when Kimi is the temporary hosted chat/content provider.

## Near-Term Priorities

- Build a proper BNA memory structure.
- Replace family-specific language, prompts, and schema assumptions.
- Keep the Telegram bridge capable of both:
  - hosted API chat for ordinary conversation and content/tone refinement
    (OpenAI normally, Kimi during explicit temporary Kimi-primary mode)
  - Codex coding turns for repo work
  - structured Buffer social commands for draft/post scheduling and queue management
- Keep one canonical memory system across channels.

## Telegram Ops Reality

- The academy Telegram bot is the active bot, not the old family bot.
- The bridge now supports:
  - hosted API default chat for ordinary conversation and content/tone refinement
    (OpenAI normally, Kimi during explicit temporary Kimi-primary mode)
  - automatic Codex routing for repo/development work
  - persistent Telegram bottom buttons for `Assistant` and `Codex` mode switching;
    `Assistant` is the provider-neutral hosted chat path for normal users
  - `/accounts`, `/blogs`, `/queue`, `/help`, `/status`
  - photo, video, voice, and document intake
  - automatic local asset capture plus Buffer text draft handoff for social posts
- Telegram task captures should not show per-task owner/status buttons such as
  `Mine`, `Codex`, `Urgent`, or `Done`; the parser should assign ownership and
  route the item into the correct app lane.
- Telegram should read like natural conversation first. Do not send mechanical
  "queued Codex in the background" style messages for ordinary chat; mention a
  capture only when a real task, student note, payment item, content item, or
  decision was created or needs action.
- After Codex completes a Telegram-requested test, fix, deploy, or verification,
  it must report back in Telegram with a concise accomplished/verified summary.
  The operator should not have to infer completion from logs or dashboard state.
- App-visible, server-visible, or dashboard-visible Codex tasks are not
  complete after local verification alone. The agent fleet must deploy the
  changed app bundle, run the live Railway doctor/smoke check, and only then
  mark the task done. If deployment is unavailable or fails, keep the task open
  and notify Telegram with the blocker.
- Social posting is partially wired:
  - Buffer is the active social posting provider for Facebook, LinkedIn, and YouTube.
  - draft/publish commands create Buffer text drafts/posts for resolved targets.
  - media assets are saved locally; Buffer media posting needs hosted media URL support before local photos/videos can be attached.
  - voice assets are saved, but not transcribed yet

## Pending Work Convention

- `TASKS.md` should stay concise and show the overall queue.
- `tasks-pending/*.md` should hold the latest actionable brief with context,
  findings, and explicit next steps.
- When resuming work, read the newest file in `tasks-pending/` before making
  major changes.
