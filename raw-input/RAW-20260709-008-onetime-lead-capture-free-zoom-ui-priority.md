# RAW-20260709-008 - OneTime lead capture, free Zoom, Railway context, Agent Mode, stale queue

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-008 |
| Source | codex_chat |
| Source timestamp | 2026-07-09T14:28:32+03:00 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md |

## Raw intake

Shloimie said:

> I need Kimmich to be a complete fullback. That's one thing, but that's not the most important thing right now. Oh, we really got to fix the railway target context. The full launch setup is not important right now. We want to finish the UI and the lead capture and the link to the free class. We need all the UI stuff to be done and everything to be mapped out. We just want to have people and capture their information and get them on the free Zoom. We're not even going to give them the portal yet. So the UI for the signup, the front end, the website, and the back end need to be completely configured to capture these leads, as well as a lead capturing bot on the landing page. So the UI for the website and the back end with the complete CRM and every single page like configured. That's the main thing that's important right now. And those agent mode things, the agent mode whole autonomous sequence. Yeah, and there's a lot of easy UI fixes that need to be done. I don't think you're doing playwright to all of these. I don't know if there's like basic, basic UI fixes in different pages in the dashboard. So I don't know if that's playwright, I don't know if that's agent mode. Just map it out, make sure I have that link to the actual agent mode section so I can let them free and, you know, do some agent modes and we can get that moving. So all those stale jobs, so he has to go through them. If it's do not redo, so get rid of it. If they're stale jobs, so we got to just make, look at them, see if anything has been implemented. And if it makes sense to implement it, it'll make our app better. I just don't want to go back, like some old prompt that we're not using anymore. I don't want to go backwards. So just make sure it's not going backwards. It's an obvious clear, clear improvement and getting us closer to our goal. Yeah, I need you to basically do all these things in the next step and finish everything up. And the next thing I do is to fix up the UI. I want to run a bunch of, fix up the back end UI, fix up the, I need to make a ramble about all the images. Basically a ton of UI differences and changes, to be honest. And you're just gonna do all of them, and I'm gonna drop in a bunch of screenshots. And you're just gonna have to fix the pages. That's really the next thing to do. And then after that, you're just gonna have to, you know, launch everything in the right order. So, you know, you start solving these problems. In another window, I'm gonna do the whole, you know, ramble about all the UI changes, and you start running this and deploying stuff. And that other agent will do that in a branch until at the end we'll merge everything together. So do your thing over here. I have it on double speed, so get to work. Make it like goal mode and like knock everything out. That's what I want to do.

## Initial parse

- Kimi/Kimmich fallback remains lower priority for this lane.
- Immediate target is OneTime public launch capture: website/signup/front-end/back-end/CRM should capture people and route them toward a free Zoom class.
- Portal/member access is explicitly out of scope for this immediate launch path.
- Full OneTime launch setup is explicitly lower priority than Railway target context and lead capture.
- Agent Mode audit link/control path should be clear so parallel UI audits can run without duplicating stale work.
- Stale jobs should be inspected against current state; do-not-redo or backwards old prompts should not be reprocessed.
- Screenshot/image/UI correction work will be supplied in another window/branch and should stay isolated until merge/release coordination.
