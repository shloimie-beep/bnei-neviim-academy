# One Time CRM Contacts UX Live Smoke - 2026-06-21T17:32:13.303Z

App: https://bneineviimacademy.org
Result: passed

## Checks
- PASS Operations login: cookie bna_ops_session
- PASS Scoped One Time parent leads API responds: 88 scoped leads
- PASS Scoped One Time contact communications API responds: 100 scoped communications
- PASS Operations ships CRM Contacts UX markers: CRM Contacts panel and scope markers shipped

## Scoped Counts
- Parent leads returned: 88
- Leads with returned project_key: 88
- Contact communications returned: 100

## Guardrails
- Smoke records scoped counts and UI markers only; it does not write contacts, send email, send WhatsApp, trigger payment, or call an external CRM.
- Parent lead rows are requested with project_key=one_time_mishnah_class and workspace=rabbi_sheller_provider.
- The report intentionally avoids raw contact bodies and raw private notes.
