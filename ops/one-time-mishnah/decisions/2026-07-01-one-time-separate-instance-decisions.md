# One Time Separate Instance Decisions - 2026-07-01

Source: `RAW-20260701-007`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## DEC-20260701-ONETIME-SEPARATE-RAILWAY-DB

Use the same GitHub repo, but provision One Time as a separate Railway
project/service with a separate One Time database and separate provider
secrets. Shloimie logs directly into the One Time admin workspace. BNA
super-admin cross-instance summary/federation is deferred.

## DEC-20260701-ONETIME-JOIN-SUBDOMAIN-FIRST

Use `join.onetimeonetime.com` as the temporary launch/campaign domain. Do not
touch `onetimeonetime.com` apex/root. Apex cutover is deferred until legacy
site/users/payments are audited and migration is approved.

## DEC-20260701-ONETIME-30-DAY-LAUNCH-OFFER

Offer: sign up during the launch window and get 30 days free from signup.
Access includes live class, video library/replays, private questions to Rabbi,
basic parent/student/member view, and attendance/progress basics. After the
free period the product is `$67/month`.

## DEC-20260701-ONETIME-ZOOM-SECURITY-V1

No raw Zoom link appears on the public landing page. The member/class page
gates the Zoom link behind active access. Attendance v1 is class-link click.
Rotating links/passcodes and Zoom attendance import are later enhancements.

## DEC-20260701-ONETIME-WHATSAPP-PROVIDER

Use the existing repo connector direction: Whapi/WAPI. If Shloimie says
`Wappy`, map that to Whapi/WAPI unless repo evidence proves a different
provider. Rabbi needs his own provider account/number/API key; UI and reports
show status/fingerprint only, not raw secrets.
