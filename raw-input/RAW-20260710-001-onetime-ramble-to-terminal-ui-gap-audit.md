# RAW-20260710-001 - One Time Ramble-To-Terminal UI Gap Audit

## Raw Queue Metadata

| Field | Value |
|---|---|
| Raw ID | RAW-20260710-001 |
| Source channel | codex_chat_attachment |
| Intake type | full_ramble_to_terminal_ui_gap_audit_and_code_package_compiler |
| Created at | 2026-07-10T07:06:48.664Z |
| Source file | C:/Users/User/Downloads/BNA_ONETIME_FULL_RAMBLE_TO_TERMINAL_UI_GAP_AUDIT_CODEX_PROMPT_2026-07-10.md |
| Source file SHA256 | F61BD03F0623AA4372A0DBB3C3FD96B85116851C4D20E3506614EB1B99DC6502 |
| Source file bytes | 46695 |
| Source file modified | 2026-07-10T06:53:43.227Z |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-10-onetime-ramble-to-terminal-ui-gap-audit.md |
| System audit package | ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/ |
| UI gap register | ops/ui-audits/2026-07-10-onetime-ui-gap-register/ |
| Outgoing ChatGPT prompts | ops/chatgpt-ramble-dropoff/outgoing/2026-07-10-onetime-ui-gap-implementation/ |

## Parsed Summary

The attached goal-mode packet says One Time/Rabbi UI complaints must stop being closed at audit, packet, or proof-needed status. This intake creates a source-level matrix, a canonical UI gap register, and implementation-grade ChatGPT code-package prompts. It does not close the underlying product UI requirements.

## Raw Prompt

```markdown
# BNA / One Time Full Ramble-to-Terminal Gap Audit
## UI Debt Register + Million-Dollar App Scorecard + Parallel ChatGPT Code-Package Compiler

**Date:** 2026-07-10
**Repository:** `shloimie-beep/bnei-neviim-academy`
**Primary workspace/project:** `rabbi_sheller_provider` / `one_time_mishnah_class`
**Mode:** Codex Goal Mode
**Packet classification:** `PRODUCT_QUALITY` + `SUPER_RAMBLE` + `CURRENT_STATE_AUDIT` + `SOURCE_RECONCILIATION` + `UI_IMPLEMENTATION_PLANNING` + `PROMPT_PACKET_COMPILER` + `PROCESS_REPAIR`

---

# BNA_GOAL_MODE_EXECUTION_PACKET

You are Codex working in the BNA repository.

Your mission is **not** to produce another general UI audit, another list of observations, or another collection of prompts that gets marked complete while the screens remain unfinished.

Your mission is to establish exact current truth for every relevant Rabbi / One Time and cross-system UI complaint Shloimie has made, identify the first skipped lifecycle stage for each complaint, create one canonical unresolved UI gap register, and compile the unresolved gaps into small, non-overlapping, implementation-grade prompts for separate GitHub-connected ChatGPT windows.

Those ChatGPT windows must prepare **repo-visible code update packages** in the existing ChatGPT-to-Codex dropoff inbox so the agent fleet can ingest them. Codex and the agent fleet will still audit, apply, test, commit, deploy, and prove the changes.

This is an **audit-to-executable-package** task. It is not audit-only.

---

# 0. Operator correction that governs this entire task

The system has treated too many UI rambles as “captured,” “audited,” “packet created,” “PQC validated,” or “proof needed” instead of forcing every complaint to a terminal product state.

The failure pattern is:

1. Some UI complaints became audits rather than fixes.
2. Public One Time, member, parent, student, classroom, provider, Operations, helper, login, mobile, and performance work split into separate lanes.
3. Collision rules sometimes prevented edits but did not reliably resume the work after the collision cleared.
4. The evidence system became stricter than the execution loop, so work stopped at “proof needed.”
5. Automated audits measured overflow, clipping, target size, topbar height, and similar signals, but did not reliably detect taste-level or product-design defects.
6. Broad phrases such as “the UI is sloppy” were sometimes decomposed into audit packets instead of a punch list in which every visible issue had a route, screenshot, owner, implementation packet, and terminal status.
7. Prompt-generation requirements were marked Done even when the prompts were never run or their product changes were never implemented.
8. A machine report with zero findings was sometimes treated too close to “UI done,” even though manual senior-designer review was still required.

Apply this correction as a hard rule:

> An audit artifact may be complete while the underlying product complaint remains open.
> A prompt packet may be complete while the implementation remains open.
> A PQC packet may validate while the implementation remains open.
> A local code change may pass tests while deployment and source-level visual acceptance remain open.

Do not collapse those states.

---

# 1. Non-negotiable anti-false-completion rules

## 1.1 Separate artifact status from product status

Every source statement, requirement, finding, audit, prompt, packet, code change, and deployment must have two separate dimensions where relevant:

```text
artifact_status
product_status
```

Examples:

```text
artifact_status = audit_complete
product_status = audit_only_no_fix

artifact_status = prompt_created
product_status = prompt_only_not_run

artifact_status = packet_validated
product_status = packet_only_no_code

artifact_status = code_prepared
product_status = code_prepared_not_applied

artifact_status = local_tests_passed
product_status = local_verified_not_deployed

artifact_status = deployed
product_status = deployed_not_source_verified

