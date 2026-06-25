# RAW-20260624-009 - GitHub Issue #20 Goal Packet

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-009 |
| Source channel | github |
| Source URL | https://github.com/shloimie-beep/bnei-neviim-academy/issues/20 |
| Source type | github_issue_goal_packet |
| Captured at | 2026-06-24T22:45:00+03:00 |
| GitHub issue updated at | 2026-06-24T18:28:31Z |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-24-issue-20-parent-run.md |
| Execution run | ops/execution-runs/2026-06-24-issue-20-parent-run/ |
| Predecessor terminal evidence | Issue #18 comment 4792923047; PR #21 |

## Raw GitHub Issue Body

# BNA_GOAL_MODE_EXECUTION_PACKET

## Objective

Make the current clean-slate release genuinely ready for the next owner ramble by hardening four things that are still not trustworthy enough:

1. the visual interface must be consistently crisp, professional, aligned, and complete across public, Operations, provider, parent, student, classroom, One Time, and support surfaces;
2. browser-based QA must have reusable authenticated role sessions and a simple launcher so closing a browser window does not destroy the testing setup;
3. helpers/bots must return the correct role-scoped links and perform only registered actions, with deterministic evaluation rather than plausible but wrong answers;
4. a trusted ChatGPT/GitHub ramble must be ingestible and executable by the existing agent fleet without requiring Shloimie to copy a large prompt into multiple Codex windows every time.

This extends GitHub issue #7 and the existing canonical ramble-to-done system. It must not create a second intake protocol, task manager, agent fleet, memory system, or active-run pointer.

## Verified baseline to re-check

