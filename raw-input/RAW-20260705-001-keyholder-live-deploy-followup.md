# RAW-20260705-001 - Keyholder live deploy follow-up

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-001 |
| Source | codex_chat |
| Captured at | 2026-07-05T13:35:05+03:00 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-04-ship-pr87-onetime-ui-live-cleanup.md |

## Raw text

> Can you just double check the BNA key holder? Because the OpenAI API key, the second one, you know, there's one that says two on it, that's the right one. The Vimeo access token should be there. And the Stripe secret key should be there. In terms of the Telegram bot, let's skip that for now. But anyways, why is that necessary to deploy everything and push everything live, you know? So, can you just check that and use those keys and, you know, and push everything live? Even if the keys aren't there, you should be able to make it live. And I'll just give them to you later.

## Parsed items

- `REQ-20260705-001`: Redacted-check the BNA keyholder and Railway production variables for OpenAI v2, Vimeo, Stripe, Telegram, and deploy-readiness state.
- `REQ-20260705-002`: Fix release-gate false negatives for keyholder aliases and make optional provider/readback deferral explicit for a UI deploy.
- `REQ-20260705-003`: Use the approved Stripe keyholder secret to set the exact Railway runtime variables without printing or committing values.
- `REQ-20260705-004`: Push/merge/deploy PR #87 if the corrected release gate and live smoke allow it; otherwise record the exact blocker.
- `DEC-20260705-001`: Vimeo access token and Rabbi Telegram worker verification may be deferred for this UI deploy; do not claim those integrations are complete.
