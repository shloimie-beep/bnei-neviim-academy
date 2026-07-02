# Baseline - One Time Clean Integration From PR #62

Baseline branch: `origin/master`
Clean integration branch: `codex/one-time-clean-integration-20260702`

## Starting State

- PR #62 exists but is draft/conflict-dirty and must not be force-merged.
- The separate One Time Railway/database/domain/provider setup is not ready.
- Existing BNA Railway production was already deployed and live-smoked in the prior closeout.
- The current packet is protocol/setup/readback work and does not implement Rabbi UI redesign.

## Decisions Preserved

- Same GitHub repo/codebase.
- Separate One Time Railway project/service/database preferred.
- Temporary launch domain is `join.onetimeonetime.com`.
- Apex/root `onetimeonetime.com` remains untouched.
- One Time sender/reply-to is `info@onetimeonetime.com`.
- `sdratler@gmail.com` is authorized for safe seed/test email and internal failure alerts after final live links exist.
- No GHL runtime.