- Reported clean-slate master/deployed SHA: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`.
- Reported Railway deployment: `f1f3158c-e9dc-44ab-8190-fddb369e666e`.
- Reported state: `LIVE VERIFIED — CLEAN SLATE READY FOR NEXT RAMBLE`.
- `REQ-20260624-028` remains active blocked and is tracked in GitHub issue #18.
- Issue #18 is read-only reconciliation and must not apply class backfill.
- The current repo already contains `scripts/agent-fleet-supervisor.mjs`, `scripts/start-agent-fleet.ps1`, watchdog scripts, GitHub intake, Goal Mode, route/action registries, and clean-slate acceptance evidence. Reuse and harden them.

Confirm all of this against current `origin/master`, Railway readback, `ops/execution-runs/latest.json`, `BNA-START-HERE.md`, and the live app before implementation.

## Execution ordering and single-run rule

1. Do not create a second active execution run while another is active.
2. If issue #18 has started, register this issue as the next queued canonical source and wait for issue #18 to reach a terminal read-only verdict.
3. If issue #18 has not started, execute issue #18 first as the next run, then automatically continue this issue without asking Shloimie to paste another prompt.
4. After issue #18 is terminal, create one parent execution run for this issue.
5. Parallel implementation may use isolated worktrees/branches as child lanes, but only the parent run may own `ops/execution-runs/latest.json`.
6. Child lanes must write machine-readable lane status into a coordination manifest; they must not independently rewrite the active-run pointer, shared ledger, changelog, task register, or canonical memory.
7. A final integration lane owns shared-file reconciliation, merge, deployment, live smoke, and closeout.

---

# Requirement group A — Global visual-quality system

The owner specifically reports that button sizing, footer buttons, spacing, alignment, and general finish still look inconsistent or unfinished.

## A1. Audit actual rendered UI

Audit live production and the implementation checkout at:

- 390 × 844;
- 768 × 1024;
- 1440 × 900.

Cover at least:

- public homepage;
- public header and footer;
- Service Provider Directory;
- One Time landing/member/library/classroom;
- Operations dashboard and task/Decision views;
- provider portal and Rabbi Scheller workspace;
- parent portal;
- student portal;
- all login and chooser pages;
- integration/setup center;
- support/ticket surfaces;
- bot/helper surfaces;
- empty, loading, error, disabled, selected, hover, focus, and mobile-menu states.

For every defect record route, viewport, selector/component, screenshot, computed styles, observed behavior, expected behavior, severity, implementation owner, and acceptance test.

## A2. Establish measurable design invariants

Create or refine one shared token/component system for:

- button height, horizontal padding, radius, typography, icon gap, border, hover, focus, active, loading, disabled, destructive, primary, secondary, tertiary, and link-button states;
- footer actions and footer navigation;
- tabs, segmented controls, category filters, and selected states;
- cards, form controls, alerts, badges, dialogs, tables, sidebars, headers, and mobile drawers;
- spacing, alignment, content width, text hierarchy, and responsive breakpoints.

Do not merely write a design document. Update the actual canonical CSS/components/templates and remove conflicting one-off styles where safe.

Acceptance must include:

- consistent button heights within each size tier;
- no clipped labels or icons;
- no unreadable selected state;
- visible keyboard focus;
- WCAG AA contrast for normal text;
- no accidental pills where restrained rectangular controls are intended;
- no horizontal overflow;
- footer controls aligned and visually coherent;
- no visible placeholder/generic copy on production pages;
- no dead controls;
- screenshots at all required viewports;
- computed-style assertions for sizing, spacing, contrast, and alignment;
- visual-regression baselines with an explicit update policy.

## A3. Permanent quality watchdog

Strengthen `GOAL-CORE-001` through `GOAL-CORE-005` so future work cannot close while obvious UI defects remain.

The watchdog must fail or open a concrete repair finding when it detects:

- inconsistent button sizes;
- unreadable active tabs;
- footer misalignment;
- overflow/clipping;
- dead or unregistered actions;
- header/hero gaps;
- placeholder copy;
- incorrect current-page state;
- shell drift across portals.

---

# Requirement group B — Persistent authenticated agent-browser harness

Build a safe local browser-session manager for Codex/Playwright QA.

## B1. Named profiles

Support separate named profiles for at least:

- BNA super-admin;
- Rabbi Scheller provider admin;
- provider participant/staff;
- parent;
- student;
- One Time member;
- anonymous/public;
- Google owner/test account;
- Railway owner/test account;
- Stripe sandbox;
- Vimeo test account;
- DNS/registrar read-only profile when the owner chooses to bootstrap it.

## B2. Secure storage

- Store persistent profiles outside the repository, preferably under `%LOCALAPPDATA%\BNA\AgentBrowser\profiles`.
- Add explicit Git exclusions and secret-audit coverage.
- Apply current-user-only Windows ACLs.
- Never store plaintext passwords, recovery codes, API keys, cookies, or browser storage in Git, screenshots, logs, issue comments, task bodies, or generated evidence.
- Login bootstrap must open a headed browser and let Shloimie enter sensitive information manually.
- Do not attempt to bypass MFA, CAPTCHA, security warnings, device approval, or account policies.

## B3. Session lifecycle

Provide commands/shortcuts for:

- initialize profile;
- open profile;
- health-check profile;
- show reauthentication required;
- close browser safely;
- reopen after the window is closed;
- list profiles without exposing secrets;
- clear/revoke one profile;
- run a role-specific smoke using that profile.

Closing the browser window must not delete the profile. Reopening must reuse valid cookies/session state. The health check must report expired sessions honestly.

Do not promise that Google, Railway, Stripe, Vimeo, or registrar sessions will remain valid forever. Detect expiry and give one exact re-login walkthrough.

## B4. Agent Mode distinction

Document and test the distinction between:

- the local Playwright/Codex persistent profile manager; and
- ChatGPT agent’s separate virtual browser and its own cookies.

Do not claim that the local Playwright profile can be injected into ChatGPT agent. Provide separate walkthroughs:

1. local Codex/Playwright reusable sessions;
2. ChatGPT agent takeover login and persisted remote cookies;
3. connector-based access where available.

---

# Requirement group C — Bot/helper correctness and agent-mode QA

The owner reports that the bot appears active but sometimes provides a plausible link to the wrong page.

## C1. Canonical destination resolver

Implement one route/action resolver based on the canonical route registry, action registry, authenticated identity, workspace, project, role, and current page context.

Bot/helper answers that contain internal links must use this resolver. They may not invent paths from model text.

Each returned link must include:

- canonical route key;
- resolved path;
- required role;
- workspace/project scope;
- reason it is the correct destination;
- fallback when unauthorized or unavailable.

## C2. Intent evaluation matrix

Create a durable evaluation set covering ordinary owner questions such as:

- “Where do I update a student?”
- “Open Rabbi Scheller’s classes.”
- “Where do I review questions?”
- “Where do I configure API usage?”
- “How do I set up Vimeo?”
- “Where is Stripe sandbox setup?”
- “Open Decisions.”
- “Show me the task the agent just completed.”
- “Where do I fix this provider’s page?”

Run the matrix for public, super-admin, provider admin, provider staff, parent, student, and One Time member scopes.

Fail when:

- the route does not exist;
- the role cannot access it;
- the workspace is wrong;
- the page does not contain the expected landmark;
- a private link is exposed publicly;
- the bot asserts an action occurred without audit evidence;
- a link points to an alias when a canonical route is required.

## C3. Agent-mode conversation QA

Use safe synthetic accounts/sessions to converse with each helper/bot surface, follow the suggested links, and record whether the destination and action are correct.

Do not use real student/private data in fixtures or screenshots.

When a bot cannot perform an action, it must state the exact limitation and create or link a support/task record instead of pretending.

---

# Requirement group D — Durable agent result drop-off

The owner wants an agent to take a queued prompt, work, and save its response back into BNA so a later GitHub-connected ChatGPT session can read the outcome.

## D1. Typed result API/action

Implement or verify a registered, permission-checked action that can append an agent result to the correct task/parent/requirement without relying on fragile browser clicks.

The result must include:

- source/raw ID;
- task/requirement ID;
- agent run ID;
- branch/worktree;
- commit and PR;
- tests;
- deployment/live state;
- evidence paths;
- blockers/Decisions;
- concise human summary;
- structured machine payload;
- timestamp.

The API/action must be idempotent and scoped. It must not overwrite owner text or another workspace.

## D2. UI acceptance

The Operations UI must show the saved result in the task conversation/activity view with a direct link to evidence and GitHub state.

Agent-mode browser QA should also prove the UI path works, but the durable write must use the typed action/API when available.

## D3. GitHub bridge

A trusted GitHub issue or issue comment must be ingestible idempotently as one canonical raw source. Final status must be posted back to the same issue/comment thread with canonical IDs and evidence links.

Extend issue #7; do not create a competing bridge.

---

# Requirement group E — Background execution and parallel lanes

The owner wants safe executable work to continue without manually pasting every prompt.

## E1. Audit the existing fleet

Audit and harden:

- `scripts/agent-fleet-supervisor.mjs`;
- `scripts/start-agent-fleet.ps1`;
- watchdog startup/status scripts;
- queue claim/lease behavior;
- Codex CLI invocation;
- worktree creation;
- retry policy;
- locks;
- stale-task recovery;
- rate limiting;
- status/evidence reporting;
- auto-deploy policy;
- GitHub intake polling;
- Operations task-result persistence.

Do not create a second fleet.

## E2. Safe permission tiers

Implement explicit tiers:

- Tier 0 — read/audit/test/report: automatic;
- Tier 1 — local code edits, tests, isolated branch/worktree, draft PR: automatic;
- Tier 2 — merge/deploy/live smoke: only when release gates pass and the active goal grants it;
- Tier 3 — sends, charges, refunds, DNS, public publishing, account permission changes, production data mutation, class backfill: Decision/explicit approval only.

Default `AGENT_FLEET_AUTO_DEPLOY` must remain off unless the active goal explicitly authorizes a release and the release gate passes.

## E3. Reliable local startup

Provide an owner-approved Windows startup option using Task Scheduler or the Codex app automation system.

Requirements:

- starts only for Shloimie’s Windows account;
- starts after login, not before the encrypted user profile is available;
- restarts on failure with bounded retries;
- uses the canonical repo path;
- writes redacted logs under `.runtime`;
- exposes one-click Start, Stop, Restart, Status, and Open Logs shortcuts;
- does not open a visible console window unless requested;
- machine sleep/offline state is reported, not treated as completed work;
- resumes pending safe work when the machine and Codex are available again.

## E4. Parallel coordination

Implement one parent-run coordination manifest that can fan out safe independent requirements to isolated worktrees/agents.

The coordinator must prevent:

- two agents editing the same owned files without declared integration ownership;
- multiple active-run pointers;
- duplicate Tasks/Decisions;
- duplicate deploys;
- stale branches being treated as current;
- one lane overwriting another lane’s evidence;
- a lane marking the parent goal complete.

Each lane reports `queued`, `claimed`, `running`, `blocked`, `ready_for_integration`, `integrated`, or `failed` with heartbeat and evidence.

## E5. End-to-end background proof

Run one synthetic trusted GitHub comment through:

GitHub comment → canonical raw intake → parent requirement → safe executable task → agent fleet claim → isolated worktree → implementation/test or deterministic no-op → result API → Operations activity → GitHub status comment → parent-run closeout.

Acceptance:

- no manual copy/paste after the source comment is created;
- no production data mutation;
- no duplicate queue records on replay;
- machine-off behavior remains pending and resumes after startup;
- every state is visible to Shloimie.

---

# Requirement group F — Queue hygiene and owner clarity

The clean-slate census reported historical Codex Queue, Decision, blocked, and Done records. Do not erase history.

## F1. Reconcile

Classify every visible record as:

- active executable;
- awaiting owner;
- externally blocked;
- completed/history;
- duplicate;
- superseded;
- internal evidence incorrectly surfaced as user work.

## F2. UI lanes

Make the default owner experience show:

- Active now;
- Needs your decision;
- Waiting externally;
- Recently completed;
- Full history/search.

Do not show internal handoff files, duplicate parser fan-out, stale audit rows, or completed machine history as current work.

## F3. Safe cleanup

Archive/supersede/reclassify with an audit trail. Do not hard-delete canonical history or issue #18.

---

# Requirement group G — Owner setup and walkthrough

Create one owner walkthrough page and repo artifact that explains:

- current master/deployed/live SHA;
- agent fleet status;
- current active goal and lanes;
- browser profiles and re-login state;
- ChatGPT agent takeover steps;
- exact login/deep links for each BNA role;
- bot/helper QA status;
- GitHub bridge status;
- current Decisions;
- how to stop all automation;
- how to restart it;
- how to submit the next ramble;
- what happens automatically;
- what still requires approval.

Every setup card must give the exact page, exact step, expected result, validation button/command, and recovery action.

---

# Release, deployment, and evidence

After all unblocked requirements pass:

1. run focused tests;
2. run full repository tests;
3. run route/action/security/raw/content/communications/visual watchdogs;
4. run secret audit;
5. validate JSON/JSONL;
6. run execution-run validate/source-coverage/stale-evidence;
7. integrate child lanes in declared order;
8. create/update one PR;
9. review conflict and migration risk;
10. merge under the repository’s approved release policy;
11. deploy;
12. run Railway doctor, application smoke, public/privacy smoke, role flows, bot-link matrix, and browser-harness smoke;
13. record exact master/deployed/live SHA and evidence;
14. clean only owned merged worktrees/branches;
15. preserve local-only or dirty unknown worktrees.

Do not mark app-visible work done before live verification.

---

# Required final response

Return these exact sections:

1. Executive verdict
2. Baseline Git/deploy truth
3. Issue #18 status
4. Rambles/requirements registered
5. Visual defects found
6. Visual defects fixed
7. Button/footer/component system
8. Visual watchdog results
9. Persistent browser profiles
10. Reauthentication states
11. ChatGPT Agent walkthrough
12. Bot/link correctness matrix
13. Agent-mode role QA
14. Result drop-off proof
15. GitHub comment ingestion proof
16. Agent fleet status
17. Background startup status
18. Parallel-lane coordination proof
19. Queue cleanup results
20. Active Tasks and Decisions
21. Tests and evidence
22. Branch/PR/merge state
23. Deploy/live state
24. Exact owner links
25. How to submit the next ramble
26. Remaining blockers
27. Recommended next action

Every feature must use one status:

- NOT STARTED
- DOCUMENTED ONLY
- TESTED WITH FIXTURES ONLY
- IMPLEMENTED LOCALLY
- PUSHED
- MERGED
- DEPLOYED
- LIVE VERIFIED
- BLOCKED — exact reason
- PARTIAL — exact completed and incomplete parts

End with one overall state:

- `LIVE VERIFIED — READY FOR AUTOMATIC NEXT RAMBLE`
- `PARTIAL — exact remaining actions listed`
- `BLOCKED — exact owner/external action listed`

Do not say “goal complete” for a narrow sub-scope while any requirement in this packet remains non-terminal.
