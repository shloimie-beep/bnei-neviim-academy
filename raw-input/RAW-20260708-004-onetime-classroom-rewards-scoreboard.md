# RAW-20260708-004 - One Time Classroom Rewards Scoreboard

Source channel: `codex_chat`

Captured at: 2026-07-08T09:34:00+03:00

Parse status: registered

Requirement register: `tasks-pending/2026-07-08-onetime-classroom-rewards-scoreboard.md`

Product Quality packet: `ops/prompt-packets/2026-07-08-onetime-classroom-rewards-scoreboard/00-onetime-classroom-rewards-scoreboard.product-quality.json`

## Raw Operator Wording

> We also have to have a section I don't know I see you made like a classroom section you know the portal login for the parents and for the students so in the classroom section we need to have some sort of like scoreboard where the people with like the rewards you know we have like a bunch of things that were rewarding one of them is like you know the best questions or something like that whatever the questions all the different rewards that we have all the different ratings that we have so far like this guy got his question answered like we want to have like a live scoreboard basically of the people that are asking the question so anyone who gets like a question that is published and like made public for everyone so that should be like you know viewable anyone who you know shows up to the review whatever the rewards that we have we should have it saved in the system but there should be like a section for everyone to see like the the scoreboard of you know where everyone's holding

## Parsed Requirements

- `REQ-20260708-016`: Add a member-visible One Time classroom rewards scoreboard.
- `REQ-20260708-017`: Score only approved classroom-visible events: published/approved questions, approved answers, Rabbi-featured items, and assignment/review participation.
- `REQ-20260708-018`: Keep raw private replies, held responses, rejected messages, unreviewed student text, negative points, prizes, coupons, discounts, access grants, and external notifications out of the scoreboard.
- `REQ-20260708-019`: Render the scoreboard in the parent/student classroom route with mobile-safe layout and clear empty state.
- `REQ-20260708-020`: Update the moderation/gamification plan, tests, evidence, ledger, and changelog so future agents treat this approved-only scoreboard as allowed.

## Privacy Notes

This request approves a member-visible classroom scoreboard only for reviewed,
positive classroom participation. It does not approve an anonymous public
leaderboard, unreviewed student text, public shame, negative points, prizes,
coupons, payment credits, access grants, or external provider writes.
