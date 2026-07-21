# 2026-07-21 - One Time Communications Architecture v1

- Raw: `RAW-20260721-002`
- Raw path:
  `raw-input/RAW-20260721-002-one-time-communications-architecture-v1.md`
- Raw SHA-256:
  `bb4e8cb591248ba404414d13d7b816c3dfdd6ef21566029bd9c4307c13d4aa48`
- Spec: `SPEC-20260721-002`
- Spec fingerprint:
  `6f2d3038434fa41bb8d756544e74a05481ffa3e398cef0e21f483bc0677477b9`
- Decision: `DEC-20260721-002`
- Branch: `codex/one-time-communications-architecture-v1`
- Base: `origin/master` at
  `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`

## Intake And Collision Evidence

- The urgent platform/Agent Action lane worktree was clean.
- Draft PR #139 reported merge state `CLEAN` at head
  `9e7efb3179c63bbb52571a9fc811773a24bccb7a`.
- This lane uses a separate clean worktree based on current `origin/master` and
  does not import PR #139's runtime/UI changes.
- The main safety checkout remains dirty and is not used for implementation or
  staging.
- No ready ChatGPT drop-off packet overlaps this lane.

## Requirement Register

| ID | Requirement | Status | Acceptance / evidence |
| --- | --- | --- | --- |
| `REQ-20260721-020` | Verify urgent lane stability and create the exact branch from current master. | Done | Clean urgent worktree, PR #139 `CLEAN`, isolated branch at recorded base. |
| `REQ-20260721-021` | Preserve raw direction and pass the Intent Preservation Gate. | Done | RAW, SPEC, generated receipt/prompt, manifest/status; 6/6 hard signals and 11/11 actionable spans covered. |
| `REQ-20260721-022` | Record the One Time-only GHL decision and preserve BNA School architecture in durable memory/ADR. | Done | `MEMORY.md`, dated memory, topic files, and ADR. |
| `REQ-20260721-023` | Update the workspace role map with platform/connector, human, and record routing. | Done | `docs/architecture/workspace-community-provider-role-map.md`. |
| `REQ-20260721-024` | Define the Super Admin external-product connector contract and One Time instance. | Done | Connector schema and instance under `docs/architecture/contracts/`. |
| `REQ-20260721-025` | Define Agent Action job/result schemas and no-mutation examples. | Done | Job/result schemas and examples under `docs/architecture/contracts/`. |
| `REQ-20260721-026` | Add and run focused assertions plus required protocol/safety checks. | Done | Focused test 7/7; intent coverage 6/6 and 11/11; PQC fixtures 13/13; evals 8/8; drift 0; run validation, secret audit, and diff check passed. |
| `REQ-20260721-027` | Append ledger/changelog and final evidence. | Done | Ledger/changelog plus `ops/codex-runs/2026-07-21-one-time-communications-architecture-v1/TEST-RESULTS.md`. |
| `REQ-20260721-028` | Commit, push, and open a draft PR against master. | In progress | Validation complete; scoped publish pending. |

## Guardrails

- Documentation/contracts/tests only; no product runtime or UI edits.
- No email or Telegram send.
- No GHL mutation or provider write.
- No DNS, credential, database, account, access, payment, or production change.
- Do not change BNA School's first-party CRM architecture.
- Do not route live class questions, business conversations, and technical
  tickets into one BNA queue.
