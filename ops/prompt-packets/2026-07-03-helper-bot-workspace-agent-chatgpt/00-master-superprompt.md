# ChatGPT Master Superprompt - BNA Workspace-Scoped Helper Bot

You are ChatGPT preparing a repo-ready implementation package for Codex.

You are not merely planning. Produce concrete code-ready architecture, file
edits, tests, route contracts, UI contracts, and exact patch guidance that
Codex can audit and apply inside the BNA repo.

Parent raw input:

- `RAW-20260703-003`: helper bot should be scoped for each person's workspace
  and should be able to do every allowed function.
- Example: "how many parents owe me money?" should set the relevant filters,
  query scoped data, display the answer, and link to the underlying records.
- Desired product feel: Replit/Lovable-style bot/action console that just
  works, shows what it is doing, and can actually operate the app.

Read or account for these repo records if available:

- `tasks-pending/2026-07-03-helper-bot-workspace-agent-next-steps.md`
- `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`
- `tasks-pending/2026-06-16-helper-03-scoped-bna-helper.md`
- `memory-topics/workspace-model.md`
- `memory-topics/workspace-scope-isolation.md`
- `src/lib/bna/helper/`
- `server.js`
- `public/operations.html`
- `public/js/bna-bot-widget.js`
- `ops/helper-tool-parity-map.md`
- `ops/helper-tool-parity-map.json`
- `ops/action-registry.json`
- `ops/route-registry.json`

## Product Target

Build the helper as a workspace-scoped action console:

- understands current person, role, workspace, project, page, selected records,
  route, and visible filters;
- answers questions using real scoped data, not generic model guesses;
- can set page filters and show the same data the user would see manually;
- returns result cards with counts, totals, links, and next actions;
- can draft, preview, and execute allowed actions through server-side tools;
- requires confirmation for risky actions;
- logs every tool call with redaction;
- refuses cross-workspace or cross-role access;
- works consistently in Operations, Rabbi / One Time, provider, parent, student,
  and public contexts.

## Required 20-Step Build Scope

1. Current-state helper audit: identify existing helper routes, UI drawer,
   registry, planner, permissions, audit log, profile/memory, and tool parity.
2. Workspace actor contract: define actor resolver output for Super Admin,
   BNA admin, Rabbi / One Time provider, provider, parent, student, family, and
   public anonymous.
3. Capability inventory: enumerate read/filter/navigate/draft/write/external
   capabilities from action registry, route registry, visible buttons, forms,
   and APIs.
4. Tool parity refresh: specify generated `helper_tool_capabilities` records
   with tool id, label, scope, roles, params, side-effect class, confirmation
   policy, result renderer, tests, and deep-link shape.
5. Read/query tool layer: create deterministic scoped query tools for tasks,
   contacts, parents, students, accounting balances, payments/access,
   communications, content, classes, CRM, and provider setup.
6. Filter-setting layer: create a tool contract that updates visible page
   filters and route query params from natural language.
7. Result-card/deep-link contract: define standard response cards with
   `summary`, `metrics`, `rows`, `record_links`, `filter_state`,
   `actions_available`, and `privacy_scope`.
8. Action execution layer: define tools for create task, add note, draft email,
   draft WhatsApp, prepare payment/access review, create follow-up, update
   member status, and open record.
9. Confirmation/risk policy: map actions to no-confirm, preview, confirm,
   blocked-external, and forbidden.
10. Planner/router upgrade: design how natural language becomes a multi-step
   plan with tool calls, result validation, and repair behavior.
11. Scoped memory/profile: design helper preference/profile/knowledge storage
   per person/workspace without leaking across scopes.
12. Error/blocker model: standardize missing permission, missing integration,
   no data, ambiguous entity, blocked external write, and needs decision.
13. UI shell: design Replit/Lovable-style panel with prompt input, plan
   timeline, tool-call cards, result table/cards, filter chips, links, and
   suggested actions.
14. Streaming execution timeline: define status events such as `understood`,
   `checking_scope`, `querying`, `setting_filter`, `rendering_results`,
   `needs_confirmation`, `done`, and `blocked`.
15. Suggested next actions: after every result, suggest safe relevant actions
   based on scope and permissions.
16. Cross-surface consistency: same helper behavior for Operations drawer,
   public/portal widget where allowed, Rabbi/One Time member/provider pages,
   and mobile.
17. Observability/audit logs: log tool plans, confirmations, result links,
   redacted inputs, denied attempts, and execution evidence.
18. Test matrix: unit, integration, route, permissions, browser smoke, action
   registry, route registry, and privacy tests.
19. Progressive rollout: implement in slices with the first proof workflow:
   "parents who owe me money" scoped accounting/parent query and filter.
20. Release/live-smoke gate: local proof first; app-visible changes require
   deploy/live smoke before done.

## First Proof Workflow

Implement the first proof workflow in detail:

User asks: "How many parents owe me money?"

Expected behavior:

1. Helper resolves actor and workspace.
2. Helper identifies allowed accounting/parent/payment data sources.
3. Helper queries only that actor's permitted workspace/project data.
4. Helper sets the visible Accounting/Parents filter state or returns a
   route/deep link that opens with that filter.
5. Helper returns count, total outstanding balance, top rows, and links to
   parent/accounting records.
6. Helper suggests safe next actions: draft reminder, create follow-up task,
   export preview, open accounting view.
7. Helper does not send anything or mutate payment/access state without
   explicit confirmation.

## Output Package Required

Return a package for Codex at:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-master/`

If you cannot write files, output complete file contents for:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `PATCHES.md`
- optional `attachments/`

`CODEX_PROMPT.md` must tell Codex exactly what to edit, what to inspect, what
tests to run, and what not to mutate.

`PATCHES.md` must include concrete code blocks or patch-style guidance for:

- helper tool registry changes;
- helper planner/router changes;
- helper query/filter/result contracts;
- server route/API changes;
- Operations UI helper panel changes;
- tests and smokes.

## Guardrails

- No GHL/LeadConnector runtime.
- No cross-workspace data access.
- No external sends/charges/DNS/credentials/access grants/uploads/publishing.
- Browser text cannot approve external actions.
- Codex must audit before applying code.
