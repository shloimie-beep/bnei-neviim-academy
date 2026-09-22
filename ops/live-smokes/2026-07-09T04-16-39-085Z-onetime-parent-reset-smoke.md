# OneTime Parent Reset Smoke - 2026-07-09T04:16:39.085Z

App: https://join.onetimeonetime.com
Result: passed

## Checks

- PASS `/one-time-parent` contains `OneTimeOneTime Parent Setup`.
- PASS `/one-time-parent` points forgot-password requests to `/api/one-time/parent-password/request`.
- PASS `/one-time-parent` offers fresh OneTime password-link copy.
- PASS `/one-time-parent` contains no `Bnei Neviim`, `BNA Academy`, or Academy parent portal copy.
- PASS `/one-time-parent` contains no `recovery code` or `classroom password` fallback wording.

No email, WhatsApp, payment, access grant, account mutation, DNS write, upload,
or external connector write was performed during this smoke.
