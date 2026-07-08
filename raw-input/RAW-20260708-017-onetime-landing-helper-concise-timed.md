# RAW-20260708-017 - OneTime Landing Helper Concise Timed Nudges

Source: codex_chat
Captured at: 2026-07-08T20:00:00+03:00
Workspace/project: Rabbi Scheller / OneTimeOneTime Mishnah
Parse status: registered

## Raw Input

> Make the bot on the landing page more consice he doesn't have to say all the
> things he doest do. Hi ...do you want your son to love torah... up after 10
> seconds on the site. ...after 20 more he should say we are up to.....(mesechta)
> now is a great time to join

## Parsed Requirement

- `REQ-20260708-073`: Make the public OneTime landing helper concise and
  parent-facing. The first helper nudge should appear after 10 seconds and ask
  whether the visitor wants their son to love Torah. The follow-up should appear
  20 seconds later and say where the class is currently holding by masechta,
  with a prompt that now is a good time to join.

## Guardrails

- Scope only the public OneTime/Rabbi landing helper, not BNA Academy,
  Operations, provider workspace, parent portal, or student portal helpers.
- Keep internal privacy/security guardrails in backend and action handling.
- Avoid showing long public copy that lists everything the helper cannot do.
- Keep the popup concise on mobile and desktop.
