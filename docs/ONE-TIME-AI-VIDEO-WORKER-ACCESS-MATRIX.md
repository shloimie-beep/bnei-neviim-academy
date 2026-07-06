# One Time AI Video Worker Access Matrix

Source: `RAW-20260706-908`

Role key: `one_time_ai_video_worker`

Workspace/project scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Allowed

- Operations views: `studio`, `tasks`
- Studio workflow: source intake, storyboard, prompt compile, no-live OpenArt prompt export, mock render, AI video worker handoff, Studio repair-plan request
- Task manager workflow: list/create/update scoped One Time tasks and comments
- Data boundary: One Time Studio records and One Time task records only

## Denied

- Broader Rabbi/provider admin data
- BNA Academy or cross-workspace data
- Contacts/CRM, payments, settings, integrations, member access grants
- Agent fleet, queue health, task-artifact internals
- Content handoff
- Raw shell, Codex CLI routing, deploy, secrets
- External sends, publishes, uploads, OpenArt live calls, generation, or credit spend

## Live Blockers

- Target environment must configure `ONE_TIME_AI_VIDEO_WORKER_USERNAME` and `ONE_TIME_AI_VIDEO_WORKER_PASSWORD`.
- App-visible proof still needs deploy and authenticated live smoke after release.
