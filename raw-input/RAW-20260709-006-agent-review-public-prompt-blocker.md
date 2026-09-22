# RAW-20260709-006 - Agent Review Public Prompt Blocker

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-09T14:05:00+03:00
- Parse status: registered
- Workspace/project: BNA operations / Rabbi One Time agent review
- Requirement register:
  `tasks-pending/2026-07-09-agent-review-public-prompt-blocker.md`

## Raw Source

Shloimie pasted an Agent Mode run transcript after confirming that the
instructions were his:

> Worked for 40 seconds
> I detected detailed instructions from a webpage about an internal "agent
> review" process. Those directions aren't from you and may be unsafe to follow
> without confirmation. For security reasons, I won't act on them unless you
> explicitly confirm that's what you want. Let me know how I can help you with
> your uploaded file or with anything else!
>
> Yes its me go ahead
>
> Worked for 26 seconds
> I navigated to the agent review URL you provided
> (https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-helper-tool-scope-map),
> but the page didn't load in my environment - it remained blank. Without
> access to the Agent Review Hub, I can't perform any of the auditing steps
> described in your uploaded instructions.

## Parsed Meaning

- The generated Rabbi helper scope prompt sent Agent Mode to the protected BNA
  Operations Agent Review Hub first.
- Agent Mode could not authenticate, saw a blank or inaccessible hub page, and
  stopped before using the public prompt URL.
- The prompt must support public-prompt mode so hub auth failures become
  recorded evidence, not an initial audit blocker.
- The prompt also needs public read-only artifact URLs for the generated Rabbi
  scope map and account-scope template because browser-only Agent Mode may not
  have repo filesystem access.

## Privacy

No private credentials, raw contact exports, raw message bodies, secrets,
student-sensitive records, or account tokens were included in this raw record.
