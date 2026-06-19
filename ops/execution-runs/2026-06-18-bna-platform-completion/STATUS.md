# Status

Updated: 2026-06-19T11:35:30+03:00

Branch: `codex/2026-06-18-bna-platform-completion`

Draft PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/4

Status counts:

- blocked: 60
- needs_operator_decision: 2
- done: 9
- already_satisfied: 1

Non-terminal local work IDs:

- None. All requirements now have terminal local/release-gate statuses.

Closed/already satisfied IDs:

- REQ-20260618-111: Safe test data and complete acceptance coverage
- REQ-20260618-112 BNA-PROC-001: Install root start-here and durable ramble-to-done protocol
- REQ-20260618-113 BNA-PROC-002: Deterministic execution-run tooling/schema/tests
- REQ-20260618-114 BNA-PROC-003: Reconcile AGENTS, MEMORY, TASKS, SYSTEM-STATE, briefs, and ledgers
- REQ-20260618-115 BNA-PROC-004: Independent completion-verification workflow
- REQ-20260618-116 BNA-AUDIT-001: Resume/finish Operations UI audit harness without duplication
- REQ-20260618-168 BNA-TEST-001: Isolated repeatable seed and cleanup data
- REQ-20260618-169 BNA-TEST-002: Route, interaction, responsive, helper, workspace, and student Playwright tests
- REQ-20260618-170 BNA-TEST-003: Backend/API/RBAC negative tests
- REQ-20260618-171 BNA-TEST-004: PWA identity/cache regression tests

Blocked IDs:

- REQ-20260618-101: Audit harness and audit package: Non-audit/protocol children are closed; authenticated audit package/output is missing, so screenshot-specific audit package and post-fix comparison children remain blocked.
- REQ-20260618-102: PWA public-versus-Operations separation: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-103: Workspace model, RBAC, and isolation: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-104: Operations shell, workspace selector, and navigation: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-105: Shared responsive design system and accessibility: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-106: Task manager, Decisions, intake routing, and calendar: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-107: Scoped modules and accounting: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-109: Unified scoped OpenAI helper: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-110: Public copy, portal headers, signup routes, and CTAs: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-117 BNA-AUDIT-002: Produce privacy-safe authenticated audit package: Waiting for user to upload agent-review-package.zip or audit output path
- REQ-20260618-118 BNA-AUDIT-003: Produce post-fix audit comparison: Requires completed local fix batches and authenticated audit package before comparison.
- REQ-20260618-119 BNA-PWA-001: Separate public and Operations manifests/app identities: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-120 BNA-PWA-002: Isolate service workers, caches, scopes, and cache headers: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-121 BNA-PWA-003: Enforce public-browser and installed-Operations routing invariants: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-122 BNA-PWA-004: Remove public loader/checkmark flash and header-to-hero gap: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-123 BNA-WS-001: Enforce exactly school/service-provider/family workspace types: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-124 BNA-WS-002: Scope applicable entities by workspace_id: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-125 BNA-WS-003: Server-side authorization/RLS and negative cross-tenant tests: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-126 BNA-WS-004: Clear super-admin selector and ordinary-user behavior: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-127 BNA-WS-005: Clear stale context on workspace changes: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-128 BNA-OPS-001: Ordered horizontal Operations module toolbar: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-129 BNA-OPS-002: Simplify workspace/sidebar navigation: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-130 BNA-OPS-003: Prevent unexpected page collapse/minimize: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-131 BNA-OPS-004: Consistent headers, logo behavior, portal identity, and language controls: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-132 BNA-DESIGN-001: Shared high-contrast card/spacing/type/button system: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-133 BNA-DESIGN-002: Intentional mobile controls: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-134 BNA-DESIGN-003: Balanced desktop grids: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-135 BNA-A11Y-001: Accessibility labels, contrast, focus, semantics, and modals: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-136 BNA-TASK-001: Canonical task state model: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-137 BNA-TASK-002: Separate owner/status/urgency/due/blocker/provenance: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-138 BNA-TASK-003: Merge Intake Review/Review Queue into auto-routing and Decisions: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-139 BNA-TASK-004: Internal calendar connected to tasks/classes/check-ins/events: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-140 BNA-TASK-005: Remove stale diagnostic concepts from main task UI: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-141 BNA-TASK-006: Live scoped counts and blocker explanations: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-142 BNA-TASK-007: Idempotent parser routing to correct modules/workspaces: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-143 BNA-COMMUNITY-001: Workspace-scoped communities: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-144 BNA-CONTENT-001: Teaching/research content separated from meetings/tasks/accountability: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-145 BNA-CONTENT-002: Content metadata and provenance: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-146 BNA-CONTENT-003: Workspace-specific Drive intake/routing: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-147 BNA-CLASS-001: Workspace-scoped live classes: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-148 BNA-AUTO-001: Scoped automations and operational status: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-149 BNA-INTEGRATION-001: Simplified integrations/social accounts states/actions: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-150 BNA-USER-001: Workspace-scoped users/roles/invitations: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-151 BNA-ACCOUNTING-001: Workspace payment/accounting scoping and safe actions: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-152 BNA-STUDENT-001: Workspace-and-student detail/analysis isolation: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-153 BNA-GOAL-001: Goal Board controls use plain product language: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-154 BNA-GOAL-002: Separate goals, progress, approvals, and history: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-155 BNA-I18N-001: Complete Hebrew localization and RTL behavior: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-157 BNA-HELPER-001: One visible OpenAI-powered assistant shell: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-158 BNA-HELPER-002: Scope helper memory by user/role/workspace/context: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-159 BNA-HELPER-003: Permissioned backend action registry: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-160 BNA-HELPER-004: Confirmation tiers and action audit trail: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-161 BNA-HELPER-005: Remove duplicate helper identities and dev language: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-162 BNA-HELPER-006: Prevent public/authenticated memory leakage: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-163 BNA-PUBLIC-001: Remove Operations login from public primary navigation: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-164 BNA-PUBLIC-002: Provider CTA: Advertise your program for free: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-165 BNA-PUBLIC-003: Direct parent signup/self-governance messaging and six-month offer: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-166 BNA-PUBLIC-004: Consistent approved portal headers: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-167 BNA-PUBLIC-005: Public/blog/FAQ/signup/portal route and CTA integrity: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.
- REQ-20260618-172 BNA-TEST-005: Final local and live acceptance gates: Explicit operator release approval is required before deployment and live smoke. No deployment is approved in this run.

Needs operator decision IDs:

- REQ-20260618-108: Students, Goal Board, duplicate cleanup, Hebrew, and RTL: Duplicate Menachem cleanup requires operator approval before any production/student data merge; release approval is also required before deploy/live smoke.
- REQ-20260618-156 BNA-STUDENT-002: Duplicate Menachem cleanup with audit trail/prevention: Production/student duplicate cleanup requires operator approval before any merge or mutation.

Current verification batch: Terminal status repair completed. Local implementation/evidence requirements are terminalized; release-gated items are blocked on explicit operator release approval/deploy/live smoke, and duplicate-student cleanup remains needs_operator_decision. No deployment, production-data mutation, audit crawl, watch loop, or agent-fleet loop was run.
