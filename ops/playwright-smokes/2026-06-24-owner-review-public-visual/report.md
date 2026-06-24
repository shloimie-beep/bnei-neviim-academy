# Public Visual Audit

Generated: 2026-06-24T05:42:29.390Z
Release candidate SHA: 7da18227804498d8868201f8f94a266da048ba50
Production URL: https://bneineviimacademy.org/
Result: PASS

Guardrail: production checks are anonymous public GET/browser reads only. No external credentials, production database reads, writes, deploys, sends, uploads, charges, DNS changes, or secret reads were performed.

| Target | Viewport | Header/hero gap px | Gap <= 1px | Hero margin-top | Active contrast | Active semantics | Overflow px | Placeholder hits | Console errors | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| pr14-local | mobile-390 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/pr14-local-mobile-390.png |
| production-public | mobile-390 | 58 | no | 58px | yes | no | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/production-public-mobile-390.png |
| pr14-local | tablet-768 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/pr14-local-tablet-768.png |
| production-public | tablet-768 | 70 | no | 70px | yes | no | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/production-public-tablet-768.png |
| pr14-local | desktop-1440 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/pr14-local-desktop-1440.png |
| production-public | desktop-1440 | 70 | no | 70px | yes | no | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/production-public-desktop-1440.png |

## Active Tab Contrast Details

| Target | Viewport | Selector | Text | Color | Background | Contrast | Contrast OK | Semantics OK |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| pr14-local | mobile-390 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| pr14-local | mobile-390 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | mobile-390 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | no |
| production-public | mobile-390 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | no |
| pr14-local | tablet-768 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| pr14-local | tablet-768 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | tablet-768 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | no |
| production-public | tablet-768 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | no |
| pr14-local | desktop-1440 | .bna-site-nav-link.is-active | Home | rgb(26, 32, 44) | rgb(232, 240, 248) | 14.18 | yes | yes |
| pr14-local | desktop-1440 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| pr14-local | desktop-1440 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | desktop-1440 | .bna-site-nav-link.is-active | Home | rgb(26, 32, 44) | rgb(232, 240, 248) | 14.18 | yes | yes |
| production-public | desktop-1440 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | no |
| production-public | desktop-1440 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | no |

## Defects

No PR #14 local blocking visual defects detected by computed assertions.

## Production Public Delta

[
  {
    "target": "production-public",
    "viewport": "mobile-390",
    "check": "header_hero_gap",
    "value": 58
  },
  {
    "target": "production-public",
    "viewport": "mobile-390",
    "check": "active_tab_semantics",
    "tabs": [
      {
        "selector": ".home-filter-chip.is-active",
        "text": "All topics",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(30, 58, 95)",
        "ariaCurrent": "",
        "ariaSelected": "",
        "ariaPressed": "",
        "role": "",
        "width": 92.625,
        "height": 37.5,
        "contrastRatio": 11.5,
        "contrastOk": true,
        "semanticOk": false
      },
      {
        "selector": ".home-filter-chip.is-active",
        "text": "All questions",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(30, 58, 95)",
        "ariaCurrent": "",
        "ariaSelected": "",
        "ariaPressed": "",
        "role": "",
        "width": 118.4375,
        "height": 37.5,
        "contrastRatio": 11.5,
        "contrastOk": true,
        "semanticOk": false
      }
    ]
  },
  {
    "target": "production-public",
    "viewport": "tablet-768",
    "check": "header_hero_gap",
    "value": 70
  },
  {
    "target": "production-public",
    "viewport": "tablet-768",
    "check": "active_tab_semantics",
    "tabs": [
      {
        "selector": ".home-filter-chip.is-active",
        "text": "All topics",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(30, 58, 95)",
        "ariaCurrent": "",
        "ariaSelected": "",
        "ariaPressed": "",
        "role": "",
        "width": 98.40625,
        "height": 40.40625,
        "contrastRatio": 11.5,
        "contrastOk": true,
        "semanticOk": false
      },
      {
        "selector": ".home-filter-chip.is-active",
        "text": "All questions",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(30, 58, 95)",
        "ariaCurrent": "",
        "ariaSelected": "",
        "ariaPressed": "",
        "role": "",
        "width": 124.21875,
        "height": 40.40625,
        "contrastRatio": 11.5,
        "contrastOk": true,
        "semanticOk": false
      }
    ]
  },
  {
    "target": "production-public",
    "viewport": "desktop-1440",
    "check": "header_hero_gap",
    "value": 70
  },
  {
    "target": "production-public",
    "viewport": "desktop-1440",
    "check": "active_tab_semantics",
    "tabs": [
      {
        "selector": ".home-filter-chip.is-active",
        "text": "All topics",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(30, 58, 95)",
        "ariaCurrent": "",
        "ariaSelected": "",
        "ariaPressed": "",
        "role": "",
        "width": 98.40625,
        "height": 40.40625,
        "contrastRatio": 11.5,
        "contrastOk": true,
        "semanticOk": false
      },
      {
        "selector": ".home-filter-chip.is-active",
        "text": "All questions",
        "color": "rgb(255, 255, 255)",
        "backgroundColor": "rgb(30, 58, 95)",
        "ariaCurrent": "",
        "ariaSelected": "",
        "ariaPressed": "",
        "role": "",
        "width": 124.21875,
        "height": 40.40625,
        "contrastRatio": 11.5,
        "contrastOk": true,
        "semanticOk": false
      }
    ]
  }
]
