# Agent F Telegram/GHL Publish Workflow Verification

Date: 2026-06-06
Worker: Agent F
Scope: read-only code inspection plus non-posting diagnostics. No live social posts were created.

## Verdict

The Telegram/GHL publish workflow is implemented for `/accounts`, text
`publish draft`, text `publish now`, and media-caption publish commands. It is
not fully closed as live-smoked because the final proof would create a real GHL
Social Planner draft/post record. `publish now` was intentionally not tested.

## Implemented

- `/accounts` is wired in `scripts/telegram-kimi-bridge.mjs:5913` and formats
  aliases from `buildAccountAliases()` in `scripts/telegram-kimi-bridge.mjs:1202`.
- Publish command parsing accepts `publish draft <targets> | <caption>`,
  `publish now <targets> | <caption>`, and `post ...` aliases in
  `scripts/telegram-kimi-bridge.mjs:595`.
- Text-only publish commands resolve aliases and call GHL Social Planner through
  `createSocialPostsForTargets()` in `scripts/telegram-kimi-bridge.mjs:6024`.
- Media captions use the same publish parser in
  `scripts/telegram-kimi-bridge.mjs:6162`; when a publish caption is present,
  the bridge uploads the Telegram asset to GHL media storage, resolves target
  accounts, then creates draft/published Social Planner records.
- Alias generation in `scripts/ghl-ops.mjs:127` creates stable aliases from
  platform, account name, locality or origin suffix. Current read-only local
  GHL check returned:
  - `facebook:bnei-neviim-academy:3162`
  - `google:webcraft-media:7773`
  - `google:webcraft-media:bet-shemesh`
  - `youtube:bnei-neviim-academy:-U-g`
- Ambiguity handling is present in `scripts/telegram-kimi-bridge.mjs:3555`.
  Platform-only targeting works only when exactly one account matches. Current
  state means `facebook` resolves, while `google` is ambiguous and should force
  the operator to use a full `/accounts` alias.
- GHL Social Planner helpers exist in `scripts/ghl-ops.mjs`: account listing,
  media upload, post creation, deletion helper, and blog listing.
- App-side Content Facebook draft creation is separate but also guarded:
  `server.js:4041` refuses no Facebook accounts, stale default IDs, and
  ambiguous multi-Facebook setups; `server.js:4106` creates GHL drafts only.
- GHL diagnostics endpoint exists at `server.js:8805`. It checks account list,
  users, posts read, and reports the required `socialplanner/post.write` scope.

## Diagnostics Run

- Local read-only GHL module check: passed at `2026-06-06T18:47:09Z`.
  It found 4 social accounts: 1 Facebook, 2 Google, 1 YouTube. GHL blogs count
  was 0.
- Live `/api/bna/ghl-social/diagnostics` check: first read returned GHL 401
  `Command timed out` at `2026-06-06T18:47:32Z`, with the app hint to check the
  Social Planner token/write scope.
- Immediate repeat of the same live diagnostics: passed at
  `2026-06-06T18:48:09Z` with 1 Facebook account, 3 other accounts, and
  `posts_read_check.ok: true`.
- Existing live smoke artifacts also show mixed but mostly green GHL diagnostics,
  including green runs at `ops/live-smokes/2026-06-06T18-37-59-912Z-live-app-smoke.json`
  and `ops/live-smokes/2026-06-06T18-39-30-826Z-live-app-smoke.json`.

## Not Live-Smoked

- I did not send a Telegram `publish draft` command because it would create a
  real GHL Social Planner draft record.
- I did not send a Telegram media caption publish command because it would
  upload media to GHL and create a real draft/post record if targets resolve.
- I did not run `publish now`; that would attempt a public live post.
- I did not call `deleteSocialPost()` because no smoke draft was created in this
  verification pass.

## Exact Next Safe Smoke

To close the remaining TASKS item without publishing publicly:

1. In Telegram, send `/accounts` and confirm the Facebook alias is still
   `facebook:bnei-neviim-academy:3162`.
2. Upload a harmless non-student test image or tiny test video to the Telegram
   bot with this caption:
   `publish draft facebook:bnei-neviim-academy:3162 | Internal BNA smoke test draft. Do not publish. Delete after verification.`
3. Confirm Telegram replies with `draft` plus a GHL post id.
4. Confirm the draft appears in GHL Social Planner and is not public.
5. Delete the draft immediately in GHL, or run a one-off guarded deletion using
   `deleteSocialPost(postId)` from `scripts/ghl-ops.mjs`.
6. Record the draft id, deletion result, and Telegram reply in a follow-up
   `ops/system-audits/` report.

Do not use `publish now` until the operator explicitly approves the exact public
account, copy, and media.
