# RAW-20260630-002 - Deploy, Grade, And Telegram Follow-Up

Source: codex_chat
Captured: 2026-06-30
Privacy: private student/accountability details redacted in repo copy

## Redacted Raw Summary

The operator instructed Codex to:

- run the deployment/verification commands after the Issue #41 closeout;
- remember as a durable operating rule that app/server-visible work must run
  the deploy closeout commands and record exact blockers if deployment cannot
  complete;
- calculate Torah participation/attendance grades from operator statements;
- use a default of present plus 100% credit when no override is provided;
- inspect Telegram because attendance/learning notes are sometimes sent there;
- apply the 2026-06-29 participation update for the active BNA student roster,
  with exact private student-row details kept out of tracked GitHub evidence.

## Repo-Safe Parse

- `MEM-20260630-002`: App/server-visible closeouts require Railway deploy plus
  doctor/live-smoke proof, or a concrete deployment blocker.
- `MEM-20260630-003`: Daily Torah participation defaults to present/100% when
  no explicit operator/recording/Telegram override exists; explicit latest
  correction wins.
- `TASK-20260630-002`: Verify and repair the hosted Telegram bot so
  attendance/learning notes persist into first-party Torah/accountability rows.

## Guardrails

- Do not commit raw private student grade details to GitHub.
- Do not update duplicate/external student rows.
- Do not infer attendance for a non-BNA/external accountability person.
- Do not send Telegram/email/WhatsApp messages from this closeout.
- Do not change credentials, DNS, access grants, billing, or external accounts.

## Closeout Evidence

- Railway deploy rerun with explicit `skillful-motivation` production service:
  passed.
- Railway doctor after deploy: deployment `26f6b426-f1dd-4498-8835-99c8f22e6df2`
  reached `SUCCESS`.
- Live app smoke after deploy and after grade write: passed.
- Execution run status for Issue #41: `47 done`, work remains `no`.
- Private raw intake: `RAW-20260630-002` inserted in live DB with repo raw
  redacted.
- Private 2026-06-29 participation write: 5 active BNA student rows applied.
- Duplicate/external rows excluded.
- Readback: 5 Torah learning entries and 5 matching accountability events,
  with no duplicate accountability rows for the correction marker.
- Telegram status: hosted academy bot is healthy/running, but recent DB
  readback showed no June 29 Telegram raw intake rows; one June 28 Telegram
  learning note existed but did not expand into row-level progress. Parser
  repair was implemented in this follow-up batch.
- Telegram parser repair deploy: deployment
  `9f6987ac-44ae-4bb9-b308-849d552f8c2a` reached `SUCCESS`; live smoke report
  `ops/live-smokes/2026-06-30T06-22-23-969Z-live-app-smoke.md` passed.
- Post-deploy Telegram status readback: configured hosted polling worker,
  bridge runtime healthy/running, bot username `bneineviimacademy_bot`, Codex
  enabled.
