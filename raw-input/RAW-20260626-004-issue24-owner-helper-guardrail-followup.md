# RAW-20260626-004 - Issue #24 Owner Helper Guardrail Follow-Up

- Source channel: `codex_chat`
- Captured at: 2026-06-26
- Parse status: `registered`
- Requirement register:
  `tasks-pending/2026-06-26-issue24-owner-helper-guardrail-followup.md`

## Raw Source

Preserve this owner correction as canonical Issue #24 follow-up.

Fix the helper/task guardrail:

- Public, anonymous, parent, student, and wrong-role helpers must not create
  executable Tasks for admin, deployment, integration, billing, DNS, backfill,
  credential, send, publish, or production-write requests.
- Rabbi Scheller may create Tasks only inside his provider workspace and only
  for allowed provider actions.
- Super-admin/Operations may create broader Tasks through typed actions and
  audit records.
- Unsupported or unauthorized requests should refuse, explain, and optionally
  create a safe support/request/audit record, not executable work.

Inspect the reported public-helper-created task #1738. If it is executable,
neutralize/reclassify it with an audit note. Do not delete history.

Also verify Agent Mode drop-off:

- Agent Mode must save directly into BNA and return `SAVED AGR-...`.
- It must not end by giving Shloimie a downloadable JSON to upload manually.
- If normal save fails, use fallback save.
- If all save paths fail, final answer must start `DROP-OFF FAILED`.

After fixing, rerun live smoke for:

1. Operations Super-Admin pilot.
2. Public/Login/Setup pilot.
3. Cross-Role Wrong-Permission negative probe.

Do not continue broad parallel Agent Mode audits until these three produce
visible AGR results or exact BLOCKED results.
