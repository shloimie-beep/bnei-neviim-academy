# Public Visual Audit

Generated: 2026-06-24T20:02:57.503Z
Release candidate SHA: 04587f19807d55d657eec6e12b78ff3110f76916
Production URL: https://bneineviimacademy.org/
Result: PASS

Guardrail: production checks are anonymous public GET/browser reads only. No external credentials, production database reads, writes, deploys, sends, uploads, charges, DNS changes, or secret reads were performed.

| Target | Viewport | Header/hero gap px | Gap <= 1px | Hero margin-top | Active contrast | Active semantics | Overflow px | Placeholder hits | Console errors | Screenshot |
| --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| release-local | mobile-390 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/release-local-mobile-390.png |
| production-public | mobile-390 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/production-public-mobile-390.png |
| release-local | tablet-768 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/release-local-tablet-768.png |
| production-public | tablet-768 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/production-public-tablet-768.png |
| release-local | desktop-1440 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/release-local-desktop-1440.png |
| production-public | desktop-1440 | 0 | yes | 0px | yes | yes | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-public-visual/production-public-desktop-1440.png |

## Active Tab Contrast Details

| Target | Viewport | Selector | Text | Color | Background | Contrast | Contrast OK | Semantics OK |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| release-local | mobile-390 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| release-local | mobile-390 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| release-local | mobile-390 | [aria-current="page"] | Home | rgb(26, 32, 44) | rgb(201, 162, 39) | 6.75 | yes | yes |
| production-public | mobile-390 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | mobile-390 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | mobile-390 | [aria-current="page"] | Home | rgb(26, 32, 44) | rgb(201, 162, 39) | 6.75 | yes | yes |
| release-local | tablet-768 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| release-local | tablet-768 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| release-local | tablet-768 | [aria-current="page"] | Home | rgb(26, 32, 44) | rgb(201, 162, 39) | 6.75 | yes | yes |
| production-public | tablet-768 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | tablet-768 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | tablet-768 | [aria-current="page"] | Home | rgb(26, 32, 44) | rgb(201, 162, 39) | 6.75 | yes | yes |
| release-local | desktop-1440 | .bna-site-nav-link.is-active | Home | rgb(26, 32, 44) | rgb(232, 240, 248) | 14.18 | yes | yes |
| release-local | desktop-1440 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| release-local | desktop-1440 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| release-local | desktop-1440 | [aria-current="page"] | Home | rgb(26, 32, 44) | rgb(201, 162, 39) | 6.75 | yes | yes |
| production-public | desktop-1440 | .bna-site-nav-link.is-active | Home | rgb(26, 32, 44) | rgb(232, 240, 248) | 14.18 | yes | yes |
| production-public | desktop-1440 | .home-filter-chip.is-active | All topics | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | desktop-1440 | .home-filter-chip.is-active | All questions | rgb(255, 255, 255) | rgb(30, 58, 95) | 11.5 | yes | yes |
| production-public | desktop-1440 | [aria-current="page"] | Home | rgb(26, 32, 44) | rgb(201, 162, 39) | 6.75 | yes | yes |

## Defects

No release-local blocking visual defects detected by computed assertions.

## Production Public Delta

No production-only visual defects detected by computed assertions.
