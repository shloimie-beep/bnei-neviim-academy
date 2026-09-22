# RAW-20260706-980 - Local Checkout Archive And Clean Reset

Source: codex_chat
Captured: 2026-07-06
Parse status: registered
Requirement register: `tasks-pending/2026-07-06-local-checkout-archive-clean-reset.md`

## Raw intake

> Okay, archive, clean, delete, publish, push, do all of those things. Pretend right now that I have a job interview with a multimillion dollar programming company, and they want to look at my GitHub repo to check out my app and determine whether I get billions of dollars of funding. That's how clean I need you to make everything and how organized it is. So do that.

## Initial interpretation

The operator approved a full cleanup of the dirty local `C:\Users\User\BNA v2.0`
checkout after the previous investigation found stale local leftovers from
older Codex sessions. The requested result is:

- archive local dirty state first;
- remove stale local leftovers from the working checkout;
- reset the checkout to clean `origin/master`;
- publish a repo-visible closeout record;
- do not commit the local archive contents, raw secret-adjacent diagnostics, or
  superseded stale raw/task ids.

## Safety boundaries

- Archive before destructive cleanup.
- Keep the archive outside the repo.
- Do not use the stale dirty checkout as a release source.
- Do not commit local keyholder diagnostics, generated command junk, or old
  superseded raw IDs.
- Do not perform external sends, payments, access changes, DNS changes, Drive
  writes, provider-account mutations, or secret writes.

## Execution closeout

- Dirty checkout archive:
  `C:\Users\User\BNA-local-archives\2026-07-06-bna-v2-dirty-checkout-before-reset`.
- Stale worktree archive:
  `C:\Users\User\BNA-local-archives\2026-07-06-bna-stale-worktrees-before-remove`.
- Published closeout PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/124`.
- Final local state: one registered worktree, one local branch, clean
  `master...origin/master`.
- Live deployment readback: Railway production deployment
  `51f37ce6-6a23-4622-abc2-c474184f1f4f` succeeded on commit
  `9beee40ae2c6f82cd6f6fea15661b4ac082f1543`.
