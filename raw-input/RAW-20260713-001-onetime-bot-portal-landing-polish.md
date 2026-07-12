# RAW-20260713-001 - One Time bot portal knowledge and landing polish

- Source channel: `codex_chat`
- Captured at: `2026-07-13T01:02:00+03:00`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Parse status: `registered`

## Raw source

> Just at the knowledge base of the WhatsApp bot that we're not giving access yet to the portal and also as a separate task I need you to make the joint that one time one timeThe I need you to make the top header the same as when you click on the member section and also on the website the yellow buttons are like this black ugly Shadow underneath and slightly get rid of some of the spacing in between the the you know the pages like a little bit and also just move up the yellow button to call to action under the hero move it up just a little bit because the bottom of the phone is like blocking it off like just a drop

## Parsed requirements

- `REQ-20260713-001`: Update the One Time WhatsApp bot knowledge/runtime so it does not claim portal, member, library, parent-login, or student-login access is being granted yet.
- `REQ-20260713-002`: Polish the One Time public landing header and CTA styling so the header matches the member-section family, yellow buttons lose the harsh black slab shadow, section spacing is slightly tighter, and the hero CTA clears mobile bottom chrome/launcher overlap.

## Evidence

- Local verification: `node --test tests\service-provider-lead-bot.test.js tests\one-time-focused-landing.test.js tests\one-time-canonical-journey.test.js tests\one-time-brand-helper-isolation.test.js tests\one-time-shared-review-branding.test.js`
- Local browser proof: `ops/ui-audits/2026-07-12-onetime-landing-whatsapp-local/report.md`
- Action registry proof: `npm run watchdog:actions`

## Guardrails

- No email send.
- No WhatsApp/WAPI send.
- No Telegram send.
- No payment, checkout, portal grant, member grant, library grant, class-link release, DNS/account, credential, or production CRM mutation.