artifact_status = manual_review_complete
product_status = done_deployed_source_verified
```

Never use artifact completion to close the parent product complaint.

## 1.2 These are not terminal product completion states

The following phrases or conditions may describe an artifact, but they are **not** sufficient product completion:

```text
captured
registered
classified
covered
mapped
audit complete
report written
prompt created
prompt series done
PQC packet created
PQC validated
Agent Mode prompt deployed
packet ingested
proof needed
screenshots captured
0 automated findings
local tests pass
locally verified
collision found
blocked by active lane
ready for Codex
code generated
patch prepared
commit exists
deploy requested
```

## 1.3 Terminal product statuses

Use only these normalized product statuses:

```text
DONE_DEPLOYED_SOURCE_VERIFIED
ALREADY_SATISFIED_DEPLOYED_SOURCE_VERIFIED
MACHINE_PASS_MANUAL_REVIEW_REQUIRED
AUDIT_ONLY_NO_FIX
PROMPT_ONLY_NOT_RUN
PROMPT_RUN_REPORT_MISSING
PACKET_ONLY_NO_CODE
CODE_PREPARED_NOT_APPLIED
APPLIED_NOT_VERIFIED
LOCAL_VERIFIED_NOT_PUSHED
PUSHED_NOT_DEPLOYED
DEPLOYED_NOT_LIVE_SMOKED
DEPLOYED_NOT_SOURCE_VERIFIED
REGRESSED
OPEN_IMPLEMENTATION_PACKET_NEEDED
OPEN_IMPLEMENTATION_PACKET_READY
BLOCKED_ACTIVE_LANE
BLOCKED_EXTERNAL
NEEDS_OPERATOR_DECISION
DUPLICATE_SUPERSEDED
OUT_OF_SCOPE_EXPLICIT
FAILED
ARCHIVED_WITH_RATIONALE
```

A source statement may become `DONE_DEPLOYED_SOURCE_VERIFIED` only when all applicable conditions are met:

- exact implemented code exists;
- the relevant route/state is deployed from the recorded commit;
- focused tests and required watchdogs pass;
- live smoke passes;
- before/after evidence exists;
- manual visual review addresses the original statement, not only machine metrics;
- no later source or audit reopens the defect;
- the source statement is explicitly linked to the proof;
- the parent requirement/register is updated;
- ledger and changelog closeout exist.

## 1.4 Parent/child closeout rule

A parent ramble, parent requirement, or broad UI goal cannot close merely because:

- its control-tower packet is done;
- its audit packet is done;
- its prompts are done;
- one child route is done;
- an aggregate automated report says zero findings.

A parent may close only when every source statement is mapped to:

1. a product requirement with terminal proof;
2. a precise blocker or operator decision;
3. an explicit duplicate/supersession;
4. an explicit out-of-scope classification with rationale.

## 1.5 Machine-pass/manual-review rule

A machine report with zero findings must become:

```text
MACHINE_PASS_MANUAL_REVIEW_REQUIRED
```

until a manual senior-designer review examines the required screenshots and records source-level conclusions.

Automated measures supplement visual judgment. They do not replace it.

## 1.6 Collision-resume rule

`BLOCKED_ACTIVE_LANE` is temporary. It must include:

```text
blocking lane/job/task
overlapping files or routes
sampled_at
recheck command
safe resume condition
next packet
owner
```

When the collision clears, the requirement must automatically move back to executable work. Do not leave old collision blockers as permanent historical excuses.

---

# 2. Read order and source-of-truth preflight

Read these files before classifying anything:

```text
BNA-START-HERE.md
AGENTS.md
MEMORY.md
TASKS.md
SYSTEM-STATE.md
QUALITY-GOALS.md
GOAL-MODE.md
AGENTIC-MEMORY.md

docs/BNA-RAMBLE-TO-DONE.md
docs/RAMBLE-ROUTER.md
docs/PRODUCT-QUALITY-COMPILER.md
docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md
docs/PACKET-DAG.md
docs/SUPER-RAMBLE-PACKET-SPLITTING.md
docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md
docs/REPO-SURFACE-MAP.md
docs/VISUAL-QUALITY-HARNESS.md
docs/UI-PATTERN-REFERENCE.md
docs/DESIGN-REFERENCE-CAPTURE.md
docs/BROWSER-AGENT-SECURITY.md
docs/AGENT-TRACE-OBSERVABILITY.md

