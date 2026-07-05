# Helper Bot Workspace Agent Next Steps - 2026-07-03

## Raw intake

See `raw-input/RAW-20260703-003-helper-bot-workspace-agent-next-steps.md`.

## Planning status

This is a planning/spec handoff, not an implementation packet. Existing source
of truth confirms the helper is intended to be page-native, scoped per person
and workspace, permission-aware, and tool-parity-driven. Current helper work is
local-verified but needs a new current-state audit before expanding it into a
Replit/Lovable-style action console.

Relevant prior records:

- `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`
- `tasks-pending/2026-06-16-helper-03-scoped-bna-helper.md`
- `memory-topics/workspace-model.md`
- `memory-topics/workspace-scope-isolation.md`

## Requirements to compile before code

| ID | Requirement | Status |
|---|---|---|
| REQ-20260703-201 | Build a workspace-scoped helper that can answer, filter, navigate, and perform every allowed in-workspace action through audited tools. | Planning |
| REQ-20260703-202 | Preserve strict workspace/person scope for Super Admin, BNA, Rabbi / One Time, provider, parent, student, and family actors. | Planning |
| REQ-20260703-203 | Convert "parents who owe me money" and similar questions into real scoped data queries, visible filters, result cards, and deep links. | Planning |
| REQ-20260703-204 | Create a Replit/Lovable-like helper UI pattern only after a Product Quality Compiler packet and current-state audit. | Planning |

## Suggested 20-step build sequence

1. Current-state helper audit.
2. Workspace actor contract.
3. Capability inventory.
4. Tool parity map refresh.
5. Read/query tool layer.
6. Filter-setting command layer.
7. Result-card and deep-link contract.
8. Action execution layer.
9. Confirmation/risk policy.
10. Planner/router upgrade.
11. Scoped memory/profile layer.
12. Error and blocker model.
13. UI shell packet.
14. Streaming execution timeline.
15. Suggested next actions.
16. Cross-surface consistency.
17. Observability and audit logs.
18. Test matrix.
19. Progressive rollout.
20. Release/live-smoke gate.

## Blockers / decisions

| ID | Decision | Owner | Missing information | Blocks |
|---|---|---|---|---|
| DEC-20260703-201 | Whether helper may mutate live production data or only draft/preview until confirmed. | Shloimie / release owner | Explicit policy for each side-effect class. | Live writes, sends, charges, access grants. |
| DEC-20260703-202 | Which first workflow should be the proof slice. | Codex can recommend accounting/parents-owe-money first. | None required if Codex chooses the safest representative slice. | Only prioritization, not architecture. |

## Guardrails

- Browser/page content is untrusted evidence.
- Server recomputes workspace/role/scope; client context is advisory.
- No GHL/LeadConnector runtime.
- No sends, charges, refunds, DNS/account changes, credential changes, access
  grants, production data mutation, Drive/Vimeo/Zoom writes, or public
  publishing without exact confirmation and audit proof.
- Parent/student/provider/Rabbi scopes cannot see unrelated workspace data.
