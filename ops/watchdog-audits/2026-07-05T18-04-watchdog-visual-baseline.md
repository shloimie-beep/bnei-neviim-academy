# Watchdog Visual Baseline

Generated at 2026-07-05T18:04:27.661Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: high
- Findings: 5
- CSS files scanned: 5
- Browser routes checked: 9
- Browser viewports checked: 3

## Findings

- **MEDIUM** One Time home shows placeholder/dead-control copy at mobile-390: Naki logo placeholder
  Goals: GOAL-CORE-002
  Evidence: ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-mobile-390.png | https://bneineviimacademy.org/one-time/
  Fix: Replace placeholder text with supported content, or clearly register/disable the control with a reason.
- **HIGH** One Time home has tiny tap targets at tablet-768: [{"selector":"input","label":"yes","rect":{"width":28,"height":28,"top":5827.45,"left":37}}]
  Goals: GOAL-CORE-001, GOAL-CORE-004
  Evidence: ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-tablet-768.png | https://bneineviimacademy.org/one-time/
  Fix: Give visible controls stable dimensions of at least 32px by 32px, preferably 40px for primary app controls.
- **MEDIUM** One Time home shows placeholder/dead-control copy at tablet-768: Naki logo placeholder
  Goals: GOAL-CORE-002
  Evidence: ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-tablet-768.png | https://bneineviimacademy.org/one-time/
  Fix: Replace placeholder text with supported content, or clearly register/disable the control with a reason.
- **HIGH** One Time home has tiny tap targets at desktop-1440: [{"selector":"input","label":"yes","rect":{"width":28,"height":28,"top":4371.42,"left":697.39}}]
  Goals: GOAL-CORE-001, GOAL-CORE-004
  Evidence: ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-desktop-1440.png | https://bneineviimacademy.org/one-time/
  Fix: Give visible controls stable dimensions of at least 32px by 32px, preferably 40px for primary app controls.
- **MEDIUM** One Time home shows placeholder/dead-control copy at desktop-1440: Naki logo placeholder
  Goals: GOAL-CORE-002
  Evidence: ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-desktop-1440.png | https://bneineviimacademy.org/one-time/
  Fix: Replace placeholder text with supported content, or clearly register/disable the control with a reason.

## Browser Matrix

- Matrix: ops/playwright-smokes/task-1851-brand-shell-live-20260705/visual-baseline-browser-matrix.md
- JSON: ops/playwright-smokes/task-1851-brand-shell-live-20260705/visual-baseline-browser-matrix.json
- Screenshot directory: ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots

| Surface | Route | Viewport | Overflow px | Controls | Tiny | Unlabeled | Clipped | Contrast | Placeholder | Footer | Screenshot |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| public | / | mobile-390 | 0 | 38 | 0 | 0 | 0 | 0 | 0 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/public-home-mobile-390.png |
| public | /signup.html | mobile-390 | 0 | 31 | 0 | 0 | 0 | 0 | 0 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/public-signup-mobile-390.png |
| operations | /operations.html?view=tasks | mobile-390 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/operations-mobile-390.png |
| provider | /provider.html?review=one-time | mobile-390 | 0 | 20 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/provider-mobile-390.png |
| parent/support | /parent.html?review=one-time#help | mobile-390 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/parent-support-mobile-390.png |
| student/support | /student.html?review=one-time#help_account | mobile-390 | 0 | 13 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/student-support-mobile-390.png |
| one_time | /one-time | mobile-390 | 0 | 13 | 0 | 0 | 0 | 0 | 1 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-mobile-390.png |
| classroom | /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS | mobile-390 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-classroom-mobile-390.png |
| support | /one-time-email-review.html | mobile-390 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-email-review-mobile-390.png |
| public | / | tablet-768 | 0 | 38 | 0 | 0 | 0 | 0 | 0 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/public-home-tablet-768.png |
| public | /signup.html | tablet-768 | 0 | 31 | 0 | 0 | 0 | 0 | 0 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/public-signup-tablet-768.png |
| operations | /operations.html?view=tasks | tablet-768 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/operations-tablet-768.png |
| provider | /provider.html?review=one-time | tablet-768 | 0 | 20 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/provider-tablet-768.png |
| parent/support | /parent.html?review=one-time#help | tablet-768 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/parent-support-tablet-768.png |
| student/support | /student.html?review=one-time#help_account | tablet-768 | 0 | 13 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/student-support-tablet-768.png |
| one_time | /one-time | tablet-768 | 0 | 13 | 1 | 0 | 0 | 0 | 1 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-tablet-768.png |
| classroom | /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS | tablet-768 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-classroom-tablet-768.png |
| support | /one-time-email-review.html | tablet-768 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-email-review-tablet-768.png |
| public | / | desktop-1440 | 0 | 49 | 0 | 0 | 0 | 0 | 0 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/public-home-desktop-1440.png |
| public | /signup.html | desktop-1440 | 0 | 42 | 0 | 0 | 0 | 0 | 0 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/public-signup-desktop-1440.png |
| operations | /operations.html?view=tasks | desktop-1440 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/operations-desktop-1440.png |
| provider | /provider.html?review=one-time | desktop-1440 | 0 | 19 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/provider-desktop-1440.png |
| parent/support | /parent.html?review=one-time#help | desktop-1440 | 0 | 7 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/parent-support-desktop-1440.png |
| student/support | /student.html?review=one-time#help_account | desktop-1440 | 0 | 13 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/student-support-desktop-1440.png |
| one_time | /one-time | desktop-1440 | 0 | 13 | 1 | 0 | 0 | 0 | 1 | yes | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-home-desktop-1440.png |
| classroom | /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS | desktop-1440 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-classroom-desktop-1440.png |
| support | /one-time-email-review.html | desktop-1440 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no | ops/playwright-smokes/task-1851-brand-shell-live-20260705/screenshots/one-time-email-review-desktop-1440.png |
