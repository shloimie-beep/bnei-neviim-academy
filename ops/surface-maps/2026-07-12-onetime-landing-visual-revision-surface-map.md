# Surface Map - One Time landing visual revision

Parent raw ID: `RAW-20260712-004`

## Product Surface

One major surface: One Time public acquisition flow.

## Routes

| Route | Access | Scope | Expected behavior |
|---|---|---|---|
| `/one-time` | public | landing | Exact revised hero/sections/ticker/footer, all signup CTAs route to `/one-time/signup`. |
| `/one-time/signup` | public | direct signup | Required free-text city, detected/fallback IANA timezone, email/reminder consent, phone required only for WhatsApp/both. |
| public assistant widget on `/one-time` | public | Robot Scheller helper | Full uncropped robot image and existing current-class answer behavior. |

## Primary Files

- `public/one-time/index.html`
- `public/one-time/signup.html`
- `public/js/bna-bot-widget.js`
- `src/lib/bna/one-time-signup-workflow.js`
- `ops/action-registry.json`
- `config/service-provider-sites/one-time.json`
- focused tests and smoke scripts that assert this behavior

## Out Of Scope

- CRM/outbox runtime changes beyond the free-text city/timezone normalization.
- Reminder dispatch changes.
- Telegram/WAPI external sends.
- Authentication, portal access, checkout, payment, DNS, production data, or deploy.

