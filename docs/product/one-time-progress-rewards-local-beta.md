# One Time Progress And Rewards Local Beta

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Purpose

The local beta needs useful attendance, progress, milestone, achievement, and
reward-review state before live production data or external systems are
mutated. This contract uses local seed/test data only.

## Included State

- attendance sessions and exact attended minutes
- course lesson progress
- milestone status
- parent-safe achievement summaries
- neutral reward eligibility reviews

Rewards do not auto-award. Eligible rewards become review items requiring
operator or workspace-policy approval.

## Privacy Views

Student view:

- own record only
- no sibling or classmate rows
- no guardian contact data
- no private admin notes

Parent view:

- linked students only
- parent-safe summaries
- no unrelated students
- no provider/admin private notes

Provider/admin view:

- workspace students and aggregate progress
- no guardian contact export
- no private family notes

Public view:

- aggregate only
- no individual student rows
- no leaderboard

## No-Write Rule

All local builders return `preview_only: true`,
`external_write_performed: false`, and `production_mutation_performed: false`.
No attendance write, progress write, reward award, badge award, parent/student
notification, prize/coupon/credit, leaderboard, payment credit, or external
send is performed by the local snapshot.

Code contract: `src/platform/progress/one-time-progress.js`.
