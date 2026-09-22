# Deployment

- Railway project: `skillful-motivation`.
- Railway environment: `production`.
- Railway service: `skillful-motivation`.
- Deployment: `6257a4af-bb62-4fd4-b1b5-aff1ec057f40`.
- Deployment status: `SUCCESS`.
- Production app: https://bneineviimacademy.org.
- Release PR: #56, merged at `98cfc4649e4bc52009a1aac9ee4616c1f5eeb272`.

Post-deploy live smokes passed for app health, content research scope,
communications screening, operations helper, content topic filters, class
upload trace, Email/Resend no-send UX, and One Time CRM contacts.

Blocked deployment/live-send item:

- Resend live inbound/outbound completion requires external sender/webhook
  setup and approved signed replay/readback.
- A real email smoke requires an explicit safe recipient and send approval.
