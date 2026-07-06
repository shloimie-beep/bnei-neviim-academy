# RAW-20260706-911 - One Time Full UI Agent Audit Prompt Series

## Metadata

- Source channel: codex_chat
- Created at: 2026-07-06T15:45:00+03:00
- Parse status: registered
- Workspace/project: rabbi_sheller_provider / one_time_mishnah_class

## Raw operator request

> Can you just make me those prompts now? Let's make those prompts for Agent mode to do like a full audit. Really, I want you to make the prompts for ChatGPT to make the prompts for Agent mode. But we need a couple prompts for Agent mode. You know, I want to audit, like the whole thing. Like the one-time, one-time should, like a front-end UI designer. I know there's just a lot of basic mistakes. I had a whole ramble from before. I hope you remember my whole ramble about a lot of the stuff that was problematic. So, let's make those prompts right now. And just make sure that ChatGPT is able to write them in the right place. So let's give ChatGPT a couple prompts, and I want you to audit the whole thing. Like, I want those toolbars to be consistent across the whole app. The whole one-time, one-time app has to have the same type of toolbar. And it should be the same font as the website, and the same size, and everything should just be consistent and professional. And every single page should open into something. There shouldn't be irrelevant information. And all the categories and subcategories should make sense. And yeah, go do this full front-end audit of the entire app. Click on the buttons, test everything, as if it's like ready for production. That's what I want to do. So make those prompts. I think you could just make the prompts for Agent mode, but make really good prompts and tell them what to do with it, you know? It could be a couple prompts, right? That's the idea. And tell them exactly what links to go to, what pages to set up, so I could run all of them together, and they're gonna go report in the right place.

## Parsed requirements

| ID | Type | Item | Status |
|---|---|---|---|
| REQ-20260706-911 | requirement | Create a ChatGPT meta-prompt that can write the One Time Agent Mode prompt series into the repo-visible dropoff workflow. | Done |
| REQ-20260706-912 | requirement | Create multiple Agent Mode audit prompts for a full One Time front-end/product-readiness audit. | Done |
| REQ-20260706-913 | requirement | Include exact live links, routes, scopes, login handling, safety boundaries, and report dropoff instructions. | Done |
| REQ-20260706-914 | requirement | Cover toolbar/font/filter/nav/category/subcategory consistency, dead-end links, irrelevant information, cross-scope leaks, bot testing, and production-readiness click testing. | Done |

## Guardrails

- This packet creates prompts only; it does not start the agent fleet.
- Agent prompts must not include passwords, cookies, API keys, private contact
  exports, raw WhatsApp bodies, raw transcript bodies, payment data, or private
  screenshots.
- Agent prompts may ask the operator to use browser takeover for login, but
  must never ask for credentials to be pasted into chat.
- Audit agents must not send WhatsApps, emails, Telegram messages, payments,
  access grants, DNS changes, provider mutations, Drive writes, production data
  changes, deploys, or source-code edits.
- The canonical One Time public target is `https://join.onetimeonetime.com/`;
  `https://bneineviimacademy.org/one-time/` is preview/fallback evidence only.

## Closeout evidence

- Prompt packet:
  `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/`.
- The packet includes one ChatGPT meta-prompt and five runnable Agent Mode
  audit prompts.
- Every prompt requires repo-file dropoff under
  `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/` or the marked
  `BNA_CHATGPT_DROPOFF_PACKET` GitHub comment fallback.
