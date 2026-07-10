# One Time Shared Review Live Smoke - 2026-07-10T11:26:58.773Z

App: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public health endpoint (809ms)
- PASS landing mobile390 (4620ms)
- PASS provider mobile390 (1391ms)
- PASS parent mobile390 (1134ms)
- PASS student mobile390 (1358ms)
- PASS classroom mobile390 (1200ms)
- PASS email mobile390 (1135ms)
- SKIP operations mobile390 (0ms) - Operations authentication setup failed; authenticated Operations route not checked. Operations login did not succeed
- PASS landing tablet768 (1863ms)
- PASS provider tablet768 (1398ms)
- PASS parent tablet768 (1129ms)
- PASS student tablet768 (1393ms)
- PASS classroom tablet768 (1110ms)
- PASS email tablet768 (1117ms)
- SKIP operations tablet768 (0ms) - Operations authentication setup failed; authenticated Operations route not checked. Operations login did not succeed
- PASS landing desktop1440 (1858ms)
- PASS provider desktop1440 (1387ms)
- PASS parent desktop1440 (1123ms)
- PASS student desktop1440 (1391ms)
- PASS classroom desktop1440 (1128ms)
- PASS email desktop1440 (1133ms)
- SKIP operations desktop1440 (0ms) - Operations authentication setup failed; authenticated Operations route not checked. Operations login did not succeed

## Routes
- landing: /one-time/
- provider: /provider.html?review=one-time
- parent: /parent.html?review=one-time
- student: /student.html?review=one-time
- classroom: /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- email: /one-time-email-review.html
- operations: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview

No payment, checkout, access grant, external send, Zoom meeting creation, Vimeo upload, DNS write, Railway topology change, or external CRM write was performed.
