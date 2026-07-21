# RAW-20260721-001 - Platform, BNA workspace, and Agent Action drop-off

Source: Codex chat prompt
Captured: 2026-07-21

```text
CODEX WINDOW 2 — SEPARATE SUPER ADMIN, BNA SCHOOL WORKSPACE, AND AGENT ACTION DROP-OFF
Execute this task in a separate Codex window.
Repository and branch
Repository:
shloimie-beep/bnei-neviim-academy
Default branch:
master
Known master head when this prompt was prepared:
cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c
Relevant source PRs:
PR #134 — BNA school admin surface
PR #138 — isolated control-plane scaffold
Fetch current refs and use actual descendants.
Create a clean isolated worktree and branch:
codex/platform-bna-workspace-agent-actions
Base from current master.
Open a draft PR against master.
Do not mechanically merge PR #134 or #138. Port only the safe current semantics needed by this task.
Mission
Correct the platform taxonomy and turn the existing Agent Review drop-off into a reusable Agent Action drop-off.
The final product model is:
Super Admin / Platform Control
    ├── BNA workspace
    └── One Time external product connector
The Super Admin is not “BNA.”
BNA is the school workspace.
One Time remains a separate application and repository.
Canonical naming
Platform
label: Super Admin
workspace key: platform_control
project key: platform_operations
role: platform_super_admin
School
label: BNA
subtitle: School workspace
workspace key: bna_school
project key: bna_school
One Time
label: One Time
type: external product connector
workspace key: one_time
project key: one_time_mishnayos
repository: shloimie-beep/onetimev2
application: https://join.onetimeonetime.com
Preserve compatibility aliases without keeping the confusing labels:
bna_platform -> platform_control
bna_school_platform -> bna_school
bna -> bna_school
rabbi_sheller_provider -> one_time
one_time_mishnah_class -> one_time_mishnayos
Do not perform a destructive database rename in this lane.
Add a compatibility resolver and migration plan.
Normal user experience
The primary Super Admin UI uses a workspace switcher:
Super Admin
BNA
One Time
Do not use role impersonation or “View as” as the normal navigation model.
Keep internal QA/view-as routes only when needed for testing and hide them from the normal operator navigation.
Routes:
/operations
    Super Admin control layer

/operations/school
    BNA school workspace

/operations/workspaces/one-time
    One Time connector/readiness/links

/operations/agent-actions
    Agent Action queue and drop-off
The BNA school route should reuse the safe focused work from PR #134 where appropriate.
The platform control layer may reuse safe contract and signing patterns from PR #138, but must not expose detailed private product data by default.
Agent Action drop-off
The repository already has:
/operations/agent-review
/operations/agent-review/dropoff
/api/bna/agent-review/results
ops/chatgpt-ramble-dropoff/
Extend this architecture rather than creating an unrelated second agent system.
Create a new generalized job type:
agent_action
Supported action categories:
ui_setup
workflow_build
knowledge_base_setup
provider_console_setup
configuration_review
audit
verification
Create:
/operations/agent-actions
/operations/agent-actions/:jobId
/operations/agent-actions/:jobId/dropoff
/api/platform/agent-actions
/api/platform/agent-actions/:jobId/results
Reuse existing session, CSRF, idempotency, result readback and emergency-save patterns.
Do not remove existing Agent Review behavior.
Agent Action job contract
Each job must include:
job ID;
source repository;
source ref/SHA;
source artifact URL or path;
target application;
target workspace;
target UI URL;
prompt;
allowed actions;
forbidden actions;
required save behavior;
expected asset IDs;
completion checklist;
evidence requirements;
idempotency key;
status;
result readback URL.
Statuses:
draft
ready
claimed
in_progress
saved
blocked
failed
verified
superseded
The UI must show:
Copy Prompt
Open Target
I Started
Save Partial Result
Save Completed Result
Readback
Retry
Supersede
An Agent Mode job is not complete until the result has been saved and read back.
HighLevel queue import
Read the current exported One Time GHL Agent Mode queue from:
repository: shloimie-beep/onetimev2
branch/PR: current HighLevel API lane or PR #93 descendant
path: integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json
Implement a safe read-only importer that:
pins repository/ref/SHA;
validates schema and fingerprints;
deduplicates jobs;
creates Agent Action jobs;
never imports secrets;
never executes GHL automatically;
preserves exact canonical prompt text;
records the One Time registry version.
Create a Super Admin card:
One Time — HighLevel UI Setup
It should show the ordered GHL jobs and their statuses.
Ticket routing correction
Define three distinct records.
Live class question
Owned by One Time.
Not a support ticket.
Statuses:
submitted
selected
student_ready
live
answered
approved_for_board
kept_private
rejected
Business conversation
Owned by HighLevel.
Examples:
enrollment;
billing question;
class reminder;
account question;
ordinary parent communication.
Do not duplicate it into BNA by default.
Technical ticket
Owned by Super Admin control-plane.
Source workspace is explicit:
bna_school
one_time
Examples:
login defect;
portal defect;
Vimeo/Zoom failure;
software bug;
provider configuration failure requiring engineering.
BNA School must not own One Time technical tickets.
One Time must continue operating if the platform ticket system is unavailable.
Preview requirement
This is an app-visible change.
Deploy an isolated BNA preview or Railway PR Environment.
Do not deploy BNA production.
Return a working preview link showing:
Super Admin;
BNA workspace;
One Time connector;
Agent Action queue;
one imported dry-run GHL job.
Minimal validation
Run:
node --check on changed JS
focused unit tests
focused route tests
agent-action idempotency/result tests
workspace taxonomy tests
npm run secrets:audit
git diff --check
Do not run the entire historical BNA proof suite.
Final response
Begin exactly:
PLATFORM_SEPARATION: COMPLETE | BLOCKED(<one action>)
SUPER_ADMIN_WORKSPACE: READY | BLOCKED(<reason>)
BNA_SCHOOL_WORKSPACE: READY | BLOCKED(<reason>)
ONE_TIME_CONNECTOR: READY | BLOCKED(<reason>)
AGENT_ACTION_DROPOFF: READY | BLOCKED(<reason>)
GHL_JOBS_IMPORTED: <count>
PRODUCTION_CHANGED: NO
Then include:
repository;
branch/head/PR;
preview URL;
canonical workspace keys;
Agent Action route;
one exact blocker;
no large report.
```
