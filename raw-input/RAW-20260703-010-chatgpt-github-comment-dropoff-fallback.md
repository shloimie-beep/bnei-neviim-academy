# RAW-20260703-010 - ChatGPT GitHub Comment Dropoff Fallback

Source: codex_chat
Date: 2026-07-03
Parse status: registered

## Raw operator wording

I could not complete the repo write: the GitHub connector has read-only access
and returned 403 Resource not accessible by integration when creating the
dropoff file.

What I did complete:

Read the available repo guidance.

Confirmed these requested paths were missing on master:

ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md

ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/01-current-state-audit-capability-map.md

Created the required dropoff packet folder locally with exactly:

packet.json

RAW.md

CODEX_PROMPT.md

MANIFEST.json

status.json

Set status.json to ready_for_codex_audit.

Did not edit app/source files.

Local packet zip: Download the prepared dropoff packet

Repo path inside the zip:

ops/chatgpt-ramble-dropoff/incoming/2026-07-03-helper-bot-workspace-agent-chatgpt-current-state-audit-capability-map/

Status: prepared, but not repo-visible because the integration cannot write to
the repo. None of them were able to can you just fix this just make sure you
check up what he's actually able to do cuz I know he's able to write some sort
of comment but he can't write to the repo but he can like comment on it so just
make sure it's clear where he's supposed to drop this off to you just make sure
it's very clear where he's dropping off these files for you to collect them

## Parsed intent

- ChatGPT cannot create repo files through its GitHub connector.
- ChatGPT may be able to write GitHub comments.
- The handoff must make GitHub comment mode explicit, self-contained, and
  collectable by Codex without a local ChatGPT ZIP or manual pasteback.
- Codex should understand that local unpushed docs may not be visible to
  ChatGPT on GitHub master.

## Guardrails

- Do not treat ChatGPT-local zip links or `/mnt/data` paths as collectable
  repo-visible packets.
- Do not auto-apply code from comments; comments become packet input only.
- Only collect trusted marked GitHub comments into local packet folders.
