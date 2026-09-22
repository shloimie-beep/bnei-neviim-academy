# PKT-20260712-109 - One Time Landing WhatsApp Launcher

Parent raw ID: `RAW-20260712-004`
Requirement: `REQ-20260712-109`
Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`

## Scope

Implement only the served public One Time landing launcher slice:

- Remove public landing loads of `/js/bna-helper-knowledge.js` and `/js/bna-bot-widget.js`.
- Add one fixed bottom-right WhatsApp launcher link on `/one-time`.
- Use `/api/one-time/public-whatsapp/redirect?intent=free_class`, not a hard-coded phone number.
- Keep the landing hero, sections, signup form, copy, and portal routes otherwise unchanged.
- Update the root action registry and public landing tests.
- Prove desktop/mobile screenshots, no helper script requests, no hard-coded number, and no POST/write requests.

## Out Of Scope

- No edits to CRM, inbox, portal, classroom, library, parent setup/reset, or student surfaces.
- No WAPI/Whapi send, WhatsApp broadcast, contact write, campaign send, payment/access change, deploy, DNS/provider-account mutation, GHL, LeadConnector, external CRM, or production-data mutation.
- Do not touch untracked `features/one-time-landing` React files in this packet unless a later owner explicitly claims that lane.
- Do not solve the whole parent ramble. Complete only this packet's scope and record the next packet or blocker.

## Acceptance

- `/one-time` no longer loads the public helper scripts.
- The launcher is WhatsApp-green, circular, target-sized, keyboard-focusable, and has an accessible name.
- The launcher points to the same-origin runtime redirect and never exposes the configured number in repo evidence.
- Local smoke captures desktop/mobile proof and asserts no external write occurred.
