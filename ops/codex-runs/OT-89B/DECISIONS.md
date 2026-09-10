# OT-89B Decisions

- Use isolated clone `C:\Users\User\BNA-ot89b-support-consumer-local-20260716-0909` because the preferred directory was occupied by an interrupted GitHub clone after fetch-pack failure.
- Base branch on remote-verified origin/master SHA `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`.
- Keep real ingress, Telegram, attachment fetch, diagnostics, and outbound status adapters disabled by default.
- Install dependencies locally in the isolated worktree with `npm ci --no-audit --no-fund` after the first full-suite run proved `node_modules` was missing. Do not stage `node_modules`.
- Preserve the frozen OT-89A contract exactly in run evidence and tests; use synthetic producer events and mock adapters only.
- Implement BNA as the ticket owner with event/history/status/outbox/decision-token storage, while One Time receives only the contract status DTO.
- Keep the `server.js` hook intentionally small and before global JSON parsing so raw-body HMAC verification can run.
- Preserve Drive-backed raw-intake channel hints when normalizing raw intake source channels; this repairs an existing guard-test drift encountered during full-suite validation.
- Open a draft PR, not a ready PR, because the full frozen-base suite still has unrelated UI/source-smoke failures.
