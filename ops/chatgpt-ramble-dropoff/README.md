# ChatGPT Ramble Dropoff

This is the repo-visible inbox for large ChatGPT outputs that are meant for
Codex pickup, including implementation bundles, audits, prompt packets, and
memory/preference sidekick updates.

The goal is to avoid pasting huge ChatGPT responses back into Codex chat.
ChatGPT can produce a structured packet here, or a marked GitHub comment that
contains the packet files. Codex then audits the packet against the actual
repo, adapts usable code, runs verification, and records proof.

## Canonical Read Order

For GitHub-connected ChatGPT/Codex sessions, the order is:

1. `BNA-START-HERE.md`
2. `AGENTS.md`
3. `docs/BNA-RAMBLE-TO-DONE.md`
4. This folder's `CHATGPT-DIRECTIVE.md`
5. `CHATGPT-START-HERE.md`
6. This README and the packet templates
7. `CONTROL-TOWER.md`, when present, before claiming a packet lane

Ordinary ChatGPT sessions cannot see local repo files unless the operator
pastes the directive, connects the repo, or gives ChatGPT a GitHub/PR/file
write surface.

GitHub-connected ChatGPT sees committed/pushed GitHub state, not Codex's local
dirty worktree. If this workflow changes locally but is not pushed, ChatGPT
will not automatically know about it.

## Recommended Workflow

1. Run or read the control tower first:

```bash
npm run chatgpt:dropoff:tower
```

This writes `CONTROL-TOWER.md` and `CONTROL-TOWER.json` with packet statuses,
dirty-file collision warnings, recent pickup reports, and agent-fleet state.

2. For a broad ramble that should become several ChatGPT windows, generate the
   child prompts:

```bash
npm run chatgpt:packet-prompts -- --raw-file raw-input/RAW-YYYYMMDD-###.md --title "short title" --parent-raw-id RAW-YYYYMMDD-###
```

This writes:

```text
ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/README.md
ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/manifest.json
ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/prompts/01-*.md
...
ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/prompts/05-*.md
```

Paste one generated prompt into one ChatGPT window. Each prompt has its own
packet ID, owner, lane key, scope, and out-of-scope rules.

3. Give ChatGPT one of the prompts in `ops/prompt-packets/` or
   `ops/chatgpt-ramble-dropoff/outgoing/<batch-id>/prompts/`, or tell it to
   create a `memory_candidate` / `preference_update` packet for sidekick memory
   work.
4. Give ChatGPT `CHATGPT-START-HERE.md` and `CHATGPT-DIRECTIVE.md`.
5. Tell ChatGPT to return exactly one packet using the files in `templates/`.
6. Put the packet under:

```text
ops/chatgpt-ramble-dropoff/incoming/<packet-id>/
```

7. The packet must include:

```text
packet.json
RAW.md
CODEX_PROMPT.md
MANIFEST.json
status.json
```

8. Optional packet files can include:

```text
PATCHES.md
attachments/
```

9. Codex pickup audits first, applies second, verifies third, then records
   evidence and publishes scoped repo changes when required by the Definition
   of Done.

If ChatGPT can create files or open a PR, repo-file mode is preferred. If
ChatGPT can only comment, or if GitHub returns `403 Resource not accessible by
integration`, use the GitHub comment option below.

## Automatic Pickup

The dropoff ingestor is wired into the existing agent-fleet watcher.

When `npm run agent:fleet` or `npm run agent:fleet:start` is running, every
fleet poll runs:

```bash
npm run chatgpt:dropoff:apply
```

Ready packets are validated, deduped by packet ID plus content fingerprint,
then queued as Codex-owned observable agent jobs through the app's existing
task/job APIs. The fleet then claims and runs those jobs through the normal
Codex verification lifecycle.

Manual commands:

```bash
npm run chatgpt:dropoff:tower
npm run chatgpt:packet-prompts -- --raw-file raw-input/RAW-YYYYMMDD-###.md --title "short title" --parent-raw-id RAW-YYYYMMDD-###
npm run chatgpt:dropoff:comments:scan
npm run chatgpt:dropoff:comments:apply
npm run chatgpt:dropoff:scan
npm run chatgpt:dropoff:apply
npm run chatgpt:dropoff:watch
```

Disable fleet auto-ingest with:

```text
AGENT_FLEET_CHATGPT_DROPOFF_INGEST=0
```

## GitHub Comment Option

GitHub comments are useful as a pointer and notification, especially if
ChatGPT can create or edit issue/PR comments.

Use `github-comment-template.md` for this. A comment should include the marker
`BNA_CHATGPT_DROPOFF_PACKET` and the complete file contents for:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `PATCHES.md`

The comment can be posted on any recent issue or PR in
`shloimie-beep/bnei-neviim-academy`; the collector scans marked comments and
materializes them into local packet folders under
`ops/chatgpt-ramble-dropoff/incoming/<packet-id>/`.

Do not use a local ChatGPT ZIP/download link or `/mnt/data` path as the only
handoff. Codex cannot collect those from GitHub. Paste the complete packet
files into the marked comment.

For memory/preference sidekick updates, use the same comment format and set
`packet_type` in `packet.json` to `memory_candidate` or `preference_update`.
Codex will decide whether to promote the item into `MEMORY.md`,
`memory-topics/*.md`, `AGENTS.md`, `TASKS.md`, or a requirement register.

Collector commands:

```bash
npm run chatgpt:dropoff:comments:scan
npm run chatgpt:dropoff:comments:apply
```

The existing GitHub intake command can also preview trusted issue/comment
input:

```bash
npm run intake:github -- --url <github-issue-or-comment-url> --dry-run
```

That command writes a redacted dry-run report under `ops/source-truth/`. It
does not persist to the database or apply code. GitHub status posting is
separately approval-gated and should not be used unless explicitly authorized.

## Safety Boundary

ChatGPT output is input, not proof.

Codex must not blindly apply generated code. Pickup requires:

- source is trusted or explicitly approved;
- no secrets, raw private data, passwords, API keys, or contact exports are
  committed;
- scope/workspace is clear;
- code matches the actual repo structure;
- tests or smokes run where relevant;
- ledger/changelog/register evidence is recorded before Done.

## Parallel Work Rule

Multiple ChatGPT and Codex windows are allowed only when each window owns a
clear lane:

- one packet ID;
- one owner;
- one branch/worktree or non-overlapping file set;
- one status in `status.json`;
- one next action or blocker.

If the control tower shows dirty files, an active job, or a blocked packet in
the same lane, do not start a duplicate packet. Update that packet or create a
small follow-up packet that explicitly depends on it.

## Packet Statuses

Use these values in `status.json`:

- `draft`
- `ready_for_codex_audit`
- `ready_for_codex_pickup`
- `codex_queued`
- `codex_auditing`
- `applied_with_changes`
- `partially_applied`
- `blocked_needs_operator_decision`
- `rejected`
- `done_verified`

## What This Is Not

This folder is not a second source of truth. After Codex pickup, work still
must be registered through raw intake, requirement registers, the task ledger,
and changelog where applicable.

This folder also does not grant ChatGPT permission to mutate GitHub, Drive,
the database, production, external providers, payments, access, DNS, email,
WhatsApp, or Telegram. Those require the normal explicit approval gates.
