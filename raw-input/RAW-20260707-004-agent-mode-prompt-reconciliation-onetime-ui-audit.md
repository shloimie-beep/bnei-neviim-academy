# RAW-20260707-004 - Agent Mode Prompt Reconciliation And One Time UI Audit Prompts

Source: `codex_chat`

Captured: 2026-07-07T09:08:55+03:00

Parse status: `registered`

Related raw IDs: `RAW-20260707-003`

## Raw operator wording

> Another thing is that, um, yesterday I dropped in a bunch of, I mean, I didn't really drop them in. We did the agent mode prompts, and he went and like reported about the UI changes. So can you just figure out if those actually were implemented, like the agent fleet? Um, and in terms of starting the agent fleet, you know, the agent fleet should be reading stuff that I drop in through the Telegram bot or the things that get dropped in automatically, like from the agent mode from ChatGPT. What I really want is to have some sort of channel or way that I can log in through, you know, with my login, and that from my login, I can navigate to view the entire one-time app as Rabbi Scheller, or I could view from the student's perspective. I can view everything from that perspective of the person that's going in also. Like, I should also be able to log in and see their view, so that way I can, you know, actually see what they're looking at and then fix it up or give a prompt to agent mode to do that. So can you check which prompts were dropped accordingly? Like, yesterday I reported on it. And I loaded up a bunch of prompts that worked and some of them didn't work. And the ones that didn't work, I think it just had to do with the credentials. I'm not sure why they didn't work. But we did audit some of the stuff of the UI and some of the stuff we didn't audit. But I want to make new agent mode prompts to audit, you know, the other stuff. The most important thing when I say a million-dollar app is that it should be consistent. Like, the filters and the buttons, everything should just be consistent across everything. You know, obviously there's two different things. There's the one-time one-time, and the font is a little bit different, the colors are a little bit different. That's different than BNA and the Academy. But across the whole one-time app, the toolbar should be consistent, the font should be consistent, you know, really across the Academy and the one-time backend also. You know, the colors could be different and everything, and slightly different scopes in terms of like the super admin and what the rabbi is doing. But in terms of the subcategories and the filters displaying at the top of the screen, it has to be consistent across, you know, every single category. And every single menu has to have consistently placed, you know, subcategories at the top that are not redundant, and logically are the next, you know, subcategory from the side panel. And the filters also, like, they just have to, it has to be logical, right? Like, one thing is like, it has to be logical, it has to be very logical, the subcategories and the main categories. So let's do the, I mean, I know you have as part of what you're doing, the audit, but I feel like agent mode can audit it even better. So check out which agent mode prompts, you know, worked, which ones didn't work. And let's make also some agent mode prompts to audit the UI, but to make them in a way where I can log in once and it's very clear how to navigate to view everything the way it's supposed to be, you know, the way it's viewed by the student or by the rabbi or by the actual person using it.

## Initial routing

- `SUPER_RAMBLE`
- `PRODUCT_QUALITY`
- `UI_VISUAL_AUDIT`
- `CHATGPT_DROPOFF_RECONCILIATION`
- `AGENT_FLEET_STATUS`
- `VIEW_AS_ACCESS`
- `SECURITY_PRIVACY`
- `SOURCE_OF_TRUTH_UPDATE`

## Guardrails

- Do not start the full agent fleet until stale-job replay policy and active Telegram poller ownership are clear.
- Do not implement broad UI polish from the phrase "million-dollar app" alone.
- Do not commit tokens, cookies, raw private email bodies, student-sensitive records, or credential values.
- Any view-as implementation must use audited scoped sessions or previews, not shared passwords.
