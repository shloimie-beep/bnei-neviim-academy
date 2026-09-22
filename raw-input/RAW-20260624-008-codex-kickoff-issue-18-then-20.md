# RAW-20260624-008 - Codex Kickoff Issue 18 Then 20

| Field | Value |
|---|---|
| Source channel | `codex_chat` |
| Source file | `C:\Users\User\Downloads\13-CODEX-KICKOFF-ISSUE-18-THEN-20.md` |
| Captured at | 2026-06-24T22:02:52+03:00 |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-24-issue-18-class-intake-readonly.md` |
| Execution run | `ops/execution-runs/2026-06-24-issue-18-class-intake-readonly/` |
| Content fingerprint | `sha256:1cfc2561d4c3fadd29831a2808c29bc8f4216b4f186f933488397be686bb28ee` |

## Raw Source

```text
# CODEX KICKOFF - ISSUE #18, THEN ISSUE #20, WITH AUTOMATIC CONTINUATION

Repository: `shloimie-beep/bnei-neviim-academy`

This is a Goal Mode execution kickoff.

The detailed durable work orders already exist on GitHub:

- Issue #18 - `REQ-20260624-028`, read-only class intake reconciliation:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18`
- Issue #20 - visual-quality gate, persistent agent browser, bot accuracy, and autonomous ramble execution:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/20`
- Canonical ramble-to-execution parent:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/7`

Do not ask me to paste the full issue bodies. Read them directly from GitHub and treat them as the authorized source packets.

Verified starting report to confirm:
- Expected current master: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`
- Expected deployed SHA: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`
- Expected Railway deployment: `f1f3158c-e9dc-44ab-8190-fddb369e666e`
- Clean-slate state reported: `LIVE VERIFIED - CLEAN SLATE READY FOR NEXT RAMBLE`
- Existing active pointer may still name the clean-slate acceptance run.
- Issue #18 is the only unresolved safety requirement from that closeout.
- Issue #20 must follow issue #18 automatically.

Required execution order:
1. Read the BNA start files, active run, and GitHub issues #7, #18, and #20 including comments.
2. Run the BNA run validation/status/source/evidence commands.
3. Preserve the single-active-run invariant.
4. Execute issue #18 first as read-only reconciliation. Do not apply class backfill.
5. Automatically continue issue #20 after issue #18 reaches a terminal verdict.
```

## Live GitHub Source Readback

- `gh issue view` was blocked by missing `read:project` scope, but `gh api repos/shloimie-beep/bnei-neviim-academy/issues/18` read the Issue #18 body on 2026-06-24.
- GitHub connector read Issue #18 comments. Latest relevant comment says to complete Issue #18 first, post terminal evidence, then continue Issue #20.
- `gh api` read Issue #20 body on 2026-06-24. Issue #20 is the next canonical goal after Issue #18 reaches a terminal read-only verdict.
- `gh api` read Issue #7 body on 2026-06-24. Issue #20 continues Issue #7's canonical ramble-to-execution bridge.

## Parsed Outcome

- Reuse existing requirement `REQ-20260624-028`.
- Create dedicated read-only execution run `2026-06-24-issue-18-class-intake-readonly`.
- Park the clean-slate acceptance run as predecessor so only the Issue #18 run is active.
- Terminal Issue #18 verdict must be exactly one of:
  - `NO CANDIDATES - nothing should be applied`
  - `NOT SAFE TO APPLY - reasons listed`
  - `READY FOR OWNER APPROVAL - dry run only, no production write performed`
- Production class backfill apply remains unauthorized in this source.
