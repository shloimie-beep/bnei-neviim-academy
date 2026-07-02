# Next Session

Continue `RAW-20260701-006` One Time launch funnel setup only after one of the
remaining external blockers changes.

Current executable batch:

- None. `npm run bna:run:next` reports no unblocked executable batch.

Completed local/deployed work:

- `REQ-20260701-616`: Product Quality drift and trace validation repaired;
  `npm run pqc:all` passes.
- `REQ-20260701-601`: route code deployed and BNA-root smoke passes, but the
  real One Time campaign domain is not routed to Railway.
- `REQ-20260701-602`: `/one-time` landing/signup update implemented,
  deployed, and live-smoked.
- `REQ-20260701-603`: scoped lead/contact tracking implemented, deployed, and
  live-smoked with synthetic duplicate signup proof.
- `REQ-20260701-604`: 30-day free local trial access implemented, deployed,
  and live-smoked.
- `REQ-20260701-605`: member login/member API/classroom entry path verified
  with dry-run member login and Playwright screenshots; no email was sent.
- `REQ-20260701-606`: current-signup transactional confirmation email
  implemented, deployed, and live-smoked with a safe Resend test address.
- `REQ-20260701-607`: dry-run reminder metadata packet prepared; activation
  remains decision-gated.
- `REQ-20260701-608`: WAPI/Whapi readiness blocker packet prepared; setup
  remains credential/number-gated.
- `REQ-20260701-609`: WhatsApp/contact scope hardening already satisfied and
  verified with redacted no-send readback.
- `REQ-20260701-610`: Buffer/social setup guard implemented, deployed, and
  live-smoked.
- `REQ-20260701-613`: read-only paying-users/access audit completed with no
  billing mutation.
- `REQ-20260701-612`: Zoom/class-link security model documented; final session
  configuration remains decision-gated.
- `REQ-20260701-614`: first campaign and seed-send packets prepared; real send
  remains copy/list/link/approval-gated. A consolidated real-send operator
  decision handoff is available at
  `ops/one-time-mishnah/funnel/2026-07-01-real-send-operator-decision-handoff.md`.

Remaining blockers/decisions:

- `REQ-20260701-601`: domain owner must route `onetimeonetime.com` and
  `www.onetimeonetime.com` to the Railway app, then rerun the campaign-domain
  live smoke. Latest read-only resmoke:
  `ops/live-smokes/2026-07-01T16-26-00Z-one-time-domain-route-resmoke.md`.
- `REQ-20260701-607`: need final class date/time, reminder cadence, approved
  copy, eligible recipient source, suppression policy, seed/test member, and
  explicit activation approval.
- `REQ-20260701-608`: need exact Whapi/WAPI credential alias/path and approved
  sending number before setup verification. Do not paste credential values.
- `REQ-20260701-611`: need exact `VIMEO_ACCESS_TOKEN` keyholder alias/path and
  Vimeo owner/plan/scope/private-test-folder decisions.
- `REQ-20260701-612`: need approved Zoom/session details before configuring
  live gated session records. Do not paste private links into tracked files.
- `REQ-20260701-614`: need final subject/body, exact recipient segment/list,
  suppression proof, final links/domain state, seed proof, and explicit real
  campaign send command.
- `REQ-20260701-615`: final campaign-domain proof and campaign send readiness
  remain blocked by `REQ-20260701-601` and `REQ-20260701-614`.

Campaign state:

- Transactional signup confirmation is live/send-ready for the current signup
  recipient only.
- Real campaign sending is not authorized and not send-ready until final copy,
  exact final recipient list/segment, final links/domain state, and explicit
  campaign send approval are supplied.

Do not perform:

- bulk campaign send;
- imported lead/contact send;
- WhatsApp send;
- live Stripe/Green Invoice payment;
- checkout/payment-link creation;
- subscription cancellation/refund/change;
- DNS mutation;
- GHL/LeadConnector runtime write;
- Vimeo production upload or publish;
- BNA/One Time data mixing.
