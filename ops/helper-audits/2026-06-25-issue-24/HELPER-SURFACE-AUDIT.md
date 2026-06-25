# Issue #24 Helper Surface Audit

Generated: 2026-06-25T16:01:06.049Z
Requirement: REQ-20260625-027
Source: RAW-20260625-024
Parent goal: PARENT-20260625-024

Static contract, prompt-pack, planner, and canonical route/action resolver evaluation. Live Agent Mode browser clicking and screenshot evidence are a separate release gate.

## Surface Inventory

| Surface | Endpoint | Identity | Workspace | Permission Check | Response Source |
|---|---|---|---|---|---|
| public_visitor | /api/bna/assistant/threads/:id/messages | anonymous public actor with no private account data | public/bna_public | public-safe response only; private routes must redirect or deny | real backend when configured; public fixture copy when offline |
| operations_super_admin | /api/bna/helper/message | Operations session via requireAdmin and opsIdentity | assertWorkspaceAccess plus project access | helperPermissionForTool plus typed action permission checks | real scoped helper backend |
| rabbi_provider_admin | /api/bna/helper/message | provider or Operations project-scoped session | rabbi_sheller_provider / one_time_mishnah_class | project-scoped helper permissions | real scoped helper backend or fixture-only review context |
| provider_participant_staff | /api/bna/assistant/threads/:id/messages | provider participant/staff review identity | rabbi_sheller_provider / one_time_mishnah_class | provider participant cannot access owner billing or Operations | real backend when logged in; review fixture shell otherwise |
| parent_qa_identity | /api/bna/assistant/threads/:id/messages | parent session and family scope | bna parent/family scope | parent sees own family/student data only | real scoped helper when authenticated; safe shell otherwise |
| student_qa_identity | /api/student-portal/assistant/message | student session/access code scope | bna student scope | no parent/adult/internal notes or other-student access | real scoped helper when authenticated; safe shell otherwise |
| one_time_member | /api/bna/assistant/threads/:id/messages | One Time member/session scope | rabbi_sheller_provider / one_time_mishnah_class member scope | member cannot see BNA school records or provider admin notes | real scoped helper when authenticated; review fixture shell otherwise |
| one_time_classroom | /api/bna/assistant/threads/:id/messages | One Time classroom member/access scope | rabbi_sheller_provider / one_time_mishnah_class classroom scope | no BNA school records, no raw recordings, no publish/send actions | real scoped helper when authenticated; review fixture shell otherwise |
| telegram_adapters | Telegram bridge commands and hosted Assistant/Codex routing | Telegram user/chat allowlist and mode routing | BNA canonical memory/task lanes | operator/channel checks and no active GHL runtime | hosted chat provider, structured router, or Codex |

## Conversation Pack Counts

| Role | Single-turn cases | Multi-turn conversations |
|---|---:|---:|
| public_visitor | 25 | 10 |
| operations_super_admin | 25 | 10 |
| rabbi_provider_admin | 25 | 10 |
| provider_participant_staff | 25 | 10 |
| parent_qa_identity | 25 | 10 |
| student_qa_identity | 25 | 10 |
| one_time_member | 25 | 10 |
| one_time_classroom | 25 | 10 |

## Static Resolver Evaluation

- Static route/action resolver pass rate: 280/280
- Helper surfaces inventoried: 9
- Portal roles with at least 25 cases: 8/8
- Portal roles with at least 10 multi-turn conversations: 8/8
- Live Agent Mode/browser evidence required: yes

## Static Failures

- None in static resolver evaluation.
