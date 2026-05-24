# Design Direction — Family Accountability App

This is not a corporate dashboard. It is a warm family object that lives on two kids' tablets and in two parents' pockets. Treat the visual design as you would the design of a beautiful Shabbos zemiros book or a Moleskine planner — earnest, calm, made to be loved.

## Aesthetic intent

**"Warm minimal."** Generous whitespace, one strong serif, one quiet sans, a parchment-and-ink palette with gold for celebration moments. No drop shadows. No purple gradients. No Inter. No glass morphism. No emoji decoration in the chrome — emoji can appear in user content (kid wrote a note, parent sent a Telegram message) but not in headers, buttons, or labels.

## Type system

- **Display / Hebrew:** [Frank Ruhl Libre](https://fonts.google.com/specimen/Frank+Ruhl+Libre) — a Hebrew serif with real character; pairs beautifully with Hebrew text and has Latin glyphs that look intentional, not borrowed.
- **Display fallback / English:** Frank Ruhl Libre also handles English well. If a more distinct English display is wanted for the English locale, use [Fraunces](https://fonts.google.com/specimen/Fraunces) at 600 weight.
- **Body:** [Assistant](https://fonts.google.com/specimen/Assistant) — clean Hebrew sans, supports Latin, very readable on tablets.

Load via `next/font/google` with `display: 'swap'`.

Sizes (mobile-first, kids on tablets, so go large):
- Hero (kid's name on dashboard): 48px / 3rem
- Section heading: 28px / 1.75rem
- Goal card title: 22px / 1.375rem
- Body: 18px / 1.125rem (yes, 18 — these are kids on tablets, not engineers on 4K monitors)

## Color palette

```css
:root {
  --bg:          #FAF6EE;  /* parchment */
  --surface:     #FFFFFF;  /* card surface */
  --ink:         #1A1A1A;  /* primary text — true black is too harsh */
  --ink-soft:    #5B5B5B;  /* secondary text */
  --line:        #E8E1D1;  /* dividers, card borders */
  --accent:      #6B2D2D;  /* burgundy — primary action */
  --accent-soft: #A65454;  /* hover / muted accent */
  --gold:        #C8A052;  /* completed state, streak, celebration */
  --gold-soft:   #F4ECD8;  /* gold backgrounds */
  --rose:        #B45B5B;  /* rejection state, gentle */
}
```

Dark mode is **not** in scope for V1. Skip it.

## Goal card states

- **Pending (default):** white surface, thin `--line` border, ink text.
- **Checked:** `--gold-soft` background, `--gold` left bar (4px), ink text, small checkmark glyph (not emoji — use a Lucide `Check` icon at gold color).
- **Rejected:** white surface, `--rose` left bar (4px), small italic note from parent in `--ink-soft`.
- **Frozen (parent paused):** desaturated, locked icon overlay, no tap interaction.

## Layout principles

- Kid dashboard: single column, max-width 640px even on a wide tablet. Centered. Reads like a journal page.
- Parent dashboard: two-column on desktop, stacked on mobile. Each kid in their own card.
- Hebrew is RTL — use `dir="rtl"` on the locale root; Tailwind's logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`) for spacing so it flips correctly.

## Micro-interactions

- **Check-off animation:** the card subtly lifts (translateY -2px) and the background fills from left to right with `--gold-soft` over 280ms.
- **All-goals-done:** one-time confetti burst from the bottom center. Use gold + burgundy + ink confetti, NOT default rainbow. Cap at 60 particles. Plays once per day, never repeats.
- **Streak increment:** the streak number scales 1.0 → 1.15 → 1.0 over 400ms with a tiny gold glow.
- **Page transitions:** none. Don't animate page changes — it just makes the app feel slow.

Use [Motion (formerly Framer Motion)](https://motion.dev) for the JS-driven animations. CSS for everything else.

## Iconography

[Lucide](https://lucide.dev) icons only. Stroke width 1.75. Color matches surrounding text.

## Copy tone

- Warm, plain, not infantilizing. The kids are old enough to read; don't write to them like babies.
- Hebrew copy should sound like a parent talking, not like Google Translate. If the dev isn't fluent, leave Hebrew strings as `__HE_TODO__` placeholders so Shloimie can fill them in.
- No motivational platitudes. "You can do this!" "Believe in yourself!" — none of that. Empty states should be calm and informative.

Example empty states:

| State | English | Hebrew (TODO if unsure) |
|---|---|---|
| No meeting set | "No goals yet. Tatty will set them at the next meeting." | __HE_TODO__ |
| All done today | "All done." | __HE_TODO__ |
| Frozen | "Paused. Talk to Tatty." | __HE_TODO__ |

## Don'ts

- No purple. No teal. No "AI lavender."
- No glassmorphism, no neumorphism, no skeuomorphic checkboxes.
- No splash screens with company logos.
- No fake "loading…" delays for vibe; loading states only appear when actually waiting on the network.
- No achievement badges beyond the streak counter (V1).
- No leaderboards comparing the two kids. Not now. Not ever.
