# Link Check

Scope: static link inventory for the owner setup packet.

| Area | Result | Evidence |
|---|---|---|
| Internal walkthrough links | Passed | `tests/operator-walkthrough-links.test.js` |
| Static setup page links | Passed | `tests/integration-setup-ui.test.js` |
| External dashboard links | Manually verified against official/current provider pages during setup | OpenAI, Kimi, Google, Railway, Stripe, Vimeo, Zoom, Resend, GitHub, Telegram, Buffer, Whapi |
| Secret exposure | Passed | `npm run secrets:audit` |

The automated link test checks local Markdown links and required setup files.
External links are kept as provider dashboards/docs and are not crawled by the
local test suite.
