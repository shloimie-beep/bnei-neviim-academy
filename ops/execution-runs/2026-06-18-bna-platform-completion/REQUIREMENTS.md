# Requirements

The original parent IDs `REQ-20260618-101` through `REQ-20260618-111` are preserved as workstreams. Child requirements `REQ-20260618-112` through `REQ-20260618-172` import the authoritative June 18 clauses with acceptance criteria.

Only audit-package generation and post-fix visual comparison are blocked by missing audit output. All other non-blocked work may proceed in dependency order.

| ID | Parent | Canonical crosswalk | Status | Baseline verdict | Title |
|---|---|---|---|---|---|
| REQ-20260618-101 | parent | - | in_progress | partial | Audit harness and audit package |
| REQ-20260618-102 | parent | - | in_progress | partial | PWA public-versus-Operations separation |
| REQ-20260618-103 | parent | - | in_progress | partial | Workspace model, RBAC, and isolation |
| REQ-20260618-104 | parent | - | in_progress | partial | Operations shell, workspace selector, and navigation |
| REQ-20260618-105 | parent | - | in_progress | partial | Shared responsive design system and accessibility |
| REQ-20260618-106 | parent | - | in_progress | partial | Task manager, Decisions, intake routing, and calendar |
| REQ-20260618-107 | parent | - | in_progress | partial | Scoped modules and accounting |
| REQ-20260618-108 | parent | - | in_progress | partial | Students, Goal Board, duplicate cleanup, Hebrew, and RTL |
| REQ-20260618-109 | parent | - | in_progress | partial | Unified scoped OpenAI helper |
| REQ-20260618-110 | parent | - | in_progress | partial | Public copy, portal headers, signup routes, and CTAs |
| REQ-20260618-111 | parent | - | in_progress | partial | Safe test data and complete acceptance coverage |
| REQ-20260618-112 | REQ-20260618-101 | BNA-PROC-001 | done | closed_existing | Install root start-here and durable ramble-to-done protocol |
| REQ-20260618-113 | REQ-20260618-101 | BNA-PROC-002 | done | closed_existing | Deterministic execution-run tooling/schema/tests |
| REQ-20260618-114 | REQ-20260618-101 | BNA-PROC-003 | in_progress | partial | Reconcile AGENTS, MEMORY, TASKS, SYSTEM-STATE, briefs, and ledgers |
| REQ-20260618-115 | REQ-20260618-101 | BNA-PROC-004 | done | closed_existing | Independent completion-verification workflow |
| REQ-20260618-116 | REQ-20260618-101 | BNA-AUDIT-001 | already_satisfied | already_satisfied | Resume/finish Operations UI audit harness without duplication |
| REQ-20260618-117 | REQ-20260618-101 | BNA-AUDIT-002 | blocked | blocked | Produce privacy-safe authenticated audit package |
| REQ-20260618-118 | REQ-20260618-101 | BNA-AUDIT-003 | blocked | blocked | Produce post-fix audit comparison |
| REQ-20260618-119 | REQ-20260618-102 | BNA-PWA-001 | needs_verification | partial | Separate public and Operations manifests/app identities |
| REQ-20260618-120 | REQ-20260618-102 | BNA-PWA-002 | needs_verification | partial | Isolate service workers, caches, scopes, and cache headers |
| REQ-20260618-121 | REQ-20260618-102 | BNA-PWA-003 | needs_verification | partial | Enforce public-browser and installed-Operations routing invariants |
| REQ-20260618-122 | REQ-20260618-102 | BNA-PWA-004 | not_started | partial | Remove public loader/checkmark flash and header-to-hero gap |
| REQ-20260618-123 | REQ-20260618-103 | BNA-WS-001 | not_started | missing | Enforce exactly school/service-provider/family workspace types |
| REQ-20260618-124 | REQ-20260618-103 | BNA-WS-002 | not_started | partial | Scope applicable entities by workspace_id |
| REQ-20260618-125 | REQ-20260618-103 | BNA-WS-003 | not_started | missing | Server-side authorization/RLS and negative cross-tenant tests |
| REQ-20260618-126 | REQ-20260618-103 | BNA-WS-004 | not_started | partial | Clear super-admin selector and ordinary-user behavior |
| REQ-20260618-127 | REQ-20260618-103 | BNA-WS-005 | not_started | missing | Clear stale context on workspace changes |
| REQ-20260618-128 | REQ-20260618-104 | BNA-OPS-001 | not_started | partial | Ordered horizontal Operations module toolbar |
| REQ-20260618-129 | REQ-20260618-104 | BNA-OPS-002 | not_started | partial | Simplify workspace/sidebar navigation |
| REQ-20260618-130 | REQ-20260618-104 | BNA-OPS-003 | not_started | unknown | Prevent unexpected page collapse/minimize |
| REQ-20260618-131 | REQ-20260618-104 | BNA-OPS-004 | not_started | partial | Consistent headers, logo behavior, portal identity, and language controls |
| REQ-20260618-132 | REQ-20260618-105 | BNA-DESIGN-001 | not_started | partial | Shared high-contrast card/spacing/type/button system |
| REQ-20260618-133 | REQ-20260618-105 | BNA-DESIGN-002 | not_started | partial | Intentional mobile controls |
| REQ-20260618-134 | REQ-20260618-105 | BNA-DESIGN-003 | not_started | unknown | Balanced desktop grids |
| REQ-20260618-135 | REQ-20260618-105 | BNA-A11Y-001 | not_started | partial | Accessibility labels, contrast, focus, semantics, and modals |
| REQ-20260618-136 | REQ-20260618-106 | BNA-TASK-001 | not_started | partial | Canonical task state model |
| REQ-20260618-137 | REQ-20260618-106 | BNA-TASK-002 | not_started | partial | Separate owner/status/urgency/due/blocker/provenance |
| REQ-20260618-138 | REQ-20260618-106 | BNA-TASK-003 | not_started | partial | Merge Intake Review/Review Queue into auto-routing and Decisions |
| REQ-20260618-139 | REQ-20260618-106 | BNA-TASK-004 | not_started | missing | Internal calendar connected to tasks/classes/check-ins/events |
| REQ-20260618-140 | REQ-20260618-106 | BNA-TASK-005 | not_started | partial | Remove stale diagnostic concepts from main task UI |
| REQ-20260618-141 | REQ-20260618-106 | BNA-TASK-006 | not_started | partial | Live scoped counts and blocker explanations |
| REQ-20260618-142 | REQ-20260618-106 | BNA-TASK-007 | not_started | partial | Idempotent parser routing to correct modules/workspaces |
| REQ-20260618-143 | REQ-20260618-107 | BNA-COMMUNITY-001 | not_started | partial | Workspace-scoped communities |
| REQ-20260618-144 | REQ-20260618-107 | BNA-CONTENT-001 | not_started | partial | Teaching/research content separated from meetings/tasks/accountability |
| REQ-20260618-145 | REQ-20260618-107 | BNA-CONTENT-002 | not_started | partial | Content metadata and provenance |
| REQ-20260618-146 | REQ-20260618-107 | BNA-CONTENT-003 | not_started | partial | Workspace-specific Drive intake/routing |
| REQ-20260618-147 | REQ-20260618-107 | BNA-CLASS-001 | not_started | partial | Workspace-scoped live classes |
| REQ-20260618-148 | REQ-20260618-107 | BNA-AUTO-001 | not_started | partial | Scoped automations and operational status |
| REQ-20260618-149 | REQ-20260618-107 | BNA-INTEGRATION-001 | not_started | partial | Simplified integrations/social accounts states/actions |
| REQ-20260618-150 | REQ-20260618-107 | BNA-USER-001 | not_started | missing | Workspace-scoped users/roles/invitations |
| REQ-20260618-151 | REQ-20260618-107 | BNA-ACCOUNTING-001 | not_started | partial | Workspace payment/accounting scoping and safe actions |
| REQ-20260618-152 | REQ-20260618-108 | BNA-STUDENT-001 | not_started | partial | Workspace-and-student detail/analysis isolation |
| REQ-20260618-153 | REQ-20260618-108 | BNA-GOAL-001 | not_started | partial | Goal Board controls use plain product language |
| REQ-20260618-154 | REQ-20260618-108 | BNA-GOAL-002 | not_started | partial | Separate goals, progress, approvals, and history |
| REQ-20260618-155 | REQ-20260618-108 | BNA-I18N-001 | not_started | partial | Complete Hebrew localization and RTL behavior |
| REQ-20260618-156 | REQ-20260618-108 | BNA-STUDENT-002 | needs_operator_decision | blocked | Duplicate Menachem cleanup with audit trail/prevention |
| REQ-20260618-157 | REQ-20260618-109 | BNA-HELPER-001 | not_started | partial | One visible OpenAI-powered assistant shell |
| REQ-20260618-158 | REQ-20260618-109 | BNA-HELPER-002 | not_started | partial | Scope helper memory by user/role/workspace/context |
| REQ-20260618-159 | REQ-20260618-109 | BNA-HELPER-003 | not_started | partial | Permissioned backend action registry |
| REQ-20260618-160 | REQ-20260618-109 | BNA-HELPER-004 | not_started | partial | Confirmation tiers and action audit trail |
| REQ-20260618-161 | REQ-20260618-109 | BNA-HELPER-005 | not_started | partial | Remove duplicate helper identities and dev language |
| REQ-20260618-162 | REQ-20260618-109 | BNA-HELPER-006 | not_started | partial | Prevent public/authenticated memory leakage |
| REQ-20260618-163 | REQ-20260618-110 | BNA-PUBLIC-001 | not_started | unknown | Remove Operations login from public primary navigation |
| REQ-20260618-164 | REQ-20260618-110 | BNA-PUBLIC-002 | not_started | unknown | Provider CTA: Advertise your program for free |
| REQ-20260618-165 | REQ-20260618-110 | BNA-PUBLIC-003 | not_started | partial | Direct parent signup/self-governance messaging and six-month offer |
| REQ-20260618-166 | REQ-20260618-110 | BNA-PUBLIC-004 | not_started | partial | Consistent approved portal headers |
| REQ-20260618-167 | REQ-20260618-110 | BNA-PUBLIC-005 | not_started | unknown | Public/blog/FAQ/signup/portal route and CTA integrity |
| REQ-20260618-168 | REQ-20260618-111 | BNA-TEST-001 | not_started | missing | Isolated repeatable seed and cleanup data |
| REQ-20260618-169 | REQ-20260618-111 | BNA-TEST-002 | not_started | missing | Route, interaction, responsive, helper, workspace, and student Playwright tests |
| REQ-20260618-170 | REQ-20260618-111 | BNA-TEST-003 | not_started | missing | Backend/API/RBAC negative tests |
| REQ-20260618-171 | REQ-20260618-111 | BNA-TEST-004 | done | closed_existing | PWA identity/cache regression tests |
| REQ-20260618-172 | REQ-20260618-111 | BNA-TEST-005 | blocked | blocked | Final local and live acceptance gates |
