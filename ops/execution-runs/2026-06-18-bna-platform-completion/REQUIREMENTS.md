# Requirements

| ID | Parent | Canonical | Status | Verdict | Title |
|---|---|---|---|---|---|
| REQ-20260618-101 | - | - | in_progress | partial | Audit harness and audit package |
| REQ-20260618-102 | - | - | in_progress | partial | PWA public-versus-Operations separation |
| REQ-20260618-103 | - | - | in_progress | partial | Workspace model, RBAC, and isolation |
| REQ-20260618-104 | - | - | in_progress | partial | Operations shell, workspace selector, and navigation |
| REQ-20260618-105 | - | - | in_progress | partial | Shared responsive design system and accessibility |
| REQ-20260618-106 | - | - | in_progress | partial | Task manager, Decisions, intake routing, and calendar |
| REQ-20260618-107 | - | - | in_progress | partial | Scoped modules and accounting |
| REQ-20260618-108 | - | - | in_progress | partial | Students, Goal Board, duplicate cleanup, Hebrew, and RTL |
| REQ-20260618-109 | - | - | in_progress | partial | Unified scoped OpenAI helper |
| REQ-20260618-110 | - | - | in_progress | partial | Public copy, portal headers, signup routes, and CTAs |
| REQ-20260618-111 | - | - | in_progress | partial | Safe test data and complete acceptance coverage |
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
| REQ-20260618-122 | REQ-20260618-102 | BNA-PWA-004 | needs_verification | partial | Remove public loader/checkmark flash and header-to-hero gap |
| REQ-20260618-123 | REQ-20260618-103 | BNA-WS-001 | needs_verification | partial | Enforce exactly school/service-provider/family workspace types |
| REQ-20260618-124 | REQ-20260618-103 | BNA-WS-002 | in_progress | partial | Scope applicable entities by workspace_id |
| REQ-20260618-125 | REQ-20260618-103 | BNA-WS-003 | needs_verification | partial | Server-side authorization/RLS and negative cross-tenant tests |
| REQ-20260618-126 | REQ-20260618-103 | BNA-WS-004 | needs_verification | partial | Clear super-admin selector and ordinary-user behavior |
| REQ-20260618-127 | REQ-20260618-103 | BNA-WS-005 | needs_verification | partial | Clear stale context on workspace changes |
| REQ-20260618-128 | REQ-20260618-104 | BNA-OPS-001 | needs_verification | partial | Ordered horizontal Operations module toolbar |
| REQ-20260618-129 | REQ-20260618-104 | BNA-OPS-002 | needs_verification | partial | Simplify workspace/sidebar navigation |
| REQ-20260618-130 | REQ-20260618-104 | BNA-OPS-003 | needs_verification | partial | Prevent unexpected page collapse/minimize |
| REQ-20260618-131 | REQ-20260618-104 | BNA-OPS-004 | needs_verification | partial | Consistent headers, logo behavior, portal identity, and language controls |
| REQ-20260618-132 | REQ-20260618-105 | BNA-DESIGN-001 | needs_verification | partial | Shared high-contrast card/spacing/type/button system |
| REQ-20260618-133 | REQ-20260618-105 | BNA-DESIGN-002 | needs_verification | partial | Intentional mobile controls |
| REQ-20260618-134 | REQ-20260618-105 | BNA-DESIGN-003 | needs_verification | unknown | Balanced desktop grids |
| REQ-20260618-135 | REQ-20260618-105 | BNA-A11Y-001 | needs_verification | partial | Accessibility labels, contrast, focus, semantics, and modals |
| REQ-20260618-136 | REQ-20260618-106 | BNA-TASK-001 | needs_verification | partial | Canonical task state model |
| REQ-20260618-137 | REQ-20260618-106 | BNA-TASK-002 | needs_verification | partial | Separate owner/status/urgency/due/blocker/provenance |
| REQ-20260618-138 | REQ-20260618-106 | BNA-TASK-003 | needs_verification | partial | Merge Intake Review/Review Queue into auto-routing and Decisions |
| REQ-20260618-139 | REQ-20260618-106 | BNA-TASK-004 | needs_verification | missing | Internal calendar connected to tasks/classes/check-ins/events |
| REQ-20260618-140 | REQ-20260618-106 | BNA-TASK-005 | needs_verification | partial | Remove stale diagnostic concepts from main task UI |
| REQ-20260618-141 | REQ-20260618-106 | BNA-TASK-006 | needs_verification | local_complete_pending_release | Live scoped counts and blocker explanations |
| REQ-20260618-142 | REQ-20260618-106 | BNA-TASK-007 | needs_verification | local_complete_pending_release | Idempotent parser routing to correct modules/workspaces |
| REQ-20260618-143 | REQ-20260618-107 | BNA-COMMUNITY-001 | needs_verification | local_complete_pending_release | Workspace-scoped communities |
| REQ-20260618-144 | REQ-20260618-107 | BNA-CONTENT-001 | needs_verification | local_complete_pending_release | Teaching/research content separated from meetings/tasks/accountability |
| REQ-20260618-145 | REQ-20260618-107 | BNA-CONTENT-002 | needs_verification | local_implemented_pending_release | Content metadata and provenance |
| REQ-20260618-146 | REQ-20260618-107 | BNA-CONTENT-003 | needs_verification | local_implemented_pending_release | Workspace-specific Drive intake/routing |
| REQ-20260618-147 | REQ-20260618-107 | BNA-CLASS-001 | needs_verification | local_implemented_pending_release | Workspace-scoped live classes |
| REQ-20260618-148 | REQ-20260618-107 | BNA-AUTO-001 | needs_verification | partial | Scoped automations and operational status |
| REQ-20260618-149 | REQ-20260618-107 | BNA-INTEGRATION-001 | needs_verification | partial | Simplified integrations/social accounts states/actions |
| REQ-20260618-150 | REQ-20260618-107 | BNA-USER-001 | needs_verification | missing | Workspace-scoped users/roles/invitations |
| REQ-20260618-151 | REQ-20260618-107 | BNA-ACCOUNTING-001 | needs_verification | partial | Workspace payment/accounting scoping and safe actions |
| REQ-20260618-152 | REQ-20260618-108 | BNA-STUDENT-001 | needs_verification | partial | Workspace-and-student detail/analysis isolation |
| REQ-20260618-153 | REQ-20260618-108 | BNA-GOAL-001 | needs_verification | partial | Goal Board controls use plain product language |
| REQ-20260618-154 | REQ-20260618-108 | BNA-GOAL-002 | needs_verification | partial | Separate goals, progress, approvals, and history |
| REQ-20260618-155 | REQ-20260618-108 | BNA-I18N-001 | needs_verification | partial | Complete Hebrew localization and RTL behavior |
| REQ-20260618-156 | REQ-20260618-108 | BNA-STUDENT-002 | needs_operator_decision | blocked | Duplicate Menachem cleanup with audit trail/prevention |
| REQ-20260618-157 | REQ-20260618-109 | BNA-HELPER-001 | needs_verification | partial | One visible OpenAI-powered assistant shell |
| REQ-20260618-158 | REQ-20260618-109 | BNA-HELPER-002 | needs_verification | partial | Scope helper memory by user/role/workspace/context |
| REQ-20260618-159 | REQ-20260618-109 | BNA-HELPER-003 | needs_verification | partial | Permissioned backend action registry |
| REQ-20260618-160 | REQ-20260618-109 | BNA-HELPER-004 | needs_verification | partial | Confirmation tiers and action audit trail |
| REQ-20260618-161 | REQ-20260618-109 | BNA-HELPER-005 | needs_verification | local_implemented_pending_release | Remove duplicate helper identities and dev language |
| REQ-20260618-162 | REQ-20260618-109 | BNA-HELPER-006 | needs_verification | local_implemented_pending_release | Prevent public/authenticated memory leakage |
| REQ-20260618-163 | REQ-20260618-110 | BNA-PUBLIC-001 | needs_verification | local_already_satisfied_pending_release | Remove Operations login from public primary navigation |
| REQ-20260618-164 | REQ-20260618-110 | BNA-PUBLIC-002 | needs_verification | local_implemented_pending_release | Provider CTA: Advertise your program for free |
| REQ-20260618-165 | REQ-20260618-110 | BNA-PUBLIC-003 | needs_verification | local_implemented_pending_release | Direct parent signup/self-governance messaging and six-month offer |
| REQ-20260618-166 | REQ-20260618-110 | BNA-PUBLIC-004 | needs_verification | local_implemented_pending_release | Consistent approved portal headers |
| REQ-20260618-167 | REQ-20260618-110 | BNA-PUBLIC-005 | needs_verification | local_implemented_pending_release | Public/blog/FAQ/signup/portal route and CTA integrity |
| REQ-20260618-168 | REQ-20260618-111 | BNA-TEST-001 | done | closed_local | Isolated repeatable seed and cleanup data |
| REQ-20260618-169 | REQ-20260618-111 | BNA-TEST-002 | done | closed_local | Route, interaction, responsive, helper, workspace, and student Playwright tests |
| REQ-20260618-170 | REQ-20260618-111 | BNA-TEST-003 | done | closed_local | Backend/API/RBAC negative tests |
| REQ-20260618-171 | REQ-20260618-111 | BNA-TEST-004 | done | closed_existing | PWA identity/cache regression tests |
| REQ-20260618-172 | REQ-20260618-111 | BNA-TEST-005 | blocked | blocked | Final local and live acceptance gates |
