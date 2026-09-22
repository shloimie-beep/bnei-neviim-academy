# OpenAI Smoke Release Follow-Up

Captured: 2026-06-11

## Why This Exists

The release branch
`release/operations-parent-student-action-registry-2026-06-11` was deployed
from `C:\Users\User\bna-release-clean`, and the production app smoke passed.
The remaining release-verification gap is the OpenAI sidekick smoke.

Do not use any OpenAI key pasted in chat. Treat pasted keys as exposed and
rotate them before use.

## Current State

- Release branch: `release/operations-parent-student-action-registry-2026-06-11`
- Latest pushed release verification commit: `5894c79`
- Production deployment: `5a01eea4-345a-428e-a2f2-01e00b208cd5`
- Railway status after deploy: `SUCCESS`
- Production app smoke: PASS
- Live smoke report:
  `ops/live-smokes/2026-06-11T16-28-00-888Z-live-app-smoke.md`
- OpenAI smoke report:
  `ops/openai-smokes/2026-06-11T16-28-52-075Z-openai-sidekick-smoke.md`
- Follow-up smoke after copying Drive secrets:
  `ops/openai-smokes/2026-06-11T17-01-15-783Z-openai-sidekick-smoke.md`
- The follow-up smoke confirms repo files, transcript exports, protected app
  APIs, Operations system endpoints, and Drive folders all read successfully.
  It read 7 Drive folders as `office@bneineviimacademy.org` and found
  `00 Upload Here - Raw Media Intake`.
- Final OpenAI smoke after fresh local key was stored outside chat:
  `ops/openai-smokes/2026-06-12T06-22-48-616Z-openai-sidekick-smoke.md`
- Final OpenAI smoke status: PASS.
- PR QA report updated and pushed in commit `5894c79`.

## Remaining Blocker

None for this release verification.

## Required Next Steps

No release-verification work remains in this brief.

## Watchouts

- Do not deploy from `C:\Users\User\BNA v2.0`; that workspace is dirty.
- Continue using `C:\Users\User\bna-release-clean` for this release branch.
- A late local dirty change appeared in
  `src/lib/actions/actions/operations.js` after the deployment; production did
  not include it. Do not stage it unless it is deliberately reviewed and needed.
