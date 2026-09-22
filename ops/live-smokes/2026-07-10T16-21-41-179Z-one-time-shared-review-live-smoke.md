# One Time Shared Review Live Smoke - 2026-07-10T16:21:41.179Z

App: https://join.onetimeonetime.com
Result: passed

## Checks
- PASS public health endpoint (441ms)
- PASS landing mobile390 (1866ms)
- PASS provider mobile390 (1718ms)
- PASS parent mobile390 (1117ms)
- PASS student mobile390 (1410ms)
- PASS classroom mobile390 (1131ms)
- PASS email mobile390 (1103ms)
- SKIP operations mobile390 (0ms) - Operations authentication setup failed; authenticated Operations route not checked. Operations login did not succeed
- PASS landing tablet768 (1853ms)
- PASS provider tablet768 (1449ms)
- PASS parent tablet768 (1125ms)
- PASS student tablet768 (1425ms)
- PASS classroom tablet768 (1130ms)
- PASS email tablet768 (1250ms)
- SKIP operations tablet768 (0ms) - Operations authentication setup failed; authenticated Operations route not checked. Operations login did not succeed
- PASS landing desktop1440 (2173ms)
- PASS provider desktop1440 (1801ms)
- PASS parent desktop1440 (1261ms)
- PASS student desktop1440 (1386ms)
- PASS classroom desktop1440 (1134ms)
- PASS email desktop1440 (1127ms)
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
