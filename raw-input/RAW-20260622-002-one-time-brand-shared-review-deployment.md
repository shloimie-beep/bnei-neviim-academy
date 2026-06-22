# RAW-20260622-002 - One Time Brand Shared Review Deployment

Captured: 2026-06-22T00:00:00+03:00
Source type: Codex chat goal prompt
Workspace: `rabbi_sheller_provider`
Project: `one_time_mishnah_class`

Goal: turn the existing shared One Time review routes into a polished branded
experience using supplied legacy OneTimeOneTime assets, then deploy the shared
review build so Shloimie can inspect it and give the final UI/workflow
correction ramble.

Key guardrails:

- Continue PR #5 from current head.
- Do not provision Railway projects, services, databases, or DNS.
- Do not touch Railway topology or merge PR #5.
- Preserve existing shared review routes and fixtures.
- Do not create a second portal framework.
- Do not commit raw giant source videos.
- Do not expose secrets or invent testimonials, press claims, student quotes,
  Torah sources, or unapproved child imagery.
- Safe deployment to the existing shared BNA app is allowed only from a clean
  commit/worktree after regression checks pass.

Required work:

- Inspect legacy OneTimeOneTime assets in the user Downloads folder.
- Find the promo video, old Vimeo player/video IDs, logo, hero image, and
  legacy publication/platform logo assets.
- Create asset inventory, machine-readable manifest, and hero-video trace.
- Use small approved assets in the existing shared One Time landing and review
  routes.
- Preserve and extend `/provider.html?review=one-time`,
  `/parent.html?review=one-time`, `/student.html?review=one-time`,
  `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`,
  `/one-time-email-review.html`, and `/api/one-time-review`.
- Add focused tests and run local verification.
- Commit, push PR #5 branch, deploy shared app-visible changes when safe, run
  focused live smoke, and update the operator review packet/evidence.
