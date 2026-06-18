# Status

Updated: 2026-06-18T21:02:35+03:00

Status counts:

- in_progress: 13
- done: 4
- already_satisfied: 1
- blocked: 3
- needs_verification: 18
- not_started: 32
- needs_operator_decision: 1

Closed/already satisfied IDs:

- REQ-20260618-112 BNA-PROC-001: Install root start-here and durable ramble-to-done protocol
- REQ-20260618-113 BNA-PROC-002: Deterministic execution-run tooling/schema/tests
- REQ-20260618-115 BNA-PROC-004: Independent completion-verification workflow
- REQ-20260618-116 BNA-AUDIT-001: Resume/finish Operations UI audit harness without duplication
- REQ-20260618-171 BNA-TEST-004: PWA identity/cache regression tests

Open non-blocked IDs begin with:

- REQ-20260618-101: Audit harness and audit package (in_progress)
- REQ-20260618-102: PWA public-versus-Operations separation (in_progress)
- REQ-20260618-103: Workspace model, RBAC, and isolation (in_progress)
- REQ-20260618-104: Operations shell, workspace selector, and navigation (in_progress)
- REQ-20260618-105: Shared responsive design system and accessibility (in_progress)
- REQ-20260618-106: Task manager, Decisions, intake routing, and calendar (in_progress)
- REQ-20260618-107: Scoped modules and accounting (in_progress)
- REQ-20260618-108: Students, Goal Board, duplicate cleanup, Hebrew, and RTL (in_progress)
- REQ-20260618-109: Unified scoped OpenAI helper (in_progress)
- REQ-20260618-110: Public copy, portal headers, signup routes, and CTAs (in_progress)
- REQ-20260618-111: Safe test data and complete acceptance coverage (in_progress)
- REQ-20260618-114 BNA-PROC-003: Reconcile AGENTS, MEMORY, TASKS, SYSTEM-STATE, briefs, and ledgers (in_progress)
- REQ-20260618-119 BNA-PWA-001: Separate public and Operations manifests/app identities (needs_verification)
- REQ-20260618-120 BNA-PWA-002: Isolate service workers, caches, scopes, and cache headers (needs_verification)
- REQ-20260618-121 BNA-PWA-003: Enforce public-browser and installed-Operations routing invariants (needs_verification)
- REQ-20260618-122 BNA-PWA-004: Remove public loader/checkmark flash and header-to-hero gap (needs_verification)
- REQ-20260618-123 BNA-WS-001: Enforce exactly school/service-provider/family workspace types (needs_verification)
- REQ-20260618-124 BNA-WS-002: Scope applicable entities by workspace_id (in_progress)
- REQ-20260618-125 BNA-WS-003: Server-side authorization/RLS and negative cross-tenant tests (needs_verification)
- REQ-20260618-126 BNA-WS-004: Clear super-admin selector and ordinary-user behavior (needs_verification)
- REQ-20260618-127 BNA-WS-005: Clear stale context on workspace changes (needs_verification)
- REQ-20260618-128 BNA-OPS-001: Ordered horizontal Operations module toolbar (needs_verification)
- REQ-20260618-129 BNA-OPS-002: Simplify workspace/sidebar navigation (needs_verification)
- REQ-20260618-130 BNA-OPS-003: Prevent unexpected page collapse/minimize (needs_verification)
- REQ-20260618-131 BNA-OPS-004: Consistent headers, logo behavior, portal identity, and language controls (needs_verification)
- REQ-20260618-132 BNA-DESIGN-001: Shared high-contrast card/spacing/type/button system (needs_verification)
- REQ-20260618-133 BNA-DESIGN-002: Intentional mobile controls (needs_verification)
- REQ-20260618-134 BNA-DESIGN-003: Balanced desktop grids (needs_verification)
- REQ-20260618-135 BNA-A11Y-001: Accessibility labels, contrast, focus, semantics, and modals (needs_verification)
- REQ-20260618-136 BNA-TASKS-001: Canonical task state model (needs_verification)

Blocked / operator-decision IDs:

- REQ-20260618-117 BNA-AUDIT-002: Produce privacy-safe authenticated audit package: Waiting for user to upload agent-review-package.zip or audit output path
- REQ-20260618-118 BNA-AUDIT-003: Produce post-fix audit comparison: Requires completed local fix batches and authenticated audit package before comparison.
- REQ-20260618-156 BNA-STUDENT-002: Duplicate Menachem cleanup with audit trail/prevention: Production/student data merge requires operator approval after local migration script and dry-run evidence.
- REQ-20260618-172 BNA-TEST-005: Final local and live acceptance gates: Final gate depends on completing non-blocked local implementation and explicit operator release approval.

Current implementation batch: REQ-20260618-136 has local canonical task state model fixes plus focused tests. Next implementation target is REQ-20260618-137.

No deployment or production-data mutation is approved in this run.
