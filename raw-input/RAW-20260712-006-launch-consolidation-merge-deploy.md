# RAW-20260712-006 - Launch consolidation, branch merge, and deploy

Source: Codex chat
Captured at: 2026-07-12T20:45:00+03:00
Privacy classification: internal_launch_coordination
Parse status: registered
Requirement register: `tasks-pending/2026-07-12-launch-consolidation-merge-deploy.md`

## Raw wording

Yeah. I need you to catch up and merge all the branches and like all the stuff that aren't deployed yet, to like finally deploy them in one big launch. So go through every single thing in the repo that's like in the middle or on a branch, and merge everything to master. Make sure everything's clean, one at a time, debug everything, launch everything, so it should all be spick and span. All the stuff that we've been doing today. That's your goal. Keep going till everything is stabilized, cleaned up, deployed, and all the branches are on master, and everything is organized, professional, and epic.

## Parsed intent

- Goal-mode execution request.
- Stabilize today's local and branch work.
- Merge eligible undeployed branch work into `master`.
- Keep work clean and sequential, with debugging and verification before launch.
- Deploy and live-smoke app-visible/server-visible changes.
- Do not call stale, unsafe, unverified, or external-account-blocked work done.

## Initial inspected state

- Active goal created in Codex for repository stabilization, merge, deploy, and launch closeout.
- Current branch at intake: `master`.
- Local `master` is behind `origin/master` by 54 commits.
- Open GitHub PRs: none.
- Active execution run before launch register: `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`.
- Current active run status: 11 done, 1 blocked (`REQ-20260712-112`) because release gate is blocked by mixed dirty worktree, unpushed/non-release HEAD, and Railway/Drive readback readiness gaps.
- Local dirty worktree contains today's One Time CRM/portal/landing/performance work plus Telegram sidekick/dropoff artifacts and generated evidence.

## Guardrails

- No blind merge of stale/historical branches.
- No email/WhatsApp/Telegram external send, payment/access grant, DNS/provider-account mutation, credential mutation, production hard delete, upload/publish, or external CRM/GHL write without exact approval and proof.
- App-visible/server-visible done status requires commit, push, deploy, and live-smoke proof, or an exact blocker.
