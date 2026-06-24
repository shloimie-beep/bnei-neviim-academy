# Public UI Visual Delta

Generated: 2026-06-24T13:17:53.934Z

| Route | Viewport | Selector | Integration-base behavior | Production behavior | Expected behavior | Severity | Fix | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 390x844 | .hero | header/hero gap 0px | header/hero gap 58px | gap <= 1px | high | branch already fixes local layout; production needs deployment after release approval | computed bounding rect assertion |
| /blog | 390x844 | .home-filter-chip.is-active, .filter-btn.is-active | active semantics pass | active semantics fail | selected controls expose aria-pressed/current/selected | medium | branch has aria state; production needs deployment after release approval | computed active-state semantics assertion |
| / | 768x1024 | .hero | header/hero gap 0px | header/hero gap 70px | gap <= 1px | high | branch already fixes local layout; production needs deployment after release approval | computed bounding rect assertion |
| / | 768x1024 | .home-filter-chip.is-active, .filter-btn.is-active | active semantics pass | active semantics fail | selected controls expose aria-pressed/current/selected | medium | branch has aria state; production needs deployment after release approval | computed active-state semantics assertion |
| /blog | 768x1024 | .home-filter-chip.is-active, .filter-btn.is-active | active semantics pass | active semantics fail | selected controls expose aria-pressed/current/selected | medium | branch has aria state; production needs deployment after release approval | computed active-state semantics assertion |
| / | 1440x900 | .hero | header/hero gap 0px | header/hero gap 70px | gap <= 1px | high | branch already fixes local layout; production needs deployment after release approval | computed bounding rect assertion |
| / | 1440x900 | .home-filter-chip.is-active, .filter-btn.is-active | active semantics pass | active semantics fail | selected controls expose aria-pressed/current/selected | medium | branch has aria state; production needs deployment after release approval | computed active-state semantics assertion |
| /blog | 1440x900 | .home-filter-chip.is-active, .filter-btn.is-active | active semantics pass | active semantics fail | selected controls expose aria-pressed/current/selected | medium | branch has aria state; production needs deployment after release approval | computed active-state semantics assertion |

