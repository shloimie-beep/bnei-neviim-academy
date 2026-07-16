# BNA-OPS-01 Resume

Branch: `codex/bna-ops01-school-support-stabilization`

Workspace: `C:/Users/User/.codex-worktrees/bna-ops-01-local-20260716T192700Z`

Exact base: `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`

Source heads:

- School route source: `d23cbc2f321b55ea073b0bb0ee5c887bf7be50a7`
- OT-89B consumer source: `8861e9b0e9bf77ca9b74112cbb2d04b6fa2bfd88`

Current status:

- Original prompt is preserved at `ops/codex-runs/BNA-OPS-01/ORIGINAL-PROMPT.md`.
- Run state files were initialized before product edits.
- Both source heads are integrated on the branch.
- Alert outbox delivery now uses bounded leased claims, retry/backoff, sent/failed/dead-letter states, safe errors, and real Telegram delivery remains gated by `OT89_BNA_BOT_SOLE_OWNER_VERIFIED`.
- Local/synthetic verification passed.
- The existing checkout at `C:/Users/User/BNA v2.0` is dirty and must remain untouched for this lane.

Next safe steps:

1. Commit and push this branch.
2. Open a draft PR.
3. Stop before live Telegram canary unless protected staging/bot ownership proof exists.

Do not run:

- Production deployment.
- Production customer contact.
- Real Telegram send.
- Real email/WhatsApp/SMS send.
- Production data mutation outside synthetic/no-write tests.
- Any staging or bot-token canary without explicit protected configuration proof.
