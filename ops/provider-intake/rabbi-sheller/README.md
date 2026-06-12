# Rabbi Sheller Provider Intake

Purpose: collect and audit Rabbi Sheller's One Time / Mishnah class app,
materials, access model, and workflow without merging it into BNA school data
before review.

Rules:

- `shloimie-beep/bnei-neviim-academy` remains the main BNA repo.
- `sdratler/OneTimeOneTime` may be used as a private audit/import repo if Rabbi
  app code is intentionally shared there.
- Do not push BNA into `sdratler/OneTimeOneTime`.
- Do not merge Rabbi app code into BNA until the audit is complete.
- Do not store raw passwords, API keys, payment secrets, OAuth tokens, or
  unredacted credential screenshots in Git.

Recommended flow:

1. Collect safe access through invites or one-time secret links.
2. Back up/export the current Rabbi app if access allows it.
3. Audit login, member access, payments, video, comments, moderation, and data.
4. Decide whether BNA should integrate, embed, sync, copy design patterns, or
   leave the app external.
5. Implement only the approved integration path.