ops/visual-quality-rubric.md
ops/execution-runs/latest.json
ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md
ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md
ops/chatgpt-ramble-dropoff/README.md
ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md
ops/chatgpt-ramble-dropoff/CONTROL-TOWER.json
ops/chatgpt-ramble-dropoff/templates/*
ops/audit-governance/latest.md
ops/audit-governance/latest.json
ops/route-registry.json
ops/action-registry.json

memory-topics/one-time-rabbi-sheller.md
memory-topics/workspace-scope-isolation.md
```

Read the execution run pointed to by `ops/execution-runs/latest.json`, including:

```text
STATUS.md
NEXT-SESSION.md
requirements.json
source registry/matrices
blocker records
```

Do not assume `BNA-START-HERE.md`, `SYSTEM-STATE.md`, an old active-run note, or an old collision note is current merely because it is canonical-looking. Compare it to current branch, remote HEAD, recent commits, live proof, and current control-tower state.

---

# 3. Establish current repository, queue, and deployment truth

Run and record:

```bash
git status --short --branch
git branch --show-current
git rev-parse HEAD
git rev-parse origin/master
git log --oneline --decorate -40
git diff --stat
git worktree list

npm run chatgpt:dropoff:tower
npm run chatgpt:dropoff:scan
npm run bna:run:status
npm run bna:run:next
npm run bna:run:blockers
npm run bna:run:source-coverage
npm run bna:run:stale-evidence
npm run audit:governance
npm run production:readiness:snapshot
npm run production:readiness:gate
npm run ui:source-coverage
npm run agent:fleet:status
npm run one-time:agent-mode-acceptance
```

Also inspect:

- current open/closed One Time UI issues and pull requests;
- issue `#128` and any referenced predecessor such as `#127`;
- recent One Time UI commits and their deployment proof;
- current live deployment commit for the canonical One Time service;
- current local-only, untracked, or ignored audit/package material;
- currently active agent jobs and stale locks;
- packet lanes already ready, queued, auditing, blocked, or terminal.

Do not start a general fleet loop, deploy, production mutation, external provider action, or data write as part of this audit.

Record a **truth timestamp** and **base commit SHA**. Every generated child prompt and update package must cite this base SHA or explicitly rebase against a newer pushed SHA.

---

# 4. Register this audit as raw intake and an active goal

Allocate the next unused IDs after scanning the repository.

Create:

```text
raw-input/RAW-20260710-###-onetime-ramble-to-terminal-ui-gap-audit.md
tasks-pending/2026-07-10-onetime-ramble-to-terminal-ui-gap-audit.md
```

Suggested intake metadata:

```text
Source channel: codex_chat
Intake type: full_ramble_to_terminal_ui_gap_audit_and_code_package_compiler
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Related global scope: BNA shared UI primitives and Operations interaction patterns
Goal mode: yes
```

The active goal objective must be:

> Reconcile every relevant One Time/Rabbi UI and million-dollar-app source statement against the actual current code and live system; expose every skipped stage and unresolved complaint; create a canonical screen-by-screen UI gap register; compile only the real unresolved gaps into implementation-grade ChatGPT code-package prompts; and keep working until every audit requirement is terminal without falsely closing underlying product requirements.

Do not reuse a stale raw ID. Link all prior raw inputs as related sources rather than copying them into one giant undifferentiated blob.

---

# 5. Inventory every relevant source, not only the newest audit

Search the entire repository, Git history, issues, PRs, agent-review outputs, raw intake, memory, tasks, audits, screenshots, and prompt packets for terms and concepts including:

```text
One Time
OneTime
One Time Mishnah
Rabbi Scheller
Rabbi Sheller
Rabbi Elie
Rabbi Eli
million-dollar app
million dollar
clean
polished
professional
sloppy
UI
brand
branding
black yellow
consistency
inconsistent
header
footer
toolbar
topbar
sidebar
navigation
category
subcategory
filter
button
card
mobile
tablet
desktop
login
member
parent
student
provider
classroom
library
community
CRM
pipeline
contacts
communications
email
WhatsApp
WAPI
payments
access
trial
settings
helper
bot
overlay
lag
performance
view as
role
Super Admin
BNA bleed
```

At minimum inspect and reconcile the relevant content in:

```text
raw-input/RAW-20260617-010-rabbi-scheller-onetime-super-prompt.md
raw-input/RAW-20260622-002-full-source-prompt.md
raw-input/RAW-20260701-004-run-rabbi-onetime-visual-audit-resend-smoke.md
raw-input/RAW-20260702-008-rabbi-onetime-ui-clean-even-loads-nicely.md
raw-input/RAW-20260704-001-ship-pr87-onetime-ui-live-cleanup.md
raw-input/RAW-20260705-006-onetime-landing-signup-funnel.md
raw-input/RAW-20260705-008-release-captain-onetime-ui-recovery.md
raw-input/RAW-20260706-911-onetime-full-ui-agent-audit-prompts.md
raw-input/RAW-20260707-004-agent-mode-prompt-reconciliation-onetime-ui-audit.md
raw-input/RAW-20260707-013-onetime-brand-helper-toolbar-isolation.md
raw-input/RAW-20260708-010-onetime-resend-wapi-rabbi-login-crm.md
raw-input/RAW-20260709-001-onetime-scope-ui-agent-contact-corrections.md
raw-input/RAW-20260709-011-onetime-parallel-frontend-audit.md
raw-input/RAW-20260709-013-onetime-app-lag-ui-followup.md

tasks-pending/2026-07-02-rabbi-onetime-ui-clean-even-loads-nicely.md
tasks-pending/2026-07-06-onetime-full-ui-agent-audit-prompts.md
tasks-pending/2026-07-07-agent-mode-prompt-reconciliation-onetime-ui-audit.md
tasks-pending/2026-07-07-onetime-ui-consistency-view-as-agent-audit.md
tasks-pending/2026-07-09-onetime-parallel-frontend-audit.md
tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md

ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/
ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/
ops/prompt-packets/2026-07-09-onetime-full-frontend-audit-static-chrome/

ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/
ops/ui-audits/2026-07-10-onetime-static-chrome-live-readback/
ops/ui-audits/2026-07-10-onetime-provider-parity-live-readback/
ops/performance-audits/2026-07-09-onetime-live-lag-audit/
ops/performance-audits/2026-07-10-onetime-cache-policy-live-readback/
ops/performance-audits/2026-07-10-onetime-parent-review-lightweight-live-readback/

ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md
ops/system-audits/2026-07-07-agent-mode-prompt-reconciliation.md
ops/audit-governance/latest.md
```

This list is a floor, not a ceiling.

Include Telegram/Codex/Operations Agent Review sources when their repo-visible metadata exists. Do not expose raw private message bodies, passwords, tokens, payment data, contact exports, private student data, or unredacted authenticated screenshots.

---

# 6. Atomize every source statement

Do not treat “fix the UI,” “make it consistent,” or “million-dollar app” as one requirement.

Create stable source-statement IDs:

```text
SRC-<RAW-ID>-001
SRC-<RAW-ID>-002
...
```

Each atomic statement must describe one observable expectation or correction.

Examples:

```text
One Time public pages must use black/yellow branding.
The provider portal must not show BNA Academy branding.
The provider topbar must match One Time interaction patterns.
The parent portal must show only the linked child.
The student portal must not expose admin or parent controls.
Top-level categories must not duplicate subtabs or filters.
The first viewport must not be wasted on stacked chrome.
Buttons across sibling screens must have consistent height and state treatment.
A machine-zero finding report still requires manual visual review.
A collision blocker must resume when the lane clears.
```

For every source statement capture:

```text
source_statement_id
raw_id
source_path
source_date
exact_quote_or_precise_paraphrase
privacy_classification
workspace
project
role/view class
surface
route/state
latest_correction_source
contradictions
related requirement IDs
related audit IDs
related prompt/packet IDs
related code files
related commits
related deployments
```

Apply **latest explicit correction wins**. Preserve contradictions and supersession history rather than silently overwriting older intent.

---

# 7. Build the source-to-terminal lifecycle matrix

Create:

```text
ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/source-statement-matrix.json
ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/lifecycle-gap-matrix.json
```

For every atomic source statement, inspect this lifecycle:

```text
1. raw source preserved
2. statement atomized
3. latest correction resolved
4. requirement ID created
5. product-quality specification compiled
6. route/state/role scope defined
7. current-state visual evidence captured
8. manual visual finding recorded
9. Definition of Ready passed
10. implementation packet created
11. ChatGPT code-prep prompt created, if delegated
12. ChatGPT prompt actually run
13. repo-visible update package landed
14. Codex/agent fleet ingested package
15. generated code audited against current repo
16. code applied
17. focused tests passed
18. registries updated
19. local visual proof passed
20. commit pushed
21. correct target deployed
22. live smoke passed
23. after screenshots captured
24. manual source-level visual review passed
25. parent requirement/register updated
26. ledger/changelog updated
27. stale duplicates/superseded records reconciled
28. source statement terminally closed
```

For each statement record:

```text
first_missing_stage
all_missing_stages
stage_owner
root_cause
current_product_status
next_executable_action
next_packet_id
dependencies
blocker
blocker_owner
blocker_recheck
evidence_freshness
```

The audit must answer:

- Which ramble statements never became specifications?
- Which became specifications but no implementation packet?
- Which became audit prompts but were never run?
- Which produced audit reports but no fixes?
- Which produced code packages but were not applied?
- Which were applied locally but not pushed?
- Which were pushed but not deployed?
- Which were deployed but not manually checked against the original complaint?
- Which old “done” claims were reopened by newer complaints or screenshots?
- Which historical collision blockers have cleared?
- Which items are blocked only by external account/setup decisions?
- Which items need an actual design decision rather than engineering work?
- Which items are duplicates or stale wording of a newer requirement?

---

# 8. Create the canonical UI gap register

Create:

```text
ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.md
ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.json
ops/ui-audits/2026-07-10-onetime-ui-gap-register/SCREENSHOT-INDEX.md
```

The register is the authoritative screen-by-screen punch list.

Group findings by these surfaces:

## 8.1 Global One Time design system

- brand tokens;
- black/yellow/cream palette;
- typography;
- logo lockup;
- header/footer;
- buttons;
- inputs/selects;
- cards;
- tables;
- status chips;
- tabs/subtabs;
- filters;
- drawers/modals;
- empty/loading/error/blocked/success states;
- helper launcher/panel;
- focus/hover/active/disabled states;
- spacing/density;
- shared responsive behavior.

## 8.2 Public marketing and conversion

```text
/
 /one-time
 /one-time/
 /one-time/mishnayos
 /one-time/privacy.html
 /one-time/terms.html
 public aliases and canonical redirects
 campaign strip
 hero
 proof strip
 program cards
 FAQ
 lead form
 confirmation state
 footer
```

## 8.3 Authentication and access entry

```text
/one-time/member-login
member login
parent login
student login
provider/Rabbi login
invitation
verification
recovery
password reset
expired/invalid link
permission denied
logout
```

## 8.4 Member home and library

```text
/rabbi-member
/member-library
recording/library detail
worksheet/resource state
announcement state
access/trial state
support/private question entry
```

## 8.5 Parent portal and trial journey

```text
/parent
/parent.html?review=one-time
linked-child scope
next class
Zoom/readiness
attendance/progress
library/worksheets
announcements
trial/payment/access
achievements/rewards
private support/question
```

## 8.6 Student portal and classroom

```text
/student
/student.html?review=one-time
/one-time-classroom
/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
lesson/video
worksheet
attendance/progress
question/reply
announcement
achievement/reward
```

## 8.7 Provider/Rabbi portal

```text
/provider.html?review=one-time
signed provider/Rabbi session
overview
parents
students
communications
live class
attendance
course/library
worksheets
announcements
payments/trial/access
milestones/achievements/rewards
questions/support
integrations
branding/settings
mailbox
```

## 8.8 One Time Operations workspace

Audit the scoped workspace/project across:

```text
overview/dashboard
CRM/pipeline
contacts/members
classes
content/library
community/questions
communications
email
WhatsApp/WAPI
payments/access
tasks/decisions
automations
settings/integrations
Studio
support drawer
```

Specifically review:

- category/subcategory/filter hierarchy;
- sidebar and topbar density;
- duplicate labels;
- active-location clarity;
- first useful content;
- action placement;
- table/detail patterns;
- irrelevant Super Admin/setup cards;
- support diagnostics leakage;
- BNA/One Time context changes;
- stale selected workspace/project state.

## 8.9 Helper/bot/action surfaces

- public helper;
- member helper;
- parent/student helper;
- provider/Rabbi helper;
- Operations helper;
- floating overlays;
- destination links;
- action state/readback;
- unsupported action ticketing;
- role/workspace scope;
- no critical CTA obstruction.

## 8.10 Cross-system consistency

Compare One Time and BNA for **behavioral consistency**, not identical branding.

Required rule:

```text
One Time = black/yellow brand.
BNA = cream/navy/teal-cyan brand.
```

Shared patterns may be consistent for:

- control sizes;
- interaction states;
- spacing logic;
- table/detail architecture;
- modal/drawer behavior;
- keyboard/focus behavior;
- mobile collapse behavior;
- loading/error/empty state grammar.

Do not “fix consistency” by leaking BNA branding into One Time or One Time data into BNA.

## 8.11 Performance/loading

Separate:

- visual polish;
- HTML/asset/API latency;
- excessive DOM;
- heavy shared shells;
- layout shift;
- blocking scripts;
- cache/static policy;
- stale or duplicate requests;
- route-specific loading skeleton behavior.

## 8.12 Responsive and accessibility

Required viewports:

```text
1440 × 900
1024 × 768 or current standard
768 × 1024
430 × 932
390 × 844
```

Include keyboard/focus review and WCAG 2.2 A/AA checks where applicable.

---

# 9. Required row shape for the UI gap register

Every complaint/finding row must include:

```text
gap_id
source_statement_ids
latest_source_date
surface
route
role/view class
state
viewport
screenshot_before
screenshot_after
visual_defect_codes
severity
operator_complaint
current_observed_state
expected_product_state
machine_result
manual_designer_result
artifact_status
product_status
related_requirements
related_packets
likely_root_cause
implementation_files
commit
deployment
verification
blocker
owner
next_action
next_packet_id
terminal_reason
```

Use VQ codes from `ops/visual-quality-rubric.md`.

No row may say only “needs polish.” State exactly what is wrong, where, why it matters, and what the implementation must change.

---

# 10. Manual senior-designer review

Run or reuse fresh visual evidence, then manually review the screenshots.

Do not stop at automated audit output.

For every relevant route and viewport, review:

## Visual hierarchy

- Is the primary purpose obvious within a few seconds?
- Is the primary action obvious?
- Is the first viewport purposeful?
- Are title, description, controls, content, and next action in a logical order?
- Are cards and panels proportionate to their information value?

## Density and whitespace

- Is there wasted blank canvas?
- Is there excessive stacked chrome?
- Are toolbars, tabs, filters, and status rows compact without becoming cramped?
- Do repeated context labels waste space?
- Do lists/tables have the right density for the role?

## Brand and credibility

- Does every One Time route feel like the same black/yellow product?
- Is the logo scale consistent and intentional?
- Is there BNA visual or terminology bleed?
- Are placeholders, mocks, TEST records, support diagnostics, or internal IDs visible in normal user paths?
- Does the screen look founder-demo-ready rather than prototype-like?

## Interaction consistency

- Are sibling buttons the same height and semantic style?
- Are active, hover, focus, disabled, blocked, preview, and destructive states clear?
- Are category, subcategory, and filter controls visually distinct by function?
- Are tables, cards, detail drawers, and modals consistent across modules?

## Role relevance

- Does Rabbi see only actionable provider work?
- Does the parent see only the linked child?
- Does the student see only self-scoped learning?
- Does the member see member content rather than admin/setup noise?
- Are Super Admin diagnostics behind a support drawer or role gate?

## Product completeness

- Does each page explain empty, loading, blocked, error, and success states?
- Does the user know what clears a blocker?
- Does every visible action work, route, or explain why unavailable?
- Does the screen have an end state and useful next action?

## Taste-level defects

Record visual issues even when:

- no overflow exists;
- target sizes pass;
- topbar height is under threshold;
- console is clean;
- automated finding count is zero.

A manual reviewer may create a VQ finding from proportion, hierarchy, redundancy, visual rhythm, relevance, or obvious inconsistency.

---

# 11. Million-dollar app scorecard

For every primary route, score each criterion separately as:

```text
PASS
FAIL
BLOCKED
NOT_APPLICABLE
MANUAL_REVIEW_REQUIRED
```

Do not use one aggregate score to hide a failed criterion.

Criteria:

1. **Visual polish** — typography, spacing, alignment, contrast, component consistency.
2. **Brand coherence** — correct One Time identity and no BNA bleed.
3. **Information architecture** — logical categories, subtabs, filters, and route naming.
4. **Workflow completeness** — states, next action, readback, error handling.
5. **Action integrity** — every visible action works, routes, or explains its disabled/blocked state.
6. **Role relevance** — no wrong-role, Super Admin, setup, or cross-workspace noise.
7. **Data credibility** — human labels, useful data, no fake placeholder surfaces.
8. **CRM/product credibility** — list/detail, stage, activity, context, and next-action quality where applicable.
9. **Community/classroom credibility** — clear class/library/question/announcement roles and privacy.
10. **Communications credibility** — sender/audience/status/readiness and no unsafe implied send.
11. **Payment/access credibility** — sandbox/live/blocked/access state clarity without inventing provider actions.
12. **Responsive quality** — 390/430/768/1024/1440 behavior.
13. **Accessibility** — contrast, focus, labels, keyboard, reflow, touch.
14. **Performance** — first meaningful content, latency, excessive shell/DOM, layout stability.
15. **Privacy/security** — auth, role, workspace, route, and data isolation.
16. **Founder-demo readiness** — could Shloimie confidently show this exact state without explaining obvious unfinished UI?

A route cannot be called million-dollar quality if any applicable P0/P1 criterion fails or manual review remains required.

---

# 12. Audit the process failure itself

Create:

```text
ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/root-cause-analysis.md
```

Classify each missed item by one or more root causes:

```text
RC-01 audit artifact closed instead of product requirement
RC-02 prompt created but never run
RC-03 Agent Mode result failed to land
RC-04 packet created but no code prepared
RC-05 code prepared but not applied
RC-06 local verification stopped before push/deploy
RC-07 deploy occurred but original source was never manually rechecked
RC-08 collision blocker never resumed
RC-09 broad source statement was under-atomized
RC-10 source statement mapped only to protocol/audit requirement
RC-11 automated harness missed taste-level defect
RC-12 old evidence became stale after later changes
RC-13 duplicate/stale registers contradict current truth
RC-14 active execution-run pointer or handoff became stale
RC-15 audit-governance finding lacked task mapping
RC-16 unclear owner or next action
RC-17 external setup improperly blocked unrelated UI work
RC-18 shared-file coupling caused repeated collisions
RC-19 branch/local/pushed/live state diverged
RC-20 parent requirement closed while child requirements remained open
```

For each root cause, propose a durable system repair.

At minimum create or update requirements for watchdog/validator behavior that detects:

### Audit-only implementation gap

```text
An app-visible source statement is mapped only to audit, prompt-generation,
PQC, report, or protocol artifacts and has no implementation requirement.
```

Emit:

```text
AUDIT_ONLY_IMPLEMENTATION_GAP
```

### Machine pass without designer closeout

```text
A visual requirement has zero automated findings but no manual screenshot
review tied to its source statement.
```

Emit:

```text
MACHINE_PASS_MANUAL_REVIEW_REQUIRED
```

### Parent closed before descendants

```text
A parent raw/goal/requirement is terminal while an actionable descendant source
statement or implementation requirement is open.
```

Emit:

```text
PARENT_CLOSED_WITH_OPEN_DESCENDANTS
```

### Stale collision blocker

```text
A requirement is BLOCKED_ACTIVE_LANE but the referenced job/lock/lane is no
longer active or the sample is stale.
```

Emit:

```text
STALE_COLLISION_BLOCKER_REOPEN
```

### Stale evidence

```text
The implementation or live route changed after the evidence timestamp/commit.
```

Emit:

```text
SOURCE_PROOF_STALE
```

### Prompt not run

```text
A prompt-generation task is terminal but its expected child packet/report does
not exist.
```

Emit:

```text
PROMPT_OUTPUT_NOT_EXECUTED
```

Prepare a focused process-repair implementation packet if these protections do not already exist.

---

# 13. Reconcile historical statuses against current reality

Do not trust old prose such as:

```text
locally verified; deploy/live-smoke blocked
static chrome complete
provider parity complete
0 findings
prompt packet done_verified
```

For each old requirement:

1. inspect the actual current file;
2. inspect the relevant commit;
3. confirm the commit is pushed;
4. confirm the correct service deployed that commit;
5. inspect live route proof;
6. compare newer audits and newer operator complaints;
7. decide whether the old item is:
   - still done;
   - superseded;
   - regressed;
   - partially satisfied;
   - stale evidence;
   - audit-only;
   - local-only;
   - blocked;
   - duplicate.

Preserve provenance. Do not rewrite history to make it look cleaner.

Update stale registers with a dated reconciliation section rather than deleting old evidence.

---

# 14. Code-surface inspection

Inspect the actual current implementation, including likely files such as:

```text
server.js

public/operations.html
public/one-time/index.html
public/rabbi-member.html
public/member-library.html
public/one-time-parent-review.html
public/parent.html
public/student.html
public/provider.html
public/one-time-classroom.html
public/one-time-email-review.html

public/css/one-time-operations.css
public/css/one-time-shared-review.css
public/js/bna-bot-widget.js
public/js/operations-*.js

config/brands/one-time.json
config/service-provider-sites/one-time.json

src/lib/bna/*
tests/*
scripts/audit-*.mjs
scripts/smoke-*.mjs
ops/action-registry.json
ops/route-registry.json
```

Discover the true current files rather than assuming this list is exhaustive.

For each unresolved gap, name:

- exact file(s);
- exact component/function/selector where discoverable;
- likely shared primitive;
- collision risk;
- tests to add/update;
- routes/states affected.

---

# 15. Produce implementation packets only for real unresolved gaps

Create:

```text
ops/prompt-packets/2026-07-10-onetime-ui-gap-implementation/MANIFEST.md
ops/prompt-packets/2026-07-10-onetime-ui-gap-implementation/manifest.json
ops/prompt-packets/2026-07-10-onetime-ui-gap-implementation/WINDOW-INDEX.md
```

Also create a generated outgoing prompt batch under:

```text
ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/
```

with:

```text
README.md
manifest.json
prompts/01-*.md
prompts/02-*.md
...
```

Use `npm run chatgpt:packet-prompts` when it fits the current workflow, but inspect and strengthen the generated prompts so they satisfy this contract.

Do not create empty or speculative packets.

Create a child prompt only when the audit identifies a real unresolved implementation gap.

A child packet should normally cover:

- one major module; or
- one shared primitive plus its direct consumers; or
- one to three closely related routes.

Do not combine unrelated frontend, backend, external provider, payment, communications-send, and deployment work in one packet.

---

# 16. Candidate child lanes

Use only the lanes justified by actual unresolved findings.

Possible lanes:

1. **Process/source-completion guardrails**
   - watchdogs/validators for audit-only closure, prompt-not-run, stale collision, stale proof, parent/child closure.

2. **Shared One Time design system**
   - tokens, typography, buttons, fields, cards, tabs, filters, status states, header/footer primitives.

3. **Public funnel and auth/recovery**
   - public landing, aliases, member login, invitation, verification, recovery/reset.

4. **Member/parent/student/classroom**
   - member home/library, parent portal, student portal, classroom states.

5. **Provider/Rabbi portal**
   - provider shell, dashboard, parents/students, communications, live class, library, payments/access, questions/support.

6. **Operations shell and IA**
   - sidebar, topbar, categories, subcategories, filters, workspace/project state, support drawer.

7. **CRM/pipeline/contacts**
   - list/detail, stages, search/filter, activity, communications, next action.

8. **Classes/library/community**
   - classes, recordings, worksheets, announcements, questions, moderation, role-scoped community states.

9. **Communications/email/WhatsApp**
   - inbox, preview, sender/audience/status, readiness, blocked/send states. No real send.

10. **Payments/access/settings**
    - setup/readiness UI, sandbox/live distinction, access/trial state. No live charge or provider mutation.

11. **Helper/action/overlay**
    - role scope, destinations, overlays, action readback, no CTA obstruction.

12. **Performance/responsive/accessibility**
    - only findings not already fixed by current cache/lightweight-shell work.

13. **Independent verifier/deploy closeout**
    - after implementation packets are applied.

Dependencies matter. For example, a shared design-system packet may need to land before parallel route packets. Represent that in the manifest rather than allowing overlapping windows to edit the same files.

---

# 17. Contract for every generated ChatGPT coding-window prompt

Every prompt in `outgoing/<batch-id>/prompts/` must be directly pasteable into one GitHub-connected ChatGPT window.

Each prompt must include:

```text
parent_raw_id
parent_goal_id if present
packet_id
lane_key
packet_role
stage
owner
base_branch
base_commit_sha
workspace
project
source_statement_ids
gap_ids
requirement_ids
exact scope
out of scope
dependencies
exact routes/states/viewports
current evidence paths
expected product result
likely files/components
acceptance criteria
tests
screenshot requirements
privacy/security constraints
collision rules
handoff rules
```

Each prompt must say:

> Do not solve the whole parent ramble. Complete only this packet’s scope.

Each prompt must instruct the ChatGPT window to read:

```text
BNA-START-HERE.md
AGENTS.md
docs/BNA-RAMBLE-TO-DONE.md
docs/PRODUCT-QUALITY-COMPILER.md
ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md
ops/chatgpt-ramble-dropoff/README.md
ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md
this parent manifest
the cited source/evidence files
the actual current implementation files
```

## 17.1 The ChatGPT window is a code-preparation window, not another audit-only window

It must:

1. inspect current pushed repository state;
2. identify exact code changes;
3. write real implementation code or unified diffs;
4. write/update focused tests;
5. explain compatibility and collision risks;
6. package the work for Codex.

It must not respond with only:

- findings;
- suggestions;
- pseudocode;
- generic design recommendations;
- another audit prompt;
- placeholders such as “implement this later.”

## 17.2 Required repo-visible update package

The ChatGPT window must create only a new packet folder:

```text
ops/chatgpt-ramble-dropoff/incoming/<packet-id>/
```

Required files:

```text
packet.json
RAW.md
CODEX_PROMPT.md
MANIFEST.json
status.json
PATCHES.md
```

Optional:

```text
attachments/
```

Use the current templates under:

```text
ops/chatgpt-ramble-dropoff/templates/
```

## 17.3 Package status

Set:

```json
{
  "status": "ready_for_codex_audit",
  "implementation_status": "code_prepared_not_applied"
}
```

The package is not product completion.

## 17.4 PATCHES.md requirements

`PATCHES.md` must contain:

- actual unified diffs where practical;
- otherwise complete replacement-file blocks with exact repo paths;
- tests or test diffs;
- no `...`, omitted sections, or placeholder code;
- base commit SHA;
- assumptions;
- files inspected;
- files changed;
- expected generated artifacts;
- tests Codex should run;
- visual evidence Codex should capture after applying;
- known collision risks.

For large exact replacements, use:

```text
attachments/replacements/<repo-path>
```

and list each replacement in `MANIFEST.json`.

## 17.5 Safety flags

The package must state:

```text
external_write_required = false
external_writes_performed = false
secrets_included = false
private_data_included = false
```

unless the lane is explicitly a later approval-gated provider packet. This audit should not create real-send, real-charge, DNS, credential, provider-mutation, access-grant, or production-data-write packages.

## 17.6 GitHub write fallback

Preferred:

- create the packet folder in a scoped PR containing only the packet.

Fallback:

- post one marked GitHub issue/PR comment using `BNA_CHATGPT_DROPOFF_PACKET`;
- include complete fenced contents for every required packet file.

Never return only a `/mnt/data` path, local ZIP, screenshot-only answer, or ordinary chat text.

## 17.7 Final answer from each ChatGPT window

Use only:

```text
DROP_OFF_CREATED: <PR URL or GitHub comment URL>
```

or:

```text
CANNOT_WRITE_GITHUB: <exact permission error>
```

---

# 18. Agent-fleet pickup and Codex application flow

The audit output must include the exact operational sequence:

```bash
npm run chatgpt:dropoff:tower
npm run chatgpt:dropoff:scan
npm run chatgpt:dropoff:apply
npm run agent:fleet:status
```

For each landed packet verify:

- packet is repo-visible;
- packet validates;
- packet ID/fingerprint is not a duplicate;
- lane has no active collision;
- status moved to `codex_queued` or the corresponding observable job exists;
- agent-fleet ingest is enabled/running, or exact blocker is recorded.

Do not say “the swarm will pick it up” unless the control tower and queue prove that ingestion is enabled and the packet became claimable/queued.

Codex/agent pickup must:

1. audit the package against the actual current repo;
2. rebase/adapt it if current HEAD changed;
3. apply only valid changes;
4. run focused tests;
5. run required PQC/watchdog checks;
6. capture local before/after visual proof;
7. commit and push a coherent slice;
8. deploy through the approved target/release gate for app-visible work;
9. live-smoke;
10. capture after screenshots;
11. perform manual source-level visual review;
12. update the gap register, parent register, packet status, ledger, and changelog.

---

# 19. Required audit outputs

Create this complete package:

```text
raw-input/RAW-20260710-###-onetime-ramble-to-terminal-ui-gap-audit.md

tasks-pending/2026-07-10-onetime-ramble-to-terminal-ui-gap-audit.md

ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/
  report.md
  report.json
  source-statement-matrix.json
  lifecycle-gap-matrix.json
  root-cause-analysis.md
  stale-status-reconciliation.md

ops/ui-audits/2026-07-10-onetime-ui-gap-register/
  report.md
  report.json
  SCREENSHOT-INDEX.md

ops/prompt-packets/2026-07-10-onetime-ui-gap-implementation/
  MANIFEST.md
  manifest.json
  WINDOW-INDEX.md

ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/
  README.md
  manifest.json
  prompts/*.md
```

Update as appropriate:

```text
TASKS.md
MEMORY.md or memory-topics/one-time-rabbi-sheller.md
ops/agent-task-ledger.jsonl
ops/agent-changelog.md
ops/execution-runs/latest.json and active run only if this truly becomes the active run
NEXT-SESSION.md
ops/audit-governance/*
```

Do not create a second active execution run without reconciling the existing pointer and protocol.

---

# 20. Required report sections

`report.md` must include:

## Executive truth

State plainly:

- what is demonstrably done and live;
- what is machine-pass but still awaiting manual design review;
- what is audit-only;
- what is prompt-only;
- what is packet-only;
- what is local-only;
- what is pushed but not deployed;
- what is deployed but not source-verified;
- what regressed;
- what is blocked externally;
- what needs operator decisions;
- what is duplicate/superseded;
- what exact implementation packages should run next.

## Counts

Include counts for:

```text
source files inspected
atomic source statements
statements terminally done
machine-pass/manual-review-required
audit-only/no-fix
prompt-only/not-run
prompt-run/report-missing
packet-only/no-code
code-prepared/not-applied
local-only
pushed/not-deployed
deployed/not-source-verified
regressed
active-lane blocked
external blocked
operator decisions
duplicates/superseded
implementation packages generated
```

## Skipped-stage summary

For every lifecycle stage, count how many statements stopped there.

## Screen-by-screen gap register summary

Link to every route/surface group.

## Million-dollar scorecard summary

No single green aggregate. Show failed criteria by route.

## Root-cause summary

Show which process failures created the backlog.

## Parallel execution plan

Show:

```text
wave
packet/window
dependencies
lane_key
source IDs
routes
likely files
collision risk
expected packet path
```

## Do first

Name the smallest safe implementation wave that removes the greatest visible inconsistency without overlapping another lane.

## Do not do yet

List external sends, payments, provider mutations, DNS, credentials, production data writes, access grants, and other approval-gated work separately.

---

# 21. Audit verification commands

Use targeted commands first. Run applicable checks such as:

```bash
node --check server.js

npm run pqc:validate
npm run watchdog:protocol-drift
npm run watchdog:navigation-ia
npm run watchdog:ui
npm run watchdog:visual
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
npm run watchdog:workspace-scope
npm run secrets:audit

npm run audit:onetime-role-ui
npm run audit:onetime-toolbar-density
npm run audit:parent-student-login-ui
node scripts/audit-onetime-parallel-frontend.mjs

npm run audit:governance
npm run bna:run:source-coverage
npm run bna:run:stale-evidence
npm run chatgpt:dropoff:tower
npm run chatgpt:dropoff:scan
```

Run focused tests related to the exact audit/compiler/process files you change.

Do not use a broad test failure unrelated to this audit as an excuse to stop. Record pre-existing failures distinctly and continue all safe work.

Do not deploy during the audit unless a separate implementation packet has already been applied and the approved release gate explicitly permits it.

---

# 22. Definition of Done for this audit/compiler task

This **audit/compiler task** may be marked Done only when:

1. raw intake and goal/register exist;
2. every relevant source is inventoried;
3. every relevant source statement is atomized;
4. every statement has a lifecycle row;
5. the first skipped stage is named;
6. old statuses are reconciled against current code/live truth;
7. the canonical UI gap register exists;
8. manual designer review is complete or exact screenshot/auth blocker is recorded;
9. every primary route has a million-dollar scorecard;
10. every unresolved gap has a product status and owner;
11. only real unresolved gaps became child packets;
12. each child prompt is directly usable by one ChatGPT coding window;
13. each prompt requires a repo-visible code update package;
14. packet dependencies and collision lanes are explicit;
15. the outgoing prompt batch validates;
16. audit governance maps the new artifacts;
17. ledger/changelog and next-session handoff are updated;
18. the final summary reports counts and exact next wave.

This does **not** close the underlying UI product requirements.

The underlying UI product requirements remain open until their generated code packages are:

```text
landed
ingested
audited
applied
tested
pushed
deployed
live-smoked
manually source-verified
closed with evidence
```

---

# 23. Final response format

Return:

```text
STATUS: DONE | PARTIAL | BLOCKED
BASE_COMMIT: <sha>
RAW_ID: <id>
AUDIT_REGISTER: <path>
SYSTEM_AUDIT: <path>
UI_GAP_REGISTER: <path>
SOURCE_STATEMENTS: <count>
DONE_DEPLOYED_SOURCE_VERIFIED: <count>
MACHINE_PASS_MANUAL_REVIEW_REQUIRED: <count>
AUDIT_ONLY_NO_FIX: <count>
PROMPT_ONLY_NOT_RUN: <count>
PACKET_ONLY_NO_CODE: <count>
LOCAL_OR_PUSHED_NOT_LIVE: <count>
REGRESSED: <count>
BLOCKED_EXTERNAL: <count>
NEEDS_OPERATOR_DECISION: <count>
IMPLEMENTATION_WINDOWS_CREATED: <count>
OUTGOING_PROMPT_BATCH: <path>
FIRST_SAFE_WAVE: <packet IDs>
NEXT_COMMAND: <exact command>
BLOCKERS: <concise list>
```

Then include a concise table of generated ChatGPT windows:

```text
window
packet_id
lane_key
scope
source statement IDs
routes
dependencies
expected incoming packet path
```

Do not say the whole One Time UI is done unless every source statement satisfies the terminal product rule above.

```
