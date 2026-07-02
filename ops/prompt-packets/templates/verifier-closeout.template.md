# Verifier Closeout Packet Template

You are Stage 4 / Stage 5 / Stage 6 of parent raw input `RAW-YYYYMMDD-###`.
Do not solve the whole parent ramble. Verify only the completed packet set and
record remaining blockers.

## Packet Identity

| Field | Value |
|---|---|
| Parent raw ID | RAW-YYYYMMDD-### |
| Packet ID | PKT-YYYYMMDD-### |
| Packet role | VERIFIER_PACKET / DEPLOY_PACKET |
| Depends on | All scoped implementation packets |
| Scope | Independent verification, deploy/live smoke where app-visible, final source-of-truth update. |
| Out-of-scope | New feature implementation and provider writes not authorized by child packets. |

## Required Verification

- compare before/after screenshots;
- verify state matrix;
- inspect action registry;
- inspect route registry;
- run focused tests;
- run accessibility/ARIA checks or record blocker;
- run protocol validator;
- run drift watchdog;
- deploy and live-smoke app-visible changes, or record exact blocker;
- update evidence paths, ledger, changelog, memory, trace, and next-session.

## Terminal Condition

No `looks good` closeout. No `tests pass` as UI proof without screenshots. No
app-visible Done without deploy/live smoke or an explicit deploy blocker.
