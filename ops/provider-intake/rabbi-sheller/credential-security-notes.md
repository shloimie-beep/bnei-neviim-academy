# Credential Security Notes

Secrets must not be pasted into chat, Git, Drive docs, reports, screenshots, Telegram messages, or QA logs.

Use these paths instead:

- Collaborator invitations when possible.
- Password-manager shared item.
- One-time secret link.
- Local `.secrets/` file only when Codex must run a local smoke, and never commit it.
- Railway environment variables only after Shloimie approves a live integration.

If a secret is accidentally exposed:

1. Do not print it again.
2. Record only the secret type and location.
3. Rotate or revoke it.
4. Re-run only the smoke needed to confirm the replacement works.
