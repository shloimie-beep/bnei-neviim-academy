# RAW-20260709-005 - Audit governance and stale audit tasking

Source: codex_chat
Captured: 2026-07-09
Parse status: registered
Requirement register: `tasks-pending/2026-07-09-audit-governance-and-stale-audit-tasking.md`

## Raw intake

Can you check with all these audits that we're doing, which ones we've actually implemented and which ones are just sitting there and stale? And if there's stuff that need to be implemented, like that audit, that seems like a good audit. Like, what's the deal? Did we end up doing those things? And we have to have a place for all these audits and all these like random stuff to go so they just don't sit there and get stale. And we have to make sure that the audits don't end up staying just as audits but get turned into tasks if there's just an audit sitting around with obvious gaps in the system.

## Parsed intent

- Inventory existing audit artifacts and classify whether they are implemented/proven, active, blocked, stale/unmapped, or archive-only evidence.
- Create a durable place for audit governance so audit findings do not sit as disconnected files.
- Add a repeatable check that flags audit artifacts with obvious gaps when they lack a `REQ-*`, `TASK-*`, `DEC-*`, or `WATCH-*` mapping.
- Preserve privacy: do not commit raw private screenshots or message bodies just because an audit folder exists.
