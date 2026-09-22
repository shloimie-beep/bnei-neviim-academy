# Ramble Intake - 2026-06-18 - website-ramble-correction-audit

This is the 2026-06-18 continuation/status register for the broad website
correction ramble that began on 2026-06-16. It exists to keep the dated ramble
protocol source-of-truth chain intact after watchdog audit
`ops/watchdog-audits/2026-06-18T09-07-watchdog-audit.md`.

The canonical full parsed register remains
`tasks-pending/2026-06-16-website-ramble-correction-audit.md`. The 2026-06-17
continuation and final closeout register remains
`tasks-pending/2026-06-17-website-ramble-correction-audit.md`.

This file is also a single source of truth for Shloimie's current website correction ramble continuation.
It carries forward `REQ-20260616-001`, which registered the full correction
ramble as raw intake before implementation.

## Raw intake

- RAW-20260616-001 (codex_chat/downloaded_prompt, 2026-06-16): full
  super-prompt preserved at `raw-input/RAW-20260616-001-bna-super-prompt.md`;
  source file was `C:\Users\User\Downloads\bna_super_prompt_2026_06_16.md`.
- RAW-20260616-003 (codex_chat, 2026-06-16): parent child-login reset wording
  correction; raw wording preserved in `memory/2026-06-16.md`.
- RAW-20260617-004 (content_recording / telegram_media content job 27):
  stale upload/class-recording reparse proof preserved in live
  `bna_raw_intake` and content job metadata.

No new website-correction raw ramble was received on 2026-06-18. This file is
a status/continuation marker, not a new implementation queue.

## Raw queue record

| Raw ID | Source | Parse status | Requirement register | Raw storage |
|---|---|---|---|---|
| RAW-20260616-001 | codex_chat / downloaded prompt | implemented and deployed-smoked with one external blocker | `tasks-pending/2026-06-16-website-ramble-correction-audit.md`; `tasks-pending/2026-06-17-website-ramble-correction-audit.md`; this continuation marker | `raw-input/RAW-20260616-001-bna-super-prompt.md` |
| RAW-20260616-003 | codex_chat | implemented and deployed-smoked | `tasks-pending/2026-06-16-website-ramble-correction-audit.md`; `tasks-pending/2026-06-17-website-ramble-correction-audit.md`; this continuation marker | `memory/2026-06-16.md` |
| RAW-20260617-004 | content_recording / telegram_media content job 27 | parsed with review items after stale-upload audit | `tasks-pending/2026-06-16-website-ramble-correction-audit.md`; `tasks-pending/2026-06-17-website-ramble-correction-audit.md`; this continuation marker | live `bna_raw_intake` row; content job 27 parse metadata |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no new 2026-06-18 website-correction goal |
| Active goal objective | Current active goal is the separate 2026-06-18 mobile Operations/workspace packet. |
| Goal tool used | not for this continuation marker |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Do not restart the closed 2026-06-16/17 website correction register. Use the canonical registers and final proof if future work references it. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | Already completed for the closed website-correction register except the explicit external payment-link blocker. |
| Next requirement IDs to work | None for this continuation marker. `REQ-20260616-030` remains externally blocked on payment-provider choice/credentials or links. |

## Parsed requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260618-WEB-001 | Preserve the daily website-correction source-of-truth chain for watchdog audit. | Watchdog finding: `tasks-pending/2026-06-18-website-ramble-correction-audit.md` is required. | 2026-06-18 continuation marker exists and points to canonical 2026-06-16/17 registers without reopening completed work. | Ramble protocol / watchdog | `npm run watchdog:audit` report `ops/watchdog-audits/2026-06-18T09-07-watchdog-audit.md`; file inspection. | Done |
| REQ-20260616-001 | Carry forward the raw-first website correction ramble registration. | 2026-06-17 continuation: "carries forward `REQ-20260616-001`". | The full website correction raw intake remains linked to the canonical registers and this continuation marker. | Raw intake / parser | `raw-input/RAW-20260616-001-bna-super-prompt.md`; 2026-06-16/17 registers. | Already satisfied |
| REQ-20260616-030 | Keep the only remaining website-correction blocker explicit. | Final closeout: live Rabbi payment links require explicit provider choice plus credentials or payment links. | Payment-link creation is not silently retried or marked done. | Rabbi / One Time payments | 2026-06-17 final closeout register; payment links still external/credential-gated. | Blocked |

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260618-WEB-001 | Add 2026-06-18 website correction continuation marker | Codex | Watchdog / source-of-truth hygiene | Watchdog recommended fix: create the website ramble correction register. | File exists with raw queue, parsed item, implementation map, final audit, and links to canonical registers. | Done |

## Decisions

| ID | Decision | Impact | Where stored | Status |
|---|---|---|---|---|
| DEC-20260618-WEB-001 | Do not reopen or redo the completed 2026-06-16/17 website correction register from this watchdog finding. | Prevents duplicate work and stale queue churn. | This file; 2026-06-17 final closeout register. | Done |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260618-WEB-001 | Which payment provider or explicit payment links should be used for Rabbi/One Time checkout? | Required before `REQ-20260616-030` can move from Blocked to Done. | Blocks only live payment-link enablement. | Open / external decision |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260618-WEB-001 | Daily website-correction continuation files should be status markers when no new raw website correction was received. | No | This is watchdog hygiene, not a new durable product rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260618-WEB-001 | `tasks-pending/2026-06-18-website-ramble-correction-audit.md` | Add compact continuation marker with raw queue, parsed requirements, implementation map, and final audit. | Rerun `npm run watchdog:audit` after adding this file. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260618-WEB-001 | Done | This continuation marker links the closed website-correction source chain and includes the watchdog-required phrase plus `REQ-20260616-001`. | `tasks-pending/2026-06-18-website-ramble-correction-audit.md` | Final `npm run watchdog:audit` passed with severity `ok` and finding_count `0`; report `ops/watchdog-audits/2026-06-18T09-11-watchdog-audit.md`. | None. |
| REQ-20260616-001 | Already satisfied | Raw prompt and canonical 2026-06-16/17 registers are present. | none | Prior deployed/live-smoked proof in the canonical registers. | None. |
| REQ-20260616-030 | Blocked | 2026-06-17 final closeout identifies payment-provider/link choice as external. | none | Prior Rabbi/One Time local/live proof kept checkout disabled and no live charge occurred. | Needs explicit Stripe or Green Invoice provider choice plus credentials or payment links. |

Allowed statuses:

- Raw
- Parsed
- Registered
- Pending
- Done
- Already satisfied
- Blocked
- Failed
- Needs operator decision
- Archived
