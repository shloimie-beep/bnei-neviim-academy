# RAW-20260703-008 - ChatGPT Dropoff Canonical Agent MD

Source: codex_chat
Date: 2026-07-03
Parse status: registered

## Raw operator wording

Okay, so what's the next step? Do we change this so then GPT's always gonna be
able to see, like, this is in the agent's MD, that this is the workflow? I just
want this to be very, very clear. And regarding the agent's MD, I also wanna
make sure there's no contradictions and everything is being read in the same
order, but this would be the most ideal workflow, that I just ramble and he
drops it there, you know, whatever you set up, and then you just do it by
yourself, automatically. So, what's the next step?

## Parsed intent

- Make the ChatGPT-to-Codex dropoff workflow canonical in the agent operating
  docs, not only in a one-off prompt packet.
- Clarify the read order so GitHub-connected ChatGPT/Codex sessions do not get
  contradictory workflow instructions.
- Preserve the preferred workflow: Shloimie rambles to ChatGPT, ChatGPT creates
  a repo-visible packet, and Codex/agent fleet picks it up automatically.

## Guardrails

- Do not claim ordinary ChatGPT can see local repo files unless it is running in
  a GitHub/repo-connected context or the directive is pasted/provided.
- Do not make free-form comments or untrusted generated code auto-apply.
- Keep Codex audit, verification, ledger, and changelog as the done gate.
