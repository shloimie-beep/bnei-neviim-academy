# stripe-sandbox Blockers

Known external/policy blockers before live billing:

- Canonical price, currency, trial length, renewal, cancellation effective date,
  refund policy, tax handling, grace period, receipt/invoice language, and
  provider revenue split are not approved for live use.
- Live mode requires explicit owner approval and must remain disabled even if a
  live key is present.
- Real customer data, real payment methods, live charges, live refunds, and live
  subscription mutations are not approved in this lane.
- Production route/UI wiring is intentionally deferred to the final integrator
  via `SHARED-PATCH.diff`.
