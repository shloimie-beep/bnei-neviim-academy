# RAW-20260708-014 - OneTime Rabbi public assistant isolation

Source channel: codex_chat
Captured at: 2026-07-08T18:35:00+03:00
Parse status: registered

## Raw operator wording

I don't remember what you're working on but I might as well just tell you that right now in the main landing page it's BNA right we can't have any BNA anywhere on the rabbi sheller thing the bar is still programmed to BNA make sure when you're done the bot is being scoped accordingly there's another agent that's working on configuring the bot so the knowledge base is based on the transcript of the video that I'm going to put in the drive which is going to go into Vimeo there's another bot that's doing that but I need you when you're done with this to just double check the box that scope of the accordingly for the rabbi sheller and that's the rabbi sheller digital assistant and on the landing page it's going to be a little WhatsApp bubble that pops upAnd and captures the leads and that WhatsApp bubble is going to be connected to Happy right connected to that WhatsApp number and he'll introduce himself outside this is Rabbi sellers digital assistant you want to know about the schedule hear about the program or speak to the rabbi or something like that how can we help you and that part is supposed to be scoped to every single person's portal and the knowledge base is supposed to be updated based on the transcribed classes so I need you to check that out and make sure it's not BNA

## Parsed items

- `REQ-20260708-070`: Rabbi / OneTime public routes must not show BNA branding or old BNA provider-preview chrome.
- `REQ-20260708-070`: OneTime public helper must present as Rabbi Scheller's digital assistant, capture public leads safely, and keep all answers/actions scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`.
- External send note: the WhatsApp/WAPI connection remains blocked by existing `DEC-20260708-010` and `DEC-20260708-011`; this raw input does not approve a real WhatsApp send.
- Bot knowledge note: transcript/Vimeo knowledge promotion remains blocked by existing transcript policy decisions in the Vimeo workflow register; this raw input confirms the intended scope is OneTime/Rabbi only, not BNA.
