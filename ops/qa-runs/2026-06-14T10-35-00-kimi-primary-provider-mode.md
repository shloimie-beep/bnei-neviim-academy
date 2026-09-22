# Kimi-Primary Provider Mode QA

Date: 2026-06-14T10:35:00+03:00

## Scope

Operator approved temporary Kimi-primary hosted AI mode while OpenAI key storage
or account access remains unresolved. This QA covers the local wiring only; it
does not deploy the app.

## Changes Verified

- `BNA_AI_PRIMARY_PROVIDER=kimi` is set locally in `.env.local`.
- `BNA_AI_PRIMARY_PROVIDER=kimi` is set in Railway production variables for
  service `skillful-motivation` with `--skip-deploys`.
- `server.js` can select Kimi before OpenAI for content AI when the override is
  present.
- `scripts/telegram-kimi-bridge.mjs` orders Kimi before OpenAI for hosted API
  chat when the override is present.
- `scripts/smoke-openai-sidekick.mjs` smokes the selected hosted AI provider and
  uses Kimi-compatible temperature when Kimi is selected.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS `node --test tests/ai-provider-selection.test.js`
- PASS `npm test` 315/315
- PASS `git diff --check` for touched files
- PASS local `.env.local` non-secret override readback
- PASS Railway variable readback for `BNA_AI_PRIMARY_PROVIDER=kimi`

## Hosted AI Smoke

Command:

```powershell
$env:BNA_AI_PRIMARY_PROVIDER='kimi'; npm run openai:smoke
```

Result:

- Kimi was selected as the hosted AI provider.
- Kimi returned the expected JSON answer.
- All AI-return assertions passed.
- Overall smoke still failed because the live production app returned existing
  500s for `/api/bna/tasks` and `/api/bna/support-tickets`:
  `new row for relation "bna_tasks" violates check constraint "bna_tasks_category_check"`.

Report:

- `ops/openai-smokes/2026-06-14T07-31-27-913Z-openai-sidekick-smoke.md`

## Remaining Blocker

The Kimi provider path is working. The selected-provider smoke is blocked by a
separate live app task-category constraint issue, not by OpenAI or Kimi.
