# Task UI Cleanup And Facebook Smoke - 2026-06-01

## Completed

- Tasks UI:
  - cards open details when clicked
  - removed visible `Open details`, `Details`, `Done, needs test`, `Needs test`, and `Mark tested` buttons
  - done tasks no longer show a separate testing workflow badge
- Task extraction:
  - future Telegram/web rambles are saved as polished task titles
  - dashboard notes explain the extracted task instead of showing raw ramble text
- Student cleanup:
  - bad `Fh` student was set inactive
  - linked signup #5 was archived
  - Students API no longer returns `Fh`
- Content voice:
  - WhatsApp, Facebook, and weekly report prompts now prefer English
  - prompts explicitly avoid corny phrasing like `Today at Bnei Neviim Academy` and `our learners explored`
- Facebook/GHL:
  - diagnostics pass for the connected `Bnei Neviim Academy` Facebook page
  - Content job #7 successfully created a text Facebook draft in GHL
  - Content job #6 successfully uploaded media and created a Facebook draft in GHL

## Verification

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- Local task extraction smoke created a polished task and deleted it
- Local mobile Tasks smoke passed
- Local mobile Content smoke passed
- Live deploy `75d78726-dc90-40ed-b27b-ae649fa956f6` succeeded
- Live health, Students, GHL diagnostics, mobile Tasks, and mobile Content smoke passed

## Important Note

The Facebook action currently creates a GHL draft. It does not publish live to Facebook automatically. That is intentional until Shloimie explicitly approves a final publish workflow for the exact content.
