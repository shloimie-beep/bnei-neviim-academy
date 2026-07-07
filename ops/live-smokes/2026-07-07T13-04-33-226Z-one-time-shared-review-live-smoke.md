# One Time Shared Review Live Smoke - 2026-07-07T13:04:33.226Z

App: https://bneineviimacademy.org
Result: failed

## Checks
- PASS public health endpoint (548ms)
- PASS landing mobile390 (2323ms)
- PASS provider mobile390 (1928ms)
- PASS parent mobile390 (2458ms)
- PASS student mobile390 (1816ms)
- PASS classroom mobile390 (1481ms)
- PASS email mobile390 (1329ms)
- FAIL operations mobile390 (5616ms) - operations missing text: Program Overview

## Routes
- landing: /one-time/
- provider: /provider.html?review=one-time
- parent: /parent.html?review=one-time
- student: /student.html?review=one-time
- classroom: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- email: /one-time-email-review.html
- operations: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview

No payment, checkout, access grant, external send, Zoom meeting creation, Vimeo upload, DNS write, Railway topology change, or external CRM write was performed.
