# One Time Classroom Rewards Scoreboard

Raw source: `RAW-20260708-004`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Status: Done, pushed, deployed, and live-smoked

## Scope

Build the first safe version of the One Time classroom scoreboard for the
parent/student member classroom. The board must show positive, reviewed reward
progress only.

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---:|---|
| REQ-20260708-016 | Add a member-visible rewards scoreboard to `/one-time-classroom`. | Done, deployed, live-smoked | `public/one-time-classroom.html`; live scoreboard smoke passed |
| REQ-20260708-017 | Score only approved classroom-visible events. | Done, deployed, live-smoked | `server.js`; live API readback shows positive approved scoreboard points only |
| REQ-20260708-018 | Keep private/unreviewed/negative/prize/payment/external-write behavior out. | Done, deployed, live-smoked | `server.js`; `ops/one-time-mishnah/forum-gamification-moderation-plan.md`; live smoke guardrails passed |
| REQ-20260708-019 | Verify mobile-safe classroom rendering and empty/populated states. | Done, deployed, live-smoked | focused tests; One Time shared review mobile/tablet/desktop live smoke |
| REQ-20260708-020 | Update protocol evidence, ledger, changelog, and Product Quality packet. | Done | this register; PQC packet; ledger/changelog terminal deployment entries |

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

## Deployment And Live Evidence

| Item | Result | Evidence |
|---|---|---|
| Commit/push | PASS | `8f3320a0 Add One Time classroom rewards scoreboard` pushed to `origin/master`. |
| Railway deploy | PASS | Deployment `d383bf5f-8b73-488e-9c73-d64547862773` for service `skillful-motivation` reached `SUCCESS` on commit `8f3320a0`. |
| Live app smoke | PASS | `npm run app:smoke` wrote `ops/live-smokes/2026-07-08T06-46-08-085Z-live-app-smoke.md`. |
| One Time responsive route smoke | PASS | `npm run app:smoke:one-time-shared-review` wrote `ops/live-smokes/2026-07-08T06-46-07-386Z-one-time-shared-review-live-smoke.md` and checked landing, provider, parent, student, classroom, email, and Operations routes at mobile, tablet, and desktop sizes. |
| Scoreboard live smoke | PASS | `ops/live-smokes/2026-07-08T06-46-07-674Z-one-time-classroom-rewards-scoreboard-live-smoke.md` passed `html_has_rewards_scoreboard`, `leaderboard_present`, `leaderboard_has_positive_points`, `leaderboard_has_reward_labels`, `reward_policy_positive_only`, and `no_private_events_in_payload`. |
| Guardrails | PASS | The scoreboard smoke performed no external send, payment, prize, coupon, credit, access grant, provider write, or unreviewed publication, and used the TEST One Time review classroom payload. |

## Remaining

- Broader reward admin tooling is separate work: reward ledger management,
  manual award review, notifications, prizes, coupons, discounts, payment
  credits, or access grants remain out of scope and require a separate
  approved packet.
