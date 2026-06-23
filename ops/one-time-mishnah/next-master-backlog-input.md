# One Time Mishnah - Next Master Backlog Input

Created: 2026-06-19

This is a durable, redacted input for a future master backlog run. It is not implementation evidence and must not be treated as completed work.

## Source And Scope

- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Operator intent: future One Time backlog work must be reconciled against existing tasks, decisions, requirements, blockers, task-pending docs, implementation, and BNA-only data before coding or visible row insertion.
- Privacy rule: One Time provider material stays in the One Time workspace. BNA school, public, parent, student, or unrelated provider data must not bleed into this workspace.

## Required Future Outcomes

- Rabbi Elie Scheller remains the owner for One Time provider/account decisions.
- Shloimie remains admin/manager for implementation and Operations coordination.
- Workspace scoping must be enforced across UI, APIs, task records, decision records, calendar records, content, community, notes, and integrations.
- No BNA school tasks, parent/student records, private BNA notes, public helper context, or other provider material should appear in One Time views.
- Noisy tasks and decisions should be deduped, collapsed, archived, or converted to precise operator decisions instead of becoming repeated visible cards.
- Every imported or generated One Time item needs source reference, workspace key, project key, owner, category, priority, dependency, related file/route when applicable, and notes.
- Intake should filter for relevance, source quality, workspace routing, duplicate state, and whether the item is already satisfied by current implementation.
- WhatsApp and email UX must be reviewed as operator workflows, not raw provider credentials or secret-bearing notes.
- Toolbar and button UX must expose real actions clearly and keep disabled/coming-soon actions registered with reason and expected behavior.
- A future master prompt must require reconciliation before implementation: classify items as `already_satisfied`, `duplicate`, `partially_implemented`, `missing`, `blocked`, `needs_operator_decision`, `supersedes_existing`, or `unrelated_bna_data`.
- Implementation order should follow dependency batches with evidence after each batch, not broad parallel churn.
- Closeout must include requirement IDs, evidence paths, tests, blockers, deployment/live-smoke status when app-visible, and exact next command.

## Credential And Owner-Action Boundaries

- Never place API keys, passwords, OAuth secrets, access tokens, DNS records that contain secrets, or account recovery details in GitHub, prompts, logs, task titles, screenshots, or notes.
- Use the BNA keyholder and ignored `.secrets` flow for local development.
- Railway or live provider propagation requires explicit operator approval and a dry-run summary naming only variable names, readiness, and fingerprints.
- Do not send email, create Zoom meetings, upload Vimeo videos, mutate DNS, charge cards, issue invoices, or change external account roles without explicit action-specific approval.

## Future Batch Shape

1. Reconcile backlog source packets and prior ingestion runs.
2. Close or archive duplicates and already-satisfied items with evidence.
3. Convert real blockers into operator Decisions.
4. Implement missing credential-free UI/API/workflow pieces.
5. Run focused tests and workspace-isolation checks.
6. Request owner credentials or external-account actions only for items that cannot be completed locally.
7. Deploy and smoke only after local acceptance passes and operator approval covers live changes.

## Current Known Starting Evidence

- Meeting reconciliation: `ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md`
- Prior dry-run parse: `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json`
- Provider credential diagnostics: latest `ops/qa-runs/*-provider-credential-diagnostics.md`
- Railway env audit: latest `ops/qa-runs/*-provider-env-railway-audit.md`

## Next Safe Action

When the operator asks for master backlog implementation, start by reading this file and the reconciliation packet above, then create/update stable requirements before coding. Do not skip the reconciliation gate.
