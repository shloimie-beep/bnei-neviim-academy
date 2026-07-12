# Raw Source

## Operator Source

The operator asked for a complete, Codex-ready package for a natural-language Telegram “super sidekick.” It should reach essentially every legitimate in-app capability, support safe external tools such as web search, preserve durable memories and preferences, work for both the operator and Rabbi Elie Scheller, and share the capability/memory framework across approved agents. The operator's Telegram bot is the super-admin sidekick. Rabbi's Telegram bot should have comparable usefulness but remain inside Rabbi's provider workspace. Both must remain categorically different from anonymous landing-page lead-capture agents.

This follows a full read-only audit prompted by the failed request: “Give me the questions from the last two weeks.” The audit reproduced the failure: Telegram treated it as ordinary chat, attached no question data, had no canonical question-read tool, and could allow an imperative read to enter the intake/write path.

## Grounded Facts

- Target repository: `shloimie-beep/bnei-neviim-academy`.
- Audited master commit: `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`.
- Telegram runtime: `scripts/telegram-kimi-bridge.mjs`, approximately 11,753 lines.
- Canonical contract: `docs/architecture/telegram-control-plane.md` and `src/platform/assistant/control-plane.js` require Telegram to be an adapter over one shared control plane.
- Typed registry: `src/lib/actions/registry.js` currently exposes 80 actions.
- UI registry: `ops/action-registry.json` currently contains 127 interface-action records.
- Telegram's hand-built router covers only a subset and has no canonical `list_questions` read.
- Existing durable assistant/control-plane tables are present but Telegram bypasses them.
- Existing helper profiles/memory summaries are not sufficient for durable, identity-scoped, cross-surface preferences.
- Question data is fragmented across accountability events, class-session JSON, One Time moderation records, course questions, and parser candidates.
- Existing safety policy removes raw Codex CLI, shell, deploy, migrations, secrets, and unapproved external sends from user-facing assistants; preserve that boundary.

## Fixed Product Decisions

- Shloimie is a platform `super_admin`, not a BNA tenant role.
- Super-admin all-workspace reads must label scope. Writes into another workspace must be explicit “acting on” operations with audit evidence.
- Rabbi Elie Scheller is a provider administrator fixed to workspace `rabbi_sheller_provider` and project `one_time_mishnah_class`.
- Public BNA and Robot Scheller landing agents are anonymous/capture-only surfaces. They must never inherit private Telegram identity, memory, tools, links, or data.
- Hebrew and English are first-class. Hebrew text must remain natural and correctly encoded; Telegram must not force ASCII-only replies.
- Natural language uses typed tools. Model prose never executes by itself.
- A read request performs zero writes unless the user separately asks to save/create something.
- Every successful action requires a handler result plus durable audit/result record.
- External or consequential actions require a bound preview and explicit approval.
- Do not introduce another database, action registry, task manager, memory system, or assistant brain.

## Out Of Scope

- Live sends, deploys, production database mutations, DNS, charges, access grants, connector mutations, secret handling, or real Telegram smoke messages without separate approval.
- Raw shell or Codex CLI access from Telegram/portal assistants.
- Unrelated visual redesign.
- Treating generated code or passing unit tests as production proof.
