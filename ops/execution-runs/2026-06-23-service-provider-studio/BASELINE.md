# Baseline

Baseline work starts in `REQ-20260623-002`.

Initial facts already verified:

- Dirty shared checkout: `C:\Users\User\BNA v2.0` on
  `integration/20260619-platform-finish`; it was not edited for this feature.
- Clean feature worktree:
  `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio`.
- Feature branch: `codex/service-provider-studio-20260623`.
- Actual default remote branch: `origin/master`.
- Feature base: `d37a53e608bb2c2760471c35618340cc4e9e8f18`.
- PR #5 is merged into `master`; current default also includes PR #10.
- `npm run bna:run:status` and `npm run bna:run:next` failed against the
  previous One Time run on the clean default branch because of stale branch
  metadata and missing historical live-smoke artifact paths. This is recorded
  as pre-existing run drift, not as a Studio implementation failure.

Required baseline artifact:

- `docs/product/service-provider-studio-baseline-2026-06-23.md`
