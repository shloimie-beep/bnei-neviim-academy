# assistant-ramble-usage Blockers

Known external blockers:

- Optional persisted hosted-provider chat E2E requires `BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL` to point to a local/test Postgres database. The audit intentionally ignores production `DATABASE_URL`.
- Live hosted-provider proof requires approved model credentials and explicit live-smoke permission. Current local audit showed `openai:missing` and `kimi:missing` with exact disabled reasons.
- Real Telegram/email/WhatsApp sends are not approved. Runtime proof uses dry-run/no-send checks only.
- Production migration, deploy, and live smoke are outside this lane scope and require release approval.

No blocker prevents merging the additive code and lane evidence into the integration branch.
