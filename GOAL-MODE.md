# BNA Goal Mode

Goal Mode means Codex executes a registered objective until every item has a
terminal status with proof or a precise blocker.

## Required Workflow

1. Read relevant standing goals before coding.
2. Identify affected goals in the plan or register.
3. Preserve raw input first and create/update the dated register.
4. Compile vague product-quality language into exact requirements before Codex
   edits product code. Use `docs/PRODUCT-QUALITY-COMPILER.md` and
   `ops/visual-quality-rubric.md` for UI/product work.
5. Split SUPER-RAMBLES into prompt packets before implementation. Use
   `docs/SUPER-RAMBLE-PACKET-SPLITTING.md` and `ops/prompt-packets/README.md`.
6. Assign stable IDs to goals, requirements, tasks, decisions, questions,
   memory, class notes, communications, contacts, accounting items, research,
   and watchdog findings.
7. Update action and route registries when adding UI actions or routes.
8. Run required watchdog checks for the touched surfaces.
9. Do not mark done if a relevant standing goal regressed.
10. If a task is too large, preserve every item as IDs and work through batches.
11. If blocked, create a precise blocked item instead of dropping the work.
12. App-visible/server-visible changes require deploy and live smoke unless
    deployment is explicitly blocked.

## Terminal Statuses

- Done
- Already satisfied
- Blocked
- Needs operator decision
- Failed
- Superseded
- Archived

## Definition Of Done

An item is done only when:

1. It has a stable ID.
2. Relevant files/routes/components/workflows were inspected.
3. Implementation matches the expected result.
4. Relevant standing goals still pass.
5. Watchdog checks ran or blockers are documented.
6. Evidence is written to the register, ledger, and changelog.
7. Final response names item IDs and status.

## Affected Standing Goals

Before implementation, list or record the standing goals that could be affected.
At minimum, UI work touches `GOAL-CORE-001` through `GOAL-CORE-005`; auth and
portal work touches `GOAL-CORE-006`; parser/intake work touches
`GOAL-CORE-007` through `GOAL-CORE-013`; provider work touches
`GOAL-CORE-014`; all work touches `GOAL-CORE-015`; vague quality language
touches `GOAL-CORE-016`; super-rambles touch `GOAL-CORE-017`.

## Product Quality Goal Mode

When the goal contains words such as `clean`, `sloppy`, `million-dollar app`,
`GHL-like`, `CRM`, `pipeline`, `community`, `configured`, `launch-ready`, or
`make it work`, do not start broad code edits from that phrase. First register
the raw source, compile exact requirements, identify screenshots and viewports,
define action/route registry impacts, separate provider setup packets, and set
deploy/live-smoke gates for app-visible work.

Ramble Protocol v3 adds a required router/DAG gate for broad product-quality
work. Before Codex implementation, create Ramble Router output, Product Quality
Compiler expansion, Packet DAG for super-rambles, `00-control-tower`, and
`01-current-state-visual-audit`. Implementation remains blocked until the
visual audit and Definition of Ready pass.

Product/UI implementation requires a passing Product Quality Compiler packet:

- `npm run pqc:validate path/to/packet.product-quality.json`
- `npm run watchdog:protocol-drift` before broad product-quality closeout

The packet must satisfy the Definition of Ready in
`docs/PRODUCT-QUALITY-COMPILER.md`; the completed work must satisfy the
Definition of Done there. Missing state matrix, screenshots/mobile proof,
view classes, out-of-scope, action states, browser-security policy, trace
fields, registry expectations, or deploy/live-smoke gates is a blocker, not
implementation permission.
