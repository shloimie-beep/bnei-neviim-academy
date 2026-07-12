# RAW-20260712-009 - One Time Mobile CTA And WhatsApp Icon Lead Capture

Date: 2026-07-12
Source channel: codex_chat
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Status: captured

## Raw Source

On the mobile display of the landing page the sign up button is a little bit cut off so it has to be lifted up a little bit so you can see it from a mobile like right when you get to that front page you should be able to see it on a mobile the image of the rabbi the robot is not working the whole robot thing isn't really working right now to just be a basic lead capture and the circle around him is just not working it's like loading up as a square sometimes so you got to fix that little image of him but let's let's just get rid of the image just use a WhatsApp icon that's the best thing just a plain WhatsApp icon and that hooks up right to our WhatsApp bot and it's just like a basic lead capture you know hey it has the basic information and whatever it doesn't have it doesn't make up it's just to get their information like what's your name where you located make sure it's not corrupted with any BNA stuff

## Compiled Requirements

- REQ-20260712-009A: Lift/tighten the mobile One Time landing hero so the main `Sign Up Now` CTA is visible immediately on first load at phone widths.
- REQ-20260712-009B: Remove the public landing dependency on the broken Robot/Rabbi image launcher; use a plain WhatsApp icon instead.
- REQ-20260712-009C: Connect the plain WhatsApp icon to the One Time public WhatsApp lead-capture route.
- REQ-20260712-009D: The WhatsApp lead capture must ask for basic provided information, including name and location, and must not invent missing details.
- REQ-20260712-009E: Keep One Time public-facing assistant/lead-capture copy free of BNA Academy language or generic BNA helper contamination.

## Implementation Notes

- No external WhatsApp message should be sent by this UI action. The public launcher should open the configured WhatsApp chat/compose route only.
- Do not commit secrets, raw private contact values, or runtime WhatsApp credentials.
