# MASTER-07 File Ownership

Cycle ID: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`

| File/pattern | Primary workstream | Other workstreams must do |
|---|---|---|
| `server.js` | `OPS-02` or owning backend workstream | Check registry before editing; document exact route/function touched. |
| `public/operations.html` | `OPS-02` / `HELPER-03` / `UI-01` depending on section | Avoid broad formatting; patch the smallest section. |
| `public/index.html` | `UI-01` | Preserve normal public website access and current PWA routing rules. |
| `public/student.html` | `COMMUNITY-06` / `UI-01` | Preserve access-code fallback and student privacy. |
| `public/parent.html` | `COMMUNITY-06` / `UI-01` | Preserve parent-scoped visibility and parent-managed student login guardrails. |
| `scripts/telegram-kimi-bridge.mjs` | `HELPER-03` / `INT-05` | No long-running restart unless explicitly approved. |
| `railway-migration-*.sql` | Backend owner | Must be idempotent and non-destructive. |
| `ops/agent-task-ledger.jsonl` | Append-only by all; `MASTER-07` validates | Append only; do not rewrite history. |
| `ops/agent-changelog.md` | Append-only by all; `MASTER-07` finalizes | Append only; keep sections concise. |
| `TASKS.md` | `MASTER-07` final reconciliation | Other workstreams add concise task rows only. |
| `SYSTEM-STATE.md` | `MASTER-07` or architecture owner | Update only for architecture/workflow/source-of-truth changes. |
| `MEMORY.md` | Source-of-truth maintainer | Promote only durable decisions, requirements, and preferences. |
| `tasks-pending/2026-06-16-*.md` | Owning workstream; `MASTER-07` for incomplete status | Keep as internal handoffs; do not expose as public planned-brief sections. |
| `ops/proofs/2026-06-16-ramble-router-parallel-closeout/**` | `MASTER-07` | Add proof files in the owning workstream folder. |

## Shared Guardrails

- Do not expose secrets, cookies, API keys, raw access codes, raw passwords, or keyholder contents.
- External sends, publishes, billing, account grants, Google writes, Zoom/Vimeo writes, and device actions remain disabled unless an explicit approval gate and current operator approval exist.
- SDDraftler, Menachem duplicate, and Eitan Golombo/Golambo issues require evidence before any data mutation.
