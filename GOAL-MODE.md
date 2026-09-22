# BNA Goal Mode

Goal Mode means Codex executes a registered objective until every item has a
terminal status with proof or a precise blocker.

## Required Workflow

1. Read relevant standing goals before coding.
2. Identify affected goals in the plan or register.
3. Preserve raw input first and create/update the dated register.
4. Assign stable IDs to goals, requirements, tasks, decisions, questions,
   memory, class notes, communications, contacts, accounting items, research,
   and watchdog findings.
5. Update action and route registries when adding UI actions or routes.
6. Run required watchdog checks for the touched surfaces.
7. Do not mark done if a relevant standing goal regressed.
8. If a task is too large, preserve every item as IDs and work through batches.
9. If blocked, create a precise blocked item instead of dropping the work.
10. App-visible/server-visible changes require deploy and live smoke unless
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
`GOAL-CORE-014`; all work touches `GOAL-CORE-015`.
