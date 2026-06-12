# Visual Design Tokens

These tokens define BNA's public UI/control palette. They do not replace the
locked illustration direction: hand-drawn pencil sketches, graphite/sepia,
parchment and Torah-scroll warmth, and no generic stock/corporate visuals.

## Core Colors

- Primary blue: `#1e3a5f`
- Secondary blue: `#2c5282`
- Light blue: `#e8f0f8`
- Accent gold: `#c9a227`
- Dark text: `#1a202c`
- White: `#ffffff`

## Controls

- Primary actions may use primary blue with white text.
- Signature, payment, and positive submit actions may use accent gold with dark
  text.
- Buttons and cards should use rectangular corners, usually `8px`.
- Normal hover treatment: lift by `translateY(-2px)` with a soft shadow such as
  `0 14px 28px rgba(30, 58, 95, 0.18)`.
- Disabled controls should keep their shape, lower opacity, remove hover lift,
  and use `cursor: not-allowed`.
- Focus states should be visible and use a blue outline or shadow, not a browser
  default that disappears into the page.

## Public Pages

- Public pages, registration forms, document-signing flows, and provider intake
  pages should feel like one BNA system: blue/gold controls, a shared footer or
  equivalent, Hebrew/English paths where relevant, and polished empty or
  unavailable states.
- Use "Coming soon" or the Hebrew equivalent for user-facing unavailable
  features. Avoid exposing setup/internal status phrasing on public surfaces.
