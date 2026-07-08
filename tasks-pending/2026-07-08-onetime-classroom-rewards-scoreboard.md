# One Time Classroom Rewards Scoreboard

Raw source: `RAW-20260708-004`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Status: local verified, pending commit/push/deploy/live smoke

## Scope

Build the first safe version of the One Time classroom scoreboard for the
parent/student member classroom. The board must show positive, reviewed reward
progress only.

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---:|---|
| REQ-20260708-016 | Add a member-visible rewards scoreboard to `/one-time-classroom`. | Done locally | `public/one-time-classroom.html` |
| REQ-20260708-017 | Score only approved classroom-visible events. | Done locally | `server.js` |
| REQ-20260708-018 | Keep private/unreviewed/negative/prize/payment/external-write behavior out. | Done locally | `server.js`; `ops/one-time-mishnah/forum-gamification-moderation-plan.md` |
| REQ-20260708-019 | Verify mobile-safe classroom rendering and empty/populated states. | Done locally, pending live smoke | focused tests; local One Time UI QA harness |
| REQ-20260708-020 | Update protocol evidence, ledger, changelog, and Product Quality packet. | Done locally | this register; PQC packet; ledger/changelog |

## Compiled Product Spec

- Surface: One Time parent/student classroom.
- Routes: `/one-time-classroom`, `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`, `/api/one-time-classroom`.
- Visible data: rank, participant display label, positive point total, approved question count, approved answer count, Rabbi-featured count, review participation count, reward labels.
- Scoring formula: `approved_question = 5`, `approved_response = 3`, `rabbi_featured = 8`, `assignment_participation = 2`.
- Empty state: “Approved rewards will appear after Rabbi/admin review.”
- Forbidden content: raw private replies, held responses, rejected messages, unreviewed text, contact info, negative points, discipline labels, prizes, coupons, discounts, payment credits, access grants, external notifications, admin-only notes.
- Privacy rule: scoreboard is member/classroom-visible, not anonymous public marketing.
- Done gate: code implemented, tests pass, Product Quality Compiler validates, protocol drift watchdog passes, commit/push/deploy/live smoke or explicit deploy blocker recorded.

## Verification Plan

- `node --check server.js`
- `node --test tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-gamification-badge-audit.test.js tests/one-time-forum-gamification-plan.test.js tests/one-time-rabbi-ui-final-local-smoke.test.js`
- `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-classroom-rewards-scoreboard/00-onetime-classroom-rewards-scoreboard.product-quality.json`
- `npm run watchdog:protocol-drift`

## Remaining

- Commit and push the scoped release.
- Confirm Railway deployment reaches `SUCCESS`.
- Run live app and One Time classroom/shared-review smoke before marking Done.
