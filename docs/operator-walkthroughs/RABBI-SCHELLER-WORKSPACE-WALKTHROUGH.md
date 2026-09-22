# Rabbi Scheller Workspace Walkthrough

Purpose: keep Rabbi Elie Scheller's One Time workspace scoped and separate
from unrelated BNA/private/provider data.

1. Open `/integration-setup.html#telegram-rabbi-worker`.
2. Confirm the Rabbi worker card names the Rabbi-specific token and chat ID
   variables.
3. Open Operations at `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class`.
4. Confirm the workspace/project shown is Rabbi Scheller / One Time Mishnah
   Class.
5. Use the setup center to inspect Zoom, Vimeo, Stripe, Google Drive, Resend,
   and Telegram Rabbi worker cards.
6. Store Rabbi-specific values only in the approved secret store or Railway
   worker variables.
7. Do not reuse the public academy Telegram bot token as the Rabbi worker
   unless the owner deliberately approves that temporary shortcut.
8. Run only read-only or preview validations until the Rabbi/account owner
   approves live meeting creation, uploads, sends, or billing actions.
9. For every live action, record the actor, approval phrase, expected effect,
   rollback path, and live smoke evidence.

Success means the Rabbi workspace has exact setup instructions, but no action
can accidentally read or mutate unrelated BNA/private/provider records.
