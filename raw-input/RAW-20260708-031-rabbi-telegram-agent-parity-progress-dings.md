# RAW-20260708-031 - Rabbi Telegram agent parity and progress dings

## Metadata

- Source channel: `codex_chat`
- Captured at: 2026-07-08
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Parse status: `registered`
- Requirement register:
  `tasks-pending/2026-07-08-rabbi-telegram-ticket-agent-loop.md`
- Related requirements: `REQ-20260708-082`, `REQ-20260708-083`,
  `REQ-20260708-096`, `REQ-20260708-097`

## Raw operator wording

Yeah the other thing we need to do is make sure that the rabbi telegram bot is
completely scoped out to all of his contacts that he's able to communicate to
all of the incoming you know messages like all the student messages the tickets
that people open should should also you know I let's make the tickets go to me
the tickets should go to my super admin and I should get a ding on my telegram
I'll respond to all the tickets but for his telegram but all Communications
emails WhatsApp Rabbi Communications should go to his telegram but his telegram
bot should be like you know kind of like mine where it's like seriously like an
agent that could do web searches and has all the capabilities of manipulating
stuff and drive and that's true for his helper also meaning his helper that
lives you know on his admin platform so she kind of be scoped out to everything
so he can just communicate with that bod and it could do the content it could do
pretty much everything you know but that has to be also true with the telegram
but that he should get the internal reminders so we need to also test that we
also need to have the agent modes we need to make sure that we're making all
these agent modes to to run the actual smoke test and the back end of scoped out
for him to just drop in those files meaning we actually have to go in the
telegram and you know I'll log in what we need to do right nowAnd you know I'll
log in what we need to do right now is what we'll do is I'll make like that you
know the telegram token or something I have to give you the rabbi token I think
I actually gave you the token all we're missing is like to chat ID so what I'll
do is I'll set that up and we just have to have that telegram about really
official cuz the telegram but you know things when people speak so I won't mind
to think you just have to make sure it's dinging for all these tasks like all
the things that I tell you to do and you just keep doing them in the background
so I want to get you know ding update that this task is like this and this and
wacky is like this and this and this is pending so he should be like just you
know giving me very brief professional summaries of what's going on in the back
end what we're still waiting to do like he's still my handy sidekick and I want
the rabbit to have the same experience and I want to keep working on it till it
actually works like an agent mode those prompts should exist so I want youAnd
you just keep doing them in the background so I want to get you know ding update
that this task is like this and this and wacky is like this and this and this is
pending so he should be like just you know giving me very brief professional
summaries of what's going on in the back end what we're still waiting to do like
he's still my handy sidekick and I want the rabbit to have the same experience
and I want to keep working on it till it actually works like an agent mode those
prompts should exist so I want you to make so I want you to make sure I'm
making all these agent mode prompts to actually test the Bots and to get them to
drop off that research in that place and the Asian Fleet to do it autonomously
that's a really important part of what we're doing

## Parsed items

- Support tickets stay super-admin owned and should send Shloimie concise
  Telegram dings when configured.
- Rabbi communications, including email, WhatsApp/WAPI, provider messages, and
  student/parent class communications, should ding Rabbi Scheller's scoped
  Telegram bot when its chat ID is configured.
- Rabbi Telegram bot and in-portal helper should use the same scoped helper
  contract and expose safe agent-style read/preview/create-task capabilities for
  contacts, communications, content, Drive/search previews, and reminders.
- External writes and high-risk mutations remain approval-gated and scoped.
- Agent Mode prompts must smoke-test bot/helper flows and save PASS/FAIL/
  BLOCKED results to the Operations Agent Review drop-off path, even when a
  route, login, bot, or credential step fails.
- Codex/agent progress updates should be sent as very brief professional
  Telegram summaries: done, pending, blocker, and next step.

## Blockers

- Live Rabbi Telegram delivery remains blocked until
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured or safely inferred from
  the intended chat.
- Live Telegram sends require configured target, redacted copy, and the
  relevant no-secret readiness check.
