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
