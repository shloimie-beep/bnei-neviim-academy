# Agent Mode Prompt Reconciliation - 2026-07-07

Raw ID: `RAW-20260707-004`

Related prior raw IDs: `RAW-20260706-911`, `RAW-20260706-951`,
`RAW-20260707-003`

## Verdict

Yesterday's One Time Agent Mode prompt series was created and queued, but the
actual downstream Agent Mode audit reports have not landed yet.

| Item | Status | Evidence | Notes |
|---|---|---|---|
| `onetime-agent-prompt-series-20260706-911` | `done_verified` for prompt packet pickup/repair | `ops/chatgpt-ramble-dropoff/incoming/onetime-agent-prompt-series-20260706-911/status.json`; `ops/chatgpt-ramble-dropoff/pickups/2026-07-07T09-15-13-onetime-agent-prompt-series-audit.md` | Fleet consumed job `#397` / task `#1945`, rebuilt `PROMPTS.md` from canonical prompt files, and restored missing Prompt 05 protocol coverage. |
| Expected child packet `onetime-ui-audit-20260706-911-control-tower` | Not present | No matching directory under `ops/chatgpt-ramble-dropoff/incoming/` | Prompt 01 still needs to be run by a GitHub-connected Agent Mode session. |
| Expected child packet `onetime-ui-audit-20260706-911-public-funnel` | Not present | No matching directory under `ops/chatgpt-ramble-dropoff/incoming/` | Prompt 02 still needs to be run after control tower or manually in parallel. |
| Expected child packet `onetime-ui-audit-20260706-911-rabbi-operations` | Not present | No matching directory under `ops/chatgpt-ramble-dropoff/incoming/` | Prompt 03 likely needs browser takeover for login. |
| Expected child packet `onetime-ui-audit-20260706-911-portals-classroom` | Not present | No matching directory under `ops/chatgpt-ramble-dropoff/incoming/` | Prompt 04 likely needs browser takeover for role routes. |
| Expected child packet `onetime-ui-audit-20260706-911-cross-system-synthesis` | Not present | No matching directory under `ops/chatgpt-ramble-dropoff/incoming/` | Prompt 05 should run only after at least two child audit reports exist. |
| Earlier attached Agent Mode run | Failed to drop off | `tasks-pending/2026-07-06-chatgpt-agent-dropoff-collector-and-fleet-status.md` | It ended with `CANNOT_WRITE_GITHUB` because that ChatGPT session did not have a GitHub connector enabled. |

## Agent Fleet Readback

- `npm run agent:fleet:status` after the run reports supervisor not running and
  `job #397` no longer appears in the next claimable jobs.
- Claimable observable jobs dropped from `26` to `25`.
- The wrapper report for task `#1945` is `Outcome: FAIL` only because broad
  `npm test` failed on existing action-registry/hash freshness assertions.
- The Codex task body itself reported `STATUS: done` and the prompt packet is
  terminal `done_verified`.

Wrapper evidence:
`ops/agent-fleet-runs/2026-07-07T06-21-46-153Z-task-1945.md`

Focused packet evidence:
`ops/chatgpt-ramble-dropoff/pickups/2026-07-07T09-15-13-onetime-agent-prompt-series-audit.md`

## Current-State UI Audit Readback

Codex also ran the required current-state visual audit for
`REQ-20260707-032`.

Evidence:
`ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md`

Key facts:

- 35 screenshots captured across 7 routes and 5 viewports.
- Operations login was available.
- Admin-on-provider session start was available.
- Provider-admin mailbox rendered as Rabbi scope on some viewports but fell
  back to generic BNA provider login on other viewports.
- Student/member routes currently show public/login states; there is not yet a
  clear Super Admin view-as-student navigation path from Shloimie's login.

## Next Prompt Packet

Created:
`ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/`

Purpose:

- Audit top-level categories, subcategories, filters, toolbars, and button
  consistency across One Time and BNA backend surfaces.
- Audit "log in once as Shloimie, view as Rabbi/provider/student/member" access
  and navigation.
- Produce repo-visible Agent Mode dropoff packets that Codex can audit before
  UI implementation.

## Guardrails

- Do not broadly start the full agent fleet while stale queued jobs remain.
- Run only explicit prompt/audit packets or use targeted manual pickup.
- Do not implement UI from "million-dollar app" language without Product
  Quality Compiler packets.
- Do not use shared Rabbi/student passwords for view-as access.
- No external sends, payment/access grants, DNS/provider mutations, Drive
  writes, credential changes, or production-data mutation.

## Verification Closeout

- PASS `node --check scripts/audit-onetime-role-ui-current-state.mjs`.
- PASS JSON parse for the new prompt-series manifest, current-state UI audit
  report, prior packet `status.json`, and packet pickup report JSON.
- PASS `ops/agent-task-ledger.jsonl` JSONL parse.
- PASS `npm run agent:fleet:status`: supervisor not running; job `#397` is no
  longer listed in the next claimable jobs.
- PASS `npm run watchdog:protocol-drift` after the new synthesis prompt was
  patched to include the required Product Quality Compiler/current-state visual
  audit/browser security/context budget/trace/state-matrix markers.
- PASS `npm run secrets:audit`.
- Known blocker: the fleet wrapper's broad `npm test` run failed on existing
  action-registry/hash freshness assertions and a Launch / Checkout expectation
  mismatch. The prompt packet is `done_verified`, but the full wrapper is not
  green.
