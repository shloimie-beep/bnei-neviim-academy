# Next Session

Next unblocked batch: `1-identity-isolation`
Open requirement: `REQ-20260712-305`

Latest deployed SHA: `966ded41b517433533f24370949426cfd1200213`

Current proof:

- `966ded41b517433533f24370949426cfd1200213` is pushed to `origin/master`.
- BNA production `https://bneineviimacademy.org/api/deploy-info` returns that SHA.
- One Time production `https://join.onetimeonetime.com/api/deploy-info` returns that SHA.
- One Time signup Family/School behavior has live no-write browser proof and API dry-run proof.

Continue by inspecting and repairing:

- `bna_contact_identities` schema/migrations/constraints;
- all email/phone/WhatsApp identity upserts;
- WAPI/Resend contact lookup paths;
- contact/timeline/thread APIs for workspace-first resolution;
- tests proving the same normalized email/phone can exist separately in BNA and One Time and cannot leak through altered contact/thread/workspace/project parameters.

Do not start broad CRM UI edits until the current-state/PQC requirements for UI surfaces are recorded and validated.

Full production readiness remains blocked only by external Stripe/campaign setup fields listed in `ops/production-readiness/latest-production-unblocker.md`.
