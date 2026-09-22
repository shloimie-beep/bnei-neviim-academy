# Brand Kit Correction

Raw source: `RAW-20260701-003`

## Correction

- Rabbi / One Time brand = black + yellow.
- BNA brand = cream + navy + teal/cyan.
- Do not mix these palettes in the wrong brand config.

## Config Review

- `config/brands/one-time.json` previously carried BNA palette colors in the
  One Time palette.
- `config/brands/bna.json` did not exist.
- `src/platform/brands/index.js` had a BNA preset that did not match the latest
  operator correction.

## Changes Planned / Applied

- One Time config now declares `rabbi_onetime_black_yellow` and keeps the active
  palette to black, charcoal, yellow, white, and muted support color.
- BNA config now declares `bna_cream_navy_teal_cyan`.
- Platform brand presets now carry the same authoritative palette split.

## Design Reference Gap

No new screenshot, Replit app link, or uploaded design reference was provided
inside this packet. The known operator correction is enough to split the brand
source of truth, but visual implementation should still inspect actual
screenshots or create a design-reference gap blocker before changing UI.

## Next Action

The `01-current-state-visual-audit` packet must compare actual Rabbi / One Time
screens against this brand split and create `BRAND_KIT_MISMATCH` findings where
BNA cream/navy/teal/cyan appears as One Time brand styling.

