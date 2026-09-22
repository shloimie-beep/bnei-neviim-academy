# One Time Studio AI Video Worker Handoff Live Smoke

Generated: 2026-07-06T16:02:19+03:00

Scope:

- `RAW-20260702-010`
- `TASK-20260702-010`
- `REQ-20260706-907`
- `REQ-20260706-930`
- PR #112: https://github.com/shloimie-beep/bnei-neviim-academy/pull/112
- Merged master commit: `925c54fde1fd98cd662e4bd8aa222a0997e08fb5`
- Railway deployment: `dfb8487b-7c27-483b-95f5-afffc4a4d26e`, status `SUCCESS`

## Result

PASS. The live One Time Studio path can create or reuse a clearly marked TEST
Studio project, save source text, generate storyboard scenes, compile a prompt
pack, and create an AI video worker handoff export without calling OpenArt,
uploading references, publishing, sending, or spending credits.

## Live Workflow Proof

- PASS live source saved: `source_id=1`
- PASS live storyboard generated: `scenes=2`
- PASS live prompt compiled: `layers=9`
- PASS live AI video worker prompt pack: `scene_prompts=2`
- PASS live AI video worker handoff export: `export_id=1`, `studio_project_id=3`
- PASS response guardrails: `no_external_writes=true`,
  `external_write_performed=false`, `handoff.no_live_call=true`,
  `handoff.no_publish=true`
- PASS authenticated readback used Operations auth from Railway; live role:
  `super_admin`

Smoke project:

- Title: `TEST One Time Studio AI Worker Handoff Smoke 2026-07-06`
- Smoke ID: `LIVE-STUDIO-WORKER-HANDOFF-20260706`
- Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Deployment And Route Proof

- PASS `npm run railway:doctor` after PR #112 merge:
  deployment `dfb8487b-7c27-483b-95f5-afffc4a4d26e` reached `SUCCESS`.
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-07-06T12-55-52-681Z-live-app-smoke.md`.
- PASS `npm run app:smoke:rabbi-onetime-landing`:
  `ops/live-smokes/2026-07-06T12-55-19-048Z-rabbi-onetime-landing-smoke.md`.
- PASS authenticated live Studio dashboard readback.
- PASS authenticated live OpenArt no-live status readback.
- PASS authenticated live AI video worker handoff route/auth readback returned
  expected JSON for a nonexistent project before the full smoke project run.

## Schema Repair Applied

The first live prompt-compile attempt found a stale production constraint:
`bna_studio_prompt_layers_type_check` did not allow `jewish_guardrails`.

Applied the narrow first-party schema repair already present in the repo
migration allowlist:

- Dropped and recreated `bna_studio_prompt_layers_type_check`.
- New allowed layer types:
  `system_policy`, `workspace_defaults`, `project_brief`,
  `character_bible`, `jewish_guardrails`, `source_context`,
  `scene_instruction`, `correction_patch`, `renderer_contract`,
  `output_contract`.
- Readback confirmed the repaired constraint before rerunning the live workflow.

No secret values were printed or changed.

## Remaining Exact Blockers

- Live AI video worker login needs production values for
  `ONE_TIME_AI_VIDEO_WORKER_USERNAME` and
  `ONE_TIME_AI_VIDEO_WORKER_PASSWORD`.
- Live One Time AI Studio operator login also needs production values for
  `ONE_TIME_AI_STUDIO_OPERATOR_USERNAME` and
  `ONE_TIME_AI_STUDIO_OPERATOR_PASSWORD` if that separate operator login is
  intended for use.
- Live OpenArt generation/upload/credit spend remains blocked until OpenArt
  account/OAuth/API credentials and the approved model/cost/privacy policy are
  configured. Production currently has no `OPENART_MCP_ACCESS_TOKEN` or
  `OPENART_API_KEY`.
- True uploaded-image pixel analysis remains blocked until a hosted multimodal
  provider/model, budget, retention/privacy policy, and image-upload policy are
  approved.

## Guardrails

- No OpenArt call.
- No reference upload.
- No generation or credit spend.
- No external send.
- No payment/access/DNS/provider-account mutation.
- No credential value printed or changed.
- No Drive write or external CRM write.
- Only first-party production DB writes were the TEST Studio smoke project
  workflow and the narrow Studio prompt-layer constraint repair.
